"""
Emergency resource inventory, allocation, and depletion tracking engine.

Manages relief supplies, medical resources, search-and-rescue equipment,
and personnel inventories across all operational depots in the field.

Applies priority-weighted allocation to prevent shortfalls in critical regions
and tracks real-time inventory depletion and resupply requirements.
"""

from __future__ import annotations

import math
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional, Sequence


class ResourceCategory(str, Enum):
    FOOD_WATER = "food_water"
    MEDICAL = "medical"
    SEARCH_RESCUE = "search_rescue"
    SHELTER_MATERIAL = "shelter_material"
    COMMUNICATION = "communication"
    TRANSPORT = "transport"
    HEAVY_EQUIPMENT = "heavy_equipment"
    PERSONNEL = "personnel"


class ResourceStatus(str, Enum):
    AVAILABLE = "available"
    RESERVED = "reserved"
    DEPLOYED = "deployed"
    DEPLETED = "depleted"
    DAMAGED = "damaged"


@dataclass
class ResourceItem:
    """An individual supply or equipment item in the disaster resource inventory."""

    item_id: str
    name: str
    category: ResourceCategory
    quantity_available: float
    unit: str                         # "units", "kg", "liters", "persons", etc.
    depot_id: str
    depot_latitude: Optional[float] = None
    depot_longitude: Optional[float] = None
    unit_weight_kg: float = 0.0       # For logistics transport planning
    status: ResourceStatus = ResourceStatus.AVAILABLE
    perishable: bool = False
    shelf_life_days: Optional[int] = None

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        d["category"] = self.category.value
        d["status"] = self.status.value
        return d


@dataclass
class ResourceRequest:
    """An emergency resource requisition from an incident field team."""

    request_id: str
    zone_id: str
    region: str
    priority: int           # 1 = highest urgency
    population_affected: int
    items_requested: Dict[str, float]  # item_name -> quantity needed
    hazard_type: str = "unknown"
    requested_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )


@dataclass
class AllocationDecision:
    """Resolved allocation decision for a resource request."""

    request_id: str
    zone_id: str
    allocated_items: Dict[str, Dict[str, Any]]   # item_name -> {qty, depot, shortfall}
    total_shortfall_items: List[str]
    fulfillment_rate_pct: float
    estimated_delivery_hours: float
    notes: List[str]
    decided_at: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "request_id": self.request_id,
            "zone_id": self.zone_id,
            "allocated_items": self.allocated_items,
            "total_shortfall_items": self.total_shortfall_items,
            "fulfillment_rate_pct": round(self.fulfillment_rate_pct, 2),
            "estimated_delivery_hours": round(self.estimated_delivery_hours, 2),
            "notes": self.notes,
            "decided_at": self.decided_at,
        }


@dataclass
class InventorySnapshot:
    """Current real-time inventory summary across all depots."""

    snapshot_at: str
    total_items: int
    by_category: Dict[str, Dict[str, float]]   # category -> {available, reserved, deployed}
    low_stock_alerts: List[str]
    depot_summaries: Dict[str, int]            # depot_id -> item count

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class ResourceEngine:
    """
    Manages disaster resource inventories, allocates supplies to field requests,
    and monitors depletion and resupply across operational depots.

    Example::

        engine = ResourceEngine()
        engine.register_item(ResourceItem(
            item_id="food-001",
            name="Emergency Food Pack",
            category=ResourceCategory.FOOD_WATER,
            quantity_available=5000.0,
            unit="packs",
            depot_id="depot-north",
        ))
        decision = engine.allocate(request)
    """

    # Per-capita resource planning constants (conservative emergency standards)
    _PER_CAPITA_WATER_LITERS_PER_DAY = 3.0
    _PER_CAPITA_FOOD_PACKS_PER_DAY = 3.0
    _LOW_STOCK_THRESHOLD_PCT = 15.0

    def __init__(self):
        self._inventory: Dict[str, ResourceItem] = {}  # item_id -> ResourceItem

    # ------------------------------------------------------------------
    # Inventory management
    # ------------------------------------------------------------------

    def register_item(self, item: ResourceItem) -> None:
        """Register a resource item into the inventory."""
        self._inventory[item.item_id] = item

    def register_items(self, items: Sequence[ResourceItem]) -> None:
        for item in items:
            self.register_item(item)

    def get_item(self, item_id: str) -> Optional[ResourceItem]:
        return self._inventory.get(item_id)

    def update_quantity(self, item_id: str, delta: float) -> bool:
        """Adjust item quantity by delta (positive = restock, negative = consume)."""
        item = self._inventory.get(item_id)
        if item is None:
            return False
        item.quantity_available = max(0.0, item.quantity_available + delta)
        item.status = (
            ResourceStatus.DEPLETED
            if item.quantity_available == 0.0
            else ResourceStatus.AVAILABLE
        )
        return True

    # ------------------------------------------------------------------
    # Allocation
    # ------------------------------------------------------------------

    def _find_items_by_name(self, name: str) -> List[ResourceItem]:
        """Find all inventory items matching a given name across depots."""
        return [
            item for item in self._inventory.values()
            if item.name.lower() == name.lower()
               and item.status in (ResourceStatus.AVAILABLE, ResourceStatus.RESERVED)
               and item.quantity_available > 0
        ]

    def allocate(
        self,
        request: ResourceRequest,
        transport_speed_kmh: float = 60.0,
        depot_to_zone_km: float = 50.0,
    ) -> AllocationDecision:
        """
        Fulfill a resource request from available inventory.
        Partial fulfillment is recorded when stock is insufficient.
        """
        allocated: Dict[str, Dict[str, Any]] = {}
        shortfalls: List[str] = []
        notes: List[str] = []
        total_requested = sum(request.items_requested.values())
        total_fulfilled = 0.0

        for item_name, qty_needed in request.items_requested.items():
            candidates = self._find_items_by_name(item_name)
            remaining_needed = qty_needed
            allocated_from_depots = []

            for candidate in sorted(candidates, key=lambda x: -x.quantity_available):
                if remaining_needed <= 0:
                    break
                draw = min(candidate.quantity_available, remaining_needed)
                candidate.quantity_available -= draw
                remaining_needed -= draw
                allocated_from_depots.append({
                    "depot_id": candidate.depot_id,
                    "quantity": round(draw, 2),
                    "unit": candidate.unit,
                })
                if candidate.quantity_available == 0:
                    candidate.status = ResourceStatus.DEPLETED

            fulfilled_qty = qty_needed - remaining_needed
            total_fulfilled += fulfilled_qty

            if remaining_needed > 0:
                shortfalls.append(item_name)
                notes.append(
                    f"Shortfall of {remaining_needed:.1f} {item_name} — "
                    "request mutual-aid resupply."
                )

            allocated[item_name] = {
                "requested_quantity": qty_needed,
                "fulfilled_quantity": round(fulfilled_qty, 2),
                "shortfall": round(max(0.0, remaining_needed), 2),
                "sources": allocated_from_depots,
            }

        fulfillment_pct = (
            (total_fulfilled / total_requested) * 100.0
            if total_requested > 0
            else 100.0
        )

        delivery_hrs = (depot_to_zone_km / max(transport_speed_kmh, 10.0))

        return AllocationDecision(
            request_id=request.request_id,
            zone_id=request.zone_id,
            allocated_items=allocated,
            total_shortfall_items=shortfalls,
            fulfillment_rate_pct=fulfillment_pct,
            estimated_delivery_hours=delivery_hrs,
            notes=notes,
            decided_at=datetime.now(timezone.utc).isoformat(),
        )

    def estimate_per_capita_needs(
        self,
        population: int,
        days: float = 3.0,
    ) -> Dict[str, float]:
        """
        Estimate minimum food and water requirements per SPHERE Handbook standards.
        """
        return {
            "Drinking Water (liters)": round(
                population * self._PER_CAPITA_WATER_LITERS_PER_DAY * days, 1
            ),
            "Emergency Food Pack": round(
                population * self._PER_CAPITA_FOOD_PACKS_PER_DAY * days, 0
            ),
            "Oral Rehydration Salts (sachets)": math.ceil(population * 0.3 * days),
            "Blanket/Sleeping Mat": math.ceil(population * 0.8),
            "Sanitation Kit": math.ceil(population / 20.0),  # 1 per 20 people
        }

    # ------------------------------------------------------------------
    # Snapshot and monitoring
    # ------------------------------------------------------------------

    def get_inventory_snapshot(self) -> InventorySnapshot:
        """Return a consolidated real-time inventory summary."""
        by_cat: Dict[str, Dict[str, float]] = {}
        depot_counts: Dict[str, int] = {}
        low_stock: List[str] = []

        for item in self._inventory.values():
            cat = item.category.value
            if cat not in by_cat:
                by_cat[cat] = {"available": 0.0, "reserved": 0.0, "deployed": 0.0}
            if item.status == ResourceStatus.AVAILABLE:
                by_cat[cat]["available"] += item.quantity_available
            elif item.status == ResourceStatus.RESERVED:
                by_cat[cat]["reserved"] += item.quantity_available
            elif item.status == ResourceStatus.DEPLOYED:
                by_cat[cat]["deployed"] += item.quantity_available

            depot_counts[item.depot_id] = depot_counts.get(item.depot_id, 0) + 1

            # Low stock alert
            if item.status == ResourceStatus.AVAILABLE and item.quantity_available > 0:
                # Placeholder: flag if very low (< 10 units/kg/liters)
                if item.quantity_available < 10.0:
                    low_stock.append(
                        f"{item.name} at depot {item.depot_id} — only "
                        f"{item.quantity_available:.1f} {item.unit} remaining"
                    )

        return InventorySnapshot(
            snapshot_at=datetime.now(timezone.utc).isoformat(),
            total_items=len(self._inventory),
            by_category=by_cat,
            low_stock_alerts=low_stock,
            depot_summaries=depot_counts,
        )
