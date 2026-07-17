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
import { duplicatedNames, normalizeDisplayName } from "./nameCollisions";

function members(...names: string[]) {
  return names.map((displayName) => ({ displayName }));
}

describe("duplicatedNames", () => {
  it("flags a name shared by two members", () => {
    const dupes = duplicatedNames(members("Rosa", "Miguel", "Rosa"));
    expect(dupes).toEqual(new Set(["rosa"]));
  });

  it("matches case-insensitively and ignores surrounding whitespace", () => {
    const dupes = duplicatedNames(members("  Rosa ", "rosa", "ROSA"));
    expect(dupes).toEqual(new Set(["rosa"]));
  });

  it("returns an empty set when every name is unique", () => {
    expect(duplicatedNames(members("Rosa", "Miguel", "Nia")).size).toBe(0);
  });

  it("ignores empty and whitespace-only names", () => {
    // Two members with blank names are a data problem, not a
    // collision the key chrome should react to.
    expect(duplicatedNames(members("", "  ", "Rosa")).size).toBe(0);
  });
});

describe("normalizeDisplayName", () => {
  it("lowercases and trims, matching the set's members", () => {
    expect(normalizeDisplayName("  Rosa Q ")).toBe("rosa q");
  });
});
