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
import type { Member, NodeConfig, Post, Project, ProjectTask } from "@/types";
import {
  daysSinceClaim as daysSinceClaimHelper,
  taskStaleness,
} from "./taskStaleness";

// "Needs your attention" — things waiting on the current member to
// act. Pure utility surface: information you already need but
// currently have to dig for. No nag, no push, no time-on-app metric.
// When the list is empty the UI hides the section entirely so
// there's never a "you're not doing enough" feeling.
//
// In scope right now (kept tight on purpose):
// - Exchanges in `awaiting_confirmation` state where you haven't
//   added your signature yet. Without confirming, credits don't
//   transfer.
// - Project tasks an organizer needs to confirm. Without
//   confirmation, the contributing member's task stays in limbo.
//
// Out of scope for the first slice (each could be added later as
// its own kind):
// - "Your post got claimed" (informational only — doesn't block).
// - "A project you organize is stalled" (we already surface this
//   on the project detail page via the momentum chip).
// - "You claimed this task days ago" (would need a staleness
//   threshold, which is a UX judgment to make with pilot input).

export type AttentionItem =
  | {
      kind: "confirm_exchange";
      postId: string;
      postTitle: string;
      counterpartyName: string;
      createdAt: number;
    }
  | {
      kind: "confirm_task";
      projectId: string;
      taskId: string;
      projectTitle: string;
      taskTitle: string;
      completerName: string;
      createdAt: number;
    }
  | {
      kind: "task_check_in";
      projectId: string;
      taskId: string;
      projectTitle: string;
      taskTitle: string;
      daysSinceClaim: number;
      /** Cursor for sort — the moment the prompt became due
       *  (claim time or last ack, whichever's later). */
      createdAt: number;
    };

export interface AttentionInput {
  currentMember: Pick<Member, "publicKey"> | null;
  posts: readonly Post[];
  projects: readonly Project[];
  projectTasks: readonly ProjectTask[];
  members: readonly Member[];
  /** Per-node thresholds for the private "still on it?" nudge.
   *  Optional so the `task_check_in` items just don't surface
   *  when the caller can't supply config (tests, edge cases). */
  config?: Pick<NodeConfig, "taskCheckInDays" | "taskNeedsHelpDays">;
  now?: number;
}

export function computeAttentionItems(
  input: AttentionInput,
): AttentionItem[] {
  const { currentMember, posts, projects, projectTasks, members } = input;
  if (!currentMember) return [];

  const nameByKey = new Map<string, string>();
  for (const m of members) nameByKey.set(m.publicKey, m.displayName);

  const items: AttentionItem[] = [];

  // Exchanges waiting for the current member's confirmation. A post
  // in `awaiting_confirmation` has one party's signature on file via
  // `confirmedBy`; the other party still needs to sign for credits
  // to transfer.
  for (const p of posts) {
    if (p.status !== "awaiting_confirmation") continue;
    if (p.postedBy !== currentMember.publicKey && p.claimedBy !== currentMember.publicKey) {
      continue;
    }
    if (p.confirmedBy.includes(currentMember.publicKey)) continue;

    // Whoever isn't me is the counterparty.
    const counterpartyKey =
      p.postedBy === currentMember.publicKey ? p.claimedBy : p.postedBy;
    const counterpartyName =
      (counterpartyKey && nameByKey.get(counterpartyKey)) ??
      "another community member";

    items.push({
      kind: "confirm_exchange",
      postId: p.id,
      postTitle: p.title,
      counterpartyName,
      createdAt: p.createdAt,
    });
  }

  // Project tasks the current member is the organizer of, which the
  // helper has marked complete and which still need the organizer's
  // confirmation. (Self-confirmation is rejected in
  // confirmProjectTaskCompletion; if completedBy === organizerKey
  // the task can't be confirmed by the same member, so it's not
  // really "needs my attention" — it needs another project member.)
  const projectByKey = new Map<string, Project>();
  for (const p of projects) projectByKey.set(p.id, p);

  for (const t of projectTasks) {
    if (t.status !== "awaiting_confirmation") continue;
    const project = projectByKey.get(t.projectId);
    if (!project) continue;
    if (project.organizerKey !== currentMember.publicKey) continue;
    if (t.completedBy === currentMember.publicKey) continue;

    const completerName =
      (t.completedBy && nameByKey.get(t.completedBy)) ??
      "another community member";

    items.push({
      kind: "confirm_task",
      projectId: project.id,
      taskId: t.id,
      projectTitle: project.title,
      taskTitle: t.title,
      completerName,
      createdAt: t.createdAt,
    });
  }

  // Private "still on it?" nudge — only surfaces to the claimer
  // when the task is `check_in_due` (past the private threshold
  // but not yet at the public "could use more hands" point). At
  // `needs_more_hands` the community-visible chip on the project
  // page is doing the work, so we don't double-up here.
  if (input.config) {
    for (const t of projectTasks) {
      if (t.assignedTo !== currentMember.publicKey) continue;
      const staleness = taskStaleness(t, input.config, input.now);
      if (staleness !== "check_in_due") continue;
      const project = projectByKey.get(t.projectId);
      if (!project) continue;
      // Use the moment the prompt actually became due (claim or
      // last ack, whichever's later) as the sort cursor so the
      // oldest-pending-nudge surfaces first.
      const anchor = Math.max(
        t.claimedAt ?? 0,
        t.checkInAcknowledgedAt ?? 0,
      );
      items.push({
        kind: "task_check_in",
        projectId: project.id,
        taskId: t.id,
        projectTitle: project.title,
        taskTitle: t.title,
        daysSinceClaim: daysSinceClaimHelper(t, input.now),
        createdAt: anchor,
      });
    }
  }

  // Newest items first. createdAt is the right cursor because all
  // record types use it for ordering elsewhere; using "moment the
  // first confirmation happened" would be more accurate but we
  // don't persist that timestamp.
  items.sort((a, b) => b.createdAt - a.createdAt);

  return items;
}
