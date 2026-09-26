from __future__ import annotations
import numpy as np

class EnsembleCalibrator:
    def calibrate(self, probs: np.ndarray, temp: float = 1.0) -> np.ndarray:
        t = max(temp, 1e-3)
        logits = np.log(np.clip(probs, 1e-7, 1 - 1e-7) / (1 - np.clip(probs, 1e-7, 1 - 1e-7)))
        scaled = logits / t
        return 1 / (1 + np.exp(-scaled))
