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
// Tripwire documenting two jsdom 29 selector-engine bugs
// (@asamuzakjp/dom-selector 7.x) that make attribute selectors match
// NOTHING — silently. A test asserting `querySelector(...)` is null
// would pass vacuously against these values, so tests must not put
// them inside CSS selector strings:
//
//   1. a literal `&` in a quoted attribute value
//      (fixed upstream in dom-selector 8.x, not yet consumed by jsdom)
//   2. an astral-plane character (most emoji) in a quoted attribute
//      value (still broken in dom-selector 8.3.0)
//
// Workaround where affected (PostDetail.menu.test.tsx,
// Conversation.reactions.test.tsx): scan candidates and compare
// getAttribute() instead of using an attribute selector.
//
// If the first two assertions here start FAILING, jsdom fixed the
// bugs: delete this file and simplify those two workarounds back to
// plain attribute selectors.
import { describe, expect, it } from "vitest";

describe("jsdom selector-engine quirks (upstream bugs we work around)", () => {
  it("an attribute selector containing & matches nothing (the quirk)", () => {
    document.body.innerHTML = '<a href="/x?a=1&b=2">x</a>';
    expect(document.querySelector("a")?.getAttribute("href")).toBe(
      "/x?a=1&b=2",
    );
    expect(document.querySelector('a[href="/x?a=1&b=2"]')).toBeNull();
  });

  it("an attribute selector containing an astral emoji matches nothing (the quirk)", () => {
    document.body.innerHTML = '<span aria-label="reacted 🙏">x</span>';
    expect(document.querySelector("span")?.getAttribute("aria-label")).toBe(
      "reacted 🙏",
    );
    expect(document.querySelector('[aria-label="reacted 🙏"]')).toBeNull();
  });

  it("the getAttribute-scan workaround finds both", () => {
    document.body.innerHTML =
      '<a href="/x?a=1&b=2">x</a><span aria-label="reacted 🙏">y</span>';
    const byHref = Array.from(document.querySelectorAll("a")).find(
      (el) => el.getAttribute("href") === "/x?a=1&b=2",
    );
    const byLabel = Array.from(
      document.querySelectorAll("[aria-label]"),
    ).find((el) => el.getAttribute("aria-label") === "reacted 🙏");
    expect(byHref).toBeDefined();
    expect(byLabel).toBeDefined();
  });

  it("BMP characters in attribute selectors still match (scope check)", () => {
    document.body.innerHTML = '<i aria-label="x ☂"></i>';
    expect(document.querySelector('[aria-label="x ☂"]')).not.toBeNull();
  });
});
