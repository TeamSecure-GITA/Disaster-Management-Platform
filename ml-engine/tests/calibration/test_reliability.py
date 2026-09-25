import numpy as np
from src.calibration.reliability import ReliabilityDiagram


def test_reliability_diagram():
    diag = ReliabilityDiagram(n_bins=5)
    y_true = np.array([0, 0, 0, 1, 1, 1, 1, 1])
    y_prob = np.array([0.1, 0.2, 0.35, 0.65, 0.7, 0.8, 0.85, 0.95])
    res = diag.compute(y_true, y_prob)
    assert "expected_calibration_error_ece" in res
    assert "maximum_calibration_error_mce" in res
    assert len(res["bins"]) == 5
