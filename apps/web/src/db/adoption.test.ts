/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  AdoptionError,
  executeAdoptionProposal,
  fileAdoptionProposal,
  lastOrganizerActivityAt,
  withdrawAdoptionAsPresent,
} from "./adoption";
import { db } from "./database";
import type { Project, ProjectActivity, ProjectActivityType } from "@/types";

const NODE = "node_adoption_test";
const PRIMARY = "primary-key";
const ADOPTEE = "adoptee-key";
const COORG = "coorg-key";
const DAY = 24 * 60 * 60 * 1000;

async function reset() {
  await Promise.all([
    db.proposals.clear(),
    db.projects.clear(),
    db.projectActivity.clear(),
    db.nodeConfig.clear(),
    db.settings.clear(),
  ]);
}

async function putProject(over: Partial<Project> = {}): Promise<Project> {
  const base: Project = {
    id: "proj-1",
    title: "Community Fridge",
    description: "",
    category: "infrastructure",
    organizerKey: PRIMARY,
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
    nodeId: NODE,
    templateId: null,
  };
  const project = { ...base, ...over };
  await db.projects.put(project);
  return project;
}

let activitySeq = 0;
async function putActivity(
  projectId: string,
  actorKey: string,
  createdAt: number,
  type: ProjectActivityType = "task_added",
) {
  const row: ProjectActivity = {
    id: `act-${activitySeq++}`,
    projectId,
    type,
    actorKey,
    data: {},
    createdAt,
    nodeId: NODE,
  };
  await db.projectActivity.put(row);
}

beforeEach(async () => {
  await reset();
  activitySeq = 0;
});

describe("lastOrganizerActivityAt", () => {
  it("returns the newest organizer-authored timestamp, ignoring other actors", async () => {
    await putActivity("proj-1", PRIMARY, 100);
    await putActivity("proj-1", PRIMARY, 300);
    await putActivity("proj-1", COORG, 500); // not the organizer
    expect(await lastOrganizerActivityAt("proj-1", PRIMARY)).toBe(300);
  });

  it("returns null when the organizer has logged nothing", async () => {
    await putActivity("proj-1", COORG, 500);
    expect(await lastOrganizerActivityAt("proj-1", PRIMARY)).toBeNull();
  });
});

describe("fileAdoptionProposal — guards", () => {
  const NOW = 1_000 * DAY;

  it("rejects an empty rationale", async () => {
    await putProject();
    await expect(
      fileAdoptionProposal({
        projectId: "proj-1",
        proposerKey: ADOPTEE,
        rationale: "   ",
        nodeId: NODE,
        now: NOW,
      }),
    ).rejects.toMatchObject({ code: "rationale_required" });
  });

  it("rejects when the organizer has been active within the quiet window (default 60d)", async () => {
    await putProject();
    await putActivity("proj-1", PRIMARY, NOW - 10 * DAY);
    await expect(
      fileAdoptionProposal({
        projectId: "proj-1",
        proposerKey: ADOPTEE,
        rationale: "I can keep this going",
        nodeId: NODE,
        now: NOW,
      }),
    ).rejects.toMatchObject({ code: "not_quiet" });
  });

  it("allows filing at exactly the quiet boundary", async () => {
    await putProject();
    await putActivity("proj-1", PRIMARY, NOW - 60 * DAY);
    const proposal = await fileAdoptionProposal({
      projectId: "proj-1",
      proposerKey: ADOPTEE,
      rationale: "I can keep this going",
      nodeId: NODE,
      now: NOW,
    });
    expect(proposal.category).toBe("project_adoption");
    expect(proposal.reversibilityTier).toBe("moderate");
  });

  it("allows filing when the organizer has never logged activity", async () => {
    await putProject();
    const proposal = await fileAdoptionProposal({
      projectId: "proj-1",
      proposerKey: ADOPTEE,
      rationale: "Picking this up",
      nodeId: NODE,
      now: NOW,
    });
    expect(proposal.status).toBe("open");
  });

  it("rejects an archived project", async () => {
    await putProject({ status: "archived" });
    await expect(
      fileAdoptionProposal({
        projectId: "proj-1",
        proposerKey: ADOPTEE,
        rationale: "x",
        nodeId: NODE,
        now: NOW,
      }),
    ).rejects.toMatchObject({ code: "project_archived" });
  });

  it("rejects the sitting primary filing on their own project (that's a handoff)", async () => {
    await putProject();
    await expect(
      fileAdoptionProposal({
        projectId: "proj-1",
        proposerKey: PRIMARY,
        rationale: "x",
        nodeId: NODE,
        now: NOW,
      }),
    ).rejects.toMatchObject({ code: "already_primary" });
  });

  it("rejects a second open adoption proposal for the same project", async () => {
    await putProject();
    await fileAdoptionProposal({
      projectId: "proj-1",
      proposerKey: ADOPTEE,
      rationale: "first",
      nodeId: NODE,
      now: NOW,
    });
    await expect(
      fileAdoptionProposal({
        projectId: "proj-1",
        proposerKey: COORG,
        rationale: "second",
        nodeId: NODE,
        now: NOW,
      }),
    ).rejects.toMatchObject({ code: "already_open" });
  });
});

describe("executeAdoptionProposal", () => {
  const T0 = 1_000 * DAY;

  async function fileOpen() {
    await putProject({ coOrganizerKeys: [COORG, ADOPTEE] });
    return fileAdoptionProposal({
      projectId: "proj-1",
      proposerKey: ADOPTEE,
      rationale: "Keeping the fridge alive",
      nodeId: NODE,
      now: T0,
    });
  }

  it("flips the primary, demotes the old primary, drops the adoptee from co-orgs, logs and closes passed", async () => {
    const proposal = await fileOpen();
    const result = await executeAdoptionProposal(
      proposal.id,
      COORG,
      T0 + 15 * DAY,
    );
    expect(result.kind).toBe("executed");

    const project = await db.projects.get("proj-1");
    expect(project?.organizerKey).toBe(ADOPTEE);
    // Old primary demoted in; adoptee removed; existing co-org kept.
    expect(new Set(project?.coOrganizerKeys)).toEqual(new Set([COORG, PRIMARY]));

    const activity = await db.projectActivity
      .where("projectId")
      .equals("proj-1")
      .toArray();
    const adopted = activity.find((a) => a.type === "adopted_by_community");
    expect(adopted?.data).toMatchObject({ fromKey: PRIMARY, toKey: ADOPTEE });

    const closed = await db.proposals.get(proposal.id);
    expect(closed?.status).toBe("passed");
  });

  it("refuses before the 14-day floor, even when invoked manually", async () => {
    const proposal = await fileOpen();
    await expect(
      executeAdoptionProposal(proposal.id, COORG, T0 + 13 * DAY),
    ).rejects.toMatchObject({ code: "too_soon" });
    // Project untouched.
    expect((await db.projects.get("proj-1"))?.organizerKey).toBe(PRIMARY);
  });

  it("voids (closes withdrawn, project untouched) when the sitting primary is active after filing", async () => {
    const proposal = await fileOpen();
    await putActivity("proj-1", PRIMARY, T0 + 1 * DAY); // returned and acted
    const result = await executeAdoptionProposal(
      proposal.id,
      COORG,
      T0 + 20 * DAY,
    );
    expect(result.kind).toBe("voided");
    expect((await db.projects.get("proj-1"))?.organizerKey).toBe(PRIMARY);
    expect((await db.proposals.get(proposal.id))?.status).toBe("withdrawn");
  });

  it("refuses when stewardship has changed since filing", async () => {
    const proposal = await fileOpen();
    // Someone else became primary in the meantime (e.g. a handoff).
    const project = await db.projects.get("proj-1");
    await db.projects.put({ ...project!, organizerKey: "third-party" });
    await expect(
      executeAdoptionProposal(proposal.id, COORG, T0 + 15 * DAY),
    ).rejects.toMatchObject({ code: "stewardship_changed" });
  });

  it("throws when executed a second time", async () => {
    const proposal = await fileOpen();
    await executeAdoptionProposal(proposal.id, COORG, T0 + 15 * DAY);
    await expect(
      executeAdoptionProposal(proposal.id, COORG, T0 + 16 * DAY),
    ).rejects.toMatchObject({ code: "already_closed" });
  });
});

describe("withdrawAdoptionAsPresent", () => {
  const T0 = 1_000 * DAY;

  it("lets the sitting primary close their own adoption proposal", async () => {
    await putProject();
    const proposal = await fileAdoptionProposal({
      projectId: "proj-1",
      proposerKey: ADOPTEE,
      rationale: "x",
      nodeId: NODE,
      now: T0,
    });
    const closed = await withdrawAdoptionAsPresent(proposal.id, PRIMARY);
    expect(closed.status).toBe("withdrawn");
  });

  it("rejects anyone who isn't the sitting primary", async () => {
    await putProject();
    const proposal = await fileAdoptionProposal({
      projectId: "proj-1",
      proposerKey: ADOPTEE,
      rationale: "x",
      nodeId: NODE,
      now: T0,
    });
    await expect(
      withdrawAdoptionAsPresent(proposal.id, COORG),
    ).rejects.toBeInstanceOf(AdoptionError);
    expect((await db.proposals.get(proposal.id))?.status).toBe("open");
  });
});
