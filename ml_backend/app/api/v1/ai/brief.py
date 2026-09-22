"""
Automated situation brief (SITREP) generation API router.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.ai.generation.situation_brief import SituationBriefGenerator

router = APIRouter(prefix="/brief", tags=["AI - Situation Briefs"])

_generator = SituationBriefGenerator()


class SituationBriefRequest(BaseModel):
    headline: Optional[str] = Field(None, description="Optional custom briefing title")
    hazards: Optional[List[Dict[str, Any]]] = Field(default_factory=list, description="Active hazards telemetry")
    incidents: Optional[List[Dict[str, Any]]] = Field(default_factory=list, description="Recent emergency incidents")
    affected_areas: Optional[List[str]] = Field(default_factory=list, description="Geographic regions impacted")
    response_status: Optional[str] = Field("active_mobilization", description="Current operational state")
    critical_actions: Optional[List[str]] = Field(default_factory=list, description="Immediate priority directives")


class SituationBriefResponse(BaseModel):
    success: bool
    brief_id: str
    headline: str
    situation: str
    hazard_summary: List[Dict[str, Any]]
    active_incidents: List[Dict[str, Any]]
    affected_areas: List[str]
    response_status: Optional[str]
    critical_actions: List[str]
    information_gaps: List[str]
    generated_at: str


@router.post("/generate", response_model=SituationBriefResponse)
async def generate_situation_brief(request: SituationBriefRequest):
    """Generate an automated operational situation brief (SITREP) for command centers."""
    try:
        brief = _generator.generate(
            headline=request.headline,
            hazards=request.hazards,
            incidents=request.incidents,
            affected_areas=request.affected_areas,
            response_status=request.response_status,
            critical_actions=request.critical_actions,
        )
        d = brief.to_dict()
        return SituationBriefResponse(
            success=True,
            brief_id=d["brief_id"],
            headline=d["headline"],
            situation=d["situation"],
            hazard_summary=d["hazard_summary"],
            active_incidents=d["active_incidents"],
            affected_areas=d["affected_areas"],
            response_status=d["response_status"],
            critical_actions=d["critical_actions"],
            information_gaps=d["information_gaps"],
            generated_at=d["generated_at"],
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Situation brief generation error: {exc}",
        )
