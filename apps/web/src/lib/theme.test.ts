/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, it } from "vitest";
import {
  isThemePreference,
  resolveTheme,
  THEME_PREFERENCES,
} from "./theme";

describe("theme — resolveTheme truth table", () => {
  it("system + OS light → light", () => {
    expect(resolveTheme("system", false)).toBe("light");
  });
  it("system + OS dark → dark", () => {
    expect(resolveTheme("system", true)).toBe("dark");
  });
  it("light + OS light → light", () => {
    expect(resolveTheme("light", false)).toBe("light");
  });
  it("light + OS dark → light (user override wins)", () => {
    expect(resolveTheme("light", true)).toBe("light");
  });
  it("dark + OS light → dark (user override wins)", () => {
    expect(resolveTheme("dark", false)).toBe("dark");
  });
  it("dark + OS dark → dark", () => {
    expect(resolveTheme("dark", true)).toBe("dark");
  });
});

describe("theme — isThemePreference", () => {
  it("accepts the three valid values", () => {
    for (const p of THEME_PREFERENCES) {
      expect(isThemePreference(p)).toBe(true);
    }
  });
  it("rejects everything else", () => {
    expect(isThemePreference("")).toBe(false);
    expect(isThemePreference("auto")).toBe(false);
    expect(isThemePreference(undefined)).toBe(false);
    expect(isThemePreference(null)).toBe(false);
    expect(isThemePreference(0)).toBe(false);
    expect(isThemePreference({})).toBe(false);
  });
});
