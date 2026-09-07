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
// Filipino translation (i18n demand-driven wave). Loaded lazily
// via content/bundles/fil.ts — never import statically from app code.
// Ids are stable and never translated; parity gates enforce structure.
import type { EventTemplate } from "./eventTemplates";

export const EVENT_TEMPLATES_FIL: readonly EventTemplate[] = [
  {
    "id": "potluck",
    "name": "Salo-salo",
    "category": "social",
    "emoji": "🍲",
    "titleScaffold": "Salo-salo — ",
    "descriptionScaffold": "Magdala ng ulam na maibabahagi at dumating nang gutom — laging sagana basta may dala ang bawat isa. Ipaalam kung may iba pang kailangang dalhin bukod sa pagkain.",
    "suggestedDurationMinutes": 120,
    "blurb": "Salo-salong may dalang ulam ang bawat isa."
  },
  {
    "id": "shared-meal",
    "name": "Lutuan at kainan",
    "category": "social",
    "emoji": "🍝",
    "titleScaffold": "Lutuan at kainan — ",
    "descriptionScaffold": "Lutong pagkain, sabay-sabay na kinakain. Sabihin kung ano ang nasa menu at kung puwedeng tumulong ang iba sa pagluluto o sa paglilinis pagkatapos.",
    "suggestedDurationMinutes": 90,
    "blurb": "Lutong pagkain, sabay-sabay na kinakain."
  },
  {
    "id": "game-night",
    "name": "Gabi ng laro",
    "category": "social",
    "emoji": "🎲",
    "titleScaffold": "Gabi ng laro — ",
    "descriptionScaffold": "Board game, baraha, kahit ano ang mayroon ka. Kahit bago ka pa lang, tuloy ka — may magtuturo sa iyo ng mga patakaran.",
    "suggestedDurationMinutes": 150,
    "blurb": "Board game, baraha, at kuwentuhan."
  },
  {
    "id": "movie-night",
    "name": "Gabi ng sine",
    "category": "social",
    "emoji": "🎬",
    "titleScaffold": "Gabi ng sine — ",
    "descriptionScaffold": "Pumili ng papanooring magkakasama. Sabihin kung ano ang palabas at kung magdadala ng uupuan o ng meryendang maipapasa-pasa.",
    "suggestedDurationMinutes": 150,
    "blurb": "Manood nang magkakasama."
  },
  {
    "id": "skill-share",
    "name": "Turuan",
    "category": "learning",
    "emoji": "🎓",
    "titleScaffold": "Turuan — ",
    "descriptionScaffold": "May isang magtuturo, lahat matututo — hindi kailangang eksperto. Sabihin kung ano ang ibabahagi at kung may kailangang dalhin.",
    "suggestedDurationMinutes": 90,
    "blurb": "May isang magtuturo, lahat matututo."
  },
  {
    "id": "craft-circle",
    "name": "Gawang-kamay",
    "category": "learning",
    "emoji": "🧶",
    "titleScaffold": "Gawang-kamay — ",
    "descriptionScaffold": "Dalhin ang anumang ginagawa mo at gumawa katabi ng iba. May puwang dito ang baguhan at ang gawang hindi pa tapos.",
    "suggestedDurationMinutes": 120,
    "blurb": "Gumawa ng mga bagay katabi ng iba."
  },
  {
    "id": "walk-hike",
    "name": "Lakad / hike",
    "category": "social",
    "emoji": "🥾",
    "titleScaffold": "Lakad — ",
    "descriptionScaffold": "Sabay-sabay na paglalakad nang dahan-dahan lang. Sabihin ang haba at hirap ng ruta para alam ng mga tao ang aasahan, at ipaalala ang tubig at maayos na sapatos.",
    "suggestedDurationMinutes": 90,
    "blurb": "Lakad nang magkakasama, dahan-dahan lang."
  },
  {
    "id": "welcome-gathering",
    "name": "Kamustahan",
    "category": "social",
    "emoji": "👋",
    "titleScaffold": "Kamustahan — ",
    "descriptionScaffold": "Relaks na paraan para makilala ang mga bagong kapitbahay at makitang muli ang mga pamilyar na mukha. Walang agenda — pagpapakilala lang at kuwentuhan.",
    "suggestedDurationMinutes": 90,
    "blurb": "Makilala ang mga bagong kapitbahay, walang agenda."
  },
  {
    "id": "music-jam",
    "name": "Tugtugan",
    "category": "social",
    "emoji": "🎵",
    "titleScaffold": "Tugtugan — ",
    "descriptionScaffold": "Magdala ng instrumento o ng boses mo lang. Baguhan man o bihasa, kasali — sabayan ito, hindi palabas.",
    "suggestedDurationMinutes": 120,
    "blurb": "Tumugtog nang magkakasama — lahat kasali."
  },
  {
    "id": "celebration",
    "name": "Pagdiriwang",
    "category": "celebration",
    "emoji": "🎉",
    "titleScaffold": "Pagdiriwang — ",
    "descriptionScaffold": "Ipagdiwang natin nang magkakasama. Sabihin kung ano ang ipinagdiriwang at kung may dadalhing maibabahagi.",
    "suggestedDurationMinutes": 120,
    "blurb": "Ipagdiwang ang isang bagay nang magkakasama."
  },
  {
    "id": "work-day",
    "name": "Bayanihan",
    "category": "skilled_labor",
    "emoji": "🌱",
    "titleScaffold": "Bayanihan — ",
    "descriptionScaffold": "Oras ng sama-samang paggawa para may matapos. Ilarawan ang gagawin at ang mga dapat dalhin — gumagaan ang buhat kapag marami ang bumubuhat.",
    "suggestedDurationMinutes": 240,
    "blurb": "Sama-samang paggawa para may matapos."
  },
  {
    "id": "repair-cafe",
    "name": "Kumpunihan",
    "category": "skilled_labor",
    "emoji": "🔧",
    "titleScaffold": "Kumpunihan — ",
    "descriptionScaffold": "Magdala ng sirang gamit at kumpunihin ito kasama ang mga kapitbahay na sanay sa mga kagamitan. Sabihin kung anong klase ng pagkukumpuni ang matutulungan dito.",
    "suggestedDurationMinutes": 180,
    "blurb": "Ayusin ang mga sirang gamit, sama-sama."
  },
  {
    "id": "care-circle",
    "name": "Damayan",
    "category": "emotional_support",
    "emoji": "🫂",
    "titleScaffold": "Damayan — ",
    "descriptionScaffold": "Isang mahinahong espasyo para magkamustahan at magdamayan. Ang ibinahagi rito, dito lang.",
    "suggestedDurationMinutes": 90,
    "blurb": "Magkamustahan at magdamayan."
  },
  {
    "id": "meeting",
    "name": "Pulong",
    "category": "organizing",
    "emoji": "📋",
    "titleScaffold": "Pulong — ",
    "descriptionScaffold": "Oras para pag-usapan nang masinsinan ang mga bagay-bagay at magpasya nang magkakasama. Ibahagi ang agenda para makapaghanda ang mga dadalo.",
    "suggestedDurationMinutes": 60,
    "blurb": "Pag-usapan nang husto, pagpasyahan nang magkakasama."
  }
];
