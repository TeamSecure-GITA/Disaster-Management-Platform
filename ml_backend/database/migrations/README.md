# Database Migrations Guide

This directory contains the database schema migration scripts and configuration for the Disaster Management Platform.

## Architecture

The database layer utilizes **SQLAlchemy 2.0** ORM models with support for SQLite (development/edge) and PostgreSQL (production).

Schema definitions are defined in:
- `ml_backend/database/models/base.py` — DeclarativeBase, UUIDMixin, TimestampMixin, SoftDeleteMixin, JSONType
- `ml_backend/database/models/user.py` — Users, Roles, and Authentication
- `ml_backend/database/models/incident.py` — Ground Hazard Reports and Verification
- `ml_backend/database/models/sensor.py` — IoT Telemetry Stations and Time-Series Readings
- `ml_backend/database/models/shelter.py` — Evacuation Camps and Capacity Tracking
- `ml_backend/database/models/resource.py` — Relief Stockpiles and Logistics Assets
- `ml_backend/database/models/responder.py` — Rescue Personnel, SDRF/NDRF, and Volunteers
- `ml_backend/database/models/prediction.py` — AI/ML Disaster Risk and Hazard Forecasts
- `ml_backend/database/models/alert.py` — Early Warning Public Broadcasts
- `ml_backend/database/models/audit.py` — Immutable System Audit and Compliance Logs

---

## 1. Quick Bootstrap (Development & Testing)

For local development or testing without running full migration histories, you can initialize the complete schema directly using the built-in database helper:

```python
from ml_backend.database import init_db

# Create all tables if they do not exist
init_db()

# Or reset and rebuild cleanly
init_db(drop_first=True)
```

You can also run this directly from the command line:

```bash
python3 -c "import sys; sys.path.insert(0, '.'); from ml_backend.database import init_db; init_db()"
```

---

## 2. Using Alembic for Production Migrations

Alembic manages incremental schema migrations.

### Initializing Alembic (First time setup)

```bash
cd ml_backend
alembic init migrations
```

In `alembic.ini`, set the database connection URL:

```ini
sqlalchemy.url = sqlite:///disaster_management.db
# or for PostgreSQL:
# sqlalchemy.url = postgresql://user:password@localhost:5432/disaster_db
```

In `migrations/env.py`, import the platform model metadata:

```python
from ml_backend.database.models import Base
target_metadata = Base.metadata
```

### Creating a New Migration Revision

Whenever you add or modify columns/tables in `ml_backend/database/models/`:

```bash
# Auto-detect model changes against live database
alembic revision --autogenerate -m "add_disaster_models"
```

Inspect the newly generated file under `migrations/versions/` to verify column types, constraints, and indexes.

### Applying Migrations

```bash
# Upgrade database to latest revision
alembic upgrade head

# Upgrade by one step
alembic upgrade +1
```

### Reverting Migrations

```bash
# Roll back previous migration step
alembic downgrade -1

# Roll back to specific revision
alembic downgrade <revision_id>
```

---

## 3. Best Practices

1. **UUID Primary Keys**: All platform entities use 36-character UUID strings for secure, distributed IDs and offline mobile client sync.
2. **Soft Deletes**: Entities with `SoftDeleteMixin` (`is_deleted=True`, `deleted_at=timestamp`) preserve history for auditing and legal compliance.
3. **Cross-Database JSON**: `JSONType` stores structured objects (media arrays, coordinates, sensor payloads) seamlessly across SQLite, PostgreSQL, and MySQL.
4. **Spatial Indexing**: Geolocation coordinates (`latitude`, `longitude`) are indexed with composite bounding boxes for efficient fast radius queries.
