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
import type { Exchange, Member, Post, ProjectTask } from "@/types";

/**
 * Credits are computed from the exchange log (event sourcing) plus each
 * member's seed balance. Balances are never mutated directly — this keeps
 * the system auditable and is the foundation for federation (Agent 3).
 *
 * Every member starts with a seed balance (default 5 hours) so asking for
 * help is never gated on having "earned" credit first. This is a core
 * design principle — do not add skill-based multipliers or market pricing.
 */
export function balanceFor(
  member: Pick<Member, "publicKey" | "seedBalance">,
  exchanges: readonly Exchange[],
): number {
  let balance = member.seedBalance;
  for (const x of exchanges) {
    if (x.helperKey === member.publicKey) balance += x.hoursExchanged;
    if (x.helpedKey === member.publicKey) balance -= x.hoursExchanged;
  }
  return Math.round(balance * 100) / 100;
}

export interface TransactionEntry {
  exchange: Exchange;
  /** Positive if you gave help (earned credit), negative if you received. */
  delta: number;
  counterparty: string;
}

export function transactionHistory(
  memberKey: string,
  exchanges: readonly Exchange[],
): TransactionEntry[] {
  return exchanges
    .filter(
      (x) => x.helperKey === memberKey || x.helpedKey === memberKey,
    )
    .map((exchange) => {
      const gaveHelp = exchange.helperKey === memberKey;
      return {
        exchange,
        delta: gaveHelp ? exchange.hoursExchanged : -exchange.hoursExchanged,
        counterparty: gaveHelp ? exchange.helpedKey : exchange.helperKey,
      };
    })
    .sort((a, b) => b.exchange.completedAt - a.exchange.completedAt);
}

/**
 * Credit "in motion" — display honesty for the Profile balance.
 *
 * An Exchange row only exists once BOTH parties have signed (or the
 * node's system key auto-confirmed the helped side — see
 * `docs/auto-confirm-key.md`). So `balanceFor` never counts a
 * half-confirmed exchange; the waiting state lives on the Post:
 * status `awaiting_confirmation` with one party's key in
 * `confirmedBy`. This helper surfaces that state so the UI can
 * explain why credit hasn't landed yet. It does NOT change when
 * credit moves — that stays with the mutual-confirmation model.
 */
export interface PendingEntry {
  postId: string;
  /**
   * Positive if credit will land for the member once both sides have
   * confirmed; negative if it will move out. Same sign convention as
   * `TransactionEntry.delta`.
   */
  delta: number;
  counterparty: string;
  /**
   * Who still needs to confirm: `"you"` — the member themselves owe
   * their confirmation (they can act); `"partner"` — the other party
   * does (nothing for the member to do; the auto-confirm sweep
   * eventually covers it where the community has enabled one).
   */
  owedBy: "you" | "partner";
  category: Post["category"];
  createdAt: number;
}

export interface PendingBalance {
  /** Net signed hours across entries where the partner still owes a
   *  confirmation. */
  awaitingPartnerHours: number;
  /** Net signed hours across entries where the member still owes
   *  their own confirmation. */
  awaitingYouHours: number;
  /** Newest first, matching `transactionHistory` ordering. */
  entries: PendingEntry[];
}

export function pendingBalanceFor(
  memberKey: string,
  posts: readonly Post[],
): PendingBalance {
  const entries: PendingEntry[] = [];
  for (const post of posts) {
    if (post.status !== "awaiting_confirmation") continue;
    if (!post.claimedBy) continue;
    // Counterparty would be ambiguous if a member could claim their
    // own post; skip defensively rather than guess.
    if (post.postedBy === post.claimedBy) continue;
    if (post.postedBy !== memberKey && post.claimedBy !== memberKey) {
      continue;
    }
    // Who helped whom — same rule confirmExchange applies when it
    // eventually writes the Exchange row.
    const helperKey = post.type === "NEED" ? post.claimedBy : post.postedBy;
    const gaveHelp = helperKey === memberKey;
    entries.push({
      postId: post.id,
      delta: gaveHelp ? post.estimatedHours : -post.estimatedHours,
      counterparty:
        post.postedBy === memberKey ? post.claimedBy : post.postedBy,
      owedBy: post.confirmedBy.includes(memberKey) ? "partner" : "you",
      category: post.category,
      createdAt: post.createdAt,
    });
  }
  entries.sort((a, b) => b.createdAt - a.createdAt);

  let awaitingPartnerHours = 0;
  let awaitingYouHours = 0;
  for (const e of entries) {
    if (e.owedBy === "partner") awaitingPartnerHours += e.delta;
    else awaitingYouHours += e.delta;
  }
  return {
    awaitingPartnerHours: Math.round(awaitingPartnerHours * 100) / 100,
    awaitingYouHours: Math.round(awaitingYouHours * 100) / 100,
    entries,
  };
}

/**
 * Incoming-credit prediction for project tasks the member has claimed
 * and submitted — `status === "awaiting_confirmation"` with the member
 * still holding the assignment. Sibling to `pendingBalanceFor` rather
 * than an extension of it: posts and tasks use disjoint stores, the
 * #221 helper's unit tests stay untouched, and the call site composes
 * the two outputs into one merged display total.
 *
 * Claimer-side only, by design. The HELPED side of a task exchange is
 * indeterminate before confirmation — `confirmProjectTaskCompletion`
 * (apps/web/src/db/projects.ts) sets `helpedKey` to whichever
 * organizer signs, and the active organizer set can change between
 * submission and confirmation. The CLAIMER side is fully determinate:
 * their key is on `assignedTo`, and the hours figure is exactly what
 * `confirmProjectTaskCompletion` records — `creditHoursForTask(task)`.
 * So we can honestly predict the claimer's incoming credit; we
 * deliberately do not predict any prospective organizer debit. PR
 * #221's exclusion of the helped side stands; this helper closes only
 * the asymmetry that affected the determinate side.
 *
 * Hours figure: `creditHoursForTask(task)` — the claimer-stated actual
 * hours, falling back to the estimate. The prediction stays the
 * recorded number because both read through that one helper.
 */
export interface PendingTaskEntry {
  taskId: string;
  projectId: string;
  /** Positive — the claimer always receives credit on confirmation. */
  delta: number;
  category: ProjectTask["category"];
  createdAt: number;
}

export interface PendingTaskCredit {
  /** Sum of `delta` across `entries`. Always >= 0. */
  hours: number;
  /** Newest first, matching `transactionHistory` / `pendingBalanceFor`. */
  entries: PendingTaskEntry[];
}

/**
 * The hours a project task moves on confirmation: the claimer-stated
 * `actualHours`, or the organizer's `estimatedHours` when actual was
 * never stated (legacy / programmatic rows). The ONE place this
 * fallback lives — `confirmProjectTaskCompletion`, the auto-confirm
 * sweep, `contributedHours` / milestone math, the pending-credit
 * prediction, and the project-page display all read through it, which
 * is what keeps the predicted number the recorded number without a
 * comment-enforced "update both" rule.
 */
export function creditHoursForTask(
  task: Pick<ProjectTask, "actualHours" | "estimatedHours">,
): number {
  return task.actualHours ?? task.estimatedHours;
}

export function pendingTaskCreditFor(
  memberKey: string,
  tasks: readonly ProjectTask[],
): PendingTaskCredit {
  const entries: PendingTaskEntry[] = [];
  for (const task of tasks) {
    if (task.status !== "awaiting_confirmation") continue;
    if (task.assignedTo !== memberKey) continue;
    entries.push({
      taskId: task.id,
      projectId: task.projectId,
      delta: creditHoursForTask(task),
      category: task.category,
      createdAt: task.createdAt,
    });
  }
  entries.sort((a, b) => b.createdAt - a.createdAt);
  let hours = 0;
  for (const e of entries) hours += e.delta;
  return { hours: Math.round(hours * 100) / 100, entries };
}

/**
 * Project confirmation outflow — display honesty for an ORGANIZER's
 * Profile balance.
 *
 * `confirmProjectTaskCompletion` (and the auto-confirm sweep) records
 * the confirming organizer as the HELPED party on the signed
 * `Exchange`, so every task they confirm moves `hoursExchanged` OUT of
 * their balance. An organizer of a busy project can drift well below
 * their seed for this reason alone — those are hours they moved to
 * helpers on the community's behalf, not personal consumption. The bare
 * number looks like over-consuming; this helper sums the outflow per
 * project so the Profile can name it plainly.
 *
 * Source-of-truth contract: the project/task ids live INSIDE the signed
 * `Exchange.postId`, formatted `"project:<projectId>/task:<taskId>"` by
 * `confirmProjectTaskCompletion` (apps/web/src/db/projects.ts). A row
 * that starts with `"project:"` but is missing the `/task:` segment is
 * skipped quietly — we can't attribute it to a project and won't let it
 * inflate the total. If that format ever changes, update both together.
 *
 * Display-only: reads the same Exchange log `balanceFor` reads and
 * changes nothing about the credit model. Title resolution is the
 * caller's job (this layer stays free of any project-store dependency).
 */
export interface ProjectConfirmationOutflow {
  /** Sum of `perProject` hours. Always >= 0. */
  totalHours: number;
  /** Per-project outflow, largest first (stable tiebreak on projectId). */
  perProject: { projectId: string; hours: number }[];
}

const PROJECT_POST_PREFIX = "project:";
const TASK_POST_SEP = "/task:";

export function projectConfirmationOutflow(
  memberKey: string,
  exchanges: readonly Exchange[],
): ProjectConfirmationOutflow {
  const byProject = new Map<string, number>();
  for (const x of exchanges) {
    if (x.helpedKey !== memberKey) continue;
    if (!x.postId.startsWith(PROJECT_POST_PREFIX)) continue;
    const sepIndex = x.postId.indexOf(TASK_POST_SEP);
    if (sepIndex < 0) continue; // malformed — skip quietly
    const projectId = x.postId.slice(PROJECT_POST_PREFIX.length, sepIndex);
    if (projectId === "") continue;
    byProject.set(
      projectId,
      (byProject.get(projectId) ?? 0) + x.hoursExchanged,
    );
  }
  const perProject = Array.from(byProject, ([projectId, hours]) => ({
    projectId,
    hours: Math.round(hours * 100) / 100,
  }));
  // Largest first so the caller can name the project that explains the
  // most hours; the projectId tiebreak keeps the order deterministic.
  perProject.sort((a, b) =>
    b.hours !== a.hours
      ? b.hours - a.hours
      : a.projectId.localeCompare(b.projectId),
  );
  let totalHours = 0;
  for (const p of perProject) totalHours += p.hours;
  return { totalHours: Math.round(totalHours * 100) / 100, perProject };
}
