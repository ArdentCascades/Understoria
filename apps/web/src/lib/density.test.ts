/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  applyDensity,
  DENSITY_PREFERENCES,
  isDensityPreference,
} from "./density";

describe("density — isDensityPreference", () => {
  it("accepts the two valid values", () => {
    for (const p of DENSITY_PREFERENCES) {
      expect(isDensityPreference(p)).toBe(true);
    }
  });
  it("rejects everything else", () => {
    expect(isDensityPreference("")).toBe(false);
    expect(isDensityPreference("comfy")).toBe(false);
    expect(isDensityPreference("dense")).toBe(false);
    expect(isDensityPreference(null)).toBe(false);
    expect(isDensityPreference(undefined)).toBe(false);
    expect(isDensityPreference(0)).toBe(false);
  });
});

describe("density — applyDensity", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("density-compact");
  });

  it("adds density-compact when pref is compact", () => {
    applyDensity("compact");
    expect(
      document.documentElement.classList.contains("density-compact"),
    ).toBe(true);
  });

  it("removes density-compact when pref is default", () => {
    document.documentElement.classList.add("density-compact");
    applyDensity("default");
    expect(
      document.documentElement.classList.contains("density-compact"),
    ).toBe(false);
  });

  it("is idempotent across repeated calls", () => {
    applyDensity("compact");
    applyDensity("compact");
    applyDensity("compact");
    expect(
      document.documentElement.classList.contains("density-compact"),
    ).toBe(true);
    // No duplicate entries — classList is a Set semantically, but
    // verify length to catch any switch to a duplicating mechanism.
    expect(
      Array.from(document.documentElement.classList).filter(
        (c) => c === "density-compact",
      ).length,
    ).toBe(1);
  });
});
