from __future__ import annotations
import pytest
from src.hazard_prediction.multi_hazard import MultiHazardModel, MultiHazardPredictor, HazardFusionEngine

def test_multi_hazard_flow():
    predictor = MultiHazardPredictor()
    res = predictor.predict({"landslide_prob": 0.6, "flood_prob": 0.7})
    assert res.probability is not None

def test_hazard_fusion():
    fusion = HazardFusionEngine()
    result = fusion.fuse({"cyclone": 0.8, "flood": 0.75, "landslide": 0.3})
    assert "composite_risk_score" in result
    assert result["composite_risk_score"] > 0.5
    assert result["amplification_factor"] > 1.0
