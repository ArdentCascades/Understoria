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
import { db } from "./database";
import { uuid } from "@/lib/id";
import { canonicalTaskCommentPayload, sign } from "@/lib/crypto";
import { getSecretKey } from "./secrets";
import {
  enqueueTaskCommentOutbox,
  flushOutboxNow,
} from "@/lib/outbox";
import type { TaskComment } from "@/types";

export const MAX_COMMENT_LENGTH = 2000;

/**
 * Post a comment on a project task.
 *
 * Permission model:
 *   - Anyone with an unlocked session can post a comment. There is
 *     no organizer-only gate — task comments are the place where
 *     anyone in the community can ask, suggest, or coordinate work.
 *   - The author's secret key is loaded BEFORE the write transaction
 *     so a locked session throws cleanly rather than leaving a half-
 *     written row.
 *
 * Validation:
 *   - Body must be non-empty after trimming.
 *   - Body must be ≤ MAX_COMMENT_LENGTH characters after trimming.
 *   - The task must exist; the comment denormalizes the task's
 *     projectId so federation peers can route without resolving the
 *     task first.
 *   - Archived projects reject new comments (same as announcements).
 *
 * The returned row carries a non-empty `signature` field even though
 * federation isn't wired yet — the shape is forward-compatible.
 */
export async function postTaskComment(
  taskId: string,
  body: string,
  authorKey: string,
  nodeId: string,
): Promise<TaskComment> {
  const trimmed = body.trim();
  if (trimmed.length === 0) {
    throw new Error("Comment body is required.");
  }
  if (trimmed.length > MAX_COMMENT_LENGTH) {
    throw new Error(
      `Comment too long (max ${MAX_COMMENT_LENGTH} characters).`,
    );
  }

  // Resolve the task → project pre-transaction.
  const task = await db.projectTasks.get(taskId);
  if (!task) {
    throw new Error("Task not found.");
  }
  const project = await db.projects.get(task.projectId);
  if (!project) {
    throw new Error("Project not found.");
  }
  if (project.status === "archived") {
    throw new Error("Cannot comment on an archived project.");
  }

  // Throws if the session is locked — same pattern as createPost.
  const authorSecret = await getSecretKey(authorKey);

  const immutable = {
    id: uuid(),
    projectId: task.projectId,
    taskId,
    authorKey,
    body: trimmed,
    createdAt: Date.now(),
    nodeId,
  };
  const signature = sign(canonicalTaskCommentPayload(immutable), authorSecret);
  const comment: TaskComment = {
    ...immutable,
    deletedAt: null,
    signature,
  };

  await db.taskComments.put(comment);
  await enqueueTaskCommentOutbox(comment);
  // Best-effort kick. The worker also runs on its own schedule, so a
  // disabled / down community node just means the row sits pending.
  void flushOutboxNow().catch(() => {
    // Errors surface via the outbox worker's own retry path.
  });
  return comment;
}

/**
 * List comments on a task, oldest-first. Soft-deleted comments are
 * returned with `deletedAt` set so the UI can render them as
 * tombstones; the caller decides display. Soft delete preserves
 * convergence — peers that haven't yet seen the original can still
 * resolve the row.
 */
export async function listTaskComments(
  projectId: string,
  taskId: string,
): Promise<TaskComment[]> {
  return db.taskComments
    .where("[projectId+taskId+createdAt]")
    .between([projectId, taskId, 0], [projectId, taskId, Infinity])
    .toArray();
}

/**
 * Soft-delete a comment. Only the author can delete. Already-deleted
 * comments cannot be re-deleted (no-op-vs-error distinction matters
 * for federation; an error is loud about the impossible state).
 */
export async function deleteTaskComment(
  commentId: string,
  callerKey: string,
): Promise<void> {
  const comment = await db.taskComments.get(commentId);
  if (!comment) {
    throw new Error("Comment not found.");
  }
  if (comment.deletedAt !== null) {
    throw new Error("Comment already deleted.");
  }
  if (comment.authorKey !== callerKey) {
    throw new Error("Only the author can delete this comment.");
  }
  const deletedAt = Date.now();
  await db.taskComments.update(commentId, { deletedAt });
  // Federate the tombstone — re-push the same signed row with
  // `deletedAt` populated. The signature still verifies because
  // `deletedAt` is excluded from the canonical payload.
  const tombstoned: TaskComment = { ...comment, deletedAt };
  await enqueueTaskCommentOutbox(tombstoned);
  void flushOutboxNow().catch(() => {
    // Errors surface via the outbox worker's own retry path.
  });
}
