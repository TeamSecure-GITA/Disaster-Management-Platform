from __future__ import annotations

import numpy as np
import pandas as pd
from .base import BaseFeatureExtractor


class SeismicFeatureExtractor(BaseFeatureExtractor):
    """Computes Gutenberg-Richter energy, Arias intensity proxies, and seismic shaking attenuation."""

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()

        mag = self.safe_series(df, "magnitude", 0.0)
        depth = self.safe_series(df, "depth_km", 10.0)
        pga = self.safe_series(df, "pga", 0.0)  # Peak ground acceleration (g or m/s^2)
        pgv = self.safe_series(df, "pgv", 0.0)  # Peak ground velocity (cm/s)

        # Logarithmic Seismic Energy Release (Joules)
        # log10(E) = 4.8 + 1.5 * M
        df["seismic_energy_log10_j"] = 4.8 + (1.5 * mag)

        # Arias Intensity proxy (m/s) proportional to PGA * PGV
        df["arias_intensity_proxy"] = (pga * pgv).clip(lower=0.0)

        # Depth attenuation factor (shallow earthquakes < 30km cause more surface damage)
        df["depth_attenuation_factor"] = 1.0 / np.sqrt(depth.clip(lower=1.0) ** 2 + 100.0)

        # Strong shaking indicator
        df["is_strong_motion"] = (pga >= 0.15).astype(int)
        df["is_major_quake"] = (mag >= 6.0).astype(int)

        return df
