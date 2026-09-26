from __future__ import annotations
import numpy as np
from ..base_vision_model import BaseVisionModel

class DebrisVisionModel(BaseVisionModel):
    def predict_image(self, image: np.ndarray) -> dict:
        return {"debris_present": True, "density_m2": 14.2, "confidence": 0.87}
