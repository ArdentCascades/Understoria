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
import type { DesignPrinciple } from "./design-principles";

export const DESIGN_PRINCIPLES_SW: readonly DesignPrinciple[] = [
  {
    "id": "equal-time",
    "title": "Saa sawa kwa kazi zote",
    "statement": "Saa moja ya msaada wowote ni saa moja, daima — bila kujali aina ya kazi.",
    "example": "Benki za muda za mwanzo zilizojaribu kupanga thamani kwa viwango vya soko ziligundua kwamba faraja na kulea watoto — kazi zinazofanywa mara nyingi zaidi na wanawake na wanajumuiya wenye ulemavu — zilipewa thamani ya chini kabisa kila mara. Saa sawa ni suluhisho la kimuundo."
  },
  {
    "id": "no-leaderboards",
    "title": "Hakuna orodha za washindi wala alama za mtu mmoja",
    "statement": "Maendeleo hufuatiliwa kwa ngazi ya jumuiya nzima. Kipimo ni sisi, si mimi.",
    "example": "Couchsurfing ilipoongeza alama ya sifa, wenyeji walianza kuichezea, na wageni walio hatarini zaidi — wale wasioweza kurudisha alama za juu — waliachwa nje ya mfumo kabisa."
  },
  {
    "id": "no-notifications",
    "title": "Hakuna arifa za kukuita",
    "statement": "Programu inakuonyesha kinachohitaji umakini wako unapoifungua. Hakuna mtetemo, hakuna namba zinazokufukuza kutoka skrini hadi skrini, hakuna igizo la uharaka.",
    "example": "Waandaaji wa kusaidiana wa enzi za COVID walieleza kwa wingi kwamba zana zinazoendeshwa kwa arifa ziliwachosha kabisa kwanza wanajumuiya wenye bidii zaidi — watu ambao jumuiya hazingeweza kumudu kuwapoteza. Uzoefu huo, si utafiti rasmi, ndio msingi wa kanuni hii."
  },
  {
    "id": "solidarity-not-shame",
    "title": "Mshikamano, si aibu",
    "statement": "Hali haielezwi kamwe kama imekwama, imechelewa, au imeshindikana. Uwezo hubadilika; mfumo hujirekebisha bila kumlaumu yeyote.",
    "example": "Mifumo ya ajira za muda mfupi mtandaoni hutumia vishawishi vya “unabaki nyuma” ili kukamua kazi zaidi. Wafanyakazi wanaoathirika zaidi ni wale ambao tayari wako katikati ya shida — ndio hasa watu ambao kusaidiana kupo kwa ajili yao."
  },
  {
    "id": "community-authority",
    "title": "Jumuiya ndiyo yenye mamlaka",
    "statement": "Hakuna cheo cha msimamizi. Maamuzi ya uongozi hupitia mapendekezo ya jumuiya, si nguvu ya mtu mmoja.",
    "example": "Vyama vya ushirika vya Mondragón vimeonyesha kwa zaidi ya miaka 60 kwamba uongozi wa wafanyakazi unashinda uongozi wa mameneja kwa usawa na kwa uimara wa kudumu. Cheo cha “msimamizi” ni chaguo la muundo, si lazima."
  },
  {
    "id": "asking-never-gated",
    "title": "Kuomba msaada hakuna masharti",
    "statement": "Kila mwanajumuiya mpya anaanza na saa za mbegu. Unaweza kupokea kabla ya kutoa.",
    "example": "Benki za muda zilizotaka mtu apate kwanza ndipo atumie ziliona kwamba wanajumuiya walio hatarini zaidi — wazee, waliofika karibuni, walio kwenye shida — hawakuomba msaada kamwe. Saa za mbegu ni suluhisho la kimuundo."
  },
  {
    "id": "privacy-precondition",
    "title": "Faragha ni sharti la kwanza",
    "statement": "Hakuna barua pepe, hakuna namba ya simu, kumbukumbu za mfumo chache kabisa. Utambulisho wako ni ufunguo wa kriptografia kwenye kifaa chako.",
    "example": "Vituo vya wafanyakazi vilivyotumia karatasi za kidijitali za kuandika majina viliamriwa kisheria kutoa orodha za majina ya waliojiunga, au orodha hizo zikavujishwa kwa waajiri. Kujipanga kunahitaji kwamba kujiunga kwenyewe kulindwe, si mazungumzo tu."
  },
  {
    "id": "deliberation-over-speed",
    "title": "Majadiliano kabla ya kasi",
    "statement": "Mapendekezo hukaa wazi kwa kipindi kinachoweza kupangwa. Muafaka unahitaji muda, si akidi tu.",
    "example": "Kupiga kura kwa haraka mtandaoni kwenye vyama vya ushirika kuliwaacha bila sauti, mara kwa mara, wafanyakazi wa zamu za usiku, wanaowatunza wengine, na wenye intaneti finyu. Kipindi cha majadiliano cha siku 3 — chaguo la kawaida — kinampa kila mtu nafasi ya kweli ya kutoa sauti yake (jumuiya inaweza kukipanga upya, hadi chini kabisa siku 1)."
  },
  {
    "id": "no-post-editing",
    "title": "Kwa nini kubandika upya badala ya kuhariri",
    "statement": "Bandiko likishashirikishwa na jumuiya, haliwezi kuharirika kimya kimya wala kufutwa — kumbukumbu ya kilichoombwa inabaki ya kuaminika kwa kila aliyeliona.",
    "example": "Mifumo inayoruhusu mabandiko kuharirika kimya kimya huzaa tatizo la kukana — “sikuwahi kusema hivyo” inakosa jibu. Kulihifadhi bandiko la awali kama lilivyokuwa, pamoja na njia ya kubandika upya kwa mabadiliko, kunalinda unyumbufu na uwajibikaji kwa pamoja."
  },
  {
    "id": "no-read-receipts",
    "title": "Hakuna alama za “imesomwa” kwenye jumbe",
    "statement": "Mtumaji haambiwi ujumbe wake umesomwa lini. Nani-anazungumza-na-nani ndiyo ramani ya mahusiano ambayo ulinzi wa programu unailinda kuliko zote.",
    "example": "Tiki za bluu za WhatsApp zilizaa shinikizo la kijamii la kujibu papo hapo, na kuwawezesha wenzi wanaodhulumu kufuatilia muda wa majibu. Kuondoa alama za “imesomwa” kunaondoa kabisa mwanya huo wa ufuatiliaji."
  },
  {
    "id": "no-activity-search",
    "title": "Hakuna kutafuta wanajumuiya kwa shughuli zao",
    "statement": "Huwezi kutafuta “nani ana shughuli nyingi zaidi” wala “nani amesaidia zaidi.” Mienendo ya shughuli ni data ya ufuatiliaji.",
    "example": "Strava ilipochapisha ramani za joto za shughuli zilizojumlishwa, ilifichua bila kukusudia mahali pa kambi za siri za kijeshi. Mienendo ya shughuli za mtu mmoja hufichua hata zaidi — inaonyesha nani anajipanga, lini, na pamoja na nani."
  },
  {
    "id": "follows-not-blocked",
    "title": "Kazi “zinafuata” — kamwe si “zimezibwa”",
    "statement": "Kazi inayosubiri kazi nyingine imepangwa mfululizo, haijakwama. Namna jambo linavyoitwa huchagiza jinsi watu wanavyoiona kazi.",
    "example": "Zana za kusimamia miradi zinazoziita kazi “zimezibwa” huzaa mchezo wa lawama — mtu fulani “anamzibia” mwenzake. “Inafuata” huueleza utegemezi uleule kama mfululizo wa kawaida, na kuondoa msuguano kati ya watu."
  }
];
