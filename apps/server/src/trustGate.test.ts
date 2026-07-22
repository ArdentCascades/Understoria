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
  canonicalInviteAnnouncementPayload,
  canonicalInvitePayload,
  canonicalRedemptionPayload,
  canonicalVouchPayload,
  generateKeyPair,
  inviteTokenHash,
  sign,
  type KeyPair,
} from "@understoria/shared/crypto";
import type {
  InviteAnnouncement,
  RedemptionReceipt,
  SignedInvite,
  SignedVouch,
} from "@understoria/shared/types";
import { buildServer } from "./server.js";
import { readConfigFromEnv } from "./config.js";
import { openDatabase } from "./db.js";
import { MIRROR_INTERNAL_HEADER } from "./mirrorPull.js";
import { computeServerTrustedSet } from "./trustGate.js";

// Founder-rooted trust gates (trustGate.ts) — the server half of the
// sybil fix in @understoria/shared/trust: only a TRUSTED member may
// vouch (/vouches), admit (/redemptions), or announce an invite
// (/invite-announcements). READ_AUTH stays off throughout so the
// membership write guard never interferes — the trust gate binds on
// its own, keyed solely on whether the node has a founder root.

let app: FastifyInstance | null = null;
let db: DatabaseType | null = null;
let internalToken = "";

afterEach(async () => {
  if (app) await app.close();
  if (db) db.close();
  app = null;
  db = null;
});

async function serverWith(env: Record<string, string>) {
  db = openDatabase(":memory:");
  const config = readConfigFromEnv({
    LOG_LEVEL: "fatal",
    READ_AUTH: "off",
    NODE_ID: "node_test",
    RATE_LIMIT_MAX: "10000",
    ...env,
  } as NodeJS.ProcessEnv);
  const built = await buildServer({ config, database: db });
  app = built.app;
  internalToken = built.internalBypassToken;
  await app.ready();
  return app;
}

let seq = 0;

function makeInvite(inviter: KeyPair): SignedInvite {
  const payload = {
    token: `tok_${++seq}_${inviter.publicKey.slice(0, 6)}`,
    inviterKey: inviter.publicKey,
    inviterName: "Inviter",
    nodeId: "node_test",
    createdAt: Date.now() - 1000,
    expiresAt: Date.now() + 86_400_000,
  };
  return {
    ...payload,
    signature: sign(canonicalInvitePayload(payload), inviter.secretKey),
  };
}

/** A verified receipt: `inviter` admits `redeemer`. */
function makeReceipt(inviter: KeyPair, redeemer: KeyPair): RedemptionReceipt {
  const payload = {
    invite: makeInvite(inviter),
    redeemedBy: redeemer.publicKey,
    displayName: "New Member",
    redeemedAt: Date.now(),
  };
  return {
    ...payload,
    signature: sign(canonicalRedemptionPayload(payload), redeemer.secretKey),
  };
}

/** A verified manual vouch: `voucher` vouches for `vouchee`. */
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

function makeAnnouncement(inviter: KeyPair): InviteAnnouncement {
  const invite = makeInvite(inviter);
  const payload = {
    tokenHash: inviteTokenHash(invite.token),
    inviterKey: invite.inviterKey,
    inviterName: invite.inviterName,
    nodeId: invite.nodeId,
    createdAt: invite.createdAt,
    expiresAt: invite.expiresAt,
  };
  return {
    ...payload,
    signature: sign(
      canonicalInviteAnnouncementPayload(payload),
      inviter.secretKey,
    ),
  };
}

async function post(url: string, payload: unknown, headers = {}) {
  return app!.inject({ method: "POST", url, payload, headers });
}

/** Admit `redeemer` via `inviter`'s receipt, asserting acceptance. */
async function admit(inviter: KeyPair, redeemer: KeyPair) {
  const res = await post("/redemptions", makeReceipt(inviter, redeemer));
  expect(res.statusCode).toBe(201);
}

describe("POST /vouches — founder-rooted trust gate", () => {
  it("refuses a pending member's vouch with 403 voucher_not_trusted", async () => {
    const founder = generateKeyPair();
    const pending = generateKeyPair();
    const somebody = generateKeyPair();
    await serverWith({ NODE_FOUNDER_KEYS: founder.publicKey });
    // pending is a member (founder's invitee) but has only ONE
    // trusted voucher — not trusted, so their vouch adds no edge.
    await admit(founder, pending);
    const res = await post("/vouches", makeVouch(pending, somebody));
    expect(res.statusCode).toBe(403);
    expect(res.json()).toEqual({ error: "voucher_not_trusted" });
  });

  it("stores a founder's vouch (201) and a trusted member's vouch", async () => {
    const f1 = generateKeyPair();
    const f2 = generateKeyPair();
    const member = generateKeyPair();
    const next = generateKeyPair();
    await serverWith({
      NODE_FOUNDER_KEYS: `${f1.publicKey},${f2.publicKey}`,
    });
    // Founder vouch: trusted by construction.
    await admit(f1, member);
    const fromFounder = await post("/vouches", makeVouch(f2, member));
    expect(fromFounder.statusCode).toBe(201);
    // member now holds two distinct trusted vouchers (f1 invite +
    // f2 manual) → trusted → their own vouch is accepted.
    const fromTrusted = await post("/vouches", makeVouch(member, next));
    expect(fromTrusted.statusCode).toBe(201);
  });
});

describe("POST /redemptions — founder-rooted trust gate", () => {
  it("bootstrap: the FIRST founder's own invite works on a fresh node", async () => {
    // Fresh node, zero rows anywhere: the founder is trusted by
    // construction (root of the fixpoint), so the very first receipt
    // — the one that creates the community — must land.
    const founder = generateKeyPair();
    const firstMember = generateKeyPair();
    await serverWith({ NODE_FOUNDER_KEYS: founder.publicKey });
    const res = await post("/redemptions", makeReceipt(founder, firstMember));
    expect(res.statusCode).toBe(201);
    expect(res.json().stored).toBe(true);
  });

  it("refuses a pending inviter's receipt with 403 inviter_not_trusted", async () => {
    const founder = generateKeyPair();
    const pending = generateKeyPair();
    const wouldBe = generateKeyPair();
    await serverWith({ NODE_FOUNDER_KEYS: founder.publicKey });
    await admit(founder, pending);
    const res = await post("/redemptions", makeReceipt(pending, wouldBe));
    expect(res.statusCode).toBe(403);
    expect(res.json()).toEqual({ error: "inviter_not_trusted" });
  });

  it("accepts a receipt from a member made trusted via two founders", async () => {
    const f1 = generateKeyPair();
    const f2 = generateKeyPair();
    const member = generateKeyPair();
    const invitee = generateKeyPair();
    await serverWith({
      NODE_FOUNDER_KEYS: `${f1.publicKey},${f2.publicKey}`,
    });
    await admit(f1, member);
    expect((await post("/vouches", makeVouch(f2, member))).statusCode).toBe(
      201,
    );
    const res = await post("/redemptions", makeReceipt(member, invitee));
    expect(res.statusCode).toBe(201);
  });

  it("mirror replication still ingests a pending inviter's receipt (convergence)", async () => {
    // A receipt ANOTHER node already accepted (e.g. before the gate
    // shipped, or before a revocation of trust) must replicate to
    // every mirror — convergence of already-accepted records is
    // never re-litigated. The mirror-pull worker's internal token
    // marks that path.
    const founder = generateKeyPair();
    const pending = generateKeyPair();
    const historical = generateKeyPair();
    await serverWith({ NODE_FOUNDER_KEYS: founder.publicKey });
    await admit(founder, pending);
    const res = await post(
      "/redemptions",
      { ...makeReceipt(pending, historical), receivedAt: Date.now() },
      { [MIRROR_INTERNAL_HEADER]: internalToken },
    );
    expect(res.statusCode).toBe(201);
  });
});

describe("POST /invite-announcements — founder-rooted trust gate", () => {
  it("refuses a pending member's announcement with 403 inviter_not_trusted", async () => {
    const founder = generateKeyPair();
    const pending = generateKeyPair();
    await serverWith({ NODE_FOUNDER_KEYS: founder.publicKey });
    await admit(founder, pending);
    const res = await post("/invite-announcements", makeAnnouncement(pending));
    expect(res.statusCode).toBe(403);
    expect(res.json()).toEqual({ error: "inviter_not_trusted" });
  });

  it("stores a founder's announcement (201)", async () => {
    const founder = generateKeyPair();
    await serverWith({ NODE_FOUNDER_KEYS: founder.publicKey });
    const res = await post("/invite-announcements", makeAnnouncement(founder));
    expect(res.statusCode).toBe(201);
  });
});

describe("sybil cluster end-to-end", () => {
  it("a careless member's bot cluster can neither vouch itself trusted nor invite", async () => {
    // The exact scenario the rooted fixpoint exists for
    // (@understoria/shared/trust): under flat counting, two accounts
    // invited by one member vouch each OTHER into the trusted tier.
    const f1 = generateKeyPair();
    const f2 = generateKeyPair();
    const careless = generateKeyPair(); // A — trusted, legitimately
    const botB = generateKeyPair();
    const botC = generateKeyPair();
    const botD = generateKeyPair();
    await serverWith({
      NODE_FOUNDER_KEYS: `${f1.publicKey},${f2.publicKey}`,
    });
    // A becomes trusted the honest way: f1's invite + f2's vouch.
    await admit(f1, careless);
    expect((await post("/vouches", makeVouch(f2, careless))).statusCode).toBe(
      201,
    );
    // A invites bots B and C — legitimate on its face (A is trusted).
    await admit(careless, botB);
    await admit(careless, botC);
    // B and C vouch each other: REJECTED — neither is trusted, so
    // the cluster cannot even store its self-amplifying edges.
    const bForC = await post("/vouches", makeVouch(botB, botC));
    expect(bForC.statusCode).toBe(403);
    expect(bForC.json()).toEqual({ error: "voucher_not_trusted" });
    const cForB = await post("/vouches", makeVouch(botC, botB));
    expect(cForB.statusCode).toBe(403);
    expect(cForB.json()).toEqual({ error: "voucher_not_trusted" });
    // B tries to grow the cluster by inviting D: refused.
    const dReceipt = await post("/redemptions", makeReceipt(botB, botD));
    expect(dReceipt.statusCode).toBe(403);
    expect(dReceipt.json()).toEqual({ error: "inviter_not_trusted" });
    // And the fixpoint agrees: A is trusted, the bots stay pending.
    const trusted = computeServerTrustedSet(db!, [
      f1.publicKey,
      f2.publicKey,
    ]);
    expect(trusted.has(careless.publicKey)).toBe(true);
    expect(trusted.has(botB.publicKey)).toBe(false);
    expect(trusted.has(botC.publicKey)).toBe(false);
  });
});

describe("founderless node — gates skipped", () => {
  it("keeps the old open behavior when no founder is configured or claimed", async () => {
    // No NODE_FOUNDER_KEYS, no claimed founder: trust cannot be
    // computed (empty root ⇒ empty trusted set ⇒ everything would
    // be refused), so the gates skip and log a one-time warning —
    // the same tolerant posture as the unclaimed-node state.
    const anyone = generateKeyPair();
    const someone = generateKeyPair();
    await serverWith({});
    const vouch = await post("/vouches", makeVouch(anyone, someone));
    expect(vouch.statusCode).toBe(201);
    const receipt = await post("/redemptions", makeReceipt(anyone, someone));
    expect(receipt.statusCode).toBe(201);
    const announcement = await post(
      "/invite-announcements",
      makeAnnouncement(anyone),
    );
    expect(announcement.statusCode).toBe(201);
  });
});
