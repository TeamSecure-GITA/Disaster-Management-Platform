from __future__ import annotations

import numpy as np
import pandas as pd
from .base import BaseFeatureExtractor


class HazardFeatureExtractor(BaseFeatureExtractor):
    """Computes cross-hazard compound indices (landslide susceptibility, flood potential, fire weather, cyclone power)."""

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()

        # Landslide compounding factors
        rain = self.safe_series(df, "rainfall_mm", 0.0)
        slope = self.safe_series(df, "slope_angle", 0.0)
        moisture = self.safe_series(df, "soil_moisture", 20.0)
        df["landslide_susceptibility_index"] = (
            (slope / 45.0).clip(0, 2)
            * (rain / 50.0).clip(0, 5)
            * (moisture / 40.0).clip(0, 3)
        )

        # Flood compounding factors
        water_level = self.safe_series(df, "water_level", 0.0)
        flow_rate = self.safe_series(df, "flow_rate", 0.0)
        df["flood_potential_index"] = (
            (water_level / 5.0).clip(0, 3)
            * (1.0 + (rain / 100.0).clip(0, 3))
            + (flow_rate / 500.0).clip(0, 3)
        )

        # Fire Weather Index proxy
        temp = self.safe_series(df, "temperature", 25.0)
        rh = self.safe_series(df, "humidity", 50.0).clip(lower=1.0)
        wind = self.safe_series(df, "wind_speed", 10.0)
        df["fire_danger_index"] = (
            (np.maximum(temp, 0) / 30.0)
            * (100.0 / rh)
            * (1.0 + (wind / 20.0))
        )

        # Cyclone Destructive Power Index (proportional to v^3)
        c_wind = self.safe_series(df, "wind_speed", 10.0)
        surge = self.safe_series(df, "storm_surge", 0.0)
        df["cyclone_power_dissipation_index"] = ((c_wind / 33.0) ** 3) + (surge * 2.0)

        return df
