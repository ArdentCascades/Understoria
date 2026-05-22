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
import type { Exchange, Project, ProjectTask } from "@/types";

// Agent 10 Phase 3 — momentum tracking for projects.
//
// Two things this module computes from data already on disk:
// - a per-day bucketed view of hours contributed to a project for the
//   last N days (default 14), used by the sparkline component;
// - a "momentum state" — a coarse description of whether the project
//   is actively progressing, recently stalled, or finished. The
//   dashboard / project detail surface this without showing per-day
//   numbers, so the state is what most callers want.
//
// Per the roadmap "reputation-score creep" guard, momentum is a
// signal about the project, not the people. We never rank members
// here. Sparklines show the project's curve; the chip shows the
// project's pace.

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type MomentumState =
  | "humming" // contributions on at least half the days in the window
  | "active" // at least one contribution in the last 7 days
  | "stalled" // no contributions in the last 7 days, project still open
  | "completed" // status === completed
  | "paused" // status === paused
  | "planning" // status === planning (no momentum to speak of yet)
  | "archived";

export interface DailyContribution {
  /** Floor-of-day in ms-epoch (the day's midnight). */
  dayStart: number;
  hours: number;
}

export interface ProjectMomentum {
  /** Day-bucketed hours for the last `windowDays` days, oldest first.
   *  Includes days with zero contribution so the array length always
   *  equals `windowDays`. */
  daily: DailyContribution[];
  /** Hours contributed in the last 7 days. */
  hoursLast7Days: number;
  /** Number of distinct days with at least one contribution in the
   *  full window. */
  activeDaysInWindow: number;
  state: MomentumState;
}

export function computeProjectMomentum(opts: {
  project: Project;
  tasks: readonly ProjectTask[];
  /** All exchanges; the function filters by the project's tasks. The
   *  signature takes the full log (rather than a pre-filtered slice)
   *  so callers can hand over the live AppContext array without
   *  repeating the filter logic. */
  exchanges: readonly Exchange[];
  /** Length of the sparkline window in days. Default 14. */
  windowDays?: number;
  now?: number;
}): ProjectMomentum {
  const { project, tasks, exchanges } = opts;
  const windowDays = opts.windowDays ?? 14;
  const now = opts.now ?? Date.now();

  // Which exchange ids belong to this project? Tasks store the
  // exchangeId when confirmed; that's the join key.
  const exchangeIds = new Set<string>();
  for (const t of tasks) {
    if (t.exchangeId) exchangeIds.add(t.exchangeId);
  }
  const projectExchanges = exchanges.filter((x) => exchangeIds.has(x.id));

  const todayStart = Math.floor(now / MS_PER_DAY) * MS_PER_DAY;
  const windowStart = todayStart - (windowDays - 1) * MS_PER_DAY;

  const daily: DailyContribution[] = [];
  for (let i = 0; i < windowDays; i++) {
    daily.push({ dayStart: windowStart + i * MS_PER_DAY, hours: 0 });
  }
  for (const x of projectExchanges) {
    if (x.completedAt < windowStart) continue;
    const idx = Math.floor((x.completedAt - windowStart) / MS_PER_DAY);
    if (idx < 0 || idx >= windowDays) continue;
    daily[idx].hours = roundHours(daily[idx].hours + x.hoursExchanged);
  }

  const sevenDayStart = todayStart - 6 * MS_PER_DAY;
  let hoursLast7Days = 0;
  for (const d of daily) {
    if (d.dayStart >= sevenDayStart) hoursLast7Days += d.hours;
  }
  hoursLast7Days = roundHours(hoursLast7Days);

  const activeDaysInWindow = daily.filter((d) => d.hours > 0).length;

  return {
    daily,
    hoursLast7Days,
    activeDaysInWindow,
    state: deriveState(project, hoursLast7Days, activeDaysInWindow, windowDays),
  };
}

function deriveState(
  project: Project,
  hoursLast7Days: number,
  activeDaysInWindow: number,
  windowDays: number,
): MomentumState {
  if (project.status === "completed") return "completed";
  if (project.status === "paused") return "paused";
  if (project.status === "archived") return "archived";
  if (project.status === "planning") return "planning";
  // status === "active"
  if (activeDaysInWindow >= Math.ceil(windowDays / 2)) return "humming";
  if (hoursLast7Days > 0) return "active";
  return "stalled";
}

function roundHours(h: number): number {
  return Math.round(h * 100) / 100;
}
