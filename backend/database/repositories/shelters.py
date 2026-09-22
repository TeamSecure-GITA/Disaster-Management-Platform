"""
Shelter repository providing spatial discovery, occupancy updates, capacity tracking, and emergency facility queries.
"""

from __future__ import annotations

import math
from typing import Any, Dict, List, Optional, Sequence

from sqlalchemy import func, select
from sqlalchemy.orm import Session

try:
    from backend.database.models.shelter import Shelter, ShelterStatus
    from backend.database.repositories.base import BaseRepository
except ImportError:
    from ml_backend.database.models.shelter import Shelter, ShelterStatus
    from ml_backend.database.repositories.base import BaseRepository


class ShelterRepository(BaseRepository[Shelter]):
    """Repository managing emergency evacuation camps and relief shelters."""

    def __init__(self, session: Session) -> None:
        super().__init__(Shelter, session)

    def get_available_shelters(
        self,
        min_available_capacity: int = 1,
        skip: int = 0,
        limit: int = 100,
    ) -> Sequence[Shelter]:
        """Retrieve active shelters with remaining vacant capacity."""
        stmt = (
            select(Shelter)
            .where(
                Shelter.status == ShelterStatus.ACTIVE,
                (Shelter.capacity - Shelter.current_occupancy) >= min_available_capacity,
                Shelter.is_deleted.is_(False),
            )
            .order_by((Shelter.capacity - Shelter.current_occupancy).desc())
            .offset(skip)
            .limit(limit)
        )
        return self.session.scalars(stmt).all()

    def get_by_district(
        self,
        district: str,
        state: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> Sequence[Shelter]:
        """Retrieve shelters by administrative district and optional state."""
        stmt = select(Shelter).where(
            Shelter.district.ilike(f"%{district}%"),
            Shelter.is_deleted.is_(False),
        )
        if state:
            stmt = stmt.where(Shelter.state.ilike(f"%{state}%"))

        stmt = stmt.order_by(Shelter.name.asc()).offset(skip).limit(limit)
        return self.session.scalars(stmt).all()

    def get_nearby_shelters(
        self,
        latitude: float,
        longitude: float,
        radius_km: float = 50.0,
        only_available: bool = True,
        limit: int = 20,
    ) -> List[Shelter]:
        """
        Find closest shelters to given coordinates, sorted by distance.
        """
        lat_delta = radius_km / 111.0
        lon_delta = radius_km / (111.0 * max(0.1, math.cos(math.radians(latitude))))

        stmt = select(Shelter).where(
            Shelter.latitude.between(latitude - lat_delta, latitude + lat_delta),
            Shelter.longitude.between(longitude - lon_delta, longitude + lon_delta),
            Shelter.is_deleted.is_(False),
        )
        if only_available:
            stmt = stmt.where(
                Shelter.status == ShelterStatus.ACTIVE,
                (Shelter.capacity - Shelter.current_occupancy) > 0,
            )

        candidates = self.session.scalars(stmt).all()

        results_with_dist = []
        for shelter in candidates:
            dlat = math.radians(shelter.latitude - latitude)
            dlon = math.radians(shelter.longitude - longitude)
            a = (
                math.sin(dlat / 2.0) ** 2
                + math.cos(math.radians(latitude))
                * math.cos(math.radians(shelter.latitude))
                * math.sin(dlon / 2.0) ** 2
            )
            c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
            dist_km = 6371.0 * c
            if dist_km <= radius_km:
                results_with_dist.append((dist_km, shelter))

        results_with_dist.sort(key=lambda x: x[0])
        return [item[1] for item in results_with_dist[:limit]]

    def update_occupancy(self, shelter_id: str, new_occupancy: int) -> Optional[Shelter]:
        """Update shelter head count and sync full/active status."""
        shelter = self.get(shelter_id)
        if not shelter:
            return None

        shelter.current_occupancy = max(0, new_occupancy)
        if shelter.current_occupancy >= shelter.capacity:
            shelter.status = ShelterStatus.FULL
        elif shelter.status == ShelterStatus.FULL and shelter.current_occupancy < shelter.capacity:
            shelter.status = ShelterStatus.ACTIVE

        self.session.add(shelter)
        self.session.flush()
        return shelter

    def increment_occupancy(self, shelter_id: str, count: int = 1) -> Optional[Shelter]:
        """Increment count of evacuees checked in."""
        shelter = self.get(shelter_id)
        if not shelter:
            return None
        return self.update_occupancy(shelter_id, shelter.current_occupancy + count)

    def decrement_occupancy(self, shelter_id: str, count: int = 1) -> Optional[Shelter]:
        """Decrement count of evacuees departing or relocated."""
        shelter = self.get(shelter_id)
        if not shelter:
            return None
        return self.update_occupancy(shelter_id, shelter.current_occupancy - count)

    def get_capacity_statistics(self) -> Dict[str, Any]:
        """Calculate overall shelter system capacity, current occupancy, and vacancy."""
        total_capacity = self.session.scalar(
            select(func.sum(Shelter.capacity)).where(Shelter.is_deleted.is_(False))
        ) or 0
        total_occupied = self.session.scalar(
            select(func.sum(Shelter.current_occupancy)).where(Shelter.is_deleted.is_(False))
        ) or 0
        total_shelters = self.count()
        active_shelters = self.count([Shelter.status == ShelterStatus.ACTIVE])
        full_shelters = self.count([Shelter.status == ShelterStatus.FULL])

        available_beds = max(0, total_capacity - total_occupied)
        utilization = (total_occupied / total_capacity * 100.0) if total_capacity > 0 else 0.0

        return {
            "total_shelters": total_shelters,
            "active_shelters": active_shelters,
            "full_shelters": full_shelters,
            "total_capacity": total_capacity,
            "total_occupied": total_occupied,
            "available_capacity": available_beds,
            "utilization_percentage": round(utilization, 1),
        }
