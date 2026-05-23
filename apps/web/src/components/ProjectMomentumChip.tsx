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
import type { MomentumState } from "@/lib/projectMomentum";

interface ProjectMomentumChipProps {
  state: MomentumState;
  hoursLast7Days: number;
}

// Small status chip that summarises momentum without naming names.
// The breadth/reciprocity sections do the relational summary; this
// one is about the project's pace.

const COLORS: Record<MomentumState, string> = {
  humming:
    "bg-canopy-100 text-canopy-800 dark:bg-canopy-900/60 dark:text-canopy-100",
  active:
    "bg-canopy-50 text-canopy-700 dark:bg-canopy-900/40 dark:text-canopy-200",
  stalled:
    "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-100",
  completed:
    "bg-moss-100 text-moss-700 dark:bg-moss-900/60 dark:text-moss-100",
  paused:
    "bg-moss-50 text-moss-600 dark:bg-moss-900/40 dark:text-moss-300",
  planning:
    "bg-moss-50 text-moss-600 dark:bg-moss-900/40 dark:text-moss-300",
  archived:
    "bg-moss-50 text-moss-600 dark:bg-moss-900/40 dark:text-moss-300",
};

export function ProjectMomentumChip({
  state,
  hoursLast7Days,
}: ProjectMomentumChipProps) {
  const { t } = useTranslation();
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${COLORS[state]}`}
    >
      <span>{t(`projects.momentum.${state}`)}</span>
      {state === "humming" || state === "active" || state === "stalled" ? (
        <span aria-hidden="true">·</span>
      ) : null}
      {state === "humming" || state === "active" || state === "stalled" ? (
        <span>
          {t("projects.momentum.last7Days", { hours: hoursLast7Days })}
        </span>
      ) : null}
    </span>
  );
}
