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
import { useEffect, useMemo, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import { myClaimedTasks } from "@/lib/myTasks";
import { myOrganizedProjects } from "@/lib/myProjects";
import { MyTasksSection } from "@/pages/MyTasks";
import { MyProjectsSection } from "@/pages/MyProjects";
import { EmptyState } from "@/components/EmptyState";
import { WhyTooltip } from "@/components/WhyTooltip";

// The "My work" tab (docs/navigation-shell.md): both directions of a
// member's involvement — tasks you're carrying (claimer side) and
// projects you organize (organizer side) — on one primary surface.
// The two halves shipped as separate pages (/my-tasks, /my-projects)
// reachable only through Profile; folding them into a tab puts a
// member's own commitments one tap away without a leaderboard in
// sight: every number here is the viewer's own work, never a ranking.
//
// Still read-only by design, like the pages it absorbs: claim,
// release, confirm, and their consequence dialogs all stay on the
// project pages, so there is exactly one surface that owns those
// actions and their careful framing.
//
// The old routes redirect here with anchors (/my-tasks → #tasks,
// /my-projects → #projects) so bookmarks and older links keep
// working; the hash-scroll effect below lands them on the right
// section, same idiom as Profile's #invites.

export default function MyWorkPage() {
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
  const location = useLocation();
  const tasksRef = useRef<HTMLElement | null>(null);
  const projectsRef = useRef<HTMLElement | null>(null);

  const carrying = useMemo(
    () =>
      currentMember
        ? myClaimedTasks(currentMember.publicKey, projectTasks, projects)
        : { groups: [], taskCount: 0, projectCount: 0 },
    [currentMember, projectTasks, projects],
  );

  const organizing = useMemo(
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

  // Redirected /my-tasks and /my-projects arrivals carry a hash;
  // <main> is the scroller (never the document), so the hash needs an
  // explicit scroll once the section exists — Profile#invites idiom.
  useEffect(() => {
    if (location.hash === "#tasks") {
      tasksRef.current?.scrollIntoView({ block: "start" });
    } else if (location.hash === "#projects") {
      projectsRef.current?.scrollIntoView({ block: "start" });
    }
  }, [location.hash]);

  if (!currentMember) return null;

  const bothEmpty = carrying.taskCount === 0 && organizing.projectCount === 0;

  return (
    <div className="px-4 pb-8 pt-4">
      <header className="mb-4">
        <h1 className="page-title">{t("myWork.title")}</h1>
        <p className="text-sm text-moss-600 dark:text-moss-300">
          {t("myWork.subtitle")}
          <WhyTooltip principleId="no-notifications" />
        </p>
      </header>

      {bothEmpty ? (
        // One combined empty state instead of two stacked section
        // shells — a member with nothing in their care shouldn't read
        // two consecutive "nothing here" cards. Browse-projects is the
        // primary door (claiming is the lower-commitment first step);
        // starting a project gets a quiet second link.
        <>
          <EmptyState
            title={t("myWork.emptyTitle")}
            message={t("myWork.empty")}
            action={{
              label: t("myTasks.browseProjects"),
              to: "/?tab=projects",
            }}
          />
          <p className="mt-3 text-center text-sm">
            <Link
              to="/project/new"
              className="text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
            >
              {t("myProjects.startProject")}
            </Link>
          </p>
        </>
      ) : (
        // Stacked on a phone; side-by-side columns at lg+ (Layout's
        // content well widens to screen-lg there) so the two halves
        // read as one workbench instead of a long scroll.
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:items-start lg:gap-8">
          <section
            id="tasks"
            ref={tasksRef}
            aria-labelledby="my-work-tasks-heading"
            className="scroll-mt-4"
          >
            <h2
              id="my-work-tasks-heading"
              className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300"
            >
              {t("myTasks.title")}
            </h2>
            {carrying.taskCount === 0 ? (
              // One side populated, this one not: a quiet sentence,
              // not a second EmptyState — the page isn't empty.
              <p className="text-sm text-moss-600 dark:text-moss-300">
                {t("myTasks.empty")}{" "}
                <Link
                  to="/?tab=projects"
                  className="text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
                >
                  {t("myTasks.browseProjects")}
                </Link>
              </p>
            ) : (
              <MyTasksSection view={carrying} />
            )}
          </section>

          <section
            id="projects"
            ref={projectsRef}
            aria-labelledby="my-work-projects-heading"
            className="scroll-mt-4"
          >
            <h2
              id="my-work-projects-heading"
              className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300"
            >
              {t("myProjects.title")}
            </h2>
            {organizing.projectCount === 0 ? (
              <p className="text-sm text-moss-600 dark:text-moss-300">
                {t("myProjects.empty")}{" "}
                <Link
                  to="/project/new"
                  className="text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
                >
                  {t("myProjects.startProject")}
                </Link>
              </p>
            ) : (
              <MyProjectsSection view={organizing} exchanges={exchanges} />
            )}
          </section>
        </div>
      )}
    </div>
  );
}
