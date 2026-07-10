#!/usr/bin/env bash
#
# Understoria SQLite backup. Takes the snapshot through SQLite's own
# machinery (`VACUUM INTO`, run with the server's bundled
# better-sqlite3-multiple-ciphers driver) so it's safe to run while
# the server is writing — better than `cp` of the .db file, which can
# produce a corrupt snapshot in the middle of a transaction.
#
# Works for BOTH deployment shapes:
#   - plaintext database: snapshot is a plain SQLite file.
#   - DATABASE_KEY set (encryption at rest): the stock `sqlite3` CLI
#     cannot even read the file, so the driver applies the key from
#     the container's own environment and `VACUUM INTO` writes the
#     snapshot ENCRYPTED WITH THE SAME KEY. Restoring needs that key —
#     escrow it somewhere that is NOT next to these backups, or the
#     snapshots are bricks (which is the point of a stolen copy, and
#     the end of you if you lose the key too).
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

# CONTAINER name of the running server. docker-compose.yml pins
# `container_name: understoria`, so this is fixed regardless of any
# `-p` compose project flag. Override with UNDERSTORIA_CONTAINER=foo
# if you changed container_name. (UNDERSTORIA_COMPOSE_PROJECT is
# still honored for existing crontabs — despite its old label it was
# always used as the container name.)
CONTAINER="${UNDERSTORIA_CONTAINER:-${UNDERSTORIA_COMPOSE_PROJECT:-understoria}}"

# Where snapshots land on the Linode disk.
BACKUP_DIR="${UNDERSTORIA_BACKUP_DIR:-/opt/understoria/backups}"

# Retention: how many daily snapshots to keep before pruning the oldest.
KEEP_DAYS="${UNDERSTORIA_BACKUP_KEEP_DAYS:-14}"

# ─── Snapshot ────────────────────────────────────────────────────────

timestamp=$(date -u +"%Y%m%dT%H%M%SZ")
mkdir -p "$BACKUP_DIR"
snapshot="$BACKUP_DIR/understoria-${timestamp}.db"

# Run the snapshot inside the container with the server's own SQLite
# driver (which understands the optional DATABASE_KEY encryption; the
# key is read from the container's environment and never appears on a
# command line or in this script's logs). `VACUUM INTO` takes a
# consistent read snapshot, so a mid-transaction state is never
# captured. We avoid `docker cp` of the raw file because the SQLite
# file may have an in-progress WAL checkpoint when we touch it.
#
# The temp snapshot goes under /data — the writable volume — NOT
# /tmp: the container runs with a read-only rootfs and /tmp is a
# small tmpfs mount, and `docker cp` cannot read out of a tmpfs
# mount, so a /tmp snapshot fails on every run of the documented
# stack. Must match the path inside the heredoc below.
TMP_SNAPSHOT="/data/.snapshot-tmp.db"
docker exec -i "${CONTAINER}" node - <<'JS'
const Database = require("better-sqlite3-multiple-ciphers");
const fs = require("fs");
// Clear any leftover from a previously failed run — VACUUM INTO
// refuses to write over an existing file.
fs.rmSync("/data/.snapshot-tmp.db", { force: true });
const db = new Database("/data/understoria.db", { readonly: true });
const key = process.env.DATABASE_KEY;
if (key) db.pragma(`key = '${key.replace(/'/g, "''")}'`);
db.exec("VACUUM INTO '/data/.snapshot-tmp.db'");
db.close();
JS
docker cp "${CONTAINER}:${TMP_SNAPSHOT}" "$snapshot"
docker exec "${CONTAINER}" rm -f "${TMP_SNAPSHOT}"

# Compress. Plaintext snapshots (SQLite + repeated blob fields)
# compress well; DATABASE_KEY snapshots are ciphertext and barely
# shrink — the gzip is kept anyway so every snapshot has the same
# .gz name and handling.
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
