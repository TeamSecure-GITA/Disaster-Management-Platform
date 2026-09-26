from typing import Dict, Any

class RiskIntentHandler:
    def handle(self, slots: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        location = slots.get("location") or context.get("current_zone", "Region Central")
        return {
            "intent": "risk",
            "target_location": location,
            "target_tools": ["risk_prediction", "hazard_map"],
            "requires_tools": True
        }
