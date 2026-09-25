from __future__ import annotations

import numpy as np
from sklearn.metrics import (
    explained_variance_score,
    mean_absolute_error,
    mean_absolute_percentage_error,
    mean_squared_error,
    r2_score,
)


class RegressionEvaluator:
    """Evaluates continuous regression models."""

    @staticmethod
    def evaluate(
        y_true: list[float] | np.ndarray,
        y_pred: list[float] | np.ndarray,
    ) -> dict[str, float]:
        y_t = np.array(y_true, dtype=float)
        y_p = np.array(y_pred, dtype=float)

        mae = float(mean_absolute_error(y_t, y_p))
        mse = float(mean_squared_error(y_t, y_p))
        rmse = float(np.sqrt(mse))
        r2 = float(r2_score(y_t, y_p))
        evs = float(explained_variance_score(y_t, y_p))

        try:
            mape = float(mean_absolute_percentage_error(y_t, y_p))
        except Exception:
            mape = 0.0

        return {
            "mae": mae,
            "mse": mse,
            "rmse": rmse,
            "r2": r2,
            "mape": mape,
            "explained_variance": evs,
        }
