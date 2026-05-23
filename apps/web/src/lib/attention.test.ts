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
import { computeAttentionItems } from "./attention";
import type { Member, Post, Project, ProjectTask } from "@/types";

const nodeId = "node_attn";

function member(publicKey: string, displayName = publicKey.toUpperCase()): Member {
  return {
    publicKey,
    displayName,
    skills: [],
    availability: "",
    seedBalance: 5,
    vouchedBy: [],
    createdAt: 0,
    nodeId,
    locationZone: "",
  };
}

function post(overrides: Partial<Post> = {}): Post {
  return {
    id: overrides.id ?? `p_${Math.random().toString(36).slice(2)}`,
    type: "NEED",
    category: "other",
    title: "Help with thing",
    description: "",
    estimatedHours: 1,
    urgency: "low",
    postedBy: "alice",
    claimedBy: null,
    status: "open",
    createdAt: 1000,
    expiresAt: null,
    locationZone: "",
    confirmedBy: [],
    nodeId,
    signature: "",
    ...overrides,
  };
}

function project(overrides: Partial<Project> = {}): Project {
  return {
    id: overrides.id ?? "proj_1",
    title: "Garden",
    description: "",
    category: "infrastructure",
    organizerKey: "alice",
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
    id: overrides.id ?? "t_1",
    projectId: overrides.projectId ?? "proj_1",
    title: "Haul soil",
    description: "",
    category: "infrastructure",
    estimatedHours: 1,
    urgency: "low",
    requiredSkills: [],
    assignedTo: null,
    status: "open",
    dependencies: [],
    createdAt: 500,
    completedAt: null,
    completedBy: null,
    exchangeId: null,
    ...overrides,
  };
}

describe("computeAttentionItems", () => {
  const alice = member("alice");
  const bob = member("bob", "Bob");
  const carmen = member("carmen", "Carmen");

  it("returns empty when there's no current member", () => {
    const items = computeAttentionItems({
      currentMember: null,
      posts: [],
      projects: [],
      projectTasks: [],
      members: [],
    });
    expect(items).toEqual([]);
  });

  it("returns empty when nothing needs the current member's action", () => {
    const items = computeAttentionItems({
      currentMember: alice,
      posts: [post()],
      projects: [project()],
      projectTasks: [],
      members: [alice, bob],
    });
    expect(items).toEqual([]);
  });

  it("surfaces an exchange the current member still needs to confirm", () => {
    const p = post({
      postedBy: "alice",
      claimedBy: "bob",
      status: "awaiting_confirmation",
      confirmedBy: ["bob"],
      title: "Ride to clinic",
    });
    const items = computeAttentionItems({
      currentMember: alice,
      posts: [p],
      projects: [],
      projectTasks: [],
      members: [alice, bob],
    });
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      kind: "confirm_exchange",
      postId: p.id,
      counterpartyName: "Bob",
    });
  });

  it("does NOT surface an exchange the current member has already confirmed", () => {
    const p = post({
      postedBy: "alice",
      claimedBy: "bob",
      status: "awaiting_confirmation",
      confirmedBy: ["alice"],
    });
    const items = computeAttentionItems({
      currentMember: alice,
      posts: [p],
      projects: [],
      projectTasks: [],
      members: [alice, bob],
    });
    expect(items).toEqual([]);
  });

  it("does NOT surface exchanges the current member isn't a party to", () => {
    const p = post({
      postedBy: "bob",
      claimedBy: "carmen",
      status: "awaiting_confirmation",
      confirmedBy: ["bob"],
    });
    const items = computeAttentionItems({
      currentMember: alice,
      posts: [p],
      projects: [],
      projectTasks: [],
      members: [alice, bob, carmen],
    });
    expect(items).toEqual([]);
  });

  it("surfaces a project task the organizer needs to confirm", () => {
    const proj = project({ organizerKey: "alice" });
    const t = task({
      projectId: proj.id,
      status: "awaiting_confirmation",
      completedBy: "bob",
      title: "Haul soil",
    });
    const items = computeAttentionItems({
      currentMember: alice,
      posts: [],
      projects: [proj],
      projectTasks: [t],
      members: [alice, bob],
    });
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      kind: "confirm_task",
      projectId: proj.id,
      taskId: t.id,
      taskTitle: "Haul soil",
      completerName: "Bob",
    });
  });

  it("does NOT surface tasks where the organizer was also the completer", () => {
    // Self-confirm is rejected by confirmProjectTaskCompletion; it
    // needs ANOTHER project member, so surfacing it to the
    // organizer would be misleading.
    const proj = project({ organizerKey: "alice" });
    const t = task({
      projectId: proj.id,
      status: "awaiting_confirmation",
      completedBy: "alice",
    });
    const items = computeAttentionItems({
      currentMember: alice,
      posts: [],
      projects: [proj],
      projectTasks: [t],
      members: [alice],
    });
    expect(items).toEqual([]);
  });

  it("does NOT surface tasks on projects the current member doesn't organize", () => {
    const proj = project({ organizerKey: "carmen" });
    const t = task({
      projectId: proj.id,
      status: "awaiting_confirmation",
      completedBy: "bob",
    });
    const items = computeAttentionItems({
      currentMember: alice,
      posts: [],
      projects: [proj],
      projectTasks: [t],
      members: [alice, bob, carmen],
    });
    expect(items).toEqual([]);
  });

  it("orders items newest-first by createdAt", () => {
    const older = post({
      id: "older",
      postedBy: "alice",
      claimedBy: "bob",
      status: "awaiting_confirmation",
      confirmedBy: ["bob"],
      createdAt: 1000,
    });
    const newer = post({
      id: "newer",
      postedBy: "alice",
      claimedBy: "carmen",
      status: "awaiting_confirmation",
      confirmedBy: ["carmen"],
      createdAt: 2000,
    });
    const items = computeAttentionItems({
      currentMember: alice,
      posts: [older, newer],
      projects: [],
      projectTasks: [],
      members: [alice, bob, carmen],
    });
    expect(items.map((i) => i.kind === "confirm_exchange" && i.postId)).toEqual([
      "newer",
      "older",
    ]);
  });

  it("falls back to a generic counterparty label when the name isn't known", () => {
    // Could happen on a freshly-redeemed invite where the inviter's
    // Member row is local but the counterparty isn't yet — or in a
    // future cross-node case.
    const p = post({
      postedBy: "alice",
      claimedBy: "unknown_key",
      status: "awaiting_confirmation",
      confirmedBy: ["unknown_key"],
    });
    const items = computeAttentionItems({
      currentMember: alice,
      posts: [p],
      projects: [],
      projectTasks: [],
      members: [alice], // no record for unknown_key
    });
    expect(items).toHaveLength(1);
    if (items[0].kind === "confirm_exchange") {
      expect(items[0].counterpartyName).toBe("another community member");
    }
  });
});
