"""
Generic sensor time-series forecasting API router.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.analytics.trends.time_series import compute_moving_average, compute_exponential_smoothing, detect_trend_slope

router = APIRouter(prefix="/time-series", tags=["Forecast - Time Series"])


class TimeSeriesForecastRequest(BaseModel):
    series_id: str = Field(..., description="Sensor or metric series identifier")
    values: List[float] = Field(..., min_length=3, description="Chronological observation values")
    horizon: int = Field(5, ge=1, le=50, description="Steps ahead to forecast")
    method: str = Field("exponential_smoothing", description="Forecasting method: exponential_smoothing, linear_trend, moving_average")


class TimeSeriesForecastResponse(BaseModel):
    success: bool
    series_id: str
    method: str
    forecast: List[float]
    lower_bound: List[float]
    upper_bound: List[float]
    trend_direction: str
    r2_score: float
    timestamp: str


@router.post("/predict", response_model=TimeSeriesForecastResponse)
async def forecast_time_series(request: TimeSeriesForecastRequest):
    """Generate multi-step future projections for any continuous time-series sensor stream."""
    try:
        vals = request.values
        n = len(vals)
        trend_info = detect_trend_slope(vals)
        slope = trend_info["slope"]
        intercept = trend_info["intercept"]

        last_val = vals[-1]
        forecast = []
        lower = []
        upper = []

        if request.method == "linear_trend":
            for step in range(1, request.horizon + 1):
                pred = intercept + slope * (n - 1 + step)
                forecast.append(round(pred, 3))
                margin = abs(pred * 0.15) + (step * 0.5)
                lower.append(round(pred - margin, 3))
                upper.append(round(pred + margin, 3))
        else:
            smoothed = compute_exponential_smoothing(vals, alpha=0.3)
            base = smoothed[-1]
            for step in range(1, request.horizon + 1):
                pred = base + (slope * step * 0.5)
                forecast.append(round(pred, 3))
                margin = max(1.0, abs(pred * 0.12)) + (step * 0.3)
                lower.append(round(pred - margin, 3))
                upper.append(round(pred + margin, 3))

        return TimeSeriesForecastResponse(
            success=True,
            series_id=request.series_id,
            method=request.method,
            forecast=forecast,
            lower_bound=lower,
            upper_bound=upper,
            trend_direction=trend_info["direction"],
            r2_score=trend_info["r2"],
            timestamp=datetime.now(timezone.utc).isoformat(),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Time-series forecast error: {exc}",
        )
