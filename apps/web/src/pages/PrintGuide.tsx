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
import { useTranslation } from "react-i18next";
import { FAQ_SECTIONS } from "@/content/faq";
import { FAQ_SECTIONS_ES } from "@/content/faq.es";
import { resolveGuideEntries } from "@/lib/printGuide";
import { PrintFooter, PrintToolbar } from "@/components/PrintChrome";

// The field guide (paper-systems P5): the what-is-this one-pager
// for tabling at markets and mutual-aid fairs — a curated projection
// of the FAQ (content stays in content/faq*.ts; the two can never
// drift), ending in an invite-shaped call to action. Two-column at
// print so it folds like a zine.
export default function PrintGuidePage() {
  const { t, i18n } = useTranslation();
  const es = i18n.resolvedLanguage?.startsWith("es") ?? false;

  const entries = useMemo(
    () => resolveGuideEntries(es ? FAQ_SECTIONS_ES : FAQ_SECTIONS).entries,
    [es],
  );

  return (
    <div className="px-4 pb-8 pt-6 print:bg-white print:px-0 print:pb-0 print:pt-0 print:text-black">
      <PrintToolbar />

      <h1 className="page-title print:text-black">
        {t("print.guide.title")}
      </h1>
      <p className="mt-1 text-sm font-medium text-moss-700 dark:text-moss-200 print:text-black">
        {window.location.host} · {t("print.guide.tagline")}
      </p>

      <div className="mt-6 gap-8 sm:columns-2">
        {entries.map((entry) => (
          <section
            key={entry.id}
            className="mb-4"
            style={{ breakInside: "avoid" }}
          >
            <h2 className="text-sm font-semibold print:text-black">
              {entry.question}
            </h2>
            {entry.answer.map((paragraph, i) => (
              <p
                key={i}
                className="mt-1 text-sm text-moss-700 dark:text-moss-200 print:text-black"
              >
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>

      <p className="mt-6 border-t border-moss-300 pt-3 text-sm font-medium text-moss-700 dark:border-moss-700 dark:text-moss-200 print:border-black/30 print:text-black">
        {t("print.guide.cta")}
      </p>

      <PrintFooter />
    </div>
  );
}
