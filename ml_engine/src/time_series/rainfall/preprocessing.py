"""Rainfall time-series preprocessing and stationarity transforms."""
from __future__ import annotations

import pandas as pd
import numpy as np


class RainfallTimeSeriesPreprocessor:
    """Handles interpolation, outlier clipping, and differencing."""

    def clean_series(self, series: pd.Series | np.ndarray) -> pd.Series:
        if isinstance(series, np.ndarray):
            s = pd.Series(series)
        else:
            s = series.copy()
        return s.interpolate(method="linear").bfill().ffill()
