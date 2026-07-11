/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, it } from "vitest";
import { isDirectExchangeLabel } from "@understoria/shared/crypto";

// Namespace-grammar lock for docs/direct-exchange-label.md §3: the
// label is `direct:` + a lowercase 36-char uuid and NOTHING else.
// The suffix being structureless random noise is the §3 permanent
// boundary in executable form — a label that encodes an event, shift,
// date, or member key in the suffix must never read as direct.
describe("isDirectExchangeLabel", () => {
  it("accepts direct: followed by a randomUUID-shaped uuid", () => {
    expect(
      isDirectExchangeLabel("direct:8a6e0804-2bd0-4672-b79d-d97027f9071a"),
    ).toBe(true);
    // The real generator this app will use.
    expect(isDirectExchangeLabel(`direct:${crypto.randomUUID()}`)).toBe(true);
  });

  it("rejects structured or derived suffixes (the §3 boundary)", () => {
    expect(isDirectExchangeLabel("direct:event-123")).toBe(false);
    expect(isDirectExchangeLabel("direct:shift:abc")).toBe(false);
    expect(isDirectExchangeLabel("direct:2026-07-11")).toBe(false);
    expect(
      // A member pubkey is not a uuid.
      isDirectExchangeLabel("direct:mkey_8a6e08042bd04672b79dd97027f9071a"),
    ).toBe(false);
  });

  it("rejects near-misses of the uuid shape", () => {
    // 35 chars (truncated).
    expect(
      isDirectExchangeLabel("direct:8a6e0804-2bd0-4672-b79d-d97027f9071"),
    ).toBe(false);
    // 37 chars (padded) — a trailing byte is exactly where structure
    // would hide.
    expect(
      isDirectExchangeLabel("direct:8a6e0804-2bd0-4672-b79d-d97027f9071ab"),
    ).toBe(false);
    // Uppercase hex is not what crypto.randomUUID emits; one canonical
    // spelling keeps dedup and display comparisons byte-exact.
    expect(
      isDirectExchangeLabel("direct:8A6E0804-2BD0-4672-B79D-D97027F9071A"),
    ).toBe(false);
    // Wrong group layout.
    expect(
      isDirectExchangeLabel("direct:8a6e08042bd04672b79dd97027f9071a0000"),
    ).toBe(false);
  });

  it("rejects the other label namespaces and empty input", () => {
    expect(isDirectExchangeLabel("")).toBe(false);
    expect(isDirectExchangeLabel("direct:")).toBe(false);
    expect(isDirectExchangeLabel("post_abc123")).toBe(false);
    expect(
      isDirectExchangeLabel("project:p1/task:8a6e0804-2bd0-4672-b79d-d97027f9071a"),
    ).toBe(false);
    // Prefix must be exact — no leading/trailing noise.
    expect(
      isDirectExchangeLabel(" direct:8a6e0804-2bd0-4672-b79d-d97027f9071a"),
    ).toBe(false);
    expect(
      isDirectExchangeLabel("direct:8a6e0804-2bd0-4672-b79d-d97027f9071a "),
    ).toBe(false);
  });
});
