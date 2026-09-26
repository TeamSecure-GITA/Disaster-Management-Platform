from typing import List, Dict, Any
from schemas.intent import IntentClassificationResult, IntentCategory

class ToolSelector:
    def select_tools(self, intent_result: IntentClassificationResult) -> List[str]:
        mapping = {
            IntentCategory.PREDICTION: ["ml_prediction", "weather_forecast"],
            IntentCategory.RISK: ["risk_prediction", "hazard_map"],
            IntentCategory.SHELTER: ["shelter_search", "shelter_capacity", "shelter_safety"],
            IntentCategory.RESPONDER: ["responder_search", "responder_status"],
            IntentCategory.EVACUATION: ["routing", "evacuation"],
            IntentCategory.INCIDENT: ["incident_search"],
            IntentCategory.ANALYTICS: ["dashboard", "statistics"],
            IntentCategory.SIMULATION: ["digital_twin", "scenario"],
            IntentCategory.EMERGENCY_ACTION: ["responder_dispatch"]
        }
        return mapping.get(intent_result.category, [])
