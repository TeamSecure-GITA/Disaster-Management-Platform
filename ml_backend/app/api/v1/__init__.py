"""
API v1 router registry.
Aggregates all domain, prediction, forecasting, analytics, AI, and operations sub-routers.
"""

from __future__ import annotations

from fastapi import APIRouter

from app.api.v1.simulation import simulation_router
from app.api.v1.prediction import router as prediction_router
from app.api.v1.forecast import router as forecast_router
from app.api.v1.ai import router as ai_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.incidents import router as incidents_router
from app.api.v1.response import router as response_router
from app.api.v1.resources import router as resources_router
from app.api.v1.shelters import router as shelters_router
from app.api.v1.sensors import router as sensors_router
from app.api.v1.models import router as models_router

api_v1_router = APIRouter()

# ── Simulation ──────────────────────────────────────────────
api_v1_router.include_router(simulation_router)

# ── Hazard Prediction & Risk ────────────────────────────────
api_v1_router.include_router(prediction_router)

# ── Environmental & Sensor Forecasting ──────────────────────
api_v1_router.include_router(forecast_router)

# ── AI & Copilot ────────────────────────────────────────────
api_v1_router.include_router(ai_router)

# ── Analytics & Dashboard ───────────────────────────────────
api_v1_router.include_router(analytics_router)

# ── Operational Domain Routers ──────────────────────────────
api_v1_router.include_router(incidents_router)
api_v1_router.include_router(response_router)
api_v1_router.include_router(resources_router)
api_v1_router.include_router(shelters_router)
api_v1_router.include_router(sensors_router)
api_v1_router.include_router(models_router)

router = api_v1_router

__all__ = [
    "api_v1_router",
    "router",
    "simulation_router",
    "prediction_router",
    "forecast_router",
    "ai_router",
    "analytics_router",
    "incidents_router",
    "response_router",
    "resources_router",
    "shelters_router",
    "sensors_router",
    "models_router",
]
