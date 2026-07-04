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
import { db, type OutboxRow } from "@/db/database";
import { uuid } from "@/lib/id";
import {
  readSubmitConfig,
  submitClaimToNode,
  submitCoOrganizerInvitationResponseToNode,
  submitCoOrganizerInvitationRevocationToNode,
  submitCoOrganizerInvitationToNode,
  submitEventCancellationToNode,
  submitEventToNode,
  submitExchangeToNode,
  submitInviteRevocationToNode,
  submitPostToNode,
  submitRedemptionReceiptToNode,
  submitTaskCommentToNode,
  submitVouchToNode,
  type SubmitResult,
} from "@/lib/nodeSubmit";
import type {
  ClaimRecord,
  CoOrganizerInvitation,
  CoOrganizerInvitationResponse,
  CoOrganizerInvitationRevocation,
  Event,
  EventCancellation,
  InviteRevocation,
  RedemptionReceipt,
} from "@understoria/shared/types";
import type { Exchange, Post, SignedVouch, TaskComment } from "@/types";

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

/** Retention for delivered rows. Delivered rows only serve as the
 *  "identical payload already shipped" dedup guard; after this window
 *  they are deleted. A re-enqueue of an identical payload after the
 *  window re-sends it, which the node answers idempotently (200) —
 *  harmless, and far better than the table growing without bound for
 *  the life of the device. Pending and poisoned rows are NEVER pruned:
 *  pending is undelivered work, poisoned is surfaced to the UI. */
const DELIVERED_RETENTION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

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
 * Auto-confirmed exchanges are NOT enqueued: they were finalized on
 * the node by POST /auto-confirm (which inserts server-side and
 * returns the signed row), so there is nothing to mirror — and
 * POST /exchanges deliberately rejects `autoConfirmed` rows with 422
 * (they must route through the dedicated endpoint, docs/auto-confirm-key.md
 * §4). Enqueuing one therefore produced a guaranteed 422 → a
 * permanently poisoned outbox row per auto-confirm, surfaced to the
 * member as a delivery error. The node already has the row; the
 * mirror is a no-op by construction.
 *
 * The settings table must be in the calling transaction's scope. The
 * helper reads `communityNodeUrl` directly to avoid pulling the full
 * nodeSubmit module into the transaction scope.
 */
export async function enqueueExchangeOutbox(
  exchange: Exchange,
): Promise<OutboxRow | null> {
  if (exchange.autoConfirmed) return null;
  return enqueueOutbox("exchange", exchange.id, exchange);
}

/**
 * Insert an outbox row for a newly-created vouch. Same shape and
 * semantics as enqueueExchangeOutbox — designed to be called inside
 * the same transaction that wrote the vouch, with `db.outbox` and
 * `db.settings` in the transaction's scope.
 */
export async function enqueueVouchOutbox(
  vouch: SignedVouch,
): Promise<OutboxRow | null> {
  return enqueueOutbox("vouch", vouch.id, vouch);
}

/**
 * Insert an outbox row for a task comment — either a fresh post or a
 * soft-delete update (the caller re-enqueues the same row with
 * `deletedAt` set to federate the tombstone). Returns null if the
 * comment is unsigned, which only happens for legacy rows pre-dating
 * the federation slice.
 */
export async function enqueueTaskCommentOutbox(
  comment: TaskComment,
): Promise<OutboxRow | null> {
  if (!comment.signature) return null;
  return enqueueOutbox("task_comment", comment.id, comment);
}

/**
 * Insert an outbox row for a newly-created post. The mutable
 * lifecycle fields (status, claimedBy, confirmedBy) are stripped
 * before serializing — the wire shape is the immutable signed
 * subset, so a peer node can verify the signature exactly.
 */
export async function enqueuePostOutbox(
  post: Post,
): Promise<OutboxRow | null> {
  // Legacy posts (signature === "") created before Agent 3 posts
  // federation can't be federated — their signatures are missing.
  // Refusing to enqueue here keeps the outbox honest.
  if (!post.signature) return null;
  const wire = {
    id: post.id,
    type: post.type,
    category: post.category,
    title: post.title,
    description: post.description,
    estimatedHours: post.estimatedHours,
    urgency: post.urgency,
    postedBy: post.postedBy,
    createdAt: post.createdAt,
    expiresAt: post.expiresAt,
    locationZone: post.locationZone,
    nodeId: post.nodeId,
    signature: post.signature,
  };
  return enqueueOutbox("post", post.id, wire);
}

/**
 * Insert an outbox row for a cross-node claim notification. Pushed
 * when a member claims a post that originated from another node,
 * so the poster's community server learns about the claim and can
 * propagate it to the poster's PWA.
 */
export async function enqueueClaimOutbox(claim: {
  postId: string;
  claimerKey: string;
  claimedAt: number;
  nodeId: string;
}): Promise<OutboxRow | null> {
  return enqueueOutbox("claim", `claim_${claim.postId}`, claim);
}

/**
 * Insert an outbox row for a newly-signed community event. The full
 * `Event` shape (including signature) is serialized as the wire
 * payload — verifiers on peer nodes re-run `verifyEvent` against the
 * canonical bytes. See `docs/community-events.md` §7.
 */
export async function enqueueEvent(
  event: Event,
): Promise<OutboxRow | null> {
  return enqueueOutbox("event", event.id, event);
}

/**
 * Insert an outbox row for a signed event cancellation. Same shape
 * and dedup semantics as `enqueueEvent`. The server route (PR D)
 * enforces the cross-record check that the cancellation's `createdBy`
 * equals the cancelled event's `createdBy`.
 */
export async function enqueueEventCancellation(
  cancellation: EventCancellation,
): Promise<OutboxRow | null> {
  return enqueueOutbox("event_cancellation", cancellation.id, cancellation);
}

// NOTE: EventRsvpRow has no outbox enqueue helper — RSVPs are
// local-only by design (docs/community-events.md §4).

/**
 * Insert an outbox row for a signed redemption receipt — Phase 1 of
 * `docs/invite-redemption.md` (§7). Called inside the redeemInvite
 * transaction so the invite row and its receipt land atomically.
 *
 * DELIBERATE DEVIATION from every other enqueue helper: the receipt
 * is enqueued EVEN WHEN no community-node URL is configured. A fresh
 * device typically redeems first and configures the node afterwards
 * (the §5.3 origin suggestion fires on the invite-accept success
 * path — after redemption). Dropping the receipt at enqueue time
 * would re-create incident finding #4 permanently: the receipt is
 * the member's only proof-of-joining. The row simply waits in the
 * outbox — flushOutboxOnce still refuses to POST anywhere until the
 * member has explicitly confirmed a node URL, so nothing crosses any
 * wire before consent.
 */
export async function enqueueRedemptionReceiptOutbox(
  receipt: RedemptionReceipt,
): Promise<OutboxRow | null> {
  return enqueueOutbox("redemption_receipt", receipt.invite.token, receipt, {
    requireNodeUrl: false,
  });
}

/**
 * Insert an outbox row for a signed invite revocation
 * (docs/invite-revocation.md §4). Dedup key is the token — one
 * revocation per token. Enqueued even without a configured node URL,
 * same as the receipt: the inviter may not have a node configured at
 * revoke time, and the revocation must eventually reach the mesh.
 */
export async function enqueueInviteRevocationOutbox(
  revocation: InviteRevocation,
): Promise<OutboxRow | null> {
  return enqueueOutbox("invite_revocation", revocation.token, revocation, {
    requireNodeUrl: false,
  });
}

async function enqueueOutbox(
  kind: OutboxRow["kind"],
  recordId: string,
  payload: unknown,
  opts: { requireNodeUrl?: boolean } = {},
): Promise<OutboxRow | null> {
  if (opts.requireNodeUrl !== false) {
    const urlRow = await db.settings.get("communityNodeUrl");
    if (!urlRow?.value?.trim()) return null;
  }

  const serialized = JSON.stringify(payload);
  const existing = await db.outbox
    .where("recordId")
    .equals(recordId)
    .toArray();

  // Dedup on (recordId, payload bytes) — NOT on recordId alone. The
  // same record can legitimately need a second delivery with new
  // mutable state: a task-comment tombstone re-enqueues the original
  // comment id with `deletedAt` set. Keying dedup on recordId alone
  // silently dropped that tombstone whenever the original insert's
  // row was still in the table (delivered rows are never pruned), so
  // peers kept rendering a comment the author deleted.
  const identical = existing.find((row) => row.payload === serialized);
  if (identical) {
    // True duplicate — leave it alone. Re-enqueuing would clobber
    // retry state (pending), re-send a payload the node already has
    // (delivered), or re-poison (poisoned).
    return identical;
  }

  const now = Date.now();

  // Same record, new payload, and the old payload hasn't shipped yet:
  // replace it in place. The newest state is the one that must ship,
  // and the server's merge rules (e.g. tombstone-wins) don't need the
  // intermediate version. Retry count carries over; the next attempt
  // is pulled forward so the update isn't stuck behind a long backoff.
  const pending = existing.find((row) => row.status === "pending");
  if (pending) {
    const changes = {
      kind,
      payload: serialized,
      nextAttemptAt: now,
    } as const;
    await db.outbox.update(pending.id, changes);
    return { ...pending, ...changes };
  }

  const row: OutboxRow = {
    id: uuid(),
    kind,
    payload: serialized,
    recordId,
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
    let payload:
      | Exchange
      | SignedVouch
      | Post
      | TaskComment
      | CoOrganizerInvitation
      | CoOrganizerInvitationResponse
      | CoOrganizerInvitationRevocation
      | Event
      | EventCancellation
      | RedemptionReceipt
      | InviteRevocation;
    try {
      payload = JSON.parse(row.payload) as
        | Exchange
        | SignedVouch
        | Post
        | TaskComment
        | CoOrganizerInvitation
        | CoOrganizerInvitationResponse
        | CoOrganizerInvitationRevocation
        | Event
        | EventCancellation
        | RedemptionReceipt
        | InviteRevocation;
    } catch (err) {
      await db.outbox.update(row.id, {
        status: "poisoned",
        lastError: `unparseable_payload: ${(err as Error).message}`,
        lastAttemptAt: now,
      });
      poisoned += 1;
      continue;
    }

    let result: SubmitResult;
    if (row.kind === "exchange") {
      result = await submitExchangeToNode(payload as Exchange, cfg, {
        fetchImpl: options.fetchImpl,
      });
    } else if (row.kind === "vouch") {
      result = await submitVouchToNode(payload as SignedVouch, cfg, {
        fetchImpl: options.fetchImpl,
      });
    } else if (row.kind === "claim") {
      result = await submitClaimToNode(payload as unknown as ClaimRecord, cfg, {
        fetchImpl: options.fetchImpl,
      });
    } else if (row.kind === "task_comment") {
      result = await submitTaskCommentToNode(payload as TaskComment, cfg, {
        fetchImpl: options.fetchImpl,
      });
    } else if (row.kind === "coorg_invitation") {
      result = await submitCoOrganizerInvitationToNode(
        payload as CoOrganizerInvitation,
        cfg,
        { fetchImpl: options.fetchImpl },
      );
    } else if (row.kind === "coorg_invitation_response") {
      result = await submitCoOrganizerInvitationResponseToNode(
        payload as CoOrganizerInvitationResponse,
        cfg,
        { fetchImpl: options.fetchImpl },
      );
    } else if (row.kind === "coorg_invitation_revocation") {
      result = await submitCoOrganizerInvitationRevocationToNode(
        payload as CoOrganizerInvitationRevocation,
        cfg,
        { fetchImpl: options.fetchImpl },
      );
    } else if (row.kind === "event") {
      result = await submitEventToNode(payload as Event, cfg, {
        fetchImpl: options.fetchImpl,
      });
    } else if (row.kind === "event_cancellation") {
      result = await submitEventCancellationToNode(
        payload as EventCancellation,
        cfg,
        { fetchImpl: options.fetchImpl },
      );
    } else if (row.kind === "redemption_receipt") {
      result = await submitRedemptionReceiptToNode(
        payload as RedemptionReceipt,
        cfg,
        { fetchImpl: options.fetchImpl },
      );
    } else if (row.kind === "invite_revocation") {
      result = await submitInviteRevocationToNode(
        payload as InviteRevocation,
        cfg,
        { fetchImpl: options.fetchImpl },
      );
    } else {
      result = await submitPostToNode(payload as Post, cfg, {
        fetchImpl: options.fetchImpl,
      });
    }

    // Apply the outcome ONLY if the row still carries the payload we
    // just sent. `row` is a pre-fetch snapshot; while the POST was in
    // flight, enqueueOutbox may have replaced this pending row's
    // payload in place (e.g. a task-comment tombstone superseding the
    // original insert). Blindly marking such a row "delivered" would
    // record an UNSENT payload as sent — the identical-payload dedup
    // then blocks any re-enqueue and the tombstone is lost, the exact
    // failure the in-place replacement was meant to fix. The
    // transactional compare-then-write leaves a superseded row
    // pending (enqueueOutbox already pulled its nextAttemptAt to now),
    // so the new payload ships on the next flush.
    const applied = await db.transaction("rw", db.outbox, async () => {
      const current = await db.outbox.get(row.id);
      if (!current || current.payload !== row.payload) return false;
      if (result.ok) {
        await db.outbox.update(row.id, {
          status: "delivered",
          lastAttemptAt: now,
          lastError: undefined,
        });
      } else if (isPoisonResult(result)) {
        await db.outbox.update(row.id, {
          status: "poisoned",
          attempts: row.attempts + 1,
          lastAttemptAt: now,
          lastError: result.error ?? `http_${result.status}`,
        });
      } else {
        const nextAttempts = row.attempts + 1;
        await db.outbox.update(row.id, {
          attempts: nextAttempts,
          nextAttemptAt: now + nextBackoffMs(nextAttempts),
          lastAttemptAt: now,
          lastError: result.error ?? `http_${result.status}`,
        });
      }
      return true;
    });

    if (!applied) continue; // superseded mid-flight; new payload pending
    if (result.ok) delivered += 1;
    else if (isPoisonResult(result)) poisoned += 1;
    else retried += 1;
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

  // Earliest-due pending row via the [status+nextAttemptAt] compound
  // index — .where("status").first() returned an arbitrary pending
  // row (primary-key order), so a due row could wait a full idle tick
  // behind a long-backoff sibling.
  const upcoming = await db.outbox
    .where("[status+nextAttemptAt]")
    .between(["pending", -Infinity], ["pending", Infinity], true, true)
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

/**
 * Delete delivered rows whose last activity is older than the
 * retention window. Exported for tests; the worker calls it on every
 * tick (a no-op scan of an index range when there is nothing to
 * prune). Returns the number of rows deleted.
 */
export async function pruneDeliveredOutbox(
  now: number = Date.now(),
): Promise<number> {
  const cutoff = now - DELIVERED_RETENTION_MS;
  return db.outbox
    .where("status")
    .equals("delivered")
    .filter((row) => (row.lastAttemptAt ?? row.createdAt) < cutoff)
    .delete();
}

async function tick(): Promise<void> {
  if (!worker.running) return;
  try {
    await flushOutboxOnce({ fetchImpl: worker.fetchImpl });
    await pruneDeliveredOutbox();
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
