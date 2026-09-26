from __future__ import annotations
from .risk_classes import RiskCategory

class SpatialZoningEngine:
    def classify_zone(self, risk_score: float) -> RiskCategory:
        if risk_score >= 0.8:
            return RiskCategory.CRITICAL
        elif risk_score >= 0.6:
            return RiskCategory.HIGH
        elif risk_score >= 0.4:
            return RiskCategory.MODERATE
        elif risk_score >= 0.2:
            return RiskCategory.LOW
        return RiskCategory.VERY_LOW
