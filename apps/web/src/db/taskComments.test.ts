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
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "./database";
import { createMember } from "./seed";
import {
  addProjectTask,
  archiveProject,
  completeProject,
  createProject,
  launchProject,
} from "./projects";
import {
  MAX_COMMENT_LENGTH,
  deleteTaskComment,
  flagTaskComment,
  listTaskComments,
  postTaskComment,
} from "./taskComments";
import { verifyTaskComment } from "@/lib/crypto";
import type { CommentDisputePayload } from "@/types";

const NODE = "node_taskcomments_test";

async function reset() {
  await Promise.all([
    db.members.clear(),
    db.posts.clear(),
    db.exchanges.clear(),
    db.achievements.clear(),
    db.settings.clear(),
    db.secretKeys.clear(),
    db.invites.clear(),
    db.vouches.clear(),
    db.outbox.clear(),
    db.projects.clear(),
    db.projectTasks.clear(),
    db.projectActivity.clear(),
    db.taskComments.clear(),
    db.proposals.clear(),
  ]);
}

async function setup() {
  const org = await createMember({ displayName: "Org" }, NODE);
  const project = await createProject(
    org.publicKey,
    {
      title: "Community garden",
      description: "—",
      category: "infrastructure",
      targetHours: 10,
      deadline: null,
      locationZone: "North",
      tags: [],
    },
    NODE,
  );
  const task = await addProjectTask(project.id, org.publicKey, {
    title: "Build raised bed",
    description: "—",
    category: "infrastructure",
    estimatedHours: 2,
    urgency: "low",
    requiredSkills: [],
    dependencies: [],
  });
  return { org, project, task };
}

describe("taskComments", () => {
  beforeEach(reset);

  it("posts a comment with a verifiable signature", async () => {
    const { org, project, task } = await setup();
    const c = await postTaskComment(task.id, "Started this today.", org.publicKey, NODE);
    expect(c.body).toBe("Started this today.");
    expect(c.taskId).toBe(task.id);
    expect(c.projectId).toBe(project.id);
    expect(c.authorKey).toBe(org.publicKey);
    expect(c.deletedAt).toBeNull();
    expect(c.signature.length).toBeGreaterThan(0);
    expect(verifyTaskComment(c)).toBe(true);
  });

  it("trims leading and trailing whitespace from the body", async () => {
    const { org, task } = await setup();
    const c = await postTaskComment(task.id, "   hi there   \n", org.publicKey, NODE);
    expect(c.body).toBe("hi there");
  });

  it("rejects an empty body", async () => {
    const { org, task } = await setup();
    await expect(
      postTaskComment(task.id, "   ", org.publicKey, NODE),
    ).rejects.toThrow(/required/);
  });

  it("rejects a body over the max length", async () => {
    const { org, task } = await setup();
    const tooLong = "x".repeat(MAX_COMMENT_LENGTH + 1);
    await expect(
      postTaskComment(task.id, tooLong, org.publicKey, NODE),
    ).rejects.toThrow(/too long/);
  });

  it("rejects a comment on a non-existent task", async () => {
    const { org } = await setup();
    await expect(
      postTaskComment("no-such-task", "hi", org.publicKey, NODE),
    ).rejects.toThrow(/Task not found/);
  });

  it("rejects a comment on an archived project", async () => {
    const { org, project, task } = await setup();
    // Archive requires the project to be completed first.
    await launchProject(project.id, org.publicKey);
    await completeProject(project.id, org.publicKey);
    await archiveProject(project.id, org.publicKey);
    await expect(
      postTaskComment(task.id, "late note", org.publicKey, NODE),
    ).rejects.toThrow(/archived/);
  });

  it("lists comments oldest-first", async () => {
    const { org, project, task } = await setup();
    const c1 = await postTaskComment(task.id, "first", org.publicKey, NODE);
    // Force the second comment to have a strictly later createdAt.
    await new Promise((r) => setTimeout(r, 2));
    const c2 = await postTaskComment(task.id, "second", org.publicKey, NODE);
    const list = await listTaskComments(project.id, task.id);
    expect(list.map((c) => c.id)).toEqual([c1.id, c2.id]);
  });

  it("scopes listTaskComments to the given task", async () => {
    const { org, project, task } = await setup();
    const otherTask = await addProjectTask(project.id, org.publicKey, {
      title: "Other",
      description: "",
      category: "infrastructure",
      estimatedHours: 1,
      urgency: "low",
      requiredSkills: [],
      dependencies: [],
    });
    await postTaskComment(task.id, "on first", org.publicKey, NODE);
    await postTaskComment(otherTask.id, "on second", org.publicKey, NODE);
    const list = await listTaskComments(project.id, task.id);
    expect(list).toHaveLength(1);
    expect(list[0].taskId).toBe(task.id);
  });

  it("lets the author soft-delete their own comment", async () => {
    const { org, project, task } = await setup();
    const c = await postTaskComment(task.id, "oops", org.publicKey, NODE);
    await deleteTaskComment(c.id, org.publicKey);
    const list = await listTaskComments(project.id, task.id);
    expect(list).toHaveLength(1);
    expect(list[0].deletedAt).not.toBeNull();
    expect(list[0].body).toBe("oops"); // body preserved for federation convergence
  });

  it("refuses delete by a non-author", async () => {
    const { org, task } = await setup();
    const other = await createMember({ displayName: "Other" }, NODE);
    const c = await postTaskComment(task.id, "mine", org.publicKey, NODE);
    await expect(deleteTaskComment(c.id, other.publicKey)).rejects.toThrow(
      /Only the author/,
    );
  });

  it("refuses double-delete", async () => {
    const { org, task } = await setup();
    const c = await postTaskComment(task.id, "x", org.publicKey, NODE);
    await deleteTaskComment(c.id, org.publicKey);
    await expect(deleteTaskComment(c.id, org.publicKey)).rejects.toThrow(
      /already deleted/,
    );
  });

  it("allows anyone (not just the organizer) to comment", async () => {
    const { task } = await setup();
    const stranger = await createMember({ displayName: "Stranger" }, NODE);
    const c = await postTaskComment(task.id, "happy to help", stranger.publicKey, NODE);
    expect(c.authorKey).toBe(stranger.publicKey);
  });

  it("flags a comment by creating a dispute proposal with the body snapshot", async () => {
    const { org, task } = await setup();
    const author = await createMember({ displayName: "Author" }, NODE);
    const c = await postTaskComment(task.id, "Something to flag", author.publicKey, NODE);
    const proposal = await flagTaskComment(c.id, org.publicKey, "spammy", NODE);
    expect(proposal.kind).toBe("dispute");
    expect(proposal.status).toBe("open");
    expect(proposal.proposerKey).toBe(org.publicKey);
    expect(proposal.description).toBe("spammy");
    const payload = JSON.parse(proposal.payload) as CommentDisputePayload;
    expect(payload.subjectType).toBe("task_comment");
    expect(payload.commentId).toBe(c.id);
    expect(payload.body).toBe("Something to flag");
    expect(payload.authorKey).toBe(author.publicKey);
  });

  it("refuses to flag your own comment", async () => {
    const { org, task } = await setup();
    const c = await postTaskComment(task.id, "self note", org.publicKey, NODE);
    await expect(
      flagTaskComment(c.id, org.publicKey, "", NODE),
    ).rejects.toThrow(/your own/);
  });

  it("is idempotent — re-flagging returns the existing proposal", async () => {
    const { org, task } = await setup();
    const author = await createMember({ displayName: "Author" }, NODE);
    const c = await postTaskComment(task.id, "x", author.publicKey, NODE);
    const first = await flagTaskComment(c.id, org.publicKey, "r1", NODE);
    const second = await flagTaskComment(c.id, org.publicKey, "r2", NODE);
    expect(second.id).toBe(first.id);
    expect(second.description).toBe("r1"); // first reason wins
    // No duplicate proposal was created.
    const all = await db.proposals.toArray();
    expect(all).toHaveLength(1);
  });

  it("preserves the body snapshot in the proposal even after author soft-deletes", async () => {
    const { org, task } = await setup();
    const author = await createMember({ displayName: "Author" }, NODE);
    const c = await postTaskComment(task.id, "incriminating text", author.publicKey, NODE);
    await flagTaskComment(c.id, org.publicKey, "review me", NODE);
    await deleteTaskComment(c.id, author.publicKey);
    const proposal = (await db.proposals.toArray())[0];
    const payload = JSON.parse(proposal.payload) as CommentDisputePayload;
    expect(payload.body).toBe("incriminating text");
  });

  it("rejects flagging a non-existent comment", async () => {
    const stranger = await createMember({ displayName: "Stranger" }, NODE);
    await expect(
      flagTaskComment("no-such-comment", stranger.publicKey, "", NODE),
    ).rejects.toThrow(/Comment not found/);
  });
});
