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
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { db, getSetting, setSetting, SETTING_KEYS } from "@/db/database";
import {
  acceptMirror,
  cursorKeySuffix,
  dismissMirror,
  getActiveNodeUrl,
  invalidateActiveNode,
  listNodeEndpoints,
  nodeSuccessKey,
  normalizeNodeUrl,
  pendingMirrorSuggestions,
  recordNodeSuccess,
  removeMirror,
  urlHash,
} from "./nodeEndpoints";
import {
  LAST_SEEN_FOUNDER_HASHES,
  readFounderHashCapture,
} from "./founderRoots";

const PRIMARY = "https://primary.example/api";
const MIRROR = "https://mirror.example/api";

async function configureNode(url = PRIMARY): Promise<void> {
  await setSetting(SETTING_KEYS.communityNodeUrl, url);
  await setSetting(SETTING_KEYS.communityNodeEnabled, "1");
}

function okFetch(...reachable: string[]): typeof fetch {
  return (async (input: RequestInfo | URL) => {
    const url = String(input);
    const up = reachable.some((base) => url.startsWith(base));
    if (!up) throw new Error("unreachable");
    return new Response("{}", { status: 200 });
  }) as typeof fetch;
}

beforeEach(async () => {
  await db.settings.clear();
  invalidateActiveNode();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("url helpers", () => {
  it("normalizes trailing slashes and whitespace", () => {
    expect(normalizeNodeUrl("  https://a.example/api// ")).toBe(
      "https://a.example/api",
    );
  });

  it("hashes are stable across trailing-slash variants and distinct per URL", () => {
    expect(urlHash("https://a.example/api")).toBe(
      urlHash("https://a.example/api/"),
    );
    expect(urlHash("https://a.example/api")).not.toBe(
      urlHash("https://b.example/api"),
    );
  });

  it("the primary keeps the LEGACY unsuffixed cursor key; mirrors get a scoped one", () => {
    expect(cursorKeySuffix(PRIMARY, PRIMARY)).toBe("");
    expect(cursorKeySuffix(`${PRIMARY}/`, PRIMARY)).toBe("");
    expect(cursorKeySuffix(MIRROR, PRIMARY)).toBe(`::${urlHash(MIRROR)}`);
  });
});

describe("endpoint list + mirror consent", () => {
  it("is empty when node sync is disabled", async () => {
    await setSetting(SETTING_KEYS.communityNodeUrl, PRIMARY);
    // enabled flag missing → off
    expect(await listNodeEndpoints()).toEqual({ primary: null, endpoints: [] });
  });

  it("lists the primary first, then accepted mirrors, never duplicating the primary", async () => {
    await configureNode();
    await acceptMirror(MIRROR);
    await acceptMirror(`${PRIMARY}/`); // the primary itself, re-announced
    const { primary, endpoints } = await listNodeEndpoints();
    expect(primary).toBe(PRIMARY);
    expect(endpoints).toEqual([PRIMARY, MIRROR]);
  });

  it("accept is idempotent and remove undoes it", async () => {
    await configureNode();
    await acceptMirror(MIRROR);
    await acceptMirror(MIRROR);
    expect((await listNodeEndpoints()).endpoints).toEqual([PRIMARY, MIRROR]);
    await removeMirror(MIRROR);
    expect((await listNodeEndpoints()).endpoints).toEqual([PRIMARY]);
  });
});

describe("getActiveNodeUrl", () => {
  it("returns null when sync is off", async () => {
    expect(await getActiveNodeUrl({ fetchImpl: okFetch(PRIMARY) })).toBeNull();
  });

  it("stays on the primary while it answers", async () => {
    await configureNode();
    await acceptMirror(MIRROR);
    const active = await getActiveNodeUrl({
      fetchImpl: okFetch(PRIMARY, MIRROR),
    });
    expect(active).toEqual({ url: PRIMARY, isPrimary: true });
  });

  it("fails over to an accepted mirror when the primary is down — zero member action", async () => {
    await configureNode();
    await acceptMirror(MIRROR);
    const active = await getActiveNodeUrl({ fetchImpl: okFetch(MIRROR) });
    expect(active).toEqual({ url: MIRROR, isPrimary: false });
  });

  it("falls back to the primary when everything is down (pulls keep their own error handling)", async () => {
    await configureNode();
    await acceptMirror(MIRROR);
    const active = await getActiveNodeUrl({ fetchImpl: okFetch() });
    expect(active).toEqual({ url: PRIMARY, isPrimary: true });
  });

  it("skips probing entirely with a single endpoint (Phase A behavior preserved)", async () => {
    await configureNode();
    const fetchImpl = vi.fn();
    const active = await getActiveNodeUrl({
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(active).toEqual({ url: PRIMARY, isPrimary: true });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("invalidates the cached resolution when the mirror list changes", async () => {
    await configureNode();
    await acceptMirror(MIRROR);
    expect(
      (await getActiveNodeUrl({ fetchImpl: okFetch(MIRROR) }))?.url,
    ).toBe(MIRROR);
    // Removing the mirror must not leave the cache pointing at it.
    await removeMirror(MIRROR);
    expect(
      (await getActiveNodeUrl({ fetchImpl: okFetch(PRIMARY) }))?.url,
    ).toBe(PRIMARY);
  });
});

describe("pendingMirrorSuggestions", () => {
  function configFetch(mirrors: unknown): typeof fetch {
    return (async () =>
      new Response(JSON.stringify({ mirrors }), {
        status: 200,
      })) as typeof fetch;
  }

  it("offers announced mirrors the member hasn't answered", async () => {
    await configureNode();
    expect(
      await pendingMirrorSuggestions({ fetchImpl: configFetch([MIRROR]) }),
    ).toEqual([MIRROR]);
  });

  it("filters out accepted, dismissed, the primary itself, and non-URL garbage", async () => {
    await configureNode();
    const other = "https://third.example/api";
    await acceptMirror(MIRROR);
    await dismissMirror(other);
    expect(
      await pendingMirrorSuggestions({
        fetchImpl: configFetch([
          MIRROR,
          other,
          PRIMARY,
          "not-a-url",
          42,
          "https://fresh.example/api",
        ]),
      }),
    ).toEqual(["https://fresh.example/api"]);
  });

  it("resolves empty when sync is off, the node omits the field, or the fetch fails", async () => {
    expect(
      await pendingMirrorSuggestions({ fetchImpl: configFetch([MIRROR]) }),
    ).toEqual([]);
    await configureNode();
    expect(
      await pendingMirrorSuggestions({ fetchImpl: configFetch(undefined) }),
    ).toEqual([]);
    expect(
      await pendingMirrorSuggestions({
        fetchImpl: (async () => {
          throw new Error("down");
        }) as typeof fetch,
      }),
    ).toEqual([]);
  });

  it("adopts the primary's published nodeId as the device's canonical id", async () => {
    // Node-canonical identity (lib/nodeIdentity.ts): the /config fetch
    // this helper already performs against the CONSENTED primary is the
    // adoption + self-heal hook. A device holding a random pre-fix id
    // flips to the published id, keeping the old one as an alias so its
    // history still reads as "ours".
    await configureNode();
    await setSetting(SETTING_KEYS.nodeId, "node_random_device");
    const withNodeId = (async () =>
      new Response(JSON.stringify({ nodeId: "node_canonical", mirrors: [] }), {
        status: 200,
      })) as typeof fetch;
    await pendingMirrorSuggestions({ fetchImpl: withNodeId });
    expect(await getSetting(SETTING_KEYS.nodeId)).toBe("node_canonical");
    const { readNodeIdAliases } = await import("./nodeIdentity");
    expect(await readNodeIdAliases()).toEqual(["node_random_device"]);
    // Re-running against the same id is a stable no-op.
    await pendingMirrorSuggestions({ fetchImpl: withNodeId });
    expect(await getSetting(SETTING_KEYS.nodeId)).toBe("node_canonical");
    expect(await readNodeIdAliases()).toEqual(["node_random_device"]);
  });

  it("captures published founderKeyHashes (with the nodeId salt); an absent field keeps the prior capture", async () => {
    await configureNode();
    const withHashes = (async () =>
      new Response(
        JSON.stringify({
          nodeId: "node_canonical",
          founderKeyHashes: ["hashA", "hashB", "", 42],
          mirrors: [],
        }),
        { status: 200 },
      )) as typeof fetch;
    await pendingMirrorSuggestions({ fetchImpl: withHashes });
    expect(await readFounderHashCapture()).toEqual({
      nodeId: "node_canonical",
      hashes: ["hashA", "hashB"],
    });

    // An older server (no field) must NOT wipe the capture — the
    // trust roots a device already learned survive a temporary
    // downgrade or a mirror that predates the feature.
    const withoutField = (async () =>
      new Response(JSON.stringify({ nodeId: "node_canonical", mirrors: [] }), {
        status: 200,
      })) as typeof fetch;
    await pendingMirrorSuggestions({ fetchImpl: withoutField });
    expect(await readFounderHashCapture()).toEqual({
      nodeId: "node_canonical",
      hashes: ["hashA", "hashB"],
    });
    // And without a nodeId there is no salt to verify against, so no
    // capture happens either.
    await setSetting(LAST_SEEN_FOUNDER_HASHES, "");
    const hashesNoNodeId = (async () =>
      new Response(JSON.stringify({ founderKeyHashes: ["hashC"] }), {
        status: 200,
      })) as typeof fetch;
    await pendingMirrorSuggestions({ fetchImpl: hashesNoNodeId });
    expect(await readFounderHashCapture()).toBeNull();
  });

  it("does not touch the device id when /config omits nodeId", async () => {
    await configureNode();
    await setSetting(SETTING_KEYS.nodeId, "node_random_device");
    await pendingMirrorSuggestions({ fetchImpl: configFetch([MIRROR]) });
    expect(await getSetting(SETTING_KEYS.nodeId)).toBe("node_random_device");
  });
});

describe("recordNodeSuccess", () => {
  it("writes the per-node key AND refreshes the legacy global key", async () => {
    await configureNode();
    await acceptMirror(MIRROR);
    await recordNodeSuccess(MIRROR);
    const perNode = await getSetting(nodeSuccessKey(MIRROR, PRIMARY));
    const legacy = await getSetting(SETTING_KEYS.communityNodeLastSuccess);
    expect(perNode).toBeTruthy();
    expect(legacy).toBeTruthy();
    // The mirror's key is scoped — the PRIMARY's per-node key is the
    // legacy key itself and must not have been claimed by the mirror.
    expect(nodeSuccessKey(PRIMARY, PRIMARY)).toBe(
      SETTING_KEYS.communityNodeLastSuccess,
    );
  });
});
