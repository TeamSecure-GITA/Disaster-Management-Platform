"""
simulation package public interface.

Exposes the SimulationService facade and most-used types at the top level
so callers can use short imports::

    from app.simulation import SimulationService, get_simulation_service

Individual sub-package symbols remain importable from their own namespaces
for more explicit imports.
"""

from .service import SimulationService, get_simulation_service

__all__ = [
    "SimulationService",
    "get_simulation_service",
]
