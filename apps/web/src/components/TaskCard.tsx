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
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { claimProjectTask } from "@/db/projects";
import { stripMarkdown } from "@/lib/markdown";
import { formatHours } from "@/lib/format";
import { creditHoursForTask } from "@/lib/timebank";
import { HighlightedText } from "@/components/HighlightedText";
import { WhyTooltip } from "@/components/WhyTooltip";
import { usePendingAction } from "@/lib/usePendingAction";
import { useTaskCommentCount } from "@/lib/useTaskCommentCount";
import { statusChipClass, capitalize } from "@/lib/taskPresentation";
import type { Project, ProjectTask } from "@/types";

// "Follows: <upstream titles>" badge. Visible to everyone, not just
// organizers. Three render modes:
//   • 1 dep: "Follows: <title>"
//   • 2-3 deps: comma-joined "Follows: A, B, C"
//   • 4+ deps (collapsed): "Follows: <first> +N more" + tap to expand
//   • 4+ deps (expanded): inline popover with all titles, each
//     clickable to scroll to that upstream task row.
// Completed deps drop out at the caller — we only see unmet ones. The
// in-page jump targets the `#task-<id>` anchors the project list keeps.
function FollowsBadge({
  unmetDeps,
  expanded,
  onToggle,
  t,
}: {
  unmetDeps: { id: string; title: string }[];
  expanded: boolean;
  onToggle: () => void;
  t: (key: string, opts?: Record<string, unknown>) => string;
}) {
  const overflow = unmetDeps.length >= 4;
  if (!overflow) {
    const titles = unmetDeps.map((d) => d.title).join(", ");
    return (
      <span
        className="inline-flex items-center gap-1 text-xs text-moss-600 dark:text-moss-300"
        title={t("projects.task.followsHint")}
      >
        <span aria-hidden="true">→</span>
        {t("projects.task.follows", { titles })}
        <WhyTooltip principleId="follows-not-blocked" />
      </span>
    );
  }
  const first = unmetDeps[0];
  const rest = unmetDeps.length - 1;
  return (
    <span className="inline-flex flex-wrap items-center gap-1 text-xs text-moss-600 dark:text-moss-300">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-label={t("projects.task.followsExpandLabel")}
        className="inline-flex items-center gap-1 rounded-md px-1 py-0.5 hover:bg-moss-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-canopy-600 dark:hover:bg-moss-800"
        title={t("projects.task.followsHint")}
      >
        <span aria-hidden="true">→</span>
        {t("projects.task.followsMore", {
          titles: first.title,
          count: rest,
        })}
      </button>
      <WhyTooltip principleId="follows-not-blocked" />
      {expanded && (
        <ul className="basis-full pl-4">
          {unmetDeps.map((dep) => (
            <li key={dep.id}>
              <button
                type="button"
                className="text-left text-xs text-moss-700 underline decoration-moss-300 underline-offset-2 hover:text-canopy-700 dark:text-moss-200 dark:hover:text-canopy-300"
                onClick={() => {
                  const el = document.getElementById(`task-${dep.id}`);
                  el?.scrollIntoView({ behavior: "smooth", block: "center" });
                  (el?.querySelector("h3") as HTMLElement | null)?.focus?.();
                }}
              >
                {dep.title}
              </button>
            </li>
          ))}
        </ul>
      )}
    </span>
  );
}

// Slim project-list task card. The "scan" half of the per-task-page
// split: chips, title (drag handle), a ONE-LINE description preview, the
// one-tap Claim affordance, and an enriched "Open task · N comments"
// footer link to the task's own page. The full description, edit form,
// completion/confirm/release actions, claimer narrative, and the comment
// thread live in `TaskDetailBody` on that page. The Claim block is the
// single piece of JSX deliberately shared with the body (one tap from
// the list, but a deep-linker can still claim without bouncing back).
export function TaskCard({
  task,
  isOrganizer,
  acceptingClaims,
  projectStatus,
  currentKey,
  onRun,
  needsMoreHands,
  allTasks,
  searchQuery,
  taskCheckInDays,
}: {
  task: ProjectTask;
  isOrganizer: boolean;
  acceptingClaims: boolean;
  projectStatus: Project["status"];
  currentKey: string | undefined;
  onRun: <T>(action: () => Promise<T>) => Promise<T | null>;
  needsMoreHands: boolean;
  allTasks: readonly ProjectTask[];
  /** Node-configured private check-in window. Drives the claim-time
   *  commitment summary — the claimer sees "we'll check in with you
   *  privately after N days" adjacent to the Claim button so claiming
   *  isn't a black box. */
  taskCheckInDays: number;
  /** Optional active search query — when non-empty, every match in the
   *  task title is wrapped in <mark> via HighlightedText so the member
   *  sees why this row matched. The one-line description preview stays
   *  plain — the title is enough for finding tasks at a glance. */
  searchQuery?: string;
}) {
  const { t } = useTranslation();
  const [followsExpanded, setFollowsExpanded] = useState(false);
  const { pending, run: runWithPending } = usePendingAction();
  const dispatch = <T,>(action: () => Promise<T>) =>
    runWithPending(() => onRun(action));
  const commentCount = useTaskCommentCount(task.projectId, task.id);

  // Only unmet (non-completed) deps render in the Follows badge — a
  // completed upstream is no longer informative on the downstream row.
  const unmetDepTitles = useMemo(() => {
    return task.dependencies
      .map((id) => allTasks.find((tk) => tk.id === id))
      .filter((dep): dep is ProjectTask => !!dep && dep.status !== "completed")
      .map((dep) => ({ id: dep.id, title: dep.title }));
  }, [task.dependencies, allTasks]);
  const hasUnmetDeps = unmetDepTitles.length > 0;

  return (
    <div className="card flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`chip ${statusChipClass(task.status)}`}
          title={task.status}
        >
          {t(`projects.task.status${capitalize(task.status === "awaiting_confirmation" ? "Awaiting" : task.status)}` as `projects.task.statusOpen`)}
        </span>
        {/* Once a task is in motion, show the credit figure (the
            recorded actual hours, estimate fallback) so the chip never
            contradicts the signed ledger. Open tasks show the estimate. */}
        <span className="chip bg-canopy-50 text-canopy-900 dark:bg-canopy-950/50 dark:text-canopy-100">
          {formatHours(
            task.status === "awaiting_confirmation" ||
              task.status === "completed"
              ? creditHoursForTask(task)
              : task.estimatedHours,
          )}
        </span>
        {task.recurringCadence && (
          <span
            className="chip bg-moss-100 text-moss-800 dark:bg-moss-800 dark:text-moss-100"
            aria-label={t("projects.task.recurring.chipAria", {
              cadence: t(
                `projects.task.recurring.${task.recurringCadence}` as "projects.task.recurring.month",
              ),
            })}
          >
            <span aria-hidden="true" className="mr-1">
              {"\u21BB"}
            </span>
            {t(
              `projects.task.recurring.${task.recurringCadence}` as "projects.task.recurring.month",
            )}
          </span>
        )}
        {needsMoreHands && !hasUnmetDeps && (
          <span
            className="chip bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100"
            title={t("projects.task.needsMoreHandsTooltip")}
          >
            <span aria-hidden="true" className="mr-1">
              {"\u{1F91D}"}
            </span>
            {t("projects.task.needsMoreHands")}
            <WhyTooltip principleId="solidarity-not-shame" />
          </span>
        )}
        {hasUnmetDeps && (
          <FollowsBadge
            unmetDeps={unmetDepTitles}
            expanded={followsExpanded}
            onToggle={() => setFollowsExpanded((v) => !v)}
            t={t}
          />
        )}
      </div>
      <h3 className="text-base font-semibold leading-snug">
        {searchQuery && searchQuery.trim() !== "" ? (
          <HighlightedText text={task.title} query={searchQuery} />
        ) : (
          task.title
        )}
      </h3>
      {/* One-line preview only — NO whitespace-pre-wrap, so a multi-line
          description collapses to a single clamped line. The full,
          untruncated description lives on the task page. line-clamp-1 is
          a literal class so Tailwind generates it. */}
      {task.description && (
        <p className="line-clamp-1 text-sm text-moss-600 dark:text-moss-300">
          {stripMarkdown(task.description)}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {task.status === "open" && currentKey && !isOrganizer && !hasUnmetDeps && acceptingClaims && (
          <>
            <button
              type="button"
              className="btn-primary"
              disabled={pending}
              aria-busy={pending}
              onClick={() => dispatch(() => claimProjectTask(task.id, currentKey))}
            >
              {pending ? t("common.working") : t("projects.task.claim")}
            </button>
            {/* Claim-time commitment summary. NOT a blocking dialog
                — `asking-never-gated` means the affordance to step
                up has to stay one tap; the summary sits adjacent so
                the claimer sees what they're committing to without
                a gate. The "privately" wording pre-frames the
                check-in as the considerate nudge it is, not as a
                deadline. */}
            <p className="basis-full text-xs text-moss-600 dark:text-moss-300">
              {task.estimatedHours > 0
                ? t("projects.task.claimSummary", {
                    hours: task.estimatedHours,
                    days: taskCheckInDays,
                  })
                : t("projects.task.claimSummaryNoHours", {
                    days: taskCheckInDays,
                  })}
            </p>
          </>
        )}
        {task.status === "open" && !isOrganizer && !acceptingClaims && (
          <p className="text-xs text-moss-600 dark:text-moss-300">
            {projectStatus === "planning"
              ? t("projects.task.notClaimablePlanning")
              : projectStatus === "paused"
                ? t("projects.task.notClaimablePaused")
                : t("projects.task.notClaimableOther")}
          </p>
        )}
        {task.status === "open" && isOrganizer && projectStatus === "planning" && (
          <p className="text-xs text-moss-600 dark:text-moss-300">
            {t("projects.task.claimableAfterLaunch")}
          </p>
        )}
      </div>
      {/* Enriched footer link to the task's own page — a plain Link
          (never a button, so the suites that scan/click buttons by text
          don't see it). When the thread has comments, the count rides
          along so a member can tell a busy task from a quiet one before
          opening it; with zero, the plain "Open task ›" affordance. */}
      <Link
        to={`/project/${task.projectId}/task/${task.id}`}
        className="self-start text-xs font-medium text-moss-600 underline-offset-2 hover:underline dark:text-moss-300"
      >
        {commentCount > 0
          ? t("projects.task.openDetailWithCount", { count: commentCount })
          : t("projects.task.openDetail")}
      </Link>
    </div>
  );
}
