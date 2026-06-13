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
import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import { myOrganizedProjects, type OrganizedProject } from "@/lib/myProjects";
import { computeProjectMomentum } from "@/lib/projectMomentum";
import { ProjectMomentumChip } from "@/components/ProjectMomentumChip";
import { EmptyState } from "@/components/EmptyState";
import { WhyTooltip } from "@/components/WhyTooltip";
import type { Exchange } from "@/types";

// Organizer-side twin of /my-tasks — the projects in the member's care
// and what's waiting on them, in one pull-only place. Read-only by
// design: confirmation and every organizer action stay on the project
// page, so there's exactly one surface that owns those actions and
// their framing. See `lib/myProjects.ts` for the scope decisions.

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

export default function MyProjectsPage() {
  const {
    currentMember,
    projects,
    projectTasks,
    exchanges,
    coorgInvitations,
    coorgInvitationResponses,
    coorgInvitationRevocations,
    blockedKeys,
  } = useApp();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const view = useMemo(
    () =>
      currentMember
        ? myOrganizedProjects({
            memberKey: currentMember.publicKey,
            projects,
            projectTasks,
            coorgInvitations,
            coorgInvitationResponses,
            coorgInvitationRevocations,
            blockedKeys,
          })
        : { groups: [], projectCount: 0, awaitingYouTotal: 0 },
    [
      currentMember,
      projects,
      projectTasks,
      coorgInvitations,
      coorgInvitationResponses,
      coorgInvitationRevocations,
      blockedKeys,
    ],
  );

  if (!currentMember) return null;

  return (
    <div className="px-4 pb-8 pt-4">
      <header className="mb-4">
        <button
          type="button"
          className="btn-ghost -ml-2 text-sm"
          onClick={() => navigate(-1)}
        >
          {t("common.back")}
        </button>
        <h1 className="page-title mt-2">{t("myProjects.title")}</h1>
        <p className="text-sm text-moss-600 dark:text-moss-300">
          {t("myProjects.subtitle")}
          <WhyTooltip principleId="no-notifications" />
        </p>
      </header>

      {view.projectCount === 0 ? (
        <EmptyState
          title={t("myProjects.emptyTitle")}
          message={t("myProjects.empty")}
          action={{ label: t("myProjects.startProject"), to: "/project/new" }}
        />
      ) : (
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
      )}
    </div>
  );
}
