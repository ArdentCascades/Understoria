# Capacity forecast — seeing a node fill up before it does

> **Status:** **proposed** — design note for operator review and
> annotation. No implementation PRs yet; §8 names the PR sequence and
> §11 collects the rulings needed before code. Every code claim below
> was checked against the tree (2026-07, post pilot-readiness package),
> not remembered. Companion docs:
> [`storage-budget.md`](./storage-budget.md) (the per-device budget
> this note deliberately does **not** duplicate),
> [`community-resilience.md`](./community-resilience.md) (the
> `/grow-root` recruitment machinery this note feeds),
> [`auto-confirm-key.md`](./auto-confirm-key.md) (the node system key
> §6 reuses), [`threat-model.md`](./threat-model.md) and
> [`operator-powers.md`](./operator-powers.md) (the boundaries §7
> defends).

---

## 0. The question, sized honestly

A community grows. The node — an old laptop in a closet is enough —
slowly fills: disk fills with signed records, RAM and CPU tighten as
more members sync more often. Left unseen, the failure is ugly: the
`insertCaps` backstop starts returning `507 capacity_reached`
(`apps/server/src/insertCaps.ts:24-54`) and writes bounce, or the box
simply slows until sync feels broken. We want to see it coming, with
enough lead time to do one of two things: **add resources to the
current node**, or **stand up a second one**. And we want that without
building the surveillance apparatus the rest of the app refuses to
have.

Three honesty checks before any design, because each one changes the
shape of the answer:

**A. This is about the node, not the phone.** The request names "hard
drive storage, RAM, processing speed" — that is the *server*. The only
capacity signal the app has today, `readStorageStatus()` over
`navigator.storage.estimate()` (`apps/web/src/lib/storageBudget.ts`),
measures a *member's own browser IndexedDB budget* — a different axis,
already handled by [`storage-budget.md`](./storage-budget.md)'s
windowing. The node deliberately measures none of its own resources:
`GET /health` returns exactly `{ status: "ok" }` with a comment
refusing to leak "version, member counts, host info"
(`apps/server/src/routes/health.ts:23-28`). So the thing we actually
need to forecast is the one place with **zero telemetry today** — the
new sensor is server-side, and that is the real work.

**B. Only disk gives a clean countdown.** Disk usage grows roughly
monotonically, so "days until full" is a well-posed projection and the
headline number. RAM and CPU do not "run out" on a timeline — they get
tight under load. Forecasting them as a date would be false precision.
We surface disk as a countdown and RAM/CPU as a pressure gauge
(green/amber/red trend), and we do not pretend the latter is a clock.

**C. Any maxed resource degrades the community, so the node's health
is the *worst* of its dimensions.** Per the operator's ruling, a full
disk, an exhausted RAM, and a pegged CPU are all "the node is in
trouble." The combined node signal is therefore `max(pressure)` across
{disk, RAM, CPU} — the worst dimension dominates — with disk
additionally carrying the countdown.

The good news: roughly 70% of the machinery already exists. This note
is mostly connective tissue between two shipped subsystems — the
storage budget (capacity) and community resilience (recruitment) —
plus one genuinely new server-side sensor and a small local
time-series.

## 1. The principle: forecast locally, act consensually, keep the numbers home

Three commitments hold the design inside the app's existing values:

1. **The forecast is computed where the data already lives, and the
   raw numbers never leave that machine.** Node disk/RAM/CPU are read
   on the node and stay on the node (operator-only readout, §5). Only a
   coarse traffic-light *decision* — never a byte count — is ever
   shared community-wide (§6). This mirrors `storage-budget.md`'s
   standing rule that "the numbers never leave the device" and the
   threat model's refusal of a device census.

2. **Two escalations fall out of one forecast.** *Vertical* — warn the
   node operator to add resources (the "original account" in the
   request; there is no owner account, so this is the operator, §5.1).
   *Horizontal* — prompt trusted members to grow a second root (§5.2).
   Same threshold ladder, two audiences.

3. **Everything is pull-only.** The app has no push, no badges, no
   reminders anywhere — `no-notifications` is an enforced principle,
   not a preference. A capacity warning appears on a surface the
   operator/member already chooses to open (the Infrastructure page,
   the Board attention rail, the resilience card). No background alert
   is in scope, ever.

## 2. What exists today (the 70%)

| Piece | Where | Reuse |
|---|---|---|
| Per-device storage meter + windowing | `lib/storageBudget.ts`, `lib/storageWindow.ts` (`previewWindow()` per-category counts) | Growth-rate input for the client sampler (§3B) |
| Disk-fill backstop (write-side) | `apps/server/src/insertCaps.ts` (`507 capacity_reached`) | The read-side forecast is its complement; do **not** add the new table to its `SURFACES` map |
| `/health` opacity contract | `apps/server/src/routes/health.ts:23-28` | Capacity data stays **off** `/health`; it lives on an operator-gated route |
| Resilience tier + grow-root wizard | `lib/resilience.ts`, `components/dashboard/ResilienceCard.tsx`, `pages/GrowRoot.tsx`, `lib/growRoot.ts` | The horizontal escalation is a new urgency input, not new UI |
| Trusted-member gate | `lib/vouch.ts` (`MINIMUM_VOUCHES_FOR_TRUST = 2`), `growRoot.ts` (`MIN_VOUCHES_TO_GROW`) | Who sees the recruitment prompt |
| Attention rail (pull-only, null-when-empty) | `lib/attention.ts`, `components/AttentionSection.tsx` | The member-facing warning surface |
| Consent/suggest-card no-nag pattern | `components/MirrorSuggestCard.tsx`, `lib/nodeEndpoints.ts` (dismiss persists) | The "grow a root" suggest card |
| Node system signing key (not a member) | `apps/server/src/systemSigner.ts`, `GET /config.systemKey` | Signs the coarse community attestation without outing the operator (§6) |
| Signed LWW record recipe | `SeedVaultPledge` end-to-end (§6) | Template for the `CapacityPosture` kind |

What is genuinely new: (a) the node measuring itself, (b) a small local
time-series to fit a slope against, (c) the forecast math, and (d) one
node-authored coarse record kind.

## 3. The signals — two sensors, kept apart

### 3A. Node self-sampling (new, server-side)

A periodic worker samples the node's own resources into a local
ring-buffer table. **All standard-library — no native module:**

- **Disk free/total** — `fs.statfs(dir)` on `config.databasePath`'s
  directory (`{ bsize, bavail, blocks }` → free = `bavail * bsize`).
- **DB footprint** — `fs.statSync(databasePath).size` (plus the `-wal`
  sidecar, since WAL is on: `db.pragma("journal_mode = WAL")`,
  `apps/server/src/db.ts:427`).
- **RAM** — `os.freemem()` / `os.totalmem()`.
- **CPU** — `os.loadavg()[0]` (node-wide 1-minute load; not
  `process.cpuUsage()`, which is per-process).

Grep confirms none of these are read anywhere in `apps/server/src`
today — it is all net-new, and none of it touches a member record.

**Table (schema v26).** The last migration block is `if (current < 25)`
(`apps/server/src/db.ts:1234`), so this is v26 — append a new block,
never edit a past one:

```sql
CREATE TABLE node_capacity_samples (
  id INTEGER PRIMARY KEY AUTOINCREMENT,   -- insertion order; trim cursor
  sampled_at INTEGER NOT NULL,
  disk_free_bytes INTEGER, disk_total_bytes INTEGER,
  db_size_bytes INTEGER,
  mem_free_bytes INTEGER, mem_total_bytes INTEGER,
  load_avg_1m REAL
);
CREATE INDEX node_capacity_samples_sampled_at_idx
  ON node_capacity_samples (sampled_at);
```

This table is **operator-local**: no POST route, no `peerPull`/
`mirrorPull` leg, never added to `insertCaps` `SURFACES`. It is machine
metadata about the operator's own box — the equivalent of reading `df`
over SSH, persisted so we can compute a slope.

**Ring buffer.** A `record()` that inserts then trims to the newest
`keepN` by rowid in one `db.transaction`, modeled on
`createDeviceLinkStore` (`db.ts:2664`):
`DELETE FROM node_capacity_samples WHERE id <= (SELECT MAX(id) …) - ?`.
`keepN ≈ 2000` samples covers months. Cadence and size come from env
via `readConfigFromEnv` (`config.ts:288`), following the
`peerPullIntervalMs`/`mirrorPullIntervalMs` precedent:
`capacitySampleIntervalMs` (default e.g. 15 min) and
`capacitySampleKeepN`.

**Worker.** Modeled on `startMirrorPullWorker`'s `setInterval` +
overlap-guard + `timer.unref?.()` shape
(`apps/server/src/mirrorPull.ts:397`, tick `:745-767`); wired in
`apps/server/src/index.ts` right after the mirror worker (`:130`), with
`sampler.stop()` added to the shutdown handler (`:132-146`). The
`fs`/`os` reads and the insert run synchronously in the timer callback,
consistent with the "synchronous by design" posture (`db.ts:56-59`),
off the request path.

### 3B. Community-growth sampler (client-side, no new privacy surface)

To forecast *growth* (and to give members a legible sense of the trend
without the operator token), a once-daily local snapshot of what a
device already holds: `members.length`, `previewWindow()` per-category
record counts (`lib/storageWindow.ts`), and the device's own
`readStorageStatus()`. Stored in a device-local settings-JSON ring
buffer, modeled on `journalEntries` — **local-only, never enqueued to
the outbox** (the `OutboxRow.kind` union rejects it at the type level,
exactly as `journal_entry` is excluded). This never federates; it is a
per-device convenience, and the authoritative node forecast is §3A.

## 4. The forecast (`lib/capacityForecast.ts`, pure + tested)

One pure module consumes either sample stream and is deliberately
simple and robust to noise:

```
slope        = theilSen(samples over trailing window)   // median of
                                                         // pairwise slopes
current      = ewma(recent readings)                    // smoothed "now"
daysToFull   = (threshold - current) / max(slope, ε)    // disk only
```

Design choices that matter:

- **Theil–Sen (median-of-slopes), not least squares.** One reindex or
  purge spike shouldn't swing the estimate; the median slope shrugs off
  outliers.
- **Thresholds in *time*, not percent.** "90% but flat" is fine; "55%
  and climbing fast" is not. Alert on `daysToFull`: **amber < 120 days,
  red < 45 days** (tunable). Percent-only thresholds would fire on the
  wrong communities.
- **Report a range, not a point** — "~60–90 days" — widened by sample
  variance. The request said "approximately"; a false-precise date
  erodes trust.
- **Worst-dimension-dominates.** Combined node pressure =
  `max(pressure(disk), pressure(ram), pressure(cpu))`. Disk pressure
  derives from `daysToFull`; RAM/CPU pressure from a trailing headroom
  trend (sustained free-RAM shrinking / p95 load rising → amber → red),
  with **no countdown**.
- **Hysteresis.** A dimension must hold a worse band for K consecutive
  samples before the level worsens, and recover for longer before it
  eases — so the readout doesn't flip amber↔green daily. This also
  honors the repo's "declining persists, never nags" rule.
- **Degenerate guards.** `slope ≤ 0` → "no exhaustion projected";
  fewer than N samples → "still gathering data" (never a fabricated
  date).

Every branch is unit-tested with injected sample series (the
`lib/*.test.ts` beside-the-module convention); `now` is injectable for
determinism, as `attention.ts` already does.

## 5. The two escalations

### 5.1 Vertical — warn the operator to add resources

There is no owner/admin account (identity is a keypair; the operator
has no privileged member identity — founder trust is `NODE_FOUNDER_KEYS`,
a server env of *member* keys, not the operator's). So "warn the
original account" becomes a **pull-only operator readout**, on a surface
the operator already reads.

- **Transport.** A new operator-authenticated `GET /capacity` returns
  the forecast (levels + disk range), **not** raw bytes to anonymous
  callers. There is no operator identity to sign a challenge, and every
  existing privileged non-member channel is a shared-secret bearer
  (`PEER_READ_TOKENS`, the internal token). So: add an `OPERATOR_TOKEN`
  env (via `nonEmpty`, alongside `operatorContact`, `config.ts:307`);
  add `"/capacity"` to `OPEN_PATH_PREFIXES` (`readAuth.ts:69`) so the
  member-read guard doesn't 401 it; the route does its own
  constant-time bearer check (`crypto.timingSafeEqual`) and, if
  `OPERATOR_TOKEN` is unset, **the route does not exist** (fail-closed).
  Do **not** reuse `PEER_READ_TOKENS` (peers would read operator
  telemetry) or `NODE_FOUNDER_KEYS` (members aren't operators).
- **Surface.** A new card in the Infrastructure page's 2-col grid
  (`pages/Infrastructure.tsx`), after Governance / before `SourceCard`.
  Copy stays inside the page's honesty rules: *"Node disk ~78% used —
  projected full in ~50 days at current growth. Add storage, or window
  older records."* with links to storage windowing and
  [`deploy-alternatives.md`](./deploy-alternatives.md). The page is
  member-readable by design; the detailed numeric readout is gated to
  whoever holds the operator token (entered locally, device-stored like
  the drill-checklist state).

### 5.2 Horizontal — prompt trusted members to grow a root

The recruitment machinery already exists and is already gated
correctly. The forecast becomes a new **urgency input**, not new UI.

- **The card always offers "grow a root" today** — the dashed `+` and
  CTA in `ResilienceCard.tsx:125-131` render unconditionally. We do not
  add a new button; we **elevate the copy** when the forecast is red.
- **Gate the elevation on "no healthy mirror exists,"** so we don't
  nag a community that already failed over. The exact predicate is
  `snapshot.nodesReachable < 2` (equivalently tier `seedling` /
  `taking_root`) from `computeResilience` (`lib/resilience.ts`). If you
  want "a *mirror* specifically is healthy," read the per-endpoint
  `isRecentSuccess` loop in the card effect (`ResilienceCard.tsx:66-74`).
- **Who sees it: trusted members**, per the operator's ruling — the
  same cohort the wizard already gates its destination on. Exact check,
  copied from `GrowRoot.tsx:151-154`:
  `vouchCountFor(pk, { vouches, invites }) >= MIN_VOUCHES_TO_GROW`.
- **A pull-only `grow_a_root` attention item** carries it to those
  members. Adding an `AttentionItem` kind is mechanical: extend the
  union (`attention.ts:51`), the two exhaustive maps `KIND_PRIORITY`
  (`:212`, tier 7 — informational) and `ATTENTION_EMOJI`
  (`attentionMeta.ts:31`), an optional `AttentionInput` field (`:227`),
  a push block in `computeAttentionItems` (`:275`, guarded on
  `currentMember` and the trust gate), a render branch
  (`AttentionSection.tsx:285`, a `<Link to="/grow-root">` row), and
  i18n keys (en + es). The section already renders null when empty
  (`:125`).
- **No-nag.** A `GrowRootSuggestCard` follows the `MirrorSuggestCard`
  contract exactly: two buttons, and declining persists to a
  device-local `SETTING_KEYS.growRootSuggestDismissed` flag (copy
  `dismissMirror`, `nodeEndpoints.ts:140-151`) so it never re-nags.

## 6. The community-facing attestation (node-authored, operator stays private)

For trusted members to see "we should grow a root" — even the ones who
aren't the operator and hold no operator token — the node must say so
community-wide. The privacy trap: if the operator, as a member, signed
that statement, it would **out which member runs the server**, which
the threat model treats as private. The escape is that the repo already
has a signing key that is *structurally not a member*.

**Sign with the node system key, not a member key.**
`NODE_SYSTEM_SECRET_KEY` (the auto-confirm system key,
`apps/server/src/systemSigner.ts`) is a per-node Ed25519 key, unrelated
to any member identity, published as `systemKey.{current,history}` in
`GET /config`, and the verification path **refuses to let it collapse
onto a member pubkey**: `if (pubkey === exchange.helpedKey) return
"invalid"` (`packages/shared/src/crypto.ts:246`). Its rotation-aware
resolver (`resolveSystemPubkey(nodeId, signedAt)`,
`mirrorPull.ts:508-538`) is reusable as-is. And
[`auto-confirm-key.md`](./auto-confirm-key.md) §4 (`:177-182`)
*explicitly anticipates this*: a future "node identity" attestation
"should be **reused, not duplicated**." So Phase 6 does not mint a
second key — it extends the audited §2 contract of `systemSigner.ts`
(whose header requires exactly that amendment before adding a signing
surface) to authorize one new payload shape.

**The record: `CapacityPosture`, coarse by construction.** A signed LWW
record, one per node (natural key = `nodeId`), containing **only a
decision, never a measurement**:

```ts
interface CapacityPosture {
  nodeId: string;                              // natural key
  pressure: "green" | "amber" | "red";         // worst-dimension band
  horizon: "ample" | "months" | "weeks";       // coarse disk bucket
  growthRecommended: boolean;                   // the recruitment trigger
  generatedAt: number;                          // LWW clock
  signerKey: string;                            // = node system pubkey
  signature: string;
}
```

No bytes, no percentages, no member counts — those stay operator-only
on `/capacity`. This is the whole privacy bargain: the community learns
*that* it should grow, never the raw shape of the node.

**Flow — a node-authored variation on the `SeedVaultPledge` recipe.**
Unlike a member-authored record (client → outbox → POST → store),
`CapacityPosture` originates on the server when the forecast band
changes, so the client author/outbox/submit legs are omitted and
replaced by a server-side emit:

1. `packages/shared/src/types.ts` — declare `CapacityPosture`.
2. `packages/shared/src/crypto.ts` — `verifyCapacityPosture =
   verifyStateRecord` (reuse `signStateRecord` / `canonicalStatePayload`
   / `stableStringify` — whole-row LWW, no bespoke canonical fn).
3. **Server emit** — the forecaster writes a fresh posture (signed via
   `SystemSigner.signPayload`) to a new `capacity_postures` store when
   the band transitions (hysteresis from §4 applies here too, so it
   doesn't thrash). Migration adds the table (next free version);
   store is `INSERT OR REPLACE` by `nodeId`.
4. `GET /capacity-posture` — paged feed, member-readable under the
   normal read-auth guard (it is coarse and meant for members).
5. `apps/server/src/mirrorPull.ts` — add a spec entry so same-community
   mirrors replicate it. **Omit `peerPull`** — capacity is
   community-internal, exactly as `SeedVaultPledge` is peer-excluded.
6. `apps/web/src/lib/federationSync.ts` — a cursor + `pullCapacityPostures()`
   that verifies the signature against the node system key (via the
   rotation-aware resolver / `GET /config.systemKey`, with the
   authority check `signerKey === resolved system pubkey for nodeId` —
   the node-key analogue of `SeedVaultPledge`'s `signerKey ===
   memberKey`), LWW by `generatedAt`, composite-cursor advance, and
   **never advances the cursor past a row it can't verify**.

The client then feeds `growthRecommended` into §5.2's attention item —
so a trusted member on any device sees the prompt, and the operator's
member identity is never revealed.

## 7. Privacy & boundaries (what this must not become)

The design is deliberately bounded by the app's permanent-boundary
list:

- **No device census.** The forecast never enumerates members' devices
  or their storage. Node metrics describe one machine (the node);
  growth metrics are counts a device already holds. `storage-budget.md`
  rejects the DHT for exactly this reason and the boundary is inherited
  here.
- **Numbers never leave the machine that produced them.** Node
  disk/RAM/CPU stay on the node (operator-token readout only). The only
  cross-community emission is the three-value `CapacityPosture` bucket —
  a decision, not a measurement.
- **Operator anonymity is preserved.** §6's node-key signing is the
  crux: the community can act on "grow a root" without learning who
  hosts. Signing the posture with a member key would be a privacy
  regression and is explicitly rejected.
- **No notifications.** Every surface is pull-only (attention rail,
  resilience card, Infrastructure page). No push, no badge, no
  background alert — enforced, not optional.
- **Honest wording.** Following `resilience.ts`'s "never say more than
  the code delivers": the operator card states a projection with a
  range and its assumption ("at current growth"); the member prompt
  says "the community would be more resilient with another root," not a
  number.

## 8. PR sequence

Each PR is independently shippable and independently verifiable.

| PR | Scope | New/changed |
|---|---|---|
| **1** | Forecast lib + client growth sampler | `lib/capacityForecast.ts` (+ tests), local growth ring buffer. Pure, no UI, no privacy surface — proves the math on real data. |
| **2** | Node self-sampling | v26 table + ring-buffer store, `startCapacitySampler` worker + `index.ts` wiring, `fs.statfs`/`os` reads, env config. |
| **3** | Operator readout | `OPERATOR_TOKEN`, `GET /capacity`, `OPEN_PATH_PREFIXES` entry, Infrastructure capacity card. The vertical warning. |
| **4** | Horizontal wiring | `grow_a_root` attention item, `ResilienceCard` copy elevation gated on `nodesReachable < 2` + trust, `GrowRootSuggestCard` + dismiss flag. |
| **5** | Community attestation | `CapacityPosture` kind, `systemSigner` §2-contract amendment + new signing payload, server emit + `GET /capacity-posture` + mirror replication + client pull. Feeds PR 4's item to non-operator trusted members. |

Order rationale: PR 1 is decoupled and validates the model before any
sensor exists; PR 2 gives it real node data; PR 3 delivers operator
value with nothing federated; PR 4 delivers member value from
device-local signals; PR 5 (the only new federated data + the only
`systemSigner` change) is last, so the highest-scrutiny change ships on
top of a proven stack. PRs 1–4 can ship without ever touching the
federation or the system key.

## 9. Verification bar

- **Forecast:** unit tests over injected series — monotonic fill hits
  the right band and a plausible `daysToFull`; flat/decreasing yields
  "no exhaustion"; a single spike does not swing Theil–Sen; hysteresis
  needs K samples to change band; sub-N samples yields "gathering data."
- **Sampler:** a test double for `fs.statfs`/`os`/`statSync` (injected,
  as the worker skeleton allows) drives `record()`; assert the ring
  buffer never exceeds `keepN` and trims oldest-first; assert the table
  is absent from `insertCaps` `SURFACES` and has no pull leg.
- **Operator route:** unset token → route absent (fail-closed); wrong
  token → 401; correct token → forecast; confirm `/health` still
  returns bare `{status:"ok"}`.
- **Attestation:** a member-key-signed `CapacityPosture` is rejected on
  ingest (authority check); an unverifiable row never advances the
  cursor; LWW keeps the newest `generatedAt`; a rotated system key
  still verifies via `signedAt`; grep-confirm no `peerPull` leg.
- **End-to-end drill:** on a two-node test setup, force the disk sample
  into the red band, confirm the operator card shows the projection,
  the origin emits a `red` / `growthRecommended` posture, a mirror
  replicates it, and a trusted member's client raises the `grow_a_root`
  attention item while a non-trusted member's does not.

## 10. Threat-model obligations (before PR 5 merges)

- Amend `systemSigner.ts` §2 contract 1 and
  [`auto-confirm-key.md`](./auto-confirm-key.md) §2/§4 to authorize the
  `CapacityPosture` payload as the second thing the system key may
  sign, with its canonical shape and the "coarse buckets only"
  constraint written down.
- Add a `threat-model.md` §7 entry: the new operator token
  (shared-secret bearer; rotation = change the env; scope = read-only
  forecast, no record access), and the assertion that `CapacityPosture`
  carries no member-identifying or quantitative data.
- Note in `storage-budget.md` and `community-resilience.md` that the
  forecast conditions their surfaces (the cross-link they already
  anticipate).

## 11. Open questions — rulings before code

Defaults in **bold**; each can be answered in one sitting.

1. **Alert thresholds.** Disk countdown amber/red at **120 / 45 days**?
   RAM/CPU pressure bands off sustained trailing headroom (default
   **amber at <20% sustained free / red at <8%**, load relative to core
   count)?
2. **Sampling cadence & retention.** `capacitySampleIntervalMs` default
   **15 min**, `capacitySampleKeepN` default **2000** (~3 weeks at 15
   min; enough for a robust 30-sample trailing window with headroom)?
3. **Operator readout entry.** Operator token entered **locally on the
   Infrastructure page** and stored device-local (like the drill
   checklist), versus any other channel?
4. **Posture emission cadence.** Emit a new `CapacityPosture` **only on
   band transition** (green→amber→red and back, hysteresis-guarded),
   not on every sample — agreed, to keep the federated write rate near
   zero?
5. **RAM/CPU in the *community* posture, or operator-only?** Default:
   the community posture's `pressure` is the **worst dimension**
   (per the "any maxed resource degrades performance" ruling), so a RAM
   or CPU squeeze can trigger recruitment too — but the *horizon*
   bucket stays disk-only (the only honest countdown). Confirm this is
   the intended coupling.

---

*This note is the blueprint; no code lands until the §11 rulings are
in. The recommended first move is PR 1 (the forecast lib), which is
pure, testable, and commits us to nothing federated.*
