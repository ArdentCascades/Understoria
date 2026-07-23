#!/usr/bin/env bash
#
# Interactive first-run setup for an Understoria community node.
#
# What this does:
#   1. Sanity-checks the environment (Docker, Compose, basic tools),
#      and on low-memory hosts (< 1.5 GB RAM, no swap) offers to
#      create the 2 GB swapfile the image build needs.
#   2. Prompts for the values that go in `.env`: domain, ACME email,
#      node id, operator name + contact, auto-confirm hours, peer list.
#   3. Validates each value as it's entered (e-mail shape, domain
#      shape, optional DNS A-record check vs this host's public IP).
#   4. Builds the server image so the keygen helper can run in it.
#   5. Generates the `NODE_SYSTEM_SECRET_KEY` via the existing
#      `scripts/generate-system-key.mjs` (inside the built image so
#      there's no Node install required on the host), plus a
#      `DATABASE_KEY` (encryption at rest) and a `SETUP_TOKEN` (the
#      one-time founder-claim code).
#   6. Writes `.env` with `chmod 600` (TRUST_PROXY=true for the
#      bundled Caddy stack).
#   7. Optionally runs `docker compose up -d --build`.
#   8. Prints the founder-claim walkthrough with YOUR setup code —
#      the server boots UNCLAIMED (secure by default) until the
#      founding member claims it from inside the app.
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
#   scripts/setup.sh --offline          flash-drive / air-gapped mode:
#                                       no network touches at all —
#                                       images must already be loaded
#                                       (docker load; see
#                                       scripts/setup-offline.sh and
#                                       docs/flash-drive-install.md).
#                                       Implies --skip-dns.
#   scripts/setup.sh --help             usage
#
# Non-interactive mode (for CI / re-runs):
#   Set the corresponding env vars before running and the script
#   will not prompt for them: DOMAIN, ACME_EMAIL, NODE_ID,
#   OPERATOR_NAME, OPERATOR_CONTACT, OPERATOR_FUNDING_NOTE,
#   AUTO_CONFIRM_HOURS, PEER_NODE_URLS, RATE_LIMIT_MAX, LOG_LEVEL,
#   DATABASE_KEY, SETUP_TOKEN (the last two are generated when unset).

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
OFFLINE=0
for arg in "$@"; do
  case "$arg" in
    --skip-dns) SKIP_DNS=1 ;;
    # Offline = ZERO network touches: no DNS lookups, no public-IP
    # curl, no image builds (npm install lives inside the Dockerfiles),
    # no registry pulls, no apt installs, no TLS polling. The images
    # must already be `docker load`ed (scripts/setup-offline.sh does
    # that from a flash drive built by scripts/make-flash-drive.sh).
    --offline) OFFLINE=1; SKIP_DNS=1 ;;
    --help|-h)
      sed -n '2,/^set -euo/p' "$0" | sed -e 's/^# \{0,1\}//' -e 's/^set -euo pipefail//'
      exit 0 ;;
    *) fail "Unknown argument: $arg" ;;
  esac
done

# ─── Banner ──────────────────────────────────────────────────────────

say ""
say "${c_bold}Understoria — node setup${c_off}"
say ""
say "This sets up your community's server, start to finish. It takes"
say "about 10 minutes: you'll answer a few questions (each one is"
say "explained as it comes, and pressing Enter accepts the suggested"
say "answer shown in [brackets]), then the script builds and starts"
say "everything and hands you a claim code to finish in the app."
say ""
say "It is safe to stop (Ctrl+C) and re-run this script at any time."
say "${c_dim}Running from $REPO_ROOT${c_off}"
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

# ─── Memory / swap check ─────────────────────────────────────────────
#
# Building the web image (tsc + vite) needs more memory than a 1 GB
# VPS has. Without swap the build aborts with exit code 134 partway
# through `docker compose build` — a confusing place to discover a
# provisioning gap. On low-memory hosts the script now OFFERS to
# create the swapfile itself (the recipe operators previously had to
# copy from deploy-linode.md §1 by hand), with the same consent-first
# posture as the firewall and unattended-upgrades steps below.

# create_swapfile <size_mb> — creates /swapfile, activates it, and
# makes it survive reboots. Root-aware (sudo when needed), idempotent
# on the fstab line, btrfs-aware (swap needs a no-copy-on-write file
# there, which fallocate can't produce), with a dd fallback where
# fallocate is unsupported. Returns non-zero on any failure so the
# caller can fall back to the manual recipe instead of aborting setup.
create_swapfile() {
  local size_mb="$1"
  local as_root=""
  [ "$(id -u)" -ne 0 ] && as_root="sudo"

  if [ -e /swapfile ]; then
    warn "/swapfile already exists but isn't active swap. Not touching it."
    warn "Inspect it (ls -lh /swapfile; swapon --show) and see deploy-linode.md §1."
    return 1
  fi
  # Need the swap size plus real headroom — filling the root disk to
  # the brim trades an OOM problem for a no-space one.
  local avail_mb
  avail_mb=$(df -Pm / 2>/dev/null | awk 'NR==2{print $4}' || echo 0)
  if [ "${avail_mb:-0}" -lt $((size_mb + 1024)) ]; then
    warn "Only ${avail_mb} MB free on / — not enough for a ${size_mb} MB swapfile plus headroom."
    return 1
  fi

  local fstype
  fstype=$(df -PT / 2>/dev/null | awk 'NR==2{print $2}' || echo unknown)
  info "Creating a ${size_mb} MB swapfile at /swapfile (filesystem: $fstype)..."
  if [ "$fstype" = "btrfs" ]; then
    # btrfs swap needs a NOCOW file, set while the file is still
    # empty; fallocate-then-chattr is too late and mkswap refuses.
    $as_root touch /swapfile \
      && $as_root chattr +C /swapfile 2>/dev/null \
      && $as_root dd if=/dev/zero of=/swapfile bs=1M count="$size_mb" status=none \
      || { $as_root rm -f /swapfile; return 1; }
  elif ! $as_root fallocate -l "${size_mb}M" /swapfile 2>/dev/null; then
    # Some filesystems / older kernels lack fallocate — write it out.
    $as_root dd if=/dev/zero of=/swapfile bs=1M count="$size_mb" status=none \
      || { $as_root rm -f /swapfile; return 1; }
  fi
  $as_root chmod 600 /swapfile \
    && $as_root mkswap /swapfile >/dev/null \
    && $as_root swapon /swapfile \
    || { $as_root swapoff /swapfile 2>/dev/null; $as_root rm -f /swapfile; return 1; }
  # Survive reboots — but never append the line twice on a re-run.
  if ! grep -qE '^\s*/swapfile\s' /etc/fstab 2>/dev/null; then
    printf '/swapfile none swap sw 0 0\n' | $as_root tee -a /etc/fstab >/dev/null \
      || warn "Could not update /etc/fstab — swap is active now but won't survive a reboot."
  fi
  return 0
}

mem_kb=$(awk '/^MemTotal:/{print $2}' /proc/meminfo 2>/dev/null || echo 0)
swap_kb=$(awk '/^SwapTotal:/{print $2}' /proc/meminfo 2>/dev/null || echo 0)
# Offline mode never builds (images arrive pre-built via docker load),
# and the swap exists solely to survive the web-image build — skip the
# whole prompt rather than scare a Pi operator about a build that
# will never run.
if [ "$OFFLINE" -eq 0 ] && [ "$mem_kb" -gt 0 ] && [ "$mem_kb" -lt 1572864 ] && [ "$swap_kb" -lt 1048576 ]; then
  warn "This host has less than 1.5 GB RAM and little or no swap."
  warn "The web image build will likely die with exit code 134 (out of memory)."
  say ""
  say "The script can fix this for you: it creates a 2 GB swap file"
  say "(spare disk space the system uses as extra memory when RAM runs"
  say "out). It's only needed during builds — day-to-day serving never"
  say "touches it — and it survives reboots. This is the standard cure"
  say "for small servers; it changes nothing else about your system."
  if confirm "Create a 2 GB swap file now?"; then
    if create_swapfile 2048; then
      swap_kb=$(awk '/^SwapTotal:/{print $2}' /proc/meminfo 2>/dev/null || echo 0)
      ok "Swap active: $((swap_kb / 1024)) MB total (persisted in /etc/fstab)."
    else
      warn "Automatic swap creation failed — falling back to the manual recipe"
      warn "(docs/deploy-linode.md §1):"
      warn "  fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile"
      warn "  echo '/swapfile none swap sw 0 0' >> /etc/fstab"
      confirm "Continue without swap anyway?" || exit 1
    fi
  else
    warn "Skipped. Manual recipe (docs/deploy-linode.md §1):"
    warn "  fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile"
    warn "  echo '/swapfile none swap sw 0 0' >> /etc/fstab"
    confirm "Continue without swap anyway?" || exit 1
  fi
else
  ok "Memory + swap look sufficient for the image builds."
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
say "${c_bold}Step 1 of 4 — Your web address${c_off}"
say ""
if [ "$OFFLINE" -eq 1 ]; then
  say "Offline mode: use your community's REAL domain — the storm-hub"
  say "pattern (docs/offline-resilience.md §4) answers it on the local"
  say "network, so members' installed apps just work. A LAN name is"
  say "also accepted for a bench test. No DNS or certificate checks"
  say "run in this mode; certificates renew whenever the node next"
  say "sees the internet (~90-day offline runway)."
else
  say "Your community will live at a web address you own (a domain or"
  say "subdomain). Before this step works, that address must already"
  say "point at THIS server in your DNS settings (an 'A record' with"
  say "this machine's IP) — the script checks for you in a moment."
  say "The padlock certificate (HTTPS) is set up automatically for"
  say "free via Let's Encrypt; they just need an email address in case"
  say "a certificate ever has a problem."
fi
say ""

ask "Domain (e.g. understoria.example.org)" DOMAIN
[ -n "$DOMAIN" ] || fail "DOMAIN is required."
case "$DOMAIN" in
  *.*) : ;;
  *)
    # A bare LAN hostname is a legitimate bench-test target offline;
    # everywhere else an FQDN-less domain is a typo.
    [ "$OFFLINE" -eq 1 ] || fail "DOMAIN must be a fully-qualified domain name." ;;
esac

if [ "$OFFLINE" -eq 1 ]; then
  # Unused until the node sees the internet; a valid-shaped default
  # keeps .env complete without inventing a fake question.
  ask "ACME email (used when the node next sees the internet)" ACME_EMAIL "unused-offline@example.invalid"
else
  ask "ACME email (for Let's Encrypt expiry notices)" ACME_EMAIL
fi
case "$ACME_EMAIL" in
  *@*.*) : ;;
  *) fail "ACME_EMAIL doesn't look like an e-mail address." ;;
esac

say ""
say "${c_dim}Every record your community creates is stamped with a permanent"
say "label so other communities can tell where it came from. The"
say "suggested one is fine — press Enter. (It can never change once"
say "your community has history, so don't overthink it either way.)${c_off}"
# Stable per-node id stamped on every federated record. Must be
# unique across a federation; defaulting from the domain's first
# label gives a distinct, memorable value without another decision.
default_node_id="node_$(printf '%s' "$DOMAIN" | cut -d. -f1 | tr -c 'a-zA-Z0-9' '_' | sed 's/_*$//')"
ask "Node id (unique per federated node)" NODE_ID "$default_node_id"
case "$NODE_ID" in
  ''|*[!A-Za-z0-9_-]*) fail "NODE_ID may only contain letters, digits, _ and -." ;;
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
say "${c_bold}Step 2 of 4 — Who runs this server${c_off}"
say ""
say "Your members can always see who operates their community's"
say "server and how to reach them — that transparency is part of the"
say "trust the app is built on. A real name (or your organization's)"
say "and a reachable address go a long way. You can change these"
say "later by editing the .env file and restarting."
say ""

ask "Operator name (organization or community)" OPERATOR_NAME
ask "Operator contact (e-mail or other reachable address)" OPERATOR_CONTACT
ask "Operator funding note (optional, press Enter to skip)" OPERATOR_FUNDING_NOTE

say ""
say "${c_bold}Step 3 of 4 — A few community settings${c_off}"
say "${c_dim}Pressing Enter for each of these is a perfectly good choice.${c_off}"
say ""
say "${c_dim}When someone helps a neighbor, both people confirm it in the app."
say "If one side forgets, the server confirms it FOR them after this"
say "many hours, so credit never gets stuck. 168 hours = one week.${c_off}"

ask "Auto-confirm hours (168 = 7 days; 0 disables)" AUTO_CONFIRM_HOURS "168"
case "$AUTO_CONFIRM_HOURS" in
  ''|*[!0-9]*) fail "AUTO_CONFIRM_HOURS must be a non-negative integer." ;;
esac

say ""
say "${c_dim}Communities on other servers can link up with yours later."
say "Starting solo is normal — leave this blank.${c_off}"
ask "Peer node URLs (comma-separated, leave blank for solo)" PEER_NODE_URLS ""

say ""
say "${c_dim}The last two are technical dials with sensible defaults —"
say "just press Enter twice unless you know you want otherwise.${c_off}"
ask "Rate limit (requests per minute per IP)" RATE_LIMIT_MAX "60"
ask "Log level (fatal|error|warn|info|debug|trace)" LOG_LEVEL "info"

say ""
say "${c_bold}Step 4 of 4 — Generating your server's keys${c_off}"
say ""
say "No questions here — the script now builds the server (1–2"
say "minutes of scrolling text; on a small server it can be slower —"
say "that's normal) and generates three secrets for you:"
say "  - a signing key the server uses when it auto-confirms exchanges"
say "  - an encryption key that keeps the database unreadable if the"
say "    disk is ever stolen or copied"
say "  - your one-time claim code, which you'll use in the app at the"
say "    very end to become this community's founding member"
say "All three are saved into the .env file — you'll be reminded to"
say "back that file up at the end."
say ""

if [ "$OFFLINE" -eq 1 ]; then
  # No building offline — `docker compose build` runs npm install
  # inside the Dockerfiles. The images must already be loaded
  # (docker load from the drive's images/ directory).
  server_image="understoria/server:${UNDERSTORIA_VERSION:-0.3.0}"
  info "Offline mode: checking for pre-loaded image $server_image..."
  docker image inspect "$server_image" >/dev/null 2>&1 \
    || fail "Image $server_image not loaded. Run the drive's install/setup-offline.sh (or docker load the tars in images/) first."
  ok "Pre-loaded image found."
else
  info "Building understoria/server image..."
  DOMAIN="$DOMAIN" docker compose build understoria >/dev/null 2>&1 \
    || fail "docker compose build understoria failed. Run it directly to see the error."
  ok "Image built."
fi

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

# Encryption-at-rest key for the SQLite file, and the one-time
# founder-claim setup code (the server boots UNCLAIMED — secure by
# default — until the founding member enters this code in the app).
# Both honor pre-set env vars for non-interactive runs.
rand_b64() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -base64 32
  else
    head -c 32 /dev/urandom | base64
  fi
}
rand_code() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -hex 8 | sed 's/\(.\{4\}\)/\1-/g;s/-$//'
  else
    head -c 8 /dev/urandom | od -An -tx1 | tr -d ' \n' | sed 's/\(.\{4\}\)/\1-/g;s/-$//'
  fi
}
if [ -z "${DATABASE_KEY:-}" ]; then
  DATABASE_KEY="$(rand_b64)"
  ok "Generated DATABASE_KEY (encryption at rest)."
else
  info "DATABASE_KEY: (from environment)"
fi
if [ -z "${SETUP_TOKEN:-}" ]; then
  SETUP_TOKEN="$(rand_code)"
  ok "Generated founder-claim setup code."
else
  info "SETUP_TOKEN: (from environment)"
fi

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
NODE_ID=$NODE_ID

# Bundled Caddy fronts the server on the compose network.
TRUST_PROXY=true

# Encryption at rest for the SQLite file. Keep a copy of this key
# AWAY from your database backups.
DATABASE_KEY=$DATABASE_KEY

# One-time founder-claim code (ignored once the node is claimed).
# READ_AUTH is not set here on purpose: enforcement is the default.
SETUP_TOKEN=$SETUP_TOKEN

NODE_SYSTEM_SECRET_KEY=$NODE_SYSTEM_SECRET_KEY
AUTO_CONFIRM_MIN_HOURS=$AUTO_CONFIRM_HOURS

OPERATOR_NAME=$OPERATOR_NAME
OPERATOR_CONTACT=$OPERATOR_CONTACT
OPERATOR_FUNDING_NOTE=$OPERATOR_FUNDING_NOTE

UNDERSTORIA_VERSION=0.3.0
RATE_LIMIT_MAX=$RATE_LIMIT_MAX
LOG_LEVEL=$LOG_LEVEL
LOG_REQUEST_PATHS=false

PEER_NODE_URLS=$PEER_NODE_URLS
EOF
chmod 600 .env
ok ".env written (chmod 600)."

# ─── Host firewall (optional) ────────────────────────────────────────

say ""
say "${c_bold}Firewall${c_off}"
say ""
say "This closes every door on the server except the three it needs:"
say "SSH (so you can log in) and the two web ports (so browsers and"
say "the certificate service can reach it). Answering yes here is"
say "the right call for almost everyone."
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
say "${c_bold}Automatic security updates${c_off}"
say "${c_dim}The single best thing for a server you won't log into often:"
say "the operating system patches its own security holes. Say yes.${c_off}"
# apt update/install are network operations — offline mode notes the
# obligation instead of failing halfway through an install.
if [ "$OFFLINE" -eq 1 ]; then
  info "Offline mode: can't install packages without internet."
  info "When this machine next sees the internet, enable automatic"
  info "security updates (Debian/Ubuntu: apt-get install unattended-upgrades)."
elif [ -f /etc/apt/sources.list ] || [ -d /etc/apt/sources.list.d ]; then
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
say "  Node id:          $NODE_ID"
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

print_claim_steps() {
  say ""
  say "${c_bold}══════════════════════════════════════════════════════════════${c_off}"
  say "${c_bold}  ONE STEP LEFT — claim your node (the app is LOCKED until you do)${c_off}"
  say "${c_bold}══════════════════════════════════════════════════════════════${c_off}"
  say "  The server starts ${c_bold}unclaimed${c_off} and the app at your address will"
  say "  show a setup screen instead of the community until its founding"
  say "  member claims it. On your phone or browser:"
  say ""
  say "    1. Open  ${c_bold}https://$DOMAIN${c_off}"
  say "    2. On the setup screen, enter your name and this one-time"
  say "       setup code:"
  say ""
  say "         ${c_bold}$SETUP_TOKEN${c_off}"
  say ""
  say "    3. Tap ${c_bold}\"Claim this server and open the community\"${c_off} — that's"
  say "       it: you're the founder, and syncing starts immediately."
  say ""
  say "    4. Communities start with two founders. Until you add a"
  say "       co-founder, you are the only member who can ever invite or"
  say "       vouch — so once your first neighbor joins, use"
  say "       ${c_bold}\"Add a co-founder\"${c_off} (Profile → the founder card) to make"
  say "       the community able to grow without you."
  say ""
  say "  Verify afterwards: curl https://$DOMAIN/api/config → \"claimed\":true"
  say "  (Lost the code? docker compose logs understoria | grep -i setup)"
}

say ""
say "${c_bold}Ready to launch${c_off}"
if [ "$OFFLINE" -eq 1 ]; then
  up_cmd="docker compose up -d --no-build"
  say "${c_dim}Saying yes starts everything from the pre-loaded images."
  say "No certificate is requested (that needs internet) — the TLS"
  say "poll is skipped and the offline posture is summarized instead.${c_off}"
else
  up_cmd="docker compose up -d --build"
  say "${c_dim}Saying yes builds and starts everything (a few minutes of"
  say "scrolling text), then waits up to 3 minutes while the padlock"
  say "certificate is issued — the script watches and tells you the"
  say "moment your address answers securely.${c_off}"
fi
if confirm "Bring the node up now ($up_cmd)?"; then
  say ""
  info "Starting services..."
  $up_cmd
  say ""
  ok "Services started."
  if [ "$OFFLINE" -eq 1 ]; then
    # No ACME, no external polling. Say what a LAN-only node honestly
    # is: the storm-hub runbook's posture, cert runway included.
    say ""
    say "${c_bold}Offline posture (docs/offline-resilience.md §4)${c_off}"
    say "  - Members reach this node once its address resolves on the"
    say "    local network (the storm hub's WiFi + local-DNS pattern)."
    say "  - HTTPS works only with existing cert material (a cert"
    say "    obtained in good times, backed up and restored here);"
    say "    renewal resumes when the node next sees the internet."
    say "  - Drill it before depending on it: two phones, WAN off,"
    say "    post on one, see it on the other."
  else
    # Give Caddy a moment to start before we start hammering it. ACME
    # itself takes 30-90s after that; the poll loop covers it.
    sleep 5
    if verify_tls; then
      verify_config || true
    fi
  fi
  print_claim_steps
  say ""
  say "Logs:    docker compose logs -f"
  say "Status:  docker compose ps"
else
  print_claim_steps
  say ""
  say "Done. When you're ready: ${c_bold}$up_cmd${c_off}"
fi

# ─── Backup reminder ─────────────────────────────────────────────────
#
# `.env` now holds the only copy of NODE_SYSTEM_SECRET_KEY on this
# host. If the disk dies, the key is gone — and auto-confirmed
# records signed with it can no longer be re-verified by future
# operators. Make this explicit at exit; soft-prompt for an
# encrypted local copy.

say ""
say "${c_bold}Back up your keys — now${c_off}"
say "  ${c_dim}.env is the ONLY copy of NODE_SYSTEM_SECRET_KEY and DATABASE_KEY on this host.${c_off}"
say "  ${c_dim}Lose the system key: auto-confirmed history becomes unverifiable.${c_off}"
say "  ${c_dim}Lose DATABASE_KEY: every database backup becomes an unreadable brick.${c_off}"
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
