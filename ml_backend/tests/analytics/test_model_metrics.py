import pytest
from app.analytics.model_metrics.classification import compute_classification_metrics
from app.analytics.model_metrics.regression import compute_regression_metrics

def test_classification_metrics():
    y_true = [1, 0, 1, 1, 0, 1, 0]
    y_pred = [1, 0, 1, 0, 0, 1, 0]
    metrics = compute_classification_metrics(y_true, y_pred)
    assert metrics['accuracy'] > 0.8
    assert 'f1_score' in metrics

def test_regression_metrics():
    y_true = [10.0, 15.0, 20.0, 25.0]
    y_pred = [10.2, 14.8, 20.5, 24.7]
    metrics = compute_regression_metrics(y_true, y_pred)
    assert metrics['rmse'] < 1.0
    assert metrics['r2'] > 0.9
