from typing import Any, Dict
from tools.base import BaseTool

class WhatIfSimulationTool(BaseTool):
    name = "what_if"
    description = "Simulates emergency management interventions"
    category = "simulation"

    def run(self, intervention: str = "open_spillway_200_cumecs", **kwargs) -> Dict[str, Any]:
        return {
            "intervention": intervention,
            "impact_on_reservoir_stage": "-0.6m over 4h",
            "downstream_warning_required": True
        }
