from typing import Any, Dict
from tools.base import BaseTool

class ResponderDispatchTool(BaseTool):
    name = "responder_dispatch"
    description = "Dispatches emergency assets to coordinates"
    category = "responders"
    requires_confirmation = True

    def run(self, unit_id: str = "UNIT-SAR-01", target_location: str = "Sector 4", **kwargs) -> Dict[str, Any]:
        return {
            "dispatch_id": f"DISP-{unit_id}",
            "unit_id": unit_id,
            "target_location": target_location,
            "eta_minutes": 12,
            "priority": "HIGH"
        }
