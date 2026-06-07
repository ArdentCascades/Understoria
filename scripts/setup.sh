#!/usr/bin/env bash
#
# Interactive first-run setup for an Understoria community node.
#
# What this does:
#   1. Sanity-checks the environment (Docker, Compose, basic tools).
#   2. Prompts for the values that go in `.env`: domain, ACME email,
#      operator name + contact, auto-confirm hours, peer list.
#   3. Validates each value as it's entered (e-mail shape, domain
#      shape, optional DNS A-record check vs this host's public IP).
#   4. Builds the server image so the keygen helper can run in it.
#   5. Generates the `NODE_SYSTEM_SECRET_KEY` via the existing
#      `scripts/generate-system-key.mjs` (inside the built image so
#      there's no Node install required on the host).
#   6. Writes `.env` with `chmod 600`.
#   7. Optionally runs `docker compose up -d --build`.
#
# Why this exists:
#   Operators previously had to read the runbook, run the keygen by
#   hand, copy values into a text editor, and remember the chmod.
#   That's the wall this script lowers. The runbook still works the
#   long way for anyone who prefers it.
#
# Usage:
#   scripts/setup.sh                    interactive
#   scripts/setup.sh --skip-dns         interactive, no DNS check
#   scripts/setup.sh --help             usage
#
# Non-interactive mode (for CI / re-runs):
#   Set the corresponding env vars before running and the script
#   will not prompt for them: DOMAIN, ACME_EMAIL, OPERATOR_NAME,
#   OPERATOR_CONTACT, OPERATOR_FUNDING_NOTE, AUTO_CONFIRM_HOURS,
#   PEER_NODE_URLS, RATE_LIMIT_MAX, LOG_LEVEL.

set -euo pipefail

# ─── Helpers ─────────────────────────────────────────────────────────

# Always run from repo root so relative paths work regardless of how
# the script was invoked.
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

# Output styling — only when stdout is a TTY.
if [ -t 1 ]; then
  c_bold=$(printf '\033[1m')
  c_dim=$(printf '\033[2m')
  c_green=$(printf '\033[32m')
  c_yellow=$(printf '\033[33m')
  c_red=$(printf '\033[31m')
  c_off=$(printf '\033[0m')
else
  c_bold=""; c_dim=""; c_green=""; c_yellow=""; c_red=""; c_off=""
fi

say()   { printf '%s\n' "$*"; }
info()  { printf '%s%s%s\n' "$c_dim" "$*" "$c_off"; }
ok()    { printf '%s✓%s %s\n' "$c_green" "$c_off" "$*"; }
warn()  { printf '%s!%s %s\n' "$c_yellow" "$c_off" "$*" >&2; }
fail()  { printf '%s✗%s %s\n' "$c_red"    "$c_off" "$*" >&2; exit 1; }
ask() {
  # ask <prompt> <varname> [default]
  local prompt="$1" varname="$2" default="${3:-}" answer=""
  local existing="${!varname:-}"
  if [ -n "$existing" ]; then
    eval "$varname=\"\$existing\""
    info "$prompt: $existing  (from environment)"
    return
  fi
  if [ -n "$default" ]; then
    printf '%s%s%s [%s]: ' "$c_bold" "$prompt" "$c_off" "$default"
  else
    printf '%s%s%s: ' "$c_bold" "$prompt" "$c_off"
  fi
  IFS= read -r answer || true
  if [ -z "$answer" ] && [ -n "$default" ]; then
    answer="$default"
  fi
  eval "$varname=\"\$answer\""
}
confirm() {
  # confirm <prompt> — y to proceed, anything else to abort
  local prompt="$1" answer=""
  printf '%s%s%s [y/N]: ' "$c_bold" "$prompt" "$c_off"
  IFS= read -r answer || true
  [ "$answer" = "y" ] || [ "$answer" = "Y" ]
}

# ─── Args ────────────────────────────────────────────────────────────

SKIP_DNS=0
for arg in "$@"; do
  case "$arg" in
    --skip-dns) SKIP_DNS=1 ;;
    --help|-h)
      sed -n '2,/^set -euo/p' "$0" | sed -e 's/^# \{0,1\}//' -e 's/^set -euo pipefail//'
      exit 0 ;;
    *) fail "Unknown argument: $arg" ;;
  esac
done

# ─── Banner ──────────────────────────────────────────────────────────

say ""
say "${c_bold}Understoria — node setup${c_off}"
say "${c_dim}Runs from $REPO_ROOT${c_off}"
say ""

# ─── Prereq checks ───────────────────────────────────────────────────

command -v docker >/dev/null 2>&1 \
  || fail "docker not found. Install Docker first (see docs/deploy-linode.md §3)."
docker compose version >/dev/null 2>&1 \
  || fail "docker compose plugin not found. Install docker-compose-plugin."
docker info >/dev/null 2>&1 \
  || fail "docker daemon not reachable. Try: sudo systemctl start docker (or run this script as root)."
[ -f docker-compose.yml ] \
  || fail "docker-compose.yml not found in $REPO_ROOT. Are you in the repo root?"
[ -f .env.example ] \
  || fail ".env.example not found. The repo checkout is incomplete."

ok "Docker + Compose + repo checkout look healthy."

# ─── .env handling ───────────────────────────────────────────────────

if [ -f .env ]; then
  warn ".env already exists."
  if ! confirm "Overwrite the existing .env? (a backup will be saved)"; then
    say "Aborted. No changes made."
    exit 0
  fi
  backup=".env.backup.$(date -u +%Y%m%dT%H%M%SZ)"
  cp .env "$backup"
  chmod 600 "$backup"
  ok "Backed up existing .env → $backup"
fi

say ""
say "${c_bold}Step 1/4 — Domain and TLS${c_off}"
say ""

ask "Domain (e.g. understoria.example.org)" DOMAIN
[ -n "$DOMAIN" ] || fail "DOMAIN is required."
case "$DOMAIN" in
  *.*) : ;;
  *) fail "DOMAIN must be a fully-qualified domain name." ;;
esac

ask "ACME email (for Let's Encrypt expiry notices)" ACME_EMAIL
case "$ACME_EMAIL" in
  *@*.*) : ;;
  *) fail "ACME_EMAIL doesn't look like an e-mail address." ;;
esac

if [ "$SKIP_DNS" -eq 0 ]; then
  info "Checking DNS for $DOMAIN..."
  resolved="$(getent hosts "$DOMAIN" 2>/dev/null | awk '{print $1; exit}' || true)"
  if [ -z "$resolved" ]; then
    warn "DNS lookup for $DOMAIN returned nothing."
    warn "Caddy will fail to acquire a TLS cert until DNS resolves."
    confirm "Continue anyway?" || exit 1
  else
    # Best-effort host IP detection. We compare against the public IP
    # from ipify (an external service — used only here, only with
    # the operator's consent, doesn't run in production). If that
    # service is unreachable, we skip the comparison.
    host_ip="$(curl -fsS --max-time 5 https://api.ipify.org 2>/dev/null || true)"
    if [ -n "$host_ip" ] && [ "$host_ip" != "$resolved" ]; then
      warn "DNS says $DOMAIN → $resolved"
      warn "This host's public IP appears to be $host_ip"
      warn "Update your A record before Caddy tries to acquire a cert."
      confirm "Continue anyway?" || exit 1
    else
      ok "DNS for $DOMAIN resolves to $resolved."
    fi
  fi
fi

say ""
say "${c_bold}Step 2/4 — Operator identity${c_off}"
say "${c_dim}Surfaced on GET /api/config so members can see who is running the node.${c_off}"
say ""

ask "Operator name (organization or community)" OPERATOR_NAME
ask "Operator contact (e-mail or other reachable address)" OPERATOR_CONTACT
ask "Operator funding note (optional, press Enter to skip)" OPERATOR_FUNDING_NOTE

say ""
say "${c_bold}Step 3/4 — Community defaults${c_off}"
say ""

ask "Auto-confirm hours (168 = 7 days; 0 disables)" AUTO_CONFIRM_HOURS "168"
case "$AUTO_CONFIRM_HOURS" in
  ''|*[!0-9]*) fail "AUTO_CONFIRM_HOURS must be a non-negative integer." ;;
esac

ask "Peer node URLs (comma-separated, leave blank for solo)" PEER_NODE_URLS ""

ask "Rate limit (requests per minute per IP)" RATE_LIMIT_MAX "60"
ask "Log level (fatal|error|warn|info|debug|trace)" LOG_LEVEL "info"

say ""
say "${c_bold}Step 4/4 — System key${c_off}"
say "${c_dim}Builds the server image (~1-2 min), then generates the auto-confirm key inside it.${c_off}"
say ""

info "Building understoria/server image..."
DOMAIN="$DOMAIN" docker compose build understoria >/dev/null 2>&1 \
  || fail "docker compose build understoria failed. Run it directly to see the error."
ok "Image built."

info "Generating Ed25519 system key..."
keygen_output="$(docker compose run --rm --no-deps --entrypoint node understoria \
  /app/scripts/generate-system-key.mjs 2>/dev/null || true)"
NODE_SYSTEM_SECRET_KEY="$(printf '%s\n' "$keygen_output" \
  | sed -n 's/^NODE_SYSTEM_SECRET_KEY=//p' | head -n1)"
sys_pubkey="$(printf '%s\n' "$keygen_output" \
  | grep -m1 '#   ' | sed 's/^#   //')"
if [ -z "$NODE_SYSTEM_SECRET_KEY" ]; then
  fail "Key generation produced no output. Try: docker compose run --rm --no-deps --entrypoint node understoria /app/scripts/generate-system-key.mjs"
fi
ok "System key generated. Public key: $sys_pubkey"

# ─── Write .env ──────────────────────────────────────────────────────

say ""
info "Writing .env..."
umask 077
cat > .env <<EOF
# Generated by scripts/setup.sh on $(date -u +%Y-%m-%dT%H:%M:%SZ).
# Treat NODE_SYSTEM_SECRET_KEY like a TLS private key.
# Rotation procedure: docs/auto-confirm-key.md §6.

DOMAIN=$DOMAIN
ACME_EMAIL=$ACME_EMAIL

NODE_SYSTEM_SECRET_KEY=$NODE_SYSTEM_SECRET_KEY
AUTO_CONFIRM_MIN_HOURS=$AUTO_CONFIRM_HOURS

OPERATOR_NAME=$OPERATOR_NAME
OPERATOR_CONTACT=$OPERATOR_CONTACT
OPERATOR_FUNDING_NOTE=$OPERATOR_FUNDING_NOTE

UNDERSTORIA_VERSION=0.2.0
RATE_LIMIT_MAX=$RATE_LIMIT_MAX
LOG_LEVEL=$LOG_LEVEL
LOG_REQUEST_PATHS=false

PEER_NODE_URLS=$PEER_NODE_URLS
EOF
chmod 600 .env
ok ".env written (chmod 600)."

# ─── Summary ─────────────────────────────────────────────────────────

say ""
say "${c_bold}Summary${c_off}"
say "  Domain:           $DOMAIN"
say "  ACME email:       $ACME_EMAIL"
say "  Operator:         $OPERATOR_NAME"
say "  Contact:          $OPERATOR_CONTACT"
say "  Auto-confirm:     ${AUTO_CONFIRM_HOURS}h $([ "$AUTO_CONFIRM_HOURS" = "0" ] && echo "(disabled)" || echo "")"
say "  Peer nodes:       ${PEER_NODE_URLS:-<solo>}"
say "  System pubkey:    $sys_pubkey"
say ""

# ─── Launch (optional) ───────────────────────────────────────────────

if confirm "Bring the node up now (docker compose up -d --build)?"; then
  say ""
  info "Starting services..."
  docker compose up -d --build
  say ""
  ok "Services started. Watch logs with: docker compose logs -f"
  say "First TLS acquisition can take 30-90s. /api/health should return"
  say "{\"status\":\"ok\"} once Caddy has its cert."
else
  say ""
  say "Done. When you're ready: ${c_bold}docker compose up -d --build${c_off}"
fi
