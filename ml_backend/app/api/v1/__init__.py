"""
API v1 router registry.

Aggregates all sub-routers and exposes a single ``api_v1_router``
that the main FastAPI application includes.

Usage in main.py / app factory::

    from app.api.v1 import api_v1_router
    app.include_router(api_v1_router)
"""

from fastapi import APIRouter

from app.api.v1.simulation import simulation_router

api_v1_router = APIRouter(prefix="/api/v1")

# ── Simulation ──────────────────────────────────────────────
api_v1_router.include_router(simulation_router)

# Add other domain routers here as they are implemented, e.g.:
# from app.api.v1.decision  import decision_router
# api_v1_router.include_router(decision_router)

__all__ = ["api_v1_router"]
