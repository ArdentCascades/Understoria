/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  applyTextSize,
  isTextSizePreference,
  resolveTextSize,
  TEXT_SIZE_PREFERENCES,
} from "./textSize";

describe("textSize — isTextSizePreference", () => {
  it("accepts the four valid values", () => {
    for (const p of TEXT_SIZE_PREFERENCES) {
      expect(isTextSizePreference(p)).toBe(true);
    }
  });
  it("rejects everything else", () => {
    expect(isTextSizePreference("")).toBe(false);
    expect(isTextSizePreference("small")).toBe(false);
    expect(isTextSizePreference("medium")).toBe(false);
    expect(isTextSizePreference("large")).toBe(false);
    expect(isTextSizePreference(undefined)).toBe(false);
    expect(isTextSizePreference(null)).toBe(false);
    expect(isTextSizePreference(1)).toBe(false);
    expect(isTextSizePreference({})).toBe(false);
  });
});

describe("textSize — resolveTextSize", () => {
  it("auto + wide viewport → larger", () => {
    expect(resolveTextSize("auto", true)).toBe("larger");
  });
  it("auto + narrow viewport → default", () => {
    expect(resolveTextSize("auto", false)).toBe("default");
  });
  it("explicit default ignores viewport (wide)", () => {
    expect(resolveTextSize("default", true)).toBe("default");
  });
  it("explicit default ignores viewport (narrow)", () => {
    expect(resolveTextSize("default", false)).toBe("default");
  });
  it("explicit larger ignores viewport (wide)", () => {
    expect(resolveTextSize("larger", true)).toBe("larger");
  });
  it("explicit larger ignores viewport (narrow)", () => {
    expect(resolveTextSize("larger", false)).toBe("larger");
  });
  it("explicit largest ignores viewport (wide)", () => {
    expect(resolveTextSize("largest", true)).toBe("largest");
  });
  it("explicit largest ignores viewport (narrow)", () => {
    expect(resolveTextSize("largest", false)).toBe("largest");
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
