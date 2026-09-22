"""
Base model and shared mixins for SQLAlchemy 2.0 ORM models.
Provides UUID primary keys, timestamp tracking, soft deletes, and JSON serialization.
"""

from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from sqlalchemy import Boolean, DateTime, String, TypeDecorator, inspect
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


def utc_now() -> datetime:
    """Return timezone-aware current UTC datetime."""
    return datetime.now(timezone.utc)


class JSONType(TypeDecorator):
    """Platform-independent JSON type compatible with SQLite, PostgreSQL, and MySQL."""

    impl = String
    cache_ok = True

    def process_bind_param(self, value: Any, dialect: Any) -> Optional[str]:
        if value is None:
            return None
        return json.dumps(value, default=str)

    def process_result_value(self, value: Any, dialect: Any) -> Any:
        if value is None:
            return None
        if isinstance(value, (dict, list)):
            return value
        try:
            return json.loads(value)
        except (ValueError, TypeError):
            return value


class Base(DeclarativeBase):
    """SQLAlchemy Declarative Base for all database models."""

    def to_dict(self) -> Dict[str, Any]:
        """Serialize model instance to dictionary representation."""
        result: Dict[str, Any] = {}
        for col in inspect(self).mapper.column_attrs:
            val = getattr(self, col.key)
            if isinstance(val, datetime):
                result[col.key] = val.isoformat()
            elif isinstance(val, uuid.UUID):
                result[col.key] = str(val)
            else:
                result[col.key] = val
        return result

    def __repr__(self) -> str:
        attrs = []
        for key in ["id", "name", "title", "device_id", "email", "status"]:
            if hasattr(self, key):
                attrs.append(f"{key}={getattr(self, key)!r}")
        attr_str = ", ".join(attrs) if attrs else f"id={getattr(self, 'id', None)!r}"
        return f"<{self.__class__.__name__}({attr_str})>"


class UUIDMixin:
    """Mixin providing UUID string primary key."""

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True,
    )


class TimestampMixin:
    """Mixin providing created_at and updated_at UTC timestamps."""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        nullable=False,
        index=True,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        nullable=False,
    )


class SoftDeleteMixin:
    """Mixin providing soft-deletion support."""

    is_deleted: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        index=True,
    )

    deleted_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        default=None,
    )

    def soft_delete(self) -> None:
        """Mark model instance as deleted."""
        self.is_deleted = True
        self.deleted_at = utc_now()
