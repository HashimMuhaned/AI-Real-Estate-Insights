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
    allow_origins=["*"],
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
async def generate_chat_responses(user_id: Optional[str], message: str):
    events = None  # Initialize to None for finally block
    
    # Determine if user is signed in
    is_signed_in = bool(user_id and user_id.strip())
    
    try:
        # --- Load conversation history from Postgres (only for signed-in users)
        existing_messages = []
        if is_signed_in:
            try:
                pg_record = pg_get_conversation(user_id)
                existing_messages = pg_record["messages"] if pg_record else []
            except Exception as e:
                print(f"Database error loading conversation: {e}")
                yield (
                    'data: {'
                    '"type":"error",'
                    '"message":"Unable to load conversation history. Please try again.",'
                    '"code":"DATABASE_ERROR"'
                    '}\n\n'
                )
                return

        # --- Keep only role & content from DB
        filtered_messages = [
            {"role": m["role"], "content": m["content"]}
            for m in existing_messages
            if m.get("content")
        ]

        print("================== Existing Messages ===============", filtered_messages)

        memory = ConversationBufferMemory(return_messages=True)

        # --- Summarize long conversations and keep last 10 messages
        try:
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
        except Exception as e:
            print(f"Error summarizing messages: {e}")
            # Continue without summary
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

        # Use a safe identifier for logging
        user_identifier = user_id if is_signed_in else "anonymous"
        print(f"================ Messages sent to LLM for user {user_identifier} ===============")
        for i, m in enumerate(memory.chat_memory.messages):
            print(f"{i+1}. Role: {m.type} | Content: {m.content}")
        print("===================================================================")

        # --- Config for React-style agent graph
        config = {"configurable": {"thread_id": user_id if is_signed_in else "anonymous"}}
        
        try:
            events = graph.astream_events(
                {"messages": [style_message, *memory.chat_memory.messages]},
                config=config,
                version="v2"
            )
        except Exception as e:
            print(f"Error initializing graph stream: {e}")
            yield (
                'data: {'
                '"type":"error",'
                '"message":"Unable to initialize AI model. Please try again.",'
                '"code":"MODEL_INIT_ERROR"'
                '}\n\n'
            )
            return

        ai_response = ""
        aggregated = {
            "id": None,
            "role": "ai",
            "content": "",
            "user_id": user_id if is_signed_in else None,
            "sources": {},
            "followups": [],
        }

        # Track if we've sent any content
        has_sent_content = False

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
                        has_sent_content = True
                        yield f'data: {{"type":"content","content":"{_safe(token)}"}}\n\n'

                # --- Model end ---
                elif etype == "on_chat_model_end" and node == "agent":
                    aggregated["content"] = ai_response
                    yield f'data: {{"type":"checkpoint","checkpoint_id":"{user_id if is_signed_in else "anonymous"}"}}\n\n'

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
            # Don't send error for client disconnect - it's expected
            return

        except Exception as e:
            # 🔥 IMPROVED ERROR HANDLING - Send detailed error to frontend
            print(f"Streaming error: {e}")
            import traceback
            traceback.print_exc()

            # Determine error type and message
            error_message = str(e)
            error_code = "STREAM_ERROR"

            # Categorize errors
            if "timeout" in error_message.lower():
                error_code = "TIMEOUT"
                error_message = "The request took too long to complete. Please try again."
            elif "connection" in error_message.lower() or "network" in error_message.lower():
                error_code = "CONNECTION_FAILED"
                error_message = "Network error occurred. Please check your connection and try again."
            elif "rate limit" in error_message.lower():
                error_code = "RATE_LIMIT"
                error_message = "Too many requests. Please wait a moment and try again."
            elif "api" in error_message.lower() or "model" in error_message.lower():
                error_code = "MODEL_ERROR"
                error_message = "AI model error. Please try again."
            else:
                error_message = "Something went wrong while generating the response. Please try again."

            # Send error event to frontend
            yield (
                'data: {'
                f'"type":"error",'
                f'"message":"{_safe(error_message)}",'
                f'"code":"{error_code}"'
                '}\n\n'
            )
            return  # Exit early, don't continue processing

        # --- Generate followups AFTER model fully finishes ---
        if ai_response.strip():
            try:
                followups = await _generate_followups(ai_response)
                aggregated["followups"] = followups
                if followups:
                    yield f'data: {{"type":"followup","items":{json.dumps(followups)}}}\n\n'
            except Exception as e:
                print(f"Error generating followups: {e}")
                # Continue without followups - not critical

        # --- Save messages (ONLY for signed-in users) ---
        if is_signed_in:
            try:
                pg_append_messages(
                    user_id,
                    [
                        {"role": "user", "user_id": user_id, "content": message},
                        {"role": "ai", "user_id": None, **aggregated},
                    ],
                )
                print(f"✅ Messages saved to database for user {user_id}")
            except Exception as e:
                print(f"Error saving messages to database: {e}")
                # Don't fail the request if we can't save to DB
                # The user already got their response
        else:
            print(f"ℹ️ Anonymous user - messages not saved to database")

        # --- End of stream ---
        yield f'data: {{"type":"end"}}\n\n'

    except Exception as e:
        # 🔥 CATCH-ALL ERROR HANDLER - For any unexpected errors
        print(f"Unexpected error in generate_chat_responses: {e}")
        import traceback
        traceback.print_exc()

        yield (
            'data: {'
            '"type":"error",'
            '"message":"An unexpected error occurred. Please try again.",'
            '"code":"UNEXPECTED_ERROR"'
            '}\n\n'
        )

    finally:
        # 🔥 CLEANUP - Always close the event stream
        if events is not None:
            try:
                await events.aclose()
            except Exception as e:
                print(f"Error closing event stream: {e}")


# -------------------
# HTTP route: stream
# -------------------
@app.get("/chat_stream")
async def chat_stream(
    query: str = Query(...), 
    user_id: Optional[str] = Query(None),  # Changed to Optional
    checkpoint_id: Optional[str] = None
):
    """
    Stream chat responses with proper error handling.
    Errors are sent as SSE events with type="error".
    
    user_id is now optional - if not provided, messages won't be saved to DB.
    """
    # Validate inputs
    if not query or not query.strip():
        # Return error as SSE event instead of raising HTTPException
        async def error_generator():
            yield (
                'data: {'
                '"type":"error",'
                '"message":"Please provide a valid message.",'
                '"code":"INVALID_INPUT"'
                '}\n\n'
            )
        return StreamingResponse(error_generator(), media_type="text/event-stream")

    # Note: user_id validation removed - it's now optional for anonymous users

    try:
        return StreamingResponse(
            generate_chat_responses(user_id=user_id, message=query),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",  # Disable nginx buffering
            }
        )
    except Exception as e:
        print(f"Error in chat_stream endpoint: {e}")
        # Return error as SSE event
        async def error_generator():
            yield (
                'data: {'
                '"type":"error",'
                '"message":"Failed to initialize chat stream.",'
                '"code":"STREAM_INIT_ERROR"'
                '}\n\n'
            )
        return StreamingResponse(error_generator(), media_type="text/event-stream")


# -----------------------
# HTTP route: chat_boot
# -----------------------
@app.get("/chat_boot")
async def chat_boot(
    user_id: Optional[str] = Query(None), 
    fname: Optional[str] = Query(None),
    skip_greeting: Optional[bool] = Query(False)  # 👈 NEW: Allow skipping greeting
):
    """
    If user_id provided and greeted=True -> return stored messages.
    Otherwise generate a greeting:
      - personalize if fname provided,
      - generic if no fname.
    Persist greeting only when user_id is provided.
    
    skip_greeting: Set to true when user has existing anonymous messages
    """
    try:
        # Determine if user is signed in
        is_signed_in = bool(user_id and user_id.strip())
        
        # If user_id provided, fetch the conversation and check greeted
        pg_record = None
        greeted = False
        
        if is_signed_in:
            try:
                pg_record = pg_get_conversation(user_id)
                greeted = pg_record["greeted"] if pg_record else False
            except Exception as e:
                print(f"Database error in chat_boot: {e}")
                # Continue with greeting generation for signed-in users even if DB fails

        # If already greeted and we have a record, return stored messages
        if greeted and pg_record:
            return {"messages": pg_record["messages"]}

        # 🔥 NEW: If skip_greeting is true, return empty messages
        # This happens when user just logged in with existing anonymous chat
        if skip_greeting:
            print(f"ℹ️ Skipping greeting for user {user_id} (has existing anonymous messages)")
            return {"messages": []}

        # Build a system prompt (personalized if fname known, generic otherwise)
        if fname:
            system_prompt = f"The user's name is {fname}. Greet them personally."
        else:
            system_prompt = "Greet the user warmly without mentioning their name."

        # Call the LLM directly (no graph here)
        try:
            ai_greeting = llm.invoke([SystemMessage(content=system_prompt)]).content.strip()
        except Exception as e:
            print(f"Error generating greeting: {e}")
            # Fallback to a default greeting
            ai_greeting = "Hello! How can I assist you today?"

        formatted = [
            {"role": "system", "content": system_prompt, "user_id": None},
            {"role": "ai", "content": ai_greeting, "user_id": None},
        ]

        # Persist greeting only if user_id is provided (signed-in users)
        if is_signed_in:
            try:
                pg_upsert_greeting(user_id, fname, formatted)
                print(f"✅ Greeting saved for user {user_id}")
            except Exception as e:
                print(f"Error saving greeting to database: {e}")
                # Continue anyway - user can still see the greeting
        else:
            print(f"ℹ️ Anonymous user - greeting not saved to database")

        return {"messages": formatted}

    except Exception as e:
        print(f"Error in chat_boot endpoint: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail="Failed to initialize chat. Please try again."
        )


# -----------------------
# HTTP route: sync_anonymous_messages
# -----------------------
@app.post("/sync_anonymous_messages")
async def sync_anonymous_messages(request: dict):
    """
    Sync messages from an anonymous session to a newly authenticated user's database.
    Called automatically when a user logs in after chatting anonymously.
    
    Request body:
    {
        "user_id": "user_id_here",
        "messages": [
            {"role": "user", "content": "...", "user_id": "user_id"},
            {"role": "ai", "content": "...", "sources": {...}, "followups": [...]}
        ]
    }
    """
    try:
        user_id = request.get("user_id")
        messages = request.get("messages", [])
        
        if not user_id:
            raise HTTPException(status_code=400, detail="user_id is required")
        
        if not messages or len(messages) == 0:
            return {"success": True, "synced": 0, "message": "No messages to sync"}
        
        print(f"🔄 Syncing {len(messages)} anonymous messages for user {user_id}")
        
        # Append messages to the user's conversation
        try:
            pg_append_messages(user_id, messages)
            print(f"✅ Successfully synced {len(messages)} messages for user {user_id}")
            
            return {
                "success": True,
                "synced": len(messages),
                "message": f"Successfully synced {len(messages)} messages"
            }
        except Exception as e:
            print(f"❌ Error syncing messages to database: {e}")
            import traceback
            traceback.print_exc()
            raise HTTPException(
                status_code=500,
                detail=f"Failed to sync messages: {str(e)}"
            )
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Unexpected error in sync_anonymous_messages: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail="Failed to sync messages. Please try again."
        )


app.include_router(chat_router, prefix="/api/ai")