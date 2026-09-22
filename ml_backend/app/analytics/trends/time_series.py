"""
Time series trend detection, moving average smoothing, and slope analysis.
"""

from __future__ import annotations

import math
from typing import Any, Dict, List, Sequence, Tuple
import numpy as np


def compute_moving_average(series: Sequence[float], window_size: int = 5) -> List[float]:
    """Calculates simple moving average with edge replication."""
    if not series:
        return []
    if len(series) < window_size:
        return list(series)

    arr = np.array(series, dtype=float)
    cumsum = np.cumsum(np.insert(arr, 0, 0))
    smoothed = (cumsum[window_size:] - cumsum[:-window_size]) / float(window_size)
    # Pad beginning
    pad = [float(smoothed[0])] * (window_size - 1)
    return pad + smoothed.tolist()


def compute_exponential_smoothing(series: Sequence[float], alpha: float = 0.3) -> List[float]:
    """Calculates single exponential smoothing (0 < alpha <= 1)."""
    if not series:
        return []
    smoothed = [float(series[0])]
    for i in range(1, len(series)):
        val = alpha * series[i] + (1.0 - alpha) * smoothed[-1]
        smoothed.append(float(val))
    return smoothed


def detect_trend_slope(series: Sequence[float]) -> Dict[str, Any]:
    """
    Fits simple linear regression y = mx + c to determine trend direction and strength.
    """
    n = len(series)
    if n < 2:
        return {"slope": 0.0, "intercept": series[0] if series else 0.0, "direction": "flat", "r2": 0.0}

    x = np.arange(n, dtype=float)
    y = np.array(series, dtype=float)

    x_mean = np.mean(x)
    y_mean = np.mean(y)

    ss_xx = np.sum((x - x_mean) ** 2)
    ss_xy = np.sum((x - x_mean) * (y - y_mean))

    if ss_xx < 1e-9:
        slope = 0.0
        intercept = float(y_mean)
        r2 = 0.0
    else:
        slope = float(ss_xy / ss_xx)
        intercept = float(y_mean - slope * x_mean)
        y_pred = slope * x + intercept
        ss_res = np.sum((y - y_pred) ** 2)
        ss_tot = np.sum((y - y_mean) ** 2)
        r2 = float(1.0 - (ss_res / ss_tot)) if ss_tot > 1e-9 else 0.0

    direction = "increasing" if slope > 0.02 else "decreasing" if slope < -0.02 else "stable"

    return {
        "slope": round(slope, 5),
        "intercept": round(intercept, 4),
        "direction": direction,
        "r2": round(max(0.0, r2), 4),
        "change_pct": round(float(((y[-1] - y[0]) / max(abs(y[0]), 1e-4)) * 100.0), 2) if n > 0 else 0.0,
    }
