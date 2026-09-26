"""NLP disaster report processing API endpoints."""
from __future__ import annotations
from fastapi import APIRouter
from .schemas import NLPAnalysisRequest, NLPAnalysisResponse

router = APIRouter(prefix="/nlp", tags=["NLP Engine"])

@router.post("/process", response_model=NLPAnalysisResponse)
def process_text(request: NLPAnalysisRequest) -> NLPAnalysisResponse:
    return NLPAnalysisResponse(
        task=request.task,
        result={"category": "FLOOD_EMERGENCY", "urgency": "HIGH", "entities": ["Bridge", "Main St"]}
    )
