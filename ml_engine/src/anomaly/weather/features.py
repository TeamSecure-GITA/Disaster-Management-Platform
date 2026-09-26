"""Weather feature extraction for anomaly detection."""
from __future__ import annotations

import pandas as pd
import numpy as np


class WeatherAnomalyFeatures:
    """Extracts telemetry features for weather anomaly analysis."""

    def __init__(self, feature_names: list[str] | None = None) -> None:
        self.feature_names = feature_names or ['temp_delta_1h', 'pressure_drop_3h', 'humidity_spike', 'gust_speed_ratio']

    def extract(self, data: pd.DataFrame | dict) -> pd.DataFrame:
        if isinstance(data, dict):
            df = pd.DataFrame([data])
        else:
            df = data.copy()

        for col in self.feature_names:
            if col not in df.columns:
                df[col] = 0.0

        return df[self.feature_names]
