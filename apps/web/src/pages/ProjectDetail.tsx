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
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
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
  issueInvitationsForClone,
  revokeCoOrganizerInvitation,
} from "@/db/coorgInvitations";
import { getSecretKey, type LockState } from "@/db/secrets";
import { getSetting, SETTING_KEYS, setSetting } from "@/db/database";
import { listLinksForProject } from "@/db/eventProjectLinks";
import { fileAdoptionProposal, lastOrganizerActivityAt } from "@/db/adoption";
import { ADOPTION_MIN_DELIBERATION_DAYS } from "@/lib/autoCloseProposals";
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
import { creditHoursForTask } from "@/lib/timebank";
import { workingAlongsideKeys } from "@/lib/projectRoster";
import { computeProjectMomentum } from "@/lib/projectMomentum";
import { computeProjectClosure, type ProjectClosure } from "@/lib/projectClosure";
import { startOfTodayMs } from "@/lib/calendar";
import { ProjectSparkline } from "@/components/ProjectSparkline";
import { ProjectMomentumChip } from "@/components/ProjectMomentumChip";
import { ExpandableText } from "@/components/ExpandableText";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ReorderTasksDialog } from "@/components/ReorderTasksDialog";
import { useFlipAnimation } from "@/lib/a11y/useFlipAnimation";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";
import { IconMessages, Sprig } from "@/components/visual";
import { usePendingAction } from "@/lib/usePendingAction";
import { WhyTooltip } from "@/components/WhyTooltip";
import { TaskComments } from "@/components/TaskComments";
import type {
  CoOrganizerInvitation,
  CoOrganizerInvitationResponse,
  CoOrganizerInvitationRevocation,
  Event,
  EventProjectLinkRow,
  Member,
  Project,
  ProjectAdoptionPayload,
  ProjectCategory,
  ProjectTask,
  Urgency,
} from "@/types";

// Density cap on the project "Updates" feed. listAnnouncements
// returns newest → oldest, so when collapsed we keep the first N.
// A long-running project's history can't push later sections off
// screen; "Show older (N)" expands the full set.
const MAX_VISIBLE_ANNOUNCEMENTS = 5;

// The task search + status filters only earn their vertical space once
// the list is long enough that scanning it is hard. Below this, a small
// project shows the bare list — no search box, no filter pills.
const MIN_TASKS_FOR_FILTERS = 7;

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
    blockedKeys,
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
  // Below the threshold the list is short enough to scan at a glance,
  // so we drop the search box and filter pills and just show the rows.
  const showTaskControls = tasks.length >= MIN_TASKS_FOR_FILTERS;

  // Task deep-links: a `#task-<id>` fragment (from the attention rail
  // or the cross-project "tasks you're carrying" view) scrolls the
  // named task into view, moves focus to its row, and gives it a
  // brief, motion-safe highlight. Pull-only — the member tapped a row
  // they opened; nothing pushes. The transient ring is a locator, not
  // a status marker (solidarity-not-shame: no day counters, no
  // "overdue" framing rides along).
  const location = useLocation();
  const reduced = useReducedMotion();
  const [highlightTaskId, setHighlightTaskId] = useState<string | null>(null);
  const [deepLinkAnnouncement, setDeepLinkAnnouncement] = useState("");
  // The hash we've already scrolled to. Lets the member re-filter
  // afterward without the effect snapping the list back.
  const handledHashRef = useRef<string | null>(null);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const match = location.hash.match(/^#task-(.+)$/);
    if (!match) {
      handledHashRef.current = null;
      return;
    }
    if (handledHashRef.current === location.hash) return;
    const targetId = match[1];
    // Not on this project, or live data is still hydrating — wait; the
    // effect re-runs when `tasks` changes.
    if (!tasks.some((task) => task.id === targetId)) return;
    // Present but hidden by a filter or search. Clear them once,
    // announce the reset, and let the next pass (visibleTasks changes)
    // do the scroll. The explicit member intent ("show me this task")
    // outranks the session-only filter.
    if (!visibleTasks.some((task) => task.id === targetId)) {
      setTaskFilter("all");
      setQuery("");
      setDebouncedQuery("");
      setDeepLinkAnnouncement(t("projects.detail.taskDeepLink.filtersCleared"));
      return;
    }
    const el = document.getElementById(`task-${targetId}`);
    if (!el) return;
    handledHashRef.current = location.hash;
    el.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "center",
    });
    // preventScroll so focus doesn't jump-cut over the smooth scroll.
    el.focus({ preventScroll: true });
    setHighlightTaskId(targetId);
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    highlightTimerRef.current = setTimeout(
      () => setHighlightTaskId(null),
      2000,
    );
  }, [location.hash, tasks, visibleTasks, reduced, t]);
  useEffect(
    () => () => {
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    },
    [],
  );
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

  // Open community-adoption proposal for this project, if any — drives
  // the governance-in-motion banner and suppresses a second filing.
  // Read from the proposals already in AppContext (small list).
  const openAdoption = useMemo(() => {
    if (!project) return null;
    for (const p of proposals) {
      if (p.category !== "project_adoption" || p.status !== "open") continue;
      try {
        const payload = JSON.parse(p.payload) as ProjectAdoptionPayload;
        if (payload.projectId === project.id) return p;
      } catch {
        // Skip malformed payloads.
      }
    }
    return null;
  }, [proposals, project]);

  const memberMap = useMemo(
    () => new Map(members.map((m) => [m.publicKey, m.displayName])),
    [members],
  );
  // Names-only "working alongside" roster — members with hands on a
  // task here, alphabetical. The helper applies the same
  // needs_more_hands name suppression the task rows use, so the card
  // reveals nothing the page doesn't already show. Unknown keys (no
  // member row on this device) are skipped — a bare key adds nothing a
  // row didn't already carry.
  const workingAlongside = useMemo(() => {
    const keys = workingAlongsideKeys(tasks, nodeConfig, blockedKeys);
    const people: { key: string; name: string }[] = [];
    for (const key of keys) {
      const name = memberMap.get(key);
      if (name) people.push({ key, name });
    }
    people.sort((a, b) => a.name.localeCompare(b.name));
    return people;
  }, [tasks, nodeConfig, blockedKeys, memberMap]);

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
  const showCoOrgManagement =
    isPrimaryOrganizer && project.status !== "completed" && project.status !== "archived";
  const showHandoff =
    isPrimaryOrganizer && project.coOrganizerKeys.length > 0 &&
    project.status !== "completed" && project.status !== "archived";
  const showStepDown = isOrg && !isPrimaryOrganizer;
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
  // Closure aggregates — distinct contributors and hours moved — read
  // from the signed exchange ledger (the immutable truth), not the
  // mutable task rows. Feeds the completion moment, the permanent banner
  // line, and the sidebar "Contributors" field, so the page can never
  // show two different counts. Aggregate-only by construction; see
  // lib/projectClosure.ts.
  const closure = computeProjectClosure({ project, exchanges });
  const showCompletionMoment = useNewlyCompletedProjectMoment(
    project,
    closure.contributorCount,
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
              <ExpandableText
                text={project.description}
                className="mt-2 whitespace-pre-wrap text-sm text-moss-700 dark:text-moss-200"
                clampLines={4}
              />
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
              <Field label={t("projects.detail.contributors", { count: closure.contributorCount })}>
                {closure.contributorCount}
              </Field>
            </dl>
            {showCompletionMoment && (
              <CompletionMoment closure={closure} isOrg={isOrg} />
            )}
            {(project.status === "completed" || project.status === "archived") &&
              project.completedAt && (
                <p className="mt-3 rounded-xl bg-canopy-50 p-3 text-sm text-canopy-900 dark:bg-canopy-950/40 dark:text-canopy-100">
                  {t("projects.detail.completed", {
                    when: formatRelativeTime(project.completedAt),
                  })}
                  {closure.contributorCount > 0 && (
                    <span className="mt-1 block text-canopy-800 dark:text-canopy-200">
                      {t("projects.completionMoment.summary", {
                        count: closure.contributorCount,
                        hours: formatHours(closure.hoursMoved),
                      })}
                    </span>
                  )}
                </p>
              )}
            {project.status === "paused" && project.pauseNote && (
              <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
                {t("projects.detail.paused", { note: project.pauseNote })}
              </p>
            )}
          </div>

          <WorkingAlongsideCard people={workingAlongside} />

          <NextWorkDayGlance project={project} />
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

          {/* Governance-in-motion banner — anyone viewing sees that the
              community is deciding on new stewardship. No push, no badge;
              the proposal in Decisions is where it's acted on. */}
          {openAdoption && (
            <Link
              to="/proposals"
              className="mb-4 block rounded-xl bg-canopy-50 p-3 text-sm text-canopy-900 underline-offset-2 hover:underline dark:bg-canopy-950/40 dark:text-canopy-100"
            >
              {t("projects.adoptionBanner")}
            </Link>
          )}

          <AnnouncementSection
            project={project}
            isOrg={isOrg}
            memberMap={memberMap}
            nodeId={nodeId}
            currentKey={currentMember?.publicKey}
          />

          <WorkDaysSection project={project} isOrg={isOrg} />

          <section className="mb-4">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
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
            ) : !showTaskControls ? (
              // Short list: no search, no filter pills, no filtered-empty
              // state. Render every task (not `visibleTasks`) so a stale
              // filter from a prior render can never strand a small list.
              <>
                <TaskList
                  tasks={tasks}
                  visibleTasks={tasks}
                  isOrg={isOrg}
                  project={project}
                  currentKey={currentMember?.publicKey}
                  memberMap={memberMap}
                  nodeId={nodeId}
                  nodeConfig={nodeConfig}
                  onRun={run}
                  flaggedCommentIds={flaggedCommentIds}
                  searchQuery={debouncedQuery}
                  highlightTaskId={highlightTaskId}
                />
                <div aria-live="polite" aria-atomic="true" className="sr-only">
                  {deepLinkAnnouncement}
                </div>
              </>
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
                    highlightTaskId={highlightTaskId}
                  />
                )}
                <div aria-live="polite" aria-atomic="true" className="sr-only">
                  {deepLinkAnnouncement}
                </div>
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

          {/* Community stewardship offer — shown to anyone who isn't the
              sitting primary (co-organizers included; they're natural
              candidates), once the primary has been quiet long enough and
              no offer is already open. The quiet-period gate lives inside
              the section. Adoption is allowed on completed projects (so a
              new primary can archive), only archived is excluded. */}
          {currentMember &&
            !isPrimaryOrganizer &&
            !openAdoption &&
            project.status !== "archived" && (
              <AdoptionSection
                project={project}
                currentKey={currentMember.publicKey}
                nodeId={nodeId}
                onRun={run}
              />
            )}

          {isOrg && <OrganizerControls project={project} onRun={run} />}

          {isOrg && !isPrimaryOrganizer && <CoOrganizerCapabilityCard />}

          {/* Low-frequency governance verbs (invite/handoff/step-down)
              collapsed behind one "Manage project" disclosure so the
              high-volume reading column isn't buried under them. Rendered
              only when at least one inner section would show. */}
          {(showCoOrgManagement || showHandoff || showStepDown) && (
            <details className="card mb-4">
              <summary className="cursor-pointer text-sm font-semibold uppercase tracking-wide text-moss-600 marker:hidden hover:underline dark:text-moss-300">
                {t("projects.manage.title")}
              </summary>
              <div className="mt-3 flex flex-col gap-4">
                {showCoOrgManagement && (
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
                {showHandoff && (
                  <HandoffSection
                    project={project}
                    currentKey={currentMember!.publicKey}
                    memberMap={memberMap}
                    onRun={run}
                  />
                )}
                {showStepDown && (
                  <CoOrganizerStepDownSection
                    project={project}
                    currentKey={currentMember!.publicKey}
                    onRun={run}
                  />
                )}
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Stable id on the announcement textarea so the completion moment's
// organizer nudge can scroll to and focus it across the sidebar/main
// column split (they live in different subtrees, so a ref would have to
// be threaded through the whole page).
const ANNOUNCEMENT_INPUT_ID = "project-announcement-input";

// Render an event start as "<date> · <time>" in the active locale —
// matches EventDetail's formatter. Local-clock display; the federated
// record carries UTC epoch ms.
function formatWorkDayWhen(ms: number, locale: string | undefined): string {
  const d = new Date(ms);
  return `${d.toLocaleDateString(locale)} · ${d.toLocaleTimeString(locale, {
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

// Upcoming work days for a project, soonest-first — the community events
// linked to it as work days, on THIS node only (the link is local-only;
// peers see a plain event — see db/eventProjectLinks.ts). Shared by the
// main-column `WorkDaysSection` and the rail's `NextWorkDayGlance` so the
// "what counts as the next work day" rule lives in exactly one place.
function useUpcomingWorkDays(project: Project): Event[] {
  const { events, eventCancellations } = useApp();
  const links = useLiveQuery(
    () => listLinksForProject(project.id),
    [project.id],
    [] as EventProjectLinkRow[],
  );
  return useMemo(() => {
    const linkedIds = new Set(links.map((l) => l.eventId));
    if (linkedIds.size === 0) return [];
    const cancelledIds = new Set(eventCancellations.map((c) => c.eventId));
    // Keep multi-day events still running today (end-of-day comparison),
    // mirroring lib/calendar.ts `entryIsPast`.
    const today = startOfTodayMs(Date.now());
    return events
      .filter((e) => linkedIds.has(e.id))
      .filter((e) => !cancelledIds.has(e.id))
      .filter((e) => (e.endsAt ?? e.startsAt) >= today)
      .sort((a, b) => a.startsAt - b.startsAt);
  }, [links, events, eventCancellations]);
}

// "Upcoming work days" — community events linked to this project as work
// days, on THIS node only (the link is local-only; peers see a plain
// event — see db/eventProjectLinks.ts). Pull-only, no attention items.
// Hidden entirely for a viewer who can neither see an upcoming work day
// nor schedule one, so an empty list never shames a project that hasn't
// held one (solidarity-not-shame).
function WorkDaysSection({
  project,
  isOrg,
}: {
  project: Project;
  isOrg: boolean;
}) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const upcoming = useUpcomingWorkDays(project);
  const canSchedule =
    isOrg && project.status !== "completed" && project.status !== "archived";

  if (upcoming.length === 0 && !canSchedule) return null;

  return (
    <section className="mb-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
          {t("projects.workDays.heading")}
        </h2>
        {canSchedule && (
          <button
            type="button"
            className="btn-secondary text-sm"
            onClick={() => navigate(`/events/new?projectId=${project.id}`)}
          >
            {t("projects.workDays.scheduleButton")}
          </button>
        )}
      </div>
      {upcoming.length > 0 && (
        <ul className="flex flex-col gap-2">
          {upcoming.map((e) => (
            <li key={e.id}>
              <Link
                to={`/events/${e.id}`}
                className="card block transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-canopy-600/50"
              >
                <p className="font-medium">{e.title}</p>
                <p className="mt-0.5 text-sm text-moss-600 dark:text-moss-300">
                  {formatWorkDayWhen(e.startsAt, i18n.resolvedLanguage)}
                  {e.location
                    ? ` · ${t("projects.workDays.itemAt", { location: e.location })}`
                    : ""}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {/* Honest federation footnote — the link is this node's view only. */}
      <p className="mt-2 text-xs text-moss-500 dark:text-moss-400">
        {t("projects.workDays.localLinkHint")}
      </p>
    </section>
  );
}

// Rail-only "next work day" glance — answers "when's the next time to show
// up?" while the full WorkDaysSection scrolls out of view in the main
// column. Desktop-only (`hidden lg:block`): on mobile the rail stacks
// first and the full list is right there in the flow, so a glance would
// just duplicate it; the empty-rail gap it fills is wide-screen-only too.
// Renders nothing when there's no upcoming work day — an empty glance
// would shame a project that hasn't scheduled one (same posture as
// WorkDaysSection). No counts: just the single next day, as a calm link.
function NextWorkDayGlance({ project }: { project: Project }) {
  const { t, i18n } = useTranslation();
  const upcoming = useUpcomingWorkDays(project);
  const next = upcoming[0];
  if (!next) return null;
  return (
    <section
      className="card mb-4 hidden lg:block"
      aria-labelledby="next-work-day-title"
    >
      <h2
        id="next-work-day-title"
        className="text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300"
      >
        {t("projects.workDays.nextGlanceHeading")}
      </h2>
      <Link
        to={`/events/${next.id}`}
        className="mt-1 block underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-canopy-600/50"
      >
        <p className="font-medium">{next.title}</p>
        <p className="mt-0.5 text-sm text-moss-600 dark:text-moss-300">
          {formatWorkDayWhen(next.startsAt, i18n.resolvedLanguage)}
          {next.location
            ? ` · ${t("projects.workDays.itemAt", { location: next.location })}`
            : ""}
        </p>
      </Link>
    </section>
  );
}

// One-time, per-device completion moment — the project-closure twin of
// Dashboard's `useNewlyReachedMilestones`. Pops once for any viewer when
// a project is completed and at least one person moved hours, then marks
// the id in `celebratedProjectCompletions` so a revisit shows only the
// permanent banner line. A zero-contributor completion is never marked,
// so if exchanges arrive later the moment can still land on a real
// total (no-notifications: nothing buzzes; the moment waits to be seen).
function useNewlyCompletedProjectMoment(
  project: Project,
  contributorCount: number,
): boolean {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (project.status !== "completed" || contributorCount <= 0) {
      setShow(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      const stored = await getSetting(
        SETTING_KEYS.celebratedProjectCompletions,
      );
      if (cancelled) return;
      const celebrated = new Set<string>(
        stored ? (JSON.parse(stored) as string[]) : [],
      );
      if (celebrated.has(project.id)) {
        setShow(false);
        return;
      }
      setShow(true);
      celebrated.add(project.id);
      await setSetting(
        SETTING_KEYS.celebratedProjectCompletions,
        JSON.stringify(Array.from(celebrated)),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [project.id, project.status, contributorCount]);
  return show;
}

// The completion moment. Aggregate sentence only — never names, never
// shares, never percent-of-target (see lib/projectClosure.ts and the
// plan's values tension). Shown to every viewer, organizer or not, so it
// reads as "us," not a private medal; the organizer additionally gets a
// nudge into the existing announcement box, because community-authority
// prefers thanks spoken in the commons over a system-generated badge.
function CompletionMoment({
  closure,
  isOrg,
}: {
  closure: ProjectClosure;
  isOrg: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className="mb-3 animate-milestone-pop rounded-2xl bg-canopy-50 p-4 text-canopy-900 shadow-sm dark:bg-canopy-950/40 dark:text-canopy-100">
      <div className="flex items-center gap-3">
        <Sprig
          size={32}
          className="shrink-0 text-canopy-600 dark:text-canopy-300"
        />
        <div>
          <div className="text-sm font-semibold">
            {t("projects.completionMoment.title")}
          </div>
          <div className="text-base">
            {t("projects.completionMoment.summary", {
              count: closure.contributorCount,
              hours: formatHours(closure.hoursMoved),
            })}
          </div>
        </div>
      </div>
      {isOrg && (
        <div className="mt-3 border-t border-canopy-200/70 pt-3 dark:border-canopy-800/60">
          <p className="text-sm">{t("projects.completionMoment.thanksHint")}</p>
          <button
            type="button"
            className="btn-secondary mt-2"
            onClick={() => {
              const el = document.getElementById(ANNOUNCEMENT_INPUT_ID);
              if (!el) return;
              el.scrollIntoView({ behavior: "smooth", block: "center" });
              (el as HTMLTextAreaElement).focus({ preventScroll: true });
            }}
          >
            {t("projects.completionMoment.thanksCta")}
          </button>
        </div>
      )}
    </div>
  );
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
      <dt className="text-xs uppercase tracking-wide text-moss-600 dark:text-moss-300">
        {label}
      </dt>
      <dd className="mt-0.5 font-medium">{children}</dd>
    </div>
  );
}

// Names-only roster of members with hands on a task here. No hours, no
// per-member counts, no ranking (no-leaderboards). Hidden entirely when
// empty — an absent roster never reads as "nobody helped"
// (solidarity-not-shame). The inclusion + suppression logic lives in
// `lib/projectRoster.ts`; this just renders the resolved, sorted list.
function WorkingAlongsideCard({
  people,
}: {
  people: { key: string; name: string }[];
}) {
  const { t } = useTranslation();
  if (people.length === 0) return null;
  return (
    <section className="card mb-4" aria-labelledby="working-alongside-title">
      <h2
        id="working-alongside-title"
        className="text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300"
      >
        {t("projects.detail.workingAlongside.title")}
      </h2>
      <p className="mb-3 mt-1 text-xs text-moss-600 dark:text-moss-300">
        {t("projects.detail.workingAlongside.intro")}
      </p>
      <ul className="flex flex-col gap-1">
        {people.map((person) => (
          <li key={person.key}>
            <Link
              to={`/member/${person.key}`}
              className="text-sm text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
            >
              {person.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
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
  const { currentMember, nodeId, lockState, members } = useApp();
  const { showToast } = useToast();
  const [pauseNote, setPauseNote] = useState("");
  const [showPauseForm, setShowPauseForm] = useState(false);
  const [showCloneForm, setShowCloneForm] = useState(false);
  const [cloneTitle, setCloneTitle] = useState("");
  const { pending, run: runWithPending } = usePendingAction();
  const dispatch = <T,>(action: () => Promise<T>) =>
    runWithPending(() => onRun(action));

  // Candidate re-invitees for a clone: the source project's primary plus
  // its co-organizers (the live authority list), minus the cloner. When
  // the cloner is the primary, the primary drops out and the co-orgs
  // remain; when a co-organizer clones, the source primary stays as a
  // natural candidate. Derived ONLY from organizerKey/coOrganizerKeys —
  // never from the block table, so a missing name can't fingerprint a
  // block (docs/blocking.md §6.1); blocked pairs fail quietly on send.
  const cloneCandidates = useMemo(() => {
    if (!currentMember) return [];
    const seen = new Set<string>();
    const out: string[] = [];
    for (const k of [project.organizerKey, ...project.coOrganizerKeys]) {
      if (k === currentMember.publicKey || seen.has(k)) continue;
      seen.add(k);
      out.push(k);
    }
    return out;
  }, [project.organizerKey, project.coOrganizerKeys, currentMember]);
  // Pre-checked by default (continuity of a working crew); each box is
  // individually uncheckable so the send stays a deliberate act.
  const [checkedKeys, setCheckedKeys] = useState<Set<string>>(new Set());
  function toggleCloneForm() {
    setShowCloneForm((open) => {
      const next = !open;
      if (next) setCheckedKeys(new Set(cloneCandidates));
      return next;
    });
  }

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
            onClick={toggleCloneForm}
          >
            {t("projects.clone.button")}
          </button>
        </>
      )}
      {showCloneForm && currentMember && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const inviteeKeys = Array.from(checkedKeys);
            // No half-done state: if anything's checked but the session
            // is locked we can't sign the invitations — stop before
            // cloning and surface the existing locked message.
            if (inviteeKeys.length > 0 && lockState === "locked") {
              showToast(t("projects.coOrganizers.invite.locked"), "error");
              return;
            }
            const clone = await dispatch(() =>
              cloneProject(
                project.id,
                currentMember.publicKey,
                cloneTitle,
                nodeId,
              ),
            );
            if (!clone) return;
            if (inviteeKeys.length > 0) {
              try {
                const secret = await getSecretKey(currentMember.publicKey);
                const { sent, failed } = await issueInvitationsForClone({
                  projectId: clone.id,
                  inviterKey: currentMember.publicKey,
                  inviterSecretKey: secret,
                  inviteeKeys,
                  nodeId,
                });
                for (const inviteeKey of sent) {
                  await logActivity(
                    clone.id,
                    "coorganizer_invited",
                    currentMember.publicKey,
                    { inviteeKey },
                    nodeId,
                  );
                }
                if (failed.length > 0) {
                  showToast(t("projects.clone.reinvite.partialToast"));
                } else if (sent.length > 0) {
                  showToast(
                    t("projects.clone.reinvite.sentToast", {
                      count: sent.length,
                    }),
                  );
                }
              } catch {
                // The clone exists regardless; the cloner can invite from
                // the clone page. Cause-free, consistent with §6.1.
                showToast(t("projects.clone.reinvite.partialToast"));
              }
            }
            setShowCloneForm(false);
            setCloneTitle("");
            navigate(`/project/${clone.id}`);
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
          {cloneCandidates.length > 0 && (
            <fieldset className="flex flex-col gap-1 rounded-xl bg-moss-50 p-3 dark:bg-moss-900/40">
              <legend className="px-1 text-sm font-medium">
                {t("projects.clone.reinvite.title")}
              </legend>
              <p className="text-xs text-moss-600 dark:text-moss-300">
                {t("projects.clone.reinvite.intro")}
              </p>
              <ul className="mt-1 flex flex-col gap-1">
                {cloneCandidates.map((key) => {
                  const name =
                    members.find((m) => m.publicKey === key)?.displayName ??
                    shortKey(key);
                  return (
                    <li key={key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-moss-300"
                        checked={checkedKeys.has(key)}
                        aria-label={t("projects.clone.reinvite.candidateAria", {
                          name,
                        })}
                        onChange={(e) =>
                          setCheckedKeys((prev) => {
                            const next = new Set(prev);
                            if (e.target.checked) next.add(key);
                            else next.delete(key);
                            return next;
                          })
                        }
                      />
                      <span className="text-sm">{name}</span>
                      {key === project.organizerKey && (
                        <span className="chip bg-moss-100 text-moss-700 dark:bg-moss-800 dark:text-moss-200">
                          {t("projects.clone.reinvite.sourcePrimaryChip")}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
              <p className="mt-1 text-xs text-moss-600 dark:text-moss-300">
                {t("projects.clone.reinvite.skipHint")}
              </p>
            </fieldset>
          )}
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
  highlightTaskId,
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
  /** Task whose row should carry the transient deep-link highlight,
   *  or null. The `id="task-<id>"` anchor lives on every row already
   *  (used by FollowsBadge's in-page jump); this only adds the ring. */
  highlightTaskId?: string | null;
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

  // Read once for the whole list — the claimer narrative under
  // awaiting_confirmation needs the auto-confirm window to decide
  // whether to render the safety-net sentence. 0 (or undefined
  // nodeConfig) means "no sweep configured on this node," and the
  // line is suppressed entirely.
  const autoConfirmHours =
    (nodeConfig as { autoConfirmHours?: number } | undefined)
      ?.autoConfirmHours ?? 0;

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
        autoConfirmHours={autoConfirmHours}
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
            <li
              key={task.id}
              id={`task-${task.id}`}
              tabIndex={-1}
              className={
                task.id === highlightTaskId
                  ? "rounded-lg ring-2 ring-canopy-500 motion-safe:transition-shadow"
                  : undefined
              }
            >
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
              tabIndex={-1}
              className={
                task.id === highlightTaskId
                  ? "rounded-lg ring-2 ring-canopy-500 motion-safe:transition-shadow"
                  : undefined
              }
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
  autoConfirmHours: number;
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
  autoConfirmHours,
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
  /** From `nodeConfig.autoConfirmHours`. 0 (or no nodeConfig) means
   *  the sweep is off, and the claimer narrative omits its safety-net
   *  line entirely. */
  autoConfirmHours: number;
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
  const { showToast } = useToast();
  const isAssignee = task.assignedTo === currentKey;
  const isCompleter = task.completedBy === currentKey;
  const { pending, run: runWithPending } = usePendingAction();
  const dispatch = <T,>(action: () => Promise<T>) =>
    runWithPending(() => onRun(action));

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
        <p className="text-xs italic text-moss-600 dark:text-moss-300">
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
        {task.status === "open" && isOrganizer && (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setEditing(true)}
          >
            {t("projects.task.edit.button")}
          </button>
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
        {/* Recurring work: a completed task is otherwise a dead end —
            an organizer who runs the same thing next cycle had to
            retype it. One tap stages a fresh, open copy at the bottom
            of the list. Framed as "run it again", never as expiry
            (solidarity-not-shame). Gated to match addProjectTask's own
            guard so it never offers a guaranteed error. Dependencies
            are dropped — the original's upstream tasks are done, so
            copying their ids would gate on nothing while risking a
            dangling reference (the cloneProject precedent). */}
        {task.status === "completed" &&
          isOrganizer &&
          projectStatus !== "completed" &&
          projectStatus !== "archived" && (
            <>
              <button
                type="button"
                className="btn-secondary"
                disabled={pending}
                aria-busy={pending}
                onClick={async () => {
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
                }}
              >
                {pending
                  ? t("common.working")
                  : t("projects.task.addFreshCopy.button")}
              </button>
              <p className="basis-full text-xs text-moss-600 dark:text-moss-300">
                {t("projects.task.addFreshCopy.hint")}
              </p>
            </>
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
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
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
    <section>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
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

// Community stewardship offer — the AdoptionSection. Self-nomination
// only: the member offers to take on the primary role of a project whose
// organizer has gone quiet. The quiet-period gate is checked here
// (hidden entirely when unmet — never "this organizer is absent" shaming)
// and re-enforced in `fileAdoptionProposal`. All copy frames the project,
// never the person.
function AdoptionSection({
  project,
  currentKey,
  nodeId,
  onRun,
}: {
  project: Project;
  currentKey: string;
  nodeId: string;
  onRun: <T>(action: () => Promise<T>) => Promise<T | null>;
}) {
  const { t } = useTranslation();
  const { nodeConfig } = useApp();
  const { showToast } = useToast();
  const { pending, run: runWithPending } = usePendingAction();
  const [rationale, setRationale] = useState("");

  const lastActivity = useLiveQuery(
    () => lastOrganizerActivityAt(project.id, project.organizerKey),
    [project.id, project.organizerKey],
    undefined,
  );
  // Render nothing while the proxy loads or while the primary is still
  // within the quiet window — the offer surfaces only once the project
  // has genuinely gone quiet.
  if (lastActivity === undefined) return null;
  const quietCutoff =
    Date.now() - nodeConfig.adoptionQuietDays * 24 * 60 * 60 * 1000;
  const quietMet = lastActivity === null || lastActivity <= quietCutoff;
  if (!quietMet) return null;

  const noticeDays = Math.max(
    nodeConfig.proposalDeliberationDays,
    ADOPTION_MIN_DELIBERATION_DAYS,
  );

  return (
    <section className="card mb-4">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
        {t("adoption.section.title")}
      </h2>
      <p className="mb-3 text-xs text-moss-600 dark:text-moss-300">
        {t("adoption.section.intro")}
      </p>
      <label className="mb-2 block">
        <span className="mb-1 block text-sm font-medium">
          {t("adoption.section.rationaleLabel")}
        </span>
        <textarea
          className="input min-h-20"
          value={rationale}
          onChange={(e) => setRationale(e.target.value)}
          maxLength={1000}
          placeholder={t("adoption.section.rationalePlaceholder")}
        />
      </label>
      <p className="mb-3 text-xs text-moss-600 dark:text-moss-300">
        {t("adoption.section.notice", { days: noticeDays })}
      </p>
      <button
        type="button"
        className="btn-secondary"
        disabled={pending || !rationale.trim()}
        aria-busy={pending}
        onClick={() => {
          if (!rationale.trim()) return;
          void runWithPending(async () => {
            const result = await onRun(() =>
              fileAdoptionProposal({
                projectId: project.id,
                proposerKey: currentKey,
                rationale,
                nodeId,
              }),
            );
            if (result) {
              showToast(t("adoption.toast.filed"));
              setRationale("");
            }
          });
        }}
      >
        {t("adoption.section.submit")}
      </button>
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
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
        {t("projects.announcements.title")}
      </h2>
      {isOrg && (
        <form onSubmit={handleSubmit} className="card mb-3 flex flex-col gap-2">
          <textarea
            id={ANNOUNCEMENT_INPUT_ID}
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
              <p className="mb-1 text-xs text-moss-600 dark:text-moss-300">
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
    <section>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
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
      <p className="mb-3 text-xs text-moss-600 dark:text-moss-300">
        {t("projects.coOrganizers.invite.copy")}
      </p>

      {/* Pending invitations */}
      {pendingInvitations.length > 0 && (
        <div className="mb-3">
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
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
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
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
                <span className="text-moss-600 dark:text-moss-300">
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
        <summary className="cursor-pointer text-sm font-semibold uppercase tracking-wide text-moss-600 marker:hidden hover:underline">
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
        <p className="mt-3 text-xs text-moss-600 dark:text-moss-400">
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
    <section>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
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
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
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
        <div className="flex items-center justify-between text-xs text-moss-600 dark:text-moss-300">
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
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
        {t("projects.history.title")}
      </h2>
      <ul className="flex flex-col gap-2">
        {activities.map((a) => {
          const actorName =
            memberMap.get(a.actorKey) ?? t("common.memberFallback");
          // task_released_after_complete carries a `taskTitle` in
          // `data` (stamped in unclaimProjectTask) so the timeline can
          // render the full neutral sentence inline — no join, no
          // shame framing. Other activity types keep the existing
          // "<name> — <type>" pattern.
          if (a.type === "task_released_after_complete") {
            const taskTitle =
              (a.data as { taskTitle?: string }).taskTitle ?? "—";
            return (
              <li key={a.id} className="flex items-start gap-2 text-sm">
                <span className="shrink-0 text-xs text-moss-600 dark:text-moss-300">
                  {formatRelativeTime(a.createdAt)}
                </span>
                <span className="text-moss-700 dark:text-moss-200">
                  {t("projects.activityType.task_released_after_complete", {
                    name: actorName,
                    task: taskTitle,
                  })}
                </span>
              </li>
            );
          }
          return (
            <li key={a.id} className="flex items-start gap-2 text-sm">
              <span className="shrink-0 text-xs text-moss-600 dark:text-moss-300">
                {formatRelativeTime(a.createdAt)}
              </span>
              <span className="text-moss-700 dark:text-moss-200">
                <span className="font-medium">{actorName}</span>
                {" — "}
                {t(`projects.activityType.${a.type}` as "projects.activityType.project_created")}
                {a.type === "announcement" && (a.data as { body?: string }).body && (
                  <span className="ml-1 italic text-moss-600 dark:text-moss-300">
                    {`"${((a.data as { body?: string }).body ?? "").slice(0, 80)}${((a.data as { body?: string }).body ?? "").length > 80 ? "..." : ""}"`}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
