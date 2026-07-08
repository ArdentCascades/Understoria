# Community re-seed — restore a community onto a fresh node from any member's device

Status: **Phases R0 and R1 shipped.** Devices persist the signed
membership artifacts (§1b), and Settings carries the member-facing
"Restore this community onto a node" flow backed by the walker in
`apps/web/src/lib/reseed.ts` and the server recovery envs
(`RESEED_GRACE_UNTIL`, `TRUSTED_SYSTEM_KEYS`). Verified end-to-end
by the §4 drill: node and database destroyed, fresh node stood up,
full history restored from one member's device through the UI —
including an auto-confirmed exchange and the membership receipt —
idempotent on a second run. Operator runbook: operator-guide §6
("Recovering from total node loss"). Companion docs: `docs/community-resilience.md` (mirror nodes +
failover — the FIRST line of defense this feature backstops),
`docs/add-a-node.md` (the member-facing node guide),
`docs/operator-powers.md`, `docs/invite-redemption.md` (the receipt
chain membership derives from).

## 0. The gap this closes

The resilience story so far: every member's device carries the
complete community dataset, and mirror nodes (Phase B) mean losing
any ONE server loses nothing. The remaining scenario is losing
**every** server — a community that ran one node and lost it, or a
mirror set seized together. Today the honest answer is only partial:

- Members' devices hold everything, so nothing is *destroyed*.
- But the outbox re-pushes only records **this member authored**,
  and delivered outbox rows are **pruned on a schedule**
  (`lib/outbox.ts`) — so even self-authored history mostly cannot be
  re-uploaded.
- `docs/add-a-node.md` says a replacement node "re-fills from the
  survivor" — true with a surviving mirror, and silent about the
  every-node-lost case because there is no good answer yet.

Re-seed makes the full claim true: **any member can point their
device at a brand-new, empty node and upload the community's entire
replicated history** — posts, exchanges, events, rosters, projects,
receipts — signed exactly as it was, verified by the node exactly as
if freshly submitted. Several members re-seeding concurrently is
safe and even desirable (union of their copies; every route is
idempotent by id / natural key / first-writer-wins).

This is deliberately a **member** capability, not an operator one:
the operator of the lost node may be the person who is gone.

## 1. What a device holds vs. what a node needs

Audit of the Dexie schema (v28 at audit time; the re-seed kinds
list in `lib/reseed.ts` has grown with the schema since — its drift
test enforces coverage) against the node's durable kinds.
Three classes:

### 1a. Stored signed — re-POST verbatim

These rows are persisted client-side WITH their signatures, so the
walker can POST them unchanged and the node's routes re-verify:

| Dexie table | POST route | notes |
|---|---|---|
| `posts` | `/posts` | strip local lifecycle fields (`claimedBy`, `status`, `confirmedBy`, …) to the signed wire shape, exactly as `enqueuePostOutbox` does |
| `exchanges` (member-signed) | `/exchanges` | both member signatures ride the row |
| `vouches` | `/vouches` | |
| `events` | `/events` | |
| `eventCancellations` | `/event-cancellations` | |
| `taskComments` | `/task-comments` | tombstones included (`deletedAt` rides the signed row) |
| co-organizer invitation trio | `/coorg-invitations`, `…-responses`, `…-revocations` | |
| `projects` | `/project-states` | local rows ARE full signed `ProjectState` records (`publishProjectState` persists the stamped record via `db.projects.put(record)`) |
| `projectTasks` | `/task-states` | same |
| `eventRsvps`, `eventShifts`, `shiftSignups` | `/event-rsvps`, `/event-shifts`, `/shift-signups` | signed LWW rows, tombstones included |

Rows that were only ever *pulled* (authored by other members) are
just as re-POSTable as own-authored rows — the routes authenticate
the **signature**, not the submitter. That is the whole trick.

### 1b. NOT persisted signed today — Phase R0 fixes this

Two record kinds are verified on arrival and then **materialized
into unsigned bookkeeping rows**, dropping the signatures:

- **Redemption receipts** → `invites` + `members` rows
  (`pullFederatedRedemptions`). The receipt is the artifact the
  membership closure derives from (`docs/member-authenticated-reads.md`)
  — a re-seeded node with no receipts has no members beyond its
  founder keys.
- **Invite revocations** → `invites.revokedAt` fields.

**Phase R0 (ship first, independently):** persist the verified
artifacts. New Dexie tables:

```
redemptionReceipts: "invite.token"   // full RedemptionReceipt JSON
inviteRevocationRecords: "token"     // full InviteRevocation JSON
```

Write-through at every point a verified artifact passes:
- own redemption (invite-accept flow) and own revocation,
- `pullFederatedRedemptions` / `pullFederatedInviteRevocations`,
- the community-snapshot device transfer (add both tables to
  `communitySnapshot.ts` so a linked device carries them).

Backfill: on upgrade, existing devices hold no receipts — the next
periodic pull against any LIVE node backfills them (the pulls
already run from cursor 0 for a new table's cursor key). This is why
R0 must ship **well before it is needed**: receipts can only be
captured while at least one node still serves them. Say this loudly
in the release notes.

Excluded deliberately: `claims` are not persisted as records
client-side (only `posts.claimedBy`), are unsigned, and are
short-lived coordination state. Re-seed skips them; an open claim
re-converges the next time either party acts. Named as a known,
acceptable loss.

### 1c. Cannot re-seed — named honestly

- **Auto-confirmed exchanges.** `POST /exchanges` categorically
  refuses `autoConfirmed` rows (they may only be minted via
  `/auto-confirm` — `docs/auto-confirm-key.md` §4), and the fresh
  node has no way to verify the LOST node's system signature unless
  told about it. Resolution (server, small): a new env
  `TRUSTED_SYSTEM_KEYS` — JSON array
  `[{"nodeId":"node_old","current":"<pubkey>","history":[…]}]` — an
  operator-declared trust statement ("records auto-confirmed by
  node_old verify against this key"). The exchanges route accepts an
  `autoConfirmed` row **iff** `verifyExchangeLabel` resolves it
  against this static resolver — the same shared verifier peer pull
  and mirror pull already use, fail-closed when unset. The old
  node's system PUBKEY was not surfaced anywhere client-side —
  so Phase R0 also captures the last-seen `/config.systemKey` (with
  nodeId) into settings (`communityNodeLastSeenSystemKey`), and the
  R1 re-seed UI will show it for the operator to copy. Without it, auto-confirmed exchanges are skipped
  and counted in the summary ("N exchanges could not be restored —
  see docs"), never silently dropped.
- **Awaiting-transitions.** POST-only by design; the auto-confirm
  clock anchors to one node's arrival stamp. After a re-seed,
  auto-confirm windows simply restart from re-delivery of new
  transitions. Zero data loss (the exchange history is what matters).
- **Device-link / tap-to-link mailboxes.** Ephemeral, self-limiting.
- **Proposals, votes, messages.** Never on any node (local-first
  governance; E2E messages are device-to-device ciphertext). Out of
  scope by architecture, not by omission.

## 2. Phase R1 — the walker (web)

`lib/reseed.ts`, structured like the mirror worker's kind table:

- **Kind order = referents before dependents**, same as
  `MIRROR_KINDS`: events → cancellations → project-states →
  task-states → event-shifts → event-rsvps → shift-signups → posts →
  exchanges → vouches → task-comments → coorg trio → **redemptions →
  invite-revocations** (receipts early is also fine; they have no
  referents — order them FIRST so membership lands before anything
  else, letting the operator flip `READ_AUTH=on` sooner).
- Iterates each Dexie table in stable batches, POSTing via the
  existing `nodeSubmit` submitters (which now carry failover), with
  a persisted cursor per kind (`settings` key `reseedCursor::<kind>`)
  so an interrupted re-seed **resumes**, never restarts.
- **Outcome handling mirrors the mirror worker's rules:** 2xx / 200
  `stored:false` advance; 400/422 skip-and-count (a row THIS device
  holds that the node refuses — surfaced in the summary); 409 on
  referent kinds halts-and-retries next run; poison 409s
  (redemption token conflicts) skip.
- **Pacing:** the node's rate limit and insert caps apply to the
  walker like any client. Default pace ~3 records/second with the
  page open (a pilot community's full dataset is thousands of rows —
  minutes, not hours). The operator runbook suggests a temporarily
  raised `RATE_LIMIT_MAX` for big communities. The walker runs in
  the foreground with a progress bar; PWA background limits make
  anything else dishonest.
- **UI:** Profile → Community node → "Restore this community onto a
  node." Consent copy states exactly what will be uploaded (the
  community's shared history THIS device holds — and that this is
  the same data any node of this community holds), confirms the
  target URL, and shows per-kind progress + a final summary
  (restored / already-present / skipped, with reasons).
- Multiple members re-seeding concurrently: safe by idempotency;
  the summary's "already present" count is the visible evidence.

## 3. Phase R1 — the receiving node (server)

Small, mostly-existing surface:

- Writes are already open under `READ_AUTH=on` (the guard is
  GET-only; signatures authenticate writes) — a re-seeding member
  needs no special credential. The fresh node needs only the same
  `NODE_FOUNDER_KEYS` as the lost one, so the re-seeded receipts
  re-derive the same membership closure.
- **`RESEED_GRACE_UNTIL` (env, RFC3339 or ms epoch):** until this
  moment, `POST /redemptions` skips the delivery-grace bound
  (`REDEMPTION_DELIVERY_GRACE_MS`, 7 days) for well-signed receipts —
  the same relaxation the mirror worker gets via its internal token,
  but time-boxed and operator-declared, because historical receipts
  necessarily arrive years "late." Threat honestly stated: during
  the window, a stolen EXPIRED-but-unredeemed invite could be played
  back-dated. Mitigations: the window is short (a weekend), the
  operator announces it, invite revocations re-seed too, and the
  play is signed + attributable as always. The server logs loudly
  while the window is open and refuses a window longer than 30 days.
  Re-seeded receipts preserve their wire `receivedAt` when plausible
  (same rule as the mirror path) so the feed cursor keeps one
  identity.
- **`TRUSTED_SYSTEM_KEYS`** (see §1c) for auto-confirmed exchanges.
- No new routes. No new record kinds. The "re-seed endpoint" is the
  ordinary write surface — that is the design's main virtue.

## 4. Order of shipping

1. **R0 — persist the artifacts** (Dexie tables + write-throughs +
   snapshot transfer + last-seen system-key capture). **Shipped** —
   `redemptionReceipts` / `inviteRevocationRecords` tables (schema
   v29) written through from own redeem/revoke and both federated
   pulls, carried by the device-pairing snapshot, cleared by soft
   purge, excluded from the shareable export; the primary's
   `/config.systemKey` is captured to settings on each Board-visit
   config fetch.
2. **R1-server** — `RESEED_GRACE_UNTIL`, `TRUSTED_SYSTEM_KEYS`,
   operator runbook ("Recovering from total node loss": stand up
   node, set founder keys + envs, hand members the URL, watch the
   counts, flip `READ_AUTH=on`, unset the envs).
3. **R1-web** — the walker + UI + i18n (en/es) + tests.
4. **The drill E2E**: seed a two-node community, populate every
   kind, destroy BOTH nodes and their databases, stand up a fresh
   third node, re-seed from one member device, assert a second
   member's fresh pull sees the full history and that membership
   (READ_AUTH) works from re-seeded receipts alone.

## 5. Threat-model obligations (owed at implementation time)

§7 entry covering: the `RESEED_GRACE_UNTIL` window trade-off;
`TRUSTED_SYSTEM_KEYS` as an operator trust declaration (a wrong key
would launder forged auto-confirms — copy it from the captured
`/config` record, never from memory); re-seed as a write-amplifier
(bounded by existing caps); and the R0 note that receipts now
persist on every device (no new exposure: devices already held the
derived member list; the receipt adds only the signatures binding
it).

## 6. Sizing

R0 ≈ a small PR (two tables, four write-throughs, snapshot lines,
tests). R1-server ≈ small (two envs, one route touch, runbook).
R1-web ≈ a medium PR (walker + UI + progress + tests + E2E drill).
