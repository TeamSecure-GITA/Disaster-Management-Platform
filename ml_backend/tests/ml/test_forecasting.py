import pytest
from app.ml.models.forecasting.model import ForecastModel
from app.ml.models.forecasting.inference import ForecastInferenceEngine

def test_forecast_model():
    model = ForecastModel()
    engine = ForecastInferenceEngine(model=model)
    res = engine.predict({'historical_values': [12.0, 15.0, 18.0, 22.0, 25.0]})
    assert res is not None
