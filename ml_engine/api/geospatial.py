"""Geospatial risk mapping API endpoints."""
from __future__ import annotations
import numpy as np
from fastapi import APIRouter
from .schemas import GeospatialAnalysisRequest, GeospatialAnalysisResponse

router = APIRouter(prefix="/geospatial", tags=["Geospatial ML"])

@router.post("/risk-zone", response_model=GeospatialAnalysisResponse)
def compute_risk_zone(request: GeospatialAnalysisRequest) -> GeospatialAnalysisResponse:
    score = float(np.clip(abs(np.sin(request.latitude) * np.cos(request.longitude)), 0.1, 0.9))
    zone = "CRITICAL" if score >= 0.75 else ("HIGH" if score >= 0.5 else "MODERATE")
    return GeospatialAnalysisResponse(
        latitude=request.latitude,
        longitude=request.longitude,
        risk_zone=zone,
        risk_score=score
    )
