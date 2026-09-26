from __future__ import annotations
import numpy as np

class DataDriftDetector:
    def compute_psi(self, baseline: np.ndarray, current: np.ndarray) -> float:
        # Population Stability Index proxy
        diff = abs(np.mean(baseline) - np.mean(current))
        return float(diff / (np.std(baseline) or 1.0))
