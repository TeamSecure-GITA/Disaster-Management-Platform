import pytest
from app.ml.models.flood.model import FloodModel
from app.ml.models.flood.inference import FloodInferenceEngine

def test_flood_model():
    model = FloodModel()
    engine = FloodInferenceEngine(model=model)
    res = engine.predict({'river_water_level_m': 5.2, 'rainfall_intensity_mm_h': 30.0})
    assert res is not None
    assert res.model_name == 'flood-risk-model'
