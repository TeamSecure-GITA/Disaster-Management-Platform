from __future__ import annotations
import numpy as np

class ModelDriftDetector:
    def detect_concept_drift(self, y_true_recent: np.ndarray, y_pred_recent: np.ndarray) -> bool:
        error_rate = np.mean(y_true_recent != y_pred_recent)
        return bool(error_rate > 0.25)
