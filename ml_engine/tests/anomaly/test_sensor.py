from __future__ import annotations
import pytest
import numpy as np
import pandas as pd
from src.anomaly.sensor import SensorAnomalyDetector, SensorAnomalyEvaluator

def test_sensor_anomaly_detection():
    detector = SensorAnomalyDetector(contamination=0.1)
    data = pd.DataFrame(np.random.randn(50, 4))
    detector.fit(data)
    anomalies = detector.detect(data)
    scores = detector.score_samples(data)
    assert len(anomalies) == 50
    assert len(scores) == 50
    assert np.issubdtype(anomalies.dtype, np.bool_)

def test_sensor_evaluation():
    evaluator = SensorAnomalyEvaluator()
    res = evaluator.evaluate(np.array([0, 1, 0, 1]), np.array([0, 1, 0, 0]))
    assert "precision" in res
    assert "recall" in res
