# The Commons — projects that graduate into things the community tends

> **Status: Phase 1 IMPLEMENTED (2026-07); Phases 2–3 pending.**
> Shipped: the `tended`/`retired` statuses and every §3 transition,
> the graduation choice in the Mark-complete dialog (+ the retrofit
> kebab item), the widened respawn/claim gates, the Board
> "Being built / Tended" scope, the tended detail dressing (chip,
> provenance subtitle, care-rota heading + ordering, no progress
> bar), the graduation-flavored completion moment (id+flavor key,
> orientation copy, tended announcement placeholder), retirement
> with the why-it-ended note into the archive, and un-retire /
> return-to-building. Still pending: resource links + care notes +
> print sheet + Dashboard doorway (Phase 2), the needs-attention
> bridge + steward attention item (Phase 3), and the §9 Spanish
> naming review (the shipped es strings are provisional:
> "bienes comunes" / "en cuidado").
>
> This document records the design conversation with the operator
> (2026-07): what happens to a project that *builds something
> lasting* — a tool library, a community garden, a phone tree — after
> its last build task completes. Sibling to
> `community-stability.md` (in review); this document stands
> alone and is deliberately NOT coupled to that draft's checklist
> (operator decision). Decisions made by the operator are marked
> **settled**.

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

**The graduation announcement nudge (settled, 2026-07):** the
existing completion moment already gives the organizer a nudge into
the announcement box ("thanks spoken in the commons over a
system-generated badge"). Graduation keeps the same card and the
same button, re-aimed from *gratitude* to *orientation*: "tell the
community what this is, where it lives, and how to use it." A
graduated commons needs this MORE than a completed project does — a
completed project's story is over, but a commons' story is starting,
and this is the exact moment the community learns the thing exists;
the nudge converts builders' knowledge into community knowledge
before it evaporates into "ask Rosa, she knows." Every existing
discipline holds: organizer-only, one pop per device, silent (the
moment waits to be seen). Two implementation details decided with
it: the one-time guard keys on **id + flavor** (not id alone), so a
project that completed months ago and graduates late via the
retrofit kebab item still gets its one graduation moment — the path
real communities will use most in year one; and the announcement box
suggests what to cover (what it is / where / how to use it / who to
ask) as **placeholder text, never prefill** — it must arrive in the
organizer's own voice.

The kebab on a `completed` project gains **"Move to the Commons"**
so pre-feature projects can graduate late.

## 5. UI — living in the Commons

### 5.1 The shelf is a scope, not a new tab

The Board's projects tab gets a scope toggle — **"Being built /
Tended"** — in the existing filter-chip pattern, URL-carried
(`?tab=projects&scope=tended`) and deep-linkable. A commons IS a
project; navigation says so. No new nav entries.

**Dashboard doorway (settled, 2026-07): the humble version only.**
One quiet line in the "community as a whole" cluster — *"The
community tends 3 commons"* — linking to the Tended scope, hidden
entirely at zero (the Coming-up rule: a community that never
graduates a project never sees a pixel of it). Deliberately count +
link and nothing more, the proposals-doorway shape: no "next care"
enrichment, because actionability already has owners — open care
tasks belong to "Where hands are welcome" and care work days belong
to "Coming up," and a Commons card repeating them would be the
Dashboard disagreeing with itself.

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
   - **Pending suggestions are visible to everyone — but never as a
     link (settled, 2026-07).** Transparency and safety separate
     cleanly here: the danger was never the community *knowing*
     about a proposed URL, it was the app rendering an unvetted URL
     as a tappable anchor wearing the community's trust. So a
     pending suggestion renders in the Resources block for all
     members as a visibly-distinct row — label, suggester, an amber
     "pending steward review" chip — with the URL shown as plain
     non-clickable text. Only a steward's accept turns it into an
     anchor. Transparency cuts both ways: a steward's **decline is
     activity-logged just like a removal**, so suggestions can't be
     silently buried any more than links can be silently deleted —
     the whole curation process happens in the open.
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
4. **Care notes** — a text block ("how to open the library, where
   the watering rota lives"), separate from the original
   description, which remains the build story. With a "Print the
   how-to sheet" button following the print-surface pattern (a
   one-pager for the physical site).

   **Edit authority (settled, 2026-07): the links shape, reused
   verbatim.** Stewards edit directly, activity-logged; any member
   can suggest an addition or correction, attributed and visible to
   everyone as a pending suggestion; a steward accept writes it into
   the notes (their device signs the row — the same mechanical
   reason as links: project rows carry organizer authority);
   declines are logged like removals, so curation happens in the
   open. One authority model for everything members contribute to a
   commons — links and notes alike — is one model to implement, one
   to test, and one to explain.
5. **"How this was built"** — the full original task list, activity
   log, and announcements folded into a collapsed disclosure.
   History browsable, never deleted, never in the way.

Kebab in tended state: **Retire** (§7), **Return to building**,
steward management (existing co-organizer items).

### 5.4 "Something needs attention" — for everyone *(settled, 2026-07: Option A)*

One button on the tended view, visible to all members. This is what
keeps a tended thing from silently rotting between scheduled care
cycles. Resolved shape:

- **A non-steward's tap opens the Board composer as a NEED**, title
  prefilled ("Tool library: …"), plus a **local-only link row**
  tying the post to the commons. Precision on lineage: this is the
  third member of the link-row family whose shipped parent is the
  event⇄project work-day link (`EventProjectLinkRow` — local-only,
  zero wire bytes); the event⇄need bridge
  (`docs/event-need-bridge.md`) is the *proposed* sibling, not
  shipped code, so the commons link composes with that family
  rather than reusing a bridge that doesn't exist yet.
- **Why a need post and not a flag/task:** non-stewards mechanically
  cannot write tasks (`addProjectTask` requires organizer
  authority, like every project-row write); a Board need makes the
  report belong to the *whole community* rather than a steward
  inbox — anyone can claim and fix the gate latch, possibly before
  a steward reads it; the fixer's credit falls out of the existing
  need → claim → confirm → exchange path with zero new machinery
  (the rota handles *recurring* care; one-off breakage is exactly
  what the Board exists for); and blocking, moderation,
  attribution, and federation posture are all inherited from posts.
- **The indirection dissolves via the link row:** the tended page's
  amber "needs attention" chip DERIVES from open linked needs, and
  the page lists them ("1 open need — gate latch broken ↗"). One
  record, visible on both surfaces; the chip clears itself when the
  linked need completes.
- **A steward's tap offers both affordances**: add a one-off care
  task to the rota (they hold the authority), or post a linked need
  themselves when the fix wants community hands.
- **No anonymous flagging.** Reports are signed and attributed like
  every post — consistent with the transparency decisions elsewhere
  in this draft, and the app has no anonymous vocabulary anywhere.
- *Implementation footnote:* `addProjectTask` currently throws for
  `completed`/`archived` projects; Phase 1 must allow `tended` and
  refuse `retired`.

*(Phase 3 option: an attention-rail item for stewards when a linked
need lands — a new attention kind, so it can wait.)*

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
(de-anchored — next paragraph), the full build-and-care history.
Nothing is deleted; retirement is a state, not a shredder.

**Retired resource links are de-anchored (settled, 2026-07): shown
as muted plain text — label and URL visible, nothing tappable.**
This WILL annoy people, so the reasoning gets stated in full, here
and in the UI:

- Link rot is an attack surface, not just an inconvenience. A
  retired page can sit in the archive for years with nobody
  maintaining the destinations its links point at — and dead
  destinations don't stay neutral: free-tier pages get recycled,
  shortener slugs get reissued, and lapsed domains get
  re-registered, sometimes deliberately by people who buy expired
  domains *because* old links still point at them. A tappable
  anchor labeled "Borrow signup" on a page nobody watches would
  keep lending the community's trust to whatever lives at that
  address in five years.
- The rule is the same one pending suggestions follow (§5.2), from
  the other end of the lifecycle: **a URL renders as an anchor only
  while stewards actively vouch for it.** Before acceptance → text.
  While tended → anchor. After retirement → back to text. The
  anchor is the community's *living* endorsement; the text is the
  *record*. Someone who wants the old inventory sheet copies the
  URL deliberately, eyes open.
- Because the friction is deliberate, **the retired page explains
  itself in one line** next to the de-anchored list — "Links here
  are shown but not clickable: nobody tends these destinations
  anymore, so the app no longer vouches for where they lead" — the
  same honesty register as the outside-privacy hint. Unexplained
  friction reads as a bug; explained friction reads as care.
- **Un-retire restores the anchors** — it is a deliberate steward
  act, so the re-vouching is real — and the un-retire flow shows a
  one-line nudge ("Check that these still point where they
  should"), since the links may have rotted during dormancy.

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
   accepts before a link renders (§5.2). The pending-visibility
   sub-question is also **resolved**: pending suggestions are
   visible to the whole community (transparency), rendered as plain
   non-clickable text with a pending chip until accepted (safety),
   and declines are logged like removals so curation happens in the
   open. **Care-notes edit authority — also RESOLVED (2026-07): the
   links shape, reused verbatim** (§5.3): stewards direct + logged,
   members suggest with pending visibility, steward accept writes,
   declines logged. One authority model for everything members
   contribute to a commons.
3. **Resource links on active projects too?** §5.2 argues yes;
   confirms scope of phase 2.
4. **The Dashboard doorway card — RESOLVED (2026-07): approved, the
   humble version** (§5.1): count + link in the community-as-a-whole
   cluster, hidden at zero, no next-care enrichment. Ships in
   Phase 2.
5. **"Needs attention" shape — RESOLVED (2026-07): Option A**
   (§5.4): prefilled need post + local-only commons⇄post link row;
   the amber chip derives from open linked needs; stewards get both
   affordances; no anonymous flagging.
6. **Retired links — RESOLVED (2026-07):** de-anchored to muted
   plain text, with the in-page one-line explanation and the
   un-retire check-links nudge (§7). One principle now covers the
   whole lifecycle: an anchor exists only while stewards actively
   vouch for the destination.
7. **Graduation announcement — RESOLVED (2026-07): yes** (§4): the
   completion-moment nudge re-aimed from gratitude to orientation,
   with the id+flavor celebrated-key (retrofit graduations still get
   their moment) and placeholder-not-prefill copy.

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
