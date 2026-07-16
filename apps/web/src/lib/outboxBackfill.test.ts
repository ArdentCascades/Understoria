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
import { db, setSetting, SETTING_KEYS } from "@/db/database";
import { createMember } from "@/db/seed";
import { createPost } from "@/db/actions";
import { writeSubmitConfig } from "@/lib/nodeSubmit";
import {
  verifyAwaitingTransition,
  verifyRelayedMessage,
} from "@understoria/shared/crypto";
import type {
  AwaitingTransition,
  RelayedMessage,
} from "@understoria/shared/types";
import {
  backfillOutboxFromLocalData,
  maybeBackfillOutbox,
} from "./outboxBackfill";

// The backfill is the fix for the 2026-07 "invite feature is broken"
// incident: records authored before a node URL was configured were
// never enqueued, so the founder's content existed only on their own
// device. These tests lock its two contracts: only SELF-AUTHORED
// signed records are re-enqueued, and the walk runs once per node URL
// (re-arming when the device points at a DIFFERENT server).

const NODE = "node_backfill_test";
const URL_A = "https://node-a.example";
const URL_B = "https://node-b.example";

beforeEach(async () => {
  await Promise.all(db.tables.map((t) => t.clear()));
  await setSetting(SETTING_KEYS.nodeId, NODE);
});

/** Configure the node URL, then wipe the outbox + backfill flags so
 *  each test starts from "content exists locally, nothing enqueued" —
 *  the exact broken state production devices were in. */
async function connectThenForget(url: string) {
  await writeSubmitConfig({ url, enabled: true });
  await db.outbox.clear();
  await db.settings
    .filter((s) => s.key.startsWith("outboxBackfillDone::"))
    .delete();
}

async function seedPosts() {
  const author = await createMember({ displayName: "Author" }, NODE);
  await setSetting(SETTING_KEYS.currentMember, author.publicKey);
  const mine = await createPost(author.publicKey, "North", {
    type: "OFFER",
    category: "other",
    title: "Ladder to lend",
    description: "8ft, sturdy",
    estimatedHours: 1,
    urgency: "low",
    expiresAt: null,
  }, NODE);
  // A post pulled from another member: its author's secret key is NOT
  // on this device. Relaying it is the mirror workers' job, not ours.
  await db.posts.add({
    ...mine,
    id: "post_foreign",
    postedBy: "pk_someone_else",
    title: "Not mine",
    signature: "sig_foreign",
  });
  // A legacy self-authored post with no signature can't federate.
  await db.posts.add({
    ...mine,
    id: "post_legacy",
    title: "Unsigned relic",
    signature: "",
  });
  return mine;
}

describe("backfillOutboxFromLocalData", () => {
  it("re-enqueues only self-authored signed records", async () => {
    await connectThenForget(URL_A);
    const mine = await seedPosts();
    await db.outbox.clear(); // createPost auto-enqueued; forget it

    const n = await backfillOutboxFromLocalData();

    expect(n).toBe(1);
    const rows = await db.outbox.toArray();
    expect(rows).toHaveLength(1);
    expect(rows[0].kind).toBe("post");
    expect(rows[0].payload).toContain(mine.id);
  });

  it("re-enqueues this device's OPEN invites so the node learns about them", async () => {
    await connectThenForget(URL_A);
    const { createMember: mkMember } = await import("@/db/seed");
    const { issueInvite } = await import("@/db/invites");
    const inviter = await mkMember({ displayName: "Rosa" }, NODE);
    await issueInvite(
      {
        inviterKey: inviter.publicKey,
        inviterName: inviter.displayName,
        nodeId: NODE,
      },
      URL_A,
    );
    await db.outbox.clear(); // issueInvite auto-enqueued; forget it

    const n = await backfillOutboxFromLocalData();
    expect(n).toBe(1);
    const rows = await db.outbox.toArray();
    expect(rows).toHaveLength(1);
    expect(rows[0].kind).toBe("invite_announcement");
  });

  it("is a no-op when this device holds no secret keys", async () => {
    await connectThenForget(URL_A);
    await db.posts.add({
      ...(await seedPosts()),
      id: "post_orphan",
    });
    await db.secretKeys.clear();
    await db.outbox.clear();

    expect(await backfillOutboxFromLocalData()).toBe(0);
    expect(await db.outbox.count()).toBe(0);
  });
});

// 2026-07 completion sweep: the kinds the first backfill deferred
// ("Not yet covered" in the module doc) are now walked too. Each test
// seeds the pre-connect broken state directly and asserts the walk
// re-enqueues ONLY what this device's keys authored.
describe("backfillOutboxFromLocalData — completion sweep", () => {
  async function seedMember(name = "Author") {
    const member = await createMember({ displayName: name }, NODE);
    await setSetting(SETTING_KEYS.currentMember, member.publicKey);
    return member;
  }

  it("re-signs and re-enqueues sealed message envelopes for held senders only", async () => {
    await connectThenForget(URL_A);
    const sender = await seedMember("Sender");
    const recipient = await createMember({ displayName: "Recipient" }, NODE);
    // The recipient's secret must NOT count as "we authored their
    // messages" — drop it so only the sender key is held.
    const { sendMessage } = await import("@/db/messages");
    const sent = await sendMessage(
      sender.publicKey,
      recipient.publicKey,
      "hola — sent before the node existed",
    );
    await db.messages.add({
      ...sent,
      id: "msg_foreign",
      senderKey: recipient.publicKey,
      recipientKey: sender.publicKey,
    });
    await db.secretKeys.delete(recipient.publicKey);
    await db.outbox.clear(); // sendMessage auto-enqueued; forget it

    await backfillOutboxFromLocalData();
    const rows = await db.outbox.where("kind").equals("message").toArray();
    expect(rows).toHaveLength(1);
    const envelope = JSON.parse(rows[0].payload) as RelayedMessage;
    expect(envelope.id).toBe(sent.id);
    // The re-derived transport signature is REAL — the node's
    // verifier accepts it, so the backfilled message actually lands.
    expect(verifyRelayedMessage(envelope)).toBe(true);
  });

  it("re-publishes RSVPs, shift definitions, and signups under held keys", async () => {
    await connectThenForget(URL_A);
    const member = await seedMember("Organizer");
    await db.eventRsvps.put({
      id: "rsvp_1",
      eventId: "event_1",
      memberKey: member.publicKey,
      status: "going",
      respondedAt: Date.now(),
    });
    await db.eventRsvps.put({
      id: "rsvp_foreign",
      eventId: "event_1",
      memberKey: "pk_someone_else",
      status: "going",
      respondedAt: Date.now(),
    });
    await db.eventShifts.put({
      id: "shift_1",
      eventId: "event_1",
      label: "Setup crew",
      startsAt: Date.now(),
      endsAt: Date.now() + 3_600_000,
      capacity: null,
      createdBy: member.publicKey,
      createdAt: Date.now(),
    });
    await db.shiftSignups.put({
      id: "signup_1",
      shiftId: "shift_1",
      eventId: "event_1",
      memberKey: member.publicKey,
      signedUpAt: Date.now(),
    });
    await db.outbox.clear();

    await backfillOutboxFromLocalData();
    const kinds = (await db.outbox.toArray()).map((r) => r.kind).sort();
    expect(kinds).toEqual(["event_rsvp", "event_shift", "shift_signup"]);
    // The publisher stamped a live signature back onto the local row.
    const rsvp = await db.eventRsvps.get("rsvp_1");
    expect((rsvp as { signerKey?: string })?.signerKey).toBe(
      member.publicKey,
    );
  });

  it("re-enqueues stored co-org records for the record's signer, skipping grandfathered rows", async () => {
    await connectThenForget(URL_A);
    const inviter = await seedMember("Inviter");
    const base = {
      projectId: "proj_1",
      inviterKey: inviter.publicKey,
      inviteeKey: "pk_invitee",
      createdAt: Date.now(),
      expiresAt: Date.now() + 14 * 24 * 3_600_000,
      nodeId: NODE,
    };
    await db.coorgInvitations.put({ ...base, id: "ci_1", signature: "sig" });
    await db.coorgInvitations.put({
      ...base,
      id: "ci_grandfathered",
      signature: "legacy",
      grandfathered: true,
    });
    await db.coorgInvitations.put({
      ...base,
      id: "ci_foreign",
      inviterKey: "pk_someone_else",
      signature: "sig",
    });
    await db.outbox.clear();

    await backfillOutboxFromLocalData();
    const rows = await db.outbox
      .where("kind")
      .equals("coorg_invitation")
      .toArray();
    expect(rows).toHaveLength(1);
    expect(rows[0].recordId).toBe("ci_1");
    // The local-only flag never crosses the wire.
    expect(rows[0].payload).not.toContain("grandfathered");
  });

  it("re-synthesizes the awaiting-transition artifact for a post stuck awaiting confirmation", async () => {
    await connectThenForget(URL_A);
    const author = await seedMember("Helper");
    const post = await createPost(author.publicKey, "North", {
      type: "OFFER",
      category: "other",
      title: "Ride to town",
      description: "Weekly",
      estimatedHours: 1,
      urgency: "low",
      expiresAt: null,
    }, NODE);
    await db.posts.update(post.id, {
      status: "awaiting_confirmation",
      claimedBy: "pk_helped_member",
      awaitingSince: 1_700_000_000_000,
    });
    await db.outbox.clear();

    await backfillOutboxFromLocalData();
    const rows = await db.outbox
      .where("kind")
      .equals("awaiting_transition")
      .toArray();
    expect(rows).toHaveLength(1);
    const artifact = JSON.parse(rows[0].payload) as AwaitingTransition;
    // OFFER: the author is the helper; they're the held party, so
    // they sign. The signature must satisfy the node's verifier.
    expect(artifact.helperKey).toBe(author.publicKey);
    expect(artifact.signedBy).toBe(author.publicKey);
    expect(artifact.enteredAt).toBe(1_700_000_000_000);
    expect(verifyAwaitingTransition(artifact)).toBe(true);
  });

  it("re-enqueues cross-node claims by held keys — never same-community ones", async () => {
    await connectThenForget(URL_A);
    const claimer = await seedMember("Claimer");
    const base = await createPost(claimer.publicKey, "North", {
      type: "NEED",
      category: "other",
      title: "template",
      description: "d",
      estimatedHours: 1,
      urgency: "low",
      expiresAt: null,
    }, NODE);
    // A post from ANOTHER community, claimed by our held key.
    await db.posts.add({
      ...base,
      id: "post_crossnode",
      postedBy: "pk_far_away",
      nodeId: "node_elsewhere",
      status: "claimed",
      claimedBy: claimer.publicKey,
      signature: "sig_foreign",
    });
    // Same-community claims never ride the claim kind (the exchange
    // record carries them) — this one must be skipped.
    await db.posts.add({
      ...base,
      id: "post_local",
      postedBy: "pk_neighbor",
      nodeId: NODE,
      status: "claimed",
      claimedBy: claimer.publicKey,
      signature: "sig_local",
    });
    await db.outbox.clear();

    await backfillOutboxFromLocalData();
    const rows = await db.outbox.where("kind").equals("claim").toArray();
    expect(rows).toHaveLength(1);
    expect(rows[0].recordId).toBe("claim_post_crossnode");
  });

  it("re-enqueues quorum removal records carrying a held co-signature", async () => {
    await connectThenForget(URL_A);
    const cosigner = await seedMember("Cosigner");
    const base = {
      removedKey: "pk_removed",
      reason: null,
      decidedAt: Date.now(),
      nodeId: NODE,
      proposalId: null,
    };
    await db.memberRemovals.put({
      ...base,
      id: "rm_ours",
      signatures: [{ signerKey: cosigner.publicKey, signature: "s1" }],
    });
    await db.memberRemovals.put({
      ...base,
      id: "rm_foreign",
      signatures: [{ signerKey: "pk_other_a", signature: "s2" }],
    });
    await db.outbox.clear();

    await backfillOutboxFromLocalData();
    const rows = await db.outbox
      .where("kind")
      .equals("member_removal")
      .toArray();
    expect(rows).toHaveLength(1);
    expect(rows[0].recordId).toBe("rm_ours");
  });
});

describe("maybeBackfillOutbox", () => {
  it("runs once per node URL, and re-arms for a different URL", async () => {
    await connectThenForget(URL_A);
    await seedPosts();
    await db.outbox.clear();

    await maybeBackfillOutbox(URL_A);
    expect(await db.outbox.count()).toBe(1);

    // Same URL again: the done flag short-circuits the walk.
    await db.outbox.clear();
    await maybeBackfillOutbox(URL_A);
    expect(await db.outbox.count()).toBe(0);

    // A DIFFERENT server (the production failure mode: the first
    // server was abandoned and the community moved): walk again.
    await writeSubmitConfig({ url: URL_B, enabled: true });
    expect(await db.outbox.count()).toBe(1);
  });

  it("ignores an empty / unusable URL", async () => {
    await seedPosts();
    await db.outbox.clear();
    await maybeBackfillOutbox("");
    expect(await db.outbox.count()).toBe(0);
  });
});
