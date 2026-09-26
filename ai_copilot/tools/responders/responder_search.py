from typing import Any, Dict, List
from tools.base import BaseTool

class ResponderSearchTool(BaseTool):
    name = "responder_search"
    description = "Finds ready response teams"
    category = "responders"

    def run(self, unit_type: str = "SAR", **kwargs) -> List[Dict[str, Any]]:
        return [
            {"unit_id": "UNIT-SAR-01", "name": "NDRF Delta Battalion", "readiness": "ready", "personnel": 24}
        ]
