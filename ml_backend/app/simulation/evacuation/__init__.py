"""
evacuation sub-package public interface.

Re-exports all types and the engine from the split implementation files::

    from app.simulation.evacuation import (
        EvacuationSimEngine,
        EvacSimConfig,
        SimZone,
        SimCorridor,
    )
"""

from .flow       import CONGESTION_THRESHOLD, FlowCalculator
from .routes     import CorridorStatus, SimCorridor, SimZone, ZoneStatus
from .simulation import EvacSimConfig, EvacSimResult, EvacuationSimEngine, SimTimeStep, ZoneSummary

__all__ = [
    # Engine
    "EvacuationSimEngine",
    # Config & result
    "EvacSimConfig",
    "EvacSimResult",
    "SimTimeStep",
    "ZoneSummary",
    # Route models
    "SimZone",
    "SimCorridor",
    "CorridorStatus",
    "ZoneStatus",
    # Flow
    "FlowCalculator",
    "CONGESTION_THRESHOLD",
]
