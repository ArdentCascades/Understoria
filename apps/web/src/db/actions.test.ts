import { beforeEach, describe, expect, it } from "vitest";
import {
  cancelPost,
  claimPost,
  confirmExchange,
  createPost,
  disputeExchange,
} from "./actions";
import { db } from "./database";
import { createMember } from "./seed";
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
