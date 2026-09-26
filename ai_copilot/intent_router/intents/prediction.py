from typing import Dict, Any

class PredictionIntentHandler:
    def handle(self, slots: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        hazard = slots.get("hazard_type", "flood")
        horizon = slots.get("forecast_hours", 24)
        return {
            "intent": "prediction",
            "hazard_type": hazard,
            "forecast_hours": horizon,
            "target_tools": ["ml_prediction", "weather_forecast"],
            "requires_tools": True
        }
