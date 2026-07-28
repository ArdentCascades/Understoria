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
// Portuguese event templates (i18n Phase 2b). Loaded lazily via
// content/bundles/pt.ts — never import this statically from app
// code.
import type { EventTemplate } from "./eventTemplates";

export const EVENT_TEMPLATES_PT: readonly EventTemplate[] = [
  {
    "id": "potluck",
    "name": "Comida compartilhada",
    "category": "social",
    "emoji": "🍲",
    "titleScaffold": "Comida compartilhada — ",
    "descriptionScaffold": "Tragam um prato para compartilhar e venham com fome — sempre tem de sobra quando todo mundo contribui. Avisem se tiver algo mais para trazer além de comida.",
    "suggestedDurationMinutes": 120,
    "blurb": "Uma refeição em que cada pessoa traz um prato."
  },
  {
    "id": "shared-meal",
    "name": "Refeição em grupo",
    "category": "social",
    "emoji": "🍝",
    "titleScaffold": "Refeição em grupo — ",
    "descriptionScaffold": "Uma refeição cozida, para comer em grupo. Digam o que tem no cardápio e se dá para alguém dar uma mão na cozinha ou na limpeza.",
    "suggestedDurationMinutes": 90,
    "blurb": "Uma refeição cozida, para comer em grupo."
  },
  {
    "id": "game-night",
    "name": "Noite de jogos",
    "category": "social",
    "emoji": "🎲",
    "titleScaffold": "Noite de jogos — ",
    "descriptionScaffold": "Jogos de tabuleiro, cartas, o que vocês tiverem. Quem chega pela primeira vez também tem lugar — alguém ensina as regras.",
    "suggestedDurationMinutes": 150,
    "blurb": "Jogos de tabuleiro, cartas e boa companhia."
  },
  {
    "id": "movie-night",
    "name": "Noite de cinema",
    "category": "social",
    "emoji": "🎬",
    "titleScaffold": "Noite de cinema — ",
    "descriptionScaffold": "Escolham algo para assistir em grupo. Digam o que vai passar e se vale trazer uma almofada ou algo para beliscar e compartilhar.",
    "suggestedDurationMinutes": 150,
    "blurb": "Assistir a algo em grupo."
  },
  {
    "id": "skill-share",
    "name": "Troca de saberes",
    "category": "learning",
    "emoji": "🎓",
    "titleScaffold": "Troca de saberes — ",
    "descriptionScaffold": "Alguém ensina, todo mundo aprende — não precisa de especialistas. Digam o que vai ser compartilhado e o que trazer, se for o caso.",
    "suggestedDurationMinutes": 90,
    "blurb": "Alguém ensina, todo mundo aprende."
  },
  {
    "id": "craft-circle",
    "name": "Círculo de artesanato",
    "category": "learning",
    "emoji": "🧶",
    "titleScaffold": "Círculo de artesanato — ",
    "descriptionScaffold": "Tragam o que estiverem fazendo e trabalhem ao lado de outras pessoas. Quem está começando e os trabalhos pela metade também têm lugar aqui.",
    "suggestedDurationMinutes": 120,
    "blurb": "Fazer coisas ao lado de outras pessoas."
  },
  {
    "id": "walk-hike",
    "name": "Caminhada",
    "category": "social",
    "emoji": "🥾",
    "titleScaffold": "Caminhada — ",
    "descriptionScaffold": "Uma caminhada em grupo, num ritmo tranquilo. Indiquem a distância e a dificuldade do percurso para as pessoas saberem o que esperar, e lembrem todo mundo da água e de um bom calçado.",
    "suggestedDurationMinutes": 90,
    "blurb": "Uma caminhada em grupo, num ritmo tranquilo."
  },
  {
    "id": "welcome-gathering",
    "name": "Encontro de boas-vindas",
    "category": "social",
    "emoji": "👋",
    "titleScaffold": "Encontro de boas-vindas — ",
    "descriptionScaffold": "Um jeito descontraído de conhecer gente nova da vizinhança e reencontrar rostos conhecidos. Sem roteiro — só apresentações e boa companhia.",
    "suggestedDurationMinutes": 90,
    "blurb": "Conhecer gente nova da vizinhança, sem roteiro."
  },
  {
    "id": "music-jam",
    "name": "Roda de música",
    "category": "social",
    "emoji": "🎵",
    "titleScaffold": "Roda de música — ",
    "descriptionScaffold": "Tragam um instrumento ou só a voz. Todos os níveis são bem-vindos — a ideia é tocar em grupo, não se apresentar.",
    "suggestedDurationMinutes": 120,
    "blurb": "Tocar música em grupo — todos os níveis."
  },
  {
    "id": "celebration",
    "name": "Celebração",
    "category": "celebration",
    "emoji": "🎉",
    "titleScaffold": "Celebração — ",
    "descriptionScaffold": "Celebrem algo em grupo. Digam o que está sendo celebrado e se vale trazer algo para compartilhar.",
    "suggestedDurationMinutes": 120,
    "blurb": "Celebrar algo em grupo."
  },
  {
    "id": "work-day",
    "name": "Mutirão",
    "category": "skilled_labor",
    "emoji": "🌱",
    "titleScaffold": "Mutirão — ",
    "descriptionScaffold": "Tempo de mão na massa para fazer algo em grupo. Descrevam o trabalho e o que trazer, e lembrem que muitas mãos deixam tudo mais leve.",
    "suggestedDurationMinutes": 240,
    "blurb": "Mão na massa, em grupo."
  },
  {
    "id": "repair-cafe",
    "name": "Café de reparos",
    "category": "skilled_labor",
    "emoji": "🔧",
    "titleScaffold": "Café de reparos — ",
    "descriptionScaffold": "Tragam algo quebrado e consertem com a ajuda de vizinhas que entendem de ferramentas. Digam que tipos de conserto dá para fazer.",
    "suggestedDurationMinutes": 180,
    "blurb": "Consertar coisas quebradas, em grupo."
  },
  {
    "id": "care-circle",
    "name": "Círculo de cuidado",
    "category": "emotional_support",
    "emoji": "🫂",
    "titleScaffold": "Círculo de cuidado — ",
    "descriptionScaffold": "Um espaço acolhedor para contar como vocês estão e apoiar uns aos outros. O que se compartilha aqui, aqui fica.",
    "suggestedDurationMinutes": 90,
    "blurb": "Escutar e apoiar uns aos outros."
  },
  {
    "id": "meeting",
    "name": "Reunião",
    "category": "organizing",
    "emoji": "📋",
    "titleScaffold": "Reunião — ",
    "descriptionScaffold": "Tempo para conversar sobre as coisas e decidir em grupo. Compartilhem a pauta para as pessoas chegarem preparadas.",
    "suggestedDurationMinutes": 60,
    "blurb": "Conversar sobre as coisas, decidir em grupo."
  }
];
