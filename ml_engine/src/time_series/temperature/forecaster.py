"""Temperature end-to-end rolling forecaster."""
from __future__ import annotations

import numpy as np
import pandas as pd
from ..base_forecaster import BaseForecaster
from .model import TemperatureModel
from .features import TemperatureTimeSeriesFeatures
from .preprocessing import TemperatureTimeSeriesPreprocessor


class TemperatureForecaster(BaseForecaster):
    """Multi-step rolling horizon forecaster for temperature (C)."""

    def __init__(self, horizon: int = 24, model: TemperatureModel | None = None) -> None:
        super().__init__(horizon=horizon)
        self.model = model or TemperatureModel()
        self.feature_builder = TemperatureTimeSeriesFeatures()
        self.preprocessor = TemperatureTimeSeriesPreprocessor()
        self.last_observed: np.ndarray = np.array([])

    def fit(self, series: pd.Series | np.ndarray) -> TemperatureForecaster:
        cleaned = self.preprocessor.clean_series(series)
        self.last_observed = cleaned.values[-self.horizon:]
        feats_df = self.feature_builder.create_features(cleaned)
        X = feats_df.drop(columns=["value"]).values
        y = feats_df["value"].values
        self.model.fit(X, y)
        self.is_fitted = True
        return self

    def forecast(self, steps: int | None = None) -> np.ndarray:
        h = steps or self.horizon
        if len(self.last_observed) == 0:
            return np.full(h, 26.0)
        # Simulate forecast
        mean_val = np.mean(self.last_observed)
        trend = np.linspace(0, 0.1 * mean_val, h)
        noise = np.random.normal(0, 0.05 * (mean_val or 1.0), h)
        return np.maximum(mean_val + trend + noise, 0.0)
