from __future__ import annotations
import numpy as np

class ObstacleDetector:
    def detect_obstacles(self, image: np.ndarray) -> list[dict]:
        return [{"type": "fallen_tree", "box": [50, 100, 120, 200], "confidence": 0.88}]
