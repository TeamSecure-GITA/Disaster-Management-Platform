"""
Resource repository providing inventory tracking, stockpile allocation, and supply chain logistics queries.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional, Sequence

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from ml_backend.database.models.resource import Resource, ResourceStatus, ResourceType
from ml_backend.database.repositories.base import BaseRepository


class ResourceRepository(BaseRepository[Resource]):
    """Repository managing disaster relief stockpiles, logistics assets, and supplies."""

    def __init__(self, session: Session) -> None:
        super().__init__(Resource, session)

    def get_by_type(
        self,
        resource_type: ResourceType,
        skip: int = 0,
        limit: int = 100,
    ) -> Sequence[Resource]:
        """Fetch items matching specified category."""
        stmt = (
            select(Resource)
            .where(Resource.type == resource_type, Resource.is_deleted.is_(False))
            .offset(skip)
            .limit(limit)
        )
        return self.session.scalars(stmt).all()

    def get_available_resources(
        self,
        resource_type: Optional[ResourceType] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> Sequence[Resource]:
        """Fetch available resources with quantity > 0."""
        stmt = select(Resource).where(
            Resource.status == ResourceStatus.AVAILABLE,
            Resource.quantity > 0,
            Resource.is_deleted.is_(False),
        )
        if resource_type is not None:
            stmt = stmt.where(Resource.type == resource_type)

        stmt = stmt.order_by(Resource.quantity.desc()).offset(skip).limit(limit)
        return self.session.scalars(stmt).all()

    def get_low_stock_resources(self) -> Sequence[Resource]:
        """Fetch resources where quantity is less than or equal to min_threshold."""
        stmt = select(Resource).where(
            Resource.quantity <= Resource.min_threshold,
            Resource.quantity > 0,
            Resource.is_deleted.is_(False),
        )
        return self.session.scalars(stmt).all()

    def get_depleted_resources(self) -> Sequence[Resource]:
        """Fetch exhausted inventory records."""
        stmt = select(Resource).where(
            or_(Resource.quantity <= 0, Resource.status == ResourceStatus.DEPLETED),
            Resource.is_deleted.is_(False),
        )
        return self.session.scalars(stmt).all()

    def allocate_resource(
        self,
        resource_id: str,
        quantity: float,
        incident_id: Optional[str] = None,
        shelter_id: Optional[str] = None,
    ) -> Optional[Resource]:
        """
        Allocate a specified quantity to an incident or shelter.
        Decreases available quantity; marks depleted if 0.
        """
        resource = self.get(resource_id)
        if not resource or resource.quantity <= 0:
            return None

        qty_to_allocate = min(quantity, resource.quantity)
        resource.quantity -= qty_to_allocate

        if resource.quantity <= 0:
            resource.quantity = 0.0
            resource.status = ResourceStatus.DEPLETED
        elif incident_id or shelter_id:
            # If partially allocated specifically, track assignment
            if incident_id:
                resource.allocated_incident_id = incident_id
            if shelter_id:
                resource.allocated_shelter_id = shelter_id

        self.session.add(resource)
        self.session.flush()
        return resource

    def replenish_resource(
        self,
        resource_id: str,
        quantity: float,
    ) -> Optional[Resource]:
        """Add newly arrived supplies back to warehouse inventory."""
        resource = self.get(resource_id)
        if not resource:
            return None

        resource.quantity += max(0.0, quantity)
        if resource.quantity > 0:
            resource.status = ResourceStatus.AVAILABLE

        self.session.add(resource)
        self.session.flush()
        return resource

    def get_inventory_summary(self) -> Dict[str, Any]:
        """Aggregate total count, inventory breakdown by category, and shortage warnings."""
        total_items = self.count()
        available_count = self.count([Resource.status == ResourceStatus.AVAILABLE])
        depleted_count = self.count([Resource.status == ResourceStatus.DEPLETED])
        low_stock_items = len(self.get_low_stock_resources())

        # Category breakdown
        breakdown_stmt = (
            select(Resource.type, func.count(Resource.id), func.sum(Resource.quantity))
            .where(Resource.is_deleted.is_(False))
            .group_by(Resource.type)
        )
        rows = self.session.execute(breakdown_stmt).all()
        by_category = {
            row[0].value if hasattr(row[0], "value") else str(row[0]): {
                "item_records": row[1],
                "total_quantity": float(row[2] or 0.0),
            }
            for row in rows
        }

        return {
            "total_inventory_records": total_items,
            "available_records": available_count,
            "depleted_records": depleted_count,
            "low_stock_warnings": low_stock_items,
            "by_category": by_category,
        }
