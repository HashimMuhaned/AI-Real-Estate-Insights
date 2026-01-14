# insights_graph.py
# from langgraph.graph import StateGraph, END, START
# from langchain_openai import ChatOpenAI
# from langchain_core.messages import SystemMessage, HumanMessage
import os
from dotenv import load_dotenv

load_dotenv()

# def build_insight_graph():
#     llm = ChatOpenAI(
#         model="openai/gpt-oss-20b",
#         api_key=os.getenv("GROQ_API_KEY"),
#         base_url="https://api.groq.com/openai/v1",
#     )

#     # ---------- Node 1: Insight Generation ----------
#     def generate_insight(state):
#         chart_type = state["chart_type"]
#         context = state["context"]
#         data_summary = state["data_summary"]
#         detail_level = state["detail_level"]

#         prompt = f"""
#         You are an AI real estate analyst. You are given:
#         - Chart type: {chart_type}
#         - Context: {context}
#         - Aggregated data: {data_summary}

#         Write a { "one-sentence summary" if detail_level == "short" else "detailed analytical insight" }.

#         For short:
#         - Be very concise and quantitative (max 1 line).
#         For detailed:
#         - Give 3–5 sentences explaining patterns, anomalies, and market interpretation.
#         - Mention specific data movements (e.g., “rental yield increased 3.5% while sales prices fell 2%”).
#         - Be professional and neutral in tone.
#         """
#         res = llm.invoke([
#             SystemMessage(content="You are an expert in real estate data analysis."),
#             HumanMessage(content=prompt),
#         ])
#         return {"insight": res.content}

#     # ---------- Node 2: Narrative Generation ----------
#     def generate_narrative(state):
#         chart_type = state["chart_type"]
#         data_summary = state["data_summary"]
#         context = state["context"]

#         prompt = f"""
#         You are an AI narrator creating a real estate story.
#         Based on the following data:
#         - Chart type: {chart_type}
#         - Context: {context}
#         - Summary: {data_summary}

#         Write a narrative as if explaining to a property investor.
#         - Keep tone: engaging, professional, and data-informed.
#         - Mention trends, growth/decline patterns, and any interesting comparisons.
#         - Avoid bullet points; use fluent sentences.
#         - Length: about 3–5 sentences.
#         """

#         res = llm.invoke([
#             SystemMessage(content="You are a professional AI narrator for real estate analytics."),
#             HumanMessage(content=prompt),
#         ])
#         return {"narrative": res.content}

#     # ---------- Graph Definition ----------
#     graph = StateGraph(dict)
#     graph.add_node("generate_insight", generate_insight)
#     graph.add_node("generate_narrative", generate_narrative)

#     # Conditional routing from START
#     def router(state):
#         return "generate_narrative" if state.get("mode") == "narrative" else "generate_insight"

#     graph.add_conditional_edges(START, router)

#     # End edges
#     graph.add_edge("generate_insight", END)
#     graph.add_edge("generate_narrative", END)

#     # ✅ No need for graph.set_entry_point(START)
#     return graph.compile()

# insight_graph = build_insight_graph()

import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import create_react_agent
from utils.tools import ALL_TOOLS
import json

load_dotenv()

# Shared LLM for all nodes
llm = ChatOpenAI(
    model="openai/gpt-oss-20b",
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
    temperature=0.2,
)


# ---------- Node: Insight Generation ----------
def generate_insight(state):
    chart_type = state["chart_type"]
    context = state["context"]
    data_summary = state["data_summary"]
    detail_level = state.get("detail_level", "short")

    prompt = f"""
    You are a professional Dubai real estate data analyst.

    Given:
    - Chart type: {chart_type}
    - Context: {context}
    - Aggregated data summary (array of objects): {data_summary}

    Write a { "one-line quantitative insight" if detail_level == "short" else "detailed investor insight (3–5 sentences)" }.
    Focus on patterns, trends, or anomalies. Do NOT repeat raw numbers exactly.
    """

    res = llm.invoke([
        SystemMessage(content="You are a Dubai property market analysis expert."),
        HumanMessage(content=prompt),
    ])

    return {"insight": res.content.strip()}


# ---------- Node: Narrative Generation ----------
def generate_narrative(state):
    chart_type = state["chart_type"]
    context = state["context"]
    data_summary = state.get("data_summary", [])
    detail_level = state.get("detail_level", "detailed")

    prompt = f"""
    You are an AI narrator explaining Dubai real estate market trends.

    Based on:
    - Chart type: {chart_type}
    - Context: {context}
    - Data Summary: {data_summary}

    Write a narrative for investors in {detail_level} detail.
    Be fluent, engaging, and insight-driven.
    """

    res = llm.invoke([
        SystemMessage(content="You are a professional market narrator for Dubai real estate."),
        HumanMessage(content=prompt),
    ])

    return {"narrative": res.content.strip()}


# ---------- Node: Opportunity Snapshot ----------
def generate_opportunity_snapshot(state):
    chart_type = state["chart_type"]
    context = state["context"]
    data_summary = state["data_summary"]

    prompt = f"""
    You are a Dubai property investment advisor.

    Create a two-sentences Opportunity Snapshot.
    Output ONLY:
    - Verdict: Good, Neutral, or Risky
    - Reason: a short qualitative explanation (no numbers, no metrics)

    Base this on:
    - Chart type: {chart_type}
    - Market context: {context}
    - Aggregated data trends: {data_summary}

    Format STRICTLY as:
    Verdict: <Good|Neutral|Risky>
    Reason: <short explanation>, you can search the web for more details
    """

    res = llm.invoke([
        SystemMessage(content="You are a Dubai property advisor expert."),
        HumanMessage(content=prompt),
    ])

    text = res.content.strip()

    verdict = "Neutral"
    reason = "Market conditions are stable."

    for line in text.split("\n"):
        if line.lower().startswith("verdict"):
            verdict = line.split(":",1)[1].strip()
        if line.lower().startswith("reason"):
            reason = line.split(":",1)[1].strip()

    return {
        "snapshot_verdict": verdict,
        "snapshot_reason": reason
    }


# Default weights (tweakable)
DEFAULT_WEIGHTS = {
    "yield": 0.25,
    "yoy_change": 0.20,
    "volatility": 0.15,   # lower volatility better -> will be inverted in score
    "txn_volume": 0.15,
    "time_on_market": 0.10, # lower better -> inverted
    "supply_pipeline_count": 0.10, # lower pipeline -> positive
    "developer_reliability": 0.05
}

def _safe(v):
    return None if v is None else float(v)

def generate_investment_score(state):
    metrics = state.get("metrics", {})
    weights = state.get("weights", DEFAULT_WEIGHTS)

    # Extract metrics with safe defaults
    m_yield = _safe(metrics.get("yield"))
    m_yoy = _safe(metrics.get("yoy_change"))
    m_vol = _safe(metrics.get("volatility", 0.0))
    m_txn = _safe(metrics.get("txn_volume", 0.0))
    m_tom = _safe(metrics.get("time_on_market"))  # days
    m_supply = _safe(metrics.get("supply_pipeline_count", 0.0))
    m_dev = _safe(metrics.get("developer_reliability", 0.75))

    # Simple normalization strategy (bounded transforms)
    # NOTE: these clamps are pragmatic — tune per-market.
    def clamp01(x, lo, hi):
        if x is None:
            return 0.5
        try:
            return max(0.0, min(1.0, (x - lo) / (hi - lo)))
        except:
            return 0.5

    # Normalization ranges (market-specific; tune later)
    yield_norm = clamp01(m_yield, 0.01, 0.10)           # 1%..10%
    yoy_norm = clamp01(m_yoy, -0.20, 0.50)              # -20% .. +50%
    vol_norm = clamp01(m_vol, 0.0, max(0.0001, m_vol if m_vol>0 else 1.0))  # map to 0..1
    txn_norm = clamp01(m_txn, 0, 2000)                  # 0..2000 txns
    tom_norm = clamp01(m_tom, 0, 180)                   # 0..180 days; lower better
    supply_norm = clamp01(m_supply, 0, 5000)            # 0..5000 units pipeline
    dev_norm = clamp01(m_dev, 0.0, 1.0)                 # 0..1

    # Invert metrics where lower is better (volatility, time_on_market, supply)
    inv_vol = 1.0 - vol_norm
    inv_tom = 1.0 - tom_norm
    inv_supply = 1.0 - supply_norm

    # Compute each contribution
    contributions = {
        "yield": weights.get("yield", DEFAULT_WEIGHTS["yield"]) * yield_norm,
        "yoy_change": weights.get("yoy_change", DEFAULT_WEIGHTS["yoy_change"]) * yoy_norm,
        "volatility": weights.get("volatility", DEFAULT_WEIGHTS["volatility"]) * inv_vol,
        "txn_volume": weights.get("txn_volume", DEFAULT_WEIGHTS["txn_volume"]) * txn_norm,
        "time_on_market": weights.get("time_on_market", DEFAULT_WEIGHTS["time_on_market"]) * inv_tom,
        "supply_pipeline_count": weights.get("supply_pipeline_count", DEFAULT_WEIGHTS["supply_pipeline_count"]) * inv_supply,
        "developer_reliability": weights.get("developer_reliability", DEFAULT_WEIGHTS["developer_reliability"]) * dev_norm
    }

    raw_score = sum(contributions.values())
    # Normalize to 0..100 (weights sum may be 1, but safe-rescale)
    total_weight = sum(weights.values()) if sum(weights.values()) > 0 else 1.0
    score_0_100 = round((raw_score / total_weight) * 100)

    # Labeling thresholds
    if score_0_100 >= 70:
        label = "Buy"
    elif score_0_100 >= 40:
        label = "Hold"
    else:
        label = "Sell"

    # Compute top 3 drivers by absolute contribution (driver name + contribution share)
    sorted_drivers = sorted(contributions.items(), key=lambda kv: kv[1], reverse=True)
    top_drivers = []
    for k, v in sorted_drivers[:3]:
        top_drivers.append({"driver": k, "contribution": round(v / (total_weight if total_weight>0 else 1.0), 3)})

    # Ask LLM for human explanation of drivers (concise)
    llm_prompt = f"""
You are a concise, professional investment analyst.

Given the following metrics (raw) and top drivers (with contribution share), write:
- One short sentence summarizing the overall Investment Score.
- Three short bullets (1 line each) that explain the top 3 drivers in plain English.

Metrics (JSON):
{json.dumps(metrics, indent=2)}

Top drivers (JSON):
{json.dumps(top_drivers, indent=2)}

Output only JSON like:
{{
  "summary": "...one sentence...",
  "bullets": ["one", "two", "three"]
}}
"""

    res = llm.invoke([
        SystemMessage(content="You are a succinct real estate investment analyst."),
        HumanMessage(content=llm_prompt),
    ])

    # Parse LLM response safely; fallback to generated text if parse fails
    try:
        ai_text = res.content.strip()
        ai_json = json.loads(ai_text)
    except Exception:
        ai_json = {
            "summary": f"Score {score_0_100} ({label}) — top drivers: {', '.join([d['driver'] for d in top_drivers])}.",
            "bullets": [f"{d['driver']}: contribution {d['contribution']}" for d in top_drivers]
        }

    output = {
        "score": score_0_100,
        "label": label,
        "drivers": top_drivers,
        "ai_explanation": ai_json,
        "raw_contributions": contributions,
        "weights_used": weights
    }

    return output


# ---------- Node: ReAct Agent ----------
# Uses your tools: web_search, image_search, pgsql_query_structured, rag_tool
react_agent = create_react_agent(llm, tools=ALL_TOOLS)

def react_agent_node(state):
    query = (
        state.get("context", {}).get("query")
        or state.get("chart_type")
        or "analyze market data"
    )
    print("🔍 ReAct agent active for:", query)
    result = react_agent.invoke({"messages": [{"role": "user", "content": query}]})
    return {"agent_output": result["messages"][-1].content}


# ---------- Conditional Router ----------
def router(state):
    mode = (state.get("mode") or "insight").lower()
    query = str(state.get("context", {}).get("query", "")) + " " + str(state.get("chart_type", ""))

    if mode == "investment_score":
        return "generate_investment_score"
    if mode == "snapshot":
        return "generate_opportunity_snapshot"
    if any(x in query.lower() for x in ["image", "query", "transaction", "search", "sql"]):
        return "react_agent_node"
    elif mode == "narrative":
        return "generate_narrative"
    return "generate_insight"


# ---------- Build Graph ----------
def build_graph():
    graph = StateGraph(dict)

    graph.add_node("generate_insight", generate_insight)
    graph.add_node("generate_narrative", generate_narrative)
    graph.add_node("react_agent_node", react_agent_node)
    graph.add_node("generate_opportunity_snapshot", generate_opportunity_snapshot)
    graph.add_node("generate_investment_score", generate_investment_score)

    graph.add_conditional_edges(START, router)
    graph.add_edge("generate_insight", END)
    graph.add_edge("generate_narrative", END)
    graph.add_edge("react_agent_node", END)
    graph.add_edge("generate_opportunity_snapshot", END)
    graph.add_edge("generate_investment_score", END)

    return graph.compile()


insight_graph = build_graph()
