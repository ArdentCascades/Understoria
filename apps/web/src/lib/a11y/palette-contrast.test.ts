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
//
// Since docs/themes-plan.md T2 the brand families are member-
// selectable: every pairing is parametrized over the four certified
// palettes (canopy baseline + riverbed/harvest/fieldnotes) and runs
// with that palette's OWN hexes and composite bases. A drift lock at
// the bottom pins src/index.css's RGB triplets to the tables here —
// this file is the certification authority.

type Step = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;
type BrandSteps = Record<Step, string>;
/** ember/bark ship no 950 step (see index.css / tailwind.config.js). */
type WarmSteps = Record<Exclude<Step, 950>, string>;

interface PaletteFamilies {
  CANOPY: BrandSteps;
  MOSS: BrandSteps;
  EMBER: WarmSteps;
  BARK: WarmSteps;
}

// Certified palette tables (docs/themes-plan.md §1.3). `canopy` is
// the project's original palette from tailwind.config.js — those
// hexes are the canonical statement and must not be regenerated.
// The other three are the T2 member-selectable palettes.
const PALETTES: Record<string, PaletteFamilies> = {
  canopy: {
    CANOPY: {
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
    },
    MOSS: {
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
    },
    EMBER: {
      50: "#fdf6ec",
      100: "#fae8cf",
      200: "#f4d3a1",
      300: "#e9b977",
      400: "#dc9c4d",
      500: "#c97f1e",
      600: "#a96618",
      700: "#8a5212",
      800: "#65380c",
      900: "#4a2c08",
    },
    BARK: {
      50: "#f7f4ef",
      100: "#ede7dc",
      200: "#d9cfbe",
      300: "#bfb097",
      400: "#9a886b",
      500: "#7a6a52",
      600: "#5e5040",
      700: "#473d31",
      800: "#3a3225",
      900: "#241f18",
    },
  },
  riverbed: {
    CANOPY: {
      50: "#f5fbfd",
      100: "#eaf7fd",
      200: "#d6edf9",
      300: "#b7dff4",
      400: "#92cce9",
      500: "#61b6e0",
      600: "#2197d1",
      700: "#1f77a2",
      800: "#1e5e7d",
      900: "#1b4d67",
      950: "#082b3c",
    },
    MOSS: {
      50: "#f5f7f8",
      100: "#e7ecf0",
      200: "#d0d8e0",
      300: "#afbcc8",
      400: "#8b9cac",
      500: "#698097",
      600: "#526579",
      700: "#42505f",
      800: "#36414d",
      900: "#2f3740",
      950: "#171d24",
    },
    EMBER: {
      50: "#fdf6f0",
      100: "#fbe7d9",
      200: "#f7d0b7",
      300: "#edb590",
      400: "#e19868",
      500: "#df7229",
      600: "#bb5b1a",
      700: "#984814",
      800: "#6c330d",
      900: "#532709",
    },
    BARK: {
      50: "#f3f4f6",
      100: "#e4e8ec",
      200: "#ccd1d7",
      300: "#abb2bd",
      400: "#838b98",
      500: "#646d7a",
      600: "#4c535c",
      700: "#3b3f46",
      800: "#2f343a",
      900: "#1d2024",
    },
  },
  harvest: {
    CANOPY: {
      50: "#f7fbee",
      100: "#eef8d8",
      200: "#ddf1b6",
      300: "#c6e586",
      400: "#a8d254",
      500: "#8cba2f",
      600: "#729a21",
      700: "#5a781d",
      800: "#49601c",
      900: "#3d4e19",
      950: "#202b08",
    },
    MOSS: {
      50: "#f7f7f4",
      100: "#ecece4",
      200: "#d9d7c8",
      300: "#bdbba5",
      400: "#9e9b7d",
      500: "#827f5e",
      600: "#676449",
      700: "#52503b",
      800: "#434131",
      900: "#38362a",
      950: "#1e1d15",
    },
    EMBER: {
      50: "#fdf7e8",
      100: "#f9e9c5",
      200: "#f2d590",
      300: "#e5bc5c",
      400: "#d3a12a",
      500: "#b6881b",
      600: "#967015",
      700: "#795a10",
      800: "#563f0a",
      900: "#413007",
    },
    BARK: {
      50: "#f8f3f0",
      100: "#f0e5de",
      200: "#decec1",
      300: "#c6ae9b",
      400: "#a2856e",
      500: "#826652",
      600: "#634e3f",
      700: "#4a3c30",
      800: "#3f3125",
      900: "#271e18",
    },
  },
  fieldnotes: {
    CANOPY: {
      50: "#f9fcfb",
      100: "#f3fbf7",
      200: "#e7f6ef",
      300: "#c8e9db",
      400: "#97d1b9",
      500: "#66bc98",
      600: "#3a8d6a",
      700: "#306e54",
      800: "#275240",
      900: "#214335",
      950: "#0e241a",
    },
    MOSS: {
      50: "#fafaf9",
      100: "#f3f3f3",
      200: "#e8e8e7",
      300: "#c9c9c6",
      400: "#9b9a96",
      500: "#7f7d79",
      600: "#5a5955",
      700: "#464643",
      800: "#363534",
      900: "#2d2d2b",
      950: "#171616",
    },
    EMBER: {
      50: "#fcf9f6",
      100: "#f9f2ea",
      200: "#f3e7d8",
      300: "#e2cbad",
      400: "#c8a272",
      500: "#ba8641",
      600: "#88622f",
      700: "#6e4e25",
      800: "#493418",
      900: "#372711",
    },
    BARK: {
      50: "#f9f9f7",
      100: "#f3f1ef",
      200: "#e6e5e1",
      300: "#c6c2bc",
      400: "#8f8a7f",
      500: "#706c62",
      600: "#4c4942",
      700: "#393732",
      800: "#2c2a25",
      900: "#1b1a17",
    },
  },
};

// Standard Tailwind defaults for amber + rose (we don't override
// these in tailwind.config.js). These are theme-invariant status
// colors — they deliberately do NOT retheme per palette, so they
// stay single/global while the brand families vary above.
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
// composites over the card's `moss-900` background — the ACTIVE
// palette's moss-900, so the composite base is computed per palette
// below. The base for compositing matters: if the chip ever sits
// directly on the page (no card), the base would be `moss-950`, but
// no current chip pairing in the codebase does that.

interface Pairing {
  label: string;
  fg: string;
  bg: string;
  /** 0–1. Default 1 (fully opaque). When < 1, bg is composited
   *  over the palette's moss-900 base before computing contrast. */
  alpha?: number;
}

function lightPairings(CANOPY: BrandSteps, MOSS: BrandSteps): Pairing[] {
  return [
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
}

function darkPairings(CANOPY: BrandSteps, MOSS: BrandSteps): Pairing[] {
  return [
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
}

function ratioFor(p: Pairing, darkBgBase: ReturnType<typeof parseHex>): number {
  const fg = parseHex(p.fg);
  const bgRaw = parseHex(p.bg);
  const bg = p.alpha === undefined || p.alpha === 1
    ? bgRaw
    : composite(bgRaw, p.alpha, darkBgBase);
  return contrastRatio(fg, bg);
}

// Secondary / muted body text on dark backgrounds. Historically the
// codebase used `text-moss-500` (and a few `dark:text-moss-400`
// overrides) for timestamps, hints, section eyebrows, and other
// meta — never formally measured. The audit (Canopy numbers; the
// other palettes were built to clear the same rows):
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

interface SecondaryPairing {
  label: string;
  fg: string;
  bg: string;
  /** When set, this pairing is allowed to clear only AA_LARGE (3:1)
   *  because it is only ever rendered at ≥ 24px regular / ≥ 18.66px
   *  bold. Include the rendered context as justification. */
  largeTextOnly?: string;
}

function secondaryDarkPairings(CANOPY: BrandSteps, MOSS: BrandSteps): SecondaryPairing[] {
  const DARK_BG_PAGE = MOSS[950];
  const DARK_BG_CARD = MOSS[900];
  return [
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
}

// Secondary / muted body text on LIGHT backgrounds — the other half
// of the survey above. The dark-mode audit fixed `dark:` overrides
// but light mode kept `text-moss-500` for the same timestamps,
// hints, and section eyebrows without ever being measured. The
// audit (Canopy numbers):
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
const LIGHT_BG_CARD = "#ffffff";

function secondaryLightPairings(CANOPY: BrandSteps, MOSS: BrandSteps): SecondaryPairing[] {
  const LIGHT_BG_PAGE = MOSS[50];
  return [
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
}

// ─── Per-palette certification loop ──────────────────────────────
// Every pairing group runs once per palette with that palette's own
// hexes and composite bases (its moss-900/moss-950/moss-50; white
// stays white). Palette name is in every describe title so a failure
// names its palette.
for (const [paletteName, fams] of Object.entries(PALETTES)) {
  const { CANOPY, MOSS } = fams;
  const darkBgBase = parseHex(MOSS[900]);

  describe(`palette contrast [${paletteName}] — light mode`, () => {
    for (const p of lightPairings(CANOPY, MOSS)) {
      it(`${p.label} clears AA normal (${AA_NORMAL}:1)`, () => {
        const r = ratioFor(p, darkBgBase);
        expect(
          r,
          `[${paletteName}] ${p.label} → ${r.toFixed(2)}:1 (need ≥ ${AA_NORMAL}:1)`,
        ).toBeGreaterThanOrEqual(AA_NORMAL);
      });
    }
  });

  describe(`palette contrast [${paletteName}] — dark mode (composited over ${paletteName} moss-900)`, () => {
    for (const p of darkPairings(CANOPY, MOSS)) {
      it(`${p.label} clears AA normal (${AA_NORMAL}:1)`, () => {
        const r = ratioFor(p, darkBgBase);
        expect(
          r,
          `[${paletteName}] ${p.label} → ${r.toFixed(2)}:1 (need ≥ ${AA_NORMAL}:1)`,
        ).toBeGreaterThanOrEqual(AA_NORMAL);
      });
    }
  });

  describe(`palette contrast [${paletteName}] — secondary text on dark backgrounds`, () => {
    for (const p of secondaryDarkPairings(CANOPY, MOSS)) {
      const floor = p.largeTextOnly ? AA_LARGE : AA_NORMAL;
      const tag = p.largeTextOnly ? `large-only ${AA_LARGE}:1` : `${AA_NORMAL}:1`;
      it(`${p.label} clears AA (${tag})`, () => {
        const fg = parseHex(p.fg);
        const bg = parseHex(p.bg);
        const r = contrastRatio(fg, bg);
        expect(
          r,
          `[${paletteName}] ${p.label} → ${r.toFixed(2)}:1 (need ≥ ${floor}:1${p.largeTextOnly ? ` — ${p.largeTextOnly}` : ""})`,
        ).toBeGreaterThanOrEqual(floor);
      });
    }
  });

  describe(`palette contrast [${paletteName}] — secondary text on light backgrounds`, () => {
    for (const p of secondaryLightPairings(CANOPY, MOSS)) {
      const floor = p.largeTextOnly ? AA_LARGE : AA_NORMAL;
      const tag = p.largeTextOnly ? `large-only ${AA_LARGE}:1` : `${AA_NORMAL}:1`;
      it(`${p.label} clears AA (${tag})`, () => {
        const fg = parseHex(p.fg);
        const bg = parseHex(p.bg);
        const r = contrastRatio(fg, bg);
        expect(
          r,
          `[${paletteName}] ${p.label} → ${r.toFixed(2)}:1 (need ≥ ${floor}:1${p.largeTextOnly ? ` — ${p.largeTextOnly}` : ""})`,
        ).toBeGreaterThanOrEqual(floor);
      });
    }
  });

  // Guard the sweep itself: `text-moss-500` must not reappear as a
  // light-mode text class. (Canopy: 4.09:1 on card, 3.79:1 on page —
  // both under AA normal; that's why the class left the codebase.)
  // All four palettes are DESIGNED to keep moss-500 failing here —
  // if a palette's moss-500 ever clears AA on light surfaces, the
  // sweep's rationale no longer holds for it and this guard flags it.
  describe(`palette contrast [${paletteName}] — moss-500 stays out of light-mode text`, () => {
    it("moss-500 on both light surfaces is below AA normal (the reason it was swept)", () => {
      const fg = parseHex(MOSS[500]);
      const onCard = contrastRatio(fg, parseHex(LIGHT_BG_CARD));
      const onPage = contrastRatio(fg, parseHex(MOSS[50]));
      expect(
        onCard,
        `[${paletteName}] moss-500 / white → ${onCard.toFixed(2)}:1 — expected BELOW ${AA_NORMAL}:1 by design`,
      ).toBeLessThan(AA_NORMAL);
      expect(
        onPage,
        `[${paletteName}] moss-500 / moss-50 → ${onPage.toFixed(2)}:1 — expected BELOW ${AA_NORMAL}:1 by design`,
      ).toBeLessThan(AA_NORMAL);
    });
  });
}

// The math above says WHY the tokens were swept; this scan says the
// sweep HOLDS. It regressed twice without it (localOnly note,
// MarkdownHint & co.) — the ratio test alone can't see call sites.
// `text-moss-500` fails AA on both light surfaces (4.09 / 3.79) and
// `dark:text-moss-400` fails on dark cards (4.28 on moss-900), so
// neither may appear as a TEXT class. Decorative `aria-hidden`
// glyphs use other shades and are exempt by not matching these
// exact class names.
describe("palette contrast — the swept text classes stay out of the source", () => {
  it("no component uses text-moss-500 or dark:text-moss-400", async () => {
    const { readdirSync, readFileSync, statSync } = await import("node:fs");
    const { join } = await import("node:path");
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const p = join(dir, name);
        if (statSync(p).isDirectory()) {
          walk(p);
          continue;
        }
        if (!/\.(tsx|ts)$/.test(name) || /\.test\./.test(name)) continue;
        const src = readFileSync(p, "utf8");
        if (/(?<!dark:)\btext-moss-500\b/.test(src) || /dark:text-moss-400\b/.test(src)) {
          offenders.push(p);
        }
      }
    };
    walk(join(__dirname, "..", ".."));
    expect(offenders).toEqual([]);
  });
});

// Drift lock: src/index.css resolves the brand families from RGB
// triplets (`--family-step: R G B;`) — the `:root` block is the
// Canopy baseline and each `[data-palette="…"]` block is one of the
// T2 palettes. Those triplets MUST equal the certified hex tables
// above; this test is the authority, index.css follows it. A
// mismatch names the palette/family/step so the fix is unambiguous.
describe("palette drift lock — index.css triplets match the certified tables", () => {
  const hexToTriplet = (hex: string): string => {
    const { r, g, b } = parseHex(hex);
    return `${r} ${g} ${b}`;
  };

  for (const [paletteName, fams] of Object.entries(PALETTES)) {
    const blockLabel = paletteName === "canopy" ? ":root" : `[data-palette="${paletteName}"]`;
    it(`${blockLabel} matches the certified ${paletteName} table`, async () => {
      const { readFileSync } = await import("node:fs");
      const { join } = await import("node:path");
      const css = readFileSync(join(__dirname, "..", "..", "index.css"), "utf8");
      const block = paletteName === "canopy"
        ? /:root\s*\{([\s\S]*?)\}/.exec(css)?.[1]
        : new RegExp(`\\[data-palette="${paletteName}"\\]\\s*\\{([\\s\\S]*?)\\}`).exec(css)?.[1];
      expect(block, `index.css is missing the ${blockLabel} block`).toBeTruthy();

      const cssVars: Record<string, string> = {};
      for (const m of (block as string).matchAll(/--([a-z]+)-(\d+):\s*(\d+)\s+(\d+)\s+(\d+)\s*;/g)) {
        cssVars[`${m[1]}-${m[2]}`] = `${m[3]} ${m[4]} ${m[5]}`;
      }

      for (const [famName, steps] of Object.entries(fams)) {
        for (const [step, hex] of Object.entries(steps as Record<string, string>)) {
          const varName = `${famName.toLowerCase()}-${step}`;
          const expected = hexToTriplet(hex);
          expect(
            cssVars[varName],
            `index.css ${blockLabel} --${varName}: "${cssVars[varName] ?? "(missing)"}" ` +
              `but certified table [${paletteName}] ${famName} ${step} = ${hex} → "${expected}" — ` +
              `index.css must match this test, not the other way around`,
          ).toBe(expected);
          delete cssVars[varName];
        }
      }
      // Anything left over is a brand triplet index.css defines that
      // the certified table doesn't know about — equally drift.
      expect(
        Object.keys(cssVars),
        `index.css ${blockLabel} defines brand triplets absent from the certified [${paletteName}] table`,
      ).toEqual([]);
    });
  }
});
