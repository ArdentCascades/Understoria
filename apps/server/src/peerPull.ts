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
import { verifyExchange, verifyVouch } from "@understoria/shared/crypto";
import { parseExchange, parseVouch } from "./validate.js";
import type {
  ExchangeStore,
  PeerPullStore,
  PullRecordKind,
  VouchStore,
} from "./db.js";

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
  kind: PullRecordKind;
  /** Records that passed every check and were inserted. */
  insertedCount: number;
  /** Records that arrived but were already in the local store. */
  duplicateCount: number;
  /** Records that arrived but failed signature verification. */
  rejectedCount: number;
  /** max(cursorField) across the inserted rows; null if none new.
   *  Cursor is `completedAt` for exchanges, `createdAt` for vouches. */
  latestCompletedAt: number | null;
}

export type Fetcher = (url: string) => Promise<{
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}>;

/** Pure-ish core. Given a peer URL, a `since` timestamp, a fetcher,
 *  and the local store, performs one /exchanges pull and returns the
 *  outcome. Never silently swallows — converts failures to thrown
 *  errors the caller can decide what to do with. */
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

  const url = buildUrl(peerUrl, "exchanges", since, maxRows);
  const rows = await fetchAndExtract(fetcher, url, peerUrl, "exchanges");

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
    kind: "exchange",
    insertedCount,
    duplicateCount,
    rejectedCount,
    latestCompletedAt,
  };
}

/** Vouch-flavoured sibling of `pullFromPeer`. Same shape, different
 *  verifier + parser + cursor field. Kept as a separate function
 *  rather than a generic so each path can stay readable and the
 *  Exchange-vs-Vouch types don't bleed across. */
export async function pullVouchesFromPeer(opts: {
  peerUrl: string;
  since: number | null;
  fetcher: Fetcher;
  store: VouchStore;
  maxRows?: number;
}): Promise<PullResult> {
  const { peerUrl, since, fetcher, store } = opts;
  const maxRows = opts.maxRows ?? 500;

  const url = buildUrl(peerUrl, "vouches", since, maxRows);
  const rows = await fetchAndExtract(fetcher, url, peerUrl, "vouches");

  let insertedCount = 0;
  let duplicateCount = 0;
  let rejectedCount = 0;
  let latestCreatedAt: number | null = null;

  for (const raw of rows) {
    const parsed = parseVouch(raw);
    if (!parsed.ok) {
      rejectedCount += 1;
      continue;
    }
    const vouch = parsed.value;
    if (!verifyVouch(vouch)) {
      rejectedCount += 1;
      continue;
    }
    if (store.has(vouch.id)) {
      duplicateCount += 1;
      if (latestCreatedAt === null || vouch.createdAt > latestCreatedAt) {
        latestCreatedAt = vouch.createdAt;
      }
      continue;
    }
    store.insert(vouch);
    insertedCount += 1;
    if (latestCreatedAt === null || vouch.createdAt > latestCreatedAt) {
      latestCreatedAt = vouch.createdAt;
    }
  }

  return {
    peerUrl,
    kind: "vouch",
    insertedCount,
    duplicateCount,
    rejectedCount,
    latestCompletedAt: latestCreatedAt,
  };
}

function buildUrl(
  peerUrl: string,
  path: "exchanges" | "vouches",
  since: number | null,
  limit: number,
): string {
  const base = peerUrl.replace(/\/+$/, "");
  const params = new URLSearchParams();
  if (since !== null && Number.isFinite(since)) {
    params.set("since", String(since));
  }
  params.set("limit", String(limit));
  return `${base}/${path}?${params.toString()}`;
}

async function fetchAndExtract(
  fetcher: Fetcher,
  url: string,
  peerUrl: string,
  arrayKey: "exchanges" | "vouches",
): Promise<unknown[]> {
  const response = await fetcher(url);
  if (!response.ok) {
    throw new Error(`peer ${peerUrl} returned status ${response.status}`);
  }
  const body = (await response.json()) as unknown;
  if (
    body === null ||
    typeof body !== "object" ||
    !(arrayKey in body) ||
    !Array.isArray((body as Record<string, unknown>)[arrayKey])
  ) {
    throw new Error(
      `peer ${peerUrl} returned an unexpected response shape`,
    );
  }
  return (body as Record<string, unknown[]>)[arrayKey];
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
  vouchStore: VouchStore;
  pullStore: PeerPullStore;
  fetcher?: Fetcher;
  /** Called for unexpected errors (one peer failing doesn't stop the
   *  loop). Default `console.warn`. */
  onError?: (peerUrl: string, error: Error) => void;
  /** Called after each successful pull (per kind), useful for tests. */
  onPull?: (result: PullResult) => void;
}

export function startPeerPullWorker(opts: PullWorkerOptions): PullWorker {
  const {
    peerUrls,
    intervalMs,
    store,
    vouchStore,
    pullStore,
    fetcher = (url) => fetch(url),
    onError = (peerUrl, err) =>
      // eslint-disable-next-line no-console
      console.warn(`[peer-pull] ${peerUrl}: ${err.message}`),
    onPull,
  } = opts;

  async function pullKind(
    peerUrl: string,
    kind: PullRecordKind,
  ): Promise<PullResult | null> {
    const state = pullStore.get(peerUrl);
    const since =
      kind === "exchange"
        ? state?.lastCompletedAt ?? null
        : state?.lastVouchCreatedAt ?? null;
    try {
      const result =
        kind === "exchange"
          ? await pullFromPeer({ peerUrl, since, fetcher, store })
          : await pullVouchesFromPeer({
              peerUrl,
              since,
              fetcher,
              store: vouchStore,
            });
      pullStore.recordSuccess({
        peerUrl,
        kind,
        at: Date.now(),
        latestSeenAt: result.latestCompletedAt,
        pulledCount: result.insertedCount,
      });
      onPull?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      pullStore.recordFailure({
        peerUrl,
        at: Date.now(),
        error: `${kind}: ${error.message}`,
      });
      onError(peerUrl, error);
      return null;
    }
  }

  async function pullAllOnce(): Promise<PullResult[]> {
    // Run both kinds for each peer in parallel. One kind failing
    // doesn't prevent the other from succeeding.
    const tasks = peerUrls.flatMap((url) => [
      pullKind(url, "exchange"),
      pullKind(url, "vouch"),
    ]);
    const results = await Promise.all(tasks);
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
