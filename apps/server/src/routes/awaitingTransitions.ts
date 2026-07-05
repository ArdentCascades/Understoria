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
import { verifyAwaitingTransition } from "@understoria/shared/crypto";
import type { AwaitingTransitionStore } from "../db.js";
import { parseAwaitingTransition } from "../validate.js";

interface Deps {
  store: AwaitingTransitionStore;
  /** Test seam — defaults to Date.now. */
  now?: () => number;
}

/**
 * POST /awaiting-transitions — ingest a signed awaiting-transition
 * artifact (docs/auto-confirm-key.md §5). The node stamps its OWN
 * clock as `received_at`; that stamp is the age anchor the
 * /auto-confirm window is measured from, so the window becomes real
 * wall-clock waiting that no client can fast-forward.
 *
 *   - 201 — accepted (new row; the age anchor starts NOW)
 *   - 200 — this postId already has an artifact (idempotent re-push;
 *           first-writer-wins, the anchor does NOT reset)
 *   - 400 — malformed body
 *   - 422 — well-formed but the signature doesn't verify
 *
 * Deliberately NO GET: the artifact is only ever consulted by this
 * node's own /auto-confirm handler. It does not federate — peers
 * verifying an auto-confirmed exchange trust the signing node's
 * system key, not this artifact.
 */
export async function registerAwaitingTransitionRoutes(
  app: FastifyInstance,
  deps: Deps,
): Promise<void> {
  const now = deps.now ?? (() => Date.now());

  app.post("/awaiting-transitions", async (req, reply) => {
    const parsed = parseAwaitingTransition(req.body);
    if (!parsed.ok) {
      reply.code(400);
      return { error: "invalid_body", reason: parsed.error };
    }
    const record = parsed.value;
    if (!verifyAwaitingTransition(record)) {
      reply.code(422);
      return { error: "bad_signature" };
    }
    const inserted = deps.store.insert(record, now());
    reply.code(inserted ? 201 : 200);
    return { stored: inserted, postId: record.postId };
  });
}
