from __future__ import annotations
import numpy as np
from src.computer_vision.debris_detection import DebrisDetector

def test_debris_detection():
    detector = DebrisDetector()
    img = np.zeros((40, 40, 3), dtype=np.uint8)
    res = detector.detect(img)
    assert res["debris_present"] is True
