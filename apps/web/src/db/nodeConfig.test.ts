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
import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_NODE_CONFIG } from "@/types";
import { db } from "./database";
import {
  getNodeConfig,
  InvalidNodeConfigError,
  putNodeConfig,
  resetNodeConfig,
  setInviteOnly,
} from "./nodeConfig";

const NODE = "node_config_test";

async function reset() {
  await db.nodeConfig.clear();
}

describe("getNodeConfig", () => {
  beforeEach(reset);

  it("returns the shipped defaults when no row exists", async () => {
    const config = await getNodeConfig(NODE);
    expect(config).toEqual(DEFAULT_NODE_CONFIG);
  });

  it("returns the stored values when a row exists", async () => {
    await db.nodeConfig.put({
      nodeId: NODE,
      ...DEFAULT_NODE_CONFIG,
      dailyHelperLimit: 5,
      shortExchangeHours: 0.5,
      reciprocalPairThreshold: 4,
    });
    const config = await getNodeConfig(NODE);
    expect(config.dailyHelperLimit).toBe(5);
    expect(config.shortExchangeHours).toBe(0.5);
    expect(config.reciprocalPairThreshold).toBe(4);
  });

  it("scopes by nodeId — a different node's config does not leak", async () => {
    await putNodeConfig("node_a", {
      ...DEFAULT_NODE_CONFIG,
      dailyHelperLimit: 7,
      shortExchangeHours: 0.1,
      reciprocalPairThreshold: 5,
    });
    const other = await getNodeConfig("node_b");
    expect(other).toEqual(DEFAULT_NODE_CONFIG);
  });
});

describe("putNodeConfig", () => {
  beforeEach(reset);

  it("persists the new values and returns them", async () => {
    const next = {
      ...DEFAULT_NODE_CONFIG,
      dailyHelperLimit: 6,
      shortExchangeHours: 0.4,
      reciprocalPairThreshold: 4,
    };
    const written = await putNodeConfig(NODE, next);
    expect(written).toEqual(next);
    const readBack = await getNodeConfig(NODE);
    expect(readBack).toEqual(next);
  });

  it("rejects a daily limit below 1", async () => {
    await expect(
      putNodeConfig(NODE, {
        ...DEFAULT_NODE_CONFIG,
        dailyHelperLimit: 0,
      }),
    ).rejects.toBeInstanceOf(InvalidNodeConfigError);
  });

  it("rejects a non-finite short-exchange threshold", async () => {
    await expect(
      putNodeConfig(NODE, {
        ...DEFAULT_NODE_CONFIG,
        shortExchangeHours: Number.POSITIVE_INFINITY,
      }),
    ).rejects.toBeInstanceOf(InvalidNodeConfigError);
  });

  it("rejects a short-exchange threshold above 24 hours", async () => {
    await expect(
      putNodeConfig(NODE, {
        ...DEFAULT_NODE_CONFIG,
        shortExchangeHours: 25,
      }),
    ).rejects.toBeInstanceOf(InvalidNodeConfigError);
  });

  it("rejects a reciprocal threshold below 2", async () => {
    await expect(
      putNodeConfig(NODE, {
        ...DEFAULT_NODE_CONFIG,
        reciprocalPairThreshold: 1,
      }),
    ).rejects.toBeInstanceOf(InvalidNodeConfigError);
  });

  it("rejects a negative task check-in grace", async () => {
    await expect(
      putNodeConfig(NODE, {
        ...DEFAULT_NODE_CONFIG,
        taskCheckInGraceDays: -1,
      }),
    ).rejects.toBeInstanceOf(InvalidNodeConfigError);
  });

  it("accepts a zero grace (chip fires the moment the floor is met)", async () => {
    const next = {
      ...DEFAULT_NODE_CONFIG,
      taskCheckInGraceDays: 0,
    };
    const written = await putNodeConfig(NODE, next);
    expect(written.taskCheckInGraceDays).toBe(0);
  });
});

describe("putNodeConfig — customMilestones", () => {
  beforeEach(reset);

  it("persists a valid custom milestone array", async () => {
    const written = await putNodeConfig(NODE, {
      ...DEFAULT_NODE_CONFIG,
      customMilestones: [
        { type: "exchanges", threshold: 250, label: "250 union actions" },
      ],
    });
    expect(written.customMilestones).toHaveLength(1);
    expect(written.customMilestones[0].label).toBe("250 union actions");
  });

  it("trims whitespace from labels", async () => {
    const written = await putNodeConfig(NODE, {
      ...DEFAULT_NODE_CONFIG,
      customMilestones: [
        { type: "members", threshold: 5, label: "  five friends  " },
      ],
    });
    expect(written.customMilestones[0].label).toBe("five friends");
  });

  it("rejects an unknown milestone type", async () => {
    await expect(
      putNodeConfig(NODE, {
        ...DEFAULT_NODE_CONFIG,
        customMilestones: [
          // @ts-expect-error — testing invalid input
          { type: "fridges", threshold: 100, label: "x" },
        ],
      }),
    ).rejects.toBeInstanceOf(InvalidNodeConfigError);
  });

  it("rejects a non-positive threshold", async () => {
    await expect(
      putNodeConfig(NODE, {
        ...DEFAULT_NODE_CONFIG,
        customMilestones: [{ type: "hours", threshold: 0, label: "zero" }],
      }),
    ).rejects.toBeInstanceOf(InvalidNodeConfigError);
  });

  it("rejects a non-integer threshold", async () => {
    await expect(
      putNodeConfig(NODE, {
        ...DEFAULT_NODE_CONFIG,
        customMilestones: [
          { type: "hours", threshold: 1.5, label: "halfway" },
        ],
      }),
    ).rejects.toBeInstanceOf(InvalidNodeConfigError);
  });

  it("rejects an empty label", async () => {
    await expect(
      putNodeConfig(NODE, {
        ...DEFAULT_NODE_CONFIG,
        customMilestones: [{ type: "hours", threshold: 10, label: "   " }],
      }),
    ).rejects.toBeInstanceOf(InvalidNodeConfigError);
  });

  it("rejects a label longer than 80 chars", async () => {
    await expect(
      putNodeConfig(NODE, {
        ...DEFAULT_NODE_CONFIG,
        customMilestones: [
          { type: "hours", threshold: 10, label: "x".repeat(81) },
        ],
      }),
    ).rejects.toBeInstanceOf(InvalidNodeConfigError);
  });

  it("rejects duplicate (type, threshold) pairs within the custom list", async () => {
    await expect(
      putNodeConfig(NODE, {
        ...DEFAULT_NODE_CONFIG,
        customMilestones: [
          { type: "hours", threshold: 75, label: "first" },
          { type: "hours", threshold: 75, label: "second" },
        ],
      }),
    ).rejects.toBeInstanceOf(InvalidNodeConfigError);
  });

  it("rejects more than 20 entries", async () => {
    const tooMany = Array.from({ length: 21 }, (_, i) => ({
      type: "hours" as const,
      threshold: 100 + i,
      label: `m${i}`,
    }));
    await expect(
      putNodeConfig(NODE, {
        ...DEFAULT_NODE_CONFIG,
        customMilestones: tooMany,
      }),
    ).rejects.toBeInstanceOf(InvalidNodeConfigError);
  });
});

describe("inviteOnly", () => {
  beforeEach(reset);

  it("defaults to false when no row exists", async () => {
    const config = await getNodeConfig(NODE);
    expect(config.inviteOnly).toBe(false);
  });

  it("defaults to false when a row exists without the field (back-compat)", async () => {
    // Older nodes wrote rows before `inviteOnly` existed. Their stored
    // shape has no `inviteOnly` property — the read path must coerce
    // missing to false so they keep their legacy open-onboarding
    // behavior. Bypass the typed `putNodeConfig` to simulate the
    // pre-field shape on disk.
    await db.nodeConfig.put({
      nodeId: NODE,
      ...DEFAULT_NODE_CONFIG,
      inviteOnly: undefined,
    });
    const config = await getNodeConfig(NODE);
    expect(config.inviteOnly).toBe(false);
  });

  it("round-trips a true value through putNodeConfig", async () => {
    const written = await putNodeConfig(NODE, {
      ...DEFAULT_NODE_CONFIG,
      inviteOnly: true,
    });
    expect(written.inviteOnly).toBe(true);
    const readBack = await getNodeConfig(NODE);
    expect(readBack.inviteOnly).toBe(true);
  });

  it("setInviteOnly flips the flag without disturbing other fields", async () => {
    await putNodeConfig(NODE, {
      ...DEFAULT_NODE_CONFIG,
      dailyHelperLimit: 7,
      shortExchangeHours: 0.5,
    });
    const flipped = await setInviteOnly(NODE, true);
    expect(flipped.inviteOnly).toBe(true);
    expect(flipped.dailyHelperLimit).toBe(7);
    expect(flipped.shortExchangeHours).toBe(0.5);
    const off = await setInviteOnly(NODE, false);
    expect(off.inviteOnly).toBe(false);
    expect(off.dailyHelperLimit).toBe(7);
  });

  it("rejects a non-boolean inviteOnly value", async () => {
    await expect(
      putNodeConfig(NODE, {
        ...DEFAULT_NODE_CONFIG,
        // @ts-expect-error — testing invalid input
        inviteOnly: "yes",
      }),
    ).rejects.toBeInstanceOf(InvalidNodeConfigError);
  });
});

describe("resetNodeConfig", () => {
  beforeEach(reset);

  it("rewrites the row with the shipped defaults", async () => {
    await putNodeConfig(NODE, {
      ...DEFAULT_NODE_CONFIG,
      dailyHelperLimit: 10,
      shortExchangeHours: 1,
      reciprocalPairThreshold: 5,
    });
    const reset = await resetNodeConfig(NODE);
    expect(reset).toEqual(DEFAULT_NODE_CONFIG);
    const readBack = await getNodeConfig(NODE);
    expect(readBack).toEqual(DEFAULT_NODE_CONFIG);
  });
});
