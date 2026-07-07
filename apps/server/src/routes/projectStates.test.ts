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
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Database as DatabaseType } from "better-sqlite3-multiple-ciphers";
import type { FastifyInstance } from "fastify";
import {
  generateKeyPair,
  signStateRecord,
  type KeyPair,
} from "@understoria/shared/crypto";
import type { ProjectState, TaskState } from "@understoria/shared/types";
import { buildServer } from "../server.js";
import { readConfigFromEnv } from "../config.js";
import { openDatabase } from "../db.js";

let app: FastifyInstance;
let db: DatabaseType;

async function freshServer() {
  db = openDatabase(":memory:");
  const config = readConfigFromEnv({
    LOG_LEVEL: "fatal",
    NODE_ID: "node_test",
    RATE_LIMIT_MAX: "10000",
  } as NodeJS.ProcessEnv);
  const built = await buildServer({ config, database: db });
  app = built.app;
  await app.ready();
}

beforeEach(freshServer);
afterEach(async () => {
  await app.close();
  db.close();
});

let seq = 0;

function makeProjectState(
  signer: KeyPair,
  overrides: Partial<ProjectState> = {},
): ProjectState {
  const unsigned: Omit<ProjectState, "signature"> = {
    id: overrides.id ?? `proj_${++seq}`,
    title: "Community fridge",
    description: "Keep the fridge stocked and clean.",
    category: "mutual_aid_drive",
    organizerKey: signer.publicKey,
    coOrganizerKeys: [],
    status: "active",
    targetHours: 40,
    contributedHours: 0,
    deadline: null,
    createdAt: Date.now() - 60_000,
    completedAt: null,
    pauseNote: null,
    pausedAt: null,
    locationZone: "North side",
    tags: [],
    nodeId: "node_test",
    templateId: null,
    updatedAt: Date.now(),
    signerKey: signer.publicKey,
    ...overrides,
  };
  return {
    ...unsigned,
    signature:
      overrides.signature ??
      signStateRecord<ProjectState>(unsigned, signer.secretKey),
  };
}

function makeTaskState(
  signer: KeyPair,
  projectId: string,
  overrides: Partial<TaskState> = {},
): TaskState {
  const unsigned: Omit<TaskState, "signature"> = {
    id: overrides.id ?? `ptask_${++seq}`,
    projectId,
    title: "Wipe down shelves",
    description: "",
    category: "mutual_aid_drive",
    estimatedHours: 1,
    urgency: "medium",
    requiredSkills: [],
    assignedTo: null,
    status: "open",
    dependencies: [],
    orderIndex: 1000,
    createdAt: Date.now() - 60_000,
    completedAt: null,
    completedBy: null,
    actualHours: null,
    exchangeId: null,
    claimedAt: null,
    checkInAcknowledgedAt: null,
    updatedAt: Date.now(),
    signerKey: signer.publicKey,
    ...overrides,
  };
  return {
    ...unsigned,
    signature:
      overrides.signature ??
      signStateRecord<TaskState>(unsigned, signer.secretKey),
  };
}

async function post(url: string, payload: unknown) {
  return app.inject({ method: "POST", url, payload: payload as object });
}

describe("POST /project-states", () => {
  it("accepts a self-organized genesis (201) and serves it back", async () => {
    const org = generateKeyPair();
    const rec = makeProjectState(org);
    const res = await post("/project-states", rec);
    expect(res.statusCode).toBe(201);
    expect(res.json()).toEqual({ stored: true, id: rec.id });

    const listed = await app.inject({ method: "GET", url: "/project-states" });
    const body = listed.json() as { count: number; projectStates: ProjectState[] };
    expect(body.count).toBe(1);
    expect(body.projectStates[0]).toEqual(rec);
  });

  it("rejects a genesis not signed by its own organizer (403)", async () => {
    const org = generateKeyPair();
    const impostor = generateKeyPair();
    const rec = makeProjectState(impostor, { organizerKey: org.publicKey });
    const res = await post("/project-states", rec);
    expect(res.statusCode).toBe(403);
    expect(res.json().reason).toBe("genesis_not_organizer");
  });

  it("applies a strictly-newer organizer update (LWW)", async () => {
    const org = generateKeyPair();
    const v1 = makeProjectState(org, { updatedAt: 1_000 });
    await post("/project-states", v1);
    const v2 = makeProjectState(org, {
      id: v1.id,
      status: "paused",
      pauseNote: "winter break",
      updatedAt: 2_000,
    });
    const res = await post("/project-states", v2);
    expect(res.statusCode).toBe(201);

    const listed = await app.inject({ method: "GET", url: "/project-states" });
    const rows = (listed.json() as { projectStates: ProjectState[] })
      .projectStates;
    expect(rows).toHaveLength(1);
    expect(rows[0].status).toBe("paused");
    expect(rows[0].updatedAt).toBe(2_000);
  });

  it("answers 200 {stored:false} for a stale or equal updatedAt", async () => {
    const org = generateKeyPair();
    const v2 = makeProjectState(org, { updatedAt: 2_000 });
    await post("/project-states", v2);
    const stale = makeProjectState(org, {
      id: v2.id,
      status: "archived",
      updatedAt: 2_000,
    });
    const res = await post("/project-states", stale);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ stored: false, id: v2.id });

    const listed = await app.inject({ method: "GET", url: "/project-states" });
    expect(
      (listed.json() as { projectStates: ProjectState[] }).projectStates[0]
        .status,
    ).toBe("active");
  });

  it("rejects an update from a non-organizer even when newer (403)", async () => {
    const org = generateKeyPair();
    const rando = generateKeyPair();
    const v1 = makeProjectState(org, { updatedAt: 1_000 });
    await post("/project-states", v1);
    // The hostile write names itself organizer — authority is checked
    // against the STORED version, so it still fails.
    const attack = makeProjectState(rando, {
      id: v1.id,
      organizerKey: rando.publicKey,
      updatedAt: 2_000,
    });
    const res = await post("/project-states", attack);
    expect(res.statusCode).toBe(403);
    expect(res.json().reason).toBe("not_project_organizer");
  });

  it("accepts a co-organizer's update but not a co-organizer handoff", async () => {
    const org = generateKeyPair();
    const coorg = generateKeyPair();
    const v1 = makeProjectState(org, {
      coOrganizerKeys: [coorg.publicKey],
      updatedAt: 1_000,
    });
    await post("/project-states", v1);

    const edit = makeProjectState(coorg, {
      id: v1.id,
      organizerKey: org.publicKey,
      coOrganizerKeys: [coorg.publicKey],
      title: "Community fridge & pantry",
      updatedAt: 2_000,
    });
    expect((await post("/project-states", edit)).statusCode).toBe(201);

    const seize = makeProjectState(coorg, {
      id: v1.id,
      organizerKey: coorg.publicKey,
      coOrganizerKeys: [],
      updatedAt: 3_000,
    });
    const res = await post("/project-states", seize);
    expect(res.statusCode).toBe(403);
    expect(res.json().reason).toBe("handoff_not_organizer");
  });

  it("supports organizer handoff signed by the stored organizer", async () => {
    const org = generateKeyPair();
    const successor = generateKeyPair();
    const v1 = makeProjectState(org, { updatedAt: 1_000 });
    await post("/project-states", v1);

    const handoff = makeProjectState(org, {
      id: v1.id,
      organizerKey: successor.publicKey,
      updatedAt: 2_000,
    });
    expect((await post("/project-states", handoff)).statusCode).toBe(201);

    // Old organizer no longer has authority…
    const late = makeProjectState(org, {
      id: v1.id,
      organizerKey: org.publicKey,
      updatedAt: 3_000,
    });
    expect((await post("/project-states", late)).statusCode).toBe(403);

    // …and the successor does.
    const next = makeProjectState(successor, {
      id: v1.id,
      organizerKey: successor.publicKey,
      status: "completed",
      completedAt: Date.now(),
      updatedAt: 4_000,
    });
    expect((await post("/project-states", next)).statusCode).toBe(201);
  });

  it("rejects a tampered payload (422)", async () => {
    const org = generateKeyPair();
    const rec = makeProjectState(org);
    const res = await post("/project-states", {
      ...rec,
      title: "Vandalized title",
    });
    expect(res.statusCode).toBe(422);
  });

  it("rejects malformed bodies and far-future clocks (400)", async () => {
    expect((await post("/project-states", { id: "x" })).statusCode).toBe(400);
    const org = generateKeyPair();
    const future = makeProjectState(org, {
      updatedAt: Date.now() + 48 * 60 * 60 * 1000,
    });
    const res = await post("/project-states", future);
    expect(res.statusCode).toBe(400);
    expect(res.json().reason).toContain("updatedAt");
  });

  it("pages by the (updatedAt, id) composite cursor", async () => {
    const org = generateKeyPair();
    const a = makeProjectState(org, { id: "proj_a", updatedAt: 1_000 });
    const b = makeProjectState(org, { id: "proj_b", updatedAt: 2_000 });
    await post("/project-states", a);
    await post("/project-states", b);
    const res = await app.inject({
      method: "GET",
      url: "/project-states?since=1000&sinceId=proj_a",
    });
    const body = res.json() as { projectStates: ProjectState[] };
    expect(body.projectStates.map((p) => p.id)).toEqual(["proj_b"]);
  });
});

describe("POST /task-states", () => {
  async function seedProject(org: KeyPair): Promise<ProjectState> {
    const project = makeProjectState(org, { updatedAt: 1_000 });
    const res = await post("/project-states", project);
    expect(res.statusCode).toBe(201);
    return project;
  }

  it("rejects a task whose project is unknown (409, retryable)", async () => {
    const org = generateKeyPair();
    const task = makeTaskState(org, "proj_never_sent");
    const res = await post("/task-states", task);
    expect(res.statusCode).toBe(409);
    expect(res.json()).toEqual({
      error: "unknown_project",
      projectId: "proj_never_sent",
    });
  });

  it("lets the organizer create and edit tasks", async () => {
    const org = generateKeyPair();
    const project = await seedProject(org);
    const task = makeTaskState(org, project.id, { updatedAt: 2_000 });
    expect((await post("/task-states", task)).statusCode).toBe(201);

    const edit = makeTaskState(org, project.id, {
      id: task.id,
      title: "Wipe down shelves weekly",
      updatedAt: 3_000,
    });
    expect((await post("/task-states", edit)).statusCode).toBe(201);

    const listed = await app.inject({ method: "GET", url: "/task-states" });
    const rows = (listed.json() as { taskStates: TaskState[] }).taskStates;
    expect(rows).toHaveLength(1);
    expect(rows[0].title).toBe("Wipe down shelves weekly");
  });

  it("lets any member claim an OPEN task, and the claimer work it", async () => {
    const org = generateKeyPair();
    const helper = generateKeyPair();
    const project = await seedProject(org);
    const open = makeTaskState(org, project.id, { updatedAt: 2_000 });
    await post("/task-states", open);

    const claim = makeTaskState(helper, project.id, {
      id: open.id,
      assignedTo: helper.publicKey,
      status: "claimed",
      claimedAt: Date.now(),
      updatedAt: 3_000,
    });
    expect((await post("/task-states", claim)).statusCode).toBe(201);

    const complete = makeTaskState(helper, project.id, {
      id: open.id,
      assignedTo: helper.publicKey,
      status: "awaiting_confirmation",
      completedBy: helper.publicKey,
      actualHours: 2,
      updatedAt: 4_000,
    });
    expect((await post("/task-states", complete)).statusCode).toBe(201);

    const unclaim = makeTaskState(helper, project.id, {
      id: open.id,
      assignedTo: null,
      status: "open",
      updatedAt: 5_000,
    });
    expect((await post("/task-states", unclaim)).statusCode).toBe(201);
  });

  it("refuses a claim on a task someone else holds (403)", async () => {
    const org = generateKeyPair();
    const holder = generateKeyPair();
    const thief = generateKeyPair();
    const project = await seedProject(org);
    const claimed = makeTaskState(org, project.id, {
      assignedTo: holder.publicKey,
      status: "claimed",
      updatedAt: 2_000,
    });
    await post("/task-states", claimed);

    const steal = makeTaskState(thief, project.id, {
      id: claimed.id,
      assignedTo: thief.publicKey,
      status: "claimed",
      updatedAt: 3_000,
    });
    const res = await post("/task-states", steal);
    expect(res.statusCode).toBe(403);
    expect(res.json().reason).toBe("not_organizer_or_claimer");
  });

  it("refuses a non-claiming edit from a random member (403)", async () => {
    const org = generateKeyPair();
    const rando = generateKeyPair();
    const project = await seedProject(org);
    const open = makeTaskState(org, project.id, { updatedAt: 2_000 });
    await post("/task-states", open);

    // assignedTo stays null — not a claim, just vandalism.
    const edit = makeTaskState(rando, project.id, {
      id: open.id,
      title: "Defaced",
      updatedAt: 3_000,
    });
    expect((await post("/task-states", edit)).statusCode).toBe(403);
  });

  it("lets a co-organizer of the stored project change anything", async () => {
    const org = generateKeyPair();
    const coorg = generateKeyPair();
    const helper = generateKeyPair();
    const project = makeProjectState(org, {
      coOrganizerKeys: [coorg.publicKey],
      updatedAt: 1_000,
    });
    await post("/project-states", project);
    const claimed = makeTaskState(org, project.id, {
      assignedTo: helper.publicKey,
      status: "claimed",
      updatedAt: 2_000,
    });
    await post("/task-states", claimed);

    const release = makeTaskState(coorg, project.id, {
      id: claimed.id,
      assignedTo: null,
      status: "open",
      updatedAt: 3_000,
    });
    expect((await post("/task-states", release)).statusCode).toBe(201);
  });

  it("answers 200 {stored:false} for stale task versions", async () => {
    const org = generateKeyPair();
    const project = await seedProject(org);
    const task = makeTaskState(org, project.id, { updatedAt: 5_000 });
    await post("/task-states", task);
    const stale = makeTaskState(org, project.id, {
      id: task.id,
      title: "Old edit",
      updatedAt: 4_000,
    });
    const res = await post("/task-states", stale);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ stored: false, id: task.id });
  });

  it("rejects a tampered task payload (422)", async () => {
    const org = generateKeyPair();
    const project = await seedProject(org);
    const task = makeTaskState(org, project.id, { updatedAt: 2_000 });
    const res = await post("/task-states", {
      ...task,
      estimatedHours: 99,
    });
    expect(res.statusCode).toBe(422);
  });
});
