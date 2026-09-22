"""
Incident repository providing specialized queries, geo-filtering, verification workflows, and summary statistics.
"""

from __future__ import annotations

import math
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Sequence

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ml_backend.database.models.base import utc_now
from ml_backend.database.models.incident import (
    Incident,
    IncidentSeverity,
    IncidentStatus,
    IncidentType,
)
from ml_backend.database.repositories.base import BaseRepository


class IncidentRepository(BaseRepository[Incident]):
    """Repository managing disaster incidents and ground hazard observations."""

    def __init__(self, session: Session) -> None:
        super().__init__(Incident, session)

    def get_by_status(
        self,
        status: IncidentStatus,
        skip: int = 0,
        limit: int = 100,
    ) -> Sequence[Incident]:
        """Retrieve incidents filtered by workflow status."""
        stmt = (
            select(Incident)
            .where(Incident.status == status, Incident.is_deleted.is_(False))
            .order_by(Incident.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return self.session.scalars(stmt).all()

    def get_by_severity(
        self,
        severity: IncidentSeverity,
        skip: int = 0,
        limit: int = 100,
    ) -> Sequence[Incident]:
        """Retrieve incidents filtered by severity level."""
        stmt = (
            select(Incident)
            .where(Incident.severity == severity, Incident.is_deleted.is_(False))
            .order_by(Incident.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return self.session.scalars(stmt).all()

    def get_by_type(
        self,
        incident_type: IncidentType,
        skip: int = 0,
        limit: int = 100,
    ) -> Sequence[Incident]:
        """Retrieve incidents filtered by hazard/incident type."""
        stmt = (
            select(Incident)
            .where(Incident.incident_type == incident_type, Incident.is_deleted.is_(False))
            .order_by(Incident.created_at.desc())
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
    ) -> Sequence[Incident]:
        """Retrieve incidents matching administrative district and optional state."""
        stmt = select(Incident).where(
            Incident.district.ilike(f"%{district}%"),
            Incident.is_deleted.is_(False),
        )
        if state:
            stmt = stmt.where(Incident.state.ilike(f"%{state}%"))

        stmt = stmt.order_by(Incident.created_at.desc()).offset(skip).limit(limit)
        return self.session.scalars(stmt).all()

    def get_pending_verification(
        self,
        skip: int = 0,
        limit: int = 100,
    ) -> Sequence[Incident]:
        """Retrieve reports waiting for validation by response operators."""
        return self.get_by_status(IncidentStatus.PENDING, skip=skip, limit=limit)

    def get_recent_incidents(
        self,
        hours: int = 24,
        limit: int = 100,
    ) -> Sequence[Incident]:
        """Retrieve incidents reported within the last N hours."""
        cutoff = utc_now() - timedelta(hours=hours)
        stmt = (
            select(Incident)
            .where(Incident.created_at >= cutoff, Incident.is_deleted.is_(False))
            .order_by(Incident.created_at.desc())
            .limit(limit)
        )
        return self.session.scalars(stmt).all()

    def get_nearby(
        self,
        latitude: float,
        longitude: float,
        radius_km: float = 25.0,
        limit: int = 50,
    ) -> List[Incident]:
        """
        Query incidents within a geographical bounding box, refined with Haversine distance.
        """
        # Roughly 1 deg latitude ~ 111 km
        lat_delta = radius_km / 111.0
        # Roughly 1 deg longitude ~ 111 * cos(lat) km
        lon_delta = radius_km / (111.0 * max(0.1, math.cos(math.radians(latitude))))

        stmt = (
            select(Incident)
            .where(
                Incident.latitude.between(latitude - lat_delta, latitude + lat_delta),
                Incident.longitude.between(longitude - lon_delta, longitude + lon_delta),
                Incident.is_deleted.is_(False),
            )
            .order_by(Incident.created_at.desc())
            .limit(limit * 2)
        )
        candidates = self.session.scalars(stmt).all()

        results = []
        for inc in candidates:
            # Haversine distance
            dlat = math.radians(inc.latitude - latitude)
            dlon = math.radians(inc.longitude - longitude)
            a = (
                math.sin(dlat / 2.0) ** 2
                + math.cos(math.radians(latitude))
                * math.cos(math.radians(inc.latitude))
                * math.sin(dlon / 2.0) ** 2
            )
            c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
            distance_km = 6371.0 * c
            if distance_km <= radius_km:
                results.append(inc)
                if len(results) >= limit:
                    break

        return results

    def verify_incident(
        self,
        incident_id: str,
        verified_by_id: str,
        remarks: Optional[str] = None,
    ) -> Optional[Incident]:
        """Mark incident as verified by an authorized operator."""
        incident = self.get(incident_id)
        if not incident:
            return None

        incident.status = IncidentStatus.VERIFIED
        incident.verified_by_id = verified_by_id
        incident.verified_at = utc_now()
        if remarks:
            incident.remarks = (incident.remarks or "") + f"\n[Verified]: {remarks}".strip()

        self.session.add(incident)
        self.session.flush()
        return incident

    def escalate_incident(
        self,
        incident_id: str,
        remarks: Optional[str] = None,
    ) -> Optional[Incident]:
        """Escalate incident to priority critical state for immediate mobilization."""
        incident = self.get(incident_id)
        if not incident:
            return None

        incident.status = IncidentStatus.ESCALATED
        incident.severity = IncidentSeverity.CRITICAL
        if remarks:
            incident.remarks = (incident.remarks or "") + f"\n[Escalated]: {remarks}".strip()

        self.session.add(incident)
        self.session.flush()
        return incident

    def resolve_incident(
        self,
        incident_id: str,
        remarks: Optional[str] = None,
    ) -> Optional[Incident]:
        """Mark incident as resolved post-operation."""
        incident = self.get(incident_id)
        if not incident:
            return None

        incident.status = IncidentStatus.RESOLVED
        if remarks:
            incident.remarks = (incident.remarks or "") + f"\n[Resolved]: {remarks}".strip()

        self.session.add(incident)
        self.session.flush()
        return incident

    def reject_incident(
        self,
        incident_id: str,
        remarks: Optional[str] = None,
    ) -> Optional[Incident]:
        """Reject false positive or spam report."""
        incident = self.get(incident_id)
        if not incident:
            return None

        incident.status = IncidentStatus.REJECTED
        if remarks:
            incident.remarks = (incident.remarks or "") + f"\n[Rejected]: {remarks}".strip()

        self.session.add(incident)
        self.session.flush()
        return incident

    def get_summary_stats(self) -> Dict[str, Any]:
        """Aggregate summary counts and metrics for real-time dashboards."""
        total = self.count()
        pending = self.count([Incident.status == IncidentStatus.PENDING])
        verified = self.count([Incident.status == IncidentStatus.VERIFIED])
        escalated = self.count([Incident.status == IncidentStatus.ESCALATED])
        resolved = self.count([Incident.status == IncidentStatus.RESOLVED])
        critical = self.count([Incident.severity == IncidentSeverity.CRITICAL])
        road_blocked = self.count([Incident.is_road_blocked.is_(True)])

        avg_risk = self.session.scalar(
            select(func.avg(Incident.risk_score)).where(Incident.is_deleted.is_(False))
        ) or 0.0

        return {
            "total_incidents": total,
            "pending_verification": pending,
            "verified": verified,
            "escalated": escalated,
            "resolved": resolved,
            "critical_severity": critical,
            "roads_blocked": road_blocked,
            "average_risk_score": round(float(avg_risk), 2),
        }
