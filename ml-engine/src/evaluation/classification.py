from __future__ import annotations

from typing import Any
import numpy as np
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    f1_score,
    log_loss,
    precision_score,
    recall_score,
    roc_auc_score,
)


class ClassificationEvaluator:
    """Evaluates multi-class and binary classification metrics."""

    @staticmethod
    def evaluate(
        y_true: list[Any] | np.ndarray,
        y_pred: list[Any] | np.ndarray,
        y_prob: list[float] | np.ndarray | None = None,
    ) -> dict[str, Any]:
        y_true_arr = np.array(y_true)
        y_pred_arr = np.array(y_pred)

        metrics: dict[str, Any] = {
            "accuracy": float(accuracy_score(y_true_arr, y_pred_arr)),
            "precision_macro": float(precision_score(y_true_arr, y_pred_arr, average="macro", zero_division=0)),
            "recall_macro": float(recall_score(y_true_arr, y_pred_arr, average="macro", zero_division=0)),
            "f1_macro": float(f1_score(y_true_arr, y_pred_arr, average="macro", zero_division=0)),
            "precision_weighted": float(precision_score(y_true_arr, y_pred_arr, average="weighted", zero_division=0)),
            "recall_weighted": float(recall_score(y_true_arr, y_pred_arr, average="weighted", zero_division=0)),
            "f1_weighted": float(f1_score(y_true_arr, y_pred_arr, average="weighted", zero_division=0)),
            "detailed_report": classification_report(y_true_arr, y_pred_arr, output_dict=True, zero_division=0),
        }

        if y_prob is not None:
            try:
                y_prob_arr = np.array(y_prob)
                if len(np.unique(y_true_arr)) == 2:
                    metrics["roc_auc"] = float(roc_auc_score(y_true_arr, y_prob_arr))
                    metrics["log_loss"] = float(log_loss(y_true_arr, y_prob_arr))
                else:
                    metrics["roc_auc_ovr"] = float(roc_auc_score(y_true_arr, y_prob_arr, multi_class="ovr"))
            except Exception:
                pass

        return metrics
