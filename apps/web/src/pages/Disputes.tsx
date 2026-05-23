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
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import { listDisputes } from "@/lib/disputes";
import { formatHours, formatRelativeTime, shortKey } from "@/lib/format";
import { CategoryBadge } from "@/components/CategoryBadge";
import { EmptyState } from "@/components/EmptyState";

// Community-visible list of exchanges that someone has flagged for
// review. Read-only for v1: a place to see what's been flagged so
// the community can talk about it (on whatever channel they use)
// and so we can ground the Agent 12 sanction-ladder design against
// real cases before building the resolution lifecycle.
//
// Per GOVERNANCE.md: no admins, no role-gated access. Every member
// of this node can see what's been flagged. The two parties already
// see it on the post detail page; this surface just makes it
// findable.

export default function DisputesPage() {
  const { posts, members } = useApp();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const disputes = useMemo(() => listDisputes(posts, members), [posts, members]);

  return (
    <div className="px-4 pb-8 pt-4">
      <header className="mb-6">
        <button
          type="button"
          className="btn-ghost -ml-2 text-sm"
          onClick={() => navigate(-1)}
        >
          {t("common.back")}
        </button>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">
          {t("disputes.title")}
        </h1>
        <p className="text-sm text-moss-600 dark:text-moss-300">
          {t("disputes.subtitle")}
        </p>
      </header>

      {disputes.length === 0 ? (
        <EmptyState
          icon={"\u{1F33F}"}
          message={t("disputes.empty")}
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {disputes.map((d) => (
            <li key={d.postId}>
              <article className="card">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="chip bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-100">
                    {t("disputes.flagChip")}
                  </span>
                  <span className="chip bg-moss-100 text-moss-700 dark:bg-moss-800 dark:text-moss-200">
                    {d.postType === "NEED"
                      ? t("disputes.typeNeed")
                      : t("disputes.typeOffer")}
                  </span>
                  <CategoryBadge category={d.category} />
                  <span className="chip bg-canopy-50 text-canopy-900 dark:bg-canopy-950/50 dark:text-canopy-100">
                    {formatHours(d.hours)}
                  </span>
                </div>
                <h2 className="text-lg font-semibold leading-snug">
                  {d.postTitle}
                </h2>
                <dl className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-moss-500">
                      {t("disputes.helperLabel")}
                    </dt>
                    <dd className="mt-0.5">
                      {d.helperName
                        ? `${d.helperName} (${shortKey(d.helperKey!)})`
                        : t("common.memberFallback")}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-moss-500">
                      {t("disputes.recipientLabel")}
                    </dt>
                    <dd className="mt-0.5">
                      {`${d.recipientName} (${shortKey(d.recipientKey)})`}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-moss-500">
                      {t("disputes.postedLabel")}
                    </dt>
                    <dd className="mt-0.5">{formatRelativeTime(d.createdAt)}</dd>
                  </div>
                </dl>
                <div className="mt-4 flex justify-end">
                  <Link
                    to={`/post/${d.postId}`}
                    className="btn-secondary text-sm"
                  >
                    {t("disputes.viewPost")}
                  </Link>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6 text-sm text-moss-600 dark:text-moss-300">
        {t("disputes.footer")}
      </p>
    </div>
  );
}
