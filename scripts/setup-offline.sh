#!/usr/bin/env bash
#
# Drive-side installer: provision an Understoria node from a flash
# drive built by scripts/make-flash-drive.sh — no internet needed.
# This file lives in the repo at scripts/setup-offline.sh and is
# copied onto the drive as install/setup-offline.sh; it expects the
# drive layout around it (../images, ../source, ../compose).
#
# Usage (from the mounted drive):
#   bash install/setup-offline.sh [target-dir]
#
#   target-dir   writable directory the node will live in
#                (default: $HOME/understoria). The drive itself is
#                typically read-only/FAT — the node never runs from it.
#
# What it does:
#   1. Checks Docker + compose exist (install those in good times —
#      Docker is the one thing the drive can't carry for every distro).
#   2. `docker load`s the packed images — this replaces both the
#      npm-installing `compose build` and the caddy registry pull.
#   3. Unpacks the Corresponding Source into the target dir (that
#      tree IS the repo: compose file, scripts, docs).
#   4. Hands off to scripts/setup.sh --offline for the interactive
#      part (keys, .env, launch) with every network touch skipped.
#
# Re-runnable: loading the same images and re-extracting the same
# source are no-ops in effect, and setup.sh guards its own .env.

set -euo pipefail

say()  { printf '%s\n' "$*"; }
ok()   { printf '✓ %s\n' "$*"; }
fail() { printf '✗ %s\n' "$*" >&2; exit 1; }

DRIVE_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TARGET="${1:-$HOME/understoria}"

# Glob check, not just -d: a --skip-images drive has the directory
# but no tars, and should fail with this message on ANY machine —
# before the Docker checks get a chance to mislead.
have_images=0
for tar in "$DRIVE_ROOT"/images/*.tar; do
  [ -e "$tar" ] && { have_images=1; break; }
done
[ "$have_images" -eq 1 ] \
  || fail "No image tars in images/ next to this script — is this a drive built by make-flash-drive.sh? (A --skip-images drive cannot provision a node.)"
[ -f "$DRIVE_ROOT/source/understoria-source.tar.gz" ] \
  || fail "No source/understoria-source.tar.gz on the drive."

command -v docker >/dev/null 2>&1 \
  || fail "docker not found. Install Docker first (in good times: see docs/deploy-alternatives.md on this drive)."
docker compose version >/dev/null 2>&1 \
  || fail "docker compose plugin not found. Install docker-compose-plugin."
docker info >/dev/null 2>&1 \
  || fail "docker daemon not reachable. Try: sudo systemctl start docker (or run as root)."
ok "Docker + compose look healthy."

say "Loading packed images (no network needed)..."
found_tar=0
for tar in "$DRIVE_ROOT"/images/*.tar; do
  [ -e "$tar" ] || continue
  found_tar=1
  say "  docker load < $(basename "$tar")"
  docker load -i "$tar" >/dev/null || fail "docker load failed for $tar"
done
[ "$found_tar" -eq 1 ] || fail "images/ directory is empty."
ok "Images loaded."

say "Unpacking source into $TARGET ..."
mkdir -p "$TARGET"
tar -xzf "$DRIVE_ROOT/source/understoria-source.tar.gz" -C "$TARGET"
ok "Source unpacked."

say ""
say "Handing off to the interactive setup (offline mode)..."
say ""
cd "$TARGET"
exec bash scripts/setup.sh --offline
