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
// French event templates (i18n Phase 2b). Loaded lazily via
// content/bundles/fr.ts — never import this statically from app
// code.
import type { EventTemplate } from "./eventTemplates";

export const EVENT_TEMPLATES_FR: readonly EventTemplate[] = [
  {
    "id": "potluck",
    "name": "Repas partagé",
    "category": "social",
    "emoji": "🍲",
    "titleScaffold": "Repas partagé — ",
    "descriptionScaffold": "Apportez un plat à partager et venez avec de l'appétit — il y en a toujours assez quand tout le monde met la main à la pâte. Dites s'il y a autre chose à apporter que de la nourriture.",
    "suggestedDurationMinutes": 120,
    "blurb": "Un repas où tout le monde apporte un plat."
  },
  {
    "id": "shared-meal",
    "name": "Repas en commun",
    "category": "social",
    "emoji": "🍝",
    "titleScaffold": "Repas en commun — ",
    "descriptionScaffold": "Un repas cuisiné, mangé ensemble. Dites ce qu'il y a au menu et si on peut donner un coup de main en cuisine ou pour ranger.",
    "suggestedDurationMinutes": 90,
    "blurb": "Un repas cuisiné, mangé ensemble."
  },
  {
    "id": "game-night",
    "name": "Soirée jeux",
    "category": "social",
    "emoji": "🎲",
    "titleScaffold": "Soirée jeux — ",
    "descriptionScaffold": "Jeux de société, cartes, ce que vous avez sous la main. Les nouvelles têtes sont les bienvenues — quelqu'un vous apprendra les règles.",
    "suggestedDurationMinutes": 150,
    "blurb": "Jeux de société, cartes et bonne compagnie."
  },
  {
    "id": "movie-night",
    "name": "Soirée cinéma",
    "category": "social",
    "emoji": "🎬",
    "titleScaffold": "Soirée cinéma — ",
    "descriptionScaffold": "Choisissez quelque chose à regarder ensemble. Dites ce qui passe à l'écran et s'il faut apporter un coussin ou de quoi grignoter à faire tourner.",
    "suggestedDurationMinutes": 150,
    "blurb": "Regarder quelque chose ensemble."
  },
  {
    "id": "skill-share",
    "name": "Échange de savoir-faire",
    "category": "learning",
    "emoji": "🎓",
    "titleScaffold": "Échange de savoir-faire — ",
    "descriptionScaffold": "Quelqu'un enseigne, tout le monde apprend — pas besoin d'expert. Dites ce qui se partage et quoi apporter, s'il faut quelque chose.",
    "suggestedDurationMinutes": 90,
    "blurb": "Quelqu'un enseigne, tout le monde apprend."
  },
  {
    "id": "craft-circle",
    "name": "Cercle créatif",
    "category": "learning",
    "emoji": "🧶",
    "titleScaffold": "Cercle créatif — ",
    "descriptionScaffold": "Apportez ce que vous êtes en train de fabriquer et travaillez aux côtés des autres. Celles et ceux qui débutent et les ouvrages en cours ont toute leur place ici.",
    "suggestedDurationMinutes": 120,
    "blurb": "Fabriquer des choses aux côtés des autres."
  },
  {
    "id": "walk-hike",
    "name": "Balade / randonnée",
    "category": "social",
    "emoji": "🥾",
    "titleScaffold": "Balade — ",
    "descriptionScaffold": "Une marche ensemble, à un rythme tranquille. Indiquez la longueur et la difficulté du parcours pour que les gens sachent à quoi s'attendre, et pensez à rappeler l'eau et les bonnes chaussures.",
    "suggestedDurationMinutes": 90,
    "blurb": "Une balade ensemble, à un rythme tranquille."
  },
  {
    "id": "welcome-gathering",
    "name": "Rencontre de bienvenue",
    "category": "social",
    "emoji": "👋",
    "titleScaffold": "Rencontre de bienvenue — ",
    "descriptionScaffold": "Une façon détendue de rencontrer les nouvelles voisines et les nouveaux voisins, et de retrouver des visages familiers. Pas de programme — juste des présentations et de la bonne compagnie.",
    "suggestedDurationMinutes": 90,
    "blurb": "Rencontrer de nouvelles voisines et voisins, sans programme."
  },
  {
    "id": "music-jam",
    "name": "Jam musical",
    "category": "social",
    "emoji": "🎵",
    "titleScaffold": "Jam musical — ",
    "descriptionScaffold": "Apportez un instrument ou juste votre voix. Tous les niveaux sont bienvenus — l'idée est de jouer ensemble, pas de se produire en concert.",
    "suggestedDurationMinutes": 120,
    "blurb": "Jouer de la musique ensemble — tous niveaux."
  },
  {
    "id": "celebration",
    "name": "Fête",
    "category": "celebration",
    "emoji": "🎉",
    "titleScaffold": "Fête — ",
    "descriptionScaffold": "Marquez le coup ensemble. Dites ce qu'on célèbre et s'il faut apporter quelque chose à partager.",
    "suggestedDurationMinutes": 120,
    "blurb": "Marquer le coup, ensemble."
  },
  {
    "id": "work-day",
    "name": "Journée de chantier",
    "category": "skilled_labor",
    "emoji": "🌱",
    "titleScaffold": "Journée de chantier — ",
    "descriptionScaffold": "Du temps les mains à l'ouvrage pour faire avancer quelque chose ensemble. Décrivez le travail et quoi apporter, et rappelez que plus il y a de mains, plus c'est léger.",
    "suggestedDurationMinutes": 240,
    "blurb": "Les mains à l'ouvrage, ensemble."
  },
  {
    "id": "repair-cafe",
    "name": "Café réparation",
    "category": "skilled_labor",
    "emoji": "🔧",
    "titleScaffold": "Café réparation — ",
    "descriptionScaffold": "Apportez un objet cassé et réparez-le avec l'aide de voisines et voisins qui s'y connaissent en outils. Dites quels types de réparations sont possibles.",
    "suggestedDurationMinutes": 180,
    "blurb": "Réparer ce qui est cassé, ensemble."
  },
  {
    "id": "care-circle",
    "name": "Cercle de soutien",
    "category": "emotional_support",
    "emoji": "🫂",
    "titleScaffold": "Cercle de soutien — ",
    "descriptionScaffold": "Un espace doux pour prendre des nouvelles et se soutenir. Ce qui se partage ici reste ici.",
    "suggestedDurationMinutes": 90,
    "blurb": "Prendre des nouvelles et se soutenir."
  },
  {
    "id": "meeting",
    "name": "Réunion",
    "category": "organizing",
    "emoji": "📋",
    "titleScaffold": "Réunion — ",
    "descriptionScaffold": "Du temps pour discuter des choses et décider ensemble. Partagez l'ordre du jour pour que tout le monde puisse se préparer.",
    "suggestedDurationMinutes": 60,
    "blurb": "Discuter des choses, décider ensemble."
  }
];
