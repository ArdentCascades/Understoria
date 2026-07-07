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
import { db, getSetting, setSetting } from "@/db/database";
import { normalizeNodeUrl, urlHash } from "@/lib/nodeEndpoints";
import type { Post } from "@/types";

/**
 * Community re-seed, Phase R1 walker — docs/community-reseed.md §2.
 *
 * Uploads the community's ENTIRE replicated history from this device
 * to a (typically brand-new) node, through the node's ordinary write
 * routes. The whole design rests on one fact: the routes authenticate
 * SIGNATURES, not submitters — a row this device merely pulled years
 * ago re-verifies exactly like a fresh submission. Everything here is
 * idempotent (id / natural key / first-writer-wins), so several
 * members re-seeding concurrently just union their copies.
 *
 * Kind order = referents before dependents (the mirror worker's
 * ordering), with the membership artifacts FIRST so the recovering
 * operator can flip `READ_AUTH=on` as early as possible.
 *
 * Outcome rules per row, mirroring the mirror worker's:
 *   - 201 → restored; 200 → already present (another member got
 *     there first — counted, celebrated, not retried).
 *   - 400/422 → skipped-and-counted: the node refuses a row this
 *     device holds (legacy unsigned posts, an auto-confirmed
 *     exchange with no TRUSTED_SYSTEM_KEYS declared, a receipt
 *     outside an open re-seed window). Never silent — the summary
 *     names the count.
 *   - 409 → permanent conflict for the first-writer-wins kinds
 *     (skip); a transient missing-referent for everything else
 *     (halt the kind; the next run retries from the same spot).
 *   - network / 5xx / 429 → halt the kind; resume later.
 *
 * Progress is persisted per (target, kind) so an interrupted re-seed
 * RESUMES, never restarts. The pace is deliberately gentle — the
 * target node's rate limit and insert caps apply to this walker like
 * any client, and the operator runbook covers raising them for large
 * communities.
 */

export interface ReseedKindSpec {
  /** POST route on the target node. Doubles as the cursor key part. */
  path: string;
  /** Dexie table the rows come from. */
  table: string;
  /** Map a local row to its wire shape; null = not re-seedable
   *  (counted as skipped). Default: the row verbatim. */
  toWire?: (row: Record<string, unknown>) => Record<string, unknown> | null;
  /** 409 semantics — "skip" for first-writer-wins kinds, "halt"
   *  (default) for referent races. */
  conflict409?: "halt" | "skip";
}

/** Strip a post to the signed wire shape (same fields as
 *  `enqueuePostOutbox`); legacy unsigned posts are not federable. */
function postToWire(row: Record<string, unknown>): Record<string, unknown> | null {
  const post = row as unknown as Post;
  if (!post.signature) return null;
  return {
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
}

/** Rows for the signed-LWW kinds must carry their state-record
 *  fields; anything minted before that machinery (or never
 *  published) has nothing a node could verify. */
function signedOrNull(
  row: Record<string, unknown>,
): Record<string, unknown> | null {
  return typeof row.signature === "string" && row.signature.length > 0
    ? row
    : null;
}

export const RESEED_KINDS: readonly ReseedKindSpec[] = [
  // Membership first — receipts are what READ_AUTH derives from.
  { path: "/redemptions", table: "redemptionReceipts", conflict409: "skip" },
  {
    path: "/invite-revocations",
    table: "inviteRevocationRecords",
    conflict409: "skip",
  },
  { path: "/events", table: "events" },
  { path: "/event-cancellations", table: "eventCancellations" },
  { path: "/project-states", table: "projects", toWire: signedOrNull },
  { path: "/task-states", table: "projectTasks", toWire: signedOrNull },
  { path: "/event-shifts", table: "eventShifts", toWire: signedOrNull },
  { path: "/event-rsvps", table: "eventRsvps", toWire: signedOrNull },
  // docs/storage-budget.md Phase 2: archive-role pledges (no parent).
  { path: "/seed-vault-pledges", table: "seedVaultPledges", toWire: signedOrNull },
  // docs/member-removal.md M1: governance records — after receipts
  // (their validity reads the closure the receipts rebuild). These
  // rows carry a signatures[] array rather than a single signature;
  // they re-verify wholesale on the receiving node.
  { path: "/member-removals", table: "memberRemovals", toWire: (row) => row },
  {
    path: "/member-reinstatements",
    table: "memberReinstatements",
    toWire: (row) => row,
  },
  { path: "/shift-signups", table: "shiftSignups", toWire: signedOrNull },
  { path: "/posts", table: "posts", toWire: postToWire },
  { path: "/exchanges", table: "exchanges" },
  { path: "/vouches", table: "vouches" },
  { path: "/task-comments", table: "taskComments" },
  { path: "/coorg-invitations", table: "coorgInvitations" },
  { path: "/coorg-invitation-responses", table: "coorgInvitationResponses" },
  {
    path: "/coorg-invitation-revocations",
    table: "coorgInvitationRevocations",
  },
];

export interface ReseedKindResult {
  path: string;
  /** Rows the node newly stored. */
  restored: number;
  /** Rows the node already had (another device got there first). */
  alreadyPresent: number;
  /** Rows the node refused or this device can't send (legacy
   *  unsigned, undeclared auto-confirm keys, …) — named, not silent. */
  skipped: number;
  /** True when the kind stopped early (network/5xx/referent race);
   *  the persisted cursor means the next run resumes here. */
  halted: boolean;
  haltReason?: string;
}

export interface ReseedRunResult {
  results: ReseedKindResult[];
  /** True when every kind ran to the end of its table this run. */
  complete: boolean;
}

export interface ReseedOptions {
  /** The node to restore onto. */
  targetUrl: string;
  fetchImpl?: typeof fetch;
  onProgress?: (update: {
    path: string;
    done: number;
    total: number;
  }) => void;
  /** Delay between POSTs, ms — stays friendly to a Raspberry-Pi
   *  node's rate limit. Tests pass 0. */
  paceMs?: number;
  batchSize?: number;
}

function cursorKey(targetUrl: string, path: string): string {
  return `reseedCursor::${urlHash(targetUrl)}::${path}`;
}

/** Forget the per-kind resume points for a target — the UI offers
 *  this as "start over" and tests use it between scenarios. */
export async function resetReseedCursors(targetUrl: string): Promise<void> {
  for (const spec of RESEED_KINDS) {
    await setSetting(cursorKey(normalizeNodeUrl(targetUrl), spec.path), "");
  }
}

const sleep = (ms: number) =>
  ms > 0 ? new Promise((r) => setTimeout(r, ms)) : Promise.resolve();

export async function runReseed(opts: ReseedOptions): Promise<ReseedRunResult> {
  const target = normalizeNodeUrl(opts.targetUrl);
  const fetchImpl = opts.fetchImpl ?? globalThis.fetch;
  const paceMs = opts.paceMs ?? 150;
  const batchSize = opts.batchSize ?? 50;
  const results: ReseedKindResult[] = [];
  let complete = true;

  for (const spec of RESEED_KINDS) {
    const result: ReseedKindResult = {
      path: spec.path,
      restored: 0,
      alreadyPresent: 0,
      skipped: 0,
      halted: false,
    };
    results.push(result);
    const table = db.table(spec.table);
    const total = await table.count();
    const key = cursorKey(target, spec.path);
    let offset = Number((await getSetting(key)) || 0);
    if (!Number.isFinite(offset) || offset < 0) offset = 0;

    kind: while (offset < total) {
      const rows = (await table
        .offset(offset)
        .limit(batchSize)
        .toArray()) as Record<string, unknown>[];
      if (rows.length === 0) break;
      for (const row of rows) {
        const wire = spec.toWire ? spec.toWire(row) : row;
        if (wire === null) {
          result.skipped += 1;
          offset += 1;
          await setSetting(key, String(offset));
          continue;
        }
        let status: number;
        try {
          const res = await fetchImpl(`${target}${spec.path}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(wire),
            credentials: "omit",
            mode: "cors",
          });
          status = res.status;
        } catch (err) {
          result.halted = true;
          result.haltReason =
            err instanceof Error ? err.message : "network_error";
          break kind;
        }
        if (status === 201) {
          result.restored += 1;
        } else if (status >= 200 && status < 300) {
          result.alreadyPresent += 1;
        } else if (status === 400 || status === 422) {
          result.skipped += 1;
        } else if (status === 409 && spec.conflict409 === "skip") {
          result.skipped += 1;
        } else {
          // Referent race (409), rate limit (429), or server failure
          // — stop here WITHOUT advancing past this row; the next run
          // retries it after the referent kind has caught up.
          result.halted = true;
          result.haltReason = `http_${status}`;
          break kind;
        }
        offset += 1;
        await setSetting(key, String(offset));
        opts.onProgress?.({ path: spec.path, done: offset, total });
        await sleep(paceMs);
      }
    }
    if (result.halted) complete = false;
  }

  return { results, complete };
}
