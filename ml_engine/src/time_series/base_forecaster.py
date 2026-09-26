"""Base time series forecaster class."""
from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any
import pandas as pd
import numpy as np


class BaseForecaster(ABC):
    """Abstract base class for all environmental and sensor time-series forecasters."""

    def __init__(self, horizon: int = 24, step: str = "1h") -> None:
        self.horizon = horizon
        self.step = step
        self.is_fitted: bool = False

    @abstractmethod
    def fit(self, series: pd.Series | np.ndarray) -> BaseForecaster:
        pass

    @abstractmethod
    def forecast(self, steps: int | None = None) -> np.ndarray:
        pass
