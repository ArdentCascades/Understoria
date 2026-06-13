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
import { describe, expect, it } from "vitest";
import { myOrganizedProjects } from "./myProjects";
import type {
  CoOrganizerInvitation,
  CoOrganizerInvitationResponse,
  CoOrganizerInvitationRevocation,
  Project,
  ProjectTask,
} from "@/types";

const ME = "me-key";
const OTHER = "other-key";
const HELPER = "helper-key";

function makeProject(over: Partial<Project> & { id: string }): Project {
  const base: Project = {
    id: over.id,
    title: `Project ${over.id}`,
    description: "",
    category: "infrastructure",
    organizerKey: ME,
    coOrganizerKeys: [],
    status: "active",
    targetHours: 10,
    contributedHours: 0,
    deadline: null,
    createdAt: 0,
    completedAt: null,
    pauseNote: null,
    locationZone: "",
    tags: [],
    nodeId: "node-1",
    templateId: null,
  };
  return { ...base, ...over };
}

function makeTask(
  over: Partial<ProjectTask> & { id: string; projectId: string },
): ProjectTask {
  const base: ProjectTask = {
    id: over.id,
    projectId: over.projectId,
    title: `Task ${over.id}`,
    description: "",
    category: "infrastructure",
    estimatedHours: 1,
    urgency: "low",
    requiredSkills: [],
    assignedTo: null,
    status: "open",
    dependencies: [],
    orderIndex: 1000,
    createdAt: 0,
    completedAt: null,
    completedBy: null,
    exchangeId: null,
    claimedAt: null,
    actualHours: null,
    checkInAcknowledgedAt: null,
  };
  return { ...base, ...over };
}

function makeInvite(
  over: Partial<CoOrganizerInvitation> & { id: string; projectId: string },
): CoOrganizerInvitation {
  const base: CoOrganizerInvitation = {
    id: over.id,
    projectId: over.projectId,
    inviterKey: ME,
    inviteeKey: HELPER,
    createdAt: 0,
    expiresAt: 1_000_000,
    nodeId: "node-1",
    signature: "sig",
  };
  return { ...base, ...over };
}

function makeResponse(invitationId: string): CoOrganizerInvitationResponse {
  return {
    id: `resp-${invitationId}`,
    invitationId,
    inviteeKey: HELPER,
    decision: "accept",
    decidedAt: 10,
    nodeId: "node-1",
    signature: "sig",
  };
}

function makeRevocation(invitationId: string): CoOrganizerInvitationRevocation {
  return {
    id: `rev-${invitationId}`,
    invitationId,
    inviterKey: ME,
    revokedAt: 10,
    nodeId: "node-1",
    signature: "sig",
  };
}

describe("myOrganizedProjects", () => {
  it("returns an empty view when the member organizes nothing", () => {
    const view = myOrganizedProjects({
      memberKey: ME,
      projects: [makeProject({ id: "p1", organizerKey: OTHER })],
      projectTasks: [],
    });
    expect(view.groups).toEqual([]);
    expect(view.projectCount).toBe(0);
    expect(view.awaitingYouTotal).toBe(0);
  });

  it("includes projects the member organizes (primary) or co-organizes", () => {
    const projects = [
      makeProject({ id: "primary", organizerKey: ME }),
      makeProject({ id: "co", organizerKey: OTHER, coOrganizerKeys: [ME] }),
      makeProject({ id: "theirs", organizerKey: OTHER }),
    ];
    const view = myOrganizedProjects({ memberKey: ME, projects, projectTasks: [] });
    expect(view.projectCount).toBe(2);
    const byId = new Map(view.groups.map((g) => [g.project.id, g]));
    expect(byId.get("primary")?.role).toBe("primary");
    expect(byId.get("co")?.role).toBe("co");
    expect(byId.has("theirs")).toBe(false);
  });

  it("never shows archived projects (the archive page is their door)", () => {
    const projects = [makeProject({ id: "arch", status: "archived" })];
    const view = myOrganizedProjects({ memberKey: ME, projects, projectTasks: [] });
    expect(view.projectCount).toBe(0);
  });

  it("shows planning, active and paused projects regardless of activity", () => {
    const projects = [
      makeProject({ id: "plan", status: "planning" }),
      makeProject({ id: "act", status: "active" }),
      makeProject({ id: "pause", status: "paused" }),
    ];
    const view = myOrganizedProjects({ memberKey: ME, projects, projectTasks: [] });
    expect(view.projectCount).toBe(3);
  });

  it("drops a completed project once nothing awaits the viewer, but keeps it while a confirmation is pending", () => {
    const projects = [
      makeProject({ id: "doneClean", status: "completed" }),
      makeProject({ id: "doneOpen", status: "completed" }),
    ];
    const tasks = [
      // The loose end: a task on the completed project still awaiting
      // the viewer's signature keeps it on the workbench.
      makeTask({
        id: "loose",
        projectId: "doneOpen",
        status: "awaiting_confirmation",
        completedBy: HELPER,
      }),
    ];
    const view = myOrganizedProjects({ memberKey: ME, projects, projectTasks: tasks });
    expect(view.groups.map((g) => g.project.id)).toEqual(["doneOpen"]);
    expect(view.awaitingYouTotal).toBe(1);
  });

  it("counts open tasks and confirmations waiting on the viewer", () => {
    const projects = [makeProject({ id: "p1" })];
    const tasks = [
      makeTask({ id: "o1", projectId: "p1", status: "open" }),
      makeTask({ id: "o2", projectId: "p1", status: "open" }),
      makeTask({
        id: "wait",
        projectId: "p1",
        status: "awaiting_confirmation",
        completedBy: HELPER,
      }),
      // Claimed-but-not-done is neither open nor awaiting.
      makeTask({
        id: "claimed",
        projectId: "p1",
        status: "claimed",
        assignedTo: HELPER,
      }),
    ];
    const view = myOrganizedProjects({ memberKey: ME, projects, projectTasks: tasks });
    expect(view.groups[0].openTaskCount).toBe(2);
    expect(view.groups[0].awaitingYouCount).toBe(1);
  });

  it("excludes self-completed tasks from the awaiting count (you can't confirm your own)", () => {
    const projects = [makeProject({ id: "p1" })];
    const tasks = [
      makeTask({
        id: "mine",
        projectId: "p1",
        status: "awaiting_confirmation",
        completedBy: ME,
      }),
    ];
    const view = myOrganizedProjects({ memberKey: ME, projects, projectTasks: tasks });
    expect(view.groups[0].awaitingYouCount).toBe(0);
  });

  it("suppresses a blocked completer's awaiting task, mirroring the attention rail", () => {
    const projects = [makeProject({ id: "p1" })];
    const tasks = [
      makeTask({
        id: "blocked",
        projectId: "p1",
        status: "awaiting_confirmation",
        completedBy: OTHER,
      }),
      makeTask({
        id: "ok",
        projectId: "p1",
        status: "awaiting_confirmation",
        completedBy: HELPER,
      }),
    ];
    const view = myOrganizedProjects({
      memberKey: ME,
      projects,
      projectTasks: tasks,
      blockedKeys: new Set([OTHER]),
    });
    expect(view.groups[0].awaitingYouCount).toBe(1);
  });

  it("counts only the viewer's own outstanding co-organizer invitations", () => {
    const projects = [makeProject({ id: "p1" })];
    const invites = [
      makeInvite({ id: "i-open", projectId: "p1" }),
      // Already answered — not outstanding.
      makeInvite({ id: "i-answered", projectId: "p1", inviteeKey: "x" }),
      // Revoked — not outstanding.
      makeInvite({ id: "i-revoked", projectId: "p1", inviteeKey: "y" }),
      // Expired — not outstanding.
      makeInvite({ id: "i-expired", projectId: "p1", inviteeKey: "z", expiresAt: 5 }),
      // Issued by someone else — not the viewer's to track.
      makeInvite({ id: "i-theirs", projectId: "p1", inviterKey: OTHER, inviteeKey: "w" }),
    ];
    const view = myOrganizedProjects({
      memberKey: ME,
      projects,
      projectTasks: [],
      coorgInvitations: invites,
      coorgInvitationResponses: [makeResponse("i-answered")],
      coorgInvitationRevocations: [makeRevocation("i-revoked")],
      now: 100,
    });
    expect(view.groups[0].pendingInviteCount).toBe(1);
  });

  it("suppresses an invitation to a blocked invitee", () => {
    const projects = [makeProject({ id: "p1" })];
    const invites = [makeInvite({ id: "i1", projectId: "p1", inviteeKey: OTHER })];
    const view = myOrganizedProjects({
      memberKey: ME,
      projects,
      projectTasks: [],
      coorgInvitations: invites,
      blockedKeys: new Set([OTHER]),
      now: 100,
    });
    expect(view.groups[0].pendingInviteCount).toBe(0);
  });

  it("sorts projects awaiting the viewer ahead of the rest, newest activity first within each tier", () => {
    const projects = [
      makeProject({ id: "quiet-old", createdAt: 100 }),
      makeProject({ id: "quiet-new", createdAt: 900 }),
      makeProject({ id: "waiting", createdAt: 200 }),
    ];
    const tasks = [
      makeTask({
        id: "w",
        projectId: "waiting",
        status: "awaiting_confirmation",
        completedBy: HELPER,
        completedAt: 300,
      }),
    ];
    const view = myOrganizedProjects({ memberKey: ME, projects, projectTasks: tasks });
    // The waiting project leads even though its activity (300) is older
    // than quiet-new's createdAt (900) — tier beats recency.
    expect(view.groups.map((g) => g.project.id)).toEqual([
      "waiting",
      "quiet-new",
      "quiet-old",
    ]);
    expect(view.awaitingYouTotal).toBe(1);
  });
});
