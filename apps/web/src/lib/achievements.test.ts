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
import { diffAchievements, evaluateAchievements } from "./achievements";
import type {
  Category,
  Exchange,
  Project,
  ProjectTask,
} from "@/types";

const nodeId = "node_test";
const WEEK = 7 * 24 * 60 * 60 * 1000;

function exchange(
  id: string,
  helper: string,
  helped: string,
  completedAt: number,
  category: Category = "other",
): Exchange {
  return {
    id,
    postId: `post_${id}`,
    helperKey: helper,
    helpedKey: helped,
    hoursExchanged: 1,
    helperSignature: "sig1",
    helpedSignature: "sig2",
    completedAt,
    category,
    nodeId,
  };
}

describe("evaluateAchievements", () => {
  const now = 100 * WEEK;

  it("returns no achievements for a member with no exchanges", () => {
    expect(evaluateAchievements("a", [], {}, now)).toEqual([]);
  });

  it("awards first_exchange on the first completed exchange", () => {
    const list = evaluateAchievements(
      "a",
      [exchange("1", "a", "b", now)],
      {},
      now,
    );
    expect(list).toContain("first_exchange");
  });

  it("awards connector_5 after helping 5 distinct recipients", () => {
    const exchanges = ["b", "c", "d", "e", "f"].map((k, i) =>
      exchange(`${i}`, "a", k, now),
    );
    const list = evaluateAchievements("a", exchanges, {}, now);
    expect(list).toContain("connector_5");
  });

  it("does not award connector_5 when helping the same person repeatedly", () => {
    const exchanges = Array.from({ length: 6 }, (_, i) =>
      exchange(`${i}`, "a", "b", now),
    );
    const list = evaluateAchievements("a", exchanges, {}, now);
    expect(list).not.toContain("connector_5");
  });

  it("awards listener after 3 emotional_support exchanges", () => {
    const exchanges = [
      exchange("1", "a", "b", now, "emotional_support"),
      exchange("2", "a", "c", now, "emotional_support"),
      exchange("3", "a", "d", now, "emotional_support"),
    ];
    const list = evaluateAchievements("a", exchanges, {}, now);
    expect(list).toContain("listener");
  });

  it("awards regular_4weeks for 4 consecutive active weeks", () => {
    const exchanges = [
      exchange("1", "a", "b", now),
      exchange("2", "a", "b", now - WEEK),
      exchange("3", "a", "b", now - 2 * WEEK),
      exchange("4", "a", "b", now - 3 * WEEK),
    ];
    const list = evaluateAchievements("a", exchanges, {}, now);
    expect(list).toContain("regular_4weeks");
  });

  it("does not award regular_4weeks if there is a gap week", () => {
    const exchanges = [
      exchange("1", "a", "b", now),
      exchange("2", "a", "b", now - WEEK),
      // gap at now - 2w
      exchange("3", "a", "b", now - 3 * WEEK),
      exchange("4", "a", "b", now - 4 * WEEK),
    ];
    const list = evaluateAchievements("a", exchanges, {}, now);
    expect(list).not.toContain("regular_4weeks");
  });

  it("awards bridge_builder when helper fills a new category", () => {
    const exchanges = [exchange("1", "a", "b", now, "housing")];
    const filled: Set<Category> = new Set(["food", "transport"]);
    const list = evaluateAchievements(
      "a",
      exchanges,
      { previouslyFilledCategories: filled },
      now,
    );
    expect(list).toContain("bridge_builder");
  });

  it("awards seed_planter when 3 invitees have an exchange", () => {
    const list = evaluateAchievements(
      "a",
      [],
      { activeInviteeKeys: ["x", "y", "z"] },
      now,
    );
    expect(list).toContain("seed_planter");
  });

  it("awards weaver when zoneReach reaches 3", () => {
    const list = evaluateAchievements("a", [], { zoneReach: 3 }, now);
    expect(list).toContain("weaver");
  });

  it("does not award weaver below the threshold", () => {
    const list = evaluateAchievements("a", [], { zoneReach: 2 }, now);
    expect(list).not.toContain("weaver");
  });

  it("does not award weaver when zoneReach is not computed", () => {
    const list = evaluateAchievements("a", [], {}, now);
    expect(list).not.toContain("weaver");
  });
});

describe("project achievements", () => {
  const now = 100 * WEEK;
  const nodeId = "node_proj_ach";

  function proj(overrides: Partial<Project> = {}): Project {
    return {
      id: "p1",
      title: "P",
      description: "",
      category: "infrastructure",
      organizerKey: "org",
      status: "active",
      targetHours: 10,
      contributedHours: 0,
      deadline: null,
      createdAt: 0,
      completedAt: null,
      pauseNote: null,
      locationZone: "",
      tags: [],
      nodeId,
      ...overrides,
    };
  }

  function task(overrides: Partial<ProjectTask>): ProjectTask {
    return {
      id: "t1",
      projectId: "p1",
      title: "t",
      description: "",
      category: "infrastructure",
      estimatedHours: 1,
      urgency: "low",
      requiredSkills: [],
      assignedTo: null,
      status: "open",
      dependencies: [],
      createdAt: 0,
      completedAt: null,
      completedBy: null,
      exchangeId: null,
      ...overrides,
    };
  }

  it("awards groundbreaker when an organizer's project drew a contributor", () => {
    const list = evaluateAchievements(
      "org",
      [],
      {
        organizedProjects: [proj()],
        organizedProjectTasks: [task({ completedBy: "helper" })],
      },
      now,
    );
    expect(list).toContain("groundbreaker");
  });

  it("does not award groundbreaker when no one but the organizer touched a task", () => {
    const list = evaluateAchievements(
      "org",
      [],
      {
        organizedProjects: [proj()],
        organizedProjectTasks: [task({ completedBy: "org" })],
      },
      now,
    );
    expect(list).not.toContain("groundbreaker");
  });

  it("does not award groundbreaker for projects still in planning", () => {
    const list = evaluateAchievements(
      "org",
      [],
      {
        organizedProjects: [proj({ status: "planning" })],
        organizedProjectTasks: [task({ completedBy: "helper" })],
      },
      now,
    );
    expect(list).not.toContain("groundbreaker");
  });

  it("awards momentum_maker when a project crosses 50% of target", () => {
    const list = evaluateAchievements(
      "org",
      [],
      {
        organizedProjects: [proj({ contributedHours: 5, targetHours: 10 })],
        organizedProjectTasks: [],
      },
      now,
    );
    expect(list).toContain("momentum_maker");
  });

  it("does not award momentum_maker below 50%", () => {
    const list = evaluateAchievements(
      "org",
      [],
      {
        organizedProjects: [proj({ contributedHours: 4, targetHours: 10 })],
        organizedProjectTasks: [],
      },
      now,
    );
    expect(list).not.toContain("momentum_maker");
  });

  it("awards keystone for any completed organized project", () => {
    const list = evaluateAchievements(
      "org",
      [],
      {
        organizedProjects: [proj({ status: "completed" })],
        organizedProjectTasks: [],
      },
      now,
    );
    expect(list).toContain("keystone");
  });

  it("awards crew_member at 3 completed project tasks", () => {
    const list = evaluateAchievements(
      "helper",
      [],
      { completedProjectTasks: 3 },
      now,
    );
    expect(list).toContain("crew_member");
  });

  it("does not award crew_member below 3", () => {
    const list = evaluateAchievements(
      "helper",
      [],
      { completedProjectTasks: 2 },
      now,
    );
    expect(list).not.toContain("crew_member");
  });

  it("skips every project achievement when no project context is supplied", () => {
    const list = evaluateAchievements("anyone", [], {}, now);
    expect(list).not.toContain("groundbreaker");
    expect(list).not.toContain("momentum_maker");
    expect(list).not.toContain("keystone");
    expect(list).not.toContain("crew_member");
  });
});

describe("diffAchievements", () => {
  const now = 100 * WEEK;

  it("returns only newly-earned achievements", () => {
    const exchanges = [exchange("1", "a", "b", now)];
    const current = ["first_exchange"] as const;
    const diff = diffAchievements("a", current, exchanges, {}, now);
    expect(diff.map((d) => d.achievementType)).not.toContain("first_exchange");
  });

  it("produces Achievement records with the given memberKey", () => {
    const exchanges = [exchange("1", "a", "b", now)];
    const diff = diffAchievements("a", [], exchanges, {}, now);
    expect(diff.length).toBeGreaterThan(0);
    expect(diff[0].memberKey).toBe("a");
    expect(diff[0].earnedAt).toBe(now);
  });
});
