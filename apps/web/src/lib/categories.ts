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
import type { Category } from "@/types";

export interface CategoryMeta {
  id: Category;
  label: string;
  emoji: string;
  description: string;
  barColorClass: string;
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  transport: {
    id: "transport",
    label: "Transport",
    emoji: "\u{1F697}", // car
    description: "Rides, carpools, moving help",
    barColorClass: "bg-canopy-600",
  },
  food: {
    id: "food",
    label: "Food",
    emoji: "\u{1F35E}", // bread
    description: "Meals, groceries, cooking",
    barColorClass: "bg-canopy-500",
  },
  childcare: {
    id: "childcare",
    label: "Childcare",
    emoji: "\u{1F9F8}", // teddy bear
    description: "Babysitting, school pickups, kid help",
    barColorClass: "bg-moss-500",
  },
  skilled_labor: {
    id: "skilled_labor",
    label: "Skilled labor",
    emoji: "\u{1F527}", // wrench
    description: "Repairs, trades, hands-on work",
    barColorClass: "bg-moss-600",
  },
  emotional_support: {
    id: "emotional_support",
    label: "Emotional support",
    emoji: "\u{1FAC2}", // people hugging
    description: "Listening, company, care",
    barColorClass: "bg-canopy-700",
  },
  education: {
    id: "education",
    label: "Education",
    emoji: "\u{1F4DA}", // books
    description: "Tutoring, teaching, mentoring",
    barColorClass: "bg-moss-400",
  },
  housing: {
    id: "housing",
    label: "Housing",
    emoji: "\u{1F3E0}", // house
    description: "Shelter, moving, household help",
    barColorClass: "bg-bark-500",
  },
  tech: {
    id: "tech",
    label: "Tech",
    emoji: "\u{1F4BB}", // laptop
    description: "Computers, phones, setup help",
    barColorClass: "bg-moss-700",
  },
  other: {
    id: "other",
    label: "Other",
    emoji: "\u{1F33F}", // herb
    description: "Anything else our community needs",
    barColorClass: "bg-moss-400",
  },
};

export const ALL_CATEGORIES: Category[] = Object.keys(
  CATEGORY_META,
) as Category[];
