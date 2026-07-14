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
//
// The infrastructure page's pure half. Locks:
//   1. Probe tri-state honesty: unreachable /config → nodeId null,
//      and null never counts as a mismatch (couldn't ask ≠ wrong).
//   2. The mismatch flag fires ONLY for the primary — mirrors run
//      their own distinct NODE_IDs by design.
//   3. Drill state survives corrupt JSON, drops out-of-range steps,
//      and round-trips through serialize/parse.
//
import { describe, expect, it } from "vitest";
import {
  drillState,
  markDrilled,
  parseDrillChecklists,
  probeEndpoints,
  resetDrill,
  serializeDrillChecklists,
  toggleDrillStep,
} from "./infraStatus";

type FakeRoute = { ok: boolean; body?: unknown } | "network-error";

function fakeFetch(routes: Record<string, FakeRoute>): typeof fetch {
  return (async (input: RequestInfo | URL) => {
    const url = String(input);
    const route = routes[url];
    if (!route) throw new Error(`unexpected fetch: ${url}`);
    if (route === "network-error") throw new TypeError("failed to fetch");
    return {
      ok: route.ok,
      json: async () => route.body ?? null,
    } as Response;
  }) as typeof fetch;
}

describe("probeEndpoints", () => {
  it("reports health and published node ids per endpoint", async () => {
    const results = await probeEndpoints({
      endpoints: ["https://a.example", "https://b.example"],
      primaryUrl: "https://a.example",
      expectedNodeIds: new Set(["community-1"]),
      fetchImpl: fakeFetch({
        "https://a.example/health": { ok: true },
        "https://a.example/config": { ok: true, body: { nodeId: "community-1" } },
        "https://b.example/health": { ok: true },
        "https://b.example/config": { ok: true, body: { nodeId: "community-1_x9" } },
      }),
    });
    expect(results).toEqual([
      {
        url: "https://a.example",
        isPrimary: true,
        healthy: true,
        nodeId: "community-1",
        nodeIdMismatch: false,
      },
      {
        url: "https://b.example",
        isPrimary: false,
        healthy: true,
        nodeId: "community-1_x9",
        // A mirror's DISTINCT id is by design, never a mismatch.
        nodeIdMismatch: false,
      },
    ]);
  });

  it("an unreachable endpoint reads honestly: not healthy, nodeId unknown, never a mismatch", async () => {
    const [result] = await probeEndpoints({
      endpoints: ["https://down.example"],
      primaryUrl: "https://down.example",
      expectedNodeIds: new Set(["community-1"]),
      fetchImpl: fakeFetch({
        "https://down.example/health": "network-error",
        "https://down.example/config": "network-error",
      }),
    });
    expect(result.healthy).toBe(false);
    expect(result.nodeId).toBeNull();
    // Couldn't ask ≠ wrong id.
    expect(result.nodeIdMismatch).toBe(false);
  });

  it("flags a primary publishing a different id than this device's community id", async () => {
    const [result] = await probeEndpoints({
      endpoints: ["https://a.example"],
      primaryUrl: "https://a.example/",
      expectedNodeIds: new Set(["community-1"]),
      fetchImpl: fakeFetch({
        "https://a.example/health": { ok: true },
        "https://a.example/config": { ok: true, body: { nodeId: "stranger" } },
      }),
    });
    expect(result.isPrimary).toBe(true); // trailing slash normalized
    expect(result.nodeIdMismatch).toBe(true);
  });

  it("no expected id on this device disables the mismatch check", async () => {
    const [result] = await probeEndpoints({
      endpoints: ["https://a.example"],
      primaryUrl: "https://a.example",
      expectedNodeIds: null,
      fetchImpl: fakeFetch({
        "https://a.example/health": { ok: true },
        "https://a.example/config": { ok: true, body: { nodeId: "anything" } },
      }),
    });
    expect(result.nodeIdMismatch).toBe(false);
  });
});

describe("drill checklists", () => {
  it("round-trips through serialize/parse", () => {
    let all = toggleDrillStep({}, "stormHub", 0, 6);
    all = toggleDrillStep(all, "stormHub", 3, 6);
    all = markDrilled(all, "reseed", "2026-07-09");
    const revived = parseDrillChecklists(serializeDrillChecklists(all));
    expect(drillState(revived, "stormHub").checked).toEqual([0, 3]);
    expect(drillState(revived, "reseed")).toEqual({
      checked: [],
      lastDrilledAt: "2026-07-09",
    });
  });

  it("toggle unchecks a checked step and drops out-of-range strays", () => {
    // A checklist that shrank in a later release: step 9 no longer exists.
    const all = { d: { checked: [1, 9], lastDrilledAt: null } };
    const next = toggleDrillStep(all, "d", 1, 6);
    expect(drillState(next, "d").checked).toEqual([]);
  });

  it("markDrilled stamps the date and clears checks; resetDrill keeps the date", () => {
    let all = toggleDrillStep({}, "d", 2, 6);
    all = markDrilled(all, "d", "2026-01-01");
    expect(drillState(all, "d")).toEqual({
      checked: [],
      lastDrilledAt: "2026-01-01",
    });
    all = toggleDrillStep(all, "d", 4, 6);
    all = resetDrill(all, "d");
    expect(drillState(all, "d")).toEqual({
      checked: [],
      lastDrilledAt: "2026-01-01",
    });
  });

  it("survives corrupt or foreign JSON as an empty tracker", () => {
    expect(parseDrillChecklists(undefined)).toEqual({});
    expect(parseDrillChecklists("not json")).toEqual({});
    expect(parseDrillChecklists('["array"]')).toEqual({});
    expect(
      parseDrillChecklists('{"d": {"checked": ["x", -1, 2, 2], "lastDrilledAt": 5}}'),
    ).toEqual({ d: { checked: [2], lastDrilledAt: null } });
  });
});
