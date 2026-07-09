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
import { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FAQ_SECTIONS } from "@/content/faq";
import { FAQ_SECTIONS_ES } from "@/content/faq.es";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";

// Task-oriented FAQ page. Each entry's id becomes a URL fragment
// (`/help#confirm-exchange`) so members can share specific
// answers. On mount we honour the fragment by scrolling the
// matching <section> into view.
//
// Locale selection: long-form FAQ prose lives outside i18n JSON.
// We pick the Spanish module when i18n.language is "es" (or an
// es-* regional variant); every other locale falls through to the
// English source so an as-yet-untranslated language degrades to
// English rather than to an empty page.

export default function HelpPage() {
  const { t, i18n } = useTranslation();
  const sections = i18n.language?.startsWith("es")
    ? FAQ_SECTIONS_ES
    : FAQ_SECTIONS;
  const navigate = useNavigate();
  const location = useLocation();
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({
        behavior: reduced ? "auto" : "smooth",
        block: "start",
      });
    }
  }, [location.hash, reduced]);

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
        <h1 className="page-title mt-2">
          {t("help.title")}
        </h1>
        <p className="text-sm text-moss-600 dark:text-moss-300">
          {t("help.subtitle")}
        </p>
        {/* Paper systems P5: the tabling one-pager, projected from
            these same FAQ entries. */}
        <Link
          to="/print/guide"
          className="mt-1 inline-block text-sm text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
        >
          {t("print.guide.link")}
        </Link>
      </header>

      <div className="space-y-6">
        {sections.map((section) => (
          <section key={section.id} className="card" aria-labelledby={`faq-section-${section.id}`}>
            <h2
              id={`faq-section-${section.id}`}
              className="mb-3 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300"
            >
              {section.title}
            </h2>
            <div className="space-y-5">
              {section.entries.map((entry) => (
                <article
                  key={entry.id}
                  id={entry.id}
                  className="scroll-mt-4"
                >
                  <h3 className="mb-2 text-base font-semibold text-moss-800 dark:text-moss-100">
                    {entry.question}
                  </h3>
                  <div className="space-y-2 text-sm text-moss-700 dark:text-moss-200">
                    {entry.answer.map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-6 text-sm text-moss-600 dark:text-moss-300">
        {t("help.footer")}
      </p>
    </div>
  );
}
