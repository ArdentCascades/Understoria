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
// Persian translation (i18n post-wave languages). Loaded lazily
// via content/bundles/fa.ts — never import statically from app code.
// Ids are stable and never translated; parity gates enforce structure.
import type { EventTemplate } from "./eventTemplates";

export const EVENT_TEMPLATES_FA: readonly EventTemplate[] = [
  {
    "id": "potluck",
    "name": "سفرهٔ مشترک",
    "category": "social",
    "emoji": "🍲",
    "titleScaffold": "سفرهٔ مشترک — ",
    "descriptionScaffold": "یک غذا برای سفره بیاورید و گرسنه بیایید — وقتی همه چیزی می‌آورند، همیشه به همه می‌رسد. اگر جز خوراکی چیز دیگری هم لازم است بیاورند، از قبل بگویید.",
    "suggestedDurationMinutes": 120,
    "blurb": "سفره‌ای مشترک که هر کس غذایی به آن می‌آورد."
  },
  {
    "id": "shared-meal",
    "name": "غذای دورِ هم",
    "category": "social",
    "emoji": "🍝",
    "titleScaffold": "غذای دورِ هم — ",
    "descriptionScaffold": "غذایی پخته که دورِ هم خورده می‌شود. بگویید چه در سفره است و آیا کسی می‌تواند در پخت‌وپز یا جمع کردن دستی برساند.",
    "suggestedDurationMinutes": 90,
    "blurb": "غذایی پخته که دورِ هم خورده می‌شود."
  },
  {
    "id": "game-night",
    "name": "شبِ بازی",
    "category": "social",
    "emoji": "🎲",
    "titleScaffold": "شبِ بازی — ",
    "descriptionScaffold": "بازیِ رومیزی، ورق، هر چه دارید. تازه‌واردها جایشان همین‌جاست — یکی قانون‌ها را یادتان می‌دهد.",
    "suggestedDurationMinutes": 150,
    "blurb": "بازیِ رومیزی، ورق و هم‌صحبتیِ خوب."
  },
  {
    "id": "movie-night",
    "name": "شبِ فیلم",
    "category": "social",
    "emoji": "🎬",
    "titleScaffold": "شبِ فیلم — ",
    "descriptionScaffold": "چیزی برای با هم دیدن انتخاب کنید. بنویسید چه پخش می‌شود و آیا بالش یا خوراکی‌ای برای دست‌به‌دست شدن بیاورند.",
    "suggestedDurationMinutes": 150,
    "blurb": "چیزی را با هم تماشا کنید."
  },
  {
    "id": "skill-share",
    "name": "رد و بدلِ مهارت",
    "category": "learning",
    "emoji": "🎓",
    "titleScaffold": "رد و بدلِ مهارت — ",
    "descriptionScaffold": "یکی یاد می‌دهد، همه یاد می‌گیرند — لازم نیست استادِ کار باشید. بگویید چه مهارتی رد و بدل می‌شود و چه چیزی — اگر لازم است — بیاورند.",
    "suggestedDurationMinutes": 90,
    "blurb": "یکی یاد می‌دهد، همه یاد می‌گیرند."
  },
  {
    "id": "craft-circle",
    "name": "حلقهٔ کاردستی",
    "category": "learning",
    "emoji": "🧶",
    "titleScaffold": "حلقهٔ کاردستی — ",
    "descriptionScaffold": "هر چه در دستِ ساختنش هستید بیاورید و کنارِ دیگران رویش کار کنید. جای تازه‌کارها و کارهای نیمه‌تمام، هر دو، همین‌جاست.",
    "suggestedDurationMinutes": 120,
    "blurb": "کنارِ دیگران چیز بسازید."
  },
  {
    "id": "walk-hike",
    "name": "پیاده‌روی / کوه‌پیمایی",
    "category": "social",
    "emoji": "🥾",
    "titleScaffold": "پیاده‌روی — ",
    "descriptionScaffold": "قدم زدنی با هم، با آهنگی آرام. طول و سختیِ مسیر را بنویسید تا مردم بدانند چه در پیش است، و آب و کفشِ راحت را هم یادشان بیاورید.",
    "suggestedDurationMinutes": 90,
    "blurb": "قدم زدنی با هم، با آهنگی آرام."
  },
  {
    "id": "welcome-gathering",
    "name": "دورهمیِ خوشامد",
    "category": "social",
    "emoji": "👋",
    "titleScaffold": "دورهمیِ خوشامد — ",
    "descriptionScaffold": "راهی راحت برای آشنا شدن با همسایه‌های تازه و دیدارِ دوباره با چهره‌های آشنا. برنامه‌ای در کار نیست — فقط آشنایی و هم‌صحبتیِ خوب.",
    "suggestedDurationMinutes": 90,
    "blurb": "آشنایی با همسایه‌های تازه، بی‌هیچ برنامه‌ای."
  },
  {
    "id": "music-jam",
    "name": "ساز و آواز",
    "category": "social",
    "emoji": "🎵",
    "titleScaffold": "ساز و آواز — ",
    "descriptionScaffold": "ساز بیاورید، یا فقط صدایتان را. تازه‌کار و کهنه‌کار فرقی نمی‌کند — اینجا برای با هم نواختن است، نه اجرا.",
    "suggestedDurationMinutes": 120,
    "blurb": "با هم ساز و آواز — در هر سطحی که باشید."
  },
  {
    "id": "celebration",
    "name": "جشن",
    "category": "celebration",
    "emoji": "🎉",
    "titleScaffold": "جشن — ",
    "descriptionScaffold": "چیزی را با هم جشن بگیرید. بگویید جشنِ چیست و آیا چیزی برای قسمت کردن بیاورند.",
    "suggestedDurationMinutes": 120,
    "blurb": "جشن گرفتنِ چیزی با هم."
  },
  {
    "id": "work-day",
    "name": "روزِ کارِ جمعی",
    "category": "skilled_labor",
    "emoji": "🌱",
    "titleScaffold": "روز کار جمعی — ",
    "descriptionScaffold": "وقتی برای آستین بالا زدن و با هم به سرانجام رساندنِ یک کار. بنویسید کار چیست و چه بیاورند، و یادآوری کنید که دستِ بیشتر، کار را سبک‌تر می‌کند.",
    "suggestedDurationMinutes": 240,
    "blurb": "آستین بالا زدن، با هم."
  },
  {
    "id": "repair-cafe",
    "name": "کافهٔ تعمیر",
    "category": "skilled_labor",
    "emoji": "🔧",
    "titleScaffold": "کافهٔ تعمیر — ",
    "descriptionScaffold": "چیزِ خرابی بیاورید و با کمکِ همسایه‌هایی که دستشان به ابزار می‌رود درستش کنید. بنویسید چه نوع تعمیرهایی از دستِ جمع برمی‌آید.",
    "suggestedDurationMinutes": 180,
    "blurb": "تعمیرِ چیزهای خراب، با هم."
  },
  {
    "id": "care-circle",
    "name": "حلقهٔ همدلی",
    "category": "emotional_support",
    "emoji": "🫂",
    "titleScaffold": "حلقهٔ همدلی — ",
    "descriptionScaffold": "جایی آرام برای پرسیدنِ حالِ هم و دلگرمی دادن به هم. آنچه اینجا گفته می‌شود، همین‌جا می‌ماند.",
    "suggestedDurationMinutes": 90,
    "blurb": "حالِ هم را بپرسید و دلگرمِ هم باشید."
  },
  {
    "id": "meeting",
    "name": "جلسه",
    "category": "organizing",
    "emoji": "📋",
    "titleScaffold": "جلسه — ",
    "descriptionScaffold": "وقتی برای حرف زدن و با هم تصمیم گرفتن. موضوع‌های گفتگو را از پیش بگویید تا مردم آماده بیایند.",
    "suggestedDurationMinutes": 60,
    "blurb": "حرف زدن و با هم تصمیم گرفتن."
  }
];
