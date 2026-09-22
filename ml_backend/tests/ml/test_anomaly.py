import pytest
from app.ml.models.anomaly.detector import StatisticalAnomalyDetector, AnomalyDetector

def test_anomaly_detector():
    stat = StatisticalAnomalyDetector()
    history = [10.0, 10.5, 9.8, 10.2, 10.1, 9.9, 10.3]
    normal_res = stat.detect_zscore(10.2, history)
    assert not normal_res.is_anomaly

    spike_res = stat.detect_zscore(55.0, history)
    assert spike_res.is_anomaly
    assert spike_res.severity in ('high', 'critical')
