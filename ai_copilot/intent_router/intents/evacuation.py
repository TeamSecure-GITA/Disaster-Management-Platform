from typing import Dict, Any

class EvacuationIntentHandler:
    def handle(self, slots: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        zone = slots.get("zone", "Zone 3")
        return {
            "intent": "evacuation",
            "evacuation_zone": zone,
            "target_tools": ["routing", "nearby", "evacuation"],
            "requires_tools": True,
            "requires_confirmation": True
        }
