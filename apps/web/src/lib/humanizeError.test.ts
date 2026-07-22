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
import { humanizeError } from "./humanizeError";

const FALLBACK = "Something went wrong. Please try again.";

describe("humanizeError", () => {
  it("passes through humane sentences as-is", () => {
    expect(
      humanizeError(new Error("Only the project organizer can do that.")),
    ).toBe("Only the project organizer can do that.");
    expect(
      humanizeError(new Error("That passphrase didn't match the current one.")),
    ).toBe("That passphrase didn't match the current one.");
  });

  it("replaces SCREAMING_CASE codes with the fallback", () => {
    expect(humanizeError(new Error("DAILY_LIMIT_EXCEEDED"))).toBe(FALLBACK);
    expect(humanizeError(new Error("BAD_SIGNATURE"))).toBe(FALLBACK);
  });

  it("replaces snake_case codes with the fallback", () => {
    expect(humanizeError(new Error("network_error"))).toBe(FALLBACK);
    expect(humanizeError(new Error("fetch_not_available"))).toBe(FALLBACK);
    expect(humanizeError(new Error("bad_signature"))).toBe(FALLBACK);
  });

  it("translates the node's inviter_not_trusted code (string, message, or .code)", () => {
    const friendly =
      "This invite can't be used yet — the person who sent it isn't fully vouched for in the community.";
    expect(humanizeError("inviter_not_trusted")).toBe(friendly);
    expect(humanizeError(new Error("inviter_not_trusted"))).toBe(friendly);
    expect(humanizeError({ code: "inviter_not_trusted" })).toBe(friendly);
  });

  it("replaces http_<status> fallbacks", () => {
    expect(humanizeError(new Error("http_422"))).toBe(FALLBACK);
    expect(humanizeError(new Error("http_500"))).toBe(FALLBACK);
  });

  it("handles strings as direct input", () => {
    expect(humanizeError("Please choose at least 1 hour.")).toBe(
      "Please choose at least 1 hour.",
    );
    expect(humanizeError("INVALID_NODE_CONFIG")).toBe(FALLBACK);
  });

  it("returns the fallback for null / undefined / non-objects", () => {
    expect(humanizeError(null)).toBe(FALLBACK);
    expect(humanizeError(undefined)).toBe(FALLBACK);
    expect(humanizeError(42)).toBe(FALLBACK);
    expect(humanizeError(true)).toBe(FALLBACK);
  });

  it("returns the fallback for objects with no message", () => {
    expect(humanizeError({ code: "X" })).toBe(FALLBACK);
    expect(humanizeError({})).toBe(FALLBACK);
  });

  it("returns the fallback for empty / one-word messages", () => {
    expect(humanizeError(new Error(""))).toBe(FALLBACK);
    expect(humanizeError(new Error("boom"))).toBe(FALLBACK);
  });

  it("preserves messages that start with a quote", () => {
    expect(humanizeError(new Error('"Garden" project couldn\'t be paused.'))).toBe(
      '"Garden" project couldn\'t be paused.',
    );
  });

  it("passes through error subclasses that carry humane copy", () => {
    class DailyLimitExceededError extends Error {
      readonly code = "DAILY_LIMIT_EXCEEDED";
      constructor(limit: number) {
        super(
          `You've completed ${limit} exchanges today. Give the day a breath — the board will still be here tomorrow.`,
        );
      }
    }
    const e = new DailyLimitExceededError(3);
    expect(humanizeError(e)).toContain("Give the day a breath");
  });
});
