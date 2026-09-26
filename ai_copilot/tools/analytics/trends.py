from typing import Any, Dict
from tools.base import BaseTool

class TrendsTool(BaseTool):
    name = "trends"
    description = "Hourly trend data for disaster progression"
    category = "analytics"

    def run(self, metric: str = "river_level", **kwargs) -> Dict[str, Any]:
        return {
            "metric": metric,
            "timestamps": ["T-2h", "T-1h", "NOW"],
            "values": [5.5, 6.1, 6.8]
        }
