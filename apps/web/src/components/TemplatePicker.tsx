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
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { CategoryBadge } from "@/components/CategoryBadge";
import {
  getProjectTemplates,
  type ProjectTemplate,
} from "@/content/projectTemplates";
import {
  matchesTemplate,
  partitionTemplates,
  type SetupBucket,
} from "@/lib/templateFilter";
import type { Project, ProjectCategory } from "@/types";

interface TemplatePickerProps {
  selectedId: string | null;
  onSelect: (templateId: string | null) => void;
  /** "default" renders the gallery's responsive grid
   *  (1/2/3 columns by breakpoint); "rail" forces single-column for
   *  when the picker is docked in a narrow side rail (e.g. ProjectNew
   *  at lg+, where the rail is ~380px and 3-up would crush each card). */
  layout?: "default" | "rail";
  /** Map of templateId → active community projects using that
   *  template. Computed by the parent and passed down so the helper
   *  isn't called per-render or per-card. When omitted (or a card's
   *  templateId isn't in the map), the chip is suppressed entirely —
   *  TemplatePicker stays usable in contexts that don't have project
   *  data. */
  activeProjectsByTemplate?: Map<string, Project[]>;
}

/**
 * Gallery of starter community-project templates shown above the
 * Start-a-project form. The selected template pre-fills the form
 * below; "Start from scratch" leaves everything blank. Templates are
 * friendly defaults, not prescriptions — every field is editable
 * before the project is created.
 *
 * When usage data shows at least one template already in use, a
 * two-tab split ("New ideas" / "In your community") groups the gallery;
 * without usage (or without data) the tabs stay hidden and the gallery
 * renders whole. The filter row (search + category + setup-time)
 * narrows the gallery — or the active tab — in-place. State is
 * session-only — defaults are empty filters, so the
 * gallery looks unchanged until a member starts narrowing. The
 * "Start from scratch" affordance renders FIRST — a compact row above
 * the filters — so it is reachable with zero scrolling no matter how
 * large the gallery grows (pilot report: with the card at the tail,
 * every added template pushed the blank option further away). It is
 * deliberately lighter-weight than the template cards so the gallery
 * keeps its show-what's-possible role.
 */
export function TemplatePicker({
  selectedId,
  onSelect,
  layout = "default",
  activeProjectsByTemplate,
}: TemplatePickerProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? "en";
  const templates = getProjectTemplates(lang);

  // Filter state. All three default to "no filter"; the gallery looks
  // unchanged until a member starts narrowing.
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [category, setCategory] = useState<ProjectCategory | "">("");
  const [setupBucket, setSetupBucket] = useState<SetupBucket | "">("");

  // Session-only tab state. Tabs split the gallery into templates no
  // active community project uses ("fresh") and ones already in use;
  // they only render when the split is non-trivial (some usage AND
  // usage data was supplied), so contexts without project data — and
  // zero-usage communities — see the gallery exactly as before.
  const [tab, setTab] = useState<"fresh" | "inUse">("fresh");
  const { fresh, inUse } = useMemo(
    () => partitionTemplates(templates, activeProjectsByTemplate),
    [templates, activeProjectsByTemplate],
  );
  const showTabs = inUse.length > 0;

  // ~200 ms debounce on the search input — matches the Board's pattern
  // (small enough to feel live, long enough to skip mid-word refilters).
  // No reusable hook exists in the codebase, so this stays inline.
  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedQuery(query), 200);
    return () => window.clearTimeout(id);
  }, [query]);

  // Categories actually present in the current locale's templates,
  // sorted by their localized label so the dropdown stays member-readable
  // and grows automatically as new templates land. Recomputes when the
  // template set changes (locale switch) or when the localized labels
  // themselves change (also locale switch).
  const availableCategories = useMemo(() => {
    const distinct = Array.from(
      new Set(templates.map((tpl) => tpl.defaultCategory)),
    );
    return distinct.sort((a, b) =>
      categoryLabel(t, a).localeCompare(categoryLabel(t, b), lang),
    );
  }, [templates, lang, t]);

  // Tabs and filters compose by AND: the active tab picks the list,
  // the filters narrow it. Filters deliberately do NOT reset on tab
  // switch — a member comparing "quick food projects" across both
  // groups keeps their narrowing.
  const tabTemplates = showTabs ? (tab === "fresh" ? fresh : inUse) : templates;
  const visibleTemplates = useMemo(
    () =>
      tabTemplates.filter((tpl) =>
        matchesTemplate(tpl, {
          query: debouncedQuery.trim(),
          category,
          setupBucket,
        }),
      ),
    [tabTemplates, debouncedQuery, category, setupBucket],
  );

  return (
    <section className="mb-6">
      <h2 className="text-heading font-semibold mb-1">
        {t("projects.templates.title")}
      </h2>
      <p className="text-sm text-moss-600 dark:text-moss-300 mb-3">
        {t("projects.templates.intro")}
      </p>
      <div className="mb-3">
        <ScratchCard
          isSelected={selectedId === null}
          onSelect={() => onSelect(null)}
        />
      </div>
      {showTabs ? (
        // Mirrors the Board's tablist pattern (segmented pill track;
        // full-width halves on phones, content-sized at sm+). Sits
        // BELOW the ScratchCard — the zero-scroll guarantee on the
        // blank option predates the tabs and must survive them.
        <div
          role="tablist"
          aria-label={t("projects.templates.tabs.ariaLabel")}
          className="mb-3 grid grid-cols-2 rounded-full bg-moss-100 p-1 dark:bg-moss-900 sm:flex sm:w-fit"
        >
          {(["fresh", "inUse"] as const).map((tt) => (
            <button
              key={tt}
              role="tab"
              aria-selected={tab === tt}
              onClick={() => setTab(tt)}
              className={`touch-target rounded-full text-sm font-semibold transition-colors px-4 ${
                tab === tt
                  ? "bg-white text-canopy-800 shadow-sm dark:bg-moss-950 dark:text-canopy-200"
                  : "text-moss-700 dark:text-moss-300"
              }`}
            >
              {tt === "fresh"
                ? t("projects.templates.tabs.fresh")
                : t("projects.templates.tabs.inCommunity", {
                    count: inUse.length,
                  })}
            </button>
          ))}
        </div>
      ) : null}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input
          type="search"
          className="input min-w-[12rem] flex-1"
          placeholder={t("projects.templates.filters.search.placeholder")}
          aria-label={t("projects.templates.filters.search.ariaLabel")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {/* The two selects always share one line: a 2-col grid on
            phones (w-full pushes them below the search, halving the
            row instead of stacking two full-width selects), joining
            the flex row inline at sm+. min-w-0 lets long option text
            truncate instead of forcing a wrap. */}
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
          <select
            className="input min-w-0 sm:w-auto"
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as ProjectCategory | "")
            }
            aria-label={t("projects.templates.filters.category.ariaLabel")}
          >
            <option value="">
              {t("projects.templates.filters.category.all")}
            </option>
            {availableCategories.map((c) => (
              <option key={c} value={c}>
                {categoryLabel(t, c)}
              </option>
            ))}
          </select>
          <select
            className="input min-w-0 sm:w-auto"
            value={setupBucket}
            onChange={(e) =>
              setSetupBucket(e.target.value as SetupBucket | "")
            }
            aria-label={t("projects.templates.filters.setupTime.ariaLabel")}
          >
            <option value="">
              {t("projects.templates.filters.setupTime.all")}
            </option>
            <option value="quick">
              {t("projects.templates.filters.setupTime.quick")}
            </option>
            <option value="medium">
              {t("projects.templates.filters.setupTime.medium")}
            </option>
            <option value="bigger">
              {t("projects.templates.filters.setupTime.bigger")}
            </option>
          </select>
        </div>
      </div>
      <ul
        className={`grid gap-3 ${
          layout === "rail"
            ? "grid-cols-1"
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        }`}
      >
        {visibleTemplates.length === 0 ? (
          <li className="col-span-full text-sm text-moss-600 dark:text-moss-300">
            {t("projects.templates.filters.empty")}
          </li>
        ) : (
          visibleTemplates.map((tpl) => (
            // flex column so the chip lays out below the card button
            // while the button still claims h-full of the grid row.
            <li key={tpl.id} className="flex flex-col">
              <TemplateCard
                template={tpl}
                isSelected={selectedId === tpl.id}
                onSelect={() => onSelect(tpl.id)}
                activeProjects={activeProjectsByTemplate?.get(tpl.id)}
              />
            </li>
          ))
        )}
      </ul>
    </section>
  );
}

function categoryLabel(
  t: (key: string) => string,
  category: ProjectCategory,
): string {
  return t(`categories.${category}`);
}

interface TemplateCardProps {
  template: ProjectTemplate;
  isSelected: boolean;
  onSelect: () => void;
  /** Sorted newest-first by the parent's helper; index 0 is the most
   *  recent match. Undefined when the parent didn't supply usage data. */
  activeProjects?: Project[];
}

function TemplateCard({
  template,
  isSelected,
  onSelect,
  activeProjects,
}: TemplateCardProps) {
  const { t } = useTranslation();
  const taskCount = template.tasks.length;
  const hasActive = activeProjects && activeProjects.length > 0;
  return (
    // Fragment so the ribbon sits as a sibling of the card button inside
    // the parent <li>. A <Link> can't legally nest inside a <button>,
    // and the ribbon is rendered first in the flex column so it
    // appears above the card — that's the visible-at-a-glance lever
    // for "this is already happening in your community" without
    // crossing into warning / shame framing.
    <>
      {hasActive ? (
        <Link
          to={`/project/${activeProjects[0].id}`}
          // stopPropagation so clicking the ribbon routes to the
          // existing project without also firing the card's
          // template-select. Sibling placement makes the
          // stopPropagation belt-and-braces, but we keep it as a
          // guardrail against future restructuring.
          onClick={(e) => e.stopPropagation()}
          // Canopy palette (solidarity green), NOT amber/red. Pill
          // sized to its content (self-start) so it reads as a
          // label attached to the card, not a banner spanning it.
          // -mb-2 + relative + z-10 lets the ribbon overlap the card
          // top edge slightly, visually anchoring it to the card
          // rather than floating above as a separate element.
          className="relative z-10 -mb-2 self-start rounded-full bg-canopy-100 px-3 py-1 text-xs font-medium text-canopy-900 shadow-sm hover:bg-canopy-200 dark:bg-canopy-900/60 dark:text-canopy-100 dark:hover:bg-canopy-800"
        >
          {t("projects.templates.activeInCommunity", {
            count: activeProjects.length,
          })}
        </Link>
      ) : null}
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={isSelected}
        className={`card w-full h-full text-left p-4 flex flex-col gap-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-canopy-500 ${
          isSelected
            ? "ring-2 ring-canopy-500 dark:ring-canopy-400"
            : "hover:border-canopy-300 dark:hover:border-canopy-700"
        }`}
      >
        <span className="font-semibold text-canopy-900 dark:text-canopy-100">
          {template.name}
        </span>
        <span className="text-sm text-moss-600 dark:text-moss-300">
          {template.purpose}
        </span>
        <span className="mt-auto flex flex-wrap items-center gap-2 pt-2 text-xs text-moss-600 dark:text-moss-300">
          <span>
            {t("projects.templates.meta.setupHours", {
              hours: template.setupHours,
            })}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            {t("projects.templates.meta.tasks", { count: taskCount })}
          </span>
          <CategoryBadge category={template.defaultCategory} size="sm" />
        </span>
      </button>
    </>
  );
}

interface ScratchCardProps {
  isSelected: boolean;
  onSelect: () => void;
}

function ScratchCard({ isSelected, onSelect }: ScratchCardProps) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={`w-full text-left p-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 rounded-lg border-2 border-dashed transition focus:outline-none focus-visible:ring-2 focus-visible:ring-canopy-500 ${
        isSelected
          ? "border-canopy-500 bg-canopy-50/40 dark:border-canopy-400 dark:bg-canopy-950/30"
          : "border-bark-300 dark:border-bark-700 hover:border-canopy-300 dark:hover:border-canopy-700"
      }`}
    >
      <span className="font-semibold text-moss-700 dark:text-moss-200">
        {t("projects.templates.scratch")}
      </span>
      <span className="text-sm text-moss-600 dark:text-moss-300">
        {t("projects.templates.scratchHint")}
      </span>
    </button>
  );
}
