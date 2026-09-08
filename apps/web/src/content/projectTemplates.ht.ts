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
import type { ProjectTemplate } from "./projectTemplates";

export const PROJECT_TEMPLATES_HT: readonly ProjectTemplate[] = [
  {
    "id": "community-fridge",
    "name": "Frijidè kominote ak gadmanje gratis",
    "purpose": "Bay manje ak pwovizyon gratis, lajounen kou lannwit, san okenn kesyon.",
    "whoItServes": "Nenpòt moun ki bezwen manje; li itil anpil pou moun k ap travay lè ki pa fiks, vwazen san papye, ak moun ki pa ka rive kote y ap bay manje pandan lè biwo yo.",
    "whatYoullNeed": "Yon frijidè moun bay, yon kote deyò lapli pa mouye ak yon priz kouran, yon kote k ap resevwa l, ak yon ti lis tou pou netwayaj.",
    "setupHours": 18,
    "defaultCategory": "food",
    "firstSteps": "Kòmanse ak kote k ap resevwa a, pa ak frijidè a. Chita ak moun ki gen boutik la, legliz la, oswa klinik ou gen nan tèt ou a, epi pale sou pati ki pa bèl yo — bòdwo kouran an, sa k pase lè yon moun kite salte, ki moun y ap rele lè l pran pàn — anvan ou al chèche yon sèl aparèy. Pandan w la, mande lòt kote k ap bay manje ak gwoup youn ede lòt ki deja ap travay nan zòn nan ki twou yo wè, konsa frijidè a va bouche youn olye li double yo.",
    "commonPitfalls": "Se pa mank manje ki konn touye yon frijidè kominote — se lè netwayaj la pa sou kont pèsonn aklè, frijidè a vin fè lèd, epi kote ki resevwa l la mande tou dousman pou l ale. Mete non moun sou lis tou a anvan jou ouvèti a, epi sonje se relasyon ak kote ki resevwa w la w ap okipe — se pa aparèy la sèlman.",
    "pairsWith": [
      "gleaning-network",
      "food-preservation",
      "community-meal"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Jwenn yon kote ki gen kouran ak moun k ap pase",
        "description": "Al pale ak ti biznis, legliz, klinik, oswa sant kominotè yo. Mande si yo ta kite w mete yon frijidè anba galri yo epi ploge l (kouran an konn koute kèk ti kòb chak mwa — ofri pou peye l). Fè yo ba ou yon ti wi alekri.",
        "hours": 3,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Jwenn yon frijidè epi bati yon ti kay pou li",
        "description": "Mete yon mesaj nan gwoup zòn nan pou mande yon frijidè k ap mache. Bati oswa achte yon ti kabin an bwa pou pwoteje l kont lapli ak solèy. Mare l byen pou l pa ka chavire. Sa gen ladan l jwenn li, transpòte l, ak bati a.",
        "hours": 8,
        "skills": [
          "chapant",
          "kondwi"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Mete règ yo epi make tout bagay",
        "description": "Afiche yon pankat klè nan plizyè lang: pran sa ou bezwen, kite sa ou kapab, pa gen manje ki pase dat, konsèv fèt lakay, ni vyann kri. Mete etikèt ak yon makè pou moun ka mete dat sou sa yo pote.",
        "hours": 1.5,
        "skills": [
          "ekri",
          "tradui"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Monte yon lis tou pou netwayaj ak ranpli",
        "description": "Fè yon orè pataje chak semèn. Chak tou se anviwon 15 minit: siye anndan an, jete sa ki gate oswa ki pase dat, epi note sa k prèt pou fini. Kite pwodui netwayaj sou plas.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "òganize"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Bati relasyon ak moun k ap bay manje",
        "description": "Mande boulanjri, machann manje, restoran, ak mache yo pou ti rès fen jounen an regilyèman. Chwazi yon moun pou al chèche yo. Note ki sous ki serye.",
        "hours": 3,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Mete yon kontak pou pwoblèm",
        "description": "Mete yon sèl nimewo telefòn oswa imèl sou frijidè a pou “frijidè a pran pàn / pa gen kouran / yon kesyon”. Deside ki moun k ap reponn ak nan konbyen tan.",
        "hours": 0.5,
        "skills": []
      }
    ]
  },
  {
    "id": "community-garden",
    "name": "Jaden kominote / teren pou plante ansanm",
    "purpose": "Fè legim fre gratis ansanm epi kreye yon kote pou moun rasanble.",
    "whoItServes": "Vwazen ki pa gen lakou, moun pri manje ap peze, ak nenpòt moun ki vle rankont ak yon rezon pou soti deyò.",
    "whatYoullNeed": "Yon moso tè (menm yon teren vid oswa yon twati), tè ak planch jaden, dlo, semans, ak yon ti nwayo 5–10 moun ki la souvan.",
    "setupHours": 25,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Anvan ou manyen tè a, pale ak de kalite moun: moun ki gen tè a, ak vwazen ki rete kole ak li yo — benediksyon yo konte menm jan ak papye a. Apre sa, rasanble moun ou kwè k ap vini souvan yo epi fè kozri a bonè sou kòman pataj la ap fèt; konnen si se ti jaden pa moun oswa yon sèl rekòt ansanm chanje tout sa w ap bati.",
    "commonPitfalls": "Yon jaden pa konn mouri nan sezon plantasyon — li mouri nan semèn ki pi cho yo, lè lis tou wouze a lage tou dousman epi planch yo vin mawon. Lòt bagay k ap touye l dousman: yon sèl moun ki pran l pou jaden pa l ak ti èd sou kote; ekri kòman desizyon yo pran pandan tout moun renmen youn lòt toujou.",
    "pairsWith": [
      "seed-library",
      "community-composting",
      "food-preservation"
    ],
    "tasks": [
      {
        "name": "Jwenn tè a ak pèmisyon an",
        "description": "Chèche yon teren vid, lakou yon legliz, lakou yon lekòl, oswa yon kwen pak pèsonn pa sèvi. Jwenn ki moun ki gen li (dosye tè lavil la, oswa senpleman mande). Fè yon akò alekri, menm yon antant yon lanne sou papye, epi tcheke gen dlo.",
        "hours": 6,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Teste tè a epi planifye planch yo",
        "description": "Voye yon ti tès tè nan yon laboratwa (sèvis agrikòl zòn nan konn fè l pou piti) pou wè si pa gen plon oswa pwazon. Si tè a pa bon, planifye planch leve ak tè pwòp. Trase kote planch, chemen, ak kwen zouti yo ap ye.",
        "hours": 2,
        "skills": [
          "fè jaden"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Rasanble materyo epi bati",
        "description": "Rasanble planch bwa oswa sèvi ak bal pay, konpòs, ak pay kouvèti. Fè yon konbit bati; men anpil, chay pa lou — planch yo leve vit. Mete yon awozwa oswa doum dlo lapli.",
        "hours": 10,
        "skills": [
          "chapant"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Deside kòman pataj la ap fèt",
        "description": "Mete tout moun dakò: ti jaden pa moun, yon sèl rekòt pou tout moun, oswa yon melanj. Ekri kòman legim yo ap separe ak kòman desizyon yo pran.",
        "hours": 1,
        "skills": [
          "mennen reyinyon"
        ]
      },
      {
        "name": "Plante selon klima ak sezon ou",
        "description": "Chwazi kilti fasil ki bay anpil pou zòn ou an (fèy legim, pwa, joumou, tomat, fèy epis). Plante yo an etap pou tout rekòt yo pa tonbe ansanm. Make chak ranje.",
        "hours": 4,
        "recurringCadence": "cycle",
        "skills": [
          "fè jaden"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Mete yon lis tou pou wouze ak sekle",
        "description": "Se neglijans ki touye plant plis pase tout lòt bagay. Fè yon kalandriye pataje senp; mare chak tou ak yon ti rapèl. Kenbe l lejè pou moun pa bouke.",
        "hours": 1,
        "skills": [
          "òganize"
        ],
        "follows": [
          4
        ]
      },
      {
        "name": "Planifye rekòt la ak sa ki anplis",
        "description": "Deside jou rekòt yo. Voye legim anplis yo bay frijidè kominote a, vwazen yo, oswa yon ti tab gratis devan baryè a. Sere kèk semans pou lanne pwochèn.",
        "hours": 1,
        "recurringCadence": "cycle",
        "follows": [
          4
        ],
        "skills": []
      }
    ]
  },
  {
    "id": "tool-lending-library",
    "name": "Bibliyotèk zouti ak ekipman",
    "purpose": "Pou vwazen ka pran zouti ak ekipman sèvi epi pote yo tounen olye yo achte, pou ekonomize lajan ak diminye gaspiyaj.",
    "whoItServes": "Moun k ap lwe kay, moun ki fèk gen kay, moun ki gen ti pwojè, ak nenpòt moun k ap fè reparasyon tanzantan.",
    "whatYoullNeed": "Yon kote pou sere yo, zouti moun bay, yon fason senp pou make sa ki soti, ak de twa “bibliyotekè”.",
    "setupHours": 20,
    "defaultCategory": "infrastructure",
    "firstSteps": "Anvan ou kolekte yon sèl dril, pale ak moun k ap ofri espas la sou sa viv ak yon bibliyotèk zouti vle di vre — bri, bagay k ap anpile, moun li pa konnen nan pòt la pandan lè ouvèti yo. Apre sa, mande vwazen yo ki zouti yo ta vin pran vre; yon lis dis zouti moun mande pi bon pase yon garaj plen zouti pèsonn pa vle.",
    "commonPitfalls": "Bibliyotèk zouti mouri nan silans ki vin apre dat retou a: pèsonn pa voye yon ti rapèl, zouti yo rete nan men moun pou tout tan, epi etajè yo vin vid. Yon ti abitid rapèl ak zanmitay konte plis pase yon règ reta sevè — epi aprann di non lè moun pote bagay, sinon w ap tounen kote tout vye zouti kraze katye a vin mouri.",
    "pairsWith": [
      "library-of-things",
      "repair-cafe",
      "weatherization-brigade"
    ],
    "learnMore": [
      "confirm-exchange"
    ],
    "tasks": [
      {
        "name": "Jwenn kote pou sere yo ak lè ouvèti",
        "description": "Yon ti kay zouti, yon garaj, yon amwa nan yon sant kominotè, oswa yon kontenè ka fè l. Chwazi 2–4 lè ouvèti fiks pa semèn pou moun konnen ki lè pou yo vini.",
        "hours": 3,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Kolekte epi triye zouti yo",
        "description": "Mete yon mesaj pou mande zouti (moun gen dril ak nechèl an doub toupatou). Netwaye, teste, epi make chak zouti. Jete oswa repare sa ki pa an sekirite.",
        "hours": 6,
        "skills": [
          "kondwi"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Fè yon katalòg pou tout bagay",
        "description": "Sèvi ak yon fèy kalkil gratis oswa yon aplikasyon pou swiv zouti. Ekri chak atik, eta li, ak yon foto. Bay chak zouti yon nimewo pou yo fasil pou swiv.",
        "hours": 4,
        "skills": [
          "antre done"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Ekri règ pou pran zouti",
        "description": "Fikse konbyen tan yon moun ka kenbe yon zouti (pa egzanp yon semèn), konbyen atik alafwa, ak sa k pase lè yon zouti an reta. Kenbe l dous — se konfyans k ap bati la a. Note ki zouti ki mande yon ti esplikasyon sekirite.",
        "hours": 1,
        "skills": [
          "ekri"
        ]
      },
      {
        "name": "Monte fèy soti a",
        "description": "Yon planchèt ak yon fèy senp: non, kontak, atik, dat soti, dat retou. Pran yon ti foto eta zouti a lè l ap soti pou evite dezakò.",
        "hours": 2,
        "skills": [
          "antre done"
        ],
        "follows": [
          2,
          3
        ]
      },
      {
        "name": "Montre bibliyotekè yo travay la",
        "description": "Pase ak moun k ap ede yo sou katalòg la, etap soti yo, ak sekirite debaz (linèt pwoteksyon, jan pou sèvi ak nechèl). Kite yon fèy rezime yon sèl paj sou tab la.",
        "hours": 2,
        "skills": [
          "montre moun"
        ],
        "follows": [
          4
        ]
      },
      {
        "name": "Okipe zouti yo epi fè koleksyon an grandi",
        "description": "Enspekte zouti ki tounen yo, file ak grese yo regilyèman, epi swiv sa moun mande plis pou konnen sa pou ajoute apre.",
        "hours": 2,
        "skills": [
          "repare zouti"
        ],
        "recurringCadence": "session"
      }
    ]
  },
  {
    "id": "neighborhood-care-network",
    "name": "Rezo pou okipe vwazen",
    "purpose": "Fè sèten vwazen ki izole yo jwenn moun ki pase wè yo, ki konekte yo, epi ki ede yo.",
    "whoItServes": "Granmoun aje, vwazen ki gen andikap oswa maladi kwonik, nouvo paran, ak nenpòt moun k ap viv pou kont li.",
    "whatYoullNeed": "Yon lis moun ki vle ede, yon fason pou matche yo ak vwazen yo, ak yon abitid pase wè. Moun k ap ede yo se vwazen, se pa pwofesyonèl swen — tcheke referans nenpòt moun k ap fè vizit lakay, pa janm kite yon sèl moun okipe lajan yon vwazen pou kont li, epi deside davans ki lè pou rele fanmi oswa anbilans.",
    "setupHours": 18,
    "defaultCategory": "emotional_support",
    "firstSteps": "Kòmanse ak koute, pa ak chèche moun pou ede: pale ak vwazen ou ta renmen ede yo sou sa yo vle vre — yon apèl chak semèn, yon woulib, yon ti konpayi — paske yon rezo ki bati sou sipozisyon santi tankou siveyans. An menm tan, fè kozri onèt la ak premye moun ki vle ede yo sou referans ak limit, pou règ yo santi tankou swen, pa tankou sispèk, lè premye matche a fèt.",
    "commonPitfalls": "Rezo swen yo pa konn manke moun — yo fin boule twa moun ki toujou di wi yo pandan tout lòt yo ap tann yo mande yo. Gaye matche yo espre, kenbe ti rankont pou moun k ap ede yo menm lè tout bagay sanble byen, epi pa kite pase wè yo tounen trete yon vwazen tankou yon dosye olye yon moun.",
    "pairsWith": [
      "rides-transportation",
      "disability-support-network",
      "welcome-wagon"
    ],
    "learnMore": [
      "message-someone"
    ],
    "tasks": [
      {
        "name": "Chèche konnen ki moun ki la",
        "description": "Chèche konnen tou dousman ki vwazen ki ka izole: bouch an bouch, jeran bilding, klinik, ak gwoup legliz yo. Pa janm sipoze bezwen — envite moun antre, pa lonje dwèt sou yo.",
        "hours": 4,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Chèche moun ki vle ede epi tcheke referans yo",
        "description": "Mande moun ki ka kenbe yon kontak regilye. Pou nenpòt vizit lakay oswa èd ak granmoun frajil, fè yon ti tcheke referans, epi pa janm kite yon sèl moun okipe lajan yon vwazen pou kont li.",
        "hours": 5,
        "skills": [
          "pale ak moun",
          "fè entèvyou"
        ]
      },
      {
        "name": "Matche ak refleksyon",
        "description": "Mete moun ansanm selon lang, distans, ak sa ki fè yo alèz. Mande tou de moun yo sa yo vle — yon apèl chak semèn, fè makèt, yon ti chita pale sou galri a — epi respekte limit sa a.",
        "hours": 2,
        "skills": [
          "òganize"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Fikse yon ritm pase wè",
        "description": "Chwazi ansanm frekans lan ak fason an (apèl, mesaj, frape pòt). Bay moun k ap ede a de twa fraz tou pare pou premye kontak la, pou li santi cho, pa tankou lopital.",
        "hours": 1,
        "follows": [
          2
        ],
        "skills": []
      },
      {
        "name": "Fè yon plan si bagay yo grav",
        "description": "Deside davans sa pou fè si yon moun pa reponn oswa sanble an kriz: ki moun pou rele, ki lè pou fè fanmi oswa anbilans antre, ak kòman pou note l. Kenbe l alekri epi senp.",
        "hours": 2,
        "skills": [
          "ekri"
        ]
      },
      {
        "name": "Kowòdone èd pratik yo",
        "description": "Swiv bezwen k ap tounen yo — woulib pou randevou, chèche medikaman, ti travay nan lakou — epi konekte yo ak lòt moun k ap ede oswa lòt pwojè nan kominote a.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "òganize"
        ]
      },
      {
        "name": "Pran swen moun k ap ede yo tou",
        "description": "Fè yon ti rankont pou yo ka lage sa ki sou kè yo. Travay swen fatigan; chanje men sou travay yo tanzantan epi veye pou moun pa bouke nèt.",
        "hours": 2,
        "skills": [
          "mennen reyinyon"
        ],
        "recurringCadence": "month"
      }
    ]
  },
  {
    "id": "emergency-preparedness",
    "name": "Rezo pou pare pou dezas",
    "purpose": "Ede katye a pare epi reponn lè dezas frape (gwo chalè, tanpèt, inondasyon, pàn kouran) lè èd ofisyèl la ap mize.",
    "whoItServes": "Tout moun, ak priyorite pou moun ki pa ka kite zòn nan fasil lè gen danje, oswa ki depann de kouran pou aparèy medikal.",
    "whatYoullNeed": "Yon lis kontak, yon pwen rankont, kèk pwovizyon debaz, ak yon plan kominikasyon ki mache san entènèt. Rezo sa a mache bò kote sèvis ofisyèl yo — li pa ranplase yo. Si lavi yon moun an danje, rele anbilans oswa ponpye an premye.",
    "setupHours": 30,
    "defaultCategory": "organizing",
    "firstSteps": "Bati plan an sou moun li fèt pou yo: frape pòt vwazen ki sou oksijèn, ki gen medikaman nan frijidè, oswa ki rete anlè san asansè, epi mande yo sa yon move semèn ye pou yo. Apre sa, pale ak moun ki kontwole kote moun ta ale a, ak nenpòt gwoup ki deja ap prepare (ekip ponpye yo, gwoup vil la) pou rezo w la bouche twou ki toutotou repons ofisyèl la olye li double li.",
    "commonPitfalls": "Rezo sa yo pa konn echwe pandan dezas la — yo echwe nan ane trankil anvan yo, lè pyebwa kontak la vin vye, nimewo telefòn chanje, epi plan an ap viv sou laptòp yon sèl moun. Enprime tout bagay, refrechi lis la sou yon ritm kalandriye, epi fè omwen yon egzèsis: premye jou plan an sèvi pa fèt pou jou dezas la.",
    "pairsWith": [
      "cooling-warming-center",
      "community-first-aid-training",
      "community-wifi-mesh"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Fè kat risk katye a",
        "description": "Fè lis dezas ki pi posib kote ou ye a. Note pwen frajil yo: moun anlè san asansè, moun sou oksijèn oswa medikaman frijidè, kay ki gen yon sèl sòti.",
        "hours": 4,
        "skills": []
      },
      {
        "name": "Bati yon pyebwa kontak",
        "description": "Kolekte kontak blòk pa blòk, ak akò chak moun. Chwazi kèk “vwazen blòk” — chak youn ap swiv anviwon 10 kay. Kenbe yon kopi papye — telefòn ak entènèt tonbe lè dezas.",
        "hours": 8,
        "skills": [
          "pale ak moun",
          "antre done"
        ]
      },
      {
        "name": "Planifye kominikasyon san rezo",
        "description": "Deside kòman youn ap jwenn lòt san siyal telefòn: frape pòt, yon pwen rankont, souflèt, oswa radyo. Enprime plan an epi pote l bay chak kay.",
        "hours": 3,
        "skills": [
          "ekri"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Fè rezèv pwovizyon ansanm",
        "description": "Monte yon kit kominote: dlo, premye swen, flach, pil, yon radyo pil oswa manivèl, lenn, ak zouti debaz. Sere l yon kote de twa moun ka jwenn li.",
        "hours": 5,
        "skills": [
          "kondwi"
        ]
      },
      {
        "name": "Jwenn kote ki an sekirite yo",
        "description": "Chèche kote ki ta ka sèvi pou moun vin pran fre lè gwo chalè, chofe lè gwo fredi, oswa chaje telefòn (yon sal ak dèlko, yon pak ak lonbraj). Konfime aksè a davans.",
        "hours": 3,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Fè yon egzèsis oswa yon sware enfòmasyon",
        "description": "Fè yon sesyon sou sak pare chak kay, kote pou fèmen gaz ak dlo, ak pyebwa kontak la. Pratike yon fwa pou moun pa aprann pandan vre dezas la.",
        "hours": 5,
        "skills": [
          "montre moun",
          "mennen reyinyon"
        ],
        "follows": [
          1,
          2
        ]
      },
      {
        "name": "Defini wòl pou “jou a”",
        "description": "Deside davans ki moun ki tcheke moun frajil yo an premye, ki moun ki louvri kote ki an sekirite a, ak ki moun k ap kowòdone. Revize epi mete plan an ajou de fwa pa ane.",
        "hours": 2,
        "skills": [
          "òganize"
        ],
        "follows": [
          4
        ]
      }
    ]
  },
  {
    "id": "free-store",
    "name": "Magazen gratis / echanj bagay",
    "purpose": "Fè rad, bagay kay, ak pwovizyon jwenn moun gratis.",
    "whoItServes": "Tout moun — moun ki nan yon moman difisil, moun k ap fè espas lakay yo, ak planèt la.",
    "whatYoullNeed": "Yon espas (menm pou yon sèl jou), tab oswa etajè, moun pou triye, ak yon orè regilye.",
    "setupHours": 10,
    "defaultCategory": "mutual_aid_drive",
    "suggestsWorkDays": true,
    "firstSteps": "Pale anvan ak moun k ap resevwa espas la sou reyalite onèt yo — pil bagay moun pote, alevini, ak jan sal la ye nan maten apre a — epi apre sa ak yon boutik dezyèm men tou pre sou sa ki deja ap rive an kantite, pou ou konnen sa katye w la manke vre. Si ou kapab, pase yon ti tan nan yon magazen gratis ki deja egziste anvan premye jou pa w la; jan bagay antre ak jan yo poze pi fasil pou kopye pase pou envante.",
    "commonPitfalls": "Magazen gratis yo neye anvan yo grangou: san yon lis wi/non fèm nan pòt la, moun yo pase tout tan ap triye bagay kraze ak rad sal olye yo akeyi moun. Epi deside kote rès yo prale anvan premye jou a fini — yon pil bagay pèsonn pa pran, san plan sòti, se konsa espas yo pèdi.",
    "pairsWith": [
      "repair-cafe",
      "library-of-things",
      "mutual-aid-moving-crew"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Chwazi yon fòma ak yon espas",
        "description": "Deside ant yon magazen fiks, yon randevou k ap tounen, oswa yon echanj yon sèl jou. Mande yon sal, yon lokal, oswa yon tonèl pak. Yon dat regilye bati abitid.",
        "hours": 2,
        "skills": []
      },
      {
        "name": "Fikse règ pou sa moun pote",
        "description": "Aksepte sèlman bagay pwòp, k ap mache, moun ka sèvi. Afiche yon lis “wi” ak “non” klè (pa gen elektwonik kraze, pa gen rad sal, pa gen materyèl tibebe yo rele tounen). Sa sove anpil tan triyaj.",
        "hours": 0.5,
        "skills": [
          "ekri"
        ]
      },
      {
        "name": "Òganize resepsyon ak triyaj",
        "description": "Monte estasyon: resevwa, triye pa kategori, prepare pou etalaj. Fè yon plan pou bagay ou pa ka sèvi (voye yo yon lòt kote oswa resikle).",
        "hours": 2,
        "skills": [
          "òganize"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Etale pou moun ka gade ak diyite",
        "description": "Pann rad pa gwosè, gwoupe bagay kay, kenbe l pwòp epi akeyan. Pa gen papye pou ranpli, pa gen prèv bezwen — annik pran sa w ap sèvi.",
        "hours": 1.5,
        "skills": [
          "desen"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Mete moun nan jou a",
        "description": "Bay wòl: moun k ap akeyi, moun k ap triye, ak yon moun pou kesyon. Yon ton zanmi, san jijman, se tout sans pwojè a.",
        "hours": 3,
        "skills": [
          "òganize"
        ],
        "recurringCadence": "event"
      },
      {
        "name": "Okipe rès yo",
        "description": "Ranje davans kote bagay pèsonn pa pran yo prale apre chak jou (yon lòt òganizasyon ki resevwa yo, resiklaj twal) pou espas la tounen pwòp.",
        "hours": 1,
        "skills": [
          "kondwi"
        ]
      }
    ]
  },
  {
    "id": "skill-share",
    "name": "Youn montre lòt / leson gratis",
    "purpose": "Pou vwazen montre youn lòt epi aprann youn nan men lòt gratis — fè manje, reparasyon, lang, jere ti kòb, premye swen, sèvi ak telefòn ak òdinatè.",
    "whoItServes": "Tout moun; sitou moun ki pa ka peye leson, ak moun konesans yo raman jwenn valè.",
    "whatYoullNeed": "Yon espas, moun ki vle montre, ak yon fason pou pibliye yon orè.",
    "setupHours": 9,
    "defaultCategory": "education",
    "firstSteps": "Pwojè a kòmanse ak kozri de kesyon yo, pa ak lokal la: mande moun sa yo ta ka montre ak sa yo ta renmen aprann, epi bay yon atansyon espesyal a vwazen konesans yo raman trete tankou konesans. Premye vre travay ou, se rasire yon moun ki ta ka montre men ki gen kè sote, devan yon kafe, pou li konnen sesyon li a pa bezwen yon konferans.",
    "commonPitfalls": "Pataj konesans yo fennen lè se menm de moun ki gen konfyans yo ki fini montre tout bagay, epi orè a pliye tou dousman sou aswè lib moun k ap òganize yo olye sou pa moun k ap vini yo. Kontinye chèche moun k ap montre pou premye fwa, mande ki moun ki manke nan sal la, epi konsidere yon sesyon senk moun kòm yon siksè, paske se sa li ye.",
    "pairsWith": [
      "time-bank",
      "digital-literacy",
      "repair-cafe"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Mande sa moun konn fè ak sa yo vle aprann",
        "description": "Poze manm yo de kesyon: ki sa ou ta ka montre, ak ki sa ou ta renmen aprann? Mete repons yo nan yon fèy senp. Kote yo kwaze a, se la premye leson yo ye.",
        "hours": 1.5,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Chèche moun pou montre epi prepare yo",
        "description": "Rasire moun yo: “montre” ka rete tou senp. Ede yo trase yon ti sesyon epi rasanble materyèl yo. Mete yon moun bò kote premye fwa ki gen kè sote yo.",
        "hours": 3,
        "skills": [
          "montre moun",
          "mennen reyinyon"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Jwenn espas ak lè",
        "description": "Sèvi ak yon sal bibliyotèk, yon sant kominotè, yon pak, oswa salon yon moun. Chwazi plaj fiks k ap tounen pou sa vin abitid.",
        "hours": 1.5,
        "skills": []
      },
      {
        "name": "Bati yon orè",
        "description": "Fè lis sesyon yo ak dat, sijè, moun k ap montre a, ak sa pou pote. Pibliye l kote manm yo deja ap gade. Kite antre a lejè: yon ti wi davans oswa vin jan w vini an.",
        "hours": 1.5,
        "recurringCadence": "month",
        "skills": [
          "òganize"
        ],
        "follows": [
          1,
          2
        ]
      },
      {
        "name": "Fè l louvri pou tout moun",
        "description": "Panse ak bezwen lang, gade timoun, aksè fizik, ak lè ki bon pou moun k ap travay. Mande moun k ap vini yo sa ki ta ede yo vini.",
        "hours": 1.5,
        "skills": [
          "aksesibilite",
          "tradui"
        ]
      }
    ]
  },
  {
    "id": "bulk-buying-coop",
    "name": "Koperativ pou achte manje an gwo",
    "purpose": "Mete kòmand ansanm pou achte manje ak pwovizyon an gwo a pi bon pri.",
    "whoItServes": "Fanmi pri makèt ap toufe, gwo fanmi, ak katye kote manje fre difisil pou jwenn.",
    "whatYoullNeed": "Yon gwoup fanmi angaje, yon machann an gwo, yon kote pou resevwa ak separe, ak yon moun pou okipe kòmand yo.",
    "setupHours": 20,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Rasanble fanmi ou yo anvan ou rele okenn machann, epi fè kozri jennen sou lajan an anvan: sa chak fanmi ka pran angajman pou li, kòman lajan an rantre anvan kòmand la pati, ak sa sa vle di lè yon fanmi rate yon kòmand. Yon ti apèl ak yon gwoup acha ki deja egziste — pifò kontan pataje fèy kalkil yo ak mak yo — ap sove w yon sezon esè ak erè.",
    "commonPitfalls": "Koperativ acha yo mouri nan fwotman lajan ak fatig: yon moun mete lajan pa l devan epi kè l fè l mal, yon kòmand rete san peye, oswa yon sèl moun pote chak kòmand an silans jiskaske li kite epi tout bagay kanpe. Kolekte lajan an anvan kòmand la, san eksepsyon, epi fè travay kowòdinasyon an chanje men depi dezyèm kòmand la, pa yon jou konsa.",
    "pairsWith": [
      "community-market",
      "food-preservation"
    ],
    "tasks": [
      {
        "name": "Rasanble gwoup acha a",
        "description": "Chèche ase fanmi pou rive nan minimòm machann yo (souvan 8–15). Chwazi yon ritm kòmand (chak semèn, chak kenzèn, chak mwa).",
        "hours": 4,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Jwenn yon machann an gwo",
        "description": "Kontakte machann manje an gwo, koperativ agrikòl, founisè restoran, oswa lòt gwoup acha. Konpare kòmand minimòm, livrezon, ak pri. Tcheke ki pwovizyon debaz yo genyen.",
        "hours": 4,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Monte sistèm kòmand la",
        "description": "Sèvi ak yon fèy kalkil pataje kote chak fanmi mete kantite yo anvan dat limit la. Chwazi yon sèl moun pou fè total la epi pase kòmand la.",
        "hours": 3,
        "skills": [
          "antre done",
          "òganize"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Jere lajan an aklè",
        "description": "Deside kòman peman fèt davans (kolekte anvan kòmand la, pou pèsonn pa mete lajan pa l devan). Ekri chak lajan ki antre nan yon kaye tout gwoup la ka wè. Mete yon ti majinal si moun vle, pou ti pèt, pa pou pwofi.",
        "hours": 2,
        "skills": [
          "kontablite"
        ]
      },
      {
        "name": "Ranje livrezon ak yon kote pou separe",
        "description": "Chwazi yon kote pou resevwa livrezon an gwo a — yon garaj, yon sal, yon lakou. Fè sèten gen ase men pou jou dechajman an.",
        "hours": 3,
        "skills": [
          "òganize"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Separe kòmand yo san patipri",
        "description": "Monte estasyon triyaj ak pèz pou grenn ak legim an gwo. Enprime lis chak fanmi davans. Tcheke de fwa anvan moun vin pran.",
        "hours": 3,
        "skills": [
          "òganize"
        ],
        "follows": [
          2,
          4
        ],
        "recurringCadence": "cycle"
      },
      {
        "name": "Fè travay la chanje men",
        "description": "Kowòdinasyon, triyaj, ak jou pran yo fèt pou chanje men, pou yon sèl moun pa pote tout chay la. Revize pri ak seryozite machann lan apre chak kòmand.",
        "hours": 1,
        "recurringCadence": "cycle",
        "skills": []
      }
    ]
  },
  {
    "id": "repair-cafe",
    "name": "Kafe reparasyon",
    "purpose": "Repare bagay ki kraze — rad, aparèy elektwonik, bisiklèt, mèb — gratis, olye yo al nan fatra.",
    "whoItServes": "Nenpòt moun ki gen yon bagay ki kraze san lajan ni konesans pou repare l; li kenbe bon bagay pou yo pa tounen fatra.",
    "whatYoullNeed": "Vwazen ki konn repare, zouti debaz, yon kote ki gen tab ak kouran, ak yon dat fiks ki tounen regilyèman.",
    "setupHours": 14,
    "defaultCategory": "skilled_labor",
    "suggestsWorkDays": true,
    "firstSteps": "Anvan tout lòt bagay, chèche de oswa twa premye moun ki konn repare — vwazen ki konn koud la, moun ki toujou ap ranje bisiklèt la — paske yon dat ak yon lokal pa vo anyen san yo. Apre sa, mache nan espas la ansanm ak yo, pale sou tab, kouran, ak limyè; epi si gen yon kafe reparasyon nan yon vil toupre, ale wè yon seyans: fason yo resevwa vizitè ak bagay yo, se sou li pou ou pran modèl.",
    "commonPitfalls": "San bri, kafe reparasyon ka tounen yon boutik reparasyon gratis: vizitè yo depoze bagay yo epi y ale, moun k ap repare yo tounen teknisyen san salè, epi sèl moun ki konn elektwonik la bouke anvan tout lòt. Kenbe prensip la: mèt bagay la rete bò kote reparasyon an; epi afiche klè gen bagay ki pa ka sove — desepsyon ou regle davans pi fasil pase repwòch apre.",
    "pairsWith": [
      "tool-lending-library",
      "community-bike-workshop",
      "free-store"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Chèche moun ki konn repare selon domèn",
        "description": "Jwenn moun ki bon nan kouti, ti aparèy elektwonik, bisiklèt, aparèy kay, ak travay bwa. Yon oswa de moun pou chak domèn ase pou kòmanse.",
        "hours": 4,
        "skills": [
          "repare",
          "elektwonik",
          "kouti"
        ]
      },
      {
        "name": "Monte estasyon reparasyon yo",
        "description": "Chak estasyon bezwen yon tab, bon zouti, bon limyè, ak kouran. Mete reparasyon ki sanble yo ansanm. Make chak estasyon klè.",
        "hours": 3,
        "recurringCadence": "session",
        "skills": [
          "òganize"
        ]
      },
      {
        "name": "Chwazi yon dat fiks",
        "description": "Yon fwa pa mwa mache byen. Chwazi yon kote ki pa chanje — bibliyotèk, atelye pataje, sal kominote a — pou moun konnen ki kote pou yo pote bagay yo.",
        "hours": 1,
        "skills": []
      },
      {
        "name": "Òganize fason moun antre",
        "description": "Yon moun akeyi chak vizitè, ekri non l ak bagay li pote a, epi voye l bay bon moun nan. Fè sa klè: vizitè rete pou ede nan pwòp reparasyon yo lè yo kapab; se yon kote pou aprann, se pa yon depo.",
        "hours": 2,
        "skills": [
          "ekri"
        ]
      },
      {
        "name": "Veye sekirite ak sa moun ap tann",
        "description": "Afiche klè: gen bagay ki pa ka sove, e se eseye y ap eseye — pèsonn pa pwomèt rezilta. Mete bon abitid sekirite pou aparèy kouran ak batri. Kenbe yon twous premye swen tou pre.",
        "hours": 2,
        "skills": []
      },
      {
        "name": "Fè rezèv pyès ak materyèl",
        "description": "Toujou gen fil, fizib, lakòl, vis, chanm bisiklèt, ak patch nan men ou. Make sa ki sèvi pou ou ka ranplase yo.",
        "hours": 2,
        "recurringCadence": "session",
        "follows": [
          0
        ],
        "skills": []
      }
    ]
  },
  {
    "id": "rides-transportation",
    "name": "Woulib ak transpò",
    "purpose": "Mennen vwazen nan randevou doktè, nan mache, ak nan komisyon enpòtan lè transpò ak lajan se baryè.",
    "whoItServes": "Moun ki pa gen machin, vwazen ki gen andikap, granmoun aje, ak tout moun ki nan yon zòn transpò pa rive.",
    "whatYoullNeed": "Chofè ki vle ede, yon fason klè pou resevwa demann epi voye yo bay chofè, ak règ debaz sou sekirite ak asirans. Kondwi vwazen se yon gwo responsablite — tcheke lisans ak asirans chak chofè, byen tcheke nenpòt moun k ap kondwi moun ki fraji, epi lè gen yon gwo pwoblèm sante ki prese, se anbilans pou rele — pa janm ranplase l ak yon woulib.",
    "setupHours": 18,
    "defaultCategory": "transport",
    "firstSteps": "De seri konvèsasyon dwe fèt anvan premye woulib la: chita ak chak moun ki vle kondwi pou tcheke lisans ak asirans epi pale onètman sou tcheke moun; epi pale ak moun ki bezwen woulib yo — ansanm ak kote granmoun yo rasanble ak klinik ki konnen yo — sou vrè destinasyon, lè, ak bezwen deplasman yo. Konvèsasyon tcheke a pi fasil kòm yon abitid depi nan kòmansman pase kòm yon règ ou vin enpoze pita.",
    "commonPitfalls": "Se pa kondwi a ki kraze rezo woulib yo, se jan demann yo regle: tout demann tonbe sou telefòn yon sèl moun jouk moun sa a bouke nèt, epi se menm de chofè serye yo ki jwenn tout demann pandan lòt yo pa janm rele ankò apre yon sèl non. Fè wòl moun k ap regle demann yo pase de men an men, gaye demann yo espre, epi pa janm kite kesyon asirans lan tann jouk apre premye ti aksidan an.",
    "pairsWith": [
      "health-navigation",
      "community-bike-workshop",
      "court-support"
    ],
    "learnMore": [
      "claim-post"
    ],
    "tasks": [
      {
        "name": "Chèche chofè epi tcheke yo",
        "description": "Tcheke chak chofè gen yon lisans valab, asirans, ak yon machin ki an bon eta. Pou woulib ak moun ki fraji, tcheke referans oswa dosye dapre abitid zòn ou.",
        "hours": 5,
        "skills": [
          "kondwi"
        ]
      },
      {
        "name": "Regle asirans ak responsablite",
        "description": "Tcheke sa asirans pèsonèl chak chofè kouvri lè l ap kondwi pou ede moun. Panse ak yon papye dakò senp epi mande yon klinik èd legal nan zòn nan konsèy — sa pwoteje tout moun.",
        "hours": 4,
        "skills": [
          "papye"
        ]
      },
      {
        "name": "Mete yon sistèm demann",
        "description": "Chwazi yon sèl kanal pou demann woulib (yon nimewo telefòn, yon fèy, yon chat gwoup) ak yon delè davans (pa egzanp de jou). Note lè pou pran moun nan, kote yo, bezwen deplasman, ak kontak yo.",
        "hours": 2,
        "skills": [
          "òganize",
          "teknoloji"
        ]
      },
      {
        "name": "Bati yon woutin pou voye chofè",
        "description": "Yon sèl moun (wòl la ap pase de men an men) matche demann yo ak chofè ki disponib epi konfime ak chofè a ak pasaje a lavèy. Kenbe yon lis chofè rezèv pou ka anilasyon.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "òganize"
        ],
        "follows": [
          0,
          2
        ]
      },
      {
        "name": "Di klè ki vwayaj ki ladan",
        "description": "Deside ki vwayaj ki ladan (doktè, mache, komisyon enpòtan) ak zòn ou kouvri a. Di klè konbyen tan chofè ka tann ak si yo ede pote sak.",
        "hours": 1,
        "skills": [
          "mennen reyinyon"
        ]
      },
      {
        "name": "Regle kesyon depans yo",
        "description": "Deside ki jan gaz la ap peye — yon ti lajan an komen, yon ti kòb pasaje bay si yo vle, oswa anyen. Kenbe sa klè devan tout moun epi pa janm kite l tounen yon baryè pou pasaje a.",
        "hours": 2,
        "follows": [
          4
        ],
        "skills": []
      },
      {
        "name": "Pwoteje pasaje ak chofè",
        "description": "Mete abitid klè: chofè pa antre lakay moun poukont yo, okenn lajan pase sa ki te dakò a, epi yon ti rele apre woulib ak moun ki fraji. Ekri chak woulib nan yon kaye.",
        "hours": 2,
        "follows": [
          0
        ],
        "skills": []
      }
    ]
  },
  {
    "id": "tenant-union",
    "name": "Sendika lokatè ak defans kont degèpisman",
    "purpose": "Òganize lokatè yo pou defann tèt yo, ak fòs tèt ansanm, kont degèpisman, kay ki pa an sekirite, ak ogmantasyon lwaye ki pa jis.",
    "whoItServes": "Lokatè, sitou nan kay kote mèt kay yo neglijan oswa yo pa janm la, ak nenpòt moun k ap fè fas ak degèpisman.",
    "whatYoullNeed": "Yon ti nwayo moun k ap òganize, bon enfòmasyon sou dwa lokatè nan zòn nan, yon lyen ak èd legal, ak yon sistèm kontak ki rapid. Pwojè sa a kanpe ak lokatè yo epi li pataje enfòmasyon legal piblik; li pa ranplase konsèy yon avoka. Toujou voye ka chak moun bay èd legal kalifye anvan dat limit yo.",
    "setupHours": 30,
    "defaultCategory": "housing",
    "firstSteps": "Pale ak lokatè ki konsène yo anvan okenn kontak ak yon mèt kay, tout tan — frape pòt, koute sa moun yo pè ak sa yo vle toutbon, epi kite lokatè chak kay deside vitès la, paske se yo ki pote risk reprezay la, se pa moun k ap òganize yo. An menm tan, al prezante tèt ou bonè nan klinik èd legal zòn nan; w ap bezwen relasyon sa a anvan premye avi degèpisman an rive, pa apre.",
    "commonPitfalls": "Kote sendika lokatè fè moun mal, se lè yo mache pi vit pase lokatè yo menm: yon konfwontasyon ki lanse anvan yon kay pare ekspoze vwazen ki pi fraji yo a reprezay yo pa t chwazi. Echèk ki pi silansye a se glise nan bay konsèy legal olye enfòmasyon legal — voye ka chak moun bay èd legal kalifye anvan dat limit yo, chak fwa.",
    "pairsWith": [
      "legal-aid-clinic",
      "mutual-aid-moving-crew",
      "solidarity-fund"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Fòme yon ti nwayo k ap òganize",
        "description": "Jwenn 3–6 lokatè angaje pou kenbe travay la. Chèche moun tout kay la respekte yo. Mete dakò sou wòl yo, yon ritm reyinyon, ak sa tout moun vle rive fè ansanm.",
        "hours": 5,
        "skills": [
          "òganize"
        ]
      },
      {
        "name": "Fè kat kay yo ak pwoblèm yo",
        "description": "Frape pòt oswa poze kesyon pou konnen ki kay ki gen pwoblèm ak kilès (reparasyon yo iyore, frè ilegal, moun y ap anmède). Swiv sa k ap repete yo epi jwenn moun moun yo koute nan chak kay.",
        "hours": 8,
        "skills": [
          "pale ak moun",
          "fè entèvyou"
        ]
      },
      {
        "name": "Rasanble bon enfòmasyon sou dwa lokatè",
        "description": "Mete ansanm vrè lwa zòn ou sou delè avi degèpisman, reparasyon, lajan depo, ak règ lwaye. Mande yon klinik èd legal tcheke l. Sa se enfòmasyon pataje, se pa konsèy legal — fè manm yo konnen sa klè.",
        "hours": 4,
        "skills": [
          "papye",
          "ekri"
        ]
      },
      {
        "name": "Bati yon sistèm kontak rapid",
        "description": "Mete yon chenn telefòn oswa yon chat gwoup pou yon lokatè ki resevwa avi degèpisman oswa ki jwenn pòt li fèmen ka jwenn sendika a vit. Deside kilès ki reponn ak nan konbyen tan.",
        "hours": 3,
        "skills": [
          "òganize",
          "èd teknik"
        ]
      },
      {
        "name": "Fè yon atelye konn dwa ou",
        "description": "Fè yon seyans (pi bon si yon moun èd legal la) k ap pase sou dwa lokatè yo ak sa pou yo fè si yo resevwa papye tribinal. Bay ti gid enprime pou moun pote lakay yo, nan lang moun yo pale.",
        "hours": 4,
        "recurringCadence": "event",
        "skills": [
          "montre moun",
          "mennen reyinyon"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Ekri plan repons pou degèpisman",
        "description": "Ekri yon plan senp, etap pa etap, pou lè yon moun ap fè fas ak degèpisman: note tout bagay, rele èd legal anvan dat limit la, rasanble vwazen bò kote l, epi pa janm neglije yon dat tribinal.",
        "hours": 3,
        "skills": [
          "ekri"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Kenbe lyen ak èd legal",
        "description": "Bati relasyon ak avoka lokatè, èd legal, ak konseye lojman, pou sendika a ka pase ka ki bezwen yon pwofesyonèl bay yo. Kenbe kontak yo ajou.",
        "hours": 3,
        "skills": [
          "pale ak moun"
        ]
      }
    ]
  },
  {
    "id": "childcare-collective",
    "name": "Kolektif gade timoun",
    "purpose": "Pataje gade timoun ant fanmi ki fè youn lòt konfyans, pou paran ka travay, poze, oswa fè fas ak yon ka prese san yo pa peye pou sa.",
    "whoItServes": "Paran ak moun k ap okipe timoun, sitou paran k ap leve timoun poukont yo, moun ki gen lè travay ki chanje, ak fanmi ki pa gen gwo mwayen.",
    "whatYoullNeed": "Yon gwoup fanmi ki byen tcheke, yon espas ki an sekirite (oswa kay ki resevwa youn apre lòt), yon sistèm orè, ak règ sekirite klè. Okipe pitit lòt moun se yon gwo responsablite — kenbe règ siveyans yo fèm, byen tcheke tout moun k ap gade timoun, epi swiv règ zòn ou sou gade timoun ki fèt ant fanmi konsa.",
    "setupHours": 28,
    "defaultCategory": "childcare",
    "suggestsWorkDays": true,
    "firstSteps": "Pwojè sa a bati nan salon anvan li bati okenn lòt kote: rasanble fanmi fondatè yo epi pale sou detay ki fè moun jennen yo — tcheke moun, siveyans, fason chak fanmi korije timoun, sa k ap fèt si yon timoun blese — anvan pèsonn mete yon sèl èdtan gade timoun sou orè a. Nan menm premye peryòd sa a, tcheke règ zòn ou sou gade timoun ant fanmi, pou modèl ou dakò sou li a se youn ou ka fè mache toutbon.",
    "commonPitfalls": "De bagay kraze kolektif gade timoun san bri: èdtan ki pa ekilibre, kote se menm fanmi yo ki toujou resevwa timoun jouk sa vin peze yo; ak règ sekirite k ap vin mou tank tout moun vin alèz — eksepsyon “yon sèl fwa” sou règ pa-janm-poukont-li a se egzakteman jan konfyans kraze. Fè tout moun ka wè èdtan yo aklè, epi sonje règ sekirite yo pi enpòtan toujou ak fanmi ou pi konnen yo.",
    "pairsWith": [
      "toy-library",
      "time-bank",
      "youth-mentorship"
    ],
    "learnMore": [
      "what-is-balance"
    ],
    "tasks": [
      {
        "name": "Rasanble fanmi fondatè yo epi chwazi yon modèl",
        "description": "Chèche fanmi ki konnen youn lòt oswa ki ka bati konfyans youn ak lòt. Chwazi modèl la: yon sistèm kote fanmi yo fè tou pa yo — yon èdtan gade timoun ou bay se yon èdtan ou ka mande — oswa gade timoun an gwoup sou orè fiks.",
        "hours": 4,
        "skills": [
          "pale ak moun",
          "mennen reyinyon"
        ]
      },
      {
        "name": "Mete règ sekirite ak tcheke moun",
        "description": "Mete dakò sou tcheke tout moun k ap okipe timoun: referans, tcheke dosye kote sa fèt, ak yon règ fèm: okenn granmoun pa janm rete poukont li ak pitit yon lòt fanmi san moun pa konnen kote yo ye. Fikse konbyen granmoun pou konbyen timoun.",
        "hours": 6,
        "skills": [
          "okipe timoun"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Jwenn yon espas epi pare l pou timoun",
        "description": "Chwazi yon lokal oswa mete estanda pou kay k ap resevwa yo. Tcheke danje yo, kouvri priz yo, mare mèb ki lou, klete medikaman ak pwodui chimik, epi tcheke lakou deyò a an sekirite si timoun yo ap jwe deyò.",
        "hours": 4,
        "skills": [
          "okipe timoun",
          "repare kay"
        ]
      },
      {
        "name": "Mete orè a ak kaye èdtan yo kanpe",
        "description": "Sèvi ak yon kalandriye pataje oswa yon aplikasyon ki fèt pou sa. Nan modèl èdtan an, yon èdtan gade timoun ou bay se yon èdtan ou ka mande. Make kilès k ap resevwa timoun ki lè, pou chay la rete jis.",
        "hours": 3,
        "skills": [
          "òganize",
          "antre done"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Ekri règ sante, alèji, ak ka prese",
        "description": "Rasanble enfòmasyon alèji, medikaman, kontak pou ka prese, ak kilès ki gen dwa vin chèche chak timoun. Ekri yon règ klè pou timoun ki malad ak sa pou fè si yon gwo pwoblèm sante rive.",
        "hours": 3,
        "skills": [
          "papye",
          "ekri"
        ]
      },
      {
        "name": "Montre baz yo bay moun k ap gade timoun",
        "description": "Pase sou siveyans, dòmi san danje pou tibebe, repons pou alèji ak ka prese, ak règ sekirite yo. Ankouraje pou omwen yon granmoun ki fè kou premye swen ak CPR pou timoun la nan chak seyans.",
        "hours": 5,
        "skills": [
          "montre moun",
          "premye swen"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Fè yon seyans esè epi koute retou yo",
        "description": "Fè yon ti esè kout ak kèk fanmi, epi fè yon ti pale sou li apre. Ranje sa ki pa t mache anvan bagay la grandi. Pran nouvèl youn ak lòt regilyèman pou konfyans ak sekirite rete solid.",
        "hours": 3,
        "skills": [
          "okipe timoun"
        ],
        "follows": [
          2,
          5
        ]
      }
    ]
  },
  {
    "id": "community-composting",
    "name": "Konpòs kominote a",
    "purpose": "Ranmase restan manje pou yo pa ale nan fatra epi pou fè konpòs gratis pou jaden nan zòn nan.",
    "whoItServes": "Fanmi ki pa gen kote pou fè konpòs, jaden kominote yo, ak anviwònman zòn nan.",
    "whatYoullNeed": "Yon kote pou fè konpòs, bwat pou ranmase restan yo, ekipman debaz, ak yon ti ekip k ap okipe pil la youn apre lòt.",
    "setupHours": 22,
    "defaultCategory": "infrastructure",
    "suggestsWorkDays": true,
    "firstSteps": "Pale ak mèt kote a ak vwazen ki nan distans pran sant yo anvan premye bwat la rive — laperèz sant ak rat touye sit konpòs yo, epi yon konvèsasyon onèt bonè kalme sa pi byen pase nenpòt feyè. Apre sa, jwenn kote konpòs la pral fini (yon jaden kominote ki vle l) ak omwen yon moun ki deja kenbe yon pil cho vivan; jijman yo ap deside ki metòd w ap chwazi.",
    "commonPitfalls": "Pwojè konpòs mouri lè pèsonn pa mèt vire pil la: pil la kanpe oswa kòmanse santi, yon vwazen plenyen, epi mèt kote a retire pèmisyon an — chenn sa a mache pi vit pase ou ta kwè. Mete kantite restan w ap ranmase a sou mezi sa ekip ou a ka trete toutbon, epi gade yon pil ki gate ak move bagay ladan l kòm yon pwoblèm pankat pou ranje, pa yon moun pou jete fòt sou li.",
    "pairsWith": [
      "community-garden",
      "community-meal"
    ],
    "tasks": [
      {
        "name": "Jwenn yon kote pou konpòs la",
        "description": "Jwenn yon espas ki gen plas ak yon ti solèy — yon kwen jaden kominote, yon teren vid, oswa yon lakou yon moun ofri. Pran pèmisyon an klè epi tcheke règ zòn nan sou konpòs.",
        "hours": 4,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Chwazi yon metòd konpòs",
        "description": "Chwazi sa ki matche ak grandè pwojè a: yon sistèm twa bwat pou pil cho, bwat k ap vire, oswa bwat vè tè. Mete metòd la sou mezi kantite materyèl w ap tann ak kantite vire ou ka fè.",
        "hours": 3,
        "skills": [
          "fè konpòs"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Jwenn bwat ak ekipman",
        "description": "Bati oswa achte bwat pou ranmase yo ak estrikti konpòs la. Rasanble yon fouch, yon tèmomèt, ak materyèl mawon (fèy, katon) pou melanje ak restan manje yo nan bon pwopòsyon.",
        "hours": 4,
        "skills": [
          "chapant",
          "kondwi"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Òganize jan restan yo rive",
        "description": "Deside ki jan restan yo rive: yon bwat depo ak lè fiks, oswa yon wout kote yon moun pase pran yo. Bay chak fanmi yon ti bokit pou kwizin ak yon orè depo klè.",
        "hours": 4,
        "skills": [
          "òganize"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Fè klè sa ki ka antre",
        "description": "Afiche yon lis wi/non senp (wi: fwi, legim, ma kafe, po ze; non: vyann, lèt ak fwomaj, luil, poupou bèt). Yon pankat klè anpeche move bagay ki ka gate yon pil antre.",
        "hours": 2,
        "skills": [
          "ekri",
          "tradui"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Fòme ekip k ap okipe pil la",
        "description": "Konpòs mande vire regilye, tcheke imidite, ak bon mezi ant vèt ak mawon. Fè yon orè pataje kote chak moun fè tou pa yo, epi montre moun k ap ede yo baz la pou pil yo pa santi ni kanpe.",
        "hours": 3,
        "skills": [
          "fè konpòs",
          "montre moun"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Separe konpòs ki fin pare a",
        "description": "Lè konpòs la pare, separe l gratis ak moun ki te pote restan yo ak jaden kominote yo. Fè tout moun konnen jou pou vin pran yo epi pote sak oswa bokit.",
        "hours": 2,
        "skills": [
          "kondwi"
        ],
        "recurringCadence": "cycle"
      }
    ]
  },
  {
    "id": "free-little-library",
    "name": "Ti bibliyotèk gratis ak echanj liv",
    "purpose": "Bay liv gratis lajounen kou lannwit pou ankouraje lekti ak pataj, san kat bibliyotèk ni frè.",
    "whoItServes": "Timoun, fanmi, ak moun tout laj ki renmen li, sitou nan katye kote liv ra.",
    "whatYoullNeed": "Yon bwat liv lapli pa ka antre, yon premye pakèt liv, yon kote pou mete l, ak yon ti swen regilye.",
    "setupHours": 7.5,
    "defaultCategory": "education",
    "firstSteps": "Kòmanse ak de ti konvèsasyon: youn ak moun ki gen mi oswa lakou k ap resevwa bwat la, sou plasman an ak sa k ap fèt si li vin delabre; epi youn ak fanmi yo ak lekòl ki tou pre a, sou ki liv yo ta pote lakay yo toutbon. Jwenn moun k ap pran swen bwat la — moun k ap tcheke l chak semèn nan — anvan bwat la monte, pa apre.",
    "commonPitfalls": "Ti bibliyotèk pa mouri paske liv manke — yo mouri ak move liv: yon moun lage yon bwat vye liv lekòl ki depase, bon tit yo antere, lapli antre, epi moun sispann gade san bri. Yon vizit senk minit chak semèn anpeche prèske tout sa; bwat la bezwen yon moun plis pase li bezwen liv.",
    "pairsWith": [
      "seed-library",
      "books-to-prisoners"
    ],
    "tasks": [
      {
        "name": "Bati oswa jwenn yon bwat liv lapli pa antre",
        "description": "Fè oswa achte yon bwat solid, ki pa pran dlo, sou yon poto oswa yon mi. Yon vye amwa oswa yon bwat jounal ka fè l. Mete yon pòt transparan ak yon do kay an pant pou liv yo rete sèch.",
        "hours": 4,
        "skills": [
          "chapant"
        ]
      },
      {
        "name": "Chwazi epi prepare yon kote",
        "description": "Chwazi yon kote moun pase anpil e kote ou gen pèmisyon — devan lakou ou, yon sant kominotè, oswa arebò yon plas piblik. Fikse bwat la byen fèm epi tcheke sa gen dwa fèt.",
        "hours": 1,
        "skills": [
          "pale ak moun"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Mete premye liv yo",
        "description": "Rasanble liv moun bay: fè yon ti apèl nan katye a. Vize yon melanj: liv timoun, woman moun renmen, ak liv pratik. Kòmanse mwatye plen pou gen plas pou ajoute.",
        "hours": 1.5,
        "skills": [
          "pale ak moun"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Mete yon pankat ak règ senp",
        "description": "Afiche “Pran yon liv, kite yon liv — tout gratis.” Kenbe l akeyan, ak règ ki lejè. Ajoute yon ti nòt ki envite tout laj ak tout lang.",
        "hours": 0.5,
        "skills": [
          "ekri"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Jwenn yon moun k ap pran swen l",
        "description": "Mande yon moun ki rete tou pre pou tcheke bwat la chak semèn: ranje l, retire sa ki domaje oswa ki pa apwopriye, epi refè melanj liv yo. Senk minit pa semèn kenbe l an sante.",
        "hours": 0.5,
        "skills": [
          "pale ak moun"
        ]
      }
    ]
  },
  {
    "id": "community-first-aid-training",
    "name": "Kou premye swen ak repons ovèdòz",
    "purpose": "Aprann vwazen yo premye swen, CPR, ak jan pou fè yon ovèdòz fè bak, pou kominote a ka aji nan minit anvan pwofesyonèl yo rive.",
    "whoItServes": "Tout moun; li gen plis enpak kote anbilans mize rive oswa kote ovèdòz frape souvan.",
    "whatYoullNeed": "Enstriktè ki gen sètifika, materyèl, yon espas, ak yon orè ki repete. Tout kou medikal fèt pou soti nan men enstriktè ki gen sètifika; pwojè sa a òganize epi resevwa kou yo, li pa ranplase yo.",
    "setupHours": 17,
    "defaultCategory": "education",
    "firstSteps": "Premye konvèsasyon ou se ak moun k ap anseye yo toutbon — biwo Lakwa Wouj la, biwo sante zòn ou an, oswa yon gwoup k ap ede moun redwi risk dwòg. Mande yo sa yo bezwen nan men yon kote k ap resevwa yo ak ki dat yo ka bay; apre sa, pale ak moun ki gen plis chans temwen yon ka grav — fanmi moun ki sèvi ak dwòg, moun k ap travay nan biznis tou pre — pou premye seyans yo bati bò kote yo.",
    "commonPitfalls": "Pwojè sa a fennen lè li tounen yon sèl gwo jounen kou ki pa janm repete — konesans yo rouye epi naloxone lan ekspire san pèsonn pa wè. Epi reziste anvi anseye pati medikal la ou menm; wòl ou se resevwa enstriktè ki gen sètifika yo, se pa kanpe nan plas yo.",
    "pairsWith": [
      "harm-reduction-supplies",
      "emergency-preparedness"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Jwenn enstriktè ki gen sètifika",
        "description": "Pran kontak ak enstriktè kalifye — Lakwa Wouj, biwo sante zòn ou an, oswa yon gwoup k ap ede moun redwi risk dwòg. Se yo ki bay kou medikal la toutbon; wòl ou se òganize l epi resevwa l.",
        "hours": 4,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Jwenn materyèl yo",
        "description": "Jwenn twous premye swen, manken pou pratike CPR (anpil fwa se enstriktè yo ki pote pa yo), ak naloxone. Anpil kote, biwo sante piblik la bay naloxone gratis — mande biwo sante a oswa gwoup redwi-risk yo.",
        "hours": 3,
        "skills": [
          "pale ak moun",
          "kondwi"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Jwenn espas epi fikse seyans yo",
        "description": "Chwazi yon sal ki gen plas pou pratik kò atè — yon sant kominotè, yon bibliyotèk, oswa yon klinik. Fikse dat ki repete pou moun ka planifye ak travay yo.",
        "hours": 2,
        "skills": []
      },
      {
        "name": "Envite moun vin aprann",
        "description": "Fè tout moun konnen seyans yo epi bay priyorite moun ki gen plis chans temwen yon ka grav. Fè l fasil e gratis pou moun di y ap vini, epi bay plizyè lè diferan pou moun ki gen lè travay ki chanje.",
        "hours": 2,
        "skills": [
          "pale ak moun"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Fè seyans yo mache",
        "description": "Resevwa seyans enstriktè yo ap mennen yo, okipe pare sal la ak akèy, epi tcheke chak moun pratike ak men yo. Bay ti kat referans pou moun pote lakay yo.",
        "hours": 4,
        "skills": [
          "òganize"
        ],
        "follows": [
          0,
          1,
          3
        ],
        "recurringCadence": "session"
      },
      {
        "name": "Separe kit yo epi fè seyans rapèl",
        "description": "Voye moun ki fin aprann yo lakay yo ak yon twous premye swen ak naloxone kote li disponib. Fikse seyans rapèl detanzantan pou konesans yo rete fre.",
        "hours": 2,
        "recurringCadence": "session",
        "follows": [
          4
        ],
        "skills": []
      }
    ]
  },
  {
    "id": "time-bank",
    "name": "Bank tan",
    "purpose": "Kite manm yo fè echanj èd sou baz tan: yon èdtan ou bay egal yon èdtan ou resevwa, epi sa chak moun pote gen menm valè.",
    "whoItServes": "Tout moun, sitou moun ki gen tan ak anpil bagay yo konn fè, men ki pa gen kòb twòp.",
    "whatYoullNeed": "Yon lis manm, yon fason pou make èdtan yo, yon moun k ap kenbe fil la, ak règ tout moun dakò sou yo.",
    "setupHours": 27,
    "defaultCategory": "organizing",
    "firstSteps": "Kòmanse ak konvèsasyon, pa ak lojisyèl: chita ak dis oswa kenz vwazen epi mande yo chak sa yo ta bay ak sa yo ta mande. Si konvèsasyon sa yo pa fè varyete parèt — woulib, leson, reparasyon, manje — kontinye chèche moun anvan ou bati sistèm nan.",
    "commonPitfalls": "Bank tan raman mouri nan eskandal; yo mouri nan silans — moun antre, pèsonn pa fè premye demann lan, epi tout bagay vin bèbè. Fè yon moun aktivman konekte bezwen ak èd pandan premye mwa yo, epi kenbe liy lan: yon èdtan egal yon èdtan. Depi w ap diskite si èdtan yon plonbye vo plis pase èdtan yon moun k ap gade timoun, li pa yon bank tan ankò.",
    "pairsWith": [
      "skill-share",
      "childcare-collective"
    ],
    "learnMore": [
      "what-is-balance",
      "negative-balance"
    ],
    "tasks": [
      {
        "name": "Chèche manm fondatè epi make sa yo konn fè",
        "description": "Rasanble yon premye gwoup epi mande yo chak sa yo ka bay (woulib, leson, reparasyon, manje, jaden) ak sa yo bezwen. Se varyete èd la ki fè l mache.",
        "hours": 5,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Chwazi jan pou make èdtan yo",
        "description": "Chwazi yon fason pou ekri èdtan yo: yon lojisyèl bank tan, yon fèy kalkil pataje, oswa yon senp kaye. Sa ki enpòtan: li make kilès ki bay ak kilès ki resevwa èdtan.",
        "hours": 4,
        "skills": [
          "èd teknik",
          "antre done"
        ]
      },
      {
        "name": "Mete règ yo",
        "description": "Mete dakò sou prensip nwayo a (yon èdtan egal yon èdtan, kèlkeswa travay la), sou jan manm mande ak konfime echanj, ak sou sa k ap fèt si èdtan yon moun desann byen ba.",
        "hours": 4,
        "skills": [
          "mennen reyinyon",
          "ekri"
        ]
      },
      {
        "name": "Akeyi nouvo manm yo",
        "description": "Fè yon ti seyans oryantasyon pou moun konprann lespri a ak sistèm nan. Bay chak moun kèk èdtan semans pou echanj yo ka kòmanse lamenm.",
        "hours": 4,
        "skills": [
          "montre moun"
        ],
        "follows": [
          1,
          2
        ]
      },
      {
        "name": "Fè lis sa moun ka bay",
        "description": "Mete deyò yon lis moun ka fouye: kilès ki bay ki èd. Kenbe l ajou pou manm ka jwenn èd san yo pa mande moun k ap kenbe fil la chak fwa.",
        "hours": 4,
        "skills": [
          "antre done"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Konekte bezwen ak èd",
        "description": "Fè yon moun ede marye bezwen ak èd, sitou nan kòmansman, epi pouse manm ki rete an silans yo. Avèk tan, manm yo ap konekte youn ak lòt dirèkteman.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "òganize"
        ],
        "follows": [
          4
        ]
      },
      {
        "name": "Bati abitid konfyans ak sekirite",
        "description": "Mete abitid pou echanj ki fèt lakay moun oswa ak manm ki fraji (referans, pa rankontre poukont ou kote sa fè w jennen). Ajoute yon fason senp pou mete yon pwoblèm devan kominote a.",
        "hours": 4,
        "skills": [
          "mennen reyinyon"
        ]
      }
    ]
  },
  {
    "id": "solidarity-fund",
    "name": "Fon solidarite (lajan youn ede lòt)",
    "purpose": "Mete lajan ansanm pou lonje kach dirèk, san okenn kondisyon, bay vwazen ki nan yon kriz.",
    "whoItServes": "Moun yon kriz frape — yon lwaye ki pa ka fin peye, yon bòdwo lopital, kouran oswa dlo ki pral koupe.",
    "whatYoullNeed": "Yon sistèm lajan ki klè, yon ti ekip serye pou kenbe l, yon plan pou ranmase lajan, ak kritè ki klè. Kenbe lajan tout moun se yon responsablite tout bon — mande de siyati pou chak lajan ki soti, kenbe kaye a pwòp, pwoteje idantite moun ki resevwa yo, epi chache konsèy sou kote lalwa ak taks pou fon an.",
    "setupHours": 23,
    "defaultCategory": "mutual_aid_drive",
    "firstSteps": "Anvan ou ranmase yon senk kòb, chita ak de twa moun ou ta fè konfyans ak lajan tout moun, epi pale kare: kijan de siyati yo ap mache, ki sa k ap pibliye, ak sa k ap fèt lè demann yo depase lajan an. Apre sa, jwenn yon òganizasyon san bi likratif nan zòn nan oswa yon kontab pou eksplike w kote lalwa ak taks anvan kont lan ouvri.",
    "commonPitfalls": "Lajan kraze konfyans pi vit pase nenpòt lòt bagay — yon sèl peman san eksplikasyon oswa yon kaye an dezòd ka fini ak fon an, menm lè pèsonn pa t fè anyen mal. Epi prèske toujou ap gen plis demann pase lajan; si kritè yo pa t deside davans, di non ka pa ka ap boule ekip la epi simen rankin.",
    "pairsWith": [
      "resource-hub-dispatch",
      "tenant-union",
      "free-tax-prep"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Fòme yon ti ekip serye",
        "description": "Chache de twa moun serye pou kenbe fon an. Bay chak moun yon wòl klè, epi pran angajman transparans depi premye jou a — se konfyans ki kenbe tout bagay isit la.",
        "hours": 3,
        "skills": [
          "òganize"
        ]
      },
      {
        "name": "Mete yon sistèm lajan ki klè",
        "description": "Ouvri yon kont apa, oswa fè yon òganizasyon serye ki gen papye l kenbe lajan an pou fon an. Mande de moun pou di wi sou chak lajan ki soti, kenbe yon kaye ki klè, epi tcheke kesyon taks ak lalwa — pale ak yon òganizasyon san bi likratif oswa yon kontab.",
        "hours": 5,
        "skills": [
          "kontablite",
          "papye"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Deside kritè pou demann ak peman",
        "description": "Deside ki moun ki ka mande, konbyen anjeneral, chak ki tan yon moun ka mande, epi si se premye rive premye sèvi oswa dapre bezwen an. Kenbe baryè yo ba, epi evite mande moun pwouve pwoblèm yo kote ou kapab.",
        "hours": 4,
        "skills": [
          "mennen reyinyon"
        ]
      },
      {
        "name": "Fè yon fòm demann kout, san baryè",
        "description": "Bati yon ti fòm kout e prive ki mande sèlman sa ki nesesè. Bay plizyè fason pou moun mande (sou entènèt, nan telefòn, fas pou fas), epi pwoteje vi prive moun k ap mande yo.",
        "hours": 2,
        "skills": [
          "ekri"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Òganize ranmase lajan",
        "description": "Konbine ti kòb manm yo bay regilyèman ak kèk gwo ranmasaj tanzantan. Di moun k ap bay yo klè: lajan an ale dirèk jwenn vwazen ki nan bezwen.",
        "hours": 4,
        "skills": [
          "pale ak moun"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Bati yon pwosesis desizyon ak peman",
        "description": "Fikse yon delè repons, yon revizyon rapid pa ekip la, ak fason peman ki rive vit. Nan yon kriz, vitès konte. Ekri chak desizyon yon fason senp.",
        "hours": 3,
        "skills": [
          "òganize"
        ],
        "follows": [
          1,
          2
        ]
      },
      {
        "name": "Bay kominote a nouvèl aklè",
        "description": "Pataje yon rezime regilyèman — lajan ki antre, lajan ki soti, konbyen vwazen ki jwenn èd — san devwale idantite moun ki resevwa yo. Transparans fè moun kontinye bay.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "ekri",
          "kontablite"
        ]
      }
    ]
  },
  {
    "id": "diaper-hygiene-bank",
    "name": "Bank kouchèt ak pwodwi ijyèn",
    "purpose": "Bay kouchèt, pwodwi pou règ, ak pwodwi ijyèn gratis — bagay pifò èd pou manje pa ka achte.",
    "whoItServes": "Fanmi ki pa gen gwo mwayen, tibebe, moun ki gen règ yo, ak vwazen ki pa gen kote pou yo rete.",
    "whatYoullNeed": "Yon kote pou sere pwodwi yo, yon sous pwovizyon, kote pou bay yo, ak moun ki vin mete men.",
    "setupHours": 10,
    "defaultCategory": "mutual_aid_drive",
    "suggestsWorkDays": true,
    "firstSteps": "Pale dabò ak moun ki deja wè fanmi yo — klinik timoun nan, kote ki bay manje a, legliz la — epi mande ki gwosè ak ki pwodwi ki vrèman fini vit, epi si yo ta dakò se lakay yo moun vin chèche. Yon sèl konvèsasyon sa a ap sove w plizyè mwa ap devine.",
    "commonPitfalls": "Sa ki fè plis mal se enstabilite: yon sèl gwo ranmasaj, etajè plen, epi mwa vid egzakteman lè fanmi yo te fèk kòmanse konte sou ou. Veye vrè estòk la tou — ti gwosè tibebe fèk fèt yo anpile pandan gwo gwosè yo fini — epi pa janm mande prèv bezwen; diyite fè pati èd la.",
    "pairsWith": [
      "welcome-wagon",
      "laundry-shower-access"
    ],
    "tasks": [
      {
        "name": "Jwenn kote pou sere ak kote pou bay",
        "description": "Jwenn yon kote sèch, ki fèmen byen, pou sere pwodwi yo, ak yon kote pou lonje yo bay — yon amwa nan yon klinik, yon legliz, oswa yon sant kominotè. Kote moun vin chèche a fèt pou santi l prive, ak diyite.",
        "hours": 2,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Òganize kote pwovizyon yo ap soti",
        "description": "Konbine acha an gwo, ranmasaj pwodwi moun bay, ak kontak ak rezo bank kouchèt oswa machann an gwo. Swiv ki sous ki regilye pou etajè yo pa janm rete vid.",
        "hours": 3,
        "skills": [
          "pale ak moun",
          "kondwi"
        ]
      },
      {
        "name": "Triye epi konte pa gwosè ak kalite",
        "description": "Klase kouchèt yo pa gwosè, plis pwodwi pou règ ak pwodwi ijyèn. Kenbe yon kontaj ajou pou ou konnen sa pou mande. Gwosè pou pi gwo tibebe yo konn fini vit.",
        "hours": 1.5,
        "skills": [
          "òganize",
          "antre done"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Mete yon règ pataj ki jis",
        "description": "Deside konbyen chak fanmi resevwa ak chak ki tan, san okenn baryè prèv bezwen. Fè l previzib pou moun ka konte sou li.",
        "hours": 1,
        "skills": [
          "mennen reyinyon"
        ]
      },
      {
        "name": "Fikse jou pou bay yo epi jwenn moun",
        "description": "Chwazi jou fiks pou bay pwodwi yo, chache moun pou lonje pakè yo bay, epi kenbe yon ton cho, san jijman.",
        "hours": 2.5,
        "skills": [
          "òganize"
        ],
        "follows": [
          2,
          3
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "community-bike-workshop",
    "name": "Atelye bisiklèt kominotè",
    "purpose": "Bay espas, zouti, ak èd gratis pou repare, monte, epi genyen yon bisiklèt — pou transpò vin pi abòdab, pi louvri pou tout moun.",
    "whoItServes": "Moun ki pa gen machin, jèn yo, moun k ap fè wout chak jou pou travay, ak nenpòt moun ki bezwen transpò ki pa chè.",
    "whatYoullNeed": "Yon espas, zouti, bisiklèt ak pyès moun bay, ak mekanisyen ki vin mete men.",
    "setupHours": 20,
    "defaultCategory": "transport",
    "suggestsWorkDays": true,
    "firstSteps": "Anvan ou kouri chache yon espas, pale ak moun ki t ap sèvi ak atelye a ak mekanisyen ki t ap montre yo — epi si gen yon atelye bisiklèt kominotè nan yon vil tou pre, ale vizite l epi mande yo sa yo t ap fè yon lòt jan. Ak moun k ap ba w espas la, regle kote pou sere bagay yo, aksè, ak asirans depi davans.",
    "commonPitfalls": "Atelye a mouri lè se moun k ap ede yo ki repare bisiklèt yo olye yo montre moun repare: li tounen yon boutik reparasyon gratis, liy lan ap grandi, epi mekanisyen w yo bouke nèt. Veye pou w pa neye anba vye bisiklèt moun bay tou — triye san pitye — epi pa janm kite yon bisiklèt soti san yon kontwòl sekirite fren ak kawotchou.",
    "pairsWith": [
      "repair-cafe",
      "rides-transportation",
      "tool-lending-library"
    ],
    "tasks": [
      {
        "name": "Jwenn yon espas atelye",
        "description": "Jwenn yon garaj, yon anba kay, yon kontenè, oswa yon espas kominotè pataje ki gen plas pou travay ak pou sere bisiklèt. Konfime aksè ak nenpòt bezwen asirans.",
        "hours": 4,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Rasanble zouti ak yon pye reparasyon",
        "description": "Rasanble yon twous zouti bisiklèt debaz ak omwen yon pye reparasyon, atravè sa moun bay oswa yon ti bidjè. Ranje zouti yo pou yo fasil jwenn e fasil remete nan plas yo.",
        "hours": 5,
        "skills": [
          "kondwi"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Ranmase bisiklèt ak pyès moun bay",
        "description": "Lanse apèl pou bisiklèt ki p ap sèvi ak pyès ki ka toujou sèvi. Triye yo: “ka repare”, “pou pyès”, “pare pou woule”. Se rezèv pyès la ki kenbe atelye a ap mache.",
        "hours": 4,
        "skills": [
          "repare",
          "kondwi"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Chache mekanisyen ki vle montre",
        "description": "Jwenn de twa moun ki konn repare bisiklèt e — sa ki pi enpòtan — ki ka montre lòt moun. Bi a se ede moun aprann repare pa yo, se pa fè l nan plas yo.",
        "hours": 3,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Fikse lè ouvèti ak yon fòmil genyen-yon-bisiklèt",
        "description": "Chwazi lè ouvèti ki previzib. Panse ak yon fòmil kote yon moun aprann repare pandan kèk seyans epi soti ak yon bisiklèt li repare ak men pa l.",
        "hours": 2,
        "skills": [
          "òganize"
        ]
      },
      {
        "name": "Mete pratik sekirite yo kanpe",
        "description": "Mande linèt pwoteksyon, mete règ pou zouti yo, epi kenbe yon twous premye swen. Toujou fè yon kontwòl sekirite (fren, kawotchou, direksyon) anvan yon bisiklèt soti.",
        "hours": 2,
        "skills": [
          "ekri"
        ]
      }
    ]
  },
  {
    "id": "newcomer-translation-network",
    "name": "Rezo èd ak tradiksyon pou moun ki fèk rive",
    "purpose": "Ede imigran ak refijye jwenn wout yo nan yon kote ki nèf — tradiksyon, papye, oryantasyon, ak lyen ak kominote a.",
    "whoItServes": "Imigran ak refijye ki fèk rive, ak vwazen ki poko alèz nan lang peyi a.",
    "whatYoullNeed": "Moun ki pale plizyè lang ki vin mete men, lòt òganizasyon ki deja bò kote yo, materyèl oryantasyon, ak yon sistèm demann. Fè trè atansyon ak vi prive: pa kolekte anyen sou sitiyasyon imigrasyon, voye tout kesyon legal bay avoka imigrasyon ki kalifye, epi kite manm kominote yo di ki èd yo vle tout bon.",
    "setupHours": 22,
    "defaultCategory": "other",
    "firstSteps": "Kòmanse ak moun ki fèk rive yo menm ak òganizasyon ki deja ap mache bò kote yo — kite yo di ki èd yo vle olye ou fè plan pou yo. Epi anvan premye demann lan rive, prepare kote w ap voye moun: avoka imigrasyon kalifye pou chak kesyon legal.",
    "commonPitfalls": "Pi gwo danje a se moun ki vle byen ki glise soti nan entèprete pou tonbe bay konsèy legal oswa medikal yo pa kalifye pou bay — yon move konsèy imigrasyon ka koute yon moun chè anpil. Epi kolekte mwens enfòmasyon posib: yon sèl nòt neglijan sou sitiyasyon yon moun ka mete l an danje tout bon.",
    "pairsWith": [
      "welcome-wagon",
      "legal-aid-clinic",
      "health-navigation"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Chache moun ki pale plizyè lang",
        "description": "Jwenn moun ki pale lang ki kouran nan zòn ou epi ki ka ede ak tradiksyon, papye, ak akonpayman. Matche lang yo ak bezwen reyèl zòn nan.",
        "hours": 4,
        "skills": [
          "tradui",
          "pale ak moun"
        ]
      },
      {
        "name": "Fè lis èd ki genyen nan zòn nan",
        "description": "Bati yon lis klinik, lekòl, kote ki bay èd legal, kou lang, kote moun jwenn manje, ak òganizasyon k ap ede imigran. Souvan, moun ki fèk rive yo sèlman bezwen konnen sa ki egziste ak kijan pou jwenn li.",
        "hours": 5,
        "skills": [
          "pale ak moun",
          "antre done"
        ]
      },
      {
        "name": "Bati yon sistèm demann ak matche",
        "description": "Kreye yon fason senp pou moun ki fèk rive mande èd epi jwenn yon moun ki matche ak lang ak bezwen yo. Bay opsyon telefòn ak fas pou fas, pa sèlman entènèt.",
        "hours": 3,
        "skills": [
          "òganize",
          "èd teknik"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Prepare materyèl oryantasyon",
        "description": "Fè ti gid nan lang ki itil yo, nan yon langaj senp, sou transpò, lekòl, swen sante, ak dwa moun. Sèvi ak imaj pou yo mache pou tout nivo lekti.",
        "hours": 4,
        "skills": [
          "ekri",
          "tradui"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Akonpaye moun nan randevou",
        "description": "Fè aranjman pou yon moun ale ak yo nan randevou lopital, lekòl, oswa biwo pou entèprete ak bay fòs. Prepare moun k ap ede yo: entèprete fidèlman, pa bay konsèy yo pa kalifye pou bay.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "tradui"
        ],
        "follows": [
          0,
          2
        ]
      },
      {
        "name": "Mete pratik vi prive ak sekirite",
        "description": "Kolekte minimòm enfòmasyon ki nesesè, epi pa janm mande ni ekri sitiyasyon imigrasyon yon moun. Sere done yo an sekirite, epi prepare moun k ap ede yo pou sitiyasyon delika ak diskresyon.",
        "hours": 3,
        "skills": [
          "ekri"
        ]
      }
    ]
  },
  {
    "id": "community-meal",
    "name": "Manje kominotè / Kizin tout moun",
    "purpose": "Kwit manje epi pataje repa gratis ansanm sou yon orè regilye, san okenn kesyon.",
    "whoItServes": "Nenpòt moun ki grangou, ki izole, oswa ki pa toujou jwenn manje; li kreye lyen nan tout katye a tou.",
    "whatYoullNeed": "Yon kizin, kizinye, yon sous engredyan ki serye, yon espas pou sèvi, ak yon ekip moun ki vin mete men. Sèvi manje bay piblik la se yon responsablite tout bon sou sekirite manje — tcheke règ zòn ou sou pèmi ak moun ki fòme pou manyen manje, epi swiv bon pratik konsèvasyon ak tanperati chak fwa.",
    "setupHours": 22,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "De premye konvèsasyon ou yo: youn ak moun k ap ba w kizin nan — yon sal legliz oswa yon sant kominotè — sou jou w ap planifye yo, epi youn ak biwo sante zòn nan sou pèmi ak manyen manje; se yo k ap fòme tout rès la. Apre sa, mande moun ki t ap vin manje yo ki jou ak ki lè ki bon pou yo tout bon.",
    "commonPitfalls": "Yon erè sekirite manje ka fè yon moun mal epi fini ak pwojè a — règ tanperati ak konsèvasyon pa janm sote, pa menm yon fwa. Lanmò ki pi dous la se menm twa moun k ap kwit chak repa jouk yo bouke nèt; laji ekip la epi fè tèt kizinye a woule depi kòmansman an.",
    "pairsWith": [
      "gleaning-network",
      "community-garden",
      "community-fridge"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Jwenn yon kizin ak yon espas pou sèvi",
        "description": "Jwenn yon kizin ase gwo pou kwit an kantite — yon sal legliz, yon sant kominotè, oswa yon kizin pwofesyonèl — plis espas pou sèvi. Konfime li lib nan jou ou planifye yo.",
        "hours": 3,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Regle sekirite manje ak pèmi",
        "description": "Tcheke règ zòn ou pou sèvi manje bay piblik la. Ou ka bezwen yon pèmi, yon moun ki fòme nan manyen manje ki prezan, oswa yon kizin ki gen lisans. Aprann bon pratik konsèvasyon ak tanperati.",
        "hours": 4,
        "skills": [
          "sekirite manje"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Òganize kote manje ap soti",
        "description": "Konbine manje makèt ak restoran bay, acha an gwo, ak nenpòt sipli jaden oswa rekòt ki rete. Swiv sous ki serye yo pou ou ka planifye meni sou sa w ap genyen.",
        "hours": 3,
        "skills": [
          "pale ak moun",
          "kondwi"
        ]
      },
      {
        "name": "Planifye meni pou kantite, rejim, ak alèji",
        "description": "Fè manje senp e nourisan ki kwit an gwo kantite epi ki lonje engredyan yo. Bay opsyon san vyann, epi make alèjèn kouran yo aklè.",
        "hours": 2,
        "recurringCadence": "session",
        "skills": [
          "fè manje"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Fòme yon ekip pou kwit ak sèvi",
        "description": "Rasanble moun pou pare, kwit, sèvi, ak netwaye. Chwazi yon tèt kizinye pou chak repa, epi kenbe wòl yo klè pou sèvis la mache byen.",
        "hours": 3,
        "skills": [
          "fè manje",
          "òganize"
        ]
      },
      {
        "name": "Fikse yon orè epi gaye nouvèl la",
        "description": "Chwazi yon jou ak yon lè fiks pou moun ka konte sou li. Fè l konnen ak feyè, kote moun san kay pase nwit, ak bouch an bouch, ak yon ton cho e ouvè pou tout moun.",
        "hours": 2,
        "skills": [
          "desen grafik"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Fè repa a epi netwaye",
        "description": "Kwit, sèvi ak diyite (sèvis sou tab pi dous pase yon liy kote sa posib), epi netwaye kizin nan jan règ yo mande. Anbale rès manje yo san danje pou yo ka separe bay.",
        "hours": 5,
        "skills": [
          "fè manje"
        ],
        "follows": [
          3,
          4,
          5
        ],
        "recurringCadence": "session"
      }
    ]
  },
  {
    "id": "seed-library",
    "name": "Bibliyotèk semans ak echanj semans",
    "purpose": "Pataje semans gratis pou moun ka plante manje, epi konsève varyete lokal ak varyete eritaj yo.",
    "whoItServes": "Moun ki fè jaden lakay, moun k ap plante pou premye fwa, ak jaden kominotè yo.",
    "whatYoullNeed": "Yon sistèm pou sere ak klase, semans moun bay, yon kote ki resevwa l, ak de twa moun pou okipe l.",
    "setupHours": 8,
    "defaultCategory": "food",
    "firstSteps": "Pale ak bibliyotèk la oswa sant kominotè a pou resevwa kabinè a, epi ak jadinye ki gen eksperyans nan zòn nan sou sa ki vrèman pouse nan rejyon an — siksè debitan yo chita sou semans ki fèt pou zòn nan. Yon pepinyè oswa yon jaden kominotè tou pre ap souvan byen kontan bay premye estòk la.",
    "commonPitfalls": "Yon bibliyotèk semans mouri an silans: vye semans ki p ap leve, debitan ki konkli yo pa ka fè jaden epi ki pa janm tounen. Woule estòk la san santimantalite, epi pa konte sou sa moun pote tounen — prèske pèsonn pa sere semans pou pote tounen — kidonk planifye pou plen l ankò ak sa moun bay.",
    "pairsWith": [
      "community-garden",
      "free-little-library"
    ],
    "tasks": [
      {
        "name": "Jwenn yon kote ak yon sistèm pou sere",
        "description": "Antann ou ak yon bibliyotèk, yon sant kominotè, oswa yon jaden pou resevwa yon ti kabinè oswa kèk tiwa. Sere semans yo yon kote fre, sèch, e fè nwa, nan anvlòp ki byen make.",
        "hours": 2,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Jwenn premye semans yo",
        "description": "Ranmase semans nan men jadinye, sipli konpayi semans, ak pakè fen sezon. Bay varyete fasil ki fèt pou rejyon an priyorite pou debitan yo reyisi.",
        "hours": 2,
        "skills": [
          "pale ak moun",
          "fè jaden"
        ]
      },
      {
        "name": "Klase epi make koleksyon an",
        "description": "Triye pa kalite (legim, fèy santi bon, flè) ak pa nivo difikilte. Make chak ak non plant lan, ane a, ak ti nòt sou jan pou plante l. Note sou kilès li fasil pou sere semans ankò.",
        "hours": 2,
        "skills": [
          "fè jaden",
          "antre done"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Mete règ senp pou pran ak pataje",
        "description": "Kenbe l senp: pran semans gratis, plante yo, epi si ou kapab, sere kèk nan fen sezon an pou pote tounen. Afiche yon gid yon paj sou jan sa mache.",
        "hours": 1,
        "skills": [
          "ekri"
        ]
      },
      {
        "name": "Kenbe semans yo bon, mete lòt",
        "description": "Semans pèdi fòs ak tan. Retire vye estòk, teste pakèt ki dout yo pou wè si yo leve, epi mete lòt nan varyete moun renmen yo.",
        "hours": 1,
        "skills": [
          "fè jaden"
        ],
        "follows": [
          2
        ],
        "recurringCadence": "cycle"
      }
    ]
  },
  {
    "id": "digital-literacy",
    "name": "Aprann teknoloji ak pataje aparèy",
    "purpose": "Pataje aparèy epi montre moun sèvi ak teknoloji, pou moun ki pa gen bon aparèy oswa entènèt pa rete dèyè.",
    "whoItServes": "Granmoun aje, vwazen ki pa gen gwo mwayen, moun k ap chache travay, ak nenpòt moun ki rete deyò paske tout bagay vin sou entènèt.",
    "whatYoullNeed": "Aparèy moun bay, aksè entènèt, moun ki vin montre, ak yon espas.",
    "setupHours": 27,
    "defaultCategory": "tech",
    "firstSteps": "Pale dabò ak moun ou vle jwenn yo — nan bibliyotèk la, nan sant granmoun yo, nan liy manje a — epi mande sa yo vle fè tout bon: randevou doktè sou entènèt, aplike pou travay, foto pitit pitit yo. Apre sa, pale ak bibliyotèk la sou espas ak koneksyon anvan ou ranmase yon sèl aparèy.",
    "commonPitfalls": "Bay yon moun yon aparèy san ou pa regle entènèt la, se ba li yon bwat ki pa ka fè anyen — koneksyon an se mwatye pwojè a. Nan seyans yo, erè klasik la se moun k ap montre a ki pran sourit la epi k ap pale jagon; epi pa janm repase yon aparèy bay yon lòt moun san ou pa efase tout sa ki sou li anvan, paske done yon moun ki koule kraze tout konfyans ou te bati.",
    "pairsWith": [
      "community-wifi-mesh",
      "skill-share"
    ],
    "learnMore": [
      "install-app",
      "new-device"
    ],
    "tasks": [
      {
        "name": "Ranmase epi remete aparèy yo anfòm",
        "description": "Ranmase laptòp, tablèt, ak telefòn moun bay. Efase tout sa ki sou chak, mete l ajou, epi regle l pou l fasil sèvi. Teste tout bagay mache anvan ou lage l nan men yon moun.",
        "hours": 8,
        "skills": [
          "èd teknik",
          "kondwi"
        ]
      },
      {
        "name": "Mete yon sistèm pou pran ak pote tounen",
        "description": "Kreye yon fèy soti senp: ki moun ki pran kisa, eta li, ak dat pou l tounen. Deside konbyen tan yon moun ka kenbe l, ak yon règ retou dous ki chita sou konfyans.",
        "hours": 3,
        "skills": [
          "antre done"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Regle aksè entènèt",
        "description": "Yon aparèy pa itil anpil san koneksyon. Bay moun pran hotspot, antann ou ak bibliyotèk la, oswa montre moun fòmil entènèt ki pa chè ak Wi-Fi piblik gratis.",
        "hours": 3,
        "skills": [
          "èd teknik",
          "pale ak moun"
        ]
      },
      {
        "name": "Chache moun ki ka montre, prepare yo",
        "description": "Jwenn moun ki gen pasyans, epi prepare yo pou montre san jagon. Ensiste: ale nan vitès moun k ap aprann lan, pa janm pran sourit la nan men l.",
        "hours": 4,
        "skills": [
          "montre moun"
        ]
      },
      {
        "name": "Fè yon plan leson pou debitan",
        "description": "Fè ti leson kout sou sa ki esansyèl: imèl, sekirite sou entènèt, aplike pou travay, randevou doktè sou entènèt, fòm leta, ak apèl videyo. Bay fèy rezime enprime.",
        "hours": 4,
        "skills": [
          "montre moun",
          "ekri"
        ]
      },
      {
        "name": "Fikse klas ak lè èd lib",
        "description": "Bay ni klas estriktire ni lè “èd teknoloji” lib. Varye lè yo pou moun k ap travay, epi kenbe gwoup yo piti.",
        "hours": 3,
        "recurringCadence": "session",
        "skills": [
          "òganize"
        ],
        "follows": [
          3,
          4
        ]
      },
      {
        "name": "Mete règ sekirite done ak retou",
        "description": "Efase tout sa ki sou yon aparèy ant de moun, montre bon abitid modpas ak vi prive, epi eksplike kijan done pèsonèl yo pwoteje. Prepare yon plan pou aparèy ki pèdi oswa kraze.",
        "hours": 2,
        "skills": [
          "èd teknik",
          "ekri"
        ]
      }
    ]
  },
  {
    "id": "weatherization-brigade",
    "name": "Ekip reparasyon ak ranfòsman kay",
    "purpose": "Ede vwazen ki pa gen gwo mwayen, granmoun aje, ak vwazen ki gen yon andikap ak reparasyon kay ak travay pou kolmate l kont move tan — pou bese bòdwo kouran epi fè kay la pi an sekirite.",
    "whoItServes": "Moun ki gen kay yo men ki pa gen gwo mwayen, granmoun aje, ak vwazen ki gen yon andikap ki pa ka fè travay la ni peye l.",
    "whatYoullNeed": "Moun ki gen metye nan men yo ki vin mete men, materyo, zouti, ak yon sistèm demann. Rete nan travay ekip la konn fè — voye travay elektrik, gaz, estrikti, ak twati bay bòs ki gen lisans.",
    "setupHours": 21,
    "defaultCategory": "housing",
    "suggestsWorkDays": true,
    "firstSteps": "Rasanble moun ki pi gen eksperyans yo dabò, epi mete dakò ansanm sou limit travay la — ki travay ekip la ap pran e kilès k ap ale jwenn bòs ki gen lisans — anvan ou pran yon sèl demann. Trete premye vizit nan chak kay tankou yon konvèsasyon, pa yon enspeksyon: se moun ki rete a ki deside sa k ap manyen lakay li.",
    "commonPitfalls": "Danje a se travay k ap grandi anba men w: ti reparasyon an ki vin tounen travay elektrik, gaz, oswa twati ki depase sa ekip la konn fè — se la yon moun blese. Epi pa pwomèt plis vizit pase sa ekip la ka fè; kite yon granmoun ap tann yon èd li te konte sou li fè plis mal pase yon non onèt depi nan kòmansman.",
    "pairsWith": [
      "community-wood-bank",
      "tool-lending-library"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Chache moun ki gen metye nan men yo",
        "description": "Jwenn moun ki alèz ak chapant debaz, mastik, izolasyon, ak jwen pòt-fenèt. De twa moun ki pi gen eksperyans ka gide rès la.",
        "hours": 4,
        "skills": [
          "chapant",
          "repare kay"
        ]
      },
      {
        "name": "Fikse limit travay la",
        "description": "Defini sa ekip la ap fè ak sa li p ap fè. Rete nan travay senp e san danje (kolmataj, ba pou kenbe, ti reparasyon), epi ekate tout sa ki mande yon bòs ki gen lisans, tankou gwo travay elektrik oswa gaz.",
        "hours": 2,
        "skills": [
          "repare kay"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Bati yon sistèm demann ak vizit",
        "description": "Kreye yon fason pou vwazen mande èd, epi fè yon vizit rapid pou wè travay la, fè lis materyo, epi konfime li anndan limit konesans ak sekirite ekip la.",
        "hours": 3,
        "skills": [
          "òganize"
        ]
      },
      {
        "name": "Jwenn materyo ak zouti",
        "description": "Rasanble mastik, jwen, izolasyon, ak ti kenkayri debaz atravè sa moun bay, rabè, oswa yon ti bidjè. Kenbe yon bwat zouti pataje.",
        "hours": 4,
        "skills": [
          "kondwi"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Regle sekirite ak asirans",
        "description": "Sèvi ak papye dechaj senp, pote twous premye swen, mande ekipman sekirite, epi pa janm eseye travay ki depase sa ou konn fè. Pran konsèy sou asirans pou reparasyon kay yo.",
        "hours": 3,
        "skills": [
          "papye"
        ]
      },
      {
        "name": "Planifye konbit yo epi fè yo",
        "description": "Matche travay yo ak ekip yo, konfime ak moun ki gen kay la, epi fini travay la nan yon sèl seyans konsantre. Respekte kay la ak volonte moun ki rete a depi nan kòmansman rive nan bout.",
        "hours": 5,
        "skills": [
          "òganize",
          "repare kay"
        ],
        "follows": [
          1,
          2,
          3,
          4
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "pet-food-bank",
    "name": "Bank manje pou bèt ak èd pou okipe yo",
    "purpose": "Bay manje gratis pou bèt yo ak yon ti èd pou swen yo, konsa pèsonn pa oblije lage bèt li paske kòb la pa la.",
    "whoItServes": "Moun ki gen bèt men ki pa gen anpil kòb, granmoun k ap viv sou yon ti revni fiks, ak vwazen ki pa gen kote pou yo rete men ki gen zannimo.",
    "whatYoullNeed": "Yon kote pou sere manje a, yon sous manje bèt ki pa sispann, yon kote pou bay li, ak antant ak veterinè yo.",
    "setupHours": 10,
    "defaultCategory": "mutual_aid_drive",
    "suggestsWorkDays": true,
    "firstSteps": "Pale anvan ak gadmanje kominote a ki egziste deja sou lide pou bay manje a ansanm — souvan se menm fanmi yo ki bezwen toude — epi ak veterinè yo ak magazen bèt yo sou don, e petèt yon antant pou vaksen oswa pou pri redui.",
    "commonPitfalls": "Se lè moun pa ka konte sou ou ki fè plis dega: yon sèl gwo jou ranmasay manje, apre sa etajè yo vid, alòske mèt bèt yo bezwen konnen ou la chak fwa. Veye ton an tou — nenpòt jijman sou ‘èske moun pòv ta dwe gen bèt’ ap touye pwojè sa a pi vit pase yon sak manje ki fini.",
    "pairsWith": [
      "diaper-hygiene-bank",
      "community-fridge"
    ],
    "tasks": [
      {
        "name": "Jwenn kote pou sere ak kote pou bay manje a",
        "description": "Jwenn yon kote sèk kote ravèt ak rat pa ka antre, ak yon pwen pou lonje manje a bay moun — souvan bò kote yon gadmanje kominote oswa yon sant kominotè ki la deja.",
        "hours": 2,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Monte yon sous manje bèt ki kontinye",
        "description": "Melanje jou kote moun pote manje, don magazen bèt ak faktori, epi acha an gwo. Make sa k ap antre pou ou ka planifye jou w ap bay yo.",
        "hours": 3,
        "skills": [
          "pale ak moun",
          "kondwi"
        ]
      },
      {
        "name": "Triye manje a pa bèt ak pa gwosè",
        "description": "Separe manje chen ak manje chat (ak lòt bèt), make kantite yo, epi tcheke dat ekspirasyon yo. Kenbe yon lis kantite ajou pou ou konnen sa pou ranpli.",
        "hours": 1.5,
        "skills": [
          "òganize",
          "antre done"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Deside jan manje a ap separe",
        "description": "Deside konbyen chak fanmi ap resevwa ak chak konbyen tan, san mande okenn prèv bezwen. Fè l regilye pou mèt bèt yo ka planifye.",
        "hours": 1,
        "skills": [
          "mennen reyinyon"
        ]
      },
      {
        "name": "Mete lè yo epi jwenn moun pou jou yo",
        "description": "Fikse lè regilye pou bay manje a, jwenn moun ki vin mete men, epi kenbe yon ton san jijman. Gen moun ki rete san manje pou bèt yo ka manje — resevwa yo ak respè.",
        "hours": 2.5,
        "skills": [
          "òganize"
        ],
        "follows": [
          2,
          3
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "youth-mentorship",
    "name": "Gid pou jèn ak espas apre lekòl",
    "purpose": "Bay timoun ak jèn yon espas ki an sekirite apre lekòl, ak èd pou devwa, granmoun k ap gide yo, ak aktivite k ap fè yo grandi.",
    "whoItServes": "Jèn nan katye kote mwayen yo manke, ak paran k ap travay ki bezwen yon kote serye pou timoun yo.",
    "whatYoullNeed": "Yon espas ki an sekirite, granmoun ki byen tcheke, aktivite, ak ti goute. Travay ak jèn se yon gwo responsablite — tcheke dosye chak granmoun, kenbe règ de-granmoun lan, respekte obligasyon legal pou fè otorite yo konnen si yon timoun an danje, epi swiv règ zòn ou an pou espas timoun yo.",
    "setupHours": 28,
    "defaultCategory": "education",
    "suggestsWorkDays": true,
    "firstSteps": "Anvan ou chèche yon sèl gid, pale ak paran yo ak jèn yo menm sou sa yo bezwen, epi mete règ sekirite ou yo alekri — tcheke dosye, règ de-granmoun lan, obligasyon legal pou fè otorite yo konnen. Okenn granmoun pa pase tan ak timoun toutotan li pa pase tout kontwòl sa yo.",
    "commonPitfalls": "Pi gwo echèk la se koupe chemen sou sekirite: yon granmoun yo pa tcheke, oswa yon granmoun pou kont li ak yon timoun — sa pa negosyab, janmen. Dezyèm lan se gid k ap vini epi ale; pou timoun lavi a te deja lage, yon granmoun ki disparèt fè mal, kidonk kòmanse piti epi grandi sèlman jis kote ou ka veye epi kenbe.",
    "pairsWith": [
      "school-supply-program",
      "childcare-collective",
      "community-music"
    ],
    "learnMore": [
      "how-vouching-works"
    ],
    "tasks": [
      {
        "name": "Jwenn yon espas serye epi fikse lè yo",
        "description": "Jwenn yon kote ki bon e ki fasil pou rive — yon sal lekòl, yon bibliyotèk, oswa yon sant kominotè — epi fikse lè apre lekòl ki pa chanje, pou fanmi yo ka konte sou yo.",
        "hours": 3,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Mete règ sekirite timoun ak tcheke granmoun",
        "description": "Egzije tcheke dosye pou tout granmoun k ap travay ak jèn, kenbe règ de-granmoun lan pou pèsonn pa janm pou kont li ak yon timoun, epi ekri règ konduit klè ak etap pou fè otorite yo konnen si gen yon ka grav.",
        "hours": 6,
        "skills": [
          "okipe timoun",
          "ekri"
        ]
      },
      {
        "name": "Chèche gid yo epi prepare yo",
        "description": "Jwenn granmoun serye ki gen kè, epi montre yo limit yo, sekirite jèn yo, ak jan pou ede san yo pa fè travay la pou timoun yo. Vize menm moun yo, semèn apre semèn.",
        "hours": 6,
        "skills": [
          "pale ak moun",
          "montre moun"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Planifye aktivite yo",
        "description": "Melanje èd pou devwa ak lòt bagay k ap fè yo grandi — lekti, atizay, espò, ti konesans pou lavi. Fè l enteresan, epi kite jèn yo ede deside sa k ap fèt.",
        "hours": 4,
        "skills": [
          "montre moun"
        ]
      },
      {
        "name": "Okipe fich yo: alèji, kontak, otorizasyon",
        "description": "Ranmase pèmisyon paran, detay alèji ak sante, kontak pou ka ijans, ak ki moun ki gen dwa vin chèche chak timoun. Sere tout sa yon kote ki an sekirite.",
        "hours": 3,
        "skills": [
          "papye",
          "antre done"
        ]
      },
      {
        "name": "Jwenn ti goute ak materyèl",
        "description": "Bay yon ti goute ki bon pou sante (anpil timoun rive grangou), epi ranmase liv, materyèl atizay, ak jwèt gras ak don oswa yon ti kòb.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Fè seyans yo epi rete an kontak ak fanmi yo",
        "description": "Ouvri espas la, veye timoun yo pre, mennen aktivite yo, epi kenbe kontak regilye ak paran yo sou jan pitit yo ap fè.",
        "hours": 4,
        "skills": [
          "okipe timoun",
          "montre moun"
        ],
        "follows": [
          0,
          2,
          3,
          4
        ],
        "recurringCadence": "session"
      }
    ]
  },
  {
    "id": "gleaning-network",
    "name": "Rezo ranmase rekòt ki rete",
    "purpose": "Sove manje jaden ki rete apre rekòt — nan fèm, jaden fwi, jaden lakou, ak mache — epi separe l bay moun anvan li gaspiye.",
    "whoItServes": "Vwazen ki pa toujou jwenn manje, ak pwojè manje tankou frijidè kominote, gadmanje, ak manje ansanm.",
    "whatYoullNeed": "Moun ki pare pou mete men, transpò, bon relasyon ak moun k ap plante yo, ak yon kote pou kenbe manje a yon ti tan.",
    "setupHours": 21,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Kòmanse ak moun k ap plante yo: fèm, jaden fwi, machann nan mache. Mande ki rekòt ki rete e ki sa k ap fatige yo lè moun vin ranmase — responsablite legal, dega nan jaden — epi fikse kote manje a prale (frijidè, gadmanje, manje ansanm) anvan premye rekòt la.",
    "commonPitfalls": "Echèk klasik la se sove fwi ki apre sa pouri nan garaj yon moun — kote manje a prale regle anvan ou keyi, pa apre. Fenèt rekòt yo kout, kidonk yon ti ekip ki deplase vit pi bon pase yon long lis non; e yon sèl jou ranmase ki fèt mal e ki kraze yon jaden ka fè ou pèdi moun k ap plante a nèt.",
    "pairsWith": [
      "community-fridge",
      "food-preservation",
      "community-meal"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Jwenn sous manje jaden",
        "description": "Kontakte fèm, jaden fwi, machann nan mache, ak vwazen ki gen pyebwa chaje fwi. Anpil ladan yo kontan wè rekòt ki rete a ranmase olye li pouri.",
        "hours": 4,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Monte ekip ranmase a",
        "description": "Fè yon lis moun ki ka kouri vini lè manje a pare. Fenèt rekòt yo kout, kidonk disponiblite konte plis pase kantite.",
        "hours": 2,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Regle transpò ak kote pou kenbe manje a",
        "description": "Jwenn machin pou deplase manje a ak yon kote fre pou kenbe l yon ti tan. Fè tout moun antann yo pou manje a soti nan jaden an rive jwenn moun vit, anvan li gate.",
        "hours": 3,
        "skills": [
          "kondwi"
        ]
      },
      {
        "name": "Monte sistèm alèt ak orè a",
        "description": "Kreye yon fason rapid pou avèti ekip la e pou yo konfime lè yon jou ranmase parèt, paske moun k ap plante yo souvan bay ti preyavi. Yon chat gwoup oswa yon lis pou rele ka fè l.",
        "hours": 2,
        "skills": [
          "òganize"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Regle responsablite legal ak pwòpte manje a",
        "description": "Chèche konnen ki pwoteksyon lalwa zòn ou an bay moun k ap fè kado manje, mete tout moun dakò sou kèk règ senp pou manyen manje a, epi sèvi ak yon ti papye dechaj pou moun k ap plante yo santi yo alèz resevwa ekip la.",
        "hours": 3,
        "skills": [
          "papye",
          "sekirite manje"
        ]
      },
      {
        "name": "Fikse kote manje a prale",
        "description": "Regle davans kote manje ki ranmase a prale — frijidè kominote, gadmanje, manje ansanm, oswa dirèk bay fanmi — pou li pa janm rete la san sèvi.",
        "hours": 3,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Fè jou ranmase yo epi make liv yo",
        "description": "Keyi ak anpil swen pou pwoteje jaden an, separe manje a bay moun san pèdi tan, epi make konbyen liv ki sove. Chif sa yo ede jwenn plis moun k ap plante ak plis men.",
        "hours": 4,
        "skills": [
          "fè jaden",
          "kondwi"
        ],
        "follows": [
          0,
          2,
          3,
          5
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "community-mediation",
    "name": "Rezo medyasyon kominote a",
    "purpose": "Ofri medyasyon gratis, san paspouki, pou dezakò ant vwazen — regle bagay yo san tribinal, san lapolis.",
    "whoItServes": "Vwazen, lokatè ak mèt kay, moun k ap viv ansanm, ak gwoup nan kominote a ki nan dezakò.",
    "whatYoullNeed": "Medyatè ki byen prepare, yon espas ki pa pou okenn bò, ak yon fason pou moun mande medyasyon. Medyasyon se pou dezakò ant moun ki dakò chita — triye epi voye tout sitiyasyon ki gen vyolans, abi, oswa danje bay pwofesyonèl ki fèt pou sa oswa sèvis ijans yo.",
    "setupHours": 22,
    "defaultCategory": "other",
    "firstSteps": "Pale anvan ak yon sant medyasyon kominotè ki egziste deja oswa ak yon moun ki konn montre metye a — bagay sa a pa envante sou plas — epi anvan premye ka a, mete liy triyaj ou a alekri: ki dezakò w ap pran, ak ki kote ou voye tout sa ki gen vyolans oswa abi.",
    "commonPitfalls": "Echèk ki danjere a se fè medyasyon pou sa ki pa pou medyasyon: yon ‘dezakò vwazen’ ki an reyalite se abi mete yon moun an danje, kidonk triye chak demann. Epi diskresyon se tout richès pwojè a — yon sèl detay ki soti, epi konfyans lan pa janm tounen; pran swen medyatè ou yo tou, paske travay sa a manje moun.",
    "pairsWith": [
      "legal-aid-clinic",
      "tenant-union"
    ],
    "learnMore": [
      "disagree-with-member"
    ],
    "tasks": [
      {
        "name": "Chèche medyatè yo epi prepare yo",
        "description": "Jwenn moun ki poze e ki jis, epi fè yo pran yon kou medyasyon serye, oswa mete tèt ansanm ak yon sant medyasyon kominotè ki la deja.",
        "hours": 6,
        "skills": [
          "pale ak moun",
          "mennen reyinyon"
        ]
      },
      {
        "name": "Monte fason pou moun mande medyasyon",
        "description": "Kreye yon fason senp pou moun mande medyasyon. Nan premye kontak la, koute chak bò apa pou konprann debaz yo, epi konfime ka a bon pou medyasyon.",
        "hours": 3,
        "skills": [
          "òganize",
          "fè entèvyou"
        ]
      },
      {
        "name": "Jwenn espas ki pa pou okenn bò",
        "description": "Jwenn kote ki kalm e ki pa sou teren okenn bò — yon sal bibliyotèk oswa yon sant kominotè — kote toude ka santi yo an sekirite e egalego.",
        "hours": 2,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Fikse limit yo: sa ki antre, sa ki pa antre",
        "description": "Deside ki dezakò w ap pran (bri, espas ki pataje, ti dezakò) ak sa ou p ap pran. Triye epi voye tout sitiyasyon ki gen vyolans, abi, oswa risk pou sekirite bay pwofesyonèl ki fèt pou sa.",
        "hours": 3,
        "skills": [
          "mennen reyinyon",
          "ekri"
        ]
      },
      {
        "name": "Mete règ yo: sa ki di la rete la",
        "description": "Fikse règ klè: sa ki di la rete la, pèsonn pa la pa fòs, youn pa koupe pawòl lòt, epi medyatè a gide men li pa deside. Mete yo alekri pou moun k ap patisipe yo.",
        "hours": 3,
        "skills": [
          "ekri"
        ]
      },
      {
        "name": "Fè moun konnen èd sa a egziste",
        "description": "Fè vwazen, gwoup lojman, ak òganizasyon nan zòn nan konnen gen medyasyon gratis, pou moun lonje men pran l anvan yon dezakò vin pi cho.",
        "hours": 3,
        "skills": [
          "pale ak moun",
          "desen grafik"
        ],
        "follows": [
          1,
          3
        ]
      },
      {
        "name": "Swiv rezilta yo epi soutni medyatè yo",
        "description": "Make konbyen ka ki regle (san devwale sa ki te di), epi chita pale ak medyatè yo souvan. Travay la manje moun, kidonk separe ka yo epi bay medyatè yo soutyen.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "antre done",
          "mennen reyinyon"
        ]
      }
    ]
  },
  {
    "id": "reentry-support",
    "name": "Rezo èd pou moun k ap soti nan prizon",
    "purpose": "Ede moun k ap tounen lakay apre prizon jwenn pyès idantite, kay, travay, ak yon kominote — yon pasaj tout moun konnen ki di.",
    "whoItServes": "Moun ki te nan prizon ak fanmi yo.",
    "whatYoullNeed": "Moun ki pare pou mete men, lòt òganizasyon k ap travay menm kote a, ak yon bon lis kote ki bay èd. Konsidere dosye ak istwa moun tankou koze prive — mache ak respè devan, swiv chimen moun nan menm chwazi, epi voye kesyon legal yo bay yon avoka ki kalifye.",
    "setupHours": 28,
    "defaultCategory": "other",
    "firstSteps": "Anvan ou bati anyen, chita ak moun ki te fè eksperyans tounen lakay la yo menm, ak òganizasyon k ap travay sou sa deja, biwo libète kondisyonèl yo, ak patwon ki bay moun ki gen dosye yon chans — mande sa k ap bloke moun toutbon nan premye semèn yo e ki plas rezo ou a. Jwenn yon kontak èd legal oswa yon avoka kalifye depi kounye a, pou lè kesyon legal parèt ou gen yon kote serye pou voye yo.",
    "commonPitfalls": "Pwojè sa a mouri lè li tounen yon baryè — moun k ap ede yo ap deside kilès ki merite èd — oswa lè istwa yon moun soti epi sa koute l yon travay oswa yon kay. Li echwe an silans tou lè antouzyasm depase pawòl kenbe; yon pwomès kase frape pi di sou yon moun k ap rebati konfyans pase okenn pwomès menm.",
    "pairsWith": [
      "court-support",
      "books-to-prisoners"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Monte lis kote ki bay èd yo",
        "description": "Fè kat tout kote ki ka ede: pyès idantite ak papye, kay, travay, swen sante, tretman, ak èd leta. Make ki patwon ak ki mèt kay ki louvri pou moun ki gen dosye.",
        "hours": 6,
        "skills": [
          "pale ak moun",
          "antre done"
        ]
      },
      {
        "name": "Chèche moun k ap ede yo epi prepare yo",
        "description": "Jwenn moun ki pa jije, epi montre yo kijan pou bay èd ak respè, ak konesans sou chòk moun pase. Moun k ap tounen lakay bezwen moun ki mache bò kote yo, pa moun k ap kontwole pòtay la.",
        "hours": 5,
        "skills": [
          "pale ak moun",
          "montre moun"
        ]
      },
      {
        "name": "Kreye yon akèy ki gen diyite",
        "description": "Bati yon fason senp e ki gen diyite pou konnen sa chak moun bezwen pi prese — souvan se pyès idantite, yon kote pou rete, ak yon revni — epi kòmanse la.",
        "hours": 3,
        "skills": [
          "fè entèvyou"
        ]
      },
      {
        "name": "Ede ak papye yo ak èd leta",
        "description": "Ede moun ranplase pyès idantite ak lòt papye ofisyèl, fè demann èd leta, ak tout papye ki difisil pou fè san yon adrès oswa san entènèt.",
        "hours": 4,
        "recurringCadence": "month",
        "skills": [
          "papye"
        ]
      },
      {
        "name": "Louvri pòt travay ak kay",
        "description": "Fè prezantasyon cho bay patwon ki bay yon chans ak kote pou moun rete, epi ede ak aplikasyon, CV, ak preparasyon pou entèvyou.",
        "hours": 4,
        "recurringCadence": "month",
        "skills": [
          "pale ak moun",
          "ekri"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Mete moun ak moun ki te pase menm chimen",
        "description": "Kote sa posib, mete chak moun ak yon gid ki te viv tounen lakay la li menm tou. Eksperyans pataje sa a bati konfyans pi vit pase nenpòt lòt bagay.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "mennen reyinyon"
        ]
      },
      {
        "name": "Fikse règ prive ak limit yo",
        "description": "Kenbe istwa moun yo byen sere, pa janm fòse pèsonn pataje plis pase sa li vle, epi voye chak kesyon legal bay yon avoka ki kalifye.",
        "hours": 3,
        "skills": [
          "ekri"
        ]
      }
    ]
  },
  {
    "id": "community-wood-bank",
    "name": "Bank bwa kominote a — èd pou chofe kay",
    "purpose": "Ranmase ak separe bwa dife bay moun, epi òganize èd pou chofaj pou vwazen yo rete cho pandan tout ivè a.",
    "whoItServes": "Fanmi ki pa gen anpil kòb oswa k ap viv andeyò ki chofe ak bwa, ak granmoun ki pa ka ranmase oswa fann bwa pou kont yo.",
    "whatYoullNeed": "Yon sous bwa, yon teren pou koupe ak sere l, ekipman, yon ekip ki byen prepare, ak yon plan livrezon. Si a motè ak machin pou fann bwa danjere — kite sèl moun ki konn sèvi ak yo toutbon manyen yo, egzije ekipman pwoteksyon, epi pale sekirite ak ekip la anvan chak seyans.",
    "setupHours": 24,
    "defaultCategory": "mutual_aid_drive",
    "suggestsWorkDays": true,
    "firstSteps": "Kòmanse ak fanmi ki chofe ak bwa yo — granmoun andeyò, fanmi biwo èd leta pou chofaj la konnen deja — pou aprann konbyen yo boule e ki lè li fini, apre sa rele konpayi k ap koupe pyebwa yo pou konnen kote bwa yo ale kounye a. Anvan okenn si pati, deside kilès ki kenbe sekirite a: yon moun ki gen ase eksperyans pou montre ekip la, e ki alèz di yon moun ki vle ede non.",
    "commonPitfalls": "De fason pwojè sa a fè moun mal: yon moun san eksperyans sou yon si a motè, ak livre bwa vèt ki fè lafimen, ki kouvri chemine ak kreozòt, e ki pa chofe. Koupe an oktòb pou desanm vle di bwa mouye — echèk kalandriye a reyèl menm jan ak echèk sekirite a.",
    "pairsWith": [
      "weatherization-brigade",
      "cooling-warming-center"
    ],
    "tasks": [
      {
        "name": "Jwenn yon sous bwa",
        "description": "Regle yon sous: konpayi k ap koupe pyebwa, netwayaj apre tanpèt, pyebwa tonbe moun fè kado, oswa teren ki jere yon fason ki dirab. Konfime ou gen dwa pran l e travay li devan lalwa.",
        "hours": 4,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Jwenn yon teren pou koupe ak sere bwa",
        "description": "Jwenn yon lakou oswa yon teren kote bwa ka koupe, fann, anpile, epi seche. Ou bezwen plas pou kenbe bwa sezon sa a sèk ak bwa lòt sezon an k ap seche.",
        "hours": 4,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Jwenn ekipman ak materyèl pwoteksyon",
        "description": "Jwenn oswa mande yon machin pou fann bwa, si a motè, ak ekipman pwoteksyon (pantalon espesyal, pwoteksyon je ak zòrèy, gan). Kenbe zouti yo an bon eta ak yon twous premye swen sou teren an.",
        "hours": 4,
        "skills": [
          "kondwi",
          "repare zouti"
        ]
      },
      {
        "name": "Monte ekip bwa a epi prepare l",
        "description": "Monte yon ekip epi asire se sèl moun ki byen konn sèvi ak yo ki manyen si a motè ak machin pou fann bwa. Fè yon ti chita sou sekirite anvan chak konbit.",
        "hours": 4,
        "skills": [
          "montre moun",
          "pale ak moun"
        ]
      },
      {
        "name": "Monte sistèm demann ak livrezon an",
        "description": "Kreye yon fason pou fanmi yo mande bwa e pou livrezon an regle, paske anpil nan moun k ap resevwa yo se granmoun oswa moun san kamyon. Konfime bwa a anpile yon kote ki bon toupre kay la.",
        "hours": 3,
        "skills": [
          "òganize",
          "kondwi"
        ]
      },
      {
        "name": "Deside jan bwa a ap separe",
        "description": "Deside konbyen bwa chak fanmi ap resevwa, epi mete moun ki plis an danje nan fredi a devan. Kenbe pwosesis la senp, san baryè.",
        "hours": 2,
        "skills": [
          "mennen reyinyon"
        ]
      },
      {
        "name": "Planifye konbit yo ak sechaj la",
        "description": "Planifye koupe ak fann bwa a byen anvan ivè a, paske bwa vèt fèt pou seche pandan plizyè mwa anvan li boule san danje. Make sa ki sèk e ki pare.",
        "hours": 3,
        "recurringCadence": "cycle",
        "skills": [
          "òganize"
        ],
        "follows": [
          0,
          1,
          2,
          3
        ]
      }
    ]
  },
  {
    "id": "community-wifi-mesh",
    "name": "Wi-Fi gratis pou kominote a (rezo mesh)",
    "purpose": "Bay aksè entènèt gratis kote li twò chè oswa li pa egziste.",
    "whoItServes": "Fanmi ki pa gen anpil kòb, elèv, moun k ap chèche travay, ak tout moun ki pa gen yon entènèt yo ka konte sou li.",
    "whatYoullNeed": "Yon liy entènèt prensipal, woutè ak pwen mesh, moun ki konn teknoloji ki pare pou ede, ak kay k ap resevwa ekipman an.",
    "setupHours": 32,
    "defaultCategory": "tech",
    "firstSteps": "Mache nan blòk ou vle kouvri yo epi frape pòt — pale ak fanmi ki pa gen entènèt sou sa yo ta fè avè l toutbon, ak moun ki gen do kay ak fenèt anlè ki ta ka resevwa yon pwen mesh. Anvan ou achte materyèl, fè konvèsasyon koneksyon an: jwenn biznis la, bibliyotèk la, oswa konpayi entènèt ki dakò pataje yon liy, epi konfime alekri pataje a otorize.",
    "commonPitfalls": "Rezo mesh yo konn mouri nan antretyen, pa nan konstriksyon — teknisyen fondatè a demenaje epi pèsonn lòt pa ka antre nan woutè yo, kidonk ekri tout bagay epi prepare yon dezyèm moun depi premye jou a. Lòt echèk silansye a se bati kote siyal la rive fasil olye kote moun yo manke aksè toutbon.",
    "pairsWith": [
      "digital-literacy",
      "emergency-preparedness"
    ],
    "tasks": [
      {
        "name": "Fè kat bezwen yo ak twou yo",
        "description": "Idantifye ki blòk ki manke yon aksè moun ka peye e ki kote siyal la ta ka rive. Make bilding ki gen liy vizyon klè ak moun ki dakò resevwa ekipman. Sa a bay tout plan an fòm.",
        "hours": 4,
        "skills": [
          "èd teknik"
        ]
      },
      {
        "name": "Jwenn liy entènèt prensipal la",
        "description": "Regle yon sous koneksyon pou pataje — yon liy biznis yo bay kado, yon antant ak yon konpayi entènèt, oswa yon lyezon ak yon rezo kominotè. Konfime kontra a pèmèt pataje a.",
        "hours": 5,
        "skills": [
          "pale ak moun",
          "èd teknik"
        ]
      },
      {
        "name": "Jwenn moun ki konn teknoloji",
        "description": "Jwenn moun ki alèz ak rezo ki ka konfigire woutè epi depane. Ou bezwen sèlman de ou twa pou kòmanse, plis moun ki vle aprann.",
        "hours": 3,
        "skills": [
          "pale ak moun",
          "èd teknik"
        ]
      },
      {
        "name": "Jwenn ekipman yo epi konfigire yo",
        "description": "Ranmase woutè, pwen mesh, ak antèn gras ak don oswa yon ti kòb. Konfigire yo pou yon rezo louvri oswa pataje senp, epi teste kouvèti a.",
        "hours": 10,
        "skills": [
          "èd teknik"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Jwenn kay pou resevwa pwen yo",
        "description": "Mete pwen yo kote yo pwolonje rezo a — do kay, fenèt anlè, ak galri ki gen kouran ak pèmisyon. Pran yon dakò alekri ak chak kay, epi peye ti kòb kouran an.",
        "hours": 5,
        "skills": [
          "pale ak moun"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Mete règ sèvi ak règ prive yo",
        "description": "Afiche règ senp, pa kenbe dosye sou sa moun ap fè sou rezo a, epi di klè yon rezo louvri pa prive. Montre moun k ap sèvi yo pratik sekirite debaz tankou HTTPS ak VPN.",
        "hours": 2,
        "skills": [
          "ekri"
        ]
      },
      {
        "name": "Okipe rezo a epi grandi l",
        "description": "Tcheke pwen yo regilyèman, ranplase materyèl ki mouri, epi ajoute kouvèti lè nouvo kay antre. Ekri tout enstalasyon an pou lòt moun ka ede okipe l.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "èd teknik"
        ],
        "follows": [
          3,
          4
        ]
      }
    ]
  },
  {
    "id": "mental-health-peer-support",
    "name": "Wonn èd pou sante mantal",
    "purpose": "Ofri yon espas ki an sekirite, ki regilye, kote se manm yo menm k ap mennen — pou moun pataje e soutni youn lòt. Li mache ansanm ak swen pwofesyonèl, li pa ranplase l.",
    "whoItServes": "Nenpòt moun k ap fè fas ak estrès, izolman, lapenn, oswa pwoblèm sante mantal, e ki vle chita ak moun ki pase menm bagay.",
    "whatYoullNeed": "Animatè ki byen prepare, yon espas prive, ak limit klè ansanm ak yon plan pou voye moun ki nan kriz jwenn èd. Èd ant moun parèy mache ansanm ak swen sante mantal pwofesyonèl — li pa ranplase l. Animatè yo pa sikològ, e fòk toujou gen yon plan klè pou konekte nenpòt moun ki nan kriz ak pwofesyonèl kalifye oswa sèvis ijans.",
    "setupHours": 21,
    "defaultCategory": "emotional_support",
    "firstSteps": "Premye konvèsasyon ou yo se ak moun ki ta ka mennen wonn lan ak moun k ap bay swen sante mantal nan zòn nan — yon klinik, yon liy kriz, oswa yon sikològ ki dakò resevwa moun ou voye anvan premye wonn lan janm fèt. Pa ouvri pòt yo toutotan animatè yo pa prepare e tout moun pa ka di klè sa wonn lan ye ak sa li pa ye.",
    "commonPitfalls": "Echèk ki danjere a se derape dousman: yon wonn ki cho vin tounen sèl soutyen yon moun genyen, animatè yo kòmanse jwe sikològ, epi pa gen okenn plan pou nwit yon moun nan yon vre kriz. Echèk ki pi silansye a se animatè ki bouke nèt — si moun k ap kenbe espas la pa gen soutyen pa yo, wonn lan kraze anvan yon ane.",
    "pairsWith": [
      "neighborhood-care-network",
      "disability-support-network",
      "harm-reduction-supplies"
    ],
    "learnMore": [
      "who-sees-what",
      "lurking-ok"
    ],
    "tasks": [
      {
        "name": "Chèche animatè yo epi prepare yo",
        "description": "Jwenn moun ki cho e ki solid, epi fè yo fini yon kou sou èd ant moun parèy oswa koute aktif. Di klè: animatè yo se parèy k ap kenbe espas la, yo pa doktè k ap bay dyagnostik oswa tretman.",
        "hours": 5,
        "skills": [
          "mennen reyinyon",
          "pale ak moun"
        ]
      },
      {
        "name": "Fikse sa wonn lan ye ak sa li pa ye",
        "description": "Tabli sa a: se èd ant moun parèy, se pa terapi ni swen pou kriz. Ekri sa wonn lan la pou li ak sa ki pa wòl li, pou tout moun konnen sa pou yo atann.",
        "hours": 3,
        "skills": [
          "ekri"
        ]
      },
      {
        "name": "Prepare plan pou lè yon moun nan kriz",
        "description": "Prepare etap klè pou lè yon moun depase sa parèy ka pote: kijan pou konekte l dousman ak èd pwofesyonèl oswa liy kriz, ak ki lè pou rele sèvis ijans. Kenbe yon lis kontak zòn nan ajou toupre men.",
        "hours": 3,
        "skills": [
          "ekri"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Jwenn yon espas prive e an sekirite",
        "description": "Jwenn yon sal trankil, konfòtab, kote pawòl rete andedan, pou moun ka pale lib. Menm kote a chak fwa ede moun santi yo an sekirite pou yo tounen.",
        "hours": 2,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Mete règ yo: sa ki di la rete la",
        "description": "Mete tout moun dakò: sa ki di la rete la, pèsonn pa bay konsèy sof si yo mande, pèsonn pa koupe pawòl, e chak moun gen dwa pa pale. Pataje règ sa yo nan kòmansman chak seyans.",
        "hours": 3,
        "skills": [
          "mennen reyinyon",
          "ekri"
        ]
      },
      {
        "name": "Fikse lè yo epi fè moun konnen",
        "description": "Chwazi yon lè fiks, kenbe gwoup la yon gwosè ou ka jere, epi pale de li yon fason ki montre se yon bagay nòmal. Fè konnen li gratis e li louvri.",
        "hours": 3,
        "skills": [
          "pale ak moun",
          "òganize"
        ],
        "follows": [
          0,
          3
        ]
      },
      {
        "name": "Soutni animatè yo pou yo pa bouke nèt",
        "description": "Fè randevou regilye pou animatè yo lonmen sa yo pote ak lage l. Fè yo mennen youn apre lòt, epi asire yo gen pwòp soutyen pa yo tou.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "mennen reyinyon"
        ]
      }
    ]
  },
  {
    "id": "community-cleanup",
    "name": "Netwayaj katye a ak espas vèt yo",
    "purpose": "Ranmase fatra, remete teren vid ak pak neglije yo an fòm, epi kreye espas vèt pou tout moun.",
    "whoItServes": "Tout vwazinaj la — yon espas ki pi pwòp, ki pi an sekirite, ki pi vèt, se tout moun ki jwenn ladan l.",
    "whatYoullNeed": "Moun ki vin mete men, materyèl, pèmisyon pou chak teren, ak yon plan pou fatra a. Teren neglije ka kache vrè danje — pa janm ranmase zegwi oswa pwodui chimik enkoni ak men ou; sèvi ak zouti ak yon bwat di pou zegwi, epi jete sa ki danjere yo dapre règ zòn ou an.",
    "setupHours": 10,
    "defaultCategory": "infrastructure",
    "suggestsWorkDays": true,
    "firstSteps": "Mache nan katye a ak moun ki rete pi pre kote neglije yo — yo konnen ki teren ki konte, ki moun ki mèt yo, ak sa ki te eseye deja — epi gade si lavil la oswa yon gwoup zanmi pak la deja ap fè netwayaj ou ka mete men ladan l. Regle koze mèt tè a, pèmisyon an, ak kote fatra a prale anvan ou chwazi yon dat.",
    "commonPitfalls": "Netwayaj echwe de fason: sak fatra yo rete sou twotwa a pandan plizyè semèn paske pèsonn pa t regle ranmasaj la, epi yon teren ki te fin netwaye byen bèl tounen raje ankò rive otòn nan paske pa t gen okenn plan apre gwo jounen an. E yon moun ki lonje men toutouni sou yon zegwi ka fè yon bon maten fini lopital.",
    "pairsWith": [
      "community-garden",
      "community-composting"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Jwenn teren yo epi chwazi sa ki pi enpòtan",
        "description": "Mache nan zòn nan epi fè lis kote ki bezwen atansyon — kwen plen fatra, teren raje, pak neglije. Mete an premye sa k ap fè plis diferans e ki posib.",
        "hours": 1.5,
        "skills": []
      },
      {
        "name": "Jwenn pèmisyon ak yon plan pou fatra a",
        "description": "Konfime ki moun ki mèt chak teren epi jwenn pèmisyon. Regle davans ki jan fatra ak debri yo ap soti — òganize yon kontenè oswa yon ranmasaj lavil la pou sak yo pa rete anpile.",
        "hours": 2,
        "skills": [
          "pale ak moun",
          "papye"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Rasanble materyèl ak ekipman sekirite",
        "description": "Rasanble gan, sak, pens pou ranmase, ak jile ki klere. Mete yon bwat di pou zegwi ladan l, ak yon plan pou nenpòt bagay danjere ki parèt.",
        "hours": 1.5,
        "skills": [
          "kondwi"
        ]
      },
      {
        "name": "Rasanble moun epi òganize yo",
        "description": "Fè nouvèl la gaye epi fè moun mete non yo. Bay chak ekip yon moun k ap mennen l ak yon zòn, konsa jounen an òganize olye li an dezòd.",
        "hours": 2,
        "skills": [
          "pale ak moun",
          "òganize"
        ]
      },
      {
        "name": "Fè konbit netwayaj la",
        "description": "Fè konbit la, veye pou ekip yo an sekirite e pou yo bwè dlo, epi fete rezilta a ansanm. Pran foto anvan-apre pou ankouraje moun vini pwochen fwa a.",
        "hours": 3,
        "skills": [
          "òganize",
          "fè foto"
        ],
        "follows": [
          1,
          2,
          3
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "free-tax-prep",
    "name": "Klinik taks gratis ak konsèy sou lajan",
    "purpose": "Ede vwazen ki fè ti lajan deklare taks yo gratis epi jwenn avantaj taks ak lajan retou ki pou yo.",
    "whoItServes": "Travayè ki fè ti lajan, fanmi ki kalifye pou avantaj taks, granmoun aje, ak etidyan.",
    "whatYoullNeed": "Moun ki byen prepare e ki sètifye pou fè deklarasyon, yon espas, òdinatè, ak yon sistèm randevou. Se moun ki sètifye atravè yon rezo rekonèt ki dwe prepare deklarasyon yo — klinik sa a ede ak deklarasyon senp, se pa ak sitiyasyon konplike ki mande yon pwofesyonèl taks.",
    "setupHours": 28,
    "defaultCategory": "skilled_labor",
    "suggestsWorkDays": true,
    "firstSteps": "Premye kout fil ou se pou yon rezo deklarasyon gratis ki byen etabli tankou VITA — pale ak kowòdonatè yo sou delè sètifikasyon, lojisyèl, ak sa yon nouvo sit bezwen, paske travay sa a pa fèt pou kouri l pou kont ou. Apre sa, pale ak vwazen ou vle ede yo sou ki lè yo ka vini toutbon ak sa ki te anpeche yo deklare anvan.",
    "commonPitfalls": "Yon sèl deklarasyon mal fèt ka fè yon fanmi pèdi lajan retou li oswa lakòz leta vin fouye dosye li — se poutèt sa liy pwojè sa a pa janm dwe janbe a se kite moun ki pa sètifye prepare taks. Echèk ki pi dous yo: louvri an mas alòske sètifikasyon an pran plizyè mwa, epi yon moun pran bis la pou yo voye l tounen pou yon dokiman pèsonn pa t di l pote.",
    "pairsWith": [
      "legal-aid-clinic",
      "solidarity-fund"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Fè preparatè yo fòme epi sètifye",
        "description": "Fè moun k ap ede yo fini yon sètifikasyon rekonèt pou preparasyon taks gratis (tankou VITA, bò kote IRS) pou deklarasyon yo egzak e byen otorize. Sa a pa negosyab.",
        "hours": 10,
        "recurringCadence": "cycle",
        "skills": [
          "kontablite"
        ]
      },
      {
        "name": "Mete tèt ansanm ak yon rezo deklarasyon gratis",
        "description": "Kole ak yon rezo ki byen etabli pou lojisyèl, èd, ak yon non moun ka fè konfyans. Se yo ki bay zouti deklarasyon ak kontwòl kalite ou pa ta dwe bati pou kont ou.",
        "hours": 4,
        "skills": [
          "pale ak moun",
          "papye"
        ]
      },
      {
        "name": "Prepare yon espas ak ekipman",
        "description": "Jwenn yon lokal ak òdinatè, entènèt ki mache byen, ak ase espas prive pou moun pataje enfòmasyon lajan yo san kè sote.",
        "hours": 3,
        "skills": [
          "èd teknik"
        ]
      },
      {
        "name": "Monte yon sistèm randevou ak akèy",
        "description": "Kreye randevou ak yon lis klè pou dokiman moun dwe pote (pyès idantite, papye revni, ansyen deklarasyon). Sa evite vwayaj pou granmesi ak long tan ap tann.",
        "hours": 3,
        "skills": [
          "òganize",
          "antre done"
        ]
      },
      {
        "name": "Fè vwazen ki kalifye yo konnen",
        "description": "Fè nouvèl la gaye, ak aksan sou sa: deklare ka debloke lajan retou ak avantaj anpil moun ap rate. Rive jwenn travayè, fanmi, ak granmoun aje ki souvan kalifye.",
        "hours": 3,
        "recurringCadence": "cycle",
        "skills": [
          "pale ak moun",
          "desen grafik"
        ],
        "follows": [
          3
        ]
      },
      {
        "name": "Pwoteje done ak vi prive moun yo",
        "description": "Pwoteje chak ti moso done pèsonèl ak done lajan: aparèy ki klete, okenn kopi ki pa nesesè, papye fèmen anba kle, ak yon règ klè sou konbyen tan yo kenbe yo e ki lè yo detwi yo.",
        "hours": 3,
        "skills": [
          "èd teknik"
        ]
      },
      {
        "name": "Ofri yon swivi sou zafè lajan",
        "description": "Pou moun ki vle, mete yo an kontak ak èd pou fè bidjè, kont labank ki an sekirite, ak yon kout je sou èd leta yo ka jwenn. Kite sa opsyonèl epi voye sitiyasyon konplike yo bay pwofesyonèl kalifye.",
        "hours": 2,
        "skills": [
          "kontablite"
        ]
      }
    ]
  },
  {
    "id": "community-market",
    "name": "Mache kominotè / Estann manje gratis",
    "purpose": "Fè yon estann regilye, gratis oswa bay-sa-ou-kapab, k ap separe legim fre ak manje debaz bay vwazen yo.",
    "whoItServes": "Vwazen ki pa toujou gen ase manje ak moun nan zòn kote manje fre pa fasil jwenn pou yon pri ki posib.",
    "whatYoullNeed": "Yon sous manje fre, yon estann oswa yon kote, moun ki vin mete men, ak yon orè regilye.",
    "setupHours": 15,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Kòmanse ak konvèsasyon sou sous manje yo — ale wè fèm, makèt, ak jaden kominotè pou aprann ki sipli ki egziste vre e sou ki ritm — epi pale ak vwazen nan zòn ou ta sèvi a sou kote yo deja pase ak ki manje yo ta pote lakay yo toutbon. Chwazi kote a ansanm ak moun k ap sèvi avè l yo, pa nan plas yo.",
    "commonPitfalls": "Yon estann ki parèt lè l vle montre moun yo sispann konte sou li — konstans konte plis pase abondans. Lòt echèk yo: sous manje ki seche apre premye mwa antouzyasm lan, ak nenpòt bagay sou tab la (papye pou ranpli, kesyon, triye moun) ki fè pran manje a santi tankou w ap mande yon favè nan yon biwo.",
    "pairsWith": [
      "gleaning-network",
      "bulk-buying-coop",
      "community-garden"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Jwenn sous manje fre ak pwodui yo",
        "description": "Jwenn manje atravè ranmase rekòt ki rete nan jaden, jaden kominotè, kado fèm ak makèt bay, ak acha an gwo. Vize varyete ak konstans pou estann lan pa rete vid.",
        "hours": 3,
        "skills": [
          "pale ak moun",
          "kondwi"
        ]
      },
      {
        "name": "Chwazi yon kote epi monte estann lan",
        "description": "Chwazi yon kote ki vizib, fasil pou rive, ak pèmisyon — arebò yon pak, yon pakin, oswa yon estasyon. Prepare tab, lonbraj, ak pankat.",
        "hours": 2,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Deside ki jan estann lan ap mache",
        "description": "Chwazi gratis nèt, bay-sa-ou-kapab, oswa yon melanj. Kèlkeswa chwa a, fè sèten pèsonn pa janm tounen san manje paske li pa ka peye.",
        "hours": 1,
        "skills": [
          "mennen reyinyon"
        ]
      },
      {
        "name": "Ranje etalaj, konsèvasyon, ak sekirite manje",
        "description": "Kenbe legim yo fre e byen prezante, manyen manje a san danje, epi gen glasyè oswa lonbraj pou jou cho yo. Jete tout sa ki gate.",
        "hours": 2,
        "skills": [
          "sekirite manje"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Rasanble moun epi fè orè a",
        "description": "Jwenn moun pou al chèche manje a, monte estann lan, kenbe l, epi demonte l. Bay wòl klè pou chak jou mache.",
        "hours": 2,
        "skills": [
          "òganize",
          "pale ak moun"
        ]
      },
      {
        "name": "Fè nouvèl la gaye epi fikse yon orè fiks",
        "description": "Chwazi yon jou ak yon lè ki pa chanje epi fè tout moun konnen. Se lè moun ka konte sou li yon estann tounen yon poto mitan.",
        "hours": 2,
        "skills": [
          "pale ak moun",
          "desen grafik"
        ],
        "follows": [
          1,
          2
        ]
      },
      {
        "name": "Fè jou mache a epi okipe rès manje a",
        "description": "Monte estann lan, separe manje a ak kè kontan san jije pèsonn, epi voye rès legim yo bay frijidè kominotè, gadmanje, oswa kwizin kominotè pou anyen pa gaspiye.",
        "hours": 3,
        "skills": [
          "òganize"
        ],
        "follows": [
          0,
          3,
          4
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "welcome-wagon",
    "name": "Bèl akèy: nouvo vwazen ak nouvo paran",
    "purpose": "Akeyi moun ki fèk vini ak nouvo paran ak èd pratik, enfòmasyon lokal, ak yon vrè byenvini nan kominote a.",
    "whoItServes": "Moun ki fèk demenaje, paran tou nèf ak paran k ap tann pitit, ak nenpòt moun ki bezwen yon kòmansman zanmitay.",
    "whatYoullNeed": "Moun ki vin mete men, ti gid enfòmasyon, kado byenvini moun bay, ak yon fason pou nouvo moun rive jwenn ou.",
    "setupHours": 10,
    "defaultCategory": "emotional_support",
    "firstSteps": "Pale anvan ak moun ki rankontre nouvo vini yo anvan ou: mèt kay yo, sekretarya lekòl yo, klinik yo, fanmsaj ak enfimyè timoun yo — sou ki jan yo ta voye yon moun jwenn ou ak konsantman li. Apre sa, mande kèk moun ki fèk rive ak kèk nouvo paran sa ki ta ede yo vre nan premye mwa a, epi bati ti gid la ak panyen an sou repons yo.",
    "commonPitfalls": "Kote sa a mal vire, se lè li santi tankou siveyans — parèt san avèti devan pòt yon moun ou pa konnen, oswa pase non yon moun san konsantman li, fè yon byenvini tounen yon entwizyon. Li fennen tou san bri lè premye moun ki t ap akeyi yo bouke nèt e nouvo vini yo pase mwa san pèsonn pa wè yo.",
    "pairsWith": [
      "newcomer-translation-network",
      "diaper-hygiene-bank",
      "neighborhood-care-network"
    ],
    "learnMore": [
      "invite-someone"
    ],
    "tasks": [
      {
        "name": "Deside ki moun w ap akeyi e ki jan",
        "description": "Chwazi sou kiyès w ap konsantre — moun ki fèk demenaje, nouvo paran, oswa toude — ak ki fòm byenvini an pran (yon vizit, yon panyen, yon kout fil). Se moun nan ki dwe di wi anvan; pa janm foure kò.",
        "hours": 1,
        "skills": [
          "mennen reyinyon"
        ]
      },
      {
        "name": "Monte yon ti gid enfòmasyon lokal",
        "description": "Rasanble yon gid klè sou sa ki nan zòn nan — transpò, lekòl, swen sante, kote pou jwenn èd — ak rezo youn ede lòt kominote a. Ofri l nan lang moun pale nan zòn ou an.",
        "hours": 3,
        "skills": [
          "ekri",
          "tradui"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Prepare panyen byenvini yo",
        "description": "Mete bagay itil ansanm — manje debaz, atik pou kay la, e pou nouvo paran, kèk nesesite tibebe oswa yon manje kwit lakay. Jwenn yo nan kado moun bay.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "pale ak moun",
          "òganize"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Jwenn moun k ap akeyi epi prepare yo",
        "description": "Jwenn moun ki emab epi montre yo akeyi ak chalè e ak respè, santi si yon moun vle kontak, e pa janm fòse ni fouye.",
        "hours": 2,
        "skills": [
          "pale ak moun",
          "montre moun"
        ]
      },
      {
        "name": "Mete yon fason pou moun rive jwenn ou",
        "description": "Kreye fason senp pou moun vin jwenn ou oswa pou yo di wi — atravè mèt kay, klinik, lekòl, oswa yon ti fèy kote moun ekri non yo si yo vle. Respekte vi prive nan tout chemen an.",
        "hours": 2,
        "skills": [
          "òganize",
          "antre done"
        ],
        "follows": [
          0
        ]
      }
    ]
  },
  {
    "id": "library-of-things",
    "name": "Bibliyotèk bagay yo",
    "purpose": "Pataje bagay kay ak bagay fèt moun raman bezwen posede — materyèl kwizin, afè fèt ak kanpin, ekipman tibebe, pwojektè, ak plis toujou: pran, sèvi, pote tounen.",
    "whoItServes": "Tout moun — li fè lajan rete nan pòch, li retire ankonbreman, li diminye gaspiyaj.",
    "whatYoullNeed": "Yon kote pou mete bagay yo, bagay moun bay, yon katalòg ak yon fèy soti, ak de bibliyotekè.",
    "setupHours": 21,
    "defaultCategory": "infrastructure",
    "firstSteps": "Anvan ou ranmase yon sèl bagay, mande manm yo sa yo ta pran vre — ti sondaj sa a se fondasyon pwojè a — epi pale ak bibliyotèk piblik la oswa yon sant kominotè sou kote pou l rete, paske yon enstitisyon moun fè konfyans regle pwoblèm espas ak pwoblèm konfyans ou yon sèl kou. Jwenn de bibliyotekè ou yo anvan bagay yo kòmanse rive, pa apre.",
    "commonPitfalls": "Bibliyotèk bagay mouri anba ankonbreman: di wi ak chak kado plen sal la ak machin fè pen kraze pèsonn pa vle, pandan machin lave gwo presyon tout moun te mande a poko janm rive. Lòt sa k touye l la se lè ki pa fiks — si moun pa ka konte sou ki lè pou pran ak pote tounen, y ap tou tounen achte san fè bri.",
    "pairsWith": [
      "tool-lending-library",
      "toy-library",
      "free-store"
    ],
    "learnMore": [
      "confirm-exchange"
    ],
    "tasks": [
      {
        "name": "Sonde sa kominote a ta vle pran",
        "description": "Mande manm yo sa yo ta sèvi avè l men yo pa ta renmen achte — tab pliyan, yon gwo bòl pou ponch, yon tant, yon machin netwaye tapi, yon pousèt tibebe. Repons yo fikse premye envantè a.",
        "hours": 2,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Jwenn yon kote ak lè ouvèti",
        "description": "Jwenn yon amwa, yon sal, oswa yon kontenè pou kenbe bagay yo, epi fikse lè fiks pou pran ak pote tounen pou tout bagay rete fasil.",
        "hours": 3,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Ranmase, netwaye, epi teste bagay yo",
        "description": "Rasanble kado yo, apre sa netwaye, teste, epi tcheke chak bagay pou sekirite. Mete sou kote tout sa ki kraze, ki nan lis rapèl, oswa ki pa pwòp.",
        "hours": 5,
        "skills": [
          "kondwi"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Fè katalòg ak foto envantè a",
        "description": "Anrejistre chak bagay ak yon foto ak eta li nan yon fèy kalkil oswa yon aplikasyon swivi. Nimewote bagay yo pou yo fasil swiv, antre-soti.",
        "hours": 4,
        "skills": [
          "antre done",
          "fè foto"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Ekri règ yo sou baz konfyans",
        "description": "Fikse konbyen tan yon bagay ka rete deyò, konbyen yon moun ka pran, ak yon règ retou ki gen kè dous. Bati l sou konfyans, pa sou lajan amann, epi note ki bagay ki mande plis swen oswa netwayaj.",
        "hours": 2,
        "skills": [
          "ekri"
        ]
      },
      {
        "name": "Monte fèy soti a epi prepare bibliyotekè yo",
        "description": "Kreye yon fèy soti senp (non, kontak, bagay la, dat pou tounen) ak yon foto rapid eta a. Pase katalòg la ak tout demach la an revi ak moun k ap ede yo.",
        "hours": 3,
        "skills": [
          "antre done",
          "montre moun"
        ],
        "follows": [
          3,
          4
        ]
      },
      {
        "name": "Okipe, netwaye, epi grandi koleksyon an",
        "description": "Netwaye ak enspekte bagay ki tounen yo, repare sa ou kapab, epi ajoute bagay moun mande plis yo tikras pa tikras.",
        "hours": 2,
        "skills": [
          "repare"
        ],
        "recurringCadence": "session"
      }
    ]
  },
  {
    "id": "laundry-shower-access",
    "name": "Aksè lave rad ak douch",
    "purpose": "Bay aksè gratis pou lave rad ak pran douch pou moun ka rete pwòp ak tout diyite yo.",
    "whoItServes": "Vwazen ki san kay, moun ki pa gen machin oswa dlo k ap mache lakay yo, ak fanmi ki fè ti lajan.",
    "whatYoullNeed": "Aksè ak machin ak douch (yon kote ki resevwa pwojè a oswa yon inite mobil), materyèl, ak moun ki vin mete men. Diyite ak vi prive moun yo pase anvan tout bagay — pa mande okenn enfòmasyon pèsonèl pou moun sèvi ak kote a, kenbe espas douch yo prive e an sekirite, epi swiv règ sante lokal yo pou enstalasyon pataje oswa mobil.",
    "setupHours": 19,
    "defaultCategory": "infrastructure",
    "suggestsWorkDays": true,
    "firstSteps": "Kòmanse ak de seri konvèsasyon: ak vwazen ki san kay yo ak moun k ap travay nan lari avèk yo, sou ki lè ak ki kote ki ta mache vre — epi ak yon mèt lesiv, yon jim, oswa yon legliz ki gen douch, sou resevwa pwojè a. Konvèsasyon sa a delika; di klè ki moun k ap vini epi regle atant sou vi prive, netwayaj, ak orè anvan premye moun nan rive.",
    "commonPitfalls": "Pwojè sa a mouri lè relasyon ak mèt kote a gate — yon sèl move rankont san okenn pwotokòl dèyè l, epi espas la pèdi — oswa lè orè a chanje sitèlman moun travèse lavil pou jwenn yon pòt fèmen. E chak papye ou egzije devan pòt la fè yon moun ki te bezwen yon douch plis pase ou te bezwen non li an vire tounen.",
    "pairsWith": [
      "free-haircut",
      "cooling-warming-center",
      "diaper-hygiene-bank"
    ],
    "tasks": [
      {
        "name": "Jwenn aksè ak machin ak douch",
        "description": "Mete tèt ansanm ak yon lesiv, yon jim, yon legliz, yon sant rekreyasyon, oswa ranje yon inite mobil. Konfime lè ki solid ak yon espas ki bay vi prive.",
        "hours": 4,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Jwenn materyèl yo",
        "description": "Rasanble detèjan, sèvyèt pwòp, savon, chanpou, ak lòt pwodui twalèt nan kado moun bay oswa yon ti bidjè. Mete kèk rad pwòp si ou kapab.",
        "hours": 3,
        "skills": [
          "pale ak moun",
          "kondwi"
        ]
      },
      {
        "name": "Monte yon sistèm tou ak lè",
        "description": "Kreye yon fason jis pou pran yon chaj lesiv oswa yon tou douch, pou tan ap tann rete rezonab e pou chak moun jwenn tou pa l.",
        "hours": 3,
        "skills": [
          "òganize",
          "antre done"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Fikse règ ijyèn ak sekirite",
        "description": "Fikse woutin netwayaj ant chak moun, asire espas douch yo prive e an sekirite, epi pwoteje diyite ak sekirite tout moun depi nan kòmansman rive nan bout.",
        "hours": 3,
        "skills": [
          "ekri"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Jwenn moun epi prepare yo",
        "description": "Jwenn moun pou akeyi vizit yo, okipe materyèl la, ak netwaye ant chak pasaj. Montre yo trete chak moun ki vini ak chalè ak respè.",
        "hours": 3,
        "skills": [
          "pale ak moun",
          "montre moun"
        ],
        "follows": [
          3
        ]
      },
      {
        "name": "Fikse yon orè epi fè nouvèl la gaye",
        "description": "Chwazi lè ki pa chanje epi fè moun k ap travay nan lari yo, kote moun san kay pase nwit yo, ak vwazen ki nan lari yo konnen ki lè ak ki kote sa ap fèt.",
        "hours": 3,
        "skills": [
          "pale ak moun"
        ],
        "follows": [
          0
        ]
      }
    ]
  },
  {
    "id": "voter-registration",
    "name": "Kanpay pou enskri votè ak fè vwa tout moun konte",
    "purpose": "Enskri votè epi ede moun patisipe nan eleksyon ak desizyon lokal yo — san pran pou okenn pati, nèt.",
    "whoItServes": "Moun ki gen dwa vote, sitou sa yo ki depi lontan pa byen reprezante nan biwo vòt yo.",
    "whatYoullNeed": "Moun ki byen prepare, materyèl enskripsyon, règ egzak, ak bon kote. Kenbe kanpay la san okenn pati nèt epi swiv tout lwa eleksyon ak enskripsyon yo ak presizyon — bay enfòmasyon egzak sèlman e pa janm fè kanpay pou yon pati oswa yon kandida.",
    "setupHours": 16,
    "defaultCategory": "organizing",
    "firstSteps": "Anvan pèsonn mete yon tab, pale ak biwo eleksyon zòn ou an — y ap di w egzakteman sa yon kanpay enskripsyon gen dwa fè ak sa l pa gen dwa fè, e kèk kote egzije preparasyon oswa enskripsyon davans. Apre sa, kontakte League of Women Voters oswa yon lòt gwoup san pati ki byen etabli; sèvi ak materyèl ak eksperyans yo pi bon lontan pase aprann lwa eleksyon nan eseye-tonbe.",
    "commonPitfalls": "Echèk ki pa padonab yo se sa ki legal yo: yon pil fòmilè ranpli ki bliye nan kòf yon machin jouk dat limit lan pase fè chak moun ki te fè w konfyans pèdi vòt li, e yon sèl moun k ap vante yon kandida ka sal tout kanpay la. Erè ki pi sibtil la: separe kat enskripsyon san janm di ki kote ni ki jan pou vote toutbon.",
    "pairsWith": [
      "newcomer-translation-network",
      "legal-aid-clinic"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Aprann règ pou kanpay enskripsyon",
        "description": "Chèche konnen lwa zòn ou an sou enskri votè: dat limit, sa moun k ap ede yo gen dwa fè ak sa yo pa gen dwa fè, ki jan fòmilè yo dwe manyen, ak règ pyès idantite. Swiv yo mo pou mo se baz la.",
        "hours": 3,
        "skills": [
          "papye"
        ]
      },
      {
        "name": "Prepare moun yo pou rete san pati",
        "description": "Montre moun yo ede tout moun enskri kèlkeswa opinyon yo, e pa janm vante yon pati oswa yon kandida. Rete san pati pwoteje kanpay la ak konfyans kominote a.",
        "hours": 3,
        "skills": [
          "montre moun"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Rasanble materyèl ak enfòmasyon egzak",
        "description": "Rasanble fòmilè enskripsyon ak enfòmasyon fre ki byen tcheke sou dat limit, règ pyès idantite, biwo vòt, ak opsyon vote pa lapòs. Move enfòmasyon fè plis mal pase okenn.",
        "hours": 2,
        "skills": [
          "ekri"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Chwazi kote ki gen anpil pasaj",
        "description": "Mete tab la kote moun ki gen dwa vote deja rasanble — mache, estasyon, inivèsite, evènman kominote a — ak tout pèmisyon ki nesesè.",
        "hours": 2,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Kenbe tab enskripsyon an",
        "description": "Kenbe tab la, ede moun enskri san erè, epi depoze fòmilè yo vit anndan dat limit legal yo. Kenbe yon ton akeyan e klè.",
        "hours": 4,
        "skills": [
          "pale ak moun"
        ],
        "follows": [
          1,
          2,
          3
        ],
        "recurringCadence": "event"
      },
      {
        "name": "Ede ak pwochen etap yo",
        "description": "Pi lwen pase enskripsyon an, ede moun konnen ki jan, ki lè, ak ki kote pou yo vote, ansanm ak vote pa lapòs ak woulib pou rive nan biwo vòt. Enskri sèlman se poko patisipe.",
        "hours": 2,
        "skills": [
          "pale ak moun"
        ]
      }
    ]
  },
  {
    "id": "health-navigation",
    "name": "Rezo gid sante kominote a",
    "purpose": "Ede vwazen jwenn ak rive nan swen sante — klinik, asirans, preskripsyon, ak randevou.",
    "whoItServes": "Moun san asirans oswa ak asirans fèb, granmoun aje, moun ki fèk vini, ak nenpòt moun ki pèdi nan sistèm sante a.",
    "whatYoullNeed": "Gid ki byen prepare, yon lis kote ki bay swen, relasyon ak klinik yo, ak yon fason pou moun mande èd. Gid yo konekte moun ak swen — yo pa bay konsèy medikal ni dyagnostik. Voye tout kesyon klinik bay pwofesyonèl sante kalifye.",
    "setupHours": 26,
    "defaultCategory": "other",
    "firstSteps": "Kòmanse ak vizit nan klinik gratis ak klinik ki fè w peye selon mwayen ou — al di bonjou, mande ki kalite moun ou voye ki ede yo vre e kiyès ki depase yo, epi kite konvèsasyon sa yo plante lis ou a. Fikse limit lan anvan premye moun nan mande èd: gid yo okipe demach ak papye, chak kesyon klinik ale jwenn yon pwofesyonèl — kidonk konnen egzakteman ki liy enfimyè oswa ki klinik w ap lonje yo bay.",
    "commonPitfalls": "Kote ki file a se yon gid ak bon kè k ap glise nan bay konsèy medikal — yon senp “sa pa sanble grav” ka koute yon moun plizyè semèn swen li te bezwen. Sa echwe tou lè lis la vin vye san bri, voye moun nan klinik ki fèmen oswa nan sa ki pa egziste ankò; yon move nimewo koute yon moun ki te deja ap fè dènye eseye l.",
    "pairsWith": [
      "rides-transportation",
      "newcomer-translation-network",
      "mental-health-peer-support"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Monte yon lis kote ki bay swen",
        "description": "Rasanble klinik gratis ak klinik bon mache, doktè ki fè w peye selon mwayen ou, kote ki ede ak pri medikaman, opsyon dan ak je, ak swen sante mantal. Kenbe l ajou.",
        "hours": 6,
        "skills": [
          "antre done",
          "pale ak moun"
        ]
      },
      {
        "name": "Jwenn gid yo epi prepare yo",
        "description": "Jwenn moun epi prepare yo pou konekte moun ak swen — pa pou bay konsèy medikal. Travay yo se oryante ak regle demach, ak tout kesyon klinik voye bay pwofesyonèl.",
        "hours": 5,
        "skills": [
          "pale ak moun",
          "montre moun"
        ]
      },
      {
        "name": "Monte yon fason pou moun mande èd",
        "description": "Kreye yon fason prive, san baryè, pou moun mande èd epi esplike sitiyasyon yo, ak opsyon telefòn ak fasafas, pa sou entènèt sèlman.",
        "hours": 3,
        "skills": [
          "òganize"
        ]
      },
      {
        "name": "Ede moun jwenn asirans",
        "description": "Ede moun konprann ak aplike pou pwoteksyon yo kalifye pou li (tankou Medicaid oswa plan mache asirans yo) epi rasanble dokiman ki nesesè yo.",
        "hours": 4,
        "recurringCadence": "month",
        "skills": [
          "papye"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Ede ak randevou ak preskripsyon",
        "description": "Ede pran randevou, mete rapèl, demele pri medikaman, epi konekte moun ak pwojè woulib la pou transpò rive nan swen.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "òganize"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Fikse règ vi prive pou enfo sante",
        "description": "Trete tout detay sante kòm bagay ki delika anpil: pran minimòm nan, kenbe l an sekirite, epi pa janm pataje san konsantman. Prepare gid yo sou konfidansyalite.",
        "hours": 2,
        "skills": [
          "ekri"
        ]
      },
      {
        "name": "Bati relasyon ak klinik yo",
        "description": "Bati relasyon ak klinik ak doktè zòn nan pou voye moun pi fasil e pou aprann sou nouvo swen bon mache lè yo louvri.",
        "hours": 3,
        "skills": [
          "pale ak moun"
        ]
      }
    ]
  },
  {
    "id": "toy-library",
    "name": "Bibliyotèk jwèt ak materyèl pou jwe",
    "purpose": "Mete jwèt, jwèt sosyete, ak materyèl pou jwe disponib pou fanmi yo pran epi pote tounen, pou timoun yo jwenn varyete san fanmi an pa bezwen achte.",
    "whoItServes": "Fanmi ki gen timoun piti, sitou sa ki pa gen anpil mwayen; li koupe gaspiyaj ak dezòd nan kay tou.",
    "whatYoullNeed": "Yon kote pou sere jwèt yo, jwèt moun bay, yon katalòg ak yon fèy soti, materyèl netwayaj, ak moun pou okipe bibliyotèk la.",
    "setupHours": 10,
    "defaultCategory": "childcare",
    "firstSteps": "Pale ak fanmi ou vle sèvi yo — lè y ap chache timoun nan gadri, nan yon lè istwa, nan yon gwoup jwe — sou ki jwèt timoun yo depase pi vit e ki lè yo ta ka vini toutbon; apre sa, mande yon sant kominotè, yon legliz, oswa yon bibliyotèk piblik yon etajè oswa yon ti chanm. Jwenn yon moun ki konn okipe timoun ki dakò pran tcheke sekirite yo an men anvan jwèt yo kòmanse rive.",
    "commonPitfalls": "Bibliyotèk jwèt tonbe sou de bagay: sekirite ak pyès. Yon sèl jwèt yo te retire sou mache a, oswa yon ti pyès ki ka toufe yon timoun, ki pase nan filè a — konfyans fanmi yo kase nèt. Epi yon puzzle ki tounen ak yon pyès manke fè tout koleksyon an sanble ranblè nan kèk mwa. Enspeksyon sevè ak sache ki byen konte — se la tout jwèt la ye.",
    "pairsWith": [
      "library-of-things",
      "childcare-collective",
      "school-supply-program"
    ],
    "tasks": [
      {
        "name": "Jwenn yon kote ak lè louvri",
        "description": "Jwenn etajè nan yon sant kominotè, yon bibliyotèk, oswa yon espas pataje, epi fikse lè fiks pou pran jwèt ak pote yo tounen, pou fanmi yo ka planifye.",
        "hours": 1.5,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Kolekte, netwaye, tcheke jwèt yo",
        "description": "Kolekte jwèt moun bay yo, netwaye epi enspekte chak jwèt. Gade si yo pa retire l sou mache a, si pa gen pyès kase, si pa gen danje toufman, epi mete sou kote tout sa ki pa an sekirite pou timoun piti.",
        "hours": 3.5,
        "skills": [
          "kondwi",
          "okipe timoun"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Fè katalòg, mete nan sache ak tout pyès",
        "description": "Ekri chak jwèt nan katalòg la ak yon foto ak laj ki bon pou li, epi mete jwèt ki gen plizyè pyès nan sache ak kantite a ekri sou etikèt la, pou anyen pa disparèt. Bay chak atik yon nimewo pou swiv yo fasil.",
        "hours": 2,
        "skills": [
          "antre done",
          "fè foto"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Ekri regleman pou pran jwèt",
        "description": "Deside konbyen tan yon fanmi ka kenbe yon jwèt, konbyen jwèt alafwa, ak yon regleman dou pou jwèt ki tounen ak pyès manke. Kite l chita sou konfyans, san severite.",
        "hours": 1,
        "skills": [
          "ekri"
        ]
      },
      {
        "name": "Monte fèy soti a, montre ekip la",
        "description": "Fè yon fèy soti tou senp (non, kontak, nimewo jwèt la, dat pou l tounen), epi pase ak moun k ap ede yo sou katalòg la, woutin netwayaj la, ak regleman yo.",
        "hours": 2,
        "skills": [
          "antre done",
          "montre moun"
        ],
        "follows": [
          2,
          3
        ]
      }
    ]
  },
  {
    "id": "food-preservation",
    "name": "Kolektif pou konsève manje ak mete nan bokal",
    "purpose": "Montre epi fè mete-nan-bokal ak konsèvasyon an gwoup, pou rekòt sezon an dire e pou mwens manje gaspiye.",
    "whoItServes": "Moun k ap fè jaden, moun k ap ranmase rekòt ki rete, ak fanmi ki vle fè manje a kenbe tout ane a.",
    "whatYoullNeed": "Yon kwizin, materyèl pou mete nan bokal ak konsève, moun ki fò nan sa pou mennen, ak danre. Konsève manje lakay pote gwo risk pou sante, ata botilis, lè li fèt mal — toujou swiv gid aktyèl ki teste, ki soti nan yon sous serye, epi pa janm envante tan ni metòd pwosesis.",
    "setupHours": 18,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Jwenn konesans lan anvan kwizin nan: rele biwo agrikilti nan zòn nan oswa yon espesyalis konsèvasyon manje yo rekonèt, mande yo montre moun k ap mennen yo kijan oswa revize plan ou — epi pale ak moun k ap fè jaden ak moun k ap ranmase rekòt ki rete sou ki danre ki bay anpil e nan ki moman. Rezève kwizin nan dapre kalandriye rekòt la, pa lekontrè.",
    "commonPitfalls": "Echèk ki konte a envizib: yon bokal ki sele ak yon metòd envante, oswa ak yon resèt grann ki pa janm teste, ka pote botilis epi parèt bèl sou etajè a. Echèk òdinè a se kalandriye a — tomat mi lè pa yo, e yon kolektif ki fè premye seyans li an novanm pa konsève anyen.",
    "pairsWith": [
      "gleaning-network",
      "community-garden",
      "community-fridge"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Jwenn yon bon kwizin",
        "description": "Jwenn yon kwizin ki gen recho, espas sou kontwa, ak dlo pou pwosesis la ak netwayaj. Yon sal legliz, yon sant kominotè, oswa yon kwizin pwofesyonèl mache byen.",
        "hours": 2,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Aprann metòd ki san danje",
        "description": "Fè moun k ap mennen yo etidye metòd ki teste, ki chita sou rechèch, nan yon sous yo rekonèt (tankou yon inivèsite oswa biwo agrikilti). Mete-nan-bokal ki fèt mal ka bay gwo maladi; toujou swiv resèt ak tan pwosesis ki teste, egzakteman.",
        "hours": 4,
        "skills": [
          "sekirite manje",
          "fè manje"
        ]
      },
      {
        "name": "Rasanble materyèl ak bokal",
        "description": "Kolekte gwo chodyè pou beny dlo cho ak/oswa chodyè presyon, bokal, kouvèti, ak zouti — nan men moun ki bay oswa ak yon ti lajan. Tcheke chodyè presyon yo an bon eta pou travay san danje.",
        "hours": 3,
        "skills": [
          "pale ak moun",
          "kondwi"
        ]
      },
      {
        "name": "Jwenn danre",
        "description": "Fè rekòt sezon an antre: nan ranmase rekòt ki rete nan jaden, nan jaden yo, nan men kiltivatè, oswa nan gwo acha. Mete seyans yo lè danre yo anpil e bon mache.",
        "hours": 2,
        "recurringCadence": "cycle",
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Planifye seyans yo",
        "description": "Chwazi resèt ki mache ak danre a ak sa moun yo konn fè deja, epi òganize estasyon yo pou travay la mache san danje, san gaspiye tan.",
        "hours": 2,
        "recurringCadence": "session",
        "skills": [
          "fè manje",
          "òganize"
        ],
        "follows": [
          1,
          3
        ]
      },
      {
        "name": "Mennen seyans yo san danje",
        "description": "Mennen tout moun nan pwosesis la: fè respekte bon jan manipilasyon, tan pwosesis kòrèk yo, ak bokal ki byen sele. Fè l yon moman aprantisaj tou, pou konesans lan gaye.",
        "hours": 4,
        "skills": [
          "fè manje",
          "montre moun"
        ],
        "follows": [
          0,
          2,
          4
        ],
        "recurringCadence": "session"
      },
      {
        "name": "Separe manje a, kenbe nòt",
        "description": "Separe manje konsève a ant moun ki te vin mete men yo ak pwojè tankou “community fridge” la oswa “food pantry” a. Mete etikèt sou chak bokal ak sa k ladan l ak dat la, epi ekri sa ki te mache pou pwochen fwa.",
        "hours": 1,
        "recurringCadence": "session",
        "skills": [
          "òganize"
        ],
        "follows": [
          5
        ]
      }
    ]
  },
  {
    "id": "free-haircut",
    "name": "Jounen koupe cheve ak swen gratis",
    "purpose": "Bay koupe cheve ak ti swen gratis, pou diyite ak konfyans tounen, ak yon nouvo kòmansman.",
    "whoItServes": "Vwazen ki san kay, moun k ap chache travay, fanmi ki pa gen anpil mwayen, ak granmoun aje.",
    "whatYoullNeed": "Kwafè pwofesyonèl ki gen lisans e ki vle vin mete men, yon espas, materyèl, ak bon jan pwòpte.",
    "setupHours": 10,
    "defaultCategory": "skilled_labor",
    "suggestsWorkDays": true,
    "firstSteps": "Kòmanse ak de konvèsasyon: youn ak yon kwafè ki gen lisans ki dakò mennen yon kòlèg, youn ak moun ou vle sèvi yo — yon kote vwazen san kay pase nwit, yon sant akèy lajounen, oswa yon ekip k ap ede moun jwenn travay ka di w ki jou ak ki anbyans k ap fè moun alèz toutbon. Depi yon kwafè ak yon kote di wi, rès la se materyèl ak orè.",
    "commonPitfalls": "Pwojè sa a bite lè l santi tankou yon liy kote y ap lonje yon bagay ba ou, olye yon salon — koupe prese, moun pa gen mo sou stil la, telefòn deyò pou rezo sosyal. Mande chak moun sa li vle, kite foto yo si se pa moun nan ki mande, epi pa janm kite moun san lisans koupe pou fè plis moun pase; yon sèl pwoblèm ijyèn ka fini ak tout pwojè a.",
    "pairsWith": [
      "laundry-shower-access",
      "reentry-support"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Jwenn kwafè ki gen lisans",
        "description": "Chache pwofesyonèl ki vle vin bay talan yo. Moun ki gen lisans se sa k asire travay ki san danje, bon kalite, ak bon jan pwòpte.",
        "hours": 2.5,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Jwenn yon espas ki pwòp",
        "description": "Jwenn yon lokal ki gen dlo, bon limyè, ak sifas fasil pou netwaye — yon sant kominotè, yon salon apre lè travay, oswa yon legliz.",
        "hours": 1.5,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Rasanble materyèl",
        "description": "Rasanble machin pou koupe cheve, sizo, kap, peny, glas, ak bagay pou sèvi yon sèl fwa. Mete ti ekstra tankou jilèt ak atik twalèt pou moun pote ale lakay.",
        "hours": 2,
        "skills": [
          "pale ak moun",
          "kondwi"
        ]
      },
      {
        "name": "Regle pwòpte ak règ lisans yo",
        "description": "Mete yon woutin dezenfekte zouti ant chak moun, epi swiv règ zòn nan pou koupe cheve pou piblik la. Pwòpte pwoteje tout moun.",
        "hours": 1.5,
        "skills": [
          "papye"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Fè jounen swen yo",
        "description": "Resevwa moun yo, kenbe anbyans lan cho e respektye, epi trete chak moun tankou yon envite ki gen valè — pa tankou yon moun y ap fè yon favè.",
        "hours": 2.5,
        "skills": [
          "òganize"
        ],
        "follows": [
          2,
          3
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "mutual-aid-moving-crew",
    "name": "Ekip demenajman youn ede lòt",
    "purpose": "Ede moun demenaje ki pa ka peye demenajè — moun k ap kite yon kay ki pa an sekirite, moun y ap degèpi, oswa moun k ap pran yon kay pi piti.",
    "whoItServes": "Vwazen ki pa gen anpil mwayen, moun k ap sove kite yon kay ki gen danje, granmoun aje, ak vwazen ki gen andikap.",
    "whatYoullNeed": "Moun ki gen machin ak fòs ki vle vin mete men, materyèl demenajman, ak pratik sekirite klè. Pou nenpòt moun k ap kite yon kay ki gen danje, kenbe nouvo adrès la, dat yo, ak tout detay yo sekrè nèt, epi kite se moun nan ki deside lè ak jan bagay yo fèt.",
    "setupHours": 14,
    "defaultCategory": "transport",
    "suggestsWorkDays": true,
    "firstSteps": "Anvan ou chache yon sèl kamyon, pale ak moun ki deja resevwa apèl sa yo — moun ki abitye akonpaye moun k ap sibi vyolans lakay, moun k ap òganize lokatè, sèvis pou granmoun aje — sou kijan demann yo ta dwe rive jwenn ou e ki sekrè y ap tann ou kenbe, paske gen demenajman ki vle di yon moun ap kite yon kay ki gen danje. Apre sa, rasanble twa oswa kat moun ki gen bon do ak yon sèl machin, epi mezire premye ti demenajman an ansanm.",
    "commonPitfalls": "Ekip demenajman blese oswa bouke vit: yon travay twò gwo ak twò piti men, yon moun ki leve mal, yon adrès ki pataje nan yon gwoup chat ki pa t dwe janm kite telefòn moun k ap òganize a. Rete anndan limit ou te fikse yo, epi trete detay chak demenajman sekirite tankou yo ka mete yon moun an danje — paske yo kapab.",
    "pairsWith": [
      "tenant-union",
      "free-store"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Rasanble yon ekip ak machin",
        "description": "Rasanble moun ki ka leve ak pote san danje, plis aksè ak kamyon oswa kamyonèt. Kenbe yon lis ak disponiblite yo, pou ou ka monte yon ekip vit.",
        "hours": 2.5,
        "skills": [
          "pale ak moun",
          "kondwi"
        ]
      },
      {
        "name": "Rasanble materyèl demenajman",
        "description": "Kolekte dòli, sang pou mèb, lenn demenajman, ak bwat solid nan men moun ki bay. Materyèl pataje fè demenajman yo pi rapid, pi san danje.",
        "hours": 1.5,
        "skills": [
          "kondwi"
        ]
      },
      {
        "name": "Monte yon sistèm demann",
        "description": "Fè yon fason pou moun mande èd, ak pou mezire chak demenajman: konbyen bagay, eskalye oswa asansè, distans, ak dat. Konsa ou ka planifye kantite moun ak materyèl.",
        "hours": 2,
        "skills": [
          "òganize"
        ]
      },
      {
        "name": "Regle sekirite ak responsablite",
        "description": "Montre moun yo kijan pou leve san danje, sèvi ak yon fèy dechaj tou senp, epi tcheke asirans pou tout machin k ap sèvi. Pwoteje ni moun k ap ede yo ni moun y ap demenaje yo enpòtan.",
        "hours": 2,
        "skills": [
          "papye"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Fikse orè ak voye ekip",
        "description": "Matche demann yo ak ekip ki disponib, epi konfime ak tout moun yon jou anvan. Kenbe yon lis ranplasan, paske yon demenajman pa fasil pou ranvwaye.",
        "hours": 1.5,
        "skills": [
          "òganize"
        ],
        "follows": [
          0,
          2
        ]
      },
      {
        "name": "Fikse limit yo",
        "description": "Deside sa ekip la ap fè ak sa li p ap fè (pa pwodui danjere, pa pyano, pa travay ki depase kapasite ekip la san danje). Voye sa yo bay moun ki fè travay sa yo.",
        "hours": 1,
        "skills": [
          "ekri"
        ]
      },
      {
        "name": "Fè demenajman yo, pran nouvèl",
        "description": "Fè demenajman an san danje e ak respè, apre sa tcheke si moun nan byen enstale. Konekte l ak lòt pwojè (“Magazen gratis”, “Bèl akèy”) si sa nesesè.",
        "hours": 3.5,
        "skills": [
          "kondwi"
        ],
        "follows": [
          1,
          3,
          4
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "disability-support-network",
    "name": "Rezo èd ak aksesibilite pou moun ki gen andikap",
    "purpose": "Òganize vwazen ki gen andikap ak alye yo pou youn ede lòt, pou aksesibilite, ak pou defann dwa — ak moun ki gen andikap yo menm ki devan.",
    "whoItServes": "Vwazen ki gen andikap oswa maladi k ap dire.",
    "whatYoullNeed": "Yon sistèm kominikasyon aksesib, moun ki viv andikap la k ap mennen, ak yon anyè èd ki genyen nan zòn nan. Èd ant moun ki viv menm reyalite mache ansanm ak swen pwofesyonèl — voye kesyon medikal, swen pèsonèl, ak kesyon legal bay pwofesyonèl ki kalifye, epi trete enfòmasyon sante manm yo tankou bagay prive.",
    "setupHours": 24,
    "defaultCategory": "organizing",
    "firstSteps": "Rezo sa a mache sèlman si vwazen ki gen andikap yo chita bò tab la depi premye premye konvèsasyon an — yo pa konsilte apre, se yo k ap deside sa l ye. Kòmanse: mande de oswa twa moun ki gen andikap ou konnen pou fonde l ansanm avè w (oswa, si ou menm ou gen yon andikap, pou pataje chay la), epi kite bezwen aksè yo deside kijan premye reyinyon an fèt: fòma, kote, ak vitès la ladan.",
    "commonPitfalls": "Echèk klasik la se alye ki gen bon kè k ap bati pou moun ki gen andikap yon bagay yo pa t mande, nan fòma yo pa ka sèvi. Echèk ki pi an silans lan se glise tounen yon sèvis swen enfòmèl: èd ant moun parèy pa ka ranplase swen medikal ni swen pèsonèl san danje, kidonk kontinye voye bezwen sa yo bay pwofesyonèl kalifye, epi veye detay sante manm yo tankou bagay prive yo ye a.",
    "pairsWith": [
      "neighborhood-care-network",
      "rides-transportation",
      "health-navigation"
    ],
    "learnMore": [
      "lurking-ok"
    ],
    "tasks": [
      {
        "name": "Mete moun ki gen andikap yo devan",
        "description": "Fè sèten se manm ki gen andikap yo k ap mennen rezo a e k ap ba li fòm. “Anyen sou nou san nou” se prensip nwayo a — alye yo ede, yo pa dirije.",
        "hours": 3,
        "skills": [
          "mennen reyinyon"
        ]
      },
      {
        "name": "Monte kominikasyon aksesib",
        "description": "Bay plizyè chemen pou moun antre (telefòn, mesaj, entènèt, an pèsòn), sèvi ak pawòl klè, epi tcheke materyèl yo mache ak lektè ekran ak bezwen ki varye.",
        "hours": 3,
        "skills": [
          "aksesibilite",
          "èd teknik"
        ]
      },
      {
        "name": "Konnen bezwen yo ak sa ki la",
        "description": "Aprann sa manm yo bezwen, epi ekri tout sa ki egziste nan zòn nan: transpò aksesib, kote pou jwenn ekipman, sèvis yo, ak èd pou demach èd leta. Make twou ki pi gwo yo.",
        "hours": 5,
        "skills": [
          "pale ak moun",
          "antre done"
        ]
      },
      {
        "name": "Monte echanj youn-ede-lòt la",
        "description": "Fè yon fason pou manm yo bay epi resevwa èd — komisyon, yon moun pou akonpaye w nan randevou, ti rele pran nouvèl — dapre kapasite ak bezwen chak moun.",
        "hours": 3,
        "skills": [
          "òganize"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Fè yon rezèv ekipman pataje",
        "description": "Rasanble walkè, baton, chèz woulant, ak lòt ekipman, pou manm yo pran epi pote tounen, dezenfekte ant chak moun. Anpil aparèy konsa chita san sèvi lè moun pa bezwen yo ankò.",
        "hours": 4,
        "skills": [
          "pale ak moun",
          "òganize"
        ]
      },
      {
        "name": "Bay èd pou defann dwa",
        "description": "Ede manm yo jwenn wout yo nan èd leta, amenajman, ak sèvis yo. Pataje enfòmasyon, akonpaye moun, epi voye kesyon legal ak medikal bay pwofesyonèl kalifye.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "papye"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Fikse estanda aksè pou tout evenman",
        "description": "Fè yon lis kontwòl (antre lokal la, chèz, entèprèt, bezwen sansoryèl, materyèl) pou chak pwojè nan kominote a byen resevwa manm ki gen andikap yo.",
        "hours": 3,
        "skills": [
          "aksesibilite",
          "ekri"
        ]
      }
    ]
  },
  {
    "id": "books-to-prisoners",
    "name": "Liv ak lèt pou moun ki nan prizon",
    "purpose": "Voye liv ak lèt gratis bay moun ki nan prizon, pou kase izolman e pou ede aprantisaj.",
    "whoItServes": "Moun ki nan prizon — e atravè yo, fanmi yo ak kominote yo.",
    "whatYoullNeed": "Liv moun bay, moun pou ede, tenb lapòs, ak konesans règ lapòs chak prizon. Règ lapòs chak prizon strik e diferan — pakè ki pa respekte yo tounen, kidonk swiv yo egzakteman, epi fè tout moun toujou sèvi ak adrès pwojè a, jamè yon adrès lakay.",
    "setupHours": 21,
    "defaultCategory": "education",
    "suggestsWorkDays": true,
    "firstSteps": "Anvan ou kolekte yon sèl liv, rele yon ekip ki abitye voye liv nan prizon — pifò ap kontan di w ki prizon yo kouvri, ki règ ki fè moun tonbe, ak ki kote demann yo rete san repons. Apre sa, jwenn règ lapòs aktyèl la alekri pou youn oswa de prizon w ap kòmanse avèk yo; se sa moun ki nan prizon yo mande toutbon ki pou fòme koleksyon an, pa sa moun ap netwaye sou etajè yo.",
    "commonPitfalls": "Pwojè sa a mouri ak pakè ki tounen: yon liv ki deja sèvi kote se nèf sèlman ki pase, yon liv po di, yon règ etikèt ki bliye — tenb gaspiye e pakè yon moun t ap tann depi lontan tounen. Li ka fè moun k ap ekri yo mal tou, si yo ekri sot lakay yo; chak lèt soti sou adrès pwojè a, san eksepsyon, kèlkeswa jan korespondans lan vin cho.",
    "pairsWith": [
      "reentry-support",
      "free-little-library"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Aprann règ lapòs prizon yo",
        "description": "Chak prizon gen règ strik pa li — anpil mande liv nèf, voye dirèk sot kay yon mezon edisyon oswa yon machann apwouve, ak limit sou kontni ak kantite. Etidye yo ak swen, paske pakè ki pa nan règ tounen.",
        "hours": 5,
        "skills": [
          "papye"
        ]
      },
      {
        "name": "Rasanble liv ak yon espas travay",
        "description": "Kolekte liv moun bay (nan règ prizon yo), epi monte yon kwen pou triye ak anbale. Kenbe yon seleksyon varye: diksyonè, liv lekòl, woman, ak liv pou prepare soti — se yo moun mande plis.",
        "hours": 4,
        "skills": [
          "pale ak moun",
          "kondwi"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Monte yon sistèm pou demann yo",
        "description": "Fè yon pwosesis pou resevwa ak swiv demann moun ki nan prizon yo — yo ekri ak sijè oswa tit. Matche demann yo ak liv ki disponib.",
        "hours": 3,
        "skills": [
          "antre done",
          "òganize"
        ]
      },
      {
        "name": "Jwenn moun, montre yo travay la",
        "description": "Montre moun k ap ede yo kijan pou matche demann, anbale dapre règ chak prizon, epi ekri ti nòt ki gen sans. Presizyon sou règ yo evite tenb gaspiye ak pakè ki tounen.",
        "hours": 3,
        "skills": [
          "pale ak moun",
          "montre moun"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Kouvri tenb ak lojistik",
        "description": "Tenb se pi gwo depans k ap kontinye a. Mande kominote a mete lajan ansanm pou sa, sèvi ak tarif ki pi bon mache ki respekte règ yo, epi fikse jou lapòs regilye.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Òganize ekri lèt yo",
        "description": "Matche moun ki vle yo kòm korespondan, ak règ klè sou sekirite ak lavi prive (adrès pwojè a, pa adrès pèsonèl). Lyen moun ak moun konte menm jan ak liv yo.",
        "hours": 3,
        "skills": [
          "ekri"
        ]
      }
    ]
  },
  {
    "id": "community-music",
    "name": "Mizik ak enstriman pou kominote a",
    "purpose": "Mete enstriman pou moun pran, ak leson ak seyans jwe ansanm gratis, pou mizik la louvri pou tout moun.",
    "whoItServes": "Timoun ak granmoun ki pa ka achte enstriman oswa peye leson.",
    "whatYoullNeed": "Enstriman moun bay, moun ki vle montre mizik, yon espas, ak yon sistèm pou enstriman soti tounen.",
    "setupHours": 15,
    "defaultCategory": "education",
    "firstSteps": "Kòmanse ak mizisyen ki deja alantou w — gitaris legliz kwen an, granmoun ki te konn mennen fanfa a, jèn yo k ap jwe — epi mande yo sa yo ta renmen montre e kilè. Yon ti pale ak yon boutik mizik sou reparasyon pi bon mache, yon lòt ak yon espas ki pa pè bri, epi ou prèske rive nan premye seyans jwe ansanm ou.",
    "commonPitfalls": "Rezèv enstriman yo vide an silans lè enstriman soti pi vit pase jan yo tounen an eta pou jwe, kidonk mete tan reparasyon nan plan an depi kòmansman, epi kenbe regleman tounen an dou men reyèl. Veye tou pou leson yo pa glise sou moun ki deja alèz yo: timoun ki pa janm manyen yon enstriman an bezwen akèy ki pi cho a, pa plas ki pi kout la.",
    "pairsWith": [
      "library-of-things",
      "skill-share",
      "youth-mentorship"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Kolekte epi repare enstriman",
        "description": "Rasanble enstriman moun bay, fè netwaye yo, chanje kòd yo, oswa repare yo pou yo ka jwe. Bati yon melanj tip ak nivo.",
        "hours": 5,
        "skills": [
          "repare",
          "kondwi"
        ]
      },
      {
        "name": "Monte sistèm soti-tounen an",
        "description": "Fè yon fèy soti ki make kilès ki gen kisa, ak enstriksyon swen ak yon regleman tounen ki dou. Bay chak enstriman yon nimewo epi ekri l nan lis la.",
        "hours": 2,
        "skills": [
          "antre done"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Jwenn moun pou montre mizik",
        "description": "Chache mizisyen ki dakò montre debitan ak pasyans. Yo pa bezwen pwofesyonèl — antouzyasm ak yon bon baz ale lwen.",
        "hours": 3,
        "skills": [
          "pale ak moun",
          "mizik"
        ]
      },
      {
        "name": "Jwenn yon espas pou son an",
        "description": "Jwenn yon sal kote bri pa yon pwoblèm — yon sant kominotè, yon lekòl, oswa yon sal legliz. Fikse lè fiks pou leson ak pou jwe lib.",
        "hours": 2,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Fikse orè leson ak seyans yo",
        "description": "Bay leson pou debitan ak seyans lib pou tout nivo. Fè antre a fasil, ak lè ki varye pou moun k ap travay oswa ki lekòl.",
        "hours": 2,
        "recurringCadence": "session",
        "skills": [
          "òganize"
        ],
        "follows": [
          2,
          3
        ]
      },
      {
        "name": "Fikse swen ak regleman tounen",
        "description": "Montre moun ki pran enstriman yo swen debaz, ak sa pou fè si yon bagay kase. Kite l chita sou konfyans ak èd, pa sou pinisyon.",
        "hours": 1,
        "skills": [
          "ekri"
        ],
        "follows": [
          1
        ]
      }
    ]
  },
  {
    "id": "school-supply-program",
    "name": "Founiti lekòl ak sakado pou timoun yo",
    "purpose": "Bay founiti lekòl ak sakado gratis, pou timoun yo kòmanse ane a pare e ak konfyans.",
    "whoItServes": "Fanmi ki pa gen anpil mwayen ki gen timoun lekòl.",
    "whatYoullNeed": "Founiti moun bay oswa lajan, yon kote pou sere, yon kote pou bay yo, ak moun pou ede.",
    "setupHours": 10,
    "defaultCategory": "mutual_aid_drive",
    "suggestsWorkDays": true,
    "firstSteps": "Premye konvèsasyon ou se ak yon lekòl — yon konseye oswa yon moun ki fè pon ant lekòl la ak fanmi yo, ki konnen vre lis founiti yo e ki fanmi k ap degaje yo an silans. Kite yo di w sa pou kolekte ak kijan fanmi yo ap tande sa; yon jou bay ki pase nan men moun paran yo deja fè konfyans rive jwenn timoun yon feyè p ap janm rive jwenn.",
    "commonPitfalls": "Echèk previzib la se yon mòn katab moun bay, san youn nan kaye lis yo mande toutbon — kolekte sa ki fasil pou bay olye sa ki nesesè. Sa ki fè mal la se yon jou bay ki santi tankou yon egzamen; pa mande papye sou lajan, kite timoun yo chwazi pwòp sakado yo, e pèsonn pa soti ak santiman yo t ap enspekte l.",
    "pairsWith": [
      "youth-mentorship",
      "toy-library"
    ],
    "tasks": [
      {
        "name": "Jwenn lis yo, mezire bezwen an",
        "description": "Travay men nan men ak lekòl zòn nan pou jwenn vre lis founiti pa klas, epi estime konbyen fanmi ki bezwen èd. Konsa sa moun bay yo rete itil.",
        "hours": 1.5,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Kolekte founiti, achte an gwo",
        "description": "Mete ansanm bwat kote moun depoze founiti ak acha an gwo pou atik yo mande plis yo. Acha an gwo fè lajan an ale pi lwen sou baz yo: kaye, kreyon.",
        "hours": 3,
        "recurringCadence": "cycle",
        "skills": [
          "pale ak moun",
          "kondwi"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Triye epi ranje pa klas",
        "description": "Òganize founiti yo epi plen sakado dapre lis chak klas. Yon seyans anbalaj an chèn ak plizyè moun mache vit.",
        "hours": 2,
        "skills": [
          "òganize"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Jwenn kote pou sere ak kote pou bay",
        "description": "Jwenn yon kote sèk pou sere, ak yon kote akeyan pou bay sakado yo — souvan nan yon lekòl, yon sant kominotè, oswa ansanm ak yon lòt evenman rantre lekòl.",
        "hours": 1.5,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Fikse jou a, jwenn moun",
        "description": "Fè jou bay la anvan lekòl louvri, ak moun akeyan k ap ede. Kite timoun yo chwazi yon sakado kote sa posib — chwa a ajoute diyite.",
        "hours": 2,
        "skills": [
          "òganize"
        ],
        "follows": [
          2,
          3
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "legal-aid-clinic",
    "name": "Klinik èd legal ak konnen dwa ou",
    "purpose": "Konekte vwazen yo ak èd legal gratis epi montre moun dwa yo genyen.",
    "whoItServes": "Nenpòt moun ki gen yon pwoblèm lajistis san mwayen pou peye avoka — kesyon kay, imigrasyon, dèt, fanmi, oswa èd leta.",
    "whatYoullNeed": "Avoka ak etidyan dwa ki dakò bay tan yo gratis, yon espas, lyen ak òganizasyon èd legal ki deja etabli, ak yon sistèm randevou. Konsèy legal pou yon moun dwe soti nan bouch avoka ki gen lisans (oswa etidyan dwa k ap travay anba je yon avoka) — pwojè sa a louvri chimen an epi pataje enfòmasyon jeneral sou dwa, li pa yon sous konsèy legal li menm.",
    "setupHours": 26,
    "defaultCategory": "other",
    "suggestsWorkDays": true,
    "firstSteps": "Anyen pa kòmanse isit la anvan ou gen avoka: premye apèl ou yo se biwo èd legal zòn nan, travay pro bono asosyasyon avoka yo, ak yon klinik fakilte dwa — mande yo kisa yo ta bezwen pou yo vini, epi ki twou yon klinik katye ta ka bouche vre. Kite òganizasyon sa yo defini limit klinik lan avè w anvan ou anonse anyen bay vwazen yo.",
    "commonPitfalls": "Danje ki pi grav la se yon moun ki ede ak bon kè ki glise soti nan enfòmasyon pou tonbe nan konsèy — yon “ou mèt siyen l” ki soti ak bon entansyon ka kraze dosye yon moun, kidonk kenbe liy sa a klè epi pratike l. Danje ki pi dousman an se lè w ap resevwa plis moun pase avoka yo ka wè: yon lis moun dezespere k ap tann san okenn avoka nan sal la kraze konfyans pi vit pase si klinik lan pa t janm louvri.",
    "pairsWith": [
      "tenant-union",
      "court-support",
      "newcomer-translation-network"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Fè lyen ak avoka ak èd legal",
        "description": "Chèche avoka ki gen lisans, oswa etidyan dwa k ap travay anba je avoka, pou bay konsèy legal yo vre. Bati chimen pou voye ka bay òganizasyon èd legal ki deja etabli.",
        "hours": 6,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Defini limit ak chimen pou voye ka",
        "description": "Deside ki kalite ka klinik lan ka pran epi trase chimen klè pou voye ka konplike oswa espesyalize bay lòt kote. Di klè sa klinik lan ka fè ak sa l pa ka fè.",
        "hours": 3,
        "skills": [
          "ekri"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Prepare yon espas ak pòt antre a",
        "description": "Jwenn yon kote prive, kote pawòl moun rete sekrè, epi prepare yon fèy antre ak yon lis dokiman pou avoka yo ka sèvi ak ti tan yo byen.",
        "hours": 3,
        "skills": [
          "òganize"
        ]
      },
      {
        "name": "Bati yon sistèm randevou ki pwoteje moun",
        "description": "Kreye randevou ki pwoteje vi prive moun. Zafè lajistis sansib, kidonk veye enfòmasyon moun yo ak anpil swen depi nan kòmansman rive nan bout.",
        "hours": 3,
        "skills": [
          "òganize",
          "antre done"
        ]
      },
      {
        "name": "Prepare dokiman ak atelye konnen dwa ou",
        "description": "Kreye ti gid klè e egzak epi fè atelye sou dwa moun konn bezwen (lokatè, travayè, imigrasyon, lè w devan lapolis oswa otorite yo). Prezante yo kòm enfòmasyon jeneral, pa konsèy legal pou yon moun apa.",
        "hours": 5,
        "recurringCadence": "event",
        "skills": [
          "ekri",
          "montre moun"
        ]
      },
      {
        "name": "Fè konnen epi fikse dat klinik yo",
        "description": "Fikse dat klinik k ap tounen regilyèman epi gaye nouvèl la nan òganizasyon zanmi yo ak tout rezo youn ede lòt la. Ofri entèpretasyon pou moun ki pale lòt lang.",
        "hours": 3,
        "skills": [
          "pale ak moun",
          "tradui"
        ],
        "follows": [
          0,
          3
        ]
      },
      {
        "name": "Pwoteje sekrè moun yo epi tcheke konfli",
        "description": "Mete règ sekrè ki sevè epi yon ti tcheke konfli pou menm moun nan pa janm konseye de pati k ap goumen youn kont lòt. Montre tout ekip la règ sa yo byen.",
        "hours": 3,
        "skills": [
          "papye"
        ]
      }
    ]
  },
  {
    "id": "resource-hub-dispatch",
    "name": "Kafou youn ede lòt",
    "purpose": "Sèvi kòm rèl do kowòdinasyon an — yon sèl kote bezwen ak èd rankontre pou tout pwojè kominote a.",
    "whoItServes": "Tout moun nan kominote a — manm k ap chèche èd, moun k ap ofri èd, ak moun k ap mennen pwojè ki bezwen kowòdinasyon.",
    "whatYoullNeed": "Yon pòt antre pou resevwa demann, yon lis moun ki ka ede ak sa ki disponib, moun k ap kowòdone, ak yon gwo anyè. Kafou a kenbe enfòmasyon sansib sou lavi vwazen yo — pran sèlman sa ki nesesè, veye l ak swen, epi pataje detay sèlman ak moun ki bezwen yo pou ede.",
    "setupHours": 27,
    "defaultCategory": "organizing",
    "firstSteps": "Kafou a ap kowòdone pwojè yo, kidonk kòmanse chita ak moun k ap mennen chak pwojè: ki demann yo resevwa, kisa yo ta renmen lage nan men lòt moun, ki jan yo vle resevwa demann ki matche ak yo. Mete tèt ansanm sou yon sèl pòt antre ak yon baz pou vi prive — yon kafou yo enpoze sou pwojè yo, moun ap kontoune l; youn ki bati avèk yo tounen pòt devan an.",
    "commonPitfalls": "Kafou mouri de fason: pòt antre a plen ak demann pèsonn pa swiv jouk nan bout, kidonk pawòl la gaye ki di rele pa itil anyen; oswa yon sèl moun vanyan kenbe tout fil yo jouk li bouke nèt epi kominote a pèdi memwa l. Swiv chak demann jouk li fèmen vre, fè moun yo fè tou pa yo bonè, epi pran mwens enfòmasyon pase sa w panse w bezwen.",
    "pairsWith": [
      "emergency-preparedness",
      "rides-transportation",
      "solidarity-fund"
    ],
    "learnMore": [
      "post-something",
      "claim-post"
    ],
    "tasks": [
      {
        "name": "Louvri yon sèl pòt antre pou bezwen ak èd",
        "description": "Kreye yon sèl pòt devan ki fasil — yon liy telefòn, yon fèy, ak yon opsyon fasafas — kote nenpòt moun ka di sa l bezwen oswa sa l ka bay. Yon sèl pòt antre anpeche moun tonbe nan twou.",
        "hours": 4,
        "skills": [
          "òganize",
          "èd teknik"
        ]
      },
      {
        "name": "Bati lis moun ki ka ede ak sa ki disponib",
        "description": "Kenbe yon lis ajou moun ki vle ede (sa yo konn fè, disponiblite, kote yo ye) ak sa chak pwojè ka ofri, pou demann yo ka matche vit.",
        "hours": 4,
        "skills": [
          "antre done"
        ]
      },
      {
        "name": "Kreye chimen pou matche ak voye èd",
        "description": "Etabli ki jan yon demann rive jwenn bon pwojè a oswa bon moun nan, ak nan konbyen tan. Deside nan konbyen tan yon repons dwe soti ak ki jan demann yo swiv jouk yo fèmen.",
        "hours": 4,
        "skills": [
          "òganize"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Kenbe yon gwo anyè èd",
        "description": "Kenbe yon anyè vivan ak tout pwojè kominote a plis kote deyò (kote moun ka pase nwit, klinik, manje, èd legal) pou kafou a ka voye moun nenpòt kote èd egziste.",
        "hours": 5,
        "recurringCadence": "month",
        "skills": [
          "antre done"
        ]
      },
      {
        "name": "Chèche epi montre moun k ap kowòdone yo",
        "description": "Bati yon ekip pou fè tou nan kafou a youn apre lòt, pou kafou a rete reponn san pèsonn pa bouke nèt. Montre yo chimen an ak anyè a.",
        "hours": 3,
        "skills": [
          "pale ak moun",
          "montre moun"
        ],
        "follows": [
          2,
          3
        ]
      },
      {
        "name": "Fikse règ vi prive ak swivi",
        "description": "Deside ki enfòmasyon w ap pran, ki jan li estoke ak pwoteje, ak ki jan ou konfime yon bezwen jwenn repons vre. Pran minimòm nan epi veye l ak swen.",
        "hours": 4,
        "skills": [
          "ekri"
        ]
      },
      {
        "name": "Swiv bezwen ki pa jwenn repons",
        "description": "Note demann ou pa t ka reponn. Twou k ap repete montre kote kominote a ta dwe kòmanse pwochen pwojè li — konsa kafou a tounen yon zouti pou planifye, pa yon senp santral telefòn.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "antre done"
        ]
      }
    ]
  },
  {
    "id": "harm-reduction-supplies",
    "name": "Bay materyèl pou diminye danje",
    "purpose": "Mete naloxone, ti bandelèt tès, ak materyèl pou sèvi ak mwens danje nan men moun ki ka bezwen yo — jwenn vwazen yo kote yo ye a, san jije pèsonn.",
    "whoItServes": "Moun k ap sèvi ak dwòg, zanmi yo ak fanmi yo, ak nenpòt moun ki ka temwen yon ovèdòz — sa vle di, nan pifò katye, tout moun.",
    "whatYoullNeed": "Aprann reponn a yon ovèdòz, yon sous naloxone (sistèm leta a, yon famasi, oswa yon òganizasyon zanmi), materyèl pou kit yo, ak yon ti ekip pou mache bay yo. Bay materyèl pa swen medikal — tout moun k ap bay dwe fin aprann reponn a yon ovèdòz anvan, epi lwa sou sa ou ka pote (bandelèt tès, sereng) chanje anpil selon kote a, kidonk konfime pa w la anvan ou achte anyen. Mete nimewo lokal pou kriz ak pou tretman enprime nan chak kit.",
    "setupHours": 20,
    "defaultCategory": "other",
    "suggestsWorkDays": true,
    "firstSteps": "Pa achte anyen poko: premye etap ou se yon chita pale ak òganizasyon diminye danje ki pi pre a ak moun ki sèvi ak materyèl sa yo vre — y ap di w sa ki nesesè, sa ki deja kouvri, ak ki jan pou parèt san jije pèsonn. Fè tout ekip nwayo a fin aprann reponn a yon ovèdòz epi konfime lwa lokal la sou bandelèt ak sereng anvan yon sèl kit pare.",
    "commonPitfalls": "Sa vire mal lè ou parèt tankou etranje — bay kote ou pa gen okenn relasyon, oswa mete leson ak kondisyon ki montre moun evite w — ak lè ou pran devan lwa a oswa sa ou aprann, sa ki ka bay yon moun ki ede yon move dosye lajistis pou materyèl dwòg. Pi dousman men akonpaye bat pi vit men pou kont ou, chak fwa.",
    "pairsWith": [
      "community-first-aid-training",
      "mental-health-peer-support"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Aprann epi jwenn yon òganizasyon zanmi",
        "description": "Fè ekip nwayo a fin aprann reponn a yon ovèdòz ak bay naloxone — anpil biwo sante ak òganizasyon diminye danje fè seyans sa yo gratis. Mete men ak yon òganizasyon ki deja etabli; yo deja rezoud pwoblèm materyèl, lalwa, ak konfyans ou pa bezwen rezoud ankò.",
        "hours": 4,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Tcheke lwa lokal la sou materyèl yo",
        "description": "Aksè a naloxone pwoteje prèske toupatou, men bandelèt tès ak sereng toujou konte kòm materyèl dwòg kèk kote. Chèche konnen egzakteman sa ou ka pote ak bay legalman — òganizasyon zanmi an oswa yon klinik èd legal ka di w sa vit. Ekri l pou tout moun k ap ede.",
        "hours": 3,
        "skills": [
          "rechèch"
        ]
      },
      {
        "name": "Jwenn naloxone ak materyèl kit yo",
        "description": "Kòmande naloxone nan sistèm leta a, ak yon otorizasyon jeneral famasi, oswa nan òganizasyon zanmi an. Ajoute tout sa ki legal kote ou ye: bandelèt tès fentanyl ak xylazine, pansman pou blese, atik ijyèn.",
        "hours": 4,
        "follows": [
          1
        ],
        "skills": []
      },
      {
        "name": "Monte kit yo ak fèy esplikasyon senp",
        "description": "Mete nan chak kit enstriksyon senp nan plizyè lang: ki jan pou rekonèt yon ovèdòz, ki jan pou bay naloxone, rele anbilans, pa janm sèvi pou kont ou. Mete nimewo lokal pou kriz ak tretman nan chak kit. Monte yo ale vit ak yon tab plen moun.",
        "hours": 3,
        "skills": [
          "tradui"
        ],
        "follows": [
          2
        ],
        "recurringCadence": "cycle"
      },
      {
        "name": "Fikse wonn ak pwen fiks pou bay yo",
        "description": "Planifye wonn regilye apye oswa ak machin nan kote moun ye vre, epi mande ba, ti boutik, bibliyotèk, ak lòt espas kenbe yon bwat san kesyon. Baryè ba se tout sans lan — pa gen fèy pou ranpli, pa gen leson.",
        "hours": 4,
        "skills": [
          "pale ak moun",
          "kondwi"
        ]
      },
      {
        "name": "Replen, swiv, epi kenbe konesans yo fre",
        "description": "Note sa k ap fini ak sa k ap chita, ekri dat ekspirasyon naloxone yo, epi fè seyans rafrechisman lè nouvo moun vin mete men. Si yon kit sove yon moun anba yon ovèdòz, sa merite note (avèk dousè).",
        "hours": 2,
        "recurringCadence": "month",
        "skills": []
      }
    ]
  },
  {
    "id": "court-support",
    "name": "Akonpaye moun nan tribinal",
    "purpose": "Veye pou okenn vwazen pa parèt devan tribinal pou kont li — konpayi nan sal odyans lan, yon woulib pou ale, gade timoun pandan odyans lan, ak lèt temwayaj lè avoka defans lan mande yo.",
    "whoItServes": "Vwazen ki gen dat tribinal — kriminèl, imigrasyon, degèpisman, oswa tribinal fanmi — ak fanmi yo; ale nan tribinal pou kont ou ka koute yon moun travay li, gade timoun li, ak espwa li.",
    "whatYoullNeed": "Moun serye ki vle ede, yon kalandriye odyans, ak lyen ak avoka piblik yo (avoka leta bay pou defann moun). Akonpaye se prezans ak lojistik, se pa konsèy legal — moun k ap ede yo pa janm bay konsèy sou yon ka epi yo toujou swiv avoka moun nan. Sal tribinal gen règ konduit ki strik, kidonk tout moun k ap vini dwe konnen yo pa kè.",
    "setupHours": 16,
    "defaultCategory": "other",
    "firstSteps": "Kòmanse ak moun ki gen dat yo: akonpaye fèt sèlman sou envitasyon moun k ap parèt devan tribinal la, epi ann akò ak avoka li. Prezante tèt ou anvan bay biwo avoka piblik yo ak gwoup k ap veye tribinal oswa gwoup ki mete lajan ansanm pou fè moun soti nan prizon ki deja nan tribinal la, epi kite yo di w ki odyans ki bezwen konpayi ak ki jan pou itil san ou pa janm manyen bò legal la.",
    "commonPitfalls": "Mal la soti lè moun ap aji pou kont yo: yon moun k ap ede k ap “esplike” yon papye lajistis nan koulwa a, detay yon ka k ap diskite kote avoka leta a ka tande, yon reyaksyon kote moun chita yo ki agase yon jij — nenpòt nan yo ka fè menm moun ou vin pou li a mal. Echèk ki pi dousman an se lojistik: yon dat tribinal ki pa konfime oswa yon woulib ki tonbe ka vle di yon odyans manke ak yon manda arestasyon.",
    "pairsWith": [
      "legal-aid-clinic",
      "reentry-support",
      "rides-transportation"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Konekte ak avoka piblik ak gwoup ki la deja",
        "description": "Prezante tèt ou bay biwo avoka piblik yo, èd legal imigrasyon, ak gwoup k ap veye tribinal oswa k ap mete lajan ansanm pou fè moun soti nan prizon ki deja ap travay. Y ap di w kote èd la pi nesesè ak ki jan pou mete men san antrave yo.",
        "hours": 3,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Ekri règ yo: prezans, pa konsèy legal",
        "description": "Mete l sou papye: moun k ap ede yo pa janm bay konsèy legal, pa janm pale detay yon ka nan espas piblik tribinal la, epi yo toujou kite avoka moun nan mennen. Ajoute konduit nan sal la — rive bonè, abiye senp, telefòn fèmen, okenn reyaksyon kote moun chita yo.",
        "hours": 2,
        "skills": [
          "ekri"
        ]
      },
      {
        "name": "Monte pòt antre ak kalandriye odyans yo",
        "description": "Kreye yon fason senp pou moun mande konpayi ak yon kalandriye pataje ak dat, sal odyans, ak sa chak moun bezwen — konpayi, yon woulib, gade timoun, oswa tout twa ansanm. Dat tribinal deplase souvan, kidonk konfime lavèy la.",
        "hours": 3,
        "skills": [
          "òganize"
        ]
      },
      {
        "name": "Montre moun k ap akonpaye yo",
        "description": "Fè yon vizit tribinal ak yo: sekirite, jwenn sal la, kote pou chita, ak ki jan pou rete la byen poze, yon konpayi cho pandan yon tann ki di. Mete chak nouvo moun ak yon moun ki gen eksperyans pou premye dat li.",
        "hours": 3,
        "skills": [
          "montre moun"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Kowòdone woulib ak gade timoun pou odyans yo",
        "description": "Prepare chofè pou maten tribinal yo ak de moun ansanm ki ka gade timoun pandan odyans yo — anpil sal tribinal pa aksepte timoun, epi yon odyans manke poutèt gade timoun ka vle di yon manda arestasyon.",
        "hours": 3,
        "skills": [
          "kondwi",
          "okipe timoun"
        ],
        "recurringCadence": "event"
      },
      {
        "name": "Òganize lèt temwayaj lè avoka a mande",
        "description": "Lè avoka yon moun mande lèt temwayaj sou karaktè l oswa sou plas li nan kominote a, kowòdone vwazen yo pou ekri yo — swiv konsiy avoka a sou kontni, ton, ak dat limit la egzakteman.",
        "hours": 2,
        "skills": [
          "ekri"
        ]
      }
    ]
  },
  {
    "id": "cooling-warming-center",
    "name": "Kote pou pare chalè ak fredi",
    "purpose": "Louvri yon kote nan katye a pou moun pare move tan — yon sal fre lè gwo chalè, yon sal cho lè gwo fredi — pare anvan tan an vin danjere, pa apre.",
    "whoItServes": "Granmoun aje, vwazen ki pa gen kay, moun ki pa gen è kondisyone oswa chofaj k ap mache, moun k ap travay deyò, ak nenpòt moun ki gen yon kay ki pa ka kenbe tèt ak move tan an.",
    "whatYoullNeed": "Yon kote k ap resevwa ki gen è kondisyone ak chofaj plis twalèt, materyèl, ak moun ki fin prepare k ap fè tou yo. Moun k ap resevwa yo se vwazen, se pa doktè — montre tout moun rekonèt kout chalè ak kò ki vin twò frèt epi rele anbilans bonè olye ta, epi regle kesyon asirans ak reskonsablite kote a anvan premye louvèti a, pa pandan li.",
    "setupHours": 21,
    "defaultCategory": "other",
    "suggestsWorkDays": true,
    "firstSteps": "Kote k ap resevwa a se relasyon tout bagay chita sou li a, kidonk kòmanse la: chita ak bibliyotekè a, pastè a, oswa moun k ap okipe sal la epi pase sou kesyon ki jennen yo ansanm — lè, kle, asirans, sa k ap pase si yon moun bezwen pase nwit — anvan premye previzyon an fòse yo. Anmenmtan, mande moun k ap fè lawonn nan lari ak anplwaye kay granmoun yo kiyès ki bezwen kote a vre, pou plas la ak lè yo mache ak moun li fèt pou yo a.",
    "commonPitfalls": "Pwojè sa a echwe nan twou ki genyen ant plan ak move tan an: yon siy pou louvri pèsonn pa t fin dakò sou li, kidonk kote a louvri yon jou an reta, oswa yon kesyon reskonsablite ki rete vag jouk yon moun tonbe epi kote a retire kò l nèt. Mete kondisyon pou louvri a alekri, fè yon louvèti egzèsis anvan sezon an, epi veye pou chak moun k ap resevwa konnen pou rele anbilans bonè, pa an dènye.",
    "pairsWith": [
      "emergency-preparedness",
      "community-wood-bank",
      "laundry-shower-access"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Jwenn yon kote ki gen è kondisyone ak chofaj",
        "description": "Mande bibliyotèk, legliz, sal sendika, ak lòt espas kominote a yon sal ak è kondisyone ak chofaj serye, twalèt, ak antre san mach eskalye. Pran yon wi alekri ki kouvri lè yo, kiyès ki kenbe kle yo, ak sa k ap fèt si sa nesesè lannwit.",
        "hours": 4,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Fikse siy pou louvri ak yon plan alèt",
        "description": "Deside davans egzakteman kisa k ap louvri kote a — yon tanperati previzyon, yon endèks chalè, yon fredi van — pou pèsonn pa oblije pran yon desizyon nan mitan lannwit. Monte yon chenn apèl oswa yon gwoup mesaj ki mete moun yo sou pare yon jou davans.",
        "hours": 2,
        "skills": []
      },
      {
        "name": "Fè rezèv materyèl",
        "description": "Rasanble dlo, ti sachè elektwolit (sewòm oral), lenn, ti kabann pliyab oswa chèz konfòtab, vantilatè, chajè telefòn, ak yon twous premye swen. Estoke tout sou plas nan bwat ki make pou nenpòt moun k ap resevwa ka jwenn yo.",
        "hours": 3,
        "skills": [
          "kondwi"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Chèche epi montre moun k ap resevwa yo",
        "description": "Jwenn ase moun pou de pa tou epi montre yo: akeyi moun san papye, rekonèt kout chalè ak kò ki vin twò frèt, kilè pou rele anbilans, ak baz pou kalme tansyon. Chalè nan sans imen an konte menm jan ak tèmostat la.",
        "hours": 4,
        "skills": [
          "montre moun"
        ]
      },
      {
        "name": "Bati lis tou yo",
        "description": "Prepare yon orè tou ou ka lanse ak yon jou avètisman — moun k ap louvri, moun k ap fèmen, ak moun pou lannwit si w ofri sa. Kenbe yon lis rezèv, paske gwo chalè kraze moun k ap ede yo tou.",
        "hours": 2,
        "skills": [
          "òganize"
        ],
        "follows": [
          3
        ],
        "recurringCadence": "event"
      },
      {
        "name": "Gaye nouvèl la anvan sezon an",
        "description": "Fè feyè nan plizyè lang ak siy yo ak adrès la, epi mete yo nan klinik, kay granmoun, men moun k ap fè lawonn nan lari, ak ti boutik anvan premye gwo chalè oswa gwo fredi a — pa pandan li.",
        "hours": 3,
        "skills": [
          "desen grafik",
          "tradui"
        ]
      },
      {
        "name": "Louvri, resevwa, epi remete an plas chak fwa",
        "description": "Fè kote a mache pandan tout move tan an: kenbe yon ti konte moun ki antre (yon chif, pa pyès idantite), kenbe materyèl yo ap mache, epi tcheke nenpòt moun k ap dòmi. Apre sa, netwaye, replen, epi note sa ki te manke.",
        "hours": 3,
        "recurringCadence": "event",
        "skills": []
      }
    ]
  },
  {
    "id": "community-oral-history",
    "name": "Istwa granmoun yo — memwa kominote a",
    "purpose": "Anrejistre istwa granmoun yo ak vwazen yo anvan yo pèdi — epi kite moun k ap rakonte yo rete mèt sa k ap fèt ak yo.",
    "whoItServes": "Granmoun ki gen istwa pèsonn poko janm mande tande, moun ki rete nan katye a lontan k ap gade l chanje, ak chak vwazen k ap vini apre.",
    "whatYoullNeed": "Yon telefòn oswa yon ti anrejistrè senp, yon kote trankil, papye konsantman, ak yon kote ki an sekirite pou kenbe dosye yo. Anrejistreman se bagay pèsonèl — chak moun ki rakonte se mèt istwa pa l, se li ki deside kote li pataje, epi li ka chanje lide pita. Anyen pa soti an piblik san wi alekri li.",
    "setupHours": 10,
    "defaultCategory": "education",
    "firstSteps": "Kòmanse ak yon granmoun ki fè w konfyans epi mande l si l ta pataje yon istwa — premye anrejistreman sa a montre w plis pase nenpòt plan, epi pawòl li ap reponn pou ou bò kote pwochen moun k ap rakonte a. Anvan ou peze anrejistre ak nenpòt moun, pase sou papye konsantman an ansanm epi mande kisa li ta vle rive ak anrejistreman an; se chita pale sa a ki pwojè a.",
    "commonPitfalls": "Fason sa fè yon moun mal se yon istwa ki vwayaje pi lwen pase sa moun ki rakonte l la te dakò — yon moso ki afiche, yon non ki tache, yon detay ki te pou ou sèlman. Fason li mouri san bri se anrejistreman k ap anpile san etikèt sou telefòn yon sèl moun jouk yon aparèy pèdi efase ane vwa yo; make epi fè kopi chak seyans menm semèn nan li fèt.",
    "pairsWith": [
      "neighborhood-care-network",
      "digital-literacy"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Ekri yon papye konsantman senp",
        "description": "Yon sèl paj, san jagon lalwa: kisa k ap anrejistre, kote li ta ka pataje, ak dwa moun nan pou fè yon poz, sote kesyon, oswa retire anrejistreman an pita. Tradui l nan lang moun k ap rakonte yo pale vre.",
        "hours": 2,
        "skills": [
          "ekri",
          "tradui"
        ]
      },
      {
        "name": "Prepare zouti ak yon lis kesyon",
        "description": "Yon telefòn ak yon aplikasyon pou anrejistre vwa sifi; ajoute yon ti mikwo bon mache si w kapab. Ekri kesyon louvri ki rele istwa — “rakonte m ki jan lari a te ye lè ou te rive” — epi pratike youn sou lòt yon fwa.",
        "hours": 2,
        "skills": []
      },
      {
        "name": "Anrejistre seyans istwa yo",
        "description": "Chita ak yon sèl moun k ap rakonte alafwa nan yon kote trankil e konfòtab. Pase sou papye konsantman an ansanm anvan, apre sa sitou koute — pi bon entèvyou yo se sa yo kote ou pale pi piti.",
        "hours": 4,
        "skills": [
          "koute moun"
        ],
        "follows": [
          0,
          1
        ],
        "recurringCadence": "session"
      },
      {
        "name": "Klase yo epi bay kopi, jan moun yo vle",
        "description": "Make chak anrejistreman ak dat la, non yo, ak sa ki te dakò sou pataj. Kenbe de kopi yon kote ki an sekirite, bay chak moun ki rakonte pwòp kopi pa l, epi pataje an piblik sèlman moso chak moun te di wi pou yo.",
        "hours": 2,
        "follows": [
          2
        ],
        "skills": []
      }
    ]
  },
  {
    "id": "community-solar-coop",
    "name": "Koperativ solèy ak enèji kominote a",
    "purpose": "Mete fòs vwazen yo ansanm nan enèji pwòp yo pataje k ap desann bòdwo tout moun — sitou pou lokatè ak fanmi ki pa t ap janm ka mete panno sou yon do kay pa yo.",
    "whoItServes": "Lokatè, fanmi ak ti revni, ak nenpòt moun do kay li, mèt kay li, oswa mwayen li fèmen deyò solèy sou do kay.",
    "whatYoullNeed": "Manm ki angaje, konesans teknik ak konesans lajan ou ka jwenn nan men lòt moun oswa aprann, yon kote pou enstale oswa yon sistèm solèy kominotè ki deja egziste pou antre ladan l, ak òganizasyon zanmi. Yon bagay ki di klè: koperativ enèji pote vrè konpleksite legal ak lajan — pran konsèy nan men pwofesyonèl kalifye sou estrikti a, kote lajan an soti, ak kontra yo anvan pèsonn siyen anyen.",
    "setupHours": 27,
    "defaultCategory": "infrastructure",
    "firstSteps": "Anvan panno oswa papye, pale ak de gwoup moun: vwazen ki ta antre vre, pou mezire angajman tout bon, ak yon koperativ solèy yon vil oswa yon zòn pi lwen ki deja fè l — y ap di w ki modèl ki mache ak règ zòn ou an e ki erè ki te koute yo lajan. Apre sa, li règ lokal yo ak je pa w, paske se yo menm, pa antouzyas ou, k ap deside sa ki posib.",
    "commonPitfalls": "Koperativ solèy mouri nan twou ant antouzyas ak siyati: yon ane reyinyon sou yon modèl règ zòn ou an pa t janm pèmèt, oswa yon kontra ki siyen san revizyon pwofesyonèl ki fèmen manm yo nan kondisyon pèsonn pa t konprann. Lòt sa k touye a se lajan twoub — si manm yo pa ka wè klè sa yo mete ak sa k tounen vin jwenn yo, konfyans lan manje epi koperativ la defèt.",
    "pairsWith": [
      "weatherization-brigade",
      "bulk-buying-coop"
    ],
    "tasks": [
      {
        "name": "Rasanble manm epi gade kiyès ki angaje",
        "description": "Chèche fanmi ki enterese nan enèji pwòp ki koute mwens epi dekouvri jis ki bò yo angaje vre — anvi vag ak yon manm ki siyen se de bagay diferan. Chif ou yo ap deside ki modèl ki reyalis, kidonk konte onètman anvan ou planifye.",
        "hours": 4,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Aprann modèl yo ak règ lokal yo",
        "description": "Fè rechèch sou ki jan solèy kominotè mache kote ou rete: lwa yo, net metering, sistèm kote moun pran yon pòsyon, estrikti koperativ. Règ yo chanje anpil de yon kote a yon lòt epi se yo k ap deside sa ki posib vre — fè sa anvan ou tonbe damou pou yon sèl modèl.",
        "hours": 5,
        "skills": [
          "rechèch"
        ]
      },
      {
        "name": "Jwenn yon kote pou enstale oswa yon sistèm pou antre",
        "description": "Chèche yon do kay oswa yon moso tè pou yon enstalasyon pataje, oswa tcheke si yon sistèm solèy kominotè ki deja egziste ka resevwa gwoup ou a pou pran yon pòsyon ansanm — antre nan youn ki la souvan pi rapid pase bati. Peze de chimen yo ak manm yo anvan ou angaje.",
        "hours": 4,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Regle kote lajan an soti ak estrikti legal la",
        "description": "Deside ki jan pwojè a ap jwenn lajan ak ki jan li dirije, epi fòme koperativ la kòrèkteman. Se etap sa a ki gen vrè konsekans legal ak lajan — fè pwofesyonèl kalifye revize estrikti a ak chak kontra, epi pa siyen anvan yo fin li.",
        "hours": 5,
        "skills": [
          "papye",
          "kontablite"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Chwazi enstalatè ak konpayi serye",
        "description": "Jwenn enstalatè oswa konpayi ki gen bon non, mande plizyè pri alekri, epi pran alekri sa fabrikan an ap repare gratis ak plan antretyen alontèm nan. Yon enstalasyon bon mache san plan antretyen se yon enstalasyon chè nan senk an.",
        "hours": 3,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Monte sistèm rabè bòdwo ak manm yo",
        "description": "Travay egzakteman ki jan ekonomi yo oswa rabè yo rive jwenn manm yo ak ki jan manm ak peman yo mache. Fè l transparan e fasil pou konprann — yon manm dwe ka wè, sou yon sèl paj, sa l mete ak sa k tounen vin jwenn li.",
        "hours": 3,
        "skills": [
          "kontablite",
          "antre done"
        ],
        "follows": [
          3
        ]
      },
      {
        "name": "Montre manm yo jere kouran yo",
        "description": "Ede manm yo li bòdwo yo epi desann konsomasyon yo — yon kilowat ou ekonomize bat yon kilowat ou pwodui. Mete ekonomi solèy la ansanm ak ti konsèy senp pou fanmi yo wè diferans lan sou papye.",
        "hours": 3,
        "skills": [
          "montre moun"
        ]
      }
    ]
  },
  {
    "id": "worker-coop-incubator",
    "name": "Koperativ travayè ak aprann metye",
    "purpose": "Ede vwazen yo bati metye ak ladrès epi lanse koperativ travayè — mwayen pou viv kote se moun k ap fè travay la ki mèt espas travay la e se yo ki pran desizyon yo.",
    "whoItServes": "Vwazen ki san travay oswa ki pa jwenn ase travay, ak nenpòt moun ki vle yon vrè plas ak yon vrè vwa kote l ap travay la.",
    "whatYoullNeed": "Moun eksperyans nan biznis ak koperativ pou akonpaye, espas ak materyèl pou seyans yo, kote pou jwenn lajan ou ka montre koperativ nèf yo, ak lyen — moun ki konn devlope koperativ, kote koperativ konn jwenn lajan, ak pwojè “Youn montre lòt” kominote a.",
    "setupHours": 27,
    "defaultCategory": "education",
    "firstSteps": "Kòmanse ak chita pale, pa ak yon plan leson: chita ak manm ki enterese sou sa yo konn fè ak sa yo vle bati, epi chèche gwoup ladrès ki ta ka tounen yon vrè antrepriz. Anmenmtan, jwenn moun ki konn devlope koperativ nan zòn ou an oswa yon koperativ travayè ki deja egziste ki dakò akonpaye gwoup la — mak yo pran yo se leson pa w, epi fòme yon koperativ san gid sa a se la gwoup yo konn pran frap.",
    "commonPitfalls": "Sa echwe de fason: tankou yon seri seyans ki pa janm lanse anyen, paske pèsonn pa t pouse yon gwoup ladrès vè yon vrè antrepriz — oswa tankou yon lansman ki sote pati raz yo, ki fè papye legal sou yon modèl telechaje epi dekouvri dezòd desizyon ak taks la dezan apre. Li mouri san bri tou lè yon sèl moun k ap òganize kenbe tout relasyon ak moun k ap akonpaye yo ak kote lajan yo; pataje kontak sa yo depi premye jou a.",
    "pairsWith": [
      "skill-share",
      "solidarity-fund",
      "time-bank"
    ],
    "tasks": [
      {
        "name": "Gade sa manm yo konn fè ak sa yo vle",
        "description": "Chita ak manm yo epi aprann sa yo konn fè ak sa yo vle bati. Se gwoup w ap chèche — twa moun ki konn fè manje, yon ekip ak metye bilding, senk moun ki konn netwaye — paske yon gwoup ladrès se semans yon koperativ ki ka kenbe.",
        "hours": 4,
        "skills": [
          "fè entèvyou"
        ]
      },
      {
        "name": "Fè seyans preparasyon travay ak metye",
        "description": "Fè seyans sou CV, entèvyou travay, metye, ladrès dijital, ak jere lajan. Apiye sou pwojè “Youn montre lòt” kominote a epi fè ekspè deyò vini pou sa pèsonn lokal pa ka montre — bi a se manm ki kapab, kit yon koperativ fòme bò kote yo kit li pa fòme.",
        "hours": 5,
        "skills": [
          "montre moun"
        ]
      },
      {
        "name": "Montre modèl koperativ la",
        "description": "Pase ak manm yo sou sa sa vle di lè travayè yo mèt ak lè desizyon pran ak vwa tout manm: ki jan pwofi separe, ki jan desizyon pran, ak ki jan sa diferan de yon biznis klasik. Moun pa ka chwazi yon modèl yo pa janm wè — sèvi ak vrè koperativ kòm egzanp.",
        "hours": 4,
        "skills": [
          "montre moun",
          "mennen reyinyon"
        ]
      },
      {
        "name": "Akonpaye gwoup k ap fòme koperativ",
        "description": "Lè yon gwoup pare, ede yo ekri yon plan biznis epi chwazi yon estrikti legal. Konekte yo ak avoka ak kontab ki konn koperativ olye yo enpwovize etap legal ak kontablite yo — papye legal ki fèt mal koute chè pou defèt.",
        "hours": 5,
        "skills": [
          "papye"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Konekte yo ak kote pou jwenn lajan",
        "description": "Kenbe yon lis vivan tout kote yon koperativ ka jwenn lajan pou kòmanse — ti lajan kòmansman, don, fon pou devlope koperativ, espas ki akonpaye biznis nèf — epi ede yo ranpli demann yo vre. Lajan pou koperativ egziste men li mal make — kat ou fè a vo vrè lajan.",
        "hours": 3,
        "skills": [
          "rechèch"
        ]
      },
      {
        "name": "Bay akonpayman",
        "description": "Mete chak antrepriz nèf ak yon moun ki gen eksperyans koperativ oswa biznis k ap pran nouvèl yo pandan premye etap frajil yo. Se nan premye ane a koperativ konn tonbe; yon moun serye ki deja wè chimen an chanje chans yo.",
        "hours": 3,
        "skills": []
      },
      {
        "name": "Bati tèt ansanm ant koperativ yo",
        "description": "Mete antrepriz yo ansanm nan yon rezo kote koperativ pataje leson, voye pratik youn bay lòt, epi achte youn nan men lòt. Koperativ k ap achte ak vann youn ak lòt travèse move tan ki touye sa k ap kanpe pou kont yo.",
        "hours": 3,
        "skills": [
          "òganize"
        ]
      }
    ]
  },
  {
    "id": "elder-meal-delivery",
    "name": "Manje ak vizit zanmitay pou granmoun yo",
    "purpose": "Pote manje regilye ak vizit zanmitay bay granmoun ki pa ka soti lakay yo — manje a enpòtan, men dis minit pale devan pòt la souvan konte plis toujou.",
    "whoItServes": "Granmoun ki izole, ki pa ka soti, oswa ki fèb — ansanm ak fanmi yo k ap enkyete pou yo depi lwen.",
    "whatYoullNeed": "Moun serye ou fin tcheke byen anvan yo antre kay granmoun, yon sous manje, wout ki byen planifye, ak kèk prensip sekirite senp pou moman yon granmoun pa reponn nan pòt la.",
    "setupHours": 22,
    "defaultCategory": "food",
    "firstSteps": "Kòmanse ak sous manje a ak senk premye granmoun yo, pa ak yon lis non: pale ak ekip “Manje kominotè” a oswa de twa moun ki konn fè manje sou sa yo ka pwodui chak semèn san rate, epi mande moun k ap travay ak granmoun yo, enfimyè legliz yo, ak famasyen yo ki granmoun ki vrèman rete san manje. Tcheke premye moun k ap ede yo anvan premye livrezon an, pa apre — konfyans w ap bati a kanpe oswa tonbe sou ki moun k ap pase pòt sa yo.",
    "commonPitfalls": "Echèk ki danjere a se yon siyal ki pase san repons — yon moun k ap ede ki pa okipe yon pòt ki pa reponn paske pèsonn pa t ekri sa pou fè, oswa yon alèji ki pa janm rive sou fèy wout la. Echèk ki dousman an se enstabilite: granmoun yo òganize jounen yo sou vizit la, epi yon wout ki sote kèk semèn montre yo pa konte sou ou. Pito senk granmoun jwenn manje chak semèn san rate pase ven granmoun jwenn li tanzantan.",
    "pairsWith": [
      "community-meal",
      "neighborhood-care-network",
      "rides-transportation"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Jwenn granmoun ki pa ka soti yo",
        "description": "Jwenn granmoun yo nan klinik, sèvis pou granmoun, legliz, ak bouch an bouch. Fè l ak respè, epi se granmoun nan ki pou di wi — w ap ofri manje ak konpayi, ou p ap mete pèsonn sou yon lis pou veye yo.",
        "hours": 3,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Chèche moun serye epi tcheke yo",
        "description": "Nenpòt moun k ap antre lakay yon granmoun dwe tcheke: referans ak yon ti ankèt debaz, san eksepsyon menm pou zanmi zanmi. Apre sa, vize estabilite — granmoun yo pi alèz ak menm figi yo konnen an chak semèn pase ak moun k ap chanje tout tan.",
        "hours": 4,
        "skills": [
          "òganize"
        ]
      },
      {
        "name": "Jwenn yon sous manje",
        "description": "Òganize manje ak yon kizin kominotè, moun ki vle fè manje lakay yo, oswa restoran ki bay pòsyon. Veye nitrisyon ak manje ki fasil pou chofe, epi make chak veso ak sa ki ladan l — yon manje san etikèt se yon danje pou moun ki gen alèji.",
        "hours": 4,
        "skills": [
          "fè manje",
          "sekirite manje"
        ]
      },
      {
        "name": "Trase wout yo ak orè a",
        "description": "Gwoupe granmoun yo nan wout ki pratik epi mete yon ritm moun ka konte sou li — menm jou yo, prèske menm lè yo. Kite kèk minit poze pou pale nan chak kanpe; pou anpil granmoun, se sa ki vrè livrezon an.",
        "hours": 3,
        "skills": [
          "kondwi",
          "òganize"
        ],
        "follows": [
          0,
          2
        ]
      },
      {
        "name": "Ekri alèji ak kontak enpòtan yo",
        "description": "Pou chak granmoun, ekri sa yo ka manje, alèji yo, medikaman ki konte bò kote manje, ak moun pou rele si gen pwoblèm. Sere l an sekirite epi bay sèlman sa ki nesesè — chofè a bezwen alèji a, li pa bezwen tout istwa medikal la.",
        "hours": 3,
        "skills": [
          "antre done"
        ]
      },
      {
        "name": "Mete yon plan si granmoun nan pa reponn",
        "description": "Ekri egzakteman sa yon moun k ap ede fè lè yon granmoun pa reponn oswa sanble malad: ki moun pou rele an premye, ki lè pou rele fanmi an oswa sèvis ijans yo, ak ki jan pou note sa ki pase. Deside sa davans pi bon pase enpwovize devan yon pòt.",
        "hours": 3,
        "skills": [
          "ekri"
        ],
        "follows": [
          4
        ]
      },
      {
        "name": "Pran nouvèl ekip la ak granmoun yo",
        "description": "Pran nouvèl moun k ap ede yo regilyèman, chanje wout lè yon moun bezwen yon ti repo, epi mande granmoun yo menm ki jan pwojè a ta ka sèvi yo pi byen. Y ap di w bagay moun k ap ede yo pa janm wè.",
        "hours": 2,
        "skills": []
      }
    ]
  },
  {
    "id": "disaster-relief-hub",
    "name": "Kote pou pataje pwovizyon lè katastwòf frape",
    "purpose": "Monte yon kote ki ka resevwa, triye, epi deplase pwovizyon vit lè yon katastwòf frape — paske se lojistik ki genyen oswa pèdi premye jou yo apre yon inondasyon oswa yon dife.",
    "whoItServes": "Vwazen ki pran kou nan inondasyon, tanpèt, dife, ak lòt katastwòf — kòmanse ak sa ki pi pa ka deplase oswa tann yo.",
    "whatYoullNeed": "Yon espas ki deja ranje ak yon rezèv, chemen klè pou jwenn pwovizyon, yon ekip moun ki ka kouri vini, ak yon antant ak “Rezo pou pare pou dezas” la — prèske tout sa ranje anvan nenpòt katastwòf, paske apre a li twò ta.",
    "setupHours": 24,
    "defaultCategory": "organizing",
    "suggestsWorkDays": true,
    "firstSteps": "Kote a egziste sou papye lontan anvan li egziste sou yon teren, kidonk kòmanse ak “Rezo pou pare pou dezas” la — se yo ki kenbe pyebwa kontak la ak konesans risk yo — epi ak kesyon onèt la: ki bilding ki t ap kite w antre vre a 6 è nan maten apre yon inondasyon. Regle antant espas la ak rezèv la anvan; tout lòt travay yo mare sou yon adrès.",
    "commonPitfalls": "Kote konsa echwe nan de direksyon: kote ki egziste sèlman kòm yon plan pèsonn pa t repete, kidonk vrè evènman an boule premye jou l sou kesyon yon jou pratik t ap deja reponn — ak kote ki louvri pòt li bay yon pakèt don li pa ka triye, pou l tounen yon depo rad initil pandan moun bezwen dlo. Dega ki pi an silans lan se lè èd la gen baryè: depi yon moun oblije pwouve li merite èd, ou rebati menm sistèm ou te monte kote sa a pou kontoune a.",
    "pairsWith": [
      "emergency-preparedness",
      "resource-hub-dispatch"
    ],
    "learnMore": [
      "internet-outage"
    ],
    "tasks": [
      {
        "name": "Chwazi espas la ak yon rezèv davans",
        "description": "Jwenn yon bilding oswa yon teren ki ka resevwa livrezon, triye machandiz, epi kenbe yon liy kote moun vin pran pwovizyon — plis yon rezèv si premye a kraze oswa pa jwenn aksè. Konfime aksè ak kle ak mèt kay yo kounye a, pandan tan an bèl; yon espas ou pa ka antre ladan l pa yon espas.",
        "hours": 3,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Ranje kote pwovizyon yo ap soti",
        "description": "Ranje davans kote dlo, manje, pwodui ijyèn, ak materyèl netwayaj ap soti — machann angwo, lòt òganizasyon zanmi, kolèt nan katye a. Menm jan enpòtan: yon fason pou konnen sa moun vrèman bezwen apre yon evènman, pou move bagay pa antere w.",
        "hours": 4,
        "skills": [
          "pale ak moun",
          "òganize"
        ]
      },
      {
        "name": "Òganize resevwa, triye, ak konte",
        "description": "Deside ki jan don yo ap resevwa, triye, epi swiv depi kamyon an rive. Chak kote ki neye anba machandiz san triye te sote etap sa a — chwazi kategori w yo, etikèt yo, ak yon sistèm konte senp anvan ou bezwen yo.",
        "hours": 4,
        "skills": [
          "òganize",
          "antre done"
        ]
      },
      {
        "name": "Mete yon sistèm pou bay pwovizyon yo",
        "description": "Planifye ki jan pwovizyon yo ap soti: menm jan pou tout moun e san baryè — pa gen tcheke pyès idantite, pa gen prèv bezwen — ak livrezon lakay moun ki pa ka rive nan kote a. Mete moun ki pi frajil yo an premye, epi ekri priyorite sa a pou l siviv dezòd la.",
        "hours": 3,
        "skills": [
          "kondwi",
          "òganize"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Fòme yon ekip ki ka kouri vini",
        "description": "Bati yon lis moun ki ka mobilize sou ti preyavi, epi prepare yo davans sou wòl yo, règ sekirite yo, ak sistèm resevwa ak bay pwovizyon w lan. Yon ekip douz moun ki prepare fè plis travay pase yon foul senkant moun ki vle byen men ki pa prepare.",
        "hours": 4,
        "skills": [
          "montre moun"
        ]
      },
      {
        "name": "Antann ou ak lòt ekip k ap reponn",
        "description": "Prezante kote a bay biwo leta ki reskonsab ijans yo ak lòt gwoup k ap pote èd anvan anyen rive. Mete dakò sou ki moun ki kouvri kisa, pou w ap bouche twou olye w ap fè menm travay de fwa — youn ede lòt mache pi vit egzakteman kote repons ofisyèl la pi dousman.",
        "hours": 3,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Planifye kominikasyon ak sekirite",
        "description": "Fè plan pou lè rezo yo tonbe: fason pou kontakte moun san entènèt, lis enprime, ak yon lyen ak pyebwa kontak “Rezo pou pare pou dezas” la. Mete règ sekirite di pou moun k ap ede yo — pèsonn pa antre nan kay ki ka tonbe, jamè — epi mete yo alekri.",
        "hours": 3,
        "skills": [
          "ekri"
        ]
      }
    ]
  },
  {
    "id": "recovery-peer-support",
    "name": "Rezo èd ant parèy pou moun k ap geri anba alkòl ak dwòg",
    "purpose": "Fè parèy mennen èd pou vwazen k ap geri anba alkòl oswa dwòg, oswa k ap chèche kòmanse — yon konpleman pou tretman pwofesyonèl, jamè yon ranplasman.",
    "whoItServes": "Moun ki nan chimen geri a, moun k ap reflechi sou li, ak fanmi ak zanmi k ap mache bò kote yo.",
    "whatYoullNeed": "Animatè parèy ki viv sa nan pwòp lavi yo epi ki resevwa vrè fòmasyon, yon espas prive ki an sekirite, chemen klè pou voye moun jwenn pwofesyonèl, ak limit ki di klè: èd ant parèy konplete tretman pwofesyonèl, li pa ranplase l; animatè yo pa doktè epi yo pa dwe janm bay konsèy sou detoks oswa medikaman; epi toujou gen yon plan klè pou konekte nenpòt moun ki nan kriz ak èd pwofesyonèl oswa sèvis ijans yo.",
    "setupHours": 22,
    "defaultCategory": "emotional_support",
    "firstSteps": "Kòmanse ak moun k ap kenbe espas la: jwenn youn oswa de vwazen ki gen yon solid eksperyans geri nan pwòp lavi yo, fè yo antre nan yon fòmasyon fòmèl pou èd ant parèy, epi ansanm ekri limit yo — sa rezo a ye ak sa li pa ye — anvan ou anonse anyen. Apre sa, al rankontre sèvis tretman ak sèvis kriz nan zòn nan fasafas, pou chemen w ap voye moun nan se yon relasyon, se pa yon nimewo sou yon feyè.",
    "commonPitfalls": "Sa vin danjere lè liy lan twouble — yon animatè ki gen bon kè k ap bay konsèy sou detoks oswa medikaman, sa ki ka touye, oswa yon gwoup k ap glise nan fè tretman amatè paske chemen pou voye moun nan pa t janm reyèl. Li echwe an silans lè konfidansyalite kraze — yon sèl istwa ki koule vide sal la nèt — ak lè animatè yo bouke twòp, lè moun k ap kenbe geri tout lòt yo pa gen okenn èd pou pa l.",
    "pairsWith": [
      "mental-health-peer-support",
      "harm-reduction-supplies"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Jwenn animatè parèy epi fòme yo",
        "description": "Chèche moun ki viv chimen geri a nan pwòp lavi yo epi fè yo pase yon fòmasyon rekonèt pou èd ant parèy. Di l klè depi premye chita pale a: animatè yo se parèy, se pa doktè ni sèvis klinik, epi se fòmasyon an ki kenbe liy sa a an sekirite.",
        "hours": 5,
        "skills": [
          "mennen reyinyon",
          "montre moun"
        ]
      },
      {
        "name": "Ekri limit rezo a",
        "description": "Mete alekri sa rezo a fè — èd ant parèy, koneksyon, ankourajman — ak sa li pa fè: tretman, detoks, swen medikal, konsèy sou medikaman. Yon limit ekri pwoteje manm yo kont move konsèy epi pwoteje animatè yo pou yo pa pote sa ki pa pou yo.",
        "hours": 3,
        "skills": [
          "ekri"
        ]
      },
      {
        "name": "Trase chemen pou kriz ak pwofesyonèl",
        "description": "Bati relasyon travay ak sèvis tretman pwofesyonèl, swen medikal, ak sèvis kriz yo, epi ekri yon plan repons pou ovèdòz. Lè yon moun nan sal la bezwen plis pase sa parèy ka bay, se yon kout telefòn cho ki pou fèt, ant moun ki konnen youn lòt — se pa yon feyè ou lonje ba li.",
        "hours": 4,
        "skills": [
          "pale ak moun",
          "rechèch"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Jwenn yon espas prive san alkòl san dwòg",
        "description": "Jwenn yon sal ki konfidansyèl, akeyan, san jijman e san okenn alkòl oswa dwòg — yon kote moun ka antre san sa pa di anyen sou yo. Bibliyotèk, sal kominotè, ak espas legliz ki gen yon antre apa mache byen.",
        "hours": 2,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Mete règ konfidansyalite ak règ gwoup la",
        "description": "Mete dakò sou règ fondal yo: sa ki di isit la rete isit la, respè san fòse konsèy sou moun, ak dwa chak moun pou pale oswa pou pase. Repete yo byen fò nan kòmansman chak rankont — règ yo pwoteje moun sèlman lè yo fre nan tèt tout moun.",
        "hours": 3,
        "skills": [
          "mennen reyinyon"
        ]
      },
      {
        "name": "Fikse lè rankont yo epi fè yo konnen",
        "description": "Ofri plis pase yon sèl lè rankont pou moun k ap travay chak lè ak paran ka vini, epi pale de li nan mo senp ki pa jije — gratis, louvri, san kondisyon. Se jan feyè a ekri ki deside ki moun ki santi yo an sekirite pou parèt.",
        "hours": 3,
        "skills": [
          "pale ak moun"
        ],
        "follows": [
          3
        ]
      },
      {
        "name": "Soutni animatè yo pou yo pa bouke nèt",
        "description": "Pran nouvèl animatè yo regilyèman, chanje moun k ap mennen an, epi asire yo gen èd pou pwòp tèt yo — kenbe espas pou geri lòt moun se yon travay lou, epi pwòp chimen geri yon animatè toujou vini an premye.",
        "hours": 2,
        "skills": [
          "koute moun"
        ]
      }
    ]
  },
  {
    "id": "community-fitness",
    "name": "Gwoup egzèsis ak byennèt nan katye a",
    "purpose": "Fè vwazen yo bouje ansanm gratis — gwoup mache, etirman, ti match ant vwazen, dans — paske santi w byen nan kò w pa ta dwe koute pri yon djim.",
    "whoItServes": "Nenpòt moun ki vle bouje, sitou vwazen ki pa ka peye djim, granmoun, ak moun izole pou ki konpayi a konte menm jan ak egzèsis la.",
    "whatYoullNeed": "Moun ki vle mennen aktivite yo, espas ki an sekirite e aksesib, ak yon ti kras materyèl. Yon stil akeyan, san presyon, konte plis pase diplòm — men nenpòt moun k ap mennen yon aktivite ki mande fòs dwe gen fòmasyon ki matche ak li, epi chak seyans bezwen dlo, echofman, ak yon twous premye swen toupre.",
    "setupHours": 19,
    "defaultCategory": "other",
    "firstSteps": "Anvan ou mete anyen sou kalandriye, mande moun ou espere wè yo sa yo ta renmen vre — yon gwoup mache, etirman sou chèz, yon sware dans — ak sa ki posib pou kò yo; se repons yo ki pou chwazi aktivite yo, pa lekontrè. Apre sa, jwenn youn oswa de moun pou mennen ki gen chalè ki peze plis pase konesans yo, mache vizite espas yo ansanm, epi lanse yon sèl seyans chak semèn ki fyab anvan ou ajoute lòt.",
    "commonPitfalls": "Sa mouri de fason: li tounen yon espektak — manm ki pi anfòm yo mete kadans lan, pale a glise sou pèz ak aparans, epi menm moun li te fèt pou yo a sispann vini san bri — oswa li vin enstab, paske anyen pa touye yon gwoup mache pi vit pase rive de fwa sou yon seyans ki anile. Sote ti bagay sekirite annuiyan yo se twazyèm nan: san echofman, san dlo, san twous premye swen, yon sèl move tonbe fini tout bagay la.",
    "pairsWith": [
      "disability-support-network",
      "neighborhood-care-network"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Mande moun sa yo ta renmen",
        "description": "Mande toupatou — nan londri a, nan bilding granmoun yo, devan pòtay lekòl la — ki kalite mouvman moun renmen ak sa ki santi aksesib pou yo. Kite repons yo mennen: yon lis espò pèsonn pa t mande pa ede pèsonn.",
        "hours": 2,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Jwenn moun pou mennen aktivite yo",
        "description": "Chèche moun ki vle mennen mache, etirman, dans, oswa ti match. Yon stil akeyan san presyon bat konesans pou pifò aktivite — men nenpòt moun k ap mennen yon bagay ki mande fòs dwe gen fòmasyon ki matche ak li.",
        "hours": 3,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Jwenn espas ki an sekirite",
        "description": "Mande pou pak, sal kominotè, ak jimnastik lekòl — gratis oswa bon mache, epi moun ka rive san machin. Tcheke chak espas pou tout kalite kò ak kapasite: tè plat, kote pou chita, lonbraj, twalèt, ak yon kote pou pare lapli si tan an vire.",
        "hours": 3,
        "skills": []
      },
      {
        "name": "Prepare aktivite pou tout nivo",
        "description": "Fè chak aktivite yon jan pou moun ka antre nan pwòp kadans yo epi adapte l jan yo vle — yon opsyon chèz pou etirman an, yon ti bouk kout anndan gwo mache a. Kenbe pale a sou santi w byen, bouje, ak fè zanmi, jamè sou aparans oswa pèfòmans.",
        "hours": 3,
        "skills": []
      },
      {
        "name": "Okipe sekirite ak sante",
        "description": "Mete echofman ak dlo nan chak seyans, kenbe yon twous premye swen byen ranje toupre, epi konseye moun ki fèk kòmanse egzèsis wè yon doktè anvan. Montre moun k ap mennen yo veye fatig twòp epi fè ralanti santi nòmal, pa yon bagay ki fè moun mal alèz.",
        "hours": 3,
        "skills": [
          "premye swen"
        ]
      },
      {
        "name": "Fikse orè a epi gaye nouvèl la",
        "description": "Chwazi lè fiks moun ka bati yon abitid sou yo epi kenbe yo. Gaye nouvèl la toupatou — feyè, gwoup mesaj, bouch an bouch — epi di klè tout laj, tout gwosè, ak tout kapasite byenveni, paske anpil moun sipoze yo pa ladan l.",
        "hours": 3,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Bati zanmitay ak regilarite",
        "description": "Fè seyans yo sosyal: aprann non moun, akeyi nouvo yo, kite kèk minit pou pale. Fete parèt la olye nenpòt chif — se koneksyon an ki fè moun kontinye vini lontan apre nouvote a pase.",
        "hours": 2,
        "skills": [
          "mennen reyinyon"
        ]
      }
    ]
  },
  {
    "id": "urban-orchard",
    "name": "Jaden pyebwa fwi ak forè manje nan vil la",
    "purpose": "Plante pyebwa fwi ak nwa ak plant manje ki dire sou tè tout moun pataje — yon forè manje ki, yon fwa li chita, bay katye a manje fre gratis pandan dè dizèn ane.",
    "whoItServes": "Tout kominote a, ata vwazen ki poko rive yo — pyebwa ki plante ane sa a tounen yon sous manje fre gratis pou tout moun pou lontan.",
    "whatYoullNeed": "Aksè tè alontèm (yon antant sezon pa sezon pa ase pou pyebwa), pyebwa ak plant ki matche ak klima a, moun pou konbit plantasyon yo, ak yon ti ekip moun k ap veye jaden an ki angaje pou ane, pa pou mwa. Konfime aksè dlo anvan anyen antre nan tè a.",
    "setupHours": 21,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Pale sou tè a vini anvan tout bagay: pale ak òganizasyon k ap kenbe tè pou kominote, biwo lavil ki okipe pak yo, legliz ki gen tè ki pa sèvi — nenpòt moun ki ka bay yon espas pou dis an, pa pou yon sezon — epi konfime dlo a pandan w ap fè sa. An menm tan, jwenn yon moun ki gen vrè eksperyans pyebwa fwi pou kenbe desen an, epi mande vwazen yo ki fwi yo t ap keyi e manje vre, paske yon jaden fwi pèsonn pa vle se gèp li nouri.",
    "commonPitfalls": "Jaden pyebwa raman echwe jou plantasyon an — yo echwe nan dezyèm ak twazyèm ane a, lè foul la ale epi pèsonn pa t òganize wouze a, kidonk jèn pyebwa yo mouri an silans nan premye sechrès yo. Lòt sa k touye yo se antant tè fèb yo kase egzakteman lè pyebwa yo kòmanse donnen, ak diskisyon rekòt paske pèsonn pa t dakò sou règ pataj anvan premye gwo rekòt la. Regle lis moun k ap veye a ak règ pataj yo bonè, pandan yo fasil toujou.",
    "pairsWith": [
      "community-garden",
      "gleaning-network",
      "seed-library"
    ],
    "tasks": [
      {
        "name": "Jwenn aksè tè alontèm",
        "description": "Jwenn yon antant ekri ki solid — yon lokasyon long, yon aranjman ak yon òganizasyon tè, yon angajman fòmèl lavil la — paske pyebwa bezwen dè dizèn ane, pa yon antant sezon pa sezon. Konfime dlo serye sou espas la anvan ou angaje w sou anyen.",
        "hours": 5,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Fè desen plantasyon an",
        "description": "Chwazi espès ki matche ak klima w epi fè desen an kouch forè manje: gwo pyebwa, ti pyebwa, ak plant kouvèti k ap travay ansanm. Prevwa plant polinizasyon yo ak espas pyebwa yo ap bezwen lè yo fin grandi, pa gwosè ti plan w ap plante yo.",
        "hours": 4,
        "skills": [
          "fè jaden"
        ]
      },
      {
        "name": "Jwenn pyebwa ak plant yo",
        "description": "Ranje pyebwa ak plant nan pepinyè, don, ak lavant rasin ni sezon an — pyebwa rasin ni ak jèn plant koute yon fraksyon pri pyebwa nan po epi anjeneral yo pran pi byen. Kòmande bonè; bon varyete fini vit.",
        "hours": 3,
        "skills": []
      },
      {
        "name": "Prepare teren an",
        "description": "Mete tè a pare anvan pyebwa yo rive: amelyore tè a, kouvri l ak pay, ranje wouze a, epi make ak netwaye chak twou plantasyon dapre desen an. Yon teren pare fè jou plantasyon an pase de dezòd a yon chenn travay.",
        "hours": 4,
        "skills": [
          "fè jaden"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Òganize konbit plantasyon yo",
        "description": "Fè konbit plantasyon ak enstriksyon klè, pou chak pyebwa antre nan bon fondè ak yon basen wouze ak pay ozalantou — yon pyebwa mal plante mouri dousman, san moun pa wè. Fè l yon fèt; se konbit la ki fè katye a kòmanse santi jaden an se pou li.",
        "hours": 5,
        "skills": [
          "fè jaden"
        ],
        "follows": [
          3
        ],
        "recurringCadence": "cycle"
      },
      {
        "name": "Òganize swen alontèm nan",
        "description": "Òganize travay san bri ki deside si jaden an ap viv la: wouze jèn pyebwa yo nan premye ete yo, taye, kouvri tè a, ak veye ti bèt yo, ane apre ane. Yon lis moun ki angaje ak non yo bat yon gwo lis moun ki enterese vagman.",
        "hours": 3,
        "skills": [
          "fè jaden"
        ]
      },
      {
        "name": "Mete règ pataj rekòt la",
        "description": "Mete dakò sou règ keyi ak pataj anvan premye gwo rekòt la, pa apre premye diskisyon an — ki moun ki keyi, ki lè, ak konbyen. Voye sa ki rete nan frijidè kominotè, rezèv manje katye a, ak manje pataje pou anyen pa pouri sou branch lan.",
        "hours": 2,
        "skills": []
      }
    ]
  },
  {
    "id": "new-parent-support",
    "name": "Rezo èd pou paran apre akouchman",
    "purpose": "Vlope paran ki fèk gen pitit ak paran k ap tann yo ak èd pratik — manje devan pòt, konmisyon fèt, vesèl lave, ak paran ki pase la deja — pandan gwosès la ak semèn di apre akouchman yo.",
    "whoItServes": "Paran ki fèk gen pitit ak paran k ap tann, sitou sa ki pa gen fanmi toupre — semèn apre yon akouchman se lè èd konte plis e se lè li rive pi piti.",
    "whatYoullNeed": "Moun ki ka fè manje, fè konmisyon, ak koute; yon chenn manje kote vwazen pote manje youn apre lòt; yon lis sèvis; ak paran ki gen eksperyans kòm parèy k ap soutni. Èd ant parèy se pa swen medikal ni swen sante mantal — depresyon apre akouchman komen e serye, kidonk chak parèy dwe konnen siy yo ak ki jan pou konekte yon paran dousman ak èd pwofesyonèl. Epi tcheke nenpòt moun k ap antre lakay moun oswa k ap ede ak tibebe anvan yo fè ni youn ni lòt.",
    "setupHours": 21,
    "defaultCategory": "childcare",
    "firstSteps": "Kòmanse ak paran ki akouche nan dènye ane a: mande yo sa ki t ap ede yo vre — repons yo (yon manje san vizit mare avè l, yon moun pou kenbe tibebe a pandan yo pran yon douch) pi presi pase sa ou ta kwè. Prezante rezo a bay fanmsaj yo, doula yo, ak klinik timoun ki ka ofri l bay fanmi yo, jwenn de oswa twa paran ki gen eksperyans kòm premye parèy ou yo, epi regle jan w ap tcheke moun anvan pèsonn pase yon papòt.",
    "commonPitfalls": "Echèk klasik la se èd k ap sèvi moun k ap ede a: moun ki rive sou pwòp orè yo, rete twò lontan, epi bay opinyon sou levasyon olye yo lave vesèl — paran ki bouke ap sispann reponn pòt la an silans olye yo di l. Sa ki pi grav la se yon parèy ki rate siy depresyon apre akouchman paske pèsonn pa t montre yo rekonèt li ni ba yo mo pou lonmen l. Epi èd ki disparèt apre de semèn, egzakteman lè premye vag manje a fini epi pati di a kòmanse, se pa èd menm.",
    "pairsWith": [
      "diaper-hygiene-bank",
      "childcare-collective",
      "welcome-wagon"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Jwenn moun k ap ede ak parèy yo",
        "description": "Sanble moun ki fè manje, moun ki fè konmisyon, ak — pi enpòtan an — paran ki gen eksperyans ki vle sèvi parèy. Paran ki sonje pwòp twazyèm semèn san dòmi pa l ofri yon bagay okenn ti liv pa ka bay.",
        "hours": 3,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Monte yon chenn manje",
        "description": "Fè yon fason senp pou òganize manje ki depoze pandan semèn apre akouchman an: yon kalandriye pataje, bezwen manje ak alèji mande yon sèl fwa, manje make e fasil pou chofe. Depoze devan pòt la dwe abitid la — yon manje pa dwe janm fòse yon vizit.",
        "hours": 3,
        "skills": [
          "fè manje",
          "òganize"
        ]
      },
      {
        "name": "Bay èd pratik",
        "description": "Òganize moun pou chay san bri a: konmisyon, lesiv, vesèl, ak veye pi gran timoun yo pou yon paran ka repoze oswa rive nan yon randevou. Mande sa yo vle chak fwa olye ou sipoze — èd itil swiv lis paran an, pa lis moun k ap ede a.",
        "hours": 3,
        "skills": [
          "okipe timoun"
        ]
      },
      {
        "name": "Fè yon lis sèvis yo",
        "description": "Sanble èd pou bay tete, swen sante mantal apre akouchman, klinik timoun, ak kote pou jwenn afè tibebe — ansanm ak “Bank kouchèt” la ak “Kolektif gade timoun” nan si kominote w genyen yo. Kenbe l ajou; yon lis nimewo ki pa mache pi mal pase okenn lis.",
        "hours": 4,
        "skills": [
          "antre done"
        ]
      },
      {
        "name": "Fè ti sèk parèy yo",
        "description": "Kòmanse ti gwoup kote nouvo paran ka di verite sou jan sa di, ak yon paran ki gen eksperyans k ap kenbe espas la. Fòme parèy yo sou siy depresyon ak enkyetid apre akouchman ak sou ankouraje swen pwofesyonèl dousman, san rete — jamè fè dyagnostik, jamè tann.",
        "hours": 3,
        "skills": [
          "mennen reyinyon"
        ]
      },
      {
        "name": "Mete règ sekirite ak limit yo",
        "description": "Tcheke chak moun k ap antre lakay moun oswa k ap ede ak tibebe — referans omwen — epi ekri limit yo: se paran an ki mete kondisyon yo, vizit yo kout sof si yo envite yo rete pi lontan, epi pèsonn pa parèt san avèti. Èd pa dwe janm santi tankou y ap veye w.",
        "hours": 3,
        "skills": []
      },
      {
        "name": "Konekte ak lòt pwojè yo",
        "description": "Konekte fanmi yo ak “Bank kouchèt” la, “Kolektif gade timoun” nan, ak “Bèl akèy” la pou yon sèl kontak louvri tout. Yon nouvo paran pa ta dwe oblije dekouvri chak èd apa nan moman ki pi fatigan nan lavi yo.",
        "hours": 2,
        "skills": [
          "pale ak moun"
        ]
      }
    ]
  },
  {
    "id": "foster-kinship-support",
    "name": "Rezo èd pou fanmi akèy ak fanmi k ap leve timoun fanmi yo",
    "purpose": "Kanpe dèyè fanmi akèy, fanmi pwòch k ap leve timoun, ak lòt moun k ap bay swen — rad ak yon kabann lè yon timoun rive lannwit, yon ti repo lè moun k ap okipe yo rive nan bout yo, ak parèy ki konprann travay la.",
    "whoItServes": "Paran akèy, grann ak fanmi k ap leve timoun — fanmi pwòch yo souvan kòmanse ak yon kout telefòn ak kèk èdtan avètisman — ak timoun ki nan swen yo.",
    "whatYoullNeed": "Moun pou ede, bagay moun bay nan tout laj ak tout gwosè, moun pou bay ti repo, ak antant ak ajans yo ak lekòl yo. Travay ak timoun ki nan sistèm nan sansib e lalwa kontwole l: tcheke tout moun k ap travay ak timoun, swiv obligasyon legal pou fè otorite yo konnen ak règ konfidansyalite yo mo pou mo, epi travay ansanm ak ajans yo, pa nan do yo.",
    "setupHours": 24,
    "defaultCategory": "childcare",
    "firstSteps": "Kòmanse ak yon chita pale nan ajans akèy la oswa sèvis k ap gide fanmi pwòch yo: aprann règ ki gouvène travay sa a — tcheke moun, obligasyon legal pou fè otorite yo konnen, konfidansyalite — anvan ou pran yon sèl moun pou ede, epi kite yo di w ki kote twou yo ye vre. Apre sa, mande kèk fanmi sa yo te bezwen nan premye semèn yo ak nan premye ane yo; bati sou repons sa yo, pa sou yon depo bagay pèsonn pa t mande.",
    "commonPitfalls": "Pwojè sa a ka echwe fò oswa an silans. Fò: yon moun ki pa tcheke bò kote timoun, oswa istwa yon fanmi ki pataje san pèmisyon — youn nan yo ka fè yon timoun mal, kase yon plasman, epi fini pwojè a nan yon jou. An silans: yon mòn bagay san triye pandan yon fanmi ap tann twa semèn pou yon kabann timoun piti, oswa trete ajans yo tankou lènmi jiskaske yo sispann voye fanmi. Piti, tcheke, e annakò bat gwo e enpwovize isit la, chak fwa.",
    "pairsWith": [
      "diaper-hygiene-bank",
      "free-store",
      "childcare-collective"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Rankontre fanmi k ap bay swen yo",
        "description": "Jwenn fanmi yo atravè ajans, lekòl, ak legliz — sitou fanmi pwòch yo, ki souvan resevwa yon pitit pitit oswa yon nyès lannwit menm, san preparasyon e ak yon ti kras èd ofisyèl. Fè premye kontak la yon men lonje, jamè yon egzamen.",
        "hours": 3,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Sanble rad ak materyèl",
        "description": "Sanble rad, kabann, chèz machin pou timoun, ak bagay chak jou nan tout laj ak tout gwosè, paske fanmi yo raman konnen ki moun k ap rive anvan yo rive. Tcheke bagay sekirite yo ak anpil atansyon — chèz machin ak bèso gen dat ekspirasyon ak lis rapèl faktori.",
        "hours": 4,
        "skills": [
          "òganize"
        ]
      },
      {
        "name": "Prepare sak pare pou menm jou a",
        "description": "Prepare sak tou pare — kèk jou rad, atik twalèt, ak yon ti bagay dous tankou yon ti nounous — klase pa laj ak gwosè, ki ka livre nan kèk èdtan apre yon timoun rive. Yon timoun ki rive san anyen pa fèt pou tann yon semèn pou gen yon bagay ki pou li.",
        "hours": 3,
        "follows": [
          1
        ],
        "skills": []
      },
      {
        "name": "Òganize ti repo pou fanmi yo",
        "description": "Ranje moun ki tcheke kòmsadwa pou veye timoun yo pou yon ti tan, pou fanmi yo ka repoze, kenbe randevou, oswa annik pran yon ti souf — fatig moun k ap bay swen se youn nan pi gwo rezon plasman kraze. Regle ak ajans yo ki moun ki gen dwa bay ti repo sa a ak anba ki règ.",
        "hours": 4,
        "skills": [
          "okipe timoun"
        ]
      },
      {
        "name": "Fè gwoup parèy pou fanmi yo",
        "description": "Fè rankont regilye kote paran akèy ak fanmi pwòch ka pataje eksperyans ak konsèy onèt ak moun ki konprann — travay sa a izole moun, epi fanmi ki twa ri pi lwen an ka pote menm chay la pou kont li.",
        "hours": 3,
        "skills": [
          "mennen reyinyon"
        ]
      },
      {
        "name": "Fè lis sèvis ak èd leta yo",
        "description": "Sanble sèvis, èd leta, ak akonpayman ki konprann chòk timoun yo pase, epi ede fanmi yo navige sistèm ki mele ata pwofesyonèl. Fanmi pwòch yo sitou souvan gen dwa a èd pèsonn pa janm di yo anyen sou li.",
        "hours": 3,
        "skills": [
          "antre done"
        ]
      },
      {
        "name": "Ekri règ sekirite ak vi prive timoun yo",
        "description": "Mete alekri epi swiv sa ki pa negosyab yo: tcheke nenpòt moun k ap travay ak timoun, sa lalwa mande pou moun k ap ede w yo fè otorite yo konnen, ak vi prive strik pou fanmi ak timoun — pa gen foto, pa gen istwa, pa gen detay ki pataje san pèmisyon.",
        "hours": 4,
        "skills": [
          "ekri"
        ]
      }
    ]
  },
  {
    "id": "weather-survival-outreach",
    "name": "Al jwenn vwazen yo lè gwo fredi ak gwo chalè",
    "purpose": "Pote pwovizyon pou kenbe lavi bay vwazen ki san kay lè tan an vin mòtèl — lenn ak ti sachè chalè pou men lè gwo fredi, dlo ak sewòm lè gwo chalè — pote yo kote moun yo ye vre a.",
    "whoItServes": "Vwazen ki san kay oswa k ap viv nan lari, ekspoze ak move tan ekstrèm — moun pou ki yon gwo chalè oswa yon gwo fredi se yon danje lanmò, pa yon ti deranjman.",
    "whatYoullNeed": "Pwovizyon dapre sezon an, moun pou fè wonn yo, wout ki planifye, ak lyen ajou ak kote moun ka pase nwit ak lòt sèvis. Chalè ak fredi ekstrèm touye: chak moun k ap ede dwe fòme pou rekonèt ipotèmi ak kout chalè epi rele èd medikal pwofesyonèl san pran tan — jamè tann pou wè.",
    "setupHours": 24,
    "defaultCategory": "mutual_aid_drive",
    "firstSteps": "Anvan ou achte yon sèl lenn, pale ak moun ak òganizasyon ki deja ap mache wout sa yo — se yo ki kenbe konfyans lan ak konesans kote moun yo ye vre, epi y ap di w sa ki kouvri ak sa ki manke. Mete dakò ak yo sou jan w ap antre ladan l, fikse chif previzyon ki lanse wonn ou yo, epi sanble pwovizyon sezon an pandan tan an dous toujou.",
    "commonPitfalls": "Echèk previzib la se kòmanse lè move tan an kòmanse: pwovizyon w ap chèche nan mitan yon gwo chalè rive apre danje a fin pase, epi etranje ki parèt pou premye fwa nan yon kriz jwenn yon “non mèsi” mefyan nan men moun lavi a te montre pou yo pridan. Echèk danjere yo se moun k ap eseye jere yon ijans medikal poukont yo olye yo rele èd touswit, ak fòse moun deplase oswa al dòmi yon lòt kote — ofri, enfòme, epi respekte repons lan.",
    "pairsWith": [
      "cooling-warming-center",
      "harm-reduction-supplies",
      "resource-hub-dispatch"
    ],
    "tasks": [
      {
        "name": "Prepare kit dapre sezon an",
        "description": "Prepare kit ki matche ak sezon an: lenn, chosèt cho, bonnèt, gan, ak ti sachè chalè pou fredi; dlo, ti sachè sewòm, krèm solèy, chapo, ak twal frechè pou chalè. Mete nan chak kit yon kat ki bay kote moun ka pase nwit yo ak nimewo pou moman kriz.",
        "hours": 4,
        "skills": []
      },
      {
        "name": "Jwenn pwovizyon yo",
        "description": "Fè kolèt, achte an gwo, epi mande magazen ak legliz yo pote kole — epi fè l anvan sezon an, paske chèche lenn pandan premye gwo fredi a se rive an reta. Sere ase pou ranfòse rezèv la nan mitan sezon an.",
        "hours": 4,
        "skills": [
          "pale ak moun",
          "kondwi"
        ]
      },
      {
        "name": "Konnen ki kote moun yo ye",
        "description": "Travay ak moun ki deja ap fè wonn yo pou konnen ki kote vwazen san kay yo rete vre — yo kenbe konfyans ak konesans ki bati sou ane, epi parèt ansanm ak yo bat parèt pou kont ou kote pèsonn pa konnen w. Kenbe kat la souple e ajou; moun deplase, sitou nan move tan.",
        "hours": 3,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Jwenn moun pou wonn yo epi fòme yo",
        "description": "Fòme chak moun anvan premye wonn yo: apwòch respektye ki aksepte yon non, sekirite pèsonèl ak toujou mache de pa de, ak rekonèt ijans medikal move tan pote. Pèsonn pa soti bay kit anvan yo fòme.",
        "hours": 4,
        "skills": [
          "montre moun"
        ]
      },
      {
        "name": "Trase wout yo ak plan an",
        "description": "Planifye wout ak lè pou jou anvan ak pandan move tan danjere a, pou rive jwenn moun ki pi ekspoze yo an premye — sa ki pi lwen sèvis yo, k ap dòmi deyò olye nan machin oswa yon kote ki gen twati. Deside davans ki previzyon ki lanse yon wonn.",
        "hours": 3,
        "skills": [
          "òganize"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Konekte moun ak kote pou pase nwit",
        "description": "Mache ak enfòmasyon ajou ou tcheke sou kote moun ka chofe kò oswa jwenn frechè, kabann pou pase nwit, ak “Kafou youn ede lòt” la — lè ak règ chanje tout tan, epi voye yon moun sou yon pòt fèmen boule konfyans. Ofri koneksyon san presyon; relasyon an dire pi lontan pase yon sèl nwit.",
        "hours": 3,
        "skills": [
          "pale ak moun"
        ]
      },
      {
        "name": "Prepare pou ijans medikal yo",
        "description": "Fòme chak moun pou rekonèt ipotèmi ak kout chalè — konfizyon, pale mele, po cho e sèk oswa frèt e mouye — epi rele sèvis ijans yo touswit, pa tann pou wè. Repete sa pou fè pandan èd la ap vini: lonbraj ak dlo, oswa lenn ak pare van an.",
        "hours": 3,
        "skills": [
          "premye swen"
        ]
      }
    ]
  }
];
