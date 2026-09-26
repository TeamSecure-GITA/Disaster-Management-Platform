from typing import Any, Dict
from tools.base import BaseTool

class IncidentCreationTool(BaseTool):
    name = "incident_creation"
    description = "Registers a new disaster incident"
    category = "incidents"
    requires_confirmation = False

    def run(self, title: str = "Waterlogging", location: str = "Main Junction", **kwargs) -> Dict[str, Any]:
        return {
            "incident_id": "INC-2026-099",
            "title": title,
            "location": location,
            "status": "created",
            "priority": "P1"
        }
