from __future__ import annotations

from typing import Literal
import numpy as np
import pandas as pd


class FeatureNormalizer:
    """Scales and normalizes numeric features."""

    def __init__(
        self,
        method: Literal["standard", "minmax", "robust", "log1p"] = "standard",
        feature_range: tuple[float, float] = (0.0, 1.0),
    ) -> None:
        self.method = method
        self.feature_range = feature_range
        self.params: dict[str, dict[str, float]] = {}

    def fit(self, df: pd.DataFrame, columns: list[str] | None = None) -> FeatureNormalizer:
        """Compute scaling parameters for numeric columns."""
        numeric_cols = columns or list(df.select_dtypes(include=[np.number]).columns)
        self.params = {}

        for col in numeric_cols:
            if col not in df.columns:
                continue
            series = df[col].dropna()
            if series.empty:
                continue

            if self.method == "standard":
                mean = float(series.mean())
                std = float(series.std())
                if std < 1e-8:
                    std = 1.0
                self.params[col] = {"mean": mean, "std": std}
            elif self.method == "minmax":
                min_val = float(series.min())
                max_val = float(series.max())
                scale = max_val - min_val
                if scale < 1e-8:
                    scale = 1.0
                self.params[col] = {"min": min_val, "scale": scale}
            elif self.method == "robust":
                median = float(series.median())
                q25 = float(series.quantile(0.25))
                q75 = float(series.quantile(0.75))
                iqr = q75 - q25
                if iqr < 1e-8:
                    iqr = 1.0
                self.params[col] = {"median": median, "iqr": iqr}
            elif self.method == "log1p":
                self.params[col] = {}

        return self

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """Apply scaling to numeric columns."""
        df = df.copy()

        for col, p in self.params.items():
            if col not in df.columns:
                continue

            if self.method == "standard":
                df[col] = (df[col] - p["mean"]) / p["std"]
            elif self.method == "minmax":
                low, high = self.feature_range
                df[col] = low + ((df[col] - p["min"]) / p["scale"]) * (high - low)
            elif self.method == "robust":
                df[col] = (df[col] - p["median"]) / p["iqr"]
            elif self.method == "log1p":
                df[col] = np.log1p(np.maximum(df[col], 0))

        return df

    def fit_transform(self, df: pd.DataFrame, columns: list[str] | None = None) -> pd.DataFrame:
        return self.fit(df, columns=columns).transform(df)
