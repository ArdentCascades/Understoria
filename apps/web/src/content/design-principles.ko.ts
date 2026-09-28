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
import type { DesignPrinciple } from "./design-principles";

export const DESIGN_PRINCIPLES_KO: readonly DesignPrinciple[] = [
  {
    "id": "equal-time",
    "title": "한 시간은 언제나 한 시간이에요",
    "statement": "무슨 일이었든, 도움 한 시간은 언제나 똑같은 한 시간으로 기록돼요.",
    "example": "시장 가격을 매겨 본 초기 시간은행들은, 마음 돌봄과 아이 돌봄 — 여성과 장애가 있는 구성원들이 가장 많이 해 온 일 — 이 늘 가장 낮게 매겨진다는 걸 알게 됐어요. 똑같은 한 시간은 이를 구조에서부터 바로잡는 방법이에요."
  },
  {
    "id": "no-leaderboards",
    "title": "순위표도 개인 점수도 없어요",
    "statement": "나아감은 공동체 수준에서 기록돼요. 재는 단위는 “나”가 아니라 “우리”예요.",
    "example": "Couchsurfing이 평판 점수를 도입하자, 호스트들은 점수를 꾸미기 시작했고, 가장 취약한 손님들 — 높은 평점을 돌려줄 수 없던 사람들 — 은 시스템에서 완전히 밀려났어요."
  },
  {
    "id": "no-notifications",
    "title": "조용한 게 기본이에요",
    "statement": "무엇도 나를 다시 불러들이려고 울리지 않아요. 앱을 열면 기다리는 일을 보여 줄 뿐이에요. 알림은 직접 청했을 때만, 건너편에 사람이나 시계가 있는 일에만 있고 — 모든 알림은 처음부터 꺼져 있어요.",
    "example": "코로나 시기 서로돕기를 꾸리던 사람들은, 알림으로 굴러가는 도구가 가장 헌신적인 구성원 — 공동체가 결코 잃어서는 안 되는 사람들 — 부터 먼저 지치게 만든다고 입을 모아 말했어요. 이 원칙이 딛고 선 것은 격식을 갖춘 연구가 아니라 바로 그 경험이에요. 선택형 알림이 들어왔을 때 이 원칙은 폐기된 게 아니라 다듬어졌어요: 붙잡아 두려는 장치는 여전히 금지예요 — 달라진 건, 자기가 맡은 시간대에 깨워 달라고 청한 구성원은 이제 깨워 줄 수 있다는 것뿐이에요."
  },
  {
    "id": "solidarity-not-shame",
    "title": "부끄러움이 아니라 연대예요",
    "statement": "어떤 상황도 멈췄다, 늦었다, 실패했다는 틀로 말하지 않아요. 여력은 변하는 법이고, 시스템은 누구도 탓하지 않은 채 거기에 맞춰요.",
    "example": "긱 경제 플랫폼들은 “뒤처지고 있어요”라는 찌르기로 더 많은 노동을 짜내요. 가장 크게 흔들리는 노동자들은 이미 위기를 지나고 있는 사람들 — 바로 서로돕기가 곁에 있으려고 존재하는 그 사람들이에요."
  },
  {
    "id": "community-authority",
    "title": "공동체가 곧 권위예요",
    "statement": "여기엔 관리자가 없어요. 공동체 결정은 한 사람의 힘이 아니라 공동체의 제안을 거쳐요.",
    "example": "몬드라곤 협동조합들은 60년 넘게, 일하는 사람들이 스스로 결정하는 쪽이 관리자가 결정하는 쪽보다 공평함에서도 오래감에서도 낫다는 걸 보여 줬어요. “관리자”라는 역할은 필연이 아니라 설계상의 선택일 뿐이에요."
  },
  {
    "id": "asking-never-gated",
    "title": "도움을 청하는 데 문턱이 없어요",
    "statement": "새 구성원은 누구나 씨앗 시간을 갖고 시작해요. 주기 전에 먼저 받아도 돼요.",
    "example": "먼저 쌓아야 쓸 수 있게 한 시간은행들에서는, 가장 취약한 구성원들 — 나이 든 사람, 갓 도착한 사람, 위기 한가운데의 사람 — 이 끝내 도움을 청하지 못했어요. 씨앗 시간은 이를 구조에서부터 바로잡는 방법이에요."
  },
  {
    "id": "privacy-precondition",
    "title": "프라이버시가 먼저예요",
    "statement": "이메일도, 전화번호도 없고, 기록은 최소한만 남아요. 내 신원은 내 기기에 있는 암호학적 열쇠예요.",
    "example": "디지털로 이름 올리기 용지를 받던 노동자 센터들은, 구성원 명단을 법원 명령으로 내놓아야 했거나 고용주에게 새어 나가는 일을 겪었어요. 함께 움직이려면 내용만이 아니라, 누가 함께하는지 그 자체가 지켜져야 해요."
  },
  {
    "id": "deliberation-over-speed",
    "title": "속도보다 깊은 의논",
    "statement": "제안은 정해 둘 수 있는 기간 동안 열려 있어요. 합의에 필요한 건 머릿수만이 아니라 시간이에요.",
    "example": "협동조합에서 온라인 투표를 서둘러 진행하면, 밤에 일하는 사람들, 누군가를 돌보는 사람들, 인터넷이 닿기 어려운 구성원들의 목소리가 번번이 빠졌어요. 기본 3일의 의논 기간은 모두에게 실제로 의견을 보탤 기회를 줘요 (공동체가 조절할 수 있고, 가장 짧게는 1일까지예요)."
  },
  {
    "id": "no-post-editing",
    "title": "고치는 대신 다시 올리는 이유",
    "statement": "글이 공동체에 한번 나가면, 몰래 고치거나 지울 수 없어요 — 무엇을 청했는지의 기록이, 그 글을 본 모두에게 믿을 수 있는 채로 남아요.",
    "example": "글을 소리 없이 고칠 수 있는 플랫폼에서는 발뺌이 문제가 돼요 — “그런 말 한 적 없어요”를 가려낼 길이 없어져요. 원래 글은 그대로 두고, 바꿀 게 있으면 다시 올리는 흐름은 유연함과 책임을 둘 다 지켜요."
  },
  {
    "id": "no-read-receipts",
    "title": "메시지에 읽음 표시가 없어요",
    "statement": "메시지를 언제 읽었는지 보낸 사람에게 알리지 않아요. 누가 누구와 이야기하는지는, 위협 모델이 가장 앞서 지키는 관계의 그물이에요.",
    "example": "WhatsApp의 파란 체크 표시는 곧바로 답해야 한다는 압박을 만들었고, 폭력적인 파트너가 답장 시간을 감시할 수 있게 했어요. 읽음 표시를 없애면 그 감시의 발판 자체가 사라져요."
  },
  {
    "id": "no-activity-search",
    "title": "활동으로 구성원을 찾을 수 없어요",
    "statement": "“누가 제일 활발했는지”, “누가 제일 많이 도왔는지”는 검색할 수 없어요. 활동의 패턴은 감시의 재료가 되니까요.",
    "example": "Strava가 활동을 모은 히트맵을 공개했을 때, 비밀 군사 기지의 위치가 얼결에 드러났어요. 한 사람 한 사람의 활동 패턴은 그보다 더 많은 걸 드러내요 — 누가, 언제, 누구와 함께 움직이고 있는지를요."
  },
  {
    "id": "follows-not-blocked",
    "title": "할 일에는 “앞선 일”이 있을 뿐, “막힌 일”은 없어요",
    "statement": "다른 일을 기다리는 할 일은 순서가 정해진 것이지, 막혀서 멈춘 게 아니에요. 어떤 말로 담느냐가 그 일을 대하는 마음을 만들어요.",
    "example": "할 일에 “막힘”이라는 딱지를 붙이는 프로젝트 관리 도구들은 탓하는 관계를 만들어요 — 누군가가 누군가를 “막고” 있는 셈이 되니까요. “앞선 일”은 같은 이어짐을 자연스러운 순서로 말해서, 사람 사이의 마찰을 걷어 내요."
  }
];
