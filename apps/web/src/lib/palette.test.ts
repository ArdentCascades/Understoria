/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  applyPalette,
  applyThemeColorMeta,
  cachePalette,
  isPalettePreference,
  PALETTE_PREFERENCES,
  PALETTE_STORAGE_KEY,
  THEME_COLOR,
} from "./palette";

describe("palette — isPalettePreference", () => {
  it("accepts the four valid values", () => {
    for (const p of PALETTE_PREFERENCES) {
      expect(isPalettePreference(p)).toBe(true);
    }
  });
  it("rejects everything else", () => {
    expect(isPalettePreference("")).toBe(false);
    expect(isPalettePreference("forest")).toBe(false);
    expect(isPalettePreference("Canopy")).toBe(false);
    expect(isPalettePreference("field notes")).toBe(false);
    expect(isPalettePreference(null)).toBe(false);
    expect(isPalettePreference(undefined)).toBe(false);
    expect(isPalettePreference(0)).toBe(false);
  });
});

describe("palette — applyPalette", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("data-palette");
  });

  it("sets data-palette for each non-default palette", () => {
    for (const p of ["riverbed", "harvest", "fieldnotes"] as const) {
      applyPalette(p);
      expect(document.documentElement.getAttribute("data-palette")).toBe(p);
    }
  });

  it("removes the attribute for canopy (the :root baseline wins)", () => {
    document.documentElement.setAttribute("data-palette", "riverbed");
    applyPalette("canopy");
    expect(document.documentElement.hasAttribute("data-palette")).toBe(false);
  });

  it("is idempotent across repeated calls", () => {
    applyPalette("harvest");
    applyPalette("harvest");
    expect(document.documentElement.getAttribute("data-palette")).toBe(
      "harvest",
    );
    applyPalette("canopy");
    applyPalette("canopy");
    expect(document.documentElement.hasAttribute("data-palette")).toBe(false);
  });
});

describe("palette — cachePalette", () => {
  beforeEach(() => {
    window.localStorage.removeItem(PALETTE_STORAGE_KEY);
  });

  it("writes the preference under the bootstrap key", () => {
    cachePalette("riverbed");
    expect(window.localStorage.getItem(PALETTE_STORAGE_KEY)).toBe("riverbed");
  });

  it("overwrites a previous value, including back to canopy", () => {
    cachePalette("fieldnotes");
    cachePalette("canopy");
    expect(window.localStorage.getItem(PALETTE_STORAGE_KEY)).toBe("canopy");
  });
});

describe("palette — applyThemeColorMeta", () => {
  beforeEach(() => {
    document
      .querySelectorAll('meta[name="theme-color"]')
      .forEach((m) => m.remove());
  });

  it("creates the meta when missing (defensive path)", () => {
    expect(document.querySelector('meta[name="theme-color"]')).toBeNull();
    applyThemeColorMeta("canopy", "light");
    const meta = document.querySelector('meta[name="theme-color"]');
    expect(meta).not.toBeNull();
    expect(meta?.getAttribute("content")).toBe("#15803d");
  });

  it("updates the existing meta for palette/mode combos", () => {
    const meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    meta.setAttribute("content", "#15803d");
    document.head.appendChild(meta);

    applyThemeColorMeta("riverbed", "light");
    expect(meta.getAttribute("content")).toBe("#1f77a2");

    applyThemeColorMeta("riverbed", "dark");
    expect(meta.getAttribute("content")).toBe("#171d24");

    applyThemeColorMeta("fieldnotes", "dark");
    expect(meta.getAttribute("content")).toBe("#171616");

    applyThemeColorMeta("canopy", "dark");
    expect(meta.getAttribute("content")).toBe("#161f13");

    // Never creates a second meta — always re-points the first.
    expect(
      document.querySelectorAll('meta[name="theme-color"]').length,
    ).toBe(1);
  });

  it("covers every palette in both modes via the exported map", () => {
    for (const p of PALETTE_PREFERENCES) {
      for (const mode of ["light", "dark"] as const) {
        applyThemeColorMeta(p, mode);
        expect(
          document
            .querySelector('meta[name="theme-color"]')
            ?.getAttribute("content"),
        ).toBe(THEME_COLOR[p][mode]);
      }
    }
  });
});
