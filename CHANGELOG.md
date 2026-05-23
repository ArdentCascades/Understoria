# Changelog

All notable changes to Understoria will be documented in this
file. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the
project adheres roughly to
[Semantic Versioning](https://semver.org/). Pre-1.0 releases may
include breaking changes.

## [Unreleased]

### Added
- **`docs/accessibility.md` + Agent 22 (Accessibility & Inclusive
  Design) roadmap entry.** Names accessibility as a sustained
  cross-cutting workstream modelled on Agent 4 (Security &
  Opsec) rather than a one-shot pass. WCAG 2.1 AA as the
  standards floor. Disability-justice framing carried forward
  from `docs/political-education/README.md` (Mingus,
  Piepzna-Samarasinha; "interdependence as precondition, not a
  fallback"). Includes a current-state inventory, a list of
  known gaps (ConfirmDialog focus trap, BottomNav keyboard
  nav, AttentionSection aria-live, color contrast verification,
  reduced-motion, lint coverage, screen-reader testing, formal
  audit), planned PR sequence (22.2 lint + patterns,
  22.3 first surface fixes, 22.4+ continued), per-PR reviewer
  questions, and a review cadence. `CONTRIBUTING.md` now points
  contributors at the doc alongside the threat model. Docs-only;
  no code touched.
- **UX polish round 1 — humane errors + Profile invites empty state.**
  Smaller piece following the attention-surface work, same "make
  the app talk to humans" theme. New `lib/humanizeError.ts` maps
  thrown errors to user-facing strings: humane sentences pass
  through; `SCREAMING_CASE` codes, `snake_case` codes, and
  `http_<status>` fallbacks get replaced with a generic friendly
  fallback. Applied to every component that previously surfaced
  `(err as Error).message` directly — PostDetail, ProjectDetail,
  ProjectNew, PostForm, MemberDetail, LockScreen, Profile (four
  sites: profile edit, data export, security flows, invite issue).
  Members can no longer see a raw `http_422` or
  `fetch_not_available` on screen. 10 new tests covering the full
  classifier. Also added the missing empty state to Profile →
  Invites you've issued (previously showed nothing when no invites
  had been issued — now a brief welcoming explanation).
- **"Needs your attention" surface on the Board.** A small section
  at the top of the Board that surfaces things waiting on the
  current member's action — exchanges in `awaiting_confirmation`
  where they haven't signed yet, and project tasks an organizer
  needs to confirm. Pure utility: information you already need but
  currently have to dig for, with humane copy
  ("Bob marked 'Ride to clinic' complete — confirm it happened.")
  instead of technical status codes. Renders null when nothing is
  waiting — no "you have 0 things to do" framing. No badges, no
  push, no time-on-app metric. New pure `lib/attention.ts` with
  10 tests covering the conditions for each kind of item plus
  ordering and unknown-counterparty fallback. UI strings i18n'd
  in en + es; locale parity passes.
- **Posts federation (Agent 3 task 2, continued).** Posts now sign,
  store, and federate the same way exchanges and vouches do. The
  longest-standing missing piece of Phase 3 federation.

  Type changes:
  - `Post` in `@understoria/shared` gains two required fields:
    `nodeId` (which node originated this post) and `signature` (Ed25519
    signature over the immutable subset). Lifecycle fields (`status`,
    `claimedBy`, `confirmedBy`) deliberately stay outside the signed
    payload — they're local mutations, not part of the post's
    federation identity.
  - New `PostPayload` interface for the canonical signed subset.
  - New `canonicalPostPayload` and `verifyPost` helpers in
    `@understoria/shared/crypto`, parallel to the exchange and vouch
    pair.

  PWA:
  - Dexie schema v7 with an `upgrade()` callback that backfills
    `nodeId` from the local `nodeId` setting and `signature = ""` on
    every existing post. Empty signature == legacy/not-federable,
    treated explicitly throughout.
  - `createPost` now signs the post at creation time. Takes a new
    `nodeId` parameter; pre-loads the poster's secret key outside the
    write transaction (so a locked session throws cleanly rather than
    producing an unsigned post). Enqueues a post outbox row in the
    same transaction as the post itself.
  - `OutboxRow.kind` extended to `"exchange" | "vouch" | "post"`.
    `enqueuePostOutbox` strips the lifecycle fields before
    serializing — the wire shape is exactly what the canonical
    payload signs.
  - `submitPostToNode` mirrors `submitExchangeToNode` /
    `submitVouchToNode` via the shared `postSignedRecord` helper.
  - Seed posts are now real signed records (the demo flow exposes
    each demo member's secret key during seeding so the canonical
    payload + signature round-trips through `verifyPost()` correctly).

  Server:
  - Schema v4: new `posts` table (immutable wire shape only — no
    lifecycle fields). `peer_pull_state` grows a
    `last_post_created_at` cursor.
  - `POST /posts` verifies the signature via `verifyPost` and stores
    if novel; `GET /posts?since=&limit=` returns the most recent
    posts newer than the cursor.
  - `pullPostsFromPeer` mirrors the exchange / vouch puller; the
    worker now pulls all three kinds per peer per tick in parallel.

  Smoke-tested live two-server: signed a post in Node, POSTed it to
  the peer at :8921, watched the puller at :8922 fetch it within
  one interval. `/peers` reflected the per-kind cursors correctly.

  **Not in this slice** (separate PRs):
  - PWA-side display of federated posts on the Board (cross-node
    visibility requires the PWA to pull from its configured node,
    which is its own architectural shift).
  - Cross-community claiming of federated posts — federated posts
    are read-only on peer nodes by design. A peer member sees the
    need/offer for awareness and reaches out via whatever channel
    the communities already share.
- **Manual vouching UI + outbox push.** Closes a real gap: the
- **Manual vouching UI + outbox push.** Closes a real gap: the
  `db.vouches` table was read by Profile for trust computation but
  had no production write path — `createVouch` was exported but
  only called by tests, so members could never reach the "trusted"
  state past their inviter's implicit vouch. This release adds:
  - A `/member/:publicKey` page (`pages/MemberDetail.tsx`) showing
    a member's display name, key fingerprint, trust chip, profile
    fields, and exchange count. Reachable from PostDetail (the
    poster name is now a link).
  - A "Vouch for this member" button on that page, gated to: not
    self, current member is trusted, target is not already trusted,
    no prior vouch from the current member exists.
  - `db/vouches.ts` with `addManualVouch()` — signs, persists, and
    enqueues to the outbox in a single transaction. Validates
    `VouchValidationError("self_vouch" | "duplicate" | "signing_failed")`.
  - Outbox extended: `OutboxRow.kind` is now `"exchange" | "vouch"`.
    `enqueueVouchOutbox()` mirrors the exchange helper.
    `flushOutboxOnce` dispatches on `kind` to either
    `submitExchangeToNode` or the new `submitVouchToNode`.
  - `lib/nodeSubmit.ts` refactor: the shared POST + record-outcome
    logic extracted into `postSignedRecord(path, record, ...)`;
    `submitExchangeToNode` and `submitVouchToNode` are thin
    wrappers. Behaviour for exchanges unchanged.
  - 5 new tests in `db/vouches.test.ts` covering persistence,
    self-vouch rejection, duplicate rejection, outbox enqueue when
    a community node is configured, and the no-enqueue path when
    it isn't. Full web suite: 215 (was 210).

## [0.2.0] — 2026-05-22

Second development release. Pilot-ready surface: in-app onboarding,
configurable safeguards, federation pull loop, project momentum,
relational dashboard depth, plus a roadmap revision that absorbs
the Beyond-Ostrom proposal. Reproduced end-to-end on a fresh Debian
13 VM clone of `main`.

### Added
- **Agent 3 task 2 (continued) — Vouches federation.** Extends the
  federation pull loop to also replicate signed web-of-trust vouches
  across peers. New `POST /vouches` and `GET /vouches?since=` server
  endpoints mirror the exchange pattern; the pull worker now runs
  both kinds per peer in parallel. Server schema v3 adds a `vouches`
  table (mirrors the exchanges-table indexes) and a
  `last_vouch_created_at` column on `peer_pull_state`. The
  `SignedVouch` type and its `canonicalVouchPayload` / `verifyVouch`
  helpers moved from `apps/web/src/lib/vouch.ts` to
  `@understoria/shared` so the server can verify the same way the
  PWA does. `GET /peers` response shape gains the `lastVouchCreatedAt`
  cursor alongside the existing exchange cursor — both pulled records
  resume from their own high-water marks on restart.
- Per-peer success updates no longer clear `last_error`. When the
  two pulls (exchange + vouch) run in parallel, the previous
  behaviour raced — a vouch failure could be silently wiped by a
  concurrent exchange success. Operators can read `lastSuccessAt`
  vs. `lastPulledAt` to tell whether the most recent attempt
  succeeded; per-kind error columns are a future refinement.

### Smoke-tested

Live, two-server end-to-end: POSTed a signed vouch to peer at
:8901, watched the puller at :8902 fetch it within one interval,
`/vouches` returned the row, `/peers` reflected the pull.

- **Agent 10 Phase 3 — Project momentum + four project achievements.**
  Closes a workstream that's been pending since Agent 10 Phase 2
  landed. New pure `lib/projectMomentum.ts` computes a 14-day daily
  histogram of project contributions plus a coarse momentum state
  (`humming` / `active` / `stalled` / `completed` / `paused` /
  `planning` / `archived`). Per-project surface on ProjectDetail:
  inline SVG sparkline below the progress bar and a small momentum
  chip beside the status. No external charting library; works
  offline. Four new achievements — **Groundbreaker** (launched a
  project that drew a contributor), **Crew Member** (3+ confirmed
  task completions across community projects), **Momentum Maker**
  (organized a project that crossed 50% of target hours), and
  **Keystone** (organized a project that completed). Achievements
  fire from inside `confirmProjectTaskCompletion` and
  `completeProject` — the project flow now also runs the standard
  achievement evaluator for both parties, so a helper who only ever
  does project tasks finally gets credit for First Exchange,
  Connector, etc. (previously they never would have, since project
  exchanges bypassed `confirmExchange`). UI strings i18n'd in en +
  es; parity test passes. Spanish is bootstrap-quality; joins the
  native-speaker-review queue.
- **Agent 3 task 2 — Federation pull loop.** Server-to-server
  replication of the signed exchange ledger. Nodes can now be
  configured (via comma-separated `PEER_NODE_URLS`) to periodically
  pull `GET /exchanges?since=` from peers. Each pulled row goes
  through the same `verifyExchange` check as the POST endpoint
  (a peer cannot inject anything unsigned) and is deduped by id.
  Pulled rows retain their original `nodeId` — federation is
  replication of a signed ledger, not re-attribution. New
  per-peer state table (server schema v2) tracks `lastPulledAt`,
  `lastSuccessAt`, `lastCompletedAt`, `lastError`, and
  `lastPulledCount` for observability via the new public
  `GET /peers` endpoint (peer URLs are inherently public; no
  member counts or operational config). The pull worker is a thin
  shell over `pullFromPeer()` — the pure function takes an
  injectable `fetcher`, making the whole flow testable without
  network. Default pull interval 5 minutes, configurable via
  `PEER_PULL_INTERVAL_MS`. Agent 15 (federation governance) will
  replace env-var peer config with signed federation agreements
  per the roadmap.
- **Agent 11 — Node configuration & local rules.** First proper
  stage of the Ostrom track. The three safeguard thresholds that
  used to live as constants in `apps/web/src/lib/safeguards.ts`
  (`dailyHelperLimit`, `shortExchangeHours`, `reciprocalPairThreshold`)
  are now read from a per-node `NodeConfig` persisted in a new
  Dexie table (schema v6, single row keyed by `nodeId`). Defaults
  match the pre-Agent-11 PWA exactly, so behaviour is unchanged
  for a community that never opens settings. New "Community
  settings" section on Profile with input + validation (range
  checks live in `db/nodeConfig.ts`, not the component, so the
  same rules apply to any future caller — governance proposals,
  peer sync) and a "Reset to defaults" action. The UI carries an
  explicit yellow note that the affordance is a bootstrap measure
  until Agent 13 (in-app governance) routes edits through a
  proposal. `assertWithinDailyLimit()` and `evaluateSafeguards()`
  now take an optional `NodeConfig` parameter and fall back to
  `DEFAULT_NODE_CONFIG` — every existing call site continues to
  work; the `confirmExchange` flow passes the live config through.
  Server-side: new `GET /config` endpoint returns an
  operator/hosting transparency block (`name`, `fundingNote`,
  `contact`) when any of the new `OPERATOR_*` env vars are set,
  or `{}` otherwise. The folded-in transparency block from the
  original "Beyond Ostrom" Agent 21; deliberately a small surface
  (no member counts, no node id, no operational config).
- **Agent 18a — Breadth & reciprocity Dashboard.** Two new sections
  on the Dashboard, both rendered without external charting
  libraries: a *breadth bar* listing members by how many distinct
  people they've helped (rewards distribution, not volume — never
  shows hours per person), and a *reciprocity pulse* showing what
  fraction of community connections flow both ways. Both sections
  include empty states and a footnote making clear that this is a
  window into the shape of help, not a score. New "Weaver"
  achievement awarded when a member's exchanges span 3+ distinct
  location zones (the counterparty's `locationZone`); computed at
  exchange-confirmation time. New pure `lib/flow.ts` module
  separated from `lib/stats.ts` because it answers a different
  question (relational distribution vs. aggregate totals). All UI
  strings i18n'd in en + es; parity test passes. The community web
  graph (original Agent 18b) is *not* shipped — it remains gated
  on a threat-model §7 entry and a governance opt-in per the
  roadmap.
- **Agent 16 — Onboarding & political literacy.** Four-screen
  welcome flow at `/welcome` shown once on first launch, marked
  via `SETTING_KEYS.onboarded` (which existed in the schema since
  v0.1.0 but was never read or written). Screens cover: timebank
  semantics, seed credit, cryptographic identity, community
  authority. New "Learn" section in Profile with three actions:
  revisit the welcome flow, expand an in-app condensed member
  guide, expand the 13 study-group prompts mirrored from
  `docs/political-education/README.md` with copy-for-meeting
  support. Existing pilot devices (any device with members already
  in IndexedDB) are silently backfilled as onboarded so they don't
  see a welcome flow for software they already know. `/invite` is
  allow-listed pre-onboarding so invited members can still land
  on the redemption screen first. UI strings i18n'd in English and
  Spanish (8 new keys × 2 locales = 16; parity test passes). The
  member guide and study prompts live as TS content files rather
  than i18n locales per the roadmap's i18n-debt failure mode:
  long-form prose translation is a separate workstream from UI
  string translation.
- This `CHANGELOG.md`, the `DCO` file (Developer Certificate of
  Origin v1.1), `SECURITY.md` (vulnerability disclosure policy),
  GitHub issue and pull-request templates, a CI workflow, and a
  commit-msg hook template. AGPL-3.0-or-later header on every
  source file.
- `docs/roadmap.md` — canonical agent-by-agent work plan, including
  the new **Phase 5 (Commons governance)** built on Elinor Ostrom's
  design principles. Adds Agents 11 – 15 (node configuration,
  moderation & sanctions, in-app proposals, dispute resolution,
  federation governance) with a staged ordering: Agent 11 first
  (grounded in issue #6), then finish Agent 3, then 13 + 14 as one
  surface, then 12 once telemetry exists, then 15 once peers
  federate in practice.
- Roadmap revision integrating a "Beyond Ostrom" proposal (Kerala,
  Zapatista, potlatch, Mondragon, Haudenosaunee, Cooperation Jackson
  traditions). Result: two new standalone agents (**Agent 16 —
  onboarding & political literacy**, **Agent 18a — breadth +
  reciprocity Dashboard**); reversibility tiers + impact reflection
  + operator transparency folded into Agents 13 and 11 respectively;
  co-organizer support routed through Agent 10 Phase 3; organizer
  recall + pool allocations routed through the Agent 13 Decisions
  surface; community web graph (18b), balance cap + community pool
  (19), and federation mutual aid fund (21) deferred behind explicit
  gates documented in the roadmap.

### Testing

- 210 web + 31 server = **241 vitest tests passing** at v0.2.0
  (up from 162 at v0.1.0)
- All three high-severity `npm audit` findings cleared via
  non-breaking `npm audit fix` (lockfile-only updates); only 5
  moderate dev-tooling advisories remain
- Reproduced end-to-end on a fresh Debian 13 VM clone of `main`:
  install → PWA → node → onboarding flow → community settings →
  dashboard breadth/reciprocity → project momentum surface

### Known gaps (tracked work)

See `docs/threat-model.md` §7 and `docs/roadmap.md` for the full
picture. Highlights:

- E2E messaging (Agent 2 task 5)
- Posts / vouches / invites server endpoints (Phase 3 server-side)
- PWA-side surfacing of cross-node exchanges (Phase 3 PWA-side)
- Phase 5 agents 12–15 (moderation, governance, disputes,
  federation governance), per the staged ordering in the roadmap
- Agent 7 (organizing integration) not started
- 5 moderate `npm audit` advisories in dev tooling (esbuild
  dev-server, brace-expansion, ws, etc.), all gated on a future
  Vite 8 upgrade

### CI / chore

- GitHub Actions: `actions/checkout` and `actions/setup-node`
  bumped to v5 for Node 24 compatibility ahead of the
  2026-09-16 deprecation of Node 20 runners.

## [0.1.0] — 2026-05-16

First development release. Two deployable artifacts: a React PWA
and an optional Fastify community node, both AGPL-3.0-or-later.

### Added

**Core PWA (Agent 1)**
- Community Board with Needs / Offers tabs, category and urgency
  filters, search, floating post buttons
- Post → claim → dual-confirm → credit exchange flow
- Time-credit system with 5-hour seed balance per member; balances
  derived from event-sourced exchange log
- Community Dashboard with total hours, active members, solidarity
  streak, category breakdown bars, milestone progress
- Six achievements as community roles (First Exchange, Connector,
  Regular, Bridge Builder, Seed Planter, Listener)
- Profile page with balance, editable skills / availability / area,
  exchange history, signed records, data export, dev member
  switcher
- PWA manifest + service worker via vite-plugin-pwa, mobile-first
  layout, 44 px touch targets, dark mode

**Crypto & Identity (Agent 2)**
- Ed25519 keypair identity via tweetnacl — no email / phone /
  external IdP
- Signed exchange transactions with canonical JSON payload,
  independently verifiable
- Cryptographic single-use invite tokens with 14-day expiry and
  issuer revocation
- Web-of-trust vouching: two distinct voucher keys promotes
  `pending_trust` → `trusted`
- Passphrase-wrapped private keys (PBKDF2-HMAC-SHA256 600k
  iterations + NaCl secretbox) with explicit "no recovery"
  semantics

**Federation & Infrastructure (Agent 3 — partial)**
- Fastify community node (`apps/server/`) with `GET /health`,
  `POST /exchanges` (verifies signatures, persists), and
  `GET /exchanges?since=&limit=` for federation pull
- `better-sqlite3` storage with versioned migrations, WAL mode,
  indexes for federation queries
- Helmet (CSP, HSTS, X-Frame-Options, Referrer-Policy), Fastify
  rate-limit keyed by an FNV-1a bucket of the IP (no IPs in logs)
- Multi-stage Dockerfile + `docker-compose.yml`, runs as non-root,
  drops every Linux capability, read-only filesystem, tini as PID 1

**Security & Opsec (Agent 4 — partial)**
- Threat model (`docs/threat-model.md`) with adversaries, mitigations,
  tracked gaps, per-PR review questions
- Member-facing opsec guide (`docs/opsec-guide.md`)
- Panic button: soft purge (anonymize while preserving the signed
  ledger and keypair) and hard purge (wipe everything, rotate node
  identity)
- Anti-gaming safeguards: configurable daily exchange limit and
  advisory flags for short / reciprocal patterns

**Governance & Cooperative Design (Agent 5 — partial)**
- `CODE_OF_CONDUCT.md` with restorative-justice conflict resolution
- `GOVERNANCE.md` (modified consensus, three-month role rotation,
  moderation with appeals)
- `TRADEMARK.md` (AGPL-the-code, protect-the-name)

**Documentation (Agent 9 — partial)**
- `docs/member-guide.md`, `docs/organizer-guide.md`,
  `docs/operator-guide.md` (incl. Caddy reverse-proxy config, Docker
  + Raspberry Pi notes, env var reference)
- `docs/developer-guide.md` (architecture, design patterns, module
  map)
- `docs/political-education/README.md` (reading list, 10 discussion
  prompts, 90-minute workshop outline)
- `docs/quickstart.md` (Debian 13 VM walkthrough)
- `CONTRIBUTING.md`

**Internationalization (Agent 9 task 6)**
- `i18next` + `react-i18next` + browser language detector
- Full English source and bootstrap-quality Spanish translation
  marked for native-speaker review
- Parity test asserts identical key sets across locales
- Language switcher in Profile

**PWA → community node mirror**
- Per-device "Community node" config in Profile with URL + toggle
- Finalized exchanges enqueued atomically with the exchange itself
  into a durable outbox, then delivered by a retry worker with
  exponential backoff (4 s × 2^attempts, capped at 5 min)
- Permanent failures (`422`, `400`) poisoned; transient
  (5xx / 408 / 429 / network) retried
- "Pending" and "Poisoned" count chips, "Retry now" button in
  Profile

### Testing

- 148 web + 14 server = **162 vitest tests passing** at v0.1.0
- Verified end-to-end on a fresh Debian 13 VM in GNOME Boxes:
  install → PWA → node → mirror → cross-host POST → signature
  round-trip

### Known gaps (tracked work)

See `docs/threat-model.md` §7 and the in-flight roadmap in
`README.md`. Highlights:

- E2E messaging (Agent 2 task 5)
- Cross-node federation pull loop (Agent 3 task 2)
- Posts / vouches / invites endpoints on the server
- Native-speaker review of Spanish strings
- Agent 7 (Organizing Integration) not started
- Agent 10 (Community Projects & Momentum) not started

---

*Each commit on `main` is signed off under the Developer
Certificate of Origin. See `DCO` at the repo root and the DCO
section in `CONTRIBUTING.md`.*
