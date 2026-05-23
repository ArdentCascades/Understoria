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

// Small Profile-level entry card linking to /proposals. Lives next
// to CommunitySettingsSection because both are community-level
// concerns — and once Agent 13 voting lands, settings changes will
// route through proposals rather than direct edit.

export function ProposalsSection() {
  const { proposals } = useApp();
  const { t } = useTranslation();
  const openCount = proposals.filter((p) => p.status === "open").length;

  return (
    <section className="card mb-4" aria-labelledby="proposals-entry-title">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2
            id="proposals-entry-title"
            className="mb-1 text-sm font-semibold uppercase tracking-wide text-moss-500"
          >
            {t("proposals.entry.title")}
          </h2>
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
        <Link to="/proposals" className="btn-secondary shrink-0 text-sm">
          {t("proposals.entry.open")}
        </Link>
      </div>
    </section>
  );
}
