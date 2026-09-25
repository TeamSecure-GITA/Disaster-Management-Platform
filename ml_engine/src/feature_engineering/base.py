from __future__ import annotations

from abc import ABC, abstractmethod
import pandas as pd


class BaseFeatureExtractor(ABC):
    """Abstract base class for all feature extraction transformers."""

    @abstractmethod
    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """Extract and append domain-specific features to DataFrame."""

    def __call__(self, df: pd.DataFrame) -> pd.DataFrame:
        return self.transform(df)

    @staticmethod
    def safe_series(df: pd.DataFrame, col: str, default: float = 0.0) -> pd.Series:
        if col in df.columns:
            return pd.to_numeric(df[col], errors="coerce").fillna(default)
        return pd.Series(default, index=df.index, dtype=float)
