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
import Fastify, { type FastifyInstance } from "fastify";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import type { Database as DatabaseType } from "better-sqlite3";
import type { Config } from "./config.js";
import {
  createClaimStore,
  createCoOrganizerInvitationResponseStore,
  createCoOrganizerInvitationRevocationStore,
  createCoOrganizerInvitationStore,
  createEventCancellationStore,
  createEventStore,
  createExchangeStore,
  createPeerPullStore,
  createPostStore,
  createRedemptionStore,
  createTaskCommentStore,
  createVouchStore,
  openDatabase,
} from "./db.js";
import { registerHealthRoutes } from "./routes/health.js";
import { registerExchangeRoutes } from "./routes/exchanges.js";
import { registerConfigRoutes } from "./routes/config.js";
import { registerPeersRoutes } from "./routes/peers.js";
import { registerPostRoutes } from "./routes/posts.js";
import { registerClaimRoutes } from "./routes/claims.js";
import { registerRedemptionRoutes } from "./routes/redemptions.js";
import { registerTaskCommentRoutes } from "./routes/taskComments.js";
import { registerVouchRoutes } from "./routes/vouches.js";
import { registerAutoConfirmRoutes } from "./routes/autoConfirm.js";
import { registerCoOrganizerInvitationRoutes } from "./routes/coorgInvitations.js";
import { registerCoOrganizerInvitationResponseRoutes } from "./routes/coorgInvitationResponses.js";
import { registerCoOrganizerInvitationRevocationRoutes } from "./routes/coorgInvitationRevocations.js";
import { registerEventRoutes } from "./routes/events.js";
import { registerEventCancellationRoutes } from "./routes/eventCancellations.js";
import { createSystemSignerFromSecret } from "./systemSigner.js";

export interface BuildOptions {
  config: Config;
  /**
   * Optional injected database. Tests pass `:memory:` via openDatabase,
   * or a fresh tmp path; production goes through the env-driven path.
   */
  database?: DatabaseType;
}

export interface BuiltServer {
  app: FastifyInstance;
  database: DatabaseType;
}

/**
 * Builds a Fastify instance with security middleware, schema-migrated
 * SQLite, and the routes wired up. Exported separately from the entry
 * point so integration tests can `app.inject()` without binding a port.
 */
export async function buildServer({
  config,
  database,
}: BuildOptions): Promise<BuiltServer> {
  const app = Fastify({
    logger: {
      level: config.logLevel,
      // Minimal-logging policy from docs/threat-model.md §6.
      // We do NOT include req.hostname, req.ip, headers, or bodies.
      // Pino's default request serializer leaks IPs by default —
      // override it.
      serializers: {
        req: (req: { method: string; url: string }) =>
          config.logRequestPaths
            ? { method: req.method, url: req.url }
            : { method: req.method },
      },
    },
    // 64 KB body cap: an Exchange JSON is well under 2 KB; oversize
    // bodies are abuse.
    bodyLimit: 64 * 1024,
    // Disable Fastify's default trustProxy so X-Forwarded-For from a
    // misconfigured upstream doesn't put member IPs into the rate
    // limiter's keys (that would be a logged identifier in disguise).
    trustProxy: false,
  });

  // Security headers per docs/operator-guide.md §4 (Caddyfile shows the
  // matching reverse-proxy config). Helmet handles CSP, HSTS, X-Frame-
  // Options, X-Content-Type-Options, Referrer-Policy, etc.
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  });

  await app.register(rateLimit, {
    max: config.rateLimitMax,
    timeWindow: "1 minute",
    // Hash the IP so it never reaches storage even in memory key form.
    // The default key fn would put req.ip into an internal map; we replace
    // it with a non-reversible bucket id derived from the IP only at
    // throttle time.
    keyGenerator: (req) => hashIpToBucket(req.ip),
  });

  // Permissive CORS for the configured PWA origin.
  app.addHook("onRequest", async (req, reply) => {
    const origin = req.headers.origin;
    if (!origin) return;
    if (config.corsOrigin === "*" || origin === config.corsOrigin) {
      reply.header("Access-Control-Allow-Origin", origin);
      reply.header("Vary", "Origin");
      reply.header(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS",
      );
      reply.header(
        "Access-Control-Allow-Headers",
        "Content-Type",
      );
      if (req.method === "OPTIONS") {
        reply.code(204).send();
      }
    }
  });

  const db = database ?? openDatabase(config.databasePath);
  const store = createExchangeStore(db);
  const vouchStore = createVouchStore(db);
  const postStore = createPostStore(db);
  const redemptionStore = createRedemptionStore(db);
  const claimStore = createClaimStore(db);
  const taskCommentStore = createTaskCommentStore(db);
  const coorgInvitationStore = createCoOrganizerInvitationStore(db);
  const coorgInvitationResponseStore =
    createCoOrganizerInvitationResponseStore(db);
  const coorgInvitationRevocationStore =
    createCoOrganizerInvitationRevocationStore(db);
  const eventStore = createEventStore(db);
  const eventCancellationStore = createEventCancellationStore(db);
  const pullStore = createPeerPullStore(db);

  // Build the system signer once at boot — secret bytes are then
  // held only inside the closure that captured them. A null signer
  // means the operator did not configure `NODE_SYSTEM_SECRET_KEY`;
  // we log it and continue (auto-confirm becomes a no-op endpoint,
  // not a boot failure — operators may stage rollout). See
  // `docs/auto-confirm-key.md` §6.
  const signer = createSystemSignerFromSecret(config.systemSecretKey);
  if (signer === null && config.autoConfirmMinHours > 0) {
    app.log.warn(
      "auto-confirm window is configured (AUTO_CONFIRM_MIN_HOURS > 0) but no NODE_SYSTEM_SECRET_KEY is set; /auto-confirm will refuse to sign.",
    );
  }

  await registerHealthRoutes(app);
  await registerExchangeRoutes(app, { store });
  await registerVouchRoutes(app, { store: vouchStore });
  await registerPostRoutes(app, { store: postStore });
  // NOTE: no invite routes. `POST/GET /invites` was removed in the
  // invite-redemption Phase 1 PR — the GET served full SignedInvite
  // rows (a live-credential feed, `docs/invite-redemption.md` §10.1).
  // Redemption receipts (below) are the only invite-adjacent wire
  // surface: open invites never cross any wire.
  await registerRedemptionRoutes(app, { store: redemptionStore });
  await registerClaimRoutes(app, { store: claimStore });
  await registerTaskCommentRoutes(app, { store: taskCommentStore });
  await registerCoOrganizerInvitationRoutes(app, {
    store: coorgInvitationStore,
  });
  await registerCoOrganizerInvitationResponseRoutes(app, {
    store: coorgInvitationResponseStore,
  });
  await registerCoOrganizerInvitationRevocationRoutes(app, {
    store: coorgInvitationRevocationStore,
  });
  await registerEventRoutes(app, { store: eventStore });
  await registerEventCancellationRoutes(app, {
    store: eventCancellationStore,
    eventStore,
  });
  await registerConfigRoutes(app, { config, signer });
  await registerAutoConfirmRoutes(app, {
    store,
    signer,
    nodeId: config.nodeId,
    autoConfirmMinHours: config.autoConfirmMinHours,
  });
  await registerPeersRoutes(app, {
    pullStore,
    configuredPeers: config.peerNodeUrls,
  });

  return { app, database: db };
}

/**
 * Map an IP string to a small bucket id without retaining the IP. Used
 * exclusively for rate-limit keying; never logged. The bucket count is
 * 1024, large enough to make false-collision throttling rare in a
 * pilot-sized community while small enough that the keyspace itself
 * leaks no identifying information.
 */
function hashIpToBucket(ip: string): string {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < ip.length; i++) {
    h ^= ip.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `bucket_${(h >>> 0) % 1024}`;
}
