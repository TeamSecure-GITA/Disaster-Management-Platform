from typing import Dict, Any

class EmergencyActionIntentHandler:
    def handle(self, slots: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "intent": "emergency_action",
            "action": slots.get("action", "broadcast_siren"),
            "target_tools": ["responder_dispatch", "incident_status"],
            "requires_tools": True,
            "requires_confirmation": True
        }
