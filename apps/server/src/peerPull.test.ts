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
  canonicalExchangePayload,
  canonicalPostPayload,
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
} from "@understoria/shared/types";
import type { Database as DatabaseType } from "better-sqlite3";
import {
  createCoOrganizerInvitationResponseStore,
  createCoOrganizerInvitationRevocationStore,
  createCoOrganizerInvitationStore,
  createExchangeStore,
  createPeerPullStore,
  createInviteStore,
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
  pullFromPeer,
  pullPostsFromPeer,
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
    if (/\/vouches\b/.test(url)) {
      return jsonResponse({ count: 0, vouches: [] });
    }
    if (/\/posts\b/.test(url)) {
      return jsonResponse({ count: 0, posts: [] });
    }
    if (/\/invites\b/.test(url)) {
      return jsonResponse({ count: 0, invites: [] });
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
      inviteStore: createInviteStore(db),
      taskCommentStore: createTaskCommentStore(db),
      coorgInvitationStore: createCoOrganizerInvitationStore(db),
      coorgInvitationResponseStore:
        createCoOrganizerInvitationResponseStore(db),
      coorgInvitationRevocationStore:
        createCoOrganizerInvitationRevocationStore(db),
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
      inviteStore: createInviteStore(db),
      taskCommentStore: createTaskCommentStore(db),
      coorgInvitationStore: createCoOrganizerInvitationStore(db),
      coorgInvitationResponseStore:
        createCoOrganizerInvitationResponseStore(db),
      coorgInvitationRevocationStore:
        createCoOrganizerInvitationRevocationStore(db),
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
      inviteStore: createInviteStore(db),
      taskCommentStore: createTaskCommentStore(db),
      coorgInvitationStore: createCoOrganizerInvitationStore(db),
      coorgInvitationResponseStore:
        createCoOrganizerInvitationResponseStore(db),
      coorgInvitationRevocationStore:
        createCoOrganizerInvitationRevocationStore(db),
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
      inviteStore: createInviteStore(db),
      taskCommentStore: createTaskCommentStore(db),
      coorgInvitationStore: createCoOrganizerInvitationStore(db),
      coorgInvitationResponseStore:
        createCoOrganizerInvitationResponseStore(db),
      coorgInvitationRevocationStore:
        createCoOrganizerInvitationRevocationStore(db),
      pullStore,
      fetcher,
    });
    await worker.pullAllOnce();
    await worker.pullAllOnce();
    worker.stop();
    expect(exchangeUrls[0]).not.toContain("since=");
    expect(exchangeUrls[1]).toContain("since=999");
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
      if (/\/invites\b/.test(url))
        return jsonResponse({ count: 0, invites: [] });
      if (/\/task-comments\b/.test(url))
        return jsonResponse({ count: 0, taskComments: [] });
      if (/\/coorg-invitation-responses\b/.test(url))
        return jsonResponse({ count: 0, coorgInvitationResponses: [] });
      if (/\/coorg-invitation-revocations\b/.test(url))
        return jsonResponse({ count: 0, coorgInvitationRevocations: [] });
      if (/\/coorg-invitations\b/.test(url))
        return jsonResponse({ count: 0, coorgInvitations: [] });
      return jsonResponse({ count: 1, exchanges: [exchange] });
    };
    const worker = startPeerPullWorker({
      peerUrls: ["https://peer.example"],
      intervalMs: 60_000,
      store,
      vouchStore,
      postStore,
      inviteStore: createInviteStore(db),
      taskCommentStore: createTaskCommentStore(db),
      coorgInvitationStore: createCoOrganizerInvitationStore(db),
      coorgInvitationResponseStore:
        createCoOrganizerInvitationResponseStore(db),
      coorgInvitationRevocationStore:
        createCoOrganizerInvitationRevocationStore(db),
      pullStore,
      fetcher,
    });
    const results = await worker.pullAllOnce();
    worker.stop();
    // Three kinds attempted; posts returned empty so it's still a
    // successful pull with no insertions.
    expect(results).toHaveLength(8);
    expect(results.map((r) => r.kind).sort()).toEqual([
      "coorg_invitation",
      "coorg_invitation_response",
      "coorg_invitation_revocation",
      "exchange",
      "invite",
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
      if (/\/invites\b/.test(url))
        return jsonResponse({ count: 0, invites: [] });
      if (/\/task-comments\b/.test(url))
        return jsonResponse({ count: 0, taskComments: [] });
      if (/\/coorg-invitation-responses\b/.test(url))
        return jsonResponse({ count: 0, coorgInvitationResponses: [] });
      if (/\/coorg-invitation-revocations\b/.test(url))
        return jsonResponse({ count: 0, coorgInvitationRevocations: [] });
      if (/\/coorg-invitations\b/.test(url))
        return jsonResponse({ count: 0, coorgInvitations: [] });
      return jsonResponse({ count: 1, exchanges: [exchange] });
    };
    const worker = startPeerPullWorker({
      peerUrls: ["https://peer.example"],
      intervalMs: 60_000,
      store,
      vouchStore,
      postStore,
      inviteStore: createInviteStore(db),
      taskCommentStore: createTaskCommentStore(db),
      coorgInvitationStore: createCoOrganizerInvitationStore(db),
      coorgInvitationResponseStore:
        createCoOrganizerInvitationResponseStore(db),
      coorgInvitationRevocationStore:
        createCoOrganizerInvitationRevocationStore(db),
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
      if (/\/invites\b/.test(url))
        return jsonResponse({ count: 0, invites: [] });
      if (/\/task-comments\b/.test(url))
        return jsonResponse({ count: 0, taskComments: [] });
      if (/\/coorg-invitation-responses\b/.test(url))
        return jsonResponse({ count: 0, coorgInvitationResponses: [] });
      if (/\/coorg-invitation-revocations\b/.test(url))
        return jsonResponse({ count: 0, coorgInvitationRevocations: [] });
      if (/\/coorg-invitations\b/.test(url))
        return jsonResponse({ count: 0, coorgInvitations: [] });
      return jsonResponse({ count: 1, exchanges: [exchange] });
    };
    const worker = startPeerPullWorker({
      peerUrls: ["https://peer.example"],
      intervalMs: 60_000,
      store,
      vouchStore,
      postStore,
      inviteStore: createInviteStore(db),
      taskCommentStore: createTaskCommentStore(db),
      coorgInvitationStore: createCoOrganizerInvitationStore(db),
      coorgInvitationResponseStore:
        createCoOrganizerInvitationResponseStore(db),
      coorgInvitationRevocationStore:
        createCoOrganizerInvitationRevocationStore(db),
      pullStore,
      fetcher,
    });
    const results = await worker.pullAllOnce();
    worker.stop();
    expect(results).toHaveLength(8);
    expect(results.map((r) => r.kind).sort()).toEqual([
      "coorg_invitation",
      "coorg_invitation_response",
      "coorg_invitation_revocation",
      "exchange",
      "invite",
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
