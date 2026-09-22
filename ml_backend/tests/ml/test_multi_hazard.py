import pytest
from app.ml.models.multi_hazard.model import MultiHazardModel
from app.ml.models.multi_hazard.inference import MultiHazardInferenceEngine

def test_multi_hazard_model():
    model = MultiHazardModel()
    engine = MultiHazardInferenceEngine(model=model)
    res = engine.predict({'rainfall_24h_mm': 120.0, 'slope_angle_deg': 30.0, 'river_stage_ratio': 1.1})
    assert res is not None
    assert res.model_name == 'multi-hazard-risk-model'
