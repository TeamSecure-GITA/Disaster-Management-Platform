from __future__ import annotations

from typing import Any
import numpy as np
import pandas as pd


class ErrorAnalyzer:
    """Performs deep failure and error analysis on predictions."""

    @staticmethod
    def find_misclassifications(
        df: pd.DataFrame,
        y_true: list[Any] | np.ndarray,
        y_pred: list[Any] | np.ndarray,
        y_prob: list[float] | np.ndarray | None = None,
        top_k: int = 10,
    ) -> list[dict[str, Any]]:
        yt = np.array(y_true)
        yp = np.array(y_pred)
        mask = yt != yp

        if not np.any(mask):
            return []

        error_indices = np.where(mask)[0]
        subset = df.iloc[error_indices].copy()
        subset["_true_label"] = yt[error_indices]
        subset["_pred_label"] = yp[error_indices]

        if y_prob is not None:
            subset["_confidence"] = np.array(y_prob)[error_indices]
            # Sort by highest confidence in wrong answer
            subset = subset.sort_values(by="_confidence", ascending=False)

        return subset.head(top_k).to_dict(orient="records")

    @staticmethod
    def regression_residuals(
        y_true: list[float] | np.ndarray,
        y_pred: list[float] | np.ndarray,
    ) -> dict[str, float]:
        yt = np.array(y_true, dtype=float)
        yp = np.array(y_pred, dtype=float)
        residuals = yp - yt

        return {
            "mean_residual": float(np.mean(residuals)),
            "std_residual": float(np.std(residuals)),
            "max_underestimation": float(np.min(residuals)),
            "max_overestimation": float(np.max(residuals)),
            "skewness": float(
                np.mean((residuals - np.mean(residuals)) ** 3) / (np.std(residuals) ** 3 + 1e-8)
            ),
        }
