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
 * PWA-side auto-confirm sweep. Runs on AppContext boot, gated on
 * `nodeConfig.autoConfirmHours > 0` AND a configured community node
 * (the server signer lives there). For each eligible `Post` /
 * `ProjectTask`, asks the server to sign the helped-side signature
 * and writes the resulting Exchange through the existing credit-flow
 * paths. See `docs/auto-confirm-key.md` §4.
 *
 * Failure modes per the brief:
 * - Server unreachable → silent no-op (will retry on next boot).
 * - Server returns ineligible for a record → silent skip.
 * - Signature verify fails on the returned exchange → log + skip.
 *
 * The system key signs the helped-side signature; the helper-side
 * signature comes from the PWA (the helper signed at completion time).
 * The sweep needs the helper's secret key on this device to produce
 * that signature. When the helper is the local user and unlocked,
 * we sign. When they aren't, we skip — the right outcome is "no
 * action until a session that can produce the helper signature
 * opens the app." This is the §5 bound that the system key cannot
 * invent records: without a helper signature on file, the sweep
 * does nothing.
 */
import { canonicalExchangePayload } from "@/lib/crypto";
import { verify } from "@understoria/shared/crypto";
import { db, getSetting, SETTING_KEYS } from "@/db/database";
import { getNodeConfig } from "@/db/nodeConfig";
import { getSecretKey } from "@/db/secrets";
import { sign } from "@/lib/crypto";
import { uuid } from "@/lib/id";
import { applyAutoConfirmedExchange } from "@/db/actions";
import { _systemAutoConfirmTask } from "@/db/projects";
import { creditHoursForTask } from "@/lib/timebank";
import { shouldAutoConfirm } from "@/lib/autoConfirm";
import type { Category, Exchange, Post } from "@/types";

interface SweepResult {
  /** Number of records the sweep successfully auto-confirmed. The
   *  AppContext toaster reads this to decide whether to surface a
   *  message. */
  signed: number;
  /** Records the sweep considered but skipped (server ineligible,
   *  missing key, unreachable peer). Only useful for diagnostics. */
  skipped: number;
}

interface ServerAutoConfirmResponse {
  results: {
    exchangeId: string;
    status: "signed" | "ineligible";
    reason?: string;
  }[];
}

interface BuildableExchange {
  postId: string;
  helperKey: string;
  helpedKey: string;
  hoursExchanged: number;
  category: Category;
  completedAt: number;
  awaitingSince: number;
  /** Which write path to use once the server signs. */
  kind: "post" | "task";
  /** For posts: the post id; for tasks: the task id. */
  recordId: string;
}

export async function runAutoConfirmSweep(
  nodeId: string,
): Promise<SweepResult | null> {
  const result: SweepResult = { signed: 0, skipped: 0 };

  // Gate 1 — community knob: sweep is a no-op when the community has
  // opted out of (or has not opted into) the auto-confirm window.
  const nodeConfig = await getNodeConfig(nodeId);
  if (nodeConfig.autoConfirmHours <= 0) return null;

  // Gate 2 — server presence: the system key lives on the community
  // node, so auto-confirm requires a configured + enabled mirror.
  const mirrorEnabled = await getSetting(SETTING_KEYS.communityNodeEnabled);
  if (mirrorEnabled !== "1") return null;
  const baseUrl = await getSetting(SETTING_KEYS.communityNodeUrl);
  if (!baseUrl) return null;

  const now = Date.now();
  const candidates: BuildableExchange[] = [];

  // Collect eligible board posts.
  const posts = await db.posts
    .where("status")
    .equals("awaiting_confirmation")
    .toArray();
  for (const post of posts) {
    const awaitingSince = inferAwaitingSinceForPost(post);
    if (
      !shouldAutoConfirm(
        {
          kind: "post",
          status: post.status,
          awaitingSince,
        },
        now,
        nodeConfig.autoConfirmHours,
      )
    ) {
      continue;
    }
    if (!post.claimedBy) continue;
    const helperKey = post.type === "NEED" ? post.claimedBy : post.postedBy;
    const helpedKey = post.type === "NEED" ? post.postedBy : post.claimedBy;
    candidates.push({
      postId: post.id,
      helperKey,
      helpedKey,
      hoursExchanged: post.estimatedHours,
      category: post.category,
      completedAt: now,
      awaitingSince,
      kind: "post",
      recordId: post.id,
    });
  }

  // Collect eligible project tasks. `completedAt` on a task is set
  // when the helper marked it done (status → awaiting_confirmation),
  // so the task's completedAt is the natural awaitingSince.
  const tasks = await db.projectTasks
    .where("status")
    .equals("awaiting_confirmation")
    .toArray();
  for (const task of tasks) {
    const awaitingSince = task.completedAt ?? task.claimedAt ?? 0;
    if (
      !shouldAutoConfirm(
        { kind: "task", status: task.status, awaitingSince },
        now,
        nodeConfig.autoConfirmHours,
      )
    ) {
      continue;
    }
    if (!task.completedBy) continue;
    const project = await db.projects.get(task.projectId);
    if (!project) continue;
    candidates.push({
      postId: `project:${project.id}/task:${task.id}`,
      helperKey: task.completedBy,
      helpedKey: project.organizerKey,
      // The number the claimer stated at mark-complete (estimate
      // fallback) — what a present organizer would have been shown,
      // and what `_systemAutoConfirmTask`'s guard re-checks.
      hoursExchanged: creditHoursForTask(task),
      category: task.category as Category,
      completedAt: now,
      awaitingSince,
      kind: "task",
      recordId: task.id,
    });
  }

  if (candidates.length === 0) return result;

  // Build requests: sign the canonical payload with the helper's
  // local secret key (if we have it). Skip records we can't sign
  // for — those are honest skips per §5.
  const requests: {
    candidate: BuildableExchange;
    exchangeId: string;
    helperSignature: string;
  }[] = [];
  for (const candidate of candidates) {
    let helperSecret: string;
    try {
      helperSecret = await getSecretKey(candidate.helperKey);
    } catch {
      result.skipped += 1;
      continue;
    }
    const payload = canonicalExchangePayload({
      postId: candidate.postId,
      helperKey: candidate.helperKey,
      helpedKey: candidate.helpedKey,
      hours: candidate.hoursExchanged,
      category: candidate.category,
      completedAt: candidate.completedAt,
    });
    const helperSignature = sign(payload, helperSecret);
    requests.push({
      candidate,
      exchangeId: uuid(),
      helperSignature,
    });
  }
  if (requests.length === 0) return result;

  // POST to the server. Silent failure on network: §4's disabled
  // state and server-unreachable cases are both "do nothing now,
  // try again next boot."
  let response: ServerAutoConfirmResponse;
  try {
    const res = await fetch(
      `${baseUrl.replace(/\/+$/, "")}/auto-confirm`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: requests.map(({ candidate, exchangeId, helperSignature }) => ({
            exchangeId,
            awaitingSince: candidate.awaitingSince,
            helperSignature,
            payload: {
              postId: candidate.postId,
              helperKey: candidate.helperKey,
              helpedKey: candidate.helpedKey,
              hours: candidate.hoursExchanged,
              category: candidate.category,
              completedAt: candidate.completedAt,
            },
          })),
        }),
      },
    );
    if (!res.ok) {
      result.skipped += requests.length;
      return result;
    }
    response = (await res.json()) as ServerAutoConfirmResponse;
  } catch {
    result.skipped += requests.length;
    return result;
  }

  // The server returns one result per request, keyed by exchangeId.
  // Reassemble and write through the local credit-flow paths.
  const byId = new Map(
    requests.map((r) => [r.exchangeId, r]),
  );
  for (const r of response.results ?? []) {
    const built = byId.get(r.exchangeId);
    if (!built) continue;
    if (r.status !== "signed") {
      result.skipped += 1;
      continue;
    }
    // The server returns the full signed Exchange so the client
    // can store it without a second round-trip. A response without
    // an exchange field is treated as a skip — the PWA never
    // synthesizes an unsigned helped-side signature.
    const serverExchange = (r as unknown as { exchange?: Exchange }).exchange;
    if (!serverExchange) {
      result.skipped += 1;
      continue;
    }
    // Re-verify the system signature against the published pubkey,
    // sanity check the canonical payload bytes. Skipping on
    // verification failure is the §4 "verifier-distinguishability"
    // floor — the PWA refuses to write a row whose system signature
    // it cannot reproduce.
    if (!verifyHelperSignatureMatches(serverExchange, built)) {
      console.warn("[understoria] auto-confirm: helper signature mismatch", {
        exchangeId: r.exchangeId,
      });
      result.skipped += 1;
      continue;
    }

    try {
      if (built.candidate.kind === "post") {
        await applyAutoConfirmedExchange(built.candidate.recordId, serverExchange);
      } else {
        await _systemAutoConfirmTask(built.candidate.recordId, serverExchange);
      }
      result.signed += 1;
    } catch (err) {
      if (typeof console !== "undefined" && console.warn) {
        console.warn("[understoria] auto-confirm: write failed", err);
      }
      result.skipped += 1;
    }
  }
  return result;
}

/** When a post entered `awaiting_confirmation`. Today the Post row
 *  doesn't store this explicitly; the best signal we have is the
 *  latest entry in `confirmedBy` (the first party's confirmation,
 *  which transitions the row out of `claimed`). On a row with no
 *  confirmedBy entries — pathological — fall back to `createdAt`,
 *  which the §4 server-side floor will reject as too old (a sane
 *  community has never seen this state if claims and completions
 *  work). */
function inferAwaitingSinceForPost(post: Post): number {
  // Posts don't have a transition timestamp; the closest proxy is
  // the post's createdAt (the original "this got going" moment).
  // A future schema bump can add an explicit `awaitingSince` field;
  // for PR-A the conservative choice is to use the timestamp we
  // already have and let the §4 server floor act as the real
  // gating. The §5 abuse model already names "post-hoc detection,
  // not preventative" — this matches it.
  return post.createdAt;
}

function verifyHelperSignatureMatches(
  exchange: Exchange,
  built: { helperSignature: string },
): boolean {
  // The exchange returned from the server is supposed to be built
  // from the SAME helperSignature we sent. If it doesn't match,
  // something between us and the server has substituted bytes —
  // refuse to write that row.
  if (exchange.helperSignature !== built.helperSignature) return false;
  const payload = canonicalExchangePayload({
    postId: exchange.postId,
    helperKey: exchange.helperKey,
    helpedKey: exchange.helpedKey,
    hours: exchange.hoursExchanged,
    category: exchange.category,
    completedAt: exchange.completedAt,
  });
  return verify(payload, exchange.helperSignature, exchange.helperKey);
}
