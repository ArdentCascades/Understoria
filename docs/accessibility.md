# Accessibility & Inclusive Design

> **Status:** founding draft. This document is the accessibility
> counterpart to `docs/threat-model.md` — it names what we owe
> to disabled members, what standard we hold ourselves to, what
> currently passes and fails, and how reviewers check for
> regressions on every PR.
>
> Per `docs/roadmap.md`, this work is **Agent 22 — Accessibility
> & Inclusive Design**, modelled on Agent 4 (Security & Opsec)
> rather than on a one-shot agent: it's a sustained discipline
> with audits, patterns, and ongoing PR review questions, not a
> feature to ship and forget.

---

## 1. Why this exists

`docs/political-education/README.md` already cites Mia Mingus and
Leah Lakshmi Piepzna-Samarasinha "on interdependence as a
precondition, not a fallback." Disability justice is not an
afterthought to the rest of the project's values — it is the
exact frame mutual aid was built in.

The README says one hour of help equals one hour of help,
regardless of the type of work. That principle falls apart if
members who would otherwise offer their labor (caregiving,
listening, organizing, technical help) can't use the app to
publish or claim it. Inaccessibility silently filters out
contributors who the rest of the project's values explicitly
include.

The threat model is explicit about protecting members under
retaliation risk. That population overlaps significantly with
disabled members, who often face compounded retaliation when
their labor or political activity becomes visible. Accessibility
and threat-model concerns share members; they share work.

## 2. Who this work serves

In rough priority order, by how often the relevant population
intersects with Understoria's intended users:

- **Blind and low-vision members** using screen readers (NVDA,
  JAWS, VoiceOver, TalkBack), magnifiers, and high-contrast modes.
- **Members with motor impairments** navigating without a mouse
  or with limited fine motor control: keyboard-only, switch
  control, voice control, large hit targets, no time-pressured
  interactions.
- **Members with cognitive disabilities** including ADHD,
  traumatic brain injury, chronic fatigue, brain fog from
  long-term illness: predictable navigation, plain language,
  no time-limited dialogues, no "engagement" patterns.
- **Members with hearing impairments** — relevant when E2E
  messaging ships (transcripts, no audio-only signals).
- **Members in low-bandwidth or low-power environments** —
  PWA offline-first design already helps; we keep it that way.

## 3. Standards floor

**WCAG 2.1 AA** is the floor. Anything that fails AA is a bug.
Specific implications for this codebase:

- **Color contrast:** 4.5:1 for body text, 3:1 for large text and
  UI components. Light *and* dark mode. The chip variants we use
  for category / urgency / status need contrast review.
- **Keyboard navigation:** every interactive surface reachable
  via Tab. Visible focus indicators. Logical tab order. No
  keyboard traps except intentional ones (modal focus traps).
- **Touch targets:** 44×44 CSS pixels minimum. The project's
  `touch-target` utility already enforces this in some places;
  it must apply everywhere a tap can happen.
- **Labels and names:** every form input has an associated
  `<label>` or `aria-labelledby`. Every button has an accessible
  name. Icon-only buttons get `aria-label`.
- **Status messages:** dynamic updates announced via
  `aria-live="polite"` or `role="status"`. Errors via
  `role="alert"`.
- **Semantic HTML:** lists are lists, headings are headings,
  sections are sections. `<div>` is the last resort.
- **No time-limited dialogs.** The toast system auto-dismisses
  for noise control but the action it acknowledges is already
  complete; nothing is lost if a user misses the toast.

**AAA** is aspirational, not required. 7:1 contrast in particular
often conflicts with the moss / canopy palette in dark mode; we
target AA contrast consistently and reach for AAA on critical
surfaces (lock screen, panic button) where the additional clarity
is worth the design constraint.

## 4. What we are not trying to do

- **We are not building a separate "accessibility mode."**
  Every member uses the same interface. A separate mode is a
  sign the primary interface failed the standards floor.
- **We are not trying to be everything to everyone.** WCAG AA
  is the bar; specialised assistive tech that goes beyond what
  AA describes (eye tracking calibration, BCIs, niche AAC
  workflows) is welcomed by design but not actively engineered
  for.
- **We are not promising perfection.** Accessibility is a
  practice with audits and follow-ups; specific known gaps live
  in §6.

## 5. Current state — what's already in place

Honest inventory of what passes today, based on a quick survey
of the codebase at the time this document was written. Not a
formal audit; the formal audit is one of the items in §6.

- **Touch targets** — most interactive elements use Tailwind's
  `touch-target` utility (44px). Bottom nav, post / project
  cards, action buttons.
- **Dark mode** — every UI surface has a `dark:` variant. Whether
  every variant clears 4.5:1 contrast is unverified.
- **i18n** — every user-facing string is in `i18n/locales/`,
  so a future right-to-left language drop-in is mechanically
  possible. RTL CSS hasn't been tested.
- **ARIA primitives** — `ToastContainer` has `aria-live="polite"`
  + `role="status"`. `AttentionSection` uses `aria-labelledby`.
  Form fields in PostForm / ProjectNew / Profile have associated
  `<label>` elements (mostly via `flex flex-col` wrapping). Tab
  groups use `role="tablist"` / `role="tab"` / `aria-selected`.
- **`role="alert"` on error messages** — most inline error
  surfaces have it. A few don't.
- **Semantic landmarks** — `<header>`, `<main>`, `<section>`,
  `<footer>` used in most pages. The bottom nav is a `<nav>`.
  `<main>` now has `id="main"` and `tabIndex={-1}` so it can
  be the target of the skip-to-content link.
- **Skip-to-content link** — `<SkipLink>` lives at the top of
  every layout. Visually hidden until it receives focus (first
  Tab on any page). WCAG SC 2.4.1.
- **`:focus-visible` baseline** — `index.css` gives every
  keyboard-focused element a 2px canopy-600 outline at 2px
  offset, in both light and dark mode.
- **Reduced-motion preference** — `index.css` has a
  `prefers-reduced-motion: reduce` media query that collapses
  every transition and animation to 0.01ms. Components that
  need JS-level awareness use the `useReducedMotion()` hook in
  `src/lib/a11y/`.
- **Lint coverage** — `eslint-plugin-jsx-a11y` runs in CI as a
  required step, scoped to a11y rules only. Findings block the
  build the same way type errors do. The plugin is scoped to
  the web workspace; the server has no JSX.
- **Reusable primitives** — `src/lib/a11y/` exports
  `getFocusableElements`, `nextFocusable`, `useFocusTrap`, and
  `useReducedMotion`.
- **`ConfirmDialog` focus management** — `useFocusTrap` wired in.
  Tab/Shift+Tab cycle within the dialog. The destructive action
  is the autofocus target on open. Focus restores to the
  previously-focused element on close. Esc dismisses (handler
  already existed). The backdrop is now visual-only — the
  dismiss paths are Esc and the Cancel button.
- **`BottomNav` keyboard navigation** — Tab moves into the nav
  as a unit; once inside, ArrowRight / ArrowLeft / Home / End
  move focus between items without re-traversing the document.
  The `aria-label` on the `<nav>` is the localized "Primary
  navigation" string rather than one of the items' labels.
- **`AttentionSection` `aria-live`** — the items list is
  `aria-live="polite"` + `aria-relevant="additions text"`. New
  items (a task you organize gets marked complete, an exchange
  is awaiting your confirmation) are announced when they
  appear, without interrupting whatever the screen reader is
  doing.
- **Color contrast on chip variants** — every chip / badge color
  pairing in the codebase (canopy / moss / amber / rose, light
  and dark, including translucent backgrounds composited over
  the card) is asserted against WCAG 2.1 AA 4.5:1 by
  `src/lib/a11y/palette-contrast.test.ts`. The audit shipped in
  PR 22.4 caught three failing pairings (archived chip light
  and dark, success toast dark) and they were fixed at the
  same time. New chip pairings must be added to that test
  before merge.
- **Sparkline per-day detail** — `ProjectSparkline` now renders
  a visually-hidden `<table>` with one row per day in the
  window (`Day` / `Hours`). Screen readers see both the summary
  (`aria-label` on the SVG) and the table; sighted users see
  only the curve. The table is wrapped in Tailwind's `sr-only`
  utility so it does not affect layout.

## 6. Known gaps (tracked work)

These are the items the next wave of Agent 22 surface PRs will
address. Each maps to a focused PR or a small bundle.

- **Body-text contrast survey** — the chip / badge audit covers
  pill backgrounds. A broader survey of body-text pairings on
  white card backgrounds (especially `text-moss-500`, which is
  used widely for secondary labels) against 4.5:1 has not yet
  been done.
- **Screen reader testing.** No one has driven the app with
  NVDA, VoiceOver, or TalkBack end-to-end. This is the gap most
  likely to surface things this audit missed.
- **Formal audit.** A surface-by-surface walk through every
  page with axe-core (or similar) and a screen reader,
  recording findings, is on the list.

## 7. Reusable patterns

Shipped in PR 22.2 — these live in `apps/web/src/lib/a11y/` and
`apps/web/src/components/SkipLink.tsx`.

- **`getFocusableElements(container)`** and **`nextFocusable(current,
  all, direction)`** — pure DOM helpers. The tab-cycle math is in
  one place so the hook stays small and the math is testable.
- **`useFocusTrap(ref, isOpen)`** — Tab/Shift+Tab containment
  inside the open container, initial focus on first focusable
  child, focus restoration on close. Esc handling is intentionally
  the caller's responsibility — different modals dismiss
  differently.
- **`useReducedMotion()`** — `prefers-reduced-motion: reduce`
  with live updates if the OS preference toggles.
- **`<SkipLink targetId="main" />`** — visually hidden until
  focused, becomes a real link that jumps past the layout chrome.
- **Global CSS floor in `index.css`** — a `:focus-visible`
  outline (already shipped pre-22.2) and a
  `prefers-reduced-motion: reduce` block that collapses every
  transition / animation to 0.01ms.

Still planned for future PRs:

- **`useAnnouncer()`** — for cases where an announcement needs
  to come from a non-rendered handler (e.g. confirming a task
  that navigates away). The toast system covers most needs; the
  announcer would be the dedicated text-only counterpart. Only
  add when a concrete use case appears that doesn't fit toasts.

## 8. Guidance for reviewers

When reviewing a pull request, ask:

1. **Keyboard.** Is every new interactive element reachable
   via Tab? Does the focus order make sense? Are there any
   keyboard traps that aren't intentional?
2. **Screen reader.** Does every new control have an accessible
   name? Are dynamic updates announced? Are landmarks
   (`<header>`, `<nav>`, `<main>`) used where they belong?
3. **Contrast.** Light and dark. The Tailwind config has the
   palette; if a chip uses an unusual color combination, spot-
   check it against the 4.5:1 floor.
4. **Touch targets.** 44×44 minimum on any tap surface.
5. **No time pressure.** Any new dialog, banner, or toast should
   either not auto-dismiss, or the auto-dismiss should be safe
   (the action it acknowledges is already complete).
6. **Status messages.** Dynamic content uses `aria-live`
   appropriately; errors use `role="alert"`.

If any answer is unclear, ask. The defaults often exclude.

## 9. Testing approach

- **Lint** — `eslint-plugin-jsx-a11y` in CI catches the most
  obvious mistakes (missing `alt`, button name, label
  association). Pending — landed in PR 22.2.
- **Automated runtime checks** — axe-core via vitest or a
  Playwright pass on every PR is on the table but adds CI time
  and a dependency; not in the v1 plan.
- **Manual screen reader pass** — at least one screen reader
  walkthrough per minor release (every ~2-3 PRs that touch a
  significant surface). Findings get filed as tracked gaps.
- **Keyboard-only pass** — same cadence as screen reader.
  Hands off the mouse; navigate every flow.
- **Pilot feedback** — when pilot members include disabled
  community members, their feedback is the ground truth. Code
  changes happen in response to specific reported friction, not
  hypothetical scenarios.

## 10. Review cadence

- **Per-PR:** the questions in §8 are part of code review,
  alongside the threat-model questions in `docs/threat-model.md`
  §8.
- **Per release:** manual screen reader + keyboard pass on any
  surface that changed.
- **Quarterly:** walk through this document. Anything still true?
  Anything new? Move resolved items from §6 (Known gaps) into
  §5 (Current state).
- **Annually:** consider a formal external audit if resources
  allow.

## 11. Sign-off

This document becomes "ratified" when at least one community
member who uses assistive tech as their primary access mode has
read it, called out anything that misses, and agreed it reflects
real concerns rather than abstract ones. Record their name and
the date below.

| Name / pseudonym | Access mode | Date |
|------------------|-------------|------|
| _pending_ | | |

---

*This document is version 0.1. Like the threat model it pairs
with, it isn't expected to be final — accessibility is a moving
target and so is this project. Redline, amend, improve.*
