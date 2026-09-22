"""
Prediction repository providing queries for AI/ML hazard probability forecasts and high-risk alerts.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional, Sequence

from sqlalchemy import func, select
from sqlalchemy.orm import Session

try:
    from backend.database.models.base import utc_now
    from backend.database.models.prediction import DisasterType, Prediction, RiskLevel
    from backend.database.repositories.base import BaseRepository
except ImportError:
    from ml_backend.database.models.base import utc_now
    from ml_backend.database.models.prediction import DisasterType, Prediction, RiskLevel
    from ml_backend.database.repositories.base import BaseRepository


class PredictionRepository(BaseRepository[Prediction]):
    """Repository managing AI hazard forecasts, probabilities, and impact estimates."""

    def __init__(self, session: Session) -> None:
        super().__init__(Prediction, session)

    def get_latest_predictions(
        self,
        disaster_type: Optional[DisasterType] = None,
        limit: int = 20,
    ) -> Sequence[Prediction]:
        """Fetch the most recent predictions ordered by predicted_at desc."""
        stmt = select(Prediction)
        if disaster_type is not None:
            stmt = stmt.where(Prediction.disaster_type == disaster_type)

        stmt = stmt.order_by(Prediction.predicted_at.desc()).limit(limit)
        return self.session.scalars(stmt).all()

    def get_active_high_risk(
        self,
        min_probability: float = 0.7,
        limit: int = 50,
    ) -> Sequence[Prediction]:
        """Retrieve non-expired predictions classified as HIGH or CRITICAL with high confidence."""
        now = utc_now()
        stmt = (
            select(Prediction)
            .where(
                Prediction.risk_level.in_([RiskLevel.HIGH, RiskLevel.CRITICAL]),
                Prediction.probability >= min_probability,
                (Prediction.valid_until.is_(None)) | (Prediction.valid_until >= now),
            )
            .order_by(Prediction.probability.desc(), Prediction.predicted_at.desc())
            .limit(limit)
        )
        return self.session.scalars(stmt).all()

    def get_predictions_for_region(
        self,
        district: Optional[str] = None,
        state: Optional[str] = None,
        limit: int = 50,
    ) -> Sequence[Prediction]:
        """Retrieve forecast hazard predictions for specific administrative region."""
        stmt = select(Prediction)
        if district:
            stmt = stmt.where(Prediction.district.ilike(f"%{district}%"))
        if state:
            stmt = stmt.where(Prediction.state.ilike(f"%{state}%"))

        stmt = stmt.order_by(Prediction.predicted_at.desc()).limit(limit)
        return self.session.scalars(stmt).all()

    def get_valid_predictions(
        self,
        at_time: Optional[datetime] = None,
        limit: int = 100,
    ) -> Sequence[Prediction]:
        """Retrieve predictions currently in their active validity time window."""
        target_time = at_time or utc_now()
        stmt = (
            select(Prediction)
            .where(
                Prediction.predicted_at <= target_time,
                (Prediction.valid_until.is_(None)) | (Prediction.valid_until >= target_time),
            )
            .order_by(Prediction.probability.desc())
            .limit(limit)
        )
        return self.session.scalars(stmt).all()

    def get_hazard_risk_matrix(self) -> Dict[str, Any]:
        """Aggregate prediction counts by disaster type and risk level."""
        stmt = (
            select(Prediction.disaster_type, Prediction.risk_level, func.count(Prediction.id))
            .group_by(Prediction.disaster_type, Prediction.risk_level)
        )
        rows = self.session.execute(stmt).all()

        matrix: Dict[str, Dict[str, int]] = {}
        total = 0
        for dtype, rlevel, count in rows:
            dtype_key = dtype.value if hasattr(dtype, "value") else str(dtype)
            rlevel_key = rlevel.value if hasattr(rlevel, "value") else str(rlevel)
            if dtype_key not in matrix:
                matrix[dtype_key] = {}
            matrix[dtype_key][rlevel_key] = count
            total += count

        return {
            "total_predictions": total,
            "matrix": matrix,
        }
