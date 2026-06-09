/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  BlockActionError,
  NEVER_UNBLOCKED,
  blockMember,
  clearPreviouslyBlocked,
  isBlocked,
  isMutuallyBlocked,
  listBlocks,
  listPreviouslyBlocked,
  unblockMember,
  updateBlockScope,
} from "./blocks";
import { db } from "./database";

async function reset() {
  await Promise.all([
    db.blocks.clear(),
    db.previouslyBlocked.clear(),
    db.outbox.clear(),
    db.settings.clear(),
  ]);
}

// Stable key fixtures — the production code never inspects key shape,
// it's a string-keyed compound index. We use readable test labels.
const ALICE = "alice_pubkey_b64";
const BOB = "bob_pubkey_b64";
const CAROL = "carol_pubkey_b64";

// --------------------------------------------------------------------------
// Type-level negative tests — the runtime mirror of the PR B compile-time
// lock. The OutboxRow.kind union does not include "block".
// --------------------------------------------------------------------------

describe("OutboxRow.kind type-level negatives (block)", () => {
  it('rejects "block" as an OutboxRow kind at the type level', () => {
    type OutboxKind = import("./database").OutboxRow["kind"];
    // @ts-expect-error — "block" must not be assignable to the union.
    const _bad: OutboxKind = "block";
    void _bad;
  });

  it("has no `enqueueBlock` helper exported from lib/outbox", async () => {
    const outbox = await import("@/lib/outbox");
    expect(
      (outbox as unknown as Record<string, unknown>).enqueueBlock,
    ).toBeUndefined();
  });
});

// --------------------------------------------------------------------------
// blockMember
// --------------------------------------------------------------------------

describe("blockMember", () => {
  beforeEach(reset);

  it("creates a BlockRow and a matching PreviouslyBlockedRow with firstBlockedAt = createdAt", async () => {
    const row = await blockMember({
      blockerKey: ALICE,
      blockedKey: BOB,
      hideGovernance: false,
      note: null,
      now: 1_000_000,
    });
    expect(row.blockerKey).toBe(ALICE);
    expect(row.blockedKey).toBe(BOB);
    expect(row.createdAt).toBe(1_000_000);
    expect(row.hideGovernance).toBe(false);
    expect(row.note).toBeNull();

    const stored = await db.blocks.get(row.id);
    expect(stored).toBeDefined();
    expect(stored?.id).toBe(row.id);

    const history = await db.previouslyBlocked
      .where("[blockerKey+blockedKey]")
      .equals([ALICE, BOB])
      .first();
    expect(history).toBeDefined();
    expect(history?.firstBlockedAt).toBe(1_000_000);
    expect(history?.lastUnblockedAt).toBe(NEVER_UNBLOCKED);
  });

  it("is idempotent on [blockerKey+blockedKey] — second call returns the existing row without creating a duplicate", async () => {
    const first = await blockMember({
      blockerKey: ALICE,
      blockedKey: BOB,
      hideGovernance: false,
      note: null,
      now: 1_000,
    });
    const second = await blockMember({
      blockerKey: ALICE,
      blockedKey: BOB,
      // Different values — they should be IGNORED on the idempotent path;
      // updateBlockScope is the right path to change scope.
      hideGovernance: true,
      note: "second attempt note",
      now: 2_000,
    });
    expect(second.id).toBe(first.id);
    expect(second.createdAt).toBe(first.createdAt);
    expect(second.hideGovernance).toBe(false); // original kept
    expect(second.note).toBeNull(); // original kept

    expect(await db.blocks.count()).toBe(1);
    expect(await db.previouslyBlocked.count()).toBe(1);
  });

  it("rejects when blockerKey === blockedKey (cannot block self)", async () => {
    await expect(
      blockMember({
        blockerKey: ALICE,
        blockedKey: ALICE,
        hideGovernance: false,
        note: null,
      }),
    ).rejects.toMatchObject({ code: "self_block" });
    expect(await db.blocks.count()).toBe(0);
    expect(await db.previouslyBlocked.count()).toBe(0);
  });

  it("rejects when note exceeds 500 chars", async () => {
    await expect(
      blockMember({
        blockerKey: ALICE,
        blockedKey: BOB,
        hideGovernance: false,
        note: "x".repeat(501),
      }),
    ).rejects.toMatchObject({ code: "note_too_long" });
    expect(await db.blocks.count()).toBe(0);
  });

  it("preserves firstBlockedAt across a block → unblock → re-block cycle (design doc §5)", async () => {
    // First block at t=1000.
    const first = await blockMember({
      blockerKey: ALICE,
      blockedKey: BOB,
      hideGovernance: false,
      note: null,
      now: 1_000,
    });
    expect(first.createdAt).toBe(1_000);

    // Unblock at t=2000.
    await unblockMember({
      blockerKey: ALICE,
      blockedKey: BOB,
      now: 2_000,
    });
    expect(await db.blocks.count()).toBe(0);

    // Re-block at t=3000 — new BlockRow, fresh createdAt, NEW id.
    const second = await blockMember({
      blockerKey: ALICE,
      blockedKey: BOB,
      hideGovernance: true,
      note: "different note this time",
      now: 3_000,
    });
    expect(second.id).not.toBe(first.id);
    expect(second.createdAt).toBe(3_000);
    expect(second.hideGovernance).toBe(true);

    // PreviouslyBlockedRow keeps firstBlockedAt = 1000 (stable across
    // re-blocks per §5). lastUnblockedAt is the value the unblock wrote.
    const history = await db.previouslyBlocked
      .where("[blockerKey+blockedKey]")
      .equals([ALICE, BOB])
      .first();
    expect(history?.firstBlockedAt).toBe(1_000);
    expect(history?.lastUnblockedAt).toBe(2_000);
  });
});

// --------------------------------------------------------------------------
// unblockMember
// --------------------------------------------------------------------------

describe("unblockMember", () => {
  beforeEach(reset);

  it("deletes the active BlockRow and updates the matching PreviouslyBlockedRow.lastUnblockedAt", async () => {
    await blockMember({
      blockerKey: ALICE,
      blockedKey: BOB,
      hideGovernance: false,
      note: null,
      now: 1_000,
    });
    expect(await db.blocks.count()).toBe(1);

    await unblockMember({
      blockerKey: ALICE,
      blockedKey: BOB,
      now: 5_000,
    });
    expect(await db.blocks.count()).toBe(0);

    const history = await db.previouslyBlocked
      .where("[blockerKey+blockedKey]")
      .equals([ALICE, BOB])
      .first();
    expect(history?.firstBlockedAt).toBe(1_000);
    expect(history?.lastUnblockedAt).toBe(5_000);
  });

  it("is idempotent — calling on an already-unblocked pair is a no-op (no throw)", async () => {
    // No block has ever been created for this pair.
    await expect(
      unblockMember({ blockerKey: ALICE, blockedKey: BOB, now: 100 }),
    ).resolves.toBeUndefined();
    expect(await db.blocks.count()).toBe(0);
    expect(await db.previouslyBlocked.count()).toBe(0);

    // Block then unblock then unblock again — second unblock is a no-op.
    await blockMember({
      blockerKey: ALICE,
      blockedKey: BOB,
      hideGovernance: false,
      note: null,
      now: 200,
    });
    await unblockMember({
      blockerKey: ALICE,
      blockedKey: BOB,
      now: 300,
    });
    await expect(
      unblockMember({ blockerKey: ALICE, blockedKey: BOB, now: 400 }),
    ).resolves.toBeUndefined();
    expect(await db.blocks.count()).toBe(0);
    const history = await db.previouslyBlocked
      .where("[blockerKey+blockedKey]")
      .equals([ALICE, BOB])
      .first();
    // lastUnblockedAt advances on the second call too — same idempotent
    // shape as the first one, just refreshing the timestamp.
    expect(history?.lastUnblockedAt).toBe(400);
  });
});

// --------------------------------------------------------------------------
// updateBlockScope
// --------------------------------------------------------------------------

describe("updateBlockScope", () => {
  beforeEach(reset);

  it("toggles hideGovernance and updates note on the active BlockRow", async () => {
    const created = await blockMember({
      blockerKey: ALICE,
      blockedKey: BOB,
      hideGovernance: false,
      note: "initial note",
      now: 1_000,
    });
    const updated = await updateBlockScope({
      blockerKey: ALICE,
      blockedKey: BOB,
      hideGovernance: true,
      note: "updated note",
    });
    expect(updated.id).toBe(created.id);
    expect(updated.createdAt).toBe(created.createdAt); // unchanged
    expect(updated.hideGovernance).toBe(true);
    expect(updated.note).toBe("updated note");

    const stored = await db.blocks.get(created.id);
    expect(stored?.hideGovernance).toBe(true);
    expect(stored?.note).toBe("updated note");
  });

  it("throws when no active block exists for this pair", async () => {
    await expect(
      updateBlockScope({
        blockerKey: ALICE,
        blockedKey: BOB,
        hideGovernance: true,
        note: null,
      }),
    ).rejects.toMatchObject({ code: "no_active_block" });
  });

  it("rejects when note exceeds 500 chars", async () => {
    await blockMember({
      blockerKey: ALICE,
      blockedKey: BOB,
      hideGovernance: false,
      note: null,
      now: 1_000,
    });
    await expect(
      updateBlockScope({
        blockerKey: ALICE,
        blockedKey: BOB,
        hideGovernance: false,
        note: "x".repeat(501),
      }),
    ).rejects.toMatchObject({ code: "note_too_long" });
    const stored = await db.blocks
      .where("[blockerKey+blockedKey]")
      .equals([ALICE, BOB])
      .first();
    // Note unchanged from the original `null`.
    expect(stored?.note).toBeNull();
  });
});

// --------------------------------------------------------------------------
// isBlocked / isMutuallyBlocked
// --------------------------------------------------------------------------

describe("isBlocked + isMutuallyBlocked", () => {
  beforeEach(reset);

  it("isBlocked is a per-direction point lookup", async () => {
    expect(await isBlocked(ALICE, BOB)).toBe(false);
    await blockMember({
      blockerKey: ALICE,
      blockedKey: BOB,
      hideGovernance: false,
      note: null,
    });
    expect(await isBlocked(ALICE, BOB)).toBe(true);
    // Reverse direction is independent.
    expect(await isBlocked(BOB, ALICE)).toBe(false);
  });

  it("isMutuallyBlocked returns true if EITHER direction is blocked", async () => {
    expect(await isMutuallyBlocked(ALICE, BOB)).toBe(false);

    // Alice blocks Bob.
    await blockMember({
      blockerKey: ALICE,
      blockedKey: BOB,
      hideGovernance: false,
      note: null,
    });
    expect(await isMutuallyBlocked(ALICE, BOB)).toBe(true);
    expect(await isMutuallyBlocked(BOB, ALICE)).toBe(true);

    // Unblock — back to false from both sides.
    await unblockMember({ blockerKey: ALICE, blockedKey: BOB });
    expect(await isMutuallyBlocked(ALICE, BOB)).toBe(false);

    // Bob blocks Alice (the reverse direction).
    await blockMember({
      blockerKey: BOB,
      blockedKey: ALICE,
      hideGovernance: false,
      note: null,
    });
    expect(await isMutuallyBlocked(ALICE, BOB)).toBe(true);
    expect(await isMutuallyBlocked(BOB, ALICE)).toBe(true);
  });
});

// --------------------------------------------------------------------------
// LOAD-BEARING NEGATIVE: outbox length is unchanged across every write
// action. Same shape as events.test.ts's `rsvpToEvent` "never enqueues"
// assertion. Cited: docs/blocking.md §7 — block surface is entirely local.
// --------------------------------------------------------------------------

describe("outbox is never touched by any block write action", () => {
  beforeEach(reset);

  it("blockMember, unblockMember, updateBlockScope, and clearPreviouslyBlocked leave the outbox unchanged", async () => {
    const initialOutbox = await db.outbox.count();

    await blockMember({
      blockerKey: ALICE,
      blockedKey: BOB,
      hideGovernance: false,
      note: "private note",
      now: 100,
    });
    expect(await db.outbox.count()).toBe(initialOutbox);

    await updateBlockScope({
      blockerKey: ALICE,
      blockedKey: BOB,
      hideGovernance: true,
      note: "new note",
    });
    expect(await db.outbox.count()).toBe(initialOutbox);

    await unblockMember({
      blockerKey: ALICE,
      blockedKey: BOB,
      now: 200,
    });
    expect(await db.outbox.count()).toBe(initialOutbox);

    await clearPreviouslyBlocked(ALICE);
    expect(await db.outbox.count()).toBe(initialOutbox);

    // And the negative-direction shape: the rows that DID get written
    // are blocks / previouslyBlocked, never outbox.
    const outboxRows = await db.outbox.toArray();
    expect(outboxRows.every((r) => r.kind !== ("block" as never))).toBe(
      true,
    );
  });
});

// --------------------------------------------------------------------------
// listBlocks + listPreviouslyBlocked + clearPreviouslyBlocked
// --------------------------------------------------------------------------

describe("listBlocks + listPreviouslyBlocked", () => {
  beforeEach(reset);

  it("listBlocks returns blocker-scoped active blocks ordered by createdAt DESC", async () => {
    // Alice blocks Bob then Carol; Carol-as-blocker also blocks Bob.
    await blockMember({
      blockerKey: ALICE,
      blockedKey: BOB,
      hideGovernance: false,
      note: null,
      now: 100,
    });
    await blockMember({
      blockerKey: ALICE,
      blockedKey: CAROL,
      hideGovernance: false,
      note: null,
      now: 200,
    });
    await blockMember({
      blockerKey: CAROL,
      blockedKey: BOB,
      hideGovernance: false,
      note: null,
      now: 300,
    });

    const aliceBlocks = await listBlocks(ALICE);
    expect(aliceBlocks.map((r) => r.blockedKey)).toEqual([CAROL, BOB]);
    // Carol-as-blocker rows are not in Alice's list.
    expect(aliceBlocks.every((r) => r.blockerKey === ALICE)).toBe(true);

    const carolBlocks = await listBlocks(CAROL);
    expect(carolBlocks).toHaveLength(1);
    expect(carolBlocks[0].blockedKey).toBe(BOB);
  });

  it("listPreviouslyBlocked returns blocker-scoped history ordered by lastUnblockedAt DESC", async () => {
    // Set up two unblocked pairs for Alice, one in-progress (no unblock),
    // and one for Carol.
    await blockMember({
      blockerKey: ALICE,
      blockedKey: BOB,
      hideGovernance: false,
      note: null,
      now: 100,
    });
    await unblockMember({
      blockerKey: ALICE,
      blockedKey: BOB,
      now: 500,
    });

    await blockMember({
      blockerKey: ALICE,
      blockedKey: CAROL,
      hideGovernance: false,
      note: null,
      now: 200,
    });
    await unblockMember({
      blockerKey: ALICE,
      blockedKey: CAROL,
      now: 1_000,
    });

    // Carol as blocker — separate scope.
    await blockMember({
      blockerKey: CAROL,
      blockedKey: BOB,
      hideGovernance: false,
      note: null,
      now: 50,
    });
    await unblockMember({
      blockerKey: CAROL,
      blockedKey: BOB,
      now: 300,
    });

    const aliceHistory = await listPreviouslyBlocked(ALICE);
    // CAROL unblocked at 1000, BOB unblocked at 500 — DESC.
    expect(aliceHistory.map((r) => r.blockedKey)).toEqual([CAROL, BOB]);
    expect(aliceHistory.every((r) => r.blockerKey === ALICE)).toBe(true);

    const carolHistory = await listPreviouslyBlocked(CAROL);
    expect(carolHistory).toHaveLength(1);
    expect(carolHistory[0].blockedKey).toBe(BOB);
  });
});

describe("clearPreviouslyBlocked", () => {
  beforeEach(reset);

  it("deletes only the calling blocker's history rows; other blockers' rows on the same device are untouched", async () => {
    // Alice: two history rows.
    await blockMember({
      blockerKey: ALICE,
      blockedKey: BOB,
      hideGovernance: false,
      note: null,
      now: 100,
    });
    await unblockMember({
      blockerKey: ALICE,
      blockedKey: BOB,
      now: 500,
    });
    await blockMember({
      blockerKey: ALICE,
      blockedKey: CAROL,
      hideGovernance: false,
      note: null,
      now: 200,
    });
    await unblockMember({
      blockerKey: ALICE,
      blockedKey: CAROL,
      now: 600,
    });
    // Carol: one history row (different blocker on the same device).
    await blockMember({
      blockerKey: CAROL,
      blockedKey: BOB,
      hideGovernance: false,
      note: null,
      now: 50,
    });
    await unblockMember({
      blockerKey: CAROL,
      blockedKey: BOB,
      now: 300,
    });

    expect((await listPreviouslyBlocked(ALICE)).length).toBe(2);
    expect((await listPreviouslyBlocked(CAROL)).length).toBe(1);

    await clearPreviouslyBlocked(ALICE);

    expect(await listPreviouslyBlocked(ALICE)).toEqual([]);
    // Carol's row survives — scoped by blockerKey.
    const carolHistory = await listPreviouslyBlocked(CAROL);
    expect(carolHistory).toHaveLength(1);
    expect(carolHistory[0].blockedKey).toBe(BOB);
  });
});

// --------------------------------------------------------------------------
// Sanity: BlockActionError is a real Error subclass with a `code`.
// --------------------------------------------------------------------------

describe("BlockActionError", () => {
  it("is an Error subclass exposing a code", () => {
    const e = new BlockActionError("test_code", "test message");
    expect(e).toBeInstanceOf(Error);
    expect(e).toBeInstanceOf(BlockActionError);
    expect(e.code).toBe("test_code");
    expect(e.message).toBe("test message");
  });
});
