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
import { verifyCoOrganizerInvitation } from "@understoria/shared/crypto";
import type { CoOrganizerInvitationStore } from "../db.js";
import { parseCoOrganizerInvitation } from "../validate.js";

interface Deps {
  store: CoOrganizerInvitationStore;
}

/**
 * POST /coorg-invitations
 *   - Body: signed CoOrganizerInvitation JSON.
 *   - Side effects: persist if novel and cryptographically valid.
 *   - Status codes:
 *       201 — accepted (new row inserted)
 *       200 — already had this row (idempotent re-submission)
 *       400 — malformed body
 *       422 — well-formed but signature doesn't verify
 *
 * GET /coorg-invitations
 *   - Query: ?since=<ms>&limit=<n>
 *   - Returns the most recent invitations newer than `since`, paginated
 *     by `createdAt`, capped at `limit` (default 200, hard ceiling
 *     1000). Same shape as /vouches and /posts. See
 *     `docs/co-organizer-invitations.md` §8.
 */
export async function registerCoOrganizerInvitationRoutes(
  app: FastifyInstance,
  { store }: Deps,
): Promise<void> {
  app.post("/coorg-invitations", async (req, reply) => {
    const parsed = parseCoOrganizerInvitation(req.body);
    if (!parsed.ok) {
      reply.code(400);
      return { error: "invalid_body", reason: parsed.error };
    }
    const record = parsed.value;

    if (!verifyCoOrganizerInvitation(record)) {
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
    "/coorg-invitations",
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
      const coorgInvitations = store.list({
        since: safeSince,
        limit: safeLimit,
      });
      return { count: coorgInvitations.length, coorgInvitations };
    },
  );
}
