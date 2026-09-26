from typing import Any, Dict
from tools.base import BaseTool

class ResponderAssignmentTool(BaseTool):
    name = "responder_assignment"
    description = "Assigns emergency units to an incident"
    category = "responders"
    requires_confirmation = True

    def run(self, unit_id: str = "UNIT-SAR-01", incident_id: str = "INC-2026-081", **kwargs) -> Dict[str, Any]:
        return {
            "assignment_id": f"ASN-{unit_id}-{incident_id}",
            "unit_id": unit_id,
            "incident_id": incident_id,
            "status": "dispatched"
        }
