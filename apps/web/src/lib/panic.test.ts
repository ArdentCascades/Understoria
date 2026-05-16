import { beforeEach, describe, expect, it } from "vitest";
import { hardPurge, softPurge } from "./panic";
import { db } from "@/db/database";
import { createMember } from "@/db/seed";
import {
  confirmExchange,
  createPost,
  claimPost,
} from "@/db/actions";

const NODE = "node_panic_test";

async function reset() {
  await Promise.all([
    db.members.clear(),
    db.posts.clear(),
    db.exchanges.clear(),
    db.achievements.clear(),
    db.settings.clear(),
    db.secretKeys.clear(),
    db.invites.clear(),
    db.vouches.clear(),
    db.outbox.clear(),
  ]);
}

async function populate(memberCount: number, postCount: number) {
  const members = [];
  for (let i = 0; i < memberCount; i++) {
    members.push(
      await createMember(
        {
          displayName: `Real Name ${i}`,
          skills: ["secret skill"],
          availability: "Weekday evenings",
          locationZone: "Specific block",
        },
        NODE,
      ),
    );
  }
  for (let i = 0; i < postCount; i++) {
    const poster = members[i % members.length];
    await createPost(poster.publicKey, "zone X", {
      type: i % 2 ? "NEED" : "OFFER",
      category: "transport",
      title: `Sensitive title ${i}`,
      description: "Details an adversary would want",
      estimatedHours: 1,
      urgency: "low",
      expiresAt: null,
    });
  }
  return members;
}

describe("softPurge", () => {
  beforeEach(reset);

  it("strips identifying text but keeps structural data", async () => {
    const members = await populate(3, 4);
    const [a, b] = members;
    const post = await createPost(a.publicKey, "", {
      type: "NEED",
      category: "food",
      title: "Sensitive",
      description: "Private",
      estimatedHours: 1,
      urgency: "low",
      expiresAt: null,
    });
    await claimPost(post.id, b.publicKey);
    await confirmExchange(post.id, a.publicKey, NODE);
    await confirmExchange(post.id, b.publicKey, NODE);

    const before = {
      exchanges: (await db.exchanges.toArray()).length,
      secrets: (await db.secretKeys.toArray()).length,
    };

    const result = await softPurge();
    expect(result.mode).toBe("soft");

    const membersAfter = await db.members.toArray();
    for (const m of membersAfter) {
      expect(m.displayName.startsWith("Member ")).toBe(true);
      expect(m.skills).toEqual([]);
      expect(m.availability).toBe("");
      expect(m.locationZone).toBe("");
      expect(m.vouchedBy).toEqual([]);
    }
    const postsAfter = await db.posts.toArray();
    for (const p of postsAfter) {
      expect(p.title).toBe("");
      expect(p.description).toBe("");
      expect(p.locationZone).toBe("");
      // Structural data preserved — status, category, hours, etc.
      expect(p.category).toBeTruthy();
    }

    // Exchange ledger and keypairs survive a soft purge.
    expect((await db.exchanges.toArray()).length).toBe(before.exchanges);
    expect((await db.secretKeys.toArray()).length).toBe(before.secrets);
  });
});

describe("hardPurge", () => {
  beforeEach(reset);

  it("wipes every table and rotates to a fresh node identity", async () => {
    await populate(5, 10);
    const prePurgeKeys = (await db.secretKeys.toArray()).map(
      (k) => k.publicKey,
    );
    expect(prePurgeKeys.length).toBeGreaterThan(0);

    const result = await hardPurge();
    expect(result.mode).toBe("hard");

    expect(await db.members.count()).toBe(0);
    expect(await db.posts.count()).toBe(0);
    expect(await db.exchanges.count()).toBe(0);
    expect(await db.achievements.count()).toBe(0);

    // Exactly one fresh key remains (the new node identity), and it is
    // not one of the pre-purge keys.
    const postKeys = await db.secretKeys.toArray();
    expect(postKeys).toHaveLength(1);
    expect(prePurgeKeys).not.toContain(postKeys[0].publicKey);
  });

  it("completes well under the 60-second acceptance target", async () => {
    // Populate with a realistic-ish small-community dataset.
    await populate(50, 200);
    const result = await hardPurge();
    // Acceptance criterion from Agent 4: "full purge completes in under
    // 60 seconds". We assert a much tighter bound since indexeddb is
    // fast on anything modern.
    expect(result.durationMs).toBeLessThan(60_000);
    expect(result.durationMs).toBeLessThan(5_000);
  });
});
