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
  composite,
  contrastRatio,
  parseHex,
  relativeLuminance,
} from "./contrast";

describe("parseHex", () => {
  it("parses 6-char hex with leading #", () => {
    expect(parseHex("#ff8800")).toEqual({ r: 255, g: 136, b: 0 });
  });
  it("parses 6-char hex without leading #", () => {
    expect(parseHex("00ff80")).toEqual({ r: 0, g: 255, b: 128 });
  });
  it("is case-insensitive", () => {
    expect(parseHex("#AbCdEf")).toEqual({ r: 171, g: 205, b: 239 });
  });
  it("throws on malformed input", () => {
    expect(() => parseHex("nope")).toThrow();
    expect(() => parseHex("#fff")).toThrow();
    expect(() => parseHex("#gghhii")).toThrow();
  });
});

describe("relativeLuminance", () => {
  it("returns 0 for black", () => {
    expect(relativeLuminance({ r: 0, g: 0, b: 0 })).toBe(0);
  });
  it("returns 1 for white", () => {
    expect(relativeLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 4);
  });
  it("weights green higher than red, red higher than blue", () => {
    const red = relativeLuminance({ r: 255, g: 0, b: 0 });
    const green = relativeLuminance({ r: 0, g: 255, b: 0 });
    const blue = relativeLuminance({ r: 0, g: 0, b: 255 });
    expect(green).toBeGreaterThan(red);
    expect(red).toBeGreaterThan(blue);
  });
});

describe("contrastRatio", () => {
  it("returns 21 for black on white (max possible)", () => {
    expect(
      contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }),
    ).toBeCloseTo(21, 1);
  });
  it("returns 1 for identical colors (min possible)", () => {
    expect(
      contrastRatio({ r: 128, g: 128, b: 128 }, { r: 128, g: 128, b: 128 }),
    ).toBe(1);
  });
  it("is symmetric: order of args doesn't change the result", () => {
    const a = parseHex("#15803d"); // canopy-700
    const b = parseHex("#f0fdf4"); // canopy-50
    expect(contrastRatio(a, b)).toBeCloseTo(contrastRatio(b, a), 6);
  });
  it("clears 4.5:1 for canopy-700 on canopy-50 (a real shipped pairing)", () => {
    const fg = parseHex("#15803d");
    const bg = parseHex("#f0fdf4");
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });
});

describe("composite", () => {
  it("returns the foreground when alpha is 1", () => {
    const fg = { r: 255, g: 0, b: 0 };
    const bg = { r: 0, g: 0, b: 255 };
    expect(composite(fg, 1, bg)).toEqual(fg);
  });
  it("returns the background when alpha is 0", () => {
    const fg = { r: 255, g: 0, b: 0 };
    const bg = { r: 0, g: 0, b: 255 };
    expect(composite(fg, 0, bg)).toEqual(bg);
  });
  it("blends linearly at 0.5", () => {
    expect(
      composite(
        { r: 0, g: 0, b: 0 },
        0.5,
        { r: 255, g: 255, b: 255 },
      ),
    ).toEqual({ r: 128, g: 128, b: 128 });
  });
  it("clamps alpha to [0,1]", () => {
    const fg = { r: 100, g: 100, b: 100 };
    const bg = { r: 200, g: 200, b: 200 };
    expect(composite(fg, -1, bg)).toEqual(bg);
    expect(composite(fg, 2, bg)).toEqual(fg);
  });
});
