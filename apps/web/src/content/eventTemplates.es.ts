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
// Spanish event templates (i18n Phase 2a split from
// eventTemplates.ts). Loaded lazily via content/bundles/es.ts —
// never import this statically from app code.
import type { EventTemplate } from "./eventTemplates";

export const EVENT_TEMPLATES_ES: readonly EventTemplate[] = [
  {
    "id": "potluck",
    "name": "Comida compartida",
    "category": "social",
    "emoji": "🍲",
    "titleScaffold": "Comida compartida — ",
    "descriptionScaffold": "Traigan un plato para compartir y vengan con hambre — siempre hay de sobra cuando cada quien aporta. Avisen si hay algo más que traer además de comida.",
    "suggestedDurationMinutes": 120,
    "blurb": "Una comida donde cada quien trae un plato."
  },
  {
    "id": "shared-meal",
    "name": "Comida en común",
    "category": "social",
    "emoji": "🍝",
    "titleScaffold": "Comida en común — ",
    "descriptionScaffold": "Una comida cocinada, para comer en grupo. Digan qué hay en el menú y si alguien puede echar una mano cocinando o limpiando.",
    "suggestedDurationMinutes": 90,
    "blurb": "Una comida cocinada, en grupo."
  },
  {
    "id": "game-night",
    "name": "Noche de juegos",
    "category": "social",
    "emoji": "🎲",
    "titleScaffold": "Noche de juegos — ",
    "descriptionScaffold": "Juegos de mesa, cartas, lo que tengan. Quienes llegan por primera vez son bienvenidas — alguien les enseña las reglas.",
    "suggestedDurationMinutes": 150,
    "blurb": "Juegos de mesa, cartas y buena compañía."
  },
  {
    "id": "movie-night",
    "name": "Noche de cine",
    "category": "social",
    "emoji": "🎬",
    "titleScaffold": "Noche de cine — ",
    "descriptionScaffold": "Elijan algo para ver en grupo. Mencionen qué se proyecta y si conviene traer un cojín o algo de picar para compartir.",
    "suggestedDurationMinutes": 150,
    "blurb": "Ver algo en grupo."
  },
  {
    "id": "skill-share",
    "name": "Intercambio de saberes",
    "category": "learning",
    "emoji": "🎓",
    "titleScaffold": "Intercambio de saberes — ",
    "descriptionScaffold": "Alguien enseña, todas aprenden — no hacen falta expertos. Digan qué se comparte y qué traer, si hace falta algo.",
    "suggestedDurationMinutes": 90,
    "blurb": "Alguien enseña, todas aprenden."
  },
  {
    "id": "craft-circle",
    "name": "Círculo de manualidades",
    "category": "learning",
    "emoji": "🧶",
    "titleScaffold": "Círculo de manualidades — ",
    "descriptionScaffold": "Traigan lo que estén haciendo y trabajen al lado de otras personas. Quienes empiezan y los proyectos a medias también tienen su lugar aquí.",
    "suggestedDurationMinutes": 120,
    "blurb": "Crear cosas al lado de otras personas."
  },
  {
    "id": "walk-hike",
    "name": "Caminata",
    "category": "social",
    "emoji": "🥾",
    "titleScaffold": "Caminata — ",
    "descriptionScaffold": "Una caminata en grupo a paso tranquilo. Anoten la distancia y la dificultad del recorrido para que sepan qué esperar, y recuerden el agua y un buen calzado.",
    "suggestedDurationMinutes": 90,
    "blurb": "Una caminata en grupo, a paso tranquilo."
  },
  {
    "id": "welcome-gathering",
    "name": "Encuentro de bienvenida",
    "category": "social",
    "emoji": "👋",
    "titleScaffold": "Encuentro de bienvenida — ",
    "descriptionScaffold": "Una forma relajada de conocer a vecinas nuevas y reencontrarse con caras conocidas. Sin agenda — solo presentaciones y buena compañía.",
    "suggestedDurationMinutes": 90,
    "blurb": "Conocer a vecinas nuevas, sin agenda."
  },
  {
    "id": "music-jam",
    "name": "Jam de música",
    "category": "social",
    "emoji": "🎵",
    "titleScaffold": "Jam de música — ",
    "descriptionScaffold": "Traigan un instrumento o solo su voz. Todos los niveles son bienvenidos — se trata de tocar en grupo, no de actuar.",
    "suggestedDurationMinutes": 120,
    "blurb": "Tocar música en grupo — todos los niveles."
  },
  {
    "id": "celebration",
    "name": "Celebración",
    "category": "celebration",
    "emoji": "🎉",
    "titleScaffold": "Celebración — ",
    "descriptionScaffold": "Celebren algo en grupo. Digan qué se celebra y si conviene traer algo para compartir.",
    "suggestedDurationMinutes": 120,
    "blurb": "Celebrar algo en grupo."
  },
  {
    "id": "work-day",
    "name": "Jornada de trabajo",
    "category": "skilled_labor",
    "emoji": "🌱",
    "titleScaffold": "Jornada de trabajo — ",
    "descriptionScaffold": "Tiempo de manos a la obra para sacar algo adelante en grupo. Describan el trabajo y qué traer, y recuerden que entre muchas manos se hace más liviano.",
    "suggestedDurationMinutes": 240,
    "blurb": "Manos a la obra, en grupo."
  },
  {
    "id": "repair-cafe",
    "name": "Café de reparación",
    "category": "skilled_labor",
    "emoji": "🔧",
    "titleScaffold": "Café de reparación — ",
    "descriptionScaffold": "Traigan algo roto y arréglenlo con ayuda de vecinas que saben de herramientas. Digan qué tipo de reparaciones se pueden hacer.",
    "suggestedDurationMinutes": 180,
    "blurb": "Arreglar cosas rotas, en grupo."
  },
  {
    "id": "care-circle",
    "name": "Círculo de cuidado",
    "category": "emotional_support",
    "emoji": "🫂",
    "titleScaffold": "Círculo de cuidado — ",
    "descriptionScaffold": "Un espacio tranquilo para acompañarse y apoyarse mutuamente. Lo que se comparte aquí, aquí se queda.",
    "suggestedDurationMinutes": 90,
    "blurb": "Acompañarse y apoyarse mutuamente."
  },
  {
    "id": "meeting",
    "name": "Reunión",
    "category": "organizing",
    "emoji": "📋",
    "titleScaffold": "Reunión — ",
    "descriptionScaffold": "Tiempo para hablar las cosas y decidir en grupo. Compartan el orden del día para que la gente venga preparada.",
    "suggestedDurationMinutes": 60,
    "blurb": "Hablar las cosas, decidir en grupo."
  }
];
