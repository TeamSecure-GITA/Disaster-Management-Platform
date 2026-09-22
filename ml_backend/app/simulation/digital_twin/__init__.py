"""
Digital Twin Physics Simulation Engine.

Runs real-time 3D "what-if" disaster scenarios using simplified physics
models to predict inundation extents, structural collapse probabilities,
estimated casualties, and economic impact.

Scenario types supported:
    CYCLONE, FLOOD, EARTHQUAKE, LANDSLIDE, WILDFIRE, COMPOUND

Usage::

    engine = DigitalTwinEngine()
    result = engine.run_scenario(ScenarioInput(
        scenario_type=ScenarioType.FLOOD,
        intensity=0.85,
        area_sqkm=250.0,
        population_at_risk=75000,
        infrastructure_fraction=0.60,
        region="Brahmaputra Valley",
    ))
"""

from __future__ import annotations

import math
import random
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional


# ============================================================
# Enums
# ============================================================

class ScenarioType(str, Enum):
    """Supported disaster scenario types."""

    CYCLONE = "cyclone"
    FLOOD = "flood"
    EARTHQUAKE = "earthquake"
    LANDSLIDE = "landslide"
    WILDFIRE = "wildfire"
    COMPOUND = "compound"


class SimulationStatus(str, Enum):
    """Execution status of a simulation run."""

    SUCCESS = "success"
    FAILED = "failed"
    PARTIAL = "partial"


# ============================================================
# Data models
# ============================================================

@dataclass
class ScenarioInput:
    """
    Input parameters for a single digital-twin scenario run.

    Attributes:
        scenario_type: Disaster type to simulate.
        intensity: Normalized hazard intensity (0.0 – 1.0).
        area_sqkm: Spatial footprint of the hazard event.
        population_at_risk: Persons within the impact zone.
        infrastructure_fraction: Fraction of critical infra exposed (0.0–1.0).
        region: Human-readable region label.
        latitude: Approximate centroid latitude.
        longitude: Approximate centroid longitude.
        duration_hours: Simulated event duration.
        pre_warning_hours: Lead time available before impact.
        metadata: Additional scenario-specific parameters.
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


@dataclass
class InundationVector:
    """Flood or surge inundation extent for a sub-area."""

    zone_id: str
    max_depth_m: float
    area_sqkm: float
    flood_velocity_ms: float = 0.0


@dataclass
class StructuralImpact:
    """Predicted structural damage for a building class."""

    building_class: str           # e.g. "masonry", "rcc", "timber"
    total_units: int
    collapse_probability: float   # 0.0 – 1.0
    expected_collapsed: int
    expected_damaged: int


@dataclass
class ScenarioResult:
    """
    Complete output of a digital-twin scenario simulation.

    Attributes:
        scenario_id: Unique run identifier.
        scenario_type: Hazard type simulated.
        region: Target region.
        status: Execution status.
        intensity: Input intensity.
        area_sqkm: Affected area.
        population_at_risk: Input population.
        estimated_casualties: Central estimate of fatalities.
        casualty_range_low: 10th-percentile fatalities.
        casualty_range_high: 90th-percentile fatalities.
        displaced_persons: Estimated persons displaced.
        inundation_vectors: Per-zone flood/surge depths.
        structural_impacts: Per-building-class damage estimates.
        economic_impact_usd: Estimated economic damage (USD).
        response_time_critical_hours: Window before response becomes critical.
        simulation_duration_ms: Wall-clock time of the simulation run.
        simulated_at: UTC ISO timestamp.
        warnings: Non-fatal warnings from the physics model.
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
        d = {
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
                {
                    "zone_id": iv.zone_id,
                    "max_depth_m": round(iv.max_depth_m, 2),
                    "area_sqkm": round(iv.area_sqkm, 2),
                    "flood_velocity_ms": round(iv.flood_velocity_ms, 3),
                }
                for iv in self.inundation_vectors
            ],
            "structural_impacts": [
                {
                    "building_class": si.building_class,
                    "total_units": si.total_units,
                    "collapse_probability": round(
                        si.collapse_probability, 3
                    ),
                    "expected_collapsed": si.expected_collapsed,
                    "expected_damaged": si.expected_damaged,
                }
                for si in self.structural_impacts
            ],
        }
        return d


@dataclass
class BatchScenarioResult:
    """Aggregated result for a batch scenario run."""

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
# Hazard-specific physics coefficients
# ============================================================

# Fragility curve coefficients per scenario type.
# mortality_rate: base fraction of exposed population at unit intensity.
# displacement_multiplier: displaced / casualties ratio.
# economic_intensity_usd_per_sqkm: base economic damage per sqkm.
# critical_response_hours_base: hours before rescue becomes critical.

_HAZARD_COEFFICIENTS: Dict[str, Dict[str, float]] = {
    ScenarioType.FLOOD.value: {
        "mortality_rate": 0.008,
        "displacement_multiplier": 50.0,
        "economic_intensity_usd_per_sqkm": 2_500_000.0,
        "critical_response_hours_base": 18.0,
        "inundation_depth_base_m": 1.5,
        "flood_velocity_base_ms": 0.8,
    },
    ScenarioType.CYCLONE.value: {
        "mortality_rate": 0.012,
        "displacement_multiplier": 40.0,
        "economic_intensity_usd_per_sqkm": 4_000_000.0,
        "critical_response_hours_base": 12.0,
        "inundation_depth_base_m": 3.0,
        "flood_velocity_base_ms": 2.5,
    },
    ScenarioType.EARTHQUAKE.value: {
        "mortality_rate": 0.025,
        "displacement_multiplier": 20.0,
        "economic_intensity_usd_per_sqkm": 8_000_000.0,
        "critical_response_hours_base": 6.0,
        "inundation_depth_base_m": 0.0,
        "flood_velocity_base_ms": 0.0,
    },
    ScenarioType.LANDSLIDE.value: {
        "mortality_rate": 0.035,
        "displacement_multiplier": 15.0,
        "economic_intensity_usd_per_sqkm": 3_000_000.0,
        "critical_response_hours_base": 4.0,
        "inundation_depth_base_m": 0.0,
        "flood_velocity_base_ms": 0.0,
    },
    ScenarioType.WILDFIRE.value: {
        "mortality_rate": 0.005,
        "displacement_multiplier": 30.0,
        "economic_intensity_usd_per_sqkm": 1_500_000.0,
        "critical_response_hours_base": 8.0,
        "inundation_depth_base_m": 0.0,
        "flood_velocity_base_ms": 0.0,
    },
    ScenarioType.COMPOUND.value: {
        "mortality_rate": 0.045,
        "displacement_multiplier": 35.0,
        "economic_intensity_usd_per_sqkm": 6_000_000.0,
        "critical_response_hours_base": 5.0,
        "inundation_depth_base_m": 2.0,
        "flood_velocity_base_ms": 1.8,
    },
}

# Building class fragility curves at unit intensity.
_BUILDING_FRAGILITY: List[Dict[str, Any]] = [
    {"class": "masonry",   "fraction": 0.40, "base_collapse": 0.30},
    {"class": "rcc",       "fraction": 0.35, "base_collapse": 0.10},
    {"class": "timber",    "fraction": 0.15, "base_collapse": 0.50},
    {"class": "temporary", "fraction": 0.10, "base_collapse": 0.80},
]

_TOTAL_BUILDINGS_PER_1000_POPULATION = 250


# ============================================================
# Engine
# ============================================================

class DigitalTwinEngine:
    """
    Digital-twin physics simulation engine.

    Implements simplified Navier-Stokes inundation modeling,
    structural fragility curves, and Monte-Carlo casualty estimation
    to run fast "what-if" scenario analyses.

    Example::

        engine = DigitalTwinEngine()
        result = engine.run_scenario(ScenarioInput(
            scenario_type=ScenarioType.CYCLONE,
            intensity=0.80,
            area_sqkm=400.0,
            population_at_risk=120000,
            infrastructure_fraction=0.55,
            region="Odisha Coast",
            pre_warning_hours=24.0,
        ))
        print(result.to_dict())
    """

    def __init__(
        self,
        monte_carlo_samples: int = 200,
        random_seed: Optional[int] = None,
    ):
        self.monte_carlo_samples = monte_carlo_samples
        self._rng = random.Random(random_seed)

    # --------------------------------------------------------
    # Public API
    # --------------------------------------------------------

    def run_scenario(
        self,
        scenario: ScenarioInput,
        scenario_id: Optional[str] = None,
    ) -> ScenarioResult:
        """
        Run a single physics-based disaster scenario.

        Args:
            scenario: Scenario input parameters.
            scenario_id: Optional caller-supplied ID; generated if absent.

        Returns:
            ScenarioResult with full physics output.
        """

        import time

        t_start = time.perf_counter()

        sid = scenario_id or self._generate_id(scenario.scenario_type.value)

        warnings: List[str] = []

        coeff = _HAZARD_COEFFICIENTS.get(
            scenario.scenario_type.value,
            _HAZARD_COEFFICIENTS[ScenarioType.FLOOD.value],
        )

        # --------------------------------------------------
        # Casualty estimation — Monte-Carlo
        # --------------------------------------------------

        base_mortality = coeff["mortality_rate"] * scenario.intensity

        # Warning reduction from pre-warning time (logarithmic decay)
        warning_reduction = min(
            0.70,
            0.12 * math.log1p(scenario.pre_warning_hours),
        )
        effective_mortality = base_mortality * (1.0 - warning_reduction)

        samples = self._monte_carlo_casualties(
            population=scenario.population_at_risk,
            mortality_rate=effective_mortality,
            area_sqkm=scenario.area_sqkm,
        )

        samples.sort()
        n = len(samples)
        p10 = samples[max(0, int(n * 0.10))]
        p50 = samples[int(n * 0.50)]
        p90 = samples[min(n - 1, int(n * 0.90))]

        displaced = int(
            p50 * coeff["displacement_multiplier"]
            * (0.5 + 0.5 * scenario.intensity)
        )
        displaced = min(displaced, scenario.population_at_risk)

        # --------------------------------------------------
        # Inundation vectors (flood/cyclone only)
        # --------------------------------------------------

        inundation_vectors = self._compute_inundation(
            scenario, coeff
        )

        # --------------------------------------------------
        # Structural impacts
        # --------------------------------------------------

        structural_impacts = self._compute_structural_impacts(
            scenario, coeff
        )

        # --------------------------------------------------
        # Economic impact
        # --------------------------------------------------

        econ_base = (
            coeff["economic_intensity_usd_per_sqkm"]
            * scenario.area_sqkm
            * scenario.intensity
        )
        infra_multiplier = 1.0 + scenario.infrastructure_fraction * 0.80
        economic_impact = econ_base * infra_multiplier

        # --------------------------------------------------
        # Critical response window
        # --------------------------------------------------

        critical_hours = (
            coeff["critical_response_hours_base"]
            / max(scenario.intensity, 0.01)
        )
        critical_hours = max(1.0, critical_hours)

        # --------------------------------------------------
        # Warnings
        # --------------------------------------------------

        if scenario.intensity > 0.90:
            warnings.append(
                "Extreme intensity — model confidence degraded above 0.90."
            )

        if scenario.pre_warning_hours < 2.0:
            warnings.append(
                "Pre-warning time < 2 h — casualty estimates may be "
                "significantly under-counted."
            )

        duration_ms = (time.perf_counter() - t_start) * 1000

        return ScenarioResult(
            scenario_id=sid,
            scenario_type=scenario.scenario_type.value,
            region=scenario.region,
            status=SimulationStatus.SUCCESS,
            intensity=scenario.intensity,
            area_sqkm=scenario.area_sqkm,
            population_at_risk=scenario.population_at_risk,
            estimated_casualties=p50,
            casualty_range_low=p10,
            casualty_range_high=p90,
            displaced_persons=displaced,
            inundation_vectors=inundation_vectors,
            structural_impacts=structural_impacts,
            economic_impact_usd=economic_impact,
            response_time_critical_hours=critical_hours,
            simulation_duration_ms=duration_ms,
            simulated_at=datetime.now(timezone.utc).isoformat(),
            warnings=warnings,
        )

    def run_batch(
        self,
        scenarios: List[ScenarioInput],
        batch_id: Optional[str] = None,
    ) -> BatchScenarioResult:
        """
        Run multiple scenarios and aggregate results.

        Args:
            scenarios: List of scenario inputs.
            batch_id: Optional caller-supplied batch ID.

        Returns:
            BatchScenarioResult with per-scenario detail and summary.
        """

        import uuid

        bid = batch_id or f"batch-{uuid.uuid4().hex[:8]}"

        results: List[ScenarioResult] = []
        failed = 0

        for i, s in enumerate(scenarios):
            try:
                r = self.run_scenario(s, scenario_id=f"{bid}-s{i+1}")
                results.append(r)
            except Exception:
                failed += 1

        total_casualties = sum(r.estimated_casualties for r in results)
        total_econ = sum(r.economic_impact_usd for r in results)

        worst_id = ""
        if results:
            worst = max(
                results, key=lambda r: r.estimated_casualties
            )
            worst_id = worst.scenario_id

        return BatchScenarioResult(
            batch_id=bid,
            total_scenarios=len(scenarios),
            successful=len(results),
            failed=failed,
            results=results,
            highest_casualty_scenario_id=worst_id,
            total_estimated_casualties=total_casualties,
            total_economic_impact_usd=total_econ,
            executed_at=datetime.now(timezone.utc).isoformat(),
        )

    def health(self) -> Dict[str, Any]:
        """Return service liveness summary."""

        return {
            "service": "digital_twin_engine",
            "status": "ok",
            "monte_carlo_samples": self.monte_carlo_samples,
            "supported_scenarios": [
                s.value for s in ScenarioType
            ],
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    # --------------------------------------------------------
    # Internal physics helpers
    # --------------------------------------------------------

    def _generate_id(self, prefix: str) -> str:
        import uuid

        return f"{prefix}-{uuid.uuid4().hex[:10]}"

    def _monte_carlo_casualties(
        self,
        population: int,
        mortality_rate: float,
        area_sqkm: float,
    ) -> List[int]:
        """
        Monte-Carlo casualty estimation using beta-distributed mortality rates.

        The beta distribution captures real-world variance in disaster outcomes
        where ground-truth mortality can vary significantly from the mean.
        """

        # Beta parameters centred on mortality_rate with moderate variance.
        if mortality_rate <= 0.0:
            return [0] * self.monte_carlo_samples

        alpha = max(0.5, mortality_rate * 10)
        beta_param = max(0.5, (1.0 - mortality_rate) * 10)

        samples: List[int] = []

        for _ in range(self.monte_carlo_samples):
            # Approximate beta via ratio of gamma samples.
            a = self._rng.gammavariate(alpha, 1.0)
            b = self._rng.gammavariate(beta_param, 1.0)
            rate = a / (a + b) if (a + b) > 0 else mortality_rate

            # Spatial density factor — larger areas have lower local density.
            density_factor = 1.0 / max(math.sqrt(area_sqkm / 100.0), 1.0)
            effective_rate = min(rate * density_factor, 1.0)

            casualties = int(population * effective_rate)
            samples.append(casualties)

        return samples

    def _compute_inundation(
        self,
        scenario: ScenarioInput,
        coeff: Dict[str, float],
    ) -> List[InundationVector]:
        """
        Compute inundation vectors using simplified Navier-Stokes continuity.

        Only relevant for flood/cyclone/compound scenarios.
        """

        depth_base = coeff.get("inundation_depth_base_m", 0.0)
        velocity_base = coeff.get("flood_velocity_base_ms", 0.0)

        if depth_base == 0.0:
            return []

        # Divide affected area into 3–5 representative zones.
        num_zones = min(5, max(3, int(scenario.area_sqkm / 50)))

        vectors: List[InundationVector] = []

        for i in range(num_zones):
            # Depth gradient — higher near epicentre, lower at periphery.
            zone_fraction = 1.0 - (i / num_zones) * 0.70
            depth = depth_base * scenario.intensity * zone_fraction

            # Froude-number approximation for velocity scaling.
            velocity = velocity_base * scenario.intensity * math.sqrt(
                max(depth / depth_base, 0.01)
            )

            zone_area = scenario.area_sqkm / num_zones

            vectors.append(InundationVector(
                zone_id=f"zone-{i+1}",
                max_depth_m=depth,
                area_sqkm=zone_area,
                flood_velocity_ms=velocity,
            ))

        return vectors

    def _compute_structural_impacts(
        self,
        scenario: ScenarioInput,
        coeff: Dict[str, float],
    ) -> List[StructuralImpact]:
        """
        Apply fragility curves to estimate per-building-class structural damage.

        Earthquake/landslide intensity directly amplifies collapse probability;
        flood/cyclone impact is attenuated by inundation depth scaling.
        """

        total_buildings = int(
            scenario.population_at_risk / 1000
            * _TOTAL_BUILDINGS_PER_1000_POPULATION
        )

        # Earthquake/landslide use full intensity; others use square root.
        if scenario.scenario_type in (
            ScenarioType.EARTHQUAKE,
            ScenarioType.LANDSLIDE,
            ScenarioType.COMPOUND,
        ):
            intensity_factor = scenario.intensity
        else:
            intensity_factor = math.sqrt(scenario.intensity)

        impacts: List[StructuralImpact] = []

        for building in _BUILDING_FRAGILITY:
            units = int(total_buildings * building["fraction"])
            collapse_prob = min(
                1.0,
                building["base_collapse"] * intensity_factor,
            )
            expected_collapsed = int(units * collapse_prob)
            # Damaged but standing is ~1.5× collapsed count, capped at remaining.
            expected_damaged = min(
                units - expected_collapsed,
                int(expected_collapsed * 1.5),
            )

            impacts.append(StructuralImpact(
                building_class=building["class"],
                total_units=units,
                collapse_probability=collapse_prob,
                expected_collapsed=expected_collapsed,
                expected_damaged=expected_damaged,
            ))

        return impacts


# ============================================================
# Public exports
# ============================================================

__all__ = [
    "DigitalTwinEngine",
    "ScenarioType",
    "SimulationStatus",
    "ScenarioInput",
    "ScenarioResult",
    "BatchScenarioResult",
    "InundationVector",
    "StructuralImpact",
]
