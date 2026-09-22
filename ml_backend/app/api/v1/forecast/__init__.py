"""
Forecast API v1 Sub-Router Registry.
Aggregates all environmental, hydrological, weather, and time-series forecasting routers.
"""

from __future__ import annotations

from fastapi import APIRouter

from .rainfall import router as rainfall_router
from .river import router as river_router
from .soil import router as soil_router
from .weather import router as weather_router
from .time_series import router as time_series_router

forecast_router = APIRouter(prefix="/forecast")

forecast_router.include_router(rainfall_router)
forecast_router.include_router(river_router)
forecast_router.include_router(soil_router)
forecast_router.include_router(weather_router)
forecast_router.include_router(time_series_router)

router = forecast_router

__all__ = [
    "forecast_router",
    "router",
    "rainfall_router",
    "river_router",
    "soil_router",
    "weather_router",
    "time_series_router",
]
