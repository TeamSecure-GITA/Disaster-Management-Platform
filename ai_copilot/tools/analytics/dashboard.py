from typing import Any, Dict
from tools.base import BaseTool

class DashboardTool(BaseTool):
    name = "dashboard"
    description = "Command center summary KPIs"
    category = "analytics"

    def run(self, **kwargs) -> Dict[str, Any]:
        return {
            "active_incidents": 12,
            "rescued_persons": 340,
            "units_deployed": 18,
            "open_shelters": 6,
            "inundated_area_sq_km": 42.5
        }
