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
// Tibetan event templates, translated from eventTemplates.en.ts
// following docs/i18n-glossary/bo.md. Loaded lazily via
// content/bundles/bo.ts.
import type { EventTemplate } from "./eventTemplates";

export const EVENT_TEMPLATES_BO: readonly EventTemplate[] = [
  {
    "id": "potluck",
    "name": "ཟས་བསྡུས་སྟོན་མོ།",
    "category": "social",
    "emoji": "🍲",
    "titleScaffold": "ཟས་བསྡུས་སྟོན་མོ་— ",
    "descriptionScaffold": "མཉམ་སྤྱོད་ལ་ཁ་ལག་ཅིག་ཁྱེར་ནས་གྲོད་ཁོག་ལྟོགས་བཞིན་ཤོག་— ཚང་མས་ཆ་ཤས་ལེན་ན་རྟག་ཏུ་འདང་ངེས་ཡོད། ཁ་ལག་མིན་པའི་ཁྱེར་དགོས་ཡོད་ན་མི་རྣམས་ལ་ཤོད།",
    "suggestedDurationMinutes": 120,
    "blurb": "ཚང་མས་ཁ་ལག་རེ་ཁྱེར་བའི་མཉམ་ཟས།"
  },
  {
    "id": "shared-meal",
    "name": "མཉམ་ཟས།",
    "category": "social",
    "emoji": "🍝",
    "titleScaffold": "མཉམ་ཟས་— ",
    "descriptionScaffold": "བཙོས་པའི་ཁ་ལག མཉམ་དུ་ཟ་བ། ཟས་ཐོར་ཅི་ཡོད་དང་ཁ་ལག་བཟོ་བའམ་གཙང་བཟོར་ལག་རོགས་བྱེད་ཆོག་མིན་ཤོད།",
    "suggestedDurationMinutes": 90,
    "blurb": "བཙོས་པའི་ཁ་ལག མཉམ་དུ་ཟོས།"
  },
  {
    "id": "game-night",
    "name": "རྩེད་མོའི་དགོང་མོ།",
    "category": "social",
    "emoji": "🎲",
    "titleScaffold": "རྩེད་མོའི་དགོང་མོ་— ",
    "descriptionScaffold": "པང་རྩེད་དང་ཤོག་རྩེད། ཁྱེད་ལ་ཅི་ཡོད་གང་རུང་། གསར་པར་དགའ་བསུ་— སྒྲིག་གཞི་སུ་ཞིག་གིས་སློབ་ཀྱི་རེད།",
    "suggestedDurationMinutes": 150,
    "blurb": "པང་རྩེད་དང་ཤོག་རྩེད། གྲོགས་བཟང་བཅས།"
  },
  {
    "id": "movie-night",
    "name": "གློག་བརྙན་དགོང་མོ།",
    "category": "social",
    "emoji": "🎬",
    "titleScaffold": "གློག་བརྙན་དགོང་མོ་— ",
    "descriptionScaffold": "མཉམ་དུ་ལྟ་རྒྱུ་ཞིག་འདེམས། ཅི་སྟོན་མིན་དང་འབོལ་གདན་ནམ་མཉམ་སྤྱོད་ཟས་ཕྲན་ཁྱེར་དགོས་མིན་ཤོད།",
    "suggestedDurationMinutes": 150,
    "blurb": "མཉམ་དུ་ཅིག་ལྟོས།"
  },
  {
    "id": "skill-share",
    "name": "ལག་རྩལ་སྤེལ་རེས།",
    "category": "learning",
    "emoji": "🎓",
    "titleScaffold": "ལག་རྩལ་སྤེལ་རེས་— ",
    "descriptionScaffold": "གཅིག་གིས་སློབ་ཅིང་ཚང་མས་སྦྱོང་— ཆེད་མཁས་མི་དགོས། ཅི་སྤེལ་མིན་དང་ཁྱེར་དགོས་ཡོད་ན་ཅི་ཡིན་ཤོད།",
    "suggestedDurationMinutes": 90,
    "blurb": "གཅིག་གིས་སློབ། ཚང་མས་སྦྱོང་།"
  },
  {
    "id": "craft-circle",
    "name": "ལག་ཤེས་སྐོར།",
    "category": "learning",
    "emoji": "🧶",
    "titleScaffold": "ལག་ཤེས་སྐོར་— ",
    "descriptionScaffold": "བཟོ་བཞིན་པ་གང་ཡིན་ཁྱེར་ནས་གཞན་གྱི་འགྲམ་དུ་ལས་ཀ་བྱོས། གསར་སྦྱོང་བ་དང་ཕྱེད་ཚར་ལས་གཉིས་ཀ་འདིར་འཚམས།",
    "suggestedDurationMinutes": 120,
    "blurb": "གཞན་གྱི་འགྲམ་དུ་དངོས་པོ་བཟོས།"
  },
  {
    "id": "walk-hike",
    "name": "གོམ་འགྲུལ།",
    "category": "social",
    "emoji": "🥾",
    "titleScaffold": "གོམ་འགྲུལ་— ",
    "descriptionScaffold": "དལ་མོའི་གོམ་སྟབས་ཀྱིས་མཉམ་འགྲུལ། མི་རྣམས་ཀྱིས་ཤེས་ཆེད་ལམ་གྱི་རིང་ཚད་དང་དཀའ་ཚད་ཤོད་ཅིང་ཆུ་དང་ལྷམ་བཟང་དྲན་བརྡ་སྤྲོད།",
    "suggestedDurationMinutes": 90,
    "blurb": "མཉམ་འགྲུལ། དལ་མོའི་གོམ་སྟབས།"
  },
  {
    "id": "welcome-gathering",
    "name": "དགའ་བསུའི་འདུ་འཛོམས།",
    "category": "social",
    "emoji": "👋",
    "titleScaffold": "དགའ་བསུའི་འདུ་འཛོམས་— ",
    "descriptionScaffold": "ཁྱིམ་མཚེས་གསར་པ་ངོ་ཤེས་དང་ངོ་ཤེས་རྙིང་པ་དང་ཕྱིར་འཕྲད་ཀྱི་ལྷོད་ལམ། གྲོས་གཞི་མེད་— ངོ་སྤྲོད་དང་གྲོགས་བཟང་ཙམ།",
    "suggestedDurationMinutes": 90,
    "blurb": "ཁྱིམ་མཚེས་གསར་པ་ཐུག གྲོས་གཞི་མེད།"
  },
  {
    "id": "music-jam",
    "name": "རོལ་དབྱངས་མཉམ་རྩེད།",
    "category": "social",
    "emoji": "🎵",
    "titleScaffold": "རོལ་དབྱངས་མཉམ་རྩེད་— ",
    "descriptionScaffold": "རོལ་ཆ་ཞིག་གམ་སྐད་ཙམ་ཁྱེར་ཤོག རིམ་པ་ཚང་མར་དགའ་བསུ་— འདི་མཉམ་རྩེད་ཡིན་གྱི་འཁྲབ་སྟོན་མིན།",
    "suggestedDurationMinutes": 120,
    "blurb": "མཉམ་དུ་རོལ་དབྱངས་རྩེད་— རིམ་པ་ཚང་མ།"
  },
  {
    "id": "celebration",
    "name": "དགའ་སྟོན།",
    "category": "celebration",
    "emoji": "🎉",
    "titleScaffold": "དགའ་སྟོན་— ",
    "descriptionScaffold": "ཅིག་མཉམ་དུ་རྟགས་འཛིན། ཅི་ལ་དགའ་སྟོན་མིན་དང་མཉམ་སྤྱོད་ཁྱེར་དགོས་མིན་ཤོད།",
    "suggestedDurationMinutes": 120,
    "blurb": "ཅིག་མཉམ་དུ་རྟགས་འཛིན།"
  },
  {
    "id": "work-day",
    "name": "མཉམ་ལས་ཉིན་མོ།",
    "category": "skilled_labor",
    "emoji": "🌱",
    "titleScaffold": "མཉམ་ལས་ཉིན་མོ་— ",
    "descriptionScaffold": "ལག་ལེན་གྱིས་ཅིག་མཉམ་དུ་སྒྲུབ་པའི་དུས། ལས་ཀ་དང་ཁྱེར་དགོས་འགྲེལ་ཞིང་ལག་པ་མང་ན་ཡང་དུ་འགྲོ་བ་ཤོད།",
    "suggestedDurationMinutes": 240,
    "blurb": "ལག་ལེན་དུས། མཉམ་དུ་སྒྲུབ།"
  },
  {
    "id": "repair-cafe",
    "name": "བཟོ་བཅོས་ཇ་ཁང་།",
    "category": "skilled_labor",
    "emoji": "🔧",
    "titleScaffold": "བཟོ་བཅོས་ཇ་ཁང་— ",
    "descriptionScaffold": "ཆག་པ་ཞིག་ཁྱེར་ཤོག་— ལག་ཆར་བྱང་ཆུབ་པའི་ཁྱིམ་མཚེས་ཀྱི་རོགས་ཀྱིས་བཟོས། བཟོ་བཅོས་རིགས་གང་ལ་རོགས་ཐུབ་མིན་ཤོད།",
    "suggestedDurationMinutes": 180,
    "blurb": "ཆག་པ་མཉམ་དུ་བཟོས།"
  },
  {
    "id": "care-circle",
    "name": "ལྟ་སྐྱོང་སྐོར།",
    "category": "emotional_support",
    "emoji": "🫂",
    "titleScaffold": "ལྟ་སྐྱོང་སྐོར་— ",
    "descriptionScaffold": "གནས་འདྲི་དང་ཕན་ཚུན་རྒྱབ་སྐྱོར་གྱི་འཇམ་སའི་ས་ཆ། འདིར་བཤད་པ་འདིར་གནས།",
    "suggestedDurationMinutes": 90,
    "blurb": "གནས་འདྲི་དང་ཕན་ཚུན་རྒྱབ་སྐྱོར།"
  },
  {
    "id": "meeting",
    "name": "ཚོགས་འདུ།",
    "category": "organizing",
    "emoji": "📋",
    "titleScaffold": "ཚོགས་འདུ་— ",
    "descriptionScaffold": "དོན་དག་ཁ་བརྡ་དང་མཉམ་ཐག་གཅོད་ཀྱི་དུས། མི་རྣམས་གྲ་སྒྲིག་ངང་ཡོང་ཐུབ་པར་གྲོས་གཞི་སྤེལ།",
    "suggestedDurationMinutes": 60,
    "blurb": "ཁ་བརྡ་བྱས། མཉམ་དུ་ཐག་གཅོད།"
  }
];
