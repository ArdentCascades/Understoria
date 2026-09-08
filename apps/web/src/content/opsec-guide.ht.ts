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
import type { GuideSection } from "./member-guide";

export const OPSEC_GUIDE_HT: readonly GuideSection[] = [
  {
    "id": "device",
    "title": "Sou aparèy ou",
    "body": [
      "Klete telefòn ou ak yon PIN sis chif oswa yon passphrase solid. Limen chifreman tout disk la (tout telefòn modèn gen li limen depi nan faktori; sou yon laptòp, sèvi ak FileVault, BitLocker, oswa LUKS). Kenbe sistèm aparèy la ajou — pifò atak tout bon yo pase nan twou ki te deja bouche ak mizajou."
    ]
  },
  {
    "id": "accounts",
    "title": "Sou idantite ou",
    "body": [
      "Understoria pa janm mande ni imèl ni nimewo telefòn. Si yon moun ki di li soti nan Understoria mande ou bagay sa yo, se yon pèlen — y ap eseye vòlè idantite ou.",
      "Idantite ou se yon kle kriptografik ki sou aparèy sa a. Ou ka ekspòte yon kopi — sere l yon kote ki an sekirite e ki pa sou entènèt. Yon fèy papye enprime nan yon tiwa souvan pi bon pase yon sèvis cloud.",
      "Si telefòn ou pèdi oswa yo vòlè l, se kle ou te klete a (passkey ou a — anprent, figi, oswa PIN — oswa yon passphrase) k ap pwoteje idantite ou — se pou sa aplikasyon an ofri ou youn depi premye jou a. Pa gen okenn revokasyon santral, pa gen okenn moun ki ka peze yon bouton pou ou: fè kominote ou konnen sa ki pase a, pou moun ka sispann fè kle sa a konfyans, epi rekòmanse ak yon kle nèf (Pwofil → Ijans → Efase nèt sou nenpòt aparèy ki toujou kenbe ansyen an)."
    ]
  },
  {
    "id": "communication",
    "title": "Sou kominikasyon ou",
    "body": [
      "Pa pale sou travay òganizasyon an sou aparèy patwon an, ni sou rezo li. Laptòp travay ak Wi-Fi konpayi yo kenbe tras — e pafwa yo veye sa k ap fèt.",
      "Pa fè foto ekran sa ki nan aplikasyon an pou voye l deyò kominote a. Depi yon bagay soti nan Understoria, li pa pwoteje ankò.",
      "Pou koze ki sansib, wè youn ak lòt fasafas. Yon ti mache dis minit fè plis pase de èdtan mesaj k ap monte desann."
    ]
  },
  {
    "id": "social",
    "title": "Sou tras ou kite sou rezo sosyal",
    "body": [
      "Kenbe non ou sèvi nan Understoria a apa de idantite travay ou. Yon non jwèt se yon pwoteksyon — se pa yon siy ou gen move lentansyon.",
      "Pa mete pawòl sou travay òganizasyon an sou rezo sosyal piblik ak non ofisyèl ou sou li. Menm ti mesaj “ankourajman jeneral” yo trase yon chema — yon moun ki deside veye w ka konekte pwen yo."
    ]
  },
  {
    "id": "wrong",
    "title": "Si yon bagay sanble pa bon",
    "body": [
      "Si yon moun ou pa konnen vle antre, pran san ou. Mande pou yon manm reponn pou li.",
      "Si yon manm ki la deja kòmanse poze kesyon dwòl sou lis manm yo oswa sou ki moun ki ede ki moun — make sa nan tèt ou. Pale ak yon lòt manm. Enfiltrasyon se yon bagay ki konn rive tout bon.",
      "Si yon konpayi, yon patwon, oswa yon polisye mande ou bay enfòmasyon sou manm yo oswa sou sa k ap fèt: ou pa oblije. Pa rete pou kont ou ak sa — pale ak manm ou fè konfyans anvan ou reponn anyen."
    ]
  },
  {
    "id": "rights",
    "title": "Konnen dwa ou",
    "body": [
      "Ou pa oblije reponn kesyon lapolis san yon avoka pa la. Ou pa oblije bay konsantman pou yo fouye aparèy ou — anjeneral yo bezwen yon manda. Ou pa oblije di ki moun lòt manm yo ye. Ou gen dwa rete an silans — se yon dwa tout bon.",
      "Anprent ak figi se pa pawòl. Nan anpil kote, tribinal yo trete yon ouvèti ak anprent oswa figi (byometrik) tankou yon kle fizik — lapolis ka peze dwèt ou sou telefòn nan, oswa kenbe l devan figi ou — alòske yon bagay ki nan tèt ou, tankou yon passphrase, trete tankou yon temwayaj ou gen dwa refize bay. Sa chanje selon peyi a e selon tribinal la, kidonk tcheke ak yon òganizasyon avoka k ap defann dwa moun nan zòn ou; men si gen posiblite pou yo kenbe w, konsidere sa konsa: yo ka fòse yon anprent oswa yon figi — yo pa ka fòse yon passphrase.",
      "Aprann jès ki klete telefòn ou nèt la anvan ou bezwen l. Sou iPhone, kenbe bouton sou kote a ansanm ak youn nan bouton volim yo pandan de segond (jouk ekran pou etenn nan parèt) — apre sa, Face ID ak Touch ID pa mache ankò jiskaske yon moun antre kòd la. Sou Android, kenbe bouton pou limen an epi peze “Lockdown” (si li pa la, limen l anvan nan paramèt telefòn nan: Settings → Display → Lock screen). Pratike l jouk men ou fè l pou kont li.",
      "Nan Understoria menm: si ou wè yo ta ka fòse ou ouvri aparèy ou, pwoteje kle ou ak yon passphrase olye yon anprent — oswa retire ouvèti ak anprent lan (Pwofil → Paramèt → Sekirite) anvan yon manifestasyon, yon travèse fwontyè, oswa nenpòt moman kote yo ta ka kenbe w; ou ka remete l apre. Se sèlman yon passphrase ou tape ki kenbe dwa-refize a depi nan kòmansman jouk nan bout. Epi sonje bouton danje a (Pwofil → Ijans → Efase nèt) la pou lè klete pa ase.",
      "Òganizasyon avoka nan peyi kote ou ye a (tankou NLG Ozetazini, LDAN nan Angletè) ka ba ou yon ti kat “Konnen dwa ou” ki fèt pou lwa peyi sa a. Kenbe youn nan bous ou."
    ]
  }
];
