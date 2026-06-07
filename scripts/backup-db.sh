#!/usr/bin/env bash
#
# Understoria SQLite backup. Uses `sqlite3 .backup` (online backup
# API) so it's safe to run while the server is writing — better than
# `cp` of the .db file, which can produce a corrupt snapshot in the
# middle of a transaction.
#
# Recommended cron (root crontab on the Linode):
#
#   0 4 * * * /opt/understoria/scripts/backup-db.sh >>/var/log/understoria-backup.log 2>&1
#
# Offsite step is left as a TODO at the bottom — pick rclone, B2, S3,
# Backblaze, restic, whatever. The local snapshot alone is NOT a
# backup; a single-disk Linode + ransomware = total loss.

set -euo pipefail

# ─── Configuration ───────────────────────────────────────────────────

# Compose project name used by `docker compose`. Override with
# UNDERSTORIA_COMPOSE_PROJECT=foo to match your `-p` flag.
PROJECT="${UNDERSTORIA_COMPOSE_PROJECT:-understoria}"

# Where snapshots land on the Linode disk.
BACKUP_DIR="${UNDERSTORIA_BACKUP_DIR:-/opt/understoria/backups}"

# Retention: how many daily snapshots to keep before pruning the oldest.
KEEP_DAYS="${UNDERSTORIA_BACKUP_KEEP_DAYS:-14}"

# ─── Snapshot ────────────────────────────────────────────────────────

timestamp=$(date -u +"%Y%m%dT%H%M%SZ")
mkdir -p "$BACKUP_DIR"
snapshot="$BACKUP_DIR/understoria-${timestamp}.db"

# Use the running container's sqlite3 to call `.backup`. We avoid
# `docker cp` of the raw file because the SQLite file may have an
# in-progress WAL checkpoint when we touch it.
docker exec "${PROJECT}" sh -c "sqlite3 /data/understoria.db \".backup /tmp/snapshot.db\""
docker cp "${PROJECT}:/tmp/snapshot.db" "$snapshot"
docker exec "${PROJECT}" rm -f /tmp/snapshot.db

# Compress; SQLite + repeated blob fields compress well.
gzip -9 "$snapshot"
echo "[$(date -u +%FT%TZ)] snapshot: ${snapshot}.gz ($(du -h "${snapshot}.gz" | cut -f1))"

# ─── Retention ───────────────────────────────────────────────────────

find "$BACKUP_DIR" -name 'understoria-*.db.gz' -type f -mtime "+${KEEP_DAYS}" \
  -print -delete

# ─── Offsite (TODO — pick one) ───────────────────────────────────────
#
# Uncomment and fill in ONE of the following blocks. Without an
# offsite step, this script protects only against accidental local
# deletion — NOT against disk failure, ransomware, or losing the box.
#
# # rclone to any provider:
# rclone copy "${snapshot}.gz" remote:understoria-backups/
#
# # Backblaze B2 via the b2 CLI:
# b2 upload-file my-bucket "${snapshot}.gz" "understoria/${timestamp}.db.gz"
#
# # AWS S3 via aws-cli:
# aws s3 cp "${snapshot}.gz" "s3://my-bucket/understoria/${timestamp}.db.gz"
