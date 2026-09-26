from __future__ import annotations
import numpy as np

class ConfidenceEstimator:
    def estimate_confidence(self, probabilities: np.ndarray) -> float:
        # Distance from maximum entropy / 0.5 decision boundary
        p = np.clip(probabilities, 0.0, 1.0)
        return float(np.mean(np.abs(p - 0.5) * 2.0))
