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
import {
  formatAbsoluteDate,
  formatAbsoluteDateTime,
  formatDeadline,
  formatHours,
  formatRelativeTime,
  formatSignedHours,
} from "./format";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

describe("formatHours", () => {
  it("returns 0h for 0 / NaN", () => {
    expect(formatHours(0)).toBe("0h");
    expect(formatHours(Number.NaN)).toBe("0h");
  });

  it("renders sub-hour values as minutes", () => {
    expect(formatHours(0.5)).toBe("30m");
    // Implementation rounds to 0.1-hour granularity first, then
    // converts — so 0.25 → 0.3 → 18m, not 15m. Quirk worth pinning
    // here so a future "fix" doesn't silently shift display.
    expect(formatHours(0.25)).toBe("18m");
  });

  it("renders hours rounded to one decimal", () => {
    expect(formatHours(1)).toBe("1h");
    expect(formatHours(2.5)).toBe("2.5h");
    expect(formatHours(3.456)).toBe("3.5h");
  });
});

describe("formatSignedHours", () => {
  it("returns 0h for zero (no sign)", () => {
    expect(formatSignedHours(0)).toBe("0h");
  });

  it("prefixes positive values with +", () => {
    expect(formatSignedHours(2)).toBe("+2h");
  });

  it("prefixes negative values with - and formats absolute value", () => {
    expect(formatSignedHours(-1.5)).toBe("-1.5h");
  });
});

describe("formatRelativeTime", () => {
  const NOW = new Date("2026-05-23T12:00:00Z").getTime();

  it("returns a string for past timestamps within seconds", () => {
    const result = formatRelativeTime(NOW - 30 * 1000, NOW);
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("scales through minutes / hours / days / weeks", () => {
    // Smoke-test boundaries by ensuring each tier produces a
    // non-empty string. The exact wording is locale-dependent.
    expect(formatRelativeTime(NOW - 5 * 60 * 1000, NOW)).toBeTruthy();
    expect(formatRelativeTime(NOW - 5 * 60 * 60 * 1000, NOW)).toBeTruthy();
    expect(formatRelativeTime(NOW - 3 * ONE_DAY_MS, NOW)).toBeTruthy();
    expect(formatRelativeTime(NOW - 30 * ONE_DAY_MS, NOW)).toBeTruthy();
  });

  it("returns a future-tense string for future timestamps", () => {
    const result = formatRelativeTime(NOW + 3 * ONE_DAY_MS, NOW);
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("formatAbsoluteDate", () => {
  it("returns a non-empty string", () => {
    const result = formatAbsoluteDate(new Date("2026-03-05").getTime());
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("contains digit groups (date components)", () => {
    const result = formatAbsoluteDate(new Date("2026-03-05").getTime());
    expect(result).toMatch(/\d/);
  });
});

describe("formatAbsoluteDateTime", () => {
  it("returns a non-empty string including time components", () => {
    const result = formatAbsoluteDateTime(
      new Date("2026-03-05T14:30:00Z").getTime(),
    );
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
    // Should be longer than just the date version since it
    // includes a time too.
    expect(result.length).toBeGreaterThanOrEqual(
      formatAbsoluteDate(new Date("2026-03-05T14:30:00Z").getTime()).length,
    );
  });
});

describe("formatDeadline", () => {
  const NOW = new Date("2026-05-23T12:00:00Z").getTime();

  it("uses relative formatting when within a week (future)", () => {
    const target = NOW + 3 * ONE_DAY_MS;
    expect(formatDeadline(target, NOW)).toBe(formatRelativeTime(target, NOW));
  });

  it("uses relative formatting when within a week (past)", () => {
    const target = NOW - 3 * ONE_DAY_MS;
    expect(formatDeadline(target, NOW)).toBe(formatRelativeTime(target, NOW));
  });

  it("uses absolute formatting when more than a week in the future", () => {
    const target = NOW + 30 * ONE_DAY_MS;
    expect(formatDeadline(target, NOW)).toBe(formatAbsoluteDate(target));
  });

  it("uses absolute formatting when more than a week in the past", () => {
    const target = NOW - 30 * ONE_DAY_MS;
    expect(formatDeadline(target, NOW)).toBe(formatAbsoluteDate(target));
  });

  it("crosses the 7-day boundary cleanly", () => {
    // 6.9 days in the future → still relative.
    const close = NOW + Math.floor(6.9 * ONE_DAY_MS);
    expect(formatDeadline(close, NOW)).toBe(formatRelativeTime(close, NOW));
    // 7.1 days in the future → flips to absolute.
    const far = NOW + Math.ceil(7.1 * ONE_DAY_MS);
    expect(formatDeadline(far, NOW)).toBe(formatAbsoluteDate(far));
  });
});
