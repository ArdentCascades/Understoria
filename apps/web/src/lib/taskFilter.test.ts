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
import { matchesFilter } from "./taskFilter";
import type { ProjectTask, ProjectTaskStatus } from "@/types";

function makeTask(status: ProjectTaskStatus): ProjectTask {
  return {
    id: "t1",
    projectId: "p1",
    title: "Test task",
    description: "",
    category: "other",
    estimatedHours: 1,
    urgency: "low",
    requiredSkills: [],
    assignedTo: null,
    status,
    dependencies: [],
    orderIndex: 0,
    createdAt: 0,
    completedAt: null,
    completedBy: null,
    exchangeId: null,
    claimedAt: null,
    actualHours: null,
    checkInAcknowledgedAt: null,
  };
}

describe("matchesFilter", () => {
  const statuses: ProjectTaskStatus[] = [
    "open",
    "claimed",
    "awaiting_confirmation",
    "completed",
    "blocked",
  ];

  it("'all' matches every status", () => {
    for (const s of statuses) {
      expect(matchesFilter(makeTask(s), "all")).toBe(true);
    }
  });

  it("'open' matches only open tasks", () => {
    expect(matchesFilter(makeTask("open"), "open")).toBe(true);
    for (const s of statuses.filter((s) => s !== "open")) {
      expect(matchesFilter(makeTask(s), "open")).toBe(false);
    }
  });

  it("'in_progress' matches claimed and awaiting_confirmation", () => {
    expect(matchesFilter(makeTask("claimed"), "in_progress")).toBe(true);
    expect(
      matchesFilter(makeTask("awaiting_confirmation"), "in_progress"),
    ).toBe(true);
    expect(matchesFilter(makeTask("open"), "in_progress")).toBe(false);
    expect(matchesFilter(makeTask("completed"), "in_progress")).toBe(false);
    expect(matchesFilter(makeTask("blocked"), "in_progress")).toBe(false);
  });

  it("'done' matches only completed tasks", () => {
    expect(matchesFilter(makeTask("completed"), "done")).toBe(true);
    for (const s of statuses.filter((s) => s !== "completed")) {
      expect(matchesFilter(makeTask(s), "done")).toBe(false);
    }
  });

  describe("'mine'", () => {
    const me = "alice-pub";
    const other = "bob-pub";

    function assigned(status: ProjectTaskStatus, key: string | null) {
      const t = makeTask(status);
      return { ...t, assignedTo: key };
    }

    it("matches when the task is assigned to currentKey, regardless of status", () => {
      // Any claimer-carried status counts as "mine": claimed,
      // awaiting_confirmation, even completed (their own history).
      for (const s of ["claimed", "awaiting_confirmation", "completed"] as const) {
        expect(matchesFilter(assigned(s, me), "mine", me)).toBe(true);
      }
    });

    it("does not match tasks assigned to someone else", () => {
      expect(matchesFilter(assigned("claimed", other), "mine", me)).toBe(false);
      expect(
        matchesFilter(assigned("awaiting_confirmation", other), "mine", me),
      ).toBe(false);
    });

    it("does not match unassigned (open) tasks", () => {
      expect(matchesFilter(assigned("open", null), "mine", me)).toBe(false);
    });

    it("matches nothing when currentKey is omitted", () => {
      // The pill is only rendered when a current member exists, but
      // the matcher should not silently match on an undefined key.
      expect(matchesFilter(assigned("claimed", me), "mine")).toBe(false);
      expect(matchesFilter(assigned("claimed", me), "mine", undefined)).toBe(
        false,
      );
    });
  });
});
