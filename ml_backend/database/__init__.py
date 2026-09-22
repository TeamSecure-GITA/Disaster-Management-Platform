"""
Database connection, session management, and lifecycle initialization.
Supports SQLite (sync and async), PostgreSQL, and SQLAlchemy 2.0.
"""

from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager, contextmanager
from typing import AsyncGenerator, Generator, Optional

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from ml_backend.database.models.base import Base

logger = logging.getLogger(__name__)

# Resolve database URL from environment or configuration
# Default fallback to SQLite in ml_backend root
DEFAULT_DB_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "disaster_management.db")
)
DATABASE_URL: str = os.getenv(
    "DATABASE_URL",
    f"sqlite:///{DEFAULT_DB_PATH}",
)

# Convert async url to sync url if needed for sync engine
SYNC_DATABASE_URL = DATABASE_URL
if SYNC_DATABASE_URL.startswith("sqlite+aiosqlite:"):
    SYNC_DATABASE_URL = SYNC_DATABASE_URL.replace("sqlite+aiosqlite:", "sqlite:")
elif SYNC_DATABASE_URL.startswith("postgresql+asyncpg:"):
    SYNC_DATABASE_URL = SYNC_DATABASE_URL.replace("postgresql+asyncpg:", "postgresql:")

# Configure engine arguments
connect_args = {}
if SYNC_DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    SYNC_DATABASE_URL,
    connect_args=connect_args,
    echo=os.getenv("DATABASE_ECHO", "false").lower() == "true",
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False,
)


@contextmanager
def get_db_session() -> Generator[Session, None, None]:
    """Provide a transactional scope around a series of operations."""
    session: Session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception as exc:
        session.rollback()
        logger.error(f"Database session rollback due to error: {exc}", exc_info=True)
        raise
    finally:
        session.close()


async def get_db() -> AsyncGenerator[Session, None]:
    """
    FastAPI dependency yielding a database session.
    Automatically commits on normal completion or rolls back on exception.
    """
    session: Session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception as exc:
        session.rollback()
        logger.error(f"Database dependency session rollback: {exc}", exc_info=True)
        raise
    finally:
        session.close()


def init_db(drop_first: bool = False) -> None:
    """Create all database tables."""
    # Import all models to ensure they are registered with Base.metadata
    from ml_backend.database import models  # noqa: F401

    if drop_first:
        logger.warning("Dropping all existing database tables...")
        Base.metadata.drop_all(bind=engine)

    logger.info("Creating all database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database schema initialized successfully.")


def close_db() -> None:
    """Dispose engine connections."""
    engine.dispose()
    logger.info("Database engine connections closed.")
