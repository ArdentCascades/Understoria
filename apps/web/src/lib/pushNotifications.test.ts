/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
//
// The device half of the push-subscription lifecycle
// (docs/notifications.md), against a fake node: what leaves the
// device (a signed, category-only body), what stays on it
// (tier/title/strings), and the teardown that must never fail.
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  canonicalPushAuthMessage,
  generateKeyPair,
  verify,
} from "@understoria/shared";
import { db, SETTING_KEYS, setSetting } from "@/db/database";
import {
  getPushPrefs,
  PUSH_PREFS_DB,
  registerPushSubscription,
  renewPushSubscriptionOnOpen,
  savePushPrefs,
  teardownPushSubscription,
} from "./pushNotifications";

const NODE_URL = "https://node.test";
const ENDPOINT = "https://push.example/sub/abc";

function fakeFetch(status = 200) {
  const calls: Array<{ url: string; body: Record<string, unknown> }> = [];
  const impl = vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
    calls.push({
      url: String(url),
      body: JSON.parse(String(init?.body)) as Record<string, unknown>,
    });
    return new Response("{}", { status });
  });
  return { calls, impl: impl as unknown as typeof fetch };
}

async function wipePrefs() {
  await new Promise<void>((resolve) => {
    const req = indexedDB.deleteDatabase(PUSH_PREFS_DB);
    req.onsuccess = () => resolve();
    req.onerror = () => resolve();
    req.onblocked = () => resolve();
  });
}

let member: ReturnType<typeof generateKeyPair>;

beforeEach(async () => {
  await wipePrefs();
  await db.secretKeys.clear();
  await db.settings.clear();
  member = generateKeyPair();
  await db.secretKeys.put({
    publicKey: member.publicKey,
    secretKey: member.secretKey,
  });
  await setSetting(SETTING_KEYS.communityNodeUrl, NODE_URL);
  await setSetting(SETTING_KEYS.communityNodeEnabled, "1");
});

describe("registerPushSubscription", () => {
  it("sends a signed, category-only body and saves the prefs on success", async () => {
    const { calls, impl } = fakeFetch();
    const ok = await registerPushSubscription(
      member.publicKey,
      { endpoint: ENDPOINT, keys: { p256dh: "p", auth: "a" } },
      ["shift_reminder", "guardian_request"],
      { fetchImpl: impl },
    );
    expect(ok).toBe(true);
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe(`${NODE_URL}/push/subscriptions`);
    const body = calls[0].body;
    // The signature verifies over the canonical message — the same
    // check the node route runs.
    expect(
      verify(
        canonicalPushAuthMessage(
          "push-subscribe",
          member.publicKey,
          body.deviceId as string,
          ENDPOINT,
          body.categories as string[],
          body.timestamp as number,
        ),
        body.signature as string,
        member.publicKey,
      ),
    ).toBe(true);
    // Device-only prefs never ride along (doc decision 5).
    expect(body).not.toHaveProperty("tier");
    expect(body).not.toHaveProperty("title");
    expect(body).not.toHaveProperty("strings");
    const prefs = await getPushPrefs();
    expect(prefs.categories).toEqual(["shift_reminder", "guardian_request"]);
    expect(prefs.endpoint).toBe(ENDPOINT);
  });

  it("refuses unknown categories and an all-off request without calling the node", async () => {
    const { calls, impl } = fakeFetch();
    expect(
      await registerPushSubscription(
        member.publicKey,
        { endpoint: ENDPOINT, keys: { p256dh: "p", auth: "a" } },
        ["engagement_digest" as never],
        { fetchImpl: impl },
      ),
    ).toBe(false);
    expect(
      await registerPushSubscription(
        member.publicKey,
        { endpoint: ENDPOINT, keys: { p256dh: "p", auth: "a" } },
        [],
        { fetchImpl: impl },
      ),
    ).toBe(false);
    expect(calls).toHaveLength(0);
    expect((await getPushPrefs()).endpoint).toBeNull();
  });
});

describe("renewPushSubscriptionOnOpen", () => {
  it("feeds the TTL once a day, not on every open, and only while subscribed", async () => {
    const { calls, impl } = fakeFetch();
    // Not subscribed: never calls out.
    await renewPushSubscriptionOnOpen(member.publicKey, { fetchImpl: impl });
    expect(calls).toHaveLength(0);

    const t0 = Date.now();
    await registerPushSubscription(
      member.publicKey,
      { endpoint: ENDPOINT, keys: { p256dh: "p", auth: "a" } },
      ["shift_reminder"],
      { fetchImpl: impl, now: () => t0 },
    );
    // Same day: throttled.
    await renewPushSubscriptionOnOpen(member.publicKey, {
      fetchImpl: impl,
      now: () => t0 + 60_000,
    });
    expect(calls).toHaveLength(1);
    // Next day: renews, and the renew clock advances.
    const t1 = t0 + 25 * 60 * 60 * 1000;
    await renewPushSubscriptionOnOpen(member.publicKey, {
      fetchImpl: impl,
      now: () => t1,
    });
    expect(calls).toHaveLength(2);
    expect(calls[1].url).toBe(`${NODE_URL}/push/subscriptions/renew`);
    expect((await getPushPrefs()).renewedAt).toBe(t1);
  });
});

describe("teardownPushSubscription", () => {
  it("sends the signed delete and always clears the local prefs", async () => {
    const { calls, impl } = fakeFetch();
    await registerPushSubscription(
      member.publicKey,
      { endpoint: ENDPOINT, keys: { p256dh: "p", auth: "a" } },
      ["awaiting_confirmation"],
      { fetchImpl: impl },
    );
    await teardownPushSubscription(member.publicKey, { fetchImpl: impl });
    expect(calls).toHaveLength(2);
    expect(calls[1].url).toBe(`${NODE_URL}/push/subscriptions/delete`);
    const fresh = await getPushPrefs();
    expect(fresh.categories).toEqual([]);
    expect(fresh.endpoint).toBeNull();
  });

  it("never throws — and still clears prefs — with no member, no key, or a dead node", async () => {
    const failing = vi.fn(async () => {
      throw new Error("network down");
    }) as unknown as typeof fetch;
    const prefs = await getPushPrefs();
    await savePushPrefs({ ...prefs, endpoint: ENDPOINT, categories: [] });
    // No member key at all (locked-out purge path)…
    await teardownPushSubscription(null, { fetchImpl: failing });
    expect((await getPushPrefs()).endpoint).toBeNull();
    // …and a member whose network call dies mid-teardown.
    await savePushPrefs({
      ...(await getPushPrefs()),
      endpoint: ENDPOINT,
    });
    await expect(
      teardownPushSubscription(member.publicKey, { fetchImpl: failing }),
    ).resolves.toBeUndefined();
    expect((await getPushPrefs()).endpoint).toBeNull();
  });
});
