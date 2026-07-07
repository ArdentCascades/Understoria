# Node Operator Guide

> **Audience:** whoever volunteers to run Understoria for a community.
> You should be comfortable on a command line and editing a config file.
> Everything else we explain.

This guide covers two deployment paths, both currently supported:

1. **PWA-only** — serve the web app's static `dist/` over HTTPS.
   Members' data lives in their own browser's IndexedDB. No
   community-side persistence. Smallest possible attack surface.
   Suitable for a 5–20 member pilot.
2. **PWA + node server** — additionally run the Fastify community
   node from `apps/server/`. The node accepts signed Exchange records
   over HTTP, verifies them with the same cryptographic primitives
   the PWA uses, and stores them in a local SQLite file. Federation
   across communities is live: the pull loop in §6 syncs verified
   records between the peer nodes you configure.

Pick PWA-only if you want to minimize what you operate. Pick
PWA + node if you want a community-wide ledger and to be ready to
peer with other communities once federation lands.

---

## 1. What being an operator means right now

You are responsible for:

- **Publishing the app** — making sure members can reach a trusted
  copy of Understoria at a known URL.
- **Vouching for the first few members** — you'll be issuing the
  original invites. Be careful who you admit.
- **Watching the security posture** of the hosting — TLS, DNS, domain
  renewal, keeping the build fresh.
- **Being the human backstop** — new members will come to you when
  they're stuck or confused. Have some patience ready.

You are **not** responsible for:

- Storing private member data. If you run PWA-only, no member data
  reaches your host at all. If you run the node, only signed Exchange
  records do — keys, posts, messages, and profiles still live on each
  member's device. Cryptographic signatures protect every stored row,
  so even an operator can't tamper undetectably.
- Preventing member-to-member abuse. That's the community's job via
  the [Code of Conduct](../CODE_OF_CONDUCT.md) and the moderation
  process in [GOVERNANCE.md](../GOVERNANCE.md).

## 2. What you'll need

- A domain you control (e.g. `aid.our-union.example`).
- Somewhere to serve static files over HTTPS:
  - A small VPS (DigitalOcean $6 droplet, Hetzner CX11, etc.) — most
    flexible.
  - A Raspberry Pi 4 on a home connection with dynamic DNS — cheapest.
  - Netlify, Cloudflare Pages, or GitHub Pages — easiest, but read
    §4(c) about third-party exposure.
- 20 minutes.

## 3. Build from source

On any machine with Node.js 20+ and npm 10+:

```sh
git clone https://github.com/ardentcascades/understoria.git
cd understoria
npm install
npm run build
```

The output goes to `apps/web/dist/` — an `index.html`, hashed JS
chunks (the main one is ~1.5 MB raw / ~430 KB gzip), CSS, fonts,
and the service-worker precache manifest; roughly 2 MB on disk
all-in. That's what you serve.

### First-time install on a fresh Debian / Ubuntu host

If you're starting from a stock Debian 13 / Ubuntu 24.04 VM, the
above `npm install` will fail with cryptic `node-gyp` errors —
`better-sqlite3` (used by the optional community node, §6) needs a
C++ toolchain to build its native binding. Install it first:

```sh
sudo apt-get update
sudo apt-get install -y build-essential python3 git curl
```

Then install Node from the official NodeSource repo (Debian's stock
Node is too old for some workspace tooling):

```sh
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Verify with `node --version` (should be ≥ 20). Then re-run
`npm install`.

If you only intend to run the PWA-only path and never the node
server, you can skip `build-essential` / `python3` — the native
module sits in the server workspace and won't try to compile.

### Verify before you publish

```sh
npm test
npm run typecheck
npm run preview
```

Open <http://localhost:4173> and click around. If anything looks
broken, publish the last release tag instead of `main`.

## 4. Publish — the three options

### (a) Your own VPS with Caddy (recommended)

Caddy gives you auto-TLS from Let's Encrypt and a five-line config.

```Caddyfile
aid.our-union.example {
  root * /var/www/understoria
  file_server
  try_files {path} /index.html
  encode gzip zstd
  header {
    Strict-Transport-Security "max-age=31536000; includeSubDomains"
    X-Content-Type-Options nosniff
    Referrer-Policy no-referrer
    Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; manifest-src 'self'; frame-ancestors 'none'; base-uri 'self';"
    Permissions-Policy "geolocation=(), microphone=(), camera=()"
  }
}
```

Copy `dist/` to `/var/www/understoria/`, start Caddy, and you're live.
The `try_files` line is what makes client-side routes like
`/profile` and `/invite` work on reload.

### (b) Raspberry Pi

Same Caddy config on a Pi 4. Use a dynamic-DNS provider (duckdns,
cloudflare) and open port 443 on your router. Performance is fine
for a pilot under a few hundred members — the app is fully
client-side and your Pi is just serving static bytes.

### (c) Static-host service

Netlify / Cloudflare Pages / GitHub Pages all work with the `dist/`
output. Add a redirects file so client-side routes serve
`index.html`. Trade-off: you're trusting a third party to deliver the
right bytes. Mitigation: use Subresource Integrity, pin the
platform's DNS, and be ready to migrate off fast if they ever
pressure you to modify the build.

## 5. First-run setup as an operator

Operators are also members. On your first visit:

1. Your node starts **empty** — production builds carry no demo
   data (the demo community is dev-mode only). Walk the welcome
   tour; the final step asks for your display name and mints your
   identity. On an invite-only node the very first device gets a
   bootstrap exception, so you can self-onboard before any invites
   exist. No purge choreography needed.
2. Set a passphrase under **Profile → Security**. As the operator,
   you'll be issuing the first invites — your key really matters.
   Write the passphrase on paper. Put the paper somewhere safe.
3. **Profile → Invites → Generate invite link** for each founding
   member. Deliver links through a channel you trust (in person is
   best; Signal is a reasonable second choice).
4. Verify each new member's key fingerprint in person or on a voice
   call before confirming they're who you think they are.

**Existing deployments that predate the dev-only seed:** devices that
already carry the old demo community (Rosa, Marcus, Imani, Theo and
their sample posts) can still clear it via **Profile → Emergency →
Hard purge**. Do the purge **first**, and only then set your display
name and passphrase — the purge wipes everything on the device, so
running it after your setup destroys the identity and passphrase you
just created.

## 6. Running the community node (optional)

The Fastify node lives at `apps/server/`. It exposes:

- `GET /health` — liveness check.
- `POST /exchanges` — accepts a signed `Exchange` JSON body, verifies
  both signatures with the inviter's and helped party's public keys
  via `@understoria/shared/crypto`, and stores the row if novel.
  Returns `201` on insert, `200` on idempotent re-submission, `400`
  on malformed body, `422` on bad signatures.
- `GET /exchanges?since=<ms>&limit=<n>` — lists stored exchanges
  newest-first. Every row is signed and any peer can independently
  verify with the same code path.

The exchange pair above is the original core; the same
accept-verified-and-serve pattern has since grown to posts, vouches,
claims, task comments, community events (+ cancellations),
co-organizer invitations, invite redemptions/revocations, and
awaiting-transition records — each with its own route file under
`apps/server/src/routes/` and each covered by the §6 peer pull.

It does **not** yet:
- Authenticate clients beyond the cryptographic signatures on each
  record. Authentication for non-record endpoints (e.g. an admin
  panel, when those land) is tracked work.

### Run with Docker (recommended)

```sh
docker compose up -d
```

The compose file lives at the repo root. It builds the multi-stage
Dockerfile in `apps/server/`, runs as a non-root user (uid 10001),
mounts a named volume for the SQLite file (`/data/understoria.db`),
drops every Linux capability, runs read-only with a small tmpfs at
`/tmp`, and uses `tini` as PID 1 for clean signal forwarding.

A healthcheck hits `/health` every 30 s.

### Run from source (development)

```sh
npm run dev:server
```

This rebuilds `@understoria/shared` and starts the server with
`tsx watch` on port 8787. Hit `http://localhost:8787/health` to
confirm.

### Wiring the PWA to your node (test setup on a single host)

If you're running both the PWA (`npm run dev`, port 5173) and the
node (`npm run dev:server`, port 8787) on the same machine for a
test pilot:

1. Open the PWA at <http://localhost:5173>.
2. Go to **Profile → Community node**, paste
   `http://localhost:8787` into the URL field, tick "Mirror
   finalized exchanges to this node", and Save.
3. Use the dev member-switcher to walk through a full claim →
   confirm → confirm cycle. After the second confirm, the chip
   under "Community node" should turn from "1 pending in outbox" to
   "Last success: …".
4. `curl http://localhost:8787/exchanges` should return the row.

Two things to know:

- **The dev server doesn't enforce CSP**, so the cross-origin POST
  works. In production behind Caddy, the `connect-src` directive
  on the PWA's CSP must include the node's origin (the §6 Caddy
  example serves both from the same origin under `/api/`, which
  works without any CSP relaxation).
- **CORS** on the node is permissive by default (`CORS_ORIGIN=*`).
  For production, set `CORS_ORIGIN` to your PWA origin so a hostile
  page can't make members' browsers POST to your node.

### Configuration (env vars)

| Var | Default | Notes |
|-----|---------|-------|
| `HOST` | `127.0.0.1` (`0.0.0.0` in Docker) | Bind address |
| `PORT` | `8787` | TCP port |
| `DATABASE_PATH` | `./understoria.db` (`/data/understoria.db` in Docker) | SQLite file |
| `CORS_ORIGIN` | `*` | Set this to your PWA origin for production |
| `RATE_LIMIT_MAX` | `60` | Per-client requests per minute (see `TRUST_PROXY`) |
| `TRUST_PROXY` | *(unset)* | Set to `loopback` when behind the Caddy reverse proxy above. WITHOUT it, every request arrives from the proxy's loopback address and all clients share ONE rate-limit bucket — one abuser then throttles the whole community. With it, the real client IP (hashed to a bucket, never stored raw) drives per-client limiting. Leave unset only if the node is exposed directly with no proxy. |
| `AUTO_CONFIRM_REQUIRE_TRANSITION` | *(unset)* | When set to `1`/`true`, `/auto-confirm` refuses any request whose post/task has no stored awaiting-transition artifact — the fully-enforced waiting window. Leave unset until every member runs a build that pushes artifacts (the server enforces the window from artifacts whenever they exist, regardless of this flag) |
| `TABLE_ROW_CEILING` | `500000` | Disk-fill backstop: max rows per federated table. At the ceiling, POSTs answer 507 (honest clients' outboxes retry; nothing is deleted) until you raise the knob or prune. `0` disables |
| `PER_KEY_ROW_CEILING` | `10000` | Max rows per signing key per table — a LIFETIME count (record timestamps are client-claimed, so a rolling window would be dodgeable by backdating). Far above any honest member's output; raise it for legitimately high-volume communities. `0` disables |
| `LOG_LEVEL` | `info` | One of fatal/error/warn/info/debug/trace |
| `LOG_REQUEST_PATHS` | `false` | Set to `true` ONLY during triage |
| `NODE_ID` | `node_local` | Stable identifier for federation |
| `OPERATOR_NAME` | unset | Operator display name shown on `GET /config`. Omitted entirely if unset |
| `OPERATOR_FUNDING_NOTE` | unset | Free-form note about hosting funding (e.g. "donated since 2026-01") |
| `OPERATOR_CONTACT` | unset | Preferred operator contact (Matrix room, email, URL) |
| `PEER_NODE_URLS` | unset | Comma-separated base URLs of nodes to pull from. Each must be `http://` or `https://`; trailing slashes are stripped |
| `PEER_PULL_INTERVAL_MS` | `300000` (5 min) | How often the pull worker hits each peer |
| `NODE_SYSTEM_SECRET_KEY` | unset | Base64 Ed25519 secret for the §4 auto-confirm system key. Unset = auto-confirm signing off (the server warns loudly if a window is configured with no key). Generate via `scripts/generate-system-key.mjs`; rotation procedure in `system-key-rotation.md` |
| `NODE_SYSTEM_KEY_HISTORY` | unset | JSON array of retired system public keys (`[{"publicKey":"…","retiredAt":…}]`). Append-only across rotations — peers verify old auto-confirmed records against it. The server refuses to boot on a malformed entry |
| `AUTO_CONFIRM_MIN_HOURS` | `0` | Server-side floor under the community's `autoConfirmHours` setting. `0` = no auto-confirm via this node regardless of community config; also the safe way to disable auto-confirm without unpublishing key history |

The rate limiter uses a non-reversible bucket id (FNV-1a hash of the
IP, modulo 1024) so client IPs never reach memory or logs even
transiently. There are no IP fields in any log line by default.

### Federation pull (optional)

If `PEER_NODE_URLS` is set, the node periodically fetches signed
records from each peer over a small public surface:

- `GET /exchanges?since=<last>` — signed exchange ledger
- `GET /vouches?since=<last>` — signed web-of-trust vouches
- `GET /posts?since=<last>` — signed needs and offers (immutable
  subset only; the lifecycle fields stay local to each node)

Every record's signature is verified before insert. Pulled rows
keep their original `nodeId` (for exchanges) — federation is
replication of a signed ledger, not re-attribution. State per peer
(last pulled, last success, per-kind cursors, last error, count)
is visible via the public `GET /peers` endpoint.

Peering is unilateral: configuring peer B does not require B to
configure you back. Today, peer config is operator-managed via
env vars; Agent 15 on the roadmap (federation governance) will
replace this with signed federation agreements.

If both pulls for a peer fail at the same time, `lastError`
records the most recent message; subsequent successes do not
clear it (this avoids hiding a vouch failure when an exchange
pull succeeds in the same tick). Use `lastSuccessAt` vs.
`lastPulledAt` to tell whether the most recent attempt
succeeded — when those timestamps match, all is well.

### Reverse proxy

Place the node behind Caddy on the same host. Adjust the Caddyfile
from §4:

```Caddyfile
aid.our-union.example {
  encode gzip zstd
  header { Strict-Transport-Security "max-age=31536000; includeSubDomains" }

  handle /api/* {
    uri strip_prefix /api
    reverse_proxy 127.0.0.1:8787
  }

  handle {
    root * /var/www/understoria
    try_files {path} /index.html
    file_server
    header {
      Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' /api/; img-src 'self' data:; manifest-src 'self'; frame-ancestors 'none'; base-uri 'self';"
    }
  }
}
```

Members' PWA POSTs signed exchanges to `/api/exchanges`; Caddy
forwards them to the node.

## 7. Backups

If you're running PWA-only: members' device exports are the backup.
Tell them to export from Profile → Data & privacy periodically.

If you're running the node: back up `/data/understoria.db` regularly.
Every row is signed, so even a compromised backup can't be tampered
with undetectably — but lost backups mean lost history. A simple
nightly cron is sufficient:

```sh
docker exec understoria sqlite3 /data/understoria.db ".backup '/data/backup-$(date +%F).sqlite'"
```

…then move the resulting file off the host. Encrypt at rest before
storing on third-party infrastructure.

## 8. Things that are NOT yet built (and what to do about it)

| Feature | Status | Operator workaround |
|---------|--------|---------------------|
| Federation between nodes | Shipped (§6 pull loop: exchanges, vouches, posts, claims, task comments, events, invitations) | Configure `PEER_NODE_URLS`; proposals/disputes remain local-only by design |
| Project & task state (community-node sync) | Shipped (`POST/GET /project-states`, `/task-states` — `docs/project-federation.md`) | Signed last-writer-wins state records; the node's first MUTABLE tables (a newer authorized version REPLACES the stored row, so they don't grow with edit volume — insert caps bound row count). Nothing to operate; back up with the same database. NOT in the cross-node `peerPull` loop yet — single-community scope |
| Event participation (RSVPs, shifts, signups) | Shipped (`POST/GET /event-rsvps`, `/event-shifts`, `/shift-signups` — `docs/project-federation.md` §6) | Same mutable LWW posture; RSVPs/signups keyed by natural key (one row per member per event/shift), deletions stored as tombstones. Deliberately NOT in `peerPull`: attendance data never leaves your community's node |
| Direct messaging | Shipped in the PWA (end-to-end encrypted; the node never sees plaintext) | — |
| Server-side panic button / dead-man's-switch | Pending | Member-level soft/hard purge exists; `docker compose down -v` wipes the volume |
| Open-invite server storage | Intentionally absent | Invites never cross any wire (the old `POST/GET /invites` surface was removed); only signed redemption receipts and revocations federate |
| Device-link relay | Shipped (`POST/GET /device-link`, `POST/GET /link-request`) | Ephemeral device-linking surfaces: a one-shot encrypted mailbox (ciphertext only, 15-minute TTL) plus tap-to-link rendezvous rows (one throwaway public key each, 10-minute TTL, bucketed by a salted address fold). Neither federates; both are capped and pruned on every write — nothing to operate or back up. **Tap-to-link needs `TRUST_PROXY` set as documented in §4**: without it every client shares the proxy's address, so all members land in ONE rendezvous bucket and see each other's link requests (harmless but confusing — approval still requires the member's own tap) |
| Automated dependency scanning | Manual | Run `npm audit` weekly; subscribe to advisories |

Each of these is tracked in the [Threat Model](threat-model.md) §7.

## 9. Security posture checklist

Run through this once a month, at least. More often during pilot.

- [ ] Host OS updates applied.
- [ ] TLS certificate renews automatically (Caddy does this; double-check logs).
- [ ] `npm audit` clean on the build you're serving.
- [ ] Caddy access log retention is 7 days or less (set in `log { ... }`).
- [ ] IPs are not recorded (configure `log { output discard }` if needed,
      at least for paths that leak member activity).
- [ ] The deployed build matches a tagged release, not a random main
      checkout.
- [ ] You can reach every active pilot member through a non-Understoria
      channel in case you need to tell them something.

## 10. When something goes wrong

A compromise indicator could be:

- Members reporting posts or messages they didn't make.
- TLS alerts from the host.
- Caddy logs showing traffic patterns that don't match your community.
- Your own lost device.

Containment:

1. Tell active members via your out-of-band channel (Signal group,
   phone tree). Don't announce on Understoria itself.
2. If the host is compromised, take the site offline until you've
   rebuilt from a trusted machine. Members keep their local data;
   they just can't reach each other during the outage.
3. If your operator key is compromised, issue a fresh key, re-vouch
   for existing members from it, and revoke the old one. (Vouch
   revocation is planned work; in the interim, announce the change
   out-of-band and ask members to vouch for each other from fresh
   keys.)

Follow-up in [threat-model.md](threat-model.md) §9 — add whatever you
learned to the review queue.

## 11. Running more than one community on one host

You can. Serve each community from its own subdomain with its own
CSP; the browsers will treat them as independent origins and
IndexedDB will separate the data. Do not let them share DNS or TLS
certificates — a subdomain takeover on one would cascade to the
other.

## 12. Decommissioning a node

One day you may hand the operator role to someone else, or shut the
node down.

1. Announce the change out-of-band, with at least two weeks' notice.
2. Tell members to export their data (Profile → Data & privacy →
   Export my data).
3. On the chosen cutoff date, stop the web server. Members retain
   everything on their devices.
4. If you're handing off, transfer the domain, the host credentials,
   the CSP/TLS config, and a printed copy of this guide.

---

*Flag anything here that's stale:
<https://github.com/ardentcascades/understoria/issues>.*
