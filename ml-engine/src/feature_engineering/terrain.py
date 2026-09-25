from __future__ import annotations

import numpy as np
import pandas as pd
from .base import BaseFeatureExtractor


class TerrainFeatureExtractor(BaseFeatureExtractor):
    """Computes topographic aspect decomposition, ruggedness, and topographic wetness indices."""

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()

        elevation = self.safe_series(df, "elevation", 100.0)
        slope = self.safe_series(df, "slope_angle", 10.0).clip(lower=0.5, upper=89.5)
        aspect = self.safe_series(df, "aspect", 0.0)

        # Aspect decomposition: Northness (cos) and Eastness (sin)
        aspect_rad = np.radians(aspect)
        df["aspect_northness"] = np.cos(aspect_rad)
        df["aspect_eastness"] = np.sin(aspect_rad)

        # Topographic Wetness Index (TWI) proxy: ln(Catchment Area / tan(Slope))
        # Assuming standard unit contributing area approximation proportional to elevation
        slope_rad = np.radians(slope)
        tan_slope = np.tan(slope_rad)
        contributing_area = np.maximum(elevation, 10.0)
        df["topographic_wetness_index"] = np.log(contributing_area / np.maximum(tan_slope, 0.01))

        # Steep terrain flag (> 25 degrees)
        df["is_steep_slope"] = (slope > 25.0).astype(int)

        return df
