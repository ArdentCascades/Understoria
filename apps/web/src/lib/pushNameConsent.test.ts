/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
//
// Push name consent (docs/notifications.md v2 — messages named by
// mutual consent). What these pin: the flag is the member's own
// signed record with retraction replacing it in the queue, and the
// name map — the recipient-side gate of the naming AND — contains
// EXACTLY the consented ∩ unblocked members, named from this
// device's own member rows and from nowhere else.
import { beforeEach, describe, expect, it } from "vitest";
import { generateKeyPair, verifyStateRecord } from "@understoria/shared/crypto";
import { db, setSetting, SETTING_KEYS } from "@/db/database";
import { createMember } from "@/db/seed";
import { persistSecretKey } from "@/db/secrets";
import { blockMember } from "@/db/blocks";
import {
  buildPushNameMap,
  getMyPushNameConsent,
  setPushNameConsent,
} from "./pushNameConsent";

async function wipe() {
  await Promise.all(db.tables.map((t) => t.clear()));
}

beforeEach(wipe);

async function beMember(name: string) {
  const kp = generateKeyPair();
  await createMember({ publicKey: kp.publicKey, displayName: name }, "node_t");
  await persistSecretKey(kp.publicKey, kp.secretKey);
  await setSetting(SETTING_KEYS.currentMember, kp.publicKey);
  await setSetting(SETTING_KEYS.communityNodeUrl, "https://node.test/api");
  return kp;
}

/** A pulled consent row for another member, as federationSync would
 *  store it (signature contents don't matter to the map builder —
 *  the pull already verified before putting). */
async function storeConsent(memberKey: string, allow: boolean) {
  await db.pushNameConsents.put({
    id: `pnc_${memberKey}_${allow}`,
    memberKey,
    allow,
    updatedAt: Date.now(),
    signerKey: memberKey,
    signature: "verified-at-pull",
  });
}

describe("push name consent — the member's own flag", () => {
  it("signs, stores, and queues the consent; retraction replaces it in the queue", async () => {
    const me = await beMember("Vera");
    const result = await setPushNameConsent(true);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(verifyStateRecord(result.consent)).toBe(true);
    expect(result.consent.signerKey).toBe(me.publicKey);
    expect((await getMyPushNameConsent())?.allow).toBe(true);

    const retract = await setPushNameConsent(false);
    expect(retract.ok).toBe(true);
    expect((await getMyPushNameConsent())?.allow).toBe(false);
    // Same natural dedupe key: the retraction replaced the pending
    // allow — a member can't race their own withdrawal.
    const queued = await db.outbox
      .filter((r) => r.kind === "push_name_consent")
      .toArray();
    expect(queued).toHaveLength(1);
  });

  it("refuses without an identity, and absence reads as OFF", async () => {
    expect(await setPushNameConsent(true)).toEqual({
      ok: false,
      error: "no_identity",
    });
    expect(await getMyPushNameConsent()).toBeNull();
  });
});

describe("buildPushNameMap — the recipient-side gate of the naming AND", () => {
  it("maps exactly the consented ∩ unblocked members, named from this device's own rows", async () => {
    const me = await beMember("Vera");
    const ana = generateKeyPair();
    const bo = generateKeyPair();
    const cal = generateKeyPair();
    const dee = generateKeyPair();
    await createMember(
      { publicKey: ana.publicKey, displayName: "Ana" },
      "node_t",
    );
    await createMember({ publicKey: bo.publicKey, displayName: "Bo" }, "node_t");
    await createMember(
      { publicKey: cal.publicKey, displayName: "Cal" },
      "node_t",
    );
    await createMember(
      { publicKey: dee.publicKey, displayName: "Dee" },
      "node_t",
    );

    await storeConsent(ana.publicKey, true); // consented → in
    await storeConsent(bo.publicKey, false); // retracted → out
    await storeConsent(cal.publicKey, true); // consented BUT blocked → out
    // dee never consented → out
    await blockMember({
      blockerKey: me.publicKey,
      blockedKey: cal.publicKey,
      hideGovernance: false,
      note: null,
    });

    const map = await buildPushNameMap();
    expect(map).toEqual({ [ana.publicKey]: "Ana" });
  });

  it("a consented key with no local member row maps to nothing — names never come from the record", async () => {
    await beMember("Vera");
    const stranger = generateKeyPair();
    await storeConsent(stranger.publicKey, true);
    expect(await buildPushNameMap()).toEqual({});
  });
});
