"""Flood visual detector."""
from __future__ import annotations
import numpy as np
from .model import FloodVisionModel

class FloodDetector:
    def __init__(self, model: FloodVisionModel | None = None) -> None:
        self.model = model or FloodVisionModel()
    def detect(self, image: np.ndarray) -> dict:
        return self.model.predict_image(image)
