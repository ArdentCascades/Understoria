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
  canonicalInvitePayload,
  canonicalMemberRemovalPayload,
  canonicalMemberReinstatementPayload,
  canonicalReadAuthMessage,
  canonicalRedemptionPayload,
  canonicalVouchPayload,
  generateKeyPair,
  sign,
  signStateRecord,
  type KeyPair,
} from "@understoria/shared/crypto";
import type {
  MemberRemoval,
  MemberRemovalPayload,
  MemberReinstatement,
  MemberReinstatementPayload,
  RedemptionReceipt,
  SeedVaultPledge,
} from "@understoria/shared/types";
import { buildServer } from "../server.js";
import { readConfigFromEnv } from "../config.js";
import { openDatabase } from "../db.js";

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

function makeReceipt(
  inviter: KeyPair,
  redeemer: KeyPair,
  redeemedAt = Date.now(),
): RedemptionReceipt {
  const invitePayload = {
    token: `tok_${++seq}_${redeemer.publicKey.slice(0, 6)}`,
    inviterKey: inviter.publicKey,
    inviterName: "Inviter",
    nodeId: "node_test",
    createdAt: redeemedAt - 1000,
    expiresAt: redeemedAt + 86_400_000,
  };
  const invite = {
    ...invitePayload,
    signature: sign(canonicalInvitePayload(invitePayload), inviter.secretKey),
  };
  const payload = {
    invite,
    redeemedBy: redeemer.publicKey,
    displayName: "New Member",
    redeemedAt,
  };
  return {
    ...payload,
    signature: sign(canonicalRedemptionPayload(payload), redeemer.secretKey),
  };
}

async function admit(inviter: KeyPair, redeemer: KeyPair, redeemedAt?: number) {
  const res = await app!.inject({
    method: "POST",
    url: "/redemptions",
    payload: makeReceipt(inviter, redeemer, redeemedAt),
  });
  expect([200, 201]).toContain(res.statusCode);
}

/** Removal/reinstatement co-signing is a trusted-member power
 *  (trustGate.ts, operator decision 2026-07), and trust needs 2
 *  distinct trusted vouchers — a founder's invite plus this second
 *  founder-signed manual vouch is how fixtures root a co-signer. */
async function vouch(voucher: KeyPair, vouchee: KeyPair, createdAt = Date.now()) {
  const payload = {
    voucherKey: voucher.publicKey,
    voucheeKey: vouchee.publicKey,
    createdAt,
    kind: "manual" as const,
  };
  const res = await app!.inject({
    method: "POST",
    url: "/vouches",
    payload: {
      id: `v_${++seq}`,
      ...payload,
      signature: sign(canonicalVouchPayload(payload), voucher.secretKey),
    },
  });
  expect(res.statusCode).toBe(201);
}

function makeRemoval(
  removedKey: string,
  signers: KeyPair[],
  over: Partial<MemberRemovalPayload> = {},
): MemberRemoval {
  const payload: MemberRemovalPayload = {
    id: `rm_${++seq}`,
    removedKey,
    reason: "community decision (test)",
    decidedAt: Date.now(),
    nodeId: "node_test",
    proposalId: null,
    ...over,
  };
  const canonical = canonicalMemberRemovalPayload(payload);
  return {
    ...payload,
    signatures: signers.map((s) => ({
      signerKey: s.publicKey,
      signature: sign(canonical, s.secretKey),
    })),
  };
}

function makeReinstatement(
  reinstatedKey: string,
  signers: KeyPair[],
  over: Partial<MemberReinstatementPayload> = {},
): MemberReinstatement {
  const payload: MemberReinstatementPayload = {
    id: `ri_${++seq}`,
    reinstatedKey,
    reason: null,
    decidedAt: Date.now(),
    nodeId: "node_test",
    proposalId: null,
    ...over,
  };
  const canonical = canonicalMemberReinstatementPayload(payload);
  return {
    ...payload,
    signatures: signers.map((s) => ({
      signerKey: s.publicKey,
      signature: sign(canonical, s.secretKey),
    })),
  };
}

function makePledge(member: KeyPair): SeedVaultPledge {
  const unsigned: Omit<SeedVaultPledge, "signature"> = {
    id: `svp_${++seq}`,
    memberKey: member.publicKey,
    active: true,
    updatedAt: Date.now(),
    signerKey: member.publicKey,
  };
  return {
    ...unsigned,
    signature: signStateRecord<SeedVaultPledge>(unsigned, member.secretKey),
  };
}

/** Probe a member's read standing through the read-auth gate. */
async function canRead(member: KeyPair): Promise<boolean> {
  const path = "/posts?limit=1";
  const ts = Date.now();
  const res = await app!.inject({
    method: "GET",
    url: path,
    headers: {
      "x-understoria-key": member.publicKey,
      "x-understoria-ts": String(ts),
      "x-understoria-sig": sign(
        canonicalReadAuthMessage(path, ts),
        member.secretKey,
      ),
    },
  });
  if (res.statusCode === 200) return true;
  expect(res.statusCode).toBe(403);
  return false;
}

describe("member removal M1 — the record and the gates", () => {
  it("a quorum removal lands, closes the pen; reinstatement reopens it", async () => {
    const founder = generateKeyPair();
    // Second root: co-signers a/b/c must be TRUSTED under the
    // founder-rooted closure, so founder2's vouches give each their
    // second trusted voucher. The removal mechanics under test are
    // unchanged.
    const founder2 = generateKeyPair();
    const [a, b, c, target] = [1, 2, 3, 4].map(() => generateKeyPair());
    await serverWith({
      NODE_FOUNDER_KEYS: `${founder.publicKey},${founder2.publicKey}`,
      READ_AUTH: "on",
    });
    for (const m of [a, b, c, target]) await admit(founder, m);
    for (const m of [a, b, c]) await vouch(founder2, m);
    expect(await canRead(target)).toBe(true);

    const removal = makeRemoval(target.publicKey, [founder, a, b]);
    const res = await app!.inject({
      method: "POST",
      url: "/member-removals",
      payload: removal,
    });
    expect(res.statusCode).toBe(201);

    // Idempotent re-submission.
    const again = await app!.inject({
      method: "POST",
      url: "/member-removals",
      payload: removal,
    });
    expect(again.statusCode).toBe(200);
    expect(again.json()).toEqual({ stored: false, id: removal.id });

    // The feed serves it (signed read by a live member).
    const path = "/member-removals";
    const ts = Date.now();
    const feed = await app!.inject({
      method: "GET",
      url: path,
      headers: {
        "x-understoria-key": a.publicKey,
        "x-understoria-ts": String(ts),
        "x-understoria-sig": sign(
          canonicalReadAuthMessage(path, ts),
          a.secretKey,
        ),
      },
    });
    expect(feed.statusCode).toBe(200);
    expect(
      (feed.json() as { memberRemovals: MemberRemoval[] }).memberRemovals,
    ).toHaveLength(1);

    // Read standing gone; pen closed (403 author_removed on any POST).
    expect(await canRead(target)).toBe(false);
    const write = await app!.inject({
      method: "POST",
      url: "/seed-vault-pledges",
      payload: makePledge(target),
    });
    expect(write.statusCode).toBe(403);
    expect(write.json()).toEqual({ error: "author_removed" });

    // Mirror-internal requests bypass the write gate: pre-removal
    // HISTORY must keep replicating across the mirror set.
    const mirrored = await app!.inject({
      method: "POST",
      url: "/seed-vault-pledges",
      payload: makePledge(target),
      headers: { "x-understoria-internal": internalToken },
    });
    expect(mirrored.statusCode).toBe(201);

    // Reinstatement (same quorum) reopens both gates.
    const back = await app!.inject({
      method: "POST",
      url: "/member-reinstatements",
      payload: makeReinstatement(target.publicKey, [founder, a, c]),
    });
    expect(back.statusCode).toBe(201);
    expect(await canRead(target)).toBe(true);
    const writeAgain = await app!.inject({
      method: "POST",
      url: "/seed-vault-pledges",
      payload: makePledge(target),
    });
    expect(writeAgain.statusCode).toBe(201);
  });

  it("chain rule: pre-removal invitees stay; receipts through a removed inviter die; reinstatement is not retroactive", async () => {
    const founder = generateKeyPair();
    // Second founder root: since the founder-rooted trust gate
    // (trustGate.ts), only a TRUSTED inviter's receipts are accepted,
    // and trust needs 2 distinct trusted vouchers — with a single
    // root nobody but the founder could ever invite. Two roots plus a
    // manual vouch below make `inviter` trusted, which is what this
    // chain test needs to exercise the removal rules.
    const founder2 = generateKeyPair();
    const inviter = generateKeyPair();
    const preInvitee = generateKeyPair();
    const postInvitee = generateKeyPair();
    const postReinstateInvitee = generateKeyPair();
    const [s1, s2] = [1, 2].map(() => generateKeyPair());
    await serverWith({
      NODE_FOUNDER_KEYS: `${founder.publicKey},${founder2.publicKey}`,
      READ_AUTH: "on",
    });
    const now = Date.now();
    await admit(founder, inviter, now - 3_600_000);
    // founder2's manual vouch is inviter's second trusted voucher.
    await vouch(founder2, inviter, now - 3_500_000);
    await admit(founder, s1, now - 3_600_000);
    await admit(founder, s2, now - 3_600_000);
    // s1/s2 co-sign the removal below, so they must be trusted too.
    await vouch(founder2, s1, now - 3_500_000);
    await vouch(founder2, s2, now - 3_500_000);
    await admit(inviter, preInvitee, now - 3_000_000);

    const removal = makeRemoval(inviter.publicKey, [founder, s1, s2], {
      decidedAt: now - 1_800_000,
    });
    expect(
      (
        await app!.inject({
          method: "POST",
          url: "/member-removals",
          payload: removal,
        })
      ).statusCode,
    ).toBe(201);

    // Removal is not retroactive and never cascades.
    expect(await canRead(inviter)).toBe(false);
    expect(await canRead(preInvitee)).toBe(true);

    // A receipt redeemed WHILE the inviter stood removed is dead —
    // their unredeemed invites died with the removal.
    await admit(inviter, postInvitee, now - 900_000);
    expect(await canRead(postInvitee)).toBe(false);

    // Reinstatement restores the inviter, NOT the dead edge…
    const back = makeReinstatement(inviter.publicKey, [founder, s1, s2], {
      decidedAt: now - 600_000,
    });
    expect(
      (
        await app!.inject({
          method: "POST",
          url: "/member-reinstatements",
          payload: back,
        })
      ).statusCode,
    ).toBe(201);
    expect(await canRead(inviter)).toBe(true);
    expect(await canRead(postInvitee)).toBe(false);

    // …while a FRESH post-reinstatement invite works again.
    await admit(inviter, postReinstateInvitee, now - 60_000);
    expect(await canRead(postReinstateInvitee)).toBe(true);
  });

  it("quorum edges: self-signature, duplicates, tampering, and non-member signers", async () => {
    const founder = generateKeyPair();
    // Second root so co-signers a/b are trusted — the edge cases
    // under test are about SIGNATURES and membership, not trust.
    const founder2 = generateKeyPair();
    const [a, b, target] = [1, 2, 3].map(() => generateKeyPair());
    const stranger = generateKeyPair();
    await serverWith({
      NODE_FOUNDER_KEYS: `${founder.publicKey},${founder2.publicKey}`,
    });
    for (const m of [a, b, target]) await admit(founder, m);
    for (const m of [a, b]) await vouch(founder2, m);

    // The subject's own signature never counts toward quorum.
    const selfSigned = makeRemoval(target.publicKey, [founder, a, target]);
    const selfRes = await app!.inject({
      method: "POST",
      url: "/member-removals",
      payload: selfSigned,
    });
    expect(selfRes.statusCode).toBe(422);

    // Duplicate signers collapse to one.
    const dup = makeRemoval(target.publicKey, [founder, a, a]);
    expect(
      (
        await app!.inject({
          method: "POST",
          url: "/member-removals",
          payload: dup,
        })
      ).statusCode,
    ).toBe(422);

    // A tampered payload fails every signature.
    const tampered = {
      ...makeRemoval(target.publicKey, [founder, a, b]),
      reason: "edited after signing",
    };
    expect(
      (
        await app!.inject({
          method: "POST",
          url: "/member-removals",
          payload: tampered,
        })
      ).statusCode,
    ).toBe(422);

    // Valid signatures from a NON-member don't reach quorum here —
    // 409 (retryable), because a catching-up mirror may simply not
    // hold the signer's receipt yet.
    const strangerSigned = makeRemoval(target.publicKey, [founder, a, stranger]);
    expect(
      (
        await app!.inject({
          method: "POST",
          url: "/member-removals",
          payload: strangerSigned,
        })
      ).statusCode,
    ).toBe(409);

    // The full quorum of members lands.
    const good = makeRemoval(target.publicKey, [founder, a, b]);
    expect(
      (
        await app!.inject({
          method: "POST",
          url: "/member-removals",
          payload: good,
        })
      ).statusCode,
    ).toBe(201);
  });

  it("refuses to remove the last non-removed founder", async () => {
    const f1 = generateKeyPair();
    // Trusted co-signers need a second root (see `vouch`), but the
    // guard under test needs f1 to be the LAST live founder — so f2
    // roots a/b/c and is then itself removed by quorum first. Trust
    // edges survive that removal (the closure reads stored edges,
    // and env roots are not membership rows), so a/b/c stay trusted.
    const f2 = generateKeyPair();
    const [a, b, c] = [1, 2, 3].map(() => generateKeyPair());
    await serverWith({
      NODE_FOUNDER_KEYS: `${f1.publicKey},${f2.publicKey}`,
    });
    for (const m of [a, b, c]) {
      await admit(f1, m);
      await vouch(f2, m);
    }
    expect(
      (
        await app!.inject({
          method: "POST",
          url: "/member-removals",
          payload: makeRemoval(f2.publicKey, [f1, a, b]),
        })
      ).statusCode,
    ).toBe(201);

    const res = await app!.inject({
      method: "POST",
      url: "/member-removals",
      payload: makeRemoval(f1.publicKey, [a, b, c]),
    });
    expect(res.statusCode).toBe(403);
    expect(res.json()).toEqual({ error: "last_founder" });
  });

  it("a second founder unblocks founder removal; a timestamp tie resolves to reinstatement", async () => {
    const f1 = generateKeyPair();
    const f2 = generateKeyPair();
    const [a, b] = [1, 2].map(() => generateKeyPair());
    await serverWith({
      NODE_FOUNDER_KEYS: `${f1.publicKey},${f2.publicKey}`,
      READ_AUTH: "on",
    });
    await admit(f1, a);
    await admit(f1, b);
    // a/b co-sign below: f2's vouches (pre-removal) make them trusted.
    await vouch(f2, a);
    await vouch(f2, b);

    const t = Date.now() - 5000;
    expect(
      (
        await app!.inject({
          method: "POST",
          url: "/member-removals",
          payload: makeRemoval(f2.publicKey, [f1, a, b], { decidedAt: t }),
        })
      ).statusCode,
    ).toBe(201);
    expect(await canRead(f2)).toBe(false);

    // Same-decidedAt reinstatement wins the tie (the door reopens).
    expect(
      (
        await app!.inject({
          method: "POST",
          url: "/member-reinstatements",
          payload: makeReinstatement(f2.publicKey, [f1, a, b], { decidedAt: t }),
        })
      ).statusCode,
    ).toBe(201);
    expect(await canRead(f2)).toBe(true);
  });

  it("respects a configured quorum", async () => {
    const founder = generateKeyPair();
    // Second root so co-signer `a` is trusted (see `vouch`).
    const founder2 = generateKeyPair();
    const [a, target] = [1, 2].map(() => generateKeyPair());
    await serverWith({
      NODE_FOUNDER_KEYS: `${founder.publicKey},${founder2.publicKey}`,
      REMOVAL_QUORUM: "2",
    });
    await admit(founder, a);
    await admit(founder, target);
    await vouch(founder2, a);

    // Two member signatures suffice at REMOVAL_QUORUM=2.
    expect(
      (
        await app!.inject({
          method: "POST",
          url: "/member-removals",
          payload: makeRemoval(target.publicKey, [founder, a]),
        })
      ).statusCode,
    ).toBe(201);

    // And /config publishes the number for member devices.
    const cfg = await app!.inject({ method: "GET", url: "/config" });
    expect((cfg.json() as { removalQuorum: number }).removalQuorum).toBe(2);
  });

  it("untrusted member co-signers fall short of quorum until their trust converges", async () => {
    const founder = generateKeyPair();
    const founder2 = generateKeyPair();
    const [a, b, c, target] = [1, 2, 3, 4].map(() => generateKeyPair());
    await serverWith({
      NODE_FOUNDER_KEYS: `${founder.publicKey},${founder2.publicKey}`,
    });
    for (const m of [a, b, c, target]) await admit(founder, m);

    // Three MEMBERS sign, but each has a single trusted voucher: the
    // membership quorum is met, the trusted quorum is not — and the
    // reason names the half that actually fell short.
    const removal = makeRemoval(target.publicKey, [a, b, c]);
    const refused = await app!.inject({
      method: "POST",
      url: "/member-removals",
      payload: removal,
    });
    expect(refused.statusCode).toBe(409);
    expect(refused.json()).toEqual({
      error: "quorum_not_met",
      reason: "not enough signers are trusted members of this community",
    });

    // 409 is retryable by design: trust data converges like
    // membership data, so the SAME record lands once the signers'
    // second vouchers arrive — no re-signing needed.
    for (const m of [a, b, c]) await vouch(founder2, m);
    const retried = await app!.inject({
      method: "POST",
      url: "/member-removals",
      payload: removal,
    });
    expect(retried.statusCode).toBe(201);
    expect(retried.json()).toEqual({ stored: true, id: removal.id });
  });

  it("reinstatement co-signers must be trusted members too", async () => {
    const founder = generateKeyPair();
    const [a, b, c, target] = [1, 2, 3, 4].map(() => generateKeyPair());
    await serverWith({ NODE_FOUNDER_KEYS: founder.publicKey });
    for (const m of [a, b, c]) await admit(founder, m);

    const res = await app!.inject({
      method: "POST",
      url: "/member-reinstatements",
      payload: makeReinstatement(target.publicKey, [a, b, c]),
    });
    expect(res.statusCode).toBe(409);
    expect(res.json()).toEqual({
      error: "quorum_not_met",
      reason: "not enough signers are trusted members of this community",
    });
  });

  it("founderless node: the trust gate skips and member-only behavior is unchanged", async () => {
    // No NODE_FOUNDER_KEYS, no claimed founder — the trust half
    // skips (trustGate.ts founderlessSkip). Membership shares the
    // same roots, so a founderless node has NO members either:
    // member-only behavior is (and was, before the trust gate) the
    // membership shortfall — never the trusted reason.
    const [a, b, c, target] = [1, 2, 3, 4].map(() => generateKeyPair());
    await serverWith({});
    // Receipts land (founderless nodes accept them, trustGate.test)
    // but grant no membership without a root.
    for (const m of [b, c, target]) await admit(a, m);

    const res = await app!.inject({
      method: "POST",
      url: "/member-removals",
      payload: makeRemoval(target.publicKey, [a, b, c]),
    });
    expect(res.statusCode).toBe(409);
    expect(res.json()).toEqual({
      error: "quorum_not_met",
      reason: "not enough signers are members of this community",
    });
  });

  it("mirror-internal replication bypasses the trusted requirement, not membership", async () => {
    const founder = generateKeyPair();
    const [a, b, c, target] = [1, 2, 3, 4].map(() => generateKeyPair());
    await serverWith({ NODE_FOUNDER_KEYS: founder.publicKey });
    for (const m of [a, b, c, target]) await admit(founder, m);

    // Members-but-untrusted signers: refused on the public path…
    const removal = makeRemoval(target.publicKey, [a, b, c]);
    expect(
      (
        await app!.inject({
          method: "POST",
          url: "/member-removals",
          payload: removal,
        })
      ).statusCode,
    ).toBe(409);

    // …while the mirror worker's re-POST lands: the record was
    // judged where it first entered the community. Membership still
    // counts as before.
    const mirrored = await app!.inject({
      method: "POST",
      url: "/member-removals",
      payload: removal,
      headers: { "x-understoria-internal": internalToken },
    });
    expect(mirrored.statusCode).toBe(201);

    // Same exemption on the reinstatement surface.
    const back = makeReinstatement(target.publicKey, [a, b, c]);
    expect(
      (
        await app!.inject({
          method: "POST",
          url: "/member-reinstatements",
          payload: back,
        })
      ).statusCode,
    ).toBe(409);
    const mirroredBack = await app!.inject({
      method: "POST",
      url: "/member-reinstatements",
      payload: back,
      headers: { "x-understoria-internal": internalToken },
    });
    expect(mirroredBack.statusCode).toBe(201);
  });
});
