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
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runAutoConfirmSweep } from "./autoConfirmSweep";
import { db, setSetting, SETTING_KEYS } from "@/db/database";
import { createMember } from "@/db/seed";
import { createProject } from "@/db/projects";
import type { ProjectTask } from "@/types";

const NODE = "node_sweep_test";

async function reset() {
  await Promise.all([
    db.members.clear(),
    db.secretKeys.clear(),
    db.settings.clear(),
    db.projects.clear(),
    db.projectTasks.clear(),
    db.exchanges.clear(),
    db.outbox.clear(),
    db.nodeConfig.clear(),
  ]);
  // The sweep gates on a configured + enabled community node.
  await setSetting(SETTING_KEYS.communityNodeEnabled, "1");
  await setSetting(SETTING_KEYS.communityNodeUrl, "http://node.test");
}

async function awaitingTask(
  projectId: string,
  helperKey: string,
  overrides: Partial<ProjectTask> = {},
): Promise<ProjectTask> {
  const task: ProjectTask = {
    id: "task-sweep",
    projectId,
    title: "Paint",
    description: "",
    category: "transport",
    estimatedHours: 2,
    urgency: "low",
    requiredSkills: [],
    assignedTo: helperKey,
    status: "awaiting_confirmation",
    dependencies: [],
    orderIndex: 1000,
    createdAt: 0,
    // Marked done 200h ago — past the default 168h auto-confirm window
    // (and positive, since shouldAutoConfirm treats <= 0 as "no info").
    completedAt: Date.now() - 200 * 60 * 60 * 1000,
    completedBy: helperKey,
    actualHours: null,
    exchangeId: null,
    claimedAt: Date.now() - 220 * 60 * 60 * 1000,
    checkInAcknowledgedAt: null,
    ...overrides,
  };
  await db.projectTasks.put(task);
  return task;
}

/** Pulls the POSTed `requests[].payload.hours` out of the fetch body. */
function postedHours(fetchSpy: ReturnType<typeof vi.fn>): number {
  const body = JSON.parse(fetchSpy.mock.calls[0][1].body as string);
  return body.requests[0].payload.hours;
}

describe("runAutoConfirmSweep — task credit hours", () => {
  beforeEach(reset);
  afterEach(() => vi.unstubAllGlobals());

  it("signs the claimer-stated actual hours, not the estimate", async () => {
    const org = await createMember({ displayName: "Org" }, NODE);
    const helper = await createMember({ displayName: "Helper" }, NODE);
    const project = await createProject(
      org.publicKey,
      {
        title: "Fridge", description: "", category: "infrastructure",
        targetHours: 10, deadline: null, locationZone: "", tags: [],
        templateId: null,
      },
      NODE,
    );
    await awaitingTask(project.id, helper.publicKey, {
      estimatedHours: 2,
      actualHours: 6,
    });
    // Capture the POST and stop there (non-ok → sweep skips the rest;
    // we only care what was sent).
    const fetchSpy = vi.fn().mockResolvedValue({ ok: false });
    vi.stubGlobal("fetch", fetchSpy);

    await runAutoConfirmSweep(NODE);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(postedHours(fetchSpy)).toBe(6);
  });

  it("falls back to the estimate when actual hours were never stated", async () => {
    const org = await createMember({ displayName: "Org" }, NODE);
    const helper = await createMember({ displayName: "Helper" }, NODE);
    const project = await createProject(
      org.publicKey,
      {
        title: "Fridge", description: "", category: "infrastructure",
        targetHours: 10, deadline: null, locationZone: "", tags: [],
        templateId: null,
      },
      NODE,
    );
    await awaitingTask(project.id, helper.publicKey, {
      estimatedHours: 2,
      actualHours: null,
    });
    const fetchSpy = vi.fn().mockResolvedValue({ ok: false });
    vi.stubGlobal("fetch", fetchSpy);

    await runAutoConfirmSweep(NODE);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(postedHours(fetchSpy)).toBe(2);
  });
});
