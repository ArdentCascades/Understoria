# Understoria — Community Calendar (design note)

> **Status:** **shipped.** Design note + threat-model §7 entry +
> privacy-policy §4 amendment landed in PR #164; pure data layer
> (`lib/calendar.ts` with `buildCalendar`, `groupByDay`, `dayKey` and
> 37 unit tests) landed in PR #165; UI (`Calendar.tsx` page +
> `CalendarAgenda` / `CalendarMonth` / `CalendarWeek` components, 5th
> bottom-nav tab, category / project / "Mine" filter row, density
> tooltip, empty state, en + es i18n) landed in PR #175. Pairs with the
> threat-model §7 entry "Calendar aggregation as a faster surveillance
> surface" and the `docs/privacy-policy.md` §4 amendment (no new fields
> cross any wire — the calendar is a local aggregation of
> already-federated data). Same playbook as `docs/auto-confirm-key.md`
> and `docs/device-pairing.md`: values argument + threat-model entry
> land as reviewable prose before any code reads or writes data.

---

## 1. Problem

Date-shaped data already lives in Understoria — project deadlines,
post expiries, the cadence of completed exchanges. It's scattered.
Each project page shows its own deadline; the Board shows posts
about to expire; the Dashboard shows totals. A member asking "what
is the community doing this month?" today has to walk three
different surfaces and assemble the answer in their head.

The question is whether a single time-spatial view is worth
shipping — and if so, what specifically goes on it without crossing
into surfaces this app deliberately does not want to be.

## 2. The values tension

Three principles pull in different directions:

- **`solidarity-not-shame`** says the calendar should not project
  individual members onto specific dates in ways that turn shared
  community work into individual accountability gauntlets.
  ("X promised to be there on Tuesday and didn't show up" is the
  failure mode.)
- **`no-leaderboards`** says quantifying community activity is fine
  in aggregate but not as a contest. Showing "20 exchanges
  happened Tuesday" is information; showing "X did 4 of them and
  is leading this week" is the wrong shape.
- **`privacy-precondition`** says the threat model is the floor.
  The populations this app serves include tenant organizers,
  shop stewards, and undocumented members. Anything that makes
  "X is doing labor at Y on Tuesday" easier to find on a public
  surface is a surveillance gift.

A calendar can land within these constraints. It cannot land
everywhere a calendar might want to go.

## 3. Decision: view-only aggregation over existing data (v1)

Device-pairing and auto-confirm took the same shape: ship the
narrowest answer that satisfies the felt need, design-doc the
broader answer for after pilot signal lands. The calendar in v1
**aggregates date-shaped fields the schema already carries** and
renders them in a familiar grid. No new federated record type,
no new server endpoint, no schema migration.

The federated `Event` record was deferred here and has since
SHIPPED via its own design note (`docs/community-events.md`, §9's
trigger having fired) — events are now the calendar's fourth
source, alongside an "Events only" filter chip.

## 4. What appears on the calendar

| Source | Calendar shape | Why this is OK |
|---|---|---|
| `Project.deadline` | Marker on the deadline day, colored by category | Already federated, already visible on the project page, already drives the `project_deadline_approaching` attention item 3 days out |
| `Post.expiresAt` (status = open) | Marker on the expiry day, visually distinct from project deadlines | Already on the Board; the calendar makes scanning faster, doesn't expose new fields |
| Completed exchanges, per UTC day | Sparkline density indicator — count per day, no member names, no hours total | Echoes `no-leaderboards`: community metabolism, not individual contest; gives the calendar visible texture even with no future events |

Plus the fourth source that shipped later: federated `Event`
records (`docs/community-events.md`), rendered as event entries
with their own "Events only" filter chip. Each source keeps a
clear shape constraint.

## 5. What deliberately does not appear

Each non-feature has a reason. The list itself is the contract.

- **Member availability projection.** `availabilityChips` and
  `locationZone` already exist on profiles. Projecting them onto
  specific dates and showing them on a community-visible calendar
  is a stalking surface. Profile is the right home for
  availability; the calendar is the wrong amplifier.
- **Member-specific calendars** (`/member/X/calendar`). Same
  reason. Per-member aggregation is what the existing member
  detail page already does at a coarser grain; sharpening it
  into a time-spatial view widens the surveillance surface
  without a values win.
- **Recurring template-task cadences materialized as virtual
  entries.** The cadence today is text suffixed into a task's
  description via `projects.templates.recurringSuffix.<cadence>`.
  Parsing localized strings back into structured cadences for
  calendar purposes is fragile. Open question §9 captures this:
  the right path is to lift `recurringCadence` to a first-class
  field on `ProjectTask`, then surface it on the calendar in a
  follow-up.
- **iCal export / public per-project calendar URLs.** A public
  iCal subscription URL doesn't carry an authentication boundary;
  it's a surveillance escape valve where any "subscriber" with
  the URL pulls full schedule data. Out of scope.
- **Cross-node event aggregation.** Pilot signal first, then
  design-doc the federated `Event` type.

## 6. Views

The calendar ships with three view modes, with sensible defaults
per breakpoint:

| View | Default at | Purpose |
|---|---|---|
| **Agenda** | < lg (mobile) | Chronological list grouped by day with sticky day headers. Accessible by default, screen-reader friendly, scrollable. This is the minimum viable surface — if month/week views break, agenda still works. |
| **Month** | lg+ (desktop) | Standard 7×N grid. Markers per day with "+N more" overflow link when a day has more entries than fit. |
| **Week** | opt-in | 7-column week view for organizers tracking multiple project deadlines in a tight window. |

Filtering is scoped to surfaces members already know about:

- **By category** — reuses `ALL_CATEGORIES` and `CATEGORY_META`
  from `lib/categories.ts`.
- **By project** — focus on one project's deadlines. A select in
  the calendar's own filter row (there is no "View on calendar"
  link on the project detail page); the choice persists with the
  other filters in the local settings store, so the calendar
  reopens as you left it.
- **"Mine"** toggle — projects I organize, posts I authored,
  exchanges I'm a party to. Defaults off. This is the only
  filter that produces a per-member view, and it's per-member
  for the viewing member only (their own data).
- **"Events only"** toggle — added when federated events shipped
  (`docs/community-events.md`); narrows the calendar to event
  entries.

## 7. Empty state

Final copy (en; es parity ships in PR 3):

```
The community's calendar is quiet this week.

When someone creates a project with a deadline or posts a need
that expires, it'll show up here. Activity from completed
exchanges shows up too — the calendar reflects what the community
is doing together, not a score to chase.
```

Not "you have nothing scheduled." Not "you're behind." The
calendar reflects the community; an empty week is the community
breathing, not the member failing.

## 8. Subtleties worth pinning

### 8.1 Bottom-nav arithmetic

Going from 4 to 5 tabs is a one-time UX change. Instagram,
Twitter, Bluesky all use 5 tabs; the pattern is familiar. The
constraint is the WCAG 2.1 AA 44×44 touch target floor — at the
smallest viewports (320px iPhone SE), five 44px targets plus
icon padding plus tab dividers leave roughly 19px of horizontal
slack. That's tight but passes.

The implementation PR (PR 3) MUST verify with a render at 320px
viewport in a test. If it fails the touch-target floor, the
fallback is to route the calendar under the Dashboard tab as a
sub-route rather than adding a 5th nav item.

### 8.2 Exchange-density entries

Per-day exchange counts are the closest the calendar comes to
"quantifying" the community. The values-argument decision: ship
them, with a `WhyTooltip` pointing at the `no-leaderboards`
principle explaining why no names appear.

The mitigation against the "race to fill the calendar" failure
mode is the same as the dashboard's existing posture: aggregates
are descriptive, not goals. A community whose calendar suddenly
goes from 2 exchanges/day to 20 should read as "something
happened" — a mutual aid drive, a campaign — not "we're winning."

Rendered shape: a small bar or dot whose opacity scales with
count. Three counts (1, 5, 20) read as roughly three opacity
buckets. No numeric overlay by default; tap-to-reveal "20
exchanges on Tuesday" for members who want the number.

### 8.3 Time zones

`buildCalendar` (PR 2) computes day boundaries in **UTC**. The
UI layer formats display in the member's local time zone via
`Intl.DateTimeFormat`. A deadline at 23:00 UTC may show as the
next day for some members; this is correct and matches every
other calendar app's convention.

The two threats this avoids:

1. **"Why does my deadline show on the wrong day?"** Pinning to
   UTC in the data layer means the same entry never lands on
   different days between two members in different time zones.
   The display layer translates.
2. **Off-by-one boundary bugs.** Day-of-month transitions and
   DST shifts are formatter problems; the aggregator never
   touches them.

## 9. Open questions

- **Recurring template-task cadences.** Today the cadence lives
  in description text via `projects.templates.recurringSuffix.<cadence>`.
  Promoting `recurringCadence` to a first-class field on
  `ProjectTask` would let the calendar materialize virtual
  entries for the next N weeks. Schema migration (Dexie v20+),
  server schema bump, federation pull compatibility. **Recommendation:**
  defer to a follow-up after the v1 calendar ships and members
  signal whether the missing surface bites.
- **Federated `Event` record type.** **Both preconditions met.**
  Pilot signal from the operator (members want skillshares,
  potlucks, work days that aren't already shaped by an existing
  post or project) AND a threat-model entry covering the
  federation surface widening have both landed. The design lives
  in [`docs/community-events.md`](./community-events.md); the
  threat-model entry is "Federated `Event` records widen the
  public wire surface" in §7 of `docs/threat-model.md`; the
  privacy-policy §4 / §6 amendment lists the new record types.
  (`EventRSVP` was local-only at this writing; it federates within
  the community as signed participation state since
  `docs/project-federation.md` §6 — still never to peer nodes.) Phase 1 ships `Event` +
  `EventCancellation` as federated signed records, with the RSVP
  roster scoped to the node where the RSVP happened (the
  `Post.claimedBy` pattern applied to attendance). Phase 2
  candidates (templates, opt-in iCal toggle, reminder
  notifications) are deferred in `community-events.md` §10 / §11.
- **Per-category default colors.** The calendar reuses
  `CATEGORY_META[c].barColorClass` from `lib/categories.ts` for
  marker color, so the visual language matches the dashboard
  category breakdown. Confirming this matches the design system
  before PR 3 ships is a one-line check.

## 10. Threat model and privacy delta

### 10.1 What's new

The calendar collapses date-shaped data already present in
`Project`, `Post`, and `Exchange` records into a single
time-spatial view. For an adversary with limited time to
enumerate, the calendar reduces the cost of building a picture
of "what's happening in this community in November" from
"walk every project page" to "open the calendar."

### 10.2 What's NOT new

No fields cross any wire that didn't already. The aggregator is
local-only — it runs in the PWA on data the device has already
received via federation pull. No new server endpoint, no new
federated record type, no schema migration.

### 10.3 Mitigations baked in

1. **Local aggregation, no new server data.** The calendar is
   built in `lib/calendar.ts` from data already loaded in
   `AppContext`. The server's existing endpoints are untouched.
2. **No member-level aggregation by default.** v1 never groups
   entries by who-they-belong-to. The "Mine" filter exists but
   shows ONLY the viewing member's own data, never another
   member's.
3. **No availability/zone projection.** Profile fields stay on
   the profile.
4. **No analytics delta.** `LOG_REQUEST_PATHS=false` (server
   default) covers it; the calendar page produces no special
   logging.

### 10.4 What this does NOT mitigate

Anyone who can already see the Board can already see expiry
dates. Anyone who can already see a project page can already see
its deadline. The calendar surfaces the same data faster — it
doesn't expose new fields. Saying this plainly in the threat-model
entry avoids overclaiming protection the design doesn't provide.

### 10.5 Rejected alternatives, named with reasons

- **iCal subscription URLs.** No authentication boundary;
  anyone with the URL pulls full schedule data. Surveillance
  escape valve. The events design (`docs/community-events.md`
  §11.5) sketches a narrower phase-2 iCal toggle scoped to a
  single member's own RSVP'd events, off by default, gated on an
  informed-consent surface, and revocable via URL rotation —
  that toggle, if shipped, would supersede this rejection for the
  per-member scope only. The community-wide iCal feed remains
  out of scope. A client-side single-event `.ics` file export — no
  server, no URL, nothing polls — is a materially different shape
  and is settled as permissible; see `docs/community-events.md`
  §11.5a.
- **Per-member calendar URLs (`/member/X/calendar`).** Per-member
  time-spatial aggregation is a stalking surface. No values win.
- **Server-rendered ICS feed via federation.** Federation surface
  widens for a low-value feature.

## 11. Implementation breakdown

- **PR 1 (PR #164) — SHIPPED.** Design doc + threat-model §7 entry +
  privacy-policy §4 amendment. No code.
- **PR 2 (PR #165) — SHIPPED.** `lib/calendar.ts` with `buildCalendar`,
  `groupByDay`, `dayKey`. 37 tests covering each entry kind, window
  filtering, UTC day boundaries, sort stability, edge cases. No UI,
  no nav entry.
- **PR 3 (PR #175) — SHIPPED.** `Calendar.tsx` page + `CalendarAgenda`,
  `CalendarMonth`, `CalendarWeek` components. Nav entry (5th tab;
  labels are always visible at every width — PR #185 reversed the
  original icon-only collapse below `sm` per operator feedback,
  fitting the 320px / 44×44 touch floor of §8.1 with a smaller
  rem-based label size instead). Filter row (category / project / "Mine").
  Empty state. i18n keys in en + es. `WhyTooltip` on the
  exchange-density indicator pointing at `no-leaderboards`.

Threat-model and privacy-policy edits landed in **PR #164** so the
values posture was consistent at every commit touching `main`.
