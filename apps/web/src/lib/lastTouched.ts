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
import { SETTING_KEYS, setSetting } from "@/db/database";
import type { Project, ProjectTask } from "@/types";

// "Pick up where you left off" — the interruption-recovery pointer.
// After life interrupts, the private plan's note covers re-entering a
// task; this covers the step before that: remembering WHICH task you
// were on at all. One device-local settings row holds the last task
// the member touched (claimed it, or worked its private plan); the
// Dashboard shows a quiet doorway back to it.
//
// Scope decisions:
// - ONE pointer, not a history. A "recently touched" list would be an
//   activity log of the member's own attention — more surface than
//   the problem needs. The single most-recent task answers "where was
//   I?"; everything else is already In my care.
// - Device-local display state (settings never federate, never
//   export). The pointer is navigation memory, not a record.
// - The doorway re-derives validity at render time: the task must
//   still exist AND still be the member's own active claim. A stale
//   pointer (task released, confirmed, project gone) renders nothing
//   rather than a dead link.

export interface LastTouchedTask {
  taskId: string;
  projectId: string;
  /** ms epoch of the touch — display-only ("a moment ago"). */
  at: number;
}

/** Record that the member just touched this task. Fire-and-forget:
 *  navigation memory must never block or fail a real action. */
export function recordTaskTouch(taskId: string, projectId: string): void {
  void setSetting(
    SETTING_KEYS.lastTouchedTask,
    JSON.stringify({ taskId, projectId, at: Date.now() } satisfies LastTouchedTask),
  ).catch(() => {
    // Losing the pointer loses nothing but a shortcut.
  });
}

/** Parse the stored setting; malformed/absent reads as null. */
export function parseLastTouched(
  value: string | undefined,
): LastTouchedTask | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<LastTouchedTask>;
    if (
      typeof parsed.taskId === "string" &&
      typeof parsed.projectId === "string" &&
      typeof parsed.at === "number"
    ) {
      return parsed as LastTouchedTask;
    }
  } catch {
    // Fall through to null.
  }
  return null;
}

/**
 * Resolve the pointer against live state. Returns the task + project
 * to link to, or null when the pointer is stale: the task is gone, no
 * longer the member's, or no longer an active claim (released or
 * fully confirmed — nothing to resume).
 */
export function resolveLastTouched(
  pointer: LastTouchedTask | null,
  memberKey: string | undefined,
  tasks: readonly ProjectTask[],
  projects: readonly Project[],
): { task: ProjectTask; project: Project } | null {
  if (!pointer || !memberKey) return null;
  const task = tasks.find((t) => t.id === pointer.taskId);
  if (!task) return null;
  if (task.assignedTo !== memberKey) return null;
  if (task.status !== "claimed" && task.status !== "awaiting_confirmation")
    return null;
  const project = projects.find((p) => p.id === pointer.projectId);
  if (!project) return null;
  return { task, project };
}
