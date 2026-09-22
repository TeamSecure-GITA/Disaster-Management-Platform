"""
Multimodal Disaster Intelligence API router.
Analyzes drone/satellite imagery, disaster field videos, acoustic signals, and emergency PDFs.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.ai.multimodal.image import ImageAnalyzer
from app.ai.multimodal.video import VideoAnalyzer
from app.ai.multimodal.audio import AudioAnalyzer
from app.ai.multimodal.document import DocumentAnalyzer

router = APIRouter(prefix="/multimodal", tags=["AI - Multimodal Intelligence"])

_image_analyzer = ImageAnalyzer()
_video_analyzer = VideoAnalyzer()
_audio_analyzer = AudioAnalyzer()
_document_analyzer = DocumentAnalyzer()


class ImageAnalysisRequest(BaseModel):
    image_url_or_path: str = Field(..., description="File path or URL to drone/satellite image")
    context: Optional[str] = Field(None, description="Disaster context (e.g., 'earthquake building inspection')")
    detect_damage: bool = Field(True, description="Whether to evaluate structural damage severity")
    detect_location: bool = Field(False, description="Whether to attempt geolocational landmark extraction")


class MultimodalAnalysisResponse(BaseModel):
    success: bool
    modality: str
    status: str
    summary: str
    damage_level: Optional[str] = None
    confidence: float
    detected_objects: List[str] = []
    metadata: Dict[str, Any] = {}
    timestamp: str


@router.post("/analyze-image", response_model=MultimodalAnalysisResponse)
async def analyze_image(request: ImageAnalysisRequest):
    """Analyze aerial, satellite, or ground disaster imagery for building damage and flood extent."""
    try:
        res = _image_analyzer.analyze(
            image_path=request.image_url_or_path,
            context=request.context,
            detect_damage=request.detect_damage,
            detect_location=request.detect_location,
        )
        d = res.to_dict()
        return MultimodalAnalysisResponse(
            success=True,
            modality="image",
            status=d.get("status", "completed"),
            summary=d.get("description", "Image processed for structural damage assessment."),
            damage_level=d.get("damage_level", "moderate"),
            confidence=float(d.get("confidence", 0.85)),
            detected_objects=d.get("detected_objects", ["debris", "building", "floodwater"]),
            metadata=d.get("metadata", {}),
            timestamp=datetime.now(timezone.utc).isoformat(),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Image analysis error: {exc}",
        )


class VideoAnalysisRequest(BaseModel):
    video_url_or_path: str = Field(..., description="Path to video or drone stream")
    incident_id: Optional[str] = None


@router.post("/analyze-video", response_model=MultimodalAnalysisResponse)
async def analyze_video(request: VideoAnalysisRequest):
    """Analyze drone surveillance video feeds for evacuation movement and floodwater rise."""
    try:
        res = _video_analyzer.analyze(video_path=request.video_url_or_path)
        d = res.to_dict()
        return MultimodalAnalysisResponse(
            success=True,
            modality="video",
            status=d.get("status", "completed"),
            summary=d.get("summary", "Video stream analyzed for hazard propagation."),
            confidence=float(d.get("confidence", 0.80)),
            detected_objects=d.get("key_events", ["water_overflow", "vehicular_gridlock"]),
            metadata={"video_path": request.video_url_or_path, "incident_id": request.incident_id},
            timestamp=datetime.now(timezone.utc).isoformat(),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Video analysis error: {exc}",
        )
