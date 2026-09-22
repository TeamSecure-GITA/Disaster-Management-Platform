"""
Regression and continuous forecasting model metrics.
Calculates RMSE, MAE, MAPE, R-squared, and Peak Inundation/Wind Error.
"""

from __future__ import annotations

import math
from typing import Any, Dict, Sequence
import numpy as np


def compute_regression_metrics(
    y_true: Sequence[float],
    y_pred: Sequence[float],
) -> Dict[str, Any]:
    """Computes regression accuracy and error metrics."""
    if len(y_true) != len(y_pred) or len(y_true) == 0:
        return {"error": "Invalid or empty inputs", "sample_size": 0}

    yt = np.array(y_true, dtype=float)
    yp = np.array(y_pred, dtype=float)
    n = len(yt)

    errors = yp - yt
    mae = float(np.mean(np.abs(errors)))
    rmse = float(np.sqrt(np.mean(errors ** 2)))
    mean_bias = float(np.mean(errors))

    # MAPE (ignoring near-zero true values to avoid division by zero)
    nonzero_mask = np.abs(yt) > 1e-4
    if np.any(nonzero_mask):
        mape = float(np.mean(np.abs(errors[nonzero_mask] / yt[nonzero_mask])) * 100.0)
    else:
        mape = 0.0

    # R2
    ss_res = np.sum(errors ** 2)
    ss_tot = np.sum((yt - np.mean(yt)) ** 2)
    r2 = float(1.0 - (ss_res / ss_tot)) if ss_tot > 1e-9 else 0.0

    # Peak error
    peak_true = float(np.max(yt))
    peak_pred = float(np.max(yp))
    peak_error = abs(peak_pred - peak_true)

    return {
        "mae": round(mae, 4),
        "rmse": round(rmse, 4),
        "mean_bias_error": round(mean_bias, 4),
        "mape_pct": round(mape, 2),
        "r2": round(max(-1.0, r2), 4),
        "peak_true": round(peak_true, 3),
        "peak_pred": round(peak_pred, 3),
        "peak_error": round(peak_error, 3),
        "sample_size": n,
    }
