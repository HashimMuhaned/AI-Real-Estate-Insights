# tools.py
import os, time
from typing import Dict, Any, List
from langchain_core.tools import tool
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_community.utilities import SQLDatabase
from sqlalchemy import text
import os, requests
from langchain_core.tools import BaseTool

from RAG_config import retriever
from langchain_openai import ChatOpenAI

# =========================
# DB (restrict to ONE DB)
# =========================
TARGET_DB_URI = (
    os.getenv("TARGET_DB_URI")
)

target_db = SQLDatabase.from_uri(
    TARGET_DB_URI,
    include_tables=["villa_transactions"],
    sample_rows_in_table_info=5,
)

SCHEMA_INFO = target_db.get_table_info()

# Raw engine for DB + web search
engine = target_db._engine
_tavily = TavilySearchResults()

# Use same LLM as graph.py
llm = ChatOpenAI(
    model="openai/gpt-oss-20b",
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)


@tool("rag_tool")
def rag_tool(query: str) -> str:
    """Search the knowledge base (Qdrant retriever) for relevant info."""
    docs = retriever.invoke(query)
    if not docs:
        return "I'm not sure."
    return "\n\n".join([doc.page_content for doc in docs])


@tool("web_search")
def web_search(query: str, max_results: int = 5) -> Dict[str, Any]:
    """
    Tavily web search. Returns:
    {
      "engine": "tavily",
      "query": "...",
      "results": [{"url","title","snippet"}]
    }
    """
    if isinstance(query, dict):
        query = query.get("query", "")
    elif not isinstance(query, str):
        query = str(query)

    raw = _tavily.invoke({"query": query, "max_results": max_results}) or []

    print("====================== tavily result ====================", raw)
    results: List[Dict[str, str]] = []
    for r in raw if isinstance(raw, list) else []:
        url = r.get("url") or r.get("link")
        title = r.get("title") or r.get("name")
        snippet = r.get("snippet") or r.get("description") or r.get("content")
        if url:
            results.append({"url": url, "title": title or "", "snippet": snippet or ""})

    print("=========== results =======", results[:max_results])
    return {"engine": "tavily", "query": query, "results": results[:max_results]}


@tool("pgsql_query_structured")
def pgsql_query_structured(user_query: str, sample_rows: int = 10) -> Dict[str, Any]:
    """
    Generate and execute a SQL query against the Postgres database.

    The model MUST:
    - Read the database schema below and use only those tables/columns.
    - Generate a valid PostgreSQL SELECT query to answer the user's request.
    - Never return placeholders (like SELECT 0).
    - If the info is not available in schema, respond with "Not available in database".
    - Use ILIKE for partial matches.
    - Only return SQL (no explanations, no markdown).

    Input:
    - user_query: the user's natural language request
    - sample_rows: max number of rows to fetch (default = 10)

    Output:
    {
      "dialect": "postgresql",
      "columns": [...],
      "rows": [...],
      "rowcount": <int>,
      "elapsed_ms": <int>,
      "error": <optional error string>
    }
    """

    sql_prompt = f"""
    User request: {user_query}

    Database schema:
    {SCHEMA_INFO}

    Write a valid PostgreSQL query following the rules.
    Return ONLY the SQL query, nothing else.
    """

    sql = llm.invoke(sql_prompt).content.strip()

    if sql.startswith("```"):
        sql = sql.strip("`").replace("sql", "", 1).strip()

    print("🟢 Running SQL:", sql)

    start = time.perf_counter()
    try:
        with engine.begin() as conn:
            res = conn.execute(text(sql))
            rows = [dict(r._mapping) for r in res.fetchmany(sample_rows)]
            columns = list(rows[0].keys()) if rows else list(res.keys())
            try:
                rowcount = res.rowcount if res.rowcount != -1 else None
            except Exception:
                rowcount = None
    except Exception as e:
        print("❌ SQL Execution Error:", sql, str(e))
        return {
            "dialect": "postgresql",
            "columns": [],
            "rows": [],
            "rowcount": 0,
            "elapsed_ms": int((time.perf_counter() - start) * 1000),
            "error": str(e),
        }

    return {
        "dialect": "postgresql",
        "columns": columns,
        "rows": rows,
        "rowcount": rowcount if rowcount is not None else len(rows),
        "elapsed_ms": int((time.perf_counter() - start) * 1000),
    }

TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

@tool("image_search")
def image_search(query: str, max_results: int = 5) -> Dict[str, Any]:
    """
    Contextual image search using Tavily (returns both context and images).
    """
    try:
        resp = requests.post(
            "https://api.tavily.com/search",
            json={
                "api_key": TAVILY_API_KEY,
                "query": query,
                "search_depth": "advanced",
                "include_images": True,
                "max_results": max_results,
            },
            timeout=15,
        )
        data = resp.json()
    except Exception as e:
        print("Tavily request failed:", e)
        return {
            "engine": "tavily",
            "query": query,
            "context": [],
            "images": [],
        }

    # --- Step 1: Extract context from results ---
    context = []
    for r in data.get("results", []):
        context.append({
            "title": r.get("title") or "",
            "snippet": r.get("snippet") or r.get("content") or "",
        })

    # --- Step 2: Extract images from top-level 'images' array ---
    image_results = []
    for img_url in data.get("images", [])[:max_results]:
        image_results.append({
            "url": img_url,
            "title": "",  # optional: could associate with first result title
            "source": "",  # optional: could associate with first result url
        })

    print("=================== images ===================", image_results)

    return {
        "engine": "tavily",
        "query": query,
        "context": context[:max_results],
        "images": image_results[:max_results],
    }


ALL_TOOLS: list[BaseTool] = [
    rag_tool,
    web_search,
    pgsql_query_structured,
    image_search,
]