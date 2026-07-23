/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateKeyPair, type KeyPair } from "@understoria/shared/crypto";
import type { FounderNomination } from "@understoria/shared/types";
import { db, setSetting, SETTING_KEYS } from "@/db/database";
import {
  createNomination,
  readIncomingNomination,
  writeIncomingNomination,
} from "./cofounder";
import { pullFounderNomination } from "./federationSync";

// The nominee-side delivery leg of the co-founder ceremony
// (docs/cofounder-ceremony-plan.md P3): the slow-beat pull that lands
// a nomination in the incoming-nomination settings key the accept
// card renders from. Server half: apps/server/src/routes/cofounder.ts
// (recipient proof, one row per proven key).

const me: KeyPair = generateKeyPair();
const founder: KeyPair = generateKeyPair();

async function reset() {
  await Promise.all(db.tables.map((t) => t.clear()));
  await setSetting(SETTING_KEYS.communityNodeEnabled, "1");
  await setSetting(SETTING_KEYS.communityNodeUrl, "http://node.test");
  await setSetting(SETTING_KEYS.currentMember, me.publicKey);
  await db.secretKeys.put({ publicKey: me.publicKey, secretKey: me.secretKey });
  await db.secretKeys.put({
    publicKey: founder.publicKey,
    secretKey: founder.secretKey,
  });
}

function stubShelf(nomination: FounderNomination | null, status = 200) {
  const fetchSpy = vi.fn(
    async () =>
      new Response(JSON.stringify({ nomination }), { status }),
  );
  vi.stubGlobal("fetch", fetchSpy);
  return fetchSpy;
}

async function mint(): Promise<FounderNomination> {
  return createNomination({
    nominatorKey: founder.publicKey,
    nomineeKey: me.publicKey,
    nodeId: "node_test",
  });
}

describe("pullFounderNomination", () => {
  beforeEach(reset);
  afterEach(() => vi.unstubAllGlobals());

  it("returns null when mirroring is disabled or no member is signed in", async () => {
    await setSetting(SETTING_KEYS.communityNodeEnabled, "0");
    expect(await pullFounderNomination()).toBeNull();
    await setSetting(SETTING_KEYS.communityNodeEnabled, "1");
    await db.settings.delete("currentMember");
    stubShelf(await mint());
    expect(await pullFounderNomination()).toBeNull();
  });

  it("stores a verified nomination addressed to me in the incoming settings key", async () => {
    const n = await mint();
    stubShelf(n);
    expect(await pullFounderNomination()).toEqual({ inserted: 1, skipped: 0 });
    expect(await readIncomingNomination()).toEqual(n);
  });

  it("re-serving the same nomination is a skip; a resend (new signature) replaces it", async () => {
    const n = await mint();
    stubShelf(n);
    await pullFounderNomination();
    expect(await pullFounderNomination()).toEqual({ inserted: 0, skipped: 1 });
    const resent = await createNomination({
      nominatorKey: founder.publicKey,
      nomineeKey: me.publicKey,
      nodeId: "node_test",
      now: () => Date.now() + 1000,
    });
    stubShelf(resent);
    expect(await pullFounderNomination()).toEqual({ inserted: 1, skipped: 0 });
    expect(await readIncomingNomination()).toEqual(resent);
  });

  it("an authoritative empty shelf clears the local key; a transport failure leaves it", async () => {
    const n = await mint();
    await writeIncomingNomination(n);
    stubShelf(null, 503);
    expect(await pullFounderNomination()).toBeNull();
    expect(await readIncomingNomination()).toEqual(n);
    stubShelf(null);
    expect(await pullFounderNomination()).toEqual({ inserted: 0, skipped: 0 });
    expect(await readIncomingNomination()).toBeNull();
  });

  it("a row addressed to someone else clears rather than stores (dishonest node ignoring the scope)", async () => {
    const foreign = await createNomination({
      nominatorKey: founder.publicKey,
      nomineeKey: generateKeyPair().publicKey,
      nodeId: "node_test",
    });
    await writeIncomingNomination(await mint());
    stubShelf(foreign);
    expect(await pullFounderNomination()).toEqual({ inserted: 0, skipped: 0 });
    expect(await readIncomingNomination()).toBeNull();
  });
});
