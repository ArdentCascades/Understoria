/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, it } from "vitest";
import { BUILD_STAMP, resolveBuildStamp } from "./buildStamp";

describe("resolveBuildStamp", () => {
  it("passes a real stamp through, trimmed", () => {
    expect(resolveBuildStamp("a1b2c3d")).toBe("a1b2c3d");
    expect(resolveBuildStamp("  a1b2c3d  ")).toBe("a1b2c3d");
  });

  it("falls back to 'dev' when the injected value is empty or absent", () => {
    // An un-stamped local build, or a Docker build that wasn't passed
    // VITE_BUILD_STAMP, should read honestly rather than blank.
    expect(resolveBuildStamp("")).toBe("dev");
    expect(resolveBuildStamp("   ")).toBe("dev");
    expect(resolveBuildStamp(undefined)).toBe("dev");
    expect(resolveBuildStamp(null)).toBe("dev");
  });
});

describe("BUILD_STAMP", () => {
  it("is always a non-empty string so 'read me your build stamp' never draws a blank", () => {
    expect(typeof BUILD_STAMP).toBe("string");
    expect(BUILD_STAMP.length).toBeGreaterThan(0);
  });
});
