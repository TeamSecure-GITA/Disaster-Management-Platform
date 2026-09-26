from typing import Any, Dict
from tools.base import BaseTool

class WeatherForecastTool(BaseTool):
    name = "weather_forecast"
    description = "Retrieves upcoming rainfall and storm timeline"
    category = "weather"

    def run(self, days: int = 3, **kwargs) -> Dict[str, Any]:
        return {
            "forecast_days": days,
            "accumulated_rain_mm": 185.0,
            "peak_intensity_window": "Tonight 22:00 - Tomorrow 06:00",
            "warning": "Red Alert issued by Meteorological Department"
        }
