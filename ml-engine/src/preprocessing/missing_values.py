from __future__ import annotations

from typing import Any
import numpy as np
import pandas as pd


class MissingValueHandler:
    """Handles missing values in datasets with fit/transform support."""

    def __init__(
        self,
        numeric_strategy: str = "median",
        categorical_strategy: str = "mode",
        fill_values: dict[str, Any] | None = None,
        drop_threshold: float | None = None,
    ) -> None:
        self.numeric_strategy = numeric_strategy
        self.categorical_strategy = categorical_strategy
        self.fill_values = fill_values or {}
        self.drop_threshold = drop_threshold
        self.learned_imputes: dict[str, Any] = {}

    def fit(self, df: pd.DataFrame) -> MissingValueHandler:
        """Compute imputation values on training data."""
        self.learned_imputes = {}

        for col in df.columns:
            if col in self.fill_values:
                self.learned_imputes[col] = self.fill_values[col]
            elif pd.api.types.is_numeric_dtype(df[col]):
                if self.numeric_strategy == "mean":
                    self.learned_imputes[col] = df[col].mean()
                elif self.numeric_strategy == "zero":
                    self.learned_imputes[col] = 0.0
                else:  # default median
                    self.learned_imputes[col] = df[col].median()
            else:
                mode_vals = df[col].mode()
                if not mode_vals.empty:
                    self.learned_imputes[col] = mode_vals.iloc[0]
                else:
                    self.learned_imputes[col] = "unknown"

        return self

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """Apply learned imputation values."""
        df = df.copy()

        # Drop columns exceeding missing threshold
        if self.drop_threshold is not None:
            missing_frac = df.isnull().mean()
            cols_to_drop = missing_frac[missing_frac > self.drop_threshold].index
            df = df.drop(columns=cols_to_drop)

        for col, val in self.learned_imputes.items():
            if col in df.columns and val is not None and not pd.isna(val):
                df[col] = df[col].fillna(val)

        # Catch any remaining NaNs with 0 or unknown
        for col in df.select_dtypes(include=[np.number]).columns:
            df[col] = df[col].fillna(0.0)

        for col in df.select_dtypes(exclude=[np.number]).columns:
            df[col] = df[col].fillna("unknown")

        return df

    def fit_transform(self, df: pd.DataFrame) -> pd.DataFrame:
        return self.fit(df).transform(df)
