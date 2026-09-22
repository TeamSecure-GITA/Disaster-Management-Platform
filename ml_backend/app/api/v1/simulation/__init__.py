"""
Simulation API sub-package — router registry.

Exports a single ``simulation_router`` that includes all simulation
sub-routers so the main API v1 init only needs to import one object.

Usage in api/v1/__init__.py::

    from app.api.v1.simulation import simulation_router

    app.include_router(simulation_router, prefix="/api/v1")
"""

from fastapi import APIRouter

from .digital_twin import router as digital_twin_router
from .scenarios    import router as scenarios_router
from .what_if      import router as what_if_router

simulation_router = APIRouter(prefix="/simulation")

simulation_router.include_router(digital_twin_router)
simulation_router.include_router(scenarios_router)
simulation_router.include_router(what_if_router)

__all__ = ["simulation_router"]
