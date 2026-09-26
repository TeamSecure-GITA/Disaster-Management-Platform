from typing import Any, Dict
from tools.base import BaseTool

class HazardMapTool(BaseTool):
    name = "hazard_map"
    description = "Generates GeoJSON overlay for hazard perimeter"
    category = "maps"

    def run(self, hazard_type: str = "flood", **kwargs) -> Dict[str, Any]:
        return {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[[73.84, 18.52], [73.86, 18.52], [73.86, 18.54], [73.84, 18.54], [73.84, 18.52]]]
                    },
                    "properties": {
                        "hazard": hazard_type,
                        "depth_meters": 1.8,
                        "severity": "critical"
                    }
                }
            ]
        }
