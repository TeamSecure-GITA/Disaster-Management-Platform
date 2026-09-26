"""Time series forecasting API endpoints."""
from __future__ import annotations
import numpy as np
from fastapi import APIRouter
from .schemas import ForecastingRequest, ForecastingResponse

router = APIRouter(prefix="/forecasting", tags=["Time Series Forecasting"])

@router.post("/forecast", response_model=ForecastingResponse)
def generate_forecast(request: ForecastingRequest) -> ForecastingResponse:
    baseline = float(np.mean(request.historical_values)) if request.historical_values else 10.0
    forecast_values = [round(baseline + float(np.random.normal(0, 1.0)), 2) for _ in range(request.horizon)]
    return ForecastingResponse(
        series_type=request.series_type,
        forecast=forecast_values,
        unit="mm/h" if request.series_type == "rainfall" else "standard"
    )
