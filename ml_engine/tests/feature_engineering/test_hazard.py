from __future__ import annotations
import pandas as pd
from src.feature_engineering.hazard import HazardFeatureExtractor

def test_hazard_features():
    extractor = HazardFeatureExtractor()
    df = pd.DataFrame({"rainfall_24h": [50.0], "slope_angle": [30.0], "soil_moisture": [85.0]})
    res = extractor.transform(df)
    assert res is not None
