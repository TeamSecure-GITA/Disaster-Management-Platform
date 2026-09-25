import pandas as pd
from src.feature_engineering.spatial import SpatialFeatureExtractor


def test_spatial_features():
    df = pd.DataFrame({"latitude": [22.5], "longitude": [88.3]})
    ext = SpatialFeatureExtractor(reference_points={"himalaya": (27.5, 88.5)})
    res = ext.transform(df)
    assert "geo_x" in res.columns
    assert "geo_y" in res.columns
    assert "geo_z" in res.columns
    assert "dist_to_himalaya_km" in res.columns
    assert res["dist_to_himalaya_km"].iloc[0] > 0
