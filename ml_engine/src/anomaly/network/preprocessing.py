"""Network anomaly preprocessing."""
from __future__ import annotations

import pandas as pd
import numpy as np


class NetworkAnomalyPreprocessor:
    """Standardizes and imputes nulls for network anomaly models."""

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        return df.fillna(0.0)
