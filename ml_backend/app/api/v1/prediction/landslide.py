"""
Landslide hazard prediction API router.
"""

from __future__ import annotations

from typing import Any, Dict, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.ml.models.landslide.model import LandslideModel
from app.ml.models.landslide.inference import LandslideInferenceEngine
from app.ml.models.factory import create_operational_landslide_engine

router = APIRouter(prefix="/landslide", tags=["Prediction - Landslide"])

_engine = create_operational_landslide_engine()
_model = _engine.model


class LandslidePredictRequest(BaseModel):
    rainfall_1h_mm: Optional[float] = Field(None, description="Rainfall in past 1 hour (mm)")
    rainfall_6h_mm: Optional[float] = Field(None, description="Rainfall in past 6 hours (mm)")
    rainfall_24h_mm: Optional[float] = Field(None, description="Rainfall in past 24 hours (mm)")
    rainfall_7d_mm: Optional[float] = Field(None, description="Cumulative rainfall in past 7 days (mm)")
    slope_angle_deg: Optional[float] = Field(None, description="Slope inclination in degrees")
    elevation_m: Optional[float] = Field(None, description="Elevation above sea level in meters")
    soil_moisture_pct: Optional[float] = Field(None, description="Volumetric soil water content (%)")
    pore_water_pressure_kpa: Optional[float] = Field(None, description="Soil pore water pressure (kPa)")
    ndvi: Optional[float] = Field(None, description="Normalized Difference Vegetation Index (-1 to 1)")
    distance_to_road_m: Optional[float] = Field(None, description="Proximity to nearest road cut (m)")
    distance_to_drainage_m: Optional[float] = Field(None, description="Proximity to nearest drainage stream (m)")
    ground_displacement_mm: Optional[float] = Field(None, description="InSAR/ground sensor displacement (mm)")
    features: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional custom features")


class LandslidePredictResponse(BaseModel):
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


@router.post("/predict", response_model=LandslidePredictResponse)
async def predict_landslide(request: LandslidePredictRequest):
    """Predict landslide susceptibility and risk score based on terrain and hydrological telemetry."""
    payload = request.model_dump(exclude_unset=True)
    features = payload.pop("features", {}) or {}
    payload.update(features)

    try:
        result = _engine.predict(payload)
        res_dict = result.to_dict()
        return LandslidePredictResponse(
            success=result.status in ("success", "partial_prediction", "missing_features", "ok"),
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
            detail=f"Landslide inference error: {exc}",
        )


@router.get("/info")
async def get_landslide_model_info():
    """Returns metadata for the landslide prediction model."""
    meta = _model.metadata
    return {
        "model_name": getattr(meta, "name", "landslide-risk-model"),
        "version": getattr(meta, "version", "v1"),
        "trained": getattr(meta, "trained", True),
        "task": getattr(meta, "task", getattr(meta, "target_name", "landslide_risk")),
        "description": getattr(meta, "description", ""),
    }
