"""Anomaly score calibration and normalization."""
from __future__ import annotations

import numpy as np


class AnomalyScorer:
    """Normalizes raw distance or density scores to [0.0, 1.0] probabilistic anomalies."""

    def normalize(self, raw_scores: np.ndarray) -> np.ndarray:
        scores = np.asarray(raw_scores)
        if len(scores) == 0:
            return scores
        s_min = np.min(scores)
        s_max = np.max(scores)
        if s_max - s_min == 0:
            return np.zeros_like(scores)
        return (scores - s_min) / (s_max - s_min)
