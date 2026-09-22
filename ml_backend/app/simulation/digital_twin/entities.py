"""
Digital-twin entity definitions.

Contains all dataclasses, enumerations, and value objects used by the
digital-twin simulation sub-system.  No business logic lives here; the
engine imports these types so they can also be imported by API schemas
without creating circular dependencies.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional


# ============================================================
# Enumerations
# ============================================================

class ScenarioType(str, Enum):
    """Supported disaster scenario types for the digital twin."""

    CYCLONE    = "cyclone"
    FLOOD      = "flood"
    EARTHQUAKE = "earthquake"
    LANDSLIDE  = "landslide"
    WILDFIRE   = "wildfire"
    COMPOUND   = "compound"


class SimulationStatus(str, Enum):
    """Execution/lifecycle status of a scenario run."""

    PENDING  = "pending"
    RUNNING  = "running"
    SUCCESS  = "success"
    FAILED   = "failed"
    PARTIAL  = "partial"
    CANCELLED = "cancelled"


# ============================================================
# Input model
# ============================================================

@dataclass
class ScenarioInput:
    """
    Input parameters for a single digital-twin scenario run.

    Attributes:
        scenario_type: Disaster type to simulate.
        intensity: Normalized hazard intensity in [0.0, 1.0].
        area_sqkm: Spatial footprint of the hazard event.
        population_at_risk: Persons within the impact zone.
        infrastructure_fraction: Fraction of critical infra exposed (0–1).
        region: Human-readable region label.
        latitude: Approximate centroid latitude (WGS-84).
        longitude: Approximate centroid longitude (WGS-84).
        duration_hours: Simulated event duration in hours.
        pre_warning_hours: Lead time available before hazard impact.
        metadata: Arbitrary extra parameters for the scenario.
    """

    scenario_type: ScenarioType
    intensity: float                    # 0.0 – 1.0
    area_sqkm: float
    population_at_risk: int
    infrastructure_fraction: float      # 0.0 – 1.0
    region: str = "unknown"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    duration_hours: float = 12.0
    pre_warning_hours: float = 6.0
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        d["scenario_type"] = self.scenario_type.value
        return d


# ============================================================
# Output sub-models
# ============================================================

@dataclass
class InundationVector:
    """
    Flood or storm-surge inundation extent for a geographic sub-zone.

    Attributes:
        zone_id: Identifier for the sub-zone (e.g. "zone-1").
        max_depth_m: Peak water depth in metres.
        area_sqkm: Area covered by this depth contour.
        flood_velocity_ms: Mean flow velocity in m/s.
    """

    zone_id: str
    max_depth_m: float
    area_sqkm: float
    flood_velocity_ms: float = 0.0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "zone_id": self.zone_id,
            "max_depth_m": round(self.max_depth_m, 3),
            "area_sqkm": round(self.area_sqkm, 3),
            "flood_velocity_ms": round(self.flood_velocity_ms, 4),
        }


@dataclass
class StructuralImpact:
    """
    Predicted structural damage for a homogeneous building class.

    Attributes:
        building_class: Construction typology label
            (e.g. "masonry", "rcc", "timber", "temporary").
        total_units: Total building count in this class.
        collapse_probability: Probability of complete collapse (0–1).
        expected_collapsed: Central estimate of fully collapsed units.
        expected_damaged: Estimate of partially damaged (non-collapsed) units.
    """

    building_class: str
    total_units: int
    collapse_probability: float
    expected_collapsed: int
    expected_damaged: int

    def to_dict(self) -> Dict[str, Any]:
        return {
            "building_class": self.building_class,
            "total_units": self.total_units,
            "collapse_probability": round(self.collapse_probability, 4),
            "expected_collapsed": self.expected_collapsed,
            "expected_damaged": self.expected_damaged,
        }


# ============================================================
# Top-level result
# ============================================================

@dataclass
class ScenarioResult:
    """
    Complete output of a digital-twin scenario simulation.

    Attributes:
        scenario_id: Unique run identifier.
        scenario_type: Hazard type that was simulated.
        region: Human-readable target region.
        status: Execution status of this run.
        intensity: Intensity used in this run.
        area_sqkm: Affected area.
        population_at_risk: Input population exposed to hazard.
        estimated_casualties: Median (P50) fatality estimate.
        casualty_range_low: 10th-percentile fatality bound.
        casualty_range_high: 90th-percentile fatality bound.
        displaced_persons: Estimated persons displaced from homes.
        inundation_vectors: Per-zone flood/surge depth profiles.
        structural_impacts: Per-building-class damage estimates.
        economic_impact_usd: Estimated total economic damage (USD).
        response_time_critical_hours: Hours until rescue window closes.
        simulation_duration_ms: Wall-clock run time in milliseconds.
        simulated_at: UTC ISO-8601 timestamp of execution.
        warnings: Non-fatal advisory messages from the physics model.
    """

    scenario_id: str
    scenario_type: str
    region: str
    status: SimulationStatus
    intensity: float
    area_sqkm: float
    population_at_risk: int
    estimated_casualties: int
    casualty_range_low: int
    casualty_range_high: int
    displaced_persons: int
    inundation_vectors: List[InundationVector]
    structural_impacts: List[StructuralImpact]
    economic_impact_usd: float
    response_time_critical_hours: float
    simulation_duration_ms: float
    simulated_at: str
    warnings: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "scenario_id": self.scenario_id,
            "scenario_type": self.scenario_type,
            "region": self.region,
            "status": self.status.value,
            "intensity": self.intensity,
            "area_sqkm": self.area_sqkm,
            "population_at_risk": self.population_at_risk,
            "casualties": {
                "estimated": self.estimated_casualties,
                "range_low": self.casualty_range_low,
                "range_high": self.casualty_range_high,
            },
            "displaced_persons": self.displaced_persons,
            "economic_impact_usd": round(self.economic_impact_usd, 2),
            "response_time_critical_hours": round(
                self.response_time_critical_hours, 2
            ),
            "simulation_duration_ms": round(self.simulation_duration_ms, 3),
            "simulated_at": self.simulated_at,
            "warnings": self.warnings,
            "inundation_vectors": [
                iv.to_dict() for iv in self.inundation_vectors
            ],
            "structural_impacts": [
                si.to_dict() for si in self.structural_impacts
            ],
        }


@dataclass
class BatchScenarioResult:
    """
    Aggregated output for a batch of digital-twin scenario runs.

    Attributes:
        batch_id: Unique batch identifier.
        total_scenarios: Number of scenarios submitted.
        successful: Scenarios that completed without error.
        failed: Scenarios that raised an exception.
        results: Individual ScenarioResult objects.
        highest_casualty_scenario_id: ID of the worst-case scenario.
        total_estimated_casualties: Sum of median casualties across runs.
        total_economic_impact_usd: Sum of economic impact across runs.
        executed_at: UTC ISO-8601 timestamp.
    """

    batch_id: str
    total_scenarios: int
    successful: int
    failed: int
    results: List[ScenarioResult]
    highest_casualty_scenario_id: str
    total_estimated_casualties: int
    total_economic_impact_usd: float
    executed_at: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "batch_id": self.batch_id,
            "total_scenarios": self.total_scenarios,
            "successful": self.successful,
            "failed": self.failed,
            "highest_casualty_scenario_id": (
                self.highest_casualty_scenario_id
            ),
            "total_estimated_casualties": self.total_estimated_casualties,
            "total_economic_impact_usd": round(
                self.total_economic_impact_usd, 2
            ),
            "executed_at": self.executed_at,
            "results": [r.to_dict() for r in self.results],
        }


# ============================================================
# Public exports
# ============================================================

__all__ = [
    "ScenarioType",
    "SimulationStatus",
    "ScenarioInput",
    "InundationVector",
    "StructuralImpact",
    "ScenarioResult",
    "BatchScenarioResult",
]
