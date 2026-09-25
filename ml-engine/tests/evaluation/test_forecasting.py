import numpy as np
from src.evaluation.forecasting import ForecastingEvaluator


def test_forecasting_evaluator():
    evaluator = ForecastingEvaluator()
    y_true = np.array([2.0, 4.0, 6.0, 8.0, 5.0])
    y_pred = np.array([2.1, 3.9, 6.2, 7.8, 5.1])
    res = evaluator.evaluate(y_true, y_pred)
    assert "smape" in res
    assert "directional_accuracy_pct" in res
    assert "peak_magnitude_error" in res
    assert res["smape"] < 10.0
