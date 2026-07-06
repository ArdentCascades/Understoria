/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, it } from "vitest";
import type { ProjectTemplate } from "@/content/projectTemplates";
import {
  buildStagedTasks,
  includedStagedTasks,
  stagedHours,
  sumIncludedHours,
} from "./templateStaging";

const TPL: ProjectTemplate = {
  id: "test-template",
  name: "Test",
  purpose: "p",
  whoItServes: "w",
  whatYoullNeed: "n",
  setupHours: 13,
  defaultCategory: "food",
  tasks: [
    { name: "A: host site", description: "a", hours: 3 },
    {
      name: "B: source fridge",
      description: "b",
      hours: 8,
      skills: ["carpentry"],
      follows: [0],
    },
    {
      name: "C: rota",
      description: "c",
      hours: 2,
      recurringCadence: "month",
      follows: [0, 1],
    },
  ],
};

describe("buildStagedTasks", () => {
  it("stages every task included with template hours, skills, and follows", () => {
    const staged = buildStagedTasks(TPL);
    expect(staged).toHaveLength(3);
    expect(staged.map((s) => s.included)).toEqual([true, true, true]);
    expect(staged[1].skills).toEqual(["carpentry"]);
    expect(staged[2].follows).toEqual([0, 1]);
    expect(staged[0].hours).toBe("3");
  });
});

describe("sumIncludedHours / stagedHours", () => {
  it("sums included rows and tracks edits + exclusions live", () => {
    const staged = buildStagedTasks(TPL);
    expect(sumIncludedHours(staged)).toBe(13);
    staged[1].included = false;
    expect(sumIncludedHours(staged)).toBe(5);
    staged[0].hours = "4.5";
    expect(sumIncludedHours(staged)).toBe(6.5);
  });

  it("treats half-typed hours as 0 rather than NaN", () => {
    const staged = buildStagedTasks(TPL);
    staged[0].hours = "";
    staged[1].hours = "abc";
    expect(stagedHours(staged[0])).toBe(0);
    expect(sumIncludedHours(staged)).toBe(2);
  });

  it("never renders float dust", () => {
    const staged = buildStagedTasks(TPL);
    staged[0].hours = "0.1";
    staged[1].hours = "0.2";
    staged[2].hours = "0.3";
    expect(sumIncludedHours(staged)).toBe(0.6);
  });
});

describe("includedStagedTasks — the exclusion/remap projection", () => {
  it("keeps template order, carries the cadence as a real field, and remaps follows to included indexes", () => {
    const staged = buildStagedTasks(TPL);
    const out = includedStagedTasks(staged);
    expect(out.map((t) => t.title)).toEqual([
      "A: host site",
      "B: source fridge",
      "C: rota",
    ]);
    // The cadence is a field the confirm flow acts on (respawn),
    // NOT a description suffix — the description stays the
    // author's text.
    expect(out[2].description).toBe("c");
    expect(out[2].recurringCadence).toBe("month");
    expect(out[0].recurringCadence).toBeNull();
    expect(out[1].follows).toEqual([0]);
    expect(out[2].follows).toEqual([0, 1]);
    expect(out[1].requiredSkills).toEqual(["carpentry"]);
  });

  it("drops edges that point at an excluded task instead of inventing transitive ones", () => {
    const staged = buildStagedTasks(TPL);
    staged[1].included = false; // exclude B
    const out = includedStagedTasks(staged);
    expect(out.map((t) => t.title)).toEqual(["A: host site", "C: rota"]);
    // C followed [A, B]; B is gone. The A edge remaps to included
    // index 0; the B edge is DROPPED, not rewired.
    expect(out[1].follows).toEqual([0]);
  });

  it("remaps correctly when an earlier task is excluded (index shift)", () => {
    const staged = buildStagedTasks(TPL);
    staged[0].included = false; // exclude A
    const out = includedStagedTasks(staged);
    expect(out.map((t) => t.title)).toEqual(["B: source fridge", "C: rota"]);
    // B followed [A] → dropped entirely. C followed [A, B] → only the
    // B edge survives, remapped to included index 0.
    expect(out[0].follows).toEqual([]);
    expect(out[1].follows).toEqual([0]);
  });

  it("defaults an emptied hours field to 1 at submit rather than staging a zero-hour task", () => {
    const staged = buildStagedTasks(TPL);
    staged[0].hours = "";
    const out = includedStagedTasks(staged);
    expect(out[0].estimatedHours).toBe(1);
  });
});
