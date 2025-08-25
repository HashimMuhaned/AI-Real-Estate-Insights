# import psycopg2
from database.pgsql import init_db_connection
from fastapi import FastAPI
from routes.routes import router as main_router

# @app.on_event("startup") and @app.on_event("shutdown") are deprecated using this instead ⬇️
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware


# Just to test the connection, structure that lifecycle hooks expects
# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     # Startup logic
#     ...
#     yield
#     # Shutdown logic
@asynccontextmanager
async def lifespan(app: FastAPI):
    conn = init_db_connection()
    if conn:
        print("Database connected.")
        conn.close()  # we close it immediately
    else:
        print("connection failed.")
    yield
    print("shutting down")


app = FastAPI(lifespan=lifespan)

app.include_router(main_router, prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Server is running"}


