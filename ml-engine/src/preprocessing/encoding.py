from __future__ import annotations

from typing import Literal
import pandas as pd


class CategoricalEncoder:
    """Encodes categorical columns with one-hot, ordinal, or frequency encoding."""

    def __init__(
        self,
        method: Literal["one_hot", "ordinal", "frequency"] = "ordinal",
        handle_unknown: str = "ignore",
    ) -> None:
        self.method = method
        self.handle_unknown = handle_unknown
        self.categories_: dict[str, list[str]] = {}
        self.ordinal_mapping_: dict[str, dict[str, int]] = {}
        self.frequency_mapping_: dict[str, dict[str, float]] = {}

    def fit(self, df: pd.DataFrame, columns: list[str] | None = None) -> CategoricalEncoder:
        """Learn categories or frequency weights from training DataFrame."""
        cat_cols = columns or list(df.select_dtypes(include=["object", "category", "string"]).columns)

        for col in cat_cols:
            if col not in df.columns:
                continue

            unique_vals = list(df[col].dropna().astype(str).unique())
            self.categories_[col] = unique_vals

            if self.method == "ordinal":
                self.ordinal_mapping_[col] = {val: idx for idx, val in enumerate(unique_vals)}
            elif self.method == "frequency":
                freqs = df[col].astype(str).value_counts(normalize=True).to_dict()
                self.frequency_mapping_[col] = freqs

        return self

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """Encode categorical features."""
        df = df.copy()

        if self.method == "ordinal":
            for col, mapping in self.ordinal_mapping_.items():
                if col in df.columns:
                    df[col] = df[col].astype(str).map(mapping)
                    df[col] = df[col].fillna(-1).astype(int)

        elif self.method == "frequency":
            for col, freqs in self.frequency_mapping_.items():
                if col in df.columns:
                    df[col] = df[col].astype(str).map(freqs).fillna(0.0).astype(float)

        elif self.method == "one_hot":
            for col, cats in self.categories_.items():
                if col in df.columns:
                    for cat in cats:
                        col_name = f"{col}_{cat}"
                        df[col_name] = (df[col].astype(str) == cat).astype(int)
                    df = df.drop(columns=[col])

        return df

    def fit_transform(self, df: pd.DataFrame, columns: list[str] | None = None) -> pd.DataFrame:
        return self.fit(df, columns=columns).transform(df)
