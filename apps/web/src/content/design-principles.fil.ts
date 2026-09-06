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
// Filipino translation (i18n demand-driven wave). Loaded lazily
// via content/bundles/fil.ts — never import statically from app code.
// Ids are stable and never translated; parity gates enforce structure.
import type { DesignPrinciple } from "./design-principles";

export const DESIGN_PRINCIPLES_FIL: readonly DesignPrinciple[] = [
  {
    "id": "equal-time",
    "title": "Pantay na oras",
    "statement": "Ang isang oras ng tulong ay laging katumbas ng isang oras ng tulong, anuman ang uri ng gawain.",
    "example": "Sa mga naunang bangko ng oras na sumubok magtakda ng halaga ayon sa merkado, ang emosyonal na suporta at ang pag-aalaga ng bata — ang mga gawaing kadalasang ginagampanan ng kababaihan at ng mga miyembrong may kapansanan — ang palaging pinakamababa ang turing. Ang pantay na oras ang pang-istrukturang lunas."
  },
  {
    "id": "no-leaderboards",
    "title": "Walang leaderboard, walang sariling iskor",
    "statement": "Sa antas ng komunidad sinusubaybayan ang pag-usad. Ang panukat ay tayo, hindi ako.",
    "example": "Nang magdagdag ang Couchsurfing ng iskor ng reputasyon, sinimulan itong laruin ng mga host, at ang mga pinakabulnerableng bisita — ang mga hindi nakapagbibigay ng mataas na rating bilang kapalit — ay tuluyang nawalan ng puwang sa sistema."
  },
  {
    "id": "no-notifications",
    "title": "Walang push notification",
    "statement": "Kapag binuksan mo ang app, ipinapakita nito ang nangangailangan ng atensyon mo. Walang pag-vibrate, walang bilang na humahabol sa iyo mula screen hanggang screen, walang palabas na pagkaapura.",
    "example": "Malawakang ikinuwento ng mga nag-aayos ng tulungan noong panahon ng COVID na ang mga kasangkapang hatak ng notification ang unang umuubos sa kanilang pinakatapat na miyembro — ang mga taong pinakahindi kayang mawala ng komunidad. Ang karanasang iyon, hindi isang pormal na pag-aaral, ang pinagtatayuan ng prinsipyong ito."
  },
  {
    "id": "solidarity-not-shame",
    "title": "Damayan, hindi sisihan",
    "statement": "Hindi kailanman inilalarawan ang isang sitwasyon bilang naipit, lampas sa taning, o bigo. Nagbabago ang kakayahan ng bawat isa; umaangkop ang sistema nang walang sinisisi.",
    "example": "Ginagamit ng mga gig platform ang mga udyok na “napag-iiwanan ka na” para pigain ang mas maraming trabaho. Ang mga manggagawang pinakatinatamaan ay ang mga nasa gitna na ng krisis — mismong ang mga taong dahilan kung bakit umiiral ang tulungan."
  },
  {
    "id": "community-authority",
    "title": "Ang komunidad ang awtoridad",
    "statement": "Walang papel na admin. Ang mga pasya sa pamamahala ay dumadaan sa mga mungkahi ng komunidad, hindi sa kapangyarihan ng iisang tao.",
    "example": "Pinatunayan ng mga kooperatiba ng Mondragón sa loob ng mahigit 60 taon na ang pamamahala ng mga manggagawa mismo ay nakahihigit sa pamamahala ng mga manager, kapwa sa pagkakapantay-pantay at sa haba ng buhay. Ang papel na “admin” ay isang pasya sa disenyo, hindi isang pangangailangan."
  },
  {
    "id": "asking-never-gated",
    "title": "Laging bukas ang paghingi ng tulong",
    "statement": "Bawat bagong miyembro ay nagsisimula nang may binhing oras. Puwede kang tumanggap bago ka magbigay.",
    "example": "Sa mga bangko ng oras na nag-aatas munang magbigay bago humingi, ang mga pinakabulnerableng miyembro — ang matatanda, ang mga bagong salta, ang mga nasa krisis — ay hindi kailanman humingi ng tulong. Ang binhing oras ang pang-istrukturang lunas."
  },
  {
    "id": "privacy-precondition",
    "title": "Ang privacy ay paunang kondisyon",
    "statement": "Walang email, walang numero ng telepono, kaunting-kaunti lang ang naitatala. Ang pagkakakilanlan mo ay isang cryptographic na susi sa device mo.",
    "example": "May mga sentro ng manggagawa na gumamit ng digital na listahan ng pagdalo — at ang kanilang listahan ng miyembro ay sapilitang ipinakuha ng korte o tumagas sa mga employer. Hinihingi ng pag-oorganisa na ang mismong pagiging miyembro ang protektado, hindi lang ang nilalaman."
  },
  {
    "id": "deliberation-over-speed",
    "title": "Pag-uusap muna bago ang bilis",
    "statement": "Nananatiling bukas ang mga mungkahi sa loob ng panahong puwedeng iakma. Kailangan ng pagkakasundo ang panahon, hindi lang ang quorum.",
    "example": "Sa mga kooperatiba, paulit-ulit na naiiwang hindi naririnig ng mabibilis na online na botohan ang mga manggagawang panggabi ang turno, ang mga nag-aalaga ng kapwa, at ang mga miyembrong limitado ang internet. Ang default na 3 araw na bintana ng pag-uusap ay nagbibigay sa lahat ng tunay na pagkakataong magsalita (puwede itong iakma ng bawat komunidad, hanggang sa pinakamababang 1 araw)."
  },
  {
    "id": "no-post-editing",
    "title": "Bakit ipaskil ulit sa halip na i-edit",
    "statement": "Kapag naibahagi na sa komunidad ang isang paskil, hindi na ito puwedeng i-edit o burahin nang tahimik — nananatiling mapagkakatiwalaan ng lahat ng nakakita ang tala ng kung ano ang hiningi.",
    "example": "Ang mga platform na nagpapahintulot ng tahimik na pag-e-edit ng paskil ay lumilikha ng problema sa pagtanggi — nagiging imposibleng lutasin ang “hindi ko sinabi iyan”. Ang pag-iingat sa orihinal kung paano ito noon, kasama ang daloy ng muling pagpapaskil para sa mga pagbabago, ay nagpapanatili kapwa ng luwag na magbago at ng paninindigan sa sinabi."
  },
  {
    "id": "no-read-receipts",
    "title": "Walang read receipt sa mga mensahe",
    "statement": "Hindi sinasabi ng app sa nagpadala kung kailan nabasa ang mensahe niya. Ang kung sino ang kausap ng sino ang mapa ng ugnayang pinakaiingatan ng modelo ng banta.",
    "example": "Ang mga asul na check ng WhatsApp ay lumikha ng presyur na sumagot agad at nagbigay-daan sa mga mapang-abusong karelasyon na bantayan kung gaano kabilis sumagot. Ang pag-aalis ng read receipt ay tuluyang nag-aalis ng ganoong daan ng pagmamanman."
  },
  {
    "id": "no-activity-search",
    "title": "Walang paghahanap ng miyembro ayon sa aktibidad",
    "statement": "Hindi mo mahahanap kung “sino ang pinaka-aktibo” o “sino ang pinakamaraming naitulong”. Ang galaw ng aktibidad ay datos ng pagmamanman.",
    "example": "Nang ilathala ng Strava ang pinagsama-samang heatmap ng aktibidad, aksidente nitong naibunyag ang kinaroroonan ng mga lihim na base militar. Mas marami pang naibubunyag ang galaw ng aktibidad ng bawat indibidwal — ipinapakita nito kung sino ang nag-oorganisa, kailan, at kasama ang sino-sino."
  },
  {
    "id": "follows-not-blocked",
    "title": "“Kasunod” ang mga gawain — hindi kailanman “blocked”",
    "statement": "Ang gawaing naghihintay sa ibang gawain ay nasa pagkakasunod-sunod, hindi naipit. Ang paglalarawan ang humuhubog sa pakiramdam ng mga tao sa gawain.",
    "example": "Ang mga kasangkapan sa pamamahala ng proyekto na nagtatatak sa mga gawain ng “blocked” ay lumilikha ng ugaling sisihan — may “humaharang” sa iba. Ang “kasunod ng” ay naglalarawan sa parehong ugnayan bilang likas na pagkakasunod, at naaalis ang tensiyon sa pagitan ng mga tao."
  }
];
