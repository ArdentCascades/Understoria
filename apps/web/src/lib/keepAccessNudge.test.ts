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
  dismissKeepAccessNudge,
  isKeepAccessNudgeDismissed,
  memberHasPairedDevice,
} from "./keepAccessNudge";
import { recordPairing } from "@/db/pairing";
import { db, SETTING_KEYS } from "@/db/database";

describe("memberHasPairedDevice", () => {
  beforeEach(async () => {
    await db.pairingLog.clear();
  });

  it("is false with an empty pairing log", async () => {
    expect(await memberHasPairedDevice()).toBe(false);
  });

  it("is true after a source pairing is recorded", async () => {
    await recordPairing({ kind: "source", label: "Aunt's laptop" });
    expect(await memberHasPairedDevice()).toBe(true);
  });

  it("is true after a destination pairing is recorded", async () => {
    // Either direction proves a second copy of the account exists, so
    // the reassurance nudge has done its job and should retire.
    await recordPairing({ kind: "destination", label: "work phone" });
    expect(await memberHasPairedDevice()).toBe(true);
  });
});

describe("dismissKeepAccessNudge / isKeepAccessNudgeDismissed", () => {
  beforeEach(async () => {
    await db.settings.delete(SETTING_KEYS.keepAccessNudgeDismissed);
  });

  it("starts undismissed", async () => {
    expect(await isKeepAccessNudgeDismissed()).toBe(false);
  });

  it("returns true after dismiss is called", async () => {
    await dismissKeepAccessNudge();
    expect(await isKeepAccessNudgeDismissed()).toBe(true);
  });

  it("persists the sentinel literally — non-'1' values do not count as dismissed", async () => {
    await db.settings.put({
      key: SETTING_KEYS.keepAccessNudgeDismissed,
      value: "yes",
    });
    expect(await isKeepAccessNudgeDismissed()).toBe(false);
  });

  it("persists across reads — once dismissed, stays dismissed in the same session", async () => {
    await dismissKeepAccessNudge();
    expect(await isKeepAccessNudgeDismissed()).toBe(true);
    // Second read — still dismissed (the row was actually written,
    // not cached in memory).
    expect(await isKeepAccessNudgeDismissed()).toBe(true);
  });
});
