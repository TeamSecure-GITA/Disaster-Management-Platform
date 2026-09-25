import pandas as pd
from src.preprocessing.outliers import OutlierDetector


def test_outlier_detection_and_clipping():
    df = pd.DataFrame({"wind_speed": [10.0, 15.0, 12.0, 14.0, 500.0]})
    detector = OutlierDetector(method="iqr", factor=1.5)
    clipped = detector.fit_transform(df, action="clip")
    assert clipped["wind_speed"].max() < 500.0
