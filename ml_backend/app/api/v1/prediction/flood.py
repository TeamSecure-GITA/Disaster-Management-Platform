"""
Flood inundation and discharge prediction API router.
"""

from __future__ import annotations

from typing import Any, Dict, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.ml.models.flood.model import FloodModel
from app.ml.models.flood.inference import FloodInferenceEngine

router = APIRouter(prefix="/flood", tags=["Prediction - Flood"])

_model = FloodModel()
_engine = FloodInferenceEngine(model=_model)


class FloodPredictRequest(BaseModel):
    river_discharge_m3_s: Optional[float] = Field(None, description="River water discharge (m³/s)")
    river_water_level_m: Optional[float] = Field(None, description="Current river stage level (m)")
    rainfall_intensity_mm_h: Optional[float] = Field(None, description="Current rainfall intensity (mm/h)")
    rainfall_accumulated_24h_mm: Optional[float] = Field(None, description="Accumulated rainfall 24h (mm)")
    elevation_m: Optional[float] = Field(None, description="Area elevation (m)")
    soil_saturation_pct: Optional[float] = Field(None, description="Soil saturation percentage")
    drainage_density_km_km2: Optional[float] = Field(None, description="Catchment drainage density")
    tide_level_m: Optional[float] = Field(None, description="Coastal tide level (m)")
    features: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional hydrological features")


class FloodPredictResponse(BaseModel):
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


@router.post("/predict", response_model=FloodPredictResponse)
async def predict_flood(request: FloodPredictRequest):
    """Predict flood inundation risk and water level threshold breaches."""
    payload = request.model_dump(exclude_unset=True)
    features = payload.pop("features", {}) or {}
    payload.update(features)

    try:
        result = _engine.predict(payload)
        return FloodPredictResponse(
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
            detail=f"Flood inference error: {exc}",
        )


@router.get("/info")
async def get_flood_model_info():
    """Returns metadata for the flood prediction model."""
    meta = _model.metadata
    return {
        "model_name": getattr(meta, "name", "flood-risk-model"),
        "version": getattr(meta, "version", "v1"),
        "trained": getattr(meta, "trained", True),
        "task": getattr(meta, "task", getattr(meta, "target_name", "flood_risk")),
        "description": getattr(meta, "description", ""),
    }
