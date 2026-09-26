"""Computer vision inference API endpoints."""
from __future__ import annotations
from fastapi import APIRouter
from .schemas import VisionAnalysisRequest, VisionAnalysisResponse

router = APIRouter(prefix="/vision", tags=["Computer Vision"])

@router.post("/analyze", response_model=VisionAnalysisResponse)
def analyze_vision(request: VisionAnalysisRequest) -> VisionAnalysisResponse:
    return VisionAnalysisResponse(
        task=request.task,
        detections=[{"label": "hazard_indicator", "confidence": 0.88, "bbox": [10, 20, 100, 120]}],
        confidence=0.88
    )
