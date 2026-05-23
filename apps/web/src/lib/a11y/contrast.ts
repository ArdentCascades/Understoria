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

// WCAG 2.1 contrast ratio computation. Used by
// `palette-contrast.test.ts` to assert that every chip / badge
// color pairing in the codebase clears the 4.5:1 floor for normal
// text in both light and dark mode.
//
// Formula:
//   relative luminance = 0.2126*R + 0.7152*G + 0.0722*B
//     where R/G/B are sRGB channels normalized to [0,1] and
//     linearized via the WCAG-prescribed piecewise transform.
//   contrast = (L_lighter + 0.05) / (L_darker + 0.05)
//
// Sources:
//   https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
//   https://www.w3.org/TR/WCAG21/#dfn-relative-luminance

export interface Rgb {
  r: number; // 0–255
  g: number; // 0–255
  b: number; // 0–255
}

/** Parse a `#rrggbb` hex string. Throws on malformed input — these
 *  are static literals in the codebase, not user input. */
export function parseHex(hex: string): Rgb {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) throw new Error(`unparseable hex color: ${hex}`);
  return {
    r: parseInt(m[1], 16),
    g: parseInt(m[2], 16),
    b: parseInt(m[3], 16),
  };
}

/** sRGB channel → linear, per WCAG. */
function linearize(channel0to1: number): number {
  return channel0to1 <= 0.03928
    ? channel0to1 / 12.92
    : Math.pow((channel0to1 + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(c: Rgb): number {
  const r = linearize(c.r / 255);
  const g = linearize(c.g / 255);
  const b = linearize(c.b / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: Rgb, b: Rgb): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Alpha-composite `fg` (with alpha 0–1) over fully-opaque `bg`.
 *  Used to model dark-mode chip backgrounds like `bg-amber-950/40` —
 *  the chip's color is rendered at 40% opacity over whatever sits
 *  behind it (typically the card's `moss-900`). The chip text
 *  contrast is computed against this composited background. */
export function composite(fg: Rgb, fgAlpha: number, bg: Rgb): Rgb {
  const a = Math.max(0, Math.min(1, fgAlpha));
  return {
    r: Math.round(fg.r * a + bg.r * (1 - a)),
    g: Math.round(fg.g * a + bg.g * (1 - a)),
    b: Math.round(fg.b * a + bg.b * (1 - a)),
  };
}

// WCAG AA floors. Normal text is anything under 18pt (~24px) or
// 14pt bold (~18.66px bold) — which covers every chip in the
// codebase, so 4.5:1 is the right floor everywhere.
export const AA_NORMAL = 4.5;
export const AA_LARGE = 3.0;
