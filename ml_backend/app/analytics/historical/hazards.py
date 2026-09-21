"""
Historical hazard event analysis and recurrence estimation.

Evaluates historical hazard frequency, peak intensity distributions, return periods,
and affected population footprints across flood, cyclone, earthquake, and wildfire regimes.
"""

from __future__ import annotations

import math
import statistics
from collections import defaultdict
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Sequence


@dataclass
class HazardEventRecord:
    """Historical archive record of a major hazard event."""

    event_id: str
    hazard_type: str  # flood, earthquake, cyclone, wildfire, landslide, drought
    start_time: str   # ISO-8601
    end_time: Optional[str] = None
    region: str = "unknown"
    peak_intensity: float = 0.0
    intensity_unit: str = ""
    impacted_area_sqkm: float = 0.0
    affected_population: int = 0
    direct_damages_usd: float = 0.0

    @property
    def parsed_start(self) -> datetime:
        try:
            return datetime.fromisoformat(self.start_time)
        except ValueError:
            return datetime.now(timezone.utc)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class HazardHistoricalSummary:
    """Consolidated historical profile and return period estimation for a hazard type."""

    hazard_type: str
    total_events: int
    annual_frequency: float
    min_intensity: float
    max_intensity: float
    mean_intensity: float
    p90_intensity: float
    intensity_unit: str
    total_area_impacted_sqkm: float
    total_affected_population: int
    total_direct_damages_usd: float
    high_risk_months: List[int]
    return_periods: Dict[str, float] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data["mean_intensity"] = round(self.mean_intensity, 3)
        data["p90_intensity"] = round(self.p90_intensity, 3)
        data["annual_frequency"] = round(self.annual_frequency, 2)
        return data


class HistoricalHazardAnalyzer:
    """
    Computes recurrence statistics, return periods, and historical hazard baselines.
    """

    def __init__(self, events: Optional[Sequence[HazardEventRecord]] = None):
        self.events: List[HazardEventRecord] = list(events or [])

    def add_events(self, events: Sequence[HazardEventRecord]) -> None:
        self.events.extend(events)

    def estimate_return_periods(
        self,
        intensities: List[float],
        observation_years: float,
    ) -> Dict[str, float]:
        """
        Estimate recurrence intervals / return periods using Weibull plotting position:
        T = (N + 1) / m, where m is rank (descending).
        Interpolates return levels for 2-yr, 5-yr, 10-yr, 25-yr, 50-yr, 100-yr events.
        """
        if not intensities or observation_years <= 0:
            return {}

        sorted_desc = sorted(intensities, reverse=True)
        n = len(sorted_desc)

        empirical_return_levels = []
        for rank, val in enumerate(sorted_desc, start=1):
            t_return = (observation_years + 1.0) / rank
            empirical_return_levels.append((t_return, val))

        targets = [2.0, 5.0, 10.0, 25.0, 50.0, 100.0]
        result: Dict[str, float] = {}

        for t in targets:
            # Linear interpolation / extrapolation
            lower = [pt for pt in empirical_return_levels if pt[0] <= t]
            upper = [pt for pt in empirical_return_levels if pt[0] >= t]

            if upper and lower:
                p1 = max(lower, key=lambda x: x[0])
                p2 = min(upper, key=lambda x: x[0])
                if p1[0] == p2[0]:
                    est = p1[1]
                else:
                    ratio = (t - p1[0]) / (p2[0] - p1[0])
                    est = p1[1] + ratio * (p2[1] - p1[1])
            elif upper:
                est = min(upper, key=lambda x: x[0])[1]
            elif lower:
                est = max(lower, key=lambda x: x[0])[1]
            else:
                est = sorted_desc[0]

            result[f"{int(t)}_year"] = round(float(est), 2)

        return result

    def analyze_hazard_type(
        self,
        hazard_type: str,
        observation_years: Optional[float] = None,
    ) -> HazardHistoricalSummary:
        """Construct detailed historical summary for a specific hazard category."""
        matched = [e for e in self.events if e.hazard_type.lower() == hazard_type.lower()]

        if not matched:
            return HazardHistoricalSummary(
                hazard_type=hazard_type,
                total_events=0,
                annual_frequency=0.0,
                min_intensity=0.0,
                max_intensity=0.0,
                mean_intensity=0.0,
                p90_intensity=0.0,
                intensity_unit="",
                total_area_impacted_sqkm=0.0,
                total_affected_population=0,
                total_direct_damages_usd=0.0,
                high_risk_months=[],
                return_periods={},
            )

        intensities = [e.peak_intensity for e in matched if e.peak_intensity > 0]
        sorted_intensities = sorted(intensities) if intensities else [0.0]
        n_int = len(sorted_intensities)

        dates = [e.parsed_start for e in matched]
        min_date = min(dates)
        max_date = max(dates)
        span_years = observation_years or max((max_date - min_date).days / 365.25, 1.0)

        month_counts: Dict[int, int] = defaultdict(int)
        for d in dates:
            month_counts[d.month] += 1

        # Months with above-average event frequency
        avg_monthly = len(matched) / 12.0
        high_months = sorted([m for m, count in month_counts.items() if count >= avg_monthly])

        p90_idx = int(0.90 * (n_int - 1))
        p90_val = sorted_intensities[min(p90_idx, n_int - 1)]

        return_periods = self.estimate_return_periods(intensities, span_years)

        return HazardHistoricalSummary(
            hazard_type=hazard_type,
            total_events=len(matched),
            annual_frequency=len(matched) / span_years,
            min_intensity=sorted_intensities[0],
            max_intensity=sorted_intensities[-1],
            mean_intensity=statistics.mean(intensities) if intensities else 0.0,
            p90_intensity=p90_val,
            intensity_unit=matched[0].intensity_unit if matched else "",
            total_area_impacted_sqkm=sum(e.impacted_area_sqkm for e in matched),
            total_affected_population=sum(e.affected_population for e in matched),
            total_direct_damages_usd=sum(e.direct_damages_usd for e in matched),
            high_risk_months=high_months,
            return_periods=return_periods,
        )

    def summarize_all(self) -> Dict[str, Dict[str, Any]]:
        """Generate summaries for all represented hazard categories."""
        types = set(e.hazard_type.lower() for e in self.events)
        return {ht: self.analyze_hazard_type(ht).to_dict() for ht in sorted(types)}
