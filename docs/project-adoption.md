<!--
Understoria — Federated mutual aid timebank
Copyright (C) 2026 Understoria Contributors
SPDX-License-Identifier: AGPL-3.0-or-later
-->

# Orphaned-project adoption

Plan 11. When a project's **primary organizer** goes quiet, governance
freezes: co-organizers can still run the day-to-day (confirm tasks, add
tasks, pause/resume) and the auto-confirm sweep keeps credit flowing, but
no new co-organizers can be invited, no handoff can happen, and the
project can't be archived — `issueCoOrganizerInvitation`,
`handoffOrganizer`, and `archiveProject` all require
`callerKey === Project.organizerKey`. The roster can only shrink. That's
graceful degradation toward a slow death, not an emergency.

**Adoption** is the community installing stewardship that no individual
has the standing to grant. It rides the proposal system
(`Proposal.payload` is deliberately schema-agnostic), as a new
`project_adoption` category.

## Values tension (and how the structure compensates)

Adoption is the one role transition that happens **about** someone who
isn't there. Every other transition in the codebase is
consent-ceremonied (the actor signs). Adoption can't be — so it
compensates with structure rather than a signature:

- **community-authority, not individual power.** The community votes; no
  admin grants the role. Execution flips the project only after the
  proposal passes.
- **Consent for the adoptee is self-nomination.** The proposer *is* the
  proposed primary (`proposerKey === proposedPrimaryKey`), continuously
  revocable. Nobody is voted into a role they didn't offer to take
  (GOVERNANCE.md §4).
- **Solidarity, not shame.** The quiet organizer is never framed as
  negligent — capacity changes; people get hospitalized, evicted, burned
  out. All copy frames the *project* ("keeping it alive", "while you're
  away"), never the person. The cancel is "I'm still here," with no
  reason field.
- **Deliberation over speed.** A 14-day notice floor
  (`ADOPTION_MIN_DELIBERATION_DAYS`), applied as
  `max(config.proposalDeliberationDays, 14)` and **re-enforced inside
  `executeAdoptionProposal`**, so even an out-of-band "record outcome:
  passed" can't shortcut the absent member's window.
- **The hostile-takeover spine: the sitting primary can always cancel,
  two ways, neither requiring explanation.** (a) *Implicit* — any
  `projectActivity` row by them dated after the proposal's `createdAt`
  voids it at execution (the proposal closes `withdrawn`, project
  untouched). Doing anything counts as being here. (b) *Explicit* — a
  one-tap "I'm still here" on the proposal card and the attention rail.
  Both ship, because reading is untracked (no-read-receipts), so a
  primary who returns and only *looks* needs an affordance to register
  presence.
- **Demote, don't drop.** The flip moves the old primary into
  `coOrganizerKeys` (mirroring `handoffOrganizer`), so the returning
  member keeps working authority and a path back to primary.

## The quiet-period proxy (an honest imprecision)

Eligibility is "no organizer activity in `adoptionQuietDays` (default
60)." Measured **only** from `projectActivity` rows — `logActivity`
stamps `actorKey` on creation, pause/resume, complete, archive, task
adds, confirmations, announcements, handoffs, and invitations. It does
**not** fire on task *edits*, reorders, or dependency changes, and never
on reads. So the proxy can under-count a silently-active primary. We
accept that imprecision rather than add read-tracking (a
no-read-receipts / no-activity-search posture); the notice item and the
always-available cancel are the mitigation.

## Federation — traced end-to-end

Projects do not federate: the server has no projects table and
`OutboxRow.kind` has no project member. `organizerKey` lives only on the
local Project row, in the same consistency domain as proposals and votes.
**Adoption is therefore a local governance act — no new wire records.**

Co-organizer invitation verification after the flip:
`inviterKey === Project.organizerKey` is enforced at **issue time only**;
every verifier (server route, PWA ingest, `materializeAcceptedCoOrganizer`)
checks only the embedded self-signature, never re-compares `inviterKey`
to a project row. Consequences:

- **Past invitations** signed by the vanished primary verify forever; a
  still-pending one accepted after adoption still materializes — correct
  (it was a legitimate offer; the new primary can `removeCoOrganizer`).
- **Future invitations** by the adopted primary pass the issue-time check
  on their own node's flipped row and verify cleanly everywhere.

`organizerKey` thus legitimately changes two ways — `organizer_handoff`
(the primary chose) and `adopted_by_community` (the community acted) —
noted at `CoOrganizerInvitationPayload`. The transition itself leaves no
signed record (shared with handoff and removal); whether all three should
gain signed records is an open question, not papered over.

## History honesty

Execution logs a **distinct** activity type `adopted_by_community` (not
`organizer_handoff`): handoff means the primary chose; adoption means the
community acted while they were away. Cancellation logs nothing in phase
1 (that would couple the federated cancel path to governance state).

## Open questions

1. Is `proposalMinAffirms` (default 2) heavy enough to install an
   organizer, or does adoption deserve its own `adoptionMinAffirms`?
2. Is a 60-day quiet default patient, or a loophole? Should presence ever
   be measurable beyond action logs (current answer: no)?
3. Repeated filings after a withdrawal-by-presence: governance norm, or a
   technical cooldown?
4. Signed role-transition records for handoff / removal / adoption alike
   (ties into the federated-audit question).
5. Completed-project adoption is allowed solely so an orphaned completed
   project can eventually be archived — worth the surface, or let
   completed orphans rest unarchived?
