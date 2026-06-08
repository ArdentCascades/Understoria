# Understoria — Co-organizer invitations (design note)

> **Status:** design note. This document is the predicate for the
> implementation PRs; no code in this branch. Pairs with the
> threat-model §7 entry "Co-organizer role requires signed invitation
> + signed acceptance" added in the same PR. Read alongside the
> parallel self-removal fix (in flight on
> `fix/coorganizer-self-removal`), which closes the complementary
> trapped-co-organizer half of this values gap, and
> `docs/auto-confirm-key.md` for the analogous values-grounded
> design-note pattern.

---

## §1 Problem

Today the primary organizer of a project can name another member as
co-organizer unilaterally. `addCoOrganizer(projectId, callerKey,
newCoOrgKey)` in `apps/web/src/db/projects.ts` (~line 328) takes the
caller and the new key, checks only that the caller is the primary
organizer, and writes the new key directly into
`Project.coOrganizerKeys`. The newly named member gets no notification,
no prompt, no consent step. They learn about it by happening to open
the project page, or by noticing that they can now do organizer
actions.

The complementary half — that a co-organizer cannot remove themselves
once added, because `removeCoOrganizer` requires
`p.organizerKey === callerKey` — is covered by a separate
self-removal PR currently in flight on
`fix/coorganizer-self-removal`. This document does not address that
problem. It addresses **conscription on ADD**: the values failure
that occurs at the moment the role is granted, before the member has
had any chance to consent or decline.

The conscription framing matters. Co-organizer is not a cosmetic
label. A co-organizer:

- can confirm task completions, and *their own balance* is debited
  when they do so (`confirmProjectTaskCompletion` records the
  confirmer as the helped party on the signed `Exchange` — Agent 10
  Phase 3 / PR #84);
- signs records that commit *their identity* to the project's actions
  (project announcements, future co-signed proposals);
- shows publicly on the project page as a community-vouched authority
  for the project's coordination.

Each of these carries real responsibility — financial, reputational,
relational. None of them are roles a member should be assigned
without their explicit say.

The question this document answers is **how a member becomes a
co-organizer in a way that requires their deliberate act, while
preserving the existing federation, signing, and threat-model
postures.**

## §2 Values tension

Three principles converge. Quoted from `design-principles.ts`:

- **`solidarity-not-shame`** —
  > "Never frame a situation as stalled, overdue, or failed. Capacity
  > changes; the system adapts without blaming anyone."
  Read in this context: the system shouldn't impose responsibility on
  a member because someone else decided they should carry it. A
  member who can't take on a co-organizer role today — burnout,
  capacity, life circumstances — must not be silently signed up for
  one anyway. The decline path is part of how the system "adapts
  without blaming anyone."

- **`community-authority`** —
  > "No admin role. Governance decisions go through community
  > proposals, not individual power."
  Read in this context: granting another member trust authority over
  a community project is not the primary organizer's decision alone.
  It is at minimum a *two*-party decision (inviter + invitee), and
  even then it is visible to the community via the project page. A
  unilateral assignment by the primary organizer silently moves trust
  onto an individual the system has had no consent ceremony for.

- **`privacy-precondition`** is the floor, not the focus. This change
  does not introduce a new exposure surface (see §9). It tightens a
  values gap inside an already-exposed surface.

The practical concern that ties these together: **signed records
imputed to a member should always trace back to that member's
deliberate act.** Today, when a co-organizer confirms a task and the
signed `Exchange` is federated with their key as the helped party,
that signature commits them to a debit they may never have agreed to
be in a position to incur. The federation-side observer cannot
distinguish "this member chose to be a co-organizer and confirmed
this task" from "this member was named co-organizer without their
knowledge, was unaware they had been granted confirm authority, and
the confirm happened from a different paired device or via an
automated path." The signed-acceptance record closes that ambiguity:
every member who appears as a co-organizer has a corresponding
acceptance signature attesting to their decision to carry the role.

## §3 Decision: signed invitation + signed acceptance

The role becomes effective ONLY when the invitee signs an acceptance
record. Until then, the invitation is a pending state visible to
both parties (and to the federation), and the invitee is NOT a
co-organizer for any purpose — `isOrganizer(project, memberKey)`
returns false, `confirmProjectTaskCompletion` rejects them as a
non-organizer, and the project page does not list them in the
organizer roster.

State machine for an invitation:

```
nothing → invited → accepted (becomes co-organizer)
                 ↘ declined (terminal, locked, audit trail)
                 ↘ revoked  (by inviter, terminal)
                 ↘ expired  (after 14 days, terminal)
```

`accepted` is the only state that grants the role. The other three
terminal states each carry their own signed record (or, in the case
of `expired`, are derived from the invitation's `expiresAt` against
wall time) and leave a permanent audit trail in the federated
ledger. A member who declined an invitation can be re-invited
later — the second invitation is a separate signed record (see §10).

`invited` is not a role. The invitee accrues no authority during
this state; the only effect is an `AttentionItem` on their home
screen prompting them to decide.

## §4 Data model

Two new federated record types, shaped to match `SignedVouch` and
`Invite` so a reader who already knows those primitives can place
them immediately.

```ts
// Canonical, signed by the inviter (the primary organizer).
// Mirrors SignedVouch in shape: a payload + an id + a signature.
export interface CoOrganizerInvitationPayload {
  projectId: string;
  inviterKey: string;       // must equal Project.organizerKey at issue time
  inviteeKey: string;
  createdAt: number;
  expiresAt: number;        // createdAt + 14 days, matching member invites
  nodeId: string;
}

export interface CoOrganizerInvitation extends CoOrganizerInvitationPayload {
  id: string;               // uuid, the federation-stable handle
  signature: string;        // inviter's Ed25519 signature over canonical payload
}

// Canonical, signed by the invitee.
export interface CoOrganizerInvitationResponsePayload {
  invitationId: string;     // ties back to CoOrganizerInvitation.id
  inviteeKey: string;       // must equal CoOrganizerInvitation.inviteeKey
  decision: "accept" | "decline" | "revoke";
  decidedAt: number;
  nodeId: string;
}

export interface CoOrganizerInvitationResponse
  extends CoOrganizerInvitationResponsePayload {
  id: string;
  signature: string;        // signer depends on decision (see below)
}
```

`decision: "revoke"` is a deliberate reuse of the response-record
machinery for the inviter-side revocation path (see §5). The
alternative — a separate `CoOrganizerInvitationRevocation` record
type — adds a third primitive without commensurate clarity. The
response shape already carries the (invitationId, decidedAt,
signature) triple a revocation needs; the only field that doesn't
generalize is `inviteeKey`, which on a revocation echoes the inviter
(the inviter is the only party authorized to issue a revoke). The
signature verifier disambiguates: an `accept` or `decline` response
verifies against `inviteeKey`; a `revoke` response verifies against
the original invitation's `inviterKey`. The invariant the verifier
enforces is **the signer's key matches the action**, not "the
inviteeKey field always identifies the signer."

(This is opinionated. The alternative — separate
`CoOrganizerInvitationRevocation` record type — is named in §10 as
an open question. Recommendation: stick with the response shape; the
disambiguation is mechanical and the type-surface saving is real.)

### Canonical payloads

Mirroring `canonicalVouchPayload` / `canonicalExchangePayload` in
`packages/shared/src/crypto.ts` — fixed field order for cross-engine
JSON stability.

```ts
export function canonicalCoOrganizerInvitationPayload(
  p: CoOrganizerInvitationPayload,
): string {
  return JSON.stringify({
    projectId:  p.projectId,
    inviterKey: p.inviterKey,
    inviteeKey: p.inviteeKey,
    createdAt:  p.createdAt,
    expiresAt:  p.expiresAt,
    nodeId:     p.nodeId,
  });
}

export function canonicalCoOrganizerInvitationResponsePayload(
  p: CoOrganizerInvitationResponsePayload,
): string {
  return JSON.stringify({
    invitationId: p.invitationId,
    inviteeKey:   p.inviteeKey,
    decision:     p.decision,
    decidedAt:    p.decidedAt,
    nodeId:       p.nodeId,
  });
}
```

The `id` and `signature` fields are NOT part of the canonical
payload — same discipline as the existing vouch and exchange types.
Record IDs are derived deterministically from the payload (e.g.
`sha256(canonical)` truncated, or `uuid()` chosen at issue time —
the implementation PR picks one consistent with how peer-pull
dedupes; the existing convention for vouches is a generated uuid
and peer-pull dedupes on `id`).

### Effective co-organizer set (derived view)

`Project.coOrganizerKeys` becomes a **derived view** rather than a
directly-written field:

```
effectiveCoOrganizerKeys(project) =
  { inviteeKey :
      ∃ invitation with projectId = project.id ∧ inviteeKey = inviteeKey,
      ∧ ∃ response with invitationId = invitation.id ∧ decision = "accept",
      ∧ ¬∃ later response with invitationId = invitation.id
            ∧ decision = "revoke",
      ∧ now < invitation.expiresAt OR an accept exists with
            decidedAt ≤ invitation.expiresAt
  } ⊂ Project.coOrganizerKeys
```

Practically: `isOrganizer()` and every consumer of
`coOrganizerKeys` reads the derived view, not the static array. The
static field is retained for the grandfather case below.

### Grandfather migration

Projects that already have `coOrganizerKeys` populated unilaterally
pre-feature are grandfathered as accepted. The values shift is
**forward-looking only**: a member who was named co-organizer last
month under the old code path stays a co-organizer; the system does
not retroactively kick them out and demand they accept. The
migration is deliberately permissive because the alternative would
silently strip authority from members who are exercising it in good
faith.

Mechanically, the Dexie upgrade callback in the data-layer PR
synthesizes a paired `(CoOrganizerInvitation,
CoOrganizerInvitationResponse{decision: "accept"})` for each
existing `(project, coOrganizerKey)` pair, signed under a
deterministic "grandfather" marker — recommend a sentinel signature
field (`signature: "grandfathered"`) plus a row-level
`grandfathered: true` flag so verifiers can distinguish a
grandfathered acceptance from a real one. Grandfathered rows do not
federate (the federation outbox is not retroactive; peer nodes
either already see the projects with the legacy `coOrganizerKeys`
populated, or they don't). New invitations are signed normally and
federate normally.

(Opinionated. The alternative — require every pre-feature
co-organizer to re-accept — is named as an open question in §10
with reasons.)

## §5 Lifecycle, federation, revocation

- **Issue.** The primary organizer calls
  `issueCoOrganizerInvitation(projectId, inviterKey, inviteeKey)`.
  The function builds the canonical payload, signs it with the
  inviter's secret key (`getSecretKey(inviterKey)` — same gate the
  invite + vouch flows use), persists the row, and enqueues it on
  the outbox. The invitation federates via the existing outbox /
  peer-pull infrastructure — same shape as `SignedVouch`, `Post`,
  and the recent `taskComments` (PRs #72–#73).

- **Notify.** Destination devices see the invitation through the
  next federation pull. An `AttentionItem` of kind
  `coorganizer_invitation_received` is computed by `lib/attention.ts`
  and surfaces on the invitee's home screen. The attention item
  carries the project title, the inviter's display name (if the
  invitee's local member-cache has it; otherwise the inviter's
  short public key), the time issued, and the time remaining before
  expiry.

- **Accept / decline.** The invitee signs a
  `CoOrganizerInvitationResponse` with `decision: "accept"` or
  `decision: "decline"`. The response federates the same way the
  invitation did. On accept, the invitee's
  `effectiveCoOrganizerKeys` membership starts immediately (locally;
  peers learn of it on their next pull).

- **Revoke.** The inviter can revoke before acceptance by issuing a
  `CoOrganizerInvitationResponse` with `decision: "revoke"`, signed
  with the *inviter's* key (see §4 for the rationale and the
  verifier disambiguation). A revoke is only valid if no accept or
  decline already exists for that invitation. Revocations after
  acceptance are not supported by this mechanism — that's
  organizer-removal, which is a different action (`removeCoOrganizer`
  / the parallel self-removal PR).

- **Expiry.** 14 days from `createdAt`, matching member invites
  (`apps/web/src/db/invites.ts` defaults). Expiry is derived from
  the `expiresAt` field in the invitation and a wall-clock read;
  no separate expired-record is signed (expiry is not a deliberate
  act). An expired invitation cannot be accepted; the attention
  item drops out of `lib/attention.ts`'s output the moment
  `now > expiresAt`. The signed invitation row stays in the ledger
  as audit trail.

The 14-day matching is deliberate. Member invites use the same
horizon for the same reasons (a real invite ceremony takes days,
not seconds; coercive urgency is a values failure). Co-organizer
invitations occupy the same conceptual slot — a slow, deliberate
attention-prompt for the invitee, not a quick yes/no modal.

## §6 Organizer-side UX

- **Project detail page.** The existing co-organizer roster section
  gains a "Pending invitations" subsection. Each outstanding
  invitation renders one row:

  ```
  invitee short key (or display name if local)
  issued: <relative time>
  expires in: <relative time>
  [ Revoke ]
  ```

  The revoke button issues a signed revocation as in §5. A
  confirmation step ("Cancel the invitation to <name>? They won't
  receive it on their next sync.") is appropriate here — same
  ConfirmDialog component the rest of the app uses.

- **"Invite a co-organizer" affordance** replaces the existing
  unilateral add. The current control is a member picker + Add
  button; the new control is a member picker + Send button. Copy:

  ```
  They'll see your invitation in their next sync. You can revoke any
  time before they accept.
  ```

  This copy intentionally names the federation timing ("next sync")
  rather than promising instant delivery — the existing pull-loop
  model means a cross-node invitee may not see the invitation
  until their PWA next opens and pulls. Promising "they'll be
  notified right away" would be inaccurate.

- **Past invitations.** Declined, expired, and revoked invitations
  are shown in the Pending section's "Past invitations" subsection
  for a retention window of **30 days** post terminal-decision.
  After 30 days the row drops out of the rendered list; the signed
  record stays in the federated ledger forever. The retention
  window gives the organizer a chance to see why a recent
  invitation didn't take effect (and to re-invite if appropriate),
  without permanently surfacing every past attempt.

  (30 days is a guess. Open question in §10.)

## §7 Invitee-side UX

- **AttentionItem.** A new kind: `coorganizer_invitation_received`.
  It carries the project title, the inviter's display name, time
  remaining, and Accept / Decline buttons.

- **Accept flow.** Tapping Accept opens a small comparison card,
  same discipline as the device-pairing flow's §6.2 card. The card
  names what accepting commits to *before* the member signs:

  ```
  Accept co-organizer role for <project title>

  What this means

    ✓  Confirming task completions   Each confirmation debits your
                                     own balance.
    ✓  Signing as a project organizer Records you sign in this role
                                     trace back to your identity in
                                     the project's federated history.
    ✓  Visible to the community      The project page lists you as
                                     a co-organizer on every peer's
                                     view.

  What this does NOT mean

    ◯  Standing obligation           You can step back from the role
                                     yourself at any time
                                     (see Profile → Projects).
    ◯  Authority over the primary    The primary organizer keeps
                                     handoff and removal authority.
                                     Co-organizers are peers, not
                                     deputies.

    [ Cancel ]    [ Accept and sign ]
  ```

  On Accept-and-sign, the invitee's PWA signs the acceptance
  record, persists it, enqueues it on the outbox, and resolves the
  attention item. The member now appears as co-organizer on the
  project page. Locally this is instant; peers see it on their
  next pull.

- **Decline flow.** Tapping Decline opens a one-line confirmation
  ("Decline co-organizer for <project title>?") — no required
  reason field, no free-text. The signed decline record federates
  the same way an accept does. The attention item resolves; no
  notification fires back to the inviter beyond what the inviter
  sees in their Pending section the next time they look at the
  project page (the row now reads "declined").

  No reason field is deliberate (see §10 — privacy posture).

- **Copy on the attention item itself** (before the comparison card
  expands) should be short and accurate:

  ```
  <Inviter name> invited you to co-organize "<project title>."
  This commits your balance and identity to confirming work on the
  project. Take a look before you accept.
  ```

  The "take a look" framing matches the device-pairing flow's
  "decide whether to pair before identity material is rendered"
  posture: the values commitment is to make the member's deliberate
  act the threshold, not a glance-and-tap.

## §8 Federation

- **Endpoints.** Two new community-node routes, mirroring
  `apps/server/src/routes/vouches.ts` exactly:

  - `POST /coorg-invitations` — ingest a signed invitation. Verify
    the signature against `inviterKey`. Dedupe by `id`. Persist.
  - `GET /coorg-invitations?since=<cursor>` — peer-pull endpoint
    paginated by `createdAt`.
  - `POST /coorg-invitation-responses` — ingest a signed response.
    Verify the signature against `inviteeKey` for accept/decline,
    `inviterKey` (resolved via the response's `invitationId`) for
    revoke. Dedupe by `id`. Persist.
  - `GET /coorg-invitation-responses?since=<cursor>` — peer-pull
    endpoint paginated by `decidedAt`.

  The implementation PR for federation (PR B in §11) checks
  whether a generic record-type endpoint has landed in the
  meantime; if so, the two record types ride that endpoint
  instead. Today there is no such generic — every record type
  has its own pair of routes — so the baseline plan is the
  four routes above.

- **Peer-pull integration.** `apps/server/src/peerPull.ts` gains
  cursor-tracked pulls for both record types, same shape as the
  existing exchange / vouch / post / taskComment pulls.

- **PWA-side pull.** `apps/web/src/lib/federationSync.ts` gains
  `pullFederatedCoOrgInvitations` and
  `pullFederatedCoOrgResponses` functions that mirror the existing
  `pullFederatedPosts` etc.

- **Cross-node co-organizers.** An invitee on a different node from
  the inviter sees the invitation via the same federation pull
  that brings posts, vouches, and exchanges. This is one of the
  values arguments for the signed-record path over a local-only
  invitations table: a local table would make cross-node
  co-organizer coordination impossible, which would silently
  re-create same-node-only collaboration as a structural default.
  The signed-record path makes cross-node co-organizers a
  first-class case.

  Notably, the invitee can also *respond* from a different node
  than the one they read the invitation on — the response is
  signed by their key, so any node with the inviter's pubkey can
  verify it. There is no node-stickiness.

## §9 Threat-model delta

This change **does not introduce new threat surface.** Co-organizers
were already a trust position. The data model gains two new signed
record types, but each carries the same metadata visibility as a
signed vouch: the signer's pubkey, the recipient's pubkey, a
timestamp, and a projectId. Nothing about a member is exposed by an
invitation that wasn't already exposed by their participation in
projects on the same federation.

This change **tightens a values gap** — consent at the trust-grant
moment. The federation observer that previously saw a member's
public key appear in `Project.coOrganizerKeys` with no
corresponding acceptance signature now sees a signed acceptance
record. That's a small audit-trail improvement (provenance of the
role grant is now end-to-end verifiable), not a mitigation.

What this change does **not** defend against:

- **Coerced invitation.** A primary organizer compelled by an
  abusive party can still send an invitation. The signed-acceptance
  step is the floor — it makes "the invitee was conscripted" not
  technically possible, but it cannot prevent "the inviter sent the
  invitation under duress."
- **Coerced acceptance.** An invitee compelled by an abusive party
  can still accept. The decline path is the technical mitigation;
  the social fabric of consent has to do the rest. No technical
  system can distinguish coerced consent from real consent at the
  signature layer.
- **Pre-existing co-organizer relationships.** Grandfathered
  acceptances do not have a real signature behind them. A
  pre-feature unilateral add is locked in. The values shift
  applies only to new additions (see §4 / §10).

No new key material. No new public exposure. No change to threat
adversaries listed in §3 of `docs/threat-model.md`. The threat-model
entry added in this branch is a single bullet in §7 (near the
device-pairing entry) recording the values fix and naming the
non-defense items above.

## §10 Open questions

- **Bulk invite.** Should an organizer be able to bulk-invite
  multiple members in one ceremony? *Recommendation: no.* Each
  invitation is its own deliberate act — bulk-invite drifts the
  shape of the role grant from "this person, for this project"
  toward "everyone in this list, because filling chairs." If a
  pilot community asks for bulk-invite, the right response is to
  revisit *why* they need it before adding the affordance.

- **Free-text decline reason.** Should the decline path collect an
  optional reason field? *Recommendation: no.* "I declined" is
  enough — privacy posture. Free-text fields tend to attract
  pressure to justify ("but *why* are you declining?"), and the
  field's optionality doesn't repel that pressure because the
  inviter sees whether it's filled. The decline is the decision;
  the reason is private to the decliner.

- **Re-invitation after decline.** Should a previously-declined
  member be re-invitable, and if so with what cooldown?
  *Recommendation: yes, no cooldown.* The second invitation is a
  separate signed record; the member can decline again. A cooldown
  would imply the previous decline was a partial or noisy signal,
  which it isn't. If re-invitation becomes a pestering pattern in
  practice, the response is governance (a community norm against
  pestering) rather than a technical lockout.

- **Grandfather strategy for existing `coOrganizerKeys`.**
  *Recommendation: grandfather as accepted* (see §4). The
  alternative — require every pre-feature co-organizer to re-accept
  — has two costs: (a) it silently strips authority from members
  exercising it in good faith until they happen to open the app, and
  (b) it conflates "this is a new values commitment" with "your past
  role is invalid." The forward-looking framing is honest about the
  scope of the fix.

- **Pending-list retention window.** §6 proposes 30 days for
  declined / expired / revoked invitations to render in the
  organizer's Past section. This is a guess. Too short and the
  organizer loses context for recent attempts; too long and the
  list becomes an awkward history of who-said-no. Pilot validation
  recommended.

- **Revoke as a `CoOrganizerInvitationResponse` vs. a separate
  record type.** §4 chooses the response-shape reuse with a
  signature-verifier disambiguation. The alternative — a separate
  `CoOrganizerInvitationRevocation` record type — is cleaner
  type-surface but adds a third primitive with its own canonical
  payload and federation routes. *Recommendation: response-shape
  reuse, the disambiguation is mechanical.* This is the open
  question most worth a reviewer's attention before implementation
  starts — it's a one-way decision in the data model.

## §11 Implementation breakdown

Three PRs after this design doc lands. Sequencing matters: PR A
ships the data + types; PR B ships server routes + peer pull on
top of A; PR C ships UI on top of B.

- **PR A — data layer.**
  - Dexie schema bump (next free PWA version, probably v21).
  - `CoOrganizerInvitation`, `CoOrganizerInvitationPayload`,
    `CoOrganizerInvitationResponse`,
    `CoOrganizerInvitationResponsePayload` types in
    `packages/shared/src/types.ts`.
  - Canonical-payload + signing helpers in
    `packages/shared/src/crypto.ts`:
    `canonicalCoOrganizerInvitationPayload`,
    `canonicalCoOrganizerInvitationResponsePayload`,
    `verifyCoOrganizerInvitation`,
    `verifyCoOrganizerInvitationResponse`.
  - DB functions in `apps/web/src/db/projects.ts` (or a new
    `apps/web/src/db/coorgInvitations.ts` — implementation
    decides based on file size):
    `issueCoOrganizerInvitation`,
    `respondToCoOrganizerInvitation`,
    `revokeCoOrganizerInvitation`,
    `effectiveCoOrganizerKeys(project)`.
  - Update `isOrganizer()` to read the derived view.
  - Grandfather migration in the Dexie `upgrade()` callback per
    §4.
  - Unit tests for sign / verify / canonical-payload stability /
    grandfather migration / derived view / expiry boundary /
    revoke-vs-accept ordering.
  - Add the `coorganizer_invitation_received` `AttentionItem`
    kind to `apps/web/src/lib/attention.ts`.

- **PR B — server federation.**
  - New routes mirroring `routes/vouches.ts` exactly:
    `routes/coorgInvitations.ts` (POST + GET ?since=) and
    `routes/coorgInvitationResponses.ts` (POST + GET ?since=).
    Signature verify, dedupe by ID.
  - Server schema bump (next free server version).
  - Peer-pull integration in `apps/server/src/peerPull.ts` —
    cursor-tracked pulls for both record types.
  - PWA-side `pullFederatedCoOrgInvitations` and
    `pullFederatedCoOrgResponses` in
    `apps/web/src/lib/federationSync.ts`.
  - Tests for ingest, peer-pull, dedupe, signature-verify
    rejection.

- **PR C — UI.**
  - Organizer-side pending-invitations list on project detail
    (`apps/web/src/pages/ProjectDetail.tsx`), with Revoke action.
  - "Invite a co-organizer" affordance replacing the unilateral
    add.
  - Past-invitations subsection with 30-day retention.
  - Invitee-side attention-item rendering for the new kind in
    `apps/web/src/components/AttentionSection.tsx`.
  - Accept comparison-card + Decline confirm.
  - i18n keys in `apps/web/src/i18n/locales/en.json` and
    `es.json` for every new string.
  - New activity-log entries on `ProjectActivity`:
    `coorganizer_invited`, `coorganizer_accepted`,
    `coorganizer_declined`, `coorganizer_revoked`.
  - `HistoryTimeline` labels for the four new types.
  - Tests for the AttentionItem computation, the Accept and
    Decline flows, and the Revoke flow.

The threat-model and roadmap edits in this branch are the
predicate; each implementation PR cites this design doc in its
description.
