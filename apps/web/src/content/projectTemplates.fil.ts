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
import type { ProjectTemplate } from "./projectTemplates";

export const PROJECT_TEMPLATES_FIL: readonly ProjectTemplate[] = [
  {
    "id": "community-fridge",
    "name": "Ref ng komunidad at libreng paminggalan",
    "purpose": "Magbigay ng libreng pagkain at pang-araw-araw na gamit, bukas 24 oras, walang tanong-tanong.",
    "whoItServes": "Sinumang nangangailangan ng pagkain; malaking tulong lalo sa mga taong hindi regular ang oras ng trabaho, mga kapitbahay na walang papeles, at mga hindi nakakaabot sa food bank sa oras ng opisina.",
    "whatYoullNeed": "Isang donasyong ref, puwestong may bubong sa labas na may saksakan, isang host na lugar, at maliit na salitan sa paglilinis.",
    "setupHours": 18,
    "defaultCategory": "food",
    "firstSteps": "Simulan sa host, hindi sa ref. Umupo kasama ang may-ari ng tindahan, simbahan, o klinika na nasa isip mo at pag-usapan ang mga hindi magarbong bahagi — ang gastos sa kuryente, ang gagawin kapag may nag-iwan ng kalat, ang tatawagan kapag nasira ito — bago ka maghanap ng kahit isang ref. Habang ginagawa iyan, tanungin ang mga food pantry at grupo ng tulungan na kumikilos na sa malapit kung anong puwang ang nakikita nila, para isang puwang ang punan ng ref imbes na doblehin sila.",
    "commonPitfalls": "Halos hindi namamatay ang ref ng komunidad dahil sa kulang na donasyon — namamatay ito kapag walang malinaw na may hawak ng paglilinis, dumudumi ang ref, at dahan-dahang hinihiling ng host na alisin na ito. Ilagay ang mga pangalan sa salitan bago pa ang araw ng pagbubukas, at ituring ang relasyon sa host bilang ang tunay mong inaalagaan, hindi lang ang ref.",
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
        "name": "Humanap ng host na may kuryente at daanan ng tao",
        "description": "Lapitan ang maliliit na negosyo, simbahan, klinika, o community center. Itanong kung papayag silang maglagay ka ng ref sa ilalim ng kanilang bubong at isaksak ito (maliit lang karaniwan ang dagdag sa kuryente kada buwan — alukin mong ikaw ang sasagot dito). Kumuha ng simpleng oo na nakasulat.",
        "hours": 3,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Maghanap ng ref at panangga sa ulan at init",
        "description": "Mag-post ng hiling para sa gumaganang ref sa mga lokal na grupo. Gumawa o bumili ng simpleng kahoy na kabinet o habong sa paligid nito bilang panangga sa ulan at araw. Iangkla ito para hindi matumba. Kasama na rito ang paghahanap, paghahakot, at pagbuo.",
        "hours": 8,
        "skills": [
          "karpinterya",
          "pagmamaneho"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Itakda ang mga patakaran at lagyan ng label ang lahat",
        "description": "Magpaskil ng malinaw na karatulang may ilang wika: kunin ang kailangan mo, mag-iwan ng kaya mo, walang expired, walang binoteng gawang-bahay, walang hilaw na karne. Maglagay ng mga label at marker para malagyan ng petsa ang mga pagkain.",
        "hours": 1.5,
        "skills": [
          "pagsusulat",
          "pagsasalin"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Buuin ang salitan sa paglilinis at muling pagpupuno",
        "description": "Gumawa ng lingguhang iskedyul ng grupo. Tig-15 minuto ang bawat turno: punasan ang loob, itapon ang panis o lampas na sa petsa, at itala kung ano ang paubos na. Maglagay ng panlinis sa mismong lugar.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "pag-aayos"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Buuin ang mga regular na pagkukunan",
        "description": "Hilingin sa mga panaderya, groserya, restawran, at talipapa ang regular na sobra sa katapusan ng araw. Mag-ayos ng isang tagasundo. Itala kung aling pinagkukunan ang maaasahan.",
        "hours": 3,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Maglagay ng contact para sa problema",
        "description": "Maglagay ng isang numero ng telepono o email sa ref para sa “sira ang ref / walang kuryente / may tanong.” Pagpasyahan kung sino ang sasagot at gaano kabilis.",
        "hours": 0.5,
        "skills": []
      }
    ]
  },
  {
    "id": "community-garden",
    "name": "Halamanan ng komunidad / taniman ng magkakapitbahay",
    "purpose": "Sama-samang magtanim ng libreng sariwang ani at bumuo ng tagpuan.",
    "whoItServes": "Mga kapitbahay na walang bakuran, mga taong hirap sa gastos sa pagkain, at sinumang naghahanap ng koneksyon at dahilan para lumabas ng bahay.",
    "whatYoullNeed": "Isang lupang mapagtataniman (kahit bakanteng lote o rooftop), lupa o mga taniman, mapagkukunan ng tubig, mga binhi, at ubod na grupo ng 5–10 regular.",
    "setupHours": 25,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Bago mo hawakan ang lupa, kausapin ang dalawang grupo ng tao: ang may-ari ng lupa, at ang mga kapitbahay na katabi mismo nito — kasinghalaga ng kasunduan ang kanilang basbas. Pagkatapos, tipunin ang mga malamang maging regular at pag-usapan nang maaga ang modelo ng hatian; ang malaman kung kanya-kanyang taniman ito o iisang ani ng lahat ay nagbabago sa lahat ng itatayo mo.",
    "commonPitfalls": "Karaniwang hindi namamatay ang halamanan sa simula ng pagtatanim — namamatay ito sa pinakamainit na mga linggo, kapag tahimik na bumabagsak ang salitan sa pagdidilig at nanunuyo ang mga taniman. Ang isa pang dahan-dahang pumapatay: ang isang taong itinuturing itong sarili niyang halamanan at basta tagabuhat lang ang iba; isulat kung paano pinagpapasyahan ang mga bagay habang magkakagusto pa ang lahat.",
    "pairsWith": [
      "seed-library",
      "community-composting",
      "food-preservation"
    ],
    "tasks": [
      {
        "name": "Siguruhin ang lupa at pahintulot",
        "description": "Tumingin ng bakanteng lote, bakuran ng simbahan, lupa ng paaralan, o hindi nagagamit na sulok ng parke. Hanapin ang may-ari (talaan ng lupa sa lokal na pamahalaan, o magtanong lang). Kumuha ng nakasulat na pahintulot o kasunduan, kahit isang-taong kasunduang nakasulat lang, at tiyakin ang mapagkukunan ng tubig.",
        "hours": 6,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Ipasuri ang lupa at iplano ang mga taniman",
        "description": "Magpadala ng murang soil test sa lokal na opisina ng agrikultura para matiyak na walang tingga o kontaminasyon. Kung masama ang lupa, magplano ng mga nakaangat na taniman na may malinis na lupa. Iguhit kung saan ilalagay ang mga taniman, daanan, at lalagyan ng kasangkapan.",
        "hours": 2,
        "skills": [
          "paghahalaman"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Magtipon ng materyales at magtayo",
        "description": "Mangalap ng kahoy o gumamit ng taniman mula sa bigkis ng dayami o keyhole na disenyo, compost, at mulch. Magdaos ng bayanihan sa pagtatayo; mabilis maiaangat ng maraming kamay ang mga taniman. Maglagay ng hose o mga drum na sasalo ng tubig-ulan.",
        "hours": 10,
        "skills": [
          "karpinterya"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Pagpasyahan ang modelo ng hatian",
        "description": "Magkasundo bilang grupo: kanya-kanyang taniman, iisang ani ng lahat, o halo. Isulat kung paano hinahati ang ani at kung paano pinagpapasyahan ang mga bagay.",
        "hours": 1,
        "skills": [
          "pagpapadaloy"
        ]
      },
      {
        "name": "Magtanim ayon sa klima at panahon",
        "description": "Pumili ng madali at masaganang pananim para sa lugar mo (gulay na dahon, sitaw, kalabasa, kamatis, halamang pampalasa). Pagitanin ang pagtatanim para hindi sabay-sabay ang ani. Lagyan ng label ang mga hanay.",
        "hours": 4,
        "recurringCadence": "cycle",
        "skills": [
          "paghahalaman"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Magtakda ng salitan sa dilig at bunot ng damo",
        "description": "Kapabayaan ang pangunahing pumapatay sa halaman. Gumawa ng simpleng kalendaryo ng grupo; ikabit ang mga gawain sa madaling paalala. Panatilihing magaan para walang maupos.",
        "hours": 1,
        "skills": [
          "pag-aayos"
        ],
        "follows": [
          4
        ]
      },
      {
        "name": "Iplano ang ani at ang sobra",
        "description": "Pagpasyahan ang mga araw ng ani. Idaan ang sobrang ani sa ref ng komunidad, sa mga kapitbahay, o sa libreng lamesa sa may tarangkahan. Magtabi ng ilang binhi para sa susunod na taon.",
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
    "name": "Hiraman ng mga kasangkapan at kagamitan",
    "purpose": "Hayaang manghiram ang magkakapitbahay ng kasangkapan at gamit imbes na bumili, para makatipid at mabawasan ang basura.",
    "whoItServes": "Mga nangungupahan, mga bagong may-ari ng bahay, mga mahilig sa proyekto, at sinumang may paminsan-minsang kumpuni o gawain sa bahay.",
    "whatYoullNeed": "Lalagyan ng imbak, mga donasyong kasangkapan, simpleng sistema ng paghiram, at isa o dalawang “librarian.”",
    "setupHours": 20,
    "defaultCategory": "infrastructure",
    "firstSteps": "Bago ka tumanggap ng kahit isang drill, kausapin ang nag-aalok ng espasyo tungkol sa tunay na kahulugan ng pakikisama sa isang hiraman — ingay, unti-unting pagdami ng imbak, mga hindi kakilalang kumakatok tuwing oras ng bukas. Pagkatapos, tanungin ang mga kapitbahay kung ano talaga ang hihiramin nila; mas mabuti ang listahan ng sampung hinihiling na kasangkapan kaysa isang garaheng puno ng donasyong walang may gusto.",
    "commonPitfalls": "Namamatay ang mga hiraman sa katahimikan pagkalampas ng takdang sauli: walang nag-follow-up, unti-unting nagiging tuluyang hiram ang mga kasangkapan, at nauubos ang estante. Mas mahalaga ang palakaibigang gawi ng pagpapaalala kaysa mahigpit na patakaran sa pagkahuli — at maging handang tumanggi sa donasyon, o magiging tambakan ka ng mga sirang gamit ng buong lugar.",
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
        "name": "Humanap ng imbakan at oras ng bukas",
        "description": "Puwede ang bodega, garahe, aparador sa community center, o container van. Pumili ng 2–4 na tiyak na oras ng bukas kada linggo para alam ng mga tao kung kailan pupunta.",
        "hours": 3,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Ipunin at bukurin ang imbentaryo",
        "description": "Maglabas ng panawagan ng donasyon (maraming may sobrang drill at hagdan). Linisin, subukan, at lagyan ng label ang bawat kasangkapan. Itapon o ipakumpuni ang anumang delikado.",
        "hours": 6,
        "skills": [
          "pagmamaneho"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "I-catalog ang lahat",
        "description": "Gumamit ng libreng spreadsheet o app ng hiraman. Itala ang bawat gamit, ang kondisyon nito, at isang litrato. Lagyan ng numero ang mga kasangkapan para madaling masundan.",
        "hours": 4,
        "skills": [
          "pagtatala"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Isulat ang mga patakaran sa paghiram",
        "description": "Itakda ang tagal ng hiram (hal. isang linggo), kung ilang gamit nang sabay-sabay, at ang patakaran sa sauli at pagkahuli. Panatilihing maluwag — tiwala ang puso nito. Itala ang anumang kasangkapang nangangailangan ng paalala sa kaligtasan.",
        "hours": 1,
        "skills": [
          "pagsusulat"
        ]
      },
      {
        "name": "Ihanda ang paghiram",
        "description": "Isang clipboard o simpleng form: pangalan, contact, gamit, petsa ng labas, takdang sauli. Kunan agad ng litrato ang kondisyon ng kasangkapan sa paglabas para maiwasan ang hindi pagkakasundo.",
        "hours": 2,
        "skills": [
          "pagtatala"
        ],
        "follows": [
          2,
          3
        ]
      },
      {
        "name": "Sanayin ang mga “librarian” mo",
        "description": "Ituro sa mga tutulong ang catalog, ang mga hakbang ng pagpapahiram, at pangunahing kaligtasan (proteksyon sa mata, paggamit ng hagdan). Maglagay ng isang pahinang gabay sa mesa.",
        "hours": 2,
        "skills": [
          "pagtuturo"
        ],
        "follows": [
          4
        ]
      },
      {
        "name": "Alagaan at palaguin",
        "description": "Suriin ang mga naisauling kasangkapan, regular na ihasa at langisan, at itala kung ano ang madalas hilingin para alam mo ang susunod na idadagdag.",
        "hours": 2,
        "skills": [
          "pagkukumpuni ng kasangkapan"
        ],
        "recurringCadence": "session"
      }
    ]
  },
  {
    "id": "neighborhood-care-network",
    "name": "Ugnayan ng pag-aalaga sa kapitbahayan",
    "purpose": "Tiyaking ang mga nag-iisang kapitbahay ay kinukumusta, konektado, at inaalalayan.",
    "whoItServes": "Mga nakatatanda, mga kapitbahay na may kapansanan o matagalang karamdaman, mga bagong magulang, at sinumang nag-iisa sa bahay.",
    "whatYoullNeed": "Listahan ng mga tutulong, paraan ng pagpapares nila sa mga kapitbahay, at gawi ng pagkumusta. Kapitbahay ang mga tumutulong, hindi mga propesyonal sa pag-aalaga — i-screen ang sinumang dadalaw sa bahay, huwag hayaang mag-isang humawak ng pera ng kapitbahay ang isang tumutulong, at pagkasunduan nang maaga kung kailan tatawagan ang pamilya o ang emergency hotline.",
    "setupHours": 18,
    "defaultCategory": "emotional_support",
    "firstSteps": "Magsimula sa pakikinig, hindi sa paghahanap ng tao: kausapin ang mga kapitbahay na nais mong alalayan tungkol sa tunay nilang gusto — lingguhang tawag, hatid, kasama sa kuwentuhan — dahil ang ugnayang itinayo sa haka-haka ay pakiramdam na pagmamanman. Kasabay nito, gawin ang tapat na usapan sa mga unang tumutulong tungkol sa pag-screen at mga hangganan, para pagdating ng unang pares, ang mga patakaran ay pakiramdam na malasakit, hindi hinala.",
    "commonPitfalls": "Bihirang mabigo ang mga ugnayan ng pag-aalaga dahil kulang ang tumutulong — nauupos nila ang tatlong taong laging umoo habang naghihintay ang iba na hilingan. Sadyaing ikalat ang mga pares, ituloy ang mga kumustahan ng mga tumutulong kahit mukhang maayos ang lahat, at huwag hayaang mauwi ang pagkumusta sa pagturing sa kapitbahay na parang “kaso” imbes na tao.",
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
        "name": "Alamin kung sino ang nasa paligid",
        "description": "Tahimik na alamin kung sinong mga kapitbahay ang maaaring nag-iisa, sa pamamagitan ng kuwentuhan, mga namamahala ng gusali, klinika, at simbahan o sambahan. Huwag ipagpalagay ang kailangan nila — imbitahan sila, huwag silang ituring na kakaiba.",
        "hours": 4,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Maghanap at mag-screen ng mga tutulong",
        "description": "Humanap ng mga taong kayang manindigan sa regular na pagkumusta. Para sa anumang pagdalaw sa bahay o pagtulong sa mga nasa alanganing kalagayan, gumawa ng pangunahing pagtingin sa reference at huwag kailanman hayaang mag-isang humawak ng pera ng kapitbahay ang isang tumutulong.",
        "hours": 5,
        "skills": [
          "pakikipag-ugnayan",
          "pakikipanayam"
        ]
      },
      {
        "name": "Magpares nang maingat",
        "description": "Ipares ayon sa wika, lapit, at ginhawa ng loob. Tanungin ang dalawa kung ano ang gusto nila — lingguhang tawag, pabili sa palengke, kuwentuhan sa harap ng bahay — at igalang ang hangganang iyon.",
        "hours": 2,
        "skills": [
          "pag-aayos"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Magtakda ng ritmo ng pagkumusta",
        "description": "Magkasundo sa dalas at paraan (tawag, text, katok). Bigyan ang mga tumutulong ng maikling gabay sa unang pagbati para maging mainit ito, hindi parang ospital.",
        "hours": 1,
        "follows": [
          2
        ],
        "skills": []
      },
      {
        "name": "Isulat ang plano kapag may hindi sumasagot",
        "description": "Pagpasyahan nang maaga ang gagawin kapag may hindi sumagot o mukhang nasa krisis: sino ang tatawagan, kailan isasangkot ang pamilya o ang emergency hotline, at paano ito itatala. Panatilihin itong nakasulat at simple.",
        "hours": 2,
        "skills": [
          "pagsusulat"
        ]
      },
      {
        "name": "Ayusin ang praktikal na tulong",
        "description": "Itala ang mga paulit-ulit na kailangan — hatid sa appointment, pagkuha ng gamot sa botika, pagpala ng niyebe — at iugnay ang mga ito sa ibang mga tumutulong o proyekto ng komunidad mo.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "pag-aayos"
        ]
      },
      {
        "name": "Alagaan din ang mga tumutulong",
        "description": "Magdaos ng kumustahan para makapagbuntong-hininga sila. Nakakaubos ang gawaing pag-aalaga; magsalitan sa mga gawain at bantayan ang pagkaupos.",
        "hours": 2,
        "skills": [
          "pagpapadaloy"
        ],
        "recurringCadence": "month"
      }
    ]
  },
  {
    "id": "emergency-preparedness",
    "name": "Ugnayan sa paghahanda sa emergency at sakuna",
    "purpose": "Tulungan ang magkakapitbahay na maghanda at kumilos sa sakuna (matinding init, bagyo, baha, brownout) kapag mabagal ang opisyal na tulong.",
    "whoItServes": "Lahat, na inuuna ang mga hindi basta-basta makakalikas o umaasa sa kuryente para sa gamit na medikal.",
    "whatYoullNeed": "Listahan ng contact, isang tagpuan, pangunahing gamit, at planong pang-komunikasyon na gumagana kahit walang internet. Karagdagan ang ugnayang ito sa mga opisyal na tagatugon sa emergency — hindi ito kapalit nila. Sa banta sa buhay, laging tumawag muna sa emergency hotline.",
    "setupHours": 30,
    "defaultCategory": "organizing",
    "firstSteps": "Itayo ang plano sa paligid ng mga taong para dito: kumatok sa pinto ng mga kapitbahay na naka-oxygen, may gamot na kailangang nasa ref, o nasa itaas na palapag na walang elevator, at itanong kung ano ang hitsura ng masamang linggo para sa kanila. Pagkatapos, kausapin ang may hawak ng malamang na ligtas na lugar mo at ang anumang umiiral nang grupo sa paghahanda (mga brigada ng mga residente, ang mga bumbero) para punan ng ugnayan mo ang mga puwang sa paligid ng opisyal na pagtugon imbes na doblehin ito.",
    "commonPitfalls": "Hindi nabibigo ang mga ganitong ugnayan sa mismong sakuna — nabibigo sila sa tahimik na mga taon bago iyon, kapag lumuma ang kadena ng tawagan, nagpalit ang mga numero, at sa laptop ng iisang tao nakatira ang plano. I-print ang lahat, sariwain ang listahan sa ritmo ng kalendaryo, at magsanay kahit minsan; ang unang tunay na gamit ay hindi dapat ang kauna-unahang gamit.",
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
        "name": "Alamin ang mga panganib sa lugar mo",
        "description": "Ilista ang mga sakunang pinakamalamang sa lugar mo. Itala ang mga alanganing punto: mga nasa itaas na palapag na walang elevator, mga naka-oxygen o may gamot na kailangang nasa ref, mga gusaling iisa ang labasan.",
        "hours": 4,
        "skills": []
      },
      {
        "name": "Bumuo ng kadena ng tawagan",
        "description": "Tipunin ang contact info ng mga pumayag, bawat block. Humirang ng ilang “taga-asikaso ng block” na kukumusta sa tig-sampung sambahayan. Magtago ng kopyang papel — namamatay ang phone at internet sa sakuna.",
        "hours": 8,
        "skills": [
          "pakikipag-ugnayan",
          "pagtatala"
        ]
      },
      {
        "name": "Iplano ang komunikasyong offline",
        "description": "Pagpasyahan kung paano aabutin ang isa't isa kahit walang signal: katok sa pinto, isang tagpuan, pito, o radyo. I-print at ipamahagi ang plano.",
        "hours": 3,
        "skills": [
          "pagsusulat"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Mag-imbak ng gamit ng lahat",
        "description": "Buuin ang kit ng komunidad: tubig, first aid, flashlight, baterya, radyong de-baterya o pinapaandar ng kamay, mga kumot, at pangunahing kasangkapan. Itago ito kung saan kayang abutin ng ilang tao.",
        "hours": 5,
        "skills": [
          "pagmamaneho"
        ]
      },
      {
        "name": "Tukuyin ang mga ligtas na lugar",
        "description": "Maghanap ng mga lugar na puwedeng takbuhan sa matinding init o lamig o pagcha-chargehan (bulwagang may genset, parkeng malilim). Tiyakin nang maaga ang daanan at susi.",
        "hours": 3,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Magsagawa ng drill o gabi ng paghahanda",
        "description": "Magdaos ng sesyon tungkol sa sariling go-bag, pagsasara ng gas at tubig, at sa kadena ng tawagan. Magsanay nang minsan para walang nag-aaral sa mismong emergency.",
        "hours": 5,
        "skills": [
          "pagtuturo",
          "pagpapadaloy"
        ],
        "follows": [
          1,
          2
        ]
      },
      {
        "name": "Linawin ang mga papel sa “mismong araw”",
        "description": "Italaga nang maaga kung sino ang unang kukumusta sa mga delikado ang kalusugan, sino ang magbubukas ng ligtas na lugar, at sino ang mag-aayos ng kabuuan. Balikan at i-update ang plano dalawang beses kada taon.",
        "hours": 2,
        "skills": [
          "pag-aayos"
        ],
        "follows": [
          4
        ]
      }
    ]
  },
  {
    "id": "free-store",
    "name": "Libreng tindahan / palitan ng gamit",
    "purpose": "Ipamahagi nang libre ang mga damit, gamit sa bahay, at kagamitan.",
    "whoItServes": "Kahit sino — mga taong ginigipit ng buhay, mga nagbabawas ng gamit, at ang kalikasan.",
    "whatYoullNeed": "Isang espasyo (kahit pop-up), mga mesa o rack, mga tagabukod, at regular na iskedyul.",
    "setupHours": 10,
    "defaultCategory": "mutual_aid_drive",
    "suggestsWorkDays": true,
    "firstSteps": "Kausapin muna ang host ng espasyo tungkol sa totoong kalakaran — mga bundok ng donasyon, dami ng taong paroo't parito, ang itsura ng silid kinaumagahan — at pagkatapos, ang isang kalapit na ukay-ukay o samahang kawanggawa tungkol sa kung ano na ang sagana, para alam mo kung ano talaga ang kulang sa lugar mo. Kung kaya mo, gumugol ng isang oras sa isang umiiral nang libreng tindahan bago ang una mong event; ang daloy ng pagtanggap at pagladlad ay mas madaling kopyahin kaysa imbentuhin.",
    "commonPitfalls": "Nalulunod ang mga libreng tindahan bago pa magutom: kapag walang matibay na listahan ng oo/hindi sa pinto, mauubos ang oras ng mga tumutulong sa pagbubukod ng sira at maruming donasyon imbes na pagsalubong sa mga tao. At pagpasyahan kung saan pupunta ang matitira bago matapos ang unang event — ang bundok ng walang kumuhang gamit na walang labasan ang dahilan kung bakit nawawala ang mga host na espasyo.",
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
        "name": "Pumili ng anyo at espasyo",
        "description": "Mamili sa nakatirik na libreng tindahan, paulit-ulit na pop-up, o isang-araw na palitan. Manghiram ng bulwagan, espasyo sa unahan ng gusali, o kubol sa parke. Ang paulit-ulit na petsa ang bumubuo ng gawi.",
        "hours": 2,
        "skills": []
      },
      {
        "name": "Itakda ang pamantayan ng donasyon",
        "description": "Malinis, gumagana, at magagamit lang ang tanggapin. Magpaskil ng malinaw na listahan ng “oo” at “hindi” (walang sirang electronics, walang maruming damit, walang na-recall na gamit ng sanggol). Napakalaking oras ng pagbubukod ang matitipid nito.",
        "hours": 0.5,
        "skills": [
          "pagsusulat"
        ]
      },
      {
        "name": "Ayusin ang pagtanggap at pagbubukod",
        "description": "Maglagay ng mga istasyon: tanggapan, bukod ayon sa uri, at handaan para sa pagladlad. Magkaroon ng plano para sa mga hindi magagamit (ipasa sa iba o i-recycle).",
        "hours": 2,
        "skills": [
          "pag-aayos"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Iladlad para makapamili ang mga tao nang may dignidad",
        "description": "Isabit ang mga damit ayon sa sukat, pagsama-samahin ang mga gamit sa bahay, panatilihing maayos at malugod. Walang form na pupunan, walang kailangang patunayan — kunin lang ang gagamitin mo.",
        "hours": 1.5,
        "skills": [
          "disenyo"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Tauhan ang event",
        "description": "Magtalaga ng mga tagasalubong, tagabukod, at isang taong sasagot sa mga tanong. Ang palakaibigan at walang-panghuhusgang tono ang buong punto.",
        "hours": 3,
        "skills": [
          "pag-aayos"
        ],
        "recurringCadence": "event"
      },
      {
        "name": "Asikasuhin ang matitira",
        "description": "Ayusin nang maaga kung saan pupunta ang walang kumuhang gamit pagkatapos ng bawat event (kaakibat na samahang kawanggawa, recycler ng tela) para bumalik na malinis ang espasyo.",
        "hours": 1,
        "skills": [
          "pagmamaneho"
        ]
      }
    ]
  },
  {
    "id": "skill-share",
    "name": "Palitan ng kakayahan at mga libreng klase",
    "purpose": "Hayaang magturuan at matutuhan ng magkakapitbahay ang isa't isa nang libre — pagluluto, pagkukumpuni, wika, pagbabadyet, first aid, kakayahang digital.",
    "whoItServes": "Lahat; lalo na ang mga hindi kayang gastusan ang mga pormal na klase at ang mga taong bihirang ituring na kaalaman ang alam nila.",
    "whatYoullNeed": "Isang espasyo, mga taong handang magturo, at mapagpapaskilan ng iskedyul.",
    "setupHours": 9,
    "defaultCategory": "education",
    "firstSteps": "Nagsisimula ang proyekto sa mga usapang dalawang-tanong, hindi sa lugar: tanungin ang mga tao kung ano ang kaya nilang ituro at ano ang gusto nilang matutuhan, at bigyang-pansin lalo ang mga kapitbahay na bihirang ituring na kadalubhasaan ang kanilang alam. Ang una mong tunay na gawain: ang pagpapanatag sa isang kabadong magtuturo sa ibabaw ng kape na hindi kailangang maging lecture ang kanyang sesyon.",
    "commonPitfalls": "Kumukupas ang mga palitan ng kakayahan kapag ang parehong dalawang kampanteng tao na ang nagtuturo ng lahat at tahimik na bumabaluktot ang iskedyul sa mga bakanteng gabi ng mga nag-aayos imbes na sa mga dumadalo. Patuloy na maghanap ng mga unang beses magtuturo, itanong kung sino ang wala sa silid, at ituring na tagumpay ang sesyon na limang tao — dahil totoo iyon.",
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
        "name": "Alamin ang mga kakayahan at hilig",
        "description": "Tanungin ang mga miyembro ng dalawang tanong: ano ang kaya mong ituro, at ano ang gusto mong matutuhan? Ipunin ang mga sagot sa simpleng form. Ang pinagtatagpuan ang kurikulum mo.",
        "hours": 1.5,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Maghanap at ihanda ang mga magtuturo",
        "description": "Panatagin ang mga tao na puwedeng maging impormal ang “pagtuturo.” Tulungan silang balangkasin ang isang-oras na sesyon at ipunin ang mga materyales. Bigyan ng katuwang ang mga kabadong unang beses.",
        "hours": 3,
        "skills": [
          "pagtuturo",
          "pagpapadaloy"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Humanap ng lugar at oras",
        "description": "Gumamit ng silid sa library, community center, parke, o sala ng isang tao. Pumili ng paulit-ulit na oras para maging gawi ito.",
        "hours": 1.5,
        "skills": []
      },
      {
        "name": "Buuin ang iskedyul",
        "description": "Ilista ang mga sesyon na may petsa, paksa, magtuturo, at dadalhin. Ipaskil ito kung saan tumitingin na ang mga miyembro. Panatilihing magaan ang paglista, o basta-dumating lang.",
        "hours": 1.5,
        "recurringCadence": "month",
        "skills": [
          "pag-aayos"
        ],
        "follows": [
          1,
          2
        ]
      },
      {
        "name": "Gawin itong abot ng lahat",
        "description": "Isaalang-alang ang wika, pag-aalaga ng bata, daanan ng may kapansanan, at oras ng mga may trabaho. Tanungin ang mga dumadalo kung ano ang makakatulong para makarating sila.",
        "hours": 1.5,
        "skills": [
          "aksesibilidad",
          "pagsasalin"
        ]
      }
    ]
  },
  {
    "id": "bulk-buying-coop",
    "name": "Hatian sa maramihang pagbili ng pagkain",
    "purpose": "Pagsamahin ang mga order para makabili ng pagkain at pangunahing bilihin nang maramihan at mas mababa ang gastos.",
    "whoItServes": "Mga sambahayang ginigipit ng gastos sa pagkain, malalaking pamilya, at mga lugar na malayo sa mapagbilhan ng sariwang pagkain.",
    "whatYoullNeed": "Grupo ng mga nakatalagang sambahayan, mapagkukunang pakyawan, espasyo ng kuha at bukod, at isang taong mag-aasikaso ng mga order.",
    "setupHours": 20,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Tipunin muna ang mga sambahayan bago ka tumawag sa kahit anong supplier, at gawin muna ang mailap na usapang pera: kung ano ang kayang panindigan ng mga tao, paano papasok ang pera bago ilagay ang order, at ano ang ibig sabihin ng isang nalaktawang ikot. Ang isang tawag sa umiiral nang grupo ng pakyawan — karamihan ay masayang ibahagi ang kanilang spreadsheet at mga pilat — ang magtitipid sa iyo ng isang buong panahon ng pagsubok at pagkakamali.",
    "commonPitfalls": "Namamatay ang mga hatian sa pakyawan dahil sa gusot sa pera at pagod ng nag-aayos: may nag-abono na nagtampo, may order na walang kasamang pera, o isang tao ang tahimik na nagpapatakbo ng bawat ikot hanggang huminto siya at tumigil ang lahat. Ipunin ang pera bago umorder nang walang pasubali, at pagsalitanin ang papel ng nag-aayos simula sa ikalawang ikot, hindi sa balang araw.",
    "pairsWith": [
      "community-market",
      "food-preservation"
    ],
    "tasks": [
      {
        "name": "Tipunin ang grupo ng bibili",
        "description": "Mag-imbita ng sapat na sambahayan para maabot ang minimum ng supplier (kadalasan 8–15). Magkasundo sa ikot ng pagbili (lingguhan, tuwing ikalawang linggo, buwanan).",
        "hours": 4,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Humanap ng supplier",
        "description": "Kausapin ang mga pakyawan ng pagkain, samahan ng mga magsasaka, supplier ng restawran, o mga grupo ng pakyawan. Ikumpara ang minimum na order, paraan ng paghahatid, at halaga. Tiyakin kung anong pangunahing bilihin ang dala nila.",
        "hours": 4,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Ihanda ang pag-order",
        "description": "Gumamit ng shared na spreadsheet o form kung saan naglalagay ng dami ang mga miyembro bago ang takdang oras. Magtalaga ng isang nag-aayos na magsusuma at maglalagay ng order.",
        "hours": 3,
        "skills": [
          "pagtatala",
          "pag-aayos"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Maging malinaw sa pera",
        "description": "Pagpasyahan nang maaga ang usapang pera (ipunin bago umorder para walang mag-aabono). Itala ang bawat piso sa talaang kita ng lahat. Magdagdag ng maliit na opsyonal na pantapal sa matatapon, hindi pangkita.",
        "hours": 2,
        "skills": [
          "pagtutuos"
        ]
      },
      {
        "name": "Ayusin ang paghahatid at espasyo ng bukod",
        "description": "Pumili ng lugar na tatanggap ng maramihang hatid — garahe, bulwagan, o harapan ng bahay. Mag-iskedyul ng sapat na kamay para sa araw ng baba ng karga.",
        "hours": 3,
        "skills": [
          "pag-aayos"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Paghatian ang mga order nang patas",
        "description": "Maglagay ng mga istasyon ng bukod na may timbangan para sa maramihang butil at gulay. I-print nang maaga ang listahan ng bawat sambahayan. Suriing muli bago ang kuha.",
        "hours": 3,
        "skills": [
          "pag-aayos"
        ],
        "follows": [
          2,
          4
        ],
        "recurringCadence": "cycle"
      },
      {
        "name": "Pagsalitanin ang trabaho",
        "description": "Dapat magsalitan ang pag-aasikaso, pagbubukod, at pagkuha para walang isang taong pumapasan ng lahat. Balikan ang halaga at pagiging maaasahan ng supplier bawat ikot.",
        "hours": 1,
        "recurringCadence": "cycle",
        "skills": []
      }
    ]
  },
  {
    "id": "repair-cafe",
    "name": "Repair Café (ayusan ng komunidad)",
    "purpose": "Kumpunihin nang libre ang mga sirang gamit — damit, elektroniks, bisikleta, muwebles — sa halip na itapon.",
    "whoItServes": "Sinumang may sirang gamit pero walang pera o kakayahang magpakumpuni; nailalayo rin sa tambakan ng basura ang mga gamit na puwede pang ayusin.",
    "whatYoullNeed": "Mga kapitbahay na marunong kumumpuni, pangunahing kagamitan, lugar na may mga mesa at kuryente, at regular na petsa.",
    "setupHours": 14,
    "defaultCategory": "skilled_labor",
    "suggestsWorkDays": true,
    "firstSteps": "Hanapin muna ang unang dalawa o tatlong taga-kumpuni bago ang lahat — ang kapitbahay na marunong manahi, ang mahilig sa bisikleta — dahil walang saysay ang petsa at venue kung wala sila. Pagkatapos, ilibot sila sa venue at pag-usapan ang mga mesa, kuryente, at ilaw; at kung may repair café sa kalapit na bayan, dumalaw sa isang session — ang daloy ng pagtanggap ang bahaging sulit gayahin.",
    "commonPitfalls": "Tahimik na nagiging libreng repair shop ang mga repair café: iniiwan ng bisita ang gamit at aalis, nagiging parang teknisyang empleyado ang mga taga-kumpuni, at ang nag-iisang marunong sa elektroniks ang unang mapapagod. Panindigan na sasamahan ng may-ari ang pagkumpuni sa gamit niya, at ipaskil nang malinaw na may mga bagay na hindi na maililigtas — mas madaling harapin ang pagkadismaya sa simula kaysa sisihan pagkatapos.",
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
        "name": "Hanapin ang mga taga-kumpuni ayon sa kakayahan",
        "description": "Maghanap ng mga marunong sa pananahi, maliit na elektroniks, bisikleta, appliance, at gawaing kahoy. Isa o dalawa kada kategorya ay sapat na panimula.",
        "hours": 4,
        "skills": [
          "pagkukumpuni",
          "elektroniks",
          "pananahi"
        ]
      },
      {
        "name": "Ihanda ang mga istasyon ng pagkukumpuni",
        "description": "Bawat istasyon ay may mesa, tamang kagamitan, maayos na ilaw, at kuryente. Pagsamahin ang magkakatulad na pagkukumpuni. Lagyan ng malinaw na label ang bawat istasyon.",
        "hours": 3,
        "recurringCadence": "session",
        "skills": [
          "pag-aayos"
        ]
      },
      {
        "name": "Magtakda ng regular na petsa",
        "description": "Bagay ang buwanan. Pumili ng palagiang venue — aklatan, makerspace, bulwagan ng komunidad — para alam ng mga tao kung saan dadalhin ang gamit.",
        "hours": 1,
        "skills": []
      },
      {
        "name": "Gumawa ng daloy ng pagtanggap",
        "description": "May taga-salubong na nagtatala ng bawat bisita at gamit, saka itinuturo sa tamang taga-kumpuni. Linawin ang inaasahan: sasama at tutulong ang bisita sa pagkumpuni ng gamit niya hangga't kaya; lugar ito ng pag-aaral, hindi paiwanan.",
        "hours": 2,
        "skills": [
          "pagsusulat"
        ]
      },
      {
        "name": "Asikasuhin ang kaligtasan at inaasahan",
        "description": "Ipaskil na may mga gamit na hindi na maililigtas at sinusubukan lang ang pagkumpuni, walang pangako. Magkaroon ng ligtas na hakbang para sa de-kuryente at may bateryang gamit. Ilagay sa abot-kamay ang first-aid kit.",
        "hours": 2,
        "skills": []
      },
      {
        "name": "Mag-imbak ng karaniwang piyesa at gamit",
        "description": "Maglaan ng sinulid, fuse, pandikit, turnilyo, interior, at pantapal. Itala ang nauubos para alam mo ang muling iimbakin.",
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
    "name": "Hatid-Sundo at Tulong sa Transportasyon",
    "purpose": "Ihatid ang mga kapitbahay sa checkup, grocery, at mahahalagang lakad kapag hadlang ang biyahe at pera.",
    "whoItServes": "Mga walang sasakyan, kapitbahay na may kapansanan, mga nakatatanda, at sinumang walang maaasahang masakyan.",
    "whatYoullNeed": "Mga kapitbahay na handang magmaneho, paraan ng paghingi at pagtutugma ng sakay, at malinaw na patakaran sa kaligtasan at insurance. Mabigat na responsibilidad ang pagmamaneho para sa kapitbahay — tiyakin ang lisensya at insurance ng bawat drayber, suriin ang sinumang maghahatid ng mas nanganganib na pasahero, at huwag kailanman ipalit ang sakay mula sa kapitbahay sa ambulansya kapag may medikal na emergency.",
    "setupHours": 18,
    "defaultCategory": "transport",
    "firstSteps": "May dalawang uri ng usapan bago ang unang sakay: umupo kasama ang bawat gustong magmaneho para tiyakin ang lisensya at insurance at tapatang pag-usapan ang pagsusuri, at kausapin ang mga nangangailangan ng sakay — pati ang mga senior center at klinikang kakilala nila — tungkol sa totoong destinasyon, oras, at pangangailangan sa paggalaw. Mas madali ang usapang pagsusuri bilang panimulang kaugalian kaysa patakarang ipinataw pagkatapos.",
    "commonPitfalls": "Sa pagtutugma nabibigo ang mga hatid-sundo, hindi sa pagmamaneho: pumupunta ang lahat ng hiling sa phone ng iisang tao hanggang maubos siya, at ang parehong dalawang maaasahang drayber ang laging tinatawagan habang ang iba ay hindi na muling tinawagan matapos ang isang hindi. Magsalitan sa papel na tagapag-ugnay, sadyang ikalat ang mga hiling, at huwag hintayin ang unang banggaan bago sagutin ang tanong tungkol sa insurance.",
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
        "name": "Hanapin at suriin ang mga drayber",
        "description": "Tiyaking may balidong lisensya, insurance, at ligtas na sasakyan ang bawat drayber. Para sa sakay ng mas nanganganib na pasahero, magpa-reference o background check ayon sa kaugalian sa inyong lugar.",
        "hours": 5,
        "skills": [
          "pagmamaneho"
        ]
      },
      {
        "name": "Ayusin ang insurance at legal na proteksyon",
        "description": "Alamin kung ano ang sakop ng personal na insurance ng bawat drayber sa kusang pagmamaneho para sa kapitbahay. Pag-isipan ang simpleng waiver at kumonsulta sa klinika ng libreng tulong legal — proteksyon ito ng lahat.",
        "hours": 4,
        "skills": [
          "papeles"
        ]
      },
      {
        "name": "Gumawa ng sistema ng paghingi ng sakay",
        "description": "Pumili ng iisang channel para sa paghingi ng sakay (linya ng telepono, form, group chat) na may palugit (hal. 48 oras). Kunin ang oras ng sundo, mga lugar, pangangailangan sa paggalaw, at contact info.",
        "hours": 2,
        "skills": [
          "pag-aayos",
          "teknolohiya"
        ]
      },
      {
        "name": "Buuin ang gawi ng pagtutugma",
        "description": "May isang tagapag-ugnay (nagsasalitan) na nagtutugma ng mga hiling sa mga bakanteng drayber at nagkukumpirma sa magkabilang panig isang araw bago. Magtabi ng listahan ng pamalit na drayber para sa mga kanselasyon.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "pag-aayos"
        ],
        "follows": [
          0,
          2
        ]
      },
      {
        "name": "Linawin kung ano ang sakop",
        "description": "Pagpasyahan kung aling biyahe ang kasama (medikal, grocery, mahahalagang lakad) at ang saklaw na lugar. Linawin ang paghihintay at kung tutulong ba ang drayber magbuhat ng bitbit.",
        "hours": 1,
        "skills": [
          "pagpapadaloy"
        ]
      },
      {
        "name": "Ayusin ang gastos",
        "description": "Pagpasyahan kung paano sasagutin ang gasolina — maliit na pinagsamang pera, kusang tulong mula sa pasahero, o wala. Panatilihing hayag ito at huwag kailanman hayaang maging hadlang sa pasahero.",
        "hours": 2,
        "follows": [
          4
        ],
        "skills": []
      },
      {
        "name": "Ingatan ang mga pasahero at drayber",
        "description": "Magtakda ng kaugalian: hindi pumapasok mag-isa sa bahay ang drayber, walang hawakang pera maliban sa napagkasunduang gastos, at may kumustahan pagkatapos ng sakay ng mas nanganganib na pasahero. Itala ang bawat sakay.",
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
    "name": "Unyon ng mga Umuupa at Ugnayan Laban sa Pagpapaalis",
    "purpose": "Organisahin ang mga umuupa para labanan ang pagpapaalis, hindi ligtas na kalagayan, at hindi makatarungang pagtaas ng upa sa pamamagitan ng sama-samang pagkilos.",
    "whoItServes": "Mga umuupa, lalo na sa mga gusaling may pabaya o laging nawawalang kasero, at sinumang pinapaalis sa tirahan.",
    "whatYoullNeed": "Isang ubod na pangkat ng mga tagapag-organisa, tumpak na lokal na impormasyon sa karapatan ng umuupa, ugnayan sa libreng tulong legal, at mabilis na sistema ng pagkontak. Sinusuportahan ng proyektong ito ang mga umuupa at nagbabahagi ng pampublikong legal na impormasyon; hindi nito pinapalitan ang payo ng abogado. Laging dalhin ang bawat indibidwal na kaso sa kwalipikadong libreng tulong legal bago ang deadline.",
    "setupHours": 30,
    "defaultCategory": "housing",
    "firstSteps": "Kausapin muna ang mga apektadong umuupa bago ang anumang pakikipag-usap sa kasero, palagi — kumatok sa mga pinto, pakinggan kung ano talaga ang kinatatakutan at gusto ng mga tao, at hayaang ang mga umuupa sa bawat gusali ang magtakda ng bilis, dahil sila ang may pasan ng panganib ng paghihiganti, hindi ang mga tagapag-organisa. Kasabay nito, magpakilala nang maaga sa lokal na klinika ng libreng tulong legal; kakailanganin mo ang ugnayang iyon bago dumating ang unang abiso ng pagpapaalis, hindi pagkatapos.",
    "commonPitfalls": "Nakakasakit ng tao ang unyon ng mga umuupa kapag mas mabilis itong kumilos kaysa sa mga umuupa mismo: ang komprontasyong inilunsad bago pa handa ang isang gusali ay naglalantad sa pinaka-nanganganib na kapitbahay sa paghihiganting hindi nila pinasok. Ang mas tahimik na kabiguan ay ang unti-unting pagbibigay ng legal na payo sa halip na legal na impormasyon — dalhin ang bawat indibidwal na kaso sa kwalipikadong libreng tulong legal bago ang deadline, sa bawat pagkakataon.",
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
        "name": "Buuin ang ubod na pangkat ng tagapag-organisa",
        "description": "Maghanap ng 3–6 na tapat na umuupa na magiging haligi ng gawain. Hanapin ang mga iginagalang sa kani-kanilang gusali. Pagkasunduan ang mga papel, ritmo ng pagpupulong, at mga layunin ng lahat.",
        "hours": 5,
        "skills": [
          "pag-aayos"
        ]
      },
      {
        "name": "Imapa ang mga gusali at problema ng umuupa",
        "description": "Kumatok sa mga pinto o mag-survey para malaman kung aling gusali ang may problema at ano ang mga ito (hindi inaasikasong pagkukumpuni, mga ilegal na patong, panggigipit). Bantayan ang mga pattern at hanapin ang likas na lider sa bawat gusali.",
        "hours": 8,
        "skills": [
          "pakikipag-ugnayan",
          "pakikipanayam"
        ]
      },
      {
        "name": "Ipunin ang tumpak na lokal na karapatan ng umuupa",
        "description": "Tipunin ang totoong batas sa inyong lugar tungkol sa palugit ng abiso ng pagpapaalis, pagkukumpuni, deposit, at patakaran sa upa. Makipagtulungan sa klinika ng libreng tulong legal para patunayan ito. Ibinabahaging impormasyon ito, hindi legal na payo — linawin iyan sa mga miyembro.",
        "hours": 4,
        "skills": [
          "papeles",
          "pagsusulat"
        ]
      },
      {
        "name": "Buuin ang mabilisang sistema ng pagkontak",
        "description": "Mag-set up ng phone tree o group chat para mabilis na maabot ang unyon ng umuupang nakatanggap ng abiso ng pagpapaalis o pinagsarhan ng pinto. Pagpasyahan kung sino ang sasagot at gaano kabilis.",
        "hours": 3,
        "skills": [
          "pag-aayos",
          "tulong sa tech"
        ]
      },
      {
        "name": "Magdaos ng workshop sa karapatan ng umuupa",
        "description": "Magsagawa ng session (mas mabuti kung may kasamang klinika ng libreng tulong legal) na nagpapaliwanag sa mga umuupa ng kanilang mga karapatan at ng gagawin kapag inabutan ng papeles mula sa korte. Magbigay ng nakalimbag na gabay na maiuuwi, sa mga wikang ginagamit ng mga tao.",
        "hours": 4,
        "recurringCadence": "event",
        "skills": [
          "pagtuturo",
          "pagpapadaloy"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Isulat ang mga hakbang kapag may pagpapaalis",
        "description": "Sumulat ng simpleng sunud-sunod na hakbang kapag may pinapaalis: idokumento ang lahat, kontakin ang libreng tulong legal bago ang deadline, ayusin ang suporta ng magkakapitbahay, at huwag kailanman balewalain ang mga petsa sa korte.",
        "hours": 3,
        "skills": [
          "pagsusulat"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Makipag-ugnay sa libreng tulong legal at iba pang suporta",
        "description": "Bumuo ng ugnayan sa mga abogado ng umuupa, libreng tulong legal, at tagapayo sa pabahay para maipasa ng unyon ang mga kasong nangangailangan ng propesyonal na tulong. Panatilihing sariwa ang mga contact.",
        "hours": 3,
        "skills": [
          "pakikipag-ugnayan"
        ]
      }
    ]
  },
  {
    "id": "childcare-collective",
    "name": "Tulungan sa Pag-aalaga ng Bata",
    "purpose": "Magbahaginan ng mapagkakatiwalaang pag-aalaga ng bata sa pagitan ng mga pamilya para makapagtrabaho, makapagpahinga, o makaharap ng emergency ang mga magulang nang walang gastos.",
    "whoItServes": "Mga magulang at tagapag-alaga, lalo na ang mga nagsosolong magulang, mga nagtatrabaho nang turno-turno, at pamilyang maliit ang kita.",
    "whatYoullNeed": "Isang pangkat ng mga pamilyang nasuri na, ligtas na lugar (o salitan ng mga bahay), sistema ng iskedyul, at malinaw na patakaran sa kaligtasan. Mabigat na responsibilidad ang pag-aalaga ng anak ng iba — panatilihing mahigpit ang patakaran sa pagbabantay, suriin ang mga tagapag-alaga, at sundin ang patakaran sa inyong lugar tungkol sa impormal na pag-aalaga ng bata.",
    "setupHours": 28,
    "defaultCategory": "childcare",
    "suggestsWorkDays": true,
    "firstSteps": "Sa mga sala ng bahay unang naitatayo ang proyektong ito bago sa kahit saan: tipunin ang mga tagapagtatag na pamilya at pag-usapan ang mga hindi komportableng detalye — pagsusuri, pagbabantay, estilo ng pagdidisiplina, ano ang mangyayari kapag nasaktan ang isang bata — bago pa mag-iskedyul ng kahit isang oras ng pag-aalaga ang sinuman. Suriin din sa parehong panahong iyon ang patakaran sa inyong lugar tungkol sa impormal na pag-aalaga ng bata, para ang modelong pagkakasunduan ninyo ay talagang kaya ninyong patakbuhin.",
    "commonPitfalls": "Dalawang bagay ang tahimik na sumisira sa tulungan sa pag-aalaga: ang hindi pantay na oras, kung saan laging ang parehong pamilya ang nagpapatuloy sa bahay nila hanggang magtampo, at ang patakaran sa kaligtasang lumuluwag habang nagiging komportable ang lahat — ang minsan-lang na pagpapaubaya sa patakarang walang-nag-iisa ang eksaktong paraan kung paano nasisira ang tiwala. Gawing hayag ang talaan ng oras at ituring na pinakamahalaga ang patakaran sa kaligtasan sa mismong mga pamilyang pinakakilala mo.",
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
        "name": "Tipunin ang mga tagapagtatag na pamilya at pumili ng modelo",
        "description": "Mag-imbita ng mga pamilyang magkakakilala o kayang magtayo ng tiwala sa isa't isa. Pagpasyahan ang modelo: salitan sa pag-aalaga kung saan nagbibigay at tumatanggap ng oras ng pag-aalaga ang mga magulang, o naka-iskedyul na sabayang pag-aalaga.",
        "hours": 4,
        "skills": [
          "pakikipag-ugnayan",
          "pagpapadaloy"
        ]
      },
      {
        "name": "Itakda ang pamantayan sa kaligtasan at pagsusuri",
        "description": "Pagkasunduan ang pagsusuri sa sinumang mag-aalaga ng bata: mga reference, background check kung nararapat, at mahigpit na patakarang walang iisang adult na nag-iisang kasama ang anak ng ibang pamilya nang walang nakakaalam. Itakda ang bilang ng adult kada bata.",
        "hours": 6,
        "skills": [
          "pag-aalaga ng bata"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Humanap ng lugar at gawin itong ligtas sa bata",
        "description": "Pumili ng venue o magtakda ng pamantayan para sa mga bahay na pagdadausan. Suriin ang mga panganib, takpan ang mga saksakan, itali ang mabibigat na muwebles, ikandado ang mga gamot at kemikal, at tiyaking ligtas ang labas kung gagamitin.",
        "hours": 4,
        "skills": [
          "pag-aalaga ng bata",
          "pagkukumpuni ng bahay"
        ]
      },
      {
        "name": "Gumawa ng sistema ng iskedyul at oras",
        "description": "Gumamit ng shared calendar o app ng tulungan. Sa modelong batay sa oras, ang isang oras ng pag-aalagang ibinigay ay katumbas ng isang oras ng pag-aalaga para sa pamilya mo. Itala kung sino ang nagpapatuloy kailan para manatiling pantay ang pasan.",
        "hours": 3,
        "skills": [
          "pag-aayos",
          "pagtatala"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Itakda ang patakaran sa kalusugan, allergy, at emergency",
        "description": "Ipunin ang impormasyon sa allergy, mga gamot, contact sa emergency, at kung sino ang puwedeng sumundo sa bawat bata. Isulat ang malinaw na patakaran sa batang may sakit at ang gagawin kapag may medikal na emergency.",
        "hours": 3,
        "skills": [
          "papeles",
          "pagsusulat"
        ]
      },
      {
        "name": "Sanayin ang mga tagapag-alaga sa mga batayan",
        "description": "Talakayin ang pagbabantay, ligtas na pagtulog ng sanggol, pagtugon sa allergy at emergency, at ang mga patakaran sa kaligtasan. Hikayating may kahit isang adult na sanay sa pediatric first aid at CPR bawat session.",
        "hours": 5,
        "skills": [
          "pagtuturo",
          "paunang lunas"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Magsagawa ng subok na session at mangalap ng puna",
        "description": "Magdaos ng maikling pilot kasama ang ilang pamilya, saka mag-usap pagkatapos. Ayusin ang hindi umandar bago palakihin. Regular na magkumustahan para manatiling matibay ang tiwala at kaligtasan.",
        "hours": 3,
        "skills": [
          "pag-aalaga ng bata"
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
    "name": "Compostan ng Komunidad",
    "purpose": "Ipunin ang mga tirang pagkain para mailayo sa tambakan ng basura at makagawa ng libreng compost para sa mga lokal na hardin.",
    "whoItServes": "Mga sambahayang walang paraang mag-compost, mga hardin ng komunidad, at ang kapaligiran ng lugar.",
    "whatYoullNeed": "Lugar para sa compostan, mga lalagyan ng tirang pagkain, pangunahing kagamitan, at maliit na salitan sa pag-aasikaso.",
    "setupHours": 22,
    "defaultCategory": "infrastructure",
    "suggestsWorkDays": true,
    "firstSteps": "Kausapin ang may-ari ng lugar at ang mga kapitbahay na aabutin ng amoy bago pa dumating ang unang lalagyan — ang takot sa amoy at daga ang pumapatay sa mga compostan, at mas kayang pawiin iyon ng maaga at tapat na usapan kaysa anumang polyeto. Pagkatapos, hanapin ang tutunguhan ng compost ninyo (isang hardin ng komunidad na gusto ito) at kahit isang taong talagang nakapagpanatili ng mainit na tumpok; ang husga niya ang huhubog sa paraang pipiliin ninyo.",
    "commonPitfalls": "Namamatay ang mga compostan kapag walang nag-aako ng paghahalo: hihinto ang tumpok o mag-uumpisang umamoy, maiinis ang kapitbahay, at babawiin ng may-ari ang pahintulot — mas mabilis gumalaw ang kadenang iyon kaysa inaakala mo. Itugma ang dami ng tirang tinatanggap ninyo sa kayang iproseso ng inyong salitan, at ituring ang isang nakontaminang batch na problema sa karatulang aayusin, hindi miyembrong sisisihin.",
    "pairsWith": [
      "community-garden",
      "community-meal"
    ],
    "tasks": [
      {
        "name": "Humanap ng lugar para sa compostan",
        "description": "Sumiguro ng puwestong may espasyo at kaunting araw — sulok ng hardin ng komunidad, bakanteng lote, o bakuran ng pumapayag. Kumpirmahin ang pahintulot at alamin ang patakaran ng lokal na pamahalaan sa pag-compost.",
        "hours": 4,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Pumili ng paraan ng pag-compost",
        "description": "Piliin ang bagay sa laki ninyo: tatlong-kahong mainit na compost, umiikot na bin, o vermi bin na may uod. Itugma ang paraan sa dami ng inaasahang materyal at sa kaya ninyong paghahalo.",
        "hours": 3,
        "skills": [
          "paggawa ng compost"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Kumuha ng mga bin at kagamitan",
        "description": "Gumawa o bumili ng mga lalagyan at ng istruktura ng compostan. Maghanda ng tinidor na panghardin, termometro, at brown na materyal (dahon, karton) na ititimpla sa mga tirang pagkain.",
        "hours": 4,
        "skills": [
          "karpinterya",
          "pagmamaneho"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Ayusin kung paano darating ang mga tira",
        "description": "Pagpasyahan kung paano darating ang mga tira: lalagyang bagsakan na may takdang oras, o ruta ng pagsundo ng mga tumutulong. Bigyan ang mga kalahok ng maliliit na lalagyang pangkusina at malinaw na iskedyul ng pagdadala.",
        "hours": 4,
        "skills": [
          "pag-aayos"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Linawin kung ano ang tinatanggap",
        "description": "Magpaskil ng simpleng listahan ng oo/hindi (oo: prutas, gulay, kape, balat ng itlog; hindi: karne, gatas, mantika, dumi ng alagang hayop). Ang malinaw na karatula ang pumipigil sa kontaminasyong sumisira sa isang batch.",
        "hours": 2,
        "skills": [
          "pagsusulat",
          "pagsasalin"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Buuin at sanayin ang salitan sa pag-aasikaso",
        "description": "Kailangan ng compost ng regular na paghahalo, pagsusuri ng basa, at tamang timpla ng berde at brown na materyal. Gumawa ng iskedyul na salitan at ituro ang mga batayan para hindi umamoy o humimpil ang mga tumpok.",
        "hours": 3,
        "skills": [
          "paggawa ng compost",
          "pagtuturo"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Ipamahagi ang tapos na compost",
        "description": "Kapag handa na ang compost, ibahagi ito nang libre sa mga nagdala ng tira at sa mga hardin ng komunidad. Ipaskil ang mga araw ng kunan at magdala ng mga supot o balde.",
        "hours": 2,
        "skills": [
          "pagmamaneho"
        ],
        "recurringCadence": "cycle"
      }
    ]
  },
  {
    "id": "free-little-library",
    "name": "Munting Libreng Aklatan at Palitan ng Libro",
    "purpose": "Maglaan ng libreng libro 24/7 para hikayatin ang pagbabasa at pagbabahagi, nang walang kailangang card o anumang halaga.",
    "whoItServes": "Mga bata, pamilya, at mambabasa sa lahat ng edad, lalo na sa mga lugar na limitado ang makukuhang libro.",
    "whatYoullNeed": "Kahon ng librong hindi tinatablan ng ulan, panimulang koleksyon, puwestong may pumapayag, at magaang pag-aasikaso.",
    "setupHours": 7.5,
    "defaultCategory": "education",
    "firstSteps": "Magsimula sa dalawang maikling usapan: isa sa may-ari ng pader o bakurang paglalagyan ng kahon, tungkol sa puwesto at sa mangyayari kapag pumangit ito, at isa sa mga pamilya at paaralang malapit tungkol sa mga librong talagang iuuwi nila. Ihanda ang taga-asikaso — ang taong titingin dito linggo-linggo — bago pa itayo ang kahon, hindi pagkatapos.",
    "commonPitfalls": "Hindi namamatay ang mga munting aklatan sa kakulangan ng libro — namamatay sila sa maling libro: may magtatambak ng kahon ng lumang textbook, malilibing ang magagandang titulo, papasok ang ulan, at tahimik na hihinto ang mga tao sa pagtingin. Halos lahat iyon ay napipigilan ng limang minutong lingguhang dalaw ng taga-asikaso; mas kailangan ng kahon ang isang tao kaysa mga donasyon.",
    "pairsWith": [
      "seed-library",
      "books-to-prisoners"
    ],
    "tasks": [
      {
        "name": "Gumawa o kumuha ng kahong hindi tinatablan ng ulan",
        "description": "Gumawa o bumili ng matibay at hindi pinapasok ng tubig na kahon sa poste o pader. Puwede ang na-repurpose na kabinet. Lagyan ng malinaw na pinto at nakahilig na bubong para manatiling tuyo ang mga libro.",
        "hours": 4,
        "skills": [
          "karpinterya"
        ]
      },
      {
        "name": "Pumili at ihanda ang puwesto",
        "description": "Pumili ng puwestong madaanan ng tao at may pahintulot — sarili mong harapan, sentro ng komunidad, o gilid ng parke. Ibaon nang matibay ang kahon at tiyaking pinapayagan ito.",
        "hours": 1,
        "skills": [
          "pakikipag-ugnayan"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Punuin ang panimulang koleksyon",
        "description": "Mag-ipon ng mga donasyong libro sa maliit na hakbang ng panghihingi. Hangarin ang halo: librong pambata, sikat na nobela, at praktikal na libro. Simulan itong kalahati lang ang laman para may lugar pa ang maidadagdag.",
        "hours": 1.5,
        "skills": [
          "pakikipag-ugnayan"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Maglagay ng karatula at simpleng kaugalian",
        "description": "Ipaskil ang “Kumuha ng libro, mag-iwan ng libro — lahat libre.” Panatilihing malugod at kaunti ang patakaran. Magdagdag ng linyang nag-iimbita sa lahat ng edad at wika.",
        "hours": 0.5,
        "skills": [
          "pagsusulat"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Humanap ng taga-asikaso",
        "description": "Hilingin sa isang nakatirang malapit na tingnan ang kahon linggo-linggo: ayusin ito, alisin ang sira o hindi angkop, at ayusin muli ang halo ng laman. Limang minuto bawat linggo ang nagpapanatili nitong maayos.",
        "hours": 0.5,
        "skills": [
          "pakikipag-ugnayan"
        ]
      }
    ]
  },
  {
    "id": "community-first-aid-training",
    "name": "Pagsasanay ng Komunidad sa First Aid at Pagtugon sa Overdose",
    "purpose": "Sanayin ang mga kapitbahay sa first aid, CPR, at pagsagip sa na-overdose para makatugon ang komunidad sa mga minutong bago dumating ang mga propesyonal.",
    "whoItServes": "Lahat; pinakamalaki ang tulong kung saan mabagal dumating ang ambulansya o mataas ang bilang ng overdose.",
    "whatYoullNeed": "Mga sertipikadong tagapagsanay, mga gamit, lugar, at paulit-ulit na iskedyul. Ang lahat ng medikal na pagsasanay ay dapat ibigay ng mga sertipikadong instruktor; inaayos at pinapatuloy ng proyektong ito ang pagsasanay, hindi ito pinapalitan.",
    "setupHours": 17,
    "defaultCategory": "education",
    "firstSteps": "Ang unang usapan mo ay sa mga talagang magtuturo — isang chapter ng Red Cross, ang lokal na health office, o isang organisasyon ng harm reduction. Itanong kung ano ang kailangan nila mula sa magpapatuloy at anong mga petsa ang kaya nila, saka kausapin ang mga pinakamalamang makasaksi ng emergency — mga pamilyang may kaanak na apektado ng droga, mga tauhan ng kalapit na negosyo — para ang mga unang session ay maitayo sa paligid nila.",
    "commonPitfalls": "Kumukupas ang proyektong ito kapag naging isang malaking pagsasanay na hindi na naulit — nalilimutan ang natutunan at nag-e-expire ang naloxone nang walang nakakapansin. At labanan ang tuksong kayo mismo ang magturo ng medikal na nilalaman; ang papel ninyo ay magpatuloy ng mga sertipikadong instruktor, hindi pumalit sa kanila.",
    "pairsWith": [
      "harm-reduction-supplies",
      "emergency-preparedness"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Makipagtulungan sa mga sertipikadong tagapagsanay",
        "description": "Makipag-ugnay sa mga kwalipikadong instruktor — ang Red Cross, ang lokal na health office, o isang organisasyon ng harm reduction. Sila ang magbibigay ng mismong medikal na pagsasanay; ang papel mo ay ayusin at patuluyin ito.",
        "hours": 4,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Kumuha ng mga gamit",
        "description": "Kumuha ng mga first-aid kit, manikin na pagsasanayan sa CPR (kadalasang ipinapahiram ng tagapagsanay), at naloxone. Maraming tanggapan ng pampublikong kalusugan ang namimigay ng libreng naloxone — magtanong sa health office o sa mga organisasyon ng harm reduction.",
        "hours": 3,
        "skills": [
          "pakikipag-ugnayan",
          "pagmamaneho"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Humanap ng lugar at magtakda ng mga session",
        "description": "Mag-book ng kuwartong kasya ang hands-on na pagsasanay — sentro ng komunidad, aklatan, o klinika. Magtakda ng paulit-ulit na petsa para maiplano ito ng mga tao sa paligid ng trabaho nila.",
        "hours": 2,
        "skills": []
      },
      {
        "name": "Mag-imbita ng mga dadalo",
        "description": "Ikalat nang malawak ang mga session at unahin ang mga malamang makasaksi ng emergency. Gawing madali at libre ang pagpapalista, at mag-alok ng iba't ibang oras para sa mga nagtatrabaho nang turno-turno.",
        "hours": 2,
        "skills": [
          "pakikipag-ugnayan"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Patakbuhin ang mga session ng pagsasanay",
        "description": "Patuluyin ang mga session na pinangungunahan ng tagapagsanay, asikasuhin ang paghahanda at pagtanggap, at tiyaking nakakapagpraktis nang hands-on ang lahat. Magbigay ng maiuuwing reference card.",
        "hours": 4,
        "skills": [
          "pag-aayos"
        ],
        "follows": [
          0,
          1,
          3
        ],
        "recurringCadence": "session"
      },
      {
        "name": "Ipamahagi ang mga kit at mag-ulit ng pagsasanay",
        "description": "Pauwiin ang mga nagsanay na may dalang first-aid kit at naloxone kung mayroon. Magtakda ng pana-panahong pag-uulit para manatiling sariwa ang natutunan.",
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
    "name": "Bangko ng Oras",
    "purpose": "Hayaang magpalitan ng tulong ang mga miyembro batay sa oras — ang isang oras na ibinigay ay isang oras ding matatanggap — at pantay na pinahahalagahan ang gawa ng bawat isa.",
    "whoItServes": "Sinuman, lalo na ang mga sagana sa oras at kakayahan pero kapos sa pera.",
    "whatYoullNeed": "Listahan ng mga miyembro, sistema ng pagtatala, isang tagapag-ugnay, at mga napagkasunduang patakaran.",
    "setupHours": 27,
    "defaultCategory": "organizing",
    "firstSteps": "Magsimula sa mga usapan, hindi sa software: umupo kasama ang sampu o labinlimang kapitbahay at tanungin ang bawat isa kung ano ang iaalok nila at ano ang hihingin nila. Kung hindi lumitaw sa mga usapang iyon ang iba't iba — hatid, pagtuturo, pagkukumpuni, pagluluto — magpatuloy sa paghahanap ng kasali bago buuin ang sistema.",
    "commonPitfalls": "Bihirang mamatay sa iskandalo ang mga bangko ng oras; namamatay sila sa katahimikan — sumasali ang mga tao, walang gumagawa ng unang hiling, at tumatahimik ang lahat. Magkaroon ng tagapag-ugnay na aktibong nagtutugma ng mga palitan sa mga unang buwan, at panindigan ang linyang isang-oras-ay-isang-oras: sa sandaling pagdebatehan kung mas mataas ba ang oras ng tubero sa gripo kaysa sa oras ng nag-aalaga ng bata, hindi na ito bangko ng oras.",
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
        "name": "Tipunin ang mga unang miyembro at ilista ang kakayahan",
        "description": "Magtipon ng panimulang pangkat at tanungin ang bawat isa kung ano ang kaya nilang ialok (hatid, pagtuturo, pagkukumpuni, pagluluto, paghahalaman) at ano ang kailangan nila. Ang iba't ibang alok ang nagpapaandar nito.",
        "hours": 5,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Pumili ng sistema ng pagtatala",
        "description": "Pumili ng paraan ng pagtatala ng oras: software na para sa bangko ng oras, shared spreadsheet, o simpleng talaan. Kailangan nitong maitala kung sino ang nagbigay at sino ang tumanggap ng oras.",
        "hours": 4,
        "skills": [
          "tulong sa tech",
          "pagtatala"
        ]
      },
      {
        "name": "Itakda ang mga patakaran",
        "description": "Pagkasunduan ang pangunahing prinsipyo (isang oras = isang oras, anuman ang gawain), kung paano humihiling at nagkukumpirma ng palitan ang mga miyembro, at ano ang gagawin kapag naubos na ang oras ng isang miyembro.",
        "hours": 4,
        "skills": [
          "pagpapadaloy",
          "pagsusulat"
        ]
      },
      {
        "name": "Isalubong ang mga bagong miyembro",
        "description": "Magdaos ng maikling pagpapakilala para maintindihan ng mga tao ang diwa at ang sistema. Bigyan ang bawat isa ng ilang panimulang oras para makapagsimula agad ang mga palitan.",
        "hours": 4,
        "skills": [
          "pagtuturo"
        ],
        "follows": [
          1,
          2
        ]
      },
      {
        "name": "Ilunsad ang direktoryo ng mga alok",
        "description": "Ilathala ang mahahanap na listahan kung sino ang nag-aalok ng ano. Panatilihing sariwa ito para makahanap ng tulong ang mga miyembro nang hindi laging nagtatanong sa tagapag-ugnay.",
        "hours": 4,
        "skills": [
          "pagtatala"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Pag-ugnayin at itugma ang mga palitan",
        "description": "Magkaroon ng tagapag-ugnay na tumutulong magtugma ng kailangan sa alok, lalo na sa simula, at kumakalabit sa mga tahimik na miyembro. Paglipas ng panahon, direkta nang nag-uugnayan ang mga miyembro.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "pag-aayos"
        ],
        "follows": [
          4
        ]
      },
      {
        "name": "Buuin ang mga gawi ng tiwala at kaligtasan",
        "description": "Magtakda ng kaugalian para sa mga palitang may kinalaman sa bahay o mas nanganganib na miyembro (mga reference, hindi pagkikita nang mag-isa kung hindi komportable). Magdagdag ng simpleng paraan para markahan ang problema.",
        "hours": 4,
        "skills": [
          "pagpapadaloy"
        ]
      }
    ]
  },
  {
    "id": "solidarity-fund",
    "name": "Perang damayan (direktang tulong na pera ng magkakapitbahay)",
    "purpose": "Pagsamahin ang pera para makapagbigay ng direkta at walang kondisyong tulong na pera sa kapitbahay na nasa krisis.",
    "whoItServes": "Mga taong inabot ng biglaang krisis — kulang sa upa, gastos sa pagpapagamot, nakaambang pagputol ng kuryente.",
    "whatYoullNeed": "Malinaw na sistema ng pera, maliit na pangkat na mag-aalaga nito, plano sa pangangalap ng donasyon, at malinaw na pamantayan. May tunay na responsibilidad ang paghawak ng pinagsamang pera — dalawang tao ang dapat pumayag sa bawat paglabas ng pera, panatilihing malinis ang talaan, ingatan ang privacy ng mga tumatanggap, at humingi ng payo tungkol sa legal at buwis na bahagi nito.",
    "setupHours": 23,
    "defaultCategory": "mutual_aid_drive",
    "firstSteps": "Bago pumasok ang kahit isang piso, umupo kasama ang iilang taong pinagkakatiwalaan mo sa pinagsamang pera at mag-usap nang tapat: paano gagana ang pagpayag ng dalawang tao, ano ang ilalathala, at ano ang mangyayari kapag mas marami ang humihingi kaysa sa laman ng pera. Pagkatapos, maghanap ng lokal na non-profit o accountant na gagabay sa iyo sa legal at buwis na bahagi bago buksan ang account.",
    "commonPitfalls": "Mas mabilis masira ang tiwala dahil sa pera kaysa sa anupaman — ang isang paglabas ng pera na walang paliwanag o isang magulong talaan ay puwedeng tumapos sa lahat kahit walang gumawa ng masama. At halos laging mas marami ang humihingi kaysa sa pera; kapag hindi napagkasunduan nang maaga ang pamantayan, ang pagtanggi nang paisa-isa ay uubos sa pangkat at magtatanim ng sama ng loob.",
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
        "name": "Bumuo ng maliit na pangkat na mag-aalaga ng pera",
        "description": "Mag-imbita ng iilang pinagkakatiwalaang tao na maghahawak ng pera. Linawin ang papel ng bawat isa at panindigan ang pagiging bukas mula sa unang araw — tiwala ang pinakamahalaga rito.",
        "hours": 3,
        "skills": [
          "pag-aayos"
        ]
      },
      {
        "name": "Ayusin ang malinaw na paghawak ng pera",
        "description": "Magbukas ng nakalaang account o makipag-ayos sa isang non-profit na magiging legal na tahanan ng pera. Gawing patakaran na dalawang tao ang pumapayag bago lumabas ang anumang halaga, panatilihing malinaw ang talaan, at alamin kung may usaping buwis o legal ang kaayusan — kumonsulta sa lokal na non-profit o accountant.",
        "hours": 5,
        "skills": [
          "pagtutuos",
          "papeles"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Pagkasunduan ang pamantayan sa paghingi at pagbibigay",
        "description": "Pagpasyahan kung sino ang puwedeng humingi, magkano ang karaniwang halaga, gaano kadalas puwedeng humingi ang isang tao, at kung unang dating o batay sa bigat ng pangangailangan. Panatilihing mababa ang mga hadlang at hanggang makakaya, iwasang humingi ng patunay ng kahirapan.",
        "hours": 4,
        "skills": [
          "pagpapadaloy"
        ]
      },
      {
        "name": "Gumawa ng simple at magaan na form ng paghingi",
        "description": "Gumawa ng maikli at pribadong form na nagtatanong lang ng talagang kailangan. Magbigay ng iba't ibang paraan ng paghingi (online, tawag, personal) at ingatan ang privacy ng mga sumasagot.",
        "hours": 2,
        "skills": [
          "pagsusulat"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Simulan ang pangangalap ng donasyon",
        "description": "Pagsamahin ang maliliit na buwanang donasyon mula sa mga miyembro at ang paminsan-minsang donation drive. Maging tapat sa mga nagbibigay: diretso sa kapitbahay na nangangailangan ang pera.",
        "hours": 4,
        "skills": [
          "pakikipag-ugnayan"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Buuin ang daloy ng desisyon at paglabas ng pera",
        "description": "Magtakda ng ipinangakong bilis ng sagot, mabilis na pagsusuri ng pangkat, at mga paraan ng pagbibigay na mabilis dumating. Mahalaga ang bilis sa krisis. Itala nang simple ang bawat desisyon.",
        "hours": 3,
        "skills": [
          "pag-aayos"
        ],
        "follows": [
          1,
          2
        ]
      },
      {
        "name": "Mag-ulat nang bukas",
        "description": "Magbahagi ng regular na buod — perang pumasok, perang lumabas, bilang ng kapitbahay na natulungan — nang hindi nabubunyag ang pagkakakilanlan ng mga tumanggap. Ang pagiging bukas ang nagpapatuloy sa pagbibigay ng mga tao.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "pagsusulat",
          "pagtutuos"
        ]
      }
    ]
  },
  {
    "id": "diaper-hygiene-bank",
    "name": "Bangko ng diaper at gamit pangkalinisan",
    "purpose": "Mamigay ng libreng diaper, napkin at iba pang pangregla, at gamit pangkalinisan — mga bagay na hindi kayang kunin sa karamihan ng tulong-pagkain.",
    "whoItServes": "Mga pamilyang maliit ang kita, mga sanggol, mga nagreregla, at mga kapitbahay na walang tirahan.",
    "whatYoullNeed": "Imbakan, tuloy-tuloy na pinagkukunan, mga puwesto ng pamimigay, at mga tutulong.",
    "setupHours": 10,
    "defaultCategory": "mutual_aid_drive",
    "suggestsWorkDays": true,
    "firstSteps": "Kausapin muna ang mga taong araw-araw nakakakita sa mga pamilya — ang klinika ng mga bata, ang community pantry, ang simbahan — at itanong kung anong size at produkto ang talagang madalas maubos, at kung papayag silang doon gawin ang pamimigay. Ang isang usapang iyon ang magliligtas sa iyo sa buwan-buwang panghuhula.",
    "commonPitfalls": "Ang pinakamasakit ay ang hindi maasahan: isang malaking drive, punong estante, tapos buwan-buwang walang laman sa mismong panahong nagsimula nang umasa ang mga pamilya. Bantayan din ang totoong laman ng imbakan — nagtutumpok ang pang-newborn na size habang nauubos ang malalaki — at huwag na huwag hihingi ng patunay ng pangangailangan; bahagi ng tulong ang dignidad.",
    "pairsWith": [
      "welcome-wagon",
      "laundry-shower-access"
    ],
    "tasks": [
      {
        "name": "Maghanap ng imbakan at puwesto ng pamimigay",
        "description": "Maghanap ng tuyo at nakakandadong imbakan at lugar ng pag-abot ng gamit — isang aparador sa klinika, simbahan, o community center. Dapat pribado at may dignidad ang pakiramdam sa puwesto ng pamimigay.",
        "hours": 2,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Ayusin ang pinagkukunan ng supply",
        "description": "Pagsamahin ang pagbili nang bultuhan, mga donation drive, at ugnayan sa network ng mga bangko ng diaper o mga wholesaler. Itala kung aling pinagkukunan ang tuloy-tuloy para hindi maubusan.",
        "hours": 3,
        "skills": [
          "pakikipag-ugnayan",
          "pagmamaneho"
        ]
      },
      {
        "name": "Pagbukud-bukurin at itala ayon sa size at uri",
        "description": "Ayusin ang mga diaper ayon sa size, pati ang mga pangregla at gamit pangkalinisan. Panatilihin ang tuloy-tuloy na bilang para alam mo kung ano ang hihilingin. Madalas kulang ang size para sa mas malalaking sanggol.",
        "hours": 1.5,
        "skills": [
          "pag-aayos",
          "pagtatala"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Magtakda ng patas na patakaran sa pamimigay",
        "description": "Pagpasyahan kung gaano karami ang makukuha ng bawat pamilya at gaano kadalas, nang walang hinihinging patunay ng pangangailangan. Gawin itong maasahan para makaasa rito ang mga tao.",
        "hours": 1,
        "skills": [
          "pagpapadaloy"
        ]
      },
      {
        "name": "Mag-iskedyul ng pamimigay at maghanap ng tutulong",
        "description": "Magtakda ng regular na araw ng pamimigay, mag-imbita ng mga tutulong sa pag-abot ng gamit, at panatilihing mainit at walang panghuhusga ang pakikitungo.",
        "hours": 2.5,
        "skills": [
          "pag-aayos"
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
    "name": "Talyer ng bisikleta ng komunidad",
    "purpose": "Mag-alok ng libreng espasyo, kagamitan, at tulong sa pagkukumpuni, pagbuo, at pag-uwi ng sariling bisikleta, para maging abot-kaya at bukas sa lahat ang transportasyon.",
    "whoItServes": "Mga taong walang sasakyan, mga kabataan, mga nagko-commute, at sinumang nangangailangan ng murang transportasyon.",
    "whatYoullNeed": "Espasyo, mga kagamitan, mga donasyong bisikleta at piyesa, at mga mekanikong tutulong.",
    "setupHours": 20,
    "defaultCategory": "transport",
    "suggestsWorkDays": true,
    "firstSteps": "Bago maghanap ng espasyo, kausapin ang mga taong gagamit ng talyer at ang mga mekanikong magtuturo — at kung may talyer ng bisikleta ng komunidad sa kalapit na lungsod, bisitahin ito at itanong kung ano ang gagawin nilang iba. Sa may-ari ng espasyo, pag-usapan agad ang imbakan, ang pagpasok, at ang insurance.",
    "commonPitfalls": "Namamatay ang talyer kapag ang mga tutulong ang nag-aayos ng bisikleta sa halip na magturo: nagiging libreng repair shop ito, humahaba ang pila, at nauupos ang mga mekaniko mo. Mag-ingat din sa pagkalunod sa mga donasyong sirang bisikleta — magpasya nang walang awa sa pagpili — at huwag hayaang may bisikletang umalis nang hindi nasusuri ang preno at gulong.",
    "pairsWith": [
      "repair-cafe",
      "rides-transportation",
      "tool-lending-library"
    ],
    "tasks": [
      {
        "name": "Maghanap ng espasyo ng talyer",
        "description": "Maghanap ng garahe, silong ng bahay, container van, o shared na espasyo ng komunidad na may lugar para gumawa at mag-imbak ng bisikleta. Kumpirmahin ang pagpasok at anumang kailangan sa insurance.",
        "hours": 4,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Mag-ipon ng kagamitan at repair stand",
        "description": "Mag-ipon ng pangunahing toolkit sa bisikleta at kahit isang repair stand mula sa donasyon o maliit na budget. Ayusin ang mga kagamitan para madaling hanapin at maisauli.",
        "hours": 5,
        "skills": [
          "pagmamaneho"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Tipunin ang mga donasyong bisikleta at piyesa",
        "description": "Maglabas ng panawagan para sa mga bisikletang hindi na ginagamit at mga piyesang maililigtas pa. Pagbukurin sa “kaya pang ayusin,” “pampiyesa,” at “handa nang sakyan.” Ang imbak na piyesa ang bumubuhay sa talyer.",
        "hours": 4,
        "skills": [
          "pagkukumpuni",
          "pagmamaneho"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Mag-imbita ng mga mekanikong tutulong",
        "description": "Maghanap ng iilang marunong mag-ayos ng bisikleta at, higit pa roon, marunong magturo. Ang layunin ay matulungan ang mga taong matutong kumpunihin ang sarili nilang bisikleta, hindi gawin ito para sa kanila.",
        "hours": 3,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Magtakda ng bukas na oras at modelong aral-at-uwi",
        "description": "Pumili ng maasahang oras ng pagbubukas. Pag-isipan ang programang aral-at-uwi: matututo ang isang tao ng pagkukumpuni sa loob ng ilang sesyon at uuwing may bisikletang siya mismo ang nag-ayos.",
        "hours": 2,
        "skills": [
          "pag-aayos"
        ]
      },
      {
        "name": "Magtatag ng mga gawi sa kaligtasan",
        "description": "Hilinging magsuot ng salaming pamproteksiyon, magtakda ng patakaran sa paggamit ng kagamitan, at maghanda ng first-aid kit. Laging suriin ang kaligtasan (preno, gulong, headset) bago umalis ang anumang bisikleta.",
        "hours": 2,
        "skills": [
          "pagsusulat"
        ]
      }
    ]
  },
  {
    "id": "newcomer-translation-network",
    "name": "Network ng tulong sa mga bagong dating at pagsasalin",
    "purpose": "Tulungan ang mga migrante at refugee na makahanap ng daan sa bagong lugar — pagsasalin, papeles, paggabay sa mga unang hakbang, at koneksiyon sa komunidad.",
    "whoItServes": "Mga bagong dating na migrante at refugee, at mga kapitbahay na hindi pa bihasa sa wika ng lugar.",
    "whatYoullNeed": "Mga tutulong na marunong ng dalawang wika, mga katuwang na organisasyon, mga panimulang gabay, at sistema ng paghingi. Maging maingat lalo na sa privacy: huwag kumuha ng estado sa imigrasyon, idaan ang mga legal na tanong sa mga kuwalipikadong abogado sa imigrasyon, at hayaang ang mga miyembro mismo ng komunidad ang magsabi kung anong tulong ang talagang gusto nila.",
    "setupHours": 22,
    "defaultCategory": "other",
    "firstSteps": "Simulan sa pakikipag-usap sa mismong mga komunidad ng bagong dating at sa mga organisasyong matagal nang kasama nila — hayaang sila ang magsabi kung anong tulong ang gusto nila sa halip na idisenyo ito para sa kanila. At bago dumating ang unang hiling, ihanda na ang pagpapasa: mga kuwalipikadong abogado sa imigrasyon na madadalhan ng bawat legal na tanong.",
    "commonPitfalls": "Ang pinakamabigat na panganib ay ang mga tutulong na, sa kabutihan ng loob, dumudulas mula sa pagsasalin patungo sa pagbibigay ng legal o medikal na payo na hindi nila kaya — malaki ang maaaring maging kapalit ng maling gabay sa imigrasyon. At kunin lang ang pinakakaunting datos: ang isang pabayang tala tungkol sa estado ng isang tao ay puwedeng maglagay sa kanya sa tunay na panganib.",
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
        "name": "Mag-imbita ng mga tutulong na marunong ng iba't ibang wika",
        "description": "Maghanap ng mga tutulong na nagsasalita ng mga wikang karaniwan sa lugar at makakaagapay sa pagsasalin, mga form, at pagsama. Itugma ang mga wika sa tunay na lokal na pangangailangan.",
        "hours": 4,
        "skills": [
          "pagsasalin",
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Imapa ang mga lokal na mapagkukunan at katuwang",
        "description": "Bumuo ng direktoryo ng mga klinika, eskuwelahan, legal na tulong, klase sa wika, mapagkukunan ng pagkain, at mga organisasyong tumutulong sa migrante. Kadalasan, kailangan lang malaman ng mga bagong dating kung ano ang mayroon at paano ito maaabot.",
        "hours": 5,
        "skills": [
          "pakikipag-ugnayan",
          "pagtatala"
        ]
      },
      {
        "name": "Bumuo ng sistema ng paghingi at pagtutugma",
        "description": "Gumawa ng simpleng paraan para makahingi ng tulong ang mga bagong dating at maitugma sa isang tutulong ayon sa wika at pangangailangan. Mag-alok ng tawag at personal na paraan, hindi lang online.",
        "hours": 3,
        "skills": [
          "pag-aayos",
          "tulong sa tech"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Gumawa ng mga panimulang gabay",
        "description": "Pagsama-samahin ang mga gabay na payak ang wika, sa mga kaugnay na wika, tungkol sa transportasyon, eskuwelahan, kalusugan, at mga karapatan. Gumamit ng mga larawan para gumana ito anuman ang antas ng pagbabasa.",
        "hours": 4,
        "skills": [
          "pagsusulat",
          "pagsasalin"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Mag-alok ng pagsama sa mga appointment",
        "description": "Ayusin na may tutulong na sasama sa mga tao sa appointment na medikal, sa eskuwelahan, o sa mga tanggapan para magsalin at umalalay. Ituro sa mga tutulong na magsalin nang tapat, hindi magbigay ng payong hindi nila kaya.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "pagsasalin"
        ],
        "follows": [
          0,
          2
        ]
      },
      {
        "name": "Magtakda ng mga gawi sa privacy at kaligtasan",
        "description": "Kunin lang ang pinakakaunting impormasyong kailangan at huwag kailanman itanong o itala ang estado sa imigrasyon. Itago nang ligtas ang datos at ituro sa mga tutulong ang maingat na paghawak sa mga sensitibong sitwasyon.",
        "hours": 3,
        "skills": [
          "pagsusulat"
        ]
      }
    ]
  },
  {
    "id": "community-meal",
    "name": "Salo-salo ng komunidad / kusina ng bayan",
    "purpose": "Magluto at magbahagi ng libreng salo-salo sa regular na iskedyul, walang tanong-tanong.",
    "whoItServes": "Sinumang nagugutom, nag-iisa, o kapos sa pagkain; nagbubuo rin ito ng koneksiyon sa buong kapitbahayan.",
    "whatYoullNeed": "Kusina, mga kusinero, tuloy-tuloy na pinagkukunan ng sangkap, espasyo ng paghahain, at pangkat ng mga tutulong. May tunay na responsibilidad sa kaligtasan ng pagkain ang pagpapakain sa publiko — alamin ang mga lokal na patakaran sa permit at sa sertipikadong food handler, at sundin tuwina ang ligtas na pag-iimbak at tamang temperatura.",
    "setupHours": 22,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Ang unang dalawang usapan mo ay sa magpapahiram ng kusina — bulwagan ng simbahan o community center — tungkol sa mga araw na plano mo, at sa lokal na tanggapang pangkalusugan tungkol sa permit at paghawak ng pagkain; iyon ang huhubog sa lahat ng iba pa. Pagkatapos, itanong sa mga taong kakain kung anong araw at oras talaga ang puwede sa kanila.",
    "commonPitfalls": "Ang isang pagkakamali sa kaligtasan ng pagkain ay puwedeng makasakit ng tao at tumapos sa proyekto — hindi nilalaktawan ang mga patakaran sa temperatura at imbakan, kahit minsan. Ang mas mabagal na kamatayan ay ang parehong tatlong tao ang nagluluto ng bawat salo-salo hanggang sa maupos sila, kaya palawakin ang pangkat at pagsalit-salitin ang punong kusinero mula sa simula.",
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
        "name": "Maghanap ng kusina at espasyo ng paghahain",
        "description": "Maghanap ng kusinang kasya ang pagluluto nang marami — bulwagan ng simbahan, community center, o komersiyal na kusina — at espasyo ng paghahain. Kumpirmahing bakante ito sa mga araw na plano mo.",
        "hours": 3,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Ayusin ang kaligtasan ng pagkain at mga permit",
        "description": "Alamin ang mga lokal na patakaran sa pagpapakain sa publiko. Baka kailanganin mo ng permit, ng sertipikadong food handler na nakabantay, o ng lisensiyadong kusina. Pag-aralan ang ligtas na pag-iimbak at paghawak ng temperatura.",
        "hours": 4,
        "skills": [
          "kaligtasan ng pagkain"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Buuin ang tuloy-tuloy na pinagkukunan ng pagkain",
        "description": "Pagsamahin ang donasyon mula sa mga grocery at restawran, ang pagbili nang bultuhan, at anumang sobra mula sa hardin o sa pamumulot ng natirang ani. Itala ang mga maaasahang pinagkukunan para makapagplano ng menu ayon sa mayroon.",
        "hours": 3,
        "skills": [
          "pakikipag-ugnayan",
          "pagmamaneho"
        ]
      },
      {
        "name": "Magplano ng menu para sa dami, diyeta, at allergy",
        "description": "Magdisenyo ng simple at masustansiyang pagkaing kayang lutuin nang marami at umaabot ang sangkap. Mag-alok ng vegetarian at lagyan ng malinaw na label ang mga karaniwang allergen.",
        "hours": 2,
        "recurringCadence": "session",
        "skills": [
          "pagluluto"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Mag-imbita ng pangkat sa pagluluto at paghahain",
        "description": "Tipunin ang mga tutulong sa paghahanda, pagluluto, paghahain, at paglilinis. Magtalaga ng punong kusinero kada salo-salo at linawin ang mga papel para maayos ang takbo ng paghahain.",
        "hours": 3,
        "skills": [
          "pagluluto",
          "pag-aayos"
        ]
      },
      {
        "name": "Magtakda ng iskedyul at ipamalita",
        "description": "Pumili ng regular na araw at oras para maasahan ito ng mga tao. Ipamalita sa pamamagitan ng flyer, mga shelter, at pasabi-sabi, nang mainit ang tono at bukas sa lahat.",
        "hours": 2,
        "skills": [
          "pagdidisenyo"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Isagawa ang salo-salo at maglinis",
        "description": "Magluto, maghain nang may dignidad (mas maganda ang paghahain sa mesa kaysa sa pila kung kaya), at linisin ang kusina ayon sa hinihinging pamantayan. Isilid nang ligtas ang mga tira para maipamahagi.",
        "hours": 5,
        "skills": [
          "pagluluto"
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
    "name": "Aklatan ng binhi at palitan ng binhi",
    "purpose": "Magbahagi ng libreng binhi para makapagtanim ng pagkain ang mga tao, habang iniingatan ang mga binhing angkop sa lugar at minana sa mga nauna.",
    "whoItServes": "Mga naghahalaman sa bahay, mga baguhang nagtatanim, at mga hardin ng komunidad.",
    "whatYoullNeed": "Sistema ng imbakan at katalogo, mga donasyong binhi, lugar na maglalagak nito, at iilang mag-aalaga.",
    "setupHours": 8,
    "defaultCategory": "food",
    "firstSteps": "Kausapin ang library o community center tungkol sa paglalagay ng aparador, at ang mga bihasang naghahalaman sa lugar tungkol sa kung ano talaga ang sumisibol nang maganda sa rehiyon mo — nakasalalay sa binhing angkop sa lugar ang tagumpay ng mga baguhan. Madalas na masayang magbibigay ng panimulang binhi ang kalapit na nursery ng halaman o hardin ng komunidad.",
    "commonPitfalls": "Tahimik mamatay ang aklatan ng binhi: lumang binhing hindi na sisibol, mga baguhang naghihinuhang hindi sila marunong maghalaman at hindi na babalik. Ikutin ang imbak nang walang sentimyento, at huwag umasa sa mga isasauli — halos walang nagtatabi ng binhi pabalik — kaya iplano ang muling pagpupuno sa mga donasyon, hindi sa mga isasauli.",
    "pairsWith": [
      "community-garden",
      "free-little-library"
    ],
    "tasks": [
      {
        "name": "Maghanap ng host at sistema ng imbakan",
        "description": "Makipagtulungan sa library, community center, o hardin para paglagyan ng maliit na aparador o mga drawer. Itago ang binhi nang malamig, tuyo, at madilim sa mga sobreng may label.",
        "hours": 2,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Humanap ng panimulang binhi",
        "description": "Tipunin ang donasyon mula sa mga naghahalaman, ang sobrang stock ng mga tindahan ng binhi, at mga paketeng natira sa pagtatapos ng taniman. Piliin ang madadali at angkop-sa-rehiyong uri para magtagumpay ang mga baguhan.",
        "hours": 2,
        "skills": [
          "pakikipag-ugnayan",
          "paghahalaman"
        ]
      },
      {
        "name": "Ayusin at lagyan ng label ang koleksiyon",
        "description": "Pagbukurin ayon sa uri (gulay, halamang pampalasa, bulaklak) at sa hirap. Lagyan ng label ang bawat isa: halaman, taon, at maikling tala sa pagtatanim. Itala kung alin ang madaling tabihan ng binhi.",
        "hours": 2,
        "skills": [
          "paghahalaman",
          "pagtatala"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Magtakda ng mga kaugalian sa paghiram at pagbabahagi",
        "description": "Gawing simple: kumuha ng binhi nang libre, itanim, at kung kaya, magtabi at magsauli ng kaunti sa katapusan ng taniman. Magpaskil ng isang pahinang gabay kung paano ito gumagana.",
        "hours": 1,
        "skills": [
          "pagsusulat"
        ]
      },
      {
        "name": "Panatilihin ang sigla ng binhi at magpuno ulit",
        "description": "Nawawalan ng sigla ang binhi paglipas ng panahon. Ikutin palabas ang lumang imbak, subukan kung sisibol ang mga kahina-hinalang batch, at punuan ulit ang mga uring madalas kunin.",
        "hours": 1,
        "skills": [
          "paghahalaman"
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
    "name": "Programa sa kaalamang digital at pagpapahiram ng device",
    "purpose": "Magpahiram ng mga device at magturo ng mga kakayahang digital para matulungan ang mga taong walang maasahang gadget o internet.",
    "whoItServes": "Mga nakatatanda, mga kapitbahay na maliit ang kita, mga naghahanap ng trabaho, at sinumang naiiwan sa mga bagay na online na lang.",
    "whatYoullNeed": "Mga donasyong device, koneksiyon sa internet, mga magtuturo, at isang espasyo.",
    "setupHours": 27,
    "defaultCategory": "tech",
    "firstSteps": "Kausapin muna ang mga taong gusto mong maabot — sa library, sa sentro ng mga nakatatanda, sa pila ng community pantry — at itanong kung ano talaga ang gusto nilang gawin: konsulta sa doktor online, pag-apply sa trabaho, mga litrato ng mga apo. Pagkatapos, pag-usapan sa library ang espasyo at koneksiyon bago tumanggap ng kahit isang device.",
    "commonPitfalls": "Ang pagpapahiram ng device nang hindi naaayos ang internet ay pagpapahiram ng pabigat na kahon — kalahati ng proyekto ang koneksiyon. Sa mga sesyon, ang klasikong pagkakamali ay ang mga nagtuturong umaagaw ng mouse at nagsasalita ng jargon; at huwag kailanman magpahiram ulit ng device nang hindi ito nabubura nang buo, dahil ang pagtagas ng datos ng isang humiram ay sisira sa lahat ng tiwalang naipundar mo.",
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
        "name": "Tipunin at ayusin ang mga device",
        "description": "Tipunin ang mga donasyong laptop, tablet, at phone. Burahin nang buo ang laman ng bawat isa, i-update, at ihanda para sa madaling paggamit. Subukan kung gumagana ang lahat bago ipahiram.",
        "hours": 8,
        "skills": [
          "tulong sa tech",
          "pagmamaneho"
        ]
      },
      {
        "name": "Mag-set up ng sistema ng pagpapahiram",
        "description": "Gumawa ng simpleng listahan: sino ang humiram ng ano, kalagayan, at petsa ng pagsasauli. Pagpasyahan ang haba ng hiram at isang maluwag na patakaran sa pagsasauli na nakabatay sa tiwala.",
        "hours": 3,
        "skills": [
          "pagtatala"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Ayusin ang koneksiyon sa internet",
        "description": "Maliit ang silbi ng device na walang koneksiyon. Magpahiram ng mobile hotspot, makipagtulungan sa library, o ituro ang mga murang plano ng internet at libreng pampublikong Wi-Fi.",
        "hours": 3,
        "skills": [
          "tulong sa tech",
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Mag-imbita at magsanay ng mga magtuturo",
        "description": "Maghanap ng mga mapasensiyang tutulong at ihanda silang magturo nang walang jargon. Idiin ang pagsunod sa bilis ng nag-aaral at ang hindi pag-agaw ng mouse kahit kailan.",
        "hours": 4,
        "skills": [
          "pagtuturo"
        ]
      },
      {
        "name": "Magdisenyo ng mga aralin para sa baguhan",
        "description": "Bumuo ng maiikling aralin sa mga pinakakailangan: email, kaligtasan online, pag-apply sa trabaho, konsulta sa doktor online, mga form ng gobyerno, at video call. Maglaan ng mga naka-print na madaliang gabay.",
        "hours": 4,
        "skills": [
          "pagtuturo",
          "pagsusulat"
        ]
      },
      {
        "name": "Mag-iskedyul ng mga klase at bukas na oras ng tulong",
        "description": "Mag-alok ng parehong may-ayos na klase at bukas na oras ng “tulong sa tech”. Ipagpalit-palit ang mga oras para sa mga taong may trabaho, at panatilihing kaunti ang magkakasabay.",
        "hours": 3,
        "recurringCadence": "session",
        "skills": [
          "pag-aayos"
        ],
        "follows": [
          3,
          4
        ]
      },
      {
        "name": "Magtakda ng patakaran sa seguridad ng datos at pagsasauli",
        "description": "Burahin nang buo ang bawat device sa pagitan ng mga humihiram, ituro ang ligtas na gawi sa password at privacy, at ipaliwanag kung paano iniingatan ang personal na datos. Maghanda ng plano para sa nawala o nasirang device.",
        "hours": 2,
        "skills": [
          "tulong sa tech",
          "pagsusulat"
        ]
      }
    ]
  },
  {
    "id": "weatherization-brigade",
    "name": "Brigada sa pagkukumpuni at pagpapatibay ng bahay",
    "purpose": "Tulungan ang mga kapitbahay na maliit ang kita, nakatatanda, o may kapansanan sa pagkukumpuni at pagpapatibay ng bahay laban sa panahon, para bumaba ang gastos sa kuryente at maging mas ligtas ang tahanan.",
    "whoItServes": "Mga may-ari ng bahay na maliit ang kita, mga nakatatanda, at mga kapitbahay na may kapansanang hindi kayang gawin o gastusan ang trabaho.",
    "whatYoullNeed": "Mga bihasang tutulong, materyales, kagamitan, at sistema ng paghingi. Manatili sa trabahong kaya ng mga tutulong — ipasa sa mga lisensiyadong propesyonal ang kuryente, gas, istruktura, at bubong.",
    "setupHours": 21,
    "defaultCategory": "housing",
    "suggestsWorkDays": true,
    "firstSteps": "Tipunin muna ang mga pinakabihasang tutulong at pagkasunduan nang sama-sama ang hangganan — aling mga trabaho ang tatanggapin at alin ang mapupunta sa lisensiyadong propesyonal — bago tumanggap ng kahit isang hiling. Ituring na usapan, hindi inspeksiyon, ang unang bisita sa bawat bahay: ang nakatira ang magpapasya kung ano ang gagalawin sa bahay niya.",
    "commonPitfalls": "Ang panganib ay ang lumalaking saklaw: ang “maliit na ayos” na kuryente, gas, o bubong pala — lampas sa kaya ng mga tutulong — doon may nasasaktan. At huwag mangako ng mas maraming bisita kaysa sa kaya ng pangkat; mas masakit sa isang nakatatandang naghintay sa tulong na inasahan niya kaysa sa tapat na hindi sa simula pa lang.",
    "pairsWith": [
      "community-wood-bank",
      "tool-lending-library"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Mag-imbita ng mga bihasang tutulong",
        "description": "Maghanap ng mga taong sanay sa pangunahing karpinterya, pagse-seal ng siwang, insulation, at weather-stripping. Kayang gabayan ng iilang mas bihasang lider ang iba.",
        "hours": 4,
        "skills": [
          "karpinterya",
          "pagkukumpuni ng bahay"
        ]
      },
      {
        "name": "Itakda ang saklaw ng trabaho",
        "description": "Linawin kung ano ang gagawin at hindi. Manatili sa ligtas at simpleng trabaho (pagpapatibay laban sa panahon, mga hawakan sa banyo, maliliit na ayos) at huwag tanggapin ang anumang nangangailangan ng lisensiyadong propesyonal, gaya ng malaking trabaho sa kuryente o gas.",
        "hours": 2,
        "skills": [
          "pagkukumpuni ng bahay"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Bumuo ng sistema ng paghingi at pagsusuri",
        "description": "Gumawa ng paraan para makahingi ng tulong ang mga kapitbahay, tapos mabilis na bisitahin para sukatin ang trabaho, ilista ang materyales, at tiyaking abot ito ng kakayahan at hangganan sa kaligtasan ng pangkat.",
        "hours": 3,
        "skills": [
          "pag-aayos"
        ]
      },
      {
        "name": "Humanap ng materyales at kagamitan",
        "description": "Tipunin ang caulk, weather-stripping, insulation, at pangunahing hardware mula sa donasyon, sa pakikipag-usap sa tindahan para sa mas mababang halaga, o sa maliit na budget. Mag-ingat ng shared na lalagyan ng kagamitan.",
        "hours": 4,
        "skills": [
          "pagmamaneho"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Ayusin ang kaligtasan at insurance",
        "description": "Gumamit ng simpleng waiver, magdala ng first-aid kit, hilingin ang tamang gamit pangkaligtasan, at huwag kailanman subukan ang trabahong lampas sa kaya. Kumonsulta tungkol sa insurance na sasaklaw sa pagkukumpuni ng mga tutulong.",
        "hours": 3,
        "skills": [
          "papeles"
        ]
      },
      {
        "name": "Mag-iskedyul at magsagawa ng mga bayanihan",
        "description": "Itugma ang mga trabaho sa mga pangkat ng tutulong, kumpirmahin sa may-ari ng bahay, at tapusin ang trabaho sa isang tutok na sesyon. Igalang ang bahay at ang kagustuhan ng nakatira sa buong panahon.",
        "hours": 5,
        "skills": [
          "pag-aayos",
          "pagkukumpuni ng bahay"
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
    "name": "Bangko ng pagkain para sa alagang hayop at tulong sa pag-aalaga",
    "purpose": "Magbigay ng libreng pagkain at batayang tulong sa pag-aalaga ng mga alagang hayop, para walang mapilitang isuko ang alaga niya dahil sa gastos.",
    "whoItServes": "Mga may alagang hayop na maliit ang kita, mga nakatatandang pirmi at maliit ang kita, at mga kapitbahay na walang tirahan na may kasamang hayop.",
    "whatYoullNeed": "Imbakan, tuloy-tuloy na pagkukunan ng pagkain ng alagang hayop, lugar ng pamimigay, at partnership sa mga beterinaryo.",
    "setupHours": 10,
    "defaultCategory": "mutual_aid_drive",
    "suggestsWorkDays": true,
    "firstSteps": "Kausapin muna ang umiiral na community pantry tungkol sa sabay na pamimigay — madalas ay parehong sambahayan ang nangangailangan ng dalawa — at ang mga lokal na beterinaryo at pet store tungkol sa donasyon at posibleng partnership para sa bakuna o mas abot-kayang halaga.",
    "commonPitfalls": "Ang pabago-bago ang pinakamalaking pinsala: isang malaking drive, tapos walang laman ang istante, gayong kailangang maasahan ka ng mga may alaga. At bantayan ang tono — ang anumang panghuhusga kung “dapat bang mag-alaga ng hayop ang mahihirap” ay mas mabilis pang papatay sa proyektong ito kaysa sa maubusan ng pagkain.",
    "pairsWith": [
      "diaper-hygiene-bank",
      "community-fridge"
    ],
    "tasks": [
      {
        "name": "Maghanap ng imbakan at lugar ng pamimigay",
        "description": "Maghanap ng imbakang tuyo at hindi mapapasukan ng peste, at lugar na mapamimigayan ng pagkain — madalas katabi ng umiiral na community pantry o community center.",
        "hours": 2,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Buuin ang pagkukunan ng pagkain ng alagang hayop",
        "description": "Pagsamahin ang mga donation drive, donasyon mula sa mga pet store at gumagawa, at pagbili nang maramihan. Itala ang pumapasok para maiplano ang mga pamimigay.",
        "hours": 3,
        "skills": [
          "pakikipag-ugnayan",
          "pagmamaneho"
        ]
      },
      {
        "name": "Ihiwa-hiwalay at itala ayon sa hayop at laki",
        "description": "Paghiwalayin ang pagkain ng aso at pusa (at iba pang hayop), itala ang dami, at tingnan ang mga expiration date. Panatilihing updated ang bilang para gabay sa muling pag-iimbak.",
        "hours": 1.5,
        "skills": [
          "pag-aayos",
          "pagtatala"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Magtakda ng patakaran sa pamimigay",
        "description": "Pagpasyahan kung gaano karami ang makukuha ng bawat sambahayan at gaano kadalas, nang walang hinihinging patunay ng pangangailangan. Gawin itong pirmi para makapagplano ang mga may alaga.",
        "hours": 1,
        "skills": [
          "pagpapadaloy"
        ]
      },
      {
        "name": "Itakda at lagyan ng tao ang pamimigay",
        "description": "Magtakda ng regular na oras ng pamimigay, maghanap ng mga tutulong, at panatilihing walang panghuhusga ang tono. Maraming nagpapalampas ng sariling kainan para lang mapakain ang alaga — salubungin sila nang may respeto.",
        "hours": 2.5,
        "skills": [
          "pag-aayos"
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
    "name": "Mentorship para sa kabataan at programa pagkatapos ng klase",
    "purpose": "Bigyan ang mga bata at teenager ng ligtas na espasyo pagkatapos ng klase, may tulong sa homework, mentorship, at masasayang aktibidad.",
    "whoItServes": "Kabataan sa mga lugar na kulang sa rekurso, at ang mga nagtatrabahong magulang na nangangailangan ng ligtas na mapag-iiwanan ng anak.",
    "whatYoullNeed": "Ligtas na espasyo, mga mentor na dumaan sa masusing pagsusuri, mga aktibidad, at meryenda. Seryosong responsibilidad ang pakikipagtrabaho sa kabataan — suriing mabuti ang mga adult, panatilihin ang tuntuning dalawang adult, sundin ang mga batas sa obligadong pag-uulat, at sumunod sa mga lokal na tuntunin para sa mga programang pangkabataan.",
    "setupHours": 28,
    "defaultCategory": "education",
    "suggestsWorkDays": true,
    "firstSteps": "Bago maghanap ng kahit isang mentor, kausapin ang mga magulang at ang mga kabataan mismo tungkol sa kailangan nila, at isulat ang mga patakaran sa kaligtasan — background check, tuntuning dalawang adult, obligadong pag-uulat. Walang adult na makakasama sa mga bata hangga’t hindi pasado sa mga iyon.",
    "commonPitfalls": "Ang pinakamasamang pagkabigo ay ang pagdadaan sa maikling daan sa kaligtasan: isang adult na hindi nasuri, o isang adult na nag-iisang kasama ang bata — hinding-hindi iyon puwede. Ang pangalawa ay ang pag-alis-alis ng mga mentor; para sa mga batang paulit-ulit nang binigo, nakasasakit ang adult na basta nawawala, kaya magsimula sa maliit at lumago lang hanggang sa kaya mong bantayan at panindigan.",
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
        "name": "Maghanap ng ligtas na espasyo at magtakda ng oras",
        "description": "Maghanap ng angkop at accessible na lugar — silid sa paaralan, aklatan, o community center — at magtakda ng pirming oras pagkatapos ng klase na maaasahan ng mga pamilya.",
        "hours": 3,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Magtakda ng pamantayan sa kaligtasan ng bata at pagsusuri",
        "description": "Atasan ng background check ang mga adult na makakasama ng kabataan, ipatupad ang tuntuning dalawang adult para walang mag-iisang kasama ang bata, at magtakda ng malinaw na patakaran sa asal at pag-uulat.",
        "hours": 6,
        "skills": [
          "pag-aalaga ng bata",
          "pagsusulat"
        ]
      },
      {
        "name": "Maghanap at magsanay ng mga mentor",
        "description": "Maghanap ng maaasahan at mapagmalasakit na mga adult at sanayin sila sa mga hangganan, kaligtasan ng kabataan, at pagtulong nang hindi ginagawa ang gawain para sa bata. Asintahin ang pirmihang pagdalo linggo-linggo.",
        "hours": 6,
        "skills": [
          "pakikipag-ugnayan",
          "pagtuturo"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Planuhin ang mga aktibidad",
        "description": "Pagsamahin ang tulong sa homework at iba pang aktibidad — pagbabasa, sining, laro, kakayahan sa buhay. Panatilihing nakakaengganyo at hayaang tumulong ang kabataan sa paghubog ng nilalaman.",
        "hours": 4,
        "skills": [
          "pagtuturo"
        ]
      },
      {
        "name": "Asikasuhin ang pagpapatala, allergy, at emergency info",
        "description": "Kunin ang pahintulot ng magulang, mga detalye ng allergy at kalusugan, mga contact sa emergency, at kung sino ang awtorisadong sumundo sa bawat bata. Itago ito nang ligtas.",
        "hours": 3,
        "skills": [
          "papeles",
          "pagtatala"
        ]
      },
      {
        "name": "Maghanap ng meryenda at gamit",
        "description": "Maglaan ng masustansyang meryenda (maraming bata ang dumarating na gutom) at mangalap ng libro, gamit sa sining, at laro sa pamamagitan ng donasyon o maliit na badyet.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Patakbuhin ang mga session at kamustahin ang mga pamilya",
        "description": "Buksan ang espasyo, bantayang mabuti, patakbuhin ang mga aktibidad, at panatilihin ang regular na pakikipag-usap sa mga magulang tungkol sa kalagayan ng kanilang mga anak.",
        "hours": 4,
        "skills": [
          "pag-aalaga ng bata",
          "pagtuturo"
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
    "name": "Samahan sa pamumulot ng natirang ani",
    "purpose": "Sagipin ang sobrang ani mula sa mga bukid, taniman ng prutas, hardin, at palengke, at ipamahagi ito bago masayang.",
    "whoItServes": "Mga kapitbahay na kapos sa pagkain at mga proyektong pangpagkain tulad ng community fridge, pantry, at kainan ng komunidad.",
    "whatYoullNeed": "Mga tutulong, transportasyon, ugnayan sa mga magsasaka, at panandaliang imbakan.",
    "setupHours": 21,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Magsimula sa mga nagtatanim: mga bukid, taniman ng prutas, at nagtitinda sa palengke. Itanong kung anong sobra ang mayroon sila at ano ang inaalala nila sa pagpapapasok ng mga tutulong — baka may masaktan o masira ang pananim — at tiyakin kung saan pupunta ang pagkain (fridge, pantry, kainan ng komunidad) bago ang unang ani.",
    "commonPitfalls": "Ang klasikong pagkabigo: nasagip ang prutas pero nabulok lang sa garahe ng isang tao — inaayos ang pamamahagi bago mamitas, hindi pagkatapos. Maikli ang panahon ng anihan, kaya mas mabuti ang maliit na crew na mabilis kumilos kaysa mahabang listahan ng pangalan; at ang isang pabayang pamumulot ng ani na nakasira ng taniman ay puwedeng ikawala ng magsasakang iyon nang tuluyan.",
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
        "name": "Maghanap ng mapagkukunan ng ani",
        "description": "Lapitan ang mga bukid, taniman ng prutas, nagtitinda sa palengke, at mga kapitbahay na hitik ang punong prutas. Marami ang matutuwang may aani ng sobra kaysa mabulok lang ito.",
        "hours": 4,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Bumuo ng crew ng mamumulot ng ani",
        "description": "Gumawa ng listahan ng mga tutulong na mabilis makakakilos kapag handa na ang ani. Maikli ang panahon ng anihan, kaya mas mahalaga ang kakayahang umalis agad kaysa sa dami.",
        "hours": 2,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Ayusin ang transportasyon at imbakan",
        "description": "Maghanda ng mga sasakyang maghahakot ng ani at malamig na lugar na mapaglalagyan nang panandalian. Magtulungan para mabilis makarating ang pagkain mula bukid hanggang sa tatanggap bago masira.",
        "hours": 3,
        "skills": [
          "pagmamaneho"
        ]
      },
      {
        "name": "Mag-set up ng pag-iiskedyul at pagpapakilos",
        "description": "Gumawa ng mabilis na paraan para abisuhan at kumpirmahin ang mga tutulong kapag may pamumulot ng ani, dahil madalas maikli ang abiso ng mga magsasaka. Puwede ang group chat o listahan ng tatawagan.",
        "hours": 2,
        "skills": [
          "pag-aayos"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Ayusin ang usapin ng aksidente at kaligtasan ng pagkain",
        "description": "Alamin ang batas sa lugar ninyo na nagpoprotekta sa pag-donate ng pagkain, magkasundo sa simpleng mga tuntunin sa paghawak, at gumamit ng simpleng waiver para panatag ang mga magsasakang tumanggap ng crew.",
        "hours": 3,
        "skills": [
          "papeles",
          "kaligtasan ng pagkain"
        ]
      },
      {
        "name": "Buuin ang mga dadaluyan ng pamamahagi",
        "description": "Ihanda kung saan pupunta ang naipong ani — mga community fridge, pantry, kainan ng komunidad, o direkta sa mga pamilya — para hindi ito tumengga.",
        "hours": 3,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Magsagawa ng pamumulot ng ani at itala ang kilo",
        "description": "Umani nang maingat para maprotektahan ang lugar, ipamahagi agad, at itala kung ilang kilo ng pagkain ang nasagip. Nakakahikayat ng mga tutulong at magsasaka ang mga numero.",
        "hours": 4,
        "skills": [
          "paghahalaman",
          "pagmamaneho"
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
    "name": "Network ng pamamagitan at pag-aayos ng hindi pagkakasundo sa komunidad",
    "purpose": "Mag-alok ng libre at walang-kinikilingang pamamagitan sa mga hindi pagkakasundo ng magkakapitbahay, para maayos ang mga ito nang walang korte o pulis.",
    "whoItServes": "Magkakapitbahay, mga umuupa at nagpapaupa, magkaka-roommate, at mga samahan sa komunidad na may hindi pagkakasundo.",
    "whatYoullNeed": "Mga sinanay na tagapamagitan, neutral na lugar, at proseso ng paghiling. Para ang pamamagitan sa mga hindi pagkakasundo ng mga panig na parehong pumapayag — salain at i-refer ang anumang sitwasyong may karahasan, pang-aabuso, o panganib sa tamang propesyonal o emergency na linya.",
    "setupHours": 22,
    "defaultCategory": "other",
    "firstSteps": "Kausapin muna ang isang umiiral na center ng pamamagitan sa komunidad o isang tagapagsanay — hindi ito basta naiimprobisa — at bago ang unang pamamagitan, isulat ang inyong hangganan sa pagsala: aling mga hindi pagkakasundo ang tatanggapin, at saan ire-refer ang anumang may karahasan o pang-aabuso.",
    "commonPitfalls": "Ang mapanganib na pagkabigo ay ang pamamagitan sa hindi dapat pamagitanan: ang “away ng magkapitbahay” na pang-aabuso pala ay naglalagay ng tao sa panganib, kaya salain ang bawat hiling. At ang pagiging kumpidensyal ang buong buhay ng proyektong ito — isang detalyeng makalabas at wala nang magtitiwala pa; alagaan din ang mga tagapamagitan mo, dahil nakakaubos ng tao ang gawaing ito.",
    "pairsWith": [
      "legal-aid-clinic",
      "tenant-union"
    ],
    "learnMore": [
      "disagree-with-member"
    ],
    "tasks": [
      {
        "name": "Maghanap at magsanay ng mga tagapamagitan",
        "description": "Maghanap ng mga taong kalmado at patas mag-isip, at ipasanay sila — sa kinikilalang pagsasanay sa pamamagitan, o sa pakikipagtulungan sa umiiral na center ng pamamagitan sa komunidad.",
        "hours": 6,
        "skills": [
          "pakikipag-ugnayan",
          "pagpapadaloy"
        ]
      },
      {
        "name": "Mag-set up ng proseso ng paghiling at intake",
        "description": "Gumawa ng simpleng paraan para makahiling ng pamamagitan ang mga tao. Sa intake, alamin ang batayang kuwento ng bawat panig at tiyaking angkop sa pamamagitan ang sitwasyon.",
        "hours": 3,
        "skills": [
          "pag-aayos",
          "pakikipanayam"
        ]
      },
      {
        "name": "Maghanap ng mga neutral na tagpuan",
        "description": "Maghanap ng tahimik at neutral na lugar — silid sa aklatan o community center — kung saan panatag ang dalawang panig at pantay ang tingin sa isa’t isa.",
        "hours": 2,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Linawin ang saklaw at mga hangganan",
        "description": "Pagpasyahan kung ano ang papamagitanan (ingay, pinagsasaluhang espasyo, maliliit na hindi pagkakasundo) at kung ano ang hindi. Salain ang mga sitwasyong may karahasan, pang-aabuso, o panganib, at i-refer ang mga iyon sa tamang propesyonal.",
        "hours": 3,
        "skills": [
          "pagpapadaloy",
          "pagsusulat"
        ]
      },
      {
        "name": "Itatag ang pagiging kumpidensyal at mga batayang tuntunin",
        "description": "Maglinaw ng mga tuntunin: kumpidensyal, kusang-loob ang pagsali, magalang na paghalinhinan sa pagsasalita, at tagapamagitang gumagabay pero hindi nagpapasya. Isulat ang mga ito para sa mga kalahok.",
        "hours": 3,
        "skills": [
          "pagsusulat"
        ]
      },
      {
        "name": "Ipaalam sa mga tao ang pamamagitan",
        "description": "Ipaalam sa mga kapitbahay, grupo sa pabahay, at mga lokal na organisasyon na may libreng pamamagitan, para maabot ito ng mga tao bago pa lumala ang hindi pagkakasundo.",
        "hours": 3,
        "skills": [
          "pakikipag-ugnayan",
          "pagdidisenyo"
        ],
        "follows": [
          1,
          3
        ]
      },
      {
        "name": "Subaybayan ang mga resulta at alagaan ang mga tagapamagitan",
        "description": "Itala kung ilan ang naaayos (nang hindi nilalabag ang pagiging kumpidensyal) at regular na mag-debrief sa mga tagapamagitan. Nakakaubos ang gawain, kaya magpalitan sa mga hawak at mag-alok ng suporta.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "pagtatala",
          "pagpapadaloy"
        ]
      }
    ]
  },
  {
    "id": "reentry-support",
    "name": "Network ng tulong sa pagbabalik mula sa kulungan",
    "purpose": "Tulungan ang mga bumabalik mula sa pagkakakulong na makakuha ng ID, tirahan, trabaho, at komunidad — para gumaan ang kilalang napakahirap na transisyon.",
    "whoItServes": "Mga taong dating nakulong at ang kanilang mga pamilya.",
    "whatYoullNeed": "Mga tutulong, mga kapartner na organisasyon, at maaasahang direktoryo ng mapagkukunan ng tulong. Ituring na pribado ang rekord at kasaysayan ng bawat tao — manguna sa respeto, sundan ang sarili nilang mga layunin, at i-refer ang mga usaping legal sa kwalipikadong abogado.",
    "setupHours": 28,
    "defaultCategory": "other",
    "firstSteps": "Bago bumuo ng kahit ano, umupo kasama ang mga taong nakauwi na mismo at ang mga organisasyon sa reentry, opisina ng parole, at mga employer na bukas sa may rekord na kumikilos na sa lugar ninyo — itanong kung ano talaga ang humaharang sa mga tao sa unang mga linggo at saan papasok ang network ninyo. Maghanda na ngayon ng contact sa legal aid o kwalipikadong abogado, para kapag may tanong na legal, may totoo kang mapagdadalhan.",
    "commonPitfalls": "Namamatay ang proyektong ito kapag naging pagbabantay ng pinto — mga tutulong na nagpapasya kung sino ang karapat-dapat — o kapag kumalat ang kasaysayan ng isang tao at ikinawala niya ng trabaho o tirahan. Tahimik din itong bumabagsak kapag nauunahan ng sigasig ang pagtupad; ang napakong pangako ay mas mabigat sa taong muling bumubuo ng tiwala kaysa sa walang pangako.",
    "pairsWith": [
      "court-support",
      "books-to-prisoners"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Bumuo ng direktoryo ng tulong at mga kapartner",
        "description": "I-mapa ang mga tanggapan para sa ID at dokumento, tirahan, trabaho, kalusugan, paggamot, at benepisyo. Alamin kung aling mga employer at nagpapaupa ang bukas sa mga taong may rekord.",
        "hours": 6,
        "skills": [
          "pakikipag-ugnayan",
          "pagtatala"
        ]
      },
      {
        "name": "Maghanap at magsanay ng mga tutulong",
        "description": "Maghanap ng mga taong hindi mapanghusga at sanayin sila sa magalang na pagtulong na may pag-unawa sa trauma. Ang kailangan ng mga umuuwi ay kasama, hindi bantay sa pinto.",
        "hours": 5,
        "skills": [
          "pakikipag-ugnayan",
          "pagtuturo"
        ]
      },
      {
        "name": "Gumawa ng pagsalubong at intake ng pangangailangan",
        "description": "Bumuo ng simple at marangal na paraan para malaman ang pinaka-agarang kailangan ng bawat isa — madalas ay ID, matutuluyan, at kita — at magsimula roon.",
        "hours": 3,
        "skills": [
          "pakikipanayam"
        ]
      },
      {
        "name": "Tumulong sa mga dokumento at benepisyo",
        "description": "Tulungan sa pagpapalit ng ID at iba pang dokumento ng gobyerno, pag-apply ng benepisyo, at iba pang papeles na mahirap asikasuhin kapag walang address o internet.",
        "hours": 4,
        "recurringCadence": "month",
        "skills": [
          "papeles"
        ]
      },
      {
        "name": "Iugnay sa trabaho at tirahan",
        "description": "Personal na ipakilala sa mga employer na bukas sa may rekord at sa mga puwedeng tirhan, at tumulong sa mga aplikasyon, resume, at paghahanda sa interview.",
        "hours": 4,
        "recurringCadence": "month",
        "skills": [
          "pakikipag-ugnayan",
          "pagsusulat"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Mag-alok ng mentorship mula sa kapwa nakaranas",
        "description": "Kung kaya, ipares ang mga tao sa mga mentor na dumaan mismo sa pagbabalik. Walang mas mabilis na nagpapalalim ng tiwala kaysa sa parehong karanasan.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "pagpapadaloy"
        ]
      },
      {
        "name": "Magtakda ng gawi sa privacy at mga hangganan",
        "description": "Hawakan ang kasaysayan ng bawat tao nang mahigpit na kumpidensyal, huwag pilitin ang sinumang magbahagi nang higit sa gusto niya, at idaan sa kwalipikadong abogado ang mga tanong na legal.",
        "hours": 3,
        "skills": [
          "pagsusulat"
        ]
      }
    ]
  },
  {
    "id": "community-wood-bank",
    "name": "Bangko ng panggatong ng komunidad / Tulong sa pagpapainit",
    "purpose": "Mangalap at mamigay ng panggatong at ayusin ang tulong sa pagpapainit para manatiling mainit ang mga kapitbahay sa buong taglamig.",
    "whoItServes": "Mga sambahayang maliit ang kita o nasa liblib na lugar na kahoy ang pampainit, at mga nakatatandang hindi na kayang mangahoy o magsibak nang mag-isa.",
    "whatYoullNeed": "Pagkukunan ng kahoy, lugar ng pagproseso at pag-iimbak, kagamitan, sinanay na crew, at plano sa paghahatid. Mapanganib ang chainsaw at splitter — mga sinanay lang ang hahawak, atasan ng protective gear ang lahat, at magpaalala sa crew tungkol sa kaligtasan bago ang bawat session.",
    "setupHours": 24,
    "defaultCategory": "mutual_aid_drive",
    "suggestsWorkDays": true,
    "firstSteps": "Magsimula sa pakikipag-usap sa mga sambahayang kahoy ang pampainit — mga nakatatanda sa liblib na lugar, mga pamilyang kilala na ng tanggapan ng tulong sa panggatong — para malaman kung gaano karami ang nauubos nila at kailan sila kinakapos, saka tawagan ang mga lokal na tagaputol ng puno kung saan napupunta ang kahoy nila ngayon. Bago umandar ang anumang lagari, pagpasyahan kung sino ang may hawak ng kaligtasan: isang taong sapat ang karanasan para sanayin ang crew at kayang tanggihan ang isang nagkukusa.",
    "commonPitfalls": "Dalawa ang paraan para makasakit ito ng tao: isang hindi sinanay na humawak ng chainsaw, at paghahatid ng sariwang kahoy na umuusok, nagpapadikit ng creosote sa tsimenea, at hindi nagpapainit. Ang pagputol sa Oktubre para sa Disyembre ay basang kahoy — kasintotoo ng pagkabigo sa kaligtasan ang pagkabigo sa kalendaryo.",
    "pairsWith": [
      "weatherization-brigade",
      "cooling-warming-center"
    ],
    "tasks": [
      {
        "name": "Maghanap ng pagkukunan ng kahoy",
        "description": "Ayusin ang suplay mula sa mga tagaputol ng puno, paglilinis pagkatapos ng bagyo, donasyong punong natumba, o mga lote na inaalagaan nang maayos. Tiyaking legal ninyong makukuha at mapoproseso ito.",
        "hours": 4,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Maghanap ng lugar ng pagproseso at imbakan",
        "description": "Maghanap ng bakuran o lote na mapagpuputulan, mapagsisibakan, mapagsasalansanan, at mapagpapatuyuan ng kahoy. Kailangan ng espasyo para manatiling tuyo ang suplay ngayong taon habang nagpapatuyo ang para sa susunod.",
        "hours": 4,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Kumuha ng kagamitan at safety gear",
        "description": "Kumuha o humiram ng log splitter, mga chainsaw, at protective gear (chaps, proteksyon sa mata at tainga, guwantes). Panatilihing maayos ang mga gamit at may first-aid kit sa lugar.",
        "hours": 4,
        "skills": [
          "pagmamaneho",
          "pagkukumpuni ng kasangkapan"
        ]
      },
      {
        "name": "Bumuo at magsanay ng crew sa kahoy",
        "description": "Bumuo ng crew at tiyaking ang mga sapat lang ang pagsasanay ang hahawak ng chainsaw at splitter. Magsagawa ng paalala sa kaligtasan bago ang bawat bayanihan.",
        "hours": 4,
        "skills": [
          "pagtuturo",
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Bumuo ng sistema ng paghiling at paghahatid",
        "description": "Gumawa ng paraan para makahiling ng kahoy ang mga sambahayan at maayos ang paghahatid, dahil marami sa tatanggap ay nakatatanda o walang trak. Tiyaking ligtas ang pagsasalansan malapit sa bahay.",
        "hours": 3,
        "skills": [
          "pag-aayos",
          "pagmamaneho"
        ]
      },
      {
        "name": "Magtakda ng pamantayan sa pamimigay",
        "description": "Pagpasyahan kung gaano karaming kahoy ang matatanggap ng bawat sambahayan at unahin ang pinakananganganib sa lamig. Panatilihing simple ang proseso at mababa ang hadlang.",
        "hours": 2,
        "skills": [
          "pagpapadaloy"
        ]
      },
      {
        "name": "Itakda ang mga bayanihan at pagpapatuyo",
        "description": "Iplano ang pagputol at pagsibak nang maaga bago ang taglamig, dahil buwan ang kailangan ng sariwang kahoy para matuyo bago ligtas sunugin. Subaybayan kung alin ang tuyo na at handa.",
        "hours": 3,
        "recurringCadence": "cycle",
        "skills": [
          "pag-aayos"
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
    "name": "Libreng Wi-Fi ng komunidad / Mesh network",
    "purpose": "Magbigay ng libreng koneksyon sa internet kung saan hindi ito abot-kaya o wala talaga.",
    "whoItServes": "Mga sambahayang maliit ang kita, mga estudyante, mga naghahanap ng trabaho, at sinumang hiwalay sa maaasahang internet.",
    "whatYoullNeed": "Isang backhaul na koneksyon sa internet, mga router/mesh node, mga tutulong na marunong sa tech, at mga lugar na magho-host.",
    "setupHours": 32,
    "defaultCategory": "tech",
    "firstSteps": "Lakarin ang mga kalyeng gusto ninyong abutin at kumatok sa mga pinto — kausapin ang mga sambahayang walang koneksyon kung saan nila talaga ito gagamitin, at ang mga taong ang bubong at bintana sa itaas ay puwedeng pagkabitan ng node. Bago bumili ng hardware, pag-usapan ang bandwidth: hanapin ang negosyo, aklatan, o ISP na handang magbahagi ng linya, at tiyaking nakasulat na pinapayagan ang pagbabahagi nito.",
    "commonPitfalls": "Karaniwang namamatay ang mesh network sa pagmementena, hindi sa pagtatayo — lumipat ang techie na nagtatag at wala nang ibang makaka-log in sa mga router, kaya idokumento ang lahat at magsanay ng pangalawang tao mula sa unang araw. Ang isa pang tahimik na pagkabigo: pagtatayo kung saan madaling abutin ng signal sa halip na kung saan talaga walang koneksyon ang mga tao.",
    "pairsWith": [
      "digital-literacy",
      "emergency-preparedness"
    ],
    "tasks": [
      {
        "name": "I-mapa ang pangangailangan at mga butas sa abot",
        "description": "Alamin kung aling mga kalye ang walang abot-kayang koneksyon at kung saan aabot ang signal. Itala ang mga gusaling may line-of-sight at mga pumapayag na host. Ito ang huhubog sa buong disenyo.",
        "hours": 4,
        "skills": [
          "tulong sa tech"
        ]
      },
      {
        "name": "Maghanap ng backhaul na koneksyon sa internet",
        "description": "Ayusin ang pagkukunan ng bandwidth na ibabahagi — donasyong linya ng negosyo, partnership sa ISP, o uplink mula sa community network. Tiyaking pinapayagan ng mga tuntunin ang pagbabahagi.",
        "hours": 5,
        "skills": [
          "pakikipag-ugnayan",
          "tulong sa tech"
        ]
      },
      {
        "name": "Maghanap ng mga tutulong na marunong sa tech",
        "description": "Maghanap ng mga taong sanay sa networking na kayang mag-configure ng router at mag-troubleshoot. Dalawa lang ang kailangan sa simula, dagdag pa ang mga gustong matuto.",
        "hours": 3,
        "skills": [
          "pakikipag-ugnayan",
          "tulong sa tech"
        ]
      },
      {
        "name": "Mangalap at mag-configure ng kagamitan",
        "description": "Ipunin ang mga router, mesh node, at antenna sa pamamagitan ng donasyon o maliit na badyet. I-configure ang mga ito para sa bukas o simpleng ibinabahaging network at subukan ang abot.",
        "hours": 10,
        "skills": [
          "tulong sa tech"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Maghanap ng mga host site para sa mga node",
        "description": "Ilagay ang mga node kung saan lumalawak ang abot — mga bubong, bintana sa itaas, at beranda na may kuryente at pumapayag ang may-ari. Kumuha ng nakasulat na okay mula sa bawat host at sagutin ang maliit na gastos sa kuryente.",
        "hours": 5,
        "skills": [
          "pakikipag-ugnayan"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Magtakda ng mga tuntunin sa paggamit at privacy",
        "description": "Magpaskil ng simpleng mga tuntunin, huwag itala ang ginagawa ng mga nakakonekta, at linawing hindi pribado ang bukas na network. Ituro ang mga batayang pang-iingat tulad ng HTTPS at VPN.",
        "hours": 2,
        "skills": [
          "pagsusulat"
        ]
      },
      {
        "name": "Alagaan at palawakin ang network",
        "description": "Silipin nang regular ang mga node, palitan ang nasirang hardware, at magdagdag ng abot kapag may bagong host. Idokumento ang setup para may iba pang makatulong sa pagmementena.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "tulong sa tech"
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
    "name": "Bilog ng damayan para sa kalusugan ng isip",
    "purpose": "Mag-alok ng ligtas at regular na espasyong hawak ng magkakapwa, para magbahagi at magdamayan ang mga tao — kasama ng propesyonal na pangangalaga, hindi kapalit nito.",
    "whoItServes": "Sinumang dumaraan sa stress, pag-iisa, dalamhati, o hamon sa kalusugan ng isip na naghahanap ng makakasamang kapwa.",
    "whatYoullNeed": "Mga sinanay na tagapagpadaloy, pribadong espasyo, at malinaw na mga hangganan na may planong pang-refer sa oras ng krisis. Ang damayan ng magkakapwa ay kasama ng propesyonal na pangangalaga sa kalusugan ng isip — hindi nito kapalit. Hindi therapist ang mga tagapagpadaloy, at dapat laging may malinaw na plano para maiugnay ang sinumang nasa krisis sa kwalipikadong propesyonal o emergency na tulong.",
    "setupHours": 21,
    "defaultCategory": "emotional_support",
    "firstSteps": "Ang unang mga kausap mo: ang mga posibleng tagapagpadaloy at ang mga lokal na tagapangalaga ng kalusugan ng isip — klinika, crisis line, o counselor na papayag maging daluyan ng referral bago pa man magtipon ang unang bilog. Huwag magbukas hangga’t hindi sanay ang mga tagapagpadaloy at kayang sabihin ng lahat nang tuwiran kung ano ang bilog at kung ano ang hindi.",
    "commonPitfalls": "Ang mapanganib na pagkabigo ay ang unti-unting paglihis: ang mainit na bilog ay dahan-dahang nagiging tanging sandalan ng isang tao, nagsisimulang gumanap na therapist ang mga tagapagpadaloy, at walang plano para sa gabing may nasa tunay na krisis. Ang mas tahimik na pagkabigo ay ang burnout ng tagapagpadaloy — kung walang sariling suporta ang mga humahawak ng espasyo, mabubuwag ang bilog sa loob ng isang taon.",
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
        "name": "Maghanap at magsanay ng mga tagapagpadaloy",
        "description": "Maghanap ng mga taong mainit at panatag ang loob, at ipatapos sa kanila ang pagsasanay sa peer support o aktibong pakikinig. Linawing magkakapwa silang humahawak ng espasyo, hindi doktor na nagdadayagnos o gumagamot.",
        "hours": 5,
        "skills": [
          "pagpapadaloy",
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Linawin ang saklaw at mga hangganan ng bilog",
        "description": "Itatag na damayan ito ng magkakapwa, hindi therapy o pangangalaga sa krisis. Isulat kung para saan ang bilog at kung ano ang labas sa papel nito, para malinaw sa lahat ang aasahan.",
        "hours": 3,
        "skills": [
          "pagsusulat"
        ]
      },
      {
        "name": "Bumuo ng plano sa referral kapag may krisis",
        "description": "Ihanda ang malinaw na mga hakbang kapag may nasa pighating lampas sa kaya ng damayan: paano siya marahang iuugnay sa propesyonal na tulong o crisis line, at kailan hihingi ng emergency na tulong. Panatilihing updated ang listahan ng mga lokal at pambansang matatawagan.",
        "hours": 3,
        "skills": [
          "pagsusulat"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Maghanap ng pribado at ligtas na espasyo",
        "description": "Maghanap ng tahimik, komportable, at kumpidensyal na silid kung saan malayang makapagsasalita ang mga tao. Ang pirmihang lugar ay tumutulong para panatag na bumalik ang mga tao.",
        "hours": 2,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Magtakda ng pagiging kumpidensyal at mga tuntunin ng bilog",
        "description": "Magkasundo: kumpidensyal, walang pagpapayo maliban kung hiningi, walang sabatan, at may karapatang mag-pass. Ibahagi ang mga ito sa simula ng bawat session.",
        "hours": 3,
        "skills": [
          "pagpapadaloy",
          "pagsusulat"
        ]
      },
      {
        "name": "Itakda at ipaalam ang mga session",
        "description": "Pumili ng pirmihang oras, panatilihing hindi masyadong marami ang kasali, at ipaalam ito sa paraang nagbabawas ng stigma. Linawing libre at bukas ito.",
        "hours": 3,
        "skills": [
          "pakikipag-ugnayan",
          "pag-aayos"
        ],
        "follows": [
          0,
          3
        ]
      },
      {
        "name": "Suportahan ang mga tagapagpadaloy at iwasan ang burnout",
        "description": "Magsagawa ng regular na kamustahan para makapag-debrief at makapagpahinga ang mga tagapagpadaloy. Magsalitan sa pangunguna, at tiyaking may sarili rin silang suporta.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "pagpapadaloy"
        ]
      }
    ]
  },
  {
    "id": "community-cleanup",
    "name": "Paglilinis ng komunidad at pagsasaayos ng luntiang espasyo",
    "purpose": "Linisin ang mga kalat, ayusin ang mga napabayaang lote at parke, at gumawa ng luntiang espasyong para sa lahat.",
    "whoItServes": "Ang buong kapitbahayan — kapaki-pakinabang sa lahat ang mas malinis, mas ligtas, at mas luntiang espasyo.",
    "whatYoullNeed": "Mga tutulong, mga gamit, pahintulot sa bawat lugar, at plano sa pagtatapon. May totoong panganib sa mga napabayaang lugar — huwag na huwag pupulutin nang kamay ang mga karayom o di-kilalang kemikal; gumamit ng mga kasangkapan at sharps container, at itapon ang mga mapanganib na napulot ayon sa mga lokal na patakaran.",
    "setupHours": 10,
    "defaultCategory": "infrastructure",
    "suggestsWorkDays": true,
    "firstSteps": "Ilibot ang kapitbahayan kasama ang mga nakatira pinakamalapit sa mga napabayaang lugar — alam nila kung aling lote ang mahalaga, kung kanino ito, at kung ano na ang nasubukan dati — at alamin kung may paglilinis nang pinapatakbo ang lungsod o isang grupo ng mga kaibigan ng parke na puwede mong salihan. Linawin muna ang may-ari, ang pahintulot, at kung saan pupunta ang basura bago pumili ng petsa.",
    "commonPitfalls": "Dalawa ang ikinabibigo ng paglilinis: umuupo nang ilang linggo sa gilid ng kalsada ang mga sako ng basura dahil walang naghanda ng hakot, at pagsapit ng ilang buwan, hanggang baywang na ulit ang damo sa lote dahil walang plano lampas sa isang malaking araw. At ang isang tutulong na dumampot ng karayom nang walang guwantes — mauuwi sa ospital ang isang magandang umaga.",
    "pairsWith": [
      "community-garden",
      "community-composting"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Tukuyin at unahin ang mga lugar",
        "description": "Ilibot ang lugar at ilista ang mga kailangang asikasuhin — mga kantong puno ng basura, damuhang lote, napabayaang parke. Unahin ayon sa epekto at kung gaano kadaling gawin.",
        "hours": 1.5,
        "skills": []
      },
      {
        "name": "Kunin ang mga pahintulot at plano sa pagtatapon",
        "description": "Alamin kung kanino ang bawat lugar at humingi ng pahintulot. Ihanda nang maaga ang hakot ng basura at eskombro — mag-ayos ng malaking basurahan o hakot ng lokal na pamahalaan para hindi magtambak ang mga sako.",
        "hours": 2,
        "skills": [
          "pakikipag-ugnayan",
          "papeles"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Ipunin ang mga gamit at pananggalang",
        "description": "Magtipon ng guwantes, sako, panipit, at high-visibility vest. Isama ang matibay na sharps container at plano para sa anumang mapanganib na mapupulot.",
        "hours": 1.5,
        "skills": [
          "pagmamaneho"
        ]
      },
      {
        "name": "Mag-imbita at mag-ayos ng mga tutulong",
        "description": "Ikalat ang balita at ilista ang mga sasali. Magtalaga ng mga lider ng team at mga sona para maging maayos ang araw, hindi magulo.",
        "hours": 2,
        "skills": [
          "pakikipag-ugnayan",
          "pag-aayos"
        ]
      },
      {
        "name": "Idaos ang araw ng bayanihan sa paglilinis",
        "description": "Idaos ang bayanihan, panatilihing ligtas at may tubig ang mga team, at ipagdiwang nang sama-sama ang kitang-kitang resulta. Kumuha ng litratong before-and-after para ganahan ang susunod na dadalo.",
        "hours": 3,
        "skills": [
          "pag-aayos",
          "pagkuha ng litrato"
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
    "name": "Libreng tulong sa pag-file ng buwis at clinic ng kaalaman sa pananalapi",
    "purpose": "Tulungan ang mga kapitbahay na maliit ang kita na mag-file ng buwis nang libre at makuha ang mga tax credit at refund na para sa kanila.",
    "whoItServes": "Mga manggagawang maliit ang kita, mga pamilyang puwede sa tax credit, mga nakatatanda, at mga estudyante.",
    "whatYoullNeed": "Mga sinanay at sertipikadong preparer, isang espasyo, mga computer, at sistema ng appointment. Ang mga tax return ay dapat ihanda ng mga sertipikadong tutulong sa ilalim ng kinikilalang programa — tumutulong ang clinic na ito sa mga karaniwang filing, hindi sa mga komplikadong sitwasyong nangangailangan ng propesyonal sa buwis.",
    "setupHours": 28,
    "defaultCategory": "skilled_labor",
    "suggestsWorkDays": true,
    "firstSteps": "Ang unang tawag mo ay sa isang matatag na programa ng libreng pag-file tulad ng VITA — kausapin ang coordinator nila tungkol sa iskedyul ng sertipikasyon, sa software, at sa kailangan ng bagong site, dahil hindi ito dapat mag-isang patakbuhin. Pagkatapos, kausapin ang mga kapitbahay na nais mong abutin kung kailan sila talagang makakapunta at kung ano ang pumigil sa kanilang mag-file noon.",
    "commonPitfalls": "Isang maling return ang puwedeng pumigil sa refund ng isang pamilya o umakit ng audit — kaya ang paghahanda ng buwis ng mga hindi sertipikado ang linyang hinding-hindi dapat lampasan ng proyektong ito. Ang mga mas magaan na pagkabigo: paglulunsad sa Marso gayong inaabot ng ilang buwan ang sertipikasyon, at ang taong sumakay pa ng bus para lang tanggihan dahil sa dokumentong walang nagsabing dalhin.",
    "pairsWith": [
      "legal-aid-clinic",
      "solidarity-fund"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Ipasanay at ipasertipika ang mga preparer",
        "description": "Ipatapos sa mga tutulong ang kinikilalang sertipikasyon sa libreng paghahanda ng buwis (tulad ng programang VITA ng IRS) para tama at may wastong pahintulot ang mga return. Hindi ito puwedeng tawaran.",
        "hours": 10,
        "recurringCadence": "cycle",
        "skills": [
          "pagtutuos"
        ]
      },
      {
        "name": "Makipag-partner sa kinikilalang programa ng libreng pag-file",
        "description": "Sumailalim sa isang matatag na programa para sa software, suporta, at tiwala ng publiko. Sila ang magbibigay ng mga kasangkapan sa pag-file at pagsusuri ng kalidad na hindi mo dapat mag-isang buuin.",
        "hours": 4,
        "skills": [
          "pakikipag-ugnayan",
          "papeles"
        ]
      },
      {
        "name": "Maghanda ng espasyo at kagamitan",
        "description": "Maghanap ng lugar na may mga computer, maaasahang internet, at sapat na privacy para komportableng maibahagi ng mga tao ang sensitibong impormasyon sa pananalapi.",
        "hours": 3,
        "skills": [
          "tulong sa tech"
        ]
      },
      {
        "name": "Buuin ang sistema ng appointment at pagtanggap",
        "description": "Gumawa ng mga appointment at malinaw na checklist ng mga dokumentong dapat dalhin (ID, patunay ng kita, nakaraang return). Iniiwasan nito ang sayang na byahe at mahabang pila.",
        "hours": 3,
        "skills": [
          "pag-aayos",
          "pagtatala"
        ]
      },
      {
        "name": "Ipaalam sa mga kapitbahay na puwede",
        "description": "Ikalat ang balita, at idiin na ang pag-file ay puwedeng magbukas ng mga refund at tax credit na madalas napapalampas. Abutin ang mga manggagawa, pamilya, at nakatatandang kadalasang kuwalipikado.",
        "hours": 3,
        "recurringCadence": "cycle",
        "skills": [
          "pakikipag-ugnayan",
          "pagdidisenyo"
        ],
        "follows": [
          3
        ]
      },
      {
        "name": "Siguraduhin ang seguridad at privacy ng datos",
        "description": "Ingatan ang bawat piraso ng personal at pinansyal na datos: mga secure na device, walang sobrang kopya, nakakandadong imbakan, at malinaw na patakaran sa pag-iingat at pagsira.",
        "hours": 3,
        "skills": [
          "tulong sa tech"
        ]
      },
      {
        "name": "Mag-alok ng follow-up sa kaalaman sa pananalapi",
        "description": "Kung gusto nila, ikonekta ang mga tao sa tulong sa pagbabadyet, ligtas na pagbabangko, at pagsusuri ng mga benepisyo ng gobyerno. Panatilihin itong opsyonal at ituro sa mga kuwalipikadong propesyonal ang mga komplikadong sitwasyon.",
        "hours": 2,
        "skills": [
          "pagtutuos"
        ]
      }
    ]
  },
  {
    "id": "community-market",
    "name": "Palengke ng komunidad / libreng puwesto ng ani",
    "purpose": "Magpatakbo ng regular na puwesto — libre o magbigay-kung-kaya — na namamahagi ng sariwang ani at pangunahing pagkain.",
    "whoItServes": "Mga kapitbahay na kapos sa pagkain at mga taong nasa lugar na walang abot-kayang sariwang pagkain.",
    "whatYoullNeed": "Pagkukunan ng ani, isang puwesto o lokasyon, mga tutulong, at regular na iskedyul.",
    "setupHours": 15,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Simulan sa mga usapan tungkol sa suplay — bisitahin ang mga sakahan, tindahan, at hardin ng komunidad para malaman kung anong sobra talaga ang mayroon at sa anong ritmo — at kausapin ang mga kapitbahay sa lugar na balak mong abutin kung saan sila talaga dumadaan at anong pagkain ang talagang iuuwi nila. Piliin ang puwesto kasama ang mga taong gagamit nito, hindi para sa kanila.",
    "commonPitfalls": "Ang puwestong paminsan-minsan lang sumusulpot ay nagtuturo sa mga taong huwag nang umasa — mas mahalaga ang pagiging pare-pareho kaysa dami. Ang iba pang pagkabigo: suplay na natutuyo pagkatapos ng masiglang unang buwan, at kahit anong nasa mesa (mga form, tanong, pag-uuri ng tao) na nagpaparamdam na parang nag-aaplay ang kumukuha ng pagkain.",
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
        "name": "Siguraduhin ang suplay ng ani at pagkain",
        "description": "Kumuha ng pagkain sa pamumulot ng natirang ani, mga hardin ng komunidad, donasyon ng sakahan at tindahan, at maramihang pagbili. Hangaring iba-iba at maaasahan para hindi hubad ang puwesto.",
        "hours": 3,
        "skills": [
          "pakikipag-ugnayan",
          "pagmamaneho"
        ]
      },
      {
        "name": "Maghanap ng lokasyon at ihanda ang puwesto",
        "description": "Pumili ng kita at madaling puntahang lugar na may pahintulot — gilid ng parke, paradahan, o sakayan. Mag-ayos ng mga mesa, lilim, at karatula.",
        "hours": 2,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Pagpasyahan ang modelo",
        "description": "Piliin kung lahat libre, magbigay-kung-kaya, o halo. Anuman ang piliin, siguraduhing walang sinumang tatanggihan dahil wala siyang maibibigay.",
        "hours": 1,
        "skills": [
          "pagpapadaloy"
        ]
      },
      {
        "name": "Ihanda ang pagtatanghal, imbakan, at kaligtasan ng pagkain",
        "description": "Panatilihing malamig at maayos tingnan ang ani, hawakan nang ligtas ang pagkain, at magdala ng cooler o lilim sa mainit na araw. Itapon ang anumang sira na.",
        "hours": 2,
        "skills": [
          "kaligtasan ng pagkain"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Mag-imbita at mag-iskedyul ng mga tutulong",
        "description": "Maghanda ng mga tao para sa pagsundo ng ani, pag-set up, pagbabantay ng puwesto, at pag-iimpake. Bigyan ng malinaw na papel ang bawat isa kada palengke.",
        "hours": 2,
        "skills": [
          "pag-aayos",
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Ikalat ang balita at magtakda ng regular na iskedyul",
        "description": "Pumili ng pare-parehong araw at oras at ipaalam ito nang malawakan. Ang pagiging maaasahan ang gumagawa sa puwesto na tunay na masasandalan.",
        "hours": 2,
        "skills": [
          "pakikipag-ugnayan",
          "pagdidisenyo"
        ],
        "follows": [
          1,
          2
        ]
      },
      {
        "name": "Patakbuhin ang puwesto at asikasuhin ang matitira",
        "description": "Mag-set up, mamahagi nang mainit at walang panghuhusga, at ihatid ang anumang natirang ani sa mga fridge, pantry, o programa ng pagkain para walang masayang.",
        "hours": 3,
        "skills": [
          "pag-aayos"
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
    "name": "Maligayang pagsalubong: suporta sa bagong kapitbahay at bagong magulang",
    "purpose": "Salubungin ang mga bagong lipat at bagong magulang ng praktikal na tulong, lokal na impormasyon, at tunay na pagtanggap sa komunidad.",
    "whoItServes": "Mga kalilipat lang, mga bago at magiging magulang, at sinumang nangangailangan ng magiliw na simula.",
    "whatYoullNeed": "Mga tutulong, mga packet ng impormasyon, mga donasyong pansalubong, at paraan ng pag-uugnay ng mga tao sa inyo.",
    "setupHours": 10,
    "defaultCategory": "emotional_support",
    "firstSteps": "Kausapin muna ang mga nakakasalubong ng mga bagong lipat bago pa kayo — mga nagpapaupa, opisina ng mga paaralan, clinic, komadrona at nurse ng mga bata — kung paano nila maituturo ang isang tao nang may pahintulot. Pagkatapos, tanungin ang ilang bagong salta at bagong magulang kung ano sana ang talagang nakatulong sa unang buwan nila, at ibatay sa mga sagot nila ang packet at ang basket.",
    "commonPitfalls": "Ang ikinasisira nito ay ang pakiramdam na binabantayan — ang pagsulpot nang hindi inimbitahan sa pinto ng estranghero, o ang pagpapasa ng pangalan nang walang pahintulot, ay ginagawang panghihimasok ang pagsalubong. Tahimik din itong naglalaho kapag napagod ang mga unang tagapagsalubong at ilang buwan nang walang nakakapansin sa mga bagong lipat.",
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
        "name": "Pagpasyahan kung sino ang sasalubungin at paano",
        "description": "Linawin ang pagtutuunan — mga bagong lipat, mga bagong magulang, o pareho — at ang anyo ng pagsalubong (isang dalaw, isang basket, isang tawag). Panatilihin itong kusang pagpili at hinding-hindi panghihimasok.",
        "hours": 1,
        "skills": [
          "pagpapadaloy"
        ]
      },
      {
        "name": "Buuin ang packet ng lokal na impormasyon",
        "description": "Ipunin sa isang malinaw na gabay ang mga lokal na tulong, transportasyon, paaralan, pangangalagang pangkalusugan, at ang tulungan ng komunidad mo. Ialok ito sa mga wikang sinasalita sa inyong lugar.",
        "hours": 3,
        "skills": [
          "pagsusulat",
          "pagsasalin"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Buuin ang mga basket na pansalubong",
        "description": "Pagsama-samahin ang mga kapaki-pakinabang na gamit — pangunahing pagkain, gamit sa bahay, at para sa mga bagong magulang, ilang gamit ng sanggol o lutong-bahay na ulam. Kunin ang mga ito sa donasyon.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "pakikipag-ugnayan",
          "pag-aayos"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Mag-imbita at magsanay ng mga tagapagsalubong",
        "description": "Maghanap ng mga magiliw na tutulong at turuan silang maging mainit at magalang, bumasa kung gusto ng tao ang koneksyon, at hinding-hindi mamilit o mang-usisa.",
        "hours": 2,
        "skills": [
          "pakikipag-ugnayan",
          "pagtuturo"
        ]
      },
      {
        "name": "Buuin ang paraan ng pagtuturo at pagsali",
        "description": "Gumawa ng mga simpleng paraan para maituro ang isang tao o kusa siyang sumali — sa pamamagitan ng nagpapaupa, clinic, paaralan, o isang form. Igalang ang privacy sa lahat ng hakbang.",
        "hours": 2,
        "skills": [
          "pag-aayos",
          "pagtatala"
        ],
        "follows": [
          0
        ]
      }
    ]
  },
  {
    "id": "library-of-things",
    "name": "Aklatan ng mga gamit",
    "purpose": "Magpahiram ng mga gamit sa bahay at sa mga pagtitipon na bihirang kailangang sariling ariin — gamit sa kusina, pang-handaan at pang-camping, gamit ng sanggol, projector, at iba pa.",
    "whoItServes": "Kahit sino; nakakatipid ito ng pera, nakakabawas ng kalat, at nakakabawas ng basura.",
    "whatYoullNeed": "Imbakan, mga donasyong gamit, catalog at sistema ng paghiram, at isa o dalawang librarian.",
    "setupHours": 21,
    "defaultCategory": "infrastructure",
    "firstSteps": "Bago magtipon ng kahit isang gamit, tanungin ang mga miyembro kung ano talaga ang hihiramin nila — ang survey na iyon ang pundasyon ng proyekto — at kausapin ang pampublikong library o community center tungkol sa pagpapatuloy, dahil sabay na nalulutas ng isang pinagkakatiwalaang institusyon ang problema mo sa imbakan at sa tiwala. Hanapin ang dalawang librarian bago dumating ang mga donasyon, hindi pagkatapos.",
    "commonPitfalls": "Namamatay sa kalat ang mga aklatan ng gamit: ang pag-oo sa bawat donasyon ay pumupuno sa kuwarto ng mga sirang breadmaker na walang may gusto, habang wala pa rin ang pressure washer na hiniling ng lahat. Ang isa pang pumapatay ay ang pabago-bagong oras — kapag hindi maasahan ng mga tao kung kailan kukuha at magsasauli, tahimik silang babalik sa pagbili.",
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
        "name": "Alamin sa survey kung ano ang gustong hiramin",
        "description": "Tanungin ang mga miyembro kung ano ang gagamitin nila pero ayaw bilhin — mga natitiklop na mesa, punch bowl, tent, panlinis ng carpet, stroller. Ang mga sagot ang magtatakda ng panimulang imbentaryo.",
        "hours": 2,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Maghanap ng imbakan at magtakda ng oras",
        "description": "Maghanap ng aparador, kuwarto, o container na paglalagyan ng mga gamit, at magtakda ng maaasahang oras ng pagkuha at pagsasauli para madali ang paghiram.",
        "hours": 3,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Tipunin, linisin, at subukan ang mga gamit",
        "description": "Magtipon ng mga donasyon, saka linisin, subukan, at suriin ang kaligtasan ng bawat isa. Ibukod ang anumang sira, na-recall, o hindi malinis.",
        "hours": 5,
        "skills": [
          "pagmamaneho"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "I-catalog at kunan ng litrato ang imbentaryo",
        "description": "Itala ang bawat gamit na may litrato at kondisyon nito sa spreadsheet o lending app. Numeruhan ang mga gamit para madaling subaybayan ang labas-pasok.",
        "hours": 4,
        "skills": [
          "pagtatala",
          "pagkuha ng litrato"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Isulat ang mga patakaran sa paghiram na may tiwala",
        "description": "Itakda ang haba ng hiram, limitasyon sa dami, at maluwag na patakaran sa pagsasauli. Ibatay ito sa tiwala, hindi sa multa, at itala ang mga gamit na kailangan ng dagdag na ingat o paglilinis.",
        "hours": 2,
        "skills": [
          "pagsusulat"
        ]
      },
      {
        "name": "Ihanda ang paghiram at sanayin ang mga librarian",
        "description": "Gumawa ng simpleng talaan ng paghiram (pangalan, contact, gamit, petsa ng sauli) na may mabilis na litrato ng kondisyon. Ituro sa mga tutulong ang catalog at ang proseso.",
        "hours": 3,
        "skills": [
          "pagtatala",
          "pagtuturo"
        ],
        "follows": [
          3,
          4
        ]
      },
      {
        "name": "Alagaan, linisin, at palaguin ang koleksyon",
        "description": "Linisin at suriin ang mga naisauling gamit, kumpunihin ang kaya, at idagdag ang mga pinakahinihiling sa paglipas ng panahon.",
        "hours": 2,
        "skills": [
          "pagkukumpuni"
        ],
        "recurringCadence": "session"
      }
    ]
  },
  {
    "id": "laundry-shower-access",
    "name": "Programa ng access sa labahan at paliguan",
    "purpose": "Magbigay ng libreng access sa labahan at paliguan para manatiling malinis ang mga tao nang may dignidad.",
    "whoItServes": "Mga kapitbahay na walang tirahan, mga taong sira ang mga pasilidad sa bahay, at mga pamilyang maliit ang kita.",
    "whatYoullNeed": "Access sa mga makina at paliguan (isang partner na lugar o mobile unit), mga gamit, at mga tutulong. Nauuna ang dignidad at privacy ng mga bisita — huwag humingi ng anumang personal na impormasyon para makagamit, panatilihing pribado at ligtas ang mga paliguan, at sundin ang mga lokal na patakarang pangkalusugan para sa mga pinagsasaluhan o mobile na pasilidad.",
    "setupHours": 19,
    "defaultCategory": "infrastructure",
    "suggestsWorkDays": true,
    "firstSteps": "Magsimula sa dalawang uri ng usapan: sa mga kapitbahay na walang tirahan at sa mga outreach worker na kilala sila, tungkol sa kung anong oras at lugar ang talagang papasok — at sa may-ari ng laundry shop, gym, o simbahan tungkol sa pagpapatuloy. Maselan ang usapan sa host; maging tapat kung sino ang darating at ayusin ang mga inaasahan sa privacy, paglilinis, at iskedyul bago dumating ang unang bisita.",
    "commonPitfalls": "Namamatay ang programang ito kapag sumama ang relasyon sa host — isang masamang pangyayaring walang protocol sa likod, at wala na ang espasyo — o kapag palipat-lipat ang oras kaya tumatawid ng bayan ang mga tao para lang sa nakakandadong pinto. At bawat papeles na hihingin mo sa pintuan ay nagpapaalis ng taong mas kailangan ang paliguan kaysa kailangan mo ang pangalan niya.",
    "pairsWith": [
      "free-haircut",
      "cooling-warming-center",
      "diaper-hygiene-bank"
    ],
    "tasks": [
      {
        "name": "Siguraduhin ang access sa labahan at paliguan",
        "description": "Makipag-partner sa laundry shop, gym, simbahan, recreation center, o mag-ayos ng mobile unit. Kumpirmahin ang maaasahang oras at na may privacy ang espasyo.",
        "hours": 4,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Tipunin ang mga gamit",
        "description": "Magtipon ng sabong panlaba, malilinis na tuwalya, sabon, shampoo, at iba pang pampaligo sa pamamagitan ng donasyon o maliit na badyet. Isama ang ilang malinis na damit kung kaya.",
        "hours": 3,
        "skills": [
          "pakikipag-ugnayan",
          "pagmamaneho"
        ]
      },
      {
        "name": "Buuin ang listahan at oras-oras na iskedyul",
        "description": "Gumawa ng patas na paraan ng pagkuha ng labada at oras sa paliguan para makatwiran ang paghihintay at may pagkakataon ang lahat.",
        "hours": 3,
        "skills": [
          "pag-aayos",
          "pagtatala"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Itatag ang mga protocol sa kalinisan at kaligtasan",
        "description": "Magtakda ng ruta ng paglilinis sa pagitan ng bawat bisita, tiyaking pribado at ligtas ang mga paliguan, at ingatan ang dignidad at kaligtasan ng lahat sa buong proseso.",
        "hours": 3,
        "skills": [
          "pagsusulat"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Mag-imbita at magsanay ng mga tutulong",
        "description": "Maghanap ng mga tutulong sa pagtanggap, pag-aasikaso ng mga gamit, at paglilinis sa pagitan ng gamitan. Sanayin silang tratuhin nang mainit at may respeto ang bawat bisita.",
        "hours": 3,
        "skills": [
          "pakikipag-ugnayan",
          "pagtuturo"
        ],
        "follows": [
          3
        ]
      },
      {
        "name": "Magtakda ng iskedyul at ikalat ang balita",
        "description": "Pumili ng pare-parehong oras at ipaalam sa mga outreach worker, shelter, at mga kapitbahay sa lansangan kung kailan at saan ito bukas.",
        "hours": 3,
        "skills": [
          "pakikipag-ugnayan"
        ],
        "follows": [
          0
        ]
      }
    ]
  },
  {
    "id": "voter-registration",
    "name": "Kampanya sa pagpapalista ng mga botante at paglahok sa halalan",
    "purpose": "Tulungan ang mga tao na maipalista bilang botante at makilahok sa halalan at mga lokal na desisyon — mahigpit na walang pinapanigang partido.",
    "whoItServes": "Mga kuwalipikadong nakatira sa lugar, lalo na ang mga matagal nang hindi gaanong naririnig sa presinto.",
    "whatYoullNeed": "Mga sinanay na tutulong, mga materyales sa pagpapalista, tumpak na mga patakaran, at magagandang lokasyon. Panatilihing mahigpit na walang pinapanigang partido ang kampanya at sundin nang eksakto ang lahat ng batas sa halalan at pagpapalista — magbigay lamang ng tumpak na impormasyon at huwag kailanman mangampanya para sa partido o kandidato.",
    "setupHours": 16,
    "defaultCategory": "organizing",
    "firstSteps": "Bago maglatag ng mesa ang sinuman, kausapin ang lokal na tanggapan ng halalan — sasabihin nila nang eksakto kung ano ang puwede at hindi puwede sa mga ganitong kampanya, at may mga lugar na nag-aatas muna ng pagsasanay o pagpapatala. Pagkatapos, kumonekta sa League of Women Voters o ibang matatag na grupong walang pinapanigang partido; mas mabuting hiramin ang mga materyales at karanasan nila kaysa matutuhan ang batas sa halalan sa pamamagitan ng pagkakamali.",
    "commonPitfalls": "Ang mga hindi mapapatawad na pagkabigo ay legal: ang tambak ng mga tapos nang form na nakalimutan sa sasakyan lampas sa deadline ay nag-aalis ng boto sa bawat taong nagtiwala sa iyo, at ang isang tutulong na nagbubuhat ng kandidato ay puwedeng dumungis sa buong kampanya. Ang mas tahimik na palya: pamimigay ng mga form nang hindi man lang binabanggit kung saan o paano talaga boboto.",
    "pairsWith": [
      "newcomer-translation-network",
      "legal-aid-clinic"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Alamin ang mga patakaran sa pagpapalista ng botante",
        "description": "Saliksikin ang mga batas ng inyong lugar sa pagpapalista ng mga botante: mga deadline, ano ang puwede at hindi puwede sa mga tutulong, paano dapat hawakan ang mga form, at mga kailangang ID. Mahalagang sundin ang mga ito nang eksakto.",
        "hours": 3,
        "skills": [
          "papeles"
        ]
      },
      {
        "name": "Magsanay ng mga tutulong na walang pinapanigan",
        "description": "Turuan ang mga tutulong na tulungan ang lahat na maipalista anuman ang paniniwala, at huwag kailanman magbuhat ng partido o kandidato. Ang pagiging walang pinapanigan ang nag-iingat sa kampanya at sa tiwala ng komunidad.",
        "hours": 3,
        "skills": [
          "pagtuturo"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Tipunin ang mga materyales at tumpak na impormasyon",
        "description": "Magtipon ng mga form ng pagpapalista at napatunayang napapanahong impormasyon sa mga deadline, patakaran sa ID, presinto, at pagboto sa koreo. Mas nakakasama ang maling impormasyon kaysa wala.",
        "hours": 2,
        "skills": [
          "pagsusulat"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Pumili ng mga mataong lokasyon at pagtitipon",
        "description": "Maglatag kung saan na nagtitipon ang mga kuwalipikado — palengke, sakayan, campus, mga pagtitipon ng komunidad — nang may kailangang pahintulot sa paglalatag ng mesa.",
        "hours": 2,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Patakbuhin ang mesa ng pagpapalista",
        "description": "Bantayan ang mesa, tulungan ang mga tao na maipalista nang tama, at isumite agad ang mga form sa loob ng legal na deadline. Panatilihing mainit at nagbibigay-alam ang tono.",
        "hours": 4,
        "skills": [
          "pakikipag-ugnayan"
        ],
        "follows": [
          1,
          2,
          3
        ],
        "recurringCadence": "event"
      },
      {
        "name": "Tumulong sa mga susunod na hakbang",
        "description": "Lampas sa pagpapalista, tulungan ang mga tao na malaman kung paano, kailan, at saan boboto, kasama ang pagboto sa koreo at hatid papunta sa presinto. Ang pagpapalista lang ay hindi pa paglahok.",
        "hours": 2,
        "skills": [
          "pakikipag-ugnayan"
        ]
      }
    ]
  },
  {
    "id": "health-navigation",
    "name": "Programa ng paggabay sa kalusugan ng komunidad",
    "purpose": "Tulungan ang mga kapitbahay na mahanap at maabot ang pangangalagang pangkalusugan — mga clinic, insurance, reseta, at appointment.",
    "whoItServes": "Mga walang insurance o kulang ang insurance, mga nakatatanda, mga bagong salta, at sinumang naliligaw sa sistema ng kalusugan.",
    "whatYoullNeed": "Mga sinanay na gabay, isang direktoryo ng mga tulong, mga partner na provider, at sistema ng paghingi. Nag-uugnay ang mga gabay ng tao sa pangangalaga — hindi sila nagbibigay ng payong medikal o diagnosis. Ituro sa mga kuwalipikadong propesyonal sa kalusugan ang lahat ng klinikal na tanong.",
    "setupHours": 26,
    "defaultCategory": "other",
    "firstSteps": "Magsimula sa pagbisita sa mga libre at abot-kayang clinic na pagtuturuan mo ng mga tao — magpakilala, itanong kung aling mga ipinadalang tao ang nakakatulong sa kanila at alin ang lumulunod, at hayaang ang mga usapang iyon ang magpasimula ng direktoryo. Linawin ang hangganan bago dumating ang unang hiling: mga logistics at papeles ang sakop ng mga gabay, bawat klinikal na tanong ay sa propesyonal, kaya alamin nang eksakto kung aling hotline ng nurse o clinic ang pagdadalhan ng mga iyon.",
    "commonPitfalls": "Ang matalim na gilid ay ang mabait na gabay na nadudulas sa payong medikal — ang isang kaswal na “mukhang hindi naman malala iyan” ay puwedeng magnakaw sa isang tao ng mga linggo ng kailangang pangangalaga. Nabibigo rin ito kapag tahimik na lumalaos ang direktoryo, na nagpapadala ng tao sa mga clinic na sarado na o programang tapos na; ang isang maling numero ay pagkatalo sa taong nasa huling subok na niya.",
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
        "name": "Buuin ang direktoryo ng mga tulong sa kalusugan",
        "description": "Ipunin ang mga libre at murang clinic, mga provider na inaayon sa kita ang halaga, mga programa ng tulong sa reseta, mga opsyon sa ngipin at mata, at mga tulong sa kalusugan ng isip. Panatilihin itong napapanahon.",
        "hours": 6,
        "skills": [
          "pagtatala",
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Mag-imbita at magsanay ng mga gabay",
        "description": "Maghanap ng mga tutulong at sanayin silang mag-ugnay ng tao sa pangangalaga — hindi magbigay ng payong medikal. Ang gawain nila ay paggabay at logistics, at sa mga propesyonal itinuturo ang mga klinikal na tanong.",
        "hours": 5,
        "skills": [
          "pakikipag-ugnayan",
          "pagtuturo"
        ]
      },
      {
        "name": "Buuin ang sistema ng paghingi at pagtanggap",
        "description": "Gumawa ng pribado at madaling paraan para makahingi ng tulong ang mga tao at mailarawan ang sitwasyon nila, na may opsyon sa telepono at personal, hindi lang online.",
        "hours": 3,
        "skills": [
          "pag-aayos"
        ]
      },
      {
        "name": "Tumulong sa insurance at pag-a-apply",
        "description": "Samahan ang mga tao sa pag-unawa at pag-apply sa coverage na karapat-dapat sa kanila (tulad ng Medicaid o mga planong may suporta ng gobyerno) at sa pagtitipon ng mga kailangang dokumento.",
        "hours": 4,
        "recurringCadence": "month",
        "skills": [
          "papeles"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Mag-alok ng tulong sa appointment at reseta",
        "description": "Tumulong sa pag-iskedyul ng appointment, paglalagay ng paalala, pagharap sa halaga ng mga gamot, at pag-ugnay sa programa ng hatid-sundo para sa byahe papunta sa pangangalaga.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "pag-aayos"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Magtakda ng mga gawi sa privacy ng impormasyong pangkalusugan",
        "description": "Ituring na sukdulang sensitibo ang lahat ng detalye ng kalusugan: kunin ang pinakakaunti, itago nang ligtas, at huwag kailanman ibahagi nang walang pahintulot. Sanayin ang mga gabay sa pagiging kompidensyal.",
        "hours": 2,
        "skills": [
          "pagsusulat"
        ]
      },
      {
        "name": "Makipag-partner sa mga clinic at provider",
        "description": "Magtayo ng relasyon sa mga lokal na clinic at provider para mas madulas ang pagtuturo ng tao at para mabalitaan ang mga bagong murang tulong sa sandaling magbukas ang mga ito.",
        "hours": 3,
        "skills": [
          "pakikipag-ugnayan"
        ]
      }
    ]
  },
  {
    "id": "toy-library",
    "name": "Aklatan ng laruan & pagpapahiram ng gamit panlaro",
    "purpose": "Magpahiram ng mga laruan, board game, at gamit panlaro para may iba't ibang mapagpipilian ang mga pamilya nang hindi kailangang bumili.",
    "whoItServes": "Mga pamilyang may maliliit na anak, lalo na ang may limitadong badyet; nakakabawas din ito ng basura at kalat.",
    "whatYoullNeed": "Paglalagyan, mga donasyong laruan, talaan at sistema ng paghiram, panlinis, at mga librarian.",
    "setupHours": 10,
    "defaultCategory": "childcare",
    "firstSteps": "Kausapin ang mga pamilyang nais mong tulungan — sa sundo sa daycare, sa storytime, sa playgroup — tungkol sa kung aling mga laruan ang mabilis na nalalampasan ng kanilang mga anak at kung anong oras talaga sila makakapunta, saka magtanong sa community center, simbahan, o library tungkol sa isang estante o kuwarto. Maghanap ng isang tutulong na sanay sa pag-aalaga ng bata na siyang bahala sa pagsusuri ng kaligtasan bago pa dumating ang mga donasyon.",
    "commonPitfalls": "Sa kaligtasan at sa mga piraso bumabagsak ang mga aklatan ng laruan: isang na-recall na laruan o panganib na mabulunan na nakalusot, tuluyan nang masisira ang tiwala ng mga pamilya; at ang mga puzzle na ibinabalik nang may kulang na piraso, ilang buwan lang at parang basura na ang tingin sa buong koleksyon. Mahigpit na pagsusuri at binilang na mga bag — iyan ang buong laro.",
    "pairsWith": [
      "library-of-things",
      "childcare-collective",
      "school-supply-program"
    ],
    "tasks": [
      {
        "name": "Maghanap ng paglalagyan at itakda ang oras",
        "description": "Kumuha ng estante sa community center, library, o pinagsasaluhang espasyo, at magtakda ng regular na oras ng kuha at balik na maipaplano ng mga pamilya.",
        "hours": 1.5,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Tipunin, linisin, at suriin ang mga laruan",
        "description": "Tipunin ang mga donasyon, saka linisin at suriin ang bawat laruan. Tingnan kung may recall, sirang bahagi, o panganib na mabulunan, at ibukod ang anumang hindi ligtas para sa maliliit na bata.",
        "hours": 3.5,
        "skills": [
          "pagmamaneho",
          "pag-aalaga ng bata"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Itala at isilid sa bag nang kumpleto",
        "description": "Itala ang bawat laruan na may litrato at angkop na edad, at isilid sa bag ang mga set na maraming piraso na may bilang para walang mawawala. Numerohan ang mga gamit para madaling subaybayan.",
        "hours": 2,
        "skills": [
          "pagtatala",
          "pagkuha ng litrato"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Isulat ang mga patakaran sa paghiram",
        "description": "Itakda kung gaano katagal ang hiram, ilang laruan nang sabay-sabay, at isang mahinahong patakaran sa pagbabalik at nawawalang piraso. Panatilihin itong nakabatay sa tiwala at maunawain.",
        "hours": 1,
        "skills": [
          "pagsusulat"
        ]
      },
      {
        "name": "Ihanda ang paghiram at sanayin ang mga librarian",
        "description": "Gumawa ng simpleng talaan ng paghiram (pangalan, contact, gamit, petsa ng pagbabalik) at ituro sa mga tutulong ang catalog, ang paglilinis, at ang mga patakaran.",
        "hours": 2,
        "skills": [
          "pagtatala",
          "pagtuturo"
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
    "name": "Kolektibo sa pagpepreserba & pagbobote ng pagkain",
    "purpose": "Magturo at magsagawa ng sama-samang pagbobote at pagpepreserba para tumagal ang sobra ng anihan at mas kaunti ang nasasayang na pagkain.",
    "whoItServes": "Mga naghahalaman, mga namumulot ng natirang ani, at mga pamilyang gustong pagkasyahin ang pagkain sa buong taon.",
    "whatYoullNeed": "Kusina, kagamitan sa pagbobote at pagpepreserba, mga lider na may alam, at ani. May totoong panganib sa kaligtasan ng pagkain ang pagpepreserba sa bahay, kasama ang botulism, kapag mali ang pagkakagawa — sundin lagi ang napapanahon at nasubok na gabay mula sa mapagkakatiwalaang pinagmulan at huwag kailanman mag-imbento ng oras o paraan ng pagproseso.",
    "setupHours": 18,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Hanapin muna ang kaalaman bago ang kusina: tawagan ang lokal na tanggapan ng agrikultura o isang sertipikadong eksperto sa pagpepreserba ng pagkain at hilingin na sanayin ang mga lider mo o suriin ang plano mo, at kausapin ang mga naghahalaman at namumulot ng natirang ani kung aling sobra talaga ang sabay-sabay na hinog at kailan. I-book ang kusina ayon sa kalendaryo ng anihan, hindi baligtad.",
    "commonPitfalls": "Hindi nakikita ang pinakamahalagang kabiguan: ang garapong isinara gamit ang imbentong paraan o hindi nasubok na recipe ng lola ay maaaring may dalang botulism at mukhang ayos na ayos sa estante. Ang karaniwang kabiguan ay ang timing — hinog ang mga kamatis sa sarili nilang iskedyul, at ang kolektibong nagdaos ng unang session matapos na ang anihan ay wala nang mapepreserba.",
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
        "name": "Maghanap ng angkop na kusina",
        "description": "Maghanap ng kusinang may kalan, espasyo sa mesa, at tubig para sa pagproseso at paglilinis. Bagay ang bulwagan ng simbahan, community center, o komersyal na kusina.",
        "hours": 2,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Pag-aralan ang ligtas na pagpepreserba",
        "description": "Ipag-aral sa mga lider mo ang mga nasubok at batay-sa-pananaliksik na paraan mula sa kinikilalang pinagmulan (tulad ng tanggapang pang-agrikultura ng unibersidad). Maaaring magdulot ng malubhang sakit ang maling pagbobote, kaya sundin nang eksakto ang mga nasubok na recipe at oras ng pagproseso.",
        "hours": 4,
        "skills": [
          "kaligtasan ng pagkain",
          "pagluluto"
        ]
      },
      {
        "name": "Tipunin ang kagamitan at garapon",
        "description": "Mangalap ng water-bath at/o pressure canner, garapon, takip, at kasangkapan sa pamamagitan ng donasyon o maliit na badyet. Tiyaking ligtas at gumagana ang mga pressure canner.",
        "hours": 3,
        "skills": [
          "pakikipag-ugnayan",
          "pagmamaneho"
        ]
      },
      {
        "name": "Maghanap ng ani",
        "description": "Magdala ng sobra ng anihan mula sa pamumulot ng natirang ani, halamanan, bukid, o pakyawang bili. Itapat ang mga session sa panahong sagana at mura ang ani.",
        "hours": 2,
        "recurringCadence": "cycle",
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Planuhin ang sama-samang session",
        "description": "Pumili ng mga recipe na bagay sa ani at sa antas ng mga kasali, at ayusin ang mga istasyon para ligtas at tuloy-tuloy ang daloy ng gawain.",
        "hours": 2,
        "recurringCadence": "session",
        "skills": [
          "pagluluto",
          "pag-aayos"
        ],
        "follows": [
          1,
          3
        ]
      },
      {
        "name": "Ituro at patakbuhin nang ligtas ang session",
        "description": "Pangunahan ang buong proseso, ipatupad ang ligtas na paghawak, tamang oras ng pagproseso, at maayos na pagsasara ng garapon. Gawin itong pagtuturo para kumalat ang kaalaman.",
        "hours": 4,
        "skills": [
          "pagluluto",
          "pagtuturo"
        ],
        "follows": [
          0,
          2,
          4
        ],
        "recurringCadence": "session"
      },
      {
        "name": "Hatiin ang napreserba at itala",
        "description": "Hatiin ang mga napreserbang pagkain sa mga kasali at sa mga proyektong tulad ng refrigerator o pantry ng komunidad. Lagyan ng label ang bawat garapon ng laman at petsa, at itala kung ano ang gumana para sa susunod.",
        "hours": 1,
        "recurringCadence": "session",
        "skills": [
          "pag-aayos"
        ],
        "follows": [
          5
        ]
      }
    ]
  },
  {
    "id": "free-haircut",
    "name": "Mga araw ng libreng gupit & pag-aayos ng sarili",
    "purpose": "Mag-alok ng libreng gupit at pag-aayos para maibalik ang dignidad, kumpiyansa, at panibagong simula.",
    "whoItServes": "Mga kapitbahay na walang tahanan, mga naghahanap ng trabaho, mga pamilyang maliit ang kita, at mga nakatatanda.",
    "whatYoullNeed": "Mga lisensyadong stylist at barbero na handang tumulong, lugar, kagamitan, at kalinisan.",
    "setupHours": 10,
    "defaultCategory": "skilled_labor",
    "suggestsWorkDays": true,
    "firstSteps": "Magsimula sa dalawang usapan: isa sa lisensyadong stylist o barberong handang magsama ng kasamahan, at isa sa mga taong nais mong tulungan — masasabi ng isang shelter, day center, o programa sa paghahanap ng trabaho kung anong mga araw at lugar talaga ang magiging komportable. Kapag parehong pumayag ang stylist at ang magho-host na lugar, kagamitan at iskedyul na lang ang natitira.",
    "commonPitfalls": "Nadadapa ang proyektong ito kapag pakiramdam ay pila ng relief sa halip na salon — minamadaling gupit, walang say sa istilo, nakalabas ang camera para sa social media. Tanungin ang bawat tao kung ano ang gusto niya, huwag munang kumuha ng litrato maliban kung sila mismo ang nag-alok, at huwag kailanman pagupitin ang walang lisensya para lang dumami ang kaya; isang problema sa kalinisan at tapos na ang buong programa.",
    "pairsWith": [
      "laundry-shower-access",
      "reentry-support"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Imbitahan ang mga lisensyadong stylist at barbero",
        "description": "Maghanap ng mga propesyonal na handang tumulong gamit ang kanilang galing nang libre. Tinitiyak ng may lisensya ang ligtas at maayos na gupit at tamang kalinisan.",
        "hours": 2.5,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Maghanap ng malilinisang lugar",
        "description": "Kumuha ng lugar na may tubig, maayos na ilaw, at mga surface na madaling linisin — community center, salon pagkatapos ng oras nito, o simbahan.",
        "hours": 1.5,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Tipunin ang kagamitan at gamit",
        "description": "Mangalap ng clipper, gunting, kapa, suklay, salamin, at mga disposable. Isama ang mga ekstrang maiuuwi tulad ng pang-ahit at toiletries.",
        "hours": 2,
        "skills": [
          "pakikipag-ugnayan",
          "pagmamaneho"
        ]
      },
      {
        "name": "Ayusin ang kalinisan at lisensya",
        "description": "Magtakda ng isterilisasyon ng gamit sa pagitan ng bawat tao at sundin ang lokal na patakaran sa pag-aalok ng gupit sa publiko. Pinoprotektahan ng kalinisan ang lahat.",
        "hours": 1.5,
        "skills": [
          "papeles"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Idaos ang mga araw ng gupitan",
        "description": "I-host ang event, panatilihing magaan at magalang ang buong lugar, at ituring ang bawat tao bilang mahalagang bisita, hindi bilang inaabutan lang ng tulong.",
        "hours": 2.5,
        "skills": [
          "pag-aayos"
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
    "name": "Pangkat ng tulungan sa lipat-bahay",
    "purpose": "Tulungan sa paglipat ang mga hindi kayang kumuha ng movers — mga umaalis sa hindi ligtas na sitwasyon, nahaharap sa pagpapaalis sa tirahan, o lumilipat sa mas maliit.",
    "whoItServes": "Mga kapitbahay na maliit ang kita, mga umaalis sa hindi ligtas na tahanan, mga nakatatanda, at mga kapitbahay na may kapansanan.",
    "whatYoullNeed": "Mga tutulong na may sasakyan at lakas, gamit sa paglipat, at malinaw na mga gawi sa kaligtasan. Para sa sinumang umaalis sa hindi ligtas na sitwasyon, panatilihing mahigpit na lihim ang bagong address, mga petsa, at detalye, at sundan ang gusto ng taong iyon sa timing at kaligtasan.",
    "setupHours": 14,
    "defaultCategory": "transport",
    "suggestsWorkDays": true,
    "firstSteps": "Bago mag-imbita ng kahit isang trak, kausapin muna ang mga dati nang sumasagot sa ganitong mga tawag — mga tagapagtaguyod laban sa karahasan sa tahanan, mga nag-aayos para sa mga umuupa, mga tanggapan para sa nakatatanda — kung paano dapat umabot sa iyo ang mga hiling at anong pagiging kumpidensyal ang aasahan nila, dahil may mga lipat na nangangahulugang may umaalis sa hindi ligtas na tahanan. Pagkatapos, magtipon ng tatlo o apat na tutulong na malakas ang katawan at isang sasakyan, at pagplanuhan nang magkakasama ang unang maliit na lipat.",
    "commonPitfalls": "Mabilis masaktan o mapagod nang husto ang mga pangkat ng lipat-bahay: trabahong sobra-sobra na kulang ang kamay, tutulong na maling buhat, address na naibahagi sa group chat na hindi dapat umalis sa phone ng tagapag-ugnay. Panatilihin ang mga lipat sa loob ng itinakdang limitasyon, at ituring ang detalye ng bawat lipat na may kinalaman sa kaligtasan na parang maaaring maglagay sa panganib ng isang tao — dahil maaari talaga.",
    "pairsWith": [
      "tenant-union",
      "free-store"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Magtipon ng pangkat at sasakyan",
        "description": "Magtipon ng mga tutulong na kayang magbuhat at magdala nang ligtas, at may magagamit na trak o van. Magtabi ng listahan na may availability para mabilis makabuo ng pangkat.",
        "hours": 2.5,
        "skills": [
          "pakikipag-ugnayan",
          "pagmamaneho"
        ]
      },
      {
        "name": "Tipunin ang gamit sa paglipat",
        "description": "Mangalap ng dolly, strap ng muwebles, kumot na panlipat, at magagamit ulit na kahon sa pamamagitan ng donasyon. Ang pinagsasaluhang gamit, mas mabilis at mas ligtas ang lipat.",
        "hours": 1.5,
        "skills": [
          "pagmamaneho"
        ]
      },
      {
        "name": "Gumawa ng paraan ng paghiling at pagsusuri",
        "description": "Gumawa ng paraan para humingi ng tulong at suriin ang bawat lipat: gaano karami, hagdan o elevator, layo, at timing. Dito mo maipaplano ang laki ng pangkat at kagamitan.",
        "hours": 2,
        "skills": [
          "pag-aayos"
        ]
      },
      {
        "name": "Ayusin ang kaligtasan at legal na proteksyon",
        "description": "Sanayin ang mga tutulong sa ligtas na pagbubuhat, gumamit ng simpleng waiver, at i-check ang insurance ng anumang sasakyang gagamitin. Mahalaga ang pagprotekta sa mga tutulong at sa mga tinutulungan.",
        "hours": 2,
        "skills": [
          "papeles"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Ayusin ang iskedyul at pagtatalaga",
        "description": "Itapat ang mga hiling sa mga libreng pangkat at kumpirmahin sa lahat isang araw bago. Magtabi ng listahan ng mga backup dahil hindi basta naiuurong ang lipat.",
        "hours": 1.5,
        "skills": [
          "pag-aayos"
        ],
        "follows": [
          0,
          2
        ]
      },
      {
        "name": "Linawin ang sakop at limitasyon",
        "description": "Pagpasyahan kung ano ang tatanggapin at ano ang hindi (walang delikadong materyales, piano, o trabahong lampas sa ligtas na kaya ng pangkat). Ituro sa iba ang mga iyon.",
        "hours": 1,
        "skills": [
          "pagsusulat"
        ]
      },
      {
        "name": "Isagawa ang lipat at balikan",
        "description": "Isagawa ang lipat nang ligtas at magalang, saka alamin kung naayos na ang tao. Iugnay sila sa ibang proyekto (free store, welcome wagon) kung kailangan.",
        "hours": 3.5,
        "skills": [
          "pagmamaneho"
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
    "name": "Network ng suporta sa may kapansanan & aksesibilidad",
    "purpose": "Pagsama-samahin ang mga kapitbahay na may kapansanan at mga kakampi para sa tulungan, aksesibilidad, at pagtataguyod — pinamumunuan mismo ng mga taong may kapansanan.",
    "whoItServes": "Mga kapitbahay na may kapansanan at pangmatagalang karamdaman.",
    "whatYoullNeed": "Isang naa-access na paraan ng komunikasyon, mga lider na kapwa may kapansanan, at direktoryo ng mapagkukunan. Ang suporta ng kapwa ay dagdag sa propesyonal na pangangalaga — idulog sa mga lisensyadong propesyonal ang mga tanong na medikal, pampersonal na pangangalaga, at legal, at ituring na pribado ang impormasyong pangkalusugan ng mga miyembro.",
    "setupHours": 24,
    "defaultCategory": "organizing",
    "firstSteps": "Gagana lang ang network na ito kung kasama sa mesa ang mga kapitbahay na may kapansanan mula sa pinakaunang usapan — hindi kinokonsulta pagkatapos, kundi sila ang nagpapasya kung ano ito. Magsimula sa paghiling sa dalawa o tatlong kilala mong may kapansanan na maging kasamang tagapagtatag mo (o, kung ikaw mismo ay may kapansanan, na hatiin ang bigat), at hayaang hubugin ng kanilang access needs kung paano mangyayari ang unang pagtitipon: pati anyo, lugar, at bilis.",
    "commonPitfalls": "Ang klasikong kabiguan ay mga kakamping mabuti ang hangarin na gumagawa ng programa para sa mga may kapansanan na hindi naman hiniling ng mga may kapansanan, sa mga anyong hindi nila magagamit. Ang mas tahimik na kabiguan ay ang unti-unting pagiging impormal na pangangalaga: hindi ligtas na kapalit ng medikal o personal na pangangalaga ang suporta ng kapwa, kaya patuloy na idulog ang mga iyon sa mga lisensyadong propesyonal at ingatan ang mga detalye ng kalusugan ng mga miyembro dahil pribadong impormasyon talaga ang mga ito.",
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
        "name": "Iuna ang pamumuno ng may kapansanan",
        "description": "Tiyaking ang mga miyembrong may kapansanan ang namumuno at humuhubog sa network. “Walang tungkol sa amin nang wala kami” ang pangunahing prinsipyo — sumusuporta ang mga kakampi, hindi sila ang nagdidikta.",
        "hours": 3,
        "skills": [
          "pagpapadaloy"
        ]
      },
      {
        "name": "Gumawa ng naa-access na komunikasyon",
        "description": "Mag-alok ng iba't ibang paraan ng pakikilahok (tawag, text, online, personal), gumamit ng simpleng wika, at tiyaking gumagana ang mga materyales sa screen reader at iba't ibang pangangailangan.",
        "hours": 3,
        "skills": [
          "aksesibilidad",
          "tulong sa tech"
        ]
      },
      {
        "name": "Alamin ang pangangailangan at mapagkukunan",
        "description": "Alamin kung ano ang kailangan ng mga miyembro at itala ang mga lokal na mapagkukunan: naa-access na transportasyon, mga pagkukunan ng kagamitan, mga tanggapang makakatulong, at tulong sa benepisyo. Tukuyin ang pinakamalalaking puwang.",
        "hours": 5,
        "skills": [
          "pakikipag-ugnayan",
          "pagtatala"
        ]
      },
      {
        "name": "Ayusin ang palitan ng tulong",
        "description": "Gumawa ng paraan para magbigay at tumanggap ng tulong ang mga miyembro — mga pabili at lakad, kasamang magtataguyod sa mga appointment, mga kumustahan — na tapat sa kaya at pangangailangan.",
        "hours": 3,
        "skills": [
          "pag-aayos"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Magbukas ng pahiraman ng kagamitan",
        "description": "Tipunin at ipahiram ang mga pantulong sa paggalaw at assistive na kagamitan, na nililinis nang husto bago ipahiram sa susunod. Maraming kagamitan ang nakatengga matapos malampasan o hindi na kailanganin.",
        "hours": 4,
        "skills": [
          "pakikipag-ugnayan",
          "pag-aayos"
        ]
      },
      {
        "name": "Tumulong sa pagtataguyod at mga proseso",
        "description": "Tulungan ang mga miyembro sa mga benepisyo, akomodasyon, at mga tanggapan. Magbahagi ng impormasyon at pagsama, at idulog sa mga lisensyadong propesyonal ang mga tanong na legal at medikal.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "papeles"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Magtakda ng pamantayan sa aksesibilidad",
        "description": "Gumawa ng checklist (daanan sa lugar, upuan, interpreter, pangangailangang pandama, materyales) para ang bawat proyekto sa mas malawak mong programa ay bukas at malugod sa mga miyembrong may kapansanan.",
        "hours": 3,
        "skills": [
          "aksesibilidad",
          "pagsusulat"
        ]
      }
    ]
  },
  {
    "id": "books-to-prisoners",
    "name": "Libro para sa mga nakakulong & programang sulatan",
    "purpose": "Magpadala ng libreng libro at sulat sa mga nakakulong para mabawasan ang pag-iisa at masuportahan ang pag-aaral.",
    "whoItServes": "Mga nakakulong at, sa pamamagitan nila, ang kanilang pamilya at komunidad.",
    "whatYoullNeed": "Mga donasyong libro, mga tutulong, selyo sa koreo, at kaalaman sa patakaran sa sulat ng bawat pasilidad. Mahigpit at magkakaiba ang patakaran sa sulat ng bawat pasilidad — tinatanggihan ang paketeng lumalabag, kaya sundin ito nang eksakto, at tiyaking address ng programa lagi ang gamit ng mga tutulong, hindi kailanman address ng bahay.",
    "setupHours": 21,
    "defaultCategory": "education",
    "suggestsWorkDays": true,
    "firstSteps": "Bago magtipon ng kahit isang libro, tawagan ang isang matagal nang programang nagpapadala ng libro sa mga nakakulong — karamihan ay masayang magbabahagi kung aling mga pasilidad ang sakop nila, aling patakaran ang madalas ikatisod, at saan hindi nasasagot ang mga hiling. Pagkatapos, kunin nang nakasulat ang kasalukuyang patakaran sa koreo ng isa o dalawang pasilidad na sisimulan mo; ang talagang hinihiling ng mga nakakulong ang dapat humubog sa koleksyon mo, hindi ang basta inaalis ng mga nagdodonasyon sa kanilang estante.",
    "commonPitfalls": "Namamatay ang proyektong ito sa mga tinanggihang pakete: gamit nang libro kung saan bago lang ang tanggap, hardcover, nakalimutang patakaran sa label — sayang na selyo at naibalik ang matagal nang hinihintay na pakete ng isang tao. Puwede rin nitong masaktan ang mga tutulong na sumusulat mula sa bahay; lumalabas ang bawat sulat sa address ng programa, walang eksepsyon, gaano man kainit ang sulatan.",
    "pairsWith": [
      "reentry-support",
      "free-little-library"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Alamin ang patakaran sa koreo ng pasilidad",
        "description": "May mahigpit at tiyak na patakaran ang bawat bilangguan — marami ang nag-aatas na bago ang libro at direktang galing sa publisher o aprubadong tindahan, may limitasyon sa nilalaman at dami. Saliksikin itong mabuti, dahil tinatanggihan ang sulat na lumalabag.",
        "hours": 5,
        "skills": [
          "papeles"
        ]
      },
      {
        "name": "Magtipon ng libro at lugar ng impakan",
        "description": "Magtipon ng mga donasyong libro (ayon sa patakaran ng pasilidad) at maghanda ng lugar ng pag-uuri at pag-iimpake. Panatilihing iba-iba ang koleksyon: diksyunaryo, pang-edukasyon, kuwento, at gabay sa pagbabalik sa komunidad ang madalas hilingin.",
        "hours": 4,
        "skills": [
          "pakikipag-ugnayan",
          "pagmamaneho"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Ayusin ang pagtanggap ng mga hiling",
        "description": "Gumawa ng proseso ng pagtanggap at pagsubaybay ng mga hiling mula sa mga nakakulong, na sumusulat ng paksa o pamagat. Itapat ang mga hiling sa mga librong mayroon.",
        "hours": 3,
        "skills": [
          "pagtatala",
          "pag-aayos"
        ]
      },
      {
        "name": "Imbitahan at sanayin ang mga tutulong",
        "description": "Sanayin ang mga tutulong na itapat ang mga hiling, mag-impake ayon sa patakaran ng bawat pasilidad, at sumulat ng maalalahaning mga tala. Ang kawastuhan sa patakaran ang pumipigil sa sayang na selyo at tinanggihang pakete.",
        "hours": 3,
        "skills": [
          "pakikipag-ugnayan",
          "pagtuturo"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Sagutin ang selyo at logistics",
        "description": "Ang selyo sa koreo ang pangunahing tuloy-tuloy na gastos. Humingi ng donasyon para dito, gamitin ang pinakamurang paraang sumusunod sa patakaran, at magtakda ng regular na araw ng pagpapadala.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Buuin ang programang sulatan",
        "description": "Ipares ang mga tutulong bilang ka-sulatan kung saan gusto, na may malinaw na gabay sa kaligtasan at privacy (address ng programa ang gamitin, hindi ang sarili). Kasinghalaga ng libro ang koneksyon.",
        "hours": 3,
        "skills": [
          "pagsusulat"
        ]
      }
    ]
  },
  {
    "id": "community-music",
    "name": "Programa ng musika & instrumento ng komunidad",
    "purpose": "Magpahiram ng instrumento at mag-alok ng libreng aralin at jam session para bukas sa lahat ang musika.",
    "whoItServes": "Mga bata at matandang hindi kayang bumili ng instrumento o kumuha ng aralin.",
    "whatYoullNeed": "Mga donasyong instrumento, mga guro na handang magturo nang libre, lugar, at sistema ng pagpapahiram.",
    "setupHours": 15,
    "defaultCategory": "education",
    "firstSteps": "Magsimula sa mga musikerong nasa paligid mo na — ang gitarista sa simbahan sa kanto, ang retiradong maestro ng banda, ang mga tinedyer na tumutugtog — at itanong kung ano ang masaya nilang ituro at kailan. Isang usapan sa tindahan ng instrumento tungkol sa mas murang pagkukumpuni at isa sa lugar na hindi maiinis sa ingay, at halos handa ka na para sa una mong jam.",
    "commonPitfalls": "Tahimik na nauubos ang pahiraman kapag mas mabilis lumabas ang mga instrumento kaysa bumalik na matutugtog pa, kaya maglaan ng oras sa kumpuni mula umpisa at panatilihing maunawain pero totoo ang patakaran sa pagbabalik. At bantayan ang mga aralin na baka mapunta lang sa mga kampante na: ang batang hindi pa nakahahawak ng instrumento ang nangangailangan ng pinakamainit na pagtanggap, hindi ng pinakamaikling oras.",
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
        "name": "Tipunin at ipakumpuni ang mga instrumento",
        "description": "Magtipon ng mga donasyong instrumento at ipalinis, ipapalitan ng kuwerdas, o ipakumpuni para matugtog. Bumuo ng halo-halong uri at antas.",
        "hours": 5,
        "skills": [
          "pagkukumpuni",
          "pagmamaneho"
        ]
      },
      {
        "name": "Ayusin ang pagpapahiram ng instrumento",
        "description": "Gumawa ng talaan ng paghiram na nagsasabi kung sino ang may hawak ng ano, na may gabay sa pag-aalaga at maunawaing patakaran sa pagbabalik. Numerohan at itala ang bawat instrumento.",
        "hours": 2,
        "skills": [
          "pagtatala"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Imbitahan ang mga magtuturo",
        "description": "Maghanap ng mga musikerong handang magturo sa mga baguhan nang matiyaga. Hindi kailangang propesyonal — malayo ang mararating ng sigla at sapat na kaya.",
        "hours": 3,
        "skills": [
          "pakikipag-ugnayan",
          "musika"
        ]
      },
      {
        "name": "Maghanap ng lugar ng aralin at jam",
        "description": "Kumuha ng kuwartong ayos lang ang ingay — community center, paaralan, o bulwagan ng simbahan. Magtakda ng regular na oras ng aralin at bukas na tugtugan.",
        "hours": 2,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Iiskedyul ang mga aralin at jam session",
        "description": "Mag-alok ng aralin sa baguhan at bukas na jam para sa lahat ng antas. Gawing madali ang pagsali at iba-iba ang oras para sa mga may trabaho o nasa paaralan.",
        "hours": 2,
        "recurringCadence": "session",
        "skills": [
          "pag-aayos"
        ],
        "follows": [
          2,
          3
        ]
      },
      {
        "name": "Ituro ang pag-aalaga at pagbabalik",
        "description": "Ituro sa mga humihiram ang pangunahing pag-aalaga ng instrumento at ang gagawin kapag may nasira. Panatilihing nakabatay sa tiwala at sumusuporta, hindi nagpaparusa.",
        "hours": 1,
        "skills": [
          "pagsusulat"
        ],
        "follows": [
          1
        ]
      }
    ]
  },
  {
    "id": "school-supply-program",
    "name": "Programa ng gamit sa eskuwela & school bag",
    "purpose": "Magbigay ng libreng gamit sa eskuwela at school bag para simulan ng mga bata ang taon nang handa at may kumpiyansa.",
    "whoItServes": "Mga pamilyang maliit ang kita na may anak na nag-aaral.",
    "whatYoullNeed": "Mga donasyong gamit o halaga, paglalagyan, lugar ng pamimigay, at mga tutulong.",
    "setupHours": 10,
    "defaultCategory": "mutual_aid_drive",
    "suggestsWorkDays": true,
    "firstSteps": "Ang una mong kausap ay isang paaralan — isang counselor, tagapag-ugnay sa pamilya, o coordinator ng mga magulang na alam ang totoong listahan ng gamit at kung aling mga pamilya ang tahimik na nagtitiis na walang dala. Hayaan silang humubog kung ano ang titipunin mo at paano makakarating ang balita sa mga pamilya; ang pamimigay na dumadaan sa mga taong pinagkakatiwalaan na ng mga magulang ay aabot sa mga batang hindi kailanman maaabot ng flyer.",
    "commonPitfalls": "Ang inaasahang kabiguan ay bundok ng donasyong folder at wala ni isa sa mga notebook na talagang hinihingi ng listahan — pagtitipon ng madaling ibigay sa halip na kailangan. Ang masakit naman ay pamimigay na parang pagsusuri kung karapat-dapat; laktawan ang papeles tungkol sa kita, hayaang pumili ang mga bata ng sarili nilang school bag, at walang uuwing pakiramdam ay siniyasat.",
    "pairsWith": [
      "youth-mentorship",
      "toy-library"
    ],
    "tasks": [
      {
        "name": "Kunin ang listahan ng gamit at alamin ang dami",
        "description": "Makipagtulungan sa mga lokal na paaralan para malaman ang totoong listahan ng gamit kada baitang at matantya kung ilang pamilya ang nangangailangan. Dito nananatiling angkop ang mga donasyon.",
        "hours": 1.5,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Magsagawa ng drive at bumili nang pakyawan",
        "description": "Pagsamahin ang mga donation drive at pakyawang bili para sa mga pinakakailangang gamit. Sa pakyawang bili pinakahumahaba ang halaga sa mga pangunahing tulad ng notebook at lapis.",
        "hours": 3,
        "recurringCadence": "cycle",
        "skills": [
          "pakikipag-ugnayan",
          "pagmamaneho"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Iuri at buuin ayon sa baitang",
        "description": "Ayusin ang mga gamit at impakehin ang mga school bag ayon sa listahan ng bawat baitang. Mabilis ang assembly-line na pag-iimpake kasama ang mga tutulong.",
        "hours": 2,
        "skills": [
          "pag-aayos"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Maghanda ng paglalagyan at lugar ng pamimigay",
        "description": "Kumuha ng tuyong paglalagyan at malugod na lugar ng pamimigay ng school bag, kadalasan sa paaralan, community center, o kasabay ng ibang pambungad-ng-pasukan na event.",
        "hours": 1.5,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Itakda at lagyan ng tao ang pamimigay",
        "description": "Idaos ang pamimigay bago magsimula ang pasukan, may mga palakaibigang tutulong. Hangga't maaari, hayaang pumili ang mga bata ng school bag — dagdag na dignidad ang pagpili.",
        "hours": 2,
        "skills": [
          "pag-aayos"
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
    "name": "Klinika ng Tulong Legal at Kaalaman sa mga Karapatan",
    "purpose": "Iugnay ang mga kapitbahay sa libreng tulong legal at ituro sa mga tao ang kanilang mga karapatan.",
    "whoItServes": "Sinumang humaharap sa problemang legal nang walang pera para sa abogado — mga usapin sa pabahay, imigrasyon, utang, pamilya, o benepisyo.",
    "whatYoullNeed": "Mga abogadong handang tumulong nang libre at mga estudyante ng abogasya, isang espasyo, mga katuwang na organisasyon ng tulong legal, at maayos na iskedyul. Ang payong legal para sa isang tao ay dapat manggaling sa kuwalipikado at lisensyadong abogado (o estudyante ng abogasya na may gabay ng abogado) — inaayos ng programang ito ang daan patungo sa tulong at nagbabahagi ng pangkalahatang kaalaman sa karapatan; hindi ito mismo pinagmumulan ng payong legal.",
    "setupHours": 26,
    "defaultCategory": "other",
    "suggestsWorkDays": true,
    "firstSteps": "Walang sinisimulan dito hangga't wala kang mga abogado: ang mga unang tawag mo ay sa lokal na tanggapan ng tulong legal, sa pro bono program ng samahan ng mga abogado, at sa legal clinic ng isang law school, para itanong kung ano ang kailangan nila para dumating — at kung saan ang mga puwang na kaya talagang punan ng isang klinika sa kapitbahayan. Hayaang ang mga katuwang na iyon ang magtakda kasama mo ng saklaw ng klinika bago mo ipaalam ang kahit ano sa mga kapitbahay.",
    "commonPitfalls": "Ang mapanganib na pagkabigo ay isang mabait na tumutulong na dumudulas mula sa pagbibigay-impormasyon patungo sa pagpapayo — kayang sirain ng isang mabuting-loob na “pirmahan mo na lang” ang kaso ng isang tao, kaya panatilihing malinaw at praktisado ang linyang iyon. Ang mas mabagal ay pagtanggap ng mga hiling na lumalampas sa kaya ng mga abogado: mas mabilis sumira ng tiwala ang mahabang pila ng mga taong desperado nang walang abogado sa silid kaysa sa hindi na lang pagbubukas.",
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
        "name": "Makipagtuwang sa mga abogado at tulong legal",
        "description": "Hanapin ang mga lisensyadong abogado, o mga estudyante ng abogasya na may gabay ng abogado, na magbibigay ng aktuwal na payong legal. Bumuo ng ugnayan sa mga matagal nang organisasyon ng tulong legal para sa pagpapasa ng mga kaso.",
        "hours": 6,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Itakda ang saklaw at mga daan ng pagpapasa",
        "description": "Pagpasyahan kung aling mga usapin ang kayang harapin ng klinika at maglatag ng malinaw na daan para ipasa ang mga komplikado o espesyalisadong kaso. Maging tapat sa kung ano ang kaya at hindi kaya ng klinika.",
        "hours": 3,
        "skills": [
          "pagsusulat"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Maghanda ng espasyo at pagtanggap",
        "description": "Humanap ng pribado at kumpidensiyal na lugar at gumawa ng pagtanggap na may checklist ng mga dokumento para magamit nang husto ng mga abogado ang limitadong panahon.",
        "hours": 3,
        "skills": [
          "pag-aayos"
        ]
      },
      {
        "name": "Bumuo ng kumpidensiyal na sistema ng appointment",
        "description": "Gumawa ng mga appointment na nag-iingat ng privacy. Sensitibo ang mga usaping legal, kaya bantayang mabuti ang impormasyon ng mga tao sa bawat hakbang.",
        "hours": 3,
        "skills": [
          "pag-aayos",
          "pagtatala"
        ]
      },
      {
        "name": "Gumawa ng mga gabay at workshop tungkol sa karapatan",
        "description": "Gumawa ng malinaw at tumpak na mga gabay at magdaos ng workshop tungkol sa mga karaniwang karapatan (nangungupahan, manggagawa, imigrasyon, pagharap sa mga awtoridad). Sabihing pangkalahatang impormasyon ang mga ito, hindi payong legal para sa isang tao.",
        "hours": 5,
        "recurringCadence": "event",
        "skills": [
          "pagsusulat",
          "pagtuturo"
        ]
      },
      {
        "name": "Ikalat ang balita at itakda ang mga klinika",
        "description": "Magtakda ng regular na petsa ng klinika at ipaalam ito sa pamamagitan ng mga katuwang na organisasyon at ng buong programa ng tulungan. Mag-alok ng pagsasalin para sa mga mas komportable sa ibang wika.",
        "hours": 3,
        "skills": [
          "pakikipag-ugnayan",
          "pagsasalin"
        ],
        "follows": [
          0,
          3
        ]
      },
      {
        "name": "Ingatan ang kumpidensiyalidad at suriin ang mga conflict",
        "description": "Maglatag ng mahigpit na kumpidensiyalidad at simpleng pagsusuri ng conflict of interest para hindi kailanman mapayuhan ng iisang tumutulong ang magkabilang panig. Sanayin ang lahat sa mga alituntuning ito.",
        "hours": 3,
        "skills": [
          "papeles"
        ]
      }
    ]
  },
  {
    "id": "resource-hub-dispatch",
    "name": "Sentro ng Tulungan at Dispatch",
    "purpose": "Maging gulugod ng koordinasyon — iisang punto kung saan pinagtatagpo ang mga kailangan at alok sa lahat ng proyekto ng programa mo.",
    "whoItServes": "Lahat ng nasa programa — mga miyembrong humihingi ng tulong, mga miyembrong nag-aalok nito, at mga namumuno sa proyekto na nangangailangan ng koordinasyon.",
    "whatYoullNeed": "Isang sistema ng pagtanggap, talaan ng mga tutulong at mapagkukunan, mga coordinator, at isang master directory. May hawak ang sentro na sensitibong impormasyon tungkol sa buhay ng mga kapitbahay — kunin lang ang talagang kailangan, ingatang mabuti, at ibahagi ang mga detalye sa mga tao lang na nangangailangan ng mga ito para makatulong.",
    "setupHours": 27,
    "defaultCategory": "organizing",
    "firstSteps": "Nag-uugnay ang sentro ng mga proyekto, kaya magsimula sa pag-upo kasama ang namumuno ng bawat proyekto: anong mga hiling ang dumarating sa kanila, ano ang gusto nilang maipasa, at paano nila gustong tumanggap ng mga tugma. Pagkasunduan nang sama-sama ang iisang pagtanggap at panimulang pananaw sa privacy — ang sentrong ipinilit sa mga proyekto, iiwasan lang; ang binuo kasama nila ang nagiging pangunahing pinto.",
    "commonPitfalls": "Dalawa ang ikinamamatay ng mga sentro: napupuno ang pagtanggap ng mga hiling na walang nagdadala hanggang dulo, kaya kumakalat ang balitang walang nangyayari sa pagtawag; o hawak ng iisang bayaning coordinator ang bawat hibla hanggang maubos siya at mawala ang alaala ng programa. Sundan ang bawat hiling hanggang sa tunay na pagsasara, magsalitan nang maaga sa mga turno, at mas kaunting impormasyon ang itala kaysa sa akala mong kailangan.",
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
        "name": "Gumawa ng iisang pagtanggap ng mga kailangan at alok",
        "description": "Gumawa ng isang madaling pasukan — linya ng telepono, form, at personal na opsyon — kung saan masasabi ng sinuman kung ano ang kailangan niya o kaya niyang ibigay. Ang iisang pinto ay pumipigil na may makalusot sa mga bitak.",
        "hours": 4,
        "skills": [
          "pag-aayos",
          "tulong sa tech"
        ]
      },
      {
        "name": "Bumuo ng talaan ng mga tutulong at mapagkukunan",
        "description": "Panatilihing napapanahon ang listahan ng mga tutulong (mga kakayahan, kung kailan libre, lugar) at ng kayang ialok ng bawat proyekto, para mabilis na maitugma ang mga hiling.",
        "hours": 4,
        "skills": [
          "pagtatala"
        ]
      },
      {
        "name": "Gumawa ng proseso ng pagtutugma at dispatch",
        "description": "Itakda kung paano at gaano kabilis napupunta ang isang hiling sa tamang proyekto o tao. Magtakda ng target na bilis ng pagtugon at kung paano sinusundan ang mga hiling hanggang matapos.",
        "hours": 4,
        "skills": [
          "pag-aayos"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Panatilihin ang master directory ng mga mapagkukunan",
        "description": "Mag-ingat ng buhay na directory ng lahat ng proyekto mo at ng mga panlabas na mapagkukunan ng tulong (mga shelter, klinika, pagkain, tulong legal) para maituro ng sentro ang mga tao saanman may tulong.",
        "hours": 5,
        "recurringCadence": "month",
        "skills": [
          "pagtatala"
        ]
      },
      {
        "name": "Maghanap at magsanay ng mga coordinator",
        "description": "Bumuo ng team para sa nagsasalitang turno ng dispatch, para manatiling mabilis ang sentro nang walang nauubos. Sanayin sila sa proseso at sa directory.",
        "hours": 3,
        "skills": [
          "pakikipag-ugnayan",
          "pagtuturo"
        ],
        "follows": [
          2,
          3
        ]
      },
      {
        "name": "Itakda ang privacy ng datos at pag-follow-up",
        "description": "Pagpasyahan kung anong impormasyon ang itatala, paano ito iniimbak at iniingatan, at paano mo kinukumpirma na natugunan talaga ang isang kailangan. Kunin ang pinakakaunti at ingatang mabuti.",
        "hours": 4,
        "skills": [
          "pagsusulat"
        ]
      },
      {
        "name": "Subaybayan ang mga hindi natutugunang kailangan",
        "description": "Itala ang mga hiling na hindi mo napunan. Ang paulit-ulit na puwang ang nagtuturo kung saan dapat magsimula ng susunod na proyekto ang programa mo — ginagawang kasangkapan sa pagpaplano ang sentro, hindi lang tagapagpasa ng tawag.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "pagtatala"
        ]
      }
    ]
  },
  {
    "id": "harm-reduction-supplies",
    "name": "Pamamahagi ng mga Gamit na Harm Reduction",
    "purpose": "Ihatid ang naloxone, test strip, at mas ligtas na gamit sa mga kamay ng taong maaaring mangailangan ng mga ito — sinasalubong ang mga kapitbahay kung nasaan sila, walang kasamang paghuhusga.",
    "whoItServes": "Mga taong may ginagamit na droga, ang kanilang mga kaibigan at pamilya, at sinumang maaaring makasaksi ng overdose — na, sa karamihan ng kapitbahayan, ay kahit sino.",
    "whatYoullNeed": "Pagsasanay sa pagtugon sa overdose, pagkukunan ng naloxone (programa ng kagawaran ng kalusugan, botika, o katuwang na organisasyon), mga gamit para sa kit, at maliit na grupo ng tagahatid. Ang pamimigay ng gamit ay hindi pangangalagang medikal — dapat munang tapusin ng bawat maghahatid ang pagsasanay sa pagtugon sa overdose, at malaki ang pagkakaiba ng batas tungkol sa puwede mong dalhin (test strip, hiringgilya) depende sa lugar, kaya tiyakin muna ang batas sa lugar mo bago mag-ipon ng kahit ano. Panatilihing nakalimbag sa bawat kit ang mga lokal na linya ng krisis at paggamot.",
    "setupHours": 20,
    "defaultCategory": "other",
    "suggestsWorkDays": true,
    "firstSteps": "Huwag munang bumili ng kahit ano: ang unang hakbang mo ay pakikipag-usap sa pinakamalapit na matagal nang harm reduction program at sa mga taong talagang nangangailangan ng mga gamit na ito — sila ang magsasabi kung ano ang kailangan, ano na ang sakop, at paano dumating nang walang paghuhusga. Ipatapos sa pangunahing grupo mo ang pagsasanay sa pagtugon sa overdose at tiyakin ang lokal na batas sa strip at hiringgilya bago maimpake ang kahit isang kit.",
    "commonPitfalls": "Nagkakamali ito kapag dumating kayong mga estranghero — namamahagi kung saan wala kayong ugnayan, o nagdadagdag ng sermon at kondisyong nagtuturo sa mga tao na iwasan ka — at kapag nauna ka sa batas o sa pagsasanay mo, na puwedeng magdulot sa isang tutulong ng kasong paraphernalia. Ang mabagal at may katuwang ay laging tumatalo sa mabilis at nag-iisa dito.",
    "pairsWith": [
      "community-first-aid-training",
      "mental-health-peer-support"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Magpasanay at humanap ng katuwang sa harm reduction",
        "description": "Ipatapos sa pangunahing grupo ang pagsasanay sa pagtugon sa overdose at naloxone — maraming kagawaran ng kalusugan at harm reduction na organisasyon ang nagdaraos nito nang libre. Makipagtuwang sa isang matagal nang programa; nalutas na nila ang mga problema sa gamit, batas, at tiwala na hindi mo na kailangang lutasin ulit.",
        "hours": 4,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Alamin ang lokal na batas sa mga gamit",
        "description": "Protektado halos saanman ang naloxone, pero sa ilang lugar, itinuturing pa ring paraphernalia ang test strip at hiringgilya. Alamin nang eksakto kung ano ang legal mong madadala at maipamimigay — mabilis itong masasagot ng katuwang mong organisasyon o ng isang klinika ng tulong legal. Isulat ito para sa mga tutulong.",
        "hours": 3,
        "skills": [
          "pananaliksik"
        ]
      },
      {
        "name": "Kumuha ng naloxone at mga gamit sa kit",
        "description": "Umorder ng naloxone sa programa ng pamamahagi ng kagawaran ng kalusugan, standing order ng botika, o sa katuwang na organisasyon. Idagdag ang anumang legal sa lugar mo: fentanyl at xylazine test strip, panggamot sa sugat, mga gamit sa kalinisan.",
        "hours": 4,
        "follows": [
          1
        ],
        "skills": []
      },
      {
        "name": "Buuin ang mga kit na may simpleng gabay",
        "description": "Impakehin ang mga kit na may simple at maraming-wikang instruksiyon: paano makilala ang overdose, paano magbigay ng naloxone, tumawag sa 911, huwag gumamit nang mag-isa. Isama sa bawat kit ang mga lokal na linya ng krisis at paggamot. Mabilis ang pag-iimpake kapag puno ng tao ang mesa.",
        "hours": 3,
        "skills": [
          "pagsasalin"
        ],
        "follows": [
          2
        ],
        "recurringCadence": "cycle"
      },
      {
        "name": "Ayusin ang mga ruta at takdang puwesto",
        "description": "Magplano ng regular na lakad o biyahe sa mga lugar kung saan talaga ang mga tao, at hilingin sa mga bar, tindahan sa kanto, aklatan, at venue na maglagay ng kahong walang-tanong. Ang mababang harang ang buong punto — walang form, walang sermon.",
        "hours": 4,
        "skills": [
          "pakikipag-ugnayan",
          "pagmamaneho"
        ]
      },
      {
        "name": "Mag-restock, magtala, at panatilihing sariwa ang pagsasanay",
        "description": "Itala kung ano ang nauubos at ano ang nakatengga, ilista ang petsa ng pag-expire ng naloxone, at magdaos ng refresher kapag may bagong sumali. Kapag may kit na nakapigil ng overdose, karapat-dapat itong (marahang) itala.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": []
      }
    ]
  },
  {
    "id": "court-support",
    "name": "Pagsama at Pag-agapay sa Korte",
    "purpose": "Siguraduhing walang kapitbahay na haharap sa korte nang mag-isa — kasama sa loob ng courtroom, hatid papunta, pag-aalaga ng bata habang may pagdinig, at mga liham ng suporta kapag hiniling ng depensa.",
    "whoItServes": "Mga kapitbahay na may petsa sa korteng kriminal, imigrasyon, pagpapaalis sa bahay, o pampamilya, at ang kanilang mga pamilya — ang pagpunta sa korte nang mag-isa ay puwedeng magpawala ng trabaho, alaga, at pag-asa.",
    "whatYoullNeed": "Mga maaasahang tutulong, kalendaryo ng mga pagdinig, at ugnayan sa mga pampublikong tagapagtanggol. Ang pagsama sa korte ay presensya at logistics, hindi payong legal — hindi kailanman nagpapayo sa kaso ang mga sumasama at laging sumusunod sa abogado mismo ng tao. Mahigpit ang mga patakaran ng asal sa courtroom, kaya dapat kabisado ito ng lahat ng dadalo.",
    "setupHours": 16,
    "defaultCategory": "other",
    "firstSteps": "Magsimula sa mga taong may-ari ng mga petsang ito: nangyayari lang ang pagsama sa imbitasyon ng taong haharap sa korte, at kaayon ng abogado niya. Magpakilala muna sa tanggapan ng pampublikong tagapagtanggol at sa anumang grupong court-watch o tumutulong sa piyansa na nasa korte na, at hayaang sila ang magsabi kung aling mga pagdinig ang nangangailangan ng kasama at paano makatutulong nang hindi kailanman hinahawakan ang panig na legal.",
    "commonPitfalls": "Ang pinsala rito ay nagmumula sa pagkanya-kanya: isang tumutulong na “nagpapaliwanag” ng plea sa pasilyo, mga detalye ng kaso na napag-uusapan kung saan naririnig ng piskal, isang kapansin-pansing reaksyon sa gallery na nakakainis sa hukom — kahit alin dito ay makasasakit sa mismong taong sinamahan mo. Ang mas tahimik na pagkabigo ay logistics: ang petsang hindi nakumpirma o hatid na hindi natuloy ay puwedeng mauwi sa napalampas na pagdinig at isang warrant.",
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
        "name": "Makipag-ugnayan sa mga tagapagtanggol at grupo sa korte",
        "description": "Magpakilala sa tanggapan ng pampublikong tagapagtanggol, sa tulong legal sa imigrasyon, at sa anumang grupong court-watch o tumutulong sa piyansa na kumikilos na. Sila ang magsasabi kung saan pinakakailangan ang suporta at paano sumabay nang hindi nakakasagabal.",
        "hours": 3,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Isulat ang mga patakaran: suporta, hindi batas",
        "description": "Isulat ito: hindi kailanman nagbibigay ng payong legal ang mga sumasama, hindi pinag-uusapan ang detalye ng kaso sa mga pampublikong bahagi ng korte, at laging nagpapauna sa abogado mismo ng tao. Idagdag ang asal sa courtroom — maagang dating, simpleng damit, patay na phone, walang reaksyon mula sa gallery.",
        "hours": 2,
        "skills": [
          "pagsusulat"
        ]
      },
      {
        "name": "Bumuo ng pagtanggap at kalendaryo ng mga pagdinig",
        "description": "Gumawa ng simpleng paraan para makahingi ng suporta ang mga tao at ng shared na kalendaryo ng mga petsa, courtroom, at kailangan ng bawat isa — kasama, hatid, pag-aalaga ng bata, o lahat ng tatlo. Laging gumagalaw ang mga petsa sa korte, kaya kumpirmahin isang araw bago.",
        "hours": 3,
        "skills": [
          "pag-aayos"
        ]
      },
      {
        "name": "Sanayin ang mga sasama sa korte",
        "description": "Isa-isahin sa mga tutulong ang pagbisita sa korte: security, paghahanap ng silid, kung saan uupo, at kung paano maging panatag at mainit na kasama sa nakaka-stress na paghihintay. Ipares ang bawat bago sa isang beterano sa unang petsa niya.",
        "hours": 3,
        "skills": [
          "pagtuturo"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Ayusin ang hatid at pag-aalaga ng bata sa mga pagdinig",
        "description": "Maghanda ng mga driver para sa umaga ng korte at ng mga magsasalitang mag-aalaga ng bata habang may pagdinig — maraming courtroom ang hindi pumapayag ng bata, at ang pagdinig na napalampas dahil sa alaga ay puwedeng mauwi sa warrant.",
        "hours": 3,
        "skills": [
          "pagmamaneho",
          "pag-aalaga ng bata"
        ],
        "recurringCadence": "event"
      },
      {
        "name": "Ayusin ang mga liham ng suporta kapag hiniling ng depensa",
        "description": "Kapag humiling ang abogado ng isang tao ng mga liham tungkol sa pagkatao o suporta ng komunidad, ayusin ang mga kapitbahay na magsusulat — na sumusunod nang eksakto sa gabay ng abogado sa nilalaman, tono, at takdang araw.",
        "hours": 2,
        "skills": [
          "pagsusulat"
        ]
      }
    ]
  },
  {
    "id": "cooling-warming-center",
    "name": "Pop-Up na Sentro ng Pagpapalamig at Pagpapainit",
    "purpose": "Magbukas ng kanlungan sa klima sa kapitbahayan — malamig na silid sa matinding init, mainit na silid sa matinding lamig — na handa bago pa maging mapanganib ang panahon, hindi pagkatapos.",
    "whoItServes": "Mga nakatatanda, mga kapitbahay na walang tirahan, mga taong walang gumaganang AC o heater, mga nagtatrabaho sa labas, at sinumang hindi kayang sabayan ng tirahan niya ang panahon.",
    "whatYoullNeed": "Isang host site na may AC at heater at banyo, mga gamit, at mga sanay na host na naka-turno. Ang mga host ay kapitbahay, hindi medik — sanayin ang lahat na makilala ang heat exhaustion at hypothermia at tumawag sa 911 nang maaga sa halip na huli, at ayusin ang usapin ng insurance at liability ng host site bago ang unang pagbubukas, hindi sa gitna nito.",
    "setupHours": 21,
    "defaultCategory": "other",
    "suggestsWorkDays": true,
    "firstSteps": "Ang host site ang ugnayang kinapapatungan ng lahat, kaya doon magsimula: umupo kasama ang librarian, pastor, o ang namamahala ng bulwagan at pag-usapan nang magkasama ang mga hindi komportableng tanong — oras ng bukas, susi, insurance, ano ang mangyayari kapag may kailangang magpalipas ng gabi — bago sila ipilit ng unang forecast. Kasabay nito, itanong sa mga outreach worker at staff ng mga gusali ng nakatatanda kung sino talaga ang nangangailangan ng kanlungan, para tugma sa mga tao ang lugar at oras nito.",
    "commonPitfalls": "Nabibigo ang proyektong ito sa puwang sa pagitan ng plano at panahon: isang hudyat na hindi talaga napagkasunduan, kaya isang araw na huli ang pagbubukas ng sentro, o tanong sa liability na iniwang malabo hanggang may bumagsak at tuluyang umatras ang host. Isulat ang hudyat ng pagbubukas, magsagawa ng isang praktis na pagbubukas bago ang season, at siguraduhing alam ng bawat host na tumawag sa 911 nang maaga, hindi bilang huling hakbang.",
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
        "name": "Humanap ng host site na may AC at heater",
        "description": "Magtanong sa mga aklatan, simbahan, bulwagan ng unyon, at community center ng silid na may maaasahang AC at heater, banyo, at pasukang walang hagdan. Kumuha ng nakasulat na pahintulot na sumasaklaw sa oras ng bukas, kung sino ang may hawak ng susi, at ano ang gagawin kapag kailangan ito magdamag.",
        "hours": 4,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Itakda ang mga hudyat ng pagbubukas at plano ng alerto",
        "description": "Pagpasyahan nang maaga kung ano mismo ang magbubukas ng sentro — temperatura sa forecast, heat index, matinding lamig ng hangin — para walang kailangang magpasya nang hatinggabi. Gumawa ng phone tree o group chat na naglalagay sa mga host sa standby isang araw bago.",
        "hours": 2,
        "skills": []
      },
      {
        "name": "Mag-ipon ng mga gamit",
        "description": "Tipunin ang tubig, electrolyte packet, kumot, natitiklop na higaan o komportableng upuan, electric fan, phone charger, at first-aid kit. Itago lahat sa site sa mga may label na lalagyan para mahanap ng sinumang host ang mga bagay.",
        "hours": 3,
        "skills": [
          "pagmamaneho"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Maghanap at magsanay ng mga host ng turno",
        "description": "Humanap ng sapat na tao para dalawa bawat turno at sanayin sila: pagsalubong sa mga tao nang walang papeles, pagkilala ng heat exhaustion at hypothermia, kung kailan tatawag sa 911, at mga batayan ng pagpapakalma. Ang init ng pakikitungo ay kasinghalaga ng thermostat.",
        "hours": 4,
        "skills": [
          "pagtuturo"
        ]
      },
      {
        "name": "Buuin ang salitan ng turno",
        "description": "Ihanda ang iskedyul ng turno na kaya mong buhayin sa isang araw na abiso — mga magbubukas, magsasara, at pang-magdamag kung inaalok ito. Mag-ingat ng listahan ng reserba, dahil pinapatumba rin ng matinding init ang mga tutulong.",
        "hours": 2,
        "skills": [
          "pag-aayos"
        ],
        "follows": [
          3
        ],
        "recurringCadence": "event"
      },
      {
        "name": "Ikalat ang balita bago ang season",
        "description": "Gumawa ng mga flyer sa maraming wika na may mga hudyat at lokasyon, at ihatid ang mga ito sa mga klinika, gusali ng nakatatanda, outreach worker, at tindahan sa kanto bago ang unang matinding init o lamig — hindi habang nangyayari na.",
        "hours": 3,
        "skills": [
          "pagdidisenyo",
          "pagsasalin"
        ]
      },
      {
        "name": "Magbukas, mag-host, at mag-reset bawat pagbubukas",
        "description": "Patakbuhin ang sentro habang tumatagal ang matinding panahon: itala ang mga tao nang maluwag (bilang, hindi ID), panatilihing dumadaloy ang mga gamit, at silipin ang sinumang natutulog. Pagkatapos, maglinis, mag-restock, at itala kung ano ang nagkulang.",
        "hours": 3,
        "recurringCadence": "event",
        "skills": []
      }
    ]
  },
  {
    "id": "community-oral-history",
    "name": "Proyekto ng Kasaysayang Pasalita ng Komunidad",
    "purpose": "Itala ang mga kuwento ng mga nakatatanda at kapitbahay bago mawala ang mga ito — at panatilihin sa mga nagkukuwento ang kapangyarihan sa mangyayari sa mga ito.",
    "whoItServes": "Mga nakatatandang may mga kuwentong walang nagtatanong, mga matagal nang naninirahan na nakamamasid sa pagbabago ng kapitbahayan, at bawat kapitbahay na darating pagkatapos.",
    "whatYoullNeed": "Phone o simpleng recorder, tahimik na lugar, mga form ng pahintulot, at ligtas na lugar para sa mga file. Personal na datos ang mga recording — pag-aari ng bawat kalahok ang kuwento niya, siya ang nagpapasya kung saan ito ibinabahagi, at puwede siyang magbago ng isip pagkatapos. Walang lumalabas sa publiko nang wala ang nakasulat niyang pahintulot.",
    "setupHours": 10,
    "defaultCategory": "education",
    "firstSteps": "Magsimula sa isang nakatatandang nagtitiwala sa iyo at itanong kung may kuwento siyang maibabahagi — mas marami kang matututuhan sa unang recording na iyon kaysa sa anumang plano, at ang salita niya ang nananagot para sa iyo sa susunod na magkukuwento. Bago ka pumindot ng record kaninuman, pagdaanan nang magkasama ang form ng pahintulot at itanong kung ano ang gusto niyang mangyari sa recording; ang usapang iyon ang proyekto.",
    "commonPitfalls": "Ang paraan nitong makasakit ay kuwentong naglakbay nang mas malayo kaysa sa pinayagan ng nagkuwento — isang clip na naipaskil, pangalang naidikit, detalyeng para sa iyo lang. Ang paraan nitong tahimik na mamatay ay mga recording na nagtutumpok nang walang label sa phone ng iisang tao hanggang burahin ng nawalang device ang mga taon ng mga boses; lagyan ng label at i-back up ang bawat sesyon sa linggo ring iyon.",
    "pairsWith": [
      "neighborhood-care-network",
      "digital-literacy"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Sumulat ng simpleng form ng pahintulot",
        "description": "Isang pahina, walang legalese: ano ang ire-record, kung saan ito maaaring ibahagi, at ang karapatan ng kalahok na huminto, lumaktaw ng tanong, o bawiin ang recording pagkatapos. Isalin ito sa mga wikang talagang sinasalita ng mga magkukuwento mo.",
        "hours": 2,
        "skills": [
          "pagsusulat",
          "pagsasalin"
        ]
      },
      {
        "name": "Mag-ipon ng gamit at listahan ng tanong",
        "description": "Sapat na ang phone na may voice memo app; magdagdag ng murang lapel mic kung kaya. Magbalangkas ng mga bukas na tanong na nag-aanyaya ng kuwento — “ikuwento mo ang kalye noong dumating ka” — at magpraktis nang minsan sa isa't isa.",
        "hours": 2,
        "skills": []
      },
      {
        "name": "Mag-record ng mga sesyon ng kuwentuhan",
        "description": "Umupo kasama ang isang magkukuwento sa isang tahimik at komportableng lugar. Pagdaanan muna nang magkasama ang form ng pahintulot, pagkatapos ay makinig lang halos — ang pinakamahuhusay na panayam ay iyong pinakakaunti ang salita mo.",
        "hours": 4,
        "skills": [
          "pakikinig"
        ],
        "follows": [
          0,
          1
        ],
        "recurringCadence": "session"
      },
      {
        "name": "Mag-imbak at ibalik ang kuwento, sa kanilang kondisyon",
        "description": "Lagyan ng label ang bawat recording ng petsa, mga pangalan, at napagkasunduan sa pagbabahagi. Mag-ingat ng dalawang kopya sa ligtas na lugar, bigyan ang bawat magkukuwento ng sarili niyang kopya, at ibahagi sa publiko ang mga bahagi lang na pinayagan ng bawat isa.",
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
    "name": "Kooperatiba ng Solar at Enerhiya ng Komunidad",
    "purpose": "Pagsama-samahin ang kaya ng mga kapitbahay sa iisang shared na renewable energy na nagpapababa ng bill ng lahat — lalo na para sa mga nangungupahan at sambahayang hindi kailanman makakapaglagay ng panel sa sarili nilang bubong.",
    "whoItServes": "Mga nangungupahan, mga sambahayang maliit ang kita, at sinumang hindi maabot ang rooftop solar dahil sa bubong, nagpapaupa, o badyet nila.",
    "whatYoullNeed": "Mga miyembrong seryoso, kaalamang teknikal at pampinansiya na kayang hiramin o pag-aralan, host site o umiiral nang community-solar program na masasalihan, at mga katuwang na organisasyon. Isang bagay na sinasabi nang tuwiran: may tunay na komplikasyong pampinansiya at legal ang mga kooperatiba ng enerhiya — kumuha ng payo mula sa mga kuwalipikadong propesyonal tungkol sa istruktura, pagkukunan ng pera, at mga kontrata bago pumirma ang kahit sino.",
    "setupHours": 27,
    "defaultCategory": "infrastructure",
    "firstSteps": "Bago ang anumang panel o papeles, kausapin ang dalawang grupo: mga kapitbahay na talagang sasali, para sukatin ang tunay na pagseseryoso, at isang solar co-op sa kalapit na bayan o lalawigan na nakagawa na nito — sila ang magsasabi kung aling modelo ang bagay sa mga patakaran ng lugar mo at aling mga pagkakamali ang nagpagastos sa kanila. Pagkatapos, basahin mismo ang mga lokal na patakarang iyon, dahil sila, hindi ang sigasig mo, ang nagpapasya kung ano ang posible.",
    "commonPitfalls": "Namamatay ang mga solar co-op sa puwang sa pagitan ng sigla at pirma: isang taon ng mga pulong tungkol sa modelong hindi kailanman pinayagan ng mga patakaran sa lugar mo, o kontratang napirmahan nang walang pagsusuri ng propesyonal na nagkukulong sa mga miyembro sa mga kondisyong walang nakaintindi. Ang isa pang pumapatay ay malabong pera — kapag hindi malinaw na nakikita ng mga miyembro kung ano ang inilagay nila at ano ang bumabalik, nauupos ang tiwala at natatastas ang co-op.",
    "pairsWith": [
      "weatherization-brigade",
      "bulk-buying-coop"
    ],
    "tasks": [
      {
        "name": "Tipunin ang mga miyembro at sukatin ang interes",
        "description": "Anyayahan ang mga sambahayang interesado sa mas murang malinis na enerhiya at alamin kung gaano sila talaga kaseryoso — magkaiba ang malabong sigla at ang miyembrong nakapirma na. Hinuhubog ng bilang mo kung aling mga modelo ang makatotohanan, kaya magbilang nang tapat bago magplano.",
        "hours": 4,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Pag-aralan ang mga modelo at lokal na patakaran",
        "description": "Saliksikin kung paano gumagana ang community solar sa lugar mo: mga batas, net metering, subscription program, istruktura ng kooperatiba. Malaki ang pagkakaiba ng mga patakaran bawat lugar at sila ang nagpapasya kung ano talaga ang posible — gawin ito bago ma-in love sa kahit anong modelo.",
        "hours": 5,
        "skills": [
          "pananaliksik"
        ]
      },
      {
        "name": "Humanap ng site o programang masasalihan",
        "description": "Maghanap ng host na bubong o lupa para sa shared na array, o alamin kung tatanggapin ng umiiral nang community-solar program ang grupo mo bilang sama-samang subscriber — madalas na mas mabilis ang sumali kaysa magtayo. Timbangin ang dalawang daan kasama ang mga miyembro bago magpasya.",
        "hours": 4,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Ayusin ang pagkukunan ng pera at legal na istruktura",
        "description": "Pagpasyahan kung saan manggagaling ang pera ng proyekto at paano ito pamamahalaan, at itatag nang maayos ang kooperatiba. Ito ang hakbang na may tunay na epektong legal at pampinansiya — magdala ng mga kuwalipikadong propesyonal na susuri sa istruktura at sa bawat kontrata, at huwag pumirma hangga't hindi pa nila nasusuri.",
        "hours": 5,
        "skills": [
          "papeles",
          "pagtutuos"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Makipagtuwang sa mga installer at provider",
        "description": "Maghanap ng mga mapagkakatiwalaang installer o provider, maghambing ng higit sa isang bid, at kumpirmahin nang nakasulat ang warranty at pangmatagalang maintenance. Ang murang install na walang plano sa maintenance ay magastos pagdating ng limang taon.",
        "hours": 3,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Ayusin ang sistema ng bawas sa bill at pagiging miyembro",
        "description": "Linawin nang eksakto kung paano dumadaloy sa mga miyembro ang tipid o bawas sa bill at kung paano gumagana ang pagiging miyembro at ang paglalagay ng pera. Gawin itong malinaw at madaling maintindihan — dapat makita ng isang miyembro, sa isang pahina, kung ano ang inilagay niya at ano ang bumabalik.",
        "hours": 3,
        "skills": [
          "pagtutuos",
          "pagtatala"
        ],
        "follows": [
          3
        ]
      },
      {
        "name": "Turuan ang mga miyembro sa paggamit ng enerhiya",
        "description": "Tulungan ang mga miyembrong basahin ang kanilang bill at bawasan ang konsumo — mas mahalaga ang kilowatt na natipid kaysa kilowatt na nalikha. Samahan ang tipid mula sa solar ng mga simpleng tip sa pagtitipid para makita ng mga sambahayan ang pagbabago sa papel.",
        "hours": 3,
        "skills": [
          "pagtuturo"
        ]
      }
    ]
  },
  {
    "id": "worker-coop-incubator",
    "name": "Incubator ng Kooperatiba ng mga Manggagawa at Kakayahan sa Trabaho",
    "purpose": "Tulungan ang mga kapitbahay na bumuo ng kakayahan sa trabaho at maglunsad ng mga kooperatibang pag-aari ng manggagawa — mga hanapbuhay kung saan ang mga mismong gumagawa ng trabaho ang may-ari ng lugar ng trabaho at siyang nagpapasya.",
    "whoItServes": "Mga kapitbahay na walang trabaho o kulang ang trabaho, at sinumang gustong magkaroon ng tunay na parte sa pinagtatrabahuhan niya.",
    "whatYoullNeed": "Mga mentor na may karanasan sa negosyo at kooperatiba, espasyo at materyales sa pagsasanay, suportang panimula na maituturo mo sa mga bagong venture, at mga pakikipagtuwangan — mga developer ng kooperatiba, mga nagpapahiram na kilala ang co-op, at ang sarili mong programa ng palitan ng kakayahan.",
    "setupHours": 27,
    "defaultCategory": "education",
    "firstSteps": "Magsimula sa mga usapan, hindi sa kurikulum: umupo kasama ang mga interesadong miyembro tungkol sa kaya nilang gawin at gusto nilang buuin, at hanapin ang mga kumpol ng kakayahang kayang maging tunay na venture. Kasabay nito, hanapin ang developer ng kooperatiba sa lugar mo o isang umiiral nang worker co-op na handang mag-mentor — ang mga peklat nila ang syllabus mo, at ang pagtatatag nang wala ang gabay na iyon ang madalas na nakasasakit sa mga grupo.",
    "commonPitfalls": "Dalawa ang pagkabigo nito: bilang programa ng pagsasanay na walang nailulunsad, dahil walang nagtulak sa isang kumpol ng kakayahan patungo sa tunay na venture — o bilang lunsad na lumalaktaw sa mga nakababagot na bahagi, nagtatatag gamit ang na-download na pormang hindi pinag-isipan at natutuklasan ang problema sa pamamahala at buwis pagkalipas ng dalawang taon. Tahimik din itong namamatay kapag hawak ng iisang nag-aayos ang bawat ugnayan sa mga mentor at pagkukunan ng pera; ibahagi ang mga contact na iyon mula sa unang araw.",
    "pairsWith": [
      "skill-share",
      "solidarity-fund",
      "time-bank"
    ],
    "tasks": [
      {
        "name": "Alamin ang mga kakayahan at layunin ng mga miyembro",
        "description": "Umupo kasama ang mga miyembro at alamin ang kaya nilang gawin at gusto nilang buuin. Mga kumpol ang hinahanap mo — tatlong marunong magluto, isang grupong may kakayahan sa konstruksyon, limang mahusay maglinis — dahil ang kumpol ng kakayahan ang binhi ng mabubuhay na kooperatiba.",
        "hours": 4,
        "skills": [
          "pakikipanayam"
        ]
      },
      {
        "name": "Magdaos ng pagsasanay sa trabaho at kakayahan",
        "description": "Magdaos ng mga sesyon sa resume, interview, mga trade, digital na kakayahan, at pag-intindi sa pera. Kunin ang maitutulong ng programa ng palitan ng kakayahan mo at magdala ng mga eksperto mula sa labas para sa hindi kayang ituro ng sinumang taga-rito — ang layunin ay mga miyembrong may kakayahan, magbuo man sila ng co-op o hindi.",
        "hours": 5,
        "skills": [
          "pagtuturo"
        ]
      },
      {
        "name": "Ituro ang modelo ng kooperatiba",
        "description": "Isa-isahin sa mga miyembro ang pagmamay-ari ng manggagawa at demokratikong pamamahala: paano hinahati ang kita, paano nagpapasya, at paano ito naiiba sa karaniwang negosyo. Hindi mapipili ng tao ang modelong hindi pa niya nakikita — gumamit ng mga tunay na co-op bilang halimbawa.",
        "hours": 4,
        "skills": [
          "pagtuturo",
          "pagpapadaloy"
        ]
      },
      {
        "name": "Suportahan ang pagtatatag ng kooperatiba",
        "description": "Kapag handa na ang isang grupo, tulungan silang sumulat ng business plan at pumili ng legal na istruktura. Iugnay sila sa mga abogado at accountant na kilala ang kooperatiba sa halip na mag-improvise sa mga hakbang na legal at sa pagtutuos — magastos baligtarin ang pagtatatag na mali ang gawa.",
        "hours": 5,
        "skills": [
          "papeles"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Iugnay sa mga panimulang mapagkukunan",
        "description": "Bumuo ng buhay na listahan ng mga microloan, grant, pera para sa pagpapaunlad ng kooperatiba, at mga incubator, at tulungan talaga ang mga venture na mag-apply. Nariyan ang karamihan ng pera para sa co-op pero masamang nakakaratula — ang mapa mo nito ay may tunay na halaga.",
        "hours": 3,
        "skills": [
          "pananaliksik"
        ]
      },
      {
        "name": "Magbigay ng mentorship",
        "description": "Ipares ang bawat bagong venture sa isang beteranong ka-kooperatiba o mentor sa negosyo na dumadalaw sa maagang, marupok na yugto. Sa unang taon nabibigo ang mga co-op; binabago ng panatag na mentor na nakakita na ng ganitong pattern ang tsansa.",
        "hours": 3,
        "skills": []
      },
      {
        "name": "Bumuo ng suportahan ng mga venture sa isa't isa",
        "description": "Pagsamahin ang mga venture sa isang network kung saan nagbabahagian ng aral ang mga co-op, nagtuturuan ng suki, at namimili sa isa't isa. Ang mga co-op na bumibili sa isa't isa ay nakaliligtas sa mga pagbagsak na pumapatay sa mga nag-iisa.",
        "hours": 3,
        "skills": [
          "pag-aayos"
        ]
      }
    ]
  },
  {
    "id": "elder-meal-delivery",
    "name": "Pagdalaw at paghahatid ng pagkain sa mga nakatatanda",
    "purpose": "Maghatid ng regular na pagkain at masayang pagdalaw sa mga nakatatandang hindi na nakakalabas ng bahay — mahalaga ang pagkain, at kadalasan mas mahalaga pa ang sampung minutong kuwentuhan sa may pintuan.",
    "whoItServes": "Mga nakatatandang kapitbahay na nag-iisa, hindi makalabas ng bahay, o mahina na ang katawan — at ang mga pamilyang nag-aalala para sa kanila mula sa malayo.",
    "whatYoullNeed": "Mga maaasahang tutulong na nasuri mo na, pagkukunan ng pagkain, plinanong mga ruta, at simpleng mga hakbang pangkaligtasan para sa sandaling walang sumagot sa pinto.",
    "setupHours": 22,
    "defaultCategory": "food",
    "firstSteps": "Magsimula sa pagkukunan ng pagkain at sa unang limang nakatatanda, hindi sa listahan ng pangalan: kausapin ang team ng salo-salo ng komunidad o ilang kapitbahay na handang magluto tungkol sa kaya nilang ihanda nang regular, at tanungin ang mga nag-aasikaso sa mga nakatatanda, nurse ng simbahan, at parmasyutiko kung sino talaga ang madalas walang makain. Suriin ang mga unang tutulong bago ang unang hatid, hindi pagkatapos — nakasalalay ang tiwalang binubuo mo sa kung sino ang papasok sa mga pintuang iyon.",
    "commonPitfalls": "Ang mapanganib na pagkabigo ay ang senyales na hindi napansin — tutulong na binalewala ang pintong walang sumagot dahil walang nagsulat kung ano ang gagawin, o allergy na hindi kailanman nakarating sa papel ng ruta. Ang mabagal na pagkabigo ay ang pabago-bagong dating: inaayos ng mga nakatatanda ang araw nila sa paligid ng pagdalaw, at ang rutang lumalaktaw nang ilang linggo ay nagtuturo sa kanilang huwag umasa sa iyo. Mas mabuti ang limang nakatatandang dinadalaw bawat linggo nang walang palya kaysa dalawampung minsan-minsan lang.",
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
        "name": "Hanapin ang mga nakatatandang nasa bahay lang",
        "description": "Hanapin sila sa mga klinika, programa para sa mga nakatatanda, grupo sa simbahan, at kuwentuhan ng magkakakilala. Gawin itong magalang at laging may pahintulot nila — pagkain at kasama ang inaalok mo, hindi pagmamanman kaninuman.",
        "hours": 3,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Maghanap at suriin ang mga tutulong",
        "description": "Sinusuri ang sinumang papasok sa bahay ng nakatatanda: mga reperensiya at basic na background check, walang palusot kahit kaibigan ng kaibigan. Pagkatapos, hangarin ang tuloy-tuloy na dating — mas mabuti para sa nakatatanda ang parehong pamilyar na mukha sa pinto bawat linggo kaysa palit-palit na tao.",
        "hours": 4,
        "skills": [
          "pag-aayos"
        ]
      },
      {
        "name": "Ayusin ang pagkukunan ng pagkain",
        "description": "Ihanda ang pagkain mula sa lutuang-bayan, mga kapitbahay na handang magluto, o restawran na nagbibigay ng ulam. Bigyang-pansin ang nutrisyon at ang madaling pag-init muli, at lagyan ng label ang bawat lalagyan kung ano ang laman — sugal ang pagkaing walang label para sa taong may allergy.",
        "hours": 4,
        "skills": [
          "pagluluto",
          "kaligtasan ng pagkain"
        ]
      },
      {
        "name": "Iplano ang mga ruta at iskedyul ng hatid",
        "description": "Pagpangkatin ang mga nakatatanda sa maiikling ruta at magtakda ng maaasahang ritmo — parehong mga araw, halos parehong oras. Maglaan ng ilang minutong kuwentuhan nang hindi nagmamadali sa bawat hinto; para sa maraming nakatatanda, iyon ang tunay na hatid.",
        "hours": 3,
        "skills": [
          "pagmamaneho",
          "pag-aayos"
        ],
        "follows": [
          0,
          2
        ]
      },
      {
        "name": "Itala ang diyeta, allergy, at emergency contact",
        "description": "Para sa bawat nakatatanda, itala ang pangangailangan sa pagkain, mga allergy, gamot na may kinalaman sa pagkain, at emergency contact. Ingatan ito at ibahagi lang sa kailangang makaalam — ang allergy ang kailangan ng driver, hindi ang buong kasaysayang medikal.",
        "hours": 3,
        "skills": [
          "pagtatala"
        ]
      },
      {
        "name": "Gumawa ng protocol ng pagsilip sa kalagayan",
        "description": "Isulat nang eksakto ang gagawin ng tutulong kapag walang sumagot o mukhang may sakit ang nakatatanda: sino ang unang tatawagan, kailan isasangkot ang pamilya o mga tagaresponde sa emergency, at paano itatala ang nangyari. Mas mabuti ang napagpasyahan nang maaga kaysa mag-improvise sa may pintuan.",
        "hours": 3,
        "skills": [
          "pagsusulat"
        ],
        "follows": [
          4
        ]
      },
      {
        "name": "Alalayan ang mga tutulong at mangalap ng puna",
        "description": "Kumustahin nang regular ang mga tutulong, magpalit-palit ng ruta kapag may kailangang magpahinga, at tanungin mismo ang mga nakatatanda kung paano pa sila mas matutulungan ng proyekto. May masasabi sila na hindi kailanman nakikita ng mga tutulong.",
        "hours": 2,
        "skills": []
      }
    ]
  },
  {
    "id": "disaster-relief-hub",
    "name": "Sentro ng pamamahagi ng tulong sa sakuna",
    "purpose": "Magtayo ng sentro na kayang tumanggap, magbukod, at maghatid ng mga suplay nang mabilis kapag tumama ang sakuna — dahil sa logistics nananalo o natatalo ang mga unang araw pagkatapos ng baha o sunog.",
    "whoItServes": "Mga kapitbahay na tinamaan ng baha, bagyo, sunog, at iba pang sakuna — simula sa mga pinakahirap umalis ng bahay o maghintay.",
    "whatYoullNeed": "Lugar na napagkasunduan nang maaga na may backup, mga daluyan ng suplay, team ng mga tutulong na handang dumating agad, at koordinasyon sa ugnayan sa paghahanda sa sakuna — halos lahat ay inaayos bago ang anumang sakuna, dahil huli na ang lahat pagkatapos.",
    "setupHours": 24,
    "defaultCategory": "organizing",
    "suggestsWorkDays": true,
    "firstSteps": "Matagal nang buhay sa papel ang sentro bago ito tumayo sa isang paradahan, kaya magsimula sa ugnayan sa paghahanda sa sakuna — sila ang may hawak ng contact tree at ng larawan ng panganib — at sa tapat na tanong kung aling gusali talaga ang magpapapasok sa iyo nang alas-sais ng umaga pagkatapos ng baha. Ayusin muna ang kasunduan sa lugar at ang backup; nakasalalay sa isang address ang lahat ng ibang gawain.",
    "commonPitfalls": "Nabibigo ang mga sentro ng tulong sa dalawang direksyon: ang sentrong plano lang na walang nag-ensayo, kaya nauubos ang unang araw ng totoong sakuna sa mga tanong na nasagot sana ng isang practice run — at ang sentrong nagbukas ng pinto sa bahang donasyon na hindi nito kayang bukurin, kaya nagiging bodega ng damit na walang silbi habang tubig ang kailangan ng mga tao. Ang mas tahimik na pinsala ay pamamahaging may harang: sa sandaling kailangang patunayan ng isang tao na karapat-dapat siya sa tulong, naibalik mo na ang sistemang nilayon mong lampasan.",
    "pairsWith": [
      "emergency-preparedness",
      "resource-hub-dispatch"
    ],
    "learnMore": [
      "internet-outage"
    ],
    "tasks": [
      {
        "name": "Pumili nang maaga ng lugar ng sentro at backup",
        "description": "Maghanap ng gusali o lote na kayang tumanggap ng deliveries, pagbukuran ng mga gamit, at paglagyan ng pila ng pamamahagi — dagdag pa ang backup kung masira o hindi mapuntahan ang una. Kumpirmahin ngayon ang access at mga susi sa mga may-ari, habang maganda ang panahon; ang lugar na hindi mo mapasok ay hindi lugar.",
        "hours": 3,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Buuin ang mga daluyan ng suplay",
        "description": "Ayusin nang maaga kung saan manggagaling ang tubig, pagkain, pang-hygiene, at mga panlinis — mga supplier, kapartner na grupo, pangangalap ng donasyon. Kasinghalaga: paraan para malaman kung ano talaga ang kailangan ng mga tao pagkatapos ng sakuna, para hindi ka matabunan ng maling mga gamit.",
        "hours": 4,
        "skills": [
          "pakikipag-ugnayan",
          "pag-aayos"
        ]
      },
      {
        "name": "Ayusin ang pagtanggap, pagbubukod, at imbentaryo",
        "description": "Idisenyo kung paano tinatanggap, binubukod, at sinusubaybayan ang mga donasyon mula sa sandaling dumating ang truck. Bawat sentrong nalunod sa gamit na hindi nabukod, nilaktawan ang hakbang na ito — pagpasyahan ang mga kategorya, label, at simpleng bilangan bago mo pa kailanganin.",
        "hours": 4,
        "skills": [
          "pag-aayos",
          "pagtatala"
        ]
      },
      {
        "name": "Gumawa ng sistema ng pamamahagi",
        "description": "Iplano kung paano lalabas ang mga suplay: pantay at walang harang — walang tseke ng ID, walang patunay ng pangangailangan — na may hatid sa bahay para sa mga hindi makarating sa sentro. Unahin ang mga pinakananganganib, at isulat ang prayoridad na iyan para makaligtas ito sa kaguluhan.",
        "hours": 3,
        "skills": [
          "pagmamaneho",
          "pag-aayos"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Maghanap at magsanay ng team na handang dumating agad",
        "description": "Bumuo ng listahan ng mga taong kayang kumilos sa maikling abiso, at sanayin sila nang maaga sa kanilang papel, mga patakaran sa kaligtasan, at sa sistema mo ng pagtanggap at pamamahagi. Mas malakas ang sanay na team na labindalawa kaysa mabuting-loob na limampung hindi pa handa.",
        "hours": 4,
        "skills": [
          "pagtuturo"
        ]
      },
      {
        "name": "Makipag-ugnayan sa ibang tumutugon",
        "description": "Ipakilala ang sentro sa mga opisyal na ahensya sa emergency at sa iba pang grupong tumutulong bago pa mangyari ang anuman. Pagkasunduan kung sino ang bahala saan, para pinupunan mo ang mga puwang sa halip na nagdodoble — pinakamabilis ang tulungan mismo kung saan pinakamabagal ang opisyal na pagtugon.",
        "hours": 3,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Iplano ang komunikasyon at kaligtasan",
        "description": "Magplano para sa pagbagsak ng mga network: mga offline na paraan ng pagkontak, nakaprint na listahan, at koneksyon sa contact tree ng ugnayan sa paghahanda sa sakuna. Magtakda ng mahihigpit na patakaran sa kaligtasan ng mga tutulong — walang papasok sa delikadong istruktura, kailanman — at isulat ang mga ito.",
        "hours": 3,
        "skills": [
          "pagsusulat"
        ]
      }
    ]
  },
  {
    "id": "recovery-peer-support",
    "name": "Network ng suporta ng kapwa sa recovery",
    "purpose": "Magpatakbo ng suportang hawak ng mga kapwa nakaranas para sa mga kapitbahay na nasa recovery o nag-iisip nang tumigil sa alak o droga — karagdagan sa propesyonal na paggamot, hindi kailanman kapalit nito.",
    "whoItServes": "Mga taong nasa recovery, mga nag-iisip pa lang, at ang mga pamilya at kaibigang sumasabay sa kanilang paglalakbay.",
    "whatYoullNeed": "Mga facilitator na kapwa dumaan sa recovery at may tunay na pagsasanay, ligtas at pribadong lugar, mga daanan ng referral, at mga hangganang sinabi nang tuwiran: karagdagan ang suporta ng kapwa sa propesyonal na paggamot, hindi kapalit nito; hindi mga tagapagbigay ng lunas na medikal ang mga facilitator at hindi sila kailanman dapat magpayo tungkol sa detox o gamot; at laging may malinaw na plano para maiugnay ang sinumang nasa krisis sa kuwalipikadong propesyonal o pang-emergency na tulong.",
    "setupHours": 22,
    "defaultCategory": "emotional_support",
    "firstSteps": "Magsimula sa mga taong hahawak ng silid: maghanap ng isa o dalawang kapitbahay na may matatag na karanasan ng sariling recovery, ipasok sila sa pormal na pagsasanay sa suporta ng kapwa, at magkasamang isulat ang saklaw — kung ano ang network na ito at kung ano ang hindi — bago mag-anunsyo ng kahit ano. Pagkatapos, personal na puntahan ang mga lokal na programa ng paggamot at mga tanggapang pangkrisis, para maging relasyon ang daanan ng referral mo, hindi numerong nakasulat sa flyer.",
    "commonPitfalls": "Nagiging mapanganib ito kapag lumabo ang linya — facilitator na mabuti ang loob pero nagpapayo tungkol sa detox o gamot, na puwedeng makamatay, o grupong dumudulas sa amateur na panggagamot dahil hindi kailanman naging totoo ang daanan ng referral. Tahimik itong nabibigo sa nasirang kumpidensiyalidad — isang kuwentong nakalabas at wala nang babalik sa silid — at sa pagkaupos ng facilitator, kapag ang taong may hawak ng recovery ng lahat ay walang suporta para sa sarili niya.",
    "pairsWith": [
      "mental-health-peer-support",
      "harm-reduction-supplies"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Maghanap at magsanay ng mga facilitator na kapwa",
        "description": "Maghanap ng mga taong may sariling karanasan ng recovery at ipadaan sila sa kinikilalang pagsasanay sa peer-recovery support. Linawin mula sa unang usapan: kapwa ang mga facilitator, hindi tagapagbigay ng lunas na medikal o klinikal, at ang pagsasanay ang nag-iingat sa linyang iyan.",
        "hours": 5,
        "skills": [
          "pagpapadaloy",
          "pagtuturo"
        ]
      },
      {
        "name": "Isulat ang saklaw at mga hangganan",
        "description": "Isulat kung ano ang ginagawa ng network — suporta ng kapwa, ugnayan, pagpapalakas ng loob — at kung ano ang hindi: paggamot, detox, lunas na medikal, payo tungkol sa gamot. Ang nakasulat na saklaw ang nagsasanggalang sa mga miyembro laban sa maling payo at sa mga facilitator laban sa pagpasan ng hindi kanila.",
        "hours": 3,
        "skills": [
          "pagsusulat"
        ]
      },
      {
        "name": "Buuin ang mga daanan ng referral at pangkrisis",
        "description": "Bumuo ng gumaganang relasyon sa mga propesyonal na programa ng paggamot, lunas na medikal, at tanggapang pangkrisis, at isulat ang plano ng pagtugon sa overdose. Kapag may nasa silid na nangangailangan nang higit sa kayang ibigay ng kapwa, ang paglilipat ay dapat mainit na tawag, hindi polyeto.",
        "hours": 4,
        "skills": [
          "pakikipag-ugnayan",
          "pananaliksik"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Maghanap ng ligtas, pribado, at malinis na lugar",
        "description": "Maghanap ng silid na kumpidensiyal, malugod, at malaya sa paghuhusga at sa alak o droga — lugar na puwedeng pasukin ng tao nang hindi ipinagkakalat ang anuman. Puwede ang mga aklatan, silid ng komunidad, at espasyo ng simbahan na may hiwalay na pasukan.",
        "hours": 2,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Itakda ang kumpidensiyalidad at mga alituntunin ng grupo",
        "description": "Pagkasunduan ang mga batayang tuntunin: ang sinabi rito ay dito lang, respeto nang walang pamimilit ng payo, at karapatan ng bawat isa na magbahagi o lumaktaw. Ulitin ang mga ito nang malakas sa simula ng bawat pagtitipon — nagsasanggalang lang ang mga alituntunin habang sariwa ang mga ito.",
        "hours": 3,
        "skills": [
          "pagpapadaloy"
        ]
      },
      {
        "name": "Mag-iskedyul at magpaalam ng mga pagtitipon",
        "description": "Mag-alok ng higit sa isang oras ng pagtitipon para makadalo ang mga magulang at nagtatrabaho nang shift, at ikalat sa simple at walang-batikos na pananalita — libre, bukas, walang kailangang patunayan. Ang salita ng flyer ang nagpapasya kung sino ang mararamdamang ligtas dumating.",
        "hours": 3,
        "skills": [
          "pakikipag-ugnayan"
        ],
        "follows": [
          3
        ]
      },
      {
        "name": "Alalayan ang mga facilitator laban sa pagkaupos",
        "description": "Kumustahin nang regular ang mga facilitator, magpalitan kung sino ang nangunguna, at siguraduhing may sarili silang suporta — mabigat na gawain ang paghawak ng espasyo para sa recovery, at laging nauuna ang sariling recovery ng facilitator.",
        "hours": 2,
        "skills": [
          "pakikinig"
        ]
      }
    ]
  },
  {
    "id": "community-fitness",
    "name": "Mga grupong pang-ehersisyo at wellness ng komunidad",
    "purpose": "Pakilusin nang magkakasama ang magkakapitbahay nang libre — lakadan, unatan, larong pick-up, sayawan — dahil ang ginhawa ng katawan ay hindi dapat nangangailangan ng gym membership.",
    "whoItServes": "Sinumang gustong kumilos, lalo na ang mga kapitbahay na hindi abot ang gym, mga nakatatanda, at mga nag-iisang tao na para sa kanila ang kasama ay kasinghalaga ng ehersisyo.",
    "whatYoullNeed": "Mga tutulong na mangunguna sa aktibidad, ligtas at abot ng lahat na mga espasyo, at kaunting-kaunting kagamitan. Mas mahalaga ang malugod at walang-pressure na estilo kaysa mga kredensyal — pero sinumang mangunguna sa mabigat na pisikal na aktibidad ay dapat may kuwalipikasyon para rito, at bawat session ay may tubig, warm-up, at first-aid kit na abot-kamay.",
    "setupHours": 19,
    "defaultCategory": "other",
    "firstSteps": "Bago ka mag-iskedyul ng kahit ano, tanungin ang mga taong inaasahan mong darating kung ano talaga ang magugustuhan nila — lakadan, unatan nang nakaupo, gabi ng sayawan — at kung ano ang kaya ng katawan nila; ang mga sagot ang dapat pumili ng mga aktibidad, hindi ang kabaligtaran. Pagkatapos, maghanap ng isa o dalawang mangunguna na ang init ng pakikitungo ay mas mabigat pa sa kanilang galing, sabay na lakarin ang mga posibleng espasyo, at magsimula sa iisang maaasahang lingguhang session bago magdagdag.",
    "commonPitfalls": "Dalawa ang ikinamamatay nito: nagiging palabas ito — ang pinakamalalakas na miyembro ang nagtatakda ng bilis, dumudulas ang usapan sa timbang at itsura, at tahimik na tumitigil sa pagdating ang mismong mga taong para sa kanila ito — o nagiging pabago-bago ito, dahil walang mas mabilis pumatay sa lakadan kaysa dalawang beses na pagdating sa session na kanselado pala. Ang paglaktaw sa nakababagot na batayan ng kaligtasan ang pangatlo: walang warm-up, walang tubig, walang first-aid kit, at isang masamang pagkadapa ang tatapos sa lahat.",
    "pairsWith": [
      "disability-support-network",
      "neighborhood-care-network"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Alamin ang mga gusto at antas ng lakas",
        "description": "Magtanong-tanong — sa laundry shop, sa tirahan ng mga nakatatanda, sa gate ng eskuwelahan — kung anong klaseng pagkilos ang gusto ng mga tao at kung ano ang kaya nila. Hayaang manguna ang mga sagot: walang natutulungan ang listahan ng mga larong walang humingi.",
        "hours": 2,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Maghanap ng mga mangunguna sa aktibidad",
        "description": "Maghanap ng mga tutulong na mangunguna sa lakadan, unatan, sayawan, o larong pick-up. Para sa karamihan ng aktibidad, mas mahalaga ang malugod at walang-pressure na estilo kaysa galing — pero sinumang mangunguna sa mabigat na pisikal na aktibidad ay dapat may angkop na kuwalipikasyon.",
        "hours": 3,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Maghanap ng ligtas na mga espasyo",
        "description": "Magtanong tungkol sa mga parke, bulwagan ng komunidad, at gym ng eskuwelahan — libre o mura, at mararating nang walang sasakyan. Suriin ang bawat espasyo para sa iba't ibang katawan at kakayahan: patag na lupa, upuan, lilim, banyo, at masisilungan kung biglang umulan.",
        "hours": 3,
        "skills": []
      },
      {
        "name": "Magplano ng programang bukas sa lahat ng antas",
        "description": "Idisenyo ang bawat aktibidad para makasali ang tao sa sarili niyang bilis at malayang mag-iba — may opsyong nakaupo sa unatan, may maikling ikot sa loob ng mahabang lakad. Panatilihin ang diin sa ginhawa, pagkilos, at pagsasama, hindi kailanman sa itsura o galing.",
        "hours": 3,
        "skills": []
      },
      {
        "name": "Asikasuhin ang kaligtasan at kalusugan",
        "description": "Ilagay ang warm-up at pag-inom ng tubig sa bawat session, maglaan ng kumpletong first-aid kit, at imungkahi sa mga bago pa lang sa ehersisyo na kumonsulta muna sa doktor. Turuan ang mga nangunguna na bantayan ang sobrang pagod at gawing normal ang pagbagal para walang mailang.",
        "hours": 3,
        "skills": [
          "paunang lunas"
        ]
      },
      {
        "name": "Magtakda ng iskedyul at ikalat ang balita",
        "description": "Pumili ng mga oras na hindi nagbabago para makabuo ng ugali ang mga tao, at panindigan ang mga ito. Ikalat nang malawak — mga flyer, group chat, kuwentuhan — at sabihin nang tahasan na malugod ang lahat ng edad, laki, at kakayahan, dahil maraming nag-aakalang hindi sila kasali.",
        "hours": 3,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Palalimin ang pagsasamahan at tuloy-tuloy na dating",
        "description": "Gawing masaya at magaan ang mga session: mga pangalang natatandaan, mga bagong dating na binabati, ilang minutong kuwentuhan sa iskedyul. Ipagdiwang ang pagdating mismo, hindi anumang sukatan — ang ugnayan ang nagpapabalik sa mga tao matapos maglaho ang pagiging bago nito.",
        "hours": 2,
        "skills": [
          "pagpapadaloy"
        ]
      }
    ]
  },
  {
    "id": "urban-orchard",
    "name": "Halamanan ng punong namumunga at gubat ng pagkain",
    "purpose": "Magtanim ng mga punong namumunga at pinagkukunan ng nuts at mga pangmatagalang halamang pagkain sa lupang pinagsasaluhan — isang gubat ng pagkain na, kapag lumago na, libreng magpapakain sa kapitbahayan nang ilang dekada.",
    "whoItServes": "Ang buong komunidad, pati ang mga kapitbahay na hindi pa dumarating — ang mga punong itinanim ngayong taon ay magiging pangmatagalang pagkukunan ng libre at sariwang pagkain para sa lahat.",
    "whatYoullNeed": "Pangmatagalang karapatan sa lupa (hindi sapat para sa mga puno ang kasunduang pana-panahon lang), mga puno at halamang angkop sa klima, mga tutulong para sa mga araw ng pagtatanim, at maliit na pangkat ng mga mag-aalaga na nakatalaga nang ilang taon, hindi ilang buwan. Kumpirmahin ang daanan ng tubig bago itanim ang kahit ano.",
    "setupHours": 21,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Nauuna sa lahat ang usapan tungkol sa lupa: kausapin ang mga land trust, ang tanggapan ng mga parke, mga simbahang may lupang hindi ginagamit — sinumang kayang magtalaga ng lugar nang isang dekada, hindi isang panahon ng taniman — at kumpirmahin na rin ang tubig habang nandiyan ka. Kasabay nito, maghanap ng isang taong may tunay na karanasan sa punong namumunga para hawakan ang disenyo, at tanungin ang mga kapitbahay kung ano talaga ang pipitasin at kakainin nila, dahil ang halamanan ng prutas na walang may gusto ay pagpapakain lang sa mga putakti.",
    "commonPitfalls": "Bihirang mabigo ang halamanan sa araw ng pagtatanim — sa ikalawa at ikatlong taon ito nabibigo, kapag wala na ang maraming tao at walang nag-ayos ng pagdidilig, kaya tahimik na namamatay ang mga batang puno sa unang tuyot na tag-init nila. Ang iba pang pumapatay ay ang marurupok na kasunduan sa lupa na binabawi sa mismong pagsisimulang mamunga ng mga puno, at ang awayan sa anihan dahil walang napagkasunduang paghahatian bago ang unang malaking ani. Ayusin nang maaga ang salitan ng pag-aalaga at ang mga tuntunin ng paghahati, habang madali pa.",
    "pairsWith": [
      "community-garden",
      "gleaning-network",
      "seed-library"
    ],
    "tasks": [
      {
        "name": "Siguraduhin ang pangmatagalang karapatan sa lupa",
        "description": "Kumuha ng matibay na nakasulat na kasunduan — mahabang upa sa lupa, kaayusan sa land trust, pormal na pangako ng lungsod — dahil mga dekada ang kailangan ng puno, hindi kasunduang pana-panahon lang. Kumpirmahin ang maaasahang daanan ng tubig sa lugar bago pumirma ng kahit ano.",
        "hours": 5,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Iplano ang disenyo ng taniman",
        "description": "Pumili ng mga uring angkop sa klima ninyo at idisenyo sa mga patong ng gubat ng pagkain: matataas na puno, mga palumpong, at mga halamang panakip sa lupa na nagtutulungan. Isaalang-alang ang mga kapareha sa polinasyon at ang pagitang kakailanganin ng mga punong malaki na, hindi ang laki ng itatanim na supang.",
        "hours": 4,
        "skills": [
          "paghahalaman"
        ]
      },
      {
        "name": "Humanap ng mga puno at halaman",
        "description": "Ihanda ang mga puno at halaman mula sa mga nursery, grant, donasyon, at pana-panahong bentahan ng bare-root — ang bare-root at batang mga puno ay bahagi lang ng halaga ng malalaking nakapaso at kadalasang mas mahusay mag-ugat. Umorder nang maaga; nauubos ang magagandang uri.",
        "hours": 3,
        "skills": []
      },
      {
        "name": "Ihanda ang lugar",
        "description": "Ihanda ang lupa bago dumating ang mga puno: pagbutihin ang lupa, maglatag ng mulch, ayusin ang pagdidilig, at markahan at linisin ang bawat tamnan ayon sa disenyo. Ang handang lugar ang gumagawa sa araw ng pagtatanim mula kaguluhan tungo sa maayos na daloy.",
        "hours": 4,
        "skills": [
          "paghahalaman"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Magtakda ng mga araw ng pagtatanim",
        "description": "Magsagawa ng bayanihan sa pagtatanim na may malinaw na paliwanag, para maitanim ang bawat puno sa tamang lalim na may sabakan ng tubig at mulch — ang punong mali ang tanim ay dahan-dahan at di-halatang namamatay. Gawin itong masaya; ang araw ng pagtatanim ang simula ng pag-angkin ng kapitbahayan sa halamanan.",
        "hours": 5,
        "skills": [
          "paghahalaman"
        ],
        "follows": [
          3
        ],
        "recurringCadence": "cycle"
      },
      {
        "name": "Ayusin ang pangmatagalang pag-aalaga",
        "description": "Ayusin ang di-kaakit-akit na trabahong magpapasya kung mabubuhay ang halamanan: pagdidilig sa mga batang puno sa kanilang mga unang tag-init, pagpuputol ng sanga, pagmu-mulch, at pagsugpo ng peste, taon-taon. Mas matibay ang salitan ng mga may pangalang nakatalaga kaysa mahabang listahan ng malabong makakatulong.",
        "hours": 3,
        "skills": [
          "paghahalaman"
        ]
      },
      {
        "name": "Iplano ang paghahati ng ani",
        "description": "Pagkasunduan ang mga tuntunin sa pagpitas at paghahati bago ang unang malaking ani, hindi pagkatapos ng unang awayan — sino ang mamimitas, kailan, at gaano karami. Idaan ang sobra sa mga community fridge, pantry, at salo-salo para walang mabubulok sa sanga.",
        "hours": 2,
        "skills": []
      }
    ]
  },
  {
    "id": "new-parent-support",
    "name": "Network ng suporta sa mga bagong magulang",
    "purpose": "Balutin ng praktikal na suporta ang mga bago at magiging magulang — pagkaing nasa may pintuan, mga naasikasong lakad, hinugasang pinggan, at mga kapwa magulang na dumaan na roon — sa buong pagbubuntis at sa mahihirap na linggo pagkapanganak.",
    "whoItServes": "Mga bago at magiging magulang, lalo na ang malayo sa pamilya — ang mga linggo pagkapanganak ang panahong pinakamahalaga ang suporta at kadalasang pinakakulang.",
    "whatYoullNeed": "Mga tutulong na kayang magluto, mag-asikaso ng lakad, at makinig; sistema ng hatiran ng pagkain; direktoryo ng mga mapagkukunan; at mga may karanasang magulang bilang kaagapay na kapwa. Ang suporta ng kapwa ay hindi lunas na medikal o pangkalusugan ng isip — karaniwan at seryoso ang mga postpartum mood disorder, kaya dapat alam ng bawat kaagapay ang mga senyales at kung paano marahang iugnay ang magulang sa propesyonal na tulong. At suriin ang sinumang papasok sa bahay o tutulong sa sanggol bago niya gawin ang alinman.",
    "setupHours": 21,
    "defaultCategory": "childcare",
    "firstSteps": "Magsimula sa pagtatanong sa mga magulang na nanganak nitong nakaraang taon kung ano sana talaga ang nakatulong — ang mga sagot (pagkaing walang kasamang pagbisita, may hahawak sa sanggol habang naliligo sila) ay mas tiyak kaysa inaakala mo. Ipakilala ang network sa mga midwife, doula, at klinikang pambata na puwedeng mag-alok nito sa mga pamilya, kumuha ng dalawa o tatlong may karanasang magulang bilang mga unang kaagapay, at ayusin ang pamamaraan mo ng pagsusuri bago may tumawid ng kahit isang pintuan.",
    "commonPitfalls": "Ang klasikong pagkabigo ay suportang ang pinaglilingkuran ay ang tumutulong: mga dumarating sa sarili nilang iskedyul, nagtatagal nang sobra, at nagbibigay ng opinyon sa pagpapalaki ng anak sa halip na maghugas ng pinggan — tahimik na titigil sa pagbubukas ng pinto ang pagod na magulang kaysa sabihin ito. Ang mas mabigat: kaagapay na hindi napansin ang mga senyales ng postpartum depression dahil walang nagsanay sa kanyang kilalanin ito o nagbigay ng mga salitang pantawag dito. At ang suportang naglalaho pagkatapos ng dalawang linggo, sa mismong pagtigil ng hatirang ulam at pagsisimula ng mahirap na bahagi, ay hindi talaga suporta.",
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
        "name": "Maghanap ng mga tutulong at kaagapay na kapwa",
        "description": "Tipunin ang mga magluluto, mag-aasikaso ng lakad, at — pinakamahalaga — mga may karanasang magulang na handang maging kaagapay. Ang magulang na naaalala ang sarili niyang ikatlong linggong puyat ay may maibibigay na hindi kayang ibigay ng anumang polyeto.",
        "hours": 3,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Ayusin ang sistema ng hatiran ng pagkain",
        "description": "Gumawa ng simpleng paraan para pag-ugnayin ang mga hatid na pagkain sa mga linggo pagkapanganak: pinagsasaluhang kalendaryo, mga pangangailangan sa pagkain at allergy na minsanang tinatanong, pagkaing may label at madaling initin. Ang pag-iwan sa may pintuan ang dapat na pangunahing paraan — hindi kailanman dapat magpilit ng pagbisita ang isang pagkain.",
        "hours": 3,
        "skills": [
          "pagluluto",
          "pag-aayos"
        ]
      },
      {
        "name": "Mag-alok ng praktikal na tulong",
        "description": "Ayusin ang mga tutulong para sa di-kaakit-akit na pasanin: mga lakad, labada, hugasan, at pagbabantay sa mga nakatatandang kapatid para makapagpahinga ang magulang o makarating sa appointment. Itanong tuwing dadalaw kung ano ang kailangan sa halip na ipagpalagay — sumusunod ang kapaki-pakinabang na tulong sa listahan ng magulang, hindi sa listahan ng tumutulong.",
        "hours": 3,
        "skills": [
          "pag-aalaga ng bata"
        ]
      },
      {
        "name": "Buuin ang direktoryo ng mga mapagkukunan",
        "description": "Tipunin ang mga lokal na suporta sa pagpapasuso, kalinga sa postpartum na kalusugan ng isip, klinikang pambata, at pagkukunan ng gamit ng sanggol — pati ang bangko ng diaper at ang tulungan sa pag-aalaga ng bata kung pinapatakbo ng komunidad ninyo. Panatilihin itong napapanahon; mas masama pa sa wala ang direktoryo ng mga patay na numero.",
        "hours": 4,
        "skills": [
          "pagtatala"
        ]
      },
      {
        "name": "Bumuo ng mga bilog ng kapwa magulang",
        "description": "Magsimula ng maliliit na grupo kung saan puwedeng maging tapat ang mga bagong magulang kung gaano ito kahirap, na may may-karanasang magulang na humahawak ng espasyo. Sanayin ang mga kaagapay sa mga senyales ng postpartum depression at pagkabalisa at sa marahan pero matiyagang paghikayat tungo sa propesyonal na kalinga — hindi kailanman nagdadayagnos, hindi kailanman naghihintay.",
        "hours": 3,
        "skills": [
          "pagpapadaloy"
        ]
      },
      {
        "name": "Itakda ang kaligtasan at mga hangganan",
        "description": "Suriin ang bawat tutulong na papasok sa bahay o hahawak sa sanggol — mga reperensiya man lang — at isulat ang mga hangganan: ang magulang ang nagtatakda ng kundisyon, maikli ang mga pagbisita maliban kung inimbitahang tumagal, at walang darating nang walang pasabi. Hindi kailanman dapat maramdamang pagmamanman ang suporta.",
        "hours": 3,
        "skills": []
      },
      {
        "name": "Iugnay sa ibang mga proyekto",
        "description": "Iugnay ang mga pamilya sa bangko ng diaper, sa tulungan sa pag-aalaga ng bata, at sa team ng pagsalubong para ang isang kausap ay nagbubukas ng lahat ng ito. Hindi dapat kailangang tuklasin ng bagong magulang ang bawat programa nang isa-isa sa pinakapagod na sandali ng buhay niya.",
        "hours": 2,
        "skills": [
          "pakikipag-ugnayan"
        ]
      }
    ]
  },
  {
    "id": "foster-kinship-support",
    "name": "Network ng suporta sa mga foster at kamag-anak na nag-aalaga",
    "purpose": "Tumayo sa likod ng mga pamilyang foster, kamag-anak na nag-aalaga, at iba pang tagapag-alaga — damit at higaan kapag dumating ang bata nang magdamag, pahinga kapag ubos na ang mga nag-aalaga, at mga kapwa na nakakaintindi sa gawaing ito.",
    "whoItServes": "Mga foster na magulang, mga lolo't lola at kamag-anak na nagpapalaki ng mga bata — ang mga kamag-anak na nag-aalaga ay madalas nagsisimula sa isang tawag at ilang oras na abiso lang — at ang mga batang inaalagaan nila.",
    "whatYoullNeed": "Mga tutulong, donasyong gamit sa bawat edad at sukat, mga aalalay para sa pahinga, at ugnayan sa mga ahensya at eskuwelahan. Ang gawaing may kinalaman sa mga batang nasa kalinga ay sensitibo at saklaw ng batas: suriin ang lahat ng makakasalamuha ng mga bata, sundin nang buong-buo ang mga tuntunin ng mandatory reporting at kumpidensiyalidad, at makipag-ugnayan sa mga kaukulang ahensya sa halip na lampasan sila.",
    "setupHours": 24,
    "defaultCategory": "childcare",
    "firstSteps": "Magsimula sa pag-upo kasama ang lokal na ahensya ng foster care o programa ng paggabay sa mga kamag-anak na nag-aalaga: alamin ang mga tuntuning sumasaklaw sa gawaing ito — pagsusuri, mandatory reporting, kumpidensiyalidad — bago ka kumuha ng kahit isang tutulong, at hayaan silang sabihin kung saan talaga ang mga puwang. Pagkatapos, tanungin ang ilang pamilyang nag-aalaga kung ano ang kinailangan nila sa unang linggo at sa unang taon; buuin ang tugon sa mga sagot na iyon, hindi ang bodega ng mga gamit na walang humingi.",
    "commonPitfalls": "Puwedeng mabigo ang proyektong ito nang maingay o tahimik. Maingay: tutulong na hindi nasuri na nakakasalamuha ng mga bata, o kuwento ng pamilyang naibahagi nang walang pahintulot — kaya ng alinman na masaktan ang bata, matapos ang pag-aalaga, at wakasan ang proyekto sa isang araw. Tahimik: bundok ng donasyong hindi nabukod habang tatlong linggong naghihintay ang nag-aalaga sa higaan ng maliit na bata, o pagturing sa mga ahensya bilang kalaban hanggang tumigil silang ituro ang mga pamilya sa inyo. Ang maliit, nasuri, at magkaugnay ay laging nananalo rito laban sa malaki pero improvisado.",
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
        "name": "Makipag-ugnayan sa mga pamilyang nag-aalaga",
        "description": "Abutin ang mga pamilyang nag-aalaga sa pamamagitan ng mga ahensya, eskuwelahan, at grupo sa simbahan — lalo na ang mga kamag-anak na nag-aalaga, na madalas tumatanggap ng apo o pamangkin nang magdamag nang walang paghahanda at kaunting opisyal na suporta. Gawing alok ang unang pakikipag-ugnayan, hindi kailanman pagsusuri.",
        "hours": 3,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Bumuo ng suplay ng mga gamit at damit",
        "description": "Mangalap ng damit, higaan, car seat, at pang-araw-araw na gamit sa buong hanay ng edad at sukat, dahil bihirang alam ng mga nag-aalaga kung sino ang darating hanggang dumating sila. Suriing mabuti ang mga gamit pangkaligtasan — may expiration date at listahan ng recall ang mga car seat at kuna.",
        "hours": 4,
        "skills": [
          "pag-aayos"
        ]
      },
      {
        "name": "Gumawa ng sistemang mabilis tumugon",
        "description": "Mag-impake ng mga handang-hatid na bag — ilang araw na damit, mga pampaligo, at gamit na pampalubag-loob tulad ng stuffed toy — na nakabukod ayon sa edad at sukat, at naihahatid sa loob ng ilang oras mula sa bagong paglipat ng bata. Ang batang dumating nang walang dala ay hindi dapat maghintay ng isang linggo para magkaroon ng sariling gamit.",
        "hours": 3,
        "follows": [
          1
        ],
        "skills": []
      },
      {
        "name": "Ayusin ang suporta para sa pahinga",
        "description": "Ayusin ang ligtas at nasuring pag-aalaga para makapagpahinga ang mga nag-aalaga, makarating sa mga appointment, o makahinga lang — ang pagkaupos ng tagapag-alaga ang isa sa mga pangunahing dahilan ng pagkasira ng pag-aalaga. Makipag-ugnayan sa mga ahensya kung sino ang puwedeng mag-alaga bilang pamalit at sa ilalim ng anong mga tuntunin.",
        "hours": 4,
        "skills": [
          "pag-aalaga ng bata"
        ]
      },
      {
        "name": "Mag-alok ng mga grupo ng suporta ng kapwa",
        "description": "Magdaos ng regular na pagtitipon kung saan makakapagpalitan ng karanasan at tapat na payo ang mga foster at kamag-anak na nag-aalaga kasama ang mga taong nakakaintindi — nakakapag-isa ang gawaing ito, at baka ang nag-aalagang tatlong kanto ang layo ay mag-isang pasan ang parehong bigat.",
        "hours": 3,
        "skills": [
          "pagpapadaloy"
        ]
      },
      {
        "name": "Buuin ang direktoryo ng mga mapagkukunan",
        "description": "Tipunin ang mga programa, benepisyo, at suportang may pag-unawa sa trauma na mahihingan ng mga pamilyang nag-aalaga, at tulungan silang lakbayin ang mga sistemang nakakalito kahit sa mga propesyonal. Ang mga kamag-anak na nag-aalaga lalo na ay madalas kuwalipikado sa tulong na walang nagsabi sa kanila kahit kailan.",
        "hours": 3,
        "skills": [
          "pagtatala"
        ]
      },
      {
        "name": "Itakda ang kaligtasan ng bata at pagkapribado",
        "description": "Isulat at sundin ang mga hindi mababali: pagsusuri sa sinumang makakasalamuha ng mga bata, ang hinihingi ng batas ng mandatory reporting sa mga tutulong ninyo, at mahigpit na pagkapribado para sa mga pamilya at bata — walang litrato, walang kuwento, walang detalyeng ibinabahagi nang walang pahintulot.",
        "hours": 4,
        "skills": [
          "pagsusulat"
        ]
      }
    ]
  },
  {
    "id": "weather-survival-outreach",
    "name": "Pag-abot ng tulong sa matinding lamig at init",
    "purpose": "Iabot ang mga gamit na pantawid-buhay sa mga kapitbahay na walang tirahan kapag naging nakamamatay ang panahon — mga kumot at hand warmer sa matinding lamig, tubig at electrolyte sa matinding init — dala-dala papunta mismo sa kinaroroonan ng mga tao.",
    "whoItServes": "Mga kapitbahay na walang tirahan at namumuhay sa lansangan na tinatamaan ng matinding panahon — ang mga taong para sa kanila ang matinding init o lamig ay banta sa buhay, hindi abala lang.",
    "whatYoullNeed": "Mga suplay na akma sa panahon, mga tutulong na aabot sa mga tao, plinanong mga ruta, at napapanahong ugnayan sa mga shelter at programa. Pumapatay ang matinding init at lamig: dapat sanay ang bawat tutulong na makilala ang hypothermia at heat stroke at tumawag agad ng propesyonal na tulong medikal — hindi kailanman mag-antay-antay muna.",
    "setupHours": 24,
    "defaultCategory": "mutual_aid_drive",
    "firstSteps": "Bago ka bumili ng kahit isang kumot, kausapin ang mga manggagawa at grupong matagal nang naglalakad sa mga rutang ito — sila ang may hawak ng tiwala at ng kaalaman kung saan talaga ang mga tao, at sasabihin nila kung ano na ang sakop at kung ano ang kulang. Pagkasunduan kung paano ka papasok, itakda ang mga bilang sa forecast na magpapasimula ng mga ikot ninyo, at ipunin ang mga suplay ng panahon habang banayad pa ang lagay ng panahon.",
    "commonPitfalls": "Ang inaasahang pagkabigo ay ang pagsisimula kasabay ng panahon: ang mga suplay na hinanap sa kasagsagan ng init ay dumarating pagkalipas ng panganib, at ang mga estrangherong unang sumusulpot sa gitna ng krisis ay tumatanggap ng maingat na hindi mula sa mga taong natutong mag-ingat sa mahirap na paraan. Ang mga mapanganib na pagkabigo: mga tutulong na sinusubukang harapin mag-isa ang emergency na medikal sa halip na tumawag agad ng tulong, at pamimilit sa mga tao na lumipat o tumanggap ng shelter — mag-alok, magpaalam, at igalang ang sagot.",
    "pairsWith": [
      "cooling-warming-center",
      "harm-reduction-supplies",
      "resource-hub-dispatch"
    ],
    "tasks": [
      {
        "name": "Mag-impake ng mga kit na akma sa panahon",
        "description": "Mag-impake ng mga kit ayon sa panahon: mga kumot, makapal na medyas, gorra, guwantes, at hand warmer para sa lamig; tubig, sachet ng electrolyte, sunscreen, sombrero, at pamunas na pampalamig para sa init. Lagyan ang bawat kit ng card na may mga lokasyon ng shelter at mga numerong pangkrisis.",
        "hours": 4,
        "skills": []
      },
      {
        "name": "Humanap ng mga suplay",
        "description": "Mangalap ng donasyon, bumili nang maramihan, at hingan ng tulong ang mga tindahan at simbahan — at gawin ito bago ang panahon, dahil ang paghahanap ng kumot sa unang ginaw ay pagdating nang huli. Mag-ipon nang sapat para makapagdagdag sa kalagitnaan ng panahon.",
        "hours": 4,
        "skills": [
          "pakikipag-ugnayan",
          "pagmamaneho"
        ]
      },
      {
        "name": "Imapa kung saan aabutin ang mga tao",
        "description": "Makipagtulungan sa mga nauna nang umaabot sa mga tao para malaman kung saan talaga tumitigil ang mga kapitbahay na walang tirahan — hawak nila ang tiwala at kaalamang binuo nang maraming taon, at mas mabuti ang pagdating na kasama sila kaysa dumating na estranghero. Panatilihing maluwag at napapanahon ang mapa; lumilipat ang mga tao, lalo na sa masamang panahon.",
        "hours": 3,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Maghanap at magsanay ng mga tutulong sa pag-abot",
        "description": "Sanayin ang bawat tutulong bago ang una niyang ikot: magalang na pakikitungo na tumatanggap ng hindi, sariling kaligtasan at laging magkapareha, at pagkilala sa mga emergency na medikal dulot ng panahon. Walang mamamahagi hangga't hindi pa nasasanay.",
        "hours": 4,
        "skills": [
          "pagtuturo"
        ]
      },
      {
        "name": "Buuin ang plano ng pamamahagi at ruta",
        "description": "Iplano ang mga ruta at oras para sa mga araw bago at habang delikado ang panahon, na inuuna ang mga pinaka-nakalantad — mga pinakamalayo sa mga programa, natutulog sa labas sa halip na sa sasakyan o shelter. Pagpasyahan nang maaga kung anong forecast ang magpapasimula ng ikot.",
        "hours": 3,
        "skills": [
          "pag-aayos"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Iugnay ang mga tao sa mga shelter at programa",
        "description": "Magdala ng napapanahon at napatunayang impormasyon tungkol sa mga sentro ng pagpapainit at pagpapalamig, mga higaan sa shelter, at sa sentro ng tulungan — palaging nagbabago ang mga oras at tuntunin, at sinusunog ng pagturo sa saradong pinto ang tiwala. Mag-alok ng ugnayan nang walang pamimilit; mas matagal ang relasyon kaysa alinmang isang gabi.",
        "hours": 3,
        "skills": [
          "pakikipag-ugnayan"
        ]
      },
      {
        "name": "Magplano para sa mga emergency",
        "description": "Sanayin ang bawat tutulong na makilala ang hypothermia at heat stroke — pagkalito, bulol na pananalita, balat na mainit at tuyo o malamig at malagkit — at tumawag agad sa emergency hotline, hindi mag-antay-antay muna. Ensayuhin ang gagawin habang paparating ang tulong: lilim at tubig, o mga kumot at kanlungan mula sa hangin.",
        "hours": 3,
        "skills": [
          "paunang lunas"
        ]
      }
    ]
  }
];
