# Understoria — "Ways to plug in" (design note)

> **Status:** **adopted and shipped** — PR B (the `lib/plugIn.ts`
> matcher) and PR C (the `/plug-in` page + Board link) are live; PR D
> stays LOUDLY SKIPPED per §9. This is the discovery-surface design
> that shift-signups §14 ruling 3 filed ("skill-matched shift
> discovery — its own design note"). Read alongside
> `docs/shift-signups.md` §10.4 (the deferral and its stated reason:
> shipping discovery inside a scheduling feature would smuggle in a
> recommendation engine), `docs/task-ordering-and-dependencies.md`
> (whose nudge-cadence discipline this note borrows), and the
> design-principles ledger
> (`apps/web/src/content/design-principles.ts`) — `asking-never-gated`
> and `no-leaderboards` do the heavy lifting here.

---

## §1 Status

Adopted; both implementation phases shipped (§9 PR B + PR C). The
two §8 rulings were taken at their recommended defaults: the entry
point is a Board-level link (not a tab), and the surface shipped
with existing offer categories + profile skills as the lens, with an
"add skills to see more matches" line on the page itself.

## §2 Why now

A member with two free hours and a skill has to hunt across four
surfaces to find where those hours would help: the Needs tab, the
Projects tab's open tasks, upcoming events' shifts, and (if the
event↔need bridge ships) need gatherings. Each surface filters by
its own axis; none answers the member's actual question, which is
**"given what I can do, what's open right now?"**

The raw material already exists, entirely locally:

- the member's own OFFER posts (categories + free text) and their
  profile `skills` list;
- open NEED posts (category, urgency, zone);
- open project tasks (`requiredSkills`, category) — with the
  soft-block discipline: tasks whose dependencies aren't met are
  DE-emphasized, matching the task-ordering design;
- upcoming shifts with spots open (label free text + event
  category).

No new data is collected, nothing federates, and the computation is
a local query join — this is a READ surface over rows the device
already holds.

## §3 The shape: a browsable shelf, never a queue

One page (entry from the Board: "Ways to plug in"), rendering
sections in a fixed, non-scored order:

1. **Open shifts that match** — spots open, category or label
   overlapping the member's offer categories / skills.
2. **Open needs that match** — same matching, urgency-sorted within.
3. **Open tasks that match** — `requiredSkills` overlap;
   dependency-blocked tasks render at the bottom with the standard
   "Follows:" framing, never hidden.
4. **Everything else that's open** — the unmatched remainder,
   collapsed by default, because matching is a LENS, not a gate.

Matching is deliberately dumb: case-folded token overlap between the
member's offer categories + skills and the item's category +
skills/label. No weights, no scores, no ranking beyond the existing
surfaces' own sort orders (urgency, start time). Dumb matching is a
values choice, not laziness — see §5.

## §4 What the surface must never do

Each entry names its principle; superseding one means naming why the
reasoning no longer holds.

- **Never a queue assigned to you.** `asking-never-gated` has a
  receiving-side twin this note names explicitly: *browsing stays
  browsing*. No item is "yours to clear," no count badges the tab,
  nothing recurs on the attention rail because a match exists.
  Matches are an offer TO the member, never an obligation ON them.
- **Never a people-ranking.** `no-leaderboards`: the surface matches
  a member to WORK, never members to each other. There is no "best
  helper for this," no per-member match score, no visibility of who
  else saw the same item.
- **Never a nudge.** `no-notifications`: pull-only, no push, no
  rail items, no "3 new matches!" anywhere. The member walks up to
  the shelf; the shelf never walks up to the member.
- **Never surveillance-shaped.** All computation is local reads of
  local rows. Nothing about what the member browsed, matched, or
  ignored is stored, logged, federated, or exported. There is no
  "member X viewed but didn't claim" data — that row type is
  permanently rejected here the way no-show flags were in
  `community-events.md` §11.6.
- **Never a gate on the unmatched.** The §3.4 remainder section is
  load-bearing: a member may plug in anywhere, matched or not.
  Matching de-clutters; it must not curate reality.

## §5 Why dumb matching

A smarter matcher (embeddings, history-based affinity, "members like
you helped with…") would need exactly the data this app refuses to
aggregate: cross-member behavioral history. Token overlap needs
nothing but the rows already on screen elsewhere. The quiet-pressure
risk shift-signups §14.3 flagged — recommendation surfaces
manufacturing obligation — scales with how *authoritative* the
recommendation feels; a visibly-dumb lens ("this matched your
'carpentry' tag") keeps the authority with the member. If pilot
signal shows the dumb matcher missing too much, the upgrade path is
better *tags* (member-edited), never behavioral inference.

## §6 Composition

- **Shifts** (`shift-signups.md`): the §10.4 deferral lands here;
  the shift section deep-links to the event page's existing signup
  flow — this note adds zero signup machinery.
- **Tasks** (`task-ordering-and-dependencies.md`): the soft-block
  rendering discipline is reused verbatim ("Follows:" framing,
  de-emphasis not hiding).
- **Need gatherings** (`event-need-bridge.md`, proposed): if that
  design ships, its gatherings appear via their events' shifts;
  nothing here needs to change.

## §7 Threat-model delta

None — no new wire surface, no new stored rows, no new logs. The
implementation PR inherits the usual one-paragraph documentation
obligation (append to the relevant threat-model §7 entries that the
discovery surface reads existing local rows only), per the
`event-need-bridge.md` §12 pattern.

## §8 Open questions — Operator ruling needed

1. **Where does the entry point live?** A Board-level link
   ("Ways to plug in") vs. a fifth Board tab. **Recommended
   default: a link, not a tab** — tabs are permanent geography and
   the pilot should show the surface earns one before it gets one.
2. **Do profile `skills` need editing affordances first?** Matching
   quality depends on members having tags at all. **Recommended
   default: ship with what exists** (offer categories alone match
   usefully) and let the surface itself motivate members to fill in
   skills — a visible "add skills to see more matches" line beats a
   pre-emptive profile campaign.

## §9 Implementation phases

- **PR B — matcher:** pure `lib/plugIn.ts` (token-overlap matcher +
  section builder over posts/tasks/shifts), fully unit-tested, no UI.
- **PR C — surface:** the page + Board entry link, the four §3
  sections with the §4 constraints as rendered copy where relevant,
  i18n en/es, accessibility DOM order.
- **PR D — server: LOUDLY SKIPPED.** Local reads only (§7).
