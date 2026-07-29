/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { afterEach, describe, expect, it } from "vitest";
import { inlineStep, isRtl } from "./direction";

afterEach(() => {
  document.documentElement.removeAttribute("dir");
  document.body.replaceChildren();
});

describe("isRtl", () => {
  it("falls back to <html dir> when nothing closer says", () => {
    expect(isRtl(document.body)).toBe(false);
    document.documentElement.dir = "rtl";
    expect(isRtl(document.body)).toBe(true);
  });

  it("reads <html dir> for a null element too", () => {
    document.documentElement.dir = "rtl";
    expect(isRtl(null)).toBe(true);
    expect(isRtl()).toBe(true);
  });

  it("takes the NEAREST ancestor that commits", () => {
    document.documentElement.dir = "rtl";
    const outer = document.createElement("div");
    outer.dir = "ltr";
    const inner = document.createElement("span");
    outer.append(inner);
    document.body.append(outer);
    expect(isRtl(inner)).toBe(false);
  });

  it('climbs past dir="auto" instead of trusting it', () => {
    // The whole point: a member's Latin-script note inside an Arabic
    // interface resolves `auto` to ltr, which is true of that TEXT and
    // wrong for the chrome the arrow keys move through.
    document.documentElement.dir = "rtl";
    const authored = document.createElement("div");
    authored.dir = "auto";
    const inner = document.createElement("span");
    authored.append(inner);
    document.body.append(authored);
    expect(isRtl(inner)).toBe(true);
  });

  it("is case-insensitive about the attribute", () => {
    const el = document.createElement("div");
    el.setAttribute("dir", "RTL");
    document.body.append(el);
    expect(isRtl(el)).toBe(true);
  });
});

describe("inlineStep", () => {
  it("mirrors the horizontal pair and nothing else", () => {
    expect(inlineStep("ArrowRight", false)).toBe(1);
    expect(inlineStep("ArrowLeft", false)).toBe(-1);
    expect(inlineStep("ArrowRight", true)).toBe(-1);
    expect(inlineStep("ArrowLeft", true)).toBe(1);
  });

  it("leaves the vertical pair alone in both directions", () => {
    for (const rtl of [false, true]) {
      expect(inlineStep("ArrowDown", rtl)).toBe(1);
      expect(inlineStep("ArrowUp", rtl)).toBe(-1);
    }
  });

  it("returns 0 for keys it does not own", () => {
    for (const key of ["Home", "End", "Enter", " ", "a", "Escape"]) {
      expect(inlineStep(key, false)).toBe(0);
      expect(inlineStep(key, true)).toBe(0);
    }
  });
});
