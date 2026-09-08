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
import type { StartCommunityGuide } from "./startCommunity";

export const START_COMMUNITY_HT: StartCommunityGuide = {
  "intro": [
    "Kominote ou a ap fè Understoria mache. Ou ka kòmanse youn pou katye ou, pou kote ou travay, pou fanmi ou lòtbò lavil la — ak pwòp sèvè kominote ou a sèlman. San kont GitHub, san app store, san Docker, san pèmisyon pèsonn.",
    "Sa mache paske Understoria se lojisyèl lib (anba lisans AGPL) epi chak sèvè ofri pwòp kòd sous li — kòd egzak l ap fè mache a. Sa se pa yon jantiyès; lisans lan egzije sa, epi aplikasyon an bati l anndan l pou okenn konpayi, okenn kote k ap fè l mache, okenn achiv kòd pa janm ka sèl kote lojisyèl la rete. Chak kominote se yon semans.",
    "Pou ki moun sa fèt: yon moun ki alèz pou swiv enstriksyon tèminal ak anpil atansyon, men ki pa janm deplwaye yon sèvè. Si mo “tèminal” ak “kòmand” nèf pou ou, fè sa bò kote yon manm ki fè l deja — se konsa konesans sa a fèt pou vwayaje kanmenm."
  ],
  "steps": [
    {
      "id": "what-you-need",
      "title": "1. Sa ou bezwen",
      "paragraphs": [
        "Yon òdinatè ki gen yon tèminal (kòmand ki anba yo se pou Linux oswa yon Mac; yon Raspberry Pi mache). Anviwon 15 minit pou eseye aplikasyon an sou pwòp machin ou. Deplwaye yon vrè sèvè pou manm yo se yon apremidi ki pi long, epi sa mande yon non domèn ak yon ti sèvè — gid ki vini anndan telechajman an kouvri tout sa."
      ]
    },
    {
      "id": "get-the-software",
      "title": "2. Jwenn lojisyèl la",
      "paragraphs": [
        "Fason fasil la: sou kominote paj sa a menm — oswa nenpòt kominote Understoria ou ka rive sou li — louvri Meni an (anwo adwat) → Enfrastrikti kominote a → kat ki rele “Lojisyèl la menm” nan. Telechaje tou de fichye yo — tou de menm: achiv kòd sous la ak checksums yo. Mete yo nan menm dosye a.",
        "Fason tèminal la (ranplase adrès la ak pa kominote ou a):",
        "Gen sèvè ki ofri yon “pakè tout istwa a” tou. Li pi gwo, epi si git enstale lakay ou se pi bon telechajman an: ou jwenn tout istwa devlopman an ak mizajou nòmal pita. Si ou pran pakè a, ouvri l ak git olye de tar:"
      ],
      "code": [
        "mkdir understoria-download && cd understoria-download\ncurl -fsSO https://YOUR-COMMUNITY.example/source/understoria-source.tar.gz\ncurl -fsSO https://YOUR-COMMUNITY.example/source/SHA256SUMS",
        "curl -fsSO https://YOUR-COMMUNITY.example/source/understoria.bundle\ngit clone understoria.bundle understoria"
      ]
    },
    {
      "id": "verify",
      "title": "3. Verifye sa ou telechaje a",
      "paragraphs": [
        "Yon checksum se yon anprent yo kalkile sou fichye a byte pa byte. Si menm yon sèl byte chanje sou wout la — yon koneksyon k ap sote, yon telechajman ki koupe — anprent lan chanje nèt. Tcheke l anvan ou bati anyen. Se “OK” ou vle wè. Nenpòt lòt bagay: efase epi telechaje ankò.",
        "Rete onèt ak tèt ou sou sa sa pwouve: checksum nan soti sou menm sèvè ak fichye a, kidonk li pwouve telechajman an rive antye — li pa ka pwouve pèsonn pa t chanje kòd la sou sèvè sa a. Ou deja bay moun k ap fè sèvè ou a mache a konfyans sa a chak jou (se li k ap sèvi ou aplikasyon w ap itilize la a). Pou yon konfimasyon endepandan, al pran checksums yon dezyèm kominote pou menm vèsyon an epi konpare — fòk de moun k ap fè sèvè mache ta fè konplo ansanm pou twonpe sa.",
        "Apre sa, ouvri l. Achiv la louvri nan dosye kote ou ye a, kidonk fè youn anvan:"
      ],
      "code": [
        "# Linux:\nsha256sum -c SHA256SUMS\n# Mac:\nshasum -a 256 -c SHA256SUMS",
        "mkdir understoria\ntar -xzf understoria-source.tar.gz -C understoria\ncd understoria"
      ]
    },
    {
      "id": "try-it",
      "title": "4. Eseye l anvan ou angaje ou nan anyen",
      "paragraphs": [
        "Ou ka fè tout aplikasyon an mache sou pwòp machin ou epi fè yon echanj toutbon soti nan kòmansman rive nan bout. Dosye ou fèk louvri a gen tout gid pwojè a genyen, nan dosye docs li — louvri docs/quickstart.md nan nenpòt editè tèks epi swiv li depi premye etap li. Kote li di pou klone achiv kòd la, sote sa: ou deja chita nan dosye kòd sous la.",
        "Sa vo lapenn menm si ou fin sèten. W ap fè pwòp antre ou, afiche yon bezwen, epi konfime yon echanj — konsa, lè premye vrè manm ou an kole yon kote, w ap gentan konn ekran li deja."
      ]
    },
    {
      "id": "deploy",
      "title": "5. Deplwaye l pou kominote ou",
      "paragraphs": [
        "Tout gid sèvè yo nan menm dosye docs la, ekri egzakteman pou moman sa a. Chwazi dapre jan ou vle fè l mache: docs/deploy-linode.md (Docker sou yon ti sèvè klas senk dola — wout moun pi plis pase a, yon script enstalasyon fè pi fò travay la poukont li) oswa docs/deploy-alternatives.md (Podman, oswa Linux tou senp san okenn container — fòm ki bon pou machin moun fè kado).",
        "Gen yon sèl tradiksyon pou fè pandan w ap li yo, paske tou de kòmanse ak klone depi achiv kòd piblik la: kote yon gid di pou klone nan yon dosye sou sèvè a, olye de sa, kopye achiv ou fin verifye a la epi louvri l. Tout rès la — kle sistèm nan, fichye paramèt la, kle fondatè yo, kopi rezèv yo, lis “anvan ou louvri pou piblik la” — rete jan l ye a.",
        "Pou mete ajou pita, san git: telechaje achiv ki pi nouvo a sou nenpòt sèvè k ap fè vèsyon ki pi nouvo a mache, verifye l menm jan an, louvri l nan yon dosye tou nèf, pote fichye paramèt ou a avè w, epi redeplwaye. Done kominote ou a an sekirite pandan tout sa — yo pa janm rete nan dosye kòd sous la."
      ],
      "code": [
        "scp understoria-source.tar.gz SHA256SUMS root@YOUR-SERVER:/opt/\nssh root@YOUR-SERVER\ncd /opt && sha256sum -c SHA256SUMS && mkdir understoria \\\n  && tar -xzf understoria-source.tar.gz -C understoria\ncd understoria"
      ]
    },
    {
      "id": "seed",
      "title": "6. Kounye a ou se yon semans tou",
      "paragraphs": [
        "Depi sèvè ou a kanpe, li ofri pwòp kòd sous pa li menm jan an — otomatikman, soti nan menm build la. Manm ou yo ka verifye sa y ap fè mache a, epi pwochen katye a ka demare sou ou menm jan ou sot fè l sou kominote ou a. Pa gen yon sèl pwen — ni GitHub, ni moun ki ekri pwojè a, ni okenn moun k ap fè yon sèvè mache — ki ka pran lojisyèl la nan men tout moun yon sèl kou.",
        "De abitid kenbe chenn nan solid: redeplwaye tanzantan (sèvè ou a ofri kòd sous sa l ap fè mache a, kidonk fè yon bagay resan mache vle di simen yon bagay resan), epi konnen sèvè yon dezyèm kominote — tcheke konpare-de-sèvè ki pi wo a mache sèlman si kominote yo ka bay non youn lòt."
      ]
    }
  ],
  "closing": [
    "Kesyon paj sa a pa reponn yo rete nan dosye docs telechajman an — docs/bootstrap-from-a-node.md se menm gid sa a ak plis detay, epi docs/operator-guide.md se manyèl chak jou pou moun k ap kenbe sèvè a kanpe a."
  ]
};
