/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { beforeEach, describe, expect, it } from "vitest";
import { applyTextSize, isTextSize, TEXT_SIZES } from "./textSize";

describe("textSize — isTextSize", () => {
  it("accepts the three valid values", () => {
    for (const s of TEXT_SIZES) expect(isTextSize(s)).toBe(true);
  });
  it("rejects everything else", () => {
    expect(isTextSize("")).toBe(false);
    expect(isTextSize("small")).toBe(false);
    expect(isTextSize("large")).toBe(false);
    expect(isTextSize(undefined)).toBe(false);
    expect(isTextSize(null)).toBe(false);
    expect(isTextSize(1)).toBe(false);
    expect(isTextSize({})).toBe(false);
  });
});

describe("textSize — applyTextSize", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("text-larger", "text-largest");
  });

  it("default applies no class", () => {
    applyTextSize("default");
    expect(document.documentElement.classList.contains("text-larger")).toBe(false);
    expect(document.documentElement.classList.contains("text-largest")).toBe(false);
  });

  it("larger applies only text-larger", () => {
    applyTextSize("larger");
    expect(document.documentElement.classList.contains("text-larger")).toBe(true);
    expect(document.documentElement.classList.contains("text-largest")).toBe(false);
  });

  it("largest applies only text-largest", () => {
    applyTextSize("largest");
    expect(document.documentElement.classList.contains("text-largest")).toBe(true);
    expect(document.documentElement.classList.contains("text-larger")).toBe(false);
  });

  it("clears the previous class when switching larger → largest", () => {
    applyTextSize("larger");
    applyTextSize("largest");
    expect(document.documentElement.classList.contains("text-larger")).toBe(false);
    expect(document.documentElement.classList.contains("text-largest")).toBe(true);
  });

  it("clears every class when switching back to default", () => {
    applyTextSize("largest");
    applyTextSize("default");
    expect(document.documentElement.classList.contains("text-larger")).toBe(false);
    expect(document.documentElement.classList.contains("text-largest")).toBe(false);
  });
});
