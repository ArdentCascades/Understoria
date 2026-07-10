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
2. Set a passphrase under **Profile → Settings → Security**. As the operator,
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
  oldest-first (ascending timestamp, so pulls page forward from a
  cursor). Every row is signed and any peer can independently
  verify with the same code path.

The exchange pair above is the original core; the same
accept-verified-and-serve pattern has since grown to posts, vouches,
claims, task comments, community events (+ cancellations),
co-organizer invitations, invite redemptions/revocations, and
awaiting-transition records — each with its own route file under
`apps/server/src/routes/`. Not every kind rides the §6 peer pull,
though: the cross-node loop replicates exchanges, vouches, posts,
task comments, co-organizer invitations (+ responses and
revocations), and events (+ cancellations). Claims, redemption
receipts, and invite revocations stay off the cross-node wire
(they replicate only between mirrors of the same community; see
`MIRROR_NODE_URLS`), and awaiting-transition records are POST-only
by design — they have no feed at all.

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
2. Go to **Profile → Settings → Community node**, paste
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
| `TRUST_PROXY` | *(unset)* | Set when behind a reverse proxy — the right value depends on where the proxy connects from. Bare-metal Caddy as above (`reverse_proxy 127.0.0.1:8787`): set `loopback`. The bundled Docker compose stack: set `true` — Caddy reaches the server from a compose-network address, not loopback, so `loopback` would silently do nothing there. WITHOUT it, every request arrives from the proxy's address and all clients share ONE rate-limit bucket — one abuser then throttles the whole community. With it, the real client IP (hashed to a bucket, never stored raw) drives per-client limiting. Leave unset only if the node is exposed directly with no proxy. |
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
| `NODE_SYSTEM_KEY_HISTORY` | unset | JSON array of retired system public keys (`[{"pubkey":"…","retiredAt":…}]`). Append-only across rotations — peers verify old auto-confirmed records against it. The server refuses to boot on a malformed entry |
| `AUTO_CONFIRM_MIN_HOURS` | `168` (7 days) | Server-side floor under the community's `autoConfirmHours` setting. Set `0` to disable auto-confirm via this node regardless of community config — also the safe way to turn it off without unpublishing key history |
| `DATABASE_KEY` | unset | Encryption-at-rest key for the SQLite file (SQLCipher scheme). Set it and the database on disk is unreadable without it — a stolen backup or seized disk yields nothing. Unset keeps plaintext (upgrades don't break). **Keep a copy of the key somewhere that is NOT next to the database backups** — a backup without its key is a brick, which is the point. Migrating an existing plaintext DB: see the runbook below |
| `READ_AUTH` | `off` | Member-authenticated reads (`docs/member-authenticated-reads.md`). `off` = feeds open as before. `on` = every federation GET must carry a member's read signature (or a peer token). Members' apps sign reads automatically; flip to `on` only after everyone runs a signing build — see the rollout runbook below |
| `NODE_FOUNDER_KEYS` | unset | Comma-separated base64 public keys of the founding member(s) — the trust roots the invite chain grows from. Required when `READ_AUTH=on` (boot refuses otherwise). Each member's public key is on their Profile page |
| `PEER_READ_TOKENS` | unset | JSON map `{"https://peer.example": "<shared token ≥16 chars>"}`. Outgoing pulls to a mapped peer send the token; inbound reads presenting any mapped token are accepted as peer reads. Exchange tokens with the other operator the same way you exchange `PEER_NODE_URLS`. Only needed when either side enforces `READ_AUTH=on` |
| `MIRROR_NODE_URLS` | unset | Comma-separated base URLs of MIRROR nodes — other nodes of THIS SAME community (`docs/community-resilience.md` §B). Unlike peers, mirrors replicate EVERY durable kind, including project/RSVP/shift state and redemption receipts. Each mirror pulls from the others; set it on every node in the set (full mesh) |
| `MIRROR_READ_TOKENS` | unset | JSON map `{"https://mirror.example": "<shared token ≥16 chars>"}` — bearer tokens the mirror worker sends when pulling from a `READ_AUTH=on` mirror. Same shape and hygiene as `PEER_READ_TOKENS` |
| `MIRROR_ANNOUNCE_URLS` | unset | Comma-separated mirror URLs published in `GET /config.mirrors`. Members' apps offer each announced mirror on a consent card and, once accepted, fail over to it automatically. Announce only addresses meant to be exactly as reachable as this node — the config surface is public |
| `MIRROR_PULL_INTERVAL_MS` | `60000` (1 min) | How often the mirror replication worker runs a pull cycle |
| `RESEED_GRACE_UNTIL` | unset | Re-seed recovery window end (RFC3339 or epoch ms; `docs/community-reseed.md` §3). Until then, `POST /redemptions` accepts historical receipts past the delivery-grace bound and preserves their wire `receivedAt`. Boot refuses windows ending >30 days out; the server logs loudly while one is open. Set it during recovery, unset it after |
| `TRUSTED_SYSTEM_KEYS` | unset | JSON array `[{"nodeId":"node_lost","current":"<pubkey>","history":[…]}]` naming LOST nodes whose auto-confirmed exchanges this node should accept on re-upload. Members' apps capture the value to copy (Settings → restore card). Fail-closed when unset |
| `REMOVAL_QUORUM` | `3` | Co-signatures required on a member removal / reinstatement record (`docs/member-removal.md` §2). Published on `GET /config` so member devices verify against the community's real rule. MUST match across a mirror set, like `NODE_FOUNDER_KEYS` — set it thoughtfully relative to community size |

The rate limiter uses a non-reversible bucket id (FNV-1a hash of the
IP, modulo 1024) so client IPs never reach memory or logs even
transiently. There are no IP fields in any log line by default.

### Runbook: turning on member-authenticated reads

Until you flip this, anyone who learns your node's URL can READ the
community's records (they can't forge anything — but reading was
never invite-gated). To close that:

1. Confirm every member runs an app version that signs reads (any
   build from this feature onward — the app signs unconditionally,
   so there's nothing for members to configure).
2. Collect the founding member(s)' public keys (Profile page) and
   set `NODE_FOUNDER_KEYS=<key1>,<key2>`. Everyone who joined via an
   invite is recognized automatically through their redemption
   receipt chain — you only name the members who never redeemed an
   invite.
3. If you peer with other communities, exchange tokens and set
   `PEER_READ_TOKENS` on both sides FIRST — an enforcement-on node
   with no tokens simply stops serving its peers.
4. Set `READ_AUTH=on` and restart. Watch for members reporting
   "app stopped syncing": the usual causes are a member who joined
   before invite receipts existed (add their key to
   `NODE_FOUNDER_KEYS`), or a passphrase-locked device (reads sign
   only while unlocked; syncing resumes at unlock).

### Runbook: recovering from total node loss (re-seed)

When EVERY node of a community is gone — machine seized, disk dead,
no mirror — members' devices still hold the entire shared history,
and any member can upload it back (`docs/community-reseed.md`):

1. Stand up a fresh node (install per §3; new `DATABASE_KEY`). Use
   the old address if you control it — members' apps then need no
   reconfiguration — otherwise share the new URL.
2. Set the SAME `NODE_FOUNDER_KEYS` as the lost node, and
   `READ_AUTH=off` for the moment (writes are what recovery needs;
   flip reads back on in step 5).
3. Set `RESEED_GRACE_UNTIL` to a few days out — historical
   membership receipts arrive years "late" and must not be refused.
   Set `TRUSTED_SYSTEM_KEYS` to the lost node's auto-confirm key so
   its auto-confirmed exchanges re-verify; any member's app shows
   the captured value on the restore card (Settings).
4. Ask members to open Settings → "Restore this community onto a
   node" and run it. One member restores everything their device
   holds; several at once is fine (copies union). **Start with the
   seed vaults** — members whose pledge shows on the resilience
   card hold the complete archive by promise, while devices that
   freed up space hold a window plus their pinned set
   (`docs/storage-budget.md`). Consider a temporarily raised
   `RATE_LIMIT_MAX` for a large community.
5. Once the counts settle: flip `READ_AUTH=on` (membership derives
   from the restored receipts), UNSET `RESEED_GRACE_UNTIL`, restart.
   Registering a new `NODE_SYSTEM_SECRET_KEY` for future
   auto-confirms follows `system-key-rotation.md`.

What does not come back, honestly: open claims (short-lived
coordination state) and pending auto-confirm timers (they restart on
re-delivery). Everything signed comes back.

### Runbook: pairing two nodes as mirrors

Mirrors make "one server disappears, nobody notices, nothing is
lost" literally true (`docs/community-resilience.md` §B). Checklist
for adding a second node run by another member:

1. The new node matches the community's trust settings: same
   `NODE_FOUNDER_KEYS`, same `READ_AUTH` state, its own
   `DATABASE_KEY`. **A mirror running `READ_AUTH=off` serves the
   whole replicated dataset to anyone with its URL** — the gate must
   match on every node.
2. On EACH node, set `MIRROR_NODE_URLS` to the other node(s). If
   `READ_AUTH=on`, also exchange `MIRROR_READ_TOKENS` (≥16 chars,
   out of band). With three or more nodes, list ALL the others on
   each node — the exchange verifier resolves auto-confirm keys
   across the whole set.
3. On the node members already use, add the new node's address to
   `MIRROR_ANNOUNCE_URLS`. Members' apps will show a consent card
   naming it; once a member accepts, their app fails over to it
   automatically whenever the primary is unreachable. Announcing is
   an invitation — nothing is used without the member's yes.
4. Restart both. Watch the logs for `mirror pull` lines; a brand-new
   mirror catches up from zero in pages (historical redemption
   receipts included — the membership closure derives identically on
   both nodes).
5. `NODE_SYSTEM_SECRET_KEY` stays on ONE node only (the auto-confirm
   signer). If that node is ever lost, register a new system key on
   a surviving mirror per `system-key-rotation.md`.

The new operator should read `docs/operator-powers.md` — a mirror
operator holds every power that page names, and the member-facing
consent card says as much.

### Runbook: encrypting an existing database at rest

A NEW deployment just sets `DATABASE_KEY` before first boot. To
convert an existing plaintext database:

```bash
# 1. Stop the node. 2. Then, with the sqlite3-mc-capable CLI or a
#    one-off node script:
node -e "
const D = require('better-sqlite3-multiple-ciphers');
const db = new D('understoria.db');
db.exec(\"ATTACH DATABASE 'understoria.enc.db' AS enc KEY 'YOUR-NEW-KEY'\");
db.exec(\"SELECT sqlcipher_export('enc')\");
db.exec(\"DETACH DATABASE enc\");
db.close();
"
# 3. Move understoria.db somewhere safe (it is the PLAINTEXT copy —
#    shred it once the encrypted one is verified), rename
#    understoria.enc.db into place, set DATABASE_KEY, start, verify,
#    then destroy the plaintext copy.
```

Escrow the key separately from the backups (a printed copy in the
community's records works). Losing the key = losing the node's copy
of the data — recoverable only because every member's device holds
the community dataset (a fresh node can be repopulated by members'
outboxes re-pushing, but history convergence is manual work you
don't want).

### Federation pull (optional)

If `PEER_NODE_URLS` is set, the node periodically fetches signed
records from each peer over a small public surface:

- `GET /exchanges?since=<last>` — signed exchange ledger
- `GET /vouches?since=<last>` — signed web-of-trust vouches
- `GET /posts?since=<last>` — signed needs and offers (immutable
  subset only; the lifecycle fields stay local to each node)
- `GET /task-comments?since=<last>` — signed task comments
  (including tombstones, so soft-deletes converge)
- `GET /coorg-invitations`, `GET /coorg-invitation-responses`,
  `GET /coorg-invitation-revocations` — the co-organizer trio
- `GET /events` and `GET /event-cancellations` — signed community
  events and their cancellations

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
Tell them to export from Profile → Settings → Data & privacy periodically.

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
| Federation between nodes | Shipped (§6 pull loop: exchanges, vouches, posts, task comments, co-organizer invitations + responses + revocations, events + cancellations; claims replicate only between mirrors of the same community) | Configure `PEER_NODE_URLS`. Proposals, votes, and closures federate within the community (`docs/proposal-federation.md` — signed, member-gated records on this node); they deliberately stay out of the cross-node `peerPull` loop |
| Project & task state (community-node sync) | Shipped (`POST/GET /project-states`, `/task-states` — `docs/project-federation.md`) | Signed last-writer-wins state records; the node's first MUTABLE tables (a newer authorized version REPLACES the stored row, so they don't grow with edit volume — insert caps bound row count). Nothing to operate; back up with the same database. NOT in the cross-node `peerPull` loop yet — single-community scope |
| Event participation (RSVPs, shifts, signups) | Shipped (`POST/GET /event-rsvps`, `/event-shifts`, `/shift-signups` — `docs/project-federation.md` §6) | Same mutable LWW posture; RSVPs/signups keyed by natural key (one row per member per event/shift), deletions stored as tombstones. Deliberately NOT in `peerPull`: attendance data never leaves your community's node |
| Direct messaging | Shipped in the PWA (end-to-end encrypted; the node never sees plaintext) | — |
| Server-side panic button / dead-man's-switch | Pending | Member-level soft/hard purge exists; `docker compose down -v` wipes the volume |
| Open-invite server storage | Intentionally absent | Invites never cross any wire (the old `POST/GET /invites` surface was removed); only signed redemption receipts and revocations federate |
| Device-link relay | Shipped (`POST/GET /device-link`, `POST/GET /link-request`) | Ephemeral device-linking surfaces: a one-shot encrypted mailbox (ciphertext only, 15-minute TTL) plus tap-to-link rendezvous rows (one throwaway public key each, 10-minute TTL, bucketed by a salted address fold). Neither federates; both are capped and pruned on every write — nothing to operate or back up. **Tap-to-link needs `TRUST_PROXY` set as documented in the §6 env table** (`loopback` bare-metal, `true` under compose): without it every client shares the proxy's address, so all members land in ONE rendezvous bucket and see each other's link requests (harmless but confusing — approval still requires the member's own tap) |
| Member-gated reads | Shipped, staged (`READ_AUTH` — see the §6 runbook) | Default off for rollout. Until flipped, anyone with the URL can READ the feeds (writing always required valid signatures). Flip it once every member runs a current app build |
| Encryption at rest | Shipped (`DATABASE_KEY` — see the §6 runbook) | Optional but recommended; escrow the key separately from backups |
| Member removal / read revocation | Shipped (`docs/member-removal.md` M1–M3) | Quorum-signed `MemberRemoval` records (`REMOVAL_QUORUM` co-signatures, default 3) close a member's standing; reinstatement is the same ceremony in reverse. The removed-author gate refuses their new writes; history is never erased. Requires `NODE_FOUNDER_KEYS` (the trust roots the membership resolver grows from). Nothing to operate beyond setting the two env knobs |
| Automated dependency scanning | Manual | Run `npm audit` weekly; subscribe to advisories |

Each of these is tracked in the [Threat Model](threat-model.md) §7.

**Storm-ready?** `docs/offline-resilience.md` §4 is the runbook for
a go-bag hub node that keeps the community functioning through a
regional internet outage — a mirror + WiFi AP + local DNS, built
and drilled in good times.

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
2. Tell members to export their data (Profile → Settings → Data &
   privacy → Export my data).
3. On the chosen cutoff date, stop the web server. Members retain
   everything on their devices.
4. If you're handing off, transfer the domain, the host credentials,
   the CSP/TLS config, and a printed copy of this guide.

---

*Flag anything here that's stale:
<https://github.com/ardentcascades/understoria/issues>.*
