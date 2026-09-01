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

// Russian study prompts (i18n Phase 2). Loaded lazily via
// content/bundles/ru.ts — never import this statically from app
// code. Prompt ids and themes mirror study-prompts.ts;
// guides.parity.test.ts enforces the structure.

import type { StudyPrompt } from "./study-prompts";

export const STUDY_PROMPTS_RU: readonly StudyPrompt[] = [
  {
    id: "platform-1",
    theme: "platform",
    body:
      "Как жили банки времени и сети взаимопомощи, пока для них не " +
      "было программ? Что они потеряли с приходом программ и что " +
      "приобрели? Где в этом размене место Understoria?",
  },
  {
    id: "platform-2",
    theme: "platform",
    body:
      "Understoria построена на принципе «час равен часу». Какой труд " +
      "этот принцип оберегает? Какую критику навлекает? Бывает ли в " +
      "вашем сообществе, что он мешает?",
  },
  {
    id: "platform-3",
    theme: "platform",
    body:
      "Если завтра убрать приложение, что у нас останется? Этот ответ " +
      "и есть настоящий фундамент; приложение — только строительные " +
      "леса.",
  },
  {
    id: "mutual-aid-1",
    theme: "mutual_aid",
    body:
      "Dean Spade отличает взаимопомощь от благотворительности по " +
      "тому, кто принимает решения. Кто решает в вашем сообществе " +
      "прямо сейчас? А кто — нет?",
  },
  {
    id: "mutual-aid-2",
    theme: "mutual_aid",
    body:
      "Проекты взаимопомощи часто растворяются в некоммерческих " +
      "организациях или превращаются в программы, где помощь раздают " +
      "сверху вниз. Что удерживает ваше сообщество от этой тяги?",
  },
  {
    id: "mutual-aid-3",
    theme: "mutual_aid",
    body:
      "Кто в вашем сообществе не просит о помощи, хотя она нужна? " +
      "Почему?",
  },
  {
    id: "organizing-1",
    theme: "organizing",
    body:
      "McAlevey различает два пути: собирать своих (звать тех, кто " +
      "уже поддерживает) и вовлекать новых (завоёвывать тех, кто пока " +
      "не поддерживает). Ваша сеть взаимопомощи собирает своих, " +
      "вовлекает новых — или делает и то и другое?",
  },
  {
    id: "organizing-2",
    theme: "organizing",
    body:
      "Взаимопомощь и профсоюзная работа исторически питали друг " +
      "друга. Где эти связи в ваших условиях? Что возможно, но пока " +
      "не испробовано?",
  },
  {
    id: "power-1",
    theme: "power",
    body:
      "Freeman утверждает: если делать вид, что структуры нет, она не " +
      "исчезает — просто становится неписаной, и оспорить её труднее. " +
      "Какие неписаные структуры есть в вашем сообществе? Они " +
      "работают?",
  },
  {
    id: "power-2",
    theme: "power",
    body:
      "Если бы решения о развитии Understoria принимала корпорация, а " +
      "не кооператив, чем отличались бы её возможности? Запишите три " +
      "отличия.",
  },
  {
    id: "traditions-1",
    theme: "traditions",
    body:
      "Mauss и Hyde видят в даре обязательство — принять, ответить " +
      "своим даром, — которое рынок как раз стирает. Где в вашем " +
      "сообществе логика дара ещё жива, а где её вытеснил рыночный " +
      "расчёт? Важно ли это?",
  },
  {
    id: "traditions-2",
    theme: "traditions",
    body:
      "Принцип хауденосауни (Haudenosaunee) — оценивать решения на " +
      "много поколений вперёд — структурно труден для проекта, " +
      "настроенного на недельные показатели. Возьмите недавнее " +
      "решение вашего сообщества. Как оно выглядело бы, если " +
      "пересмотреть его с горизонтом в пять или семь поколений?",
  },
  {
    id: "traditions-3",
    theme: "traditions",
    body:
      "У сапатистов mandar obedeciendo — «вести, подчиняясь» — не " +
      "метафора, а устройство жизни с последствиями: кто занимает " +
      "координирующие роли и как долго. У кого в вашем сообществе " +
      "неписаная координирующая власть? Чего стоило бы закрепить её " +
      "по правилу mandar obedeciendo?",
  },
] as const;
