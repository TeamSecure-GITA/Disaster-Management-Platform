from __future__ import annotations
import numpy as np

class PredictionIntervalEstimator:
    def compute_intervals(self, predictions: np.ndarray, std_err: float = 0.1, alpha: float = 0.05) -> tuple[np.ndarray, np.ndarray]:
        z = 1.96 # 95% interval
        lower = np.maximum(predictions - z * std_err, 0.0)
        upper = predictions + z * std_err
        return lower, upper
