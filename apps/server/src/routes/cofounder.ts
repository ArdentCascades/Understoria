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
import type { FastifyInstance } from "fastify";
import {
  FOUNDER_NOMINATION_MAX_WINDOW_MS,
  canonicalReadAuthMessage,
  parseFounderAccession,
  parseFounderNomination,
  verify,
  verifyFounderAccession,
  verifyFounderNomination,
} from "@understoria/shared/crypto";
import type { FounderAccession } from "@understoria/shared/types";
import type { CofounderStore } from "../db.js";
import {
  READ_AUTH_MAX_SKEW_MS,
  type MembershipResolver,
} from "../readAuth.js";

/**
 * Co-founder ceremony (docs/cofounder-ceremony-plan.md §1, P2): the
 * in-band path from one founder root to two, without editing
 * NODE_FOUNDER_KEYS. Three surfaces, all OUTSIDE insertCaps.SURFACES
 * — each self-gates far more strictly than membership (sole-root
 * authority + dual signatures), and the two POST paths are named in
 * server.ts's write-sweep exemption alongside /claim-founder.
 *
 * POST /founder-nomination — the founder's half. Refusals, in check
 * order (each its own test):
 *   400 invalid_body            — shape (parseFounderNomination)
 *   400 invalid_expiry          — window non-forward or wider than
 *                                 FOUNDER_NOMINATION_MAX_WINDOW_MS
 *   409 wrong_node              — nomination names another node
 *   401 stale_nomination        — |now - nominatedAt| beyond
 *                                 READ_AUTH_MAX_SKEW_MS (the
 *                                 stale_claim precedent: the founder's
 *                                 device mints it fresh; resend
 *                                 re-signs)
 *   409 node_unclaimed          — no root exists at all
 *   409 root_count_not_one      — the gate: env ∪ claimed (deduped)
 *                                 must count exactly 1. Root COUNT,
 *                                 never trusted-circle size — the
 *                                 circle can shrink (reopening
 *                                 attack); the root count cannot.
 *   403 nominator_not_founder   — nominator is not that sole root
 *   409 nominee_not_a_member    — "invite them first — your invites
 *                                 work"
 *   409 nominee_already_founder — self-nomination lands here (with
 *                                 count == 1 the only founder nominee
 *                                 is the nominator)
 *   422 bad_signature           — verifyFounderNomination
 *   201 { stored: true }        — INSERT OR REPLACE per nominee
 *                                 (resend = replace); expired rows
 *                                 pruned on the write path.
 *
 * GET /founder-nomination/pending — nominee delivery. The messages-
 * route recipient-proof trio (x-understoria-key/-ts/-sig over
 * canonicalReadAuthMessage), verified in-route and READ_AUTH-
 * independent: a member can only ever fetch a nomination addressed
 * to a key they prove — no enumeration oracle. Returns
 * { nomination } — the proven key's unexpired nomination or null.
 *
 * POST /founder-accession — the nominee's half, stateless-verifiable
 * (the embedded nomination is the authority; the pending row is not
 * required — that is what makes reseed work). Refusals, in order:
 *   400 invalid_body               — shape (parseFounderAccession)
 *   409 wrong_node                 — embedded nomination names
 *                                    another node
 *   409 acceptance_out_of_window   — record-internal
 *                                    nominatedAt ≤ acceptedAt ≤
 *                                    expiresAt violated; ALWAYS
 *                                    enforced, reseed window or not
 *                                    (nominee clock skew lands here —
 *                                    copy points at date/time
 *                                    settings, the stale_claim
 *                                    precedent)
 *   422 bad_signature              — either layer fails
 *                                    (verifyFounderAccession)
 *   200 { ok, alreadyFounder }     — byte-identical replay of the
 *                                    stored accession (idempotent
 *                                    convergence)
 *   409 nomination_expired         — LIVE expiry (now past
 *                                    expiresAt); waived while the
 *                                    reseed grace window is open
 *                                    (routes/redemptions.ts
 *                                    reseedWindowOpen pattern) so the
 *                                    persisted artifact re-derives
 *                                    the root after total node loss
 *   409 root_count_not_one         — the transactional gate refused:
 *                                    roots ≠ exactly {nominator}. The
 *                                    losing racer of two accessions
 *                                    gets this, and so does any
 *                                    replay that isn't byte-identical.
 *   201 { ok: true }               — the transaction committed:
 *                                    claimed_founders + the permanent
 *                                    founder_accessions artifact +
 *                                    pending-row delete, atomically.
 */

export interface CofounderDeps {
  store: CofounderStore;
  /** Parsed NODE_FOUNDER_KEYS — the env half of the root set. */
  envFounderKeys: readonly string[];
  /** Live env ∪ claimed founder keys, deduped (server.ts closure) —
   *  the ROOT COUNT the nomination-side gate counts. */
  listFounderKeys: () => readonly string[];
  /** Live claim state (server.ts closure). */
  isClaimed: () => boolean;
  /** Membership closure — the nominee must already be a member. */
  resolver: MembershipResolver;
  nodeId: string;
  /** Re-seed window end (Config.reseedGraceUntil) — while open, the
   *  accession's LIVE expiry check is waived; the record-internal
   *  window never is. */
  reseedGraceUntil?: number | null;
  /** Injectable clock for tests. */
  now?: () => number;
}

export async function registerCofounderRoutes(
  app: FastifyInstance,
  deps: CofounderDeps,
): Promise<void> {
  const now = deps.now ?? Date.now;
  const reseedGraceUntil = deps.reseedGraceUntil ?? null;

  app.post("/founder-nomination", async (req, reply) => {
    const parsed = parseFounderNomination(req.body);
    if (!parsed.ok) {
      reply.code(400);
      return { error: "invalid_body", reason: parsed.error };
    }
    const nomination = parsed.value;

    const window = nomination.expiresAt - nomination.nominatedAt;
    if (window <= 0 || window > FOUNDER_NOMINATION_MAX_WINDOW_MS) {
      reply.code(400);
      return { error: "invalid_expiry" };
    }
    if (nomination.nodeId !== deps.nodeId) {
      reply.code(409);
      return { error: "wrong_node" };
    }
    if (Math.abs(now() - nomination.nominatedAt) > READ_AUTH_MAX_SKEW_MS) {
      reply.code(401);
      return { error: "stale_nomination" };
    }
    if (!deps.isClaimed()) {
      reply.code(409);
      return { error: "node_unclaimed" };
    }
    const roots = deps.listFounderKeys();
    if (roots.length !== 1) {
      reply.code(409);
      return { error: "root_count_not_one" };
    }
    if (nomination.nominatorKey !== roots[0]) {
      reply.code(403);
      return { error: "nominator_not_founder" };
    }
    if (!deps.resolver.isMember(nomination.nomineeKey)) {
      reply.code(409);
      return { error: "nominee_not_a_member" };
    }
    if (roots.includes(nomination.nomineeKey)) {
      reply.code(409);
      return { error: "nominee_already_founder" };
    }
    if (!verifyFounderNomination(nomination)) {
      reply.code(422);
      return { error: "bad_signature" };
    }

    // Shelf hygiene rides the write path (messages posture); then the
    // per-nominee INSERT OR REPLACE makes a resend supersede.
    deps.store.pruneExpiredNominations(now());
    deps.store.upsertNomination(nomination, now());
    reply.code(201);
    return { stored: true, nomineeKey: nomination.nomineeKey };
  });

  app.get("/founder-nomination/pending", async (req, reply) => {
    // Route-local recipient proof — the routes/messages.ts trio,
    // deliberately NOT delegated to the global read guard, which (a)
    // may be off and (b) proves membership, not "this nomination is
    // addressed to me".
    const authHeader = req.headers.authorization;
    if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
      reply.code(403);
      return reply.send({ error: "recipient_proof_required" });
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
      return reply.send({ error: "recipient_proof_required" });
    }
    const ts = Number.parseInt(tsRaw, 10);
    if (!Number.isFinite(ts) || Math.abs(now() - ts) > READ_AUTH_MAX_SKEW_MS) {
      reply.code(401);
      return reply.send({ error: "stale_read_signature" });
    }
    if (!verify(canonicalReadAuthMessage(req.url, ts), sig, key)) {
      reply.code(401);
      return reply.send({ error: "bad_read_signature" });
    }

    return { nomination: deps.store.getNominationForNominee(key, now()) };
  });

  app.post("/founder-accession", async (req, reply) => {
    const parsed = parseFounderAccession(req.body);
    if (!parsed.ok) {
      reply.code(400);
      return { error: "invalid_body", reason: parsed.error };
    }
    const accession = parsed.value;
    const nomination = accession.nomination;

    if (nomination.nodeId !== deps.nodeId) {
      reply.code(409);
      return { error: "wrong_node" };
    }
    // Record-internal window BEFORE the verifier (which also enforces
    // it): the nominee-clock-skew failure must surface as its own
    // error, not be folded into bad_signature.
    if (
      accession.acceptedAt < nomination.nominatedAt ||
      accession.acceptedAt > nomination.expiresAt
    ) {
      reply.code(409);
      return { error: "acceptance_out_of_window" };
    }
    if (!verifyFounderAccession(accession)) {
      reply.code(422);
      return { error: "bad_signature" };
    }

    // Byte-identical replay of the stored artifact converges to 200
    // BEFORE any live checks — an accepted accession stays accepted,
    // exactly like a stored redemption receipt replays 200 after its
    // grace window lapsed.
    const existing = deps.store.getAccession(nomination.nomineeKey);
    if (existing !== null && sameAccession(existing.accession, accession)) {
      reply.code(200);
      return { ok: true, alreadyFounder: true };
    }

    // LIVE expiry — waived inside an open reseed grace window (the
    // redemptions-route pattern): the persisted dual-signed artifact
    // is the recovery path for `claimed_founders` after total node
    // loss. The record-internal bounds above already held.
    const reseedWindowOpen =
      reseedGraceUntil !== null && now() < reseedGraceUntil;
    if (!reseedWindowOpen && now() > nomination.expiresAt) {
      reply.code(409);
      return { error: "nomination_expired" };
    }

    // THE TRANSACTION (plan §1): recount roots + both inserts +
    // pending-row delete, atomically. A losing racer — or any state
    // where the roots are not exactly {nominator} — refuses cleanly.
    if (!deps.store.accede(accession, deps.envFounderKeys, now())) {
      reply.code(409);
      return { error: "root_count_not_one" };
    }

    // Mirrors the claimFounder info line: the moment a root was added.
    app.log.info(
      { founderKey: nomination.nomineeKey },
      "co-founder acceded: second founder registered via dual-signed accession",
    );
    reply.code(201);
    return { ok: true };
  });
}

/** Byte-identical in the field sense: every signed field of both
 *  layers equal — the replay test for idempotent convergence. */
function sameAccession(a: FounderAccession, b: FounderAccession): boolean {
  return (
    a.acceptedAt === b.acceptedAt &&
    a.signature === b.signature &&
    a.nomination.nominatorKey === b.nomination.nominatorKey &&
    a.nomination.nomineeKey === b.nomination.nomineeKey &&
    a.nomination.nodeId === b.nomination.nodeId &&
    a.nomination.nominatedAt === b.nomination.nominatedAt &&
    a.nomination.expiresAt === b.nomination.expiresAt &&
    a.nomination.signature === b.nomination.signature
  );
}
