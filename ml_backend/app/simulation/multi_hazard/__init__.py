"""
multi_hazard sub-package public interface.

Re-exports all types and the engine from the split implementation files::

    from app.simulation.multi_hazard import (
        MultiHazardSimEngine,
        CascadeSimConfig,
        HazardEvent,
        PrimaryHazard,
    )
"""

from .hazard_chain  import MultiHazardSimEngine
from .interaction   import CascadeRule, DEFAULT_INTERACTION_MATRIX, InteractionMatrix
from .scenario      import (
    CascadeSimConfig,
    CascadeSimResult,
    CascadeStatus,
    CascadeTimeStep,
    HazardEvent,
    PrimaryHazard,
)

__all__ = [
    # Engine
    "MultiHazardSimEngine",
    # Scenario types
    "PrimaryHazard",
    "CascadeStatus",
    "HazardEvent",
    "CascadeSimConfig",
    "CascadeSimResult",
    "CascadeTimeStep",
    # Interaction
    "CascadeRule",
    "InteractionMatrix",
    "DEFAULT_INTERACTION_MATRIX",
]
