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
import type { Post, Project, ProjectTask } from "@/types";

// "One small thing" — the antidote to choice paralysis. A board full
// of tabs, filters, and options is exactly the surface a low-energy
// day bounces off; deciding can cost more than doing. This selector
// gathers everything the viewer could act on right now and the card
// shows exactly ONE of them at a time.
//
// Deliberately NOT a recommender: there is no ranking, no scoring, no
// learning from behavior, no "because you liked…". Feasibility
// filters + a shuffle. `no-activity-search` stays intact — nothing
// here reads anyone's history, including the viewer's.

export interface SmallThing {
  kind: "task" | "post";
  id: string;
  title: string;
  /** Estimated hours (0 = unstated, posts always carry one). */
  hours: number;
  /** Route to the page where the claim affordance lives. */
  to: string;
  /** The project title (tasks) or a NEED framing (posts) — one line
   *  of orientation under the title. */
  contextTitle: string;
}

/**
 * Everything the viewer could pick up right now, smallest-first bias:
 * when any hour-sized items (≤ 1h) exist, only those are offered —
 * the card's whole promise is "bounded and finishable". Otherwise
 * every feasible item qualifies, so quiet communities still get a
 * pick.
 *
 * Feasible means claimable BY THIS VIEWER: open tasks in active
 * projects the viewer doesn't organize (organizers can't claim their
 * own tasks), and open NEEDs the viewer didn't post, with blocked
 * authors' posts dropped (same §6 discipline as every other surface).
 */
export function smallThingCandidates({
  memberKey,
  tasks,
  projects,
  posts,
  blockedKeys,
}: {
  memberKey: string;
  tasks: readonly ProjectTask[];
  projects: readonly Project[];
  posts: readonly Post[];
  blockedKeys: ReadonlySet<string>;
}): SmallThing[] {
  const projectById = new Map(projects.map((p) => [p.id, p]));
  const all: SmallThing[] = [];

  for (const task of tasks) {
    if (task.status !== "open") continue;
    const project = projectById.get(task.projectId);
    if (!project || project.status !== "active") continue;
    if (
      project.organizerKey === memberKey ||
      project.coOrganizerKeys.includes(memberKey)
    )
      continue;
    all.push({
      kind: "task",
      id: task.id,
      title: task.title,
      hours: task.estimatedHours,
      to: `/project/${task.projectId}/task/${task.id}`,
      contextTitle: project.title,
    });
  }

  for (const post of posts) {
    if (post.type !== "NEED" || post.status !== "open") continue;
    if (post.postedBy === memberKey) continue;
    if (blockedKeys.has(post.postedBy)) continue;
    all.push({
      kind: "post",
      id: post.id,
      title: post.title,
      hours: post.estimatedHours,
      to: `/post/${post.id}`,
      contextTitle: "",
    });
  }

  const hourSized = all.filter((c) => c.hours > 0 && c.hours <= 1);
  return hourSized.length > 0 ? hourSized : all;
}

/** Fisher–Yates over a copy — the card walks this order with "show me
 *  another". Plain Math.random: the pick is meant to be arbitrary. */
export function shuffleCandidates<T>(items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
