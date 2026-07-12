/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
/**
 * Client pull of the node-system-key-signed `CapacityPosture`
 * (docs/capacity-forecast.md §6). The distinguishing case from every
 * member-signed pull: authority is the NODE SYSTEM key resolved from
 * the device's captured `/config.systemKey`, not a member key. These
 * tests pin: accept + advance on a valid node-signed posture; refuse
 * WITHOUT advancing when the signer isn't the node key or the node id
 * is unknown (cursor stays pinned); and LWW by nodeId.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  generateKeyPair,
  signStateRecord,
  type KeyPair,
} from "@understoria/shared/crypto";
import type { CapacityPosture } from "@understoria/shared/types";
import { db, getSetting, setSetting, SETTING_KEYS } from "@/db/database";
import { LAST_SEEN_SYSTEM_KEY } from "@/lib/nodeEndpoints";
import { pullCapacityPostures } from "./federationSync";

const CURSOR = "federationLastCapacityPosturePull";
const NODE_ID = "node_a";

let systemKp: KeyPair;

async function reset() {
  await Promise.all([db.capacityPostures.clear(), db.settings.clear()]);
  await setSetting(SETTING_KEYS.communityNodeEnabled, "1");
  await setSetting(SETTING_KEYS.communityNodeUrl, "http://node.test");
  systemKp = generateKeyPair();
  // Capture the node's published system key, as nodeEndpoints does off
  // GET /config — this is what the client resolver verifies against.
  await setSetting(
    LAST_SEEN_SYSTEM_KEY,
    JSON.stringify({
      nodeId: NODE_ID,
      current: systemKp.publicKey,
      history: [],
      capturedAt: "2026-01-01T00:00:00.000Z",
    }),
  );
}

function makePosture(opts: {
  signSecretKey: string;
  signerKey: string;
  nodeId?: string;
  pressure?: CapacityPosture["pressure"];
  updatedAt?: number;
}): CapacityPosture {
  const unsigned: Omit<CapacityPosture, "signature"> = {
    nodeId: opts.nodeId ?? NODE_ID,
    pressure: opts.pressure ?? "amber",
    horizon: "months",
    growthRecommended: false,
    updatedAt: opts.updatedAt ?? 5_000,
    signerKey: opts.signerKey,
  };
  return {
    ...unsigned,
    signature: signStateRecord<CapacityPosture>(unsigned, opts.signSecretKey),
  };
}

function stubPull(rows: unknown[]) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation(async () => ({
      ok: true,
      json: async () => ({ capacityPostures: rows }),
    })),
  );
}

describe("pullCapacityPostures", () => {
  beforeEach(reset);
  afterEach(() => vi.unstubAllGlobals());

  it("accepts a node-system-key-signed posture and advances the cursor", async () => {
    const rec = makePosture({
      signSecretKey: systemKp.secretKey,
      signerKey: systemKp.publicKey,
      pressure: "red",
    });
    stubPull([rec]);
    const result = await pullCapacityPostures();
    expect(result).toEqual({ inserted: 1, skipped: 0 });
    expect((await db.capacityPostures.get(NODE_ID))?.pressure).toBe("red");
    expect(await getSetting(CURSOR)).toBe(`5000:${NODE_ID}`);
  });

  it("refuses a posture signed by a non-system key (cursor pinned)", async () => {
    const stranger = generateKeyPair();
    const rec = makePosture({
      signSecretKey: stranger.secretKey,
      signerKey: stranger.publicKey,
    });
    stubPull([rec]);
    const result = await pullCapacityPostures();
    expect(result).toEqual({ inserted: 0, skipped: 1 });
    expect(await db.capacityPostures.get(NODE_ID)).toBeUndefined();
    expect(await getSetting(CURSOR)).toBeUndefined();
  });

  it("refuses a posture for an unknown node id (unresolvable key, cursor pinned)", async () => {
    // Validly self-signed, but for a node whose key this device hasn't
    // captured — the resolver returns null, so it is refused.
    const rec = makePosture({
      signSecretKey: systemKp.secretKey,
      signerKey: systemKp.publicKey,
      nodeId: "node_elsewhere",
    });
    stubPull([rec]);
    const result = await pullCapacityPostures();
    expect(result).toEqual({ inserted: 0, skipped: 1 });
    expect(await db.capacityPostures.get("node_elsewhere")).toBeUndefined();
    expect(await getSetting(CURSOR)).toBeUndefined();
  });

  it("LWW by nodeId: newer replaces, older is a no-op that still advances", async () => {
    await db.capacityPostures.put(
      makePosture({
        signSecretKey: systemKp.secretKey,
        signerKey: systemKp.publicKey,
        pressure: "green",
        updatedAt: 5_000,
      }),
    );
    // An older posture is ignored; a newer one replaces.
    const older = makePosture({
      signSecretKey: systemKp.secretKey,
      signerKey: systemKp.publicKey,
      pressure: "red",
      updatedAt: 4_000,
    });
    const newer = makePosture({
      signSecretKey: systemKp.secretKey,
      signerKey: systemKp.publicKey,
      pressure: "amber",
      updatedAt: 6_000,
    });
    stubPull([older, newer]);
    const result = await pullCapacityPostures();
    expect(result).toEqual({ inserted: 1, skipped: 1 });
    expect((await db.capacityPostures.get(NODE_ID))?.pressure).toBe("amber");
    expect(await getSetting(CURSOR)).toBe(`6000:${NODE_ID}`);
  });
});
