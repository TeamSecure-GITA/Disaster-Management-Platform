from __future__ import annotations
import pandas as pd
from src.feature_engineering.weather import WeatherFeatureExtractor

def test_weather_features():
    extractor = WeatherFeatureExtractor()
    df = pd.DataFrame({"temperature": [25.0, 30.0], "relative_humidity": [80.0, 60.0]})
    res = extractor.transform(df)
    assert res is not None
