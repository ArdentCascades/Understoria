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
import type { StudyPrompt } from "./study-prompts";

export const STUDY_PROMPTS_KO: readonly StudyPrompt[] = [
  {
    "id": "platform-1",
    "theme": "platform",
    "body": "소프트웨어가 없던 시절, 시간은행과 서로돕기 그물망은 어떻게 움직였을까요? 소프트웨어가 오면서 무엇을 잃고 무엇을 얻었을까요? 그 주고받음 속에서 Understoria는 어디에 서 있어야 할까요?"
  },
  {
    "id": "platform-2",
    "theme": "platform",
    "body": "Understoria의 설계 원칙은 한 시간은 한 시간이라는 거예요. 이 원칙이 지키려는 건 어떤 일인가요? 어떤 비판을 부를까요? 우리 공동체에서 이 원칙이 오히려 걸림돌이 되는 경우가 있나요?"
  },
  {
    "id": "platform-3",
    "theme": "platform",
    "body": "내일 이 앱이 사라진다면, 우리에게는 무엇이 남을까요? 그 답이 진짜 기초예요. 앱은 잠시 둘러 세운 발판일 뿐이에요."
  },
  {
    "id": "mutual-aid-1",
    "theme": "mutual_aid",
    "body": "Dean Spade는 서로돕기와 자선을 “누가 결정하는가”로 구별해요. 지금 우리 공동체에서는 누가 결정을 내리고 있나요? 누구는 내리지 못하고 있나요?"
  },
  {
    "id": "mutual-aid-2",
    "theme": "mutual_aid",
    "body": "서로돕기 프로젝트는 곧잘 NGO에 흡수되거나, 한쪽이 다른 쪽에게 서비스를 베푸는 프로그램으로 바뀌어요. 우리 공동체를 그 끌림에서 지켜 주는 건 무엇인가요?"
  },
  {
    "id": "mutual-aid-3",
    "theme": "mutual_aid",
    "body": "우리 공동체에서, 도움이 필요한데도 청하지 않는 사람은 누구인가요? 왜 그럴까요?"
  },
  {
    "id": "organizing-1",
    "theme": "organizing",
    "body": "McAlevey는 불러 모으기(이미 함께하는 사람들이 자리에 나오게 하는 일)와 조직하기(아직 함께하지 않는 사람들의 마음을 얻는 일)를 구별해요. 우리의 서로돕기 그물망은 불러 모으는 프로젝트인가요, 조직하는 프로젝트인가요, 아니면 둘 다인가요?"
  },
  {
    "id": "organizing-2",
    "theme": "organizing",
    "body": "서로돕기와 노동조합 운동은 역사 속에서 서로를 길러 왔어요. 우리가 선 자리에서는 그 이음새가 어디에 있나요? 할 수 있는데 아직 해 보지 않은 일은 무엇인가요?"
  },
  {
    "id": "power-1",
    "theme": "power",
    "body": "Freeman은 구조가 없는 척한다고 구조가 없어지는 게 아니라, 그저 구조가 눈에 안 보이게 되고 문제 삼기 어려워질 뿐이라고 말해요. 우리 공동체에는 어떤 보이지 않는 구조가 있나요? 그 구조는 잘 굴러가고 있나요?"
  },
  {
    "id": "power-2",
    "theme": "power",
    "body": "Understoria의 소프트웨어 결정을 협동조합이 아니라 영리 기업이 내리고 있다면, 어떤 기능이 달라졌을까요? 세 가지를 적어 보세요."
  },
  {
    "id": "traditions-1",
    "theme": "traditions",
    "body": "Mauss와 Hyde는 선물이 의무 — 받을 의무, 그리고 이어서 건넬 의무 — 를 품고 있으며, 시장은 바로 그 의무를 지운다고 말해요. 우리 공동체에서 선물의 논리가 아직 살아 있는 곳은 어디이고, 사고파는 틀로 바뀐 곳은 어디인가요? 그게 중요한 문제일까요?"
  },
  {
    "id": "traditions-2",
    "theme": "traditions",
    "body": "결정을 여러 세대에 걸쳐 헤아리는 Haudenosaunee의 원칙은, 주 단위 지표에 맞춰 굴러가는 프로젝트에게는 구조적으로 어려운 일이에요. 우리 공동체가 최근에 내린 결정을 하나 골라 보세요. 다섯 세대, 일곱 세대의 지평에서 다시 헤아려 보면 어떻게 보일까요?"
  },
  {
    "id": "traditions-3",
    "theme": "traditions",
    "body": "사파티스타의 mandar obedeciendo — 복종하며 이끌기 — 는 비유가 아니에요. 조율하는 역할을 누가 얼마 동안 맡는지에 실제 결과를 미치는, 구조에 새긴 약속이에요. 우리 공동체에서 드러나지 않게 조율하는 힘을 쥔 사람은 누구인가요? 그 힘을 mandar obedeciendo 아래 공식적으로 세운다면, 무엇을 치러야 할까요?"
  }
];
