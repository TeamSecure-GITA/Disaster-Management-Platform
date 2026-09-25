from __future__ import annotations

import numpy as np
from sklearn.metrics import average_precision_score, confusion_matrix, f1_score, precision_score, recall_score, roc_auc_score


class AnomalyEvaluator:
    """Evaluates sensor anomaly detection performance against ground truth labels."""

    @staticmethod
    def evaluate(
        y_true: list[int] | np.ndarray,
        anomaly_scores: list[float] | np.ndarray,
        threshold: float | None = None,
    ) -> dict[str, float]:
        yt = np.array(y_true, dtype=int)
        scores = np.array(anomaly_scores, dtype=float)

        # Standardize labels if {1, -1}
        if -1 in yt:
            yt = np.where(yt == -1, 1, 0)

        # If threshold not given, use 95th percentile
        if threshold is None:
            threshold = float(np.percentile(scores, 95))

        y_pred = (scores >= threshold).astype(int)

        tn, fp, fn, tp = confusion_matrix(yt, y_pred, labels=[0, 1]).ravel()
        fpr = float(fp / (fp + tn)) if (fp + tn) > 0 else 0.0

        metrics = {
            "threshold": float(threshold),
            "precision": float(precision_score(yt, y_pred, zero_division=0)),
            "recall": float(recall_score(yt, y_pred, zero_division=0)),
            "f1": float(f1_score(yt, y_pred, zero_division=0)),
            "false_positive_rate": fpr,
            "true_positives": float(tp),
            "false_positives": float(fp),
            "false_negatives": float(fn),
        }

        try:
            metrics["pr_auc"] = float(average_precision_score(yt, scores))
            metrics["roc_auc"] = float(roc_auc_score(yt, scores))
        except Exception:
            pass

        return metrics
