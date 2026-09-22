"""
Evacuation Key Performance Indicators (KPIs).
Computes zone clearance velocity, bottleneck ratio, special-needs coverage, and ETA adherence.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List, Optional


@dataclass
class EvacuationKPISummary:
    total_target_population: int
    evacuated_population: int
    clearance_percentage: float
    average_transit_time_minutes: float
    bottleneck_severity_index: float  # 0.0 (smooth) to 1.0 (gridlock)
    special_needs_evacuated_pct: float
    active_corridors_count: int
    congested_corridors_count: int
    estimated_time_to_100pct_clearance_minutes: float

    def to_dict(self) -> Dict[str, Any]:
        return {
            "total_target_population": self.total_target_population,
            "evacuated_population": self.evacuated_population,
            "clearance_percentage": round(self.clearance_percentage, 2),
            "average_transit_time_minutes": round(self.average_transit_time_minutes, 1),
            "bottleneck_severity_index": round(self.bottleneck_severity_index, 3),
            "special_needs_evacuated_pct": round(self.special_needs_evacuated_pct, 2),
            "active_corridors_count": self.active_corridors_count,
            "congested_corridors_count": self.congested_corridors_count,
            "estimated_time_to_100pct_clearance_minutes": round(self.estimated_time_to_100pct_clearance_minutes, 1),
        }


def calculate_evacuation_kpis(
    target_population: int,
    evacuated_count: int,
    transit_times: List[float],
    corridor_utilizations: List[float],  # 0.0 to 1.0+ (where > 0.8 is congested)
    special_needs_total: int = 0,
    special_needs_evacuated: int = 0,
) -> EvacuationKPISummary:
    """Calculates operational KPIs for ongoing evacuation execution."""
    target = max(1, target_population)
    pct = min(100.0, (evacuated_count / target) * 100.0)

    avg_transit = float(sum(transit_times) / len(transit_times)) if transit_times else 45.0
    congested = [u for u in corridor_utilizations if u >= 0.85]
    bottleneck_idx = float(min(1.0, len(congested) / max(1, len(corridor_utilizations))))

    sn_pct = (
        min(100.0, (special_needs_evacuated / max(1, special_needs_total)) * 100.0)
        if special_needs_total > 0
        else 100.0
    )

    remaining = max(0, target - evacuated_count)
    evac_rate_per_min = max(1.0, evacuated_count / max(1.0, avg_transit))
    eta_remaining = remaining / evac_rate_per_min

    return EvacuationKPISummary(
        total_target_population=target_population,
        evacuated_population=evacuated_count,
        clearance_percentage=pct,
        average_transit_time_minutes=avg_transit,
        bottleneck_severity_index=bottleneck_idx,
        special_needs_evacuated_pct=sn_pct,
        active_corridors_count=len(corridor_utilizations),
        congested_corridors_count=len(congested),
        estimated_time_to_100pct_clearance_minutes=eta_remaining,
    )
