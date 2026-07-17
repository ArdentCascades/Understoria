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
import { describe, expect, it } from "vitest";
import { db } from "@/db/database";
import { softPurge, SOFT_PURGE_CLASSIFICATION } from "./panic";

// THE PURGE-COVERAGE GUARD (voice workstream V6, issue #476).
//
// Any Dexie table that exists must have an explicit soft-purge
// decision in SOFT_PURGE_CLASSIFICATION — and the decision must match
// what softPurge actually does. This is the CI contract that makes
// "added a store, forgot the purge" impossible: the exact failure
// mode that once let ten tables (direct messages included) silently
// survive the emergency wipe.

describe("purge coverage contract", () => {
  const liveTables = db.tables.map((t) => t.name).sort();
  const classified = Object.keys(SOFT_PURGE_CLASSIFICATION).sort();

  it("every Dexie table has a soft-purge classification", () => {
    const missing = liveTables.filter(
      (name) => !(name in SOFT_PURGE_CLASSIFICATION),
    );
    expect(
      missing,
      `New table(s) without a purge decision: ${missing.join(", ")}. ` +
        "Decide scrubbed/cleared/preserved, implement it in softPurge " +
        "(lib/panic.ts), and add the entry to SOFT_PURGE_CLASSIFICATION.",
    ).toEqual([]);
  });

  it("no stale classification entries for tables that no longer exist", () => {
    const stale = classified.filter((name) => !liveTables.includes(name));
    expect(
      stale,
      `Classification entries without a live table: ${stale.join(", ")}. ` +
        "Remove or rename them in SOFT_PURGE_CLASSIFICATION.",
    ).toEqual([]);
  });

  it("softPurge actually touches exactly the scrubbed + cleared tables", async () => {
    const result = await softPurge();
    const expected = classified
      .filter((name) => SOFT_PURGE_CLASSIFICATION[name] !== "preserved")
      .sort();
    expect([...result.tablesTouched].sort()).toEqual(expected);
  });
});
