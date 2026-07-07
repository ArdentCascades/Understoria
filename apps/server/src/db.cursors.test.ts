/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
/**
 * Composite `(timestamp, id)` cursor — the wedge regression suite
 * from `docs/composite-federation-cursors.md` §4 phase 1, run against
 * EVERY federation store.
 *
 * The wedge: 250 rows sharing ONE millisecond, page cap 50. A puller
 * tracking only max(timestamp) re-serves the same lowest-id 50 rows
 * forever (the legacy inclusive `>=` cursor cannot move inside a
 * tie). The pair cursor `(since, sinceId)` pins an exact position, so
 * paging strictly-after-the-pair converges across the whole tie.
 *
 * Each store case also locks the LEGACY semantics in place: with
 * `since` alone the inclusive behavior is byte-for-byte the old one —
 * that is the back-compat contract old pullers rely on.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Database as DatabaseType } from "better-sqlite3-multiple-ciphers";
import {
  createClaimStore,
  createCoOrganizerInvitationResponseStore,
  createCoOrganizerInvitationRevocationStore,
  createCoOrganizerInvitationStore,
  createEventCancellationStore,
  createEventStore,
  createExchangeStore,
  createInviteRevocationStore,
  createPostStore,
  createRedemptionStore,
  createTaskCommentStore,
  createVouchStore,
  openDatabase,
} from "./db.js";

const T = 1_700_000_000_000; // the shared millisecond
const TIE = 250; // rows sharing it — larger than the 200 default page
const PAGE = 50;

/** Zero-padded ids so string ASC ordering matches numeric order. */
function tid(i: number): string {
  return `row_${String(i).padStart(4, "0")}`;
}

let db: DatabaseType;

beforeEach(() => {
  db = openDatabase(":memory:");
});

afterEach(() => {
  db.close();
});

interface StoreCase {
  name: string;
  /** Insert `TIE` rows all stamped `T`, ids `tid(0)..tid(TIE-1)`. */
  seed(db: DatabaseType): void;
  /** Page fetcher: (since, sinceId, limit) → ids in served order. */
  page(
    db: DatabaseType,
    since: number,
    sinceId: string | undefined,
    limit: number,
  ): string[];
}

const CASES: StoreCase[] = [
  {
    name: "exchanges (completed_at, id)",
    seed(db) {
      const store = createExchangeStore(db);
      for (let i = 0; i < TIE; i++) {
        store.insert({
          id: tid(i),
          postId: `p_${i}`,
          helperKey: "hk",
          helpedKey: "dk",
          hoursExchanged: 1,
          helperSignature: "s",
          helpedSignature: "s",
          completedAt: T,
          category: "other",
          nodeId: "n",
        });
      }
    },
    page(db, since, sinceId, limit) {
      return createExchangeStore(db)
        .list({ since, sinceId, limit })
        .map((r) => r.id);
    },
  },
  {
    name: "vouches (created_at, id)",
    seed(db) {
      const store = createVouchStore(db);
      for (let i = 0; i < TIE; i++) {
        store.insert({
          id: tid(i),
          voucherKey: "vk",
          voucheeKey: "wk",
          createdAt: T,
          kind: "manual",
          signature: "s",
        });
      }
    },
    page(db, since, sinceId, limit) {
      return createVouchStore(db)
        .list({ since, sinceId, limit })
        .map((r) => r.id);
    },
  },
  {
    name: "posts (created_at, id)",
    seed(db) {
      const store = createPostStore(db);
      for (let i = 0; i < TIE; i++) {
        store.insert({
          id: tid(i),
          type: "NEED",
          category: "other",
          title: "t",
          description: "",
          estimatedHours: 1,
          urgency: "low",
          postedBy: "pk",
          createdAt: T,
          expiresAt: null,
          locationZone: "z",
          nodeId: "n",
          signature: "s",
        });
      }
    },
    page(db, since, sinceId, limit) {
      return createPostStore(db)
        .list({ since, sinceId, limit })
        .map((r) => r.id);
    },
  },
  {
    name: "task_comments (max(created_at, deleted_at), id)",
    seed(db) {
      const store = createTaskCommentStore(db);
      for (let i = 0; i < TIE; i++) {
        store.insert({
          id: tid(i),
          projectId: "proj",
          taskId: "task",
          authorKey: "ak",
          body: "b",
          createdAt: T,
          deletedAt: null,
          nodeId: "n",
          signature: "s",
        });
      }
    },
    page(db, since, sinceId, limit) {
      return createTaskCommentStore(db)
        .list({ since, sinceId, limit })
        .map((r) => r.id);
    },
  },
  {
    name: "redemptions (received_at, token)",
    seed(db) {
      const store = createRedemptionStore(db);
      for (let i = 0; i < TIE; i++) {
        store.insert(
          {
            invite: {
              token: tid(i),
              inviterKey: "ik",
              inviterName: "Inviter",
              nodeId: "n",
              createdAt: 1,
              expiresAt: 2,
              signature: "s",
            },
            redeemedBy: "rk",
            displayName: "New Member",
            redeemedAt: 1,
            signature: "s",
          },
          T,
        );
      }
    },
    page(db, since, sinceId, limit) {
      return createRedemptionStore(db)
        .list({ since, sinceId, limit })
        .map((r) => r.receipt.invite.token);
    },
  },
  {
    name: "invite_revocations (received_at, token)",
    seed(db) {
      const store = createInviteRevocationStore(db);
      for (let i = 0; i < TIE; i++) {
        store.insert(
          {
            token: tid(i),
            inviterKey: "ik",
            revokedAt: 1,
            nodeId: "n",
            signature: "s",
          },
          T,
        );
      }
    },
    page(db, since, sinceId, limit) {
      return createInviteRevocationStore(db)
        .list({ since, sinceId, limit })
        .map((r) => r.revocation.token);
    },
  },
  {
    name: "claims (claimed_at, post_id)",
    seed(db) {
      const store = createClaimStore(db);
      for (let i = 0; i < TIE; i++) {
        store.insert({
          postId: tid(i),
          claimerKey: "ck",
          claimedAt: T,
          nodeId: "n",
        });
      }
    },
    page(db, since, sinceId, limit) {
      return createClaimStore(db)
        .list({ since, sinceId, limit })
        .map((r) => r.postId);
    },
  },
  {
    name: "coorg_invitations (created_at, id)",
    seed(db) {
      const store = createCoOrganizerInvitationStore(db);
      for (let i = 0; i < TIE; i++) {
        store.insert({
          id: tid(i),
          projectId: "proj",
          inviterKey: "ik",
          inviteeKey: "ek",
          createdAt: T,
          expiresAt: T + 1,
          nodeId: "n",
          signature: "s",
        });
      }
    },
    page(db, since, sinceId, limit) {
      return createCoOrganizerInvitationStore(db)
        .list({ since, sinceId, limit })
        .map((r) => r.id);
    },
  },
  {
    name: "coorg_invitation_responses (decided_at, id)",
    seed(db) {
      const store = createCoOrganizerInvitationResponseStore(db);
      for (let i = 0; i < TIE; i++) {
        store.insert({
          id: tid(i),
          invitationId: "inv",
          inviteeKey: "ek",
          decision: "accept",
          decidedAt: T,
          nodeId: "n",
          signature: "s",
        });
      }
    },
    page(db, since, sinceId, limit) {
      return createCoOrganizerInvitationResponseStore(db)
        .list({ since, sinceId, limit })
        .map((r) => r.id);
    },
  },
  {
    name: "coorg_invitation_revocations (revoked_at, id)",
    seed(db) {
      const store = createCoOrganizerInvitationRevocationStore(db);
      for (let i = 0; i < TIE; i++) {
        store.insert({
          id: tid(i),
          invitationId: "inv",
          inviterKey: "ik",
          revokedAt: T,
          nodeId: "n",
          signature: "s",
        });
      }
    },
    page(db, since, sinceId, limit) {
      return createCoOrganizerInvitationRevocationStore(db)
        .list({ since, sinceId, limit })
        .map((r) => r.id);
    },
  },
  {
    name: "events (created_at, id)",
    seed(db) {
      const store = createEventStore(db);
      for (let i = 0; i < TIE; i++) {
        store.insert({
          id: tid(i),
          kind: "event",
          title: "t",
          description: "",
          category: "c",
          startsAt: T + 100,
          endsAt: null,
          location: "l",
          capacity: null,
          templateId: null,
          createdAt: T,
          createdBy: "ok",
          nodeId: "n",
          signature: "s",
        });
      }
    },
    page(db, since, sinceId, limit) {
      return createEventStore(db)
        .list({ since, sinceId, limit })
        .map((r) => r.id);
    },
  },
  {
    name: "event_cancellations (cancelled_at, id)",
    seed(db) {
      const store = createEventCancellationStore(db);
      for (let i = 0; i < TIE; i++) {
        store.insert({
          id: tid(i),
          kind: "event_cancellation",
          eventId: `ev_${i}`,
          reason: "",
          cancelledAt: T,
          createdBy: "ok",
          nodeId: "n",
          signature: "s",
        });
      }
    },
    page(db, since, sinceId, limit) {
      return createEventCancellationStore(db)
        .list({ since, sinceId, limit })
        .map((r) => r.id);
    },
  },
];

describe.each(CASES)("$name", (c) => {
  it("legacy since-only cursor still wedges inside the tie (back-compat contract)", () => {
    c.seed(db);
    const first = c.page(db, T, undefined, PAGE);
    const second = c.page(db, T, undefined, PAGE);
    // Same lowest-id page every time — the documented pre-composite
    // behavior, kept verbatim for pullers that don't send sinceId.
    expect(first).toHaveLength(PAGE);
    expect(second).toEqual(first);
    expect(first[0]).toBe(tid(0));
  });

  it(`pair cursor converges across a ${TIE}-row single-millisecond tie`, () => {
    c.seed(db);
    const seen: string[] = [];
    let since = 1; // strictly before T, with a real sinceId partner
    let sinceId: string | undefined = "";
    let guard = 0;
    for (;;) {
      guard += 1;
      expect(guard).toBeLessThan(50); // convergence, not an endless loop
      const page: string[] = c.page(
        db,
        since,
        sinceId === "" ? undefined : sinceId,
        PAGE,
      );
      if (page.length === 0) break;
      seen.push(...page);
      // Advance the pair to the last consumed row — every row here
      // shares T, so only the id component moves the cursor. This is
      // exactly the wedge the bare-timestamp cursor could not escape.
      since = T;
      sinceId = page[page.length - 1];
      if (page.length < PAGE) break;
    }
    expect(seen).toHaveLength(TIE);
    expect(new Set(seen).size).toBe(TIE); // no re-serves
    expect(seen).toEqual([...seen].sort()); // served in id order
    expect(seen[0]).toBe(tid(0));
    expect(seen[TIE - 1]).toBe(tid(TIE - 1));
  });

  it("pair cursor never skips rows AFTER the tie", () => {
    c.seed(db);
    // Walk the whole tie with the pair cursor, then confirm the final
    // position yields nothing more (every row was consumed).
    let sinceId = "";
    let consumed = 0;
    for (;;) {
      const page = c.page(
        db,
        T,
        sinceId === "" ? undefined : sinceId,
        PAGE,
      );
      if (sinceId === "") {
        // First call is legacy-inclusive; skip past it using its ids.
        consumed = page.length;
        sinceId = page[page.length - 1];
        continue;
      }
      if (page.length === 0) break;
      consumed += page.length;
      sinceId = page[page.length - 1];
    }
    expect(consumed).toBe(TIE);
  });
});
