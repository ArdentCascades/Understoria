/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  canonicalExchangePayload,
  generateKeyPair,
  sign,
} from "@understoria/shared/crypto";
import type { Exchange } from "@/types";
import { db, getSetting, setSetting, SETTING_KEYS } from "@/db/database";
import { pullFederatedExchanges } from "./federationSync";

async function reset() {
  await Promise.all([db.exchanges.clear(), db.settings.clear()]);
  await setSetting(SETTING_KEYS.communityNodeEnabled, "1");
  await setSetting(SETTING_KEYS.communityNodeUrl, "http://node.test");
}

function makeSignedExchange(opts: {
  id: string;
  nodeId: string;
  completedAt: number;
  hours?: number;
}): Exchange {
  const helper = generateKeyPair();
  const helped = generateKeyPair();
  const payload = canonicalExchangePayload({
    postId: `p_${opts.id}`,
    helperKey: helper.publicKey,
    helpedKey: helped.publicKey,
    hours: opts.hours ?? 1,
    category: "other",
    completedAt: opts.completedAt,
  });
  return {
    id: opts.id,
    postId: `p_${opts.id}`,
    helperKey: helper.publicKey,
    helpedKey: helped.publicKey,
    hoursExchanged: opts.hours ?? 1,
    helperSignature: sign(payload, helper.secretKey),
    helpedSignature: sign(payload, helped.secretKey),
    completedAt: opts.completedAt,
    category: "other",
    nodeId: opts.nodeId,
  };
}

describe("pullFederatedExchanges", () => {
  beforeEach(reset);
  afterEach(() => vi.unstubAllGlobals());

  it("returns null when mirroring is disabled", async () => {
    await setSetting(SETTING_KEYS.communityNodeEnabled, "0");
    const result = await pullFederatedExchanges();
    expect(result).toBeNull();
  });

  it("inserts verified peer rows and advances the cursor", async () => {
    const peer = makeSignedExchange({
      id: "peer_1",
      nodeId: "peer_node",
      completedAt: 1000,
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ exchanges: [peer] }),
      }),
    );
    const result = await pullFederatedExchanges();
    expect(result).toEqual({ inserted: 1, skipped: 0 });
    expect(await db.exchanges.get("peer_1")).toMatchObject({
      nodeId: "peer_node",
    });
    expect(await getSetting(SETTING_KEYS.federationLastExchangePull)).toBe(
      "1000",
    );
  });

  it("skips rows whose helper signature does not verify", async () => {
    const bad = makeSignedExchange({
      id: "bad_1",
      nodeId: "peer_node",
      completedAt: 500,
    });
    bad.helperSignature = sign("tampered", generateKeyPair().secretKey);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ exchanges: [bad] }),
      }),
    );
    const result = await pullFederatedExchanges();
    expect(result).toEqual({ inserted: 0, skipped: 1 });
    expect(await db.exchanges.get("bad_1")).toBeUndefined();
  });

  it("dedups on id across repeated pulls (idempotent)", async () => {
    const peer = makeSignedExchange({
      id: "peer_dup",
      nodeId: "peer_node",
      completedAt: 2000,
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ exchanges: [peer] }),
      }),
    );
    await pullFederatedExchanges();
    const second = await pullFederatedExchanges();
    expect(second).toEqual({ inserted: 0, skipped: 1 });
    expect(await db.exchanges.count()).toBe(1);
  });

  it("sends the persisted cursor as ?since on subsequent pulls", async () => {
    await setSetting(SETTING_KEYS.federationLastExchangePull, "777");
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ exchanges: [] }),
    });
    vi.stubGlobal("fetch", fetchSpy);
    await pullFederatedExchanges();
    const url = fetchSpy.mock.calls[0][0] as string;
    expect(url).toContain("since=777");
  });
});
