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
import { db } from "./database";

// Per-form draft autosave. One row per form (keyed by a stable string
// the caller chooses, e.g. "post-new"). Payload is opaque to the
// store — the form serializes its own field shape and revives it on
// restore. Stale drafts (older than MAX_AGE_MS) are pruned lazily
// on read; no background sweep is needed for v1.
//
// Why payload is a string: we never query inside it, JSON-stringify
// keeps the table tiny + portable, and a future export/import would
// round-trip cleanly.

/** Drafts older than this are silently dropped on read. 7 days felt
 *  generous enough that an interrupted user can come back a week
 *  later, but short enough that abandoned drafts don't pile up. */
export const DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export interface Draft<T> {
  payload: T;
  updatedAt: number;
}

export async function saveDraft<T>(key: string, payload: T): Promise<void> {
  await db.drafts.put({
    key,
    payload: JSON.stringify(payload),
    updatedAt: Date.now(),
  });
}

/** Loads the draft for `key`, or `null` if none exists or it's older
 *  than `DRAFT_MAX_AGE_MS`. Expired rows are deleted as a side
 *  effect — keeps the table from accumulating zombies. */
export async function loadDraft<T>(
  key: string,
  now: number = Date.now(),
): Promise<Draft<T> | null> {
  const row = await db.drafts.get(key);
  if (!row) return null;
  if (now - row.updatedAt > DRAFT_MAX_AGE_MS) {
    await db.drafts.delete(key);
    return null;
  }
  try {
    return {
      payload: JSON.parse(row.payload) as T,
      updatedAt: row.updatedAt,
    };
  } catch {
    // Corrupt JSON shouldn't be possible from our own saveDraft,
    // but if the row gets mangled (manual IDB edit, schema drift),
    // drop it so the form falls back to defaults rather than
    // crashing on parse.
    await db.drafts.delete(key);
    return null;
  }
}

export async function clearDraft(key: string): Promise<void> {
  await db.drafts.delete(key);
}

/** One-shot purge of every draft older than `DRAFT_MAX_AGE_MS`.
 *  Returns the number of rows deleted. Not called from anywhere
 *  in v1; provided for a future app-init sweep if drafts ever
 *  accumulate beyond what lazy pruning handles. */
export async function purgeExpiredDrafts(
  now: number = Date.now(),
): Promise<number> {
  const cutoff = now - DRAFT_MAX_AGE_MS;
  return db.drafts.where("updatedAt").below(cutoff).delete();
}
