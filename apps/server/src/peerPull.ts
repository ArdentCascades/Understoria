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
import {
  verifyCoOrganizerInvitation,
  verifyCoOrganizerInvitationResponse,
  verifyCoOrganizerInvitationRevocation,
  verifyEvent,
  verifyEventCancellation,
  verifyExchangeLabel,
  verifyPost,
  verifyTaskComment,
  verifyVouch,
} from "@understoria/shared/crypto";
import type { Post } from "@understoria/shared/types";
import {
  parseCoOrganizerInvitation,
  parseCoOrganizerInvitationResponse,
  parseCoOrganizerInvitationRevocation,
  parseEvent,
  parseEventCancellation,
  parseExchange,
  parsePost,
  parseTaskComment,
  parseVouch,
} from "./validate.js";
import type {
  CoOrganizerInvitationResponseStore,
  CoOrganizerInvitationRevocationStore,
  CoOrganizerInvitationStore,
  EventCancellationStore,
  EventStore,
  ExchangeStore,
  PeerPullStore,
  PostStore,
  PullRecordKind,
  TaskCommentStore,
  VouchStore,
} from "./db.js";

/**
 * Federation pull loop — Agent 3 task 2.
 *
 * Each configured peer URL is polled on an interval. For every poll we
 * GET /exchanges?since=<ts>&sinceId=<id> (the exclusive composite
 * pair cursor from docs/composite-federation-cursors.md; a NULL
 * stored id falls back to the legacy inclusive since-only pull),
 * verify every row's
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
  /** Timestamp half of the max (cursorField, id) pair across the
   *  CONSUMED rows (inserted or verified duplicates); null if none.
   *  Cursor field is `completedAt` for exchanges, `createdAt` for
   *  vouches — see the per-kind pull functions. */
  latestCompletedAt: number | null;
  /** Id half of the pair — composite cursors phase 2. Together with
   *  `latestCompletedAt` this pins the exact position of the last
   *  consumed row, so the next pull's exclusive pair cursor can move
   *  through a timestamp tie of any size. */
  latestId: string | null;
}

/** The (timestamp, id) position of the last consumed row. */
type CursorPair = { ts: number; id: string };

/** Fold one consumed row into the running max pair — feed order is
 *  `ts ASC, id ASC`, so the pair comparison mirrors the server's. */
function advancePair(
  latest: CursorPair | null,
  ts: number,
  id: string,
): CursorPair {
  if (latest === null || ts > latest.ts || (ts === latest.ts && id > latest.id)) {
    return { ts, id };
  }
  return latest;
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
  /** Id half of the exclusive pair cursor; null/absent = legacy
   *  inclusive `since`-only pull (composite cursors phase 2). */
  sinceId?: string | null;
  fetcher: Fetcher;
  store: ExchangeStore;
  /** Cap the response size so a misbehaving peer can't OOM us. The
   *  GET endpoint also caps; this is defence in depth. */
  maxRows?: number;
  /**
   * System-pubkey resolver for `autoConfirmed` rows — the §4 strict
   * gate (`docs/auto-confirm-key.md`). Peer ingestion is exactly the
   * caller `verifyExchangeLabel`'s contract names as needing full
   * trust: a row whose helped-side signature we cannot verify against
   * a known system pubkey MUST NOT be accepted as authentic. The
   * worker builds this from each peer's published `GET /config`
   * (systemKey.current + nodeId); the default resolver knows no keys,
   * so auto-confirmed rows are REJECTED unless a resolver is supplied.
   * Member-signed rows never consult it.
   */
  resolveSystemPubkey?: (nodeId: string, signedAt: number) => string | null;
}): Promise<PullResult> {
  const { peerUrl, since, fetcher, store } = opts;
  const sinceId = opts.sinceId ?? null;
  const maxRows = opts.maxRows ?? 500;
  const resolveSystemPubkey = opts.resolveSystemPubkey ?? (() => null);

  const url = buildUrl(peerUrl, "exchanges", since, sinceId, maxRows);
  const rows = await fetchAndExtract(fetcher, url, peerUrl, "exchanges");

  let insertedCount = 0;
  let duplicateCount = 0;
  let rejectedCount = 0;
  let latest: CursorPair | null = null;

  for (const raw of rows) {
    const parsed = parseExchange(raw);
    if (!parsed.ok) {
      rejectedCount += 1;
      continue;
    }
    const exchange = parsed.value;
    // Strict §4 verification: "member-signed" (both member sigs
    // verify) or "system-signed" (helped side verifies against the
    // resolved system pubkey) are accepted; "invalid" — including an
    // auto-confirmed row whose origin node's key we cannot resolve —
    // is rejected. This replaces the lenient `verifyExchange`, which
    // accepted auto-confirmed rows on the helper signature alone and
    // let anyone who controls a single member key fabricate
    // "auto-confirmed" hours into a peer's ledger.
    if (verifyExchangeLabel(exchange, resolveSystemPubkey) === "invalid") {
      rejectedCount += 1;
      continue;
    }
    if (store.has(exchange.id)) {
      duplicateCount += 1;
      // Even a duplicate's position advances our high-water mark —
      // we know we've successfully processed that point in the feed.
      latest = advancePair(latest, exchange.completedAt, exchange.id);
      continue;
    }
    store.insert(exchange);
    insertedCount += 1;
    latest = advancePair(latest, exchange.completedAt, exchange.id);
  }

  return {
    peerUrl,
    kind: "exchange",
    insertedCount,
    duplicateCount,
    rejectedCount,
    latestCompletedAt: latest?.ts ?? null,
    latestId: latest?.id ?? null,
  };
}

/** Vouch-flavoured sibling of `pullFromPeer`. Same shape, different
 *  verifier + parser + cursor field. Kept as a separate function
 *  rather than a generic so each path can stay readable and the
 *  Exchange-vs-Vouch types don't bleed across. */
export async function pullVouchesFromPeer(opts: {
  peerUrl: string;
  since: number | null;
  /** Id half of the exclusive pair cursor; null/absent = legacy
   *  inclusive `since`-only pull (composite cursors phase 2). */
  sinceId?: string | null;
  fetcher: Fetcher;
  store: VouchStore;
  maxRows?: number;
}): Promise<PullResult> {
  const { peerUrl, since, fetcher, store } = opts;
  const sinceId = opts.sinceId ?? null;
  const maxRows = opts.maxRows ?? 500;

  const url = buildUrl(peerUrl, "vouches", since, sinceId, maxRows);
  const rows = await fetchAndExtract(fetcher, url, peerUrl, "vouches");

  let insertedCount = 0;
  let duplicateCount = 0;
  let rejectedCount = 0;
  let latest: CursorPair | null = null;

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
      latest = advancePair(latest, vouch.createdAt, vouch.id);
      continue;
    }
    store.insert(vouch);
    insertedCount += 1;
    latest = advancePair(latest, vouch.createdAt, vouch.id);
  }

  return {
    peerUrl,
    kind: "vouch",
    insertedCount,
    duplicateCount,
    rejectedCount,
    latestCompletedAt: latest?.ts ?? null,
    latestId: latest?.id ?? null,
  };
}

/** Post-flavoured sibling. Same shape as pullFromPeer /
 *  pullVouchesFromPeer; verifies signatures via verifyPost and
 *  rejects anything that fails. Cursor field is `createdAt`. */
export async function pullPostsFromPeer(opts: {
  peerUrl: string;
  since: number | null;
  /** Id half of the exclusive pair cursor; null/absent = legacy
   *  inclusive `since`-only pull (composite cursors phase 2). */
  sinceId?: string | null;
  fetcher: Fetcher;
  store: PostStore;
  maxRows?: number;
}): Promise<PullResult> {
  const { peerUrl, since, fetcher, store } = opts;
  const sinceId = opts.sinceId ?? null;
  const maxRows = opts.maxRows ?? 500;

  const url = buildUrl(peerUrl, "posts", since, sinceId, maxRows);
  const rows = await fetchAndExtract(fetcher, url, peerUrl, "posts");

  let insertedCount = 0;
  let duplicateCount = 0;
  let rejectedCount = 0;
  let latest: CursorPair | null = null;

  for (const raw of rows) {
    const parsed = parsePost(raw);
    if (!parsed.ok) {
      rejectedCount += 1;
      continue;
    }
    const record = parsed.value;
    // verifyPost takes a full Post; synthesize lifecycle placeholders.
    const forVerify: Post = {
      ...record,
      claimedBy: null,
      status: "open",
      confirmedBy: [],
    };
    if (!verifyPost(forVerify)) {
      rejectedCount += 1;
      continue;
    }
    if (store.has(record.id)) {
      duplicateCount += 1;
      latest = advancePair(latest, record.createdAt, record.id);
      continue;
    }
    store.insert(record);
    insertedCount += 1;
    latest = advancePair(latest, record.createdAt, record.id);
  }

  return {
    peerUrl,
    kind: "post",
    insertedCount,
    duplicateCount,
    rejectedCount,
    latestCompletedAt: latest?.ts ?? null,
    latestId: latest?.id ?? null,
  };
}

// NOTE: `pullInvitesFromPeer` was REMOVED in the invite-redemption
// Phase 1 PR. It replicated an always-empty store (no web-side caller
// of `POST /invites` ever existed) and its `GET /invites` source was
// a live-credential feed — see `docs/invite-redemption.md` §8 / §10.1.
// There is deliberately no `pullRedemptionsFromPeer` replacing it:
// redemption receipts do NOT peer-replicate in Phase 1 — cross-node
// membership is out of scope and the roster stays off the inter-node
// wire (§8). Receipts move only device→node (`POST /redemptions`) and
// node→device (`GET /redemptions`, `pullFederatedRedemptions` in the
// PWA).

/**
 * Pull signed task comments from a peer's GET /task-comments endpoint.
 * Mirrors pullPostsFromPeer with one extra branch: incoming rows that
 * carry a `deletedAt` and match an existing local row are routed
 * through `upsertTombstone` rather than `insert`, so soft-delete
 * federation converges. The duplicate count includes both untouched
 * duplicates and rows we already had as tombstones.
 */
export async function pullTaskCommentsFromPeer(opts: {
  peerUrl: string;
  since: number | null;
  /** Id half of the exclusive pair cursor; null/absent = legacy
   *  inclusive `since`-only pull (composite cursors phase 2). */
  sinceId?: string | null;
  fetcher: Fetcher;
  store: TaskCommentStore;
  maxRows?: number;
}): Promise<PullResult> {
  const { peerUrl, since, fetcher, store } = opts;
  const sinceId = opts.sinceId ?? null;
  const maxRows = opts.maxRows ?? 500;

  const url = buildUrl(peerUrl, "task-comments", since, sinceId, maxRows);
  const rows = await fetchAndExtract(fetcher, url, peerUrl, "taskComments");

  let insertedCount = 0;
  let duplicateCount = 0;
  let rejectedCount = 0;
  let latest: CursorPair | null = null;

  for (const raw of rows) {
    const parsed = parseTaskComment(raw);
    if (!parsed.ok) {
      rejectedCount += 1;
      continue;
    }
    const comment = parsed.value;
    if (!verifyTaskComment(comment)) {
      rejectedCount += 1;
      continue;
    }
    // A comment's effective cursor position is max(createdAt,
    // deletedAt) — the peer's GET /task-comments windows and orders
    // rows by that value so late tombstones re-enter the window.
    // Advancing by createdAt alone would jump the cursor past a
    // tombstone served later in the same page.
    const effectiveCursorAt = Math.max(
      comment.createdAt,
      comment.deletedAt ?? 0,
    );
    // (Inlined at each consume site rather than a closure so the
    // narrowed type of `latest` survives to the return below.)
    if (store.has(comment.id)) {
      // Already have the row. If the incoming carries a tombstone we
      // didn't have, apply it; otherwise count as duplicate.
      if (comment.deletedAt !== null) {
        const local = store.deletedAt(comment.id);
        if (local === null || local === undefined) {
          store.upsertTombstone(comment.id, comment.deletedAt);
          insertedCount += 1;
          latest = advancePair(latest, effectiveCursorAt, comment.id);
          continue;
        }
      }
      duplicateCount += 1;
      latest = advancePair(latest, effectiveCursorAt, comment.id);
      continue;
    }
    store.insert(comment);
    insertedCount += 1;
    latest = advancePair(latest, effectiveCursorAt, comment.id);
  }

  return {
    peerUrl,
    kind: "task_comment",
    insertedCount,
    duplicateCount,
    rejectedCount,
    latestCompletedAt: latest?.ts ?? null,
    latestId: latest?.id ?? null,
  };
}

/** Co-organizer invitation sibling. Cursor field is `createdAt`. */
export async function pullCoOrganizerInvitationsFromPeer(opts: {
  peerUrl: string;
  since: number | null;
  /** Id half of the exclusive pair cursor; null/absent = legacy
   *  inclusive `since`-only pull (composite cursors phase 2). */
  sinceId?: string | null;
  fetcher: Fetcher;
  store: CoOrganizerInvitationStore;
  maxRows?: number;
}): Promise<PullResult> {
  const { peerUrl, since, fetcher, store } = opts;
  const sinceId = opts.sinceId ?? null;
  const maxRows = opts.maxRows ?? 500;

  const url = buildUrl(peerUrl, "coorg-invitations", since, sinceId, maxRows);
  const rows = await fetchAndExtract(
    fetcher,
    url,
    peerUrl,
    "coorgInvitations",
  );

  let insertedCount = 0;
  let duplicateCount = 0;
  let rejectedCount = 0;
  let latest: CursorPair | null = null;

  for (const raw of rows) {
    const parsed = parseCoOrganizerInvitation(raw);
    if (!parsed.ok) {
      rejectedCount += 1;
      continue;
    }
    const record = parsed.value;
    if (!verifyCoOrganizerInvitation(record)) {
      rejectedCount += 1;
      continue;
    }
    if (store.has(record.id)) {
      duplicateCount += 1;
      latest = advancePair(latest, record.createdAt, record.id);
      continue;
    }
    store.insert(record);
    insertedCount += 1;
    latest = advancePair(latest, record.createdAt, record.id);
  }

  return {
    peerUrl,
    kind: "coorg_invitation",
    insertedCount,
    duplicateCount,
    rejectedCount,
    latestCompletedAt: latest?.ts ?? null,
    latestId: latest?.id ?? null,
  };
}

/** Co-organizer invitation response sibling. Cursor: `decidedAt`. */
export async function pullCoOrganizerInvitationResponsesFromPeer(opts: {
  peerUrl: string;
  since: number | null;
  /** Id half of the exclusive pair cursor; null/absent = legacy
   *  inclusive `since`-only pull (composite cursors phase 2). */
  sinceId?: string | null;
  fetcher: Fetcher;
  store: CoOrganizerInvitationResponseStore;
  maxRows?: number;
}): Promise<PullResult> {
  const { peerUrl, since, fetcher, store } = opts;
  const sinceId = opts.sinceId ?? null;
  const maxRows = opts.maxRows ?? 500;

  const url = buildUrl(peerUrl, "coorg-invitation-responses", since, sinceId, maxRows);
  const rows = await fetchAndExtract(
    fetcher,
    url,
    peerUrl,
    "coorgInvitationResponses",
  );

  let insertedCount = 0;
  let duplicateCount = 0;
  let rejectedCount = 0;
  let latest: CursorPair | null = null;

  for (const raw of rows) {
    const parsed = parseCoOrganizerInvitationResponse(raw);
    if (!parsed.ok) {
      rejectedCount += 1;
      continue;
    }
    const record = parsed.value;
    if (!verifyCoOrganizerInvitationResponse(record)) {
      rejectedCount += 1;
      continue;
    }
    if (store.has(record.id)) {
      duplicateCount += 1;
      latest = advancePair(latest, record.decidedAt, record.id);
      continue;
    }
    store.insert(record);
    insertedCount += 1;
    latest = advancePair(latest, record.decidedAt, record.id);
  }

  return {
    peerUrl,
    kind: "coorg_invitation_response",
    insertedCount,
    duplicateCount,
    rejectedCount,
    latestCompletedAt: latest?.ts ?? null,
    latestId: latest?.id ?? null,
  };
}

/** Co-organizer invitation revocation sibling. Cursor: `revokedAt`. */
export async function pullCoOrganizerInvitationRevocationsFromPeer(opts: {
  peerUrl: string;
  since: number | null;
  /** Id half of the exclusive pair cursor; null/absent = legacy
   *  inclusive `since`-only pull (composite cursors phase 2). */
  sinceId?: string | null;
  fetcher: Fetcher;
  store: CoOrganizerInvitationRevocationStore;
  maxRows?: number;
}): Promise<PullResult> {
  const { peerUrl, since, fetcher, store } = opts;
  const sinceId = opts.sinceId ?? null;
  const maxRows = opts.maxRows ?? 500;

  const url = buildUrl(
    peerUrl,
    "coorg-invitation-revocations",
    since,
    sinceId,
    maxRows,
  );
  const rows = await fetchAndExtract(
    fetcher,
    url,
    peerUrl,
    "coorgInvitationRevocations",
  );

  let insertedCount = 0;
  let duplicateCount = 0;
  let rejectedCount = 0;
  let latest: CursorPair | null = null;

  for (const raw of rows) {
    const parsed = parseCoOrganizerInvitationRevocation(raw);
    if (!parsed.ok) {
      rejectedCount += 1;
      continue;
    }
    const record = parsed.value;
    if (!verifyCoOrganizerInvitationRevocation(record)) {
      rejectedCount += 1;
      continue;
    }
    if (store.has(record.id)) {
      duplicateCount += 1;
      latest = advancePair(latest, record.revokedAt, record.id);
      continue;
    }
    store.insert(record);
    insertedCount += 1;
    latest = advancePair(latest, record.revokedAt, record.id);
  }

  return {
    peerUrl,
    kind: "coorg_invitation_revocation",
    insertedCount,
    duplicateCount,
    rejectedCount,
    latestCompletedAt: latest?.ts ?? null,
    latestId: latest?.id ?? null,
  };
}

/** Community-event sibling. Cursor: `createdAt`. Mirrors the co-org
 *  invitation pull pattern. */
export async function pullEventsFromPeer(opts: {
  peerUrl: string;
  since: number | null;
  /** Id half of the exclusive pair cursor; null/absent = legacy
   *  inclusive `since`-only pull (composite cursors phase 2). */
  sinceId?: string | null;
  fetcher: Fetcher;
  store: EventStore;
  maxRows?: number;
}): Promise<PullResult> {
  const { peerUrl, since, fetcher, store } = opts;
  const sinceId = opts.sinceId ?? null;
  const maxRows = opts.maxRows ?? 500;

  const url = buildUrl(peerUrl, "events", since, sinceId, maxRows);
  const rows = await fetchAndExtract(fetcher, url, peerUrl, "events");

  let insertedCount = 0;
  let duplicateCount = 0;
  let rejectedCount = 0;
  let latest: CursorPair | null = null;

  for (const raw of rows) {
    const parsed = parseEvent(raw);
    if (!parsed.ok) {
      rejectedCount += 1;
      continue;
    }
    const record = parsed.value;
    if (!verifyEvent(record)) {
      rejectedCount += 1;
      continue;
    }
    if (store.has(record.id)) {
      duplicateCount += 1;
      latest = advancePair(latest, record.createdAt, record.id);
      continue;
    }
    store.insert(record);
    insertedCount += 1;
    latest = advancePair(latest, record.createdAt, record.id);
  }

  return {
    peerUrl,
    kind: "event",
    insertedCount,
    duplicateCount,
    rejectedCount,
    latestCompletedAt: latest?.ts ?? null,
    latestId: latest?.id ?? null,
  };
}

/** Event-cancellation sibling. Cursor: `cancelledAt`. The cross-record
 *  consistency check (cancellation.createdBy === event.createdBy) is
 *  enforced at the POST route; the pull worker only verifies the
 *  signature and dedupes by id. If a cancellation arrives ahead of
 *  the event it cancels, the row inserts; the application layer
 *  reconciles. See `docs/community-events.md` §7. */
export async function pullEventCancellationsFromPeer(opts: {
  peerUrl: string;
  since: number | null;
  /** Id half of the exclusive pair cursor; null/absent = legacy
   *  inclusive `since`-only pull (composite cursors phase 2). */
  sinceId?: string | null;
  fetcher: Fetcher;
  store: EventCancellationStore;
  /** Consulted for the organizer-authority check — a cancellation may
   *  only come from the event's `createdBy` (Round-4 review). */
  eventStore: EventStore;
  maxRows?: number;
}): Promise<PullResult> {
  const { peerUrl, since, fetcher, store, eventStore } = opts;
  const sinceId = opts.sinceId ?? null;
  const maxRows = opts.maxRows ?? 500;

  const url = buildUrl(peerUrl, "event-cancellations", since, sinceId, maxRows);
  const rows = await fetchAndExtract(
    fetcher,
    url,
    peerUrl,
    "eventCancellations",
  );

  let insertedCount = 0;
  let duplicateCount = 0;
  let rejectedCount = 0;
  let latest: CursorPair | null = null;

  for (const raw of rows) {
    const parsed = parseEventCancellation(raw);
    if (!parsed.ok) {
      rejectedCount += 1;
      continue;
    }
    const record = parsed.value;
    if (!verifyEventCancellation(record)) {
      rejectedCount += 1;
      continue;
    }
    // Organizer-authority check (Round-4 review), same posture as the
    // POST /event-cancellations route: when we hold the event, only its
    // organizer may cancel it — reject a non-organizer's forged
    // cancellation rather than laundering it onward. When the event
    // isn't local yet we accept-and-reconcile (the render layer stays
    // authority-bound), matching the route's documented behavior.
    const localEvent = eventStore.get(record.eventId);
    if (localEvent !== null && localEvent.createdBy !== record.createdBy) {
      rejectedCount += 1;
      continue;
    }
    if (store.has(record.id)) {
      duplicateCount += 1;
      latest = advancePair(latest, record.cancelledAt, record.id);
      continue;
    }
    // First-write-wins by eventId. A second cancellation arriving for
    // an event already cancelled is logged as a duplicate (not
    // rejected — that would jam the cursor); the existing row stays.
    const existingForEvent = store.getByEventId(record.eventId);
    if (existingForEvent !== null) {
      duplicateCount += 1;
      latest = advancePair(latest, record.cancelledAt, record.id);
      continue;
    }
    store.insert(record);
    insertedCount += 1;
    latest = advancePair(latest, record.cancelledAt, record.id);
  }

  return {
    peerUrl,
    kind: "event_cancellation",
    insertedCount,
    duplicateCount,
    rejectedCount,
    latestCompletedAt: latest?.ts ?? null,
    latestId: latest?.id ?? null,
  };
}

function buildUrl(
  peerUrl: string,
  path:
    | "exchanges"
    | "vouches"
    | "posts"
    | "task-comments"
    | "coorg-invitations"
    | "coorg-invitation-responses"
    | "coorg-invitation-revocations"
    | "events"
    | "event-cancellations",
  since: number | null,
  sinceId: string | null,
  limit: number,
): string {
  const base = peerUrl.replace(/\/+$/, "");
  const params = new URLSearchParams();
  if (since !== null && Number.isFinite(since)) {
    params.set("since", String(since));
    // The pair component only means anything next to its timestamp —
    // the server ignores sinceId without since, and a stored id
    // without a stored ts never happens (recordSuccess pairs them).
    if (sinceId !== null && sinceId.length > 0) {
      params.set("sinceId", sinceId);
    }
  }
  params.set("limit", String(limit));
  return `${base}/${path}?${params.toString()}`;
}

async function fetchAndExtract(
  fetcher: Fetcher,
  url: string,
  peerUrl: string,
  arrayKey:
    | "exchanges"
    | "vouches"
    | "posts"
    | "taskComments"
    | "coorgInvitations"
    | "coorgInvitationResponses"
    | "coorgInvitationRevocations"
    | "events"
    | "eventCancellations",
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
  postStore: PostStore;
  taskCommentStore: TaskCommentStore;
  coorgInvitationStore: CoOrganizerInvitationStore;
  coorgInvitationResponseStore: CoOrganizerInvitationResponseStore;
  coorgInvitationRevocationStore: CoOrganizerInvitationRevocationStore;
  eventStore: EventStore;
  eventCancellationStore: EventCancellationStore;
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
    postStore,
    taskCommentStore,
    coorgInvitationStore,
    coorgInvitationResponseStore,
    coorgInvitationRevocationStore,
    eventStore,
    eventCancellationStore,
    pullStore,
    fetcher = (url) => fetch(url),
    onError = (peerUrl, err) =>
      // eslint-disable-next-line no-console
      console.warn(`[peer-pull] ${peerUrl}: ${err.message}`),
    onPull,
  } = opts;

  function cursorFor(
    kind: PullRecordKind,
    state: ReturnType<PeerPullStore["get"]>,
  ): { since: number | null; sinceId: string | null } {
    switch (kind) {
      case "exchange":
        return {
          since: state?.lastCompletedAt ?? null,
          sinceId: state?.lastCompletedId ?? null,
        };
      case "vouch":
        return {
          since: state?.lastVouchCreatedAt ?? null,
          sinceId: state?.lastVouchCreatedId ?? null,
        };
      case "post":
        return {
          since: state?.lastPostCreatedAt ?? null,
          sinceId: state?.lastPostCreatedId ?? null,
        };
      case "task_comment":
        return {
          since: state?.lastTaskCommentCreatedAt ?? null,
          sinceId: state?.lastTaskCommentCreatedId ?? null,
        };
      case "coorg_invitation":
        return {
          since: state?.lastCoOrgInvitationCreatedAt ?? null,
          sinceId: state?.lastCoOrgInvitationCreatedId ?? null,
        };
      case "coorg_invitation_response":
        return {
          since: state?.lastCoOrgInvitationResponseDecidedAt ?? null,
          sinceId: state?.lastCoOrgInvitationResponseDecidedId ?? null,
        };
      case "coorg_invitation_revocation":
        return {
          since: state?.lastCoOrgInvitationRevocationRevokedAt ?? null,
          sinceId: state?.lastCoOrgInvitationRevocationRevokedId ?? null,
        };
      case "event":
        return {
          since: state?.lastEventCreatedAt ?? null,
          sinceId: state?.lastEventCreatedId ?? null,
        };
      case "event_cancellation":
        return {
          since: state?.lastEventCancellationCreatedAt ?? null,
          sinceId: state?.lastEventCancellationCreatedId ?? null,
        };
    }
  }

  // --- §4 strict-verification support (docs/auto-confirm-key.md) ---
  //
  // Each peer's published system key, refreshed from GET /config at
  // the start of every pull cycle. Map value semantics:
  //   { nodeId, pubkey } — the peer publishes a system key
  //   null               — the peer answered /config with NO system
  //                        key (a known state, not a failure)
  //   (absent)           — /config has never been reachable; exchange
  //                        pulls for that peer are SKIPPED (thrown as
  //                        a pull failure) rather than run with an
  //                        empty resolver, because a rejected-but-
  //                        cursor-passed auto-confirmed row would be
  //                        skipped permanently. Transient config
  //                        failures after a first success fall back
  //                        to the last-known-good key.
  const systemKeys = new Map<
    string,
    {
      nodeId: string;
      current: string;
      /** Rotation trail, ascending by retiredAt (sorted on ingest).
       *  Each entry was the node's system key UNTIL its retiredAt. */
      history: { pubkey: string; retiredAt: number }[];
    } | null
  >();
  const configErrors = new Map<string, Error>();

  async function refreshPeerSystemKey(peerUrl: string): Promise<void> {
    const base = peerUrl.replace(/\/+$/, "");
    try {
      const response = await fetcher(`${base}/config`);
      if (!response.ok) {
        throw new Error(
          `peer ${peerUrl} config returned status ${response.status}`,
        );
      }
      const body = (await response.json()) as {
        systemKey?: { current?: unknown; history?: unknown };
        nodeId?: unknown;
      } | null;
      if (
        body !== null &&
        typeof body === "object" &&
        body.systemKey !== undefined &&
        typeof body.systemKey === "object" &&
        body.systemKey !== null &&
        typeof body.systemKey.current === "string" &&
        typeof body.nodeId === "string"
      ) {
        // Rotation trail: keep only well-formed entries, ascending by
        // retiredAt so the resolver's "first entry retired AFTER the
        // signing time" scan finds the key that was current then.
        // retiredAt must be a plausible PAST moment (a retirement is
        // an event that happened; one day of clock skew is the same
        // grace config.ts's own-history validation allows). A
        // far-future retiredAt is the forged-history shape: an entry
        // with retiredAt beyond every plausible signing time would
        // capture ALL records in the resolver's rotation scan.
        const oneDayFromNow = Date.now() + 24 * 60 * 60 * 1000;
        const rawHistory = Array.isArray(body.systemKey.history)
          ? body.systemKey.history
          : [];
        const history = rawHistory
          .filter(
            (h): h is { pubkey: string; retiredAt: number } =>
              h !== null &&
              typeof h === "object" &&
              typeof (h as { pubkey?: unknown }).pubkey === "string" &&
              typeof (h as { retiredAt?: unknown }).retiredAt === "number" &&
              Number.isInteger((h as { retiredAt: number }).retiredAt) &&
              (h as { retiredAt: number }).retiredAt > 0 &&
              (h as { retiredAt: number }).retiredAt <= oneDayFromNow,
          )
          .sort((a, b) => a.retiredAt - b.retiredAt);
        systemKeys.set(peerUrl, {
          nodeId: body.nodeId,
          current: body.systemKey.current,
          history,
        });
      } else {
        systemKeys.set(peerUrl, null);
      }
      configErrors.delete(peerUrl);
    } catch (err) {
      configErrors.set(
        peerUrl,
        err instanceof Error ? err : new Error(String(err)),
      );
      // Keep any last-known-good entry — a stale key beats stalling
      // the pull, and rotation is an explicit multi-step operator
      // procedure, not something that flips between cycles.
    }
  }

  // Resolver spans EVERY configured peer's published key, so a row
  // relayed through peer B but auto-confirmed by peer C still
  // verifies as long as C is part of this node's mesh. A nodeId
  // outside the mesh resolves to null and the row is rejected — the
  // §4 posture: what this node cannot verify, it does not relay.
  //
  // FAIL CLOSED on nodeId conflict. Nothing binds a peer URL to the
  // nodeId it self-reports, so a compromised peer B could serve
  // `GET /config` claiming `nodeId: node_c` with B's OWN key and, on
  // first-match iteration, shadow the real node_c — letting B forge
  // exchanges "auto-confirmed by C". A node's key legitimately comes
  // only from the ONE peer that IS that node (the full-mesh
  // requirement in docs/federated-key-discovery.md), so two distinct
  // peers declaring the same nodeId is either an impersonation attempt
  // or a duplicate-URL misconfiguration. Either way we refuse to
  // resolve it — records for that nodeId are rejected until the
  // operator resolves the conflict. That downgrades a would-be forgery
  // to a detectable denial, never an accepted fake.
  //
  // `signedAt` selects across the node's rotation trail (§4): the
  // key current at signing time is the first history entry retired
  // AFTER that moment, else `current`.
  //
  // LIMITATION (not closed here): rotation contains a key compromise
  // only for records the mesh has not already accepted. A leaked
  // RETIRED key can still sign a BACKDATED record (autoConfirmedAt <
  // retiredAt) that this resolver honors, because the attacker
  // controls both the key and the self-declared timestamp — signing
  // the timestamp would not help. Closing it requires receive-time
  // retirement enforcement (reject first-seen retired-key records
  // after a retirement is published), which needs per-record
  // receivedAt tracking the exchange store does not yet keep. See
  // docs/auto-confirm-key.md §4 and docs/system-key-rotation.md §6.
  // Rotation trails are sorted ascending at ingest, so an index-wise
  // compare is an equality check on the whole published trail.
  function sameHistory(
    a: { pubkey: string; retiredAt: number }[],
    b: { pubkey: string; retiredAt: number }[],
  ): boolean {
    if (a.length !== b.length) return false;
    return a.every(
      (h, i) => h.pubkey === b[i].pubkey && h.retiredAt === b[i].retiredAt,
    );
  }

  function resolveSystemPubkey(nodeId: string, signedAt: number): string | null {
    let match: { current: string; history: { pubkey: string; retiredAt: number }[] } | null =
      null;
    for (const entry of systemKeys.values()) {
      if (entry === null || entry.nodeId !== nodeId) continue;
      if (
        match !== null &&
        (entry.current !== match.current ||
          // The HISTORY must agree too, not just `current`. `current`
          // is public — a compromised peer can echo the real node's
          // current key verbatim and smuggle its own key inside a
          // forged history entry, which the rotation scan below would
          // then select for any record whose signedAt precedes the
          // forged retiredAt. Any divergence in the claimed trail is
          // the same ambiguity as a divergent current key: refuse.
          !sameHistory(entry.history, match.history))
      ) {
        // Two peers claim this nodeId with different key material —
        // ambiguous. Fail closed.
        return null;
      }
      if (match === null) match = { current: entry.current, history: entry.history };
    }
    if (match === null) return null;
    for (const h of match.history) {
      if (h.retiredAt > signedAt) return h.pubkey;
    }
    return match.current;
  }

  async function runPull(
    kind: PullRecordKind,
    peerUrl: string,
    since: number | null,
    sinceId: string | null,
  ): Promise<PullResult> {
    switch (kind) {
      case "exchange":
        if (!systemKeys.has(peerUrl)) {
          // Never seen this peer's /config. Running the pull anyway
          // would reject its auto-confirmed rows while OTHER rows in
          // the same page advance the cursor past them — permanent
          // skips caused by a transient outage. Fail the pull instead;
          // the cursor stays put and the next cycle retries.
          throw (
            configErrors.get(peerUrl) ??
            new Error(`peer ${peerUrl} config has not been fetched yet`)
          );
        }
        return pullFromPeer({
          peerUrl,
          since,
          sinceId,
          fetcher,
          store,
          resolveSystemPubkey,
        });
      case "vouch":
        return pullVouchesFromPeer({
          peerUrl,
          since,
          sinceId,
          fetcher,
          store: vouchStore,
        });
      case "post":
        return pullPostsFromPeer({
          peerUrl,
          since,
          sinceId,
          fetcher,
          store: postStore,
        });
      case "task_comment":
        return pullTaskCommentsFromPeer({
          peerUrl,
          since,
          sinceId,
          fetcher,
          store: taskCommentStore,
        });
      case "coorg_invitation":
        return pullCoOrganizerInvitationsFromPeer({
          peerUrl,
          since,
          sinceId,
          fetcher,
          store: coorgInvitationStore,
        });
      case "coorg_invitation_response":
        return pullCoOrganizerInvitationResponsesFromPeer({
          peerUrl,
          since,
          sinceId,
          fetcher,
          store: coorgInvitationResponseStore,
        });
      case "coorg_invitation_revocation":
        return pullCoOrganizerInvitationRevocationsFromPeer({
          peerUrl,
          since,
          sinceId,
          fetcher,
          store: coorgInvitationRevocationStore,
        });
      case "event":
        return pullEventsFromPeer({
          peerUrl,
          since,
          sinceId,
          fetcher,
          store: eventStore,
        });
      case "event_cancellation":
        return pullEventCancellationsFromPeer({
          peerUrl,
          since,
          sinceId,
          fetcher,
          store: eventCancellationStore,
          eventStore,
        });
    }
  }

  async function pullKind(
    peerUrl: string,
    kind: PullRecordKind,
  ): Promise<PullResult | null> {
    const state = pullStore.get(peerUrl);
    const { since, sinceId } = cursorFor(kind, state);
    try {
      const result = await runPull(kind, peerUrl, since, sinceId);
      pullStore.recordSuccess({
        peerUrl,
        kind,
        at: Date.now(),
        latestSeenAt: result.latestCompletedAt,
        latestSeenId: result.latestId,
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
    // Phase 0: refresh every peer's published system key BEFORE any
    // exchange pull runs, so the §4 resolver spans the whole mesh —
    // a row relayed through peer B but auto-confirmed by peer C must
    // find C's key already loaded, or it would be rejected while
    // sibling rows advance the cursor past it. Failures are recorded
    // per peer (last-known-good keys stay usable); a peer whose
    // config has NEVER been reachable fails its exchange pull loudly
    // in runPull.
    await Promise.all(peerUrls.map((url) => refreshPeerSystemKey(url)));

    // Run every kind for each peer in parallel. One kind failing
    // doesn't prevent the others from succeeding.
    const tasks = peerUrls.flatMap((url) => [
      pullKind(url, "exchange"),
      pullKind(url, "vouch"),
      pullKind(url, "post"),
      pullKind(url, "task_comment"),
      pullKind(url, "coorg_invitation"),
      pullKind(url, "coorg_invitation_response"),
      pullKind(url, "coorg_invitation_revocation"),
      pullKind(url, "event"),
      pullKind(url, "event_cancellation"),
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
