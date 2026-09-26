"""Earthquake feature extractor."""
from __future__ import annotations

import pandas as pd
import numpy as np


class EarthquakeFeatureExtractor:
    """Extracts and engineers domain-specific features for earthquake risk forecasting."""

    def __init__(self, feature_names: list[str] | None = None) -> None:
        self.feature_names = feature_names or ['hypocentral_depth_km', 'peak_ground_acceleration_pga', 'fault_distance_km', 'shear_wave_velocity_vs30']

    def extract(self, data: pd.DataFrame | dict) -> pd.DataFrame:
        if isinstance(data, dict):
            df = pd.DataFrame([data])
        else:
            df = data.copy()

        for col in self.feature_names:
            if col not in df.columns:
                df[col] = 0.0

        return df[self.feature_names]
