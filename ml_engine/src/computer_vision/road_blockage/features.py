from __future__ import annotations
import numpy as np

class RoadFeatureExtractor:
    def extract_road_surface(self, image: np.ndarray) -> np.ndarray:
        return np.mean(image, axis=-1)
