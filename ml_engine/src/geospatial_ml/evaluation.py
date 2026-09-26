"""Spatial validation and Moran I autocorrelation evaluation."""
from __future__ import annotations
import numpy as np

class SpatialEvaluator:
    """Evaluates spatial prediction errors and residual spatial autocorrelation."""
    def evaluate_spatial_rmse(self, y_true: np.ndarray, y_pred: np.ndarray) -> float:
        return float(np.sqrt(np.mean((y_true - y_pred)**2)))
