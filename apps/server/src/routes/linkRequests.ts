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
import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import type { LinkRequestStore } from "../db.js";

/**
 * Tap-to-link rendezvous (docs/device-pairing.md §6.7).
 *
 * The NEW device raises its hand: it posts one ephemeral X25519
 * public key; the member's signed-in device — polling from the same
 * network address — sees it listed and answers by sealing the
 * identity to that key through the /device-link mailbox. This route
 * carries NO identity material in either direction: a public key in,
 * a list of public keys out.
 *
 * Address bucketing: requests are grouped under a salted FNV hash of
 * the caller's IP folded to 4096 buckets — the same non-reversible
 * posture as the rate limiter's buckets (threat model §6: raw IPs
 * are never stored or logged). Folding means occasional strangers
 * share a bucket (CGNAT does this anyway); the client UI handles
 * that with the recognition badge and an explicit-choice list, so a
 * collision costs a glance, not an identity.
 *
 * Unauthenticated on purpose (the requester is not a member yet).
 * Bounded by: global rate limit, per-bucket live cap, global row
 * cap, short TTL, prune on every write.
 */

/** Server-authoritative request lifetime. Long enough to flip apps
 *  and find the Add-device screen without rushing; short enough that
 *  a stranger's stale request ages out of a shared bucket. */
export const LINK_REQUEST_TTL_MS = 10 * 60_000;

/** Live requests allowed per bucket. A member links one device at a
 *  time; three tolerates a household doing two at once plus one
 *  abandoned ask, while capping how much a shared-NAT prankster can
 *  clutter the member's approve list. */
const MAX_PER_BUCKET = 3;

/** Global live-row backstop. */
const MAX_LIVE_ROWS = 512;

// 32 bytes of base64 (43 chars unpadded / 44 padded). Validated by
// decode-length below; the regex is a cheap pre-filter.
const B64_RE = /^[A-Za-z0-9+/]+={0,2}$/;

function decodesTo32Bytes(s: string): boolean {
  if (s.length < 40 || s.length > 48 || !B64_RE.test(s)) return false;
  try {
    return Buffer.from(s, "base64").length === 32;
  } catch {
    return false;
  }
}

/** Fold an IP into one of 4096 opaque buckets. Deliberately lossy
 *  (thousands of addresses per bucket over the IPv4 space) so the
 *  stored value identifies a *neighborhood*, never a household. Tag
 *  prefix keeps this keyspace disjoint from the rate limiter's. */
export function linkBucketForIp(ip: string): string {
  const tagged = `link|${ip}`;
  let h = 2166136261 >>> 0;
  for (let i = 0; i < tagged.length; i++) {
    h ^= tagged.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `link_${(h >>> 0) % 4096}`;
}

interface Deps {
  store: LinkRequestStore;
  now?: () => number;
}

/**
 * POST /link-request        { pubkey }  → 201 { ok, cancelToken, expiresAt }
 *   400 invalid pubkey · 409 duplicate · 429 bucket full · 507 table full
 * GET  /link-request                    → 200 { requests: [{pubkey, createdAt}] }
 *   Scoped to the caller's bucket; expired rows never appear.
 * POST /link-request/cancel { pubkey, cancelToken } → 200 { ok } | 404
 *   Creator-only withdrawal (the token never left the creator).
 */
export async function registerLinkRequestRoutes(
  app: FastifyInstance,
  { store, now = () => Date.now() }: Deps,
): Promise<void> {
  app.post("/link-request", async (req, reply) => {
    const body = req.body as { pubkey?: unknown } | null | undefined;
    const pubkey = body?.pubkey;
    if (typeof pubkey !== "string" || !decodesTo32Bytes(pubkey)) {
      reply.code(400);
      return { error: "invalid_pubkey" };
    }

    const t = now();
    store.pruneExpired(t);

    if (store.count() >= MAX_LIVE_ROWS) {
      reply.code(507);
      return { error: "too_many_requests_total" };
    }

    const bucket = linkBucketForIp(req.ip);
    if (store.countByBucket(bucket, t) >= MAX_PER_BUCKET) {
      reply.code(429);
      return { error: "too_many_pending" };
    }

    const cancelToken = randomUUID();
    try {
      store.insert({
        pubkey,
        bucket,
        cancelToken,
        createdAt: t,
        expiresAt: t + LINK_REQUEST_TTL_MS,
      });
    } catch {
      reply.code(409);
      return { error: "duplicate_pubkey" };
    }
    reply.code(201);
    return { ok: true, cancelToken, expiresAt: t + LINK_REQUEST_TTL_MS };
  });

  app.get("/link-request", async (req) => {
    const bucket = linkBucketForIp(req.ip);
    return { requests: store.listByBucket(bucket, now()) };
  });

  app.post("/link-request/cancel", async (req, reply) => {
    const body = req.body as
      | { pubkey?: unknown; cancelToken?: unknown }
      | null
      | undefined;
    const pubkey = body?.pubkey;
    const cancelToken = body?.cancelToken;
    if (typeof pubkey !== "string" || typeof cancelToken !== "string") {
      reply.code(400);
      return { error: "invalid_body" };
    }
    const removed = store.remove(pubkey, cancelToken);
    if (!removed) {
      reply.code(404);
      return { error: "not_found" };
    }
    return { ok: true };
  });
}
