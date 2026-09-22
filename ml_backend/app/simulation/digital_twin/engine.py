"""
Digital-twin physics simulation engine.

Implements the core computational logic for scenario runs:
    - Simplified Navier-Stokes inundation modelling
    - Structural fragility curves
    - Monte-Carlo casualty estimation with beta-distributed mortality

Imports data types from .entities and updates lifecycle state via
.state.ScenarioRegistry.
"""

from __future__ import annotations

import math
import random
import time
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from .entities import (
    BatchScenarioResult,
    InundationVector,
    ScenarioInput,
    ScenarioResult,
    ScenarioType,
    SimulationStatus,
    StructuralImpact,
)
from .state import ScenarioRegistry


# ============================================================
# Hazard-specific physics coefficients
# ============================================================

_HAZARD_COEFFICIENTS: Dict[str, Dict[str, float]] = {
    ScenarioType.FLOOD.value: {
        "mortality_rate":                  0.008,
        "displacement_multiplier":         50.0,
        "economic_intensity_usd_per_sqkm": 2_500_000.0,
        "critical_response_hours_base":    18.0,
        "inundation_depth_base_m":         1.5,
        "flood_velocity_base_ms":          0.8,
    },
    ScenarioType.CYCLONE.value: {
        "mortality_rate":                  0.012,
        "displacement_multiplier":         40.0,
        "economic_intensity_usd_per_sqkm": 4_000_000.0,
        "critical_response_hours_base":    12.0,
        "inundation_depth_base_m":         3.0,
        "flood_velocity_base_ms":          2.5,
    },
    ScenarioType.EARTHQUAKE.value: {
        "mortality_rate":                  0.025,
        "displacement_multiplier":         20.0,
        "economic_intensity_usd_per_sqkm": 8_000_000.0,
        "critical_response_hours_base":    6.0,
        "inundation_depth_base_m":         0.0,
        "flood_velocity_base_ms":          0.0,
    },
    ScenarioType.LANDSLIDE.value: {
        "mortality_rate":                  0.035,
        "displacement_multiplier":         15.0,
        "economic_intensity_usd_per_sqkm": 3_000_000.0,
        "critical_response_hours_base":    4.0,
        "inundation_depth_base_m":         0.0,
        "flood_velocity_base_ms":          0.0,
    },
    ScenarioType.WILDFIRE.value: {
        "mortality_rate":                  0.005,
        "displacement_multiplier":         30.0,
        "economic_intensity_usd_per_sqkm": 1_500_000.0,
        "critical_response_hours_base":    8.0,
        "inundation_depth_base_m":         0.0,
        "flood_velocity_base_ms":          0.0,
    },
    ScenarioType.COMPOUND.value: {
        "mortality_rate":                  0.045,
        "displacement_multiplier":         35.0,
        "economic_intensity_usd_per_sqkm": 6_000_000.0,
        "critical_response_hours_base":    5.0,
        "inundation_depth_base_m":         2.0,
        "flood_velocity_base_ms":          1.8,
    },
}

_DEFAULT_COEFF = _HAZARD_COEFFICIENTS[ScenarioType.FLOOD.value]

# Building fragility table: fraction of stock and base collapse probability.
_BUILDING_FRAGILITY = [
    {"class": "masonry",   "fraction": 0.40, "base_collapse": 0.30},
    {"class": "rcc",       "fraction": 0.35, "base_collapse": 0.10},
    {"class": "timber",    "fraction": 0.15, "base_collapse": 0.50},
    {"class": "temporary", "fraction": 0.10, "base_collapse": 0.80},
]

_BUILDINGS_PER_1000_POP = 250


# ============================================================
# Engine
# ============================================================

class DigitalTwinEngine:
    """
    Digital-twin physics simulation engine.

    Runs fast "what-if" scenario analyses using simplified physics models.
    Results are optionally persisted to an in-memory ScenarioRegistry for
    polling-based API access.

    Args:
        monte_carlo_samples: Number of Monte-Carlo draws for casualty estimation.
        random_seed: Optional seed for reproducible results.
        registry: Optional ScenarioRegistry; a default instance is created
            if not supplied.

    Example::

        engine = DigitalTwinEngine()
        result = engine.run_scenario(ScenarioInput(
            scenario_type=ScenarioType.CYCLONE,
            intensity=0.82,
            area_sqkm=350.0,
            population_at_risk=95000,
            infrastructure_fraction=0.60,
            region="Odisha Coast",
            pre_warning_hours=18.0,
        ))
        print(result.to_dict())
    """

    def __init__(
        self,
        monte_carlo_samples: int = 200,
        random_seed: Optional[int] = None,
        registry: Optional[ScenarioRegistry] = None,
    ):
        self.monte_carlo_samples = monte_carlo_samples
        self._rng = random.Random(random_seed)
        self.registry: ScenarioRegistry = registry or ScenarioRegistry()

    # --------------------------------------------------------
    # Public API
    # --------------------------------------------------------

    def run_scenario(
        self,
        scenario: ScenarioInput,
        scenario_id: Optional[str] = None,
    ) -> ScenarioResult:
        """
        Execute a single physics-based disaster scenario.

        The run is tracked in the ScenarioRegistry.

        Args:
            scenario: Scenario input parameters.
            scenario_id: Optional caller-supplied ID.

        Returns:
            ScenarioResult with full physics output.
        """

        sid = scenario_id or self._new_id(scenario.scenario_type.value)
        self.registry.submit(sid)
        self.registry.mark_running(sid)

        t_start = time.perf_counter()
        warnings: List[str] = []

        try:
            coeff = _HAZARD_COEFFICIENTS.get(
                scenario.scenario_type.value, _DEFAULT_COEFF
            )

            # --- Casualty estimation (Monte-Carlo) ---------------
            base_mortality = coeff["mortality_rate"] * scenario.intensity
            warning_reduction = min(
                0.70,
                0.12 * math.log1p(scenario.pre_warning_hours),
            )
            effective_mortality = base_mortality * (1.0 - warning_reduction)

            samples = self._mc_casualties(
                scenario.population_at_risk,
                effective_mortality,
                scenario.area_sqkm,
            )
            samples.sort()
            n = len(samples)
            p10 = samples[max(0, int(n * 0.10))]
            p50 = samples[int(n * 0.50)]
            p90 = samples[min(n - 1, int(n * 0.90))]

            displaced = min(
                int(
                    p50
                    * coeff["displacement_multiplier"]
                    * (0.5 + 0.5 * scenario.intensity)
                ),
                scenario.population_at_risk,
            )

            # --- Physics sub-models ------------------------------
            inundation = self._inundation(scenario, coeff)
            structural  = self._structural(scenario, coeff)

            # --- Economic impact ---------------------------------
            economic = (
                coeff["economic_intensity_usd_per_sqkm"]
                * scenario.area_sqkm
                * scenario.intensity
                * (1.0 + scenario.infrastructure_fraction * 0.80)
            )

            # --- Critical response window ------------------------
            critical_h = max(
                1.0,
                coeff["critical_response_hours_base"]
                / max(scenario.intensity, 0.01),
            )

            # --- Warnings ----------------------------------------
            if scenario.intensity > 0.90:
                warnings.append(
                    "Extreme intensity (>0.90): model confidence degraded."
                )

            if scenario.pre_warning_hours < 2.0:
                warnings.append(
                    "Pre-warning < 2 h: casualty estimates may be "
                    "significantly under-counted."
                )

            duration_ms = (time.perf_counter() - t_start) * 1000

            result = ScenarioResult(
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
                inundation_vectors=inundation,
                structural_impacts=structural,
                economic_impact_usd=economic,
                response_time_critical_hours=critical_h,
                simulation_duration_ms=duration_ms,
                simulated_at=datetime.now(timezone.utc).isoformat(),
                warnings=warnings,
            )

            self.registry.mark_success(sid, result)
            return result

        except Exception as exc:
            self.registry.mark_failed(sid, str(exc))
            raise

    def run_batch(
        self,
        scenarios: List[ScenarioInput],
        batch_id: Optional[str] = None,
    ) -> BatchScenarioResult:
        """
        Execute multiple scenarios and aggregate results.

        Args:
            scenarios: List of scenario inputs.
            batch_id: Optional caller-supplied batch ID.

        Returns:
            BatchScenarioResult with per-scenario detail and totals.
        """

        bid = batch_id or f"batch-{uuid.uuid4().hex[:8]}"
        results: List[ScenarioResult] = []
        failed = 0

        for i, s in enumerate(scenarios):
            try:
                r = self.run_scenario(s, scenario_id=f"{bid}-s{i+1}")
                results.append(r)
            except Exception:
                failed += 1

        worst_id = (
            max(results, key=lambda r: r.estimated_casualties).scenario_id
            if results else ""
        )

        return BatchScenarioResult(
            batch_id=bid,
            total_scenarios=len(scenarios),
            successful=len(results),
            failed=failed,
            results=results,
            highest_casualty_scenario_id=worst_id,
            total_estimated_casualties=sum(
                r.estimated_casualties for r in results
            ),
            total_economic_impact_usd=sum(
                r.economic_impact_usd for r in results
            ),
            executed_at=datetime.now(timezone.utc).isoformat(),
        )

    def health(self) -> Dict[str, Any]:
        """Return service liveness summary."""

        return {
            "service": "digital_twin_engine",
            "status": "ok",
            "monte_carlo_samples": self.monte_carlo_samples,
            "supported_scenarios": [s.value for s in ScenarioType],
            "registry": self.registry.summary(),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    # --------------------------------------------------------
    # Physics sub-models (private)
    # --------------------------------------------------------

    def _new_id(self, prefix: str) -> str:
        return f"{prefix}-{uuid.uuid4().hex[:10]}"

    def _mc_casualties(
        self,
        population: int,
        mortality_rate: float,
        area_sqkm: float,
    ) -> List[int]:
        """
        Monte-Carlo casualty sampling using beta-distributed mortality rates.

        The beta distribution captures empirical variance in disaster outcomes
        where ground-truth mortality deviates substantially from the mean.
        """

        if mortality_rate <= 0.0:
            return [0] * self.monte_carlo_samples

        alpha = max(0.5, mortality_rate * 10)
        beta  = max(0.5, (1.0 - mortality_rate) * 10)

        samples: List[int] = []
        density_factor = 1.0 / max(math.sqrt(area_sqkm / 100.0), 1.0)

        for _ in range(self.monte_carlo_samples):
            a = self._rng.gammavariate(alpha, 1.0)
            b = self._rng.gammavariate(beta, 1.0)
            rate = a / (a + b) if (a + b) > 0 else mortality_rate
            effective = min(rate * density_factor, 1.0)
            samples.append(int(population * effective))

        return samples

    def _inundation(
        self,
        scenario: ScenarioInput,
        coeff: Dict[str, float],
    ) -> List[InundationVector]:
        """
        Simplified Navier-Stokes continuity inundation model.

        Returns an empty list for hazards with no flooding component.
        """

        depth_base    = coeff.get("inundation_depth_base_m", 0.0)
        velocity_base = coeff.get("flood_velocity_base_ms", 0.0)

        if depth_base == 0.0:
            return []

        num_zones = min(5, max(3, int(scenario.area_sqkm / 50)))
        zone_area = scenario.area_sqkm / num_zones
        vectors: List[InundationVector] = []

        for i in range(num_zones):
            gradient = 1.0 - (i / num_zones) * 0.70
            depth = depth_base * scenario.intensity * gradient
            velocity = velocity_base * scenario.intensity * math.sqrt(
                max(depth / max(depth_base, 1e-6), 0.01)
            )
            vectors.append(InundationVector(
                zone_id=f"zone-{i+1}",
                max_depth_m=depth,
                area_sqkm=zone_area,
                flood_velocity_ms=velocity,
            ))

        return vectors

    def _structural(
        self,
        scenario: ScenarioInput,
        coeff: Dict[str, float],
    ) -> List[StructuralImpact]:
        """
        Apply fragility curves to estimate building damage by typology.
        """

        total_buildings = int(
            scenario.population_at_risk / 1000 * _BUILDINGS_PER_1000_POP
        )

        # Earthquake/landslide use full intensity; flood/fire use sqrt.
        if scenario.scenario_type in (
            ScenarioType.EARTHQUAKE,
            ScenarioType.LANDSLIDE,
            ScenarioType.COMPOUND,
        ):
            i_factor = scenario.intensity
        else:
            i_factor = math.sqrt(scenario.intensity)

        impacts: List[StructuralImpact] = []

        for b in _BUILDING_FRAGILITY:
            units = int(total_buildings * b["fraction"])
            collapse_prob = min(1.0, b["base_collapse"] * i_factor)
            collapsed = int(units * collapse_prob)
            damaged   = min(units - collapsed, int(collapsed * 1.5))

            impacts.append(StructuralImpact(
                building_class=b["class"],
                total_units=units,
                collapse_probability=collapse_prob,
                expected_collapsed=collapsed,
                expected_damaged=damaged,
            ))

        return impacts


# ============================================================
# Public exports
# ============================================================

__all__ = [
    "DigitalTwinEngine",
]
