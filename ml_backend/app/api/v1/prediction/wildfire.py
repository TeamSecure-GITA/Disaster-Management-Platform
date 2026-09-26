"""
Wildfire spread rate and ignition risk prediction API router.
"""

from __future__ import annotations

from typing import Any, Dict, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.ml.models.wildfire.model import WildfireModel
from app.ml.models.wildfire.inference import WildfireInferenceEngine
from app.ml.models.factory import create_operational_wildfire_engine

router = APIRouter(prefix="/wildfire", tags=["Prediction - Wildfire"])

_engine = create_operational_wildfire_engine()
_model = _engine.model


class WildfirePredictRequest(BaseModel):
    temperature_c: Optional[float] = Field(None, description="Ambient air temperature (Celsius)")
    relative_humidity_pct: Optional[float] = Field(None, description="Relative humidity percentage")
    wind_speed_kmh: Optional[float] = Field(None, description="Sustained surface wind speed (km/h)")
    wind_gust_kmh: Optional[float] = Field(None, description="Peak wind gust speed (km/h)")
    fuel_moisture_10h_pct: Optional[float] = Field(None, description="Dead fuel moisture (10-hour, %)")
    drought_index_kbdi: Optional[float] = Field(None, description="Keetch-Byram Drought Index (0-800)")
    slope_pct: Optional[float] = Field(None, description="Topographical slope percent")
    vegetation_density_ndvi: Optional[float] = Field(None, description="Fuel biomass density via NDVI")
    features: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional combustion variables")


class WildfirePredictResponse(BaseModel):
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


@router.post("/predict", response_model=WildfirePredictResponse)
async def predict_wildfire(request: WildfirePredictRequest):
    """Predict wildfire rate of spread, flame length, and containment difficulty."""
    payload = request.model_dump(exclude_unset=True)
    features = payload.pop("features", {}) or {}
    payload.update(features)

    try:
        result = _engine.predict(payload)
        return WildfirePredictResponse(
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
            detail=f"Wildfire inference error: {exc}",
        )


@router.get("/info")
async def get_wildfire_model_info():
    """Returns metadata for the wildfire prediction model."""
    meta = _model.metadata
    return {
        "model_name": getattr(meta, "name", "wildfire-risk-model"),
        "version": getattr(meta, "version", "v1"),
        "trained": getattr(meta, "trained", True),
        "task": getattr(meta, "task", getattr(meta, "target_name", "wildfire_risk")),
        "description": getattr(meta, "description", ""),
    }
