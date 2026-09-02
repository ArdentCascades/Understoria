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
import type { GuideSection } from "./member-guide";

export const MEMBER_GUIDE_SW: readonly GuideSection[] = [
  {
    "id": "what-it-is",
    "title": "Understoria ni nini",
    "body": [
      "Understoria ni benki ya muda: njia ya jumuiya kubadilishana msaada, ambapo kila saa inahesabiwa sawa. Saa moja ya kutengeneza sinki ni sawa kabisa na saa moja ya kumsikiliza mtu baada ya siku ngumu.",
      "Hii si programu ya kutafuta ajira ndogondogo. Ni programu inayoisaidia jumuiya iliyopo tayari — mahali pa kazi, mtaa, kikundi cha watu wenye lengo moja — ambayo tayari inaaminiana na inataka njia nyepesi ya kufanya kusaidiana kuonekane."
    ]
  },
  {
    "id": "credits",
    "title": "Saa za msaada zinavyofanya kazi",
    "body": [
      "Kila mwanajumuiya mpya anaanza na saa 5 za mbegu. Unaweza kuomba msaada kabla hujatoa wowote. Kuomba si deni — ndivyo mtandao unavyopata uhai.",
      "Unapomsaidia mtu, nyote wawili mnathibitisha mabadilishano. Saa zako zinaongezeka kwa saa za msaada ulizotoa; zake zinapungua. Hakuna pesa inayopita mkononi; hakuna anayekaa kuhesabu nani amemzidi mwenzake.",
      "Jumla ya saa zako inahesabiwa kutoka kwenye kumbukumbu iliyotiwa sahihi ya kila mabadilishano. Kitu kikionekana si sawa, unaweza kuikagua mwenyewe."
    ]
  },
  {
    "id": "identity",
    "title": "Utambulisho wako",
    "body": [
      "Utambulisho wako ni jozi ya funguo za kriptografia. Hakuna barua pepe, namba ya simu, wala nenosiri la akaunti. Jina lako la kuitwa ni lolote unalolichagua — ni lebo tu, si kitambulisho.",
      "Unaweza kuzifunga funguo zilizo upande wa kifaa chako kwa alama ya kidole, uso, au PIN ya kifaa chako (passkey — unapewa nafasi yake papo hapo unapoanza, na inafanya kazi bila intaneti kabisa), au kwa maneno ya siri unayoyaandika mwenyewe; unaweza pia kuwa na vyote viwili, maneno ya siri yakiwa njia nyingine ya kuingia ikihitajika. Hakuna chochote kuhusu kufuli hii kinachotumwa kwa Apple, Google, wala seva yoyote — ukaguzi unafanyika kwenye kifaa chako.",
      "Ukipoteza maneno yako ya siri — au simu yako pamoja na kufuli yake ya alama ya kidole — hakuna anayeweza kukurudishia. Ndiyo makubaliano yenyewe — hakuna mamlaka kuu inayoweza kusoma data yako, na hiyo ina maana pia hakuna mamlaka kuu inayoweza kuiokoa. Kinachokurudisha ni nakala ya ziada uliyoitengeneza mambo yakiwa shwari: kifaa cha pili kilichounganishwa, washika amana uliowachagua, au kit ya kurejesha — kila kimoja huchukua kama dakika moja kwenye Mipangilio.",
      "Ukiwahi kuhitaji kufuta kila kitu haraka — futa kiasi (ficha utambulisho) au futa kabisa (anza upya) — kuna kitufe cha hatari kwenye Wasifu, chini ya Dharura."
    ]
  },
  {
    "id": "trust",
    "title": "Kuaminiana na kukaribishwa",
    "body": [
      "Wanajumuiya wapya wanahitaji udhamini wa wanajumuiya wawili waliopo ili kuaminika kikamilifu. Mtu anapopokea mwaliko wako na kuutumia, hilo linahesabika kama udhamini wako usiotamkwa — jina lako linasimama nyuma ya kujiunga kwake.",
      "Wanajumuiya wanaweza kubandika na kuchukua msaada kabla hawajaaminika kikamilifu — kuomba hakuzuiliwi kamwe — ila jumuiya inaona alama ndogo inayoonyesha hali ya kuaminika, ili watoe udhamini wao wenyewe pale panapostahili."
    ]
  },
  {
    "id": "governance",
    "title": "Maamuzi na kutoelewana",
    "body": [
      "Maamuzi ya jumuiya yanafanywa pamoja, si na wasimamizi — kwa makusudi hakuna nafasi ya msimamizi wala mdhibiti kwenye programu hii. Mambo yanayoihusu jumuiya nzima yanapita kwenye mapendekezo ya wazi: yeyote anaweza kulianzisha kutoka Wasifu → Mapendekezo ya jumuiya, kila mtu anaweza kuliona, na linabaki wazi kwa kipindi cha majadiliano kabla halijafungwa.",
      "Kutoelewana kuhusu mabadilishano fulani kunapita njia ile ile: fungua kutoelewana kutoka Wasifu → Kutoelewana kwa jumuiya, nako kunakuwa pendekezo ambalo jumuiya inalijadili, na matokeo yake yanatekelezwa yenyewe pendekezo linapofungwa.",
      "Chochote ambacho programu haikiamui — kanuni zenu, ratiba za mikutano, jinsi mnavyosemezana — kinafanyika kwenye njia yoyote ambayo jumuiya yako tayari inaitumia. Programu inaandika maamuzi; haichukui nafasi ya mazungumzo."
    ]
  },
  {
    "id": "where-from-here",
    "title": "Uelekee wapi kutoka hapa",
    "body": [
      "Fungua Ubao uone majirani wanachokitoa na wanachokiomba sasa hivi.",
      "Fungua Mdundo uone jumuiya yako inavyoendelea — jumla ya saa za msaada zilizohamia, msaada unakoelekea, na kilichosherehekewa.",
      "Fungua Wasifu kusasisha ujuzi wako na nyakati zako, kumwalika mtu mpya, au kusoma miongozo mirefu zaidi iliyo kwenye diski."
    ]
  }
];
