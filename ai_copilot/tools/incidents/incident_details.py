from typing import Any, Dict
from tools.base import BaseTool

class IncidentDetailsTool(BaseTool):
    name = "incident_details"
    description = "Gets deep telemetry and responder logs for an incident"
    category = "incidents"

    def run(self, incident_id: str = "INC-2026-081", **kwargs) -> Dict[str, Any]:
        return {
            "incident_id": incident_id,
            "commander": "Captain S. Verma",
            "units_assigned": ["SAR-Team-2", "Boat-Squadron-4"],
            "triage_notes": "Awaiting heavy rescue inflatables."
        }
