"""
Alert repository providing active warnings query, geographic broadcast radius matching, and broadcast lifecycle.
"""

from __future__ import annotations

import math
from datetime import datetime
from typing import Any, Dict, List, Optional, Sequence

from sqlalchemy import desc, select
from sqlalchemy.orm import Session

try:
    from backend.database.models.alert import Alert, AlertSeverity, AlertStatus, AlertType
    from backend.database.models.base import utc_now
    from backend.database.repositories.base import BaseRepository
except ImportError:
    from ml_backend.database.models.alert import Alert, AlertSeverity, AlertStatus, AlertType
    from ml_backend.database.models.base import utc_now
    from ml_backend.database.repositories.base import BaseRepository


class AlertRepository(BaseRepository[Alert]):
    """Repository managing emergency alerts, public warning broadcasts, and radius coverage."""

    def __init__(self, session: Session) -> None:
        super().__init__(Alert, session)

    def get_active_alerts(
        self,
        severity: Optional[AlertSeverity] = None,
        alert_type: Optional[AlertType] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> Sequence[Alert]:
        """Retrieve active, non-expired warning broadcasts."""
        now = utc_now()
        stmt = select(Alert).where(
            Alert.status == AlertStatus.ACTIVE,
            (Alert.expires_at.is_(None)) | (Alert.expires_at >= now),
            Alert.is_deleted.is_(False),
        )
        if severity is not None:
            stmt = stmt.where(Alert.severity == severity)
        if alert_type is not None:
            stmt = stmt.where(Alert.type == alert_type)

        stmt = stmt.order_by(Alert.issued_at.desc()).offset(skip).limit(limit)
        return self.session.scalars(stmt).all()

    def get_alerts_for_location(
        self,
        latitude: float,
        longitude: float,
    ) -> List[Alert]:
        """
        Check if given coordinates fall inside any active alert's broadcast radius.
        """
        now = utc_now()
        stmt = select(Alert).where(
            Alert.status == AlertStatus.ACTIVE,
            (Alert.expires_at.is_(None)) | (Alert.expires_at >= now),
            Alert.is_deleted.is_(False),
        )
        active_alerts = self.session.scalars(stmt).all()

        matching_alerts: List[Alert] = []
        for alert in active_alerts:
            dlat = math.radians(latitude - alert.latitude)
            dlon = math.radians(longitude - alert.longitude)
            a = (
                math.sin(dlat / 2.0) ** 2
                + math.cos(math.radians(alert.latitude))
                * math.cos(math.radians(latitude))
                * math.sin(dlon / 2.0) ** 2
            )
            c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
            dist_km = 6371.0 * c

            if dist_km <= alert.radius_km:
                matching_alerts.append(alert)

        return matching_alerts

    def cancel_alert(self, alert_id: str) -> Optional[Alert]:
        """Cancel an ongoing warning broadcast early."""
        alert = self.get(alert_id)
        if not alert:
            return None

        alert.status = AlertStatus.CANCELLED
        self.session.add(alert)
        self.session.flush()
        return alert

    def resolve_alert(self, alert_id: str) -> Optional[Alert]:
        """Mark threat as cleared / resolved."""
        alert = self.get(alert_id)
        if not alert:
            return None

        alert.status = AlertStatus.RESOLVED
        self.session.add(alert)
        self.session.flush()
        return alert

    def increment_broadcast_count(self, alert_id: str, count: int = 1) -> Optional[Alert]:
        """Increment count of citizens/terminals notified via broadcast."""
        alert = self.get(alert_id)
        if not alert:
            return None

        alert.broadcast_count += count
        self.session.add(alert)
        self.session.flush()
        return alert

    def increment_acknowledgements(self, alert_id: str, count: int = 1) -> Optional[Alert]:
        """Increment citizen confirmation / read receipt count."""
        alert = self.get(alert_id)
        if not alert:
            return None

        alert.acknowledgements_count += count
        self.session.add(alert)
        self.session.flush()
        return alert

    def get_alert_statistics(self) -> Dict[str, Any]:
        """Aggregate warning issuance metrics and reach."""
        total = self.count()
        active = self.count([Alert.status == AlertStatus.ACTIVE])
        resolved = self.count([Alert.status == AlertStatus.RESOLVED])
        cancelled = self.count([Alert.status == AlertStatus.CANCELLED])
        critical = self.count([Alert.severity == AlertSeverity.CRITICAL])

        return {
            "total_alerts": total,
            "active_broadcasts": active,
            "resolved_broadcasts": resolved,
            "cancelled_broadcasts": cancelled,
            "critical_severity_alerts": critical,
        }
