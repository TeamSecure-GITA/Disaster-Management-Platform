"""
Resource allocation and emergency logistics decision service.
Optimizes distribution of food, water, medical supplies, and equipment.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from app.decision_engine.resource_engine import (
    ResourceEngine,
    ResourceItem,
    ResourceRequest,
    ResourceCategory,
    ResourceStatus,
)


class ResourceDecisionService:
    """Service layer managing emergency resource balancing and transfers."""

    def __init__(self):
        self.engine = ResourceEngine()

    def allocate_resources(
        self,
        depots_data: List[Dict[str, Any]],
        demands_data: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Calculates optimal resource allocation and transfer assignments."""
        engine = ResourceEngine()

        # Populate engine inventory from depots
        items = []
        for d in depots_data:
            depot_id = str(d.get("depot_id", "depot_1"))
            inv = d.get("inventory", {})
            for item_name, qty in inv.items():
                category = (
                    ResourceCategory.MEDICAL if "med" in item_name.lower()
                    else ResourceCategory.FOOD_WATER if any(k in item_name.lower() for k in ["water", "food", "meal"])
                    else ResourceCategory.TRANSPORT if "transport" in item_name.lower()
                    else ResourceCategory.SEARCH_RESCUE if "rescue" in item_name.lower()
                    else ResourceCategory.SHELTER_MATERIAL
                )
                items.append(
                    ResourceItem(
                        item_id=f"{depot_id}_{item_name}",
                        name=item_name,
                        category=category,
                        quantity_available=float(qty),
                        unit="units",
                        depot_id=depot_id,
                        status=ResourceStatus.AVAILABLE,
                    )
                )
        engine.register_items(items)

        # Build requests
        reqs = []
        for req in demands_data:
            req_id = str(req.get("demand_id", f"req_{len(reqs)+1}"))
            zone_id = str(req.get("destination_id", "site_1"))
            cat_str = str(req.get("category", "medical"))
            item_name = str(req.get("item_name") or (
                "potable_water_liters" if "water" in cat_str.lower()
                else "first_aid_kits" if "med" in cat_str.lower()
                else cat_str
            ))
            qty_needed = float(req.get("quantity_needed", req.get("quantity", 50)))
            reqs.append(
                ResourceRequest(
                    request_id=req_id,
                    zone_id=zone_id,
                    region=str(req.get("region", "Region-1")),
                    priority=int(req.get("priority", 1)),
                    population_affected=int(req.get("population_affected", 100)),
                    items_requested={item_name: qty_needed},
                )
            )

        decisions = [engine.allocate(r) for r in reqs]

        transfers = []
        unmet = []
        total_fill = 0.0

        for d in decisions:
            d_dict = d.to_dict()
            for iname, alloc in d.allocated_items.items():
                if alloc.get("allocated", 0.0) > 0:
                    transfers.append({
                        "request_id": d.request_id,
                        "zone_id": d.zone_id,
                        "item_name": iname,
                        "quantity": alloc.get("allocated", 0.0),
                        "depot_id": alloc.get("depot_id", "depot_1"),
                    })
            if d.total_shortfall_items:
                unmet.append(d_dict)
            total_fill += d.fulfillment_rate_pct

        avg_fill = (total_fill / len(decisions)) if decisions else 100.0

        return {
            "transfers": transfers,
            "unmet_demands": unmet,
            "fill_rate_pct": round(avg_fill, 2),
            "decisions": [d.to_dict() for d in decisions],
        }


resource_decision_service = ResourceDecisionService()
