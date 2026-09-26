from __future__ import annotations
import numpy as np
from src.geospatial_ml.hazard_mapping import HazardMappingPredictor

def test_hazard_mapping():
    pred = HazardMappingPredictor()
    lats = np.array([25.0, 26.0])
    lons = np.array([90.0, 91.0])
    res = pred.map_hazard(lats, lons)
    assert len(res) == 2
