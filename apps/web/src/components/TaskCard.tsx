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
import { getTaskTips } from "@/content/taskTips";
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
        className="relative z-[2] inline-flex items-center gap-1 text-xs text-moss-600 dark:text-moss-300"
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
    <span className="relative z-[2] inline-flex flex-wrap items-center gap-1 text-xs text-moss-600 dark:text-moss-300">
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
                  // Land focus on the destination row's title link (the
                  // whole card is a link now); fall back to the row's own
                  // tabIndex=-1 <li> anchor.
                  (
                    (el?.querySelector("h3 a") as HTMLElement | null) ?? el
                  )?.focus?.();
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
// split: chips, title, a ONE-LINE description preview, and the one-tap
// Claim affordance. The full description, edit form, completion/confirm/
// release actions, claimer narrative, and the comment thread live in
// `TaskDetailBody` on that page.
//
// The WHOLE card is a link to the task's page — the title carries a
// "stretched link" (`after:absolute after:inset-0`) so a tap or click
// anywhere on the card opens the task, and there's no separate "Open
// task" footer eating a row. The card is a real `<a>` (via the title),
// so keyboard and screen-reader users get proper link semantics; the
// interactive controls that must NOT trigger the open (Claim, the
// Follows badge's buttons) sit at `relative z-[2]`, above the stretched
// overlay. The comment count — the "busy vs quiet" signal that used to
// ride the footer — moves to a chip in the header row. The Claim block
// is deliberately shared with the body (one tap from the list, but a
// deep-linker can still claim without bouncing back).
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
  templateId,
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
  /** The project's `templateId` (null for from-scratch projects) —
   *  resolves the task's authored tip for the claim-moment block, so
   *  the first concrete step lands exactly when momentum is highest
   *  and the claimer hasn't left the list. */
  templateId: string | null;
}) {
  const { t, i18n } = useTranslation();
  const [followsExpanded, setFollowsExpanded] = useState(false);
  // Set the moment THIS render's Claim succeeds — gates the claim-
  // moment block so it appears only in the transition moment, not on
  // every claimed row forever.
  const [justClaimed, setJustClaimed] = useState(false);
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

  // The task's authored tip (content/taskTips.ts) — the claim-moment
  // block reuses it as "a good first step" so a new claimer leaves
  // the moment with something concrete to do first.
  const locale = i18n.resolvedLanguage ?? "en";
  const claimMomentTip = useMemo(
    () => getTaskTips(templateId, task.title, locale),
    [templateId, task.title, locale],
  );

  return (
    <div className="card relative flex flex-col gap-2 transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-canopy-500 dark:focus-within:ring-canopy-400">
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
        {/* Comment-count signal — the "busy vs quiet" cue that used to
            live on the removed "Open task · N comments" footer. A plain
            non-interactive chip, so it sits under the stretched link and
            a tap on it still opens the task. */}
        {commentCount > 0 && (
          <span
            className="chip bg-moss-100 text-moss-700 dark:bg-moss-800 dark:text-moss-200"
            aria-label={t("projects.task.commentCountChip", {
              count: commentCount,
            })}
            title={t("projects.task.commentCountChip", { count: commentCount })}
          >
            <span aria-hidden="true" className="mr-1">
              {"\u{1F4AC}"}
            </span>
            {commentCount}
          </span>
        )}
      </div>
      {/* The title carries the stretched link: `after:absolute
          after:inset-0` makes its ::after fill the card, so a tap
          anywhere that isn't a raised control opens the task. focus:
          outline-none because the card shows a focus-within ring. */}
      <h3 className="text-base font-semibold leading-snug">
        <Link
          to={`/project/${task.projectId}/task/${task.id}`}
          className="text-moss-900 after:absolute after:inset-0 after:z-[1] after:content-[''] hover:text-canopy-700 focus:outline-none dark:text-moss-50 dark:hover:text-canopy-300"
        >
          {searchQuery && searchQuery.trim() !== "" ? (
            <HighlightedText text={task.title} query={searchQuery} />
          ) : (
            task.title
          )}
        </Link>
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
        {task.status === "open" && currentKey && !isOrganizer && acceptingClaims && (
          <>
            <button
              type="button"
              className="btn-primary relative z-[2]"
              disabled={pending}
              aria-busy={pending}
              onClick={async () => {
                const claimed = await dispatch(() =>
                  claimProjectTask(task.id, currentKey),
                );
                if (claimed) setJustClaimed(true);
              }}
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
        {/* Claim-moment block: appears in place of the Claim button
            the instant a claim lands, holding the moment's momentum —
            what's the first concrete move? Persistent (not a toast:
            4 seconds isn't enough to act on), and gone on the next
            visit. role="status" so screen readers hear the claim
            landed without an interrupting alert. */}
        {justClaimed &&
          task.status === "claimed" &&
          task.assignedTo === currentKey && (
            <div
              role="status"
              className="basis-full rounded-md border border-canopy-100 bg-canopy-50/50 px-3 py-2 text-sm text-moss-700 dark:border-canopy-900 dark:bg-canopy-950/30 dark:text-moss-200"
            >
              <p className="font-semibold text-canopy-800 dark:text-canopy-200">
                {t("projects.task.claimMoment.yours")}
              </p>
              {claimMomentTip && (
                <p className="mt-1">
                  {t("projects.task.claimMoment.firstStep")} {claimMomentTip}
                </p>
              )}
              <p className="mt-1 text-xs">
                <Link
                  to={`/project/${task.projectId}/task/${task.id}`}
                  className="relative z-[2] text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
                >
                  {t("projects.task.claimMoment.planLink")}
                </Link>
              </p>
            </div>
          )}
      </div>
    </div>
  );
}
