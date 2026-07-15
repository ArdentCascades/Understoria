# The Commons — projects that graduate into things the community tends

> **Status: DRAFT — for review. Nothing in this document is
> implemented.** It records a design conversation with the operator
> (2026-07): what happens to a project that *builds something
> lasting* — a tool library, a community garden, a phone tree — after
> its last build task completes. Sibling to
> `community-stability.md` (also in review); this document stands
> alone and is deliberately NOT coupled to that draft's checklist
> (operator decision). Decisions already made by the operator are
> marked **settled**; everything else is open (§9).

---

## 1. The hole in the model

Projects today end one of two ways: `completed` (with a genuinely
lovely completion moment — see §2) or `archived`. Both are
terminal. But many templates don't just organize *work*, they build
*things that keep existing*: the tool library still lends, the
garden still grows, the communication tree still needs its quarterly
test call. The data model currently forgets this — the project falls
off the active lists and the standing thing it built has no
representation, no care loop, and no shelf a newcomer can browse to
answer "what does this community actually *have*?"

The gap is sharpest in one already-shipped mechanism: **recurring
tasks already exist and already respawn.** A template task can carry
`recurringCadence`; when a recurring task's completion is confirmed,
`apps/web/src/db/projects.ts` spawns a fresh open copy — but only
while `project.status === "active"`. So a tool library that wants
its monthly inventory check alive forever must stay "active"
forever: it clutters the being-built view, never gets its "we
finished!" moment, and reads as a project that can't finish rather
than a thing being tended.

**Graduation names the missing state.** A project can move from
"work to finish" to "a thing we tend": the **Commons**.

## 2. What already exists (verified, and reused wholesale)

Everything below is shipped machinery this design rides rather than
duplicates:

- `ProjectStatus` union: `planning | active | paused | completed |
  archived` (`packages/shared/src/types.ts`). Projects carry
  `templateId`, `pauseNote`/`pausedAt` (the note-on-transition
  pattern), and `completedAt`.
- **Recurring-task respawn** on confirm, gated on `active`
  (`db/projects.ts`, both member-confirm and auto-confirm paths).
- **The completion moment**: `lib/projectClosure.ts` computes
  contributor count + hours moved from the signed exchange ledger,
  aggregate-only by construction; ProjectDetail renders the
  celebration banner and an organizer announcement nudge.
- **Lifecycle verbs in the kebab** (OverflowMenu): Mark complete /
  Resume / Archive / Unarchive.
- **The archive**: `/projects/archive` lists `completed | archived`
  projects, newest completion first.
- **Board tab routing**: projects live at `?tab=projects`; tab state
  is URL-carried and deep-linkable.
- **Stewardship machinery**: organizer + co-organizers, signed
  co-organizer invitations/responses/revocations, and the
  project-adoption proposal path for orphaned projects.
- **Event ⇄ project links** (`EventProjectLinkRow`): work days on
  the calendar, status-agnostic — they keep working for a tended
  commons with zero changes.
- **Federation**: project/task state replicates between mirrors as
  signed whole-row LWW records (`stableStringify`), which tolerates
  new fields and new status values without breaking signatures; and
  participation kinds **never cross the peer wire** — a community's
  commons are its own business, structurally.
- **Print surfaces** (flyers, field guide, offline kit): the pattern
  a "how to use this" sheet follows.
- The **completion-moment credit path**: a respawned care task flows
  through the same claim → complete → confirm → exchange cycle as
  any task. **Settled:** maintenance work earns credit identically
  to build work — care work is work; that is practically the thesis
  of the app.

## 3. Mechanism (not a new object — **settled**)

A commons is a `Project` in a new state, not a new kind:

- Two new `ProjectStatus` values: **`tended`** (a living commons)
  and **`retired`** (a commons that ended; §7).
- Transitions:
  - `active → tended`: the graduation choice at the completion
    moment (§4). `completedAt` is stamped either way — it remains
    "when we finished building."
  - `completed → tended`: the retrofit hatch (kebab item), for
    projects that finished before this feature existed.
  - `tended → active`: "Return to building" (mistake hatch, or an
    honest major rebuild).
  - `tended → retired` (with a note) and `retired → tended`
    (un-retire; the garden that gets its lot back — §7).
- The respawn gate widens by one status: recurring tasks respawn
  while status is `active` **or `tended`**. This is the single most
  load-bearing line of the whole feature.
- New optional fields on `Project` (whole-row LWW signing tolerates
  them):
  - `resourceLinks?: { label: string; url: string }[]` — §5.2;
  - `careNotes?: string` — §5.3;
  - `retiredAt?: number | null`, `retireNote?: string | null` —
    the `pausedAt`/`pauseNote` pattern, reused for §7.
- Stewards are **copy, not mechanism**: when status is `tended`, the
  UI says "stewards" where it said "organizer / co-organizers." The
  invitation, revocation, and adoption-proposal machinery is
  untouched — an orphaned commons is rescued exactly like an
  orphaned project.
- Templates gain an optional facet, `builds: "commons"`, so the
  graduation dialog knows when to lead with the Commons option
  (§4). Same facet mechanism the stability draft proposes for
  `resilience` tagging — one template-metadata addition serves both.

## 4. UI — the graduation moment

Graduation is **the organizer's choice** (**settled**), made at the
moment the app already owns: Mark complete. The confirm dialog
becomes a two-option choice:

- **"Complete and close"** — the park-cleanup path; status
  `completed`, exactly today's behavior.
- **"Move to the Commons"** — one plain sentence of explanation
  ("This built something the community will keep using — keep it
  alive with a care rota"); status `tended`.

Ordering: if the project has recurring tasks or its template says
`builds: "commons"`, the Commons option leads; otherwise it trails.
Choosing Commons keeps the celebration — same banner, same
aggregates, closing line *"…now tended by the community"* — followed
by a small, skippable setup sheet: confirm stewards (prefilled with
the organizers), glance over the care rota (the recurring tasks and
their cadences), optionally paste a first resource link. Graduation
must never feel like a form.

The kebab on a `completed` project gains **"Move to the Commons"**
so pre-feature projects can graduate late.

## 5. UI — living in the Commons

### 5.1 The shelf is a scope, not a new tab

The Board's projects tab gets a scope toggle — **"Being built /
Tended"** — in the existing filter-chip pattern, URL-carried
(`?tab=projects&scope=tended`) and deep-linkable. A commons IS a
project; navigation says so. One Dashboard doorway card ("What we
tend — 3 commons · next care day Saturday") joins the existing
doorway family. No new nav entries.

### 5.2 Commons cards drop the progress bar

The single most important visual rule: **a progress bar says "this
ends," and a tended thing doesn't.** A commons card shows: title (a
small living-thing glyph), steward avatars, a **"next care"** line
(the soonest open recurring task and its cadence), and — only when
flagged — an amber "needs attention" chip. Amber like the
pause-note treatment, never red, and never "overdue by N days":
care is invited, not demanded (`solidarity-not-shame`).

### 5.3 ProjectDetail in tended dressing (same route, same page)

When `status === "tended"` the detail page re-orders:

1. **Header** — "Tended commons" chip (canopy palette, the trusted
   family, not completed-gray); "Stewards" wording; and the
   provenance line as a quiet permanent subtitle: *"Built by 9
   people · 118 hours · finished March 2027"* (the closure
   aggregates, demoted from banner to biography).
2. **Resources** — the operator's spreadsheet insight
   (**settled** that outside links are wanted): labeled external
   links ("Inventory sheet ↗", "Borrow signup ↗", "Map ↗") rendered
   as **plain outbound anchors only — never fetched, never
   embedded** — so no outside service gets to observe the community
   through the app. One honest hint line under the add-form:
   outside tools live outside Understoria's privacy model (the
   mirror-consent register, one line, not a scary dialog). Nothing
   about this block is graduation-specific; it may ship for active
   projects too.

   **Who can add links (settled, 2026-07):** stewards edit
   directly; everyone else suggests; a steward accepts before
   anything renders as a resource.

   - **Stewards** (organizer + co-organizers) add / edit / remove
     directly, every change written to the existing activity log —
     a removal is never silent, which keeps the politics of
     curation honest.
   - **Any member** gets a "Suggest a resource" affordance. The
     suggestion is attributed ("suggested by Rosa") and waits for a
     one-tap steward accept — ideally right from the attention rail
     — at which point the steward's device signs the updated
     project row and the log records both who suggested and who
     accepted.
   - **The task-completion moment carries the doorway.** The person
     who completed a task is usually the one holding the artifact
     (they made the inventory sheet, they drew the map), so marking
     a task complete offers a small optional prompt — *"Did this
     produce something worth keeping? Suggest it as a resource"* —
     prefilled with which task it came from. The
     completer-contributes insight is delivered as *context*, not
     as an earned quota: an earlier "one link slot per completed
     task" idea was considered and dropped (quota bookkeeping is
     gamification-adjacent, the slot count doesn't map to the
     actual need, and it changes nothing mechanically — see below).
   - **Spam guard:** a small cap (2–3) on outstanding unaccepted
     suggestions per member; invisible rationing for the
     pathological case only.

   Two facts force this shape rather than "non-stewards add
   directly, stewards can remove." *Mechanically*, project rows
   federate as whole-row records signed by organizer authority — a
   completer's device cannot produce a valid signed row containing
   their link, so any direct-add UI would secretly be
   suggestion-shaped underneath; this design is the honest version.
   *For safety*, an outbound URL wearing the community's trust
   ("Borrow signup ↗") is the app's most effective phishing shape —
   accept-before-render closes the window that add-then-remove
   leaves open.
3. **Care rota** — the open recurring tasks with cadence labels
   ("monthly"), claim buttons unchanged. This is the existing task
   list, filtered and renamed.
4. **Care notes** — a steward-editable text block ("how to open the
   library, where the watering rota lives"), separate from the
   original description, which remains the build story. With a
   "Print the how-to sheet" button following the print-surface
   pattern (a one-pager for the physical site).
5. **"How this was built"** — the full original task list, activity
   log, and announcements folded into a collapsed disclosure.
   History browsable, never deleted, never in the way.

Kebab in tended state: **Retire** (§7), **Return to building**,
steward management (existing co-organizer items).

### 5.4 "Something needs attention" — for everyone

One button on the tended view, visible to all members: a steward
gets "add a care task" (one-off, non-recurring); anyone else gets
the post composer prefilled as a need linked to the commons ("Tool
library: gate latch broken") — the event⇄need bridge shape, reused.
This is what keeps a tended thing from silently rotting between
scheduled care cycles. *(Phase 3 option: an attention-rail item for
stewards when a flag lands — a new attention kind, so it can wait.)*

### 5.5 In my care / Organizer's desk

Claimed care tasks already appear in "In my care." Additions: a
"Commons you steward" line beside "Projects you organize," and
(optional) the Organizer's Desk listing unclaimed care tasks as
gaps.

## 6. Credit (**settled**)

Maintenance tasks earn credit exactly like build tasks — mechanically
they already do (the respawned copy travels the same
claim → complete → confirm → exchange path). This document just
commits to never special-casing it downward. Care work is work.

## 7. Retirement — where retired go

Retired commons go to **the archive** (`/projects/archive`), the
community's memory shelf, whose filter widens from
`completed | archived` to include `retired`. Retirement gets its own
status because the stories differ and the archive should tell them
honestly:

- completed: *"Built by 9 people · 118 hours · finished March 2027."*
- retired: *"Built by 9 people · tended for 2 years · retired May
  2029 — 'the lot was sold.'"*

The Retire dialog asks for that one sentence (`retireNote` — the
pause-note pattern), because *why it ended* is exactly what the
community will want to remember, and what a future group reviving
the idea will want to know. Everything stays browsable on the detail
page in retired dressing: provenance, care notes, resource links
(grayed — the spreadsheet may be dead too), the full build-and-care
history. Nothing is deleted; retirement is a state, not a shredder.

Two boundaries keep it clean: retired commons **leave the living
surfaces** (no card in either Board scope, no Dashboard count, and
no respawn — the gate checks for `tended`, so this falls out for
free), and the kebab offers **un-retire** (`retired → tended`) for
the garden that gets its lot back — a story worth designing for.

## 8. Negative-space commitments

The lines this feature must not cross, each extending an existing
project commitment:

1. **The app records who *tends* the commons, never who *uses*
   it.** No borrower ledgers, no "who took food," no usage counts. A
   consumption record is a surveillance record of need, and it must
   not sit in a signed, replicated dataset. The external
   spreadsheet holds the *stuff*; the app holds the *care*.
   (Extends: minimal data surface, `threat-model.md`.)
2. **No progress bar, percentage, or completion framing on a tended
   commons.** Tending has no end state to measure against.
3. **No overdue shaming.** Care due is an amber invitation, never a
   red debt; no "overdue by N days." (Extends:
   `solidarity-not-shame`.)
4. **No commons health score, no ranking of commons, no per-member
   tallies on the shelf.** Provenance stays aggregate-only
   (contributor count + hours — the `projectClosure.ts` discipline).
   (Extends: `no-leaderboards`.)
5. **Resource links are plain outbound anchors — never fetched,
   embedded, or previewed** by the app, so outside services can't
   observe the community through it; and adding one shows the
   outside-privacy hint. (Extends: the informed-consent register.)
6. **Money and inventory stay in outside tools.** The Commons never
   becomes a stock ledger or a fund balance. (Extends:
   `community-stability.md` §7.5; time credits are the only ledger.)
7. **Commons stay community-internal.** Participation kinds never
   cross the peer wire; nothing here changes that. No federated
   commons directory.
8. **History is never deleted.** Graduation, retirement, and
   un-retirement are status transitions over an intact record.
9. **No coupling to the stability checklist**
   (`community-stability.md`) — operator decision; the Commons
   stands alone.

## 9. Open questions for review

1. **Spanish naming** for "Commons" / "Tended" ("los comunes"?
   "bienes comunes"? "en cuidado"?) — needs the same care as the
   "In my care" rename.
2. **Edit authority on resource links — RESOLVED (2026-07):**
   stewards edit directly (logged); any member suggests; a steward
   accepts before a link renders (§5.2). One sub-question stays
   open: are *pending* suggestions visible to all members with a
   "pending" chip (transparent, but gives an unvetted URL screen
   presence even unlinked) or **visible only to stewards until
   accepted** (safer — the current lean)? Care-notes edit authority
   is still open; the steward-direct + member-suggest shape likely
   transfers, but notes are lower-risk than URLs and could bear the
   wiki-style answer.
3. **Resource links on active projects too?** §5.2 argues yes;
   confirms scope of phase 2.
4. **The Dashboard doorway card** — wanted, or clutter? (Cheap
   either way.)
5. **"Needs attention" shape** for non-stewards: prefilled need
   post (proposed) vs. directly opening a task — the post keeps the
   existing authority model intact.
6. **Retired links** — grayed (proposed) or hidden?
7. **Graduation announcement**: should choosing the Commons offer
   the same announcement nudge the completion moment has ("tell the
   community what you built")? (Probably yes — cheap and joyful.)

## 10. Build order *(suggested)*

- **Phase 1 — the concept becomes real:** `tended`/`retired`
  statuses + transitions, the graduation choice in the Mark-complete
  dialog, the respawn-gate widening, the Board scope toggle, the
  tended header/provenance/care-rota ordering, archive inclusion,
  retrofit kebab item. i18n en/es throughout.
- **Phase 2 — lovable:** resource links (+ hint line), care notes,
  the print how-to sheet, Dashboard doorway.
- **Phase 3 — woven in:** needs-attention bridge, steward attention
  item, In-my-care line, desk gaps.
