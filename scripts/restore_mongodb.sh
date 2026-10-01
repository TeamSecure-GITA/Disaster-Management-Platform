#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# scripts/restore_mongodb.sh
#
# Production MongoDB Restore Script
# Restores a gzip-compressed mongodump archive created by backup_mongodb.sh
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

if [ "$#" -lt 1 ]; then
    echo "Usage: $0 <path_to_backup_archive.gz> [MONGO_URI]" >&2
    echo "Example: $0 /backups/mongodb/dmp_backup_20261001_120000.archive.gz mongodb://localhost:27017/disaster_management" >&2
    exit 1
fi

ARCHIVE_PATH="$1"
MONGO_URI="${2:-${MONGO_URI:-mongodb://localhost:27017/disaster_management}}"

if [ ! -f "${ARCHIVE_PATH}" ]; then
    echo "ERROR: Backup file not found: ${ARCHIVE_PATH}" >&2
    exit 1
fi

echo "=========================================================="
echo "WARNING: Restoring MongoDB from archive:"
echo "Archive: ${ARCHIVE_PATH}"
echo "Target URI: ${MONGO_URI}"
echo "=========================================================="

if command -v mongorestore >/dev/null 2>&1; then
    mongorestore --uri="${MONGO_URI}" --archive="${ARCHIVE_PATH}" --gzip --drop
elif command -v docker >/dev/null 2>&1; then
    DIRNAME=$(dirname "$(realpath "${ARCHIVE_PATH}")")
    BASENAME=$(basename "${ARCHIVE_PATH}")
    docker run --rm --network host -v "${DIRNAME}:/backup" mongo:8 \
        mongorestore --uri="${MONGO_URI}" --archive="/backup/${BASENAME}" --gzip --drop
else
    echo "ERROR: Neither mongorestore nor docker CLI found in PATH." >&2
    exit 1
fi

echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] Restore completed successfully!"
