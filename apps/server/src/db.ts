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
import type {
  Exchange,
  FlagReason,
  Post,
  SignedVouch,
} from "@understoria/shared/types";

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
 * Storage for signed vouches. Parallels ExchangeStore exactly — the
 * pull worker treats both as `kind: "exchange" | "vouch"` slots over
 * a common store interface, with the only kind-specific bit being
 * the cursor field (`completedAt` for exchanges, `createdAt` for
 * vouches).
 */
export interface VouchStore {
  insert(vouch: SignedVouch): void;
  list(opts?: { since?: number; limit?: number }): SignedVouch[];
  count(): number;
  has(id: string): boolean;
}

/**
 * Storage for signed posts. The wire shape is the immutable subset
 * of Post (lifecycle fields like status/claimedBy/confirmedBy stay
 * local to each PWA — they don't federate). Same shape pattern as
 * VouchStore. Cursor field is `createdAt`.
 */
export type PostRecord = Pick<
  Post,
  | "id"
  | "type"
  | "category"
  | "title"
  | "description"
  | "estimatedHours"
  | "urgency"
  | "postedBy"
  | "createdAt"
  | "expiresAt"
  | "locationZone"
  | "nodeId"
  | "signature"
>;

export interface PostStore {
  insert(post: PostRecord): void;
  list(opts?: { since?: number; limit?: number }): PostRecord[];
  count(): number;
  has(id: string): boolean;
}

/**
 * Per-peer pull state. Persisted so a server restart resumes pulling
 * from where it left off rather than re-fetching every record (which
 * would still be correct via `store.has(id)` dedup, but wasteful at
 * scale).
 */
/**
 * Per-peer pull cursor. Tracks the high-water mark for *each* record
 * kind we pull from a peer, so on restart the worker resumes from
 * where it left off rather than re-fetching the whole ledger.
 *
 * Cursor semantics:
 * - `lastCompletedAt` — used as `since=` on the next `/exchanges` pull
 * - `lastVouchCreatedAt` — used as `since=` on the next `/vouches` pull
 *
 * Both default to NULL ("never pulled this kind"), which the worker
 * interprets as "request everything" on first run.
 */
export interface PeerPullStateRow {
  peerUrl: string;
  lastPulledAt: number | null;
  lastSuccessAt: number | null;
  lastCompletedAt: number | null;
  lastVouchCreatedAt: number | null;
  lastPostCreatedAt: number | null;
  lastError: string | null;
  lastPulledCount: number;
}

export type PullRecordKind = "exchange" | "vouch" | "post";

export interface PeerPullStore {
  get(peerUrl: string): PeerPullStateRow | null;
  list(): PeerPullStateRow[];
  recordSuccess(opts: {
    peerUrl: string;
    kind: PullRecordKind;
    at: number;
    latestSeenAt: number | null;
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

  // Schema v3 — vouches federation. New `vouches` table mirrors the
  // exchanges table's shape and indexes. The `peer_pull_state` table
  // grows a `last_vouch_created_at` column so the per-kind cursors
  // share a single row per peer (denormalized but simple — adding a
  // third or fourth record kind later is just another column).
  if (current < 3) {
    db.exec(`
      CREATE TABLE vouches (
        id TEXT PRIMARY KEY,
        voucher_key TEXT NOT NULL,
        vouchee_key TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        kind TEXT NOT NULL,
        signature TEXT NOT NULL
      );
      CREATE INDEX vouches_created_at_idx ON vouches (created_at DESC);
      CREATE INDEX vouches_voucher_idx ON vouches (voucher_key);
      CREATE INDEX vouches_vouchee_idx ON vouches (vouchee_key);

      ALTER TABLE peer_pull_state
        ADD COLUMN last_vouch_created_at INTEGER;
    `);
    db.prepare(
      "INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', '3')",
    ).run();
  }

  // Schema v4 — posts federation. New `posts` table stores the
  // immutable signed subset of a Post (lifecycle fields stay local
  // to each PWA). `peer_pull_state` gets a fourth per-kind cursor.
  if (current < 4) {
    db.exec(`
      CREATE TABLE posts (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        category TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        estimated_hours REAL NOT NULL,
        urgency TEXT NOT NULL,
        posted_by TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        expires_at INTEGER,
        location_zone TEXT NOT NULL,
        node_id TEXT NOT NULL,
        signature TEXT NOT NULL
      );
      CREATE INDEX posts_created_at_idx ON posts (created_at DESC);
      CREATE INDEX posts_posted_by_idx ON posts (posted_by);
      CREATE INDEX posts_node_id_idx ON posts (node_id);

      ALTER TABLE peer_pull_state
        ADD COLUMN last_post_created_at INTEGER;
    `);
    db.prepare(
      "INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', '4')",
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

export function createVouchStore(db: DatabaseType): VouchStore {
  const insertStmt = db.prepare(`
    INSERT INTO vouches (
      id, voucher_key, vouchee_key, created_at, kind, signature
    ) VALUES (
      @id, @voucherKey, @voucheeKey, @createdAt, @kind, @signature
    )
  `);
  const hasStmt = db.prepare("SELECT 1 FROM vouches WHERE id = ?");
  const countStmt = db.prepare("SELECT COUNT(*) AS n FROM vouches");

  return {
    insert(vouch) {
      insertStmt.run({
        id: vouch.id,
        voucherKey: vouch.voucherKey,
        voucheeKey: vouch.voucheeKey,
        createdAt: vouch.createdAt,
        kind: vouch.kind,
        signature: vouch.signature,
      });
    },
    list({ since, limit } = {}) {
      const safeLimit = Math.max(1, Math.min(limit ?? 200, 1000));
      const rows = since
        ? db
            .prepare(
              `SELECT * FROM vouches WHERE created_at > ?
               ORDER BY created_at DESC LIMIT ?`,
            )
            .all(since, safeLimit)
        : db
            .prepare(
              `SELECT * FROM vouches
               ORDER BY created_at DESC LIMIT ?`,
            )
            .all(safeLimit);
      return (rows as VouchRow[]).map(rowToVouch);
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

interface VouchRow {
  id: string;
  voucher_key: string;
  vouchee_key: string;
  created_at: number;
  kind: string;
  signature: string;
}

function rowToVouch(r: VouchRow): SignedVouch {
  return {
    id: r.id,
    voucherKey: r.voucher_key,
    voucheeKey: r.vouchee_key,
    createdAt: r.created_at,
    kind: r.kind as SignedVouch["kind"],
    signature: r.signature,
  };
}

export function createPostStore(db: DatabaseType): PostStore {
  const insertStmt = db.prepare(`
    INSERT INTO posts (
      id, type, category, title, description, estimated_hours, urgency,
      posted_by, created_at, expires_at, location_zone, node_id, signature
    ) VALUES (
      @id, @type, @category, @title, @description, @estimatedHours, @urgency,
      @postedBy, @createdAt, @expiresAt, @locationZone, @nodeId, @signature
    )
  `);
  const hasStmt = db.prepare("SELECT 1 FROM posts WHERE id = ?");
  const countStmt = db.prepare("SELECT COUNT(*) AS n FROM posts");

  return {
    insert(post) {
      insertStmt.run({
        id: post.id,
        type: post.type,
        category: post.category,
        title: post.title,
        description: post.description,
        estimatedHours: post.estimatedHours,
        urgency: post.urgency,
        postedBy: post.postedBy,
        createdAt: post.createdAt,
        expiresAt: post.expiresAt,
        locationZone: post.locationZone,
        nodeId: post.nodeId,
        signature: post.signature,
      });
    },
    list({ since, limit } = {}) {
      const safeLimit = Math.max(1, Math.min(limit ?? 200, 1000));
      const rows = since
        ? db
            .prepare(
              `SELECT * FROM posts WHERE created_at > ?
               ORDER BY created_at DESC LIMIT ?`,
            )
            .all(since, safeLimit)
        : db
            .prepare(
              `SELECT * FROM posts
               ORDER BY created_at DESC LIMIT ?`,
            )
            .all(safeLimit);
      return (rows as PostRowSqlite[]).map(rowToPost);
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

interface PostRowSqlite {
  id: string;
  type: string;
  category: string;
  title: string;
  description: string;
  estimated_hours: number;
  urgency: string;
  posted_by: string;
  created_at: number;
  expires_at: number | null;
  location_zone: string;
  node_id: string;
  signature: string;
}

function rowToPost(r: PostRowSqlite): PostRecord {
  return {
    id: r.id,
    type: r.type as PostRecord["type"],
    category: r.category as PostRecord["category"],
    title: r.title,
    description: r.description,
    estimatedHours: r.estimated_hours,
    urgency: r.urgency as PostRecord["urgency"],
    postedBy: r.posted_by,
    createdAt: r.created_at,
    expiresAt: r.expires_at,
    locationZone: r.location_zone,
    nodeId: r.node_id,
    signature: r.signature,
  };
}

export function createPeerPullStore(db: DatabaseType): PeerPullStore {
  const getStmt = db.prepare("SELECT * FROM peer_pull_state WHERE peer_url = ?");
  const listStmt = db.prepare(
    "SELECT * FROM peer_pull_state ORDER BY peer_url",
  );
  // Two parameterized success statements — one per kind. Each
  // updates the matching cursor column via COALESCE so a pull that
  // returned no new rows preserves the existing high-water mark.
  //
  // Note: success deliberately does NOT clear `last_error`. The two
  // pulls (exchange + vouch) for the same peer run in parallel each
  // tick, and clearing `last_error` on success would race with a
  // concurrent failure update, hiding the failure. The accepted
  // trade is that `last_error` may hold a stale message after a
  // peer recovers; operators can read `last_success_at` vs.
  // `last_pulled_at` to tell whether the most recent attempt
  // succeeded. Per-kind error columns are a future refinement.
  const successExchangeStmt = db.prepare(`
    INSERT INTO peer_pull_state (
      peer_url, last_pulled_at, last_success_at, last_completed_at,
      last_pulled_count
    ) VALUES (
      @peerUrl, @at, @at, @latestSeenAt, @pulledCount
    )
    ON CONFLICT(peer_url) DO UPDATE SET
      last_pulled_at = @at,
      last_success_at = @at,
      last_completed_at = COALESCE(@latestSeenAt, last_completed_at),
      last_pulled_count = @pulledCount
  `);
  const successVouchStmt = db.prepare(`
    INSERT INTO peer_pull_state (
      peer_url, last_pulled_at, last_success_at, last_vouch_created_at,
      last_pulled_count
    ) VALUES (
      @peerUrl, @at, @at, @latestSeenAt, @pulledCount
    )
    ON CONFLICT(peer_url) DO UPDATE SET
      last_pulled_at = @at,
      last_success_at = @at,
      last_vouch_created_at = COALESCE(@latestSeenAt, last_vouch_created_at),
      last_pulled_count = @pulledCount
  `);
  const successPostStmt = db.prepare(`
    INSERT INTO peer_pull_state (
      peer_url, last_pulled_at, last_success_at, last_post_created_at,
      last_pulled_count
    ) VALUES (
      @peerUrl, @at, @at, @latestSeenAt, @pulledCount
    )
    ON CONFLICT(peer_url) DO UPDATE SET
      last_pulled_at = @at,
      last_success_at = @at,
      last_post_created_at = COALESCE(@latestSeenAt, last_post_created_at),
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
    recordSuccess({ peerUrl, kind, at, latestSeenAt, pulledCount }) {
      const stmt =
        kind === "exchange"
          ? successExchangeStmt
          : kind === "vouch"
            ? successVouchStmt
            : successPostStmt;
      stmt.run({ peerUrl, at, latestSeenAt, pulledCount });
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
  last_vouch_created_at: number | null;
  last_post_created_at: number | null;
  last_error: string | null;
  last_pulled_count: number;
}

function toState(r: PeerPullStateRowSqlite): PeerPullStateRow {
  return {
    peerUrl: r.peer_url,
    lastPulledAt: r.last_pulled_at,
    lastSuccessAt: r.last_success_at,
    lastCompletedAt: r.last_completed_at,
    lastVouchCreatedAt: r.last_vouch_created_at,
    lastPostCreatedAt: r.last_post_created_at,
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
