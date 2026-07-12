# Capacity forecast — seeing a node fill up before it does

> **Status:** **in build** — design note reviewed by the operator; the
> five §11 rulings are **resolved (2026-07-12)**. §8's four-PR sequence
> is landing in order: **PR 1 (forecast lib), PR 2 (node self-sampling),
> and PR 3 (the node-signed `CapacityPosture` — the only federated data
> + the only `systemSigner` change) are shipped**; **PR 4** (trusted-
> member surfacing) is the remaining piece. Every code claim below
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
   on the node, forecast on the node, and never leave it. Only a coarse
   traffic-light *decision* — never a byte count — is shared, and only
   with the trusted community (§6). This mirrors `storage-budget.md`'s
   standing rule that "the numbers never leave the device" and the
   threat model's refusal of a device census.

2. **One signal, owned by the trusted community.** A node running low
   is a *community* problem, not an operator problem. A single forecast
   surfaces one coarse signal to the whole trusted cohort (§5), who
   collectively choose the response — add resources to the node they
   host, grow a second root (§5.2), or talk it through. The app never
   singles out the operator: there is **no operator-only surface**, so
   nothing in the UI marks which account runs the server (§7). That is
   deliberate — an operator-distinguished surface would paint a target
   on one member's back.

3. **Everything is pull-only.** The app has no push, no badges, no
   reminders anywhere — `no-notifications` is an enforced principle,
   not a preference. A capacity signal appears on a surface a trusted
   member already chooses to open (the Board attention rail, the
   resilience card). No background alert is in scope, ever.

## 2. What exists today (the 70%)

| Piece | Where | Reuse |
|---|---|---|
| Per-device storage meter + windowing | `lib/storageBudget.ts`, `lib/storageWindow.ts` (`previewWindow()` per-category counts) | Growth input for the optional client mirror (§3B) |
| Disk-fill backstop (write-side) | `apps/server/src/insertCaps.ts` (`507 capacity_reached`) | The read-side forecast is its complement; do **not** add the new table to its `SURFACES` map |
| `/health` opacity contract | `apps/server/src/routes/health.ts:23-28` | Capacity data stays **off** `/health`; the community signal is the coarse posture (§6) and raw numbers never leave the box |
| Resilience tier + grow-root wizard | `lib/resilience.ts`, `components/dashboard/ResilienceCard.tsx`, `pages/GrowRoot.tsx`, `lib/growRoot.ts` | The "grow a root" response is a new urgency input, not new UI |
| Trusted-member gate | `lib/vouch.ts` (`MINIMUM_VOUCHES_FOR_TRUST = 2`), `growRoot.ts` (`MIN_VOUCHES_TO_GROW`) | Who sees the capacity signal at all |
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

### 3B. Community-growth mirror (optional, client-side)

The node forecasts from its own samples (§3A), so this layer is a
*nicety*, not load-bearing: a once-daily device-local snapshot of what a
device already holds — `members.length`, `previewWindow()` per-category
counts (`lib/storageWindow.ts`), the device's own `readStorageStatus()`
— so a member can glance at a coarse growth trend on their own device.
Stored in a device-local settings-JSON ring buffer, modeled on
`journalEntries` — **local-only, never enqueued to the outbox** (the
`OutboxRow.kind` union rejects it at the type level, exactly as
`journal_entry` is excluded). It never federates and the authoritative
forecast remains §3A. Cut it if it isn't earning its keep.

## 4. The forecast (`lib/capacityForecast.ts`, pure + tested)

One pure module — running on the node against its §3A samples, and
reusable client-side for the optional §3B mirror — is deliberately
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

## 5. The response — owned by the trusted community

A node running low is a *community* problem. One coarse signal — the
`CapacityPosture` of §6, computed on the node and signed by its system
key — surfaces to the **whole trusted cohort**, who collectively choose
the response. There is deliberately **no operator-only surface and no
operator-authenticated readout**: nothing in the app marks which account
runs the server, so no one — trusted or not — can read the UI to find
the operator and lean on them. The `NODE_FOUNDER_KEYS` / operator role
stays exactly as private as it is today. (An operator-only readout was
the earlier design; it was cut precisely because "the one account that
gets capacity warnings" is itself a tell.)

### 5.1 What trusted members see

When the community posture reaches amber/red, a **pull-only attention
item** appears for every trusted member (mechanics in §5.2). It is
framed as a shared situation with a menu of responses, none of which
requires the app to know who hosts:

- **"Our community's node is running low on room."** Coarse and honest,
  no numbers — the posture is a band, not a byte count.
- **Response A — add resources.** Addressed to *whoever hosts*, without
  naming them: "If you run this community's server, it may need more
  storage, memory, or a chance to shed older records." The operator
  recognizes their own box and acts privately; the app never points at
  them. The *how much* is an ordinary server-operations question the
  host answers on the box itself (`df`, `free`, the node's own logs) —
  the app does not need a networked telemetry readout to tell an
  operator something they can see by looking at their own machine.
- **Response B — grow another root.** Anyone trusted can relieve the
  pressure horizontally by standing up a second node (§5.2). This is the
  response the app can actively help with, and the one that
  *distributes* the target rather than concentrating it — so the copy
  leans toward it.

The two escalations from the earlier draft thus collapse into one
community signal with a menu, and the app favors the response (B) that
spreads resilience over the one (A) that would draw attention to a
single host.

> **Optional, strictly out-of-band.** If a host wants the node to write
> its own forecast somewhere for their eyes, that is a private
> server-side diagnostic (a log line, or an opt-in, off-by-default,
> never-advertised local endpoint) — not a member-facing surface, not
> part of this flow, and not required. The community flow is 100% the
> coarse posture. Whether to include even this local diagnostic is
> ruling R3 (§11).

### 5.2 Growing another root (the response the app helps with)

The recruitment machinery already exists and is already gated
correctly. The forecast becomes a new **urgency input**, not new UI.

- **The card always offers "grow a root" today** — the dashed `+` and
  CTA in `ResilienceCard.tsx:125-131` render unconditionally. We do not
  add a new button; we **elevate the copy** when the posture is red.
- **Gate the elevation on "no healthy mirror exists,"** so we don't
  nag a community that already failed over. The exact predicate is
  `snapshot.nodesReachable < 2` (equivalently tier `seedling` /
  `taking_root`) from `computeResilience` (`lib/resilience.ts`). If you
  want "a *mirror* specifically is healthy," read the per-endpoint
  `isRecentSuccess` loop in the card effect (`ResilienceCard.tsx:66-74`).
- **Who sees it: trusted members** — the whole cohort, the same bar the
  wizard already gates its destination on. Exact check, copied from
  `GrowRoot.tsx:151-154`:
  `vouchCountFor(pk, { vouches, invites }) >= MIN_VOUCHES_TO_GROW`.
  Untrusted members never see the capacity signal at all — which is also
  what keeps it from being a reconnaissance tool for locating the host.
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

For the trusted community to see "we're running low" — without any of
them being singled out as the host — the node must say so
community-wide, in a form that carries a decision but no measurement and
no operator identity. The privacy trap: if the operator, as a member,
signed that statement, it would **out which member runs the server**,
which the threat model treats as private. The escape is that the repo
already has a signing key that is *structurally not a member*.

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

No bytes, no percentages, no member counts — those never leave the node
at all. This is the whole privacy bargain: the community learns *that*
it should grow, never the raw shape of the node, and never who runs it.

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
  disk/RAM/CPU stay on the node; nothing serves them over the network.
  The only cross-community emission is the three-value `CapacityPosture`
  bucket — a decision, not a measurement.
- **No operator-distinguished surface — no target on one member's
  back.** A first-class requirement, not a side effect. There is no
  operator-only readout, no operator token, nothing in the app that
  marks which account runs the server; the capacity flow is owned by the
  whole trusted community, and an untrusted onlooker learns nothing
  (they never see the signal). §6's node-key signing is the crux: the
  community acts on "grow a root" without anyone — trusted or not —
  learning who hosts. Signing the posture with a member key, or adding
  an operator-labelled readout, would be a privacy regression and is
  explicitly rejected.
- **No notifications.** Every surface is pull-only (Board attention
  rail, resilience card). No push, no badge, no background alert —
  enforced, not optional.
- **Honest wording.** Following `resilience.ts`'s "never say more than
  the code delivers": the member prompt says "our community's node is
  running low on room" and "another root would help," never a fabricated
  number; the projection's assumption ("at current growth") is only ever
  something a host reasons about privately on their own box.

## 8. PR sequence

Each PR is independently shippable and independently verifiable.

| PR | Scope | New/changed |
|---|---|---|
| **1** | Forecast lib | `lib/capacityForecast.ts` (pure, shared) + tests. Runs on the node; validates the band/countdown math on injected series. No UI, no sensor, nothing federated. |
| **2** | Node self-sampling | v26 table + ring-buffer store, `startCapacitySampler` worker + `index.ts` wiring, `fs.statfs`/`os` reads, env config. Raw samples never leave the box. |
| **3** | Community attestation | The node computes the forecast from §2 and emits the coarse `CapacityPosture`: `systemSigner` §2-contract amendment + new signing payload, `CapacityPosture` kind, server emit on band change + `GET /capacity-posture` + mirror replication + trusted-gated client pull. This IS the community signal. |
| **4** | Trusted-member surfacing | `grow_a_root` attention item, `ResilienceCard` copy elevation gated on `nodesReachable < 2` + trust, `GrowRootSuggestCard` + dismiss flag, the response copy (A: host adds resources / B: grow a root), i18n en+es. |

Order rationale: PR 1 is decoupled and validates the model before any
sensor exists; PR 2 gives the node real data to forecast from, with
nothing leaving the box; PR 3 turns that into the single coarse,
node-signed community signal (the only federated data + the only
`systemSigner` change, so the highest-scrutiny work is well-contained);
PR 4 surfaces it to the trusted community. There is **no operator-readout
PR** — that path was cut so the app never distinguishes the host. The
optional local operator diagnostic (§5.1), if ruling R3 keeps it, is a
small addendum to PR 2, off by default.

## 9. Verification bar

- **Forecast:** unit tests over injected series — monotonic fill hits
  the right band and a plausible `daysToFull`; flat/decreasing yields
  "no exhaustion"; a single spike does not swing Theil–Sen; hysteresis
  needs K samples to change band; sub-N samples yields "gathering data."
- **Sampler:** a test double for `fs.statfs`/`os`/`statSync` (injected,
  as the worker skeleton allows) drives `record()`; assert the ring
  buffer never exceeds `keepN` and trims oldest-first; assert the table
  is absent from `insertCaps` `SURFACES` and has no pull leg.
- **No operator surface:** grep-confirm there is no member-facing route
  or UI exposing raw node metrics or distinguishing the host; confirm
  `/health` still returns bare `{status:"ok"}`. If the optional local
  diagnostic (R3) exists, it is off by default and never a
  member-visible surface.
- **Attestation:** a member-key-signed `CapacityPosture` is rejected on
  ingest (authority check — the signer must resolve to the node system
  key, not a member); an unverifiable row never advances the cursor; LWW
  keeps the newest `generatedAt`; a rotated system key still verifies via
  `signedAt`; grep-confirm no `peerPull` leg.
- **End-to-end drill:** on a two-node test setup, force the disk sample
  into the red band, confirm the origin emits a `red` /
  `growthRecommended` posture, a mirror replicates it, a trusted
  member's client raises the `grow_a_root` attention item (with both
  response framings), and a non-trusted member's client shows nothing.

## 10. Threat-model obligations (before PR 3 merges)

- Amend `systemSigner.ts` §2 contract 1 and
  [`auto-confirm-key.md`](./auto-confirm-key.md) §2/§4 to authorize the
  `CapacityPosture` payload as the second thing the system key may
  sign, with its canonical shape and the "coarse buckets only"
  constraint written down.
- Add a `threat-model.md` §7 entry: that the capacity flow adds **no
  operator-distinguished surface** (the host is never marked in the UI,
  and no route serves raw node metrics), that `CapacityPosture` is
  node-system-key-signed and carries no member-identifying or
  quantitative data, and that the signal is visible only to trusted
  members (not a reconnaissance surface for outsiders).
- Note in `storage-budget.md` and `community-resilience.md` that the
  forecast conditions their surfaces (the cross-link they already
  anticipate).

## 11. Rulings — **resolved 2026-07-12**

All five were decided by the operator; recorded here so the
implementation PRs inherit them without re-litigation.

1. **Alert thresholds — ACCEPTED.** Disk countdown amber/red at
   **120 / 45 days**. RAM/CPU pressure off sustained trailing headroom:
   **amber < 20% sustained free / red < 8%**, load judged relative to
   core count.
2. **Sampling cadence & retention — ACCEPTED.**
   `capacitySampleIntervalMs` = **15 min**, `capacitySampleKeepN` =
   **2000** (~3 weeks; a robust 30-sample trailing window with
   headroom).
3. **Local operator diagnostic — CUT.** No networked readout: the
   `OPERATOR_TOKEN` / `GET /capacity` path is **removed entirely**. A
   host who wants numbers uses ordinary server tooling (`df` / `free` /
   logs) on their own box. A node may *log* its own forecast locally,
   off by default — never a member-facing surface.
4. **Posture emission cadence — ACCEPTED.** Emit a new `CapacityPosture`
   **only on a band transition** (green↔amber↔red, hysteresis-guarded),
   never per-sample, keeping the federated write rate near zero.
5. **Recruitment-triggering dimensions — ACCEPTED.** The community
   posture's `pressure` is the **worst of {disk, RAM, CPU}**, so a RAM
   or CPU squeeze can recommend growth too; the `horizon` (countdown)
   bucket stays **disk-only**, the only honest clock.

---

*This note is the blueprint, and the §11 rulings are in. The first
move is PR 1 (the forecast lib) — pure, testable, and committing us to
nothing federated — which starts once this note has merged.*
