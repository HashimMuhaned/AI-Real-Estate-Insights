from fastapi import Body, HTTPException
from database import init_db_connection
from psycopg2.extras import RealDictCursor
from utils.insights_graph import insight_graph

db = init_db_connection()

def fetch_chat_messages(user_id: str):
    # You can add stricter validation if needed, e.g. UUID regex
    if not user_id or not isinstance(user_id, str):
        raise HTTPException(status_code=400, detail="Invalid user ID")

    with db.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            SELECT messages
            FROM conversations
            WHERE session_id = %s
            LIMIT 1
            """,
            (user_id,),
        )
        record = cur.fetchone()

    if not record:
        return {"messages": []}

    return {"messages": record.get("messages", [])}


async def generate_insight(chart_type, context, data_summary, detail_level):
    result = insight_graph.invoke({
        "chart_type": chart_type,
        "context": context,
        "data_summary": data_summary,
        "detail_level": detail_level,
    })
    return {"insight": result["insight"]}
