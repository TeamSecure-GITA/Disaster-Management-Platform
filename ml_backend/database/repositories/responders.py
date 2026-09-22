"""
Responder repository providing tactical search, status tracking, incident dispatch, and spatial proximity queries.
"""

from __future__ import annotations

import math
from typing import Any, Dict, List, Optional, Sequence

from sqlalchemy import select
from sqlalchemy.orm import Session

from ml_backend.database.models.responder import Responder, ResponderStatus
from ml_backend.database.repositories.base import BaseRepository


class ResponderRepository(BaseRepository[Responder]):
    """Repository managing emergency rescue personnel, response squads, and deployment."""

    def __init__(self, session: Session) -> None:
        super().__init__(Responder, session)

    def get_by_user_id(self, user_id: str) -> Optional[Responder]:
        """Fetch responder profile associated with a user account."""
        stmt = select(Responder).where(Responder.user_id == user_id, Responder.is_deleted.is_(False))
        return self.session.scalar(stmt)

    def get_by_badge(self, badge_number: str) -> Optional[Responder]:
        """Fetch responder by official badge or service identifier."""
        stmt = select(Responder).where(
            Responder.badge_number == badge_number,
            Responder.is_deleted.is_(False),
        )
        return self.session.scalar(stmt)

    def get_by_organization(
        self,
        organization: str,
        skip: int = 0,
        limit: int = 100,
    ) -> Sequence[Responder]:
        """Filter personnel by organization (e.g. NDRF, SDRF, Fire Service)."""
        stmt = (
            select(Responder)
            .where(
                Responder.organization.ilike(f"%{organization}%"),
                Responder.is_deleted.is_(False),
            )
            .offset(skip)
            .limit(limit)
        )
        return self.session.scalars(stmt).all()

    def get_available_responders(
        self,
        organization: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> Sequence[Responder]:
        """Retrieve active responders currently ready for immediate dispatch."""
        stmt = select(Responder).where(
            Responder.availability_status == ResponderStatus.AVAILABLE,
            Responder.is_deleted.is_(False),
        )
        if organization:
            stmt = stmt.where(Responder.organization.ilike(f"%{organization}%"))

        stmt = stmt.offset(skip).limit(limit)
        return self.session.scalars(stmt).all()

    def get_by_incident(self, incident_id: str) -> Sequence[Responder]:
        """Fetch responders deployed on a specific incident."""
        stmt = select(Responder).where(
            Responder.active_incident_id == incident_id,
            Responder.is_deleted.is_(False),
        )
        return self.session.scalars(stmt).all()

    def assign_to_incident(
        self,
        responder_id: str,
        incident_id: str,
    ) -> Optional[Responder]:
        """Dispatch a responder to an active disaster incident."""
        responder = self.get(responder_id)
        if not responder:
            return None

        responder.active_incident_id = incident_id
        responder.availability_status = ResponderStatus.DISPATCHED
        self.session.add(responder)
        self.session.flush()
        return responder

    def release_from_incident(self, responder_id: str) -> Optional[Responder]:
        """Demobilize responder back to available pool."""
        responder = self.get(responder_id)
        if not responder:
            return None

        responder.active_incident_id = None
        responder.availability_status = ResponderStatus.AVAILABLE
        self.session.add(responder)
        self.session.flush()
        return responder

    def update_location(
        self,
        responder_id: str,
        latitude: float,
        longitude: float,
    ) -> Optional[Responder]:
        """Update live telemetry GPS coordinates of field responder."""
        responder = self.get(responder_id)
        if not responder:
            return None

        responder.latitude = latitude
        responder.longitude = longitude
        self.session.add(responder)
        self.session.flush()
        return responder

    def update_status(
        self,
        responder_id: str,
        status: ResponderStatus,
    ) -> Optional[Responder]:
        """Update operational deployment state."""
        responder = self.get(responder_id)
        if not responder:
            return None

        responder.availability_status = status
        self.session.add(responder)
        self.session.flush()
        return responder

    def get_nearby_available(
        self,
        latitude: float,
        longitude: float,
        radius_km: float = 50.0,
        limit: int = 20,
    ) -> List[Responder]:
        """Find closest available emergency responders using Haversine distance."""
        lat_delta = radius_km / 111.0
        lon_delta = radius_km / (111.0 * max(0.1, math.cos(math.radians(latitude))))

        stmt = select(Responder).where(
            Responder.availability_status == ResponderStatus.AVAILABLE,
            Responder.latitude.between(latitude - lat_delta, latitude + lat_delta),
            Responder.longitude.between(longitude - lon_delta, longitude + lon_delta),
            Responder.is_deleted.is_(False),
        )
        candidates = self.session.scalars(stmt).all()

        results = []
        for r in candidates:
            dlat = math.radians(r.latitude - latitude)
            dlon = math.radians(r.longitude - longitude)
            a = (
                math.sin(dlat / 2.0) ** 2
                + math.cos(math.radians(latitude))
                * math.cos(math.radians(r.latitude))
                * math.sin(dlon / 2.0) ** 2
            )
            dist = 6371.0 * 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
            if dist <= radius_km:
                results.append((dist, r))

        results.sort(key=lambda x: x[0])
        return [item[1] for item in results[:limit]]

    def get_fleet_summary(self) -> Dict[str, Any]:
        """Aggregate deployment metrics across all responder corps."""
        total = self.count()
        available = self.count([Responder.availability_status == ResponderStatus.AVAILABLE])
        dispatched = self.count([Responder.availability_status == ResponderStatus.DISPATCHED])
        on_scene = self.count([Responder.availability_status == ResponderStatus.ON_SCENE])
        resting = self.count([Responder.availability_status == ResponderStatus.RESTING])
        off_duty = self.count([Responder.availability_status == ResponderStatus.OFF_DUTY])

        return {
            "total_responders": total,
            "available_for_dispatch": available,
            "dispatched": dispatched,
            "on_scene": on_scene,
            "resting": resting,
            "off_duty": off_duty,
            "deployed_percentage": round(
                ((dispatched + on_scene) / total * 100.0) if total > 0 else 0.0, 1
            ),
        }
