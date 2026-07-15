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
