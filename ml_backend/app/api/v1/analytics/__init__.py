"""
Analytics API v1 Sub-Router Registry.
"""

from __future__ import annotations

from fastapi import APIRouter
from .dashboard import router as dashboard_router

analytics_router = APIRouter()
analytics_router.include_router(dashboard_router)

router = analytics_router

__all__ = [
    "analytics_router",
    "router",
    "dashboard_router",
]
