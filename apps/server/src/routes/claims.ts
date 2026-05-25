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
import type { ClaimStore } from "../db.js";

interface Deps {
  store: ClaimStore;
}

/**
 * POST /claims
 *   - Body: { postId, claimerKey, claimedAt, nodeId }
 *   - Unsigned — claims are lightweight notifications, not
 *     authoritative records. The exchange itself (signed by both
 *     parties) is the source of truth.
 *   - Status codes:
 *       201 — accepted
 *       200 — already had this claim (idempotent)
 *       400 — malformed body
 *
 * GET /claims
 *   - Query: ?since=<ms>&limit=<n>
 *   - Returns claims newer than `since`, for peer pull.
 */
export async function registerClaimRoutes(
  app: FastifyInstance,
  { store }: Deps,
): Promise<void> {
  app.post("/claims", async (req, reply) => {
    const r = req.body as Record<string, unknown> | null;
    if (!r || typeof r !== "object") {
      reply.code(400);
      return { error: "invalid_body" };
    }
    if (
      typeof r.postId !== "string" || !r.postId ||
      typeof r.claimerKey !== "string" || !r.claimerKey ||
      typeof r.claimedAt !== "number" || r.claimedAt <= 0 ||
      typeof r.nodeId !== "string" || !r.nodeId
    ) {
      reply.code(400);
      return { error: "invalid_body", reason: "missing or invalid fields" };
    }
    if (store.has(r.postId as string)) {
      reply.code(200);
      return { stored: false, postId: r.postId };
    }
    store.insert({
      postId: r.postId as string,
      claimerKey: r.claimerKey as string,
      claimedAt: r.claimedAt as number,
      nodeId: r.nodeId as string,
    });
    reply.code(201);
    return { stored: true, postId: r.postId };
  });

  app.get<{ Querystring: { since?: string; limit?: string } }>(
    "/claims",
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
      const claims = store.list({ since: safeSince, limit: safeLimit });
      return { count: claims.length, claims };
    },
  );
}
