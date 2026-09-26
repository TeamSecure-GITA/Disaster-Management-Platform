from __future__ import annotations
import pandas as pd
import numpy as np

def test_missing_value_imputation():
    df = pd.DataFrame({"val": [1.0, np.nan, 3.0, np.nan]})
    filled = df.ffill().bfill()
    assert filled["val"].isna().sum() == 0
