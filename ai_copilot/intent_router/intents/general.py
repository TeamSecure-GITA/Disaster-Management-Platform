from typing import Dict, Any

class GeneralIntentHandler:
    def handle(self, slots: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "intent": "general",
            "suggested_actions": ["show_help", "list_capabilities"],
            "requires_tools": False
        }
