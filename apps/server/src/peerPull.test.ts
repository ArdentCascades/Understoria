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
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  canonicalCoOrganizerInvitationPayload,
  canonicalCoOrganizerInvitationResponsePayload,
  canonicalCoOrganizerInvitationRevocationPayload,
  canonicalEventCancellationPayload,
  canonicalEventPayload,
  canonicalExchangePayload,
  canonicalPostPayload,
  canonicalTaskCommentPayload,
  canonicalVouchPayload,
  generateKeyPair,
  sign,
} from "@understoria/shared/crypto";
import type {
  CoOrganizerInvitation,
  CoOrganizerInvitationResponse,
  CoOrganizerInvitationRevocation,
  Exchange,
  SignedVouch,
  TaskComment,
} from "@understoria/shared/types";
import type { Database as DatabaseType } from "better-sqlite3";
import {
  createCoOrganizerInvitationResponseStore,
  createCoOrganizerInvitationRevocationStore,
  createCoOrganizerInvitationStore,
  createEventCancellationStore,
  createEventStore,
  createExchangeStore,
  createPeerPullStore,
  createPostStore,
  createTaskCommentStore,
  createVouchStore,
  openDatabase,
  type PostRecord,
} from "./db.js";
import {
  pullCoOrganizerInvitationResponsesFromPeer,
  pullCoOrganizerInvitationRevocationsFromPeer,
  pullCoOrganizerInvitationsFromPeer,
  pullEventCancellationsFromPeer,
  pullEventsFromPeer,
  pullFromPeer,
  pullPostsFromPeer,
  pullTaskCommentsFromPeer,
  pullVouchesFromPeer,
  startPeerPullWorker,
  type Fetcher,
} from "./peerPull.js";

let db: DatabaseType;

beforeEach(() => {
  db = openDatabase(":memory:");
});
afterEach(() => {
  db.close();
});

function makeSignedExchange(overrides: Partial<Exchange> = {}): Exchange {
  const helper = generateKeyPair();
  const helped = generateKeyPair();
  const base = {
    id: overrides.id ?? `x_${Math.random().toString(36).slice(2)}`,
    postId: "p_x",
    helperKey: helper.publicKey,
    helpedKey: helped.publicKey,
    hoursExchanged: 1,
    category: "other" as const,
    completedAt: overrides.completedAt ?? Date.now(),
    nodeId: overrides.nodeId ?? "node_peer",
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
    ...overrides,
  };
}

function jsonResponse(body: unknown, status = 200): ReturnType<Fetcher> {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

/** Wrap a fetcher so requests against the non-exchange endpoints
 *  get empty lists. Lets the exchange-focused tests stay readable
 *  while the worker now calls every kind's endpoint per peer. */
function exchangeOnly(inner: Fetcher): Fetcher {
  return (url) => {
    // "/config" answers `{}` — "peer publishes no system key" — so
    // member-signed exchange pulls proceed under the strict resolver.
    if (/\/config\b/.test(url)) {
      return jsonResponse({});
    }
    if (/\/vouches\b/.test(url)) {
      return jsonResponse({ count: 0, vouches: [] });
    }
    if (/\/posts\b/.test(url)) {
      return jsonResponse({ count: 0, posts: [] });
    }
    if (/\/task-comments\b/.test(url)) {
      return jsonResponse({ count: 0, taskComments: [] });
    }
    if (/\/coorg-invitation-responses\b/.test(url)) {
      return jsonResponse({ count: 0, coorgInvitationResponses: [] });
    }
    if (/\/coorg-invitation-revocations\b/.test(url)) {
      return jsonResponse({ count: 0, coorgInvitationRevocations: [] });
    }
    if (/\/coorg-invitations\b/.test(url)) {
      return jsonResponse({ count: 0, coorgInvitations: [] });
    }
    if (/\/event-cancellations\b/.test(url)) {
      return jsonResponse({ count: 0, eventCancellations: [] });
    }
    if (/\/events\b/.test(url)) {
      return jsonResponse({ count: 0, events: [] });
    }
    return inner(url);
  };
}

function makeSignedVouch(overrides: Partial<SignedVouch> = {}): SignedVouch {
  const voucher = generateKeyPair();
  const base = {
    id: overrides.id ?? `v_${Math.random().toString(36).slice(2)}`,
    voucherKey: voucher.publicKey,
    voucheeKey: overrides.voucheeKey ?? generateKeyPair().publicKey,
    createdAt: overrides.createdAt ?? Date.now(),
    kind: (overrides.kind ?? "manual") as SignedVouch["kind"],
  };
  return {
    ...base,
    signature: sign(canonicalVouchPayload(base), voucher.secretKey),
    ...overrides,
  };
}

function makeSignedPost(overrides: Partial<PostRecord> = {}): PostRecord {
  const poster = generateKeyPair();
  const immutable = {
    id: overrides.id ?? `p_${Math.random().toString(36).slice(2)}`,
    type: (overrides.type ?? "NEED") as PostRecord["type"],
    category: (overrides.category ?? "other") as PostRecord["category"],
    title: overrides.title ?? "Test post",
    description: overrides.description ?? "",
    estimatedHours: overrides.estimatedHours ?? 1,
    urgency: (overrides.urgency ?? "low") as PostRecord["urgency"],
    postedBy: overrides.postedBy ?? poster.publicKey,
    createdAt: overrides.createdAt ?? Date.now(),
    expiresAt: overrides.expiresAt ?? null,
    locationZone: overrides.locationZone ?? "test zone",
    nodeId: overrides.nodeId ?? "node_test",
  };
  return {
    ...immutable,
    signature:
      overrides.signature ??
      sign(canonicalPostPayload(immutable), poster.secretKey),
  };
}

describe("pullFromPeer", () => {
  it("inserts every well-signed exchange the peer returns", async () => {
    const store = createExchangeStore(db);
    const exchanges = [
      makeSignedExchange({ completedAt: 100 }),
      makeSignedExchange({ completedAt: 200 }),
    ];
    const fetcher: Fetcher = () => jsonResponse({ count: 2, exchanges });
    const result = await pullFromPeer({
      peerUrl: "https://peer.example",
      since: null,
      fetcher,
      store,
    });
    expect(result.insertedCount).toBe(2);
    expect(result.duplicateCount).toBe(0);
    expect(result.rejectedCount).toBe(0);
    expect(result.latestCompletedAt).toBe(200);
    expect(store.count()).toBe(2);
  });

  it("skips an exchange whose signatures do not verify", async () => {
    const store = createExchangeStore(db);
    const good = makeSignedExchange();
    const bad: Exchange = { ...good, id: "x_bad", helperSignature: "0" };
    const fetcher: Fetcher = () =>
      jsonResponse({ count: 2, exchanges: [good, bad] });
    const result = await pullFromPeer({
      peerUrl: "https://peer.example",
      since: null,
      fetcher,
      store,
    });
    expect(result.insertedCount).toBe(1);
    expect(result.rejectedCount).toBe(1);
    expect(store.count()).toBe(1);
  });

  it("treats already-stored rows as duplicates without re-inserting", async () => {
    const store = createExchangeStore(db);
    const exchange = makeSignedExchange();
    store.insert(exchange);
    const fetcher: Fetcher = () =>
      jsonResponse({ count: 1, exchanges: [exchange] });
    const result = await pullFromPeer({
      peerUrl: "https://peer.example",
      since: null,
      fetcher,
      store,
    });
    expect(result.insertedCount).toBe(0);
    expect(result.duplicateCount).toBe(1);
    expect(store.count()).toBe(1);
  });

  it("passes since= to the peer when supplied", async () => {
    const store = createExchangeStore(db);
    const seen: string[] = [];
    const fetcher: Fetcher = (url) => {
      seen.push(url);
      return jsonResponse({ count: 0, exchanges: [] });
    };
    await pullFromPeer({
      peerUrl: "https://peer.example",
      since: 12345,
      fetcher,
      store,
    });
    expect(seen[0]).toContain("since=12345");
    expect(seen[0]).toContain("limit=");
  });

  it("strips trailing slashes from the peer URL", async () => {
    const store = createExchangeStore(db);
    const seen: string[] = [];
    const fetcher: Fetcher = (url) => {
      seen.push(url);
      return jsonResponse({ count: 0, exchanges: [] });
    };
    await pullFromPeer({
      peerUrl: "https://peer.example//",
      since: null,
      fetcher,
      store,
    });
    expect(seen[0]).toMatch(/^https:\/\/peer\.example\/exchanges\?/);
  });

  it("throws when the peer returns a non-2xx status", async () => {
    const store = createExchangeStore(db);
    const fetcher: Fetcher = () => jsonResponse({ error: "nope" }, 503);
    await expect(
      pullFromPeer({
        peerUrl: "https://peer.example",
        since: null,
        fetcher,
        store,
      }),
    ).rejects.toThrow(/503/);
  });

  it("throws when the response body is the wrong shape", async () => {
    const store = createExchangeStore(db);
    const fetcher: Fetcher = () => jsonResponse({ wat: "this is not it" });
    await expect(
      pullFromPeer({
        peerUrl: "https://peer.example",
        since: null,
        fetcher,
        store,
      }),
    ).rejects.toThrow(/unexpected response/);
  });

  it("returns null latestCompletedAt when the peer had nothing new", async () => {
    const store = createExchangeStore(db);
    const fetcher: Fetcher = () => jsonResponse({ count: 0, exchanges: [] });
    const result = await pullFromPeer({
      peerUrl: "https://peer.example",
      since: 0,
      fetcher,
      store,
    });
    expect(result.latestCompletedAt).toBeNull();
    expect(result.insertedCount).toBe(0);
  });
});

describe("pullFromPeer — §4 strict verification of auto-confirmed rows", () => {
  /** A system-signed exchange: the helper signs the canonical payload
   *  with their member key; the NODE's system key signs the same
   *  bytes as the helped side. */
  function makeSystemSignedExchange(opts: {
    systemSecretKey: string;
    nodeId: string;
    completedAt?: number;
  }): Exchange {
    const helper = generateKeyPair();
    const helped = generateKeyPair();
    const base = {
      id: `x_${Math.random().toString(36).slice(2)}`,
      postId: "p_auto",
      helperKey: helper.publicKey,
      helpedKey: helped.publicKey,
      hoursExchanged: 1,
      category: "other" as const,
      completedAt: opts.completedAt ?? Date.now(),
      nodeId: opts.nodeId,
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
      helpedSignature: sign(payload, opts.systemSecretKey),
      autoConfirmed: true,
      autoConfirmedBy: `system:${opts.nodeId}`,
      autoConfirmedAt: base.completedAt,
    };
  }

  it("accepts a system-signed row when the resolver knows the origin node's key", async () => {
    const store = createExchangeStore(db);
    const systemKp = generateKeyPair();
    const row = makeSystemSignedExchange({
      systemSecretKey: systemKp.secretKey,
      nodeId: "node_peer",
    });
    const result = await pullFromPeer({
      peerUrl: "https://peer.example",
      since: null,
      fetcher: () => jsonResponse({ count: 1, exchanges: [row] }),
      store,
      resolveSystemPubkey: (nodeId) =>
        nodeId === "node_peer" ? systemKp.publicKey : null,
    });
    expect(result.insertedCount).toBe(1);
    expect(result.rejectedCount).toBe(0);
    expect(store.has(row.id)).toBe(true);
  });

  it("REJECTS an auto-confirmed row on helper signature alone (the old lenient hole)", async () => {
    // An attacker controlling one member key fabricates an
    // "auto-confirmed" exchange: valid helper signature, garbage
    // helped-side signature. The lenient verifyExchange accepted
    // this; the strict label must not.
    const store = createExchangeStore(db);
    const attacker = generateKeyPair();
    const forged = makeSystemSignedExchange({
      systemSecretKey: attacker.secretKey, // NOT the node's system key
      nodeId: "node_peer",
    });
    const realSystem = generateKeyPair();
    const result = await pullFromPeer({
      peerUrl: "https://peer.example",
      since: null,
      fetcher: () => jsonResponse({ count: 1, exchanges: [forged] }),
      store,
      resolveSystemPubkey: (nodeId) =>
        nodeId === "node_peer" ? realSystem.publicKey : null,
    });
    expect(result.insertedCount).toBe(0);
    expect(result.rejectedCount).toBe(1);
    expect(store.has(forged.id)).toBe(false);
  });

  it("REJECTS an auto-confirmed row whose origin node is outside the resolver's mesh", async () => {
    const store = createExchangeStore(db);
    const strangerSystem = generateKeyPair();
    const row = makeSystemSignedExchange({
      systemSecretKey: strangerSystem.secretKey,
      nodeId: "node_stranger",
    });
    const result = await pullFromPeer({
      peerUrl: "https://peer.example",
      since: null,
      fetcher: () => jsonResponse({ count: 1, exchanges: [row] }),
      store,
      // Resolver knows only node_peer; node_stranger resolves null.
      resolveSystemPubkey: () => null,
    });
    expect(result.insertedCount).toBe(0);
    expect(result.rejectedCount).toBe(1);
  });

  it("member-signed rows are unaffected by the resolver", async () => {
    const store = createExchangeStore(db);
    const row = makeSignedExchange();
    const result = await pullFromPeer({
      peerUrl: "https://peer.example",
      since: null,
      fetcher: () => jsonResponse({ count: 1, exchanges: [row] }),
      store,
      resolveSystemPubkey: () => null,
    });
    expect(result.insertedCount).toBe(1);
  });
});

describe("pullFromPeer — cursor pagination over a multi-page backlog", () => {
  /** Serve /exchanges from a REAL peer-side store so the test couples
   *  the store's list() ordering to the puller's cursor advancement —
   *  the exact interaction that used to lose rows (DESC ordering with
   *  a max-based cursor skipped everything below the newest page). */
  function storeBackedFetcher(peerDb: DatabaseType): Fetcher {
    const peerStore = createExchangeStore(peerDb);
    return (url) => {
      const u = new URL(url);
      const sinceParam = u.searchParams.get("since");
      const limitParam = u.searchParams.get("limit");
      const exchanges = peerStore.list({
        since: sinceParam ? Number(sinceParam) : undefined,
        limit: limitParam ? Number(limitParam) : undefined,
      });
      return jsonResponse({ count: exchanges.length, exchanges });
    };
  }

  it("converges on a backlog larger than one page, including ties at a page boundary", async () => {
    const peerDb = openDatabase(":memory:");
    try {
      const peerStore = createExchangeStore(peerDb);
      const base = 1_000_000;
      const all: Exchange[] = [];
      // 13 rows, page size 5. Rows 3..6 share one timestamp so the
      // first page boundary falls inside a tie run.
      for (let i = 0; i < 13; i++) {
        const tied = i >= 3 && i <= 6;
        const completedAt = base + (tied ? 3 : i) * 1000;
        const x = makeSignedExchange({ completedAt });
        peerStore.insert(x);
        all.push(x);
      }

      const localStore = createExchangeStore(db);
      const fetcher = storeBackedFetcher(peerDb);

      // Replicate the worker's cursor behavior: advance to the pull's
      // latestCompletedAt after each page, exactly as recordSuccess /
      // sinceFor do.
      let since: number | null = null;
      let pulls = 0;
      for (; pulls < 20; pulls++) {
        const result = await pullFromPeer({
          peerUrl: "https://peer.example",
          since,
          fetcher,
          store: localStore,
          maxRows: 5,
        });
        expect(result.rejectedCount).toBe(0);
        since = result.latestCompletedAt ?? since;
        if (result.insertedCount === 0) break;
      }

      expect(pulls).toBeLessThan(20);
      expect(localStore.count()).toBe(all.length);
      for (const x of all) {
        expect(localStore.has(x.id)).toBe(true);
      }
    } finally {
      peerDb.close();
    }
  });

  it("first bootstrap page is the OLDEST rows, so history replicates bottom-up", async () => {
    const peerDb = openDatabase(":memory:");
    try {
      const peerStore = createExchangeStore(peerDb);
      const oldest = makeSignedExchange({ completedAt: 1_000 });
      const newest = makeSignedExchange({ completedAt: 2_000 });
      peerStore.insert(newest);
      peerStore.insert(oldest);

      const localStore = createExchangeStore(db);
      const result = await pullFromPeer({
        peerUrl: "https://peer.example",
        since: null,
        fetcher: storeBackedFetcher(peerDb),
        store: localStore,
        maxRows: 1,
      });
      // With one-row pages the bootstrap page must be the oldest row;
      // a newest-first page would put the cursor past the other row
      // and orphan it forever.
      expect(result.insertedCount).toBe(1);
      expect(localStore.has(oldest.id)).toBe(true);
      expect(localStore.has(newest.id)).toBe(false);
    } finally {
      peerDb.close();
    }
  });
});

describe("pullTaskCommentsFromPeer — tombstone convergence", () => {
  function makeSignedTaskComment(overrides: {
    id: string;
    createdAt: number;
    deletedAt?: number | null;
  }): TaskComment {
    const author = generateKeyPair();
    const immutable = {
      id: overrides.id,
      projectId: "proj_x",
      taskId: "task_x",
      authorKey: author.publicKey,
      body: "hello",
      createdAt: overrides.createdAt,
      nodeId: "node_peer",
    };
    return {
      ...immutable,
      deletedAt: overrides.deletedAt ?? null,
      signature: sign(
        canonicalTaskCommentPayload(immutable),
        author.secretKey,
      ),
    };
  }

  it("applies a late tombstone and advances the cursor by deletedAt", async () => {
    const store = createTaskCommentStore(db);
    const live = makeSignedTaskComment({ id: "tc_late", createdAt: 1_000 });

    // Pull 1: the live comment arrives; cursor lands on createdAt.
    const first = await pullTaskCommentsFromPeer({
      peerUrl: "https://peer.example",
      since: null,
      fetcher: () => jsonResponse({ count: 1, taskComments: [live] }),
      store,
    });
    expect(first.insertedCount).toBe(1);
    expect(first.latestCompletedAt).toBe(1_000);

    // Pull 2, cursor past createdAt: the author has since deleted.
    // The tombstoned row must be applied (not counted duplicate) and
    // the cursor must advance by deletedAt, not stay at createdAt.
    const tombstoned = { ...live, deletedAt: 9_000 };
    const second = await pullTaskCommentsFromPeer({
      peerUrl: "https://peer.example",
      since: first.latestCompletedAt,
      fetcher: () => jsonResponse({ count: 1, taskComments: [tombstoned] }),
      store,
    });
    expect(second.insertedCount).toBe(1);
    expect(second.latestCompletedAt).toBe(9_000);
    expect(store.deletedAt("tc_late")).toBe(9_000);
  });
});

describe("startPeerPullWorker", () => {
  it("does nothing when no peers are configured", async () => {
    const store = createExchangeStore(db);
    const vouchStore = createVouchStore(db);
    const postStore = createPostStore(db);
    const pullStore = createPeerPullStore(db);
    const fetcher = vi.fn<Fetcher>();
    const worker = startPeerPullWorker({
      peerUrls: [],
      intervalMs: 1000,
      store,
      vouchStore,
      postStore,
      taskCommentStore: createTaskCommentStore(db),
      coorgInvitationStore: createCoOrganizerInvitationStore(db),
      coorgInvitationResponseStore:
        createCoOrganizerInvitationResponseStore(db),
      coorgInvitationRevocationStore:
        createCoOrganizerInvitationRevocationStore(db),
      eventStore: createEventStore(db),
      eventCancellationStore: createEventCancellationStore(db),
      pullStore,
      fetcher,
    });
    const results = await worker.pullAllOnce();
    worker.stop();
    expect(results).toEqual([]);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("records success state per peer after a successful pull", async () => {
    const store = createExchangeStore(db);
    const vouchStore = createVouchStore(db);
    const postStore = createPostStore(db);
    const pullStore = createPeerPullStore(db);
    const exchange = makeSignedExchange({ completedAt: 555 });
    const fetcher = exchangeOnly(() =>
      jsonResponse({ count: 1, exchanges: [exchange] }),
    );
    const worker = startPeerPullWorker({
      peerUrls: ["https://peer.example"],
      intervalMs: 60_000,
      store,
      vouchStore,
      postStore,
      taskCommentStore: createTaskCommentStore(db),
      coorgInvitationStore: createCoOrganizerInvitationStore(db),
      coorgInvitationResponseStore:
        createCoOrganizerInvitationResponseStore(db),
      coorgInvitationRevocationStore:
        createCoOrganizerInvitationRevocationStore(db),
      eventStore: createEventStore(db),
      eventCancellationStore: createEventCancellationStore(db),
      pullStore,
      fetcher,
    });
    const results = await worker.pullAllOnce();
    worker.stop();
    const exchangeResult = results.find((r) => r.kind === "exchange");
    expect(exchangeResult?.insertedCount).toBe(1);
    const state = pullStore.get("https://peer.example");
    expect(state).not.toBeNull();
    expect(state!.lastCompletedAt).toBe(555);
    expect(state!.lastError).toBeNull();
  });

  it("records failure state and keeps the loop alive when a peer errors", async () => {
    const store = createExchangeStore(db);
    const vouchStore = createVouchStore(db);
    const postStore = createPostStore(db);
    const pullStore = createPeerPullStore(db);
    const fetcher: Fetcher = () => jsonResponse({ error: "x" }, 500);
    const errors: Array<{ url: string; msg: string }> = [];
    const worker = startPeerPullWorker({
      peerUrls: ["https://peer.example"],
      intervalMs: 60_000,
      store,
      vouchStore,
      postStore,
      taskCommentStore: createTaskCommentStore(db),
      coorgInvitationStore: createCoOrganizerInvitationStore(db),
      coorgInvitationResponseStore:
        createCoOrganizerInvitationResponseStore(db),
      coorgInvitationRevocationStore:
        createCoOrganizerInvitationRevocationStore(db),
      eventStore: createEventStore(db),
      eventCancellationStore: createEventCancellationStore(db),
      pullStore,
      fetcher,
      onError: (url, err) => errors.push({ url, msg: err.message }),
    });
    await worker.pullAllOnce();
    worker.stop();
    // Both kinds attempted; both fail against this peer.
    expect(errors.length).toBeGreaterThanOrEqual(1);
    const state = pullStore.get("https://peer.example");
    expect(state!.lastError).toMatch(/500/);
    expect(state!.lastSuccessAt).toBeNull();
  });

  it("uses each peer's stored since for the next call", async () => {
    const store = createExchangeStore(db);
    const vouchStore = createVouchStore(db);
    const postStore = createPostStore(db);
    const pullStore = createPeerPullStore(db);
    const exchange = makeSignedExchange({ completedAt: 999 });
    let exchangeCallCount = 0;
    const exchangeUrls: string[] = [];
    const fetcher = exchangeOnly((url) => {
      exchangeUrls.push(url);
      if (exchangeCallCount++ === 0) {
        return jsonResponse({ count: 1, exchanges: [exchange] });
      }
      return jsonResponse({ count: 0, exchanges: [] });
    });
    const worker = startPeerPullWorker({
      peerUrls: ["https://peer.example"],
      intervalMs: 60_000,
      store,
      vouchStore,
      postStore,
      taskCommentStore: createTaskCommentStore(db),
      coorgInvitationStore: createCoOrganizerInvitationStore(db),
      coorgInvitationResponseStore:
        createCoOrganizerInvitationResponseStore(db),
      coorgInvitationRevocationStore:
        createCoOrganizerInvitationRevocationStore(db),
      eventStore: createEventStore(db),
      eventCancellationStore: createEventCancellationStore(db),
      pullStore,
      fetcher,
    });
    await worker.pullAllOnce();
    await worker.pullAllOnce();
    worker.stop();
    expect(exchangeUrls[0]).not.toContain("since=");
    expect(exchangeUrls[1]).toContain("since=999");
  });

  // Negative lock — docs/invite-redemption.md §8: redemption receipts
  // do NOT peer-replicate (the roster stays off the inter-node wire),
  // and the removed live-credential /invites surface must not creep
  // back into the pull cycle. A future contributor adding either leg
  // has to consciously delete this test and reopen the threat-model
  // §7 entry.
  it("never requests /redemptions or /invites from a peer", async () => {
    const requested: string[] = [];
    const fetcher: Fetcher = (url) => {
      requested.push(url);
      return jsonResponse({
        count: 0,
        exchanges: [],
        vouches: [],
        posts: [],
        taskComments: [],
        coorgInvitations: [],
        coorgInvitationResponses: [],
        coorgInvitationRevocations: [],
        events: [],
        eventCancellations: [],
      });
    };
    const worker = startPeerPullWorker({
      peerUrls: ["https://peer.example"],
      intervalMs: 60_000,
      store: createExchangeStore(db),
      vouchStore: createVouchStore(db),
      postStore: createPostStore(db),
      taskCommentStore: createTaskCommentStore(db),
      coorgInvitationStore: createCoOrganizerInvitationStore(db),
      coorgInvitationResponseStore:
        createCoOrganizerInvitationResponseStore(db),
      coorgInvitationRevocationStore:
        createCoOrganizerInvitationRevocationStore(db),
      eventStore: createEventStore(db),
      eventCancellationStore: createEventCancellationStore(db),
      pullStore: createPeerPullStore(db),
      fetcher,
    });
    await worker.pullAllOnce();
    worker.stop();
    expect(requested.length).toBeGreaterThan(0);
    expect(requested.some((u) => /\/redemptions\b/.test(u))).toBe(false);
    expect(requested.some((u) => /\/invites\b/.test(u))).toBe(false);
  });
});

describe("startPeerPullWorker — peer system-key lifecycle (§4)", () => {
  function makeWorker(fetcher: Fetcher, peerUrls: string[]) {
    const store = createExchangeStore(db);
    const pullStore = createPeerPullStore(db);
    const worker = startPeerPullWorker({
      peerUrls,
      intervalMs: 60_000,
      store,
      vouchStore: createVouchStore(db),
      postStore: createPostStore(db),
      taskCommentStore: createTaskCommentStore(db),
      coorgInvitationStore: createCoOrganizerInvitationStore(db),
      coorgInvitationResponseStore:
        createCoOrganizerInvitationResponseStore(db),
      coorgInvitationRevocationStore:
        createCoOrganizerInvitationRevocationStore(db),
      eventStore: createEventStore(db),
      eventCancellationStore: createEventCancellationStore(db),
      pullStore,
      fetcher,
      onError: () => {},
    });
    return { worker, store, pullStore };
  }

  /** A fetcher whose /config publishes the given system key and whose
   *  /exchanges serves the given rows; everything else is empty. */
  function peerWithKey(opts: {
    nodeId: string;
    systemPubkey: string;
    exchanges: Exchange[];
    configFails?: () => boolean;
    history?: { pubkey: string; retiredAt: number }[];
  }): Fetcher {
    // /config must be handled OUTSIDE exchangeOnly — that wrapper
    // answers /config itself (with "no system key") before any inner
    // fetcher runs.
    const rest = exchangeOnly(() =>
      jsonResponse({
        count: opts.exchanges.length,
        exchanges: opts.exchanges,
      }),
    );
    return (url) => {
      if (/\/config\b/.test(url)) {
        if (opts.configFails?.()) return jsonResponse({ error: "down" }, 503);
        return jsonResponse({
          nodeId: opts.nodeId,
          systemKey: {
            current: opts.systemPubkey,
            history: opts.history ?? [],
          },
        });
      }
      return rest(url);
    };
  }

  function systemSigned(systemKp: { publicKey: string; secretKey: string }, nodeId: string): Exchange {
    const helper = generateKeyPair();
    const helped = generateKeyPair();
    const base = {
      id: `x_${Math.random().toString(36).slice(2)}`,
      postId: "p_auto",
      helperKey: helper.publicKey,
      helpedKey: helped.publicKey,
      hoursExchanged: 1,
      category: "other" as const,
      completedAt: Date.now(),
      nodeId,
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
      autoConfirmedBy: `system:${nodeId}`,
      autoConfirmedAt: base.completedAt,
    };
  }

  it("verifies auto-confirmed rows against the key published in the peer's /config", async () => {
    const systemKp = generateKeyPair();
    const row = systemSigned(systemKp, "node_b");
    const fetcher = peerWithKey({
      nodeId: "node_b",
      systemPubkey: systemKp.publicKey,
      exchanges: [row],
    });
    const { worker, store } = makeWorker(fetcher, ["https://b.example"]);
    const results = await worker.pullAllOnce();
    worker.stop();
    const exchangeResult = results.find((r) => r.kind === "exchange");
    expect(exchangeResult?.insertedCount).toBe(1);
    expect(store.has(row.id)).toBe(true);
  });

  it("resolves keys ACROSS the mesh: a row relayed via peer B but signed by peer C's system key verifies", async () => {
    const systemC = generateKeyPair();
    const relayedRow = systemSigned(systemC, "node_c");
    // Peer B serves C's row; B itself publishes a different key.
    const systemB = generateKeyPair();
    const fetchB = peerWithKey({
      nodeId: "node_b",
      systemPubkey: systemB.publicKey,
      exchanges: [relayedRow],
    });
    const fetchC = peerWithKey({
      nodeId: "node_c",
      systemPubkey: systemC.publicKey,
      exchanges: [],
    });
    const routed: Fetcher = (url) =>
      url.startsWith("https://c.example") ? fetchC(url) : fetchB(url);
    const { worker, store } = makeWorker(routed, [
      "https://b.example",
      "https://c.example",
    ]);
    const results = await worker.pullAllOnce();
    worker.stop();
    const inserted = results
      .filter((r) => r.kind === "exchange")
      .reduce((n, r) => n + r.insertedCount, 0);
    expect(inserted).toBe(1);
    expect(store.has(relayedRow.id)).toBe(true);
  });

  it("FAILS CLOSED when two peers claim the same nodeId with different keys (no shadowing forgery)", async () => {
    // The real node_c and its honest key.
    const systemC = generateKeyPair();
    const honest = systemSigned(systemC, "node_c");
    // A compromised peer B impersonates node_c with ITS OWN key and
    // serves a forged "auto-confirmed by node_c" row. On first-match
    // resolution B could shadow C depending on map order.
    const systemB = generateKeyPair();
    const forged = systemSigned(systemB, "node_c");

    const fetchC = peerWithKey({
      nodeId: "node_c",
      systemPubkey: systemC.publicKey,
      exchanges: [honest],
    });
    const fetchB = peerWithKey({
      nodeId: "node_c", // <-- B lies about being node_c
      systemPubkey: systemB.publicKey,
      exchanges: [forged],
    });
    const routed: Fetcher = (url) =>
      url.startsWith("https://c.example") ? fetchC(url) : fetchB(url);
    const { worker, store } = makeWorker(routed, [
      "https://b.example",
      "https://c.example",
    ]);
    const results = await worker.pullAllOnce();
    worker.stop();
    // Ambiguous nodeId → resolver returns null → BOTH rows rejected.
    // The forgery is never accepted; the honest row is collateral
    // (a detectable denial the operator resolves by removing the
    // impostor peer), never a silent shadow.
    const inserted = results
      .filter((r) => r.kind === "exchange")
      .reduce((n, r) => n + r.insertedCount, 0);
    expect(inserted).toBe(0);
    expect(store.has(forged.id)).toBe(false);
    expect(store.has(honest.id)).toBe(false);
  });

  it("FAILS CLOSED when an impostor echoes the real node's CURRENT key but forges the history (no history smuggling)", async () => {
    // `current` is public — an impostor can copy it verbatim, so
    // current-equality alone cannot distinguish the real node from
    // the impostor. The smuggled key rides in a forged history entry
    // whose retiredAt post-dates every record's signedAt, making the
    // rotation scan select it. The trails disagree → refuse both.
    const systemC = generateKeyPair();
    const honest = systemSigned(systemC, "node_c");
    const systemB = generateKeyPair();
    const forged = systemSigned(systemB, "node_c");

    const fetchC = peerWithKey({
      nodeId: "node_c",
      systemPubkey: systemC.publicKey,
      exchanges: [honest],
    });
    const fetchB = peerWithKey({
      nodeId: "node_c",
      systemPubkey: systemC.publicKey, // <-- echoed, matches C exactly
      history: [
        // In-grace future retiredAt (parse bound allows a day of
        // skew), so ONLY the trail-equality check can catch this.
        { pubkey: systemB.publicKey, retiredAt: Date.now() + 12 * 60 * 60 * 1000 },
      ],
      exchanges: [forged],
    });
    const routed: Fetcher = (url) =>
      url.startsWith("https://c.example") ? fetchC(url) : fetchB(url);
    const { worker, store } = makeWorker(routed, [
      "https://b.example",
      "https://c.example",
    ]);
    const results = await worker.pullAllOnce();
    worker.stop();
    const inserted = results
      .filter((r) => r.kind === "exchange")
      .reduce((n, r) => n + r.insertedCount, 0);
    expect(inserted).toBe(0);
    expect(store.has(forged.id)).toBe(false);
    expect(store.has(honest.id)).toBe(false);
  });

  it("drops a far-future forged history entry at parse, neutralizing the impostor WITHOUT collateral damage", async () => {
    // With retiredAt beyond the one-day skew grace the forged entry
    // never survives ingestion: the impostor's config collapses to
    // exactly the honest one (echoed current, empty history), no
    // ambiguity arises, and only the forged row — which fails
    // verification against the honest key — is rejected.
    const systemC = generateKeyPair();
    const honest = systemSigned(systemC, "node_c");
    const systemB = generateKeyPair();
    const forged = systemSigned(systemB, "node_c");

    const fetchC = peerWithKey({
      nodeId: "node_c",
      systemPubkey: systemC.publicKey,
      exchanges: [honest],
    });
    const fetchB = peerWithKey({
      nodeId: "node_c",
      systemPubkey: systemC.publicKey,
      history: [{ pubkey: systemB.publicKey, retiredAt: 9_999_999_999_999 }],
      exchanges: [forged],
    });
    const routed: Fetcher = (url) =>
      url.startsWith("https://c.example") ? fetchC(url) : fetchB(url);
    const { worker, store } = makeWorker(routed, [
      "https://b.example",
      "https://c.example",
    ]);
    const results = await worker.pullAllOnce();
    worker.stop();
    expect(store.has(forged.id)).toBe(false);
    expect(store.has(honest.id)).toBe(true);
    const inserted = results
      .filter((r) => r.kind === "exchange")
      .reduce((n, r) => n + r.insertedCount, 0);
    expect(inserted).toBe(1);
  });

  it("SKIPS the exchange pull (no cursor movement) while /config has never been reachable, then converges once it recovers", async () => {
    const systemKp = generateKeyPair();
    const row = systemSigned(systemKp, "node_b");
    let configDown = true;
    const fetcher = peerWithKey({
      nodeId: "node_b",
      systemPubkey: systemKp.publicKey,
      exchanges: [row],
      configFails: () => configDown,
    });
    const { worker, store, pullStore } = makeWorker(fetcher, [
      "https://b.example",
    ]);

    // Cycle 1: config down since boot → the exchange pull must FAIL
    // (not run with an empty resolver, which would reject the row
    // while the cursor advances past it — a permanent skip).
    let results = await worker.pullAllOnce();
    expect(results.find((r) => r.kind === "exchange")).toBeUndefined();
    expect(store.has(row.id)).toBe(false);
    const state = pullStore.get("https://b.example");
    expect(state?.lastCompletedAt ?? null).toBeNull();
    expect(state?.lastError).toMatch(/503/);

    // Cycle 2: config recovers → the row verifies and inserts.
    configDown = false;
    results = await worker.pullAllOnce();
    worker.stop();
    expect(results.find((r) => r.kind === "exchange")?.insertedCount).toBe(1);
    expect(store.has(row.id)).toBe(true);
  });

  it("rotation: history-published keys verify old records; a retired key cannot sign new ones", async () => {
    const T_ROTATE = 1_700_000_000_000;
    const oldKp = generateKeyPair();
    const newKp = generateKeyPair();

    const signedWith = (
      kp: { secretKey: string },
      signedAt: number,
    ): Exchange => {
      const helper = generateKeyPair();
      const helped = generateKeyPair();
      const base = {
        id: `x_${signedAt}_${Math.random().toString(36).slice(2)}`,
        postId: "p_rotate",
        helperKey: helper.publicKey,
        helpedKey: helped.publicKey,
        hoursExchanged: 1,
        category: "other" as const,
        completedAt: signedAt,
        nodeId: "node_b",
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
        helpedSignature: sign(payload, kp.secretKey),
        autoConfirmed: true,
        autoConfirmedBy: "system:node_b",
        autoConfirmedAt: signedAt,
      };
    };

    const preRotation = signedWith(oldKp, T_ROTATE - 60_000);
    const staleKeyAfterRotation = signedWith(oldKp, T_ROTATE + 60_000);
    const postRotation = signedWith(newKp, T_ROTATE + 60_000);

    const rest = exchangeOnly(() =>
      jsonResponse({
        count: 3,
        exchanges: [preRotation, staleKeyAfterRotation, postRotation],
      }),
    );
    const fetcher: Fetcher = (url) => {
      if (/\/config\b/.test(url)) {
        return jsonResponse({
          nodeId: "node_b",
          systemKey: {
            current: newKp.publicKey,
            history: [{ pubkey: oldKp.publicKey, retiredAt: T_ROTATE }],
          },
        });
      }
      return rest(url);
    };
    const { worker, store } = makeWorker(fetcher, ["https://b.example"]);
    const results = await worker.pullAllOnce();
    worker.stop();

    const exchangeResult = results.find((r) => r.kind === "exchange");
    // The pre-rotation record verifies against the RETIRED key (past
    // records stay valid forever, §4 rotation contract); the post-
    // rotation record verifies against the live key; a record that
    // claims the retired key for a post-retirement timestamp is
    // rejected — retiring a compromised key must actually disarm it.
    expect(exchangeResult?.insertedCount).toBe(2);
    expect(exchangeResult?.rejectedCount).toBe(1);
    expect(store.has(preRotation.id)).toBe(true);
    expect(store.has(postRotation.id)).toBe(true);
    expect(store.has(staleKeyAfterRotation.id)).toBe(false);
  });

  it("falls back to the last-known-good key on a transient config failure", async () => {
    const systemKp = generateKeyPair();
    const row = systemSigned(systemKp, "node_b");
    let configDown = false;
    let served = false;
    const fetcher = peerWithKey({
      nodeId: "node_b",
      systemPubkey: systemKp.publicKey,
      exchanges: [],
      configFails: () => configDown,
    });
    const routed: Fetcher = (url) => {
      if (/\/exchanges\b/.test(url)) {
        const rows = served ? [] : [row];
        served = true;
        return jsonResponse({ count: rows.length, exchanges: rows });
      }
      return fetcher(url);
    };
    const { worker, store } = makeWorker(routed, ["https://b.example"]);

    // Cycle 1 caches the key but serves no relevant row yet (the row
    // arrives in cycle 2, after config has gone down).
    served = true;
    await worker.pullAllOnce();
    configDown = true;
    served = false;
    const results = await worker.pullAllOnce();
    worker.stop();
    expect(results.find((r) => r.kind === "exchange")?.insertedCount).toBe(1);
    expect(store.has(row.id)).toBe(true);
  });
});

describe("pullVouchesFromPeer", () => {
  it("inserts every well-signed vouch the peer returns", async () => {
    const store = createVouchStore(db);
    const vouches = [
      makeSignedVouch({ createdAt: 100 }),
      makeSignedVouch({ createdAt: 200 }),
    ];
    const fetcher: Fetcher = () => jsonResponse({ count: 2, vouches });
    const result = await pullVouchesFromPeer({
      peerUrl: "https://peer.example",
      since: null,
      fetcher,
      store,
    });
    expect(result.kind).toBe("vouch");
    expect(result.insertedCount).toBe(2);
    expect(result.latestCompletedAt).toBe(200);
    expect(store.count()).toBe(2);
  });

  it("skips a vouch whose signature does not verify", async () => {
    const store = createVouchStore(db);
    const good = makeSignedVouch();
    const bad: SignedVouch = { ...good, id: "v_bad", signature: "0" };
    const fetcher: Fetcher = () =>
      jsonResponse({ count: 2, vouches: [good, bad] });
    const result = await pullVouchesFromPeer({
      peerUrl: "https://peer.example",
      since: null,
      fetcher,
      store,
    });
    expect(result.insertedCount).toBe(1);
    expect(result.rejectedCount).toBe(1);
    expect(store.count()).toBe(1);
  });

  it("hits the /vouches path with since=", async () => {
    const store = createVouchStore(db);
    const seen: string[] = [];
    const fetcher: Fetcher = (url) => {
      seen.push(url);
      return jsonResponse({ count: 0, vouches: [] });
    };
    await pullVouchesFromPeer({
      peerUrl: "https://peer.example",
      since: 7777,
      fetcher,
      store,
    });
    expect(seen[0]).toMatch(/\/vouches\?/);
    expect(seen[0]).toContain("since=7777");
  });
});

describe("startPeerPullWorker — vouches", () => {
  it("pulls both kinds per peer and updates the per-kind cursors", async () => {
    const store = createExchangeStore(db);
    const vouchStore = createVouchStore(db);
    const postStore = createPostStore(db);
    const pullStore = createPeerPullStore(db);
    const exchange = makeSignedExchange({ completedAt: 111 });
    const vouch = makeSignedVouch({ createdAt: 222 });
    const fetcher: Fetcher = (url) => {
      if (/\/vouches\b/.test(url))
        return jsonResponse({ count: 1, vouches: [vouch] });
      if (/\/posts\b/.test(url))
        return jsonResponse({ count: 0, posts: [] });
      if (/\/task-comments\b/.test(url))
        return jsonResponse({ count: 0, taskComments: [] });
      if (/\/coorg-invitation-responses\b/.test(url))
        return jsonResponse({ count: 0, coorgInvitationResponses: [] });
      if (/\/coorg-invitation-revocations\b/.test(url))
        return jsonResponse({ count: 0, coorgInvitationRevocations: [] });
      if (/\/coorg-invitations\b/.test(url))
        return jsonResponse({ count: 0, coorgInvitations: [] });
      if (/\/event-cancellations\b/.test(url))
        return jsonResponse({ count: 0, eventCancellations: [] });
      if (/\/events\b/.test(url))
        return jsonResponse({ count: 0, events: [] });
      return jsonResponse({ count: 1, exchanges: [exchange] });
    };
    const worker = startPeerPullWorker({
      peerUrls: ["https://peer.example"],
      intervalMs: 60_000,
      store,
      vouchStore,
      postStore,
      taskCommentStore: createTaskCommentStore(db),
      coorgInvitationStore: createCoOrganizerInvitationStore(db),
      coorgInvitationResponseStore:
        createCoOrganizerInvitationResponseStore(db),
      coorgInvitationRevocationStore:
        createCoOrganizerInvitationRevocationStore(db),
      eventStore: createEventStore(db),
      eventCancellationStore: createEventCancellationStore(db),
      pullStore,
      fetcher,
    });
    const results = await worker.pullAllOnce();
    worker.stop();
    // Every federated kind attempted; posts returned empty so it's
    // still a successful pull with no insertions.
    expect(results).toHaveLength(9);
    expect(results.map((r) => r.kind).sort()).toEqual([
      "coorg_invitation",
      "coorg_invitation_response",
      "coorg_invitation_revocation",
      "event",
      "event_cancellation",
      "exchange",
      "post",
      "task_comment",
      "vouch",
    ]);
    const state = pullStore.get("https://peer.example");
    expect(state!.lastCompletedAt).toBe(111);
    expect(state!.lastVouchCreatedAt).toBe(222);
    expect(state!.lastError).toBeNull();
  });

  it("a vouch pull failure does not poison the exchange cursor", async () => {
    const store = createExchangeStore(db);
    const vouchStore = createVouchStore(db);
    const postStore = createPostStore(db);
    const pullStore = createPeerPullStore(db);
    const exchange = makeSignedExchange({ completedAt: 555 });
    const fetcher: Fetcher = (url) => {
      if (/\/vouches\b/.test(url))
        return jsonResponse({ error: "x" }, 500);
      if (/\/posts\b/.test(url))
        return jsonResponse({ count: 0, posts: [] });
      if (/\/task-comments\b/.test(url))
        return jsonResponse({ count: 0, taskComments: [] });
      if (/\/coorg-invitation-responses\b/.test(url))
        return jsonResponse({ count: 0, coorgInvitationResponses: [] });
      if (/\/coorg-invitation-revocations\b/.test(url))
        return jsonResponse({ count: 0, coorgInvitationRevocations: [] });
      if (/\/coorg-invitations\b/.test(url))
        return jsonResponse({ count: 0, coorgInvitations: [] });
      if (/\/event-cancellations\b/.test(url))
        return jsonResponse({ count: 0, eventCancellations: [] });
      if (/\/events\b/.test(url))
        return jsonResponse({ count: 0, events: [] });
      return jsonResponse({ count: 1, exchanges: [exchange] });
    };
    const worker = startPeerPullWorker({
      peerUrls: ["https://peer.example"],
      intervalMs: 60_000,
      store,
      vouchStore,
      postStore,
      taskCommentStore: createTaskCommentStore(db),
      coorgInvitationStore: createCoOrganizerInvitationStore(db),
      coorgInvitationResponseStore:
        createCoOrganizerInvitationResponseStore(db),
      coorgInvitationRevocationStore:
        createCoOrganizerInvitationRevocationStore(db),
      eventStore: createEventStore(db),
      eventCancellationStore: createEventCancellationStore(db),
      pullStore,
      fetcher,
    });
    const results = await worker.pullAllOnce();
    worker.stop();
    // Exchange + post pulls succeeded; vouch pull failed; all
    // reported in results.
    const exchangeResult = results.find((r) => r.kind === "exchange");
    expect(exchangeResult?.insertedCount).toBe(1);
    const state = pullStore.get("https://peer.example");
    expect(state!.lastCompletedAt).toBe(555);
    expect(state!.lastError).toMatch(/vouch.*500/);
  });
});

describe("pullPostsFromPeer", () => {
  it("inserts every well-signed post the peer returns", async () => {
    const store = createPostStore(db);
    const posts = [
      makeSignedPost({ createdAt: 1000 }),
      makeSignedPost({ createdAt: 2000 }),
    ];
    const fetcher: Fetcher = () => jsonResponse({ count: 2, posts });
    const result = await pullPostsFromPeer({
      peerUrl: "https://peer.example",
      since: null,
      fetcher,
      store,
    });
    expect(result.kind).toBe("post");
    expect(result.insertedCount).toBe(2);
    expect(result.latestCompletedAt).toBe(2000);
    expect(store.count()).toBe(2);
  });

  it("skips a post whose signature does not verify", async () => {
    const store = createPostStore(db);
    const good = makeSignedPost();
    const bad: PostRecord = { ...good, id: "p_bad", signature: "0" };
    const fetcher: Fetcher = () =>
      jsonResponse({ count: 2, posts: [good, bad] });
    const result = await pullPostsFromPeer({
      peerUrl: "https://peer.example",
      since: null,
      fetcher,
      store,
    });
    expect(result.insertedCount).toBe(1);
    expect(result.rejectedCount).toBe(1);
    expect(store.count()).toBe(1);
  });

  it("hits the /posts path with since=", async () => {
    const store = createPostStore(db);
    const seen: string[] = [];
    const fetcher: Fetcher = (url) => {
      seen.push(url);
      return jsonResponse({ count: 0, posts: [] });
    };
    await pullPostsFromPeer({
      peerUrl: "https://peer.example",
      since: 4242,
      fetcher,
      store,
    });
    expect(seen[0]).toMatch(/\/posts\?/);
    expect(seen[0]).toContain("since=4242");
  });

  it("treats already-stored rows as duplicates", async () => {
    const store = createPostStore(db);
    const post = makeSignedPost();
    store.insert(post);
    const fetcher: Fetcher = () =>
      jsonResponse({ count: 1, posts: [post] });
    const result = await pullPostsFromPeer({
      peerUrl: "https://peer.example",
      since: null,
      fetcher,
      store,
    });
    expect(result.insertedCount).toBe(0);
    expect(result.duplicateCount).toBe(1);
    expect(store.count()).toBe(1);
  });
});

describe("startPeerPullWorker — posts", () => {
  it("pulls all three kinds per peer and updates the per-kind cursors", async () => {
    const store = createExchangeStore(db);
    const vouchStore = createVouchStore(db);
    const postStore = createPostStore(db);
    const pullStore = createPeerPullStore(db);
    const exchange = makeSignedExchange({ completedAt: 100 });
    const vouch = makeSignedVouch({ createdAt: 200 });
    const post = makeSignedPost({ createdAt: 300 });
    const fetcher: Fetcher = (url) => {
      if (/\/vouches\b/.test(url))
        return jsonResponse({ count: 1, vouches: [vouch] });
      if (/\/posts\b/.test(url))
        return jsonResponse({ count: 1, posts: [post] });
      if (/\/task-comments\b/.test(url))
        return jsonResponse({ count: 0, taskComments: [] });
      if (/\/coorg-invitation-responses\b/.test(url))
        return jsonResponse({ count: 0, coorgInvitationResponses: [] });
      if (/\/coorg-invitation-revocations\b/.test(url))
        return jsonResponse({ count: 0, coorgInvitationRevocations: [] });
      if (/\/coorg-invitations\b/.test(url))
        return jsonResponse({ count: 0, coorgInvitations: [] });
      if (/\/event-cancellations\b/.test(url))
        return jsonResponse({ count: 0, eventCancellations: [] });
      if (/\/events\b/.test(url))
        return jsonResponse({ count: 0, events: [] });
      return jsonResponse({ count: 1, exchanges: [exchange] });
    };
    const worker = startPeerPullWorker({
      peerUrls: ["https://peer.example"],
      intervalMs: 60_000,
      store,
      vouchStore,
      postStore,
      taskCommentStore: createTaskCommentStore(db),
      coorgInvitationStore: createCoOrganizerInvitationStore(db),
      coorgInvitationResponseStore:
        createCoOrganizerInvitationResponseStore(db),
      coorgInvitationRevocationStore:
        createCoOrganizerInvitationRevocationStore(db),
      eventStore: createEventStore(db),
      eventCancellationStore: createEventCancellationStore(db),
      pullStore,
      fetcher,
    });
    const results = await worker.pullAllOnce();
    worker.stop();
    expect(results).toHaveLength(9);
    expect(results.map((r) => r.kind).sort()).toEqual([
      "coorg_invitation",
      "coorg_invitation_response",
      "coorg_invitation_revocation",
      "event",
      "event_cancellation",
      "exchange",
      "post",
      "task_comment",
      "vouch",
    ]);
    const state = pullStore.get("https://peer.example");
    expect(state!.lastCompletedAt).toBe(100);
    expect(state!.lastVouchCreatedAt).toBe(200);
    expect(state!.lastPostCreatedAt).toBe(300);
    expect(state!.lastError).toBeNull();
  });
});

function makeSignedCoOrgInvitation(
  overrides: Partial<CoOrganizerInvitation> = {},
): CoOrganizerInvitation {
  const inviter = generateKeyPair();
  const invitee = generateKeyPair();
  const createdAt = overrides.createdAt ?? Date.now();
  const payload = {
    projectId: overrides.projectId ?? "proj_test",
    inviterKey: overrides.inviterKey ?? inviter.publicKey,
    inviteeKey: overrides.inviteeKey ?? invitee.publicKey,
    createdAt,
    expiresAt: overrides.expiresAt ?? createdAt + 14 * 24 * 60 * 60 * 1000,
    nodeId: overrides.nodeId ?? "node_test",
  };
  return {
    id:
      overrides.id ??
      `ci_${createdAt}_${Math.random().toString(36).slice(2)}`,
    ...payload,
    signature:
      overrides.signature ??
      sign(canonicalCoOrganizerInvitationPayload(payload), inviter.secretKey),
  };
}

function makeSignedCoOrgResponse(
  overrides: Partial<CoOrganizerInvitationResponse> = {},
): CoOrganizerInvitationResponse {
  const invitee = generateKeyPair();
  const decidedAt = overrides.decidedAt ?? Date.now();
  const payload = {
    invitationId: overrides.invitationId ?? "inv_test",
    inviteeKey: overrides.inviteeKey ?? invitee.publicKey,
    decision: overrides.decision ?? ("accept" as const),
    decidedAt,
    nodeId: overrides.nodeId ?? "node_test",
  };
  return {
    id:
      overrides.id ??
      `cr_${decidedAt}_${Math.random().toString(36).slice(2)}`,
    ...payload,
    signature:
      overrides.signature ??
      sign(
        canonicalCoOrganizerInvitationResponsePayload(payload),
        invitee.secretKey,
      ),
  };
}

function makeSignedCoOrgRevocation(
  overrides: Partial<CoOrganizerInvitationRevocation> = {},
): CoOrganizerInvitationRevocation {
  const inviter = generateKeyPair();
  const revokedAt = overrides.revokedAt ?? Date.now();
  const payload = {
    invitationId: overrides.invitationId ?? "inv_test",
    inviterKey: overrides.inviterKey ?? inviter.publicKey,
    revokedAt,
    nodeId: overrides.nodeId ?? "node_test",
  };
  return {
    id:
      overrides.id ??
      `cv_${revokedAt}_${Math.random().toString(36).slice(2)}`,
    ...payload,
    signature:
      overrides.signature ??
      sign(
        canonicalCoOrganizerInvitationRevocationPayload(payload),
        inviter.secretKey,
      ),
  };
}

describe("pullCoOrganizerInvitationsFromPeer", () => {
  it("inserts every well-signed invitation the peer returns", async () => {
    const store = createCoOrganizerInvitationStore(db);
    const rows = [
      makeSignedCoOrgInvitation({ createdAt: 100 }),
      makeSignedCoOrgInvitation({ createdAt: 200 }),
    ];
    const fetcher: Fetcher = () =>
      jsonResponse({ count: 2, coorgInvitations: rows });
    const result = await pullCoOrganizerInvitationsFromPeer({
      peerUrl: "https://peer.example",
      since: null,
      fetcher,
      store,
    });
    expect(result.kind).toBe("coorg_invitation");
    expect(result.insertedCount).toBe(2);
    expect(result.latestCompletedAt).toBe(200);
    expect(store.count()).toBe(2);
  });

  it("skips a row whose signature does not verify", async () => {
    const store = createCoOrganizerInvitationStore(db);
    const good = makeSignedCoOrgInvitation();
    const bad: CoOrganizerInvitation = {
      ...good,
      id: "ci_bad",
      signature: "0",
    };
    const fetcher: Fetcher = () =>
      jsonResponse({ count: 2, coorgInvitations: [good, bad] });
    const result = await pullCoOrganizerInvitationsFromPeer({
      peerUrl: "https://peer.example",
      since: null,
      fetcher,
      store,
    });
    expect(result.insertedCount).toBe(1);
    expect(result.rejectedCount).toBe(1);
    expect(store.count()).toBe(1);
  });

  it("hits the /coorg-invitations path with since=", async () => {
    const store = createCoOrganizerInvitationStore(db);
    const seen: string[] = [];
    const fetcher: Fetcher = (url) => {
      seen.push(url);
      return jsonResponse({ count: 0, coorgInvitations: [] });
    };
    await pullCoOrganizerInvitationsFromPeer({
      peerUrl: "https://peer.example",
      since: 9999,
      fetcher,
      store,
    });
    expect(seen[0]).toMatch(/\/coorg-invitations\?/);
    expect(seen[0]).toContain("since=9999");
  });

  it("dedupes against already-stored rows", async () => {
    const store = createCoOrganizerInvitationStore(db);
    const rec = makeSignedCoOrgInvitation();
    store.insert(rec);
    const fetcher: Fetcher = () =>
      jsonResponse({ count: 1, coorgInvitations: [rec] });
    const result = await pullCoOrganizerInvitationsFromPeer({
      peerUrl: "https://peer.example",
      since: null,
      fetcher,
      store,
    });
    expect(result.insertedCount).toBe(0);
    expect(result.duplicateCount).toBe(1);
  });
});

describe("pullCoOrganizerInvitationResponsesFromPeer", () => {
  it("inserts well-signed responses and advances cursor by decidedAt", async () => {
    const store = createCoOrganizerInvitationResponseStore(db);
    const rows = [
      makeSignedCoOrgResponse({ decidedAt: 100 }),
      makeSignedCoOrgResponse({ decidedAt: 300 }),
    ];
    const fetcher: Fetcher = () =>
      jsonResponse({ count: 2, coorgInvitationResponses: rows });
    const result = await pullCoOrganizerInvitationResponsesFromPeer({
      peerUrl: "https://peer.example",
      since: null,
      fetcher,
      store,
    });
    expect(result.kind).toBe("coorg_invitation_response");
    expect(result.insertedCount).toBe(2);
    expect(result.latestCompletedAt).toBe(300);
  });

  it("skips a response whose signature does not verify", async () => {
    const store = createCoOrganizerInvitationResponseStore(db);
    const good = makeSignedCoOrgResponse();
    const bad: CoOrganizerInvitationResponse = {
      ...good,
      id: "cr_bad",
      signature: "0",
    };
    const fetcher: Fetcher = () =>
      jsonResponse({
        count: 2,
        coorgInvitationResponses: [good, bad],
      });
    const result = await pullCoOrganizerInvitationResponsesFromPeer({
      peerUrl: "https://peer.example",
      since: null,
      fetcher,
      store,
    });
    expect(result.insertedCount).toBe(1);
    expect(result.rejectedCount).toBe(1);
  });
});

describe("pullCoOrganizerInvitationRevocationsFromPeer", () => {
  it("inserts well-signed revocations and advances cursor by revokedAt", async () => {
    const store = createCoOrganizerInvitationRevocationStore(db);
    const rows = [
      makeSignedCoOrgRevocation({ revokedAt: 500 }),
      makeSignedCoOrgRevocation({ revokedAt: 700 }),
    ];
    const fetcher: Fetcher = () =>
      jsonResponse({ count: 2, coorgInvitationRevocations: rows });
    const result = await pullCoOrganizerInvitationRevocationsFromPeer({
      peerUrl: "https://peer.example",
      since: null,
      fetcher,
      store,
    });
    expect(result.kind).toBe("coorg_invitation_revocation");
    expect(result.insertedCount).toBe(2);
    expect(result.latestCompletedAt).toBe(700);
  });

  it("skips a revocation whose signature does not verify", async () => {
    const store = createCoOrganizerInvitationRevocationStore(db);
    const good = makeSignedCoOrgRevocation();
    const bad: CoOrganizerInvitationRevocation = {
      ...good,
      id: "cv_bad",
      signature: "0",
    };
    const fetcher: Fetcher = () =>
      jsonResponse({
        count: 2,
        coorgInvitationRevocations: [good, bad],
      });
    const result = await pullCoOrganizerInvitationRevocationsFromPeer({
      peerUrl: "https://peer.example",
      since: null,
      fetcher,
      store,
    });
    expect(result.insertedCount).toBe(1);
    expect(result.rejectedCount).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Community-event pull workers — PR D.
// ---------------------------------------------------------------------------

function makeSignedEventForPull(overrides: {
  id?: string;
  createdAt?: number;
  organizer?: { publicKey: string; secretKey: Uint8Array };
} = {}): import("@understoria/shared/types").Event {
  const org = overrides.organizer ?? generateKeyPair();
  const createdAt = overrides.createdAt ?? Date.now();
  const payload = {
    id: overrides.id ?? `ev_${Math.random().toString(36).slice(2)}`,
    kind: "event" as const,
    title: "Skillshare",
    description: "",
    category: "skills-exchange",
    startsAt: createdAt + 86_400_000,
    endsAt: null,
    location: "Community room",
    capacity: null,
    templateId: null,
    createdAt,
    createdBy: org.publicKey,
    nodeId: "node_peer",
  };
  const sig = sign(canonicalEventPayload(payload), org.secretKey);
  return { ...payload, signature: sig };
}

function makeSignedCancellationForPull(opts: {
  eventId: string;
  organizer: { publicKey: string; secretKey: Uint8Array };
  id?: string;
  cancelledAt?: number;
}): import("@understoria/shared/types").EventCancellation {
  const cancelledAt = opts.cancelledAt ?? Date.now();
  const payload = {
    id: opts.id ?? `ec_${Math.random().toString(36).slice(2)}`,
    kind: "event_cancellation" as const,
    eventId: opts.eventId,
    reason: "",
    cancelledAt,
    createdBy: opts.organizer.publicKey,
    nodeId: "node_peer",
  };
  const sig = sign(
    canonicalEventCancellationPayload(payload),
    opts.organizer.secretKey,
  );
  return { ...payload, signature: sig };
}

describe("pullEventsFromPeer", () => {
  it("inserts every well-signed event the peer returns and advances the cursor on max(createdAt)", async () => {
    const store = createEventStore(db);
    const events = [
      makeSignedEventForPull({ createdAt: 100 }),
      makeSignedEventForPull({ createdAt: 200 }),
    ];
    const fetcher: Fetcher = () => jsonResponse({ count: 2, events });
    const result = await pullEventsFromPeer({
      peerUrl: "https://peer.example",
      since: null,
      fetcher,
      store,
    });
    expect(result.kind).toBe("event");
    expect(result.insertedCount).toBe(2);
    expect(result.latestCompletedAt).toBe(200);
    expect(store.count()).toBe(2);
  });

  it("drops bad-signature rows without advancing the cursor past them", async () => {
    const store = createEventStore(db);
    const good = makeSignedEventForPull({ createdAt: 100 });
    const bad: import("@understoria/shared/types").Event = {
      ...makeSignedEventForPull({ createdAt: 999 }),
      signature: "0",
    };
    const fetcher: Fetcher = () =>
      jsonResponse({ count: 2, events: [good, bad] });
    const result = await pullEventsFromPeer({
      peerUrl: "https://peer.example",
      since: null,
      fetcher,
      store,
    });
    expect(result.insertedCount).toBe(1);
    expect(result.rejectedCount).toBe(1);
    expect(result.latestCompletedAt).toBe(100);
    expect(store.count()).toBe(1);
  });

  it("treats already-stored events as duplicates without re-inserting", async () => {
    const store = createEventStore(db);
    const event = makeSignedEventForPull({ createdAt: 500 });
    store.insert(event);
    const fetcher: Fetcher = () =>
      jsonResponse({ count: 1, events: [event] });
    const result = await pullEventsFromPeer({
      peerUrl: "https://peer.example",
      since: null,
      fetcher,
      store,
    });
    expect(result.insertedCount).toBe(0);
    expect(result.duplicateCount).toBe(1);
    expect(store.count()).toBe(1);
  });

  it("hits the /events path with since=", async () => {
    const store = createEventStore(db);
    const seen: string[] = [];
    const fetcher: Fetcher = (url) => {
      seen.push(url);
      return jsonResponse({ count: 0, events: [] });
    };
    await pullEventsFromPeer({
      peerUrl: "https://peer.example",
      since: 4242,
      fetcher,
      store,
    });
    expect(seen[0]).toMatch(/\/events\?/);
    expect(seen[0]).toContain("since=4242");
  });
});

describe("pullEventCancellationsFromPeer", () => {
  it("inserts every well-signed cancellation the peer returns", async () => {
    const store = createEventCancellationStore(db);
    const org = generateKeyPair();
    const c1 = makeSignedCancellationForPull({
      eventId: "ev_one",
      organizer: org,
      cancelledAt: 100,
    });
    const c2 = makeSignedCancellationForPull({
      eventId: "ev_two",
      organizer: org,
      cancelledAt: 200,
    });
    const fetcher: Fetcher = () =>
      jsonResponse({ count: 2, eventCancellations: [c1, c2] });
    const result = await pullEventCancellationsFromPeer({
      peerUrl: "https://peer.example",
      since: null,
      fetcher,
      store,
    });
    expect(result.kind).toBe("event_cancellation");
    expect(result.insertedCount).toBe(2);
    expect(result.latestCompletedAt).toBe(200);
    expect(store.count()).toBe(2);
  });

  it("drops bad-signature rows without advancing past them", async () => {
    const store = createEventCancellationStore(db);
    const org = generateKeyPair();
    const good = makeSignedCancellationForPull({
      eventId: "ev_good",
      organizer: org,
      cancelledAt: 100,
    });
    const bad: import("@understoria/shared/types").EventCancellation = {
      ...makeSignedCancellationForPull({
        eventId: "ev_bad",
        organizer: org,
        cancelledAt: 9999,
      }),
      signature: "0",
    };
    const fetcher: Fetcher = () =>
      jsonResponse({ count: 2, eventCancellations: [good, bad] });
    const result = await pullEventCancellationsFromPeer({
      peerUrl: "https://peer.example",
      since: null,
      fetcher,
      store,
    });
    expect(result.insertedCount).toBe(1);
    expect(result.rejectedCount).toBe(1);
    expect(result.latestCompletedAt).toBe(100);
    expect(store.count()).toBe(1);
  });

  it("dedupes by id without re-inserting", async () => {
    const store = createEventCancellationStore(db);
    const org = generateKeyPair();
    const cancel = makeSignedCancellationForPull({
      eventId: "ev_x",
      organizer: org,
      cancelledAt: 500,
    });
    store.insert(cancel);
    const fetcher: Fetcher = () =>
      jsonResponse({ count: 1, eventCancellations: [cancel] });
    const result = await pullEventCancellationsFromPeer({
      peerUrl: "https://peer.example",
      since: null,
      fetcher,
      store,
    });
    expect(result.insertedCount).toBe(0);
    expect(result.duplicateCount).toBe(1);
    expect(store.count()).toBe(1);
  });

  it("honors first-write-wins on eventId — a second cancellation for the same eventId is treated as a duplicate", async () => {
    const store = createEventCancellationStore(db);
    const org = generateKeyPair();
    const first = makeSignedCancellationForPull({
      id: "ec_first",
      eventId: "ev_shared",
      organizer: org,
      cancelledAt: 100,
    });
    store.insert(first);
    const second = makeSignedCancellationForPull({
      id: "ec_second",
      eventId: "ev_shared",
      organizer: org,
      cancelledAt: 200,
    });
    const fetcher: Fetcher = () =>
      jsonResponse({ count: 1, eventCancellations: [second] });
    const result = await pullEventCancellationsFromPeer({
      peerUrl: "https://peer.example",
      since: null,
      fetcher,
      store,
    });
    expect(result.insertedCount).toBe(0);
    expect(result.duplicateCount).toBe(1);
    expect(store.count()).toBe(1);
    expect(store.getByEventId("ev_shared")?.id).toBe("ec_first");
  });

  it("hits the /event-cancellations path with since=", async () => {
    const store = createEventCancellationStore(db);
    const seen: string[] = [];
    const fetcher: Fetcher = (url) => {
      seen.push(url);
      return jsonResponse({ count: 0, eventCancellations: [] });
    };
    await pullEventCancellationsFromPeer({
      peerUrl: "https://peer.example",
      since: 9001,
      fetcher,
      store,
    });
    expect(seen[0]).toMatch(/\/event-cancellations\?/);
    expect(seen[0]).toContain("since=9001");
  });
});
