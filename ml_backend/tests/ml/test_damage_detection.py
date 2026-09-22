import pytest
from app.ml.models.damage_detection.model import DamageDetectionModel
from app.ml.models.damage_detection.inference import DamageDetectionInferenceEngine

def test_damage_detection():
    model = DamageDetectionModel()
    engine = DamageDetectionInferenceEngine(model=model)
    res = engine.predict({'debris_ratio': 0.65, 'structural_displacement_pct': 35.0})
    assert res is not None
