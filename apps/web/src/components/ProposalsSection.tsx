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
import { useApp } from "@/state/AppContext";

// A row in Profile's "Community & account" index linking to
// /proposals (it was a standalone card before the index landed).
// Once Agent 13 voting lands, settings changes will route through
// proposals rather than direct edit.
//
// The open-count chip is attention-on-open — a fact about what the
// community is deciding right now — not a notification; it never
// pulses, pushes, or demands.

export function ProposalsSection() {
  const { proposals } = useApp();
  const { t } = useTranslation();
  const openCount = proposals.filter((p) => p.status === "open").length;

  return (
    <div className="py-2">
      <Link
        to="/proposals"
        className="-m-2 flex min-h-[44px] items-center justify-between gap-3 rounded-xl p-2 hover:bg-moss-50 dark:hover:bg-moss-900"
      >
        <div className="min-w-0 flex-1">
          <h3
            id="proposals-entry-title"
            className="flex items-center gap-2 text-sm font-semibold text-moss-800 dark:text-moss-100"
          >
            {t("proposals.entry.title")}
            {openCount > 0 && (
              <span className="chip bg-canopy-50 text-canopy-900 dark:bg-canopy-950/50 dark:text-canopy-100">
                {openCount}
              </span>
            )}
          </h3>
          <p className="text-sm text-moss-600 dark:text-moss-300">
            {openCount === 0
              ? t("proposals.entry.descriptionNone")
              : t(
                  openCount === 1
                    ? "proposals.entry.descriptionOne"
                    : "proposals.entry.descriptionOther",
                  { count: openCount },
                )}
          </p>
        </div>
        <span
          aria-hidden="true"
          className="shrink-0 text-lg text-moss-400 dark:text-moss-500"
        >
          ›
        </span>
      </Link>
    </div>
  );
}
