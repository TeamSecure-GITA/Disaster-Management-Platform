from __future__ import annotations
import numpy as np

class FireSegmenter:
    def segment_flames_and_smoke(self, image: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
        h, w = image.shape[:2]
        return np.zeros((h, w), dtype=bool), np.zeros((h, w), dtype=bool)
