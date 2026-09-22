"""
Evacuation route and corridor data models.

Defines all value objects representing geographic zones, road/waterway
corridors, and their operational state.  No simulation logic lives here;
the simulation and flow modules import these types.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from enum import Enum
from typing import Any, Dict, List


# ============================================================
# Enumerations
# ============================================================

class CorridorStatus(str, Enum):
    """Operational state of an evacuation corridor."""

    OPEN      = "open"
    CONGESTED = "congested"
    BLOCKED   = "blocked"


class ZoneStatus(str, Enum):
    """Evacuation progress state of an origin zone."""

    PENDING    = "pending"
    EVACUATING = "evacuating"
    CLEARED    = "cleared"
    STRANDED   = "stranded"


# ============================================================
# Zone model
# ============================================================

@dataclass
class SimZone:
    """
    A geographic area from which residents are evacuating.

    Attributes:
        zone_id: Unique identifier.
        name: Human-readable label (e.g. "Coastal Strip A").
        population: Total persons requiring evacuation.
        priority: Urgency rank; 1 = most urgent (flood-plain, coastal).
        special_needs_count: Persons requiring assisted evacuation.
        corridor_ids: Ordered list of corridor IDs this zone may use.
    """

    zone_id: str
    name: str
    population: int
    priority: int
    special_needs_count: int = 0
    corridor_ids: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


# ============================================================
# Corridor model
# ============================================================

@dataclass
class SimCorridor:
    """
    A road or waterway corridor linking origin zones to a safe destination.

    Attributes:
        corridor_id: Unique identifier.
        name: Human-readable label (e.g. "NH-16 North Exit").
        capacity_per_hour: Persons/vehicles per hour under free-flow.
        distance_km: Physical length of the corridor.
        passable: Whether the corridor is currently traversable.
        congestion_factor: Congestion multiplier; 1.0 = free-flow,
            > 1.0 = slowed.  Anti-herd logic adjusts this dynamically.
        status: Operational state derived from congestion_factor.
    """

    corridor_id: str
    name: str
    capacity_per_hour: int
    distance_km: float
    passable: bool = True
    congestion_factor: float = 1.0
    status: CorridorStatus = CorridorStatus.OPEN

    # ----------------------------------------------------------
    # Derived property
    # ----------------------------------------------------------

    @property
    def effective_throughput_per_hour(self) -> int:
        """
        Actual throughput accounting for congestion degradation.

        Returns 0 when the corridor is blocked or impassable.
        """

        if not self.passable:
            return 0

        return int(
            self.capacity_per_hour
            / max(self.congestion_factor, 1.0)
        )

    # ----------------------------------------------------------
    # Serialisation
    # ----------------------------------------------------------

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        d["status"] = self.status.value
        d["effective_throughput_per_hour"] = (
            self.effective_throughput_per_hour
        )
        return d


# ============================================================
# Public exports
# ============================================================

__all__ = [
    "CorridorStatus",
    "ZoneStatus",
    "SimZone",
    "SimCorridor",
]
