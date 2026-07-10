# The community gathering screen (kiosk mode)

> Status: **Phase 1 shipped**; later phases are scoped and
> dependency-ordered below. This document is the design of record.
> Phase 1 lives in `apps/web/src/pages/Present.tsx` (route `/present`),
> `apps/web/src/lib/gatheringSlides.ts` (the pure slide selector),
> `useSlideshow.ts`, and `useWakeLock.ts`.

## 1. What it is

A fullscreen, auto-advancing display for a **shared screen at an
in-person gathering** — a TV in the corner of a repair café, a laptop
propped on a table at a skillshare, a monitor at a mutual-aid
distribution. It rotates through the community's live, actionable items
and puts a **QR code on every slide** so anyone in the room can act with
their phone: RSVP to the event, claim the task, message the person who
posted a need.

Understoria is unusual among apps in that its users are frequently *in
the same room*. The gathering screen leans all the way into that: it is
the app's ambient, across-the-room surface, the digital sibling of the
printed board sheet and event flyer (`docs/` print surfaces).

### The one rule

**Every slide is a scannable doorway to a single action someone in the
room can take right now.** Not a dashboard, not a highlights reel, not
decoration. If a slide can't answer *"what can I do, and how"* with a QR
and one line of text, it does not earn a place in the rotation. This is
the line between a coordination tool and a screensaver, and every scoping
decision below serves it.

## 2. Non-goals

- Not a control surface. The screen never mutates data — it is
  read-only, exactly like the Organizer's Desk. All action happens on the
  scanner's own phone, in the app.
- Not a private dashboard. The wall is public to everyone in the room, so
  the screen shows only what is already public (see §5).
- Not a replacement for the board, calendar, or desk — it is the
  *ambient* view of the same data for a co-present audience.

## 3. The architectural constraints that shape scope

Two facts about the current data model decide what is honest to build
now versus what needs new plumbing first. They are the reason the phases
below are ordered the way they are.

### 3.1 Member profiles do not federate

When a member joins (redeems an invite), federation materializes a
**skeleton** member row on every *other* device — public key plus the
join-time display name — via `createMember` in
`apps/web/src/lib/federationSync.ts`. Materialization **deliberately
never clobbers** an existing row, and there is no member-profile sync:
later edits to `displayName`, `skills`, `availability`, etc. stay on the
member's **own** device. Other devices keep the skeleton.

Consequences for this feature, both decisive:

1. **A self-set opt-out flag cannot reach the organizer's kiosk.** The
   organizer's device holds a skeleton for each other member; a new
   `hideFromCommunityScreen` field set on the member's own phone would
   never propagate there. A member-controlled opt-out that is honored
   *community-wide* requires member-profile federation (§7.1) first.
2. **A "who's here / their skills / message them" people slide cannot be
   built from other members' data** on the organizer's device — their
   skills and availability simply aren't present there. This slide is
   gated on the same federation work.

### 3.2 Invites are single-use

`InviteRow` carries a single `redeemedBy` and an `expiresAt`
(`apps/web/src/db/invites.ts`); redeeming consumes the token. A single
QR on a wall would let exactly one passer-by join and then dead-end
everyone else. A recruit-newcomers "join us" slide therefore needs a
**multi-use "gathering invite"** primitive (§7.3) — a security-sensitive
addition to the invite/threat model, not a UI detail.

### 3.3 What this leaves for Phase 1

Everything that federates reliably and carries its own author key:
**events, projects/tasks, and posts (needs/offers)**. These are exactly
the content slides, and they need no new plumbing. Phase 1 is built
entirely from them.

## 4. Slide taxonomy

| Slide | Action / QR target | Federated? | Phase |
|---|---|---|---|
| **Upcoming event** | RSVP → `/events/:eventId` | yes | **1** |
| **Task needs hands** | Claim → `/project/:id/task/:taskId` | yes | **1** |
| **Open need** | Offer → message author `/messages/:authorKey` | yes | **1** |
| **Open offer** | Ask → message author `/messages/:authorKey` | yes | **1** |
| **Welcome / heartbeat** | Community name + tagline (+ cheap local stats) | n/a | **1** |
| **Who's here** (person + skills + "message me" QR) | `/messages/:memberKey` | needs §7.1 | 2b |
| **Join us** (recruit newcomers) | multi-use invite QR | needs §7.3 | 3 |

Each Phase-1 slide renders as: a big glanceable headline, one line of
context, and a large QR with a one-line call to action ("Scan to RSVP",
"Scan to claim", "Scan to offer help").

## 5. Privacy model

Understoria's posture is *no PII on public surfaces, and always a
choice*. The gathering screen honors that as follows.

- **Phase 1 shows only already-public content.** Every Phase-1 slide is
  derived from something the member themselves published to the whole
  community — a need, an offer, an event, a task on a project. Putting a
  public board post on a bigger screen in a room of co-present members is
  within the same consent envelope the board already established. The
  screen introduces **amplification**, not new disclosure. The
  message-QR only encodes the author's public key, which is already how
  addressing works and is already exposed on the member's profile.
- **Names are shown by default** on Phase-1 slides (per operator
  decision: in a trusted room, names aid coordination; members who want
  distance already use pseudonyms). Names come from the local member row
  (the join-time display name every device has).
- **The self-serve opt-out ("Show me on the community screen", default
  on) is introduced in Phase 2b**, alongside the people slide — the first
  slide that is *net-new* exposure (featuring a member independent of any
  post). It is honored community-wide only once member-profile federation
  (§7.1) carries the flag to the organizer's device; until then it is
  honored on the member's own device and reflected wherever their profile
  is known. Building the toggle earlier would be a promise the transport
  can't keep.
- **Interim control in Phase 1:** an organizer who is asked to drop a
  specific item simply excludes it via curation (§7.2 lands the general
  pin/hide UI; until then the item ages out of the rotation as its
  underlying post/event resolves). No name appears on the wall except as
  the author of public content the organizer chose to display.

The net rule: **the wall never shows anything the community board
doesn't already show, and the one slide that would (the people
directory) waits for the opt-out to be real.**

## 6. Phase 1 — the screen itself (shipped)

### 6.1 Route & shell

- New chromeless route **`/present`**, declared as a *sibling* of the
  `<Route element={<Layout />}>` block in `apps/web/src/App.tsx` (the
  pattern `/welcome` uses), so it renders with **no** BottomNav, command
  palette, or app chrome — just the slideshow. Wrap it in a
  `StandaloneScroll`-style `h-dvh` container.
- Gated behind an onboarded member (not added to
  `PRE_ONBOARDING_PATHS`): the kiosk runs on a member's device.
- Reachable from the **Organizer's Desk** (a doorway `<Link to="/present">`)
  and the **command palette** (append one `route` entry to
  `buildPaletteIndex` in `apps/web/src/lib/commandPalette.ts`:
  `{ kind: "route", id: "route:/present", title: t("palette.routes.present"), to: "/present" }`).

### 6.2 Presentation behavior

- **Fullscreen** via the Fullscreen API, offered by a "Go fullscreen"
  button on an entry/lobby screen (browsers require a user gesture; the
  kiosk can't self-fullscreen on load).
- **Wake Lock API** (`navigator.wakeLock.request("screen")`) so the
  display never sleeps mid-gathering; re-acquire on `visibilitychange`
  (the lock drops when the tab is backgrounded). Soft no-op where
  unsupported.
- **Auto-advance** on a configurable dwell (default ~12s), with
  **pause-on-tap** and manual prev/next (arrow keys + on-screen controls
  that fade out). Respect `prefers-reduced-motion`: cross-fade normally,
  hard-cut when reduced motion is set.
- **Live re-query every rotation** so a task claimed two minutes ago, or
  an event now in the past, drops out before its slide comes round again
  — **no dead QRs**. Data is read live from `useApp()` (Dexie-backed);
  the slide list is recomputed from current state on each cycle.
- A gentle **empty state** ("Nothing scheduled right now — check the
  board") when no slides qualify, so a quiet moment isn't a blank screen.

### 6.3 Data selection

All from `useApp()`, all already block-filtered at the context:

- **Events:** `selectUpcomingGatherings({ events, eventCancellations, eventRsvps, currentMemberKey, now, limit })` (`apps/web/src/lib/upcomingEvents.ts`).
- **Tasks needing hands:** any open task (`status === "open"`) on any project whose `status === "active"`, first 4 per the per-category cap (`apps/web/src/lib/gatheringSlides.ts`). Planning/paused projects aren't claimable, so their tasks stay off the wall; a claimed task drops out on the next live re-query. Deliberately simpler than `WhereHandsAreWelcome.tsx` — neither `projectNeedsMoreHands` nor the `needs_more_hands` check-in state is used here.
- **Needs / offers:** `posts.filter(p => p.type === "NEED" | "OFFER" && p.status === "open")`, newest first, capped.
- A small per-category cap keeps the rotation from being swamped by one
  busy category; `log`-style honesty note in the plan comment when items
  are dropped by the cap.

### 6.4 QR targets & offline awareness

- QR via the existing `<InviteQRCode value={...} ariaLabel={...} size={...} />`
  (lazy `qrcode` lib, `role="img"`), sized large (≈`min(40vh, 40vw)`) so
  it scans from across a room (rule of thumb: QR ≈ 1/10 of scan
  distance).
- Targets are **absolute URLs** built from `window.location.origin` —
  always, with no separate offline-hub detection. (The module comment on
  `apps/web/src/lib/gatheringSlides.ts` records why the storm-hub logic
  this bullet originally proposed reusing turned out unnecessary: the
  kiosk device loaded the app from whichever origin serves the room —
  public URL or local hub — and that same origin is exactly what phones
  in the room should hit. A scanned code therefore resolves on the local
  island during an internet outage, not to a dead public URL, for free.)
- The **message-QR** for a need/offer targets
  `/messages/${encodeURIComponent(authorKey)}` — a scanner who is already
  a member lands in a compose-to-author thread. (A not-yet-member who
  scans hits the onboarding gate; the true recruit funnel is Phase 3.)

### 6.5 TV legibility

- One idea per slide. `page-title`/`text-display` scale headlines, high
  contrast, generous whitespace, dark-friendly. The QR stays black on a
  white card (best scan reliability) even in dark mode.
- Optional subtle position drift over time to avoid OLED burn-in (minor;
  behind reduced-motion).

### 6.6 Out of Phase 1 (explicit)

No people slide, no join slide, no opt-out toggle, no curation UI — all
deferred to §7 with their dependencies. Phase 1 is the shell plus the
four content slide types plus the welcome slide, and nothing that would
promise a capability the data model can't yet keep.

## 7. Later phases (dependency-ordered)

### 7.1 Member-profile federation (enabling primitive)

A signed, last-write-wins **member-profile record** (mirroring the
project-state LWW federation in `federationSync.ts`): a member signs
`{ displayName, skills, availability, hideFromCommunityScreen, updatedAt }`,
it federates through the node, and other devices update their (formerly
skeleton) member row when the signature verifies and the timestamp is
newer. This is the unlock for a real self-serve opt-out **and** for the
people slide. It touches the threat model (§7 of `docs/threat-model.md`)
and deserves its own design pass — it is the single biggest dependency
in this document and should be weighed on its own merits, not smuggled in
under a kiosk.

### 7.2 Organizer curation — **shipped**

The pin / hide panel, category toggles, per-screen dwell time, and a
screen title — layered on top of the Phase-1 auto-selection so the
default still "just works" and the organizer only intervenes to
disagree. This is the whole Phase-2 slice that touches **no** privacy
surface: it's device-local config (never federated) over already-public
content, so it landed independently of §7.1. Lives in the `/present`
lobby's "Customize the screen" panel, backed by
`apps/web/src/lib/useGatheringConfig.ts` (the `gatheringScreenConfig`
setting) and the `filter` argument to `buildGatheringSlides`. **Hide**
also serves as the interim "please don't feature my post" control — a
member asks, the organizer hides it in one tap, no federation required —
until the self-serve opt-out (§7.3) exists.

### 7.3 People slide + self-serve opt-out (needs §7.1)

The "who's here — name, a skill or offer, and a *message me* QR" slide,
plus the **"Show me on the community screen"** profile toggle (default
on), now enforceable community-wide because the flag federates. This is
the highest-value net-new slide for skillshares and repair cafés, and
the reason the opt-out finally has teeth.

### 7.4 Multi-use gathering invite → recruit slide (needs a new invite primitive)

A **reusable, expiring "gathering invite"** (a token that admits many
newcomers over a bounded window, distinct from the single-use personal
invite) → the "New here? Scan to join" slide, which turns a physical
table at a market or fair into an onboarding funnel. Security-sensitive;
needs its own threat-model treatment before build.

## 8. Testing & verification

- Unit: slide-selection selectors (correct items in/out, caps applied,
  resolved/past items excluded), the absolute-URL builder (§6.4 — plain
  `window.location.origin`, no offline-aware helper shipped), and the
  auto-advance/pause reducer (timers faked). No live Dexie needed —
  drive `useApp()` via the existing context mock pattern.
- i18n: a new `present.*` namespace in **both** `en.json` and `es.json`
  (parity test enforced).
- Browser: drive `/present` end-to-end — confirm slides rotate, QRs
  resolve to the right routes, a claimed task drops from the rotation on
  re-query, wake-lock is requested, and reduced-motion hard-cuts.

## 9. Open decision for the operator

Phase 1 (the screen itself) and §7.2 (organizer curation) are **shipped** —
full value for the in-room-members case, no new plumbing, and no privacy
promise the transport can't keep. What remains is one genuine decision:

1. **Whether to build member-profile federation (§7.1)** — the gate on
   the two most exciting slides (people directory, real self-serve
   opt-out). It's a real investment with threat-model implications; the
   interim organizer-mediated Hide (§7.2) covers the "don't feature me"
   case in the meantime.
2. **Whether to build the multi-use gathering invite (§7.4)** — a
   separate, later security-reviewed effort, worth it when recruiting
   passers-by (not just coordinating existing members) becomes a
   priority.
