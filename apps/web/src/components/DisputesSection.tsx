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

// Small Profile-level entry card linking to /disputes. Lives
// alongside CommunitySettingsSection because both are
// community-level concerns. The chip shows a live count so a
// member can tell at a glance whether anything needs the
// community's attention without opening the page.
//
// Counts open dispute proposals (kind: "dispute", status: "open"),
// matching the data shape the disputes page now reads.

export function DisputesSection() {
  const { proposals } = useApp();
  const { t } = useTranslation();
  const count = useMemo(
    () =>
      proposals.filter(
        (p) => p.kind === "dispute" && p.status === "open",
      ).length,
    [proposals],
  );

  return (
    <section className="card mb-4" aria-labelledby="disputes-entry-title">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2
            id="disputes-entry-title"
            className="mb-1 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300"
          >
            {t("disputes.entry.title")}
          </h2>
          <p className="text-sm text-moss-600 dark:text-moss-300">
            {count === 0
              ? t("disputes.entry.descriptionNone")
              : t(
                  count === 1
                    ? "disputes.entry.descriptionOne"
                    : "disputes.entry.descriptionOther",
                  { count },
                )}
          </p>
        </div>
        <Link to="/disputes" className="btn-secondary shrink-0 text-sm">
          {t("disputes.entry.open")}
        </Link>
      </div>
    </section>
  );
}
