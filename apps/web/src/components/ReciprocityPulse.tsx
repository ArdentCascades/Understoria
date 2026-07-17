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
import { EmptyState } from "@/components/EmptyState";

interface ReciprocityPulseProps {
  reciprocalPairs: number;
  totalPairs: number;
}

export function ReciprocityPulse({
  reciprocalPairs,
  totalPairs,
}: ReciprocityPulseProps) {
  const { t } = useTranslation();
  const percent =
    totalPairs === 0 ? 0 : Math.round((reciprocalPairs / totalPairs) * 100);

  return (
    <section className="card mb-4" aria-labelledby="reciprocity-title">
      <h2
        id="reciprocity-title"
        className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300"
      >
        {t("dashboard.reciprocity.title")}
      </h2>
      <p className="mb-3 text-sm text-moss-600 dark:text-moss-300">
        {t("dashboard.reciprocity.intro")}
      </p>
      {totalPairs === 0 ? (
        <EmptyState
          illustration="hands"
          variant="inset"
          title={t("dashboard.reciprocity.emptyTitle")}
          message={t("dashboard.reciprocity.empty")}
        />
      ) : reciprocalPairs === 0 ? (
        // The state every young community lives in for weeks: help is
        // flowing, just not back along the same pairs yet. A big "0%"
        // under real exchange totals reads as a broken counter
        // (usability report), so this renders a warm sentence and no
        // percent at all.
        <p className="text-sm">
          {t("dashboard.reciprocity.oneWaySoFar", { count: totalPairs })}
        </p>
      ) : (
        <div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-canopy-700 dark:text-canopy-300">
              {percent}%
            </span>
            <span className="text-sm text-moss-600 dark:text-moss-300">
              {t("dashboard.reciprocity.rate", {
                reciprocal: reciprocalPairs,
                total: totalPairs,
              })}
            </span>
          </div>
          <div
            className="mt-3 h-2 overflow-hidden rounded-full bg-moss-100 dark:bg-moss-800"
            aria-hidden="true"
          >
            <div
              className="h-full rounded-full bg-canopy-600"
              style={{ width: `${Math.max(2, percent)}%` }}
            />
          </div>
        </div>
      )}
      <p className="mt-3 text-xs text-moss-600 dark:text-moss-300">
        {t("dashboard.reciprocity.footnote")}
      </p>
    </section>
  );
}
