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
import { verifyVouch } from "@understoria/shared/crypto";
import type { VouchStore } from "../db.js";
import { parseVouch } from "../validate.js";
import { MIRROR_INTERNAL_HEADER } from "../mirrorPull.js";
import type { TrustResolver } from "../trustGate.js";

interface Deps {
  store: VouchStore;
  /**
   * Founder-rooted trust gate (trustGate.ts): only a TRUSTED voucher
   * may add a vouch edge — the server half of the sybil fix in
   * @understoria/shared/trust. Optional so existing tests/callers
   * without the resolver keep the old behavior (and a founderless
   * node skips the gate via `founderlessSkip`).
   */
  trust?: TrustResolver;
  /**
   * `BuiltServer.internalBypassToken`. A POST carrying it is the
   * mirror-pull worker replicating a vouch ANOTHER node already
   * accepted — trust standing was judged where the record first
   * entered the community; re-litigating it here would make mirror
   * convergence diverge. Signature verification is NOT relaxed.
   */
  internalToken?: string;
}

/**
 * POST /vouches
 *   - Body: signed SignedVouch JSON.
 *   - Side effects: persist if novel and cryptographically valid.
 *   - Status codes:
 *       201 — accepted (new row inserted)
 *       200 — already had this row (idempotent re-submission)
 *       400 — malformed body
 *       403 — voucher is not in the founder-rooted trusted set
 *             (`voucher_not_trusted`) — a pending member's vouch adds
 *             no trust under the rooted fixpoint, so storing the edge
 *             would only feed a sybil cluster's bookkeeping. 4xx on
 *             purpose: the PWA outbox treats it as non-retryable,
 *             which is right — retrying can't help until the
 *             voucher's own trust changes.
 *       422 — well-formed but signature doesn't verify
 *
 * GET /vouches
 *   - Query: ?since=<ms>&limit=<n>
 *   - Returns the most recent vouches newer than `since` (or just the
 *     most recent if `since` is omitted), capped at `limit` (default
 *     200, hard ceiling 1000). All rows are signed; any peer can
 *     verify independently — same model as /exchanges.
 */
export async function registerVouchRoutes(
  app: FastifyInstance,
  { store, trust, internalToken }: Deps,
): Promise<void> {
  app.post("/vouches", async (req, reply) => {
    const isMirrorApply =
      internalToken !== undefined &&
      req.headers[MIRROR_INTERNAL_HEADER] === internalToken;
    const parsed = parseVouch(req.body);
    if (!parsed.ok) {
      reply.code(400);
      return { error: "invalid_body", reason: parsed.error };
    }
    const vouch = parsed.value;

    if (!verifyVouch(vouch)) {
      reply.code(422);
      return { error: "bad_signature" };
    }

    if (store.has(vouch.id)) {
      reply.code(200);
      return { stored: false, id: vouch.id };
    }

    // Founder-rooted trust gate — NEW rows only (the has() replay
    // above stays idempotent-200), and never for mirror replication
    // (see Deps.internalToken). A founderless node skips the gate:
    // with no root the trusted set is empty and every vouch would be
    // refused; trustGate.ts logs the one-time warning.
    if (
      trust &&
      !isMirrorApply &&
      !trust.founderlessSkip() &&
      !trust.isTrusted(vouch.voucherKey)
    ) {
      reply.code(403);
      return { error: "voucher_not_trusted" };
    }

    store.insert(vouch);
    reply.code(201);
    return { stored: true, id: vouch.id };
  });

  app.get<{ Querystring: { since?: string; sinceId?: string; limit?: string } }>(
    "/vouches",
    async (req) => {
      const since = req.query.since
        ? Number.parseInt(req.query.since, 10)
        : undefined;
      const limit = req.query.limit
        ? Number.parseInt(req.query.limit, 10)
        : undefined;
      const safeSince =
        since !== undefined && Number.isFinite(since) && since >= 0
          ? since
          : undefined;
      const safeLimit =
        limit !== undefined && Number.isFinite(limit) && limit > 0
          ? limit
          : undefined;
      // Composite pair cursor (docs/composite-federation-cursors.md §2):
      // strictly-after-(since,sinceId) paging when both are present;
      // ignored without `since`, so it degrades to the legacy cursor.
      const safeSinceId =
        req.query.sinceId && req.query.sinceId.length > 0
          ? req.query.sinceId
          : undefined;
      const vouches = store.list({ since: safeSince, sinceId: safeSinceId, limit: safeLimit });
      return { count: vouches.length, vouches };
    },
  );
}
