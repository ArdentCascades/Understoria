/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, it } from "vitest";
import { highlightRanges, matchesQuery } from "./messageSearch";

describe("messageSearch — matchesQuery", () => {
  it("returns false for null plaintext (locked session)", () => {
    expect(matchesQuery(null, "anything")).toBe(false);
  });
  it("returns false for empty query", () => {
    expect(matchesQuery("hello world", "")).toBe(false);
  });
  it("returns false for whitespace-only query", () => {
    expect(matchesQuery("hello world", "   ")).toBe(false);
  });
  it("matches case-insensitively", () => {
    expect(matchesQuery("Hello WORLD", "world")).toBe(true);
    expect(matchesQuery("Hello WORLD", "WORLD")).toBe(true);
    expect(matchesQuery("hello world", "WORLD")).toBe(true);
  });
  it("trims surrounding whitespace from query", () => {
    expect(matchesQuery("the address is 42 elm", "  address  ")).toBe(true);
  });
  it("matches substrings (not whole-word)", () => {
    expect(matchesQuery("organizing", "organ")).toBe(true);
    expect(matchesQuery("organizing", "izing")).toBe(true);
  });
  it("returns false on no match", () => {
    expect(matchesQuery("hello world", "goodbye")).toBe(false);
  });
});

describe("messageSearch — highlightRanges", () => {
  it("returns [] for empty query", () => {
    expect(highlightRanges("hello world", "")).toEqual([]);
  });
  it("returns [] for whitespace-only query", () => {
    expect(highlightRanges("hello world", "   ")).toEqual([]);
  });
  it("finds a single match", () => {
    expect(highlightRanges("hello world", "world")).toEqual([
      { start: 6, end: 11 },
    ]);
  });
  it("finds multiple non-overlapping matches", () => {
    expect(highlightRanges("abab", "ab")).toEqual([
      { start: 0, end: 2 },
      { start: 2, end: 4 },
    ]);
  });
  it("is case-insensitive", () => {
    expect(highlightRanges("Hello World", "world")).toEqual([
      { start: 6, end: 11 },
    ]);
  });
  it("returns [] when there is no match", () => {
    expect(highlightRanges("hello world", "xyz")).toEqual([]);
  });
  it("trims surrounding whitespace from query", () => {
    expect(highlightRanges("address line", "  address  ")).toEqual([
      { start: 0, end: 7 },
    ]);
  });
});
