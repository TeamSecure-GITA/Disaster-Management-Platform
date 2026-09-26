from typing import Dict, Any

class SimulationIntentHandler:
    def handle(self, slots: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        scenario_id = slots.get("scenario", "dam_breach_heavy_monsoon")
        return {
            "intent": "simulation",
            "scenario": scenario_id,
            "target_tools": ["digital_twin", "scenario", "what_if"],
            "requires_tools": True
        }
