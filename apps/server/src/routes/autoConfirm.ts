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
import type { ExchangeStore } from "../db.js";
import { CATEGORIES, type Category } from "@understoria/shared/types";
import type { Exchange } from "@understoria/shared/types";
import {
  autoConfirmExchange,
  type AutoConfirmRequest,
  type SystemSigner,
} from "../systemSigner.js";

interface Deps {
  store: ExchangeStore;
  signer: SystemSigner | null;
  nodeId: string;
  autoConfirmMinHours: number;
  /** Test seam — defaults to Date.now. Pure value, so the system-
   *  clock abuse path in §5 is reproducible in tests without
   *  monkey-patching globals. */
  now?: () => number;
}

const CATEGORY_SET: ReadonlySet<Category> = new Set(CATEGORIES);

export async function registerAutoConfirmRoutes(
  app: FastifyInstance,
  deps: Deps,
): Promise<void> {
  const now = deps.now ?? (() => Date.now());

  app.post("/auto-confirm", async (req, reply) => {
    const parsed = parseBatch(req.body);
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

function parseBatch(input: unknown): ParseBatchResult {
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
    const parsed = parseOne(raw);
    if (!parsed.ok) return parsed;
    out.push(parsed.value);
  }
  return { ok: true, value: out };
}

function parseOne(
  input: unknown,
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
