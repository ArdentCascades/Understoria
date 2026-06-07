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
import { beforeEach, describe, expect, it } from "vitest";
import { db, getSetting, SETTING_KEYS } from "./database";
import { createMember } from "./seed";
import {
  backfillOnboardedForExistingUsers,
  isOnboarded,
  markOnboarded,
} from "./onboarding";

const NODE = "node_onboarding_test";

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
    db.projects.clear(),
    db.projectTasks.clear(),
    db.projectActivity.clear(),
  ]);
}

describe("isOnboarded", () => {
  beforeEach(reset);

  it("returns false when the setting is unset", async () => {
    expect(await isOnboarded()).toBe(false);
  });

  it("returns true after markOnboarded", async () => {
    await markOnboarded();
    expect(await isOnboarded()).toBe(true);
  });

  it("only treats the exact stored sentinel as onboarded", async () => {
    await db.settings.put({ key: SETTING_KEYS.onboarded, value: "yes" });
    expect(await isOnboarded()).toBe(false);
  });
});

describe("markOnboarded", () => {
  beforeEach(reset);

  it("writes the onboarded setting", async () => {
    await markOnboarded();
    expect(await getSetting(SETTING_KEYS.onboarded)).toBe("1");
  });

  it("is idempotent", async () => {
    await markOnboarded();
    await markOnboarded();
    expect(await isOnboarded()).toBe(true);
  });
});

describe("backfillOnboardedForExistingUsers", () => {
  beforeEach(reset);

  it("does nothing on a fresh install (no members, no setting)", async () => {
    await backfillOnboardedForExistingUsers();
    expect(await isOnboarded()).toBe(false);
  });

  it("does NOT mark onboarded when only a member row exists — the freshly-invited case", async () => {
    // This is the regression: invite acceptance creates a member row
    // BEFORE the welcome flow runs. The backfill must not pre-empt
    // welcome on the basis of a member existing alone.
    await createMember({ displayName: "Just Invited" }, NODE);
    await backfillOnboardedForExistingUsers();
    expect(await isOnboarded()).toBe(false);
  });

  it("marks onboarded when a local member has authored an exchange", async () => {
    const m = await createMember({ displayName: "Helper" }, NODE);
    await db.exchanges.put({
      id: "ex_1",
      postId: "p_1",
      helperKey: m.publicKey,
      helpedKey: "other",
      hoursExchanged: 1,
      helperSignature: "sig",
      helpedSignature: "sig",
      completedAt: 0,
      category: "other",
      nodeId: NODE,
    });
    await backfillOnboardedForExistingUsers();
    expect(await isOnboarded()).toBe(true);
  });

  it("marks onboarded when a local member was the helped party", async () => {
    const m = await createMember({ displayName: "Helped" }, NODE);
    await db.exchanges.put({
      id: "ex_2",
      postId: "p_2",
      helperKey: "other",
      helpedKey: m.publicKey,
      hoursExchanged: 1,
      helperSignature: "sig",
      helpedSignature: "sig",
      completedAt: 0,
      category: "other",
      nodeId: NODE,
    });
    await backfillOnboardedForExistingUsers();
    expect(await isOnboarded()).toBe(true);
  });

  it("marks onboarded when a local member has authored a vouch", async () => {
    const m = await createMember({ displayName: "Voucher" }, NODE);
    await db.vouches.put({
      id: "v_1",
      voucherKey: m.publicKey,
      voucheeKey: "other",
      createdAt: 0,
      kind: "manual",
      signature: "sig",
    });
    await backfillOnboardedForExistingUsers();
    expect(await isOnboarded()).toBe(true);
  });

  it("marks onboarded when a local member has authored a post", async () => {
    const m = await createMember({ displayName: "Poster" }, NODE);
    await db.posts.put({
      id: "p_1",
      type: "NEED",
      category: "other",
      title: "x",
      description: "",
      estimatedHours: 1,
      urgency: "low",
      postedBy: m.publicKey,
      claimedBy: null,
      status: "open",
      createdAt: 0,
      expiresAt: null,
      locationZone: "",
      confirmedBy: [],
      nodeId: NODE,
      signature: "",
    });
    await backfillOnboardedForExistingUsers();
    expect(await isOnboarded()).toBe(true);
  });

  it("does NOT mark onboarded when only federated (non-local-authored) records exist", async () => {
    // Federation pull can drop peer-node records into the local store
    // immediately after invite acceptance. Those don't prove the local
    // member has used the app yet — welcome still has work to do.
    const m = await createMember({ displayName: "Fresh" }, NODE);
    await db.exchanges.put({
      id: "ex_peer",
      postId: "p_peer",
      helperKey: "peer_helper",
      helpedKey: "peer_helped",
      hoursExchanged: 2,
      helperSignature: "sig",
      helpedSignature: "sig",
      completedAt: 0,
      category: "other",
      nodeId: "peer_node",
    });
    await backfillOnboardedForExistingUsers();
    expect(await isOnboarded()).toBe(false);
    // Sanity: the freshly-invited member is still in the store, the
    // skipped backfill didn't delete them.
    expect(await db.members.get(m.publicKey)).toBeDefined();
  });

  it("leaves an already-onboarded device alone", async () => {
    await markOnboarded();
    await createMember({ displayName: "M" }, NODE);
    await backfillOnboardedForExistingUsers();
    expect(await isOnboarded()).toBe(true);
  });
});
