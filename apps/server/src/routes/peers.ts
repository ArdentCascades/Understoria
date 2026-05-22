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
import type { PeerPullStore } from "../db.js";

// Agent 3 task 2: federation observability.
//
// Returns who this node pulls from and how recently each pull
// succeeded. Peer URLs are inherently public (they're who this node
// federates with) and the rest of the fields are operational
// transparency. The endpoint deliberately omits any signed-record
// counts to keep the surface minimal — actual federation traffic is
// already visible via GET /exchanges.

export interface PublicPeerStatus {
  url: string;
  lastPulledAt: number | null;
  lastSuccessAt: number | null;
  lastError: string | null;
  lastPulledCount: number;
}

export async function registerPeersRoutes(
  app: FastifyInstance,
  options: { pullStore: PeerPullStore; configuredPeers: readonly string[] },
): Promise<void> {
  const { pullStore, configuredPeers } = options;

  app.get("/peers", async () => {
    const known = new Map<string, PublicPeerStatus>();
    for (const url of configuredPeers) {
      known.set(url, {
        url,
        lastPulledAt: null,
        lastSuccessAt: null,
        lastError: null,
        lastPulledCount: 0,
      });
    }
    for (const row of pullStore.list()) {
      known.set(row.peerUrl, {
        url: row.peerUrl,
        lastPulledAt: row.lastPulledAt,
        lastSuccessAt: row.lastSuccessAt,
        lastError: row.lastError,
        lastPulledCount: row.lastPulledCount,
      });
    }
    return { peers: Array.from(known.values()) };
  });
}
