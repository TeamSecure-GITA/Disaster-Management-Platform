"""Wind time-series forecast evaluation."""
from __future__ import annotations

import numpy as np
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score


class WindTimeSeriesEvaluator:
    """Calculates RMSE, MAE, MAPE, and R2 scores."""

    def evaluate(self, y_true: np.ndarray, y_pred: np.ndarray) -> dict[str, float]:
        mse = mean_squared_error(y_true, y_pred)
        mae = mean_absolute_error(y_true, y_pred)
        rmse = float(np.sqrt(mse))
        r2 = float(r2_score(y_true, y_pred)) if len(y_true) > 1 else 1.0
        mape = float(np.mean(np.abs((y_true - y_pred) / np.maximum(np.abs(y_true), 1e-5))) * 100)
        return {
            "rmse": rmse,
            "mae": float(mae),
            "mape": mape,
            "r2": r2,
        }
