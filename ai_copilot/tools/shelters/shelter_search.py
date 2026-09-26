from typing import Any, Dict, List
from tools.base import BaseTool

class ShelterSearchTool(BaseTool):
    name = "shelter_search"
    description = "Finds designated emergency relief shelters"
    category = "shelters"

    def run(self, radius_km: float = 10.0, **kwargs) -> List[Dict[str, Any]]:
        return [
            {
                "shelter_id": "SH-CENTRAL-01",
                "name": "City Sports Complex & Relief Hub",
                "capacity": 1500,
                "current_occupancy": 640,
                "distance_km": 3.2,
                "has_medical": True
            }
        ]
