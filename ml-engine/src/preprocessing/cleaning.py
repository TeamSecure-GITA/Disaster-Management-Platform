from __future__ import annotations

import re
from typing import Any
import pandas as pd


class DataCleaner:
    """Cleans and standardizes raw DataFrames."""

    def __init__(self, drop_duplicates: bool = True) -> None:
        self.drop_duplicates_flag = drop_duplicates

    @staticmethod
    def clean_column_names(df: pd.DataFrame) -> pd.DataFrame:
        """Standardize column names to lower_snake_case."""
        df = df.copy()
        new_cols = []
        for col in df.columns:
            cleaned = str(col).strip().lower()
            cleaned = re.sub(r"[^\w\s]", "", cleaned)
            cleaned = re.sub(r"[\s\-]+", "_", cleaned)
            new_cols.append(cleaned)
        df.columns = new_cols
        return df

    def strip_whitespace(self, df: pd.DataFrame) -> pd.DataFrame:
        """Strip leading/trailing whitespaces in string columns."""
        df = df.copy()
        for col in df.select_dtypes(include=["object", "string"]).columns:
            df[col] = df[col].astype(str).str.strip()
        return df

    def remove_duplicates(self, df: pd.DataFrame, subset: list[str] | None = None) -> pd.DataFrame:
        """Remove duplicate rows."""
        return df.drop_duplicates(subset=subset).reset_index(drop=True)

    def cast_types(self, df: pd.DataFrame, schema: dict[str, str]) -> pd.DataFrame:
        """Cast columns to specified types safely."""
        df = df.copy()
        for col, target_type in schema.items():
            if col in df.columns:
                try:
                    if target_type in ("datetime", "datetime64"):
                        df[col] = pd.to_datetime(df[col], errors="coerce")
                    else:
                        df[col] = df[col].astype(target_type)
                except Exception:
                    pass
        return df

    def clean(self, df: pd.DataFrame, schema: dict[str, str] | None = None) -> pd.DataFrame:
        """Run all cleaning steps."""
        df = self.clean_column_names(df)
        df = self.strip_whitespace(df)
        if self.drop_duplicates_flag:
            df = self.remove_duplicates(df)
        if schema:
            df = self.cast_types(df, schema)
        return df
