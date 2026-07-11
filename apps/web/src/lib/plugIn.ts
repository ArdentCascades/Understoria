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
import type {
  Event,
  EventShiftRow,
  Post,
  Project,
  ProjectTask,
  ShiftSignupRow,
} from "@/types";

/*
 * "Ways to plug in" — the matcher behind the browsable shelf
 * (docs/ways-to-plug-in.md, adopted; rulings R1/R2/R4 in
 * docs/next-cycle-plans.md Plan 1 §8).
 *
 * Answers the member's actual question — "given what I can do,
 * what's open right now?" — as a LOCAL READ over rows the device
 * already holds. Nothing here is stored, logged, federated, or
 * exported; browsing stays browsing (§4).
 *
 * Matching is deliberately dumb (§5): case-folded token overlap
 * between the member's lens (their own OFFER posts' categories +
 * profile skills) and each item's category / requiredSkills / shift
 * label. No weights, no scores, no history. A smarter matcher would
 * need exactly the cross-member behavioral data this app refuses to
 * aggregate, and a visibly-dumb lens keeps the authority with the
 * member. The upgrade path, if pilot signal wants one, is better
 * member-edited tags — never behavioral inference.
 *
 * The §3.4 remainder is load-bearing: everything open that DIDN'T
 * match is still returned, because matching is a lens, not a gate —
 * a member may plug in anywhere.
 */

export interface ShelfShift {
  shift: EventShiftRow;
  event: Event;
  /** null = uncapped. */
  spotsOpen: number | null;
  /** The lens tokens this item overlapped (empty in the remainder). */
  matchedOn: string[];
}

export interface ShelfNeed {
  post: Post;
  matchedOn: string[];
}

export interface ShelfTask {
  task: ProjectTask;
  project: Project;
  /** Unmet in-project dependencies — soft block: rendered LAST with
   *  the standard "Follows:" framing, never hidden
   *  (docs/task-ordering-and-dependencies.md §3). */
  blockedByTitles: string[];
  matchedOn: string[];
}

export interface PlugInShelf {
  /** The member's lens, for honest display ("matched your
   *  'carpentry' tag") and for the add-skills-to-see-more line. */
  lensTokens: string[];
  matched: {
    shifts: ShelfShift[];
    needs: ShelfNeed[];
    tasks: ShelfTask[];
  };
  /** Everything else that's open — collapsed by default in the UI,
   *  never omitted (§3.4). */
  remainder: {
    shifts: ShelfShift[];
    needs: ShelfNeed[];
    tasks: ShelfTask[];
  };
}

export interface PlugInInputs {
  memberKey: string;
  /** Profile skills — free member-edited text. */
  skills: readonly string[];
  posts: readonly Post[];
  tasks: readonly ProjectTask[];
  projects: readonly Project[];
  events: readonly Event[];
  shifts: readonly EventShiftRow[];
  signups: readonly ShiftSignupRow[];
  now: number;
}

/** Case-folded token split on anything non-alphanumeric. The full
 *  lowercased string rides along too so multiword skills ("bike
 *  repair") and category ids ("skilled_labor") match either whole or
 *  by part. */
export function tokenize(...texts: readonly string[]): Set<string> {
  const out = new Set<string>();
  for (const text of texts) {
    const whole = text.trim().toLowerCase();
    if (!whole) continue;
    out.add(whole);
    for (const part of whole.split(/[^\p{L}\p{N}]+/u)) {
      if (part.length >= 3) out.add(part);
    }
  }
  return out;
}

function overlap(lens: ReadonlySet<string>, item: ReadonlySet<string>): string[] {
  const hits: string[] = [];
  for (const t of item) if (lens.has(t)) hits.push(t);
  return hits;
}

export function buildPlugInShelf(inputs: PlugInInputs): PlugInShelf {
  const {
    memberKey,
    skills,
    posts,
    tasks,
    projects,
    events,
    shifts,
    signups,
    now,
  } = inputs;

  // The lens: the member's own OFFER posts' categories + titles, plus
  // profile skills. Ruling R2: ship with what exists — offer
  // categories alone match usefully, and the shelf itself motivates
  // adding skills.
  const lensSources: string[] = [...skills];
  for (const p of posts) {
    if (p.type === "OFFER" && p.postedBy === memberKey && p.status === "open") {
      lensSources.push(p.category, p.title);
    }
  }
  const lens = tokenize(...lensSources);
  const lensTokens = [...lens].sort();

  // --- Shifts: upcoming, spots open, not mine, not my event -------
  const eventById = new Map(events.map((e) => [e.id, e]));
  const signupsByShift = new Map<string, ShiftSignupRow[]>();
  for (const s of signups) {
    const list = signupsByShift.get(s.shiftId) ?? [];
    list.push(s);
    signupsByShift.set(s.shiftId, list);
  }
  const matchedShifts: ShelfShift[] = [];
  const otherShifts: ShelfShift[] = [];
  for (const shift of shifts) {
    const event = eventById.get(shift.eventId);
    if (!event) continue;
    if (shift.startsAt <= now) continue;
    if (event.createdBy === memberKey) continue;
    const roster = signupsByShift.get(shift.id) ?? [];
    if (roster.some((r) => r.memberKey === memberKey)) continue;
    const spotsOpen =
      shift.capacity === null
        ? null
        : Math.max(0, shift.capacity - roster.length);
    if (spotsOpen !== null && spotsOpen === 0) continue;
    const matchedOn = overlap(
      lens,
      tokenize(shift.label, event.category, event.title),
    );
    const entry: ShelfShift = { shift, event, spotsOpen, matchedOn };
    (matchedOn.length > 0 ? matchedShifts : otherShifts).push(entry);
  }
  const byStart = (a: ShelfShift, b: ShelfShift) =>
    a.shift.startsAt - b.shift.startsAt;
  matchedShifts.sort(byStart);
  otherShifts.sort(byStart);

  // --- Needs: open NEED posts, not mine, not expired ---------------
  const urgencyRank = { high: 0, medium: 1, low: 2 } as const;
  const matchedNeeds: ShelfNeed[] = [];
  const otherNeeds: ShelfNeed[] = [];
  for (const post of posts) {
    if (post.type !== "NEED" || post.status !== "open") continue;
    if (post.postedBy === memberKey) continue;
    if (post.expiresAt !== null && post.expiresAt <= now) continue;
    const matchedOn = overlap(lens, tokenize(post.category, post.title));
    const entry: ShelfNeed = { post, matchedOn };
    (matchedOn.length > 0 ? matchedNeeds : otherNeeds).push(entry);
  }
  const byUrgency = (a: ShelfNeed, b: ShelfNeed) =>
    urgencyRank[a.post.urgency] !== urgencyRank[b.post.urgency]
      ? urgencyRank[a.post.urgency] - urgencyRank[b.post.urgency]
      : b.post.createdAt - a.post.createdAt;
  matchedNeeds.sort(byUrgency);
  otherNeeds.sort(byUrgency);

  // --- Tasks: open, in active projects, soft-block ordering ---------
  const projectById = new Map(projects.map((p) => [p.id, p]));
  const taskById = new Map(tasks.map((t) => [t.id, t]));
  const matchedTasks: ShelfTask[] = [];
  const otherTasks: ShelfTask[] = [];
  for (const task of tasks) {
    if (task.status !== "open") continue;
    const project = projectById.get(task.projectId);
    if (!project || project.status !== "active") continue;
    const blockedByTitles = task.dependencies
      .map((id) => taskById.get(id))
      .filter((dep): dep is ProjectTask => !!dep && dep.status !== "completed")
      .map((dep) => dep.title);
    const matchedOn = overlap(
      lens,
      tokenize(task.category, task.title, ...task.requiredSkills),
    );
    const entry: ShelfTask = { task, project, blockedByTitles, matchedOn };
    (matchedOn.length > 0 ? matchedTasks : otherTasks).push(entry);
  }
  // Dependency-blocked tasks render at the bottom (§3.3), workable
  // ones newest-last-touched... deliberately NOT: within each half we
  // keep the projects' own orderIndex, matching how the project page
  // reads.
  const byBlockThenOrder = (a: ShelfTask, b: ShelfTask) =>
    (a.blockedByTitles.length > 0 ? 1 : 0) -
      (b.blockedByTitles.length > 0 ? 1 : 0) ||
    a.task.orderIndex - b.task.orderIndex;
  matchedTasks.sort(byBlockThenOrder);
  otherTasks.sort(byBlockThenOrder);

  return {
    lensTokens,
    matched: { shifts: matchedShifts, needs: matchedNeeds, tasks: matchedTasks },
    remainder: { shifts: otherShifts, needs: otherNeeds, tasks: otherTasks },
  };
}
