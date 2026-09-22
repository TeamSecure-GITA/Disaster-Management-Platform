"""
What-if intervention analysis engine.

Computes the quantitative impact of emergency management interventions
(early warnings, resource pre-positioning, barrier deployment, etc.)
relative to a no-action baseline, and produces ranked comparison reports.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from .comparison import ComparisonResult, InterventionComparison, InterventionDelta
from .scenarios import (
    AnalysisStatus,
    BaselineScenario,
    InterventionType,
    WhatIfScenario,
)


# ============================================================
# Single analysis result
# ============================================================

class WhatIfResult:
    """
    Analysis result for a single what-if intervention scenario.

    Attributes:
        analysis_id: Unique identifier.
        scenario_id: Source WhatIfScenario.scenario_id.
        scenario_name: Source scenario label.
        intervention_type: Intervention modelled.
        status: Execution status.
        baseline_casualties: Baseline (no-intervention) casualty estimate.
        intervention_casualties: Post-intervention casualty estimate.
        lives_saved: baseline − intervention casualties.
        lives_saved_pct: Percentage reduction.
        baseline_displaced: Baseline displaced persons.
        intervention_displaced: Post-intervention displaced persons.
        economic_impact_delta_usd: Change in economic damage (negative = saving).
        response_time_delta_hours: Change in critical response window (positive = better).
        analysis_notes: Advisory messages from the engine.
        analysed_at: UTC ISO-8601 timestamp.
    """

    def __init__(
        self,
        analysis_id: str,
        scenario_id: str,
        scenario_name: str,
        intervention_type: str,
        status: AnalysisStatus,
        baseline_casualties: int,
        intervention_casualties: int,
        baseline_displaced: int,
        intervention_displaced: int,
        economic_impact_delta_usd: float,
        response_time_delta_hours: float,
        analysis_notes: List[str],
        analysed_at: str,
        error: Optional[str] = None,
    ):
        self.analysis_id = analysis_id
        self.scenario_id = scenario_id
        self.scenario_name = scenario_name
        self.intervention_type = intervention_type
        self.status = status
        self.baseline_casualties = baseline_casualties
        self.intervention_casualties = intervention_casualties
        self.lives_saved = max(
            0, baseline_casualties - intervention_casualties
        )
        self.lives_saved_pct = (
            self.lives_saved / max(baseline_casualties, 1) * 100.0
        )
        self.baseline_displaced = baseline_displaced
        self.intervention_displaced = intervention_displaced
        self.displacement_reduction = max(
            0, baseline_displaced - intervention_displaced
        )
        self.displacement_reduction_pct = (
            self.displacement_reduction
            / max(baseline_displaced, 1)
            * 100.0
        )
        self.economic_impact_delta_usd = economic_impact_delta_usd
        self.response_time_delta_hours = response_time_delta_hours
        self.analysis_notes = analysis_notes
        self.analysed_at = analysed_at
        self.error = error

    def to_dict(self) -> Dict[str, Any]:
        return {
            "analysis_id": self.analysis_id,
            "scenario_id": self.scenario_id,
            "scenario_name": self.scenario_name,
            "intervention_type": self.intervention_type,
            "status": self.status.value,
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
            "analysis_notes": self.analysis_notes,
            "analysed_at": self.analysed_at,
            "error": self.error,
        }

    def to_delta(self) -> InterventionDelta:
        """Convert to an InterventionDelta for comparison reports."""

        return InterventionDelta(
            scenario_id=self.scenario_id,
            scenario_name=self.scenario_name,
            intervention_type=self.intervention_type,
            baseline_casualties=self.baseline_casualties,
            intervention_casualties=self.intervention_casualties,
            lives_saved=self.lives_saved,
            lives_saved_pct=self.lives_saved_pct,
            baseline_displaced=self.baseline_displaced,
            intervention_displaced=self.intervention_displaced,
            displacement_reduction=self.displacement_reduction,
            displacement_reduction_pct=self.displacement_reduction_pct,
            economic_impact_delta_usd=self.economic_impact_delta_usd,
            response_time_delta_hours=self.response_time_delta_hours,
        )


# ============================================================
# Intervention effect coefficients
# ============================================================

# Maps InterventionType → effect coefficients.
# All values represent fractional reductions relative to baseline at
# their maximum effectiveness (fully applied intervention).

_EFFECT_TABLE: Dict[str, Dict[str, float]] = {
    InterventionType.EARLY_EVACUATION.value: {
        "mortality_reduction":      0.60,   # Evacuating ahead saves 60% of casualties
        "displacement_reduction":   0.30,
        "economic_reduction":       0.20,
        "response_time_gain_hours": 6.0,
    },
    InterventionType.PRE_POSITION_RESOURCES.value: {
        "mortality_reduction":      0.25,
        "displacement_reduction":   0.10,
        "economic_reduction":       0.10,
        "response_time_gain_hours": 3.0,
    },
    InterventionType.REINFORCE_INFRASTRUCTURE.value: {
        "mortality_reduction":      0.35,
        "displacement_reduction":   0.20,
        "economic_reduction":       0.45,
        "response_time_gain_hours": 0.0,
    },
    InterventionType.DEPLOY_FLOOD_BARRIER.value: {
        "mortality_reduction":      0.40,
        "displacement_reduction":   0.50,
        "economic_reduction":       0.55,
        "response_time_gain_hours": 0.0,
    },
    InterventionType.INCREASE_WARNING_LEAD.value: {
        "mortality_reduction":      0.45,
        "displacement_reduction":   0.25,
        "economic_reduction":       0.15,
        "response_time_gain_hours": 12.0,
    },
    InterventionType.ADD_EVACUATION_CORRIDOR.value: {
        "mortality_reduction":      0.30,
        "displacement_reduction":   0.15,
        "economic_reduction":       0.05,
        "response_time_gain_hours": 4.0,
    },
    InterventionType.MEDICAL_SURGE_CAPACITY.value: {
        "mortality_reduction":      0.20,
        "displacement_reduction":   0.05,
        "economic_reduction":       0.02,
        "response_time_gain_hours": 0.0,
    },
    InterventionType.NO_INTERVENTION.value: {
        "mortality_reduction":      0.0,
        "displacement_reduction":   0.0,
        "economic_reduction":       0.0,
        "response_time_gain_hours": 0.0,
    },
}

_DEFAULT_EFFECT: Dict[str, float] = {
    "mortality_reduction":      0.10,
    "displacement_reduction":   0.05,
    "economic_reduction":       0.05,
    "response_time_gain_hours": 0.0,
}


# ============================================================
# Engine
# ============================================================

class WhatIfEngine:
    """
    What-if intervention analysis engine.

    Applies pre-calibrated effect coefficients (scaled by intervention
    parameters) to baseline mortality, displacement, and economic impact
    to estimate the benefit of emergency management actions.

    Example::

        engine = WhatIfEngine()

        scenario = WhatIfScenario(
            scenario_id="s1",
            name="Early Evacuation 24 h",
            intervention_type=InterventionType.EARLY_EVACUATION,
            baseline=BaselineScenario(
                region="Majuli Island",
                hazard_type="flood",
                intensity=0.80,
                population_at_risk=80000,
                pre_warning_hours=6.0,
            ),
            parameters=[
                InterventionParameter("warning_hours_added", 18.0),
            ],
        )

        result = engine.analyze(scenario)
        print(result.to_dict())
    """

    # --------------------------------------------------------
    # Public API
    # --------------------------------------------------------

    def analyze(
        self,
        scenario: WhatIfScenario,
        analysis_id: Optional[str] = None,
    ) -> WhatIfResult:
        """
        Analyse a single what-if intervention scenario.

        Args:
            scenario: The intervention to evaluate.
            analysis_id: Optional caller-supplied ID.

        Returns:
            WhatIfResult with delta metrics.
        """

        aid = analysis_id or f"wif-{uuid.uuid4().hex[:10]}"
        notes: List[str] = []
        baseline = scenario.baseline

        # Baseline estimates (simplified).
        baseline_mort_rate = 0.010 * baseline.intensity
        baseline_casualties = int(
            baseline.population_at_risk * baseline_mort_rate
        )
        baseline_displaced = int(
            baseline.population_at_risk * 0.35 * baseline.intensity
        )
        baseline_economic = (
            baseline.area_sqkm
            * baseline.intensity
            * 2_500_000.0
        )

        # Get effect coefficients.
        effects = _EFFECT_TABLE.get(
            scenario.intervention_type.value, _DEFAULT_EFFECT
        )

        # Scale effectiveness by intensity and intervention parameters.
        effectiveness = self._compute_effectiveness(scenario, baseline)

        mort_reduction = min(
            0.90, effects["mortality_reduction"] * effectiveness
        )
        disp_reduction = min(
            0.90, effects["displacement_reduction"] * effectiveness
        )
        econ_reduction = min(
            0.90, effects["economic_reduction"] * effectiveness
        )
        rt_gain = effects["response_time_gain_hours"] * effectiveness

        # Intervention state.
        intervention_casualties = int(
            baseline_casualties * (1.0 - mort_reduction)
        )
        intervention_displaced = int(
            baseline_displaced * (1.0 - disp_reduction)
        )
        econ_delta = -(baseline_economic * econ_reduction)

        # Advisory notes.
        if baseline.intensity > 0.85:
            notes.append(
                "High hazard intensity (>0.85): intervention effectiveness "
                "may be lower than modelled."
            )

        if effectiveness < 0.50:
            notes.append(
                "Intervention effectiveness is limited by current baseline "
                "conditions (low pre-warning / pre-positioning scores)."
            )

        return WhatIfResult(
            analysis_id=aid,
            scenario_id=scenario.scenario_id,
            scenario_name=scenario.name,
            intervention_type=scenario.intervention_type.value,
            status=AnalysisStatus.SUCCESS,
            baseline_casualties=baseline_casualties,
            intervention_casualties=intervention_casualties,
            baseline_displaced=baseline_displaced,
            intervention_displaced=intervention_displaced,
            economic_impact_delta_usd=econ_delta,
            response_time_delta_hours=rt_gain,
            analysis_notes=notes,
            analysed_at=datetime.now(timezone.utc).isoformat(),
        )

    def compare_interventions(
        self,
        scenarios: List[WhatIfScenario],
        comparison_id: Optional[str] = None,
    ) -> ComparisonResult:
        """
        Analyse multiple intervention scenarios and produce a ranked report.

        All scenarios must share the same baseline region and hazard type.

        Args:
            scenarios: List of WhatIfScenario objects to compare.
            comparison_id: Optional caller-supplied ID.

        Returns:
            ComparisonResult with ranked InterventionDelta objects.
        """

        cid = comparison_id or f"cmp-{uuid.uuid4().hex[:8]}"

        if not scenarios:
            return InterventionComparison.build(
                comparison_id=cid,
                region="unknown",
                hazard_type="unknown",
                baseline_casualties=0,
                deltas=[],
            )

        # Analyse each scenario.
        results = [self.analyze(s) for s in scenarios]
        deltas = [r.to_delta() for r in results]

        baseline = scenarios[0].baseline

        return InterventionComparison.build(
            comparison_id=cid,
            region=baseline.region,
            hazard_type=baseline.hazard_type,
            baseline_casualties=results[0].baseline_casualties,
            deltas=deltas,
        )

    def health(self) -> Dict[str, Any]:
        """Return service liveness summary."""

        return {
            "service": "what_if_engine",
            "status": "ok",
            "supported_interventions": list(_EFFECT_TABLE.keys()),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    # --------------------------------------------------------
    # Internal helpers
    # --------------------------------------------------------

    def _compute_effectiveness(
        self,
        scenario: WhatIfScenario,
        baseline: BaselineScenario,
    ) -> float:
        """
        Compute a scalar [0, 1] effectiveness multiplier for this intervention.

        Considers:
            - Baseline pre-warning lead time
            - Baseline resource pre-positioning score
            - Scenario-specific parameter magnitudes
        """

        # Base effectiveness: proportion of ideal conditions already met.
        base = (
            0.4 * min(baseline.pre_warning_hours / 24.0, 1.0)
            + 0.4 * baseline.resource_pre_positioning_score
            + 0.2 * (1.0 - baseline.infrastructure_vulnerability)
        )

        # Boost from scenario parameters.
        param_boost = 0.0

        for param in scenario.parameters:
            name = param.name.lower()

            if "warning" in name or "lead" in name:
                param_boost += min(
                    0.25, param.value / 48.0
                )

            elif "efficiency" in name or "capacity" in name:
                param_boost += min(0.20, param.value)

            elif "coverage" in name:
                param_boost += min(0.15, param.value)

        return min(1.0, base + param_boost)


# ============================================================
# Public exports
# ============================================================

__all__ = [
    "WhatIfEngine",
    "WhatIfResult",
]
