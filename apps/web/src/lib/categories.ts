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
import { PROJECT_CATEGORIES } from "@/types";
import type { Category, ProjectCategory } from "@/types";

// NOTE: no display prose lives here. Names render via
// `t(`categories.${id}`)` and the post-form blurbs via
// `t(`categoryDescriptions.${id}`)` so every human-facing string flows
// through the parity-checked locale files (a hardcoded English
// `description` field here once leaked untranslated text into the
// Spanish post form).
export interface CategoryMeta {
  id: ProjectCategory;
  label: string;
  emoji: string;
  barColorClass: string;
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  transport: {
    id: "transport",
    label: "Transport",
    emoji: "\u{1F697}", // car
    barColorClass: "bg-canopy-600",
  },
  food: {
    id: "food",
    label: "Food",
    emoji: "\u{1F35E}", // bread
    barColorClass: "bg-canopy-500",
  },
  childcare: {
    id: "childcare",
    label: "Childcare",
    emoji: "\u{1F9F8}", // teddy bear
    barColorClass: "bg-moss-500",
  },
  skilled_labor: {
    id: "skilled_labor",
    label: "Skilled labor",
    emoji: "\u{1F527}", // wrench
    barColorClass: "bg-moss-600",
  },
  emotional_support: {
    id: "emotional_support",
    label: "Emotional support",
    emoji: "\u{1FAC2}", // people hugging
    barColorClass: "bg-canopy-700",
  },
  education: {
    id: "education",
    label: "Education",
    emoji: "\u{1F4DA}", // books
    barColorClass: "bg-moss-400",
  },
  housing: {
    id: "housing",
    label: "Housing",
    emoji: "\u{1F3E0}", // house
    barColorClass: "bg-bark-500",
  },
  tech: {
    id: "tech",
    label: "Tech",
    emoji: "\u{1F4BB}", // laptop
    barColorClass: "bg-moss-700",
  },
  other: {
    id: "other",
    label: "Other",
    emoji: "\u{1F33F}", // herb
    barColorClass: "bg-moss-400",
  },
};

export const ALL_CATEGORIES: Category[] = Object.keys(
  CATEGORY_META,
) as Category[];

export const PROJECT_CATEGORY_META: Record<ProjectCategory, CategoryMeta> = {
  ...CATEGORY_META,
  infrastructure: {
    id: "infrastructure",
    label: "Infrastructure",
    emoji: "\u{1F3D7}\u{FE0F}",
    barColorClass: "bg-bark-600",
  },
  organizing: {
    id: "organizing",
    label: "Organizing",
    emoji: "\u{1F4CB}",
    barColorClass: "bg-canopy-800",
  },
  mutual_aid_drive: {
    id: "mutual_aid_drive",
    label: "Mutual aid drive",
    emoji: "\u{1F49B}",
    barColorClass: "bg-moss-800",
  },
};

/**
 * Fold a STORED category string into today's closed exchange set.
 * The type system says rows carry `ProjectCategory`, but the type
 * system doesn't govern history: `TaskState` / `ProjectState` bodies
 * federate verbatim (the server deliberately passes them through),
 * device databases outlive every rename, and a row written by an
 * older build can carry a category id today's build has never heard
 * of. Anything unrecognized folds into `other` — the honest bucket —
 * instead of becoming an undefined-lookup crash or a poisoned outbox
 * row. Used at the WRITE layer (the exchange a task confirmation
 * signs) so new signed records always carry a valid id.
 */
export function normalizeExchangeCategory(category: string): ProjectCategory {
  return (PROJECT_CATEGORIES as readonly string[]).includes(category)
    ? (category as ProjectCategory)
    : "other";
}

/**
 * Total meta lookup for a category on a RUNTIME row — never throws.
 * The read-layer companion of `normalizeExchangeCategory`: one stale
 * category id on one old row must degrade to the `other` glyph, not
 * take down a whole screen (the Dashboard error boundary swallowed
 * exactly this — twice — before the lookups went total). Same
 * contract as `eventCategoryMeta` below.
 */
export function projectCategoryMeta(category: string): CategoryMeta {
  return (
    (PROJECT_CATEGORY_META as Record<string, CategoryMeta>)[category] ??
    PROJECT_CATEGORY_META.other
  );
}

/**
 * Display metadata for an EVENT category. Events carry a FREE-TEXT
 * category (1..50 chars on the wire) so camaraderie templates can mint
 * strings the legacy `Category` enum doesn't have ("social",
 * "celebration", "learning"). `id` is therefore a plain `string`, not the
 * closed `ProjectCategory` union — the only structural difference from
 * `CategoryMeta`. See `docs/event-templates-plan.md` (Task 4).
 */
export interface EventCategoryMeta extends Omit<CategoryMeta, "id"> {
  id: string;
}

/**
 * Resolved by `eventCategoryMeta(category)`. Covers every legacy /
 * project category (so an event reusing "skilled_labor" or "organizing"
 * still gets a sensible glyph/colour) plus the three event-specific
 * strings. All `barColorClass` values are shades already paired with
 * `text-white` in `CATEGORY_META`, so the calendar chips stay legible.
 */
export const EVENT_CATEGORY_META: Record<string, EventCategoryMeta> = {
  ...PROJECT_CATEGORY_META,
  social: {
    id: "social",
    label: "Social",
    emoji: "\u{1F389}", // party popper
    barColorClass: "bg-canopy-500",
  },
  celebration: {
    id: "celebration",
    label: "Celebration",
    emoji: "\u{1F382}", // birthday cake
    barColorClass: "bg-bark-500",
  },
  learning: {
    id: "learning",
    label: "Learning",
    emoji: "\u{1F4DA}", // books
    barColorClass: "bg-moss-500",
  },
};

/**
 * Neutral fallback for a category string this node doesn't recognize —
 * events federate with free-text categories, so a peer can send one we've
 * never seen. The calendar/detail surfaces show a calendar glyph + the
 * neutral `other` colour rather than crashing on a missing key.
 */
export const EVENT_CATEGORY_FALLBACK: EventCategoryMeta = {
  id: "other",
  label: "Event",
  emoji: "\u{1F4C5}", // calendar
  barColorClass: "bg-moss-400",
};

/** Total lookup for an event's free-text category — never throws. */
export function eventCategoryMeta(category: string): EventCategoryMeta {
  return EVENT_CATEGORY_META[category] ?? EVENT_CATEGORY_FALLBACK;
}
