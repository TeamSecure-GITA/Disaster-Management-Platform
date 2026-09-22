"""
Longitudinal hazard frequency, severity escalation, and recurrence analysis.
"""

from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
from typing import Any, Dict, List, Optional
import numpy as np


@dataclass
class HazardTrendSummary:
    hazard_type: str
    total_events: int
    frequency_slope: float  # events per time interval change
    average_severity: float
    severity_direction: str  # "escalating", "stable", "de-escalating"
    recurrence_interval_days: float
    projected_next_30d_events: int

    def to_dict(self) -> Dict[str, Any]:
        return {
            "hazard_type": self.hazard_type,
            "total_events": self.total_events,
            "frequency_slope": round(self.frequency_slope, 4),
            "average_severity": round(self.average_severity, 2),
            "severity_direction": self.severity_direction,
            "recurrence_interval_days": round(self.recurrence_interval_days, 1),
            "projected_next_30d_events": self.projected_next_30d_events,
        }


def analyze_hazard_trends(
    records: List[Dict[str, Any]],
    hazard_type_key: str = "hazard_type",
    severity_key: str = "severity_score",
    timestamp_key: str = "timestamp",
) -> Dict[str, HazardTrendSummary]:
    """Analyzes historical hazard records to extract longitudinal trends and escalation."""
    by_type: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
    for r in records:
        htype = str(r.get(hazard_type_key, "general"))
        by_type[htype].append(r)

    summaries: Dict[str, HazardTrendSummary] = {}

    for htype, items in by_type.items():
        n = len(items)
        if n == 0:
            continue

        severities = [float(it.get(severity_key, 0.5)) for it in items]
        avg_sev = float(np.mean(severities))

        # Check severity direction
        if n >= 3:
            first_half = np.mean(severities[: n // 2])
            second_half = np.mean(severities[n // 2 :])
            diff = second_half - first_half
            direction = "escalating" if diff > 0.05 else "de-escalating" if diff < -0.05 else "stable"
            slope = float(diff / (n / 2.0))
        else:
            direction = "stable"
            slope = 0.0

        recurrence = max(1.0, 365.0 / max(1, n))
        proj_30d = int(max(0, round((n / 365.0) * 30.0 * (1.2 if direction == "escalating" else 1.0))))

        summaries[htype] = HazardTrendSummary(
            hazard_type=htype,
            total_events=n,
            frequency_slope=slope,
            average_severity=avg_sev,
            severity_direction=direction,
            recurrence_interval_days=recurrence,
            projected_next_30d_events=proj_30d,
        )

    return summaries
