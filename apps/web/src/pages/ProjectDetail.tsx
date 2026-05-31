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
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import { useToast } from "@/state/ToastContext";
import {
  addCoOrganizer,
  addProjectTask,
  archiveProject,
  bulkAddTasks,
  canClaimTask,
  claimProjectTask,
  cloneProject,
  completeProject,
  confirmProjectTaskCompletion,
  editProjectTask,
  handoffOrganizer,
  isOrganizer,
  launchProject,
  listActivityForProject,
  listAnnouncements,
  markProjectTaskComplete,
  pauseProject,
  postAnnouncement,
  removeCoOrganizer,
  resumeProject,
  unarchiveProject,
  unclaimProjectTask,
} from "@/db/projects";
import { humanizeError } from "@/lib/humanizeError";
import { matchesQuery } from "@/lib/messageSearch";
import { matchesFilter, type TaskFilter } from "@/lib/taskFilter";
import { HighlightedText } from "@/components/HighlightedText";
import { ALL_CATEGORIES, CATEGORY_META } from "@/lib/categories";
import { formatDeadline, formatHours, formatRelativeTime } from "@/lib/format";
import { taskCheckInState } from "@/lib/taskCheckInState";
import { computeProjectMomentum } from "@/lib/projectMomentum";
import { ProjectSparkline } from "@/components/ProjectSparkline";
import { ProjectMomentumChip } from "@/components/ProjectMomentumChip";
import { EmptyState } from "@/components/EmptyState";
import { usePendingAction } from "@/lib/usePendingAction";
import { WhyTooltip } from "@/components/WhyTooltip";
import { TaskComments } from "@/components/TaskComments";
import type {
  Member,
  Project,
  ProjectCategory,
  ProjectTask,
  Urgency,
} from "@/types";

// Density cap on the project "Updates" feed. listAnnouncements
// returns newest → oldest, so when collapsed we keep the first N.
// A long-running project's history can't push later sections off
// screen; "Show older (N)" expands the full set.
const MAX_VISIBLE_ANNOUNCEMENTS = 5;

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    projects,
    projectTasks,
    members,
    currentMember,
    nodeId,
    nodeConfig,
    exchanges,
    proposals,
  } = useApp();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [error, setError] = useState<string | null>(null);
  // Per-project task search + status filter. Both are session-only
  // (no URL, no Dexie, no localStorage) — opening a project page
  // always starts with a fresh "All" filter and an empty query.
  // The 250 ms debounce matches the Board/Messages search pattern;
  // small enough to feel live, long enough to skip mid-word
  // re-filters.
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [taskFilter, setTaskFilter] = useState<TaskFilter>("all");

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedQuery(query), 250);
    return () => window.clearTimeout(id);
  }, [query]);

  const project = useMemo(
    () => projects.find((p) => p.id === id) ?? null,
    [projects, id],
  );
  const tasks = useMemo(
    () =>
      projectTasks
        .filter((task) => task.projectId === id)
        .sort((a, b) => a.createdAt - b.createdAt),
    [projectTasks, id],
  );
  // Compose the status pill with the debounced search. `matchesQuery`
  // is the shared case-insensitive trimmed substring matcher used
  // across Board and Messages; the empty-query short-circuit is
  // hoisted here so unfiltered scrolling stays cheap.
  const trimmedQuery = debouncedQuery.trim();
  const visibleTasks = useMemo(() => {
    return tasks
      .filter((task) => matchesFilter(task, taskFilter))
      .filter((task) => {
        if (trimmedQuery === "") return true;
        return matchesQuery(
          `${task.title} ${task.description ?? ""}`,
          trimmedQuery,
        );
      });
  }, [tasks, taskFilter, trimmedQuery]);
  // Derive the set of comment ids with an open dispute proposal so
  // TaskComments can render the "Flagged" chip and hide the Flag
  // button. Computed in memory from the proposals already loaded in
  // AppContext rather than a separate Dexie query — the proposals
  // list is small enough that the O(n) scan is cheap.
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

  const memberMap = useMemo(
    () => new Map(members.map((m) => [m.publicKey, m.displayName])),
    [members],
  );

  if (!project) {
    return (
      <div className="px-4 pt-6">
        <p className="text-sm text-moss-600 dark:text-moss-300">
          {t("projects.detail.notFound")}
        </p>
        <button
          type="button"
          className="btn-secondary mt-4"
          onClick={() => navigate("/")}
        >
          {t("projects.detail.back")}
        </button>
      </div>
    );
  }

  const isOrg = currentMember ? isOrganizer(project, currentMember.publicKey) : false;
  const isPrimaryOrganizer = currentMember?.publicKey === project.organizerKey;
  const percent =
    project.targetHours > 0
      ? Math.min(
          100,
          Math.round((project.contributedHours / project.targetHours) * 100),
        )
      : 0;
  const momentum = computeProjectMomentum({
    project,
    tasks,
    exchanges,
  });
  const contributors = new Set(
    tasks
      .filter((task) => task.status === "completed" && task.completedBy)
      .map((task) => task.completedBy as string),
  );

  async function run<T>(action: () => Promise<T>): Promise<T | null> {
    try {
      setError(null);
      return await action();
    } catch (err) {
      const message = humanizeError(err);
      setError(message);
      // Project actions (claim task, confirm completion, launch,
      // etc.) often happen via small in-row buttons that scroll
      // out of view. Surface the failure as an error toast with
      // Retry so the user can recover without finding the button
      // again.
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

  return (
    <div className="px-4 pb-8 pt-4">
      <button
        type="button"
        className="btn-ghost -ml-2 mb-3 text-sm"
        onClick={() => navigate("/")}
      >
        {t("projects.detail.back")}
      </button>

      {project.status === "planning" && (
        <PlanningBanner project={project} isOrganizer={isOrg} onRun={run} />
      )}

      <div className="card mb-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="chip bg-moss-100 text-moss-700 dark:bg-moss-800 dark:text-moss-200">
            {t(`projects.status${capitalize(project.status)}` as `projects.statusActive`)}
          </span>
          <span className="chip bg-canopy-50 text-canopy-900 dark:bg-canopy-950/50 dark:text-canopy-100">
            {project.category.replace(/_/g, " ")}
          </span>
          <ProjectMomentumChip
            state={momentum.state}
            hoursLast7Days={momentum.hoursLast7Days}
          />
        </div>
        <h1 className="text-2xl font-bold leading-tight">{project.title}</h1>
        {project.description && (
          <p className="mt-2 whitespace-pre-wrap text-sm text-moss-700 dark:text-moss-200">
            {project.description}
          </p>
        )}
        <div className="mt-4">
          <div
            className="h-3 overflow-hidden rounded-full bg-moss-100 dark:bg-moss-800"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
          >
            <div
              className="h-full rounded-full bg-canopy-600 transition-[width] duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="mt-1 text-sm text-moss-600 dark:text-moss-300">
            {t("projects.progressLabel", {
              contributed: formatHours(project.contributedHours),
              target: formatHours(project.targetHours),
              percent,
            })}
          </p>
          <div className="mt-3 text-canopy-700 dark:text-canopy-300">
            <ProjectSparkline daily={momentum.daily} />
          </div>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <Field
            label={t("projects.byOrganizer", {
              name: memberMap.get(project.organizerKey) ?? "—",
            })}
          >
            {formatRelativeTime(project.createdAt)}
          </Field>
          {project.locationZone && (
            <Field label={t("projects.detail.area", { area: project.locationZone })}>
              {project.locationZone}
            </Field>
          )}
          {project.deadline && (
            <Field label={t("projects.detail.deadline")}>
              {formatDeadline(project.deadline)}
            </Field>
          )}
          <Field label={t("projects.detail.contributors", { count: contributors.size })}>
            {contributors.size}
          </Field>
        </dl>
        {project.status === "completed" && project.completedAt && (
          <p className="mt-3 rounded-xl bg-canopy-50 p-3 text-sm text-canopy-900 dark:bg-canopy-950/40 dark:text-canopy-100">
            {t("projects.detail.completed", {
              when: formatRelativeTime(project.completedAt),
            })}
          </p>
        )}
        {project.status === "paused" && project.pauseNote && (
          <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
            {t("projects.detail.paused", { note: project.pauseNote })}
          </p>
        )}
      </div>

      {isOrg && (
        <OrganizerControls project={project} onRun={run} />
      )}

      {isPrimaryOrganizer && project.status !== "completed" && project.status !== "archived" && (
        <CoOrganizerSection
          project={project}
          members={members}
          currentKey={currentMember!.publicKey}
          memberMap={memberMap}
          onRun={run}
        />
      )}

      {isPrimaryOrganizer && project.coOrganizerKeys.length > 0 && project.status !== "completed" && project.status !== "archived" && (
        <HandoffSection
          project={project}
          currentKey={currentMember!.publicKey}
          memberMap={memberMap}
          onRun={run}
        />
      )}

      {error && (
        <p
          role="alert"
          className="mb-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-950/40 dark:text-rose-200"
        >
          {error}
        </p>
      )}

      <AnnouncementSection
        project={project}
        isOrg={isOrg}
        memberMap={memberMap}
        nodeId={nodeId}
        currentKey={currentMember?.publicKey}
      />

      <section className="mb-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-500">
          {t("projects.detail.tasks")}
        </h2>
        {tasks.length === 0 ? (
          <div className="card">
            <EmptyState
              illustration="book"
              variant="inset"
              title={t("projects.detail.noTasksTitle")}
              message={t("projects.detail.noTasks")}
            />
          </div>
        ) : (
          <>
            <label className="mb-2 block">
              <span className="sr-only">
                {t("projects.detail.taskSearch.ariaLabel")}
              </span>
              <input
                type="search"
                className="input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("projects.detail.taskSearch.placeholder")}
              />
            </label>
            <div
              className="mb-3 flex flex-wrap gap-2"
              role="group"
              aria-label={t("projects.detail.taskSearch.ariaLabel")}
            >
              {(
                [
                  { value: "all", label: t("projects.detail.taskFilter.all") },
                  { value: "open", label: t("projects.detail.taskFilter.open") },
                  {
                    value: "in_progress",
                    label: t("projects.detail.taskFilter.inProgress"),
                  },
                  { value: "done", label: t("projects.detail.taskFilter.done") },
                ] as { value: TaskFilter; label: string }[]
              ).map(({ value, label }) => {
                const active = taskFilter === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTaskFilter(value)}
                    aria-pressed={active}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                      active
                        ? "bg-canopy-100 text-canopy-900 dark:bg-canopy-900/60 dark:text-canopy-100"
                        : "bg-moss-100 text-moss-700 hover:bg-moss-200 dark:bg-moss-800 dark:text-moss-200 dark:hover:bg-moss-700"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            {visibleTasks.length === 0 ? (
              <p className="rounded-xl bg-moss-50 p-4 text-center text-sm text-moss-600 dark:bg-moss-950/30 dark:text-moss-300">
                {trimmedQuery !== ""
                  ? t("projects.detail.taskFilter.empty.search")
                  : taskFilter === "open"
                    ? t("projects.detail.taskFilter.empty.open")
                    : taskFilter === "in_progress"
                      ? t("projects.detail.taskFilter.empty.inProgress")
                      : taskFilter === "done"
                        ? t("projects.detail.taskFilter.empty.done")
                        : null}
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {visibleTasks.map((task) => {
                  const checkInState = taskCheckInState(task, nodeConfig);
                  return (
                    <li key={task.id}>
                      <TaskRow
                        task={task}
                        isOrganizer={isOrg}
                        acceptingClaims={project.status === "active"}
                        projectStatus={project.status}
                        currentKey={currentMember?.publicKey}
                        memberMap={memberMap}
                        nodeId={nodeId}
                        onRun={run}
                        needsMoreHands={checkInState === "needs_more_hands"}
                        allTasks={tasks}
                        flaggedCommentIds={flaggedCommentIds}
                        searchQuery={debouncedQuery}
                      />
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </section>

      {isOrg &&
        project.status !== "completed" &&
        project.status !== "archived" && (
          <AddTaskForm project={project} onRun={run} />
        )}

      {isOrg &&
        project.status !== "completed" &&
        project.status !== "archived" && (
          <BulkTaskForm project={project} nodeId={nodeId} onRun={run} />
        )}

      {(project.status === "archived" || project.status === "completed") && (
        <HistoryTimeline projectId={project.id} memberMap={memberMap} />
      )}
    </div>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Persistent banner shown at the top of a project in planning
// state. Names the state before anyone scrolls to the tasks and
// gives the organizer a one-click path to launch. Calm canopy
// tone — this isn't an error, it's a normal stage of a project.
// Disappears automatically once the project is launched.
function PlanningBanner({
  project,
  isOrganizer,
  onRun,
}: {
  project: Project;
  isOrganizer: boolean;
  onRun: <T>(action: () => Promise<T>) => Promise<T | null>;
}) {
  const { t } = useTranslation();
  const { pending, run: runWithPending } = usePendingAction();
  const dispatch = <T,>(action: () => Promise<T>) =>
    runWithPending(() => onRun(action));
  return (
    <div
      role="status"
      className="mb-4 rounded-2xl border border-canopy-200 bg-canopy-50 p-4 dark:border-canopy-900/50 dark:bg-canopy-950/30"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-canopy-900 dark:text-canopy-100">
            {t("projects.detail.planningBanner.title")}
          </p>
          <p className="mt-1 text-sm text-canopy-800 dark:text-canopy-200">
            {isOrganizer
              ? t("projects.detail.planningBanner.bodyOrganizer")
              : t("projects.detail.planningBanner.bodyMember")}
          </p>
        </div>
        {isOrganizer && (
          <button
            type="button"
            className="btn-primary sm:shrink-0"
            disabled={pending}
            aria-busy={pending}
            onClick={() =>
              dispatch(() =>
                launchProject(project.id, project.organizerKey),
              )
            }
          >
            {pending ? t("common.working") : t("projects.detail.launch")}
          </button>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-moss-500">
        {label}
      </dt>
      <dd className="mt-0.5 font-medium">{children}</dd>
    </div>
  );
}

function OrganizerControls({
  project,
  onRun,
}: {
  project: Project;
  onRun: <T>(action: () => Promise<T>) => Promise<T | null>;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentMember, nodeId } = useApp();
  const [pauseNote, setPauseNote] = useState("");
  const [showPauseForm, setShowPauseForm] = useState(false);
  const [showCloneForm, setShowCloneForm] = useState(false);
  const [cloneTitle, setCloneTitle] = useState("");
  const { pending, run: runWithPending } = usePendingAction();
  const dispatch = <T,>(action: () => Promise<T>) =>
    runWithPending(() => onRun(action));

  return (
    <div className="card mb-4 flex flex-col gap-3">
      {project.status === "planning" && (
        <>
          <button
            type="button"
            className="btn-primary"
            disabled={pending}
            aria-busy={pending}
            onClick={() =>
              dispatch(() => launchProject(project.id, project.organizerKey))
            }
          >
            {pending ? t("common.working") : t("projects.detail.launch")}
          </button>
          <p className="text-xs text-moss-500 dark:text-moss-400">
            {t("projects.detail.launchHint")}
          </p>
        </>
      )}
      {project.status === "active" && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-secondary"
            disabled={pending}
            onClick={() => setShowPauseForm((v) => !v)}
          >
            {t("projects.detail.pause")}
          </button>
          <button
            type="button"
            className="btn-secondary"
            disabled={pending}
            aria-busy={pending}
            onClick={() =>
              dispatch(() => completeProject(project.id, project.organizerKey))
            }
          >
            {pending ? t("common.working") : t("projects.detail.markComplete")}
          </button>
        </div>
      )}
      {project.status === "active" && showPauseForm && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const ok = await dispatch(() =>
              pauseProject(project.id, project.organizerKey, pauseNote),
            );
            if (ok) {
              setShowPauseForm(false);
              setPauseNote("");
            }
          }}
          className="flex flex-col gap-2"
        >
          <input
            className="input"
            placeholder="Why pause? (one short line)"
            value={pauseNote}
            onChange={(e) => setPauseNote(e.target.value)}
            maxLength={140}
          />
          <button
            type="submit"
            className="btn-primary self-end"
            disabled={pending}
            aria-busy={pending}
          >
            {pending ? t("common.working") : t("projects.detail.pause")}
          </button>
        </form>
      )}
      {project.status === "paused" && (
        <button
          type="button"
          className="btn-primary"
          disabled={pending}
          aria-busy={pending}
          onClick={() =>
            dispatch(() => resumeProject(project.id, project.organizerKey))
          }
        >
          {pending ? t("common.working") : t("projects.detail.resume")}
        </button>
      )}
      {(project.status === "active" || project.status === "paused" || project.status === "completed") && (
        <>
          <button
            type="button"
            className="btn-secondary"
            disabled={pending}
            onClick={() => setShowCloneForm(!showCloneForm)}
          >
            {t("projects.clone.button")}
          </button>
        </>
      )}
      {showCloneForm && currentMember && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const result = await dispatch(() =>
              cloneProject(
                project.id,
                currentMember.publicKey,
                cloneTitle,
                nodeId,
              ),
            );
            if (result) {
              setShowCloneForm(false);
              setCloneTitle("");
              navigate(`/project/${result.id}`);
            }
          }}
          className="flex flex-col gap-2"
        >
          <input
            className="input"
            placeholder={t("projects.clone.titlePlaceholder")}
            value={cloneTitle}
            onChange={(e) => setCloneTitle(e.target.value)}
            maxLength={120}
          />
          <button
            type="submit"
            className="btn-primary self-end"
            disabled={pending}
            aria-busy={pending}
          >
            {pending
              ? t("projects.clone.submitting")
              : t("projects.clone.submit")}
          </button>
        </form>
      )}
      {project.status === "completed" && currentMember?.publicKey === project.organizerKey && (
        <button
          type="button"
          className="btn-secondary"
          disabled={pending}
          onClick={() => dispatch(() => archiveProject(project.id, project.organizerKey))}
        >
          {pending ? t("common.working") : t("projects.archive.button")}
        </button>
      )}
      {project.status === "archived" && currentMember?.publicKey === project.organizerKey && (
        <button
          type="button"
          className="btn-secondary"
          disabled={pending}
          onClick={() => dispatch(() => unarchiveProject(project.id, project.organizerKey))}
        >
          {pending ? t("common.working") : t("projects.archive.unarchive")}
        </button>
      )}
    </div>
  );
}

function TaskRow({
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
  searchQuery,
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
  /** Optional active search query — when non-empty, every match in the
   *  task title is wrapped in <mark> via HighlightedText so the member
   *  sees why this row matched. Description stays plain for v1 — the
   *  title is enough for finding tasks at a glance. */
  searchQuery?: string;
}) {
  const { t } = useTranslation();
  const isAssignee = task.assignedTo === currentKey;
  const isCompleter = task.completedBy === currentKey;
  const { pending, run: runWithPending } = usePendingAction();
  const dispatch = <T,>(action: () => Promise<T>) =>
    runWithPending(() => onRun(action));

  const [showAcknowledgment, setShowAcknowledgment] = useState(false);
  const [acknowledgmentText, setAcknowledgmentText] = useState("");
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);
  const [editHours, setEditHours] = useState(String(task.estimatedHours));
  const [editUrgency, setEditUrgency] = useState<Urgency>(task.urgency);

  const hasUnmetDeps = task.dependencies.length > 0 && !canClaimTask(task, allTasks);
  const depNames = task.dependencies
    .map((id) => allTasks.find((t) => t.id === id)?.title)
    .filter(Boolean)
    .join(", ");

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
              const ok = await dispatch(() =>
                editProjectTask(task.id, currentKey!, {
                  title: editTitle,
                  description: editDescription,
                  estimatedHours: h,
                  urgency: editUrgency,
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
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`chip ${statusChipClass(task.status)}`}
          title={task.status}
        >
          {t(`projects.task.status${capitalize(task.status === "awaiting_confirmation" ? "Awaiting" : task.status)}` as `projects.task.statusOpen`)}
        </span>
        <span className="chip bg-canopy-50 text-canopy-900 dark:bg-canopy-950/50 dark:text-canopy-100">
          {formatHours(task.estimatedHours)}
        </span>
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
          <span
            className="chip bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            title={t("projects.task.followsHint")}
          >
            {t("projects.task.follows", { tasks: depNames })}
            <WhyTooltip principleId="follows-not-blocked" />
          </span>
        )}
      </div>
      <h3 className="text-base font-semibold leading-snug">
        {searchQuery && searchQuery.trim() !== "" ? (
          <HighlightedText text={task.title} query={searchQuery} />
        ) : (
          task.title
        )}
      </h3>
      {task.description && (
        <p className="text-sm text-moss-600 dark:text-moss-300">
          {task.description}
        </p>
      )}
      {task.assignedTo &&
        (task.status === "awaiting_confirmation" ? (
          <p className="text-xs text-moss-500 dark:text-moss-400">
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
          <p className="text-xs text-moss-500 dark:text-moss-400">
            {t("projects.task.claimedBy", {
              name: memberMap.get(task.assignedTo) ?? "—",
            })}
          </p>
        ) : null)}
      <div className="flex flex-wrap items-center gap-2">
        {task.status === "open" && currentKey && !isOrganizer && !hasUnmetDeps && acceptingClaims && (
          <button
            type="button"
            className="btn-primary"
            disabled={pending}
            aria-busy={pending}
            onClick={() => dispatch(() => claimProjectTask(task.id, currentKey))}
          >
            {pending ? t("common.working") : t("projects.task.claim")}
          </button>
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
        {task.status === "open" && isOrganizer && (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setEditing(true)}
          >
            {t("projects.task.edit.button")}
          </button>
        )}
        {task.status === "claimed" && isAssignee && (
          <>
            <button
              type="button"
              className="btn-primary"
              disabled={pending}
              aria-busy={pending}
              onClick={() =>
                dispatch(() => markProjectTaskComplete(task.id, currentKey!))
              }
            >
              {pending ? t("common.working") : t("projects.task.markDone")}
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
          </>
        )}
        {task.status === "awaiting_confirmation" && isOrganizer && !isCompleter && (
          <button
            type="button"
            className="btn-primary"
            disabled={pending}
            aria-busy={pending}
            onClick={() =>
              dispatch(() =>
                confirmProjectTaskCompletion(task.id, currentKey!, nodeId, acknowledgmentText),
              )
            }
          >
            {pending ? t("common.working") : t("projects.task.confirm")}
          </button>
        )}
        {task.status === "awaiting_confirmation" && !isOrganizer && (
          <span className="text-xs text-moss-500 dark:text-moss-400">
            {t("projects.task.awaitingConfirmation")}
          </span>
        )}
      </div>
      {task.status === "awaiting_confirmation" && isOrganizer && !isCompleter && (
        <>
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
              <p className="text-xs text-moss-500 dark:text-moss-400">
                {t("projects.task.acknowledgment.hint")}
              </p>
            </div>
          )}
        </>
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

function statusChipClass(status: ProjectTask["status"]): string {
  switch (status) {
    case "open":
      return "bg-canopy-50 text-canopy-800 dark:bg-canopy-950/40 dark:text-canopy-100";
    case "claimed":
      return "bg-moss-100 text-moss-700 dark:bg-moss-800 dark:text-moss-200";
    case "awaiting_confirmation":
      return "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-100";
    case "completed":
      return "bg-canopy-100 text-canopy-900 dark:bg-canopy-900/60 dark:text-canopy-100";
    case "blocked":
      return "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-100";
  }
}

function AddTaskForm({
  project,
  onRun,
}: {
  project: Project;
  onRun: <T>(action: () => Promise<T>) => Promise<T | null>;
}) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [hours, setHours] = useState("1");
  const [urgency, setUrgency] = useState<Urgency>("low");
  const [category, setCategory] = useState<ProjectCategory>(project.category);
  const [skills, setSkills] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const h = Number.parseFloat(hours);
    if (!Number.isFinite(h) || h <= 0) return;
    setSubmitting(true);
    const ok = await onRun(() =>
      addProjectTask(project.id, project.organizerKey, {
        title,
        description,
        category,
        estimatedHours: h,
        urgency,
        requiredSkills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        dependencies: [],
      }),
    );
    setSubmitting(false);
    if (ok) {
      setTitle("");
      setDescription("");
      setHours("1");
      setUrgency("low");
      setCategory(project.category);
      setSkills("");
    }
  }

  return (
    <section className="card mb-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-moss-500">
        {t("projects.detail.addTaskTitle")}
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">
            {t("projects.task.addTask.fieldTitle")}
          </span>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">
            {t("projects.task.addTask.fieldDescription")}
          </span>
          <textarea
            className="input min-h-20"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={1000}
          />
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
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">
              {t("projects.task.addTask.fieldUrgency")}
            </span>
            <select
              className="input"
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as Urgency)}
            >
              <option value="low">{t("urgency.low")}</option>
              <option value="medium">{t("urgency.medium")}</option>
              <option value="high">{t("urgency.high")}</option>
            </select>
          </label>
        </div>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">
            {t("projects.task.addTask.fieldCategory")}
          </span>
          <select
            className="input"
            value={category}
            onChange={(e) => setCategory(e.target.value as ProjectCategory)}
          >
            {ALL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_META[c].emoji} {t(`categories.${c}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">
            {t("projects.task.addTask.fieldSkills")}
          </span>
          <input
            className="input"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="carpentry, listening"
          />
        </label>
        <button
          type="submit"
          className="btn-primary self-end"
          disabled={submitting}
        >
          {submitting
            ? t("projects.task.addTask.submitting")
            : t("projects.task.addTask.submit")}
        </button>
      </form>
    </section>
  );
}

function HandoffSection({
  project,
  currentKey,
  memberMap,
  onRun,
}: {
  project: Project;
  currentKey: string;
  memberMap: Map<string, string>;
  onRun: <T>(action: () => Promise<T>) => Promise<T | null>;
}) {
  const { t } = useTranslation();
  const [selectedKey, setSelectedKey] = useState("");
  const { pending, run: runWithPending } = usePendingAction();

  return (
    <section className="card mb-4">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-500">
        {t("projects.handoff.title")}
      </h2>
      <p className="mb-3 text-xs text-moss-600 dark:text-moss-300">
        {t("projects.handoff.intro")}
      </p>
      <div className="flex flex-wrap gap-2">
        <select
          className="input flex-1"
          value={selectedKey}
          onChange={(e) => setSelectedKey(e.target.value)}
        >
          <option value="">
            {t("projects.handoff.select")}
          </option>
          {project.coOrganizerKeys.map((key) => (
            <option key={key} value={key}>
              {memberMap.get(key) ?? key}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="btn-secondary"
          disabled={pending || !selectedKey}
          aria-busy={pending}
          onClick={() => {
            if (!selectedKey) return;
            void runWithPending(() =>
              onRun(() =>
                handoffOrganizer(project.id, currentKey, selectedKey),
              ),
            );
            setSelectedKey("");
          }}
        >
          {pending
            ? t("projects.handoff.submitting")
            : t("projects.handoff.submit")}
        </button>
      </div>
    </section>
  );
}

function AnnouncementSection({
  project,
  isOrg,
  memberMap,
  nodeId,
  currentKey,
}: {
  project: Project;
  isOrg: boolean;
  memberMap: Map<string, string>;
  nodeId: string;
  currentKey: string | undefined;
}) {
  const { t } = useTranslation();
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const announcements = useLiveQuery(
    () => listAnnouncements(project.id),
    [project.id],
    [],
  );
  const hiddenCount = Math.max(
    0,
    announcements.length - MAX_VISIBLE_ANNOUNCEMENTS,
  );
  // listAnnouncements returns newest → oldest, so slicing from the
  // head keeps the newest MAX_VISIBLE_ANNOUNCEMENTS visible.
  const visibleAnnouncements = showAll
    ? announcements
    : announcements.slice(0, MAX_VISIBLE_ANNOUNCEMENTS);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!body.trim() || !currentKey) return;
      setSubmitting(true);
      try {
        await postAnnouncement(project.id, currentKey, body, nodeId);
        setBody("");
      } catch {
        // Errors are swallowed here; the user sees the field still filled.
      } finally {
        setSubmitting(false);
      }
    },
    [body, currentKey, nodeId, project.id],
  );

  if (!isOrg && announcements.length === 0) return null;

  return (
    <section className="mb-4">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-500">
        {t("projects.announcements.title")}
      </h2>
      {isOrg && (
        <form onSubmit={handleSubmit} className="card mb-3 flex flex-col gap-2">
          <textarea
            className="input min-h-20"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={2000}
            placeholder={t("projects.announcements.placeholder")}
          />
          <button
            type="submit"
            className="btn-primary self-end"
            disabled={submitting || !body.trim()}
            aria-busy={submitting}
          >
            {submitting
              ? t("projects.announcements.submitting")
              : t("projects.announcements.submit")}
          </button>
        </form>
      )}
      {announcements.length > 0 && (
        <ul className="flex flex-col gap-2">
          {visibleAnnouncements.map((a) => (
            <li key={a.id} className="card">
              <p className="mb-1 text-xs text-moss-500 dark:text-moss-400">
                {t("projects.announcements.postedBy", {
                  name: memberMap.get(a.actorKey) ?? t("common.memberFallback"),
                  when: formatRelativeTime(a.createdAt),
                })}
              </p>
              <p className="whitespace-pre-wrap text-sm">
                {(a.data as { body?: string }).body ?? ""}
              </p>
            </li>
          ))}
        </ul>
      )}
      {hiddenCount > 0 && (
        <button
          type="button"
          className="mt-2 text-xs font-medium text-moss-600 underline-offset-2 hover:underline dark:text-moss-300"
          onClick={() => setShowAll((v) => !v)}
        >
          {showAll
            ? t("projects.announcements.showFewer")
            : t(
                hiddenCount === 1
                  ? "projects.announcements.showOlderOne"
                  : "projects.announcements.showOlderOther",
                { count: hiddenCount },
              )}
        </button>
      )}
    </section>
  );
}

function CoOrganizerSection({
  project,
  members,
  currentKey,
  memberMap,
  onRun,
}: {
  project: Project;
  members: readonly Member[];
  currentKey: string;
  memberMap: Map<string, string>;
  onRun: <T>(action: () => Promise<T>) => Promise<T | null>;
}) {
  const { t } = useTranslation();
  const [selectedKey, setSelectedKey] = useState("");
  const { pending, run: runWithPending } = usePendingAction();

  const eligible = members.filter(
    (m) =>
      m.publicKey !== project.organizerKey &&
      !project.coOrganizerKeys.includes(m.publicKey),
  );

  return (
    <section className="card mb-4">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-500">
        {t("projects.coOrganizers.title")}
      </h2>
      <p className="mb-3 text-xs text-moss-600 dark:text-moss-300">
        {t("projects.coOrganizers.intro")}
      </p>
      {project.coOrganizerKeys.length > 0 && (
        <ul className="mb-3 flex flex-col gap-1">
          {project.coOrganizerKeys.map((key) => (
            <li
              key={key}
              className="flex items-center justify-between rounded-lg bg-moss-50 px-3 py-1.5 text-sm dark:bg-moss-900/40"
            >
              <span>{memberMap.get(key) ?? key}</span>
              <button
                type="button"
                className="btn-ghost text-xs text-rose-700 dark:text-rose-300"
                disabled={pending}
                onClick={() =>
                  void runWithPending(() =>
                    onRun(() => removeCoOrganizer(project.id, currentKey, key)),
                  )
                }
              >
                {t("projects.coOrganizers.remove")}
              </button>
            </li>
          ))}
        </ul>
      )}
      {eligible.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <select
            className="input flex-1"
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
          >
            <option value="">
              {t("projects.coOrganizers.selectPlaceholder")}
            </option>
            {eligible.map((m) => (
              <option key={m.publicKey} value={m.publicKey}>
                {m.displayName}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn-secondary"
            disabled={pending || !selectedKey}
            onClick={() => {
              if (!selectedKey) return;
              void runWithPending(() =>
                onRun(() =>
                  addCoOrganizer(project.id, currentKey, selectedKey),
                ),
              );
              setSelectedKey("");
            }}
          >
            {t("projects.coOrganizers.add")}
          </button>
        </div>
      )}
    </section>
  );
}

function BulkTaskForm({
  project,
  nodeId,
  onRun,
}: {
  project: Project;
  nodeId: string;
  onRun: <T>(action: () => Promise<T>) => Promise<T | null>;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const lineCount = text
    .split("\n")
    .filter((l) => l.trim().length > 0).length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (lineCount === 0) return;
    setSubmitting(true);
    const ok = await onRun(() =>
      bulkAddTasks(
        project.id,
        project.organizerKey,
        text.split("\n"),
        nodeId,
      ),
    );
    setSubmitting(false);
    if (ok) {
      showToast(t("projects.bulkTask.success", { count: ok.length }));
      setText("");
      setOpen(false);
    }
  }

  if (!open) {
    return (
      <div className="mb-4 text-center">
        <button
          type="button"
          className="text-sm text-canopy-700 underline decoration-canopy-300 underline-offset-2 hover:text-canopy-900 dark:text-canopy-300 dark:decoration-canopy-700 dark:hover:text-canopy-100"
          onClick={() => setOpen(true)}
        >
          {t("projects.bulkTask.toggle")}
        </button>
      </div>
    );
  }

  return (
    <section className="card mb-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-moss-500">
        {t("projects.bulkTask.toggle")}
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <textarea
          className="input min-h-32"
          placeholder={t("projects.bulkTask.placeholder")}
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={5000}
          rows={6}
        />
        <div className="flex items-center justify-between text-xs text-moss-500 dark:text-moss-400">
          <span>
            {lineCount > 0
              ? `${lineCount} ${lineCount === 1 ? "task" : "tasks"}`
              : ""}
          </span>
          <span>{t("projects.bulkTask.hint")}</span>
        </div>
        <div className="flex gap-2 self-end">
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              setOpen(false);
              setText("");
            }}
          >
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={submitting || lineCount === 0 || lineCount > 50}
          >
            {submitting
              ? t("projects.bulkTask.submitting")
              : t("projects.bulkTask.submit")}
          </button>
        </div>
      </form>
    </section>
  );
}

function HistoryTimeline({
  projectId,
  memberMap,
}: {
  projectId: string;
  memberMap: Map<string, string>;
}) {
  const { t } = useTranslation();
  const activities = useLiveQuery(
    () => listActivityForProject(projectId),
    [projectId],
    [],
  );
  if (activities.length === 0) return null;
  return (
    <section className="card mb-4">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-500">
        {t("projects.history.title")}
      </h2>
      <ul className="flex flex-col gap-2">
        {activities.map((a) => (
          <li key={a.id} className="flex items-start gap-2 text-sm">
            <span className="shrink-0 text-xs text-moss-500">
              {formatRelativeTime(a.createdAt)}
            </span>
            <span className="text-moss-700 dark:text-moss-200">
              <span className="font-medium">
                {memberMap.get(a.actorKey) ?? t("common.memberFallback")}
              </span>
              {" — "}
              {t(`projects.activityType.${a.type}` as "projects.activityType.project_created")}
              {a.type === "announcement" && (a.data as { body?: string }).body && (
                <span className="ml-1 italic text-moss-500">
                  {`"${((a.data as { body?: string }).body ?? "").slice(0, 80)}${((a.data as { body?: string }).body ?? "").length > 80 ? "..." : ""}"`}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
