from __future__ import annotations
import numpy as np
from src.geospatial_ml.exposure_mapping import ExposurePredictor

def test_exposure_mapping():
    pred = ExposurePredictor()
    exp = pred.predict(np.array([100.0, 200.0]), np.array([50.0, 80.0]))
    assert len(exp) == 2
