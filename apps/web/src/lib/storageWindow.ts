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
import { db, getSetting, setSetting, SETTING_KEYS } from "@/db/database";
import type { Post, Project } from "@/types";

/*
 * Storage windowing — docs/storage-budget.md Phase 1.
 *
 * A constrained device keeps a time window of the shared history plus
 * a pinned working set, and locally deletes old SETTLED records. Two
 * halves, both here:
 *
 *   - the compaction walker (previewWindow/applyWindow): what an
 *     explicit member choice deletes, re-run on a slow schedule so
 *     records that age past the horizon later also compact;
 *   - the merge-time admission guard (windowAdmits): what a
 *     federation pull refuses to (re-)insert. Cursors are NOT the
 *     correctness mechanism — mirror failover and node moves start
 *     from cursor zero and would resurrect everything windowed out.
 *
 * Classification is total: every Dexie table belongs to exactly one
 * of the three sets below, and a drift-guard test fails the build the
 * moment a new table ships unclassified.
 *
 * Two windowable tables (projectActivity, eventProjectLinks) are
 * LOCAL-ONLY: they never federate, so once deleted they cannot be
 * re-downloaded by the undo path. They are therefore deleted only as
 * children of a windowed parent (never by their own age) — an orphan
 * row without its project/event is meaningless anyway — and the undo
 * copy is honest that activity logs of long-closed projects do not
 * come back.
 */

/** Tables windowing never touches: per-device, private, or identity. */
export const WINDOW_LOCAL_TABLES = [
  "settings",
  "secretKeys",
  "outbox",
  "drafts",
  "invites",
  "pairingLog",
  "achievements",
  "messages",
  "blocks",
  "previouslyBlocked",
  "guardianShards",
  "nodeConfig",
  // Private task plans (db/taskPlans.ts): a member's own step
  // breakdowns + planned days. Tiny (one row per claimed task the
  // member chose to plan), never re-downloadable, and active by
  // definition — the walker has no business in them.
  "taskPlans",
  // Pilot journal (db/journal.ts): the member's own local feedback
  // notes. Tiny free text, never re-downloadable, and the member's
  // working record — the walker never evicts it.
  "journalEntries",
] as const;

/**
 * Shared state kept in full on every device forever. The roster and
 * membership layer are load-bearing for verification/read-auth/
 * re-seed; exchanges and vouches ARE the ledger and the trust graph
 * (windowing them would change what the numbers mean); proposals,
 * votes, and closures are the community's governance history; a
 * co-organizer revocation must outlive its project.
 */
export const WINDOW_PINNED_TABLES = [
  "members",
  "redemptionReceipts",
  "inviteRevocationRecords",
  "exchanges",
  "vouches",
  // The archive-role claims themselves (docs/storage-budget.md Phase
  // 2) — tiny, and the coverage signal windowing is honest about.
  "seedVaultPledges",
  // Quorum governance records (docs/member-removal.md) — standing
  // derivation needs the full history; tiny by construction.
  "memberRemovals",
  "memberReinstatements",
  "proposals",
  "votes",
  "proposalClosures",
  "coorgInvitationRevocations",
] as const;

/** Tables the walker may delete from (subject to the pin rules). */
export const WINDOW_WINDOWABLE_TABLES = [
  "posts",
  "events",
  "eventRsvps",
  "eventCancellations",
  "eventShifts",
  "shiftSignups",
  "eventProjectLinks",
  "projects",
  "projectTasks",
  "projectActivity",
  "taskComments",
  "coorgInvitations",
  "coorgInvitationResponses",
] as const;

/** Horizon setting: duration in ms; absent = this device is unwindowed. */
export const WINDOW_HORIZON_KEY = "storageWindowHorizonMs";
const LAST_COMPACTION_KEY = "storageWindowLastCompactionAt";

export const YEAR_MS = 365 * 24 * 60 * 60 * 1000;
/** Offered horizons: keep 1 year / keep 2 years. */
export const WINDOW_HORIZON_CHOICES = [YEAR_MS, 2 * YEAR_MS] as const;
/** Re-run compaction at most daily (piggybacked on the outbox tick). */
const COMPACTION_INTERVAL_MS = 24 * 60 * 60 * 1000;

/** Cursor settings that must reset for a full re-download (undo).
 *  Matches the base keys plus every per-mirror `::<urlHash>` variant. */
const CURSOR_KEY_RE = /^federationLast.*Pull(::[0-9a-f]+)?$/;

export async function getWindowHorizonMs(): Promise<number | null> {
  const raw = await getSetting(WINDOW_HORIZON_KEY);
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
}

async function currentMemberKey(): Promise<string | null> {
  return (await getSetting(SETTING_KEYS.currentMember)) ?? null;
}

/* ------------------------------------------------------------------ */
/* Settledness predicates — shared by the walker and the merge guard  */
/* so a record the walker would delete is exactly a record the guard  */
/* refuses to re-insert.                                              */
/* ------------------------------------------------------------------ */

const SETTLED_POST_STATUSES = new Set(["completed", "cancelled"]);

/** A post the window drops: settled (or long-expired while open),
 *  older than the cutoff, and not this member's. */
function postIsWindowed(post: Post, cutoff: number, me: string | null): boolean {
  if (post.postedBy === me || post.claimedBy === me) return false;
  const settled =
    SETTLED_POST_STATUSES.has(post.status) ||
    (post.status === "open" && post.expiresAt !== null && post.expiresAt < cutoff);
  return settled && post.createdAt < cutoff;
}

interface EventLike {
  id: string;
  createdBy: string;
  startsAt: number;
  endsAt: number | null;
}

/** Liveness checks an event needs beyond its own fields: my
 *  participation pins it, and a RECENT cancellation is recent
 *  activity (its tombstone must keep suppressing the event). */
async function eventIsWindowed(
  event: EventLike,
  cutoff: number,
  me: string | null,
): Promise<boolean> {
  if (event.createdBy === me) return false;
  const end = event.endsAt ?? event.startsAt;
  if (end >= cutoff) return false;
  if (me) {
    const [rsvps, signups] = await Promise.all([
      db.eventRsvps.where("[eventId+memberKey]").equals([event.id, me]).count(),
      db.shiftSignups.where("[eventId+memberKey]").equals([event.id, me]).count(),
    ]);
    if (rsvps > 0 || signups > 0) return false;
  }
  const recentCancellation = await db.eventCancellations
    .where("eventId")
    .equals(event.id)
    .filter((c) => c.cancelledAt >= cutoff)
    .count();
  return recentCancellation === 0;
}

const SETTLED_PROJECT_STATUSES = new Set(["completed", "archived"]);

async function projectIsWindowed(
  project: Project,
  cutoff: number,
  me: string | null,
): Promise<boolean> {
  if (!SETTLED_PROJECT_STATUSES.has(project.status)) return false;
  if (me && (project.organizerKey === me || project.coOrganizerKeys.includes(me)))
    return false;
  const updatedAt = (project as { updatedAt?: number }).updatedAt ?? 0;
  const age = Math.max(project.completedAt ?? 0, project.createdAt, updatedAt);
  if (age >= cutoff) return false;
  if (me) {
    const [myTasks, myComments] = await Promise.all([
      db.projectTasks
        .where("projectId")
        .equals(project.id)
        .filter((t) => t.assignedTo === me || t.completedBy === me)
        .count(),
      db.taskComments
        .where("projectId")
        .equals(project.id)
        .filter((c) => c.authorKey === me)
        .count(),
    ]);
    if (myTasks > 0 || myComments > 0) return false;
  }
  return true;
}

/* ------------------------------------------------------------------ */
/* The walker                                                          */
/* ------------------------------------------------------------------ */

export interface WindowPlan {
  cutoff: number;
  posts: string[];
  events: string[];
  eventRsvps: string[];
  eventCancellations: string[];
  eventShifts: string[];
  shiftSignups: string[];
  eventProjectLinks: string[];
  projects: string[];
  projectTasks: string[];
  projectActivity: string[];
  taskComments: string[];
  coorgInvitations: string[];
  coorgInvitationResponses: string[];
}

export interface WindowPreview {
  posts: number;
  events: number;
  projects: number;
  other: number;
  total: number;
}

/** Compute what a window at `horizonMs` would delete, referents and
 *  children together (subtree rule: children go with their parent,
 *  never before it, never without it). Pure read — used by the
 *  preview screen and by applyWindow. */
export async function collectWindowPlan(horizonMs: number): Promise<WindowPlan> {
  const cutoff = Date.now() - horizonMs;
  const me = await currentMemberKey();
  const plan: WindowPlan = {
    cutoff,
    posts: [],
    events: [],
    eventRsvps: [],
    eventCancellations: [],
    eventShifts: [],
    shiftSignups: [],
    eventProjectLinks: [],
    projects: [],
    projectTasks: [],
    projectActivity: [],
    taskComments: [],
    coorgInvitations: [],
    coorgInvitationResponses: [],
  };

  await db.posts.each((post) => {
    if (postIsWindowed(post, cutoff, me)) plan.posts.push(post.id);
  });

  const allEvents = await db.events.toArray();
  for (const event of allEvents) {
    if (await eventIsWindowed(event, cutoff, me)) plan.events.push(event.id);
  }
  for (const eventId of plan.events) {
    const [rsvps, cancels, shifts, signups, links] = await Promise.all([
      db.eventRsvps.where("eventId").equals(eventId).primaryKeys(),
      db.eventCancellations.where("eventId").equals(eventId).primaryKeys(),
      db.eventShifts.where("eventId").equals(eventId).primaryKeys(),
      db.shiftSignups.where("eventId").equals(eventId).primaryKeys(),
      db.eventProjectLinks.where("eventId").equals(eventId).primaryKeys(),
    ]);
    plan.eventRsvps.push(...(rsvps as string[]));
    plan.eventCancellations.push(...(cancels as string[]));
    plan.eventShifts.push(...(shifts as string[]));
    plan.shiftSignups.push(...(signups as string[]));
    plan.eventProjectLinks.push(...(links as string[]));
  }

  const allProjects = await db.projects.toArray();
  for (const project of allProjects) {
    if (await projectIsWindowed(project, cutoff, me))
      plan.projects.push(project.id);
  }
  const linkSet = new Set(plan.eventProjectLinks);
  for (const projectId of plan.projects) {
    const [tasks, activity, comments, invitations, links] = await Promise.all([
      db.projectTasks.where("projectId").equals(projectId).primaryKeys(),
      db.projectActivity.where("projectId").equals(projectId).primaryKeys(),
      db.taskComments.where("projectId").equals(projectId).primaryKeys(),
      db.coorgInvitations.where("projectId").equals(projectId).primaryKeys(),
      db.eventProjectLinks.where("projectId").equals(projectId).primaryKeys(),
    ]);
    plan.projectTasks.push(...(tasks as string[]));
    plan.projectActivity.push(...(activity as string[]));
    plan.taskComments.push(...(comments as string[]));
    plan.coorgInvitations.push(...(invitations as string[]));
    for (const linkId of links as string[]) {
      if (!linkSet.has(linkId)) {
        linkSet.add(linkId);
        plan.eventProjectLinks.push(linkId);
      }
    }
    for (const invitationId of invitations as string[]) {
      const responses = await db.coorgInvitationResponses
        .where("invitationId")
        .equals(invitationId)
        .primaryKeys();
      plan.coorgInvitationResponses.push(...(responses as string[]));
    }
  }

  return plan;
}

export function planToPreview(plan: WindowPlan): WindowPreview {
  const other =
    plan.eventRsvps.length +
    plan.eventCancellations.length +
    plan.eventShifts.length +
    plan.shiftSignups.length +
    plan.eventProjectLinks.length +
    plan.projectTasks.length +
    plan.projectActivity.length +
    plan.taskComments.length +
    plan.coorgInvitations.length +
    plan.coorgInvitationResponses.length;
  const total = plan.posts.length + plan.events.length + plan.projects.length + other;
  return {
    posts: plan.posts.length,
    events: plan.events.length,
    projects: plan.projects.length,
    other,
    total,
  };
}

/** Apply a window: persist the horizon, then delete the plan's rows.
 *  Local deletes only — every record remains on the node and on every
 *  unwindowed device. Idempotent; a re-run recomputes and deletes
 *  whatever has aged past the horizon since. Returns the count. */
export async function applyWindow(horizonMs: number): Promise<number> {
  const plan = await collectWindowPlan(horizonMs);
  await setSetting(WINDOW_HORIZON_KEY, String(horizonMs));
  const total = planToPreview(plan).total;
  await db.transaction(
    "rw",
    [
      db.posts,
      db.events,
      db.eventRsvps,
      db.eventCancellations,
      db.eventShifts,
      db.shiftSignups,
      db.eventProjectLinks,
      db.projects,
      db.projectTasks,
      db.projectActivity,
      db.taskComments,
      db.coorgInvitations,
      db.coorgInvitationResponses,
    ],
    async () => {
      // Children before parents so an interrupted transaction can
      // never leave orphans of a deleted parent (Dexie transactions
      // are atomic anyway; the ordering is belt-and-braces).
      await db.eventRsvps.bulkDelete(plan.eventRsvps);
      await db.eventCancellations.bulkDelete(plan.eventCancellations);
      await db.shiftSignups.bulkDelete(plan.shiftSignups);
      await db.eventShifts.bulkDelete(plan.eventShifts);
      await db.eventProjectLinks.bulkDelete(plan.eventProjectLinks);
      await db.taskComments.bulkDelete(plan.taskComments);
      await db.projectActivity.bulkDelete(plan.projectActivity);
      await db.coorgInvitationResponses.bulkDelete(plan.coorgInvitationResponses);
      await db.coorgInvitations.bulkDelete(plan.coorgInvitations);
      await db.projectTasks.bulkDelete(plan.projectTasks);
      await db.projects.bulkDelete(plan.projects);
      await db.events.bulkDelete(plan.events);
      await db.posts.bulkDelete(plan.posts);
    },
  );
  await setSetting(LAST_COMPACTION_KEY, String(Date.now()));
  return total;
}

/** Undo: clear the horizon and reset every federation pull cursor
 *  (primary and all `::<urlHash>` mirror variants) so the device
 *  re-downloads the full history from its node. The node still holds
 *  everything federated; what does NOT come back is the local-only
 *  children of windowed parents (project activity, event↔project
 *  links) — the UI copy says so. */
export async function undoWindowing(): Promise<void> {
  await db.settings.delete(WINDOW_HORIZON_KEY);
  await db.settings.delete(LAST_COMPACTION_KEY);
  const keys = (await db.settings.toCollection().primaryKeys()) as string[];
  const cursorKeys = keys.filter((k) => CURSOR_KEY_RE.test(k));
  await db.settings.bulkDelete(cursorKeys);
}

/** Piggybacked on the outbox worker tick: re-compact at most daily so
 *  records that age past the horizon keep compacting without the
 *  member doing anything. No-op on unwindowed devices. */
export async function maybeCompactWindow(now = Date.now()): Promise<void> {
  const horizon = await getWindowHorizonMs();
  if (horizon === null) return;
  const last = Number((await getSetting(LAST_COMPACTION_KEY)) ?? 0);
  if (Number.isFinite(last) && now - last < COMPACTION_INTERVAL_MS) return;
  await applyWindow(horizon);
}

/* ------------------------------------------------------------------ */
/* The merge-time admission guard                                      */
/* ------------------------------------------------------------------ */

export type WindowGuardKind =
  | "post"
  | "event"
  | "event_cancellation"
  | "event_child"
  | "project"
  | "project_child"
  | "coorg";

/**
 * May this pulled record enter the local database? Always true on an
 * unwindowed device. On a windowed device the answer mirrors the
 * walker: records the walker would delete are refused, so a mirror
 * failover / node move (fresh cursors, full re-pull) cannot resurrect
 * the archive.
 *
 * Child kinds ("event_child", "project_child", "coorg") are refused
 * only when their parent is locally absent AND the record itself is
 * older than the cutoff — a fresh child whose parent simply hasn't
 * arrived yet keeps the pull's existing skip-without-advancing
 * semantics (the caller distinguishes the two cases). A refused
 * record must ADVANCE the cursor: it is settled-old, not deferred.
 */
export async function windowAdmits(
  kind: WindowGuardKind,
  record: {
    id?: string;
    ageAt: number;
    post?: Post;
    event?: EventLike;
    project?: Project;
    parentPresent?: boolean;
  },
): Promise<boolean> {
  const horizon = await getWindowHorizonMs();
  if (horizon === null) return true;
  const cutoff = Date.now() - horizon;
  const me = await currentMemberKey();
  switch (kind) {
    case "post":
      return record.post ? !postIsWindowed(record.post, cutoff, me) : true;
    case "event":
      return record.event
        ? !(await eventIsWindowed(record.event, cutoff, me))
        : true;
    case "event_cancellation":
      // A cancellation is admitted while its tombstone is still doing
      // convergence work (recent) or while its event is still here.
      return record.ageAt >= cutoff || record.parentPresent === true;
    case "event_child":
    case "project_child":
    case "coorg":
      if (record.parentPresent) return true;
      return record.ageAt >= cutoff;
    case "project":
      return record.project
        ? !(await projectIsWindowed(record.project, cutoff, me))
        : true;
  }
}
