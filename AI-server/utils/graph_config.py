import os
from typing import Any, List, TypedDict, Annotated
from operator import add
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import create_react_agent
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain_core.messages import SystemMessage

from utils.tools import rag_tool, web_search, pgsql_query_structured, image_search

# ========== STATE TYPE ==========
class GraphState(TypedDict, total=False):
    messages: list
    tool_input: Any
    tool_output: Any
    followups: Annotated[List[str], add]

# ========== MODEL ==========
llm = ChatOpenAI(
    model="openai/gpt-oss-120b",
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)

# ========== FOLLOWUP PROMPT ==========
followup_prompt = PromptTemplate(
    input_variables=["answer"],
    template="""
    Based on the assistant's last answer, suggest 3 short follow-up questions
    the user might naturally ask next. Keep them concise.

    Answer:
    {answer}

    Format as a numbered list:
    1. ...
    2. ...
    3. ...
    """
)

STYLE_PROMPT = """""
        You are a professional analytical assistant.

        Rules:
        - Always structure answers using clear sections with headings
        - Start with a concise TL;DR if the answer is long
        - Use bullet points where helpful
        - Avoid generic filler phrases
        - Be explicit about assumptions and uncertainty
        - If tools were used, integrate results naturally (no tool mentions)
        - Prefer clarity over verbosity
"""

# ========== ASYNC HELPER ==========
async def _generate_followups(answer: str) -> list[str]:
    chain = followup_prompt | llm
    result = await chain.ainvoke({"answer": answer})
    raw_text = result.content.strip()
    return [
        line.strip(" -0123456789.").strip()
        for line in raw_text.splitlines()
        if line.strip()
    ]


style_message = SystemMessage(content=STYLE_PROMPT)
# ========== GRAPH ==========
def build_graph():
    workflow = StateGraph(GraphState)

    # Single ReAct agent handles reasoning, tool usage, and synthesis
    agent = create_react_agent(
        llm,
        tools=[rag_tool, web_search, pgsql_query_structured, image_search],
    )

    workflow.add_node("agent", agent)
    workflow.set_entry_point("agent")
    workflow.add_edge("agent", END)

    return workflow.compile()

graph = build_graph()
