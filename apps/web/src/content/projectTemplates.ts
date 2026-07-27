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

// Project templates — friendly starting points for the "Start a
// project" flow. Picking a template pre-fills the project form and
// stages all the template's tasks so they're created together with
// the project.
//
// Templates are NOT prescriptions. The whole point is that a member
// reads one, recognizes the shape of something their community needs,
// and then edits everything before launching. Nothing here is fixed.
//
// Recurring tasks (e.g. "~2h per month") are modeled as one-off
// tasks with a localized cadence sentence appended to the task
// description. There's deliberately no new schema field — keeping
// ProjectTask flat protects federation and the rest of the project
// lifecycle from churn for a content-only feature.

import type { ProjectCategory } from "@/types";

export type RecurringCadence = "session" | "month" | "event" | "cycle";

export interface TemplateTask {
  name: string;
  description: string;
  hours: number;
  recurringCadence?: RecurringCadence;
  /** Suggested skills for the task, localized per template locale.
   *  Staged into `ProjectTask.requiredSkills`, which feeds the task
   *  UI's skills rendering (and the proposed ways-to-plug-in
   *  matching). Plain everyday words — "carpentry", "driving" — the
   *  same register members use in their own profile skills. */
  skills?: readonly string[];
  /** Indexes of EARLIER tasks in this template that should complete
   *  first — the soft-block "Follows:" framing from
   *  docs/task-ordering-and-dependencies.md, never a hard gate.
   *  Remapped to real task ids at creation (and past any tasks the
   *  member excluded in the staging step). Must reference strictly
   *  earlier indexes; the drift between locales is prevented by
   *  authoring both locales from one table (see the content pass). */
  follows?: readonly number[];
}

export interface ProjectTemplate {
  /** Stable kebab-case slug; identical across locales so a selection
   *  survives a language switch. */
  id: string;
  name: string;
  purpose: string;
  whoItServes: string;
  whatYoullNeed: string;
  setupHours: number;
  defaultCategory: ProjectCategory;
  tasks: readonly TemplateTask[];
  /** True for templates whose recurring crew work (rotas, sessions,
   *  service days) is the shape the work-day + shifts machinery
   *  coordinates. Feeds ONE quiet, dismissible, organizer-only line
   *  on a freshly created project — never a rail item or badge
   *  (no-notifications). */
  suggestsWorkDays?: boolean;
  /** Narrative bridge from "picked a template" to "know what to do
   *  this week" — who to talk to before any task starts. Locale
   *  prose; rendered in the selected-template context block. */
  firstSteps?: string;
  /** Honest, specific failure modes — how this project actually
   *  dies or hurts someone. Locale prose. */
  commonPitfalls?: string;
  /** Ids of complementary templates. Locale-INVARIANT (identical in
   *  both arrays); every id must exist and never self-reference —
   *  CI-pinned in projectTemplates.test.ts. */
  pairsWith?: readonly string[];
  /** FAQ entry ids (content/faq.ts) rendered as /help#<id> links,
   *  labeled by the FAQ question in the viewer's language.
   *  Locale-INVARIANT; membership CI-pinned against FAQ_SECTIONS. */
  learnMore?: readonly string[];
}

// The template tables themselves live in per-language modules
// (projectTemplates.en.ts eagerly — English is the fallback — and
// projectTemplates.es.ts inside the lazy Spanish content bundle);
// this module keeps the types and the synchronous selectors. The
// selectors stay sync because the app GATES rendering on the active
// language's content bundle (content/registry.ts): boot chains
// ensureContent() into i18nReady and setLanguage awaits it before
// i18next switches.
import { getContentBundle } from "./registry";

export { PROJECT_TEMPLATES_EN } from "./projectTemplates.en";

/** Returns the locale-appropriate template list. Falls back to en
 *  when the locale has no content bundle (ui-only languages, or an
 *  exotic Accept-Language), so a member always sees the gallery. */
export function getProjectTemplates(
  locale: string,
): readonly ProjectTemplate[] {
  return getContentBundle(locale).PROJECT_TEMPLATES;
}

export function getTemplate(
  id: string,
  locale: string,
): ProjectTemplate | undefined {
  return getProjectTemplates(locale).find((t) => t.id === id);
}
