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
import Database from "better-sqlite3";
import type { Database as DatabaseType } from "better-sqlite3";
import type { Exchange, FlagReason } from "@understoria/shared/types";

/**
 * SQLite layer. Synchronous (better-sqlite3) by design — every endpoint
 * is short-lived and the workload is small (<200 members per pilot).
 *
 * Schema is versioned via a single `meta` table; migrations are applied
 * in order. Never modify a past version — append a new one.
 *
 * Storage policy: rows are exactly the signed Exchange shape from
 * @understoria/shared. We persist the signatures so a peer node can
 * verify any row independently. Optional flag fields (set by the web's
 * anti-gaming safeguards) are preserved as-is — the server does not
 * gate on them.
 */

export interface ExchangeStore {
  insert(exchange: Exchange): void;
  list(opts?: { since?: number; limit?: number }): Exchange[];
  count(): number;
  has(id: string): boolean;
}

/**
 * Per-peer pull state. Persisted so a server restart resumes pulling
 * from where it left off rather than re-fetching every record (which
 * would still be correct via `store.has(id)` dedup, but wasteful at
 * scale).
 */
export interface PeerPullStateRow {
  peerUrl: string;
  lastPulledAt: number | null;
  lastSuccessAt: number | null;
  lastCompletedAt: number | null;
  lastError: string | null;
  lastPulledCount: number;
}

export interface PeerPullStore {
  get(peerUrl: string): PeerPullStateRow | null;
  list(): PeerPullStateRow[];
  recordSuccess(opts: {
    peerUrl: string;
    at: number;
    latestCompletedAt: number | null;
    pulledCount: number;
  }): void;
  recordFailure(opts: { peerUrl: string; at: number; error: string }): void;
}

export function openDatabase(path: string): DatabaseType {
  const db = new Database(path);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  migrate(db);
  return db;
}

function migrate(db: DatabaseType): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  const row = db
    .prepare("SELECT value FROM meta WHERE key = 'schema_version'")
    .get() as { value: string } | undefined;
  const current = row ? Number.parseInt(row.value, 10) : 0;

  if (current < 1) {
    db.exec(`
      CREATE TABLE exchanges (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL,
        helper_key TEXT NOT NULL,
        helped_key TEXT NOT NULL,
        hours_exchanged REAL NOT NULL,
        helper_signature TEXT NOT NULL,
        helped_signature TEXT NOT NULL,
        completed_at INTEGER NOT NULL,
        category TEXT NOT NULL,
        node_id TEXT NOT NULL,
        flagged_for_review INTEGER NOT NULL DEFAULT 0,
        flag_reason TEXT
      );
      CREATE INDEX exchanges_completed_at_idx
        ON exchanges (completed_at DESC);
      CREATE INDEX exchanges_helper_idx ON exchanges (helper_key);
      CREATE INDEX exchanges_helped_idx ON exchanges (helped_key);
    `);
    db.prepare(
      "INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', '1')",
    ).run();
  }

  // Schema v2 — Agent 3 task 2: federation pull state. One row per
  // configured peer. The worker reads `last_completed_at` to decide
  // the `since=` parameter for its next pull; updates the other fields
  // for observability via GET /peers.
  if (current < 2) {
    db.exec(`
      CREATE TABLE peer_pull_state (
        peer_url TEXT PRIMARY KEY,
        last_pulled_at INTEGER,
        last_success_at INTEGER,
        last_completed_at INTEGER,
        last_error TEXT,
        last_pulled_count INTEGER NOT NULL DEFAULT 0
      );
    `);
    db.prepare(
      "INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', '2')",
    ).run();
  }
}

export function createExchangeStore(db: DatabaseType): ExchangeStore {
  const insertStmt = db.prepare(`
    INSERT INTO exchanges (
      id, post_id, helper_key, helped_key, hours_exchanged,
      helper_signature, helped_signature, completed_at, category, node_id,
      flagged_for_review, flag_reason
    ) VALUES (
      @id, @postId, @helperKey, @helpedKey, @hoursExchanged,
      @helperSignature, @helpedSignature, @completedAt, @category, @nodeId,
      @flaggedForReview, @flagReason
    )
  `);

  const hasStmt = db.prepare("SELECT 1 FROM exchanges WHERE id = ?");
  const countStmt = db.prepare("SELECT COUNT(*) AS n FROM exchanges");

  return {
    insert(exchange) {
      insertStmt.run({
        id: exchange.id,
        postId: exchange.postId,
        helperKey: exchange.helperKey,
        helpedKey: exchange.helpedKey,
        hoursExchanged: exchange.hoursExchanged,
        helperSignature: exchange.helperSignature,
        helpedSignature: exchange.helpedSignature,
        completedAt: exchange.completedAt,
        category: exchange.category,
        nodeId: exchange.nodeId,
        flaggedForReview: exchange.flaggedForReview ? 1 : 0,
        flagReason: exchange.flagReason ?? null,
      });
    },

    list({ since, limit } = {}) {
      const safeLimit = Math.max(1, Math.min(limit ?? 200, 1000));
      const rows = since
        ? db
            .prepare(
              `SELECT * FROM exchanges WHERE completed_at > ?
               ORDER BY completed_at DESC LIMIT ?`,
            )
            .all(since, safeLimit)
        : db
            .prepare(
              `SELECT * FROM exchanges
               ORDER BY completed_at DESC LIMIT ?`,
            )
            .all(safeLimit);
      return (rows as ExchangeRow[]).map(rowToExchange);
    },

    count() {
      const r = countStmt.get() as { n: number };
      return r.n;
    },

    has(id) {
      return hasStmt.get(id) !== undefined;
    },
  };
}

export function createPeerPullStore(db: DatabaseType): PeerPullStore {
  const getStmt = db.prepare("SELECT * FROM peer_pull_state WHERE peer_url = ?");
  const listStmt = db.prepare(
    "SELECT * FROM peer_pull_state ORDER BY peer_url",
  );
  // Use COALESCE so a success update preserves an existing
  // last_completed_at when the pull returned no new rows.
  const successStmt = db.prepare(`
    INSERT INTO peer_pull_state (
      peer_url, last_pulled_at, last_success_at, last_completed_at,
      last_error, last_pulled_count
    ) VALUES (
      @peerUrl, @at, @at, @latestCompletedAt, NULL, @pulledCount
    )
    ON CONFLICT(peer_url) DO UPDATE SET
      last_pulled_at = @at,
      last_success_at = @at,
      last_completed_at = COALESCE(@latestCompletedAt, last_completed_at),
      last_error = NULL,
      last_pulled_count = @pulledCount
  `);
  const failureStmt = db.prepare(`
    INSERT INTO peer_pull_state (
      peer_url, last_pulled_at, last_error, last_pulled_count
    ) VALUES (
      @peerUrl, @at, @error, 0
    )
    ON CONFLICT(peer_url) DO UPDATE SET
      last_pulled_at = @at,
      last_error = @error
  `);
  return {
    get(peerUrl) {
      const row = getStmt.get(peerUrl) as PeerPullStateRowSqlite | undefined;
      return row ? toState(row) : null;
    },
    list() {
      const rows = listStmt.all() as PeerPullStateRowSqlite[];
      return rows.map(toState);
    },
    recordSuccess({ peerUrl, at, latestCompletedAt, pulledCount }) {
      successStmt.run({ peerUrl, at, latestCompletedAt, pulledCount });
    },
    recordFailure({ peerUrl, at, error }) {
      failureStmt.run({ peerUrl, at, error });
    },
  };
}

interface PeerPullStateRowSqlite {
  peer_url: string;
  last_pulled_at: number | null;
  last_success_at: number | null;
  last_completed_at: number | null;
  last_error: string | null;
  last_pulled_count: number;
}

function toState(r: PeerPullStateRowSqlite): PeerPullStateRow {
  return {
    peerUrl: r.peer_url,
    lastPulledAt: r.last_pulled_at,
    lastSuccessAt: r.last_success_at,
    lastCompletedAt: r.last_completed_at,
    lastError: r.last_error,
    lastPulledCount: r.last_pulled_count,
  };
}

interface ExchangeRow {
  id: string;
  post_id: string;
  helper_key: string;
  helped_key: string;
  hours_exchanged: number;
  helper_signature: string;
  helped_signature: string;
  completed_at: number;
  category: string;
  node_id: string;
  flagged_for_review: number;
  flag_reason: string | null;
}

function rowToExchange(r: ExchangeRow): Exchange {
  const out: Exchange = {
    id: r.id,
    postId: r.post_id,
    helperKey: r.helper_key,
    helpedKey: r.helped_key,
    hoursExchanged: r.hours_exchanged,
    helperSignature: r.helper_signature,
    helpedSignature: r.helped_signature,
    completedAt: r.completed_at,
    category: r.category as Exchange["category"],
    nodeId: r.node_id,
  };
  if (r.flagged_for_review) {
    out.flaggedForReview = true;
    if (r.flag_reason) out.flagReason = r.flag_reason as FlagReason;
  }
  return out;
}
