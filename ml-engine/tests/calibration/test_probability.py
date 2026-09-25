import numpy as np
from src.calibration.probability import ProbabilityCalibrator


def test_probability_calibrator():
    cal = ProbabilityCalibrator()
    y_prob = np.array([0.2, 0.3, 0.7, 0.8, 0.9])
    y_true = np.array([0, 0, 1, 1, 1])
    cal.fit(y_prob, y_true)
    calibrated = cal.predict_proba(y_prob)
    assert len(calibrated) == 5
    assert np.all(calibrated >= 0.0) and np.all(calibrated <= 1.0)
