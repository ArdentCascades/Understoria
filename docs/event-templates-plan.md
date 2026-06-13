<!--
Understoria — Federated mutual aid timebank
Copyright (C) 2026 Understoria Contributors
SPDX-License-Identifier: AGPL-3.0-or-later
-->

# Event templates — camaraderie gatherings (plan, June 2026)

Companion to `docs/project-ux-plans.md`. Brings curated, camaraderie-aimed
templates to "Create Event" — the way `projectTemplates.ts` already powers
"Start a Project" — and, along the way, finally gives events a visual
identity on the calendar. Produced from four parallel design passes, each
verified against the code it cites. Line numbers drift; symbols are the
anchors.

## 0. The headline: the wire was already built for this

The single most important fact, and the reason this is a small, low-risk
feature rather than a federation project:

- **`EventPayload.templateId: string | null` is a reserved, already-signed
  wire slot** (`packages/shared/src/types.ts:971`); `canonicalEventPayload`
  has signed it since events shipped (`packages/shared/src/crypto.ts:568`).
  The *only* thing disabling templates is one application-layer guard:
  `createEvent` throws `"template_not_supported"` on any non-null
  `templateId` (`apps/web/src/db/events.ts:125`). Enabling templates is a
  guard change, **not a wire change** — every existing signature stays
  valid because the preimage is unchanged.
- **`EventPayload.category` is free text, 1..50 chars,** *explicitly so
  templates can mint new strings* (`types.ts:953`: "Not constrained to
  CATEGORIES so phase-2 templates can introduce category strings the legacy
  Post enum doesn't carry"). The server agrees — `parseEvent` length-checks
  the category but does **not** enum-check it (`apps/server/src/validate.ts:712`).
  So camaraderie categories (`social`, `celebration`, `learning`) are
  anticipated and need no wire change.

Everything below is local content, UI, and one server-validator fix.

## 1. Ethos check (consolidated)

- **community-authority:** the template set is a hardcoded, curated
  constant (like `PROJECT_TEMPLATES_EN`), **not member-creatable** —
  `docs/community-events.md §10` already reasoned that member-authored
  templates drift toward "popular templates," a leaderboard shape.
- **no-leaderboards:** no usage counts anywhere. This is a deliberate
  divergence from the project picker's "N already in your community" ribbon
  (`TemplatePicker.tsx:240`) — an event-template count is the "3 potlucks
  this month" popularity signal we forbid. The picker passes no usage map;
  the calendar identity encodes event *type* only, never attendance.
- **privacy / threat-model §7 — two deliberate absences:**
  - **Location is never prefilled.** No template field maps to `location`;
    the seed effect never calls `setLocation`. This preserves the work-day
    discipline (`EventNew.tsx:96`). The "what you're signing" card
    (`EventNew.tsx:372`) is unchanged and stays the single signing moment.
  - **No recurrence.** A template seeds exactly one event. A "weekly game
    night" that auto-spawned a series would manufacture the "meets at
    location Z on cadence C" pattern threat-model §7(d) warns about. This is
    the one structural divergence from `ProjectTemplate` (whose tasks carry
    `RecurringCadence`).
- **solidarity-not-shame:** scaffolds are warm and blame-free; suggested
  duration is a suggestion the member overwrites freely; the empty calendar
  stays "the community is breathing."
- **No wire widening:** zero new bytes on any federated record. `templateId`
  (already signed) and `category` (already free text) are the only things
  that cross, and both already do.

## 2. Cross-task contract (shared seams — ownership resolved)

The four tasks touch a few of the same seams. To prevent orphaned or
double-added work, ownership is fixed here:

| Shared seam | Owner | Notes |
|---|---|---|
| `EventTemplate` interface + the 14-template EN/ES set + `getEventTemplate(s)` accessors | **Task 1** | pure content module |
| `EVENT_CATEGORY_IDS` (`social`/`celebration`/`learning`) + the emoji/color **spec table** | **Task 1** | the source of truth for the vocabulary |
| `EVENT_CATEGORY_META` map + `eventCategoryMeta()` resolver + neutral fallback, in `lib/categories.ts` | **Task 4** | implements Task 1's spec; the render-time lookup |
| `categories.social` / `.celebration` / `.learning` i18n label keys (en+es) | **Task 4** | ships with the renderer that needs them; `defaultValue` fallback makes ordering safe |
| Lifting the `createEvent` `templateId !== null` guard + the **server `validate.ts` fix** | **Task 2** | the enabler; nothing renders a real `templateId` until this lands |
| Setting `templateId: "work-day"` on the work-day path + updating `EventNew.workDay.test.tsx` | **Task 3** | EventNew owns the submit; `scheduleProjectWorkDay` already spreads `eventInput`, so no change there once the guard is lifted |
| `events.templates.*` gallery-chrome i18n (en+es) | **Task 3** | the picker's strings |

**The emoji decision (resolved, consistent across tasks):** a template's
`emoji` is a **create-time affordance only** — it appears on the gallery
card. The glyph rendered everywhere else (calendar chips, EventDetail) is
derived from the **category** via `EVENT_CATEGORY_META`, so it survives
federation (it comes from the already-federated `category`, not a template
row a peer may lack) and stays consistent regardless of which template
seeded the event.

## 3. Sequencing

Land serially; 1+2 may combine.

1. **Task 1 (content) + Task 2 (data/federation)** — enabling, no UI yet.
   Safe to ship together: the guard is lifted and the content exists, but
   nothing sets a non-null `templateId` until Task 3.
2. **Task 3 (picker + prefill)** — depends on 1 (content) and 2 (guard).
3. **Task 4 (visual identity)** — depends on 1 (vocabulary); independent of
   3 (different files), so it can land before or after Task 3.

---

## Task 1 — Content model, camaraderie set, category vocabulary

**Tier:** small — **Effort:** S–M (one new content module + its test; no behavior change)

### Why
"Tuesday tenant meeting" is fine blank; "Potluck" wants warmth — a friendly
title stem, a welcoming description, a sane default duration. Project
templates already prove the pattern (`projectTemplates.ts:22`). This task
produces the content the rest consume.

### Design
- **`apps/web/src/content/eventTemplates.ts`**, mirroring `projectTemplates.ts`.
  `EventTemplate { id; name; category: string; emoji; titleScaffold;
  descriptionScaffold; suggestedDurationMinutes; blurb }`. **No** task list
  (events have none), **no** `location`/`locationScaffold`, **no**
  `recurringCadence`, **no** capacity, **no** usage count — each absence
  documented in an interface comment tied to the principle it protects.
- `id` is kebab-case, locale-stable, and doubles as the signed
  `EventPayload.templateId` value — hence curated/low-cardinality.
- `titleScaffold` is a **stem with a trailing separator** (`"Potluck — "`),
  not a finished title, so the organizer completes and signs deliberately
  rather than blind-signing a canned title.
- `descriptionScaffold` is a warm 1–2 sentences and **never contains a
  location**. `suggestedDurationMinutes` is a positive integer (minutes, so
  "90" is exact).
- **New event-category vocabulary** (rides the free-text wire `category`):
  `social` 🎉 (`bg-canopy-400`), `celebration` 🎂 (`bg-moss-400`),
  `learning` 📚 (`bg-moss-500`) — the spec table Task 4 implements.
  Templates may also reuse legacy/project categories where the fit is exact
  (`work-day`/`repair-cafe` → `skilled_labor`, `care-circle` →
  `emotional_support`, `meeting` → `organizing`). Export
  `EVENT_CATEGORY_IDS` + `EventCategoryId`.
- **The 14-template set, social-first** (array order = gallery order):
  potluck 🍲, shared-meal 🍝, game-night 🎲, movie-night 🎬, skill-share 🧑‍🏫,
  craft-circle 🧶, walk-hike 🥾, welcome-gathering 👋, music-jam 🎶,
  celebration 🎉, then the functional four §10 anticipated: work-day 🛠️,
  repair-cafe 🔧, care-circle 🫂, meeting 📋. Draft EN copy + durations are
  in the agent design; ES is the parity twin (ustedes-imperative,
  gender-inclusive `niñes`-style register matching existing es content).
- **`work-day` reconciliation:** reserve `id: "work-day"`,
  `category: "skilled_labor"`, `suggestedDurationMinutes: 240` (the §10
  "4-hour" suggestion), so a project-scheduled work day and a gallery-picked
  one are the same templated shape (Task 3 wires the project path to set it).
- Accessors `getEventTemplates(locale)` / `getEventTemplate(id, locale)`,
  shape-identical to `projectTemplates.ts:5710`.

### i18n
Template prose lives in the EN/ES content arrays (not json), exactly as
project-template prose does. No new json keys in this task. (The 3
`categories.*` label keys are Task 4; gallery chrome is Task 3.)

### Test plan (`eventTemplates.test.ts`, modeled on `projectTemplates.test.ts`)
Count + EN/ES id-set/order parity; non-empty prose + positive integer
duration; locale-invariant fields (`category`/`emoji`/`duration`) identical
across locales; **category-validity** (every `category` ∈
`EVENT_CATEGORY_IDS ∪ known legacy categories` — "free text" never means
"typo"); `titleScaffold` ends with the separator; a documented check that
no scaffold smuggles a location; `work-day` reserved with
`skilled_labor`/240; accessor locale-fallback behavior.

---

## Task 2 — Data layer, the `createEvent` guard, and the federation trace

**Tier:** small but load-bearing — **Effort:** S

### Why
Templates need the data layer to *accept* a non-null `templateId` and the
federation path to carry it + the new free-text category intact end to end.

### Federation analysis (traced; the one real fix is on the server)
Tracing a templated, `social`-category event A → server → B:
- **A** signs the payload incl. `templateId`/`category` and enqueues the
  full JSON (`outbox.ts:235`) — fine once the author guard is lifted.
- **Server** *stores* content-agnostically (the `events` table has no
  `template_id`/`category` column; it persists the verified `payload` JSON
  and reconstructs by `JSON.parse` — `apps/server/src/db.ts:1599`,`1652`).
  **But `parseEvent` rejects it:** it returns 400 on any non-null
  `templateId` (`validate.ts:778`) *and* hardcodes `templateId: null` in its
  success branch (`validate.ts:800`) — which would corrupt the stored
  payload vs. its signature. **This is the single load-bearing change.**
- **Peer B's PWA ingest is already tolerant** — `pullFederatedEvents`
  accepts any string `templateId` (`federationSync.ts:746`) and any string
  `category` (`:742`) and copies them through (`:765`,`:760`); `verifyEvent`
  re-checks the signature over the received bytes and passes. No change.
- **Render fallback** already exists: EventDetail renders the category with
  `defaultValue: event.category` (`EventDetail.tsx:227`) and never reads
  `templateId`, so an unknown template id is silently inert on a peer —
  degrade-to-plain-event by construction.

**Forward/back-compat:** because the guard lives at the *application* layer
and the canonical preimage already includes `templateId`/`category`
(`crypto.ts:557`), an old build verifies the signature identically and
degrades to a plain event — never reject-as-forged. An old *server* relay
that still 400s is a clean no-op relay, not corruption.

### Design / Implementation
1. **`apps/web/src/db/events.ts:125-130`** — replace the hard reject with a
   length-only guard: reject only when `templateId !== null && (length === 0
   || length > 50)` (`invalid_template_id`). **Permissive by design** — the
   data layer is the wire boundary and must not couple to the content file;
   the *UI* picks from the known set. Mirrors how `category` is free text on
   the wire but select-constrained in the UI.
2. **`apps/server/src/validate.ts:776-783` + `:800`** — replace the
   null-reject with a length-bounded acceptance (mirror the category block at
   `:712`) and **pass `r.templateId` through** instead of hardcoding null.
   Reuse `EVENT_CATEGORY_MAX` (50) or add `EVENT_TEMPLATE_ID_MAX`.
3. Update the `CreateEventInput.templateId` / `createEvent` doc comments
   (`events.ts:94`,`:117`) to the new contract.
4. **No change** to `federationSync.ts`, the server store/route, or any
   cancellation/RSVP path (all already pass the fields through — confirmed).

### Test plan
- `events.test.ts`: **invert** the existing "rejects non-null templateId"
  test (`:158`) → accepts + persists + enqueues + verifies a templateId;
  round-trip a `category` outside the 9; reject empty and >50 templateId
  (nothing persisted); accept exactly-50; null still works. In the
  `pullFederatedEvents` describe (`:524`): a peer ingests a
  templated/`social` event and stores it; the null-templateId default still
  ingests.
- `apps/server/src/routes/events.test.ts`: **invert** the reject test
  (`:172`) → 201 + GET round-trips the templateId; reject empty/over-length
  (400); a `social` category 201 + round-trips.

---

## Task 3 — "Create Event" picker + unified prefill

**Tier:** medium — **Effort:** M

### Why
Plan 10 shipped one hard-coded event prefill (the work-day banner +
`seededRef` seam, `EventNew.tsx:97`). This generalizes it into a gallery —
and makes work-day the *first* template (`templateId: "work-day"`), still
driven by `?projectId` (which uniquely also writes the event⇄project link),
realizing plan 10's own composition note (`project-ux-plans.md:614`).

### Design
- **Gallery-then-form on the same page** (mirror ProjectNew): render the
  gallery at the top of `EventNew`, above the form, with a "Start from
  scratch" escape reproducing today's empty form. **Zero FAB change** — the
  Calendar FAB still links to `/events/new` (`Calendar.tsx:319`). A separate
  route would split the work-day deep-link from the template path; one page
  keeps them unified. **No sticky rail** — EventNew is a single `max-w-2xl`
  column; render the gallery full-width above the form.
- **`EventTemplatePicker.tsx`** (new, sibling to `TemplatePicker` — don't
  generalize the project one; it's welded to `ProjectTemplate` and carries
  the setup-bucket filter + the forbidden usage ribbon). Props
  `{ selectedId, onSelect }`. Search + category filters only (drop
  setup-time). Cards show emoji + name + blurb + suggested duration +
  `CategoryBadge`; a `ScratchCard` always renders last.
- **Unified `seededRef` seam** (`EventNew.tsx:97`): one seed guard, two
  sources. The **work-day path** (async — project resolves a tick after
  mount) stays an effect and now also `setSelectedTemplateId("work-day")`,
  seeding title/description/category only (NOT an end time, to keep plan
  10's behavior byte-identical). A **template pick** is synchronous, handled
  in `handleSelectTemplate` (mirror `ProjectNew.tsx:177`): seed
  `title = titleScaffold` (focus caret to end), `description`,
  `category` (reuse the `ALL_CATEGORIES.includes ? : "other"` coerce), and
  the **end time** = `startsAt + suggestedDurationMinutes` (flip `hasEnd`
  on, fill the end inputs). **Never** `setLocation`.
- **Submit:** change the hard-coded `templateId: null` (`EventNew.tsx:175`)
  to `templateId: selectedTemplateId`. Because the work-day effect sets it
  to `"work-day"` and `scheduleProjectWorkDay` already spreads `eventInput`,
  the project path carries `"work-day"` with no extra wiring. In work-day
  mode the gallery is **suppressed** so `selectedTemplateId` can only be
  `"work-day"` there (keeps the invariant structurally true).
- **Banner reconciliation:** work-day mode shows only the existing work-day
  banner (no gallery); normal mode shows a slim template-selected banner
  (mirror `ProjectNew.tsx:380`, stripped of the active-projects block) +
  Clear. **Mobile collapse-after-select** (mirror `ProjectNew.tsx:337`),
  applied at all breakpoints (no rail).

### i18n
New `events.templates.*` block (en + es), mirroring `projects.templates.*`
minus the setup-time/usage-ribbon/rail keys; copy says "before you sign."

### Test plan
New `EventNew.templates.test.tsx` (clone the `EventNew.workDay.test.tsx`
harness; add a content-module mock): pick → fields + end time seeded,
location empty, `templateId` reaches `createEvent` on submit; scratch → no
seed, `templateId` null; **work-day `?projectId` still works**, gallery
absent, `scheduleProjectWorkDay` called with `templateId: "work-day"`;
mobile collapse. The existing `EventNew.workDay.test.tsx` needs **only** its
`templateId: null` expectation updated to `"work-day"` (the gallery's search
box is `type="search"`, so the `[title, location]` text-input assumption at
`:163` is preserved).

---

## Task 4 — Event visual identity on EventDetail + the calendar

**Tier:** small–medium — **Effort:** M

### Why
Events have **no visual identity** today: project deadlines and post
expiries color by category, but every event renders as the same fixed
canopy-green dot/chip in all three views (`CalendarAgenda.tsx:168`,
`CalendarMonth.tsx:243`, `CalendarWeek.tsx:234`), and EventDetail shows the
category as a bare word (`EventDetail.tsx:226`). The template feature's
richer category vocabulary makes the fix worth doing — this is the #1
calendar improvement, and it's the same metadata the picker uses.

### Design
- **`EVENT_CATEGORY_META` in `lib/categories.ts`** (after
  `PROJECT_CATEGORY_META`): a `Record<string, EventCategoryMeta>` (sibling
  interface with a `string` `id`, leaving `CategoryMeta` untouched) covering
  the 3 new categories (Task 1's spec) + the 9 legacy (reuse their existing
  emoji/color). Export a **resolver** `eventCategoryMeta(category): EventCategoryMeta`
  returning a neutral `EVENT_CATEGORY_FALLBACK` (📅 + `bg-moss-400`) for any
  unknown string, so every call site is total and an unknown peer category
  **never crashes** (the existing fixtures already use `category: "skills"`,
  which hits the fallback).
- **Carry `category` onto the event `CalendarEntry`** (`lib/calendar.ts`):
  add `category: string` to the `event` arm and `category: ev.category` in
  the `buildCalendar` event loop. Pure local read of data already on the
  federated event — no wire impact, no migration.
- **Calendar chips (all three views):** replace the fixed canopy treatment
  with `eventCategoryMeta(entry.category).barColorClass` + a small leading
  **category emoji** (`aria-hidden`). The emoji doubles as the
  **discriminator** that keeps events distinct from same-colored
  project/post chips (which carry no glyph); keep the existing "Event"
  `aria-label`. Chip text color stays `text-white` (constraint for Task 1's
  social-category colors).
- **EventDetail:** render the category `Field` (`:226`) as a small colored
  dot + emoji + the translated label, keeping the `defaultValue` raw-string
  fallback. Do **not** surface the template kind (needs a local catalog row;
  a federation hazard) — deferred.
- **Accessibility:** emojis decorative (`aria-hidden`); meaning carried by
  the "Event" aria-label + the visible category label on EventDetail.

### i18n
Add `categories.social` / `.celebration` / `.learning` to en + es (parity
enforced). The fallback echoes the raw peer string — no key-dump.

### Test plan
`calendar.test.ts`: event entry carries category; `buildCalendar` copies it.
New `categories.test.ts`: `eventCategoryMeta` known/legacy/unknown-fallback
no-throw. Calendar view component tests: event chip shows category
color+emoji; same-color event-vs-deadline distinguished by the emoji;
unknown category falls back without crashing (all three views). New
`EventDetail.category.test.tsx`: chip + unknown-category fallback.

---

## 4. Decisions needed (consolidated open questions, with recommendations)

These are the genuinely contestable calls — worth settling before/at build:

1. **The new-category set.** Recommend `social` / `celebration` /
   `learning` (3). Alternative: collapse to just `social` (simpler, loses
   festive-vs-peer-learning distinction). *The most reviewable values call.*
2. **Suggested duration: auto-apply vs. one-tap chip.** Recommend
   auto-apply (flip `hasEnd`, seed the end time) for "it just filled in" —
   the end time is editable and not threat-model-sensitive (unlike
   location). Alternative: a dismissible "Add ~2h end time" chip (softer,
   more opt-in).
3. **`titleScaffold`: prefix (`"Potluck — "`, focus caret to end) vs. full
   default title.** Recommend prefix — it invites completion and a
   deliberate signature. Task 1 and Task 3 must agree.
4. **Does the work-day path auto-seed an end time?** Recommend **no** (keep
   plan 10's exact behavior; work-day never set `hasEnd`). Lowest-risk.
5. **Where the 3 `categories.*` label keys land** — assigned to Task 4
   above; the `defaultValue` fallback makes the ordering safe either way.
6. **Server: any `template_id` column for future grouping?** Recommend
   **no** — keep the server content-agnostic (it stores the verified payload
   verbatim). A queryable template correlator would be a mild surveillance
   widening warranting its own threat-model review.

## 5. Deferred (Phase B — not in this plan)

The two other calendar improvements from the assessment, gated on Phase A
landing well:
- A **personal "you're going" marker** on calendar event chips (the
  member's own local RSVP only — privacy-clean; no attendance counts).
- An **"upcoming gatherings" strip** (generalizing plan 10's
  `WorkDaysSection`) to surface fun events where people will see them.

Both are explicitly out of scope here to keep Phase A small and to keep the
no-leaderboards line crisp (RSVP indicators need careful, separate design).

---

*Produced 2026-06-13 by four parallel design passes over the post-#253
tree; each task verified against the code it cites. Decisions recorded here
become real only through the community's process.*
