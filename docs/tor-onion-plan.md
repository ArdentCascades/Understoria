# Tor onion-service reachability + paper mirror/onion addresses — implementation plan

> **Status: C1 SHIPPED** (`deploy/tor/Dockerfile` + `deploy/torrc` + Caddy
> onion vhost + compose `tor` service/profile/`tor-keys` volume/caddy
> `ONION_MARK_SECRET` env + `docs/tor-onion.md` runbook + pointer paragraphs
> in operator-guide §9, deploy-linode, deploy-alternatives §3.5). C2 (onion
> rate-limit lane + web origin-lock tests) and C3 (paper surfaces +
> threat-model/guides) remain PROPOSED; §4 D1 applied as recommended for
> now — paper/runbook-only visibility.
> Original status: PROPOSED (code-verified 2026-07-25 against the working tree at
> `27312e6`). First item of the operator-approved authoritarian-resilience
> initiative. Discipline model: `docs/react-19-plan.md` (verified ground truth →
> design decisions with rationale → phased commits with gates → named
> risks/rollback → audit trail). Philosophy: **deploy config + docs + paper
> first, smallest honest code diff second**. The onion is an *additional front
> door to the same node*, never a replacement for the clearnet domain, and never
> a new npm dependency.

## 0. Verified ground truth

**Deploy surface (read in full: `deploy/Caddyfile`, `docker-compose.yml`,
`docs/deploy-linode.md`, `docs/deploy-alternatives.md`, `scripts/setup.sh`).**

- The reference deployment is three compose services; **only `caddy` binds host
  ports** (80/443/443-udp, `docker-compose.yml:181-184`). The node
  (`understoria`) is `expose: 8787` on the compose bridge network only; TLS
  terminates in Caddy; the PWA dist is served by Caddy from the shared
  `web-dist` volume. The Caddyfile has ONE site block, `{$DOMAIN}`, with
  ACME (`email {$ACME_EMAIL}`), HSTS, and a CSP whose `script-src` carries a
  sha256 hash for the inline bootstrap in `index.html`
  (`deploy/Caddyfile:52-59`). `handle_path /api/*` strips the prefix and
  proxies to `understoria:8787`.
- The bare-metal shape (`docs/deploy-alternatives.md` §3) is systemd +
  `HOST=127.0.0.1 PORT=8787` + native Caddy adapted in exactly three places
  (§3.5); §4 states the six-point reverse-proxy contract, whose point 5
  ("Terminate TLS with a real certificate… the PWA is service-worker based and
  will not install over plain HTTP") the onion vhost deliberately relaxes —
  Tor supplies transport encryption and endpoint authentication instead of TLS,
  and SW-less operation is verified graceful (below). Podman (§2) runs the same
  compose file. K8s is a named non-goal (§5).
- `scripts/setup.sh` writes `.env` with `TRUST_PROXY=true` for the bundled
  stack (header comment, step 6). It is not extended in this plan (named out of
  scope; the runbook documents the manual steps).

**Server origin/host/rate-limit assumptions (`apps/server/src/server.ts`,
`config.ts`).**

- **No cookies anywhere** (`grep -rin cookie apps/server/src` → 0 non-license
  hits; client fetches use `credentials: "omit"`, `nodeSubmit.ts:529`).
  Authentication is signatures (`x-understoria-key/ts/sig` headers).
- **CORS** is a decorate-only `onRequest` hook (`server.ts:207-233`): if
  `Origin` matches `config.corsOrigin` exactly (or `*`) it adds ACAO headers;
  it never *rejects* a mismatched origin. The canonical deploy is same-origin
  (comment at `server.ts:220-224`). An app loaded from the onion origin fetches
  `/api` **same-origin** → no preflight, no ACAO needed → **zero CORS changes
  required**. `CORS_ORIGIN` stays the clearnet PWA origin.
- **No host/origin checks, no absolute-URL construction** server-side that an
  onion Host header would break (routes are path-only; verified by reading
  `server.ts` route registration end-to-end).
- **Rate limiting — the collapse is real and quantified.**
  `@fastify/rate-limit` (installed **11.1.0**) with `max: config.rateLimitMax`
  (default 60/min), `keyGenerator: (req) => hashIpToBucket(req.ip)`
  (`server.ts:198`, hash fn at 664-671, 1024 buckets), `allowList` via the
  per-boot `MIRROR_INTERNAL_HEADER` (`x-understoria-internal`,
  `mirrorPull.ts:108`) token. `trustProxy` comes from `TRUST_PROXY`
  (`server.ts:169`, parse at `config.ts:604-610`) — `true` under compose, so
  `req.ip` = first `X-Forwarded-For` entry set by Caddy. Behind the onion
  vhost Caddy sees every request from the **tor sidecar's single container
  IP** → every Tor member lands in ONE bucket. The client sync loop runs hot
  at **12 s intervals** (`syncLoop.ts:81 HOT_MS = 12_000`) with a dozen-plus
  pull kinds per cycle (`federationSync.ts`) — **a single active Tor member
  already consumes ~the whole default 60/min budget**; two starve each other.
  "Accept and document" is untenable; a design answer ships in C2 (§1.4).
  Verified enabler: @fastify/rate-limit 11.1.0 accepts `max` as
  `(req, key) => number` (`types/index.d.ts:115-118`).
- **The node emits HSTS + `upgrade-insecure-requests` on every `/api`
  response** — verified *empirically* by injecting a request through
  `@fastify/helmet` registered exactly as `server.ts:175-188` registers it:
  helmet's defaults merge in `strict-transport-security: max-age=31536000;
  includeSubDomains` and a CSP containing `upgrade-insecure-requests`. Over
  the onion (plain HTTP in a browser that treats `.onion` as trustworthy) a
  cached HSTS would demand an `https://…onion` that doesn't exist. The onion
  vhost must strip it (`header_down -Strict-Transport-Security`); the CSP on
  JSON responses is inert (CSP governs documents/workers, not fetched data).
- `parseUrlList` server-side (`config.ts:621-646`) **accepts `http:`** — an
  onion URL is *config-legal* in `MIRROR_ANNOUNCE_URLS` / `PEER_NODE_URLS`,
  which is exactly why §1.6 explicitly forbids announcing it as a mirror.

**Client URL handling (read: `lib/nodeSubmit.ts`, `lib/nodeEndpoints.ts`,
`lib/nodeOriginSuggest.ts`, `lib/appOrigin.ts`).**

- `normalizeNodeUrl` is trim + strip trailing slashes (`nodeEndpoints.ts:149`);
  `joinUrl` uses `new URL()` (`nodeSubmit.ts:574-588`); the client mirror-list
  filter is `/^https?:\/\//` (`nodeEndpoints.ts:184`, again at 505); the
  Profile connect form is a bare `<input type="url">` with **no protocol
  enforcement** (`NodeSection.tsx:135-142`). **`http://<x>.onion/api` passes
  every validation layer today.**
- The origin-derived node suggestion **already works on an onion origin**:
  `isExcludedOrigin` (`nodeOriginSuggest.ts:60-76`) excludes only
  non-http(s), localhost, 0.0.0.0, `[::1]`, and 127.0.0.0/8 — an onion origin
  passes; `deriveCandidateNodeUrl` yields `http://<x>.onion/api`; the
  `/api/health` probe is same-origin. `deriveAppOriginFromNodeUrl`
  (`appOrigin.ts:30-43`) accepts http and inverts it. **Mode (a) — the whole
  app loaded via the onion — needs ZERO client URL changes.** C2 adds lock
  tests so this stays true.
- **Mode (b) — clearnet-HTTPS-loaded app adding an onion *mirror* — is
  structurally impossible twice over**: `fetch("http://x.onion/…")` from an
  `https:` document is blocked mixed content, and a non-Tor-routed browser
  cannot resolve `.onion` at all. **Scoped OUT** (§1.2); the onion path is
  "load the app itself via Tor."
- `shareOrigin()` (`appOrigin.ts:59-63`) is `window.location.origin` on web —
  invites/QRs minted while browsing the onion carry the onion origin (§1.7).
  Primed at boot (`main.tsx:49`) and in `writeSubmitConfig`.

**Web Crypto / secure context / service worker.**

- `crypto.subtle` is used in exactly **2 files**: `lib/passphrase.ts`
  (PBKDF2; `getSubtle()` at 221-226 **throws a clear error** if absent — the
  failure is contained to enabling passphrase protection) and
  `lib/passkeyUnlock.ts` (WebAuthn PRF — inherently secure-context-only). All
  identity/signing crypto is tweetnacl (pure JS, works in insecure contexts);
  `crypto.getRandomValues` is universal. `grep isSecureContext src` → **0**;
  nothing hard-gates on it.
- **Secure-context claim + honesty about verification:** the W3C Secure
  Contexts algorithm lets a UA treat additional origins as potentially
  trustworthy; Tor Browser flips Firefox's `.onion` allowance
  (Mozilla bug 1382359, pref `dom.securecontext.allowlist_onions`) so
  `http://<x>.onion` gets `isSecureContext === true` and a live
  `crypto.subtle`. **Live fetch of MDN/W3C/torproject to source this was
  BLOCKED by this planning environment's egress policy** (CONNECT 403 to
  `www.w3.org:443` et al. — recorded in §7). The claim therefore ships as a
  **C2 runtime gate**: in Tor Browser on the onion, assert
  `window.isSecureContext === true` and `!!crypto.subtle` in the console
  before C2 is called done. Plain Chrome via Orbot does NOT treat http-onion
  as secure → passphrase/passkey enrollment unavailable there (documented
  degradation, §5 risk 4).
- **SW degradation is already graceful**: the only registration path is
  `useRegisterSW` (`components/UpdatePrompt.tsx:47`; `grep registerSW|
  navigator.serviceWorker src` finds nothing else) and vite-plugin-pwa's
  client guard is `if ("serviceWorker" in navigator)` (verified in the
  installed `node_modules/vite-plugin-pwa/dist/client/build/react.js:29` and
  `register.js:26`) — absent SW (Tor Browser "Safest", private windows) means
  registration is silently skipped, `needRefresh` never fires, the app runs
  network-live. No code change needed; C2 adds the manual check.

**Paper surfaces (`pages/PrintOfflineKit.tsx`, `lib/offlineKit.ts`,
`docs/paper-systems.md` P4).**

- `/print/offline-kit` (route `App.tsx:166`, entry `Infrastructure.tsx:347`)
  renders poster + 2-up wallet cards from `shareOrigin()`
  (`PrintOfflineKit.tsx:57-58`). The established pattern for
  data-the-app-can't-know is **screen-only inputs (`print:hidden`) the member
  types before printing** (SSID/password, lines 64-92), with honest
  degradation when empty. The WiFi QR builder is `wifiQrValue`
  (`offlineKit.ts:39-50`). i18n keys live under `print.kit.*` in `en.json`
  (line 3644) **and** `es.json` ('kit' present; `i18n/parity.test.ts` enforces
  key parity). Test model: `PrintOfflineKit.test.tsx` (createRoot/act harness,
  QR mocked, 3 locks).
- Accepted mirrors are member-consented and readable via
  `readAcceptedMirrors()` (`nodeEndpoints.ts:190`) — the natural prefill for a
  "backup addresses" field. Mirror announcement machinery:
  `GET /config.mirrors` from `MIRROR_ANNOUNCE_URLS` (`routes/config.ts:142`,
  `docs/community-resilience.md` §B).

**Docs inventory.** `docs/threat-model.md` §7 is the flat-bullet "Known gaps"
list (entry model: the "Print surfaces" bullet at line 2038 — shipped-status,
honest mitigations, residuals named). `docs/opsec-guide.md` exists (155 lines,
member-facing, sectioned "On your device/accounts/communication…").
`docs/operator-guide.md` §6 holds the env table (`RATE_LIMIT_MAX` at line 294),
§9 the security checklist. `docs/deploy-linode.md` ends with "Before going
public". `grep -ri "onion|tor browser" docs/ apps/` → no prior Tor work.
CI (`.github/workflows/ci.yml`): typecheck → web lint → build:server →
root `npm test` → build → `npm audit --audit-level=high`.

## 1. Design decisions (with rationale)

**1.1 The onion is a second front door to the SAME node, not a mirror.** One
tor daemon publishes `<x>.onion:80` → Caddy's internal HTTP listener → the same
`web-dist` + the same `understoria:8787`. Same database, same identity, same
membership. Resilience-to-node-loss stays the mirror system's job
(`community-resilience.md`); this feature is resilience-to-*network-blocking*.

**1.2 Usage-mode scoping.** Supported: **(a) load the whole app via the onion
in Tor Browser (or Tor Browser for Android)** — same-origin fetches, verified
zero client changes. Scoped out: **(b) onion as a *mirror* URL inside a
clearnet-loaded app** — mixed content + no Tor routing make it dead on arrival;
the docs say plainly "to use the onion, open the app AT the onion." A TLS-fied
onion (self-signed or an EV onion cert) is rejected as impractical ceremony.

**1.3 Caddy onion vhost: catch-all internal HTTP listener, no ACME, no HSTS.**
A new site block `http://:8080` (compose; `http://:8081` + `bind 127.0.0.1`
bare-metal). Rationale: a host-named block would need the onion hostname before
tor first boots (ordering knot); a catch-all on an **unpublished** port is
reachable only via the tor sidecar (compose publishes only 80/443 —
verified). Same `encode`, same CSP (identical `index.html`, same sha256 hash —
`scripts/csp-hash.sh` discipline unchanged), same `handle_path /api/*` +
static `handle`; **omits** `Strict-Transport-Security` and adds
`header_down -Strict-Transport-Security` on the proxy leg (kills the
helmet-emitted HSTS verified in §0).

**1.4 Rate limiting: a spoof-proof "onion lane" (C2), not bucket collapse.**
Precedent: the existing header-token compare (`MIRROR_INTERNAL_HEADER`).
New env `ONION_MARK_SECRET` (shared with Caddy) + `ONION_RATE_LIMIT_MAX`
(default 0 = lane off). The onion vhost sets
`header_up X-Understoria-Onion {$ONION_MARK_SECRET}` (overwriting any
client-sent value); the server keys requests bearing the correct secret to a
single `bucket_onion` whose budget is `ONION_RATE_LIMIT_MAX` (guidance:
`≈ 80 × expected concurrent Tor members`, floor 240). Spoof analysis: without
the secret a clearnet caller cannot enter (or inflate) the lane; direct node
access is impossible (port unpublished / loopback-bound). Residual: all Tor
users still share one budget — **inherent** (Tor's whole point is that they are
indistinguishable); documented in threat-model. Until C2 lands, C1 documents
the collapse and tells operators to raise `RATE_LIMIT_MAX` if Tor members
report starvation.

**1.5 Tor sidecar: in-repo Dockerfile over a third-party image.** A
`deploy/tor/Dockerfile` = `debian:bookworm-slim` + `apt-get install tor`
(Debian-security-maintained; matches the project's minimal-trust posture — no
unauditable community image), running as `debian-tor`, config from
`deploy/torrc` (`SocksPort 0` — service-only, no client), keys in a named
volume `tor-keys:/var/lib/tor`. Opt-in via compose **profiles**
(`profiles: ["onion"]`): `docker compose --profile onion up -d` — default
deployments are byte-identical to today. No inbound firewall change ever
(onion services make only outbound connections — works behind NAT).

**1.6 The onion is NOT announced in `MIRROR_ANNOUNCE_URLS`** (config would
accept it — §0), because clearnet-loaded apps would consent-card it and then
fail on mixed content. The onion address travels: on paper (1.8), in the
runbook, and (operator decision D1) later possibly on `/config`.

**1.7 Invites/share links over the onion: no change, behavior stated.**
`shareOrigin()` = the origin you're on; invites minted via the onion carry
`http://<x>.onion/invite#…` — correct (the inviter on a hostile network is
probably inviting someone on the same network) and documented in the member
passage: "share the regular address unless the recipient also needs Tor."
Desktop shell derives share origin from the configured node URL; pointing
desktop at an onion is out of scope, named.

**1.8 Paper: member-typed "backup addresses", the SSID pattern.** A third
screen-only field on `/print/offline-kit` (textarea, one address per line,
**prefilled** from `readAcceptedMirrors()` mapped through
`deriveAppOriginFromNodeUrl` — consented data already on-device; the member
pastes the onion address from the operator's announcement). Poster: a "If this
address is blocked" block, up to 3 addresses as text, each with a small
`InviteQRCode` (56-char onion addresses are untypeable; QR is the point).
Wallet card: text only (max 3). Empty field → block absent (honest
degradation). Nothing stored, nothing harvested — same posture as the WiFi
credential, and the threat-model §7 print entry is extended accordingly.

**1.9 Smallest honest in-app scope.** Phase 1 UI change = the print page only
(en+es keys, parity-enforced). No Infrastructure card, no in-app FAQ copy, no
onion field on `/config` — all parked as operator decisions (§4).

## 2. Phased commits

### C1 — "deploy: opt-in tor onion sidecar + onion runbook" (config + docs only, zero code)

Files: `deploy/tor/Dockerfile` (new), `deploy/torrc` (new),
`deploy/Caddyfile` (add onion site block), `docker-compose.yml` (add `tor`
service + `tor-keys` volume + pass `ONION_MARK_SECRET` to caddy),
`docs/tor-onion.md` (new operator runbook), pointer paragraphs in
`docs/operator-guide.md` §9, `docs/deploy-linode.md` "Before going public",
`docs/deploy-alternatives.md` §3 (bare-metal torrc + `http://:8081`/`bind
127.0.0.1` Caddy block + `systemctl enable tor`).

Exact additions:

```yaml
# docker-compose.yml
  tor:
    build: { context: ., dockerfile: deploy/tor/Dockerfile }
    image: understoria/tor:${UNDERSTORIA_VERSION:-0.3.0}
    container_name: understoria-tor
    restart: unless-stopped
    profiles: ["onion"]
    volumes:
      - ./deploy/torrc:/etc/tor/torrc:ro
      - tor-keys:/var/lib/tor
    depends_on: { caddy: { condition: service_started } }
    logging: { driver: json-file, options: { max-size: "10m", max-file: "3" } }
volumes:
  tor-keys:
```

```
# deploy/torrc
RunAsDaemon 0
SocksPort 0
Log notice stdout
HiddenServiceDir /var/lib/tor/understoria/
HiddenServicePort 80 caddy:8080
```

```caddyfile
# deploy/Caddyfile — onion front door (reachable ONLY from the tor
# sidecar: compose never publishes 8080). Plain HTTP by design — Tor
# provides transport encryption + endpoint auth; no ACME, no HSTS.
http://:8080 {
	encode gzip zstd
	header {
		X-Content-Type-Options "nosniff"
		Referrer-Policy "strict-origin-when-cross-origin"
		Permissions-Policy "geolocation=(), camera=(), microphone=(self), payment=()"
		Content-Security-Policy "<VERBATIM copy of the clearnet CSP line>"
		-Server
	}
	handle_path /api/* {
		reverse_proxy understoria:8787 {
			health_uri /health
			health_interval 30s
			health_timeout 5s
			header_down -Strict-Transport-Security
			header_up X-Understoria-Onion {$ONION_MARK_SECRET}
		}
	}
	handle {
		root * /usr/share/caddy
		try_files {path} /index.html
		file_server
	}
	log { output stdout format console }
}
```
(+ `ONION_MARK_SECRET: "${ONION_MARK_SECRET:-}"` under the caddy service env.)

`docs/tor-onion.md` runbook contents (verified against the shapes above):
enable (`--profile onion up -d --build`), read the address
(`docker compose --profile onion exec tor cat /var/lib/tor/understoria/hostname`),
**back up the onion identity** (`hs_ed25519_secret_key` in the
HiddenServiceDir — "this file IS your censorship-resistant address; whoever
holds it can impersonate the community; store it with the `DATABASE_KEY`
escrow, NOT beside the db backups"), rotation (delete dir → new address →
reprint paper), test (Tor Browser → onion → app loads → the origin-derived
node suggestion offers `http://<x>.onion/api` → consent → `/api/health` ok),
bare-metal variant, Tor Browser storage-amnesia caveat, and the C1-interim
rate-limit note.

Gates: `docker compose --profile onion config -q`;
`docker run --rm -v $PWD/deploy/Caddyfile:/etc/caddy/Caddyfile caddy:2.8-alpine caddy validate --config /etc/caddy/Caddyfile` (with dummy env);
full regression sweep unchanged (root `npm run typecheck && npm test && npm
run build` — no code touched, must stay green); manual: bring the stack up
with the profile, fetch the app via Tor Browser.
Rollback: revert the commit; or operationally `docker compose --profile onion
down` (keep `tor-keys` unless rotating identity). Default deployments
unaffected (profile-gated service; the `:8080` listener is unreachable
without it).

### C2 — "server: onion rate-limit lane; web: onion-origin lock tests"

- `apps/server/src/config.ts`: `onionRateLimitMax`
  (`ONION_RATE_LIMIT_MAX`, `asNonNegativeInt`, default 0) and
  `onionMarkSecret` (`ONION_MARK_SECRET`, `nonEmpty`) + doc comments.
- `apps/server/src/server.ts`: export
  `ONION_MARK_HEADER = "x-understoria-onion"`; in the rateLimit registration
  replace scalar `max` with
  `(req, key) => key === "bucket_onion" ? config.onionRateLimitMax : config.rateLimitMax`
  and extend `keyGenerator` to return `"bucket_onion"` when the lane is
  enabled (`onionRateLimitMax > 0 && onionMarkSecret !== null`) and
  `req.headers[ONION_MARK_HEADER] === config.onionMarkSecret`. `allowList`
  untouched.
- `docker-compose.yml`: forward `ONION_RATE_LIMIT_MAX` / `ONION_MARK_SECRET`
  to the `understoria` service; operator-guide §6 env-table rows.
- Server tests (new block in `server.test.ts` or `server.onionLane.test.ts`):
  lane keying (429 at the lane budget), wrong/absent secret → normal bucket,
  lane off → header inert, mirror-internal bypass unaffected.
- Web lock tests (no src change): `nodeOriginSuggest.test.ts` —
  `isExcludedOrigin("http://<56×a>.onion")` is false +
  `deriveCandidateNodeUrl` shape; `appOrigin.test.ts` —
  `deriveAppOriginFromNodeUrl("http://<x>.onion/api") === "http://<x>.onion"`.
- **Runtime verification gate (the blocked-fetch debt from §0):** in Tor
  Browser on the onion: `isSecureContext === true`, `!!crypto.subtle`,
  passphrase enable round-trip, app functions with SW absent (Safest mode),
  invite mint → link carries the onion origin.

Gates, in order, from repo root: `npm run shared:build` →
`npm run typecheck` → full web suite from apps/web (`cd apps/web && npx
vitest run`, count vs baseline, 0 unhandled rejections) →
`npm --workspace @understoria/web run lint` → `npm --workspace
@understoria/server run test` → root `npm test` (incl. invite-flow e2e) →
`npm run build` + `npm run build:server` → `npm audit` no new advisories.
Rollback: revert the commit — with both envs unset the lane is dead code; C1
configs remain valid (the header is simply ignored, as during C1).

### C3 — "paper: backup addresses on wallet card + poster; threat-model + guides"

- `apps/web/src/pages/PrintOfflineKit.tsx`: screen-only backup-addresses
  textarea (prefill via `useEffect` → `readAcceptedMirrors()` →
  `deriveAppOriginFromNodeUrl`), poster block (≤3 addresses, text + small QR
  each), wallet-card lines (≤3, text), honest absence when empty.
- Parser helper + tests in `lib/offlineKit.ts` (`parseBackupAddresses`: split
  lines, trim, drop empties/non-http(s), dedupe, cap 3 — mirrors the
  `wifiQrValue` unit-tested style).
- i18n: `print.kit.setup.backups*`, `print.kit.poster.backups*`,
  `print.kit.cards.backupsLine` in **both** `en.json` and `es.json`
  (parity test enforces).
- `PrintOfflineKit.test.tsx`: +3 locks (prefill from accepted mirrors; typed
  onion renders on poster+cards with QR; empty → block absent).
- `docs/threat-model.md` §7 new bullet "Onion-service front door": what Tor
  gives (reachability under DNS/IP blocking; transport encryption + endpoint
  auth without CAs; no exit nodes involved for onion traffic) and does NOT
  give (the node still sees everything it saw before; a member's Tor use is
  itself observable/conspicuous to their network and flagged in some
  jurisdictions; traffic-analysis reduction, not immunity; the shared onion
  rate bucket; the onion key as impersonation-grade secret; paper carrying the
  onion address outlives rotation — extends the "paper doesn't purge" entry).
- `docs/opsec-guide.md`: short "On hostile networks" section (when to use the
  onion, Tor Browser storage amnesia → keep the recovery kit, Orbot+Chrome
  degradation, "Tor is conspicuous" honesty).
- `docs/member-guide.md`: plain-language passage ("If the community's address
  stops working"); `docs/paper-systems.md` P4 as-built note.

Gates: identical to C2's list, plus a manual print-preview of
`/print/offline-kit` in both locales.
Rollback: revert; pure additive UI/docs, no storage or URL-format migration
anywhere in any phase.

## 3. Verification matrix (highest signal first)

PrintOfflineKit suite; nodeOriginSuggest + appOrigin suites; server onion-lane
tests + full server suite (rate-limit adjacency: mirrorPull's inject bypass);
i18n parity suite; full 320-file web suite. Manual: Tor Browser (Standard and
Safest) end-to-end — load, suggest-and-connect, post, sync while a clearnet
device watches, invite mint, print page; clearnet regression (app + `/api`
unchanged, HSTS still present on clearnet, absent via onion:
`curl --socks5-hostname 127.0.0.1:9050 -sI http://<x>.onion/api/health`).

## 4. Operator decisions (marked, non-blocking for C1)

- **D1 — in-app visibility:** should the node publish the onion on
  `GET /config` (e.g. `onionAddress`) and the Infrastructure page show it, or
  stay paper+runbook-only? Recommended phase 1: **paper-only** (smallest
  honest scope; `/config` is a public pre-membership surface — publishing the
  onion there advertises it to anyone who can reach `/config`).
- **D2 — `ONION_RATE_LIMIT_MAX` default guidance** (proposal: docs say
  `80 × expected concurrent Tor members`, floor 240; env default stays 0/off).
- **D3 —** whether the member-guide passage also lands as in-app FAQ copy
  (would pull `content/faq.ts` + es i18n into scope).
- **D4 —** `scripts/setup.sh` onion prompt (deferred; runbook covers manual).

## 5. Named risks

1. **The onion key IS the community's censorship-resistant identity.**
   `hs_ed25519_secret_key` lost → address gone from every wallet card;
   stolen → impersonation Tor itself will authenticate. Mitigation: runbook
   backup ceremony (escrowed like `DATABASE_KEY`, away from db backups),
   rotation procedure, paper reprint discipline. Residual: paper outlives
   rotation — named in threat-model.
2. **Rate-bucket collapse** — quantified (one hot member ≈ 60/min), solved by
   the C2 lane; residual shared-budget contention among Tor users is inherent
   and documented. C1-interim: documented `RATE_LIMIT_MAX` guidance.
3. **Tor Browser storage amnesia** — IndexedDB is per-origin AND wiped on Tor
   Browser exit: an onion-origin session is effectively a fresh device each
   time. Honest guidance: recovery kit / device pairing / read-mostly use.
   This is the biggest UX truth of mode (a) and must not be soft-pedaled.
4. **Secure-context behavior outside Tor Browser** — Chrome+Orbot treats
   http-onion as insecure (no `crypto.subtle` → no passphrase/passkey
   enrollment; contained failure verified at `passphrase.ts:221-226`). Docs
   recommend Tor Browser. The Tor-Browser-treats-onion-as-trustworthy claim
   could not be source-fetched from this environment (egress 403) — it is a
   C2 runtime gate, recorded as such.
5. **HSTS/upgrade bleed onto the onion** — verified present on `/api`
   responses; killed by `header_down` + HSTS-less vhost header block.
6. **Mixed-content scoping** — mode (b) rejected; if a future operator asks
   for "onion mirror in the clearnet app," the answer is this section, not a
   hack.
7. **"Tor use is itself conspicuous"** — stated in threat-model/opsec: in some
   jurisdictions/networks, using Tor is the flag. The paper artifacts let a
   member *choose* when to take that risk; bridges/pluggable transports are
   the member's Tor-side concern, out of scope, named.

## 6. Out of scope, named

Onion TLS / Onion-Location header (needs D1); onion as announced mirror;
peer/mirror federation *over* Tor (server-side SOCKS for `PEER_NODE_URLS` —
separate plan); desktop-shell Tor routing; setup.sh integration; bridges.

## 7. Audit trail (exact commands)

- Deploy: full reads of `deploy/Caddyfile`, `docker-compose.yml` (ports:
  caddy-only, lines 181-184), `docs/deploy-alternatives.md`,
  `docs/deploy-linode.md` TOC + "Before going public", `scripts/setup.sh`
  header (TRUST_PROXY=true, step 6).
- Server: read `server.ts` 1-671 (trustProxy 169; rate limit 190-205;
  CORS hook 207-233; hashIpToBucket 664-671); `config.ts` 600-646
  (parseTrustProxy, parseUrlList accepts http); `grep -rin cookie
  apps/server/src` → 0; `MIRROR_INTERNAL_HEADER` = `x-understoria-internal`
  (`mirrorPull.ts:108`); helmet header behavior verified by live
  `app.inject()` against the exact registration shape (HSTS +
  upgrade-insecure-requests present); `@fastify/rate-limit` 11.1.0,
  max-as-function at `types/index.d.ts:115-118`.
- Client: reads of `nodeSubmit.ts` (joinUrl 574-588, credentials omit 529),
  `nodeEndpoints.ts` (normalize 149, `/^https?:\/\//` 184/505,
  readAcceptedMirrors 190), `nodeOriginSuggest.ts` (isExcludedOrigin 60-76),
  `appOrigin.ts` (all), `NodeSection.tsx` (type="url", no protocol check),
  `syncLoop.ts` (HOT_MS 12s); `grep -rn "isSecureContext|crypto\.subtle|
  registerSW|navigator.serviceWorker" apps/web/src` → passphrase.ts,
  passkeyUnlock.ts, UpdatePrompt.tsx only; vite-plugin-pwa guard at
  `dist/client/build/register.js:26` / `react.js:29`.
- Paper/i18n: reads of `PrintOfflineKit.tsx` (full), `offlineKit.ts`,
  `PrintOfflineKit.test.tsx` head, `paper-systems.md` P4,
  `Infrastructure.tsx:337-353`, `App.tsx:166`; python json check of
  `print.kit` keys in en+es; parity test present (`i18n/parity.test.ts`).
- Docs: threat-model heading map + "Print surfaces" entry (line 2038);
  opsec-guide full; community-resilience §B; operator-guide §4/§6/§9;
  `grep -ril "onion|tor browser"` → no prior work.
- **Blocked external verification, recorded honestly:** WebFetch/curl to
  `www.w3.org/TR/secure-contexts/`, MDN Secure_Contexts,
  `bugzilla.mozilla.org/1382359`, `blog.torproject.org` all failed with
  proxy CONNECT 403 (policy denial, confirmed via `__agentproxy/status`).
  The `.onion`-as-trustworthy-origin claim is cited from knowledge (Firefox
  bug 1382359 pref, enabled in Tor Browser) and is a mandatory C2 runtime
  gate, not an assumed fact.
