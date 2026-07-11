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
import { db } from "@/db/database";
import { useApp } from "@/state/AppContext";
import {
  buildPlugInShelf,
  type ShelfNeed,
  type ShelfShift,
  type ShelfTask,
} from "@/lib/plugIn";
import { CategoryBadge } from "@/components/CategoryBadge";
import { WhyTooltip } from "@/components/WhyTooltip";

// "Ways to plug in" — the browsable shelf (docs/ways-to-plug-in.md).
// A member with two free hours walks up HERE instead of hunting
// across four surfaces. Everything is a local read over rows the
// device already holds (§7: no wire surface, no stored rows, no
// logs); the lens is visibly dumb token overlap (§5), and the §4
// constraints are rendered as copy where members can see them:
// matches are an offer TO you, never an obligation ON you, and the
// unmatched remainder is always present because matching is a lens,
// not a gate.

export default function PlugInPage() {
  const { currentMember, posts, projects, projectTasks, events, blockedKeys } =
    useApp();
  const { t } = useTranslation();

  // Shifts live in Dexie only — same read the My-work page does.
  const shiftRows = useLiveQuery(() => db.eventShifts.toArray(), [], []);
  const signupRows = useLiveQuery(() => db.shiftSignups.toArray(), [], []);

  const memberKey = currentMember?.publicKey ?? null;
  const skills = currentMember?.skills ?? [];

  const shelf = useMemo(() => {
    if (!memberKey) return null;
    // Block filtering happens HERE, before the pure matcher sees the
    // rows — same per-surface discipline as the Board and the
    // one-small-thing picker (docs/blocking.md §6): posts by, events
    // (and thus shifts) run by, and projects organized by a blocked
    // member don't surface as places to plug in.
    const visiblePosts = posts.filter((p) => !blockedKeys.has(p.postedBy));
    const visibleEvents = events.filter((e) => !blockedKeys.has(e.createdBy));
    const visibleProjects = projects.filter(
      (p) => !blockedKeys.has(p.organizerKey),
    );
    return buildPlugInShelf({
      memberKey,
      skills,
      posts: visiblePosts,
      tasks: projectTasks,
      projects: visibleProjects,
      events: visibleEvents,
      shifts: shiftRows,
      signups: signupRows,
      now: Date.now(),
    });
  }, [
    memberKey,
    skills,
    posts,
    projectTasks,
    projects,
    events,
    shiftRows,
    signupRows,
    blockedKeys,
  ]);

  if (!currentMember || !shelf) return null;

  const matchedCount =
    shelf.matched.shifts.length +
    shelf.matched.needs.length +
    shelf.matched.tasks.length;
  const remainderCount =
    shelf.remainder.shifts.length +
    shelf.remainder.needs.length +
    shelf.remainder.tasks.length;

  return (
    <div className="mx-auto max-w-screen-md px-4 pb-8 pt-4">
      <header className="mb-4">
        <h1 className="page-title">{t("plugIn.title")}</h1>
        <p className="text-sm text-moss-600 dark:text-moss-300">
          {t("plugIn.subtitle")}
          <WhyTooltip principleId="asking-never-gated" />
        </p>
        {/* §4 rendered as copy: the shelf never walks up to you. */}
        <p className="mt-1 text-xs text-moss-600 dark:text-moss-300">
          {t("plugIn.noObligation")}
        </p>
      </header>

      {/* Ruling R2: the surface itself motivates filling in skills —
          a quiet line, not a campaign. Shown whenever the profile has
          no skills, matched or not. */}
      {skills.length === 0 && (
        <p className="mb-4 text-sm text-moss-600 dark:text-moss-300">
          {t("plugIn.addSkills")}{" "}
          <Link
            to="/profile"
            className="text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
          >
            {t("plugIn.addSkillsLink")}
          </Link>
        </p>
      )}

      {matchedCount === 0 ? (
        <p className="mb-6 text-sm text-moss-600 dark:text-moss-300">
          {shelf.lensTokens.length === 0
            ? t("plugIn.emptyNoLens")
            : t("plugIn.emptyWithLens")}
        </p>
      ) : (
        <>
          <ShelfSection
            id="plug-in-shifts"
            title={t("plugIn.shiftsTitle")}
            count={shelf.matched.shifts.length}
          >
            <ul className="divide-y divide-moss-100 dark:divide-moss-800">
              {shelf.matched.shifts.map((s) => (
                <ShiftRow key={s.shift.id} entry={s} />
              ))}
            </ul>
          </ShelfSection>

          <ShelfSection
            id="plug-in-needs"
            title={t("plugIn.needsTitle")}
            count={shelf.matched.needs.length}
          >
            <ul className="divide-y divide-moss-100 dark:divide-moss-800">
              {shelf.matched.needs.map((n) => (
                <NeedRow key={n.post.id} entry={n} />
              ))}
            </ul>
          </ShelfSection>

          <ShelfSection
            id="plug-in-tasks"
            title={t("plugIn.tasksTitle")}
            count={shelf.matched.tasks.length}
          >
            <ul className="divide-y divide-moss-100 dark:divide-moss-800">
              {shelf.matched.tasks.map((x) => (
                <TaskRow key={x.task.id} entry={x} />
              ))}
            </ul>
          </ShelfSection>
        </>
      )}

      {/* §3.4 — the load-bearing remainder: everything open that
          didn't match, collapsed by default, never omitted. A member
          may plug in anywhere; matching de-clutters, it must not
          curate reality. */}
      <details className="mt-2">
        <summary className="cursor-pointer text-sm font-medium text-canopy-700 dark:text-canopy-300">
          {t("plugIn.remainderTitle", { count: remainderCount })}
        </summary>
        <p className="mt-1 text-xs text-moss-600 dark:text-moss-300">
          {t("plugIn.remainderHint")}
        </p>
        {remainderCount === 0 ? (
          <p className="mt-2 text-sm text-moss-600 dark:text-moss-300">
            {t("plugIn.remainderEmpty")}
          </p>
        ) : (
          <div className="mt-2 space-y-4">
            {shelf.remainder.shifts.length > 0 && (
              <ShelfSection
                id="plug-in-rest-shifts"
                title={t("plugIn.shiftsTitle")}
                count={shelf.remainder.shifts.length}
              >
                <ul className="divide-y divide-moss-100 dark:divide-moss-800">
                  {shelf.remainder.shifts.map((s) => (
                    <ShiftRow key={s.shift.id} entry={s} />
                  ))}
                </ul>
              </ShelfSection>
            )}
            {shelf.remainder.needs.length > 0 && (
              <ShelfSection
                id="plug-in-rest-needs"
                title={t("plugIn.needsTitle")}
                count={shelf.remainder.needs.length}
              >
                <ul className="divide-y divide-moss-100 dark:divide-moss-800">
                  {shelf.remainder.needs.map((n) => (
                    <NeedRow key={n.post.id} entry={n} />
                  ))}
                </ul>
              </ShelfSection>
            )}
            {shelf.remainder.tasks.length > 0 && (
              <ShelfSection
                id="plug-in-rest-tasks"
                title={t("plugIn.tasksTitle")}
                count={shelf.remainder.tasks.length}
              >
                <ul className="divide-y divide-moss-100 dark:divide-moss-800">
                  {shelf.remainder.tasks.map((x) => (
                    <TaskRow key={x.task.id} entry={x} />
                  ))}
                </ul>
              </ShelfSection>
            )}
          </div>
        )}
      </details>
    </div>
  );
}

function ShelfSection({
  id,
  title,
  count,
  children,
}: {
  id: string;
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  if (count === 0) return null;
  return (
    <section aria-labelledby={`${id}-heading`} className="mb-6">
      <h2
        id={`${id}-heading`}
        className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300"
      >
        {title}
      </h2>
      <div className="card">{children}</div>
    </section>
  );
}

/** The visibly-dumb-lens receipt (§5): name exactly which of the
 *  member's own words this item overlapped, so the authority for
 *  "is this for me?" stays with the member, not the matcher. */
function MatchedOn({ tokens }: { tokens: string[] }) {
  const { t } = useTranslation();
  if (tokens.length === 0) return null;
  return (
    <span className="mt-1 block text-xs text-moss-600 dark:text-moss-300">
      {t("plugIn.matchedOn", { tokens: tokens.slice(0, 3).join(", ") })}
    </span>
  );
}

function ShiftRow({ entry }: { entry: ShelfShift }) {
  const { t, i18n } = useTranslation();
  const { shift, event, spotsOpen, matchedOn } = entry;
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
          {spotsOpen !== null && (
            <span className="chip bg-moss-100 text-moss-700 dark:bg-moss-800 dark:text-moss-200">
              {t("plugIn.spotsOpen", { count: spotsOpen })}
            </span>
          )}
          <span className="chip bg-canopy-50 text-canopy-900 dark:bg-canopy-950/50 dark:text-canopy-100">
            {dateFmt.format(new Date(shift.startsAt))} ·{" "}
            {timeFmt.format(new Date(shift.startsAt))}
          </span>
        </span>
        <span className="mt-1 block text-xs text-moss-600 dark:text-moss-300">
          {event.title}
        </span>
        <MatchedOn tokens={matchedOn} />
      </Link>
    </li>
  );
}

function NeedRow({ entry }: { entry: ShelfNeed }) {
  const { t } = useTranslation();
  const { post, matchedOn } = entry;
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
          {post.urgency === "high" && (
            <span className="chip bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
              {t("urgency.high")}
            </span>
          )}
        </span>
        <MatchedOn tokens={matchedOn} />
      </Link>
    </li>
  );
}

function TaskRow({ entry }: { entry: ShelfTask }) {
  const { t } = useTranslation();
  const { task, project, blockedByTitles, matchedOn } = entry;
  const blocked = blockedByTitles.length > 0;
  return (
    <li className={`py-2 ${blocked ? "opacity-70" : ""}`}>
      <Link
        to={`/project/${task.projectId}/task/${task.id}`}
        className="-mx-2 block rounded-lg px-2 py-1 hover:bg-moss-50 dark:hover:bg-moss-900"
      >
        <span className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={task.category} size="sm" />
          <span className="min-w-0 flex-1 truncate text-sm font-medium">
            {task.title}
          </span>
        </span>
        <span className="mt-1 block text-xs text-moss-600 dark:text-moss-300">
          {project.title}
        </span>
        {/* Soft block, the task-ordering discipline verbatim:
            de-emphasized and last, never hidden. */}
        {blocked && (
          <span className="mt-1 block text-xs text-moss-600 dark:text-moss-300">
            {t("plugIn.follows", { titles: blockedByTitles.join(", ") })}
          </span>
        )}
        <MatchedOn tokens={matchedOn} />
      </Link>
    </li>
  );
}
