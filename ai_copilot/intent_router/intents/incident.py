from typing import Dict, Any

class IncidentIntentHandler:
    def handle(self, slots: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        action_type = slots.get("action", "search")
        return {
            "intent": "incident",
            "action_type": action_type,
            "target_tools": ["incident_search" if action_type == "search" else "incident_creation"],
            "requires_tools": True
        }
