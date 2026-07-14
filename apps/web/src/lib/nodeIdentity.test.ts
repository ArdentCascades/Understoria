/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { beforeEach, describe, expect, it } from "vitest";
import { db, getSetting, setSetting, SETTING_KEYS } from "@/db/database";
import {
  adoptCanonicalNodeId,
  communityNodeIdSet,
  isOurNode,
  MAX_NODE_ID_ALIASES,
  readNodeIdAliases,
} from "./nodeIdentity";

async function reset() {
  await db.settings.clear();
}

describe("adoptCanonicalNodeId", () => {
  beforeEach(reset);

  it("adopts the canonical id and records the old id as an alias", async () => {
    await setSetting(SETTING_KEYS.nodeId, "node_random_device");
    const result = await adoptCanonicalNodeId("node_canonical");
    expect(result.adopted).toBe(true);
    expect(result.previous).toBe("node_random_device");
    expect(result.nodeId).toBe("node_canonical");
    expect(await getSetting(SETTING_KEYS.nodeId)).toBe("node_canonical");
    expect(await readNodeIdAliases()).toEqual(["node_random_device"]);
  });

  it("is a no-op when the id is already current (no alias churn)", async () => {
    await setSetting(SETTING_KEYS.nodeId, "node_canonical");
    const result = await adoptCanonicalNodeId("node_canonical");
    expect(result.adopted).toBe(false);
    expect(result.nodeId).toBe("node_canonical");
    expect(await readNodeIdAliases()).toEqual([]);
  });

  it("is a no-op on an empty/whitespace id", async () => {
    await setSetting(SETTING_KEYS.nodeId, "node_random_device");
    const result = await adoptCanonicalNodeId("   ");
    expect(result.adopted).toBe(false);
    expect(await getSetting(SETTING_KEYS.nodeId)).toBe("node_random_device");
  });

  it("adopts without an alias when the device had no id yet", async () => {
    const result = await adoptCanonicalNodeId("node_canonical");
    expect(result.adopted).toBe(true);
    expect(result.previous).toBeUndefined();
    expect(await readNodeIdAliases()).toEqual([]);
  });

  it("accumulates aliases across successive adoptions and dedups", async () => {
    await setSetting(SETTING_KEYS.nodeId, "node_a");
    await adoptCanonicalNodeId("node_b");
    await adoptCanonicalNodeId("node_c");
    // Back to an old id (operator rollback): node_c becomes the alias,
    // node_a must not be duplicated.
    await adoptCanonicalNodeId("node_a");
    expect(await getSetting(SETTING_KEYS.nodeId)).toBe("node_a");
    const aliases = await readNodeIdAliases();
    expect(new Set(aliases)).toEqual(new Set(["node_b", "node_c"]));
  });

  it("caps stored aliases at MAX_NODE_ID_ALIASES, dropping oldest", async () => {
    await setSetting(SETTING_KEYS.nodeId, "node_0");
    for (let i = 1; i <= MAX_NODE_ID_ALIASES + 4; i += 1) {
      await adoptCanonicalNodeId(`node_${i}`);
    }
    const aliases = await readNodeIdAliases();
    expect(aliases.length).toBe(MAX_NODE_ID_ALIASES);
    // The oldest ids fell off; the most recent previous id is kept.
    expect(aliases).not.toContain("node_0");
    expect(aliases).toContain(`node_${MAX_NODE_ID_ALIASES + 3}`);
  });

  it("survives a corrupt alias setting", async () => {
    await setSetting(SETTING_KEYS.nodeId, "node_a");
    await setSetting(SETTING_KEYS.nodeIdAliases, "{not json");
    const result = await adoptCanonicalNodeId("node_b");
    expect(result.adopted).toBe(true);
    expect(await readNodeIdAliases()).toEqual(["node_a"]);
  });
});

describe("communityNodeIdSet / isOurNode", () => {
  it("unions current id, aliases, and invite-carried ids; drops empties", () => {
    const ids = communityNodeIdSet(
      "node_canonical",
      ["node_old_mine", ""],
      ["node_founder_pre_fix", "node_canonical", ""],
    );
    expect(ids).toEqual(
      new Set(["node_canonical", "node_old_mine", "node_founder_pre_fix"]),
    );
  });

  it("isOurNode matches any community id and the legacy empty id", () => {
    const ids = communityNodeIdSet("node_a", ["node_b"], []);
    expect(isOurNode("node_a", ids)).toBe(true);
    expect(isOurNode("node_b", ids)).toBe(true);
    expect(isOurNode("", ids)).toBe(true);
    expect(isOurNode("peer_x", ids)).toBe(false);
  });
});
