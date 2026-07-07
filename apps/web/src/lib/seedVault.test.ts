/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { beforeEach, describe, expect, it } from "vitest";
import { generateKeyPair, verifyStateRecord } from "@understoria/shared/crypto";
import { db, getSetting, setSetting, SETTING_KEYS } from "@/db/database";
import { createMember } from "@/db/seed";
import { persistSecretKey } from "@/db/secrets";
import {
  countActiveSeedVaults,
  getMySeedVaultPledge,
  setSeedVaultPledge,
} from "./seedVault";
import { getWindowHorizonMs, WINDOW_HORIZON_KEY, YEAR_MS } from "./storageWindow";

async function wipe() {
  await Promise.all(db.tables.map((t) => t.clear()));
}

beforeEach(wipe);

async function beMember(name: string) {
  const kp = generateKeyPair();
  await createMember({ publicKey: kp.publicKey, displayName: name }, "node_t");
  await persistSecretKey(kp.publicKey, kp.secretKey);
  await setSetting(SETTING_KEYS.currentMember, kp.publicKey);
  // The outbox only queues when a community node is configured.
  await setSetting(SETTING_KEYS.communityNodeUrl, "https://node.test/api");
  return kp;
}

describe("seed-vault pledges", () => {
  it("signs, stores, and queues the pledge; retraction flips it", async () => {
    const me = await beMember("Vera");
    const result = await setSeedVaultPledge(true);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(verifyStateRecord(result.pledge)).toBe(true);
    expect(result.pledge.signerKey).toBe(me.publicKey);

    const row = await getMySeedVaultPledge();
    expect(row?.active).toBe(true);
    expect(await countActiveSeedVaults()).toBe(1);

    const queued = await db.outbox
      .filter((r) => r.kind === "seed_vault_pledge")
      .toArray();
    expect(queued).toHaveLength(1);

    const retract = await setSeedVaultPledge(false);
    expect(retract.ok).toBe(true);
    expect((await getMySeedVaultPledge())?.active).toBe(false);
    expect(await countActiveSeedVaults()).toBe(0);
    // The retraction REPLACED the pending pledge in the queue (same
    // natural dedup key) — a vault can't race its own withdrawal.
    const afterRetract = await db.outbox
      .filter((r) => r.kind === "seed_vault_pledge")
      .toArray();
    expect(afterRetract).toHaveLength(1);
  });

  it("pledging undoes a local window — a vault must hold everything", async () => {
    await beMember("Vera");
    await setSetting(WINDOW_HORIZON_KEY, String(2 * YEAR_MS));
    await setSetting("federationLastPostPull", "12345");

    const result = await setSeedVaultPledge(true);
    expect(result.ok).toBe(true);
    expect(await getWindowHorizonMs()).toBeNull();
    // Cursors reset so the freed-up history re-downloads.
    expect(await getSetting("federationLastPostPull")).toBeUndefined();
  });

  it("refuses without an identity", async () => {
    expect(await setSeedVaultPledge(true)).toEqual({
      ok: false,
      error: "no_identity",
    });
  });
});
