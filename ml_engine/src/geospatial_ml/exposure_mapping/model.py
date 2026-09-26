from __future__ import annotations
import numpy as np

class ExposureModel:
    def estimate_exposure(self, pop_density: np.ndarray, asset_value: np.ndarray) -> np.ndarray:
        return np.maximum(pop_density * 0.6 + asset_value * 0.4, 0.0)
