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
import { useApp } from "@/state/AppContext";
import { formatHours } from "@/lib/format";
import { creditHoursForTask } from "@/lib/timebank";
import { statusChipClass, capitalize } from "@/lib/taskPresentation";
import { BackLink } from "@/components/BackLink";
import { TaskDetailBody } from "@/components/TaskDetailBody";
import { HistoryTimeline } from "@/pages/ProjectDetail";

// Per-task page — `/project/:id/task/:taskId`. Renders the task's "act"
// half (`<TaskDetailBody>` — the full description, every lifecycle
// action, the claimer narrative, and the comment thread) in its project
// context, reconstructed from global state + route params via
// `useProjectTaskContext` (no project-scoped fetch exists, so the
// context is identical to the project page's). The slim `<TaskCard>` on
// the project list shows the scan half (chips, one-line preview, Claim,
// "Open task · N comments" link here). The chip row the body drops is
// rebuilt as a compact page header under the breadcrumb. The in-list
// `#task-<id>` deep-links into the project list are untouched.
export default function TaskDetailPage() {
  const { id, taskId } = useParams<{ id: string; taskId: string }>();
  const ctx = useProjectTaskContext(id);
  const { blockedKeys } = useApp();
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
  // (`ProjectDetail.tsx`): the shared muted line plus a back
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
  // it would have lived on. No task-detail chrome.
  if (!task) {
    return (
      <div className="px-4 pt-6">
        <p className="text-sm text-moss-600 dark:text-moss-300">
          {t("projects.task.detail.notFound")}
        </p>
        <BackLink
          to={`/project/${id}`}
          label={t("projects.task.detail.backToProject", {
            title: project.title,
          })}
          className="btn-ghost -ml-2 mt-4 inline-block text-sm"
        />
      </div>
    );
  }

  return (
    <div className="px-4 pb-8 pt-4">
      {/* Re-anchors the project list to this row on return, so the
          member lands back where they were. */}
      <BackLink
        to={`/project/${id}#task-${taskId}`}
        label={t("projects.task.detail.backToProject", {
          title: project.title,
        })}
      />
      {error && (
        <p
          role="alert"
          className="mb-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-950/40 dark:text-rose-200"
        >
          {error}
        </p>
      )}
      <h1 className="mb-2 text-lg font-semibold leading-snug">
        <Link
          to={`/project/${id}`}
          className="text-moss-600 underline-offset-2 hover:underline dark:text-moss-300"
        >
          {project.title}
        </Link>
        <span className="text-moss-400 dark:text-moss-500">{" / "}</span>
        {task.title}
      </h1>
      {/* Status + hours chips — the chip row TaskDetailBody drops,
          rebuilt here so the page header still names the task's state
          and credit at a glance. Reuses the shared palette/formatters so
          it reads identically to the card. (Not the Follows badge — that
          stays on the card's in-list chips row.) */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span
          className={`chip ${statusChipClass(task.status)}`}
          title={task.status}
        >
          {t(`projects.task.status${capitalize(task.status === "awaiting_confirmation" ? "Awaiting" : task.status)}` as `projects.task.statusOpen`)}
        </span>
        <span className="chip bg-canopy-50 text-canopy-900 dark:bg-canopy-950/50 dark:text-canopy-100">
          {formatHours(
            task.status === "awaiting_confirmation" ||
              task.status === "completed"
              ? creditHoursForTask(task)
              : task.estimatedHours,
          )}
        </span>
      </div>
      <TaskDetailBody
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
      />
      {/* Completed/archived projects keep their history reachable from
          the task page too. */}
      {(project.status === "archived" || project.status === "completed") && (
        <div className="mt-4">
          <HistoryTimeline
            projectId={project.id}
            memberMap={ctx.memberMap}
            blockedKeys={blockedKeys}
          />
        </div>
      )}
    </div>
  );
}
