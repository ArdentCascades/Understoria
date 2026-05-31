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
import { describe, expect, it } from "vitest";
import type { ProjectTemplate } from "@/content/projectTemplates";
import { getSetupBucket, matchesTemplate } from "@/lib/templateFilter";

function makeTemplate(overrides: Partial<ProjectTemplate> = {}): ProjectTemplate {
  return {
    id: "test-template",
    name: "Community Fridge",
    purpose: "Provide free 24/7 access to food",
    whoItServes: "Anyone hungry, especially night-shift workers",
    whatYoullNeed: "A donated fridge and a sheltered outlet",
    setupHours: 12,
    defaultCategory: "food",
    tasks: [],
    ...overrides,
  };
}

describe("getSetupBucket", () => {
  it("classifies 0h as quick", () => {
    expect(getSetupBucket(0)).toBe("quick");
  });

  it("classifies 1h as quick", () => {
    expect(getSetupBucket(1)).toBe("quick");
  });

  it("classifies exactly 10h as quick (upper inclusive)", () => {
    expect(getSetupBucket(10)).toBe("quick");
  });

  it("classifies 11h as medium", () => {
    expect(getSetupBucket(11)).toBe("medium");
  });

  it("classifies exactly 25h as medium (upper inclusive)", () => {
    expect(getSetupBucket(25)).toBe("medium");
  });

  it("classifies 26h as bigger", () => {
    expect(getSetupBucket(26)).toBe("bigger");
  });

  it("classifies 100h as bigger", () => {
    expect(getSetupBucket(100)).toBe("bigger");
  });
});

describe("matchesTemplate", () => {
  const tpl = makeTemplate();

  it("returns true when every filter is empty", () => {
    expect(
      matchesTemplate(tpl, { query: "", category: "", setupBucket: "" }),
    ).toBe(true);
  });

  it("matches when the query hits the name", () => {
    expect(
      matchesTemplate(tpl, {
        query: "fridge",
        category: "",
        setupBucket: "",
      }),
    ).toBe(true);
  });

  it("matches when the query hits the purpose", () => {
    expect(
      matchesTemplate(tpl, {
        query: "24/7",
        category: "",
        setupBucket: "",
      }),
    ).toBe(true);
  });

  it("matches when the query hits whoItServes", () => {
    expect(
      matchesTemplate(tpl, {
        query: "night-shift",
        category: "",
        setupBucket: "",
      }),
    ).toBe(true);
  });

  it("matches when the query hits whatYoullNeed", () => {
    expect(
      matchesTemplate(tpl, {
        query: "outlet",
        category: "",
        setupBucket: "",
      }),
    ).toBe(true);
  });

  it("rejects when the query matches nothing", () => {
    expect(
      matchesTemplate(tpl, {
        query: "kayak",
        category: "",
        setupBucket: "",
      }),
    ).toBe(false);
  });

  it("matches when the category matches", () => {
    expect(
      matchesTemplate(tpl, {
        query: "",
        category: "food",
        setupBucket: "",
      }),
    ).toBe(true);
  });

  it("rejects when the category mismatches", () => {
    expect(
      matchesTemplate(tpl, {
        query: "",
        category: "housing",
        setupBucket: "",
      }),
    ).toBe(false);
  });

  it("matches when the setup bucket matches", () => {
    // 12h falls in the medium bucket (11–25).
    expect(
      matchesTemplate(tpl, {
        query: "",
        category: "",
        setupBucket: "medium",
      }),
    ).toBe(true);
  });

  it("rejects when the setup bucket mismatches", () => {
    expect(
      matchesTemplate(tpl, {
        query: "",
        category: "",
        setupBucket: "quick",
      }),
    ).toBe(false);
  });

  it("AND-composes: query matches but category mismatches → false", () => {
    expect(
      matchesTemplate(tpl, {
        query: "fridge",
        category: "housing",
        setupBucket: "",
      }),
    ).toBe(false);
  });

  it("AND-composes: all three filters set and all match → true", () => {
    expect(
      matchesTemplate(tpl, {
        query: "fridge",
        category: "food",
        setupBucket: "medium",
      }),
    ).toBe(true);
  });
});
