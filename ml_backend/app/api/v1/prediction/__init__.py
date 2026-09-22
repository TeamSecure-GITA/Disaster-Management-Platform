"""
Prediction API v1 Sub-Router Registry.
Aggregates all domain-specific hazard prediction routers.
"""

from __future__ import annotations

from fastapi import APIRouter

from .landslide import router as landslide_router
from .flood import router as flood_router
from .cyclone import router as cyclone_router
from .earthquake import router as earthquake_router
from .wildfire import router as wildfire_router
from .multi_hazard import router as multi_hazard_router
from .risk import router as risk_router

prediction_router = APIRouter(prefix="/prediction")

prediction_router.include_router(landslide_router)
prediction_router.include_router(flood_router)
prediction_router.include_router(cyclone_router)
prediction_router.include_router(earthquake_router)
prediction_router.include_router(wildfire_router)
prediction_router.include_router(multi_hazard_router)
prediction_router.include_router(risk_router)

router = prediction_router

__all__ = [
    "prediction_router",
    "router",
    "landslide_router",
    "flood_router",
    "cyclone_router",
    "earthquake_router",
    "wildfire_router",
    "multi_hazard_router",
    "risk_router",
]
