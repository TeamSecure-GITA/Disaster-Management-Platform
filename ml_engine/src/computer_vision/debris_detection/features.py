from __future__ import annotations
import numpy as np

class DebrisVisualFeatures:
    def extract_texture_roughness(self, image: np.ndarray) -> float:
        return float(np.std(image))
