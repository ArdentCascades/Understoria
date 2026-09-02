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

export const OPSEC_GUIDE_SW: readonly GuideSection[] = [
  {
    "id": "device",
    "title": "Kwenye kifaa chako",
    "body": [
      "Funga simu yako kwa PIN ya tarakimu sita au maneno ya siri imara. Washa usimbaji wa diski nzima (kwenye kila simu ya kisasa tayari umewashwa tangu mwanzo; kwenye laptop tumia FileVault, BitLocker, au LUKS). Hakikisha mfumo wa kifaa chako unasasishwa kila mara — mashambulizi mengi ya ulimwengu halisi hutumia hitilafu ambazo tayari zimeshazibwa."
    ]
  },
  {
    "id": "accounts",
    "title": "Kuhusu utambulisho wako",
    "body": [
      "Understoria haiombi barua pepe wala namba ya simu. Mtu yeyote anayejiita wa Understoria akikuomba hivi, hilo ni jaribio la ulaghai (phishing).",
      "Utambulisho wako ni ufunguo wa kriptografia kwenye kifaa hiki. Unaweza kutoa nakala yake ya ziada — itunze mahali salama, nje ya mtandao. Karatasi iliyochapishwa ndani ya droo mara nyingi ni bora kuliko hifadhi ya wingu (cloud).",
      "Simu yako ikipotea au kuibiwa, kufuli uliyoiweka kwenye ufunguo wako (passkey yako ya alama ya kidole, uso, au PIN, au maneno ya siri) ndiyo inayoulinda — ndiyo maana hatua za kuanza zinakupa moja. Hakuna sehemu kuu ya kuufutia nguvu, wala mtu wa kukubonyezea swichi: iambie jumuiya yako kilichotokea ili watu wajue kuacha kuuamini utambulisho ule, kisha anza upya na ufunguo mpya (Wasifu → Dharura → Futa kabisa kwenye kila kifaa ambacho bado kinaushika ule wa zamani)."
    ]
  },
  {
    "id": "communication",
    "title": "Kuhusu mawasiliano yako",
    "body": [
      "Usijadili kazi za kujipanga kwenye vifaa au mitandao ya mwajiri. Laptop za kazini na WiFi za makampuni huandika kumbukumbu za matumizi, na wakati mwingine hufuatilia moja kwa moja.",
      "Usipige picha za skrini za yaliyomo ndani ya programu na kuzisambaza nje ya kikundi. Zikishatoka Understoria hazilindwi tena.",
      "Kwa mazungumzo nyeti, kutana ana kwa ana. Matembezi ya dakika kumi ni bora kuliko kubadilishana jumbe kwa saa mbili nzima."
    ]
  },
  {
    "id": "social",
    "title": "Kuhusu alama unazoacha mtandaoni",
    "body": [
      "Tenganisha jina lako la kuitwa la Understoria na utambulisho wako wa kazini. Jina la bandia ni sehemu ya usanifu, si ishara ya nia mbaya.",
      "Usiandike kuhusu kazi za kujipanga kwenye mitandao ya kijamii ya wazi ukiwa umeambatanisha jina lako rasmi. Hata machapisho ya “hamasa ya jumla” huunda ruwaza ambayo mtazamaji mwenye dhamira anaweza kuiunganisha."
    ]
  },
  {
    "id": "wrong",
    "title": "Kitu kikionekana si sawa",
    "body": [
      "Mtu usiyemjua akitaka kuongezwa, nenda taratibu. Omba udhamini.",
      "Mwanajumuiya aliyepo akianza kuuliza maswali ya ajabu kuhusu orodha za wanajumuiya au nani alimsaidia nani — andika ulichokiona. Zungumza na mwanajumuiya mwingine. Upenyezaji hutokea.",
      "Muuzaji, mwajiri, au afisa akikuomba utoe taarifa kuhusu wanajumuiya au shughuli zao: huna lazima ya kufanya hivyo. Usilibebe peke yako — zungumza na wanajumuiya unaowaamini kabla ya kujibu lolote."
    ]
  },
  {
    "id": "rights",
    "title": "Zijue haki zako",
    "body": [
      "Huna lazima ya kujibu maswali ya polisi bila mwanasheria kuwepo. Huna lazima ya kukubali kifaa chako kipekuliwe — kwa kawaida wanahitaji hati ya upekuzi kutoka mahakamani. Huna lazima ya kuwataja wanajumuiya wengine. Una haki ya kukaa kimya.",
      "Alama za vidole na nyuso si maneno. Sehemu nyingi, mahakama huchukulia kufungua kwa alama za mwili (biometriki) kama ufunguo wa chuma — polisi wanaweza kukibonyeza kidole chako kwenye simu au kuishikilia mbele ya uso wako — wakati kitu unachokijua, kama maneno ya siri, huchukuliwa kama ushahidi wa kinywa ambao una haki ya kukataa kuutoa. Hili linatofautiana nchi kwa nchi na mahakama kwa mahakama, kwa hiyo ulizia kwenye shirika la msaada wa kisheria la eneo lako; ila kama kuna uwezekano wa kushikiliwa, chukulia kwamba alama ya mwili inaweza kulazimishwa na maneno ya siri hayawezi.",
      "Jifunze mbinu ya simu yako ya kufunga kabisa kabla hujaihitaji. Kwenye iPhone, shikilia kitufe cha pembeni pamoja na kitufe chochote cha sauti kwa sekunde mbili (mpaka skrini ya kuzima ionekane) — Face ID na Touch ID zitakuwa zimezimwa hadi msimbo wa kufungua uandikwe. Kwenye Android, shikilia kitufe cha kuwasha kisha gusa Lockdown — kufuli kamili; kama haipo, iwashe kwanza kwenye Mipangilio → Onyesho → Skrini ya kufunga (Settings → Display → Lock screen). Fanya mazoezi mpaka mikono yako iizoee bila kufikiri.",
      "Ndani ya Understoria yenyewe: kama kulazimishwa kufungua ni miongoni mwa hatari unazojipangia ulinzi, linda ufunguo wako kwa maneno ya siri badala ya alama ya kidole — au ondoa kufungua kwa alama ya kidole (Wasifu → Mipangilio → Usalama) kabla ya maandamano, kuvuka mpaka, au wakati wowote ambapo kushikiliwa kunawezekana; unaweza kuirudisha baadaye. Ni maneno ya siri unayoyaandika mwenyewe tu ndiyo yanayobeba ile haki ya kukataa toka mwanzo hadi mwisho. Na kumbuka kitufe cha hatari (Wasifu → Dharura → Futa kabisa) kipo kwa ajili ya wakati ambapo kufunga peke yake hakutoshi.",
      "Mashirika ya msaada wa kisheria ya eneo lako (NLG nchini Marekani, LDAN nchini Uingereza) yanaweza kukupa kadi za “Zijue haki zako” zinazolingana na sheria za mahali pako. Weka moja kwenye pochi yako."
    ]
  }
];
