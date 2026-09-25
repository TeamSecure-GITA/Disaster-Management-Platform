from __future__ import annotations

import numpy as np
import pandas as pd
from .base import BaseFeatureExtractor


class RainfallFeatureExtractor(BaseFeatureExtractor):
    """Calculates cumulative rainfall, intensity rates, and Antecedent Precipitation Index (API)."""

    def __init__(self, decay_factor: float = 0.85) -> None:
        self.decay_factor = decay_factor

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()

        rain = self.safe_series(df, "rainfall_mm", 0.0)
        duration = self.safe_series(df, "duration_hours", 1.0)
        duration = duration.replace(0.0, 1.0)

        # Intensity (mm/h)
        df["rain_intensity_mm_per_h"] = rain / duration

        # Cumulative / rolling aggregations if multiple observations present
        if len(df) > 1:
            df["rain_rolling_3h"] = rain.rolling(window=3, min_periods=1).sum()
            df["rain_rolling_6h"] = rain.rolling(window=6, min_periods=1).sum()
            df["rain_rolling_24h"] = rain.rolling(window=24, min_periods=1).sum()
        else:
            df["rain_rolling_3h"] = rain
            df["rain_rolling_6h"] = rain
            df["rain_rolling_24h"] = rain

        # Antecedent Precipitation Index (API)
        api_values = np.zeros(len(df))
        current_api = 0.0
        for i, val in enumerate(rain.values):
            current_api = float(val) + (self.decay_factor * current_api)
            api_values[i] = current_api
        df["antecedent_precipitation_index"] = api_values

        # Rainfall severity classifications
        df["is_heavy_rain"] = (df["rain_intensity_mm_per_h"] >= 15.0).astype(int)
        df["is_extreme_rain"] = (df["rain_intensity_mm_per_h"] >= 35.0).astype(int)

        return df
