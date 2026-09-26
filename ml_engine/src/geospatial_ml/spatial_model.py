"""Spatial regression and probabilistic field model."""
from __future__ import annotations
import numpy as np
from sklearn.ensemble import RandomForestRegressor

class SpatialRiskModel:
    """Spatial random forest regressor for continuous risk index estimation."""
    def __init__(self) -> None:
        self.model = RandomForestRegressor(n_estimators=50, random_state=42)
        self.is_fitted = False
    def fit(self, X: np.ndarray, y: np.ndarray) -> SpatialRiskModel:
        self.model.fit(X, y)
        self.is_fitted = True
        return self
    def predict_grid(self, grid_features: np.ndarray) -> np.ndarray:
        if not self.is_fitted:
            return np.full(len(grid_features), 0.5)
        return self.model.predict(grid_features)
