from typing import Any, Dict
from tools.base import BaseTool

class HazardPredictionTool(BaseTool):
    name = "hazard_prediction"
    description = "Forecasts hazard trajectory and impact perimeter"
    category = "prediction"

    def run(self, hazard: str = "cyclone", hours_ahead: int = 24, **kwargs) -> Dict[str, Any]:
        return {
            "hazard": hazard,
            "forecast_lead_hours": hours_ahead,
            "projected_category": "Cat-3 Severe",
            "estimated_landfall": "Tomorrow 14:00 IST",
            "wind_speed_kmh": 140
        }
