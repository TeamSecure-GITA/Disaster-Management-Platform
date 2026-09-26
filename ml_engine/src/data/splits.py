from __future__ import annotations
import pandas as pd
from sklearn.model_selection import train_test_split

class DatasetSplitter:
    def train_test_split(self, df: pd.DataFrame, test_size: float = 0.2, seed: int = 42) -> tuple[pd.DataFrame, pd.DataFrame]:
        return train_test_split(df, test_size=test_size, random_state=seed)
