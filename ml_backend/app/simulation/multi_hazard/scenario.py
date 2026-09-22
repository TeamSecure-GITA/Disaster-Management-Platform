"""
Multi-hazard cascade scenario data models.

Defines dataclasses and enumerations for cascade simulation inputs and
outputs.  No engine logic lives here; hazard_chain.py imports these types.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional


# ============================================================
# Enumerations
# ============================================================

class PrimaryHazard(str, Enum):
    """Recognised primary hazard types that can trigger cascade events."""

    FLOOD      = "flood"
    EARTHQUAKE = "earthquake"
    CYCLONE    = "cyclone"
    LANDSLIDE  = "landslide"
    WILDFIRE   = "wildfire"
    DROUGHT    = "drought"
    TSUNAMI    = "tsunami"
    INDUSTRIAL = "industrial"


class CascadeStatus(str, Enum):
    """Result status of a cascade simulation run."""

    SUCCESS  = "success"
    FAILED   = "failed"
    TIMEOUT  = "timeout"


# ============================================================
# Input models
# ============================================================

@dataclass
class HazardEvent:
    """
    A single hazard event (primary or secondary) in a cascade chain.

    Attributes:
        event_id: Unique identifier for this event.
        hazard_type: Type of hazard.
        intensity: Normalized intensity in [0.0, 1.0].
        region: Affected region label.
        onset_hour: Hours after T=0 when this event starts.
        duration_hours: How long the event persists.
        area_sqkm: Spatial footprint.
        population_exposed: Persons in the hazard footprint.
        is_primary: True for the triggering event; False for secondary.
        triggered_by: event_id of the parent hazard (for secondary events).
        metadata: Arbitrary additional attributes.
    """

    event_id: str
    hazard_type: PrimaryHazard
    intensity: float                    # 0.0 – 1.0
    region: str
    onset_hour: float = 0.0
    duration_hours: float = 12.0
    area_sqkm: float = 100.0
    population_exposed: int = 0
    is_primary: bool = True
    triggered_by: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        d["hazard_type"] = self.hazard_type.value
        return d


@dataclass
class CascadeSimConfig:
    """
    Configuration for a multi-hazard cascade simulation run.

    Attributes:
        primary_events: Initiating hazard event(s).
        region: Global region label for the scenario.
        simulation_hours: Total time window to simulate.
        time_step_hours: Resolution of each simulation step.
        enable_compound_amplification: Apply compounding risk boosts
            when multiple hazards overlap spatially and temporally.
        max_cascade_depth: Maximum chain depth to prevent infinite loops.
        metadata: Arbitrary extra parameters.
    """

    primary_events: List[HazardEvent]
    region: str
    simulation_hours: float = 72.0
    time_step_hours: float = 1.0
    enable_compound_amplification: bool = True
    max_cascade_depth: int = 4
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "primary_events": [e.to_dict() for e in self.primary_events],
            "region": self.region,
            "simulation_hours": self.simulation_hours,
            "time_step_hours": self.time_step_hours,
            "enable_compound_amplification": (
                self.enable_compound_amplification
            ),
            "max_cascade_depth": self.max_cascade_depth,
            "metadata": self.metadata,
        }


# ============================================================
# Output models
# ============================================================

@dataclass
class CascadeTimeStep:
    """State snapshot at a single simulation hour."""

    hour: float
    active_events: List[str]            # event_ids active at this hour
    total_population_at_risk: int
    compound_risk_score: float          # 0.0 – 100.0
    new_triggers: List[str]             # event_ids triggered in this step


@dataclass
class CascadeSimResult:
    """
    Complete output of a multi-hazard cascade simulation.

    Attributes:
        simulation_id: Unique run identifier.
        region: Target region.
        status: Execution status.
        primary_hazard: Type of the triggering hazard.
        total_events: Total hazard events (primary + secondary).
        cascade_depth_reached: Maximum chain depth actually reached.
        peak_compound_risk_score: Highest compound score across all steps.
        total_population_at_risk: Union of all exposed populations.
        secondary_events: Hazard events triggered by the cascade.
        timeline: Step-by-step state history.
        amplification_factor: Overall risk amplification vs. single hazard.
        requires_immediate_action: True when peak score ≥ threshold.
        simulated_at: UTC ISO-8601 timestamp.
        warnings: Non-fatal advisory messages.
    """

    simulation_id: str
    region: str
    status: CascadeStatus
    primary_hazard: str
    total_events: int
    cascade_depth_reached: int
    peak_compound_risk_score: float
    total_population_at_risk: int
    secondary_events: List[HazardEvent]
    timeline: List[CascadeTimeStep]
    amplification_factor: float
    requires_immediate_action: bool
    simulated_at: str
    warnings: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "simulation_id": self.simulation_id,
            "region": self.region,
            "status": self.status.value,
            "primary_hazard": self.primary_hazard,
            "total_events": self.total_events,
            "cascade_depth_reached": self.cascade_depth_reached,
            "peak_compound_risk_score": round(
                self.peak_compound_risk_score, 2
            ),
            "total_population_at_risk": self.total_population_at_risk,
            "amplification_factor": round(self.amplification_factor, 3),
            "requires_immediate_action": self.requires_immediate_action,
            "simulated_at": self.simulated_at,
            "warnings": self.warnings,
            "secondary_events": [
                e.to_dict() for e in self.secondary_events
            ],
            "timeline": [
                {
                    "hour": t.hour,
                    "active_events": t.active_events,
                    "total_population_at_risk": (
                        t.total_population_at_risk
                    ),
                    "compound_risk_score": round(
                        t.compound_risk_score, 2
                    ),
                    "new_triggers": t.new_triggers,
                }
                for t in self.timeline
            ],
        }


# ============================================================
# Public exports
# ============================================================

__all__ = [
    "PrimaryHazard",
    "CascadeStatus",
    "HazardEvent",
    "CascadeSimConfig",
    "CascadeSimResult",
    "CascadeTimeStep",
]
