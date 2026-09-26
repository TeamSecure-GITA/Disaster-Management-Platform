"""Damage detector wrapper."""
from __future__ import annotations
import numpy as np
from .model import DamageDetectionModel

class DamageDetector:
    def __init__(self, model: DamageDetectionModel | None = None) -> None:
        self.model = model or DamageDetectionModel()
    def detect(self, image: np.ndarray) -> dict:
        return self.model.predict_image(image)
