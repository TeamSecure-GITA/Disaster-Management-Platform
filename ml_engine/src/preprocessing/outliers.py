from __future__ import annotations

from typing import Literal
import numpy as np
import pandas as pd


class OutlierDetector:
    """Detects and handles outliers using IQR, Z-Score, or Winsorization."""

    def __init__(
        self,
        method: Literal["iqr", "zscore", "clip"] = "clip",
        factor: float = 1.5,
        z_threshold: float = 3.0,
    ) -> None:
        self.method = method
        self.factor = factor
        self.z_threshold = z_threshold
        self.bounds: dict[str, tuple[float, float]] = {}

    def fit(self, df: pd.DataFrame, columns: list[str] | None = None) -> OutlierDetector:
        """Calculate outlier bounds on numeric columns."""
        numeric_cols = columns or list(df.select_dtypes(include=[np.number]).columns)
        self.bounds = {}

        for col in numeric_cols:
            if col not in df.columns:
                continue
            series = df[col].dropna()
            if series.empty:
                continue

            if self.method in ("iqr", "clip"):
                q25 = float(series.quantile(0.25))
                q75 = float(series.quantile(0.75))
                iqr = q75 - q25
                lower = q25 - (self.factor * iqr)
                upper = q75 + (self.factor * iqr)
                self.bounds[col] = (lower, upper)
            elif self.method == "zscore":
                mean = float(series.mean())
                std = float(series.std()) if float(series.std()) > 1e-8 else 1e-8
                lower = mean - (self.z_threshold * std)
                upper = mean + (self.z_threshold * std)
                self.bounds[col] = (lower, upper)

        return self

    def transform(self, df: pd.DataFrame, action: Literal["clip", "nan", "drop"] = "clip") -> pd.DataFrame:
        """Apply outlier handling to DataFrame."""
        df = df.copy()

        if action == "clip":
            for col, (lower, upper) in self.bounds.items():
                if col in df.columns:
                    df[col] = df[col].clip(lower=lower, upper=upper)
        elif action == "nan":
            for col, (lower, upper) in self.bounds.items():
                if col in df.columns:
                    mask = (df[col] < lower) | (df[col] > upper)
                    df.loc[mask, col] = np.nan
        elif action == "drop":
            condition = pd.Series(True, index=df.index)
            for col, (lower, upper) in self.bounds.items():
                if col in df.columns:
                    condition = condition & (df[col] >= lower) & (df[col] <= upper)
            df = df[condition].reset_index(drop=True)

        return df

    def fit_transform(self, df: pd.DataFrame, action: Literal["clip", "nan", "drop"] = "clip") -> pd.DataFrame:
        return self.fit(df).transform(df, action=action)
