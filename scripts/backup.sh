#!/bin/bash

# ORIGIN Database Backup Script
# Usage: ./backup.sh [daily|weekly|manual]
# Requires: pg_dump, aws cli or rclone

set -euo pipefail

# Configuration
BACKUP_TYPE="${1:-daily}"
BACKUP_DIR="/tmp/origin-backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="origin_${BACKUP_TYPE}_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=30

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"; }
warn() { echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"; }
error() { echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"; exit 1; }

# Validate environment
[[ -z "${DATABASE_URL:-}" ]] && error "DATABASE_URL not set"
[[ -z "${BACKUP_S3_BUCKET:-}" ]] && warn "BACKUP_S3_BUCKET not set, skipping S3 upload"

# Create backup directory
mkdir -p "$BACKUP_DIR"

log "Starting $BACKUP_TYPE backup..."

# Dump database
log "Dumping database..."
pg_dump "$DATABASE_URL" \
  --no-owner \
  --no-privileges \
  --clean \
  --if-exists \
  --format=plain \
  | gzip > "$BACKUP_DIR/$BACKUP_FILE"

BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
log "Backup created: $BACKUP_FILE ($BACKUP_SIZE)"

# Verify backup integrity
log "Verifying backup integrity..."
if gzip -t "$BACKUP_DIR/$BACKUP_FILE"; then
  log "Backup integrity verified"
else
  error "Backup integrity check failed!"
fi

# Upload to S3/R2
if [[ -n "${BACKUP_S3_BUCKET:-}" ]]; then
  log "Uploading to S3: $BACKUP_S3_BUCKET"
  
  if command -v aws &> /dev/null; then
    aws s3 cp "$BACKUP_DIR/$BACKUP_FILE" \
      "s3://$BACKUP_S3_BUCKET/backups/$BACKUP_FILE" \
      --storage-class STANDARD_IA \
      --sse AES256
    log "S3 upload complete"
  elif command -v rclone &> /dev/null; then
    rclone copy "$BACKUP_DIR/$BACKUP_FILE" \
      "r2:origin-backups/backups/$BACKUP_FILE"
    log "R2 upload complete"
  else
    warn "Neither aws cli nor rclone found, skipping upload"
  fi
fi

# Cleanup old local backups
log "Cleaning up old local backups (>${RETENTION_DAYS} days)..."
find "$BACKUP_DIR" -name "origin_*_*.sql.gz" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true

# Cleanup old remote backups
if [[ -n "${BACKUP_S3_BUCKET:-}" ]] && command -v aws &> /dev/null; then
  log "Cleaning up old S3 backups (>${RETENTION_DAYS} days)..."
  CUTOFF_DATE=$(date -d "-${RETENTION_DAYS} days" +%Y%m%d 2>/dev/null || date -v-${RETENTION_DAYS}d +%Y%m%d)
  
  aws s3 ls "s3://$BACKUP_S3_BUCKET/backups/" | while read -r line; do
    createDate=$(echo "$line" | awk '{print $1}' | tr -d '-')
    fileName=$(echo "$line" | awk '{print $4}')
    if [[ "$createDate" < "$CUTOFF_DATE" ]]; then
      aws s3 rm "s3://$BACKUP_S3_BUCKET/backups/$fileName"
      log "Deleted old backup: $fileName"
    fi
  done
fi

log "Backup complete!"

# Weekly restore test
if [[ "$BACKUP_TYPE" == "weekly" ]]; then
  log "Running weekly restore test..."
  TEST_DB="origin_backup_test_$(date +%s)"
  
  createdb "$TEST_DB" 2>/dev/null || true
  gunzip -c "$BACKUP_DIR/$BACKUP_FILE" | psql -d "$TEST_DB" -q
  
  TABLE_COUNT=$(psql -d "$TEST_DB" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'" | tr -d ' ')
  
  dropdb "$TEST_DB" 2>/dev/null || true
  
  if [[ "$TABLE_COUNT" -gt 0 ]]; then
    log "Restore test passed ($TABLE_COUNT tables)"
  else
    error "Restore test failed - no tables found"
  fi
fi
