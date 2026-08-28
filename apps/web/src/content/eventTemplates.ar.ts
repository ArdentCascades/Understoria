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
// Arabic event templates. Same ids, categories, emoji and durations as
// eventTemplates.en.ts — only the prose changes (docs/i18n-glossary/
// ar.md: warm plain فصحى, «يوم العون» for work days, no officialese).
import type { EventTemplate } from "./eventTemplates";

export const EVENT_TEMPLATES_AR: readonly EventTemplate[] = [
  {
    "id": "potluck",
    "name": "سفرة مشتركة",
    "category": "social",
    "emoji": "🍲",
    "titleScaffold": "سفرة مشتركة — ",
    "descriptionScaffold": "أحضر طبقاً للمشاركة وتعالَ جائعاً — الخير يكثر حين يساهم الجميع. أخبر الناس إن كان يلزم إحضار شيء غير الطعام.",
    "suggestedDurationMinutes": 120,
    "blurb": "وجبة مشتركة يحضر إليها كل واحد طبقاً."
  },
  {
    "id": "shared-meal",
    "name": "وجبة معاً",
    "category": "social",
    "emoji": "🍝",
    "titleScaffold": "وجبة معاً — ",
    "descriptionScaffold": "طعام مطبوخ نأكله معاً. قل ما على القائمة وهل يستطيع الناس مدّ يد في الطبخ أو الترتيب.",
    "suggestedDurationMinutes": 90,
    "blurb": "طعام مطبوخ، يؤكل معاً."
  },
  {
    "id": "game-night",
    "name": "ليلة ألعاب",
    "category": "social",
    "emoji": "🎲",
    "titleScaffold": "ليلة ألعاب — ",
    "descriptionScaffold": "ألعاب طاولة، وورق، وما عندكم. الجدد موضع ترحيب — سيعلّمك أحدهم القواعد.",
    "suggestedDurationMinutes": 150,
    "blurb": "ألعاب طاولة وورق وصحبة طيبة."
  },
  {
    "id": "movie-night",
    "name": "ليلة فيلم",
    "category": "social",
    "emoji": "🎬",
    "titleScaffold": "ليلة فيلم — ",
    "descriptionScaffold": "اختاروا شيئاً تشاهدونه معاً. اذكر ما سيُعرض وهل يُستحسن إحضار وسادة أو شيء يُمرَّر بين الحاضرين.",
    "suggestedDurationMinutes": 150,
    "blurb": "مشاهدة شيء معاً."
  },
  {
    "id": "skill-share",
    "name": "تبادل مهارات",
    "category": "learning",
    "emoji": "🎓",
    "titleScaffold": "تبادل مهارات — ",
    "descriptionScaffold": "واحد يعلّم والجميع يتعلم — لا يلزم خبراء. قل ما الذي سيُتشارك وما الذي يُحضر، إن كان ثمة شيء.",
    "suggestedDurationMinutes": 90,
    "blurb": "واحد يعلّم، والجميع يتعلم."
  },
  {
    "id": "craft-circle",
    "name": "حلقة أشغال يدوية",
    "category": "learning",
    "emoji": "🧶",
    "titleScaffold": "حلقة أشغال — ",
    "descriptionScaffold": "أحضر ما تصنعه واعمل إلى جانب الآخرين. المبتدئون والأعمال غير المكتملة كلاهما ينتمي إلى هنا.",
    "suggestedDurationMinutes": 120,
    "blurb": "نصنع الأشياء إلى جانب بعضنا."
  },
  {
    "id": "walk-hike",
    "name": "مشية جماعية",
    "category": "social",
    "emoji": "🥾",
    "titleScaffold": "مشية — ",
    "descriptionScaffold": "مشية معاً بإيقاع مريح. اذكر طول الطريق وصعوبته ليعرف الناس ما ينتظرهم، وذكّرهم بالماء والحذاء المريح.",
    "suggestedDurationMinutes": 90,
    "blurb": "مشية معاً، بإيقاع مريح."
  },
  {
    "id": "welcome-gathering",
    "name": "لقاء ترحيب",
    "category": "social",
    "emoji": "👋",
    "titleScaffold": "لقاء ترحيب — ",
    "descriptionScaffold": "طريقة مريحة للتعرف على الجيران الجدد ولقاء الوجوه المألوفة. لا جدول أعمال — تعارف وصحبة طيبة وحسب.",
    "suggestedDurationMinutes": 90,
    "blurb": "تعرّف على جيران جدد، بلا جدول أعمال."
  },
  {
    "id": "music-jam",
    "name": "جلسة موسيقى",
    "category": "social",
    "emoji": "🎵",
    "titleScaffold": "جلسة موسيقى — ",
    "descriptionScaffold": "أحضر آلة أو صوتك وحسب. كل المستويات موضع ترحيب — الغاية أن نعزف معاً، لا أن نؤدي أمام أحد.",
    "suggestedDurationMinutes": 120,
    "blurb": "عزف معاً — كل المستويات."
  },
  {
    "id": "celebration",
    "name": "احتفال",
    "category": "celebration",
    "emoji": "🎉",
    "titleScaffold": "احتفال — ",
    "descriptionScaffold": "نحتفي بشيء معاً. قل بمَ نحتفل وهل يُحضر الناس شيئاً للمشاركة.",
    "suggestedDurationMinutes": 120,
    "blurb": "نحتفي بشيء معاً."
  },
  {
    "id": "work-day",
    "name": "يوم العون",
    "category": "skilled_labor",
    "emoji": "🌱",
    "titleScaffold": "يوم العون — ",
    "descriptionScaffold": "وقت عمل باليدين لإنجاز شيء معاً. صف العمل وما يُحضر، واذكر أن كثرة الأيادي تخفف الحمل.",
    "suggestedDurationMinutes": 240,
    "blurb": "عمل باليدين، معاً."
  },
  {
    "id": "repair-cafe",
    "name": "مقهى التصليح",
    "category": "skilled_labor",
    "emoji": "🔧",
    "titleScaffold": "مقهى التصليح — ",
    "descriptionScaffold": "أحضر شيئاً معطلاً وأصلحه بعون جيران يعرفون طريقهم بين الأدوات. قل أي أنواع التصليح يستطيع الناس العون فيها.",
    "suggestedDurationMinutes": 180,
    "blurb": "نصلّح المعطل، معاً."
  },
  {
    "id": "care-circle",
    "name": "حلقة اطمئنان",
    "category": "emotional_support",
    "emoji": "🫂",
    "titleScaffold": "حلقة اطمئنان — ",
    "descriptionScaffold": "مساحة لطيفة نطمئن فيها على بعضنا ونؤازر بعضنا. ما يُقال هنا يبقى هنا.",
    "suggestedDurationMinutes": 90,
    "blurb": "نطمئن على بعضنا ونتآزر."
  },
  {
    "id": "meeting",
    "name": "اجتماع",
    "category": "organizing",
    "emoji": "📋",
    "titleScaffold": "اجتماع — ",
    "descriptionScaffold": "وقت لنتحدث في الأمور ونقرر معاً. شارك جدول الأعمال ليأتي الناس مستعدين.",
    "suggestedDurationMinutes": 60,
    "blurb": "نتحدث في الأمور، ونقرر معاً."
  }
];
