# Backend Database Migrations Guide

This directory manages database schema migrations, revision tracking, and automated bootstrapping for the Disaster Management Platform backend.

## Schema Architecture

The database models are defined using **SQLAlchemy 2.0** ORM:
- `backend/database/models/user.py` / `ml_backend/database/models/user.py` — Users, Roles (Admin, Operator, Responder, Volunteer, Citizen)
- `incident.py` — Ground hazard reports, terrain metrics, verification lifecycle
- `sensor.py` — IoT telemetry stations and time-series readings with threshold alarms
- `shelter.py` — Evacuation centers, occupancy tracking, and facilities
- `resource.py` — Logistics stockpiles, relief rations, and emergency assets
- `responder.py` — NDRF/SDRF tactical rescue squads and field dispatch
- `prediction.py` — AI/ML hazard probability forecasts and impact estimates
- `alert.py` — Multi-channel emergency public safety broadcasts
- `audit.py` — Immutable compliance audit logs

---

## 1. Quick Bootstrap (Development & Testing)

To create or reset all database tables directly in development without running incremental migration scripts:

```bash
python3 -c "import sys; sys.path.insert(0, '.'); from backend.database import init_db; init_db()"
```

Or programmatically:

```python
from backend.database import init_db

# Create missing tables
init_db()

# Drop and recreate all tables
init_db(drop_first=True)
```

---

## 2. Production Migrations with Alembic

### Initialization

```bash
cd backend
alembic init migrations
```

Configure the connection string in `alembic.ini`:

```ini
sqlalchemy.url = sqlite:///disaster_management.db
# or for PostgreSQL:
# sqlalchemy.url = postgresql://user:password@localhost:5432/disaster_db
```

In `migrations/env.py`, bind the schema metadata:

```python
from backend.database.models import Base
target_metadata = Base.metadata
```

### Creating Revisions

```bash
# Auto-generate migration from ORM model diff
alembic revision --autogenerate -m "create_disaster_management_tables"
```

### Applying Migrations

```bash
# Upgrade database to latest revision
alembic upgrade head

# Revert previous revision
alembic downgrade -1
```

---

## 3. Design Standards

- **Distributed UUIDs**: All entities utilize 36-char UUID primary keys for secure offline synchronization.
- **Audited Soft Deletion**: Entities inherit `SoftDeleteMixin` (`is_deleted`, `deleted_at`) preserving evidence and historical logs.
- **Cross-Engine JSON**: `JSONType` supports nested objects and GeoJSON arrays identically across SQLite, Postgres, and MySQL.
- **Spatial Bounding Indexes**: Latitude and longitude columns are indexed for high-performance radius queries.
