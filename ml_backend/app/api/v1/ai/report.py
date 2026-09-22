"""
Comprehensive Incident & Damage Report Generation API router.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.ai.generation.incident_report import IncidentReportGenerator

router = APIRouter(prefix="/report", tags=["AI - Incident Reports"])

_generator = IncidentReportGenerator()


class IncidentReportRequest(BaseModel):
    incident_id: str = Field(..., description="Unique incident identifier")
    title: Optional[str] = Field(None, description="Report title")
    incident_type: str = Field("flash_flood", description="Hazard / incident classification")
    severity: int = Field(3, ge=1, le=5, description="Severity rating 1-5")
    location: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Location details")
    timeline: Optional[List[Dict[str, Any]]] = Field(default_factory=list, description="Chronological incident logs")
    casualties: Optional[Dict[str, int]] = Field(default_factory=dict, description="Casualty counts (injured, fatal, missing)")
    damage_assessment: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Structural / infrastructure damages")
    actions_taken: Optional[List[str]] = Field(default_factory=list, description="Response efforts undertaken")
    recommendations: Optional[List[str]] = Field(default_factory=list, description="Forward recovery recommendations")


class IncidentReportResponse(BaseModel):
    success: bool
    report_id: str
    incident_id: str
    title: str
    summary: str
    full_report_text: str
    severity: int
    generated_at: str
    metadata: Dict[str, Any] = {}


@router.post("/generate", response_model=IncidentReportResponse)
async def generate_incident_report(request: IncidentReportRequest):
    """Generate a formal multi-section Incident & Damage Assessment Report."""
    try:
        report = _generator.generate(
            incident_id=request.incident_id,
            title=request.title or f"Incident Report: {request.incident_id}",
            incident_type=request.incident_type,
            severity=request.severity,
            location=request.location,
            timeline=request.timeline,
            casualties=request.casualties,
            damage_assessment=request.damage_assessment,
            actions_taken=request.actions_taken,
            recommendations=request.recommendations,
        )
        d = report.to_dict()
        return IncidentReportResponse(
            success=True,
            report_id=d.get("report_id", f"rep_{request.incident_id}"),
            incident_id=request.incident_id,
            title=d.get("title", f"Incident Report: {request.incident_id}"),
            summary=d.get("summary", "Incident report generated successfully."),
            full_report_text=d.get("full_report_text", d.get("summary", "")),
            severity=request.severity,
            generated_at=d.get("generated_at", ""),
            metadata={"incident_type": request.incident_type},
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Incident report generation error: {exc}",
        )
