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
import { verifyExchange } from "@understoria/shared/crypto";
import { parseExchange } from "./validate.js";
import type { ExchangeStore, PeerPullStore } from "./db.js";

/**
 * Federation pull loop — Agent 3 task 2.
 *
 * Each configured peer URL is polled on an interval. For every poll we
 * GET /exchanges?since=<last_completed_at>, verify every row's
 * signatures with the same `verifyExchange` the POST endpoint uses
 * (a peer claiming to be honest cannot inject anything unsigned), and
 * INSERT the new ones into the local store. The dedup check is by id —
 * `since` is an optimisation, `store.has(id)` is the correctness gate.
 *
 * Design notes:
 *
 * - The pulled exchanges retain their original `nodeId`. Federation is
 *   replication of a signed ledger, not re-attribution. A row pulled
 *   from peer B into node A shows `nodeId === B` forever.
 * - There is no admin endpoint for managing peers. Peers come from
 *   env vars (PEER_NODE_URLS). Agent 15 (federation governance) will
 *   replace this with signed federation agreements per the roadmap.
 * - The pull function is exported separately from the worker loop so
 *   tests can drive it with a fake fetcher and an in-memory store.
 *   The worker is the thin shell that wires timers + fetch.
 */

export interface PullResult {
  peerUrl: string;
  /** Exchanges that passed every check and were inserted. */
  insertedCount: number;
  /** Exchanges that arrived but were already in the local store. */
  duplicateCount: number;
  /** Exchanges that arrived but failed signature verification. */
  rejectedCount: number;
  /** max(completedAt) across the inserted rows; null if none new. */
  latestCompletedAt: number | null;
}

export type Fetcher = (url: string) => Promise<{
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}>;

/** Pure-ish core. Given a peer URL, a `since` timestamp, a fetcher,
 *  and the local store, performs one pull and returns the outcome.
 *  Never throws — converts failures to a thrown error caller can
 *  decide what to do with. */
export async function pullFromPeer(opts: {
  peerUrl: string;
  since: number | null;
  fetcher: Fetcher;
  store: ExchangeStore;
  /** Cap the response size so a misbehaving peer can't OOM us. The
   *  GET endpoint also caps; this is defence in depth. */
  maxRows?: number;
}): Promise<PullResult> {
  const { peerUrl, since, fetcher, store } = opts;
  const maxRows = opts.maxRows ?? 500;

  const url = buildUrl(peerUrl, since, maxRows);
  const response = await fetcher(url);
  if (!response.ok) {
    throw new Error(`peer ${peerUrl} returned status ${response.status}`);
  }
  const body = (await response.json()) as unknown;
  const rows = extractExchanges(body);
  if (rows === null) {
    throw new Error(
      `peer ${peerUrl} returned an unexpected response shape`,
    );
  }

  let insertedCount = 0;
  let duplicateCount = 0;
  let rejectedCount = 0;
  let latestCompletedAt: number | null = null;

  for (const raw of rows) {
    const parsed = parseExchange(raw);
    if (!parsed.ok) {
      rejectedCount += 1;
      continue;
    }
    const exchange = parsed.value;
    if (!verifyExchange(exchange)) {
      rejectedCount += 1;
      continue;
    }
    if (store.has(exchange.id)) {
      duplicateCount += 1;
      // Even a duplicate's completedAt advances our high-water mark —
      // we know we've successfully processed that point in time.
      if (
        latestCompletedAt === null ||
        exchange.completedAt > latestCompletedAt
      ) {
        latestCompletedAt = exchange.completedAt;
      }
      continue;
    }
    store.insert(exchange);
    insertedCount += 1;
    if (
      latestCompletedAt === null ||
      exchange.completedAt > latestCompletedAt
    ) {
      latestCompletedAt = exchange.completedAt;
    }
  }

  return {
    peerUrl,
    insertedCount,
    duplicateCount,
    rejectedCount,
    latestCompletedAt,
  };
}

function buildUrl(peerUrl: string, since: number | null, limit: number): string {
  const base = peerUrl.replace(/\/+$/, "");
  const params = new URLSearchParams();
  if (since !== null && Number.isFinite(since)) {
    params.set("since", String(since));
  }
  params.set("limit", String(limit));
  return `${base}/exchanges?${params.toString()}`;
}

function extractExchanges(body: unknown): unknown[] | null {
  if (
    body === null ||
    typeof body !== "object" ||
    !("exchanges" in body) ||
    !Array.isArray((body as { exchanges: unknown }).exchanges)
  ) {
    return null;
  }
  return (body as { exchanges: unknown[] }).exchanges;
}

export interface PullWorker {
  /** Runs one pull cycle across every configured peer. Useful in
   *  tests; called automatically by the timer loop in production. */
  pullAllOnce(): Promise<PullResult[]>;
  stop(): void;
}

export interface PullWorkerOptions {
  peerUrls: readonly string[];
  intervalMs: number;
  store: ExchangeStore;
  pullStore: PeerPullStore;
  fetcher?: Fetcher;
  /** Called for unexpected errors (one peer failing doesn't stop the
   *  loop). Default `console.warn`. */
  onError?: (peerUrl: string, error: Error) => void;
  /** Called after each successful pull, useful for tests. */
  onPull?: (result: PullResult) => void;
}

export function startPeerPullWorker(opts: PullWorkerOptions): PullWorker {
  const {
    peerUrls,
    intervalMs,
    store,
    pullStore,
    fetcher = (url) => fetch(url),
    onError = (peerUrl, err) =>
      // eslint-disable-next-line no-console
      console.warn(`[peer-pull] ${peerUrl}: ${err.message}`),
    onPull,
  } = opts;

  async function pullOne(peerUrl: string): Promise<PullResult | null> {
    const state = pullStore.get(peerUrl);
    const since = state?.lastCompletedAt ?? null;
    try {
      const result = await pullFromPeer({ peerUrl, since, fetcher, store });
      pullStore.recordSuccess({
        peerUrl,
        at: Date.now(),
        latestCompletedAt: result.latestCompletedAt,
        pulledCount: result.insertedCount,
      });
      onPull?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      pullStore.recordFailure({
        peerUrl,
        at: Date.now(),
        error: error.message,
      });
      onError(peerUrl, error);
      return null;
    }
  }

  async function pullAllOnce(): Promise<PullResult[]> {
    const results = await Promise.all(
      peerUrls.map((url) => pullOne(url)),
    );
    return results.filter((r): r is PullResult => r !== null);
  }

  let timer: NodeJS.Timeout | null = null;
  let stopped = false;

  function scheduleNext() {
    if (stopped) return;
    timer = setTimeout(async () => {
      timer = null;
      await pullAllOnce();
      scheduleNext();
    }, intervalMs);
    // Don't keep the event loop alive solely because a pull is queued
    // — graceful shutdown should be able to exit cleanly.
    timer.unref?.();
  }

  if (peerUrls.length > 0) {
    scheduleNext();
  }

  return {
    pullAllOnce,
    stop() {
      stopped = true;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    },
  };
}
