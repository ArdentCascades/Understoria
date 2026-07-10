# Understoria — Community Events (design note)

> **Status:** **shipped.** Design note + threat-model §7 entry +
> privacy-policy §4 / §6 amendment + incident template + calendar.md
> §9 update landed in PR #186. Implementation shipped across five
> PRs: shared types + canonical payloads + signature verification
> (PR #187, with the wire-contract alignment fix in the same PR);
> Dexie v22 + actions + federation pull plumbing (PR #188), with a
> cursor-key naming refactor in PR #189; server-side ingestion +
> peer pull (PR #190); event create form + detail page + RSVP
> control (PR #191); calendar + attention-rail integration (PR
> #192). Pairs with the threat-model §7 entry "Federated `Event`
> records widen the public wire surface" and the
> `docs/privacy-policy.md` §4 / §6 amendment that landed alongside
> the design note. Read alongside `docs/calendar.md` (whose §9
> deferred-trigger this work fired) and
> `docs/co-organizer-invitations.md` (which sets the discipline for
> "what a signed record commits the signer to" comparison cards and
> for canonical-payload field-order pinning).

---

## §1 Status

Shipped. The doc + threat-model addendum + privacy-policy amendment
+ incident template + calendar.md §9 update were the predicate
(PR #186); implementation PRs B through F (see §13) shipped in
sequence — see the per-PR notes in §13. Phase-2 event templates have since SHIPPED
(`docs/event-templates-plan.md`, PRs #254–#256): the `templateId`
forward slot is live and the verifier accepts a non-null value.
Opt-in iCal export and browser push reminders remain deferred per
§10 / §11.

## §2 Why now

`docs/calendar.md` §9 deferred the federated `Event` record with two
preconditions. Both are now met:

- **Pilot signal from the operator.** Members in the pilot
  communities have asked for a way to put skillshares, potlucks, and
  work days on the calendar that are not already shaped by an
  existing `Post` or `Project`. The operator surfaced the request
  as the community signal calendar.md §9 named as the trigger.
- **Threat-model entry landed in the same PR.** Per the discipline
  every other federated-surface change in this project follows
  (co-organizer invitations, device pairing, calendar aggregation,
  auto-confirm system key), the wire-surface widening lands in
  `docs/threat-model.md` §7 *before* any code reads or writes a
  byte. That entry is part of this same PR.

The narrowest answer that satisfies the felt need is what this doc
designs. Anything broader — recurring events, RSVP federation,
attendance tracking, iCal export — is named in §11 with the reason
it's out of scope for phase 1.

## §3 What an Event commits to

> **What this commits to.** By signing an `Event`, you are publishing
> your verifiable identity as the organizer of an event happening at
> &lt;location&gt; at &lt;startsAt&gt;, federated to every peer node,
> permanent and append-only. The peer-node operator, every peer
> member with federation access, and any future observer of the
> federated ledger will see your public key tied to this location and
> this time. Cancellation is possible; deletion is not.

This is the same discipline as `docs/co-organizer-invitations.md`
§3. The values commitment is that the member sees, on the create-
event surface, what their signature commits them to *before* they
sign. Not in a tooltip; in a comparison card.

The create-event card enumerates, in plain language:

```
Create event "<title>"

What this means

  ✓  Public organizer record       Your public key is published as
                                   the organizer. Anyone with
                                   federation access can see you
                                   organized this.
  ✓  Public location and time      The location string and the start
                                   time you enter are visible on every
                                   peer node. Choose a description
                                   that matches what you can publish.
  ✓  Permanent                     Events are append-only. You can
                                   cancel; you cannot delete or edit.
                                   A cancellation is itself a signed,
                                   permanent record.
  ✓  RSVPs stay on the node where  Members RSVP'ing on this node are
     they happen                   visible to the organizer and to
                                   other RSVPs on this node only.
                                   Members on other nodes never see
                                   the RSVP roster.

What this does NOT mean

  ◯  Editable                      To change the time or location,
                                   cancel and re-create. Cancellation
                                   is its own signed record so members
                                   who RSVP'd see why their event went
                                   away.
  ◯  Privately scoped              There is no "members-only event"
                                   primitive in phase 1. If the event
                                   shouldn't be on a public wire,
                                   don't sign it — coordinate via DM
                                   or a Post{type:"OFFER"} instead.

  [ Cancel ]    [ Create and sign ]
```

The "What this does NOT mean" half exists for the same reason it
exists on the co-organizer-acceptance card: a member who thinks the
record is editable, or thinks "members only" is implicit, will sign
something they wouldn't otherwise have signed. The card names the
absence of those features.

## §4 Data model

Three record types. Two are federated and signed (`Event`,
`EventCancellation`). The third (`EventRSVP`) shipped local to the
node where the RSVP happened and never entered the outbox; since
participation Phase 2 it syncs through the member's own community
node (see §4.2 / §7.2) while staying off the peer wire.

### §4.1 `Event` — federated, signed

Canonical payload, signed by the organizer.

```ts
export interface EventPayload {
  kind: "event";
  id: string;               // uuid, federation-stable handle
  title: string;            // free text, ≤ 200 chars
  description: string;      // free text, ≤ 2000 chars
  category: string;         // member of ALL_CATEGORIES
  startsAt: number;         // epoch ms, UTC
  endsAt: number | null;    // epoch ms, UTC; null = single-point event
  location: string;         // FREE TEXT. No GPS pin. ≤ 200 chars.
  capacity: number | null;  // optional soft cap; null = uncapped
  templateId: string | null; // reserved for phase 2; MUST be null in phase 1
  createdAt: number;
  createdBy: string;        // organizer pubkey; signs this payload
  nodeId: string;
}

export interface Event extends EventPayload {
  signature: string;        // Ed25519 over canonicalEventPayload(p)
}
```

Canonical payload, fixed field order — same discipline as
`canonicalCoOrganizerInvitationPayload`:

```ts
export function canonicalEventPayload(p: EventPayload): string {
  return JSON.stringify({
    kind:        p.kind,
    id:          p.id,
    title:       p.title,
    description: p.description,
    category:    p.category,
    startsAt:    p.startsAt,
    endsAt:      p.endsAt,
    location:    p.location,
    capacity:    p.capacity,
    templateId:  p.templateId,
    createdAt:   p.createdAt,
    createdBy:   p.createdBy,
    nodeId:      p.nodeId,
  });
}
```

`signature` is NOT part of the canonical payload. Same convention
as `Vouch`, `Exchange`, and the co-organizer record family.

Field-by-field rationale:

- `location` is **free text**, not a structured GPS pin or
  coordinate pair. Threat-model §7 entry covers why: a free-text
  location keeps adversaries guessing about specifics, while a
  coordinate pair would expose a stalking-grade location signal on a
  public wire. "Community room, 3rd floor" is fine; "47.6062 N,
  122.3321 W" is not the shape this field is for.
- `templateId` began as a phase-1 forward slot (must-be-null,
  verifier-rejected) so the wire shape wouldn't need a breaking
  change later. Phase 2 has since shipped: the template registry
  lives in `apps/web/src/content/eventTemplates.ts`, and both
  `createEvent` and the server verifier accept a non-null
  `templateId` (1–50 chars). See `docs/event-templates-plan.md`.
- `capacity` is **soft** — the UI suggests RSVPs stop when the cap
  is hit, but the server never enforces a count (counts are local
  per node — see §4.2). When the cap is reached on the organizer's
  node, the organizer gets an `event_capacity_reached` attention
  item (see §8). Other nodes' members may RSVP past the cap from
  their own nodes; the organizer's node shows only its own
  aggregate — the capacity field renders the plain node-local fill,
  "{{going}} of {{capacity}} going" (`events.detail.capacityFill`),
  with no peer-node figure (those RSVPs aren't in this node's
  database).

### §4.2 `EventRSVP` — local Dexie row; community-node sync since Phase 2

*(Heading at writing: "LOCAL DEXIE ONLY, NEVER FEDERATED" — the
load-bearing decision of this design, SUPERSEDED IN PART by
participation federation Phase 2; see §7.2 and §11.1 for exactly
what changed and what didn't.)* As shipped: **`EventRSVP` never
entered the outbox** — no `OutboxRow.kind` discriminator, no
federation route, no peer-pull cursor; the Dexie row was the only
place it existed. Since Phase 2 the row syncs through the member's
own community node as a signed single-owner `EventRsvpState` record;
it still never crosses the cross-node peer wire.

```ts
// LOCAL ONLY — Dexie table `eventRsvps`. Not signed. Not federated.
// MUST NOT appear in OutboxRow.kind. The federation layer has no
// knowledge of this type.
export interface EventRSVP {
  id: string;               // uuid
  eventId: string;          // refers to Event.id
  memberKey: string;        // RSVP'er's pubkey (always local member's own key)
  status: "going" | "maybe" | "not_going";
  respondedAt: number;
}
```

Mirrors the `Post.claimedBy` discipline: signed records (`Event`,
`EventCancellation`) federate; the local roster of who-RSVP'd-what
does not. The rationale is in §6 (attendee visibility tiers) and in
the threat-model §7 addendum (federated RSVPs would be a
federated-attendance-graph surveillance vector for the organizing
employer, union-busting firms, and stalker adversaries enumerated
in threat-model §3).

A member who RSVPs on node A and later opens the PWA on node B does
NOT see their own RSVP on B — the RSVP table is per-node, scoped to
the device-cluster paired into that node's identity store. This is
consistent with the rest of the local-only state (preference flags,
availability chips, achievements) and is documented in §7.

### §4.3 `EventCancellation` — federated, signed

```ts
export interface EventCancellationPayload {
  kind: "event_cancellation";
  id: string;               // uuid
  eventId: string;          // refers to Event.id
  reason: string;           // free text, ≤ 500 chars; can be empty
  cancelledAt: number;
  createdBy: string;        // MUST equal Event.createdBy or verification fails
  nodeId: string;
}

export interface EventCancellation extends EventCancellationPayload {
  signature: string;        // Ed25519 over canonicalEventCancellationPayload(p)
}

export function canonicalEventCancellationPayload(
  p: EventCancellationPayload,
): string {
  return JSON.stringify({
    kind:        p.kind,
    id:          p.id,
    eventId:     p.eventId,
    reason:      p.reason,
    cancelledAt: p.cancelledAt,
    createdBy:   p.createdBy,
    nodeId:      p.nodeId,
  });
}
```

Verification rejects an `EventCancellation` whose `createdBy` does
not equal the referenced `Event.createdBy`. Same single-signer
discipline as `CoOrganizerInvitationRevocation` — the canonical
authority to cancel an event is held by exactly one key, the
organizer's, and a record signed by anyone else is rejected at the
federation route.

A `reason` field is **optional and free-text**. Members who RSVP'd
deserve a sentence about why their plans changed; the field exists
to let the organizer say it. Empty reason is allowed and rendered as
"Cancelled (no reason given)."

### §4.4 Derived view: effective event state

```
effectiveEventState(event) =
  "cancelled"  if ∃ EventCancellation with eventId = event.id ∧ signature verifies
  "confirmed"  otherwise
```

There is no `proposed`, no `pending`, no `passed`. An event exists
or it's been cancelled. See §11 for why a "proposed → confirmed"
status was rejected.

## §5 Lifecycle

```
nothing → confirmed → (optionally) cancelled
```

That's it. No edits in phase 1. Rationale: any edit invalidates the
informed consent a member gave at RSVP time — if "Saturday at
2:00 PM at the community room" becomes "Sunday at the warehouse," a
member who said yes to the first is being silently signed up for the
second. The organizer's path is to cancel and re-create; the
cancellation surfaces on the RSVP'd members' attention rails (see
§8), they see the new event, they decide again.

Cancellation surfaces on RSVP'd members' attention rails (the
`event_cancelled` item) until acknowledged. Acknowledgment is a
local dismissal — no record federates for "I saw the cancellation."

No edits is a tighter constraint than `Post` (which can be deleted
by author) and `Project` (which has limited mutability through
organizer actions). The rationale matches the `co-organizer-
invitations.md` §10 stance: each signed act is its own deliberate
moment. An edit-in-place affordance smudges that line. Cancel-and-
recreate keeps every signed thing a signed thing.

## §6 Attendee visibility

This is the values-load-bearing section. The decision is **tiered
visibility with an informed-consent surface before submission**, not
"public roster" and not "fully private count." Quoted from
`CODE_OF_CONDUCT.md` §4:

> "Respect for privacy. We do not screenshot, forward, or copy
> platform content out of the community. We do not disclose
> membership, activity, or identity to outsiders without consent. We
> honor pseudonyms."

The visibility tiers below are the technical surface that makes that
community commitment legible at the moment a member chooses to RSVP.

### §6.1 The three tiers

| Tier | Sees | Does not see |
|---|---|---|
| **Non-RSVP'd member, same node** | Event details, total count of RSVPs in each status (`going`, `maybe`) | Names of RSVP'd members |
| **Peer-node viewer (any tier on a different node)** | Event details, count rendered as `?` (see §7) | Names of RSVP'd members on the organizer's node; counts of RSVPs on the organizer's node |
| **Organizer; member who RSVP'd "going" or "maybe"** | Event details, full list of names of "going" and "maybe" RSVPs on this node | Names of RSVPs on peer nodes (those don't exist in this node's database) |

A member who changes their RSVP from `going` or `maybe` to
`not_going` is **removed from the visible roster immediately**. This
is the privacy-equivalent of "I changed my mind" — the system honors
that without exposing a delta to other members ("X used to be going
and isn't anymore" is the wrong shape).

### §6.2 The informed-consent surface

The RSVP control surfaces this BEFORE submission. Whenever the
chooser is showing — before a member's first RSVP on an event, and
again whenever they tap "Change RSVP" — a small card sits above the
buttons:

```
RSVP to "<title>"

If you RSVP going or maybe:
  - The organizer sees your name on the attendee list.
  - Other members who also RSVP'd see your name on the attendee list.
  - Non-attendees and peer-node viewers see the count only — not names.

If you RSVP not going (or change to not_going later):
  - Your name is removed from the visible roster.
  - You'll still get a heads-up if the organizer cancels the event.

  [ Going ]    [ Maybe ]    [ Not going ]
```

(A Cancel button joins the row only in the change flow, to back out
of "Change RSVP" without touching the recorded answer.)

Same discipline as the co-organizer-invitation acceptance card:
the values commitment is that the visibility consequence is named
before the signature, not after. Even though an `EventRSVP` is not
a signed federated record, the local visibility consequence is real
and members deserve to know about it.

There is deliberately no "don't show this again" dismissal. The
card lives with the chooser: once an RSVP is recorded, both fold
away behind the current-answer summary, so it never nags a member
who has already answered — and it reappears with the chooser on
"Change RSVP", keeping the visibility consequence in view at
exactly the moments a signature is being made or remade.

### §6.3 Why this tiered model rather than the alternatives

- **Public roster, all members all the time** was rejected because
  it turns RSVP'ing into a public popularity / attendance signal —
  exactly what `solidarity-not-shame` and `no-leaderboards` rule
  out. It also creates the worst version of the surveillance
  surface: an adversary harvesting the public peer wire can see
  "key X is going to skillshare Y at location Z on date T."
- **Fully private (count only, even to organizer)** was rejected
  because the organizer reasonably needs to know who's coming so
  they can plan capacity, ingredient lists, accessibility setups.
  Not telling the organizer is hostile to organizing.
- **Per-RSVP visibility toggle** ("show my name to the organizer
  only") was considered and rejected for phase 1 because it
  multiplies the UI surface for marginal values gain — the tiered
  model already names the privacy floor; a per-RSVP toggle would
  invite "why didn't X tick the box" social pressure. Open for
  reconsideration if pilot signal surfaces a real need.

Citing `privacy-precondition` here:

> "No email, no phone number, minimal logging. Your identity is a
> cryptographic key on your device."

The RSVP roster shipped local-only because that's what
`privacy-precondition` was read to require of any new data surface.
*(Phase 2 revisited this reading: the roster now syncs within the
member's own community — the audience the RSVP addresses — while
staying off the cross-node peer wire. The principle's exposure model
was about the open federation, and that boundary held. See §7.2 +
§11.1.)*

## §7 Federation

### §7.1 What federates

- `Event` records federate via the same outbox + peer-pull
  infrastructure as `CoOrganizerInvitation`. Cursor pagination by
  `createdAt`. Dedupe by `id`. Signature verify against `createdBy`.
- `EventCancellation` records federate the same way. Cursor pagination
  by `cancelledAt`. Dedupe by `id`. Signature verify against
  `createdBy`, with the additional constraint that `createdBy` must
  match the referenced `Event.createdBy` (rejecting cancellations
  from non-organizers at the route).

### §7.2 What does NOT federate

*(SUPERSEDED IN PART — participation Phase 2,
docs/project-federation.md §6.)* As originally shipped: `EventRSVP`,
absolutely not — no outbox kind, no route, no cursor, no pull; the
Dexie table was read and written locally and that was the entire
story.

Since Phase 2: RSVPs (and shift definitions / signups) sync as
signed LWW state records through the member's own **community
node**, via `"event_rsvp"` / `"event_shift"` / `"shift_signup"`
outbox kinds, the `POST/GET /event-rsvps` (+shifts/signups) routes,
and `pullFederatedEventRsvps` & co. What remains true, and remains
settled at the architecture layer: **none of these kinds joins the
cross-node `peerPull` loop.** A PEER node viewing a federated event
still has zero knowledge of who RSVP'd — the attendance graph stays
inside the community whose members are on it. The reversal's full
adversary analysis: threat-model §7 "Federated participation
records"; the ruling it supersedes: §11.1 below.

### §7.3 Peer-node count rendering

> **SUPERSEDED (July 2026, operator-affirmed) — cross-node RSVP goes
> through your own node; the suppression affordance below was never
> built and won't be.** Participation federation Phase 2 changed the
> premise this section argued from: the RSVP control now works on
> **any** event copy, including one that federated in from a peer
> node — the member's signed `EventRsvpState` syncs to **their own**
> community node like every other RSVP. So a peer-node viewer isn't
> "on the wrong node to RSVP" anymore; they RSVP right where they
> are, and the count they see is *their community's* RSVPs for that
> event. What §7 settled still holds: participation records never
> join the cross-node `peerPull` loop, so each community's roster
> stays on its own node — the organizer sees their community's
> RSVPs, node B's members see node B's, and no cross-community
> attendance graph exists anywhere. The "RSVPs: not visible from
> this node / RSVP at <organizer-node>" rendering described below
> was designed for the pre-Phase-2 world and is preserved only as
> design history.

**Decision: suppress the count entirely on peer-node views and show
an affordance pointing at the organizer's node.** Rendered shape:

```
RSVPs: not visible from this node
RSVP at https://<organizer-node>/event/<id>
```

The alternative — showing "RSVPs: ?" — was considered and rejected
because it implies a number exists that we're hiding from the
viewer. The actual truth is that the viewer is on the wrong node to
see the RSVP roster; the affordance names that and gives the viewer
a path. A community member of node B can follow the link, RSVP on
node A (no account migration required — they bring their own
keypair via the existing federation-trust posture), and their RSVP
lives on node A where the organizer can see it.

There is no `POST /event-rsvps` route on node A from node B's PWA —
the RSVP-on-A path requires the member to open node A's PWA and use
its native RSVP control. This is consistent with how cross-node
member federation works today (your keypair is portable; the local
data lives where you signed in).

(This is an opinionated choice. Open question §14 names the
alternative: a per-peer-node "RSVPs here: N" breakdown rendered as
a per-node tally so the viewer at least sees "node B has 4 going,
node C has 2 going" without resolving names. We picked the cleaner
single-affordance path for phase 1.)

## §8 Attention rail items

Three new `AttentionItem` kinds. All are computed by
`apps/web/src/lib/attention.ts` on local data — same shape as the
existing `project_deadline_approaching` item. Cite the
`no-notifications` principle:

> "We show what needs your attention when you open the app. No
> buzzing, no badge counts, no urgency theater."

All three items are **pull-only**. No browser push notification,
no badge count, no email. The member sees them next time they open
the app. The dismissal lifecycle is local-only — dismissals never
federate.

*(As-built delta — the dismissal lifecycles below were designed but
never built. The shipped items (`apps/web/src/lib/attention.ts`)
are pull-only exactly as specified, but none of the three is
dismissable — the attention rail has no dismissal plumbing at all.
Each item just ages out on its own time window: `event_today`
disappears with the UTC day, `event_cancelled` rolls off 7 days
after the cancellation, and `event_capacity_reached` shows while
the going-count still meets the cap — recomputed on every open, so
it drops out if RSVPs dip back under the cap, rather than the
once-ever dedupe §8.3 describes. Read the per-item "Dismissal" and
"Dedupe … ever" clauses as design history.)*

### §8.1 `event_today`

- **Query.** For each `Event` where `effectiveEventState(event) =
  "confirmed"` and `startsAt` falls on the current UTC day (same
  UTC-day boundary as `lib/calendar.ts` uses), surface to every
  local member with an `EventRSVP` row of status `going` or `maybe`.
- **Dedupe.** One item per (member, event) pair. If the member has
  RSVP'd "going" then changed to "maybe" then back to "going," only
  one item exists.
- **Dismissal.** Local-only. Dismissing removes the item from the
  attention rail for the rest of the UTC day. The next day's
  `event_today` (if any) appears normally.
- **Rationale for same-UTC-day, not 24h-window.** Matches
  `project_deadline_approaching` shape and avoids the "starting in 3
  hours" notification-feel — the day-of surface is "what's on today
  for me" which is information, not "urgent, hurry" which is
  notification-feel. Per `no-notifications`, the latter is the wrong
  shape for this app.

### §8.2 `event_cancelled`

- **Query.** For each `EventCancellation` with `cancelledAt` in the
  last 7 days, surface to every local member with an `EventRSVP`
  row referencing the cancelled `eventId` of status `going` or
  `maybe`. (Members who RSVP'd `not_going` are not notified — they
  weren't planning to be there.)
- **Dedupe.** One item per (member, event) pair.
- **Dismissal.** Local. Persistent (dismissed = dismissed forever
  for this member).
- **Rationale.** The 7-day window is a memory-aid for members who
  haven't opened the app since before the cancellation; older
  cancellations roll off because the member either saw them or no
  longer needs to.

### §8.3 `event_capacity_reached`

- **Query.** For each `Event` with `capacity != null` and a local
  count of RSVPs with `status = "going"` ≥ `capacity`, surface to
  the organizer (and the organizer only).
- **Dedupe.** One item per event, ever. If a member RSVPs out and
  back in across the threshold, the organizer still gets at most
  one capacity-reached item per event.
- **Dismissal.** Local. Persistent.
- **Rationale.** The organizer set a soft cap because they had a
  reason (physical space, supplies). When local RSVPs hit it, the
  organizer hears about it. Other members don't — the cap is a
  planning aid for the organizer, not a public "sold out" signal.
  No equivalent item for peer-node RSVP totals because those don't
  exist in this node's database.

## §9 Calendar integration

Three views (agenda / month / week) per `docs/calendar.md` §6.
Events render distinct from project deadlines and post expiries:

- **Project deadlines** stay as their existing marker shape.
- **Post expiries** stay as their existing marker shape.
- **Events** get a new marker shape — recommend a filled chip or
  pill with the event title truncated, colored by `category` from
  `CATEGORY_META[c].barColorClass` to match the existing visual
  vocabulary.

An **"Events only" filter chip** joins the existing category /
project / "Mine" filter row. Toggling it hides project deadlines and
post expiries and shows only event markers — useful for the member
asking "what's coming up I could attend?"

The **density indicator stays exchange-keyed.** Events MUST NOT
factor into the density count. This is per settled decision 6 and
preserves the `no-leaderboards` posture on density — density signals
community metabolism (exchanges), not popularity of events. The
`WhyTooltip principleId="no-leaderboards"` already attached to the
density indicator stays in place; an analogous tooltip on the
"Events only" filter chip pointing at `no-notifications` ("we're
not pushing events at you — this is just a filter for what you
came to look at") may help, pending UI review.

Cross-reference: `docs/calendar.md` §8.2 explicitly framed the
exchange-density indicator as "community metabolism, not a score
to chase." That framing is incompatible with events factoring into
density; this design respects that boundary by leaving density
unchanged.

## §10 Templates (phase 2 — out of scope here)

Phase 2 will ship a hardcoded set of event templates so a member
creating a "potluck" or "skillshare" doesn't have to enter every
field from scratch. The set we anticipate:

- **Skillshare** — pre-fills category to skills-exchange, prompts
  for what's being taught, suggests a 90-minute duration.
- **Potluck** — pre-fills category to food, prompts for what to
  bring, suggests a 2-hour duration.
- **Work day** — pre-fills category to mutual-aid, prompts for the
  project context, suggests a 4-hour duration.
- **Meeting** — pre-fills category to organizing, suggests a
  60-minute duration.
- **Care circle** — pre-fills category to care-work, suggests a
  90-minute duration.

**Templates are NOT in phase 1.** The `templateId` field on `Event`
is reserved (must be `null` until phase 2). Templates are mentioned
here so future contributors don't redesign them from scratch and so
the data model has a forward slot. The phase-2 design note will
cover:

- Whether templates live as i18n constants or as their own
  federated record type
- How template authorship interacts with the
  `community-authority` principle (probably: hardcoded set,
  not member-creatable, because member-creatable templates drift
  toward "popular templates" which is the leaderboard shape we're
  trying to avoid)
- How template `recurringCadence` (if any) interacts with the
  surveillance-shape concern from threat-model §7's calendar
  entry, paragraph (d)

### §10.1 Project work days (local-only link)

A *work day* is the one event shape that is about a project —
"Saturday build day for Community Fridge." Phase 1 connects the two
with a **local-only link table**, never a wire field. *(A work day's
internal structure — setup crew, serving rota, teardown — is no
longer limited to the event's single soft `capacity` number: events
can now carry **shifts**, with the same local-only posture as RSVPs.
See [`shift-signups.md`](./shift-signups.md).)* The contract,
stated as negative space:

- **`"event_project_link"` MUST NOT appear in `OutboxRow.kind`.** The
  link is a Dexie row (`EventProjectLinkRow`, app-layer types only —
  never `packages/shared`), the same posture as `EventRSVP` and
  `BlockRow`. **No route, no federation cursor, no pull helper.** No
  new bytes cross any wire: a `projectId` on `EventPayload` would be a
  breaking signature change (and was a dead pointer on every peer
  when this shipped — projects were device-local; they federate now
  via `docs/project-federation.md`, but the link row deliberately
  stays local and peers create their own). So the link lives only on
  the node that created it; peers receive a plain community event.
- **Who may link:** organizer or co-organizer, re-validated in the
  data layer (`scheduleProjectWorkDay`) against the project's
  `isOrganizer` authority — a hand-crafted `/events/new?projectId=…`
  URL from a non-organizer yields a plain event and zero link rows.
  Event *creation* stays ungated; anyone may still convene and mention
  a project in free text (the convention baseline).
- **What still federates is the organizer's deliberate choice:** the
  prefilled *title* ("Work day — Community Fridge") is free text the
  organizer edits in front of the §3 signing card. `location` is never
  prefilled from any project field — it is the threat-model-sensitive
  field and must be typed by hand.
- **Asymmetries phase 1 accepts:** scheduling logs a
  `work_day_scheduled` project activity, but **cancellation logs
  nothing** (that would couple the federated `cancelEvent` path to the
  links table); there is no unlink affordance (cancel-and-recreate is
  the corrective path, consistent with §5 no-edits); a cancelled work
  day silently drops from the project card and the project-filtered
  calendar.

## §11 Rejected alternatives

Each rejection names the reason. The list is the contract — a future
contributor proposing one of these supersedes the rejection by
naming why the reasoning here no longer holds.

### §11.1 Federated RSVPs

**Rejected at writing; SUPERSEDED IN PART by participation
federation Phase 2 (docs/project-federation.md §6 + threat-model §7
"Federated participation records").** The original ruling, kept for
the record: federating the RSVP roster would create a
federated-attendance-graph surveillance surface. Quoting the
threat-model §7 addendum (this PR): "an organizing employer or
union-busting firm pulling the public peer wire would see `key X is
attending event Y at location Z`, indexed by category and
timestamp, across the entire federation. That's the
federation-grade version of the attendance-list surveillance
problem labor organizers have spent a century avoiding."

What Phase 2 changed, precisely: RSVPs now sync as single-owner
signed LWW records through the member's OWN community node — because
the local-only trade's real cost turned out to be that an organizer
could not see attendance from anyone else's phone, which defeated
the roster entirely. What Phase 2 did NOT change: **none of the
participation kinds joins the cross-node peer wire** (`peerPull`
carries none of them), so the quoted across-the-entire-federation
harvest remains closed; the §6 visibility tiers still gate what
renders; and §11.2/§11.6 below stand in full.

### §11.2 Public attendee roster visible to non-attendees

**Rejected.** Same surveillance vector as §11.1, plus the values
shape: a roster visible to non-attendees turns RSVP'ing into a
public attendance signal, which is the `no-leaderboards` /
`solidarity-not-shame` failure mode. "X went to 12 community events
this month" is a popularity score; "X is doing community work" is
information; the calendar should surface the latter and never the
former.

### §11.3 `proposed` / `confirmed` quorum gate

**Rejected.** Events are confirmed at creation. A "proposed"
status with a quorum threshold belongs in governance, not in social
coordination. If a member wants to gauge interest before committing
to a date, the right tool is `Post{type:"OFFER"}` ("I'd run a
skillshare on Y if there's interest — drop a claim if you'd come").
That's what claims are for. Wrong-domain conflation, named and
declined.

### §11.4 Per-event browser push reminder notifications

**Deferred to phase 2 as opt-in only.** Cited principle:
`no-notifications` — "We show what needs your attention when you
open the app. No buzzing, no badge counts, no urgency theater."

The phase-1 design provides `event_today` on the attention rail
(pull-only — see §8). A phase-2 reminder might add an opt-in
browser-notification path *if* pilot signal shows members miss
events because they forget to open the app. Any such addition
supersedes this entry and needs its own threat-model line
(browser notifications expose the event's existence to the OS-level
notification surface, which is a real disclosure to anyone with
device access).

### §11.5 iCal export

**Deferred to phase 2 as opt-in toggle only.** Cited:
`docs/calendar.md` §10.5 — "A public iCal subscription URL doesn't
carry an authentication boundary; it's a surveillance escape valve
where any 'subscriber' with the URL pulls full schedule data."

The phase-2 design must thread the needle the calendar doc named:
the toggle must be off by default, scoped to a single member's own
RSVP'd events (never a public community feed), gated behind an
informed-consent surface naming exactly what bytes leave the
device and to where, and revocable (the URL must rotate when the
member disables the toggle so a previously-distributed URL stops
working). Without all four properties, the iCal toggle is the
surveillance escape valve and stays out.

Cross-reference: `docs/calendar.md` §10.5 keeps its iCal rejection
intact for the calendar's view-only aggregation. The phase-2
events iCal toggle, if shipped, is a narrower thing — only the
RSVP'ing member's events, only at their explicit opt-in — and the
phase-2 design will re-derive the threading-the-needle argument.

### §11.5a Single-event `.ics` file export (settled: permissible — shipped)

> **Status:** settled as **permissible**; *shipped in PR #289*
> (`apps/web/src/lib/eventIcs.ts` + the "Add to calendar" entry on
> `EventDetail.tsx`, exactly the sketch below: no server route, no
> VALARM, no attendee/organizer properties). This addendum records
> the values reasoning so the implementation cites a settled
> decision rather than re-litigating it.

§11.5 and `docs/calendar.md` §10.5 are about *subscriptions*. This
addendum is about a different shape that the audit found threads the
needle: a member on the event detail page taps a button, the PWA
generates a static `.ics` file for **that one event** entirely
client-side, and the browser offers it as a download. The
distinction does all the work, so it gets spelled out:

- **What §10.5 rejected** is a *server-hosted* subscription URL —
  per-member or community-wide. That shape means a standing
  endpoint; an unauthenticated fetch surface; a third party (the
  member's calendar provider) polling the node on a schedule; URL
  leakage becoming *ongoing* surveillance of community activity; and
  a rotation/revocation story that never gets good. Every one of
  those properties comes from the URL existing. That rejection
  stands untouched.
- **What this addendum permits** is *client-side, on-demand*
  generation of a one-event file. No server involvement — the PWA
  already holds the event in Dexie. No URL exists. Nothing polls.
  The file contains exactly what the member can already read on the
  screen in front of them (title, start/end, location, description).
  What happens to the file next is the member's choice; importing it
  into their device calendar is their device acting on their behalf.
- **`no-notifications` is honored.** Any reminder that later fires
  comes from the member's own calendar app, configured by them, on
  their device. The node never pushes; the app never schedules. This
  is the same pull-toward-yourself shape as the §11.4 phase-2
  opt-in-reminder concept, with even less machinery — we don't
  implement the reminder at all; the member's existing tools do.
- **`privacy-precondition` is honored.** The exported file contains
  event data the member already has. It does NOT contain the RSVP
  roster, the member's own RSVP status, or any other member's data.
  Exporting is equivalent to the member copying the details by hand,
  which they can already do (and which `CODE_OF_CONDUCT.md` §4
  already governs socially, not technically).

Residual considerations, named honestly:

- **The file outlives the app's purge reach.** Once imported, the
  event lives in the member's device calendar; a member who
  panic-purges the app still has it there. That is a consequence of
  the member's own choice, not a leak — but the member guide should
  say it plainly when the feature ships.
- **Location strings reach third-party calendar sync.** An organizer's
  free-text location ends up in Google/Apple calendar infrastructure
  when the member's calendar syncs. This is per-event and
  member-chosen, not a bulk channel — but the threat-model §7 events
  entry should gain one sentence acknowledging the export path.
  **That edit is an obligation of the implementation PR**, not of
  this note.

Implementation sketch, for the future PR:

- Button on `EventDetail.tsx` — "Add to calendar" / "Añadir al
  calendario" — visible to any member who can see the event (no new
  visibility tier).
- Generate a minimal RFC 5545 `VEVENT` client-side: `UID` from
  event id + node id, `DTSTART`/`DTEND` from `startsAt`/`endsAt`
  with the same UTC discipline as `lib/calendar.ts`,
  `SUMMARY`/`LOCATION`/`DESCRIPTION` from the event fields. This is
  ~20 lines of string building; no dependency is needed, and a PR
  that pulls one in anyway must justify it.
- Download via `Blob` + object URL. **No server route. Ever.** A
  server-rendered `.ics` — even for one event — recreates the URL
  shape §10.5 rejected.
- i18n in both locales, en/es parity as usual.
- Out of scope for that PR: recurring events (none exist); bulk or
  multi-event export (**rejected** — a whole-calendar file is the
  §10.5 shape with the polling removed, and re-proposing it means
  superseding §10.5, not citing this addendum); and `VALARM`
  components inside the `.ics`. The `VALARM` exclusion is a design
  decision, not an omission: embedding an alarm would be the app
  scheduling a notification by proxy — deciding *for* the member
  that a reminder should fire — which flirts with `no-notifications`;
  the member sets reminders in their own calendar app, on their own
  terms, or not at all.

**Settled: permissible.** Implemented in PR #289 per the sketch
above; the threat-model §7 events entry and the member guide gained
their §11.5a-obligated sentences in the same PR.

### §11.6 Attendance tracking / no-show flags

**Permanently rejected.** Cited: `solidarity-not-shame` —
"Never frame a situation as stalled, overdue, or failed. Capacity
changes; the system adapts without blaming anyone."

A "no-show" flag is the platform encoding shame as data. People's
plans change for reasons (childcare, illness, capacity, last-minute
conflict) that are none of the platform's business. There is no
data point this captures that is worth the value violation. The
right response to "X RSVP'd and didn't come" is a conversation,
not a flag.

This rejection is permanent. Any future PR that proposes
attendance tracking — including soft framings like "check in"
buttons that capture the same data — supersedes this entry and has
to explain how it doesn't violate `solidarity-not-shame`.

### §11.7 System-key auto-cancellation of low-RSVP events

**Rejected.** Cited: `docs/auto-confirm-key.md` is the precedent
where the node's system key signs a record on behalf of an absent
party. The pattern doesn't apply here: an under-attended event
isn't a record to sign; it's an event the organizer might still
want to hold (two people is still a skillshare; some of the best
mutual-aid moments are small). The right mechanism for "an event
nobody RSVP'd to" is the calendar simply rendering it with the
small count it has — and the organizer choosing, with their own
judgment, whether to cancel.

There's also a no-leaderboards angle: auto-cancelling under-RSVP'd
events would make the platform encode "low attendance = failure,"
which is the wrong frame.

## §12 Threat model delta

Pointer to the threat-model §7 entry landed in this same PR:
"Federated `Event` records widen the public wire surface."

Summary of the delta (full prose in `docs/threat-model.md` §7):

- New wire fields: `title`, `description`, `category`, `location`
  (free text, no GPS), `startsAt`, `endsAt`, `capacity`.
- Adversary mapping: organizing employer (threat-model §3 row 1),
  union-busting firms (row 2), stalker (row 7) — each benefits
  from "organizer X holds events at location Y on cadence Z"
  becoming a public wire signal.
- Mitigations: RSVPs local-only (closes the federated-attendance
  graph vector); attendee roster scoped (visibility tiers per §6);
  free-text location (no coordinate pin); no member-pattern
  aggregation across events.
- Residual risk: an organizer who repeatedly hosts events at the
  same location does leak that location pattern. The mitigation is
  operator + community guidance ("don't put a literal home address
  on a federated record"), not a technical lock — frame this
  honestly in the threat-model entry.

## §13 Implementation phases

Five PRs after this design doc lands. Sequencing matters: each PR
ships a layer the next builds on, same as the co-organizer
workstream.

- **PR B — shared types + crypto.** *Shipped in PR #187.* The
  same PR also folded in a wire-contract alignment fix bringing the
  field names into line with the repo's existing canonical-payload
  conventions before any other layer started reading the shape.
  - `EventPayload`, `Event`, `EventCancellationPayload`,
    `EventCancellation`, `EventRSVP` in
    `packages/shared/src/types.ts`. **Code comment on `EventRSVP`**
    documenting it never federates: "LOCAL ONLY — Dexie table
    `eventRsvps`. Not signed. Not federated. MUST NOT appear in
    `OutboxRow.kind`. The federation layer has no knowledge of this
    type."
  - `canonicalEventPayload`, `canonicalEventCancellationPayload`,
    `verifyEvent`, `verifyEventCancellation` in
    `packages/shared/src/crypto.ts`.
  - Unit tests for sign / verify / canonical-payload stability /
    cross-engine JSON ordering / templateId-must-be-null in
    phase 1 / cancellation-by-non-organizer rejection.
  - No Dexie, no UI, no server.

- **PR C — Dexie + actions.** *Shipped in PR #188; cursor-key
  naming was aligned with the repo convention in the follow-up
  PR #189.*
  - Schema bump: `events`, `eventCancellations`, `eventRsvps`
    tables in `apps/web/src/db`.
  - `createEvent`, `cancelEvent`, `setEventRSVP` action functions.
  - `effectiveEventState` derived view.
  - Local query helpers: `listLocalRSVPs(eventId)`,
    `localRSVPCount(eventId, status)`.
  - `OutboxRow.kind` extended with `"event"` and
    `"event_cancellation"` only. Test ensures `"EventRSVP"` never
    appears as a valid kind.
  - Tests for the action functions, derived view, RSVP-removal-on-
    `not_going` semantics.
  - No UI, no server.

  *PR C delivered:* Dexie v22 (`events`, `eventRsvps`,
  `eventCancellations`). `OutboxRow.kind` gains `"event"` and
  `"event_cancellation"`; the union rejects `"event_rsvp"` at the
  type level (asserted in `events.test.ts` with `@ts-expect-error`).
  Actions in `apps/web/src/db/events.ts`: `createEvent`,
  `cancelEvent` (organizer-only, idempotent), `rsvpToEvent` (local
  upsert), `getEvent`, `listEvents` (with `includeCancelled` filter),
  `getMemberRsvp`, `listRsvpsForEvent`, `attendeeCount`. Federation
  pulls `pullFederatedEvents` + `pullFederatedEventCancellations` use
  cursor keys `federationLastEventPull` +
  `federationLastEventCancellationPull` (in
  `SETTING_KEYS`, defaulting to `0`). Outbox enqueue helpers
  `enqueueEvent` / `enqueueEventCancellation` live in
  `apps/web/src/lib/outbox.ts`; there is deliberately no
  `enqueueEventRsvp`.

- **PR D — server federation.** *Shipped in PR #190.*
  - New routes mirroring `routes/vouches.ts`:
    `routes/events.ts` (POST + GET ?since=),
    `routes/eventCancellations.ts` (POST + GET ?since=).
    Signature verify, dedupe by ID.
  - Server schema bump (next free server version).
  - `EventCancellation` route additionally verifies that
    `createdBy` equals the referenced `Event.createdBy`. Rejects on
    mismatch with a clear error.
  - Peer-pull integration in `apps/server/src/peerPull.ts` —
    cursor-tracked pulls for both record types.
  - PWA-side `pullFederatedEvents`, `pullFederatedEventCancellations`
    in `apps/web/src/lib/federationSync.ts`.
  - **Negative test**: a request to a hypothetical
    `POST /event-rsvps` returns 404; the route does not exist.

- **PR E — UI: create / cancel / RSVP / detail.** *Shipped in
  PR #191.*
  - Create-event surface with the §3 comparison card.
  - Event detail page with the §6 tiered visibility rendering.
  - RSVP control with the §6.2 informed-consent expansion card.
  - Cancel-event surface with reason field (free text, optional).
  - ~~Cross-node event detail page with the §7.3 "RSVPs: not
    visible from this node" affordance~~ — never built; superseded
    by participation federation Phase 2 (see the §7.3 note): the
    ordinary RSVP control works on peer-origin events through the
    member's own node.
  - i18n keys in `en.json` and `es.json`.

- **PR F — Calendar + attention.** *Shipped in PR #192.*
  - Event marker rendering on `CalendarAgenda`, `CalendarMonth`,
    `CalendarWeek` per §9.
  - "Events only" filter chip per §9.
  - `event_today`, `event_cancelled`, `event_capacity_reached`
    in `apps/web/src/lib/attention.ts` per §8.
  - **Density-indicator unchanged**: explicit test that the
    density count excludes events. The test exists to lock
    settled decision 6 in code.

The threat-model and privacy-policy edits in this branch are the
predicate; each implementation PR cites this design doc in its
description.

## §14 Open questions

- **Per-peer-node count rendering on cross-node event views (§7.3).**
  The chosen path is to suppress the count entirely and surface
  an "RSVP at &lt;peer-node-url&gt;" affordance. The alternative is
  a per-peer tally rendered as "node B: 4 going, node C: 2 going."
  The per-peer tally is more informative for the viewer but
  produces a cross-node attendance-shape signal that might be a
  surveillance step too far. Pilot signal will tell us if the
  suppression is too aggressive in practice.
- **Per-RSVP visibility toggle (§6.3).** Rejected for phase 1.
  Open for reconsideration if pilot signal surfaces a real need
  ("I want to RSVP going but only the organizer sees my name").
  The cost is UI surface and a new column on `EventRSVP`; the
  benefit is partial-disclosure granularity. Not blocked.
- **Spam-event remediation SLA (settled decision 7).** This doc
  cites a 48-hour SLA for node-local "hide event" before community
  process kicks in via `Proposal{kind:"dispute"}`. The 48-hour
  number is a guess matching incident-template cadence; pilot
  validation recommended. The incident-templates.md entry landed
  in this PR uses the same number.
- **Cross-node organizer attribution.** An event organized by a
  member of node A and viewed on node B shows the organizer's
  pubkey but no display name (cross-node members have no local
  `Member` row, same pattern as `memberMap.get(...)` returning
  undefined for non-local authors per threat-model §7's
  availability-chips entry). Should the UI render "Member at
  &lt;peer-node-url&gt;" alongside the truncated pubkey for
  legibility? Probably yes — the threat surface doesn't widen
  (the peer-node URL is already on the wire as `nodeId`) and the
  UX cost of "who is this person organizing this thing" is real.
  Recommend yes, pending PR-E design review.
- **Capacity overflow on cross-node RSVPs.** A community-organized
  event with `capacity = 20` may legitimately fill across multiple
  nodes (12 on node A, 9 on node B, 5 on node C — 26 going, cap
  exceeded). The organizer's `event_capacity_reached` item only
  fires on local count. Is that the right shape? Phase 1 says yes
  (the organizer's planning concern is local; cross-node
  attendance is bonus). Open if pilot signal disagrees.
