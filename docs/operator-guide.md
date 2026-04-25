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
   the PWA uses, and stores them in a local SQLite file. This is the
   foundation for federation across communities (cross-node sync is
   the next workstream).

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

The output goes to `apps/web/dist/` — five files and some hashed
assets, about 400 KB total. That's what you serve.

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

1. The app seeds a demo community (five fictional members). For a
   real pilot, you can leave these in during shakedown and wipe them
   before inviting anyone: **Profile → Emergency → Hard purge**.
2. Set a display name under **Profile → About you**.
3. Set a passphrase under **Profile → Security**. As the operator,
   you'll be issuing the first invites — your key really matters.
   Write the passphrase on paper. Put the paper somewhere safe.
4. **Profile → Invites → Generate invite link** for each founding
   member. Deliver links through a channel you trust (in person is
   best; Signal is a reasonable second choice).
5. Verify each new member's key fingerprint in person or on a voice
   call before confirming they're who you think they are.

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

It does **not** yet:
- Speak federation protocol to peer nodes (next workstream).
- Accept posts, vouches, invites, or messages — that's incremental.
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

### Configuration (env vars)

| Var | Default | Notes |
|-----|---------|-------|
| `HOST` | `127.0.0.1` (`0.0.0.0` in Docker) | Bind address |
| `PORT` | `8787` | TCP port |
| `DATABASE_PATH` | `./understoria.db` (`/data/understoria.db` in Docker) | SQLite file |
| `CORS_ORIGIN` | `*` | Set this to your PWA origin for production |
| `RATE_LIMIT_MAX` | `60` | Per-bucket requests per minute |
| `LOG_LEVEL` | `info` | One of fatal/error/warn/info/debug/trace |
| `LOG_REQUEST_PATHS` | `false` | Set to `true` ONLY during triage |
| `NODE_ID` | `node_local` | Stable identifier for federation |

The rate limiter uses a non-reversible bucket id (FNV-1a hash of the
IP, modulo 1024) so client IPs never reach memory or logs even
transiently. There are no IP fields in any log line by default.

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
| Federation between nodes | Pending (next workstream) | Run one node per community for now |
| Direct messaging | Pending (Agent 2 task 5) | Members coordinate via Signal |
| Server-side panic button / dead-man's-switch | Pending | Member-level soft/hard purge exists; `docker compose down -v` wipes the volume |
| Posts / vouches / invites endpoints | Pending | Members exchange invite tokens out of band |
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

*This guide will grow as Agent 3 lands the proper server. Flag
anything here that's already stale: <https://github.com/ardentcascades/understoria/issues>.*
