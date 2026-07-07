/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  generateKeyPair,
  signStateRecord,
  type KeyPair,
} from "@understoria/shared/crypto";
import type { ProjectState, TaskState } from "@understoria/shared/types";
import type { Project, ProjectTask } from "@/types";
import { db, getSetting, setSetting, SETTING_KEYS } from "@/db/database";
import { persistSecretKey } from "@/db/secrets";
import {
  createProject,
  publishProjectState,
  publishTaskState,
} from "@/db/projects";
import {
  pullFederatedProjectStates,
  pullFederatedTaskStates,
} from "./federationSync";

const PROJECT_CURSOR = "federationLastProjectStatePull";
const TASK_CURSOR = "federationLastTaskStatePull";

async function reset() {
  await Promise.all([
    db.projects.clear(),
    db.projectTasks.clear(),
    db.projectActivity.clear(),
    db.outbox.clear(),
    db.settings.clear(),
    db.secretKeys.clear(),
  ]);
  await setSetting(SETTING_KEYS.communityNodeEnabled, "1");
  await setSetting(SETTING_KEYS.communityNodeUrl, "http://node.test");
}

function baseProject(organizer: KeyPair, id: string): Project {
  return {
    id,
    title: "Community fridge",
    description: "Keep it stocked.",
    category: "mutual_aid_drive",
    organizerKey: organizer.publicKey,
    coOrganizerKeys: [],
    status: "active",
    targetHours: 40,
    contributedHours: 0,
    deadline: null,
    createdAt: 1_000,
    completedAt: null,
    pauseNote: null,
    pausedAt: null,
    locationZone: "North side",
    tags: [],
    nodeId: "node_a",
    templateId: null,
  };
}

function signedProjectState(
  signer: KeyPair,
  project: Project,
  updatedAt: number,
  overrides: Partial<ProjectState> = {},
): ProjectState {
  const unsigned = {
    ...project,
    ...overrides,
    updatedAt,
    signerKey: signer.publicKey,
  };
  delete (unsigned as Partial<ProjectState>).signature;
  return {
    ...unsigned,
    signature: signStateRecord<ProjectState>(unsigned, signer.secretKey),
  } as ProjectState;
}

function baseTask(projectId: string, id: string): ProjectTask {
  return {
    id,
    projectId,
    title: "Wipe shelves",
    description: "",
    category: "mutual_aid_drive",
    estimatedHours: 1,
    urgency: "low",
    requiredSkills: [],
    assignedTo: null,
    status: "open",
    dependencies: [],
    orderIndex: 1000,
    createdAt: 1_000,
    completedAt: null,
    completedBy: null,
    actualHours: null,
    exchangeId: null,
    claimedAt: null,
    checkInAcknowledgedAt: null,
  };
}

function signedTaskState(
  signer: KeyPair,
  task: ProjectTask,
  updatedAt: number,
  overrides: Partial<TaskState> = {},
): TaskState {
  const unsigned = {
    ...task,
    ...overrides,
    updatedAt,
    signerKey: signer.publicKey,
  };
  delete (unsigned as Partial<TaskState>).signature;
  return {
    ...unsigned,
    signature: signStateRecord<TaskState>(unsigned, signer.secretKey),
  } as TaskState;
}

function stubPull(bodies: {
  projectStates?: unknown[];
  taskStates?: unknown[];
}) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation(async (url: string) => ({
      ok: true,
      json: async () =>
        String(url).includes("/task-states")
          ? { taskStates: bodies.taskStates ?? [] }
          : { projectStates: bodies.projectStates ?? [] },
    })),
  );
}

describe("pullFederatedProjectStates", () => {
  beforeEach(reset);
  afterEach(() => vi.unstubAllGlobals());

  it("inserts a self-organized genesis and advances the cursor", async () => {
    const org = generateKeyPair();
    const rec = signedProjectState(org, baseProject(org, "proj_1"), 5_000);
    stubPull({ projectStates: [rec] });
    const result = await pullFederatedProjectStates();
    expect(result).toEqual({ inserted: 1, skipped: 0 });
    expect(await db.projects.get("proj_1")).toMatchObject({
      title: "Community fridge",
    });
    expect(await getSetting(PROJECT_CURSOR)).toBe("5000");
  });

  it("refuses a genesis whose signer is not its organizer (cursor pinned)", async () => {
    const org = generateKeyPair();
    const impostor = generateKeyPair();
    const rec = signedProjectState(
      impostor,
      baseProject(org, "proj_2"),
      5_000,
    );
    stubPull({ projectStates: [rec] });
    const result = await pullFederatedProjectStates();
    expect(result).toEqual({ inserted: 0, skipped: 1 });
    expect(await db.projects.get("proj_2")).toBeUndefined();
    expect(await getSetting(PROJECT_CURSOR)).toBeUndefined();
  });

  it("applies newer authorized versions and keeps newer local ones (LWW)", async () => {
    const org = generateKeyPair();
    const project = baseProject(org, "proj_3");
    // Local copy stamped at t=4000.
    await db.projects.put({
      ...project,
      ...({ updatedAt: 4_000 } as Partial<ProjectState>),
    });

    // Stale remote (t=3000) is skipped but advances the cursor.
    stubPull({
      projectStates: [
        signedProjectState(org, project, 3_000, { status: "paused" }),
      ],
    });
    expect(await pullFederatedProjectStates()).toEqual({
      inserted: 0,
      skipped: 1,
    });
    expect((await db.projects.get("proj_3"))!.status).toBe("active");
    expect(await getSetting(PROJECT_CURSOR)).toBe("3000");

    // Newer remote (t=6000) wins.
    vi.unstubAllGlobals();
    stubPull({
      projectStates: [
        signedProjectState(org, project, 6_000, { status: "paused" }),
      ],
    });
    expect(await pullFederatedProjectStates()).toEqual({
      inserted: 1,
      skipped: 0,
    });
    expect((await db.projects.get("proj_3"))!.status).toBe("paused");
  });

  it("refuses an unauthorized update even when newer", async () => {
    const org = generateKeyPair();
    const rando = generateKeyPair();
    const project = baseProject(org, "proj_4");
    await db.projects.put(project);
    // Hostile write names itself organizer — checked against LOCAL row.
    stubPull({
      projectStates: [
        signedProjectState(rando, project, 9_000, {
          organizerKey: rando.publicKey,
        }),
      ],
    });
    expect(await pullFederatedProjectStates()).toEqual({
      inserted: 0,
      skipped: 1,
    });
    expect((await db.projects.get("proj_4"))!.organizerKey).toBe(
      org.publicKey,
    );
  });

  it("drops rows whose signature does not verify", async () => {
    const org = generateKeyPair();
    const rec = signedProjectState(org, baseProject(org, "proj_5"), 5_000);
    stubPull({ projectStates: [{ ...rec, title: "Tampered" }] });
    expect(await pullFederatedProjectStates()).toEqual({
      inserted: 0,
      skipped: 1,
    });
    expect(await db.projects.get("proj_5")).toBeUndefined();
  });
});

describe("pullFederatedTaskStates", () => {
  beforeEach(reset);
  afterEach(() => vi.unstubAllGlobals());

  it("holds tasks whose project is unknown (no cursor advance), then applies", async () => {
    const org = generateKeyPair();
    const project = baseProject(org, "proj_t1");
    const task = signedTaskState(org, baseTask("proj_t1", "task_1"), 5_000);

    stubPull({ taskStates: [task] });
    expect(await pullFederatedTaskStates()).toEqual({
      inserted: 0,
      skipped: 1,
    });
    expect(await getSetting(TASK_CURSOR)).toBeUndefined();

    await db.projects.put(project);
    expect(await pullFederatedTaskStates()).toEqual({
      inserted: 1,
      skipped: 0,
    });
    expect(await db.projectTasks.get("task_1")).toMatchObject({
      title: "Wipe shelves",
    });
    expect(await getSetting(TASK_CURSOR)).toBe("5000");
  });

  it("accepts a helper's claim of an open task, refuses a steal", async () => {
    const org = generateKeyPair();
    const helper = generateKeyPair();
    const thief = generateKeyPair();
    await db.projects.put(baseProject(org, "proj_t2"));
    const open = baseTask("proj_t2", "task_2");
    await db.projectTasks.put(open);

    const claim = signedTaskState(helper, open, 6_000, {
      assignedTo: helper.publicKey,
      status: "claimed",
    });
    stubPull({ taskStates: [claim] });
    expect(await pullFederatedTaskStates()).toEqual({
      inserted: 1,
      skipped: 0,
    });
    expect((await db.projectTasks.get("task_2"))!.assignedTo).toBe(
      helper.publicKey,
    );

    // A different member "claiming" the now-held task is refused
    // against the LOCAL row.
    vi.unstubAllGlobals();
    const steal = signedTaskState(thief, open, 7_000, {
      assignedTo: thief.publicKey,
      status: "claimed",
    });
    stubPull({ taskStates: [steal] });
    expect(await pullFederatedTaskStates()).toEqual({
      inserted: 0,
      skipped: 1,
    });
    expect((await db.projectTasks.get("task_2"))!.assignedTo).toBe(
      helper.publicKey,
    );
  });

  it("lets the organizer of the local project change anything", async () => {
    const org = generateKeyPair();
    const helper = generateKeyPair();
    await db.projects.put(baseProject(org, "proj_t3"));
    const held = {
      ...baseTask("proj_t3", "task_3"),
      assignedTo: helper.publicKey,
      status: "claimed" as const,
    };
    await db.projectTasks.put(held);

    const release = signedTaskState(org, held, 6_000, {
      assignedTo: null,
      status: "open",
    });
    stubPull({ taskStates: [release] });
    expect(await pullFederatedTaskStates()).toEqual({
      inserted: 1,
      skipped: 0,
    });
    expect((await db.projectTasks.get("task_3"))!.assignedTo).toBeNull();
  });
});

describe("publishProjectState / publishTaskState", () => {
  beforeEach(reset);
  afterEach(() => vi.unstubAllGlobals());

  it("stamps, signs, persists locally, and enqueues on mutation", async () => {
    const org = generateKeyPair();
    await persistSecretKey(org.publicKey, org.secretKey);
    const project = await createProject(
      org.publicKey,
      {
        title: "Tool library",
        description: "",
        category: "other",
        targetHours: 10,
        deadline: null,
        locationZone: "East",
        tags: [],
        templateId: null,
      },
      "node_a",
    );

    const row = (await db.projects.get(project.id)) as Project &
      Partial<ProjectState>;
    expect(row.signerKey).toBe(org.publicKey);
    expect(typeof row.updatedAt).toBe("number");
    expect(typeof row.signature).toBe("string");

    const outboxRows = await db.outbox
      .where("recordId")
      .equals(project.id)
      .toArray();
    expect(outboxRows).toHaveLength(1);
    expect(outboxRows[0].kind).toBe("project_state");
  });

  it("silently skips when this device doesn't hold the signer key", async () => {
    const org = generateKeyPair();
    // No persistSecretKey call — publish must no-op, not throw.
    const project = await createProject(
      org.publicKey,
      {
        title: "Tool library",
        description: "",
        category: "other",
        targetHours: 10,
        deadline: null,
        locationZone: "East",
        tags: [],
        templateId: null,
      },
      "node_a",
    );
    const row = (await db.projects.get(project.id)) as Project &
      Partial<ProjectState>;
    expect(row.signature).toBeUndefined();
    expect(await db.outbox.count()).toBe(0);
  });

  it("publishTaskState signs with the acting member's key", async () => {
    const org = generateKeyPair();
    const helper = generateKeyPair();
    await persistSecretKey(helper.publicKey, helper.secretKey);
    await db.projects.put(baseProject(org, "proj_p1"));
    await db.projectTasks.put({
      ...baseTask("proj_p1", "task_p1"),
      assignedTo: helper.publicKey,
      status: "claimed",
    });

    await publishTaskState("task_p1", helper.publicKey);
    const row = (await db.projectTasks.get("task_p1")) as ProjectTask &
      Partial<TaskState>;
    expect(row.signerKey).toBe(helper.publicKey);
    const outboxRows = await db.outbox
      .where("recordId")
      .equals("task_p1")
      .toArray();
    expect(outboxRows).toHaveLength(1);
    expect(outboxRows[0].kind).toBe("task_state");
  });

  it("re-publish replaces the pending outbox payload in place", async () => {
    const org = generateKeyPair();
    await persistSecretKey(org.publicKey, org.secretKey);
    await db.projects.put(baseProject(org, "proj_p2"));

    await publishProjectState("proj_p2", org.publicKey);
    await db.projects.update("proj_p2", { title: "Renamed" });
    await publishProjectState("proj_p2", org.publicKey);

    const outboxRows = await db.outbox
      .where("recordId")
      .equals("proj_p2")
      .toArray();
    expect(outboxRows).toHaveLength(1);
    expect(JSON.parse(outboxRows[0].payload).title).toBe("Renamed");
  });
});
