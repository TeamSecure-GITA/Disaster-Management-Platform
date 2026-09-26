from typing import Dict, Any

class ShelterIntentHandler:
    def handle(self, slots: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "intent": "shelter",
            "target_tools": ["shelter_search", "shelter_capacity", "shelter_safety"],
            "requires_tools": True
        }
