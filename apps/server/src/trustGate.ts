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
import type { Database as DatabaseType } from "better-sqlite3-multiple-ciphers";
import { computeTrustedSet, type TrustEdge } from "@understoria/shared/trust";

/**
 * Server-side founder-rooted TRUST (docs sibling of the client's
 * lib/vouch.ts `trustStatusWithInvites`) — the node's half of the
 * sybil fix in @understoria/shared/trust:
 *
 *   trusted(m) = m is a founder root
 *                OR m has >= 2 distinct vouchers who are THEMSELVES
 *                   trusted (least fixpoint from the founder set)
 *
 * Edges, chosen to match the client byte-for-byte:
 *   - Redemption receipts: every row in `redemptions` is a
 *     consummated redemption, so each one is the implicit vouch
 *     "inviter_key vouches redeemed_by". The client counts invite
 *     statuses `redeemed` AND `redeemed_despite_revocation`; on the
 *     server both land as (and remain) plain `redemptions` rows — a
 *     revocation arriving after the receipt never deletes the row
 *     (invite-revocation Phase 1, "behaves as today") — so reading
 *     every row IS the same rule.
 *   - Manual vouches: every row in `vouches`. Signature validity is
 *     the caller's job per the shared module's contract — and every
 *     path that inserts a vouch row (POST /vouches, the peer-pull
 *     worker, mirror replication re-POSTing through the route) runs
 *     `verifyVouch` first, so rows can be read back as valid without
 *     re-verifying here.
 *
 * Founder roots come from the SAME resolution the membership closure
 * uses (readAuth.ts / server.ts): env NODE_FOUNDER_KEYS ∪ the in-band
 * `claimed_founders` table. Config parsing stays in config.ts — this
 * module receives the parsed env keys and reads claimed founders
 * live, so a founder claim landing mid-process takes effect without
 * a restart, exactly like `isClaimed` in server.ts.
 *
 * Caching mirrors createMembershipResolver's stamp pattern: all
 * three source tables are append-only (a vouch or receipt is never
 * deleted; a claimed founder is retired via quorum removal, not row
 * deletion), so row counts are a complete change signal and the
 * fixpoint is rebuilt only when a count moves.
 */

export interface TrustResolver {
  /** Is `publicKey` in the founder-rooted trusted set right now? */
  isTrusted(publicKey: string): boolean;
  /**
   * True when the gate cannot run: no env founder keys AND no
   * claimed founder — an unclaimed node has no trust root, so the
   * fixpoint would be empty and EVERY vouch/receipt would be
   * refused, welding the door shut before the community exists.
   * Callers skip the gate (old behavior) when this returns true;
   * the first skip logs a one-time warning, matching the loud-but-
   * tolerant posture server.ts takes for the unclaimed state.
   */
  founderlessSkip(): boolean;
  /** Test/inspection hook: the current trusted set (forces a build). */
  trustedSet(): ReadonlySet<string>;
}

/** One founder-rooted fixpoint over the node's stored edges. Exposed
 *  for tests and one-off callers; routes go through the caching
 *  resolver below. */
export function computeServerTrustedSet(
  db: DatabaseType,
  envFounderKeys: readonly string[],
): Set<string> {
  const roots = new Set<string>(envFounderKeys);
  const claimed = db
    .prepare("SELECT founder_key FROM claimed_founders")
    .all() as { founder_key: string }[];
  for (const row of claimed) roots.add(row.founder_key);
  return computeTrustedSet(roots, collectEdges(db));
}

/** Convenience point-query. Routes use createTrustResolver (cached). */
export function isTrusted(
  db: DatabaseType,
  envFounderKeys: readonly string[],
  publicKey: string,
): boolean {
  return computeServerTrustedSet(db, envFounderKeys).has(publicKey);
}

function collectEdges(db: DatabaseType): TrustEdge[] {
  const edges: TrustEdge[] = [];
  const receipts = db
    .prepare("SELECT inviter_key, redeemed_by FROM redemptions")
    .all() as { inviter_key: string; redeemed_by: string }[];
  for (const r of receipts) {
    edges.push({ voucherKey: r.inviter_key, voucheeKey: r.redeemed_by });
  }
  // Verified at insert on every write path (see module comment) —
  // reading rows back as signature-valid is sound.
  const vouches = db
    .prepare("SELECT voucher_key, vouchee_key FROM vouches")
    .all() as { voucher_key: string; vouchee_key: string }[];
  for (const v of vouches) {
    edges.push({ voucherKey: v.voucher_key, voucheeKey: v.vouchee_key });
  }
  return edges;
}

export function createTrustResolver(
  db: DatabaseType,
  deps: {
    /** Parsed NODE_FOUNDER_KEYS (config.founderKeys) — the env half
     *  of the same root set readAuth's membership closure uses. */
    envFounderKeys: readonly string[];
    /** One-time founderless warning sink (app.log.warn). */
    warn?: (msg: string) => void;
  },
): TrustResolver {
  const countStmt = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM redemptions) AS receipts,
      (SELECT COUNT(*) FROM vouches) AS vouches,
      (SELECT COUNT(*) FROM claimed_founders) AS claimed
  `);
  const claimedCountStmt = db.prepare(
    "SELECT COUNT(*) AS n FROM claimed_founders",
  );

  let cache: Set<string> | null = null;
  let cachedAtCounts = "";
  let warnedFounderless = false;
  let warnedSingleFounder = false;

  function current(): Set<string> {
    const counts = countStmt.get() as {
      receipts: number;
      vouches: number;
      claimed: number;
    };
    const stamp = `${counts.receipts}:${counts.vouches}:${counts.claimed}`;
    if (cache === null || stamp !== cachedAtCounts) {
      cache = computeServerTrustedSet(db, deps.envFounderKeys);
      cachedAtCounts = stamp;
      // Single-founder visibility (docs/cofounder-ceremony-plan.md):
      // with exactly ONE root (env ∪ claimed, deduped), trusted needs
      // two distinct trusted vouchers that can never exist — the
      // founder alone can never promote anyone. One-time and lazy,
      // the founderless warn's sibling; checked only on rebuild (the
      // stamp covers claimed_founders, and env keys are static).
      if (!warnedSingleFounder) {
        const roots = new Set<string>(deps.envFounderKeys);
        const claimed = db
          .prepare("SELECT founder_key FROM claimed_founders")
          .all() as { founder_key: string }[];
        for (const row of claimed) roots.add(row.founder_key);
        if (roots.size === 1) {
          warnedSingleFounder = true;
          deps.warn?.(
            "node has exactly ONE founder root: no member can ever reach trusted (promotion needs two distinct trusted vouchers). Add a co-founder (POST /founder-nomination → /founder-accession) or a second NODE_FOUNDER_KEYS root.",
          );
        }
      }
    }
    return cache;
  }

  return {
    isTrusted(publicKey) {
      return current().has(publicKey);
    },
    founderlessSkip() {
      if (deps.envFounderKeys.length > 0) return false;
      const claimed = (claimedCountStmt.get() as { n: number }).n;
      if (claimed > 0) return false;
      if (!warnedFounderless) {
        warnedFounderless = true;
        deps.warn?.(
          "no founder configured (no NODE_FOUNDER_KEYS, no claimed founder): founder-rooted trust gates on /vouches, /redemptions and /invite-announcements are SKIPPED. Claim the node (or set NODE_FOUNDER_KEYS) to enable them.",
        );
      }
      return true;
    },
    trustedSet() {
      return current();
    },
  };
}
