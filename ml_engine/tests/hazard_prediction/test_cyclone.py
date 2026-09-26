from __future__ import annotations
import pytest
from src.hazard_prediction.cyclone import CycloneModel, CyclonePredictor, CycloneEvaluator

def test_cyclone_prediction_flow():
    model = CycloneModel()
    predictor = CyclonePredictor(model=model)
    res = predictor.predict({"feature_1": 10.0, "feature_2": 25.0})
    assert res is not None
    assert res.probability is not None
    assert 0.0 <= res.probability <= 1.0
    assert res.severity in ["LOW", "WARNING", "CRITICAL"]

def test_cyclone_evaluation():
    evaluator = CycloneEvaluator()
    metrics = evaluator.evaluate([0, 1, 0, 1], [0.1, 0.9, 0.2, 0.85])
    assert "accuracy" in metrics
    assert "f1" in metrics
