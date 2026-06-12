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
import { useTranslation } from "react-i18next";
import type { BreadthEntry } from "@/lib/flow";
import type { Member } from "@/types";
import { EmptyState } from "@/components/EmptyState";

interface BreadthBarProps {
  entries: readonly BreadthEntry[];
  members: readonly Member[];
  /** How many rows to render explicitly. The rest are summarised in
   *  a footnote. Default 5 — small enough to feel like a *pattern*
   *  rather than a ranking. */
  topN?: number;
}

export function BreadthBar({ entries, members, topN = 5 }: BreadthBarProps) {
  const { t } = useTranslation();
  const nameByKey = new Map(members.map((m) => [m.publicKey, m.displayName]));

  if (entries.length === 0) {
    return (
      <section className="card mb-4" aria-labelledby="breadth-title">
        <Header />
        <EmptyState
          illustration="none"
          variant="inset"
          message={t("dashboard.breadth.empty")}
        />
      </section>
    );
  }

  const shown = entries.slice(0, topN);
  const max = shown[0]?.uniqueHelpedCount ?? 0;
  const moreCount = Math.max(0, entries.length - shown.length);

  return (
    <section className="card mb-4" aria-labelledby="breadth-title">
      <Header />
      <p className="mb-3 text-sm text-moss-600 dark:text-moss-300">
        {t("dashboard.breadth.intro")}
      </p>
      <ul className="flex flex-col gap-2">
        {shown.map((e) => {
          const name = nameByKey.get(e.memberKey) ?? t("common.memberFallback");
          const pct = max === 0 ? 0 : (e.uniqueHelpedCount / max) * 100;
          return (
            <li
              key={e.memberKey}
              className="flex items-center gap-3"
              aria-label={t("dashboard.breadth.rowLabel", {
                name,
                count: e.uniqueHelpedCount,
              })}
            >
              <span className="w-28 shrink-0 truncate text-sm">{name}</span>
              <div
                className="h-2 flex-1 overflow-hidden rounded-full bg-moss-100 dark:bg-moss-800"
                aria-hidden="true"
              >
                <div
                  className="h-full rounded-full bg-canopy-600"
                  style={{ width: `${Math.max(6, pct)}%` }}
                />
              </div>
              <span className="w-12 shrink-0 text-right text-xs text-moss-600 dark:text-moss-300">
                {e.uniqueHelpedCount}
              </span>
            </li>
          );
        })}
      </ul>
      {moreCount > 0 && (
        <p className="mt-3 text-xs text-moss-600 dark:text-moss-300">
          {t("dashboard.breadth.moreNote", {
            count: moreCount,
            noun:
              moreCount === 1
                ? t("dashboard.breadth.personSingular")
                : t("dashboard.breadth.personPlural"),
          })}
        </p>
      )}
    </section>
  );
}

function Header() {
  const { t } = useTranslation();
  return (
    <h2
      id="breadth-title"
      className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300"
    >
      {t("dashboard.breadth.title")}
    </h2>
  );
}
