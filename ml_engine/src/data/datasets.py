from __future__ import annotations
from typing import Any
import pandas as pd

class DisasterDataset:
    def __init__(self, data: pd.DataFrame, target_col: str | None = None) -> None:
        self.data = data
        self.target_col = target_col
    def __len__(self) -> int:
        return len(self.data)
    def __getitem__(self, idx: int) -> dict[str, Any]:
        return self.data.iloc[idx].to_dict()
