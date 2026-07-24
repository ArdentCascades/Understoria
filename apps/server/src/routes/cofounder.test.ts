/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Database as DatabaseType } from "better-sqlite3-multiple-ciphers";
import type { FastifyInstance } from "fastify";
import {
  FOUNDER_NOMINATION_MAX_WINDOW_MS,
  FOUNDER_NOMINATION_TTL_MS,
  canonicalFounderAccessionPayload,
  canonicalFounderNominationPayload,
  canonicalInvitePayload,
  canonicalReadAuthMessage,
  canonicalRedemptionPayload,
  canonicalVouchPayload,
  generateKeyPair,
  sign,
  type KeyPair,
} from "@understoria/shared/crypto";
import type {
  FounderAccession,
  FounderNomination,
  RedemptionReceipt,
  SignedVouch,
} from "@understoria/shared/types";
import { buildServer } from "../server.js";
import { readConfigFromEnv } from "../config.js";
import { createCofounderStore, openDatabase } from "../db.js";
import { createTrustResolver } from "../trustGate.js";

// Co-founder ceremony routes (docs/cofounder-ceremony-plan.md P2):
// every refusal row of both POST tables as its own test, the
// recipient-proof GET, the accession transaction (root recount /
// race / replay / reseed), and the trustGate single-founder warn.
// READ_AUTH stays off throughout, as in trustGate.test.ts — the
// ceremony surfaces self-gate; the global guards are not under test.

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

let app: FastifyInstance | null = null;
let db: DatabaseType | null = null;

afterEach(async () => {
  if (app) await app.close();
  if (db) db.close();
  app = null;
  db = null;
});

async function serverWith(env: Record<string, string> = {}) {
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
  await app.ready();
  return app;
}

let seq = 0;

/** A verified receipt admitting `redeemer` on `inviter`'s invite. */
function makeReceipt(inviter: KeyPair, redeemer: KeyPair): RedemptionReceipt {
  const invitePayload = {
    token: `tok_${++seq}_${redeemer.publicKey.slice(0, 6)}`,
    inviterKey: inviter.publicKey,
    inviterName: "Inviter",
    nodeId: "node_test",
    createdAt: Date.now() - 1000,
    expiresAt: Date.now() + DAY,
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

function makeNomination(
  nominator: KeyPair,
  nominee: KeyPair,
  over: Partial<FounderNomination> = {},
): FounderNomination {
  const payload = {
    nominatorKey: nominator.publicKey,
    nomineeKey: nominee.publicKey,
    nodeId: "node_test",
    nominatedAt: Date.now(),
    expiresAt: Date.now() + FOUNDER_NOMINATION_TTL_MS,
    ...over,
  };
  return {
    ...payload,
    signature:
      over.signature ??
      sign(canonicalFounderNominationPayload(payload), nominator.secretKey),
  };
}

function makeAccession(
  nomination: FounderNomination,
  nominee: KeyPair,
  over: Partial<FounderAccession> = {},
): FounderAccession {
  const payload = {
    nomination,
    acceptedAt: Date.now(),
    ...over,
  };
  return {
    ...payload,
    signature:
      over.signature ??
      sign(canonicalFounderAccessionPayload(payload), nominee.secretKey),
  };
}

async function post(url: string, payload: unknown) {
  return app!.inject({ method: "POST", url, payload });
}

/** Admit `redeemer` via `inviter`'s receipt, asserting acceptance. */
async function admit(inviter: KeyPair, redeemer: KeyPair) {
  const res = await post("/redemptions", makeReceipt(inviter, redeemer));
  expect(res.statusCode).toBe(201);
}

/** The x-understoria recipient-proof trio for `url`, signed by `kp`. */
function readHeaders(kp: KeyPair, url: string, ts = Date.now()) {
  return {
    "x-understoria-key": kp.publicKey,
    "x-understoria-ts": String(ts),
    "x-understoria-sig": sign(canonicalReadAuthMessage(url, ts), kp.secretKey),
  };
}

async function getPending(headers: Record<string, string>) {
  return app!.inject({
    method: "GET",
    url: "/founder-nomination/pending",
    headers,
  });
}

const founder = generateKeyPair();
const nominee = generateKeyPair();

/** Single-env-founder node with `nominee` already admitted. */
async function singleFounderServer(env: Record<string, string> = {}) {
  await serverWith({ NODE_FOUNDER_KEYS: founder.publicKey, ...env });
  await admit(founder, nominee);
}

describe("POST /founder-nomination — refusal table", () => {
  it("400 invalid_body on a malformed record", async () => {
    await singleFounderServer();
    const res = await post("/founder-nomination", { nominatorKey: 42 });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBe("invalid_body");
  });

  it("400 invalid_expiry on a non-forward window", async () => {
    await singleFounderServer();
    const now = Date.now();
    const res = await post(
      "/founder-nomination",
      makeNomination(founder, nominee, { nominatedAt: now, expiresAt: now }),
    );
    expect(res.statusCode).toBe(400);
    expect(res.json()).toEqual({ error: "invalid_expiry" });
  });

  it("400 invalid_expiry on a window beyond the sanity ceiling", async () => {
    await singleFounderServer();
    const now = Date.now();
    const res = await post(
      "/founder-nomination",
      makeNomination(founder, nominee, {
        nominatedAt: now,
        expiresAt: now + FOUNDER_NOMINATION_MAX_WINDOW_MS + 1,
      }),
    );
    expect(res.statusCode).toBe(400);
    expect(res.json()).toEqual({ error: "invalid_expiry" });
  });

  it("409 wrong_node when the nomination names another node", async () => {
    await singleFounderServer();
    const res = await post(
      "/founder-nomination",
      makeNomination(founder, nominee, { nodeId: "node_other" }),
    );
    expect(res.statusCode).toBe(409);
    expect(res.json()).toEqual({ error: "wrong_node" });
  });

  it("401 stale_nomination when nominatedAt is outside the skew bound", async () => {
    await singleFounderServer();
    const res = await post(
      "/founder-nomination",
      makeNomination(founder, nominee, {
        nominatedAt: Date.now() - 11 * 60 * 1000,
      }),
    );
    expect(res.statusCode).toBe(401);
    expect(res.json()).toEqual({ error: "stale_nomination" });
  });

  it("409 node_unclaimed on a founderless, unclaimed node", async () => {
    await serverWith({});
    const res = await post(
      "/founder-nomination",
      makeNomination(founder, nominee),
    );
    expect(res.statusCode).toBe(409);
    expect(res.json()).toEqual({ error: "node_unclaimed" });
  });

  it("409 root_count_not_one with two roots — the reopening drill: circle size is irrelevant", async () => {
    // Two env roots but a trusted CIRCLE of zero beyond them — under
    // a circle-sized gate this would look "locked" again. The gate
    // counts ROOTS, so the ceremony refuses regardless of the circle.
    const founder2 = generateKeyPair();
    await serverWith({
      NODE_FOUNDER_KEYS: `${founder.publicKey},${founder2.publicKey}`,
    });
    await admit(founder, nominee);
    const res = await post(
      "/founder-nomination",
      makeNomination(founder, nominee),
    );
    expect(res.statusCode).toBe(409);
    expect(res.json()).toEqual({ error: "root_count_not_one" });
  });

  it("403 nominator_not_founder when a mere member signs the nomination", async () => {
    await singleFounderServer();
    const other = generateKeyPair();
    const res = await post(
      "/founder-nomination",
      makeNomination(nominee, other),
    );
    expect(res.statusCode).toBe(403);
    expect(res.json()).toEqual({ error: "nominator_not_founder" });
  });

  it("409 nominee_not_a_member for a key outside the closure (invite them first)", async () => {
    await singleFounderServer();
    const stranger = generateKeyPair();
    const res = await post(
      "/founder-nomination",
      makeNomination(founder, stranger),
    );
    expect(res.statusCode).toBe(409);
    expect(res.json()).toEqual({ error: "nominee_not_a_member" });
  });

  it("409 nominee_already_founder on self-nomination", async () => {
    await singleFounderServer();
    const res = await post(
      "/founder-nomination",
      makeNomination(founder, founder),
    );
    expect(res.statusCode).toBe(409);
    expect(res.json()).toEqual({ error: "nominee_already_founder" });
  });

  it("422 bad_signature when the signature is not the nominator's", async () => {
    await singleFounderServer();
    const forged = makeNomination(founder, nominee);
    forged.signature = sign(
      canonicalFounderNominationPayload(forged),
      nominee.secretKey,
    );
    const res = await post("/founder-nomination", forged);
    expect(res.statusCode).toBe(422);
    expect(res.json()).toEqual({ error: "bad_signature" });
  });
});

describe("POST /founder-nomination — accepted writes", () => {
  it("201 stores the nomination; env-founder (count from env == 1) can nominate", async () => {
    await singleFounderServer();
    const res = await post(
      "/founder-nomination",
      makeNomination(founder, nominee),
    );
    expect(res.statusCode).toBe(201);
    expect(res.json()).toEqual({
      stored: true,
      nomineeKey: nominee.publicKey,
    });
  });

  it("resend replaces: one row per nominee, the newer nomination served", async () => {
    await singleFounderServer();
    const first = makeNomination(founder, nominee, {
      nominatedAt: Date.now() - 60_000,
    });
    expect((await post("/founder-nomination", first)).statusCode).toBe(201);
    const second = makeNomination(founder, nominee);
    expect((await post("/founder-nomination", second)).statusCode).toBe(201);

    const rows = db!
      .prepare("SELECT COUNT(*) AS n FROM founder_nominations")
      .get() as { n: number };
    expect(rows.n).toBe(1);
    const res = await getPending(
      readHeaders(nominee, "/founder-nomination/pending"),
    );
    expect(res.statusCode).toBe(200);
    expect(res.json().nomination).toEqual(second);
  });

  it("prunes expired pending rows on the write path", async () => {
    await singleFounderServer();
    // An expired row planted directly — the route's skew gate would
    // never have admitted it this old, but a shelf ages in place.
    const store = createCofounderStore(db!);
    const expired = makeNomination(founder, nominee, {
      nominatedAt: Date.now() - 5 * DAY,
      expiresAt: Date.now() - 2 * DAY,
    });
    store.upsertNomination(expired, Date.now() - 5 * DAY);
    const other = generateKeyPair();
    await admit(founder, other);
    expect(
      (await post("/founder-nomination", makeNomination(founder, other)))
        .statusCode,
    ).toBe(201);
    const rows = db!
      .prepare("SELECT nominee_key FROM founder_nominations")
      .all() as { nominee_key: string }[];
    expect(rows.map((r) => r.nominee_key)).toEqual([other.publicKey]);
  });
});

describe("GET /founder-nomination/pending — recipient proof", () => {
  it("401 recipient_proof_required without the header trio", async () => {
    await singleFounderServer();
    const res = await getPending({});
    expect(res.statusCode).toBe(401);
    expect(res.json()).toEqual({ error: "recipient_proof_required" });
  });

  it("403 recipient_proof_required for a peer bearer token", async () => {
    await singleFounderServer();
    const res = await getPending({ authorization: "Bearer peer-token" });
    expect(res.statusCode).toBe(403);
    expect(res.json()).toEqual({ error: "recipient_proof_required" });
  });

  it("401 stale_read_signature outside the skew bound", async () => {
    await singleFounderServer();
    const res = await getPending(
      readHeaders(
        nominee,
        "/founder-nomination/pending",
        Date.now() - 11 * 60 * 1000,
      ),
    );
    expect(res.statusCode).toBe(401);
    expect(res.json()).toEqual({ error: "stale_read_signature" });
  });

  it("401 bad_read_signature for a signature by another key", async () => {
    await singleFounderServer();
    const other = generateKeyPair();
    const ts = Date.now();
    const res = await getPending({
      "x-understoria-key": nominee.publicKey,
      "x-understoria-ts": String(ts),
      "x-understoria-sig": sign(
        canonicalReadAuthMessage("/founder-nomination/pending", ts),
        other.secretKey,
      ),
    });
    expect(res.statusCode).toBe(401);
    expect(res.json()).toEqual({ error: "bad_read_signature" });
  });

  it("another member's proven key sees null — no enumeration oracle", async () => {
    await singleFounderServer();
    const other = generateKeyPair();
    await admit(founder, other);
    expect(
      (await post("/founder-nomination", makeNomination(founder, nominee)))
        .statusCode,
    ).toBe(201);
    const res = await getPending(
      readHeaders(other, "/founder-nomination/pending"),
    );
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ nomination: null });
  });

  it("the proven nominee receives their unexpired nomination", async () => {
    await singleFounderServer();
    const nomination = makeNomination(founder, nominee);
    expect((await post("/founder-nomination", nomination)).statusCode).toBe(
      201,
    );
    const res = await getPending(
      readHeaders(nominee, "/founder-nomination/pending"),
    );
    expect(res.statusCode).toBe(200);
    expect(res.json().nomination).toEqual(nomination);
  });
});

describe("POST /founder-accession — refusal table", () => {
  it("400 invalid_body on a malformed record", async () => {
    await singleFounderServer();
    const res = await post("/founder-accession", { acceptedAt: "later" });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBe("invalid_body");
  });

  it("409 wrong_node when the embedded nomination names another node", async () => {
    await singleFounderServer();
    const nomination = makeNomination(founder, nominee, {
      nodeId: "node_other",
    });
    const res = await post(
      "/founder-accession",
      makeAccession(nomination, nominee),
    );
    expect(res.statusCode).toBe(409);
    expect(res.json()).toEqual({ error: "wrong_node" });
  });

  it("409 acceptance_out_of_window when acceptedAt precedes nominatedAt", async () => {
    await singleFounderServer();
    const nomination = makeNomination(founder, nominee);
    const res = await post(
      "/founder-accession",
      makeAccession(nomination, nominee, {
        acceptedAt: nomination.nominatedAt - 1,
      }),
    );
    expect(res.statusCode).toBe(409);
    expect(res.json()).toEqual({ error: "acceptance_out_of_window" });
  });

  it("409 acceptance_out_of_window when acceptedAt passes expiresAt — even inside an open reseed window", async () => {
    // The record-internal bound is SIGNED time and is never waived:
    // the reseed grace only relaxes the live clock.
    await singleFounderServer({
      RESEED_GRACE_UNTIL: new Date(Date.now() + DAY).toISOString(),
    });
    const nomination = makeNomination(founder, nominee);
    const res = await post(
      "/founder-accession",
      makeAccession(nomination, nominee, {
        acceptedAt: nomination.expiresAt + 1,
      }),
    );
    expect(res.statusCode).toBe(409);
    expect(res.json()).toEqual({ error: "acceptance_out_of_window" });
  });

  it("422 bad_signature when the OUTER (nominee) layer fails", async () => {
    await singleFounderServer();
    const nomination = makeNomination(founder, nominee);
    const accession = makeAccession(nomination, nominee);
    accession.signature = sign(
      canonicalFounderAccessionPayload(accession),
      founder.secretKey,
    );
    const res = await post("/founder-accession", accession);
    expect(res.statusCode).toBe(422);
    expect(res.json()).toEqual({ error: "bad_signature" });
  });

  it("422 bad_signature when the INNER (nomination) layer fails", async () => {
    await singleFounderServer();
    const nomination = makeNomination(founder, nominee);
    const tampered = {
      ...nomination,
      nomineeKey: generateKeyPair().publicKey,
    };
    // Outer layer honestly signed over the tampered nomination — only
    // the embedded-layer verification can refuse this.
    const res = await post(
      "/founder-accession",
      makeAccession(tampered, nominee),
    );
    expect(res.statusCode).toBe(422);
    expect(res.json()).toEqual({ error: "bad_signature" });
  });

  it("409 nomination_expired when the live clock has passed expiresAt", async () => {
    await singleFounderServer();
    const nomination = makeNomination(founder, nominee, {
      nominatedAt: Date.now() - 5 * DAY,
      expiresAt: Date.now() - 2 * DAY,
    });
    const res = await post(
      "/founder-accession",
      makeAccession(nomination, nominee, {
        acceptedAt: nomination.expiresAt - HOUR,
      }),
    );
    expect(res.statusCode).toBe(409);
    expect(res.json()).toEqual({ error: "nomination_expired" });
  });

  it("201 for the same expired artifact inside an open reseed grace window", async () => {
    // The accession is the reseed recovery artifact: the pending row
    // is gone (fresh node) and the nomination is long expired, but
    // the dual-signed record re-derives the root while the window is
    // open. Record-internal bounds still held above.
    await singleFounderServer({
      RESEED_GRACE_UNTIL: new Date(Date.now() + DAY).toISOString(),
    });
    const nomination = makeNomination(founder, nominee, {
      nominatedAt: Date.now() - 5 * DAY,
      expiresAt: Date.now() - 2 * DAY,
    });
    const res = await post(
      "/founder-accession",
      makeAccession(nomination, nominee, {
        acceptedAt: nomination.expiresAt - HOUR,
      }),
    );
    expect(res.statusCode).toBe(201);
    expect(res.json()).toEqual({ ok: true });
    const claimed = db!
      .prepare(
        "SELECT COUNT(*) AS n FROM claimed_founders WHERE founder_key = ?",
      )
      .get(nominee.publicKey) as { n: number };
    expect(claimed.n).toBe(1);
  });

  it("409 root_count_not_one when the sole root is not the nominator", async () => {
    // A nomination signed by a key that WAS never this node's root:
    // stateless verification passes, the transactional recount
    // refuses — named risk 1 (founder recovered under a new key).
    await singleFounderServer();
    const impostor = generateKeyPair();
    const nomination = makeNomination(impostor, nominee);
    const res = await post(
      "/founder-accession",
      makeAccession(nomination, nominee),
    );
    expect(res.statusCode).toBe(409);
    expect(res.json()).toEqual({ error: "root_count_not_one" });
  });
});

describe("POST /founder-accession — the transaction", () => {
  it("happy path: claimed_founders row + resolver flip + TWO /config hashes", async () => {
    await singleFounderServer();

    // Before accession the nominee holds ONE trusted voucher (the
    // founder's invite) — not trusted, so their vouch is refused.
    const somebody = generateKeyPair();
    const before = await post("/vouches", makeVouch(nominee, somebody));
    expect(before.statusCode).toBe(403);
    expect(before.json()).toEqual({ error: "voucher_not_trusted" });

    const nomination = makeNomination(founder, nominee);
    expect((await post("/founder-nomination", nomination)).statusCode).toBe(
      201,
    );
    const res = await post(
      "/founder-accession",
      makeAccession(nomination, nominee),
    );
    expect(res.statusCode).toBe(201);
    expect(res.json()).toEqual({ ok: true });

    // (a) the root registration landed…
    const claimed = db!
      .prepare(
        "SELECT COUNT(*) AS n FROM claimed_founders WHERE founder_key = ?",
      )
      .get(nominee.publicKey) as { n: number };
    expect(claimed.n).toBe(1);
    // …the permanent artifact with it, and the pending row is gone.
    expect(
      (
        db!
          .prepare("SELECT COUNT(*) AS n FROM founder_accessions")
          .get() as { n: number }
      ).n,
    ).toBe(1);
    expect(
      (
        db!
          .prepare("SELECT COUNT(*) AS n FROM founder_nominations")
          .get() as { n: number }
      ).n,
    ).toBe(0);

    // (b) the trust resolver now counts the nominee as trusted — the
    // count-stamp invalidation, asserted through a route it gates:
    // the claimed_founders insert moved the stamp, no other
    // invalidation code exists.
    const after = await post("/vouches", makeVouch(nominee, somebody));
    expect(after.statusCode).toBe(201);

    // (c) /config republishes live: TWO founder hashes.
    const config = (
      await app!.inject({ method: "GET", url: "/config" })
    ).json() as { founderKeyHashes?: string[] };
    expect(config.founderKeyHashes).toHaveLength(2);
  });

  it("byte-identical replay converges to 200 alreadyFounder", async () => {
    await singleFounderServer();
    const nomination = makeNomination(founder, nominee);
    const accession = makeAccession(nomination, nominee);
    expect((await post("/founder-accession", accession)).statusCode).toBe(201);
    const replay = await post("/founder-accession", accession);
    expect(replay.statusCode).toBe(200);
    expect(replay.json()).toEqual({ ok: true, alreadyFounder: true });
    // Still exactly one root registration for the nominee.
    const claimed = db!
      .prepare(
        "SELECT COUNT(*) AS n FROM claimed_founders WHERE founder_key = ?",
      )
      .get(nominee.publicKey) as { n: number };
    expect(claimed.n).toBe(1);
  });

  it("a NON-identical accession for an existing co-founder is refused root_count_not_one", async () => {
    await singleFounderServer();
    const nomination = makeNomination(founder, nominee);
    const accession = makeAccession(nomination, nominee);
    expect((await post("/founder-accession", accession)).statusCode).toBe(201);
    // Re-signed with a different acceptedAt: not the stored artifact,
    // and the recount now sees two roots.
    const reSigned = makeAccession(nomination, nominee, {
      acceptedAt: accession.acceptedAt + 1,
    });
    const res = await post("/founder-accession", reSigned);
    expect(res.statusCode).toBe(409);
    expect(res.json()).toEqual({ error: "root_count_not_one" });
  });

  it("the race: two nominations while count == 1 — first accession 201, second 409", async () => {
    await singleFounderServer();
    const rival = generateKeyPair();
    await admit(founder, rival);
    // Both nominations mint while the root count is still 1.
    const forNominee = makeNomination(founder, nominee);
    const forRival = makeNomination(founder, rival);
    expect((await post("/founder-nomination", forNominee)).statusCode).toBe(
      201,
    );
    expect((await post("/founder-nomination", forRival)).statusCode).toBe(201);
    // Back-to-back accessions: the first wins…
    expect(
      (await post("/founder-accession", makeAccession(forNominee, nominee)))
        .statusCode,
    ).toBe(201);
    // …the loser gets the clean transactional refusal, never a third
    // root.
    const lost = await post(
      "/founder-accession",
      makeAccession(forRival, rival),
    );
    expect(lost.statusCode).toBe(409);
    expect(lost.json()).toEqual({ error: "root_count_not_one" });
    expect(
      (
        db!
          .prepare("SELECT COUNT(*) AS n FROM claimed_founders")
          .get() as { n: number }
      ).n,
    ).toBe(1);
  });
});

describe("trustGate — one-time single-founder warning", () => {
  it("fires exactly once when the root count is 1", () => {
    db = openDatabase(":memory:");
    const warn = vi.fn();
    const resolver = createTrustResolver(db, {
      envFounderKeys: [founder.publicKey],
      warn,
    });
    resolver.trustedSet();
    resolver.trustedSet();
    resolver.isTrusted(founder.publicKey);
    const singleWarns = warn.mock.calls.filter(([msg]) =>
      (msg as string).includes("ONE founder root"),
    );
    expect(singleWarns).toHaveLength(1);
  });

  it("does not fire for a founderless node (that has its own warn)", () => {
    db = openDatabase(":memory:");
    const warn = vi.fn();
    const resolver = createTrustResolver(db, { envFounderKeys: [], warn });
    resolver.trustedSet();
    expect(resolver.founderlessSkip()).toBe(true);
    expect(
      warn.mock.calls.some(([msg]) =>
        (msg as string).includes("ONE founder root"),
      ),
    ).toBe(false);
  });

  it("does not fire with two roots", () => {
    db = openDatabase(":memory:");
    const warn = vi.fn();
    const resolver = createTrustResolver(db, {
      envFounderKeys: [founder.publicKey, generateKeyPair().publicKey],
      warn,
    });
    resolver.trustedSet();
    expect(warn).not.toHaveBeenCalled();
  });
});
