/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Community snapshot — the contracts that make linked devices arrive
 * with the community present:
 *   - build reads the shared-state tables and skips empty ones
 *   - apply hydrates a FRESH device (exactly one member row) and
 *     refuses a device with a community life of its own
 *   - a malformed table never sinks the rest
 *   - the excluded tables stay excluded (secrets, messages, drafts,
 *     invites)
 */
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/db/database";
import {
  applyCommunitySnapshot,
  buildCommunitySnapshot,
  SNAPSHOT_TABLES,
} from "./communitySnapshot";

beforeEach(async () => {
  await Promise.all(db.tables.map((t) => t.clear()));
});

function member(publicKey: string, displayName: string) {
  return {
    publicKey,
    displayName,
    skills: [],
    availability: "",
    availabilityChips: [],
    locationZone: "north",
    seedBalance: 5,
    createdAt: 1,
    nodeId: "node-src",
    vouchedBy: [],
  };
}

describe("SNAPSHOT_TABLES", () => {
  it("never includes per-device or secret tables", () => {
    for (const excluded of [
      "secretKeys",
      "messages",
      "drafts",
      "invites",
      "outbox",
      "settings",
      "pairingLog",
      "blocks",
      "previouslyBlocked",
      // Private task plans (db/taskPlans.ts) — one member's process
      // notes; even the member's own linked device starts fresh.
      "taskPlans",
    ]) {
      expect(SNAPSHOT_TABLES).not.toContain(excluded);
    }
  });

  it("covers the local-only record kinds that cannot federate", () => {
    for (const required of [
      "projects",
      "projectTasks",
      "proposals",
      "votes",
      "eventRsvps",
      "members",
    ]) {
      expect(SNAPSHOT_TABLES).toContain(required);
    }
  });
});

describe("buildCommunitySnapshot", () => {
  it("captures populated tables and omits empty ones", async () => {
    await db.members.bulkPut([member("pkA", "Rosa"), member("pkB", "Sam")]);
    await db.projects.put({
      id: "proj1",
      title: "Tool Library",
      description: "",
      status: "active",
      createdBy: "pkA",
      createdAt: 2,
      nodeId: "node-src",
    } as never);
    const snap = await buildCommunitySnapshot();
    expect(snap).not.toBeNull();
    expect(snap!.members).toHaveLength(2);
    expect(snap!.projects).toHaveLength(1);
    expect(snap!.posts).toBeUndefined();
  });
});

describe("applyCommunitySnapshot", () => {
  it("hydrates a fresh device (one member row) including the richer own-member row", async () => {
    // Fresh linked device: import created exactly one stub row.
    await db.members.put(member("pkA", "Rosa"));
    const applied = await applyCommunitySnapshot({
      members: [
        { ...member("pkA", "Rosa"), seedBalance: 5, createdAt: 42 },
        member("pkB", "Sam"),
        member("pkC", "Ines"),
      ],
      projects: [
        {
          id: "proj1",
          title: "Tool Library",
          status: "active",
          createdBy: "pkB",
          createdAt: 2,
          nodeId: "node-src",
        },
      ],
    });
    expect(applied).toBe(true);
    expect(await db.members.count()).toBe(3);
    expect((await db.members.get("pkA"))!.createdAt).toBe(42);
    expect(await db.projects.count()).toBe(1);
  });

  it("refuses a device that already has a community life", async () => {
    await db.members.bulkPut([member("pkA", "Rosa"), member("pkX", "Local")]);
    const applied = await applyCommunitySnapshot({
      members: [member("pkB", "Sam")],
    });
    expect(applied).toBe(false);
    expect(await db.members.count()).toBe(2);
  });

  it("a malformed table never sinks the rest", async () => {
    await db.members.put(member("pkA", "Rosa"));
    const applied = await applyCommunitySnapshot({
      // projects rows lack a primary key entirely → bulkPut throws
      // inside that table's try; members must still land.
      projects: [{ nonsense: true }],
      members: [member("pkA", "Rosa"), member("pkB", "Sam")],
    });
    expect(applied).toBe(true);
    expect(await db.members.count()).toBe(2);
  });
});
