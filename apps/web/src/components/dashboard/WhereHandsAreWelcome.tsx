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
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import { projectNeedsMoreHands } from "@/lib/projectFilter";
import { WhyTooltip } from "@/components/WhyTooltip";

// "Where hands are welcome" — the second instance of the Coming-up
// pattern (see UpcomingGatherings): a small, capped, self-hiding
// Dashboard glance that offers doorways, never pressure.
//
// The rules this section holds itself to:
//   - UNRANKED: items are ordered by plain recency, never by urgency,
//     staleness, or "most neglected" — any cleverness in the ordering
//     would turn an invitation into a triage queue.
//   - CAPPED: at most 3 items, needs and projects mixed. A glance,
//     not a backlog; the Board is one tap away for the full picture.
//   - SELF-HIDING: renders null when there is nothing to offer — a
//     calm week gets a calm page (the Coming-up rule).
//   - NO COUNTS: no "N more" totals, no badges — a count is one
//     font-weight away from an alert.
export function WhereHandsAreWelcome() {
  const { t } = useTranslation();
  const { posts, projects, projectTasks, nodeConfig } = useApp();

  const items = useMemo(() => {
    const now = Date.now();
    const openNeeds = posts
      .filter((p) => p.type === "NEED" && p.status === "open")
      .map((p) => ({
        key: `post-${p.id}`,
        title: p.title,
        createdAt: p.createdAt,
        to: `/post/${p.id}`,
        kind: "need" as const,
      }));
    // Same helper the Board's "Could use more hands" filter uses
    // (lib/projectFilter.ts) — the state machine there already
    // protects responsive claimers and dependency-sequenced tasks,
    // so this surface inherits its solidarity-not-shame guarantees.
    const welcomingProjects = projects
      .filter(
        (p) =>
          p.status === "active" &&
          projectNeedsMoreHands(p.id, projectTasks, nodeConfig, now),
      )
      .map((p) => ({
        key: `project-${p.id}`,
        title: p.title,
        createdAt: p.createdAt,
        to: `/project/${p.id}`,
        kind: "project" as const,
      }));
    // Newest-first, matching the Board's own default ordering
    // (posts are live-queried createdAt-desc). Recency is the one
    // ordering a member can verify at a glance; oldest-first would
    // quietly become a "most neglected" ranking, which is exactly
    // the pressure this section refuses to apply.
    return [...openNeeds, ...welcomingProjects]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 3);
  }, [posts, projects, projectTasks, nodeConfig]);

  if (items.length === 0) return null;

  return (
    <section className="card mb-4">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
        {t("dashboard.handsWelcome.title")}
        <WhyTooltip principleId="no-leaderboards" />
      </h2>
      <p className="mb-2 text-xs text-moss-600 dark:text-moss-300">
        {t("dashboard.handsWelcome.intro")}
      </p>
      {/* Single column at every width: this card now lives in the
          desktop dashboard's 320px rail, where one line per entry is
          the honest fit (the brief two-column interlude assumed a
          half-page card). */}
      <ul className="flex flex-col gap-0.5">
        {items.map((item) => (
          <li key={item.key}>
            <Link
              to={item.to}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-moss-50 dark:hover:bg-moss-900"
            >
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {item.title}
              </span>
              <span className="whitespace-nowrap text-xs text-moss-600 dark:text-moss-300">
                {t(
                  item.kind === "need"
                    ? "dashboard.handsWelcome.typeNeed"
                    : "dashboard.handsWelcome.typeProject",
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
