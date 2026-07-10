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
import { Fragment, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useToast } from "@/state/ToastContext";
import {
  addProjectTask,
  canClaimTask,
  claimProjectTask,
  confirmProjectTaskCompletion,
  editProjectTask,
  markProjectTaskComplete,
  unclaimProjectTask,
} from "@/db/projects";
import { formatHours } from "@/lib/format";
import { creditHoursForTask } from "@/lib/timebank";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { WhyTooltip } from "@/components/WhyTooltip";
import { TaskComments } from "@/components/TaskComments";
import { Markdown } from "@/components/Markdown";
import { MarkdownHint } from "@/components/MarkdownHint";
import { OverflowMenu, type OverflowMenuItem } from "@/components/OverflowMenu";
import { shareUrl } from "@/lib/share";
import { matchTaskSkills } from "@/lib/taskSkillMatch";
import { getTaskTips } from "@/content/taskTips";
import { usePendingAction } from "@/lib/usePendingAction";
import type { Project, ProjectTask, Urgency } from "@/types";

// The "act" half of the per-task-page split. Renders everything the
// slim project-list `TaskCard` deliberately drops: the full edit form,
// the untruncated description, the claimer-side note + claimed/completed
// lines, the action container (Claim — shared with the card so a member
// who deep-links to an open task can claim without bouncing back — plus
// Edit, mark-complete disclosure, organizer confirm trigger, completer
// release, third-party awaiting line, and add-fresh-copy), the
// awaiting-confirmation narrative + dialog, and the comment thread.
//
// It has no notion of search highlighting, drag handles, move buttons,
// or the comment-count footer link — those are list-only and live on
// the card. Owns its OWN usePendingAction() so an in-flight claim and an
// in-flight edit never share a disabled flag.
export function TaskDetailBody({
  task,
  isOrganizer,
  acceptingClaims,
  projectStatus,
  currentKey,
  memberMap,
  nodeId,
  onRun,
  needsMoreHands,
  allTasks,
  flaggedCommentIds,
  taskCheckInDays,
  autoConfirmHours,
  viewerSkills,
  templateId,
}: {
  task: ProjectTask;
  isOrganizer: boolean;
  acceptingClaims: boolean;
  projectStatus: Project["status"];
  currentKey: string | undefined;
  memberMap: Map<string, string>;
  nodeId: string;
  onRun: <T>(action: () => Promise<T>) => Promise<T | null>;
  needsMoreHands: boolean;
  allTasks: readonly ProjectTask[];
  flaggedCommentIds: ReadonlySet<string>;
  /** The viewer's own profile skills, for the positive "fits your
   *  skills" cue on this task's suggested skills. */
  viewerSkills: readonly string[];
  /** The project's `templateId` (null for from-scratch projects).
   *  Resolves this task's authored, TASK-specific tip — matched by
   *  title against the template's task list (content/taskTips.ts).
   *  Deliberately not the project-level playbook: that stays on the
   *  project page. */
  templateId: string | null;
  /** Node-configured private check-in window. Drives the claim-time
   *  commitment summary in the (deep-link) Claim block — mirrored from
   *  the card so a member who lands on an open task's page can claim
   *  without bouncing back to the list. */
  taskCheckInDays: number;
  /** From `nodeConfig.autoConfirmHours`. 0 (or no nodeConfig) means
   *  the sweep is off, and the claimer narrative omits its safety-net
   *  line entirely. */
  autoConfirmHours: number;
}) {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const isAssignee = task.assignedTo === currentKey;
  const isCompleter = task.completedBy === currentKey;
  const { pending, run: runWithPending } = usePendingAction();
  const dispatch = <T,>(action: () => Promise<T>) =>
    runWithPending(() => onRun(action));

  // Unmet (non-completed) upstream tasks. The list card carries a
  // "Follows" badge, but the task's OWN page deliberately dropped it —
  // so a member who deep-links straight to this task never saw what has
  // to happen first. Surface it here, linking to each upstream task.
  const unmetDeps = useMemo(
    () =>
      task.dependencies
        .map((id) => allTasks.find((tk) => tk.id === id))
        .filter((d): d is ProjectTask => !!d && d.status !== "completed")
        .map((d) => ({ id: d.id, title: d.title })),
    [task.dependencies, allTasks],
  );

  // Positive-only skill fit (never surfaces what's missing).
  const skillMatch = useMemo(
    () => matchTaskSkills(task.requiredSkills, viewerSkills),
    [task.requiredSkills, viewerSkills],
  );

  // The task's own authored tip (content/taskTips.ts), re-derived from
  // the template id + this task's (verbatim-from-template) title. Null
  // for from-scratch projects, renamed tasks, or organizer-added tasks
  // — the block simply doesn't render.
  const locale = i18n.resolvedLanguage ?? "en";
  const taskTip = useMemo(
    () => getTaskTips(templateId, task.title, locale),
    [templateId, task.title, locale],
  );

  const [showAcknowledgment, setShowAcknowledgment] = useState(false);
  const [acknowledgmentText, setAcknowledgmentText] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  // Mark-complete inline disclosure: tapping "Mark complete" reveals an
  // hours field (prefilled with the estimate) so the claimer records
  // the time actually given before submitting (equal-time). One extra
  // tap when actual == estimate; release stays one-tap and ungated.
  const [markingComplete, setMarkingComplete] = useState(false);
  const [actualHoursInput, setActualHoursInput] = useState("");
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);
  const [editHours, setEditHours] = useState(String(task.estimatedHours));
  const [editUrgency, setEditUrgency] = useState<Urgency>(task.urgency);
  const [editDeps, setEditDeps] = useState<string[]>(task.dependencies);

  // Claimer-side note: visible only to the claimant when the task is
  // structurally blocked. canClaimTask reads the full task list to
  // include not-yet-loaded dep titles that have completed.
  const isClaimant = task.assignedTo === currentKey;
  const isStructurallyBlocked = !canClaimTask(task, allTasks);
  const showClaimerNote =
    isClaimant && isStructurallyBlocked && task.status === "claimed";

  // Add-fresh-copy handler. Staged copy keeps every field except the
  // dependencies (the original's upstream is done, so copying their ids
  // would gate on nothing while risking a dangling reference). Lifted out
  // of the inline button so the header menu can drive it; the success
  // toast travels with it.
  async function handleAddFreshCopy() {
    const created = await dispatch(() =>
      addProjectTask(task.projectId, currentKey!, {
        title: task.title,
        description: task.description,
        category: task.category,
        estimatedHours: task.estimatedHours,
        urgency: task.urgency,
        requiredSkills: [...task.requiredSkills],
        dependencies: [],
      }),
    );
    if (created) {
      showToast(
        t("projects.task.addFreshCopy.toast", {
          title: task.title,
        }),
      );
    }
  }

  // Copy-link handler. Shares the canonical task URL via the share
  // helper (native sheet → clipboard fallback). A cancelled share stays
  // quiet; a copy/share toasts the confirmation; a hard failure surfaces
  // the existing manual-copy guidance as an error.
  async function handleCopyLink() {
    const result = await shareUrl({
      url: `${window.location.origin}/project/${task.projectId}/task/${task.id}`,
      title: task.title,
    });
    if (result === "copied" || result === "shared") {
      showToast(t("common.linkCopied"));
    } else if (result === "failed") {
      showToast(t("common.copyFailed"), { tone: "error" });
    }
    // "cancelled" → stay silent.
  }

  // Header overflow-menu actions. Built conditionally so a viewer only
  // ever sees the actions they can take. Edit and Add-fresh-copy reuse
  // the exact gates their inline buttons used; Copy link is always
  // available.
  const menuItems: OverflowMenuItem[] = [];
  if (task.status === "open" && isOrganizer) {
    menuItems.push({
      key: "edit",
      label: t("projects.task.edit.button"),
      onSelect: () => setEditing(true),
    });
  }
  if (
    task.status === "completed" &&
    isOrganizer &&
    projectStatus !== "completed" &&
    projectStatus !== "archived"
  ) {
    menuItems.push({
      key: "fresh-copy",
      label: t("projects.task.addFreshCopy.button"),
      onSelect: () => {
        void handleAddFreshCopy();
      },
    });
  }
  menuItems.push({
    key: "copy-link",
    label: t("common.copyLink"),
    onSelect: () => {
      void handleCopyLink();
    },
  });

  if (editing) {
    return (
      <div className="card flex flex-col gap-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">
            {t("projects.task.addTask.fieldTitle")}
          </span>
          <input
            className="input"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            maxLength={120}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">
            {t("projects.task.addTask.fieldDescription")}
          </span>
          <textarea
            className="input min-h-20"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            maxLength={1000}
          />
          <MarkdownHint />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">
              {t("projects.task.addTask.fieldHours")}
            </span>
            <input
              type="number"
              inputMode="decimal"
              min="0.25"
              step="0.25"
              className="input"
              value={editHours}
              onChange={(e) => setEditHours(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">
              {t("projects.task.addTask.fieldUrgency")}
            </span>
            <select
              className="input"
              value={editUrgency}
              onChange={(e) => setEditUrgency(e.target.value as Urgency)}
            >
              <option value="low">{t("urgency.low")}</option>
              <option value="medium">{t("urgency.medium")}</option>
              <option value="high">{t("urgency.high")}</option>
            </select>
          </label>
        </div>
        {/* Dependency picker. Multi-select of in-project tasks
            excluding this one. Saved via editProjectTask (which
            calls detectCycle + in-project-membership checks). The
            soft cap of 10 keeps the "Follows:" badge legible. */}
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">{t("projects.task.dependsOn")}</span>
          <select
            multiple
            data-testid={`deps-${task.id}`}
            className="input min-h-[6rem]"
            value={editDeps}
            onChange={(e) => {
              const picked = Array.from(
                e.target.selectedOptions,
                (o) => o.value,
              );
              setEditDeps(picked);
            }}
          >
            {allTasks
              .filter((other) => other.id !== task.id)
              .map((other) => (
                <option key={other.id} value={other.id}>
                  {other.title}
                </option>
              ))}
          </select>
          <span className="text-xs text-moss-600 dark:text-moss-300">
            {t("projects.task.dependsOnHint")}
          </span>
        </label>
        <div className="flex flex-wrap gap-2 self-end">
          <button
            type="button"
            className="btn-ghost"
            disabled={pending}
            onClick={() => {
              setEditing(false);
              setEditTitle(task.title);
              setEditDescription(task.description);
              setEditHours(String(task.estimatedHours));
              setEditUrgency(task.urgency);
              setEditDeps(task.dependencies);
            }}
          >
            {t("projects.task.edit.cancel")}
          </button>
          <button
            type="button"
            className="btn-primary"
            disabled={pending}
            aria-busy={pending}
            onClick={async () => {
              const h = Number.parseFloat(editHours);
              if (!Number.isFinite(h) || h <= 0) return;
              if (editDeps.length > 10) {
                await onRun(() =>
                  Promise.reject(
                    new Error(t("projects.task.dependencyTooManyError")),
                  ),
                );
                return;
              }
              // Use editProjectTask's dependencies field — single
              // transaction, single save, cycle detection in the
              // action layer. Cycles surface as a toast via onRun.
              const ok = await dispatch(() =>
                editProjectTask(task.id, currentKey!, {
                  title: editTitle,
                  description: editDescription,
                  estimatedHours: h,
                  urgency: editUrgency,
                  dependencies: editDeps,
                }),
              );
              if (ok) setEditing(false);
            }}
          >
            {pending ? t("common.working") : t("projects.task.edit.save")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card flex flex-col gap-2">
      {/* The kebab (Copy link always, plus Edit / Add-fresh-copy when
          the gate allows) shares the top line with the task's lead
          text instead of owning a full row above it — same right-aligned
          control, no wasted vertical band. `items-start` pins it to the
          first line even when the description wraps; if there's no lead
          text the row collapses to just the kebab. */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {showClaimerNote && (
            <p className="text-xs italic text-moss-600 dark:text-moss-300">
              {t("projects.task.waitingOnClaimerNote")}
            </p>
          )}
          {task.description && (
            <Markdown
              text={task.description}
              className="text-sm text-moss-600 dark:text-moss-300"
            />
          )}
        </div>
        <div className="shrink-0">
          <OverflowMenu
            label={t("projects.task.menuLabel")}
            items={menuItems}
          />
        </div>
      </div>
      {unmetDeps.length > 0 && (
        <p className="text-sm text-moss-600 dark:text-moss-300">
          <span aria-hidden="true">{"→"}</span>{" "}
          <span className="font-medium">
            {t("projects.task.detail.followsLabel")}
          </span>{" "}
          {unmetDeps.map((d, i) => (
            <Fragment key={d.id}>
              {i > 0 && ", "}
              <Link
                to={`/project/${task.projectId}/task/${d.id}`}
                className="underline decoration-moss-300 underline-offset-2 hover:text-canopy-700 dark:hover:text-canopy-300"
              >
                {d.title}
              </Link>
            </Fragment>
          ))}
        </p>
      )}
      {task.requiredSkills.length > 0 && (
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-medium text-moss-700 dark:text-moss-200">
              {t("projects.task.detail.skillsLabel")}
            </span>
            {task.requiredSkills.map((s) => {
              const fits = skillMatch.matched.includes(s);
              return (
                <span
                  key={s}
                  className={`chip ${
                    fits
                      ? "bg-canopy-100 text-canopy-900 dark:bg-canopy-900/60 dark:text-canopy-100"
                      : "bg-moss-100 text-moss-700 dark:bg-moss-800 dark:text-moss-200"
                  }`}
                >
                  {fits && (
                    <span aria-hidden="true" className="mr-1">
                      {"✓"}
                    </span>
                  )}
                  {s}
                </span>
              );
            })}
          </div>
          {skillMatch.hasMatch && (
            <p className="text-xs text-canopy-700 dark:text-canopy-300">
              {t("projects.task.detail.skillsFit")}
            </p>
          )}
        </div>
      )}
      {/* The one authored, TASK-specific pointer for this template task
          — a gotcha or order-of-operations the description doesn't say.
          1–2 sentences, always visible (unlike the project page's
          collapsed playbook: this is about THIS task, so it earns its
          lines). */}
      {taskTip && (
        <p className="rounded-md border border-canopy-100 bg-canopy-50/40 px-3 py-2 text-sm text-moss-700 dark:border-canopy-900 dark:bg-canopy-950/20 dark:text-moss-200">
          <span className="font-semibold text-canopy-800 dark:text-canopy-200">
            {t("projects.task.detail.tipsLabel")}
          </span>{" "}
          {taskTip}
        </p>
      )}
      {task.recurringCadence && (
        <p className="text-xs text-moss-600 dark:text-moss-300">
          <span aria-hidden="true" className="mr-1">
            {"\u21BB"}
          </span>
          {t(
            `projects.task.recurring.${task.recurringCadence}` as "projects.task.recurring.month",
          )}
          {" — "}
          {t("projects.task.recurring.detailHint")}
        </p>
      )}
      {task.assignedTo &&
        (task.status === "awaiting_confirmation" ? (
          <p className="text-xs text-moss-600 dark:text-moss-300">
            {t("projects.task.completedBy", {
              name: memberMap.get(task.completedBy ?? "") ?? "—",
            })}
          </p>
        ) : !needsMoreHands ? (
          // Solidarity-not-shame: once a task is community-visibly
          // marked "could use more hands," the original claimer's
          // name is dropped from the public row. The task is
          // community work again; the claimer's own actions are
          // still surfaced to them via their AttentionSection and
          // the in-row buttons below.
          <p className="text-xs text-moss-600 dark:text-moss-300">
            {t("projects.task.claimedBy", {
              name: memberMap.get(task.assignedTo) ?? "—",
            })}
          </p>
        ) : null)}
      <div className="flex flex-wrap items-center gap-2">
        {/* Dependencies never gate Claim — they're soft per
            docs/task-ordering-and-dependencies.md §3 (operator-affirmed).
            The Follows line above says what's still upstream, and after
            claiming, the claimer note explains the wait. */}
        {task.status === "open" && currentKey && !isOrganizer && acceptingClaims && (
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
            {/* Claim-time commitment summary, mirrored from the card so
                a member who deep-links to an open task can claim here
                without bouncing back to the list. */}
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
        {task.status === "claimed" && isAssignee && !markingComplete && (
          <>
            <button
              type="button"
              className="btn-primary"
              disabled={pending}
              onClick={() => {
                setActualHoursInput(String(task.estimatedHours));
                setMarkingComplete(true);
              }}
            >
              {t("projects.task.markDone")}
            </button>
            <button
              type="button"
              className="btn-ghost"
              disabled={pending}
              onClick={() =>
                dispatch(() => unclaimProjectTask(task.id, currentKey!))
              }
            >
              {t("projects.task.release")}
            </button>
            {/* `solidarity-not-shame`: keep release one-tap (no
                confirm dialog gating a member who's already trying
                to communicate "I can't carry this") and let the
                muted line near the button carry the reassurance.
                The framing names that releasing HELPS — it routes
                the work to someone who can carry it — and that no
                one is keeping score. */}
            <p className="basis-full text-xs text-moss-600 dark:text-moss-300">
              {t("projects.task.releaseReassurance")}
            </p>
          </>
        )}
        {task.status === "claimed" && isAssignee && markingComplete && (
          <div className="basis-full flex flex-col gap-2 rounded-md border border-canopy-100 bg-canopy-50/40 p-3 dark:border-canopy-900 dark:bg-canopy-950/20">
            <label className="flex flex-col gap-1 text-xs text-moss-700 dark:text-moss-200">
              <span className="font-medium">
                {t("projects.task.actualHours.legend")}
                <WhyTooltip principleId="equal-time" />
              </span>
              <input
                type="number"
                inputMode="decimal"
                min="0.25"
                step="0.25"
                className="input max-w-[8rem]"
                value={actualHoursInput}
                onChange={(e) => setActualHoursInput(e.target.value)}
                aria-label={t("projects.task.actualHours.legend")}
              />
              <span className="text-moss-600 dark:text-moss-300">
                {t("projects.task.actualHours.estimateContext", {
                  hours: formatHours(task.estimatedHours),
                })}
              </span>
            </label>
            {/* Fact-recording, not haggling: the credit should match the
                help given. No "you went over" framing
                (solidarity-not-shame). */}
            <p className="text-xs text-moss-600 dark:text-moss-300">
              {t("projects.task.actualHours.hint")}
            </p>
            {(() => {
              const parsed = Number.parseFloat(actualHoursInput);
              const valid = Number.isFinite(parsed) && parsed > 0;
              return (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={pending || !valid}
                    aria-busy={pending}
                    onClick={async () => {
                      const ok = await dispatch(() =>
                        markProjectTaskComplete(task.id, currentKey!, parsed),
                      );
                      if (ok) setMarkingComplete(false);
                    }}
                  >
                    {pending
                      ? t("common.working")
                      : t("projects.task.actualHours.confirmCta", {
                          hours: formatHours(
                            valid ? parsed : task.estimatedHours,
                          ),
                        })}
                  </button>
                  <button
                    type="button"
                    className="btn-ghost"
                    disabled={pending}
                    onClick={() => setMarkingComplete(false)}
                  >
                    {t("projects.task.actualHours.cancel")}
                  </button>
                </div>
              );
            })()}
          </div>
        )}
        {task.status === "awaiting_confirmation" && isOrganizer && !isCompleter && (
          <button
            type="button"
            className="btn-primary"
            disabled={pending}
            aria-busy={pending}
            onClick={() => setConfirmDialogOpen(true)}
          >
            {pending ? t("common.working") : t("projects.task.confirm")}
          </button>
        )}
        {/* Completer's release path. Until this PR, attempting to
            release an awaiting_confirmation task threw on the db
            side and there was no UI for it at all. The button is
            offered only to the completer (the claimer who marked
            done) — third parties don't get to walk the task back. */}
        {task.status === "awaiting_confirmation" && isCompleter && (
          <button
            type="button"
            className="btn-ghost"
            disabled={pending}
            onClick={() =>
              dispatch(() => unclaimProjectTask(task.id, currentKey!))
            }
          >
            {t("projects.task.releaseAfterComplete")}
          </button>
        )}
        {task.status === "awaiting_confirmation" && !isOrganizer && !isCompleter && (
          <span className="text-xs text-moss-600 dark:text-moss-300">
            {t("projects.task.awaitingConfirmation")}
          </span>
        )}
      </div>
      {/* Claimer-side narrative (PR #226's voice — "credit moves when
          ..."). Visible only to the completer of an awaiting task;
          tells them the plain story while they wait. Mirrors
          ExchangeStateNarrative's auto-confirm safety-net pattern
          (ceil hours/24, min 1) so the post-side and task-side
          windows read identically. */}
      {task.status === "awaiting_confirmation" && isCompleter && (
        <div className="rounded-md border border-canopy-100 bg-canopy-50/50 px-3 py-2 text-xs text-moss-600 dark:border-canopy-900 dark:bg-canopy-950/30 dark:text-moss-300">
          <p>
            {t("projects.task.claimerNarrative.intro", {
              hours: formatHours(creditHoursForTask(task)),
            })}
          </p>
          {task.actualHours !== null &&
            task.actualHours !== task.estimatedHours && (
              <p className="mt-1">
                {t("projects.task.claimerNarrative.estimateNote", {
                  actual: formatHours(task.actualHours),
                  estimate: formatHours(task.estimatedHours),
                })}
              </p>
            )}
          {autoConfirmHours > 0 && (
            <p className="mt-1">
              {t("projects.task.claimerNarrative.autoConfirm", {
                count: Math.max(1, Math.ceil(autoConfirmHours / 24)),
              })}
            </p>
          )}
        </div>
      )}
      {task.status === "awaiting_confirmation" && isOrganizer && !isCompleter && (
        <ConfirmDialog
          open={confirmDialogOpen}
          title={t("projects.task.confirmDialog.title")}
          description={
            <div className="flex flex-col gap-3">
              <p>
                {t("projects.task.confirmDialog.body", {
                  claimer: memberMap.get(task.completedBy ?? "") ?? "—",
                  hours: formatHours(creditHoursForTask(task)),
                })}
              </p>
              {task.actualHours !== null &&
                task.actualHours !== task.estimatedHours && (
                  <p className="text-sm text-moss-600 dark:text-moss-300">
                    {t("projects.task.confirmDialog.estimateNote", {
                      claimer: memberMap.get(task.completedBy ?? "") ?? "—",
                      actual: formatHours(task.actualHours),
                      estimate: formatHours(task.estimatedHours),
                    })}
                  </p>
                )}
              {/* Acknowledgment lives inside the dialog so the
                  organizer makes one decision in one moment — no
                  stacked dialogs, no second-layer modal for the
                  optional note. */}
              {!showAcknowledgment ? (
                <button
                  type="button"
                  className="self-start text-xs text-canopy-700 underline decoration-canopy-300 underline-offset-2 hover:text-canopy-900 dark:text-canopy-300 dark:decoration-canopy-700 dark:hover:text-canopy-100"
                  onClick={() => setShowAcknowledgment(true)}
                >
                  {t("projects.task.acknowledgment.toggle")}
                </button>
              ) : (
                <div className="flex flex-col gap-1">
                  <textarea
                    className="input min-h-16 text-sm"
                    placeholder={t("projects.task.acknowledgment.placeholder")}
                    value={acknowledgmentText}
                    onChange={(e) => setAcknowledgmentText(e.target.value)}
                    maxLength={500}
                  />
                  <p className="text-xs text-moss-600 dark:text-moss-300">
                    {t("projects.task.acknowledgment.hint")}
                  </p>
                </div>
              )}
            </div>
          }
          confirmLabel={t("projects.task.confirmDialog.confirmCta")}
          confirmingLabel={t("projects.task.confirmDialog.confirming")}
          cancelLabel={t("projects.task.confirmDialog.cancelCta")}
          tone="neutral"
          onCancel={() => setConfirmDialogOpen(false)}
          onConfirm={() => {
            setConfirmDialogOpen(false);
            return dispatch(() =>
              confirmProjectTaskCompletion(
                task.id,
                currentKey!,
                nodeId,
                acknowledgmentText,
              ),
            );
          }}
        />
      )}
      <TaskComments
        projectId={task.projectId}
        taskId={task.id}
        currentKey={currentKey}
        memberMap={memberMap}
        nodeId={nodeId}
        flaggedCommentIds={flaggedCommentIds}
      />
    </div>
  );
}
