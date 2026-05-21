/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program. If not, see
 * <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cancelPost,
  claimPost,
  confirmExchange,
  createPost,
  disputeExchange,
} from "./actions";
import { db } from "./database";
import { createMember } from "./seed";
import { writeSubmitConfig } from "@/lib/nodeSubmit";
import { balanceFor } from "@/lib/timebank";
import { verifyExchange } from "@/lib/crypto";

const NODE = "node_test";

async function reset() {
  await Promise.all([
    db.members.clear(),
    db.posts.clear(),
    db.exchanges.clear(),
    db.achievements.clear(),
    db.settings.clear(),
    db.secretKeys.clear(),
    db.outbox.clear(),
    db.projects.clear(),
    db.projectTasks.clear(),
    db.projectActivity.clear(),
  ]);
}

describe("exchange flow (integration)", () => {
  beforeEach(reset);

  it("transfers credits only after both parties confirm", async () => {
    const poster = await createMember({ displayName: "A" }, NODE);
    const claimer = await createMember({ displayName: "B" }, NODE);

    const post = await createPost(poster.publicKey, "zone", {
      type: "NEED",
      category: "transport",
      title: "Ride",
      description: "to clinic",
      estimatedHours: 2,
      urgency: "medium",
      expiresAt: null,
    });

    await claimPost(post.id, claimer.publicKey);

    // First party confirms — status goes to awaiting_confirmation, no credit yet.
    const first = await confirmExchange(
      post.id,
      poster.publicKey,
      NODE,
    );
    expect(first.exchange).toBeNull();
    expect(first.post.status).toBe("awaiting_confirmation");
    const exchangesAfterFirst = await db.exchanges.toArray();
    expect(exchangesAfterFirst).toHaveLength(0);
    expect(balanceFor(poster, exchangesAfterFirst)).toBe(poster.seedBalance);
    expect(balanceFor(claimer, exchangesAfterFirst)).toBe(claimer.seedBalance);

    // Second party confirms — exchange is signed, credits flow.
    const second = await confirmExchange(
      post.id,
      claimer.publicKey,
      NODE,
    );
    expect(second.exchange).not.toBeNull();
    expect(second.post.status).toBe("completed");

    const exchanges = await db.exchanges.toArray();
    expect(exchanges).toHaveLength(1);
    // NEED post: claimer helped poster.
    expect(exchanges[0].helperKey).toBe(claimer.publicKey);
    expect(exchanges[0].helpedKey).toBe(poster.publicKey);
    expect(exchanges[0].hoursExchanged).toBe(2);
    expect(exchanges[0].helperSignature).toBeTruthy();
    expect(exchanges[0].helpedSignature).toBeTruthy();
    // Exchange must be independently verifiable without touching the DB.
    expect(verifyExchange(exchanges[0])).toBe(true);

    expect(balanceFor(poster, exchanges)).toBe(3); // 5 - 2
    expect(balanceFor(claimer, exchanges)).toBe(7); // 5 + 2
  });

  it("for an OFFER, the poster is the helper", async () => {
    const poster = await createMember({ displayName: "A" }, NODE);
    const claimer = await createMember({ displayName: "B" }, NODE);
    const post = await createPost(poster.publicKey, "zone", {
      type: "OFFER",
      category: "food",
      title: "Soup",
      description: "",
      estimatedHours: 1,
      urgency: "low",
      expiresAt: null,
    });
    await claimPost(post.id, claimer.publicKey);
    await confirmExchange(post.id, poster.publicKey, NODE);
    await confirmExchange(post.id, claimer.publicKey, NODE);

    const [exchange] = await db.exchanges.toArray();
    expect(exchange.helperKey).toBe(poster.publicKey);
    expect(exchange.helpedKey).toBe(claimer.publicKey);
  });

  it("awards first_exchange on the first completed exchange", async () => {
    const a = await createMember({ displayName: "A" }, NODE);
    const b = await createMember({ displayName: "B" }, NODE);
    const post = await createPost(a.publicKey, "", {
      type: "NEED",
      category: "other",
      title: "help",
      description: "",
      estimatedHours: 1,
      urgency: "low",
      expiresAt: null,
    });
    await claimPost(post.id, b.publicKey);
    await confirmExchange(post.id, a.publicKey, NODE);
    const result = await confirmExchange(post.id, b.publicKey, NODE);
    const achievementTypes = result.newAchievements.map(
      (x) => x.achievementType,
    );
    expect(achievementTypes).toContain("first_exchange");
  });

  it("prevents the poster from claiming their own post", async () => {
    const a = await createMember({ displayName: "A" }, NODE);
    const post = await createPost(a.publicKey, "", {
      type: "NEED",
      category: "other",
      title: "help",
      description: "",
      estimatedHours: 1,
      urgency: "low",
      expiresAt: null,
    });
    await expect(claimPost(post.id, a.publicKey)).rejects.toThrow();
  });

  it("cancels an open post but refuses to cancel completed ones", async () => {
    const a = await createMember({ displayName: "A" }, NODE);
    const b = await createMember({ displayName: "B" }, NODE);
    const post = await createPost(a.publicKey, "", {
      type: "NEED",
      category: "other",
      title: "help",
      description: "",
      estimatedHours: 1,
      urgency: "low",
      expiresAt: null,
    });
    const cancelled = await cancelPost(post.id, a.publicKey);
    expect(cancelled.status).toBe("cancelled");

    const post2 = await createPost(a.publicKey, "", {
      type: "NEED",
      category: "other",
      title: "help",
      description: "",
      estimatedHours: 1,
      urgency: "low",
      expiresAt: null,
    });
    await claimPost(post2.id, b.publicKey);
    await confirmExchange(post2.id, a.publicKey, NODE);
    await confirmExchange(post2.id, b.publicKey, NODE);
    await expect(cancelPost(post2.id, a.publicKey)).rejects.toThrow();
  });

  it("enforces the daily helper limit on the 4th exchange", async () => {
    const helper = await createMember({ displayName: "Helper" }, NODE);
    const recipients = await Promise.all(
      Array.from({ length: 4 }, (_, i) =>
        createMember({ displayName: `R${i}` }, NODE),
      ),
    );

    async function runExchange(recipient: {
      publicKey: string;
    }): Promise<void> {
      // Helper posts an OFFER so helper is the helper.
      const post = await createPost(helper.publicKey, "", {
        type: "OFFER",
        category: "other",
        title: "help",
        description: "",
        estimatedHours: 1,
        urgency: "low",
        expiresAt: null,
      });
      await claimPost(post.id, recipient.publicKey);
      await confirmExchange(post.id, helper.publicKey, NODE);
      await confirmExchange(post.id, recipient.publicKey, NODE);
    }

    await runExchange(recipients[0]);
    await runExchange(recipients[1]);
    await runExchange(recipients[2]);

    await expect(runExchange(recipients[3])).rejects.toThrow(
      /exchanges today/,
    );

    // Three exchanges recorded; the fourth was rejected.
    expect(await db.exchanges.count()).toBe(3);
  });

  it("flags a very short exchange for community review", async () => {
    const a = await createMember({ displayName: "A" }, NODE);
    const b = await createMember({ displayName: "B" }, NODE);
    const post = await createPost(a.publicKey, "", {
      type: "NEED",
      category: "emotional_support",
      title: "quick check-in",
      description: "",
      estimatedHours: 0.1,
      urgency: "low",
      expiresAt: null,
    });
    await claimPost(post.id, b.publicKey);
    await confirmExchange(post.id, a.publicKey, NODE);
    await confirmExchange(post.id, b.publicKey, NODE);
    const [exchange] = await db.exchanges.toArray();
    expect(exchange.flaggedForReview).toBe(true);
    expect(exchange.flagReason).toBe("short_duration");
  });

  it("flags disputed exchanges without transferring credit", async () => {
    const a = await createMember({ displayName: "A" }, NODE);
    const b = await createMember({ displayName: "B" }, NODE);
    const post = await createPost(a.publicKey, "", {
      type: "NEED",
      category: "other",
      title: "help",
      description: "",
      estimatedHours: 1,
      urgency: "low",
      expiresAt: null,
    });
    await claimPost(post.id, b.publicKey);
    const disputed = await disputeExchange(post.id, a.publicKey);
    expect(disputed.status).toBe("disputed");
    const exchanges = await db.exchanges.toArray();
    expect(exchanges).toHaveLength(0);
  });
});

describe("community-node mirroring on confirmExchange", () => {
  let originalFetch: typeof fetch | undefined;

  beforeEach(async () => {
    await reset();
    originalFetch = globalThis.fetch;
  });
  afterEach(() => {
    if (originalFetch) globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  async function runFullExchange() {
    const a = await createMember({ displayName: "A" }, NODE);
    const b = await createMember({ displayName: "B" }, NODE);
    const post = await createPost(a.publicKey, "", {
      type: "NEED",
      category: "other",
      title: "help",
      description: "",
      estimatedHours: 1,
      urgency: "low",
      expiresAt: null,
    });
    await claimPost(post.id, b.publicKey);
    await confirmExchange(post.id, a.publicKey, NODE);
    return confirmExchange(post.id, b.publicKey, NODE);
  }

  /**
   * confirmExchange enqueues an outbox row inside its transaction, then
   * fires `void flushOutboxNow()` to deliver the row immediately. We
   * can't await that background promise from outside, so we poll for the
   * fetch call (or for an outbox status change) before asserting.
   */
  function waitForFetch(spy: ReturnType<typeof vi.fn>): Promise<void> {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const tick = () => {
        if (spy.mock.calls.length > 0) return resolve();
        if (Date.now() - start > 1000)
          return reject(new Error("fetch was not called within 1s"));
        setTimeout(tick, 5);
      };
      tick();
    });
  }

  it("does NOT call fetch when no community node is configured", async () => {
    const fetchSpy = vi.fn(async () =>
      new Response("{}", { status: 200 }),
    );
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    const result = await runFullExchange();
    expect(result.exchange).not.toBeNull();
    // Give any background promise a tick to run, then assert no calls.
    await new Promise((r) => setTimeout(r, 50));
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("does NOT call fetch when the node URL is set but mirroring is disabled", async () => {
    await writeSubmitConfig({
      url: "https://node.example/api",
      enabled: false,
    });
    const fetchSpy = vi.fn(async () =>
      new Response("{}", { status: 200 }),
    );
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    await runFullExchange();
    await new Promise((r) => setTimeout(r, 50));
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("posts the finalized exchange to <url>/exchanges when configured", async () => {
    await writeSubmitConfig({
      url: "https://node.example/api",
      enabled: true,
    });
    const fetchSpy = vi.fn(async () =>
      new Response('{"stored":true}', { status: 201 }),
    );
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    const result = await runFullExchange();
    await waitForFetch(fetchSpy);

    expect(fetchSpy).toHaveBeenCalledOnce();
    const calls = fetchSpy.mock.calls as unknown as Array<[string, RequestInit]>;
    const [url, init] = calls[0];
    expect(url).toBe("https://node.example/api/exchanges");
    expect(init.method).toBe("POST");
    const body = JSON.parse(init.body as string);
    expect(body.id).toBe(result.exchange!.id);
    expect(body.helperSignature).toBe(result.exchange!.helperSignature);
  });

  it("does not throw when the node returns an error — failure is best-effort", async () => {
    await writeSubmitConfig({
      url: "https://node.example/api",
      enabled: true,
    });
    const fetchSpy = vi.fn(async () => {
      throw new Error("connect ECONNREFUSED");
    });
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    // The user's confirmExchange call must succeed even though the
    // background mirror will fail.
    const result = await runFullExchange();
    expect(result.exchange).not.toBeNull();
    await waitForFetch(fetchSpy);
    expect(fetchSpy).toHaveBeenCalled();
  });

  it("does NOT enqueue an outbox row when no node URL is configured", async () => {
    await runFullExchange();
    expect(await db.outbox.count()).toBe(0);
  });

  it("DOES enqueue an outbox row when a URL is set (even if disabled)", async () => {
    await writeSubmitConfig({
      url: "https://node.example/api",
      enabled: false,
    });
    const result = await runFullExchange();
    const rows = await db.outbox.toArray();
    expect(rows).toHaveLength(1);
    expect(rows[0].recordId).toBe(result.exchange!.id);
    expect(rows[0].status).toBe("pending");
    // Disabled means the row sits there until the user enables; a
    // later flushOutboxOnce with the config flipped would deliver it.
  });

  it("marks the outbox row delivered after a successful mirror", async () => {
    await writeSubmitConfig({
      url: "https://node.example/api",
      enabled: true,
    });
    const fetchSpy = vi.fn(async () =>
      new Response('{"stored":true}', { status: 201 }),
    );
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    await runFullExchange();
    await waitForFetch(fetchSpy);
    // Give the post-flush update a tick to land in IndexedDB.
    await new Promise((r) => setTimeout(r, 50));

    const rows = await db.outbox.toArray();
    expect(rows).toHaveLength(1);
    expect(rows[0].status).toBe("delivered");
  });
});
