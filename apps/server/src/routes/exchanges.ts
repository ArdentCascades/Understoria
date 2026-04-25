import type { FastifyInstance } from "fastify";
import { verifyExchange } from "@understoria/shared/crypto";
import type { ExchangeStore } from "../db.js";
import { parseExchange } from "../validate.js";

interface Deps {
  store: ExchangeStore;
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
  { store }: Deps,
): Promise<void> {
  app.post("/exchanges", async (req, reply) => {
    const parsed = parseExchange(req.body);
    if (!parsed.ok) {
      reply.code(400);
      return { error: "invalid_body", reason: parsed.error };
    }
    const exchange = parsed.value;

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

  app.get<{ Querystring: { since?: string; limit?: string } }>(
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
      const exchanges = store.list({ since: safeSince, limit: safeLimit });
      return { count: exchanges.length, exchanges };
    },
  );
}
