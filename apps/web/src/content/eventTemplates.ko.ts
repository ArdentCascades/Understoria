/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
// Korean translation (i18n post-wave languages). Loaded lazily
// via content/bundles/ko.ts — never import statically from app code.
// Ids are stable and never translated; parity gates enforce structure.
import type { EventTemplate } from "./eventTemplates";

export const EVENT_TEMPLATES_KO: readonly EventTemplate[] = [
  {
    "id": "potluck",
    "name": "십시일반 밥상",
    "category": "social",
    "emoji": "🍲",
    "titleScaffold": "십시일반 밥상 — ",
    "descriptionScaffold": "나눠 먹을 음식을 한 가지 들고, 배는 비우고 오세요 — 모두가 조금씩 보태면 언제나 넉넉해요. 음식 말고도 가져올 게 있다면 미리 알려 주세요.",
    "suggestedDurationMinutes": 120,
    "blurb": "저마다 음식 한 가지씩 들고 모이는 밥상이에요."
  },
  {
    "id": "shared-meal",
    "name": "한솥밥",
    "category": "social",
    "emoji": "🍝",
    "titleScaffold": "한솥밥 — ",
    "descriptionScaffold": "함께 지어 함께 먹는 밥이에요. 메뉴가 무엇인지, 요리나 설거지에 손을 보탤 수 있는지 적어 주세요.",
    "suggestedDurationMinutes": 90,
    "blurb": "함께 지어, 함께 먹는 한 끼예요."
  },
  {
    "id": "game-night",
    "name": "게임의 밤",
    "category": "social",
    "emoji": "🎲",
    "titleScaffold": "게임의 밤 — ",
    "descriptionScaffold": "보드게임, 카드, 뭐든 있는 대로 좋아요. 처음 오는 사람도 환영이에요 — 규칙은 누군가 가르쳐 줄 거예요.",
    "suggestedDurationMinutes": 150,
    "blurb": "보드게임과 카드, 그리고 좋은 어울림이에요."
  },
  {
    "id": "movie-night",
    "name": "영화의 밤",
    "category": "social",
    "emoji": "🎬",
    "titleScaffold": "영화의 밤 — ",
    "descriptionScaffold": "함께 볼 것을 하나 골라요. 무엇을 트는지, 방석이나 돌려 먹을 간식을 가져오면 좋은지 알려 주세요.",
    "suggestedDurationMinutes": 150,
    "blurb": "다 같이 무언가를 봐요."
  },
  {
    "id": "skill-share",
    "name": "잘하는 것 나누기",
    "category": "learning",
    "emoji": "🎓",
    "titleScaffold": "잘하는 것 나누기 — ",
    "descriptionScaffold": "한 사람이 가르치고 모두가 배워요 — 전문가일 필요는 없어요. 무엇을 나누는지, 가져올 게 있다면 무엇인지 적어 주세요.",
    "suggestedDurationMinutes": 90,
    "blurb": "한 사람이 가르치고, 모두가 배워요."
  },
  {
    "id": "craft-circle",
    "name": "만들기 모임",
    "category": "learning",
    "emoji": "🧶",
    "titleScaffold": "만들기 모임 — ",
    "descriptionScaffold": "만들고 있는 것을 무엇이든 들고 와서, 다른 사람들 곁에서 함께 만들어요. 초보도, 만들다 만 것도 모두 이곳에 어울려요.",
    "suggestedDurationMinutes": 120,
    "blurb": "다른 사람들 곁에서 무언가를 만들어요."
  },
  {
    "id": "walk-hike",
    "name": "산책 / 산행",
    "category": "social",
    "emoji": "🥾",
    "titleScaffold": "산책 — ",
    "descriptionScaffold": "느긋한 걸음으로 함께 걷는 산책이에요. 어떤 길일지 알 수 있게 거리와 난이도를 적고, 물과 편한 신발을 챙기라고 일러 주세요.",
    "suggestedDurationMinutes": 90,
    "blurb": "느긋하게, 함께 걷는 산책이에요."
  },
  {
    "id": "welcome-gathering",
    "name": "맞이 모임",
    "category": "social",
    "emoji": "👋",
    "titleScaffold": "맞이 모임 — ",
    "descriptionScaffold": "새 이웃을 만나고 낯익은 얼굴들과 다시 이어지는 편안한 자리예요. 정해진 순서는 없어요 — 서로 인사 나누며 어울리면 돼요.",
    "suggestedDurationMinutes": 90,
    "blurb": "새 이웃을 만나요 — 정해진 순서는 없어요."
  },
  {
    "id": "music-jam",
    "name": "음악 한마당",
    "category": "social",
    "emoji": "🎵",
    "titleScaffold": "음악 한마당 — ",
    "descriptionScaffold": "악기를 가져와도, 목소리만 가져와도 좋아요. 실력은 상관없어요 — 무대에 서는 게 아니라 함께 연주하는 자리니까요.",
    "suggestedDurationMinutes": 120,
    "blurb": "실력에 상관없이, 함께 음악을 연주해요."
  },
  {
    "id": "celebration",
    "name": "잔치",
    "category": "celebration",
    "emoji": "🎉",
    "titleScaffold": "잔치 — ",
    "descriptionScaffold": "무언가를 함께 기념해요. 무엇을 축하하는지, 나눠 먹을 것을 가져오면 좋은지 적어 주세요.",
    "suggestedDurationMinutes": 120,
    "blurb": "무언가를 함께 기념해요."
  },
  {
    "id": "work-day",
    "name": "함께 일하는 날",
    "category": "skilled_labor",
    "emoji": "🌱",
    "titleScaffold": "함께 일하는 날 — ",
    "descriptionScaffold": "직접 손을 움직여 무언가를 함께 해내는 시간이에요. 무슨 일인지, 뭘 가져오면 좋은지 적어 주세요 — 손이 많을수록 일은 가벼워져요.",
    "suggestedDurationMinutes": 240,
    "blurb": "손을 움직이는 시간, 함께해요."
  },
  {
    "id": "repair-cafe",
    "name": "수리 카페",
    "category": "skilled_labor",
    "emoji": "🔧",
    "titleScaffold": "수리 카페 — ",
    "descriptionScaffold": "고장 난 물건을 들고 오면, 공구를 잘 다루는 이웃들의 도움으로 함께 고쳐요. 어떤 수리를 도울 수 있는지 적어 주세요.",
    "suggestedDurationMinutes": 180,
    "blurb": "고장 난 것들을 함께 고쳐요."
  },
  {
    "id": "care-circle",
    "name": "마음 돌봄 모임",
    "category": "emotional_support",
    "emoji": "🫂",
    "titleScaffold": "마음 돌봄 모임 — ",
    "descriptionScaffold": "서로의 안부를 묻고 마음을 받쳐 주는 잔잔한 자리예요. 여기서 나눈 이야기는 여기에 남아요.",
    "suggestedDurationMinutes": 90,
    "blurb": "안부를 묻고, 서로를 받쳐 줘요."
  },
  {
    "id": "meeting",
    "name": "의논 모임",
    "category": "organizing",
    "emoji": "📋",
    "titleScaffold": "의논 모임 — ",
    "descriptionScaffold": "이야기를 나누고 함께 결정하는 시간이에요. 의논할 거리를 미리 나눠서, 준비하고 올 수 있게 해 주세요.",
    "suggestedDurationMinutes": 60,
    "blurb": "이야기를 나누고, 함께 결정해요."
  }
];
