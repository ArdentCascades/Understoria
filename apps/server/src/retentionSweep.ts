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
 * Retention sweep (docs/node-seizure-plan.md §3): a periodic worker
 * that deletes metadata a seized node should not yield forever.
 *
 * Exactly four rules, each provably safe (per-table analysis in the
 * plan's §3.3 — none of the swept tables is reseeded, and the one
 * mirrored kind, claims, was already ruled loss-tolerant):
 *
 *  - `claims` older than CLAIM_RETENTION_DAYS — dead coordination
 *    state; the durable outcome (the exchange) is permanent.
 *  - `invite_announcements` whose own `expires_at` passed more than
 *    ANNOUNCEMENT_RETENTION_DAYS ago — the invite is unusable either
 *    way, and the redemption receipt is the membership authority.
 *  - `awaiting_transitions` that are SETTLED (a stored exchange exists
 *    for the post) and older than TRANSITION_RETENTION_DAYS. PENDING
 *    artifacts are never touched: under AUTO_CONFIRM_REQUIRE_TRANSITION
 *    a pruned pending artifact would strand its exchange.
 *  - `newcomer_daily_writes` whose window started more than
 *    NEWCOMER_COUNTER_RETENTION_DAYS ago — the cap guard already
 *    treats a >24 h-stale row as a fresh window, so this deletion is
 *    semantics-preserving by construction.
 *
 * THE FORBIDDEN LIST (do not add rules for these): `redemptions`,
 * `vouches`, `claimed_founders`, `founder_accessions`,
 * `invite_revocations`, and all durable community content. The trust
 * and membership resolvers memoize on COUNT(*) stamps of their source
 * tables under an explicit append-only assumption (trustGate.ts) —
 * pruning one row and gaining another would leave the count unchanged
 * and the cache silently stale, on top of shrinking trust itself.
 * `retentionSweep.test.ts` pins this list executably.
 *
 * Worker shape mirrors `startCapacitySampler`: synchronous tick off
 * the request path, overlap guard, unref'd interval, injectable clock.
 * The log line carries counts only — no keys, no ids.
 */
import type { FastifyBaseLogger } from "fastify";
import type { Database as DatabaseType } from "better-sqlite3-multiple-ciphers";

const DAY_MS = 24 * 60 * 60 * 1000;

export interface RetentionSweepOptions {
  db: DatabaseType;
  /** Worker cadence; 0 disables the interval (sweepOnce still works). */
  intervalMs: number;
  /** Per-rule windows in days; 0 disables that rule. */
  claimRetentionDays: number;
  announcementRetentionDays: number;
  transitionRetentionDays: number;
  newcomerCounterRetentionDays: number;
  log: FastifyBaseLogger;
  now?: () => number;
}

export interface RetentionSweepResult {
  claims: number;
  announcements: number;
  transitions: number;
  counters: number;
}

export interface RetentionSweep {
  sweepOnce(): RetentionSweepResult;
  stop(): void;
}

export function startRetentionSweep(
  opts: RetentionSweepOptions,
): RetentionSweep {
  const now = opts.now ?? Date.now;

  const deleteClaims = opts.db.prepare(
    "DELETE FROM claims WHERE claimed_at < ?",
  );
  const deleteAnnouncements = opts.db.prepare(
    "DELETE FROM invite_announcements WHERE expires_at < ?",
  );
  // Settled-only: the EXISTS proves a stored exchange for this post,
  // so the artifact's job (bounding the auto-confirm window for a
  // still-open exchange) is finished. Covered by the v33
  // exchanges_post_id_idx index.
  const deleteTransitions = opts.db.prepare(
    `DELETE FROM awaiting_transitions
      WHERE received_at < ?
        AND EXISTS (SELECT 1 FROM exchanges e
                    WHERE e.post_id = awaiting_transitions.post_id)`,
  );
  const deleteCounters = opts.db.prepare(
    "DELETE FROM newcomer_daily_writes WHERE window_start < ?",
  );

  function sweepOnce(): RetentionSweepResult {
    const t = now();
    const result: RetentionSweepResult = {
      claims: 0,
      announcements: 0,
      transitions: 0,
      counters: 0,
    };
    if (opts.claimRetentionDays > 0) {
      result.claims = deleteClaims.run(
        t - opts.claimRetentionDays * DAY_MS,
      ).changes;
    }
    if (opts.announcementRetentionDays > 0) {
      result.announcements = deleteAnnouncements.run(
        t - opts.announcementRetentionDays * DAY_MS,
      ).changes;
    }
    if (opts.transitionRetentionDays > 0) {
      result.transitions = deleteTransitions.run(
        t - opts.transitionRetentionDays * DAY_MS,
      ).changes;
    }
    if (opts.newcomerCounterRetentionDays > 0) {
      result.counters = deleteCounters.run(
        t - opts.newcomerCounterRetentionDays * DAY_MS,
      ).changes;
    }
    const total =
      result.claims +
      result.announcements +
      result.transitions +
      result.counters;
    if (total > 0) {
      opts.log.info(result, "retention sweep pruned rows");
    }
    return result;
  }

  let running = false;
  const tick = (): void => {
    if (running) return;
    running = true;
    try {
      sweepOnce();
    } catch (err) {
      opts.log.warn(
        { err: err instanceof Error ? err.message : String(err) },
        "retention sweep failed",
      );
    } finally {
      running = false;
    }
  };

  const active = opts.intervalMs > 0;
  const timer = active ? setInterval(tick, opts.intervalMs) : null;
  timer?.unref?.();
  if (active) {
    opts.log.info(
      {
        intervalMs: opts.intervalMs,
        claimDays: opts.claimRetentionDays,
        announcementDays: opts.announcementRetentionDays,
        transitionDays: opts.transitionRetentionDays,
        newcomerCounterDays: opts.newcomerCounterRetentionDays,
      },
      "retention sweep active",
    );
    tick();
  } else {
    opts.log.warn(
      "retention sweep DISABLED (RETENTION_SWEEP_INTERVAL_MS=0) — seized-disk metadata is unbounded",
    );
  }

  return {
    sweepOnce,
    stop() {
      if (timer !== null) clearInterval(timer);
    },
  };
}
