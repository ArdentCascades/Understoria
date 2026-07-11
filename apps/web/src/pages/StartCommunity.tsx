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
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { START_COMMUNITY } from "@/content/startCommunity";
import { START_COMMUNITY_ES } from "@/content/startCommunity.es";

// The in-app walkthrough for starting a NEW community from an
// existing node — served by the node itself, so the person who most
// needs it (no GitHub account, maybe no idea what GitHub is) reads
// it in the app they already trust. Doorways: the infrastructure
// page's "The software itself" card and the Help FAQ. The
// repo/tarball twin is docs/bootstrap-from-a-node.md.
//
// Locale selection matches Help: long-form prose lives in content
// modules; unknown languages degrade to English rather than to an
// empty page.

export default function StartCommunityPage() {
  const { t, i18n } = useTranslation();
  const guide = i18n.language?.startsWith("es")
    ? START_COMMUNITY_ES
    : START_COMMUNITY;
  const navigate = useNavigate();

  return (
    <div className="px-4 pb-8 pt-4">
      <header className="mb-4">
        <button
          type="button"
          className="btn-ghost -ml-2 text-sm"
          onClick={() => navigate(-1)}
        >
          ← {t("common.back")}
        </button>
        <h1 className="page-title mt-1">{t("startCommunity.title")}</h1>
        <p className="text-sm text-moss-600 dark:text-moss-300">
          {t("startCommunity.subtitle")}
        </p>
      </header>

      <div className="card mb-4 space-y-2 text-sm text-moss-700 dark:text-moss-200">
        {guide.intro.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        <p>
          <Link
            to="/infrastructure"
            className="font-medium text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
          >
            {t("startCommunity.toDownloads")} →
          </Link>
        </p>
      </div>

      <div className="space-y-4">
        {guide.steps.map((step) => (
          <section
            key={step.id}
            id={step.id}
            aria-labelledby={`start-${step.id}`}
            className="card scroll-mt-4"
          >
            <h2
              id={`start-${step.id}`}
              className="mb-2 text-base font-semibold text-moss-800 dark:text-moss-100"
            >
              {step.title}
            </h2>
            <div className="space-y-2 text-sm text-moss-700 dark:text-moss-200">
              {step.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              {step.code?.map((block, i) => (
                // Commands stay verbatim and horizontally scrollable —
                // wrapping a shell line changes its meaning.
                <pre
                  key={`code-${i}`}
                  className="overflow-x-auto rounded-lg bg-moss-950 p-3 text-xs leading-relaxed text-moss-100"
                >
                  <code>{block}</code>
                </pre>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-4 space-y-2 text-sm text-moss-600 dark:text-moss-300">
        {guide.closing.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  );
}
