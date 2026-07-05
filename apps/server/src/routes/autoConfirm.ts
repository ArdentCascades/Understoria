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
/**
 * POST /auto-confirm — the bounded surface from
 * `docs/auto-confirm-key.md` §4. Body is a batch of requests; the
 * server independently checks each one against `autoConfirmMinHours`
 * AND re-verifies the helper signature before signing. See
 * `systemSigner.ts` for the per-row decision logic.
 *
 * Why this lives in its own route file rather than alongside
 * `/exchanges`: the signing surface is the privileged thing and the
 * design doc's §2 contract is easier to audit when exactly one
 * file touches the system key.
 */
import type { FastifyInstance } from "fastify";
import type { ExchangeStore, PostRecord, PostStore } from "../db.js";
import { CATEGORIES, type Category } from "@understoria/shared/types";
import type { Exchange } from "@understoria/shared/types";
import { verifyPost } from "@understoria/shared/crypto";
import {
  autoConfirmExchange,
  type AutoConfirmRequest,
  type SystemSigner,
} from "../systemSigner.js";

interface Deps {
  store: ExchangeStore;
  /** The post store, consulted to bind a system-signed confirmation
   *  to the poster-signed post it finalizes (see `bindToPost`). */
  postStore: PostStore;
  signer: SystemSigner | null;
  nodeId: string;
  autoConfirmMinHours: number;
  /** Test seam — defaults to Date.now. Pure value, so the system-
   *  clock abuse path in §5 is reproducible in tests without
   *  monkey-patching globals. */
  now?: () => number;
}

const CATEGORY_SET: ReadonlySet<Category> = new Set(CATEGORIES);

/** Project-task auto-confirms use a synthetic postId that is NOT a
 *  federated post (projects are local-only, docs/threat-model.md §7),
 *  so the node has no artifact to bind them to. */
const PROJECT_TASK_POSTID = /^project:[^/]+\/task:.+$/;

/** Generous finite ceiling for the ONLY path the node can't bind to a
 *  signed post (project tasks). Post-based requests are bound exactly
 *  to `post.estimatedHours`, so they need no separate cap. This is the
 *  sole defense against a fabricated project-task request minting an
 *  absurd (or overflow) `hours` against a named victim. */
const MAX_UNBOUND_AUTO_CONFIRM_HOURS = 1000;

/**
 * Authority binding for `/auto-confirm` (Round-4 review). The system
 * key signs the HELPED side of an exchange — i.e. it confirms *on the
 * helped party's behalf*. Without this check the caller supplied every
 * field (`helpedKey`, `hours`, `category`, and the age via
 * `awaitingSince`), so anyone could mint a node-signed exchange
 * debiting an arbitrary victim for arbitrary hours. The doc's "cannot
 * invent exchanges / cannot confirm on a member's behalf without their
 * prior action" guarantees (auto-confirm-key.md §5) require this bind.
 *
 * For a real post the node holds the poster's SIGNED post, so it can
 * require: the poster is the party the system is confirming for
 * (helped side for a NEED, helper side for an OFFER), and the hours /
 * category match what the poster signed. The claimer side stays
 * unverifiable here (claims are unsigned and may not be on this node),
 * which is the documented, attributable, disputable residual.
 *
 * Returns an ineligible reason string, or null when the request is
 * authorized to proceed to signing.
 */
function bindToPost(
  request: AutoConfirmRequest,
  postStore: PostStore,
): string | null {
  const { payload } = request;

  if (PROJECT_TASK_POSTID.test(payload.postId)) {
    // Unbindable path — projects don't federate. Bound the one field a
    // fabricated request could weaponize; the residual (a same-node
    // organizer-trust surface) is documented in auto-confirm-key.md §5.
    if (payload.hours > MAX_UNBOUND_AUTO_CONFIRM_HOURS) {
      return "hours_exceeds_cap";
    }
    return null;
  }

  const post: PostRecord | null = postStore.get(payload.postId);
  if (post === null) {
    // The post has not federated to this node yet (or never existed).
    // Distinct from a mismatch so the client sweep can retry rather
    // than treat it as permanent.
    return "post_not_found";
  }
  // Re-verify the poster's signature — a stored row should already be
  // verified, but the system key is the privileged surface; do not
  // assume.
  if (!verifyPost(post as Parameters<typeof verifyPost>[0])) {
    return "post_signature_invalid";
  }
  // Bind the confirmed-for party to the real poster.
  const posterSide =
    post.type === "NEED" ? payload.helpedKey : payload.helperKey;
  if (posterSide !== post.postedBy) {
    return "poster_mismatch";
  }
  if (payload.hours !== post.estimatedHours) {
    return "hours_mismatch";
  }
  if (payload.category !== post.category) {
    return "category_mismatch";
  }
  return null;
}

export async function registerAutoConfirmRoutes(
  app: FastifyInstance,
  deps: Deps,
): Promise<void> {
  const now = deps.now ?? (() => Date.now());

  app.post("/auto-confirm", async (req, reply) => {
    const parsed = parseBatch(req.body, now());
    if (!parsed.ok) {
      reply.code(400);
      return { error: "invalid_body", reason: parsed.error };
    }

    const results: {
      exchangeId: string;
      status: "signed" | "ineligible";
      reason?: string;
      exchange?: Exchange;
    }[] = [];

    for (const request of parsed.value) {
      // Re-submission idempotency — if we already signed this id,
      // do not sign again. Second signing would mint a fresh
      // autoConfirmedAt and amount to an audit lie. We return the
      // already-stored row so the client can converge.
      if (deps.store.has(request.exchangeId)) {
        // Point lookup — the previous list({limit:1}).find(...) only
        // matched when the requested id happened to be the single row
        // that one-row page returned, so re-submissions usually got
        // status:"signed" with no exchange attached and the client
        // couldn't converge on the stored row.
        const existing = deps.store.get(request.exchangeId);
        results.push({
          exchangeId: request.exchangeId,
          status: "signed",
          ...(existing ? { exchange: existing } : {}),
        });
        continue;
      }

      // Authority binding BEFORE the window/signature checks: the
      // system key must never confirm for a party who never authored
      // the post being finalized (Round-4 review). See bindToPost.
      const bindError = bindToPost(request, deps.postStore);
      if (bindError !== null) {
        results.push({
          exchangeId: request.exchangeId,
          status: "ineligible",
          reason: bindError,
        });
        continue;
      }

      const result = autoConfirmExchange(request, {
        signer: deps.signer,
        nodeId: deps.nodeId,
        autoConfirmHours: deps.autoConfirmMinHours,
        now: now(),
      });

      if (result.kind === "signed") {
        deps.store.insert(result.exchange);
        results.push({
          exchangeId: result.exchange.id,
          status: "signed",
          exchange: result.exchange,
        });
      } else {
        results.push({
          exchangeId: request.exchangeId,
          status: "ineligible",
          reason: result.reason,
        });
      }
    }
    return { results };
  });
}

type ParseBatchResult =
  | { ok: true; value: AutoConfirmRequest[] }
  | { ok: false; error: string };

function parseBatch(input: unknown, now: number): ParseBatchResult {
  if (typeof input !== "object" || input === null) {
    return { ok: false, error: "body must be a JSON object" };
  }
  const r = input as { requests?: unknown };
  if (!Array.isArray(r.requests)) {
    return { ok: false, error: "requests must be an array" };
  }
  if (r.requests.length === 0) {
    return { ok: false, error: "requests must not be empty" };
  }
  if (r.requests.length > 100) {
    return { ok: false, error: "requests must contain at most 100 entries" };
  }
  const out: AutoConfirmRequest[] = [];
  for (const raw of r.requests) {
    const parsed = parseOne(raw, now);
    if (!parsed.ok) return parsed;
    out.push(parsed.value);
  }
  return { ok: true, value: out };
}

function parseOne(
  input: unknown,
  now: number,
): { ok: true; value: AutoConfirmRequest } | { ok: false; error: string } {
  if (typeof input !== "object" || input === null) {
    return { ok: false, error: "each request must be an object" };
  }
  const r = input as Record<string, unknown>;
  if (typeof r.exchangeId !== "string" || r.exchangeId.length === 0) {
    return { ok: false, error: "exchangeId must be a non-empty string" };
  }
  if (
    typeof r.awaitingSince !== "number" ||
    !Number.isInteger(r.awaitingSince) ||
    r.awaitingSince <= 0
  ) {
    return {
      ok: false,
      error: "awaitingSince must be a positive integer (ms epoch)",
    };
  }
  if (typeof r.helperSignature !== "string" || r.helperSignature.length === 0) {
    return { ok: false, error: "helperSignature must be a non-empty string" };
  }
  if (typeof r.payload !== "object" || r.payload === null) {
    return { ok: false, error: "payload must be an object" };
  }
  const p = r.payload as Record<string, unknown>;
  for (const f of ["postId", "helperKey", "helpedKey"] as const) {
    if (typeof p[f] !== "string" || (p[f] as string).length === 0) {
      return { ok: false, error: `payload.${f} must be a non-empty string` };
    }
  }
  if (typeof p.hours !== "number" || !Number.isFinite(p.hours) || p.hours <= 0) {
    return { ok: false, error: "payload.hours must be a positive number" };
  }
  if (
    typeof p.completedAt !== "number" ||
    !Number.isInteger(p.completedAt) ||
    p.completedAt <= 0
  ) {
    return {
      ok: false,
      error: "payload.completedAt must be a positive integer",
    };
  }
  // Defense in depth (Round-4 review): neither timestamp may be far in
  // the future (the one-day skew grace used across the codebase).
  //
  // NOTE on the window: the age gate (`now - awaitingSince >=
  // autoConfirmHours`) CANNOT be server-verified — the node holds no
  // signed record of when the post entered `awaiting_confirmation`
  // (that transition is PWA-local, and `completedAt` is stamped to the
  // sweep's `now`, so awaitingSince is legitimately far below it). A
  // caller can therefore always claim an old `awaitingSince`. The
  // window is honest-client advisory; the real gate is `bindToPost`
  // (a fabricated exchange can't name an arbitrary victim) plus the
  // safeguards + dispute layer. Making the window itself enforceable
  // needs a signed awaiting-transition artifact — see
  // docs/auto-confirm-key.md §5 / the roadmap deferred row.
  const oneDayFromNow = now + 24 * 60 * 60 * 1000;
  if ((p.completedAt as number) > oneDayFromNow) {
    return { ok: false, error: "payload.completedAt is too far in the future" };
  }
  if ((r.awaitingSince as number) > oneDayFromNow) {
    return { ok: false, error: "awaitingSince is too far in the future" };
  }
  if (
    typeof p.category !== "string" ||
    !CATEGORY_SET.has(p.category as Category)
  ) {
    return {
      ok: false,
      error: "payload.category is not a recognized category",
    };
  }
  return {
    ok: true,
    value: {
      exchangeId: r.exchangeId,
      awaitingSince: r.awaitingSince,
      helperSignature: r.helperSignature,
      payload: {
        postId: p.postId as string,
        helperKey: p.helperKey as string,
        helpedKey: p.helpedKey as string,
        hours: p.hours as number,
        category: p.category as Category,
        completedAt: p.completedAt as number,
      },
    },
  };
}
