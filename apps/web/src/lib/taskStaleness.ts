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

// Two-tier check-in handling. Pure function — state is a computed
// view over `claimedAt` / `checkInAcknowledgedAt` against the
// node config thresholds; never stored.
//
// Per the project ethos: never frame as "stalled" / "overdue" /
// "failed." The two tiers let us:
//   1. Nudge the claimer privately ("still on it?") — they can
//      release without anyone seeing.
//   2. Surface community-visibly that the task could use more
//      hands — framing aimed at the task, not the person.
//
// Solidarity-not-shame: a claimer who is engaging — even just to
// say "yes, still on it" — should never appear in a community-
// visible signal. The public chip therefore requires BOTH:
//   (a) the task has been claimed for at least `taskNeedsHelpDays`
//       (the absolute floor — the community wouldn't be talking
//       about additional support before this), and
//   (b) the claimer has been silent for at least
//       `taskCheckInGraceDays` since their most recent
//       acknowledgement (or since the claim itself if they've
//       never acked). Each ack buys grace; sustained silence is
//       what surfaces the public chip.

const DAY_MS = 24 * 60 * 60 * 1000;

export type TaskStaleness =
  | "fresh"
  | "check_in_due"
  | "needs_more_hands";

export function taskStaleness(
  task: ProjectTask,
  config: Pick<
    NodeConfig,
    "taskCheckInDays" | "taskNeedsHelpDays" | "taskCheckInGraceDays"
  >,
  now: number = Date.now(),
): TaskStaleness {
  // Only claimed tasks have a check-in state. awaiting_confirmation
  // / completed / blocked / open are out of scope.
  if (task.status !== "claimed") return "fresh";
  // No claim time recorded (legacy row that escaped the v11
  // backfill, or some edge case) — treat as fresh so we don't
  // spam.
  if (task.claimedAt === null) return "fresh";

  const ackOrClaim = Math.max(
    task.claimedAt,
    task.checkInAcknowledgedAt ?? 0,
  );

  // Inside the private window: nothing surfaces. Acknowledging
  // resets this clock.
  if (now - ackOrClaim < config.taskCheckInDays * DAY_MS) {
    return "fresh";
  }

  // Past the private window. Public chip needs both the absolute
  // claim floor AND the grace-since-ack to have lapsed. Either
  // failing keeps us in `check_in_due` (private nudge visible to
  // the claimer only).
  const claimFloorPassed =
    now - task.claimedAt >= config.taskNeedsHelpDays * DAY_MS;
  const gracePassed =
    now - ackOrClaim >=
    (config.taskCheckInDays + config.taskCheckInGraceDays) * DAY_MS;

  if (claimFloorPassed && gracePassed) return "needs_more_hands";
  return "check_in_due";
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
