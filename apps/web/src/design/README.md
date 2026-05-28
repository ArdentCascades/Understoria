<!--
Understoria — Federated mutual aid timebank
Copyright (C) 2026 Understoria Contributors
SPDX-License-Identifier: AGPL-3.0-or-later
-->

# Understoria design tokens

This is the one-page reference for the visual system. If you're
adding UI, read this first — using the tokens consistently is what
keeps the interface feeling unified.

## North star

A pilot user opens Understoria and feels: *quiet woodland, generous
space, made by humans for humans, nothing demanding my attention.*
Beauty comes from craft — typography, whitespace, identity, restraint
— never from saturation, motion-for-its-own-sake, or competitive
signal.

## Ethos guardrails

Apply to every visual change. These are non-negotiable.

- **No color carries rank or judgment.** Red is not "bad," green is
  not "good," ember is not "winning." Reserve the ember accent for
  *reciprocity moments* (a thank-you, a fulfilled need, an exchange
  accepted) — never status, urgency, or ranking.
- **No motion celebrates an individual.** Animations exist for
  *shared* milestones (community totals) and orientation (fade-in on
  route changes). They never single out a person's achievement.
- **No leaderboard, podium, trophy, fire, streak, or up-and-to-the-
  right chart imagery.** Plants, hands, shared objects, paths, weather.
- **Respect `prefers-reduced-motion` and `prefers-contrast`.** The
  base rule is already in `index.css`; new motion must honor it.
- **AGPL-licensed assets only.** Drawn in-house or pulled from a
  permissive source (CC0, public domain) with attribution.

## Color tokens

| Token | When to use |
| --- | --- |
| `canopy-*` | Primary brand. Buttons, focus rings, page-title text. |
| `moss-*` | Backgrounds, borders, secondary text. The workhorse. |
| `bark-*` | Warm neutral. Body text, soft borders, dividers. Pairs with moss/canopy without introducing a second hue. |
| `ember-*` | **Reciprocity moments only.** Toast border on an exchange confirmation, "thank you sent" inline feedback, fulfilled-post banner. Never on a button, badge, status indicator, or category label. |

Dark mode: every `*-{50..200}` swaps to `*-{800..950}` and vice
versa. Verify WCAG AA contrast (4.5:1 body, 3:1 large text).

## Type scale

Five steps. Don't use Tailwind's default `text-xl`/`text-2xl`/etc.
in new code — use these instead.

| Token | Usage |
| --- | --- |
| `text-display` (2.25 rem, serif) | One per page — the page title. |
| `text-title` (1.5 rem) | Section heading inside a page. |
| `text-heading` (1.125 rem) | Card heading. |
| `text-body` (1 rem) | Default body copy. |
| `text-caption` (0.8125 rem) | Meta, timestamps, helper text. |

**Serif rule:** `font-serif` is reserved for the page-level title
(`text-display`). Everywhere else uses `font-sans`. The single serif
anchor per page gives each route a quiet identity without designer'd
stylistic overload.

**Weight rule:** prefer `font-semibold` over `font-bold` for
emphasis. The display title doesn't need a weight class — the serif
and size carry hierarchy.

## Spacing rhythm

Use the `stack-*` tokens for vertical rhythm so spacing is
consistent across pages.

| Token | rem | Typical use |
| --- | --- | --- |
| `stack-xs` | 0.5 | Tight inline pairs (icon + label) |
| `stack-sm` | 0.75 | Inside a card |
| `stack-md` | 1.25 | Between cards in a list |
| `stack-lg` | 2 | Between sections on a page |
| `stack-xl` | 3 | Above/below a page title |

These work anywhere Tailwind spacing works: `space-y-stack-md`,
`gap-stack-sm`, `p-stack-md`, `mt-stack-lg`.

## Card chrome

The `.card` component class (defined in `index.css`) is the canonical
card surface. Uses `shadow-leaf` (soft canopy-tinted dual-layer
shadow) and `border-bark-200/60` for a warmer edge.

## Utility classes

Two component utility classes save you from re-typing the recipe at
every callsite:

- **`.page-title`** — applied to the single `<h1>` per page.
  Resolves to `font-serif text-display text-canopy-900` (+ dark-mode
  swap). Don't use for user content (post titles, project titles,
  member names) — those stay sans-serif because they're not the
  page's name, they're user data.
- **`.section-title`** — applied to section-level headings inside a
  page. Resolves to `text-title font-semibold tracking-tight` (+
  dark-mode swap). Use sparingly; many "section" headings are
  actually card headings (use `text-heading` directly there).

## What lives here next

- Workstream A (botanical identity) adds inline-SVG icon and
  illustration components under `src/components/visual/`.
- Workstreams B–D apply these tokens across pages and components.
  Until those PRs land, the tokens defined here are available but
  largely unused — that's intentional. Foundation first, application
  second.
