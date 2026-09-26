from typing import List, Dict, Any

AUTONOMOUS_ALLOWLIST = [
    "current_weather", "weather_forecast", "sensor_status", "sensor_readings",
    "incident_search", "shelter_search", "shelter_capacity", "shelter_safety",
    "responder_search", "geocoding", "routing", "distance", "dashboard",
    "statistics", "trends", "ml_prediction", "risk_prediction"
]

CONFIRMATION_REQUIRED = [
    "evacuation_order", "responder_dispatch", "responder_assignment",
    "incident_creation", "broadcast_alert", "siren_activation"
]

class SafetyPolicy:
    def is_autonomous_allowed(self, tool_name: str) -> bool:
        return tool_name in AUTONOMOUS_ALLOWLIST

    def requires_confirmation(self, action_name: str) -> bool:
        return action_name in CONFIRMATION_REQUIRED
