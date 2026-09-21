"""
Seasonality and cyclical pattern analysis for climate hazards.

Decomposes periodic behavior across annual (monthly), weekly, or diurnal cycles
to identify peak hazard windows (e.g., monsoon, wildfire season) and compute seasonal indices.
"""

from __future__ import annotations

import statistics
from collections import defaultdict
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Sequence, Tuple


@dataclass
class SeasonalIndex:
    """Seasonal factor for a specific cyclical period."""

    period_index: int  # e.g., month 1-12 or hour 0-23
    period_label: str  # e.g., "January", "Monday", "14:00"
    seasonal_factor: float  # Multiplier relative to baseline (1.0 = average)
    sample_count: int
    mean_value: float

    def to_dict(self) -> Dict[str, Any]:
        return {
            "period_index": self.period_index,
            "period_label": self.period_label,
            "seasonal_factor": round(self.seasonal_factor, 3),
            "sample_count": self.sample_count,
            "mean_value": round(self.mean_value, 4),
        }


@dataclass
class SeasonalityProfile:
    """Complete cyclical profile of a disaster phenomenon."""

    cycle_type: str  # monthly, weekly, diurnal
    baseline_level: float
    peak_period: str
    trough_period: str
    seasonal_amplitude: float
    indices: List[SeasonalIndex] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "cycle_type": self.cycle_type,
            "baseline_level": round(self.baseline_level, 4),
            "peak_period": self.peak_period,
            "trough_period": self.trough_period,
            "seasonal_amplitude": round(self.seasonal_amplitude, 3),
            "indices": [idx.to_dict() for idx in self.indices],
        }


class SeasonalityDecomposer:
    """
    Decomposes disaster time-series into seasonal indices and cyclical baselines.
    """

    MONTH_NAMES = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]

    DAY_NAMES = [
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
    ]

    @classmethod
    def decompose_monthly(
        cls,
        dated_values: Sequence[Tuple[str, float]],
    ) -> SeasonalityProfile:
        """
        Compute monthly seasonality indices from a series of (ISO-timestamp, value) tuples.
        """
        if not dated_values:
            return SeasonalityProfile(
                cycle_type="monthly",
                baseline_level=0.0,
                peak_period="",
                trough_period="",
                seasonal_amplitude=0.0,
                indices=[],
            )

        buckets: Dict[int, List[float]] = defaultdict(list)
        all_vals: List[float] = []

        for ts_str, val in dated_values:
            try:
                dt = datetime.fromisoformat(ts_str)
                m = dt.month  # 1-12
                buckets[m].append(val)
                all_vals.append(val)
            except ValueError:
                continue

        if not all_vals:
            return SeasonalityProfile("monthly", 0.0, "", "", 0.0, [])

        overall_mean = statistics.mean(all_vals)
        if overall_mean == 0:
            overall_mean = 1.0  # Prevent division by zero

        indices: List[SeasonalIndex] = []
        for m in range(1, 13):
            vals = buckets.get(m, [])
            m_mean = statistics.mean(vals) if vals else 0.0
            factor = (m_mean / overall_mean) if overall_mean > 0 else 1.0
            indices.append(
                SeasonalIndex(
                    period_index=m,
                    period_label=cls.MONTH_NAMES[m - 1],
                    seasonal_factor=factor,
                    sample_count=len(vals),
                    mean_value=m_mean,
                )
            )

        indices_sorted = sorted(indices, key=lambda x: x.seasonal_factor)
        peak = indices_sorted[-1].period_label
        trough = indices_sorted[0].period_label
        amplitude = indices_sorted[-1].seasonal_factor - indices_sorted[0].seasonal_factor

        return SeasonalityProfile(
            cycle_type="monthly",
            baseline_level=overall_mean,
            peak_period=peak,
            trough_period=trough,
            seasonal_amplitude=amplitude,
            indices=indices,
        )

    @classmethod
    def decompose_weekly(
        cls,
        dated_values: Sequence[Tuple[str, float]],
    ) -> SeasonalityProfile:
        """
        Compute day-of-week seasonality (0 = Monday, 6 = Sunday).
        """
        if not dated_values:
            return SeasonalityProfile("weekly", 0.0, "", "", 0.0, [])

        buckets: Dict[int, List[float]] = defaultdict(list)
        all_vals: List[float] = []

        for ts_str, val in dated_values:
            try:
                dt = datetime.fromisoformat(ts_str)
                d = dt.weekday()
                buckets[d].append(val)
                all_vals.append(val)
            except ValueError:
                continue

        if not all_vals:
            return SeasonalityProfile("weekly", 0.0, "", "", 0.0, [])

        overall_mean = statistics.mean(all_vals)
        indices: List[SeasonalIndex] = []

        for d in range(7):
            vals = buckets.get(d, [])
            d_mean = statistics.mean(vals) if vals else 0.0
            factor = (d_mean / overall_mean) if overall_mean > 0 else 1.0
            indices.append(
                SeasonalIndex(
                    period_index=d,
                    period_label=cls.DAY_NAMES[d],
                    seasonal_factor=factor,
                    sample_count=len(vals),
                    mean_value=d_mean,
                )
            )

        indices_sorted = sorted(indices, key=lambda x: x.seasonal_factor)
        return SeasonalityProfile(
            cycle_type="weekly",
            baseline_level=overall_mean,
            peak_period=indices_sorted[-1].period_label,
            trough_period=indices_sorted[0].period_label,
            seasonal_amplitude=indices_sorted[-1].seasonal_factor - indices_sorted[0].seasonal_factor,
            indices=indices,
        )
