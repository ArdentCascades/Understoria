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
import type { DesignPrinciple } from "./design-principles";

export const DESIGN_PRINCIPLES_HT: readonly DesignPrinciple[] = [
  {
    "id": "equal-time",
    "title": "Chak èdtan gen menm valè",
    "statement": "Yon èdtan èd toujou egal yon èdtan, kèlkeswa travay la.",
    "example": "Premye bank tan ki te eseye bay chak kalite travay pri mache yo te wè menm bagay la chak fwa: soutyen moral ak okipe timoun — travay fanm ak manm ki gen andikap plis konn fè — se yo ki te toujou konte pou pi piti. Tan egal ranje pwoblèm sa a nan estrikti a menm."
  },
  {
    "id": "no-leaderboards",
    "title": "Pa gen klasman, pa gen nòt sou chak moun",
    "statement": "Pwogrè a mezire nan nivo tout kominote a. Inite mezi a se pa ‘mwen’ — se ‘nou tout’.",
    "example": "Lè Couchsurfing te ajoute yon nòt repitasyon, moun ki t ap resevwa vizitè yo te kòmanse fè jwèt ak li, epi vizitè ki pi frajil yo — moun ki pa t ka bay bon nòt an retou — te rete deyò sistèm nan nèt."
  },
  {
    "id": "no-notifications",
    "title": "Pa gen notifikasyon push",
    "statement": "Lè ou louvri aplikasyon an, li montre w sa ki bezwen atansyon ou. Pa gen vibrasyon, pa gen ti nimewo k ap kouri dèyè w sou chak ekran, pa gen teyat prese-prese.",
    "example": "Moun ki t ap òganize youn ede lòt nan tan COVID la te di l anpil fwa: zouti ki mache ak notifikasyon te fè manm ki pi angaje yo bouke anvan tout lòt — moun kominote yo pa t kapab pèdi menm nan. Se eksperyans sa a, se pa yon etid fòmèl, ki kenbe prensip sa a."
  },
  {
    "id": "solidarity-not-shame",
    "title": "Solidarite, pa repwòch",
    "statement": "Pa janm prezante yon sitiyasyon tankou li kanpe, li an reta, oswa li echwe. Kapasite moun chanje; sistèm nan adapte l san li pa lage fòt la sou pèsonn.",
    "example": "Platfòm ti djòb sou entènèt yo sèvi ak ti mesaj “w ap rete dèyè” pou rale plis travay nan men moun. Moun ki pran plis kou yo se travayè ki deja nan yon kriz — se egzakteman pou moun sa yo youn ede lòt egziste."
  },
  {
    "id": "community-authority",
    "title": "Se kominote a ki otorite a",
    "statement": "Pa gen chèf isit la — pa gen wòl admin. Desizyon gouvènans yo pase nan pwopozisyon kominote a, se pa nan pouvwa yon sèl moun.",
    "example": "Kooperativ Mondragón yo montre pandan plis pase 60 an: lè se travayè yo ki gouvènen, sa bay pi bon rezilta pase lè se patwon k ap gouvènen — ni pou jistis ni pou dire. Wòl “admin” lan pa yon obligasyon — se yon chwa moun ki fè yon aplikasyon fè."
  },
  {
    "id": "asking-never-gated",
    "title": "Mande èd pa janm fèmen",
    "statement": "Chak nouvo manm kòmanse ak èdtan semans. Ou ka resevwa anvan ou bay.",
    "example": "Bank tan ki te mande pou moun bay èd anvan yo ka mande te wè manm ki pi frajil yo — granmoun aje, moun ki fèk rive, moun ki nan yon kriz — pa janm mande èd. Èdtan semans ranje pwoblèm sa a nan estrikti a menm."
  },
  {
    "id": "privacy-precondition",
    "title": "Vi prive se premye kondisyon an",
    "statement": "Pa gen imèl, pa gen nimewo telefòn, prèske pa gen anyen ki make. Idantite ou se yon kle kriptografik sou aparèy ou.",
    "example": "Gen sant travayè ki t ap sèvi ak fèy prezans dijital — tribinal fòse yo lage lis manm yo, oswa lis yo koule al jwenn patwon yo. Pou òganize, se manm yo menm ki dwe pwoteje, pa sèlman sa yo di."
  },
  {
    "id": "deliberation-over-speed",
    "title": "Pran tan pou deside, pa prese",
    "statement": "Pwopozisyon yo rete louvri pandan yon peryòd kominote a ka regle. Antant mande tan — se pa sèlman konte tèt.",
    "example": "Vòt rapid sou entènèt nan kooperativ yo te toujou kite menm moun yo san vwa: moun ki travay lannwit, moun k ap okipe lòt moun, manm ki gen entènèt fèb. Fenèt 3 jou pa defo a bay tout moun yon vre chans pou di sa yo panse (kominote yo ka regle l, men li pa ka desann pi ba pase 1 jou)."
  },
  {
    "id": "no-post-editing",
    "title": "Poukisa afiche ankò olye pou korije",
    "statement": "Depi yon afich pataje ak kominote a, pèsonn pa ka chanje l ni efase l an kachèt — sa ki te mande a rete jan l te ye a, epi tout moun ki te wè l ka kontinye fè dosye a konfyans.",
    "example": "Platfòm ki kite moun chanje afich an silans kreye yon pwoblèm — “mwen pa t janm di sa” vin yon bagay pèsonn pa ka rezoud. Kenbe orijinal la jan l te ye a, ak yon chemen pou afiche yon vèsyon tou nèf lè gen chanjman, kenbe ni souplès la ni konfyans nan dosye a."
  },
  {
    "id": "no-read-receipts",
    "title": "Pa gen konfimasyon lekti sou mesaj yo",
    "statement": "Aplikasyon an pa di moun ki voye a ki lè yo li mesaj li a. Ki moun k ap pale ak ki moun — se rezo relasyon sa a modèl menas la pwoteje plis pase tout lòt bagay.",
    "example": "De ti tchèk ble WhatsApp yo te kreye yon presyon pou moun reponn touswit, epi yo te bay moun k ap kontwole mennaj yo yon zouti pou siveye ki lè yo reponn. Retire konfimasyon lekti a retire tout pòt siveyans sa a nèt."
  },
  {
    "id": "no-activity-search",
    "title": "Pa gen chèche manm dapre aktivite",
    "statement": "Ou pa ka chèche “ki moun ki pi aktif” oswa “ki moun ki ede plis”. Mak aktivite yo se done siveyans.",
    "example": "Lè Strava te pibliye yon kat tout aktivite manm li yo mete ansanm, li te devwale san l pa t vle kote baz militè sekrè yo ye. Mak aktivite yon sèl moun di plis toujou — yo montre ki moun k ap òganize, ki lè, ak ki moun."
  },
  {
    "id": "follows-not-blocked",
    "title": "Travay yo “vin apre” — yo pa janm “bare”",
    "statement": "Yon travay k ap tann yon lòt travay annik vin apre l nan liy lan — li pa kole. Jan mo a chwazi a chanje jan moun santi yo devan travay la.",
    "example": "Zouti jesyon pwojè ki make travay “bare” kreye yon dinamik fòt — tankou si gen yon moun k ap “bare” yon lòt moun. “Vin apre” prezante menm depandans lan tankou yon lòd natirèl, epi li retire fwotman an ant moun yo."
  }
];
