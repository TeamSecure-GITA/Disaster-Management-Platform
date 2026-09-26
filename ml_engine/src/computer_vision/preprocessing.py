"""Vision preprocessing transforms."""
from __future__ import annotations

import numpy as np


class VisionPreprocessor:
    """Normalizes image pixels to [0, 1] or ImageNet standard ranges."""

    def preprocess(self, img: np.ndarray) -> np.ndarray:
        arr = img.astype(np.float32) / 255.0
        return arr
