"""
Database seeding package for Disaster Management Platform.
Provides canonical baseline data initialization and dynamic emergency demo scenario injection.
"""

from ml_backend.database.seed.demo_data import seed_demo_scenario
from ml_backend.database.seed.seed_data import (
    get_canonical_resources,
    get_canonical_responders,
    get_canonical_sensors,
    get_canonical_shelters,
    get_canonical_users,
    hash_password,
    seed_canonical_data,
)

__all__ = [
    "seed_canonical_data",
    "seed_demo_scenario",
    "get_canonical_users",
    "get_canonical_sensors",
    "get_canonical_shelters",
    "get_canonical_resources",
    "get_canonical_responders",
    "hash_password",
]
