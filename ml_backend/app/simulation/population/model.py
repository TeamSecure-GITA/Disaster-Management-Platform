"""
Population dynamics simulation model.

Models how an affected population evolves over time across three phases:
    1. Impact phase   — immediate displacement and mortality
    2. Crisis phase   — shelter demand surge, food/water scarcity
    3. Recovery phase — population return, mortality deceleration

Uses ExposureZone records (exposure.py) and VulnerabilityIndex values
(vulnerability.py) to produce a time-series of population states.
"""

from __future__ import annotations

import math
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from .exposure import ExposureMetrics, ExposureZone, compute_exposure_metrics
from .vulnerability import VulnerabilityIndex, default_vulnerability


# ============================================================
# Configuration
# ============================================================

@dataclass
class PopulationSimConfig:
    """
    Configuration for a single population dynamics simulation run.

    Attributes:
        zones: Exposure zones to model.
        vulnerability_indices: Per-zone vulnerability indices; a default
            index is generated for any zone without an explicit entry.
        hazard_intensity: Overall hazard intensity (0–1).
        hazard_type: String hazard type label.
        simulation_days: Total days to simulate.
        time_step_days: Simulation step resolution (days).
        region: Human-readable region label.
    """

    zones: List[ExposureZone]
    vulnerability_indices: List[VulnerabilityIndex] = field(
        default_factory=list
    )
    hazard_intensity: float = 0.70
    hazard_type: str = "flood"
    simulation_days: int = 30
    time_step_days: float = 1.0
    region: str = "unknown"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "region": self.region,
            "hazard_type": self.hazard_type,
            "hazard_intensity": self.hazard_intensity,
            "total_zones": len(self.zones),
            "simulation_days": self.simulation_days,
            "time_step_days": self.time_step_days,
        }


# ============================================================
# Result models
# ============================================================

@dataclass
class PopulationTimeStep:
    """Population state at a single simulation step."""

    day: float
    alive_in_place: int         # Persons remaining in their homes
    displaced: int              # Persons in temporary shelter
    recovered: int              # Persons who have returned home
    cumulative_deaths: int      # Total fatalities up to this day
    shelter_demand: int         # Persons needing public shelter capacity
    food_water_need_persons: int


@dataclass
class PopulationSimResult:
    """
    Complete output of a population dynamics simulation.

    Attributes:
        simulation_id: Unique run identifier.
        region: Target region.
        hazard_type: Hazard type simulated.
        hazard_intensity: Input intensity.
        total_initial_population: Sum of all zone populations.
        peak_displacement: Maximum simultaneous displaced persons.
        peak_displacement_day: Day on which peak displacement occurs.
        total_mortality: Final cumulative death estimate.
        mortality_rate_pct: Crude mortality rate as percentage.
        peak_shelter_demand: Maximum shelter capacity needed.
        days_to_50pct_recovery: Days until 50 % of displaced return home.
        exposure_metrics: Aggregated exposure summary.
        timeline: Day-by-day population state history.
        simulated_at: UTC ISO-8601 timestamp.
    """

    simulation_id: str
    region: str
    hazard_type: str
    hazard_intensity: float
    total_initial_population: int
    peak_displacement: int
    peak_displacement_day: float
    total_mortality: int
    mortality_rate_pct: float
    peak_shelter_demand: int
    days_to_50pct_recovery: Optional[float]
    exposure_metrics: ExposureMetrics
    timeline: List[PopulationTimeStep]
    simulated_at: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "simulation_id": self.simulation_id,
            "region": self.region,
            "hazard_type": self.hazard_type,
            "hazard_intensity": self.hazard_intensity,
            "total_initial_population": self.total_initial_population,
            "peak_displacement": self.peak_displacement,
            "peak_displacement_day": self.peak_displacement_day,
            "total_mortality": self.total_mortality,
            "mortality_rate_pct": round(self.mortality_rate_pct, 3),
            "peak_shelter_demand": self.peak_shelter_demand,
            "days_to_50pct_recovery": self.days_to_50pct_recovery,
            "exposure_metrics": self.exposure_metrics.to_dict(),
            "simulated_at": self.simulated_at,
            "timeline": [
                {
                    "day": t.day,
                    "alive_in_place": t.alive_in_place,
                    "displaced": t.displaced,
                    "recovered": t.recovered,
                    "cumulative_deaths": t.cumulative_deaths,
                    "shelter_demand": t.shelter_demand,
                    "food_water_need_persons": t.food_water_need_persons,
                }
                for t in self.timeline
            ],
        }


# ============================================================
# Engine
# ============================================================

class PopulationSimEngine:
    """
    Population dynamics simulation engine.

    Models three-phase disaster population evolution:
        - Impact: rapid displacement and initial mortality surge
        - Crisis: slow displacement increase, chronic mortality
        - Recovery: exponential return-home, mortality deceleration

    Args:
        base_mortality_rate: Crude mortality fraction at intensity 1.0.
        displacement_rate: Initial fraction displaced at intensity 1.0.
        recovery_half_life_days: Characteristic recovery time (half-life).

    Example::

        engine = PopulationSimEngine()
        config = PopulationSimConfig(
            zones=[ExposureZone(
                zone_id="z1", name="River Basin", latitude=26.1,
                longitude=91.7, area_sqkm=180.0,
                demographics=DemographicBreakdown(total=60000),
                hazard_intensity=0.75,
            )],
            hazard_intensity=0.75,
            hazard_type="flood",
            simulation_days=21,
        )
        result = engine.simulate(config)
    """

    def __init__(
        self,
        base_mortality_rate: float = 0.008,
        displacement_rate: float = 0.35,
        recovery_half_life_days: float = 14.0,
    ):
        self.base_mortality_rate = base_mortality_rate
        self.displacement_rate = displacement_rate
        self.recovery_half_life_days = recovery_half_life_days

    # --------------------------------------------------------
    # Public API
    # --------------------------------------------------------

    def simulate(
        self,
        config: PopulationSimConfig,
        simulation_id: Optional[str] = None,
    ) -> PopulationSimResult:
        """
        Run the population dynamics simulation.

        Args:
            config: Simulation configuration.
            simulation_id: Optional caller-supplied ID.

        Returns:
            PopulationSimResult with full timeline.
        """

        sid = simulation_id or f"pop-{uuid.uuid4().hex[:10]}"

        # Build vulnerability map.
        vuln_map: Dict[str, VulnerabilityIndex] = {
            v.zone_id: v for v in config.vulnerability_indices
        }

        # Compute population-weighted vulnerability multiplier.
        total_pop = sum(z.demographics.total for z in config.zones)
        vuln_multiplier = self._weighted_mortality_multiplier(
            config.zones, vuln_map
        )

        # Effective rates.
        effective_mortality = min(
            1.0,
            self.base_mortality_rate
            * config.hazard_intensity
            * vuln_multiplier,
        )
        effective_displacement = min(
            0.95,
            self.displacement_rate * config.hazard_intensity,
        )

        # Day 0 state.
        initial_deaths = int(total_pop * effective_mortality)
        initial_displaced = int(
            (total_pop - initial_deaths) * effective_displacement
        )
        alive_in_place_0 = total_pop - initial_deaths - initial_displaced

        # Recovery rate constant (exponential decay).
        recovery_k = math.log(2) / max(
            self.recovery_half_life_days, 1.0
        )

        # Chronic daily mortality during crisis (20 % of impact rate).
        daily_mortality_crisis = effective_mortality * 0.20

        timeline: List[PopulationTimeStep] = []
        peak_displacement = initial_displaced
        peak_displacement_day = 0.0
        peak_shelter = initial_displaced
        cumulative_deaths = initial_deaths
        recovered = 0
        displaced = initial_displaced
        fifty_pct_recovery_day: Optional[float] = None

        steps = int(config.simulation_days / config.time_step_days) + 1

        for step in range(steps):
            day = step * config.time_step_days

            if step == 0:
                timeline.append(PopulationTimeStep(
                    day=day,
                    alive_in_place=alive_in_place_0,
                    displaced=initial_displaced,
                    recovered=0,
                    cumulative_deaths=cumulative_deaths,
                    shelter_demand=initial_displaced,
                    food_water_need_persons=initial_displaced + alive_in_place_0,
                ))
                continue

            # Recovery: persons returning home (exponential).
            newly_recovered = int(
                initial_displaced
                * (1 - math.exp(-recovery_k * day))
            ) - recovered
            newly_recovered = max(0, newly_recovered)
            recovered = min(initial_displaced, recovered + newly_recovered)
            displaced = max(0, initial_displaced - recovered)

            # Chronic crisis mortality (applied to displaced population).
            daily_deaths = int(displaced * daily_mortality_crisis)
            cumulative_deaths += daily_deaths

            alive_in_place = max(
                0,
                total_pop - cumulative_deaths - displaced,
            )

            shelter_demand = displaced
            food_water = displaced + alive_in_place

            peak_displacement = max(peak_displacement, displaced)
            if displaced == peak_displacement:
                peak_displacement_day = day

            peak_shelter = max(peak_shelter, shelter_demand)

            # 50 % recovery milestone.
            if (
                fifty_pct_recovery_day is None
                and recovered >= initial_displaced * 0.50
            ):
                fifty_pct_recovery_day = day

            timeline.append(PopulationTimeStep(
                day=day,
                alive_in_place=alive_in_place,
                displaced=displaced,
                recovered=recovered,
                cumulative_deaths=cumulative_deaths,
                shelter_demand=shelter_demand,
                food_water_need_persons=food_water,
            ))

        mortality_pct = (
            cumulative_deaths / max(total_pop, 1) * 100.0
        )

        exposure_metrics = compute_exposure_metrics(config.zones)

        return PopulationSimResult(
            simulation_id=sid,
            region=config.region,
            hazard_type=config.hazard_type,
            hazard_intensity=config.hazard_intensity,
            total_initial_population=total_pop,
            peak_displacement=peak_displacement,
            peak_displacement_day=peak_displacement_day,
            total_mortality=cumulative_deaths,
            mortality_rate_pct=mortality_pct,
            peak_shelter_demand=peak_shelter,
            days_to_50pct_recovery=fifty_pct_recovery_day,
            exposure_metrics=exposure_metrics,
            timeline=timeline,
            simulated_at=datetime.now(timezone.utc).isoformat(),
        )

    def project_displacement(
        self,
        total_population: int,
        hazard_intensity: float,
        days: int = 30,
    ) -> List[Dict[str, Any]]:
        """
        Lightweight displacement-only projection without full zone data.

        Args:
            total_population: Total exposed population.
            hazard_intensity: Normalized hazard intensity.
            days: Days to project.

        Returns:
            List of {"day": int, "displaced": int, "recovered": int} dicts.
        """

        disp = int(
            total_population
            * self.displacement_rate
            * hazard_intensity
        )
        k = math.log(2) / max(self.recovery_half_life_days, 1.0)
        result = []

        for d in range(days + 1):
            rec = min(disp, int(disp * (1 - math.exp(-k * d))))
            result.append({
                "day": d,
                "displaced": max(0, disp - rec),
                "recovered": rec,
            })

        return result

    def health(self) -> Dict[str, Any]:
        """Return service liveness summary."""

        return {
            "service": "population_sim_engine",
            "status": "ok",
            "base_mortality_rate": self.base_mortality_rate,
            "recovery_half_life_days": self.recovery_half_life_days,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    # --------------------------------------------------------
    # Internal helpers
    # --------------------------------------------------------

    def _weighted_mortality_multiplier(
        self,
        zones: List[ExposureZone],
        vuln_map: Dict[str, VulnerabilityIndex],
    ) -> float:
        """
        Population-weighted average mortality multiplier across zones.

        Falls back to default vulnerability when no index is provided.
        """

        total_pop = sum(z.demographics.total for z in zones)

        if total_pop == 0:
            return 1.0

        weighted = sum(
            z.demographics.total
            * vuln_map.get(
                z.zone_id, default_vulnerability(z.zone_id)
            ).mortality_multiplier()
            for z in zones
        )

        return weighted / total_pop


# ============================================================
# Public exports
# ============================================================

__all__ = [
    "PopulationSimEngine",
    "PopulationSimConfig",
    "PopulationSimResult",
    "PopulationTimeStep",
]
