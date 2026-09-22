"""
Multi-hazard cascade simulation engine.

Steps through a time window, evaluating cascade rules at each hour to
determine whether active hazards trigger new secondary events.  Uses the
InteractionMatrix from interaction.py to look up probabilities and
amplification factors.
"""

from __future__ import annotations

import math
import random
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from .interaction import DEFAULT_INTERACTION_MATRIX, InteractionMatrix
from .scenario import (
    CascadeSimConfig,
    CascadeSimResult,
    CascadeStatus,
    CascadeTimeStep,
    HazardEvent,
    PrimaryHazard,
)


# Compound risk threshold requiring immediate action.
_IMMEDIATE_ACTION_THRESHOLD = 60.0


class MultiHazardSimEngine:
    """
    Multi-hazard cascade simulation engine.

    Models how primary hazard events trigger secondary events over time
    and computes the evolving compound risk score at each simulation hour.

    Args:
        interaction_matrix: Cascade rule registry; uses the module default
            if not supplied.
        random_seed: Optional seed for deterministic trigger sampling.

    Example::

        engine = MultiHazardSimEngine()
        config = CascadeSimConfig(
            primary_events=[HazardEvent(
                event_id="eq-001",
                hazard_type=PrimaryHazard.EARTHQUAKE,
                intensity=0.78,
                region="Sikkim",
            )],
            region="Sikkim",
            simulation_hours=48.0,
        )
        result = engine.simulate_cascade(config)
        print(result.to_dict())
    """

    def __init__(
        self,
        interaction_matrix: Optional[InteractionMatrix] = None,
        random_seed: Optional[int] = None,
    ):
        self._matrix = interaction_matrix or DEFAULT_INTERACTION_MATRIX
        self._rng = random.Random(random_seed)

    # --------------------------------------------------------
    # Public API
    # --------------------------------------------------------

    def simulate_cascade(
        self,
        config: CascadeSimConfig,
        simulation_id: Optional[str] = None,
    ) -> CascadeSimResult:
        """
        Run a multi-hazard cascade simulation.

        Args:
            config: Cascade simulation configuration.
            simulation_id: Optional caller-supplied ID.

        Returns:
            CascadeSimResult with timeline and secondary events.
        """

        sid = simulation_id or f"cascade-{uuid.uuid4().hex[:10]}"
        warnings: List[str] = []

        # Shallow copy primary events; cascade will append secondary events.
        all_events: List[HazardEvent] = list(config.primary_events)
        secondary_events: List[HazardEvent] = []
        timeline: List[CascadeTimeStep] = []
        max_compound = 0.0
        cascade_depth = 0

        time_steps = int(
            config.simulation_hours / config.time_step_hours
        ) + 1

        # Map of event_id → cascade depth for loop prevention.
        event_depth: Dict[str, int] = {
            e.event_id: 0 for e in config.primary_events
        }

        for step in range(time_steps):

            current_hour = step * config.time_step_hours

            # Events active at this hour.
            active: List[HazardEvent] = [
                e for e in all_events
                if e.onset_hour <= current_hour
                < (e.onset_hour + e.duration_hours)
            ]
            active_ids = [e.event_id for e in active]
            active_types = [e.hazard_type.value for e in active]

            # Compound amplification for overlapping hazards.
            amp = (
                self._matrix.compound_amplification(active_types)
                if config.enable_compound_amplification
                else 1.0
            )

            # Compute compound risk score based on active intensities.
            if active:
                base_score = sum(
                    e.intensity * 100.0 for e in active
                ) / len(active)
                compound_score = min(100.0, base_score * amp)
            else:
                compound_score = 0.0

            max_compound = max(max_compound, compound_score)

            total_pop = sum(e.population_exposed for e in active)

            # Evaluate cascade triggers.
            new_triggers: List[str] = []

            for event in active:
                depth = event_depth.get(event.event_id, 0)

                if depth >= config.max_cascade_depth:
                    continue

                rules = self._matrix.get_rules(event.hazard_type)

                for rule in rules:
                    # Only trigger once per (primary, secondary) pair.
                    already_triggered = any(
                        e.triggered_by == event.event_id
                        and e.hazard_type.value == rule.secondary.value
                        for e in all_events
                    )
                    if already_triggered:
                        continue

                    trigger_prob = rule.trigger_probability(
                        event.intensity
                    )

                    if self._rng.random() < trigger_prob:
                        sec_id = (
                            f"{rule.secondary.value}"
                            f"-cascade-{uuid.uuid4().hex[:6]}"
                        )
                        onset = current_hour + rule.onset_delay_hours
                        sec_intensity = min(
                            1.0,
                            event.intensity
                            * rule.secondary_intensity_factor,
                        )
                        sec_event = HazardEvent(
                            event_id=sec_id,
                            hazard_type=rule.secondary,
                            intensity=sec_intensity,
                            region=event.region,
                            onset_hour=onset,
                            duration_hours=event.duration_hours * 0.75,
                            area_sqkm=event.area_sqkm * 0.60,
                            population_exposed=int(
                                event.population_exposed * 0.50
                            ),
                            is_primary=False,
                            triggered_by=event.event_id,
                        )
                        all_events.append(sec_event)
                        secondary_events.append(sec_event)
                        event_depth[sec_id] = depth + 1
                        cascade_depth = max(
                            cascade_depth, event_depth[sec_id]
                        )
                        new_triggers.append(sec_id)

            timeline.append(CascadeTimeStep(
                hour=current_hour,
                active_events=active_ids,
                total_population_at_risk=total_pop,
                compound_risk_score=compound_score,
                new_triggers=new_triggers,
            ))

        # --------------------------------------------------------
        # Aggregate results
        # --------------------------------------------------------

        primary_hazard = (
            config.primary_events[0].hazard_type.value
            if config.primary_events else "unknown"
        )
        total_pop_at_risk = max(
            e.population_exposed for e in all_events
        ) if all_events else 0

        # Amplification vs. no-cascade (single-hazard at peak intensity).
        peak_single = (
            max(e.intensity for e in config.primary_events) * 100.0
            if config.primary_events else 0.0
        )
        amplification = (
            max_compound / max(peak_single, 1.0)
        )

        if cascade_depth == config.max_cascade_depth:
            warnings.append(
                f"Maximum cascade depth ({config.max_cascade_depth}) "
                "reached — some secondary triggers may be suppressed."
            )

        return CascadeSimResult(
            simulation_id=sid,
            region=config.region,
            status=CascadeStatus.SUCCESS,
            primary_hazard=primary_hazard,
            total_events=len(all_events),
            cascade_depth_reached=cascade_depth,
            peak_compound_risk_score=round(max_compound, 2),
            total_population_at_risk=total_pop_at_risk,
            secondary_events=secondary_events,
            timeline=timeline,
            amplification_factor=round(amplification, 3),
            requires_immediate_action=(
                max_compound >= _IMMEDIATE_ACTION_THRESHOLD
            ),
            simulated_at=datetime.now(timezone.utc).isoformat(),
            warnings=warnings,
        )

    def health(self) -> Dict[str, Any]:
        """Return service liveness summary."""

        return {
            "service": "multi_hazard_sim_engine",
            "status": "ok",
            "interaction_rules": len(self._matrix.all_rules()),
            "immediate_action_threshold": _IMMEDIATE_ACTION_THRESHOLD,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }


# ============================================================
# Public exports
# ============================================================

__all__ = [
    "MultiHazardSimEngine",
]
