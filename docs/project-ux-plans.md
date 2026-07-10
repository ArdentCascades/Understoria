# Project UX — improvement plans (June 2026)

> **Status: SHIPPED.** All twelve plans landed as PRs #242–#253
> (plan 1 → #242, 2 → #243, 3 → #244, 4 → #245, 5 → #246, 8 → #247,
> 6 → #248, 7 → #249, 9 → #250, 10 → #251, 11 → #252, 12 → #253).
> The rest of this document is preserved as the design record; the
> original planning-time status note follows.
>
> **Historical-boundary note (July 2026):** several analyses below
> lean on "projects/tasks never federate," which was true at writing
> and load-bearing for the verdicts then. Project & task STATE now
> federates as signed LWW records (`docs/project-federation.md`).
> The shipped verdicts themselves stand (the event⇄project link
> remains local; sentinel rows remain rejected), and adoption has
> since moved too: adoption proposals, votes, and closures now
> federate through the community node (`docs/proposal-federation.md`
> G1/G2 — the `project_adoption` closure deliberately has no
> pull-side effect, since the ProjectState record already carries
> the handoff). Read any "projects don't federate" or "adoption is
> local" clause here as dated.
>
> **Status at writing: PROPOSED.** Nothing in this document is committed work. Each
> section is an implementation plan for one improvement to the
> organizer / co-organizer / helper experience on projects, produced by
> a planning pass over the codebase following the June 2026 audit
> cycle (PRs #233–#240). Per `deliberation-over-speed`, the design-
> conversation items (Part III) want community discussion before any
> code; the small and medium items (Parts I–II) are ready to build as
> written, pending a maintainer go-ahead.
>
> Every plan was checked against the principle ledger
> (`apps/web/src/content/design-principles.ts`) and the wire-surface
> posture in `docs/threat-model.md` §7. File paths and line references
> were verified against the tree at the time of writing (post-#240);
> line numbers will drift — symbols are the stable anchors.

## Index

| # | Item | Tier | Effort | One line |
|---|------|------|--------|----------|
| 1 | Task deep-links | small | M | Rail and /my-tasks links land on the task row, not the page top |
| 2 | Confirmation-outflow attribution | small | S | Organizer balances explain hours moved to helpers on a project's behalf |
| 3 | "Working alongside" roster | small | M | Names-only, alphabetical contributor card on the project page |
| 4 | Fresh copy of a completed task | small | S | One-tap re-open for recurring work |
| 5 | "Could use more hands" project filter | small | S | Board filter pointing at projects whose tasks surfaced the chip |
| 6 | Actual hours at completion | medium | M | Credit records the time actually given — the equal-time fix |
| 7 | "Projects you organize" view | medium | M | Organizer-side twin of /my-tasks |
| 8 | Co-organizer authority reconciliation | medium | S–M | End the rows-vs-array divergence at the four #235 read sites |
| 9 | Project completion moment | design conversation | M | One-time, aggregate-only closure card |
| 10 | Project work days | design conversation | M | Events ↔ projects via a local-only link table |
| 11 | Orphaned-project adoption | design conversation | L | Community proposal installs stewardship when a primary vanishes |
| 12 | Clone offers co-organizer re-invitations | design conversation | S | Consent re-performed, never inherited |

## Cross-plan sequencing notes

- **Dexie versions are claims, not reservations.** Plans 6 (actual
  hours) and 10 (work days) each assume "next version = v26" because
  v25 was latest at planning time. Whichever lands first takes v26;
  the other renumbers. Same for any plan landing after them.
- **Land plan 8 (reconciliation) early.** Plans 7, 10, and 11 each
  carry an "inherited divergence" caveat about the rows-derived
  co-organizer view; if plan 8's Option B lands first, those caveats
  (and one open question each) simply disappear, and plan 7's
  authority-predicate paragraph becomes the codebase-wide rule rather
  than a deliberate divergence.
- **`ProjectDetail.tsx` is the contention point.** Plans 1, 3, 4, 6,
  9, 10, and 12 all touch it. They compose (different regions), but
  land them serially, not in parallel branches.
- **The `isOrganizer` comment block and co-organizer design-note §5**
  are rewritten by plan 8 and referenced by plans 7, 10, 11. Plan 8's
  doc edit supersedes the "residual divergence" language everywhere.
- **Shared test factories.** Plan 6 adds a required `actualHours`
  field to `ProjectTask`, which touches every task fixture factory the
  other plans' tests also use. Rebase noise, not conflict.

---

# Part I — Small, ready to build

## 1. Task deep-links
**Tier:** small — **Effort:** M

### Why
Attention-rail items (`confirm_task` at apps/web/src/components/AttentionSection.tsx:232, `task_check_in` at :364) and /my-tasks rows (apps/web/src/pages/MyTasks.tsx:83 `TaskRow`) all link to `/project/${projectId}` and drop the member at the top of a ~2,861-line page. The anchor ids already exist: both `<li>` render paths in `TaskList` carry `id={`task-${task.id}`}` (apps/web/src/pages/ProjectDetail.tsx:1193 non-organizer, :1276 organizer), and `FollowsBadge` already jumps to them via `document.getElementById(\`task-${dep.id}\`)` + `scrollIntoView` (:982-984). What's missing is: hash-bearing links, a hash handler on ProjectDetail, focus management, and the filtered-out edge case.

### Ethos check
- **no-notifications:** pull-only — nothing pushes; the member still initiates by tapping a rail item they opened themselves. No badges or counts added anywhere.
- **solidarity-not-shame:** the highlight is a transient "here's the thing you asked for" locator, not a status marker; no day-counters, no "overdue" framing. Copy for the one new string ("Showing all tasks...") names a mechanical fact, blames no one.
- **no-leaderboards / no-activity-search / community-authority:** untouched.
- **threat-model §7:** pure local navigation; the hash never leaves the device and no wire surface changes (`OutboxRow.kind` in apps/web/src/db/database.ts:98-108 untouched; tasks stay local-only).

### Design
- Links gain `#task-<taskId>`: both task renderers in AttentionSection and the row link in MyTasks' `TaskRow` (the project-heading link in `ProjectGroup` stays project-level).
- ProjectDetail adopts the proven in-repo hash pattern from apps/web/src/pages/Help.tsx:39-49 (`useLocation` + `scrollIntoView` with `behavior: reduced ? "auto" : "smooth"` via `useReducedMotion`), plus focus: give the target `<li>` `tabIndex={-1}` and call `.focus()` so screen-reader/keyboard users land on the row (announcing its content), mirroring ScrollToTop's focus discipline (apps/web/src/components/ScrollToTop.tsx — which no-ops on hash-only changes, so no conflict; on fresh PUSH it scrolls to top first and our later row-scroll wins, same as Help).
- Transient highlight: `highlightTaskId` state in `ProjectDetailPage`; the matching `<li>` gets ring classes (e.g. `ring-2 ring-canopy-400 motion-safe:transition-shadow`) cleared by a ~2s timeout. Reduced motion: instant scroll, ring still shown (static emphasis is not motion).
- **Filtered-out edge (decision):** filter + search state is session-only and resets to `"all"`/empty on mount (ProjectDetail.tsx:125-133), so cross-page deep-links always find the row. The gap is same-page hash navigation (member already on the project with the "Done"/"Mine" pill or a search active, taps a rail item for that same project — no remount). Decision: when the hash names a task that exists in `tasks` but not in `visibleTasks`, reset `taskFilter` to `"all"` and clear `query`/`debouncedQuery` once, announce it via a visually-hidden `aria-live` region, and scroll on the next effect pass. Justification: the hash is explicit member intent ("show me this task"); silently not scrolling — or scrolling to nothing — reads as broken, and the visible pill state change plus the announcement keep the reset honest. Guard with a `handledHashRef` so the member can re-filter afterwards without it snapping back.
- **Drag/reorder conflict check (verified, none):** the id sits on the `<li>`; @dnd-kit's `useSortable({ id: task.id })` uses context ids, not DOM ids, and `setNodeRef` attaches to an inner div in `SortableTaskRow` (:1354). The FLIP ref (`registerFlipRow`) and the new `tabIndex`/highlight class coexist on the `<li>`. `DragOverlay` renders a detached copy without the id, so no duplicate-id risk mid-drag.

### Implementation steps
1. apps/web/src/components/AttentionSection.tsx — change `to={`/project/${item.projectId}`}` to ``to={`/project/${item.projectId}#task-${item.taskId}`}`` in the `confirm_task` (:232) and `task_check_in` (:364) renderers (both items carry `taskId` per `AttentionItem` in apps/web/src/lib/attention.ts:58-65).
2. apps/web/src/pages/MyTasks.tsx — in `TaskRow` (:83), link to ``/project/${project.id}#task-${task.id}``.
3. apps/web/src/pages/ProjectDetail.tsx — in `ProjectDetailPage`: import `useLocation` (react-router-dom) and `useReducedMotion` (@/lib/a11y/useReducedMotion); add `highlightTaskId` state, `handledHashRef`, and a `useEffect` keyed on `[location.hash, tasks, visibleTasks, reduced]` implementing: parse `#task-(.+)`; if absent in `tasks`, wait (live data may still hydrate); if absent in `visibleTasks`, reset `taskFilter`/`query`/`debouncedQuery` and set an `announcement` string; else `scrollIntoView({ behavior, block: "center" })`, focus the `<li>`, set/clear `highlightTaskId` on a timeout.
4. Same file — thread `highlightTaskId` into `TaskList` as a prop; on both `<li>` render paths (:1193, :1276) add `tabIndex={-1}` and conditional highlight classes when `task.id === highlightTaskId`.
5. Same file — render a `sr-only` `aria-live="polite"` div near the tasks `<section>` (:476) carrying the filters-cleared announcement.
6. Optional consistency: switch `FollowsBadge`'s inline jump (:981-985) to honor `useReducedMotion` the same way.

### i18n
- `projects.detail.taskDeepLink.filtersCleared`: `"Showing all tasks so the linked task is visible."`
- Matching `es.json` entry required (parity enforced by apps/web/src/i18n/parity.test.ts).

### Test plan
- New `apps/web/src/pages/ProjectDetail.deeplink.test.tsx` using the ProjectDetail.claimerqol.test.tsx harness (mock `@/state/AppContext`, `@/state/ToastContext`, `dexie-react-hooks`, `@/db/projects`, import `@/i18n`; `MemoryRouter` + `Routes`). Stub `Element.prototype.scrollIntoView = vi.fn()` (jsdom lacks it). Cases: (a) initial entry `/project/proj-1#task-t2` scrolls + focuses + highlights the right `<li>`; (b) with hash for a nonexistent task, no crash, no scroll; (c) same-page hash navigation while the "Done" pill is active resets to "All" (`aria-pressed`), announces, then scrolls; (d) reduced-motion mock → `behavior: "auto"`.
- Extend apps/web/src/pages/MyTasks.test.tsx: row anchor `href` ends with `#task-<id>`.
- Extend apps/web/src/components/AttentionSection.checkin.test.tsx (and the confirm_task path in attention tests): link `href` includes the hash.

### Open questions
- Should tapping the same rail item twice re-trigger the scroll (use `location.key` in deps) or is once-per-hash enough? Plan assumes once-per-hash.
- Highlight duration (proposing 2s) and whether the ring should also appear for `FollowsBadge` in-page jumps for consistency.

## 2. Organizer confirmation-outflow attribution in the balance breakdown
**Tier:** small — **Effort:** S

### Why
`confirmProjectTaskCompletion` debits the signing organizer (`helpedKey = organizerKey`, apps/web/src/db/projects.ts:709, hours `task.estimatedHours`:729) on Exchanges tagged `postId: "project:<projectId>/task:<taskId>"` (:717, :726); the auto-confirm sweep does the same against the primary organizer (apps/web/src/lib/autoConfirmSweep.ts:167-168). An organizer's Profile balance can drift well below seed with no explanation in the `BalanceCard` (apps/web/src/pages/Profile.tsx:665-768) — the drop looks like personal over-consumption when it is actually hours they moved to helpers on the community's behalf.

### Ethos check
- **solidarity-not-shame:** the entire point — the line explains a low balance without "debt/owe/behind" framing; copy is "hours you moved to helpers on behalf of <project>". Shown only on the member's own profile.
- **no-leaderboards / no-activity-search:** the helper aggregates the *viewing member's own* exchanges only; no per-member stats about anyone else, no ranking surface. Per-project grouping ranks projects by hours, which is project-level (same register as `contributedHours` already shown on every project card).
- **equal-time:** unchanged; display-only, no credit-model change (`balanceFor` untouched).
- **threat-model §7:** reads Exchange rows already on-device; nothing new on the wire.

### Design
- New pure helper in apps/web/src/lib/timebank.ts, sibling style to `pendingTaskCreditFor`:
  - `projectConfirmationOutflow(memberKey: string, exchanges: readonly Exchange[]): ProjectConfirmationOutflow` where the result is `{ totalHours: number; perProject: { projectId: string; hours: number }[] }`; include an exchange iff `x.helpedKey === memberKey && x.postId.startsWith("project:")`; parse projectId as the slice between `"project:"` and `"/task:"` (skip-quietly if malformed); round with the existing `Math.round(x*100)/100` convention; sort `perProject` by hours desc (stable tiebreak on projectId) so the copy can name the largest.
  - Covers both manual confirmations and the sweep's primary-organizer debits — semantics are simply "hours that left your balance to credit task helpers".
- **Display decision: single quiet line, only when `totalHours > 0`, no expandable.** It sits in `BalanceCard`'s left column below the pending block (Profile.tsx:719-753), same muted text style. Rationale: the Exchange history section further down already itemizes every one of these confirmations, so an expandable here would duplicate it; the `<details>` precedent (`pendingWhy`) stays reserved for "how the system works" copy.
- Title resolution in `ProfilePage` (not the helper): `projectMap` already exists (:257-260). Resolve the top project's title; missing rows (blocked organizer filtered from `useApp().projects`, purged project) fall back quietly to a generic "a community project" string — never an error, never a key dump.
- Copy avoids signs and "debt": "Includes Xh you moved to helpers on behalf of <project> [and N other projects]."

### Implementation steps
1. apps/web/src/lib/timebank.ts — add `ProjectConfirmationOutflow` interface + `projectConfirmationOutflow()` (pure, documented in the file's existing comment voice; note the `postId` format contract with `confirmProjectTaskCompletion`).
2. apps/web/src/pages/Profile.tsx — in `ProfilePage`, `const outflow = useMemo(() => projectConfirmationOutflow(currentMember.publicKey, exchanges), [currentMember, exchanges])`; derive a small display object `{ hours, primaryTitle, moreCount }` using `projectMap` and the fallback key; pass as a new `projectOutflow` prop to `BalanceCard` (:301-307).
3. Same file — in `BalanceCard` (:665), render the line after the `hasAnyPending` block when `projectOutflow.hours > 0`, using `formatHours` (unsigned) and the keys below.
4. No db/server change; no new dependency arrays beyond the memo.

### i18n
- `profile.balance.projectOutflowLine`: `"Includes {{hours}} you moved to helpers on behalf of {{project}}."`
- `profile.balance.projectOutflowLineMore_one`: `"Includes {{hours}} you moved to helpers on behalf of {{project}} and {{count}} other project."`
- `profile.balance.projectOutflowLineMore_other`: `"Includes {{hours}} you moved to helpers on behalf of {{project}} and {{count}} other projects."`
- `profile.balance.projectOutflowUnknownProject`: `"a community project"`
- Matching `es.json` entries required (parity test).

### Test plan
- Extend apps/web/src/lib/timebank.test.ts with a `projectConfirmationOutflow` describe: ignores plain post exchanges and exchanges where the member is `helperKey`; sums multiple tasks of one project; groups and sorts across projects; handles `postId` without `/task:` segment; rounding (e.g. 0.1+0.2 hours).
- i18n parity test covers key symmetry automatically.
- Profile has no page test today; per the small tier, rely on the pure-helper tests + a manual check. (If a page test is wanted, a `BalanceCard`-level render via the Calendar.test.tsx mock pattern is the cheapest harness.)

### Open questions
- Should the line appear for *any* member with `helpedKey` task outflow (e.g. someone who has since handed off organizing)? Helper says yes (it is still their balance composition); flagging in case reviewers prefer gating on current organizer standing — recommend no gate, the hours are factual either way.
- Name the largest project or the most recent? Plan says largest (it explains the most hours); revisit if copy reads oddly with stale projects.

## 3. "Working alongside" contributor roster on ProjectDetail
**Tier:** small — **Effort:** M

### Why
The sidebar overview shows only a bare count — `contributors.size` from completed tasks (apps/web/src/pages/ProjectDetail.tsx:251-255, rendered at :399-401 via `projects.detail.contributors`). The people actually carrying the work are scattered across task rows. A names-only roster makes the project feel like shared work and helps members find collaborators they already see on rows.

### Ethos check
- **no-leaderboards / no-activity-search:** names only, alphabetical by display name — no hours, no per-member counts, no contribution ordering, not queryable across projects. This is a per-project membership fact, not an activity ranking.
- **solidarity-not-shame (load-bearing subtlety, verified):** when a claimed task crosses into `needs_more_hands`, its public row deliberately drops the claimer's name (ProjectDetail.tsx:1704-1716). The roster must apply the same suppression — exclude `assignedTo` of tasks currently in `needs_more_hands` state (unless that member also appears via another task) — or it would re-reveal a name the page just protected.
- **privacy-precondition:** derives strictly from data already rendered on this page (claimedBy/completedBy lines on rows); the suppression rule above is what keeps that claim true. Blocking: `useApp().projects` is filtered but `projectTasks` and `members` are not (apps/web/src/state/AppContext.tsx:632-639), so blocked names do reach task rows today; still, a *curated aggregation* should not list someone the viewer blocked — filter against `useApp().blockedKeys`, matching `computeAttentionItems`' posture.
- **community-authority:** read-only card, no roles, no admin affordance.
- **threat-model §7:** local derivation only.

### Design
- **Inclusion set (decision):** keys from `task.assignedTo` (status `claimed`/`awaiting_confirmation`) and `task.completedBy` (status `awaiting_confirmation`/`completed`), minus needs_more_hands-suppressed claimers, minus `blockedKeys`. **Organizers/co-organizers are excluded unless they appear via tasks** — they are already named in the overview card ("Organized by", :335-341) and the co-organizer sections; the roster's meaning is "hands on tasks", and merging roles into it would recreate a hierarchy the page already expresses elsewhere.
- Pure helper in a new file apps/web/src/lib/projectRoster.ts: `workingAlongsideKeys(tasks: readonly ProjectTask[], config: Pick<NodeConfig, "taskCheckInDays" | "taskNeedsHelpDays" | "taskCheckInGraceDays">, blockedKeys: ReadonlySet<string>, now?: number): Set<string>` — uses `taskCheckInState` (apps/web/src/lib/taskCheckInState.ts:45) per claimed task for the suppression rule. `now` defaults to `Date.now()` (same posture as the attention rail).
- Rendering: a small `WorkingAlongsideCard` in the `<aside>` directly after the overview card (after :415), hidden entirely when the set is empty (no "0 people" — same rule as AttentionSection). Names resolve via `members` from `useApp` and sort with `localeCompare`; each links to `/member/<key>` matching the organizer-name link precedent (:336-341). Unknown keys (member row missing) render the existing `shortKey` fallback or are skipped — propose skipping, since a bare key adds nothing a row didn't already show.

### Implementation steps
1. New apps/web/src/lib/projectRoster.ts — `workingAlongsideKeys()` as above, with a header comment naming the needs_more_hands suppression and its principle.
2. apps/web/src/pages/ProjectDetail.tsx — destructure `blockedKeys` from `useApp()` (:108-121); compute `const alongsideKeys = useMemo(() => workingAlongsideKeys(tasks, nodeConfig, blockedKeys), [tasks, nodeConfig, blockedKeys])`; map to sorted `{ key, name }[]` via `members`.
3. Same file — add `WorkingAlongsideCard` (function component near `Field`/sidebar helpers) rendering a `card mb-4` with the title, optional one-line intro, and a comma-or-list of name links; mount it in the `<aside>` after the overview card div.
4. Leave the existing `contributors` count Field untouched (it answers a different question — completed-task contributors — and removing it is out of scope).

### i18n
- `projects.detail.workingAlongside.title`: `"Working alongside"`
- `projects.detail.workingAlongside.intro`: `"Members who have picked up or finished a task here."`
- Matching `es.json` entries required (parity test).

### Test plan
- New apps/web/src/lib/projectRoster.test.ts (style of lib/taskCheckInState.test.ts): includes claimer + completer; dedupes; excludes a needs_more_hands claimer (fixture: `claimedAt` older than `taskNeedsHelpDays`, no ack, default config) but includes them when they completed another task; dep-blocked stale claim is NOT suppressed (state stays "fresh" → name included, matching the row); excludes blocked keys; empty input → empty set.
- New apps/web/src/pages/ProjectDetail.roster.test.tsx on the claimerqol harness: card renders names alphabetically regardless of task order; card absent when no qualifying tasks; organizer not listed unless they hold a task.

### Open questions
- Comma-separated inline names vs. a `<ul>`? Propose `<ul>` for screen-reader counting semantics.
- Should `awaiting_confirmation` completers count before an organizer confirms? Plan says yes (the row already names them, "completed by"); flag if reviewers want confirmed-only.

## 4. Re-open/duplicate a completed recurring task
**Tier:** small — **Effort:** S

### Why
Templates fake recurrence by suffixing the description (`applyRecurringSuffix`, apps/web/src/pages/ProjectNew.tsx:213-220, keys `projects.templates.recurringSuffix.*` — en.json:529-534). Once confirmed, a task is a dead end: the organizer must retype it in `AddTaskForm`. "Add a fresh copy" turns one tap into the next cycle of recurring work.

### Ethos check
- **solidarity-not-shame:** framed as "run it again", never "this lapsed/expired"; the copy is forward-looking and aimed at the work. No day-counters.
- **no-notifications:** purely a pull affordance on a row the organizer is already viewing; no nudges to re-add.
- **community-authority:** reuses the existing organizer gate (`requireOrganizer` inside `addProjectTask`, apps/web/src/db/projects.ts:463 / :361-370) — organizer here is project stewardship, not an admin role; co-organizers qualify equally via `isOrganizer` (:354-359).
- **follows-not-blocked:** dropping dependencies (below) avoids fabricating sequence relationships that no longer describe the new cycle.
- **threat-model §7:** `addProjectTask` writes local rows only; tasks have no `OutboxRow.kind` (verified union, database.ts:98-108) — nothing federates until a future confirmation writes an Exchange, which is the existing analyzed surface.

### Design
- **Affordance on ALL completed tasks (decision, per recommendation):** the recurrence suffix is localized prose (" Recurs monthly." / es variant), so matching it is brittle across languages and excludes hand-written recurring tasks; "add a fresh copy" is honestly useful for any completed task. Simpler and no false negatives.
- Button in `TaskRow`'s action row when `task.status === "completed" && isOrganizer && projectStatus !== "completed" && projectStatus !== "archived"` (mirrors `addProjectTask`'s own guard at :464-465 so the button never offers a guaranteed error).
- Calls the existing `addProjectTask(task.projectId, currentKey, input)` (:454) — no new db function. Copies `title`, `description` (suffix and all), `category`, `estimatedHours`, `urgency`, `requiredSkills` (spread copy); fresh `id`/`status: "open"`/null claim fields and bottom `orderIndex` come from `addProjectTask` itself; logs `task_added` as today.
- **Dependencies: drop (`dependencies: []`).** Justification: the original's upstream tasks are (almost by definition at this point) completed, so copying their ids adds no gating (`canClaimTask` would pass) while silently breaking if the upstream is *also* re-copied with a new id; and `cloneProject` already sets the precedent of dropping dependencies on copied tasks (apps/web/src/db/projects.ts:1523).
- Success toast tells the organizer where it landed ("at the bottom of the list") since the new row may be off-screen; pairs naturally with item 1's anchors if we later want the toast to jump there.
- Pass `currentKey` (the acting organizer) as the actor — matching ProjectNew's usage (:267) — not `project.organizerKey` as `AddTaskForm` does (:1970); the activity log should attribute the acting co-organizer.

### Implementation steps
1. apps/web/src/pages/ProjectDetail.tsx — in `TaskRow` (:1376), add `const { showToast } = useToast()` (hook already imported in the file) and a new branch in the action-buttons div (:1717-1839): a `btn-secondary` "Add a fresh copy" button gated as above, `disabled={pending}`, onClick `dispatch(() => addProjectTask(task.projectId, currentKey!, { title: task.title, description: task.description, category: task.category, estimatedHours: task.estimatedHours, urgency: task.urgency, requiredSkills: [...task.requiredSkills], dependencies: [] }))`, then on non-null result `showToast(t("projects.task.addFreshCopy.toast", { title: task.title }))`.
2. Add a muted helper sentence under the button (same pattern as `claimSummary`, :1736-1745) explaining what it does, so the affordance isn't a mystery tap.
3. No changes to apps/web/src/db/projects.ts.

### i18n
- `projects.task.addFreshCopy.button`: `"Add a fresh copy"`
- `projects.task.addFreshCopy.hint`: `"Adds an open copy of this task at the bottom of the list — handy for work that recurs."`
- `projects.task.addFreshCopy.toast`: `"Added a fresh “{{title}}” at the bottom of the task list."`
- Matching `es.json` entries required (parity test).

### Test plan
- New apps/web/src/pages/ProjectDetail.freshcopy.test.tsx on the claimerqol harness (`@/db/projects` is already fully mocked there, including `addProjectTask`): (a) organizer viewing a completed task sees the button; click → `addProjectTask` called with `task.projectId`, the organizer's key, copied fields, and `dependencies: []`; toast fired; (b) non-organizer: button absent; (c) completed/archived project: button absent; (d) `pending` disables it (no double-add).
- db behavior (open status, bottom `orderIndex`, `task_added` activity) is existing `addProjectTask` coverage in apps/web/src/db/projects.test.ts — extend only if a copy-shaped fixture is missing.

### Open questions
- There is no task-delete in the codebase, so an accidental copy is permanent (though editable). Accept one-tap (consistent with `AddTaskForm`'s one-submit) or add a `ConfirmDialog`? Plan: one tap, flag for review.
- Should the activity payload record provenance (`copiedFrom: task.id`)? Requires widening `addProjectTask`'s activity data — proposed as out of scope; note for a follow-up.
- Existing oddity (not fixed here): `AddTaskForm` passes `project.organizerKey` instead of the acting member's key (:1970), mis-attributing co-organizer adds in the activity log. Worth a separate one-line fix.

## 5. "Could use more hands" project filter on the Board's Projects tab
**Tier:** small — **Effort:** S

### Why
The chip exists per task (`needs_more_hands` from `taskCheckInState`, apps/web/src/lib/taskCheckInState.ts:45-93, rendered in ProjectDetail:1621-1632 with key `projects.task.needsMoreHands` = "Could use more hands"), but a member browsing the Board cannot find *which projects* contain such tasks. The "Only with open tasks" toggle (apps/web/src/pages/Board.tsx:101, :218; apps/web/src/components/board/ProjectFilterRail.tsx:118-129; apps/web/src/lib/projectFilter.ts `hasOpenTasks`) is the exact precedent.

### Ethos check
- **solidarity-not-shame:** the label is the chip's own wording, aimed at the task/project ("Could use more hands"), never at a person; the filter surfaces *where help is welcome*, and the underlying state machine already protects responsive claimers (grace windows, ack resets) and dep-blocked tasks (`canClaimTask` guard returns "fresh", taskCheckInState.ts:54-61). The claimer's name is already suppressed on such rows — this feature adds no person-level signal.
- **no-notifications:** a member-initiated filter toggle; no badge, no count on the toggle (the openTasks toggle precedent also carries none).
- **no-leaderboards / no-activity-search:** filters projects, not members; cannot be used to rank or find people.
- **threat-model §7:** computed locally from local tasks + `nodeConfig`; nothing new on the wire.

### Design
- Pure helper in apps/web/src/lib/projectFilter.ts (next to `hasOpenTasks`):
  `projectNeedsMoreHands(projectId: string, tasks: readonly ProjectTask[], config: Pick<NodeConfig, "taskCheckInDays" | "taskNeedsHelpDays" | "taskCheckInGraceDays">, now = Date.now()): boolean` — scope `tasks` to the project once, then `some(t => taskCheckInState(t, config, projectScopedTasks, now) === "needs_more_hands")`. Passing the project-scoped list as `allTasks` is correct (dependencies are in-project by construction) and avoids O(all-tasks) dep lookups.
- **Perf (decision):** don't call the helper inside the `visibleProjects` filter per project per render. Instead compute a `ReadonlySet<string>` of qualifying project ids in one `useMemo` that (a) returns `null` when the toggle is off (zero cost on the default path), and (b) buckets `projectTasks` by `projectId` in one pass before evaluating. `now` is captured at memo time and the memo deps are `[onlyNeedsMoreHands, projectTasks, nodeConfig]` — deliberately excluding `now`, the same staleness posture as `AttentionSection`'s `computeAttentionItems` memo.
- Second toggle button in `ProjectFilterRail`, identical classes/`aria-pressed` pattern to the openTasks toggle; new props threaded from Board (the rail renders in two DOM positions — :448-456 mobile, :563-572 desktop — both already share the same prop object, so this is mechanical).
- Wire into `projectFiltersActive` (:232-235) and `resetProjectFilters` (:264-268) so the filtered-empty state and "Clear filters" keep working.

### Implementation steps
1. apps/web/src/lib/projectFilter.ts — add `projectNeedsMoreHands()` (import `taskCheckInState`; add the `NodeConfig` Pick type import from `@/types`).
2. apps/web/src/pages/Board.tsx — destructure `nodeConfig` from `useApp()` (:48-57, currently absent); add `const [onlyNeedsMoreHands, setOnlyNeedsMoreHands] = useState(false)`; add the memoized id-set described above; extend the `visibleProjects` memo (:211-230) with `if (onlyNeedsMoreHands && !needsMoreHandsIds?.has(p.id)) return false;` and add the new deps; extend `projectFiltersActive` and `resetProjectFilters`; pass the two new props to both `ProjectFilterRail` render sites.
3. apps/web/src/components/board/ProjectFilterRail.tsx — extend `ProjectFilterRailProps` with `onlyNeedsMoreHands: boolean` / `setOnlyNeedsMoreHands: (next: (prev: boolean) => boolean) => void`; render the second toggle after the openTasks one with `aria-pressed` and the new label key.
4. Optional polish: a `WhyTooltip principleId="solidarity-not-shame"` beside the toggle, matching the chip (:1630).

### i18n
- `board.projectFilters.needsMoreHands.toggle`: `"Could use more hands"` (deliberately identical wording to `projects.task.needsMoreHands` so the Board filter and the row chip read as the same concept).
- Matching `es.json` entry required (parity test) — reuse the es chip translation for consistency.

### Test plan
- Extend apps/web/src/lib/projectFilter.test.ts: project with a long-silent claimed task (claimedAt beyond `taskNeedsHelpDays`, no ack, default config) → true; recently-acked claim → false; dep-blocked stale claim → false; only-open tasks → false; tasks from other projects ignored; `now` parameter pinned for determinism (no fake timers needed — pure function).
- Page test via the Board harness pattern (apps/web/src/pages/Board.emptyState.test.tsx mocks): with two projects (one qualifying), toggling the new rail button narrows the list to the qualifying project and "Clear filters" restores both; toggle shows `aria-pressed`.
- i18n parity test covers the new key.

### Open questions
- Should the toggle imply `status === "active"`? `needs_more_hands` requires a claimed task, and claims only happen on active projects, but a project paused *after* a claim could still qualify — propose leaving it (honest: the task still could use hands when the project resumes), flag for review.
- Composition with "Only with open tasks": both on means AND (a project with a quiet claimed task but zero open tasks would drop out). AND is the existing composition rule for all rail filters; keeping it.

---

# Part II — Medium, scoped and buildable

## 6. Actual hours at completion
**Tier:** medium — **Effort:** M

### Why
`confirmProjectTaskCompletion` (apps/web/src/db/projects.ts, line 679) writes the signed Exchange with `hoursExchanged: task.estimatedHours` (line 729) and the canonical payload `hours: task.estimatedHours` (line 720). A helper whose 2h-estimated task took 6h is credited 2h. That breaks the first design principle (`equal-time`, apps/web/src/content/design-principles.ts): "One hour of help always equals one hour of credit." Worse, the estimate is *organizer-authored* (`addProjectTask` is organizer-only), so the person doing the work is credited by someone else's guess. The codebase already anticipates the fix: `pendingTaskCreditFor`'s doc comment (apps/web/src/lib/timebank.ts, lines 177–180) instructs that if confirmation "ever switches to an actual-hours field at confirmation time, update this AND the test fixture in lockstep."

### Ethos check
- **Equal-time**: this PR is the enforcement of that principle for project tasks. Credit = time actually given, not time guessed.
- **Solidarity-not-shame**: a task that took longer than estimated must never be framed as overrun/late. Copy says "How long did it take?" — never "you exceeded the estimate." The estimate is shown as context ("estimated 2h"), not as a target missed. No flag fires on a delta (see Design §5): the delta usually means the *organizer* underestimated, and flagging it would punish members doing harder-than-expected work — the gig-economy pattern the principle ledger explicitly rejects.
- **Asking-never-gated / low-friction contribution**: mark-complete stays light — an inline, prefilled stepper (estimate prefilled, one extra tap when actual == estimate). Release (`unclaimProjectTask`) stays one-tap ungated, matching the existing `releaseReassurance` posture (ProjectDetail.tsx lines 1794–1803).
- **Community-authority / two-party consent**: the claimer states the number; the organizer's "name the consequences" dialog (PR #237) names that same number before signing. Both parties consent to the actual figure — structurally stronger than today, where both sign a number neither attested.

### Design

**1. Data model — `actualHours: number | null` on `ProjectTask` (required, not optional).**
Add after `completedBy` in packages/shared/src/types.ts (ProjectTask, lines 467–511): "Claimer-stated actual hours, set at mark-complete (claimed → awaiting_confirmation). `null` = never stated (legacy rows, programmatic completions); consumers fall back to `estimatedHours`. Cleared when the completer walks the task back." Required-with-null matches the `claimedAt`/`checkInAcknowledgedAt` precedent (v11), so TypeScript forces every construction site to declare it.
- **Local-only verified**: `OutboxRow.kind` (apps/web/src/db/database.ts, lines 98–108) has no `project`/`task` member — tasks never cross the wire. No federation change.
- **Wire format verified unchanged**: `canonicalExchangePayload` (packages/shared/src/crypto.ts, line 105) signs `hours: number` — a value, not a shape. `Exchange.hoursExchanged` simply receives a different number; `verifyExchange`/`verifyExchangeLabel` are untouched. The server's `/auto-confirm` route validates only `hours > 0` (apps/server/src/routes/autoConfirm.ts, line 169) — **no server change**.
- **Dexie migration required**: v26 in database.ts (currently v25, lines 741–759 — see the sequencing note: number may shift): `this.version(26).stores({}).upgrade(...)` backfilling `actualHours = null` on every projectTasks row missing it (no new index — never queried). Already-completed tasks stay null: history is not rewritten; their exchanges legitimately recorded the estimate.
- **One fallback rule, one place**: export `creditHoursForTask(task: Pick<ProjectTask, "actualHours" | "estimatedHours">): number` → `actualHours ?? estimatedHours` from `lib/timebank.ts` (pure, type-only imports, no cycle: projects.ts already imports from `@/lib/*`). Every consumer below reads through it, which is what makes "lockstep" structural instead of comment-enforced.

**2. Write path.**
- `markProjectTaskComplete(taskId, memberKey, actualHours?: number)` (projects.ts line 632): when provided — require `Number.isFinite(h) && h > 0`, round via the existing `roundHours` (line 991), store on the task; when omitted, store `null` (keeps the 7 existing test call sites and any programmatic path honest: "not stated" ≠ "stated the estimate"). **No hard cap, recommended**: no other hours field in the codebase is capped (addProjectTask, confirmExchange, the server all accept any positive number); a code-enforced ceiling would be the code deciding what the community should (`community-authority`). The real controls are the prefilled stepper (typos require effort), the organizer countersigning the named number, and the transparent delta in the activity log. Also log `actualHours` + `estimatedHours` in the `task_completed` activity data (line 653–659) so the trail starts at statement time.
- `unclaimProjectTask` (line 547): when releasing from `awaiting_confirmation`, clear `actualHours` back to `null` alongside `completedBy` (line 581) — a walked-back statement shouldn't survive into a future completion by someone else.
- `confirmProjectTaskCompletion` (line 679): payload `hours` (720) and `hoursExchanged` (729) become `creditHoursForTask(task)`. The `?? estimatedHours` fallback is load-bearing: tasks already awaiting confirmation when the app upgrades have `actualHours: null` and must still confirm cleanly.
- Sweep (apps/web/src/lib/autoConfirmSweep.ts, line 169): `hoursExchanged: creditHoursForTask(task)`. **Recommend `actualHours ?? estimatedHours`, justified**: the sweep signs the helper-side signature locally with the claimer's key (lines 196–204) — the claimer stated the actual number at mark-complete, so the system key countersigns *the number that was on the table* for the absent organizer, exactly what a present organizer would have been shown. Falling back to estimate covers pre-migration rows. `_systemAutoConfirmTask` (projects.ts line 784) needs no hours logic (it receives the pre-signed exchange) but gains a sanity guard: `exchange.hoursExchanged === creditHoursForTask(task)`, mirroring its existing helperKey check (line 798).
- `_writeTaskConfirmation` (line 843): `contributedHours += creditHoursForTask(task)` (line 871) and activity `hours` (line 888) likewise, plus record `estimatedHours` and `actualHours` in the `task_confirmed` activity data. **Milestone math counts actual, recommended**: `milestonesCrossed` compares `contributedHours` against `targetHours` (lines 873–877); the ledger is canonical truth, and a project whose progress bar disagreed with the sum of its own signed exchanges would be two truths. `targetHours` stays an estimate — milestones firing "early" on underestimated tasks is honest accounting, and `completeProject` already logs the `contributedHours`/`targetHours` pair as-is (line 211).

**3. Lockstep updates.**
- `pendingTaskCreditFor` (timebank.ts line 198): `delta: creditHoursForTask(task)` (line 209); rewrite the lines-177–180 doc comment to point at the helper. Profile pending rows (apps/web/src/pages/Profile.tsx, lines 245–248, 431–441) derive entirely from this helper — they update for free; refresh the stale comment at lines 240–244.
- Claimer narrative (ProjectDetail.tsx line 1850): `hours: formatHours(creditHoursForTask(task))` so `projects.task.claimerNarrative.intro` ("your {{hours}} hours of credit move then") names the actual number; add an estimate-context line when they differ.
- Confirm dialog (line 1871): same substitution in `projects.task.confirmDialog.body`; add a line naming both numbers when they differ so the organizer signs informed.
- Hours chip (line 1619): show `creditHoursForTask(task)` for `awaiting_confirmation`/`completed` tasks (estimate otherwise) so the row never contradicts the ledger.

**4. UI — mark-complete flow** (ProjectDetail.tsx, TaskCard, lines 1771–1804): replace the direct dispatch at line 1779 with an inline disclosure (the claim-summary precedent at lines 1729–1745, not a modal): tapping "Mark complete" reveals a row with a number input (`min="0.25" step="0.25" inputMode="decimal"`, matching the edit-form input at lines 1499–1507) **prefilled with `task.estimatedHours`**, muted context "Estimated: {{hours}}", and a confirm button "Record {{hours}} and mark complete". Common case = two taps, zero typing. Honest framing, no haggling: the helper text states fact-recording ("the credit should match the help given"), optionally with `<WhyTooltip principleId="equal-time" />` (pattern at line 1630). Release button and its reassurance line stay exactly as-is — ungated.

**5. Anti-gaming — recommend NO new advisory flag; make the delta transparent instead.**
Analysis: the task confirm path today applies *no* safeguards at all — `assertWithinDailyLimit`/`evaluateSafeguards` run only in the posts path (apps/web/src/db/actions.ts, lines 287–297). A new `estimate_actual_delta` `FlagReason` would (a) flag the member who honestly reports that organizer-authored estimates were wrong — systematically flagging care work that ran long, which `solidarity-not-shame` exists to prevent; (b) not catch the actual collusion vector, since colluders can simply author a large *estimate* today, un-flagged; and (c) land on a surface (Disputes, `lib/disputes.ts`) that only renders post-backed exchanges. The primary control is structural and stronger than the status quo: the claimer signs the actual number (helper signature over the canonical payload) and the organizer countersigns it eyes-open in the consequences dialog. Add transparency, not suspicion: both numbers in the `task_completed` and `task_confirmed` activity rows (community-visible on the project page — the community-review surface) lets any member see "took 6h · estimated 2h" and start a conversation. `dailyHelperLimit` is count-based and unaffected.

**6. Board posts — follow-up PR, recommended.** `confirmExchange` (actions.ts lines 292/303/320) has a different consent topology: two member parties, either may confirm first, both signatures produced in one call — so "who states actual, and when does the other see it" needs its own design (likely: the *helper* states actual at their confirmation; the second confirmer's dialog names it). The task-side pattern transfers cleanly: statement-at-completion field + `creditHoursForX()` fallback helper + countersign-the-named-number dialog + pending-prediction lockstep (`pendingBalanceFor`, timebank.ts line 133, mirrors `pendingTaskCreditFor` exactly). Keeping this PR task-only also keeps the migration and test surface bounded.

### Implementation steps
1. packages/shared/src/types.ts — add `actualHours: number | null` to `ProjectTask` (after `completedBy`, ~line 499) with the doc comment above. (`apps/web/src/types/index.ts` re-exports `@understoria/shared/types`; no change there.)
2. apps/web/src/db/database.ts — add the next-version migration after line 759: `.stores({}).upgrade(tx => modify projectTasks: if (r.actualHours === undefined) r.actualHours = null)`.
3. apps/web/src/lib/timebank.ts — export `creditHoursForTask`; switch `pendingTaskCreditFor` delta (line 209) to it; update doc comment (lines 156–181).
4. apps/web/src/db/projects.ts —
   - `markProjectTaskComplete` (632): optional `actualHours` param, validate/round, persist, enrich activity data;
   - `unclaimProjectTask` (570–583): clear `actualHours` on awaiting walk-back;
   - `confirmProjectTaskCompletion` (720, 729), `_writeTaskConfirmation` (871, 888): `creditHoursForTask(task)` + both numbers in activity data;
   - `_systemAutoConfirmTask` (798ff): add hours-match guard;
   - construction literals add `actualHours: null`: `addProjectTask` (~487), `bulkAddTasks` (~1203), `cloneProject` (~1530).
5. apps/web/src/lib/autoConfirmSweep.ts — line 169 → `creditHoursForTask(task)`.
6. apps/web/src/pages/ProjectDetail.tsx — inline actual-hours disclosure replacing the one-tap dispatch (1771–1783); narrative (1850), dialog (1871), chip (1619) read through the helper; estimate-context lines when actual ≠ estimate; pass the stated hours into `markProjectTaskComplete`.
7. apps/web/src/i18n/locales/en.json + es.json — keys below (parity test apps/web/src/i18n/parity.test.ts enforces both sides).
8. Tests (below), including updating every `ProjectTask` fixture literal the required field now breaks: `lib/timebank.test.ts` (~line 250 factory), `pages/ProjectDetail.taskHonesty.test.tsx` `makeTask` (line 103), the coorg/claimerqol/reorder test factories, `lib/myTasks.test.ts` et al.

### i18n
New under `projects.task.actualHours` (en values; es translated in the same commit):
- `legend`: "How long did it take?"
- `estimateContext`: "Estimated: {{hours}}"
- `hint`: "Record the real time — the credit should match the help given. No judgment either way."
- `confirmCta`: "Record {{hours}} and mark complete"
- `cancel`: "Cancel"
- `invalid`: "Enter a number of hours greater than zero."
Modified/added near existing keys (en.json lines 615–626):
- `claimerNarrative.intro` — value unchanged; `{{hours}}` now receives actual. Add `claimerNarrative.estimateNote`: "You recorded {{actual}} for this task (estimated {{estimate}})." — rendered only when they differ.
- `confirmDialog.body` — value unchanged; `{{hours}}` now actual. Add `confirmDialog.estimateNote`: "{{claimer}} recorded the actual time: {{actual}}. The task was estimated at {{estimate}}." — rendered only when they differ.

### Test plan
- `db/projects.test.ts` (extend the suite at lines 316–468): mark-complete stores/rounds `actualHours` and rejects 0/negative/NaN; confirm writes `hoursExchanged` = actual and `verifyExchange` passes; legacy fallback (null → estimate); `contributedHours` and `milestonesCrossed` driven by actual (e.g., 1h-estimate/4h-actual task crossing 100% of a 4h target); activity rows carry both numbers; awaiting walk-back clears `actualHours`.
- **Migration test**: follow the established hand-run pattern (projects.test.ts lines 944–993 — strip the field via destructured re-put, run the migration algorithm, assert `actualHours === null` and neighbors intact), since fake-indexeddb opens at the latest version.
- `lib/timebank.test.ts`: update the "Predicted == recorded" fixture/comment (lines 326–349); new cases for actual-present and null-fallback; direct unit tests for `creditHoursForTask`.
- **New** `lib/autoConfirmSweep.test.ts` (none exists today — verified): fake-indexeddb + `vi.stubGlobal("fetch", ...)` capturing the request body; assert task candidates send `payload.hours === actualHours` (and estimate when null); plus `_systemAutoConfirmTask` hours-mismatch rejection via projects.test.ts.
- `pages/ProjectDetail.taskHonesty.test.tsx`: new describe for the claimer flow — tapping "Mark complete" reveals the prefilled input without firing the action; confirming fires `markProjectTaskComplete(taskId, claimerKey, hours)` once; release remains one-tap. Organizer dialog names the actual number and the estimate note when they differ; claimer narrative names actual.
- `i18n/parity.test.ts` passes (en/es added together).

### Open questions
1. Should task confirmation also start running the *existing* `evaluateSafeguards` (short_duration / reciprocal_pattern) for parity with posts, now that hours are member-stated (a 0.1h actual would qualify for the same advisory a 0.1h post gets)? If yes, where do flagged task exchanges surface — Disputes currently lists post-backed exchanges only?
2. HistoryTimeline narration: how loudly should "took {{actual}} · estimated {{estimate}}" read in the activity feed — always, or only on tap? (Recommend always, neutral voice.)
3. Does the pilot community want a community-configurable sanity bound (NodeConfig knob, advisory not blocking) on single-task actual hours, or is no-cap acceptable long-term?
4. For the posts follow-up: when the helper confirms *second*, the first confirmer (helped party) has already signed conceptually without seeing actual hours — does that flow need a re-consent step, or does the helper-states/helped-countersigns ordering get enforced?
5. Should organizers editing an open task's estimate after community discussion of past deltas be nudged toward template-level estimate learning (out of scope, but the activity data this PR records enables it)?

## 7. "Projects you organize" view
**Tier:** medium — **Effort:** M

> **Shipped, then superseded (July 2026):** this view and its
> claimer-side twin shipped as standalone pages (`/my-projects`,
> `/my-tasks`) and were later folded into the combined **My work**
> tab at `/my-work` (see `docs/navigation-shell.md`). The old routes
> redirect to the corresponding sections; the entry points described
> below now land on those sections. The scope decisions in this plan
> (read-only, self-only, no counts on entry cards) still hold.

### Why
The claimer side just shipped (commit 636c5b7, `/my-tasks`): a member helping on several projects can see their commitments in one pull. The organizer side has the same fragmentation problem, worse: a member who organizes three projects must open each project page to learn whether anything is waiting on their signature, whether tasks are sitting open, and whether a co-organizer invitation they issued is still dangling. The most consequential of these — tasks in `awaiting_confirmation` — is tier-0 in the attention rail's own rationale (apps/web/src/lib/attention.ts:179-181: "your signature is the only thing standing between someone else and their credit"). The rail nudges per-item; nothing today gives an organizer the per-project inventory. This view is the organizer-side twin of `myClaimedTasks`, built from rows already on the device.

### Ethos check
Checked against apps/web/src/content/design-principles.ts:

- **no-activity-search (self-only scoping):** the helper takes the viewing member's own key; no UI offers a "projects member X organizes" variant. It is a pure read over local Dexie rows the member already holds (`useApp` arrays) and never crosses the wire — same scope-decision doc comment posture as apps/web/src/lib/myTasks.ts:18-37.
- **no-notifications:** pull-only. No badge, bubble, or count outside the page. The Profile card and Board link are quiet, hidden at zero, and carry only the project-count summary sentence — the awaiting/open counts render as plain sentence text inside the page the member chose to open. WhyTooltip on the subtitle cites `no-notifications`, mirroring MyTasks.
- **no-leaderboards (counts are about work waiting, never member output):** every number is work waiting on the *viewer* — tasks awaiting *their* confirmation, open slots in *their* project, invitations *they* issued. No completer names in counts (names stay on the rail items), no contributor tallies, no cross-member comparison. The momentum chip is explicitly "a signal about the project, not the people" (apps/web/src/lib/projectMomentum.ts:24-27). The awaiting count excludes tasks the organizer completed themselves, because `confirmProjectTaskCompletion` rejects self-confirmation (apps/web/src/db/projects.ts:695-704) — counting them would advertise an action the viewer cannot take.
- **solidarity-not-shame:** entry points hide entirely at zero (no "you're not organizing enough"); the empty state is an invitation ("Start a project"); the stalled momentum state already renders as "Quiet" (`projects.momentum.stalled`); no day counters, no "overdue", and a completed project with no loose ends simply leaves the list rather than lingering as a trophy shelf.
- **Blocking consistency (docs/blocking.md §6, row "Attention rail items (a) — suppress items whose subject is the blocked party"):** the awaiting count skips tasks whose `completedBy` is blocked and the pending-invitation count skips blocked invitees, mirroring `attention.ts`'s PR F suppression — otherwise the count would say "1 waiting" while the rail honestly shows nothing, and the mismatch would pull the blocker toward blocked-member content. `useApp().projects` is already block-filtered with the co-organizer-standing exception (apps/web/src/state/AppContext.tsx:572-606).

### Design

**Route:** `/my-projects`. Symmetric with `/my-tasks` (the pair reads as "what I'm carrying" / "what I'm stewarding"); deliberately NOT under `/projects/...` because that prefix means community-wide surfaces (`/projects/archive`), and this is a personal view.

**Authority predicate:** `isOrganizer(project, memberKey)` from apps/web/src/db/projects.ts:354 — the static `coOrganizerKeys` array. Since PR #238's materialization (`materializeAcceptedCoOrganizer`), the static array IS the live authority list, written by every grant and removal path (comment block at projects.ts:326-353; docs/co-organizer-invitations.md §5 "Shipped reality" note). The derived-rows view (`effectiveCoOrganizerKeysFromRows`) is wrong for this surface on both sides: it never sees the row-less handoff demotion (a demoted ex-primary's project would vanish from their own workbench) and never forgets a step-down (a member who left the role would keep an organizer inventory for a project they no longer steward). Both are unacceptable for an authority-scoped inventory. `isOrganizer` is also pure and synchronous, so the lib helper stays a pure function (precedent: attention.ts:25 already imports `canClaimTask` from `@/db/projects`). [If plan 8 lands first, this paragraph simply describes the codebase-wide rule.]

**Project status scope:** archived never appears (Board precedent at apps/web/src/pages/Board.tsx:207-214 — the archive page is the only entry point for archived rows). `planning`, `active`, `paused` always appear: all three are live stewardship. `completed` appears **only while it still has tasks awaiting the viewer's confirmation** — a loose end only their signature (or the auto-confirm sweep) can close; once clean, it drops. Rationale: this is a workbench, not a record of output (a permanent "projects I organized" list is organizer-output display, brushing against no-leaderboards); completed projects remain visible on the Board tab and in project history. The rule is one predicate, no new UI.

**Per-project card** (one `section.card` per project, whole-title links to `/project/:id`, mirroring `ProjectGroup` in MyTasks.tsx):
- Title; status chip for non-active states via the same 5-key map as apps/web/src/pages/MyTasks.tsx:69-75; a small "Co-organizer" chip when the viewer is not primary (honest context for why the invitation line never appears there — only primaries can issue, db/coorgInvitations.ts:130-135).
- `ProjectMomentumChip` (apps/web/src/components/ProjectMomentumChip.tsx:41, props `{state, hoursLast7Days}`). **Verified inputs:** `computeProjectMomentum` (apps/web/src/lib/projectMomentum.ts:59) buckets per-day hours from **Exchange rows** (`completedAt` + `hoursExchanged`), joined to the project via `task.exchangeId` collected from the *tasks argument* — so it must receive **project-scoped tasks** plus the **full exchanges log**. The only existing caller is ProjectDetail (ProjectDetail.tsx:246-250), which passes `projectTasks.filter(t => t.projectId === id)` and `exchanges` from `useApp`. ProjectCard does *not* use the chip. The helper therefore returns each group's full task array so the page can call `computeProjectMomentum({ project, tasks: group.tasks, exchanges })` without a second filter pass. Hours-this-week comes free as `momentum.hoursLast7Days`, rendered by the chip's existing `projects.momentum.last7Days` key.
- Plain-sentence counts (composed parts, `InvitesSummaryLine`-style, Profile.tsx:1126-1162): "{n} tasks waiting for your confirmation" (only when > 0), "{n} open tasks" / "No open tasks", "{n} co-organizer invitations pending" (only when > 0). No badges, no color-coded urgency.

**Count semantics:**
- *Awaiting your confirmation:* `status === "awaiting_confirmation"` AND `completedBy !== memberKey` (mirrors the rail's exclusion at attention.ts:346 and the write-layer guard at projects.ts:701) AND `completedBy` not in `blockedKeys`. Identical predicate to the rail's `confirm_task` items except the organizer test uses `isOrganizer` — so the count is exactly "rail items you'd see, rolled up per project" plus the materialization fix.
- *Open:* `status === "open"` only (Board's convention, Board.tsx:665-674; `hasOpenTasks` in lib/projectFilter.ts:31-38).
- *Pending invitations you issued:* outstanding = `inviterKey === memberKey && projectId === project.id`, no response row, no revocation row, `now < expiresAt`, invitee not blocked — the same three-map logic as attention.ts:525-567 inverted to the inviter side, and the same outcome lattice as `deriveInvitations` (ProjectDetail.tsx:2285-2317, `pending` branch).

**Ordering:** two tiers — projects with `awaitingYouCount > 0` first (tier-0 rationale, attention.ts:179-181), then everything else; within each tier by `lastActivityAt` descending (most recent task movement: max over the project's tasks of `createdAt` / `claimedAt` / `completedAt`, falling back to `project.createdAt` — task timestamps are the movement signal already in `useApp`; `projectActivity` rows aren't exposed there). Newest-first within tier matches both the rail's tiebreak (attention.ts:681-685) and `myClaimedTasks`' recency convention.

**Relationship to the attention rail:** the rail stays the cross-kind, prioritized *nudge* surface (one item per confirmable task, with completer name and deep link); this page is the per-project *inventory* — the same split MyTasks declared for check-in nudges (MyTasks.tsx:108-111 "The check-in nudges stay where they live today: the attention rail"). Confirmation itself stays on the project page — exactly one surface owns the action and its framing, mirroring MyTasks' read-only-by-design comment.

**Entry points:** mirror MyTasks exactly. (a) Profile: a card inside the `lg:columns-2` participation cluster (Profile.tsx:338), directly after the carrying card, hidden when `projectCount === 0`, containing the shared `MyProjectsSummary` sentence ("You organize 3 projects.") and a "See all" link — **yes, reuse the MyTasksSummary pattern**: export `MyProjectsSummary` from the page so Profile and page describe the view in the same words. Awaiting counts deliberately do *not* appear on the Profile card (counts live inside the page only). (b) Board Projects tab: a quiet link below the "Tasks you're carrying" link, `lg:col-start-1 lg:row-start-4` (continuing the Board.tsx:579-597 ladder: archive row-start-2, my-tasks row-start-3), gated on `projectCount > 0`, plain label, no count.

### Implementation steps

1. **New lib helper** — apps/web/src/lib/myProjects.ts: export `myOrganizedProjects(input)` returning `MyOrganizedProjectsView { groups: OrganizedProject[]; projectCount: number; awaitingYouTotal: number }`, where `OrganizedProject = { project, role: "primary" | "co", tasks, openTaskCount, awaitingYouCount, pendingInviteCount, lastActivityAt }`. Input: `{ memberKey, projects, projectTasks, coorgInvitations?, coorgInvitationResponses?, coorgInvitationRevocations?, blockedKeys?, now? }`. Single pass building `tasksByProject`, then per-project counts and the tier sort. Top-of-file scope-decision doc comment mirroring myTasks.ts:18-37: self-only (no-activity-search), pull-only (no-notifications), hide-when-empty (solidarity-not-shame), static-array authority (PR #238 materialization, with the why-not-derived-rows paragraph), completed-only-with-loose-ends rule, blocked-party suppression (blocking.md §6).
2. **Lib tests** — apps/web/src/lib/myProjects.test.ts: reuse `makeProject`/`makeTask` fixture builders from myTasks.test.ts, plus a `makeInvitation` builder (shape per packages/shared/src/types.ts:785-831). Cases listed under Test plan.
3. **Page** — apps/web/src/pages/MyProjects.tsx: default-export `MyProjectsPage`, named-export `MyProjectsSummary({ projectCount })`. Reads `currentMember, projects, projectTasks, exchanges, coorgInvitations, coorgInvitationResponses, coorgInvitationRevocations, blockedKeys` from `useApp`; `useMemo` the view; per-group `computeProjectMomentum({ project, tasks: group.tasks, exchanges })`; header with back button + `WhyTooltip principleId="no-notifications"`; `EmptyState` with `action={{ label: t("myProjects.startProject"), to: "/project/new" }}`; cards per the Design section.
4. **Page tests** — apps/web/src/pages/MyProjects.test.tsx: copy the MyTasks.test.tsx harness verbatim. Mock state must include every field the page destructures, incl. `exchanges: []` and `blockedKeys: new Set()`.
5. **Route** — apps/web/src/App.tsx: import `MyProjectsPage`; add `<Route path="/my-projects" element={<MyProjectsPage />} />` beside the `/my-tasks` route.
6. **Profile entry card** — apps/web/src/pages/Profile.tsx: `const organizing = useMemo(() => myOrganizedProjects({...}), [...])` beside the `carrying` memo; render the gated card immediately after the carrying card inside the `lg:columns-2` cluster, reusing its exact markup shape (heading `myProjects.title`, `MyProjectsSummary`, link to `/my-projects` labeled `myProjects.seeAll`).
7. **Board link** — apps/web/src/pages/Board.tsx: `organizingCount` memo beside `carryingCount`; gated `<Link to="/my-projects">` after the my-tasks link with `lg:col-start-1 lg:row-start-4` and label `myProjects.boardLink`.
8. **i18n** — add the `myProjects` block to apps/web/src/i18n/locales/en.json (after `myTasks`) and the es twin to es.json.

### i18n
Proposed en keys (i18next `_one`/`_other` plural suffixes, the repo's existing pattern):

```json
"myProjects": {
  "title": "Projects you organize",
  "subtitle": "Every project in your care — as organizer or co-organizer — and what's waiting on you, in one place.",
  "summaryOne": "You organize 1 project.",
  "summaryOther": "You organize {{count}} projects.",
  "awaiting_one": "1 task waiting for your confirmation",
  "awaiting_other": "{{count}} tasks waiting for your confirmation",
  "openTasks_one": "1 open task",
  "openTasks_other": "{{count}} open tasks",
  "noOpenTasks": "No open tasks right now",
  "pendingInvites_one": "1 co-organizer invitation pending",
  "pendingInvites_other": "{{count}} co-organizer invitations pending",
  "coOrganizerChip": "Co-organizer",
  "emptyTitle": "No projects in your care right now",
  "empty": "When you start a project — or accept a co-organizer invitation — it shows up here, so you can see what's waiting on you without opening each project one by one.",
  "startProject": "Start a project",
  "seeAll": "See all projects you organize",
  "boardLink": "Projects you organize"
}
```

es translations required for every key; match the register of the existing es `myTasks` block ("Tareas que llevas") — e.g. `title: "Proyectos que organizas"`. Translation pass needed, not literal machine output.

### Test plan
**lib/myProjects.test.ts** (pure, no DOM):
1. Empty view when the member organizes nothing (member-only and stranger projects excluded).
2. Includes projects where the member is primary (`organizerKey`) and where they appear in `coOrganizerKeys`; `role` reported correctly.
3. Awaiting count: counts others' `awaiting_confirmation` tasks; excludes `completedBy === memberKey` (the projects.ts:701 self-confirm mirror); excludes blocked completers when `blockedKeys` passed; `awaitingYouTotal` sums across projects.
4. Open count counts only `status === "open"`.
5. Pending invitations: outstanding (no response, no revocation, `now < expiresAt`, inviter = member) counted; responded, revoked, expired (boundary `now >= expiresAt`), other-inviter, and blocked-invitee rows excluded.
6. Status scope: archived always excluded; completed excluded when clean, included while it has awaiting-you tasks; planning/paused included.
7. Ordering: awaiting-tier first, then `lastActivityAt` desc within tiers.

**pages/MyProjects.test.tsx** (mocked `useApp`):
1. Empty state renders with the `/project/new` action link.
2. One card per organized project, title links to `/project/p1`; non-organized project absent; summary sentence text.
3. Awaiting sentence appears for an other-completed awaiting task and is absent when the only awaiting task is self-completed.
4. Paused project shows "Paused" status chip; momentum chip renders ("Planning" for a planning project — deterministic without exchanges).
5. Pending-invitation sentence appears for an outstanding invitation and disappears when a revocation row is added.

**Regression checks:** Board.readingOrder.test.tsx is unaffected — the new link is gated off in its fixtures and sits after the archive link anyway; i18n parity test goes red until es lands (by design).

### Open questions
1. Should completed-and-clean projects be reachable at all from this view (e.g. a one-line "completed projects live on the Board" footnote), or is silent drop-off enough? Recommended: silent drop; revisit on organizer feedback.
2. The outstanding-invitation predicate now exists in three places (attention.ts:540-544, `deriveInvitations` in ProjectDetail.tsx:2298-2315, and the new helper). Worth extracting an `outstandingInvitations()` helper into db/coorgInvitations.ts in this PR, or leave as a follow-up refactor? Recommended: follow-up, to keep this PR shaped like the MyTasks template.
3. Co-organizer chip: keep (recommended — explains the absent invitation line) or drop for minimalism?
4. `lastActivityAt` from task timestamps ignores announcement/pause/resume activity (`projectActivity` isn't exposed via `useApp`). Acceptable for v1? Recommended yes; piping `projectActivity` into AppContext is a bigger change than this view warrants.

## 8. Co-organizer authority reconciliation
**Tier:** medium — **Effort:** S–M (one focused PR: 4 call-site edits, ~6 test inversions/additions, 3 doc files; no schema change, no migration)

### Why
PR #238 settled the authority model: `Project.coOrganizerKeys` is the LIVE authority list, written by every grant path (v21 grandfather migration in apps/web/src/db/database.ts:584-645; `materializeAcceptedCoOrganizer` in apps/web/src/db/coorgInvitations.ts:350-399, called from the local accept path and both federation ingest paths in apps/web/src/lib/federationSync.ts:492,588; `handoffOrganizer` demotion in apps/web/src/db/projects.ts:1028-1035) and every removal path (`removeCoOrganizer`, projects.ts:400-440). The signed invitation/response/revocation rows are the audit trail.

Four read sites still compute authority from the rows via `effectiveCoOrganizerKeysFromRows` (added by PR #235):

1. apps/web/src/lib/attention.ts:439-444 — the `isProjectOrganizer` local helper (gates `project_deadline_approaching`, `project_paused_long`);
2. apps/web/src/lib/attention.ts:341-345 — the inline `confirm_task` organizer check;
3. apps/web/src/pages/Calendar.tsx:117-125 — the "Mine" filter;
4. apps/web/src/state/AppContext.tsx:590-598 — the block-visibility "still has standing" gate.

Handoff demotion and step-down/removal have no signed record types, so these four sites diverge from every action gate (`requireOrganizer`, `confirmProjectTaskCompletion` at projects.ts:705, the ProjectDetail controls at ProjectDetail.tsx:237):

- **Under-grant:** a handoff-demoted ex-primary is in the array but has zero rows — they lose organizer attention items, drop out of Calendar "Mine", and the AppContext gate can disappear the project they still co-organize if they block the new primary.
- **Over-grant:** a stepped-down/removed co-organizer's accepted rows persist forever — the rows view keeps them "in role", so they keep receiving `confirm_task` items pointing at a confirm action that `confirmProjectTaskCompletion` will reject with "Only project organizers can confirm completions."

### Ethos check
- **community-authority — authority changes must be legible.** Today the same person is an organizer at the project page and a non-organizer in the attention rail. Two truths about who holds authority is illegible by construction. The transitions themselves ARE legible — `organizer_handoff` and `coorganizer_stepdown` activity rows are written (projects.ts:1037-1040, 429-437) — but the rows-derived readers ignore them. (Verified gap: primary-removal of someone else logs *nothing* — `removeCoOrganizer` logs only on `isSelfRemoval`. Named in open questions.) Option A would make this worse, not better: fabricated invitation/acceptance/revocation rows are records of ceremonies that never happened — the §2 core property of the design doc ("signed records imputed to a member should always trace back to that member's deliberate act") inverted at steady state.
- **solidarity-not-shame.** The over-grant is the sharp edge: a member who deliberately stepped back from a role keeps getting "needs your confirmation" nudges, and tapping through hits a rejection error. That is the system refusing to let someone leave gracefully — a shame-shaped dead end aimed at exactly the member who exercised the right to step down. The under-grant quietly punishes the ex-primary who did the generous thing (handing off): their own project vanishes from "Mine".

### Options considered

**Option A — runtime sentinel rows** (extend the v21 `signature: "grandfathered"` + local-only flag pattern: `handoffOrganizer` synthesizes an invitation+accept pair; `removeCoOrganizer` synthesizes a revocation). Honest costs, all verified in code:

- *Bends record semantics twice.* `CoOrganizerInvitationRevocationPayload` is documented as modeling **pre-response cancellation only** (packages/shared/src/types.ts:812-824), and `revokeCoOrganizerInvitation` enforces it (coorgInvitations.ts:428-437). A sentinel post-acceptance revocation must bypass the public API and write rows the write path itself declares invalid. The handoff side is worse: a synthesized acceptance imputes a signature ceremony to the demotee that never occurred, and a self-step-down sentinel revocation claims the *inviter* acted when the co-organizer did — misattributed actor, anti-legible.
- *Multi-invitation fan-out.* Re-invitation after decline is supported and tested (the dedup test at apps/web/src/db/coorgInvitations.test.ts:793 proves multiple accepted invitations per member/project is a real state). A removal sentinel must revoke ALL accepted invitations for that pair or the member stays effective through the un-revoked one. Fiddly, and a silent correctness trap.
- *Outbox hygiene becomes a permanent invariant.* Enqueue is explicit (only `issueCoOrganizerInvitation` / `respondTo…` / `revoke…` call `enqueueOutboxRow`), so keeping sentinels out is doable — and the server would 422 unverifiable signatures anyway (apps/server/src/routes/coorgInvitationResponses.ts:48-51) — but it is one more never-regress rule to test forever.
- *The federation symmetry argument is void.* Verified: the server is a pure relay (verify-on-ingest, store, serve — routes + apps/server/src/peerPull.ts never compute authority). Peer PWAs that pull rows only store them and call `materializeAcceptedCoOrganizer`, which no-ops without the project row — and **projects do not federate at all**. Every surface that can ask "is X a co-organizer of P" lives on a device hosting P's row — the same device where the array was updated. Since sentinels must never federate, A fixes exactly the same four local sites B fixes, while peers still never learn of removals under either option. A buys zero extra consistency for its semantic cost.
- *The "derived view stays authoritative" purity is already gone.* §4's rule mechanically treats any revocation row as disqualifying (no timing semantics — `revokedInvitationIds.has(...)` at coorgInvitations.ts:584), so sentinels *work*, but the view's meaning degrades from "consent-verified set" to "set minus whatever local fabrications we injected".

Effort: M–L, plus permanent semantic debt.

**Option B — point the four read sites at the static array.** Post-#238 the array is correct for ALL transitions: accept (materialized in the same transaction), federation arrival in either order, handoff demotion, step-down/removal, grandfather. This reverts #235's *mechanism* while keeping its *fix* — the bug #235 patched (fresh accepts invisible because nothing wrote the array) is now solved at the root by materialization. Honest costs:

- *Loses read-time "signature-backing"?* No — that protection was illusory. Verified: `effectiveCoOrganizerKeysFromRows` never verifies signatures at read time (no verify call in coorgInvitations.ts:564-594; #235's own test fixtures use `signature: "sig"`). Verification happens at ingest — identically for rows and for array writes. A buggy/malicious direct write can forge rows in the three tables exactly as easily as an array entry. And the four sites are display/pull surfaces; every privileged *action* already gates on the array. The four sites were not meaningfully safer, only inconsistent.
- *Test inversions required* — enumerated below by name. This is the bulk of the work.
- *One residual freshness nuance:* the rows-based expiry clause does not apply — the array only ever contains materialized accepts, so nothing is lost.

Effort: S–M.

**Option C — hybrids.** Array ∪ rows re-creates the over-grant (stepped-down member returns via rows). Array ∩ rows re-creates the under-grant (handoff demotee has no rows). "Array as authority + rows-mismatch advisory banner" is not a reconciliation mechanism at all — it's an audit UI feature, and it would permanently flag *legitimate* row-less entries (handoff demotees) unless it also understands `ProjectActivity` provenance. Reject as a fix; the advisory idea survives only as an open question.

### Recommendation

**Option B, firmly.** Deciding reasons:

1. **Single source of live truth.** Every gate — action and display — reads one predicate, `isOrganizer` over the materialized array. The divergence is eliminated, not patched around. The class of bug ("site X reads representation Y") can't recur once the second representation has no authority callers.
2. **A's only theoretical advantage (row symmetry visible to peers) is unreachable** — sentinels can't federate and projects don't federate, so A is strictly local, same as B, at higher cost.
3. **The rows stay what they are good at**: verifiable provenance of how each entry earned its place — unpolluted by fabricated ceremonies. Removal provenance for remote auditors genuinely requires a *real signed record type*, which is future work the §5 note already frames as its own conversation; nothing in this fix forecloses it.
4. **Values:** B ends the stepped-down member's phantom nudges and restores the handoff demotee's standing — both ethos items — without manufacturing false consent records to do it.

### Implementation steps

1. **apps/web/src/lib/attention.ts** — delete the `effectiveCoOrgByProjectId` map, `isEffectiveCoOrg`, the `_invitations`/`_responses`/`_revocations`/`_now` locals, and the §4-quoting comment block (lines 266-295); import `isOrganizer` from `@/db/projects` (the file already imports `canClaimTask` from there — no new module edge). Replace the `confirm_task` inline check (lines 341-345) and the `isProjectOrganizer` body (lines 439-444) with `isOrganizer(project, key)`. **Keep** `coorgInvitations`/`coorgInvitationResponses`/`coorgInvitationRevocations` on `AttentionInput` — the invitee-side `coorganizer_invitation_received` loop (lines 525-567) still needs all three.
2. **apps/web/src/pages/Calendar.tsx** — Mine filter becomes `isOrganizer(p, myKey)`; drop the `effectiveCoOrganizerKeysFromRows` import (line 26), the three `useApp()` destructured fields (lines 59-61), and the three `useMemo` deps (lines 140-142). The Mine filter was this file's only use of the rows — a real signature simplification.
3. **apps/web/src/state/AppContext.tsx** — the `filteredProjects` standing gate (lines 590-598) becomes `p.coOrganizerKeys.includes(currentMemberKey)`; drop the import, the three underscore locals, and the three memo deps. **Keep** the three live queries and context fields (lines 466-480) — AttentionSection.tsx:87-89 and ProjectDetail.tsx:118-120 (pending/past invitations panel, which correctly reads raw rows) still consume them. Rewrite the stale "§4 derived view" comment (lines 582-586) to cite the materialized array + shipped-reality note.
4. **apps/web/src/db/coorgInvitations.ts** — delete `effectiveCoOrganizerKeysFromRows` (lines 564-594): after steps 1-3 it has zero production callers, and deleting it prevents a future contributor from re-introducing the divergence by reaching for it as an authority predicate (that is literally how #235 happened). Re-document the async `effectiveCoOrganizerKeys` (lines 498-545) as the §4 *audit/verification* view — explicitly NOT an authority predicate.
5. **Test inversions in apps/web/src/lib/attention.test.ts** (describe block "organizer authority reads the DERIVED co-organizer view", line 1167 — rename to "organizer authority reads the materialized live list"):
   - "surfaces confirm_task to a co-organizer recognized via the derived view (stale-array repro)" (line 1200) → invert: fixture `coOrganizerKeys: [bob.publicKey]`, no rows → `confirm_task` appears (accept→materialized array→items appear).
   - "surfaces project_deadline_approaching to a derived-view co-organizer" (line 1236) → same inversion.
   - "does NOT surface to an invitee whose acceptance was revoked" (line 1261) → repurpose as the **over-grant regression**: "does NOT surface organizer items to a stepped-down co-organizer (accepted rows remain, array cleared)" — accepted invitation+response rows present, `coOrganizerKeys: []` → no items (step-down→array cleared→items stop).
   - "does NOT surface to an invitee who declined" (line 1295) → keep as a second negative (rows alone never grant) or fold into the step-down test.
   - **New under-grant regression:** "surfaces organizer items to a handoff demotee present only in the array (no rows)" — `organizerKey: newPrimary`, `coOrganizerKeys: [oldPrimary]`, zero coorg rows → deadline/confirm items appear for `oldPrimary`.
6. **Other test files:** delete the `effectiveCoOrganizerKeysFromRows` describe block in apps/web/src/db/coorgInvitations.test.ts:693-806 (7 tests — the §4 rule remains covered in pure form by the `materializeAcceptedCoOrganizer` raw-rows guard tests and the async-view tests). Calendar.test.tsx: remove the now-unused empty `coorgInvitations*` mock-state defaults. Optionally add a Mine-filter test: demotee's project appears, stepped-down project doesn't. AttentionSection.coorg.test.tsx needs no change.
7. **Docs:** (a) docs/co-organizer-invitations.md §5 — replace the "Residual divergence, tracked" paragraph with the resolution: all consumers read the materialized array; rows are the audit trail; decision recorded here (this plan is the design conversation the note asked for). (b) apps/web/src/db/projects.ts:344-352 — replace the "Known residual divergence" paragraph of the `isOrganizer` comment with "every read site reads this array as of PR #NNN". (c) docs/task-ordering-and-dependencies.md:651-654 — fix the stale parenthetical claiming "the authority check reads the effective set, not the static array".

### Test plan

- Workspace typecheck — the deleted export must produce zero dangling-import errors.
- New/inverted unit coverage (step 5): materialized-accept grants at all four surfaces' logic; step-down revokes; handoff demotee grants; declined/revoked rows alone never grant.
- End-to-end Dexie-level checks already exist and must stay green: "accept lands the invitee in Project.coOrganizerKeys and isOrganizer agrees", "a materialized co-organizer can step down through removeCoOrganizer" (coorgInvitations.test.ts:811, 852), and the federation arrival-order tests in apps/web/src/lib/federationSync.test.ts.
- Manual smoke via the seeded demo: accept an invitation → confirm_task appears; step down → it disappears on the next live-query tick; perform a handoff → demotee sees the project under Calendar "Mine".
- Negative check: grep the final diff for `effectiveCoOrganizerKeysFromRows` — only doc/history mentions may remain.

### Open questions

1. **Real signed step-down / handoff / removal record types (the future "Option D").** The only way remote auditors ever get removal provenance, and the §5 note's deferred conversation. Out of scope here; B neither needs it nor forecloses it. Becomes worth doing if/when projects themselves federate (currently they do not).
2. **Primary-removal legibility gap (small companion fix?):** `removeCoOrganizer` logs `coorganizer_stepdown` only on self-removal (projects.ts:429-437); a primary removing someone else writes no `ProjectActivity` row, and `ProjectActivityType` has no `coorganizer_removed`. One enum member + label + i18n would make every authority transition visible in the project history — strongly aligned with community-authority, cheap, but scope-separable.
3. **Keep or delete the async `effectiveCoOrganizerKeys`?** Plan keeps it as the documented audit view / executable §4 spec (and seed for a future "array entry lacks row provenance" advisory). Deleting it too is defensible if maintainers prefer zero parity burden; note three §4-rule copies exist today (async view, sync view, inline materializer guards) — B reduces that to two, and a later consolidation could reach one.
4. **Pilot data:** is any live community currently mid-divergence (a stepped-down member with lingering rows)? B self-heals on deploy (reads flip to the array instantly; no migration), but a release note for organizers may be worth it.

---

# Part III — Design conversations first

## 9. Project completion moment
**Tier:** design-conversation — **Effort:** M

### Why
`completeProject` (apps/web/src/db/projects.ts:184) flips status, logs a `project_completed` activity (lines 207-213, already carrying `{ contributedHours, targetHours }`), and fires the organizer's Keystone achievement — but the collective gets nothing. Weeks of shared work end with a status chip changing color. The codebase already knows how to celebrate without surveilling: the Dashboard's `MilestoneCelebration` (apps/web/src/pages/Dashboard.tsx:334) + `useNewlyReachedMilestones` (lines 351-377) render a one-time, per-device, aggregate-level moment persisted via `SETTING_KEYS.celebratedMilestones`, animated with `animate-milestone-pop`. This item extends that exact pattern to project closure.

Verified posture: projects/tasks are local-only — the `OutboxRow.kind` union contains no `project` or `task` discriminator. Everything below is local computation over data already on the device; nothing new crosses the wire.

### Values tension
- **no-leaderboards is the reason this was parked, and the failure mode is gradual, not dramatic.** "12 members moved 87 hours together" is one design review away from "see who helped," then "top contributors this quarter." The structural defense: the closure helper must return *only* `{ contributorCount, hoursMoved }` — never the key set — so per-member data can't leak into a render by accident. Same discipline as the union-rejection comments in database.ts.
- **solidarity-not-shame has a subtle trap: the target.** `completeProject` fires from active *or* paused with no minimum hours — a community can honestly complete a project at 60% of `targetHours` (capacity changed; that is allowed to be fine). Any closure copy that mentions percent-of-target or echoes the milestone key's "{{percent}}% of the way there" framing (en.json:703-705 — note: no live consumer of `projects.milestone.reached` was found in src/; the history feed uses `projects.activityType.milestone_reached` instead) turns an under-target completion into a quiet verdict. Closure copy must use absolute totals only. Corollary: a completion with zero confirmed tasks shows no tally at all — "0 members moved 0 hours" is shame-shaped.
- **Whose moment is it?** Gating the celebration to contributors creates an in-group ("you counted") and an out-group on a page everyone can open. "The unit of measurement is us, not me" says: every member who opens the page sees the same communal sentence. No "you helped X hours" personalization.
- **no-notifications:** the moment renders when someone opens the project — no push, no badge, no attention item. Cultural risk if violated: completion becomes another buzz that burns out the most active members.
- **Data honesty (which count is true?):** ProjectDetail already shows `Contributors: {{count}}` derived from `task.completedBy` on completed tasks (ProjectDetail.tsx:251-255). But exchanges are the signed truth: every confirmation writes an `Exchange` with `postId = "project:<id>/task:<id>"` and `helperKey = task.completedBy`, countersigned, and the auto-confirm path (autoConfirmSweep.ts:167) still records the human completer as helper. Tasks are mutable local rows (`unclaimProjectTask` clears `completedBy` on walk-backs); exchanges are immutable. Use exchanges — and compute hours from the same exchange set so the sentence is internally consistent.

### Options considered
1. **Where it renders.** (a) Dashboard-style banner on the Board projects tab — too far from the work, and re-litigates Dashboard layout. (b) Toast on the organizer's confirm click — only the organizer sees it; that's a private medal, exactly wrong. (c) **Project page itself: a one-time pop card in the sidebar, plus a quiet permanent line folded into the existing completed banner (ProjectDetail.tsx:403-409), plus the same quiet line on archive cards.** Chosen: (c).
2. **One-time persistence.** (a) New Dexie table — overkill. (b) `ProjectActivity` row — pollutes a shared log with per-device display state. (c) **New `SETTING_KEYS.celebratedProjectCompletions` storing a JSON array of project ids, mirroring `celebratedMilestones`** — survives soft purge, cleared by hard purge with zero extra work (apps/web/src/lib/panic.ts:133-135,173). Chosen: (c).
3. **"Thank contributors" affordance.** (a) New free-text field on the moment / new record type — a second announcement-shaped write path, new copy, new moderation surface; rejected. (b) **Nudge toward the existing `postAnnouncement` composer** (projects.ts:1047; the `AnnouncementSection` form already renders for organizers on completed projects — only `archived` is rejected): the moment card shows organizers a one-line hint + button that scrolls/focuses the existing textarea. Chosen: (b) — announcements are already the community-visible, organizer-authored channel, and `community-authority` prefers thanks spoken in the commons over a system-generated certificate.
4. **Pop on archived projects?** Pop only while `status === "completed"`; the permanent line renders for completed *and* archived (note `archiveProject` preserves `completedAt`, projects.ts:261). The archive stays calm; the information persists.

### Recommendation
Aggregate-only closure moment on the project page, computed from signed exchanges, shown once per device to *any* viewer, with a permanent low-volume line afterward and an organizer-only nudge into the existing announcement box. Absolute numbers only; never names, never shares, never percent-of-target.

### Implementation steps
1. **New pure helper** apps/web/src/lib/projectClosure.ts — `computeProjectClosure({ project, exchanges }): { contributorCount: number; hoursMoved: number }`. Match exchanges by `x.postId.startsWith("project:" + project.id + "/")` (the prefix is inside the signed payload); `contributorCount` = distinct `helperKey`, `hoursMoved` = rounded sum of `hoursExchanged` (2-dp). Return type deliberately contains only numbers — document the no-leaderboards rationale in the header comment, citing the projectMomentum.ts:24-27 "signal about the project, not the people" precedent.
2. **Setting key** in apps/web/src/db/database.ts `SETTING_KEYS`: `celebratedProjectCompletions` with a doc comment naming it per-device display state (JSON array of project ids).
3. **ProjectDetail.tsx**: add `useNewlyCompletedProjectMoment(project)` hook + `CompletionMoment` component mirroring Dashboard.tsx:334-377 (`getSetting`/`setSetting`, `animate-milestone-pop`, decorative glyph `aria-hidden`; prefer the `Sprig` visual over the party-popper for a quieter register). Render it inside the sidebar overview card, directly above the completed banner, only when `project.status === "completed"`, closure `contributorCount > 0`, and the id is not yet in the celebrated set. Organizer variant adds the thanks hint + a button that scrolls to / focuses the `AnnouncementSection` textarea (give it a stable `id`).
4. **Permanent line**: extend the completed banner (ProjectDetail.tsx:403-409) to render for `completed || archived` and append the aggregate sentence after `projects.detail.completed` when `contributorCount > 0`. Optionally point the existing `Contributors:` field at the same helper so the page can't show two different counts — flag in PR description.
5. **Archive card line**: apps/web/src/pages/ProjectArchive.tsx pulls `exchanges` from `useApp()` (already exposed), computes closure per project, passes an optional terse line into apps/web/src/components/ProjectCard.tsx (new optional prop; Board cards unchanged).
6. **i18n**: en + es (parity).
7. No changes to `completeProject` itself; no new activity types; no outbox involvement.

### i18n (proposed en keys + draft copy)
Under `projects.completionMoment` (plural via i18next `_one`/`_other` with `count` = contributors; hours pre-formatted with `formatHours`):
- `title`: "Complete, together."
- `summary_one`: "{{count}} member moved {{hours}} hours to carry this to the finish."
- `summary_other`: "{{count}} members moved {{hours}} hours together."
- `thanksHint`: "If you'd like to thank everyone, post an update — it stays with the project."
- `thanksCta`: "Write an update"
- `cardLine_one` / `cardLine_other` (archive card, terse): "{{count}} member · {{hours}} hours" / "{{count}} members · {{hours}} hours, together"

No superlatives, no percent, no names. Matching es drafts required for parity — native-speaker review flagged below.

### Test plan
- lib/projectClosure.test.ts (pure): distinct-helper dedupe across tasks; auto-confirmed exchange (helper = organizer-completer) counted; non-project and other-project exchanges excluded; hours rounding; empty set returns zeros.
- pages/ProjectDetail.completionMoment.test.tsx (fake-indexeddb + fixtures modeled on ProjectDetail.coorg.test.tsx): pop card renders once with aggregate sentence and writes the setting; remount shows no pop but the permanent banner line; **guardrail assertion** — within the moment card, no contributor `displayName` from the fixture appears; organizer sees the thanks CTA, member does not; zero-contributor completion renders neither pop nor tally; archived project shows line, no pop.
- i18n parity test covers en/es key sets automatically.

### Open questions
- Reconcile the existing task-derived `Contributors:` field with the exchange-derived count in this PR, or separately? (Two counts on one page would be dishonest.)
- Should a member whose first visit happens post-archive ever get the pop? (Plan says no — confirm in design conversation.)
- Is the Board projects tab's completed card also entitled to the quiet line, or archive-only (current plan)?
- es copy needs native review, especially gendered "miembros."

## 10. Project work days (events ↔ projects)
**Tier:** design-conversation — **Effort:** M (one Dexie version, one new data-layer module, three UI touchpoints, no server work)

### Why
Pilot communities asked for events precisely because skillshares, potlucks, and *work days* weren't shaped by an existing `Post` or `Project` (docs/community-events.md §2). A work day is the one event shape that *is* about a project — "Saturday build day for Community Fridge" — and today the connection lives nowhere: the organizer creates an event from the Calendar FAB, the project page never shows it, and the Calendar's project filter (`calendar.filters.project`) doesn't narrow events at all — verified in apps/web/src/pages/Calendar.tsx: `projectId` filters only deadline entries and zeroes posts/exchanges, while `events` / `eventCancellations` are passed to `buildCalendar` unfiltered (lines 167-187). The design doc's own phase-2 template list anticipates exactly this ("Work day — … prompts for the project context", §10). The asymmetry that makes this design-sensitive: **events are federated, signed, wire-pinned records; projects are local-only.** Any link between them must respect that boundary.

### Federation analysis

**(a) New wire field — `projectId` on `EventPayload`. Rejected for phase 1.**
- packages/shared/src/types.ts:843-846 is explicit: "FIELD ORDER IS THE WIRE CONTRACT… Adding a field is a breaking change to the federation wire format." `canonicalEventPayload` is the signature preimage; adding `projectId` means new-node-signed events fail signature verification on every un-upgraded peer — they don't degrade, they look *forged*. Every peer must upgrade in lockstep, which a federation of independently-operated community nodes cannot guarantee.
- Even after a lockstep upgrade, the field is semantically dead on arrival: projects never federate, so a peer receives a `projectId` it cannot resolve. The only "fix" is federating projects, which is enormous scope creep smuggled in through one field.
- It is also a genuine threat-model widening: a stable `projectId` correlator across recurring events gives the organizing-employer / union-busting adversaries (docs/threat-model.md §3, §7) a "project Y meets at location Z on cadence C" join key on the public wire. Repo discipline requires the threat-model §7 entry to land *before* any code — and the entry would be hard to defend.
- Finally, it spends the wire-evolution budget that §10 deliberately reserved for `templateId`.

**(b) Local-only link table — recommended.**
A Dexie-only `eventProjectLinks` table (`eventId ↔ projectId`), same posture as `EventRsvpRow` and `BlockRow`: never signed, never enqueued, never pulled. The repo has this discipline down to a pattern worth copying verbatim:
- Type lives in apps/web/src/types/index.ts (NOT packages/shared) with the "absence is load-bearing" comment block — exactly like `EventRsvpRow` and `BlockRow`.
- `OutboxRow.kind` union in apps/web/src/db/database.ts gains a third "Intentionally NOT a member of this union" paragraph.
- Negative tests lock it in: mirror apps/web/src/db/events.test.ts:97-128 (`@ts-expect-error` on the union member, missing enqueue/pull helpers) and the "outbox length unchanged" assertion at :264-267; mirror apps/web/src/types/blocking.test.ts:40-75 (structural `@ts-expect-error`: no `signature`, no `nodeId` on the row).
- Result: the linking node renders the work-day card and the project-filtered calendar; **peer nodes see a plain event** — option (b) degrades to option (c) for peers, by construction. Honest costs: the project⇄event connection does not survive to other nodes, does not ride the export bundle (apps/web/src/lib/exportData.ts builds an allowlist — the link is excluded by construction), and a member who re-keys onto a peer node won't see the card there. All acceptable: the project itself doesn't exist on peer nodes either.

**(c) Convention only — the do-nothing baseline.**
Organizers write "for the Community Fridge" in the event description. Zero code, zero wire risk, and it's what peers see under (b) anyway. But it leaves the felt need unmet: nothing appears on the project page, the calendar project filter stays broken for events, there's no organizer gate on what *claims* to be project programming, and discovery is grep-by-eyeball. Worth naming because (b) must stay small enough to beat this baseline.

**Phase-2 composition (`templateId`).** The reserved slot will eventually carry `"work-day"` as a *template kind* — prefills and duration suggestions, per §10. It will never carry the project pointer (same dead-pointer problem as (a)). Design (b) so the two are orthogonal: the link row stays the only project pointer; when templates land, the "Schedule a work day" flow sets `templateId: "work-day"` on the wire *and* writes the same local link row. Nothing in (b) needs rework. (If provenance ever matters, a local-only `source: "manual" | "template"` column can be added in a later Dexie version; don't add it now.)

### Recommendation
Option (b). One new local-only table, created at event-creation time from a "Schedule a work day" button on ProjectDetail, organizer/co-organizer-gated.

- **Who may link:** organizer or co-organizer, via the same `isOrganizer` predicate that already gates `OrganizerControls`, `AddTaskForm`, and announcements on the same page. Justification: a linked event renders on the project page as project programming, and every other thing that appears there under the project's banner carries organizer authority. Event *creation* stays ungated for everyone — any member can still create a plain event that mentions the project in free text (option (c) remains universally available), so no one's ability to convene is gated, only the project page's endorsement of it.
- **Link creation:** only through the prefill flow (no separate "link an existing event" picker in phase 1 — smaller surface, and the §3 comparison card moment stays the single signing moment). The data layer re-validates organizer authority on submit so a hand-crafted `/events/new?projectId=…` URL from a non-organizer yields a plain event and zero link rows.
- **Unlink / cancel:** no unlink affordance in phase 1. Events have no edits (§5); the corrective path for "wrong project" is the same cancel-and-recreate path as "wrong time." Link rows for cancelled events persist (harmless local history), but the work-days card and the calendar already suppress cancelled events, so a cancelled work day silently drops from the card; RSVP'd members are informed by the existing `event_cancelled` attention item — no duplicate surface.

### Ethos check
- **no-notifications:** the card is pull-only; zero new `AttentionItem` kinds. Day-of coverage already exists via `event_today`, which fires for RSVP'd members regardless of linkage. Nothing buzzes.
- **solidarity-not-shame:** the "Upcoming work days" card is hidden entirely when empty — no "this project has never held a work day" absence-shaming.
- **no-leaderboards:** no attendance roster on the card, no per-member counts, and the exchange-density indicator is untouched.
- **privacy-precondition:** the link row never enters the outbox, the export bundle, or any route. Stated plainly: **linking reveals "this event is project work" on the linking node only.** One honest caveat: the *prefilled title* ("Work day — Community Fridge") does federate as free text if the organizer keeps it — that is the organizer's deliberate, editable choice made in front of the §3 comparison card, which is unchanged. We do NOT prefill `location` from any project field — the location string is the threat-model-sensitive field and must be typed deliberately.
- **RSVP visibility rules: untouched.** Roster tiers per §4/§6/§7 ship exactly as-is; the card links to EventDetail, where the existing tiers apply. No RSVP data is surfaced on the project page in phase 1.
- **community-authority:** the gate is the project's existing organizer set, not a new role.

### Implementation steps
1. **Docs predicate (small).** Add a short "Project work days (local-only link)" subsection to docs/community-events.md (after §10 so the templateId composition is adjacent), declaring the negative-space contract: `"event_project_link"` MUST NOT appear in `OutboxRow.kind`; no route, no cursor, no pull. Add one sentence inside the existing threat-model §7 events entry recording that the link table does not widen the wire (no new bytes cross any wire — say that explicitly).
2. **Row type.** apps/web/src/types/index.ts: add `EventProjectLinkRow { id; eventId; projectId; linkedBy; createdAt }` with the local-only comment block copied in spirit from `EventRsvpRow`. Deliberately no `signature`, no `nodeId`. Not in packages/shared — the federation layer must have no knowledge of this shape.
3. **Dexie migration** (next free version — see sequencing note): `stores({ eventProjectLinks: "id, eventId, projectId, createdAt, [projectId+eventId]" })` — pure new table, no backfill. Add the table declaration with a local-only doc comment mirroring the `blocks` table comment, and the third "Intentionally NOT a member of this union" paragraph under `OutboxRow.kind`.
4. **Data layer.** New apps/web/src/db/eventProjectLinks.ts:
   - `scheduleProjectWorkDay(input: CreateEventInput & { projectId: string }): Promise<Event>` — opens a transaction over `[projects, projectActivity, events, outbox, settings, eventProjectLinks]`; loads the project; rejects unless `isOrganizer(project, input.organizerKey)`; calls `createEvent(rest)` (Dexie nested-transaction subset rule composes cleanly); enforces one-link-per-event; writes the link row; calls `logActivity(projectId, "work_day_scheduled", organizerKey, { eventId, eventTitle, startsAt }, nodeId)`. events.ts itself stays untouched — the federated layer never learns about links.
   - Read helpers: `listLinksForProject(projectId)`, `getLinkForEvent(eventId)`. **No enqueue helper, no pull helper** — module docstring names both absences.
5. **Shared types (local-only union extension).** packages/shared/src/types.ts: add `"work_day_scheduled"` to `ProjectActivityType`. A types-package edit but NOT a wire change — `ProjectActivity` never federates; note that at the union.
6. **EventNew prefill.** apps/web/src/pages/EventNew.tsx: read `?projectId=` via `useSearchParams`. When the project resolves from `useApp().projects` AND `isOrganizer(project, currentMember.publicKey)`: render a banner card above the form; seed `title` = "Work day — {project.title}", `description` = a one-line scaffold, `category` = `project.category` if it's in `ALL_CATEGORIES` else `"other"` (see open question 1). Never prefill `location`. On submit, call `scheduleProjectWorkDay` instead of `createEvent` only when the banner state is active. The §3 signing card renders unchanged.
7. **ProjectDetail card.** New `WorkDaysSection` in the main reading column (between `AnnouncementSection` and the tasks section): links via `useLiveQuery(() => listLinksForProject(project.id))`; events + cancellations from `useApp()` so the card inherits the blocked-organizer filtering AppContext already applies. Join, drop cancelled, drop past (reuse `entryIsPast` / `startOfTodayMs` from lib/calendar.ts so multi-day events still running stay visible), sort soonest-first, render rows linking to `/events/{id}`. Return `null` when empty. The "Schedule a work day" button renders in the section header gated by `isOrg && status !== "completed" && status !== "archived"` and navigates to `/events/new?projectId=${project.id}`.
8. **AppContext.** Add an `eventProjectLinks` live query + context field alongside `events`/`eventRsvps`/`eventCancellations` so Calendar can consume it. No block filtering on the rows themselves — consumers join against the already-filtered `events`.
9. **Calendar project filter picks up linked events.** apps/web/src/pages/Calendar.tsx: add `filteredEvents` — when `projectId` is set, narrow `events` to ids present in the link set for that project (today the filter shows the selected project's deadline plus *every* event, which is wrong once links exist); pass it to `buildCalendar` in place of raw `events`. `mine` / category filters deliberately keep today's no-op behavior for events — name that in a comment.
10. **EventDetail back-link (linking node only).** When `getLinkForEvent(eventId)` resolves and the project exists locally, render a "Work day for {title}" field linking to the project. Peers never have the row, so this renders nowhere else — which is itself the honest UI statement of the federation posture.
11. **i18n** — en + es keys (below).

### i18n
```json
"projects": {
  "workDays": {
    "heading": "Upcoming work days",
    "scheduleButton": "Schedule a work day",
    "itemAt": "at {{location}}",
    "localLinkHint": "Work days are community events connected to this project on this node only. Peer nodes see the event — never the project connection."
  },
  "activityType": { "work_day_scheduled": "Work day scheduled" }
},
"events": {
  "new": {
    "workDayBannerTitle": "Scheduling a work day for {{project}}",
    "workDayBannerBody": "This event will appear on the project page on this node. On peer nodes it appears as a regular community event — the project connection never federates. The title below is yours to edit before you sign.",
    "workDayTitlePrefill": "Work day — {{project}}",
    "workDayDescriptionPrefill": "A hands-on work session for {{project}}. Come for any part of it."
  },
  "detail": {
    "projectLinkLabel": "Project",
    "projectLinkLine": "Work day for {{project}}"
  }
}
```

### Test plan
- **apps/web/src/db/eventProjectLinks.test.ts** (new; mirror events.test.ts structure): `scheduleProjectWorkDay` rejects non-organizers; accepts organizer and co-organizer. Writes exactly one link row per event; second link attempt rejected/idempotent. **LOAD-BEARING:** `db.outbox.count()` across the full schedule flow increases by exactly 1 (the `"event"` enqueue from `createEvent`) and never by a link record. `work_day_scheduled` activity row written. Type-level negatives: `@ts-expect-error` `"event_project_link"` not assignable to `OutboxRow["kind"]`; no `enqueueEventProjectLink` in lib/outbox; no `pullFederatedEventProjectLinks` in lib/federationSync; `EventProjectLinkRow` has no `signature` and no `nodeId`.
- **ProjectDetail tests:** card absent with zero links (hidden-when-empty); upcoming links sorted soonest-first; a cancelled linked event does not render; past events drop; schedule button visible to organizer, hidden from non-organizer and on completed/archived projects.
- **EventNew tests:** `?projectId` prefills title/category/banner for the organizer; non-organizer with the same URL gets the plain form, and submit writes zero link rows; invalid/unknown projectId degrades silently to the plain form.
- **Calendar.test.tsx:** with the project filter set, event entries narrow to linked events only; with no filter, behavior unchanged; "Events only" chip composes with the project filter.
- **Regression locks unchanged:** density-excludes-events test, existing RSVP negative tests, migration smoke (fresh install + upgrade open cleanly).

### Open questions
1. **Category prefill for project-only categories.** `EventPayload.category` is free text on the wire, but EventNew's select is constrained to the 9 legacy categories. Mapping `infrastructure`/`organizing`/`mutual_aid_drive` → `"other"` is lossy; widening the select to `PROJECT_CATEGORY_META` is the alternative. EventDetail already tolerates unknown category strings. Recommend deciding at PR review; default to the lossy map for the smallest diff.
2. **Going-count on the work-days card.** §6.1 tier 1 permits showing counts to same-node non-attendees, so "3 going" would be values-legal. Deferred to keep the card lean; revisit on pilot signal.
3. **work_day_cancelled activity entry.** Phase 1 logs scheduling only; logging cancellation would couple `cancelEvent` (federated layer) to the links table. Leaning no for phase 1; name the asymmetry in the docs note.
4. **Unlink affordance.** Phase 1 ships none (cancel-and-recreate is the corrective path, consistent with §5 no-edits). If pilot organizers hit "right event, wrong project" often, a local-only unlink (delete row, log activity) is cheap and wire-safe.
5. **Per-surface useLiveQuery vs. AppContext for links.** Plan says AppContext (Calendar + ProjectDetail + EventDetail all consume); the fallback is page-local queries with the block-filter join done per surface.

## 11. Orphaned-project adoption
**Tier:** design-conversation — **Effort:** L

### Why
`handoffOrganizer` (apps/web/src/db/projects.ts:1014) requires `p.organizerKey === callerKey` — the sitting primary must act. `issueCoOrganizerInvitation` rejects any inviter who isn't the primary; `archiveProject`/`unarchiveProject` are primary-only. So when a primary disappears, co-organizers can run the project day-to-day (confirm, add tasks, pause/resume) and the auto-confirm sweep keeps credit flowing, but governance is frozen: no new co-organizers ever, no handoff, no archive. The roster can only shrink (step-down). This is graceful degradation toward a slow death — a long-term stewardship gap, not an emergency.

The proposal system was built for this: `Proposal.payload` is "intentionally schema-agnostic so future categories (recall, policy) can ride the same table" (packages/shared/src/types.ts:590-594). Adoption is the first such rider, and it is community-authority in its purest form: the community installing stewardship that no individual has the standing to grant.

### Values tension
- **community-authority vs. the absent member's standing.** "No admin role. Governance decisions go through community proposals, not individual power" — but the vanished primary is a member whose role is being moved without their signature. Every other role transition in this codebase is consent-ceremonied. Adoption is necessarily the exception: the one transition that happens *about* someone who isn't there. The design must compensate with structure: a long quiet-period precondition, a long notice window, an always-available one-tap cancel, and demotion-not-removal so the returning member keeps authority and a path back.
- **Consent for the adoptee.** "Nobody is conscripted" applies with equal force here. GOVERNANCE.md §4 already gives the native ceremony: "Interested members self-nominate for available roles. No one nominates someone else without that person's consent." The adoptee's consent is structural, not an extra signature flow: they must be the proposer.
- **Solidarity, not shame.** The vanished organizer is never framed as negligent. Capacity changes; people get hospitalized, evicted, burned out — exactly the people mutual aid exists for. All copy frames the project ("the community is keeping this project alive"), never the person. The cancel affordance is "I'm still here," not "justify your absence" — no reason field.
- **Deliberation over speed.** A role transfer over an absent person's head must not be winnable in the 3-day default window. A category floor (14 days, matching the invite/co-org-invitation horizon) is enforced in the execution function itself, so even an out-of-band "record outcome: passed" cannot shortcut the notice window.
- **Privacy.** The quiet period is measured only from `projectActivity` rows that already exist. We do not add read-tracking ("the organizer opened the app last week" is deliberately unknowable — no-read-receipts/no-activity-search posture), and we accept the resulting imprecision.

### Design

**1. Proposal category.** New `ProposalCategory` value `"project_adoption"`, riding `kind: "proposal"` (it stays out of the Disputes view). Payload type `ProjectAdoptionPayload` (JSON in `Proposal.payload`, following the `DisputePayload` snapshot discipline):

```
{ projectId, projectTitle, proposedPrimaryKey, sittingPrimaryKey, rationale, lastOrganizerActivityAt }
```

`sittingPrimaryKey` and `projectTitle` are file-time snapshots — they keep the record honest after the flip and let execution detect "stewardship changed since filing."

**Reversibility tier: `moderate`, fixed by the category** (not proposer-selectable — same precedent as disputes fixing `easy`). The shipped tier semantics are honest about *reversal mechanics* — adoption's reversal is a handoff back or a second adoption proposal: real effort, socially weighty, not rebuild-grade. **Impact reflection: not required.** The social weight is carried instead by mechanisms that actually protect the absent person: the quiet-period guard, the 14-day floor, the one-tap cancel, and a required free-text `rationale`.

**2. Eligibility guards (enforced at file time, re-checked at execution).**
- **Quiet period.** No `projectActivity` row with `actorKey === project.organizerKey` within `adoptionQuietDays` (new `NodeConfig` field, default **60**). Verified measurable: `logActivity` stamps `actorKey` on creation, pause/resume, complete, archive, task adds, confirmations, announcements, handoffs, invitations. Honest caveat, stated in code comment and doc: task *edits*, reorders, and dependency changes do **not** write activity rows, so the proxy can under-count a silently-active primary — mitigated by the notice item and the always-available cancel. 60 days ≈ 4x the `taskNeedsHelpDays` default; this is stewardship cadence, not emergency response; communities tune it via existing config machinery.
- **Adoptee consent = self-nomination.** `proposerKey === proposedPrimaryKey`, enforced in the db function. No separate signed-acceptance flow needed; the proposal *is* the acceptance, continuously revocable (the proposer can record "withdrawn" any time). Nobody can be voted into primary; they can only offer.
- **Adoptee need not be a current co-organizer** (deliberate divergence from `handoffOrganizer`): the worst orphan case — primary vanished, zero co-organizers — is exactly where adoption matters most. The UI sorts existing co-organizers first as natural candidates.
- **Hostile-takeover spine: the sitting primary can always cancel, two ways, neither requiring explanation.** (a) *Implicit — presence voids.* Any `projectActivity` row by the sitting primary dated after `proposal.createdAt` voids the proposal: execution refuses and closes it `withdrawn` with neutral copy. Solidarity-cleanest: doing anything counts as being here. (b) *Explicit — "I'm still here."* A one-tap affordance on the proposal card and the attention item, shown only to the sitting primary, closing the proposal `withdrawn`. Both ship; (a) is enforcement, (b) is the courtesy path (reading is correctly untracked, so a primary who returns and only looks would otherwise stay "quiet").
- **Notice surface.** The proposal in Decisions is the notice. Plus: a new pull-only `AttentionItem` kind `project_adoption_proposed`, computed only for the sitting primary, priority tier 1 (a decision is waiting on you). Plus a banner on the project page so anyone viewing it sees governance in motion. No push, no badge.
- **Misc guards:** project exists; `status !== "archived"` (completed projects ARE adoptable, solely so the new primary can archive); proposer is not the current primary (that's a handoff); at most one open adoption proposal per project. Deliberately no block-gate: adoption is not a two-party initiation; the community vote is the gate.

**3. Execution.** New db function `executeAdoptionProposal(proposalId, executorKey)` in a new file apps/web/src/db/adoption.ts. One Dexie transaction over `[proposals, projects, projectActivity]`:
1. Proposal exists, open, right category (closed → throw; idempotency boundary).
2. **Deliberation floor hard-enforced here:** `now - proposal.createdAt >= max(config.proposalDeliberationDays, 14) days` — regardless of path, including manual record-outcome. Out-of-band consensus is respected for the *decision* but cannot waive the absent person's notice window.
3. **Presence re-check:** any sitting-primary activity since `createdAt` → close `withdrawn` (neutral reason), leave the project untouched, return a "voided" result for a kind toast.
4. Project re-checks: exists; not archived; `organizerKey === payload.sittingPrimaryKey` (else throw "stewardship has changed since this was filed").
5. Flip: `organizerKey = proposedPrimaryKey`; demote the old primary into `coOrganizerKeys` — **demote, don't drop**, exactly mirroring `handoffOrganizer`'s shape. The returning member keeps working authority, can step down themselves, and can be handed primary back. [Known inherited divergence at the rows-derived read sites — disappears if plan 8 lands first.]
6. Log a **distinct activity type `"adopted_by_community"`** (not `organizer_handoff` — honest history: handoff means the primary chose; adoption means the community acted) with `actorKey = executorKey`, `data: { fromKey, toKey, proposalId }`.
7. Close the proposal `passed` (write the row directly inside the transaction).

**Who runs it: any member**, via the consensus banner (the existing "Close as passed" affordance becomes "Close as passed and hand on stewardship" for this category) and via the manual record-outcome → passed path, which the UI reroutes through `executeAdoptionProposal` so governance state and project state can never diverge. Honest note: like `closeProposal`, the data layer enforces no executor authority (local Dexie is device-writable anyway); guards protect against UI bugs and state divergence, not adversaries.

**4. Federation — traced end-to-end.** Projects do not federate: the server has no projects table (verified against apps/server/src/db.ts) and `OutboxRow.kind` has no project member. `organizerKey` lives only on the local Project row, alongside proposals and votes which are also node-local. **Adoption is therefore a local governance act in the same consistency domain as every other piece of project governance — no new wire records.**

Co-org invitation verification after the flip, verified at every hop: the "inviterKey must equal Project.organizerKey" rule is enforced **at issue time only**. The server route verifies only the self-signature against the embedded `inviterKey` (it has no project rows to check against). The PWA ingest does the same. `materializeAcceptedCoOrganizer` reads the local project row but never compares `inviterKey` to `organizerKey`. Consequences: (a) **past invitations** signed by the vanished primary verify forever; a still-pending one accepted after adoption still materializes, which is correct (it was a legitimate offer; the new primary can remove via `removeCoOrganizer` if needed); (b) **future invitations** by the adopted primary pass the issue-time check on their own node's flipped row and verify cleanly everywhere else. The CoOrganizerInvitationPayload doc comment should gain one sentence noting community adoption as a second legitimate way `organizerKey` changes. The absence of any signed record for the transition itself (shared with handoff and removal) is named in open questions, not papered over.

### Implementation steps
1. **Types** — packages/shared/src/types.ts: extend `ProposalCategory` with `"project_adoption"`; add `ProjectAdoptionPayload` next to `DisputePayload`; extend `ProjectActivityType` with `"adopted_by_community"`; add `NodeConfig.adoptionQuietDays` + `DEFAULT_NODE_CONFIG.adoptionQuietDays: 60`.
2. **Config plumbing** — apps/web/src/db/nodeConfig.ts: default-fill in `getNodeConfig`, validation (integer, >= 7). No Dexie version bump: `category` is already indexed (v9), payload is data not schema, and nodeConfig values are schemaless.
3. **Data layer** — new apps/web/src/db/adoption.ts: `lastOrganizerActivityAt(projectId, organizerKey)` over the `[projectId+createdAt]` index; `fileAdoptionProposal({ projectId, proposerKey, rationale, nodeId, now? })` with all guards, delegating to `createProposal` with `reversibilityTier: "moderate"`; `executeAdoptionProposal(proposalId, executorKey, now?)`; `withdrawAdoptionAsPresent(proposalId, callerKey)` (caller must equal `sittingPrimaryKey`).
4. **Deliberation floor** — apps/web/src/lib/autoCloseProposals.ts: export `ADOPTION_MIN_DELIBERATION_DAYS = 14`; `autoCloseEligibility` uses `max(config.proposalDeliberationDays, 14)` for this category.
5. **Attention item** — apps/web/src/lib/attention.ts: add `project_adoption_proposed` to the union, `KIND_PRIORITY: 1`, and `proposals?: readonly Proposal[]` to `AttentionInput`; compute for `currentMember === payload.sittingPrimaryKey` over open adoption proposals. Add the emoji in attentionMeta.ts. Render + "I'm still here" inline action in AttentionSection.tsx (`proposals` already in context).
6. **Filing UI** — ProjectDetail.tsx: new `AdoptionSection` (sibling of `HandoffSection`): visible to signed-in non-organizer members only when the quiet period is met; rationale textarea + explicit "I'm offering to take this on" framing → `fileAdoptionProposal`. Open-adoption banner on the project page linking to /proposals. ProposalNew.tsx stays config-only; filing lives where the context is.
7. **Decisions UI** — Proposals.tsx: `ProjectAdoptionPayloadView` block (project title, proposed steward name, quiet-since line, link to project); category chip; consensus banner button swaps to `executeAdoptionProposal` for this category; manual "Passed" close reroutes through it; "I'm still here" button when `currentMemberKey === sittingPrimaryKey`; "voided" toast path.
8. **History label** — en/es `projects.activityType.adopted_by_community`.
9. **Doc** — new docs/project-adoption.md design note (values + federation-verification analysis above), cross-linked from docs/co-organizer-invitations.md §5 and the `isOrganizer` comment block.

### i18n
```json
"proposals.category.project_adoption": "Project stewardship",
"adoption.section.title": "Community stewardship",
"adoption.section.intro": "This project's organizer hasn't been active here in a while. The community can keep it alive by agreeing on a new primary organizer. Offering means taking on what the organizer role carries — invitations, archiving, handoffs.",
"adoption.section.rationaleLabel": "Why you're offering",
"adoption.section.rationalePlaceholder": "What's your connection to this project, and what would you keep going?",
"adoption.section.submit": "Offer to take this on",
"adoption.section.notice": "Your offer opens a community proposal. It stays open at least {{days}} days, and closes quietly if the current organizer is active again.",
"adoption.card.proposedSteward": "Offering to organize: {{name}}",
"adoption.card.quietSince": "No organizer activity on this project since {{when}}.",
"adoption.card.voidNote": "If the current organizer is active again before this closes, it closes without effect — no questions asked.",
"adoption.card.execute": "Close as passed and hand on stewardship",
"adoption.card.executing": "Handing on…",
"adoption.card.imHere": "I'm still here",
"adoption.card.imHereHint": "One tap closes this proposal. No explanation needed.",
"adoption.toast.filed": "Your offer is open for the community to weigh in.",
"adoption.toast.executed": "Stewardship handed on. The previous organizer stays on as co-organizer.",
"adoption.toast.voided": "The organizer has been active again, so this closed without effect.",
"adoption.attention.title": "The community is looking after \"{{projectTitle}}\"",
"adoption.attention.body": "A proposal is open to add a new primary organizer while you're away. If you're around, one tap closes it.",
"adoption.closedReason.presence": "Closed without effect — the organizer is active again.",
"projects.activityType.adopted_by_community": "Stewardship handed on by community decision",
"projects.adoptionBanner": "The community is deciding on new stewardship for this project."
```
Copy guardrails honored throughout: project-framed ("keeping it alive", "while you're away"), never "abandoned"; the cancel carries "no explanation needed."

### Test plan
- **db/adoption.test.ts**: file-time guards — recent organizer activity rejects; exact quiet-boundary; archived rejects; primary self-file rejects; non-proposer-adoptee rejects; second open proposal rejects. Execute — flips `organizerKey`, demotes old primary, removes adoptee from `coOrganizerKeys`, writes `adopted_by_community`, closes `passed`; refuses before the 14-day floor even when manually invoked; refuses when stewardship changed; voids when sitting-primary activity exists after `createdAt`; second execute throws "already closed."
- **autoCloseProposals.test.ts**: adoption uses `max(config, 14)`; other categories unchanged.
- **attention.test.ts**: item computed only for the sitting primary; absent once closed; tier-1 ordering.
- **coorgInvitations.test.ts additions** (federation truth): after an executed adoption, the new primary's `issueCoOrganizerInvitation` succeeds and the old primary's throws `not_primary_organizer`; a pre-adoption pending invitation accepted post-adoption still materializes.
- **Proposals.tsx / ProjectDetail.tsx component tests**: adoption card rendering, execute affordance label, "I'm still here" visibility scoping, AdoptionSection gating (hidden for the primary; hidden while quiet period unmet).

### Open questions
1. **Affirm floor.** Is `proposalMinAffirms` (default 2) heavy enough to install an organizer, or does adoption deserve its own `adoptionMinAffirms`? 2 affirms for a role transfer feels thin. Pilot question.
2. **Quiet-period default.** 60 days is a reasoned guess; only pilot communities can say whether it reads as patient or as a loophole. Related: should presence ever be measurable beyond action logs? Current answer is no (reads are untracked) — the community should ratify that trade-off explicitly.
3. **Repeated filings.** A primary who taps "I'm still here" but stays otherwise quiet can face a new proposal after the next quiet period. Pestering risk: governance norm, or technical cooldown after a withdrawal-by-presence?
4. **Signed role-transition records.** Adoption — like handoff and removal — leaves no signed record. Should a future workstream give all three transitions signed records so primary provenance verifies end-to-end on federated audit (ties into plan 8's open question 1)?
5. **Completed-project adoption.** Allowed solely so an orphaned completed project can eventually be archived. Worth the surface, or should completed orphans simply rest unarchived?

## 12. Clone offers co-organizer re-invitations
**Tier:** design-conversation — **Effort:** S

### Why
`cloneProject` (apps/web/src/db/projects.ts:1456) starts every clone with `coOrganizerKeys: []` (line 1476). For recurring efforts (the whole point of cloning), the organizer must rebuild the trusted crew by hand. The ethos-clean fix was identified when unilateral `addCoOrganizer` was removed: never copy the roster — *re-issue invitations*. docs/co-organizer-invitations.md §3 is explicit that the role becomes effective only on a signed acceptance, and §2 that "signed records imputed to a member should always trace back to that member's deliberate act." A clone is a new trust context (new debits to sign as the helped party), so consent must be re-performed, not inherited.

Verified mechanics: the clone UI lives in `OrganizerControls` (ProjectDetail.tsx:678, form at 785-823), rendered only when `isOrganizer` is true — so primary *or* co-organizer may clone, and the cloner becomes the clone's `organizerKey`. `issueCoOrganizerInvitation` requires inviter == the project's primary — satisfied, since we invite against the *clone*. Its other guards already do the work: self-invite rejection, mutual-block rejection with the generic `BLOCKED_ACTION_MESSAGE`, 14-day TTL, secret-key/pubkey match. Invitations enqueue as the existing `coorg_invitation` outbox kind — each re-invitation is a normal signed record, nothing new on the wire.

### Values tension
- **Consent theater vs. consent.** The danger isn't copying the roster (already rejected); it's making re-invitation feel so automatic that acceptance becomes a reflex. The invitee's ceremony is fully preserved (signed accept, 14-day window, decline is terminal and neutral). The honest tension is on the *cloner's* side: a **pre-checked** checklist defaults to re-conscripting the old crew's inboxes. Pre-checked optimizes for continuity of a working relationship; unchecked makes each invitation a deliberate act. The parked spec chose pre-checked; the send is still an explicit button press, and each invitation is individually uncheckable. Recommend keeping pre-checked but recording the dissent.
- **solidarity-not-shame.** A former co-organizer who declines the re-invite must not read as defecting. Declines already land under "Past invitations" with the neutral outcome vocabulary; the new flow must add no "didn't rejoin" surface, no count of who hasn't answered.
- **Block fingerprinting.** Pre-filtering the checklist through `isMutuallyBlocked` would *reveal blocks* to the cloner (a missing name is a fingerprint). docs/blocking.md §6.1 generic-error discipline, already followed by the single-invite path: the checklist must list all source organizers (minus self) and let the send fail quietly per-person.
- **deliberation-over-speed.** No auto-send at clone time, no expiring "act now" framing beyond the standard TTL; the clone is in `planning`, nobody is rushed, and skipping the checklist leaves the standing `CoOrganizerSection` affordance on the clone page with no later nag.
- **no-notifications.** The invitee learns exactly as they do today: the `coorganizer_invitation_received` attention item on next open/sync. Nothing new.

### Options considered
1. **Copy `coOrganizerKeys` into the clone** — rejected outright; recreates the unilateral-grant bug the invitation system was built to kill (and `materializeAcceptedCoOrganizer` would have no audit rows backing the entries).
2. **Auto-issue invitations on clone, no checklist** — preserves invitee consent but removes the cloner's deliberation, and breaks on locked sessions mid-flow. Rejected.
3. **Post-clone one-time "re-invite the crew?" card on the clone page** — adds a second one-time-persistence mechanism for marginal benefit. Rejected.
4. **Pre-checked checklist inside the existing inline clone form, invitations issued immediately after `cloneProject` succeeds** — matches the parked spec, one deliberate moment, graceful degradation to the existing `CoOrganizerSection`. Chosen.

### Recommendation
Extend the inline clone form: when the source project has candidate organizers (source `coOrganizerKeys` — the live authority list — plus the source *primary* when a co-organizer is the cloner, minus the cloner), render a pre-checked checklist with copy that names the consent model ("fresh invitations; each person decides again; nothing carries over"). On submit: if anything is checked and `lockState === "locked"`, toast the existing `projects.coOrganizers.invite.locked` message and stop (no half-done state); otherwise clone, then issue one normal signed invitation per checked key, log `coorganizer_invited` activity on the clone, toast an aggregate result, navigate to the clone.

### Implementation steps
1. **Optional thin helper** in apps/web/src/db/coorgInvitations.ts: `issueInvitationsForClone({ projectId, inviterKey, inviterSecretKey, inviteeKeys, nodeId }): Promise<{ sent: string[]; failed: string[] }>` — a per-key try/catch loop over `issueCoOrganizerInvitation` (no new guards, no new record shapes; failures collected, never re-thrown so one blocked pair can't abort the rest). Keeps the UI thin and gives fake-indexeddb tests a direct seam.
2. **OrganizerControls** (ProjectDetail.tsx:678-846): pull `lockState` and `members` from `useApp()`. Compute `candidates = dedupe([project.organizerKey, ...project.coOrganizerKeys]).filter(k => k !== currentMember.publicKey)` from the *source* project. Add `checkedKeys` state initialized to all candidates when `showCloneForm` opens. Render the checklist between the title input and submit (labels via member map, `shortKey` fallback; tag the source primary with a neutral "organized the original" chip).
3. **Submit handler**: guard `checkedKeys.size > 0 && lockState === "locked"` → locked toast and return. Else `cloneProject(...)`; `getSecretKey(currentMember.publicKey)` once; call the helper; `logActivity(clone.id, "coorganizer_invited", ...)` per sent key; toast `sentToast`/`partialToast`; navigate to the clone where pending invitations are visible in `CoOrganizerSection`.
4. **No schema changes, no new outbox kinds, no server changes.**
5. **i18n** under `projects.clone.reinvite.*`.
6. Leave `cloneProject`'s missing db-layer authority gate as-is but note it in the PR (UI-gated only today; tightening it is a separate, behavior-visible change).

### i18n (proposed en keys + draft copy)
Under `projects.clone.reinvite`:
- `title`: "Invite co-organizers again?"
- `intro`: "The original project had co-organizers. Fresh invitations go out for this new project — each person decides again. Nothing carries over automatically, and invitations expire after 14 days."
- `candidateAria`: "Invite {{name}} to co-organize the new project"
- `sourcePrimaryChip`: "organized the original"
- `skipHint`: "Uncheck anyone you'd rather not invite right now — you can always invite people later from the project page."
- `sentToast_one`: "Clone created — {{count}} invitation sent."
- `sentToast_other`: "Clone created — {{count}} invitations sent."
- `partialToast`: "Clone created. Some invitations couldn't be sent — you can invite people from the new project page." (deliberately cause-free, per blocking §6.1)

Locked case reuses existing `projects.coOrganizers.invite.locked`. es drafts mirror structure; parity test enforces completeness.

### Test plan
- **db layer** (extend coorgInvitations.test.ts): helper issues N rows with the *clone's* `projectId`, inviter = cloner, `expiresAt = createdAt + 14d`; a mutually-blocked invitee lands in `failed` while others land in `sent`; invitee == clone primary is rejected by the existing guard (and skipped by candidate math).
- **UI** (new ProjectDetail.cloneReinvite.test.tsx): primary clones a source with two co-orgs → checklist pre-checked, self absent; uncheck one → exactly one invitation row for the clone id; co-organizer clones → source primary listed with the neutral chip; locked session with boxes checked → locked toast, no clone row written; source with no co-organizers → form renders exactly as today; `coorganizer_invited` activity rows logged on the clone.
- **Negative/values assertions**: candidate list derives only from `organizerKey`/`coOrganizerKeys` (no block-table read in the render path); failure copy identical regardless of cause.

### Open questions
- Pre-checked vs. unchecked default — recommend pre-checked per the parked spec, but this is the one genuinely contestable values call; decide in the conversation, not in code review.
- On partial failure the clone still exists (recommended; pending list is visible on the clone page) — confirm the community prefers that over all-or-nothing.
- Should declining the *source* project's invitation ever suppress a clone re-invite? (Current answer: no — decliners were never in `coOrganizerKeys`, so they're structurally absent; re-inviting a past decliner stays a manual act.)
- Add a db-layer organizer gate to `cloneProject` while in the area, or keep scope tight?

---

*Produced 2026-06-12 by a planning pass over the post-#240 tree; one
plan per section, each verified against the code it cites. Line
numbers will drift — symbols are the anchors. Decisions recorded here
become real only through the community's process.*
