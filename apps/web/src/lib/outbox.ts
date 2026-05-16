import { db, type OutboxRow } from "@/db/database";
import { uuid } from "@/lib/id";
import {
  readSubmitConfig,
  submitExchangeToNode,
  type SubmitResult,
} from "@/lib/nodeSubmit";
import type { Exchange } from "@/types";

/**
 * Durable outbox + retry worker for community-node mirroring.
 *
 * Why: the v1 fire-and-forget mirror dropped exchanges from the
 * community ledger if the node was momentarily down. This worker
 * persists every record to be mirrored before any network call, so
 * eventual delivery is guaranteed (modulo the local device staying
 * online long enough to retry).
 *
 * Lifecycle:
 *   - `enqueueExchangeOutbox(exchange, tx)` — called inside the
 *     confirmExchange write transaction. Only writes a row when a
 *     community-node URL is configured; absent that, the outbox stays
 *     empty regardless of toggle state.
 *   - `startOutboxWorker()` — call once on app boot. Schedules a flush
 *     and reschedules itself based on the earliest pending row.
 *   - `flushOutboxNow()` — manual trigger from the UI; also called
 *     after an enqueue so a connected node receives the row promptly.
 *   - `stopOutboxWorker()` — for tests and the lock screen.
 *
 * Backoff: 4s × 2^attempts, capped at 5 minutes. After ~6 attempts
 * the schedule plateaus at 5 minutes; the row stays pending. This is
 * deliberate — we want to keep trying for a long time rather than
 * abandon the record. A separate UI surface ("Retry now") gives the
 * user manual control.
 *
 * Poison conditions: 4xx that aren't 5xx/timeout are treated as
 * permanent failures (the record itself or the contract is broken,
 * retrying won't help). 422 specifically — bad signature — should
 * never happen in practice because the PWA itself signed the payload;
 * if it does, the record is poisoned and surfaced to the UI.
 */

const ATTEMPT_BASE_MS = 4_000;
const ATTEMPT_CAP_MS = 5 * 60 * 1000; // 5 minutes
const FLUSH_BATCH_SIZE = 16;

/** Schedule on which the worker re-checks for due rows when idle. */
const IDLE_TICK_MS = 30_000;

interface WorkerHandle {
  timer: ReturnType<typeof setTimeout> | null;
  running: boolean;
  /** Optional fetch override. Used by tests; production passes undefined. */
  fetchImpl?: typeof fetch;
}

const worker: WorkerHandle = {
  timer: null,
  running: false,
};

/**
 * Insert an outbox row for a finalized exchange. Designed to be called
 * inside the same write transaction that created the exchange itself,
 * so the two land atomically. No-op if no community-node URL is
 * configured — we don't want the outbox to accumulate rows for members
 * who have never opted into federation.
 *
 * The settings table must be in the calling transaction's scope. The
 * helper reads `communityNodeUrl` directly to avoid pulling the full
 * nodeSubmit module into the transaction scope.
 */
export async function enqueueExchangeOutbox(
  exchange: Exchange,
): Promise<OutboxRow | null> {
  const urlRow = await db.settings.get("communityNodeUrl");
  if (!urlRow?.value?.trim()) return null;

  // Dedup: if an exchange with this id is already in the outbox,
  // leave it alone. Re-enqueuing would clobber retry state.
  const existing = await db.outbox
    .where("recordId")
    .equals(exchange.id)
    .first();
  if (existing) return existing;

  const now = Date.now();
  const row: OutboxRow = {
    id: uuid(),
    kind: "exchange",
    payload: JSON.stringify(exchange),
    recordId: exchange.id,
    createdAt: now,
    attempts: 0,
    nextAttemptAt: now,
    status: "pending",
  };
  await db.outbox.put(row);
  return row;
}

/**
 * Public counts used by the UI ("3 pending / 1 poisoned").
 */
export interface OutboxSummary {
  pending: number;
  poisoned: number;
  delivered: number;
}

export async function readOutboxSummary(): Promise<OutboxSummary> {
  const [pending, poisoned, delivered] = await Promise.all([
    db.outbox.where("status").equals("pending").count(),
    db.outbox.where("status").equals("poisoned").count(),
    db.outbox.where("status").equals("delivered").count(),
  ]);
  return { pending, poisoned, delivered };
}

/**
 * Compute the backoff for the next attempt. Pure function, easy to
 * test. Stays at the cap once attempts ≥ ~7.
 */
export function nextBackoffMs(attempts: number): number {
  const raw = ATTEMPT_BASE_MS * 2 ** attempts;
  return Math.min(raw, ATTEMPT_CAP_MS);
}

/** Classify a submit failure as retryable or permanent. */
export function isPoisonResult(result: SubmitResult): boolean {
  if (result.ok) return false;
  if (result.status === undefined) return false; // network error — retry
  // 4xx other than 408/429 are permanent. 5xx are retryable.
  if (result.status >= 500) return false;
  if (result.status === 408 || result.status === 429) return false;
  return true;
}

interface FlushOptions {
  /** Test-injectable fetch. Production passes undefined → globalThis.fetch. */
  fetchImpl?: typeof fetch;
  /** Override "now" for deterministic tests. */
  now?: number;
}

/**
 * Process all currently-due outbox rows once. Returns the number of
 * rows touched. Safe to call concurrently from the periodic worker and
 * from a user-triggered "Retry now" press — the server is idempotent on
 * the exchange id.
 */
export async function flushOutboxOnce(
  options: FlushOptions = {},
): Promise<{
  attempted: number;
  delivered: number;
  poisoned: number;
  retried: number;
}> {
  const cfg = await readSubmitConfig();
  if (!cfg.enabled || !cfg.url.trim()) {
    return { attempted: 0, delivered: 0, poisoned: 0, retried: 0 };
  }

  const now = options.now ?? Date.now();
  const due = await db.outbox
    .where("[status+nextAttemptAt]")
    .between(["pending", -Infinity], ["pending", now], true, true)
    .limit(FLUSH_BATCH_SIZE)
    .toArray();

  if (due.length === 0) {
    return { attempted: 0, delivered: 0, poisoned: 0, retried: 0 };
  }

  let delivered = 0;
  let poisoned = 0;
  let retried = 0;

  for (const row of due) {
    let exchange: Exchange;
    try {
      exchange = JSON.parse(row.payload) as Exchange;
    } catch (err) {
      await db.outbox.update(row.id, {
        status: "poisoned",
        lastError: `unparseable_payload: ${(err as Error).message}`,
        lastAttemptAt: now,
      });
      poisoned += 1;
      continue;
    }

    const result = await submitExchangeToNode(exchange, cfg, {
      fetchImpl: options.fetchImpl,
    });

    if (result.ok) {
      await db.outbox.update(row.id, {
        status: "delivered",
        lastAttemptAt: now,
        lastError: undefined,
      });
      delivered += 1;
      continue;
    }

    if (isPoisonResult(result)) {
      await db.outbox.update(row.id, {
        status: "poisoned",
        attempts: row.attempts + 1,
        lastAttemptAt: now,
        lastError: result.error ?? `http_${result.status}`,
      });
      poisoned += 1;
      continue;
    }

    const nextAttempts = row.attempts + 1;
    await db.outbox.update(row.id, {
      attempts: nextAttempts,
      nextAttemptAt: now + nextBackoffMs(nextAttempts),
      lastAttemptAt: now,
      lastError: result.error ?? `http_${result.status}`,
    });
    retried += 1;
  }

  return { attempted: due.length, delivered, poisoned, retried };
}

/**
 * UI-triggered immediate flush. Returns the summary of what happened.
 * Side-effect: reschedules the periodic worker to fire again on the
 * earliest still-pending row.
 */
export async function flushOutboxNow(): Promise<ReturnType<typeof flushOutboxOnce>> {
  const result = await flushOutboxOnce({ fetchImpl: worker.fetchImpl });
  scheduleNextTick();
  return result;
}

async function scheduleNextTick(): Promise<void> {
  if (worker.timer) {
    clearTimeout(worker.timer);
    worker.timer = null;
  }
  if (!worker.running) return;

  const upcoming = await db.outbox
    .where("status")
    .equals("pending")
    .first();

  if (!upcoming) {
    // No pending rows. Sleep on the idle tick — a re-enqueue from
    // confirmExchange will re-arm us sooner via flushOutboxNow.
    worker.timer = setTimeout(() => void tick(), IDLE_TICK_MS);
    return;
  }

  const delay = Math.max(
    1_000,
    Math.min(IDLE_TICK_MS, upcoming.nextAttemptAt - Date.now()),
  );
  worker.timer = setTimeout(() => void tick(), delay);
}

async function tick(): Promise<void> {
  if (!worker.running) return;
  try {
    await flushOutboxOnce({ fetchImpl: worker.fetchImpl });
  } catch (err) {
    if (typeof console !== "undefined" && console.warn) {
      console.warn("[understoria] outbox flush crashed", err);
    }
  } finally {
    void scheduleNextTick();
  }
}

export function startOutboxWorker(options: { fetchImpl?: typeof fetch } = {}): void {
  if (worker.running) return;
  worker.running = true;
  worker.fetchImpl = options.fetchImpl;
  void scheduleNextTick();
}

export function stopOutboxWorker(): void {
  worker.running = false;
  if (worker.timer) {
    clearTimeout(worker.timer);
    worker.timer = null;
  }
  worker.fetchImpl = undefined;
}

/** Test-only: forcibly clear worker state between tests. */
export function __resetOutboxWorkerForTests(): void {
  stopOutboxWorker();
}
