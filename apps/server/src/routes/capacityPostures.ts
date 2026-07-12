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
import type { CapacityPostureStore } from "../db.js";

interface Deps {
  store: CapacityPostureStore;
}

/**
 * Capacity postures (docs/capacity-forecast.md §6): the coarse,
 * node-system-key-signed community attestation of a node's capacity
 * band. One row per node, keyed by nodeId, strictly-newer updatedAt
 * wins.
 *
 * READ-ONLY on the wire. Unlike every member-authored state kind there
 * is NO POST route: a posture originates on the node itself (the
 * emitter writes it directly to the store when the forecast band
 * transitions), and same-community mirrors replicate it by verifying
 * the node-system-key signature directly in the mirror worker
 * (`applyCapacityPosture`) — not by re-POSTing here, because the POST
 * path could not resolve a foreign node's rotation-aware system key.
 * So there is nothing for a member to submit and no POST to harden;
 * the feed is served under the normal member read-auth guard, coarse
 * by construction.
 */
export async function registerCapacityPostureRoutes(
  app: FastifyInstance,
  { store }: Deps,
): Promise<void> {
  app.get<{
    Querystring: { since?: string; sinceId?: string; limit?: string };
  }>("/capacity-postures", async (req) => {
    const q = req.query;
    const since = q.since ? Number.parseInt(q.since, 10) : undefined;
    const limit = q.limit ? Number.parseInt(q.limit, 10) : undefined;
    const capacityPostures = store.list({
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
    return { count: capacityPostures.length, capacityPostures };
  });
}
