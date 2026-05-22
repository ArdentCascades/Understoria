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
});

describe("resetNodeConfig", () => {
  beforeEach(reset);

  it("rewrites the row with the shipped defaults", async () => {
    await putNodeConfig(NODE, {
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
