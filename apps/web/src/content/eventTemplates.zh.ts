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
// Chinese event templates (i18n Phase 2b). Loaded lazily via
// content/bundles/zh.ts — never import this statically from app
// code.
import type { EventTemplate } from "./eventTemplates";

export const EVENT_TEMPLATES_ZH: readonly EventTemplate[] = [
  {
    "id": "potluck",
    "name": "百家饭",
    "category": "social",
    "emoji": "🍲",
    "titleScaffold": "百家饭 — ",
    "descriptionScaffold": "带一道菜来分享，空着肚子来——人人都出一份力，饭菜就总有富余。除了吃的还要带什么，记得提前说一声。",
    "suggestedDurationMinutes": 120,
    "blurb": "每人带一道菜，凑成一桌饭。"
  },
  {
    "id": "shared-meal",
    "name": "聚餐",
    "category": "social",
    "emoji": "🍝",
    "titleScaffold": "聚餐 — ",
    "descriptionScaffold": "做好的一顿饭，大家坐在一起吃。说说菜单上有什么，做饭或收拾的时候欢不欢迎搭把手。",
    "suggestedDurationMinutes": 90,
    "blurb": "做好一顿饭，大家一起吃。"
  },
  {
    "id": "game-night",
    "name": "游戏之夜",
    "category": "social",
    "emoji": "🎲",
    "titleScaffold": "游戏之夜 — ",
    "descriptionScaffold": "桌游、纸牌，手头有什么就玩什么。第一次来的也欢迎——会有人教你规则。",
    "suggestedDurationMinutes": 150,
    "blurb": "桌游、纸牌，还有一屋子好伙伴。"
  },
  {
    "id": "movie-night",
    "name": "电影之夜",
    "category": "social",
    "emoji": "🎬",
    "titleScaffold": "电影之夜 — ",
    "descriptionScaffold": "挑点什么一起看。说说放的是什么，用不用自带坐垫，或带点零食传着吃。",
    "suggestedDurationMinutes": 150,
    "blurb": "一起看点什么。"
  },
  {
    "id": "skill-share",
    "name": "技能交流会",
    "category": "learning",
    "emoji": "🎓",
    "titleScaffold": "技能交流会 — ",
    "descriptionScaffold": "一个人教，大家一起学——不必是专家。说说这次交流的是什么，需要带东西的话也提一句。",
    "suggestedDurationMinutes": 90,
    "blurb": "一个人教，大家一起学。"
  },
  {
    "id": "craft-circle",
    "name": "手工圈",
    "category": "learning",
    "emoji": "🧶",
    "titleScaffold": "手工圈 — ",
    "descriptionScaffold": "带上你手头正在做的东西，和大家围坐着一起做。新手和做到一半的作品，在这里都有位置。",
    "suggestedDurationMinutes": 120,
    "blurb": "和大家一起动手做东西。"
  },
  {
    "id": "walk-hike",
    "name": "散步",
    "category": "social",
    "emoji": "🥾",
    "titleScaffold": "散步 — ",
    "descriptionScaffold": "结伴慢慢走一段。写明路线的长短和难度，让大家心里有数，也提醒一句带上水、穿双合脚的鞋。",
    "suggestedDurationMinutes": 90,
    "blurb": "结伴散步，不赶路。"
  },
  {
    "id": "welcome-gathering",
    "name": "迎新聚会",
    "category": "social",
    "emoji": "👋",
    "titleScaffold": "迎新聚会 — ",
    "descriptionScaffold": "认识新邻居、和熟面孔叙叙旧的轻松场合。没有议程——互相认识认识，自在待一会儿就好。",
    "suggestedDurationMinutes": 90,
    "blurb": "认识新邻居，没有议程。"
  },
  {
    "id": "music-jam",
    "name": "音乐即兴会",
    "category": "social",
    "emoji": "🎵",
    "titleScaffold": "音乐即兴会 — ",
    "descriptionScaffold": "带上乐器，或者只带上嗓子。什么水平都欢迎——这是一起玩音乐，不是登台表演。",
    "suggestedDurationMinutes": 120,
    "blurb": "一起玩音乐——什么水平都行。"
  },
  {
    "id": "celebration",
    "name": "庆祝会",
    "category": "celebration",
    "emoji": "🎉",
    "titleScaffold": "庆祝会 — ",
    "descriptionScaffold": "一起庆祝点什么。说说庆祝的是什么事，要不要带点东西来分享。",
    "suggestedDurationMinutes": 120,
    "blurb": "一起庆祝点什么。"
  },
  {
    "id": "work-day",
    "name": "动手日",
    "category": "skilled_labor",
    "emoji": "🌱",
    "titleScaffold": "动手日 — ",
    "descriptionScaffold": "一起动手把事情做成的时间。写清楚要干的活和要带的东西，也提一句：人多活儿轻。",
    "suggestedDurationMinutes": 240,
    "blurb": "一起动手干活的时间。"
  },
  {
    "id": "repair-cafe",
    "name": "修理咖啡日",
    "category": "skilled_labor",
    "emoji": "🔧",
    "titleScaffold": "修理咖啡日 — ",
    "descriptionScaffold": "带上坏了的东西，让摆弄惯了工具的邻居搭把手，一起修好它。说说大家都能帮着修哪些东西。",
    "suggestedDurationMinutes": 180,
    "blurb": "一起把坏了的东西修好。"
  },
  {
    "id": "care-circle",
    "name": "谈心圈",
    "category": "emotional_support",
    "emoji": "🫂",
    "titleScaffold": "谈心圈 — ",
    "descriptionScaffold": "一个温和的空间，说说各自的近况，彼此扶持。在这里说的话，只留在这里。",
    "suggestedDurationMinutes": 90,
    "blurb": "说说近况，彼此扶持。"
  },
  {
    "id": "meeting",
    "name": "碰头会",
    "category": "organizing",
    "emoji": "📋",
    "titleScaffold": "碰头会 — ",
    "descriptionScaffold": "把事情当面聊透、一起拿主意的时间。提前把议程发出来，大家好有个准备。",
    "suggestedDurationMinutes": 60,
    "blurb": "把事情聊透，一起决定。"
  }
];
