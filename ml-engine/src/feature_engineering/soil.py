from __future__ import annotations

import pandas as pd
from .base import BaseFeatureExtractor


class SoilFeatureExtractor(BaseFeatureExtractor):
    """Computes soil saturation, suction stress indices, and moisture differentials."""

    def __init__(self, field_capacity: float = 35.0, saturation_point: float = 50.0) -> None:
        self.field_capacity = field_capacity
        self.saturation_point = saturation_point

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()

        sm = self.safe_series(df, "soil_moisture", 20.0)
        st = self.safe_series(df, "soil_temperature", 20.0)

        # Soil Saturation Degree (0 to 1+ ratio)
        df["soil_saturation_ratio"] = (sm / self.saturation_point).clip(lower=0.0, upper=2.0)

        # Critical Saturation Indicator
        df["is_soil_supersaturated"] = (sm >= self.saturation_point).astype(int)
        df["is_soil_dry"] = (sm < 10.0).astype(int)

        # Air-to-soil temperature delta
        if "temperature" in df.columns:
            air_temp = self.safe_series(df, "temperature", 20.0)
            df["temp_air_soil_delta"] = air_temp - st

        return df
