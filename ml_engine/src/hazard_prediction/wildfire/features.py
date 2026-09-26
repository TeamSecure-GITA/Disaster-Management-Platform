"""Wildfire feature extractor."""
from __future__ import annotations

import pandas as pd
import numpy as np


class WildfireFeatureExtractor:
    """Extracts and engineers domain-specific features for wildfire risk forecasting."""

    def __init__(self, feature_names: list[str] | None = None) -> None:
        self.feature_names = feature_names or ['drought_code', 'fuel_moisture_content', 'ambient_temperature_c', 'wind_speed_kmh', 'relative_humidity_pct']

    def extract(self, data: pd.DataFrame | dict) -> pd.DataFrame:
        if isinstance(data, dict):
            df = pd.DataFrame([data])
        else:
            df = data.copy()

        for col in self.feature_names:
            if col not in df.columns:
                df[col] = 0.0

        return df[self.feature_names]
