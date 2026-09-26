from __future__ import annotations
import numpy as np

class HazardMappingModel:
    def predict_hazard_intensity(self, features: np.ndarray) -> np.ndarray:
        return np.clip(np.mean(features, axis=1) / 100.0, 0.0, 1.0)
