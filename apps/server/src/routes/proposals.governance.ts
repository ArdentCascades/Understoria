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

interface Deps {
  proposalStore: ProposalStore;
  voteStore: VoteStore;
  closureStore: ProposalClosureStore;
  resolver: MembershipResolver;
  /** Mirror-internal marker (header name + per-boot token): mirror
   *  replication bypasses the passed-closure block-guard so a
   *  closure the ORIGIN accepted replicates verbatim — the honest
   *  layer for a disputed outcome is the client-side contested
   *  display, never a mirror set that silently diverges. */
  internalHeader: string;
  internalToken: string;
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
 * {stored:false} idempotent/stale, 400 malformed, 403 unauthorized,
 * 409 retryable referent races (unknown_proposal — the proposals
 * pull runs first), 422 bad signature.
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
  } = deps;

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
    if (!proposalStore.get(record.proposalId)) {
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
