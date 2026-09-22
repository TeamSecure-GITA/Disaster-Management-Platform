"""
What-if scenario data models.

Defines intervention types, scenario inputs, and baseline configurations
used by the WhatIfEngine and comparison module.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional


# ============================================================
# Enumerations
# ============================================================

class InterventionType(str, Enum):
    """
    Actionable interventions whose impact can be modelled by WhatIfEngine.
    """

    PRE_POSITION_RESOURCES   = "pre_position_resources"
    EARLY_EVACUATION         = "early_evacuation"
    REINFORCE_INFRASTRUCTURE = "reinforce_infrastructure"
    DEPLOY_FLOOD_BARRIER     = "deploy_flood_barrier"
    INCREASE_WARNING_LEAD    = "increase_warning_lead"
    ADD_EVACUATION_CORRIDOR  = "add_evacuation_corridor"
    MEDICAL_SURGE_CAPACITY   = "medical_surge_capacity"
    NO_INTERVENTION          = "no_intervention"


class AnalysisStatus(str, Enum):
    """Execution status of a what-if analysis."""

    SUCCESS = "success"
    FAILED  = "failed"


# ============================================================
# Baseline scenario
# ============================================================

@dataclass
class BaselineScenario:
    """
    Baseline (no-intervention) state against which interventions are compared.

    Attributes:
        region: Region label.
        hazard_type: Primary hazard type string.
        intensity: Hazard intensity (0–1).
        population_at_risk: Exposed population.
        pre_warning_hours: Existing lead time.
        infrastructure_vulnerability: Current vulnerability (0–1).
        area_sqkm: Hazard footprint.
        active_evacuation_corridors: Count of currently open corridors.
        resource_pre_positioning_score: 0–1, 1 = fully pre-positioned.
        metadata: Arbitrary extra parameters.
    """

    region: str
    hazard_type: str
    intensity: float                        # 0.0 – 1.0
    population_at_risk: int
    pre_warning_hours: float = 6.0
    infrastructure_vulnerability: float = 0.5
    area_sqkm: float = 100.0
    active_evacuation_corridors: int = 2
    resource_pre_positioning_score: float = 0.3
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


# ============================================================
# Intervention scenario
# ============================================================

@dataclass
class InterventionParameter:
    """
    A single quantified parameter of an intervention.

    Examples:
        - InterventionParameter("warning_hours_added", 6.0)
        - InterventionParameter("barrier_efficiency", 0.70)
        - InterventionParameter("corridor_capacity_per_hour", 5000)
    """

    name: str
    value: float
    unit: str = ""
    description: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class WhatIfScenario:
    """
    A single what-if intervention scenario to analyse.

    Attributes:
        scenario_id: Unique identifier.
        name: Short human-readable label.
        intervention_type: Type of intervention being modelled.
        baseline: The baseline state before intervention.
        parameters: Quantified intervention parameters.
        description: Optional longer description.
        metadata: Arbitrary extra parameters.
    """

    scenario_id: str
    name: str
    intervention_type: InterventionType
    baseline: BaselineScenario
    parameters: List[InterventionParameter] = field(
        default_factory=list
    )
    description: str = ""
    metadata: Dict[str, Any] = field(default_factory=dict)

    def get_param(
        self,
        name: str,
        default: float = 0.0,
    ) -> float:
        """Retrieve a parameter value by name."""

        for p in self.parameters:
            if p.name == name:
                return p.value

        return default

    def to_dict(self) -> Dict[str, Any]:
        return {
            "scenario_id": self.scenario_id,
            "name": self.name,
            "intervention_type": self.intervention_type.value,
            "description": self.description,
            "baseline": self.baseline.to_dict(),
            "parameters": [p.to_dict() for p in self.parameters],
            "metadata": self.metadata,
        }


# ============================================================
# Public exports
# ============================================================

__all__ = [
    "InterventionType",
    "AnalysisStatus",
    "BaselineScenario",
    "InterventionParameter",
    "WhatIfScenario",
]
