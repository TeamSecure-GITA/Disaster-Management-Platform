from __future__ import annotations
import numpy as np
from .model import RiskZoningModel
from .zoning import SpatialZoningEngine

class RiskZoningPredictor:
    def __init__(self) -> None:
        self.model = RiskZoningModel()
        self.zoning = SpatialZoningEngine()
    def predict_zone(self, h: float, e: float, v: float) -> dict:
        risk = float(self.model.compute_risk(np.array([h]), np.array([e]), np.array([v]))[0])
        category = self.zoning.classify_zone(risk)
        return {"risk_score": risk, "zone": category.value}
