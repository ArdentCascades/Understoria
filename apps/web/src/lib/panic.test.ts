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
import { beforeEach, describe, expect, it } from "vitest";
import { hardPurge, softPurge } from "./panic";
import { db } from "@/db/database";
import { blockMember } from "@/db/blocks";
import { createMember } from "@/db/seed";
import {
  confirmExchange,
  createPost,
  claimPost,
} from "@/db/actions";

const NODE = "node_panic_test";

async function reset() {
  // Clear the live schema — this test file asserts full-schema purge
  // coverage, so its reset must never lag behind new tables either.
  await Promise.all(db.tables.map((t) => t.clear()));
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
          availabilityChips: ["weekday_evenings", "weekend_days"],
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
    }, NODE);
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
    }, NODE);
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
      expect(m.availabilityChips).toEqual([]);
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

  it("wipes EVERY table in the live schema — no hand-list drift", async () => {
    // Seed one minimal row into every declared table, generically, so
    // a future table addition is covered by this test automatically.
    // (This is the regression test for the drifted hand-maintained
    // list: messages, taskComments, drafts, proposals, votes, events,
    // eventRsvps, eventCancellations, eventProjectLinks and nodeConfig
    // all survived the "wipe every table" purge.)
    for (const t of db.tables) {
      const kp = t.schema.primKey.keyPath;
      const row: Record<string, unknown> = {};
      if (typeof kp === "string") {
        // Dotted keypaths (e.g. redemptionReceipts' "invite.token")
        // need the nested shape, not a flat "a.b" property.
        const parts = kp.split(".");
        let target = row;
        for (const part of parts.slice(0, -1)) {
          const next: Record<string, unknown> = {};
          target[part] = next;
          target = next;
        }
        target[parts[parts.length - 1]] = `seed_${t.name}`;
      } else if (Array.isArray(kp)) {
        for (const part of kp) row[part] = `seed_${t.name}_${part}`;
      }
      await t.put(row as never);
    }
    for (const t of db.tables) {
      expect(await t.count()).toBeGreaterThan(0);
    }

    const result = await hardPurge();
    expect([...result.tablesTouched].sort()).toEqual(
      db.tables.map((t) => t.name).sort(),
    );

    for (const t of db.tables) {
      // The rotation tail re-creates exactly one fresh identity row
      // and the fresh nodeId setting; everything else must be empty.
      const expected =
        t.name === "secretKeys" || t.name === "settings" ? 1 : 0;
      expect({ table: t.name, count: await t.count() }).toEqual({
        table: t.name,
        count: expected,
      });
    }
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

describe("softPurge clears blocking tables (docs/blocking.md §3)", () => {
  beforeEach(reset);

  it("clears both blocks and previouslyBlocked alongside the existing scrub", async () => {
    const members = await populate(3, 0);
    const [a, b, c] = members;

    // Two active blocks + one block-then-unblock so previouslyBlocked
    // gets both an in-progress row and a fully-unblocked row.
    await blockMember({
      blockerKey: a.publicKey,
      blockedKey: b.publicKey,
      hideGovernance: false,
      note: "alice blocks bob",
    });
    await blockMember({
      blockerKey: a.publicKey,
      blockedKey: c.publicKey,
      hideGovernance: true,
      note: null,
    });

    expect(await db.blocks.count()).toBe(2);
    expect(await db.previouslyBlocked.count()).toBe(2);

    const result = await softPurge();
    expect(result.tablesTouched).toContain("blocks");
    expect(result.tablesTouched).toContain("previouslyBlocked");

    expect(await db.blocks.count()).toBe(0);
    expect(await db.previouslyBlocked.count()).toBe(0);
  });
});

describe("softPurge covers member-authored content tables", () => {
  beforeEach(reset);

  it("scrubs comment bodies, event text, proposal text and activity text; clears messages, drafts and RSVPs", async () => {
    await db.taskComments.put({
      id: "tc_1",
      projectId: "proj_1",
      taskId: "task_1",
      authorKey: "pk_author",
      body: "identifying words",
      createdAt: 1,
      deletedAt: null,
      nodeId: NODE,
      signature: "sig",
    });
    await db.messages.put({
      id: "m_1",
      conversationId: "a|b",
      senderKey: "pk_a",
      recipientKey: "pk_b",
      nonce: "n",
      ciphertext: "c",
      createdAt: 1,
    });
    await db.drafts.put({
      key: "post_new",
      payload: JSON.stringify({ title: "secret draft" }),
      updatedAt: 1,
    });
    await db.events.put({
      id: "ev_1",
      kind: "event",
      title: "March meetup",
      description: "at the union hall",
      category: "other",
      startsAt: 1,
      endsAt: null,
      location: "123 Main St",
      capacity: null,
      templateId: null,
      createdAt: 1,
      createdBy: "pk_org",
      nodeId: NODE,
      signature: "sig",
    } as never);
    await db.eventRsvps.put({
      id: "rsvp_1",
      eventId: "ev_1",
      memberKey: "pk_a",
      status: "going",
      updatedAt: 1,
    } as never);
    await db.eventProjectLinks.put({
      id: "epl_1",
      eventId: "ev_1",
      projectId: "proj_local",
      linkedBy: "pk_a",
      createdAt: 1,
    } as never);
    await db.eventShifts.put({
      id: "shift_1",
      eventId: "ev_1",
      label: "Setup crew",
      startsAt: 1,
      endsAt: 2,
      capacity: 4,
      createdBy: "pk_org",
      createdAt: 1,
    } as never);
    await db.shiftSignups.put({
      id: "ss_1",
      shiftId: "shift_1",
      eventId: "ev_1",
      memberKey: "pk_a",
      signedUpAt: 1,
    } as never);
    await db.outbox.put({
      id: "ob_1",
      kind: "post",
      // Verbatim payload holds the same linkable text the scrub blanks
      // in the source tables — must not survive one table over.
      payload: JSON.stringify({ title: "Sensitive outbox title" }),
      recordId: "p1",
      createdAt: 1,
      attempts: 0,
      nextAttemptAt: 1,
      status: "pending",
    } as never);
    await db.invites.put({
      token: "inv_1",
      inviterKey: "pk_a",
      nodeId: NODE,
      createdAt: 1,
      expiresAt: 9_999_999_999_999,
      status: "open",
      encoded: "LIVE-REDEEMABLE-CREDENTIAL",
    } as never);
    await db.votes.put({
      id: "vote_1",
      proposalId: "prop_1",
      voterKey: "pk_a",
      choice: "yes",
      createdAt: 1,
    } as never);
    await db.pairingLog.put({
      id: "pl_1",
      // Member-authored device label — device-graph metadata a seized
      // device must not keep (Round-4).
      label: "Dan's phone",
      pairedAt: 1,
    } as never);
    await db.eventCancellations.put({
      id: "ec_1",
      kind: "event_cancellation",
      eventId: "ev_1",
      reason: "venue raided",
      cancelledAt: 2,
      createdBy: "pk_org",
      nodeId: NODE,
      signature: "sig",
    } as never);
    await db.proposals.put({
      id: "prop_1",
      nodeId: NODE,
      kind: "dispute",
      category: "dispute",
      reversibilityTier: "easy",
      title: "Sensitive post title",
      description: "flagger's reason text",
      payload: JSON.stringify({ postTitle: "Sensitive post title", body: "comment words" }),
      proposerKey: "pk_a",
      status: "open",
      createdAt: 1,
      closedAt: null,
      closedReason: null,
      impactReflection: null,
      disputePostId: "post_1",
    } as never);
    await db.projectActivity.put({
      id: "act_1",
      projectId: "proj_1",
      type: "announcement",
      actorKey: "pk_org",
      data: {
        body: "announcement words",
        taskTitle: "Haul soil",
        // A hypothetical FUTURE text key the scrub has never heard of —
        // the allowlist model must scrub it by default.
        organizerMood: "furious at the landlord",
        // Structural values that must survive.
        taskId: "task_1",
        helperKey: "pk_helper",
        hours: 3,
        edited: true,
      },
      createdAt: 1,
      nodeId: NODE,
    } as never);

    const result = await softPurge();

    // Free text gone, structure kept.
    expect((await db.taskComments.get("tc_1"))!.body).toBe("");
    const ev = (await db.events.get("ev_1")) as {
      title: string;
      description: string;
      location: string;
    };
    expect(ev.title).toBe("");
    expect(ev.description).toBe("");
    expect(ev.location).toBe("");
    expect(
      ((await db.eventCancellations.get("ec_1")) as { reason: string }).reason,
    ).toBe("");
    const prop = (await db.proposals.get("prop_1"))!;
    expect(prop.title).toBe("");
    expect(prop.description).toBe("");
    expect(JSON.parse(prop.payload)).toEqual({ postTitle: "", body: "" });
    const act = (await db.projectActivity.get("act_1")) as {
      data: Record<string, unknown>;
    };
    expect(act.data.body).toBe("");
    expect(act.data.taskTitle).toBe("");
    // Fail-safe allowlist: an unknown string key is scrubbed by
    // default; structural ids, keys, numbers and booleans survive.
    expect(act.data.organizerMood).toBe("");
    expect(act.data.taskId).toBe("task_1");
    expect(act.data.helperKey).toBe("pk_helper");
    expect(act.data.hours).toBe(3);
    expect(act.data.edited).toBe(true);

    // Relationship / credential tables cleared outright.
    expect(await db.messages.count()).toBe(0);
    expect(await db.drafts.count()).toBe(0);
    expect(await db.eventRsvps.count()).toBe(0);
    expect(await db.eventProjectLinks.count()).toBe(0);
    expect(await db.eventShifts.count()).toBe(0);
    expect(await db.shiftSignups.count()).toBe(0);
    expect(await db.outbox.count()).toBe(0);
    expect(await db.invites.count()).toBe(0);
    expect(await db.votes.count()).toBe(0);
    expect(await db.pairingLog.count()).toBe(0);
    // The outbox's verbatim payload text is gone with it.
    expect(JSON.stringify(await db.outbox.toArray())).not.toContain(
      "Sensitive outbox title",
    );

    // The report lists only what was actually scrubbed — settings are
    // deliberately untouched and must not be claimed.
    expect(result.tablesTouched).not.toContain("settings");
    for (const name of [
      "taskComments",
      "messages",
      "drafts",
      "events",
      "eventRsvps",
      "eventProjectLinks",
      "eventShifts",
      "shiftSignups",
      "eventCancellations",
      "proposals",
      "projectActivity",
      "outbox",
      "invites",
      "votes",
      "pairingLog",
    ]) {
      expect(result.tablesTouched).toContain(name);
    }
  });
});
