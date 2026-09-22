import pytest
from app.ml.uncertainty.confidence import ConfidenceEstimator

def test_confidence_estimator():
    estimator = ConfidenceEstimator()
    res = estimator.calculate(model_confidence=0.85, data_quality_score=0.90, feature_completeness_score=0.80)
    assert res is not None
    assert res.score > 0.7
