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
| `ember-*` | **Reciprocity moments only.** Toast border on an exchange confirmation, "thank you sent" inline feedback, fulfilled-post banner, freshly-reached community milestone leaf in the Dashboard's canopy row (PR #82 — the community's reciprocity moment when a collective threshold is crossed). Never on a button, badge, status indicator, or category label. |

Dark mode: every `*-{50..200}` swaps to `*-{800..950}` and vice
versa. Verify WCAG AA contrast (4.5:1 body, 3:1 large text). The
existing `palette-contrast.test.ts` enforces both directions
programmatically — extend it when adding a new chip/badge pairing.

The toggle is a three-state preference (`system` / `light` / `dark`,
default `system`) on the Appearance section of Profile. Resolution
lives in `lib/theme.ts`; the inline script in `index.html` applies
the resolved class to `<html>` synchronously before first paint so
there's no flash of the wrong theme. Tailwind is configured for
class-based dark mode (`darkMode: "class"`).

## Text size

Three-step member preference (`default` / `larger` / `largest`,
default `default`) on the same Appearance section. Implemented as
a percentage on `<html>` font-size (`112.5%` / `125%`), so the
preference multiplies on top of the user's OS / browser default —
a member who already enlarged text system-wide gets a stacked
effect. Lives in `lib/textSize.ts`; the inline script applies the
class before first paint.

Because every rem-based size in the app scales together, **don't
use `text-[14px]` or `fontSize: "14px"` in new code**. Use one of
the five type-scale tokens above, or — for the rare micro-text
that doesn't fit them — a rem value like `text-[0.6875rem]`. The
audit grep is:

```
grep -rE 'text-\[[0-9]+px\]|fontSize:\s*"[0-9]+px"' apps/web/src
```

Touch targets stay at 44×44 by default; under `html.text-largest`
the `.touch-target` floor bumps to 52×52 so taps stay comfortable
relative to the upsized type.

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

## Accessibility hooks

- **`prefers-reduced-motion`** — every animation collapses to ~0ms.
  Already in `index.css`. New motion must honor it.
- **`prefers-contrast: more`** — decorative SVGs (leaf dividers,
  sprig ornaments, empty-state illustrations) are hidden. They
  carry no information; the accessible text does. Mark a decorative
  SVG with `data-decorative="true"` to opt it in.

## Brand lockup pattern

The "Understoria" wordmark appears in serif (`font-serif text-title`)
flanked by a `<Sprig>` on each side. Used sparingly — currently only
on `LockScreen` (the only canonical landing surface). Don't add it
to in-app pages; the page-title hierarchy already names where you
are.

## Member avatars (frozen algorithm)

`<MemberAvatar publicKey={...} size={...} />` renders a parametric
botanical illustration deterministically derived from a member's
Ed25519 public key — the avatar IS the public key in pictorial form.
Same key → same plant, every device, forever.

Four shape variants (sapling / leaf-cluster / sprig / branch) × leaf
count (3–7) × tilt × primary fill (canopy/moss/bark 500–700) × accent
fill × sprig decoration × leaf shape (round/elongated/scalloped) ×
rotation. Selection is by modulo on the first 8 bytes of the public
key. Lives in `lib/avatar.ts`.

**The algorithm is frozen.** Changing leaf-count modulo, palette
order, or shape ordering after members have started recognizing each
other by avatar breaks recognition trust the same way changing
display names would. Any future change requires a `docs/threat-model.md`
§7 entry and explicit governance discussion.

The avatar is information, not decoration: it identifies a member.
It does NOT carry `data-decorative="true"` and is NOT hidden under
`prefers-contrast: more`. The `aria-label` is the short-key
fingerprint (`shortKey()`) so screen-reader users get the same
identification handle sighted users get from the existing
`shortKey` chrome.

Display name is deliberately NOT in the derivation input — it's
mutable, and including it would tie avatar identity to a non-
canonical handle and would leak display-name entropy into the
visual. Public key only.
