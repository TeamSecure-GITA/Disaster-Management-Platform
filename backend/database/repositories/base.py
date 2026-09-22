"""
Base generic repository pattern for SQLAlchemy 2.0 ORM operations in backend database layer.
Provides standardized CRUD, pagination, filtering, and soft-delete capabilities.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, Generic, List, Optional, Sequence, Type, TypeVar, Union

from sqlalchemy import delete, func, select, update
from sqlalchemy.orm import Session

try:
    from backend.database.models.base import Base, utc_now
except ImportError:
    from ml_backend.database.models.base import Base, utc_now

logger = logging.getLogger(__name__)

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """Generic repository providing type-safe CRUD operations on model instances."""

    def __init__(self, model: Type[ModelType], session: Session) -> None:
        self.model = model
        self.session = session

    def get(self, id: str) -> Optional[ModelType]:
        """Fetch a single record by primary key."""
        stmt = select(self.model).where(self.model.id == id)
        if hasattr(self.model, "is_deleted"):
            stmt = stmt.where(self.model.is_deleted.is_(False))
        return self.session.scalar(stmt)

    def get_including_deleted(self, id: str) -> Optional[ModelType]:
        """Fetch a record by primary key including soft-deleted ones."""
        stmt = select(self.model).where(self.model.id == id)
        return self.session.scalar(stmt)

    def get_multi(
        self,
        skip: int = 0,
        limit: int = 100,
        filters: Optional[List[Any]] = None,
        order_by: Optional[Any] = None,
    ) -> Sequence[ModelType]:
        """Fetch multiple records with optional pagination, criteria, and ordering."""
        stmt = select(self.model)
        if hasattr(self.model, "is_deleted"):
            stmt = stmt.where(self.model.is_deleted.is_(False))
        if filters:
            for f in filters:
                stmt = stmt.where(f)
        if order_by is not None:
            stmt = stmt.order_by(order_by)
        elif hasattr(self.model, "created_at"):
            stmt = stmt.order_by(self.model.created_at.desc())

        stmt = stmt.offset(skip).limit(limit)
        return self.session.scalars(stmt).all()

    def count(self, filters: Optional[List[Any]] = None) -> int:
        """Count total matching records."""
        stmt = select(func.count()).select_from(self.model)
        if hasattr(self.model, "is_deleted"):
            stmt = stmt.where(self.model.is_deleted.is_(False))
        if filters:
            for f in filters:
                stmt = stmt.where(f)
        return self.session.scalar(stmt) or 0

    def exists(self, id: str) -> bool:
        """Check whether a record with given primary key exists."""
        stmt = select(func.count()).select_from(self.model).where(self.model.id == id)
        if hasattr(self.model, "is_deleted"):
            stmt = stmt.where(self.model.is_deleted.is_(False))
        return (self.session.scalar(stmt) or 0) > 0

    def create(self, obj_in: Union[Dict[str, Any], ModelType]) -> ModelType:
        """Insert a new model record."""
        if isinstance(obj_in, dict):
            db_obj = self.model(**obj_in)
        else:
            db_obj = obj_in

        self.session.add(db_obj)
        self.session.flush()
        return db_obj

    def create_batch(self, objs_in: List[Union[Dict[str, Any], ModelType]]) -> List[ModelType]:
        """Insert a batch of model records."""
        db_objs: List[ModelType] = []
        for item in objs_in:
            if isinstance(item, dict):
                obj = self.model(**item)
            else:
                obj = item
            db_objs.append(obj)

        self.session.add_all(db_objs)
        self.session.flush()
        return db_objs

    def update(
        self,
        db_obj: ModelType,
        obj_in: Union[Dict[str, Any], ModelType],
    ) -> ModelType:
        """Update existing model record attributes."""
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.to_dict()

        for field, value in update_data.items():
            if hasattr(db_obj, field) and field != "id":
                setattr(db_obj, field, value)

        if hasattr(db_obj, "updated_at"):
            setattr(db_obj, "updated_at", utc_now())

        self.session.add(db_obj)
        self.session.flush()
        return db_obj

    def delete(self, id: str, soft: bool = True) -> bool:
        """Delete a record by ID. Performs soft deletion if supported, unless soft=False."""
        db_obj = self.get(id)
        if not db_obj:
            return False

        if soft and hasattr(db_obj, "soft_delete"):
            db_obj.soft_delete()
            self.session.add(db_obj)
        else:
            self.session.delete(db_obj)

        self.session.flush()
        return True
