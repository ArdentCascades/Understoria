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
import type { NodeConfig, ProjectTask } from "@/types";

// Two-tier stalled-task handling. Pure function — staleness is a
// computed view over `claimedAt` / `checkInAcknowledgedAt` against
// the node config thresholds; never stored.
//
// Per the project ethos: never frame as "stalled" / "overdue" /
// "failed." The two thresholds let us:
//   1. Nudge the claimer privately ("still on it?") — they can
//      release without anyone seeing.
//   2. Surface community-visibly that the task could use more
//      hands — framing aimed at the task, not the person.

const DAY_MS = 24 * 60 * 60 * 1000;

export type TaskStaleness =
  | "fresh"
  | "check_in_due"
  | "needs_more_hands";

export function taskStaleness(
  task: ProjectTask,
  config: Pick<NodeConfig, "taskCheckInDays" | "taskNeedsHelpDays">,
  now: number = Date.now(),
): TaskStaleness {
  // Only claimed tasks have staleness. awaiting_confirmation /
  // completed / blocked / open are out of scope.
  if (task.status !== "claimed") return "fresh";
  // No claim time recorded (legacy row that escaped the v10
  // backfill, or some edge case) — treat as fresh so we don't
  // spam.
  if (task.claimedAt === null) return "fresh";

  // Public "needs more hands" is keyed off the original claim
  // time. Acknowledging the private nudge does NOT reset this
  // clock — once the community signal is warranted, it's warranted
  // regardless of how often the claimer says "still on it."
  if (now - task.claimedAt >= config.taskNeedsHelpDays * DAY_MS) {
    return "needs_more_hands";
  }

  // Private "still on it?" is keyed off the later of claim time
  // and last ack, so saying "yes" buys the claimer another
  // `taskCheckInDays` of quiet.
  const ackOrClaim = Math.max(
    task.claimedAt,
    task.checkInAcknowledgedAt ?? 0,
  );
  if (now - ackOrClaim >= config.taskCheckInDays * DAY_MS) {
    return "check_in_due";
  }

  return "fresh";
}

/** Days remaining until the task crosses into `check_in_due`.
 *  Returns 0 if already past. Useful for "your check-in is due
 *  in N days" labels if we ever want to surface that. */
export function daysUntilCheckIn(
  task: ProjectTask,
  config: Pick<NodeConfig, "taskCheckInDays">,
  now: number = Date.now(),
): number {
  if (task.status !== "claimed" || task.claimedAt === null) return 0;
  const anchor = Math.max(
    task.claimedAt,
    task.checkInAcknowledgedAt ?? 0,
  );
  const due = anchor + config.taskCheckInDays * DAY_MS;
  return Math.max(0, Math.ceil((due - now) / DAY_MS));
}

/** How many days has the task been claimed (regardless of acks)?
 *  Used by the "could use more hands" chip tooltip. */
export function daysSinceClaim(
  task: ProjectTask,
  now: number = Date.now(),
): number {
  if (task.claimedAt === null) return 0;
  return Math.floor((now - task.claimedAt) / DAY_MS);
}
