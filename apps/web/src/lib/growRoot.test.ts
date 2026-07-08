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
import { MINIMUM_VOUCHES_FOR_TRUST } from "@/lib/vouch";
import {
  buildMirrorEnv,
  buildOriginHandover,
  generateMirrorToken,
  MIN_VOUCHES_TO_GROW,
  probeNewRoot,
  suggestNodeId,
  type RootCheckId,
} from "./growRoot";

describe("MIN_VOUCHES_TO_GROW", () => {
  it("reuses the community's existing trusted threshold", () => {
    expect(MIN_VOUCHES_TO_GROW).toBe(MINIMUM_VOUCHES_FOR_TRUST);
  });
});

describe("generateMirrorToken", () => {
  it("emits 43 base64url chars (32 bytes, no padding) — over the ≥16 floor", () => {
    const token = generateMirrorToken();
    expect(token).toHaveLength(43);
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(token).not.toContain("=");
  });

  it("is unique across calls", () => {
    const tokens = new Set(
      Array.from({ length: 20 }, () => generateMirrorToken()),
    );
    expect(tokens.size).toBe(20);
  });
});

describe("suggestNodeId", () => {
  it("keeps the origin id as prefix with a 4-char base36 suffix", () => {
    const id = suggestNodeId("maple_grove");
    expect(id).toMatch(/^maple_grove_[0-9a-z]{4}$/);
  });

  it("is distinct across calls (collision-proof suffix)", () => {
    const ids = new Set(
      Array.from({ length: 20 }, () => suggestNodeId("origin")),
    );
    expect(ids.size).toBeGreaterThan(18);
  });
});

describe("buildMirrorEnv", () => {
  const base = {
    originUrl: "https://origin.example",
    pwaOrigin: "https://app.example",
    token: "tok_abcdefghijklmnop",
    nodeId: "origin_ab12",
  };

  it("contains the CORS gotcha, mirror pull target, and node id", () => {
    const env = buildMirrorEnv({ ...base, readAuthOn: true });
    expect(env).toContain("CORS_ORIGIN=https://app.example");
    expect(env).toContain("MIRROR_NODE_URLS=https://origin.example");
    expect(env).toContain("NODE_ID=origin_ab12");
  });

  it("includes the token + READ_AUTH=on only when the read gate is on", () => {
    const on = buildMirrorEnv({ ...base, readAuthOn: true });
    expect(on).toContain("READ_AUTH=on");
    expect(on).toContain(
      'MIRROR_READ_TOKENS={"https://origin.example":"tok_abcdefghijklmnop"}',
    );

    const off = buildMirrorEnv({ ...base, readAuthOn: false });
    expect(off).toContain("READ_AUTH=off");
    expect(off).not.toContain(base.token);
    expect(off).not.toContain("MIRROR_READ_TOKENS");
  });

  it("always carries the founder-keys and quorum placeholders", () => {
    for (const readAuthOn of [true, false]) {
      const env = buildMirrorEnv({ ...base, readAuthOn });
      expect(env).toContain(
        "NODE_FOUNDER_KEYS=<ask your current operator — must match exactly>",
      );
      expect(env).toContain("REMOVAL_QUORUM=<match the origin>");
      expect(env).toContain("DATABASE_KEY=");
    }
  });

  it("normalizes a trailing slash on the origin url", () => {
    const env = buildMirrorEnv({
      ...base,
      originUrl: "https://origin.example/",
      readAuthOn: true,
    });
    expect(env).toContain("MIRROR_NODE_URLS=https://origin.example\n");
  });
});

describe("buildOriginHandover", () => {
  it("carries the mirror-pull and announce lines for the new url", () => {
    const block = buildOriginHandover({
      newNodeUrl: "https://node2.example",
      token: "tok_abcdefghijklmnop",
      readAuthOn: false,
    });
    expect(block).toContain("MIRROR_NODE_URLS=https://node2.example");
    expect(block).toContain("MIRROR_ANNOUNCE_URLS=https://node2.example");
    expect(block).toContain("docker compose up -d");
    expect(block).not.toContain("MIRROR_READ_TOKENS");
  });

  it("adds the token map entry when the read gate is on", () => {
    const block = buildOriginHandover({
      newNodeUrl: "https://node2.example/",
      token: "tok_abcdefghijklmnop",
      readAuthOn: true,
    });
    expect(block).toContain(
      'MIRROR_READ_TOKENS={"https://node2.example":"tok_abcdefghijklmnop"}',
    );
  });
});

// --- probeNewRoot -----------------------------------------------------

type Route = { ok: boolean; body?: unknown } | "network";

function stubFetch(routes: Record<string, Route>): typeof fetch {
  return (async (input: RequestInfo | URL) => {
    const url = String(input);
    const route = routes[url];
    if (route === undefined || route === "network") {
      throw new TypeError("fetch failed");
    }
    return {
      ok: route.ok,
      json: async () => route.body ?? {},
    } as Response;
  }) as typeof fetch;
}

const NEW_URL = "https://node2.example";
const ORIGIN_URL = "https://origin.example";

function byId(
  results: Awaited<ReturnType<typeof probeNewRoot>>,
): Record<RootCheckId, boolean | null> {
  const map = {} as Record<RootCheckId, boolean | null>;
  for (const r of results) map[r.id] = r.ok;
  return map;
}

describe("probeNewRoot", () => {
  it("all good: every check ok (announce compare normalizes slashes)", async () => {
    const results = await probeNewRoot({
      url: `${NEW_URL}/`,
      originUrl: ORIGIN_URL,
      originNodeId: "origin_a",
      fetchImpl: stubFetch({
        [`${NEW_URL}/health`]: { ok: true },
        [`${NEW_URL}/config`]: { ok: true, body: { nodeId: "origin_a_x9k2" } },
        [`${ORIGIN_URL}/config`]: {
          ok: true,
          body: { mirrors: [`${NEW_URL}/`] },
        },
      }),
    });
    expect(results.map((r) => r.id)).toEqual([
      "reachable",
      "config",
      "distinctNodeId",
      "announced",
    ]);
    expect(byId(results)).toEqual({
      reachable: true,
      config: true,
      distinctNodeId: true,
      announced: true,
    });
  });

  it("health down: reachable false, the later checks are still listed", async () => {
    const results = await probeNewRoot({
      url: NEW_URL,
      originUrl: ORIGIN_URL,
      originNodeId: "origin_a",
      fetchImpl: stubFetch({
        [`${NEW_URL}/health`]: "network",
        [`${NEW_URL}/config`]: "network",
        [`${ORIGIN_URL}/config`]: { ok: true, body: { mirrors: [] } },
      }),
    });
    expect(results).toHaveLength(4);
    const ok = byId(results);
    expect(ok.reachable).toBe(false);
    expect(ok.config).toBe(false);
    // No nodeId could be read → indeterminate, not a fake failure.
    expect(ok.distinctNodeId).toBeNull();
    expect(ok.announced).toBe(false);
  });

  it("nodeId collision: distinctNodeId false", async () => {
    const results = await probeNewRoot({
      url: NEW_URL,
      originUrl: ORIGIN_URL,
      originNodeId: "origin_a",
      fetchImpl: stubFetch({
        [`${NEW_URL}/health`]: { ok: true },
        [`${NEW_URL}/config`]: { ok: true, body: { nodeId: "origin_a" } },
        [`${ORIGIN_URL}/config`]: {
          ok: true,
          body: { mirrors: [NEW_URL] },
        },
      }),
    });
    expect(byId(results).distinctNodeId).toBe(false);
  });

  it("origin nodeId unknown (no system key published): distinctNodeId is null", async () => {
    const results = await probeNewRoot({
      url: NEW_URL,
      originUrl: ORIGIN_URL,
      originNodeId: null,
      fetchImpl: stubFetch({
        [`${NEW_URL}/health`]: { ok: true },
        [`${NEW_URL}/config`]: { ok: true, body: { nodeId: "origin_a_x9k2" } },
        [`${ORIGIN_URL}/config`]: { ok: true, body: { mirrors: [NEW_URL] } },
      }),
    });
    expect(byId(results).distinctNodeId).toBeNull();
  });

  it("not yet announced: announced false when the origin answers without the url", async () => {
    const results = await probeNewRoot({
      url: NEW_URL,
      originUrl: ORIGIN_URL,
      originNodeId: "origin_a",
      fetchImpl: stubFetch({
        [`${NEW_URL}/health`]: { ok: true },
        [`${NEW_URL}/config`]: { ok: true, body: { nodeId: "origin_a_x9k2" } },
        [`${ORIGIN_URL}/config`]: { ok: true, body: {} },
      }),
    });
    expect(byId(results).announced).toBe(false);
  });

  it("origin unreachable: announced is null (couldn't ask ≠ not announced)", async () => {
    const results = await probeNewRoot({
      url: NEW_URL,
      originUrl: ORIGIN_URL,
      originNodeId: "origin_a",
      fetchImpl: stubFetch({
        [`${NEW_URL}/health`]: { ok: true },
        [`${NEW_URL}/config`]: { ok: true, body: { nodeId: "origin_a_x9k2" } },
        [`${ORIGIN_URL}/config`]: "network",
      }),
    });
    expect(byId(results).announced).toBeNull();
  });
});
