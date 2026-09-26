from __future__ import annotations
import numpy as np
from src.computer_vision.road_blockage import RoadBlockageDetector, ObstacleDetector

def test_road_blockage():
    detector = RoadBlockageDetector()
    img = np.zeros((50, 50, 3), dtype=np.uint8)
    res = detector.detect_blockage(img)
    assert res["blocked"] is True
    obs = ObstacleDetector()
    detections = obs.detect_obstacles(img)
    assert len(detections) > 0
