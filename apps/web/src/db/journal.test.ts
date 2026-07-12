/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { beforeEach, describe, expect, it } from "vitest";
import { db, type OutboxRow } from "@/db/database";
import {
  MAX_ENTRIES,
  MAX_ENTRY_LENGTH,
  addJournalEntry,
  composeJournalText,
  deleteJournalEntry,
  listJournalEntries,
} from "./journal";
import { EXPORT_EXCLUDED_TABLES, buildExportBundle } from "@/lib/exportData";
import { SNAPSHOT_TABLES } from "@/lib/communitySnapshot";
import { softPurge } from "@/lib/panic";

// The pilot journal (db/journal.ts) — the member's own local feedback
// notes for a no-telemetry pilot. Two halves under test: the CRUD +
// hand-off contract, and the privacy posture (local-only: no outbox
// kind, never in the pairing snapshot, cleared by soft purge — but
// DOES appear in the member's own export, the one axis where it
// differs from taskPlans).

const ME = "member-me";
const OTHER = "member-other";

beforeEach(async () => {
  await Promise.all(db.tables.map((t) => t.clear()));
});

describe("journal — entries", () => {
  it("adds and lists an entry, newest first", async () => {
    await addJournalEntry(ME, "first note", 1000);
    await addJournalEntry(ME, "second note", 2000);
    const entries = await listJournalEntries(ME);
    expect(entries.map((e) => e.text)).toEqual(["second note", "first note"]);
  });

  it("trims and drops an empty entry", async () => {
    expect(await addJournalEntry(ME, "   ")).toBeNull();
    const saved = await addJournalEntry(ME, "  padded  ");
    expect(saved?.text).toBe("padded");
    expect(await listJournalEntries(ME)).toHaveLength(1);
  });

  it("caps entry length", async () => {
    const saved = await addJournalEntry(ME, "x".repeat(MAX_ENTRY_LENGTH + 50));
    expect(saved?.text.length).toBe(MAX_ENTRY_LENGTH);
  });

  it("refuses new entries past the per-device cap", async () => {
    for (let i = 0; i < MAX_ENTRIES; i++) {
      await addJournalEntry(ME, `note ${i}`, i + 1);
    }
    expect(await addJournalEntry(ME, "one too many")).toBeNull();
    expect(await listJournalEntries(ME)).toHaveLength(MAX_ENTRIES);
  });
});

describe("journal — ownership", () => {
  it("shows a member only their own entries", async () => {
    await addJournalEntry(ME, "mine");
    await addJournalEntry(OTHER, "theirs");
    const mine = await listJournalEntries(ME);
    expect(mine.map((e) => e.text)).toEqual(["mine"]);
  });

  it("deletes only the caller's own entry", async () => {
    const mine = await addJournalEntry(ME, "mine");
    const theirs = await addJournalEntry(OTHER, "theirs");
    // A member cannot delete another member's row on a shared device.
    await deleteJournalEntry(theirs!.id, ME);
    expect(await db.journalEntries.get(theirs!.id)).toBeTruthy();
    await deleteJournalEntry(mine!.id, ME);
    expect(await db.journalEntries.get(mine!.id)).toBeUndefined();
  });
});

describe("journal — hand-off text", () => {
  it("composes entries oldest-first with a header", () => {
    const text = composeJournalText(
      [
        { id: "b", memberKey: ME, text: "second", createdAt: 2000 },
        { id: "a", memberKey: ME, text: "first", createdAt: 1000 },
      ],
      (ms) => `T${ms}`,
    );
    expect(text).toContain("Understoria pilot journal");
    expect(text.indexOf("first")).toBeLessThan(text.indexOf("second"));
    expect(text).toContain("T1000");
  });

  it("handles an empty journal", () => {
    expect(composeJournalText([])).toContain("(no entries)");
  });
});

describe("journal — privacy posture", () => {
  it("has no outbox kind (type-level lock)", () => {
    const row: OutboxRow = {
      id: "o1",
      // @ts-expect-error — "journal_entry" is deliberately NOT an outbox
      // kind: pilot notes never federate (see database.ts).
      kind: "journal_entry",
      payload: "{}",
      recordId: "j1",
      createdAt: 0,
      attempts: 0,
      nextAttemptAt: 0,
      status: "pending",
    };
    expect(row.recordId).toBe("j1");
  });

  it("does not ride the device-pairing community snapshot", () => {
    expect(SNAPSHOT_TABLES).not.toContain("journalEntries");
  });

  it("IS included in the member's own data export (their writing)", async () => {
    expect(EXPORT_EXCLUDED_TABLES).not.toContain("journalEntries");
    await addJournalEntry(ME, "keep this in my backup");
    const bundle = await buildExportBundle();
    expect(bundle.data.journalEntries).toBeDefined();
    expect(
      (bundle.data.journalEntries as { text: string }[])[0].text,
    ).toBe("keep this in my backup");
  });

  it("is cleared whole by soft purge", async () => {
    await addJournalEntry(ME, "sensitive pilot note");
    const result = await softPurge();
    expect(result.tablesTouched).toContain("journalEntries");
    expect(await db.journalEntries.count()).toBe(0);
  });
});
