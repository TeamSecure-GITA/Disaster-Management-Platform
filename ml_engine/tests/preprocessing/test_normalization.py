import pandas as pd
from src.preprocessing.normalization import FeatureNormalizer


def test_feature_normalization():
    df = pd.DataFrame({"rain": [0.0, 50.0, 100.0]})
    norm_minmax = FeatureNormalizer(method="minmax", feature_range=(0.0, 1.0))
    res = norm_minmax.fit_transform(df)
    assert res["rain"].min() == 0.0
    assert res["rain"].max() == 1.0

    norm_std = FeatureNormalizer(method="standard")
    res_std = norm_std.fit_transform(df)
    assert round(res_std["rain"].mean(), 2) == 0.0
