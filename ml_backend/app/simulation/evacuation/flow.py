"""
Evacuation flow calculation and anti-herd load balancing.

This module owns all throughput and corridor-distribution mathematics.
The simulation module orchestrates the discrete-event loop; it delegates
per-step flow arithmetic here via ``FlowCalculator``.

Anti-herd algorithm
-------------------
When a corridor's utilisation exceeds CONGESTION_THRESHOLD, its
``congestion_factor`` is amplified by CONGESTION_PENALTY, reducing its
effective throughput.  This naturally steers subsequent evacuees toward
under-utilised alternatives — preventing the "herd effect" gridlock
observed on single-exit highway corridors.
"""

from __future__ import annotations

from typing import Dict, List

from .routes import CorridorStatus, SimCorridor, SimZone


# ============================================================
# Constants
# ============================================================

# Fraction of step capacity above which a corridor is considered congested.
CONGESTION_THRESHOLD: float = 0.70

# Multiplicative penalty applied to congestion_factor on each rebalance.
CONGESTION_PENALTY: float = 1.15

# Maximum congestion_factor; prevents infinite degradation.
MAX_CONGESTION_FACTOR: float = 3.0


# ============================================================
# FlowCalculator
# ============================================================

class FlowCalculator:
    """
    Computes per-corridor person flow for a single time step.

    Usage::

        calc = FlowCalculator()
        rebalance_count = calc.rebalance(sorted_zones, corridor_map, remaining)
        evacuated, load = calc.compute_step_flow(
            zones, corridor_map, remaining,
            step_fraction=0.5,
            special_needs_ratio=0.15,
        )
    """

    def __init__(self):
        self._rebalance_count = 0

    @property
    def rebalance_count(self) -> int:
        """Total anti-herd rebalances performed so far."""
        return self._rebalance_count

    def reset(self) -> None:
        """Reset rebalance counter for a new simulation run."""
        self._rebalance_count = 0

    # --------------------------------------------------------
    # Anti-herd rebalancing
    # --------------------------------------------------------

    def rebalance(
        self,
        sorted_zones: List[SimZone],
        corridor_map: Dict[str, SimCorridor],
        zone_remaining: Dict[str, int],
    ) -> int:
        """
        Apply anti-herd corridor load balancing for the current step.

        Identifies corridors that are disproportionately over-loaded
        relative to their siblings and increases their congestion_factor,
        reducing effective throughput and steering flow to alternatives.

        Args:
            sorted_zones: Zones in evacuation priority order.
            corridor_map: All corridors keyed by corridor_id.
            zone_remaining: Persons still in each zone.

        Returns:
            Number of rebalance actions applied this call.
        """

        actions = 0

        for zone in sorted_zones:
            if zone_remaining.get(zone.zone_id, 0) == 0:
                continue

            if len(zone.corridor_ids) < 2:
                continue

            usable = [
                corridor_map[cid]
                for cid in zone.corridor_ids
                if cid in corridor_map and corridor_map[cid].passable
            ]

            if len(usable) < 2:
                continue

            throughputs = [
                c.effective_throughput_per_hour for c in usable
            ]
            max_tp = max(throughputs)
            min_tp = min(throughputs)

            if max_tp == 0:
                continue

            # Significant imbalance: penalise the highest-throughput corridor.
            if min_tp / max_tp < (1.0 - CONGESTION_THRESHOLD):
                for corridor in usable:
                    if (
                        corridor.effective_throughput_per_hour == max_tp
                        and corridor.congestion_factor < MAX_CONGESTION_FACTOR
                    ):
                        corridor.congestion_factor = min(
                            MAX_CONGESTION_FACTOR,
                            corridor.congestion_factor * CONGESTION_PENALTY,
                        )
                        corridor.status = CorridorStatus.CONGESTED
                        actions += 1
                        self._rebalance_count += 1

        return actions

    # --------------------------------------------------------
    # Per-step flow
    # --------------------------------------------------------

    def compute_step_flow(
        self,
        zones: List[SimZone],
        corridor_map: Dict[str, SimCorridor],
        zone_remaining: Dict[str, int],
        step_fraction: float,
        special_needs_ratio: float = 0.15,
    ) -> tuple[Dict[str, int], Dict[str, int]]:
        """
        Calculate per-zone evacuation counts and corridor loads for one step.

        Args:
            zones: Zones sorted by priority (1 = most urgent).
            corridor_map: All corridors keyed by corridor_id.
            zone_remaining: Persons still in each zone.
            step_fraction: Fraction of an hour this step represents
                (e.g. 0.5 for 30-minute steps).
            special_needs_ratio: Fraction of corridor capacity reserved
                for assisted (special-needs) evacuation.

        Returns:
            Tuple of (zone_evacuated, corridor_load) dicts where:
                zone_evacuated[zone_id] = persons evacuated this step
                corridor_load[corridor_id] = persons sent through this step
        """

        zone_evacuated: Dict[str, int] = {}
        corridor_load: Dict[str, int] = {
            cid: 0 for cid in corridor_map
        }

        for zone in zones:
            remaining = zone_remaining.get(zone.zone_id, 0)

            if remaining <= 0:
                zone_evacuated[zone.zone_id] = 0
                continue

            usable = [
                corridor_map[cid]
                for cid in zone.corridor_ids
                if cid in corridor_map
                and corridor_map[cid].passable
            ]

            if not usable:
                zone_evacuated[zone.zone_id] = 0
                continue

            total_throughput = sum(
                c.effective_throughput_per_hour for c in usable
            )

            if total_throughput == 0:
                zone_evacuated[zone.zone_id] = 0
                continue

            zone_total = 0

            for corridor in usable:
                share = (
                    corridor.effective_throughput_per_hour
                    / total_throughput
                )
                corridor_max = int(
                    corridor.effective_throughput_per_hour * step_fraction
                )
                sn_reserved = int(corridor_max * special_needs_ratio)
                total_cap = corridor_max

                persons = min(
                    int(remaining * share),
                    total_cap,
                    remaining - zone_total,
                )
                persons = max(0, persons)

                zone_total += persons
                corridor_load[corridor.corridor_id] = (
                    corridor_load[corridor.corridor_id] + persons
                )

            zone_evacuated[zone.zone_id] = zone_total

        return zone_evacuated, corridor_load

    # --------------------------------------------------------
    # Bottleneck detection
    # --------------------------------------------------------

    def detect_bottlenecks(
        self,
        corridors: List[SimCorridor],
        corridor_load: Dict[str, int],
        step_fraction: float,
    ) -> List[str]:
        """
        Identify corridors whose load exceeded the congestion threshold.

        Args:
            corridors: All corridors in the simulation.
            corridor_load: Persons sent through each corridor this step.
            step_fraction: Hour fraction for this step.

        Returns:
            List of corridor_ids that are bottlenecks.
        """

        bottlenecks: List[str] = []

        for corridor in corridors:
            if not corridor.passable:
                continue

            max_step_cap = int(
                corridor.effective_throughput_per_hour * step_fraction
            )

            if max_step_cap == 0:
                continue

            load = corridor_load.get(corridor.corridor_id, 0)

            if load / max_step_cap > CONGESTION_THRESHOLD:
                bottlenecks.append(corridor.corridor_id)

        return bottlenecks


# ============================================================
# Public exports
# ============================================================

__all__ = [
    "CONGESTION_THRESHOLD",
    "CONGESTION_PENALTY",
    "MAX_CONGESTION_FACTOR",
    "FlowCalculator",
]
