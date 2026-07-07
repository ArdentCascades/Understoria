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
import type { FastifyInstance } from "fastify";
import type { Database as DatabaseType } from "better-sqlite3-multiple-ciphers";
import {
  canonicalReadAuthMessage,
  verify,
} from "@understoria/shared/crypto";

/**
 * Member-authenticated reads — docs/member-authenticated-reads.md.
 *
 * Joining the community is invite-gated; until this module, READING
 * it was not: every federation GET feed answered anyone who knew the
 * URL. This guard closes that gap without creating any new membership
 * register — it derives "who is a member" from artifacts the node
 * already stores and verifies:
 *
 *   member set = ( NODE_FOUNDER_KEYS
 *                ∪ transitive closure over verified redemption
 *                  receipts whose inviter was not removed at
 *                  redeemedAt )
 *                ∖ keys currently removed by quorum record
 *
 * Reads carry `x-understoria-key` / `-ts` / `-sig` headers signing
 * `canonicalReadAuthMessage(path+query, ts)`; the timestamp must be
 * within ±10 minutes (a replay bound — reads are idempotent, so a
 * nonce scheme buys nothing further). Peer nodes authenticate with a
 * shared bearer token from PEER_READ_TOKENS instead.
 *
 * The former "membership is append-only" bound is CLOSED
 * (docs/member-removal.md M1): quorum-signed MemberRemoval records
 * subtract from the closure, with a non-retroactive chain rule, and
 * MemberReinstatement records reopen the door. Threat-model §7
 * records the quorum trust assumption that replaced the residual.
 */

/** Clock skew + capture window for a signed read. */
export const READ_AUTH_MAX_SKEW_MS = 10 * 60 * 1000;

/**
 * Surfaces that stay OPEN under enforcement, each self-limiting:
 *  - /health: liveness + the origin-suggest probe.
 *  - /config: operator transparency + system-key discovery — needed
 *    BEFORE membership is provable (a fresh invitee configures the
 *    node from here).
 *  - /device-link, /link-request: a brand-new device has no identity
 *    yet; those surfaces authenticate by unguessable ids/ciphertext
 *    and carry their own TTLs and caps (docs/device-pairing.md §6).
 */
const OPEN_PATH_PREFIXES = ["/health", "/config", "/device-link", "/link-request"];

export interface MembershipResolver {
  isMember(publicKey: string): boolean;
  /** Standing check for the write gate: currently removed by a
   *  quorum record (docs/member-removal.md). A key can be removed
   *  without ever having been reachable (defensive: such a record
   *  should not exist, but the answer is still honest). */
  isRemoved(publicKey: string): boolean;
  /** Test/inspection hook: the current member count (forces a build). */
  memberCount(): number;
}

/** One standing event: `removal` true = removed, false = reinstated. */
interface StandingEvent {
  decidedAt: number;
  removal: boolean;
}

/**
 * Was `key` removed as of time `t`? The latest event with
 * `decidedAt ≤ t` decides; at an exact timestamp tie a reinstatement
 * wins (the door reopening is the benign default — documented and
 * tested, identical everywhere this rule runs).
 */
function removedAt(
  standing: Map<string, StandingEvent[]>,
  key: string,
  t: number,
): boolean {
  const events = standing.get(key);
  if (!events) return false;
  let latest: StandingEvent | null = null;
  for (const e of events) {
    if (e.decidedAt > t) continue;
    if (
      latest === null ||
      e.decidedAt > latest.decidedAt ||
      (e.decidedAt === latest.decidedAt && latest.removal && !e.removal)
    ) {
      latest = e;
    }
  }
  return latest !== null && latest.removal;
}

/**
 * Membership from founder roots + the redemption-receipt chain,
 * minus quorum removals (docs/member-removal.md §3):
 *
 *   member = reachable through the closure
 *            AND not currently removed
 *
 * Removal-aware chain rule, non-retroactive by design: a receipt
 * extends the closure iff its inviter was NOT removed at
 * `redeemedAt` — a removed member's PRE-removal invitees remain
 * members (their joining was legitimate; removal never cascades),
 * while their unredeemed invites die with the removal. Reachability
 * therefore keeps removed keys as CONDUITS for their historical
 * edges; only the final membership test subtracts them.
 *
 * The closure is cached and rebuilt when the redemptions, removals,
 * or reinstatements tables grow (all three are append-only, so row
 * counts are a complete change signal). The current-standing check
 * is evaluated live against the cached standing map so a record
 * whose decidedAt has just passed takes effect without waiting for
 * an unrelated write.
 */
export function createMembershipResolver(
  db: DatabaseType,
  founderKeys: readonly string[],
): MembershipResolver {
  const edgesStmt = db.prepare(
    "SELECT inviter_key, redeemed_by, redeemed_at FROM redemptions",
  );
  const countStmt = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM redemptions) AS receipts,
      (SELECT COUNT(*) FROM member_removals) AS removals,
      (SELECT COUNT(*) FROM member_reinstatements) AS reinstatements
  `);
  const standingStmt = db.prepare(`
    SELECT removed_key AS key, decided_at, 1 AS removal
      FROM member_removals
    UNION ALL
    SELECT reinstated_key AS key, decided_at, 0 AS removal
      FROM member_reinstatements
  `);

  let reachableCache: Set<string> | null = null;
  let standingCache: Map<string, StandingEvent[]> | null = null;
  let cachedAtCounts = "";

  function build(): void {
    const standing = new Map<string, StandingEvent[]>();
    const standingRows = standingStmt.all() as {
      key: string;
      decided_at: number;
      removal: number;
    }[];
    for (const row of standingRows) {
      const list = standing.get(row.key) ?? [];
      list.push({ decidedAt: row.decided_at, removal: row.removal === 1 });
      standing.set(row.key, list);
    }

    const reachable = new Set<string>(founderKeys);
    const rows = edgesStmt.all() as {
      inviter_key: string;
      redeemed_by: string;
      redeemed_at: number;
    }[];
    // BFS over invite edges. Receipts were signature-verified at
    // ingestion (route + verifyRedemptionReceipt), so each row is a
    // cryptographic attestation "inviter admitted redeemer"; rooting
    // at the founders is what makes it a membership proof rather
    // than a self-serve list. The removal chain rule filters each
    // edge by the inviter's standing AT REDEMPTION TIME.
    let grew = true;
    while (grew) {
      grew = false;
      for (const row of rows) {
        if (
          reachable.has(row.inviter_key) &&
          !reachable.has(row.redeemed_by) &&
          !removedAt(standing, row.inviter_key, row.redeemed_at)
        ) {
          reachable.add(row.redeemed_by);
          grew = true;
        }
      }
    }
    reachableCache = reachable;
    standingCache = standing;
  }

  function current(): { reachable: Set<string>; standing: Map<string, StandingEvent[]> } {
    const counts = countStmt.get() as {
      receipts: number;
      removals: number;
      reinstatements: number;
    };
    const stamp = `${counts.receipts}:${counts.removals}:${counts.reinstatements}`;
    if (reachableCache === null || standingCache === null || stamp !== cachedAtCounts) {
      build();
      cachedAtCounts = stamp;
    }
    return { reachable: reachableCache!, standing: standingCache! };
  }

  return {
    isMember(publicKey) {
      const { reachable, standing } = current();
      return reachable.has(publicKey) && !removedAt(standing, publicKey, Date.now());
    },
    isRemoved(publicKey) {
      const { standing } = current();
      return removedAt(standing, publicKey, Date.now());
    },
    memberCount() {
      const { reachable, standing } = current();
      let n = 0;
      const now = Date.now();
      for (const key of reachable) {
        if (!removedAt(standing, key, now)) n += 1;
      }
      return n;
    },
  };
}

/**
 * The write half of removal (docs/member-removal.md §3): POSTs whose
 * attributable author key is currently removed are refused 403
 * `author_removed`. The removed member's history stands; their pen
 * is out. Registered UNCONDITIONALLY (independent of READ_AUTH — a
 * community that hasn't turned on read gating still gets its removal
 * decisions enforced on writes).
 *
 * Reuses the insert-cap SURFACES attribution (path → body keyField).
 * Two deliberate exemptions:
 *   - requests carrying the mirror worker's per-boot internal token:
 *     mirror replication re-POSTs HISTORICAL records through these
 *     routes, and a removed member's pre-removal history must keep
 *     replicating — history is history;
 *   - multi-signed surfaces (keyField null — /member-removals itself,
 *     /member-reinstatements, /auto-confirm): their authority rules
 *     live in-route.
 * Gate coverage note (threat-model §7): the gate checks the SIGNING
 * author each surface validates (e.g. /exchanges gates helperKey; a
 * record naming a removed counterparty still lands — the ledger
 * records what happened, it does not police who may be helped).
 */
export function registerRemovedAuthorGuard(
  app: FastifyInstance,
  deps: {
    resolver: MembershipResolver;
    surfaces: Record<string, { keyField: string | null }>;
    internalHeader: string;
    internalToken: string;
  },
): void {
  app.addHook("preHandler", async (req, reply) => {
    if (req.method !== "POST") return;
    if (req.headers[deps.internalHeader] === deps.internalToken) return;
    const surface = deps.surfaces[req.url.split("?")[0]];
    if (!surface || !surface.keyField) return;
    const body = req.body as Record<string, unknown> | null;
    const key =
      body && typeof body[surface.keyField] === "string"
        ? (body[surface.keyField] as string)
        : null;
    if (key && deps.resolver.isRemoved(key)) {
      reply.code(403);
      return reply.send({ error: "author_removed" });
    }
  });
}

export interface ReadAuthDeps {
  readAuth: "off" | "on";
  resolver: MembershipResolver;
  /** Accepted peer bearer tokens (values of PEER_READ_TOKENS). */
  peerTokens: readonly string[];
  /** Injectable clock for tests. */
  now?: () => number;
}

export function registerReadAuthGuard(
  app: FastifyInstance,
  deps: ReadAuthDeps,
): void {
  if (deps.readAuth !== "on") return;
  const now = deps.now ?? Date.now;
  const peerTokens = new Set(deps.peerTokens);

  // Deny-by-default over GETs: a future feed route is covered the day
  // it's registered, instead of depending on someone remembering to
  // add it to a protected-paths list.
  app.addHook("onRequest", async (req, reply) => {
    if (req.method !== "GET") return;
    const path = req.url.split("?")[0];
    if (OPEN_PATH_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))) {
      return;
    }

    // Peer nodes: shared bearer token (docs/member-authenticated-reads.md §1).
    const authHeader = req.headers.authorization;
    if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
      if (peerTokens.has(authHeader.slice("Bearer ".length))) return;
      reply.code(401);
      return reply.send({ error: "member_read_required" });
    }

    const key = req.headers["x-understoria-key"];
    const tsRaw = req.headers["x-understoria-ts"];
    const sig = req.headers["x-understoria-sig"];
    if (
      typeof key !== "string" ||
      typeof tsRaw !== "string" ||
      typeof sig !== "string"
    ) {
      reply.code(401);
      return reply.send({ error: "member_read_required" });
    }
    const ts = Number.parseInt(tsRaw, 10);
    if (
      !Number.isFinite(ts) ||
      Math.abs(now() - ts) > READ_AUTH_MAX_SKEW_MS
    ) {
      reply.code(401);
      return reply.send({ error: "stale_read_signature" });
    }
    // The signed message covers path AND query (req.url), so a
    // captured header can't be replayed against a different cursor.
    if (!verify(canonicalReadAuthMessage(req.url, ts), sig, key)) {
      reply.code(401);
      return reply.send({ error: "bad_read_signature" });
    }
    if (!deps.resolver.isMember(key)) {
      reply.code(403);
      return reply.send({ error: "not_a_member" });
    }
  });
}
