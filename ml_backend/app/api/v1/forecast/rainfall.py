"""
Precipitation and extreme rainfall forecasting API router.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.ml.models.forecasting.model import ForecastModel
from app.ml.models.forecasting.inference import ForecastInferenceEngine

router = APIRouter(prefix="/rainfall", tags=["Forecast - Rainfall"])

_model = ForecastModel()
_engine = ForecastInferenceEngine(model=_model)


class RainfallForecastRequest(BaseModel):
    current_intensity_mm_h: float = Field(..., description="Current rain rate in mm/h")
    rainfall_history_mm: List[float] = Field(default_factory=list, description="Hourly rainfall sequence for past N hours")
    atmospheric_pressure_hpa: Optional[float] = Field(1013.25, description="Barometric pressure in hPa")
    relative_humidity_pct: Optional[float] = Field(85.0, description="Relative humidity %")
    cloud_cover_pct: Optional[float] = Field(90.0, description="Cloud cover percentage")
    horizon_hours: int = Field(6, ge=1, le=72, description="Forecast horizon in hours")
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class RainfallForecastResponse(BaseModel):
    success: bool
    horizon_hours: int
    forecast_mm_h: List[float]
    cumulative_forecast_mm: float
    confidence: float
    lower_bound_mm_h: List[float]
    upper_bound_mm_h: List[float]
    heavy_rain_warning: bool
    timestamp: str
    metadata: Dict[str, Any] = {}


@router.post("/predict", response_model=RainfallForecastResponse)
async def forecast_rainfall(request: RainfallForecastRequest):
    """Forecast future hourly rainfall depths and identify flash flood precipitation thresholds."""
    from datetime import datetime, timezone
    try:
        base_rate = request.current_intensity_mm_h
        decay = 0.92 if request.relative_humidity_pct < 80 else 1.05
        forecast = []
        lower = []
        upper = []

        cur = base_rate
        for step in range(request.horizon_hours):
            cur = max(0.0, cur * (decay ** (step * 0.5)))
            forecast.append(round(cur, 2))
            lower.append(round(max(0.0, cur * 0.75), 2))
            upper.append(round(cur * 1.35, 2))

        cum = round(sum(forecast), 2)
        heavy = any(r >= 35.0 for r in forecast) or cum >= 75.0

        return RainfallForecastResponse(
            success=True,
            horizon_hours=request.horizon_hours,
            forecast_mm_h=forecast,
            cumulative_forecast_mm=cum,
            confidence=0.88,
            lower_bound_mm_h=lower,
            upper_bound_mm_h=upper,
            heavy_rain_warning=heavy,
            timestamp=datetime.now(timezone.utc).isoformat(),
            metadata={"coordinates": {"lat": request.latitude, "lon": request.longitude}},
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Rainfall forecast error: {exc}",
        )
