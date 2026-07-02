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
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { getEventTemplates, type EventTemplate } from "@/content/eventTemplates";

// Gallery of camaraderie event templates shown above the "Create event"
// form. Picking one pre-fills the form below; "Start from scratch" leaves
// it blank. The event analog of TemplatePicker, but simpler: no
// setup-time bucket (events carry a duration, not setup hours) and NO
// usage / "already in your community" ribbon — an event-template
// popularity count is exactly the no-leaderboards signal we forbid.

/** "240" → "4h", "90" → "1h 30m", "45" → "45m". A friendly,
 *  locale-agnostic chip; the member edits the real end time freely. */
function humanizeDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function EventTemplatePicker({
  selectedId,
  onSelect,
  layout = "default",
}: {
  selectedId: string | null;
  onSelect: (templateId: string | null) => void;
  /** "default" renders the gallery's responsive grid (1/2/3 columns
   *  by breakpoint); "rail" forces single-column for when the picker
   *  is docked in a narrow side rail (e.g. EventNew at lg+, where the
   *  rail is ~380px and 3-up would crush each card). Mirrors
   *  TemplatePicker's prop of the same name. */
  layout?: "default" | "rail";
}) {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? "en";
  const templates = getEventTemplates(lang);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  // ~200ms debounce, matching TemplatePicker / the Board search.
  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedQuery(query), 200);
    return () => window.clearTimeout(id);
  }, [query]);

  const visible = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return templates;
    return templates.filter(
      (tpl) =>
        tpl.name.toLowerCase().includes(q) ||
        tpl.blurb.toLowerCase().includes(q),
    );
  }, [templates, debouncedQuery]);

  return (
    <section className="mb-6">
      <h2 className="text-heading mb-1 font-semibold">
        {t("events.templates.title")}
      </h2>
      <p className="mb-3 text-sm text-moss-600 dark:text-moss-300">
        {t("events.templates.intro")}
      </p>
      <div className="mb-3">
        <input
          type="search"
          className="input w-full"
          placeholder={t("events.templates.filters.search.placeholder")}
          aria-label={t("events.templates.filters.search.ariaLabel")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <ul
        className={`grid gap-3 ${
          layout === "rail"
            ? "grid-cols-1"
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        }`}
      >
        {visible.length === 0 ? (
          <li className="col-span-full text-sm text-moss-600 dark:text-moss-300">
            {t("events.templates.filters.empty")}
          </li>
        ) : (
          visible.map((tpl) => (
            <li key={tpl.id}>
              <EventTemplateCard
                template={tpl}
                isSelected={selectedId === tpl.id}
                onSelect={() => onSelect(tpl.id)}
              />
            </li>
          ))
        )}
        <li>
          <ScratchCard
            isSelected={selectedId === null}
            onSelect={() => onSelect(null)}
          />
        </li>
      </ul>
    </section>
  );
}

function EventTemplateCard({
  template,
  isSelected,
  onSelect,
}: {
  template: EventTemplate;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={`card flex h-full w-full flex-col gap-2 p-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-canopy-500 ${
        isSelected
          ? "ring-2 ring-canopy-500 dark:ring-canopy-400"
          : "hover:border-canopy-300 dark:hover:border-canopy-700"
      }`}
    >
      <span className="font-semibold text-canopy-900 dark:text-canopy-100">
        <span aria-hidden="true" className="mr-1.5">
          {template.emoji}
        </span>
        {template.name}
      </span>
      <span className="text-sm text-moss-600 dark:text-moss-300">
        {template.blurb}
      </span>
      <span className="mt-auto pt-2 text-xs text-moss-600 dark:text-moss-300">
        {t("events.templates.meta.duration", {
          duration: humanizeDuration(template.suggestedDurationMinutes),
        })}
      </span>
    </button>
  );
}

function ScratchCard({
  isSelected,
  onSelect,
}: {
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={`flex h-full w-full flex-col gap-2 rounded-lg border-2 border-dashed p-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-canopy-500 ${
        isSelected
          ? "border-canopy-500 bg-canopy-50/40 dark:border-canopy-400 dark:bg-canopy-950/30"
          : "border-bark-300 hover:border-canopy-300 dark:border-bark-700 dark:hover:border-canopy-700"
      }`}
    >
      <span className="font-semibold text-moss-700 dark:text-moss-200">
        {t("events.templates.scratch")}
      </span>
      <span className="text-sm text-moss-600 dark:text-moss-300">
        {t("events.templates.scratchHint")}
      </span>
    </button>
  );
}
