import pytest
from app.ml.models.wildfire.model import WildfireModel
from app.ml.models.wildfire.inference import WildfireInferenceEngine

def test_wildfire_model():
    model = WildfireModel()
    engine = WildfireInferenceEngine(model=model)
    res = engine.predict({'temperature_c': 38.0, 'relative_humidity_pct': 18.0, 'wind_speed_kmh': 45.0})
    assert res is not None
    assert res.model_name == 'wildfire-risk-model'
