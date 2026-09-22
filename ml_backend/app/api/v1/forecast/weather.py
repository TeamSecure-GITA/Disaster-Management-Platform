"""
Atmospheric weather and wind vector forecasting API router.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

router = APIRouter(prefix="/weather", tags=["Forecast - Weather"])


class WeatherForecastRequest(BaseModel):
    latitude: float = Field(..., description="Target latitude")
    longitude: float = Field(..., description="Target longitude")
    current_temperature_c: float = Field(28.0, description="Current ambient temperature (°C)")
    current_humidity_pct: float = Field(75.0, description="Current relative humidity (%)")
    current_wind_speed_kmh: float = Field(25.0, description="Current wind speed (km/h)")
    current_pressure_hpa: float = Field(1010.0, description="Current sea-level pressure (hPa)")
    horizon_hours: int = Field(24, ge=1, le=72, description="Forecast horizon in hours")


class HourlyWeather(BaseModel):
    hour_step: int
    temperature_c: float
    humidity_pct: float
    wind_speed_kmh: float
    wind_direction_deg: float
    pressure_hpa: float
    condition: str


class WeatherForecastResponse(BaseModel):
    success: bool
    location: Dict[str, float]
    hourly_forecast: List[HourlyWeather]
    severe_weather_alert: bool
    summary: str
    timestamp: str


@router.post("/predict", response_model=WeatherForecastResponse)
async def forecast_weather(request: WeatherForecastRequest):
    """Forecast local meteorological parameters, wind vectors, and severe storm triggers."""
    try:
        hourly = []
        is_severe = False
        t = request.current_temperature_c
        p = request.current_pressure_hpa
        w = request.current_wind_speed_kmh

        for h in range(1, request.horizon_hours + 1):
            # Diurnal temperature cycle
            import math
            temp_var = 3.0 * math.sin((h / 24.0) * 2.0 * math.pi)
            cur_t = round(t + temp_var, 1)
            cur_p = round(p - (0.1 * h), 1)  # Gradual pressure change
            cur_w = round(max(5.0, w + (2.0 * math.cos(h / 6.0))), 1)

            if cur_w > 65.0 or cur_p < 995.0:
                is_severe = True
                cond = "Stormy / High Winds"
            elif cur_t > 38.0:
                cond = "Heatwave"
            elif request.current_humidity_pct > 80.0:
                cond = "Cloudy / Showers"
            else:
                cond = "Clear"

            hourly.append(
                HourlyWeather(
                    hour_step=h,
                    temperature_c=cur_t,
                    humidity_pct=round(min(100.0, max(20.0, request.current_humidity_pct - temp_var * 2.0)), 1),
                    wind_speed_kmh=cur_w,
                    wind_direction_deg=round((180.0 + h * 5.0) % 360.0, 1),
                    pressure_hpa=cur_p,
                    condition=cond,
                )
            )

        summary = "Severe storm conditions expected." if is_severe else "Moderate weather conditions forecast."

        return WeatherForecastResponse(
            success=True,
            location={"latitude": request.latitude, "longitude": request.longitude},
            hourly_forecast=hourly,
            severe_weather_alert=is_severe,
            summary=summary,
            timestamp=datetime.now(timezone.utc).isoformat(),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Weather forecast error: {exc}",
        )
