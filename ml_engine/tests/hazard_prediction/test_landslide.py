from __future__ import annotations
import pytest
from src.hazard_prediction.landslide import LandslideModel, LandslidePredictor, LandslideEvaluator

def test_landslide_prediction_flow():
    model = LandslideModel()
    predictor = LandslidePredictor(model=model)
    res = predictor.predict({"feature_1": 10.0, "feature_2": 25.0})
    assert res is not None
    assert res.probability is not None
    assert 0.0 <= res.probability <= 1.0
    assert res.severity in ["LOW", "WARNING", "CRITICAL"]

def test_landslide_evaluation():
    evaluator = LandslideEvaluator()
    metrics = evaluator.evaluate([0, 1, 0, 1], [0.1, 0.9, 0.2, 0.85])
    assert "accuracy" in metrics
    assert "f1" in metrics
