from __future__ import annotations

class PredictionQualityAssessment:
    def assess_quality(self, confidence: float, uncertainty: float) -> str:
        if confidence > 0.8 and uncertainty < 0.2:
            return "HIGH_QUALITY"
        elif confidence > 0.5:
            return "ACCEPTABLE"
        return "LOW_CONFIDENCE_FLAG"
