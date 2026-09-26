"""Network feature extraction for anomaly detection."""
from __future__ import annotations

import pandas as pd
import numpy as np


class NetworkAnomalyFeatures:
    """Extracts telemetry features for network anomaly analysis."""

    def __init__(self, feature_names: list[str] | None = None) -> None:
        self.feature_names = feature_names or ['packet_loss_pct', 'latency_jitter_ms', 'bandwidth_usage_mbps', 'connection_drops']

    def extract(self, data: pd.DataFrame | dict) -> pd.DataFrame:
        if isinstance(data, dict):
            df = pd.DataFrame([data])
        else:
            df = data.copy()

        for col in self.feature_names:
            if col not in df.columns:
                df[col] = 0.0

        return df[self.feature_names]
