from __future__ import annotations
import pandas as pd
from src.feature_engineering.terrain import TerrainFeatureExtractor

def test_terrain_features():
    extractor = TerrainFeatureExtractor()
    df = pd.DataFrame({"elevation": [100.0, 500.0], "slope_angle": [15.0, 35.0], "aspect": [45.0, 180.0]})
    res = extractor.transform(df)
    assert "aspect_northness" in res.columns
    assert "aspect_eastness" in res.columns
