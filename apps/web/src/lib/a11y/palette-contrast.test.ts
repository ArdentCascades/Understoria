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
import { AA_NORMAL, composite, contrastRatio, parseHex } from "./contrast";

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
