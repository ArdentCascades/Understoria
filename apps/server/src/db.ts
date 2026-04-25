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
