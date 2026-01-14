from typing import Optional
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain.memory import ConversationBufferMemory
from dotenv import load_dotenv
from fastapi import FastAPI, Query, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from routes.chat_routes import router as chat_router
import json
from utils.memory_utils import summarize_messages, serialise_ai_message_chunk
from utils.graph_config import graph, llm, _generate_followups, style_message
import re
from helper.conversations import (pg_get_conversation, pg_append_messages, pg_upsert_greeting)
from helper.extractionHelpers import (_unwrap_tool_output, _safe)


import asyncio

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Type"]
)

REFINER_PROMPT = """
    You are an expert technical writer.

    Rewrite the answer below to be:
    - Well structured
    - Clear and concise
    - Complete and helpful
    - Aligned with the user's intent
    - Written for a knowledgeable user (not a beginner)

    Preserve all factual content.
    Do NOT add new facts.
    Improve clarity, structure, and flow only.

    Answer:
    {raw_answer}
"""

# ---------------------------------------------------------
# Main async generator: streams AI content + handles memory
# ---------------------------------------------------------
async def generate_chat_responses(user_id: str, message: str):
    # --- Load conversation history from Postgres
    pg_record = pg_get_conversation(user_id)
    existing_messages = pg_record["messages"] if pg_record else []

    # --- Keep only role & content from DB
    filtered_messages = [
        {"role": m["role"], "content": m["content"]}
        for m in existing_messages
        if m.get("content")
    ]

    print("================== Existing Messages ===============", filtered_messages)

    memory = ConversationBufferMemory(return_messages=True)

    # --- Summarize long conversations and keep last 10 messages
    if len(filtered_messages) > 12:
        summary_messages = filtered_messages[:-10]
        latest_messages = filtered_messages[-10:]
        summary_text = await summarize_messages(summary_messages)
        memory.chat_memory.add_message(
            SystemMessage(content=f"Conversation Summary: {summary_text}")
        )
        messages_to_load = latest_messages
    else:
        messages_to_load = filtered_messages[-10:]

    # --- Load messages into memory
    for msg in messages_to_load:
        role = msg["role"]
        if role in ("user", "human"):
            memory.chat_memory.add_message(HumanMessage(content=msg["content"]))
        elif role in ("ai", "assistant"):
            memory.chat_memory.add_message(AIMessage(content=msg["content"]))
        elif role == "system":
            memory.chat_memory.add_message(SystemMessage(content=msg["content"]))

    # --- Add new user message
    memory.chat_memory.add_message(HumanMessage(content=message))

    print(f"================ Messages sent to LLM for user {user_id} ===============")
    for i, m in enumerate(memory.chat_memory.messages):
        print(f"{i+1}. Role: {m.type} | Content: {m.content}")
    print("===================================================================")

    # --- Config for React-style agent graph
    config = {"configurable": {"thread_id": user_id}}
    events = graph.astream_events(
        {"messages": [style_message, *memory.chat_memory.messages]},
        config=config,
        version="v2"
    )

    ai_response = ""
    aggregated = {
        "id": None,
        "role": "ai",
        "content": "",
        "user_id": user_id,
        "sources": {},
        "followups": [],
    }

    try:
        async for event in events:
            etype = event["event"]
            meta = event.get("metadata", {}) or {}
            node = meta.get("langgraph_node")

            # --- Model start ---
            if etype == "on_chat_model_start" and node == "agent":
                yield f'data: {{"type":"stage","stage":"writing"}}\n\n'

            # --- Stream tokens ---
            elif etype == "on_chat_model_stream" and node == "agent":
                chunk = event["data"]["chunk"]
                token = getattr(chunk, "content", None)
                if token:
                    ai_response += token
                    yield f'data: {{"type":"content","content":"{_safe(token)}"}}\n\n'

            # --- Model end ---
            elif etype == "on_chat_model_end" and node == "agent":
                aggregated["content"] = ai_response
                yield f'data: {{"type":"checkpoint","checkpoint_id":"{user_id}"}}\n\n'

            # --- Tool start ---
            elif etype == "on_tool_start":
                tname = event.get("name", "")
                tinput = event.get("data", {}).get("input", {})
                if isinstance(tinput, str):
                    tinput = {"query": tinput}

                if "web_search" in tname:
                    yield f'data: {{"type":"stage","stage":"searching"}}\n\n'
                    yield f'data: {{"type":"search_start","query":"{_safe(tinput.get("query",""))}","engine":"tavily"}}\n\n'

                elif "pgsql_query_structured" in tname or "rag_tool" in tname:
                    yield f'data: {{"type":"stage","stage":"reading"}}\n\n'

            # --- Tool end ---
            elif etype == "on_tool_end":
                tname = event.get("name", "")
                raw_data = event.get("data", {})
                tout = raw_data.get("output") if isinstance(raw_data, dict) else raw_data
                result_data = _unwrap_tool_output(tout)

                if "web_search" in tname:
                    urls = [
                        r["url"]
                        for r in result_data.get("results", [])
                        if isinstance(result_data, dict) and r.get("url")
                    ]
                    aggregated["sources"]["web"] = {"engine": "tavily", "urls": urls}
                    yield f'data: {{"type":"search_results","urls":{json.dumps(urls)}}}\n\n'

                elif "pgsql_query_structured" in tname and isinstance(result_data, dict):
                    db_payload = {
                        "rowcount": result_data.get("rowcount"),
                        "columns": result_data.get("columns", []),
                        "sample_rows": result_data.get("rows", []),
                    }
                    aggregated["sources"]["db"] = db_payload
                    yield f'data: {{"type":"query_db_results","payload":{json.dumps(db_payload)}}}\n\n'

    except asyncio.CancelledError:
        print("Client disconnected, stopping generator")

    except Exception as e:
        # 🔥 THIS IS THE IMPORTANT PART
        print("Streaming error:", e)

        safe_message = "Something went wrong while generating the response."

        yield (
            'data: {'
            f'"type":"error",'
            f'"message":"{safe_message}",'
            f'"code":"STREAM_ERROR"'
            '}\n\n'
        )

    finally:
        await events.aclose()

    # --- Generate followups AFTER model fully finishes ---
    if ai_response.strip():
        followups = await _generate_followups(ai_response)
        aggregated["followups"] = followups
        if followups:
            yield f'data: {{"type":"followup","items":{json.dumps(followups)}}}\n\n'

    # --- Save messages ---
    pg_append_messages(
        user_id,
        [
            {"role": "user", "user_id": user_id, "content": message},
            {"role": "ai", "user_id": None, **aggregated},
        ],
    )

    # --- End of stream ---
    yield f'data: {{"type":"end"}}\n\n'



# -------------------
# HTTP route: stream
# -------------------
@app.get("/chat_stream")
async def chat_stream(query: str = Query(...), user_id: str = Query(...), checkpoint_id: str | None = None):
    return StreamingResponse(
        generate_chat_responses(user_id=user_id, message=query),
        media_type="text/event-stream",
    )


# -----------------------
# HTTP route: chat_boot
# -----------------------
@app.get("/chat_boot")
async def chat_boot(
    user_id: Optional[str] = Query(None), fname: Optional[str] = Query(None)
):
    """
    If user_id provided and greeted=True -> return stored messages.
    Otherwise generate a greeting:
      - personalize if fname provided,
      - generic if no fname.
    Persist greeting only when user_id is provided.
    """
    # If user_id provided, fetch the conversation and check greeted
    pg_record = pg_get_conversation(user_id) if user_id else None
    greeted = pg_record["greeted"] if pg_record else False

    # If already greeted and we have a record, return stored messages
    if greeted and pg_record:
        return {"messages": pg_record["messages"]}

    # Build a system prompt (personalized if fname known, generic otherwise)
    if fname:
        system_prompt = f"The user's name is {fname}. Greet them personally."
    else:
        system_prompt = "Greet the user warmly without mentioning their name."

    # Call the LLM directly (no graph here)
    ai_greeting = llm.invoke([SystemMessage(content=system_prompt)]).content.strip()

    formatted = [
        {"role": "system", "content": system_prompt, "user_id": None},
        {"role": "ai", "content": ai_greeting, "user_id": None},
    ]

    # Persist greeting only if user_id is provided (so anonymous users won't create permanent DB rows)
    if user_id:
        pg_upsert_greeting(user_id, fname, formatted)

    return {"messages": formatted}


app.include_router(chat_router, prefix="/api/ai")
