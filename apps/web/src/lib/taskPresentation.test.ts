/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, it } from "vitest";
import { suggestSplitting } from "./taskPresentation";

// The task-form split hint: guidance at authoring time, never a gate.
// Fires at 4+ estimated hours; quiet below the line and on anything
// that doesn't parse.

describe("suggestSplitting", () => {
  it("suggests splitting at four hours and above", () => {
    expect(suggestSplitting("4")).toBe(true);
    expect(suggestSplitting("4.5")).toBe(true);
    expect(suggestSplitting("12")).toBe(true);
  });

  it("stays quiet below four hours", () => {
    expect(suggestSplitting("1")).toBe(false);
    expect(suggestSplitting("3.75")).toBe(false);
    expect(suggestSplitting("0.25")).toBe(false);
  });

  it("stays quiet on unparseable or empty input", () => {
    expect(suggestSplitting("")).toBe(false);
    expect(suggestSplitting("abc")).toBe(false);
  });
});
