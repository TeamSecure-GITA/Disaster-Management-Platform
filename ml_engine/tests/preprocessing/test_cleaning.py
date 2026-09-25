import pandas as pd
from src.preprocessing.cleaning import DataCleaner


def test_data_cleaning():
    cleaner = DataCleaner(drop_duplicates=True)
    df = pd.DataFrame({
        " Water Level (m) ": ["  4.5  ", "  4.5  ", " 6.2 "],
        "STATUS": [" OK ", " OK ", " ALERT "],
    })
    df_clean = cleaner.clean(df)
    assert len(df_clean) == 2
    assert "water_level_m" in df_clean.columns
    assert df_clean["status"].iloc[0] == "OK"
