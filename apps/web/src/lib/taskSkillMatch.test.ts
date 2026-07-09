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
import { matchTaskSkills } from "./taskSkillMatch";

describe("matchTaskSkills", () => {
  it("returns the overlapping skills in the task's order and casing", () => {
    const m = matchTaskSkills(
      ["Carpentry", "Outreach", "Gardening"],
      ["outreach", "cooking", "carpentry"],
    );
    expect(m.matched).toEqual(["Carpentry", "Outreach"]);
    expect(m.hasMatch).toBe(true);
  });

  it("matches case- and whitespace-insensitively", () => {
    expect(matchTaskSkills(["  Plumbing "], ["plumbing"]).matched).toEqual([
      "  Plumbing ",
    ]);
  });

  it("reports no match when nothing overlaps", () => {
    const m = matchTaskSkills(["welding"], ["baking"]);
    expect(m.matched).toEqual([]);
    expect(m.hasMatch).toBe(false);
  });

  it("is empty when either side is empty (never a false positive)", () => {
    expect(matchTaskSkills([], ["a"]).hasMatch).toBe(false);
    expect(matchTaskSkills(["a"], []).hasMatch).toBe(false);
    expect(matchTaskSkills(["", " "], [""]).hasMatch).toBe(false);
  });
});
