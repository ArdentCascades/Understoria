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
import { useMemo } from "react";
import { useApp } from "@/state/AppContext";
import { isOrganizer } from "@/db/projects";
import type { NodeConfig, Project, ProjectTask } from "@/types";

// Shared read-model for a single project's task view. The per-task
// page (`pages/TaskDetail.tsx`) renders the same `<TaskRow>` the
// project page does, and that row needs the same project-scoped
// context the project page derives from global state. Everything
// `ProjectDetailPage` needs comes from `useApp()` + the route param —
// there is no project-scoped fetch — so this hook reconstructs the
// identical context with zero new data loading.
//
// Kept deliberately as pure logic (no JSX) so the task page can
// consume it directly; the project page itself is untouched in
// Phase 1 (its top-level derivations are Phase 2).
export interface ProjectTaskContext {
  project: Project | null;
  tasks: ProjectTask[];
  memberMap: Map<string, string>;
  flaggedCommentIds: ReadonlySet<string>;
  isOrg: boolean;
  currentKey: string | undefined;
  nodeId: string;
  nodeConfig: NodeConfig;
  autoConfirmHours: number;
}

export function useProjectTaskContext(
  projectId: string | undefined,
): ProjectTaskContext {
  const {
    projects,
    projectTasks,
    members,
    currentMember,
    nodeId,
    nodeConfig,
    proposals,
  } = useApp();

  // Same source the project page uses (`ProjectDetail.tsx:160-163`):
  // the unfiltered global `projects` list, matched by route id.
  const project = useMemo(
    () => projects.find((p) => p.id === projectId) ?? null,
    [projects, projectId],
  );

  // Sort by orderIndex ascending (per PR C migration). createdAt is
  // a defensive tiebreaker for any rows that escaped the v25 backfill
  // — should never fire in practice, but keeps the order stable if
  // it does. Mirrors `ProjectDetail.tsx:168-177`.
  const tasks = useMemo(
    () =>
      projectTasks
        .filter((task) => task.projectId === projectId)
        .sort((a, b) => {
          if (a.orderIndex !== b.orderIndex) return a.orderIndex - b.orderIndex;
          return a.createdAt - b.createdAt;
        }),
    [projectTasks, projectId],
  );

  // Mirrors `ProjectDetail.tsx:315-318`.
  const memberMap = useMemo(
    () => new Map(members.map((m) => [m.publicKey, m.displayName])),
    [members],
  );

  // Derive the set of comment ids with an open dispute proposal so
  // TaskComments can render the "Flagged" chip and hide the Flag
  // button. Computed in memory from the proposals already loaded in
  // AppContext rather than a separate Dexie query — the proposals
  // list is small enough that the O(n) scan is cheap. Mirrors
  // `ProjectDetail.tsx:276-296`.
  const flaggedCommentIds = useMemo<ReadonlySet<string>>(() => {
    const ids = new Set<string>();
    for (const p of proposals) {
      if (p.kind !== "dispute" || p.status !== "open") continue;
      try {
        const payload = JSON.parse(p.payload) as {
          subjectType?: string;
          commentId?: string;
        };
        if (
          payload.subjectType === "task_comment" &&
          typeof payload.commentId === "string"
        ) {
          ids.add(payload.commentId);
        }
      } catch {
        // Skip — malformed or wrong-shape payloads aren't matches.
      }
    }
    return ids;
  }, [proposals]);

  const isOrg = useMemo(
    () =>
      project && currentMember
        ? isOrganizer(project, currentMember.publicKey)
        : false,
    [project, currentMember],
  );

  // Read once for the whole row — the claimer narrative under
  // awaiting_confirmation needs the auto-confirm window to decide
  // whether to render the safety-net sentence. 0 (or undefined
  // nodeConfig) means "no sweep configured on this node," and the
  // line is suppressed entirely. Mirrors `ProjectDetail.tsx:1774-1776`.
  const autoConfirmHours =
    (nodeConfig as { autoConfirmHours?: number } | undefined)
      ?.autoConfirmHours ?? 0;

  return {
    project,
    tasks,
    memberMap,
    flaggedCommentIds,
    isOrg,
    currentKey: currentMember?.publicKey,
    nodeId,
    nodeConfig,
    autoConfirmHours,
  };
}
