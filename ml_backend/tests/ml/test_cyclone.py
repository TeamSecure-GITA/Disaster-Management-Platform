import pytest
from app.ml.models.cyclone.model import CycloneModel
from app.ml.models.cyclone.inference import CycloneInferenceEngine

def test_cyclone_model():
    model = CycloneModel()
    engine = CycloneInferenceEngine(model=model)
    res = engine.predict({'central_pressure_hpa': 945.0, 'max_sustained_wind_knots': 110.0})
    assert res is not None
    assert res.model_name == 'cyclone-risk-model'
