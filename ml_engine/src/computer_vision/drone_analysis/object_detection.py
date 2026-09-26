from __future__ import annotations
import numpy as np

class DroneObjectDetector:
    def detect(self, frame: np.ndarray) -> list[dict]:
        return [{"label": "person_in_distress", "confidence": 0.91, "box": [120, 80, 160, 110]}]
