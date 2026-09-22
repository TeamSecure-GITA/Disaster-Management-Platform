"""
Evacuation discrete-event simulation engine.

Orchestrates the step-by-step population movement loop, delegating all
flow arithmetic and anti-herd balancing to the FlowCalculator in flow.py
and using route data models from routes.py.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from .flow import FlowCalculator
from .routes import CorridorStatus, SimCorridor, SimZone, ZoneStatus


# ============================================================
# Configuration
# ============================================================

@dataclass
class EvacSimConfig:
    """
    Complete configuration for a single evacuation simulation run.

    Attributes:
        zones: Zones from which people are evacuating.
        corridors: Available road/waterway corridors.
        total_population: Total persons requiring evacuation (cross-check).
        time_step_minutes: Simulation resolution (minutes per step).
        max_steps: Maximum steps before forced termination.
        enable_anti_herd: Activate dynamic corridor load balancing.
        special_needs_priority_ratio: Fraction of capacity reserved for
            assisted (special-needs) evacuation.
    """

    zones: List[SimZone]
    corridors: List[SimCorridor]
    total_population: int
    time_step_minutes: int = 30
    max_steps: int = 96           # 48 h at 30-min steps
    enable_anti_herd: bool = True
    special_needs_priority_ratio: float = 0.15

    def to_dict(self) -> Dict[str, Any]:
        return {
            "zones": [z.to_dict() for z in self.zones],
            "corridors": [c.to_dict() for c in self.corridors],
            "total_population": self.total_population,
            "time_step_minutes": self.time_step_minutes,
            "max_steps": self.max_steps,
            "enable_anti_herd": self.enable_anti_herd,
            "special_needs_priority_ratio": (
                self.special_needs_priority_ratio
            ),
        }


# ============================================================
# Result models
# ============================================================

@dataclass
class SimTimeStep:
    """Snapshot of simulation state at a single time step."""

    step: int
    elapsed_minutes: int
    evacuated_count: int
    remaining_count: int
    completion_pct: float
    active_corridors: int
    bottleneck_corridor_ids: List[str]
    zone_statuses: Dict[str, str]   # zone_id → ZoneStatus.value


@dataclass
class ZoneSummary:
    """Per-zone final evacuation outcome."""

    zone_id: str
    name: str
    initial_population: int
    evacuated: int
    remaining: int
    clearance_time_minutes: Optional[int]
    status: str


@dataclass
class EvacSimResult:
    """
    Complete output of an evacuation simulation run.

    Attributes:
        simulation_id: Unique run identifier.
        total_population: Persons submitted for evacuation.
        final_evacuated: Persons evacuated by simulation end.
        final_remaining: Persons still at risk.
        completion_pct: Evacuation completion percentage (0–100).
        full_clearance_minutes: Minutes to 100 % clearance, or None.
        timeline: Step-by-step state history.
        zone_summaries: Per-zone final outcomes.
        bottleneck_corridor_ids: Corridors that were consistently congested.
        special_needs_cleared: Assisted-evacuation persons cleared.
        anti_herd_rebalances: Times the anti-herd algorithm acted.
        simulated_at: UTC ISO-8601 timestamp.
    """

    simulation_id: str
    total_population: int
    final_evacuated: int
    final_remaining: int
    completion_pct: float
    full_clearance_minutes: Optional[int]
    timeline: List[SimTimeStep]
    zone_summaries: List[ZoneSummary]
    bottleneck_corridor_ids: List[str]
    special_needs_cleared: int
    anti_herd_rebalances: int
    simulated_at: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "simulation_id": self.simulation_id,
            "total_population": self.total_population,
            "final_evacuated": self.final_evacuated,
            "final_remaining": self.final_remaining,
            "completion_pct": round(self.completion_pct, 2),
            "full_clearance_minutes": self.full_clearance_minutes,
            "special_needs_cleared": self.special_needs_cleared,
            "anti_herd_rebalances": self.anti_herd_rebalances,
            "bottleneck_corridor_ids": self.bottleneck_corridor_ids,
            "simulated_at": self.simulated_at,
            "zone_summaries": [
                {
                    "zone_id": z.zone_id,
                    "name": z.name,
                    "initial_population": z.initial_population,
                    "evacuated": z.evacuated,
                    "remaining": z.remaining,
                    "clearance_time_minutes": z.clearance_time_minutes,
                    "status": z.status,
                }
                for z in self.zone_summaries
            ],
            "timeline": [
                {
                    "step": t.step,
                    "elapsed_minutes": t.elapsed_minutes,
                    "evacuated_count": t.evacuated_count,
                    "remaining_count": t.remaining_count,
                    "completion_pct": round(t.completion_pct, 2),
                    "active_corridors": t.active_corridors,
                    "bottleneck_corridor_ids": t.bottleneck_corridor_ids,
                    "zone_statuses": t.zone_statuses,
                }
                for t in self.timeline
            ],
        }


# ============================================================
# Engine
# ============================================================

class EvacuationSimEngine:
    """
    Discrete-event evacuation simulation engine.

    Delegates per-step flow arithmetic and anti-herd load balancing to
    ``FlowCalculator`` and reads zone/corridor models from ``routes``.

    Example::

        engine = EvacuationSimEngine()
        cfg = EvacSimConfig(
            zones=[SimZone("z1", "Coastal Strip", 30000, priority=1,
                           corridor_ids=["c1", "c2"])],
            corridors=[
                SimCorridor("c1", "NH-16 North", 8000, 45.0),
                SimCorridor("c2", "Ring Road East", 4000, 30.0),
            ],
            total_population=30000,
        )
        result = engine.simulate(cfg)
    """

    def __init__(self):
        self._calc = FlowCalculator()

    # --------------------------------------------------------
    # Public API
    # --------------------------------------------------------

    def simulate(
        self,
        config: EvacSimConfig,
        simulation_id: Optional[str] = None,
    ) -> EvacSimResult:
        """
        Run the discrete-event evacuation simulation.

        Args:
            config: Full simulation configuration.
            simulation_id: Optional caller-supplied ID.

        Returns:
            EvacSimResult with full timeline and zone summaries.
        """

        sid = simulation_id or f"evac-{uuid.uuid4().hex[:10]}"
        self._calc.reset()

        # Build lookup maps.
        corridor_map: Dict[str, SimCorridor] = {
            c.corridor_id: c for c in config.corridors
        }
        zone_map: Dict[str, SimZone] = {
            z.zone_id: z for z in config.zones
        }

        # Initialise zone state.
        zone_remaining: Dict[str, int] = {
            z.zone_id: z.population for z in config.zones
        }
        zone_status: Dict[str, ZoneStatus] = {
            z.zone_id: ZoneStatus.PENDING for z in config.zones
        }
        zone_clearance: Dict[str, Optional[int]] = {
            z.zone_id: None for z in config.zones
        }

        special_needs_total = sum(
            z.special_needs_count for z in config.zones
        )
        special_needs_cleared = 0
        total_evacuated = 0
        bottleneck_ids: set = set()
        timeline: List[SimTimeStep] = []

        step_fraction = config.time_step_minutes / 60.0

        # Priority-sort zones (1 = most urgent).
        sorted_zones = sorted(config.zones, key=lambda z: z.priority)

        # --------------------------------------------------------
        # Main simulation loop
        # --------------------------------------------------------

        for step in range(1, config.max_steps + 1):

            elapsed = step * config.time_step_minutes

            # Anti-herd rebalancing.
            if config.enable_anti_herd:
                self._calc.rebalance(
                    sorted_zones, corridor_map, zone_remaining
                )

            # Update zone statuses before this step.
            for zone in sorted_zones:
                if zone_remaining[zone.zone_id] <= 0:
                    continue

                usable = [
                    corridor_map[cid]
                    for cid in zone.corridor_ids
                    if cid in corridor_map
                    and corridor_map[cid].passable
                ]
                if not usable:
                    zone_status[zone.zone_id] = ZoneStatus.STRANDED
                else:
                    zone_status[zone.zone_id] = ZoneStatus.EVACUATING

            # Compute flow for this step.
            zone_evac, corridor_load = self._calc.compute_step_flow(
                zones=sorted_zones,
                corridor_map=corridor_map,
                zone_remaining=zone_remaining,
                step_fraction=step_fraction,
                special_needs_ratio=config.special_needs_priority_ratio,
            )

            # Apply zone outcomes.
            step_evacuated = 0

            for zone in sorted_zones:
                evac = zone_evac.get(zone.zone_id, 0)

                # Accumulate special-needs clearance proportionally.
                if zone.population > 0 and zone.special_needs_count > 0:
                    sn_fraction = zone.special_needs_count / zone.population
                    special_needs_cleared = min(
                        special_needs_total,
                        special_needs_cleared + int(evac * sn_fraction),
                    )

                zone_remaining[zone.zone_id] = max(
                    0, zone_remaining[zone.zone_id] - evac
                )
                step_evacuated += evac

                if zone_remaining[zone.zone_id] == 0:
                    zone_status[zone.zone_id] = ZoneStatus.CLEARED
                    if zone_clearance[zone.zone_id] is None:
                        zone_clearance[zone.zone_id] = elapsed

            total_evacuated += step_evacuated
            total_evacuated = min(total_evacuated, config.total_population)

            # Bottleneck detection.
            step_bottlenecks = self._calc.detect_bottlenecks(
                corridors=config.corridors,
                corridor_load=corridor_load,
                step_fraction=step_fraction,
            )
            bottleneck_ids.update(step_bottlenecks)

            completion = (
                total_evacuated / max(config.total_population, 1)
            ) * 100.0

            timeline.append(SimTimeStep(
                step=step,
                elapsed_minutes=elapsed,
                evacuated_count=total_evacuated,
                remaining_count=max(
                    0, config.total_population - total_evacuated
                ),
                completion_pct=min(100.0, completion),
                active_corridors=sum(
                    1 for c in config.corridors if c.passable
                ),
                bottleneck_corridor_ids=step_bottlenecks,
                zone_statuses={
                    zid: st.value for zid, st in zone_status.items()
                },
            ))

            if total_evacuated >= config.total_population:
                break

        # --------------------------------------------------------
        # Build zone summaries
        # --------------------------------------------------------

        zone_summaries: List[ZoneSummary] = [
            ZoneSummary(
                zone_id=z.zone_id,
                name=z.name,
                initial_population=z.population,
                evacuated=z.population - zone_remaining[z.zone_id],
                remaining=zone_remaining[z.zone_id],
                clearance_time_minutes=zone_clearance[z.zone_id],
                status=zone_status[z.zone_id].value,
            )
            for z in config.zones
        ]

        final_remaining = max(
            0, config.total_population - total_evacuated
        )
        completion_pct = min(
            100.0,
            (total_evacuated / max(config.total_population, 1)) * 100.0,
        )
        full_clearance = (
            timeline[-1].elapsed_minutes
            if total_evacuated >= config.total_population and timeline
            else None
        )

        return EvacSimResult(
            simulation_id=sid,
            total_population=config.total_population,
            final_evacuated=total_evacuated,
            final_remaining=final_remaining,
            completion_pct=completion_pct,
            full_clearance_minutes=full_clearance,
            timeline=timeline,
            zone_summaries=zone_summaries,
            bottleneck_corridor_ids=list(bottleneck_ids),
            special_needs_cleared=special_needs_cleared,
            anti_herd_rebalances=self._calc.rebalance_count,
            simulated_at=datetime.now(timezone.utc).isoformat(),
        )

    def health(self) -> Dict[str, Any]:
        """Return service liveness summary."""

        return {
            "service": "evacuation_sim_engine",
            "status": "ok",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }


# ============================================================
# Public exports
# ============================================================

__all__ = [
    "EvacuationSimEngine",
    "EvacSimConfig",
    "EvacSimResult",
    "SimTimeStep",
    "ZoneSummary",
]
