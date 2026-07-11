# The navigation shell

How a member gets around the app: five bottom tabs (a left rail on
wide screens), a slim global header with a **me-menu** in the top
right, and a small set of deliberately chromeless routes. This doc is
the reference for what lives where and — more importantly — the
reasoning that keeps each tier short, so future additions have to
argue their way in rather than drift in.

Shipped in two PRs: the header + me-menu (#411, purely additive),
then the "My work" tab swap and the docs sweep (this one). The old
desktop-only pinned Settings slot (#399) was the first casualty; the
Profile tab the second.

## The three tiers

1. **Tabs (bottom bar / desktop rail)** — daily work. Board,
   Dashboard, Calendar, Messages, **My work**. Same five items at
   every width: the bar's `<ul>` becomes a slim vertical rail at
   `lg+` (`BottomNav.tsx`, one DOM), so nothing exists on desktop
   that a phone can't reach.
2. **Me-menu (header, top right)** — the about-you tier, where tool
   apps keep account things. Six rows, capped: your Profile (rendered
   as your own display name + short key, so "where did my profile
   go?" self-answers), Settings, Invite someone, Help, Search (opens
   the command palette — the only palette doorway phones have), and
   Community infrastructure. (`AppHeader.tsx` + `MeMenu.tsx`.)
3. **In-page doorways** — everything else stays discoverable from
   the surface it relates to: the organizer's desk from the board
   rail and palette, print pages from their screens' Print buttons,
   Disputes/Proposals from Profile, and so on.

## Why "My work" holds the fifth slot

The tab bar's job is the loop a member actually lives in: see what
the community needs (Board), see how we're doing (Dashboard), see
what's happening (Calendar), talk (Messages) — and see what *I've
taken on* (My work). The Profile page is identity and archive —
balance, history, roles, invites, security — things you *revisit*,
not things you *work in*. When Profile held the fifth slot, the two
views members actually returned to daily (tasks you're carrying,
projects you organize) sat buried two taps behind it.

`/my-work` gathers every commitment kind on one read-only page. The
claimer half is "Tasks you're carrying" (grouped by project), then
"Shifts you're signed up for" (the member's own signups, soonest
first, each linking to its event — the only entries here with a
clock time) and "Help you're on your way to give" (NEED posts the
member claimed and hasn't finished; a claimed OFFER is help they
*receive*, which is a plan, not work, so it stays out). The
organizer half is "Projects you organize", with what's quietly
waiting on you — the "N tasks awaiting your confirmation" line
deep-links to the first such task (`#task-<id>`), and a quiet link
under the section opens the organizer's desk (`/desk`).
Side-by-side columns at `lg+`. The old standalone routes
(`/my-tasks`, `/my-projects`) redirect to `/my-work#tasks` /
`/my-work#projects`, and the quiet entry links on Board's Projects
tab and Profile still work — they land on the sections.

Read-only is load-bearing: claim, release, mark-complete, confirm,
and their consequence dialogs live on the project pages ONLY, so
there's exactly one surface that owns those actions and their
framing. And every number on the page is the viewer's own work —
no other member's totals appear (no-leaderboards), nothing counts
up in a badge (no-notifications).

## Why the me-menu is capped at six

Every extra row makes Profile/Settings/Help harder to find. The cap
forces the "would a member look for this *here*?" argument. Two
deliberate exclusions:

- **Emergency stays inside Profile.** A panic control shouldn't sit
  one mis-tap from a casually-opened menu.
- **No status, no counts.** The menu is a doorway list, not a
  dashboard; nothing in it accumulates a badge.

## The header

A slim in-flow band at the top of every chromed page: wordmark left
(the app names itself in its own chrome — needed once real
communities started printing posters that point people to a URL),
Menu button right. It is NOT `position: fixed` — it's the first
flex child of the 100dvh app shell (`Layout.tsx`), above the
[main, nav] row that iOS testing shaped; the document itself never
scrolls, so the keyboard can't detach it.

Chromeless by design (no header, no tabs): `/present` (the
gathering screen — a wall kiosk is just the slideshow), `/welcome`
(pre-membership), the lock screen, and print output (`print:hidden`
on the whole chrome; the print pages carry their own sheet chrome).

## Accessibility invariants

Locked by tests (`AppHeader.test.tsx`, `BottomNav.test.tsx`) and
walked in `accessibility-test-runbook.md` (§"Global header +
me-menu", §"My work", §"Bottom navigation"):

- The drawer is a focus-trapped `role="dialog"`; Escape closes and
  focus returns to the Menu button; scrim tap closes; the slide
  honors `prefers-reduced-motion`.
- The tab bar is exactly five links, arrow-key navigable, labels
  always visible and rem-scaled; no Settings link, no Profile link
  (both live in the menu — the tests pin the absences).
- `/my-work`'s two halves are `<h2>` sections with stable anchor
  ids (`#tasks`, `#projects`) that the redirects target; the page
  scrolls to them explicitly because `<main>` is the scroller, not
  the document.

## Adding something new? Read this first

- A new **daily-work surface** does not get a sixth tab; it gets an
  in-page doorway (tier 3) and, if navigational, a palette entry.
  Five tabs is a hard cap — at 320px each cell is already ~64px.
- A new **about-you destination** has to displace something in the
  me-menu or argue an exception to the six-row cap.
- Nothing in any tier gets a count bubble or unread badge. The
  attention rail on Board is the one place that surfaces "waiting
  on you" items, and it stays there.
