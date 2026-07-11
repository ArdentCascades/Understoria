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
import { randomBytes } from "node:crypto";
import Fastify, { type FastifyInstance } from "fastify";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import type { Database as DatabaseType } from "better-sqlite3-multiple-ciphers";
import type { Config } from "./config.js";
import {
  createAwaitingTransitionStore,
  createDeviceLinkStore,
  createEventRsvpStateStore,
  createEventShiftStateStore,
  createLinkRequestStore,
  createClaimStore,
  createShiftSignupStateStore,
  createSeedVaultPledgeStore,
  createMemberRemovalStore,
  createMemberReinstatementStore,
  createProposalStore,
  createVoteStore,
  createProposalClosureStore,
  createCoOrganizerInvitationResponseStore,
  createCoOrganizerInvitationRevocationStore,
  createCoOrganizerInvitationStore,
  createEventCancellationStore,
  createEventStore,
  createExchangeStore,
  createPeerPullStore,
  createPostStore,
  createInviteRevocationStore,
  createMessageStore,
  createProjectStateStore,
  createRedemptionStore,
  createTaskCommentStore,
  createTaskStateStore,
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
import { registerInviteRevocationRoutes } from "./routes/inviteRevocations.js";
import { registerAwaitingTransitionRoutes } from "./routes/awaitingTransitions.js";
import { registerTaskCommentRoutes } from "./routes/taskComments.js";
import { registerVouchRoutes } from "./routes/vouches.js";
import { registerMessageRoutes } from "./routes/messages.js";
import { registerAutoConfirmRoutes } from "./routes/autoConfirm.js";
import { registerCoOrganizerInvitationRoutes } from "./routes/coorgInvitations.js";
import { registerCoOrganizerInvitationResponseRoutes } from "./routes/coorgInvitationResponses.js";
import { registerCoOrganizerInvitationRevocationRoutes } from "./routes/coorgInvitationRevocations.js";
import { registerEventRoutes } from "./routes/events.js";
import { registerEventCancellationRoutes } from "./routes/eventCancellations.js";
import { registerDeviceLinkRoutes } from "./routes/deviceLink.js";
import { registerLinkRequestRoutes } from "./routes/linkRequests.js";
import { registerProjectStateRoutes } from "./routes/projectStates.js";
import { registerParticipationStateRoutes } from "./routes/participationStates.js";
import { registerSeedVaultPledgeRoutes } from "./routes/seedVaultPledges.js";
import { registerMemberRemovalRoutes } from "./routes/memberRemovals.js";
import { registerGovernanceRoutes } from "./routes/proposals.governance.js";
import { createSystemSignerFromSecret } from "./systemSigner.js";
import { registerInsertCapGuard, SURFACES } from "./insertCaps.js";
import {
  createMembershipResolver,
  registerReadAuthGuard,
  registerRemovedAuthorGuard,
} from "./readAuth.js";
import { MIRROR_INTERNAL_HEADER } from "./mirrorPull.js";

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
  /**
   * Per-boot random token that exempts a request from rate limiting
   * when sent as the `x-understoria-internal` header. It exists for
   * exactly one caller: the mirror-pull worker, which applies records
   * from a mirror node by `app.inject()`-ing POSTs against THIS
   * process (so every mirrored record passes the same
   * validation/authority/LWW code as a real submission) and would
   * otherwise burn the loopback bucket's rate budget on a catch-up
   * batch. The token never leaves the process, is never logged, and
   * changes on every boot — an external caller cannot learn or reuse
   * it. Nothing else is bypassed: read-auth, insert caps, and body
   * validation all still apply.
   */
  internalBypassToken: string;
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
    // trustProxy is OFF by default so a spoofed X-Forwarded-For from a
    // direct connection can't influence `req.ip`. Under the bundled
    // compose stack set TRUST_PROXY=true — Caddy arrives from a
    // bridge-network IP, so `loopback` would silently no-op and every
    // client would share the proxy's address in ONE rate-limit bucket
    // (Round-4 review). For a bare-metal Caddy on the same host,
    // `loopback` is the tighter setting; an explicit IP/CIDR list is
    // also accepted. The IP is still only ever hashed to a bucket,
    // never stored raw.
    trustProxy: config.trustProxy === "" ? false : config.trustProxy,
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

  const internalBypassToken = randomBytes(32).toString("base64url");
  await app.register(rateLimit, {
    max: config.rateLimitMax,
    timeWindow: "1 minute",
    // Hash the IP so it never reaches storage even in memory key form.
    // The default key fn would put req.ip into an internal map; we replace
    // it with a non-reversible bucket id derived from the IP only at
    // throttle time.
    keyGenerator: (req) => hashIpToBucket(req.ip),
    // The mirror-pull worker's self-injected POSTs carry the per-boot
    // token (see BuiltServer.internalBypassToken) — a mirror catch-up
    // batch must not consume the loopback bucket that real local
    // clients share.
    allowList: (req) =>
      req.headers[MIRROR_INTERNAL_HEADER] === internalBypassToken,
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
      // The x-understoria-* trio is the member-authenticated-reads
      // signature (docs/member-authenticated-reads.md §1). It was
      // absent here for a long time without symptoms because the
      // canonical deploy is SAME-origin (the PWA and the node share
      // one host, /api prefix) — no preflight. A mirror node is the
      // first cross-origin fetch that carries these headers, and the
      // preflight fails without them listed.
      reply.header(
        "Access-Control-Allow-Headers",
        "Content-Type, x-understoria-key, x-understoria-ts, x-understoria-sig",
      );
      if (req.method === "OPTIONS") {
        reply.code(204).send();
      }
    }
  });

  const db = database ?? openDatabase(config.databasePath, config.databaseKey);
  const store = createExchangeStore(db);
  const vouchStore = createVouchStore(db);
  const postStore = createPostStore(db);
  const redemptionStore = createRedemptionStore(db);
  const inviteRevocationStore = createInviteRevocationStore(db);
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
  const awaitingTransitionStore = createAwaitingTransitionStore(db);
  const deviceLinkStore = createDeviceLinkStore(db);
  const linkRequestStore = createLinkRequestStore(db);
  const projectStateStore = createProjectStateStore(db);
  const taskStateStore = createTaskStateStore(db);
  const eventRsvpStateStore = createEventRsvpStateStore(db);
  const eventShiftStateStore = createEventShiftStateStore(db);
  const shiftSignupStateStore = createShiftSignupStateStore(db);
  const seedVaultPledgeStore = createSeedVaultPledgeStore(db);
  const memberRemovalStore = createMemberRemovalStore(db);
  const memberReinstatementStore = createMemberReinstatementStore(db);
  const proposalStore = createProposalStore(db);
  const voteStore = createVoteStore(db);
  const proposalClosureStore = createProposalClosureStore(db);
  const messageStore = createMessageStore(db);

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

  // Member-authenticated reads (docs/member-authenticated-reads.md):
  // one onRequest hook gating every federation GET when READ_AUTH=on.
  // Registered before the routes; deny-by-default so future feed
  // routes are covered automatically.
  //
  // With no founder keys the resolver has no trust roots, so NO key
  // counts as a member and every member-gated write (proposals,
  // votes, closures, member removals) is refused with 403. That is a
  // deliberately safe default, but it is almost always a
  // misconfiguration (the shipped docker-compose once failed to
  // forward NODE_FOUNDER_KEYS at all) — say so loudly instead of
  // letting members discover it as mysterious vote failures.
  if (config.founderKeys.length === 0) {
    app.log.warn(
      "NODE_FOUNDER_KEYS is unset: the membership resolver has no trust roots, so every member-gated write (proposals, votes, closures, member removals) will be refused with 403 not_a_member. Set the founding member(s)' public keys to enable governance.",
    );
  }
  const membershipResolver = createMembershipResolver(db, config.founderKeys);
  registerReadAuthGuard(app, {
    readAuth: config.readAuth,
    resolver: membershipResolver,
    peerTokens: Object.values(config.peerReadTokens),
  });

  // Member removal, the write half (docs/member-removal.md §3):
  // refuse POSTs authored by a currently-removed member. Registered
  // unconditionally — removal decisions bind even where READ_AUTH is
  // off. Mirror-internal requests are exempt: pre-removal history
  // must keep replicating.
  registerRemovedAuthorGuard(app, {
    resolver: membershipResolver,
    surfaces: SURFACES,
    internalHeader: MIRROR_INTERNAL_HEADER,
    internalToken: internalBypassToken,
  });

  // Disk-fill backstop — one preHandler covering every federation
  // POST (insertCaps.ts). Registered before the routes so the check
  // runs ahead of each handler.
  registerInsertCapGuard(app, {
    db,
    config: {
      tableRowCeiling: config.tableRowCeiling,
      perKeyRowCeiling: config.perKeyRowCeiling,
    },
  });

  // Re-seed recovery surface (docs/community-reseed.md §3): a
  // time-boxed grace window for historical receipts, and an
  // operator-declared resolver so a LOST node's auto-confirmed
  // exchanges re-verify. Both inert by default; the open window logs
  // loudly because it is a recovery measure, not a setting.
  if (config.reseedGraceUntil !== null && config.reseedGraceUntil > Date.now()) {
    app.log.warn(
      `RESEED_GRACE_UNTIL is set: historical redemption receipts are accepted until ${new Date(config.reseedGraceUntil).toISOString()}. Unset it once the community has re-seeded.`,
    );
  }
  const resolveTrustedSystemKey =
    config.trustedSystemKeys.length > 0
      ? (nodeId: string, signedAt: number): string | null => {
          const entry = config.trustedSystemKeys.find(
            (k) => k.nodeId === nodeId,
          );
          if (!entry) return null;
          for (const h of entry.history) {
            if (h.retiredAt > signedAt) return h.pubkey;
          }
          return entry.current;
        }
      : undefined;

  await registerHealthRoutes(app);
  await registerExchangeRoutes(app, { store, resolveTrustedSystemKey });
  await registerVouchRoutes(app, { store: vouchStore });
  // The message relay (docs/message-relay.md): sealed DM envelopes.
  // The GET is recipient-scoped and self-authenticating regardless of
  // READ_AUTH; the POST's membership gate mirrors the read-auth
  // posture so a founder-keys-less node keeps messaging.
  await registerMessageRoutes(app, {
    store: messageStore,
    resolver: membershipResolver,
    requireSenderMembership: config.readAuth === "on",
    retentionDays: config.messageRetentionDays,
  });
  await registerPostRoutes(app, { store: postStore });
  // NOTE: no invite routes. `POST/GET /invites` was removed in the
  // invite-redemption Phase 1 PR — the GET served full SignedInvite
  // rows (a live-credential feed, `docs/invite-redemption.md` §10.1).
  // Redemption receipts (below) are the only invite-adjacent wire
  // surface: open invites never cross any wire.
  await registerRedemptionRoutes(app, {
    store: redemptionStore,
    internalToken: internalBypassToken,
    reseedGraceUntil: config.reseedGraceUntil,
  });
  await registerInviteRevocationRoutes(app, {
    store: inviteRevocationStore,
    internalToken: internalBypassToken,
  });
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
  // Project & task state — the first MUTABLE (last-writer-wins)
  // federation surface; authority rules in routes/projectStates.ts
  // and docs/project-federation.md §4.
  await registerProjectStateRoutes(app, {
    projectStore: projectStateStore,
    taskStore: taskStateStore,
  });
  // Participation state (Phase 2) — RSVPs / shifts / signups as
  // signed LWW records; authority rules in
  // routes/participationStates.ts and docs/project-federation.md §6.
  await registerParticipationStateRoutes(app, {
    rsvpStore: eventRsvpStateStore,
    shiftStore: eventShiftStateStore,
    signupStore: shiftSignupStateStore,
    eventStore,
  });
  // Seed-vault pledges (docs/storage-budget.md Phase 2) — a member's
  // public archive-role claim, single-owner LWW like an RSVP.
  await registerSeedVaultPledgeRoutes(app, { store: seedVaultPledgeStore });
  // Member removal / reinstatement (docs/member-removal.md M1): the
  // quorum-signed governance records and their feeds.
  await registerMemberRemovalRoutes(app, {
    removalStore: memberRemovalStore,
    reinstatementStore: memberReinstatementStore,
    resolver: membershipResolver,
    removalQuorum: config.removalQuorum,
    founderKeys: config.founderKeys,
  });
  // Proposal federation G1 (docs/proposal-federation.md): signed
  // proposals / votes / closures — the member-gated write surfaces.
  await registerGovernanceRoutes(app, {
    proposalStore,
    voteStore,
    closureStore: proposalClosureStore,
    resolver: membershipResolver,
    internalHeader: MIRROR_INTERNAL_HEADER,
    internalToken: internalBypassToken,
  });
  // Device-link mailbox — NOT a federation surface: rows are opaque
  // ciphertext, one-shot, TTL-bounded, never pulled by peers. The
  // route carries its own row ceiling + prune (routes/deviceLink.ts),
  // so it sits outside the insert-cap guard's SURFACES map.
  await registerDeviceLinkRoutes(app, { store: deviceLinkStore });
  // Tap-to-link rendezvous — same non-federating, ephemeral posture
  // as the mailbox above; carries only ephemeral PUBLIC keys.
  await registerLinkRequestRoutes(app, { store: linkRequestStore });
  await registerConfigRoutes(app, { config, signer });
  await registerAwaitingTransitionRoutes(app, {
    store: awaitingTransitionStore,
  });
  await registerAutoConfirmRoutes(app, {
    store,
    postStore,
    transitionStore: awaitingTransitionStore,
    signer,
    nodeId: config.nodeId,
    autoConfirmMinHours: config.autoConfirmMinHours,
    requireTransition: config.autoConfirmRequireTransition,
  });
  await registerPeersRoutes(app, {
    pullStore,
    configuredPeers: config.peerNodeUrls,
  });

  return { app, database: db, internalBypassToken };
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
