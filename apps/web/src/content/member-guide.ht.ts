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

export const MEMBER_GUIDE_HT: readonly GuideSection[] = [
  {
    "id": "what-it-is",
    "title": "Sa Understoria ye",
    "body": [
      "Understoria se yon bank tan: yon fason pou yon kominote fè echanj èd, kote chak èdtan konte menm jan. Yon èdtan pou ranje yon lavabo vo yon èdtan pou koute yon moun apre yon jounen difisil.",
      "Se pa yon aplikasyon pou chèche djòb. Se yon lojisyèl ki la pou kore yon kominote ki egziste deja — yon kote travay, yon katye, yon gwoup moun ki gen menm kòz — yon kominote kote moun deja gen konfyans youn nan lòt, e ki vle yon fason lejè pou èd youn bay lòt rete devan je tout moun."
    ]
  },
  {
    "id": "credits",
    "title": "Ki jan èdtan yo mache",
    "body": [
      "Chak nouvo manm kòmanse ak 5 èdtan semans. Ou ka mande èd anvan menm ou bay anyen. Mande èd se pa yon dèt — ou pa prete anyen nan men pèsonn. Se konsa rezo a pran lavi.",
      "Lè ou ede yon moun, nou toude konfime echanj lan. Èdtan pa ou yo monte ak kantite èdtan ki bay la; pa li yo desann. Lajan pa janm pase men; pèsonn p ap kenbe klasman sou pèsonn.",
      "Èdtan ou yo kalkile apati yon kaye siyen ki kenbe chak echanj. Si yon bagay sanble pa bon, ou ka tcheke l liy pa liy."
    ]
  },
  {
    "id": "identity",
    "title": "Idantite ou",
    "body": [
      "Idantite ou se yon pè kle kriptografik. Pa gen imèl, pa gen nimewo telefòn, pa gen modpas kont. Non ou vle yo rele w la se ou ki chwazi l — se yon etikèt, se pa yon pyès idantite.",
      "Ou ka klete kle ki sou aparèy ou a ak anprent ou, figi ou, oswa PIN aparèy la (yon passkey — li la depi premye jou a, lè w ap fèk antre nan aplikasyon an, epi li mache san entènèt ditou), oswa ak yon passphrase ou tape; ou ka gen toude tou, ak passphrase la kòm dezyèm chemen pou antre. Anyen sou kle sa a pa ale ni kay Apple, ni kay Google, ni sou okenn sèvè — se sou aparèy ou a tcheke a fèt.",
      "Si ou pèdi passphrase ou — oswa telefòn ou ansanm ak kle anprent li a — pèsonn pa ka fè l tounen pou ou. Se lòt bò meday la: pa gen okenn otorite santral ki ka li done ou yo, e sa vle di tou, pa gen okenn otorite santral ki ka sove yo pou ou. Sa k ap fè ou tounen, se yon kopi ou te fè pandan tout bagay te byen: yon dezyèm aparèy ki mare ak kont lan, moun ou chwazi pou sere kle w, oswa yon kit pou tounen — chak ladan yo pran yon ti minit nan Paramèt.",
      "Si yon jou ou bezwen efase tout bagay vit — efase yon pati (kache idantite w) oswa efase nèt (rekòmanse depi nan zewo) — gen yon bouton danje nan Pwofil, anba “Ijans”."
    ]
  },
  {
    "id": "trust",
    "title": "Konfyans ak fason moun antre",
    "body": [
      "Pou yon nouvo manm vin moun konfyans nèt, li bezwen de manm ki la deja ki reponn pou li. Lè yon moun sèvi ak envitasyon ou a, sa konte deja tankou pawòl ou bay pou li.",
      "Yon manm ka afiche epi pran èd anvan menm li vin moun konfyans nèt — mande èd pa janm fèmen; mande — se konsa vwazen viv. Men kominote a wè yon ti mak ki montre kote moun nan ye nan konfyans lan, konsa manm yo ka reponn pou li lè sa merite."
    ]
  },
  {
    "id": "governance",
    "title": "Desizyon ak dezakò",
    "body": [
      "Desizyon nan kominote a, se ansanm yo pran yo — pa gen chèf isit la: aplikasyon an fèt espre pou pa gen okenn wòl ki bay yon moun pouvwa sou lòt. Chwa ki konsène tout kominote a pase nan pwopozisyon ki louvri devan tout moun: nenpòt manm ka louvri youn nan Pwofil → Pwopozisyon kominote a, tout moun ka wè l, epi li rete louvri pandan yon peryòd pou moun pale sou li anvan li fèmen.",
      "Dezakò sou yon echanj presi pase nan menm chemen an: louvri yon dezakò nan Pwofil → Dezakò nan kominote a, epi li tounen yon pwopozisyon kominote a ap gade ansanm — rezilta a aplike pou kont li lè l fèmen.",
      "Tout sa aplikasyon an pa deside — regleman lakay, ki lè nou tout reyini, ki jan youn pale ak lòt — fèt sou kanal kominote a deja sèvi a. Aplikasyon an anrejistre desizyon yo; li pa ranplase chita pale a."
    ]
  },
  {
    "id": "where-from-here",
    "title": "Ki kote pou ale kounye a",
    "body": [
      "Ouvri Tablo a pou wè sa vwazen yo gen pou bay ak sa yo bezwen kounye a la.",
      "Ouvri Souf pou wè ki jan kominote a ye — konbyen èdtan ki pase antou, ki kote èd ap koule, sa ki fete deja.",
      "Ouvri Pwofil pou mete ajou sa ou konn fè ak lè ou lib, pou envite yon lòt moun, oswa pou li gid ki pi long yo ki sou aparèy la."
    ]
  }
];
