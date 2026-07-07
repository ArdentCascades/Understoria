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
import { db } from "@/db/database";

/**
 * The community snapshot — the shared-state slice of the source
 * device's database, carried INSIDE the sealed transfer envelope so a
 * linked device looks like the device it came from, immediately.
 *
 * Why this exists: federation sync can only deliver what the
 * community node holds, and several record kinds never reach the
 * node at all — projects, tasks, proposals, votes, RSVPs are
 * local-only by design, and posts only exist on the node when each
 * posting device had mirroring enabled. A linked device relying on
 * sync alone therefore arrives near-empty. The snapshot closes that
 * gap; sync remains the ongoing top-up for records that DO federate.
 *
 * What is deliberately NOT here:
 *   - secretKeys      — only the member's own identity rides the
 *                       payload's dedicated fields, never the table
 *   - messages        — E2E-encrypted to each device's keys
 *   - drafts, outbox, settings, pairingLog, achievements — per-device
 *   - invites         — live credentials; deliberately never leave
 *                       the issuing device (invite-redemption §10.1)
 *   - blocks / previouslyBlocked — already carried by the payload's
 *                       dedicated fields with their own merge rules
 *
 * Rows travel VERBATIM (they are the member's own local rows, sealed
 * end-to-end to the member's own new device — the same trust posture
 * as the identity key riding alongside).
 */

/** Tables included, in apply order (referential parents first). All
 *  keyed by their Dexie primary key; rows are opaque here. */
export const SNAPSHOT_TABLES = [
  "members",
  "nodeConfig",
  "posts",
  "exchanges",
  "vouches",
  "projects",
  "projectTasks",
  "projectActivity",
  "taskComments",
  "proposals",
  "votes",
  "events",
  "eventRsvps",
  "eventCancellations",
  "eventProjectLinks",
  "eventShifts",
  "shiftSignups",
  "coorgInvitations",
  "coorgInvitationResponses",
  "coorgInvitationRevocations",
  // Re-seed Phase R0 (docs/community-reseed.md §1b): the signed
  // membership artifacts ride the transfer so a linked device is
  // just as capable of re-seeding a fresh node as the source.
  "redemptionReceipts",
  "inviteRevocationRecords",
] as const;

export type SnapshotTable = (typeof SNAPSHOT_TABLES)[number];

export type CommunitySnapshot = Partial<
  Record<SnapshotTable, Record<string, unknown>[]>
>;

/** Per-table row ceiling. Pilot communities are far below this; it
 *  exists so a pathological table can't blow the envelope size. */
const MAX_ROWS_PER_TABLE = 800;

/** Serialized-size ceiling for the whole snapshot. Above this we
 *  degrade to identity-only rather than fail the transfer — the
 *  envelope has to fit the relay's body cap with sealing overhead. */
export const MAX_SNAPSHOT_CHARS = 320_000;

/**
 * Read the shared-state slice of the local database. Returns null
 * when the result would exceed MAX_SNAPSHOT_CHARS even after
 * dropping to reduced row caps — the caller sends identity-only and
 * lets federation sync do what it can.
 */
export async function buildCommunitySnapshot(): Promise<CommunitySnapshot | null> {
  for (const cap of [MAX_ROWS_PER_TABLE, 200, 50]) {
    const snapshot: CommunitySnapshot = {};
    for (const table of SNAPSHOT_TABLES) {
      const rows = (await db
        .table(table)
        .limit(cap)
        .toArray()) as Record<string, unknown>[];
      if (rows.length > 0) snapshot[table] = rows;
    }
    if (JSON.stringify(snapshot).length <= MAX_SNAPSHOT_CHARS) {
      return snapshot;
    }
  }
  return null;
}

/**
 * Apply a snapshot to the local database — FRESH DEVICES ONLY. The
 * guard: more than one member row means this device already has a
 * community life of its own, and bulk-putting the source's (older)
 * rows over it could regress newer local state. A just-linked device
 * has exactly the one member row the import wrote.
 *
 * Within that guard, rows are put verbatim — including the member's
 * own row, which the source's copy of is RICHER than the stub the
 * import created (real createdAt, seed balance, vouches).
 *
 * Returns whether the snapshot was applied.
 */
export async function applyCommunitySnapshot(
  snapshot: CommunitySnapshot,
): Promise<boolean> {
  const memberCount = await db.members.count();
  if (memberCount > 1) return false;

  for (const table of SNAPSHOT_TABLES) {
    const rows = snapshot[table];
    if (!Array.isArray(rows) || rows.length === 0) continue;
    const clean = rows.filter(
      (r): r is Record<string, unknown> => typeof r === "object" && r !== null,
    );
    if (clean.length === 0) continue;
    try {
      await db.table(table).bulkPut(clean);
    } catch {
      // A malformed row in one table must not sink the rest — this
      // is best-effort hydration on top of a complete identity
      // import; federation sync tops up whatever failed.
    }
  }
  return true;
}
