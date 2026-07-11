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
import { db, type TaskPlanRow, type TaskPlanStep } from "@/db/database";
import { uuid } from "@/lib/id";

/**
 * Private task plans — the only module that reads or writes
 * `db.taskPlans`. A plan is a member's own working notes for a task
 * they've claimed: a self-decomposed step list ("what does 'fix the
 * fence' actually start with?") plus an optional planned day. Built
 * for the executive-function gap between claiming a task and starting
 * it; see docs/member-guide.md "Your private plan for a task".
 *
 * Contract (locked by taskPlans.test.ts):
 *
 * - LOCAL-ONLY. Nothing here enqueues to the outbox, and the
 *   `OutboxRow.kind` union rejects `"task_plan"` at the type level.
 *   Never exported (EXPORT_EXCLUDED_TABLES), never in the pairing
 *   snapshot, cleared whole by soft purge. The community sees the
 *   task exactly as before; the plan is the member's alone.
 *
 * - One plan per task per device, keyed by taskId. `memberKey` names
 *   the author: readers show a plan only to its author, and a write
 *   by a different member (the task was released and re-claimed)
 *   replaces the stale row whole rather than merging into it.
 *
 * - A plan that empties out (no steps, no planned day) deletes its
 *   row — no residue outlives the member's use of it.
 *
 * - No reminders, ever. `plannedDay` is a self-promise the UI may
 *   quietly display; nothing schedules, notifies, or turns red when
 *   it passes (`no-notifications`, `solidarity-not-shame`).
 */

export const MAX_PLAN_STEPS = 30;
export const MAX_STEP_LENGTH = 200;

/** The viewer's own plan for a task, or null — a row authored by
 *  someone else (the task changed hands on a shared device) reads as
 *  "no plan" rather than leaking the previous claimer's notes. */
export async function getOwnTaskPlan(
  taskId: string,
  memberKey: string,
): Promise<TaskPlanRow | null> {
  const row = await db.taskPlans.get(taskId);
  return row && row.memberKey === memberKey ? row : null;
}

/** Loads the caller's own row for mutation, or a fresh empty plan —
 *  discarding any stale row a previous claimer left behind. */
function baseRow(
  existing: TaskPlanRow | undefined,
  taskId: string,
  memberKey: string,
  now: number,
): TaskPlanRow {
  if (existing && existing.memberKey === memberKey) return existing;
  return {
    taskId,
    memberKey,
    steps: [],
    plannedDay: null,
    createdAt: now,
    updatedAt: now,
  };
}

/** Writes the row, or deletes it when the plan has emptied out. */
async function putOrPrune(row: TaskPlanRow): Promise<void> {
  if (row.steps.length === 0 && row.plannedDay === null) {
    await db.taskPlans.delete(row.taskId);
  } else {
    await db.taskPlans.put(row);
  }
}

export async function addPlanStep(
  taskId: string,
  memberKey: string,
  text: string,
): Promise<TaskPlanStep | null> {
  const trimmed = text.trim().slice(0, MAX_STEP_LENGTH);
  if (!trimmed) return null;
  return db.transaction("rw", db.taskPlans, async () => {
    const now = Date.now();
    const row = baseRow(await db.taskPlans.get(taskId), taskId, memberKey, now);
    if (row.steps.length >= MAX_PLAN_STEPS) return null;
    const step: TaskPlanStep = { id: uuid(), text: trimmed, done: false };
    await db.taskPlans.put({
      ...row,
      steps: [...row.steps, step],
      updatedAt: now,
    });
    return step;
  });
}

export async function togglePlanStep(
  taskId: string,
  memberKey: string,
  stepId: string,
): Promise<void> {
  await db.transaction("rw", db.taskPlans, async () => {
    const row = await db.taskPlans.get(taskId);
    if (!row || row.memberKey !== memberKey) return;
    await db.taskPlans.put({
      ...row,
      steps: row.steps.map((s) =>
        s.id === stepId ? { ...s, done: !s.done } : s,
      ),
      updatedAt: Date.now(),
    });
  });
}

export async function removePlanStep(
  taskId: string,
  memberKey: string,
  stepId: string,
): Promise<void> {
  await db.transaction("rw", db.taskPlans, async () => {
    const row = await db.taskPlans.get(taskId);
    if (!row || row.memberKey !== memberKey) return;
    await putOrPrune({
      ...row,
      steps: row.steps.filter((s) => s.id !== stepId),
      updatedAt: Date.now(),
    });
  });
}

/** `day` is a local "YYYY-MM-DD" string or null to clear. Malformed
 *  input is dropped rather than stored. */
export async function setPlannedDay(
  taskId: string,
  memberKey: string,
  day: string | null,
): Promise<void> {
  if (day !== null && !/^\d{4}-\d{2}-\d{2}$/.test(day)) return;
  await db.transaction("rw", db.taskPlans, async () => {
    const now = Date.now();
    const row = baseRow(await db.taskPlans.get(taskId), taskId, memberKey, now);
    await putOrPrune({ ...row, plannedDay: day, updatedAt: now });
  });
}

/** Today's local calendar date as "YYYY-MM-DD" — the same shape
 *  `<input type="date">` speaks, so comparisons are string compares. */
export function localDayString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
