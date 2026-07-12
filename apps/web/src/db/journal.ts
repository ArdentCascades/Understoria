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
import { db, type JournalEntryRow } from "@/db/database";
import { uuid } from "@/lib/id";

/**
 * The pilot journal — the only module that reads or writes
 * `db.journalEntries`. A no-telemetry app has no built-in way to
 * gather the "pilot signal" the roadmap waits on; this is the answer
 * that keeps the ethos intact: the member writes local notes, and the
 * HAND-OFF is the consent ceremony. There is deliberately no send
 * button. See `docs/next-cycle-plans.md` Plan 3 §3.3.
 *
 * Contract (locked by journal.test.ts):
 *
 * - LOCAL-ONLY. Nothing here enqueues to the outbox, and the
 *   `OutboxRow.kind` union rejects `"journal_entry"` at the type
 *   level. Never rides the pairing snapshot; cleared whole by soft
 *   purge. It IS in the member's own data export (their writing) —
 *   the one place the pattern differs from `taskPlans`.
 *
 * - `memberKey` names the author. On a shared device a member sees
 *   only their own entries; a delete only touches their own row.
 *
 * - No prompts, streaks, or reminders (`no-notifications`). The
 *   doorway is pull-only — a quiet Help-page line.
 */

export const MAX_ENTRY_LENGTH = 2000;
/** A generous per-device cap so a runaway paste can't fill the disk
 *  (the whole journal is tiny free text; 500 notes is a long pilot). */
export const MAX_ENTRIES = 500;

/** The caller's own entries, newest first. Rows authored by someone
 *  else (a shared device that changed hands) are not returned. */
export async function listJournalEntries(
  memberKey: string,
): Promise<JournalEntryRow[]> {
  const rows = await db.journalEntries
    .where("memberKey")
    .equals(memberKey)
    .toArray();
  return rows.sort((a, b) => b.createdAt - a.createdAt);
}

/** Append an entry. Trims + caps length, refuses empty, and refuses
 *  once the member is at `MAX_ENTRIES` (returns null in both refusal
 *  cases). */
export async function addJournalEntry(
  memberKey: string,
  text: string,
  now: number = Date.now(),
): Promise<JournalEntryRow | null> {
  const trimmed = text.trim().slice(0, MAX_ENTRY_LENGTH);
  if (!trimmed) return null;
  return db.transaction("rw", db.journalEntries, async () => {
    const count = await db.journalEntries
      .where("memberKey")
      .equals(memberKey)
      .count();
    if (count >= MAX_ENTRIES) return null;
    const entry: JournalEntryRow = {
      id: uuid(),
      memberKey,
      text: trimmed,
      createdAt: now,
    };
    await db.journalEntries.add(entry);
    return entry;
  });
}

/** Delete one of the caller's own entries. A row authored by someone
 *  else is left untouched (never deletes another member's writing on a
 *  shared device). */
export async function deleteJournalEntry(
  id: string,
  memberKey: string,
): Promise<void> {
  await db.transaction("rw", db.journalEntries, async () => {
    const row = await db.journalEntries.get(id);
    if (!row || row.memberKey !== memberKey) return;
    await db.journalEntries.delete(id);
  });
}

/**
 * Compose the caller's entries into the plain-text file the member
 * hands to the operator (the "Share my journal" download). Oldest
 * first — it reads as a diary. Deterministic given the entries and the
 * locale, so tests can assert it; the caller passes a stable date
 * formatter (or none, for the ISO default).
 */
export function composeJournalText(
  entries: JournalEntryRow[],
  formatTimestamp: (ms: number) => string = (ms) =>
    new Date(ms).toISOString(),
): string {
  const ordered = [...entries].sort((a, b) => a.createdAt - b.createdAt);
  const header = "Understoria pilot journal\n\n";
  if (ordered.length === 0) {
    return `${header}(no entries)\n`;
  }
  const body = ordered
    .map((e) => `— ${formatTimestamp(e.createdAt)}\n${e.text}\n`)
    .join("\n");
  return `${header}${body}`;
}
