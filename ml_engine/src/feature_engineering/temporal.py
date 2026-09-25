from __future__ import annotations

import numpy as np
import pandas as pd
from .base import BaseFeatureExtractor


class TemporalFeatureExtractor(BaseFeatureExtractor):
    """Extracts temporal, cyclical and seasonality features from timestamps."""

    def __init__(self, timestamp_col: str = "timestamp") -> None:
        self.timestamp_col = timestamp_col

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()

        if self.timestamp_col not in df.columns:
            return df

        ts = pd.to_datetime(df[self.timestamp_col], errors="coerce")
        valid_ts = ts.fillna(pd.Timestamp.now())

        df["hour"] = valid_ts.dt.hour
        df["day_of_week"] = valid_ts.dt.dayofweek
        df["day_of_month"] = valid_ts.dt.day
        df["month"] = valid_ts.dt.month
        df["quarter"] = valid_ts.dt.quarter
        df["is_weekend"] = valid_ts.dt.dayofweek.isin([5, 6]).astype(int)

        # Cyclical Hour encoding (24h period)
        df["hour_sin"] = np.sin(2 * np.pi * df["hour"] / 24.0)
        df["hour_cos"] = np.cos(2 * np.pi * df["hour"] / 24.0)

        # Cyclical Month encoding (12 months)
        df["month_sin"] = np.sin(2 * np.pi * (df["month"] - 1) / 12.0)
        df["month_cos"] = np.cos(2 * np.pi * (df["month"] - 1) / 12.0)

        # Monsoon / rainy season indicator (typical South Asia monsoon: June-Sept)
        df["is_monsoon_season"] = df["month"].isin([6, 7, 8, 9]).astype(int)

        return df
