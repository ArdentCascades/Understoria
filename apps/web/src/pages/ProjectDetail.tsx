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
import { Trans, useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import { useToast } from "@/state/ToastContext";
import {
  addProjectTask,
  archiveProject,
  bulkAddTasks,
  cloneProject,
  completeProject,
  graduateProject,
  handoffOrganizer,
  launchProject,
  listActivityForProject,
  listAnnouncements,
  logActivity,
  pauseProject,
  postAnnouncement,
  removeCoOrganizer,
  resumeProject,
  retireCommons,
  returnToBuilding,
  unarchiveProject,
  unretireCommons,
} from "@/db/projects";
import {
  issueCoOrganizerInvitation,
  issueInvitationsForClone,
  revokeCoOrganizerInvitation,
} from "@/db/coorgInvitations";
import { getSecretKey, type LockState } from "@/db/secrets";
import { getSetting, SETTING_KEYS, setSetting } from "@/db/database";
import { shouldShowWorkDayHint } from "@/lib/workDayHint";
import { listLinksForProject } from "@/db/eventProjectLinks";
import { fileAdoptionProposal, lastOrganizerActivityAt } from "@/db/adoption";
import { ADOPTION_MIN_DELIBERATION_DAYS } from "@/lib/autoCloseProposals";
import { humanizeError } from "@/lib/humanizeError";
import { matchesQuery } from "@/lib/messageSearch";
import { matchesFilter, type TaskFilter } from "@/lib/taskFilter";
import { ALL_CATEGORIES, CATEGORY_META } from "@/lib/categories";
import {
  formatDeadline,
  formatHours,
  formatRelativeTime,
  shortKey,
} from "@/lib/format";
import { taskCheckInState } from "@/lib/taskCheckInState";
import { capitalize, suggestSplitting } from "@/lib/taskPresentation";
import { useProjectTaskContext } from "@/lib/useProjectTaskContext";
import { useFocusTrap } from "@/lib/a11y/useFocusTrap";
import { workingAlongsideKeys } from "@/lib/projectRoster";
import { computeProjectMomentum } from "@/lib/projectMomentum";
import { computeProjectClosure, type ProjectClosure } from "@/lib/projectClosure";
import { startOfTodayMs } from "@/lib/calendar";
import { shareUrl } from "@/lib/share";
import { ProjectSparkline } from "@/components/ProjectSparkline";
import { ProjectMomentumChip } from "@/components/ProjectMomentumChip";
import { Markdown } from "@/components/Markdown";
import { MarkdownHint } from "@/components/MarkdownHint";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { OverflowMenu, type OverflowMenuItem } from "@/components/OverflowMenu";
import { TemplatePlaybook } from "@/components/TemplatePlaybook";
import { ReorderTasksDialog } from "@/components/ReorderTasksDialog";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";
import { IconMessages, Sprig } from "@/components/visual";
import { usePendingAction } from "@/lib/usePendingAction";
import { TaskCard } from "@/components/TaskCard";
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
  // Project-scoped read model (project, sorted tasks, memberMap,
  // flaggedCommentIds, isOrg, nodeId/nodeConfig, autoConfirmHours) —
  // the same context the per-task page consumes, so the two surfaces
  // can never drift. No fetch; everything is derived from global state.
  const ctx = useProjectTaskContext(id);
  const { project, tasks: rawTasks, memberMap, isOrg, nodeId, nodeConfig } = ctx;
  // Care-rota ordering on a tended commons (docs/commons.md §5.3):
  // open recurring care work leads, other live work follows, the
  // completed build history sinks to the bottom. Everywhere else the
  // read model's own order is untouched.
  const tasks = useMemo(() => {
    if (project?.status !== "tended") return rawTasks;
    const rank = (t: (typeof rawTasks)[number]) =>
      t.status === "open" && t.recurringCadence
        ? 0
        : t.status !== "completed"
          ? 1
          : 2;
    return [...rawTasks].sort((a, b) => rank(a) - rank(b));
  }, [rawTasks, project?.status]);
  // Fields the context doesn't cover — read directly from AppContext.
  const {
    members,
    currentMember,
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
  // Lifted out of TaskList so the header overflow menu's "Reorder
  // tasks" item can drive the keyboard-friendly dialog. The inline
  // drag-and-drop and Move up/down buttons stay in TaskList; only the
  // dialog + its launcher moved up here.
  const [reorderDialogOpen, setReorderDialogOpen] = useState(false);
  // The Commons (docs/commons.md §4/§7): the two-option completion
  // choice, the retire-with-note dialog, and the return-to-building
  // confirm. Un-retire runs directly (reversible, low-stakes).
  const [completionChoiceOpen, setCompletionChoiceOpen] = useState(false);
  const [retireDialogOpen, setRetireDialogOpen] = useState(false);
  const [retireNote, setRetireNote] = useState("");
  const [returnConfirmOpen, setReturnConfirmOpen] = useState(false);
  // Which management dialog (former "Manage project" disclosure
  // section) is open. Each is a kebab-menu item now — the
  // Reorder-tasks precedent: menu item → focused dialog.
  const [manageDialog, setManageDialog] = useState<
    null | "pause" | "clone" | "coorg" | "handoff" | "stepdown"
  >(null);

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedQuery(query), 250);
    return () => window.clearTimeout(id);
  }, [query]);

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

  // Closure aggregates — distinct contributors and hours moved — read
  // from the signed exchange ledger (the immutable truth), not the
  // mutable task rows. Feeds the completion moment, the permanent
  // banner line, and the sidebar "Contributors" field, so the page can
  // never show two different counts. Aggregate-only by construction;
  // see lib/projectClosure.ts. Computed here (above the early return,
  // null-safe) because the completion-moment HOOK below consumes it and
  // must run on every render to keep the hook order stable.
  const closure = useMemo(
    () =>
      project
        ? computeProjectClosure({ project, exchanges })
        : { contributorCount: 0, hoursMoved: 0 },
    [project, exchanges],
  );
  const showCompletionMoment = useNewlyCompletedProjectMoment(
    project,
    closure.contributorCount,
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

  const isPrimaryOrganizer = currentMember?.publicKey === project.organizerKey;
  // The acting member's key for organizer actions — the ACTOR recorded
  // in logActivity and checked by requireOrganizer, so a co-organizer's
  // action is attributed to them (not silently to the primary, which
  // corrupted the project history and the adoption "organizer gone
  // quiet" signal). Empty-string placeholder for the null-member case
  // is never reached: every action affordance below is gated on `isOrg`
  // / `isPrimaryOrganizer`, both false when `currentMember` is null.
  const actorKey = currentMember?.publicKey ?? "";
  const showCoOrgManagement =
    isPrimaryOrganizer && project.status !== "completed" && project.status !== "archived";
  const showHandoff =
    isPrimaryOrganizer && project.coOrganizerKeys.length > 0 &&
    project.status !== "completed" && project.status !== "archived";
  const showStepDown = isOrg && !isPrimaryOrganizer;
  // Pause (active only) and Clone (active / paused / completed) live
  // inside the "Manage project" disclosure. Planning has its CTA in the
  // PlanningBanner; archived offers neither (Unarchive is in the kebab).
  const showLifecycleControls =
    isOrg &&
    (project.status === "active" ||
      project.status === "paused" ||
      project.status === "completed");
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

  // Copy-link handler. Shares the canonical project URL via the share
  // helper (native sheet → clipboard fallback). A cancelled share stays
  // quiet; a copy/share toasts the confirmation; a hard failure surfaces
  // the existing manual-copy guidance as an error. Mirrors
  // TaskDetailBody's handleCopyLink. Declared as a `const` arrow (not a
  // hoisted `function`) so it shares this block's non-null narrowing of
  // `project` — the early `!project` guard above already returned.
  const handleCopyProjectLink = async () => {
    const result = await shareUrl({
      url: `${window.location.origin}/project/${project.id}`,
      title: project.title,
    });
    if (result === "copied" || result === "shared") {
      showToast(t("common.linkCopied"));
    } else if (result === "failed") {
      showToast(t("common.copyFailed"), { tone: "error" });
    }
    // "cancelled" → stay silent.
  };

  // Header overflow-menu actions. Built conditionally so a viewer only
  // ever sees the actions they can take. Copy link is always available;
  // the simple one-click lifecycle verbs (Reorder / Mark complete /
  // Resume / Archive / Unarchive) reuse the EXACT gates their former
  // inline buttons used — Mark complete / Resume are organizer + status;
  // Archive / Unarchive require the PRIMARY organizer (not co-orgs). The
  // form-based actions (Pause+note, Clone, co-organizer management) stay
  // in their own cards.
  const projectMenuItems: OverflowMenuItem[] = [];
  projectMenuItems.push({
    key: "copy-link",
    label: t("common.copyLink"),
    onSelect: () => {
      void handleCopyProjectLink();
    },
  });
  if (isOrg && tasks.length >= 2 && currentMember) {
    projectMenuItems.push({
      key: "reorder",
      label: t("projects.task.reorderButton"),
      onSelect: () => setReorderDialogOpen(true),
    });
  }
  if (isOrg && project.status === "active") {
    projectMenuItems.push({
      key: "complete",
      label: t("projects.detail.markComplete"),
      // The graduation choice lives INSIDE the moment the app already
      // owns (docs/commons.md §4): Mark complete opens a two-option
      // dialog — Complete and close, or Move to the Commons.
      onSelect: () => setCompletionChoiceOpen(true),
    });
  }
  if (isOrg && project.status === "completed") {
    // The retrofit hatch: projects that finished before the Commons
    // existed can graduate late (docs/commons.md §4).
    projectMenuItems.push({
      key: "graduate",
      label: t("projects.commons.moveToCommons"),
      onSelect: () => {
        void run(() => graduateProject(project.id, actorKey));
      },
    });
  }
  if (isOrg && project.status === "tended") {
    projectMenuItems.push({
      key: "retire",
      label: t("projects.commons.retire"),
      onSelect: () => setRetireDialogOpen(true),
    });
    projectMenuItems.push({
      key: "return-to-building",
      label: t("projects.commons.returnToBuilding"),
      onSelect: () => setReturnConfirmOpen(true),
    });
  }
  if (isOrg && project.status === "retired") {
    projectMenuItems.push({
      key: "unretire",
      label: t("projects.commons.unretire"),
      onSelect: () => {
        void run(() => unretireCommons(project.id, actorKey));
      },
    });
  }
  if (isOrg && project.status === "paused") {
    projectMenuItems.push({
      key: "resume",
      label: t("projects.detail.resume"),
      onSelect: () => {
        void run(() => resumeProject(project.id, actorKey));
      },
    });
  }
  if (isPrimaryOrganizer && project.status === "completed") {
    projectMenuItems.push({
      key: "archive",
      label: t("projects.archive.button"),
      onSelect: () => {
        void run(() => archiveProject(project.id, actorKey));
      },
    });
  }
  if (isPrimaryOrganizer && project.status === "archived") {
    projectMenuItems.push({
      key: "unarchive",
      label: t("projects.archive.unarchive"),
      onSelect: () => {
        void run(() => unarchiveProject(project.id, actorKey));
      },
    });
  }
  // The form-based management flows (formerly the "Manage project"
  // disclosure). Same gates their sections used; each item opens a
  // focused dialog hosting the existing section component unchanged.
  if (isOrg && project.status === "active") {
    projectMenuItems.push({
      key: "pause",
      label: t("projects.manage.pauseItem"),
      onSelect: () => setManageDialog("pause"),
    });
  }
  if (showLifecycleControls) {
    projectMenuItems.push({
      key: "clone",
      label: t("projects.manage.cloneItem"),
      onSelect: () => setManageDialog("clone"),
    });
  }
  if (showCoOrgManagement) {
    projectMenuItems.push({
      key: "coorg",
      label: t("projects.manage.coorgItem"),
      onSelect: () => setManageDialog("coorg"),
    });
  }
  if (showHandoff) {
    projectMenuItems.push({
      key: "handoff",
      label: t("projects.manage.handoffItem"),
      onSelect: () => setManageDialog("handoff"),
    });
  }
  if (showStepDown) {
    projectMenuItems.push({
      key: "stepdown",
      label: t("projects.manage.stepDownItem"),
      onSelect: () => setManageDialog("stepdown"),
    });
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
        <PlanningBanner
          project={project}
          isOrganizer={isOrg}
          actorKey={actorKey}
          onRun={run}
        />
      )}

      {/* Phase 2.2: 2-pane layout at lg+ — meta (overview card +
          roster + next-work-day glance) docks in a 320px right
          sidebar that sticks to the viewport; the main reading
          column hosts the high-volume scrollable sections
          (error → tasks → add-task forms → work days →
          announcements → history → governance).
          Below lg the `lg:*` classes are inert and the grid collapses
          to single-column DOM order. To keep tasks within one swipe
          on a phone, the rail is split into two mobile groups:
          RailPrimary (title, chips + kebab, description, message
          button, progress bar, state banners) stays at the top —
          it's the visible part of the `aside` below — while
          RailSecondary (sparkline, created/area/deadline/contributors
          grid, Working-alongside roster) is `hidden lg:block` here
          and re-renders `lg:hidden` AFTER the main column's content.
          Two render sites, never CSS `order`, so mobile DOM order
          matches mobile visual order (WCAG 2.4.3 — same pattern as
          Board.tsx's filter rails, see Board.readingOrder.test.tsx).

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
            {/* Status/category chips on the left; the project overflow
                (kebab) menu pinned top-right so it never disturbs the
                chips' wrapping. The menu absorbs the simple one-click
                organizer verbs (Mark complete / Resume / Archive /
                Unarchive / Reorder tasks) plus Copy link for any
                viewer. */}
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`chip ${
                    // "Tended commons" wears the living canopy family,
                    // never completed-gray (docs/commons.md §5.3).
                    project.status === "tended"
                      ? "bg-canopy-100 text-canopy-900 dark:bg-canopy-900/60 dark:text-canopy-100"
                      : "bg-moss-100 text-moss-700 dark:bg-moss-800 dark:text-moss-200"
                  }`}
                >
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
              <OverflowMenu
                label={t("projects.detail.menuLabel")}
                items={projectMenuItems}
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
              <Markdown
                collapsible
                text={project.description}
                className="mt-2 text-sm text-moss-700 dark:text-moss-200"
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
            {/* No progress bar on a commons: a progress bar says
                "this ends," and a tended thing doesn't (docs/commons.md
                §8.2). The provenance line below carries the biography
                instead. */}
            {project.status !== "tended" && project.status !== "retired" && (
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
              </div>
            )}
            {/* The commons biography — aggregate-only provenance as a
                quiet permanent subtitle (docs/commons.md §5.3), and
                the retired story with its why-it-ended note (§7). */}
            {project.status === "tended" && project.completedAt && (
              <p className="mt-3 text-sm text-canopy-800 dark:text-canopy-200">
                {closure.contributorCount > 0
                  ? t("projects.commons.provenance", {
                      count: closure.contributorCount,
                      hours: formatHours(closure.hoursMoved),
                      when: formatRelativeTime(project.completedAt),
                    })
                  : t("projects.commons.provenanceNoCrew", {
                      when: formatRelativeTime(project.completedAt),
                    })}
              </p>
            )}
            {project.status === "retired" && project.retiredAt && (
              <div className="mt-3 rounded-xl bg-moss-50 p-3 text-sm text-moss-800 dark:bg-moss-900/40 dark:text-moss-100">
                <p>
                  {t("projects.commons.retiredStory", {
                    when: formatRelativeTime(project.retiredAt),
                  })}
                </p>
                {project.retireNote && (
                  <p className="mt-1 italic">“{project.retireNote}”</p>
                )}
                {closure.contributorCount > 0 && (
                  <p className="mt-1">
                    {t("projects.completionMoment.summary", {
                      count: closure.contributorCount,
                      hours: formatHours(closure.hoursMoved),
                    })}
                  </p>
                )}
              </div>
            )}
            {/* Desktop copy of the secondary meta (sparkline + created/
                area/deadline/contributors grid). On mobile this copy is
                hidden and the SAME block re-renders after the main
                column (see the `lg:hidden` copy below the main column),
                so a phone visitor reaches the task list without
                scrolling past stats. Two render sites — NOT CSS
                `order` — so mobile DOM order matches visual order
                (WCAG 2.4.3; see Board.tsx's filter-rail precedent). */}
            <div className="hidden lg:block">
              <ProjectStatsBlock
                momentum={momentum}
                project={project}
                closure={closure}
              />
            </div>
            {showCompletionMoment && (
              <CompletionMoment
                closure={closure}
                isOrg={isOrg}
                graduated={project.status === "tended"}
              />
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

          {/* Desktop copy — on mobile the roster re-renders below the
              main column together with the stats block. */}
          <div className="hidden lg:block">
            <WorkingAlongsideCard people={workingAlongside} />
          </div>

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

          {/* The template "playbook" — how this kind of project actually
              works — re-derived from the stored templateId (dropped at
              instantiation otherwise). Reads as reference; absent for
              from-scratch projects or unknown templates. */}
          <div className="mb-4">
            <TemplatePlaybook templateId={project.templateId} variant="full" />
          </div>

          {/* Tasks are the first main-column content after the error /
              adoption banners — the work itself outranks its context
              (announcements and work days follow the list + forms). */}
          <section className="mb-4">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
              {t(
                project.status === "tended"
                  ? "projects.commons.careRota"
                  : "projects.detail.tasks",
              )}
            </h2>
            {tasks.length === 0 ? (
              <div className="card">
                <EmptyState
                  illustration="raising"
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
                  nodeConfig={nodeConfig}
                  onRun={run}
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
                    nodeConfig={nodeConfig}
                    onRun={run}
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

          {/* Reorder dialog rendered once at the page level (its launcher
              is the header overflow menu's "Reorder tasks" item). Lifted
              out of TaskList so the single dialog serves both mutually
              exclusive TaskList render sites. A clean close — no
              focus-return-to-trigger — since the trigger is now a menu
              item the OverflowMenu has already torn down. */}
          {currentMember && (
            <ReorderTasksDialog
              open={reorderDialogOpen}
              tasks={tasks}
              projectId={project.id}
              organizerKey={currentMember.publicKey}
              onClose={() => setReorderDialogOpen(false)}
            />
          )}

          {/* The graduation choice (docs/commons.md §4): Mark complete
              becomes a two-option moment. The Commons option leads
              when recurring tasks exist — the built thing clearly has
              a care loop waiting. */}
          <CompletionChoiceDialog
            open={completionChoiceOpen}
            commonsFirst={tasks.some((tk) => !!tk.recurringCadence)}
            onClose={() => setCompletionChoiceOpen(false)}
            onComplete={() => {
              setCompletionChoiceOpen(false);
              void run(() => completeProject(project.id, actorKey));
            }}
            onGraduate={() => {
              setCompletionChoiceOpen(false);
              void run(() => graduateProject(project.id, actorKey));
            }}
          />

          {/* Retire: the pause-note pattern — one required sentence of
              why it ended, kept forever with the archive record
              (docs/commons.md §7). */}
          <ConfirmDialog
            open={retireDialogOpen}
            title={t("projects.commons.retireTitle")}
            tone="caution"
            description={
              <div>
                <p className="mb-2 text-sm">
                  {t("projects.commons.retireBody")}
                </p>
                <textarea
                  className="input min-h-16 w-full"
                  value={retireNote}
                  maxLength={300}
                  onChange={(e) => setRetireNote(e.target.value)}
                  placeholder={t("projects.commons.retirePlaceholder")}
                  aria-label={t("projects.commons.retireNoteLabel")}
                />
              </div>
            }
            confirmLabel={t("projects.commons.retireConfirm")}
            cancelLabel={t("common.cancel")}
            onConfirm={() => {
              if (!retireNote.trim()) return;
              setRetireDialogOpen(false);
              void run(() => retireCommons(project.id, actorKey, retireNote));
            }}
            onCancel={() => setRetireDialogOpen(false)}
          />

          <ConfirmDialog
            open={returnConfirmOpen}
            title={t("projects.commons.returnTitle")}
            description={t("projects.commons.returnBody")}
            confirmLabel={t("projects.commons.returnConfirm")}
            cancelLabel={t("common.cancel")}
            onConfirm={() => {
              setReturnConfirmOpen(false);
              void run(() => returnToBuilding(project.id, actorKey));
            }}
            onCancel={() => setReturnConfirmOpen(false)}
          />

          {isOrg &&
            project.status !== "completed" &&
            project.status !== "archived" &&
            project.status !== "retired" && (
              <AddTaskForm
                project={project}
                actorKey={actorKey}
                onRun={run}
              />
            )}

          {isOrg &&
            project.status !== "completed" &&
            project.status !== "archived" && (
              <BulkTaskForm
                project={project}
                nodeId={nodeId}
                actorKey={actorKey}
                onRun={run}
              />
            )}

          <WorkDaysSection project={project} isOrg={isOrg} />

          <AnnouncementSection
            project={project}
            isOrg={isOrg}
            memberMap={memberMap}
            nodeId={nodeId}
            currentKey={currentMember?.publicKey}
            blockedKeys={blockedKeys}
          />

          {(project.status === "archived" || project.status === "completed") && (
            <HistoryTimeline
              projectId={project.id}
              memberMap={memberMap}
              blockedKeys={blockedKeys}
            />
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

          {isOrg && !isPrimaryOrganizer && <CoOrganizerCapabilityCard />}

          {/* The former "Manage project" disclosure is gone: its
              form-based flows (pause/clone, co-organizer management,
              handoff, step-down) are kebab-menu items now, each
              opening one of these focused dialogs — the same pattern
              as Reorder tasks. The section components are unchanged;
              only the frame moved. A dialog whose gate flips mid-use
              (pause succeeds → status is no longer active) unmounts
              itself, exactly like the old inline forms disappeared. */}
          {manageDialog === "pause" && isOrg && project.status === "active" && (
            <ManageDialog
              title={t("projects.manage.pauseItem")}
              onClose={() => setManageDialog(null)}
            >
              <OrganizerControls
                project={project}
                actorKey={actorKey}
                onRun={run}
                form="pause"
              />
            </ManageDialog>
          )}
          {manageDialog === "clone" && showLifecycleControls && (
            <ManageDialog
              title={t("projects.manage.cloneItem")}
              onClose={() => setManageDialog(null)}
            >
              <OrganizerControls
                project={project}
                actorKey={actorKey}
                onRun={run}
                form="clone"
              />
            </ManageDialog>
          )}
          {manageDialog === "coorg" && showCoOrgManagement && (
            <ManageDialog
              ariaLabel={t("projects.coOrganizers.title")}
              onClose={() => setManageDialog(null)}
            >
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
            </ManageDialog>
          )}
          {manageDialog === "handoff" && showHandoff && (
            <ManageDialog
              ariaLabel={t("projects.handoff.title")}
              onClose={() => setManageDialog(null)}
            >
              <HandoffSection
                project={project}
                currentKey={currentMember!.publicKey}
                memberMap={memberMap}
                onRun={run}
              />
            </ManageDialog>
          )}
          {manageDialog === "stepdown" && showStepDown && (
            <ManageDialog
              ariaLabel={t("projects.manage.stepDownItem")}
              onClose={() => setManageDialog(null)}
            >
              <CoOrganizerStepDownSection
                project={project}
                currentKey={currentMember!.publicKey}
                onRun={run}
              />
            </ManageDialog>
          )}

          {/* Mobile copy of the rail's secondary meta (RailSecondary):
              sparkline + created/area/deadline/contributors grid +
              Working-alongside roster. Deferred to AFTER the main
              column's content so a phone visitor reaches tasks first;
              the desktop copies above are `hidden lg:block`. Rendered
              in DOM exactly where it appears visually — no CSS `order`
              (WCAG 2.4.3). */}
          <div className="lg:hidden">
            <div className="card mb-4">
              <ProjectStatsBlock
                momentum={momentum}
                project={project}
                closure={closure}
              />
            </div>
            <WorkingAlongsideCard
              people={workingAlongside}
              headingId="working-alongside-title-mobile"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Stable id on the announcement textarea so the completion moment's
// organizer nudge can scroll to and focus it across the sidebar/main
// column split (they live in different subtrees, so a ref would have to
// be threaded through the whole page). The textarea sits inside a
// collapsed <details>; the nudge opens the disclosure before focusing.
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

  // One quiet, dismissible bridge from rota-shaped templates to the
  // work-day + shifts machinery (lib/workDayHint.ts). Dismissal is a
  // per-project settings entry, written on the member's tap — never
  // auto-marked on render, so a glance at the page doesn't count as
  // having read it.
  const [hintDismissed, setHintDismissed] = useState<boolean | null>(null);
  useEffect(() => {
    let cancelled = false;
    void getSetting(SETTING_KEYS.workDayHintDismissed).then((stored) => {
      if (cancelled) return;
      const ids = stored ? (JSON.parse(stored) as string[]) : [];
      setHintDismissed(ids.includes(project.id));
    });
    return () => {
      cancelled = true;
    };
  }, [project.id]);

  async function dismissWorkDayHint() {
    setHintDismissed(true);
    const stored = await getSetting(SETTING_KEYS.workDayHintDismissed);
    const ids = new Set<string>(stored ? (JSON.parse(stored) as string[]) : []);
    ids.add(project.id);
    await setSetting(
      SETTING_KEYS.workDayHintDismissed,
      JSON.stringify(Array.from(ids)),
    );
  }

  const showHint = shouldShowWorkDayHint({
    templateId: project.templateId,
    upcomingWorkDays: upcoming.length,
    canSchedule,
    dismissed: hintDismissed !== false,
  });

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
      {showHint && (
        <div className="mb-2 flex flex-wrap items-center gap-2 rounded-lg border border-canopy-200 bg-canopy-50 px-3 py-2 text-sm text-canopy-900 dark:border-canopy-900/50 dark:bg-canopy-950/30 dark:text-canopy-100">
          <p className="min-w-0 flex-1">
            {t("projects.workDays.templateHint")}
          </p>
          <button
            type="button"
            className="btn-ghost shrink-0 text-xs"
            onClick={() => void dismissWorkDayHint()}
          >
            {t("projects.workDays.templateHintDismiss")}
          </button>
        </div>
      )}
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
      <p className="mt-2 text-xs text-moss-600 dark:text-moss-300">
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
// Accepts a nullable project so the CALL SITE can place it above the
// page's `if (!project)` early return — a hook after that return would
// change the hook count on the cold-load null→hydrated transition and
// crash the app. Null / not-yet-completed simply yields false.
function useNewlyCompletedProjectMoment(
  project: Project | null,
  contributorCount: number,
): boolean {
  const [show, setShow] = useState(false);
  const projectId = project?.id ?? null;
  const projectStatus = project?.status ?? null;
  useEffect(() => {
    // `tended` gets its own moment: graduation is a completion too
    // (docs/commons.md §4). The celebrated set keys on id + FLAVOR
    // (bare id for completed — the legacy entries — and `<id>:tended`
    // for graduation), so a project that completed months ago and
    // graduates late via the retrofit kebab item still gets its one
    // graduation moment.
    if (
      projectId === null ||
      (projectStatus !== "completed" && projectStatus !== "tended") ||
      contributorCount <= 0
    ) {
      setShow(false);
      return;
    }
    const celebratedKey =
      projectStatus === "tended" ? `${projectId}:tended` : projectId;
    let cancelled = false;
    void (async () => {
      const stored = await getSetting(
        SETTING_KEYS.celebratedProjectCompletions,
      );
      if (cancelled) return;
      const celebrated = new Set<string>(
        stored ? (JSON.parse(stored) as string[]) : [],
      );
      if (celebrated.has(celebratedKey)) {
        setShow(false);
        return;
      }
      setShow(true);
      celebrated.add(celebratedKey);
      await setSetting(
        SETTING_KEYS.celebratedProjectCompletions,
        JSON.stringify(Array.from(celebrated)),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId, projectStatus, contributorCount]);
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
  graduated = false,
}: {
  closure: ProjectClosure;
  isOrg: boolean;
  /** True when the project graduated to the Commons instead of
   *  closing — same celebration, and the organizer nudge re-aims
   *  from GRATITUDE to ORIENTATION: this is the moment the community
   *  learns the thing exists and how to use it (docs/commons.md §4). */
  graduated?: boolean;
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
            {t(
              graduated
                ? "projects.commons.momentTitle"
                : "projects.completionMoment.title",
            )}
          </div>
          <div className="text-base">
            {t("projects.completionMoment.summary", {
              count: closure.contributorCount,
              hours: formatHours(closure.hoursMoved),
            })}
            {graduated && (
              <span className="block">
                {t("projects.commons.momentTended")}
              </span>
            )}
          </div>
        </div>
      </div>
      {isOrg && (
        <div className="mt-3 border-t border-canopy-200/70 pt-3 dark:border-canopy-800/60">
          <p className="text-sm">
            {t(
              graduated
                ? "projects.commons.orientHint"
                : "projects.completionMoment.thanksHint",
            )}
          </p>
          <button
            type="button"
            className="btn-secondary mt-2"
            onClick={() => {
              const el = document.getElementById(ANNOUNCEMENT_INPUT_ID);
              if (!el) return;
              // The compose form lives behind a <details> disclosure —
              // open it (a no-op when already open) before scrolling so
              // the textarea is visible and focusable.
              const disclosure = el.closest("details");
              if (disclosure) disclosure.open = true;
              el.scrollIntoView({ behavior: "smooth", block: "center" });
              (el as HTMLTextAreaElement).focus({ preventScroll: true });
            }}
          >
            {t(
              graduated
                ? "projects.commons.orientCta"
                : "projects.completionMoment.thanksCta",
            )}
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
  actorKey,
  onRun,
}: {
  actorKey: string;
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
                launchProject(project.id, actorKey),
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

// Secondary project meta — the momentum sparkline plus the created /
// area / deadline / contributors grid. One component, two render sites:
// inside the overview card at lg+ (`hidden lg:block`) and in a
// standalone card after the main column below lg (`lg:hidden`), so the
// two copies can never drift. Stateless by design — duplication is safe.
function ProjectStatsBlock({
  momentum,
  project,
  closure,
}: {
  momentum: ReturnType<typeof computeProjectMomentum>;
  project: Project;
  closure: ProjectClosure;
}) {
  const { t } = useTranslation();
  return (
    <>
      <div className="mt-3 text-canopy-700 dark:text-canopy-300">
        <ProjectSparkline daily={momentum.daily} />
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
    </>
  );
}

// Names-only roster of members with hands on a task here. No hours, no
// per-member counts, no ranking (no-leaderboards). Hidden entirely when
// empty — an absent roster never reads as "nobody helped"
// (solidarity-not-shame). The inclusion + suppression logic lives in
// `lib/projectRoster.ts`; this just renders the resolved, sorted list.
function WorkingAlongsideCard({
  people,
  headingId = "working-alongside-title",
}: {
  people: { key: string; name: string }[];
  /** Heading element id — the mobile copy passes a distinct id so the
   *  two render sites never produce duplicate ids in the document. */
  headingId?: string;
}) {
  const { t } = useTranslation();
  if (people.length === 0) return null;
  return (
    <section className="card mb-4" aria-labelledby={headingId}>
      <h2
        id={headingId}
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

// Pause (with its optional note) and Clone (with its title + re-invite
// checklist). Mounted as the first section inside the "Manage project"
// disclosure — these are low-frequency lifecycle verbs, so they live
// behind the same summary as co-organizer management / handoff /
// step-down rather than in an always-visible card. The one-click verbs
// (Mark complete / Resume / Archive / Unarchive) live in the header
// overflow menu.
// Modal frame for the management flows launched from the header
// kebab (pause / clone / co-organizers / handoff / step-down) — the
// ReorderTasksDialog shell: backdrop click, Escape, focus trap,
// scrollable card. Sections with their own headings pass `ariaLabel`;
// the two bare forms (pause, clone) get a visible `title`.
function ManageDialog({
  title,
  ariaLabel,
  onClose,
  children,
}: {
  title?: string;
  ariaLabel?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  useFocusTrap(cardRef, true);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    // Backdrop click closes — mouse-only path; the keyboard
    // dismissal is Esc (wired above). Same suppression rationale as
    // ReorderTasksDialog's backdrop.
    /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel ?? title}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-moss-950/40 p-4 sm:items-center"
    >
      <div
        ref={cardRef}
        className="card flex max-h-[85vh] w-full max-w-md flex-col gap-3 overflow-y-auto animate-fade-in"
      >
        {title && <h2 className="text-lg font-semibold">{title}</h2>}
        {children}
      </div>
    </div>
  );
}

// The graduation choice (docs/commons.md §4): Mark complete opens a
// two-option moment instead of firing directly. The Commons option
// leads when the project has recurring tasks (the built thing clearly
// has a care loop waiting); otherwise Complete-and-close leads.
// Graduation must never feel like a form — two labeled choices and a
// cancel, nothing else.
function CompletionChoiceDialog({
  open,
  commonsFirst,
  onClose,
  onComplete,
  onGraduate,
}: {
  open: boolean;
  commonsFirst: boolean;
  onClose: () => void;
  onComplete: () => void;
  onGraduate: () => void;
}) {
  const { t } = useTranslation();
  if (!open) return null;
  const options = [
    {
      key: "graduate",
      title: t("projects.commons.choiceCommons"),
      desc: t("projects.commons.choiceCommonsDesc"),
      onSelect: onGraduate,
    },
    {
      key: "complete",
      title: t("projects.commons.choiceComplete"),
      desc: t("projects.commons.choiceCompleteDesc"),
      onSelect: onComplete,
    },
  ];
  const ordered = commonsFirst ? options : [...options].reverse();
  return (
    <ManageDialog title={t("projects.commons.choiceTitle")} onClose={onClose}>
      <p className="text-sm text-moss-600 dark:text-moss-300">
        {t("projects.commons.choiceBody")}
      </p>
      {ordered.map((o) => (
        <button
          key={o.key}
          type="button"
          onClick={o.onSelect}
          className="rounded-xl border border-moss-200 p-3 text-left transition-colors hover:border-canopy-500 hover:bg-canopy-50 dark:border-moss-700 dark:hover:bg-canopy-950/40"
        >
          <span className="block text-sm font-semibold">{o.title}</span>
          <span className="mt-0.5 block text-sm text-moss-600 dark:text-moss-300">
            {o.desc}
          </span>
        </button>
      ))}
      <button
        type="button"
        className="btn-secondary self-end"
        onClick={onClose}
      >
        {t("common.cancel")}
      </button>
    </ManageDialog>
  );
}

function OrganizerControls({
  project,
  actorKey,
  onRun,
  form,
}: {
  project: Project;
  actorKey: string;
  onRun: <T>(action: () => Promise<T>) => Promise<T | null>;
  /** Which form this instance IS. The former toggle buttons became
   *  kebab-menu items ("Pause project" / "Clone project"), each
   *  opening a dialog that mounts this component with the matching
   *  form already open — the Reorder-tasks precedent. */
  form: "pause" | "clone";
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentMember, nodeId, lockState, members } = useApp();
  const { showToast } = useToast();
  const [pauseNote, setPauseNote] = useState("");
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
  const [checkedKeys, setCheckedKeys] = useState<Set<string>>(
    () => (form === "clone" ? new Set(cloneCandidates) : new Set()),
  );

  // Draft / planning projects render their organizer CTA through the
  // PlanningBanner above (see `planningBanner.title` / `.bodyOrganizer`
  // / "Launch project" button). This section has no additional actions
  // to offer until the project is active, so we skip rendering it.
  // Archived projects' only former action here — Unarchive — moved to
  // the header overflow menu, and Clone isn't offered for archived (the
  // gate below). With nothing left to render, skip entirely. The
  // `showLifecycleControls` mount gate mirrors this; the guard stays as
  // belt-and-braces.
  if (project.status === "planning" || project.status === "archived")
    return null;

  return (
    <section className="flex flex-col gap-3">
      {form === "pause" && project.status === "active" && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const ok = await dispatch(() =>
              pauseProject(project.id, actorKey, pauseNote),
            );
            if (ok) {
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
      {form === "clone" && currentMember && (
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
    </section>
  );
}

// --- Task list ------------------------------------------------------------
//
// The project task list. A plain read/act surface: click a task to
// open it, claim/confirm inline. Reordering is NOT here — it lives
// in the focused "Reorder tasks" dialog (header kebab), so the list
// carries no drag handles and no per-row Move buttons. That removes
// the accidental-drag trap (the title used to be a drag handle) and
// the clutter of two arrow buttons on every row for a rare organizer
// action. The dialog is the single reorder surface; see
// docs/task-ordering-and-dependencies.md §3.2.
function TaskList({
  tasks,
  visibleTasks,
  isOrg,
  project,
  currentKey,
  nodeConfig,
  onRun,
  searchQuery,
  highlightTaskId,
}: {
  tasks: readonly ProjectTask[];
  visibleTasks: readonly ProjectTask[];
  isOrg: boolean;
  project: Project;
  currentKey: string | undefined;
  nodeConfig: Parameters<typeof taskCheckInState>[1];
  onRun: <T>(action: () => Promise<T>) => Promise<T | null>;
  searchQuery?: string;
  /** Task whose row should carry the transient deep-link highlight,
   *  or null. The `id="task-<id>"` anchor lives on every row already
   *  (used by the card's FollowsBadge in-page jump); this only adds
   *  the ring. */
  highlightTaskId?: string | null;
}) {
  return (
    <ul className="flex flex-col gap-2">
      {visibleTasks.map((task) => (
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
          <TaskCard
            task={task}
            isOrganizer={isOrg}
            acceptingClaims={project.status === "active"}
            projectStatus={project.status}
            currentKey={currentKey}
            onRun={onRun}
            needsMoreHands={
              taskCheckInState(task, nodeConfig, tasks) === "needs_more_hands"
            }
            allTasks={tasks}
            searchQuery={searchQuery}
            taskCheckInDays={nodeConfig.taskCheckInDays}
            templateId={project.templateId}
          />
        </li>
      ))}
    </ul>
  );
}

function AddTaskForm({
  project,
  actorKey,
  onRun,
}: {
  project: Project;
  actorKey: string;
  onRun: <T>(action: () => Promise<T>) => Promise<T | null>;
}) {
  const { t } = useTranslation();
  // Collapsed by default behind a "+ Add task" disclosure — the 6-field
  // form only earns its vertical space when the organizer is actually
  // adding a task. Same disclosure pattern as its sibling BulkTaskForm.
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [hours, setHours] = useState("1");
  const [urgency, setUrgency] = useState<Urgency>("low");
  const [category, setCategory] = useState<ProjectCategory>(project.category);
  const [skills, setSkills] = useState("");
  const [cadence, setCadence] = useState<
    NonNullable<ProjectTask["recurringCadence"]> | ""
  >("");
  const [submitting, setSubmitting] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  // Expanding is an explicit "I'm adding a task now" — drop focus into
  // the first field so typing can start immediately.
  useEffect(() => {
    if (open) titleInputRef.current?.focus();
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const h = Number.parseFloat(hours);
    if (!Number.isFinite(h) || h <= 0) return;
    setSubmitting(true);
    const ok = await onRun(() =>
      addProjectTask(project.id, actorKey, {
        title,
        description,
        category,
        estimatedHours: h,
        urgency,
        requiredSkills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        dependencies: [],
        recurringCadence: cadence === "" ? null : cadence,
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
      setCadence("");
      // Collapse after a successful add — the new task appearing in the
      // list above is the success feedback; the form has done its job.
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
          {t("projects.task.addTaskButton")}
        </button>
      </div>
    );
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
            ref={titleInputRef}
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
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              required
            />
            {/* Authoring-time guidance, never a gate: big tasks are
                harder to start and slower to get claimed. */}
            {suggestSplitting(hours) && (
              <span className="text-xs text-moss-600 dark:text-moss-300">
                {t("projects.task.addTask.splitHint")}
              </span>
            )}
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
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">
            {t("projects.task.addTask.fieldCadence")}
          </span>
          <select
            className="input"
            value={cadence}
            onChange={(e) =>
              setCadence(
                e.target.value as
                  | NonNullable<ProjectTask["recurringCadence"]>
                  | "",
              )
            }
          >
            <option value="">
              {t("projects.task.addTask.cadenceNone")}
            </option>
            <option value="session">
              {t("projects.task.addTask.cadenceSession")}
            </option>
            <option value="month">
              {t("projects.task.addTask.cadenceMonth")}
            </option>
            <option value="event">
              {t("projects.task.addTask.cadenceEvent")}
            </option>
            <option value="cycle">
              {t("projects.task.addTask.cadenceCycle")}
            </option>
          </select>
          <span className="text-xs text-moss-600 dark:text-moss-300">
            {t("projects.task.addTask.cadenceHint")}
          </span>
        </label>
        <div className="flex gap-2 self-end">
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setOpen(false)}
          >
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={submitting}
          >
            {submitting
              ? t("projects.task.addTask.submitting")
              : t("projects.task.addTask.submit")}
          </button>
        </div>
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
  blockedKeys,
}: {
  project: Project;
  isOrg: boolean;
  memberMap: Map<string, string>;
  nodeId: string;
  currentKey: string | undefined;
  blockedKeys: ReadonlySet<string>;
}) {
  const { t } = useTranslation();
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showAll, setShowAll] = useState(false);
  // The compose form is collapsed behind a native <details> disclosure
  // (organizer-only; the announcement CARDS below stay visible — they
  // are community content, only the form folds away). A native details
  // rather than conditional rendering keeps the textarea in the DOM, so
  // CompletionMoment's cross-subtree "say thanks" CTA can still find it
  // by id, open the disclosure, and focus it.
  const composeRef = useRef<HTMLDetailsElement>(null);
  const bodyInputRef = useRef<HTMLTextAreaElement>(null);
  const allAnnouncements = useLiveQuery(
    () => listAnnouncements(project.id),
    [project.id],
    [],
  );
  // Hide announcements authored by a blocked member (Round-4 review) —
  // the same one-way hide docs/blocking.md §6 applies to task comments.
  const announcements = useMemo(
    () => allAnnouncements.filter((a) => !blockedKeys.has(a.actorKey)),
    [allAnnouncements, blockedKeys],
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
        // Collapse after a successful post — the new announcement card
        // rendering below is the success feedback.
        if (composeRef.current) composeRef.current.open = false;
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
        <details
          ref={composeRef}
          className="card mb-3"
          onToggle={(e) => {
            // Opening is an explicit "I'm writing now" — drop focus into
            // the textarea so typing can start immediately.
            if (e.currentTarget.open) bodyInputRef.current?.focus();
          }}
        >
          <summary className="cursor-pointer text-sm font-medium text-canopy-700 marker:hidden hover:underline dark:text-canopy-300">
            {t("projects.announcements.composeButton")}
          </summary>
          <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2">
            <textarea
              ref={bodyInputRef}
              id={ANNOUNCEMENT_INPUT_ID}
              className="input min-h-20"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={2000}
              // Placeholder, never prefill (docs/commons.md §4): the
              // graduation announcement must arrive in the organizer's
              // own voice; the tended placeholder just suggests what
              // to cover.
              placeholder={t(
                project.status === "tended"
                  ? "projects.commons.announcePlaceholder"
                  : "projects.announcements.placeholder",
              )}
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
        </details>
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
        <p className="mt-3 text-xs text-moss-600 dark:text-moss-300">
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
  actorKey,
  onRun,
}: {
  project: Project;
  nodeId: string;
  actorKey: string;
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
        actorKey,
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

// Inline text-link affordance for timeline rows — the house small-link
// treatment (see useInstallCardNudge's "More help"), without the 44px
// touch-target class because these sit inside dense list rows where a
// 44px box would break the timeline's line rhythm; the global
// :focus-visible outline still draws around the link.
const HISTORY_LINK_CLASS =
  "font-medium text-canopy-700 underline underline-offset-2 " +
  "hover:text-canopy-800 dark:text-canopy-300 dark:hover:text-canopy-200";

/** The task id an activity row was stamped with at write time, or null.
 *  Every task_* logActivity call site stamps `data.taskId` today, but
 *  rows written before that convention may not carry one — those rows
 *  stay plain text. Never title-match a row to a task; a missing id
 *  means no link. */
function activityTaskId(data: Record<string, unknown>): string | null {
  const taskId = (data as { taskId?: unknown }).taskId;
  return typeof taskId === "string" && taskId.length > 0 ? taskId : null;
}

export function HistoryTimeline({
  projectId,
  memberMap,
  blockedKeys,
}: {
  projectId: string;
  memberMap: Map<string, string>;
  blockedKeys: ReadonlySet<string>;
}) {
  const { t } = useTranslation();
  const allActivities = useLiveQuery(
    () => listActivityForProject(projectId),
    [projectId],
    [],
  );
  // Hide activity rows authored by a blocked member (Round-4 review).
  const activities = useMemo(
    () => allActivities.filter((a) => !blockedKeys.has(a.actorKey)),
    [allActivities, blockedKeys],
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
          // Absolute path on purpose: HistoryTimeline also mounts on
          // the task page (`/project/:id/task/:taskId`, see
          // TaskDetail), where a relative link would resolve against
          // the wrong base.
          const taskId = a.type.startsWith("task_")
            ? activityTaskId(a.data)
            : null;
          const taskHref =
            taskId === null ? null : `/project/${projectId}/task/${taskId}`;
          // task_released_after_complete carries a `taskTitle` in
          // `data` (stamped in unclaimProjectTask) so the timeline can
          // render the full neutral sentence inline — no join, no
          // shame framing. The <taskLink> segment of the sentence (the
          // task title) becomes the link; the member's name stays
          // plain text. Other activity types keep the existing
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
                  <Trans
                    i18nKey="projects.activityType.task_released_after_complete"
                    values={{ name: actorName, task: taskTitle }}
                    components={{
                      taskLink:
                        taskHref === null ? (
                          <span />
                        ) : (
                          <Link to={taskHref} className={HISTORY_LINK_CLASS} />
                        ),
                    }}
                  />
                </span>
              </li>
            );
          }
          const typeLabel = t(
            `projects.activityType.${a.type}` as "projects.activityType.project_created",
          );
          return (
            <li key={a.id} className="flex items-start gap-2 text-sm">
              <span className="shrink-0 text-xs text-moss-600 dark:text-moss-300">
                {formatRelativeTime(a.createdAt)}
              </span>
              <span className="text-moss-700 dark:text-moss-200">
                <span className="font-medium">{actorName}</span>
                {" — "}
                {/* Task rows whose data carries the task's id link to
                    the task page; rows without one keep the plain
                    label. Member names deliberately never link — the
                    timeline is about the work, not a doorway to
                    member pages. */}
                {taskHref === null ? (
                  typeLabel
                ) : (
                  <Link to={taskHref} className={HISTORY_LINK_CLASS}>
                    {typeLabel}
                  </Link>
                )}
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
