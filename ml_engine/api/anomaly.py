"""Anomaly detection API endpoints."""
from __future__ import annotations
import numpy as np
from fastapi import APIRouter
from .schemas import AnomalyDetectionRequest, AnomalyDetectionResponse

router = APIRouter(prefix="/anomaly", tags=["Anomaly Detection"])

@router.post("/detect", response_model=AnomalyDetectionResponse)
def detect_anomaly(request: AnomalyDetectionRequest) -> AnomalyDetectionResponse:
    score = float(np.clip(np.random.uniform(0.1, 0.9), 0.0, 1.0))
    return AnomalyDetectionResponse(
        is_anomaly=score > 0.75,
        anomaly_score=score,
        domain=request.domain
    )
