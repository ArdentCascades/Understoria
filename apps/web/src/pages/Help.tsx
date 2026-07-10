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
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FAQ_SECTIONS, type FaqEntry, type FaqSection } from "@/content/faq";
import { FAQ_SECTIONS_ES } from "@/content/faq.es";
import { HighlightedText } from "@/components/HighlightedText";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";
import {
  IconBalance,
  IconBoard,
  IconCalendar,
  IconHelp,
  IconInfrastructure,
  IconMessages,
  IconMyWork,
  IconProfile,
  type IconProps,
} from "@/components/visual";

// Task-oriented FAQ page. Answers collapse behind their questions —
// ~25 fully-expanded entries had become a wall of text, and a member
// arriving with ONE question had to scroll past every other answer
// to find it. Three doors into the content now:
//   1. section chips under the header jump to a topic;
//   2. an inline filter narrows to matching questions (and expands
//      them, with the match highlighted) as you type;
//   3. entry ids remain URL fragments (`/help#confirm-exchange`, the
//      command palette's help results) — arriving on one auto-expands
//      that entry and scrolls to it.
// "Expand all" restores the old everything-visible page — that's
// also the mode for the browser's own find-in-page, which can't see
// into collapsed answers.
//
// Locale selection: long-form FAQ prose lives outside i18n JSON.
// We pick the Spanish module when i18n.language is "es" (or an
// es-* regional variant); every other locale falls through to the
// English source so an as-yet-untranslated language degrades to
// English rather than to an empty page.

// Each section gets a marker in the house line-art style — all icons
// that already mean these things elsewhere in the app, plus
// IconBalance drawn for the one concept without a nav home.
const SECTION_ICONS: Record<string, ComponentType<IconProps>> = {
  posts: IconBoard,
  balance: IconBalance,
  identity: IconProfile,
  community: IconInfrastructure,
  messages: IconMessages,
  events: IconCalendar,
  projects: IconMyWork,
};

function sectionIcon(id: string): ComponentType<IconProps> {
  return SECTION_ICONS[id] ?? IconHelp;
}

function entryMatches(entry: FaqEntry, needle: string): boolean {
  if (entry.question.toLowerCase().includes(needle)) return true;
  return entry.answer.some((p) => p.toLowerCase().includes(needle));
}

export default function HelpPage() {
  const { t, i18n } = useTranslation();
  const sections = i18n.language?.startsWith("es")
    ? FAQ_SECTIONS_ES
    : FAQ_SECTIONS;
  const navigate = useNavigate();
  const location = useLocation();
  const reduced = useReducedMotion();

  const [query, setQuery] = useState("");
  // Which entries the member has opened by hand. A filter overrides
  // this (matches always show expanded); clearing it falls back here.
  const [openIds, setOpenIds] = useState<ReadonlySet<string>>(new Set());
  const sectionRefs = useRef(new Map<string, HTMLElement>());

  const needle = query.trim().toLowerCase();
  const filtering = needle.length > 0;

  // Deep links (`/help#confirm-exchange` — shared answers and the
  // palette's help results) must land on a VISIBLE answer: expand the
  // target entry, then scroll. <main> is the scroller, so the scroll
  // is explicit. Two effects because the target may not be rendered
  // yet — an active filter could be hiding it (palette help results
  // navigate here mid-filter; the link wins) — so the scroll runs
  // AFTER the commit that cleared the filter and expanded the entry.
  const [pendingScrollId, setPendingScrollId] = useState<string | null>(null);
  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    setQuery("");
    setOpenIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setPendingScrollId(id);
  }, [location.hash]);

  useEffect(() => {
    if (!pendingScrollId) return;
    const el = document.getElementById(pendingScrollId);
    if (!el) return;
    el.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
    setPendingScrollId(null);
  }, [pendingScrollId, reduced]);

  const visibleSections = useMemo(() => {
    if (!filtering) return sections;
    return sections
      .map((section) => ({
        ...section,
        entries: section.entries.filter((e) => entryMatches(e, needle)),
      }))
      .filter((section) => section.entries.length > 0);
  }, [sections, filtering, needle]);

  const matchCount = filtering
    ? visibleSections.reduce((n, s) => n + s.entries.length, 0)
    : 0;

  const totalEntries = useMemo(
    () => sections.reduce((n, s) => n + s.entries.length, 0),
    [sections],
  );
  const allExpanded = openIds.size >= totalEntries;

  const toggleEntry = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    setOpenIds(new Set(sections.flatMap((s) => s.entries.map((e) => e.id))));
  };
  const collapseAll = () => setOpenIds(new Set());

  const jumpToSection = (id: string) => {
    sectionRefs.current.get(id)?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <div className="px-4 pb-8 pt-4">
      <header className="mb-4">
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

      {/* Filter — plain text narrowing, entirely on-device like
          everything else. Distinct from the global palette: this
          filters THIS page in place rather than jumping elsewhere. */}
      <div className="mb-3">
        <input
          type="search"
          className="input w-full"
          aria-label={t("help.filterLabel")}
          placeholder={t("help.filterPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filtering ? (
        <p
          className="mb-4 text-sm text-moss-600 dark:text-moss-300"
          role="status"
        >
          {t("help.filterMatches", { count: matchCount })}{" "}
          <button
            type="button"
            className="text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
            onClick={() => setQuery("")}
          >
            {t("help.clearFilter")}
          </button>
        </p>
      ) : (
        <>
          {/* Topic chips — one per section, wrapped so every topic is
              visible at a glance on any width. */}
          <nav aria-label={t("help.sectionsNav")} className="mb-3">
            <ul className="flex flex-wrap gap-2">
              {sections.map((section) => {
                const Icon = sectionIcon(section.id);
                return (
                  <li key={section.id}>
                    <button
                      type="button"
                      className="chip flex items-center gap-1.5 bg-moss-100 text-moss-700 hover:bg-canopy-50 hover:text-canopy-800 dark:bg-moss-800 dark:text-moss-200 dark:hover:bg-canopy-950/40 dark:hover:text-canopy-200"
                      onClick={() => jumpToSection(section.id)}
                    >
                      <Icon size={14} />
                      {section.title}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
          <p className="mb-4 text-right">
            <button
              type="button"
              className="text-sm text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
              onClick={allExpanded ? collapseAll : expandAll}
            >
              {allExpanded ? t("help.collapseAll") : t("help.expandAll")}
            </button>
          </p>
        </>
      )}

      {filtering && matchCount === 0 ? (
        <div className="card text-center">
          <p className="font-semibold text-moss-800 dark:text-moss-100">
            {t("help.noMatchesTitle")}
          </p>
          <p className="mt-1 text-sm text-moss-600 dark:text-moss-300">
            {t("help.noMatches")}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {visibleSections.map((section: FaqSection) => {
            const Icon = sectionIcon(section.id);
            return (
              <section
                key={section.id}
                ref={(el) => {
                  if (el) sectionRefs.current.set(section.id, el);
                  else sectionRefs.current.delete(section.id);
                }}
                id={`faq-section-${section.id}`}
                className="card scroll-mt-4"
                aria-labelledby={`faq-section-${section.id}-heading`}
              >
                <h2
                  id={`faq-section-${section.id}-heading`}
                  className="mb-1 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300"
                >
                  <Icon size={18} className="shrink-0 text-canopy-700 dark:text-canopy-300" />
                  {section.title}
                </h2>
                <div className="divide-y divide-moss-100 dark:divide-moss-800">
                  {section.entries.map((entry) => {
                    // A filter shows every match opened — the member
                    // asked for these; making them click each one
                    // open again would be busywork.
                    const open = filtering || openIds.has(entry.id);
                    return (
                      <article
                        key={entry.id}
                        id={entry.id}
                        className="scroll-mt-4"
                      >
                        <h3>
                          <button
                            type="button"
                            className="touch-target flex w-full items-center justify-between gap-3 py-3 text-left text-base font-semibold text-moss-800 hover:text-canopy-800 dark:text-moss-100 dark:hover:text-canopy-200"
                            aria-expanded={open}
                            aria-controls={`${entry.id}-answer`}
                            onClick={() => toggleEntry(entry.id)}
                          >
                            <span className="min-w-0">
                              {filtering ? (
                                <HighlightedText
                                  text={entry.question}
                                  query={query}
                                />
                              ) : (
                                entry.question
                              )}
                            </span>
                            {/* Chevron flips to read as open/closed;
                                state itself is aria-expanded. */}
                            <svg
                              aria-hidden="true"
                              viewBox="0 0 24 24"
                              width={18}
                              height={18}
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={1.5}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className={`shrink-0 text-moss-600 transition-transform motion-reduce:transition-none dark:text-moss-300 ${
                                open ? "rotate-180" : ""
                              }`}
                            >
                              <path d="M6 9l6 6 6-6" />
                            </svg>
                          </button>
                        </h3>
                        {open && (
                          <div
                            id={`${entry.id}-answer`}
                            className="space-y-2 pb-3 text-sm text-moss-700 dark:text-moss-200"
                          >
                            {entry.answer.map((paragraph, i) => (
                              <p key={i}>
                                {filtering ? (
                                  <HighlightedText
                                    text={paragraph}
                                    query={query}
                                  />
                                ) : (
                                  paragraph
                                )}
                              </p>
                            ))}
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <p className="mt-6 text-sm text-moss-600 dark:text-moss-300">
        {t("help.footer")}
      </p>
    </div>
  );
}
