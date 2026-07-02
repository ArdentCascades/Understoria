/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import { BackLink } from "@/components/BackLink";
import { ProjectCard } from "@/components/ProjectCard";
import { EmptyState } from "@/components/EmptyState";
import { computeProjectClosure } from "@/lib/projectClosure";
import { formatHours } from "@/lib/format";

export default function ProjectArchivePage() {
  const { projects, projectTasks, members, exchanges } = useApp();
  const { t } = useTranslation();

  const memberName = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of members) map.set(m.publicKey, m.displayName);
    return map;
  }, [members]);

  const archived = useMemo(
    () =>
      projects
        .filter((p) => p.status === "completed" || p.status === "archived")
        .sort((a, b) => (b.completedAt ?? b.createdAt) - (a.completedAt ?? a.createdAt)),
    [projects],
  );

  const tasksByProject = useMemo(() => {
    const map = new Map<string, { total: number; open: number }>();
    for (const t of projectTasks) {
      const entry = map.get(t.projectId) ?? { total: 0, open: 0 };
      entry.total += 1;
      if (t.status === "open") entry.open += 1;
      map.set(t.projectId, entry);
    }
    return map;
  }, [projectTasks]);

  return (
    <div className="px-4 pb-8 pt-4">
      <header className="mb-4">
        {/* Named parent: the projects tab is where the archive is
            reached from. History-aware so the tab's scroll/filter
            state is restored when it's actually the previous entry. */}
        <BackLink
          to="/?tab=projects"
          label={t("projects.detail.back")}
          preferHistory
          className="btn-ghost -ml-2 text-sm"
        />
        <h1 className="page-title mt-2">
          {t("projects.archive.title")}
        </h1>
        <p className="text-sm text-moss-600 dark:text-moss-300">
          {t("projects.archive.subtitle")}
        </p>
      </header>
      {archived.length === 0 ? (
        <EmptyState
          illustration="book"
          title={t("projects.archive.emptyTitle")}
          message={t("projects.archive.empty")}
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {archived.map((p) => {
            const counts = tasksByProject.get(p.id) ?? { total: 0, open: 0 };
            // Aggregate-only, from the signed ledger; omitted entirely
            // when no one moved hours (a zero tally is shame-shaped).
            const closure = computeProjectClosure({ project: p, exchanges });
            const closureLine =
              closure.contributorCount > 0
                ? t("projects.completionMoment.cardLine", {
                    count: closure.contributorCount,
                    hours: formatHours(closure.hoursMoved),
                  })
                : undefined;
            return (
              <li key={p.id}>
                <ProjectCard
                  project={p}
                  organizerName={memberName.get(p.organizerKey) ?? "Member"}
                  taskCount={counts.total}
                  openTaskCount={counts.open}
                  closureLine={closureLine}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
