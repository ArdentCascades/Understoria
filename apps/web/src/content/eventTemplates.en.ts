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
// English event templates (i18n Phase 2a split from
// eventTemplates.ts). Eager: English is the fallback.
import type { EventTemplate } from "./eventTemplates";

export const EVENT_TEMPLATES_EN: readonly EventTemplate[] = [
  {
    "id": "potluck",
    "name": "Potluck",
    "category": "social",
    "emoji": "🍲",
    "titleScaffold": "Potluck — ",
    "descriptionScaffold": "Bring a dish to share and come hungry — there's always plenty when everyone pitches in. Let people know if there's anything to bring besides food.",
    "suggestedDurationMinutes": 120,
    "blurb": "A shared meal where everyone brings a dish."
  },
  {
    "id": "shared-meal",
    "name": "Shared meal",
    "category": "social",
    "emoji": "🍝",
    "titleScaffold": "Shared meal — ",
    "descriptionScaffold": "A cooked meal, eaten together. Say what's on the menu and whether folks can lend a hand with cooking or cleanup.",
    "suggestedDurationMinutes": 90,
    "blurb": "A cooked meal, eaten together."
  },
  {
    "id": "game-night",
    "name": "Game night",
    "category": "social",
    "emoji": "🎲",
    "titleScaffold": "Game night — ",
    "descriptionScaffold": "Board games, cards, whatever you've got. Newcomers welcome — someone will teach you the rules.",
    "suggestedDurationMinutes": 150,
    "blurb": "Board games, cards, and good company."
  },
  {
    "id": "movie-night",
    "name": "Movie night",
    "category": "social",
    "emoji": "🎬",
    "titleScaffold": "Movie night — ",
    "descriptionScaffold": "Pick something to watch together. Mention what's showing and whether to bring a cushion or a snack to pass around.",
    "suggestedDurationMinutes": 150,
    "blurb": "Watch something together."
  },
  {
    "id": "skill-share",
    "name": "Skill-share",
    "category": "learning",
    "emoji": "🎓",
    "titleScaffold": "Skill-share — ",
    "descriptionScaffold": "Someone teaches, everyone learns — no experts required. Say what's being shared and what to bring, if anything.",
    "suggestedDurationMinutes": 90,
    "blurb": "Someone teaches, everyone learns."
  },
  {
    "id": "craft-circle",
    "name": "Craft circle",
    "category": "learning",
    "emoji": "🧶",
    "titleScaffold": "Craft circle — ",
    "descriptionScaffold": "Bring whatever you're making and work alongside others. Beginners and works-in-progress both belong here.",
    "suggestedDurationMinutes": 120,
    "blurb": "Make things alongside others."
  },
  {
    "id": "walk-hike",
    "name": "Walk / hike",
    "category": "social",
    "emoji": "🥾",
    "titleScaffold": "Walk — ",
    "descriptionScaffold": "A walk together at an easy pace. Note the route's length and difficulty so people know what to expect, and remind folks about water and good shoes.",
    "suggestedDurationMinutes": 90,
    "blurb": "A walk together, at an easy pace."
  },
  {
    "id": "welcome-gathering",
    "name": "Welcome gathering",
    "category": "social",
    "emoji": "👋",
    "titleScaffold": "Welcome gathering — ",
    "descriptionScaffold": "A relaxed way to meet new neighbors and reconnect with familiar faces. No agenda — just introductions and good company.",
    "suggestedDurationMinutes": 90,
    "blurb": "Meet new neighbors, no agenda."
  },
  {
    "id": "music-jam",
    "name": "Music jam",
    "category": "social",
    "emoji": "🎵",
    "titleScaffold": "Music jam — ",
    "descriptionScaffold": "Bring an instrument or just your voice. All levels welcome — this is about playing together, not performing.",
    "suggestedDurationMinutes": 120,
    "blurb": "Play music together — all levels."
  },
  {
    "id": "celebration",
    "name": "Celebration",
    "category": "celebration",
    "emoji": "🎉",
    "titleScaffold": "Celebration — ",
    "descriptionScaffold": "Mark something together. Say what's being celebrated and whether to bring anything to share.",
    "suggestedDurationMinutes": 120,
    "blurb": "Mark something together."
  },
  {
    "id": "work-day",
    "name": "Work day",
    "category": "skilled_labor",
    "emoji": "🌱",
    "titleScaffold": "Work day — ",
    "descriptionScaffold": "Hands-on time to get something done together. Describe the work and what to bring, and note that many hands make it lighter.",
    "suggestedDurationMinutes": 240,
    "blurb": "Hands-on time, done together."
  },
  {
    "id": "repair-cafe",
    "name": "Repair café",
    "category": "skilled_labor",
    "emoji": "🔧",
    "titleScaffold": "Repair café — ",
    "descriptionScaffold": "Bring something broken and fix it with help from neighbors who know their way around tools. Say what kinds of repairs folks can help with.",
    "suggestedDurationMinutes": 180,
    "blurb": "Fix broken things, together."
  },
  {
    "id": "care-circle",
    "name": "Care circle",
    "category": "emotional_support",
    "emoji": "🫂",
    "titleScaffold": "Care circle — ",
    "descriptionScaffold": "A gentle space to check in and support one another. What's shared here stays here.",
    "suggestedDurationMinutes": 90,
    "blurb": "Check in and support one another."
  },
  {
    "id": "meeting",
    "name": "Meeting",
    "category": "organizing",
    "emoji": "📋",
    "titleScaffold": "Meeting — ",
    "descriptionScaffold": "Time to talk things through and decide together. Share the agenda so people can come prepared.",
    "suggestedDurationMinutes": 60,
    "blurb": "Talk things through, decide together."
  }
];
