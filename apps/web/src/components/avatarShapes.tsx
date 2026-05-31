/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program. If not, see
 * <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// Color helpers used by MemberAvatar to compute gradient stops
// and stroke shades from the spec-derived fill. They operate in
// HSL space, so the resulting colors stay inside the same hue
// and saturation as the original — meaning a `canopy-600` fill
// yields a brighter canopy green for the highlight, never
// wandering into amber or rose. The palette is preserved by
// construction.
//
// These live in a sibling file so MemberAvatar.tsx stays focused
// on SVG composition. They are deliberately NOT placed in
// lib/avatar.ts — that file is frozen per the recognition-trust
// commitment in PR #100.

const HEX = /^#?([0-9a-f]{6})$/i;

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

function parseHex(hex: string): RGB | null {
  const m = HEX.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return {
    r: (n >> 16) & 0xff,
    g: (n >> 8) & 0xff,
    b: n & 0xff,
  };
}

function toHex({ r, g, b }: RGB): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const h = (v: number) => clamp(v).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

function rgbToHsl({ r, g, b }: RGB): HSL {
  const rN = r / 255;
  const gN = g / 255;
  const bN = b / 255;
  const max = Math.max(rN, gN, bN);
  const min = Math.min(rN, gN, bN);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rN:
        h = (gN - bN) / d + (gN < bN ? 6 : 0);
        break;
      case gN:
        h = (bN - rN) / d + 2;
        break;
      default:
        h = (rN - gN) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h, s, l };
}

function hslToRgb({ h, s, l }: HSL): RGB {
  if (s === 0) {
    const v = l * 255;
    return { r: v, g: v, b: v };
  }
  const hue2rgb = (p: number, q: number, t: number): number => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: hue2rgb(p, q, h + 1 / 3) * 255,
    g: hue2rgb(p, q, h) * 255,
    b: hue2rgb(p, q, h - 1 / 3) * 255,
  };
}

function shiftLightness(hex: string, delta: number): string {
  const rgb = parseHex(hex);
  if (!rgb) return hex;
  const hsl = rgbToHsl(rgb);
  const next: HSL = {
    h: hsl.h,
    s: hsl.s,
    l: Math.max(0, Math.min(1, hsl.l + delta)),
  };
  return toHex(hslToRgb(next));
}

/**
 * Return a lighter shade of the given hex color, computed in
 * HSL by bumping lightness by ~10 percentage points. Used for
 * the lower (base) stop of leaf gradients.
 */
export function lighterShade(hex: string): string {
  return shiftLightness(hex, 0.1);
}

/**
 * Return a darker shade of the given hex color, computed in
 * HSL by subtracting ~13 percentage points of lightness. Used
 * for subtle definition strokes and central veins.
 */
export function darkerShade(hex: string): string {
  return shiftLightness(hex, -0.13);
}
