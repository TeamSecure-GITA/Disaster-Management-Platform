"""Cyclone feature extractor."""
from __future__ import annotations

import pandas as pd
import numpy as np


class CycloneFeatureExtractor:
    """Extracts and engineers domain-specific features for cyclone risk forecasting."""

    def __init__(self, feature_names: list[str] | None = None) -> None:
        self.feature_names = feature_names or ['central_pressure_hpa', 'max_sustained_wind_speed_knots', 'sea_surface_temperature_c', 'latitude']

    def extract(self, data: pd.DataFrame | dict) -> pd.DataFrame:
        if isinstance(data, dict):
            df = pd.DataFrame([data])
        else:
            df = data.copy()

        for col in self.feature_names:
            if col not in df.columns:
                df[col] = 0.0

        return df[self.feature_names]
