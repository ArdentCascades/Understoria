# Understoria — Event ↔ Need bridge (design note)

> **Status:** **proposed** — design only; no implementation PRs
> yet. This note is the predicate for the implementation work, the
> same way `docs/community-events.md` (PR #186) and
> `docs/blocking.md` (PR #193) were predicates for theirs. Read
> alongside `docs/community-events.md` §10.1 (project work days —
> the local-only event⇄project link this design composes with and
> takes its architecture from), `docs/threat-model.md` §7 (the
> wire-surface discipline this note applies), and
> `apps/web/src/types/index.ts` (`EventProjectLinkRow`,
> `EventRsvpRow`, `BlockRow` — the house pattern for local-only
> rows). No threat-model §7 entry ships with this note because the
> recommended shape adds **zero new wire bytes** — see §7 and §12
> for the explicit statement and the obligation the implementation
> PR inherits.

---

## §1 Status

Proposed. This doc answers the design questions (directionality,
consent, federation posture, lifecycle) and sketches the
implementation phases in §13. Nothing in this note is code yet.
Three genuinely open decisions are marked "Operator ruling needed"
in §14, each with a recommended default.

## §2 Why now

A `Post{type:"NEED"}` has exactly one `claimedBy` slot. The claim
flow is built for one-to-one exchange: one member asks, one member
answers, one signed `Exchange` closes the loop. That shape covers
most of the Board, but it has a known gap the calendar work made
visible: **a need that takes many hands has no shape.** Moving
apartments, clearing a flooded basement, a build day for an
accessibility ramp — these are needs where the right answer is not
"one member claims it" but "eight people show up on Saturday."

Since community events shipped (PRs #186–#192), members have the
other half of the primitive: a federated, signed `Event` that puts
a gathering on the calendar. And since project work days shipped
(PR #251, design in `community-events.md` §10.1), the codebase has
a settled pattern for connecting an event to a local artifact
without touching the wire. What's missing is the bridge between
the Board and the calendar for *needs*:

- A member whose need takes many hands has to create an event by
  hand, re-type the context, and hope readers connect it to the
  need. The connection lives in free text or nowhere.
- A member reading a need has no way to see that a gathering is
  already planned for it — so help either double-books or, worse,
  doesn't come because "someone's probably handling it."
- A member at an event page can't see the ask it exists to answer.

The narrowest answer that satisfies the felt need is a local-only
link row plus two calm rendering surfaces plus one prefill entry
point — the exact shape project work days already proved. Anything
broader — a federated pointer, multi-claim needs, volunteer
rosters on need cards — is named in §11 with the reason it's out
of scope.

## §3 The starting shape: directionality and who may link

Two design questions get settled here because every later section
depends on them.

### §3.1 Directionality: need → event

The link row itself is a symmetric join (`eventId` + `needId` —
see §4), and both rendering directions exist (the need card shows
"a gathering is planned"; the event page shows the need it
serves). But the *creation* semantics are directional, and the
recommended starting shape is **need → event**: "gather hands for
this need" is the primary gesture, initiated from the need, by the
need's author.

Why this direction first:

- It matches the felt need in §2. The person with the many-hands
  need is the person who knows it takes many hands. The gesture
  starts where they already are: their own need's page.
- It matches the `?projectId=` precedent exactly. Project work
  days flow from the project page to `EventNew` via a deep link;
  need gatherings flow from the need page to `EventNew` via
  `?needId=`. One pattern, two contexts, no new UI grammar.
- It makes the consent question (§3.2) answer itself. A link
  initiated from the need, by the need's author, cannot put
  anyone's ask on a stage they didn't choose.

The reverse gesture — an organizer creating an event and marking
which need(s) it addresses — is supported in phase 1 **only for
the organizer's own needs**: `EventNew` gains an optional "this
gathering addresses one of your open needs" picker, listing only
open `NEED` posts authored by the current member. Marking someone
*else's* need from the event side is the two-party consent problem
§3.2 rules out for phase 1 (and §14 tracks as the phase-2
question).

### §3.2 Who may link: the need's author, and only them

**The rule: a link may only be created by the need's author.** Not
the event organizer (unless they are the author), not "any
member," not a community role. In phase 1 the link is created only
inside the event-creation flow (`?needId=` deep link or the
own-needs picker), which makes the invariant even tighter: the
link creator is simultaneously the need's author and the event's
organizer. One person, one deliberate act, both hats.

Why this is the consent-preserving shape, said plainly: **a need
is a vulnerable ask.** The member who posted "I need help clearing
out my mother's apartment" chose the Board's exposure model —
their words, their category, their coarse zone, read by members
who scroll past it. A gathering pointed at that need changes the
exposure: it attaches a *time*, an implied *place*, and a social
gravity ("people are coming for this") that the author never
signed up for. If any member — or even any well-meaning organizer
— could point an event at someone else's need:

- The author's ask becomes an occasion. "Six people are coming
  Saturday to help with your thing" may be exactly right, or it
  may be mortifying, unsafe (the need may involve their home), or
  simply more than they wanted. `solidarity-not-shame`: the
  system must never manufacture social pressure around a member's
  moment of asking.
- The author loses control of the framing. The event's title and
  description are the organizer's free text; a linked event
  *speaks for* the need. Only the author gets to decide whether
  something speaks for their ask. `privacy-precondition` cuts the
  same way: the author chose the Board's exposure; nobody else
  may widen it on their behalf.
- Declining becomes a social act. If someone else's event points
  at your need, un-pointing it means telling them no. The block
  design (`docs/blocking.md` §1) established the house rule:
  relief from unwanted attention must never require confronting
  the person giving it. The only way to honor that here is for
  the unwanted link to be impossible to create.

What the author-only rule costs, named honestly: a member whose
need takes many hands but who has no capacity to *organize* the
gathering cannot deputize someone else through the system in
phase 1. The phase-1 path for that case is the convention
baseline, same as pre-§10.1 work days: a helper creates a plain
event, mentions the need in free text, and coordinates with the
author by DM. The author can still create the link themselves
later only by cancel-and-recreate in phase 1 (no link-existing-
event affordance — see §14 ruling 1 for the phase-2 shape). This
is a real gap and §14 tracks it; the consent floor is worth it.

Authority is re-validated in the data layer, not just the UI —
same discipline as `scheduleProjectWorkDay`
(`apps/web/src/db/eventProjectLinks.ts`): a hand-crafted
`/events/new?needId=…` URL from a member who is not the need's
author yields a plain event and **zero link rows**. Event
creation itself stays ungated; anyone may still convene and
mention a need in free text.

## §4 Data model — `EventNeedLinkRow`

One record type. It is **local to the node where the link was
created** and **never enters the outbox**. Same posture as
`EventRsvpRow`, `BlockRow`, and `EventProjectLinkRow`; the
contract, stated as negative space first because the absences are
the design:

- **`"event_need_link"` MUST NOT appear in `OutboxRow.kind`.**
  The union in `apps/web/src/db/database.ts` rejects it at the
  type level, asserted with `@ts-expect-error` in the tests.
- **No enqueue helper.** `lib/outbox.ts` exposes no
  `enqueueEventNeedLink`. The absence is load-bearing.
- **No route.** There is no `POST /event-need-links`, no
  `GET /event-need-links?since=` cursor on any server.
- **No pull helper.** `lib/federationSync.ts` exposes no
  `pullFederatedEventNeedLinks`.
- **App-layer type only.** The interface lives in
  `apps/web/src/types/index.ts`, never `packages/shared` — the
  federation layer has no knowledge of the shape.
- **No `signature`, no `nodeId`.** Both absences are structural:
  an unsigned row without a node id cannot masquerade as a
  federated record even if a future refactor mishandles it.
- Negative tests lock all of the above in
  (`eventNeedLinks.test.ts`), mirroring `eventProjectLinks.test.ts`.

```ts
/**
 * Local-only event⇄need link — see `docs/event-need-bridge.md`.
 * Records that a community event gathers hands FOR a board need,
 * on this node only. Same posture as EventProjectLinkRow: never
 * signed, never enqueued, never pulled, never exported. The
 * linking node renders the bridge surfaces; peer nodes see a
 * plain event.
 */
export interface EventNeedLinkRow {
  /** UUID for this link row. */
  id: string;
  /** References `Event.id` — the federated event that gathers
   *  hands. */
  eventId: string;
  /** References `Post.id` where `Post.type === "NEED"`. The post
   *  is a federated record, but this pointer never crosses the
   *  wire — see the design note §7 for why a federated pointer
   *  was rejected despite needs federating. */
  needId: string;
  /** Base64-encoded Ed25519 public key of the need's author, who
   *  is the only member allowed to create the link. Re-validated
   *  against `Post.postedBy` at write time. */
  linkedBy: string;
  /** Epoch milliseconds, UTC. */
  createdAt: number;
}
```

Dexie table `eventNeedLinks` at the next free schema version
(v28 at time of writing), indexed by `eventId` and `needId`.

Cardinality: the schema is naturally N:M (a need may have several
gatherings over time — a first work day that didn't finish the
job, a second one that did; there are no recurring events, so a
"weekly help day" is several events). Phase-1 UI creates at most
**one need per event** (the picker and the deep link are
single-select); many events per need accumulate normally. Dedupe
on the (`eventId`, `needId`) pair, same idempotency guard as
`scheduleProjectWorkDay`.

Soft-purge clears the table (it points at the member's own asks —
identifying preference-shaped data, same category as blocks and
RSVPs). Data export excludes it, matching `BlockRow`.

## §5 Lifecycle

The link row itself has no state machine; **every surface derives
from the live state of the two records it joins.** No cascades,
no stored status, nothing to migrate when either side changes.

- **Need fulfilled** (`status: "completed"`). The need leaves the
  open Board as it does today; the need card's "a gathering is
  planned" line goes with it. The event page's bridge line stays
  but re-renders in the past-tense, settled register: "This
  gathering was for a need that has been met." Nothing to clean
  up; the joy is the point, not a data problem.
- **Need withdrawn** (`status: "cancelled"`) or **expired**. The
  event page's bridge line silently drops — rendering an event
  as "for" a withdrawn ask would keep the author's ask on stage
  after they took it down, which is exactly what author control
  exists to prevent. The event itself is untouched: it is a
  signed federated record and stays on every calendar; the
  organizer decides whether to cancel it (they are the author in
  phase 1, so this is one person's easy call).
- **Event cancelled.** The need card's gathering line silently
  drops, mirroring the cancelled-work-day behavior in
  `community-events.md` §10.1: cancellation is a federated act
  handled by the events subsystem; the bridge deliberately does
  not couple to `cancelEvent` (no activity log, no link mutation)
  so the federated path never learns links exist.
- **Event completes** (`endsAt`, or `startsAt` for single-point
  events, passes). This is the one place the bridge *suggests* —
  and only suggests, and only to the author. On the author's own
  view of their still-open need, a quiet inline line appears:
  "The gathering for this has passed. If this need is met, you
  can mark it fulfilled." Rendered to the author only, inline on
  the need page only, no attention-rail item, no repetition
  mechanics, dismissible for good. **Never auto-resolution**: the
  system cannot know whether eight people finished the job, and
  `community-authority` + `solidarity-not-shame` both say the
  author's word — not the calendar — is what closes an ask. A
  gathering that didn't finish the work is a normal outcome, not
  a failure state; the need simply stays open and can be linked
  from the next gathering.
- **Unlink.** Recommended: an author-only "remove this link"
  affordance on the need page (Operator ruling 3, §14). This
  deliberately diverges from the work-day precedent (§10.1 ships
  no unlink) for a stated reason: the work-day link is
  organizational metadata and cancel-and-recreate is cheap for an
  organizer; the need link touches a vulnerable ask, and the
  author's control over their own ask's exposure should not
  require cancelling a signed, federated event that other members
  may have RSVP'd to. The unlink is a pure local row delete — no
  wire coupling, no signed record, no notification to anyone.

## §6 Surfaces

All surfaces are pull-only, render on data the viewer's node
already has, and appear only on the node where the link exists.

### §6.1 Entry point: the need page CTA

On the need author's own view of their open need, alongside the
existing author affordances: **"Gather hands for this"** →
`/events/new?needId=<id>`. Not rendered for non-authors, not
rendered for `OFFER` posts, not rendered for closed needs. The
data layer re-validates all three (§3.2) so the URL is a
convenience, never an authority.

### §6.2 `EventNew` prefill via `?needId=`

Mirrors the `?projectId=` work-day gate in `EventNew.tsx`
line-for-line in behavior:

- The param resolves against the local `posts` table; it becomes
  a "gather hands" context banner only when the post exists, is a
  `NEED`, is open, and `postedBy` equals the current member.
  Anyone else gets the plain form.
- Deep-link visits win over stored drafts and disable autosave
  for the visit, exactly per the existing precedence comment in
  `EventNew.tsx` — arriving with `?needId=` means the member
  explicitly navigated here for this.
- **Title** seeds once from the need ("Helping hands —
  <need title>"), fully editable, and the member decides what it
  says in front of the unchanged §3 signing card from
  `community-events.md` — the seeded text is a convenience, the
  signature is the member's deliberate act on whatever the field
  says when they sign.
- **Location is never prefilled.** Not from `locationZone`, not
  from anything. It is the threat-model-sensitive field and must
  be typed by hand — same discipline as work days
  (`community-events.md` §10.1) and event templates
  (`event-templates-plan.md` §1).
- Submit calls a `gatherHandsForNeed` data-layer function (the
  `scheduleProjectWorkDay` twin): one transaction, author
  re-validation, `createEvent` composed in, link row written
  after. If event creation rejects, the transaction aborts and no
  link is written.

Additionally, the plain `EventNew` form gains an optional,
collapsed-by-default **"addresses one of your open needs"**
picker listing only the current member's own open `NEED` posts
(§3.1). Empty state: the picker simply doesn't render. Selecting
a need routes submit through the same `gatherHandsForNeed` path.

Before submit, when a need is attached, one plain-language line
joins the existing signing card's context (NOT a new card — the
signing moment stays singular per `community-events.md` §3):

```
This gathering will be linked to your need "<title>" on this
node. Members here who open the event will see it's for your
need; members on other communities will see a plain event.
The link never leaves this node.
```

### §6.3 The need card and need page: "a gathering is planned"

On the linking node, an open need with at least one upcoming
(confirmed, not-yet-past) linked event renders one calm line on
the need card and need detail page:

```
🌱 A gathering is planned — <event title>, <date>
```

It links to the event page. It shows **no RSVP count, no "N
people are coming," no capacity fraction** — the roster stays
inside the event page's existing tiered visibility
(`community-events.md` §6), and a count on the need card would be
the "X people helping" surface §11 rejects. Multiple upcoming
gatherings render as the soonest one plus "and 1 more," nothing
fancier.

### §6.4 The event page: the need it serves

On the linking node, a linked event's detail page renders one
line under the description:

```
🤲 This gathering answers a need: <need title>
```

It links to the need page. Visible to any local member — the need
is already Board-visible on this node, so the line reveals
nothing the Board doesn't. Peer-node viewers never see the line
because the row never federates; their event page is byte-for-
byte the plain event (§7).

### §6.5 What no surface does

No surface counts helpers, ranks needs, compares gatherings,
badges the author, or renders on any member's profile. The bridge
is wayfinding between two artifacts that already exist, and it is
nothing else.

## §7 Federation — the heart of this note

### §7.1 The honest starting point: needs DO federate

This is where the bridge differs from project work days, and the
analysis has to be done fresh rather than copied. Projects never
federate, so `community-events.md` §10.1 could say "a `projectId`
on the wire would be a dead pointer on every peer" and be done.
Needs are not like that. A `Post{type:"NEED"}` is a **federated,
signed record**: `enqueuePostOutbox` ships the immutable signed
subset (`PostPayload` — id, type, category, title, description,
estimatedHours, urgency, postedBy, createdAt, expiresAt,
locationZone, nodeId, signature) through the outbox to
`POST /posts`, and peers pull it via `GET /posts?since=` with a
federation-stable `id`. An event→need pointer on the wire would
therefore be **resolvable on some peers, some of the time** — and
intellectual honesty requires saying so before rejecting it.

So the choice is real, and both options get weighed.

### §7.2 Option (b): a federated `needId` field on `EventPayload`

What it would buy: a peer-node viewer opening the event would see
"this gathering answers <need>" whenever their node also holds
the need — genuine cross-node context for federated communities
whose members RSVP across nodes.

What it would cost:

1. **A breaking wire change.** `canonicalEventPayload` is
   field-order-pinned (`community-events.md` §4.1, following the
   co-organizer discipline); every existing `Event` signature
   verifies over the exact current preimage. Adding `needId`
   changes the preimage: every verifier, the server's
   `parseEvent`, and both payload canonicalizers change, and the
   compatibility story for already-signed events needs a
   versioning answer the events design deliberately avoided
   needing. This is the exact breaking-change shape the
   `EventProjectLinkRow` doc-comment warns about.
2. **A threat-model §7 entry, and it would be an ugly one.** Per
   the wire-surface discipline, the entry lands before code — and
   writing it exposes the problem. The new wire byte is a
   **permanent public correlator binding a member's vulnerable
   ask to a physical gathering's place and time.** Events are
   append-only and uneditable; the correlation outlives the
   need's fulfillment, its expiry, even its author's soft-purge
   of local data — it is in every peer's ledger forever. Walk the
   §3 adversary rows: an employer or union-busting firm
   harvesting the wire currently sees needs (category, zone,
   timing) and events (location, time, organizer) as separate
   streams; the pointer fuses them into "member X asked for help,
   and people will be at <location string> at <time> because of
   it." Row 7 (stalker) is worse: a need often implicates the
   author's *home* ("help me move," "help clear my basement"),
   and the event's free-text location plus start time is exactly
   the signal the RSVP-locality decision was made to keep off the
   wire. The need author's ask is the most personally exposing
   record they create; welding a time-and-place beacon to it on a
   permanent public wire is the single worst byte this feature
   could ship.
3. **It would be a *stale* pointer even when it resolves.** Post
   lifecycle (`status`, `claimedBy`, `confirmedBy`) deliberately
   does not federate — a peer's copy of a need shows it open
   forever. A federated pointer would advertise "this gathering
   answers <need>" on peers long after the need was fulfilled or
   withdrawn on its home node, with no wire mechanism to correct
   it. The §5 lifecycle behaviors (drop the line on withdrawal,
   settle it on fulfillment) are only computable where the live
   lifecycle lives: the home node.
4. **It resolves unreliably anyway.** A need federates only when
   its author had federation configured at creation; legacy
   unsigned posts never federate; a peer that peered later may
   never have pulled it. "Sometimes resolvable, always stale,
   permanently correlating" is not a wire field worth signing.

### §7.3 Option (a), recommended: local-only link row — NO wire change

**There is NO wire change in this design.** Stated in the same
explicit register `EventProjectLinkRow` uses, because this
sentence is the design: no new bytes cross any wire; a linked
event federates as a plain event, identical on the peer wire to
one created without a need; the `"event_need_link"` discriminator
is rejected at the `OutboxRow.kind` type level; there is no
route, no cursor, no pull helper; and therefore **no
`docs/threat-model.md` §7 entry ships with this note** — there is
no new wire surface for one to describe. (The implementation PR
inherits one small documentation obligation instead — see §12.)

The only channel by which a need↔event correlation can reach the
wire is the organizer's own editable free text — the seeded title
they confirm in front of the signing card (§6.2). That is a
member's deliberate, informed act about their *own* ask, which is
precisely the consent boundary this whole note defends.

### §7.4 What degrades for cross-node communities, named honestly

- A peer-node viewer sees a plain event: no "answers a need"
  line, no link to the need — even when their node holds a
  federated copy of that need. The bridge context exists only on
  the home node.
- A cross-node member who wants the context follows the same
  path cross-node RSVPs already take (`community-events.md`
  §7.3): open the organizer's node, where the event page shows
  the bridge line and the RSVP control both.
- If the author wants cross-node readers to understand what the
  gathering is for, the title and description are theirs to
  write — "Helping hands — moving day for a neighbor's need" —
  and the signing card makes that a considered choice.

This is the same degradation work days accepted, and it is
acceptable for the same reason: coordination is already
node-local (claims, DMs, RSVPs, rosters all live at home), so the
bridge's context lands exactly where the coordination it serves
actually happens.

## §8 Attention rail — deliberately none in phase 1

No new `AttentionItem` kinds. The linked event already
participates in `event_today` and `event_cancelled` for RSVP'd
members (`community-events.md` §8); the need already renders its
own Board presence. The one candidate item — "your gathering has
passed; is the need met?" — is deliberately an inline line on the
author's own need page (§5) rather than a rail item: a rail item
recurs at every app open until dismissed, which for a member
whose need *wasn't* met by the gathering becomes a soft nag to
declare an outcome. `no-notifications` says the rail is for
what needs attention; `solidarity-not-shame` says an unmet need
after a gathering must not be framed as a question the member
owes the system an answer to. The inline placement keeps the
suggestion available exactly when the member is already looking
at their own ask, and nowhere else.

## §9 Composition with project work days

The bridge composes with, and does not duplicate, the §10.1
work-day link:

- **Two orthogonal rows, one pattern.** `eventProjectLinks` and
  `eventNeedLinks` are separate tables with the same negative-
  space contract. An event could in principle carry both (a
  project work day that also answers a member's need); nothing
  structurally forbids it, but phase-1 UI offers one context per
  creation flow — `EventNew` honors one deep-link param per
  visit (`?projectId=` or `?needId=`), and combining both is out
  of scope until a real case shows up.
- **Different authority, same enforcement point.** Work days
  gate on project organizer/co-organizer authority; need
  gatherings gate on need authorship. Both are re-validated in
  the data layer, both degrade a forged URL to a plain event
  with zero link rows.
- **No shared subsystem changes.** `events.ts` stays untouched
  by both — the federated layer never learns either link exists.

A need is not a project and the bridge must not become a project
funnel: no "convert this need to a project" affordance, no
suggestion that a many-hands need is really a project in
disguise. Asking stays lightweight (`asking-never-gated`);
projects remain the opt-in heavier structure they already are.

## §10 Ethos review

Walking the principles ledger
(`apps/web/src/content/design-principles.ts`), in the order the
cuts are deepest.

- **`solidarity-not-shame`** — "Never frame a situation as
  stalled, overdue, or failed." The bridge never suggests a need
  *should* become a gathering: no "this need has been open N
  days — plan a work day?" nudge exists or may ever exist (§11).
  A gathering that doesn't finish the work leaves the need open
  with no changed framing. The post-event line offers the author
  an affordance, not a verdict, and only the author sees it. No
  surface counts helpers or attendance against the need.
- **`privacy-precondition`** — "No email, no phone number,
  minimal logging." The entire feature is a local Dexie row plus
  local rendering. Zero new wire bytes, zero new server state,
  zero new log lines. The one correlation channel that exists —
  the event's free text — was already there and stays behind the
  signing card. Soft-purge clears the table; export excludes it.
- **`asking-never-gated`** — "You can receive before you give."
  Nothing about asking changes: posting a need requires no
  event, no schedule, no organizing capacity. The bridge is an
  optional amplifier the author may reach for; a need without a
  gathering is exactly as visible, claimable, and answerable as
  today. Linking gates on authorship, never the other way
  around.
- **`no-notifications`** — "No buzzing, no badge counts, no
  urgency theater." No push anything, no new rail items (§8),
  no badge on the Board tab when a gathering is planned. Every
  surface is something the member walks up to.
- **`community-authority`** — "No admin role." No moderator
  approves links; no community role can create or remove one.
  Authority is the narrowest possible: the author over their own
  ask. Fulfillment stays the author's word alone — the calendar
  never closes a need.
- **`deliberation-over-speed`** — the signing moment stays
  singular and unhurried: one card, unchanged from
  `community-events.md` §3, with the bridge adding one
  plain-language line about local linkage rather than a second
  consent surface to click through. Cancel-and-recreate (not
  edit-in-place) still governs the event side.
- **`no-leaderboards`** (reinforcing §11) — no count of
  gatherings per need, needs per member, or hands per gathering
  appears anywhere. The unit remains *us*: the Board shows the
  ask, the calendar shows the gathering, and nobody accrues a
  score for either.

## §11 What this is NOT — scope exclusions and rejected shapes

Each entry names its reason; superseding one means naming why the
reasoning no longer holds, per the house convention.

### §11.1 No volunteer-count or "X people helping" surfaces

**Rejected.** The need card and need page never render RSVP
counts, capacity fractions, or helper tallies for a linked
gathering. A count on the ask converts solidarity into a
popularity readout of someone's hardest moment — the
`no-leaderboards` / `solidarity-not-shame` failure mode in its
purest form ("nobody signed up for *your* need"). The roster
stays inside the event page's existing tiered visibility, where
the viewer chose the RSVP context.

### §11.2 No pressure mechanics on the need author

**Permanently rejected.** No staleness nudges ("open 12 days —
gather hands?"), no auto-suggested events, no prompts to convert
asks into gatherings, no repeated fulfillment prompts, no framing
of an unmet need after a gathering as unfinished business. The
author initiates everything or nothing happens. This entry is
permanent for the same reason `community-events.md` §11.6
(attendance tracking) is: there is no data or engagement win
worth encoding pressure into the moment of asking.

### §11.3 No linking someone else's need

**Rejected for phase 1** per the full §3.2 analysis; the
two-party consent flow (organizer proposes, author accepts —
shaped like `co-organizer-invitations.md`) is the phase-2
candidate, tracked in §14 ruling 1. Until then the rule is
absolute, enforced in the data layer.

### §11.4 No federated pointer

**Rejected** per the full §7.2 analysis: breaking canonical-
payload change, permanent public correlator on a vulnerable ask,
stale-on-peers semantics. Re-proposing it means writing the
threat-model §7 entry §7.2 sketches and superseding this note's
federation section.

### §11.5 No multi-claim needs

**Out of scope.** Making `claimedBy` plural is a Board/exchange
redesign, not a calendar bridge, and it would touch the signed
`Exchange` flow. The bridge deliberately solves many-hands
coordination *around* the claim model, not inside it. A future
multi-claim design supersedes nothing here — the bridge composes
with whatever the claim model becomes.

### §11.6 No auto-resolution of needs

**Rejected** per §5: event completion suggests (inline,
author-only) and never triggers. The system cannot know whether
the work got done, and pretending to would put the platform's
word above the member's on the member's own ask.

### §11.7 No standing feeds or export of the bridge

Nothing new is exportable: the link is excluded from data export
(§4), there is no bridge iCal shape, and the single-event `.ics`
export (`community-events.md` §11.5a) is unchanged — it contains
event fields only and never gains a need reference. Any standing
URL shape is already permanently rejected territory
(`calendar.md` §10.5).

## §12 Threat-model delta

**None — no new wire surface exists for a §7 entry to describe.**
This section exists to say so explicitly, mirroring how
`ProjectTask.orderIndex` and `EventProjectLinkRow` documented
their local-only postures, and to keep the boundary visible for
future contributors.

The implementation PR inherits one documentation obligation (the
§11.5a pattern — an obligation of the implementation PR, not of
this note): append to the existing threat-model §7 entry
"Federated `Event` records widen the public wire surface" a short
paragraph stating that need gatherings, like project work days,
do NOT widen that surface — local-only Dexie row,
`"event_need_link"` rejected at the `OutboxRow.kind` type level,
no new bytes on any wire, and the organizer's own free-text title
as the only member-chosen correlation channel. That paragraph
sits beside the existing work-day paragraph in the same entry.

If any future phase promotes any part of the bridge to the wire
(the §14 ruling-1 two-party flow would, since an invitation must
travel), that PR owes a full §7 entry — new wire fields,
adversary mapping per §3, mitigations, residual risk — *before*
code, per the standing discipline.

## §13 Implementation phases

Following the house PR-ladder convention, with the loud skip
named:

- **PR B — types + schema + locks.** `EventNeedLinkRow` in
  `apps/web/src/types/index.ts` with the full negative-space
  doc-comment; Dexie v28 `eventNeedLinks` table; the
  `OutboxRow.kind` doc-comment gains the `"event_need_link"`
  intentional-absence note; negative tests (`@ts-expect-error`
  on the kind union, no-enqueue-helper, no-pull-helper) in
  `eventNeedLinks.test.ts`. Soft-purge and data-export exclusion
  wiring + tests. No UI.
- **PR C — data layer + entry points.** `gatherHandsForNeed` in
  `apps/web/src/db/eventNeedLinks.ts` (transactional twin of
  `scheduleProjectWorkDay`: author/type/status re-validation,
  composed `createEvent`, idempotent link write);
  `listLinksForNeed` / `getLinksForEvent` query helpers;
  `EventNew` `?needId=` gate + own-needs picker + the signing-
  card context line; the need-page CTA. Tests mirror
  `EventNew.workDay.test.tsx` including the forged-URL
  degradation case. i18n en/es.
- **PR D — server federation. LOUDLY SKIPPED.** No server work
  exists for this feature, and the skip is the design (§7). Same
  loud-skip pattern as `blocking.md` §13 and the task-ordering
  workstream. The PR-C description links this section so nobody
  goes looking for the missing PR.
- **PR E — rendering surfaces.** Need card / need page gathering
  line (§6.3); event page bridge line (§6.4); post-event inline
  fulfillment suggestion (§5), author-only, dismissible; the
  unlink affordance if ruling 3 lands as recommended; the
  threat-model §7 events-entry paragraph per §12. i18n en/es;
  accessibility DOM-order per `docs/accessibility.md`.

## §14 Open questions — Operator ruling needed

Three, each with a recommended default; everything else in this
note is decided.

1. **Phase-2 two-party linking (author ≠ organizer).** Should a
   later phase let an organizer *propose* a link to someone
   else's need, effective only on the author's signed (or at
   least explicit local) acceptance — the
   `co-organizer-invitations.md` shape? It would close the §3.2
   capacity gap (authors who can't organize) at the cost of new
   machinery and, if the invitation federates, a new wire
   surface with its own §7 entry. **Recommended default: defer.**
   Ship author-only, let the pilot show whether the free-text
   convention path actually falls short.
2. **The post-event fulfillment suggestion (§5).** Include the
   author-only inline "if this need is met, you can mark it
   fulfilled" line, or ship no suggestion at all and trust
   authors to close their own asks unprompted? The line is calm
   by construction, but it is still the system speaking about an
   outcome. **Recommended default: include it** — inline,
   author-only, dismissible, never on the rail — because a
   fulfilled-but-open need silently drains helper attention from
   asks that still need it.
3. **The unlink affordance (§5).** Ship the author-only local
   "remove this link," diverging from the work-day precedent's
   no-unlink stance? **Recommended default: yes** — the
   divergence is justified (a vulnerable ask deserves an exit
   that doesn't require cancelling a federated event others have
   RSVP'd to, and the operation is a pure local row delete with
   none of the cancel-path coupling §10.1 was avoiding), and the
   asymmetry with work days should be recorded in both docs when
   it lands.
