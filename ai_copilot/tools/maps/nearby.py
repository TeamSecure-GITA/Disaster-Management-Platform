from typing import Any, Dict, List
from tools.base import BaseTool

class NearbyFacilitiesTool(BaseTool):
    name = "nearby"
    description = "Finds hospitals, helipads, and supply depots"
    category = "maps"

    def run(self, facility_type: str = "hospital", **kwargs) -> List[Dict[str, Any]]:
        return [
            {"name": "District General Hospital", "distance_km": 2.4, "icu_beds": 32, "power": "generator_online"}
        ]
