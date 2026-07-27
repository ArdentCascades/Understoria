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

// Event templates — warm starting points for the "Create event" flow,
// aimed at the gatherings that build community: potlucks, game nights,
// skill-shares, work days. Picking a template pre-fills the event form
// (title stem, description, category, a suggested duration) and the
// member edits everything before they sign. See
// `docs/event-templates-plan.md`.
//
// Templates are NOT prescriptions — the whole point is that a member
// reads one, recognizes the shape of a get-together their community
// wants, and makes it their own.
//
// Three things are DELIBERATELY absent from the shape, each protecting a
// principle:
//   - No task list. Events have no tasks (the structural difference from
//     ProjectTemplate).
//   - No location / locationScaffold. Location is the threat-model-
//     sensitive field and is NEVER prefilled — it is typed by hand in
//     front of the signing card (docs/threat-model.md §7; the work-day
//     flow already enforces this).
//   - No recurrence. A template seeds exactly ONE event. An auto-
//     recurring "weekly game night" would manufacture the "meets at
//     location Z on cadence C" pattern threat-model §7(d) warns about.
//
// The set is a hardcoded, curated constant — NOT member-creatable.
// Member-authored templates drift toward "popular templates," a
// leaderboard shape (docs/community-events.md §10). There is no usage
// count anywhere on the shape; an event-template popularity signal is
// exactly the no-leaderboards line we hold.

/**
 * Event-specific category strings, introduced because the mutual-aid
 * 9-category taxonomy has no home for fun gatherings. These ride the
 * FREE-TEXT `EventPayload.category` wire field (1..50 chars, explicitly
 * un-enum'd so phase-2 templates can mint new strings) — so they are not
 * a wire change, and a peer that doesn't know them renders the raw
 * string + a neutral glyph (see `EVENT_CATEGORY_META` in
 * `@/lib/categories`). The emoji/color spec for each lives there.
 *
 * Templates may also reuse legacy / project categories where the fit is
 * exact (e.g. work-day → "skilled_labor", meeting → "organizing").
 */
export const EVENT_CATEGORY_IDS = ["social", "celebration", "learning"] as const;
export type EventCategoryId = (typeof EVENT_CATEGORY_IDS)[number];

export interface EventTemplate {
  /** Stable kebab-case slug; identical across locales so a selection
   *  survives a language switch — and the value written to the signed
   *  `EventPayload.templateId`. */
  id: string;
  /** Gallery-card heading, localized. */
  name: string;
  /** Free-text string written to `EventPayload.category`. An
   *  `EventCategoryId` or a legacy / project category. */
  category: string;
  /** One emoji for the gallery card. NOTE: this is a create-time
   *  affordance only — the glyph rendered on the calendar / EventDetail
   *  derives from the CATEGORY (via `EVENT_CATEGORY_META`), so it
   *  survives federation and stays consistent across templates. */
  emoji: string;
  /** Seeds the event TITLE: a stem with a trailing separator (the
   *  member completes and signs it), never a finished title. */
  titleScaffold: string;
  /** Seeds the event DESCRIPTION: a warm 1–2 sentences the organizer
   *  edits. NEVER contains a location. */
  descriptionScaffold: string;
  /** Seeds `endsAt = startsAt + this`. A suggestion the member changes
   *  or clears freely. Positive integer minutes. */
  suggestedDurationMinutes: number;
  /** Gallery-card subtitle — one line about what the gathering is
   *  (distinct from `descriptionScaffold`, which becomes the event's
   *  own description). */
  blurb: string;
}

// The template tables live in per-language modules
// (eventTemplates.en.ts eagerly, eventTemplates.es.ts in the lazy
// Spanish content bundle); this module keeps types + selectors.
import { getContentBundle } from "./registry";

export { EVENT_TEMPLATES_EN } from "./eventTemplates.en";

/** Returns the locale's template set. Falls back to English for any
 *  locale without a content bundle (ui-only languages, exotic
 *  Accept-Language) — mirrors `getProjectTemplates`. */
export function getEventTemplates(locale: string): readonly EventTemplate[] {
  return getContentBundle(locale).EVENT_TEMPLATES;
}

export function getEventTemplate(
  id: string,
  locale: string,
): EventTemplate | undefined {
  return getEventTemplates(locale).find((t) => t.id === id);
}
