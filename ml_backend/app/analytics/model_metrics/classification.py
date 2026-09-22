"""
Classification evaluation metrics for disaster prediction models.
Computes accuracy, precision, recall, F1, confusion matrix, and Brier score.
"""

from __future__ import annotations

import math
from typing import Any, Dict, List, Sequence
import numpy as np


def compute_classification_metrics(
    y_true: Sequence[int],
    y_pred: Sequence[int],
    y_prob: Optional[Sequence[float]] = None,
) -> Dict[str, Any]:
    """Computes comprehensive binary/multi-class classification performance metrics."""
    if len(y_true) != len(y_pred) or len(y_true) == 0:
        return {"error": "Invalid or empty inputs", "sample_size": 0}

    yt = np.array(y_true, dtype=int)
    yp = np.array(y_pred, dtype=int)
    n = len(yt)

    accuracy = float(np.mean(yt == yp))

    # Confusion matrix elements for binary case (0 vs 1)
    tp = int(np.sum((yt == 1) & (yp == 1)))
    fp = int(np.sum((yt == 0) & (yp == 1)))
    fn = int(np.sum((yt == 1) & (yp == 0)))
    tn = int(np.sum((yt == 0) & (yp == 0)))

    precision = float(tp / (tp + fp)) if (tp + fp) > 0 else 0.0
    recall = float(tp / (tp + fn)) if (tp + fn) > 0 else 0.0
    f1 = float(2.0 * precision * recall / (precision + recall)) if (precision + recall) > 0 else 0.0
    specificity = float(tn / (tn + fp)) if (tn + fp) > 0 else 0.0

    brier_score = None
    if y_prob is not None and len(y_prob) == n:
        probs = np.array(y_prob, dtype=float)
        brier_score = float(np.mean((probs - yt) ** 2))

    return {
        "accuracy": round(accuracy, 4),
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1_score": round(f1, 4),
        "specificity": round(specificity, 4),
        "confusion_matrix": {
            "true_positive": tp,
            "false_positive": fp,
            "false_negative": fn,
            "true_negative": tn,
        },
        "brier_score": round(brier_score, 4) if brier_score is not None else None,
        "sample_size": n,
    }
