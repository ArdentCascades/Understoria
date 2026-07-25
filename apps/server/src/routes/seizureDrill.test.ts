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
import { afterEach, describe, expect, it } from "vitest";
import type { Database as DatabaseType } from "better-sqlite3-multiple-ciphers";
import type { FastifyInstance } from "fastify";
import {
  FOUNDER_NOMINATION_TTL_MS,
  canonicalExchangePayload,
  canonicalFounderAccessionPayload,
  canonicalFounderClaimMessage,
  canonicalFounderNominationPayload,
  canonicalInvitePayload,
  canonicalPostPayload,
  canonicalProposalPayload,
  canonicalReadAuthMessage,
  canonicalRedemptionPayload,
  canonicalVouchPayload,
  generateKeyPair,
  sign,
  verifyExchangeLabel,
  type KeyPair,
} from "@understoria/shared/crypto";
import type {
  Exchange,
  FounderAccession,
  Proposal,
  RedemptionReceipt,
  SignedVouch,
} from "@understoria/shared/types";
import { buildServer } from "../server.js";
import { readConfigFromEnv } from "../config.js";
import { openDatabase } from "../db.js";

/*
 * The automated seizure drill (docs/node-seizure-plan.md §5.3): kill
 * a POPULATED node and restore the community onto a fresh one from
 * nothing but the wire artifacts member devices hold — the runbook's
 * mechanical half, end to end, over the real routes.
 *
 * Node A (node_lost) is built the way a real community builds:
 * founder claims the unclaimed node, the co-founder ceremony adds a
 * second root, a member is admitted and trusted, and content lands
 * through the real POST surfaces. Devices then GET every kind
 * exactly as their pulls would. A is closed and its database
 * dropped — the seizure. Node B boots fresh with the runbook's
 * recovery posture (same founder root, RESEED_GRACE_UNTIL,
 * TRUSTED_SYSTEM_KEYS carrying A's system key, old NODE_ID reused)
 * and the artifacts are re-POSTed in the web walker's kind order.
 * Then the recovery envs come OFF and READ_AUTH flips on — and
 * membership must derive from the restored receipts alone.
 *
 * Two honest boundaries, stated up front:
 *  - The auto-confirmed exchange is minted here with A's system
 *    secret in exactly the §4 shape A's /auto-confirm endpoint
 *    emits (that endpoint's own production path — claim, window,
 *    artifact gate — has its own suite in autoConfirm.test.ts).
 *    What THIS drill locks is that the artifact survives the node
 *    that signed it: B accepts and re-verifies it against the
 *    declared lost-node key.
 *  - What no automated test can cover is the organizational half —
 *    the out-of-band channel, the tabletop inventory, the humans.
 *    That is the §5.1 checklist card on the Infrastructure page.
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
    nodeId: "node_lost",
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

function signedPost(poster: KeyPair, id: string) {
  const immutable = {
    id,
    type: "NEED" as const,
    category: "transport" as const,
    title: "Help moving a couch",
    description: "",
    estimatedHours: 1,
    urgency: "medium" as const,
    postedBy: poster.publicKey,
    createdAt: Date.now(),
    expiresAt: null,
    locationZone: "z",
    nodeId: "node_lost",
  };
  return {
    ...immutable,
    signature: sign(canonicalPostPayload(immutable), poster.secretKey),
  };
}

function memberExchange(helper: KeyPair, helped: KeyPair): Exchange {
  const base = {
    id: `xm_${++seq}`,
    postId: `post_${seq}`,
    helperKey: helper.publicKey,
    helpedKey: helped.publicKey,
    hoursExchanged: 1,
    category: "other" as const,
    completedAt: Date.now() - 1000,
    nodeId: "node_lost",
  };
  const payload = canonicalExchangePayload({
    postId: base.postId,
    helperKey: base.helperKey,
    helpedKey: base.helpedKey,
    hours: base.hoursExchanged,
    category: base.category,
    completedAt: base.completedAt,
  });
  return {
    ...base,
    helperSignature: sign(payload, helper.secretKey),
    helpedSignature: sign(payload, helped.secretKey),
  };
}

/** The §4 artifact /auto-confirm emits: helper signs, the NODE's
 *  system key countersigns as the helped party. */
function systemConfirmedExchange(helper: KeyPair, systemKp: KeyPair): Exchange {
  const helped = generateKeyPair();
  const base = {
    id: `xa_${++seq}`,
    postId: `post_${seq}`,
    helperKey: helper.publicKey,
    helpedKey: helped.publicKey,
    hoursExchanged: 2,
    category: "other" as const,
    completedAt: Date.now() - 1000,
    nodeId: "node_lost",
  };
  const payload = canonicalExchangePayload({
    postId: base.postId,
    helperKey: base.helperKey,
    helpedKey: base.helpedKey,
    hours: base.hoursExchanged,
    category: base.category,
    completedAt: base.completedAt,
  });
  return {
    ...base,
    helperSignature: sign(payload, helper.secretKey),
    helpedSignature: sign(payload, systemKp.secretKey),
    autoConfirmed: true,
    autoConfirmedBy: "system:node_lost",
    autoConfirmedAt: base.completedAt,
  };
}

function readHeaders(kp: KeyPair, url: string, ts = Date.now()) {
  return {
    "x-understoria-key": kp.publicKey,
    "x-understoria-ts": String(ts),
    "x-understoria-sig": sign(canonicalReadAuthMessage(url, ts), kp.secretKey),
  };
}

function signedProposal(proposer: KeyPair) {
  const core = {
    id: `prop_${++seq}`,
    nodeId: "node_lost",
    kind: "proposal" as const,
    category: "config_change" as const,
    reversibilityTier: "hard" as const,
    title: "Rebuild the tool library shed",
    description: "Deliberation record that must survive the node.",
    payload: "{}",
    proposerKey: proposer.publicKey,
    createdAt: Date.now(),
    impactReflection: null,
    disputePostId: null,
  };
  return {
    ...core,
    signerKey: proposer.publicKey,
    signature: sign(canonicalProposalPayload(core), proposer.secretKey),
  };
}

describe("seizure drill — kill a populated node, restore onto a fresh one", () => {
  it("A: claim → accede → live; seize; B: grace restore → gates back on → same community", async () => {
    const founder = generateKeyPair();
    const cofounder = generateKeyPair();
    const rosa = generateKeyPair(); // admitted + trusted member
    const stranger = generateKeyPair();
    const systemKp = generateKeyPair(); // node A's auto-confirm key

    // ---- Node A: a real community accumulates -----------------------
    db = openDatabase(":memory:");
    const configA = readConfigFromEnv({
      LOG_LEVEL: "fatal",
      NODE_ID: "node_lost",
      RATE_LIMIT_MAX: "10000",
      READ_AUTH: "on",
      SETUP_TOKEN: "drill-setup-code",
      NODE_SYSTEM_SECRET_KEY: systemKp.secretKey,
    } as NodeJS.ProcessEnv);
    const builtA = await buildServer({ config: configA, database: db });
    app = builtA.app;
    await app.ready();

    // Founder claims the unclaimed node with the boot setup code.
    const claimTs = Date.now();
    expect(
      (
        await app.inject({
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
        })
      ).statusCode,
    ).toBe(201);

    // Co-founder: admitted, nominated, acceded — the second root.
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/redemptions",
          payload: makeReceipt(founder, cofounder),
        })
      ).statusCode,
    ).toBe(201);
    const nominationPayload = {
      nominatorKey: founder.publicKey,
      nomineeKey: cofounder.publicKey,
      nodeId: "node_lost",
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
    const accessionPayload = { nomination, acceptedAt: Date.now() };
    const accession: FounderAccession = {
      ...accessionPayload,
      signature: sign(
        canonicalFounderAccessionPayload(accessionPayload),
        cofounder.secretKey,
      ),
    };
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/founder-accession",
          payload: accession,
        })
      ).statusCode,
    ).toBe(201);

    // Rosa: founder invite + co-founder vouch → trusted member.
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

    // The community lives: a post, a two-member exchange, a proposal.
    const post = signedPost(rosa, `post_drill_${++seq}`);
    expect(
      (await app.inject({ method: "POST", url: "/posts", payload: post }))
        .statusCode,
    ).toBe(201);
    const exchange = memberExchange(rosa, cofounder);
    expect(
      (
        await app.inject({ method: "POST", url: "/exchanges", payload: exchange })
      ).statusCode,
    ).toBe(201);
    const proposal = signedProposal(rosa);
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/proposals",
          payload: proposal,
        })
      ).statusCode,
    ).toBe(201);
    // Plus the §4 artifact A's own /auto-confirm emitted at some
    // point — held on devices like every other exchange.
    const autoExchange = systemConfirmedExchange(rosa, systemKp);

    // ---- Devices pull the wire artifacts, exactly as their pulls do —
    // signed reads, READ_AUTH=on posture.
    const capture = async (url: string) =>
      (
        await app!.inject({
          method: "GET",
          url,
          headers: readHeaders(rosa, url),
        })
      ).json() as Record<string, unknown[]>;
    const heldRedemptions = (await capture("/redemptions"))
      .redemptions as RedemptionReceipt[];
    // The accession has no GET feed — devices hold it in their local
    // founderAccessions table from the ceremony / connect-time
    // backfill, which is exactly the copy the walker replays.
    const heldAccessions: FounderAccession[] = [accession];
    const heldPosts = (await capture("/posts")).posts as Array<{ id: string }>;
    const heldExchanges = (await capture("/exchanges"))
      .exchanges as Exchange[];
    const heldVouches = (await capture("/vouches")).vouches as SignedVouch[];
    const heldProposals = (await capture("/proposals"))
      .proposals as Proposal[];
    expect(heldRedemptions).toHaveLength(2);
    expect(heldAccessions).toHaveLength(1);
    expect(heldPosts.map((p) => p.id)).toContain(post.id);
    expect(heldExchanges).toHaveLength(1);
    expect(heldVouches.length).toBeGreaterThanOrEqual(1);
    expect(heldProposals).toHaveLength(1);

    // ---- The seizure: node A is gone; its database with it. --------
    await app.close();
    app = null;
    db!.close();

    // ---- Node B: the runbook's recovery posture ---------------------
    db = openDatabase(":memory:");
    const configB = readConfigFromEnv({
      LOG_LEVEL: "fatal",
      NODE_ID: "node_lost", // runbook: reuse the old NODE_ID if known
      RATE_LIMIT_MAX: "10000",
      READ_AUTH: "off", // writes are what recovery needs
      NODE_FOUNDER_KEYS: founder.publicKey, // same root — never rotates
      RESEED_GRACE_UNTIL: String(Date.now() + 24 * 60 * 60 * 1000),
      TRUSTED_SYSTEM_KEYS: JSON.stringify([
        // Copied from a member device's captured /config record.
        { nodeId: "node_lost", current: systemKp.publicKey, history: [] },
      ]),
    } as NodeJS.ProcessEnv);
    const builtB = await buildServer({ config: configB, database: db });
    app = builtB.app;
    await app.ready();

    // Re-POST the held artifacts in the web walker's kind order
    // (reseed.ts RESEED_KINDS): membership first, then content.
    for (const r of heldRedemptions) {
      expect(
        [200, 201].includes(
          (
            await app.inject({
              method: "POST",
              url: "/redemptions",
              payload: r,
            })
          ).statusCode,
        ),
      ).toBe(true);
    }
    for (const a of heldAccessions) {
      expect(
        (
          await app.inject({
            method: "POST",
            url: "/founder-accession",
            payload: a,
          })
        ).statusCode,
      ).toBe(201);
    }
    for (const p of heldProposals) {
      expect(
        (
          await app.inject({ method: "POST", url: "/proposals", payload: p })
        ).statusCode,
      ).toBe(201);
    }
    expect(
      (await app.inject({ method: "POST", url: "/posts", payload: post }))
        .statusCode,
    ).toBe(201);
    for (const x of [...heldExchanges, autoExchange]) {
      expect(
        (
          await app.inject({ method: "POST", url: "/exchanges", payload: x })
        ).statusCode,
      ).toBe(201);
    }
    for (const v of heldVouches) {
      expect(
        (
          await app.inject({ method: "POST", url: "/vouches", payload: v })
        ).statusCode,
      ).toBe(201);
    }

    // ---- Recovery envs OFF, read gate ON — same database ------------
    await app.close();
    const configB2 = readConfigFromEnv({
      LOG_LEVEL: "fatal",
      NODE_ID: "node_lost",
      RATE_LIMIT_MAX: "10000",
      READ_AUTH: "on",
      NODE_FOUNDER_KEYS: founder.publicKey,
    } as NodeJS.ProcessEnv);
    const builtB2 = await buildServer({ config: configB2, database: db });
    app = builtB2.app;
    await app.ready();

    // Membership derives from the restored receipts ALONE: rosa's
    // signed read is admitted, a stranger's valid signature is not.
    const rosaRead = await app.inject({
      method: "GET",
      url: "/posts",
      headers: readHeaders(rosa, "/posts"),
    });
    expect(rosaRead.statusCode).toBe(200);
    const strangerRead = await app.inject({
      method: "GET",
      url: "/posts",
      headers: readHeaders(stranger, "/posts"),
    });
    expect(strangerRead.statusCode).toBe(403);

    // Both founder roots survive: the env root plus the acceded one.
    const cfg = (
      await app.inject({ method: "GET", url: "/config" })
    ).json() as { founderKeyHashes?: string[] };
    expect(cfg.founderKeyHashes).toHaveLength(2);

    // The feeds equal what the devices held — nothing was lost.
    const postsB = (
      await app.inject({
        method: "GET",
        url: "/posts",
        headers: readHeaders(rosa, "/posts"),
      })
    ).json() as { posts: Array<{ id: string }> };
    expect(postsB.posts.map((p) => p.id).sort()).toEqual(
      heldPosts.map((p) => p.id).sort(),
    );
    const exchangesB = (
      await app.inject({
        method: "GET",
        url: "/exchanges",
        headers: readHeaders(rosa, "/exchanges"),
      })
    ).json() as { exchanges: Exchange[] };
    expect(exchangesB.exchanges.map((x) => x.id).sort()).toEqual(
      [...heldExchanges, autoExchange].map((x) => x.id).sort(),
    );

    // And the auto-confirmed exchange re-verifies on any device
    // against the captured lost-node key — the client-side check
    // every pull applies.
    const restoredAuto = exchangesB.exchanges.find(
      (x) => x.id === autoExchange.id,
    );
    expect(restoredAuto).toBeDefined();
    expect(
      verifyExchangeLabel(restoredAuto as Exchange, (nodeId) =>
        nodeId === "node_lost" ? systemKp.publicKey : null,
      ),
    ).toBe("system-signed");
  });
});
