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
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { MyOrganizedProjectsView, OrganizedProject } from "@/lib/myProjects";
import { computeProjectMomentum } from "@/lib/projectMomentum";
import { ProjectMomentumChip } from "@/components/ProjectMomentumChip";
import type { Exchange } from "@/types";

// Organizer-side twin of the carrying view — the projects in the
// member's care and what's waiting on them, in one pull-only place.
// Read-only by design: confirmation and every organizer action stay
// on the project page, so there's exactly one surface that owns those
// actions and their framing. See `lib/myProjects.ts` for the scope
// decisions.
//
// Once a standalone page at /my-projects; now the organizer half of
// the combined /my-work tab (MyWork.tsx), which owns the route, the
// heading, and the empty states. This module keeps the rendering so
// the section and the Profile summary card stay in one place.

/**
 * Shared summary sentence so the Profile entry card and the page header
 * describe the view in the same words. Counts projects, not output.
 */
export function MyProjectsSummary({ projectCount }: { projectCount: number }) {
  const { t } = useTranslation();
  if (projectCount === 1) return <>{t("myProjects.summaryOne")}</>;
  return <>{t("myProjects.summaryOther", { count: projectCount })}</>;
}

const PROJECT_STATUS_KEY = {
  planning: "projects.statusPlanning",
  active: "projects.statusActive",
  paused: "projects.statusPaused",
  completed: "projects.statusCompleted",
  archived: "projects.statusArchived",
} as const;

function ProjectCard({
  group,
  exchanges,
}: {
  group: OrganizedProject;
  exchanges: readonly Exchange[];
}) {
  const { t } = useTranslation();
  const { project, role, awaitingYouCount, openTaskCount, pendingInviteCount } =
    group;
  // Momentum reads the full exchange log, joined to this project via its
  // tasks' exchangeIds — so we hand the helper the project-scoped task
  // slice the lib layer already grouped, not a second filter pass.
  const momentum = computeProjectMomentum({ project, tasks: group.tasks, exchanges });
  return (
    <section className="card" aria-labelledby={`my-proj-${project.id}`}>
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <h2
          id={`my-proj-${project.id}`}
          className="min-w-0 text-base font-semibold"
        >
          <Link
            to={`/project/${project.id}`}
            className="underline-offset-2 hover:underline focus-visible:underline"
          >
            {project.title}
          </Link>
        </h2>
        {project.status !== "active" && (
          <span className="chip bg-moss-100 text-moss-700 dark:bg-moss-800 dark:text-moss-200">
            {t(PROJECT_STATUS_KEY[project.status])}
          </span>
        )}
        {/* Honest context for why the invitation line never shows here —
            only the primary can issue co-organizer invitations. */}
        {role === "co" && (
          <span className="chip bg-canopy-50 text-canopy-900 dark:bg-canopy-950/50 dark:text-canopy-100">
            {t("myProjects.coOrganizerChip")}
          </span>
        )}
        <ProjectMomentumChip
          state={momentum.state}
          hoursLast7Days={momentum.hoursLast7Days}
        />
      </div>
      {/* Plain sentences — every number is work waiting on the viewer,
          never a measure of anyone's output (no-leaderboards). */}
      <ul className="flex flex-col gap-0.5 text-sm text-moss-600 dark:text-moss-300">
        {awaitingYouCount > 0 && (
          <li className="font-medium text-moss-800 dark:text-moss-100">
            {t("myProjects.awaiting", { count: awaitingYouCount })}
          </li>
        )}
        <li>
          {openTaskCount > 0
            ? t("myProjects.openTasks", { count: openTaskCount })
            : t("myProjects.noOpenTasks")}
        </li>
        {pendingInviteCount > 0 && (
          <li>{t("myProjects.pendingInvites", { count: pendingInviteCount })}</li>
        )}
      </ul>
    </section>
  );
}

/**
 * The populated body of the organizing view: summary sentence + one
 * card per project. The caller (MyWork) owns the section heading and
 * decides what to render at zero projects, so this component assumes
 * a non-empty view.
 */
export function MyProjectsSection({
  view,
  exchanges,
}: {
  view: MyOrganizedProjectsView;
  exchanges: readonly Exchange[];
}) {
  return (
    <>
      <p className="mb-4 text-sm text-moss-600 dark:text-moss-300">
        <MyProjectsSummary projectCount={view.projectCount} />
      </p>
      <div className="flex flex-col gap-3">
        {view.groups.map((group) => (
          <ProjectCard
            key={group.project.id}
            group={group}
            exchanges={exchanges}
          />
        ))}
      </div>
    </>
  );
}
