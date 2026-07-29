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
// Russian event templates (i18n Phase 2). Loaded lazily via
// content/bundles/ru.ts — never import this statically from app
// code.
import type { EventTemplate } from "./eventTemplates";

export const EVENT_TEMPLATES_RU: readonly EventTemplate[] = [
  {
    "id": "potluck",
    "name": "Стол вскладчину",
    "category": "social",
    "emoji": "🍲",
    "titleScaffold": "Стол вскладчину — ",
    "descriptionScaffold": "Приносите блюдо, которым готовы поделиться, и приходите голодными — когда каждый что-то приносит, еды всегда хватает. Напишите, нужно ли взять с собой что-то ещё, кроме еды.",
    "suggestedDurationMinutes": 120,
    "blurb": "Общая еда — каждый приносит своё блюдо."
  },
  {
    "id": "shared-meal",
    "name": "Общий стол",
    "category": "social",
    "emoji": "🍝",
    "titleScaffold": "Общий стол — ",
    "descriptionScaffold": "Еду готовят на всех и едят вместе. Напишите, что будет в меню и можно ли помочь с готовкой или уборкой.",
    "suggestedDurationMinutes": 90,
    "blurb": "Еду готовят и едят вместе."
  },
  {
    "id": "game-night",
    "name": "Вечер игр",
    "category": "social",
    "emoji": "🎲",
    "titleScaffold": "Вечер игр — ",
    "descriptionScaffold": "Настольные игры, карты — что у кого найдётся. Новичкам здесь рады: правила объяснят на месте.",
    "suggestedDurationMinutes": 150,
    "blurb": "Настольные игры, карты и хорошая компания."
  },
  {
    "id": "movie-night",
    "name": "Вечер кино",
    "category": "social",
    "emoji": "🎬",
    "titleScaffold": "Вечер кино — ",
    "descriptionScaffold": "Выберите, что посмотреть вместе. Напишите, что будет за фильм и стоит ли взять подушку или что-нибудь вкусное на всех.",
    "suggestedDurationMinutes": 150,
    "blurb": "Посмотреть что-нибудь вместе."
  },
  {
    "id": "skill-share",
    "name": "Обмен умениями",
    "category": "learning",
    "emoji": "🎓",
    "titleScaffold": "Обмен умениями — ",
    "descriptionScaffold": "Кто-то показывает, остальные учатся — знатоки не нужны. Напишите, чем будете делиться и что взять с собой, если что-то нужно.",
    "suggestedDurationMinutes": 90,
    "blurb": "Кто-то показывает, остальные учатся."
  },
  {
    "id": "craft-circle",
    "name": "Круг рукоделия",
    "category": "learning",
    "emoji": "🧶",
    "titleScaffold": "Круг рукоделия — ",
    "descriptionScaffold": "Приносите то, что мастерите, и работайте рядом с другими. Начинающим и незаконченным работам здесь тоже место.",
    "suggestedDurationMinutes": 120,
    "blurb": "Мастерить своё рядом с другими."
  },
  {
    "id": "walk-hike",
    "name": "Прогулка / поход",
    "category": "social",
    "emoji": "🥾",
    "titleScaffold": "Прогулка — ",
    "descriptionScaffold": "Идём вместе спокойным шагом. Напишите длину и сложность маршрута, чтобы все понимали, чего ждать, и напомните про воду и удобную обувь.",
    "suggestedDurationMinutes": 90,
    "blurb": "Прогулка вместе, спокойным шагом."
  },
  {
    "id": "welcome-gathering",
    "name": "Встреча-знакомство",
    "category": "social",
    "emoji": "👋",
    "titleScaffold": "Встреча-знакомство — ",
    "descriptionScaffold": "Спокойный повод познакомиться с новыми соседями и снова увидеть знакомые лица. Ничего не запланировано — только знакомство и хорошая компания.",
    "suggestedDurationMinutes": 90,
    "blurb": "Познакомиться с новыми соседями, без всякой программы."
  },
  {
    "id": "music-jam",
    "name": "Музыкальный джем",
    "category": "social",
    "emoji": "🎵",
    "titleScaffold": "Музыкальный джем — ",
    "descriptionScaffold": "Берите инструмент или приходите просто с голосом. Уровень не важен — здесь играют вместе, а не выступают.",
    "suggestedDurationMinutes": 120,
    "blurb": "Музыка вместе — на любом уровне."
  },
  {
    "id": "celebration",
    "name": "Праздник",
    "category": "celebration",
    "emoji": "🎉",
    "titleScaffold": "Праздник — ",
    "descriptionScaffold": "Отметьте что-то вместе. Напишите, что празднуете и стоит ли принести что-нибудь на общий стол.",
    "suggestedDurationMinutes": 120,
    "blurb": "Отметить что-то вместе."
  },
  {
    "id": "work-day",
    "name": "День общих дел",
    "category": "skilled_labor",
    "emoji": "🌱",
    "titleScaffold": "День общих дел — ",
    "descriptionScaffold": "Общая работа руками, чтобы вместе довести дело до конца. Опишите работу и что взять с собой, и напомните: чем больше рук, тем легче.",
    "suggestedDurationMinutes": 240,
    "blurb": "Общая работа руками, все вместе."
  },
  {
    "id": "repair-cafe",
    "name": "Ремонтное кафе",
    "category": "skilled_labor",
    "emoji": "🔧",
    "titleScaffold": "Ремонтное кафе — ",
    "descriptionScaffold": "Приносите что-нибудь сломанное и чините вместе с соседями, которые дружат с инструментом. Напишите, с каким ремонтом здесь помогут.",
    "suggestedDurationMinutes": 180,
    "blurb": "Чинить сломанное вместе."
  },
  {
    "id": "care-circle",
    "name": "Круг заботы",
    "category": "emotional_support",
    "emoji": "🫂",
    "titleScaffold": "Круг заботы — ",
    "descriptionScaffold": "Спокойное место, где можно рассказать, как дела, и поддержать друг друга. Что сказано здесь — здесь и остаётся.",
    "suggestedDurationMinutes": 90,
    "blurb": "Побыть рядом и поддержать друг друга."
  },
  {
    "id": "meeting",
    "name": "Общий сбор",
    "category": "organizing",
    "emoji": "📋",
    "titleScaffold": "Общий сбор — ",
    "descriptionScaffold": "Время всё обсудить и решить вместе. Напишите заранее, о чём пойдёт речь, чтобы все успели подумать.",
    "suggestedDurationMinutes": 60,
    "blurb": "Обсудить и решить вместе."
  }
];
