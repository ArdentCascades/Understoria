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

// Hindi translation of study-prompts.ts. Ids and themes stay
// byte-identical to English — guides.parity.test.ts enforces it.
// Register follows docs/i18n-glossary/hi.md (uniform आप, warm
// Hindustani); author names and "mandar obedeciendo" stay as they
// are. When editing the English prompts, mirror the change here.
import type { StudyPrompt } from "./study-prompts";

export const STUDY_PROMPTS_HI: readonly StudyPrompt[] = [
  {
    id: "platform-1",
    theme: "platform",
    body:
      "जब इसके लिए कोई सॉफ़्टवेयर नहीं था, तब टाइम बैंक और आपसी मदद " +
      "के नेटवर्क कैसे चलते थे? सॉफ़्टवेयर आया तो उन्होंने क्या खोया, " +
      "और क्या पाया? उस सौदे में Understoria को कहाँ खड़ा होना चाहिए?",
  },
  {
    id: "platform-2",
    theme: "platform",
    body:
      "Understoria का डिज़ाइन-उसूल है: एक घंटा यानी एक घंटा। यह उसूल " +
      "किस काम की हिफ़ाज़त कर रहा है? यह किन आलोचनाओं को न्योता देता " +
      "है? क्या आपके समुदाय में ऐसे मौक़े हैं जहाँ यह आड़े आता है?",
  },
  {
    id: "platform-3",
    theme: "platform",
    body:
      "कल ऐप हटा दिया जाए, तो हमारे पास फिर भी क्या रहेगा? वही जवाब " +
      "असली नींव है; ऐप तो बस बाँस-बल्ली का ढाँचा है।",
  },
  {
    id: "mutual-aid-1",
    theme: "mutual_aid",
    body:
      "Dean Spade आपसी मदद और चैरिटी का फ़र्क़ इस बात से करते हैं कि " +
      "फ़ैसला किसके हाथ में है। अभी आपके समुदाय में फ़ैसले कौन करता " +
      "है? कौन नहीं करता?",
  },
  {
    id: "mutual-aid-2",
    theme: "mutual_aid",
    body:
      "आपसी मदद के प्रोजेक्ट अक्सर या तो NGO में समा जाते हैं, या " +
      "सेवा बाँटने वाले कार्यक्रमों में बदल जाते हैं। आपके समुदाय को " +
      "इस खिंचाव से क्या बचाता है?",
  },
  {
    id: "mutual-aid-3",
    theme: "mutual_aid",
    body:
      "आपके समुदाय में कौन है जो ज़रूरत होते हुए भी मदद नहीं माँग " +
      "रहा? क्यों?",
  },
  {
    id: "organizing-1",
    theme: "organizing",
    body:
      "McAlevey जुटाने (जो पहले से साथ हैं, उन्हें बुला लाने) और " +
      "संगठित करने (जो अभी साथ नहीं हैं, उन्हें साथ लाने) में फ़र्क़ " +
      "करती हैं। आपका आपसी मदद का नेटवर्क जुटाने का प्रोजेक्ट है, " +
      "संगठित करने का, या दोनों?",
  },
  {
    id: "organizing-2",
    theme: "organizing",
    body:
      "आपसी मदद का काम और यूनियन का काम इतिहास में एक-दूसरे को सींचते " +
      "आए हैं। आपके यहाँ ये जोड़ कहाँ-कहाँ हैं? ऐसा क्या मुमकिन है जो " +
      "आज़माया ही नहीं जा रहा?",
  },
  {
    id: "power-1",
    theme: "power",
    body:
      "Freeman कहती हैं कि ख़ुद को बिना ढाँचे का बता देने से ढाँचा " +
      "मिट नहीं जाता; वह बस ग़ैर-रस्मी हो जाता है, और उसे चुनौती देना " +
      "और मुश्किल। आपके समुदाय में कौन-से ग़ैर-रस्मी ढाँचे हैं? क्या " +
      "वे काम कर रहे हैं?",
  },
  {
    id: "power-2",
    theme: "power",
    body:
      "अगर Understoria के सॉफ़्टवेयर के फ़ैसले किसी सहकारी संस्था की " +
      "जगह कोई कॉर्पोरेशन कर रहा होता, तो इसकी ख़ूबियों में क्या अलग " +
      "होता? तीन बातें लिखें।",
  },
  {
    id: "traditions-1",
    theme: "traditions",
    body:
      "Mauss और Hyde तोहफ़े को एक ज़िम्मेदारी उठाए हुए देखते हैं — " +
      "लेने की, और आगे देने की — जिसे बाज़ार ख़ास तौर पर मिटा देता " +
      "है। आपके समुदाय में तोहफ़े की यह रीत कहाँ अब भी सलामत है, और " +
      "कहाँ उसकी जगह लेन-देन की सोच ने ले ली है? क्या इससे फ़र्क़ " +
      "पड़ता है?",
  },
  {
    id: "traditions-2",
    theme: "traditions",
    body:
      "फ़ैसलों को कई पीढ़ियों की कसौटी पर परखने का Haudenosaunee उसूल " +
      "हफ़्तेवार आँकड़ों के इर्द-गिर्द ढले किसी प्रोजेक्ट के लिए " +
      "बनावट से ही मुश्किल है। अपने समुदाय का कोई हालिया फ़ैसला " +
      "चुनें। पाँच या सात पीढ़ियों के दायरे में फिर से देखें, तो वह " +
      "कैसा लगेगा?",
  },
  {
    id: "traditions-3",
    theme: "traditions",
    body:
      "Zapatistas का mandar obedeciendo — मानते हुए अगुवाई करना — " +
      "कोई रूपक नहीं है; यह ढाँचे का एक पक्का वादा है, जो तय करता है " +
      "कि तालमेल की ज़िम्मेदारियाँ किसके पास रहें और कितने समय तक। " +
      "आपके समुदाय में ग़ैर-रस्मी तालमेल का अधिकार किसके पास है? उसे " +
      "mandar obedeciendo के तहत बाक़ायदा रूप दे दिया जाए, तो उसकी " +
      "क़ीमत क्या होगी?",
  },
] as const;
