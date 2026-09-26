from typing import Any, Dict
from tools.base import BaseTool

class CurrentWeatherTool(BaseTool):
    name = "current_weather"
    description = "Fetches real-time weather telemetry"
    category = "weather"

    def run(self, city: str = "Central Metro", **kwargs) -> Dict[str, Any]:
        return {
            "location": city,
            "temperature_c": 28.5,
            "precipitation_rate_mm_hr": 24.0,
            "wind_speed_kmh": 42.0,
            "humidity_pct": 96.0,
            "condition": "Heavy Monsoonal Downpour"
        }
