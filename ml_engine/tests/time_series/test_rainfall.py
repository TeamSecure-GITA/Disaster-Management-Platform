from __future__ import annotations
import pytest
import numpy as np
from src.time_series.rainfall import RainfallForecaster, RainfallTimeSeriesEvaluator

def test_rainfall_forecaster():
    forecaster = RainfallForecaster(horizon=12)
    series = np.linspace(10.0, 25.0, 50) + np.random.normal(0, 1, 50)
    forecaster.fit(series)
    fc = forecaster.forecast(steps=12)
    assert len(fc) == 12
    assert np.all(fc >= 0)

def test_rainfall_evaluation():
    evaluator = RainfallTimeSeriesEvaluator()
    y_t = np.array([10.0, 12.0, 14.0])
    y_p = np.array([10.5, 11.8, 14.2])
    metrics = evaluator.evaluate(y_t, y_p)
    assert "rmse" in metrics
    assert "mae" in metrics
