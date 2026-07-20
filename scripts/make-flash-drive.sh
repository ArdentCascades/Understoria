#!/usr/bin/env bash
#
# Build an Understoria flash drive: everything a community needs to
# provision (or rebuild) a node on a machine with NO internet at
# install time. Run this in good times, with internet, from a healthy
# checkout. The full design and the drive's honest limits (the
# born-offline TLS gap, non-goals) live in docs/flash-drive-install.md.
#
# Usage:
#   scripts/make-flash-drive.sh <output-dir> [options]
#
#   <output-dir>          the drive's mount point (or any directory —
#                         copy it to a drive afterwards). A layout is
#                         created under <output-dir>/UNDERSTORIA/.
#   --sign <ssh-key>      sign MANIFEST.txt with this SSH private key
#                         (ssh-keygen -Y sign). Verification command is
#                         printed into README.txt.
#   --skip-images         skip the Docker build/save steps (dry runs,
#                         CI, or refreshing docs/source on an existing
#                         drive). The result canNOT provision a node.
#
# Output layout (FAT32/exFAT-safe: no colons, no symlinks):
#   UNDERSTORIA/
#     README.txt                       quickstart + verify + upgrade
#     MANIFEST.txt[.sig]               SHA256 of every file (+ signature)
#     images/  understoria-web-<ver>.tar, understoria-server-<ver>.tar,
#              caddy-2.8-alpine.tar    (docker save output)
#     compose/ docker-compose.yml, env.template
#     install/ setup-offline.sh        (drive-side entry point)
#     source/  understoria-source.tar.gz, understoria.bundle, ...
#              (scripts/pack-source.sh output — the drive distributes
#               binaries, so it distributes Corresponding Source,
#               AGPL-3.0 §13)
#     docs/    the operator + resilience documentation set
#
# Printable paper kit: the /print/* pages are app routes; print them
# from the running node in good times (README.txt says how). Headless
# pre-rendering into docs/paper/ is a tracked follow-up
# (docs/flash-drive-install.md §4).

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

say()  { printf '%s\n' "$*"; }
ok()   { printf '✓ %s\n' "$*"; }
warn() { printf '! %s\n' "$*" >&2; }
fail() { printf '✗ %s\n' "$*" >&2; exit 1; }

OUT_BASE=""
SIGN_KEY=""
SKIP_IMAGES=0
while [ $# -gt 0 ]; do
  case "$1" in
    --sign)
      [ $# -ge 2 ] || fail "--sign needs a key path"
      SIGN_KEY="$2"; shift 2 ;;
    --skip-images) SKIP_IMAGES=1; shift ;;
    --help|-h)
      sed -n '2,/^set -euo/p' "$0" | sed -e 's/^# \{0,1\}//' -e 's/^set -euo pipefail//'
      exit 0 ;;
    -*) fail "Unknown option: $1" ;;
    *)
      [ -z "$OUT_BASE" ] || fail "Only one output dir, please."
      OUT_BASE="$1"; shift ;;
  esac
done
[ -n "$OUT_BASE" ] || fail "usage: scripts/make-flash-drive.sh <output-dir> [--sign <ssh-key>] [--skip-images]"
[ -z "$SIGN_KEY" ] || [ -f "$SIGN_KEY" ] || fail "Signing key not found: $SIGN_KEY"

VERSION="${UNDERSTORIA_VERSION:-0.3.0}"
OUT="$OUT_BASE/UNDERSTORIA"
mkdir -p "$OUT"/{images,compose,install,source,docs}

# ─── 1. Images ───────────────────────────────────────────────────────
if [ "$SKIP_IMAGES" -eq 1 ]; then
  warn "--skip-images: the drive will NOT be able to provision a node."
else
  command -v docker >/dev/null 2>&1 || fail "docker not found."
  docker info >/dev/null 2>&1 || fail "docker daemon not reachable."
  say "Building images at version $VERSION (this is the slow part)..."
  # DOMAIN is only compose interpolation here, never baked into an
  # image (the web image's one build arg is the build stamp).
  VITE_BUILD_STAMP="$(git rev-parse --short HEAD 2>/dev/null || echo drive)" \
    DOMAIN="drive.invalid" ACME_EMAIL="drive@drive.invalid" \
    docker compose build web understoria \
    || fail "docker compose build failed. Run it directly to see the error."
  docker pull caddy:2.8-alpine >/dev/null \
    || fail "Could not pull caddy:2.8-alpine."
  say "Saving image tars..."
  docker save -o "$OUT/images/understoria-web-$VERSION.tar" "understoria/web:$VERSION"
  docker save -o "$OUT/images/understoria-server-$VERSION.tar" "understoria/server:$VERSION"
  docker save -o "$OUT/images/caddy-2.8-alpine.tar" caddy:2.8-alpine
  ok "Images saved."
fi

# ─── 2. Corresponding Source (AGPL §13) ──────────────────────────────
say "Packing Corresponding Source..."
scripts/pack-source.sh "$OUT/source" >/dev/null
ok "Source pack written (tarball$( [ -f "$OUT/source/understoria.bundle" ] && echo " + git bundle" ))."

# ─── 3. Compose + env template ───────────────────────────────────────
cp docker-compose.yml "$OUT/compose/docker-compose.yml"
cat > "$OUT/compose/env.template" <<EOF
# Understoria .env template (flash-drive edition).
# setup.sh asks for all of this interactively — you normally never
# edit this file by hand. It exists so the drive documents every
# field even where no interactive run is possible.

# Your community's web address. For a storm hub this is the REAL
# domain (the hub's local DNS answers it) — see
# docs/offline-resilience.md §4.
DOMAIN=

# Let's Encrypt expiry-notice address (unused while offline; cert
# renewal needs internet — the ~90-day offline runway is documented
# in docs/offline-resilience.md §4).
ACME_EMAIL=

# Unique, permanent per-node id (letters, digits, _ and -).
NODE_ID=

# Bundled Caddy fronts the server on the compose network.
TRUST_PROXY=true

# Generated by setup.sh (encryption at rest / founder-claim code /
# auto-confirm signing key). Leave blank; setup.sh fills them.
DATABASE_KEY=
SETUP_TOKEN=
NODE_SYSTEM_SECRET_KEY=

AUTO_CONFIRM_MIN_HOURS=168

OPERATOR_NAME=
OPERATOR_CONTACT=
OPERATOR_FUNDING_NOTE=

UNDERSTORIA_VERSION=$VERSION
RATE_LIMIT_MAX=60
LOG_LEVEL=info
LOG_REQUEST_PATHS=false

PEER_NODE_URLS=

# Storm-hub rebuilds: where this node's cert material is backed up
# (so a rebuilt hub can serve the community's real domain offline).
# Purely a note to your future self — nothing reads this variable.
# CERT_BACKUP_LOCATION=
EOF
ok "Compose + env template written."

# ─── 4. Installer ────────────────────────────────────────────────────
cp scripts/setup-offline.sh "$OUT/install/setup-offline.sh"
chmod +x "$OUT/install/setup-offline.sh"
ok "Installer copied."

# ─── 5. Docs ─────────────────────────────────────────────────────────
for d in flash-drive-install.md offline-resilience.md operator-guide.md \
         deploy-alternatives.md deploy-linode.md bootstrap-from-a-node.md \
         community-reseed.md member-guide.md operator-powers.md; do
  [ -f "docs/$d" ] && cp "docs/$d" "$OUT/docs/$d"
done
ok "Docs copied."

# ─── 6. README ───────────────────────────────────────────────────────
cat > "$OUT/README.txt" <<EOF
UNDERSTORIA FLASH DRIVE
=======================
Built $(date -u +%Y-%m-%d) from version $VERSION$(git rev-parse --short HEAD >/dev/null 2>&1 && echo ", commit $(git rev-parse --short HEAD)").

This drive provisions an Understoria community node on a Linux
machine with Docker installed — no internet needed at install time.

QUICKSTART
  1. On the target machine (Linux, with Docker + the compose plugin
     already installed — install those in good times):
        bash install/setup-offline.sh
     It loads the packed images, unpacks the source, and walks you
     through setup. Answers are explained as they come.
  2. Phones then install the app FROM the node — see
     docs/offline-resilience.md section 4 (the storm hub) for the
     WiFi + local DNS pattern that makes installed apps just work.

VERIFY THIS DRIVE
  Anyone can check the drive wasn't corrupted or tampered with:
        cd UNDERSTORIA && sha256sum -c MANIFEST.txt
$(if [ -n "$SIGN_KEY" ]; then cat <<'SIGEOF'
  This drive's manifest is SIGNED. To verify who built it, get the
  builder's SSH public key through a channel you trust, then:
        echo "builder KEY-TYPE PUBLIC-KEY" > allowed_signers
        ssh-keygen -Y verify -f allowed_signers -I builder \
          -n understoria-drive -s MANIFEST.txt.sig < MANIFEST.txt
SIGEOF
else
  printf '  (This drive is unsigned — checksums prove integrity, not\n   who built it. Ask the person who handed it to you.)\n'
fi)

UPGRADE AN EXISTING NODE FROM THIS DRIVE
  docker load -i images/<each .tar>   then, in the node's directory:
  docker compose up -d
  The full source (and git history bundle) is in source/.

PRINTABLE PAPER KIT
  The invite posters, storm-hub WiFi sign, and wallet cards are pages
  the running app serves — open the node's /print pages from any
  browser on its network and print them in good times.

HONEST LIMITS (docs/flash-drive-install.md section 5)
  A node that has NEVER been online cannot hold a browser-trusted
  HTTPS certificate, and phones require HTTPS to install the app.
  This drive is for good-times provisioning and mid-outage rebuilds
  of a node whose certificate material is backed up.
EOF
ok "README written."

# ─── 7. Manifest (+ optional signature) ──────────────────────────────
say "Writing manifest..."
( cd "$OUT" && find . -type f ! -name 'MANIFEST.txt*' -print0 \
    | sort -z | xargs -0 sha256sum ) > "$OUT/MANIFEST.txt"
if [ -n "$SIGN_KEY" ]; then
  ssh-keygen -Y sign -f "$SIGN_KEY" -n understoria-drive "$OUT/MANIFEST.txt" \
    || fail "Manifest signing failed."
  ok "Manifest signed (MANIFEST.txt.sig)."
else
  ok "Manifest written (unsigned)."
fi

say ""
ok "Drive built at $OUT"
say "  Size: $(du -sh "$OUT" 2>/dev/null | cut -f1)"
say "  Next: copy UNDERSTORIA/ to a FAT32/exFAT drive, then run the"
say "  provision drill (docs/flash-drive-install.md §6) before you"
say "  depend on it."
