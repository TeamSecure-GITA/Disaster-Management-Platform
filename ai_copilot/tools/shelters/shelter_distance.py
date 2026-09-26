from typing import Any, Dict
from tools.base import BaseTool

class ShelterDistanceTool(BaseTool):
    name = "shelter_distance"
    description = "Calculates transit time and route safety to shelter"
    category = "shelters"

    def run(self, origin: str = "Sector 4", shelter_id: str = "SH-CENTRAL-01", **kwargs) -> Dict[str, Any]:
        return {
            "origin": origin,
            "shelter_id": shelter_id,
            "distance_km": 4.1,
            "estimated_transit_time_min": 15,
            "route_clear": True
        }
