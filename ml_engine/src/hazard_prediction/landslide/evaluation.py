"""Landslide model evaluation metrics."""
from __future__ import annotations

import numpy as np
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score


class LandslideEvaluator:
    """Evaluates landslide risk model accuracy and calibration."""

    def evaluate(self, y_true: list[int] | np.ndarray, y_pred_prob: list[float] | np.ndarray) -> dict[str, float]:
        y_t = np.asarray(y_true)
        y_p_prob = np.asarray(y_pred_prob)
        y_p = (y_p_prob >= 0.65).astype(int)

        metrics = {
            "accuracy": float(accuracy_score(y_t, y_p)),
            "precision": float(precision_score(y_t, y_p, zero_division=0)),
            "recall": float(recall_score(y_t, y_p, zero_division=0)),
            "f1": float(f1_score(y_t, y_p, zero_division=0)),
        }
        try:
            metrics["roc_auc"] = float(roc_auc_score(y_t, y_p_prob))
        except Exception:
            metrics["roc_auc"] = 0.5
        return metrics
