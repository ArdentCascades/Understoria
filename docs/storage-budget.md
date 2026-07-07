# Storage budget — when a phone can't hold the whole community

Status: **Phase 0 shipped** (persistent-storage protection + the
storage meter). **Phases 1–2 planned below in buildable detail, not
built. Phase 3 named and deferred.** Last reconciled against the
codebase 2026-07 (post mirror-failover, re-seed R1, recovery kit K1,
guardian shards K2). Companion docs: `docs/community-reseed.md`
(whose collective-restore property is what makes partial copies
safe), `docs/community-resilience.md` (the resilience card copy this
plan eventually conditions), `docs/identity-recovery.md`,
`docs/threat-model.md`.

## 0. The question, sized honestly

"Every member's device carries the complete community" is the
architecture's strongest claim. What happens when a device can't?

Size the problem first: the replicated set is small text records —
a signed post or exchange is 0.5–2 KB. A very active community's
100,000 records are on the order of 100–200 MB; a pilot community
is a few MB. Raw capacity on a modern phone is rarely the binding
constraint. What actually bites:

1. **Browser eviction.** IndexedDB is best-effort storage; a browser
   under disk pressure may silently delete the community's entire
   local copy unless the app holds the `persistent` storage grant.
   This is a TODAY problem on every full-ish phone, independent of
   community size — and it was unhandled until Phase 0.
2. **Cheap phones running near-full** — exactly the members the
   equity framing in `docs/identity-recovery.md` §0 names.
3. **The future:** if media attachments ever join the replicated
   set, one photo outweighs a thousand records. Standing design
   rule, stated now: **media never enters the replicated record
   set** without its own values conversation and its own budget
   design.

## 1. The principle: legible custody, not an invisible mesh

The DHT-shaped answer — silently hash-shard the archive across
everyone's phones — is rejected for the same reason
`community-resilience.md` rejects gossip discovery: it is illegible
infrastructure, and worse, *knowing whether every shard has enough
copies* requires a device census, a metadata surface this app
refuses to have (no device census exists and none should).

The principle instead: **phones carry the working set; the archive
role belongs to things that are cheap to make big** — nodes, and
devices whose owners *choose* it. Load distribution here is a set of
visible, consensual roles, not an emergent property.

## 2. What changed since this plan was first written

Four shipped features interact with windowing and are now folded
into the Phase 1 design:

- **Mirror failover uses per-node sync cursors**
  (`lib/nodeEndpoints.ts`: cursor keys are suffixed per node URL).
  The first version of this plan assumed "pulls are cursor-based, so
  a windowed device never backfills what it dropped." That is FALSE
  the moment the device fails over to a mirror, accepts a suggested
  mirror, or points at a replacement node after a re-seed — fresh
  node, fresh cursors, full re-pull, and every windowed-out record
  resurrects. **Consequence: windowing must be enforced at merge
  time** (a horizon guard in the pull merge paths), not by cursor
  position. Cursors remain the efficiency mechanism; the guard is
  the correctness mechanism.
- **Re-seed R1 shipped** (`lib/reseed.ts`): any device can restore a
  lost community onto a fresh node by walking its local tables. A
  windowed device uploads only what it holds — re-seed's
  *individual* guarantee ("any one member can restore everything")
  becomes a *collective* one the moment any window ships. The walker
  already unions copies from multiple devices, so partial devices
  reconstruct the whole IF copies collectively cover it — which is
  exactly the gap the Phase 2 seed-vault role exists to close, and
  why the two phases should land close together.
- **Recovery kit K1 / guardian shards K2 shipped**: both restore
  paths end by firing every federation pull on a fresh device, which
  therefore downloads the FULL history. Correct default (a fresh
  device starts unwindowed); the meter simply offers windowing again
  if the device is tight. The window preference is device-local and
  deliberately rides in neither the kit, the shards, nor the pairing
  snapshot.
- **The pairing snapshot** (`lib/communitySnapshot.ts`) copies the
  shared-state tables to a newly linked device, already row-capped.
  A windowed source produces a windowed snapshot; the new device
  backfills the rest from the node on first sync — no change needed,
  but the copy on the pairing screen shouldn't overclaim ("your
  device's copy", not "the complete history").

Also new since first writing: local-only tables have grown
(`guardianShards` — other members' encrypted key shards;
`redemptionReceipts` / `inviteRevocationRecords` — the membership
layer). The Phase 1 classification below accounts for every table
that exists at Dexie v30, and a drift-guard test keeps it that way.

## Phase 0 — protect and measure (SHIPPED)

- **`navigator.storage.persist()`** requested once at app start
  (`lib/storageBudget.ts`, called from AppContext). Granted silently
  for installed PWAs on most browsers; where a browser says no, the
  app keeps working as before — but the community's copy is no
  longer one disk-pressure event away from silent deletion where
  the grant exists. Zero UI unless asked.
- **The storage meter.** Settings → Data shows "Your copy of this
  community: N MB" (from `navigator.storage.estimate()`) and whether
  the copy is protected against eviction. A full device now fails
  legibly instead of opaquely. No wire bytes; the estimate never
  leaves the device.

## Phase 1 — local windowing with a pinned working set

Member-initiated from the storage meter ("Free up space on this
device…"); never automatic. The member picks a horizon (1 or 2
years); the app deletes, locally only, old *settled* records while
pinning everything that carries meaning forward.

### 1a. Table classification (complete, at Dexie v30)

Every table falls in exactly one class; a drift-guard test
enumerates `db.tables` against this classification so a future
table cannot ship unclassified (same negative-space pattern as the
purge/export guards).

**Never windowed — local/device tables (windowing scope excludes
them entirely):** `settings`, `secretKeys`, `outbox`, `drafts`,
`invites`, `pairingLog`, `achievements`, `messages`, `blocks`,
`previouslyBlocked`, `guardianShards`, `nodeConfig`.

**Pinned shared state (kept in full on every device, forever):**

- `members` — the community roster; identity resolution and
  signature verification need it whole. Tiny.
- `redemptionReceipts`, `inviteRevocationRecords` — the membership
  layer; load-bearing for read-auth and re-seed
  (`community-reseed.md` §1b). Tiny.
- `exchanges` and `vouches` — the balance ledger and the trust
  graph; windowing them would change what the numbers MEAN. Also
  among the smallest rows. (If a community's ledger alone outgrows
  phones, that community has reached Phase 3 territory.)
- `proposals`, `votes` — governance history; local-only records
  (no federation transport today) so a windowed copy could never be
  re-fetched, and they are small.

**Windowable (dropped locally when older than the horizon AND
settled AND not pinned by a rule below):**

- `posts` — settled means expired/cancelled/fulfilled, using the
  post's own lifecycle fields; a post referenced by any OPEN
  exchange stays.
- `events`, `eventRsvps`, `eventCancellations`, `eventShifts`,
  `shiftSignups`, `eventProjectLinks` — settled means the event
  ended before the horizon; children window with their event
  (subtree rule: never orphan kept parents).
- `projects`, `projectTasks`, `projectActivity`, `taskComments` —
  settled means the project is closed/completed and last touched
  before the horizon; children window with their project.
- `coorgInvitations`, `coorgInvitationResponses` — window with the
  event they belong to. `coorgInvitationRevocations` are PINNED
  (an authority-removal statement must outlive its event; tiny).

**Pin rules that override the horizon, applied per record:**

1. *Authored by me* — anything signed by the current member's key
   stays (their pen, their record; also what makes their device
   authoritative for re-signing nothing — history is immutable).
2. *Live referent* — a record referenced by anything live stays
   (post ← open exchange, event ← future occurrence, project ←
   open task).
3. *Tombstones* inside the LWW convergence horizon stay (a
   cancellation/revocation younger than the horizon must keep
   suppressing what it cancels).

### 1b. Mechanics

- **`lib/storageWindow.ts`**: `WINDOW_HORIZON_KEY` setting (absent =
  unwindowed), `previewWindow(horizonMs)` → per-category counts for
  the confirm screen, `applyWindow(horizonMs)` → batched deletes in
  referents-last order, resumable (it's all local deletes; a
  re-run is idempotent). Also `windowAdmits(kind, record)` — the
  shared merge-time guard.
- **Merge-time horizon guard**: every federation pull's merge path
  (all 16 in `lib/federationSync.ts`) consults `windowAdmits` before
  inserting a record of a windowable kind; a rejected record still
  advances the cursor (it is settled-old, not deferred — skipping
  without advancing would wedge the pull). This is what keeps a
  mirror failover or node move from resurrecting the archive.
- **Ongoing enforcement**: `applyWindow` re-runs on a low-frequency
  schedule (piggybacking the existing outbox-prune scheduler) so
  records that AGE past the horizon later also compact.
- **Undo**: "Carry the full history again" clears the setting and
  resets the device's pull cursors to zero — the node still has
  everything; the device simply re-downloads. Cheap, honest, and
  the exact mechanism mirror failover already exercises.

### 1c. Honest UI (the part that is not optional)

- Meter card gains the window control and states coverage plainly:
  "This device carries the last 2 years plus everything active and
  everything yours. The full history lives on your community's
  servers and seed vaults."
- **Resilience card**: its "every member's device is a complete
  seed" line becomes conditional the moment ANY window ships — the
  device-local copy states THIS device's coverage; no cross-device
  census is added to make the claim aggregate.
- **Re-seed section**: on a windowed device, the restore flow says
  it will upload "everything this device holds (last N years +
  pinned)" and that other members' devices and seed vaults fill the
  rest.
- Threat-model §7 entry for the coverage-claim downgrade.

### 1d. Tests

Classification drift guard (every `db.tables` name in exactly one
class); pin rules (mine / live-referent / tombstone survive; settled
old records go); subtree integrity (no orphaned children of kept
parents); merge-guard admits fresh + pinned kinds and rejects
settled-old on a ZERO cursor (the mirror-switch resurrection
scenario, explicitly); undo resets cursors; preview counts match
apply deletes.

## Phase 2 — the seed-vault role (distribution by consent)

Instead of secretly sharding across everyone, let members opt in to
being archives. **Build order note: land this in the same release
train as Phase 1** — windowing without visible vault coverage
degrades the community's collective re-seed guarantee silently.

- **The role**: Settings → Data, "Keep the complete archive on this
  device." A seed-vault device never windows (the two settings are
  mutually exclusive; enabling the vault on a windowed device runs
  Phase 1's undo — clear window + reset cursors + backfill), holds
  the persist() grant, and runs the normal pulls. It is just a
  device that promises not to forget.
- **`SeedVaultPledge`** — one new signed LWW record kind,
  end-to-end, so the community can SEE its archive coverage without
  a device census:
  `{memberKey, active, updatedAt, sig}` — canonical payload +
  verifier in `packages/shared` (same construction as RSVPs);
  server table + migration + POST/GET routes with LWW
  last-write-wins on `updatedAt`, insert-capped like every other
  kind; client outbox kind + `nodeSubmit` + federation pull +
  mirror-pull registration (`apps/server/src/mirrorPull.ts` kinds
  list) + re-seed walker kind (`RESEED_KINDS`) + pairing-snapshot
  table. The pledge names a MEMBER holding the role, never
  enumerates devices — deliberately member-granular.
- **Counted like nodes, not like members**: the resilience card's
  trunk row gains "2 servers · 3 seed vaults" from active pledges.
  Declining to pledge while still keeping everything is always fine
  — the pledge is for the community's visibility, not surveillance.
- **Re-seed interaction**: vault devices are the preferred restore
  sources (they hold everything by promise); the operator runbook's
  "recovering from total node loss" gains one line saying so.
- The add-a-node guide gains a sibling paragraph: a seed vault is
  the zero-ops version of running a node — no port forwarding, no
  operator powers, just storage and solidarity.
- Threat-model §7 entry: a new public, revocable, member-granular
  role claim; names the social-pressure consideration (nobody is
  nudged BY NAME to pledge — the resilience card nudges the
  community, not a person).

## Phase 3 — hash-slices (named, deferred)

If a community someday outgrows even consensual archives:
constrained devices each additionally hold a deterministic slice of
the windowed-out archive ("records whose id falls in band 3 of 8" —
shown in the UI, so custody stays legible), with at most a coarse,
anonymous per-band coverage hint. Deferred because (a) it re-opens
the census tension the pledge design avoids, (b) the coordination
cost is real, and (c) a text-record community that outgrows
old-laptop archives has broken other assumptions first. (Should it
ever be built: K2 shipped a first-party GF(256) implementation in
`lib/sss.ts` whose field arithmetic a parity/erasure scheme could
reuse — noted so the door stays visibly open, not as a plan.)

## Out of scope, named

- **Automatic windowing.** v1 windowing is member-initiated from the
  meter. The app may *suggest* it when the estimate nears quota, but
  never silently drops community data.
- **Media in the replicated set** — see §0.
- **Server-side per-device sync filtering.** The node serving
  different members different subsets is a power the operator
  shouldn't have; windowing is a client-side choice against the same
  full feed everyone gets.

## Threat-model / docs obligations

Phase 0: none beyond a §6 note (persist() is a browser grant, not a
new surface; the estimate never leaves the device). Phase 1 owes the
resilience-card + re-seed copy changes and a §7 entry for the
coverage-claim downgrade. Phase 2 owes a §7 entry for the pledge
record (public, revocable, member-granular role claim) and FAQ copy.
Phase 3 owes its whole values conversation.

## Sizing

Phase 0: shipped. Phase 1: a medium PR — `storageWindow.ts`
(classification + preview + apply + merge guard) with the drift
guard and pin-rule tests carrying most of the weight; UI is one
Settings flow plus two copy changes. Phase 2: small-to-medium — one
LWW record kind end-to-end (the codebase has shipped this exact
shape several times: RSVPs, shift signups, project states) + card
count + guide copy. Ship 1 and 2 together or back-to-back.
