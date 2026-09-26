"""Wind time-series model trainer."""
from __future__ import annotations

import pandas as pd
import numpy as np
from .forecaster import WindForecaster


class WindTimeSeriesTrainer:
    """Trains and validates time-series forecasting models."""

    def __init__(self, horizon: int = 24) -> None:
        self.forecaster = WindForecaster(horizon=horizon)

    def train(self, data: pd.Series | np.ndarray) -> WindForecaster:
        self.forecaster.fit(data)
        return self.forecaster
