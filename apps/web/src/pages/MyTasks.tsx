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
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { MyClaimedTasksView, MyTaskGroup } from "@/lib/myTasks";
import { CategoryBadge } from "@/components/CategoryBadge";
import { formatHours, formatRelativeTime } from "@/lib/format";
import type { Project, ProjectTask } from "@/types";

// Cross-project "tasks you're carrying" view — the claimer-side
// answer to "what have I committed to, and where?" Members helping
// on several projects previously had to open each project page to
// reconstruct their own commitments; this gathers the same local
// rows in one pull-only place. Read-only by design: claim, release,
// mark-complete, and their consequence dialogs stay on the project
// page, so there is exactly one surface where those actions (and
// their careful framing) live. See `lib/myTasks.ts` for the scope
// decisions.
//
// Once a standalone page at /my-tasks; now the claimer half of the
// combined /my-work tab (MyWork.tsx), which owns the route, the
// heading, and the empty states. This module keeps the rendering so
// the section and the Profile summary card stay in one place.

/**
 * One sentence, three grammatical shapes — a single task implies a
 * single project, so the only cases are (1, 1), (n, 1), and (n, m).
 * Shared with the Profile entry card so both surfaces describe the
 * same view in the same words.
 */
export function MyTasksSummary({
  taskCount,
  projectCount,
}: {
  taskCount: number;
  projectCount: number;
}) {
  const { t } = useTranslation();
  if (taskCount === 1) return <>{t("myTasks.summaryOne")}</>;
  if (projectCount === 1)
    return <>{t("myTasks.summaryOneProject", { count: taskCount })}</>;
  return (
    <>
      {t("myTasks.summaryOther", {
        count: taskCount,
        projects: projectCount,
      })}
    </>
  );
}

const PROJECT_STATUS_KEY = {
  planning: "projects.statusPlanning",
  active: "projects.statusActive",
  paused: "projects.statusPaused",
  completed: "projects.statusCompleted",
  archived: "projects.statusArchived",
} as const;

function TaskRow({ task, project }: { task: ProjectTask; project: Project }) {
  const { t } = useTranslation();
  const awaiting = task.status === "awaiting_confirmation";
  return (
    <li className="py-2">
      <Link
        to={`/project/${project.id}/task/${task.id}`}
        className="-mx-2 block rounded-lg px-2 py-1 hover:bg-moss-50 dark:hover:bg-moss-900"
      >
        <span className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={task.category} size="sm" />
          <span className="min-w-0 flex-1 truncate text-sm font-medium">
            {task.title}
          </span>
          {/* Status chips reuse the project page's palette so the
              same state reads the same everywhere. */}
          <span
            className={`chip ${
              awaiting
                ? "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
                : "bg-moss-100 text-moss-700 dark:bg-moss-800 dark:text-moss-200"
            }`}
          >
            {awaiting
              ? t("projects.task.statusAwaiting")
              : t("projects.task.statusClaimed")}
          </span>
          <span className="chip bg-canopy-50 text-canopy-900 dark:bg-canopy-950/50 dark:text-canopy-100">
            {formatHours(task.estimatedHours)}
          </span>
        </span>
        {/* "Claimed 3 weeks ago" is a fact the member already owns,
            not a deadline — no day counters, no overdue framing
            (solidarity-not-shame). The check-in nudges stay where
            they live today: the attention rail. */}
        {task.claimedAt !== null && (
          <span className="mt-1 block text-xs text-moss-600 dark:text-moss-300">
            {t("myTasks.claimedAgo", {
              when: formatRelativeTime(task.claimedAt),
            })}
          </span>
        )}
      </Link>
    </li>
  );
}

function ProjectGroup({ group }: { group: MyTaskGroup }) {
  const { t } = useTranslation();
  const { project, tasks } = group;
  return (
    <section className="card" aria-labelledby={`my-tasks-${project.id}`}>
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <h2
          id={`my-tasks-${project.id}`}
          className="min-w-0 text-base font-semibold"
        >
          <Link
            to={`/project/${project.id}`}
            className="underline-offset-2 hover:underline focus-visible:underline"
          >
            {project.title}
          </Link>
        </h2>
        {/* Honest context when the project itself isn't moving — a
            claim inside a paused project isn't waiting on the
            claimer. Active is the unremarkable default, so no chip. */}
        {project.status !== "active" && (
          <span className="chip bg-moss-100 text-moss-700 dark:bg-moss-800 dark:text-moss-200">
            {t(PROJECT_STATUS_KEY[project.status])}
          </span>
        )}
      </div>
      <ul className="divide-y divide-moss-100 dark:divide-moss-800">
        {tasks.map((task) => (
          <TaskRow key={task.id} task={task} project={project} />
        ))}
      </ul>
    </section>
  );
}

/**
 * The populated body of the carrying view: summary sentence + one
 * card per project. The caller (MyWork) owns the section heading and
 * decides what to render at zero tasks, so this component assumes a
 * non-empty view.
 */
export function MyTasksSection({ view }: { view: MyClaimedTasksView }) {
  return (
    <>
      <p className="mb-4 text-sm text-moss-600 dark:text-moss-300">
        <MyTasksSummary
          taskCount={view.taskCount}
          projectCount={view.projectCount}
        />
      </p>
      <div className="flex flex-col gap-3">
        {view.groups.map((group) => (
          <ProjectGroup key={group.project.id} group={group} />
        ))}
      </div>
    </>
  );
}
