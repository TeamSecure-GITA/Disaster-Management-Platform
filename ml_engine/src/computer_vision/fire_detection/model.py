from __future__ import annotations
import numpy as np
from ..base_vision_model import BaseVisionModel

class FireVisionModel(BaseVisionModel):
    def predict_image(self, image: np.ndarray) -> dict:
        return {"fire_detected": True, "smoke_detected": True, "fire_intensity": "HIGH", "confidence": 0.94}
