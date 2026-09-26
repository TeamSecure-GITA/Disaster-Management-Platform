"""Cyclone data preprocessing and normalization."""
from __future__ import annotations

import pandas as pd
import numpy as np


class CyclonePreprocessor:
    """Handles missing value imputation, out-of-bound clipping, and scaling."""

    def __init__(self) -> None:
        self.fitted = False
        self.means: dict[str, float] = {}

    def fit(self, df: pd.DataFrame) -> CyclonePreprocessor:
        self.means = df.mean(numeric_only=True).to_dict()
        self.fitted = True
        return self

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        out = df.copy()
        for col, mean_val in self.means.items():
            if col in out.columns:
                out[col] = out[col].fillna(mean_val)
        return out.fillna(0.0)

    def fit_transform(self, df: pd.DataFrame) -> pd.DataFrame:
        return self.fit(df).transform(df)
