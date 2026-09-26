from typing import Any, Dict
from tools.base import BaseTool

class GeocodingTool(BaseTool):
    name = "geocoding"
    description = "Resolves location names into geographic coordinates"
    category = "maps"

    def run(self, location_name: str = "Sector 4", **kwargs) -> Dict[str, Any]:
        return {
            "location_name": location_name,
            "latitude": 18.5312,
            "longitude": 73.8445,
            "formatted_address": f"{location_name}, Metro Disaster Zone A"
        }
