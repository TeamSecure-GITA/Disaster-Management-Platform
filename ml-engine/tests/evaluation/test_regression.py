from src.evaluation.regression import RegressionEvaluator


def test_regression_evaluator():
    y_true = [10.0, 20.0, 30.0, 40.0]
    y_pred = [10.5, 19.5, 31.0, 39.0]
    metrics = RegressionEvaluator.evaluate(y_true, y_pred)
    assert "mae" in metrics
    assert "rmse" in metrics
    assert "r2" in metrics
    assert metrics["r2"] > 0.95
