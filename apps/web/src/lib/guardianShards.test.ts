/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { beforeEach, describe, expect, it } from "vitest";
import { generateKeyPair } from "@understoria/shared/crypto";
import { db, getSetting, setSetting, SETTING_KEYS } from "@/db/database";
import { createMember } from "@/db/seed";
import { persistSecretKey } from "@/db/secrets";
import {
  acceptGuardianShard,
  collectRelease,
  createGuardianOffers,
  finishRecovery,
  listGuardianDuties,
  mintRecoverySession,
  releaseShard,
  type CollectedRelease,
} from "./guardianShards";

async function wipe() {
  await Promise.all(db.tables.map((t) => t.clear()));
}

/** Become `kp` on this (freshly wiped) simulated device. */
async function beMember(
  kp: { publicKey: string; secretKey: string },
  name: string,
) {
  await createMember({ publicKey: kp.publicKey, displayName: name }, "node_t");
  await persistSecretKey(kp.publicKey, kp.secretKey);
  await setSetting(SETTING_KEYS.currentMember, kp.publicKey);
}

beforeEach(wipe);

describe("guardian shards — the whole ceremony, device by device", () => {
  it("split → accept → release → reconstruct → the identity walks back in", async () => {
    const rosa = generateKeyPair();
    const g1 = generateKeyPair();
    const g2 = generateKeyPair();
    const g3 = generateKeyPair();

    // --- Rosa's device: shard to 3 guardians, any 2 recover ---
    await beMember(rosa, "Rosa");
    const created = await createGuardianOffers({
      threshold: 2,
      guardians: [
        { publicKey: g1.publicKey, displayName: "Gus" },
        { publicKey: g2.publicKey, displayName: "Greta" },
        { publicKey: g3.publicKey, displayName: "Gio" },
      ],
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    // No offer carries the secret or a share in the clear.
    const secretRow = await db.secretKeys.get(rosa.publicKey);
    for (const offer of created.offers) {
      expect(offer.text.includes(String(secretRow?.secretKey))).toBe(false);
    }
    const setup = await getSetting("guardianShardSetup");
    expect(setup && JSON.parse(setup).threshold).toBe(2);

    // --- Gus's device: accept HIS offer; Greta's is refused ---
    await wipe();
    await beMember(g1, "Gus");
    expect((await acceptGuardianShard(created.offers[1].text)).ok).toBe(false);
    const acceptedByGus = await acceptGuardianShard(created.offers[0].text);
    expect(acceptedByGus.ok).toBe(true);
    const duties = await listGuardianDuties();
    expect(duties).toHaveLength(1);
    expect(duties[0].ownerName).toBe("Rosa");
    expect(duties[0].threshold).toBe(2);

    // --- Rosa loses her phone. New device mints a recovery session ---
    const session = mintRecoverySession();

    // Gus releases (still on his device).
    const releaseGus = await releaseShard(rosa.publicKey, session.requestText);
    expect(releaseGus.ok).toBe(true);

    // --- Greta's device: accept + release ---
    await wipe();
    await beMember(g2, "Greta");
    expect((await acceptGuardianShard(created.offers[1].text)).ok).toBe(true);
    const releaseGreta = await releaseShard(
      rosa.publicKey,
      session.requestText,
    );
    expect(releaseGreta.ok).toBe(true);
    if (!releaseGus.ok || !releaseGreta.ok) return;

    // --- The recovering device: collect both, reconstruct, restore ---
    await wipe();
    const collected: CollectedRelease[] = [];
    const c1 = collectRelease(releaseGus.text, session, collected);
    expect(c1.ok).toBe(true);
    if (c1.ok) collected.push(c1.release);

    // Under threshold: refuses honestly.
    expect(await finishRecovery(collected)).toEqual({
      ok: false,
      error: "not_enough_pieces",
    });

    const dup = collectRelease(releaseGus.text, session, collected);
    expect(dup).toEqual({ ok: false, error: "duplicate_piece" });

    const c2 = collectRelease(releaseGreta.text, session, collected);
    expect(c2.ok).toBe(true);
    if (c2.ok) collected.push(c2.release);

    const finished = await finishRecovery(collected);
    expect(finished).toEqual({ ok: true, publicKey: rosa.publicKey });
    expect((await db.members.get(rosa.publicKey))?.displayName).toBe("Rosa");
    expect(await db.secretKeys.get(rosa.publicKey)).toBeDefined();
    expect(await getSetting(SETTING_KEYS.currentMember)).toBe(rosa.publicKey);
    expect(await getSetting(SETTING_KEYS.onboarded)).toBeTruthy();
  });

  it("a release for the WRONG session is undecryptable (a captured release QR is inert elsewhere)", async () => {
    const rosa = generateKeyPair();
    const g1 = generateKeyPair();
    const g2 = generateKeyPair();
    await beMember(rosa, "Rosa");
    const created = await createGuardianOffers({
      threshold: 2,
      guardians: [
        { publicKey: g1.publicKey, displayName: "Gus" },
        { publicKey: g2.publicKey, displayName: "Greta" },
      ],
    });
    if (!created.ok) throw new Error("setup failed");

    await wipe();
    await beMember(g1, "Gus");
    await acceptGuardianShard(created.offers[0].text);
    const honestSession = mintRecoverySession();
    const release = await releaseShard(rosa.publicKey, honestSession.requestText);
    if (!release.ok) throw new Error("release failed");

    // An eavesdropper who photographed the release QR but holds a
    // DIFFERENT temp key gets nothing.
    const eavesdropper = mintRecoverySession();
    expect(collectRelease(release.text, eavesdropper, [])).toEqual({
      ok: false,
      error: "undecryptable",
    });
  });

  it("a tampered reconstruction fails the owner-key check (Shamir's missing integrity, supplied)", async () => {
    const rosa = generateKeyPair();
    const g1 = generateKeyPair();
    const g2 = generateKeyPair();
    await beMember(rosa, "Rosa");
    const created = await createGuardianOffers({
      threshold: 2,
      guardians: [
        { publicKey: g1.publicKey, displayName: "Gus" },
        { publicKey: g2.publicKey, displayName: "Greta" },
      ],
    });
    if (!created.ok) throw new Error("setup failed");
    const session = mintRecoverySession();

    const releases: CollectedRelease[] = [];
    for (const [kp, name, offerIdx] of [
      [g1, "Gus", 0],
      [g2, "Greta", 1],
    ] as const) {
      await wipe();
      await beMember(kp, name);
      await acceptGuardianShard(created.offers[offerIdx].text);
      const rel = await releaseShard(rosa.publicKey, session.requestText);
      if (!rel.ok) throw new Error("release failed");
      const collected = collectRelease(rel.text, session, releases);
      if (collected.ok) releases.push(collected.release);
    }
    await wipe();

    // Flip a byte of one decrypted share.
    const evil = [...releases];
    const bytes = Uint8Array.from(atob(evil[0].shareB64), (c) =>
      c.charCodeAt(0),
    );
    bytes[0] ^= 0xff;
    evil[0] = { ...evil[0], shareB64: btoa(String.fromCharCode(...bytes)) };
    expect(await finishRecovery(evil)).toEqual({
      ok: false,
      error: "corrupted",
    });
    // The untampered set still recovers.
    expect((await finishRecovery(releases)).ok).toBe(true);
  });

  it("re-sharding replaces the guardian's older row for the same owner", async () => {
    const rosa = generateKeyPair();
    const g1 = generateKeyPair();
    const g2 = generateKeyPair();
    await beMember(rosa, "Rosa");
    const first = await createGuardianOffers({
      threshold: 2,
      guardians: [
        { publicKey: g1.publicKey, displayName: "Gus" },
        { publicKey: g2.publicKey, displayName: "Greta" },
      ],
    });
    const second = await createGuardianOffers({
      threshold: 2,
      guardians: [
        { publicKey: g1.publicKey, displayName: "Gus" },
        { publicKey: g2.publicKey, displayName: "Greta" },
      ],
    });
    if (!first.ok || !second.ok) throw new Error("setup failed");

    await wipe();
    await beMember(g1, "Gus");
    await acceptGuardianShard(first.offers[0].text);
    const re = await acceptGuardianShard(second.offers[0].text);
    expect(re.ok && re.replacedOlderSet).toBe(true);
    const duties = await listGuardianDuties();
    expect(duties).toHaveLength(1);
    expect(duties[0].setId).toBe(second.setId);

    // Releases across sets refuse to mix on the recovering side.
    const session = mintRecoverySession();
    const relNew = await releaseShard(rosa.publicKey, session.requestText);
    await wipe();
    await beMember(g2, "Greta");
    await acceptGuardianShard(first.offers[1].text); // Greta kept the OLD set
    const relOld = await releaseShard(rosa.publicKey, session.requestText);
    if (!relNew.ok || !relOld.ok) throw new Error("release failed");
    const collected: CollectedRelease[] = [];
    const a = collectRelease(relNew.text, session, collected);
    if (a.ok) collected.push(a.release);
    expect(collectRelease(relOld.text, session, collected)).toEqual({
      ok: false,
      error: "different_set",
    });
  });

  it("refuses bad params: self-guarding, duplicates, k out of bounds", async () => {
    const rosa = generateKeyPair();
    const g1 = generateKeyPair();
    await beMember(rosa, "Rosa");
    const self = await createGuardianOffers({
      threshold: 2,
      guardians: [
        { publicKey: rosa.publicKey, displayName: "Rosa" },
        { publicKey: g1.publicKey, displayName: "Gus" },
      ],
    });
    expect(self).toEqual({ ok: false, error: "bad_params" });
    const dup = await createGuardianOffers({
      threshold: 2,
      guardians: [
        { publicKey: g1.publicKey, displayName: "Gus" },
        { publicKey: g1.publicKey, displayName: "Gus again" },
      ],
    });
    expect(dup).toEqual({ ok: false, error: "bad_params" });
    const low = await createGuardianOffers({
      threshold: 1,
      guardians: [{ publicKey: g1.publicKey, displayName: "Gus" }],
    });
    expect(low).toEqual({ ok: false, error: "bad_params" });
  });
});
