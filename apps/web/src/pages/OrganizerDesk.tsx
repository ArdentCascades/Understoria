/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program. If not, see
 * <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLiveQuery } from "dexie-react-hooks";
import { useApp } from "@/state/AppContext";
import { db } from "@/db/database";
import { myOrganizedProjects } from "@/lib/myProjects";
import { pendingBalanceFor } from "@/lib/timebank";
import { shiftGaps } from "@/lib/organizerDesk";
import { EmptyState } from "@/components/EmptyState";
import { formatDeadline } from "@/lib/format";

// The organizer's desk (docs/desktop-power-tools.md plan 2): one
// page answering "what's waiting on ME, and what's short of hands,
// across everything I organize?" — which otherwise means touring
// every project and event page.
//
// A lens, not a control panel: every row LINKS to the surface where
// the action already lives; no new mutation paths. Strictly the
// viewer's own responsibilities — nothing here counts, ranks, or
// ages anyone else's activity (no-leaderboards). Sections self-hide
// at zero, and an entirely empty desk is a rest state, not a
// failure state (solidarity-not-shame).
/**
 * How many things are actionable at the desk right now — the
 * doorway card's whole input. Same selectors as the page, so the
 * count and the page can never disagree.
 */
export function useDeskActionableCount(): number {
  const {
    currentMember,
    projects,
    projectTasks,
    posts,
    events,
    eventCancellations,
    blockedKeys,
  } = useApp();
  const shifts = useLiveQuery(() => db.eventShifts.toArray(), [], []);
  const signups = useLiveQuery(() => db.shiftSignups.toArray(), [], []);
  const memberKey = currentMember?.publicKey ?? "";
  return useMemo(() => {
    if (!memberKey) return 0;
    const organized = myOrganizedProjects({
      memberKey,
      projects,
      projectTasks,
      blockedKeys,
    });
    const awaitingPosts = pendingBalanceFor(memberKey, posts).entries.filter(
      (e) => e.owedBy === "you",
    ).length;
    const gaps = shiftGaps({
      memberKey,
      events,
      cancelledEventIds: new Set(eventCancellations.map((c) => c.eventId)),
      shifts,
      signups,
      now: Date.now(),
    }).length;
    return organized.awaitingYouTotal + awaitingPosts + gaps;
  }, [
    memberKey,
    projects,
    projectTasks,
    blockedKeys,
    posts,
    events,
    eventCancellations,
    shifts,
    signups,
  ]);
}

export default function OrganizerDeskPage() {
  const {
    currentMember,
    projects,
    projectTasks,
    posts,
    events,
    eventCancellations,
    blockedKeys,
    members,
  } = useApp();
  const { t } = useTranslation();

  // Shifts live in Dexie only (they never enter app-context state —
  // most pages don't need them). Live so a signup arriving over
  // federation closes a gap while the desk is open.
  const shifts = useLiveQuery(() => db.eventShifts.toArray(), [], []);
  const signups = useLiveQuery(() => db.shiftSignups.toArray(), [], []);

  const memberKey = currentMember?.publicKey ?? "";
  const memberName = useMemo(
    () => new Map(members.map((m) => [m.publicKey, m.displayName])),
    [members],
  );

  const organized = useMemo(
    () =>
      myOrganizedProjects({
        memberKey,
        projects,
        projectTasks,
        blockedKeys,
      }),
    [memberKey, projects, projectTasks, blockedKeys],
  );

  const confirmQueue = organized.groups.filter((g) => g.awaitingYouCount > 0);
  const shortOfHands = organized.groups.filter(
    (g) => g.openTaskCount > 0 && g.project.status !== "completed",
  );

  const awaitingYou = useMemo(
    () =>
      pendingBalanceFor(memberKey, posts).entries.filter(
        (e) => e.owedBy === "you",
      ),
    [memberKey, posts],
  );

  const gaps = useMemo(
    () =>
      shiftGaps({
        memberKey,
        events,
        cancelledEventIds: new Set(eventCancellations.map((c) => c.eventId)),
        shifts,
        signups,
        now: Date.now(),
      }),
    [memberKey, events, eventCancellations, shifts, signups],
  );

  if (!currentMember) return null;

  const empty =
    confirmQueue.length === 0 &&
    awaitingYou.length === 0 &&
    gaps.length === 0 &&
    shortOfHands.length === 0;

  return (
    <div className="px-4 pb-8 pt-6">
      <header className="mb-4">
        <h1 className="page-title">{t("desk.title")}</h1>
        <p className="text-sm text-moss-600 dark:text-moss-300">
          {t("desk.tagline")}
        </p>
      </header>

      {empty ? (
        <EmptyState
          illustration="raising"
          title={t("desk.emptyTitle")}
          message={t("desk.empty")}
        />
      ) : (
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-4">
          {confirmQueue.length > 0 && (
            <section className="card mb-4">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
                {t("desk.confirmations.title")}
              </h2>
              <ul className="flex flex-col gap-0.5">
                {confirmQueue.map((g) => (
                  <li key={g.project.id}>
                    <Link
                      to={`/project/${g.project.id}`}
                      className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-moss-50 dark:hover:bg-moss-900"
                    >
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">
                        {g.project.title}
                      </span>
                      <span className="whitespace-nowrap text-xs text-moss-600 dark:text-moss-300">
                        {t("desk.confirmations.count", {
                          count: g.awaitingYouCount,
                        })}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {awaitingYou.length > 0 && (
            <section className="card mb-4">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
                {t("desk.posts.title")}
              </h2>
              <ul className="flex flex-col gap-0.5">
                {awaitingYou.map((e) => (
                  <li key={e.postId}>
                    <Link
                      to={`/post/${e.postId}`}
                      className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-moss-50 dark:hover:bg-moss-900"
                    >
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">
                        {memberName.get(e.counterparty) ??
                          t("desk.posts.someone")}
                      </span>
                      <span className="whitespace-nowrap text-xs text-moss-600 dark:text-moss-300">
                        {t("desk.posts.confirm")}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {gaps.length > 0 && (
            <section className="card mb-4">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
                {t("desk.shifts.title")}
              </h2>
              <ul className="flex flex-col gap-0.5">
                {gaps.map((gap) => (
                  <li key={gap.shift.id}>
                    <Link
                      to={`/calendar/event/${gap.event.id}`}
                      className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-moss-50 dark:hover:bg-moss-900"
                    >
                      <span className="min-w-0 flex-1 truncate text-sm">
                        <span className="font-medium">{gap.event.title}</span>
                        <span className="text-moss-600 dark:text-moss-300">
                          {" · "}
                          {gap.shift.label}
                          {" · "}
                          {formatDeadline(gap.shift.startsAt)}
                        </span>
                      </span>
                      <span className="whitespace-nowrap text-xs text-moss-600 dark:text-moss-300">
                        {t("desk.shifts.count", {
                          signedUp: gap.signedUp,
                          capacity: gap.capacity,
                        })}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {shortOfHands.length > 0 && (
            <section className="card mb-4">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
                {t("desk.openTasks.title")}
              </h2>
              <ul className="flex flex-col gap-0.5">
                {shortOfHands.map((g) => (
                  <li key={g.project.id}>
                    <Link
                      to={`/project/${g.project.id}`}
                      className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-moss-50 dark:hover:bg-moss-900"
                    >
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">
                        {g.project.title}
                      </span>
                      <span className="whitespace-nowrap text-xs text-moss-600 dark:text-moss-300">
                        {t("desk.openTasks.count", {
                          count: g.openTaskCount,
                        })}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
