from __future__ import annotations
import numpy as np
from src.computer_vision.flood_detection import FloodDetector, WaterSegmenter

def test_flood_detection():
    detector = FloodDetector()
    img = np.zeros((64, 64, 3), dtype=np.uint8)
    res = detector.detect(img)
    assert res["flooded"] is True
    seg = WaterSegmenter()
    mask = seg.segment(img)
    assert mask.shape == (64, 64)
