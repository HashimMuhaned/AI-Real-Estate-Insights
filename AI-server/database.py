import psycopg2
import os

def init_db_connection():
    try:
        conn = psycopg2.connect(
            dbname=os.getenv("PGSQL_DB_NAME"),
            user=os.getenv("PGSQL_USER"),
            password=os.getenv("PGSQL_PASS"),
            host=os.getenv("PGSQL_HOST"),
            port=os.getenv("PGSQL_PORT"),
        )
        with conn.cursor() as cur:
            cur.execute("SET search_path TO transactions, public;")
        return conn
    except Exception as e:
        print("Database connection failed:", e)
        return None