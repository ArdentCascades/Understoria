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
import type { Milestone, NodeConfig } from "@/types";

export const MILESTONES: Milestone[] = [
  { type: "hours", threshold: 10, label: "10 hours of mutual aid" },
  { type: "hours", threshold: 50, label: "50 hours of mutual aid" },
  { type: "hours", threshold: 100, label: "100 hours of mutual aid" },
  { type: "hours", threshold: 500, label: "500 hours of mutual aid" },
  { type: "hours", threshold: 1000, label: "1,000 hours of mutual aid" },
  { type: "exchanges", threshold: 10, label: "10 exchanges completed" },
  { type: "exchanges", threshold: 50, label: "50 exchanges completed" },
  { type: "exchanges", threshold: 100, label: "100 exchanges completed" },
  { type: "exchanges", threshold: 500, label: "500 exchanges completed" },
  { type: "members", threshold: 10, label: "10 members strong" },
  { type: "members", threshold: 25, label: "25 members strong" },
  { type: "members", threshold: 50, label: "50 members strong" },
  { type: "members", threshold: 100, label: "100 members strong" },
];

/**
 * Returns the effective milestone set for a community: the baseline
 * `MILESTONES` plus the community's `customMilestones`, deduped by
 * `(type, threshold)`. Baseline wins on collision — a community can't
 * accidentally shadow or double-count a shipped milestone by adding a
 * custom one at the same threshold. Pure; safe to call repeatedly.
 */
export function effectiveMilestones(config: NodeConfig): Milestone[] {
  const seen = new Set<string>();
  const out: Milestone[] = [];
  for (const m of MILESTONES) {
    const key = `${m.type}|${m.threshold}`;
    seen.add(key);
    out.push(m);
  }
  for (const m of config.customMilestones) {
    const key = `${m.type}|${m.threshold}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(m);
  }
  return out;
}

export interface MilestoneProgress {
  /** The highest milestone actually reached, or null when the value
   *  is still below the lowest threshold — a community at 5 hours has
   *  not "reached" the 10-hour milestone and must not be shown it as
   *  achieved. */
  current: Milestone | null;
  next: Milestone | null;
  value: number;
  progress: number;
}

export function milestoneProgress(
  type: Milestone["type"],
  value: number,
  config?: NodeConfig,
): MilestoneProgress {
  const source = config ? effectiveMilestones(config) : MILESTONES;
  const typed = source
    .filter((m) => m.type === type)
    .sort((a, b) => a.threshold - b.threshold);
  let current: Milestone | null = null;
  let next: Milestone | null = typed[0] ?? null;
  for (let i = 0; i < typed.length; i++) {
    if (value >= typed[i].threshold) {
      current = typed[i];
      next = typed[i + 1] ?? null;
    }
  }
  const prevThreshold = current ? current.threshold : 0;
  const span = next ? next.threshold - prevThreshold : 1;
  const progress = next
    ? Math.max(0, Math.min(1, (value - prevThreshold) / span))
    : 1;
  return { current, next, value, progress };
}

export function reachedMilestones(
  type: Milestone["type"],
  value: number,
  config?: NodeConfig,
): Milestone[] {
  const source = config ? effectiveMilestones(config) : MILESTONES;
  return source.filter((m) => m.type === type && value >= m.threshold);
}

export interface MilestoneState {
  milestone: Milestone;
  reached: boolean;
}

/**
 * Returns every milestone for a given type, in ascending threshold
 * order, each tagged with whether the community has reached it.
 * Used by CanopyMilestones to render the leaf row.
 */
export function milestonesForType(
  type: Milestone["type"],
  value: number,
  config?: NodeConfig,
): MilestoneState[] {
  const source = config ? effectiveMilestones(config) : MILESTONES;
  return source
    .filter((m) => m.type === type)
    .sort((a, b) => a.threshold - b.threshold)
    .map((milestone) => ({ milestone, reached: value >= milestone.threshold }));
}
