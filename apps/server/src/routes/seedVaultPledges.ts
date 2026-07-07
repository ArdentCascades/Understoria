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
import { verifySeedVaultPledge } from "@understoria/shared/crypto";
import type { SeedVaultPledgeStore } from "../db.js";
import { parseSeedVaultPledge } from "../validate.js";

interface Deps {
  store: SeedVaultPledgeStore;
}

/**
 * Seed-vault pledges (docs/storage-budget.md Phase 2): a member's
 * public, revocable claim to keep the COMPLETE community archive.
 * Single-owner LWW on the participation-state machinery: the only
 * legitimate signer is the member the pledge names, keyed by
 * memberKey, strictly-newer updatedAt replaces. Retraction is
 * active:false — it must keep winning LWW over stale active copies,
 * so it is a state, not a delete.
 *
 * No referent check: a pledge has no parent record. Status codes
 * match the other state routes: 201 accepted, 200 {stored:false}
 * stale, 400 malformed, 403 not the member's own pledge, 422 bad
 * signature.
 */
export async function registerSeedVaultPledgeRoutes(
  app: FastifyInstance,
  { store }: Deps,
): Promise<void> {
  app.post("/seed-vault-pledges", async (req, reply) => {
    const parsed = parseSeedVaultPledge(req.body);
    if (!parsed.ok) {
      reply.code(400);
      return { error: "invalid_body", reason: parsed.error };
    }
    const record = parsed.value;

    if (!verifySeedVaultPledge(record)) {
      reply.code(422);
      return { error: "bad_signature" };
    }
    if (record.signerKey !== record.memberKey) {
      reply.code(403);
      return { error: "not_authorized", reason: "not_own_pledge" };
    }

    const stored = store.get(record.memberKey);
    if (stored && record.updatedAt <= stored.updatedAt) {
      reply.code(200);
      return { stored: false, id: record.id };
    }

    store.upsert(record);
    reply.code(201);
    return { stored: true, id: record.id };
  });

  app.get<{
    Querystring: { since?: string; sinceId?: string; limit?: string };
  }>("/seed-vault-pledges", async (req) => {
    const q = req.query;
    const since = q.since ? Number.parseInt(q.since, 10) : undefined;
    const limit = q.limit ? Number.parseInt(q.limit, 10) : undefined;
    const seedVaultPledges = store.list({
      since:
        since !== undefined && Number.isFinite(since) && since >= 0
          ? since
          : undefined,
      sinceId: q.sinceId && q.sinceId.length > 0 ? q.sinceId : undefined,
      limit:
        limit !== undefined && Number.isFinite(limit) && limit > 0
          ? limit
          : undefined,
    });
    return { count: seedVaultPledges.length, seedVaultPledges };
  });
}
