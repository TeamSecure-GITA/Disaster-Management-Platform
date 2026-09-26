"""Multi-hazard compounding and cascading risk fusion engine."""
from __future__ import annotations

from typing import Any
import numpy as np
from src.core.prediction import PredictionResult


class HazardFusionEngine:
    """Fuses individual hazard risk probabilities into a unified multi-hazard index."""

    def __init__(self, weights: dict[str, float] | None = None) -> None:
        self.weights = weights or {
            "landslide": 0.25,
            "flood": 0.25,
            "cyclone": 0.20,
            "earthquake": 0.20,
            "wildfire": 0.10,
        }

    def fuse(self, hazard_risks: dict[str, float | PredictionResult]) -> dict[str, Any]:
        weighted_sum = 0.0
        total_w = 0.0
        details = {}

        for hazard, val in hazard_risks.items():
            prob = val.probability if isinstance(val, PredictionResult) and val.probability is not None else float(val)
            w = self.weights.get(hazard, 0.1)
            weighted_sum += prob * w
            total_w += w
            details[hazard] = prob

        amplification = 1.0
        if details.get("cyclone", 0) > 0.5 and details.get("flood", 0) > 0.5:
            amplification += 0.25
        if details.get("flood", 0) > 0.5 and details.get("landslide", 0) > 0.5:
            amplification += 0.30

        combined_score = float(np.clip((weighted_sum / (total_w or 1.0)) * amplification, 0.0, 1.0))
        severity = "CRITICAL" if combined_score >= 0.75 else ("HIGH" if combined_score >= 0.5 else "MODERATE")

        return {
            "composite_risk_score": combined_score,
            "overall_severity": severity,
            "amplification_factor": amplification,
            "individual_hazards": details,
        }
