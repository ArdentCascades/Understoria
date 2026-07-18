/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, it } from "vitest";
import {
  highlightRanges,
  matchesQuery,
  normalizeForSearch,
} from "./messageSearch";

// Explicit escapes for every non-ASCII character under test, so the
// composed-vs-decomposed distinction survives editors and diff tools
// that silently NFC-normalize source files.
const CURLY = "\u2019"; // right single quote (phone keyboards)
const LDQ = "\u201C"; // left double quote
const RDQ = "\u201D"; // right double quote
const E_ACUTE = "\u00E9"; // composed e-acute
const E_NFD = "e\u0301"; // e + combining acute
const ENYE = "\u00F1"; // composed enye
const ENYE_NFD = "n\u0303"; // n + combining tilde
const CAP_ENYE = "\u00D1"; // capital enye

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

describe("messageSearch — forgiving normalization", () => {
  it("folds curly apostrophes both ways (don’t ↔ don't)", () => {
    // Phone keyboard needle (U+2019) vs ASCII haystack…
    expect(matchesQuery("Don't forget the keys", `don${CURLY}t`)).toBe(true);
    // …and the reverse: ASCII needle vs curly haystack.
    expect(matchesQuery(`Don${CURLY}t forget the keys`, "don't")).toBe(true);
  });
  it("folds curly double quotes to straight", () => {
    expect(matchesQuery(`she said ${LDQ}yes${RDQ}`, '"yes"')).toBe(true);
    expect(matchesQuery('she said "yes"', `${LDQ}yes${RDQ}`)).toBe(true);
  });
  it("strips diacritics both ways (café ↔ cafe)", () => {
    expect(matchesQuery(`meet at the caf${E_ACUTE}`, "cafe")).toBe(true);
    expect(matchesQuery("meet at the cafe", `caf${E_ACUTE}`)).toBe(true);
  });
  it("matches decomposed (NFD) haystacks too", () => {
    const nfdCafe = `caf${E_NFD} tomorrow`;
    expect(matchesQuery(nfdCafe, `caf${E_ACUTE}`)).toBe(true);
    expect(matchesQuery(nfdCafe, "cafe")).toBe(true);
  });
  it("keeps ñ a distinct letter: año matches año, not ano", () => {
    const composed = `feliz a${ENYE}o nuevo`;
    const decomposed = `feliz a${ENYE_NFD}o nuevo`;
    expect(matchesQuery(composed, `a${ENYE}o`)).toBe(true);
    // Composed vs decomposed ñ still find each other, both ways.
    expect(matchesQuery(composed, `a${ENYE_NFD}o`)).toBe(true);
    expect(matchesQuery(decomposed, `a${ENYE}o`)).toBe(true);
    expect(matchesQuery(`feliz A${CAP_ENYE}O nuevo`, `a${ENYE}o`)).toBe(
      true,
    );
    // ñ is a separate Spanish letter, not an accented n — no fold.
    expect(matchesQuery(composed, "ano")).toBe(false);
    expect(matchesQuery("hermano", `a${ENYE}o`)).toBe(false);
  });
  it("normalizeForSearch folds quotes, accents, and case", () => {
    expect(normalizeForSearch(`Don${CURLY}t`)).toBe("don't");
    expect(normalizeForSearch(`CAFÉ`)).toBe("cafe");
    expect(normalizeForSearch(`A${ENYE}o`)).toBe(`a${ENYE}o`);
    expect(normalizeForSearch(`a${ENYE_NFD}o`)).toBe(`a${ENYE}o`);
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
  it("highlights the real original substring for a curly-quote hit", () => {
    const text = `I said don${CURLY}t worry`;
    const ranges = highlightRanges(text, "don't");
    expect(ranges).toEqual([{ start: 7, end: 12 }]);
    expect(text.slice(ranges[0].start, ranges[0].end)).toBe(
      `don${CURLY}t`,
    );
  });
  it("does not drift when the haystack is decomposed (NFD)", () => {
    // é as e + combining acute occupies TWO code units in the
    // original, so "bar" starts at 6, not 5 — the index map keeps
    // later highlights honest.
    const text = `caf${E_NFD} bar`;
    const cafeRanges = highlightRanges(text, "cafe");
    expect(cafeRanges).toEqual([{ start: 0, end: 5 }]);
    expect(text.slice(cafeRanges[0].start, cafeRanges[0].end)).toBe(
      `caf${E_NFD}`,
    );
    const barRanges = highlightRanges(text, "bar");
    expect(barRanges).toEqual([{ start: 6, end: 9 }]);
    expect(text.slice(barRanges[0].start, barRanges[0].end)).toBe("bar");
  });
  it("highlights an accented original for a plain-ASCII query", () => {
    const text = `el caf${E_ACUTE} bueno`;
    const ranges = highlightRanges(text, "cafe");
    expect(ranges).toEqual([{ start: 3, end: 7 }]);
    expect(text.slice(ranges[0].start, ranges[0].end)).toBe(
      `caf${E_ACUTE}`,
    );
  });
  it("highlights año wherever ñ is composed or decomposed", () => {
    const composed = `este a${ENYE}o sí`;
    const r1 = highlightRanges(composed, `a${ENYE}o`);
    expect(composed.slice(r1[0].start, r1[0].end)).toBe(`a${ENYE}o`);
    const decomposed = `este a${ENYE_NFD}o sí`;
    const r2 = highlightRanges(decomposed, `a${ENYE}o`);
    expect(decomposed.slice(r2[0].start, r2[0].end)).toBe(
      `a${ENYE_NFD}o`,
    );
  });
});
