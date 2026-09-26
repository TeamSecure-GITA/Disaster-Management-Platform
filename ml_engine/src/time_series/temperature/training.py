"""Temperature time-series model trainer."""
from __future__ import annotations

import pandas as pd
import numpy as np
from .forecaster import TemperatureForecaster


class TemperatureTimeSeriesTrainer:
    """Trains and validates time-series forecasting models."""

    def __init__(self, horizon: int = 24) -> None:
        self.forecaster = TemperatureForecaster(horizon=horizon)

    def train(self, data: pd.Series | np.ndarray) -> TemperatureForecaster:
        self.forecaster.fit(data)
        return self.forecaster
