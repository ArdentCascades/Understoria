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
  verifyExchange,
  verifyExchangeLabel,
} from "@understoria/shared/crypto";
import type { ExchangeStore } from "../db.js";
import { parseExchange } from "../validate.js";

interface Deps {
  store: ExchangeStore;
  /**
   * Operator-declared resolver for LOST nodes' system keys
   * (`Config.trustedSystemKeys`, docs/community-reseed.md §1c). When
   * present, an `autoConfirmed` row is accepted iff the shared §4
   * verifier resolves its confirming node against these keys — the
   * re-seed path for exchanges the lost node auto-confirmed. Absent
   * (the default), the categorical refusal below stands unchanged.
   */
  resolveTrustedSystemKey?: (
    nodeId: string,
    signedAt: number,
  ) => string | null;
}

/**
 * POST /exchanges
 *   - Body: signed Exchange JSON.
 *   - Side effects: persist if novel and cryptographically valid.
 *   - Status codes:
 *       201 — accepted (new row inserted)
 *       200 — already had this row (idempotent re-submission)
 *       400 — malformed body
 *       422 — well-formed but signatures don't verify
 *
 * GET /exchanges
 *   - Query: ?since=<ms>&limit=<n>
 *   - Returns the most recent exchanges newer than `since` (or just the
 *     most recent if `since` is omitted), capped at `limit` (default 200,
 *     hard ceiling 1000). All rows are signed and any peer can verify.
 */
export async function registerExchangeRoutes(
  app: FastifyInstance,
  { store, resolveTrustedSystemKey }: Deps,
): Promise<void> {
  app.post("/exchanges", async (req, reply) => {
    const parsed = parseExchange(req.body);
    if (!parsed.ok) {
      reply.code(400);
      return { error: "invalid_body", reason: parsed.error };
    }
    const exchange = parsed.value;

    // Auto-confirmed rows must come from `/auto-confirm`, which is
    // the only path that can produce a valid system signature.
    // Accepting them here would skip the system-pubkey check (the
    // `verifyExchange` shared helper cannot verify the system side
    // without a resolver) and let a client forge an auto-confirm
    // flag with a garbage helped-side signature. See
    // `docs/auto-confirm-key.md` §4.
    //
    // ONE deliberate exception (docs/community-reseed.md §1c): when
    // the operator has declared TRUSTED_SYSTEM_KEYS for lost nodes,
    // a re-seeded auto-confirmed row is accepted iff it verifies
    // §4-strictly against those keys — the same shared
    // `verifyExchangeLabel` gate peer pull and mirror pull use.
    // Fail-closed: no resolver, or an unresolvable/invalid row, is
    // still a 422.
    if (exchange.autoConfirmed) {
      if (
        resolveTrustedSystemKey !== undefined &&
        verifyExchangeLabel(exchange, resolveTrustedSystemKey) !== "invalid"
      ) {
        if (store.has(exchange.id)) {
          reply.code(200);
          return { stored: false, id: exchange.id };
        }
        store.insert(exchange);
        reply.code(201);
        return { stored: true, id: exchange.id };
      }
      reply.code(422);
      return { error: "auto_confirm_via_dedicated_endpoint" };
    }

    if (!verifyExchange(exchange)) {
      reply.code(422);
      return { error: "bad_signature" };
    }

    if (store.has(exchange.id)) {
      reply.code(200);
      return { stored: false, id: exchange.id };
    }

    store.insert(exchange);
    reply.code(201);
    return { stored: true, id: exchange.id };
  });

  app.get<{ Querystring: { since?: string; sinceId?: string; limit?: string } }>(
    "/exchanges",
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
      const exchanges = store.list({ since: safeSince, sinceId: safeSinceId, limit: safeLimit });
      return { count: exchanges.length, exchanges };
    },
  );
}
