"""Sensor anomaly detection evaluation."""
from __future__ import annotations

import numpy as np
from sklearn.metrics import precision_score, recall_score, f1_score


class SensorAnomalyEvaluator:
    """Evaluates precision, recall, and false positive rates on benchmark ground truth."""

    def evaluate(self, y_true: np.ndarray, y_pred: np.ndarray) -> dict[str, float]:
        yt = np.asarray(y_true).astype(int)
        yp = np.asarray(y_pred).astype(int)
        return {
            "precision": float(precision_score(yt, yp, zero_division=0)),
            "recall": float(recall_score(yt, yp, zero_division=0)),
            "f1": float(f1_score(yt, yp, zero_division=0)),
            "false_alarm_rate": float(np.mean((yp == 1) & (yt == 0))),
        }
