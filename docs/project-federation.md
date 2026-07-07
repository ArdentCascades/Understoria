# Project & Participation Federation

Status: **Phase 1 shipped** (project + task state). Phases 2–3 designed,
not yet built.

## 1. The gap this closes

Projects, project tasks, proposals, votes, event RSVPs, and shift
signups have never federated: no server route, no outbox kind, no
pull. They were device-local by construction. The practical
consequences, observed in field use:

- A member's own second device (linked phone) receives a one-time
  snapshot at pairing and then **drifts**: task status changed on one
  device never reaches the other.
- Worse, and independent of device-linking: **two different members
  cannot see each other's project activity at all.** A helper claiming
  a task on their phone is invisible to the organizer. Multi-member
  projects only actually work on the organizer's own screen. (Task
  *comments* federate — so a comment saying "done!" syncs while the
  task's real status doesn't.)

Exchanges (the credit that task confirmation pays out) already
federate, so balances were right even while the visible state wasn't.

## 2. Why signed plaintext records, not end-to-end encryption

Project state is community data — the same class as posts, events,
and exchanges, which already live on the community node as signed
plaintext records so any member's device can fetch and verify them.
Encrypting "end to end" requires an answer to *encrypted to whom?*
For a whole community with changing membership that means group key
management (distribution, rotation on join/leave/block, re-encryption
for newcomers) — a heavy machine that buys nothing here, because the
node's operator community is precisely the intended audience. The
privacy policy already names this trade for the other record kinds;
Phase 1 extends the same posture to projects, and §7 of the privacy
policy / threat model are updated accordingly.

E2E relay **is** the right tool for a member's *own* devices (same
identity key on both ends) — that is Phase 3.

## 3. The mutability problem and the LWW design

Every existing federated kind is append-only and single-signer.
Projects and tasks MUTATE: status transitions, claims, completions,
edits. Phase 1 federates them as **signed last-writer-wins state
records**:

```
ProjectState = { ...full Project row, updatedAt, signerKey, signature }
TaskState    = { ...full ProjectTask row, projectId, updatedAt,
                 signerKey, signature }
```

- The signer signs the canonical JSON of the full row + `updatedAt`.
- The server upserts **iff** the incoming `updatedAt` is strictly
  newer than the stored one AND the authority rules below pass.
  Stale or unauthorized writes answer 200 `{stored:false}` /
  403 respectively — idempotent for the outbox.
- Clients pull by `updatedAt` cursor and apply the same
  verify-then-LWW locally; a row the local device has edited more
  recently is kept (its own push will win or lose on the server by
  the same clock).

LWW on wall clocks is deliberately simple. Two devices editing the
same task in the same second can lose one edit; the task-comment
trail and the next edit repair it. This is a community coordination
tool, not a CRDT showcase — the failure mode is a shrug, not a fork.

## 4. Authority rules (server-enforced, client-recomputed)

**ProjectState**
- First accepted write for an id establishes `organizerKey`.
- Updates accepted only when `signerKey` is the STORED version's
  `organizerKey` or one of its `coOrganizerKeys`. (Checked against
  the stored version, not the incoming one — a hostile update cannot
  grant itself authority in the same write. Organizer handoff works
  because the OLD organizer signs the version naming the new one.)

**TaskState**
- Organizer/co-organizers of the stored project: any change.
- Any other member: accepted only when they are the task's claimer —
  `stored.assignedTo == signer` (edit/complete/unclaim their own
  claim) or `stored.assignedTo == null && incoming.assignedTo ==
  signer` (claiming an open task; a task the node has never seen is
  the same case with no stored row).
- Tasks arriving before their project are rejected 409; the outbox
  retries (the same device queues the project first, so ordering
  self-heals).

**Accepted residual, stated plainly:** a claimer can vandalize
non-claim fields of a task they hold (the server does not diff
fields). Visible history, the comment trail, and the organizer's
LWW repair cover it at community scale; field-level diffs are not
worth the machinery. Recorded in threat model §7.

**Known limitations (honest edges of the authority model):**

- **Co-organizer lag.** The node honors a co-organizer's writes only
  once a stored version NAMES them, and only the organizer's device
  can sign that version. The organizer's device republishes
  automatically when it ingests the signed acceptance
  (`materializeAcceptedCoOrganizer` returns the grant and the caller
  publishes) — but while that device is offline, the new
  co-organizer's pushes answer 403 and wait in their outbox.
- **Adoption doesn't cross the wire.** Project adoption
  (docs/project-adoption.md) is a local governance act that swaps
  `organizerKey` WITHOUT the absent organizer's signature — exactly
  the write the handoff rule refuses. An adopter who was already a
  co-organizer keeps federating day-to-day updates; one who wasn't
  federates nothing until the returning primary signs a real handoff.
  Deliberate: the alternative (any quorum can reassign authority on
  the node) is the takeover attack this design exists to prevent.
- **Locked devices publish late.** Signing needs the unlocked
  identity; a mutation made while locked lands locally and republishes
  with the NEXT unlocked mutation of the same row.
- **Same-millisecond edits.** Two devices stamping the same
  `updatedAt` for one row: the first to reach the node wins, the
  other answers 200 `{stored:false}`. The next edit repairs it.

## 5. Client wiring

- `updatedAt` stamped and the row signed at each mutation site in
  `db/projects.ts` via two helpers (`publishProjectState`,
  `publishTaskState`) — explicit calls, matching the repo's explicit
  enqueue style. Signing requires the unlocked identity; on a locked
  device the local write still lands and the publish is skipped
  (next unlocked mutation republishes the row — noted limitation).
- Outbox kinds `project_state` / `task_state` → `POST
  /project-states`, `POST /task-states`.
- Pulls `pullFederatedProjectStates` / `pullFederatedTaskStates` join
  the startup fan-out, and the whole fan-out now ALSO re-runs on an
  interval (3 min) so long-lived tabs converge without a reload.

## 6. Phases

- **Phase 1 (this doc's shipped scope):** ProjectState + TaskState,
  periodic re-pull, docs/threat-model/privacy-policy updates.
- **Phase 2:** EventRsvp + ShiftSignup as single-owner LWW records
  (each row has exactly one legitimate signer — the member it names —
  so the authority rule is one line). Mechanically identical to
  Phase 1; separated only to keep review size sane. `projectActivity`
  rides here too (append-only, author-signed, like comments).
- **Phase 3:** encrypted own-device mirror for whatever stays
  device-local (drafts? governance if it stays local-only): periodic
  snapshot sealed to the member's own key through the device-link
  mailbox. Shrinks as Phases 1–2 land; may never be needed.
- **Out of scope for now:** cross-node peer federation of these kinds
  (`peerPull`) — single community-node scope first; peers can be
  added to the pull loop later exactly like events were.
