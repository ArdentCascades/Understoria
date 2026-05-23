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
import {
  dismissFirstActionNudge,
  isFirstActionNudgeDismissed,
  memberHasTakenFirstAction,
} from "./firstActionNudge";
import { db, SETTING_KEYS } from "@/db/database";
import type { Post } from "@/types";

const ME = "me-key";
const OTHER = "other-key";

function buildPost(overrides: Partial<Post> = {}): Post {
  return {
    id: "post-1",
    nodeId: "node-1",
    type: "NEED",
    category: "other",
    title: "Sample",
    description: "",
    estimatedHours: 1,
    urgency: "low",
    postedBy: OTHER,
    claimedBy: null,
    status: "open",
    confirmedBy: [],
    createdAt: 0,
    expiresAt: null,
    locationZone: "",
    signature: "",
    ...overrides,
  };
}

describe("memberHasTakenFirstAction", () => {
  it("is false when posts is empty", () => {
    expect(memberHasTakenFirstAction(ME, [])).toBe(false);
  });

  it("is false when no post involves this member", () => {
    expect(
      memberHasTakenFirstAction(ME, [buildPost({ postedBy: OTHER })]),
    ).toBe(false);
  });

  it("is true when this member posted something", () => {
    expect(
      memberHasTakenFirstAction(ME, [buildPost({ postedBy: ME })]),
    ).toBe(true);
  });

  it("is true when this member claimed someone else's post", () => {
    expect(
      memberHasTakenFirstAction(ME, [
        buildPost({ postedBy: OTHER, claimedBy: ME }),
      ]),
    ).toBe(true);
  });

  it("ignores posts unrelated to this member even if claimer is set", () => {
    expect(
      memberHasTakenFirstAction(ME, [
        buildPost({ postedBy: OTHER, claimedBy: OTHER }),
      ]),
    ).toBe(false);
  });
});

describe("dismissFirstActionNudge / isFirstActionNudgeDismissed", () => {
  beforeEach(async () => {
    await db.settings.delete(SETTING_KEYS.firstActionNudgeDismissed);
  });

  it("starts undismissed", async () => {
    expect(await isFirstActionNudgeDismissed()).toBe(false);
  });

  it("returns true after dismiss is called", async () => {
    await dismissFirstActionNudge();
    expect(await isFirstActionNudgeDismissed()).toBe(true);
  });

  it("only treats the exact sentinel as dismissed", async () => {
    await db.settings.put({
      key: SETTING_KEYS.firstActionNudgeDismissed,
      value: "yes",
    });
    expect(await isFirstActionNudgeDismissed()).toBe(false);
  });
});
