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

// A row in Profile's "Community & account" index linking to
// /disputes (it was a standalone card before the index landed).
// The description keeps the live open-dispute count so a member can
// tell at a glance whether anything needs the community's attention
// without opening the page — attention-on-open, not a notification.
//
// Counts open dispute proposals (kind: "dispute", status: "open"),
// matching the data shape the disputes page reads.

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
    <div className="py-2">
      <Link
        to="/disputes"
        className="-m-2 flex min-h-[44px] items-center justify-between gap-3 rounded-xl p-2 hover:bg-moss-50 dark:hover:bg-moss-900"
      >
        <div className="min-w-0 flex-1">
          <h3
            id="disputes-entry-title"
            className="text-sm font-semibold text-moss-800 dark:text-moss-100"
          >
            {t("disputes.entry.title")}
          </h3>
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
