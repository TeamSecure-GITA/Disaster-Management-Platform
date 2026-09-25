from __future__ import annotations

import numpy as np


class HazardMetrics:
    """Standard meteorological and early-warning hazard verification metrics (Threat Score, FAR, POD, ETS, Brier Score)."""

    @staticmethod
    def contingency_table(
        y_true: np.ndarray, y_pred: np.ndarray
    ) -> tuple[float, float, float, float]:
        """Returns (hits/TP, false_alarms/FP, misses/FN, correct_negatives/TN)."""
        tp = float(np.sum((y_true == 1) & (y_pred == 1)))
        fp = float(np.sum((y_true == 0) & (y_pred == 1)))
        fn = float(np.sum((y_true == 1) & (y_pred == 0)))
        tn = float(np.sum((y_true == 0) & (y_pred == 0)))
        return tp, fp, fn, tn

    @classmethod
    def evaluate_warnings(
        cls,
        y_true: list[int] | np.ndarray,
        y_pred: list[int] | np.ndarray,
        probabilities: list[float] | np.ndarray | None = None,
    ) -> dict[str, float]:
        yt = np.array(y_true, dtype=int)
        yp = np.array(y_pred, dtype=int)
        tp, fp, fn, tn = cls.contingency_table(yt, yp)

        total = tp + fp + fn + tn
        pod = tp / (tp + fn) if (tp + fn) > 0 else 0.0  # Probability of Detection
        far = fp / (tp + fp) if (tp + fp) > 0 else 0.0  # False Alarm Ratio
        csi = tp / (tp + fp + fn) if (tp + fp + fn) > 0 else 0.0  # Critical Success Index
        bias = (tp + fp) / (tp + fn) if (tp + fn) > 0 else 1.0  # Frequency Bias

        # Equitable Threat Score (ETS)
        hits_random = ((tp + fn) * (tp + fp)) / total if total > 0 else 0.0
        ets_denom = tp + fp + fn - hits_random
        ets = (tp - hits_random) / ets_denom if ets_denom != 0 else 0.0

        metrics = {
            "probability_of_detection_pod": float(pod),
            "false_alarm_ratio_far": float(far),
            "critical_success_index_csi": float(csi),
            "frequency_bias": float(bias),
            "equitable_threat_score_ets": float(ets),
            "hits": tp,
            "false_alarms": fp,
            "misses": fn,
            "correct_negatives": tn,
        }

        # Brier Score for probability calibration
        if probabilities is not None:
            probs = np.array(probabilities, dtype=float)
            brier = float(np.mean((probs - yt) ** 2))
            metrics["brier_score"] = brier

        return metrics
