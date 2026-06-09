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
import { describe, it, expect } from "vitest";
import type { BlockRow, PreviouslyBlockedRow } from "./index";

// Type-level locks for the load-bearing local-only invariants
// declared in docs/blocking.md §4 + §7. If any of these assertions
// stop failing (i.e., the @ts-expect-error comments become "unused"
// and TypeScript complains), the invariant has been broken.

describe("blocking types — local-only invariant", () => {
  it("rejects `\"block\"` as a member of OutboxRow.kind", () => {
    type OutboxKind = import("@/db/database").OutboxRow["kind"];
    // @ts-expect-error — "block" must not be assignable to the union.
    // BlockRow is local-only by design (docs/blocking.md §7); the
    // outbox must not be able to ferry a Block to the federation.
    const _bad: OutboxKind = "block";
    void _bad;
  });

  it("has no `enqueueBlock` helper exported from lib/outbox", async () => {
    const outbox = await import("@/lib/outbox");
    // @ts-expect-error — the function does not exist as an export, and
    // the absence is load-bearing. Locking the negative at the type
    // level so a future refactor that adds an outbox enqueue helper
    // for blocks fails here first.
    const fn = outbox.enqueueBlock;
    expect(fn).toBeUndefined();
  });

  it("BlockRow carries the design-doc fields and no signature", () => {
    const row: BlockRow = {
      id: "block_1",
      blockerKey: "blocker_pubkey",
      blockedKey: "blocked_pubkey",
      createdAt: 1700000000000,
      hideGovernance: false,
      note: null,
    };
    expect(row.id).toBe("block_1");
    expect(row.hideGovernance).toBe(false);
    // Structural lock: BlockRow has no `signature` field. If a future
    // edit adds one, this assertion will fail at compile time.
    // @ts-expect-error — signature must not exist on BlockRow.
    const _hasSignature: string = row.signature;
    void _hasSignature;
  });

  it("PreviouslyBlockedRow tracks first-block + last-unblock cadence", () => {
    const row: PreviouslyBlockedRow = {
      id: "prev_1",
      blockerKey: "blocker_pubkey",
      blockedKey: "blocked_pubkey",
      firstBlockedAt: 1700000000000,
      lastUnblockedAt: 1700001000000,
    };
    expect(row.lastUnblockedAt).toBeGreaterThan(row.firstBlockedAt);
    // Structural lock: same posture as BlockRow — no signature, no
    // nodeId. Federation has no business knowing about history.
    // @ts-expect-error — signature must not exist on PreviouslyBlockedRow.
    const _hasSignature: string = row.signature;
    void _hasSignature;
    // @ts-expect-error — nodeId must not exist on PreviouslyBlockedRow.
    const _hasNodeId: string = row.nodeId;
    void _hasNodeId;
  });
});
