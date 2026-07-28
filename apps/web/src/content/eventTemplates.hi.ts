/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program. If not, see
 * <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
// Hindi event templates (i18n Phase 2). Loaded lazily via
// content/bundles/hi.ts — never import this statically from app
// code.
import type { EventTemplate } from "./eventTemplates";

export const EVENT_TEMPLATES_HI: readonly EventTemplate[] = [
  {
    "id": "potluck",
    "name": "साझी दावत",
    "category": "social",
    "emoji": "🍲",
    "titleScaffold": "साझी दावत — ",
    "descriptionScaffold": "बाँटने के लिए कोई एक चीज़ बनाकर लाएँ और भूख लेकर आएँ — जब हर कोई कुछ न कुछ लाता है, तो हमेशा भरपूर हो जाता है। खाने के अलावा कुछ और लाना हो, तो सबको बता दें।",
    "suggestedDurationMinutes": 120,
    "blurb": "एक साझा खाना — सबकी तरफ़ से एक-एक चीज़।"
  },
  {
    "id": "shared-meal",
    "name": "मिल-बैठकर खाना",
    "category": "social",
    "emoji": "🍝",
    "titleScaffold": "मिल-बैठकर खाना — ",
    "descriptionScaffold": "पका हुआ खाना, साथ बैठकर। बताएँ कि खाने में क्या है, और पकाने या समेटने में कोई हाथ बँटा सकता है या नहीं।",
    "suggestedDurationMinutes": 90,
    "blurb": "पका हुआ खाना, साथ बैठकर।"
  },
  {
    "id": "game-night",
    "name": "खेल की शाम",
    "category": "social",
    "emoji": "🎲",
    "titleScaffold": "खेल की शाम — ",
    "descriptionScaffold": "बोर्ड गेम, ताश, जो भी आपके पास हो। पहली बार आने वालों का स्वागत है — नियम कोई न कोई सिखा देगा।",
    "suggestedDurationMinutes": 150,
    "blurb": "बोर्ड गेम, ताश और अच्छा साथ।"
  },
  {
    "id": "movie-night",
    "name": "फ़िल्म की शाम",
    "category": "social",
    "emoji": "🎬",
    "titleScaffold": "फ़िल्म की शाम — ",
    "descriptionScaffold": "साथ देखने के लिए कुछ चुनें। बताएँ कि क्या दिखाया जा रहा है, और बैठने के लिए गद्दी या बाँटने लायक़ कुछ खाने का सामान लाना है या नहीं।",
    "suggestedDurationMinutes": 150,
    "blurb": "मिलकर कुछ देखें।"
  },
  {
    "id": "skill-share",
    "name": "हुनर बाँटना",
    "category": "learning",
    "emoji": "🎓",
    "titleScaffold": "हुनर बाँटना — ",
    "descriptionScaffold": "कोई सिखाता है, सब सीखते हैं — किसी माहिर की ज़रूरत नहीं। बताएँ कि क्या बाँटा जा रहा है, और कुछ लाना हो तो क्या।",
    "suggestedDurationMinutes": 90,
    "blurb": "कोई सिखाता है, सब सीखते हैं।"
  },
  {
    "id": "craft-circle",
    "name": "कारीगरी की मंडली",
    "category": "learning",
    "emoji": "🧶",
    "titleScaffold": "कारीगरी की मंडली — ",
    "descriptionScaffold": "जो भी बना रहे हों, साथ ले आएँ और दूसरों के साथ बैठकर करें। नए सीखने वाले और अधूरे पड़े काम — दोनों की जगह यहाँ है।",
    "suggestedDurationMinutes": 120,
    "blurb": "दूसरों के साथ बैठकर कुछ बनाएँ।"
  },
  {
    "id": "walk-hike",
    "name": "सैर / पैदल सफ़र",
    "category": "social",
    "emoji": "🥾",
    "titleScaffold": "सैर — ",
    "descriptionScaffold": "आराम की चाल से साथ-साथ चलना। रास्ता कितना लंबा और कितना मुश्किल है, यह लिख दें ताकि सबको अंदाज़ा रहे, और पानी और अच्छे जूतों की याद दिला दें।",
    "suggestedDurationMinutes": 90,
    "blurb": "साथ-साथ सैर, आराम की चाल से।"
  },
  {
    "id": "welcome-gathering",
    "name": "स्वागत की मुलाक़ात",
    "category": "social",
    "emoji": "👋",
    "titleScaffold": "स्वागत की मुलाक़ात — ",
    "descriptionScaffold": "नए पड़ोसियों से मिलने और जाने-पहचाने चेहरों से फिर जुड़ने का इत्मीनान भरा तरीक़ा। कुछ तय नहीं — बस जान-पहचान और अच्छा साथ।",
    "suggestedDurationMinutes": 90,
    "blurb": "नए पड़ोसियों से मिलें, कुछ तय नहीं।"
  },
  {
    "id": "music-jam",
    "name": "संगीत की महफ़िल",
    "category": "social",
    "emoji": "🎵",
    "titleScaffold": "संगीत की महफ़िल — ",
    "descriptionScaffold": "कोई साज़ लाएँ, या बस अपनी आवाज़। नए सीखने वाले भी, पुराने भी — सबका स्वागत। बात मिलकर बजाने की है, स्टेज पर दिखाने की नहीं।",
    "suggestedDurationMinutes": 120,
    "blurb": "मिलकर संगीत बजाएँ — नए भी, पुराने भी।"
  },
  {
    "id": "celebration",
    "name": "जश्न",
    "category": "celebration",
    "emoji": "🎉",
    "titleScaffold": "जश्न — ",
    "descriptionScaffold": "मिलकर कुछ मनाएँ। बताएँ कि किस बात का जश्न है, और बाँटने के लिए कुछ लाना है या नहीं।",
    "suggestedDurationMinutes": 120,
    "blurb": "मिलकर कुछ मनाएँ।"
  },
  {
    "id": "work-day",
    "name": "श्रमदान",
    "category": "skilled_labor",
    "emoji": "🌱",
    "titleScaffold": "श्रमदान — ",
    "descriptionScaffold": "मिलकर कुछ पूरा करने के लिए हाथ से काम करने का वक़्त। बताएँ कि काम क्या है और क्या लाना है — और यह भी कि जितने हाथ, उतना हल्का काम।",
    "suggestedDurationMinutes": 240,
    "blurb": "हाथ से काम, मिलकर।"
  },
  {
    "id": "repair-cafe",
    "name": "मरम्मत की चौपाल",
    "category": "skilled_labor",
    "emoji": "🔧",
    "titleScaffold": "मरम्मत की चौपाल — ",
    "descriptionScaffold": "कोई टूटी हुई चीज़ लाएँ और उन पड़ोसियों की मदद से उसे ठीक करें जिनका औज़ारों से नाता है। बताएँ कि किस तरह की मरम्मत में हाथ बँट सकता है।",
    "suggestedDurationMinutes": 180,
    "blurb": "टूटी चीज़ें, मिलकर ठीक करें।"
  },
  {
    "id": "care-circle",
    "name": "सहारे की मंडली",
    "category": "emotional_support",
    "emoji": "🫂",
    "titleScaffold": "सहारे की मंडली — ",
    "descriptionScaffold": "एक-दूसरे का हाल पूछने और सहारा देने की एक नरम-सी जगह। यहाँ जो बात कही जाए, यहीं रह जाती है।",
    "suggestedDurationMinutes": 90,
    "blurb": "एक-दूसरे का हाल पूछें, सहारा दें।"
  },
  {
    "id": "meeting",
    "name": "बैठक",
    "category": "organizing",
    "emoji": "📋",
    "titleScaffold": "बैठक — ",
    "descriptionScaffold": "बातें खुलकर करने और मिलकर फ़ैसला लेने का वक़्त। किन-किन बातों पर बात होगी, यह पहले बता दें ताकि सब तैयारी से आएँ।",
    "suggestedDurationMinutes": 60,
    "blurb": "बातें खुलकर करें, मिलकर फ़ैसला लें।"
  }
];
