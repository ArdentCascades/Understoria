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
import { verifyPushNameConsent } from "@understoria/shared/crypto";
import type { PushNameConsentStore } from "../db.js";
import { parsePushNameConsent } from "../validate.js";

interface Deps {
  store: PushNameConsentStore;
}

/**
 * Push name consents (docs/notifications.md v2 — messages named by
 * mutual consent): a member's federated "my name may appear in
 * notifications" flag. Default OFF for everyone — absence of a
 * record is a no. The record carries the boolean ONLY, never a
 * display name: the name a recipient's lock screen shows is the one
 * their own device already holds for this member, resolved through
 * their device's local map (consented AND unblocked), and this
 * consent is only one of the three ANDed gates.
 *
 * Single-owner LWW on the seed-vault-pledge machinery: the only
 * legitimate signer is the member the record names, keyed by
 * memberKey, strictly-newer updatedAt replaces. Retraction is
 * allow:false — it must keep winning LWW over stale allowing
 * copies, so it is a state, not a delete.
 *
 * No referent check: a consent has no parent record. Status codes
 * match the other state routes: 201 accepted, 200 {stored:false}
 * stale, 400 malformed, 403 not the member's own record, 422 bad
 * signature.
 */
export async function registerPushNameConsentRoutes(
  app: FastifyInstance,
  { store }: Deps,
): Promise<void> {
  app.post("/push-name-consents", async (req, reply) => {
    const parsed = parsePushNameConsent(req.body);
    if (!parsed.ok) {
      reply.code(400);
      return { error: "invalid_body", reason: parsed.error };
    }
    const record = parsed.value;

    if (!verifyPushNameConsent(record)) {
      reply.code(422);
      return { error: "bad_signature" };
    }
    if (record.signerKey !== record.memberKey) {
      reply.code(403);
      return { error: "not_authorized", reason: "not_own_consent" };
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
  }>("/push-name-consents", async (req) => {
    const q = req.query;
    const since = q.since ? Number.parseInt(q.since, 10) : undefined;
    const limit = q.limit ? Number.parseInt(q.limit, 10) : undefined;
    const pushNameConsents = store.list({
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
    return { count: pushNameConsents.length, pushNameConsents };
  });
}
