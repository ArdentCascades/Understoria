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
// Swahili translation (i18n demand-driven wave). Loaded lazily
// via content/bundles/sw.ts — never import statically from app code.
// Ids are stable and never translated; parity gates enforce structure.
import type { EventTemplate } from "./eventTemplates";

export const EVENT_TEMPLATES_SW: readonly EventTemplate[] = [
  {
    "id": "potluck",
    "name": "Chakula cha pamoja",
    "category": "social",
    "emoji": "🍲",
    "titleScaffold": "Chakula cha pamoja — ",
    "descriptionScaffold": "Leta mlo mmoja wa kugawana na uje na njaa — chakula huwa tele kila mtu akileta chake. Wajulishe watu kama kuna kingine cha kuleta zaidi ya chakula.",
    "suggestedDurationMinutes": 120,
    "blurb": "Mlo wa pamoja ambapo kila mmoja analeta chakula."
  },
  {
    "id": "shared-meal",
    "name": "Kupika na kula pamoja",
    "category": "social",
    "emoji": "🍝",
    "titleScaffold": "Kupika na kula pamoja — ",
    "descriptionScaffold": "Mlo uliopikwa, unaliwa pamoja. Taja kilicho kwenye menyu na kama watu wanaweza kutia mkono kupika au kusafisha.",
    "suggestedDurationMinutes": 90,
    "blurb": "Mlo uliopikwa, unaliwa pamoja."
  },
  {
    "id": "game-night",
    "name": "Jioni ya michezo",
    "category": "social",
    "emoji": "🎲",
    "titleScaffold": "Jioni ya michezo — ",
    "descriptionScaffold": "Bao, karata, mchezo wowote ulio nao. Wapya karibuni sana — mtu atakufundisha sheria za mchezo.",
    "suggestedDurationMinutes": 150,
    "blurb": "Bao, karata, na furaha ya kuwa pamoja."
  },
  {
    "id": "movie-night",
    "name": "Jioni ya filamu",
    "category": "social",
    "emoji": "🎬",
    "titleScaffold": "Jioni ya filamu — ",
    "descriptionScaffold": "Chagua cha kutazama pamoja. Taja kinachoonyeshwa na kama kuna haja ya kuleta mto wa kukalia au vitafunio vya kuzungusha.",
    "suggestedDurationMinutes": 150,
    "blurb": "Kutazama kitu pamoja."
  },
  {
    "id": "skill-share",
    "name": "Kubadilishana ujuzi",
    "category": "learning",
    "emoji": "🎓",
    "titleScaffold": "Kubadilishana ujuzi — ",
    "descriptionScaffold": "Mmoja anafundisha, wote wanajifunza — hakuna haja ya kuwa mtaalamu. Taja ujuzi unaopeanwa na cha kuleta, kama kipo.",
    "suggestedDurationMinutes": 90,
    "blurb": "Mmoja anafundisha, wote wanajifunza."
  },
  {
    "id": "craft-circle",
    "name": "Duara la sanaa za mikono",
    "category": "learning",
    "emoji": "🧶",
    "titleScaffold": "Duara la sanaa za mikono — ",
    "descriptionScaffold": "Leta chochote unachokitengeneza na ufanye kazi kando ya wengine. Waanzia na kazi ambazo hazijakamilika, wote wana nafasi hapa.",
    "suggestedDurationMinutes": 120,
    "blurb": "Kutengeneza vitu kando ya wengine."
  },
  {
    "id": "walk-hike",
    "name": "Matembezi / kupanda mlima",
    "category": "social",
    "emoji": "🥾",
    "titleScaffold": "Matembezi — ",
    "descriptionScaffold": "Matembezi ya pamoja kwa mwendo wa polepole. Taja urefu wa njia na ugumu wake ili watu wajue cha kutarajia, na wakumbushe kuchukua maji ya kunywa na viatu imara.",
    "suggestedDurationMinutes": 90,
    "blurb": "Matembezi ya pamoja, kwa mwendo wa polepole."
  },
  {
    "id": "welcome-gathering",
    "name": "Kukaribishana",
    "category": "social",
    "emoji": "👋",
    "titleScaffold": "Kukaribishana — ",
    "descriptionScaffold": "Njia tulivu ya kukutana na majirani wapya na kuonana tena na nyuso unazozijua. Hakuna ajenda — ni kufahamiana tu na kuwa pamoja vizuri.",
    "suggestedDurationMinutes": 90,
    "blurb": "Kutana na majirani wapya, bila ajenda."
  },
  {
    "id": "music-jam",
    "name": "Kupiga muziki pamoja",
    "category": "social",
    "emoji": "🎵",
    "titleScaffold": "Kupiga muziki pamoja — ",
    "descriptionScaffold": "Leta ala ya muziki au sauti yako tu. Wa ngazi zote karibuni — lengo ni kupiga pamoja, si kufanya onyesho.",
    "suggestedDurationMinutes": 120,
    "blurb": "Kupiga muziki pamoja — ngazi zote."
  },
  {
    "id": "celebration",
    "name": "Sherehe",
    "category": "celebration",
    "emoji": "🎉",
    "titleScaffold": "Sherehe — ",
    "descriptionScaffold": "Wakati wa kusherehekea jambo pamoja. Taja kinachosherehekewa na kama kuna kitu cha kuleta cha kugawana.",
    "suggestedDurationMinutes": 120,
    "blurb": "Kusherehekea jambo pamoja."
  },
  {
    "id": "work-day",
    "name": "Siku ya kazi ya pamoja",
    "category": "skilled_labor",
    "emoji": "🌱",
    "titleScaffold": "Kazi ya pamoja — ",
    "descriptionScaffold": "Kipindi cha kazi za mikono ili kukamilisha jambo pamoja. Eleza kazi yenyewe na cha kuleta — mikono mingi hufanya kazi iwe nyepesi.",
    "suggestedDurationMinutes": 240,
    "blurb": "Kazi za mikono, zinafanywa pamoja."
  },
  {
    "id": "repair-cafe",
    "name": "Karakana ya pamoja",
    "category": "skilled_labor",
    "emoji": "🔧",
    "titleScaffold": "Karakana ya pamoja — ",
    "descriptionScaffold": "Leta kitu kilichoharibika ukitengeneze kwa msaada wa majirani wanaozijua zana zao. Taja aina za matengenezo zinazoweza kusaidiwa hapo.",
    "suggestedDurationMinutes": 180,
    "blurb": "Kutengeneza vilivyoharibika, pamoja."
  },
  {
    "id": "care-circle",
    "name": "Duara la kujuliana hali",
    "category": "emotional_support",
    "emoji": "🫂",
    "titleScaffold": "Duara la kujuliana hali — ",
    "descriptionScaffold": "Nafasi tulivu ya kujuliana hali na kutiana moyo. Kinachosemwa hapa, kinabaki hapa.",
    "suggestedDurationMinutes": 90,
    "blurb": "Kujuliana hali na kutiana moyo."
  },
  {
    "id": "meeting",
    "name": "Mkutano",
    "category": "organizing",
    "emoji": "📋",
    "titleScaffold": "Mkutano — ",
    "descriptionScaffold": "Wakati wa kuzungumza mambo hadi mwisho na kuamua pamoja. Toa ajenda mapema ili watu waje wakiwa wamejiandaa.",
    "suggestedDurationMinutes": 60,
    "blurb": "Kuzungumza mambo hadi mwisho, kuamua pamoja."
  }
];
