"""SoilMoisture time-series model trainer."""
from __future__ import annotations

import pandas as pd
import numpy as np
from .forecaster import SoilMoistureForecaster


class SoilMoistureTimeSeriesTrainer:
    """Trains and validates time-series forecasting models."""

    def __init__(self, horizon: int = 24) -> None:
        self.forecaster = SoilMoistureForecaster(horizon=horizon)

    def train(self, data: pd.Series | np.ndarray) -> SoilMoistureForecaster:
        self.forecaster.fit(data)
        return self.forecaster
