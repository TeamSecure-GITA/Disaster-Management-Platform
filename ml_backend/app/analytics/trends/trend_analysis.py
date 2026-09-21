"""
Time-series trend analysis and projection.

Calculates linear and exponential trends, moving averages, slope significance,
and short-term extrapolation projections for disaster time series.
"""

from __future__ import annotations

import math
import statistics
from dataclasses import asdict, dataclass, field
from typing import Any, Dict, List, Optional, Sequence, Tuple


@dataclass
class TrendPoint:
    """A point in a time series."""

    timestamp: str  # ISO-8601 or date
    value: float
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class TrendResult:
    """Statistical summary of the identified trend."""

    metric_name: str
    slope: float
    intercept: float
    r_squared: float
    direction: str  # accelerating_growth, steady_increase, stable, steady_decrease, sharp_decline
    percent_change_total: float
    mean_value: float
    min_value: float
    max_value: float
    moving_average_last: float
    projection_next_steps: List[Dict[str, Any]] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "metric_name": self.metric_name,
            "slope": round(self.slope, 4),
            "intercept": round(self.intercept, 4),
            "r_squared": round(self.r_squared, 4),
            "direction": self.direction,
            "percent_change_total": round(self.percent_change_total, 2),
            "mean_value": round(self.mean_value, 4),
            "min_value": round(self.min_value, 4),
            "max_value": round(self.max_value, 4),
            "moving_average_last": round(self.moving_average_last, 4),
            "projection_next_steps": self.projection_next_steps,
        }


class TrendAnalyzer:
    """
    Analyzes temporal trajectories, slopes, and moving averages for disaster telemetry.
    """

    def __init__(self):
        pass

    @staticmethod
    def simple_moving_average(values: Sequence[float], window: int = 5) -> List[float]:
        """Compute simple moving average (SMA) with trailing padding."""
        if not values or window <= 0:
            return []
        n = len(values)
        res: List[float] = []
        for i in range(n):
            start_idx = max(0, i - window + 1)
            window_vals = values[start_idx : i + 1]
            res.append(statistics.mean(window_vals))
        return res

    @staticmethod
    def exponential_moving_average(values: Sequence[float], alpha: float = 0.3) -> List[float]:
        """Compute exponential moving average (EMA) with smoothing factor alpha."""
        if not values:
            return []
        res: List[float] = [values[0]]
        for v in values[1:]:
            res.append(alpha * v + (1.0 - alpha) * res[-1])
        return res

    @classmethod
    def analyze_trend(
        cls,
        values: Sequence[float],
        metric_name: str = "metric",
        projection_steps: int = 5,
        timestamps: Optional[Sequence[str]] = None,
    ) -> TrendResult:
        """
        Fit linear least-squares regression line and project next steps.
        """
        n = len(values)
        if n == 0:
            return TrendResult(
                metric_name=metric_name,
                slope=0.0,
                intercept=0.0,
                r_squared=0.0,
                direction="stable",
                percent_change_total=0.0,
                mean_value=0.0,
                min_value=0.0,
                max_value=0.0,
                moving_average_last=0.0,
                projection_next_steps=[],
            )

        if n == 1:
            return TrendResult(
                metric_name=metric_name,
                slope=0.0,
                intercept=values[0],
                r_squared=1.0,
                direction="stable",
                percent_change_total=0.0,
                mean_value=values[0],
                min_value=values[0],
                max_value=values[0],
                moving_average_last=values[0],
                projection_next_steps=[{"step": 1, "predicted_value": values[0]}],
            )

        x = list(range(n))
        y = list(values)

        mean_x = statistics.mean(x)
        mean_y = statistics.mean(y)

        numerator = sum((x[i] - mean_x) * (y[i] - mean_y) for i in range(n))
        denominator = sum((x[i] - mean_x) ** 2 for i in range(n))

        slope = numerator / denominator if denominator != 0 else 0.0
        intercept = mean_y - slope * mean_x

        # R-squared
        y_pred = [slope * xi + intercept for xi in x]
        ss_tot = sum((yi - mean_y) ** 2 for yi in y)
        ss_res = sum((y[i] - y_pred[i]) ** 2 for i in range(n))
        r2 = 1.0 - (ss_res / ss_tot) if ss_tot > 0 else 1.0
        r2 = max(0.0, min(r2, 1.0))

        # Total % change
        start_val = y[0]
        end_val = y[-1]
        if start_val != 0:
            pct_change = ((end_val - start_val) / abs(start_val)) * 100.0
        else:
            pct_change = 100.0 if end_val > 0 else 0.0

        # Trend direction
        if slope > 0.05 and pct_change >= 20.0:
            direction = "accelerating_growth"
        elif slope > 0.01:
            direction = "steady_increase"
        elif slope < -0.05 and pct_change <= -20.0:
            direction = "sharp_decline"
        elif slope < -0.01:
            direction = "steady_decrease"
        else:
            direction = "stable"

        sma = cls.simple_moving_average(y, window=min(5, n))
        last_sma = sma[-1] if sma else end_val

        # Projections
        projections = []
        for step in range(1, projection_steps + 1):
            future_x = n - 1 + step
            pred_val = slope * future_x + intercept
            projections.append({
                "step": step,
                "predicted_value": round(float(pred_val), 4),
            })

        return TrendResult(
            metric_name=metric_name,
            slope=slope,
            intercept=intercept,
            r_squared=r2,
            direction=direction,
            percent_change_total=pct_change,
            mean_value=mean_y,
            min_value=min(y),
            max_value=max(y),
            moving_average_last=last_sma,
            projection_next_steps=projections,
        )
