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
import { uuid } from "@/lib/id";
import type { BlockRow, PreviouslyBlockedRow } from "@/types";

/**
 * Member-blocking data layer — see `docs/blocking.md` for the full
 * design. Every function in this module is LOCAL-ONLY (design doc §7):
 *
 *   - No call enqueues to the outbox. The `OutboxRow.kind` union in
 *     `database.ts` rejects the string `"block"` at the type level, and
 *     `lib/outbox.ts` deliberately does not expose an `enqueueBlock`
 *     helper. Both absences are load-bearing — see `blocks.test.ts`
 *     for the negative tests that lock this in.
 *   - No call federates. There is no `POST /blocks` route, no
 *     `pullFederatedBlocks` pull, no peer-pull cursor in
 *     `SETTING_KEYS`. The federation layer has no knowledge of these
 *     tables.
 *   - No call surfaces results outside the blocker's own session. All
 *     queries are scoped to a `blockerKey` the caller must supply
 *     explicitly; no helper here returns rows belonging to a different
 *     local member or to any peer-node member.
 *
 * Same discipline as `db/events.ts` `rsvpToEvent`. The shape mirrors
 * the local-only-upsert-that-never-enqueues pattern set by the
 * EventRsvpRow precedent.
 */

/** Maximum length of the per-block `note` field — see design doc §4.
 *  500 chars keeps the field a memory aid rather than a drafting
 *  surface for a longer accusation. */
export const BLOCK_NOTE_MAX_LENGTH = 500;

/**
 * Sentinel value for `PreviouslyBlockedRow.lastUnblockedAt` when a
 * history row exists because the pair has been blocked but never yet
 * unblocked (the "currently still blocked" case). Picked `0` rather
 * than `null` for two reasons:
 *
 *   1. The field is indexed (single-column `firstBlockedAt`, compound
 *      `[blockerKey+blockedKey]`); Dexie's IndexedDB-backed indexes
 *      handle a `number` sentinel more cleanly than `null` (no
 *      `IDBKeyRange` lower-bound surprises if a future query orders
 *      by `lastUnblockedAt` — `0` sorts first, `null` is treated as
 *      missing key).
 *   2. The `PreviouslyBlockedRow` shape in `apps/web/src/types/index.ts`
 *      declares `lastUnblockedAt: number` (not nullable). Picking `0`
 *      keeps the runtime shape inside the declared type without
 *      widening the API.
 *
 * The UI in PR E renders rows with `lastUnblockedAt === 0` as
 * "currently blocked" rather than "previously blocked, last unblocked
 * on …".
 */
export const NEVER_UNBLOCKED = 0;

export class BlockActionError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

/**
 * The single generic copy used by every consumer-side action that
 * rejects because of a block. Same byte-for-byte as the copy used by
 * `Post no longer available`, `Event not available`, and any other
 * not-found / not-available branch — see `docs/blocking.md` §6.1
 * "Generic-error discipline." Mirrors the en.json i18n key
 * `errors.generic.notAvailable`.
 *
 * IMPORTANT: any consumer-side gate that throws because of a block
 * MUST throw with this exact message. Surfacing a block-specific
 * message would let the blocked party fingerprint generic-error
 * responses (cancelled event vs. blocked-from-event), which is the
 * shadow-on-blocked-side decision (`no-read-receipts` + threat-model
 * §3 row 7). Keep this constant the single source of truth for the
 * action layer; the UI layer reads `errors.generic.notAvailable`.
 */
export const BLOCKED_ACTION_MESSAGE = "This isn't available right now.";

// -- Block ------------------------------------------------------------------

export interface BlockMemberInput {
  /** Base64-encoded Ed25519 public key of the local member creating
   *  the block. */
  blockerKey: string;
  /** Base64-encoded Ed25519 public key of the member being blocked. */
  blockedKey: string;
  /** Per-block opt-in: when `true`, the blocked party's proposals,
   *  votes, and dispute comments are also hidden from the blocker's
   *  view (design doc §3.2 + §6). */
  hideGovernance: boolean;
  /** Free-text private memory aid (≤ 500 chars); `null` if the blocker
   *  declined the optional prompt. Never surfaced outside the blocker's
   *  device. */
  note: string | null;
  /** Override the clock — tests inject a deterministic timestamp. */
  now?: number;
}

/**
 * Create a block for `[blockerKey, blockedKey]`. Idempotent on the
 * compound key: if an active block already exists for this pair, the
 * existing row is returned without creating a duplicate. To change
 * the per-block `hideGovernance` flag or `note` on an existing block,
 * call `updateBlockScope` — the lifecycle in design doc §5 forbids
 * mid-block mutation through the create path.
 *
 * First-time-block side effect: a `PreviouslyBlockedRow` is also
 * upserted for this pair. If a history row already exists (the pair
 * has been through a block-then-unblock cycle before), the row's
 * `firstBlockedAt` is left untouched per design doc §5 — the
 * timestamp is the EARLIEST block, stable across re-blocks. If no
 * history row exists yet, one is created with `firstBlockedAt = now`
 * and `lastUnblockedAt = NEVER_UNBLOCKED` (see the sentinel docstring).
 *
 * Rejects:
 *   - `blockerKey === blockedKey` (cannot block self).
 *   - `note` length > 500 chars.
 */
export async function blockMember(
  input: BlockMemberInput,
): Promise<BlockRow> {
  if (input.blockerKey === input.blockedKey) {
    throw new BlockActionError(
      "self_block",
      "A member cannot block themselves.",
    );
  }
  if (input.note !== null && input.note.length > BLOCK_NOTE_MAX_LENGTH) {
    throw new BlockActionError(
      "note_too_long",
      `Block note exceeds the ${BLOCK_NOTE_MAX_LENGTH}-character limit.`,
    );
  }

  const now = input.now ?? Date.now();

  return await db.transaction(
    "rw",
    [db.blocks, db.previouslyBlocked],
    async () => {
      const existing = await db.blocks
        .where("[blockerKey+blockedKey]")
        .equals([input.blockerKey, input.blockedKey])
        .first();
      if (existing) {
        // Idempotent: do not double-block, do not silently overwrite
        // hideGovernance / note (see updateBlockScope for that path).
        return existing;
      }

      const row: BlockRow = {
        id: uuid(),
        blockerKey: input.blockerKey,
        blockedKey: input.blockedKey,
        createdAt: now,
        hideGovernance: input.hideGovernance,
        note: input.note,
      };
      await db.blocks.put(row);

      // Create-or-preserve the history row. firstBlockedAt is stable
      // across re-block cycles per design doc §5; only the absence-of-row
      // case writes it.
      const history = await db.previouslyBlocked
        .where("[blockerKey+blockedKey]")
        .equals([input.blockerKey, input.blockedKey])
        .first();
      if (!history) {
        const historyRow: PreviouslyBlockedRow = {
          id: uuid(),
          blockerKey: input.blockerKey,
          blockedKey: input.blockedKey,
          firstBlockedAt: now,
          lastUnblockedAt: NEVER_UNBLOCKED,
        };
        await db.previouslyBlocked.put(historyRow);
      }
      // If a history row already exists, leave firstBlockedAt alone.
      // lastUnblockedAt holds the value from the previous unblock; it
      // is updated next time `unblockMember` runs.

      return row;
    },
  );
}

// -- Unblock ----------------------------------------------------------------

export interface UnblockMemberInput {
  blockerKey: string;
  blockedKey: string;
  /** Override the clock — tests inject a deterministic timestamp. */
  now?: number;
}

/**
 * Delete the active block for `[blockerKey, blockedKey]` and update
 * the matching `PreviouslyBlockedRow.lastUnblockedAt`. Idempotent —
 * calling on an already-unblocked pair is a no-op (does NOT throw).
 *
 * Edge case: if no history row exists yet (a possibility on an old
 * install that pre-dates this feature, or a race where the history
 * write was lost), one is synthesised with `firstBlockedAt = now`
 * AND `lastUnblockedAt = now` so the row exists for future reference.
 * The lost-precision of `firstBlockedAt` in that synthesised case is
 * acceptable — it's better than leaving the history row absent.
 */
export async function unblockMember(
  input: UnblockMemberInput,
): Promise<void> {
  const now = input.now ?? Date.now();

  await db.transaction(
    "rw",
    [db.blocks, db.previouslyBlocked],
    async () => {
      const active = await db.blocks
        .where("[blockerKey+blockedKey]")
        .equals([input.blockerKey, input.blockedKey])
        .first();
      if (active) {
        await db.blocks.delete(active.id);
      }
      // Note: we continue past the `!active` case so a stray history
      // row gets its `lastUnblockedAt` refreshed even if the active
      // block was already gone. This is the idempotent shape.

      const history = await db.previouslyBlocked
        .where("[blockerKey+blockedKey]")
        .equals([input.blockerKey, input.blockedKey])
        .first();
      if (history) {
        await db.previouslyBlocked.put({
          ...history,
          lastUnblockedAt: now,
        });
      } else if (active) {
        // No history row but there was an active block — synthesise a
        // history row so the unblock leaves a trace. See docstring.
        const historyRow: PreviouslyBlockedRow = {
          id: uuid(),
          blockerKey: input.blockerKey,
          blockedKey: input.blockedKey,
          firstBlockedAt: now,
          lastUnblockedAt: now,
        };
        await db.previouslyBlocked.put(historyRow);
      }
      // If neither active nor history existed, this was a true no-op
      // (caller asked to unblock a pair that was never blocked on this
      // device). Returning silently is the idempotent shape — the
      // caller's intent ("there should be no active block for this
      // pair") is already satisfied.
    },
  );
}

// -- Update scope -----------------------------------------------------------

export interface UpdateBlockScopeInput {
  blockerKey: string;
  blockedKey: string;
  hideGovernance: boolean;
  note: string | null;
}

/**
 * Update the per-block `hideGovernance` flag and `note` in place on
 * the active `BlockRow` for this pair. Throws if no active block
 * exists (the lifecycle in design doc §5 has no "edit a block that
 * isn't there" transition).
 *
 * Validates `note` length the same way `blockMember` does.
 */
export async function updateBlockScope(
  input: UpdateBlockScopeInput,
): Promise<BlockRow> {
  if (input.note !== null && input.note.length > BLOCK_NOTE_MAX_LENGTH) {
    throw new BlockActionError(
      "note_too_long",
      `Block note exceeds the ${BLOCK_NOTE_MAX_LENGTH}-character limit.`,
    );
  }

  return await db.transaction("rw", db.blocks, async () => {
    const existing = await db.blocks
      .where("[blockerKey+blockedKey]")
      .equals([input.blockerKey, input.blockedKey])
      .first();
    if (!existing) {
      throw new BlockActionError(
        "no_active_block",
        "No active block exists for this pair; call blockMember first.",
      );
    }
    const updated: BlockRow = {
      ...existing,
      hideGovernance: input.hideGovernance,
      note: input.note,
    };
    await db.blocks.put(updated);
    return updated;
  });
}

// -- Reads (gate checks) ----------------------------------------------------

/**
 * Compound-index point lookup. Returns `true` iff an active
 * `BlockRow` exists for `[blockerKey, blockedKey]`. Used by the
 * single-direction gate (e.g., "can A see B's posts?").
 */
export async function isBlocked(
  blockerKey: string,
  blockedKey: string,
): Promise<boolean> {
  const row = await db.blocks
    .where("[blockerKey+blockedKey]")
    .equals([blockerKey, blockedKey])
    .first();
  return !!row;
}

/**
 * Returns `true` if EITHER `isBlocked(memberA, memberB)` OR
 * `isBlocked(memberB, memberA)`.
 *
 * On peer nodes, the other party's `BlockRow` does not federate, so
 * in practice this function effectively only checks the LOCAL
 * member's own rows — the asymmetric "they blocked me but I didn't
 * block them" state is not visible locally because their `BlockRow`
 * never reaches this device. The "mutual" framing is the SEMANTIC
 * ("this interaction is gated for me"), not the implementation
 * ("both rows exist somewhere"). See design doc §13's notes on
 * `isMutuallyBlocked` for the rationale.
 *
 * Consumer surfaces in PR F call this rather than `isBlocked`
 * because the §6 gate is symmetric — if either side has blocked the
 * other locally, the interaction is suppressed.
 */
export async function isMutuallyBlocked(
  memberA: string,
  memberB: string,
): Promise<boolean> {
  const aBlocksB = await isBlocked(memberA, memberB);
  if (aBlocksB) return true;
  return await isBlocked(memberB, memberA);
}

// -- Reads (lists) ----------------------------------------------------------

/**
 * Active blocks for `blockerKey`, ordered by `createdAt` DESC
 * (most-recent first). Used by Settings → Blocked contacts in PR E.
 */
export async function listBlocks(
  blockerKey: string,
): Promise<BlockRow[]> {
  const rows = await db.blocks
    .where("blockerKey")
    .equals(blockerKey)
    .toArray();
  return rows.sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * History rows for `blockerKey`, ordered by `lastUnblockedAt` DESC
 * (most-recently-unblocked first). Used by Settings → Blocked
 * contacts → Previously blocked in PR E.
 *
 * Sorted in memory (not via an indexed `.reverse()`) because
 * `lastUnblockedAt` mutates on each unblock — Dexie's IndexedDB
 * cursor would still return the rows correctly, but the in-memory
 * sort keeps the read independent of any index re-tuning we may do
 * later.
 */
export async function listPreviouslyBlocked(
  blockerKey: string,
): Promise<PreviouslyBlockedRow[]> {
  const rows = await db.previouslyBlocked
    .where("blockerKey")
    .equals(blockerKey)
    .toArray();
  return rows.sort((a, b) => b.lastUnblockedAt - a.lastUnblockedAt);
}

/**
 * Bulk-read every active block for `blockerKey` and project the rows
 * down to the two shapes consumer code needs:
 *
 *   - `keys`: the set of `blockedKey` values the blocker has actively
 *     blocked. Use it for the cheap "is this member in my blocked set?"
 *     check that the PR F consumer filters (Board feed, Calendar event
 *     list, vouch rendering, attention items, etc.) all run.
 *   - `governance`: a Map from `blockedKey` → `hideGovernance` flag.
 *     Use it for the per-block opt-in branch (Dispute / Proposal
 *     comments, Proposal votes per `docs/blocking.md` §6) — the
 *     governance content is hidden iff the corresponding row's flag
 *     is `true`.
 *
 * Why a single helper rather than N `isMutuallyBlocked` point lookups
 * across a list render: the consumer surfaces typically walk hundreds
 * of rows (posts, vouches, events) and need to know "is this row's
 * subject in my blocked set?" The bulk read is one Dexie scan keyed
 * by `blockerKey`, projected into a Set + Map; the per-row lookup is
 * O(1) thereafter. The point-lookup shape (`isMutuallyBlocked`) is
 * still the right call inside action handlers, where exactly one
 * direction is being checked against exactly one candidate.
 *
 * Local-only — consumes only this member's own Block rows. The
 * function name uses `blockerKey` (not `memberKey`) to keep the local
 * blocker / local action framing explicit: the only Block rows that
 * exist on this device are ones the local member created (see design
 * doc §13 on the `isMutuallyBlocked` naming rationale).
 */
export async function blockedFilter(
  blockerKey: string,
): Promise<{ keys: Set<string>; governance: Map<string, boolean> }> {
  const rows = await db.blocks
    .where("blockerKey")
    .equals(blockerKey)
    .toArray();
  const keys = new Set<string>();
  const governance = new Map<string, boolean>();
  for (const row of rows) {
    keys.add(row.blockedKey);
    governance.set(row.blockedKey, row.hideGovernance);
  }
  return { keys, governance };
}

/**
 * Delete every history row whose `blockerKey === blockerKey`. Scoped
 * to the calling member — other local members' history rows on the
 * same device (e.g., on a paired-device cluster shared between
 * household members) are NOT touched. Wired up to the Settings →
 * "Clear unblocked history" button in PR E. Settled decision per
 * design doc §14.1 — single affordance, clears the whole list, not
 * per-row.
 */
export async function clearPreviouslyBlocked(
  blockerKey: string,
): Promise<void> {
  await db.previouslyBlocked
    .where("blockerKey")
    .equals(blockerKey)
    .delete();
}
