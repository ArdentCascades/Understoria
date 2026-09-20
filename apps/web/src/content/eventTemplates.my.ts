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
// Burmese translation (i18n post-wave languages). Loaded lazily
// via content/bundles/my.ts — never import statically from app code.
// Ids are stable and never translated; parity gates enforce structure.
import type { EventTemplate } from "./eventTemplates";

export const EVENT_TEMPLATES_MY: readonly EventTemplate[] = [
  {
    "id": "potluck",
    "name": "တစ်အိမ်တစ်ခွက်ဝိုင်း",
    "category": "social",
    "emoji": "🍲",
    "titleScaffold": "တစ်အိမ်တစ်ခွက်ဝိုင်း — ",
    "descriptionScaffold": "မျှဝေစားဖို့ ဟင်းတစ်ခွက် ယူလာပြီး ဗိုက်ဆာဆာနဲ့ လာခဲ့ပါ — လူတိုင်း ဝိုင်းပါဝင်ရင် အမြဲ လုံလောက်ပါတယ်။ အစားအသောက်အပြင် ယူလာစရာ ရှိသေးရင် ကြိုပြောထားပေးပါ။",
    "suggestedDurationMinutes": 120,
    "blurb": "လူတိုင်း ဟင်းတစ်ခွက်စီ ယူလာတဲ့ စုပေါင်းထမင်းဝိုင်းပါ။"
  },
  {
    "id": "shared-meal",
    "name": "ထမင်းဝိုင်း",
    "category": "social",
    "emoji": "🍝",
    "titleScaffold": "ထမင်းဝိုင်း — ",
    "descriptionScaffold": "ချက်ထားတဲ့ထမင်းတစ်နပ်ကို အတူတူ စားကြမှာပါ။ ဘာဟင်းတွေလဲဆိုတာနဲ့ ချက်ပြုတ်ရာ သန့်ရှင်းရာမှာ ဝိုင်းကူလို့ရမရလည်း ပြောပြထားပါ။",
    "suggestedDurationMinutes": 90,
    "blurb": "ချက်ထားတဲ့ထမင်းတစ်နပ်ကို အတူတူ စားကြမယ်။"
  },
  {
    "id": "game-night",
    "name": "ဂိမ်းညပွဲ",
    "category": "social",
    "emoji": "🎲",
    "titleScaffold": "ဂိမ်းညပွဲ — ",
    "descriptionScaffold": "ဘုတ်ဂိမ်း၊ ဖဲ၊ ရှိတာ ယူလာလို့ရပါတယ်။ အသစ်ရောက်လာသူတွေကိုလည်း ကြိုဆိုပါတယ် — စည်းကမ်းတွေကို တစ်ယောက်ယောက်က သင်ပေးပါလိမ့်မယ်။",
    "suggestedDurationMinutes": 150,
    "blurb": "ဘုတ်ဂိမ်း၊ ဖဲနဲ့ အဖော်ကောင်းတွေပါ။"
  },
  {
    "id": "movie-night",
    "name": "ရုပ်ရှင်ညပွဲ",
    "category": "social",
    "emoji": "🎬",
    "titleScaffold": "ရုပ်ရှင်ညပွဲ — ",
    "descriptionScaffold": "အတူတူကြည့်ဖို့ တစ်ခုခု ရွေးကြမယ်။ ဘာပြမလဲဆိုတာနဲ့ ထိုင်စရာဖုံ ဒါမှမဟုတ် ဝိုင်းစားဖို့မုန့် ယူလာသင့်မသင့်လည်း ပြောထားပေးပါ။",
    "suggestedDurationMinutes": 150,
    "blurb": "တစ်ခုခုကို အတူတူ ကြည့်ကြမယ်။"
  },
  {
    "id": "skill-share",
    "name": "တတ်တဲ့အရာ မျှဝေပွဲ",
    "category": "learning",
    "emoji": "🎓",
    "titleScaffold": "တတ်တဲ့အရာ မျှဝေပွဲ — ",
    "descriptionScaffold": "တစ်ယောက်က သင်ပေး၊ အားလုံးက သင်ယူ — ကျွမ်းကျင်သူကြီး ဖြစ်စရာ မလိုပါ။ ဘာကို မျှဝေမှာလဲဆိုတာနဲ့ ယူလာစရာရှိရင် ဘာယူလာရမလဲဆိုတာ ပြောပြထားပါ။",
    "suggestedDurationMinutes": 90,
    "blurb": "တစ်ယောက်က သင်ပေးပြီး အားလုံး သင်ယူကြပါတယ်။"
  },
  {
    "id": "craft-circle",
    "name": "လက်မှုဝိုင်း",
    "category": "learning",
    "emoji": "🧶",
    "titleScaffold": "လက်မှုဝိုင်း — ",
    "descriptionScaffold": "လုပ်လက်စ ဘာမဆို ယူလာပြီး တခြားသူတွေနဲ့အတူ ထိုင်လုပ်ကြမယ်။ အခုမှစသူတွေရော လက်စမသတ်ရသေးတဲ့အလုပ်တွေရော ဒီမှာ နေရာရှိပါတယ်။",
    "suggestedDurationMinutes": 120,
    "blurb": "တခြားသူတွေနဲ့အတူ လက်မှုပစ္စည်းလေးတွေ လုပ်ကြမယ်။"
  },
  {
    "id": "walk-hike",
    "name": "လမ်းလျှောက် / တောင်တက်",
    "category": "social",
    "emoji": "🥾",
    "titleScaffold": "လမ်းလျှောက် — ",
    "descriptionScaffold": "အေးအေးဆေးဆေးနှုန်းနဲ့ အတူတူ လမ်းလျှောက်ကြမှာပါ။ ဘာမျှော်လင့်ရမလဲ သိအောင် လမ်းကြောင်းရဲ့အရှည်နဲ့ ခက်ခဲမှုကို ရေးထားပေးပြီး ရေနဲ့ ဖိနပ်ကောင်းကောင်း ယူလာဖို့လည်း သတိပေးထားပါ။",
    "suggestedDurationMinutes": 90,
    "blurb": "အေးဆေးတဲ့နှုန်းနဲ့ အတူတူ လမ်းလျှောက်ကြမယ်။"
  },
  {
    "id": "welcome-gathering",
    "name": "ကြိုဆိုတွေ့ဆုံပွဲ",
    "category": "social",
    "emoji": "👋",
    "titleScaffold": "ကြိုဆိုတွေ့ဆုံပွဲ — ",
    "descriptionScaffold": "အိမ်နီးချင်းအသစ်တွေနဲ့ တွေ့ဖို့၊ ရင်းနှီးပြီးသားမျက်နှာတွေနဲ့ ပြန်ဆုံဖို့ အေးအေးဆေးဆေး နည်းလမ်းလေးပါ။ အစီအစဉ်ကြီးကြီးကျယ်ကျယ် မရှိပါ — မိတ်ဆက်ကြရုံနဲ့ အဖော်ကောင်းတွေပါပဲ။",
    "suggestedDurationMinutes": 90,
    "blurb": "အိမ်နီးချင်းအသစ်တွေနဲ့ တွေ့ကြမယ် — အစီအစဉ်ကြီးကြီး မလိုပါ။"
  },
  {
    "id": "music-jam",
    "name": "ဂီတဝိုင်း",
    "category": "social",
    "emoji": "🎵",
    "titleScaffold": "ဂီတဝိုင်း — ",
    "descriptionScaffold": "တူရိယာတစ်ခုခု ယူလာလို့ရသလို အသံတစ်ခုတည်းနဲ့လည်း လာလို့ရပါတယ်။ အဆင့်မရွေး ကြိုဆိုပါတယ် — ဒါက ဖျော်ဖြေပွဲမဟုတ်ဘဲ အတူတူ တီးဆိုကြဖို့ပါ။",
    "suggestedDurationMinutes": 120,
    "blurb": "အဆင့်မရွေး အတူတူ တီးဆိုကြမယ်။"
  },
  {
    "id": "celebration",
    "name": "ဂုဏ်ပြုပွဲ",
    "category": "celebration",
    "emoji": "🎉",
    "titleScaffold": "ဂုဏ်ပြုပွဲ — ",
    "descriptionScaffold": "တစ်ခုခုကို အတူတူ ဂုဏ်ပြုကြမယ်။ ဘာကို ဂုဏ်ပြုတာလဲဆိုတာနဲ့ မျှဝေစရာ တစ်ခုခု ယူလာသင့်မသင့်လည်း ပြောထားပေးပါ။",
    "suggestedDurationMinutes": 120,
    "blurb": "တစ်ခုခုကို အတူတူ ဂုဏ်ပြုကြမယ်။"
  },
  {
    "id": "work-day",
    "name": "အလုပ်အားလုံးနေ့",
    "category": "skilled_labor",
    "emoji": "🌱",
    "titleScaffold": "အလုပ်အားလုံးနေ့ — ",
    "descriptionScaffold": "တစ်ခုခုကို အတူတူ ပြီးမြောက်အောင် လက်တွေ့လုပ်ကြမယ့်အချိန်ပါ။ ဘာအလုပ်လဲ၊ ဘာယူလာရမလဲ ဖော်ပြထားပြီး လက်များရင် ပိုပေါ့တယ်ဆိုတာလည်း ထည့်ပြောထားပါ။",
    "suggestedDurationMinutes": 240,
    "blurb": "လက်တွေ့အလုပ်ကို အတူတူ လုပ်ကြမယ်။"
  },
  {
    "id": "repair-cafe",
    "name": "ပြင်ဆင်ရေးကဖေး",
    "category": "skilled_labor",
    "emoji": "🔧",
    "titleScaffold": "ပြင်ဆင်ရေးကဖေး — ",
    "descriptionScaffold": "ပျက်နေတဲ့ပစ္စည်းတစ်ခုခု ယူလာပြီး ကိရိယာကိုင်ကျွမ်းတဲ့ အိမ်နီးချင်းတွေရဲ့အကူအညီနဲ့ ပြင်ကြမယ်။ ဘယ်လိုပြင်ဆင်မှုမျိုးတွေ ဝိုင်းကူပေးနိုင်လဲဆိုတာ ပြောပြထားပါ။",
    "suggestedDurationMinutes": 180,
    "blurb": "ပျက်နေတာတွေကို အတူတူ ပြင်ကြမယ်။"
  },
  {
    "id": "care-circle",
    "name": "ဂရုစိုက်ဝိုင်း",
    "category": "emotional_support",
    "emoji": "🫂",
    "titleScaffold": "ဂရုစိုက်ဝိုင်း — ",
    "descriptionScaffold": "တစ်ယောက်အခြေအနေတစ်ယောက် မေးမြန်းပြီး အပြန်အလှန် အားပေးကြမယ့် နူးညံ့တဲ့နေရာလေးပါ။ ဒီမှာ ပြောတာတွေက ဒီမှာပဲ ကျန်ခဲ့ပါတယ်။",
    "suggestedDurationMinutes": 90,
    "blurb": "အခြေအနေ မေးမြန်းပြီး အပြန်အလှန် အားပေးကြမယ်။"
  },
  {
    "id": "meeting",
    "name": "ဆွေးနွေးပွဲ",
    "category": "organizing",
    "emoji": "📋",
    "titleScaffold": "ဆွေးနွေးပွဲ — ",
    "descriptionScaffold": "အကြောင်းအရာတွေကို သေသေချာချာ ဆွေးနွေးပြီး အတူတူ ဆုံးဖြတ်ကြမယ့်အချိန်ပါ။ လူတွေ ကြိုပြင်ဆင်လာနိုင်အောင် ဆွေးနွေးမယ့်အချက်တွေကို ကြိုမျှဝေထားပါ။",
    "suggestedDurationMinutes": 60,
    "blurb": "သေသေချာချာ ဆွေးနွေး၊ အတူတူ ဆုံးဖြတ်ကြမယ်။"
  }
];
