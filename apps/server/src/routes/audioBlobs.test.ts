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
  AUDIO_BLOB_MAX_BYTES,
  audioBlobId,
  canonicalAudioBlobUploadPayload,
  canonicalPostPayload,
  generateKeyPair,
  type KeyPair,
  sign,
} from "@understoria/shared/crypto";
import { b64encode, utf8encode } from "@understoria/shared/bytes";
import type {
  AudioBlobUpload,
  Post,
  PostPayload,
} from "@understoria/shared/types";
import { buildServer } from "../server.js";
import { readConfigFromEnv } from "../config.js";
import { openDatabase } from "../db.js";

// Voice-board audio blobs (#474): content-addressed storage for board
// recordings. The invariant under test: the store can never hold bytes
// that disagree with their blobId, and the posts surface carries the
// SIGNED audio reference end to end.

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

const BYTES = utf8encode("pretend-this-is-opus-audio-for-the-voice-board");

function makeUpload(
  overrides: Partial<AudioBlobUpload> = {},
  uploader: KeyPair = generateKeyPair(),
): AudioBlobUpload {
  const payload = {
    blobId: audioBlobId(BYTES),
    uploaderKey: uploader.publicKey,
    mime: "audio/webm;codecs=opus",
  };
  return {
    ...payload,
    audio: b64encode(BYTES),
    signature: sign(
      canonicalAudioBlobUploadPayload(payload),
      uploader.secretKey,
    ),
    ...overrides,
  };
}

describe("POST /audio-blobs", () => {
  it("stores a valid upload (201) and replays idempotently (200)", async () => {
    const upload = makeUpload();
    const first = await app.inject({
      method: "POST",
      url: "/audio-blobs",
      payload: upload,
    });
    expect(first.statusCode).toBe(201);
    expect(first.json()).toEqual({ stored: true, blobId: upload.blobId });

    const replay = await app.inject({
      method: "POST",
      url: "/audio-blobs",
      payload: upload,
    });
    expect(replay.statusCode).toBe(200);
    expect(replay.json()).toEqual({ stored: false, blobId: upload.blobId });
  });

  it("dedups identical bytes uploaded by a DIFFERENT member (200)", async () => {
    await app.inject({
      method: "POST",
      url: "/audio-blobs",
      payload: makeUpload(),
    });
    // Same bytes, different signer: same content address, so the node
    // already has everything it needs.
    const res = await app.inject({
      method: "POST",
      url: "/audio-blobs",
      payload: makeUpload({}, generateKeyPair()),
    });
    expect(res.statusCode).toBe(200);
  });

  it("refuses bytes that do not hash to the signed blobId (422)", async () => {
    // A valid signature over a valid-looking blobId, but the audio
    // that actually arrives is different bytes — the relay-swap case.
    const upload = makeUpload({
      audio: b64encode(utf8encode("swapped recording")),
    });
    const res = await app.inject({
      method: "POST",
      url: "/audio-blobs",
      payload: upload,
    });
    expect(res.statusCode).toBe(422);
    expect(res.json().error).toBe("content_address_mismatch");
  });

  it("refuses a bad signature (422)", async () => {
    const upload = makeUpload();
    const forged = { ...upload, mime: "audio/mp4" }; // signed mime differs
    const res = await app.inject({
      method: "POST",
      url: "/audio-blobs",
      payload: forged,
    });
    expect(res.statusCode).toBe(422);
    expect(res.json().error).toBe("bad_signature");
  });

  it("refuses a disallowed mime at the shape gate (400)", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/audio-blobs",
      payload: makeUpload({ mime: "application/octet-stream" }),
    });
    expect(res.statusCode).toBe(400);
  });

  it("refuses audio above the byte ceiling (400)", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/audio-blobs",
      payload: makeUpload({
        audio: "A".repeat(Math.ceil(AUDIO_BLOB_MAX_BYTES / 3) * 4 + 8),
      }),
    });
    expect(res.statusCode).toBe(400);
  });
});

describe("GET /audio-blobs/:blobId", () => {
  it("serves the exact bytes back with the stored content-type", async () => {
    const upload = makeUpload();
    await app.inject({ method: "POST", url: "/audio-blobs", payload: upload });

    const res = await app.inject({
      method: "GET",
      url: `/audio-blobs/${upload.blobId}`,
    });
    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toBe("audio/webm;codecs=opus");
    expect(res.headers["cache-control"]).toContain("immutable");
    expect(new Uint8Array(res.rawPayload)).toEqual(new Uint8Array(BYTES));
  });

  it("404s for an unknown blobId", async () => {
    const res = await app.inject({
      method: "GET",
      url: `/audio-blobs/${"0".repeat(64)}`,
    });
    expect(res.statusCode).toBe(404);
  });
});

describe("voice posts on /posts (the signed audio reference)", () => {
  /** The immutable wire shape POST /posts accepts, signed over the
   *  canonical payload (audio included only when present). */
  function makeWirePost(audio?: PostPayload["audio"]) {
    const poster = generateKeyPair();
    const payload: PostPayload = {
      id: `post_${Math.random().toString(36).slice(2)}`,
      type: "OFFER",
      category: "other",
      title: "Voice note from the garden",
      description: "",
      estimatedHours: 1,
      urgency: "low",
      postedBy: poster.publicKey,
      createdAt: Date.now(),
      expiresAt: null,
      locationZone: "test-zone",
      nodeId: "node_test",
      ...(audio ? { audio } : {}),
    };
    return {
      ...payload,
      signature: sign(canonicalPostPayload(payload), poster.secretKey),
    };
  }

  const AUDIO_REF = {
    blobId: audioBlobId(BYTES),
    mime: "audio/webm;codecs=opus",
    durationMs: 12_000,
  };

  it("accepts a signed voice post and serves the audio ref back on GET", async () => {
    const wire = makeWirePost(AUDIO_REF);
    const res = await app.inject({
      method: "POST",
      url: "/posts",
      payload: wire,
    });
    expect(res.statusCode).toBe(201);

    const list = await app.inject({ method: "GET", url: "/posts" });
    const posts = list.json().posts as Post[];
    const stored = posts.find((p) => p.id === wire.id);
    expect(stored?.audio).toEqual(AUDIO_REF);
  });

  it("refuses a post whose audio ref was tampered after signing (422)", async () => {
    const wire = makeWirePost(AUDIO_REF);
    const tampered = {
      ...wire,
      audio: { ...AUDIO_REF, blobId: audioBlobId(utf8encode("other bytes")) },
    };
    const res = await app.inject({
      method: "POST",
      url: "/posts",
      payload: tampered,
    });
    expect(res.statusCode).toBe(422);
  });

  it("refuses a voice post with an out-of-bounds durationMs (400)", async () => {
    const wire = makeWirePost({ ...AUDIO_REF, durationMs: 99_999_999 });
    const res = await app.inject({
      method: "POST",
      url: "/posts",
      payload: wire,
    });
    expect(res.statusCode).toBe(400);
  });

  it("keeps accepting plain text posts with no audio key at all — and serves them back without one", async () => {
    const wire = makeWirePost();
    const res = await app.inject({
      method: "POST",
      url: "/posts",
      payload: wire,
    });
    expect(res.statusCode).toBe(201);

    const list = await app.inject({ method: "GET", url: "/posts" });
    const stored = (list.json().posts as Post[]).find(
      (p) => p.id === wire.id,
    );
    expect(stored).toBeDefined();
    // The key must be ABSENT (not null/undefined) so old signatures
    // keep re-deriving byte-identically on the pull side.
    expect(Object.prototype.hasOwnProperty.call(stored, "audio")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// V8 (#478): pull-through federation of audio blobs. A miss on a
// federated post's recording asks the configured peers, verifies the
// content address over what actually arrived, caches LRU-capped, and
// serves — refs federate with posts, bytes move only on demand.

import {
  createRemoteAudioCacheStore,
} from "../db.js";
import { NO_PULL_HEADER, type BlobFetcher } from "../remoteAudio.js";

const PEER_BYTES = utf8encode("peer-community-recording-bytes");
const PEER_BLOB_ID = audioBlobId(PEER_BYTES);

function peerFetcher(
  serves: Record<string, Uint8Array>,
  log: Array<{ url: string; headers: Record<string, string> }>,
  mime = "audio/webm",
): BlobFetcher {
  return async (url, init) => {
    log.push({ url, headers: init.headers });
    const id = url.split("/").pop()!;
    const bytes = serves[id];
    if (bytes === undefined) {
      return {
        ok: false,
        headers: { get: () => null },
        arrayBuffer: async () => new ArrayBuffer(0),
      };
    }
    return {
      ok: true,
      headers: { get: (n: string) => (n === "content-type" ? mime : null) },
      arrayBuffer: async () =>
        bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.length),
    };
  };
}

async function peerServer(env: Record<string, string>, fetcher: BlobFetcher) {
  await app.close();
  db.close();
  db = openDatabase(":memory:");
  const config = readConfigFromEnv({
    LOG_LEVEL: "fatal",
    READ_AUTH: "off",
    NODE_ID: "node_test",
    PEER_NODE_URLS: "https://peer-a.test,https://peer-b.test",
    PEER_READ_TOKENS: '{"https://peer-a.test":"tok-a-0123456789abcdef"}',
    ...env,
  } as NodeJS.ProcessEnv);
  const built = await buildServer({ config, database: db, blobFetcher: fetcher });
  app = built.app;
  await app.ready();
}

describe("GET /audio-blobs pull-through (V8 #478)", () => {
  it("fetches a peer blob on miss, serves it, and caches for the next GET", async () => {
    const calls: Array<{ url: string; headers: Record<string, string> }> = [];
    await peerServer({}, peerFetcher({ [PEER_BLOB_ID]: PEER_BYTES }, calls));

    const first = await app.inject({
      method: "GET",
      url: `/audio-blobs/${PEER_BLOB_ID}`,
    });
    expect(first.statusCode).toBe(200);
    expect(first.rawPayload).toEqual(Buffer.from(PEER_BYTES));
    expect(first.headers["content-type"]).toContain("audio/webm");
    // The outbound request carried the loop guard and peer-a's bearer.
    expect(calls[0].url).toBe(`https://peer-a.test/audio-blobs/${PEER_BLOB_ID}`);
    expect(calls[0].headers[NO_PULL_HEADER]).toBe("1");
    expect(calls[0].headers.authorization).toBe(
      "Bearer tok-a-0123456789abcdef",
    );

    // Cached: the second GET never leaves the node.
    const callCount = calls.length;
    const second = await app.inject({
      method: "GET",
      url: `/audio-blobs/${PEER_BLOB_ID}`,
    });
    expect(second.statusCode).toBe(200);
    expect(second.rawPayload).toEqual(Buffer.from(PEER_BYTES));
    expect(calls.length).toBe(callCount);
  });

  it("tries the next peer when the first misses", async () => {
    const calls: Array<{ url: string; headers: Record<string, string> }> = [];
    // peer-a misses everything; peer-b serves.
    const fetcher: BlobFetcher = async (url, init) => {
      if (url.startsWith("https://peer-a.test")) {
        calls.push({ url, headers: init.headers });
        return {
          ok: false,
          headers: { get: () => null },
          arrayBuffer: async () => new ArrayBuffer(0),
        };
      }
      return peerFetcher({ [PEER_BLOB_ID]: PEER_BYTES }, calls)(url, init);
    };
    await peerServer({}, fetcher);

    const res = await app.inject({
      method: "GET",
      url: `/audio-blobs/${PEER_BLOB_ID}`,
    });
    expect(res.statusCode).toBe(200);
    expect(calls.map((c) => new URL(c.url).host)).toEqual([
      "peer-a.test",
      "peer-b.test",
    ]);
  });

  it("REFUSES peer bytes that don't hash to the requested id", async () => {
    const calls: Array<{ url: string; headers: Record<string, string> }> = [];
    const lie = utf8encode("swapped-recording-under-the-same-id");
    await peerServer(
      {},
      peerFetcher({ [PEER_BLOB_ID]: lie }, calls),
    );
    const res = await app.inject({
      method: "GET",
      url: `/audio-blobs/${PEER_BLOB_ID}`,
    });
    expect(res.statusCode).toBe(404);
    // Nothing poisoned the cache — both peers were tried and refused.
    expect(createRemoteAudioCacheStore(db).count()).toBe(0);
  });

  it("never pulls for a request that carries the loop-guard header", async () => {
    const calls: Array<{ url: string; headers: Record<string, string> }> = [];
    await peerServer({}, peerFetcher({ [PEER_BLOB_ID]: PEER_BYTES }, calls));
    const res = await app.inject({
      method: "GET",
      url: `/audio-blobs/${PEER_BLOB_ID}`,
      headers: { [NO_PULL_HEADER]: "1" },
    });
    expect(res.statusCode).toBe(404);
    expect(calls).toHaveLength(0);
  });

  it("never pulls when the operator disabled the cache (cap 0)", async () => {
    const calls: Array<{ url: string; headers: Record<string, string> }> = [];
    await peerServer(
      { REMOTE_AUDIO_CACHE_MAX_BYTES: "0" },
      peerFetcher({ [PEER_BLOB_ID]: PEER_BYTES }, calls),
    );
    const res = await app.inject({
      method: "GET",
      url: `/audio-blobs/${PEER_BLOB_ID}`,
    });
    expect(res.statusCode).toBe(404);
    expect(calls).toHaveLength(0);
  });

  it("never turns a malformed id into an outbound request", async () => {
    const calls: Array<{ url: string; headers: Record<string, string> }> = [];
    await peerServer({}, peerFetcher({}, calls));
    const res = await app.inject({
      method: "GET",
      url: "/audio-blobs/not-a-content-address",
    });
    expect(res.statusCode).toBe(404);
    expect(calls).toHaveLength(0);
  });

  it("this community's own uploads win without asking any peer", async () => {
    const calls: Array<{ url: string; headers: Record<string, string> }> = [];
    await peerServer({}, peerFetcher({}, calls));
    const upload = makeUpload();
    await app.inject({ method: "POST", url: "/audio-blobs", payload: upload });
    const res = await app.inject({
      method: "GET",
      url: `/audio-blobs/${upload.blobId}`,
    });
    expect(res.statusCode).toBe(200);
    expect(calls).toHaveLength(0);
  });
});

describe("remote audio cache store (LRU trim-on-write)", () => {
  it("evicts least-recently-played rows to the cap; touch refreshes recency", () => {
    const cacheDb = openDatabase(":memory:");
    const cache = createRemoteAudioCacheStore(cacheDb);
    const blob = (label: string) => Buffer.from(`clip-${label}-0123456789`);
    const size = blob("a").length;
    const cap = size * 2;

    expect(
      cache.insertWithTrim({ blobId: "a".repeat(64), mime: "audio/webm", bytes: blob("a"), now: 1 }, cap),
    ).toBe(true);
    cache.insertWithTrim({ blobId: "b".repeat(64), mime: "audio/webm", bytes: blob("b"), now: 2 }, cap);
    // Playing "a" makes "b" the LRU candidate.
    expect(cache.getAndTouch("a".repeat(64), 3)).not.toBeNull();
    cache.insertWithTrim({ blobId: "c".repeat(64), mime: "audio/webm", bytes: blob("c"), now: 4 }, cap);

    expect(cache.count()).toBe(2);
    expect(cache.totalBytes()).toBeLessThanOrEqual(cap);
    expect(cache.getAndTouch("b".repeat(64), 5)).toBeNull(); // evicted
    expect(cache.getAndTouch("a".repeat(64), 6)).not.toBeNull();
    expect(cache.getAndTouch("c".repeat(64), 7)).not.toBeNull();

    // A blob bigger than the whole cap is served but never admitted.
    expect(
      cache.insertWithTrim(
        { blobId: "d".repeat(64), mime: "audio/webm", bytes: Buffer.alloc(cap + 1), now: 8 },
        cap,
      ),
    ).toBe(false);
    expect(cache.count()).toBe(2);
    cacheDb.close();
  });
});
