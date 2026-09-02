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
import type { StartCommunityGuide } from "./startCommunity";

export const START_COMMUNITY_SW: StartCommunityGuide = {
  "intro": [
    "Jumuiya yako inaendesha Understoria. Unaweza kuanzisha moja kwa mtaa wako, mahali pako pa kazi, familia yako upande wa pili wa mji — ukitumia seva ya jumuiya yako yenyewe tu. Bila akaunti ya GitHub, bila duka la programu, bila kulazimika kutumia Docker, bila ruhusa ya mtu yeyote.",
    "Hili linawezekana kwa sababu Understoria ni programu huru (yenye leseni ya AGPL) na kila seva inautoa msimbo wake wa chanzo — msimbo ule ule inaouendesha. Hilo si jambo la upole tu; leseni inalitaka, na programu imelijenga ndani yake ili kamwe kampuni moja, mwenyeji mmoja, au hazina moja isiwe mahali pekee programu hii inapoishi. Kila jumuiya ni mbegu.",
    "Mwongozo huu ni wa nani: mtu aliyezoea kufuata maelekezo ya terminal kwa makini, lakini ambaye hajawahi kusimika seva. Kama maneno “terminal” na “amri” ni mageni kwako, fanya haya ukiwa kando ya mwanajumuiya aliyeshayafanya — hivyo ndivyo maarifa haya yanavyotakiwa kusafiri hata hivyo."
  ],
  "steps": [
    {
      "id": "what-you-need",
      "title": "1. Unachokihitaji",
      "paragraphs": [
        "Kompyuta yenye terminal (amri zilizo hapa chini ni za Linux au Mac; Raspberry Pi inafaa). Kama dakika 15 za kuijaribu programu kwenye mashine yako mwenyewe. Kusimika seva halisi kwa ajili ya wanajumuiya ni alasiri ndefu zaidi, na kunahitaji jina la kikoa na seva ndogo — miongozo inayokuja ndani ya pakuo inashughulikia yote hayo."
      ]
    },
    {
      "id": "get-the-software",
      "title": "2. Ipate programu",
      "paragraphs": [
        "Njia rahisi: kwenye jumuiya ya ukurasa huu wenyewe — au jumuiya yoyote ya Understoria unayoweza kuifikia — fungua Menyu (juu kulia) → Miundombinu ya jumuiya → kadi inayoitwa “Programu yenyewe”. Pakua faili ZOTE MBILI: archive ya msimbo wa chanzo na alama za ukaguzi (checksums). Ziweke kwenye folda moja.",
        "Njia ya terminal (badilisha anwani kwa ya jumuiya yako):",
        "Seva nyingine zinatoa pia “Furushi la historia kamili”. Ni kubwa zaidi, na kama una git imesakinishwa ndilo pakuo bora zaidi: unapata historia yote ya utengenezaji, na baadaye unavuta masasisho kwa njia ya kawaida. Ukilichukua furushi, lifungue kwa git badala ya tar:"
      ],
      "code": [
        "mkdir understoria-download && cd understoria-download\ncurl -fsSO https://YOUR-COMMUNITY.example/source/understoria-source.tar.gz\ncurl -fsSO https://YOUR-COMMUNITY.example/source/SHA256SUMS",
        "curl -fsSO https://YOUR-COMMUNITY.example/source/understoria.bundle\ngit clone understoria.bundle understoria"
      ]
    },
    {
      "id": "verify",
      "title": "3. Kagua ulichokipakua",
      "paragraphs": [
        "Alama ya ukaguzi (checksum) ni alama ya kidole inayopigwa hesabu kutoka kwenye baiti halisi za faili. Hata baiti moja ikibadilika njiani kuja kwako — muunganisho unaosuasua, upakuaji uliokatika — alama hiyo inabadilika kabisa. Ikague kabla ya kujenga chochote. Unachotaka kukiona ni “OK”. Kingine chochote: futa upakue upya.",
        "Kuwa mkweli kwako mwenyewe kuhusu hiki kinachothibitishwa: alama ya ukaguzi ilitoka kwenye seva ile ile iliyotoa faili, kwa hiyo inathibitisha kwamba pakuo lilifika likiwa zima — haiwezi kuthibitisha kwamba hakuna aliyeubadilisha msimbo kwenye seva hiyo. Uaminifu huo tayari unampa mwendeshaji wako kila siku (yeye ndiye anayekuletea programu hii inayoendeshwa sasa). Kwa uthibitisho unaojitegemea, chukua alama za ukaguzi za toleo lile lile kutoka kwa jumuiya ya pili na uzilinganishe — waendeshaji wawili wangelazimika kula njama ili kuudanganya ukaguzi huo.",
        "Kisha fungua archive. Inajifungulia kwenye folda uliyomo, kwa hiyo tengeneza moja kwanza:"
      ],
      "code": [
        "# Linux:\nsha256sum -c SHA256SUMS\n# Mac:\nshasum -a 256 -c SHA256SUMS",
        "mkdir understoria\ntar -xzf understoria-source.tar.gz -C understoria\ncd understoria"
      ]
    },
    {
      "id": "try-it",
      "title": "4. Ijaribu kabla hujajifunga na lolote",
      "paragraphs": [
        "Unaweza kuiendesha programu nzima kwenye mashine yako mwenyewe na kuyatembea mabadilishano halisi tangu mwanzo hadi mwisho. Folda uliyoifungua sasa hivi ina kila mwongozo mradi ulionao, kwenye folda yake ya docs — fungua docs/quickstart.md kwenye kihariri chochote cha maandishi na uufuate kutoka hatua yake ya kwanza. Pale unapoambiwa ku-clone hazina, ruka hatua hiyo: tayari umekaa ndani ya folda ya msimbo.",
        "Hili linafaa kufanywa hata kama una uhakika. Utajipokea mwenyewe kama mwanajumuiya, utabandika hitaji, na kuthibitisha mabadilishano — ili mwanajumuiya wako halisi wa kwanza atakapokwama, utakuwa umeshaiona skrini yake."
      ]
    },
    {
      "id": "deploy",
      "title": "5. Isimike kwa ajili ya jumuiya yako",
      "paragraphs": [
        "Miongozo kamili ya seva iko kwenye folda ile ile ya docs, imeandikwa kwa ajili ya wakati huu hasa. Chagua kwa jinsi unavyotaka kuiendesha: docs/deploy-linode.md (Docker kwenye seva ndogo ya daraja la dola tano — njia inayopitiwa zaidi, sehemu kubwa yake ikifanywa na skripti ya maandalizi) au docs/deploy-alternatives.md (Podman, au Linux tupu bila kontena kabisa — umbo linalofaa kwa kompyuta uliyokabidhiwa kama zawadi).",
        "Tafsiri moja ya kufanya unapoisoma, kwa kuwa yote miwili inaanza kwa ku-clone kutoka kwenye hazina ya wazi: pale mwongozo unaposema u-clone kwenye folda kwenye seva, badala yake nakili archive yako iliyokaguliwa huko kisha uifungue. Kila kingine — ufunguo wa mfumo, faili la mipangilio, funguo za waanzilishi, nakala rudufu, orodha ya “kabla ya kufungua kwa wote” — kinatumika bila mabadiliko.",
        "Kusasisha baadaye, bila git: pakua archive mpya zaidi kutoka kwa seva yoyote inayoendesha toleo jipya zaidi, ikague vivyo hivyo, ifungulie kwenye folda mpya, hamisha faili lako la mipangilio, kisha usimike upya. Data ya jumuiya yako iko salama katika haya yote — haiishi kamwe kwenye folda ya msimbo."
      ],
      "code": [
        "scp understoria-source.tar.gz SHA256SUMS root@YOUR-SERVER:/opt/\nssh root@YOUR-SERVER\ncd /opt && sha256sum -c SHA256SUMS && mkdir understoria \\\n  && tar -xzf understoria-source.tar.gz -C understoria\ncd understoria"
      ]
    },
    {
      "id": "seed",
      "title": "6. Sasa wewe pia ni mbegu",
      "paragraphs": [
        "Mara seva yako inapowaka, inautoa msimbo wake wa chanzo YENYEWE kwa njia ile ile — kiotomatiki, kutoka kwenye build ile ile. Wanajumuiya wako wanaweza kukagua wanachokiendesha, na mtaa unaofuata unaweza kuanzia kwako jinsi wewe ulivyoanzia sasa hivi kwa jumuiya yako. Hakuna sehemu moja — si GitHub, si waandishi wa mradi, si mwendeshaji yeyote mmoja — inayoweza kuwanyang’anya wote programu hii kwa mara moja.",
        "Mazoea mawili yanaufanya mnyororo kuwa imara: simika upya mara kwa mara (seva yako inatoa msimbo wa inachokiendesha, kwa hiyo kuendesha kilicho kipya ni kupanda mbegu iliyo mpya), na uijue seva ya jumuiya ya pili — ukaguzi wa kulinganisha seva mbili ulio hapo juu unafanya kazi tu kama jumuiya zinaweza kutajana."
      ]
    }
  ],
  "closing": [
    "Maswali ambayo ukurasa huu haujayajibu yanaishi kwenye folda ya docs ya pakuo — docs/bootstrap-from-a-node.md ni matembezi haya haya yakiwa na undani zaidi, na docs/operator-guide.md ni kitabu cha kila siku cha yeyote anayeiweka seva hai."
  ]
};
