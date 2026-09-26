from __future__ import annotations
import pandas as pd

class BalancedSampler:
    def balance(self, df: pd.DataFrame, target_col: str) -> pd.DataFrame:
        if target_col not in df.columns:
            return df
        counts = df[target_col].value_counts()
        min_c = counts.min()
        return df.groupby(target_col).sample(min_c, random_state=42).reset_index(drop=True)
