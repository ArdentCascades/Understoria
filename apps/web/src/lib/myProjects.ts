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
import { isOrganizer } from "@/db/projects";
import type {
  CoOrganizerInvitation,
  CoOrganizerInvitationResponse,
  CoOrganizerInvitationRevocation,
  Project,
  ProjectTask,
} from "@/types";

// Organizer-side twin of `myClaimedTasks` — "what am I stewarding, and
// what's waiting on me?", gathered from local rows so an organizer of
// several projects stops opening each page to reconstruct it.
//
// Scope decisions, each load-bearing:
//
// - SELF-ONLY. The caller passes the viewing member's own key; no UI
//   offers a "projects member X organizes" variant. A pure read over
//   local rows the member already holds; nothing crosses the wire
//   (`no-activity-search`).
//
// - Pull-only. Every count is work waiting on the VIEWER — tasks
//   awaiting their confirmation, open slots in their project,
//   invitations they issued — never a measure of member output, and
//   nothing feeds a badge or notification (`no-notifications`,
//   `no-leaderboards`).
//
// - AUTHORITY is `isOrganizer` over `Project.coOrganizerKeys` — the
//   live list materialized on every grant and removal (PR #238), the
//   same predicate every action gate reads (PR #NNN reconciled all
//   readers onto it). A rows-derived view would be wrong for an
//   authority-scoped inventory on both sides: it can't see a handoff
//   demotion (the demoted ex-primary's project would vanish from their
//   own workbench) and never forgets a step-down (a member who left
//   would keep an inventory they no longer steward).
//
// - This is a WORKBENCH, not a record of output. Archived projects
//   never appear (the archive page is their only entry point);
//   planning / active / paused always do; a completed project appears
//   ONLY while it still has a task awaiting the viewer's confirmation
//   (a loose end only their signature, or the sweep, can close). A
//   permanent "projects I organized" list would be organizer-output
//   display — completed work already lives on the Board and in history.
//
// - Blocked-party suppression mirrors the attention rail
//   (`docs/blocking.md` §6): the awaiting count skips a blocked
//   completer and the invitation count a blocked invitee, so the count
//   never claims work the rail honestly hides.

export interface OrganizedProject {
  project: Project;
  /** "primary" when the viewer is `organizerKey`, else "co". */
  role: "primary" | "co";
  /** This project's tasks — handed back so the page can compute the
   *  momentum chip (`computeProjectMomentum` joins them to exchanges)
   *  without a second filter pass. */
  tasks: ProjectTask[];
  openTaskCount: number;
  /** Tasks awaiting THIS member's confirmation — the same predicate the
   *  rail's `confirm_task` item uses (excludes self-completed and
   *  blocked completers). */
  awaitingYouCount: number;
  /** The first such task, so the card's awaiting line can deep-link
   *  straight to it (`/project/:id#task-:taskId` — ProjectDetail
   *  scrolls to and highlights the anchor). Null when none await. */
  firstAwaitingTaskId: string | null;
  /** Outstanding co-organizer invitations the viewer issued for this
   *  project (no response, no revocation, unexpired, invitee not
   *  blocked). Only ever > 0 for the primary, who alone can issue. */
  pendingInviteCount: number;
  /** Most recent task movement; the within-tier sort cursor. */
  lastActivityAt: number;
}

export interface MyOrganizedProjectsView {
  /** Tier 1: projects with a confirmation waiting on the viewer, then
   *  everything else; newest task movement first within each tier. */
  groups: OrganizedProject[];
  projectCount: number;
  awaitingYouTotal: number;
}

export interface MyOrganizedProjectsInput {
  memberKey: string;
  projects: readonly Project[];
  projectTasks: readonly ProjectTask[];
  coorgInvitations?: readonly CoOrganizerInvitation[];
  coorgInvitationResponses?: readonly CoOrganizerInvitationResponse[];
  coorgInvitationRevocations?: readonly CoOrganizerInvitationRevocation[];
  blockedKeys?: ReadonlySet<string>;
  now?: number;
}

export function myOrganizedProjects(
  input: MyOrganizedProjectsInput,
): MyOrganizedProjectsView {
  const { memberKey, projects, projectTasks } = input;
  const blockedKeys = input.blockedKeys ?? new Set<string>();
  const now = input.now ?? Date.now();

  // Bucket tasks by project once (O(tasks), not O(projects × tasks)).
  const tasksByProject = new Map<string, ProjectTask[]>();
  for (const t of projectTasks) {
    const list = tasksByProject.get(t.projectId);
    if (list) list.push(t);
    else tasksByProject.set(t.projectId, [t]);
  }

  // Outstanding invitations the viewer issued, counted per project —
  // the inviter-side mirror of the rail's invitee-side rule.
  const responded = new Set<string>();
  for (const r of input.coorgInvitationResponses ?? []) responded.add(r.invitationId);
  const revoked = new Set<string>();
  for (const r of input.coorgInvitationRevocations ?? []) revoked.add(r.invitationId);
  const pendingInvitesByProject = new Map<string, number>();
  for (const inv of input.coorgInvitations ?? []) {
    if (inv.inviterKey !== memberKey) continue;
    if (responded.has(inv.id)) continue;
    if (revoked.has(inv.id)) continue;
    if (now >= inv.expiresAt) continue;
    if (blockedKeys.has(inv.inviteeKey)) continue;
    pendingInvitesByProject.set(
      inv.projectId,
      (pendingInvitesByProject.get(inv.projectId) ?? 0) + 1,
    );
  }

  const groups: OrganizedProject[] = [];
  let awaitingYouTotal = 0;
  for (const project of projects) {
    if (project.status === "archived") continue;
    if (!isOrganizer(project, memberKey)) continue;
    const tasks = tasksByProject.get(project.id) ?? [];
    let openTaskCount = 0;
    let awaitingYouCount = 0;
    let firstAwaitingTaskId: string | null = null;
    let lastActivityAt = project.createdAt;
    for (const t of tasks) {
      if (t.status === "open") openTaskCount += 1;
      if (
        t.status === "awaiting_confirmation" &&
        t.completedBy !== memberKey &&
        !(t.completedBy && blockedKeys.has(t.completedBy))
      ) {
        awaitingYouCount += 1;
        if (firstAwaitingTaskId === null) firstAwaitingTaskId = t.id;
      }
      lastActivityAt = Math.max(
        lastActivityAt,
        t.createdAt,
        t.claimedAt ?? 0,
        t.completedAt ?? 0,
      );
    }
    // Completed projects drop off once nothing waits on the viewer.
    if (project.status === "completed" && awaitingYouCount === 0) continue;
    awaitingYouTotal += awaitingYouCount;
    groups.push({
      project,
      role: project.organizerKey === memberKey ? "primary" : "co",
      tasks,
      openTaskCount,
      awaitingYouCount,
      firstAwaitingTaskId,
      pendingInviteCount: pendingInvitesByProject.get(project.id) ?? 0,
      lastActivityAt,
    });
  }

  groups.sort((a, b) => {
    const aTier = a.awaitingYouCount > 0 ? 0 : 1;
    const bTier = b.awaitingYouCount > 0 ? 0 : 1;
    if (aTier !== bTier) return aTier - bTier;
    return b.lastActivityAt - a.lastActivityAt;
  });

  return { groups, projectCount: groups.length, awaitingYouTotal };
}
