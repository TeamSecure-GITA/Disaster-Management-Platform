"""
Soil moisture saturation and pore pressure forecasting API router.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

router = APIRouter(prefix="/soil", tags=["Forecast - Soil Moisture"])


class SoilMoistureForecastRequest(BaseModel):
    sensor_id: str = Field(..., description="Soil sensor node identifier")
    current_moisture_pct: float = Field(..., ge=0.0, le=100.0, description="Current volumetric soil moisture (%)")
    soil_type: str = Field("clay_loam", description="Soil texture type (sand, silt, clay, loam)")
    field_capacity_pct: float = Field(35.0, description="Field capacity saturation point (%)")
    saturation_capacity_pct: float = Field(50.0, description="Total porosity / full saturation point (%)")
    expected_rainfall_next_24h_mm: float = Field(0.0, description="Forecasted 24h rainfall (mm)")
    horizon_hours: int = Field(24, ge=1, le=72, description="Forecast steps in hours")


class SoilMoistureForecastResponse(BaseModel):
    success: bool
    sensor_id: str
    current_moisture_pct: float
    forecasted_moisture_pct: List[float]
    saturation_risk: str  # "DRY", "OPTIMAL", "SATURATED", "OVERSATURATED_CRITICAL"
    liquefaction_potential: float  # 0.0 to 1.0
    timestamp: str


@router.post("/predict", response_model=SoilMoistureForecastResponse)
async def forecast_soil_moisture(request: SoilMoistureForecastRequest):
    """Forecast soil water content progression and identify slope instability saturation points."""
    try:
        cur = request.current_moisture_pct
        rain_rate = request.expected_rainfall_next_24h_mm / 24.0

        forecasted = []
        val = cur
        for hr in range(request.horizon_hours):
            # Infiltration vs drainage
            infiltration = rain_rate * 0.4
            drainage = 0.15 if val > request.field_capacity_pct else 0.02
            val = min(request.saturation_capacity_pct, max(5.0, val + infiltration - drainage))
            forecasted.append(round(val, 2))

        peak = max(forecasted)
        if peak >= request.saturation_capacity_pct * 0.95:
            risk = "OVERSATURATED_CRITICAL"
            liquefaction = 0.85
        elif peak >= request.field_capacity_pct:
            risk = "SATURATED"
            liquefaction = 0.50
        elif peak >= 15.0:
            risk = "OPTIMAL"
            liquefaction = 0.10
        else:
            risk = "DRY"
            liquefaction = 0.02

        return SoilMoistureForecastResponse(
            success=True,
            sensor_id=request.sensor_id,
            current_moisture_pct=request.current_moisture_pct,
            forecasted_moisture_pct=forecasted,
            saturation_risk=risk,
            liquefaction_potential=liquefaction,
            timestamp=datetime.now(timezone.utc).isoformat(),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Soil moisture forecast error: {exc}",
        )
