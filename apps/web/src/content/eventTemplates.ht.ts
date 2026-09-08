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
// Haitian Creole translation (i18n demand-driven wave). Loaded lazily
// via content/bundles/ht.ts — never import statically from app code.
// Ids are stable and never translated; parity gates enforce structure.
import type { EventTemplate } from "./eventTemplates";

export const EVENT_TEMPLATES_HT: readonly EventTemplate[] = [
  {
    "id": "potluck",
    "name": "Manje chak moun pote",
    "category": "social",
    "emoji": "🍲",
    "titleScaffold": "Manje chak moun pote — ",
    "descriptionScaffold": "Pote yon plat pou pataje epi vini ak grangou — lè chak moun mete men, manje toujou rive pou tout moun. Fè moun yo konnen si gen lòt bagay pou pote apa manje.",
    "suggestedDurationMinutes": 120,
    "blurb": "Yon repa kote chak moun pote yon plat."
  },
  {
    "id": "shared-meal",
    "name": "Manje ansanm",
    "category": "social",
    "emoji": "🍝",
    "titleScaffold": "Manje ansanm — ",
    "descriptionScaffold": "Yon manje kwit, pou manje ansanm. Di sa k ap sou tab la epi si moun ka lonje men nan kwit manje oswa nan netwayaj.",
    "suggestedDurationMinutes": 90,
    "blurb": "Yon manje kwit, manje ansanm."
  },
  {
    "id": "game-night",
    "name": "Sware jwèt",
    "category": "social",
    "emoji": "🎲",
    "titleScaffold": "Sware jwèt — ",
    "descriptionScaffold": "Jwèt sosyete, kat, domino — sa ou genyen. Moun ki fèk vini gen plas yo — gen yon moun k ap montre w kijan pou jwe.",
    "suggestedDurationMinutes": 150,
    "blurb": "Jwèt, kat, domino, ak bon konpayi."
  },
  {
    "id": "movie-night",
    "name": "Sware fim",
    "category": "social",
    "emoji": "🎬",
    "titleScaffold": "Sware fim — ",
    "descriptionScaffold": "Chwazi yon bagay pou gade ansanm. Di ki fim k ap pase epi si moun ta dwe pote yon kousen oswa yon ti goute pou fè pase.",
    "suggestedDurationMinutes": 150,
    "blurb": "Gade yon bagay ansanm."
  },
  {
    "id": "skill-share",
    "name": "Youn montre lòt",
    "category": "learning",
    "emoji": "🎓",
    "titleScaffold": "Youn montre lòt — ",
    "descriptionScaffold": "Yon moun montre, tout moun aprann — ou pa bezwen ekspè. Di sa k ap pataje a ak sa pou pote, si gen yon bagay pou pote.",
    "suggestedDurationMinutes": 90,
    "blurb": "Yon moun montre, tout moun aprann."
  },
  {
    "id": "craft-circle",
    "name": "Atizana ansanm",
    "category": "learning",
    "emoji": "🧶",
    "titleScaffold": "Atizana ansanm — ",
    "descriptionScaffold": "Pote sa w ap fè a epi travay bò kote lòt moun. Moun k ap kòmanse ak travay ki poko fini gen plas yo la a tou.",
    "suggestedDurationMinutes": 120,
    "blurb": "Fè bagay bò kote lòt moun."
  },
  {
    "id": "walk-hike",
    "name": "Ti mache",
    "category": "social",
    "emoji": "🥾",
    "titleScaffold": "Ti mache — ",
    "descriptionScaffold": "Yon ti mache ansanm, san prese. Di longè wout la ak jan l difisil pou moun konnen sa k ap tann yo, epi raple yo pote dlo ak bon soulye.",
    "suggestedDurationMinutes": 90,
    "blurb": "Yon ti mache ansanm, san prese."
  },
  {
    "id": "welcome-gathering",
    "name": "Fè konesans",
    "category": "social",
    "emoji": "👋",
    "titleScaffold": "Fè konesans — ",
    "descriptionScaffold": "Yon fason poze pou rankontre nouvo vwazen epi retrouve figi ou konnen deja. Pa gen ajanda — annik prezantasyon ak bon konpayi.",
    "suggestedDurationMinutes": 90,
    "blurb": "Rankontre nouvo vwazen, san ajanda."
  },
  {
    "id": "music-jam",
    "name": "Mizik ansanm",
    "category": "social",
    "emoji": "🎵",
    "titleScaffold": "Mizik ansanm — ",
    "descriptionScaffold": "Pote yon enstriman oswa annik vwa ou. Tout nivo gen plas yo — se jwe ansanm ki konte, se pa fè espektak.",
    "suggestedDurationMinutes": 120,
    "blurb": "Jwe mizik ansanm — tout nivo."
  },
  {
    "id": "celebration",
    "name": "Fèt",
    "category": "celebration",
    "emoji": "🎉",
    "titleScaffold": "Fèt — ",
    "descriptionScaffold": "Make yon bagay ansanm. Di sa k ap fete a epi si pou moun pote yon bagay pou pataje.",
    "suggestedDurationMinutes": 120,
    "blurb": "Make yon bagay ansanm."
  },
  {
    "id": "work-day",
    "name": "Konbit",
    "category": "skilled_labor",
    "emoji": "🌱",
    "titleScaffold": "Konbit — ",
    "descriptionScaffold": "Tan pou mete men ansanm pou fè yon bagay fèt. Dekri travay la ak sa pou pote — men anpil, chay pa lou.",
    "suggestedDurationMinutes": 240,
    "blurb": "Mete men ansanm pou fè l fèt."
  },
  {
    "id": "repair-cafe",
    "name": "Kafe reparasyon",
    "category": "skilled_labor",
    "emoji": "🔧",
    "titleScaffold": "Kafe reparasyon — ",
    "descriptionScaffold": "Pote yon bagay ki kraze epi repare l ak èd vwazen ki konn manyen zouti. Di ki kalite reparasyon moun ka jwenn èd pou yo.",
    "suggestedDurationMinutes": 180,
    "blurb": "Repare sa ki kraze, ansanm."
  },
  {
    "id": "care-circle",
    "name": "Sèk pran swen",
    "category": "emotional_support",
    "emoji": "🫂",
    "titleScaffold": "Sèk pran swen — ",
    "descriptionScaffold": "Yon ti espas dou pou pran nouvèl youn lòt epi soutni youn lòt. Sa ki pale la a rete la a.",
    "suggestedDurationMinutes": 90,
    "blurb": "Pran nouvèl youn lòt, soutni youn lòt."
  },
  {
    "id": "meeting",
    "name": "Reyinyon",
    "category": "organizing",
    "emoji": "📋",
    "titleScaffold": "Reyinyon — ",
    "descriptionScaffold": "Tan pou pale sou bagay yo epi deside ansanm. Pataje ajanda a pou moun ka vin pare.",
    "suggestedDurationMinutes": 60,
    "blurb": "Pale sou sa, deside ansanm."
  }
];
