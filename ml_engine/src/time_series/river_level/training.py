"""RiverLevel time-series model trainer."""
from __future__ import annotations

import pandas as pd
import numpy as np
from .forecaster import RiverLevelForecaster


class RiverLevelTimeSeriesTrainer:
    """Trains and validates time-series forecasting models."""

    def __init__(self, horizon: int = 24) -> None:
        self.forecaster = RiverLevelForecaster(horizon=horizon)

    def train(self, data: pd.Series | np.ndarray) -> RiverLevelForecaster:
        self.forecaster.fit(data)
        return self.forecaster
