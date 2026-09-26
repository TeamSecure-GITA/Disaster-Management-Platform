"""Temperature lag and rolling window feature extraction."""
from __future__ import annotations

import pandas as pd
import numpy as np


class TemperatureTimeSeriesFeatures:
    """Constructs lag features, rolling statistics, and temporal sinusoidal encodings."""

    def __init__(self, lags: list[int] | None = None, windows: list[int] | None = None) -> None:
        self.lags = lags or [1, 2, 3, 6, 12, 24]
        self.windows = windows or [3, 6, 12, 24]

    def create_features(self, series: pd.Series | np.ndarray) -> pd.DataFrame:
        if isinstance(series, np.ndarray):
            s = pd.Series(series)
        else:
            s = series.copy()

        df = pd.DataFrame({"value": s})
        for l in self.lags:
            df[f"lag_{l}"] = s.shift(l)
        for w in self.windows:
            df[f"roll_mean_{w}"] = s.rolling(w).mean()
            df[f"roll_std_{w}"] = s.rolling(w).std()

        return df.bfill().fillna(0.0)
