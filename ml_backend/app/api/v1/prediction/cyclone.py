"""
Cyclone and storm surge intensity prediction API router.
"""

from __future__ import annotations

from typing import Any, Dict, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.ml.models.cyclone.model import CycloneModel
from app.ml.models.cyclone.inference import CycloneInferenceEngine

router = APIRouter(prefix="/cyclone", tags=["Prediction - Cyclone"])

_model = CycloneModel()
_engine = CycloneInferenceEngine(model=_model)


class CyclonePredictRequest(BaseModel):
    central_pressure_hpa: Optional[float] = Field(None, description="Cyclone central atmospheric pressure (hPa)")
    max_sustained_wind_knots: Optional[float] = Field(None, description="Maximum sustained wind speed in knots")
    sea_surface_temp_c: Optional[float] = Field(None, description="Sea surface temperature in Celsius")
    distance_to_coast_km: Optional[float] = Field(None, description="Distance of eye to closest shoreline (km)")
    forward_speed_kmh: Optional[float] = Field(None, description="Translational speed of storm (km/h)")
    vertical_wind_shear_knots: Optional[float] = Field(None, description="Environmental vertical wind shear (knots)")
    features: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional atmospheric features")


class CyclonePredictResponse(BaseModel):
    success: bool
    status: str
    risk_score: Optional[float] = None
    risk_level: Optional[str] = None
    confidence: Optional[float] = None
    model_name: str
    model_version: str
    timestamp: str
    feature_contributions: Dict[str, float] = {}
    missing_features: list[str] = []
    warnings: list[str] = []


@router.post("/predict", response_model=CyclonePredictResponse)
async def predict_cyclone(request: CyclonePredictRequest):
    """Predict tropical cyclone intensity, storm surge probability, and track impact."""
    payload = request.model_dump(exclude_unset=True)
    features = payload.pop("features", {}) or {}
    payload.update(features)

    try:
        result = _engine.predict(payload)
        return CyclonePredictResponse(
            success=result.status in ("success", "partial_prediction", "missing_features"),
            status=result.status,
            risk_score=result.risk_score,
            risk_level=result.risk_level,
            confidence=result.confidence,
            model_name=result.model_name,
            model_version=result.model_version,
            timestamp=result.timestamp,
            feature_contributions=result.feature_contributions,
            missing_features=result.missing_features,
            warnings=result.warnings,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Cyclone inference error: {exc}",
        )


@router.get("/info")
async def get_cyclone_model_info():
    """Returns metadata for the cyclone prediction model."""
    meta = _model.metadata
    return {
        "model_name": getattr(meta, "name", "cyclone-risk-model"),
        "version": getattr(meta, "version", "v1"),
        "trained": getattr(meta, "trained", True),
        "task": getattr(meta, "task", getattr(meta, "target_name", "cyclone_risk")),
        "description": getattr(meta, "description", ""),
    }
