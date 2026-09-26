from __future__ import annotations
import pytest
from src.hazard_prediction.wildfire import WildfireModel, WildfirePredictor, WildfireEvaluator

def test_wildfire_prediction_flow():
    model = WildfireModel()
    predictor = WildfirePredictor(model=model)
    res = predictor.predict({"feature_1": 10.0, "feature_2": 25.0})
    assert res is not None
    assert res.probability is not None
    assert 0.0 <= res.probability <= 1.0
    assert res.severity in ["LOW", "WARNING", "CRITICAL"]

def test_wildfire_evaluation():
    evaluator = WildfireEvaluator()
    metrics = evaluator.evaluate([0, 1, 0, 1], [0.1, 0.9, 0.2, 0.85])
    assert "accuracy" in metrics
    assert "f1" in metrics
