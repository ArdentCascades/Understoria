# Understoria — Task ordering + dependencies (design note)

> **Status:** **shipped.** This doc + a threat-model §7 addendum +
> a dedicated "What co-organizers can do" section in
> `docs/co-organizer-invitations.md` §4 landed together as the
> predicate PR. Implementation rolled out across PRs B / C / E / F
> (with D loudly skipped per §12). See §12 for the per-PR shipping
> table; see §13 for the open questions that have since been
> resolved by pilot signal.
> Pairs with the threat-model §7 addendum "`ProjectTask.orderIndex`
> and `dependencies` remain local; widening would need a
> wire-surface review" that lands in this same PR. Read alongside
> `docs/community-events.md` (which sets the precedent for the
> loud-skip of a server-work slot when a primitive stays local-only)
> and `docs/blocking.md` (which sets the precedent for naming a
> federation entry honestly even when it's a "this does NOT
> federate" entry). The contradictory pair this doc reconciles —
> `packages/shared/src/types.ts:455-457` (advisory dependencies)
> vs. `apps/web/src/db/projects.ts:486-489` (hard throw on claim) —
> is the proximate motivation; the resolution is to align the code
> with the documented intent.

---

## §1 Status

**Shipped.** The doc, the threat-model §7 entry, and the
`co-organizer-invitations.md` §4 capabilities enumeration landed
as the predicate PR (#206 / #207 / #208). Implementation phases B,
C, E, F are described in §12 and rolled out in sequence; phase D
remains intentionally skipped because tasks don't federate today
and there is no server work to do (the loud-skip pattern is
borrowed from `docs/blocking.md` §13). See §12 for the per-PR
shipping refs.

Open questions collected in §13 are kept as historical record;
where pilot signal has settled one, the bullet notes the
resolution inline. Nothing in this design ended up provisional —
the four settled decisions in the commit message were and remain
the contract.

## §2 Why now

Operator framing, verbatim from the design conversation:

> "The system should not bother someone who has claimed a task
> until the dependent task has been completed."

That sentence is the entire felt need. It carries two structural
assumptions that the rest of this design respects:

1. **Claim succeeds.** The operator's framing assumes the
   claimer *has* claimed the task. The system's job is to not
   nudge them while they're blocked by structure (waiting for an
   upstream task). The claim itself is not the place to
   intervene; the nudge cadence is.
2. **Reordering exists as a separate, complementary surface.**
   The operator also asked, in the same conversation, for
   drag-and-drop reorder of tasks within a project. This is not
   load-bearing on the soft-block change — the two features
   travel together because they affect the same UI surface
   (`ProjectDetail`'s task list) and because the same authority
   (organizer + co-organizers) governs both.

The proximate motivation is a contradiction inside the existing
code:

- `packages/shared/src/types.ts:455-457` (the `ProjectTask.dependencies`
  field's doc-comment) says: *"Advisory; the UI shows 'blocked' but
  does not enforce."*
- `apps/web/src/db/projects.ts:486-489` (the claim path) throws on
  claim when an upstream dependency is incomplete:
  *"This task follows other tasks that aren't completed yet."*

Both are in the repository today, in tension. The doc-comment
matches the design ethos (`solidarity-not-shame`); the runtime
behavior matches a more rigid view of dependency enforcement that
the codebase doesn't actually want. The operator framing —
"don't bother someone who has claimed a task until [the
dependency] has been completed" — only makes sense if the claim
went through. The hard throw makes that framing impossible to
satisfy.

This PR documents the contradiction. The implementation PRs (C
specifically) resolve it by removing the hard throw and gating the
*nudges* instead of the *claim itself*. The doc-comment will be
rewritten to be honest about the new semantics (see §4).

The narrowest answer that satisfies the felt need is what this
doc designs. Anything broader — federating tasks, federating
order, surfacing stalled-dependency reminders to upstream
claimers — is named in §10 or §13 with the reason it's out of
scope.

## §3 What this changes

This is the load-bearing section. Three changes, named in shape
and explained in tension.

### §3.1 The soft-block reversal (the contradiction fix)

Today's behavior:

- `packages/shared/src/types.ts:455-457` says dependencies are
  advisory.
- `apps/web/src/db/projects.ts:486-489` throws on `claimProjectTask`
  if any dependency isn't `completed`, with the message
  *"This task follows other tasks that aren't completed yet."*

The two are inconsistent. A future contributor reading the type
sees one contract; a member trying to claim a task gets the
other. The discrepancy isn't a bug in the conventional sense —
both halves "work" — but it's a values failure: the runtime
behavior is the system-scolding pattern `solidarity-not-shame`
exists to prevent.

> **Cited principle (`solidarity-not-shame`):** "Never frame a
> situation as stalled, overdue, or failed. Capacity changes;
> the system adapts without blaming anyone."

A claim refused because "this task follows other tasks that
aren't completed yet" is exactly the framing this principle
rejects: the system speaking to the claimer as if their attempt
to commit is a category error, rather than a deliberate choice
the system should support and then quietly stay out of.

**The change: switch from hard block to soft block.** Concretely:

- The hard throw at `projects.ts:486-489` is REMOVED in PR C.
- The `canClaimTask(task, allTasks)` helper at `projects.ts:1164`
  stays — it's still useful, but it now answers a different
  question: "is this task ready to be worked on?" not "can this
  task be claimed?" The two were conflated.
- The claim path no longer reads `canClaimTask` as a gate. Any
  member with project access can claim any open task at any
  time, regardless of upstream dependency status.
- The attention rail (§6.1) and the public "needs more hands"
  chip (§6.2) both consult `canClaimTask` to decide whether to
  surface nudges. If the answer is no — the task is
  structurally blocked — the nudges suppress. The claimer
  doesn't get the private "still on it?" check-in; the project
  page doesn't get the public "needs more hands" chip.
- A visible **"Follows: &lt;upstream task title&gt;"** badge
  <!-- Badge text chosen for neutral sequence framing — matches
       existing "follows" vocabulary in projects.ts (see the
       claim-path error message at projects.ts:486, which already
       reads "This task follows other tasks…"). -->
  renders on the claimed-but-blocked task's row, in both the
  organizer's project view and the claimer's own task view.
  Same place as the existing status pill; same render shape.
  The badge is information, not a scold: it names the sequence
  the task sits in, not what the claimer is failing to do.
- A one-line **"You'll be reminded when it's ready"** note
  appears in the claimer's own task view (only — this is not a
  public surface). The line is the system explicitly
  acknowledging the claimer's commitment: you claimed, we saw,
  we're not going to bother you until the structure clears.

The soft-block reversal aligns the code with the
already-documented intent of the type's doc-comment. The
doc-comment text itself also changes — see §4.

### §3.2 The reorder feature

New field on `ProjectTask`: `orderIndex: number`. Sort key
within a project. Higher values render lower in the list (or
the inverse, whatever the implementation picks — the field
itself is monotonic; the rendering direction is a UI choice).

The reorder surface is a **focused "Reorder tasks" dialog**,
reached from the header kebab on the ProjectDetail page
(`ReorderTasksDialog.tsx`). The main task list itself is a plain
read/act surface: it carries **no** inline reorder affordances —
no drag-on-title handle, no per-row Move buttons. That was a
deliberate consolidation (see the note below): the title used to
double as a drag handle, so any attempt to select or read a title
risked kicking off an accidental reorder, and a pair of arrow
buttons on every row was persistent clutter for what is a rare,
organizer-only action.

The dialog is a strict **superset** of every reorder gesture, so
nothing is lost by moving reordering off the list:

- Drag-and-drop with `@dnd-kit/core` + `@dnd-kit/sortable`,
  working for both pointer and keyboard (PointerSensor +
  KeyboardSensor with `sortableKeyboardCoordinates`). A dedicated
  drag handle on each row carries the sortable listeners.
- **Move up / Move down icon buttons on every dialog row.** This
  is the keyboard-canonical, screen-reader-first path
  (touch-target-44); the drag is sugar. The buttons sit beside
  the drag handle, not on it, so a button click never turns into
  a drag.
- Both paths persist through the same action helper:
  `reorderProjectTask({ taskId, organizerKey, beforeId, afterId })`.
  The button path computes the neighbor pair from the current
  order before calling; the drag path passes the neighbors
  directly. The action signature is settled — see §5.1 for the
  resolution rules.

The authority for the dialog is organizer + co-organizers (see
§8 for the rationale); non-organizers never see the kebab entry.

> **Consolidation note (post-pilot).** Earlier revisions shipped
> two reorder affordances *inline on the list* — the title as a
> drag handle plus always-visible Move buttons per row. Operator
> feedback flagged both as frustration sources (accidental drags
> from title interaction; arrow clutter on every row). The
> reorder machinery now lives solely in the dialog, which
> preserves the full keyboard/drag/button matrix while leaving the
> list clean. The `reorderProjectTask` neighbor-pair contract
> (§5.1) is unchanged.

### §3.3 The chip and attention-suppression extension

Today, the private `task_check_in` attention rail item (the
"still on it?" private nudge) does NOT fire for tasks where
`canClaimTask` returns false — see `apps/web/src/lib/attention.ts:305`.
That suppression is already correct.

But the public `needs_more_hands` chip (computed by
`apps/web/src/lib/taskCheckInState.ts`) does NOT currently
consult `canClaimTask`. So today, a downstream task whose
upstream is still in progress could in principle show the
community-visible "could use more hands" chip on the project
page — chip-shaming a structurally blocked task for "needing
more hands" when the actual blocker is the upstream task, not
the claimer's capacity.

**The change: extend `taskCheckInState.ts` (PR F) to suppress
the public `needs_more_hands` chip when `canClaimTask` returns
false.**

The mechanism is a new optional parameter on `taskCheckInState`
(probably: pass the full project task list, or pass a
pre-computed `isStructurallyBlocked` boolean — PR F picks the
ergonomics). Either way the function gains a guard:

```
if (task is structurally blocked) return "fresh"
```

`fresh` is the existing return value that suppresses both the
private nudge and the public chip; reusing it keeps the function
shape unchanged for the common case.

> **Cited principle (`no-notifications`):** "We show what needs
> your attention when you open the app. No buzzing, no badge
> counts, no urgency theater."
>
> The public chip is the closest thing in the codebase to a
> badge-count shape. Letting it fire on structurally blocked
> tasks would import "urgency theater" by structural accident.

> **Cited principle (`solidarity-not-shame`):** A public chip on
> a structurally-blocked task says "this task could use more
> hands" — which is true in spirit but false in mechanism. The
> task does not need more hands; it needs the upstream task to
> finish. Surfacing the wrong frame publicly is a values
> regression.

## §4 Data model

Two fields. One new, one already there but getting an honest
doc-comment.

### §4.1 `ProjectTask.orderIndex: number` (new)

```ts
/** Sort key within the parent project. Lower values render
 *  earlier in the list (or higher — the rendering direction
 *  is a UI choice, but the field is monotonic). Drag-reorder
 *  inserts use the midpoint between neighbors; lazy renumber
 *  when precision degrades. Backfilled from createdAt rank ×
 *  1000 on Dexie v25 upgrade. Local-only — not part of any
 *  wire surface. */
orderIndex: number;
```

Mechanics:

- **Fractional inserts.** When a task is moved into a position
  between two neighbors, its new `orderIndex` is the midpoint
  of the neighbors' values: `(prev.orderIndex + next.orderIndex)
  / 2`. At the boundaries: moved to the top, use
  `top.orderIndex - 1000`; moved to the bottom, use
  `bottom.orderIndex + 1000`. The `* 1000` gap from the backfill
  (see §11) gives ample headroom.
- **Lazy renumber.** A reorder where the midpoint would round to
  equal one of the neighbors (i.e., precision has degraded too
  far) triggers a per-project renumber: sort by current
  `orderIndex`, re-assign `(rank + 1) * 1000`. Renumber is a
  single Dexie transaction across the project's tasks. It is
  rare; in expected usage it never fires.
- **Never federated.** `orderIndex` is local-only. The whole
  task subsystem is local-only today; see §7. When project /
  task federation lands in a future PR, `orderIndex` is a wire
  field then, with its own threat-model entry.

### §4.2 `ProjectTask.dependencies: string[]` (existing — doc-comment changes)

This field already exists in `packages/shared/src/types.ts:470-472`.
The runtime semantics around it change (the hard claim throw is
removed), and the doc-comment changes to match.

**Current doc-comment (lines 470-472):**

```ts
/** Other task IDs that should complete before this is workable.
 *  Advisory; the UI shows "blocked" but does not enforce. */
dependencies: string[];
```

**New doc-comment (lands in PR B):**

```ts
/** DAG of in-project task IDs that should complete before this
 *  is workable. Claim is allowed regardless; the attention rail
 *  and the public "needs more hands" chip suppress nudges until
 *  dependencies clear. A "Follows: <upstream>" badge keeps
 *  the structural-block state legible to the claimer and to the
 *  organizer. Cycle detection at write time
 *  (`setTaskDependencies`); in-project membership enforced. */
dependencies: string[];
```

The DAG property is real, not aspirational — `detectCycle` at
`projects.ts` already enforces it at the `setTaskDependencies`
write path. In-project membership is also already enforced
(`projects.ts:1210-1213` rejects dependencies that reference
tasks in other projects). Both are documented honestly in the
new comment instead of the existing advisory hedge.

### §4.3 What the data model does NOT add

Named here so a future contributor doesn't misread the design:

- **No `blockedAt` timestamp.** A "stalled-dependency" signal
  would need this; we deferred that surface (see §10). No field
  is added for a feature we're not building.
- **No `taskOrder: string[]` field on `Project`.** Considered
  and rejected (see §10): a per-project ordering list would be
  a second mutation surface to defend against task-add /
  task-delete races. `orderIndex` on the task itself is
  race-free.
- **No CRDT for concurrent reorders.** Rejected (see §10).
  Last-write-wins per `db.projectTasks.put(...)` matches every
  other multi-organizer mutation in `projects.ts`.

## §5 Lifecycle

### §5.1 Order

```
task created → orderIndex = (next available rank) × 1000
   → organizer/co-org reorders any time via drag or Move buttons
   → orderIndex updated to midpoint-of-neighbors
   → (rare) lazy renumber if precision degrades
```

The action helper that handles all reorder paths is
`reorderProjectTask({ taskId, organizerKey, beforeId, afterId })`.
`beforeId` and `afterId` are the task ids of the immediate
neighbors at the destination position — the task that will sit
*before* the moved task in render order, and the task that will
sit *after*. Either may be `null` when the destination is the
very top (`beforeId === null`) or the very bottom
(`afterId === null`) of the list. The button path (Move up /
Move down) and the drag path both resolve to the same neighbor
pair before calling the action; the action itself has one
canonical shape, not a direction-vs-pair union.

The action:

1. Calls `requireOrganizer` (which accepts co-orgs).
2. Resolves `(beforeId, afterId)` to a new numeric
   `orderIndex`: the midpoint of the two neighbors'
   `orderIndex` values when both are present, or a positional
   fallback (`top.orderIndex - 1000` /
   `bottom.orderIndex + 1000`) when one neighbor is `null`.
3. Detects whether the midpoint would degrade precision; if so,
   runs the per-project renumber (§4.1), then recomputes the
   target `orderIndex`.
4. Writes the updated `ProjectTask` row.
5. Returns the new row for the UI to merge.

PR C implements. The neighbor-pair shape was chosen over a
direction-based (`"up"` / `"down"`) shape so the action has a
single canonical form across both UI paths and so the same
helper can serve the drag-to-arbitrary-position case without a
second entry point.

### §5.2 Dependencies

```
organizer/co-org opens edit form
   → picks dependencies from in-project task list
   → submits → setTaskDependencies validates:
        - all referenced tasks exist in this project
        - new dependency set does NOT introduce a cycle
   → on success: row updated; affected downstream tasks may
     transition between "blocked" and "unblocked" structural
     states, which the attention/chip suppression observes
     automatically (no separate state to write)
```

The mechanics here are already shipped — `setTaskDependencies`
exists at `projects.ts` ~line 1190. The only change is the
runtime interpretation of the result (claim is no longer
gated; only nudges are).

### §5.3 Claim (changed)

```
member taps Claim on an open task
   → claimProjectTask:
        - task.status === "open" → proceed
        - (REMOVED: dependency check that throws)
        - project.status === "active" → proceed
        - mark assignedTo, claimedAt, etc.
   → UI re-renders. If canClaimTask is false:
        - "Follows: <upstream task title>" badge appears on
          the task row.
        - "You'll be reminded when it's ready" line appears in
          the claimer's own task view.
        - attention rail does NOT add task_check_in for this
          claimer/task pair (existing behavior at
          attention.ts:305, unchanged).
        - public needs_more_hands chip does NOT fire for this
          task (new behavior in PR F).
   → When the upstream task completes, the suppressions lift
     automatically — there is no separate "unblock" event to
     fire, the computed views simply start surfacing the nudges
     on the next render.
```

The unblock-flips-automatically property is load-bearing for
the design's simplicity: no `onDependencyComplete` callback,
no out-of-band write, no separate notification. The
suppressions are pure computed views over the current task
state of the project; when the upstream's status changes to
`completed`, the next render of any consumer surface re-runs
its derived query, sees `canClaimTask` flip to true, and
behaves accordingly.

## §6 Attention-rail and chip behavior

This is the second load-bearing section. Two surfaces are
involved, and the design's invariant is that neither one
nudges the claimer or the community while a task is
structurally blocked.

### §6.1 `task_check_in` (private attention rail item)

Already suppresses for `!canClaimTask` — see
`apps/web/src/lib/attention.ts:305`:

```ts
if (!canClaimTask(t, projectTasksForDep)) continue;
```

**No change in this design.** This is the existing correct
shape; we're documenting it for completeness, not modifying it.

The suppression matches the operator framing exactly: a claimer
on a structurally-blocked task does not get the private "still
on it?" check-in. They have committed to the task; the system
acknowledges by not nagging.

### §6.2 `needs_more_hands` (public project-page chip)

Computed by `apps/web/src/lib/taskCheckInState.ts` (return
value `"needs_more_hands"`). Currently this function does NOT
consult dependency state — it looks at `claimedAt`,
`checkInAcknowledgedAt`, and node-config thresholds, but not at
whether the task is structurally blocked.

**The change (PR F): extend `taskCheckInState` to return
`"fresh"` (the suppressing value) when the task is structurally
blocked.**

The simplest signature change: take an optional pre-computed
`isStructurallyBlocked: boolean` parameter, with a guard at
the top:

```ts
if (isStructurallyBlocked) return "fresh";
```

The caller (the chip-rendering site on the project page)
already has the full task list in scope and can compute
`canClaimTask(task, allTasks)` cheaply. PR F threads the boolean
through; the test suite locks the suppression.

Per-PR rationale, said in the words of the per-PR commit
message: *"a downstream task that's blocked by structure (not
capacity) shouldn't be publicly chip-shamed for 'needing more
hands.' The chip's purpose is to invite community help with a
task whose claimer is silent; it has no purpose on a task
whose claimer is appropriately waiting for an upstream
finish."*

> **Cited (`no-notifications`):** "We show what needs your
> attention when you open the app. No buzzing, no badge
> counts, no urgency theater."
>
> The chip on a structurally blocked task is the closest the
> codebase comes to a false-positive notification: a visible
> signal whose reason for firing is structurally wrong. The
> suppression is what makes the chip true to its purpose.

> **Cited (`solidarity-not-shame`):** "Never frame a situation
> as stalled, overdue, or failed."
>
> A chip on a blocked task frames the *claimer's silence* as
> the surface state — but the silence is structurally
> appropriate, not a stall. The frame is wrong; the chip
> shouldn't render.

### §6.3 The "Follows" badge

A new render element on every claimed task row in
ProjectDetail (and in the claimer's own task view). Computed
purely from local state:

- If the task is claimed and `canClaimTask` returns false:
  render "Follows: &lt;upstream task title&gt;" near the
  status pill.
- Otherwise: no badge.

The badge is not an attention surface — it does not buzz, does
not occupy the attention rail, does not count toward a badge
count. It is a piece of legibility on a row the member is
already looking at. The frame is structural ("follows")
not evaluative ("late", "stuck"); the same discipline as the
events `event_capacity_reached` decision in
`docs/community-events.md` §8.3 (named at the structural fact,
not at the affected party's behavior).

The render of the badge for multi-dependency tasks (a task
with three upstreams, two of them complete) is left as an open
question for PR E review — list all? show first + count? See
§13.

### §6.4 The claimant acknowledgment line

The claimer's own task view (not the public project page)
gains a single muted line:

> *You'll be reminded when it's ready.*

Rendered only when the task is claimed by the viewing member
AND the task is structurally blocked. The line is the
system's explicit acknowledgment of the claim — the operator
framing translated into the smallest possible legible UI
surface. Same shape as the `co-organizer-invitations.md` §3
comparison-card commitments: name what the system is doing
*for* the member, before they go looking for the silence and
wonder if something is wrong.

### §6.5 Reorders are not in the activity feed

Project activity rows are logged today for task creation and
edits (a dependency change made through the task editor rides
the edit's entry), claim, completion, and confirmation.
**Reorders do not get an activity entry.** They are routine
organizing work, not audit-relevant; the chip-shame footprint
of a `task_reordered` row on every drag would exceed the
signal value. The same discipline that keeps the
`needs_more_hands` chip off a structurally-blocked task (§6.2)
keeps the reorder act off the activity feed: legibility, not
ledger.

If pilot signal shows organizers wanting an auditable trail
of "who reordered what when," a future PR can revisit; the
omission is named here, not buried.

## §7 Federation

> **SUPERSEDED — project federation Phase 1 shipped.** This
> section was accurate when written; it is kept as the
> historical record of the local-only boundary and of the
> obligation §7.4 names (which was honored). The current
> posture: project and task state DO federate as signed,
> full-row last-writer-wins records. `publishProjectState` /
> `publishTaskState` (`apps/web/src/db/projects.ts`) sign the
> whole row — **including `orderIndex` and `dependencies`** —
> the server registers `routes/projectStates.ts`
> (`apps/server/src/server.ts`), the PWA pulls via
> `pullFederatedProjectStates` / `pullFederatedTaskStates`
> (`apps/web/src/lib/federationSync.ts`), and the signed wire
> types are `ProjectState` / `TaskState` in
> `packages/shared/src/types.ts`. See
> `docs/project-federation.md` and the "Federated
> `ProjectState` / `TaskState` records" entry in
> `docs/threat-model.md` §7. Read everything below as "was
> true at design time," not "is true now."

This section follows the loud "What does NOT federate"
discipline from `docs/community-events.md` §7. The section is
short because the answer is short: **none of this federates.**

### §7.1 What federates

Nothing in this design.

### §7.2 What does NOT federate

- **`ProjectTask.orderIndex`.** Local field on a local row.
  No outbox enqueue, no peer-pull cursor, no server route.
- **`ProjectTask.dependencies`.** Already local. The runtime
  change (soft block instead of hard block) is also local —
  no wire field changes, no canonical-payload change, no
  signature recompute.
- **The whole project / task subsystem.** Tasks don't federate
  today, period.

### §7.3 Evidence that tasks don't federate today

So a future contributor reading this doc doesn't have to take
it on faith:

- **Server route registration.** `apps/server/src/server.ts`
  registers routes for `exchanges`, `vouches`, `posts`,
  `invites`, `claims`, `taskComments`, `autoConfirm`,
  `coorgInvitations`, `coorgInvitationResponses`,
  `coorgInvitationRevocations`, `events`, and
  `eventCancellations`. There is no `projects` route. There
  is no `projectTasks` route. Project state never reaches the
  server.
- **PWA-side federation pulls.** `apps/web/src/lib/federationSync.ts`
  exports `pullFederatedPosts`, `pullFederatedClaims`,
  `pullFederatedTaskComments`, `pullFederatedExchanges`,
  `pullFederatedCoOrgInvitations`,
  `pullFederatedCoOrgResponses`,
  `pullFederatedCoOrgRevocations`, `pullFederatedEvents`, and
  `pullFederatedEventCancellations`. There is no
  `pullFederatedProjects`. There is no `pullFederatedProjectTasks`.
  No project or task state is ever pulled from peers.
- **Project records are not signed.** `Project` and
  `ProjectTask` have no `signature` field. They are local
  Dexie rows.

The federation layer has no knowledge of project tasks. Adding
`orderIndex` does not change this. Removing the claim-time
throw does not change this. The whole feature lives inside the
PWA, in the user's local Dexie.

### §7.4 When project federation eventually lands

This is the load-bearing forward-looking sentence in this
section, said in the same shape as `docs/threat-model.md` §7's
existing precedent at line 572 ("A future PR may promote
`recurringCadence` to a first-class field on `ProjectTask`
with its own threat-model entry covering the projection
surface."):

> **A future PR that promotes any `ProjectTask` field to a
> federated wire surface — including `orderIndex` and
> `dependencies` — must land its own threat-model §7 entry
> enumerating the new wire fields, the adversary mapping, the
> mitigations, and the residual risk.** This is the discipline
> the `docs/community-events.md` workstream followed for
> `Event`, and the discipline the co-organizer invitations
> workstream followed for `CoOrganizerInvitation`. Project /
> task federation is not in scope for this PR; flagging the
> future obligation here, plus a one-bullet pointer in the
> threat-model addendum, preserves the boundary explicitly.

This is the same flag-not-punt posture the events doc takes on
its phase-2 templates (§10) and the blocking doc takes on the
already-paired-device sync gap (§14.1). Future work is named so
a reader walking the doc end-to-end sees what's left, not just
what's done.

## §8 Authority

Organizer + co-organizers can:

- Reorder tasks (`reorderProjectTask` — new in PR C).
- Add tasks (`addProjectTask` — existing).
- Edit tasks (`editProjectTask` — existing).
- Set dependencies (`setTaskDependencies` — existing).

All four go through `requireOrganizer(projectId, callerKey)` at
`projects.ts:342-351`, which accepts both the primary
organizer and co-organizers via `isOrganizer`:

```ts
export function isOrganizer(project: Project, memberKey: string): boolean {
  return (
    project.organizerKey === memberKey ||
    project.coOrganizerKeys.includes(memberKey)
  );
}
```

(`coOrganizerKeys` is the materialized live authority list —
written on every grant and removal since PR #238 — and the
authority check reads it directly. See
`docs/co-organizer-invitations.md` §5.)

This matches the established precedent in
`docs/co-organizer-invitations.md` §1 and the dedicated
capabilities enumeration in §4 of that same doc — co-organizer
authority covers "the project's actions": confirming task
completions, signing records that commit the co-organizer's
identity, and acting as a community-vouched authority for the
project's coordination.

Reorder and dependency-set both fit cleanly inside "the
project's actions." A co-organizer who signed an acceptance
record (per the PR #174 flow) has committed to project-
coordination authority; reordering and dependency-setting are
project-coordination acts. No new authority class is created;
no carveout is needed.

The cross-reference back to this design doc lives at
`docs/co-organizer-invitations.md` §4 (the "Reorder tasks
within the project" capability bullet points back here).

What's NOT included in this authority:

- **Claim** — any member with project access can claim. (Same
  as today, with the soft-block change applied.)
- **Confirm completion** — already organizer + co-org per the
  existing `confirmProjectTaskCompletion` path; unchanged.
- **Set the project's own authority** (add/remove
  co-organizers) — covered by the co-organizer invitations
  workstream; unchanged.

## §9 Accessibility

The reorder UI ships with two paths, of which the buttons are
the canonical one.

### §9.1 Library choice: `@dnd-kit`

`@dnd-kit/core` + `@dnd-kit/sortable`. Picked because:

- It ships **keyboard sensors out of the box**: Tab to focus a
  draggable handle, Space to grab, arrow keys to move, Space
  to drop, Esc to cancel. The keyboard sensor is a first-class
  citizen, not an afterthought.
- It ships **screen-reader live-region announcements** out of
  the box. The default announcer says useful things like
  "Picked up sortable item. Sortable item is in position 3 of
  7." The announcements are localizable (i18n review in PR
  E).
- It's already a small dependency footprint; no large library
  is being introduced for one feature.
- It composes cleanly with existing list rendering — no
  wrapper-component churn through the rest of the codebase.

Rejected alternatives:

- **HTML5 native drag-and-drop API.** Notoriously bad keyboard
  story; screen-reader story is worse; no built-in animation
  hooks; touch story is incomplete. We would have had to build
  the keyboard sensor ourselves, which is the precise wheel
  `@dnd-kit` is reinventing well.
- **react-beautiful-dnd.** Unmaintained as of late 2025
  (project marked stale by its maintainers). No.
- **Hand-rolled solution.** Cost is not justified for one
  feature.

### §9.2 Always-visible Move up / Move down buttons

**The buttons are the canonical reorder path. Drag is sugar.**

This is the load-bearing accessibility decision in this
section. Stating it as the contract:

> Every reorder row, on every device, at every breakpoint,
> renders a Move up button and a Move down button. The buttons
> are not hidden on touch. The buttons are not hidden on
> desktop. The buttons are not collapsed into a "…" menu.
> They are visible, focusable, and operable from every device
> a member might use.

> **Where the reorder rows live (post-pilot amendment).** These
> rows are now the rows *inside the "Reorder tasks" dialog*, not
> the main task list — see the §3.2 consolidation note. The
> accessibility contract is unchanged: every dialog row still
> carries both Move buttons, at 44 × 44, on every device. The
> only change is that reordering is entered deliberately (via the
> header kebab) rather than being always-live on the list, which
> removed the accidental-drag and per-row-clutter traps operators
> reported.

The buttons are not a fallback. They are the canonical path.
A member who has never figured out the drag gesture — keyboard
user, screen-reader user, member on a touch screen with motor-
control challenges, member who simply prefers buttons — should
have a frictionless, fast, well-supported way to reorder
tasks. The buttons are that way.

The drag-and-drop path is sugar for the member who finds drag
faster on a desktop. It is not the primary affordance.

### §9.3 Touch-target floor and labelling

- **44 × 44 CSS pixels minimum** for each button's hit area.
  (Matches the touch-target floor used elsewhere in the app,
  per `docs/accessibility.md` precedent.)
- **`aria-label`** on each button: "Move &lt;task title&gt; up"
  / "Move &lt;task title&gt; down." The task title is
  interpolated so a screen reader voicing the buttons reads
  unambiguously which task is being acted on.
- **Live region announcement** on every reorder (button or
  drag): "&lt;task title&gt; moved to position N of M." The
  announcement uses `aria-live="polite"` so it doesn't
  interrupt other speech; the announcer is a single shared
  ARIA live region on the project page, not a per-button one.

### §9.4 Disabled states

- The topmost task's Move up button renders disabled (with
  `aria-disabled="true"`). Same for the bottommost task's
  Move down. No "wraparound" — a reorder that would move a
  task off the ends is just not offered.
- During a drag (when the user has grabbed an item), the
  Move buttons on other rows render disabled to avoid
  conflicting state. Same for the keyboard path: while a
  sortable item is "picked up" via the keyboard sensor, the
  Move buttons elsewhere are not interactive.

### §9.5 i18n keys

PR E adds i18n keys under `task.reorder.*` for the button
labels, the live-region templates, and the disabled-state
help text. English and Spanish locales both. Same discipline
as the events / co-org / blocking i18n work.

## §10 Rejected alternatives

Each rejection names the reason. The list is the contract — a
future contributor proposing one of these supersedes the
rejection by naming why the reasoning here no longer holds.

### §10.1 Hard block on claim (the status quo)

**Rejected.** This is the behavior at `projects.ts:486-489`
today. It is the system-scolding pattern that contradicts
`solidarity-not-shame` and the existing type doc-comment.

The operator framing — *"the system should not bother someone
who has claimed a task until the dependent task has been
completed"* — assumes the claim succeeded. A hard block makes
that framing impossible to satisfy; the framing presupposes
the very state the hard block prevents. The contradiction is
in the framing, not in the operator's intent; the resolution
is to align the code with the framing, not to argue with the
operator.

### §10.2 Per-task signature for federation-readiness now

**Rejected as premature.** A `signature` field on `ProjectTask`
would let tasks federate someday without a wire-shape break.
But tasks don't federate today; adding a signature now would
widen the type surface for zero current benefit and would
imply a federation posture the code does not actually hold.

`docs/threat-model.md`'s precedent at line 572 is exactly this
shape: "A future PR may promote `recurringCadence` to a
first-class field on `ProjectTask` with its own threat-model
entry…" The pattern is one-threat-model-entry-per-wire-surface,
landed in the same PR that widens the wire. Pre-emptively
adding fields ahead of need is a wire-surface promise the code
isn't ready to keep; the discipline is to wait until federation
is actually happening and then thread the needle in one PR.

### §10.3 Separate `Project.taskOrder: string[]` list

**Rejected.** A per-project task-order array on the parent
`Project` row was considered. Its appeal: a single ordered
list is conceptually clean.

Its cost: a second mutation surface that must be defended
against task-add and task-delete races. When a task is added,
`Project.taskOrder` must be appended. When a task is deleted,
`Project.taskOrder` must be filtered. Either of these
concurrent with a reorder write produces a race condition that
LWW per-row semantics don't catch — the reorder writes the
array as it was when it read it, before the add/delete landed,
and clobbers the concurrent change.

`orderIndex` on the task itself is race-free: each `put` writes
exactly one row's `orderIndex`; adds and deletes don't touch
the field; no inter-row invariant must hold mid-transaction.
The simpler representation wins.

### §10.4 CRDT for concurrent reorders

**Rejected.** A CRDT (RGA, LSEQ, or similar list-CRDT) would
give us mathematically clean concurrent-reorder semantics in a
multi-organizer setting.

The cost is wildly disproportionate to the benefit. Every
other multi-organizer mutation in `projects.ts` is LWW: latest
`db.projectTasks.put(...)` wins. Reorder is a routine
edit-the-task act; treating it as the one place that needs a
CRDT would be selecting one feature for special treatment for
no values-grounded reason.

`docs/community-events.md` §8.3 sets the precedent: the
organizer's events workstream uses LWW for cancellation
because that matches the rest of the codebase. The same logic
applies here.

### §10.5 Out-of-project dependencies

**Rejected.** A dependency that points at a task in a
different project ("Project A's Task 3 depends on Project B's
Task 7") was considered.

`setTaskDependencies` at `projects.ts:1210-1213` already
enforces in-project membership and rejects out-of-project
references. Cross-project dependencies would introduce a
coupling boundary (Project A's claim-state now depends on
Project B's task state) that adds a federation question (what
if Project B is on a peer node, when projects eventually
federate?), an authority question (who can set such a
dependency — A's organizer? B's organizer? both?), and a
visibility question (does A's project page surface B's task
title, even to a member with no access to B?). None of these
are problems we have today.

We don't yet need cross-project dependencies, and the
boundary cost is not zero. Out of scope.

### §10.6 Stalled-dependency surfacing

**Deferred.** A surface that says "this task's upstream
hasn't moved in N days — ping the upstream claimer" was
considered.

The operator framing doesn't ask for it. The existing
maintainer chip (`taskCheckInState`'s `needs_more_hands`)
already surfaces stuck claims at the dependency itself — when
the upstream task's claimer goes silent past the
node-configured grace window, the upstream gets the public
chip, which is the community-visible nudge for "could use
more hands here." That's the right place for the nudge; it
fires on the dependency itself, not on the downstream.

If pilot signal shows that the upstream chip is missing
attention from members who only watch downstream tasks, a
future PR can revisit. Phase 1 ships without it.

### §10.7 Auto-reorder by urgency / category / age

**Rejected.** A "sort by urgency descending" or "sort by
created-at ascending" affordance was considered as a
zero-config alternative to manual reorder.

`docs/community-events.md` §8.3's rationale applies: an
automatic ordering by an attribute that members didn't pick
turns the order into an implicit ranking signal — exactly the
shape the codebase avoids elsewhere (no like buttons, no
upvotes, no popularity sorts). Manual reorder lets the
organizer encode the *meaning* they want the list to carry —
"do this first because it unblocks the volunteer kitchen,
not because it has the highest urgency tag." The values cost
of an auto-sort is that the list stops carrying that meaning.

The reorder feature exists precisely because the organizer
wants to encode meaning the system can't infer.

## §11 Migration

Dexie v24 → v25. The schema string for `projectTasks` at
`apps/web/src/db/database.ts:309-310` is:

```
projectTasks:
  "id, projectId, status, assignedTo, createdAt, [projectId+status]",
```

No new index is needed for `orderIndex` — sorts happen in
memory after `where("projectId").equals(...).toArray()` for the
project view, and the per-project row count is bounded by
realistic project sizes (tens of tasks, not thousands). The
schema string is therefore unchanged for v25 from v24's
`projectTasks` definition. (v25's `stores({})` call may be
empty or may simply re-declare `projectTasks` for clarity —
implementation choice in PR C.)

The v25 upgrade callback backfills `orderIndex` per project:

```ts
this.version(25).stores({}).upgrade(async (tx) => {
  const tasks = await tx.table("projectTasks").toArray();
  // Group by projectId.
  const byProject = new Map<string, ProjectTask[]>();
  for (const t of tasks) {
    const list = byProject.get(t.projectId) ?? [];
    list.push(t);
    byProject.set(t.projectId, list);
  }
  for (const list of byProject.values()) {
    list.sort((a, b) => a.createdAt - b.createdAt);
    for (let i = 0; i < list.length; i++) {
      const t = list[i];
      await tx.table("projectTasks").put({
        ...t,
        orderIndex: (i + 1) * 1000,
      });
    }
  }
});
```

The `* 1000` gap is the headroom for fractional inserts. With
1000-unit gaps, a member can insert 9-10 tasks between any two
existing tasks without triggering the lazy renumber (each
insert halves the gap, and IEEE-754 doubles maintain integer
precision well past any realistic reorder count). For a project
that grows past ~500 reorders without a renumber, the lazy
renumber path catches the precision degradation; see §13.

Backfill order is by `createdAt` ascending so the post-
migration order matches the order tasks were created in,
which is what the current UI shows (tasks render in created-
at order today). Members see no visible change after the
migration — same order, just now backed by an explicit field.

## §12 Implementation phases

Six PR slots; PR D is intentionally and loudly skipped. The
loud-skip pattern is borrowed from `docs/blocking.md` §13 (which
loud-skipped PR D because blocks don't federate). Same posture
here: tasks don't federate, no server work, no PR D.

**Shipping table (all of B / C / E / F merged; D intentionally
absent):**

| PR slot | Merged as | Subject |
| --- | --- | --- |
| A — predicate doc + cross-doc edits | #206 | this doc, threat-model §7 entry, co-organizer-invitations §4 |
| B — shared types | #207 | `orderIndex` on `ProjectTask`, `dependencies` doc-comment rewrite |
| C — Dexie v25 + soft-block flip + tests | #209 | migration, `reorderProjectTask`, removed claim-time throw |
| D — server / federation | *(skipped, loudly)* | no federation surface; see entry below |
| E — UI: drag + Move buttons + Follows badge | #214 | `@dnd-kit` + keyboard parity + claimant ack line; FLIP animation + Reorder modal in #215 |
| F — public-chip suppression | #216 | `needs_more_hands` chip honours structural blocks |

PR D's intentional absence is still loud and is preserved as a
guardrail for future contributors.

- **PR A — this doc + cross-doc edits.** *This PR.*
  - `docs/task-ordering-and-dependencies.md` (new — this file).
  - `docs/threat-model.md` §7 entry: "`ProjectTask.orderIndex`
    and `dependencies` remain local; widening would need a
    wire-surface review."
  - `docs/co-organizer-invitations.md` §4: dedicated "What
    co-organizers can do" section enumerating every
    organizer-gated action including reorder and
    dependency-set, with a cross-reference back to this doc.
  - Pure documentation. No code touched.

- **PR B — shared types.**
  - Add `orderIndex: number` to `ProjectTask` in
    `packages/shared/src/types.ts`.
  - Rewrite the `dependencies` doc-comment to match §4.2.
  - Type-only PR. No Dexie, no UI, no server.
  - Unit tests at the type level if any test infrastructure
    exists for type shape (or a compile-only smoke test).

- **PR C — Dexie v25 + migration + `reorderProjectTask` +
  remove claim-time throw + tests.**
  - Dexie version bump v24 → v25 (see §11).
  - Backfill `orderIndex` per project in the upgrade callback.
  - New action helper
    `reorderProjectTask({ taskId, organizerKey, beforeId, afterId })`
    in `apps/web/src/db/projects.ts`. Uses `requireOrganizer`.
    Computes midpoint-or-renumber per §5.1.
  - **Remove the claim-time throw at `projects.ts:486-489`.**
    The `canClaimTask` helper at `projects.ts:1164` stays; only
    the claim-path read of it is removed.
  - Test coverage:
    - Migration: pre-v25 tasks gain `orderIndex` matching
      `createdAt` rank × 1000.
    - `reorderProjectTask` direction path (up / down).
    - `reorderProjectTask` insert-between path.
    - Lazy renumber fires when precision would degrade.
    - **Claim of a structurally blocked task SUCCEEDS** —
      this is the load-bearing test that locks the soft-block
      reversal in code.
    - `canClaimTask` still correctly returns false for the
      structurally-blocked claimed task (so attention rail /
      chip suppression still has its signal).
    - Co-org authority: a co-organizer can call
      `reorderProjectTask`.

- **PR D — INTENTIONALLY SKIPPED.**
  - No server work.
  - No new routes. No peer-pull cursor. No
    `pullFederatedProjectTasks`. No
    `pullFederatedProjectTaskOrders`. The discriminators
    `"projectTask"` and `"projectTaskOrder"` are not part of
    any federation surface.
  - The load-bearing absence of PR D is the same pattern as
    `docs/blocking.md` §13 + the EventRSVP outbox carveout: a
    primitive (or set of primitives) that stays meaningful by
    staying entirely local.
  - **This slot is named in the implementation plan precisely
    so a future contributor reading "PRs B, C, E, F" doesn't
    quietly add a PR D for "consistency" with the events
    workstream.** There is no PR D here, deliberately.

- **PR E — ProjectDetail UI: `@dnd-kit` + Move buttons +
  dependency picker + "Follows" badge + claimant note +
  i18n.**
  - Integrate `@dnd-kit/core` + `@dnd-kit/sortable` on the
    task list in `apps/web/src/pages/ProjectDetail.tsx` (or
    wherever the task list lives).
  - Always-visible Move up / Move down buttons on every task
    row, per §9.2. 44 × 44 touch target, `aria-label` per
    task. Disabled at the ends.
  - Live-region announcement on every reorder (button or
    drag).
  - Dependency-picker enhancements as needed for the existing
    `setTaskDependencies` flow (no functional change; UX
    polish if needed).
  - **"Follows: &lt;upstream task title&gt;" badge** on
    blocked-claimed task rows in both the organizer and
    claimer views (per §6.3).
  - **"You'll be reminded when it's ready" line** on the
    claimer's own task view (per §6.4).
  - i18n keys under `task.reorder.*` and `task.follows.*`
    in `apps/web/src/i18n/locales/en.json` and `es.json`.
  - Tests for the button path (keyboard), the drag path (pure
    library; smoke test), and the badge / claimant-note
    renders.

- **PR F — Suppress `needs_more_hands` chip for
  structurally-blocked tasks. Update `taskCheckInState`
  caller signature.** Delivered in PR (this PR).
  - Extend `apps/web/src/lib/taskCheckInState.ts` to take an
    optional `isStructurallyBlocked` parameter (or analogous
    shape), with the guard at the top per §6.2.
  - Update the chip-rendering call sites to pass the new
    parameter (computed as `!canClaimTask(task, allTasks)`).
  - Test coverage:
    - Existing `taskCheckInState` tests continue to pass.
    - New positive test: structurally-blocked task with a
      claim past the public floor returns `"fresh"` (chip
      suppressed).
    - New negative test: an UNBLOCKED stuck claim still
      returns `"needs_more_hands"` past the public floor
      (regression lock — we haven't broken the existing
      chip).

## §13 Open questions

- **The `* 1000` gap heuristic for `orderIndex`.** Works for
  the projected pilot scale (tens of tasks per project, dozens
  of reorders per project lifetime). For a project that
  accumulates ~500 reorders without a renumber, fractional
  precision starts to degrade and the lazy renumber path will
  fire more often. The heuristic may need tuning if real-world
  data shows the renumber firing more frequently than expected.
  Not blocked; pilot signal will tell us.

- **The "Follows" badge for multi-dependency tasks.** A
  task with three upstream dependencies, only one of which is
  complete, has two "follows" candidates. Render shapes
  to consider:
  - List all unblocked-upstream titles, comma-separated. Clean
    when there are 2-3; verbose when there are more.
  - Show the first unblocked-upstream title + "(+ N more)".
    Loses information; the +N may need a popover.
  - Show a count only: "Follows 2 tasks". Loses the most
    information; least clutter.
  Recommend leaving this open for PR E review with the
  designer; pilot data may help pick. The information cost vs.
  visual cost trade-off doesn't have an obvious right answer.

- **Click handling on the "Follows" badge.** Should the
  badge be a link to the upstream task (scroll-to or
  highlight)? Recommend yes for legibility, but the routing
  shape inside ProjectDetail is PR E's call. Not blocked.

- **Renumber observability.** When the lazy renumber path
  fires, it writes every task in the project in one
  transaction. For a member watching ProjectDetail at the
  exact moment of a renumber, the list may briefly flicker
  as the rows re-render with new `orderIndex` values. PR E
  may want to batch the renumber render or simply tolerate
  the flicker (it's rare). Not blocked.
