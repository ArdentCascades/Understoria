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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useApp } from "@/state/AppContext";
import { useToast } from "@/state/ToastContext";
import {
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
  logActivity,
  markProjectTaskComplete,
  pauseProject,
  postAnnouncement,
  removeCoOrganizer,
  reorderProjectTask,
  resumeProject,
  unarchiveProject,
  unclaimProjectTask,
} from "@/db/projects";
import {
  issueCoOrganizerInvitation,
  revokeCoOrganizerInvitation,
} from "@/db/coorgInvitations";
import { getSecretKey, type LockState } from "@/db/secrets";
import { humanizeError } from "@/lib/humanizeError";
import { matchesQuery } from "@/lib/messageSearch";
import { matchesFilter, type TaskFilter } from "@/lib/taskFilter";
import { HighlightedText } from "@/components/HighlightedText";
import { ALL_CATEGORIES, CATEGORY_META } from "@/lib/categories";
import {
  formatDeadline,
  formatHours,
  formatRelativeTime,
  shortKey,
} from "@/lib/format";
import { taskCheckInState } from "@/lib/taskCheckInState";
import { computeProjectMomentum } from "@/lib/projectMomentum";
import { ProjectSparkline } from "@/components/ProjectSparkline";
import { ProjectMomentumChip } from "@/components/ProjectMomentumChip";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ReorderTasksDialog } from "@/components/ReorderTasksDialog";
import { useFlipAnimation } from "@/lib/a11y/useFlipAnimation";
import { IconMessages } from "@/components/visual";
import { usePendingAction } from "@/lib/usePendingAction";
import { WhyTooltip } from "@/components/WhyTooltip";
import { TaskComments } from "@/components/TaskComments";
import type {
  CoOrganizerInvitation,
  CoOrganizerInvitationResponse,
  CoOrganizerInvitationRevocation,
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
    lockState,
    coorgInvitations,
    coorgInvitationResponses,
    coorgInvitationRevocations,
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
  // Sort by orderIndex ascending (per PR C migration). createdAt is
  // a defensive tiebreaker for any rows that escaped the v25 backfill
  // — should never fire in practice, but keeps the order stable if
  // it does.
  const tasks = useMemo(
    () =>
      projectTasks
        .filter((task) => task.projectId === id)
        .sort((a, b) => {
          if (a.orderIndex !== b.orderIndex) return a.orderIndex - b.orderIndex;
          return a.createdAt - b.createdAt;
        }),
    [projectTasks, id],
  );
  // Compose the status pill with the debounced search. `matchesQuery`
  // is the shared case-insensitive trimmed substring matcher used
  // across Board and Messages; the empty-query short-circuit is
  // hoisted here so unfiltered scrolling stays cheap.
  const trimmedQuery = debouncedQuery.trim();
  const visibleTasks = useMemo(() => {
    return tasks
      .filter((task) => matchesFilter(task, taskFilter, currentMember?.publicKey))
      .filter((task) => {
        if (trimmedQuery === "") return true;
        return matchesQuery(
          `${task.title} ${task.description ?? ""}`,
          trimmedQuery,
        );
      });
  }, [tasks, taskFilter, trimmedQuery, currentMember?.publicKey]);
  // "Mine" pill only renders when the current member is actually
  // carrying something on this project — open-only projects show
  // the three baseline pills instead of a perpetually-empty "Mine."
  // Any claimer-carried status counts: claimed AND awaiting_confirmation
  // (members still own the task they've just marked done).
  const hasMineTasks = useMemo(() => {
    if (!currentMember) return false;
    return tasks.some(
      (task) =>
        task.assignedTo === currentMember.publicKey &&
        (task.status === "claimed" ||
          task.status === "awaiting_confirmation"),
    );
  }, [tasks, currentMember]);
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
          onClick={() => navigate("/?tab=projects")}
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
        onClick={() => navigate("/?tab=projects")}
      >
        {t("projects.detail.back")}
      </button>

      {project.status === "planning" && (
        <PlanningBanner project={project} isOrganizer={isOrg} onRun={run} />
      )}

      {/* Phase 2.2: 2-pane layout at lg+ — meta (overview card +
          organizer / co-organizer / handoff controls) docks in a
          320px right sidebar that sticks to the viewport; the main
          reading column hosts the high-volume scrollable sections
          (error → announcements → tasks → add-task forms → history).
          Below lg the `lg:*` classes are inert and the grid collapses
          to single-column DOM order — overview → controls → error →
          announcements → tasks → ... — matching the pre-2.2 layout.

          The sidebar `aside` is its own scroll context at lg+ so an
          overflowing meta panel doesn't push tasks off-screen. The
          main column's `min-w-0` (via minmax(0,1fr)) lets long
          announcement / task content wrap rather than blow out the
          grid width. */}
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-6">
        <aside
          aria-label={t("projects.detail.sidebarAriaLabel")}
          className="lg:col-start-2 lg:row-start-1 lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100dvh-2rem)] lg:overflow-y-auto"
        >
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
            <p className="mt-1 text-sm text-moss-600 dark:text-moss-300">
              {/* Reuse the existing "Organized by {{name}}" string but
                  render the name as a profile link. Interpolating with
                  an empty name and trimming yields just the prefix
                  ("Organized by" / "Organizado por") so the link sits
                  inline after it. */}
              {t("projects.byOrganizer", { name: "" }).trim()}{" "}
              <Link
                to={`/member/${encodeURIComponent(project.organizerKey)}`}
                className="font-medium underline-offset-2 hover:underline"
              >
                {memberMap.get(project.organizerKey) ?? "—"}
              </Link>
            </p>
            {project.description && (
              <p className="mt-2 whitespace-pre-wrap text-sm text-moss-700 dark:text-moss-200">
                {project.description}
              </p>
            )}
            {currentMember?.publicKey !== project.organizerKey && (
              <div className="mt-3">
                <Link
                  to={`/messages/${encodeURIComponent(project.organizerKey)}`}
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  <IconMessages size={18} />
                  {t("messages.messageTarget", {
                    name: memberMap.get(project.organizerKey) ?? "—",
                  })}
                </Link>
              </div>
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
              <Field label={t("projects.detail.createdLabel")}>
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
              nodeId={nodeId}
              lockState={lockState}
              invitations={coorgInvitations}
              responses={coorgInvitationResponses}
              revocations={coorgInvitationRevocations}
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

          {isOrg && !isPrimaryOrganizer && (
            <CoOrganizerCapabilityCard />
          )}

          {isOrg && !isPrimaryOrganizer && (
            <CoOrganizerStepDownSection
              project={project}
              currentKey={currentMember!.publicKey}
              onRun={run}
            />
          )}
        </aside>

        <div className="lg:col-start-1 lg:row-start-1 lg:min-w-0">
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
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-500 dark:text-moss-300">
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
                      // "Mine" rendered only when the member has at least
                      // one claimed/awaiting_confirmation task here. We
                      // surface it after the lifecycle pills so the row
                      // reads left-to-right as: scope → personal cut.
                      ...(hasMineTasks
                        ? [
                            {
                              value: "mine" as const,
                              label: t("projects.taskFilters.mine"),
                            },
                          ]
                        : []),
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
                            : taskFilter === "mine"
                              ? t("projects.detail.taskFilter.empty.mine")
                              : null}
                  </p>
                ) : (
                  <TaskList
                    tasks={tasks}
                    visibleTasks={visibleTasks}
                    isOrg={isOrg}
                    project={project}
                    currentKey={currentMember?.publicKey}
                    memberMap={memberMap}
                    nodeId={nodeId}
                    nodeConfig={nodeConfig}
                    onRun={run}
                    flaggedCommentIds={flaggedCommentIds}
                    searchQuery={debouncedQuery}
                  />
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
      </div>
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
      <dt className="text-xs uppercase tracking-wide text-moss-500 dark:text-moss-300">
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

  // Draft / planning projects render their organizer CTA through the
  // PlanningBanner above (see `planningBanner.title` / `.bodyOrganizer`
  // / "Launch project" button at line ~580). This controls card has no
  // additional actions to offer until the project is active, so we
  // skip rendering it entirely rather than leaving an empty card with
  // its own margin.
  if (project.status === "planning") return null;

  return (
    <div className="card mb-4 flex flex-col gap-3">
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
            placeholder={t("projects.detail.pausePlaceholder")}
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

// --- Reorder UI -----------------------------------------------------------
//
// The task list ships two reorder affordances per docs/task-ordering-and-
// dependencies.md §3.2:
//
//   1. Drag-and-drop (sugar) — the task title is the drag handle.
//   2. Always-visible Move up / Move down icon buttons (canonical) —
//      keyboard-first, screen-reader-first, touch-target-44.
//
// Both paths resolve to a neighbor pair before calling
// `reorderProjectTask({ taskId, organizerKey, beforeId, afterId })`,
// which lives in db/projects.ts and itself enforces organizer / co-org
// authority via `requireOrganizer`.
//
// Non-organizer / non-co-org viewers see the static list — no drag
// handles, no buttons, no @dnd-kit overhead.
function ArrowUpIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 13V3" />
      <path d="M3.5 7.5 8 3l4.5 4.5" />
    </svg>
  );
}

function ArrowDownIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 3v10" />
      <path d="M3.5 8.5 8 13l4.5-4.5" />
    </svg>
  );
}

// Single shared aria-live region for reorder announcements. The
// @dnd-kit accessibility hooks fire for drag; we mirror the same
// announcements for the button path so a keyboard / screen-reader
// member hears identical feedback regardless of how they moved.
function useLiveRegion(): {
  message: string;
  announce: (msg: string) => void;
} {
  const [message, setMessage] = useState("");
  const counter = useRef(0);
  const announce = useCallback((msg: string) => {
    counter.current += 1;
    // Append an invisible suffix on repeat messages so a re-announce
    // of the same text still fires the screen-reader update.
    const tag = counter.current % 2 === 0 ? "" : "​";
    setMessage(`${msg}${tag}`);
  }, []);
  return { message, announce };
}

// "Follows: <upstream titles>" badge. Visible to everyone, not just
// organizers. Three render modes:
//   • 1 dep: "Follows: <title>"
//   • 2-3 deps: comma-joined "Follows: A, B, C"
//   • 4+ deps (collapsed): "Follows: <first> +N more" + tap to expand
//   • 4+ deps (expanded): inline popover with all titles, each
//     clickable to scroll to that upstream task row.
// Completed deps drop out at the caller — we only see unmet ones.
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

function TaskList({
  tasks,
  visibleTasks,
  isOrg,
  project,
  currentKey,
  memberMap,
  nodeId,
  nodeConfig,
  onRun,
  flaggedCommentIds,
  searchQuery,
}: {
  tasks: readonly ProjectTask[];
  visibleTasks: readonly ProjectTask[];
  isOrg: boolean;
  project: Project;
  currentKey: string | undefined;
  memberMap: Map<string, string>;
  nodeId: string;
  nodeConfig: Parameters<typeof taskCheckInState>[1];
  onRun: <T>(action: () => Promise<T>) => Promise<T | null>;
  flaggedCommentIds: ReadonlySet<string>;
  searchQuery?: string;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { message, announce } = useLiveRegion();
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [reorderDialogOpen, setReorderDialogOpen] = useState(false);
  const reorderButtonRef = useRef<HTMLButtonElement>(null);

  // FLIP animation for inline reorders. Skipped while @dnd-kit is
  // mid-drag on a row (it already applies its own transform) and
  // skipped entirely under prefers-reduced-motion (handled inside
  // the hook).
  const isRowDragging = useCallback(
    (id: string) => id === activeDragId,
    [activeDragId],
  );
  const visibleTaskIds = useMemo(
    () => visibleTasks.map((task) => task.id),
    [visibleTasks],
  );
  const { register: registerFlipRow } = useFlipAnimation(visibleTaskIds, {
    isRowDragging,
  });

  // Per design §9: pointer + keyboard sensors. KeyboardSensor with
  // `sortableKeyboardCoordinates` so arrow keys move the sortable
  // item one slot per press.
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // 5px activation distance avoids accidental drags on tap.
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const taskIds = useMemo(() => visibleTasks.map((t) => t.id), [visibleTasks]);

  // For the button path: locate the neighbors of `taskId` in the
  // FULL tasks list (not the filtered visible list), and call the
  // action with them.
  const moveTask = useCallback(
    async (taskId: string, direction: "up" | "down") => {
      if (!currentKey) return;
      const fullList = tasks;
      const idx = fullList.findIndex((t) => t.id === taskId);
      if (idx < 0) return;
      // Disabled-at-the-ends check, also enforced visually.
      if (direction === "up" && idx === 0) return;
      if (direction === "down" && idx === fullList.length - 1) return;
      // Compute the neighbor pair at the destination position. The
      // neighbors are read from the CURRENT list (the task we're
      // moving is removed in the action layer's transaction; here we
      // just point at the two rows that flank the destination slot).
      // Move up to idx-1: the new neighbors are the task that was at
      // idx-2 (now still at idx-2) and the task that was at idx-1
      // (which will end up at idx after the move). Move down to
      // idx+1: the new neighbors are the task that was at idx+1
      // (which steps up into idx) and the task that was at idx+2.
      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      const beforeIdx = direction === "up" ? idx - 2 : idx + 1;
      const afterIdx = direction === "up" ? idx - 1 : idx + 2;
      const beforeId = beforeIdx >= 0 ? fullList[beforeIdx].id : null;
      const afterId =
        afterIdx <= fullList.length - 1 ? fullList[afterIdx].id : null;
      const task = fullList[idx];
      const result = await onRun(() =>
        reorderProjectTask({
          taskId,
          organizerKey: currentKey,
          beforeId,
          afterId,
        }),
      );
      if (result !== null) {
        announce(
          t("projects.task.dragEnd", {
            title: task.title,
            position: targetIdx + 1,
            total: fullList.length,
          }),
        );
      } else {
        showToast(t("projects.task.reorderError"), { tone: "error" });
      }
    },
    [tasks, currentKey, onRun, announce, t, showToast],
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveDragId(null);
      const { active, over } = event;
      if (!over || !currentKey || active.id === over.id) return;
      const fromIdx = tasks.findIndex((t) => t.id === active.id);
      const toIdx = tasks.findIndex((t) => t.id === over.id);
      if (fromIdx < 0 || toIdx < 0) return;
      // Compute the destination neighbors as if the dragged task is
      // now in `toIdx` (with itself removed from `fromIdx`).
      const reordered = [...tasks];
      const [moved] = reordered.splice(fromIdx, 1);
      reordered.splice(toIdx, 0, moved);
      const beforeId = toIdx > 0 ? reordered[toIdx - 1].id : null;
      const afterId =
        toIdx < reordered.length - 1 ? reordered[toIdx + 1].id : null;
      if (beforeId === null && afterId === null) return;
      const result = await onRun(() =>
        reorderProjectTask({
          taskId: String(active.id),
          organizerKey: currentKey,
          beforeId,
          afterId,
        }),
      );
      if (result === null) {
        showToast(t("projects.task.reorderError"), { tone: "error" });
      }
      // Drag-end announcement is also dispatched by
      // accessibility.announcements below; that handles the SR text.
    },
    [tasks, currentKey, onRun, showToast, t],
  );

  function renderRow(task: ProjectTask, idx: number) {
    const checkInState = taskCheckInState(task, nodeConfig, tasks);
    return (
      <SortableTaskRow
        key={task.id}
        task={task}
        sortable={isOrg}
        isFirst={idx === 0}
        isLast={idx === visibleTasks.length - 1}
        onMove={moveTask}
        isOrganizer={isOrg}
        acceptingClaims={project.status === "active"}
        projectStatus={project.status}
        currentKey={currentKey}
        memberMap={memberMap}
        nodeId={nodeId}
        onRun={onRun}
        needsMoreHands={checkInState === "needs_more_hands"}
        allTasks={tasks}
        flaggedCommentIds={flaggedCommentIds}
        searchQuery={searchQuery}
        taskCheckInDays={nodeConfig.taskCheckInDays}
      />
    );
  }

  // Non-organizer viewers get the static list — no drag, no buttons,
  // no @dnd-kit overhead, and (deliberately) no FLIP either. Their
  // view doesn't reorder.
  if (!isOrg) {
    return (
      <>
        <ul className="flex flex-col gap-2">
          {visibleTasks.map((task, idx) => (
            <li key={task.id} id={`task-${task.id}`}>
              {renderRow(task, idx)}
            </li>
          ))}
        </ul>
        <div
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
          data-testid="reorder-live-region"
        >
          {message}
        </div>
      </>
    );
  }

  const activeTask = activeDragId
    ? tasks.find((t) => t.id === activeDragId)
    : null;

  const canOpenReorderDialog = isOrg && tasks.length >= 2 && currentKey;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        if (activeTask) {
          announce(
            t("projects.task.dragCancel", { title: activeTask.title }),
          );
        }
        setActiveDragId(null);
      }}
      accessibility={{
        announcements: {
          onDragStart: ({ active }) => {
            const t2 = tasks.find((x) => x.id === active.id);
            return t2
              ? t("projects.task.dragStart", { title: t2.title })
              : "";
          },
          onDragOver: () => "",
          onDragEnd: ({ active, over }) => {
            const t2 = tasks.find((x) => x.id === active.id);
            if (!t2 || !over) return "";
            const overIdx = tasks.findIndex((x) => x.id === over.id);
            return t("projects.task.dragEnd", {
              title: t2.title,
              position: overIdx + 1,
              total: tasks.length,
            });
          },
          onDragCancel: ({ active }) => {
            const t2 = tasks.find((x) => x.id === active.id);
            return t2
              ? t("projects.task.dragCancel", { title: t2.title })
              : "";
          },
        },
      }}
    >
      {canOpenReorderDialog && (
        <div className="mb-2 flex justify-end">
          <button
            ref={reorderButtonRef}
            type="button"
            className="btn-ghost text-sm"
            aria-haspopup="dialog"
            aria-expanded={reorderDialogOpen}
            onClick={() => setReorderDialogOpen(true)}
          >
            {t("projects.task.reorderButton")}
          </button>
        </div>
      )}
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <ul className="flex flex-col gap-2">
          {visibleTasks.map((task, idx) => (
            <li
              key={task.id}
              id={`task-${task.id}`}
              ref={registerFlipRow(task.id)}
            >
              {renderRow(task, idx)}
            </li>
          ))}
        </ul>
      </SortableContext>
      <DragOverlay>
        {activeTask ? (
          <div className="card opacity-90 shadow-lg">
            <h3 className="text-base font-semibold leading-snug">
              {activeTask.title}
            </h3>
          </div>
        ) : null}
      </DragOverlay>
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        data-testid="reorder-live-region"
      >
        {message}
      </div>
      {currentKey && (
        <ReorderTasksDialog
          open={reorderDialogOpen}
          tasks={tasks}
          projectId={project.id}
          organizerKey={currentKey}
          onClose={() => {
            setReorderDialogOpen(false);
            // Return focus to the trigger on close so a keyboard user
            // resumes where they left off.
            window.setTimeout(() => reorderButtonRef.current?.focus(), 0);
          }}
        />
      )}
    </DndContext>
  );
}

function SortableTaskRow({
  task,
  sortable,
  isFirst,
  isLast,
  onMove,
  ...rest
}: {
  task: ProjectTask;
  sortable: boolean;
  isFirst: boolean;
  isLast: boolean;
  onMove: (taskId: string, direction: "up" | "down") => void;
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
  searchQuery?: string;
  taskCheckInDays: number;
}) {
  const sortableHook = useSortable({ id: task.id, disabled: !sortable });
  const style = sortable
    ? {
        transform: CSS.Transform.toString(sortableHook.transform),
        transition: sortableHook.transition,
      }
    : undefined;
  return (
    <div ref={sortable ? sortableHook.setNodeRef : undefined} style={style}>
      <TaskRow
        task={task}
        {...rest}
        sortableHandle={
          sortable
            ? {
                attributes: sortableHook.attributes,
                listeners: sortableHook.listeners,
              }
            : null
        }
        moveButtons={
          sortable
            ? { isFirst, isLast, onMove: (dir) => onMove(task.id, dir) }
            : null
        }
      />
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
  sortableHandle,
  moveButtons,
  taskCheckInDays,
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
  /** Node-configured private check-in window. Drives the
   *  claim-time commitment summary — the claimer sees "we'll check
   *  in with you privately after N days" adjacent to the Claim
   *  button so claiming isn't a black box. */
  taskCheckInDays: number;
  /** Optional active search query — when non-empty, every match in the
   *  task title is wrapped in <mark> via HighlightedText so the member
   *  sees why this row matched. Description stays plain for v1 — the
   *  title is enough for finding tasks at a glance. */
  searchQuery?: string;
  /** When non-null, the row participates in drag-reorder. The title
   *  receives the spread `{...attributes} {...listeners}` to act as
   *  the drag handle (design doc §3 — "only show task titles"). */
  sortableHandle?: {
    attributes: ReturnType<typeof useSortable>["attributes"];
    listeners: ReturnType<typeof useSortable>["listeners"];
  } | null;
  /** When non-null, the row renders Move up / Move down buttons.
   *  This is the keyboard-canonical path (design doc §9.2). */
  moveButtons?: {
    isFirst: boolean;
    isLast: boolean;
    onMove: (direction: "up" | "down") => void;
  } | null;
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
  const [editDeps, setEditDeps] = useState<string[]>(task.dependencies);
  const [followsExpanded, setFollowsExpanded] = useState(false);

  // Only unmet (non-completed) deps render in the Follows badge — a
  // completed upstream is no longer informative on the downstream row.
  const unmetDepTitles = useMemo(() => {
    return task.dependencies
      .map((id) => allTasks.find((t) => t.id === id))
      .filter((dep): dep is ProjectTask => !!dep && dep.status !== "completed")
      .map((dep) => ({ id: dep.id, title: dep.title }));
  }, [task.dependencies, allTasks]);
  const hasUnmetDeps = unmetDepTitles.length > 0;
  // Claimer-side note: visible only to the claimant when the task is
  // structurally blocked. canClaimTask reads the full task list to
  // include not-yet-loaded dep titles that have completed.
  const isClaimant = task.assignedTo === currentKey;
  const isStructurallyBlocked = !canClaimTask(task, allTasks);
  const showClaimerNote =
    isClaimant && isStructurallyBlocked && task.status === "claimed";

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
          <span className="text-xs text-moss-500 dark:text-moss-300">
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
          <FollowsBadge
            unmetDeps={unmetDepTitles}
            expanded={followsExpanded}
            onToggle={() => setFollowsExpanded((v) => !v)}
            t={t}
          />
        )}
        {moveButtons && (
          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              aria-label={t("projects.task.moveUp", { title: task.title })}
              aria-disabled={moveButtons.isFirst}
              disabled={moveButtons.isFirst}
              onClick={() => {
                if (!moveButtons.isFirst) moveButtons.onMove("up");
              }}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-moss-600 hover:bg-moss-100 hover:text-moss-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-canopy-600 disabled:cursor-not-allowed disabled:opacity-30 dark:text-moss-300 dark:hover:bg-moss-800 dark:hover:text-moss-100"
            >
              <ArrowUpIcon />
            </button>
            <button
              type="button"
              aria-label={t("projects.task.moveDown", { title: task.title })}
              aria-disabled={moveButtons.isLast}
              disabled={moveButtons.isLast}
              onClick={() => {
                if (!moveButtons.isLast) moveButtons.onMove("down");
              }}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-moss-600 hover:bg-moss-100 hover:text-moss-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-canopy-600 disabled:cursor-not-allowed disabled:opacity-30 dark:text-moss-300 dark:hover:bg-moss-800 dark:hover:text-moss-100"
            >
              <ArrowDownIcon />
            </button>
          </div>
        )}
      </div>
      <h3
        className={`text-base font-semibold leading-snug ${sortableHandle ? "cursor-grab touch-none select-none active:cursor-grabbing" : ""}`}
        {...(sortableHandle?.attributes ?? {})}
        {...(sortableHandle?.listeners ?? {})}
      >
        {searchQuery && searchQuery.trim() !== "" ? (
          <HighlightedText text={task.title} query={searchQuery} />
        ) : (
          task.title
        )}
        {sortableHandle && (
          <span className="sr-only">
            {" "}
            {t("projects.task.dragHint")}
          </span>
        )}
      </h3>
      {showClaimerNote && (
        <p className="text-xs italic text-moss-500 dark:text-moss-300">
          {t("projects.task.waitingOnClaimerNote")}
        </p>
      )}
      {task.description && (
        <p className="text-sm text-moss-600 dark:text-moss-300">
          {task.description}
        </p>
      )}
      {task.assignedTo &&
        (task.status === "awaiting_confirmation" ? (
          <p className="text-xs text-moss-500 dark:text-moss-300">
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
          <p className="text-xs text-moss-500 dark:text-moss-300">
            {t("projects.task.claimedBy", {
              name: memberMap.get(task.assignedTo) ?? "—",
            })}
          </p>
        ) : null)}
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
            <p className="basis-full text-xs text-moss-500 dark:text-moss-300">
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
            {/* `solidarity-not-shame`: keep release one-tap (no
                confirm dialog gating a member who's already trying
                to communicate "I can't carry this") and let the
                muted line near the button carry the reassurance.
                The framing names that releasing HELPS — it routes
                the work to someone who can carry it — and that no
                one is keeping score. */}
            <p className="basis-full text-xs text-moss-500 dark:text-moss-300">
              {t("projects.task.releaseReassurance")}
            </p>
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
          <span className="text-xs text-moss-500 dark:text-moss-300">
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
              <p className="text-xs text-moss-500 dark:text-moss-300">
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
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-moss-500 dark:text-moss-300">
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
            placeholder={t("projects.task.addTask.fieldSkillsPlaceholder")}
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
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-500 dark:text-moss-300">
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
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-500 dark:text-moss-300">
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
              <p className="mb-1 text-xs text-moss-500 dark:text-moss-300">
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

// One invitation's terminal state, derived in the UI from the three
// local record tables. `pending` = no response, no revocation, not
// expired; everything else is a past outcome shown in the 30-day
// retention window. See `docs/co-organizer-invitations.md` §6.
type InvitationOutcome = "pending" | "accepted" | "declined" | "revoked" | "expired";

interface DerivedInvitation {
  invitation: CoOrganizerInvitation;
  outcome: InvitationOutcome;
  /** Wall-clock moment the terminal decision landed — used for the
   *  30-day retention cutoff and the "when" column. For pending rows
   *  this is the issue time. */
  decidedAt: number;
}

const PAST_INVITATION_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

function deriveInvitations(
  projectId: string,
  invitations: readonly CoOrganizerInvitation[],
  responses: readonly CoOrganizerInvitationResponse[],
  revocations: readonly CoOrganizerInvitationRevocation[],
  now: number,
): DerivedInvitation[] {
  const responseByInvitationId = new Map<string, CoOrganizerInvitationResponse>();
  for (const r of responses) responseByInvitationId.set(r.invitationId, r);
  const revocationByInvitationId = new Map<string, CoOrganizerInvitationRevocation>();
  for (const r of revocations) revocationByInvitationId.set(r.invitationId, r);

  const derived: DerivedInvitation[] = [];
  for (const invitation of invitations) {
    if (invitation.projectId !== projectId) continue;
    const response = responseByInvitationId.get(invitation.id);
    const revocation = revocationByInvitationId.get(invitation.id);
    if (revocation) {
      derived.push({ invitation, outcome: "revoked", decidedAt: revocation.revokedAt });
    } else if (response) {
      derived.push({
        invitation,
        outcome: response.decision === "accept" ? "accepted" : "declined",
        decidedAt: response.decidedAt,
      });
    } else if (now >= invitation.expiresAt) {
      derived.push({ invitation, outcome: "expired", decidedAt: invitation.expiresAt });
    } else {
      derived.push({ invitation, outcome: "pending", decidedAt: invitation.createdAt });
    }
  }
  return derived;
}

function CoOrganizerSection({
  project,
  members,
  currentKey,
  memberMap,
  nodeId,
  lockState,
  invitations,
  responses,
  revocations,
  onRun,
}: {
  project: Project;
  members: readonly Member[];
  currentKey: string;
  memberMap: Map<string, string>;
  nodeId: string;
  lockState: LockState;
  invitations: readonly CoOrganizerInvitation[];
  responses: readonly CoOrganizerInvitationResponse[];
  revocations: readonly CoOrganizerInvitationRevocation[];
  onRun: <T>(action: () => Promise<T>) => Promise<T | null>;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [selectedKey, setSelectedKey] = useState("");
  const [revokeId, setRevokeId] = useState<string | null>(null);
  const { pending, run: runWithPending } = usePendingAction();

  const derived = useMemo(
    () =>
      deriveInvitations(
        project.id,
        invitations,
        responses,
        revocations,
        Date.now(),
      ),
    [project.id, invitations, responses, revocations],
  );
  const pendingInvitations = useMemo(
    () =>
      derived
        .filter((d) => d.outcome === "pending")
        .sort((a, b) => b.invitation.createdAt - a.invitation.createdAt),
    [derived],
  );
  const now = Date.now();
  const pastInvitations = useMemo(
    () =>
      derived
        .filter(
          (d) =>
            d.outcome !== "pending" &&
            now - d.decidedAt <= PAST_INVITATION_RETENTION_MS,
        )
        .sort((a, b) => b.decidedAt - a.decidedAt),
    [derived, now],
  );

  // A member is eligible for an invitation if they're not already the
  // primary, not already a (legacy) co-organizer, and don't have an
  // outstanding pending invitation.
  const pendingInviteeKeys = useMemo(
    () => new Set(pendingInvitations.map((d) => d.invitation.inviteeKey)),
    [pendingInvitations],
  );
  const eligible = members.filter(
    (m) =>
      m.publicKey !== project.organizerKey &&
      !project.coOrganizerKeys.includes(m.publicKey) &&
      !pendingInviteeKeys.has(m.publicKey),
  );

  async function handleSend() {
    if (!selectedKey) return;
    if (lockState === "locked") {
      showToast(t("projects.coOrganizers.invite.locked"), "error");
      return;
    }
    await runWithPending(() =>
      onRun(async () => {
        const inviterSecretKey = await getSecretKey(currentKey);
        const invitation = await issueCoOrganizerInvitation({
          projectId: project.id,
          inviterKey: currentKey,
          inviterSecretKey,
          inviteeKey: selectedKey,
          nodeId,
        });
        await logActivity(
          project.id,
          "coorganizer_invited",
          currentKey,
          { invitationId: invitation.id, inviteeKey: selectedKey },
          nodeId,
        );
        return invitation;
      }),
    );
    setSelectedKey("");
  }

  async function handleRevoke(invitationId: string) {
    if (lockState === "locked") {
      showToast(t("projects.coOrganizers.invite.locked"), "error");
      return;
    }
    await runWithPending(() =>
      onRun(async () => {
        const inviterSecretKey = await getSecretKey(currentKey);
        const revocation = await revokeCoOrganizerInvitation({
          invitationId,
          inviterSecretKey,
          nodeId,
        });
        await logActivity(
          project.id,
          "coorganizer_revoked",
          currentKey,
          { invitationId },
          nodeId,
        );
        return revocation;
      }),
    );
    setRevokeId(null);
  }

  function labelFor(key: string): string {
    return memberMap.get(key) ?? shortKey(key);
  }

  return (
    <section className="card mb-4">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-500 dark:text-moss-300">
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
              <span>{labelFor(key)}</span>
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

      {/* Invite affordance — replaces the unilateral add. */}
      {eligible.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          <label className="sr-only" htmlFor="coorg-invite-select">
            {t("projects.coOrganizers.selectPlaceholder")}
          </label>
          <select
            id="coorg-invite-select"
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
            aria-busy={pending}
            onClick={() => void handleSend()}
          >
            {pending
              ? t("common.working")
              : t("projects.coOrganizers.invite.send")}
          </button>
        </div>
      )}
      <p className="mb-3 text-xs text-moss-500 dark:text-moss-300">
        {t("projects.coOrganizers.invite.copy")}
      </p>

      {/* Pending invitations */}
      {pendingInvitations.length > 0 && (
        <div className="mb-3">
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-moss-500 dark:text-moss-300">
            {t("projects.coOrganizers.pending.title")}
          </h3>
          <ul className="flex flex-col gap-1">
            {pendingInvitations.map(({ invitation }) => (
              <li
                key={invitation.id}
                className="rounded-lg bg-canopy-50 px-3 py-2 text-sm dark:bg-canopy-950/40"
              >
                <p className="font-medium">{labelFor(invitation.inviteeKey)}</p>
                <p className="text-xs text-moss-600 dark:text-moss-300">
                  {t("projects.coOrganizers.pending.issued", {
                    when: formatRelativeTime(invitation.createdAt),
                  })}
                  {" · "}
                  {t("projects.coOrganizers.pending.expires", {
                    when: formatRelativeTime(invitation.expiresAt),
                  })}
                </p>
                <button
                  type="button"
                  className="btn-ghost mt-1 text-xs text-rose-700 dark:text-rose-300"
                  disabled={pending}
                  onClick={() => setRevokeId(invitation.id)}
                >
                  {t("projects.coOrganizers.pending.revoke")}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Past invitations — 30-day retention window. Nothing renders
          when the window is empty. */}
      {pastInvitations.length > 0 && (
        <div>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-moss-500 dark:text-moss-300">
            {t("projects.coOrganizers.past.title")}
          </h3>
          <ul className="flex flex-col gap-1">
            {pastInvitations.map(({ invitation, outcome, decidedAt }) => (
              <li
                key={invitation.id}
                className="flex flex-wrap items-center justify-between gap-1 rounded-lg bg-moss-50 px-3 py-1.5 text-xs dark:bg-moss-900/40"
              >
                <span className="font-medium text-moss-700 dark:text-moss-200">
                  {labelFor(invitation.inviteeKey)}
                </span>
                <span className="text-moss-500 dark:text-moss-300">
                  {t(
                    `projects.coOrganizers.past.outcome.${outcome}` as "projects.coOrganizers.past.outcome.declined",
                  )}
                  {" · "}
                  {formatRelativeTime(decidedAt)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ConfirmDialog
        open={revokeId !== null}
        title={t("projects.coOrganizers.pending.revokeConfirmTitle")}
        description={t("projects.coOrganizers.pending.revokeConfirmBody")}
        confirmLabel={t("projects.coOrganizers.pending.revoke")}
        tone="caution"
        onCancel={() => setRevokeId(null)}
        onConfirm={() => {
          if (revokeId) void handleRevoke(revokeId);
        }}
      />
    </section>
  );
}

// Persistent collapsible reference shown to co-organizers (NOT the
// primary, NOT regular members) so the role's scope is in reach
// without re-asking the primary. The accept flow's comparison card
// names commitments at the moment of signing; this card answers the
// follow-up "ok, what does that actually let me do?" without
// changing capabilities. Member-language wording (not function
// names). Collapsed by default so it stays informational rather than
// nagging — `solidarity-not-shame` (no banner, no badge) and
// `community-authority` (documents what already exists; doesn't
// grant). The not-included line is sourced from the
// `requireOrganizer` callers in `db/projects.ts` and the primary-only
// gates on `archiveProject` / `unarchiveProject`, plus the
// primary-only invite path in `CoOrganizerSection` above.
//
// See `docs/co-organizer-invitations.md` §4 for the canonical
// capability list and the not-included set.
function CoOrganizerCapabilityCard() {
  const { t } = useTranslation();
  return (
    <section className="card mb-4">
      <details>
        <summary className="cursor-pointer text-sm font-semibold uppercase tracking-wide text-moss-500 marker:hidden hover:underline">
          {t("projects.coorg.capabilitiesTitle")}
        </summary>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-moss-700 dark:text-moss-200">
          <li>{t("projects.coorg.capabilities.lifecycle")}</li>
          <li>{t("projects.coorg.capabilities.tasks")}</li>
          <li>{t("projects.coorg.capabilities.ordering")}</li>
          <li>{t("projects.coorg.capabilities.confirm")}</li>
          <li>{t("projects.coorg.capabilities.announce")}</li>
          <li>{t("projects.coorg.capabilities.stepDown")}</li>
        </ul>
        <p className="mt-3 text-xs text-moss-500 dark:text-moss-400">
          {t("projects.coorg.notIncluded")}
        </p>
      </details>
    </section>
  );
}

// Self-serve role exit for a co-organizer. Shown to co-organizers
// (not the primary) so they can leave the role without waiting on
// primary-organizer approval — no one is conscripted into a role.
// The confirm step exists because the action is irreversible from
// the co-organizer's side: once they step down, only the primary
// can add them back.
function CoOrganizerStepDownSection({
  project,
  currentKey,
  onRun,
}: {
  project: Project;
  currentKey: string;
  onRun: <T>(action: () => Promise<T>) => Promise<T | null>;
}) {
  const { t } = useTranslation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { pending, run: runWithPending } = usePendingAction();

  return (
    <section className="card mb-4">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-500 dark:text-moss-300">
        {t("projects.coOrganizers.title")}
      </h2>
      <button
        type="button"
        className="btn-ghost text-sm text-rose-700 dark:text-rose-300"
        disabled={pending}
        onClick={() => setConfirmOpen(true)}
      >
        {t("projects.coorganizer.stepDown")}
      </button>
      <ConfirmDialog
        open={confirmOpen}
        title={t("projects.coorganizer.stepDownConfirmTitle")}
        description={t("projects.coorganizer.stepDownConfirmBody")}
        confirmLabel={t("projects.coorganizer.stepDownConfirmCta")}
        tone="caution"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() =>
          runWithPending(() =>
            onRun(() =>
              removeCoOrganizer(project.id, currentKey, currentKey),
            ),
          ).finally(() => setConfirmOpen(false))
        }
      />
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
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-moss-500 dark:text-moss-300">
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
        <div className="flex items-center justify-between text-xs text-moss-500 dark:text-moss-300">
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
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-500 dark:text-moss-300">
        {t("projects.history.title")}
      </h2>
      <ul className="flex flex-col gap-2">
        {activities.map((a) => (
          <li key={a.id} className="flex items-start gap-2 text-sm">
            <span className="shrink-0 text-xs text-moss-500 dark:text-moss-300">
              {formatRelativeTime(a.createdAt)}
            </span>
            <span className="text-moss-700 dark:text-moss-200">
              <span className="font-medium">
                {memberMap.get(a.actorKey) ?? t("common.memberFallback")}
              </span>
              {" — "}
              {t(`projects.activityType.${a.type}` as "projects.activityType.project_created")}
              {a.type === "announcement" && (a.data as { body?: string }).body && (
                <span className="ml-1 italic text-moss-500 dark:text-moss-300">
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
