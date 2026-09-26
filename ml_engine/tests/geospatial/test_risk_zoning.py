from __future__ import annotations
from src.geospatial_ml.risk_zoning import RiskZoningPredictor, RiskCategory

def test_risk_zoning():
    pred = RiskZoningPredictor()
    res = pred.predict_zone(0.95, 0.95, 0.95)
    assert res["zone"] == RiskCategory.CRITICAL.value
