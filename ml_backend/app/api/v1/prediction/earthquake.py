"""
Earthquake ground motion and structural risk prediction API router.
"""

from __future__ import annotations

from typing import Any, Dict, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.ml.models.earthquake.model import EarthquakeModel
from app.ml.models.earthquake.inference import EarthquakeInferenceEngine

router = APIRouter(prefix="/earthquake", tags=["Prediction - Earthquake"])

_model = EarthquakeModel()
_engine = EarthquakeInferenceEngine(model=_model)


class EarthquakePredictRequest(BaseModel):
    magnitude: Optional[float] = Field(None, description="Earthquake moment magnitude (Mw)")
    hypocenter_depth_km: Optional[float] = Field(None, description="Focal depth in kilometers")
    epicentral_distance_km: Optional[float] = Field(None, description="Distance from epicenter (km)")
    vs30_m_s: Optional[float] = Field(None, description="Time-averaged shear-wave velocity in top 30m (m/s)")
    peak_ground_acceleration_g: Optional[float] = Field(None, description="Observed or estimated PGA (g)")
    fault_mechanism: Optional[str] = Field(None, description="Faulting style: strike-slip, reverse, normal")
    soil_type_code: Optional[str] = Field(None, description="NEHRP site classification (A, B, C, D, E)")
    features: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional seismic parameters")


class EarthquakePredictResponse(BaseModel):
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


@router.post("/predict", response_model=EarthquakePredictResponse)
async def predict_earthquake(request: EarthquakePredictRequest):
    """Predict ground motion shaking intensity (MMI) and structural building damage risk."""
    payload = request.model_dump(exclude_unset=True)
    features = payload.pop("features", {}) or {}
    payload.update(features)

    try:
        result = _engine.predict(payload)
        return EarthquakePredictResponse(
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
            detail=f"Earthquake inference error: {exc}",
        )


@router.get("/info")
async def get_earthquake_model_info():
    """Returns metadata for the earthquake prediction model."""
    meta = _model.metadata
    return {
        "model_name": getattr(meta, "name", "earthquake-hazard-model"),
        "version": getattr(meta, "version", "v1"),
        "trained": getattr(meta, "trained", True),
        "task": getattr(meta, "task", getattr(meta, "target_name", "earthquake_hazard")),
        "description": getattr(meta, "description", ""),
    }
