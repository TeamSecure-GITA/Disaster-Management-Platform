from typing import Any, Dict, List
from tools.base import BaseTool

class IncidentSearchTool(BaseTool):
    name = "incident_search"
    description = "Searches ongoing disaster incidents"
    category = "incidents"

    def run(self, status: str = "active", **kwargs) -> List[Dict[str, Any]]:
        return [
            {
                "incident_id": "INC-2026-081",
                "hazard": "Bridge submerged",
                "location": "North River Crossing",
                "severity": "critical",
                "status": "in_progress",
                "trapped_persons": 14
            }
        ]
