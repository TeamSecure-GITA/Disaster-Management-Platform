from typing import Any, Dict
from tools.base import BaseTool

class SevereWeatherTool(BaseTool):
    name = "severe_weather"
    description = "Checks active severe weather advisories"
    category = "weather"

    def run(self, **kwargs) -> Dict[str, Any]:
        return {
            "alerts_active": True,
            "alert_type": "Flash Flood Warning & High Velocity Gale",
            "urgency": "Immediate",
            "severity": "Extreme"
        }
