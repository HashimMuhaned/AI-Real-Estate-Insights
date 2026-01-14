from psycopg2.extras import RealDictCursor
from database import init_db_connection
import json


db = init_db_connection()

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
                       followups,
                       images
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
    if not messages_list:
        return

    try:
        with db.cursor() as cur:
            cur.execute("""
                INSERT INTO conversations (session_id)
                VALUES (%s)
                ON CONFLICT (session_id)
                DO UPDATE SET session_id = EXCLUDED.session_id
                RETURNING id
            """, (session_id,))
            conv_id = cur.fetchone()[0]

            for msg in messages_list:
                cur.execute("""
                    INSERT INTO messages (conversation_id, role, content, user_id, sources, followups, images)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (
                    conv_id,
                    msg["role"],
                    msg["content"],
                    msg.get("user_id"),
                    json.dumps(msg.get("sources")) if msg.get("sources") else None,
                    json.dumps(msg.get("followups")) if msg.get("followups") else None,
                    json.dumps(msg.get("images")) if msg.get("images") else None,
                ))
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"❌ Error saving messages: {e}")



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