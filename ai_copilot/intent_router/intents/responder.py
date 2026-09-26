from typing import Dict, Any

class ResponderIntentHandler:
    def handle(self, slots: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "intent": "responder",
            "target_tools": ["responder_search", "responder_status", "responder_assignment"],
            "requires_tools": True,
            "requires_confirmation": True
        }
