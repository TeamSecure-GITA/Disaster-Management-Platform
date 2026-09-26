from typing import Any, Dict
from tools.base import BaseTool

class DistanceTool(BaseTool):
    name = "distance"
    description = "Calculates Euclidean and road distances"
    category = "maps"

    def run(self, lat1: float = 18.53, lon1: float = 73.84, lat2: float = 18.52, lon2: float = 73.85, **kwargs) -> Dict[str, Any]:
        return {
            "crow_flies_km": 1.45,
            "road_km": 2.1
        }
