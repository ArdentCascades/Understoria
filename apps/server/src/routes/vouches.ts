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

interface Deps {
  store: VouchStore;
}

/**
 * POST /vouches
 *   - Body: signed SignedVouch JSON.
 *   - Side effects: persist if novel and cryptographically valid.
 *   - Status codes:
 *       201 — accepted (new row inserted)
 *       200 — already had this row (idempotent re-submission)
 *       400 — malformed body
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
  { store }: Deps,
): Promise<void> {
  app.post("/vouches", async (req, reply) => {
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

    store.insert(vouch);
    reply.code(201);
    return { stored: true, id: vouch.id };
  });

  app.get<{ Querystring: { since?: string; limit?: string } }>(
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
      const vouches = store.list({ since: safeSince, limit: safeLimit });
      return { count: vouches.length, vouches };
    },
  );
}
