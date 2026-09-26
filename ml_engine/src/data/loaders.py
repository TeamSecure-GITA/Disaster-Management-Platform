from __future__ import annotations
from pathlib import Path
import pandas as pd

class DataLoader:
    def load_csv(self, path: str | Path) -> pd.DataFrame:
        p = Path(path)
        if not p.exists():
            return pd.DataFrame()
        return pd.read_csv(p)
