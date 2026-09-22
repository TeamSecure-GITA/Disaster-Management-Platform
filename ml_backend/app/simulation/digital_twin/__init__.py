"""
digital_twin sub-package public interface.

Re-exports all types and the engine from the split implementation files
so callers can simply do::

    from app.simulation.digital_twin import (
        DigitalTwinEngine,
        ScenarioInput,
        ScenarioType,
    )
"""

from .engine   import DigitalTwinEngine
from .entities import (
    BatchScenarioResult,
    InundationVector,
    ScenarioInput,
    ScenarioResult,
    ScenarioType,
    SimulationStatus,
    StructuralImpact,
)
from .state    import ScenarioRecord, ScenarioRegistry

__all__ = [
    # Engine
    "DigitalTwinEngine",
    # Entities
    "ScenarioType",
    "SimulationStatus",
    "ScenarioInput",
    "InundationVector",
    "StructuralImpact",
    "ScenarioResult",
    "BatchScenarioResult",
    # State
    "ScenarioRecord",
    "ScenarioRegistry",
]
