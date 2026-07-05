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
      typeof r.claimedAt !== "number" ||
      !Number.isInteger(r.claimedAt) ||
      r.claimedAt <= 0 ||
      typeof r.nodeId !== "string" || !r.nodeId
    ) {
      reply.code(400);
      return { error: "invalid_body", reason: "missing or invalid fields" };
    }
    // Bound claimedAt exactly like validate.ts bounds deletedAt:
    // claims are the CURSOR for GET /claims, so one unbounded value
    // (1e18, or `1e999` which JSON-parses to Infinity — caught by the
    // isInteger check above) would jump every puller's high-water mark
    // to the far future and hide all subsequent claims forever. Claims
    // are unsigned by design, making this the only ingestion gate.
    const oneDayFromNow = Date.now() + 24 * 60 * 60 * 1000;
    if (r.claimedAt > oneDayFromNow) {
      reply.code(400);
      return {
        error: "invalid_body",
        reason: "claimedAt is too far in the future",
      };
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

  app.get<{ Querystring: { since?: string; sinceId?: string; limit?: string } }>(
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
      // Composite pair cursor (docs/composite-federation-cursors.md §2):
      // strictly-after-(since,sinceId) paging when both are present;
      // ignored without `since`, so it degrades to the legacy cursor.
      const safeSinceId =
        req.query.sinceId && req.query.sinceId.length > 0
          ? req.query.sinceId
          : undefined;
      const claims = store.list({ since: safeSince, sinceId: safeSinceId, limit: safeLimit });
      return { count: claims.length, claims };
    },
  );
}
