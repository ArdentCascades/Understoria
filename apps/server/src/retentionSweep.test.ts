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
/**
 * Retention sweep (docs/node-seizure-plan.md §3): each rule's window
 * and floor, the settled-vs-pending transition matrix, and — the
 * load-bearing lock — the FORBIDDEN LIST: after a full sweep, the
 * trust sources and durable records must be byte-identical. The trust
 * and membership resolvers memoize on COUNT(*) stamps under an
 * explicit append-only assumption (trustGate.ts); any future rule
 * against these tables must fail here first and be argued in the
 * plan, never slipped in.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Database as DatabaseType } from "better-sqlite3-multiple-ciphers";
import { openDatabase } from "./db.js";
import { startRetentionSweep, type RetentionSweep } from "./retentionSweep.js";

const DAY = 24 * 60 * 60 * 1000;
const NOW = 1_800_000_000_000;

const silentLog = {
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
  trace: () => {},
  fatal: () => {},
  child() {
    return this;
  },
  level: "silent",
} as never;

let db: DatabaseType;
let sweep: RetentionSweep;

function makeSweep(overrides: Partial<Parameters<typeof startRetentionSweep>[0]> = {}) {
  return startRetentionSweep({
    db,
    intervalMs: 0,
    claimRetentionDays: 90,
    announcementRetentionDays: 60,
    transitionRetentionDays: 60,
    newcomerCounterRetentionDays: 7,
    log: silentLog,
    now: () => NOW,
    ...overrides,
  });
}

function insertClaim(postId: string, claimedAt: number) {
  db.prepare(
    "INSERT INTO claims (post_id, claimer_key, claimed_at, node_id) VALUES (?, 'k', ?, 'n')",
  ).run(postId, claimedAt);
}

function insertAnnouncement(hash: string, expiresAt: number, status = "open") {
  db.prepare(
    `INSERT INTO invite_announcements
       (token_hash, inviter_key, inviter_name, node_id, created_at,
        expires_at, signature, status, received_at)
     VALUES (?, 'k', 'Name', 'n', ?, ?, 'sig', ?, ?)`,
  ).run(hash, expiresAt - 7 * DAY, expiresAt, status, expiresAt - 7 * DAY);
}

function insertTransition(postId: string, receivedAt: number) {
  db.prepare(
    `INSERT INTO awaiting_transitions
       (post_id, helper_key, helped_key, signed_by, entered_at, node_id,
        signature, received_at)
     VALUES (?, 'h', 'p', 's', ?, 'n', 'sig', ?)`,
  ).run(postId, receivedAt, receivedAt);
}

function insertExchange(id: string, postId: string) {
  db.prepare(
    `INSERT INTO exchanges
       (id, post_id, helper_key, helped_key, hours_exchanged,
        helper_signature, helped_signature, completed_at, category, node_id)
     VALUES (?, ?, 'h', 'p', 1, 's1', 's2', ?, 'food', 'n')`,
  ).run(id, postId, NOW - DAY);
}

function insertCounter(author: string, windowStart: number) {
  db.prepare(
    "INSERT INTO newcomer_daily_writes (author_key, tbl, window_start, count) VALUES (?, 'posts', ?, 1)",
  ).run(author, windowStart);
}

function rowsOf(table: string): unknown[] {
  return db.prepare(`SELECT * FROM ${table} ORDER BY 1`).all();
}

beforeEach(() => {
  db = openDatabase(":memory:");
});

afterEach(() => {
  sweep?.stop();
  db.close();
});

describe("retention sweep — per-rule windows", () => {
  it("prunes claims older than the window and keeps younger ones", () => {
    insertClaim("old", NOW - 91 * DAY);
    insertClaim("young", NOW - 89 * DAY);
    sweep = makeSweep();
    const result = sweep.sweepOnce();
    expect(result.claims).toBe(1);
    expect(rowsOf("claims")).toHaveLength(1);
    expect((rowsOf("claims")[0] as { post_id: string }).post_id).toBe("young");
  });

  it("claim rule off (0) prunes nothing", () => {
    insertClaim("ancient", NOW - 400 * DAY);
    sweep = makeSweep({ claimRetentionDays: 0 });
    expect(sweep.sweepOnce().claims).toBe(0);
    expect(rowsOf("claims")).toHaveLength(1);
  });

  it("prunes announcements whose expiry passed the window — open AND redeemed", () => {
    insertAnnouncement("dead-open", NOW - 61 * DAY, "open");
    insertAnnouncement("dead-redeemed", NOW - 61 * DAY, "redeemed");
    insertAnnouncement("recent", NOW - 59 * DAY, "open");
    // Still-valid invite: expires in the future — must never match.
    insertAnnouncement("live", NOW + 7 * DAY, "open");
    sweep = makeSweep();
    const result = sweep.sweepOnce();
    expect(result.announcements).toBe(2);
    const left = rowsOf("invite_announcements").map(
      (r) => (r as { token_hash: string }).token_hash,
    );
    expect(left.sort()).toEqual(["live", "recent"]);
  });

  it("prunes stale newcomer counters and keeps live windows", () => {
    insertCounter("stale", NOW - 8 * DAY);
    insertCounter("live", NOW - 1 * DAY);
    sweep = makeSweep();
    expect(sweep.sweepOnce().counters).toBe(1);
    expect(rowsOf("newcomer_daily_writes")).toHaveLength(1);
  });
});

describe("retention sweep — settled-vs-pending transition matrix", () => {
  it("prunes only SETTLED old artifacts; pending ones survive any age", () => {
    // Settled + old → pruned.
    insertTransition("settled-old", NOW - 61 * DAY);
    insertExchange("e1", "settled-old");
    // Settled + young → kept (window not reached).
    insertTransition("settled-young", NOW - 10 * DAY);
    insertExchange("e2", "settled-young");
    // PENDING + ancient → kept forever (no exchange row): pruning it
    // would strand the exchange under AUTO_CONFIRM_REQUIRE_TRANSITION.
    insertTransition("pending-ancient", NOW - 400 * DAY);
    sweep = makeSweep();
    const result = sweep.sweepOnce();
    expect(result.transitions).toBe(1);
    const left = rowsOf("awaiting_transitions").map(
      (r) => (r as { post_id: string }).post_id,
    );
    expect(left.sort()).toEqual(["pending-ancient", "settled-young"]);
  });
});

describe("retention sweep — the forbidden list (append-only trust sources)", () => {
  it("a full sweep leaves trust sources and durable records byte-identical", () => {
    db.prepare(
      `INSERT INTO redemptions
         (token, inviter_key, inviter_name, invite_node_id,
          invite_created_at, invite_expires_at, invite_signature,
          redeemed_by, display_name, redeemed_at, signature, received_at)
       VALUES ('t', 'ik', 'Inviter', 'n', 1, 2, 's', 'mk', 'Member', 3, 'sig', 4)`,
    ).run();
    db.prepare(
      "INSERT INTO vouches (id, voucher_key, vouchee_key, created_at, kind, signature) VALUES ('v', 'a', 'b', 1, 'invite', 's')",
    ).run();
    db.prepare(
      "INSERT INTO claimed_founders (founder_key, claimed_at) VALUES ('f', 1)",
    ).run();
    db.prepare(
      `INSERT INTO founder_accessions
         (nominee_key, nominator_key, node_id, nominated_at, expires_at,
          nomination_signature, accepted_at, signature, received_at)
       VALUES ('nk', 'f', 'n', 1, 2, 's1', 3, 's2', 4)`,
    ).run();
    db.prepare(
      "INSERT INTO invite_revocations (token, inviter_key, revoked_at, node_id, signature, received_at) VALUES ('t2', 'ik', 1, 'n', 's', 2)",
    ).run();
    // A representative durable content row, ancient by every window.
    insertExchange("e-ancient", "some-post");

    const before = {
      redemptions: rowsOf("redemptions"),
      vouches: rowsOf("vouches"),
      claimed_founders: rowsOf("claimed_founders"),
      founder_accessions: rowsOf("founder_accessions"),
      invite_revocations: rowsOf("invite_revocations"),
      exchanges: rowsOf("exchanges"),
    };

    sweep = makeSweep();
    sweep.sweepOnce();

    expect(rowsOf("redemptions")).toEqual(before.redemptions);
    expect(rowsOf("vouches")).toEqual(before.vouches);
    expect(rowsOf("claimed_founders")).toEqual(before.claimed_founders);
    expect(rowsOf("founder_accessions")).toEqual(before.founder_accessions);
    expect(rowsOf("invite_revocations")).toEqual(before.invite_revocations);
    expect(rowsOf("exchanges")).toEqual(before.exchanges);
  });
});

describe("retention sweep — migration v33 index", () => {
  it("the exchanges post_id index exists (settled EXISTS stays O(log n))", () => {
    const indexes = db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'index' AND tbl_name = 'exchanges'")
      .all()
      .map((r) => (r as { name: string }).name);
    expect(indexes).toContain("exchanges_post_id_idx");
  });
});
