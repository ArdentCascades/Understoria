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
import type { FastifyInstance, FastifyRequest } from "fastify";
import {
  canonicalMemberRemovalPayload,
  canonicalMemberReinstatementPayload,
  parseMemberRemoval,
  parseMemberReinstatement,
  validRemovalSigners,
} from "@understoria/shared/crypto";
import type {
  MemberRemovalStore,
  MemberReinstatementStore,
} from "../db.js";
import type { MembershipResolver } from "../readAuth.js";
import { MIRROR_INTERNAL_HEADER } from "../mirrorPull.js";
import type { TrustResolver } from "../trustGate.js";

interface Deps {
  removalStore: MemberRemovalStore;
  reinstatementStore: MemberReinstatementStore;
  resolver: MembershipResolver;
  removalQuorum: number;
  founderKeys: readonly string[];
  /**
   * Founder-rooted trust gate (trustGate.ts): a co-signature counts
   * toward quorum only from a TRUSTED member — removal/reinstatement
   * co-signing is a trusted-member power (operator decision 2026-07).
   * Optional so existing tests/callers without the resolver keep the
   * member-only behavior (and a founderless node skips the gate via
   * `founderlessSkip`).
   */
  trust?: TrustResolver;
  /**
   * `BuiltServer.internalBypassToken`. A POST carrying it is the
   * mirror-pull worker replicating a record ANOTHER node already
   * accepted — trust standing was judged where the record first
   * entered the community; re-litigating it here would make mirror
   * convergence diverge. Membership counting is NOT relaxed.
   */
  internalToken?: string;
}

/** Bound the signature array so a hostile body can't buy unbounded
 *  verification work. Far above any sane quorum. */
const MAX_SIGNATURES = 64;

/** decidedAt may not be stamped further than a day into the future
 *  (clock-slop tolerance, matching the createdAt bounds elsewhere). */
const MAX_FUTURE_MS = 24 * 60 * 60 * 1000;

/**
 * Member removal / reinstatement (docs/member-removal.md §2-§3) —
 * the first MULTI-signed record kind. Validity, enforced here at
 * ingestion (and re-enforced by every mirror through its own closure
 * when the record replicates):
 *
 *   ≥ removalQuorum signature entries where the signature verifies
 *   over the canonical payload, the signer is a MEMBER ignoring this
 *   record AND TRUSTED under the founder-rooted closure
 *   (trustGate.ts), the signer is not the subject, and signers are
 *   distinct.
 *
 * The trusted requirement is the operator decision of 2026-07:
 * removal co-signing is a trusted-member power. Below 3 trusted
 * members a community cannot remove — deliberate: at trusted-circle
 * 2 both are founders and the mechanism can't help. Grandfathering
 * is automatic: already-stored records hit the idempotent 200 path
 * below and are never re-judged. Mirror-internal requests keep the
 * membership count but bypass the trusted requirement (the record
 * was judged at its origin — see Deps.internalToken), and a
 * founderless node skips the trust half entirely.
 *
 * Status codes: 201 stored, 200 {stored:false} for a record id
 * already present (idempotent re-submission), 400 malformed, 403
 * last_founder (the closure must keep at least one root), 409
 * quorum_not_met (structurally valid but not enough signers are
 * members — or trusted members — HERE YET — retryable: a catching-up
 * mirror may simply not have pulled the signers' receipts or vouch
 * edges; a record the primary accepted converges once they land),
 * 422 bad_signatures (structural invalidity — cannot become valid
 * later).
 *
 * Cross-community replay: a record signed for another community
 * carries signers who are not members HERE, so it dies on the quorum
 * check — the closure, not the nodeId field, is the replay defense
 * (`nodeId` is attribution).
 */
export async function registerMemberRemovalRoutes(
  app: FastifyInstance,
  deps: Deps,
): Promise<void> {
  const {
    removalStore,
    reinstatementStore,
    resolver,
    removalQuorum,
    founderKeys,
    trust,
    internalToken,
  } = deps;

  // The trust gate for one request, or null when it does not apply:
  // no resolver wired, founderless node (no root ⇒ empty trusted set
  // ⇒ removal would be welded shut before the community exists), or
  // mirror replication (see Deps.internalToken). Null means the
  // member-only rule stands alone.
  const activeTrustGate = (req: FastifyRequest): TrustResolver | null => {
    if (!trust) return null;
    if (
      internalToken !== undefined &&
      req.headers[MIRROR_INTERNAL_HEADER] === internalToken
    ) {
      return null;
    }
    if (trust.founderlessSkip()) return null;
    return trust;
  };

  // Both quorum halves in one pass so the 409 reason names the check
  // that actually fell short: membership first (a non-member cannot
  // be trusted), then trust.
  const countSigners = (
    signers: ReadonlySet<string>,
    gate: TrustResolver | null,
  ): { memberSigners: number; trustedSigners: number } => {
    let memberSigners = 0;
    let trustedSigners = 0;
    for (const key of signers) {
      if (!resolver.isMember(key)) continue;
      memberSigners += 1;
      if (gate === null || gate.isTrusted(key)) trustedSigners += 1;
    }
    return { memberSigners, trustedSigners };
  };

  app.post("/member-removals", async (req, reply) => {
    const parsed = parseMemberRemoval(req.body);
    if (!parsed.ok) {
      reply.code(400);
      return { error: "invalid_body", reason: parsed.error };
    }
    const record = parsed.value;
    if (record.signatures.length > MAX_SIGNATURES) {
      reply.code(400);
      return { error: "invalid_body", reason: "too many signatures" };
    }
    if (record.decidedAt > Date.now() + MAX_FUTURE_MS) {
      reply.code(400);
      return { error: "invalid_body", reason: "decidedAt is in the future" };
    }

    if (removalStore.get(record.id)) {
      reply.code(200);
      return { stored: false, id: record.id };
    }

    const signers = validRemovalSigners(
      canonicalMemberRemovalPayload(record),
      record.removedKey,
      record.signatures,
    );
    if (signers.size < removalQuorum) {
      reply.code(422);
      return { error: "bad_signatures", reason: "quorum of valid signatures not met" };
    }
    // Membership + trust halves of the rule — "ignoring this record"
    // is the current closure, since the record is not stored yet. A
    // signer who is currently removed is not a member and does not
    // count; an untrusted member counts only while the gate is off.
    const { memberSigners, trustedSigners } = countSigners(
      signers,
      activeTrustGate(req),
    );
    if (memberSigners < removalQuorum) {
      reply.code(409);
      return { error: "quorum_not_met", reason: "not enough signers are members of this community" };
    }
    if (trustedSigners < removalQuorum) {
      reply.code(409);
      return { error: "quorum_not_met", reason: "not enough signers are trusted members of this community" };
    }

    // Last-founder guard: the closure must keep at least one root.
    if (founderKeys.includes(record.removedKey)) {
      const otherLiveFounder = founderKeys.some(
        (k) => k !== record.removedKey && !resolver.isRemoved(k),
      );
      if (!otherLiveFounder) {
        reply.code(403);
        return { error: "last_founder" };
      }
    }

    removalStore.insert(record);
    reply.code(201);
    return { stored: true, id: record.id };
  });

  app.post("/member-reinstatements", async (req, reply) => {
    const parsed = parseMemberReinstatement(req.body);
    if (!parsed.ok) {
      reply.code(400);
      return { error: "invalid_body", reason: parsed.error };
    }
    const record = parsed.value;
    if (record.signatures.length > MAX_SIGNATURES) {
      reply.code(400);
      return { error: "invalid_body", reason: "too many signatures" };
    }
    if (record.decidedAt > Date.now() + MAX_FUTURE_MS) {
      reply.code(400);
      return { error: "invalid_body", reason: "decidedAt is in the future" };
    }

    if (reinstatementStore.get(record.id)) {
      reply.code(200);
      return { stored: false, id: record.id };
    }

    const signers = validRemovalSigners(
      canonicalMemberReinstatementPayload(record),
      record.reinstatedKey,
      record.signatures,
    );
    if (signers.size < removalQuorum) {
      reply.code(422);
      return { error: "bad_signatures", reason: "quorum of valid signatures not met" };
    }
    const { memberSigners, trustedSigners } = countSigners(
      signers,
      activeTrustGate(req),
    );
    if (memberSigners < removalQuorum) {
      reply.code(409);
      return { error: "quorum_not_met", reason: "not enough signers are members of this community" };
    }
    if (trustedSigners < removalQuorum) {
      reply.code(409);
      return { error: "quorum_not_met", reason: "not enough signers are trusted members of this community" };
    }

    reinstatementStore.insert(record);
    reply.code(201);
    return { stored: true, id: record.id };
  });

  const parseListQuery = (q: {
    since?: string;
    sinceId?: string;
    limit?: string;
  }) => {
    const since = q.since ? Number.parseInt(q.since, 10) : undefined;
    const limit = q.limit ? Number.parseInt(q.limit, 10) : undefined;
    return {
      since:
        since !== undefined && Number.isFinite(since) && since >= 0
          ? since
          : undefined,
      sinceId: q.sinceId && q.sinceId.length > 0 ? q.sinceId : undefined,
      limit:
        limit !== undefined && Number.isFinite(limit) && limit > 0
          ? limit
          : undefined,
    };
  };

  app.get<{
    Querystring: { since?: string; sinceId?: string; limit?: string };
  }>("/member-removals", async (req) => {
    const memberRemovals = removalStore.list(parseListQuery(req.query));
    return { count: memberRemovals.length, memberRemovals };
  });

  app.get<{
    Querystring: { since?: string; sinceId?: string; limit?: string };
  }>("/member-reinstatements", async (req) => {
    const memberReinstatements = reinstatementStore.list(
      parseListQuery(req.query),
    );
    return { count: memberReinstatements.length, memberReinstatements };
  });
}
