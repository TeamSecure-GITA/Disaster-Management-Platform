"""SensorTelemetry forecasting statistical/ML model."""
from __future__ import annotations

from typing import Any
import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge


class SensorTelemetryModel:
    """Autoregressive ridge regression model for sensor_telemetry forecasting."""

    def __init__(self, alpha: float = 1.0) -> None:
        self.estimator = Ridge(alpha=alpha)
        self.is_fitted = False

    def fit(self, X: np.ndarray, y: np.ndarray) -> SensorTelemetryModel:
        self.estimator.fit(X, y)
        self.is_fitted = True
        return self

    def predict(self, X: np.ndarray) -> np.ndarray:
        if not self.is_fitted:
            return np.ones(len(X)) * 100.0
        return self.estimator.predict(X)
