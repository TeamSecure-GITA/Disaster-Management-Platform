import pandas as pd
from src.feature_engineering.temporal import TemporalFeatureExtractor


def test_temporal_features():
    df = pd.DataFrame({"timestamp": ["2026-08-15T14:30:00Z", "2026-01-10T02:00:00Z"]})
    ext = TemporalFeatureExtractor()
    res = ext.transform(df)
    assert "hour_sin" in res.columns
    assert "hour_cos" in res.columns
    assert "is_monsoon_season" in res.columns
    assert res["is_monsoon_season"].iloc[0] == 1  # August
    assert res["is_monsoon_season"].iloc[1] == 0  # January
