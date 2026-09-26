export const DATABASE_NAME = 'disaster_sentinel.db';
export const CURRENT_DB_VERSION = 1;

export const DB_SCHEMA_QUERIES = [
  `CREATE TABLE IF NOT EXISTS incidents (
    id TEXT PRIMARY KEY,
    title TEXT,
    category TEXT,
    severity TEXT,
    description TEXT,
    latitude REAL,
    longitude REAL,
    reported_by TEXT,
    reported_at TEXT,
    status TEXT,
    sync_status TEXT
  );`,
  `CREATE TABLE IF NOT EXISTS alerts (
    id TEXT PRIMARY KEY,
    title TEXT,
    message TEXT,
    hazard_type TEXT,
    severity TEXT,
    issued_at TEXT,
    expires_at TEXT,
    evacuation_mandatory INTEGER
  );`,
  `CREATE TABLE IF NOT EXISTS shelters (
    id TEXT PRIMARY KEY,
    name TEXT,
    latitude REAL,
    longitude REAL,
    address TEXT,
    capacity INTEGER,
    current_occupancy INTEGER,
    status TEXT
  );`,
  `CREATE TABLE IF NOT EXISTS risk_cache (
    zone_id TEXT PRIMARY KEY,
    probability REAL,
    risk_level TEXT,
    factor_of_safety REAL,
    updated_at TEXT
  );`,
  `CREATE TABLE IF NOT EXISTS family_members (
    id TEXT PRIMARY KEY,
    full_name TEXT,
    relation TEXT,
    phone TEXT,
    safety_status TEXT,
    last_known_lat REAL,
    last_known_lng REAL,
    last_check_in TEXT
  );`,
  `CREATE TABLE IF NOT EXISTS pending_sync (
    id TEXT PRIMARY KEY,
    action TEXT,
    endpoint TEXT,
    method TEXT,
    payload TEXT,
    created_at TEXT,
    retry_count INTEGER
  );`,
  `CREATE TABLE IF NOT EXISTS app_cache (
    cache_key TEXT PRIMARY KEY,
    value TEXT,
    expires_at INTEGER
  );`,
];
