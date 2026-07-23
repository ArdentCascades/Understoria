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
import type { Database as DatabaseType } from "better-sqlite3-multiple-ciphers";
import { SURFACES } from "./insertCaps.js";
import { MIRROR_INTERNAL_HEADER } from "./mirrorPull.js";
import type { TrustResolver } from "./trustGate.js";

/**
 * Newcomer daily creation caps — human-scale anti-spam for PENDING
 * authors (operator decision 2026-07: "I do want to prevent spam").
 *
 * The problem the lifetime insert caps (insertCaps.ts) don't solve:
 * a freshly-admitted member — or a bot admitted by a careless one —
 * is a valid signer whose records pass every gate, and the lifetime
 * per-key ceiling is deliberately generous. Between admission and
 * trust (founder-rooted fixpoint, trustGate.ts) an attacker could
 * flood the visible surfaces: hundreds of posts or events a day,
 * each individually well-formed. This guard bounds that window at a
 * human scale: a NOT-YET-TRUSTED author gets a per-surface daily
 * budget sized so a genuine newcomer never notices (nobody organizes
 * four community events or writes eleven board posts on their first
 * day), while a spam run hits the wall in minutes.
 *
 * What this is NOT: not a reputation system, not a quota members can
 * see or accrue, and not applied to trusted members at all — the
 * guard re-checks `trust.isTrusted(key)` on EVERY request, so the
 * limit lifts the instant the author becomes trusted (a second vouch
 * landing mid-day, or trust data converging from a mirror, frees the
 * very next write; nothing waits for the window to roll).
 *
 * Only CREATION surfaces are capped. Participation surfaces —
 * /claims, /exchanges, /event-rsvps, /shift-signups, /messages,
 * /votes — are deliberately uncapped: answering, joining, and voting
 * are exactly what a newcomer should be doing freely, and each is
 * already bounded by what exists to respond to.
 *
 * Server-clock windows, persisted: record timestamps are
 * CLIENT-CLAIMED (the insertCaps.ts constraint), so a rolling window
 * computed over stored `createdAt` values would be dodgeable by
 * backdating. Instead the guard keeps its own counter table
 * (`newcomer_daily_writes`, one row per author×table, updated in
 * place — no growth, no pruning) stamped with the SERVER's clock:
 * first counted write opens a 24 h window; writes inside it
 * increment; the first write at or past 24 h resets the window.
 *
 * Increment-then-validate: the counter moves BEFORE the route's own
 * shape/signature validation, so a later 4xx still consumed a slot.
 * That trade is deliberate — an attacker spamming invalid bodies
 * burns their own window, and an honest member's rare validation
 * error costs one slot out of a generous cap. A breach itself never
 * increments.
 *
 * Breaches answer **429** `{ error: "newcomer_daily_limit", scope:
 * "<table>" }`. 429 on purpose: the PWA outbox treats 429 as
 * retryable, so an honest queued record waits and delivers after the
 * window (or the moment trust lands) instead of being poisoned the
 * way a 4xx contract violation would be.
 *
 * Skipped entirely for: mirror-internal replication (history already
 * accepted elsewhere must converge), founderless nodes (no trust
 * root ⇒ everyone would be "pending" forever — same tolerant posture
 * as trustGate.ts), and while the re-seed grace window
 * (`RESEED_GRACE_UNTIL`, docs/community-reseed.md §3) is open:
 * re-seeding devices re-POST a member's whole history through these
 * public routes without the internal token, and the trust edges that
 * would exempt the author may not have re-arrived yet — a daily cap
 * would wedge the restore mid-upload. The window is time-boxed and
 * loudly logged, so the exemption is too.
 */

/** Per-surface daily budgets for pending authors. Each overridable
 *  via env `NEWCOMER_DAILY_<NAME>` (path upper-cased, dashes to
 *  underscores — e.g. `NEWCOMER_DAILY_PROJECT_STATES`); 0 disables
 *  that surface's cap; `NEWCOMER_DAILY_CAPS=off` disables the whole
 *  guard. Sized to be invisible to a genuine newcomer's busiest
 *  honest day. */
export const NEWCOMER_DAILY_CAPS: Readonly<Record<string, number>> = {
  "/posts": 10,
  "/events": 3,
  "/project-states": 20,
  "/task-states": 20,
  "/proposals": 3,
  "/audio-blobs": 5,
  "/task-comments": 40,
};

/** Rolling-window length: 24 h on the server clock. */
export const NEWCOMER_WINDOW_MS = 24 * 60 * 60 * 1000;

export function registerNewcomerCapGuard(
  app: FastifyInstance,
  deps: {
    db: DatabaseType;
    trust: TrustResolver;
    /** `BuiltServer.internalBypassToken` — mirror replication exempt. */
    internalToken: string;
    /** Parsed caps (config.newcomerDailyCaps); null = guard off. */
    caps: Readonly<Record<string, number>> | null;
    /** `Config.reseedGraceUntil` — skip while the window is open
     *  (see module comment). */
    reseedGraceUntil?: number | null;
  },
): void {
  const { db, trust, internalToken, caps, reseedGraceUntil = null } = deps;
  if (caps === null) return;

  // Derive table/keyField attribution from the insert-cap SURFACES
  // map — one source of truth for "which table does this POST feed
  // and who signed it". A caps entry naming an unknown path is a
  // programming error, caught at boot rather than silently uncapped.
  const capped = new Map<
    string,
    { table: string; keyField: string; cap: number }
  >();
  for (const [path, cap] of Object.entries(caps)) {
    if (cap <= 0) continue; // 0 disables this surface's cap
    const surface = SURFACES[path];
    if (!surface || !surface.keyField) {
      throw new Error(
        `newcomer cap configured for ${path}, which is not an attributable SURFACES entry`,
      );
    }
    capped.set(path, { table: surface.table, keyField: surface.keyField, cap });
  }
  if (capped.size === 0) return;

  const readCounter = db.prepare(
    `SELECT window_start, count FROM newcomer_daily_writes
      WHERE author_key = ? AND tbl = ?`,
  );
  const writeCounter = db.prepare(
    `INSERT INTO newcomer_daily_writes (author_key, tbl, window_start, count)
      VALUES (?, ?, ?, ?)
      ON CONFLICT (author_key, tbl) DO UPDATE SET
        window_start = excluded.window_start,
        count = excluded.count`,
  );

  app.addHook("preHandler", async (req, reply) => {
    if (req.method !== "POST") return;
    const surface = capped.get(req.url.split("?")[0]);
    if (!surface) return;
    // Mirror replication: records another node already accepted.
    if (req.headers[MIRROR_INTERNAL_HEADER] === internalToken) return;
    // Re-seed grace window: restores re-POST history as "pending"
    // authors before their trust edges have re-arrived.
    if (reseedGraceUntil !== null && Date.now() < reseedGraceUntil) return;

    const body = req.body as Record<string, unknown> | null;
    const key =
      body && typeof body[surface.keyField] === "string"
        ? (body[surface.keyField] as string)
        : null;
    // No attributable key: the route's own shape validation rejects.
    if (!key) return;

    // No trust root, or a TRUSTED author: uncapped. isTrusted is
    // re-checked per request, so trust landing mid-day lifts the cap
    // immediately.
    if (trust.founderlessSkip()) return;
    if (trust.isTrusted(key)) return;

    const now = Date.now();
    const row = readCounter.get(key, surface.table) as
      | { window_start: number; count: number }
      | undefined;
    if (row !== undefined && now - row.window_start < NEWCOMER_WINDOW_MS) {
      if (row.count >= surface.cap) {
        // Breach: answer WITHOUT incrementing — being refused must
        // not push the window's reset further away.
        reply.code(429);
        return reply.send({
          error: "newcomer_daily_limit",
          scope: surface.table,
        });
      }
      writeCounter.run(key, surface.table, row.window_start, row.count + 1);
    } else {
      // First counted write ever, or first past the 24 h mark:
      // (re)open the window on the server clock.
      writeCounter.run(key, surface.table, now, 1);
    }
  });
}
