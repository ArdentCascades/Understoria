/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program. If not, see
 * <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import { shareOrigin } from "@/lib/appOrigin";
import { filterBoardPosts } from "@/lib/boardFilter";
import { formatHours } from "@/lib/format";
import { InviteQRCode } from "@/components/InviteQRCode";
import {
  PrintFooter,
  PrintToolbar,
  TearOffStrip,
} from "@/components/PrintChrome";
import type { Category, Urgency } from "@/types";

// The printable board sheet (docs/desktop-power-tools.md plan 5;
// docs/offline-resilience.md §5's shelter-lobby bulletin board). The
// Board's "Print this view" link lands here with the member's
// CURRENT tab + filters in the query string — the filters ARE the
// selection mechanism; there is no separate multi-select UI. The
// list is recomputed with the exact predicate the Board uses
// (lib/boardFilter.ts), so what prints is what was on screen.
//
// Each row carries a QR to its post's canonical /post/:id URL, so a
// phone at the bulletin board lands on the live post — where
// claiming, and every consent rule around it, still happens in app.
export default function PrintBoardPage() {
  const { posts } = useApp();
  const [params] = useSearchParams();
  const { t } = useTranslation();

  const type = params.get("tab") === "offers" ? "OFFER" : "NEED";
  const category = (params.get("cat") ?? "") as Category | "";
  const urgency = (params.get("urg") ?? "") as Urgency | "";
  const zone = params.get("zone") ?? "";
  const query = params.get("q") ?? "";
  const includeClaimed = params.get("claimed") === "1";

  const visible = useMemo(() => {
    const matching = filterBoardPosts(posts, {
      type,
      category,
      urgency,
      zone,
      query,
    });
    return includeClaimed
      ? matching
      : matching.filter((p) => p.claimedBy === null);
  }, [posts, type, category, urgency, zone, query, includeClaimed]);

  // Name only the filters that are actually narrowing the sheet, so
  // a reader knows this is a slice, not the whole board.
  const filterSummary = [
    category ? t(`categories.${category}`) : null,
    urgency ? t(`urgency.${urgency}`) : null,
    zone || null,
    query.trim() ? `"${query.trim()}"` : null,
  ].filter(Boolean);

  return (
    <div className="px-4 pb-8 pt-6 print:bg-white print:px-0 print:pb-0 print:pt-0 print:text-black">
      <PrintToolbar />

      <h1 className="page-title print:text-black">
        {t(type === "OFFER" ? "print.board.titleOffers" : "print.board.titleNeeds")}
      </h1>
      <p className="mt-1 text-sm text-moss-700 dark:text-moss-200 print:text-black">
        {new URL(shareOrigin()).host}
        {filterSummary.length > 0 && (
          <> · {t("print.board.filtered", { filters: filterSummary.join(" · ") })}</>
        )}
      </p>

      {visible.length === 0 ? (
        <p className="mt-6 text-sm text-moss-600 dark:text-moss-300 print:text-black">
          {t("print.board.empty")}
        </p>
      ) : (
        <ul className="mt-6 flex flex-col">
          {visible.map((p) => (
            <li
              key={p.id}
              // break-inside-avoid: a row split across two paper
              // pages separates a QR from its title.
              className="flex items-start justify-between gap-4 border-t border-moss-200 py-4 first:border-t-0 dark:border-moss-800 print:border-black/20"
              style={{ breakInside: "avoid" }}
            >
              <div className="min-w-0">
                <h2 className="text-base font-semibold print:text-black">
                  {p.title}
                </h2>
                <p className="mt-0.5 text-xs text-moss-600 dark:text-moss-300 print:text-black">
                  {t(`categories.${p.category}`)}
                  {p.locationZone ? ` · ${p.locationZone}` : ""}
                  {` · ${formatHours(p.estimatedHours)}`}
                </p>
                {p.description && (
                  <p className="mt-1 line-clamp-3 max-w-prose text-sm text-moss-700 dark:text-moss-200 print:text-black">
                    {p.description}
                  </p>
                )}
              </div>
              <div className="shrink-0">
                <InviteQRCode
                  value={`${shareOrigin()}/post/${p.id}`}
                  size={96}
                  ariaLabel={t("print.board.qrAria", { title: p.title })}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Tear-off tabs (P6): one per post so someone hurrying past
          takes a need home. Capped — a strip only works as a strip. */}
      <TearOffStrip
        tabs={visible.slice(0, 8).map((p) => ({
          value: `${shareOrigin()}/post/${p.id}`,
          label: p.title,
        }))}
        qrAriaLabel={t("print.tabs.qrAria")}
      />

      <PrintFooter />
    </div>
  );
}
