import numpy as np
from src.calibration.temperature_scaling import TemperatureScaler


def test_temperature_scaler():
    scaler = TemperatureScaler()
    logits = np.array([-2.0, -1.0, 1.2, 2.5, 3.0])
    y_true = np.array([0, 0, 1, 1, 1])
    scaler.fit(logits, y_true)
    assert scaler.is_fitted
    assert scaler.temperature > 0.0

    probs = np.array([0.1, 0.25, 0.75, 0.9])
    scaled = scaler.scale_probabilities(probs)
    assert len(scaled) == 4
    assert np.all(scaled >= 0.0) and np.all(scaled <= 1.0)
