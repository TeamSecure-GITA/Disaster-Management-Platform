from typing import Any, Dict
from tools.base import BaseTool

class ResponderStatusTool(BaseTool):
    name = "responder_status"
    description = "Gets GPS and operational status of a responder unit"
    category = "responders"

    def run(self, unit_id: str = "UNIT-SAR-01", **kwargs) -> Dict[str, Any]:
        return {
            "unit_id": unit_id,
            "lat": 18.5204,
            "lon": 73.8567,
            "status": "ready_for_dispatch",
            "equipment": ["Heavy Winch", "Inflatable Zodiacs"]
        }
