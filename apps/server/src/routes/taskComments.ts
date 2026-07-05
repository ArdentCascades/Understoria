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
import { verifyTaskComment } from "@understoria/shared/crypto";
import type { TaskCommentStore } from "../db.js";
import { parseTaskComment } from "../validate.js";

interface Deps {
  store: TaskCommentStore;
}

/**
 * POST /task-comments
 *   - Body: a signed TaskComment row. May arrive with `deletedAt`
 *     set, which is how soft-deletes federate — the author re-pushes
 *     their own previously-signed comment with the new tombstone
 *     timestamp. Because `deletedAt` is excluded from the canonical
 *     payload, the signature still verifies against the immutable
 *     subset.
 *   - 201 — accepted (new row inserted, or existing row tombstoned)
 *   - 200 — already had this row in its current shape (idempotent)
 *   - 400 — malformed body
 *   - 422 — well-formed but signature doesn't verify
 *
 * Tombstone semantics — handled here so the route is the single
 * authority for the merge rule:
 *   - Incoming `deletedAt = null`, row absent → insert.
 *   - Incoming `deletedAt = null`, row present → idempotent no-op.
 *   - Incoming `deletedAt = T`, row absent → insert with tombstone.
 *   - Incoming `deletedAt = T`, row present + already tombstoned →
 *     idempotent no-op (first delete wins; second is duplicate).
 *   - Incoming `deletedAt = T`, row present + alive → upsertTombstone.
 *
 * GET /task-comments
 *   - Query: ?since=<ms>&limit=<n>
 *   - Same shape as /posts. The list includes tombstoned rows so
 *     pulling peers can converge on soft-delete state.
 */
export async function registerTaskCommentRoutes(
  app: FastifyInstance,
  { store }: Deps,
): Promise<void> {
  app.post("/task-comments", async (req, reply) => {
    const parsed = parseTaskComment(req.body);
    if (!parsed.ok) {
      reply.code(400);
      return { error: "invalid_body", reason: parsed.error };
    }
    const record = parsed.value;
    if (!verifyTaskComment(record)) {
      reply.code(422);
      return { error: "bad_signature" };
    }

    const existing = store.has(record.id);
    if (!existing) {
      store.insert(record);
      reply.code(201);
      return { stored: true, id: record.id };
    }

    // Row exists locally. If the incoming row carries a tombstone we
    // didn't have yet, apply it; otherwise this is a duplicate.
    if (record.deletedAt !== null) {
      const localDeletedAt = store.deletedAt(record.id);
      if (localDeletedAt === null || localDeletedAt === undefined) {
        store.upsertTombstone(record.id, record.deletedAt);
        reply.code(201);
        return { stored: true, id: record.id, tombstoned: true };
      }
    }

    reply.code(200);
    return { stored: false, id: record.id };
  });

  app.get<{ Querystring: { since?: string; sinceId?: string; limit?: string } }>(
    "/task-comments",
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
      const taskComments = store.list({ since: safeSince, sinceId: safeSinceId, limit: safeLimit });
      return { count: taskComments.length, taskComments };
    },
  );
}
