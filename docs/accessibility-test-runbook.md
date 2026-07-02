# Accessibility Test Runbook

> **Status:** founding draft. This runbook is the operational
> companion to `docs/accessibility.md`. That document names the
> standard and the inventory; this one is the script a human
> follows — with a screen reader, or with the mouse unplugged —
> to confirm the app actually clears the bar on real hardware.

---

## 1. Purpose & scope

`accessibility.md` §3 sets the floor: **WCAG 2.1 AA**, light and
dark, keyboard-reachable, named, contrasted. §6 names the gap
this runbook closes — "No one has driven the app with NVDA,
VoiceOver, or TalkBack end-to-end" — and §11 stays unratified
until a member who uses assistive tech as their primary access
mode has done exactly that. This runbook is how that member (or a
keyboard-only tester) runs the walkthrough without having to
reverse-engineer the flows first.

It **complements, does not replace, the static audit.** Lint
(`eslint-plugin-jsx-a11y`) and the contrast tests catch missing
names and failing color pairings before merge; they cannot tell
you whether a flow *makes sense* when heard linearly or driven by
Tab. That judgment is the point of this pass. A clean static
audit is a precondition for running this runbook, not a substitute
for it.

Run it per the §10 cadence: at least one screen-reader pass and
one keyboard-only pass per minor release, and a full pass before
asking a member to sign off on §11.

## 2. Test setup

You do not need every tool. One screen reader plus a keyboard-only
pass already surfaces most of what a static audit misses; the more
platforms covered, the higher the confidence. Build and serve the
app locally (`pnpm --filter @understoria/web dev`) and point the
browser at the dev URL, or test an installed PWA build.

The five navigation moves every tester needs: **next heading**,
**next landmark/region**, **next form field**, **read
everything from here**, and **activate the focused control**. The
per-tool commands below cover exactly those.

- **NVDA (Windows / Firefox).** Free from nvaccess.org. Start NVDA,
  then open Firefox. NVDA key is Insert (or Caps Lock in laptop
  layout). Next heading `H`; next landmark `D`; next form field
  `F`; read-all `Insert+↓`; activate `Enter` (or `Space` on
  buttons / checkboxes). Toggle browse vs. focus mode with
  `Insert+Space` — in browse mode the single-letter quick-nav
  keys work; in focus mode keystrokes pass through to inputs.

- **VoiceOver (macOS / Safari).** `Cmd+F5` to start. The VO
  modifier is `Control+Option` (written "VO"). Next heading
  `VO+Cmd+H`; next landmark `VO+Cmd+L` (or use the rotor: `VO+U`,
  arrow to "Landmarks"); next form control via the rotor's "Form
  Controls"; read-all `VO+A`; activate `VO+Space`. On **iOS /
  Safari**: triple-click the side button (once configured), then
  swipe right/left to move item-by-item, use the rotor (two-finger
  twist) to switch to Headings / Landmarks / Form Controls, and
  double-tap to activate.

- **TalkBack (Android / Chrome).** Enable in Settings →
  Accessibility, or hold both volume keys. Swipe right/left to move
  by element; set the reading control (swipe up-then-down) to
  Headings, Landmarks, or Controls to jump by type; read-all with
  the "Read from next item" / "Read from top" local-context menu
  (swipe up-then-right); double-tap anywhere to activate the
  focused element.

- **Keyboard-only (no AT).** Any browser, mouse physically set
  aside. `Tab` / `Shift+Tab` to move; `Enter` / `Space` to
  activate; arrow keys inside tab groups and the bottom nav;
  `Esc` to dismiss dialogs. The thing you are watching for is the
  **visible focus ring** (2px canopy outline, per §5) on every
  stop, and that focus never gets trapped anywhere it shouldn't.

## 3. Global checks (run once)

These behaviors are app-wide; verify them once rather than on every
page.

- [ ] **Skip link.** On first `Tab` from a fresh page load, the
      first thing focused is "Skip to content" (visually appears
      from off-screen). Activating it moves focus into `<main>`
      and the next `Tab` lands inside the page content, past the
      nav chrome.
- [ ] **Focus on route change.** Navigating to a new route moves
      focus to the page's main heading (or `<main>`), so a screen
      reader announces the new page rather than leaving focus on
      the link just clicked. *(PR #140 implements this.)*
- [ ] **Visible focus ring.** Every `Tab` stop shows the 2px
      canopy-600 outline, in both light and dark mode. No stop is
      silently focusable-but-invisible.
- [ ] **Reduced motion.** With OS "Reduce motion" on, smooth
      scrolls become instant — opening `/help#<fragment>` jumps
      rather than glides, and the conversation auto-scroll snaps to
      the latest message. *(These honor `useReducedMotion()` once
      the reduced-motion branches land.)*
- [ ] **Text size.** Profile → Appearance → Larger, then Largest:
      text scales everywhere with no clipping, overlap, or cut-off
      controls; touch targets stay comfortable (the floor bumps to
      52px at Largest).
- [ ] **Dark mode.** Profile → Appearance → Dark: every surface
      has a dark variant; nothing washes out below contrast.
- [ ] **Touch targets.** Every tap surface is at least 44×44 CSS
      px (52×52 at Largest text).

## 4. Per-page walkthroughs

Each block lists the **entry path**, the **steps** to exercise the
core task, and what correct output **sounds / behaves** like.
Heading and label text quoted below is the real shipped English
copy. Core flows — claim a need, post an offer, message someone,
vouch, create a project, vote on a proposal, redeem an invite,
onboard — are prioritized; the rest confirm the page is navigable.

### Welcome (onboarding)

- **Entry:** first launch after redeeming an invite, before a
  profile exists. Route `/welcome`.
- **Steps:** read-all through the step. `Tab` to the "A little
  about you" form fields (area, skills, availability), fill at
  least one, activate the primary button — "Next" on early steps,
  "Open the board" on the last.
- **Expected:** the step heading "A little about you" is
  announced; each field has a real label, not just placeholder
  text; the primary button reads its current label ("Next" /
  "Open the board") and activating the final one lands you on the
  board with focus on its heading.

### Board

- **Entry:** bottom nav "Board", or after onboarding. Route
  `/board`.
- **Steps:** confirm the "Needs" / "Offers" tabs are a tab group —
  `Tab` to it, then `←` / `→` between tabs. `Tab` to the "Search
  posts" field. On the Projects tab, reach the two filter selects.
  Arrow through the post list and activate one to open its detail.
- **Expected:** heading "Community board"; the tabs announce as a
  tablist named "Post types" with the selected tab marked
  selected; the search field announces "Search posts"; the two
  project filters announce "Filter projects by category" and
  "Filter projects by status" (their labels are `sr-only` —
  present to the screen reader, hidden visually; see §5);
  activating a card opens its detail.

### Dashboard

- **Entry:** bottom nav. Route `/dashboard`.
- **Steps:** read-all; jump by heading through the stat sections.
- **Expected:** heading "Community dashboard"; the totals
  ("Total hours exchanged" and the exchange count) read as plain
  text; section subheadings are real `<h2>`s, navigable by next-
  heading. No leaderboard-style ranking is implied (by design).

### PostDetail — claim a need (core flow)

- **Entry:** activate a "Need" card from the Board.
- **Steps:** read-all to hear the post title, type, hours, and who
  posted it. `Tab` to the claim action and activate it; in the
  confirm dialog, `Tab` cycles within the dialog only, the confirm
  button "Yes, claim it" is reachable, `Esc` cancels.
- **Expected:** the post title is the page `<h1>`; "Claim this
  post?" is announced when the dialog opens and focus is trapped
  inside it; confirming claims the post and the visible state
  updates to show it as claimed (a silent success — the result is
  on screen, see §5).

### PostForm — post an offer (core flow)

- **Entry:** the "post" affordance from the Board, choosing Offer.
  Route `/posts/new` (type Offer).
- **Steps:** confirm the Need / Offer toggle is a tab group
  (named "Post type"). `Tab` through title, description, estimated
  hours. Submit with a field empty to hear validation, then
  complete and submit.
- **Expected:** heading "Post an offer" (or "Post a need");
  every field has a label; an empty required field announces its
  inline error via `role="alert"`; on submit you land back on the
  board/your new post with no silent failure.

### Messages (list) & Conversation — message someone (core flow)

- **Entry:** bottom nav "Messages" (route `/messages`), or the
  "Message {name}" button on a member's profile.
- **Steps:** from the list, activate a conversation. In the
  thread: read-all through the bubbles, `Tab` to the message
  textarea, type, and submit. Try the in-conversation search field
  and step through matches.
- **Expected:** list heading "Messages"; opening a thread
  announces the conversation heading (the other member's name);
  the composer textarea has a label; sending shows your new bubble
  immediately (silent success — no "sent" announcement by design,
  see §5); the search field announces its name and match position
  ("n of m") updates as you step.

### MemberDetail — vouch (core flow)

- **Entry:** activate a member's name/avatar from a post, the
  board, or a conversation header. Route `/members/:key`.
- **Steps:** read-all to hear the member's name and trust state
  (qualitative only — no vouch counts or voucher roster, per the
  no-comparable-stats ruling). `Tab` to the "Vouch for this member"
  button and activate it.
- **Expected:** the member's display name is the `<h1>`; the
  "Vouch" section heading is navigable; the button announces
  "Vouch for this member"; if you can't vouch yet, the reason is
  spoken in place of the button (e.g. "you must be trusted
  first"); a successful vouch updates the visible trust state.
  Trust is binary — there is no numeric score to announce (§5).

### Invites — redeem / share an invite (core flow)

- **Entry:** "Your invites" from Profile or the Invites route.
  Redemption happens via the InviteAccept route from a shared link.
- **Steps (Invites page):** read-all; reach the generate/issue
  action and any per-invite status. **(InviteAccept):** open a
  share link, read-all, activate "Continue to the board".
- **Expected (Invites):** heading "Your invites"; issuing an
  invite opens the share sheet (silent success, §5); any error
  announces via `role="alert"`. **(InviteAccept):** heading
  "You've been invited" on a valid invite, or "This invite can't
  be used." with the reason announced when it's spent/invalid;
  "Continue to the board" is reachable and lands you in onboarding.

### Profile

- **Entry:** bottom nav. Route `/profile`.
- **Steps:** read-all; jump by heading through balance, the
  profile editor, invites, roles earned, and history. `Tab` to the
  gear in the header. Edit a field and save.
- **Expected:** heading "Your profile"; the gear announces "Open
  settings, link"; saving the editor shows a "Saved" timestamp
  (silent success, §5); the invite copy/reveal status announces
  politely ("Copied") via its live region; the trust chip reads as
  trusted / not trusted, not a number (§5).

### Settings

- **Entry:** the gear on Profile, or route `/settings`.
- **Steps:** read-all; jump by heading through Language,
  Appearance (theme / text size / density), Community Node,
  Security, Data export. Operate each control by keyboard.
- **Expected:** heading "Settings"; each group is an `<h2>`;
  radio groups (theme, text size) announce their options and
  selected state; toggles announce on/off; changing a setting
  takes effect immediately (e.g. dark mode flips live).

### ProjectNew — create a project (core flow)

- **Entry:** the "start a project" affordance, or route
  `/projects/new`.
- **Steps:** read-all; `Tab` through title, description, tags
  ("garden, tool-library"). Note the templates aside is a labelled
  region. Submit empty to hear validation, then complete and
  submit.
- **Expected:** heading "Start a project"; the templates aside
  announces as a named region; required-field errors announce via
  `role="alert"`; choosing a template announces its applied state
  (`role="status"`); submitting lands on the new project's detail.

### ProjectDetail

- **Entry:** activate a project card from the Board, or after
  creating one. Route `/projects/:id`.
- **Steps:** read-all; jump by heading; reach the task list and
  its search field; exercise a task action (claim / acknowledge).
- **Expected:** the project title is the `<h1>`; the sidebar is a
  named region; the task search announces its label; task and
  announcement updates surface via `role="status"` regions; the
  sparkline exposes a visually-hidden per-day table to the screen
  reader (per §5 of accessibility.md).

### ProjectArchive

- **Entry:** the archive link from a project or projects view.
  Route `/projects/archive`.
- **Steps:** read-all; arrow through the archived list.
- **Expected:** heading "Project archive"; archived items read as
  a list; the archived chips meet contrast (verified by the
  palette test) in both modes.

### Proposals — vote on a proposal (core flow)

- **Entry:** Proposals route, or the Proposals section on Profile.
  Route `/proposals`.
- **Steps:** confirm the filter tabs are a tab group. Open a
  proposal, read-all, and cast a vote — "Affirm", "Block", or
  "Abstain"; if blocking, fill the reason. Change your vote.
- **Expected:** heading "Proposals"; the filters announce as a
  tablist; the vote tally heading updates ("n members have weighed
  in") via a `role="status"` region; your current vote is spoken
  ("Your current vote: …") and changing it is reachable; a block
  reason field announces validation if left empty.

### ProposalNew — start a proposal

- **Entry:** the "start a proposal" action from Proposals. Route
  `/proposals/new`.
- **Steps:** read-all; `Tab` through title, description, and the
  impact fields (year-one, five-year, reversal path). Submit empty
  to hear validation, then complete.
- **Expected:** heading "Start a proposal"; each field labelled;
  empty required fields announce via `role="alert"`.

### Disputes

- **Entry:** the Disputes section on Profile, or route
  `/disputes`.
- **Steps:** read-all; jump by heading; open a dispute and
  exercise its action.
- **Expected:** heading "Disputes"; dispute items read as a list;
  state changes and errors announce via the appropriate live
  region.

### Help

- **Entry:** the Help link, or a deep link like
  `/help#confirm-exchange`. Route `/help`.
- **Steps:** read-all; jump by heading through the FAQ sections;
  open the page with a `#fragment` to test the scroll handler.
- **Expected:** heading "Common questions"; each FAQ section is a
  named `<section>` with an `<h2>`; a fragment link scrolls the
  matching section into view (instantly under reduced motion, §3).

### NotFound

- **Entry:** any unrecognized URL.
- **Steps:** read-all; reach the back-to-safety link.
- **Expected:** the lone `<h1>` "This page isn't here" is
  announced; the recovery link is reachable and named; tone is
  calm, no dead end.

### Bottom navigation (every viewport)

- **Entry:** any route. The bottom nav is global.
- **Steps:** `Tab` into the nav (or jump by landmark to the
  `<nav>`), then arrow between tab buttons. Resize the viewport
  from 320px to desktop; on iOS Safari, scroll a long page and
  check that the nav stays pinned to the bottom edge through the
  URL-bar resize. *(PR #185 made the labels always visible — they
  no longer collapse to icon-only below `sm`. PR #201 pins the
  nav to the viewport on mobile via `fixed` + an
  `env(safe-area-inset-bottom)` pad so it clears the iPhone home
  indicator.)*
- **Expected:** every tab announces its name plus icon decoration
  (`aria-hidden` on the glyph); the selected tab announces
  selected; labels stay rem-based and scale with the text-size
  preference; the home-indicator zone never sits under a tap
  target.

### Calendar (Calendar tab)

- **Entry:** bottom nav "Calendar", route `/calendar`.
- **Steps:** confirm the three view buttons (Agenda / Month /
  Week) are a tab group — arrow between them. Reach the filter
  row (category select, project select, "Mine" toggle, "Events
  only" toggle). On Agenda, jump by heading through the day
  groups; activate an event marker to open its detail. From the
  page, reach the **Create event** FAB.
- **Expected:** heading "Calendar"; the view tabs announce as a
  tablist with the selected view marked selected; each filter
  has a real label; day headings are real `<h2>`s; activating an
  event marker lands on the event detail page with focus on its
  heading; the FAB announces "Create event" and is reachable by
  Tab.

### EventDetail — RSVP (core flow)

- **Entry:** activate an event marker from the Calendar or follow
  a deep link. Route `/events/:id`.
- **Steps:** read-all to hear the title, organizer, time,
  location, category, capacity, and current RSVP count (or the
  "not visible from this node" affordance on peer-node views).
  `Tab` to the RSVP control; activating it expands the
  informed-consent card. From inside the card pick Going,
  Maybe, Not going, or Cancel. If the event is cancelled, the
  cancellation banner announces ahead of the body content.
- **Expected:** the event title is the page `<h1>`; the
  organizer pubkey reads as a link to their MemberDetail; the
  RSVP card's visibility-tier explanation is read linearly
  before the four action buttons; switching to **Not going**
  removes the visible name without announcing a delta; on a
  cancelled event the banner ("Cancelled: …" plus the optional
  reason) is the first thing announced.

### Settings → Blocked contacts (tap-to-reveal)

- **Entry:** the gear on Profile → Blocked contacts. Route
  `/settings#blocked-contacts`.
- **Steps:** read-all through the panel; each row in the active
  block list and the Previously-blocked subsection renders
  obscured by default. `Tab` to a row and activate it to reveal
  the display name and truncated pubkey; activate again to
  re-obscure. Operate the per-row `hideGovernance` toggle and the
  Unblock button (which opens a ConfirmDialog). Reach the
  **Clear unblocked history** button at the foot of the
  Previously-blocked subsection.
- **Expected:** each obscured row announces its accessible name
  as "Blocked contact" plus the block date; tap-to-reveal swaps
  the name + key into the row without losing focus; the
  `hideGovernance` toggle announces on/off and changes governance
  filtering live; Unblock fires a confirm dialog with focus
  trapped inside; the clear-history button is named and gated
  by its own confirm dialog. The cross-device fine-print note
  at the foot of the panel is read inline.

### MemberDetail — block confirmation (core flow)

- **Entry:** open another member's profile (route
  `/members/:key`) and reach the **Block contact** button.
- **Steps:** activate Block contact; the comparison card opens
  with focus trapped inside. Read-all to hear "What this means"
  and "What this does NOT mean" rows; reach the **Also hide their
  governance contributions from me** checkbox; reach the
  optional private-note field; activate **Block contact** or
  **Cancel**.
- **Expected:** the card heading announces the target name; the
  two comparison columns read as labeled regions; the checkbox
  announces its current state; the note field is a labelled
  `<textarea>`; confirming completes silently (the button
  returns to the page state where the affordance is replaced
  with **Unblock** — same self-explanatory shape as other silent
  successes per §5).

### Welcome — invite-only landing (when enabled)

- **Entry:** open the PWA at `/welcome` on a node where
  `nodeConfig.inviteOnly` is enabled and the local members table
  is not empty. (PR #202.)
- **Steps:** read-all through every concept slide, then arrive
  at the final step. Confirm that the page is a deliberate
  dead-end: no profile-setup form, no "Get started" button — a
  short message explaining the node is invite-only and pointing
  at the invite-redemption flow.
- **Expected:** every concept slide is reachable and announced
  the same way as the open-onboarding flow; the final step's
  heading reads as the page-level landmark and the body explains
  the gate plainly; tab order ends at the heading / body with no
  invisible focusable controls; on a fresh node where the
  members table is empty, the first-member bootstrap exception
  fires and the standard profile-setup step renders instead
  (this is the operator's own onboarding path).

### AttentionSection — emoji prefixes per item kind

- **Entry:** the AttentionSection rail on Board / Dashboard.
- **Steps:** read-all through the rail. Each item kind now
  renders a leading emoji glyph keyed to the kind (PR #200).
- **Expected:** each glyph is wrapped in `aria-hidden="true"` so
  the screen reader reads the row's accessible name (the
  attention-item copy) without doubling up on the glyph; the
  glyph is purely a sighted scanning aid. Confirm on every kind
  that appears in your local data (project deadlines, post
  expiries, exchanges awaiting confirm, the event_today /
  event_cancelled / event_capacity_reached kinds).

### Dashboard title at Large / Largest text size

- **Entry:** Profile → Appearance → Text size → Largest, then
  navigate to Dashboard.
- **Steps:** the page title "Community dashboard" should wrap
  cleanly at the larger sizes without clipping, scrolling
  horizontally, or hiding behind the Sprig flanking ornament.
  (PR #184 added the wrap path; before that the title held
  `whitespace-nowrap` and overflowed on mobile at Largest.)
- **Expected:** the `<h1>` wraps onto two lines without losing
  the Sprig ornaments; the heading still announces as a single
  `<h1>` to the screen reader; touch targets nearby remain at
  the 52×52 floor that Largest enforces.

### Offline banner + outbox transparency

- **Entry:** any page; toggle the device offline (airplane mode,
  or DevTools → Network → Offline).
- **Steps:** confirm the offline banner appears at the top of the
  shell with the queued-changes count when there is work in the
  outbox (PR #220). Post a need or claim a task while offline;
  the count should tick up. Restore connectivity; the banner
  and count should clear once the outbox drains.
- **Expected:** the banner is a discrete landmark / live region
  announcing "You're offline" once on transition; the count
  updates politely (no live-region storm); the banner has
  sufficient contrast in both themes; dismissing connectivity
  again re-announces.

### Service-worker update prompt

- **Entry:** a build is deployed while the PWA is open. Simulate
  by registering an updated SW in DevTools, or revisit the
  promoted build after a fresh deploy.
- **Steps:** the update prompt (PR #219) surfaces with a
  one-line "A new version is available" message and a Reload
  button. Confirm it's reachable by keyboard and by screen
  reader; that focus is *not* stolen (a member mid-typing
  should not lose their input); that dismissing leaves the
  rest of the UI usable.
- **Expected:** announces once via a polite live region; the
  Reload button is a normal button (44×44 touch target);
  dismissing is non-destructive.

### Reorder task modal (ProjectDetail)

- **Entry:** ProjectDetail as an organiser or co-organiser, with
  at least three tasks. Open the Reorder modal (PR #215).
- **Steps:** confirm the modal opens with focus on its first
  control; the task list inside is keyboard-reorderable (Move
  up / Move down per row); a screen reader announces each
  reorder via the existing live region the page uses for drag
  reorders. Close the modal; focus should return to the
  affordance that opened it.
- **Expected:** focus trapped inside while open; Escape closes;
  Move buttons disabled at the ends with `aria-disabled="true"`;
  every row has a 44×44 touch target; the screen-reader announce
  reads "Moved <task title> up to position N of M" or analogous.

### Conversation header kebab menu

- **Entry:** a conversation in Messages (PR #211).
- **Steps:** open the **⋮** menu at the top of the conversation.
  Confirm it's reachable by keyboard (visible focus ring on the
  trigger; arrow keys / Enter navigate the menu items); that
  Block / Unblock are clearly labelled; that the menu closes on
  Escape and returns focus to the trigger.
- **Expected:** `aria-haspopup="menu"` / `aria-expanded` on the
  trigger; menu items are real `<button>`s; the empty-state copy
  for a fresh conversation is descriptive ("No messages yet —
  say hi") rather than the older blank pane.

### Conversation Messages reactivity to blocks

- **Entry:** Messages with a blocked contact (PR #213).
- **Steps:** block a contact from another surface (their member
  profile, or Settings → Blocked contacts) while the Messages
  page is open. The Messages list should update without a manual
  refresh — the blocked contact's thread should disappear.
- **Expected:** the list re-renders within a tick of the Dexie
  write; no stale entries linger; the live region (if any)
  announces nothing about the block (the silent-success
  discipline in §5 applies).

### Co-organiser capability disclosure card

- **Entry:** ProjectDetail as a primary organiser, with a
  co-organiser invite issued or accepted (PR #224).
- **Steps:** the capability card enumerates what a co-organiser
  can do. Confirm headings are real heading levels; the list is
  a real `<ul>`; the acceptance pointer (visible to the
  invitee in the invitation card) links into the same
  enumeration.
- **Expected:** screen-reader announces the heading + list;
  contrast meets AA at both themes; the card's expand /
  collapse (if any) uses `aria-expanded`.

### Confirm-task dialog (debit naming)

- **Entry:** ProjectDetail or PostDetail at the moment of
  confirming a completion (PR #237).
- **Steps:** tap Confirm. A dialog appears naming the debit
  ("Confirming credits <helper> with <hours> hours; the same
  amount comes from your balance"). Confirm the dialog is
  focus-trapped, Escape cancels, the confirm action is the
  default (Enter activates), and the cancel action is reachable
  by keyboard.
- **Expected:** `role="dialog"` with `aria-modal="true"`,
  `aria-labelledby` / `aria-describedby` pointing at the title
  and the debit-naming body; focus returns to the Confirm
  button on close.

### Exchange state narrative + disputed pointer (PostDetail)

- **Entry:** a PostDetail page across the four exchange states
  (claimed → awaiting confirm → confirmed → disputed) (PRs #226,
  #232).
- **Steps:** for each state, confirm the page narrates the state
  in plain language above the affordances ("This exchange is
  awaiting your confirmation" etc.). When disputed, an
  operational pointer links to the disputes surface and explains
  the next step.
- **Expected:** the narrative is a real heading or paragraph
  (not a status chip alone); the disputed pointer is a real
  link with discernible text; the link has a visible focus
  ring; contrast at AA in both themes.

### PWA install + iOS splash screens

- **Entry:** Safari on iOS (or any browser supporting Add to
  Home Screen). PRs #223 and #231.
- **Steps:** confirm Add to Home Screen produces a PNG-icon-
  launching standalone PWA. Cold-launch the installed PWA on
  iOS and confirm an apple-touch-startup-image splash renders
  in place of a white flash. Repeat at portrait / landscape and
  across the supported device buckets.
- **Expected:** icon resolution is crisp at every iOS launcher
  size; the splash uses canopy colours that match the brand;
  no white-flash at cold start; no console error about a missing
  manifest icon.

### Linkified URLs in comments / descriptions

- **Entry:** a task comment, event description, or post
  description containing one or more URLs (PR #275 — the
  linkify pass).
- **Steps:** URLs render as real `<a>` elements with discernible
  text (the URL itself) and the platform's external-link
  behaviour (target / rel). A screen reader should announce them
  as links; keyboard tab order should include them.
- **Expected:** `rel="noopener noreferrer"` on cross-origin
  links; no surrounding bare text loses meaning when the link
  is announced; the linkified copy stays selectable and
  copy-pasteable.

### Settings → Blocked contacts — tap-to-reveal (verification)

- **Entry:** Settings → Blocked contacts with at least one
  blocked member.
- **Steps:** each row renders obscured by default (generic
  avatar, "Blocked contact", date). Tap the row to reveal the
  display name + truncated pubkey; tap again to re-obscure.
- **Expected:** the row is a real button (keyboard-activatable);
  `aria-pressed` reflects the revealed / obscured state; the
  per-block hide-governance toggle and the Unblock affordance
  remain reachable in both states. See also §4 PR #197 entry
  above.

## 5. Known design-judgment items (do NOT flag these as bugs)

These are intentional. Recording them as findings creates noise;
note them only if you think the *reasoning* is wrong.

- **Silent successes where the result is visible.** Sending a
  message shows the bubble; saving the profile shows a "Saved"
  timestamp; generating an invite opens the share sheet. The
  outcome is on screen, so there is deliberately no extra
  announcement to interrupt the reader.
- **`sr-only` labels on the Board filter selects are intentional
  and compliant.** "Filter projects by category" / "…by status"
  are present to the screen reader and hidden only visually. This
  is the correct pattern, not a missing visible label.
- **No read receipts, no typing indicators, no presence.** These
  are deliberate privacy choices, not missing features. Do not
  report their absence as an accessibility gap.
- **Trust is binary by design.** A member is trusted or not;
  there is no numeric trust score to announce. The trust chip
  reads its state, and that is the whole signal.

## 6. Findings log + sign-off

Record one row per real issue. "Severity" uses Blocker (fails a
core flow) / Serious (fails AA but a workaround exists) / Minor
(rough edge, AA still met).

| Page | AT | Issue | Severity | Notes |
|------|----|-------|----------|-------|
|      |    |       |          |       |

When the pass is complete and a member who uses assistive tech as
their primary access mode has confirmed the app reflects real
concerns rather than abstract ones, copy their entry into the §11
sign-off block in `accessibility.md`:

| Name / pseudonym | Access mode | Date |
|------------------|-------------|------|
| _pending_ | | |

---

*Version 0.1. Pairs with `docs/accessibility.md`; revise both
together when flows change.*
