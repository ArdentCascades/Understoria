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
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useToast } from "@/state/ToastContext";
import { humanizeError } from "@/lib/humanizeError";
import { taskCheckInState } from "@/lib/taskCheckInState";
import { useProjectTaskContext } from "@/lib/useProjectTaskContext";
import { HistoryTimeline, TaskRow } from "@/pages/ProjectDetail";

// Per-task page — `/project/:id/task/:taskId`. Renders the FULL task
// (everything an in-list `<TaskRow>` shows/does) in its project
// context, reconstructed from global state + route params via
// `useProjectTaskContext` (no project-scoped fetch exists, so the
// context is identical to the project page's). Reachable from the
// quiet "Open task" footer link on each task card. The existing
// `#task-<id>` deep-links into the project list are untouched.
export default function TaskDetailPage() {
  const { id, taskId } = useParams<{ id: string; taskId: string }>();
  const ctx = useProjectTaskContext(id);
  const { t } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  // Page-level action wrapper, reconstructed verbatim from
  // `ProjectDetail.tsx`'s `run<T>` — surfaces failures both inline and
  // as an error toast with Retry so an action whose button has
  // scrolled away is still recoverable.
  async function run<T>(action: () => Promise<T>): Promise<T | null> {
    try {
      setError(null);
      return await action();
    } catch (err) {
      const message = humanizeError(err);
      setError(message);
      showToast(message, {
        tone: "error",
        action: {
          label: t("common.tryAgain"),
          onAction: () => {
            void run(action);
          },
        },
      });
      return null;
    }
  }

  // Project missing — mirror the project page's not-found guard
  // (`ProjectDetail.tsx:336-351`): the shared muted line plus a back
  // control to the projects list.
  if (!ctx.project) {
    return (
      <div className="px-4 pt-6">
        <p className="text-sm text-moss-600 dark:text-moss-300">
          {t("projects.detail.notFound")}
        </p>
        <button
          type="button"
          className="btn-secondary mt-4"
          onClick={() => navigate("/?tab=projects")}
        >
          {t("projects.detail.back")}
        </button>
      </div>
    );
  }

  const project = ctx.project;
  const task = ctx.tasks.find((tk) => tk.id === taskId);

  // Task missing — a calm muted line and a back link to the project
  // it would have lived on. No TaskRow chrome.
  if (!task) {
    return (
      <div className="px-4 pt-6">
        <p className="text-sm text-moss-600 dark:text-moss-300">
          {t("projects.task.detail.notFound")}
        </p>
        <Link
          to={`/project/${id}`}
          className="btn-ghost -ml-2 mt-4 inline-block text-sm"
        >
          {`← ${t("projects.task.detail.backToProject", { title: project.title })}`}
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 pb-8 pt-4">
      {/* Re-anchors the project list to this row on return, so the
          member lands back where they were. */}
      <Link
        to={`/project/${id}#task-${taskId}`}
        className="btn-ghost -ml-2 mb-3 inline-block text-sm"
      >
        {`← ${t("projects.task.detail.backToProject", { title: project.title })}`}
      </Link>
      {error && (
        <p
          role="alert"
          className="mb-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-950/40 dark:text-rose-200"
        >
          {error}
        </p>
      )}
      <h1 className="mb-4 text-lg font-semibold leading-snug">
        <Link
          to={`/project/${id}`}
          className="text-moss-600 underline-offset-2 hover:underline dark:text-moss-300"
        >
          {project.title}
        </Link>
        <span className="text-moss-400 dark:text-moss-500">{" / "}</span>
        {task.title}
      </h1>
      <TaskRow
        task={task}
        isOrganizer={ctx.isOrg}
        acceptingClaims={project.status === "active"}
        projectStatus={project.status}
        currentKey={ctx.currentKey}
        memberMap={ctx.memberMap}
        nodeId={ctx.nodeId}
        onRun={run}
        needsMoreHands={
          taskCheckInState(task, ctx.nodeConfig, ctx.tasks) ===
          "needs_more_hands"
        }
        allTasks={ctx.tasks}
        flaggedCommentIds={ctx.flaggedCommentIds}
        taskCheckInDays={ctx.nodeConfig.taskCheckInDays}
        autoConfirmHours={ctx.autoConfirmHours}
        sortableHandle={null}
        moveButtons={null}
        linkToDetail={false}
      />
      {/* Completed/archived projects keep their history reachable from
          the task page too. */}
      {(project.status === "archived" || project.status === "completed") && (
        <div className="mt-4">
          <HistoryTimeline projectId={project.id} memberMap={ctx.memberMap} />
        </div>
      )}
    </div>
  );
}
