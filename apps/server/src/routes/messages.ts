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
import {
  canonicalReadAuthMessage,
  verify,
  verifyRelayedMessage,
} from "@understoria/shared/crypto";
import type { MessageStore } from "../db.js";
import { parseRelayedMessage } from "../validate.js";
import { READ_AUTH_MAX_SKEW_MS, type MembershipResolver } from "../readAuth.js";

interface Deps {
  store: MessageStore;
  resolver: MembershipResolver;
  /** Mirrors the node's read-auth posture: when READ_AUTH=on the
   *  sender must be a member; when off, the gate is off too (a node
   *  with no founder keys configured must not lose messaging). The
   *  removed-author guard and insert caps apply regardless via the
   *  SURFACES map. */
  requireSenderMembership: boolean;
  /** Envelopes older than this are pruned opportunistically on
   *  writes — docs/message-relay.md §4.3 (the shelf, not an archive). */
  retentionDays: number;
  /** Injectable clock for tests. */
  now?: () => number;
}

/**
 * The message relay — docs/message-relay.md.
 *
 * POST /messages
 *   - Body: signed RelayedMessage JSON (ciphertext only — E2E sealed).
 *   - 201 stored / 200 duplicate / 400 malformed / 422 bad signature /
 *     403 not_a_member (only when requireSenderMembership).
 *
 * GET /messages?since=<ms>&sinceId=<id>&limit=<n>
 *   - THE one feed that is not community-public: it serves personal
 *     correspondence envelopes, so recipient proof is required
 *     UNCONDITIONALLY (independent of READ_AUTH) and the response is
 *     scoped to rows addressed to the proven key. The proof is the
 *     same x-understoria-key/-ts/-sig header trio the global read
 *     guard uses — when READ_AUTH=on that guard runs first (adding
 *     the membership check) and the headers are already present.
 *   - Peer bearer tokens are REFUSED here: messages never
 *     peer-federate and never mirror-replicate (message-relay.md §7).
 */
export async function registerMessageRoutes(
  app: FastifyInstance,
  deps: Deps,
): Promise<void> {
  const now = deps.now ?? Date.now;
  const retentionMs = deps.retentionDays * 24 * 60 * 60 * 1000;

  app.post("/messages", async (req, reply) => {
    const parsed = parseRelayedMessage(req.body);
    if (!parsed.ok) {
      reply.code(400);
      return { error: "invalid_body", reason: parsed.error };
    }
    const message = parsed.value;

    if (!verifyRelayedMessage(message)) {
      reply.code(422);
      return { error: "bad_signature" };
    }

    if (
      deps.requireSenderMembership &&
      !deps.resolver.isMember(message.senderKey)
    ) {
      reply.code(403);
      return { error: "not_a_member" };
    }

    // Retention sweep rides the write path: cheap (indexed on
    // created_at), and a node that receives no messages has nothing
    // aging on its shelf worth a dedicated timer.
    if (retentionMs > 0) {
      deps.store.pruneOlderThan(now() - retentionMs);
    }

    if (deps.store.has(message.id)) {
      reply.code(200);
      return { stored: false, id: message.id };
    }

    deps.store.insert(message);
    reply.code(201);
    return { stored: true, id: message.id };
  });

  app.get<{
    Querystring: { since?: string; sinceId?: string; limit?: string };
  }>("/messages", async (req, reply) => {
    // Route-local recipient proof — deliberately NOT delegated to the
    // global read guard, which (a) may be off and (b) proves
    // membership, not "this inbox is mine".
    const authHeader = req.headers.authorization;
    if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
      reply.code(403);
      return reply.send({ error: "recipient_proof_required" });
    }
    const key = req.headers["x-understoria-key"];
    const tsRaw = req.headers["x-understoria-ts"];
    const sig = req.headers["x-understoria-sig"];
    if (
      typeof key !== "string" ||
      typeof tsRaw !== "string" ||
      typeof sig !== "string"
    ) {
      reply.code(401);
      return reply.send({ error: "recipient_proof_required" });
    }
    const ts = Number.parseInt(tsRaw, 10);
    if (!Number.isFinite(ts) || Math.abs(now() - ts) > READ_AUTH_MAX_SKEW_MS) {
      reply.code(401);
      return reply.send({ error: "stale_read_signature" });
    }
    if (!verify(canonicalReadAuthMessage(req.url, ts), sig, key)) {
      reply.code(401);
      return reply.send({ error: "bad_read_signature" });
    }

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
    const safeSinceId =
      req.query.sinceId && req.query.sinceId.length > 0
        ? req.query.sinceId
        : undefined;

    const messages = deps.store.listForRecipient(key, {
      since: safeSince,
      sinceId: safeSinceId,
      limit: safeLimit,
    });
    return { count: messages.length, messages };
  });
}
