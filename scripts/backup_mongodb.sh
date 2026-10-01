#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# scripts/backup_mongodb.sh
#
# Production MongoDB Automated Backup Script
# - Creates gzip-compressed mongodump archive with timestamp
# - Automatically rotates and purges backups older than RETENTION_DAYS (default: 7)
# - Compatible with local execution, cron, and Docker backup sidecars
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/backups/mongodb}"
MONGO_URI="${MONGO_URI:-mongodb://localhost:27017/disaster_management}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
TIMESTAMP="$(date +'%Y%m%d_%H%M%S')"
BACKUP_FILE="${BACKUP_DIR}/dmp_backup_${TIMESTAMP}.archive.gz"

mkdir -p "${BACKUP_DIR}"

echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] Starting MongoDB backup to ${BACKUP_FILE}..."

if command -v mongodump >/dev/null 2>&1; then
    mongodump --uri="${MONGO_URI}" --archive="${BACKUP_FILE}" --gzip
elif command -v docker >/dev/null 2>&1; then
    echo "Host mongodump not found. Running via Docker mongo:8 container..."
    docker run --rm --network host -v "${BACKUP_DIR}:/backup" mongo:8 \
        mongodump --uri="${MONGO_URI}" --archive="/backup/dmp_backup_${TIMESTAMP}.archive.gz" --gzip
else
    echo "ERROR: Neither mongodump nor docker CLI found in PATH." >&2
    exit 1
fi

FILE_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] Backup completed successfully! Archive size: ${FILE_SIZE}"

# Prune archives older than RETENTION_DAYS
echo "Applying retention policy: cleaning archives older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -type f -name "dmp_backup_*.archive.gz" -mtime +"${RETENTION_DAYS}" -exec rm -f {} + || true

echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] Rotation complete. Current backups in ${BACKUP_DIR}:"
ls -lh "${BACKUP_DIR}"
