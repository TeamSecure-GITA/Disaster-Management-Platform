from typing import Dict, Any

class HumanConfirmationManager:
    def generate_confirmation_ticket(self, action_type: str, details: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "action_type": action_type,
            "requires_confirmation": True,
            "details": details,
            "confirmation_prompt": f"WARNING: You are about to authorize [{action_type}]. Please confirm this critical order."
        }
