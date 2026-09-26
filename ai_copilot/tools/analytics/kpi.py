from typing import Any, Dict
from tools.base import BaseTool

class KPITool(BaseTool):
    name = "kpi"
    description = "Response time and operational efficacy KPIs"
    category = "analytics"

    def run(self, **kwargs) -> Dict[str, Any]:
        return {
            "mean_response_time_minutes": 14.2,
            "dispatch_to_scene_minutes": 8.1,
            "shelter_allocation_latency_sec": 3.4
        }
