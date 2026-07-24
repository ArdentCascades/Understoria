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
  parseProposalClosure,
  parseSignedProposal,
  parseSignedVote,
  verifyProposal,
  verifyProposalClosure,
  verifyVote,
} from "@understoria/shared/crypto";
import type {
  ProposalClosureStore,
  ProposalStore,
  VoteStore,
} from "../db.js";
import type { MembershipResolver } from "../readAuth.js";
import type { TrustResolver } from "../trustGate.js";

interface Deps {
  proposalStore: ProposalStore;
  voteStore: VoteStore;
  closureStore: ProposalClosureStore;
  resolver: MembershipResolver;
  /** Mirror-internal marker (header name + per-boot token): mirror
   *  replication bypasses the passed-closure block-guard so a
   *  closure the ORIGIN accepted replicates verbatim — the honest
   *  layer for a disputed outcome is the client-side contested
   *  display, never a mirror set that silently diverges. It bypasses
   *  the closure trust gate below for the same reason. */
  internalHeader: string;
  internalToken: string;
  /**
   * Founder-rooted trust gate (trustGate.ts): SPEAKING a proposal's
   * outcome is a trusted-member power (operator decision closing
   * threat-model §7) — `passed` and `rejected` alike, because a
   * closure is first-writer-wins-permanent and an ungated `rejected`
   * would be a proposal-killing race primitive. The one exemption is
   * `withdrawn` signed by the proposal's own proposer: pending
   * members can propose, so they must be able to take back their own
   * proposal — withdrawal enacts nothing and is self-scoped.
   * Optional so existing tests/callers without the resolver keep the
   * member-only behavior (and a founderless node skips the gate via
   * `founderlessSkip`).
   */
  trust?: TrustResolver;
  /**
   * Re-seed window end (`Config.reseedGraceUntil`,
   * docs/community-reseed.md §3). While `now() < reseedGraceUntil`
   * the trust gate is skipped: the reseed walker re-uploads history
   * with `/proposal-closures` BEFORE `/vouches`, halting a kind on
   * 403 — without the exemption a closer whose vouch edges re-seed
   * later would wedge the kind. Same declared window `/redemptions`
   * rides; verification and first-writer-wins are untouched.
   */
  reseedGraceUntil?: number | null;
  /** Injectable clock for deterministic grace-window tests. */
  now?: () => number;
}

const MAX_FUTURE_MS = 24 * 60 * 60 * 1000;

/**
 * Proposal federation G1 (docs/proposal-federation.md §2-§3): signed
 * proposals, votes, and closures. Governance writes are the app's
 * MEMBER-GATED write surfaces — an invented key may post an offer,
 * but it may not vote (403 not_a_member). The removed-author gate
 * (readAuth.ts) additionally refuses removed members via the shared
 * SURFACES map.
 *
 * Status codes follow the house contract: 201 stored, 200
 * {stored:false} idempotent/stale, 400 malformed, 403 unauthorized
 * (not_a_member; closer_not_trusted on closures — retryable, see
 * Deps.trust), 409 retryable referent races (unknown_proposal — the
 * proposals pull runs first), 422 bad signature.
 */
export async function registerGovernanceRoutes(
  app: FastifyInstance,
  deps: Deps,
): Promise<void> {
  const {
    proposalStore,
    voteStore,
    closureStore,
    resolver,
    internalHeader,
    internalToken,
    trust,
    reseedGraceUntil = null,
    now = () => Date.now(),
  } = deps;

  // The closure trust gate for one request, or null when it does not
  // apply: no resolver wired, mirror replication (the closer's
  // standing was judged where the record first entered the
  // community), founderless node (no root ⇒ empty trusted set ⇒
  // governance welded shut before the community exists), or an open
  // reseed grace window (see Deps.reseedGraceUntil). Null means the
  // member-only rule stands alone.
  const activeTrustGate = (req: FastifyRequest): TrustResolver | null => {
    if (!trust) return null;
    if (req.headers[internalHeader] === internalToken) return null;
    if (reseedGraceUntil !== null && now() < reseedGraceUntil) return null;
    if (trust.founderlessSkip()) return null;
    return trust;
  };

  // POST /proposals is deliberately NOT trust-gated: pending members
  // keep proposing (operator decision — solidarity-first onboarding),
  // and the newcomer daily cap already bounds volume.
  app.post("/proposals", async (req, reply) => {
    const parsed = parseSignedProposal(req.body);
    if (!parsed.ok) {
      reply.code(400);
      return { error: "invalid_body", reason: parsed.error };
    }
    const record = parsed.value;
    if (record.createdAt > Date.now() + MAX_FUTURE_MS) {
      reply.code(400);
      return { error: "invalid_body", reason: "createdAt is in the future" };
    }
    if (!verifyProposal(record)) {
      reply.code(422);
      return { error: "bad_signature" };
    }
    if (!resolver.isMember(record.proposerKey)) {
      reply.code(403);
      return { error: "not_a_member" };
    }
    if (proposalStore.get(record.id)) {
      reply.code(200);
      return { stored: false, id: record.id };
    }
    proposalStore.insert(record);
    reply.code(201);
    return { stored: true, id: record.id };
  });

  // POST /votes is deliberately NOT trust-gated: blocks must flow
  // from EVERY member (one pending member's block still stops
  // passage), and affirms are stored regardless — they are judged at
  // COUNT time on every device (lib/autoCloseProposals.ts), so a
  // pending member's affirm starts counting the moment they become
  // trusted, with no migration.
  app.post("/votes", async (req, reply) => {
    const parsed = parseSignedVote(req.body);
    if (!parsed.ok) {
      reply.code(400);
      return { error: "invalid_body", reason: parsed.error };
    }
    const record = parsed.value;
    if (record.createdAt > Date.now() + MAX_FUTURE_MS) {
      reply.code(400);
      return { error: "invalid_body", reason: "createdAt is in the future" };
    }
    if (!verifyVote(record)) {
      reply.code(422);
      return { error: "bad_signature" };
    }
    if (!resolver.isMember(record.voterKey)) {
      reply.code(403);
      return { error: "not_a_member" };
    }
    if (!proposalStore.get(record.proposalId)) {
      reply.code(409);
      return { error: "unknown_proposal", proposalId: record.proposalId };
    }
    const stored = voteStore.get(record.proposalId, record.voterKey);
    if (stored && record.createdAt <= stored.createdAt) {
      reply.code(200);
      return { stored: false, id: record.id };
    }
    voteStore.upsert(record);
    reply.code(201);
    return { stored: true, id: record.id };
  });

  app.post("/proposal-closures", async (req, reply) => {
    const parsed = parseProposalClosure(req.body);
    if (!parsed.ok) {
      reply.code(400);
      return { error: "invalid_body", reason: parsed.error };
    }
    const record = parsed.value;
    if (record.closedAt > Date.now() + MAX_FUTURE_MS) {
      reply.code(400);
      return { error: "invalid_body", reason: "closedAt is in the future" };
    }
    if (!verifyProposalClosure(record)) {
      reply.code(422);
      return { error: "bad_signature" };
    }
    if (!resolver.isMember(record.closerKey)) {
      reply.code(403);
      return { error: "not_a_member" };
    }
    const proposal = proposalStore.get(record.proposalId);
    if (!proposal) {
      reply.code(409);
      return { error: "unknown_proposal", proposalId: record.proposalId };
    }
    const existing = closureStore.getByProposal(record.proposalId);
    if (existing) {
      // FIRST-WRITER-WINS: the community's answer is total. An
      // identical re-submission and a competing closure both land
      // here — 200, not a conflict, so outboxes settle.
      reply.code(200);
      return { stored: false, id: existing.id };
    }
    // Trusted-closer gate (see Deps.trust) — placed AFTER the
    // idempotent 200 so stored, pre-gate closures are grandfathered
    // and never re-judged, and BEFORE the standing-block guard. The
    // 403 is retryable by design: the PWA outbox holds the signed
    // closure as pending, so it delivers itself the day the closer
    // becomes trusted (or settles on the 200 above when a trusted
    // member closes first).
    const gate = activeTrustGate(req);
    if (
      gate !== null &&
      !gate.isTrusted(record.closerKey) &&
      !(
        record.outcome === "withdrawn" &&
        record.closerKey === proposal.proposerKey
      )
    ) {
      reply.code(403);
      return { error: "closer_not_trusted" };
    }
    // The parameter-free half of the eligibility rule: a closure may
    // not claim `passed` over a standing block among THIS node's
    // votes. (The config-dependent half — min affirms, deliberation
    // window — is re-checked on every device, which renders an
    // ineligible closure as contested; docs/proposal-federation.md
    // §2.) Mirror replication is exempt: the origin's accepted
    // decision replicates verbatim rather than letting mirror vote
    // timing diverge the set.
    const isMirrorApply = req.headers[internalHeader] === internalToken;
    if (record.outcome === "passed" && !isMirrorApply) {
      const latestByVoter = new Map<string, { createdAt: number; choice: string }>();
      for (const vote of voteStore.listForProposal(record.proposalId)) {
        const prev = latestByVoter.get(vote.voterKey);
        if (!prev || vote.createdAt > prev.createdAt) {
          latestByVoter.set(vote.voterKey, {
            createdAt: vote.createdAt,
            choice: vote.choice,
          });
        }
      }
      for (const v of latestByVoter.values()) {
        if (v.choice === "block") {
          reply.code(409);
          return { error: "standing_block" };
        }
      }
    }
    closureStore.insert(record);
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
  }>("/proposals", async (req) => {
    const proposals = proposalStore.list(parseListQuery(req.query));
    return { count: proposals.length, proposals };
  });

  app.get<{
    Querystring: { since?: string; sinceId?: string; limit?: string };
  }>("/votes", async (req) => {
    const votes = voteStore.list(parseListQuery(req.query));
    return { count: votes.length, votes };
  });

  app.get<{
    Querystring: { since?: string; sinceId?: string; limit?: string };
  }>("/proposal-closures", async (req) => {
    const proposalClosures = closureStore.list(parseListQuery(req.query));
    return { count: proposalClosures.length, proposalClosures };
  });
}
