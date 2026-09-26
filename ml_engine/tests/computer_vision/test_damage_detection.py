from __future__ import annotations
import numpy as np
from src.computer_vision.damage_detection import DamageDetector, DamageClassifier

def test_damage_detection():
    detector = DamageDetector()
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    res = detector.detect(img)
    assert "damage_level" in res
    classifier = DamageClassifier()
    level = classifier.classify(np.array([0.8, 0.9]))
    assert level == "DESTROYED"
