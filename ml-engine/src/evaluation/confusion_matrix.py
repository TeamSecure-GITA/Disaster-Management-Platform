from __future__ import annotations

from typing import Any
import numpy as np
from sklearn.metrics import confusion_matrix


class ConfusionMatrixAnalyzer:
    """Analyzes and formats confusion matrices with per-class true/false rates."""

    @staticmethod
    def compute(
        y_true: list[Any] | np.ndarray,
        y_pred: list[Any] | np.ndarray,
        labels: list[str] | None = None,
    ) -> dict[str, Any]:
        yt = np.array(y_true)
        yp = np.array(y_pred)

        unique_labels = labels if labels is not None else list(np.unique(np.concatenate([yt, yp])))
        cm = confusion_matrix(yt, yp, labels=unique_labels)

        # Normalize across rows (true class)
        row_sums = cm.sum(axis=1, keepdims=True)
        cm_norm = np.divide(cm.astype(float), row_sums, out=np.zeros_like(cm, dtype=float), where=row_sums != 0)

        per_class_accuracy = {}
        for idx, lbl in enumerate(unique_labels):
            per_class_accuracy[str(lbl)] = float(cm_norm[idx, idx])

        return {
            "labels": [str(l) for l in unique_labels],
            "raw_matrix": cm.tolist(),
            "normalized_matrix": np.round(cm_norm, 4).tolist(),
            "per_class_accuracy": per_class_accuracy,
        }
