/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  canonicalPostPayload,
  generateKeyPair,
  sign,
} from "@understoria/shared/crypto";
import { db, getSetting, setSetting, SETTING_KEYS } from "@/db/database";
import { parseCursor, pullFederatedPosts } from "./federationSync";

// Phase 3 of docs/composite-federation-cursors.md: the PWA's pull
// cursors are (timestamp, id) pairs persisted as "<ms>:<id>". These
// tests cover the wedge the pair form exists to fix — a page of rows
// sharing one timestamp used to re-serve forever under the inclusive
// bare-timestamp cursor — plus the legacy upgrade path.

async function reset() {
  await Promise.all([db.posts.clear(), db.settings.clear()]);
  await setSetting(SETTING_KEYS.communityNodeEnabled, "1");
  await setSetting(SETTING_KEYS.communityNodeUrl, "http://node.test");
}

const POST_CURSOR_KEY = "federationLastPostPull";

/** One poster keypair for the whole feed — signature verification per
 *  row is what matters here, not key diversity. */
const poster = generateKeyPair();

/** The signed immutable wire subset of a post, as the node serves it
 *  (same shape as federationSync.test.ts's makeSignedWirePost). */
function makeSignedWirePost(opts: { id: string; createdAt: number }) {
  const immutable = {
    id: opts.id,
    type: "NEED" as const,
    category: "other" as const,
    title: "Need a hand",
    description: "Wire post",
    estimatedHours: 1,
    urgency: "low" as const,
    postedBy: poster.publicKey,
    createdAt: opts.createdAt,
    expiresAt: null,
    locationZone: "",
    nodeId: "peer_node",
  };
  return {
    ...immutable,
    signature: sign(canonicalPostPayload(immutable), poster.secretKey),
  };
}

type WirePost = ReturnType<typeof makeSignedWirePost>;

/**
 * A fetch stub implementing the server's /posts paging contract
 * (db.ts pagedRows): ORDER BY created_at ASC, id ASC; `since` alone is
 * INCLUSIVE (>=); `since` + `sinceId` is the EXCLUSIVE pair predicate
 * `(ts > since) OR (ts = since AND id > sinceId)`.
 */
function stubPagedPosts(rows: WirePost[], pageSize: number) {
  const ordered = [...rows].sort((a, b) =>
    a.createdAt !== b.createdAt
      ? a.createdAt - b.createdAt
      : a.id < b.id
        ? -1
        : a.id > b.id
          ? 1
          : 0,
  );
  const fetchSpy = vi.fn().mockImplementation((url: string) => {
    const params = new URL(String(url)).searchParams;
    const since = params.get("since");
    const sinceId = params.get("sinceId");
    let served = ordered;
    if (since !== null && sinceId !== null) {
      const ts = Number(since);
      served = ordered.filter(
        (r) => r.createdAt > ts || (r.createdAt === ts && r.id > sinceId),
      );
    } else if (since !== null) {
      const ts = Number(since);
      served = ordered.filter((r) => r.createdAt >= ts);
    }
    return Promise.resolve({
      ok: true,
      json: async () => ({ posts: served.slice(0, pageSize) }),
    });
  });
  vi.stubGlobal("fetch", fetchSpy);
  return fetchSpy;
}

describe("composite pull cursors (phase 3)", () => {
  beforeEach(reset);
  afterEach(() => vi.unstubAllGlobals());

  it("converges through a same-timestamp wedge: 120 posts sharing one createdAt drain in three 50-row pages", async () => {
    // Pre-pair, this was the §2 wedge: since=<ts> is inclusive, so a
    // page of 50 rows all stamped <ts> was re-served verbatim on every
    // pull and the 70 rows behind it were unreachable forever.
    const ts = 1_700_000_000_000;
    const rows = Array.from({ length: 120 }, (_, i) =>
      makeSignedWirePost({
        id: `post_${String(i).padStart(3, "0")}`,
        createdAt: ts,
      }),
    );
    stubPagedPosts(rows, 50);

    // Pull 1: rows 000–049; the persisted pair pins the position
    // INSIDE the tie.
    expect(await pullFederatedPosts()).toEqual({ inserted: 50, skipped: 0 });
    expect(await getSetting(POST_CURSOR_KEY)).toBe(`${ts}:post_049`);

    // Pull 2: strictly after (ts, post_049) → rows 050–099.
    expect(await pullFederatedPosts()).toEqual({ inserted: 50, skipped: 0 });
    expect(await getSetting(POST_CURSOR_KEY)).toBe(`${ts}:post_099`);

    // Pull 3: the remaining 20 rows — the feed is drained.
    expect(await pullFederatedPosts()).toEqual({ inserted: 20, skipped: 0 });
    expect(await db.posts.count()).toBe(120);
    expect(await getSetting(POST_CURSOR_KEY)).toBe(`${ts}:post_119`);

    // Pull 4: nothing left; the cursor holds still.
    expect(await pullFederatedPosts()).toEqual({ inserted: 0, skipped: 0 });
    expect(await getSetting(POST_CURSOR_KEY)).toBe(`${ts}:post_119`);
  });

  it("upgrades a legacy bare-timestamp cursor: sends since without sinceId once, then persists the pair form", async () => {
    const legacyTs = 1_700_000_000_000;
    await setSetting(POST_CURSOR_KEY, String(legacyTs));
    const newer = makeSignedWirePost({
      id: "post_new",
      createdAt: legacyTs + 5_000,
    });
    const fetchSpy = stubPagedPosts([newer], 50);

    expect(await pullFederatedPosts()).toEqual({ inserted: 1, skipped: 0 });

    // The legacy value went out as a bare inclusive `since` — no
    // sinceId half to send (one re-served page; id-dedup no-ops).
    const params = new URL(String(fetchSpy.mock.calls[0][0])).searchParams;
    expect(params.get("since")).toBe(String(legacyTs));
    expect(params.get("sinceId")).toBeNull();

    // The first consumed row upgrades the persisted value to the pair.
    expect(await getSetting(POST_CURSOR_KEY)).toBe(
      `${legacyTs + 5_000}:post_new`,
    );
  });

  describe("parseCursor", () => {
    it("parses a legacy bare timestamp as an id-less position", () => {
      expect(parseCursor("1234")).toEqual({ ts: 1234, id: null });
    });

    it("parses the pair form", () => {
      expect(parseCursor("1234:abc")).toEqual({ ts: 1234, id: "abc" });
    });

    it("splits on the FIRST colon only — ids may contain colons", () => {
      expect(parseCursor("1234:tok:with:colons")).toEqual({
        ts: 1234,
        id: "tok:with:colons",
      });
    });

    it("rejects garbage, empty strings, and absent values", () => {
      expect(parseCursor("not-a-number")).toBeNull();
      expect(parseCursor("nan:id")).toBeNull();
      expect(parseCursor("1234:")).toBeNull();
      expect(parseCursor("")).toBeNull();
      expect(parseCursor(null)).toBeNull();
      expect(parseCursor(undefined)).toBeNull();
    });
  });
});
