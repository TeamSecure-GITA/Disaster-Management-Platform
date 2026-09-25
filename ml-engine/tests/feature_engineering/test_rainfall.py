import pandas as pd
from src.feature_engineering.rainfall import RainfallFeatureExtractor


def test_rainfall_features():
    df = pd.DataFrame({"rainfall_mm": [10.0, 45.0, 80.0], "duration_hours": [1.0, 1.0, 2.0]})
    ext = RainfallFeatureExtractor(decay_factor=0.85)
    res = ext.transform(df)
    assert "rain_intensity_mm_per_h" in res.columns
    assert "antecedent_precipitation_index" in res.columns
    assert "is_heavy_rain" in res.columns
    assert res["is_heavy_rain"].iloc[1] == 1
