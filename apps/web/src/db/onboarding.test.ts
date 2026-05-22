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

  it("marks the device as onboarded if any members already exist", async () => {
    await createMember({ displayName: "Existing" }, NODE);
    await backfillOnboardedForExistingUsers();
    expect(await isOnboarded()).toBe(true);
  });

  it("leaves an already-onboarded device alone", async () => {
    await markOnboarded();
    await createMember({ displayName: "M" }, NODE);
    await backfillOnboardedForExistingUsers();
    expect(await isOnboarded()).toBe(true);
  });
});
