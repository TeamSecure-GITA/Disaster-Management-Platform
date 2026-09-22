"""
Integrated Disaster Risk Index API router.
Computes composite multi-dimensional disaster risk based on UNDRR framework:
Risk = Hazard Probability × Exposure × Vulnerability / Capacity.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.decision_engine.risk_engine import RiskEngine

router = APIRouter(prefix="/risk", tags=["Prediction - Integrated Risk"])

_risk_engine = RiskEngine()


class RiskAssessmentRequest(BaseModel):
    hazard_type: str = Field("multi_hazard", description="Hazard type being assessed")
    hazard_intensity: float = Field(..., ge=0.0, le=1.0, description="Normalized hazard probability / intensity (0-1)")
    population_density_per_km2: float = Field(..., ge=0.0, description="Local population density")
    elderly_children_pct: float = Field(0.15, ge=0.0, le=1.0, description="Percentage of vulnerable demographics")
    building_vulnerability_score: float = Field(0.5, ge=0.0, le=1.0, description="Building vulnerability index (0=resilient, 1=fragile)")
    critical_infrastructure_count: int = Field(0, ge=0, description="Hospitals, power plants, bridges in affected zone")
    institutional_coping_capacity: float = Field(0.7, ge=0.1, le=1.0, description="Local disaster response preparedness (0.1-1.0)")
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class RiskAssessmentResponse(BaseModel):
    success: bool
    risk_score: float
    risk_level: str  # "LOW", "MODERATE", "HIGH", "SEVERE", "CATASTROPHIC"
    hazard_component: float
    exposure_component: float
    vulnerability_component: float
    capacity_component: float
    recommended_alert_level: str  # "GREEN", "YELLOW", "ORANGE", "RED"
    primary_risk_drivers: List[str]
    metadata: Dict[str, Any] = {}


@router.post("/assess", response_model=RiskAssessmentResponse)
async def assess_risk(request: RiskAssessmentRequest):
    """Compute integrated multi-criteria disaster risk score and recommended emergency alert status."""
    try:
        # Normalize exposure (logarithmic scale up to 10,000 people/km2 + infra)
        exp_pop = min(1.0, request.population_density_per_km2 / 5000.0)
        exp_infra = min(1.0, request.critical_infrastructure_count / 10.0)
        exposure = 0.7 * exp_pop + 0.3 * exp_infra

        # Vulnerability combination
        vulnerability = 0.5 * request.building_vulnerability_score + 0.5 * request.elderly_children_pct

        # UNDRR Formula: (Hazard * Exposure * Vulnerability) / Coping Capacity
        raw_risk = (request.hazard_intensity * (0.4 + 0.6 * exposure) * (0.4 + 0.6 * vulnerability)) / max(0.2, request.institutional_coping_capacity)
        risk_score = round(min(1.0, max(0.0, raw_risk)), 4)

        if risk_score >= 0.80:
            level = "CATASTROPHIC"
            alert = "RED"
        elif risk_score >= 0.60:
            level = "SEVERE"
            alert = "ORANGE"
        elif risk_score >= 0.40:
            level = "HIGH"
            alert = "YELLOW"
        elif risk_score >= 0.20:
            level = "MODERATE"
            alert = "YELLOW"
        else:
            level = "LOW"
            alert = "GREEN"

        drivers = []
        if request.hazard_intensity > 0.7:
            drivers.append("Extreme hazard intensity")
        if exposure > 0.6:
            drivers.append("Dense population / infrastructure exposure")
        if vulnerability > 0.6:
            drivers.append("High demographic / structural fragility")
        if request.institutional_coping_capacity < 0.4:
            drivers.append("Deficient local emergency response capacity")
        if not drivers:
            drivers.append("Baseline background hazard exposure")

        return RiskAssessmentResponse(
            success=True,
            risk_score=risk_score,
            risk_level=level,
            hazard_component=round(request.hazard_intensity, 3),
            exposure_component=round(exposure, 3),
            vulnerability_component=round(vulnerability, 3),
            capacity_component=round(request.institutional_coping_capacity, 3),
            recommended_alert_level=alert,
            primary_risk_drivers=drivers,
            metadata={
                "hazard_type": request.hazard_type,
                "coordinates": {"lat": request.latitude, "lon": request.longitude},
            },
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Risk assessment failed: {exc}",
        )
