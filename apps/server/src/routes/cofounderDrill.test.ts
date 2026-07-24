/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { afterEach, describe, expect, it } from "vitest";
import type { Database as DatabaseType } from "better-sqlite3-multiple-ciphers";
import type { FastifyInstance } from "fastify";
import {
  FOUNDER_NOMINATION_TTL_MS,
  canonicalFounderAccessionPayload,
  canonicalFounderClaimMessage,
  canonicalFounderNominationPayload,
  canonicalInvitePayload,
  canonicalReadAuthMessage,
  canonicalRedemptionPayload,
  canonicalVouchPayload,
  generateKeyPair,
  sign,
  verifyFounderAccession,
  verifyFounderNomination,
  type KeyPair,
} from "@understoria/shared/crypto";
import type {
  FounderNomination,
  RedemptionReceipt,
  SignedVouch,
} from "@understoria/shared/types";
import { buildServer } from "../server.js";
import { readConfigFromEnv } from "../config.js";
import { openDatabase } from "../db.js";

/*
 * The co-founder ceremony drill (governanceDrill pattern): one fresh
 * node, the founding member's device and the co-founder's device,
 * driven over the REAL routes exactly as the PWAs would — claim the
 * node, admit a member, nominate, poll the pending card, accede,
 * watch /config republish two roots, and then watch the promotion
 * deadlock actually break: a third member reaches trusted on
 * founder + co-founder vouches, which a single-founder community can
 * never produce. Finally the gate closes for good: with two roots, a
 * second nomination refuses.
 */

let app: FastifyInstance | null = null;
let db: DatabaseType | null = null;

afterEach(async () => {
  if (app) await app.close();
  if (db) db.close();
  app = null;
  db = null;
});

let seq = 0;

function makeReceipt(inviter: KeyPair, redeemer: KeyPair): RedemptionReceipt {
  const invitePayload = {
    token: `tok_${++seq}_${redeemer.publicKey.slice(0, 6)}`,
    inviterKey: inviter.publicKey,
    inviterName: "Inviter",
    nodeId: "node_test",
    createdAt: Date.now() - 1000,
    expiresAt: Date.now() + 86_400_000,
  };
  const invite = {
    ...invitePayload,
    signature: sign(canonicalInvitePayload(invitePayload), inviter.secretKey),
  };
  const payload = {
    invite,
    redeemedBy: redeemer.publicKey,
    displayName: "New Member",
    redeemedAt: Date.now(),
  };
  return {
    ...payload,
    signature: sign(canonicalRedemptionPayload(payload), redeemer.secretKey),
  };
}

function makeVouch(voucher: KeyPair, vouchee: KeyPair): SignedVouch {
  const payload = {
    voucherKey: voucher.publicKey,
    voucheeKey: vouchee.publicKey,
    createdAt: Date.now(),
    kind: "manual" as const,
  };
  return {
    id: `v_${++seq}`,
    ...payload,
    signature: sign(canonicalVouchPayload(payload), voucher.secretKey),
  };
}

describe("co-founder ceremony drill — two devices, one community, two roots", () => {
  it("claim → redeem → nominate → poll → accede → the deadlock breaks → gate closes", async () => {
    const founder = generateKeyPair(); // founding member's device
    const cofounder = generateKeyPair(); // the nominee's device
    const rosa = generateKeyPair(); // third member — the beneficiary
    const dara = generateKeyPair(); // rosa's proof-of-trust vouchee

    db = openDatabase(":memory:");
    const config = readConfigFromEnv({
      LOG_LEVEL: "fatal",
      READ_AUTH: "off",
      NODE_ID: "node_test",
      RATE_LIMIT_MAX: "10000",
      SETUP_TOKEN: "drill-setup-code",
    } as NodeJS.ProcessEnv);
    const built = await buildServer({ config, database: db });
    app = built.app;
    await app.ready();

    // A truly fresh node: unclaimed, no hashes published.
    const before = (
      await app.inject({ method: "GET", url: "/config" })
    ).json() as { claimed?: boolean; founderKeyHashes?: string[] };
    expect(before.claimed).toBe(false);
    expect(before.founderKeyHashes).toBeUndefined();

    // The founding member claims the node with the boot setup code.
    const claimTs = Date.now();
    const claimed = await app.inject({
      method: "POST",
      url: "/claim-founder",
      payload: {
        publicKey: founder.publicKey,
        setupToken: "drill-setup-code",
        ts: claimTs,
        signature: sign(
          canonicalFounderClaimMessage(
            founder.publicKey,
            "drill-setup-code",
            claimTs,
          ),
          founder.secretKey,
        ),
      },
    });
    expect(claimed.statusCode).toBe(201);

    // Founder invites; the future co-founder redeems and is a member.
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/redemptions",
          payload: makeReceipt(founder, cofounder),
        })
      ).statusCode,
    ).toBe(201);

    // One root: the founder alone cannot promote anyone — the exact
    // deadlock the ceremony exists to break. Their invitee holds one
    // voucher and stays untrusted.
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/vouches",
          payload: makeVouch(cofounder, rosa),
        })
      ).statusCode,
    ).toBe(403);

    // The founder's device signs and submits the nomination.
    const nominationPayload = {
      nominatorKey: founder.publicKey,
      nomineeKey: cofounder.publicKey,
      nodeId: "node_test",
      nominatedAt: Date.now(),
      expiresAt: Date.now() + FOUNDER_NOMINATION_TTL_MS,
    };
    const nomination = {
      ...nominationPayload,
      signature: sign(
        canonicalFounderNominationPayload(nominationPayload),
        founder.secretKey,
      ),
    };
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/founder-nomination",
          payload: nomination,
        })
      ).statusCode,
    ).toBe(201);

    // The nominee's device polls its pending card with recipient
    // proof and verifies what it pulled — the same check the PWA
    // applies before showing the accept card.
    const ts = Date.now();
    const pending = await app.inject({
      method: "GET",
      url: "/founder-nomination/pending",
      headers: {
        "x-understoria-key": cofounder.publicKey,
        "x-understoria-ts": String(ts),
        "x-understoria-sig": sign(
          canonicalReadAuthMessage("/founder-nomination/pending", ts),
          cofounder.secretKey,
        ),
      },
    });
    expect(pending.statusCode).toBe(200);
    const pulled = pending.json().nomination as FounderNomination;
    expect(pulled).toEqual(nomination);
    expect(verifyFounderNomination(pulled)).toBe(true);

    // Accept — signed on the nominee's own device over the PULLED
    // record, the dual-signed artifact any node can re-verify.
    const accessionPayload = { nomination: pulled, acceptedAt: Date.now() };
    const accession = {
      ...accessionPayload,
      signature: sign(
        canonicalFounderAccessionPayload(accessionPayload),
        cofounder.secretKey,
      ),
    };
    expect(verifyFounderAccession(accession)).toBe(true);
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/founder-accession",
          payload: accession,
        })
      ).statusCode,
    ).toBe(201);

    // /config republishes live: two roots, no restart, no env edit —
    // what the accept-side refreshNodeConfig kick will capture.
    const after = (
      await app.inject({ method: "GET", url: "/config" })
    ).json() as { claimed?: boolean; founderKeyHashes?: string[] };
    expect(after.claimed).toBe(true);
    expect(after.founderKeyHashes).toHaveLength(2);

    // The deadlock breaks over real routes: rosa joins on the
    // founder's invite (voucher one) and the CO-FOUNDER's manual
    // vouch (voucher two, impossible yesterday) makes her trusted —
    // proven by the node accepting her own vouch of dara.
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/redemptions",
          payload: makeReceipt(founder, rosa),
        })
      ).statusCode,
    ).toBe(201);
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/vouches",
          payload: makeVouch(cofounder, rosa),
        })
      ).statusCode,
    ).toBe(201);
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/vouches",
          payload: makeVouch(rosa, dara),
        })
      ).statusCode,
    ).toBe(201);

    // And the ceremony is one-shot: with two roots, a second
    // nomination refuses at the gate.
    const secondPayload = {
      nominatorKey: founder.publicKey,
      nomineeKey: rosa.publicKey,
      nodeId: "node_test",
      nominatedAt: Date.now(),
      expiresAt: Date.now() + FOUNDER_NOMINATION_TTL_MS,
    };
    const second = await app.inject({
      method: "POST",
      url: "/founder-nomination",
      payload: {
        ...secondPayload,
        signature: sign(
          canonicalFounderNominationPayload(secondPayload),
          founder.secretKey,
        ),
      },
    });
    expect(second.statusCode).toBe(409);
    expect(second.json()).toEqual({ error: "root_count_not_one" });
  });
});
