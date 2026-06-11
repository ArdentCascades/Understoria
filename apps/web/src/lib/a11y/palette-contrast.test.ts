/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, it } from "vitest";
import { AA_LARGE, AA_NORMAL, composite, contrastRatio, parseHex } from "./contrast";

// Programmatic audit: every chip / badge color pairing in the
// codebase, asserted against WCAG 2.1 AA (4.5:1 for normal text).
// Future PRs that change a chip color or introduce a new pairing
// must run this test before merge; the lint plugin (a11y rules)
// doesn't catch contrast — only this test does.
//
// The pairings below were collected via:
//   grep -rohE 'bg-(moss|canopy|amber|rose)-[0-9]+ text-...'
//
// When adding a new chip/badge in code, mirror it here.

// Project palette from tailwind.config.js.
const CANOPY = {
  50: "#f0fdf4",
  100: "#dcfce7",
  200: "#bbf7d0",
  300: "#86efac",
  400: "#4ade80",
  500: "#22c55e",
  600: "#16a34a",
  700: "#15803d",
  800: "#166534",
  900: "#14532d",
  950: "#052e16",
};
const MOSS = {
  50: "#f5f7f3",
  100: "#e7ede1",
  200: "#cfdbc4",
  300: "#adc09e",
  400: "#87a275",
  500: "#688657",
  600: "#506b43",
  700: "#3f5537",
  800: "#34452e",
  900: "#2c3a28",
  950: "#161f13",
};
// Standard Tailwind defaults for amber + rose (we don't override
// these in tailwind.config.js).
const AMBER = {
  50: "#fffbeb",
  100: "#fef3c7",
  200: "#fde68a",
  800: "#92400e",
  900: "#78350f",
  950: "#451a03",
};
const ROSE = {
  50: "#fff1f2",
  100: "#ffe4e6",
  200: "#fecdd3",
  800: "#9f1239",
  900: "#881337",
  950: "#4c0519",
};

// In light mode, chips sit on the card's white background — opacity
// is rarely used because the colors are already light. In dark mode,
// chips often have an opacity suffix like `bg-amber-950/40`, which
// composites over the card's `moss-900` background. The base for
// compositing matters: if the chip ever sits directly on the page
// (no card), the base would be `moss-950`, but no current chip
// pairing in the codebase does that.
const DARK_BG_BASE = parseHex(MOSS[900]);

interface Pairing {
  label: string;
  fg: string;
  bg: string;
  /** 0–1. Default 1 (fully opaque). When < 1, bg is composited
   *  over `DARK_BG_BASE` before computing contrast. */
  alpha?: number;
}

const LIGHT_PAIRINGS: Pairing[] = [
  { label: "amber-50 / amber-800 (post status: disputed light)", fg: AMBER[800], bg: AMBER[50] },
  { label: "amber-100 / amber-800 (urgency high light)", fg: AMBER[800], bg: AMBER[100] },
  { label: "canopy-50 / canopy-700 (chip light, attention items)", fg: CANOPY[700], bg: CANOPY[50] },
  { label: "canopy-50 / canopy-800 (chip light)", fg: CANOPY[800], bg: CANOPY[50] },
  { label: "canopy-50 / canopy-900 (chip light)", fg: CANOPY[900], bg: CANOPY[50] },
  { label: "canopy-100 / canopy-800 (project momentum: humming)", fg: CANOPY[800], bg: CANOPY[100] },
  { label: "canopy-100 / canopy-900 (project status: completed light)", fg: CANOPY[900], bg: CANOPY[100] },
  { label: "canopy-700 / canopy-50 (primary button)", fg: CANOPY[50], bg: CANOPY[700] },
  { label: "moss-50 / moss-600 (project momentum: planning / paused / archived light)", fg: MOSS[600], bg: MOSS[50] },
  { label: "moss-100 / moss-600 (subtle chip)", fg: MOSS[600], bg: MOSS[100] },
  { label: "moss-100 / moss-700 (status chip light)", fg: MOSS[700], bg: MOSS[100] },
  { label: "moss-700 / moss-50 (secondary chip)", fg: MOSS[50], bg: MOSS[700] },
  { label: "rose-50 / rose-800 (error inline)", fg: ROSE[800], bg: ROSE[50] },
  { label: "rose-100 / rose-800 (caution button alt)", fg: ROSE[800], bg: ROSE[100] },
];

const DARK_PAIRINGS: Pairing[] = [
  // Translucent backgrounds — composited over moss-900.
  { label: "amber-900/40 / amber-200 (post status: disputed dark)", fg: AMBER[200], bg: AMBER[900], alpha: 0.4 },
  { label: "amber-950/40 / amber-100 (project momentum: stalled dark)", fg: AMBER[100], bg: AMBER[950], alpha: 0.4 },
  { label: "canopy-900/40 / canopy-200 (toast: active dark)", fg: CANOPY[200], bg: CANOPY[900], alpha: 0.4 },
  { label: "canopy-900/60 / canopy-100 (project momentum: humming dark)", fg: CANOPY[100], bg: CANOPY[900], alpha: 0.6 },
  { label: "canopy-950/40 / canopy-100 (attention item dark, post dark)", fg: CANOPY[100], bg: CANOPY[950], alpha: 0.4 },
  { label: "canopy-950/50 / canopy-100 (chip dark)", fg: CANOPY[100], bg: CANOPY[950], alpha: 0.5 },
  { label: "moss-900/40 / moss-300 (project momentum: planning / paused / archived dark)", fg: MOSS[300], bg: MOSS[900], alpha: 0.4 },
  { label: "moss-900/60 / moss-100 (status chip dark)", fg: MOSS[100], bg: MOSS[900], alpha: 0.6 },
  { label: "rose-900/40 / rose-200 (rose alt dark)", fg: ROSE[200], bg: ROSE[900], alpha: 0.4 },
  { label: "rose-950/40 / rose-100 (error inline dark)", fg: ROSE[100], bg: ROSE[950], alpha: 0.4 },
  { label: "rose-950/40 / rose-200 (error inline dark alt)", fg: ROSE[200], bg: ROSE[950], alpha: 0.4 },
  // Fully opaque dark backgrounds.
  { label: "canopy-700 / canopy-50 (toast success dark, primary button dark)", fg: CANOPY[50], bg: CANOPY[700] },
  { label: "moss-700 / moss-50 (toast info dark)", fg: MOSS[50], bg: MOSS[700] },
  { label: "moss-800 / moss-200 (status chip dark)", fg: MOSS[200], bg: MOSS[800] },
  { label: "moss-900 / moss-300 (default text on card dark)", fg: MOSS[300], bg: MOSS[900] },
  { label: "moss-950 / canopy-200 (bottom nav: active dark)", fg: CANOPY[200], bg: MOSS[950] },
];

function ratioFor(p: Pairing): number {
  const fg = parseHex(p.fg);
  const bgRaw = parseHex(p.bg);
  const bg = p.alpha === undefined || p.alpha === 1
    ? bgRaw
    : composite(bgRaw, p.alpha, DARK_BG_BASE);
  return contrastRatio(fg, bg);
}

describe("palette contrast — light mode", () => {
  for (const p of LIGHT_PAIRINGS) {
    it(`${p.label} clears AA normal (${AA_NORMAL}:1)`, () => {
      const r = ratioFor(p);
      expect(
        r,
        `${p.label} → ${r.toFixed(2)}:1 (need ≥ ${AA_NORMAL}:1)`,
      ).toBeGreaterThanOrEqual(AA_NORMAL);
    });
  }
});

describe("palette contrast — dark mode (composited over moss-900)", () => {
  for (const p of DARK_PAIRINGS) {
    it(`${p.label} clears AA normal (${AA_NORMAL}:1)`, () => {
      const r = ratioFor(p);
      expect(
        r,
        `${p.label} → ${r.toFixed(2)}:1 (need ≥ ${AA_NORMAL}:1)`,
      ).toBeGreaterThanOrEqual(AA_NORMAL);
    });
  }
});

// Secondary / muted body text on dark backgrounds. Historically the
// codebase used `text-moss-500` (and a few `dark:text-moss-400`
// overrides) for timestamps, hints, section eyebrows, and other
// meta — never formally measured. The audit:
//
//   • moss-500 on moss-900 (card)  → 2.95:1  FAIL
//   • moss-500 on moss-950 (page)  → 4.14:1  FAIL
//   • moss-400 on moss-900 (card)  → 4.28:1  FAIL (just under)
//   • moss-400 on moss-950 (page)  → 6.01:1  PASS
//   • moss-300 on moss-900 (card)  → 6.20:1  PASS  ← chosen
//   • moss-300 on moss-950 (page)  → 8.72:1  PASS  ← chosen
//
// Every dark-mode muted-text class in the codebase is now one of
// the rows below; this block keeps it that way. When you add a new
// muted dark-mode pairing, mirror it here.
//
// The two dark backgrounds in use:
//   • moss-950 — page background (under bottom nav, calendar cells,
//                attention rail pill backgrounds at /40)
//   • moss-900 — `.card` background, the dominant surface
//
// Per accessibility.md §6, this closes the body-text contrast gap
// for secondary labels.
const DARK_BG_PAGE = MOSS[950];
const DARK_BG_CARD = MOSS[900];

interface SecondaryPairing {
  label: string;
  fg: string;
  bg: string;
  /** When set, this pairing is allowed to clear only AA_LARGE (3:1)
   *  because it is only ever rendered at ≥ 24px regular / ≥ 18.66px
   *  bold. Include the rendered context as justification. */
  largeTextOnly?: string;
}

const SECONDARY_DARK_PAIRINGS: SecondaryPairing[] = [
  // The new default for secondary text in dark mode. Used by every
  // `text-moss-600 dark:text-moss-300` call site (the light half was
  // `text-moss-500` until the light-mode survey below found it under
  // AA and the sweep moved it to moss-600).
  { label: "moss-300 / moss-900 (secondary text on card)", fg: MOSS[300], bg: DARK_BG_CARD },
  { label: "moss-300 / moss-950 (secondary text on page)", fg: MOSS[300], bg: DARK_BG_PAGE },
  // Other muted shades still in active use after the audit.
  { label: "moss-400 / moss-950 (bottom-nav inactive, dialog meta)", fg: MOSS[400], bg: DARK_BG_PAGE },
  { label: "moss-200 / moss-900 (body emphasis on card)", fg: MOSS[200], bg: DARK_BG_CARD },
  { label: "moss-200 / moss-950 (body emphasis on page)", fg: MOSS[200], bg: DARK_BG_PAGE },
  { label: "moss-100 / moss-900 (primary text on card)", fg: MOSS[100], bg: DARK_BG_CARD },
  { label: "moss-100 / moss-950 (primary text on page)", fg: MOSS[100], bg: DARK_BG_PAGE },
  { label: "canopy-300 / moss-900 (accent secondary on card)", fg: CANOPY[300], bg: DARK_BG_CARD },
  { label: "canopy-300 / moss-950 (accent secondary on page, bottom-nav active)", fg: CANOPY[300], bg: DARK_BG_PAGE },
];

describe("palette contrast — secondary text on dark backgrounds", () => {
  for (const p of SECONDARY_DARK_PAIRINGS) {
    const floor = p.largeTextOnly ? AA_LARGE : AA_NORMAL;
    const tag = p.largeTextOnly ? `large-only ${AA_LARGE}:1` : `${AA_NORMAL}:1`;
    it(`${p.label} clears AA (${tag})`, () => {
      const fg = parseHex(p.fg);
      const bg = parseHex(p.bg);
      const r = contrastRatio(fg, bg);
      expect(
        r,
        `${p.label} → ${r.toFixed(2)}:1 (need ≥ ${floor}:1${p.largeTextOnly ? ` — ${p.largeTextOnly}` : ""})`,
      ).toBeGreaterThanOrEqual(floor);
    });
  }
});

// Secondary / muted body text on LIGHT backgrounds — the other half
// of the survey above. The dark-mode audit fixed `dark:` overrides
// but light mode kept `text-moss-500` for the same timestamps,
// hints, and section eyebrows without ever being measured. The
// audit:
//
//   • moss-500 on white   (card)  → 4.09:1  FAIL
//   • moss-500 on moss-50 (page)  → 3.79:1  FAIL
//   • moss-600 on white   (card)  → 5.96:1  PASS  ← chosen
//   • moss-600 on moss-50 (page)  → 5.53:1  PASS  ← chosen
//
// Every former `text-moss-500` call site is now `text-moss-600`
// (the `dark:text-moss-300` overrides are untouched — that half
// was already fixed). This block keeps light-mode muted text at or
// above the rows below; when you add a new muted light-mode
// pairing, mirror it here.
//
// The two light backgrounds in use:
//   • moss-50 — page background (body class in index.html)
//   • white   — `.card` background, the dominant surface
const LIGHT_BG_PAGE = MOSS[50];
const LIGHT_BG_CARD = "#ffffff";

const SECONDARY_LIGHT_PAIRINGS: SecondaryPairing[] = [
  // The default for secondary text in light mode after the sweep.
  { label: "moss-600 / white (secondary text on card)", fg: MOSS[600], bg: LIGHT_BG_CARD },
  { label: "moss-600 / moss-50 (secondary text on page)", fg: MOSS[600], bg: LIGHT_BG_PAGE },
  // Other muted / body shades in active use in light mode.
  { label: "moss-700 / white (ghost buttons, emphatic muted on card)", fg: MOSS[700], bg: LIGHT_BG_CARD },
  { label: "moss-700 / moss-50 (emphatic muted on page)", fg: MOSS[700], bg: LIGHT_BG_PAGE },
  { label: "moss-800 / white (secondary-button text)", fg: MOSS[800], bg: LIGHT_BG_CARD },
  { label: "moss-900 / white (primary text on card)", fg: MOSS[900], bg: LIGHT_BG_CARD },
  { label: "moss-900 / moss-50 (primary text on page)", fg: MOSS[900], bg: LIGHT_BG_PAGE },
  { label: "canopy-700 / white (accent links on card)", fg: CANOPY[700], bg: LIGHT_BG_CARD },
  { label: "canopy-700 / moss-50 (accent links on page)", fg: CANOPY[700], bg: LIGHT_BG_PAGE },
];

describe("palette contrast — secondary text on light backgrounds", () => {
  for (const p of SECONDARY_LIGHT_PAIRINGS) {
    const floor = p.largeTextOnly ? AA_LARGE : AA_NORMAL;
    const tag = p.largeTextOnly ? `large-only ${AA_LARGE}:1` : `${AA_NORMAL}:1`;
    it(`${p.label} clears AA (${tag})`, () => {
      const fg = parseHex(p.fg);
      const bg = parseHex(p.bg);
      const r = contrastRatio(fg, bg);
      expect(
        r,
        `${p.label} → ${r.toFixed(2)}:1 (need ≥ ${floor}:1${p.largeTextOnly ? ` — ${p.largeTextOnly}` : ""})`,
      ).toBeGreaterThanOrEqual(floor);
    });
  }
});

// Guard the sweep itself: `text-moss-500` must not reappear as a
// light-mode text class. (4.09:1 on card, 3.79:1 on page — both
// under AA normal; that's why the class left the codebase.)
describe("palette contrast — moss-500 stays out of light-mode text", () => {
  it("moss-500 on both light surfaces is below AA normal (the reason it was swept)", () => {
    const fg = parseHex(MOSS[500]);
    expect(contrastRatio(fg, parseHex(LIGHT_BG_CARD))).toBeLessThan(AA_NORMAL);
    expect(contrastRatio(fg, parseHex(LIGHT_BG_PAGE))).toBeLessThan(AA_NORMAL);
  });
});
