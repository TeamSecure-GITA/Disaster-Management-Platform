from __future__ import annotations
import numpy as np
from .model import RoadBlockageModel

class RoadBlockageDetector:
    def __init__(self, model: RoadBlockageModel | None = None) -> None:
        self.model = model or RoadBlockageModel()
    def detect_blockage(self, image: np.ndarray) -> dict:
        return self.model.predict_image(image)
