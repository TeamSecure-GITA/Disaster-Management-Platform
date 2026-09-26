from __future__ import annotations
import numpy as np
from .model import FireVisionModel

class FireDetector:
    def __init__(self, model: FireVisionModel | None = None) -> None:
        self.model = model or FireVisionModel()
    def detect_fire(self, image: np.ndarray) -> dict:
        return self.model.predict_image(image)
