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

export const EVENT_TEMPLATES_EN: readonly EventTemplate[] = [
  {
    id: "potluck",
    name: "Potluck",
    category: "social",
    emoji: "🍲",
    titleScaffold: "Potluck — ",
    descriptionScaffold:
      "Bring a dish to share and come hungry — there's always plenty when everyone pitches in. Let people know if there's anything to bring besides food.",
    suggestedDurationMinutes: 120,
    blurb: "A shared meal where everyone brings a dish.",
  },
  {
    id: "shared-meal",
    name: "Shared meal",
    category: "social",
    emoji: "🍝",
    titleScaffold: "Shared meal — ",
    descriptionScaffold:
      "A cooked meal, eaten together. Say what's on the menu and whether folks can lend a hand with cooking or cleanup.",
    suggestedDurationMinutes: 90,
    blurb: "A cooked meal, eaten together.",
  },
  {
    id: "game-night",
    name: "Game night",
    category: "social",
    emoji: "🎲",
    titleScaffold: "Game night — ",
    descriptionScaffold:
      "Board games, cards, whatever you've got. Newcomers welcome — someone will teach you the rules.",
    suggestedDurationMinutes: 150,
    blurb: "Board games, cards, and good company.",
  },
  {
    id: "movie-night",
    name: "Movie night",
    category: "social",
    emoji: "🎬",
    titleScaffold: "Movie night — ",
    descriptionScaffold:
      "Pick something to watch together. Mention what's showing and whether to bring a cushion or a snack to pass around.",
    suggestedDurationMinutes: 150,
    blurb: "Watch something together.",
  },
  {
    id: "skill-share",
    name: "Skill-share",
    category: "learning",
    emoji: "🎓",
    titleScaffold: "Skill-share — ",
    descriptionScaffold:
      "Someone teaches, everyone learns — no experts required. Say what's being shared and what to bring, if anything.",
    suggestedDurationMinutes: 90,
    blurb: "Someone teaches, everyone learns.",
  },
  {
    id: "craft-circle",
    name: "Craft circle",
    category: "learning",
    emoji: "🧶",
    titleScaffold: "Craft circle — ",
    descriptionScaffold:
      "Bring whatever you're making and work alongside others. Beginners and works-in-progress both belong here.",
    suggestedDurationMinutes: 120,
    blurb: "Make things alongside others.",
  },
  {
    id: "walk-hike",
    name: "Walk / hike",
    category: "social",
    emoji: "🥾",
    titleScaffold: "Walk — ",
    descriptionScaffold:
      "A walk together at an easy pace. Note the route's length and difficulty so people know what to expect, and remind folks about water and good shoes.",
    suggestedDurationMinutes: 90,
    blurb: "A walk together, at an easy pace.",
  },
  {
    id: "welcome-gathering",
    name: "Welcome gathering",
    category: "social",
    emoji: "👋",
    titleScaffold: "Welcome gathering — ",
    descriptionScaffold:
      "A relaxed way to meet new neighbors and reconnect with familiar faces. No agenda — just introductions and good company.",
    suggestedDurationMinutes: 90,
    blurb: "Meet new neighbors, no agenda.",
  },
  {
    id: "music-jam",
    name: "Music jam",
    category: "social",
    emoji: "🎵",
    titleScaffold: "Music jam — ",
    descriptionScaffold:
      "Bring an instrument or just your voice. All levels welcome — this is about playing together, not performing.",
    suggestedDurationMinutes: 120,
    blurb: "Play music together — all levels.",
  },
  {
    id: "celebration",
    name: "Celebration",
    category: "celebration",
    emoji: "🎉",
    titleScaffold: "Celebration — ",
    descriptionScaffold:
      "Mark something together. Say what's being celebrated and whether to bring anything to share.",
    suggestedDurationMinutes: 120,
    blurb: "Mark something together.",
  },
  {
    id: "work-day",
    name: "Work day",
    category: "skilled_labor",
    emoji: "🌱",
    titleScaffold: "Work day — ",
    descriptionScaffold:
      "Hands-on time to get something done together. Describe the work and what to bring, and note that many hands make it lighter.",
    suggestedDurationMinutes: 240,
    blurb: "Hands-on time, done together.",
  },
  {
    id: "repair-cafe",
    name: "Repair café",
    category: "skilled_labor",
    emoji: "🔧",
    titleScaffold: "Repair café — ",
    descriptionScaffold:
      "Bring something broken and fix it with help from neighbors who know their way around tools. Say what kinds of repairs folks can help with.",
    suggestedDurationMinutes: 180,
    blurb: "Fix broken things, together.",
  },
  {
    id: "care-circle",
    name: "Care circle",
    category: "emotional_support",
    emoji: "🫂",
    titleScaffold: "Care circle — ",
    descriptionScaffold:
      "A gentle space to check in and support one another. What's shared here stays here.",
    suggestedDurationMinutes: 90,
    blurb: "Check in and support one another.",
  },
  {
    id: "meeting",
    name: "Meeting",
    category: "organizing",
    emoji: "📋",
    titleScaffold: "Meeting — ",
    descriptionScaffold:
      "Time to talk things through and decide together. Share the agenda so people can come prepared.",
    suggestedDurationMinutes: 60,
    blurb: "Talk things through, decide together.",
  },
];

export const EVENT_TEMPLATES_ES: readonly EventTemplate[] = [
  {
    id: "potluck",
    name: "Comida compartida",
    category: "social",
    emoji: "🍲",
    titleScaffold: "Comida compartida — ",
    descriptionScaffold:
      "Traigan un plato para compartir y vengan con hambre — siempre hay de sobra cuando cada quien aporta. Avisen si hay algo más que traer además de comida.",
    suggestedDurationMinutes: 120,
    blurb: "Una comida donde cada quien trae un plato.",
  },
  {
    id: "shared-meal",
    name: "Comida en común",
    category: "social",
    emoji: "🍝",
    titleScaffold: "Comida en común — ",
    descriptionScaffold:
      "Una comida cocinada, para comer en grupo. Digan qué hay en el menú y si alguien puede echar una mano cocinando o limpiando.",
    suggestedDurationMinutes: 90,
    blurb: "Una comida cocinada, en grupo.",
  },
  {
    id: "game-night",
    name: "Noche de juegos",
    category: "social",
    emoji: "🎲",
    titleScaffold: "Noche de juegos — ",
    descriptionScaffold:
      "Juegos de mesa, cartas, lo que tengan. Quienes llegan por primera vez son bienvenidas — alguien les enseña las reglas.",
    suggestedDurationMinutes: 150,
    blurb: "Juegos de mesa, cartas y buena compañía.",
  },
  {
    id: "movie-night",
    name: "Noche de cine",
    category: "social",
    emoji: "🎬",
    titleScaffold: "Noche de cine — ",
    descriptionScaffold:
      "Elijan algo para ver en grupo. Mencionen qué se proyecta y si conviene traer un cojín o algo de picar para compartir.",
    suggestedDurationMinutes: 150,
    blurb: "Ver algo en grupo.",
  },
  {
    id: "skill-share",
    name: "Intercambio de saberes",
    category: "learning",
    emoji: "🎓",
    titleScaffold: "Intercambio de saberes — ",
    descriptionScaffold:
      "Alguien enseña, todas aprenden — no hacen falta expertos. Digan qué se comparte y qué traer, si hace falta algo.",
    suggestedDurationMinutes: 90,
    blurb: "Alguien enseña, todas aprenden.",
  },
  {
    id: "craft-circle",
    name: "Círculo de manualidades",
    category: "learning",
    emoji: "🧶",
    titleScaffold: "Círculo de manualidades — ",
    descriptionScaffold:
      "Traigan lo que estén haciendo y trabajen al lado de otras personas. Quienes empiezan y los proyectos a medias también tienen su lugar aquí.",
    suggestedDurationMinutes: 120,
    blurb: "Crear cosas al lado de otras personas.",
  },
  {
    id: "walk-hike",
    name: "Caminata",
    category: "social",
    emoji: "🥾",
    titleScaffold: "Caminata — ",
    descriptionScaffold:
      "Una caminata en grupo a paso tranquilo. Anoten la distancia y la dificultad del recorrido para que sepan qué esperar, y recuerden el agua y un buen calzado.",
    suggestedDurationMinutes: 90,
    blurb: "Una caminata en grupo, a paso tranquilo.",
  },
  {
    id: "welcome-gathering",
    name: "Encuentro de bienvenida",
    category: "social",
    emoji: "👋",
    titleScaffold: "Encuentro de bienvenida — ",
    descriptionScaffold:
      "Una forma relajada de conocer a vecinas nuevas y reencontrarse con caras conocidas. Sin agenda — solo presentaciones y buena compañía.",
    suggestedDurationMinutes: 90,
    blurb: "Conocer a vecinas nuevas, sin agenda.",
  },
  {
    id: "music-jam",
    name: "Jam de música",
    category: "social",
    emoji: "🎵",
    titleScaffold: "Jam de música — ",
    descriptionScaffold:
      "Traigan un instrumento o solo su voz. Todos los niveles son bienvenidos — se trata de tocar en grupo, no de actuar.",
    suggestedDurationMinutes: 120,
    blurb: "Tocar música en grupo — todos los niveles.",
  },
  {
    id: "celebration",
    name: "Celebración",
    category: "celebration",
    emoji: "🎉",
    titleScaffold: "Celebración — ",
    descriptionScaffold:
      "Celebren algo en grupo. Digan qué se celebra y si conviene traer algo para compartir.",
    suggestedDurationMinutes: 120,
    blurb: "Celebrar algo en grupo.",
  },
  {
    id: "work-day",
    name: "Jornada de trabajo",
    category: "skilled_labor",
    emoji: "🌱",
    titleScaffold: "Jornada de trabajo — ",
    descriptionScaffold:
      "Tiempo de manos a la obra para sacar algo adelante en grupo. Describan el trabajo y qué traer, y recuerden que entre muchas manos se hace más liviano.",
    suggestedDurationMinutes: 240,
    blurb: "Manos a la obra, en grupo.",
  },
  {
    id: "repair-cafe",
    name: "Café de reparación",
    category: "skilled_labor",
    emoji: "🔧",
    titleScaffold: "Café de reparación — ",
    descriptionScaffold:
      "Traigan algo roto y arréglenlo con ayuda de vecinas que saben de herramientas. Digan qué tipo de reparaciones se pueden hacer.",
    suggestedDurationMinutes: 180,
    blurb: "Arreglar cosas rotas, en grupo.",
  },
  {
    id: "care-circle",
    name: "Círculo de cuidado",
    category: "emotional_support",
    emoji: "🫂",
    titleScaffold: "Círculo de cuidado — ",
    descriptionScaffold:
      "Un espacio tranquilo para acompañarse y apoyarse mutuamente. Lo que se comparte aquí, aquí se queda.",
    suggestedDurationMinutes: 90,
    blurb: "Acompañarse y apoyarse mutuamente.",
  },
  {
    id: "meeting",
    name: "Reunión",
    category: "organizing",
    emoji: "📋",
    titleScaffold: "Reunión — ",
    descriptionScaffold:
      "Tiempo para hablar las cosas y decidir en grupo. Compartan el orden del día para que la gente venga preparada.",
    suggestedDurationMinutes: 60,
    blurb: "Hablar las cosas, decidir en grupo.",
  },
];

/** Returns the EN or ES template set for a locale. Falls back to English
 *  for any unsupported locale (a member with an exotic `Accept-Language`
 *  still sees the gallery, just in English) — mirrors
 *  `getProjectTemplates`. */
export function getEventTemplates(locale: string): readonly EventTemplate[] {
  return locale.startsWith("es") ? EVENT_TEMPLATES_ES : EVENT_TEMPLATES_EN;
}

export function getEventTemplate(
  id: string,
  locale: string,
): EventTemplate | undefined {
  return getEventTemplates(locale).find((t) => t.id === id);
}
