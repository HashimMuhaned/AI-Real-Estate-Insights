from langchain_core.messages import ToolMessage
import json

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


def _safe(s: str) -> str:
    return (
        s.replace("\\", "\\\\")
        .replace('"', '\\"')
        .replace("'", "\\'")
        .replace("\n", "\\n")
    )