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
import { verifyPost } from "@understoria/shared/crypto";
import type { Post } from "@understoria/shared/types";
import type { PostStore } from "../db.js";
import { parsePost } from "../validate.js";

interface Deps {
  store: PostStore;
}

/**
 * POST /posts
 *   - Body: the immutable signed subset of a Post (no lifecycle
 *     fields). Mutable lifecycle (status / claimedBy / confirmedBy)
 *     stays local to each PWA and does NOT federate in this slice.
 *   - 201 — accepted (new row inserted)
 *   - 200 — already had this row (idempotent re-submission)
 *   - 400 — malformed body
 *   - 422 — well-formed but signature doesn't verify
 *
 * GET /posts
 *   - Query: ?since=<ms>&limit=<n>
 *   - Returns the most recent posts newer than `since`, capped at
 *     `limit` (default 200, hard ceiling 1000). Same model as
 *     /exchanges and /vouches.
 */
export async function registerPostRoutes(
  app: FastifyInstance,
  { store }: Deps,
): Promise<void> {
  app.post("/posts", async (req, reply) => {
    const parsed = parsePost(req.body);
    if (!parsed.ok) {
      reply.code(400);
      return { error: "invalid_body", reason: parsed.error };
    }
    const record = parsed.value;
    // verifyPost takes a full Post; the missing lifecycle fields
    // don't participate in the canonical payload so we synthesize
    // empty placeholders just to type-check.
    const forVerify: Post = {
      ...record,
      claimedBy: null,
      status: "open",
      confirmedBy: [],
    };
    if (!verifyPost(forVerify)) {
      reply.code(422);
      return { error: "bad_signature" };
    }

    if (store.has(record.id)) {
      reply.code(200);
      return { stored: false, id: record.id };
    }

    store.insert(record);
    reply.code(201);
    return { stored: true, id: record.id };
  });

  app.get<{ Querystring: { since?: string; limit?: string } }>(
    "/posts",
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
      const posts = store.list({ since: safeSince, limit: safeLimit });
      return { count: posts.length, posts };
    },
  );
}
