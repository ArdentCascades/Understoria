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
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Database as DatabaseType } from "better-sqlite3-multiple-ciphers";
import type { FastifyInstance } from "fastify";
import {
  canonicalInviteAnnouncementPayload,
  canonicalInvitePayload,
  canonicalRedemptionPayload,
  generateKeyPair,
  inviteTokenHash,
  sign,
  type KeyPair,
} from "@understoria/shared/crypto";
import type {
  InviteAnnouncement,
  RedemptionReceipt,
  SignedInvite,
} from "@understoria/shared/types";
import { buildServer } from "../server.js";
import { readConfigFromEnv } from "../config.js";
import { openDatabase } from "../db.js";

// Invite announcements (operator ruling 2026-07): the inviter's device
// POSTs a signed, HASH-ONLY announcement at issue time; POST
// /redemptions flips the row to `redeemed` when the invitee's receipt
// lands. The v11-dropped live-credential `/invites` surface stays
// removed — its negative-space tests live in redemptions.test.ts.

let app: FastifyInstance;
let db: DatabaseType;

async function freshServer() {
  db = openDatabase(":memory:");
  const config = readConfigFromEnv({
    LOG_LEVEL: "fatal",
    READ_AUTH: "off",
    NODE_ID: "node_test",
  } as NodeJS.ProcessEnv);
  const built = await buildServer({ config, database: db });
  app = built.app;
  await app.ready();
}

beforeEach(freshServer);
afterEach(async () => {
  await app.close();
  db.close();
});

function makeInvite(
  opts: { inviter?: KeyPair; token?: string } = {},
): { invite: SignedInvite; inviter: KeyPair } {
  const inviter = opts.inviter ?? generateKeyPair();
  const payload = {
    token: opts.token ?? `tok_${Math.random().toString(36).slice(2)}`,
    inviterKey: inviter.publicKey,
    inviterName: "Rosa",
    nodeId: "node_test",
    createdAt: Date.now(),
    expiresAt: Date.now() + 14 * 24 * 60 * 60 * 1000,
  };
  return {
    invite: {
      ...payload,
      signature: sign(canonicalInvitePayload(payload), inviter.secretKey),
    },
    inviter,
  };
}

function makeAnnouncement(
  invite: SignedInvite,
  inviter: KeyPair,
): InviteAnnouncement {
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

function makeReceipt(invite: SignedInvite): RedemptionReceipt {
  const redeemer = generateKeyPair();
  const base = {
    invite,
    redeemedBy: redeemer.publicKey,
    displayName: "Newcomer",
    redeemedAt: Date.now(),
  };
  return {
    ...base,
    signature: sign(canonicalRedemptionPayload(base), redeemer.secretKey),
  };
}

describe("POST /invite-announcements", () => {
  it("stores a valid announcement (201) and serves it back on GET as open — with NO raw token anywhere", async () => {
    const { invite, inviter } = makeInvite();
    const announcement = makeAnnouncement(invite, inviter);
    const res = await app.inject({
      method: "POST",
      url: "/invite-announcements",
      payload: announcement,
    });
    expect(res.statusCode).toBe(201);
    expect(res.json()).toEqual({
      stored: true,
      tokenHash: announcement.tokenHash,
    });

    const list = await app.inject({
      method: "GET",
      url: "/invite-announcements",
    });
    expect(list.statusCode).toBe(200);
    const body = list.json() as {
      count: number;
      inviteAnnouncements: Array<Record<string, unknown>>;
    };
    expect(body.count).toBe(1);
    expect(body.inviteAnnouncements[0]).toMatchObject({
      tokenHash: announcement.tokenHash,
      inviterKey: invite.inviterKey,
      status: "open",
      redeemedBy: null,
    });
    // The v11 ruling holds: the RAW token never appears on this wire.
    expect(list.body).not.toContain(invite.token);
  });

  it("is idempotent for the same inviter (200), refuses a different one (409)", async () => {
    const { invite, inviter } = makeInvite();
    const announcement = makeAnnouncement(invite, inviter);
    await app.inject({
      method: "POST",
      url: "/invite-announcements",
      payload: announcement,
    });
    const replay = await app.inject({
      method: "POST",
      url: "/invite-announcements",
      payload: announcement,
    });
    expect(replay.statusCode).toBe(200);
    expect(replay.json()).toEqual({
      stored: false,
      tokenHash: announcement.tokenHash,
    });

    const impostorKeys = generateKeyPair();
    const impostor = makeAnnouncement(
      { ...invite, inviterKey: impostorKeys.publicKey },
      impostorKeys,
    );
    const res = await app.inject({
      method: "POST",
      url: "/invite-announcements",
      payload: impostor,
    });
    expect(res.statusCode).toBe(409);
    expect(res.json()).toEqual({ error: "token_already_announced" });
  });

  it("rejects a malformed body (400) and a bad signature (422)", async () => {
    const bad = await app.inject({
      method: "POST",
      url: "/invite-announcements",
      payload: { hello: "world" },
    });
    expect(bad.statusCode).toBe(400);

    const { invite, inviter } = makeInvite();
    const forged = {
      ...makeAnnouncement(invite, inviter),
      inviterName: "Mallory", // breaks the signature
    };
    const res = await app.inject({
      method: "POST",
      url: "/invite-announcements",
      payload: forged,
    });
    expect(res.statusCode).toBe(422);
    expect(res.json()).toEqual({ error: "invalid_announcement" });
  });
});

describe("redemption flips the announced invite", () => {
  it("POST /redemptions marks the announcement redeemed, matched by token hash", async () => {
    const { invite, inviter } = makeInvite();
    const announcement = makeAnnouncement(invite, inviter);
    await app.inject({
      method: "POST",
      url: "/invite-announcements",
      payload: announcement,
    });

    const receipt = makeReceipt(invite);
    const res = await app.inject({
      method: "POST",
      url: "/redemptions",
      payload: receipt,
    });
    expect(res.statusCode).toBe(201);

    const list = await app.inject({
      method: "GET",
      url: "/invite-announcements",
    });
    const body = list.json() as {
      inviteAnnouncements: Array<Record<string, unknown>>;
    };
    expect(body.inviteAnnouncements[0]).toMatchObject({
      tokenHash: announcement.tokenHash,
      status: "redeemed",
      redeemedBy: receipt.redeemedBy,
      redeemedAt: receipt.redeemedAt,
    });
  });

  it("a receipt for an UNANNOUNCED invite still lands (the receipt is the membership authority)", async () => {
    const { invite } = makeInvite();
    const receipt = makeReceipt(invite);
    const res = await app.inject({
      method: "POST",
      url: "/redemptions",
      payload: receipt,
    });
    expect(res.statusCode).toBe(201);
    const list = await app.inject({
      method: "GET",
      url: "/invite-announcements",
    });
    expect((list.json() as { count: number }).count).toBe(0);
  });
});
