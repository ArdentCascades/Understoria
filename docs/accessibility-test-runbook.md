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
- **Steps:** read-all to hear the member's name, trust state, and
  who trusts them. `Tab` to the "Vouch for this member" button and
  activate it.
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
