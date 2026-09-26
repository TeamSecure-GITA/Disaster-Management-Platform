from __future__ import annotations
from src.hazard_prediction.landslide import LandslidePredictor
from src.time_series.rainfall import RainfallForecaster
from src.hazard_prediction.multi_hazard import HazardFusionEngine

def test_end_to_end_disaster_workflow():
    # 1. Forecast rainfall
    rainfall_fc = RainfallForecaster(horizon=6)
    forecast = rainfall_fc.forecast()
    
    # 2. Predict landslide risk
    landslide_pred = LandslidePredictor()
    ls_result = landslide_pred.predict({"rainfall_24h": float(forecast[0]), "slope_angle": 40.0})
    
    # 3. Fuse multi-hazard
    fusion = HazardFusionEngine()
    composite = fusion.fuse({"landslide": ls_result, "flood": 0.4})
    assert composite["composite_risk_score"] is not None
