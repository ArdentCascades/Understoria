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
#   --include-env <file>  seal a copy of this node's .env onto the
#                         drive (private/env.sealed), encrypted under a
#                         passphrase you choose now (openssl aes-256,
#                         PBKDF2). Turns the crisis-time install into
#                         restore mode: plug in, run START-HERE.sh,
#                         type the passphrase, node up — zero
#                         questions. THE DRIVE + PASSPHRASE = THE NODE:
#                         store them separately, like a recovery kit
#                         (threat-model §7). Non-secret values (domain,
#                         operator contact) are read to personalize the
#                         printed emergency sheet.
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
INCLUDE_ENV=""
SKIP_IMAGES=0
while [ $# -gt 0 ]; do
  case "$1" in
    --sign)
      [ $# -ge 2 ] || fail "--sign needs a key path"
      SIGN_KEY="$2"; shift 2 ;;
    --include-env)
      [ $# -ge 2 ] || fail "--include-env needs a path (usually .env)"
      INCLUDE_ENV="$2"; shift 2 ;;
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
[ -n "$OUT_BASE" ] || fail "usage: scripts/make-flash-drive.sh <output-dir> [--sign <ssh-key>] [--include-env <file>] [--skip-images]"
[ -z "$SIGN_KEY" ] || [ -f "$SIGN_KEY" ] || fail "Signing key not found: $SIGN_KEY"
[ -z "$INCLUDE_ENV" ] || [ -f "$INCLUDE_ENV" ] || fail "Env file not found: $INCLUDE_ENV"
if [ -n "$INCLUDE_ENV" ]; then
  command -v openssl >/dev/null 2>&1 \
    || fail "--include-env needs openssl (to seal the env under your passphrase)."
fi

VERSION="${UNDERSTORIA_VERSION:-0.3.0}"
OUT="$OUT_BASE/UNDERSTORIA"
mkdir -p "$OUT"/{images,compose,install,source,docs}

# Non-secret values for the emergency sheet + README personalization.
# DOMAIN and OPERATOR_CONTACT are public (every member sees them);
# only they are read here — the env is otherwise touched solely by
# the sealed-encryption step below.
ENV_DOMAIN=""
ENV_CONTACT=""
if [ -n "$INCLUDE_ENV" ]; then
  ENV_DOMAIN="$(sed -n 's/^DOMAIN=//p' "$INCLUDE_ENV" | head -n1)"
  ENV_CONTACT="$(sed -n 's/^OPERATOR_CONTACT=//p' "$INCLUDE_ENV" | head -n1)"
fi

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

# ─── 4. Installer + friendly entry points ────────────────────────────
cp scripts/setup-offline.sh "$OUT/install/setup-offline.sh"
chmod +x "$OUT/install/setup-offline.sh"

# START-HERE.sh: the ONE thing a stranger has to type. Everything
# else (restore mode, questions, docker load) lives behind it.
cat > "$OUT/START-HERE.sh" <<'EOF'
#!/usr/bin/env bash
# Understoria flash drive — start here.
# This walks you through everything; each question explains itself.
exec bash "$(dirname "$0")/install/setup-offline.sh" "$@"
EOF
chmod +x "$OUT/START-HERE.sh"

# verify.sh: sha256sum -c behind a sentence a stranger can act on.
cat > "$OUT/verify.sh" <<'EOF'
#!/usr/bin/env bash
# Check that this Understoria drive is intact (nothing corrupted or
# tampered with since it was built).
cd "$(dirname "$0")"
if sha256sum -c MANIFEST.txt --quiet 2>/dev/null; then
  printf '\n  \342\234\223 This drive is intact. Every file matches the manifest.\n'
  if [ -f MANIFEST.txt.sig ]; then
    printf '  The manifest is also SIGNED - see README.txt to check who built it.\n'
  fi
  exit 0
else
  printf '\n  \342\234\227 Something is wrong - a file does not match the manifest.\n'
  printf '  Do NOT use this drive. Ask whoever built it for a fresh copy.\n'
  printf '  (Details: run  sha256sum -c MANIFEST.txt  to see which file.)\n'
  exit 1
fi
EOF
chmod +x "$OUT/verify.sh"
ok "Installer + START-HERE.sh + verify.sh written."

# ─── 4b. Sealed env (restore mode) ───────────────────────────────────
if [ -n "$INCLUDE_ENV" ]; then
  mkdir -p "$OUT/private"
  if [ -n "${DRIVE_ENV_PASSPHRASE:-}" ]; then
    # Non-interactive path (tests/CI). Interactive builds never take
    # the passphrase from the environment.
    pass1="$DRIVE_ENV_PASSPHRASE"
  else
    say ""
    say "Choose the passphrase that will unlock this drive's sealed"
    say "server keys at restore time. THE DRIVE + THIS PASSPHRASE ="
    say "THE NODE — store them separately, and give the passphrase to"
    say "the people who would rebuild the server without you."
    printf 'Passphrase: '
    IFS= read -rs pass1; printf '\n'
    printf 'Same passphrase again: '
    IFS= read -rs pass2; printf '\n'
    [ "$pass1" = "$pass2" ] || fail "Passphrases did not match."
    [ -n "$pass1" ] || fail "Empty passphrase refused."
  fi
  printf '%s' "$pass1" | openssl enc -aes-256-cbc -pbkdf2 -iter 200000 -salt \
    -in "$INCLUDE_ENV" -out "$OUT/private/env.sealed" -pass stdin \
    || fail "Sealing the env failed."
  unset pass1 pass2
  cat > "$OUT/private/README.txt" <<'EOF'
env.sealed holds this community's server keys, encrypted under the
passphrase chosen when the drive was built. START-HERE.sh uses it to
restore the server with zero questions. Without the passphrase this
file is unreadable — and without this file, the passphrase is
nothing. Keep drive and passphrase apart.
EOF
  ok "Sealed env written (private/env.sealed) — restore mode armed."
fi

# ─── 4c. Emergency sheet (print this, tape it in the go-bag) ─────────
cat > "$OUT/EMERGENCY-SHEET.txt" <<EOF
================================================================
   REBUILDING THE COMMUNITY SERVER  —  EMERGENCY SHEET
   ${ENV_DOMAIN:+Community: $ENV_DOMAIN}
   ${ENV_CONTACT:+If you get stuck, try to reach: $ENV_CONTACT}
   Print this page and keep it with the flash drive.
================================================================

YOU NEED
  [ ] This flash drive
  [ ] A Linux computer with Docker already on it
      (the go-bag machine — it was prepared in good times)
  [ ] Power for it (wall, car inverter, or battery bank)
$( [ -n "$INCLUDE_ENV" ] && printf '  [ ] The drive passphrase (stored separately from the drive)\n' )

STEPS
  1. Plug the drive into the computer and open a terminal.
     (On most systems the drive appears under /media — for example
      /media/usb or /media/<your-name>/<drive-name>.)

  2. Type this one line and press Enter:

        bash /media/*/UNDERSTORIA/START-HERE.sh

     (If that path isn't found, open the drive in the file manager,
      note the folder it opened, and use that path instead.)

$( if [ -n "$INCLUDE_ENV" ]; then cat <<'RESTEOF'
  3. When asked, type the drive passphrase. That is the only
     question — the server keys, address, and settings are all on
     the drive. Wait for "Services started."
RESTEOF
else cat <<'FRESHEOF'
  3. Answer the questions as they come — each one explains itself
     and pressing Enter accepts the suggested answer.
FRESHEOF
fi )

  4. SUCCESS LOOKS LIKE: the script prints "Services started."
     Phones on the server's network can then open the community's
     address and everything works — see docs/offline-resilience.md
     (on this drive) for the WiFi + naming pattern.

  5. If anything on this sheet did not work, find the most
     technical person nearby and hand them README.txt on this
     drive — it has the longer version.
================================================================
EOF
ok "Emergency sheet written."

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

START HERE
  In a hurry? EMERGENCY-SHEET.txt is the one-page version — print
  it in good times and keep it with this drive.

  On the target machine (Linux, with Docker + the compose plugin
  already installed — install those in good times):
        bash START-HERE.sh
$( if [ -n "$INCLUDE_ENV" ]; then cat <<'RESTEOF'
  This drive carries the community's SEALED server keys
  (private/env.sealed): START-HERE asks for the drive passphrase and
  restores the server with no other questions. Drive + passphrase =
  the node — keep them apart.
RESTEOF
else cat <<'FRESHEOF'
  It loads the packed images, unpacks the source, and walks you
  through setup. Answers are explained as they come.
FRESHEOF
fi )
  Phones then install the app FROM the node — see
  docs/offline-resilience.md section 4 (the storm hub) for the
  WiFi + local DNS pattern that makes installed apps just work.

VERIFY THIS DRIVE
  Anyone can check the drive wasn't corrupted or tampered with:
        bash verify.sh
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
