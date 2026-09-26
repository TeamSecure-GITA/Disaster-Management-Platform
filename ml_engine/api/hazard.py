"""Hazard prediction API endpoints."""
from __future__ import annotations
from fastapi import APIRouter
from .schemas import HazardPredictionRequest, HazardPredictionResponse

router = APIRouter(prefix="/hazard", tags=["Hazard Prediction"])

@router.post("/predict", response_model=HazardPredictionResponse)
def predict_hazard(request: HazardPredictionRequest) -> HazardPredictionResponse:
    # Heuristic probability calculation based on feature inputs
    val = sum(request.features.values()) if request.features else 50.0
    prob = float(min(max(val / 150.0, 0.05), 0.95))
    severity = "CRITICAL" if prob >= 0.7 else ("WARNING" if prob >= 0.4 else "LOW")
    return HazardPredictionResponse(
        hazard_type=request.hazard_type,
        risk_probability=prob,
        severity=severity,
        prediction=int(prob >= 0.5),
        metadata={"location_id": request.location_id}
    )
