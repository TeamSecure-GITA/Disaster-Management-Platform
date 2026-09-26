from __future__ import annotations
import numpy as np

class DebrisObjectDetector:
    def detect_debris_clusters(self, image: np.ndarray) -> list[dict]:
        return [{"type": "collapsed_masonry", "box": [30, 40, 100, 120], "confidence": 0.89}]
