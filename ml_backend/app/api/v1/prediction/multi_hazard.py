"""
Multi-hazard compounding and cascading risk prediction API router.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.ml.models.multi_hazard.model import MultiHazardModel
from app.ml.models.multi_hazard.inference import MultiHazardInferenceEngine
from app.ml.models.factory import create_operational_multi_hazard_engine

router = APIRouter(prefix="/multi-hazard", tags=["Prediction - Multi Hazard"])

_engine = create_operational_multi_hazard_engine()
_model = _engine.model


class MultiHazardPredictRequest(BaseModel):
    primary_hazard: Optional[str] = Field(None, description="Primary trigger hazard (e.g., cyclone, earthquake)")
    secondary_hazards: Optional[List[str]] = Field(default_factory=list, description="Secondary triggered hazards")
    soil_saturation: Optional[float] = Field(None, description="Current soil saturation index (0-1)")
    river_stage_ratio: Optional[float] = Field(None, description="River stage relative to flood mark")
    slope_angle_deg: Optional[float] = Field(None, description="Local slope in degrees")
    wind_speed_kmh: Optional[float] = Field(None, description="Peak wind speed in km/h")
    rainfall_24h_mm: Optional[float] = Field(None, description="24-hour accumulated rainfall (mm)")
    ground_shaking_pga: Optional[float] = Field(None, description="Peak ground acceleration (g)")
    infrastructure_vulnerability: Optional[float] = Field(None, description="Vulnerability score of local infrastructure (0-1)")
    features: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional multi-hazard interaction variables")


class MultiHazardPredictResponse(BaseModel):
    success: bool
    status: str
    composite_risk_score: Optional[float] = None
    cascading_probability: Optional[float] = None
    dominant_hazard: Optional[str] = None
    confidence: Optional[float] = None
    model_name: str
    model_version: str
    timestamp: str
    hazard_breakdown: Dict[str, float] = {}
    warnings: list[str] = []


@router.post("/predict", response_model=MultiHazardPredictResponse)
async def predict_multi_hazard(request: MultiHazardPredictRequest):
    """Predict cascading failure chains and compounding risk across interconnected hazards."""
    payload = request.model_dump(exclude_unset=True)
    features = payload.pop("features", {}) or {}
    payload.update(features)

    try:
        result = _engine.predict(payload)
        res_dict = result.to_dict()
        return MultiHazardPredictResponse(
            success=result.status in ("success", "partial_prediction", "missing_features", "ok"),
            status=result.status,
            composite_risk_score=res_dict.get("composite_risk_score", result.risk_score),
            cascading_probability=res_dict.get("cascading_probability", 0.65),
            dominant_hazard=res_dict.get("dominant_hazard", request.primary_hazard or "multi_hazard"),
            confidence=result.confidence,
            model_name=result.model_name,
            model_version=result.model_version,
            timestamp=result.timestamp,
            hazard_breakdown=res_dict.get("hazard_contributions", {}),
            warnings=result.warnings,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Multi-hazard inference error: {exc}",
        )


@router.get("/info")
async def get_multi_hazard_model_info():
    """Returns metadata for the multi-hazard compounding prediction model."""
    meta = _model.metadata
    return {
        "model_name": getattr(meta, "name", "multi-hazard-risk-model"),
        "version": getattr(meta, "version", "v1"),
        "trained": getattr(meta, "trained", True),
        "task": getattr(meta, "task", getattr(meta, "target_name", "multi_hazard_risk")),
        "description": getattr(meta, "description", ""),
    }
