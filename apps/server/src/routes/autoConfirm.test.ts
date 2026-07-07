/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import Fastify, { type FastifyInstance } from "fastify";
import type { Database as DatabaseType } from "better-sqlite3-multiple-ciphers";
import {
  canonicalAwaitingTransitionPayload,
  canonicalExchangePayload,
  canonicalPostPayload,
  generateKeyPair,
  sign,
  type KeyPair,
} from "@understoria/shared/crypto";
import type { Category, Exchange } from "@understoria/shared/types";
import {
  createAwaitingTransitionStore,
  createExchangeStore,
  createPostStore,
  openDatabase,
  type AwaitingTransitionStore,
  type ExchangeStore,
  type PostRecord,
  type PostStore,
} from "../db.js";
import { registerAutoConfirmRoutes } from "./autoConfirm.js";
import {
  createSystemSignerFromSecret,
  type SystemSigner,
} from "../systemSigner.js";

const HOUR = 60 * 60 * 1000;
const NODE_ID = "node_test";

let app: FastifyInstance;
let db: DatabaseType;
let store: ExchangeStore;
let postStore: PostStore;
let transitionStore: AwaitingTransitionStore;
let signer: SystemSigner;
let nowMs: number;

beforeEach(async () => {
  db = openDatabase(":memory:");
  store = createExchangeStore(db);
  postStore = createPostStore(db);
  transitionStore = createAwaitingTransitionStore(db);
  const sysKp = generateKeyPair();
  signer = createSystemSignerFromSecret(sysKp.secretKey)!;
  nowMs = 1_700_000_000_000;
  app = Fastify({ logger: false });
  await registerAutoConfirmRoutes(app, {
    store,
    postStore,
    transitionStore,
    signer,
    nodeId: NODE_ID,
    autoConfirmMinHours: 168,
    requireTransition: false,
    now: () => nowMs,
  });
  await app.ready();
});

afterEach(async () => {
  await app.close();
  db.close();
});

/** Insert a signed NEED post whose poster is `poster`, with the given
 *  hours/category, so a matching auto-confirm request binds. */
function seedNeedPost(opts: {
  postId: string;
  poster: KeyPair;
  hours: number;
  category: Category;
}): void {
  const base = {
    id: opts.postId,
    type: "NEED" as const,
    category: opts.category,
    title: "Need a hand",
    description: "",
    estimatedHours: opts.hours,
    urgency: "soon" as const,
    postedBy: opts.poster.publicKey,
    createdAt: nowMs - 10 * 24 * HOUR,
    expiresAt: nowMs + 10 * 24 * HOUR,
    locationZone: "zone",
    nodeId: NODE_ID,
  };
  const signature = sign(canonicalPostPayload(base), opts.poster.secretKey);
  postStore.insert({ ...base, signature } as PostRecord);
}

/**
 * A well-formed request whose HELPED party is the poster of a seeded
 * NEED post (so `bindToPost` passes), signed by the helper. Returns the
 * request plus the keypairs for tests that tweak roles.
 */
function makeBoundRequest(
  overrides: Partial<{
    awaitingSince: number;
    hours: number;
    category: Category;
    postId: string;
    exchangeId: string;
  }> = {},
) {
  const helper = generateKeyPair();
  const helped = generateKeyPair(); // the poster of the NEED
  const postId = overrides.postId ?? "post_x";
  const hours = overrides.hours ?? 1.5;
  const category = overrides.category ?? "transport";
  seedNeedPost({ postId, poster: helped, hours, category });
  const payload = {
    postId,
    helperKey: helper.publicKey,
    helpedKey: helped.publicKey,
    hours,
    category,
    completedAt: nowMs,
  };
  const helperSignature = sign(
    canonicalExchangePayload(payload),
    helper.secretKey,
  );
  return {
    request: {
      exchangeId: overrides.exchangeId ?? "ex_x",
      awaitingSince: overrides.awaitingSince ?? nowMs - 8 * 24 * HOUR,
      helperSignature,
      payload,
    },
    helper,
    helped,
  };
}

async function post(requests: unknown[]) {
  const res = await app.inject({
    method: "POST",
    url: "/auto-confirm",
    payload: { requests },
  });
  return res.json() as {
    results: Array<{ status: string; reason?: string; exchange?: Exchange }>;
  };
}

describe("POST /auto-confirm — endpoint-level enforcement", () => {
  it("signs a well-formed request bound to a real post whose window has elapsed", async () => {
    const { request } = makeBoundRequest();
    const body = await post([request]);
    expect(body.results[0].status).toBe("signed");
    expect(body.results[0].exchange?.autoConfirmed).toBe(true);
    expect(body.results[0].exchange?.autoConfirmedBy).toBe(`system:${NODE_ID}`);
  });

  it("server independently rejects window-not-elapsed (client claim is not trusted)", async () => {
    const { request } = makeBoundRequest({ awaitingSince: nowMs - 1 * HOUR });
    const body = await post([request]);
    expect(body.results[0].status).toBe("ineligible");
    expect(body.results[0].reason).toBe("window_not_elapsed");
  });

  it("server rejects bad helper signature (cannot invent records)", async () => {
    const { request } = makeBoundRequest();
    const corrupted = {
      ...request,
      helperSignature: request.helperSignature.slice(0, -2) + "AA",
    };
    const body = await post([corrupted]);
    expect(body.results[0].status).toBe("ineligible");
    expect(body.results[0].reason).toBe("bad_helper_signature");
  });

  it("payload bytes the helper signed survive byte-for-byte through signing", async () => {
    const { request } = makeBoundRequest();
    const body = await post([request]);
    const ex = body.results[0].exchange!;
    expect(ex.helperKey).toBe(request.payload.helperKey);
    expect(ex.helpedKey).toBe(request.payload.helpedKey);
    expect(ex.hoursExchanged).toBe(request.payload.hours);
    expect(ex.category).toBe(request.payload.category);
    expect(ex.completedAt).toBe(request.payload.completedAt);
    expect(ex.helperSignature).toBe(request.helperSignature);
  });
});

describe("POST /auto-confirm — authority binding (Round-4)", () => {
  it("rejects a request whose helped party is NOT the poster of the post (no minting against an arbitrary victim)", async () => {
    // Attacker signs their own payload naming an arbitrary victim as
    // helpedKey; there is no post whose poster is that victim.
    const attacker = generateKeyPair();
    const victim = generateKeyPair();
    seedNeedPost({
      postId: "post_real",
      poster: generateKeyPair(), // a DIFFERENT poster
      hours: 2,
      category: "transport",
    });
    const payload = {
      postId: "post_real",
      helperKey: attacker.publicKey,
      helpedKey: victim.publicKey, // not the poster
      hours: 2,
      category: "transport" as const,
      completedAt: nowMs,
    };
    const helperSignature = sign(
      canonicalExchangePayload(payload),
      attacker.secretKey,
    );
    const body = await post([
      { exchangeId: "ex_forge", awaitingSince: nowMs - 8 * 24 * HOUR, helperSignature, payload },
    ]);
    expect(body.results[0].status).toBe("ineligible");
    expect(body.results[0].reason).toBe("poster_mismatch");
  });

  it("rejects a request for a post that does not exist on this node (retryable, not signed)", async () => {
    const helper = generateKeyPair();
    const helped = generateKeyPair();
    const payload = {
      postId: "post_absent",
      helperKey: helper.publicKey,
      helpedKey: helped.publicKey,
      hours: 1,
      category: "transport" as const,
      completedAt: nowMs,
    };
    const helperSignature = sign(
      canonicalExchangePayload(payload),
      helper.secretKey,
    );
    const body = await post([
      { exchangeId: "ex_absent", awaitingSince: nowMs - 8 * 24 * HOUR, helperSignature, payload },
    ]);
    expect(body.results[0].status).toBe("ineligible");
    expect(body.results[0].reason).toBe("post_not_found");
  });

  it("rejects hours that do not match the poster-signed post (cannot inflate credit)", async () => {
    const helper = generateKeyPair();
    const helped = generateKeyPair();
    seedNeedPost({ postId: "post_h", poster: helped, hours: 2, category: "transport" });
    const payload = {
      postId: "post_h",
      helperKey: helper.publicKey,
      helpedKey: helped.publicKey,
      hours: 999, // != post.estimatedHours
      category: "transport" as const,
      completedAt: nowMs,
    };
    const helperSignature = sign(
      canonicalExchangePayload(payload),
      helper.secretKey,
    );
    const body = await post([
      { exchangeId: "ex_h", awaitingSince: nowMs - 8 * 24 * HOUR, helperSignature, payload },
    ]);
    expect(body.results[0].status).toBe("ineligible");
    expect(body.results[0].reason).toBe("hours_mismatch");
  });

  it("caps hours on the unbindable project-task path", async () => {
    const helper = generateKeyPair();
    const helped = generateKeyPair();
    const payload = {
      postId: "project:p1/task:t1",
      helperKey: helper.publicKey,
      helpedKey: helped.publicKey,
      hours: 5000, // over MAX_UNBOUND_AUTO_CONFIRM_HOURS
      category: "transport" as const,
      completedAt: nowMs,
    };
    const helperSignature = sign(
      canonicalExchangePayload(payload),
      helper.secretKey,
    );
    const body = await post([
      { exchangeId: "ex_task", awaitingSince: nowMs - 8 * 24 * HOUR, helperSignature, payload },
    ]);
    expect(body.results[0].status).toBe("ineligible");
    expect(body.results[0].reason).toBe("hours_exceeds_cap");
  });

  it("signs a within-cap project-task request (feature preserved)", async () => {
    const helper = generateKeyPair();
    const helped = generateKeyPair();
    const payload = {
      postId: "project:p1/task:t2",
      helperKey: helper.publicKey,
      helpedKey: helped.publicKey,
      hours: 3,
      category: "transport" as const,
      completedAt: nowMs,
    };
    const helperSignature = sign(
      canonicalExchangePayload(payload),
      helper.secretKey,
    );
    const body = await post([
      { exchangeId: "ex_task_ok", awaitingSince: nowMs - 8 * 24 * HOUR, helperSignature, payload },
    ]);
    expect(body.results[0].status).toBe("signed");
  });

  it("rejects a completedAt far in the future (400 bad body)", async () => {
    const { request } = makeBoundRequest();
    const bad = {
      ...request,
      payload: { ...request.payload, completedAt: nowMs + 30 * 24 * HOUR },
    };
    const res = await app.inject({
      method: "POST",
      url: "/auto-confirm",
      payload: { requests: [bad] },
    });
    expect(res.statusCode).toBe(400);
  });
});

/** Sign and store an awaiting-transition artifact for a bound
 *  request's postId, server-stamped at `receivedAt`. */
function storeArtifact(opts: {
  postId: string;
  helper: KeyPair;
  helped: KeyPair;
  receivedAt: number;
  signer?: "helper" | "helped";
  helperKeyOverride?: string;
}): void {
  const signedBy =
    (opts.signer ?? "helper") === "helper"
      ? opts.helper.publicKey
      : opts.helped.publicKey;
  const payload = {
    kind: "awaiting_transition" as const,
    postId: opts.postId,
    helperKey: opts.helperKeyOverride ?? opts.helper.publicKey,
    helpedKey: opts.helped.publicKey,
    signedBy,
    enteredAt: 1_000, // deliberately ancient — proves it is IGNORED
    nodeId: NODE_ID,
  };
  const secret =
    signedBy === opts.helper.publicKey
      ? opts.helper.secretKey
      : opts.helped.secretKey;
  const signature = sign(canonicalAwaitingTransitionPayload(payload), secret);
  transitionStore.insert({ ...payload, signature }, opts.receivedAt);
}

describe("POST /auto-confirm — §5 server-anchored window (awaiting-transition artifact)", () => {
  it("enforces the window from the artifact's received_at, IGNORING both awaitingSince and enteredAt", async () => {
    // Client claims an ancient awaitingSince AND the artifact carries
    // an ancient enteredAt — but the node only received the artifact
    // an hour ago, so the window has NOT elapsed on the node's clock.
    const { request, helper, helped } = makeBoundRequest({
      postId: "post_anchor",
      awaitingSince: nowMs - 400 * 24 * HOUR,
    });
    storeArtifact({
      postId: "post_anchor",
      helper,
      helped,
      receivedAt: nowMs - 1 * HOUR,
    });
    const body = await post([request]);
    expect(body.results[0].status).toBe("ineligible");
    expect(body.results[0].reason).toBe("window_not_elapsed");
  });

  it("signs once the artifact has aged past the window on the node's clock", async () => {
    const { request, helper, helped } = makeBoundRequest({
      postId: "post_aged",
      // Client-claimed age is too YOUNG — the trusted anchor wins in
      // both directions.
      awaitingSince: nowMs - 1 * HOUR,
    });
    storeArtifact({
      postId: "post_aged",
      helper,
      helped,
      receivedAt: nowMs - 8 * 24 * HOUR,
    });
    const body = await post([request]);
    expect(body.results[0].status).toBe("signed");
  });

  it("accepts an artifact attested by the HELPED party too", async () => {
    const { request, helper, helped } = makeBoundRequest({
      postId: "post_helped_signed",
    });
    storeArtifact({
      postId: "post_helped_signed",
      helper,
      helped,
      receivedAt: nowMs - 8 * 24 * HOUR,
      signer: "helped",
    });
    const body = await post([request]);
    expect(body.results[0].status).toBe("signed");
  });

  it("rejects when the artifact's parties do not match the request (no borrowed age)", async () => {
    const { request, helped } = makeBoundRequest({
      postId: "post_mismatch",
    });
    const stranger = generateKeyPair();
    storeArtifact({
      postId: "post_mismatch",
      helper: stranger, // artifact names a different helper
      helped,
      receivedAt: nowMs - 8 * 24 * HOUR,
    });
    const body = await post([request]);
    expect(body.results[0].status).toBe("ineligible");
    expect(body.results[0].reason).toBe("transition_mismatch");
  });

  it("first-writer-wins: a re-push cannot reset the age anchor", async () => {
    const { request, helper, helped } = makeBoundRequest({
      postId: "post_first_wins",
    });
    storeArtifact({
      postId: "post_first_wins",
      helper,
      helped,
      receivedAt: nowMs - 8 * 24 * HOUR,
    });
    // Attacker (or a retry) pushes again with a fresh received_at —
    // the store keeps the FIRST row, so the aged anchor stands.
    storeArtifact({
      postId: "post_first_wins",
      helper,
      helped,
      receivedAt: nowMs - 1,
    });
    const body = await post([request]);
    expect(body.results[0].status).toBe("signed");
  });

  it("legacy mode (requireTransition=false): no artifact falls back to advisory awaitingSince", async () => {
    const { request } = makeBoundRequest({ postId: "post_legacy" });
    const body = await post([request]);
    expect(body.results[0].status).toBe("signed");
  });

  it("enforced mode (requireTransition=true): no artifact is refused outright", async () => {
    const strictApp = Fastify({ logger: false });
    await registerAutoConfirmRoutes(strictApp, {
      store,
      postStore,
      transitionStore,
      signer,
      nodeId: NODE_ID,
      autoConfirmMinHours: 168,
      requireTransition: true,
      now: () => nowMs,
    });
    await strictApp.ready();
    try {
      const { request } = makeBoundRequest({ postId: "post_strict" });
      const res = await strictApp.inject({
        method: "POST",
        url: "/auto-confirm",
        payload: { requests: [request] },
      });
      const body = res.json() as {
        results: Array<{ status: string; reason?: string }>;
      };
      expect(body.results[0].status).toBe("ineligible");
      expect(body.results[0].reason).toBe("missing_transition");
    } finally {
      await strictApp.close();
    }
  });

  it("enforced mode still signs when a properly-aged artifact exists (project-task path included)", async () => {
    const strictApp = Fastify({ logger: false });
    await registerAutoConfirmRoutes(strictApp, {
      store,
      postStore,
      transitionStore,
      signer,
      nodeId: NODE_ID,
      autoConfirmMinHours: 168,
      requireTransition: true,
      now: () => nowMs,
    });
    await strictApp.ready();
    try {
      // Project-task label — the previously-unbindable path the
      // artifact finally covers: the window is enforceable from
      // received_at even though no post exists to bind to.
      const helper = generateKeyPair();
      const helped = generateKeyPair();
      const postId = "project:p1/task:t1";
      const payload = {
        postId,
        helperKey: helper.publicKey,
        helpedKey: helped.publicKey,
        hours: 2,
        category: "other" as Category,
        completedAt: nowMs,
      };
      const helperSignature = sign(
        canonicalExchangePayload(payload),
        helper.secretKey,
      );
      storeArtifact({
        postId,
        helper,
        helped,
        receivedAt: nowMs - 8 * 24 * HOUR,
      });
      const res = await strictApp.inject({
        method: "POST",
        url: "/auto-confirm",
        payload: {
          requests: [
            {
              exchangeId: "ex_task",
              awaitingSince: nowMs - 8 * 24 * HOUR,
              helperSignature,
              payload,
            },
          ],
        },
      });
      const body = res.json() as {
        results: Array<{ status: string; reason?: string }>;
      };
      expect(body.results[0].status).toBe("signed");
    } finally {
      await strictApp.close();
    }
  });
});
