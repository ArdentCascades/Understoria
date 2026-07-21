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

# ─── Restore mode (sealed env on the drive) ──────────────────────────
#
# A drive built with --include-env carries the community's server
# keys encrypted under a passphrase (private/env.sealed). Restoring
# is then the WHOLE install: decrypt .env, start the services. Zero
# questions — the crisis-time path a non-technical person can walk
# with the emergency sheet. Declining (or a missing sealed env)
# falls through to the normal interactive setup.
if [ -f "$DRIVE_ROOT/private/env.sealed" ]; then
  command -v openssl >/dev/null 2>&1 \
    || fail "openssl not found — needed to unseal this drive's server keys."
  say ""
  say "This drive carries the community's sealed server keys."
  say "Restoring with them brings the server back exactly as it was"
  say "— no questions. You need the drive passphrase (it was chosen"
  say "when the drive was built, and stored separately from it)."
  printf 'Restore using the sealed keys? [Y/n]: '
  IFS= read -r answer || true
  if [ "$answer" != "n" ] && [ "$answer" != "N" ]; then
    attempt=0
    while :; do
      attempt=$((attempt + 1))
      printf 'Drive passphrase: '
      IFS= read -rs pass; printf '\n'
      if printf '%s' "$pass" | openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 \
           -in "$DRIVE_ROOT/private/env.sealed" -out "$TARGET/.env.tmp" \
           -pass stdin 2>/dev/null; then
        unset pass
        break
      fi
      rm -f "$TARGET/.env.tmp"
      if [ "$attempt" -ge 3 ]; then
        say "Still not matching. You can try again later, or continue"
        say "with the fresh interactive setup instead."
        printf 'Try the passphrase again? [Y/n]: '
        IFS= read -r again || true
        if [ "$again" = "n" ] || [ "$again" = "N" ]; then
          unset pass
          say "Continuing to interactive setup (the sealed keys stay on the drive, untouched)."
          break
        fi
        attempt=0
      else
        say "That passphrase didn't unlock it — check for typos and try again."
      fi
    done
    if [ -f "$TARGET/.env.tmp" ]; then
      mv "$TARGET/.env.tmp" "$TARGET/.env"
      chmod 600 "$TARGET/.env"
      ok "Server keys restored (.env, chmod 600)."
      cd "$TARGET"
      say "Starting services from the pre-loaded images..."
      docker compose up -d --no-build
      say ""
      ok "Services started."
      say ""
      say "SUCCESS. Phones on this server's network can open the"
      say "community's address once it resolves here — the WiFi +"
      say "local-DNS pattern is docs/offline-resilience.md §4 (a copy"
      say "is on this drive). Status: docker compose ps"
      exit 0
    fi
  fi
fi

say ""
say "Handing off to the interactive setup (offline mode)..."
say ""
cd "$TARGET"
exec bash scripts/setup.sh --offline
