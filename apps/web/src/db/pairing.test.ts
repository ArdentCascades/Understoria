/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "./database";
import { listPairings, recordPairing } from "./pairing";

async function reset() {
  await db.pairingLog.clear();
}

describe("recordPairing", () => {
  beforeEach(reset);

  it("writes a row with the given kind, label, and completedAt", async () => {
    const row = await recordPairing({
      kind: "source",
      label: "Aunt's laptop",
      completedAt: 1_700_000_000_000,
    });
    expect(row.kind).toBe("source");
    expect(row.label).toBe("Aunt's laptop");
    expect(row.completedAt).toBe(1_700_000_000_000);
    expect(row.id).toBeTruthy();
  });

  it("defaults completedAt to Date.now()-shaped", async () => {
    const before = Date.now();
    const row = await recordPairing({ kind: "destination", label: "" });
    const after = Date.now();
    // Within 1s either way of test invocation.
    expect(row.completedAt).toBeGreaterThanOrEqual(before - 1000);
    expect(row.completedAt).toBeLessThanOrEqual(after + 1000);
  });

  it("preserves an empty-string label without coercion", async () => {
    const row = await recordPairing({ kind: "source", label: "" });
    expect(row.label).toBe("");
    // Round-trip: the stored row matches what we wrote — empty
    // string survives Dexie's serialization, not turned into null
    // or undefined by the IndexedDB layer.
    const fetched = await db.pairingLog.get(row.id);
    expect(fetched?.label).toBe("");
  });

  it("round-trips stable identity via db.pairingLog.get(id)", async () => {
    const a = await recordPairing({ kind: "source", label: "phone" });
    const b = await recordPairing({ kind: "destination", label: "laptop" });
    const fetchedA = await db.pairingLog.get(a.id);
    const fetchedB = await db.pairingLog.get(b.id);
    expect(fetchedA).toEqual(a);
    expect(fetchedB).toEqual(b);
    expect(a.id).not.toBe(b.id);
  });
});

describe("listPairings", () => {
  beforeEach(reset);

  it("returns entries sorted by completedAt DESC", async () => {
    await recordPairing({
      kind: "source",
      label: "oldest",
      completedAt: 1000,
    });
    await recordPairing({
      kind: "destination",
      label: "newest",
      completedAt: 3000,
    });
    await recordPairing({
      kind: "source",
      label: "middle",
      completedAt: 2000,
    });
    const rows = await listPairings();
    expect(rows.map((r) => r.label)).toEqual(["newest", "middle", "oldest"]);
  });

  it("returns an empty array when nothing has been recorded", async () => {
    expect(await listPairings()).toEqual([]);
  });
});
