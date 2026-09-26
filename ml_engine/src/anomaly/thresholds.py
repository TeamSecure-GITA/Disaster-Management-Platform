"""Dynamic and statistical threshold computing."""
from __future__ import annotations

import numpy as np


class DynamicThresholdOptimizer:
    """Computes dynamic alert thresholds based on moving z-score or percentile cutoffs."""

    def __init__(self, percentile: float = 95.0, k_std: float = 3.0) -> None:
        self.percentile = percentile
        self.k_std = k_std

    def compute_threshold(self, scores: np.ndarray) -> float:
        if len(scores) == 0:
            return 0.5
        pct_threshold = float(np.percentile(scores, self.percentile))
        z_threshold = float(np.mean(scores) + self.k_std * np.std(scores))
        return min(pct_threshold, z_threshold)
