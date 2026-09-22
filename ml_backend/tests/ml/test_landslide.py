import pytest
from app.ml.models.landslide.model import LandslideModel
from app.ml.models.landslide.inference import LandslideInferenceEngine

def test_landslide_model():
    model = LandslideModel()
    engine = LandslideInferenceEngine(model=model)
    res = engine.predict({'rainfall_24h_mm': 140.0, 'slope_angle_deg': 32.0})
    assert res is not None
    assert res.model_name == 'landslide-risk-model'
