from __future__ import annotations
import pandas as pd
import numpy as np

class TabularAugmentor:
    def add_jitter(self, df: pd.DataFrame, numeric_cols: list[str], noise_scale: float = 0.01) -> pd.DataFrame:
        out = df.copy()
        for c in numeric_cols:
            if c in out.columns:
                noise = np.random.normal(0, noise_scale * (out[c].std() or 1.0), len(out))
                out[c] += noise
        return out
