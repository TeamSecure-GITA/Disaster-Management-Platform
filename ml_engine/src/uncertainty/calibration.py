from __future__ import annotations
import numpy as np

class UncertaintyCalibrator:
    def expected_calibration_error(self, y_true: np.ndarray, y_prob: np.ndarray, n_bins: int = 10) -> float:
        bins = np.linspace(0, 1, n_bins + 1)
        ece = 0.0
        for i in range(n_bins):
            mask = (y_prob >= bins[i]) & (y_prob < bins[i+1])
            if np.sum(mask) > 0:
                acc = np.mean(y_true[mask])
                conf = np.mean(y_prob[mask])
                ece += (np.sum(mask) / len(y_true)) * abs(acc - conf)
        return float(ece)
