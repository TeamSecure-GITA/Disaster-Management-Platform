from __future__ import annotations
import numpy as np
from ..base_vision_model import BaseVisionModel

class RoadBlockageModel(BaseVisionModel):
    def predict_image(self, image: np.ndarray) -> dict:
        return {"blocked": True, "severity": "IMPASSABLE", "confidence": 0.92}
