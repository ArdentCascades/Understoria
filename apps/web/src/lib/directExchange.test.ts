/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  generateKeyPair,
  isDirectExchangeLabel,
  verifyExchange,
} from "@understoria/shared/crypto";
import { db, setSetting, SETTING_KEYS } from "@/db/database";
import { createMember } from "@/db/seed";
import { persistSecretKey } from "@/db/secrets";
import {
  acceptDirectExchangeOffer,
  collectDirectExchangeReceipt,
  MAX_BACKDATE_MS,
  mintDirectExchangeOffer,
  parseDirectExchangeOffer,
} from "./directExchange";

async function wipe() {
  await Promise.all(db.tables.map((t) => t.clear()));
}

async function beMember(
  kp: { publicKey: string; secretKey: string },
  name: string,
) {
  await createMember({ publicKey: kp.publicKey, displayName: name }, "node_t");
  await persistSecretKey(kp.publicKey, kp.secretKey);
  await setSetting(SETTING_KEYS.currentMember, kp.publicKey);
  await setSetting(SETTING_KEYS.nodeId, "node_t");
  await setSetting(SETTING_KEYS.communityNodeUrl, "https://node.test/api");
}

async function knowMember(publicKey: string, name: string) {
  await createMember({ publicKey, displayName: name }, "node_t");
}

beforeEach(wipe);

describe("the direct-exchange ceremony, device by device", () => {
  it("helper initiates → counterparty co-signs → initiator collects: ONE identical, fully member-signed exchange on both devices, queued on both, no post anywhere", async () => {
    const gus = generateKeyPair(); // helper, initiates
    const rosa = generateKeyPair(); // helped, co-signs

    // --- Device A (Gus): mint ---
    await beMember(gus, "Gus");
    await knowMember(rosa.publicKey, "Rosa");
    const minted = await mintDirectExchangeOffer({
      counterpartyKey: rosa.publicKey,
      role: "helper",
      hours: 2,
      category: "skilled_labor",
    });
    expect(minted.ok).toBe(true);
    if (!minted.ok) return;
    expect(isDirectExchangeLabel(minted.offer.postId)).toBe(true);
    expect(minted.offer.helperKey).toBe(gus.publicKey);
    expect(minted.offer.helpedKey).toBe(rosa.publicKey);
    expect(minted.offer.signerRole).toBe("helper");

    // --- Device B (Rosa): parse, review, co-sign ---
    await wipe();
    await beMember(rosa, "Rosa");
    await knowMember(gus.publicKey, "Gus");
    const parsed = await parseDirectExchangeOffer(minted.offer.offerText);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.offer.signerName).toBe("Gus");
    expect(parsed.offer.myRole).toBe("helped");

    const accepted = await acceptDirectExchangeOffer(parsed.offer);
    expect(accepted.ok).toBe(true);
    if (!accepted.ok) return;
    expect(accepted.duplicate).toBe(false);
    // Fully member-signed, verifiable without any authority.
    expect(verifyExchange(accepted.exchange)).toBe(true);
    expect(accepted.exchange.autoConfirmed).toBeUndefined();
    const bOutbox = await db.outbox.toArray();
    expect(bOutbox.some((o) => o.kind === "exchange")).toBe(true);
    // No post was created or touched anywhere in the ceremony.
    expect(await db.posts.count()).toBe(0);

    // --- Device A again: collect the receipt ---
    await wipe();
    await beMember(gus, "Gus");
    const collected = await collectDirectExchangeReceipt(
      accepted.receiptText,
      minted.offer,
    );
    expect(collected.ok).toBe(true);
    if (!collected.ok) return;
    expect(collected.exchange).toEqual(accepted.exchange);
    const aOutbox = await db.outbox.toArray();
    expect(aOutbox.some((o) => o.kind === "exchange")).toBe(true);
    expect(await db.posts.count()).toBe(0);

    // Replay heals as a duplicate no-op.
    const replay = await collectDirectExchangeReceipt(
      accepted.receiptText,
      minted.offer,
    );
    expect(replay.ok && replay.duplicate).toBe(true);
  });

  it("the helped member can initiate too — signer role rides the offer and the helper co-signs", async () => {
    const rosa = generateKeyPair(); // helped, initiates ("Gus helped me")
    const gus = generateKeyPair();

    await beMember(rosa, "Rosa");
    await knowMember(gus.publicKey, "Gus");
    const minted = await mintDirectExchangeOffer({
      counterpartyKey: gus.publicKey,
      role: "helped",
      hours: 1.5,
      category: "childcare",
    });
    expect(minted.ok).toBe(true);
    if (!minted.ok) return;
    expect(minted.offer.helperKey).toBe(gus.publicKey);
    expect(minted.offer.helpedKey).toBe(rosa.publicKey);

    await wipe();
    await beMember(gus, "Gus");
    const parsed = await parseDirectExchangeOffer(minted.offer.offerText);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.offer.myRole).toBe("helper");
    const accepted = await acceptDirectExchangeOffer(parsed.offer);
    expect(accepted.ok).toBe(true);
    if (!accepted.ok) return;
    expect(verifyExchange(accepted.exchange)).toBe(true);
  });

  it("refuses self-exchanges, unknown counterparties, bad hours, and out-of-bounds days at mint", async () => {
    const me = generateKeyPair();
    const other = generateKeyPair();
    await beMember(me, "Me");

    expect(
      (
        await mintDirectExchangeOffer({
          counterpartyKey: me.publicKey,
          role: "helper",
          hours: 1,
          category: "other",
        })
      ).ok,
    ).toBe(false);
    // Not a known member row on this device.
    const unknown = await mintDirectExchangeOffer({
      counterpartyKey: other.publicKey,
      role: "helper",
      hours: 1,
      category: "other",
    });
    expect(unknown.ok === false && unknown.error).toBe("counterparty_unknown");

    await knowMember(other.publicKey, "Other");
    const badHours = await mintDirectExchangeOffer({
      counterpartyKey: other.publicKey,
      role: "helper",
      hours: 0,
      category: "other",
    });
    expect(badHours.ok === false && badHours.error).toBe("bad_hours");
    const tooOld = await mintDirectExchangeOffer({
      counterpartyKey: other.publicKey,
      role: "helper",
      hours: 1,
      category: "other",
      completedAt: Date.now() - MAX_BACKDATE_MS - 86_400_000,
    });
    expect(tooOld.ok === false && tooOld.error).toBe("bad_time");
  });

  it("parse refuses non-direct labels, other members' offers, and tampered payloads", async () => {
    const gus = generateKeyPair();
    const rosa = generateKeyPair();
    const eve = generateKeyPair();

    await beMember(gus, "Gus");
    await knowMember(rosa.publicKey, "Rosa");
    const minted = await mintDirectExchangeOffer({
      counterpartyKey: rosa.publicKey,
      role: "helper",
      hours: 2,
      category: "skilled_labor",
    });
    expect(minted.ok).toBe(true);
    if (!minted.ok) return;

    // A structured label is not a direct exchange, whatever it signs.
    const smuggled = JSON.parse(minted.offer.offerText) as Record<
      string,
      unknown
    >;
    smuggled.postId = "direct:event-123";
    await wipe();
    await beMember(rosa, "Rosa");
    const smuggledResult = await parseDirectExchangeOffer(
      JSON.stringify(smuggled),
    );
    expect(smuggledResult.ok === false && smuggledResult.error).toBe(
      "not_direct_label",
    );

    // Eve scans an offer naming Gus↔Rosa: not hers to sign.
    await wipe();
    await beMember(eve, "Eve");
    const wrong = await parseDirectExchangeOffer(minted.offer.offerText);
    expect(wrong.ok === false && wrong.error).toBe("wrong_member");

    // Tampered hours: signature no longer verifies.
    const tampered = JSON.parse(minted.offer.offerText) as Record<
      string,
      unknown
    >;
    tampered.hours = 9;
    await wipe();
    await beMember(rosa, "Rosa");
    const tamperedResult = await parseDirectExchangeOffer(
      JSON.stringify(tampered),
    );
    expect(tamperedResult.ok === false && tamperedResult.error).toBe(
      "bad_signature",
    );
  });

  it("receipt collection refuses a different record and any autoConfirmed marker", async () => {
    const gus = generateKeyPair();
    const rosa = generateKeyPair();
    await beMember(gus, "Gus");
    await knowMember(rosa.publicKey, "Rosa");
    const minted = await mintDirectExchangeOffer({
      counterpartyKey: rosa.publicKey,
      role: "helper",
      hours: 2,
      category: "skilled_labor",
    });
    expect(minted.ok).toBe(true);
    if (!minted.ok) return;

    await wipe();
    await beMember(rosa, "Rosa");
    const parsed = await parseDirectExchangeOffer(minted.offer.offerText);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const accepted = await acceptDirectExchangeOffer(parsed.offer);
    expect(accepted.ok).toBe(true);
    if (!accepted.ok) return;

    await wipe();
    await beMember(gus, "Gus");
    const receipt = JSON.parse(accepted.receiptText) as {
      kind: string;
      exchange: Record<string, unknown>;
    };
    const forged = {
      ...receipt,
      exchange: { ...receipt.exchange, hoursExchanged: 9 },
    };
    const forgedResult = await collectDirectExchangeReceipt(
      JSON.stringify(forged),
      minted.offer,
    );
    expect(forgedResult.ok === false && forgedResult.error).toBe(
      "different_record",
    );
    const impostor = {
      ...receipt,
      exchange: { ...receipt.exchange, autoConfirmed: true },
    };
    const impostorResult = await collectDirectExchangeReceipt(
      JSON.stringify(impostor),
      minted.offer,
    );
    expect(impostorResult.ok === false && impostorResult.error).toBe(
      "different_record",
    );
  });

  it("holds the daily-limit hard stop at co-sign time", async () => {
    const gus = generateKeyPair();
    const rosa = generateKeyPair();
    await beMember(gus, "Gus");
    await knowMember(rosa.publicKey, "Rosa");
    const minted = await mintDirectExchangeOffer({
      counterpartyKey: rosa.publicKey,
      role: "helper",
      hours: 2,
      category: "skilled_labor",
    });
    expect(minted.ok).toBe(true);
    if (!minted.ok) return;

    await wipe();
    await beMember(rosa, "Rosa");
    // Saturate Gus's day with existing exchanges (default daily limit
    // is well under 50 hours).
    const now = Date.now();
    for (let i = 0; i < 5; i++) {
      await db.exchanges.put({
        id: `x${i}`,
        postId: `post_x${i}`,
        helperKey: gus.publicKey,
        helpedKey: generateKeyPair().publicKey,
        hoursExchanged: 10,
        helperSignature: "s1",
        helpedSignature: "s2",
        completedAt: now - i * 60_000,
        category: "other",
        nodeId: "node_t",
      });
    }
    const parsed = await parseDirectExchangeOffer(minted.offer.offerText);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const accepted = await acceptDirectExchangeOffer(parsed.offer);
    expect(accepted.ok === false && accepted.error).toBe("daily_limit");
  });
});
