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
import { verifyInvite } from "@understoria/shared/crypto";
import type { InviteStore } from "../db.js";
import { parseInvite } from "../validate.js";

interface Deps {
  store: InviteStore;
}

/**
 * POST /invites
 *   - Body: signed SignedInvite JSON.
 *   - Side effects: persist if novel and cryptographically valid.
 *   - Status codes:
 *       201 — accepted (new row inserted)
 *       200 — already had this row (idempotent re-submission)
 *       400 — malformed body
 *       422 — well-formed but signature doesn't verify
 *
 * GET /invites
 *   - Query: ?since=<ms>&limit=<n>
 *   - Returns invites newer than `since`, capped at `limit`
 *     (default 200, ceiling 1000). Peer nodes use this to
 *     discover cross-node invites for federation.
 */
export async function registerInviteRoutes(
  app: FastifyInstance,
  { store }: Deps,
): Promise<void> {
  app.post("/invites", async (req, reply) => {
    const parsed = parseInvite(req.body);
    if (!parsed.ok) {
      reply.code(400);
      return { error: "invalid_body", reason: parsed.error };
    }
    const invite = parsed.value;

    if (!verifyInvite(invite)) {
      reply.code(422);
      return { error: "bad_signature" };
    }

    if (store.has(invite.token)) {
      reply.code(200);
      return { stored: false, token: invite.token };
    }

    store.insert(invite);
    reply.code(201);
    return { stored: true, token: invite.token };
  });

  app.get<{ Querystring: { since?: string; limit?: string } }>(
    "/invites",
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
      const invites = store.list({ since: safeSince, limit: safeLimit });
      return { count: invites.length, invites };
    },
  );
}
