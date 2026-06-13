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
import type { Exchange, Project } from "@/types";

// The completion moment's only data source. Computes the two numbers a
// project's closure card may show — how many people moved hours, and how
// many hours — from the signed exchange ledger, never from the mutable
// task rows.
//
// Two deliberate constraints, both load-bearing:
//
// - AGGREGATE-ONLY. The return type contains numbers and nothing else —
//   never the helper key set, never a per-member breakdown. This is the
//   structural defense the plan asks for: with no names in the shape,
//   "see who helped" can't leak into a render by accident. Same posture
//   as projectMomentum.ts:24-27 — "a signal about the project, not the
//   people." We never rank members here.
//
// - EXCHANGES ARE THE TRUTH. Every confirmation writes an immutable
//   `Exchange` with `postId = "project:<id>/task:<id>"` and `helperKey =`
//   the completer (the auto-confirm sweep records the human completer
//   too). Task rows are mutable — a walk-back clears `completedBy` — so a
//   task-derived count would drift. The prefix lives inside the signed
//   payload, so matching on it is matching on attested data.
//
// A completion with zero matching exchanges returns zeros; the caller
// shows no tally rather than a shame-shaped "0 members moved 0 hours."

export interface ProjectClosure {
  /** Distinct `helperKey`s across this project's task exchanges. */
  contributorCount: number;
  /** Sum of `hoursExchanged`, rounded to 2 decimal places. */
  hoursMoved: number;
}

export function computeProjectClosure(opts: {
  project: Project;
  exchanges: readonly Exchange[];
}): ProjectClosure {
  const { project, exchanges } = opts;
  const prefix = `project:${project.id}/`;
  const helpers = new Set<string>();
  let hours = 0;
  for (const x of exchanges) {
    if (!x.postId.startsWith(prefix)) continue;
    helpers.add(x.helperKey);
    hours += x.hoursExchanged;
  }
  return {
    contributorCount: helpers.size,
    hoursMoved: Math.round(hours * 100) / 100,
  };
}
