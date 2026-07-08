/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { beforeEach, describe, expect, it } from "vitest";
import { generateKeyPair, verifyExchange } from "@understoria/shared/crypto";
import type { Exchange, Post } from "@/types";
import { db, setSetting, SETTING_KEYS } from "@/db/database";
import { createMember } from "@/db/seed";
import { persistSecretKey } from "@/db/secrets";
import {
  acceptExchangeOffer,
  collectExchangeReceipt,
  mintExchangeOffer,
  parseExchangeOffer,
} from "./inPersonExchange";

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

/** A NEED both devices hold: `helped` posted it, `helper` claimed it —
 *  the normal case the §5 flow hangs off. */
function claimedNeed(helpedKey: string, helperKey: string): Post {
  return {
    id: "post_inperson_1",
    type: "NEED",
    category: "transport",
    title: "Ride to the shelter",
    description: "",
    estimatedHours: 2,
    urgency: "high",
    postedBy: helpedKey,
    claimedBy: helperKey,
    status: "claimed",
    createdAt: Date.now() - 3_600_000,
    expiresAt: null,
    locationZone: "riverside",
    confirmedBy: [],
    nodeId: "node_t",
    signature: "",
  };
}

beforeEach(wipe);

describe("the in-person exchange ceremony, device by device", () => {
  it("mint on A → parse+accept on B → collect on A leaves ONE identical exchange on both, queued on both", async () => {
    const helper = generateKeyPair();
    const helped = generateKeyPair();
    const post = claimedNeed(helped.publicKey, helper.publicKey);

    // --- Device A (the helper): mint the offer ---
    await beMember(helper, "Gus");
    await db.posts.put(post);
    const minted = await mintExchangeOffer(post.id);
    expect(minted.ok).toBe(true);
    if (!minted.ok) return;
    expect(minted.offer.helperKey).toBe(helper.publicKey);
    expect(minted.offer.helpedKey).toBe(helped.publicKey);
    expect(minted.offer.hours).toBe(2);

    // --- Device B (the helped member): parse, review fields, accept ---
    await wipe();
    await beMember(helped, "Rosa");
    await db.posts.put(post);
    const parsed = await parseExchangeOffer(minted.offer.offerText);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    // The review surface gets everything the human needs to check.
    expect(parsed.offer.hours).toBe(2);
    expect(parsed.offer.category).toBe("transport");
    expect(parsed.offer.helperKey).toBe(helper.publicKey);

    const accepted = await acceptExchangeOffer(parsed.offer);
    expect(accepted.ok).toBe(true);
    if (!accepted.ok) return;
    expect(accepted.duplicate).toBe(false);

    // B holds the completed record with BOTH member signatures and
    // the post writes the normal confirm path makes.
    const bExchanges = await db.exchanges.toArray();
    expect(bExchanges).toHaveLength(1);
    expect(bExchanges[0].id).toBe(minted.offer.id);
    expect(verifyExchange(bExchanges[0])).toBe(true);
    const bPost = await db.posts.get(post.id);
    expect(bPost?.status).toBe("completed");
    expect([...(bPost?.confirmedBy ?? [])].sort()).toEqual(
      [helper.publicKey, helped.publicKey].sort(),
    );
    const bQueued = await db.outbox
      .filter((r) => r.kind === "exchange")
      .toArray();
    expect(bQueued).toHaveLength(1);
    expect((JSON.parse(bQueued[0].payload) as Exchange).id).toBe(
      minted.offer.id,
    );
    // Accepting the same offer again heals into the SAME receipt —
    // no second row anywhere.
    const reAccepted = await acceptExchangeOffer(parsed.offer);
    expect(reAccepted.ok && reAccepted.duplicate).toBe(true);
    expect(await db.exchanges.count()).toBe(1);
    const bRecord = bExchanges[0];

    // --- Back on Device A: collect the receipt ---
    await wipe();
    await beMember(helper, "Gus");
    await db.posts.put(post);
    const collected = await collectExchangeReceipt(
      accepted.receiptText,
      minted.offer,
    );
    expect(collected.ok).toBe(true);
    if (!collected.ok) return;
    expect(collected.duplicate).toBe(false);

    // Both sides hold the SAME record, byte for byte.
    const aExchanges = await db.exchanges.toArray();
    expect(aExchanges).toHaveLength(1);
    expect(aExchanges[0]).toEqual(bRecord);
    const aPost = await db.posts.get(post.id);
    expect(aPost?.status).toBe("completed");
    const aQueued = await db.outbox
      .filter((r) => r.kind === "exchange")
      .toArray();
    expect(aQueued).toHaveLength(1);
    // Same record id in both queues → the node dedups to one copy.
    expect((JSON.parse(aQueued[0].payload) as Exchange).id).toBe(
      minted.offer.id,
    );

    // Replaying the receipt is a duplicate no-op — nothing doubles.
    const replayed = await collectExchangeReceipt(
      accepted.receiptText,
      minted.offer,
    );
    expect(replayed.ok && replayed.duplicate).toBe(true);
    expect(await db.exchanges.count()).toBe(1);
    expect(await db.outbox.filter((r) => r.kind === "exchange").count()).toBe(
      1,
    );
  });

  it("refuses tampered payloads, wrong members, and missing posts", async () => {
    const helper = generateKeyPair();
    const helped = generateKeyPair();
    const bystander = generateKeyPair();
    const post = claimedNeed(helped.publicKey, helper.publicKey);

    // Only the helper can mint; the helped member is refused.
    await beMember(helped, "Rosa");
    await db.posts.put(post);
    expect(await mintExchangeOffer(post.id)).toEqual({
      ok: false,
      error: "not_helper",
    });

    await wipe();
    await beMember(helper, "Gus");
    await db.posts.put(post);
    const minted = await mintExchangeOffer(post.id);
    if (!minted.ok) throw new Error("mint failed");
    // The helper can't sign for the helped side by scanning their own offer.
    expect(await parseExchangeOffer(minted.offer.offerText)).toEqual({
      ok: false,
      error: "wrong_member",
    });

    // A bystander who holds the post is still not the counterparty.
    await wipe();
    await beMember(bystander, "Mallory");
    await db.posts.put(post);
    expect(await parseExchangeOffer(minted.offer.offerText)).toEqual({
      ok: false,
      error: "wrong_member",
    });

    // The helped member without the post is refused — no post, no context.
    await wipe();
    await beMember(helped, "Rosa");
    expect(await parseExchangeOffer(minted.offer.offerText)).toEqual({
      ok: false,
      error: "post_missing",
    });

    // Tampered hours: the canonical payload changed, the helper's
    // signature no longer verifies.
    await db.posts.put(post);
    const inflated = JSON.parse(minted.offer.offerText) as { hours: number };
    inflated.hours = 40;
    expect(await parseExchangeOffer(JSON.stringify(inflated))).toEqual({
      ok: false,
      error: "bad_signature",
    });

    // Garbage and mislabeled payloads are not offers.
    expect((await parseExchangeOffer("not json")).ok).toBe(false);
    expect(
      await parseExchangeOffer(
        JSON.stringify({ kind: "understoria-exchange-receipt" }),
      ),
    ).toEqual({ ok: false, error: "not_an_offer" });

    // A completed post can't be confirmed again.
    await db.posts.put({ ...post, status: "completed" });
    expect(await parseExchangeOffer(minted.offer.offerText)).toEqual({
      ok: false,
      error: "already_completed",
    });
  });

  it("the helper's collect step refuses receipts that aren't THE offered record", async () => {
    const helper = generateKeyPair();
    const helped = generateKeyPair();
    const post = claimedNeed(helped.publicKey, helper.publicKey);

    await beMember(helper, "Gus");
    await db.posts.put(post);
    const minted = await mintExchangeOffer(post.id);
    if (!minted.ok) throw new Error("mint failed");

    await wipe();
    await beMember(helped, "Rosa");
    await db.posts.put(post);
    const parsed = await parseExchangeOffer(minted.offer.offerText);
    if (!parsed.ok) throw new Error("parse failed");
    const accepted = await acceptExchangeOffer(parsed.offer);
    if (!accepted.ok) throw new Error("accept failed");

    await wipe();
    await beMember(helper, "Gus");
    await db.posts.put(post);

    // Not a receipt at all.
    expect(await collectExchangeReceipt("nope", minted.offer)).toEqual({
      ok: false,
      error: "not_a_receipt",
    });
    expect(
      await collectExchangeReceipt(minted.offer.offerText, minted.offer),
    ).toEqual({ ok: false, error: "not_a_receipt" });

    // A receipt whose hours were inflated after signing: the canonical
    // field no longer matches the offer this device minted.
    const tampered = JSON.parse(accepted.receiptText) as {
      exchange: Exchange;
    };
    tampered.exchange = { ...tampered.exchange, hoursExchanged: 40 };
    expect(
      await collectExchangeReceipt(JSON.stringify(tampered), minted.offer),
    ).toEqual({ ok: false, error: "different_record" });

    // A receipt with a forged helped-side signature is refused.
    const forged = JSON.parse(accepted.receiptText) as {
      exchange: Exchange;
    };
    forged.exchange = {
      ...forged.exchange,
      helpedSignature: forged.exchange.helperSignature,
    };
    expect(
      await collectExchangeReceipt(JSON.stringify(forged), minted.offer),
    ).toEqual({ ok: false, error: "bad_signature" });

    // The genuine receipt still lands after all the refused attempts.
    const collected = await collectExchangeReceipt(
      accepted.receiptText,
      minted.offer,
    );
    expect(collected.ok).toBe(true);
    expect(await db.exchanges.count()).toBe(1);
  });

  it("works for an OFFER post too — roles derive from the post type", async () => {
    const helper = generateKeyPair();
    const helped = generateKeyPair();
    // helper POSTED an offer; helped member claimed it.
    const post: Post = {
      ...claimedNeed(helped.publicKey, helper.publicKey),
      id: "post_inperson_2",
      type: "OFFER",
      postedBy: helper.publicKey,
      claimedBy: helped.publicKey,
    };

    await beMember(helper, "Gus");
    await db.posts.put(post);
    const minted = await mintExchangeOffer(post.id, 1.5);
    expect(minted.ok).toBe(true);
    if (!minted.ok) return;
    expect(minted.offer.helperKey).toBe(helper.publicKey);
    expect(minted.offer.hours).toBe(1.5);

    await wipe();
    await beMember(helped, "Rosa");
    await db.posts.put(post);
    const parsed = await parseExchangeOffer(minted.offer.offerText);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const accepted = await acceptExchangeOffer(parsed.offer);
    expect(accepted.ok).toBe(true);
    if (!accepted.ok) return;
    expect(accepted.exchange.hoursExchanged).toBe(1.5);
    expect(verifyExchange(accepted.exchange)).toBe(true);
  });
});
