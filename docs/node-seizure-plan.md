# Node-seizure drill + server data-minimization — implementation plan

> **Status: C1 SHIPPED** (retention sweeps + migration v33 + Caddy
> access-log discard + compose/operator-guide env rows — see §6 C1).
> C2 (runbook/docs) and C3 (drill card + coverage locks) remain
> PROPOSED.
> Original status: PROPOSED (code-verified 2026-07-25 against the working
> tree at schema v32, RESEED_KINDS as shipped, the bundled deploy
> files, and the docs named below). Discipline model:
> docs/react-19-plan.md (verified ground truth → design → phased
> commits with gates → named risks → audit trail). Context:
> authoritarian-resilience initiative, operator-approved.
> Premise to make TRUE IN PRACTICE: **the node is furniture — the
> community lives on member devices.** Two halves: (A) a rehearsed
> seizure drill so the recovery is muscle memory, not improvisation;
> (B) shrinking what a seized node yields, with an honest inventory
> of what cannot shrink.
> Sibling: a Tor/onion addressing plan (`docs/tor-onion-plan.md`) is
> referenced by the initiative but **does not exist in the tree yet**
> (verified: `grep -ri onion docs/` → 0). Where this plan touches
> shared ground (paper backup addresses), it says so and does the
> minimal piece itself.

## 0. Verified ground truth

### 0a. The seizure-recovery machinery that already exists

- **Reseed is shipped and drill-listed.** `docs/community-reseed.md`
  (R0+R1 shipped); walker `apps/web/src/lib/reseed.ts` —
  `RESEED_KINDS` is **23 kinds** (lines 113–171), membership
  artifacts first: `/redemptions`, `/founder-accession` (the
  co-founder accession WAS added after the original reseed design —
  verified present, with its 409-skip rationale), `/invite-revocations`,
  then events → cancellations → project/task-states → shifts → rsvps
  → seed-vault-pledges → removals → reinstatements → proposals →
  votes → closures → shift-signups → posts → exchanges → vouches →
  task-comments → coorg trio. Resumable per-(target,kind) cursor in
  settings; outcomes counted, never silent. Drift guard exists:
  `reseed.test.ts:241` ("covers every Dexie table the re-seed design
  names") — a **hand-maintained literal list**, not derived from
  MIRROR_KINDS (gap closed in C3).
- **Server recovery envs:** `RESEED_GRACE_UNTIL` (boot refuses >30
  days out; `/redemptions` skips the 7-day
  `REDEMPTION_DELIVERY_GRACE_MS` and preserves plausible wire
  `receivedAt`; governance closures and founder accessions ride the
  same window — `routes/redemptions.ts`, `routes/cofounder.ts`,
  `server.ts:598/635`) and `TRUSTED_SYSTEM_KEYS` (fail-closed
  resolver for the LOST node's auto-confirm key). Both pinned inert-
  by-default in `apps/server/src/routes/reseed.test.ts`.
- **Runbook exists:** operator-guide §6 "Recovering from total node
  loss (re-seed)" — stand up fresh node, SAME `NODE_FOUNDER_KEYS`,
  `READ_AUTH=off` → members run Settings → "Restore this community
  onto a node" → flip `READ_AUTH=on`, unset envs. What it does NOT
  cover: the seizure-specific half (what the adversary now holds and
  can do, which credentials rotate, peers/mirrors to notify,
  communicating a NEW address). That is this plan's Part A.
- **Trust roots do not rotate.** `NODE_FOUNDER_KEYS` are member
  PUBLIC keys; the secret halves live on member devices, never on
  the node (verified: config parses pubkeys only; `claimed_founders`
  stores `founder_key` pubkeys). A seizure compromises no signing
  authority except the node **system key**
  (`NODE_SYSTEM_SECRET_KEY`, in the node's env) — rotation runbook
  already exists (`docs/system-key-rotation.md`); the old key is
  declared to the NEW node via `TRUSTED_SYSTEM_KEYS`.
- **nodeId is node-canonical with alias forgiveness.**
  `apps/web/src/lib/nodeIdentity.ts`: devices adopt the consented
  primary's published `NODE_ID` forward and keep old ids as aliases
  (cap 16), so a replacement node may reuse the old `NODE_ID`
  (cleanest) or mint a new one — history keeps reading as "ours"
  either way. "Re-keying" a node therefore means: new
  `DATABASE_KEY`, new `NODE_SYSTEM_SECRET_KEY`, new
  `PEER_READ_TOKENS`/`MIRROR_READ_TOKENS`, optionally new `NODE_ID`;
  never founder or member keys.
- **Drill checklist pattern** (`apps/web/src/pages/Infrastructure.tsx`):
  a `DRILLS` const — `{ id, steps: N, docRef }` ×3 today (`stormHub`
  6 steps, `reseed` 6, `flashDrive` 5); ALL step text in i18n at
  `infra.drills.<id>.{title,body,step1..N}`, en **and** es
  (`i18n/parity.test.ts` enforces key parity); state helpers in
  `lib/infraStatus.ts` persisted to `SETTING_KEYS.drillChecklists`
  (device-local, never federated); `toggleDrillStep` already drops
  out-of-range indexes so checklists can grow/shrink safely.
- **Mirror/failover:** `docs/community-resilience.md` Phase B
  shipped; `MIRROR_KINDS` (`apps/server/src/mirrorPull.ts:149–346`)
  is **24 kinds** = the reseed set **minus** `/founder-accession`,
  **plus** `/claims` and `/capacity-postures`. Composite `(ts,id)`
  exclusive cursors per (mirror, kind)
  (`docs/composite-federation-cursors.md`; `mirror_pull_state` v20).
  A NEW mirror catches up **from zero** — so any pruned row of a
  mirrored durable kind is unrecoverable to future mirrors. This is
  the central deletion-safety constraint for Part B.
- **Backups:** `scripts/backup-db.sh` — `VACUUM INTO` via the
  server's own driver; on a `DATABASE_KEY` deployment the snapshot
  comes out encrypted with the same key; local retention
  `KEEP_DAYS=14`; `.dockerignore` excludes `backups/`, `.env`, dbs
  from the self-served source pack.
- **E2E/drill test precedents:**
  `apps/web/src/lib/inviteFlow.e2e.test.ts` (real server process +
  real client data layer); `apps/server/src/routes/governanceDrill.test.ts`
  and `cofounderDrill.test.ts` ("one community, N devices, real
  routes, wire-level assertions" style); `routes/reseed.test.ts`
  (recovery envs). **No automated test today destroys a populated
  node and restores onto a fresh one** — community-reseed.md's §4
  header records a *manual* destroy-and-restore drill.
- **Paper systems:** the printable outage kit
  (`pages/PrintOfflineKit.tsx`, i18n `print.kit.*`) prints the
  community's **ordinary address only** — no backup-address line
  exists yet (that is the shared item with the future Tor plan).

### 0b. What the server stores, deletes, and logs (Part B facts)

- **Schema v32**, 33 tables + `meta`
  (`apps/server/src/db.ts:514–1531`). Full classification in §2.
- **Already pruned/bounded (5 server + 1 client precedent):**
  `messages` (retention `MESSAGE_RETENTION_DAYS`=30d, prune rides
  the write path — `routes/messages.ts:90–95`, `db.ts:1736`);
  `device_link_blobs` (one-shot + TTL prune-on-write,
  `db.ts:3109–3112`); `link_requests` (TTL, `db.ts:3304–3307`);
  `founder_nominations` (expired prune-on-write,
  `routes/cofounder.ts:185`, `db.ts:3392`); `node_capacity_samples`
  (self-trimmed ring buffer, `db.ts:3219`). Client precedent: the
  outbox prunes **delivered** rows after 7 days
  (`apps/web/src/lib/outbox.ts` `DELIVERED_RETENTION_MS`) — the
  "prune delivered rows on a schedule" pattern this plan's server
  sweep extends in spirit. **There is no server-side interval
  scheduler for retention yet**; the worker pattern to copy is
  `startCapacitySampler` (`capacitySampler.ts:187–211`: tick +
  `setInterval(...).unref()` + `stop()`, started from `index.ts`).
- **IP handling — verified clean in the node, leaky in the bundled
  proxy.** The only `req.ip` touches: rate-limit keying via
  `hashIpToBucket` (FNV-1a mod 1024 buckets, `server.ts:198,664–671`
  — non-reversible, never stored) and the tap-to-link salted bucket
  fold (`routes/linkRequests.ts:122,146`). Pino's request serializer
  is overridden to `{method}` only (`server.ts:150–155`); URLs are
  logged only under `LOG_REQUEST_PATHS=true` (triage flag). **BUT**
  `deploy/Caddyfile:86–89` enables Caddy access logging
  (`log { output stdout format console }`) — Caddy access logs carry
  client IP, URI, and user-agent into `docker compose logs` (capped
  3×10 MB by `docker-compose.yml`, so hours-to-days of members' IPs
  and request paths sit on the host a seizure takes). Operator-guide
  §9 already *asks* operators to discard IP logs; the bundled file
  contradicts it. Finding F-1, fixed in C1.
- **Trust computation and its memoization.**
  `trustGate.ts` reads exactly `redemptions` + `vouches` +
  `claimed_founders` (`collectEdges`, `computeServerTrustedSet`) and
  caches the fixpoint on a **COUNT(*) stamp of those three tables**,
  explicitly justified by "all three source tables are append-only"
  (`trustGate.ts:56–60,133–155`). The membership resolver
  (`readAuth.ts`) walks the same receipts ∪ founder roots ∖
  removals. Consequence, stated as a hard invariant: **pruning
  redemptions, vouches, or claimed_founders is forbidden twice
  over** — it would shrink trust/membership itself, and it would
  silently poison the count-stamp caches (prune 1 + insert 1 =
  unchanged count = stale cache). `redemptions` additionally carries
  a recorded node-lifetime retention ruling (`db.ts:845–848`).
- **`newcomer_daily_writes`** (v31): bounded by authors×tables,
  updated in place; a missing or >24h-stale row is treated as a
  fresh window (`newcomerCaps.ts:176–177`) — so deleting stale rows
  is semantics-preserving by construction.
- **`awaiting_transitions`** (v14): POST-only, **no GET route, no
  federation leg, no prune** — grows one row per exchange that ever
  awaited, forever, carrying helper/helped keys + timestamps.
  INSERT OR IGNORE first-writer-wins (`db.ts:2404–2409`). Two
  consumers: the `/auto-confirm` window check, and the operator's
  GO/NO-GO query (operator-guide §6), which joins the last **48 h**
  of auto-confirmed exchanges against it.
- **`invite_announcements`** (v29): hash-only (no live token), but
  an expired-and-never-redeemed announcement is durable metadata of
  "inviter X approached someone who never joined" — and it has no
  expiry pruning. Client authority note verified: "the receipt's
  embedded, inviter-signed invite is still the membership authority"
  (v29 migration comment) — announcements are convenience, not
  authority.
- **`claims`** (v7): `post_id, claimer_key, claimed_at, node_id` —
  unsigned coordination state, mirror-replicated but **already
  declared loss-acceptable** by the reseed design (reseed skips
  claims; "an open claim re-converges the next time either party
  acts" — `reseed.ts:106–112`, community-reseed §1b). Never pruned
  today.
- **Timestamps** ride *inside signed payloads* (client-claimed) —
  precision cannot be reduced without breaking signatures; the
  server-assigned `received_at` stamps are feed cursors
  (redemptions/revocations/announcements) — coarsening them buys ~ms
  of obfuscation at real cursor-identity cost. **Left as-is, said
  honestly** in the §7 entry.
- Config parse helpers for new envs exist (`asNonNegativeInt`,
  `config.ts:361–370` — the `MESSAGE_RETENTION_DAYS` shape to copy).
  Gates available at root: `npm run typecheck`, `npm test` (all
  workspaces incl. the invite-flow e2e), per-workspace lint; web
  suite runs from `apps/web` (`npx vitest run`).

## 1. The gap, stated

The community's answer to a seized/compelled node — "the node is
furniture" — is *architecturally* true (reseed shipped, mirrors
shipped, E2E messages never on the node) but not yet *practically*
true:

1. No runbook covers the seizure-specific facts: the adversary now
   HOLDS the node's env (system secret key, peer/mirror read tokens,
   DATABASE_KEY sitting in `.env` on the same host), may keep the
   node RUNNING as a surveillance honeypot on the old domain, and
   the community must move addresses through channels the adversary
   doesn't control.
2. No drill rehearses it. The reseed drill proves the *mechanism*;
   nobody has rehearsed the *organizational* half (out-of-band
   announcement, address migration, credential rotation, peer
   notification).
3. The node stores metadata it doesn't need forever: dead claims,
   expired invite announcements, settled auto-confirm artifacts,
   stale newcomer counters — and the bundled Caddy config logs
   member IPs (F-1).
4. The threat model has no §7 entry answering "what does a seizure
   yield, after all of this?"

## 2. Part B — the audit: every table, classified

Legend: **(a)** essential plaintext (community-public federation
content by design); **(b)** E2E/opaque ciphertext; **(c)** metadata
worth minimizing; **(i)** infrastructure/bookkeeping. "Sweep" = new
retention sweep (§3); "keep" = named honestly in the §7 entry.

| Table (v) | Class | Seizure yields | Disposition |
|---|---|---|---|
| `exchanges` (1,12) | a | who-helped-whom ledger, hours, categories, ms timestamps, auto-confirm provenance | **keep** — the signed ledger IS the product; zero-sum integrity depends on it |
| `vouches` (3) | a | the social/trust graph | **keep — forbidden to prune** (trust fixpoint + count-stamp cache, §0b) |
| `posts` (4,30) | a | needs/offers, author, zone, voice-audio refs | keep (community-public by design) |
| `claims` (7) | **c** | who offered to help whom, incl. pairings that never became exchanges | **sweep**: delete rows older than `CLAIM_RETENTION_DAYS` (default 90; 0=off). Loss-tolerance already ruled (reseed skips claims); mirror note in §3.3 |
| `task_comments` (8) | a | plaintext bodies (existing §7 entry) | keep |
| `coorg_*` ×3 (9) | a | project-role edges | keep |
| `events`, `event_cancellations` (10) | a | community calendar | keep |
| `redemptions` (11) | a | **the membership genealogy**: who invited whom, when, display names | **keep — forbidden** (node-lifetime ruling db.ts:847; trust + membership closure + cache) |
| `invite_revocations` (13) | a | revocation records | keep (refusal authority must outlive everything; mirrored + reseeded) |
| `awaiting_transitions` (14) | **c** | member-pair + timing artifacts, forever | **sweep (settled only)**: delete rows with a matching stored exchange AND `received_at` older than `TRANSITION_RETENTION_DAYS` (default 60; floor 3 days to protect the 48 h GO/NO-GO query). **Pending artifacts are NEVER pruned** — under `AUTO_CONFIRM_REQUIRE_TRANSITION=1` a pruned pending artifact would strand the exchange (§9 risk 2) |
| `device_link_blobs` (16) | b | — | already one-shot + TTL |
| `link_requests` (17) | c | — | already TTL |
| `project_states`, `task_states` (18) | a | project payloads (LWW — don't grow with edits) | keep |
| `event_rsvps`, `event_shifts`, `shift_signups` (19) | a | **attendance**: who was where, when | keep — but say it plainly in §7 (deliberately never in peerPull; a seized node yields the rosters) |
| `mirror_pull_state` (20), `peer_pull_state` (2,24) | i | which nodes federate | keep (tiny; the peering is public via /peers anyway) |
| `seed_vault_pledges` (21) | a | who holds the archive | keep |
| `member_removals`/`reinstatements` (22) | a | governance history | keep |
| `proposals`, `votes`, `proposal_closures` (23) | a | **open ballots** (existing §7 entry) | keep |
| `messages` (25) | b + c | ciphertext + WHO-messaged-WHOM ≤30d | already swept (`MESSAGE_RETENTION_DAYS`); reference implementation |
| `node_capacity_samples` (26) | i | machine stats | already ring-trimmed |
| `capacity_postures` (27) | a | 1 coarse row/node | keep |
| `claimed_founders` (28) | a | trust roots | **keep — forbidden** (cache stamp) |
| `invite_announcements` (29) | **c** | invite issuance metadata incl. approached-but-never-joined | **sweep**: delete rows with `expires_at` older than now − `ANNOUNCEMENT_RETENTION_DAYS` (default 60; 0=off). Applies to `open` AND `redeemed` (receipt supersedes) — operator decision D2 |
| `audio_blobs` (30) | a | members' actual voices (400 KB cap, per-key caps) | keep; the voice §7 entry already names the exposure. Blob eviction policy = the storage-budget/photos ratified-retention pattern, **out of scope here**, named in D4 |
| `newcomer_daily_writes` (31) | **c** | per-author last-activity stamps | **sweep**: delete rows with `window_start` older than `NEWCOMER_COUNTER_RETENTION_DAYS` (default 7; floor 2) — provably semantics-preserving (§0b) |
| `founder_nominations` (32) | c | — | already pruned on write |
| `founder_accessions` (32) | a | the dual-signed second root | keep (reseed artifact) |
| Caddy access logs (F-1) | **c** | member IPs + URIs + UAs, ≤30 MB | **C1**: bundled `deploy/Caddyfile` flips to `output discard` with a commented triage stanza; operator-guide §9 stops saying "if needed" and says "the bundled file discards; keep it that way" |
| Node pino logs | i | method-only lines (verified) | keep posture; note `LOG_REQUEST_PATHS` is triage-only |

**What CANNOT be minimized — the honest §7 core:** the vouch +
redemption graph (membership genealogy IS the trust system), the
signed exchange ledger, board/event/project content including voice
recordings (community-public by design), attendance rosters, open
ballots, ≤30 days of message routing metadata, and — on an
unencrypted or live-seized deployment — everything at once.
`DATABASE_KEY` protects the powered-off artifact and stolen backups
only; on a seized running host the key is in `.env` beside the
database (threat-model §6 already says this; the runbook repeats it
to the operator's face).

## 3. Part B — the retention sweep (C1 design)

### 3.1 Module

`apps/server/src/retentionSweep.ts`, shaped exactly like
`startCapacitySampler` (options object, injectable `now`, `tick` with
overlap guard, `setInterval(...).unref()`, `sweepOnce()` +` stop()`
exports for tests), started from `index.ts` after the mirror worker.
One prepared statement per rule:

```sql
-- claims: dead coordination state
DELETE FROM claims WHERE claimed_at < ?;
-- invite announcements: invite unusable either way
DELETE FROM invite_announcements WHERE expires_at < ?;
-- awaiting transitions: SETTLED only (matching exchange stored)
DELETE FROM awaiting_transitions
  WHERE received_at < ?
    AND EXISTS (SELECT 1 FROM exchanges e
                WHERE e.post_id = awaiting_transitions.post_id);
-- newcomer counters: window long dead
DELETE FROM newcomer_daily_writes WHERE window_start < ?;
```

Log line: counts only (`{ claims: n, announcements: n, transitions:
n, counters: n }`) — no keys, no ids, matching the minimal-logging
posture.

### 3.2 Envs (config.ts, `asNonNegativeInt` pattern; 0 disables each; operator-guide §6 table + docker-compose passthrough)

| Env | Default | Rule |
|---|---|---|
| `RETENTION_SWEEP_INTERVAL_MS` | `21600000` (6 h) | worker cadence; 0 disables the worker entirely |
| `CLAIM_RETENTION_DAYS` | 90 | `claimed_at` cutoff |
| `ANNOUNCEMENT_RETENTION_DAYS` | 60 | cutoff on `expires_at` (not `received_at` — an invite is unusable once expired, so the clock starts there) |
| `TRANSITION_RETENTION_DAYS` | 60 | settled-only; config **refuses** values in (0, 3) — the GO/NO-GO query looks back 48 h |
| `NEWCOMER_COUNTER_RETENTION_DAYS` | 7 | floor 2 (window is 24 h) |

### 3.3 Deletion-safety proofs, per table (the cursor question)

- **Not reseeded:** none of the four swept tables appear in
  `RESEED_KINDS` — the sweep can never race or starve a reseed.
- **`awaiting_transitions`, `newcomer_daily_writes`:** no GET route,
  no cursor, no federation leg (verified §0b). Internal-only.
- **`invite_announcements`:** client pull cursors on `received_at`;
  a device that never pulled an expired announcement loses only
  convenience display — the redemption receipt is the recorded
  authority (v29 comment). Same accepted trade as
  `MESSAGE_RETENTION_DAYS` ("a lagging device misses pruned
  envelopes"), and here the lost row is *about* a dead credential.
- **`claims`:** the one swept table in `MIRROR_KINDS`. A brand-new
  mirror catching up from zero will not receive pruned claims; a
  lagging mirror whose cursor is behind a pruned row skips it
  silently (exclusive `(ts,id)` cursor pages forward; a gap is
  indistinguishable from "no rows"). Both are the SAME loss class
  the reseed design already ruled acceptable for claims
  (coordination state re-converges on next action; the durable
  outcome — the exchange — is permanent). Stated in the §7 entry and
  in a comment beside the statement. 90-day default keeps any
  plausibly-live claim.
- **Trust invariant lock (test):** `retentionSweep.test.ts` asserts
  (1) each rule's behavior and floor, (2) a settled-vs-pending
  transition matrix, and (3) **the forbidden list**: after a full
  sweep over a fixture db, `redemptions`, `vouches`,
  `claimed_founders`, `founder_accessions`, `invite_revocations`,
  and one representative durable content table are byte-identical —
  the executable form of the §0b invariant.

### 3.4 Migration v33

The settled-only rule joins `exchanges` on `post_id`, which has no
index (verified: `exchanges` indexes are `completed_at`,
`helper_key`, `helped_key`). Append migration v33:
`CREATE INDEX exchanges_post_id_idx ON exchanges (post_id);` — same
shape as the v15 cap-index migration; never modify a past block.

## 4. Part A — the seizure runbook (C2 design)

### 4.1 Operator-guide: new §6 runbook — "Node seizure or compelled operator"

Placed beside the existing "Recovering from total node loss" and
**delegating the mechanical restore to it** (no duplicated steps).
Timeline structure:

1. **Before (in good times)** — the drill (§5) has been run; every
   member reachable out-of-band (§9 already requires this);
   `DATABASE_KEY` set and escrowed away from backups; retention
   sweeps on defaults; a member device has captured the node's
   `/config.systemKey` (R0 does this automatically); backups
   offsite.
2. **Hour 0 — assume the node is hostile.** Communicate ONLY
   out-of-band (§10 containment already says this; here is why it is
   load-bearing: a seized node can keep RUNNING — same domain, same
   data, same system key — and the server side is
   indistinguishable). If you still control DNS, point it away.
   Members' devices lose nothing: every device holds the full
   replicated history (this is the sentence the whole architecture
   exists to make true).
3. **What they have** — the honest inventory: cross-reference the §7
   entry (§4.3); on an unencrypted deployment, everything in §2's
   table; on an encrypted one seized LIVE or with `.env`, the same;
   plus up to 30 MB of Caddy/container logs (method-only node lines;
   pre-C1 deployments: IPs), the last 30 days of message routing
   metadata, and the `.env` **credentials**.
4. **What they can DO with it** — and the bound on each: they cannot
   forge any member-signed record (keys never on the node); they CAN
   sign auto-confirmations with the seized system key (bounded: an
   auto-confirmed exchange still requires a real member
   helper-signature, so laundering needs a colluding member key;
   named in §7); they CAN read peers/mirrors with the seized
   `PEER_READ_TOKENS`/`MIRROR_READ_TOKENS` **until those operators
   remove them — notify every peer/mirror operator in hour 0**; they
   CAN serve members who still point at the old address (observation
   + selective serving, not forgery — `docs/sync-liveness.md` is the
   staleness backstop).
5. **Stand up fresh infrastructure** — follow "Recovering from total
   node loss" §6 verbatim, with the seizure deltas: new domain (or
   onion address once the Tor sibling lands) if the old one is
   seized; fresh `DATABASE_KEY`; SAME `NODE_FOUNDER_KEYS` (founder
   keys do NOT rotate — nothing seized can mint them; verified §0a);
   new `NODE_SYSTEM_SECRET_KEY` + old key into `TRUSTED_SYSTEM_KEYS`
   **copied from a member device's captured /config record, never
   from memory**; reuse the old `NODE_ID` if known (else devices
   adopt-and-alias the new one — verified `nodeIdentity.ts`);
   `RESEED_GRACE_UNTIL` a few days out.
6. **Reach the members who only had the old address** — the
   out-of-band channel first; the printed outage kit's wallet cards
   carry the old address, so this plan adds one line to the wallet
   card (§4.4); the co-founder and mirror operators re-announce.
7. **After** — flip `READ_AUTH=on`, unset grace envs, fresh
   peer/mirror tokens BOTH sides, `system-key-rotation.md` for the
   forward key, write down what the community learned, re-run the
   drill within a month.

### 4.2 Member-guide passage (community-facing)

A short section after §15 ("If the device is at risk"): **"If the
community's server is ever taken."** Content, in member-guide voice:
your device holds the whole community — nothing is lost; expect word
through the channel the community agreed on, NOT through the app (a
taken server can still run); don't post about it in-app; when the
new address arrives, Settings → Community node, and one member's
"Restore this community onto a node" brings everything back; what a
taken server does and does not reveal (plain-language digest of the
§7 entry — it never holds your messages' contents or your keys).

### 4.3 Threat-model §7 entry

House format (bold-bullet, status-first, mirroring the R1 entry's
shape): **"Node seizure: what a seized node yields (minimization +
drill)."** Names: the irreducible yield (§2 bold paragraph) — vouch
graph, membership genealogy, ledger, boards incl. voice, rosters,
ballots, ≤30d message metadata; the seized-credentials analysis
(system key bounded by helper-signature; read tokens until peer
rotation; `DATABASE_KEY` protects powered-off only); the
seized-node-keeps-running scenario and why out-of-band channels are
the mitigation of record; what this work removed from the yield
(claims > 90d, dead announcements, settled transitions, stale
counters, proxy IP logs); and the standing drill as the tested
recovery. Also: one-line update to the §6 "Minimal server logging"
bullet (the Caddy caveat becomes "the bundled Caddyfile discards
access logs as of this work").

### 4.4 Paper kit line (shared with the future Tor plan)

`print.kit.cards.body` gains a "backup address" line rendered only
when the member's device knows an accepted mirror
(`listNodeEndpoints` already returns them): *"Backup address:
{{mirror}}"*. Minimal, en/es, and explicitly the placeholder the
`tor-onion-plan.md` sibling will extend with an onion address. (If
operator prefers, this slips to the Tor plan — decision D5.)

## 5. Part A — the drill (C3 design)

### 5.1 Checklist card

`DRILLS` gains `{ id: "seizure", steps: 7, docRef:
"docs/operator-guide.md §6 (seizure runbook)" }` — the existing
pattern exactly; no `infraStatus.ts` changes needed (helpers are
generic; out-of-range protection verified). Steps (i18n
`infra.drills.seizure.step1..7`, en/es, parity-gated):

1. Announce the rehearsal on the community's out-of-band channel —
   the channel itself is the thing being tested.
2. Tabletop the inventory: read aloud, from the threat model, what a
   seized server holds. No surprises on the real day.
3. Stand up a scratch node at a NEW address: same founder keys,
   fresh `DATABASE_KEY`, `RESEED_GRACE_UNTIL` set, old system key in
   `TRUSTED_SYSTEM_KEYS` from the app's captured record.
4. Share the new address through the out-of-band channel only —
   members point Settings → Community node at it.
5. One member runs "Restore this community onto a node" and the
   circle reads the per-kind summary together: every kind restored
   or already-present, every skip explained.
6. From a second member's device: pull, check history, then flip
   `READ_AUTH=on` and confirm members still get in on receipts
   alone.
7. Rotate as if it were real: new system key registered, grace envs
   unset, peer/mirror tokens refreshed — then mark the drill done.

### 5.2 Reseed-kind verification (the drift lock, upgraded)

The existing web drift guard is a hand-list. C3 adds the
**cross-inventory lock** in the server workspace (where both
inventories are reachable):
`mirrorPull.test.ts` (or a new `reseedCoverage.test.ts`) asserts
`RESEED_PATHS ⊇ MIRROR_KINDS.paths ∖ {"/claims", "/capacity-postures"}`
against a literal copy of the web walker's path list, with a comment
naming the two sanctioned exclusions (claims: not persisted
client-side, loss-ruled; capacity postures: node-system-signed,
regenerated) and `/founder-accession` as the reseed-only extra. Any
future durable kind added to the mirror set without a reseed leg now
fails a test instead of being remembered.

### 5.3 The automated seizure drill test — what it adds vs what exists

Honest accounting: the *mechanism* is already proven piecewise —
walker semantics (web `reseed.test.ts`), recovery envs
(`routes/reseed.test.ts`), the real-wire drill style
(`governanceDrill`/`cofounderDrill`), full client↔server
(`inviteFlow.e2e.test.ts`). **Missing: one test that actually kills
a populated node and restores onto a fresh one.** C3 adds
`apps/server/src/routes/seizureDrill.test.ts` in the governanceDrill
idiom: build node A (`node_lost`, system key, founders claimed,
member admitted, accession performed, posts/exchange/auto-confirmed
exchange/vouch/proposal written through real routes) → GET the wire
artifacts exactly as member devices hold them → `app.close()` + drop
the db → build node B (fresh `:memory:`, same founder env,
`READ_AUTH=on` after grace, `RESEED_GRACE_UNTIL`,
`TRUSTED_SYSTEM_KEYS`=A's key) → re-POST the artifacts in the
walker's literal kind order → assert: membership derives from
receipts alone (signed read succeeds), both founder roots present,
the auto-confirmed exchange re-verified, feeds equal A's. What the
automated test can NEVER cover — and the plan says so in the test
header — is the organizational half; that is what the §5.1 checklist
is for.

## 6. Phases

**C1 — "server: retention sweeps + proxy log discard"** (server +
deploy only). Migration v33; `retentionSweep.ts` + tests; config
envs + refusal floors; `index.ts` wiring; operator-guide §6 env-table
rows; docker-compose passthrough lines; `deploy/Caddyfile` log →
`output discard` (commented triage stanza). Gates: root
`npm run typecheck`; server suite (`npm --workspace
@understoria/server run test`); server lint; root `npm test`.
Rollback: revert the commit — sweeps stop; **already-deleted rows do
not return** (that is the feature; the conservative defaults and D1
are the safeguard). v33 is an index — revert-safe.

**C2 — "docs: seizure runbook, threat model, member passage"**
(docs only, no gates beyond review): operator-guide seizure runbook
(§4.1); member-guide passage (§4.2); threat-model §7 entry + §6
logging-bullet update (§4.3); community-reseed.md and
community-resilience.md cross-links. C2 references C1's shipped
defaults — sequence after C1.

**C3 — "web+server: seizure drill card + reseed coverage locks."**
`DRILLS` entry + en/es i18n (parity test gates it); a small
Infrastructure page render assertion for the fourth card;
`seizureDrill.test.ts` (§5.3); the mirror-vs-reseed coverage lock
(§5.2); the wallet-card backup-address line if D5 says now. Gates:
web suite from `apps/web` (`npx vitest run` — same count + new
tests, 0 unhandled rejections); `npm --workspace @understoria/web
run typecheck` and `run lint`; server suite; root `npm test`; PWA
build.

## 7. Operator decisions (before C1 merges)

- **D1 — sweep defaults on or opt-in?** Recommended: **ON** at the
  §3.2 defaults. A protection that defaults off does not exist on
  the day of a seizure; every window is generous relative to the
  data's live use, and 0 disables per-table for communities that
  ratify otherwise.
- **D2 — announcement sweep scope:** expired-`open` only, or all
  rows past `expires_at` (incl. `redeemed`)? Recommended: **all** —
  the redemption receipt is the permanent authority; a redeemed
  announcement duplicates it.
- **D3 — bundled Caddyfile access logs:** discard by default
  (recommended) vs keep console logging. Keeping contradicts
  operator-guide §9 and threat-model §6 on the project's own
  reference deployment.
- **D4 — anything that should stop being stored at all?** Audit
  found no free wins: every durable plaintext table is load-bearing
  (trust, ledger, content, governance). The two standing candidates
  are *policy* questions, not sweeps: `audio_blobs` eviction
  (belongs to the ratified-retention pattern the photos plan
  designed — defer) and `invite_announcements` as a feature (it was
  an explicit 2026-07 operator ruling; this plan bounds it rather
  than reversing it). Confirm or redirect.
- **D5 — wallet-card backup-address line** in C3, or deferred whole
  to the Tor/onion sibling plan?
- **D6 — drill cadence** to recommend in the runbook (suggest: with
  each of the other drills, and within a month after any real
  incident).

## 8. Named risks

1. **Pruning vs the trust fixpoint** — the count-stamp caches in
   `trustGate.ts`/`readAuth.ts` assume their sources are
   append-only. Mitigated structurally: the sweep touches four
   tables, none of them trust sources, and the forbidden-list test
   (§3.3) makes the invariant executable.
2. **Transition prune stranding auto-confirm** — pruning a PENDING
   artifact under `AUTO_CONFIRM_REQUIRE_TRANSITION=1` would refuse a
   legitimate confirmation (`missing_transition`) with no re-anchor
   guaranteed. Mitigated: settled-only `EXISTS` predicate + the 3-day
   floor + explicit test matrix. Residual: none identified.
3. **Lagging consumers of pruned rows** — a fresh mirror or
   long-offline device misses pruned claims/announcements. Accepted
   deliberately, same class as `MESSAGE_RETENTION_DAYS`, and both
   kinds are pre-ruled loss-tolerant; documented in the §7 entry so
   it is a decision, not a surprise.
4. **Seized system key + `TRUSTED_SYSTEM_KEYS`** — the recovery
   window lets the adversary's seized key verify; forging still
   requires a colluding member helper-signature, the window is ≤30
   days and operator-unset, and rows remain attributable. Named in
   the §7 entry (extends the existing R1 entry's honesty).
5. **The seized node keeps running** — indistinguishable
   server-side; no code can fix this. The runbook's whole first act
   (out-of-band only, never in-app) is the mitigation, and the drill
   step 1/4 rehearses exactly it.
6. **Drill checklist churn** — a future step-count change strands no
   state (`toggleDrillStep` drops out-of-range indexes — verified).
7. **i18n drift** — es copy is forced by `parity.test.ts`; drill
   copy must land en+es in the same commit or the web gate fails.
8. **Sweep deletions are irreversible by design** — rollback of C1
   stops future sweeps only. Defaults chosen so nothing plausibly
   live is ever in range; D1 is the human check on that claim.

## 9. Audit trail — inventory commands (run 2026-07-25, repo root)

- Schema: read `apps/server/src/db.ts:480–1531` in full (v1→v32);
  `grep -n "CREATE TABLE\|schema_version" apps/server/src/db.ts`.
- Deletions today: `grep -rn "DELETE FROM" apps/server/src` → 8
  statements (messages, device_link ×2, capacity trim, link_requests
  ×2, founder_nominations ×2); no others.
- IP surface: `grep -rn "req\.ip\|hashIpToBucket" apps/server/src` →
  rate-limit key (server.ts:198,664) + link bucket
  (linkRequests.ts:122,146) only; pino serializer override
  server.ts:150–155; Caddy: `deploy/Caddyfile:86–89` log block
  (finding F-1); compose log caps docker-compose.yml:165–171.
- Trust reads/memoization: `trustGate.ts:56–60,104–155` (redemptions
  + vouches + claimed_founders; COUNT-stamp cache);
  `readAuth.ts:37–41` closure definition; `db.ts:845–848` receipt
  retention ruling.
- Reseed kinds: `apps/web/src/lib/reseed.ts:113–171` (23 kinds,
  founderAccessions verified present); drift guard
  `reseed.test.ts:241–271`; mirror kinds `mirrorPull.ts:149–346`
  (24; set-difference computed by inspection).
- Drill pattern: `Infrastructure.tsx:64–71` (DRILLS), i18n
  `infra.drills.*` dumped from `en.json` (3 drills, step text
  localized); `infraStatus.ts:205–219` shrink-safety; parity test
  `apps/web/src/i18n/parity.test.ts`.
- Newcomer-counter reset semantics: `newcomerCaps.ts:176–177`.
- Transition first-writer-wins: `db.ts:2404–2409`; GO/NO-GO 48 h
  join: operator-guide §6 snippet.
- Node identity/aliases: `apps/web/src/lib/nodeIdentity.ts:22–65`.
- Scheduler pattern: `capacitySampler.ts:187–211`; workers wired in
  `index.ts:44–120`.
- E2E precedents read: `routes/reseed.test.ts`,
  `routes/governanceDrill.test.ts`, `routes/cofounderDrill.test.ts`,
  `lib/inviteFlow.e2e.test.ts` headers + harness.
- Tor sibling: `grep -ri onion docs/` → 0 files (plan does not exist
  yet); paper kit copy from `print.kit.*` (no backup-address line).
- Exchange indexes (v33 justification): v1 block — `completed_at`,
  `helper_key`, `helped_key`; no `post_id` index anywhere later.
