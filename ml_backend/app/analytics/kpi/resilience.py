"""
Disaster and climate resilience KPI analytics.

Computes the Disaster Resilience Index (DRI) aligned with the UNDRR Sendai Framework,
evaluating infrastructure robustness, community adaptation, and recovery velocity.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


@dataclass
class ResilienceDimensions:
    """Four core pillars of regional disaster resilience (0 to 100 each)."""

    infrastructure_robustness: float
    early_warning_preparedness: float
    community_adaptive_capacity: float
    recovery_velocity: float

    def to_dict(self) -> Dict[str, float]:
        return {
            "infrastructure_robustness": round(self.infrastructure_robustness, 2),
            "early_warning_preparedness": round(self.early_warning_preparedness, 2),
            "community_adaptive_capacity": round(self.community_adaptive_capacity, 2),
            "recovery_velocity": round(self.recovery_velocity, 2),
        }


@dataclass
class DisasterResilienceIndex:
    """Consolidated Disaster Resilience Index (DRI) for a region or jurisdiction."""

    region_id: str
    overall_resilience_score: float  # 0 to 100
    resilience_tier: str  # Highly Resilient, Moderate, Vulnerable, Acute Risk
    dimensions: ResilienceDimensions
    gap_priorities: List[str]
    assessed_at: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "region_id": self.region_id,
            "overall_resilience_score": round(self.overall_resilience_score, 2),
            "resilience_tier": self.resilience_tier,
            "dimensions": self.dimensions.to_dict(),
            "gap_priorities": self.gap_priorities,
            "assessed_at": self.assessed_at,
        }


class ResilienceKPICalculator:
    """
    Evaluates multivariable climate adaptation and infrastructure resilience baselines.
    """

    @classmethod
    def calculate_resilience(
        cls,
        region_id: str,
        power_grid_redundancy_pct: float = 80.0,
        water_supply_backup_days: float = 7.0,
        flood_defense_coverage_pct: float = 75.0,
        early_warning_sensor_density_pct: float = 85.0,
        evacuation_route_redundancy_ratio: float = 2.0,
        community_poverty_rate_pct: float = 12.0,
        hospital_bed_capacity_per_1k: float = 3.5,
        service_restoration_rate_pct: float = 90.0,
    ) -> DisasterResilienceIndex:
        """
        Calculate unified resilience score and prioritize systemic gaps.
        """
        # 1. Infrastructure Robustness (0 - 100)
        water_score = min(100.0, (water_supply_backup_days / 14.0) * 100.0)
        infra_score = (
            0.40 * power_grid_redundancy_pct
            + 0.30 * water_score
            + 0.30 * flood_defense_coverage_pct
        )

        # 2. Early Warning & Preparedness (0 - 100)
        route_score = min(100.0, (evacuation_route_redundancy_ratio / 3.0) * 100.0)
        prep_score = 0.60 * early_warning_sensor_density_pct + 0.40 * route_score

        # 3. Community Adaptive Capacity (0 - 100)
        poverty_penalty = max(0.0, min(100.0, 100.0 - (community_poverty_rate_pct * 2.0)))
        hospital_score = min(100.0, (hospital_bed_capacity_per_1k / 5.0) * 100.0)
        community_score = 0.50 * poverty_penalty + 0.50 * hospital_score

        # 4. Recovery Velocity (0 - 100)
        recovery_score = max(0.0, min(100.0, service_restoration_rate_pct))

        # Overall composite resilience score
        overall = (
            0.30 * infra_score
            + 0.25 * prep_score
            + 0.25 * community_score
            + 0.20 * recovery_score
        )
        overall = max(0.0, min(100.0, overall))

        if overall >= 80.0:
            tier = "Highly Resilient"
        elif overall >= 65.0:
            tier = "Moderately Resilient"
        elif overall >= 50.0:
            tier = "Vulnerable"
        else:
            tier = "Acute Risk"

        # Identify key gaps
        gaps = []
        if infra_score < 60.0:
            gaps.append("Upgrade flood defenses and power grid backup redundancy")
        if prep_score < 60.0:
            gaps.append("Expand sensor early-warning telemetry and alternative evacuation corridors")
        if community_score < 60.0:
            gaps.append("Enhance local medical reserve capacity and vulnerable community safety nets")
        if recovery_score < 60.0:
            gaps.append("Accelerate utility mutual-aid agreements and rapid restoration plans")

        if not gaps:
            gaps.append("Maintain routine maintenance and regular disaster simulation drills")

        dims = ResilienceDimensions(
            infrastructure_robustness=infra_score,
            early_warning_preparedness=prep_score,
            community_adaptive_capacity=community_score,
            recovery_velocity=recovery_score,
        )

        return DisasterResilienceIndex(
            region_id=region_id,
            overall_resilience_score=overall,
            resilience_tier=tier,
            dimensions=dims,
            gap_priorities=gaps,
            assessed_at=datetime.now(timezone.utc).isoformat(),
        )
