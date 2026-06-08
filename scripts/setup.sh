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

# ─── Time-sync check ─────────────────────────────────────────────────
#
# TLS cert validation and signed-record timestamps both depend on
# accurate time. A drifted clock means Caddy may reject Let's
# Encrypt's response (cert "from the future"), and federated
# exchange records get a wrong `completedAt` that peers cannot
# audit against their own clocks. Failing here is friendlier than
# debugging the symptom later.
if command -v timedatectl >/dev/null 2>&1; then
  if timedatectl show --property=NTPSynchronized --value 2>/dev/null \
       | grep -qx "yes"; then
    ok "System clock is NTP-synchronized."
  else
    warn "System clock is NOT NTP-synchronized."
    warn "TLS + signed-record timestamps need an accurate clock."
    warn "Fix: sudo timedatectl set-ntp true   (then re-run this script)"
    confirm "Continue anyway?" || exit 1
  fi
else
  info "timedatectl not present — can't verify clock sync. Make sure NTP is configured."
fi

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
  # Resolve A (IPv4) and AAAA (IPv6) separately. Compare against the
  # host's public IPv4 from ipify; mismatching v4-vs-v6 strings is NOT
  # a real mismatch and used to scare operators with a false positive.
  # `getent ahosts` honours AF type; fall back to `host` if available.
  if command -v getent >/dev/null 2>&1; then
    resolved_v4="$(getent ahostsv4 "$DOMAIN" 2>/dev/null | awk '{print $1; exit}' || true)"
    resolved_v6="$(getent ahostsv6 "$DOMAIN" 2>/dev/null | awk '{print $1; exit}' || true)"
  elif command -v host >/dev/null 2>&1; then
    resolved_v4="$(host -t A    "$DOMAIN" 2>/dev/null | awk '/has address/    {print $4; exit}' || true)"
    resolved_v6="$(host -t AAAA "$DOMAIN" 2>/dev/null | awk '/has IPv6 address/{print $5; exit}' || true)"
  else
    resolved_v4=""
    resolved_v6=""
  fi
  if [ -z "$resolved_v4" ] && [ -z "$resolved_v6" ]; then
    warn "DNS lookup for $DOMAIN returned no A or AAAA record."
    warn "Caddy will fail to acquire a TLS cert until DNS resolves."
    confirm "Continue anyway?" || exit 1
  else
    # Best-effort host IPv4 detection. ipify is external — used only
    # here, only with the operator's consent, doesn't run in production.
    # If unreachable we skip the comparison rather than guess.
    host_ipv4="$(curl -fsS --max-time 5 -4 https://api.ipify.org 2>/dev/null || true)"
    if [ -n "$resolved_v4" ]; then
      if [ -n "$host_ipv4" ] && [ "$host_ipv4" != "$resolved_v4" ]; then
        warn "DNS says $DOMAIN A → $resolved_v4"
        warn "This host's public IPv4 appears to be $host_ipv4"
        warn "Update your A record before Caddy tries to acquire a cert."
        confirm "Continue anyway?" || exit 1
      else
        ok "DNS for $DOMAIN (A) resolves to $resolved_v4."
      fi
    else
      warn "$DOMAIN has no A record (only AAAA: $resolved_v6)."
      warn "Let's Encrypt HTTP-01 over IPv4 is the most reliable path;"
      warn "add an A record pointing at this host's IPv4 before going public."
      confirm "Continue with IPv6-only DNS?" || exit 1
    fi
    if [ -n "$resolved_v6" ]; then
      info "DNS for $DOMAIN (AAAA) resolves to $resolved_v6."
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

# ─── Host firewall (optional) ────────────────────────────────────────

say ""
say "${c_bold}Host firewall${c_off}"
say "${c_dim}Caddy needs ports 80 and 443 reachable from the public internet to acquire its TLS cert.${c_off}"
say ""

# Skip entirely if ufw isn't installed; the operator is using
# something else (firewalld, raw iptables, none at all) and we
# don't want to silently second-guess their setup. Same for the
# Linode Cloud Firewall — that's an external UI step the runbook
# names; we can't touch it from here.
if ! command -v ufw >/dev/null 2>&1; then
  info "ufw not installed — skipping host firewall step."
  info "If you use firewalld / iptables / Linode Cloud Firewall, make sure"
  info "  TCP 22, 80, 443 + UDP 443 (HTTP/3) are open for inbound traffic."
elif command -v firewall-cmd >/dev/null 2>&1 \
     && systemctl is-active --quiet firewalld 2>/dev/null; then
  warn "Both ufw and firewalld are installed and firewalld is active."
  warn "Configure rules through firewalld; ufw rules would be overridden."
  info "Open TCP 22, 80, 443 + UDP 443 via firewall-cmd, then continue."
else
  ufw_status="$(ufw status 2>/dev/null | head -n1 || true)"
  case "$ufw_status" in
    *"Status: active"*)
      info "ufw is active. Current rules will be preserved; rules below will be added."
      ;;
    *)
      info "ufw is installed but inactive."
      ;;
  esac
  say "  Rules to add:"
  say "    - OpenSSH (preserves your SSH session)"
  say "    - 80/tcp  (HTTP — ACME HTTP-01 challenge + redirect to HTTPS)"
  say "    - 443/tcp (HTTPS)"
  say "    - 443/udp (HTTP/3)"
  if confirm "Apply these ufw rules and enable the firewall if needed?"; then
    if [ "$(id -u)" -ne 0 ]; then
      warn "ufw needs root. Re-running through sudo."
      sudo ufw allow OpenSSH    >/dev/null
      sudo ufw allow 80/tcp     >/dev/null
      sudo ufw allow 443/tcp    >/dev/null
      sudo ufw allow 443/udp    >/dev/null
      sudo ufw --force enable   >/dev/null
    else
      ufw allow OpenSSH    >/dev/null
      ufw allow 80/tcp     >/dev/null
      ufw allow 443/tcp    >/dev/null
      ufw allow 443/udp    >/dev/null
      ufw --force enable   >/dev/null
    fi
    ok "Host firewall configured."
  else
    info "Skipped. You'll need to open TCP 22/80/443 + UDP 443 yourself."
  fi
fi

# ─── Unattended security updates ─────────────────────────────────────
#
# Single highest-value security step for a long-running VPS — most
# real-world compromises exploit unpatched CVEs. Detected, not
# assumed; non-Debian systems get a note instead of a wrong command.

say ""
say "${c_bold}Unattended security updates${c_off}"
if [ -f /etc/apt/sources.list ] || [ -d /etc/apt/sources.list.d ]; then
  if dpkg -s unattended-upgrades >/dev/null 2>&1; then
    if systemctl is-enabled --quiet unattended-upgrades 2>/dev/null \
       || [ -f /etc/apt/apt.conf.d/20auto-upgrades ]; then
      ok "unattended-upgrades is installed and enabled."
    else
      info "unattended-upgrades is installed but not enabled."
      if confirm "Enable it now?"; then
        if [ "$(id -u)" -ne 0 ]; then
          sudo dpkg-reconfigure --priority=low unattended-upgrades \
            || warn "Manual enable: sudo dpkg-reconfigure unattended-upgrades"
        else
          dpkg-reconfigure --priority=low unattended-upgrades \
            || warn "Manual enable: dpkg-reconfigure unattended-upgrades"
        fi
        ok "unattended-upgrades reconfigured."
      fi
    fi
  else
    info "unattended-upgrades not installed."
    if confirm "Install + enable it now? (apt-get install unattended-upgrades)"; then
      if [ "$(id -u)" -ne 0 ]; then
        sudo apt-get update >/dev/null
        sudo apt-get install -y unattended-upgrades >/dev/null
        sudo dpkg-reconfigure --priority=low unattended-upgrades \
          || warn "Manual finalize: sudo dpkg-reconfigure unattended-upgrades"
      else
        apt-get update >/dev/null
        apt-get install -y unattended-upgrades >/dev/null
        dpkg-reconfigure --priority=low unattended-upgrades \
          || warn "Manual finalize: dpkg-reconfigure unattended-upgrades"
      fi
      ok "unattended-upgrades installed + enabled."
    fi
  fi
else
  info "Non-Debian system — install your distribution's equivalent of"
  info "  unattended-upgrades (dnf-automatic, etc.) before going public."
fi

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

# ─── Launch + TLS verification (optional) ────────────────────────────

# Polls https://$DOMAIN/api/health until Caddy has acquired the cert
# and the server is responding. Distinguishes the common failure
# modes (DNS, port, ACME) so the operator doesn't have to grep
# through Caddy's logs to find out which one to fix.
verify_tls() {
  local url="https://$DOMAIN/api/health"
  local deadline=$(( $(date +%s) + 180 ))   # 3 minutes
  local first_attempt_at
  first_attempt_at=$(date +%s)
  info "Polling $url for the next 3 minutes..."
  while [ "$(date +%s)" -lt "$deadline" ]; do
    # --max-time 8 so a hung connection doesn't eat the whole budget.
    # --silent --show-error lets us capture diagnostics on failure.
    if body="$(curl --max-time 8 -fsS "$url" 2>/tmp/setup-curl-err)"; then
      ok "TLS + node both healthy. /api/health: $body"
      return 0
    fi
    sleep 5
  done
  # Diagnose the last failure based on curl's stderr.
  err="$(cat /tmp/setup-curl-err 2>/dev/null || true)"
  rm -f /tmp/setup-curl-err
  warn "Did not get a healthy response from $url within 3 minutes."
  case "$err" in
    *"Could not resolve host"*)
      warn "DNS for $DOMAIN doesn't resolve from this host."
      warn "Check the A record; if you just set it, give DNS time to propagate." ;;
    *"Connection refused"*|*"Connection timed out"*|*"Failed to connect"*)
      warn "Ports 80/443 are unreachable. Check:"
      warn "  - The host firewall step above"
      warn "  - The Linode Cloud Firewall (if you set one)"
      warn "  - That Caddy is actually running: docker compose ps caddy" ;;
    *"SSL"*|*"certificate"*|*"handshake"*)
      warn "TLS handshake failed. Caddy may still be acquiring the cert."
      warn "Check: docker compose logs caddy | grep -E 'acme|certificate'" ;;
    *)
      warn "Curl error: $err"
      warn "Check: docker compose logs --tail=50" ;;
  esac
  warn "(The node may still come up; verification is best-effort.)"
  return 1
}

# Sanity check what the live node is publishing back. Catches:
#   - operator name typo'd in .env vs. what got loaded
#   - system pubkey from /api/config doesn't match what we just generated
#     (would indicate a paste / interpolation problem in .env or a key
#      that was overwritten between keygen and launch)
verify_config() {
  local url="https://$DOMAIN/api/config"
  info "Sanity-checking $url..."
  local body
  body="$(curl --max-time 8 -fsS "$url" 2>/dev/null || true)"
  if [ -z "$body" ]; then
    warn "$url did not return a response. Skipping sanity check."
    return 1
  fi
  local rc=0
  if [ -n "$OPERATOR_NAME" ]; then
    if printf '%s' "$body" | grep -qF "$OPERATOR_NAME"; then
      ok "Operator name present in /api/config."
    else
      warn "Operator name NOT found in /api/config."
      warn "  Expected: $OPERATOR_NAME"
      warn "  Got:      $body"
      rc=1
    fi
  fi
  if [ -n "$sys_pubkey" ]; then
    if printf '%s' "$body" | grep -qF "$sys_pubkey"; then
      ok "System public key matches what was generated."
    else
      warn "System public key in /api/config does NOT match the one we generated."
      warn "  Expected: $sys_pubkey"
      warn "  This usually means .env didn't pick up NODE_SYSTEM_SECRET_KEY."
      warn "  Compare:  grep NODE_SYSTEM_SECRET_KEY .env"
      rc=1
    fi
  fi
  return "$rc"
}

if confirm "Bring the node up now (docker compose up -d --build)?"; then
  say ""
  info "Starting services..."
  docker compose up -d --build
  say ""
  ok "Services started."
  # Give Caddy a moment to start before we start hammering it. ACME
  # itself takes 30-90s after that; the poll loop covers it.
  sleep 5
  if verify_tls; then
    verify_config || true
  fi
  say ""
  say "Logs:    docker compose logs -f"
  say "Status:  docker compose ps"
else
  say ""
  say "Done. When you're ready: ${c_bold}docker compose up -d --build${c_off}"
fi

# ─── Backup reminder ─────────────────────────────────────────────────
#
# `.env` now holds the only copy of NODE_SYSTEM_SECRET_KEY on this
# host. If the disk dies, the key is gone — and auto-confirmed
# records signed with it can no longer be re-verified by future
# operators. Make this explicit at exit; soft-prompt for an
# encrypted local copy.

say ""
say "${c_bold}Back up the system key — now${c_off}"
say "  ${c_dim}.env is the ONLY copy of NODE_SYSTEM_SECRET_KEY on this host.${c_off}"
say "  ${c_dim}Lose the host, lose the key; auto-confirmed history becomes unverifiable.${c_off}"
say "  ${c_dim}Rotation procedure: docs/auto-confirm-key.md §6.${c_off}"
say ""
say "  Suggested:"
say "    1. Copy .env to a host you control somewhere else:"
say "         scp .env you@offsite.example.org:/secure/understoria-env-${DOMAIN}.backup"
say "    2. Or encrypt it with gpg and store the ciphertext:"
say "         gpg --symmetric --output understoria-env.gpg .env"
say "    3. Or print NODE_SYSTEM_SECRET_KEY and store it in a password manager."
say ""
if confirm "I've backed it up — clear this confirmation prompt?"; then
  ok "Acknowledged. The reminder will print again on next setup.sh run."
else
  warn "Do NOT bring this node into production use until the key is backed up."
fi
