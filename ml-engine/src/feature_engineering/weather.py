from __future__ import annotations

import numpy as np
import pandas as pd
from .base import BaseFeatureExtractor


class WeatherFeatureExtractor(BaseFeatureExtractor):
    """Calculates atmospheric metrics including heat index, dew point, VPD, and wind vector components."""

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()

        temp = self.safe_series(df, "temperature", 25.0)
        rh = self.safe_series(df, "humidity", 60.0).clip(lower=1.0, upper=100.0)
        pressure = self.safe_series(df, "pressure", 1013.25)
        ws = self.safe_series(df, "wind_speed", 5.0).clip(lower=0.0)
        wd = self.safe_series(df, "wind_direction", 0.0)

        # Dew Point Estimation using Magnus-Tetens formula
        a, b = 17.27, 237.7
        alpha = ((a * temp) / (b + temp)) + np.log(rh / 100.0)
        df["dew_point_c"] = (b * alpha) / (a - alpha)

        # Saturated and Actual Vapor Pressure (kPa)
        es = 0.61078 * np.exp((a * temp) / (b + temp))
        ea = es * (rh / 100.0)
        df["vapor_pressure_deficit_kpa"] = np.maximum(es - ea, 0.0)

        # Wind Vector Projections (u: East-West, v: North-South)
        wd_rad = np.radians(wd)
        df["wind_u"] = -ws * np.sin(wd_rad)
        df["wind_v"] = -ws * np.cos(wd_rad)

        # Low pressure anomaly indicator (< 1000 hPa often indicates tropical depression/cyclone)
        df["is_low_pressure_system"] = (pressure < 1005.0).astype(int)

        return df
