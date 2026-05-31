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
import { useTranslation } from "react-i18next";
import { CategoryBadge } from "@/components/CategoryBadge";
import {
  getProjectTemplates,
  type ProjectTemplate,
} from "@/content/projectTemplates";
import type { Category } from "@/types";

interface TemplatePickerProps {
  selectedId: string | null;
  onSelect: (templateId: string | null) => void;
}

/**
 * Gallery of starter community-project templates shown above the
 * Start-a-project form. The selected template pre-fills the form
 * below; "Start from scratch" leaves everything blank. Templates are
 * friendly defaults, not prescriptions — every field is editable
 * before the project is created.
 */
export function TemplatePicker({ selectedId, onSelect }: TemplatePickerProps) {
  const { t, i18n } = useTranslation();
  const templates = getProjectTemplates(i18n.resolvedLanguage ?? "en");
  return (
    <section className="mb-6">
      <h2 className="text-heading font-semibold mb-1">
        {t("projects.templates.title")}
      </h2>
      <p className="text-sm text-moss-600 dark:text-moss-300 mb-3">
        {t("projects.templates.intro")}
      </p>
      <ul className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((tpl) => (
          <li key={tpl.id}>
            <TemplateCard
              template={tpl}
              isSelected={selectedId === tpl.id}
              onSelect={() => onSelect(tpl.id)}
            />
          </li>
        ))}
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

interface TemplateCardProps {
  template: ProjectTemplate;
  isSelected: boolean;
  onSelect: () => void;
}

function TemplateCard({ template, isSelected, onSelect }: TemplateCardProps) {
  const { t } = useTranslation();
  const taskCount = template.tasks.length;
  return (
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
      <span className="mt-auto flex flex-wrap items-center gap-2 pt-2 text-xs text-moss-500 dark:text-moss-400">
        <span>
          {t("projects.templates.meta.setupHours", {
            hours: template.setupHours,
          })}
        </span>
        <span aria-hidden="true">·</span>
        <span>
          {t("projects.templates.meta.tasks", { count: taskCount })}
        </span>
        <CategoryBadge
          category={template.defaultCategory as Category}
          size="sm"
        />
      </span>
    </button>
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
      className={`w-full h-full text-left p-4 flex flex-col gap-2 rounded-lg border-2 border-dashed transition focus:outline-none focus-visible:ring-2 focus-visible:ring-canopy-500 ${
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
