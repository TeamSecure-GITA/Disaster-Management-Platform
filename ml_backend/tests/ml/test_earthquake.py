import pytest
from app.ml.models.earthquake.model import EarthquakeModel
from app.ml.models.earthquake.inference import EarthquakeInferenceEngine

def test_earthquake_model():
    model = EarthquakeModel()
    engine = EarthquakeInferenceEngine(model=model)
    res = engine.predict({'magnitude': 6.8, 'hypocenter_depth_km': 15.0, 'epicentral_distance_km': 25.0})
    assert res is not None
    assert res.model_name == 'earthquake-hazard-model'
