# Storage budget — when a phone can't hold the whole community

Status: **Phase 0 shipped** (persistent-storage protection + the
storage meter). **Phases 1–2 designed below, not built. Phase 3
named and deferred.** Companion docs: `docs/community-reseed.md`
(whose collective-restore property is what makes partial copies
safe), `docs/community-resilience.md` (the resilience card copy this
plan eventually conditions), `docs/threat-model.md`.

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

## Phase 0 — protect and measure (shipped)

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

For a constrained device (member-initiated from the storage meter —
"free up space on this device"; never automatic in v1):

- **Always kept (pinned), regardless of window:**
  - everything this member authored (their pen, their record);
  - everything *live*: open posts, active projects + their tasks,
    upcoming events + shifts + signups, unresolved proposals;
  - the whole membership layer: member rows, redemption receipts,
    invite revocations (tiny, and load-bearing for read-auth and
    re-seed — `community-reseed.md` §1b);
  - exchanges and vouches in full — they are the balance ledger and
    the trust graph; windowing them would change what numbers mean.
    (They are also among the smallest rows. If a community's ledger
    alone outgrows phones, that community has reached Phase 3
    territory.)
- **Windowed:** everything else older than the chosen horizon
  (default 2 years): expired/cancelled posts, past events and their
  rosters, closed projects, old task comments, LWW tombstones past
  the convergence horizon. Compaction is a local delete — the
  records remain on every node and every unwindowed device, and
  pulls are already cursor-based, so a windowed device simply never
  backfills what it dropped.
- **Honest UI:** the meter card states the device's coverage
  plainly ("this device carries the last 2 years plus everything
  active; the full history lives on your community's servers and
  seed vaults"), and the resilience card's replica line becomes
  conditional the moment ANY window ships — same
  never-say-more-than-the-code-delivers rule as always.
- **Re-seed interaction, stated:** windowing converts re-seed's
  *individual* guarantee ("any one member can restore everything")
  into a *collective* one — the walker already unions whatever each
  device holds, so multiple partial devices reconstruct the whole
  IF the community's copies collectively cover it. Which is exactly
  why Phase 2 exists.

## Phase 2 — the seed-vault role (distribution by consent)

Instead of secretly sharding across everyone, let members opt in to
being archives:

- Profile → "Keep the complete archive on this device" — a visible,
  revocable choice, ideal for the old tablet in a drawer. A
  seed-vault device never windows, holds the persist() grant, and
  runs the normal pulls (it is just a device that promises not to
  forget).
- **Counted like nodes, not like members:** the resilience card's
  trunk row gains a quiet seed-vault count ("2 servers · 3 seed
  vaults") — self-declared via a small signed `SeedVaultPledge`
  record (memberKey, active flag, updatedAt, signed LWW like an
  RSVP) so the count is real without a device census: the pledge
  names a MEMBER holding the role, never enumerates devices.
  Declining to pledge while still keeping everything is always
  fine — the pledge is for the community's visibility, not
  surveillance.
- The add-a-node guide gains a sibling paragraph: a seed vault is
  the zero-ops version of running a node — no port forwarding, no
  operator powers, just storage and solidarity.

## Phase 3 — hash-slices (named, deferred)

If a community someday outgrows even consensual archives:
constrained devices each additionally hold a deterministic slice of
the windowed-out archive ("records whose id falls in band 3 of 8" —
shown in the UI, so custody stays legible), with at most a coarse,
anonymous per-band coverage hint. Deferred because (a) it re-opens
the census tension the pledge design avoids, (b) the coordination
cost is real, and (c) a text-record community that outgrows
old-laptop archives has broken other assumptions first. The door is
open; the reasons to wait are on record.

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
resilience-card copy change and a §7 entry for the coverage-claim
downgrade. Phase 2 owes a §7 entry for the pledge record (a new,
deliberately member-granular — not device-granular — public role
claim) and FAQ copy. Phase 3 owes its whole values conversation.

## Sizing

Phase 0: shipped in the same PR as this doc (small). Phase 1: a
medium PR (compaction walker + pinned-set queries + meter UI +
resilience-card copy). Phase 2: small-to-medium (one LWW record kind
end-to-end + card count + guide copy).
