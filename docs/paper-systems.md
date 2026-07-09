# Paper systems — plans

Status: **P1-P6 shipped; P7-P8 gated on community conversations.**
Print surfaces (desktop-power-tools plan 5)
shipped the plumbing — chrome-free printing on every page, the
`/print/...` route shape, the QR-per-thing pattern, and the dated
"paper doesn't sync or purge" honesty footer. But so far paper only
flows OUT of the app. This document plans the rest of the
relationship, in both directions.

Why paper at all, for a piece of software: paper survives dead
batteries, it includes neighbors who have no phone, and it lives in
the physical places where mutual aid actually happens — shelter
lobbies, community-center doors, work-day clipboards, wallets. The
storm-hub runbook (`docs/offline-resilience.md`) already treats the
community as something that must outlive its connectivity; paper is
the same posture applied below the level of electricity.

Shared guardrails, up front:

- **Every printout carries the honesty footer** (threat-model §7
  "Print surfaces"): printed-on date + "paper doesn't sync or purge
  — recycle stale sheets." Paper is an offline copy outside every
  purge, revocation, and expiry path; the mitigation is telling the
  member so on the artifact itself, every time.
- **Print pages verify before rendering** where the artifact could
  outlive its validity (the invite poster's expired-invite refusal
  is the precedent — a flyer for a cancelled event gets the same).
- **No new data collection.** Paper-out renders what the device
  already holds; paper-in (P7) creates records through the same
  signed paths the app already has, attributed honestly.
- **`window.print()` only.** No popups, no PDF library, no print
  service. The browser dialog is the whole mechanism.
- **En/es parity** on every sheet — a bulletin board in a bilingual
  neighborhood should be printable twice.

## P1. Event flyer — SHIPPED

As built: as planned (pages/PrintEventFlyer.tsx), plus a screen-only
companion link to the P2 roster when the gathering has shifts. The
overflow-menu entries hide on cancelled events (the add-to-calendar
precedent) and the pages also refuse on their own for stale links.

**What:** the invite poster's shape applied to a gathering: title,
when (start–end), where, the plain-text description, a QR to the
event's canonical `/events/:id` URL, and an "all welcome / RSVP in
the app" line. Tape it to the community-center door.

**Mechanism:** `/print/event/:eventId` (pages/PrintEventFlyer.tsx).
Reads the event from app state; refuses to render a flyer for a
cancelled event or one that has already ended (the expired-invite
refusal pattern — paper that misdirects is worse than no paper).
QR value `${origin}/events/${id}`; when/where via the existing
`formatAbsoluteDateTime` / `event.location`. Entry point: a "Print
flyer" item in EventDetail's existing overflow menu (beside Copy
link / Add to calendar — same register, same menu).

**Tests:** render (QR canonicality, when/where present, footer),
cancelled/ended refusal, menu entry present.

**Size:** small. The poster page minus the verification maths.

## P2. Shift roster / sign-in sheet — SHIPPED

As built: as planned (pages/PrintShiftRoster.tsx). One delta: the
entry point is an overflow-menu item on EventDetail (appearing once
shifts exist) rather than a link inside the shifts card — the menu
already carried the print register, and the shifts card stays
focused on acting. The answer to the plan's open question: ANY
event's sheet is printable, not just the viewer's own — printing is
a helper act, and the data is already on every device.

**What:** how volunteer days actually run — a clipboard, not a
phone. For an event with shifts: each shift's label, time window,
capacity, and current signup count, followed by BLANK RULED LINES
for handwritten names, plus one QR (to the event page) so
phone-holders can sign up digitally on the spot. The organizer
transcribes handwritten names into the app afterward — the sheet is
an input medium, the app stays the record.

**Mechanism:** `/print/event/:eventId/roster`
(pages/PrintShiftRoster.tsx). Shifts + signups live-queried from
Dexie exactly as EventDetail reads them; blank lines = the shift's
remaining capacity (capacity-less shifts get a fixed 8 — a
clipboard has to guess something, and the sheet says "and more" at
the end). Renders only for the viewer's OWN events or any event
with shifts? — ANY event with shifts: printing a sign-in sheet is a
helper act, not an organizer power, and the data is already on
every device. Refuses cancelled/ended events like P1. Entry
points: a quiet "Print sign-in sheet" link on EventDetail's shifts
card, and a companion link on the P1 flyer's toolbar.

**Ethos note:** the printed signup counts are the same numbers the
event page shows everyone; no per-member names print (handwriting
happens on paper, in the room, by consent of the hand doing it).

**Tests:** blank-line math (remaining capacity; capacity-less
default), per-shift rows, refusal states, footer.

**Size:** small-medium.

## P3. Fridge calendar — SHIPPED

As built: as planned (pages/PrintCalendar.tsx), linked from the
Calendar page. Day groups render with weekday+date headers; the
30-row cap prints "+N more in the app" when it bites.

**What:** a month-at-a-glance sheet of upcoming gatherings for the
community fridge / lobby corkboard: date-grouped rows — when,
title, where — each with a small QR to the event. The board sheet's
sibling for time instead of needs.

**Mechanism:** `/print/calendar` (pages/PrintCalendar.tsx).
Upcoming non-cancelled events from now through the next six weeks,
soonest first, grouped by day (the calendar page's existing
formatters), capped at 30 rows with an honest "+N more in the app"
line when the cap bites (no silent truncation). Entry point: a
quiet "Print upcoming events" link on the Calendar page, beside its
existing chrome.

**Tests:** window filtering (past/cancelled/beyond-horizon
excluded), day grouping order, cap line, footer.

**Size:** small-medium.

## P4. Offline kit: wallet card + storm-hub wall poster

**What:** the offline-resilience runbook, physicalized — for the
moment when screens are dead and the runbook can't be read in the
app it documents.

- **Wallet card:** a credit-card-sized cutout (printed 2-up with
  scissor lines): the community's address, "if the internet is
  down: look for the hub WiFi, join it, open this same address,"
  and the storm-hub SSID once the community has one.
- **Wall poster:** the shelter-wall version, laminated: big type,
  step 1 join the WiFi (a standard `WIFI:T:WPA;S:…;P:…;;` QR that
  phones join natively), step 2 open the community address (QR to
  the origin — the hub's DNS answers the SAME domain; that is the
  whole §4 trick), step 3 you're on the community island.

**Mechanism:** `/print/offline-kit` (pages/PrintOfflineKit.tsx) —
one page, two artifacts (poster then cards; page-break between).
The app cannot know the hub's SSID/password, so the page carries
SCREEN-ONLY form fields (print:hidden) the member fills before
printing; empty fields degrade honestly (no WiFi QR, instructions
say "ask for the community WiFi"). The WiFi password DOES print —
deliberately: the wall poster's whole job is to hand out shelter
WiFi, and the poster says so in its footer ("this poster shares the
hub WiFi with everyone who can see it — post it where that's the
point"). Entry point: the Infrastructure page's drills section
(where the storm-hub checklist already lives) + the offline FAQ
answer.

**Threat-model note (owed at ship, extends the §7 print entry):**
the poster prints a WiFi credential; the mitigation is the explicit
member-typed input (never harvested from the OS), the printed
caveat, and the fact that a storm-hub AP is a deliberately public
utility in the scenario it exists for.

**Tests:** WiFi QR string construction (with/without password,
special-char escaping per the WIFI: format), degrade-without-SSID,
footer + credential caveat, cut-line layout classes.

**Size:** medium (the WiFi-QR escaping and the 2-up card layout are
the substance).

## P5. Field guide (tabling one-pager) — SHIPPED

As built: as planned (pages/PrintGuide.tsx over lib/printGuide.ts),
linked from the Help page header. The drift guard resolves the
curated ids against BOTH locales in tests.

**What:** the what-is-this zine for farmers-market tabling: a
single sheet built from the FAQ's canonical entries — what this is,
how exchanges work, what it costs (nothing), how to join — ending
in an invite-shaped call to action ("ask the person at this table
for an invite").

**Mechanism:** `/print/guide` (pages/PrintGuide.tsx). A fixed,
curated list of FAQ entry ids from `content/faq.ts` /
`faq.es.ts` (`post-something`, `claim-post`, `confirm-exchange`,
`what-is-balance`, `invite-someone`, `internet-outage`) rendered as
question + answer paragraphs in a two-column print layout. Content
stays in the FAQ files — the guide is a projection, so the two can
never drift. Entry point: a quiet link at the top of the Help page.

**Tests:** curated ids all resolve in BOTH locales (drift guard —
a renamed FAQ id must fail the build, not print a hole), footer.

**Size:** small.

## P6. Tear-off tabs — SHIPPED

As built: as planned (TearOffStrip in PrintChrome.tsx) — six
invite tabs on the poster, one per post (capped at 8) on the board
sheet, dashed cut borders + the scissors line.

**What:** the real bulletin-board mechanic, deferred out of plan 5:
a strip of small tear-off QR tabs along the bottom edge of the
invite poster and the board sheet. Someone hurrying past takes a
tab home and scans it later.

**Mechanism:** a `TearOffStrip` component in PrintChrome.tsx —
N copies (6 for the poster; for the board sheet one per post, capped
at 8) of a small QR + a 2-3 word label, laid out in a print-only
row with dashed cut borders (`border-dashed` + a scissors glyph).
Poster tabs all carry the invite URL; board tabs carry their post's
URL with the post title as the label. Rendered on screen too (what
prints is what you see), just compact.

**Tests:** tab count and values on both surfaces, cut-line classes.

**Size:** small. Print-layout work on two existing pages.

## P7. Paper intake → steward transcription (DESIGN)

**What:** the deepest inclusion move paper can make — extend the
board to neighbors who have NO phone. A printable blank intake form
("I could use help with… / I can offer… / how to reach me:
through ___"), and an in-app transcription flow that turns the
filled-in sheet into a post visibly attributed *"posted by Rosa on
behalf of a neighbor."*

**Design (settled here, build behind an operator+community nod):**

- The transcribing member's OWN key signs the post — no proxy
  identities, no unsigned records, nothing new for federation. The
  on-behalf-of marker is post CONTENT (a structured prefix the
  PostCard renders as a chip), not a schema change.
- The neighbor's name does NOT enter the app unless they ask for
  it; the form's contact line says "reach me through the person who
  typed this in." The transcriber is the consent boundary and the
  message relay — exactly the role a steward already plays for a
  neighbor at a food pantry.
- The intake form itself is `/print/intake` — mostly blank ruled
  boxes mirroring the post form's fields, with a one-line privacy
  promise in plain words on the form ("this sheet gets typed into
  our community's system by the person who gave it to you, then
  shredded").
- Claiming/confirming works unchanged: the exchange is between the
  claimer and the transcriber, who passes the help through. Hours
  land on the transcriber's balance — and that is HONEST (they did
  the coordination work), but it must be said out loud, which is
  why this ships only after the community has talked about it.

**Why gated:** not for technical risk — the mechanism is a print
page and a text convention — but because "members posting for
non-members" is a new social contract about who the board is FOR.
That belongs to a proposal, not a pull request.

**Size when unblocked:** small-medium (form page + chip + FAQ
entry).

## P8. Signed hour-chits (PROPOSAL ONLY)

**What:** classic timebank paper scrip, made forgery-proof: a
member pre-prints bearer notes — "one hour from me" — each a signed
single-use voucher QR; whoever holds the paper scans it to redeem
the hour. Exchanges with ZERO phones present at the moment of help.

**Sketch, for the eventual proposal:** voucher = signed payload
`{issuer, hours, nonce, issuedAt, expiresAt}`; redemption creates
the exchange through the existing signed paths with the voucher as
the issuer's pre-authorization; nonce single-use enforced at the
node (a new uniqueness surface); lost paper = the standing
revocation question (an expiry bound is the honest floor).

**Why community-gated:** this is adjacent to the un-ratified
direct-exchange-label proposal and is functionally a bearer
instrument — double-spend handling, expiry policy, and whether the
community WANTS circulating paper obligations are governance
questions. Like `docs/passkey-restore.md`, this section is the
design contribution; the decision is not the code's to make.

## Considered and REJECTED

- **Paper ballots for proposals.** Votes are signed records
  verified against member keys; paper ballots are unverifiable and
  would quietly break the governance integrity everything else
  leans on. If a community wants in-room decisions, the existing
  answer is phones-in-the-room voting on the proposal — the meeting
  can be physical; the ballot cannot be paper.
- **Printed member directory / contact sheet.** A who-is-who page
  outside every purge and blocking path is exactly the relational
  surface threat-model §7 spends most of its entries protecting.
  The board sheet deliberately prints needs, not people; it stays
  that way.

## Order and why

1. **P1 + P2 (event paper)** — one PR: the flyer completes the
   poster pattern, the roster is the work-day artifact organizers
   will actually clip to a board.
2. **P3 + P5 + P6 (calendar, guide, tabs)** — one PR: three small
   surfaces on existing data.
3. **P4 (offline kit)** — one PR: the storm-hub story's physical
   artifact; carries the WiFi-credential threat-model amendment.
4. **P7 intake form + P8 chits** — designed above; built when the
   community says so.

Each lands with the standing gates: en/es parity, tests, real-
browser print-emulation screenshots, threat-model amendments where
named, and honest as-built notes back into this file.
