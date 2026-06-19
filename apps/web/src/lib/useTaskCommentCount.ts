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
import { useLiveQuery } from "dexie-react-hooks";
import { listTaskComments } from "@/db/taskComments";
import { useApp } from "@/state/AppContext";

// Live comment count for a task, used by the slim project-list
// `TaskCard` footer link. Loads the same thread `TaskComments` does and
// applies the IDENTICAL blocked-author filter (docs/blocking.md §6 —
// hide-from-blocker rows), so the card's "N comments" matches the
// thread header's count exactly, even when a blocked author has
// commented. Tombstones (`deletedAt` set) are still counted — they're
// returned by `listTaskComments` and the thread header counts them too,
// so dropping them here would desync the two numbers.
export function useTaskCommentCount(projectId: string, taskId: string): number {
  const { blockedKeys } = useApp();
  const all = useLiveQuery(
    () => listTaskComments(projectId, taskId),
    [projectId, taskId],
    [],
  );
  return useMemo(
    () =>
      blockedKeys.size === 0
        ? all.length
        : all.filter((c) => !blockedKeys.has(c.authorKey)).length,
    [all, blockedKeys],
  );
}
