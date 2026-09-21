"""
Risk scoring and hazard priority evaluation engine.

Computes multi-hazard composite risk scores by combining ML model prediction
probabilities with population exposure, infrastructure vulnerability, and
environmental severity factors.

Risk outputs drive prioritization across dispatch, evacuation, and resource engines.
"""

from __future__ import annotations

import math
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional


class RiskLevel(str, Enum):
    """Standardized risk severity tiers aligned with NDMA guidelines."""
    NEGLIGIBLE = "negligible"
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    CRITICAL = "critical"
    CATASTROPHIC = "catastrophic"


class HazardType(str, Enum):
    FLOOD = "flood"
    LANDSLIDE = "landslide"
    CYCLONE = "cyclone"
    EARTHQUAKE = "earthquake"
    WILDFIRE = "wildfire"
    DROUGHT = "drought"
    TSUNAMI = "tsunami"
    INDUSTRIAL = "industrial"


@dataclass
class HazardInput:
    """Input signal for a specific hazard event or prediction."""

    hazard_type: HazardType
    ml_probability: float       # 0.0 – 1.0 ML model output
    severity_index: float       # 0.0 – 1.0 environmental severity
    population_at_risk: int     # Estimated people in impact zone
    infrastructure_vulnerability: float  # 0.0 – 1.0
    spatial_extent_sqkm: float  # Area covered
    region: str = "unknown"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class RiskAssessment:
    """Evaluated risk assessment for a single hazard event."""

    hazard_type: str
    region: str
    composite_risk_score: float          # 0.0 – 100.0
    risk_level: RiskLevel
    ml_probability: float
    severity_index: float
    population_at_risk: int
    infrastructure_vulnerability: float
    spatial_extent_sqkm: float
    response_priority_rank: int          # 1 = highest priority
    recommended_actions: List[str]
    assessed_at: str

    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data["risk_level"] = self.risk_level.value
        return data


@dataclass
class MultiHazardRiskSummary:
    """Aggregated multi-hazard regional risk summary."""

    region: str
    overall_risk_level: RiskLevel
    highest_risk_hazard: str
    total_population_at_risk: int
    hazard_assessments: List[RiskAssessment]
    composite_risk_score: float
    requires_immediate_action: bool
    evaluated_at: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "region": self.region,
            "overall_risk_level": self.overall_risk_level.value,
            "highest_risk_hazard": self.highest_risk_hazard,
            "total_population_at_risk": self.total_population_at_risk,
            "composite_risk_score": round(self.composite_risk_score, 2),
            "requires_immediate_action": self.requires_immediate_action,
            "evaluated_at": self.evaluated_at,
            "hazard_assessments": [a.to_dict() for a in self.hazard_assessments],
        }


# Hazard-specific weight profiles (ML probability dominance, severity impact)
_HAZARD_WEIGHTS: Dict[str, Dict[str, float]] = {
    HazardType.FLOOD.value:       {"ml": 0.40, "severity": 0.30, "exposure": 0.20, "infra": 0.10},
    HazardType.LANDSLIDE.value:   {"ml": 0.45, "severity": 0.30, "exposure": 0.15, "infra": 0.10},
    HazardType.CYCLONE.value:     {"ml": 0.35, "severity": 0.35, "exposure": 0.20, "infra": 0.10},
    HazardType.EARTHQUAKE.value:  {"ml": 0.35, "severity": 0.25, "exposure": 0.25, "infra": 0.15},
    HazardType.WILDFIRE.value:    {"ml": 0.40, "severity": 0.30, "exposure": 0.20, "infra": 0.10},
    HazardType.TSUNAMI.value:     {"ml": 0.40, "severity": 0.30, "exposure": 0.25, "infra": 0.05},
    HazardType.DROUGHT.value:     {"ml": 0.30, "severity": 0.25, "exposure": 0.35, "infra": 0.10},
    HazardType.INDUSTRIAL.value:  {"ml": 0.40, "severity": 0.30, "exposure": 0.20, "infra": 0.10},
}

_DEFAULT_WEIGHTS: Dict[str, float] = {
    "ml": 0.40, "severity": 0.30, "exposure": 0.20, "infra": 0.10
}


def _risk_level_from_score(score: float) -> RiskLevel:
    if score >= 85.0:
        return RiskLevel.CATASTROPHIC
    if score >= 70.0:
        return RiskLevel.CRITICAL
    if score >= 55.0:
        return RiskLevel.HIGH
    if score >= 40.0:
        return RiskLevel.MODERATE
    if score >= 20.0:
        return RiskLevel.LOW
    return RiskLevel.NEGLIGIBLE


def _recommended_actions(risk_level: RiskLevel, hazard_type: str) -> List[str]:
    actions: List[str] = []
    if risk_level in (RiskLevel.CATASTROPHIC, RiskLevel.CRITICAL):
        actions.append("Issue immediate public emergency alert")
        actions.append("Activate full emergency operations center (EOC)")
        actions.append("Mobilize all available search-and-rescue units")
        actions.append(f"Initiate mandatory evacuation for {hazard_type} impact zones")
        actions.append("Request inter-agency mutual aid and national disaster relief forces")
    elif risk_level == RiskLevel.HIGH:
        actions.append("Issue high-priority public warning")
        actions.append("Activate shelter-in-place or pre-evacuation advisories")
        actions.append("Pre-position emergency response units in staging areas")
        actions.append("Open emergency shelters and reception centers")
    elif risk_level == RiskLevel.MODERATE:
        actions.append("Issue precautionary advisories to vulnerable zones")
        actions.append("Deploy rapid assessment teams for field reconnaissance")
        actions.append("Ensure emergency shelters are on standby alert")
    else:
        actions.append("Continue monitoring and routine data collection")
        actions.append("Brief local emergency coordinators")
    return actions


class RiskEngine:
    """
    Multi-hazard risk scoring and prioritization engine.

    Combines ML probability estimates with environmental severity, population
    exposure, and infrastructure vulnerability to generate composite risk scores
    that drive dispatch, evacuation, and resource allocation decisions.

    Example::

        engine = RiskEngine()
        assessment = engine.assess_hazard(HazardInput(
            hazard_type=HazardType.FLOOD,
            ml_probability=0.82,
            severity_index=0.75,
            population_at_risk=45000,
            infrastructure_vulnerability=0.60,
            spatial_extent_sqkm=120.0,
            region="Brahmaputra Valley",
        ))
    """

    def __init__(
        self,
        probability_threshold_warn: float = 0.50,
        probability_threshold_critical: float = 0.75,
        max_exposure_reference: int = 100_000,
    ):
        self.probability_threshold_warn = probability_threshold_warn
        self.probability_threshold_critical = probability_threshold_critical
        self.max_exposure_reference = max_exposure_reference

    def assess_hazard(
        self,
        hazard: HazardInput,
        priority_rank: int = 1,
    ) -> RiskAssessment:
        """
        Compute composite risk score and structured assessment for a single hazard.
        """
        weights = _HAZARD_WEIGHTS.get(hazard.hazard_type.value, _DEFAULT_WEIGHTS)

        # Normalize population exposure to [0, 1]
        exposure_norm = min(
            hazard.population_at_risk / max(self.max_exposure_reference, 1),
            1.0,
        )

        # Logarithmic spatial extent scaling
        spatial_scale = min(math.log10(max(hazard.spatial_extent_sqkm, 1.0)) / 4.0, 1.0)

        # Weighted composite score
        raw_score = (
            weights["ml"] * hazard.ml_probability
            + weights["severity"] * hazard.severity_index
            + weights["exposure"] * exposure_norm
            + weights["infra"] * hazard.infrastructure_vulnerability
        )

        # Scale by spatial extent as a multiplicative amplifier (capped at 15% boost)
        composite_score = min(100.0, raw_score * 100.0 * (1.0 + 0.15 * spatial_scale))

        risk_level = _risk_level_from_score(composite_score)
        actions = _recommended_actions(risk_level, hazard.hazard_type.value)

        return RiskAssessment(
            hazard_type=hazard.hazard_type.value,
            region=hazard.region,
            composite_risk_score=round(composite_score, 2),
            risk_level=risk_level,
            ml_probability=hazard.ml_probability,
            severity_index=hazard.severity_index,
            population_at_risk=hazard.population_at_risk,
            infrastructure_vulnerability=hazard.infrastructure_vulnerability,
            spatial_extent_sqkm=hazard.spatial_extent_sqkm,
            response_priority_rank=priority_rank,
            recommended_actions=actions,
            assessed_at=datetime.now(timezone.utc).isoformat(),
        )

    def assess_multi_hazard(
        self,
        region: str,
        hazards: List[HazardInput],
    ) -> MultiHazardRiskSummary:
        """
        Evaluate multiple concurrent hazards for a region and produce a prioritized summary.
        """
        if not hazards:
            return MultiHazardRiskSummary(
                region=region,
                overall_risk_level=RiskLevel.NEGLIGIBLE,
                highest_risk_hazard="none",
                total_population_at_risk=0,
                hazard_assessments=[],
                composite_risk_score=0.0,
                requires_immediate_action=False,
                evaluated_at=datetime.now(timezone.utc).isoformat(),
            )

        # Score all hazards and rank descending
        scored = [self.assess_hazard(h) for h in hazards]
        scored.sort(key=lambda a: a.composite_risk_score, reverse=True)

        # Re-assign priority ranks after sorting
        for rank, assessment in enumerate(scored, start=1):
            assessment.response_priority_rank = rank

        top = scored[0]
        total_pop = sum(h.population_at_risk for h in hazards)

        # Aggregate score: severity-weighted average of top 3 risks
        top3_scores = [a.composite_risk_score for a in scored[:3]]
        aggregate_score = top3_scores[0] if len(top3_scores) == 1 else (
            top3_scores[0] * 0.60
            + top3_scores[1] * 0.30 * (len(top3_scores) > 1)
            + (top3_scores[2] * 0.10 if len(top3_scores) > 2 else 0.0)
        )
        aggregate_score = min(100.0, aggregate_score)

        overall_level = _risk_level_from_score(aggregate_score)
        needs_action = overall_level in (
            RiskLevel.HIGH,
            RiskLevel.CRITICAL,
            RiskLevel.CATASTROPHIC,
        )

        return MultiHazardRiskSummary(
            region=region,
            overall_risk_level=overall_level,
            highest_risk_hazard=top.hazard_type,
            total_population_at_risk=total_pop,
            hazard_assessments=scored,
            composite_risk_score=round(aggregate_score, 2),
            requires_immediate_action=needs_action,
            evaluated_at=datetime.now(timezone.utc).isoformat(),
        )
