# Desktop power tools — plans

Status: **all five plans shipped** (palette P2 action verbs and the
infrastructure page's mirror-freshness P2 remain open follow-ups). The desktop layout
work (nav rail, board/dashboard rails, calendar event panel, the
1600px cap) made room; the operator asked what could fill it for
the members who do coordination work at a keyboard. Five plans, in
recommended build order. A sixth idea from the same conversation —
split-pane messages — turned out to be ALREADY SHIPPED
(`MessagesShell` renders the conversation list beside the open
thread at lg+), which is a good omen for the others: the app's
patterns want this shape.

Shared guardrails, up front, because "power user" is where ethos
erodes if unwatched: no notification centers, no unread badges, no
per-member activity rankings, nothing that turns care into a
scoreboard. Every surface below reads the member's OWN data and
responsibilities from Dexie — nothing new is stored on any server,
and phones are untouched unless a plan says otherwise.

## 1. Command palette (Ctrl+K / Cmd+K) — P1 SHIPPED

As built: `lib/commandPalette.ts` (pure index + scorer) +
`components/CommandPalette.tsx` mounted in Layout. One deliberate
delta from the plan below: results render as a flat ranked list
with a kind chip per row rather than grouped sections — fewer moving
parts, same scannability at 12 results. P2 (action verbs) remains
open.

**What:** one keystroke opens a search over everything the device
already holds — posts, projects, events, members, proposals, Help
answers — plus navigation ("Go to Calendar") and, in a later phase,
actions ("New post"). Understoria is unusually suited to this:
every record is local, so results are instant, private, and work
offline.

**Mechanism:**

- `lib/commandPalette.ts` — a pure index builder:
  `buildPaletteIndex({posts, projects, events, members, proposals})`
  → typed entries `{kind, id, title, subtitle, to}` merged with a
  static route/action table and the FAQ entries
  (`content/faq.ts` already exports structured questions). Scoring
  reuses `matchesQuery` (lib/messageSearch) for containment, plus a
  prefix/word-boundary bonus; cap ~12 results grouped by kind.
- `components/CommandPalette.tsx` — rendered once in `Layout`
  (beside ToastContainer). Open state is local; a document keydown
  listener (the `useSlashFocus` pattern: never fires while typing —
  except Ctrl/Cmd+K deliberately DOES fire in fields, matching
  every palette users know) toggles it.
- Dialog a11y: `role="dialog"` + `aria-modal`, focus trapped
  (`lib/a11y/useFocusTrap` — already used by InviteShareSheet),
  combobox/listbox semantics for input + results, ArrowUp/Down +
  Enter, Escape closes. Motion-safe fade (the existing `fade-in`
  keyframe).
- Selection navigates (`useNavigate`) and closes. Entries carry the
  same paths the app already uses — including the nested panel
  paths, so palette → event opens the calendar panel.

**Ethos check:** search is over data the member can already see;
no history of what was searched is stored.

**Tests:** index-builder unit tests (grouping, ranking, FAQ
inclusion, empty query = routes only); component test for
open-on-Ctrl+K / closed-while-typing-guard exception / arrow+enter
navigation.

**Phases:** P1 search + navigate (one PR). P2 actions (new post /
new project / lock now) as a static verb table — small follow-up.
Later features register entries here ("Open organizer's desk").

**Size:** ~1 PR, lib-heavy. No server changes.

## 2. Organizer's desk — SHIPPED

As built: `/desk` (pages/OrganizerDesk.tsx) with the doorway card in
the dashboard rail and a palette route. Two deltas from the plan:
the confirm-queue and open-tasks sections reuse
`myOrganizedProjects` outright (its per-project `awaitingYouCount` /
`openTaskCount` already carried every careful predicate — only the
shift-gap selector was genuinely new, in `lib/organizerDesk.ts`),
and rows link per-project rather than per-task (the project page is
where confirmation happens anyway).

**What:** one page answering "what's waiting on ME, and what's
short of hands, across everything I organize?" — today that's a
tour of every project page.

**Mechanism:**

- `lib/organizerDesk.ts` — pure selectors over existing state (the
  `myProjects`/`myTasks` pattern):
  - `submissionsAwaitingMe`: project tasks in submitted state where
    the viewer is organizer/co-organizer (the confirm queue —
    each row links to the project).
  - `openTasksByProject`: unclaimed tasks per organized project
    (reuses `projectNeedsMoreHands` / `hasOpenTasks` from
    lib/projectFilter).
  - `shiftGaps`: event shifts (for events the viewer organizes)
    where signups < needed, soonest first (eventShifts +
    shiftSignups are already in app state).
  - `myPostsAwaitingConfirm`: the viewer's posts sitting in the
    one-signature state (`pendingBalanceFor` machinery knows this
    shape).
- `pages/OrganizerDesk.tsx` at `/desk`: sections in that order —
  act-on-these first — each row a link to the surface where the
  action already lives (no new mutation paths; the desk is a lens,
  not a control panel). Empty state: "nothing is waiting on you"
  as a calm full card (solidarity-not-shame: an empty desk is
  rest, not failure).
- Entry points: a Dashboard rail card (self-hiding unless the
  viewer organizes something AND something is actionable — the
  doorways contract), and a palette entry.

**Ethos check:** strictly the viewer's own responsibilities.
Deliberately NO "member X hasn't done Y" views, no per-member
counts, no age-shaming timestamps beyond what the linked pages
already show.

**Tests:** selector unit tests (the bulk — organizer vs
co-organizer vs neither, shift-gap math, confirm-queue statuses);
one page render test with the reading-order lock.

**Size:** 1–2 PRs (selectors+page, then dashboard card). No server
changes.

## 3. Board post panel — SHIPPED

As built: option (a) below, as recommended. The frame was extracted
into `components/DockedPanel.tsx` (focus-on-open/swap, document-level
Escape guarded against form fields, dock-at-lg / full-screen-below)
with `CalendarEventPanel` and the new `BoardPostPanel` as thin
wrappers. `/post/:id` nests under the Board route — one canonical
URL, every existing link and share URL untouched. Watch-out
resolutions: PostDetail turned out to have no fixed-position
affordances (the share menu is a plain dropdown), so nothing fought
the scrolling aside; the FAB unmounts while the panel is open (the
panel docks exactly where it floats); and the AttentionSection rail
hides at lg+ while the panel is open — at exactly 1024px the panel
and both rails can't coexist beside a readable card column. One
addition the plan missed: `PostCard` now carries the current query
string into the post URL, so the board's `?tab=` survives
open→close and Offers-tab triage lands back on Offers.

**What:** the calendar pattern applied to the board — click a post,
it docks beside the card grid; claim/confirm from there; click the
next post and the panel swaps. With the palette this makes desktop
triage genuinely fast.

**Mechanism — one decision to make first:** unlike the calendar,
the standalone route (`/post/:id`) and the would-be nested path
collide meaningfully. Two options:

- (a) **Nest the existing route**: move `/post/:id` to be a child
  of the Board route ("/"), rendering `PostDetailPage` in an aside
  (full-screen below lg — exactly `CalendarEventPanel`). Every
  existing link and share URL keeps working, and deep links get the
  board behind the post for free. Cost: opening a shared post link
  mounts the Board behind it (heavier first paint), and Board's
  tab/filter state needs to not fight the post's type (fine —
  the panel doesn't read the tab).
- (b) **A parallel `/board/post/:id`** nested path, calendar-style,
  with board-originated links migrated. Cost: two URLs for one
  post; share links from the panel must canonicalize.

**Recommendation: (a).** One URL per post is worth the slightly
heavier deep-link mount, and the Board behind a shared post is
good context, not noise. `CalendarEventPanel` generalizes into
`DockedPanel` (aside + focus + Escape + close) with the event and
post panels as thin wrappers.

**Watch-outs:** PostDetail's fixed-position affordances (share
menu) inside a scrolling aside; the board FAB vs the panel (panel
is col-3; FAB stays bottom-right — verify no overlap at lg exactly
1024); reading-order suite gains the same lock the calendar got.

**Tests:** route test (panel at lg classes, full-screen classes
below), Escape/close behavior (shared with DockedPanel tests),
board state survives open/close.

**Size:** 1–2 PRs (extract DockedPanel + calendar refactor, then
board wiring). No server changes.

## 4. Operator console → "Community infrastructure" page — SHIPPED

As built: `/infrastructure` (pages/Infrastructure.tsx) over
`lib/infraStatus.ts`, linked from the ResilienceCard (alongside the
grow-root CTA, replacing nothing) and the palette. Deltas from the
plan below: the probe simplified from probeNewRoot's full check list
to per-endpoint `/health` + published-`/config.nodeId`, with the
mismatch flag only on the PRIMARY (mirrors run distinct NODE_IDs by
design) and the tri-state honesty kept as "couldn't ask ≠ wrong /
down" plus an explicit you're-offline note; the outbox and
governance reads live in the page (a live query and two settings
reads didn't earn a lib). Drill checklists shipped as planned —
`SETTING_KEYS.drillChecklists`, device-local, with a "We ran it
today" stamp that clears the checks for the next run. P2 (mirror
`lastSyncAt` freshness on /config) remains unbuilt and gets its own
decision if wanted.

**What:** the runbooks turned into a page you can see is green:
node + mirror health, federation peers, outbox state, governance
posture, and the drill checklists (reseed, storm hub).

**Framing decision (ethos):** NOT operator-gated. Everything shown
is either already public (`GET /config`, `/health`), already on
the member's device (outbox, federation stats), or already
documented as community-legible (operator-powers.md's whole point).
An infrastructure page every member can read IS the transparency
posture — title it "Community infrastructure", link it from the
ResilienceCard's detail affordance, and let it replace nothing.

**Mechanism:**

- `lib/infraStatus.ts`: probe functions with injectable fetch (the
  `probeNewRoot` pattern — some of this exists in ResilienceCard's
  endpoint walk; extract and share): node `/health`, each announced
  mirror's `/health` + `/config` (nodeId sanity), plus pure reads:
  outbox pending/failed counts (Dexie), federation stats (already
  derived on Dashboard), governance snapshot (open proposals count,
  `removalQuorum` from /config).
- `pages/Infrastructure.tsx` at `/infrastructure`: status cards
  first (green/amber with honest "couldn't ask ≠ down" tri-state,
  the probeNewRoot semantic), then two drill checklists rendered
  from the runbook steps with device-local checkboxes
  (`SETTING_KEYS.drillChecklists`, JSON; never federated) and a
  "last drilled" date the member sets — the docs stay the source
  of truth, the page is the tracker.
- Server: nothing new in P1. P2 (only if wanted): mirror
  freshness — "how far behind is each mirror" — would need a
  lightweight `lastSyncAt` on `/config`; that's a wire-surface
  change, so it gets its own decision.

**Tests:** probe unit tests with fake fetch (up/down/unreachable
tri-states), checklist persistence round-trip.

**Size:** 1–2 PRs. No server changes in P1.

## 5. Print surfaces — SHIPPED

As built: `/print/invite#<encoded>` (pages/PrintInvite.tsx) and
`/print/board?tab=…` (pages/PrintBoard.tsx), plus the global
`print:hidden` chrome and — a mechanism the plan missed — releasing
the one-screen-tall clipped app shell for print (`print:h-auto` /
`print:overflow-visible` on Layout's shell and `<main>`), without
which every page printed as one clipped viewport. Deltas: the invite
travels in the URL FRAGMENT (the exact token the share links use, so
it never reaches a server and the poster page verifies-then-renders,
refusing expired/forged invites); the board sheet re-derives the
member's view from query params through a predicate extracted to
`lib/boardFilter.ts` and now shared with the Board itself; there is
no `communityName` in any config, so both sheets identify the
community by its host. Entry points: "Print poster" in the share
sheet's revealed view (post-gate), "Print this view" under the board
list. A source-guard test locks the chrome classes.

**What:** desktop is where printers live, and
`docs/offline-resilience.md` §5 already imagines "a paper bulletin
board of QR codes in a shelter lobby." Two printables:

- **Invite poster:** the InviteShareSheet gains "Print poster" — a
  page with the community name, the invite QR (the `qrcode` SVG
  path already shipped), the plain-words what-this-is copy, and the
  expiry date. Tear-off-tab optional silliness deferred.
- **Board sheet:** from the Board, "Print this view" renders the
  CURRENT filtered list (the member's filters are the selection
  mechanism — no new multi-select UI) as a clean sheet: title,
  category, zone, a QR per post to `/post/:id`, printed-on date.

**Mechanism:** a `/print/...` route family rendering into the
normal shell but with a `print:`-only stylesheet posture: `@media
print` hides nav/FABs/banner globally (a few `print:hidden` on
Layout chrome — this alone improves EVERY page's print today), and
the print pages are plain light-background components (`print:`
colors; QRs are already black-on-white by design — the
InviteQRCode comment). `window.print()` button; no popups, no
PDF library.

**Privacy note (threat-model §7 one-liner owed at ship):** a
printout is an offline copy outside every purge path — the pages
say so in a footer line ("printed from Understoria on DATE — paper
doesn't sync or purge"), the same honesty as the recovery kit's
print path.

**Tests:** render tests for the two print pages (QR value
correctness, footer present); the global `print:hidden` chrome is
class-assertion locked.

**Size:** 1 PR. No server changes.

## Order and why

1. **Command palette** — broadest daily value, everything later
   registers into it.
2. **Organizer's desk** — deepest single-audience value; pure
   selectors make it the safest big feature.
3. **Board post panel** — multiplies the palette (search → open in
   place → act).
4. **Infrastructure page** — operator/steward value, drill
   culture made visible.
5. **Print surfaces** — smallest, and the storm-hub story's
   missing physical artifact.

Each lands as its own PR(s) with the standing gates: en/es parity,
reading-order locks where layout moves, screenshots from the real
browser before shipping, threat-model entries where a surface
grows, and honest as-built notes back into this file.
