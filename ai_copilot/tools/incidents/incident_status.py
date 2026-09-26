from typing import Any, Dict
from tools.base import BaseTool

class IncidentStatusTool(BaseTool):
    name = "incident_status"
    description = "Updates or checks incident containment status"
    category = "incidents"

    def run(self, incident_id: str = "INC-2026-081", new_status: str = None, **kwargs) -> Dict[str, Any]:
        return {
            "incident_id": incident_id,
            "current_status": new_status or "active_rescue",
            "updated": True
        }
