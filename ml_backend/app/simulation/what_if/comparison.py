"""
What-if intervention comparison module.

Computes delta metrics between a no-intervention baseline and one or more
intervention scenarios, and produces ranked comparison reports used by
the API and AI decision copilot.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


# ============================================================
# Delta result
# ============================================================

@dataclass
class InterventionDelta:
    """
    Quantified impact of a single intervention relative to baseline.

    All delta values represent (intervention − baseline).
    Negative deltas for casualties/displacement are beneficial.

    Attributes:
        scenario_id: Identifier of the WhatIfScenario.
        scenario_name: Human-readable scenario label.
        intervention_type: String key of the intervention.
        baseline_casualties: Baseline (no-action) casualty estimate.
        intervention_casualties: Casualty estimate after intervention.
        lives_saved: baseline_casualties − intervention_casualties.
        lives_saved_pct: Percentage reduction in casualties.
        baseline_displaced: Baseline displaced persons.
        intervention_displaced: Displaced persons after intervention.
        displacement_reduction: baseline − intervention displaced count.
        displacement_reduction_pct: Percentage reduction.
        economic_impact_delta_usd: Change in economic damage (negative = saving).
        response_time_delta_hours: Change in critical response window.
        cost_effectiveness_index: lives_saved per USD 1 M invested (if cost given).
        overall_rank: Rank among compared scenarios (1 = best).
    """

    scenario_id: str
    scenario_name: str
    intervention_type: str
    baseline_casualties: int
    intervention_casualties: int
    lives_saved: int
    lives_saved_pct: float
    baseline_displaced: int
    intervention_displaced: int
    displacement_reduction: int
    displacement_reduction_pct: float
    economic_impact_delta_usd: float
    response_time_delta_hours: float
    cost_effectiveness_index: float = 0.0   # lives saved / USD 1M cost
    overall_rank: int = 0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "scenario_id": self.scenario_id,
            "scenario_name": self.scenario_name,
            "intervention_type": self.intervention_type,
            "baseline_casualties": self.baseline_casualties,
            "intervention_casualties": self.intervention_casualties,
            "lives_saved": self.lives_saved,
            "lives_saved_pct": round(self.lives_saved_pct, 2),
            "baseline_displaced": self.baseline_displaced,
            "intervention_displaced": self.intervention_displaced,
            "displacement_reduction": self.displacement_reduction,
            "displacement_reduction_pct": round(
                self.displacement_reduction_pct, 2
            ),
            "economic_impact_delta_usd": round(
                self.economic_impact_delta_usd, 2
            ),
            "response_time_delta_hours": round(
                self.response_time_delta_hours, 2
            ),
            "cost_effectiveness_index": round(
                self.cost_effectiveness_index, 4
            ),
            "overall_rank": self.overall_rank,
        }


# ============================================================
# Comparison result
# ============================================================

@dataclass
class ComparisonResult:
    """
    Ranked comparison of multiple what-if intervention scenarios.

    Attributes:
        comparison_id: Unique identifier.
        region: Target region.
        hazard_type: Primary hazard type.
        baseline_casualties: Baseline casualty estimate.
        deltas: Ordered list of InterventionDelta (best first).
        best_scenario_id: scenario_id with highest lives-saved.
        most_cost_effective_id: scenario_id with highest CEI (if costs given).
        compared_at: UTC ISO-8601 timestamp.
        notes: Analyst notes or advisory messages.
    """

    comparison_id: str
    region: str
    hazard_type: str
    baseline_casualties: int
    deltas: List[InterventionDelta]
    best_scenario_id: str
    most_cost_effective_id: str
    compared_at: str
    notes: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "comparison_id": self.comparison_id,
            "region": self.region,
            "hazard_type": self.hazard_type,
            "baseline_casualties": self.baseline_casualties,
            "best_scenario_id": self.best_scenario_id,
            "most_cost_effective_id": self.most_cost_effective_id,
            "compared_at": self.compared_at,
            "notes": self.notes,
            "deltas": [d.to_dict() for d in self.deltas],
        }


# ============================================================
# Comparison builder
# ============================================================

class InterventionComparison:
    """
    Builds ranked comparison reports from a set of InterventionDelta objects.

    Usage::

        deltas = [delta_a, delta_b, delta_c]
        comparison = InterventionComparison.build(
            comparison_id="cmp-001",
            region="Assam",
            hazard_type="flood",
            baseline_casualties=1200,
            deltas=deltas,
        )
        report = comparison.to_dict()
    """

    @staticmethod
    def build(
        comparison_id: str,
        region: str,
        hazard_type: str,
        baseline_casualties: int,
        deltas: List[InterventionDelta],
        notes: Optional[List[str]] = None,
    ) -> ComparisonResult:
        """
        Sort deltas by lives_saved (descending) and assign ranks.

        Args:
            comparison_id: Caller-supplied unique ID.
            region: Target region label.
            hazard_type: Primary hazard type string.
            baseline_casualties: Baseline casualty count (no intervention).
            deltas: Unsorted list of InterventionDelta objects.
            notes: Optional advisory notes to include.

        Returns:
            ComparisonResult with ranked deltas.
        """

        if not deltas:
            return ComparisonResult(
                comparison_id=comparison_id,
                region=region,
                hazard_type=hazard_type,
                baseline_casualties=baseline_casualties,
                deltas=[],
                best_scenario_id="",
                most_cost_effective_id="",
                compared_at=datetime.now(timezone.utc).isoformat(),
                notes=notes or [],
            )

        # Rank by lives saved (primary), cost-effectiveness (secondary).
        sorted_deltas = sorted(
            deltas,
            key=lambda d: (d.lives_saved, d.cost_effectiveness_index),
            reverse=True,
        )

        for rank, delta in enumerate(sorted_deltas, start=1):
            delta.overall_rank = rank

        best = sorted_deltas[0]

        # Most cost-effective (only meaningful when CEI > 0).
        cei_sorted = sorted(
            deltas,
            key=lambda d: d.cost_effectiveness_index,
            reverse=True,
        )
        most_cost_effective = cei_sorted[0]

        return ComparisonResult(
            comparison_id=comparison_id,
            region=region,
            hazard_type=hazard_type,
            baseline_casualties=baseline_casualties,
            deltas=sorted_deltas,
            best_scenario_id=best.scenario_id,
            most_cost_effective_id=most_cost_effective.scenario_id,
            compared_at=datetime.now(timezone.utc).isoformat(),
            notes=notes or [],
        )


# ============================================================
# Public exports
# ============================================================

__all__ = [
    "InterventionDelta",
    "ComparisonResult",
    "InterventionComparison",
]
