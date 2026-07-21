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
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/database";
import { useApp } from "@/state/AppContext";
import { myClaimedTasks } from "@/lib/myTasks";
import { myOrganizedProjects } from "@/lib/myProjects";
import {
  myClaimedPosts,
  myUpcomingShifts,
  type UpcomingShift,
} from "@/lib/myCommitments";
import { MyTasksSection } from "@/pages/MyTasks";
import { MyProjectsSection } from "@/pages/MyProjects";
import { buildShiftIcs, icsFilename } from "@/lib/eventIcs";
import { downloadIcs } from "@/lib/ics";
import { shareOrigin } from "@/lib/appOrigin";
import { useToast } from "@/state/ToastContext";
import { askedOfYou, type AskedOfYouItem } from "@/lib/mentions";
import { stripMarkdown } from "@/lib/markdown";
import { formatRelativeTime } from "@/lib/format";
import { CategoryBadge } from "@/components/CategoryBadge";
import { EmptyState } from "@/components/EmptyState";
import { WhyTooltip } from "@/components/WhyTooltip";
import type { Post } from "@/types";

// The "In my care" tab (docs/navigation-shell.md; shipped as "My
// work", renamed because the page's own copy — "carrying", "in your
// care" — was already speaking care, not labor; the /my-work route
// and code identifiers keep the old name): both directions of a
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
    members,
    projects,
    projectTasks,
    posts,
    exchanges,
    events,
    eventCancellations,
    coorgInvitations,
    coorgInvitationResponses,
    coorgInvitationRevocations,
    blockedKeys,
  } = useApp();
  const { t } = useTranslation();
  const location = useLocation();
  const tasksRef = useRef<HTMLElement | null>(null);
  const projectsRef = useRef<HTMLElement | null>(null);

  // Shifts live in Dexie only — they never enter app-context state
  // (same read the organizer's desk does).
  const shiftRows = useLiveQuery(() => db.eventShifts.toArray(), [], []);
  const signupRows = useLiveQuery(() => db.shiftSignups.toArray(), [], []);

  // The viewer's own private planned days (db/taskPlans.ts) — Dexie-
  // only, like the shifts. Tasks the member gave a day sort first in
  // the carrying list and show a quiet "You planned …" line.
  const memberKey = currentMember?.publicKey;
  const planRows = useLiveQuery(
    async () =>
      memberKey
        ? await db.taskPlans.where("memberKey").equals(memberKey).toArray()
        : [],
    [memberKey],
    [] as import("@/db/database").TaskPlanRow[],
  );
  const plannedDays = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of planRows) {
      if (row.plannedDay) map.set(row.taskId, row.plannedDay);
    }
    return map;
  }, [planRows]);

  const carrying = useMemo(
    () =>
      currentMember
        ? myClaimedTasks(
            currentMember.publicKey,
            projectTasks,
            projects,
            plannedDays,
          )
        : { groups: [], taskCount: 0, projectCount: 0 },
    [currentMember, projectTasks, projects, plannedDays],
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

  const upcomingShifts = useMemo(
    () =>
      currentMember
        ? myUpcomingShifts({
            memberKey: currentMember.publicKey,
            signups: signupRows,
            shifts: shiftRows,
            events,
            eventCancellations,
          })
        : [],
    [currentMember, signupRows, shiftRows, events, eventCancellations],
  );

  const claimedPosts = useMemo(
    () =>
      currentMember
        ? myClaimedPosts({
            memberKey: currentMember.publicKey,
            posts,
            blockedKeys,
          })
        : [],
    [currentMember, posts, blockedKeys],
  );

  // "Asked of you" — comments that @-mention the viewer, DERIVED live
  // from the comment/task/project tables (docs/mentions.md: no
  // notification rows exist anywhere; these predicates ARE the
  // lifecycle). Comments live in Dexie only, same as the shifts read.
  const commentRows = useLiveQuery(() => db.taskComments.toArray(), [], []);
  const memberNames = useMemo(
    () => new Map(members.map((m) => [m.publicKey, m.displayName])),
    [members],
  );
  const asked = useMemo(
    () =>
      currentMember
        ? askedOfYou({
            myKey: currentMember.publicKey,
            comments: commentRows,
            tasks: projectTasks,
            projects,
            blockedKeys,
          })
        : [],
    [currentMember, commentRows, projectTasks, projects, blockedKeys],
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

  const bothEmpty =
    carrying.taskCount === 0 &&
    organizing.projectCount === 0 &&
    upcomingShifts.length === 0 &&
    claimedPosts.length === 0 &&
    asked.length === 0;

  return (
    <div className="px-4 pb-8 pt-4">
      <header className="mb-4 landscape-short:mb-2">
        <h1 className="page-title">{t("myWork.title")}</h1>
        <p className="page-subtitle text-sm text-moss-600 dark:text-moss-300">
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
        //
        // A phone held sideways (landscape-short) gets the same two
        // columns: width is lg-class while height is the scarce axis,
        // and the stacked halves were burning it. Column grouping is
        // the existing DOM order — everything the member claimed
        // (asked-of-you, tasks, shifts, help on the way) left, the
        // projects they organize right — so reading order equals DOM
        // order in every regime (WCAG 2.4.3).
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:items-start lg:gap-8 landscape-short:grid landscape-short:grid-cols-2 landscape-short:items-start landscape-short:gap-x-6">
          <section
            id="tasks"
            ref={tasksRef}
            aria-labelledby="my-work-tasks-heading"
            className="scroll-mt-4"
          >
            {/* Raised hands first: someone specifically asked for this
                member, which outranks their standing list in "what
                would I want to see on walking in?". DERIVED state
                (docs/mentions.md) — each row exists only while its
                comment is live, its task/project still wants
                attention, and the member hasn't replied; there is no
                unread count and nothing to dismiss, so the section
                simply isn't there when no hands are up. */}
            {asked.length > 0 && (
              <section
                aria-labelledby="my-work-asked-heading"
                className="mb-6 landscape-short:mb-4"
              >
                <h2
                  id="my-work-asked-heading"
                  className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300 landscape-short:mb-1"
                >
                  {t("myWork.askedTitle")}
                  <WhyTooltip principleId="no-notifications" />
                </h2>
                <div className="card">
                  <ul className="divide-y divide-moss-100 dark:divide-moss-800">
                    {asked.map((item) => (
                      <AskedRow
                        key={item.comment.id}
                        item={item}
                        memberNames={memberNames}
                      />
                    ))}
                  </ul>
                </div>
              </section>
            )}

            <h2
              id="my-work-tasks-heading"
              className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300 landscape-short:mb-1"
            >
              {t("myTasks.title")}
            </h2>
            {carrying.taskCount === 0 ? (
              // One side populated, this one not: a quiet sentence,
              // not a second EmptyState — the page isn't empty.
              // Sideways (landscape-short) the explanatory sentence
              // gives way to a one-line short form — same door, the
              // essence of the message, none of the prose (height is
              // the scarce axis there).
              <p className="text-sm text-moss-600 dark:text-moss-300">
                <span className="landscape-short:hidden">
                  {t("myTasks.empty")}{" "}
                </span>
                <span className="hidden landscape-short:inline">
                  {t("myTasks.emptyShort")} {"·"}{" "}
                </span>
                <Link
                  to="/?tab=projects"
                  className="text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
                >
                  {t("myTasks.browseProjects")}
                </Link>
              </p>
            ) : (
              <MyTasksSection view={carrying} plannedDays={plannedDays} />
            )}

            {/* The other two commitment kinds a member can claim —
                shift signups (the only entries here with a clock
                time) and NEED posts they're on their way to help
                with. Render only when non-empty: unlike the two main
                halves, these are additive, and a stack of empty
                shells would bury the page's real content. Read-only
                like everything else here — withdrawing/releasing
                stays on the event / post page. */}
            {upcomingShifts.length > 0 && (
              <section
                aria-labelledby="my-work-shifts-heading"
                className="mt-6 landscape-short:mt-4"
              >
                <h2
                  id="my-work-shifts-heading"
                  className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300 landscape-short:mb-1"
                >
                  {t("myWork.shiftsTitle")}
                </h2>
                <div className="card">
                  <ul className="divide-y divide-moss-100 dark:divide-moss-800">
                    {upcomingShifts.map((s) => (
                      <ShiftRow key={s.shift.id} upcoming={s} />
                    ))}
                  </ul>
                </div>
              </section>
            )}

            {claimedPosts.length > 0 && (
              <section
                aria-labelledby="my-work-claimed-heading"
                className="mt-6 landscape-short:mt-4"
              >
                <h2
                  id="my-work-claimed-heading"
                  className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300 landscape-short:mb-1"
                >
                  {t("myWork.claimedPostsTitle")}
                </h2>
                <div className="card">
                  <ul className="divide-y divide-moss-100 dark:divide-moss-800">
                    {claimedPosts.map((post) => (
                      <ClaimedPostRow key={post.id} post={post} />
                    ))}
                  </ul>
                </div>
              </section>
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
              className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300 landscape-short:mb-1"
            >
              {t("myProjects.title")}
            </h2>
            {organizing.projectCount === 0 ? (
              // Same landscape-short short-form swap as the tasks
              // half: one line, essence + door.
              <p className="text-sm text-moss-600 dark:text-moss-300">
                <span className="landscape-short:hidden">
                  {t("myProjects.empty")}{" "}
                </span>
                <span className="hidden landscape-short:inline">
                  {t("myProjects.emptyShort")} {"·"}{" "}
                </span>
                <Link
                  to="/project/new"
                  className="text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
                >
                  {t("myProjects.startProject")}
                </Link>
              </p>
            ) : (
              <>
                <MyProjectsSection view={organizing} exchanges={exchanges} />
                {/* Quiet doorway to the cross-project triage surface —
                    organizers only (the desk is meaningless without
                    projects in your care). A plain link, no count: the
                    counted variant is the Dashboard's DeskDoorway. */}
                <p className="mt-3 text-sm">
                  <Link
                    to="/desk"
                    className="text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
                  >
                    {t("myWork.deskLink")}
                  </Link>
                </p>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

// One raised hand: who asked, on which task, and what they said —
// linking straight to the task page, where the reply (which lowers
// the hand) naturally happens. The snippet strips markdown so tokens
// and syntax never leak into a one-line preview; the asker's CURRENT
// display name comes from the members table, with the generic
// fallback for a key this device can't resolve.
function AskedRow({
  item,
  memberNames,
}: {
  item: AskedOfYouItem;
  memberNames: Map<string, string>;
}) {
  const { t } = useTranslation();
  const { comment, task, project } = item;
  const asker =
    memberNames.get(comment.authorKey) ?? t("common.memberFallback");
  return (
    <li className="py-2">
      <Link
        to={`/project/${project.id}/task/${task.id}`}
        className="-mx-2 block rounded-lg px-2 py-1 hover:bg-moss-50 dark:hover:bg-moss-900"
      >
        <span className="flex flex-wrap items-center gap-2">
          <span className="min-w-0 flex-1 truncate text-sm font-medium">
            {task.title}
          </span>
          <span className="chip bg-canopy-50 text-canopy-900 dark:bg-canopy-950/50 dark:text-canopy-100">
            {formatRelativeTime(comment.createdAt)}
          </span>
        </span>
        <span className="mt-1 block text-xs text-moss-600 dark:text-moss-300">
          {t("myWork.askedBy", { name: asker })}
        </span>
        <span className="mt-0.5 block truncate text-xs text-bark-700 dark:text-moss-200">
          {stripMarkdown(comment.body)}
        </span>
      </Link>
    </li>
  );
}

// One signed-up shift: label + when, the row linking to the event
// page (where withdrawal lives), plus a quiet calendar-file download
// — a shift is a real clock time committed weeks ahead, which is
// where time blindness bites hardest. Times format in the member's
// locale; start date + start–end times on one quiet line.
function ShiftRow({ upcoming }: { upcoming: UpcomingShift }) {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const { shift, event } = upcoming;
  const dateFmt = new Intl.DateTimeFormat(i18n.language, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeFmt = new Intl.DateTimeFormat(i18n.language, {
    hour: "numeric",
    minute: "2-digit",
  });
  return (
    <li className="py-2">
      <Link
        to={`/events/${event.id}`}
        className="-mx-2 block rounded-lg px-2 py-1 hover:bg-moss-50 dark:hover:bg-moss-900"
      >
        <span className="flex flex-wrap items-center gap-2">
          <span className="min-w-0 flex-1 truncate text-sm font-medium">
            {shift.label}
          </span>
          <span className="chip bg-canopy-50 text-canopy-900 dark:bg-canopy-950/50 dark:text-canopy-100">
            {dateFmt.format(new Date(shift.startsAt))} ·{" "}
            {timeFmt.format(new Date(shift.startsAt))}–
            {timeFmt.format(new Date(shift.endsAt))}
          </span>
        </span>
        <span className="mt-1 block text-xs text-moss-600 dark:text-moss-300">
          {event.title}
        </span>
      </Link>
      {/* Outside the row link so a tap can't misfire into navigation.
          Same contract as every calendar export: the file goes to the
          member's OWN calendar app; Understoria never reminds. */}
      <button
        type="button"
        className="mt-0.5 text-xs text-canopy-700 underline decoration-canopy-300 underline-offset-2 hover:text-canopy-900 dark:text-canopy-300 dark:decoration-canopy-700 dark:hover:text-canopy-100"
        onClick={() => {
          const file = icsFilename(`${shift.label} ${event.title}`);
          downloadIcs(
            file,
            buildShiftIcs(shift, event, { appUrl: shareOrigin() }),
          );
          showToast(t("toast.icsShiftSaved", { file }));
        }}
      >
        {t("myWork.shiftIcs")}
      </button>
    </li>
  );
}

// One NEED post the member claimed: same row anatomy as TaskRow so
// the carrying column reads as one list family. Status chip narrows
// to the two live states the selector admits.
function ClaimedPostRow({ post }: { post: Post }) {
  const { t } = useTranslation();
  const awaiting = post.status === "awaiting_confirmation";
  return (
    <li className="py-2">
      <Link
        to={`/post/${post.id}`}
        className="-mx-2 block rounded-lg px-2 py-1 hover:bg-moss-50 dark:hover:bg-moss-900"
      >
        <span className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={post.category} size="sm" />
          <span className="min-w-0 flex-1 truncate text-sm font-medium">
            {post.title}
          </span>
          <span
            className={`chip ${
              awaiting
                ? "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
                : "bg-moss-100 text-moss-700 dark:bg-moss-800 dark:text-moss-200"
            }`}
          >
            {t(`postStatus.${post.status}`)}
          </span>
        </span>
      </Link>
    </li>
  );
}
