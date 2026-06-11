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
import type { Project } from "@/types";
import { formatHours, formatRelativeTime } from "@/lib/format";
import { HighlightedText } from "./HighlightedText";

export function ProjectCard({
  project,
  organizerName,
  taskCount,
  openTaskCount,
  searchQuery,
}: {
  project: Project;
  organizerName: string;
  taskCount: number;
  openTaskCount: number;
  /** Optional active Board search query — when non-empty, the
   *  project title is rendered via HighlightedText so matched
   *  substrings are wrapped in <mark>. Description is plain for
   *  v1 (mirrors PostCard). */
  searchQuery?: string;
}) {
  const { t } = useTranslation();
  const percent =
    project.targetHours > 0
      ? Math.min(
          100,
          Math.round((project.contributedHours / project.targetHours) * 100),
        )
      : 0;
  return (
    <Link
      to={`/project/${project.id}`}
      className="card block animate-fade-in transition-shadow hover:shadow-md
                 focus-visible:ring-2 focus-visible:ring-canopy-600/50"
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <StatusChip status={project.status} />
        <span className="chip bg-canopy-50 text-canopy-900 dark:bg-canopy-950/50 dark:text-canopy-100">
          {project.category.replace(/_/g, " ")}
        </span>
        <span className="text-xs text-moss-500 dark:text-moss-300">
          {taskCount} task{taskCount === 1 ? "" : "s"}
          {openTaskCount > 0 ? ` · ${openTaskCount} open` : ""}
        </span>
      </div>
      <h3 className="text-base font-semibold leading-snug">
        {searchQuery && searchQuery.trim() !== "" ? (
          <HighlightedText text={project.title} query={searchQuery} />
        ) : (
          project.title
        )}
      </h3>
      {project.description && (
        <p className="mt-1 line-clamp-2 text-sm text-moss-600 dark:text-moss-300">
          {project.description}
        </p>
      )}
      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-moss-100 dark:bg-moss-800"
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
      <div className="mt-2 flex items-center justify-between text-xs text-moss-600 dark:text-moss-300">
        <span>
          {t("projects.progressLabel", {
            contributed: formatHours(project.contributedHours),
            target: formatHours(project.targetHours),
            percent,
          })}
        </span>
        <span>{formatRelativeTime(project.createdAt)}</span>
      </div>
      <p className="mt-1 text-xs text-moss-500 dark:text-moss-300">
        {t("projects.byOrganizer", { name: organizerName })}
      </p>
    </Link>
  );
}

function StatusChip({ status }: { status: Project["status"] }) {
  const { t } = useTranslation();
  const map: Record<Project["status"], { label: string; cls: string }> = {
    planning: {
      label: t("projects.statusPlanning"),
      cls: "bg-moss-100 text-moss-700 dark:bg-moss-800 dark:text-moss-200",
    },
    active: {
      label: t("projects.statusActive"),
      cls: "bg-canopy-100 text-canopy-900 dark:bg-canopy-900/60 dark:text-canopy-100",
    },
    paused: {
      label: t("projects.statusPaused"),
      cls: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
    },
    completed: {
      label: t("projects.statusCompleted"),
      cls: "bg-canopy-50 text-canopy-800 dark:bg-canopy-950/40 dark:text-canopy-100",
    },
    archived: {
      label: t("projects.statusArchived"),
      cls: "bg-moss-100 text-moss-600 dark:bg-moss-900 dark:text-moss-300",
    },
  };
  const { label, cls } = map[status];
  return <span className={`chip ${cls}`}>{label}</span>;
}
