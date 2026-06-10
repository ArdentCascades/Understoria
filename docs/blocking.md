# Understoria — Member blocking (design note)

> **Status:** **shipped.** Design note + threat-model §7 entry +
> privacy-policy §3 and §4 amendment + incident-templates §8 + the
> short member-guide / organizer-guide subsections + the
> `co-organizer-invitations.md` §10 cross-reference landed in PR
> #193, with three settled open questions (cross-device propagation,
> previouslyBlocked retention, tap-to-reveal block-list rendering)
> folded in via PR #194. Implementation shipped across four PRs:
> shared/local types and the `OutboxRow.kind` rejection lock in PR
> #195; Dexie v24 + action helpers + soft-purge and data-export
> integration in PR #196; MemberDetail block flow + Settings →
> Blocked contacts panel + device-pairing transfer plumbing in PR
> #197; consumer-surface wiring (`isMutuallyBlocked` into feed,
> DMs, vouches, task comments, co-organizer invitations, event
> RSVPs, attention rail, and nudges) in PR #198. PR D was
> intentionally skipped — see §13. Pairs with the threat-model §7
> entry "Member blocking is a local-only personal-relief surface."
> Read alongside `docs/community-events.md` (which set the
> precedent for the local-only-not-federated `EventRSVP` pattern
> this design extends) and `docs/co-organizer-invitations.md`
> (which sets the discipline for "what a record commits the signer
> to" comparison cards). The implementation lock that `"block"` is
> not a federated record type — `OutboxRow.kind` rejecting
> `"block"` at the type level — landed in PR #195 per §13.

---

## §1 Status

Shipped. The doc + threat-model addendum + privacy-policy amendment
+ incident template + member-guide and organizer-guide updates +
the small `co-organizer-invitations.md` §10 cross-reference were
the predicate (PR #193, with follow-up clarifications in PR #194);
implementation PRs B, C, E, F shipped in sequence — see the per-PR
notes in §13. PR D was deliberately skipped (no server work). The
mute primitive, bulk block / import-block-list, taxonomized block
reasons, and the already-paired-device sync gap remain out of scope
per §10 and §14.1.

**Block is self-help, not community judgment.** This needs to be
said first because every other section depends on it. A block is
the blocker's own private decision to stop interacting with a
specific other member. It is parallel to but independent of the
community dispute process (`GOVERNANCE.md` §5). A member may block
AND file a dispute simultaneously; the block takes effect
immediately, the dispute follows community process at its own pace.
A block:

- does NOT file a flag,
- does NOT surface to moderators or to community-role holders,
- does NOT appear on any proposal, vote, or governance surface,
- does NOT federate to any peer node,
- does NOT signal anything to the blocked party.

The right way to think about block in this codebase: it is to
disputes what the panic button (`docs/member-guide.md` §15) is to a
formal incident report. The panic button is immediate personal
safety; the incident report is community process. Both have a
place. Neither replaces the other.

## §2 Why now

The operator framing is: **members need a way to stop unwanted
interaction immediately, even while the slower community process
runs.** Pilot signal from the operator: members in early-pilot
contexts have privately reported that, in the gap between "this
person has been a problem for me" and "I am ready to file or
participate in a community dispute," they need a one-tap personal
relief surface. Without it, the only options are (a) keep enduring
the unwanted contact while the dispute proceeds, (b) leave the
community entirely, or (c) build informal workarounds (mute by
ignoring notifications, scroll past, decline DMs without context)
that make the silence asymmetric and ambiguous in ways that compound
the underlying harm.

A block primitive is the narrowest answer that satisfies the felt
need. Anything broader — a federated reputation signal, an
aggregated mass-block surface, a "block list" visible to other
members — is named in §11 with the reason it's out of scope.

The block / dispute distinction is the most load-bearing framing in
this document, so it gets said again here at the top of §2:

| | Block | Dispute |
|---|---|---|
| Whose decision | The blocker's, alone | The community's, deliberated |
| Who knows | Only the blocker | The community process records the proposal publicly per `GOVERNANCE.md` §5 |
| Effect on the other party | None they can detect | Community process per `GOVERNANCE.md` §5 |
| Effect on the blocker | Immediate personal relief from unwanted interaction | Whatever the community process decides |
| Federation | None — local only | Through the existing `Proposal{kind:"dispute"}` federation surface |
| Reversibility | Instant, by the blocker | Per the proposal's own resolution |
| When to use | When you need quiet now | When the issue is the community's to weigh |
| Use together? | Yes — see §1 | Yes — see §1 |

The threat-model entry landed in this same PR documents the
adversary-mapping reason this primitive stays local-only: federated
block graphs are a high-value target for the very adversaries
threat-model §3 names (employer, union-busting firms, stalker), and
the EventRSVP precedent shows the architecture has the discipline to
keep a meaningful primitive entirely local.

## §3 What blocking commits to

Same discipline as `docs/co-organizer-invitations.md` §3 and
`docs/community-events.md` §3. The values commitment is that the
blocker sees, on the block-creation surface, what blocking does
*before* they confirm. Not in a tooltip; in a comparison card.

There are two block-creation paths, depending on the blocker's
choice of the `hideGovernance` toggle. The first card is the
default (recommended) path. The second card is the opt-in
"also hide their governance contributions from me" path.

### §3.1 Default block

> **What this means.** You will stop seeing this member's posts,
> projects, events, vouches, task comments, and DMs in your view.
> You will not be able to issue them a vouch, RSVP to their events,
> claim their posts, or invite them to co-organize a project; the
> same is true in reverse from their side, silently. Their proposals,
> votes, and dispute comments will still be visible to you — the
> community process is something everyone in the community sees.
> The block is private to you. The other member is not told.

> **What this does NOT mean.** You are not flagging this member to
> moderators or to the community. No record federates anywhere. No
> dispute is filed. Existing exchanges, vouches, co-organizer roles,
> and claims between you both stand and complete through their
> existing flow — block engages prospectively only. The block does
> not retroactively undo any past signed record. You can unblock at
> any time.

The comparison card on the MemberDetail page (see §13 PR E) renders
this as:

```
Block contact: <member short name or pubkey>

What this means

  ✓  You will stop seeing their      Posts, projects, events,
     content                          vouches, task comments, DMs in
                                      your view will be suppressed.
  ✓  Future interaction is blocked    You won't be able to issue a
     in both directions               vouch, RSVP, claim a post, or
                                      invite them to co-organize.
                                      The same applies to them
                                      reaching you, silently.
  ✓  Their governance voice still     Their proposals, votes, and
     reaches you                      dispute comments stay visible
                                      to you. (You can change this
                                      below.)
  ✓  Private to you                   The other member is not told.
                                      No record federates anywhere.

What this does NOT mean

  ◯  Filing a complaint               This is your own personal
                                      relief surface. To raise a
                                      community concern, open a
                                      Proposal — block and dispute
                                      can run together.
  ◯  Erasing past interactions        Existing exchanges, vouches,
                                      co-organizer roles, and
                                      pending claims complete
                                      through their normal flow.

  [  ] Also hide their governance contributions from me
       (proposals, votes, dispute comments). You can flip this any
       time from Settings → Blocked contacts.

  Private note to yourself (optional, never shared):
  [                                                              ]

  [ Cancel ]    [ Block contact ]
```

The "What this does NOT mean" half exists for the same reason it
exists on the events create-card and the co-organizer-acceptance
card: a blocker who thinks block is community signal will be
surprised when no moderator hears about it; a blocker who thinks
block retroactively unsigns past records will be surprised when
the old `Exchange` rows still appear in their history. Naming the
absences up-front is how the system avoids those false
expectations.

### §3.2 Block with governance hidden

> **What this means.** Everything in the default card, *plus* this
> member's proposals, votes, and dispute comments will be hidden
> from your view. They will still appear to every other member in
> the community — your choice to look away does not silence them.

> **What this does NOT mean.** This is not disenfranchisement. The
> blocked member's governance voice still reaches every other
> member of this community. The system-level invariant is that
> their participation in community decisions is unchanged; the only
> thing that changes is that you stop seeing it for yourself, by
> your own informed choice. You can flip this back at any time
> from Settings → Blocked contacts.

When the blocker ticks "Also hide their governance contributions
from me" in the §3.1 card, the comparison-card shape gains one
additional row in the "What this means" column:

```
  ✓  Their governance voice is        Their proposals, votes, and
     hidden from you                  dispute comments will not
                                      appear in your view. They
                                      will still appear to every
                                      other member of the community.
```

…and the corresponding `What this does NOT mean` gains:

```
  ◯  Silencing their community voice  Every other member still sees
                                      their proposals, votes, and
                                      dispute comments. Only you,
                                      by your own choice, stop
                                      seeing them.
```

The framing is deliberate. The default path keeps governance
visible because `community-authority` says governance is a
collective surface — silently disenfranchising one half of the
relationship (the blocker no longer hears the blocked party's
governance voice, regardless of intent) is a community-process harm
that the system should not impose by default. The opt-in path
respects the blocker's autonomy over their own experience: if
hearing this member's voice in any context — even in governance — is
the unwanted contact the blocker is trying to escape, they get
that. The system-level invariant (the blocked party's voice still
reaches the rest of the community) is preserved either way.

This is the only place in the codebase where a member can choose to
silence governance content for themselves. The choice is per-block,
reversible from Settings, and stored as the boolean
`hideGovernance` on the `Block` row (see §4).

## §4 Data model

A single record type. Local to Dexie. Never federated.

```ts
// LOCAL ONLY — Dexie table `blocks`. Not signed. Not federated.
// Never enters the outbox. Excluded from data export.
// Soft-purge clears the table. Personal-relief data; never
// surfaced to any peer or to any non-blocker on this node.
//
// The OutboxRow.kind union REJECTS the string "block" at the type
// level (asserted in PR B with `@ts-expect-error` per §13). The
// federation layer has no knowledge of this type.
export interface Block {
  id: string;               // uuid
  blockerKey: string;       // always the local member's own key
  blockedKey: string;       // the pubkey of the blocked member
  createdAt: number;        // epoch ms, UTC
  hideGovernance: boolean;  // default false — see §3.2
  note: string | null;      // blocker's own private note, ≤ 500 chars;
                            // NEVER surfaced anywhere external. UI
                            // shows this only in Settings → Blocked
                            // contacts, on the blocker's device.
}
```

Explicitly absent fields, and why:

- **No `signature`.** This is not a signed record. There is no
  cryptographic act because there is nothing to verify against —
  no peer ever reads this row, no audit trail outside the
  blocker's own device cluster needs to exist. Same shape as
  `EventRSVP` (see `docs/community-events.md` §4.2).
- **No `nodeId`.** This is not a federated record. The discriminator
  string `"block"` MUST NOT appear in any `OutboxRow.kind`, in any
  federation route, in any peer-pull cursor. Same precedent as
  `EventRSVP`.
- **No "block reason" field surfaced to anyone.** The `note` field
  exists for the blocker's own reference — "blocked because of the
  Tuesday DM thread" type private memory. It is never sent over a
  wire, never surfaced to the blocked party, never aggregated. The
  500-character cap is to keep it a memory aid rather than a
  drafting surface for a longer accusation.

### §4.1 "Previously blocked" local history

When the blocker unblocks (see §5), the `Block` row is deleted from
the `blocks` table. A short row is written to a separate local
`previouslyBlocked` table:

```ts
// LOCAL ONLY — Dexie table `previouslyBlocked`. Same federation
// posture as `blocks`: never synced, never exported, never
// federated. Wiped on soft-purge.
export interface PreviouslyBlocked {
  blockedKey: string;          // the pubkey of the previously-blocked member
  firstBlockedAt: number;      // earliest createdAt across all Block rows for this pair
  lastUnblockedAt: number;     // most recent unblock time
}
```

The history exists so a blocker who is considering re-blocking the
same member can see "I've done this before, on these dates." It is
not a community signal. It does not affect any visibility
calculation. It is a personal memory aid in Settings → Blocked
contacts → Previously blocked. Same soft-purge behavior as
`blocks`.

## §5 Lifecycle

```
nothing → blocked → (optional toggle of hideGovernance) → unblocked
```

That's it. A block is a single Dexie row. The only legal mutations
to it after creation are:

- **Toggle `hideGovernance`.** Flip from false to true or back. No
  other field changes. The blocker can do this from the comparison
  card at block-creation time or from Settings → Blocked contacts
  → Edit on the row.

- **Unblock.** Delete the row from `blocks`. Write the corresponding
  `previouslyBlocked` row (or update its `lastUnblockedAt` if a
  prior history row exists for this pair).

Re-block after unblock is allowed and creates a new `Block` row
with a new `id` and a fresh `createdAt`. The `previouslyBlocked`
row for this pair is left in place; the new `Block` row is the
authoritative current-state record. There is **no cooldown** on
unblock-then-reblock (see §11 for why).

No edits to the `note` field after creation is allowed in phase 1
beyond a single "Edit note" affordance from Settings (this is a
private memory aid; the blocker should be able to update it as the
situation evolves). The implementation may choose to back this with
a row-level write rather than a separate change-log table; the
note's history is not auditable to anyone.

## §6 Scope of block

This is the values-load-bearing section. The table below enumerates
every consumer surface where the block affects rendering or action,
the semantic decision letter (see legend), and the principle
citation. Each row is then expanded into a paragraph explaining the
choice.

**Legend:**
- **a** — hide-from-blocker. The blocked party's contributions are
  suppressed from the blocker's view. The blocked party can still
  produce them; they reach every other member normally.
- **b** — prevent-blocked-from-initiating. The blocked party cannot
  initiate the action toward the blocker; the UI affordance is
  disabled on their side. (For symmetry, the same affordance is
  disabled on the blocker's side too — the table calls this out
  per row.)
- **c** — both. Bidirectional gate: hide from the blocker, prevent
  initiation in either direction. The most common shape for
  surfaces that involve direct interaction.
- **d** — leave-alone. The block has no effect on this surface.

| Surface | Semantic | Notes |
| --- | --- | --- |
| DMs / Messages | c | bidirectional gate; sender side stores locally but recipient never renders (silent fail matches the existing no-delivery-receipt model). The block ACTION can also be INITIATED from the conversation view via the header menu (see §13) — distinct from the GATE behavior on this row. |
| Posts (feed visibility) | a | hide blocked party's posts from blocker's feed; their posts still federate to peers |
| Posts (claiming) | c | rejects claim attempts in either direction with a GENERIC "Post no longer available" — never block-specific copy |
| Vouches (issuing) | c | cannot issue in either direction; existing signed vouches are immutable and stay |
| Vouches (rendering) | a | vouches by the blocked party hidden from blocker's profile view of their vouchers |
| TaskComments | a | hide from blocker's view; blocked party can still comment (we do not conscript project authority) |
| Dispute / Proposal comments | a (only if `hideGovernance: true`) | system default keeps governance visible; per-block opt-in hides |
| Proposal votes | a (only if `hideGovernance: true`) | same |
| Projects (visibility) | a | hide blocked-organized projects from blocker's view |
| Co-organizer invitations | b | disable invite UI in either direction; existing co-org status unaffected |
| Events (visibility) | a | hide blocked-organized events from blocker's calendar / list |
| Events (RSVP) | c | reject RSVP in either direction |
| Attention rail items | a | suppress items whose subject is the blocked party |
| firstActionNudge / profileNudge | a | suppress |
| Block-list rendering (Settings) | (separate) | obscured-by-default per row; tap-to-reveal — see §6.2 below. Privacy-from-overshoulder, NOT a security boundary. |

### §6.1 Generic-error discipline (the rule that holds the table together)

**Every blocked-from action returns the same generic message a
not-found / not-available action returns.** Never block-specific
copy. The error the blocked party sees on a rejected claim is
identical, byte-for-byte, to the error any member would see
claiming a withdrawn post. The rejected RSVP looks like an RSVP to
a cancelled event. The disabled co-organizer invite affordance
looks like the affordance is disabled for any reason.

This preserves the shadow-on-blocked-side decision. If the system
emitted "you cannot do this because they blocked you," the block
would be a delivery-receipt-grade signal in stalker contexts —
exactly the escalation `no-read-receipts` (and the rationale in
threat-model §3 row 7) is written to prevent. The generic-error
shape means the blocked party cannot fingerprint which not-found
errors are blocks and which are real not-founds; the difference is
not legible from their side.

This discipline applies even when it costs a bit of UX honesty in
the non-block case. A member trying to claim a withdrawn post will
see the same message as a member trying to claim a post from
someone who blocked them. That's fine — the not-found shape is the
true generic case, and the block case is folded into it.

### §6.2 Per-surface rationale

**DMs / Messages (c — both).** Direct messages are the
highest-intent direct-interaction surface in the app. Blocking
gates them in both directions. The sender side stores the outgoing
message locally (consistent with how DMs work today; no delivery
receipt model), but the recipient never renders it. This is the
silent-fail shape that matches the existing
no-delivery-receipt-for-DMs model — a sender on the blocked party's
side gets the same lack of read receipt they would get from any
unanswered DM today. Cited: `no-read-receipts`.

**Posts (feed visibility) (a — hide-from-blocker).** The blocked
party's posts continue to federate to peer nodes; the blocker
simply doesn't see them in their own feed view. This is the
minimum-surface mitigation: the blocker no longer encounters the
unwanted contact at the feed level, while the blocked party's
participation in the federation is untouched. Cited:
`solidarity-not-shame` (the blocked party's mutual-aid offers
still reach every other member — the system does not punish them
for being blocked by one person).

**Posts (claiming) (c — both).** Claiming is a direct interaction
— it commits the claimer's identity to the post's owner as a
helper. The blocker shouldn't be silently signing up to help
someone they've blocked; the blocked party shouldn't be silently
inserted as a helper for the blocker. Both attempts are rejected
with the generic "Post no longer available." Cited:
`privacy-precondition` (no surprise interactions across a block).

**Vouches (issuing) (c — both).** A vouch is a signed identity
commitment. Issuing a vouch in either direction across a block
would be incoherent with the block's purpose. Cited:
`community-authority` (vouches are a community-trust act; the
right shape is to not issue, not to surface a federation-grade
warning). Existing signed vouches are immutable and stay — the
block engages prospectively only (the unifying rule from settled
decision 6).

**Vouches (rendering) (a — hide-from-blocker).** When the blocker
views the profile of a member who happens to have a vouch from the
blocked party, the blocked party's vouch row is suppressed in the
blocker's view. The vouch still exists, still federates, and still
appears in everyone else's view. Cited: same as vouches-issuing —
the system honors the blocker's choice to stop seeing this
member's contributions while leaving the federation surface
unchanged.

**TaskComments (a — hide-from-blocker).** Comments by the blocked
party are hidden from the blocker's view of any task they share
context on. We do **not** prevent the blocked party from commenting
— that would conscript project authority (the project organizer,
not the blocker, governs the project's comment surface). Cited:
`community-authority`. This is one of the cases where the
asymmetry (the blocker stops seeing; the blocked party keeps
participating) is deliberate.

**Dispute / Proposal comments (a, only if `hideGovernance: true`).**
The system default is to leave governance visible. Cited:
`community-authority` — silently disenfranchising the blocker from
the blocked party's governance voice would be a community-process
harm. The per-block opt-in (`hideGovernance: true` on the Block
row, set in the §3.2 card or toggled from Settings) hides them
from the blocker's view; the system-level invariant — the blocked
party's voice still reaches every other member — holds either way.
The choice is the blocker's, made with informed comparison-card
context, and reversible at any time.

**Proposal votes (a, only if `hideGovernance: true`).** Same
treatment as dispute / proposal comments, same rationale, same
opt-in.

**Projects (visibility) (a — hide-from-blocker).** Projects the
blocked party organizes are hidden from the blocker's project
list, calendar markers, and search. The projects still exist and
federate normally to every other member. Cited:
`solidarity-not-shame` — same reasoning as posts-feed-visibility.

**Co-organizer invitations (b — prevent-blocked-from-initiating).**
The invite UI is disabled in either direction. The blocker cannot
send a co-organizer invitation to the blocked party (the picker
filter excludes them); the blocked party cannot send a
co-organizer invitation to the blocker (the would-be invitation's
issue surface is gated; see the §10 cross-reference into
`co-organizer-invitations.md`). Existing co-organizer
relationships are unaffected — the unifying rule that work in
flight finishes through its existing flow. If the blocker wants
to step back from a shared co-organizer role, the path is the
existing self-removal (PR #171), not the block. Cited:
`community-authority` (a block is not a community decision to
strip a role).

**Events (visibility) (a — hide-from-blocker).** Events organized
by the blocked party are hidden from the blocker's calendar, event
list, and search. The events still federate normally to every
other member. Cited:
`solidarity-not-shame`. Same shape as projects-visibility.

**Events (RSVP) (c — both).** RSVP is a direct attendee signal to
the organizer. Blocking gates RSVP in either direction. The
blocker cannot RSVP to the blocked party's events (the affordance
is disabled with the same generic "not available on this node"
message that cross-node RSVP uses, per
`community-events.md` §7.3); the blocked party cannot RSVP to the
blocker's events (the local RSVP-write is silently rejected, per
the EventRSVP local-only shape). Cited:
`privacy-precondition` (attendance is a direct-interaction
disclosure across a block, which the block exists to prevent).

**Attention rail items (a — hide-from-blocker).** Items whose
subject is the blocked party — for example, an attention item that
would surface "X invited you to co-organize" if a stale invitation
exists across a block — are suppressed from the blocker's
attention rail. The blocker does not get pulled-attention signals
that route them back toward the blocked party. Cited:
`no-notifications` (the attention rail is the pull surface; we
respect the blocker's choice that the blocked party's content is
not what they came back to look at).

**firstActionNudge / profileNudge (a — hide-from-blocker).** The
onboarding nudges that suggest "vouch for X" or "say hi to X"
silently exclude blocked members from their candidate pool. The
blocker is not nagged toward the very person they blocked. Cited:
`no-notifications` + `solidarity-not-shame`.

**Block-list rendering (Settings) (separate — obscured-by-default;
tap-to-reveal).** The Settings → Blocked contacts panel — covering
both the active `blocks` list and the `previouslyBlocked` history
— renders each row with a generic avatar, the literal copy
"Blocked contact," and the block date by default. The display
name and truncated pubkey for any row are revealed only by tapping
that row; a second tap re-obscures. Reveal state is per-row and
ephemeral — never persisted. The threat model for this row is
**device-access from over the shoulder**: someone glancing at the
blocker's screen while they scroll Settings, or a borrowed device
left briefly with someone else. It is explicitly **NOT a security
boundary** — the data is in Dexie, accessible to any code with
storage access on the unlocked device, and the residual-risk
paragraph in `docs/threat-model.md` §7 names this exactly. The
comparison-card create flow (`block.create.confirm.*`) is
unaffected — when the blocker is actively choosing whom to block,
they have explicitly chosen the target, and obscuring the target
on the confirm card would be theater. Cited:
`privacy-precondition` (the blocker decides how their own list
surfaces; the system minimizes incidental exposure).

### §6.3 Cumulative invariant

Across every row of the §6 table, the following invariant holds:

> The blocked party's participation in the community is unchanged
> from every other member's view. The block only changes what the
> blocker sees and what either party can initiate toward the other.
> No surface aggregates blocks, exposes block status to a third
> party, or surfaces "this member has been blocked by N people."

This is what `solidarity-not-shame` requires of a block primitive
in this codebase. A primitive that allowed the community to see
"X has been blocked by 14 people" would turn block into a mob
signal — exactly the shape that `community-authority` and
`solidarity-not-shame` rule out. The block stays a private
relationship between the blocker's device cluster and the
blocked-key value it stores.

## §7 Federation: what does NOT federate

**The entire block surface stays on the blocker's device.** This is
the load-bearing federation decision in this design, said in the
same shape as `docs/community-events.md` §7's RSVP carveout.

What does NOT federate:

- **`Block` rows.** Never enter the outbox. The discriminator
  string `"block"` MUST NOT appear in any `OutboxRow.kind`. PR B
  asserts this with `@ts-expect-error` (see §13). There is no
  `POST /blocks` route. There is no `GET /blocks?since=` cursor.
  There is no PWA-side `pullFederatedBlocks`. The Dexie table
  `blocks` is read locally and written locally and that's the
  entire story.

- **The `previouslyBlocked` history.** Same posture. Never enters
  the outbox. Never exported. Wiped on soft-purge.

- **The `hideGovernance` flag.** A field on a non-federated record;
  it has no separate federation life of its own. Named here
  explicitly so a future contributor doesn't read "hideGovernance
  controls governance display" as a hint that there's a
  federated-governance-visibility primitive somewhere. There
  isn't. There never will be.

- **The blocker's private `note` field.** Same.

Cited threat-model §3 rows benefiting from this local-only posture:

- **Row 1 (Employer / management).** A federated block graph would
  let an employer harvesting the public peer wire correlate
  "organizer X has blocked these specific other members" as a
  signal of social fractures inside the organizing group. The
  local-only posture closes this vector entirely: there is no wire
  to harvest. Even a determined adversary with full peer-pull
  access learns nothing about who has blocked whom.

- **Row 2 (Union-busting firms).** Professional surveillance
  treats relational graphs (who-trusts-whom, who-helps-whom,
  who-has-cut-off-whom) as primary intelligence. A federated
  block graph would hand them a relational-fracture map for free.
  The local-only posture means the map does not exist.

- **Row 7 (Intimate-partner / stalker).** A stalker who learns
  their ex has blocked them gains both a direct retaliation
  trigger ("she blocked me — now I know to escalate") and a path
  to bypass the block (move to a peer node and observe whether
  the block persists across nodes). Local-only with no signal to
  the blocked party closes both vectors: there is no notification,
  there is no global state, and a determined stalker who switches
  nodes is not "evading the block" — they are just being on a
  different node, where the blocker's local-only data does not
  reach.

### §7.1 Acknowledged residual

A determined blocked party can open the PWA on a peer node and
view the blocker's federated public content there. They can see
the blocker's posts, projects, events, vouches — the same content
any peer-node viewer can see. **This is not a leak. This is
federation.** The blocker's federation-grade public surface is by
design visible across the federation; the block is not a tool to
withdraw federation-grade content from the wire (that's not what
this primitive does, and a primitive that tried would be a
cross-node-purge surface, which has its own much larger
threat-model surface and is explicitly out of scope).

The blocker's relief is from *interaction* with the blocked party,
not from the blocked party's *ability to observe* federated public
content. The threat-model §7 entry landed in this PR names this
distinction explicitly so neither a member nor a future contributor
mistakes the boundary.

## §8 Attention rail

**None added.** The block creates no attention rail item, in either
direction. Cited: `no-notifications`.

- On the blocker's side: blocking is a one-way affordance the
  blocker initiates from MemberDetail or Settings. There is no
  attention item to "confirm your block" or "remind you of your
  blocks." Settings → Blocked contacts is the pull surface for the
  blocker's own reference.
- On the blocked party's side: by design, there is no signal at
  all (settled decision 2, §1).

Surfaces that previously *would* have rendered an attention item
related to the blocked party — for example, "X invited you to
co-organize," issued before the block engaged but not yet resolved
— are handled in the §6 attention-rail row: such items are
suppressed from the blocker's attention rail per
`hide-from-blocker` semantics. The unifying rule "work in flight
finishes" (settled decision 6) still applies; the suppression is
of the *pulled-attention shape*, not of the underlying invitation.
The blocker can still find and respond to the invitation from the
project page if they want to.

## §9 Calendar integration

**None directly.** The block has no separate calendar surface.
Events organized by the blocked party are suppressed from the
blocker's calendar via §6's Events (visibility) row — the existing
calendar code reads from `effectiveEvents()` (or equivalent), which
gains an `isMutuallyBlocked` filter in PR F. There is no
"blocked-from calendar marker," no "block timeline view," no
calendar-level block annotation.

The density indicator (`docs/calendar.md` §8.2) stays
exchange-keyed and is not affected. Blocks are not exchanges; they
do not enter density calculations.

## §10 Phase 2 / not in scope here

- **Mute.** A strictly weaker primitive than block — hide from feed
  without gating direct interaction. The audit (Part 2) names mute
  as a possible phase-2 addition. It may or may not ship; depends
  on pilot signal from the block primitive. The pilot question is
  whether block-only collapses real cases of "I want to see less
  of X without the all-the-way commitment of blocking them" into
  "I should just block, then," which is fine, versus into "I keep
  enduring the unwanted content because block feels too final,"
  which is the signal that mute would help. We document but do not
  commit.

- **Bulk block / import-block-list.** Out of scope. A bulk path
  would invite the same "block as a community signal" drift that
  the §11 rejected alternatives rule out — a "block list" you can
  copy from a friend is a privatized moderation tool, not personal
  relief. If a pilot community surfaces a real need, revisit then,
  not now.

- **Block reasons taxonomized for analytics.** Permanently out of
  scope. The `note` field is free-text and private; there is no
  schematized reason taxonomy. A reason taxonomy would create the
  shape of categorized harm-counting that is not this app's job.

## §11 Rejected alternatives

Each rejection names the reason. The list is the contract — a future
contributor proposing one of these supersedes the rejection by
naming why the reasoning here no longer holds.

### §11.1 Federated signed Block records

**Rejected.** A federated, signed `Block` record would let the
blocker's choice propagate across peer nodes (so the same block
applies wherever the blocker logs in) and would create a verifiable
audit trail for each block.

The cost is exactly the surveillance surface threat-model §3 rows
1, 2, and 7 are written to prevent. A public wire that carries
"key X blocked key Y at time T" hands an employer (row 1) a map of
organizing-group social fractures, hands a union-busting firm
(row 2) a relational-fracture intelligence product they would
otherwise have to spend money to gather, and hands a stalker
(row 7) a direct notification surface plus a path to test whether
a block engaged. None of these benefits scales with the value of
the federated block — a per-blocker cross-node consistency win is
strictly smaller than any of these surveillance harms.

Precedent: `community-events.md` §11.1 (Federated RSVPs) and
`community-events.md` §4.2 (EventRSVP local-only). The same
architectural posture — meaningful primitive that stays entirely
local because federation would create a surveillance graph — applies
here.

### §11.2 Public block list visible to other members

**Rejected.** A "block list" surface (each member's profile shows
"this member has blocked these N other members," or each member
can see their own block list publicly) was considered.

Cited: `solidarity-not-shame`. A public block list turns the act
of blocking into a community signal — the more public a block, the
more it functions as social shaming of the blocked party. That's
the wrong shape for a primitive whose job is private personal
relief.

Also cited: `privacy-precondition`. The block list is the
blocker's data, not the community's. Surfacing it publicly would
re-introduce the very exposure model `privacy-precondition` is
written to prevent — a relational-graph signal pulled out of
private memory and onto a community-visible surface.

### §11.3 Mass-block aggregation surfaced to moderators

**Rejected.** A surface that tells moderators "member X has been
blocked by N other members" or "member X is the most-blocked
member in the community" would be a privatized moderation signal:
turn the aggregate of private blocks into community judgment by a
side door.

Cited: `community-authority`. Community judgment about a member
goes through the proposal and dispute process, not through a
moderator dashboard that aggregates private signals. If a
moderator (or community) needs to deliberate about a member's
behavior, the right tool is the `Proposal{kind:"dispute"}` shape
— deliberately and publicly. The block-aggregation shortcut would
collapse the deliberative shape into a count and route it through a
moderator-side surface that doesn't exist for any other community
judgment.

The §8 incident template ("Member holding community role faces
mass conscientious objection") is the documented response when the
operator becomes aware, through members voluntarily disclosing,
that a community-role holder is the subject of widespread blocks.
The template explicitly routes this to `GOVERNANCE.md` §3
(rotation) and §5 (appeals) — not to a moderator action.

### §11.4 Special-class members who cannot be blocked

**Rejected.** A carveout where community-role holders (moderators,
node operators) cannot be blocked was considered. The argument for
it would be: "moderators need to be able to reach every member to
do their job."

Cited: `community-authority`. A carveout that creates a member
class who cannot be blocked by other members is precisely the
admin role `community-authority` forbids. The same individual is
both a member with the same blocking power as any other member,
and a community-role holder whose role is bounded by the rotation
cadence (`GOVERNANCE.md` §3) and the appeals process
(`GOVERNANCE.md` §5). The right response to "half the community
has blocked the moderator" is rotation and appeals, not a
technical carveout.

The §8 incident template is the explicit operator-facing version
of this rejection. It documents the routing: no depeering, no
auto-suspend, no aggregate-block dashboard, no carveout. Just
rotation and appeals.

### §11.5 Mute-first ordering

**Deferred — block-first is the right order.** Mute (hide-from-feed
without interaction gating) is strictly weaker than block. The
audit (Part 2) names mute as a candidate. Block-first is the right
order because "immediate relief from unwanted interaction" is the
operator's framing of the felt need; mute alone doesn't satisfy
that need (the blocker still receives DMs, vouches, claims,
invitations). Mute is fine as a phase-2 addition (see §10) if
pilot signal shows the gap; mute-first inverts the priority.

### §11.6 Block button on every feed card

**Rejected.** A block affordance on each PostCard, EventCard,
ProjectCard, and TaskComment was considered.

Cited: `solidarity-not-shame`. A feed-level block affordance would
rank blocking as a casual, glance-and-tap action — turning block
into the kind of one-tap response that the rest of the codebase
(no like buttons, no upvotes, no leaderboards) deliberately avoids.
Block is a deliberate act; it gets a deliberate surface
(MemberDetail and Settings — settled decision 4). If a member
feels strongly enough to block, they can tap through to
MemberDetail. The friction is the value.

### §11.7 Cooldown on unblock-then-reblock

**Rejected.** A rate limit on the unblock → re-block path (so
flipping the block on-off-on-off rapidly would be lockout-gated)
was considered.

A cooldown would imply blocks are a community signal that needs
rate-limiting against gaming. They aren't. Block is private
self-help; the blocker can re-block immediately, again, with no
cost to anyone but the blocker's own attention. No federation
record, no community surface, no third-party impact — nothing to
rate-limit. Cited: the cumulative invariant in §6.3.

### §11.8 Block notification to the blocked party

**Rejected.** A signal to the blocked party (in-app message,
attention rail item, marker on the blocker's profile from their
side) was considered.

Cited: `no-read-receipts`. This is the read-receipt-equivalent of
the block primitive: telling the blocked party "you've been
blocked" is exactly the information `no-read-receipts` is written
to withhold. Plus the threat-model §3 row 7 concern: a stalker
who is notified of the block gains an escalation trigger that
would not otherwise exist.

The blocked party sees a generic "post no longer available" / "not
a valid RSVP target" / "invite affordance disabled" on the
specific actions they attempt across the block (§6.1 generic-error
discipline), but never a block-specific message. Whether each
"not available" is a block, a withdrawn post, a cancelled event,
or an organizer's role change is not legible from the blocked
party's side. That's the shadow.

### §11.9 Auto-block-when-N-members-have-blocked

**Rejected.** A system-side rule that, when N members have blocked
the same individual, automatically blocks that individual for
every member of the community was considered.

Cited: `community-authority`. This would be the system imposing a
community-wide consequence based on an aggregate of private
signals — exactly the privatized-moderation shape §11.3 rejects.
Plus `solidarity-not-shame`: a community-wide block is a
community-wide expulsion-by-side-door, which is not what the
governance process is for, and not what the block primitive is
for.

The right response to "many members have privately blocked this
person" is governance, not automation. The §8 incident template
names this routing.

### §11.10 System-default filtering of governance content

**Rejected.** Hiding the blocked party's proposals, votes, and
dispute comments from the blocker by default was considered.

Cited: `community-authority` (no silent disenfranchisement) and
informed personal autonomy (the blocker is the one who knows
whether seeing this voice in governance is the unwanted contact
they need to escape, or whether they want to keep seeing it). The
per-block opt-in (`hideGovernance` on the Block row, set on the
§3.2 card with a comparison-card explanation of the consequence)
puts the agency in the blocker's hands. The system default —
governance visible — preserves the community-process invariant
that everyone in the community sees the governance voice of
every member; the per-block opt-in respects the blocker's choice
to silence it for themselves.

### §11.11 Permanent obscuring of the Settings block list

**Rejected.** A variant of the tap-to-reveal affordance (see §6
"Block-list rendering" row and §6.2) was considered in which the
display name and pubkey of every row in Settings → Blocked
contacts would be **permanently** obscured — generic-avatar-only
plus a truncated pubkey fragment, with no per-row reveal.

Cited: the blocker has to be able to identify *who they are
unblocking* before they tap Unblock; the per-row note field is a
private memory aid but is not a substitute for confirming
identity. A pubkey-only flow would force the blocker to
fingerprint-compare an opaque hex string before every unblock,
which is worse for the common case and trains the blocker to
unblock without actually verifying who. Tap-to-reveal preserves
the privacy-from-overshoulder posture for the resting state of
the panel (the common case is scrolling past, not interacting)
while letting the blocker confirm identity in the moment of an
actual action. Cited: `privacy-precondition` (incidental exposure
minimized) without sacrificing the blocker's ability to act
intentionally on their own list.

## §12 Threat-model delta

Pointer to the threat-model §7 entry landed in this same PR:
"Member blocking is a local-only personal-relief surface."

Summary of the delta (full prose in `docs/threat-model.md` §7):

- What it is: local Dexie row, no federation, no signature, no
  outbox entry. Same architectural posture as `EventRSVP`.
- What it defends against: unwanted DMs, claims, vouches, co-org
  invites, event RSVPs from a specific peer.
- What it does NOT defend against: a determined blocked party
  viewing federated public content from a peer node; an attacker
  who has already harvested federation traffic; a stalker who
  already has device access; mob-block aggregation as a social
  signal (which doesn't exist because blocks are never aggregated
  or exposed).
- Adversary mapping: §3 row 1 (employer / management), row 2
  (union-busting firms), row 7 (stalker). Each adversary benefits
  from a federated block graph — which is why blocks stay local.
- Mitigations: type-level rejection of `"block"` in
  `OutboxRow.kind`; soft-purge clears the table; data-export
  excludes the table; UI never surfaces aggregate block counts.
- Residual risk: a blocker's local `previouslyBlocked` history is
  a target if their device is compromised. Documented honestly as
  a device-access threat, mitigated by soft-purge.

## §13 Implementation phases

Five PRs after this design doc lands. The load-bearing absence of
PR D — there is no server work — is the same pattern as
`community-events.md` §11.1 + the EventRSVP outbox carveout. The
PR D slot is intentionally and loudly skipped so a future
contributor doesn't add server-side block routes by accident.

- **PR B — shared / local types + `OutboxRow.kind` lock.**
  *Shipped in PR #195.*
  - `Block`, `PreviouslyBlocked` types in
    `packages/shared/src/types.ts` (or wherever local-only types
    live — `EventRSVP` precedent informs the location).
  - Code comment on `Block` and `PreviouslyBlocked` documenting
    they never federate: "LOCAL ONLY — Dexie tables `blocks` /
    `previouslyBlocked`. Not signed. Not federated. MUST NOT
    appear in `OutboxRow.kind`. The federation layer has no
    knowledge of these types."
  - **`@ts-expect-error` lock** asserting that the string
    `"block"` is not a member of the `OutboxRow.kind` union. Same
    shape as the EventRSVP assertion landed in PR C of the events
    workstream. This is the type-level mechanism that prevents a
    future contributor from accidentally enqueuing a Block.
  - Tiny PR. No Dexie, no UI.

- **PR C — Dexie v23 → v24 + actions.** *Shipped in PR #196.*
  - Schema bump: `blocks` and `previouslyBlocked` tables in
    `apps/web/src/db`.
  - Action helpers:
    - `blockMember(blockedKey, hideGovernance, note)`,
    - `unblockMember(blockedKey)`,
    - `listBlocks()`,
    - `isBlocked(blockedKey)`,
    - `isMutuallyBlocked(memberKey)` — the cross-cutting
      consumer-side check that every §6 surface calls.
      Implementation note: even though only the local blocker has
      a `Block` row, the function name uses "mutually" because
      semantically a block from either side produces the same
      gate from the local member's perspective. (If member A is
      local and member B is the candidate, the function returns
      true iff A has a Block row for B. The name reflects that
      from any local member's view the gate is symmetric — there
      is no asymmetric "they blocked me but I didn't block them"
      state visible locally, because the other side's Block row
      doesn't federate.)
    - `updateBlockScope(blockedKey, { hideGovernance })`.
  - **Soft-purge** integration: the existing soft-purge clears
    `blocks` and `previouslyBlocked`.
  - **Data-export** integration: the existing export explicitly
    excludes `blocks` and `previouslyBlocked` and the export
    documentation (in `member-guide.md` §12) names this
    exclusion alongside the existing private-key exclusion.
  - **Device-pairing transfer payload** integration: the
    `blocks` and `previouslyBlocked` tables (including the
    `hideGovernance` per-block flag and the private `note`
    field) join the existing local-key-wrapped pairing payload
    documented in `docs/device-pairing.md` §8. This carries
    block state to newly-paired devices through the same
    envelope as the identity bundle and profile fields — never
    over a peer-node wire (settled decision §14.1). The
    already-paired-device gap is documented in §14.1 and
    surfaced in fine print in PR E.
  - Unit tests for each action helper, for soft-purge clearance,
    for data-export exclusion, and a test asserting
    `"block"` is rejected at the `OutboxRow.kind` type level
    (the runtime version of the PR B compile-time lock).

- **PR D — INTENTIONALLY SKIPPED.**
  - No server work. No `routes/blocks.ts`. No peer-pull cursor.
    No PWA-side `pullFederatedBlocks`. The discriminator
    `"block"` is not part of any federation surface.
  - The load-bearing absence of PR D is the same pattern as
    `community-events.md` §11.1 + the EventRSVP outbox carveout:
    a primitive that stays meaningful by staying entirely local.
  - This slot is named in the implementation plan precisely so a
    future contributor reading "PRs B, C, E, F" doesn't quietly
    add a PR D for "consistency" with the events workstream.
    There is no PR D here, deliberately.

- **PR E — UI.** *Shipped in PR #197.*
  - Comparison-card block-creation flow on MemberDetail per §3,
    with the default and `hideGovernance: true` variants. The
    comparison-card create flow is NOT obscured — when the
    blocker is actively choosing whom to block, they have
    explicitly chosen the target and a generic avatar would be
    theater (see §6 row on block-list rendering for the
    distinction).
  - Settings → Blocked contacts panel with:
    - List of current blocks. **Each row obscured by default**
      (see §6 block-list rendering): renders a generic avatar,
      the literal copy `block.settings.obscuredRow` ("Blocked
      contact"), the block date, the per-row `hideGovernance`
      toggle, the per-row "Edit private note" affordance, and
      the per-row Unblock button. The display name and
      truncated pubkey for that row are revealed by tapping the
      row; tapping again re-obscures. Reveal state is per-row
      and ephemeral (not persisted). i18n keys
      `block.settings.obscuredRow`,
      `block.settings.tapToReveal`.
    - "Previously blocked" subsection showing
      `previouslyBlocked` rows. Same tap-to-reveal posture as
      the current-blocks list.
    - **"Clear unblocked history" button** at the bottom of the
      previouslyBlocked subsection (settled decision §14.1).
      Single affordance, clears the whole list — not per-row.
      ConfirmDialog before clearing, matching the
      co-organizer-revoke confirmation pattern. i18n key
      `block.settings.clearHistoryButton`.
    - **Cross-device fine-print warning** at the foot of the
      panel: a single muted line noting that blocks created
      on this device will NOT automatically reach devices that
      were paired *before* the block was created — the operator
      must re-pair the second device if they want it to pick up
      the new block state (settled decision §14.1; references
      `docs/device-pairing.md`). i18n key
      `block.settings.crossDeviceWarning`.
  - i18n keys under the `block.*` namespace in
    `apps/web/src/i18n/locales/en.json` and `es.json`. Copy MUST
    use **"Block contact"** or **"Don't show me [member]"** (or
    similar) to stay clear of the task-vocabulary
    `follows-not-blocked` principle (see §9 below — UI naming).
  - No federation, no outbox enqueue. The block / unblock /
    toggle actions are pure Dexie writes.
  - **Block-affordance placement: MemberDetail + Settings only as
    of PR E.** Deliberately NOT on PostCard, EventCard,
    ProjectCard, or TaskComment — see §11.6 for why feed-card
    placement is rejected. As of a follow-up to PR F, the Block
    affordance also surfaces in the **conversation header menu**
    on the DM thread view (a kebab/"More actions" popover with a
    single "Block contact" / "Unblock <name>" item, gated on
    `isBlocked`). A 1:1 DM thread is contextual to a specific
    person, not a ranked feed surface, so it does not cut against
    `solidarity-not-shame` the way a feed-card placement would.
    The MemberDetail Block button is retained for members the
    operator hasn't yet messaged. i18n keys
    `messages.conversation.headerMenuLabel`,
    `messages.conversation.headerMenuBlock`,
    `messages.conversation.headerMenuUnblock`.

- **PR F — Consumer-surface wiring + integration tests.**
  *Shipped in PR #198.*
  - Wire `isMutuallyBlocked` (and `hideGovernance` lookups) into
    every consumer surface per the §6 table:
    - Feed rendering (Posts, Projects, Events).
    - DM rendering.
    - Vouch issuing and rendering.
    - TaskComment rendering.
    - Proposal / dispute comment rendering (gated by
      `hideGovernance`).
    - Proposal vote rendering (gated by `hideGovernance`).
    - Co-organizer invitation issue surface.
    - Event RSVP issue and rendering surface.
    - Attention rail item suppression.
    - firstActionNudge / profileNudge candidate-pool filtering.
  - **Generic-error discipline** test: every blocked-from action
    returns the same generic error string as a not-found /
    not-available action. Assert the strings are equal.
  - **Negative integration tests** proving governance is NOT
    filtered when `hideGovernance: false` (the system default).
    These tests are load-bearing because they lock the
    no-silent-disenfranchisement invariant from §3.2 and §6.2 in
    code.
  - **Positive integration tests** proving governance IS
    filtered when `hideGovernance: true`.
  - **Integration test** asserting no Block row ever reaches the
    outbox under any action, including the action helpers, the
    soft-purge path, and the data-export path.

### §13.1 Naming discipline (carry-through to every PR)

The codebase has a `follows-not-blocked` principle about task
status. UI copy MUST use **"Block contact"** or **"Don't show me
[member]"** (or similar phrasing the i18n review picks) to stay
clear of the task vocabulary. The doc and code can use the word
`Block` for the record type and the API surface (`blockMember`,
`isBlocked`); UI strings MUST use the distinct phrasing. This is
settled decision 9 from the audit prompt and applies through PR E
i18n review.

## §14 Open questions

### §14.1 Settled

The following entries opened in earlier drafts of this doc and are
now settled by operator + designer discussion. They are retained
here (rather than excised) so a reader walking the doc end-to-end
sees the rationale, not just the conclusion.

- **Cross-device propagation for the blocker's own devices —
  settled YES, via the device-pairing transfer flow, with one
  honestly-named gap.** The blocker's `blocks` and
  `previouslyBlocked` tables (including the `hideGovernance`
  per-block flag and the private `note` field) join the
  device-pairing transfer payload (see `docs/device-pairing.md`
  §8). A device that is paired *after* a block is created
  receives the current block state at pairing time, the same way
  it receives the identity bundle and profile fields. This does
  NOT change the federation posture — block state travels only
  through the local-key-wrapped pairing envelope and never
  crosses a peer-node wire (cited: `privacy-precondition`).
  > **Gap, named not papered over.** Devices that were paired
  > *before* a new block is created do NOT automatically sync
  > that new block. There is no settings-sync channel between
  > already-paired devices today, and the pairing flow runs once
  > per destination. Two plausible future-work shapes: (a) a
  > "settings sync via signed local-only delta" channel scoped to
  > the blocker's own paired devices (would need its own
  > threat-model entry — even a local-only sync surface is a new
  > surface), or (b) a manual re-pairing workflow surfaced in
  > Settings → Blocked contacts when an already-paired device
  > should pick up new blocks. Phase 1 ships with neither; the
  > operator must re-pair the second device if they want the new
  > block state to reach it. The Settings → Blocked contacts
  > panel names this in fine print (see §13 PR E).

- **`previouslyBlocked` retention — settled INDEFINITE by default
  + manual "Clear unblocked history" button.** The history is
  the blocker's memory aid; auto-deleting it is paternalistic
  (cited: `privacy-precondition` — the blocker, not the system,
  decides what to keep). No auto-prune, no expiry, no cap. A
  single "Clear unblocked history" button at the bottom of the
  previouslyBlocked subsection of Settings → Blocked contacts
  clears the whole list (one affordance, not per-row), gated by
  a ConfirmDialog (see §13 PR E).
  > **Unbounded-growth risk, named honestly.** A long-active
  > member could accumulate hundreds of `previouslyBlocked` rows
  > over time. The IndexedDB cost is negligible at any realistic
  > member-lifetime scale; the UX cost is the length of the
  > Settings list. Combined with the tap-to-reveal affordance
  > (see §6 and §13 PR E), even a long history has minimal
  > incidental exposure to an over-the-shoulder observer. We
  > defer to pilot signal: if real-world bloat shows up, an
  > opt-in expiry can be added in a follow-up. We do not impose
  > a cap pre-emptively.

### §14.2 Still open

- **Should the comparison card show a sample of recent
  interactions?** A surface that says "you and X have 3 recent
  DMs, 1 outstanding claim, and 0 vouches between you" before
  the blocker confirms could help the blocker make an informed
  call about whether the unifying "work in flight finishes" rule
  applies cleanly. The cost is UI complexity and a query layer
  on the comparison card. *Recommendation: no for phase 1.* The
  comparison card names the work-in-flight rule in the abstract
  ("Existing exchanges, vouches, co-organizer roles, and pending
  claims complete through their normal flow"); a sample view
  could come in phase 2 if pilot signal shows the abstract
  framing is hard to act on. Open.

- **Unblock confirmation.** Should unblock require a
  ConfirmDialog ("Unblock X? They will be able to message and
  vouch you again."), or be a single-tap action in the Settings
  list? *Recommendation: ConfirmDialog,* same shape as the
  co-organizer revoke confirmation. The unblock crosses a
  meaningful state boundary; a confirm step is appropriate.
  Open for PR E design review.

- **Pilot-data question on §3.1 default text.** The phrase "Their
  governance voice still reaches you" in the default card may
  read as more reassuring than the blocker wants; some blockers
  may prefer the opt-in copy be more prominent so they can
  flip the toggle without a UI re-read. PR E i18n review should
  test both shapes with pilot members. Not blocked.
