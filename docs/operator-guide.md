# Node Operator Guide

> **Audience:** whoever volunteers to run Understoria for a community.
> You should be comfortable on a command line and editing a config file.
> Everything else we explain.

This guide covers the **current, pre-federation** deployment model.
Understoria today is a client-side Progressive Web App; every member's
data lives in their own browser's IndexedDB. There is no Node.js
server yet. Agent 3 on the roadmap delivers the self-hostable node
and the federation protocol; until that lands, the operator role is
"serve static files and help members when they get stuck."

This is, honestly, a reasonable way to start a pilot.

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

- Storing member data. There is no central store on your side yet.
  Every member's exchanges, messages, and keys live on their device.
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
    §7 about third-party exposure.
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

## 6. Backups

Right now, the only state that matters lives on each member's device,
and the data-export button in Profile is the way they back it up.
Tell members to export and store the file offline periodically.

Server-side backups become relevant once Agent 3 lands the Node.js
server with SQLite / SQLCipher. For now there's nothing on your side
to back up.

## 7. Things that are NOT yet built (and what to do about it)

| Feature | Status | Operator workaround |
|---------|--------|---------------------|
| Federation between nodes | Pending (Agent 3) | Run one node per community for now |
| Direct messaging | Pending (Agent 2 task 5) | Members coordinate via Signal |
| Server-side panic button / dead-man's-switch | Pending | Member-level soft/hard purge exists |
| Node-level audit logs | Pending | Caddy access logs on the host, short retention |
| Automated dependency scanning | Manual | Run `npm audit` weekly; subscribe to advisories |

Each of these is tracked in the [Threat Model](threat-model.md) §7.

## 8. Security posture checklist

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

## 9. When something goes wrong

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

## 10. Running more than one community on one host

You can. Serve each community from its own subdomain with its own
CSP; the browsers will treat them as independent origins and
IndexedDB will separate the data. Do not let them share DNS or TLS
certificates — a subdomain takeover on one would cascade to the
other.

## 11. Decommissioning a node

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
