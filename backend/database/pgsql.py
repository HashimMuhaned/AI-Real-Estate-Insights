import psycopg2


def init_db_connection():
    try:
        conn = psycopg2.connect(
            dbname="real_estate_transactions",
            user="postgres",
            password="root",
            host="localhost",
            port="5432",
        )
        return conn
    except Exception as e:
        print("Database connection failed:", e)
        return None
