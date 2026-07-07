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

/**
 * Mirror replication worker — docs/community-resilience.md §B.1.
 *
 * A MIRROR is another node of THIS SAME COMMUNITY (`MIRROR_NODE_URLS`),
 * a different relationship than a `PEER_NODE_URLS` peer (a neighboring
 * community). Peers exchange a deliberately narrow subset; mirrors
 * replicate EVERY durable kind — including the five signed-LWW
 * participation/project state kinds and the redemption receipts the
 * membership closure derives from — so that losing any one node loses
 * nothing and members' apps can fail over without a gap.
 *
 * HOW RECORDS ARE APPLIED — the core design decision: each pulled row
 * is re-POSTed against the LOCAL Fastify instance via `app.inject()`.
 * Every mirrored record therefore passes EXACTLY the same
 * parse/signature/authority/LWW/idempotency code as a record submitted
 * by a member's device — zero duplicated validation logic, and route
 * hardening automatically covers the mirror path. The injected request
 * carries a per-boot internal token (`BuiltServer.internalBypassToken`)
 * that exempts it from rate limiting (a catch-up batch must not starve
 * the loopback bucket) and lets `/redemptions` skip its
 * delivery-grace-window check (a receipt the community accepted years
 * ago must still replicate to a brand-new mirror; the grace window
 * bounds NEW plays, not replication). Nothing else is relaxed.
 *
 * The one exception to inject-reuse: `/exchanges` categorically 422s
 * auto-confirmed rows (they may only be minted via `/auto-confirm`,
 * see docs/auto-confirm-key.md §4), so the exchanges kind verifies
 * rows directly with the shared `verifyExchangeLabel` against a
 * system-key resolver spanning every configured mirror's published
 * `GET /config` plus this node's own signer — the same §4 posture as
 * `peerPull.ts`, including fail-closed on nodeId conflicts.
 *
 * CURSORS are per (mirror, kind) — `mirror_pull_state`, schema v20 —
 * and use the composite exclusive `(since, sinceId)` pair the GET
 * feeds already serve. Per-mirror is load-bearing: mirrors lag each
 * other, so carrying node A's high-water mark to node B would silently
 * skip every record B holds that A hasn't seen yet.
 *
 * OUTCOME RULES per applied row — chosen so that neither a transient
 * race nor a permanently-refused record can wedge replication:
 *
 *   - 2xx (stored, stale-LWW no-op, or duplicate) → advance cursor.
 *   - 400 / 422 (malformed, bad signature)        → the row can never
 *     become valid; log, skip, advance. NOTE this deliberately differs
 *     from the PWA's "refused rows never advance the cursor" defense:
 *     a mirror is an operator-configured same-community node, and NOT
 *     advancing would halt the kind forever behind one bad row. The
 *     cursor-poisoning defense here is the plausibility gate below.
 *   - 409 → kind-dependent. For referent-ordered kinds (a task before
 *     its project, a signup before its shift) it is a transient race:
 *     HALT the kind, cursor stays put, the next cycle re-pulls after
 *     the referent kind (always earlier in MIRROR_KINDS) has caught
 *     up. For first-writer-wins kinds (redemptions,
 *     invite-revocations) a 409 is a PERMANENT conflict — the local
 *     store already holds the winning row — so skip and advance.
 *   - 403 (authority) → ambiguous: usually a transient
 *     referent-ordering race (self-heals like a 409), but it can be
 *     permanent when the local referent is NEWER than the mirror's
 *     (LWW moved authority away from the row's signer). Halt and
 *     retry, but only `MAX_AUTHORITY_RETRIES` cycles for the same row;
 *     then skip it with a loud log. Bounded retries mean a genuine
 *     race gets several minutes to resolve while a permanent refusal
 *     cannot block the kind forever.
 *   - anything else (5xx, …) → halt the kind, never skip.
 *
 * PLAUSIBILITY GATE: a row whose cursor timestamp is further than a
 * day in the future halts the kind instead of being applied or
 * skipped — advancing the high-water mark to a far-future stamp would
 * hide every subsequent record forever (the same defense the PWA's
 * pulls run against a malicious node).
 */
import type { FastifyInstance } from "fastify";
import { verifyExchangeLabel } from "@understoria/shared/crypto";
import { parseExchange } from "./validate.js";
import type { ExchangeStore, MirrorPullStore } from "./db.js";

/** Header carrying `BuiltServer.internalBypassToken` on self-injected
 *  requests. Exported so server.ts's rate-limit allowList and the
 *  redemption route's grace-skip check the same name. */
export const MIRROR_INTERNAL_HEADER = "x-understoria-internal";

/** One day — both the future-bound on plausible cursor stamps and the
 *  skew grace on mirror-published key-rotation trails. */
const DAY_MS = 24 * 60 * 60 * 1000;

/** How many consecutive cycles a 403'd row halts its kind before the
 *  worker concludes the refusal is permanent and skips it. */
export const MAX_AUTHORITY_RETRIES = 5;

type Row = Record<string, unknown>;

const num = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) && v > 0 ? v : null;
const str = (v: unknown): string | null =>
  typeof v === "string" && v.length > 0 ? v : null;

export interface MirrorKindSpec {
  /** Route path — the GET feed and the POST apply endpoint share it.
   *  Doubles as the cursor `kind` key in mirror_pull_state. */
  path: string;
  /** Key of the rows array in the GET response body. */
  bodyKey: string;
  /** Cursor timestamp of a row — must match the feed's ordering
   *  column. Null = row is malformed for cursor purposes. */
  ts: (row: Row) => number | null;
  /** Cursor id of a row (the feed's tiebreak column). */
  id: (row: Row) => string | null;
  /** 409 semantics — see the module comment. */
  conflict409: "halt" | "skip";
}

/**
 * Every durable kind, in referent-before-dependent order: events
 * before their cancellations/shifts/RSVPs, projects before tasks,
 * shifts before signups. Deliberately absent:
 * `/awaiting-transitions` (POST-only by design — the auto-confirm
 * clock anchors to ONE node's arrival time; it has no feed),
 * `/device-link` and `/link-request` (ephemeral rendezvous, only
 * meaningful on the node both devices talk to).
 */
export const MIRROR_KINDS: readonly MirrorKindSpec[] = [
  {
    path: "/events",
    bodyKey: "events",
    ts: (r) => num(r.createdAt),
    id: (r) => str(r.id),
    conflict409: "halt",
  },
  {
    path: "/event-cancellations",
    bodyKey: "eventCancellations",
    ts: (r) => num(r.cancelledAt),
    id: (r) => str(r.id),
    conflict409: "halt",
  },
  {
    path: "/project-states",
    bodyKey: "projectStates",
    ts: (r) => num(r.updatedAt),
    id: (r) => str(r.id),
    conflict409: "halt",
  },
  {
    path: "/task-states",
    bodyKey: "taskStates",
    ts: (r) => num(r.updatedAt),
    id: (r) => str(r.id),
    conflict409: "halt",
  },
  {
    path: "/event-shifts",
    bodyKey: "eventShifts",
    ts: (r) => num(r.updatedAt),
    id: (r) => str(r.id),
    conflict409: "halt",
  },
  {
    path: "/event-rsvps",
    bodyKey: "eventRsvps",
    ts: (r) => num(r.updatedAt),
    id: (r) => str(r.id),
    conflict409: "halt",
  },
  {
    path: "/seed-vault-pledges",
    bodyKey: "seedVaultPledges",
    ts: (r) => num(r.updatedAt),
    id: (r) => str(r.id),
    conflict409: "halt",
  },
  {
    path: "/shift-signups",
    bodyKey: "shiftSignups",
    ts: (r) => num(r.updatedAt),
    id: (r) => str(r.id),
    conflict409: "halt",
  },
  {
    path: "/posts",
    bodyKey: "posts",
    ts: (r) => num(r.createdAt),
    id: (r) => str(r.id),
    conflict409: "halt",
  },
  {
    path: "/claims",
    bodyKey: "claims",
    ts: (r) => num(r.claimedAt),
    id: (r) => str(r.postId),
    conflict409: "halt",
  },
  {
    // Custom apply path — see `applyExchange` and the module comment.
    path: "/exchanges",
    bodyKey: "exchanges",
    ts: (r) => num(r.completedAt),
    id: (r) => str(r.id),
    conflict409: "halt",
  },
  {
    path: "/vouches",
    bodyKey: "vouches",
    ts: (r) => num(r.createdAt),
    id: (r) => str(r.id),
    conflict409: "halt",
  },
  {
    path: "/task-comments",
    bodyKey: "taskComments",
    // The feed orders on MAX(created_at, deleted_at) so tombstones
    // re-enter the window — the row's cursor stamp must match.
    ts: (r) => {
      const created = num(r.createdAt);
      if (created === null) return null;
      const deleted = num(r.deletedAt) ?? 0;
      return Math.max(created, deleted);
    },
    id: (r) => str(r.id),
    conflict409: "halt",
  },
  {
    path: "/coorg-invitations",
    bodyKey: "coorgInvitations",
    ts: (r) => num(r.createdAt),
    id: (r) => str(r.id),
    conflict409: "halt",
  },
  {
    path: "/coorg-invitation-responses",
    bodyKey: "coorgInvitationResponses",
    ts: (r) => num(r.decidedAt),
    id: (r) => str(r.id),
    conflict409: "halt",
  },
  {
    path: "/coorg-invitation-revocations",
    bodyKey: "coorgInvitationRevocations",
    ts: (r) => num(r.revokedAt),
    id: (r) => str(r.id),
    conflict409: "halt",
  },
  {
    // Feed rows are `{...receipt, receivedAt}` — the cursor is the
    // ORIGIN node's arrival stamp, which the route preserves on
    // mirror-applied inserts so the receipt keeps one identity across
    // the whole mirror set. 409 = token already redeemed by someone
    // else — first-writer-wins, permanent, skip.
    path: "/redemptions",
    bodyKey: "redemptions",
    ts: (r) => num(r.receivedAt),
    id: (r) => str((r.invite as Row | null | undefined)?.token),
    conflict409: "skip",
  },
  {
    path: "/invite-revocations",
    bodyKey: "inviteRevocations",
    ts: (r) => num(r.receivedAt),
    id: (r) => str(r.token),
    conflict409: "skip",
  },
  // Member removal / reinstatement (docs/member-removal.md M1) —
  // AFTER redemptions: validity reads the closure, and the closure
  // reads receipts, so each cycle lands receipts first. A record the
  // origin accepted that still lacks its signers' receipts here
  // answers 409 quorum_not_met, which HALTS this kind until the next
  // cycle (the referent-409 posture, never a skip — governance
  // records must not be silently dropped).
  {
    path: "/member-removals",
    bodyKey: "memberRemovals",
    ts: (r) => num(r.decidedAt),
    id: (r) => str(r.id),
    conflict409: "halt",
  },
  {
    path: "/member-reinstatements",
    bodyKey: "memberReinstatements",
    ts: (r) => num(r.decidedAt),
    id: (r) => str(r.id),
    conflict409: "halt",
  },
  // Proposal federation G1 — proposals before votes before closures
  // (votes and closures 409 on an unknown proposal; the halt posture
  // retries next cycle once the referent lands).
  {
    path: "/proposals",
    bodyKey: "proposals",
    ts: (r) => num(r.createdAt),
    id: (r) => str(r.id),
    conflict409: "halt",
  },
  {
    path: "/votes",
    bodyKey: "votes",
    ts: (r) => num(r.createdAt),
    id: (r) => str(r.id),
    conflict409: "halt",
  },
  {
    path: "/proposal-closures",
    bodyKey: "proposalClosures",
    ts: (r) => num(r.closedAt),
    id: (r) => str(r.id),
    conflict409: "halt",
  },
];

export type MirrorFetcher = (
  url: string,
  headers?: Record<string, string>,
) => Promise<{
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}>;

export interface MirrorKindResult {
  mirrorUrl: string;
  kind: string;
  /** Rows accepted by the local route (stored, stale no-op, or dup). */
  applied: number;
  /** Rows permanently refused and skipped past (logged). */
  refused: number;
  /** True when the kind stopped early this cycle (transient failure
   *  or race); the cursor stays put and the next cycle retries. */
  halted: boolean;
  haltReason?: string;
}

export interface SystemKeyEntry {
  nodeId: string;
  current: string;
  history: { pubkey: string; retiredAt: number }[];
}

export interface MirrorPullWorkerOptions {
  /** The LOCAL Fastify instance — apply target for `app.inject`. */
  app: FastifyInstance;
  /** `BuiltServer.internalBypassToken`. */
  internalToken: string;
  mirrorUrls: readonly string[];
  /** url → bearer token for read-gated mirrors (`MIRROR_READ_TOKENS`). */
  readTokens: Readonly<Record<string, string>>;
  intervalMs: number;
  cursorStore: MirrorPullStore;
  /** Direct store access for the exchanges custom-apply path only. */
  exchangeStore: ExchangeStore;
  /** This node's own system key (when it holds one) — lets rows this
   *  node auto-confirmed itself verify when they come back around
   *  through a mirror. */
  ownSystemKey?: SystemKeyEntry | null;
  fetcher?: MirrorFetcher;
  /** Pages per kind per cycle; catch-up over more rows just takes
   *  extra cycles. */
  maxPagesPerKind?: number;
  pageLimit?: number;
  now?: () => number;
  onError?: (mirrorUrl: string, kind: string, error: Error) => void;
  /** Called with each kind's result — tests and observability. */
  onResult?: (result: MirrorKindResult) => void;
}

export interface MirrorPullWorker {
  /** One replication cycle over every configured mirror. Exposed for
   *  tests; the timer loop calls it in production. */
  pullAllOnce(): Promise<MirrorKindResult[]>;
  stop(): void;
}

type ApplyOutcome =
  | { kind: "applied" }
  | { kind: "refused"; reason: string }
  | { kind: "authority"; reason: string }
  | { kind: "halt"; reason: string };

export function startMirrorPullWorker(
  opts: MirrorPullWorkerOptions,
): MirrorPullWorker {
  const {
    app,
    internalToken,
    mirrorUrls,
    readTokens,
    intervalMs,
    cursorStore,
    exchangeStore,
    ownSystemKey = null,
    fetcher = async (url, headers) => {
      const res = await fetch(url, { headers });
      return { ok: res.ok, status: res.status, json: () => res.json() };
    },
    maxPagesPerKind = 50,
    pageLimit = 500,
    now = () => Date.now(),
    onError = (mirrorUrl, kind, err) =>
      app.log.warn(`[mirror-pull] ${mirrorUrl} ${kind}: ${err.message}`),
    onResult,
  } = opts;

  // --- §4 system-key material (same posture as peerPull.ts) ---------
  // One entry per mirror URL, refreshed from GET /config each cycle;
  // a fetch failure keeps the last-known-good entry. `null` = the
  // mirror answered and publishes no system key (a known state).
  const systemKeys = new Map<string, SystemKeyEntry | null>();
  const configErrors = new Map<string, Error>();

  // 403 retry budget, keyed mirror|kind|id|ts — in-memory on purpose:
  // a restart just re-counts, and the budget exists to bound cycles,
  // not to be a durable ledger.
  const authorityRetries = new Map<string, number>();

  function bearerHeaders(mirrorUrl: string): Record<string, string> {
    const token = readTokens[mirrorUrl];
    return token ? { authorization: `Bearer ${token}` } : {};
  }

  async function refreshMirrorSystemKey(mirrorUrl: string): Promise<void> {
    try {
      const res = await fetcher(`${mirrorUrl}/config`, bearerHeaders(mirrorUrl));
      if (!res.ok) {
        throw new Error(`config returned status ${res.status}`);
      }
      const body = (await res.json()) as {
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
        // Same rotation-trail hygiene as peerPull: keep well-formed
        // PAST retirements only (a far-future retiredAt is the
        // forged-history shape), ascending for the resolver's scan.
        const bound = now() + DAY_MS;
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
              (h as { retiredAt: number }).retiredAt <= bound,
          )
          .sort((a, b) => a.retiredAt - b.retiredAt);
        systemKeys.set(mirrorUrl, {
          nodeId: body.nodeId,
          current: body.systemKey.current,
          history,
        });
      } else {
        systemKeys.set(mirrorUrl, null);
      }
      configErrors.delete(mirrorUrl);
    } catch (err) {
      configErrors.set(
        mirrorUrl,
        err instanceof Error ? err : new Error(String(err)),
      );
    }
  }

  function sameHistory(
    a: { pubkey: string; retiredAt: number }[],
    b: { pubkey: string; retiredAt: number }[],
  ): boolean {
    if (a.length !== b.length) return false;
    return a.every(
      (h, i) => h.pubkey === b[i].pubkey && h.retiredAt === b[i].retiredAt,
    );
  }

  /** Resolver spans this node's own key plus every mirror's published
   *  key — a row auto-confirmed by the primary still verifies when it
   *  arrives via a third mirror, as long as the primary is in this
   *  node's mirror set (operators: configure mirrors as a full mesh).
   *  FAIL CLOSED on nodeId conflict, exactly like peerPull. */
  function resolveSystemPubkey(
    nodeId: string,
    signedAt: number,
  ): string | null {
    let match: {
      current: string;
      history: { pubkey: string; retiredAt: number }[];
    } | null = null;
    const candidates: (SystemKeyEntry | null)[] = [
      ownSystemKey,
      ...systemKeys.values(),
    ];
    for (const entry of candidates) {
      if (entry === null || entry.nodeId !== nodeId) continue;
      if (
        match !== null &&
        (entry.current !== match.current ||
          !sameHistory(entry.history, match.history))
      ) {
        return null;
      }
      if (match === null) {
        match = { current: entry.current, history: entry.history };
      }
    }
    if (match === null) return null;
    for (const h of match.history) {
      if (h.retiredAt > signedAt) return h.pubkey;
    }
    return match.current;
  }

  // --- apply paths ---------------------------------------------------

  async function applyViaInject(
    spec: MirrorKindSpec,
    row: Row,
  ): Promise<ApplyOutcome> {
    const res = await app.inject({
      method: "POST",
      url: spec.path,
      payload: row,
      headers: { [MIRROR_INTERNAL_HEADER]: internalToken },
    });
    if (res.statusCode >= 200 && res.statusCode < 300) {
      return { kind: "applied" };
    }
    const reason = `${spec.path} → ${res.statusCode} ${res.body.slice(0, 200)}`;
    if (res.statusCode === 400 || res.statusCode === 422) {
      return { kind: "refused", reason };
    }
    if (res.statusCode === 409) {
      return spec.conflict409 === "skip"
        ? { kind: "refused", reason }
        : { kind: "halt", reason };
    }
    if (res.statusCode === 403) {
      return { kind: "authority", reason };
    }
    return { kind: "halt", reason };
  }

  function applyExchange(mirrorUrl: string, row: Row): ApplyOutcome {
    const parsed = parseExchange(row);
    if (!parsed.ok) {
      return { kind: "refused", reason: `invalid exchange: ${parsed.error}` };
    }
    const exchange = parsed.value;
    if (verifyExchangeLabel(exchange, resolveSystemPubkey) === "invalid") {
      // Distinguish "signature is wrong" (permanent — skip) from "we
      // cannot resolve the confirming node's system key" (possibly
      // transient key-material gap — halt so the cursor never advances
      // past a row we might verify next cycle).
      if (exchange.autoConfirmed) {
        const nodeId = /^system:(.+)$/.exec(
          exchange.autoConfirmedBy ?? "",
        )?.[1];
        const signedAt = exchange.autoConfirmedAt ?? exchange.completedAt;
        if (
          nodeId !== undefined &&
          resolveSystemPubkey(nodeId, signedAt) === null
        ) {
          return {
            kind: "halt",
            reason: `no system key resolvable for ${nodeId} (via ${mirrorUrl}) — is the confirming node in MIRROR_NODE_URLS?`,
          };
        }
      }
      return { kind: "refused", reason: "exchange failed §4 verification" };
    }
    if (!exchangeStore.has(exchange.id)) {
      exchangeStore.insert(exchange);
    }
    return { kind: "applied" };
  }

  // --- the per-kind pull loop ----------------------------------------

  async function pullKind(
    mirrorUrl: string,
    spec: MirrorKindSpec,
  ): Promise<MirrorKindResult> {
    const result: MirrorKindResult = {
      mirrorUrl,
      kind: spec.path,
      applied: 0,
      refused: 0,
      halted: false,
    };
    const halt = (reason: string): MirrorKindResult => {
      result.halted = true;
      result.haltReason = reason;
      onError(mirrorUrl, spec.path, new Error(reason));
      return result;
    };

    // §4 guard for exchanges: never run the kind before this mirror's
    // /config has been seen at least once — rejecting auto-confirmed
    // rows with an empty resolver while OTHER rows advance the cursor
    // would skip them permanently (same rule as peerPull).
    if (spec.path === "/exchanges" && !systemKeys.has(mirrorUrl)) {
      return halt(
        configErrors.get(mirrorUrl)?.message ??
          "mirror /config has never been reachable",
      );
    }

    for (let page = 0; page < maxPagesPerKind; page++) {
      const cursor = cursorStore.get(mirrorUrl, spec.path);
      const query =
        `limit=${pageLimit}` +
        (cursor
          ? `&since=${cursor.lastTs}&sinceId=${encodeURIComponent(cursor.lastId)}`
          : "");
      let rows: unknown;
      try {
        const res = await fetcher(
          `${mirrorUrl}${spec.path}?${query}`,
          bearerHeaders(mirrorUrl),
        );
        if (!res.ok) return halt(`GET returned status ${res.status}`);
        const body = (await res.json()) as Record<string, unknown> | null;
        rows = body?.[spec.bodyKey];
      } catch (err) {
        return halt(err instanceof Error ? err.message : String(err));
      }
      if (!Array.isArray(rows)) return halt("malformed feed body");
      if (rows.length === 0) return result;

      for (const raw of rows) {
        if (raw === null || typeof raw !== "object") {
          return halt("feed row is not an object");
        }
        const row = raw as Row;
        const ts = spec.ts(row);
        const id = spec.id(row);
        if (ts === null || id === null) {
          // Can't advance the cursor past a row we can't position —
          // halting beats permanently skipping everything behind it.
          return halt("feed row is missing its cursor fields");
        }
        if (ts > now() + DAY_MS) {
          // Plausibility gate — see module comment.
          return halt(`implausible cursor timestamp ${ts}`);
        }

        const outcome =
          spec.path === "/exchanges"
            ? applyExchange(mirrorUrl, row)
            : await applyViaInject(spec, row);

        const retryKey = `${mirrorUrl}|${spec.path}|${id}|${ts}`;
        switch (outcome.kind) {
          case "applied":
            authorityRetries.delete(retryKey);
            cursorStore.set(mirrorUrl, spec.path, ts, id);
            result.applied += 1;
            break;
          case "refused":
            authorityRetries.delete(retryKey);
            cursorStore.set(mirrorUrl, spec.path, ts, id);
            result.refused += 1;
            app.log.warn(
              `[mirror-pull] refused row skipped: ${outcome.reason}`,
            );
            break;
          case "authority": {
            const attempts = (authorityRetries.get(retryKey) ?? 0) + 1;
            if (attempts >= MAX_AUTHORITY_RETRIES) {
              authorityRetries.delete(retryKey);
              cursorStore.set(mirrorUrl, spec.path, ts, id);
              result.refused += 1;
              app.log.warn(
                `[mirror-pull] row still 403 after ${attempts} cycles, skipping permanently: ${outcome.reason}`,
              );
              break;
            }
            authorityRetries.set(retryKey, attempts);
            return halt(
              `authority refusal (attempt ${attempts}/${MAX_AUTHORITY_RETRIES}): ${outcome.reason}`,
            );
          }
          case "halt":
            return halt(outcome.reason);
        }
      }

      if (rows.length < pageLimit) return result; // caught up
    }
    // Page budget exhausted — not an error; the cursor is persisted,
    // so the next cycle continues where this one stopped.
    return result;
  }

  async function pullAllOnce(): Promise<MirrorKindResult[]> {
    const results: MirrorKindResult[] = [];
    for (const mirrorUrl of mirrorUrls) {
      await refreshMirrorSystemKey(mirrorUrl);
      for (const spec of MIRROR_KINDS) {
        try {
          const r = await pullKind(mirrorUrl, spec);
          results.push(r);
          onResult?.(r);
        } catch (err) {
          // pullKind converts expected failures itself; this is the
          // belt for the unexpected — one kind must not stop the rest.
          onError(
            mirrorUrl,
            spec.path,
            err instanceof Error ? err : new Error(String(err)),
          );
        }
      }
    }
    return results;
  }

  let running = false;
  const tick = (): void => {
    if (running) return; // never overlap cycles
    running = true;
    void pullAllOnce()
      .catch((err) =>
        onError(
          "*",
          "*",
          err instanceof Error ? err : new Error(String(err)),
        ),
      )
      .finally(() => {
        running = false;
      });
  };

  // intervalMs <= 0 disables the timer loop (tests drive cycles by
  // calling pullAllOnce directly).
  const active = mirrorUrls.length > 0 && intervalMs > 0;
  const timer = active ? setInterval(tick, intervalMs) : null;
  timer?.unref?.();
  if (active) tick();

  return {
    pullAllOnce,
    stop() {
      if (timer !== null) clearInterval(timer);
    },
  };
}
