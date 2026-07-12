# Understoria — Shift signups (design note)

> **Federation update (July 2026):** participation federation
> Phase 2 (`docs/project-federation.md` §6) deliberately reversed
> this note's zero-wire-bytes posture: shifts and signups now sync
> through the member's own **community node** as signed LWW state
> records (organizer-signed shifts, single-owner signups, tombstoned
> deletions/withdrawals) — because a roster only one device can see
> cannot coordinate anything. They still never cross the cross-node
> peer wire, and the §9 never-compare rule and the §9.2
> exchange-label boundary survive in full. The reversal supersedes
> `community-events.md` §11.1 as §7.3 below demands, and its
> adversary analysis is threat-model §7 "Federated participation
> records". §7's original text is kept as the design record.

> **Status:** **phase 1 shipped.** The §14 rulings were settled by
> operator adoption of every recommended default; implementation
> landed as PRs B, C, E, F per §13 (D loudly skipped, as designed),
> with the threat-model §7 paragraphs and the member/organizer
> guide sections in PR F. Read alongside
> `docs/community-events.md` (whose `Event` + `EventRSVP`
> primitives this design extends, and whose §11.6
> attendance-tracking rejection this design honors at every turn),
> `docs/community-events.md` §10.1 (project work days — the
> local-only event⇄project link shifts compose with),
> `docs/event-need-bridge.md` (the proposed need⇄event bridge,
> whose federation analysis §7 borrows), and
> `docs/task-ordering-and-dependencies.md` (the task-side
> organizing surface this complements). No threat-model §7 entry
> shipped with this work because the shape adds **zero new wire
> bytes** — see §7 and §12. One genuinely new hazard this note
> documents as a permanent boundary: the federated
> `Exchange.postId` label as an attendance side-channel (§9.2).

---

## §1 Status

**Phase 1 shipped.** The doc answered the design questions (what a
shift is, who defines one, signup semantics and visibility,
federation posture, the credit bridge and its wire trap); the four
§14 open decisions were settled by operator ruling — each adopted
its recommended default (all four defer/skip, so nothing in the
shipped surface depends on an unsettled question). Per-PR shipping
notes live in §13. What remains open is only the §14 follow-up
work those rulings deferred: a direct-exchange label design (its
own note), organizer-assisted signup, skill-matched discovery, and
co-organizer shift authority — each awaiting pilot signal.

## §2 Why now

Projects break work into tasks; tasks answer *what* needs doing
and *who* claimed it. Events put gatherings on the calendar;
RSVPs answer *who is coming*. What no primitive answers is the
question real-world mutual-aid coordination actually runs on:
**who is doing what, when — and do we have enough hands?**

The gap became visible the moment project work days shipped
(`community-events.md` §10.1). A work day is one event with one
soft capacity number. But the day itself has structure the event
can't hold:

- A community-fridge build day needs **4 people 9–12 for framing,
  2 people 12–3 for painting, and one driver at 8:30**. Today the
  organizer types that into the description and reconciles
  volunteers by DM.
- A food-distribution rotation needs **two people per Saturday
  slot**. Today each Saturday is a separate event with the slot
  math in free text.
- A member with two free hours wants to know **which two hours
  would help**. Today they RSVP "going" to a whole day and hope.

Members are already doing shift coordination — in the description
field, in DMs, on paper. The narrowest answer that satisfies the
felt need is a **local-only slot structure attached to an event**,
with signups that reuse the RSVP machinery and its settled privacy
posture. Anything broader — federated shift records, recurring
rotations, attendance reconciliation, automatic credit — is named
in §11 with the reason it's out of scope.

## §3 What a shift is (and is not)

Vocabulary, settled here because every later section depends on
it:

- A **shift** is a time-boxed, optionally-capped slot *belonging
  to an event*: "Setup crew, 9:00–12:00, 4 spots." *(Local-only at
  this writing; signed community-node state since participation
  Phase 2 — see the header note. Never to peer nodes.)*
- A **signup** is a member's declared intent to fill a shift, with
  exactly the posture of `EventRSVP` *(which likewise federates
  within the community since Phase 2)*: never exported, never to
  peer nodes.
- The **event stays the signed artifact.** The organizer's
  signature on the `Event` — with the §3 comparison card from
  `community-events.md` unchanged — remains the single deliberate,
  federated act. Shifts are planning structure layered on top,
  visible only on the node where the coordination actually
  happens, which is where claims, DMs, RSVPs, and rosters already
  live (`event-need-bridge.md` §7.4).

What a shift is **not**, stated up front because the absences are
the design:

- **Not an attendance record.** A signup is intent, never
  presence. Nothing in this design records, infers, or derives
  who actually showed up (§9, §11.3).
- **Not a claim.** Task claims (`ProjectTask.assignedTo`) are
  single-assignee work ownership with a credit path. A shift
  signup is many-hands scheduling with no ownership semantics.
  The two compose (§10.1) but never merge.
- **Not a commitment with consequences.** Removing a signup is
  one tap, surfaces no delta to other members, and carries no
  framing. Plans change; the system adapts without blaming
  anyone (`solidarity-not-shame`).

## §4 Data model

*(SUPERSEDED IN PART by participation Phase 2 — see the banner at
the top of this note. Every negative-space clause below is now
false as stated: `"event_shift"` and `"shift_signup"` ARE
`OutboxRow.kind` members, `enqueueEventShiftOutbox` /
`enqueueShiftSignupOutbox` exist in `lib/outbox.ts`, the
`POST/GET /event-shifts` and `/shift-signups` routes exist
(`apps/server/src/routes/participationStates.ts`),
`pullFederatedEventShifts` / `pullFederatedShiftSignups` live in
`lib/federationSync.ts`, and the wire shapes are signed
`packages/shared` types (`EventShiftState` / `ShiftSignupState`,
carrying `signerKey` + `signature` and tombstoned deletion). What
still binds: none of these kinds ever joins the cross-node
`peerPull` loop — sync is through the member's own community node
only. §§4.1–4.2 below are kept as the original design record.)*

Two record types. Both are **local to the node where they were
created** and **never enter the outbox**. Same posture as
`EventRsvpRow`, `BlockRow`, `EventProjectLinkRow`, and the
proposed `EventNeedLinkRow`. The contract, stated as negative
space first, per the house convention:

- **`"event_shift"` and `"shift_signup"` MUST NOT appear in
  `OutboxRow.kind`.** The union in `apps/web/src/db/database.ts`
  rejects both at the type level, asserted with `@ts-expect-error`
  in the tests.
- **No enqueue helpers.** `lib/outbox.ts` exposes no
  `enqueueEventShift`, no `enqueueShiftSignup`. The absences are
  load-bearing.
- **No routes.** There is no `POST /event-shifts`, no
  `POST /shift-signups`, no `GET …?since=` cursor for either, on
  any server, ever.
- **No pull helpers.** `lib/federationSync.ts` and
  `apps/server/src/peerPull.ts` never learn these types exist.
- **App-layer types only.** Both interfaces live in
  `apps/web/src/types/index.ts`, never `packages/shared` — the
  federation layer has no knowledge of the shapes.
- **No `signature`, no `nodeId`.** Both absences are structural:
  an unsigned row without a node id cannot masquerade as a
  federated record even if a future refactor mishandles it.
- Negative tests lock all of the above in (`eventShifts.test.ts`),
  mirroring `eventProjectLinks.test.ts`.

### §4.1 `EventShiftRow`

```ts
/**
 * Local-only shift definition — see `docs/shift-signups.md`.
 * A time-boxed, optionally-capped slot belonging to a community
 * event, on this node only. Never signed, never enqueued, never
 * pulled, never exported. Peer nodes see a plain event.
 */
export interface EventShiftRow {
  /** UUID for this shift. */
  id: string;
  /** References `Event.id` — the federated event this shift
   *  structures. The pointer never crosses the wire. */
  eventId: string;
  /** Free text, 1..100 chars: "Setup crew", "Driver",
   *  "Kitchen 12–3". The label is the whole role model — see
   *  §11.7 for why there is no structured role registry. */
  label: string;
  /** Epoch ms, UTC. Not validated against the event window —
   *  a driver shift at 8:30 before a 9:00 event is normal. */
  startsAt: number;
  /** Epoch ms, UTC. Must be > startsAt. */
  endsAt: number;
  /** Soft cap on signups; null = uncapped. Never enforced as a
   *  hard limit — same posture as `Event.capacity` (§6.4). */
  capacity: number | null;
  /** Organizer's pubkey. Re-validated against the parent
   *  `Event.createdBy` at write time (§5.1). */
  createdBy: string;
  /** Epoch ms, UTC. */
  createdAt: number;
}
```

### §4.2 `ShiftSignupRow`

```ts
/**
 * Local-only shift signup — see `docs/shift-signups.md`.
 * A member's declared INTENT to fill a shift. Same posture as
 * EventRsvpRow: never signed, never enqueued, never pulled,
 * never exported. NOT an attendance record — nothing may ever
 * compare this table against exchanges or presence
 * (`community-events.md` §11.6; `shift-signups.md` §9.2).
 */
export interface ShiftSignupRow {
  /** UUID for this signup. */
  id: string;
  /** References `EventShiftRow.id`. */
  shiftId: string;
  /** Denormalized `Event.id` for query convenience (roster per
   *  event, cleanup on cancellation rendering). */
  eventId: string;
  /** The signing-up member's own pubkey — always the local
   *  member, same as `EventRSVP.memberKey`. */
  memberKey: string;
  /** Epoch ms, UTC. */
  signedUpAt: number;
}
```

Dexie tables `eventShifts` (indexed by `eventId`) and
`shiftSignups` (indexed by `shiftId`, `eventId`, and the compound
`[shiftId+memberKey]` for the idempotency guard) at the next free
schema version (v28 at time of writing; v29 if the event↔need
bridge lands first — whichever PR merges second takes the next
number, per the usual migration discipline).

Cardinality: one event, many shifts; one shift, many signups. A
member may sign up for several shifts of the same event (framing
crew *and* cleanup is normal). Dedupe on `(shiftId, memberKey)` —
signing up twice is a no-op, same idempotency shape as
`rsvpToEvent`'s upsert.

**Soft-purge clears both tables.** Signups are
preference-shaped, identifying data (same category as RSVPs and
blocks); shift definitions are the member's organizing pattern.
**Data export excludes both**, matching `BlockRow` and the
`EXPORT_EXCLUDED_TABLES` discipline.

## §5 Authority and lifecycle

### §5.1 Who defines shifts: the event's organizer, and only them

Shifts are created from the event detail page (and optionally
inline in `EventNew` — see §13 PR C) by the event's organizer.
The data layer re-validates `createdBy === event.createdBy` at
write time — the same discipline as `scheduleProjectWorkDay` and
the §3.2 rule in `event-need-bridge.md`: a hand-crafted call from
a non-organizer writes **zero rows**. For a project work day the
event organizer is already the member who scheduled it, so
project co-organizers who should share shift authority share it
the same way they share work-day authority today: whoever
schedules the event holds its shifts. Widening to "any project
co-organizer may edit any work-day's shifts" is deliberately not
phase 1 — it would need the shift rows to re-derive project
authority on every write, and the pilot should first show whether
one-organizer-per-event is actually too narrow (§14 ruling 4).

### §5.2 Lifecycle rules

The rules are chosen so that **no new attention-rail machinery is
needed** (§8) and no member's plans are silently rewritten:

- **Add:** shifts may be added any time before the event starts
  (or before `endsAt` for long events — late-added cleanup shifts
  are normal). Members discover new shifts on the event page,
  which they are already visiting; no push, no rail item
  (`no-notifications`).
- **No edits.** A shift's label, times, and identity are fixed at
  creation — the same informed-consent reasoning as
  `community-events.md` §5: a member who signed up for
  "9–12 framing" must not wake up signed up for "7–10 demolition."
  The corrective path is delete-and-recreate, which the next rule
  gates.
- **Delete: only while empty.** A shift with zero signups may be
  deleted freely. A shift with signups may not be deleted — the
  organizer's paths are (a) conversation ("can folks move to the
  afternoon slot?" — members move themselves), or (b) cancelling
  the event, which is the existing signed, federated act whose
  `event_cancelled` attention item already reaches every RSVP'd
  member (§8). This rule is what lets the design ship with no
  `shift_changed` rail item: a shift someone committed to can
  only vanish via a channel that already tells them.
- **Capacity may be raised, never lowered below current
  signups.** Raising a cap strands no one. Lowering below the
  roster would manufacture an overflow framing ("who's the extra
  person?") that `solidarity-not-shame` rules out. Lowering to a
  number ≥ current signups is allowed (the organizer's space
  shrank; nobody is displaced).
- **The shift passes:** nothing happens. The roster stays
  readable in the settled past-tense register on the event page
  (mirroring the event↔need bridge's "was for a need that has
  been met"). No completeness prompt, no "did everyone come?"
  surface — that question is structurally unanswerable without
  violating §11.3.
- **The event is cancelled:** shifts and signups become inert —
  the event page already renders the cancellation banner and
  hides the RSVP control; it hides the signup controls the same
  way. Rows are retained (they're local and harmless) but render
  only in the cancelled event's settled view.

## §6 Signup semantics and visibility

### §6.1 A signup is a finer-grained RSVP

**Signing up for a shift routes through `rsvpToEvent` and upserts
an event RSVP of `going`** in the same transaction that writes
the `ShiftSignupRow`. This single decision does most of the
design's work:

- The **block gates compose for free**: `rsvpToEvent` already
  refuses on a mutual block with the organizer
  (`docs/blocking.md` §6) and already refuses ghost or cancelled
  events (the Round-4 guards). Shift signup inherits every one.
- The **attention rail composes for free** (§8): `event_today`
  and `event_cancelled` key off RSVP rows, so a shift member gets
  day-of and cancellation surfaces with zero new items.
- The **visibility tiers compose for free** (§6.3): the member is
  on the event roster because they are, in fact, going.

Removing a signup does **not** downgrade the event RSVP — the
member may still be attending generally. Changing the event RSVP
to `not_going` **removes all of that member's signups for that
event's shifts** in the same transaction: "I'm not coming" must
not leave their name on a slot roster (the §6.1 removal semantics
of `community-events.md`, extended). Both directions are
one-transaction atomic so no render window shows a signup without
an RSVP.

### §6.2 The informed-consent surface

The signup control extends the existing §6.2 RSVP card from
`community-events.md` — one card, not two (`deliberation-over-
speed`: the consent moment stays singular). When the tap is a
shift signup, the card reads:

```
Sign up: <shift label>, <time range>
for "<event title>"

If you sign up:
  - This also RSVPs you "going" to the event.
  - The organizer sees your name on this shift's roster.
  - Members who RSVP'd going or maybe see your name on this
    shift's roster.
  - Everyone else on this community sees spot counts only —
    not names. Other communities see neither.

If you remove your signup (any time, one tap):
  - Your name comes off the roster immediately.
  - Your "going" RSVP stays until you change it.
  - Nobody is notified. Plans change.

  [ Sign up ]    [ Cancel ]
```

The "Nobody is notified. Plans change." line is deliberate copy:
it states the `solidarity-not-shame` posture at the exact moment
a member might hesitate to commit for fear of later
embarrassment. Low-stakes commitment is the point of the feature.

### §6.3 Visibility tiers

Identical to `community-events.md` §6.1, applied per-shift:

| Tier | Sees | Does not see |
|---|---|---|
| **Non-RSVP'd member, same node** | Shift labels, times, spot counts ("2 spots open") | Names on any shift roster |
| **Peer-node viewer** | Nothing — shifts stay off the cross-node wire (§7; community-node sync since Phase 2 doesn't change this); their event page is the plain event | That shifts exist at all |
| **Organizer; member RSVP'd going/maybe** | Full per-shift rosters (names) on this node | Anything from peer nodes (doesn't exist here) |

A member who removes a signup disappears from the roster
immediately, with no delta surface ("X was signed up and isn't
anymore" is the wrong shape — same rule as RSVP downgrades).

### §6.4 Copy discipline for fill state

Spot counts render as **invitation, not deficit**: "2 spots
open", never "only 2 of 4 filled", never "understaffed", never a
red/warning treatment on unfilled shifts. A shift nobody signed
up for renders exactly like one that's half full — spots open,
come if you can. Two people is still a work party
(`community-events.md` §11.7's small-events reasoning). A full
shift renders "Full — <n> signed up" with the signup control
replaced by "ask the organizer" copy; the cap stays **soft** at
the data layer (the organizer may hand-add… no — see §11.6: there
is no organizer-adds-member affordance; the organizer's path is
raising the cap, which they control).

## §7 Federation — zero new wire bytes

*(SUPERSEDED IN PART by participation Phase 2 — see the banner at
the top of this note. §§7.1–7.3 below are the original record;
§7.2's cost analysis and §7.3's peer-wire rejection still bind the
CROSS-NODE surface, which Phase 2 left untouched.)*

### §7.1 The recommended shape: everything local

**There is NO wire change in this design.** Stated in the
explicit register the house pattern requires: no new bytes cross
any wire; an event with twelve shifts federates byte-for-byte
identical to one with none; the `"event_shift"` and
`"shift_signup"` discriminators are rejected at the
`OutboxRow.kind` type level; there is no route, no cursor, no
pull helper; and therefore **no threat-model §7 entry ships with
this note** — there is no new wire surface for one to describe
(§12 records the one documentation obligation the implementation
PR inherits instead).

### §7.2 Federated shift structure, weighed honestly and rejected

The alternative — shifts as signed child records, or a `shifts`
array on `EventPayload` — would buy peer-node viewers a read-only
view of the day's structure. What it would cost:

1. **A breaking wire change.** `canonicalEventPayload` is
   field-order-pinned; adding a field changes the signing
   preimage for every verifier, both canonicalizers, and the
   server's `parseEvent`, with a versioning story for
   already-signed events the events design deliberately avoided
   needing (`event-need-bridge.md` §7.2 point 1, verbatim
   trade).
2. **A finer-grained time-and-place beacon on a permanent
   public wire.** The threat-model §7 events entry already
   carries the residual risk of `location` + `startsAt` as a
   public signal. Shift structure sharpens it: "one driver at
   8:30, four people 9–12" is an operational schedule — when the
   space is least and most occupied, when materials move — of
   exactly the kind the §3 adversary rows (organizing employer,
   union-busting firm, stalker) would pay for. Events are
   append-only; the schedule outlives the day forever.
3. **It buys nothing a peer member can use.** Signups are local
   (§7.3), so a peer viewer couldn't act on the structure anyway
   — they'd follow the same organizer-node URL that cross-node
   RSVPs already require (`community-events.md` §7.3). Structure
   without an affordance is surveillance surface without user
   value.

### §7.3 Federated signups: permanently rejected territory

Signups are RSVPs with a time attached. Federating them is the
**federated-attendance-graph** vector `community-events.md` §11.1
already rejected, made strictly worse by per-shift time
granularity ("key X will be at location Y specifically from 9 to
12"). This note does not re-litigate it; it cites it. Any future
proposal must supersede §11.1 there, not argue with this section.
*(That is exactly what happened: Phase 2 superseded §11.1 there,
for the community-node scope only — the peer-wire rejection this
paragraph describes remains in force.)*

### §7.4 What degrades cross-node, named honestly

A peer-node viewer sees a plain event — no shifts, no spot
counts, no hint they exist. If the organizer wants cross-node
readers to know the day has structure, the event *description*
is theirs to write ("Shifts: morning framing, afternoon paint —
sign up on our node"), confirmed in front of the signing card —
the same member-chosen free-text channel that work days and need
gatherings accept as their only correlation path. A cross-node
member who wants to sign up follows the organizer-node URL, the
path cross-node RSVPs already take. Coordination lands where
coordination lives.

## §8 Attention rail — deliberately none

No new `AttentionItem` kinds, and this is a design result, not a
cut corner:

- **Day-of:** a shift member has a `going` RSVP (§6.1), so
  `event_today` already fires.
- **Cancellation:** same; `event_cancelled` already fires. The
  §5.2 delete-only-while-empty rule exists precisely so no other
  removal channel needs a rail item.
- **Fill state:** the rejected candidate is an organizer-facing
  "shift still has open spots" item. Rejected because it is
  urgency theater aimed at the organizer — a countdown-shaped
  nudge that frames an unfilled shift as a problem the organizer
  owes the system action on. The organizer sees fill state on
  the event page, which they visit because it's their event.
  `event_capacity_reached` (organizer-only, fires once) remains
  the only capacity-shaped item, unchanged.

## §9 The credit bridge — and the wire trap

The most tempting extension is the most dangerous one, so it
gets its own section.

### §9.1 What's tempting

A shift has a duration. After the work day, hours flow (this is
a timebank). "The system already knows Ana did the 9–12 shift —
just prefill the exchange" writes itself.

### §9.2 The trap: `Exchange.postId` is a federated label

An `Exchange` federates, and its `postId` field carries a
structured label — `"project:<id>/task:<id>"` for project-task
credit (`lib/timebank.ts`). The obvious design — a
`"event:<eventId>/shift:<shiftId>"` label — would put **"member
X exchanged hours in connection with event Y, slot Z"** on the
permanent public wire, signed by both parties. That is the
federated attendance graph of §7.3, rebuilt through a side door:
per-member, per-event, per-time-slot, permanent, and public. It
would undo the single load-bearing privacy decision of the
entire events design.

**Permanent boundary, recorded here:** no `Exchange.postId`
label may ever encode an event id, shift id, or any
event-derived identifier. `verifyExchangeLabel` and the
ingestion scope stay closed to any `"event:…"` prefix. A future
proposal that wants event-linked credit on the wire must first
supersede `community-events.md` §11.1 — which this note expects
never to happen.

### §9.3 What phase 1 ships instead: prefill, not plumbing

The bridge is a **local convenience with zero record linkage**:

- After a shift's `endsAt` passes, the shift roster (visible to
  the organizer and to each signed-up member for themselves) gains
  a quiet per-person "Record time together" affordance.
- It deep-links into the **existing** exchange flows with fields
  prefilled *in the form, not in the record*: hours defaulting to
  the shift duration, category from the event. Where the gathering
  composes with an artifact that already has a credit path — a
  need (`event-need-bridge.md`: the need's claim/exchange flow) or
  a project work day (the project-task confirmation flow) — the
  deep link lands there. Where it doesn't (a plain community
  event), the affordance is absent in phase 1 and §14 ruling 1
  tracks the gap.
- The resulting `Exchange` is indistinguishable on the wire from
  one recorded without shifts existing. The prefill is sugar; the
  signature ceremony, mutual assent, and `equal-time` discipline
  (the helper states *actual* hours; the shift duration is only a
  default in an editable field) are all unchanged.
- **No reconciliation, ever.** Nothing compares the signup roster
  against recorded exchanges. No "3 signed up but only 2 recorded
  hours" surface, no per-shift credit meter, no completeness
  prompt. That comparison *is* attendance tracking
  (`community-events.md` §11.6, permanent), just wearing a
  timebank costume. The negative test in the implementation PR
  asserts no such query helper exists.

## §10 Composition

- **§10.1 Project work days.** A work-day event
  (`EventProjectLinkRow`) takes shifts like any event — this is
  the headline use case from §2. The shift layer never reads the
  link table and vice versa; they meet only on the event page.
  Task claims stay orthogonal: a member might claim the "paint
  the north wall" task *and* sign up for the Saturday 12–3 shift,
  and the system connects them only in the member's own head —
  see §3 ("not a claim").
- **§10.2 Need gatherings** (proposed, `event-need-bridge.md`).
  A gathering answering a many-hands need is the second headline
  case ("eight people show up on Saturday" — that doc's §2). If
  that design lands, its events take shifts with no additional
  work; the §9.3 credit deep-link lands on the need's existing
  claim flow.
- **§10.3 Plain events.** Potlucks and skillshares take shifts
  too ("bring-a-dish drop-off crew"). No credit affordance in
  phase 1 (§9.3, §14 ruling 1).
- **§10.4 Skill discovery** — *deliberately not in phase 1.*
  "Show me open shifts matching my OFFER categories" is a
  genuinely good surface and a natural query (shift labels +
  event category vs. the member's open OFFER posts). It is
  deferred, not rejected: the discovery surface belongs with a
  broader "ways to plug in" design (Board-adjacent), and shipping
  it inside this PR ladder would smuggle a recommendation engine
  in through a scheduling feature. §14 ruling 3 tracks it with a
  recommended shape.

## §11 What this is NOT — scope exclusions and rejected shapes

Each entry names its reason; superseding one means naming why the
reasoning no longer holds.

### §11.1 No federated shift structure

**Rejected** per §7.2: breaking canonical-payload change, an
operational-schedule beacon on a permanent public wire, and no
peer-side affordance to justify either.

### §11.2 No federated signups

**Rejected** per §7.3 by citation to `community-events.md` §11.1
(federated attendance graph). Time-sliced makes it worse, not
better.

### §11.3 No attendance tracking — reaffirmed, permanently

`community-events.md` §11.6 permanently rejected attendance
tracking and no-show flags, including soft "check-in" framings.
Shifts multiply the temptation (a roster *and* a time window make
"who actually came?" feel computable) which is why this design
reaffirms the rejection explicitly: no check-in, no presence
inference, no roster-vs-exchange reconciliation (§9.3), no
"reliability" signal derivable from signup history. A member's
signup history is not queryable by any surface other than their
own signups list ("my shifts").

### §11.4 No automatic credit

**Rejected.** The system cannot know work happened, for how long,
or by whom — and pretending otherwise would put the platform's
word above the members' on the members' own labor. `equal-time`
requires the helper's stated actual hours; mutual signature
requires both parties' assent. Auto-minting on shift end fails
all three. The §9.3 prefill is the entire concession.

### §11.5 No hard capacity enforcement

**Rejected** for the same reasons `Event.capacity` is soft
(`community-events.md` §4.1): counts are local truths, and a hard
gate turns a planning aid into a bouncer. The full-shift
rendering (§6.4) is UI, not a write-layer refusal.

### §11.6 No organizer-managed rosters

**Rejected for phase 1.** The organizer defines shifts; members
place *themselves*. An "add member to shift" affordance would let
an organizer volunteer someone else's time — a consent inversion
(`event-need-bridge.md` §3.2's reasoning, pointed the other
direction). The in-person version ("put me down for Saturday,"
said aloud, organizer taps on the member's behalf) is real and
§14 ruling 2 tracks it; the default is that the member taps on
their own device.

### §11.7 No structured role registry

**Rejected.** Shift labels are free text, not a `Role` type with
a taxonomy. A role registry invites exactly the standing-
categories drift (`community-authority`: who curates the
taxonomy?) that free text avoids, and the label + event category
already carry everything discovery (§10.4) would need.

### §11.8 No recurring shifts / rotations

**Deferred with teeth.** There are no recurring events
(`community-events.md` §10 flagged recurrence's surveillance
shape — a published cadence is a pattern-of-life signal), so
recurring shifts have nothing to attach to. When/if recurrence is
ever designed, its threat-model entry owns this question. Until
then: each Saturday is an event, created deliberately, signed
deliberately.

### §11.9 No swap/trade machinery

**Rejected for phase 1.** "Can someone take my Saturday slot?" is
a conversation, and the remove-signup affordance is one tap with
no shame attached (§6.2), so the mechanical cost of the honest
path is already near zero. Swap machinery (offer my slot, accept
a transfer) is coordination-app scope creep with a new consent
surface; nothing blocks a future proposal, but it starts from
scratch.

## §12 Threat-model delta

**None — no new wire surface exists for a §7 entry to describe.**
Per the `event-need-bridge.md` §12 pattern, this section says so
explicitly, and the implementation PR inherits two documentation
obligations instead:

1. Append to the threat-model §7 entry "Federated `Event` records
   widen the public wire surface" a paragraph stating that shift
   structure and signups, like RSVPs, work-day links, and need
   links, do NOT widen that surface — local-only Dexie rows,
   discriminators rejected at the `OutboxRow.kind` type level,
   the organizer's own free-text description as the only
   member-chosen channel by which shift structure can reach the
   wire (§7.4).
2. Record the §9.2 permanent boundary — no event-derived
   identifier in any `Exchange.postId` label — in the same entry,
   so the closed side door stays visibly closed to future
   contributors reading the threat model rather than this note.

## §13 Implementation phases

Following the house PR-ladder convention, with the loud skip
named. All four phases have shipped; each entry records what
actually landed where it drifted from the sketch.

- **PR B — types + schema + locks.** *Shipped.* `EventShiftRow` +
  `ShiftSignupRow` in `apps/web/src/types/index.ts` with the full
  negative-space doc-comments; Dexie v28 (`eventShifts`,
  `shiftSignups` — the `[shiftId+memberKey]` compound backs the
  signup dedupe and `[eventId+memberKey]` backs the RSVP-downgrade
  clear); `OutboxRow.kind` doc-comment gained both
  intentional-absence notes; soft-purge + data-export exclusion
  wiring + tests. The negative tests (`@ts-expect-error` on the
  kind union, no-enqueue-helpers, no-pull-helpers,
  no-roster-reconciliation-helper per §9.3) landed in
  `eventShifts.test.ts` alongside PR C's behavioral suite.
- **PR C — data layer.** *Shipped.*
  `apps/web/src/db/eventShifts.ts`: `addShift` (organizer
  re-validation, refuses cancelled and passed events,
  endsAt > startsAt, label 1..100), `deleteShift` (refuses with
  signups, §5.2), `setShiftCapacity` (named for what it does — it
  can also *lower* to any value ≥ the current roster per §5.2, so
  the sketch's `raiseShiftCapacity` name was wrong), `signUpForShift`
  (one transaction: compose `rsvpToEvent` — inheriting its
  block/ghost/cancelled guards — then the signup write, deduped on
  `[shiftId+memberKey]`; also refuses a shift whose `endsAt` has
  passed — intent for a finished slot is meaningless), `removeSignup`,
  the RSVP-downgrade hook (a `not_going` clears that member's
  signups for the event atomically, §6.1 — `rsvpToEvent` became
  transactional to guarantee it), and query helpers
  (`listShiftsForEvent`, `listSignupsForShift`,
  `listSignupsForEvent`, `signupCountForShift`,
  `listSignupsForMember`). Tests cover the forged-authority,
  cancelled-event, and blocked-pair degradation cases.
- **PR D — server federation. LOUDLY SKIPPED.** No server work
  exists for this feature; the skip is the design (§7). Same
  loud-skip pattern as `blocking.md` §13, the task-ordering
  workstream, and the event↔need bridge.
- **PR E — UI: define + sign up + rosters.** *Shipped.*
  `EventShiftsSection` on the event detail page: shift list
  (times, labels, spot counts per §6.4 copy discipline), the §6.2
  extended consent card, per-shift roster per the §6.3 tiers,
  signed-up state + one-tap removal, organizer add-shift form
  (dates seeded from the event's day, times deliberately empty)
  and empty-shift delete, cancelled-event inert rendering. i18n
  en/es parity. One deliberate narrowing: shifts are added from
  the event page only (`EventNew` navigates there on success, so
  the sketch's "reachable from the success state" is satisfied by
  navigation, not a second form). The capacity-EDIT control — data
  layer only at first ship — later gained its UI: an organizer,
  on a live event's UPCOMING shift, gets an "Edit spots" affordance
  that reveals a number field seeded from the current cap (empty =
  uncapped). It raises or uncaps freely and lowers only to a value
  that still fits everyone signed up; the number field's `min`
  tracks the roster and the write layer (`setShiftCapacity`) is the
  authority that refuses a below-roster value (§5.2), surfaced via
  `humanizeError`. Passed shifts show no edit control (signups are
  closed — a cap change would be meaningless).
- **PR F — composition + credit prefill.** *Shipped.* The §9.3
  "Record time together" affordance renders on PASSED shifts of a
  project-linked (work-day) event, to the organizer and to each
  member on the shift, deep-linking to the linked project — where
  the existing task-confirmation flow records credit with
  claimer-stated actual hours (`equal-time` already lives there,
  so no in-form hours prefill was needed on this path; the
  in-form-prefill language in §9.3 applies to the need-claim path
  when the event↔need bridge ships). Plain events render no
  credit affordance (§14 ruling 1). Plus: the negative
  reconciliation test, the two §12 threat-model paragraph
  obligations, and the member-guide + organizer-guide sections
  (the organizer guide carries the §6.4 copy discipline as
  guidance: spots are invitations).

## §14 Open questions — RULED (operator adopted every
recommended default)

All four rulings were settled at implementation time: the operator
adopted each recommended default. The entries below keep the full
option analysis as historical record, with the ruling stamped
inline.

1. **Credit for plain-event shifts (§9.3, §10.3).** A potluck
   setup crew has no need or project to hang an exchange on, and
   `Exchange.postId` requires a label. Options: (a) no credit
   affordance for plain events (phase-1 recommendation); (b) a
   generic direct-exchange label (e.g. `"direct:<uuid>"`) with no
   event linkage, designed as its own small wire-scope addition
   to `verifyExchangeLabel`. **RULED: (a).** Plain events ship no
   credit affordance; (b) is filed as its own follow-up design —
   a direct-exchange label is useful far beyond shifts and
   deserves its own ingestion-scope review rather than riding
   this ladder.
   **Follow-up SHIPPED:** option (b) landed as the direct-exchange
   label (`docs/direct-exchange-label.md`; `isDirectExchangeLabel`
   + `verifyExchangeLabel` ingestion scope). A passed shift on a
   PLAIN event now renders a quiet "Record time together" doorway
   to shift members other than the event creator, deep-linking the
   two-signature `/record-direct` ceremony with the shift's
   duration and the event's category prefilled — FORM prefill only,
   the recorded exchange carries a random `direct:` label and
   nothing event-shaped (§9.2 boundary intact). The phase-1
   "plain events ship no credit affordance" stance held exactly
   until that independent design review cleared; it is now
   superseded.
2. **Organizer signs up a member who asked aloud (§11.6).**
   **RULED: deferred.** The member tapping on their own device is
   the consent floor, and the in-person workaround costs seconds:
   they open their own phone. Revisit only on real pilot signal.
3. **Skill-matched discovery (§10.4).** "Open shifts matching
   your offers" as a Board-adjacent surface. **RULED: deferred to
   its own design note** ("ways to plug in"), which must weigh
   the quiet-pressure risk of recommendation surfaces against
   `asking-never-gated`'s receiving-side twin: browsing stays
   browsing, never a queue assigned to you.
   **Follow-up SHIPPED:** the design note became the "Ways to plug
   in" shelf (`docs/ways-to-plug-in.md`; `lib/plugIn.ts`,
   `pages/PlugIn.tsx`, a quiet Board link). It honors that
   constraint — a browsable shelf a member opens deliberately, its
   matches ranked by their own stated offers, never a queue pushed
   at them and never gated. Open shifts surface there alongside the
   other doorways.
4. **Shift authority for project co-organizers (§5.1).**
   **RULED: deferred.** One-organizer-per-event matches the event
   authority model everywhere else; widening it is a coherent
   later step if pilots show work-day scheduling bottlenecking on
   one person.
