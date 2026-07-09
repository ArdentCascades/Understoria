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

// The "ways to plug in" match the templates always described but nobody
// built: overlap a task's organizer-suggested `requiredSkills` with the
// viewer's own profile skills. Deliberately POSITIVE-only — it surfaces
// what fits, never what's missing. Suggested skills are help, not a gate
// (asking-never-gated / solidarity-not-shame), so this only ever adds a
// "you're a good fit" cue; the absence of a match says nothing.

function normalize(skill: string): string {
  return skill.trim().toLowerCase();
}

export interface SkillMatch {
  /** The subset of the task's skills the viewer lists (original casing,
   *  in the task's order). */
  matched: string[];
  hasMatch: boolean;
}

export function matchTaskSkills(
  taskSkills: readonly string[],
  viewerSkills: readonly string[],
): SkillMatch {
  const viewerSet = new Set(
    viewerSkills.map(normalize).filter((s) => s.length > 0),
  );
  const matched = taskSkills.filter((s) => viewerSet.has(normalize(s)));
  return { matched, hasMatch: matched.length > 0 };
}
