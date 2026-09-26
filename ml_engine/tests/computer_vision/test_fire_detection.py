from __future__ import annotations
import numpy as np
from src.computer_vision.fire_detection import FireDetector, FireSegmenter

def test_fire_detection():
    detector = FireDetector()
    img = np.zeros((50, 50, 3), dtype=np.uint8)
    res = detector.detect_fire(img)
    assert res["fire_detected"] is True
    seg = FireSegmenter()
    flames, smoke = seg.segment_flames_and_smoke(img)
    assert flames.shape == (50, 50)
