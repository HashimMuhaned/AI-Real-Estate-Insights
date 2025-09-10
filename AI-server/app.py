from typing import Optional
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, ToolMessage
from langchain.memory import ConversationBufferMemory
from dotenv import load_dotenv
from fastapi import FastAPI, Query, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from database import init_db_connection
from routes.chat_routes import router as chat_router
import json
from utils.memory_utils import summarize_messages, serialise_ai_message_chunk
from utils.graph_config import graph, llm, _generate_followups
import re

from psycopg2.extras import RealDictCursor
import asyncio

db = init_db_connection()
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://mern-ecommerce-frontend-of3877ez1-hashims-projects-1d68b3df.vercel.app",
        "https://mern-ecommerce-frontend-jcmqogpn4-hashims-projects-1d68b3df.vercel.app",
        "https://mern-ecommerce-frontend-git-main-hashims-projects-1d68b3df.vercel.app",
        "https://mern-ecommerce-frontend-eta-ten.vercel.app",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Type"],
)

# -----------------------
# Postgres helper methods
# -----------------------


def pg_get_conversation(session_id: str):
    """Return conversation metadata + list of messages in strict chronological order (no json_agg)."""

    with db.cursor(cursor_factory=RealDictCursor) as cur:
        try:
            # First fetch the conversation
            cur.execute(
                """
                SELECT id, session_id, greeted, user_name
                FROM conversations
                WHERE session_id = %s
                """,
                (session_id,),
            )
            convo = cur.fetchone()
            if not convo:
                return None

            # Now fetch the messages separately, ordered strictly
            cur.execute(
                """
                SELECT id,
                       role,
                       content,
                       user_id,
                       to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS') || 'Z' AS created_at,
                       sources,
                       followups   
                FROM messages
                WHERE conversation_id = %s
                ORDER BY created_at ASC, id ASC
                """,
                (convo["id"],),
            )
            messages = cur.fetchall()

            # Attach messages to the conversation
            convo["messages"] = messages
            return convo

        except Exception:
            db.rollback()
            raise


def pg_append_messages(session_id: str, messages_list: list):
    """Insert new messages for given session_id."""
    if not messages_list:
        return

    with db.cursor() as cur:
        cur.execute(
            """
            INSERT INTO conversations (session_id)
            VALUES (%s)
            ON CONFLICT (session_id) DO NOTHING
            RETURNING id
            """,
            (session_id,),
        )
        conv_row = cur.fetchone()
        if conv_row:
            conv_id = conv_row[0]
        else:
            cur.execute(
                "SELECT id FROM conversations WHERE session_id = %s", (session_id,)
            )
            conv_id = cur.fetchone()[0]

        for msg in messages_list:
            cur.execute(
                """
                INSERT INTO messages (conversation_id, role, content, user_id, sources, followups)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (
                    conv_id,
                    msg["role"],
                    msg["content"],
                    msg.get("user_id"),
                    json.dumps(msg["sources"]) if msg.get("sources") else None,
                    json.dumps(msg["followup"]) if msg.get("followup") else None,
                ),
            )

    db.commit()


def pg_upsert_greeting(session_id: str, fname: str, formatted_messages: list):
    """Ensure greeting exists: overwrite user_name + mark greeted + insert fresh messages."""
    with db.cursor() as cur:
        # Upsert conversation
        cur.execute(
            """
            INSERT INTO conversations (session_id, greeted, user_name)
            VALUES (%s, TRUE, %s)
            ON CONFLICT (session_id)
            DO UPDATE SET greeted = TRUE, user_name = EXCLUDED.user_name
            RETURNING id
            """,
            (session_id, fname),
        )
        conv_id = cur.fetchone()[0]

        # Clear old messages for greeting reset
        cur.execute("DELETE FROM messages WHERE conversation_id = %s", (conv_id,))

        # Insert greeting messages
        for msg in formatted_messages:
            cur.execute(
                """
                INSERT INTO messages (conversation_id, role, content, user_id)
                VALUES (%s, %s, %s, %s)
                """,
                (conv_id, msg["role"], msg["content"], msg.get("user_id")),
            )

    db.commit()


def _safe(s: str) -> str:
    return (
        s.replace("\\", "\\\\")
        .replace('"', '\\"')
        .replace("'", "\\'")
        .replace("\n", "\\n")
    )


def _unwrap_tool_output(tout):
    """Unwrap tool outputs, including ToolMessage -> dict."""
    if tout is None:
        return None

    # Handle LangChain ToolMessage wrapper
    if isinstance(tout, ToolMessage):
        try:
            return json.loads(tout.content)  # parse the JSON string
        except Exception:
            return tout.content

    # Handle dict with nested result keys
    if isinstance(tout, dict):
        for key in ("output", "result", "return_value", "value"):
            if key in tout:
                return tout[key]

    # Handle JSON string
    if isinstance(tout, str):
        try:
            return json.loads(tout)
        except Exception:
            return tout

    return tout


# ---------------------------------------------------------
# Main async generator: streams AI content + handles memory
# ---------------------------------------------------------
async def generate_chat_responses(user_id: str, message: str):
    # --- Load conversation history
    pg_record = pg_get_conversation(user_id)
    existing_messages = pg_record["messages"] if pg_record else []

    memory = ConversationBufferMemory(return_messages=True)

    # --- Summarize long convos
    if len(existing_messages) > 12:
        summary_messages = existing_messages[:-10]
        latest_messages = existing_messages[-10:]
        summary_text = await summarize_messages(summary_messages)
        memory.chat_memory.add_message(
            SystemMessage(content=f"Conversation Summary: {summary_text}")
        )
        for msg in latest_messages:
            if msg["role"] in ("user", "human"):
                memory.chat_memory.add_message(HumanMessage(content=msg["content"]))
            elif msg["role"] in ("ai", "assistant"):
                memory.chat_memory.add_message(AIMessage(content=msg["content"]))
            elif msg["role"] == "system":
                memory.chat_memory.add_message(SystemMessage(content=msg["content"]))
    else:
        for msg in existing_messages:
            if msg["role"] in ("user", "human"):
                memory.chat_memory.add_message(HumanMessage(content=msg["content"]))
            elif msg["role"] in ("ai", "assistant"):
                memory.chat_memory.add_message(AIMessage(content=msg["content"]))
            elif msg["role"] == "system":
                memory.chat_memory.add_message(SystemMessage(content=msg["content"]))

    # --- Add + persist new user message
    memory.chat_memory.add_message(HumanMessage(content=message))
    pg_append_messages(
        user_id, [{"role": "user", "user_id": user_id, "content": message}]
    )

    # --- Track messages before run
    messages_before = len(memory.chat_memory.messages)

    # --- Config
    config = {"configurable": {"thread_id": user_id}}
    events = graph.astream_events(
        {"messages": memory.chat_memory.messages}, config=config, version="v2"
    )

    ai_response = ""
    followups_collected = []
    web_payload = {"engine": "tavily", "query": None, "urls": []}
    db_payload = {"sql": None, "rowcount": None, "columns": [], "sample_rows": []}

    try:
        async for event in events:
            etype = event["event"]
            meta = event.get("metadata", {}) or {}
            node = meta.get("langgraph_node")

            # --- Writing answer
            if etype == "on_chat_model_start" and node == "synthesize":
                yield f'data: {{"type": "stage", "stage": "writing"}}\n\n'

            elif etype == "on_chat_model_stream" and node == "synthesize":
                chunk = event["data"]["chunk"]
                token = getattr(chunk, "content", None)
                if token:
                    ai_response += token
                    yield f'data: {{"type": "content", "content": "{_safe(token)}"}}\n\n'

            elif etype == "on_chat_model_end" and node == "synthesize":
                # --- Generate followups immediately after content is ready
                followups_collected = await _generate_followups(ai_response)
                if followups_collected:
                    yield f'data: {{"type": "followup", "items": {json.dumps(followups_collected)}}}\n\n'
                yield f'data: {{"type": "checkpoint", "checkpoint_id": "{user_id}"}}\n\n'

            # --- Tools
            elif etype == "on_tool_start":
                tname = event.get("name")
                tinput = event.get("data", {}).get("input", {})
                if isinstance(tinput, str):
                    tinput = {"query": tinput}
                # If multiple search tools exist, narrow using substring
                if tname and "web_search" in tname:
                    yield f'data: {{"type": "stage", "stage": "searching"}}\n\n'
                    query = tinput.get("query") or ""
                    web_payload["query"] = query
                    yield f'data: {{"type": "search_start", "query": "{_safe(query)}", "engine": "tavily"}}\n\n'
                elif tname and (
                    "pgsql_query_structured" in tname or "rag_tool" in tname
                ):
                    yield f'data: {{"type": "stage", "stage": "reading"}}\n\n'

            elif etype == "on_tool_end":
                tname = event.get("name")
                raw_data = event.get("data", {})

                # prefer 'output' key if present, else whole data
                tout = (
                    raw_data.get("output")
                    if isinstance(raw_data, dict) and "output" in raw_data
                    else raw_data
                )

                # Unwrap ToolMessage -> dict
                result_data = _unwrap_tool_output(tout)

                if tname and "web_search" in tname:
                    urls = []
                    query = None

                    if isinstance(result_data, dict):
                        query = result_data.get("query")
                        for r in result_data.get("results", []):
                            if r.get("url"):
                                urls.append(r["url"])

                    web_payload["query"] = query
                    for u in urls:
                        if u not in web_payload["urls"]:
                            web_payload["urls"].append(u)

                    yield f'data: {{"type": "search_results", "urls": {json.dumps(web_payload["urls"])}}}\n\n'
                    yield f'data: {{"type": "stage", "stage": "reading"}}\n\n'

                elif (
                    tname
                    and "pgsql_query_structured" in tname
                    and isinstance(result_data, dict)
                ):
                    db_payload["rowcount"] = result_data.get("rowcount")
                    db_payload["columns"] = result_data.get("columns", [])
                    db_payload["sample_rows"] = result_data.get("rows", [])
                    payload = {
                        "rowcount": db_payload["rowcount"],
                        "columns": db_payload["columns"],
                        "sample_rows": db_payload["sample_rows"],
                    }
                    yield f'data: {{"type": "query_db_results", "payload": {json.dumps(payload)}}}\n\n'
                    yield f'data: {{"type": "stage", "stage": "reading"}}\n\n'

    except asyncio.CancelledError:
        print("Client disconnected, stopping generator")
    finally:
        await events.aclose()

    yield f'data: {{"type": "end"}}\n\n'

    # --- Persist AI response + sources + followups
    memory.chat_memory.add_message(
        AIMessage(
            content=ai_response,
            additional_kwargs={"followup": followups_collected},
        )
    )
    new_messages = memory.chat_memory.messages[messages_before - 1 :]

    sources_payload = {}
    if web_payload["urls"]:
        sources_payload["web"] = web_payload
    if db_payload["rowcount"] is not None:
        sources_payload["db"] = {
            "rowcount": db_payload["rowcount"],
            "columns": db_payload["columns"],
            "sample_rows": db_payload["sample_rows"],
        }

    formatted = []
    for m in new_messages:
        role = m.type
        entry = {"role": role, "user_id": user_id if role == "user" else None}
        entry["content"] = m.content
        if role == "ai":
            entry["followup"] = m.additional_kwargs.get("followup", [])
            if sources_payload:
                entry["sources"] = sources_payload
        formatted.append(entry)

    if formatted:
        print("=============== fromatted ==============", formatted)
        pg_append_messages(user_id, formatted)


# -------------------
# HTTP route: stream
# -------------------
@app.get("/chat_stream/{message}")
async def chat_stream(message: str, user_id: str = Query(...)):
    return StreamingResponse(
        generate_chat_responses(user_id=user_id, message=message),
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


app.include_router(chat_router, prefix="/api")
