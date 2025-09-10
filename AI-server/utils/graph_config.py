# graph.py
import os, json
from typing import Dict, Any, TypedDict, Annotated, List, operator
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import create_react_agent
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain.prompts import PromptTemplate

from utils.tools import rag_tool, web_search, pgsql_query_structured


# ==========
# STATE TYPE
# ==========
class GraphState(TypedDict, total=False):
    messages: list
    query: str
    tool_input: Any
    tool_output: Any
    followups: Annotated[List[str], operator.add]


# ==========
# MODEL
# ==========
llm = ChatOpenAI(
    model="openai/gpt-oss-20b",
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)

followup_prompt = PromptTemplate(
    input_variables=["answer"],
    template="""
    Based on the assistant's last answer, suggest 3 short and helpful follow-up questions
    that the user might naturally ask next. Keep them concise.

    Answer:
    {answer}

    Format as a numbered list:
    1. ...
    2. ...
    3. ...
    """,
)


# ==========
# NODES
# ==========
def synthesize(state: GraphState) -> GraphState:
    messages = state.get("messages", [])
    print("======== messages from synthesize ===========", messages)
    user_query = next(
        (m.content for m in reversed(messages) if isinstance(m, HumanMessage)), None
    )
    if not user_query:
        raise ValueError("No HumanMessage found in state.")

    tool_output = state.get("tool_output", {}) or {}
    if "sql" in tool_output:
        tool_output = {k: v for k, v in tool_output.items() if k != "sql"}

    system_prompt = f"""
You are an assistant.

The user asked: {user_query}

Tool results:
{json.dumps(tool_output, indent=2)}

Return a clear, conversational natural language answer.
"""
    response = llm.invoke([SystemMessage(content=system_prompt)])

    ai_msg = AIMessage(content=response.content)
    ai_msg.additional_kwargs = ai_msg.additional_kwargs or {}

    return {**state, "messages": [*messages, ai_msg]}


async def _generate_followups(answer: str) -> list[str]:
    chain = followup_prompt | llm
    result = await chain.ainvoke({"answer": answer})
    raw_text = result.content.strip()
    return [
        line.strip(" -0123456789.").strip()
        for line in raw_text.splitlines()
        if line.strip()
    ]


# ========================
# GRAPH
# ========================
def build_graph():
    workflow = StateGraph(GraphState)

    # ReAct agent node
    agent = create_react_agent(
        llm,
        tools=[rag_tool, web_search, pgsql_query_structured],
    )

    workflow.add_node("agent", agent)
    workflow.add_node("synthesize", synthesize)

    workflow.set_entry_point("agent")
    workflow.add_edge("agent", "synthesize")
    workflow.add_edge("synthesize", END)

    return workflow.compile()


graph = build_graph()
