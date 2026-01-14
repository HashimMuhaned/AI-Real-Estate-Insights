from fastapi import APIRouter, Body, Request
from controllers.chat_controllers import fetch_chat_messages
from utils.insights_graph import insight_graph

from pydantic import BaseModel
from typing import Any, Dict, List

class InsightRequest(BaseModel):
    chart_type: str
    context: Dict[Any, Any]
    data_summary: List[Dict[Any, Any]]
    detail_level: str = "short"
    mode: str = "insight"

router = APIRouter()

@router.get("/get-chat-messages/{user_id}")
def get_chat_messages(user_id: str):
    return fetch_chat_messages(user_id)


# @router.post("/generate/insights")
# async def generate_insights(
#     chart_type: str = Body(...),
#     context: dict = Body(...),
#     data_summary: dict = Body(...),
#     detail_level: str = Body("short"),
# ):
#     result = await generate_insight(chart_type, context, data_summary, detail_level)
#     return result

from typing import List, Dict, Any

# @router.post("/generate/insights")
# async def generate_insights(
#     chart_type: str = Body(...),
#     context: Dict[str, Any] = Body(...),
#     data_summary: List[Dict[str, Any]] = Body(None),
#     detail_level: str = Body("short"),
#     mode: str = Body("insight"),
# ):
#     """
#     Generate AI output for real estate analytics.
#     mode = "insight" → data-driven summary
#     mode = "narrative" → interpretive story-style explanation
#     """
#     try:
#         state = {
#             "chart_type": chart_type,
#             "context": context,
#             "data_summary": data_summary,
#             "detail_level": detail_level,
#             "mode": mode,
#         }

#         result = insight_graph.invoke(state)

#         if mode == "narrative":
#             return {"ai_narrative": result.get("narrative", "No narrative generated.")}
#         else:
#             return {"insight": result.get("insight", "No insight generated.")}
#     except Exception as e:
#         print("Error generating AI insight:", e)
#         return {"error": "Failed to generate AI insight"}


# @router.post("/debug/raw")
# async def debug_raw(request: Request):
#     raw = await request.body()
#     try:
#         parsed = await request.json()
#     except:
#         parsed = "❌ Could not parse JSON"

#     return {
#         "raw_bytes": raw.decode("utf-8", errors="ignore"),
#         "parsed_json": parsed
#     }


@router.post("/generate/insights")
async def generate_insights(request: InsightRequest):
    """
    Unified AI endpoint for insights, narratives, and tool-using agents.
    """
    try:
        state = {
            "chart_type": request.chart_type,
            "context": request.context,
            "data_summary": request.data_summary,
            "detail_level": request.detail_level,
            "mode": request.mode,
        }
        print("===================================== request", request)
        result = insight_graph.invoke(state)

        if request.mode == "narrative":
            return {"aiNarrative": result.get("narrative", "No narrative generated.")}
        elif "agent_output" in result:
            return {"agent_output": result["agent_output"]}
        elif request.mode == "snapshot":
            return {
                "snapshotVerdict": result.get("snapshot_verdict", "Neutral"),
                "snapshotReason": result.get("snapshot_reason", "")
            }
        elif request.mode == "investment_score":
            return {
                "score": result.get("score"),
                "label": result.get("label"),
                "drivers": result.get("drivers"),
                "ai_explanation": result.get("ai_explanation"),
            }
        else:
            return {"insight": result.get("insight", "No insight generated.")}
    except Exception as e:
        print("❌ AI generation error:", e)
        return {"error": f"Failed to generate AI insight: {str(e)}"}