"""Water surface segmentation."""
from __future__ import annotations
import numpy as np

class WaterSegmenter:
    def segment(self, image: np.ndarray) -> np.ndarray:
        # Returns binary water mask (H, W)
        h, w = image.shape[:2]
        return np.zeros((h, w), dtype=bool)
