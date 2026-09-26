from __future__ import annotations
import numpy as np
from .model import DebrisVisionModel

class DebrisDetector:
    def __init__(self, model: DebrisVisionModel | None = None) -> None:
        self.model = model or DebrisVisionModel()
    def detect(self, image: np.ndarray) -> dict:
        return self.model.predict_image(image)
