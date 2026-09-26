from __future__ import annotations
import numpy as np
from .model import ExposureModel

class ExposurePredictor:
    def __init__(self) -> None:
        self.model = ExposureModel()
    def predict(self, pop: np.ndarray, assets: np.ndarray) -> np.ndarray:
        return self.model.estimate_exposure(pop, assets)
