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
import type { ProjectTemplate } from "./projectTemplates";

export const PROJECT_TEMPLATES_SW: readonly ProjectTemplate[] = [
  {
    "id": "community-fridge",
    "name": "Friji ya jumuiya na kabati la chakula cha bure",
    "purpose": "Wezesha watu kupata chakula na mahitaji ya msingi bure, saa zote, bila kuulizwa maswali.",
    "whoItServes": "Yeyote anayehitaji chakula; inasaidia hasa wanaofanya kazi kwa saa zisizo za kawaida, majirani wasio na vitambulisho rasmi, na wasioweza kufika kwenye benki ya chakula wakati wa saa za kazi.",
    "whatYoullNeed": "Friji iliyotolewa, sehemu ya nje yenye kivuli na plagi ya umeme, mwenyeji wa mahali, na zamu ndogo ya usafi.",
    "setupHours": 18,
    "defaultCategory": "food",
    "firstSteps": "Anza na mwenyeji, si friji. Keti na mwenye duka, nyumba ya ibada, au kliniki unayoifikiria na mzungumze mambo yasiyopendeza — bili ya umeme, uchafu ukiachwa, nani wa kuitwa friji ikiharibika — kabla hujatafuta friji yoyote. Wakati huo huo, uliza vikundi vya chakula na vya kusaidiana vinavyofanya kazi karibu nawe pengo wanaloliona, ili friji hii izibe pengo moja badala ya kurudia kazi yao.",
    "commonPitfalls": "Friji za jumuiya karibu haziwahi kufa kwa kukosa vitu vinavyotolewa — hufa pale ambapo hakuna anayeshika wazi kazi ya usafi, friji inachafuka, na mwenyeji anaomba kimya kimya iondolewe. Weka majina kwenye zamu kabla ya siku ya ufunguzi, na uone uhusiano na mwenyeji kama kitu unachokitunza, si friji tu.",
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
        "name": "Tafuta mwenyeji mwenye umeme na wapita njia",
        "description": "Wafikie wenye maduka madogo, nyumba za ibada, kliniki, au kumbi za mtaa. Uliza kama watakubali friji iwekwe chini ya paa lao na kuchomekwa kwenye umeme wao (gharama ya umeme kwa kawaida ni kiasi kidogo tu kwa mwezi — sema mtailipa wenyewe). Pata kibali rahisi kilichoandikwa.",
        "hours": 3,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Tafuta friji na kibanda cha kuikinga",
        "description": "Peleka ujumbe kwenye vikundi vya mtaa ukiomba friji inayofanya kazi. Jenga au nunua kabati la mbao au kibanda rahisi cha kuizunguka ili kuikinga na mvua na jua. Ifunge imara isiweze kuanguka. Ni pamoja na kuitafuta, kuisafirisha, na kujenga.",
        "hours": 8,
        "skills": [
          "useremala",
          "kuendesha gari"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Weka kanuni za msingi na lebo",
        "description": "Bandika bango wazi la lugha kadhaa: chukua unachohitaji, acha unachoweza; hakuna chakula kilichopita muda, cha makopo ya nyumbani, wala nyama mbichi. Weka lebo na kalamu ili watu waandike tarehe kwenye vitu.",
        "hours": 1.5,
        "skills": [
          "kuandika",
          "kutafsiri"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Kusanya zamu ya usafi na kujaza upya",
        "description": "Tengeneza ratiba ya wiki ya pamoja. Kila zamu ni kama dakika 15: futa nyuso, tupa kilichoharibika au kupita tarehe, na andika kinachopungua. Weka vifaa vya usafi papo hapo.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "kuratibu"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Jenga mahusiano ya vyanzo vya chakula",
        "description": "Uliza waokaji mikate, maduka ya vyakula, migahawa, na masoko kutoa ziada zao za mwisho wa siku mara kwa mara. Ratibu aliyejitokeza kuchukua. Fuatilia vyanzo vinavyotegemewa.",
        "hours": 3,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Weka mawasiliano ya matatizo",
        "description": "Weka namba moja ya simu au barua pepe kwenye friji kwa ajili ya “friji imeharibika / umeme umekatika / swali.” Amueni nani anajibu na kwa kasi gani.",
        "hours": 0.5,
        "skills": []
      }
    ]
  },
  {
    "id": "community-garden",
    "name": "Bustani ya jumuiya / shamba la kupanda pamoja",
    "purpose": "Kulima pamoja mboga na matunda ya bure na kutengeneza mahali pa kukutana.",
    "whoItServes": "Majirani wasio na uwanja, watu wanaobanwa na bei za vyakula, na yeyote anayetaka kuungana na watu na sababu ya kuwa nje.",
    "whatYoullNeed": "Kiwanja (hata kiwanja kitupu au paa la jengo), udongo au matuta, maji, mbegu, na kikundi cha msingi cha watu 5–10 wa kawaida.",
    "setupHours": 25,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Kabla hujagusa udongo, zungumza na makundi mawili ya watu: mwenye ardhi, na majirani wanaoishi kando kabisa ya kiwanja — baraka yao ina uzito sawa na mkataba. Kisha kusanya watu wako wa kawaida wanaotarajiwa na mfanye mapema mazungumzo ya namna ya kugawana; kujua kama ni vipande vya kila mtu au mavuno ya pamoja kunabadilisha kila kitu mtakachojenga.",
    "commonPitfalls": "Bustani mara nyingi hazifi mwanzoni mwa msimu — hufa kwenye wiki za joto kali zaidi, zamu ya kumwagilia inapovunjika kimya kimya na matuta kugeuka kahawia. Kiua kingine cha polepole ni mtu mmoja kuiona kama bustani yake yenye wasaidizi; andikeni jinsi maamuzi yanavyofanywa wakati kila mtu bado anapendana.",
    "pairsWith": [
      "seed-library",
      "community-composting",
      "food-preservation"
    ],
    "tasks": [
      {
        "name": "Pata ardhi na kibali",
        "description": "Tafuta kiwanja kitupu, uwanja wa nyumba ya ibada, eneo la shule, au kona ya bustani ya wazi isiyotumika. Mtafute mmiliki (ofisi ya ardhi, au uliza tu). Pata kibali au mkataba ulioandikwa, hata makubaliano ya mwaka mmoja yaliyoandikwa, na uhakikishe upatikanaji wa maji.",
        "hours": 6,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Pima udongo na upange matuta",
        "description": "Peleka kipimo cha udongo cha bei nafuu kwa afisa ugani wa kilimo wa eneo lako ili kuondoa shaka ya risasi na uchafuzi. Udongo ukiwa mbaya, panga matuta yaliyoinuliwa yenye udongo safi. Chora mahali pa matuta, njia, na kona ya zana.",
        "hours": 2,
        "skills": [
          "kulima bustani"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Kusanya vifaa na mjenge",
        "description": "Kusanya mbao au tumia matuta ya marobota ya nyasi au ya keyhole, mboji, na matandazo. Andaa siku ya ujenzi; mikono mingi huinua matuta haraka. Weka mpira wa maji au mapipa ya maji ya mvua.",
        "hours": 10,
        "skills": [
          "useremala"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Amueni namna ya kugawana",
        "description": "Kubalianeni kama kikundi: vipande vya kila mtu, mavuno ya pamoja kabisa, au mchanganyiko. Andikeni jinsi mazao yanavyogawanywa na jinsi maamuzi yanavyofanywa.",
        "hours": 1,
        "skills": [
          "kuongoza mazungumzo"
        ]
      },
      {
        "name": "Panda kulingana na msimu wenu",
        "description": "Chagua mazao rahisi yenye mavuno mengi kwa eneo lako (mboga za majani, maharagwe, maboga, nyanya, viungo). Panda kwa awamu ili mavuno yasije yote mara moja. Weka lebo kwenye mistari.",
        "hours": 4,
        "recurringCadence": "cycle",
        "skills": [
          "kulima bustani"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Weka zamu ya kumwagilia na kupalilia",
        "description": "Mimea hufa kwa kusahauliwa kuliko kitu kingine chochote. Tengeneza kalenda rahisi ya pamoja; unganisha kazi na vikumbusho rahisi. Iwe nyepesi ili watu wasichoke.",
        "hours": 1,
        "skills": [
          "kuratibu"
        ],
        "follows": [
          4
        ]
      },
      {
        "name": "Panga mavuno na ziada",
        "description": "Amueni siku za kuvuna. Peleka mazao ya ziada kwenye friji ya jumuiya, kwa majirani, au meza ya bure langoni. Hifadhi mbegu kadhaa kwa mwaka ujao.",
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
    "name": "Maktaba ya kuazima zana na vifaa",
    "purpose": "Wezesha majirani kuazima zana na vifaa badala ya kuvinunua, kuokoa pesa na kupunguza taka.",
    "whoItServes": "Wapangaji, wenye nyumba wapya, wapenda kazi za mikono, na yeyote anayefanya matengenezo au miradi ya mara chache.",
    "whatYoullNeed": "Mahali pa kuhifadhi, zana zilizotolewa, mfumo rahisi wa kuazimisha, na “wakutubi” wawili-watatu.",
    "setupHours": 20,
    "defaultCategory": "infrastructure",
    "firstSteps": "Kabla hujakusanya hata drili moja, zungumza na anayetoa nafasi kuhusu maana halisi ya kuishi na maktaba ya zana — kelele, vitu kuongezeka polepole, wageni mlangoni saa za ufunguzi. Kisha uliza majirani wangeazima nini hasa; orodha ya zana kumi zilizoombwa ni bora kuliko gereji ya zana zilizotolewa ambazo hakuna anayezitaka.",
    "commonPitfalls": "Maktaba za zana hufa kwa ukimya baada ya tarehe ya kurudisha: hakuna anayefuatilia, zana zinaishia kubaki kwa waliozichukua milele, na rafu zinabaki tupu. Utaratibu wa vikumbusho vya kirafiki una thamani kuliko sheria kali ya kuchelewa — na uwe tayari kukataa vitu vinavyotolewa, la sivyo utakuwa jalala la mtaa la vifaa vibovu.",
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
        "name": "Tafuta hifadhi na saa za ufunguzi",
        "description": "Kibanda, gereji, kabati kwenye ukumbi wa mtaa, au kontena vinafaa. Chagua saa 2–4 za ufunguzi zinazotabirika kwa wiki ili watu wajue lini kuja.",
        "hours": 3,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Kusanya na kupanga zana",
        "description": "Peleka wito wa kutoa zana (watu wana drili na ngazi za ziada kila mahali). Safisha, jaribu, na uweke lebo kila zana. Tupa au tengeneza chochote kisicho salama.",
        "hours": 6,
        "skills": [
          "kuendesha gari"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Orodhesha kila kitu",
        "description": "Tumia lahajedwali ya bure au programu ya maktaba ya kuazima. Andika kila kifaa, hali yake, na picha. Weka namba kwenye zana ili ziwe rahisi kufuatilia.",
        "hours": 4,
        "skills": [
          "kuingiza data"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Andika kanuni za kuazima",
        "description": "Weka muda wa kuazima (mfano, wiki moja), idadi ya vifaa kwa mara moja, na utaratibu wa kurudisha na kuchelewa. Uwe wa kusamehe — hapa ni suala la kuaminiana. Taja zana yoyote inayohitaji maelezo ya usalama.",
        "hours": 1,
        "skills": [
          "kuandika"
        ]
      },
      {
        "name": "Anzisha daftari la kuazimisha",
        "description": "Kibao chenye kibanio au fomu rahisi: jina, mawasiliano, kifaa, tarehe ya kutoka, tarehe ya kurudisha. Piga picha ya haraka ya hali ya zana wakati wa kuazimisha ili kuepuka kutoelewana.",
        "hours": 2,
        "skills": [
          "kuingiza data"
        ],
        "follows": [
          2,
          3
        ]
      },
      {
        "name": "Fundisha wakutubi wenu",
        "description": "Wapitishe waliojitokeza kwenye orodha, hatua za kuazimisha, na usalama wa msingi (miwani ya kinga, matumizi ya ngazi). Weka ukurasa mmoja wa muhtasari mezani.",
        "hours": 2,
        "skills": [
          "kufundisha"
        ],
        "follows": [
          4
        ]
      },
      {
        "name": "Tunza na ukuze",
        "description": "Kagua zana zinazorudi, noa na upake mafuta mara kwa mara, na fuatilia vinavyoombwa zaidi ili ujue cha kuongeza kifuatacho.",
        "hours": 2,
        "skills": [
          "kutengeneza zana"
        ],
        "recurringCadence": "session"
      }
    ]
  },
  {
    "id": "neighborhood-care-network",
    "name": "Mtandao wa kutunzana mtaani",
    "purpose": "Hakikisha majirani walio peke yao wanajuliwa hali, wanaunganishwa, na kusaidiwa.",
    "whoItServes": "Wazee, majirani wenye ulemavu na magonjwa ya kudumu, wazazi wapya, na yeyote anayeishi peke yake.",
    "whatYoullNeed": "Orodha ya waliojitokeza, njia ya kuwaunganisha na majirani, na utaratibu wa kujulia hali. Wanaosaidia ni majirani, si wataalamu wa matunzo — wachunguze kwanza wote watakaofanya ziara za nyumbani, kamwe usimwache aliyejitokeza ashike pesa za jirani peke yake, na kubalianeni mapema lini kuita familia au namba za dharura.",
    "setupHours": 18,
    "defaultCategory": "emotional_support",
    "firstSteps": "Anza kwa kusikiliza, si kukusanya watu: zungumza na majirani unaotarajia kuwasaidia kuhusu wanachotaka hasa — simu ya kila wiki, usafiri, mtu wa kuongea naye — kwa sababu mtandao uliojengwa juu ya makisio hujisikia kama uchunguzi. Wakati huo huo, fanya mazungumzo ya wazi na waliojitokeza wa mwanzo kuhusu uchunguzi wa awali na mipaka, ili kanuni zilizopo zijisikie kama kujali, si kushuku, muunganisho wa kwanza utakapofanyika.",
    "commonPitfalls": "Mitandao ya kutunzana mara chache hufa kwa uchache wa waliojitokeza — huwachoma wale watatu wanaosema ndiyo kila mara huku wengine wote wakisubiri kuombwa. Gawanyeni miunganisho kwa makusudi, fanyeni vikao vya kusikilizana vya wanaosaidia hata mambo yanapoonekana mazuri, na msiache kujulia hali kugeuka kumchukulia jirani kama kazi ya ofisini badala ya mtu.",
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
        "name": "Tambua walio karibu",
        "description": "Tambua kwa utulivu majirani wanaoweza kuwa peke yao kupitia maneno ya watu, waangalizi wa majengo, kliniki, na vikundi vya dini. Usidhanie mahitaji kamwe — waalike watu ndani, usiwatenge.",
        "hours": 4,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Kusanya na kuchunguza waliojitokeza",
        "description": "Omba watu wanaoweza kuahidi mawasiliano ya mara kwa mara. Kwa ziara zozote za nyumbani au msaada kwa watu wazima walio hatarini, fanya uhakiki wa msingi wa watu wanaomjua, na kamwe usimwache aliyejitokeza ashike pesa za jirani peke yake.",
        "hours": 5,
        "skills": [
          "kufikia watu",
          "mahojiano"
        ]
      },
      {
        "name": "Unganisha kwa busara",
        "description": "Oanisha kwa lugha, ukaribu, na hali ya kujisikia huru. Uliza wote wawili wanachotaka — simu ya kila wiki, kununuliwa vyakula, gumzo nje ya nyumba — na uheshimu mpaka huo.",
        "hours": 2,
        "skills": [
          "kuratibu"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Weka utaratibu wa kujulia hali",
        "description": "Kubalianeni mara ngapi na kwa njia gani (simu, ujumbe, hodi). Wape waliojitokeza maneno mafupi ya kuanzia kwa mawasiliano ya kwanza ili yajisikie ya joto, si ya kiofisi.",
        "hours": 1,
        "follows": [
          2
        ],
        "skills": []
      },
      {
        "name": "Andaa mpango wa dharura",
        "description": "Amueni mapema la kufanya mtu asipojibu au akionekana katika shida: nani wa kumwita, lini kuhusisha familia au namba za dharura, na jinsi ya kuweka kumbukumbu. Ubaki umeandikwa na rahisi.",
        "hours": 2,
        "skills": [
          "kuandika"
        ]
      },
      {
        "name": "Ratibu msaada wa vitendo",
        "description": "Fuatilia mahitaji yanayojirudia — usafiri wa kwenda kliniki, kuchukua dawa, kazi ndogo za nyumbani — na uyaunganishe na waliojitokeza wengine au miradi mingine ya programu yenu.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "kuratibu"
        ]
      },
      {
        "name": "Wasaidie waliojitokeza pia",
        "description": "Fanya kikao chao cha kujulia hali na kusikilizana. Kazi ya kutunza inachosha; pokezaneni kazi na angalia dalili za kuchoka kupita kiasi.",
        "hours": 2,
        "skills": [
          "kuongoza mazungumzo"
        ],
        "recurringCadence": "month"
      }
    ]
  },
  {
    "id": "emergency-preparedness",
    "name": "Mtandao wa kujiandaa na dharura na maafa",
    "purpose": "Saidia mtaa kujiandaa na kukabiliana na maafa (joto kali, dhoruba, mafuriko, kukatika kwa umeme) wakati msaada rasmi unapochelewa.",
    "whoItServes": "Kila mtu, kwa kipaumbele kwa wasioweza kuondoka kwa urahisi au wanaotegemea umeme kwa vifaa vya matibabu.",
    "whatYoullNeed": "Orodha ya mawasiliano, mahali pa kukutania, vifaa vya msingi, na mpango wa mawasiliano unaofanya kazi bila intaneti. Mtandao huu unakamilisha waokoaji rasmi — hauchukui nafasi yao. Katika hali ya kutishia maisha, piga namba za dharura kwanza kila mara.",
    "setupHours": 30,
    "defaultCategory": "organizing",
    "firstSteps": "Jenga mpango kuwazunguka watu unaowahusu: gonga hodi za majirani wanaotumia oksijeni, dawa za kuhifadhiwa kwenye friji, au wanaoishi ghorofa za juu bila lifti, na uwaulize wiki mbaya inaonekanaje kwao. Kisha zungumza na anayeshikilia mahali penu pa usalama panapotarajiwa na kikundi chochote cha maandalizi kilichopo (kikundi cha mtaa cha maafa, zimamoto) ili mtandao wenu uzibe mapengo kuzunguka msaada rasmi badala ya kuurudia.",
    "commonPitfalls": "Mitandao hii haifi wakati wa maafa — hufa katika miaka tulivu kabla yake, mti wa mawasiliano unapochakaa, namba za simu kubadilika, na mpango kuishi kwenye kompyuta ya mtu mmoja. Chapisheni kila kitu, sasisheni orodha kwa mdundo wa kalenda, na fanyeni mazoezi angalau mara moja; matumizi ya kwanza halisi yasiwe kamwe matumizi ya kwanza.",
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
        "name": "Tambua hatari za mtaa wenu",
        "description": "Orodhesha maafa yanayowezekana zaidi mahali penu. Andika sehemu dhaifu: watu wa ghorofa za juu bila lifti, wanaotumia oksijeni au dawa za kuhifadhiwa kwenye friji, majengo yenye mlango mmoja wa kutokea.",
        "hours": 4,
        "skills": []
      },
      {
        "name": "Jenga mti wa mawasiliano",
        "description": "Kusanya mawasiliano kwa ridhaa mtaa kwa mtaa. Teua “wakuu wa mtaa” wachache, kila mmoja ajulie hali kaya kama 10. Weka nakala ya karatasi — simu na intaneti hufa kwenye maafa.",
        "hours": 8,
        "skills": [
          "kufikia watu",
          "kuingiza data"
        ]
      },
      {
        "name": "Panga mawasiliano bila mtandao",
        "description": "Amueni jinsi ya kufikiana bila mtandao wa simu: kugonga hodi, mahali pa kukutania, filimbi, au redio. Chapisheni na mgawane mpango.",
        "hours": 3,
        "skills": [
          "kuandika"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Hifadhi vifaa vya pamoja",
        "description": "Kusanyeni kifurushi cha jumuiya: maji, msaada wa kwanza, tochi, betri, redio ya betri au ya kuzungusha, mablanketi, na zana za msingi. Kihifadhini mahali panapofikiwa na watu kadhaa.",
        "hours": 5,
        "skills": [
          "kuendesha gari"
        ]
      },
      {
        "name": "Tambua sehemu salama",
        "description": "Tafuteni mahali panapoweza kuwa pa kupoa, kupata joto, au kuchaji simu (ukumbi wenye jenereta, bustani yenye kivuli). Hakikisheni ufikiaji mapema.",
        "hours": 3,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Fanya zoezi au jioni ya maelezo",
        "description": "Andaeni kipindi kuhusu mifuko ya kuondoka ya kila kaya, kuzima umeme, maji na gesi, na mti wa mawasiliano. Fanyeni mazoezi mara moja ili watu wasijifunze wakati wa dharura yenyewe.",
        "hours": 5,
        "skills": [
          "kufundisha",
          "kuongoza mazungumzo"
        ],
        "follows": [
          1,
          2
        ]
      },
      {
        "name": "Panga nani anafanya nini siku yenyewe",
        "description": "Panga mapema nani anawajulia hali kwanza walio hatarini kiafya, nani anafungua mahali salama, na nani anaratibu. Pitieni na kusasisha mpango mara mbili kwa mwaka.",
        "hours": 2,
        "skills": [
          "kuratibu"
        ],
        "follows": [
          4
        ]
      }
    ]
  },
  {
    "id": "free-store",
    "name": "Duka la bure / kubadilishana vitu",
    "purpose": "Gawa upya nguo, vyombo vya nyumbani, na mahitaji, bure kabisa.",
    "whoItServes": "Yeyote — watu walio katika wakati mgumu, wanaopunguza vitu, na mazingira.",
    "whatYoullNeed": "Nafasi (hata ya muda), meza au vichanja vya nguo, wapangaji waliojitokeza, na ratiba ya kudumu.",
    "setupHours": 10,
    "defaultCategory": "mutual_aid_drive",
    "suggestsWorkDays": true,
    "firstSteps": "Zungumza kwanza na mwenyeji wa nafasi kuhusu hali halisi — marundo ya vitu vinavyotolewa, wapita njia, chumba kinavyoonekana asubuhi inayofuata — kisha na duka la mitumba au kikundi cha karibu kinachogawa vitu kuhusu kinachofurika tayari, ili ujue mtaa wenu unakosa nini hasa. Ukiweza, kaa muda kidogo kwenye duka la bure lililopo kabla ya tukio lenu la kwanza; mtiririko wa kupokea na kupanga ni rahisi kuiga kuliko kuubuni.",
    "commonPitfalls": "Maduka ya bure huzama kabla ya kufa njaa: bila orodha thabiti ya ndiyo na hapana mlangoni, waliojitokeza hutumia kila saa ya kazi kupanga vitu vibovu na vichafu badala ya kuwakaribisha watu. Na amueni mabaki yanakwenda wapi kabla tukio la kwanza halijaisha — rundo la vitu visivyochukuliwa bila mpango wa kutoka ndivyo nafasi za wenyeji zinavyopotea.",
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
        "name": "Chagua muundo na nafasi",
        "description": "Amueni kati ya duka la bure la kudumu, la muda linalojirudia, au siku moja ya kubadilishana vitu. Azimeni ukumbi, duka tupu, au banda la bustani. Tarehe inayojirudia hujenga mazoea.",
        "hours": 2,
        "skills": []
      },
      {
        "name": "Weka vigezo vya vitu vinavyopokelewa",
        "description": "Pokeeni vitu safi, vinavyofanya kazi, na vinavyotumika tu. Bandikeni orodha wazi ya “ndiyo” na “hapana” (hakuna vifaa vya umeme vibovu, nguo chafu, wala vifaa vya watoto vilivyoondolewa sokoni kwa usalama). Hii inaokoa muda mkubwa wa kupanga.",
        "hours": 0.5,
        "skills": [
          "kuandika"
        ]
      },
      {
        "name": "Panga upokeaji na upangaji",
        "description": "Wekeni vituo: pokea, panga kwa aina, na andaa kwa maonyesho. Kuweni na mpango wa vitu msivyoweza kutumia (vipelekeni mbele au virejelezeni).",
        "hours": 2,
        "skills": [
          "kuratibu"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Panga vitu watu waangalie kwa heshima",
        "description": "Tundikeni nguo kwa saizi, kusanyeni vyombo vya nyumbani pamoja, na pawe safi na pa kukaribisha. Hakuna fomu, hakuna uthibitisho wa uhitaji — chukua tu utakachotumia.",
        "hours": 1.5,
        "skills": [
          "usanifu"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Panga watu wa tukio",
        "description": "Wagawie wakaribishaji, wapangaji, na mtu wa maswali. Sauti ya kirafiki isiyohukumu ndiyo lengo lote.",
        "hours": 3,
        "skills": [
          "kuratibu"
        ],
        "recurringCadence": "event"
      },
      {
        "name": "Shughulikia mabaki",
        "description": "Pangeni mapema mabaki yanakwenda wapi baada ya kila tukio (kikundi mwenza kinachogawa vitu, urejelezaji wa nguo) ili nafasi irudi safi.",
        "hours": 1,
        "skills": [
          "kuendesha gari"
        ]
      }
    ]
  },
  {
    "id": "skill-share",
    "name": "Kubadilishana ujuzi na madarasa ya bure",
    "purpose": "Wezesha majirani kufundishana na kujifunza kutoka kwa kila mmoja bure — kupika, matengenezo, lugha, kupanga matumizi, msaada wa kwanza, ujuzi wa kidijitali.",
    "whoItServes": "Kila mtu; hasa wasioweza kumudu madarasa ya kulipia na wale ambao maarifa yao huthaminiwa mara chache.",
    "whatYoullNeed": "Nafasi, watu walio tayari kufundisha, na njia ya kusambaza ratiba.",
    "setupHours": 9,
    "defaultCategory": "education",
    "firstSteps": "Mradi huanza na mazungumzo ya maswali mawili, si ukumbi: uliza watu wangeweza kufundisha nini na wangependa kujifunza nini, na uwe makini hasa na majirani ambao maarifa yao huchukuliwa mara chache kama utaalamu. Kazi yako halisi ya kwanza ni kumtuliza mwalimu mtarajiwa mmoja mwenye wasiwasi juu ya kahawa, ukimhakikishia kipindi chake si lazima kiwe hotuba.",
    "commonPitfalls": "Mabadilishano ya ujuzi hufifia pale watu wawili walewale wenye kujiamini wanapoishia kufundisha kila kitu na ratiba kuegemea kimya kimya jioni huru za waandaaji badala ya za wanaohudhuria. Endelea kutafuta walimu wapya, uliza nani hayupo chumbani, na uone kipindi cha watu watano kama mafanikio, kwa sababu ndivyo kilivyo.",
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
        "name": "Uliza ujuzi na shauku",
        "description": "Uliza wanajumuiya maswali mawili: ungeweza kufundisha nini, na ungependa kujifunza nini? Kusanya majibu kwenye fomu rahisi. Panapoingiliana ndipo mtaala wenu.",
        "hours": 1.5,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Tafuta na kuandaa walimu",
        "description": "Wahakikishie watu kuwa “kufundisha” kunaweza kuwa bila urasmi. Wasaidie kupanga kipindi cha saa moja ya darasa na kukusanya vifaa. Mwoanishe mwenye wasiwasi wa mara ya kwanza na mwenza.",
        "hours": 3,
        "skills": [
          "kufundisha",
          "kuongoza mazungumzo"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Tafuta nafasi na wakati",
        "description": "Tumia chumba cha maktaba, ukumbi wa mtaa, bustani, au sebule ya mtu. Chagua nyakati zinazojirudia ili iwe mazoea.",
        "hours": 1.5,
        "skills": []
      },
      {
        "name": "Tengeneza ratiba",
        "description": "Orodhesha vipindi na tarehe, mada, mwalimu, na cha kuleta. Isambaze mahali wanajumuiya wanapotazama tayari. Kuandika jina kuwe kwepesi au watu waje tu.",
        "hours": 1.5,
        "recurringCadence": "month",
        "skills": [
          "kuratibu"
        ],
        "follows": [
          1,
          2
        ]
      },
      {
        "name": "Ifanye ifikike kwa wote",
        "description": "Fikiria mahitaji ya lugha, kuangaliwa kwa watoto, ufikiaji wa kimwili, na nyakati kwa wanaofanya kazi. Uliza wanaohudhuria nini kingewasaidia kuja.",
        "hours": 1.5,
        "skills": [
          "ufikivu",
          "kutafsiri"
        ]
      }
    ]
  },
  {
    "id": "bulk-buying-coop",
    "name": "Kikundi cha kununua chakula kwa jumla",
    "purpose": "Kuunganisha maagizo ili kununua chakula na mahitaji makuu kwa jumla kwa bei ya chini.",
    "whoItServes": "Kaya zinazobanwa na bei za vyakula, familia kubwa, na mitaa iliyo mbali na maduka ya vyakula.",
    "whatYoullNeed": "Kikundi cha kaya zilizojizatiti, muuzaji wa jumla, mahali pa kupokea na kugawa, na mtu wa kushika maagizo.",
    "setupHours": 20,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Kusanya kaya zenu kabla ya kumpigia muuzaji yeyote, na fanyeni kwanza mazungumzo yale magumu ya pesa: kila mtu anaweza kuahidi kiasi gani, jinsi pesa zinavyoingia kabla maagizo hayajatumwa, na nini maana ya kukosa mzunguko. Simu moja kwa kikundi cha ununuzi kilichopo — wengi hufurahi kushiriki jedwali lao na makovu yao — itakuokoa msimu mzima wa kujaribu na kukosea.",
    "commonPitfalls": "Vikundi vya ununuzi hufa kwa misuguano ya pesa na uchovu wa mratibu: mtu anatoa pesa zake mbele akakasirika, agizo halilipiwi, au mtu mmoja anaendesha kila mzunguko kimya kimya hadi anapoacha na kila kitu kinasimama. Kusanyeni pesa kabla ya kuagiza bila kubadilika, na pokezaneni nafasi ya mratibu kuanzia mzunguko wa pili, si siku moja ijayo.",
    "pairsWith": [
      "community-market",
      "food-preservation"
    ],
    "tasks": [
      {
        "name": "Kusanya kikundi cha ununuzi",
        "description": "Tafuta kaya za kutosha kufikia kiwango cha chini cha wauzaji (mara nyingi 8–15). Kubalianeni mzunguko wa ununuzi (kila wiki, kila wiki mbili, au kila mwezi).",
        "hours": 4,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Tafuta muuzaji wa jumla",
        "description": "Wasiliana na wauzaji wa jumla wa vyakula, vikundi vya wakulima, wauzaji wa migahawa, au vikundi vya ununuzi. Linganisha kiwango cha chini cha agizo, njia za usafirishaji, na bei. Hakikisha wana bidhaa kuu mnazohitaji.",
        "hours": 4,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Anzisha uagizaji",
        "description": "Tumieni lahajedwali au fomu ya pamoja ambapo kaya zinaingiza kiasi kabla ya tarehe ya mwisho. Teueni mratibu mmoja wa kujumlisha na kupeleka agizo.",
        "hours": 3,
        "skills": [
          "kuingiza data",
          "kuratibu"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Shughulikia pesa kwa uwazi",
        "description": "Amueni utaratibu wa pesa mapema (kusanyeni kabla ya kuagiza ili mtu asitoe zake mbele). Andikeni kila senti kwenye kumbukumbu ya pamoja. Ongezeni ziada ndogo ya hiari kwa ajili ya umwagikaji, si faida.",
        "hours": 2,
        "skills": [
          "uhasibu"
        ]
      },
      {
        "name": "Panga upokeaji na mahali pa kugawa",
        "description": "Chagueni mahali pa kupokea mzigo wa jumla — gereji, ukumbi, au uwanja wa nyumba. Pangeni mikono ya kutosha kwa siku ya kushusha.",
        "hours": 3,
        "skills": [
          "kuratibu"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Gawa maagizo kwa haki",
        "description": "Wekeni vituo vya kugawa vyenye mizani kwa nafaka na mazao ya jumla. Chapisheni mapema orodha ya kila kaya. Kagueni mara mbili kabla ya kuchukuliwa.",
        "hours": 3,
        "skills": [
          "kuratibu"
        ],
        "follows": [
          2,
          4
        ],
        "recurringCadence": "cycle"
      },
      {
        "name": "Pokezaneni kazi",
        "description": "Uratibu, ugawaji, na uchukuaji vipokezane ili mtu mmoja asibebe yote. Pitieni bei na uaminifu wa muuzaji kila mzunguko.",
        "hours": 1,
        "recurringCadence": "cycle",
        "skills": []
      }
    ]
  },
  {
    "id": "repair-cafe",
    "name": "Kafe ya Kutengeneza Vitu",
    "purpose": "Kutengeneza vitu vilivyoharibika — nguo, elektroniki, baiskeli, samani — bure badala ya kuvitupa.",
    "whoItServes": "Mtu yeyote mwenye kitu kilichoharibika bila pesa wala ujuzi wa kukitengeneza; huzuia vitu vinavyofaa visiishie jalalani.",
    "whatYoullNeed": "Mafundi waliojitokeza, zana za msingi, nafasi yenye meza na umeme, na tarehe inayojirudia.",
    "setupHours": 14,
    "defaultCategory": "skilled_labor",
    "suggestsWorkDays": true,
    "firstSteps": "Tafuta mafundi wako wawili au watatu wa kwanza kabla ya jambo lingine lolote — jirani anayeshona, mpenda kuchezea baiskeli — kwa sababu tarehe na ukumbi havina maana bila wao. Kisha tembea nao ukumbini mkizungumzia meza, umeme na mwanga, na kama kuna kafe ya kutengeneza vitu mji wa jirani, hudhurieni kikao kimoja; utaratibu wa mapokezi ndiyo sehemu inayofaa kuigwa.",
    "commonPitfalls": "Kafe za kutengeneza vitu hugeuka kimyakimya kuwa maduka ya bure ya kuachia vitu: wageni huacha vitu na kuondoka, mafundi hujikuta wamegeuka mafundi wa dukani wasio na ujira, na fundi wa elektroniki aliye peke yake ndiye anayechoka kwanza. Shikilia msimamo kwamba wenye vitu hubaki na matengenezo yao, na bandika wazi kwamba baadhi ya vitu haviwezi kuokolewa — kukata tamaa kulikozungumzwa mapema ni rahisi kuliko lawama baadaye.",
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
        "name": "Tafuta mafundi kwa fani zao",
        "description": "Tafuta watu hodari wa kushona, elektroniki ndogondogo, baiskeli, vifaa vya nyumbani, na useremala. Unahitaji mmoja au wawili tu kwa kila fani kuanzia.",
        "hours": 4,
        "skills": [
          "kutengeneza",
          "elektroniki",
          "kushona"
        ]
      },
      {
        "name": "Andaa vituo vya kutengeneza",
        "description": "Kila kituo kinahitaji meza, zana zake, mwanga mzuri, na umeme. Weka matengenezo yanayofanana pamoja. Bandika lebo wazi kwenye kila kituo.",
        "hours": 3,
        "recurringCadence": "session",
        "skills": [
          "kuratibu"
        ]
      },
      {
        "name": "Panga tarehe inayojirudia",
        "description": "Kila mwezi hufanya kazi vizuri. Chagua ukumbi wa kudumu — maktaba, karakana ya pamoja, ukumbi wa jumuiya — ili watu wajue pa kuleta vitu.",
        "hours": 1,
        "skills": []
      },
      {
        "name": "Tengeneza utaratibu wa mapokezi",
        "description": "Mkaribishaji huandika kila mgeni na kitu chake, kisha humwelekeza kwa fundi sahihi. Weka matarajio: wageni hubaki na kusaidia matengenezo yao inapowezekana; hapa ni mahali pa kujifunza, si pa kuachia vitu.",
        "hours": 2,
        "skills": [
          "kuandika"
        ]
      },
      {
        "name": "Simamia usalama na matarajio",
        "description": "Bandika kwamba baadhi ya vitu haviwezi kuokolewa na matengenezo hujaribiwa, hayahakikishwi. Wekeni taratibu salama za vifaa vya umeme na betri. Weka kit ya msaada wa kwanza karibu.",
        "hours": 2,
        "skills": []
      },
      {
        "name": "Hifadhi vipuri na vitu vinavyotumika sana",
        "description": "Weka uzi, fyuzi, gundi, skrubu, tyubu na viraka karibu. Fuatilia kinachotumika ili uweze kujaza tena.",
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
    "name": "Lifti na Msaada wa Usafiri",
    "purpose": "Kuwafikisha majirani kwenye miadi ya hospitali, sokoni na madukani, na shughuli muhimu pale usafiri na pesa vinapokuwa vikwazo.",
    "whoItServes": "Watu wasio na magari, majirani wenye ulemavu, wazee, na yeyote aliye mahali pasipo na usafiri wa uhakika.",
    "whatYoullNeed": "Madereva waliojitokeza, njia ya kuomba na kupanga safari, na kanuni wazi za usalama na bima. Kuwaendesha majirani ni jukumu zito — thibitisha leseni na bima ya kila dereva, wachunguze watakaowaendesha abiria wanaohitaji uangalizi zaidi, na kamwe usitumie safari ya kusaidiana badala ya gari la wagonjwa katika dharura ya kiafya.",
    "setupHours": 18,
    "defaultCategory": "transport",
    "firstSteps": "Mazungumzo ya aina mbili huja kabla ya safari ya kwanza: kaa na kila dereva mtarajiwa kuthibitisha leseni na bima na kuzungumza kwa uwazi kuhusu uchunguzi, na zungumza na wanaohitaji lifti — na vituo vya wazee na zahanati zinazowajua — kuhusu safari halisi, nyakati, na mahitaji ya kutembea. Mazungumzo ya uchunguzi ni mepesi yakiwa desturi ya mwanzo kuliko sheria inayoletwa baadaye.",
    "commonPitfalls": "Mitandao ya lifti huanguka kwenye upangaji, si uendeshaji: kila ombi la safari hutua kwenye simu ya mtu mmoja hadi mtu huyo anachoka kabisa, na madereva wale wale wawili wa kuaminika hupewa kila ombi huku wengine hawaitwi tena baada ya kukataa mara moja. Pokezaneni nafasi ya mratibu, sambazeni safari kwa makusudi, na kamwe msiache swali la bima lisubiri mpaka ajali ndogo ya kwanza itokee.",
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
        "name": "Tafuta na uchunguze madereva",
        "description": "Thibitisha kila dereva ana leseni halali, bima, na gari salama. Kwa safari za abiria wanaohitaji uangalizi zaidi, uliza watu wanaowafahamu au fanya ukaguzi wa historia kulingana na desturi za kwenu.",
        "hours": 5,
        "skills": [
          "kuendesha gari"
        ]
      },
      {
        "name": "Panga mambo ya bima na uwajibikaji",
        "description": "Angalia bima binafsi ya kila dereva inafunika nini kwa uendeshaji wa kusaidiana. Fikirieni fomu fupi ya makubaliano na muulize kliniki ya msaada wa kisheria ya karibu — hii inamlinda kila mtu.",
        "hours": 4,
        "skills": [
          "makaratasi"
        ]
      },
      {
        "name": "Anzisha mfumo wa kuomba safari",
        "description": "Chagua njia moja ya kuomba safari (namba ya simu, fomu, kikundi cha ujumbe) yenye muda wa kuomba mapema (mf. saa 48). Andika muda wa kuchukuliwa, mahali, mahitaji ya kutembea, na mawasiliano.",
        "hours": 2,
        "skills": [
          "kuratibu",
          "teknolojia"
        ]
      },
      {
        "name": "Jenga utaratibu wa kupanga safari",
        "description": "Mratibu mmoja (kwa zamu) alinganishe kila ombi na madereva waliopo na athibitishe na pande zote mbili siku moja kabla. Weka orodha ya madereva wa ziada kwa safari zinazofutwa.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "kuratibu"
        ],
        "follows": [
          0,
          2
        ]
      },
      {
        "name": "Wekeni wazi safari zinazohusika",
        "description": "Amueni safari zipi zinahusika (hospitali, sokoni na madukani, shughuli muhimu) na eneo mnalofika. Wekeni wazi kuhusu muda wa kusubiri na kama madereva husaidia kubeba mizigo.",
        "hours": 1,
        "skills": [
          "kuongoza mazungumzo"
        ]
      },
      {
        "name": "Panga mambo ya mafuta",
        "description": "Amueni mafuta yanapatikanaje — mfuko mdogo wa pamoja, abiria kuweka kitu kwa hiari, au bila chochote. Iwe wazi kabisa, na kamwe isiwe kikwazo kwa abiria.",
        "hours": 2,
        "follows": [
          4
        ],
        "skills": []
      },
      {
        "name": "Walinde abiria na madereva",
        "description": "Wekeni desturi: madereva hawaingii ndani ya nyumba peke yao, hakuna kushika pesa zaidi ya makubaliano ya mafuta, na kuna kumjulia hali baada ya safari za abiria wanaohitaji uangalizi zaidi. Andikeni kila safari.",
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
    "name": "Umoja wa Wapangaji na Utetezi Dhidi ya Kufukuzwa",
    "purpose": "Kuwaunganisha wapangaji kujilinda dhidi ya kufukuzwa nyumbani, mazingira hatarishi, na upandishaji wa kodi usio wa haki kupitia nguvu ya pamoja.",
    "whoItServes": "Wapangaji, hasa kwenye majengo yenye wenye nyumba wazembe au wasiopatikana, na yeyote anayekabiliwa na kufukuzwa.",
    "whatYoullNeed": "Kikundi kidogo cha waanzilishi, taarifa sahihi za haki za wapangaji za eneo lenu, uhusiano na msaada wa kisheria, na mfumo wa mawasiliano wa haraka. Mradi huu unawasaidia wapangaji na kushirikisha taarifa za kisheria zilizo wazi; haubadilishi ushauri wa kisheria. Kila mara peleka kesi za mtu mmoja mmoja kwa msaada wa kisheria wenye sifa kabla ya tarehe za mwisho.",
    "setupHours": 30,
    "defaultCategory": "housing",
    "firstSteps": "Zungumza na wapangaji walioathirika kabla ya mawasiliano yoyote na mwenye nyumba, wakati wowote — piga hodi mlango kwa mlango, sikiliza watu wanaogopa nini na wanataka nini hasa, na waache wapangaji wa kila jengo waamue kasi, kwa sababu wao ndio wanaobeba hatari ya kisasi, si waandaaji. Sambamba na hilo, jitambulishe mapema kwa kliniki ya msaada wa kisheria ya eneo lenu; uhusiano huo unauhitaji kabla notisi ya kwanza ya kufukuzwa haijafika, si baada.",
    "commonPitfalls": "Namna umoja wa wapangaji unavyoweza kuwaumiza watu ni kwenda kasi kuliko wapangaji wenyewe: makabiliano yanayoanzishwa kabla jengo halijawa tayari huwaweka majirani walio hatarini zaidi kwenye kisasi wasichokikubali. Kushindwa kwa kimya zaidi ni kuteleza kutoka kutoa taarifa za kisheria hadi kutoa ushauri wa kisheria — peleka kesi za mtu mmoja mmoja kwa msaada wa kisheria wenye sifa kabla ya tarehe za mwisho, kila mara.",
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
        "name": "Unda kamati ndogo ya waanzilishi",
        "description": "Tafuta wapangaji 3–6 waliojidhatiti kubeba kazi hii. Angalia watu wanaoheshimika kwenye majengo yao. Kubalianeni nafasi za kila mmoja, mzunguko wa vikao, na malengo ya pamoja.",
        "hours": 5,
        "skills": [
          "kuratibu"
        ]
      },
      {
        "name": "Chora ramani ya majengo na shida za wapangaji",
        "description": "Pigeni hodi au ulizeni nyumba kwa nyumba kujua majengo yapi yana matatizo na ni yapi (matengenezo yanayopuuzwa, tozo zisizo halali, unyanyasaji). Fuatilieni mienendo na mtafute viongozi wa asili katika kila jengo.",
        "hours": 8,
        "skills": [
          "kufikia watu",
          "mahojiano"
        ]
      },
      {
        "name": "Kusanya taarifa sahihi za haki za wapangaji",
        "description": "Kusanyeni sheria halisi za eneo lenu kuhusu muda wa notisi ya kufukuzwa, matengenezo, deposit, na kanuni za kodi. Shirikianeni na kliniki ya msaada wa kisheria kuzihakiki. Hizi ni taarifa za pamoja, si ushauri wa kisheria — liwekeni wazi hilo kwa wanajumuiya.",
        "hours": 4,
        "skills": [
          "makaratasi",
          "kuandika"
        ]
      },
      {
        "name": "Jengeni mfumo wa mawasiliano wa haraka",
        "description": "Andaeni mnyororo wa simu au kikundi cha ujumbe ili mpangaji anayepata notisi ya kufukuzwa au kufungiwa nje aufikie umoja haraka. Amueni nani anajibu na kwa kasi gani.",
        "hours": 3,
        "skills": [
          "kuratibu",
          "msaada wa kiufundi"
        ]
      },
      {
        "name": "Andaa kikao cha kujua haki zako",
        "description": "Endesheni kikao (ikiwezekana na mshirika wa msaada wa kisheria) kinachowapitisha wapangaji kwenye haki zao na cha kufanya wakipewa karatasi za mahakama. Toeni miongozo ya kuchukua nyumbani kwa lugha zinazotumika.",
        "hours": 4,
        "recurringCadence": "event",
        "skills": [
          "kufundisha",
          "kuongoza mazungumzo"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Andaeni utaratibu wa kukabili kufukuzwa",
        "description": "Andikeni hatua kwa hatua rahisi kwa anayekabiliwa na kufukuzwa: andika kila kitu, wasiliana na msaada wa kisheria kabla ya tarehe ya mwisho, kusanya msaada wa majirani, na kamwe usipuuze tarehe za mahakama.",
        "hours": 3,
        "skills": [
          "kuandika"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Unganeni na msaada wa kisheria wa kudumu",
        "description": "Jengeni uhusiano wa rufaa na mawakili wa wapangaji, msaada wa kisheria, na washauri wa masuala ya nyumba ili umoja uweze kukabidhi kesi zinazohitaji wataalamu. Wekeni mawasiliano yakiwa ya sasa.",
        "hours": 3,
        "skills": [
          "kufikia watu"
        ]
      }
    ]
  },
  {
    "id": "childcare-collective",
    "name": "Kikundi cha Kusaidiana Kulea Watoto",
    "purpose": "Kushirikiana malezi ya watoto yenye kuaminika kati ya familia ili wazazi waweze kufanya kazi, kupumzika, au kushughulikia dharura bila pesa kuhusika.",
    "whoItServes": "Wazazi na wanaolea watoto, hasa wazazi wanaolea peke yao, wanaofanya kazi kwa zamu, na familia za kipato kidogo.",
    "whatYoullNeed": "Kikundi cha familia zilizochunguzwa, mahali salama (au nyumba kwa zamu), mfumo wa ratiba, na kanuni wazi za usalama. Kulea watoto wa wengine ni jukumu zito — shikilieni kanuni thabiti za uangalizi, wachunguzeni wanaotunza watoto, na fuateni taratibu za kwenu kuhusu malezi yasiyo rasmi.",
    "setupHours": 28,
    "defaultCategory": "childcare",
    "suggestsWorkDays": true,
    "firstSteps": "Mradi huu hujengwa sebuleni kabla ya mahali pengine popote: kusanyeni familia za mwanzo na mzungumze mambo mahususi yasiyo ya kupendeza — uchunguzi, uangalizi, mitindo ya kuadabisha, kinachotokea mtoto akiumia — kabla yeyote hajapanga hata saa moja ya malezi. Angalieni taratibu za kwenu kuhusu malezi yasiyo rasmi kipindi kile kile cha kwanza, ili mfumo mnaokubaliana uwe ule mnaoweza kuuendesha kweli.",
    "commonPitfalls": "Mambo mawili huvunja vikundi vya kulea watoto kimya kimya: saa za malezi zisizolingana, pale familia zile zile zinapopokea wageni kila mara hadi zinaanza kuchukia, na kanuni za usalama zinazolegea kila mtu anapozidi kuzoeana — ruhusa ya mara-hii-tu kwa kanuni ya kutokuwa-peke-yake ndipo hasa imani inapovunjika. Wekeni saa za kila familia wazi na zichukulieni kanuni za usalama kwa uzito zaidi na familia mnazozifahamu vizuri kabisa.",
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
        "name": "Kusanya familia za mwanzo na mkubaliane mfumo",
        "description": "Tafuta familia zinazofahamiana au zinazoweza kujengeana imani. Amueni mfumo: kupokezana kulea watoto ambapo wazazi hupata na kutumia saa za malezi, au malezi ya kikundi kwa ratiba.",
        "hours": 4,
        "skills": [
          "kufikia watu",
          "kuongoza mazungumzo"
        ]
      },
      {
        "name": "Wekeni viwango vya usalama na uchunguzi",
        "description": "Kubalianeni uchunguzi kwa yeyote anayetunza watoto: watu wanaomfahamu, ukaguzi wa historia panapofaa, na kanuni thabiti kwamba mtu mzima mmoja hakai kamwe peke yake na mtoto wa familia nyingine bila kuonekana. Wekeni uwiano wa watu wazima kwa watoto.",
        "hours": 6,
        "skills": [
          "kulea watoto"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Tafuteni mahali na mkinge kwa ajili ya watoto",
        "description": "Chagueni ukumbi au wekeni viwango vya nyumba zinazopokea. Kagueni hatari, funikeni soketi, imarisheni samani nzito, fungieni dawa na kemikali mbali, na hakikisheni eneo la nje ni salama likitumika.",
        "hours": 4,
        "skills": [
          "kulea watoto",
          "kutengeneza nyumba"
        ]
      },
      {
        "name": "Anzisheni ratiba na mfumo wa saa",
        "description": "Tumieni kalenda ya pamoja au programu ya kikundi. Katika mfumo wa saa, saa moja ya kutunza watoto ni saa moja iliyoandikwa kwako. Andikeni nani anapokea wageni lini ili mzigo ubaki wa haki.",
        "hours": 3,
        "skills": [
          "kuratibu",
          "kuingiza data"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Wekeni taratibu za afya, aleji, na dharura",
        "description": "Kusanyeni taarifa za aleji, dawa, mawasiliano ya dharura, na walioruhusiwa kumchukua kila mtoto. Andikeni kanuni wazi ya mtoto mgonjwa na cha kufanya kwenye dharura ya kiafya.",
        "hours": 3,
        "skills": [
          "makaratasi",
          "kuandika"
        ]
      },
      {
        "name": "Fundisheni wanaotunza watoto mambo ya msingi",
        "description": "Pitieni uangalizi, ulalaji salama wa watoto wachanga, kukabili aleji na dharura, na kanuni za usalama. Himizeni angalau mtu mzima mmoja mwenye cheti cha msaada wa kwanza wa watoto na CPR kila kikao.",
        "hours": 5,
        "skills": [
          "kufundisha",
          "msaada wa kwanza"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Fanyeni kikao cha majaribio na mkusanye maoni",
        "description": "Fanyeni majaribio mafupi na familia chache, kisha mzungumze yaliyojiri. Rekebisheni yasiyofanya kazi kabla ya kupanuka. Julianeni hali mara kwa mara ili imani na usalama vibaki imara.",
        "hours": 3,
        "skills": [
          "kulea watoto"
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
    "name": "Mboji ya Jumuiya",
    "purpose": "Kukusanya mabaki ya chakula ili kupunguza taka zinazokwenda jalalani na kuzalisha mboji ya bure kwa bustani za mtaa.",
    "whoItServes": "Kaya zisizo na namna ya kutengeneza mboji, bustani za jumuiya, na mazingira ya mtaa.",
    "whatYoullNeed": "Eneo la mboji, mapipa ya kukusanyia, vifaa vya msingi, na zamu ndogo za matunzo.",
    "setupHours": 22,
    "defaultCategory": "infrastructure",
    "suggestsWorkDays": true,
    "firstSteps": "Zungumza na mwenyeji wa eneo na majirani walio umbali wa kunusa kabla pipa la kwanza halijafika — hofu ya harufu na panya huua maeneo ya mboji, na mazungumzo ya mapema ya uwazi huitua vizuri kuliko kipeperushi chochote. Kisha tafuta nyumbani kwa mboji yako ya baadaye (bustani ya jumuiya inayoihitaji) na angalau mtu mmoja aliyewahi kulitunza rundo la moto kweli; busara yake itaamua mbinu mtakayochagua.",
    "commonPitfalls": "Miradi ya mboji hufa pale hakuna anayemiliki kugeuza: rundo linasimama au linaanza kunuka, jirani analalamika, na mwenyeji anaondoa ruhusa — mnyororo huo huenda kasi kuliko unavyodhani. Linganisheni mabaki mnayokusanya na kile zamu zenu zinaweza kusindika kweli, na fungu moja lililochafuliwa lichukulieni kama tatizo la mabango la kurekebisha, si mtu wa kulaumiwa.",
    "pairsWith": [
      "community-garden",
      "community-meal"
    ],
    "tasks": [
      {
        "name": "Tafuta eneo la mboji",
        "description": "Pata mahali penye nafasi na jua kiasi — kona ya bustani ya jumuiya, kiwanja kilicho wazi, au ua wa mtu aliye tayari. Thibitisha ruhusa na uangalie taratibu za eneo kuhusu mboji.",
        "hours": 4,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Chagua mbinu ya mboji",
        "description": "Chagua kinacholingana na ukubwa wenu: mfumo wa vyumba vitatu vya rundo la moto, mapipa ya kuzungusha, au mapipa ya minyoo. Linganisha mbinu na kiasi cha malighafi mnachotarajia na kugeuza mnakoweza.",
        "hours": 3,
        "skills": [
          "mboji"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Pata mapipa na vifaa",
        "description": "Jengeni au nunueni mapipa ya kukusanyia na muundo wa mboji. Kusanyeni uma wa shambani, kipimajoto, na malighafi kavu (majani makavu, kadibodi) ya kusawazisha mabaki ya chakula.",
        "hours": 4,
        "skills": [
          "useremala",
          "kuendesha gari"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Anzisheni mfumo wa ukusanyaji",
        "description": "Amueni mabaki yanafikaje: pipa la kuletea lenye nyakati maalum, au njia ya kuzunguka kuyachukua. Wapeni washiriki ndoo ndogo za jikoni na ratiba wazi ya kuleta.",
        "hours": 4,
        "skills": [
          "kuratibu"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Wekeni wazi kinachopokelewa",
        "description": "Bandikeni orodha rahisi ya ndiyo/hapana (ndiyo: matunda, mboga, kahawa, maganda ya mayai; hapana: nyama, maziwa, mafuta, kinyesi cha wanyama). Mabango wazi huzuia uchafuzi unaoharibu fungu zima.",
        "hours": 2,
        "skills": [
          "kuandika",
          "kutafsiri"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Tafuteni na mfundishe zamu za matunzo",
        "description": "Mboji inahitaji kugeuzwa mara kwa mara, kuangaliwa unyevu, na kusawazishwa vibichi na vikavu. Jengeni ratiba ya pamoja na mfundishe waliojitokeza mambo ya msingi ili marundo yasinuke wala kusimama.",
        "hours": 3,
        "skills": [
          "mboji",
          "kufundisha"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Gawanyeni mboji iliyokamilika",
        "description": "Mboji ikiwa tayari, ishirikisheni bure kwa walioleta mabaki na bustani za jumuiya. Julisheni siku za kuchukua na mlete mifuko au ndoo.",
        "hours": 2,
        "skills": [
          "kuendesha gari"
        ],
        "recurringCadence": "cycle"
      }
    ]
  },
  {
    "id": "free-little-library",
    "name": "Maktaba Ndogo ya Bure na Kubadilishana Vitabu",
    "purpose": "Kutoa vitabu bure mchana na usiku kuhamasisha usomaji na kushirikiana, bila kadi ya maktaba wala tozo yoyote.",
    "whoItServes": "Watoto, familia, na wasomaji wa rika zote, hasa mitaa yenye upatikanaji mdogo wa vitabu.",
    "whatYoullNeed": "Sanduku la vitabu lisiloingiza maji, mkusanyo wa kuanzia, mahali pa mwenyeji, na matunzo mepesi.",
    "setupHours": 7.5,
    "defaultCategory": "education",
    "firstSteps": "Anza na mazungumzo mawili mafupi: moja na yule ambaye ukuta au ua wake utapokea sanduku, kuhusu mahali na kitakachotokea likichakaa, na jingine na familia na shule za karibu kuhusu vitabu ambavyo wangevichukua kweli. Mpate mtunzaji wako — atakayeliangalia kila wiki — kabla sanduku halijasimama, si baada.",
    "commonPitfalls": "Maktaba ndogo hazifi kwa uhaba wa vitabu — hufa kwa vitabu visivyofaa: mtu humwaga sanduku la vitabu vya kiada vilivyopitwa na wakati, vitabu vizuri huzikwa, mvua huingia, na watu huacha kuangalia kimya kimya. Ziara ya mtunzaji ya dakika tano kwa wiki huzuia karibu yote; sanduku linahitaji mtu kuliko linavyohitaji vitabu vya kuletewa.",
    "pairsWith": [
      "seed-library",
      "books-to-prisoners"
    ],
    "tasks": [
      {
        "name": "Jenga au pata sanduku lisiloingiza maji",
        "description": "Tengeneza au nunua sanduku imara lisilopitisha maji juu ya nguzo au ukutani. Kabati kuukuu lililorekebishwa linafaa. Weka mlango wa kuona ndani na paa la mteremko ili vitabu vikae vikavu.",
        "hours": 4,
        "skills": [
          "useremala"
        ]
      },
      {
        "name": "Chagua na uandae mahali",
        "description": "Chagua mahali penye wapita njia na ruhusa — ua wako wa mbele, kituo cha jumuiya, au pembeni mwa bustani. Simamisha sanduku imara na uthibitishe panaruhusiwa.",
        "hours": 1,
        "skills": [
          "kufikia watu"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Jaza mkusanyo wa kwanza",
        "description": "Kusanya vitabu vinavyotolewa kupitia mwito mdogo. Lenga mchanganyiko: vitabu vya watoto, hadithi zinazopendwa, na vya maarifa ya vitendo. Anza nusu ili kubaki nafasi ya kuongeza.",
        "hours": 1.5,
        "skills": [
          "kufikia watu"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Weka bango na desturi rahisi",
        "description": "Bandika “Chukua kitabu, acha kitabu — vyote bure.” Liwe la kukaribisha, lisilo na masharti mengi. Ongeza ujumbe unaokaribisha rika zote na lugha zote.",
        "hours": 0.5,
        "skills": [
          "kuandika"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Tafuta mtunzaji",
        "description": "Omba mtu wa karibu aliangalie sanduku kila wiki: alipange, aondoe chochote kilichoharibika au kisichofaa, na asawazishe vitabu. Dakika tano kwa wiki zinalitunza.",
        "hours": 0.5,
        "skills": [
          "kufikia watu"
        ]
      }
    ]
  },
  {
    "id": "community-first-aid-training",
    "name": "Mafunzo ya Msaada wa Kwanza na Kukabili Dozi Iliyozidi",
    "purpose": "Kuwafundisha majirani msaada wa kwanza, CPR, na kugeuza dozi iliyozidi ili jumuiya iweze kujibu katika dakika zile kabla wataalamu hawajafika.",
    "whoItServes": "Kila mtu; ina matokeo makubwa hasa pale gari la wagonjwa linapochelewa au dozi zilizozidi zinapotokea mara nyingi.",
    "whatYoullNeed": "Wakufunzi wenye vyeti, vifaa, mahali, na ratiba inayojirudia. Mafunzo yote ya kiafya yanapaswa kutolewa na wakufunzi wenye vyeti; mradi huu unaandaa na kukaribisha mafunzo hayo, haubadilishi wataalamu.",
    "setupHours": 17,
    "defaultCategory": "education",
    "firstSteps": "Mazungumzo yako ya kwanza ni na watakaofundisha kweli — tawi la Msalaba Mwekundu, idara ya afya, au kikundi cha kupunguza madhara. Waulize wanahitaji nini kutoka kwa mwenyeji na tarehe zipi wanaweza kutoa, kisha zungumza na walio karibu zaidi kushuhudia dharura — familia za wanaotumia dawa za kulevya, wafanyakazi wa biashara za jirani — ili vikao vya kwanza vijengwe kuwazunguka wao.",
    "commonPitfalls": "Mradi huu hufifia unapokuwa tukio moja kubwa la mafunzo lisilojirudia — ujuzi hufifia na naloxone huisha muda wake bila mtu kugundua. Na zuieni hamu ya kufundisha wenyewe maudhui ya kiafya; kazi yenu ni kukaribisha wakufunzi wenye vyeti, si kusimama badala yao.",
    "pairsWith": [
      "harm-reduction-supplies",
      "emergency-preparedness"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Shirikiana na wakufunzi wenye vyeti",
        "description": "Ungana na wakufunzi wenye sifa — Msalaba Mwekundu, idara ya afya ya eneo lenu, au shirika la kupunguza madhara. Wao ndio hutoa mafunzo halisi ya kiafya; kazi yako ni kuyaandaa na kuyakaribisha.",
        "hours": 4,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Pata vifaa",
        "description": "Pata kit za msaada wa kwanza, midoli ya mazoezi ya CPR (mara nyingi huazimwa na wakufunzi), na naloxone. Programu nyingi za afya ya jamii hugawa naloxone bure — uliza idara ya afya au vikundi vya kupunguza madhara.",
        "hours": 3,
        "skills": [
          "kufikia watu",
          "kuendesha gari"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Tafuta mahali na upange vikao",
        "description": "Hifadhi chumba kinachotosha mazoezi ya vitendo — kituo cha jumuiya, maktaba, au zahanati. Weka tarehe zinazojirudia ili watu wapange kuzunguka kazi zao.",
        "hours": 2,
        "skills": []
      },
      {
        "name": "Karibisha washiriki",
        "description": "Eneza habari za vikao kwa mapana na uwape kipaumbele walio karibu kushuhudia dharura. Kujiunga kuwe rahisi na bure, na toa nyakati tofauti kwa wanaofanya kazi kwa zamu.",
        "hours": 2,
        "skills": [
          "kufikia watu"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Endesha vikao vya mafunzo",
        "description": "Karibisha vikao vinavyoongozwa na mkufunzi, shughulikia maandalizi na mapokezi, na hakikisha kila mtu anapata mazoezi ya vitendo. Toa kadi za marejeo za kuchukua nyumbani.",
        "hours": 4,
        "skills": [
          "kuratibu"
        ],
        "follows": [
          0,
          1,
          3
        ],
        "recurringCadence": "session"
      },
      {
        "name": "Gawa kit na vikao vya kurudia",
        "description": "Warudishe waliofunzwa nyumbani na kit ya msaada wa kwanza na naloxone inapopatikana. Panga vikao vya kurudia mara kwa mara ili ujuzi ukae mkali.",
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
    "name": "Benki ya Muda",
    "purpose": "Kuwawezesha wanajumuiya kubadilishana msaada kwa saa — saa moja ya msaada uliyotoa ni saa moja kwako — na kazi ya kila mtu inathaminiwa sawasawa.",
    "whoItServes": "Mtu yeyote, hasa wenye muda na ujuzi mwingi lakini pesa chache.",
    "whatYoullNeed": "Orodha ya wanajumuiya, mfumo wa kuandika saa, mratibu, na kanuni zilizokubaliwa.",
    "setupHours": 27,
    "defaultCategory": "organizing",
    "firstSteps": "Anza na mazungumzo, si programu: kaa na majirani kumi au kumi na watano na umuulize kila mmoja angetoa nini na angeomba nini. Kama mazungumzo hayo hayaibui aina mbalimbali — lifti, kufundisha, kutengeneza vitu, kupika — endelea kukaribisha watu kabla ya kujenga mfumo.",
    "commonPitfalls": "Benki za muda mara chache hufa kwa kashfa; hufa kwa ukimya — watu hujiunga, hakuna anayeomba kwanza, na kila kitu kinanyamaza. Mratibu awe anaunganisha watu kwa bidii miezi ya kwanza, na shikilieni mstari wa saa-moja-ni-saa-moja: mnapoanza kujadili kama saa ya fundi bomba inazidi ya anayelea watoto, inakoma kuwa benki ya muda.",
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
        "name": "Karibisha wanajumuiya wa mwanzo na uorodheshe ujuzi",
        "description": "Kusanya kikundi cha kwanza na umuulize kila mmoja anaweza kutoa nini (lifti, kufundisha, kutengeneza vitu, kupika, bustani) na anahitaji nini. Aina mbalimbali za msaada ndizo zinazoifanya ifanye kazi.",
        "hours": 5,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Chagua mfumo wa kuandika saa",
        "description": "Chagua namna ya kuandika saa: programu maalum ya benki ya muda, spreadsheet ya pamoja, au daftari rahisi. Lazima iandike nani alitoa na nani alipokea saa za msaada.",
        "hours": 4,
        "skills": [
          "msaada wa kiufundi",
          "kuingiza data"
        ]
      },
      {
        "name": "Wekeni kanuni",
        "description": "Kubalianeni msingi mkuu (saa moja ya msaada ni saa moja, kazi iwe yoyote), jinsi wanajumuiya wanavyoomba na kuthibitisha mabadilishano, na kinachotokea saa za mtu zikipungua sana.",
        "hours": 4,
        "skills": [
          "kuongoza mazungumzo",
          "kuandika"
        ]
      },
      {
        "name": "Wakaribishe wanajumuiya wapya",
        "description": "Fanyeni kikao kifupi cha utangulizi ili watu waelewe moyo wake na mfumo wake. Mpe kila mmoja saa chache za mbegu ili mabadilishano yaanze mara moja.",
        "hours": 4,
        "skills": [
          "kufundisha"
        ],
        "follows": [
          1,
          2
        ]
      },
      {
        "name": "Zindua orodha ya msaada unaotolewa",
        "description": "Weka wazi orodha inayotafutika ya nani anatoa nini. Iweke ya sasa ili wanajumuiya wapate msaada bila kumuuliza mratibu kila mara.",
        "hours": 4,
        "skills": [
          "kuingiza data"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Ratibu na uunganishe mabadilishano",
        "description": "Mratibu asaidie kuunganisha mahitaji na msaada unaotolewa, hasa mwanzoni, na awakumbushe kwa upole walio kimya. Baada ya muda wanajumuiya wataungana wenyewe moja kwa moja.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "kuratibu"
        ],
        "follows": [
          4
        ]
      },
      {
        "name": "Jengeni desturi za kuaminiana na usalama",
        "description": "Wekeni desturi kwa mabadilishano yanayohusu nyumba au wanajumuiya wanaohitaji uangalizi zaidi (watu wanaowafahamu, kutokutana peke yenu panapoleta wasiwasi). Ongezeni njia rahisi ya kutia alama tatizo.",
        "hours": 4,
        "skills": [
          "kuongoza mazungumzo"
        ]
      }
    ]
  },
  {
    "id": "solidarity-fund",
    "name": "Mfuko wa mshikamano (msaada wa pesa wa moja kwa moja)",
    "purpose": "Kusanya pesa pamoja ili kuwapa majirani waliokumbwa na shida pesa za moja kwa moja, bila masharti yoyote.",
    "whoItServes": "Watu waliokumbwa na shida za ghafla — kodi ya nyumba iliyopungukiwa, bili ya matibabu, umeme unaokaribia kukatwa.",
    "whatYoullNeed": "Mfumo wa pesa ulio wazi, timu ndogo ya kuutunza mfuko, mpango wa kukusanya pesa, na vigezo vilivyo wazi. Kushika pesa za pamoja ni jukumu la kweli — tumia sahihi mbili kwa kila utoaji, tunza kumbukumbu safi, linda faragha ya wanaopokea, na tafuta ushauri kuhusu upande wa kisheria na wa kodi wa mfuko wako.",
    "setupHours": 23,
    "defaultCategory": "mutual_aid_drive",
    "firstSteps": "Kabla hujakusanya hata senti moja, keti na wale watu wachache unaowaamini kushika pesa za pamoja mzungumze kwa uwazi: sahihi mbili zitafanyaje kazi, nini kitawekwa hadharani, na nini kitatokea wanaoomba wakizidi pesa zilizopo. Kisha tafuta shirika lisilo la faida la hapa kwenu au mhasibu wa kukuongoza kwenye upande wa kisheria na wa kodi kabla akaunti haijafunguliwa.",
    "commonPitfalls": "Pesa huvunja uaminifu haraka kuliko kitu kingine chochote — utoaji mmoja usioelezwa au kumbukumbu zilizochafuka vinaweza kuumaliza mfuko hata kama hakuna aliyekosea. Na karibu kila mara wanaoomba watakuwa wengi kuliko pesa; kama vigezo havikukubaliwa mapema, kusema hapana mtu kwa mtu huichosha timu na kuotesha chuki.",
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
        "name": "Unda timu ndogo ya kuutunza mfuko",
        "description": "Alika watu wachache unaowaamini kuutunza mfuko. Wekeni majukumu wazi na mkubaliane kuwa wazi tangu siku ya kwanza — hapa uaminifu ndio kila kitu.",
        "hours": 3,
        "skills": [
          "kuratibu"
        ]
      },
      {
        "name": "Panga ushikaji wa pesa ulio wazi",
        "description": "Fungua akaunti maalum ya mfuko au jiunge chini ya shirika lisilo la faida. Weka sharti la sahihi mbili kwa kila utoaji wa pesa, tunza kumbukumbu iliyo wazi, na chunguza kama muundo wenu una masuala ya kodi au ya kisheria — uliza shirika lisilo la faida la hapa kwenu au mhasibu.",
        "hours": 5,
        "skills": [
          "uhasibu",
          "makaratasi"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Weka vigezo vya kuomba na vya kutoa pesa",
        "description": "Amueni nani anaweza kuomba, kiasi cha kawaida, mtu anaweza kuomba mara ngapi, na kama ni wa kwanza kufika au kwa kupima uhitaji. Weka masharti machache, na epuka kumtaka mtu athibitishe shida zake pale inapowezekana.",
        "hours": 4,
        "skills": [
          "kuongoza mazungumzo"
        ]
      },
      {
        "name": "Tengeneza fomu fupi, rahisi ya kuomba msaada",
        "description": "Tengeneza fomu fupi na ya faragha inayouliza tu yanayohitajika. Toa njia kadhaa za kuomba (mtandaoni, kwa simu, ana kwa ana) na linda faragha ya wanaoomba.",
        "hours": 2,
        "skills": [
          "kuandika"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Anzisha ukusanyaji wa pesa",
        "description": "Unganisha ahadi ndogo za kila mwezi kutoka kwa wanajumuiya na kampeni za mara kwa mara. Waeleze wazi wanaotoa: pesa zinakwenda moja kwa moja kwa majirani walio katika shida.",
        "hours": 4,
        "skills": [
          "kufikia watu"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Jenga mchakato wa maamuzi na utoaji",
        "description": "Weka ahadi ya muda wa jibu, mapitio mafupi ya timu, na njia za kufikisha pesa haraka. Katika shida, kasi ni muhimu. Andika kila uamuzi kwa ufupi.",
        "hours": 3,
        "skills": [
          "kuratibu"
        ],
        "follows": [
          1,
          2
        ]
      },
      {
        "name": "Toa taarifa kwa uwazi",
        "description": "Shiriki muhtasari wa mara kwa mara — pesa zilizoingia, zilizotoka, idadi ya majirani waliosaidiwa — bila kufichua utambulisho wa waliopokea. Uwazi huwafanya watoaji waendelee kutoa.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "kuandika",
          "uhasibu"
        ]
      }
    ]
  },
  {
    "id": "diaper-hygiene-bank",
    "name": "Benki ya nepi na vifaa vya usafi",
    "purpose": "Gawa bure nepi, taulo za kike, na vifaa vya usafi — vitu ambavyo msaada wa chakula wa kawaida haununui.",
    "whoItServes": "Familia za kipato kidogo, watoto wachanga, wanaopata hedhi, na majirani wasio na makazi.",
    "whatYoullNeed": "Mahali pa kuhifadhia, mtiririko wa vifaa, vituo vya kugawia, na watu waliojitokeza kusaidia.",
    "setupHours": 10,
    "defaultCategory": "mutual_aid_drive",
    "suggestsWorkDays": true,
    "firstSteps": "Zungumza kwanza na wale wanaoziona familia hizi kila siku — kliniki ya watoto, kituo cha kugawa chakula, kanisa au msikiti — uwaulize saizi na bidhaa zipi huisha kweli, na kama wangekubali kugawia hapo kwao. Mazungumzo hayo moja yanakuokolea miezi ya kubahatisha.",
    "commonPitfalls": "Kinachoumiza zaidi ni kutotabirika: kampeni moja kubwa, rafu zimejaa, halafu miezi mitupu wakati familia zimeanza kukutegemea. Angalia pia hesabu halisi — saizi za wachanga hujilundika wakati saizi kubwa zinaisha — na kamwe usiombe uthibitisho wa uhitaji; heshima ni sehemu ya msaada wenyewe.",
    "pairsWith": [
      "welcome-wagon",
      "laundry-shower-access"
    ],
    "tasks": [
      {
        "name": "Tafuta mahali pa kuhifadhia na kituo cha kugawia",
        "description": "Pata hifadhi kavu inayofungwa na mahali pa kukabidhia vitu — kabati kwenye kliniki, kanisa, msikiti, au kituo cha jumuiya. Mahali pa kugawia panapaswa kuhisi faragha na heshima.",
        "hours": 2,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Panga vyanzo vya vifaa",
        "description": "Unganisha kununua kwa jumla, kampeni za kukusanya vitu, na mawasiliano na mitandao ya benki za nepi au wauzaji wa jumla. Fuatilia vyanzo vilivyo imara ili rafu zisikauke.",
        "hours": 3,
        "skills": [
          "kufikia watu",
          "kuendesha gari"
        ]
      },
      {
        "name": "Panga na uhesabu kwa saizi na aina",
        "description": "Panga nepi kwa saizi, pamoja na taulo za kike na vifaa vya usafi. Weka hesabu inayoendelea ili ujue cha kuomba. Saizi za watoto wakubwa kidogo mara nyingi huisha.",
        "hours": 1.5,
        "skills": [
          "kuratibu",
          "kuingiza data"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Weka utaratibu wa kugawa ulio wa haki",
        "description": "Amua kila familia inapata kiasi gani na mara ngapi, bila sharti la uthibitisho wa uhitaji. Ufanye utabirike ili watu waweze kuutegemea.",
        "hours": 1,
        "skills": [
          "kuongoza mazungumzo"
        ]
      },
      {
        "name": "Panga siku za kugawa na uwapange watu",
        "description": "Weka siku za kugawa za kudumu, alika waliojitokeza kugawa vifaa, na dumisha hali ya ukarimu isiyohukumu.",
        "hours": 2.5,
        "skills": [
          "kuratibu"
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
    "name": "Karakana ya baiskeli ya jumuiya",
    "purpose": "Toa bure nafasi, zana, na msaada wa kutengeneza, kuunda, na kujipatia baiskeli, ili usafiri uwe nafuu na wa kufikiwa na wote.",
    "whoItServes": "Watu wasio na magari, vijana, wasafiri wa kila siku, na yeyote anayehitaji usafiri nafuu.",
    "whatYoullNeed": "Nafasi, zana, baiskeli na vipuri vilivyotolewa, na mafundi waliojitokeza.",
    "setupHours": 20,
    "defaultCategory": "transport",
    "suggestsWorkDays": true,
    "firstSteps": "Kabla ya kuwinda nafasi, zungumza na watu watakaotumia karakana na mafundi watakaofundisha — na kama kuna karakana ya baiskeli ya jumuiya mji wa karibu, itembelee uwaulize wangefanya nini tofauti. Na mwenyeji wa mahali, maliza mapema masuala ya kuhifadhi, kuingia, na bima.",
    "commonPitfalls": "Karakana hufa waliojitokeza wanapotengeneza baiskeli badala ya kufundisha watu kuzitengeneza: inageuka gereji ya bure, foleni inarefuka, na mafundi wako wanachoka kabisa. Jihadhari pia na kuzama kwenye baiskeli chakavu zilizotolewa — chambua bila huruma — na kamwe usiruhusu baiskeli itoke bila ukaguzi wa usalama wa breki na matairi.",
    "pairsWith": [
      "repair-cafe",
      "rides-transportation",
      "tool-lending-library"
    ],
    "tasks": [
      {
        "name": "Tafuta nafasi ya karakana",
        "description": "Pata gereji, chumba cha chini, kontena, au nafasi ya pamoja ya jumuiya yenye nafasi ya kufanyia kazi na kuhifadhi baiskeli. Hakikisha ruhusa ya kuingia na mahitaji yoyote ya bima.",
        "hours": 4,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Kusanya zana na stendi ya kutengenezea",
        "description": "Kusanya seti ya msingi ya zana za baiskeli na angalau stendi moja ya kutengenezea kupitia vitu vilivyotolewa au bajeti ndogo. Panga zana ziwe rahisi kupatikana na kurudishwa.",
        "hours": 5,
        "skills": [
          "kuendesha gari"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Kusanya baiskeli na vipuri vilivyotolewa",
        "description": "Toa wito wa baiskeli zisizotumika na vipuri vinavyofaa. Chambua kuwa “zinatengenezeka”, “za vipuri”, na “tayari kuendeshwa”. Lundo la vipuri ndilo linaloiweka karakana hai.",
        "hours": 4,
        "skills": [
          "kutengeneza",
          "kuendesha gari"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Tafuta mafundi waliojitokeza",
        "description": "Tafuta watu wachache wanaoweza kutengeneza baiskeli na, muhimu zaidi, kuwafundisha wengine. Lengo ni kusaidia watu wajifunze kutengeneza zao wenyewe, si kuwafanyia.",
        "hours": 3,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Weka nyakati za kufungua na utaratibu wa jifunze-upate-baiskeli",
        "description": "Chagua nyakati za kufungua zinazotabirika. Fikiria utaratibu wa jifunze-upate-baiskeli: mtu anajifunza utengenezaji kwa vipindi vichache na kuondoka na baiskeli aliyoitengeneza mwenyewe.",
        "hours": 2,
        "skills": [
          "kuratibu"
        ]
      },
      {
        "name": "Weka desturi za usalama",
        "description": "Weka sharti la miwani ya kinga, kanuni za matumizi ya zana, na vifaa vya msaada wa kwanza viwepo. Kila mara fanya ukaguzi wa usalama (breki, matairi, headset) kabla baiskeli yoyote haijatoka.",
        "hours": 2,
        "skills": [
          "kuandika"
        ]
      }
    ]
  },
  {
    "id": "newcomer-translation-network",
    "name": "Mtandao wa msaada kwa wageni wapya na tafsiri",
    "purpose": "Saidia wahamiaji na wakimbizi kumudu mahali papya — tafsiri, makaratasi, kufahamishwa mahali, na kuunganishwa na jumuiya.",
    "whoItServes": "Wahamiaji na wakimbizi waliofika karibuni, na majirani wasiozungumza vizuri lugha inayotumika hapa.",
    "whatYoullNeed": "Waliojitokeza wenye lugha mbili, mashirika ya kushirikiana nayo, vifaa vya kumfahamisha mgeni, na mfumo wa kupokea mahitaji. Kuwa makini hasa na faragha: usikusanye hali ya uhamiaji, peleka kila swali la kisheria kwa mawakili wa uhamiaji wenye sifa, na waache wanajumuiya wenyewe waongoze kuhusu msaada wanaoutaka kweli.",
    "setupHours": 22,
    "defaultCategory": "other",
    "firstSteps": "Anza kwa kuzungumza na jumuiya za wageni wapya zenyewe na mashirika yanayowasindikiza tayari — waache wao waseme msaada wanaoutaka badala ya kuwabunia. Na kabla hitaji la kwanza halijafika, andaa pa kupeleka: mawakili wa uhamiaji wenye sifa utakaowapelekea kila swali la kisheria.",
    "commonPitfalls": "Hatari kubwa zaidi ni waliojitokeza wenye nia njema kuteleza kutoka kutafsiri hadi kutoa ushauri wa kisheria au wa kiafya wasio na sifa nao — mwongozo mbaya wa uhamiaji unaweza kumwumiza mtu vibaya sana. Na kusanya data kidogo kabisa: kumbukumbu moja ya uzembe kuhusu hali ya mtu inaweza kumweka hatarini kweli.",
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
        "name": "Tafuta waliojitokeza wenye lugha mbili au zaidi",
        "description": "Tafuta waliojitokeza wanaozungumza lugha zinazopatikana sana eneo lenu na wanaoweza kusaidia tafsiri, fomu, na kusindikiza. Linganisha lugha na mahitaji halisi ya hapo.",
        "hours": 4,
        "skills": [
          "kutafsiri",
          "kufikia watu"
        ]
      },
      {
        "name": "Chora ramani ya vituo na mashirika ya hapa kwenu",
        "description": "Jenga orodha ya kliniki, shule, msaada wa kisheria, madarasa ya kujifunza lugha, vyanzo vya chakula, na mashirika yanayowasaidia wahamiaji. Mara nyingi wageni wapya wanahitaji tu kujua kipi kipo na jinsi ya kukifikia.",
        "hours": 5,
        "skills": [
          "kufikia watu",
          "kuingiza data"
        ]
      },
      {
        "name": "Jenga mfumo wa kupokea na kuunganisha",
        "description": "Tengeneza njia rahisi kwa wageni wapya kuomba msaada na kuunganishwa na aliyejitokeza kwa lugha na hitaji. Toa njia za simu na za ana kwa ana, si mtandaoni tu.",
        "hours": 3,
        "skills": [
          "kuratibu",
          "msaada wa kiufundi"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Tengeneza vifaa vya kumfahamisha mgeni",
        "description": "Kusanya miongozo ya lugha rahisi katika lugha husika ikigusa usafiri, shule, afya, na haki za msingi. Tumia picha ili ifae kila kiwango cha kusoma.",
        "hours": 4,
        "skills": [
          "kuandika",
          "kutafsiri"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Toa usindikizaji kwenye miadi",
        "description": "Panga waliojitokeza waende na watu kwenye miadi ya matibabu, shule, au ofisi ili kutafsiri na kuwa karibu. Waelekeze kutafsiri kwa uaminifu, si kutoa ushauri wasio na sifa nao.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "kutafsiri"
        ],
        "follows": [
          0,
          2
        ]
      },
      {
        "name": "Weka desturi za faragha na usalama",
        "description": "Kusanya taarifa chache kabisa zinazohitajika na kamwe usiulize wala kuandika hali ya uhamiaji. Hifadhi data kwa usalama na uwaandae waliojitokeza kushughulikia hali nyeti kwa busara.",
        "hours": 3,
        "skills": [
          "kuandika"
        ]
      }
    ]
  },
  {
    "id": "community-meal",
    "name": "Chakula cha pamoja / jiko la wote",
    "purpose": "Pika na kushiriki milo ya pamoja ya bure kwa ratiba ya kudumu, bila maswali yoyote.",
    "whoItServes": "Yeyote mwenye njaa, aliye peke yake, au asiye na uhakika wa chakula; pia hujenga uhusiano mtaa mzima.",
    "whatYoullNeed": "Jiko, wapishi, mtiririko wa viungo, mahali pa kulia chakula, na timu ya waliojitokeza. Kulisha watu wengi kuna majukumu halisi ya usalama wa chakula — angalia kanuni za hapa kwenu kuhusu vibali na waliofuzu mafunzo ya kushika chakula, na fuata kanuni salama za kuhifadhi na za joto kila mara.",
    "setupHours": 22,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Mazungumzo yako mawili ya kwanza: na mwenyeji wa jiko — ukumbi wa kanisa, msikiti, au kituo cha jumuiya — kuhusu siku unazozipanga, na na mamlaka ya afya ya hapa kwenu kuhusu vibali na ushikaji wa chakula; hayo mawili yanaunda kila kitu kingine. Kisha waulize watakaokuja kula: siku ipi na wakati upi unawafaa kweli.",
    "commonPitfalls": "Kosa moja la usalama wa chakula linaweza kumdhuru mtu na kuumaliza mradi — kanuni za joto na uhifadhi hazirukwi, hata mara moja. Kifo cha polepole zaidi ni wale wale watatu kupika kila mlo hadi wanachoka kabisa, kwa hiyo panua timu na pokezaneni mpishi mkuu tangu mwanzo.",
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
        "name": "Tafuta jiko na mahali pa kulia",
        "description": "Pata jiko kubwa la kutosha kupika kwa wingi — ukumbi wa kanisa, kituo cha jumuiya, au jiko la kibiashara — pamoja na nafasi ya kupakulia. Hakikisha linapatikana siku ulizozipanga.",
        "hours": 3,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Shughulikia usalama wa chakula na vibali",
        "description": "Angalia kanuni za hapa kwenu za kulisha watu wengi. Huenda ukahitaji kibali, mtu aliyefuzu mafunzo ya kushika chakula awepo, au jiko lenye leseni. Jifunze uhifadhi salama na ushikaji wa joto.",
        "hours": 4,
        "skills": [
          "usalama wa chakula"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Jenga mtiririko wa chakula",
        "description": "Unganisha vitu vinavyotolewa na maduka na migahawa, manunuzi ya jumla, na ziada yoyote ya bustani au ya kuokota masalia ya mavuno. Fuatilia vyanzo vya uhakika ili upange menyu kwa kile utakachokuwa nacho.",
        "hours": 3,
        "skills": [
          "kufikia watu",
          "kuendesha gari"
        ]
      },
      {
        "name": "Panga menyu kwa wingi, mahitaji ya vyakula, na aleji",
        "description": "Buni milo rahisi yenye lishe inayopikika kwa wingi na kuvuta viungo mbali. Weka chaguo lisilo na nyama na uweke lebo wazi kwa vichocheo vya aleji vinavyojulikana.",
        "hours": 2,
        "recurringCadence": "session",
        "skills": [
          "kupika"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Kusanya timu ya kupika na kupakua",
        "description": "Kusanya waliojitokeza kwa maandalizi, kupika, kupakua, na usafi. Weka mpishi mkuu kwa kila mlo na majukumu yawe wazi ili upakuaji uende laini.",
        "hours": 3,
        "skills": [
          "kupika",
          "kuratibu"
        ]
      },
      {
        "name": "Weka ratiba na usambaze habari",
        "description": "Chagua siku na wakati wa kudumu ili watu wautegemee. Sambaza kwa vipeperushi, makazi ya muda, na mdomo kwa mdomo, ukiweka sauti ya ukarimu iliyo wazi kwa wote.",
        "hours": 2,
        "skills": [
          "kubuni michoro"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Endesha mlo na usafishe",
        "description": "Pika, pakua kwa heshima (kupelekea mezani ni bora kuliko foleni inapowezekana), na safisha jiko kwa viwango vinavyohitajika. Fungasha vilivyobaki kwa usalama ili vigawiwe tena.",
        "hours": 5,
        "skills": [
          "kupika"
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
    "name": "Maktaba ya mbegu na mabadilishano ya mbegu",
    "purpose": "Shiriki mbegu za bure ili watu walime chakula, huku aina za urithi na zilizozoea eneo hili zikihifadhiwa.",
    "whoItServes": "Wakulima wa nyumbani, wanaoanza kulima, na bustani za jumuiya.",
    "whatYoullNeed": "Mfumo wa kuhifadhi na kuorodhesha, mbegu zilizotolewa, mwenyeji, na watunzaji wachache.",
    "setupHours": 8,
    "defaultCategory": "food",
    "firstSteps": "Zungumza na maktaba au kituo cha jumuiya kuhusu kuweka kabati, na na wakulima wenye uzoefu wa hapa kuhusu kinachoota kweli eneo lenu — mafanikio ya wanaoanza yanategemea mbegu zinazofaa mahali hapa. Kitalu cha karibu au bustani ya jumuiya mara nyingi watafurahi kutoa mbegu za kuanzia.",
    "commonPitfalls": "Maktaba ya mbegu hufa kimya kimya: mbegu za zamani zisizoota, wanaoanza wanaohitimisha kuwa hawawezi kulima wasirudi tena. Zungusha mbegu zilizopo bila huruma, na usitegemee marejesho — karibu hakuna anayehifadhi mbegu kuzirudisha — kwa hiyo panga kujaza upya kwa zinazotolewa, si kwa zinazorudi.",
    "pairsWith": [
      "community-garden",
      "free-little-library"
    ],
    "tasks": [
      {
        "name": "Tafuta mwenyeji na mfumo wa kuhifadhi",
        "description": "Shirikiana na maktaba, kituo cha jumuiya, au bustani ili kuweka kabati dogo au seti ya droo. Hifadhi mbegu mahali penye ubaridi, pakavu na penye giza katika bahasha zenye lebo.",
        "hours": 2,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Tafuta mbegu za kuanzia",
        "description": "Kusanya mbegu kutoka kwa wakulima, ziada ya makampuni ya mbegu, na pakiti za mwisho wa msimu. Pendelea aina rahisi zinazofaa eneo hili ili wanaoanza wafanikiwe.",
        "hours": 2,
        "skills": [
          "kufikia watu",
          "kulima bustani"
        ]
      },
      {
        "name": "Panga na uweke lebo mkusanyo",
        "description": "Panga kwa aina (mboga, viungo, maua) na ugumu. Weka lebo ya mmea, mwaka, na maelezo mafupi ya kuotesha kwa kila moja. Onyesha zipi ni rahisi kuhifadhi mbegu zake.",
        "hours": 2,
        "skills": [
          "kulima bustani",
          "kuingiza data"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Weka desturi za kuchukua na kushiriki",
        "description": "Iwe rahisi: chukua mbegu bure, otesha, na ikiwezekana hifadhi urudishe kiasi mwisho wa msimu. Bandika mwongozo wa ukurasa mmoja wa jinsi inavyofanya kazi.",
        "hours": 1,
        "skills": [
          "kuandika"
        ]
      },
      {
        "name": "Tunza uotaji na ujaze upya",
        "description": "Mbegu hupoteza uwezo wa kuota kadri muda unavyopita. Ondoa za zamani, fanya majaribio ya kuota kwa makundi yenye shaka, na jaza upya aina zinazopendwa.",
        "hours": 1,
        "skills": [
          "kulima bustani"
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
    "name": "Ujuzi wa kidijitali na kuazimisha vifaa",
    "purpose": "Azimisha vifaa na fundisha ujuzi wa kidijitali ili kuziba pengo kwa watu wasio na teknolojia au intaneti ya uhakika.",
    "whoItServes": "Wazee, majirani wa kipato kidogo, wanaotafuta kazi, na yeyote aliyefungiwa nje ya mambo ya mtandaoni.",
    "whatYoullNeed": "Vifaa vilivyotolewa, intaneti, walimu waliojitokeza, na nafasi.",
    "setupHours": 27,
    "defaultCategory": "tech",
    "firstSteps": "Zungumza kwanza na watu unaotaka kuwafikia — maktaba, pale wazee wanapokutana, kwenye foleni ya kugawa chakula — uwaulize wanataka kufanya nini hasa: kuonana na daktari kwa simu, kuomba kazi, picha za wajukuu. Kisha zungumza na maktaba kuhusu nafasi na intaneti kabla hujakusanya kifaa hata kimoja.",
    "commonPitfalls": "Kumwazimisha mtu kifaa bila kutatua intaneti ni kumwazimisha jiwe la kukandamizia makaratasi — muunganisho ni nusu ya mradi. Vipindini, kosa la kawaida ni walimu kunyakua kipanya na kuongea kwa maneno ya kitaalamu; na kamwe usiazimishe tena kifaa bila kukifuta kabisa, kwa sababu data ya aliyeazima mmoja ikivuja inavunja uaminifu wote uliojengwa.",
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
        "name": "Kusanya na uandae vifaa",
        "description": "Kusanya laptop, tableti, na simu zilizotolewa. Futa kila kimoja kwa usalama, kisasishe, na ukiandae kiwe rahisi kutumia. Jaribu kila kitu kinafanya kazi kabla ya kukiazimisha.",
        "hours": 8,
        "skills": [
          "msaada wa kiufundi",
          "kuendesha gari"
        ]
      },
      {
        "name": "Weka mfumo wa kuazimana",
        "description": "Tengeneza daftari rahisi: nani ameazima nini, hali yake, na tarehe ya kurudisha. Amua urefu wa muda na utaratibu wa kurudisha wenye huruma, uliojengwa juu ya kuaminiana.",
        "hours": 3,
        "skills": [
          "kuingiza data"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Panga upatikanaji wa intaneti",
        "description": "Kifaa hakina faida kubwa bila muunganisho. Azimisha vifaa vya hotspot, shirikiana na maktaba, au waelekeze watu kwenye vifurushi nafuu vya intaneti na Wi-Fi ya bure ya hadharani.",
        "hours": 3,
        "skills": [
          "msaada wa kiufundi",
          "kufikia watu"
        ]
      },
      {
        "name": "Tafuta na uandae walimu",
        "description": "Tafuta waliojitokeza wenye subira uwaandae kufundisha bila maneno ya kitaalamu. Sisitiza kwenda kwa kasi ya mwanafunzi na kutokamata kipanya kamwe.",
        "hours": 4,
        "skills": [
          "kufundisha"
        ]
      },
      {
        "name": "Buni mtaala wa wanaoanza",
        "description": "Jenga masomo mafupi ya mambo ya msingi: barua pepe, usalama mtandaoni, kuomba kazi, kuonana na daktari kwa simu, fomu za serikali, na simu za video. Toa karatasi za mwongozo zilizopigwa chapa.",
        "hours": 4,
        "skills": [
          "kufundisha",
          "kuandika"
        ]
      },
      {
        "name": "Panga madarasa na msaada wa kuingia tu",
        "description": "Toa madarasa yaliyopangwa na pia nyakati za wazi za “msaada wa teknolojia”. Badilisha nyakati kwa ajili ya wanaofanya kazi, na weka makundi madogo.",
        "hours": 3,
        "recurringCadence": "session",
        "skills": [
          "kuratibu"
        ],
        "follows": [
          3,
          4
        ]
      },
      {
        "name": "Weka kanuni za usalama wa data na urudishaji",
        "description": "Futa kila kifaa kati ya waazimaji, fundisha mazoea salama ya nenosiri na faragha, na eleza jinsi data binafsi inavyolindwa. Uwe na mpango kwa vifaa vilivyopotea au kuharibika.",
        "hours": 2,
        "skills": [
          "msaada wa kiufundi",
          "kuandika"
        ]
      }
    ]
  },
  {
    "id": "weatherization-brigade",
    "name": "Kikosi cha kuziba nyufa na matengenezo ya nyumba",
    "purpose": "Saidia majirani wa kipato kidogo, wazee, na wenye ulemavu kwa matengenezo ya nyumba na kuziba nyufa ili kupunguza bili za umeme na kuongeza usalama.",
    "whoItServes": "Wenye nyumba wa kipato kidogo, wazee, na majirani wenye ulemavu wasioweza kuifanya kazi hiyo wala kuimudu.",
    "whatYoullNeed": "Waliojitokeza wenye ujuzi, vifaa, zana, na mfumo wa kupokea mahitaji. Shikilia kazi zilizo ndani ya uwezo wa waliojitokeza — peleka kazi za umeme, gesi, muundo wa nyumba, na paa kwa mafundi wenye leseni.",
    "setupHours": 21,
    "defaultCategory": "housing",
    "suggestsWorkDays": true,
    "firstSteps": "Kusanya kwanza waliojitokeza wenye uzoefu zaidi mkubaliane pamoja mpaka wa kazi — zipi mtazichukua na zipi zinakwenda kwa mafundi wenye leseni — kabla hamjapokea hitaji hata moja. Fanya ziara ya kwanza ya kila nyumba iwe mazungumzo, si ukaguzi: mwenye nyumba ndiye anayeamua kinachoguswa nyumbani kwake.",
    "commonPitfalls": "Hatari ni kazi kupanuka: “tengenezo dogo” linalogeuka kuwa la umeme, gesi, au paa nje ya uwezo wa waliojitokeza — hapo ndipo mtu anapoumia. Na usiahidi ziara nyingi kuliko timu inavyoweza kutimiza; kumwacha mzee akisubiri msaada aliokuwa ameutegemea kunauma kuliko hapana ya kweli tangu mwanzo.",
    "pairsWith": [
      "community-wood-bank",
      "tool-lending-library"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Tafuta waliojitokeza wenye ujuzi",
        "description": "Tafuta watu walio huru na useremala wa msingi, kuziba nyufa, vifaa vya kuhifadhi joto, na mipira ya milango na madirisha. Viongozi wawili wenye uzoefu zaidi wanaweza kuwaongoza wengine.",
        "hours": 4,
        "skills": [
          "useremala",
          "kutengeneza nyumba"
        ]
      },
      {
        "name": "Weka mpaka wa kazi",
        "description": "Ainisha kitakachofanywa na kisichofanywa. Shikilia kazi salama na rahisi (kuziba nyufa, vishikizo vya bafuni, matengenezo madogo) na ondoa chochote kinachohitaji fundi mwenye leseni, kama kazi kubwa za umeme au za gesi.",
        "hours": 2,
        "skills": [
          "kutengeneza nyumba"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Jenga mfumo wa kupokea na kukagua",
        "description": "Tengeneza njia kwa majirani kuomba msaada, kisha fanya ziara fupi kupima kazi, kuorodhesha vifaa, na kuhakikisha iko ndani ya ujuzi na mipaka yenu ya usalama.",
        "hours": 3,
        "skills": [
          "kuratibu"
        ]
      },
      {
        "name": "Tafuta vifaa na zana",
        "description": "Kusanya gundi ya kuziba, mipira ya milango, vifaa vya kuhifadhi joto, na vifaa vidogo vya ujenzi kupitia vitu vinavyotolewa, bei nafuu, au bajeti ndogo. Tunza sanduku la zana la pamoja.",
        "hours": 4,
        "skills": [
          "kuendesha gari"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Shughulikia usalama na uwajibikaji",
        "description": "Tumia fomu rahisi za ridhaa, beba vifaa vya msaada wa kwanza, weka sharti la vifaa vya kinga, na kamwe usijaribu kazi nje ya uwezo. Uliza ushauri kuhusu bima ya matengenezo yanayofanywa na waliojitokeza.",
        "hours": 3,
        "skills": [
          "makaratasi"
        ]
      },
      {
        "name": "Panga na uendeshe siku za kazi ya pamoja",
        "description": "Linganisha kazi na timu za waliojitokeza, thibitisha na mwenye nyumba, na kamilisha kazi katika kipindi kimoja makini. Heshimu nyumba na matakwa ya mwenyeji muda wote.",
        "hours": 5,
        "skills": [
          "kuratibu",
          "kutengeneza nyumba"
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
    "name": "Benki ya chakula cha wanyama vipenzi & msaada wa matunzo",
    "purpose": "Toa chakula cha wanyama bure na msaada mdogo wa matunzo, ili watu wasilazimike kuwaachilia wanyama wao kwa kushindwa kumudu.",
    "whoItServes": "Wenye wanyama walio na kipato kidogo, wazee wanaoishi kwa kipato kisichoongezeka, na majirani wasio na makazi wenye wanyama.",
    "whatYoullNeed": "Mahali pa kuhifadhi, njia ya kudumu ya kupata chakula cha wanyama, mahali pa kugawia, na ushirikiano na madaktari wa wanyama.",
    "setupHours": 10,
    "defaultCategory": "mutual_aid_drive",
    "suggestsWorkDays": true,
    "firstSteps": "Anza kwa kuzungumza na benki ya chakula iliyopo tayari kuhusu kugawa pamoja — kaya zile zile mara nyingi zinahitaji vyote viwili — na na madaktari wa wanyama na maduka ya wanyama ya karibu kuhusu vyakula wanavyoweza kutoa, na labda ushirikiano wa chanjo au unafuu.",
    "commonPitfalls": "Kinachoharibu zaidi ni kutotabirika: kampeni moja kubwa, kisha rafu tupu, wakati wenye wanyama wanahitaji kuweza kukutegemea. Angalia pia sauti — hukumu yoyote kuhusu kama “watu maskini wanastahili kufuga” inaua mradi huu haraka kuliko chakula kuisha.",
    "pairsWith": [
      "diaper-hygiene-bank",
      "community-fridge"
    ],
    "tasks": [
      {
        "name": "Tafuta mahali pa kuhifadhi na pa kugawia",
        "description": "Pata hifadhi kavu isiyofikiwa na wadudu na panya, na mahali pa kugawia chakula — mara nyingi kando ya benki ya chakula au ukumbi wa mtaa uliopo tayari.",
        "hours": 2,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Jenga njia za kupata chakula cha wanyama",
        "description": "Changanya kampeni za ukusanyaji, vyakula kutoka maduka na viwanda, na kununua kwa jumla. Fuatilia kinachoingia ili uweze kupanga siku za kugawa.",
        "hours": 3,
        "skills": [
          "kufikia watu",
          "kuendesha gari"
        ]
      },
      {
        "name": "Panga na uhesabu kwa aina ya mnyama na ukubwa",
        "description": "Tenganisha chakula cha mbwa na cha paka (na wanyama wengine), andika kiasi, na kagua tarehe za mwisho wa matumizi. Weka hesabu inayoendelea ili kuongoza ujazaji.",
        "hours": 1.5,
        "skills": [
          "kuratibu",
          "kuingiza data"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Weka utaratibu wa kugawa",
        "description": "Amueni kila kaya inapata kiasi gani na mara ngapi, bila sharti la kuthibitisha uhitaji. Ufanye utabirike ili wenye wanyama waweze kupanga.",
        "hours": 1,
        "skills": [
          "kuongoza mazungumzo"
        ]
      },
      {
        "name": "Panga ratiba na watu wa siku za kugawa",
        "description": "Weka nyakati za kugawa za kudumu, tafuta watu wa kusaidia, na linda sauti isiyo na hukumu. Wengi huruka milo ili kulisha wanyama wao — wapokee kwa heshima.",
        "hours": 2.5,
        "skills": [
          "kuratibu"
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
    "name": "Uelekezaji wa vijana & programu ya baada ya shule",
    "purpose": "Wape watoto na vijana mahali salama baada ya shule, penye msaada wa kazi za shule, uelekezaji, na shughuli za kukuza.",
    "whoItServes": "Vijana wa mitaa isiyo na nafasi nyingi, na wazazi wanaofanya kazi wanaohitaji mahali salama pa kuwaachia watoto.",
    "whatYoullNeed": "Mahali salama, waelekezi waliokaguliwa, shughuli, na vitafunio. Kufanya kazi na vijana kunabeba wajibu mzito — kagua watu wazima, shikilia kanuni ya watu wazima wawili, fuata sheria za lazima za kutoa taarifa, na zingatia taratibu za eneo lako kwa programu za vijana.",
    "setupHours": 28,
    "defaultCategory": "education",
    "suggestsWorkDays": true,
    "firstSteps": "Kabla ya kutafuta mwelekezi hata mmoja, zungumza na wazazi na vijana wenyewe kuhusu wanachohitaji, na andika sera zako za usalama — ukaguzi wa historia, kanuni ya watu wazima wawili, utoaji wa taarifa wa lazima. Hakuna mtu mzima anayekaa na watoto kabla hajavuka kizingiti hicho.",
    "commonPitfalls": "Kushindwa kubaya zaidi ni njia ya mkato ya usalama: mtu mzima asiyekaguliwa, au mtu mzima peke yake na mtoto — hilo halijadiliwi kamwe. La pili ni waelekezi kuja na kuondoka; kwa watoto walioshaangushwa, mtu mzima anayetoweka anaumiza, kwa hiyo anza kidogo na ukue tu kadiri unavyoweza kusimamia na kudumu.",
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
        "name": "Pata mahali salama na upange saa zake",
        "description": "Tafuta ukumbi unaofaa na unaofikika — chumba cha shule, maktaba, au ukumbi wa mtaa — na weka saa za kudumu za baada ya shule ambazo familia zinaweza kuzitegemea.",
        "hours": 3,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Weka viwango vya usalama wa watoto na ukaguzi",
        "description": "Sharti kila mtu mzima anayefanya kazi na vijana akaguliwe historia, shikilia kanuni ya watu wazima wawili ili mtu asibaki peke yake na mtoto, na weka miongozo wazi ya mwenendo na ya kutoa taarifa.",
        "hours": 6,
        "skills": [
          "kulea watoto",
          "kuandika"
        ]
      },
      {
        "name": "Tafuta na ufundishe waelekezi",
        "description": "Tafuta watu wazima wa kuaminika wenye moyo wa kujali, uwafundishe mipaka, usalama wa vijana, na jinsi ya kusaidia bila kuwafanyia watoto kazi. Lenga uthabiti wiki hadi wiki.",
        "hours": 6,
        "skills": [
          "kufikia watu",
          "kufundisha"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Panga shughuli",
        "description": "Changanya msaada wa kazi za shule na shughuli za kukuza — kusoma, sanaa, michezo, ujuzi wa maisha. Zifanye za kuvutia na acha vijana washiriki kuamua kinachotolewa.",
        "hours": 4,
        "skills": [
          "kufundisha"
        ]
      },
      {
        "name": "Shughulikia uandikishaji, mzio, na taarifa za dharura",
        "description": "Kusanya ruhusa za wazazi, taarifa za mzio na afya, namba za dharura, na walioruhusiwa kuwachukua watoto. Hifadhi haya kwa usalama.",
        "hours": 3,
        "skills": [
          "makaratasi",
          "kuingiza data"
        ]
      },
      {
        "name": "Tafuta vitafunio na vifaa",
        "description": "Weka kitafunio chenye afya (watoto wengi hufika na njaa) na kusanya vitabu, vifaa vya sanaa, na michezo kupitia vinavyotolewa au bajeti ndogo.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Endesha vikao na uwasiliane na familia",
        "description": "Fungua mahali, simamia kwa karibu, endesha shughuli, na dumisha mawasiliano ya mara kwa mara na wazazi kuhusu maendeleo ya watoto wao.",
        "hours": 4,
        "skills": [
          "kulea watoto",
          "kufundisha"
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
    "name": "Mtandao wa kuokota masalia ya mavuno",
    "purpose": "Okoa mazao ya ziada kutoka mashambani, bustani za matunda, bustani, na masoko, na uyagawe kabla hayajaharibika.",
    "whoItServes": "Majirani wenye uhaba wa chakula na miradi ya chakula kama friji, benki za chakula, na milo ya pamoja.",
    "whatYoullNeed": "Watu wa kusaidia, usafiri, mahusiano na wakulima, na hifadhi ya muda mfupi.",
    "setupHours": 21,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Anza na wakulima: mashamba, bustani za matunda, na wachuuzi wa sokoni. Waulize wana ziada gani na nini kinawatia wasiwasi kuhusu kupokea timu — kuwajibishwa kisheria, uharibifu wa mazao — na funga mapema chakula kitakakokwenda (friji, benki za chakula, milo ya pamoja) kabla ya mavuno ya kwanza.",
    "commonPitfalls": "Kushindwa kwa kawaida ni kuokoa matunda yanayooza baadaye kwenye gereji ya mtu — ugawaji unapangwa kabla ya kuchuma, si baada. Madirisha ya mavuno ni mafupi, kwa hiyo timu ndogo inayokwenda haraka inashinda orodha ndefu ya majina; na uokotaji mmoja wa uzembe unaoharibu shamba unaweza kukupotezea mkulima huyo kabisa.",
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
        "name": "Tafuta vyanzo vya mazao",
        "description": "Fikia mashamba, bustani za matunda, wachuuzi wa sokoni, na majirani wenye miti iliyozidiwa na matunda. Wengi hufurahi ziada ichumwe badala ya kuoza.",
        "hours": 4,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Kusanya timu ya kuokota",
        "description": "Jenga orodha ya watu wanaoweza kuitika haraka mazao yanapokuwa tayari. Madirisha ya mavuno ni mafupi, kwa hiyo unyumbufu una thamani kuliko wingi.",
        "hours": 2,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Panga usafiri na hifadhi",
        "description": "Andaa magari ya kubeba mazao na mahali penye ubaridi pa kuyaweka kwa muda. Ratibuni chakula kitoke shambani kifike kwa wapokeaji kabla hakijaharibika.",
        "hours": 3,
        "skills": [
          "kuendesha gari"
        ]
      },
      {
        "name": "Weka utaratibu wa kuita timu",
        "description": "Tengeneza njia ya haraka ya kuwaarifu na kuwathibitisha watu uokotaji unapojitokeza, kwa kuwa wakulima mara nyingi hutoa taarifa fupi. Kikundi cha gumzo au orodha ya simu inatosha.",
        "hours": 2,
        "skills": [
          "kuratibu"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Shughulikia sheria na usalama wa chakula",
        "description": "Jifunze kinga za kisheria za eneo lako kwa wanaotoa chakula (kwingine huitwa sheria za “Good Samaritan”), kubalianeni kanuni rahisi za kushika chakula, na tumia fomu fupi ya makubaliano ili wakulima wapokee timu bila wasiwasi.",
        "hours": 3,
        "skills": [
          "makaratasi",
          "usalama wa chakula"
        ]
      },
      {
        "name": "Jenga njia za kugawa",
        "description": "Panga mapema chakula kilichookotwa kitakakokwenda — friji za jumuiya, benki za chakula, milo ya pamoja, au moja kwa moja kwa familia — kisikae bila kutumika.",
        "hours": 3,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Endesha uokotaji na upime kilo",
        "description": "Vuna kwa uangalifu kulinda shamba, gawa mara moja, na andika chakula kilichookolewa kwa kilo. Namba hizo husaidia kuvutia watu na wakulima wapya.",
        "hours": 4,
        "skills": [
          "kulima bustani",
          "kuendesha gari"
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
    "name": "Mtandao wa usuluhishi & kutatua kutoelewana katika jumuiya",
    "purpose": "Toa usuluhishi wa bure usioegemea upande kwa kutoelewana kwa majirani, kukamaliza bila mahakama wala polisi.",
    "whoItServes": "Majirani, wapangaji na wenye nyumba, wanaoishi pamoja, na vikundi vya jumuiya vilivyotofautiana.",
    "whatYoullNeed": "Wasuluhishi waliofundishwa, mahali pasipoegemea upande, na utaratibu wa kuomba. Usuluhishi ni kwa kutoelewana kati ya pande zilizo tayari — chuja na uelekeze hali yoyote yenye vurugu, unyanyasaji, au hatari kwa mtaalamu anayefaa au kwa msaada wa dharura.",
    "setupHours": 22,
    "defaultCategory": "other",
    "firstSteps": "Zungumza kwanza na kituo cha usuluhishi cha jumuiya kilichopo au mkufunzi — ufundi huu haubuniwi tu — na kabla ya shauri la kwanza, andikeni mstari wenu wa kuchuja: kutoelewana kupi mnapokea, na wapi mnaelekeza chochote chenye vurugu au unyanyasaji.",
    "commonPitfalls": "Kushindwa kwa hatari ni kusuluhisha kisichopaswa kusuluhishwa: “kutoelewana kwa majirani” ambako kwa kweli ni unyanyasaji kunamweka mtu hatarini, kwa hiyo chuja kila ombi linaloingia. Na usiri ndio uhai wa mradi wote — kitu kimoja kikivuja hakuna anayeamini tena; watunzeni pia wasuluhishi wenu, kwa sababu kazi hii inachosha ndani kwa ndani.",
    "pairsWith": [
      "legal-aid-clinic",
      "tenant-union"
    ],
    "learnMore": [
      "disagree-with-member"
    ],
    "tasks": [
      {
        "name": "Tafuta na ufundishe wasuluhishi",
        "description": "Tafuta watu watulivu wenye haki moyoni waliojitokeza, wapate mafunzo — kupitia mafunzo ya usuluhishi yanayotambulika au kwa kushirikiana na kituo cha usuluhishi cha jumuiya kilichopo.",
        "hours": 6,
        "skills": [
          "kufikia watu",
          "kuongoza mazungumzo"
        ]
      },
      {
        "name": "Weka utaratibu wa kuomba na kupokea",
        "description": "Tengeneza njia rahisi ya watu kuomba usuluhishi. Wakati wa mapokezi, sikia msingi kutoka kila upande na uthibitishe shauri linafaa kusuluhishwa.",
        "hours": 3,
        "skills": [
          "kuratibu",
          "mahojiano"
        ]
      },
      {
        "name": "Tafuta mahali pa kukutania pasipoegemea",
        "description": "Pata mahali tulivu pasipoegemea upande — chumba cha maktaba au ukumbi wa mtaa — ambapo pande zote mbili zinajisikia salama na sawa.",
        "hours": 2,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Weka mipaka ya mtakachopokea",
        "description": "Amueni mtakachosuluhisha (kelele, maeneo ya pamoja, kutoelewana kudogo) na msichokipokea. Chuja hali zenye vurugu, unyanyasaji, au hatari, na uzielekeze kwa wataalamu wanaofaa.",
        "hours": 3,
        "skills": [
          "kuongoza mazungumzo",
          "kuandika"
        ]
      },
      {
        "name": "Weka usiri na kanuni za msingi",
        "description": "Wekeni kanuni wazi: usiri, kushiriki kwa hiari, kupokezana kusema kwa heshima, na msuluhishi anayeongoza lakini haamui. Ziandikeni kwa washiriki.",
        "hours": 3,
        "skills": [
          "kuandika"
        ]
      },
      {
        "name": "Sambaza habari",
        "description": "Wajulishe majirani, vikundi vya makazi, na mashirika ya karibu kwamba usuluhishi wa bure upo, ili watu waufikie kabla mivutano haijapanda.",
        "hours": 3,
        "skills": [
          "kufikia watu",
          "kubuni michoro"
        ],
        "follows": [
          1,
          3
        ]
      },
      {
        "name": "Fuatilia matokeo na uwatunze wasuluhishi",
        "description": "Andika viwango vya utatuzi (bila kuvunja usiri) na zungumzeni mara kwa mara baada ya mashauri. Kazi hii inachosha, kwa hiyo pokezaneni mashauri na mpeane msaada.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "kuingiza data",
          "kuongoza mazungumzo"
        ]
      }
    ]
  },
  {
    "id": "reentry-support",
    "name": "Mtandao wa msaada kwa wanaorudi kutoka gerezani",
    "purpose": "Saidia wanaorudi kutoka gerezani kupata kitambulisho, makazi, kazi, na jumuiya — kulainisha kipindi kinachojulikana kuwa kigumu.",
    "whoItServes": "Waliowahi kufungwa na familia zao.",
    "whatYoullNeed": "Watu wa kusaidia, mashirika washirika, na orodha imara ya mahali pa msaada. Shughulikia kumbukumbu na historia za watu kama siri — anza na heshima, fuata malengo ya mtu mwenyewe, na elekeza masuala ya kisheria kwa mwanasheria anayefaa.",
    "setupHours": 28,
    "defaultCategory": "other",
    "firstSteps": "Kabla ya kujenga chochote, kaa na watu waliorudi wenyewe na na mashirika ya kupokea warudio, ofisi zinazosimamia waliotoka kwa masharti, na waajiri wa nafasi ya pili wanaofanya kazi tayari eneo lenu — uliza nini hasa kinawakwamisha watu wiki za kwanza na mtandao wenu unatoshea wapi. Pata sasa hivi mawasiliano ya msaada wa kisheria au mwanasheria mwenye sifa, ili maswali ya kisheria yanapoibuka uwe na pa kuyapeleka kwa uhakika.",
    "commonPitfalls": "Mradi huu unakufa unapogeuka mlango wa kuchuja — watu wanaosaidia wakiamua nani anastahili msaada — au historia ya mtu inapovuja na kumpotezea kazi au nyumba. Pia unashindwa kimya kimya shauku inapozidi utekelezaji; ahadi iliyovunjwa inamuumiza anayejenga upya kuaminiwa kuliko kutokuwa na ahadi kabisa.",
    "pairsWith": [
      "court-support",
      "books-to-prisoners"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Jenga orodha ya msaada na washirika",
        "description": "Chora ramani ya mahali pa kitambulisho na nyaraka, makazi, ajira, afya, tiba, na msaada wa serikali. Tambua waajiri na wenye nyumba walio tayari kupokea wenye historia gerezani.",
        "hours": 6,
        "skills": [
          "kufikia watu",
          "kuingiza data"
        ]
      },
      {
        "name": "Tafuta na ufundishe watu wa kusaidia",
        "description": "Tafuta watu wasiohukumu waliojitokeza na uwafundishe kusaidia kwa heshima na kwa kuelewa majeraha ya ndani. Wanaorudi nyumbani wanahitaji wenzao, si walinzi wa mlango.",
        "hours": 5,
        "skills": [
          "kufikia watu",
          "kufundisha"
        ]
      },
      {
        "name": "Andaa mapokezi na kusikiliza mahitaji",
        "description": "Jenga njia rahisi yenye heshima ya kujua kila mtu anahitaji nini kwa dharura zaidi — mara nyingi kitambulisho, mahali pa kulala, na kipato — na anzia hapo.",
        "hours": 3,
        "skills": [
          "mahojiano"
        ]
      },
      {
        "name": "Saidia nyaraka na msaada wa serikali",
        "description": "Saidia kupata upya kitambulisho na nyaraka za msingi, kuomba msaada wa serikali, na makaratasi mengine magumu kufanya bila anwani wala intaneti.",
        "hours": 4,
        "recurringCadence": "month",
        "skills": [
          "makaratasi"
        ]
      },
      {
        "name": "Unganisha na ajira na makazi",
        "description": "Fanya utambulisho wa moyoni kwa waajiri wa nafasi ya pili na makazi yanayowezekana, na saidia kujaza fomu za kazi, CV, na maandalizi ya mahojiano.",
        "hours": 4,
        "recurringCadence": "month",
        "skills": [
          "kufikia watu",
          "kuandika"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Unganisha na waliopitia wenyewe",
        "description": "Inapowezekana, mwunganishe kila mtu na mwelekezi aliyepitia kurudi mwenyewe. Uzoefu huo wa pamoja hujenga kuaminiana haraka kuliko chochote.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "kuongoza mazungumzo"
        ]
      },
      {
        "name": "Weka taratibu za faragha na mipaka",
        "description": "Shika historia za watu kwa usiri mkubwa, usimshinikize yeyote kusema zaidi ya anavyotaka, na elekeza maswali ya kisheria kwa wanasheria wenye sifa.",
        "hours": 3,
        "skills": [
          "kuandika"
        ]
      }
    ]
  },
  {
    "id": "community-wood-bank",
    "name": "Benki ya kuni ya jumuiya / msaada wa kupata joto",
    "purpose": "Kusanya na kugawa kuni, na ratibu msaada wa joto, ili majirani wapate joto msimu wote wa baridi.",
    "whoItServes": "Kaya za kipato kidogo na za vijijini zinazopata joto kwa kuni, na wazee wasioweza kukusanya au kupasua zao wenyewe.",
    "whatYoullNeed": "Chanzo cha kuni, mahali pa kuchania na kuhifadhi, zana, timu iliyofundishwa, na mpango wa kufikisha. Misumeno ya moto na mashine za kupasua ni hatari — ruhusu waendeshaji waliofundishwa tu, sharti vifaa vya kinga, na elekeza timu usalama kabla ya kila kipindi.",
    "setupHours": 24,
    "defaultCategory": "mutual_aid_drive",
    "suggestsWorkDays": true,
    "firstSteps": "Anza kwa kuzungumza na kaya zinazotumia kuni — wazee wa vijijini, familia zinazojulikana tayari na ofisi ya msaada wa nishati — kujua wanachoma kiasi gani na wanaishiwa lini, kisha pigia makampuni ya kukata miti ya karibu uulize kuni zao zinakwenda wapi sasa. Kabla msumeno wowote haujawaka, amueni nani anamiliki usalama: mtu mwenye uzoefu wa kutosha kufundisha timu na asiyeona haya kumwambia hapana aliyejitokeza.",
    "commonPitfalls": "Njia mbili hii inavyoweza kuumiza watu: asiyefundishwa kwenye msumeno wa moto, na kufikisha kuni mbichi zinazotoa moshi, kupaka bomba la moshi masizi yanayoweza kuwaka, na hazitoi joto. Kukata Oktoba kwa ajili ya Desemba maana yake kuni mbichi — kushindwa kwa kalenda ni halisi kama kwa usalama.",
    "pairsWith": [
      "weatherization-brigade",
      "cooling-warming-center"
    ],
    "tasks": [
      {
        "name": "Pata chanzo cha kuni",
        "description": "Panga upatikanaji kutoka makampuni ya kukata miti, usafishaji baada ya dhoruba, miti iliyoanguka inayotolewa, au mashamba yanayotunzwa kwa uendelevu. Hakikisha mnaruhusiwa kisheria kuichukua na kuichania.",
        "hours": 4,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Tafuta mahali pa kuchania na kuhifadhi",
        "description": "Pata uwanja ambapo kuni zinaweza kukatwa, kupasuliwa, kupangwa, na kukaushwa. Unahitaji nafasi ya kuweka kavu za msimu huu na zinazokauka za msimu ujao.",
        "hours": 4,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Pata zana na vifaa vya kinga",
        "description": "Pata au azima mashine ya kupasua magogo, misumeno ya moto, na vifaa vya kinga (suruali za kinga, miwani, vizibo vya masikio, glavu). Tunza zana na weka kifaa cha msaada wa kwanza pale pale.",
        "hours": 4,
        "skills": [
          "kuendesha gari",
          "kutengeneza zana"
        ]
      },
      {
        "name": "Kusanya na ufundishe timu ya kuni",
        "description": "Jenga timu na uhakikishe waliofundishwa vizuri tu ndio wanaoendesha misumeno ya moto na mashine za kupasua. Fanya maelekezo ya usalama kabla ya kila siku ya kazi ya pamoja.",
        "hours": 4,
        "skills": [
          "kufundisha",
          "kufikia watu"
        ]
      },
      {
        "name": "Jenga utaratibu wa kuomba na kufikisha",
        "description": "Tengeneza njia ya kaya kuomba kuni na kupanga ufikishaji, kwa kuwa wapokeaji wengi ni wazee au hawana magari. Hakikisha upangaji salama karibu na nyumba.",
        "hours": 3,
        "skills": [
          "kuratibu",
          "kuendesha gari"
        ]
      },
      {
        "name": "Weka vigezo vya kugawa",
        "description": "Amueni kila kaya inapokea kuni kiasi gani na wapewe kwanza walio hatarini zaidi kwenye baridi. Utaratibu ubaki rahisi, bila vikwazo.",
        "hours": 2,
        "skills": [
          "kuongoza mazungumzo"
        ]
      },
      {
        "name": "Panga siku za kazi ya pamoja na ukaushaji",
        "description": "Panga kukata na kupasua mapema kabla ya msimu wa baridi, kwa sababu kuni mbichi lazima zikauke miezi kadhaa kabla ya kuwaka salama. Fuatilia zilizokauka na zilizo tayari.",
        "hours": 3,
        "recurringCadence": "cycle",
        "skills": [
          "kuratibu"
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
    "name": "WiFi ya bure ya jumuiya / mtandao wa mesh",
    "purpose": "Toa intaneti ya bure mahali ambapo haipatikani au watu hawawezi kuimudu.",
    "whoItServes": "Kaya za kipato kidogo, wanafunzi, wanaotafuta kazi, na yeyote aliyekatika na intaneti ya uhakika.",
    "whatYoullNeed": "Njia kuu ya intaneti (backhaul), router na node za mesh, watu wenye ujuzi wa kiufundi waliojitokeza, na maeneo ya kupokea node.",
    "setupHours": 32,
    "defaultCategory": "tech",
    "firstSteps": "Tembea mitaa mnayotaka kufikia na ubishe milango — zungumza na kaya zisizo na intaneti kuhusu wangeitumia kwa nini hasa, na na wenye mapaa na madirisha ya juu yanayoweza kubeba node. Kabla ya kununua kifaa chochote, fanyeni mazungumzo ya bandwidth: tafuteni biashara, maktaba, au ISP aliye tayari kugawa laini, na hakikisheni kwa maandishi kugawa upya kunaruhusiwa.",
    "commonPitfalls": "Mitandao ya mesh mara nyingi hufa kwa matunzo, si ujenzi — fundi mwanzilishi anahama na hakuna mwingine anayeweza kuingia kwenye router, kwa hiyo andikeni kila kitu na mfundishe mtu wa pili tangu siku ya kwanza. Kushindwa kwingine kwa kimya ni kujenga mahali mawimbi yanapofika kirahisi badala ya mahali watu wanapokosa intaneti kweli.",
    "pairsWith": [
      "digital-literacy",
      "emergency-preparedness"
    ],
    "tasks": [
      {
        "name": "Chora ramani ya mahitaji na mapengo",
        "description": "Tambua mitaa gani inakosa intaneti inayomudhika na mawimbi yanaweza kufika wapi. Andika majengo yanayoonana bila kizuizi na wenyeji walio tayari. Hii inaunda muundo mzima.",
        "hours": 4,
        "skills": [
          "msaada wa kiufundi"
        ]
      },
      {
        "name": "Pata njia kuu ya intaneti",
        "description": "Panga chanzo cha bandwidth ya kugawa — laini ya biashara inayotolewa, ushirikiano na ISP, au kiunganishi cha mtandao wa jumuiya. Hakikisha masharti yanaruhusu kugawa upya.",
        "hours": 5,
        "skills": [
          "kufikia watu",
          "msaada wa kiufundi"
        ]
      },
      {
        "name": "Tafuta watu wa kiufundi",
        "description": "Tafuta watu wanaoelewa mitandao wanaoweza kuseti router na kutatua hitilafu. Unahitaji wawili tu kuanza, pamoja na wanaotaka kujifunza.",
        "hours": 3,
        "skills": [
          "kufikia watu",
          "msaada wa kiufundi"
        ]
      },
      {
        "name": "Tafuta na useti vifaa",
        "description": "Kusanya router, node za mesh, na antena kupitia vinavyotolewa au bajeti ndogo. Ziseti kwa mtandao wa wazi au wa kugawana kirahisi, na ujaribu ufikaji.",
        "hours": 10,
        "skills": [
          "msaada wa kiufundi"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Tafuta maeneo ya kubeba node",
        "description": "Weka node mahali zinapoongeza ufikaji — mapaa, madirisha ya juu, na baraza zenye umeme na ruhusa. Pata ndiyo ya maandishi ya kila mwenyeji na fidia umeme wake mdogo.",
        "hours": 5,
        "skills": [
          "kufikia watu"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Weka kanuni za matumizi na faragha",
        "description": "Bandika kanuni rahisi, epuka kurekodi matumizi ya watu, na kuwa wazi kwamba mtandao wa wazi si wa faragha. Waelekeze watu kwenye tabia za usalama kama HTTPS na VPN.",
        "hours": 2,
        "skills": [
          "kuandika"
        ]
      },
      {
        "name": "Tunza na upanue mtandao",
        "description": "Kagua node mara kwa mara, badilisha vifaa vilivyofeli, na ongeza ufikaji wenyeji wapya wanapojiunga. Andika jinsi ulivyoseti ili wengine wasaidie kuutunza.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "msaada wa kiufundi"
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
    "name": "Duara la kusaidiana kwa afya ya akili",
    "purpose": "Toa nafasi salama ya kawaida inayoongozwa na wenzako, ya watu kushiriki na kusaidiana — nyongeza ya matibabu ya wataalamu, si mbadala wake.",
    "whoItServes": "Yeyote anayepitia msongo, upweke, msiba, au changamoto za afya ya akili anayetaka ukaribu wa wenzake.",
    "whatYoullNeed": "Wawezeshaji waliofundishwa, mahali pa faragha, na mipaka wazi pamoja na mpango wa kuelekeza wakati wa shida. Msaada wa wenzako unaongezea matibabu ya kitaalamu ya afya ya akili — haubadilishi. Wawezeshaji si matabibu, na lazima kuwe na mpango wazi wa kumwunganisha yeyote aliye katika shida kubwa na wataalamu au msaada wa dharura.",
    "setupHours": 21,
    "defaultCategory": "emotional_support",
    "firstSteps": "Mazungumzo yako ya kwanza ni na watu wanaoweza kuwezesha na na wataalamu wa afya ya akili wa karibu — kliniki, namba ya wakati wa shida, au mshauri anayekubali kuwa njia yenu ya kuelekeza kabla duara halijakutana mara ya kwanza. Usifungue milango mpaka wawezeshaji wamefundishwa na kila mtu anaweza kusema wazi duara ni nini na si nini.",
    "commonPitfalls": "Kushindwa kwa hatari ni kuteleza taratibu: duara la moyo mwema linakuwa polepole msaada pekee alionao mtu, wawezeshaji wanaanza kuigiza utabibu, na hakuna mpango wa usiku ambao mtu yuko katika shida ya kweli. Kwa kimya zaidi ni uchovu wa wawezeshaji — kama wanaoshika nafasi hawana msaada wao wenyewe, duara linafumbwa ndani ya mwaka.",
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
        "name": "Tafuta na ufundishe wawezeshaji",
        "description": "Tafuta watu wapole walio imara na wapate mafunzo ya kusaidiana kwa wenzako au ya usikilizaji makini. Kuwa wazi: wawezeshaji ni wenzao wanaoshika nafasi, si matabibu wanaopima wala kutibu.",
        "hours": 5,
        "skills": [
          "kuongoza mazungumzo",
          "kufikia watu"
        ]
      },
      {
        "name": "Weka mipaka na upeo wa duara",
        "description": "Wekeni wazi kwamba huu ni msaada wa wenzako, si tiba wala msaada wa shida kubwa. Andikeni duara ni la nini na kipi kiko nje ya nafasi yake, ili matarajio yawe wazi kwa kila mtu.",
        "hours": 3,
        "skills": [
          "kuandika"
        ]
      },
      {
        "name": "Jenga mpango wa kuelekeza wakati wa shida",
        "description": "Andaa hatua wazi kwa mtu aliye katika dhiki inayozidi msaada wa wenzako: jinsi ya kumwunganisha kwa upole na wataalamu au msaada wa shida, na lini kuita msaada wa dharura. Weka karibu orodha ya sasa ya msaada wa karibu na wa kitaifa.",
        "hours": 3,
        "skills": [
          "kuandika"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Tafuta mahali pa faragha na salama",
        "description": "Pata chumba tulivu, cha starehe, cha siri ambapo watu wanaweza kusema kwa uhuru. Mahali pale pale kila mara huwasaidia watu kujisikia salama kurudi.",
        "hours": 2,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Wekeni usiri na kanuni za kikundi",
        "description": "Kubalianeni usiri, hakuna ushauri bila kuombwa, hakuna kukatiza, na haki ya kusema “ninapita”. Zishirikisheni mwanzoni mwa kila kikao.",
        "hours": 3,
        "skills": [
          "kuongoza mazungumzo",
          "kuandika"
        ]
      },
      {
        "name": "Panga vikao na usambaze habari",
        "description": "Chagua wakati wa kudumu, weka kikundi kisichozidi ukubwa unaobebeka, na sambaza habari kwa namna inayoondoa aibu. Weka wazi ni bure na wazi kwa wote.",
        "hours": 3,
        "skills": [
          "kufikia watu",
          "kuratibu"
        ],
        "follows": [
          0,
          3
        ]
      },
      {
        "name": "Watunze wawezeshaji, epusha uchovu",
        "description": "Fanyeni vikao vya kawaida vya wawezeshaji kuzungumza na kupumua. Pokezaneni uongozi, na hakikisheni wao pia wana msaada wao wenyewe.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "kuongoza mazungumzo"
        ]
      }
    ]
  },
  {
    "id": "community-cleanup",
    "name": "Usafi wa mtaa na kurudisha maeneo ya kijani",
    "purpose": "Kuondoa taka, kurudisha viwanja na bustani zilizotelekezwa, na kutengeneza eneo la kijani la pamoja.",
    "whoItServes": "Mtaa mzima — eneo safi, salama na la kijani zaidi linamfaa kila mtu.",
    "whatYoullNeed": "Watu waliojitokeza, vifaa, ruhusa za maeneo, na mpango wa kuondoa taka. Maeneo yaliyotelekezwa yanaweza kuficha hatari za kweli — usiokote sindano wala kemikali usizozijua kwa mkono; tumia zana na chombo kigumu cha sindano, na uondoe vitu hatari kwa kufuata taratibu za eneo lako.",
    "setupHours": 10,
    "defaultCategory": "infrastructure",
    "suggestsWorkDays": true,
    "firstSteps": "Tembea mtaani na watu wanaoishi karibu kabisa na maeneo yaliyotelekezwa — wanajua viwanja vipi vina maana, vinamilikiwa na nani, na nini kimewahi kujaribiwa — na uangalie kama halmashauri au kikundi cha marafiki wa bustani tayari kinaendesha usafi unaoweza kujiunga nao. Maliza masuala ya umiliki, ruhusa, na taka zitakwenda wapi kabla ya kuchagua tarehe.",
    "commonPitfalls": "Usafi hufeli kwa njia mbili: mifuko ya taka iliyokusanywa hukaa kando ya barabara kwa wiki kwa sababu hakuna aliyepanga kuiondoa, na kiwanja kilichosafishwa vizuri hurudi kuwa pori baada ya miezi michache kwa sababu hapakuwa na mpango zaidi ya ile siku moja kubwa. Na aliyejitokeza akinyoosha mkono mtupu kuchukua sindano anaweza kugeuza asubuhi njema kuwa safari ya hospitali.",
    "pairsWith": [
      "community-garden",
      "community-composting"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Tambua maeneo na uyapange kwa umuhimu",
        "description": "Tembea eneo lako na uorodheshe sehemu zinazohitaji kazi — kona zenye taka nyingi, viwanja vilivyomea pori, bustani zilizotelekezwa. Panga kwa athari na uwezekano wa kufanyika.",
        "hours": 1.5,
        "skills": []
      },
      {
        "name": "Pata ruhusa na mpango wa kuondoa taka",
        "description": "Hakikisha nani anamiliki kila eneo na upate ruhusa. Panga mapema jinsi taka na vifusi vitakavyoondolewa — ratibu kontena kubwa au gari la halmashauri ili mifuko isibaki imerundikana tu.",
        "hours": 2,
        "skills": [
          "kufikia watu",
          "makaratasi"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Kusanya vifaa na zana za usalama",
        "description": "Kusanya glavu, mifuko, koleo za kushikia taka, na fulana angavu za usalama. Weka pia chombo kigumu cha sindano na mpango wa kitu chochote hatari kitakachopatikana.",
        "hours": 1.5,
        "skills": [
          "kuendesha gari"
        ]
      },
      {
        "name": "Alika na upange waliojitokeza",
        "description": "Sambaza habari na uorodheshe watakaokuja. Weka viongozi wa timu na kanda zao ili siku iwe na mpangilio badala ya vurugu.",
        "hours": 2,
        "skills": [
          "kufikia watu",
          "kuratibu"
        ]
      },
      {
        "name": "Endesha siku ya usafi au ya kurudisha eneo",
        "description": "Fanya tukio, weka timu salama na zenye maji ya kunywa, na sherehekeeni pamoja matokeo yanayoonekana. Piga picha za kabla-na-baada ili kuwavuta watu wengi zaidi siku ijayo.",
        "hours": 3,
        "skills": [
          "kuratibu",
          "kupiga picha"
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
    "name": "Kliniki ya msaada wa kodi bure na uwezo wa kifedha",
    "purpose": "Kusaidia majirani wa kipato cha chini kuwasilisha kodi bure na kupata nafuu na marejesho ya kodi wanayostahili.",
    "whoItServes": "Wafanyakazi wa kipato cha chini, familia zinazostahili nafuu za kodi, wazee, na wanafunzi.",
    "whatYoullNeed": "Wajazaji wa fomu walioandaliwa na wenye cheti, chumba, kompyuta, na mfumo wa miadi. Fomu za kodi lazima zijazwe na watu wenye cheti kupitia programu inayotambulika — kliniki hii inasaidia mawasilisho ya kawaida, si hali ngumu zinazohitaji mtaalamu wa kodi.",
    "setupHours": 28,
    "defaultCategory": "skilled_labor",
    "suggestsWorkDays": true,
    "firstSteps": "Simu yako ya kwanza ni kwa programu ya kodi bure iliyojiimarisha kama VITA — zungumza na mratibu wao kuhusu muda wa kupata cheti, programu za kompyuta, na kituo kipya kinahitaji nini, kwa sababu kazi hii haifai kuiendesha peke yako. Kisha zungumza na majirani unaotarajia kuwasaidia: wanaweza kuja lini kweli, na nini kimewazuia kuwasilisha kodi huko nyuma.",
    "commonPitfalls": "Fomu moja yenye makosa inaweza kuiondolea familia marejesho yake au kuibua ukaguzi wa mamlaka ya kodi — ndiyo maana mstari ambao kazi hii haipaswi kamwe kuuvuka ni watu wasio na cheti kujaza fomu za kodi. Kufeli kwa upole zaidi: kuanza mwezi Machi wakati kupata cheti huchukua miezi, na mtu kupanda basi hadi hapo kisha kurudishwa kwa hati ambayo hakuna aliyemwambia aje nayo.",
    "pairsWith": [
      "legal-aid-clinic",
      "solidarity-fund"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Fundisha wajazaji na uwapatie cheti",
        "description": "Waombe waliojitokeza wakamilishe mafunzo yanayotambulika ya cheti cha kujaza kodi bure (kama programu ya VITA ya IRS) ili fomu ziwe sahihi na zenye mamlaka halali. Hili halina mjadala.",
        "hours": 10,
        "recurringCadence": "cycle",
        "skills": [
          "uhasibu"
        ]
      },
      {
        "name": "Shirikiana na programu ya kodi bure inayotambulika",
        "description": "Jiunge na programu iliyojiimarisha kwa ajili ya programu za kompyuta, msaada, na kuaminika. Wao ndio wenye zana za kuwasilisha na ukaguzi wa ubora ambao hupaswi kuujenga peke yako.",
        "hours": 4,
        "skills": [
          "kufikia watu",
          "makaratasi"
        ]
      },
      {
        "name": "Andaa chumba na vifaa",
        "description": "Pata mahali penye kompyuta, intaneti ya kutegemewa, na faragha ya kutosha ili watu waeleze taarifa nyeti za fedha zao kwa utulivu.",
        "hours": 3,
        "skills": [
          "msaada wa kiufundi"
        ]
      },
      {
        "name": "Jenga mfumo wa miadi na mapokezi",
        "description": "Tengeneza miadi na orodha wazi ya hati ambazo watu lazima waje nazo (kitambulisho, fomu za kipato, fomu ya mwaka jana). Hii inaepusha safari za bure na kusubiri kwa muda mrefu.",
        "hours": 3,
        "skills": [
          "kuratibu",
          "kuingiza data"
        ]
      },
      {
        "name": "Sambaza habari kwa majirani wanaostahili",
        "description": "Fikisha habari, ukisisitiza kwamba kuwasilisha kodi kunaweza kufungua marejesho na nafuu ambazo watu wengi huzikosa. Wafikie wafanyakazi, familia, na wazee ambao mara nyingi wanastahili.",
        "hours": 3,
        "recurringCadence": "cycle",
        "skills": [
          "kufikia watu",
          "kubuni michoro"
        ],
        "follows": [
          3
        ]
      },
      {
        "name": "Hakikisha usalama wa data na faragha",
        "description": "Linda kila kipande cha taarifa binafsi na za fedha: kompyuta salama, hakuna nakala zisizo za lazima, hifadhi inayofungwa, na utaratibu wazi wa kuhifadhi-na-kuharibu.",
        "hours": 3,
        "skills": [
          "msaada wa kiufundi"
        ]
      },
      {
        "name": "Toa mwendelezo wa uwezo wa kifedha",
        "description": "Kwa wanaopenda tu, waunganishe watu na msaada wa kupanga matumizi, akaunti salama za benki, na ukaguzi wa stahili zao. Iache kuwa hiari na uelekeze hali ngumu kwa wataalamu wenye sifa.",
        "hours": 2,
        "skills": [
          "uhasibu"
        ]
      }
    ]
  },
  {
    "id": "community-market",
    "name": "Soko la jumuiya / meza ya mazao ya bure",
    "purpose": "Kuendesha meza ya kudumu ya bure au ya toa-unachoweza inayogawa mazao mabichi na vyakula vikuu.",
    "whoItServes": "Majirani wasio na uhakika wa chakula na watu wa maeneo ambako chakula kibichi hakipatikani kwa urahisi.",
    "whatYoullNeed": "Chanzo cha mazao, meza au mahali, watu waliojitokeza, na ratiba ya kudumu.",
    "setupHours": 15,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Anza na mazungumzo ya upatikanaji — tembelea mashamba, maduka ya vyakula, na bustani za jumuiya ujifunze ziada gani ipo kweli na kwa mzunguko gani — na uzungumze na majirani wa eneo utakalolisaidia kuhusu wanapopita tayari na chakula gani wangechukua kweli kwenda nacho nyumbani. Chagua mahali pamoja na watakaopatumia, si kwa niaba yao.",
    "commonPitfalls": "Meza inayotokea bila mpangilio inawafundisha watu kuacha kuitegemea — uthabiti una thamani kuliko wingi. Kufeli kwingine: chanzo kinachokauka baada ya mwezi wa kwanza wa shauku, na chochote pale mezani (fomu, maswali, kuwapanga watu) kinachofanya kuchukua chakula kuonekane kama kuomba kibali.",
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
        "name": "Hakikisha upatikanaji wa mazao na bidhaa",
        "description": "Pata chakula kupitia kuokota masalia ya mavuno, bustani za jumuiya, vyakula vinavyotolewa na mashamba na maduka, na manunuzi ya jumla. Lenga aina mbalimbali na uhakika ili meza isiwe tupu.",
        "hours": 3,
        "skills": [
          "kufikia watu",
          "kuendesha gari"
        ]
      },
      {
        "name": "Tafuta mahali na uandae meza",
        "description": "Chagua mahali panapoonekana, panapofikika, na penye ruhusa — pembeni mwa bustani, uwanja wa maegesho, au kituo cha usafiri. Panga meza, kivuli, na mabango.",
        "hours": 2,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Amua mfumo",
        "description": "Chagua bure kabisa, toa-unachoweza, au mchanganyiko. Chochote utakachochagua, hakikisha hakuna anayerudishwa kamwe kwa kukosa cha kutoa.",
        "hours": 1,
        "skills": [
          "kuongoza mazungumzo"
        ]
      },
      {
        "name": "Andaa mpangilio, hifadhi, na usalama wa chakula",
        "description": "Weka mazao mahali pa baridi na panapopendeza, yashughulikie kwa usalama, na uwe na maboksi ya barafu au kivuli kwa siku za joto. Tupa chochote kilichoharibika.",
        "hours": 2,
        "skills": [
          "usalama wa chakula"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Tafuta watu na upange zamu zao",
        "description": "Panga watu wa kuchukua mazao, kuandaa, kusimamia meza, na kufunga. Mpe kila mmoja nafasi iliyo wazi kwa kila soko.",
        "hours": 2,
        "skills": [
          "kuratibu",
          "kufikia watu"
        ]
      },
      {
        "name": "Sambaza habari na uweke ratiba ya kudumu",
        "description": "Chagua siku na muda usiobadilika na uusambaze kwa mapana. Utabirika ndio unaogeuza meza kuwa tegemeo la kweli.",
        "hours": 2,
        "skills": [
          "kufikia watu",
          "kubuni michoro"
        ],
        "follows": [
          1,
          2
        ]
      },
      {
        "name": "Endesha meza na ushughulikie vilivyobaki",
        "description": "Andaa, gawa kwa ukarimu bila hukumu, na uelekeze mazao yaliyobaki kwenye friji za jumuiya, hifadhi za chakula, au milo ya pamoja ili kisipotee chochote.",
        "hours": 3,
        "skills": [
          "kuratibu"
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
    "name": "Karibu mtaani: msaada kwa jirani mpya na mzazi mpya",
    "purpose": "Kuwapokea wageni wapya na wazazi wapya kwa msaada wa vitendo, taarifa za mtaa, na karibu ya kweli katika jumuiya.",
    "whoItServes": "Watu waliohamia karibuni, wazazi wapya na wanaotarajia mtoto, na yeyote anayehitaji mwanzo wa kirafiki.",
    "whatYoullNeed": "Watu waliojitokeza, vifurushi vya taarifa, vitu vya karibu vinavyotolewa, na mfumo wa kuelekezana.",
    "setupHours": 10,
    "defaultCategory": "emotional_support",
    "firstSteps": "Zungumza kwanza na wanaokutana na wageni kabla yako — wenye nyumba za kupanga, ofisi za mapokezi za shule, kliniki, wakunga na wauguzi wa watoto — kuhusu jinsi wangemwelekeza mtu kwa ridhaa yake. Kisha uliza wachache waliofika karibuni na wazazi wapya nini kingewasaidia kweli mwezi wao wa kwanza, na ujenge kifurushi na kikapu kutokana na majibu yao.",
    "commonPitfalls": "Hii huharibika kwa kuonekana kama upelelezi — kutokea bila kualikwa mlangoni kwa mtu usiyemjua, au kupitisha majina bila ridhaa, kunageuza karibu kuwa uvamizi. Pia hufifia kimya kimya wakaribishaji wa mwanzo wakichoka na wageni kupita bila kuonekana kwa miezi mfululizo.",
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
        "name": "Amua utamkaribisha nani na vipi",
        "description": "Bainisha mwelekeo wako — majirani wapya, wazazi wapya, au wote — na umbo la karibu (ziara, kikapu, simu). Iache iwe ya hiari na kamwe isiyoingilia.",
        "hours": 1,
        "skills": [
          "kuongoza mazungumzo"
        ]
      },
      {
        "name": "Tengeneza kifurushi cha taarifa za mtaa",
        "description": "Kusanya mwongozo wazi wa kliniki, usafiri, shule, msaada wa chakula, na mpango wako wa kusaidiana. Utoe kwa lugha zinazozungumzwa eneo lako.",
        "hours": 3,
        "skills": [
          "kuandika",
          "kutafsiri"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Andaa vikapu vya karibu",
        "description": "Weka pamoja vitu vya manufaa — vyakula vikuu, vifaa vya nyumbani, na kwa wazazi wapya, vitu vichache muhimu vya mtoto au mlo uliopikwa nyumbani. Vipatikane kwa kutolewa na majirani.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "kufikia watu",
          "kuratibu"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Tafuta na uandae wakaribishaji",
        "description": "Tafuta watu wenye ukarimu na uwaelekeze kuwa wachangamfu na wenye heshima, kusoma kama mtu anataka uhusiano, na kamwe kutoshinikiza wala kudadisi.",
        "hours": 2,
        "skills": [
          "kufikia watu",
          "kufundisha"
        ]
      },
      {
        "name": "Anzisha mfumo wa kuelekezwa na kujiunga",
        "description": "Tengeneza njia rahisi za watu kuelekezwa au kujiunga wenyewe — kupitia wenye nyumba, kliniki, shule, au fomu ya kujaza. Heshimu faragha kila hatua.",
        "hours": 2,
        "skills": [
          "kuratibu",
          "kuingiza data"
        ],
        "follows": [
          0
        ]
      }
    ]
  },
  {
    "id": "library-of-things",
    "name": "Maktaba ya vitu",
    "purpose": "Kuazimisha vitu vya nyumbani na vya matukio ambavyo watu hawahitaji sana kuvimiliki — vifaa vya jikoni, vifaa vya sherehe na kambi, vifaa vya mtoto, projekta, na zaidi.",
    "whoItServes": "Mtu yeyote; inaokoa fedha, inapunguza msongamano wa vitu, na inapunguza upotevu.",
    "whatYoullNeed": "Mahali pa kuhifadhi, vitu vinavyotolewa, katalogi na mfumo wa kuazima, na wakutubi wawili.",
    "setupHours": 21,
    "defaultCategory": "infrastructure",
    "firstSteps": "Kabla ya kukusanya kitu kimoja, uliza wanajumuiya wangeazima nini kweli — utafiti huo ndio msingi wa kazi hii — na uzungumze na maktaba ya umma au kituo cha jumuiya kuhusu kuipokea, kwa sababu mwenyeji anayeaminika tayari anatatua matatizo yako ya hifadhi na ya kuaminika kwa mpigo. Tafuta wakutubi wako wawili kabla vitu havijaanza kufika, si baadaye.",
    "commonPitfalls": "Maktaba za vitu hufa kwa msongamano: kukubali kila kinachotolewa hujaza chumba mashine za mkate zilizoharibika ambazo hakuna anayezitaka, wakati mashine ya kusafisha kwa presha kila mtu aliyoiomba bado haipo. Muuaji mwingine ni saa zisizotabirika za kufunguliwa — watu wasipoweza kutegemea lini kuchukua na kurudisha, hurudi kimya kimya kununua.",
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
        "name": "Ulizia jumuiya inataka kuazima nini",
        "description": "Uliza wanajumuiya wangetumia nini lakini wangechukia kukinunua — meza za kukunja, bakuli kubwa la sherehe, hema, mashine ya kusafisha zulia, kigari cha mtoto. Majibu ndiyo huweka orodha yako ya kuanzia.",
        "hours": 2,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Tafuta hifadhi na saa za kufunguliwa",
        "description": "Pata kabati, chumba, au kontena la kuhifadhia vitu, na uweke saa za kuchukua na kurudisha zinazotabirika ili kuazima kuwe rahisi.",
        "hours": 3,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Kusanya, safisha, na ujaribu vitu",
        "description": "Kusanya vinavyotolewa, kisha safisha, jaribu, na ukague usalama wa kila kitu. Tenga chochote kilichovunjika, kilichoondolewa na mtengenezaji kwa usalama, au kisicho safi.",
        "hours": 5,
        "skills": [
          "kuendesha gari"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Weka katalogi na upige picha za vitu",
        "description": "Andika kila kitu na picha yake na hali yake kwenye lahajedwali au programu ya kuazimisha. Vipe vitu namba ili viwe rahisi kufuatilia vikitoka na kurudi.",
        "hours": 4,
        "skills": [
          "kuingiza data",
          "kupiga picha"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Andika kanuni za kuazima na msingi wa kuaminiana",
        "description": "Weka muda wa kuazima, kikomo cha idadi, na utaratibu wa kurudisha wenye huruma. Ujenge juu ya kuaminiana, si adhabu, na utaje vitu vinavyohitaji uangalifu au usafi wa ziada.",
        "hours": 2,
        "skills": [
          "kuandika"
        ]
      },
      {
        "name": "Anzisha utaratibu wa kutoa vitu na uandae wakutubi",
        "description": "Tengeneza daftari rahisi la kutolea (jina, mawasiliano, kitu, tarehe ya kurudisha) na picha fupi ya hali yake. Wapitishe waliojitokeza kwenye katalogi na utaratibu wote.",
        "hours": 3,
        "skills": [
          "kuingiza data",
          "kufundisha"
        ],
        "follows": [
          3,
          4
        ]
      },
      {
        "name": "Tunza, safisha, na ukuze mkusanyo",
        "description": "Safisha na kagua vitu vinavyorudi, tengeneza vinavyowezekana, na ongeza vitu vinavyoombwa zaidi kadri muda unavyokwenda.",
        "hours": 2,
        "skills": [
          "kutengeneza"
        ],
        "recurringCadence": "session"
      }
    ]
  },
  {
    "id": "laundry-shower-access",
    "name": "Mpango wa nafasi za kufua na kuoga",
    "purpose": "Kutoa nafasi ya bure ya kufua na kuoga ili watu wakae safi kwa heshima.",
    "whoItServes": "Majirani wasio na makazi, watu wasio na vifaa vinavyofanya kazi majumbani, na familia za kipato cha chini.",
    "whatYoullNeed": "Nafasi ya mashine na sehemu za kuoga (mahali pa mwenyeji au kitengo kinachotembea), vifaa, na watu waliojitokeza. Heshima na faragha ya wageni huja kwanza — usihitaji taarifa binafsi yoyote ili mtu atumie mpango, weka sehemu za kuoga za faragha na salama, na fuata kanuni za afya za eneo lako kwa vifaa vya pamoja au vinavyotembea.",
    "setupHours": 19,
    "defaultCategory": "infrastructure",
    "suggestsWorkDays": true,
    "firstSteps": "Anza na mazungumzo ya aina mbili: na majirani wasio na makazi na wafanyakazi wa kuwafikia wanaowajua, kuhusu saa na maeneo gani yangefaa kweli — na na mwenye sehemu ya kufulia, jimu, au nyumba ya ibada kuhusu kuwa mwenyeji. Mazungumzo hayo ya mwenyeji ni nyeti; kuwa mkweli kuhusu wanaokuja na mkubaliane matarajio ya faragha, usafi, na ratiba kabla mgeni wa kwanza hajafika.",
    "commonPitfalls": "Mpango huu hufa uhusiano na mwenyeji ukichacha — tukio moja baya bila utaratibu nyuma yake, na mahali panapotea — au saa zikibadilika mara nyingi kiasi kwamba watu wanavuka mji kukuta mlango umefungwa. Na kila karatasi unayoihitaji mlangoni inamrudisha mtu aliyehitaji kuoga kuliko wewe ulivyohitaji jina lake.",
    "pairsWith": [
      "free-haircut",
      "cooling-warming-center",
      "diaper-hygiene-bank"
    ],
    "tasks": [
      {
        "name": "Pata nafasi ya kufua na kuoga",
        "description": "Shirikiana na sehemu ya kufulia, jimu, nyumba ya ibada, kituo cha michezo, au panga kitengo kinachotembea. Hakikisha nyakati za kutegemewa na kwamba mahali pana faragha.",
        "hours": 4,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Tafuta vifaa",
        "description": "Kusanya sabuni ya kufulia, taulo safi, sabuni, shampuu, na vifaa vingine vya usafi kwa kutolewa na majirani au bajeti ndogo. Weka na nguo safi kadhaa ukiweza.",
        "hours": 3,
        "skills": [
          "kufikia watu",
          "kuendesha gari"
        ]
      },
      {
        "name": "Anzisha mfumo wa kuandika jina na nafasi za muda",
        "description": "Tengeneza njia ya haki ya kuchukua zamu za kufua na za kuoga ili kusubiri kusiwe kurefu na kila mtu apate nafasi yake.",
        "hours": 3,
        "skills": [
          "kuratibu",
          "kuingiza data"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Weka taratibu za usafi na usalama",
        "description": "Weka utaratibu wa kusafisha kati ya mgeni na mgeni, hakikisha sehemu za kuoga za faragha na salama, na linda heshima na usalama wa kila mtu muda wote.",
        "hours": 3,
        "skills": [
          "kuandika"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Tafuta na uandae waliojitokeza",
        "description": "Tafuta watu wa kupokea wageni, kutunza vifaa, na kusafisha kati ya matumizi. Waandae kumpokea kila mgeni kwa joto na heshima.",
        "hours": 3,
        "skills": [
          "kufikia watu",
          "kufundisha"
        ],
        "follows": [
          3
        ]
      },
      {
        "name": "Weka ratiba na usambaze habari",
        "description": "Chagua saa zisizobadilika na uwajulishe wafanyakazi wa kuwafikia watu, makazi ya muda, na majirani wanaoishi mitaani lini na wapi mpango unafanyika.",
        "hours": 3,
        "skills": [
          "kufikia watu"
        ],
        "follows": [
          0
        ]
      }
    ]
  },
  {
    "id": "voter-registration",
    "name": "Kampeni ya kuandikisha wapigakura na ushiriki wa kiraia",
    "purpose": "Kuandikisha wapigakura na kusaidia watu kushiriki uchaguzi na maamuzi ya mtaa — bila kufungamana na chama chochote kabisa.",
    "whoItServes": "Wenye haki ya kupiga kura, hasa wale ambao kihistoria hawakuwakilishwa vya kutosha vituoni.",
    "whatYoullNeed": "Watu walioandaliwa, vifaa vya kuandikisha, kanuni sahihi, na maeneo mazuri. Iweke kampeni bila kufungamana na chama chochote kabisa na ufuate sheria zote za uchaguzi na uandikishaji kwa usahihi — toa taarifa sahihi tu na kamwe usimpigie debe chama wala mgombea yeyote.",
    "setupHours": 16,
    "defaultCategory": "organizing",
    "firstSteps": "Kabla yeyote hajaweka meza, zungumza na ofisi ya uchaguzi ya eneo lako — watakuambia hasa kampeni za kuandikisha zinaruhusiwa na kukatazwa nini, na baadhi ya maeneo yanahitaji mafunzo au kibali kwanza. Kisha wasiliana na kikundi kilichojiimarisha kisichofungamana na chama chochote, kama League of Women Voters; kuazima vifaa na uzoefu wao ni bora kuliko kujifunza sheria ya uchaguzi kwa kujaribu na kukosea.",
    "commonPitfalls": "Kufeli kusikosameheka ni kwa kisheria: rundo la fomu zilizojazwa likisahaulika kwenye buti la gari hadi tarehe ya mwisho kupita linamnyima kura kila mtu aliyekuamini, na mmoja tu akimpigia debe mgombea anaweza kuichafua kampeni nzima. Kosa la kimya zaidi ni kugawa fomu za kujiandikisha bila kamwe kutaja wapi na jinsi ya kupiga kura kwenyewe.",
    "pairsWith": [
      "newcomer-translation-network",
      "legal-aid-clinic"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Jifunze kanuni za kampeni za kuandikisha",
        "description": "Chunguza sheria za eneo lako kuhusu kuandikisha wapigakura: tarehe za mwisho, waliojitokeza wanaruhusiwa na kukatazwa nini, fomu zinavyopaswa kushughulikiwa, na masharti ya vitambulisho. Kuzifuata kwa usahihi ni lazima.",
        "hours": 3,
        "skills": [
          "makaratasi"
        ]
      },
      {
        "name": "Andaa watu wasiofungamana na chama",
        "description": "Waelekeze waliojitokeza kumsaidia kila mtu kujiandikisha bila kujali msimamo wake, na kamwe kutompigia debe chama wala mgombea. Kutofungamana kunalinda kampeni na imani ya jumuiya.",
        "hours": 3,
        "skills": [
          "kufundisha"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Kusanya vifaa na taarifa sahihi",
        "description": "Kusanya fomu za kujiandikisha na taarifa za sasa zilizohakikiwa kuhusu tarehe za mwisho, masharti ya vitambulisho, vituo vya kupigia kura, na njia za posta. Taarifa mbaya inadhuru kuliko kukosekana kwake.",
        "hours": 2,
        "skills": [
          "kuandika"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Chagua maeneo na matukio yenye watu wengi",
        "description": "Weka meza mahali wenye haki ya kupiga kura wanapokusanyika tayari — masoko, vituo vya usafiri, vyuo, matukio ya jumuiya — na ruhusa yoyote inayohitajika ya kuweka meza.",
        "hours": 2,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Endesha meza ya kuandikisha",
        "description": "Simamia meza, wasaidie watu kujiandikisha kwa usahihi, na uwasilishe fomu mara moja ndani ya muda wa kisheria. Weka hali ya ukaribisho na taarifa.",
        "hours": 4,
        "skills": [
          "kufikia watu"
        ],
        "follows": [
          1,
          2,
          3
        ],
        "recurringCadence": "event"
      },
      {
        "name": "Saidia hatua zinazofuata",
        "description": "Zaidi ya kuandikisha, wasaidie watu kujua jinsi, lini, na wapi pa kupiga kura, pamoja na njia za posta na usafiri hadi vituoni. Kujiandikisha peke yake si kushiriki.",
        "hours": 2,
        "skills": [
          "kufikia watu"
        ]
      }
    ]
  },
  {
    "id": "health-navigation",
    "name": "Mpango wa waelekezi wa afya wa jumuiya",
    "purpose": "Kusaidia majirani kupata na kufikia matibabu — kliniki, bima, dawa, na miadi.",
    "whoItServes": "Wasio na bima na wenye bima pungufu, wazee, wageni wapya, na yeyote aliyepotea kwenye mfumo wa afya.",
    "whatYoullNeed": "Waelekezi walioandaliwa, orodha ya vyanzo vya msaada, mahusiano na kliniki na watoa matibabu, na mfumo wa kupokea mahitaji. Waelekezi huwaunganisha watu na matibabu — hawatoi ushauri wa kitabibu wala utambuzi. Elekeza kila swali la kitabibu kwa wataalamu wa afya wenye sifa.",
    "setupHours": 26,
    "defaultCategory": "other",
    "firstSteps": "Anza kwa kutembelea kliniki za bure na za nafuu utakazoelekeza watu — jitambulishe, uliza maelekezo yapi yanawasaidia na yapi yanawazidia, na acha mazungumzo hayo yapande mbegu ya orodha yako. Kubaliana mpaka kabla hitaji la kwanza halijafika: waelekezi hushughulikia mipango na makaratasi, kila swali la kitabibu huenda kwa mtaalamu — hivyo jua hasa namba ya wauguzi au kliniki gani utakayoyakabidhi.",
    "commonPitfalls": "Ukingo mkali ni mwelekezi mwenye nia njema kuteleza kwenye ushauri wa kitabibu — “hiyo haisikiki mbaya sana” ya kawaida inaweza kumpotezea mtu wiki za matibabu aliyoyahitaji. Hii pia hufeli orodha inapochakaa kimya kimya, ikiwapeleka watu kliniki zilizofungwa au mipango iliyokwisha; namba moja mbaya inampoteza aliyekuwa kwenye jaribio lake la mwisho.",
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
        "name": "Jenga orodha ya vyanzo vya msaada wa afya",
        "description": "Kusanya kliniki za bure na za nafuu, watoa matibabu wanaopokea kadri ya hali ya mtu, mipango ya msaada wa dawa, chaguo za meno na macho, na msaada wa afya ya akili. Iweke ya kisasa daima.",
        "hours": 6,
        "skills": [
          "kuingiza data",
          "kufikia watu"
        ]
      },
      {
        "name": "Tafuta na uandae waelekezi",
        "description": "Tafuta watu na uwaandae kuwaunganisha wenzao na matibabu — si kutoa ushauri wa kitabibu. Kazi yao ni uelekezaji na mipango, na maswali ya kitabibu yanaelekezwa kwa wataalamu.",
        "hours": 5,
        "skills": [
          "kufikia watu",
          "kufundisha"
        ]
      },
      {
        "name": "Anzisha mfumo wa kuomba na kupokea",
        "description": "Tengeneza njia ya faragha, isiyo na vikwazo, ya watu kuomba msaada na kueleza hali yao, yenye simu na ana kwa ana, si mtandaoni tu.",
        "hours": 3,
        "skills": [
          "kuratibu"
        ]
      },
      {
        "name": "Saidia bima na kujiandikisha",
        "description": "Wasaidie watu kuelewa na kuomba bima wanayostahili (kama vile Medicaid au bima ya afya yenye ruzuku ya serikali) na kukusanya hati zinazohitajika.",
        "hours": 4,
        "recurringCadence": "month",
        "skills": [
          "makaratasi"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Toa msaada wa miadi na dawa",
        "description": "Saidia kupanga miadi, kuweka vikumbusho, kutafuta njia za kupata dawa kwa nafuu, na kuunganisha na programu ya usafiri kwa safari za matibabu.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "kuratibu"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Weka taratibu za faragha za taarifa za afya",
        "description": "Chukulia kila undani wa afya kuwa nyeti sana: kusanya kilicho cha lazima tu, hifadhi kwa usalama, na kamwe usishiriki bila ridhaa. Waandae waelekezi kuhusu usiri.",
        "hours": 2,
        "skills": [
          "kuandika"
        ]
      },
      {
        "name": "Shirikiana na kliniki na watoa matibabu",
        "description": "Jenga mahusiano na kliniki na watoa matibabu wa eneo lako kwa maelekezo laini zaidi na kujua mipango mipya ya nafuu inapoanza.",
        "hours": 3,
        "skills": [
          "kufikia watu"
        ]
      }
    ]
  },
  {
    "id": "toy-library",
    "name": "Maktaba ya midoli na kuazimisha vifaa vya kuchezea",
    "purpose": "Kuazimisha midoli, michezo, na vifaa vya kuchezea ili familia zipate aina mbalimbali bila kununua.",
    "whoItServes": "Familia zenye watoto wadogo, hasa zenye kipato kidogo; pia hupunguza taka na mrundikano wa vitu.",
    "whatYoullNeed": "Mahali pa kuhifadhia, midoli iliyotolewa, katalogi na utaratibu wa kuazima, vifaa vya usafi, na watunzaji wa maktaba.",
    "setupHours": 10,
    "defaultCategory": "childcare",
    "firstSteps": "Zungumza na familia unazotarajia kusaidia — wakati wa kuchukua watoto kituo cha kulea watoto, kwenye kipindi cha hadithi, au kikundi cha kuchezea — kuhusu midoli gani watoto wao huiacha haraka zaidi na nyakati zipi wangeweza kufika kweli, kisha uliza kituo cha jumuiya, kanisa, msikiti, au maktaba kuhusu rafu moja au chumba. Mtafute mapema mtu anayejua mambo ya watoto aliyejitokeza kushika ukaguzi wa usalama kabla midoli haijaanza kufika.",
    "commonPitfalls": "Maktaba za midoli huanguka kwa usalama na kwa vipande: mdoli mmoja tu ulioondolewa sokoni au wenye hatari ya kumkaba mtoto ukipenya, imani ya familia inavunjika kabisa, na fumbo linalorudi limepungua kipande kimoja hufanya mkusanyiko wote uonekane takataka ndani ya miezi michache. Ukaguzi mkali na mifuko yenye idadi iliyohesabiwa ndiyo siri yote.",
    "pairsWith": [
      "library-of-things",
      "childcare-collective",
      "school-supply-program"
    ],
    "tasks": [
      {
        "name": "Tafuta mahali pa kuhifadhia na weka nyakati za kufungua",
        "description": "Pata rafu kwenye kituo cha jumuiya, maktaba, au chumba cha pamoja, na weka nyakati za kuchukua na kurudisha zinazotabirika ili familia zipange ratiba zao.",
        "hours": 1.5,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Kusanya, safisha, na kagua usalama wa midoli",
        "description": "Kusanya midoli inayotolewa, kisha safisha na kagua kila mmoja. Angalia iliyoondolewa sokoni, sehemu zilizovunjika, na hatari za kumkaba mtoto, na tenga chochote kisicho salama kwa watoto wadogo.",
        "hours": 3.5,
        "skills": [
          "kuendesha gari",
          "kulea watoto"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Andika kwenye katalogi na fungasha vipande vyote",
        "description": "Andika kila mdoli na picha yake na umri unaofaa, na weka seti za vipande vingi kwenye mfuko wenye idadi iliyoandikwa ili kisipotee chochote. Weka namba ili kufuatilia kwa urahisi.",
        "hours": 2,
        "skills": [
          "kuingiza data",
          "kupiga picha"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Andika masharti ya kuazima",
        "description": "Weka muda wa kuazima, midoli mingapi kwa mara moja, na utaratibu wa upole kuhusu kurudisha na vipande vilivyopotea. Ubaki wa kuaminiana na wa kusamehe.",
        "hours": 1,
        "skills": [
          "kuandika"
        ]
      },
      {
        "name": "Anzisha utaratibu wa kuazima na wafundishe watunzaji",
        "description": "Tengeneza fomu rahisi ya kuazima (jina, mawasiliano, kitu, tarehe ya kurudisha) na uwapitishe waliojitokeza kwenye katalogi, utaratibu wa usafi, na masharti.",
        "hours": 2,
        "skills": [
          "kuingiza data",
          "kufundisha"
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
    "name": "Kikundi cha kuhifadhi chakula na kuweka mitungini",
    "purpose": "Kufundisha na kufanya pamoja uhifadhi wa chakula kwenye mitungi ili ziada ya msimu idumu na chakula kidogo kipotee.",
    "whoItServes": "Wakulima wa bustani, waokotaji wa masalia ya mavuno, na familia zinazotaka chakula kiwafikishe mwaka mzima.",
    "whatYoullNeed": "Jiko, vifaa vya kuhifadhia chakula na mitungi, waongozaji wanaojua, na mazao. Uhifadhi wa nyumbani una hatari za kweli za usalama wa chakula, ikiwemo sumu ya botulism, ukifanywa vibaya — fuata daima miongozo iliyojaribiwa ya sasa kutoka chanzo cha kuaminika na usibuni kamwe muda wala njia za kupikia.",
    "setupHours": 18,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Tafuta maarifa kabla ya jiko: wasiliana na ofisi ya ugani ya eneo lako au mtaalamu wa kuhifadhi chakula mwenye cheti na uwaombe wafundishe waongozaji wako au wapitie mipango yako, kisha zungumza na wakulima wa bustani na waokotaji wa masalia kuhusu ziada gani huja kwa wingi lini hasa. Ratibu jiko kufuata kalenda ya mavuno, si kinyume chake.",
    "commonPitfalls": "Kushindwa kunakohatarisha zaidi hakuonekani: mtungi uliofungwa kwa njia ya kubuni au mapishi ya bibi yasiyojaribiwa unaweza kubeba sumu ya botulism na kuonekana mzima kabisa rafuni. Kushindwa kwa kawaida ni muda — nyanya huiva kwa ratiba yake yenyewe, na kikundi kinachofanya kipindi chake cha kwanza mwezi Novemba hakihifadhi chochote.",
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
        "name": "Pata jiko linalofaa",
        "description": "Tafuta jiko lenye majiko ya kupikia, nafasi ya meza, na maji kwa ajili ya kupika na usafi. Ukumbi wa kanisa, kituo cha jumuiya, au jiko kubwa rasmi linafaa.",
        "hours": 2,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Jifunze njia salama za kuhifadhi",
        "description": "Waongozaji wako wasome njia zilizojaribiwa na zenye msingi wa utafiti kutoka chanzo kinachoaminika rasmi (kama ofisi ya ugani ya chuo kikuu). Uhifadhi mbovu unaweza kusababisha ugonjwa mkali, hivyo fuata daima mapishi na muda wa kupika vilivyojaribiwa bila kubadilisha.",
        "hours": 4,
        "skills": [
          "usalama wa chakula",
          "kupika"
        ]
      },
      {
        "name": "Kusanya vifaa na mitungi",
        "description": "Kusanya masufuria ya kuchemshia maji na/au ya presha, mitungi, mifuniko, na zana kupitia vitu vinavyotolewa au pesa kidogo. Hakikisha masufuria ya presha yako salama kutumika.",
        "hours": 3,
        "skills": [
          "kufikia watu",
          "kuendesha gari"
        ]
      },
      {
        "name": "Tafuta mazao",
        "description": "Leta ziada ya msimu kutoka kwenye kuokota masalia ya mavuno, bustani, mashamba, au kununua kwa jumla. Panga vipindi wakati mazao yamejaa na ni nafuu.",
        "hours": 2,
        "recurringCadence": "cycle",
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Panga vipindi vya kuhifadhi pamoja",
        "description": "Chagua mapishi yanayolingana na mazao na uwezo wa kikundi, na panga vituo vya kazi ili kazi iende salama na kwa ufanisi.",
        "hours": 2,
        "recurringCadence": "session",
        "skills": [
          "kupika",
          "kuratibu"
        ],
        "follows": [
          1,
          3
        ]
      },
      {
        "name": "Fundisha na uongoze vipindi kwa usalama",
        "description": "Ongoza kikundi hatua kwa hatua, ukisimamia ushikaji salama, muda sahihi wa kupika, na ufungaji unaofaa. Ufanye kipindi cha kufundishana ili ujuzi usambae.",
        "hours": 4,
        "skills": [
          "kupika",
          "kufundisha"
        ],
        "follows": [
          0,
          2,
          4
        ],
        "recurringCadence": "session"
      },
      {
        "name": "Gawana chakula kilichohifadhiwa na andika",
        "description": "Gawana vyakula vilivyohifadhiwa kati ya walioshiriki na miradi kama friji ya jumuiya au kabati la chakula. Weka lebo kila mtungi yenye kilichomo na tarehe, na andika kilichofanikiwa kwa ajili ya wakati ujao.",
        "hours": 1,
        "recurringCadence": "session",
        "skills": [
          "kuratibu"
        ],
        "follows": [
          5
        ]
      }
    ]
  },
  {
    "id": "free-haircut",
    "name": "Siku za kunyoa nywele na unadhifu wa bure",
    "purpose": "Kutoa kunyolewa nywele na unadhifu bure ili kurudisha heshima, kujiamini, na mwanzo mpya.",
    "whoItServes": "Majirani wasio na makao, watafuta kazi, familia za kipato kidogo, na wazee.",
    "whatYoullNeed": "Wasusi na vinyozi wenye leseni waliojitokeza, mahali, vifaa, na usafi.",
    "setupHours": 10,
    "defaultCategory": "skilled_labor",
    "suggestsWorkDays": true,
    "firstSteps": "Anza na mazungumzo mawili: moja na msusi au kinyozi mwenye leseni aliye tayari kuja na mwenzake, na jingine na watu unaotarajia kusaidia — hifadhi ya wasio na makao, kituo cha mchana, au mpango wa watafuta kazi vinaweza kukuambia siku na mazingira gani yangewafanya wajisikie huru kweli. Msusi na mahali pa kukaribisha wakikubali wote wawili, kilichobaki ni vifaa na ratiba.",
    "commonPitfalls": "Mradi huu hujikwaa unapohisiwa kama foleni ya kupewa tu badala ya saluni — kunyoa kwa haraka-haraka, bila kuchagua mtindo, kamera zikiwa nje kwa ajili ya mitandao. Muulize kila mtu anataka nini, acha picha isipokuwa wao wenyewe wakizipendekeza, na usimruhusu kamwe asiye na leseni kunyoa ili kuongeza idadi; tatizo moja la usafi linaweza kumaliza mpango mzima.",
    "pairsWith": [
      "laundry-shower-access",
      "reentry-support"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Watafute wasusi na vinyozi wenye leseni",
        "description": "Tafuta wataalamu walio tayari kutoa ujuzi wao. Wenye leseni huhakikisha kazi salama na bora na usafi unaofaa.",
        "hours": 2.5,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Tafuta mahali penye maji na usafi",
        "description": "Pata mahali penye maji, mwanga mzuri, na sehemu zinazosafishika — kituo cha jumuiya, saluni baada ya saa zake za kazi, au kanisa au msikiti.",
        "hours": 1.5,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Tafuta vifaa na mahitaji",
        "description": "Kusanya mashine za kunyoa, mikasi, mashuka ya kunyolea, vichana, vioo, na vya kutupwa. Ongeza vya ziada vya unadhifu kama wembe na sabuni vya kwenda navyo nyumbani.",
        "hours": 2,
        "skills": [
          "kufikia watu",
          "kuendesha gari"
        ]
      },
      {
        "name": "Panga usafi na kufuata masharti ya leseni",
        "description": "Weka utaratibu wa kuua vijidudu kwenye zana kati ya mgeni na mgeni na fuata kanuni za eneo lako za kunyoa watu hadharani. Usafi unamlinda kila mtu.",
        "hours": 1.5,
        "skills": [
          "makaratasi"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Endesha siku za unadhifu",
        "description": "Fanya tukio, weka hali ya ukarimu na heshima, na umchukulie kila mtu kama mgeni wa thamani, si mtu anayepewa tu.",
        "hours": 2.5,
        "skills": [
          "kuratibu"
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
    "name": "Kikosi cha kusaidiana kuhama",
    "purpose": "Kusaidia kuhama watu wasio na uwezo wa kuajiri wahamishaji — wanaoondoka kwenye mazingira hatari, wanaokabiliwa na kufukuzwa nyumba, au wanaohamia nyumba ndogo.",
    "whoItServes": "Majirani wa kipato kidogo, watu wanaokimbia nyumba zisizo salama, wazee, na majirani wenye ulemavu.",
    "whatYoullNeed": "Waliojitokeza wenye magari na nguvu, vifaa vya kuhamia, na taratibu wazi za usalama. Kwa yeyote anayeondoka kwenye mazingira hatari, weka anwani mpya, tarehe, na maelezo kuwa siri kabisa, na fuata uongozi wa mtu huyo kuhusu muda na usalama.",
    "setupHours": 14,
    "defaultCategory": "transport",
    "suggestsWorkDays": true,
    "firstSteps": "Kabla ya kutafuta hata lori moja, zungumza na wale ambao tayari hupokea maombi haya — watetezi wa walioathiriwa na ukatili wa nyumbani, waratibu wa haki za wapangaji, wanaoshughulikia wazee — kuhusu jinsi maombi yanavyopaswa kukufikia na usiri gani watautarajia, kwa kuwa baadhi ya uhamaji unamaanisha mtu anaondoka kwenye nyumba isiyo salama. Kisha kusanya waliojitokeza watatu au wanne wenye nguvu na gari moja, na pimeni pamoja uhamaji wenu mdogo wa kwanza.",
    "commonPitfalls": "Vikosi vya kuhamisha huumia au kuchoka haraka: kazi kubwa kupita kiasi yenye mikono michache, aliyejitokeza kunyanyua vibaya, anwani iliyosambazwa kwenye chati ya kikundi ambayo haikupaswa kamwe kutoka kwenye simu ya mratibu. Wekeni uhamaji ndani ya mipaka mliyoitaja, na chukulieni maelezo ya kila uhamaji unaohusu usalama kana kwamba yanaweza kumweka mtu hatarini — kwa sababu yanaweza.",
    "pairsWith": [
      "tenant-union",
      "free-store"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Kusanya kikosi na magari",
        "description": "Kusanya waliojitokeza wanaoweza kunyanyua na kubeba salama, pamoja na upatikanaji wa malori au magari ya mizigo. Weka orodha yenye nyakati zao wazi ili uunde kikosi haraka.",
        "hours": 2.5,
        "skills": [
          "kufikia watu",
          "kuendesha gari"
        ]
      },
      {
        "name": "Kusanya vifaa vya kuhamia",
        "description": "Kusanya toroli, mikanda ya samani, mablanketi ya kuhamia, na maboksi yanayotumika tena kupitia vinavyotolewa. Vifaa vya pamoja hufanya uhamaji uwe wa haraka na salama zaidi.",
        "hours": 1.5,
        "skills": [
          "kuendesha gari"
        ]
      },
      {
        "name": "Jenga utaratibu wa kuomba na kupima uhamaji",
        "description": "Tengeneza njia ya kuomba msaada na kupima kila uhamaji: kiasi gani, ngazi au lifti, umbali, na wakati. Hii inakuwezesha kupanga ukubwa wa kikosi na vifaa.",
        "hours": 2,
        "skills": [
          "kuratibu"
        ]
      },
      {
        "name": "Shughulikia usalama na uwajibikaji",
        "description": "Wafundishe waliojitokeza kunyanyua salama, tumia fomu rahisi za makubaliano, na kagua bima ya kila gari linalotumika. Kuwalinda wanaosaidia na wanaosaidiwa ni muhimu.",
        "hours": 2,
        "skills": [
          "makaratasi"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Weka ratiba na ugawaji wa kazi",
        "description": "Linganisha maombi na vikosi vilivyopo na thibitisha na kila mtu siku moja kabla. Weka orodha ya majina ya ziada kwa kuwa uhamaji si rahisi kuahirishwa.",
        "hours": 1.5,
        "skills": [
          "kuratibu"
        ],
        "follows": [
          0,
          2
        ]
      },
      {
        "name": "Weka mipaka na upeo",
        "description": "Amueni mtakachoshughulikia na msichokishughulikia (hakuna kemikali hatari, piano, au kazi zinazozidi uwezo salama wa kikosi). Elekezeni hizo kwingine.",
        "hours": 1,
        "skills": [
          "kuandika"
        ]
      },
      {
        "name": "Endesha uhamaji na fuatilia",
        "description": "Fanya uhamaji kwa usalama na heshima, kisha hakikisha mtu ametulia. Muunganishe na miradi mingine (duka la bure, ukaribisho wa wapya) inapohitajika.",
        "hours": 3.5,
        "skills": [
          "kuendesha gari"
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
    "name": "Mtandao wa msaada wa ulemavu na ufikivu",
    "purpose": "Kuwaunganisha majirani wenye ulemavu na waungaji mkono kwa ajili ya kusaidiana, ufikivu, na utetezi — ukiongozwa na wenye ulemavu wenyewe.",
    "whoItServes": "Majirani wenye ulemavu na wenye magonjwa ya muda mrefu.",
    "whatYoullNeed": "Mfumo wa mawasiliano unaofikika, viongozi kutoka miongoni mwao, na orodha ya vyanzo vya msaada. Msaada wa wenzao hukamilisha matunzo ya kitaalamu — elekeza maswali ya kitabibu, ya matunzo binafsi, na ya kisheria kwa wataalamu wenye sifa, na chukulia taarifa za afya za wanajumuiya kuwa za faragha.",
    "setupHours": 24,
    "defaultCategory": "organizing",
    "firstSteps": "Mtandao huu unafanya kazi tu ikiwa majirani wenye ulemavu wapo mezani tangu mazungumzo ya kwanza kabisa — si kuulizwa baadaye, bali kuamua utakuwa nini. Anza kwa kuwaomba wenye ulemavu wawili au watatu unaowajua wauanzishe pamoja nawe (au, kama wewe mwenyewe una ulemavu, wagawane nawe mzigo), na acha mahitaji yao ya ufikivu yaunde jinsi mkutano wa kwanza unavyofanyika: muundo, mahali, na mwendo pia.",
    "commonPitfalls": "Kushindwa kwa kawaida ni waungaji mkono wenye nia njema kujenga mpango kwa ajili ya wenye ulemavu ambao wenye ulemavu hawakuuomba, kwa miundo wasiyoweza kuitumia. Kushindwa kwa kimya zaidi ni kuteleza kuwa matunzo yasiyo rasmi: msaada wa wenzao hauwezi kuchukua salama nafasi ya matunzo ya kitabibu au ya binafsi, hivyo endelea kuelekeza mahitaji hayo kwa wataalamu wenye sifa na linda taarifa za afya za wanajumuiya kama siri walizo nazo.",
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
        "name": "Weka uongozi wa wenye ulemavu katikati",
        "description": "Hakikisha wanajumuiya wenye ulemavu ndio wanaoongoza na kuunda mtandao. “Hakuna lolote kuhusu sisi bila sisi” ndiyo kanuni ya msingi — waungaji mkono wanasaidia, hawaongozi.",
        "hours": 3,
        "skills": [
          "kuongoza mazungumzo"
        ]
      },
      {
        "name": "Jenga mfumo wa mawasiliano unaofikika",
        "description": "Toa njia nyingi za kushiriki (simu, ujumbe, mtandaoni, ana kwa ana), tumia lugha rahisi, na hakikisha nyaraka zinafanya kazi na visoma-skrini na mahitaji mbalimbali.",
        "hours": 3,
        "skills": [
          "ufikivu",
          "msaada wa kiufundi"
        ]
      },
      {
        "name": "Chora ramani ya mahitaji na vyanzo vya msaada",
        "description": "Jifunze wanajumuiya wanahitaji nini na orodhesha vilivyopo karibu: usafiri unaofikika, vyanzo vya vifaa, ofisi husika, na msaada wa kufuatilia mafao. Tambua mapengo makubwa zaidi.",
        "hours": 5,
        "skills": [
          "kufikia watu",
          "kuingiza data"
        ]
      },
      {
        "name": "Anzisha mabadilishano ya kusaidiana",
        "description": "Tengeneza njia ya wanajumuiya kutoa na kupokea msaada — kufanyiwa shughuli ndogo, wenzi wa utetezi kwenye miadi, kujuliana hali — kwa kulingana na uwezo na mahitaji.",
        "hours": 3,
        "skills": [
          "kuratibu"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Anzisha kuazimana vifaa",
        "description": "Kusanya na kuazimisha vifaa vya kutembelea na vifaa saidizi, vikisafishwa kila vinapobadilisha mikono. Vifaa vingi hukaa bila kutumika baada ya kupitwa au kutohitajika tena.",
        "hours": 4,
        "skills": [
          "kufikia watu",
          "kuratibu"
        ]
      },
      {
        "name": "Toa msaada wa utetezi na uelekezi",
        "description": "Wasaidie wanajumuiya kufuatilia mafao, marekebisho ya mahitaji, na ofisi husika. Shiriki taarifa na uandamane nao, na elekeza maswali ya kisheria na ya kitabibu kwa wataalamu wenye sifa.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "makaratasi"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Weka viwango vya ufikivu kwa matukio yote ya mpango",
        "description": "Tengeneza orodha ya kukagua (kuingia kwenye ukumbi, viti, ukalimani, mahitaji ya hisia, nyaraka) ili kila mradi katika mpango wenu mpana uwakaribishe wanajumuiya wenye ulemavu.",
        "hours": 3,
        "skills": [
          "ufikivu",
          "kuandika"
        ]
      }
    ]
  },
  {
    "id": "books-to-prisoners",
    "name": "Vitabu kwa waliofungwa na mpango wa kuandikiana barua",
    "purpose": "Kutuma vitabu na barua bure kwa watu waliofungwa gerezani ili kupunguza upweke na kuunga mkono kujifunza.",
    "whoItServes": "Watu waliofungwa gerezani na, kupitia wao, familia zao na jumuiya zao.",
    "whatYoullNeed": "Vitabu vinavyotolewa, waliojitokeza, stempu za posta, na ufahamu wa kanuni za barua za kila gereza. Kanuni za barua za kila gereza ni kali na tofauti — vifurushi vinavyozivunja hukataliwa, hivyo zifuate kikamilifu, na waliojitokeza watumie daima anwani ya mpango, kamwe si ya nyumbani.",
    "setupHours": 21,
    "defaultCategory": "education",
    "suggestsWorkDays": true,
    "firstSteps": "Kabla ya kukusanya hata kitabu kimoja, wasiliana na kikundi kilichozoea kutuma vitabu magerezani — wengi watashiriki kwa furaha magereza wanayoyafikia, kanuni zipi huwakwaza watu, na wapi maombi hukaa bila kujibiwa. Kisha pata sera ya sasa ya barua kwa maandishi kwa gereza moja au mawili mtakayoanza nayo; kinachopaswa kuunda mkusanyiko wenu ni kile wanachoomba kweli waliofungwa, si chochote wanachoondoa watoaji kwenye rafu zao.",
    "commonPitfalls": "Mradi huu hufa kwa vifurushi vilivyokataliwa: kitabu kilichotumika mahali panapokubali vipya tu, jalada gumu, kanuni ya lebo iliyosahaulika — stempu zimepotea bure na kifurushi alichokisubiri mtu kwa muda mrefu kimerudishwa. Pia unaweza kuwaumiza waliojitokeza wanaoandika kutoka nyumbani; kila barua hutoka kwa anwani ya mpango, bila hata moja kuwa tofauti, hata mawasiliano yawe na joto kiasi gani.",
    "pairsWith": [
      "reentry-support",
      "free-little-library"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Jifunze kanuni za barua za gereza",
        "description": "Kila gereza lina kanuni kali mahususi — mengi huhitaji vitabu vipya vilivyotumwa moja kwa moja kutoka kwa mchapishaji au duka lililokubaliwa, na mipaka ya maudhui na idadi. Zichunguze kwa makini, kwa sababu barua zinazovunja kanuni hukataliwa.",
        "hours": 5,
        "skills": [
          "makaratasi"
        ]
      },
      {
        "name": "Kusanya vitabu na mahali pa kufanyia kazi",
        "description": "Kusanya vitabu vinavyotolewa (ndani ya kanuni za gereza) na andaa eneo la kupanga na kufungasha. Weka mchanganyiko: kamusi, elimu, hadithi, na vya kujiandaa na maisha baada ya kifungo huombwa mara nyingi zaidi.",
        "hours": 4,
        "skills": [
          "kufikia watu",
          "kuendesha gari"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Anzisha utaratibu wa kupokea vinavyoombwa",
        "description": "Tengeneza mchakato wa kupokea na kufuatilia maombi ya waliofungwa, wanaoandika wakitaja mada au majina ya vitabu. Linganisha maombi na vitabu vilivyopo.",
        "hours": 3,
        "skills": [
          "kuingiza data",
          "kuratibu"
        ]
      },
      {
        "name": "Tafuta na kufundisha waliojitokeza",
        "description": "Wafundishe kulinganisha maombi, kufungasha ndani ya kanuni za kila gereza, na kuandika vidokezo vya kufikiria. Usahihi kwenye kanuni huzuia stempu kupotea na vifurushi kukataliwa.",
        "hours": 3,
        "skills": [
          "kufikia watu",
          "kufundisha"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Shughulikia stempu na usafirishaji",
        "description": "Stempu za posta ndizo hitaji kuu la pesa linaloendelea. Kusanyeni pesa zake pamoja, tumia njia nafuu zaidi inayokubalika, na panga siku za kutuma za mara kwa mara.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Anzisha mpango wa kuandikiana barua",
        "description": "Waunganishe waliojitokeza kama marafiki wa kalamu panapotakiwa, na miongozo wazi ya usalama na faragha (tumia anwani ya mpango, si za binafsi). Kuunganika ni muhimu kama vitabu.",
        "hours": 3,
        "skills": [
          "kuandika"
        ]
      }
    ]
  },
  {
    "id": "community-music",
    "name": "Mpango wa muziki na ala za jumuiya",
    "purpose": "Kuazimisha ala za muziki na kutoa masomo ya bure na vikao vya kupiga pamoja ili muziki umfikie kila mtu.",
    "whoItServes": "Watoto na watu wazima wasioweza kupata ala au masomo.",
    "whatYoullNeed": "Ala zinazotolewa, walimu waliojitokeza, mahali, na utaratibu wa kuazima.",
    "setupHours": 15,
    "defaultCategory": "education",
    "firstSteps": "Anza na wanamuziki waliopo tayari karibu nawe — mpiga gitaa wa kanisa la mtaa, mwalimu wa bendi aliyestaafu, vijana wanaopiga — na uwaulize wangefurahia kufundisha nini na lini. Mazungumzo moja na duka la muziki kuhusu kupunguziwa matengenezo na mengine na mahali panapovumilia kelele, na unakuwa karibu umefika kwenye kikao chako cha kwanza cha kupiga pamoja.",
    "commonPitfalls": "Ala za kuazima huisha kimya kimya zinapotoka kwa kasi kuliko zinavyorudi zikiwa zinapigika, hivyo tenga muda wa matengenezo tangu mwanzo na weka utaratibu wa kurudisha wa kusamehe lakini wa kweli. Na angalia masomo yasielekee kwa waliojiamini tayari: mtoto ambaye hajawahi kugusa ala anahitaji ukaribisho wa joto zaidi, si nafasi fupi zaidi.",
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
        "name": "Kusanya na kutengeneza ala",
        "description": "Kusanya ala zinazotolewa na uzifanyie usafi, nyuzi mpya, au matengenezo hadi zipigike. Jenga mchanganyiko wa aina na viwango vya ujuzi.",
        "hours": 5,
        "skills": [
          "kutengeneza",
          "kuendesha gari"
        ]
      },
      {
        "name": "Anzisha utaratibu wa kuazima ala",
        "description": "Tengeneza utaratibu unaofuatilia nani ana nini, na maelekezo ya utunzaji na masharti ya kurudisha ya kusamehe. Weka namba na uandike kila ala.",
        "hours": 2,
        "skills": [
          "kuingiza data"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Tafuta walimu waliojitokeza",
        "description": "Tafuta wanamuziki walio tayari kufundisha waanzao kwa uvumilivu. Si lazima wawe wataalamu — shauku na ujuzi wa msingi vinatosha sana.",
        "hours": 3,
        "skills": [
          "kufikia watu",
          "muziki"
        ]
      },
      {
        "name": "Tafuta mahali pa masomo na vikao",
        "description": "Pata chumba ambapo kelele si tatizo — kituo cha jumuiya, shule, au ukumbi wa kanisa au msikiti. Weka nyakati zinazotabirika za masomo na kupiga huru.",
        "hours": 2,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Panga masomo na vikao vya kupiga pamoja",
        "description": "Toa masomo ya waanzao na vikao vya wazi kwa viwango vyote. Fanya kuandika jina kuwe rahisi na nyakati mbalimbali kwa wanaofanya kazi au walio shuleni.",
        "hours": 2,
        "recurringCadence": "session",
        "skills": [
          "kuratibu"
        ],
        "follows": [
          2,
          3
        ]
      },
      {
        "name": "Weka matarajio ya utunzaji na urudishaji",
        "description": "Wafundishe waazimaji utunzaji wa msingi wa ala na cha kufanya kitu kikivunjika. Ubaki wa kuaminiana na wa kusaidia, si wa kuadhibu.",
        "hours": 1,
        "skills": [
          "kuandika"
        ],
        "follows": [
          1
        ]
      }
    ]
  },
  {
    "id": "school-supply-program",
    "name": "Mpango wa vifaa vya shule na mabegi",
    "purpose": "Kutoa vifaa vya shule na mabegi bure ili watoto waanze mwaka wakiwa tayari na wenye kujiamini.",
    "whoItServes": "Familia za kipato kidogo zenye watoto wa umri wa kwenda shule.",
    "whatYoullNeed": "Vifaa vinavyotolewa au pesa, mahali pa kuhifadhia, mahali pa kukabidhia, na waliojitokeza.",
    "setupHours": 10,
    "defaultCategory": "mutual_aid_drive",
    "suggestsWorkDays": true,
    "firstSteps": "Mazungumzo yako ya kwanza ni na shule — mwalimu wa ushauri, kiungo cha familia, au mratibu wa wazazi anayejua orodha halisi za vifaa na familia zipi hukosa kimya kimya. Acha waamue unachokusanya na jinsi familia zinavyopata habari; ukabidhi unaopitia watu ambao wazazi tayari wanawaamini utawafikia watoto ambao kipeperushi hakitawafikia kamwe.",
    "commonPitfalls": "Kushindwa kunakotabirika ni mlima wa majalada yaliyotolewa bila hata daftari moja ambalo orodha zinaliomba kweli — kukusanya kilicho rahisi kutolewa badala ya kinachohitajika. Kinachouma ni ukabidhi unaohisiwa kama upimaji wa umaskini; ruka fomu za kipato, acha watoto wachague mabegi yao wenyewe, na hakuna anayeondoka akijihisi kachunguzwa.",
    "pairsWith": [
      "youth-mentorship",
      "toy-library"
    ],
    "tasks": [
      {
        "name": "Pata orodha za vifaa na upime mahitaji",
        "description": "Shirikiana na shule za karibu kujua orodha halisi za vifaa kwa kila darasa na kukadiria familia ngapi zinahitaji msaada. Hii huweka vinavyotolewa kuwa vya maana.",
        "hours": 1.5,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Endesha ukusanyaji na ununuzi wa jumla",
        "description": "Changanya ukusanyaji wa vinavyotolewa na ununuzi wa jumla kwa vitu vinavyohitajika zaidi. Kununua kwa jumla hufikisha pesa mbali zaidi kwenye vya msingi kama madaftari na penseli.",
        "hours": 3,
        "recurringCadence": "cycle",
        "skills": [
          "kufikia watu",
          "kuendesha gari"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Panga na fungasha kwa darasa",
        "description": "Panga vifaa na jaza mabegi kulingana na orodha ya kila darasa. Kipindi cha kufungasha kwa mfululizo na waliojitokeza huenda haraka.",
        "hours": 2,
        "skills": [
          "kuratibu"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Andaa hifadhi na mahali pa kukabidhia",
        "description": "Pata hifadhi kavu na mahali pa ukarimu pa kukabidhi mabegi, mara nyingi shuleni, kituo cha jumuiya, au sambamba na tukio jingine la kurudi shule.",
        "hours": 1.5,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Panga ratiba na watu wa kukabidhi",
        "description": "Fanya ukabidhi kabla shule haijafunguliwa, ukiwa na waliojitokeza wenye ukarimu. Acha watoto wachague begi inapowezekana — kuchagua kunaongeza heshima.",
        "hours": 2,
        "skills": [
          "kuratibu"
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
    "name": "Kliniki ya Msaada wa Kisheria & Mafunzo ya Jua Haki Zako",
    "purpose": "Unganisha majirani na msaada wa kisheria wa bure na uwafundishe watu haki zao.",
    "whoItServes": "Yeyote anayekabiliwa na tatizo la kisheria bila uwezo — masuala ya makazi, uhamiaji, madeni, familia, au stahili.",
    "whatYoullNeed": "Mawakili na wanafunzi wa sheria waliojitokeza, mahali pa kukutania, mashirika ya msaada wa kisheria ya kushirikiana nayo, na utaratibu wa miadi. Ushauri wa kisheria wa mtu binafsi lazima utoke kwa mawakili wenye sifa na leseni (au wanafunzi wa sheria wanaosimamiwa) — mradi huu unaandaa njia ya kuufikia msaada na kushirikisha taarifa za jumla za haki; wenyewe si chanzo cha ushauri wa kisheria.",
    "setupHours": 26,
    "defaultCategory": "other",
    "suggestsWorkDays": true,
    "firstSteps": "Hakuna kinachoanza kabla hujapata mawakili: simu zako za kwanza ni kwa ofisi ya msaada wa kisheria ya karibu, mpango wa pro bono wa chama cha mawakili, na kliniki ya chuo cha sheria — ukiuliza wangehitaji nini ili kufika, na mapengo yako wapi ambayo kliniki ya mtaa ingeweza kuyaziba kweli. Waache washirika hao wapange nawe mipaka ya kliniki kabla hujawajulisha majirani lolote.",
    "commonPitfalls": "Hatari kubwa ni aliyejitokeza mwenye moyo mzuri kuteleza kutoka taarifa hadi ushauri — “bora usaini tu” ya nia njema inaweza kuharibu kesi ya mtu, hivyo weka mstari huo wazi na uufanyie mazoezi. Hatari ya polepole ni mapokezi kuzidi mawakili: orodha ndefu ya watu wenye shida bila wakili chumbani huvunja imani haraka kuliko kutofungua kabisa.",
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
        "name": "Shirikiana na mawakili na msaada wa kisheria",
        "description": "Tafuta mawakili wenye leseni, au wanafunzi wa sheria wanaosimamiwa na mawakili, watoe ushauri wa kisheria wenyewe. Jenga uhusiano wa rufaa na mashirika ya msaada wa kisheria yaliyoimarika.",
        "hours": 6,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Weka mipaka na njia za rufaa",
        "description": "Amueni kliniki itashughulikia masuala gani na wekeni njia wazi za kupeleka kesi ngumu au za kitaalamu kwingine. Semeni waziwazi kliniki inaweza nini na haiwezi nini.",
        "hours": 3,
        "skills": [
          "kuandika"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Andaa mahali na mapokezi",
        "description": "Pata chumba cha faragha kisichovuja siri na tengeneza mapokezi yenye orodha ya nyaraka ili mawakili watumie vizuri muda wao mfupi.",
        "hours": 3,
        "skills": [
          "kuratibu"
        ]
      },
      {
        "name": "Jenga utaratibu wa miadi wa siri",
        "description": "Tengeneza miadi inayolinda faragha. Masuala ya kisheria ni nyeti, hivyo linda taarifa za watu kwa uangalifu kila hatua.",
        "hours": 3,
        "skills": [
          "kuratibu",
          "kuingiza data"
        ]
      },
      {
        "name": "Andaa mafunzo na machapisho ya jua haki zako",
        "description": "Tengeneza miongozo iliyo wazi na sahihi na uendeshe vipindi vya mafunzo kuhusu haki za kawaida (mpangaji, mfanyakazi, uhamiaji, kukutana na vyombo vya dola). Vieleze kama taarifa za jumla, si ushauri wa kisheria wa mtu binafsi.",
        "hours": 5,
        "recurringCadence": "event",
        "skills": [
          "kuandika",
          "kufundisha"
        ]
      },
      {
        "name": "Panga ratiba ya kliniki na usambaze habari",
        "description": "Wekeni tarehe za kliniki za kujirudia na sambazeni habari kupitia mashirika washirika na jumuiya nzima ya kusaidiana. Toeni ukalimani kwa wanaozungumza lugha nyingine.",
        "hours": 3,
        "skills": [
          "kufikia watu",
          "kutafsiri"
        ],
        "follows": [
          0,
          3
        ]
      },
      {
        "name": "Linda usiri na kagua mgongano wa maslahi",
        "description": "Wekeni usiri mkali na ukaguzi wa msingi wa mgongano wa maslahi ili aliyejitokeza yule yule asiwahi kushauri pande zinazopingana. Fundisheni kila mtu wajibu huu.",
        "hours": 3,
        "skills": [
          "makaratasi"
        ]
      }
    ]
  },
  {
    "id": "resource-hub-dispatch",
    "name": "Kitovu cha Kusaidiana & Kuelekeza Msaada",
    "purpose": "Kuwa uti wa mgongo wa uratibu — mahali pamoja ambapo mahitaji na msaada unaotolewa vinaunganishwa katika miradi yote ya jumuiya yenu.",
    "whoItServes": "Kila mtu katika jumuiya — wanajumuiya wanaotafuta msaada, waliojitokeza kuutoa, na viongozi wa miradi wanaohitaji uratibu.",
    "whatYoullNeed": "Utaratibu wa mapokezi, orodha ya waliojitokeza na vilivyopo, waratibu, na orodha kuu ya msaada. Kitovu hushika taarifa nyeti za maisha ya majirani — kusanyeni kinachohitajika tu, kilindeni kwa uangalifu, na maelezo washirikishwe tu wale wanaoyahitaji ili kusaidia.",
    "setupHours": 27,
    "defaultCategory": "organizing",
    "firstSteps": "Kitovu kinaratibu miradi, hivyo anza kwa kuketi na kiongozi wa kila mradi: wanapokea maombi gani ya msaada, wangependa kukabidhi nini, na wanataka kupokea vipi vilivyounganishwa. Kubalianeni pamoja mapokezi moja ya pamoja na msingi wa faragha — kitovu kinacholazimishwa juu ya miradi hupitwa pembeni; kilichojengwa pamoja nao kinakuwa mlango wa mbele.",
    "commonPitfalls": "Vitovu hufa kwa njia mbili: mapokezi kujaa mahitaji ambayo hakuna anayeyafuata mpaka mwisho, watu wakaambizana kuwa kupiga simu hakusaidii; au mratibu shujaa mmoja kushika kila uzi hadi anachoka kabisa na jumuiya kupoteza kumbukumbu yake. Fuatilieni kila ombi la msaada hadi mwisho wa kweli, pokezaneni zamu mapema, na kusanyeni taarifa chache kuliko mnavyofikiri mnahitaji.",
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
        "name": "Anzisha mapokezi moja ya mahitaji na msaada",
        "description": "Tengenezeni mlango mmoja rahisi wa mbele — namba ya simu, fomu, na njia ya ana kwa ana — mahali yeyote anaposema anachohitaji au anachoweza kutoa. Mlango mmoja wa kuingilia huzuia watu kupotea njiani.",
        "hours": 4,
        "skills": [
          "kuratibu",
          "msaada wa kiufundi"
        ]
      },
      {
        "name": "Jenga orodha ya waliojitokeza na vilivyopo",
        "description": "Tunza orodha ya sasa ya waliojitokeza (ujuzi, upatikanaji, mahali) na kila mradi unaweza kutoa nini, ili mahitaji yaunganishwe haraka.",
        "hours": 4,
        "skills": [
          "kuingiza data"
        ]
      },
      {
        "name": "Unda mchakato wa kuunganisha na kuelekeza",
        "description": "Wekeni jinsi ombi la msaada linavyofikishwa kwa mradi au aliyejitokeza sahihi na kwa kasi gani. Wekeni malengo ya muda wa kujibu na jinsi mahitaji yanavyofuatiliwa hadi mwisho.",
        "hours": 4,
        "skills": [
          "kuratibu"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Tunza orodha kuu ya msaada",
        "description": "Wekeni orodha hai ya miradi yenu yote pamoja na msaada wa nje (malazi, kliniki, chakula, msaada wa kisheria) ili kitovu kimwelekeze mtu kokote msaada ulipo.",
        "hours": 5,
        "recurringCadence": "month",
        "skills": [
          "kuingiza data"
        ]
      },
      {
        "name": "Tafuta na ufundishe waratibu",
        "description": "Jengeni timu ya kushika zamu za kuelekeza kwa kupokezana ili kitovu kibaki hai bila kumchosha yeyote. Wafundisheni mchakato na orodha kuu.",
        "hours": 3,
        "skills": [
          "kufikia watu",
          "kufundisha"
        ],
        "follows": [
          2,
          3
        ]
      },
      {
        "name": "Weka faragha ya taarifa na ufuatiliaji",
        "description": "Amueni mnakusanya taarifa gani, zinahifadhiwa na kulindwa vipi, na mnathibitishaje kwamba hitaji lilitimizwa kweli. Kusanyeni kiwango cha chini na kilindeni kwa uangalifu.",
        "hours": 4,
        "skills": [
          "kuandika"
        ]
      },
      {
        "name": "Fuatilia mahitaji yasiyotimizwa na mapengo",
        "description": "Andikeni maombi ya msaada msiyoweza kuyatimiza. Mapengo yanayojirudia huonyesha jumuiya ianzishe wapi mradi wake ujao — kitovu kinakuwa chombo cha kupanga, si cha kupokea na kupitisha tu.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "kuingiza data"
        ]
      }
    ]
  },
  {
    "id": "harm-reduction-supplies",
    "name": "Ugawaji wa Vifaa vya Kupunguza Madhara",
    "purpose": "Fikisha naloxone, vijiti vya kupima, na vifaa vya matumizi salama mikononi mwa wanaoweza kuvihitaji — ukiwakuta majirani walipo, bila hukumu yoyote.",
    "whoItServes": "Watu wanaotumia dawa za kulevya, rafiki na familia zao, na yeyote anayeweza kumkuta mtu aliyezidiwa na dawa — ambaye, katika mitaa mingi, ni yeyote yule.",
    "whatYoullNeed": "Mafunzo ya kumsaidia aliyezidiwa na dawa, chanzo cha naloxone (mpango wa serikali, duka la dawa, au shirika mshirika), vifaa vya kits, na kikundi kidogo cha ugawaji. Kugawa vifaa si matibabu — kila anayegawa lazima amalize kwanza mafunzo ya kumsaidia aliyezidiwa, na sheria ya unachoruhusiwa kubeba (vijiti vya kupima, sindano) hutofautiana sana kati ya mahali na mahali, hivyo hakikisheni ya kwenu kabla hamjanunua chochote. Wekeni namba za dharura na za matibabu za karibu zikiwa zimechapwa ndani ya kila kit.",
    "setupHours": 20,
    "defaultCategory": "other",
    "suggestsWorkDays": true,
    "firstSteps": "Msinunue chochote bado: hatua ya kwanza ni mazungumzo na mradi wa kupunguza madhara ulioimarika wa karibu na watu wanaotumia vifaa hivi kweli — watawaambia kinachohitajika, kilichokwisha shughulikiwa, na jinsi ya kufika bila hukumu. Pitisheni kikundi chenu cha msingi kwenye mafunzo ya kumsaidia aliyezidiwa na dawa na hakikisheni sheria ya kwenu kuhusu vijiti vya kupima na sindano kabla kit hata moja haijafungwa.",
    "commonPitfalls": "Hii huharibika mnapofika kama wageni — kugawa mahali msipo na uhusiano, au kuambatanisha mihadhara na masharti yanayowafundisha watu kuwakwepa — na mnapoitangulia sheria au mafunzo yenu, jambo linaloweza kumletea aliyejitokeza shitaka la kubeba vifaa vya dawa za kulevya. Polepole na kwa ushirikiano hushinda haraka na peke yenu hapa, kila mara.",
    "pairsWith": [
      "community-first-aid-training",
      "mental-health-peer-support"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Pata mafunzo na mshirika wa kupunguza madhara",
        "description": "Kikundi chenu cha msingi kimalize mafunzo ya naloxone na ya kumsaidia aliyezidiwa na dawa — idara nyingi za afya na mashirika ya kupunguza madhara huyaendesha bure. Shirikianeni na mradi ulioimarika; wamekwisha tatua matatizo ya upatikanaji, sheria, na imani msiyohitaji kuyatatua upya.",
        "hours": 4,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Kagua sheria ya hapa kuhusu vifaa",
        "description": "Upatikanaji wa naloxone unalindwa karibu kila mahali, lakini vijiti vya kupima na sindano bado huhesabiwa kama vifaa vya dawa za kulevya baadhi ya maeneo. Jueni hasa mnachoruhusiwa kisheria kubeba na kugawa — shirika mshirika au kliniki ya msaada wa kisheria itawaambia haraka. Kiandikeni kwa ajili ya waliojitokeza.",
        "hours": 3,
        "skills": [
          "utafiti"
        ]
      },
      {
        "name": "Pata naloxone na vifaa vya kit",
        "description": "Agizeni naloxone kupitia mpango wa serikali wa ugawaji, makubaliano ya kudumu na duka la dawa, au shirika mshirika. Ongezeni kingine chochote kilicho halali kwenu: vijiti vya kupima fentanyl na xylazine, vifaa vya kutibu vidonda, vitu vya usafi.",
        "hours": 4,
        "follows": [
          1
        ],
        "skills": []
      },
      {
        "name": "Funga kits zenye maelekezo ya lugha rahisi",
        "description": "Fungeni kits zenye maelekezo rahisi ya lugha nyingi: jinsi ya kumtambua aliyezidiwa, jinsi ya kutoa naloxone, piga namba za dharura, usitumie peke yako kamwe. Wekeni namba za dharura na za matibabu za karibu ndani ya kila kit. Ufungaji huenda haraka meza ikijaa watu.",
        "hours": 3,
        "skills": [
          "kutafsiri"
        ],
        "follows": [
          2
        ],
        "recurringCadence": "cycle"
      },
      {
        "name": "Panga mizunguko na sehemu maalum za ugawaji",
        "description": "Pangeni mizunguko ya kawaida ya kutembea au kuendesha gari kupitia sehemu watu walipo kweli, na ombeni baa, maduka ya mtaani, maktaba, na kumbi kuweka sanduku lisilo na maswali. Kizingiti cha chini ndiyo maana yote — bila fomu, bila mihadhara.",
        "hours": 4,
        "skills": [
          "kufikia watu",
          "kuendesha gari"
        ]
      },
      {
        "name": "Jaza upya, fuatilia, na uhuishe mafunzo",
        "description": "Angalieni kinachokwisha na kinachokaa, andikeni tarehe za mwisho za naloxone, na fanyeni mafunzo ya kurudia wanapojiunga waliojitokeza wapya. Kit ikimrudisha mtu aliyezidiwa, hilo linastahili kuandikwa (kwa upole).",
        "hours": 2,
        "recurringCadence": "month",
        "skills": []
      }
    ]
  },
  {
    "id": "court-support",
    "name": "Msaada Mahakamani & Kusindikizana",
    "purpose": "Hakikisha hakuna jirani anayekabili siku ya mahakama peke yake — kuwepo pamoja naye chumba cha mahakama, usafiri wa kwenda, watoto kutunzwa wakati wa usikilizwaji, na barua za msaada utetezi unapoziomba.",
    "whoItServes": "Majirani wenye tarehe za mahakama za jinai, uhamiaji, kufukuzwa nyumba, au familia, na familia zao — kwenda mahakamani peke yako kunaweza kumpotezea mtu kazi, matunzo ya watoto, na matumaini.",
    "whatYoullNeed": "Waliojitokeza wa kuaminika, kalenda ya usikilizwaji, na uhusiano na mawakili wa utetezi wa umma. Msaada wa mahakamani ni kuwepo na usafiri, si ushauri wa kisheria — waliojitokeza kamwe hawashauri kuhusu kesi na daima hufuata uongozi wa wakili wa mhusika mwenyewe. Vyumba vya mahakama vina kanuni kali za mwenendo, hivyo kila anayehudhuria lazima azijue vizuri kabisa.",
    "setupHours": 16,
    "defaultCategory": "other",
    "firstSteps": "Anzeni na watu ambao tarehe hizi ni zao: msaada hutokea tu kwa mwaliko wa anayekabili mahakama, na kwa hatua moja na wakili wake. Jitambulisheni kwanza kwa ofisi ya mawakili wa utetezi wa umma na vikundi vya kufuatilia mahakama au vya mfuko wa dhamana vilivyopo tayari mahakamani, waache wawaambie usikilizwaji upi unahitaji kusindikizwa na jinsi ya kufaa bila kuugusa kamwe upande wa kisheria.",
    "commonPitfalls": "Madhara hapa hutoka kwa kujiamulia mwenyewe: aliyejitokeza “akielezea” namna ya kujibu mashtaka ukandani, maelezo ya kesi kuzungumzwa mahali mwendesha mashtaka anaweza kusikia, hisia za waziwazi za watazamaji zinazomkasirisha hakimu — lolote kati yake linaweza kumuumiza yule yule mliyemjia. Kushindwa kwa kimya zaidi ni usafiri: tarehe ya mahakama isiyothibitishwa au usafiri unaoanguka unaweza kumaanisha kukosa usikilizwaji na hati ya kukamatwa.",
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
        "name": "Jitambulishe kwa watetezi na vikundi vya mahakama",
        "description": "Jitambulisheni kwa ofisi ya mawakili wa utetezi wa umma, msaada wa kisheria wa uhamiaji, na vikundi vya kufuatilia mahakama au vya mfuko wa dhamana vinavyofanya kazi tayari. Watawaambia msaada unahitajika wapi zaidi na jinsi ya kuingia bila kuwaingilia.",
        "hours": 3,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Andika kanuni za msingi: msaada, si sheria",
        "description": "Wekeni kwa maandishi: waliojitokeza kamwe hawatoi ushauri wa kisheria, kamwe hawajadili maelezo ya kesi sehemu za wazi za mahakama, na daima wanamwachia wakili wa mhusika mwenyewe. Ongezeni mwenendo wa chumba cha mahakama — fika mapema, vaa kwa kawaida, simu zimezimwa, hakuna hisia kutoka upande wa watazamaji.",
        "hours": 2,
        "skills": [
          "kuandika"
        ]
      },
      {
        "name": "Jenga mapokezi na kalenda ya usikilizwaji",
        "description": "Tengenezeni njia rahisi ya watu kuomba msaada na kalenda ya pamoja ya tarehe, vyumba vya mahakama, na kila mtu anahitaji nini — kusindikizwa, usafiri, watoto kutunzwa, au vyote vitatu. Tarehe za mahakama huhama kila mara, hivyo thibitisheni siku moja kabla.",
        "hours": 3,
        "skills": [
          "kuratibu"
        ]
      },
      {
        "name": "Fundisha waliojitokeza kusindikiza",
        "description": "Wapitisheni waliojitokeza kwenye ziara ya mahakama: ukaguzi wa usalama, kutafuta chumba, pa kuketi, na jinsi ya kuwa tu mwenzi tulivu na mwenye joto katika kusubiri kwa mfadhaiko. Oanisheni kila mpya na mzoefu kwa tarehe yake ya kwanza.",
        "hours": 3,
        "skills": [
          "kufundisha"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Ratibu usafiri na utunzaji wa watoto",
        "description": "Pangeni madereva kwa asubuhi za mahakama na jozi za kutunza watoto wakati wa usikilizwaji — vyumba vingi vya mahakama haviruhusu watoto, na usikilizwaji uliokoswa kwa sababu ya mtoto unaweza kumaanisha hati ya kukamatwa.",
        "hours": 3,
        "skills": [
          "kuendesha gari",
          "kulea watoto"
        ],
        "recurringCadence": "event"
      },
      {
        "name": "Panga barua za msaada utetezi ukiomba",
        "description": "Wakili wa mtu anapoomba barua za tabia njema au za msaada wa jumuiya, ratibuni majirani waziandike — mkifuata maelekezo ya wakili kuhusu maudhui, sauti, na muda wa mwisho bila kupotoka.",
        "hours": 2,
        "skills": [
          "kuandika"
        ]
      }
    ]
  },
  {
    "id": "cooling-warming-center",
    "name": "Kituo cha Muda cha Kupoa & Kuota Moto",
    "purpose": "Fungua pa kujikinga na hali ya hewa pa mtaa — chumba cha ubaridi wakati wa joto kali, chenye joto wakati wa baridi kali — kilicho tayari kabla hali ya hewa haijawa hatari, si baada yake.",
    "whoItServes": "Wazee, majirani wasio na makazi, watu wasio na kiyoyozi au joto la ndani linalofanya kazi, wanaofanya kazi nje, na yeyote ambaye nyumba yake haiwezi kuhimili hali ya hewa.",
    "whatYoullNeed": "Mahali pa mwenyeji penye kiyoyozi na vyoo, vifaa, na wenyeji waliofundishwa wakiwa kwenye zamu. Wenyeji ni majirani, si matabibu — fundisheni kila mtu kutambua kuzidiwa na joto na kuzidiwa na baridi mwilini na kupiga namba za dharura mapema badala ya kuchelewa, na malizeni suala la bima na uwajibikaji la mahali pa mwenyeji kabla ya ufunguzi wa kwanza, si wakati wake.",
    "setupHours": 21,
    "defaultCategory": "other",
    "suggestsWorkDays": true,
    "firstSteps": "Mahali pa mwenyeji ndiyo uhusiano ambao kila kitu kinausimamia, hivyo anzeni hapo: keti na mtunza maktaba, mchungaji, au mwangalizi wa ukumbi na pitieni pamoja maswali yasiyopendeza — saa, funguo, bima, nini kitatokea mtu akihitaji kulala — kabla utabiri wa kwanza haujawalazimisha. Wakati huo huo, ulizeni wanaowafikia watu mitaani na wafanyakazi wa majengo ya wazee nani anahitaji pa kujikinga kweli, ili mahali na saa vilingane na watu inaowahusu.",
    "commonPitfalls": "Mradi huu hushindwa katika pengo kati ya mipango na hali ya hewa: kigezo ambacho hakuna aliyekikubali sawasawa, kituo kikafunguliwa siku moja baadaye, au swali la uwajibikaji lililoachwa gizani hadi mtu aanguke na mwenyeji akajitoa kabisa. Wekeni kigezo cha ufunguzi kwa maandishi, fanyeni ufunguzi mmoja wa mazoezi kabla ya msimu, na hakikisheni kila mwenyeji anajua kupiga namba za dharura mapema, si mwishoni.",
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
        "name": "Tafuta mahali penye kiyoyozi na joto",
        "description": "Ulizeni maktaba, nyumba za ibada, kumbi za vyama vya wafanyakazi, na vituo vya jumuiya chumba chenye kiyoyozi na joto la uhakika, vyoo, na mlango usio na ngazi. Pateni idhini ya maandishi inayotaja saa, nani anashika funguo, na nini kitatokea kikihitajika usiku kucha.",
        "hours": 4,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Weka vigezo vya kufungua na mpango wa tahadhari",
        "description": "Amueni mapema hasa kinachofungua kituo — kiwango cha joto cha utabiri, joto la kuhisi, ukali wa baridi na upepo — ili mtu asilazimike kuamua usiku wa manane. Wekeni mnyororo wa simu au kikundi cha ujumbe kinachowaweka wenyeji tayari siku moja kabla.",
        "hours": 2,
        "skills": []
      },
      {
        "name": "Kusanya vifaa",
        "description": "Kusanyeni maji, pakiti za ORS, mablanketi, vitanda vya kukunja au viti vizuri, feni, chaja za simu, na sanduku la msaada wa kwanza. Hifadhini vyote pale pale kwenye masanduku yenye lebo ili mwenyeji yeyote apate vitu.",
        "hours": 3,
        "skills": [
          "kuendesha gari"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Tafuta na ufundishe wenyeji wa zamu",
        "description": "Pateni waliojitokeza wa kutosha wawili kwa kila zamu na wafundisheni: kupokea watu bila makaratasi, kutambua kuzidiwa na joto na kuzidiwa na baridi mwilini, wakati wa kupiga namba za dharura, na misingi ya kutuliza hali. Ukarimu wa kibinadamu una uzito sawa na kipimo cha joto.",
        "hours": 4,
        "skills": [
          "kufundisha"
        ]
      },
      {
        "name": "Panga zamu",
        "description": "Andaeni ratiba ya zamu mnayoweza kuiwasha kwa taarifa ya siku moja — wafunguzi, wafungaji, na usiku kucha kama mnautoa. Wekeni orodha ya akiba, kwa sababu joto kali huwaangusha na waliojitokeza pia.",
        "hours": 2,
        "skills": [
          "kuratibu"
        ],
        "follows": [
          3
        ],
        "recurringCadence": "event"
      },
      {
        "name": "Sambaza habari kabla ya msimu",
        "description": "Tengenezeni vipeperushi vya lugha nyingi vyenye vigezo na mahali, na vifikisheni kliniki, majengo ya wazee, wanaowafikia watu mitaani, na maduka ya mtaani kabla ya joto kali au baridi kali ya kwanza — si wakati wake.",
        "hours": 3,
        "skills": [
          "kubuni michoro",
          "kutafsiri"
        ]
      },
      {
        "name": "Fungua, karibisha, na urejeshe kila mara",
        "description": "Endesheni kituo kwa muda wote wa tukio la hali ya hewa: pokeeni watu kwa wepesi (hesabu, si vitambulisho), vifaa viendelee kupatikana, na mwangalieni yeyote anayelala. Baadaye, safisheni, jazeni upya, na andikeni kilichopungua.",
        "hours": 3,
        "recurringCadence": "event",
        "skills": []
      }
    ]
  },
  {
    "id": "community-oral-history",
    "name": "Mradi wa Historia Simulizi ya Jumuiya",
    "purpose": "Rekodi hadithi za wazee na majirani kabla hazijapotea — na waache wasimulizi waendelee kuamua zitakavyotumika.",
    "whoItServes": "Wazee wenye hadithi ambazo hakuna aliyewahi kuomba kuzisikia, majirani wa miaka mingi wanaoona mtaa ukibadilika, na kila jirani ajaye baadaye.",
    "whatYoullNeed": "Simu au kinasa sauti rahisi, mahali tulivu, fomu za ridhaa, na mahali salama pa kuhifadhi faili. Rekodi ni taarifa binafsi — kila mshiriki anamiliki hadithi yake, anaamua inashirikishwa wapi, na anaweza kubadili nia baadaye. Hakuna kinachotoka hadharani bila idhini yake ya maandishi.",
    "setupHours": 10,
    "defaultCategory": "education",
    "firstSteps": "Anza na mzee mmoja anayekuamini na uulize kama angeshiriki hadithi — rekodi ile ya kwanza inakufundisha kuliko mpango wowote, na neno lake linakudhamini kwa msimulizi ajaye. Kabla ya kubonyeza kurekodi na yeyote, pitieni fomu ya ridhaa pamoja na umuulize angependa nini kiifanyike rekodi; mazungumzo hayo ndiyo mradi wenyewe.",
    "commonPitfalls": "Namna hii inavyomuumiza mtu ni hadithi kusafiri mbali kuliko msimulizi alivyokubali — rekodi kuwekwa mtandaoni, jina kuambatanishwa, jambo lililokusudiwa wewe peke yako. Namna inavyokufa kimya ni rekodi kulundikana bila lebo kwenye simu ya mtu mmoja hadi kifaa kilichopotea kifute miaka ya sauti; wekea lebo na nakala rudufu kila kikao wiki ile ile inayotokea.",
    "pairsWith": [
      "neighborhood-care-network",
      "digital-literacy"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Andika fomu ya ridhaa ya lugha rahisi",
        "description": "Ukurasa mmoja, bila lugha ya kisheria: kinachorekodiwa, inaweza kushirikishwa wapi, na haki ya mshiriki kusimama, kuruka maswali, au kuiondoa rekodi baadaye. Itafsiri katika lugha ambazo wasimulizi wenu wanazungumza kweli.",
        "hours": 2,
        "skills": [
          "kuandika",
          "kutafsiri"
        ]
      },
      {
        "name": "Kusanya vifaa na orodha ya maswali",
        "description": "Simu yenye programu ya kurekodi sauti inatosha; ongeza kipaza sauti kidogo cha kubandika shatini kama unaweza. Andaa maswali ya wazi yanayoalika hadithi — “nieleze kuhusu barabara hii ulipofika” — na fanyeni mazoezi ninyi kwa ninyi mara moja.",
        "hours": 2,
        "skills": []
      },
      {
        "name": "Rekodi vikao vya hadithi",
        "description": "Keti na msimulizi mmoja kwa wakati mahali tulivu na pa starehe. Pitieni fomu ya ridhaa pamoja kwanza, kisha sikiliza zaidi — mahojiano bora ni yale unayoongea kidogo zaidi.",
        "hours": 4,
        "skills": [
          "kusikiliza"
        ],
        "follows": [
          0,
          1
        ],
        "recurringCadence": "session"
      },
      {
        "name": "Hifadhi na urudishe, kwa masharti yao",
        "description": "Wekea kila rekodi lebo ya tarehe, majina, na kilichokubaliwa kuhusu kushirikisha. Weka nakala mbili mahali salama, mpe kila msimulizi nakala yake mwenyewe, na weka hadharani tu sehemu alizozikubali kila mtu.",
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
    "name": "Ushirika wa Sola & Nishati wa Jumuiya",
    "purpose": "Unganisheni nguvu za majirani kuwa nishati safi ya pamoja inayoshusha bili za wote — hasa kwa wapangaji na kaya ambazo kamwe zisingeweza kuweka paneli juu ya paa lao wenyewe.",
    "whoItServes": "Wapangaji, kaya za kipato kidogo, na yeyote aliyefungiwa nje ya sola ya paa na paa lake, mwenye nyumba wake, au uwezo wake.",
    "whatYoullNeed": "Wanajumuiya waliojituma, maarifa ya kiufundi na ya kifedha mnayoweza kuazima au kujifunza, mahali pa mwenyeji au mpango wa sola ya pamoja uliopo wa kujiunga nao, na mashirika ya kushirikiana nayo. Jambo moja liseme wazi: vyama vya ushirika vya nishati vina ugumu halisi wa kifedha na kisheria — pateni ushauri wa wataalamu wenye sifa kuhusu muundo, fedha, na mikataba kabla yeyote hajasaini chochote.",
    "setupHours": 27,
    "defaultCategory": "infrastructure",
    "firstSteps": "Kabla ya paneli wala makaratasi yoyote, ongeeni na makundi mawili: majirani ambao wangejiunga kweli, kupima nia halisi, na ushirika wa sola wa mji jirani uliokwisha fanya hivyo — watawaambia muundo upi unafaa kanuni za eneo lenu na makosa gani yaliwapotezea fedha. Kisha zisomeni kanuni hizo wenyewe, kwa sababu ni zenyewe, si shauku yenu, zinazoamua kinachowezekana.",
    "commonPitfalls": "Vyama vya ushirika vya sola hufa katika pengo kati ya shauku na sahihi: mwaka mzima wa vikao kuhusu muundo ambao kanuni za kwenu haziruhusu kamwe, au mkataba uliosainiwa bila kupitiwa na wataalamu unaowafunga wanachama kwenye masharti asiyoyaelewa yeyote. Muuaji mwingine ni fedha zisizo wazi — wanachama wasipoona wazi walichotoa na kinachorudi, imani inamomonyoka na ushirika unasambaratika.",
    "pairsWith": [
      "weatherization-brigade",
      "bulk-buying-coop"
    ],
    "tasks": [
      {
        "name": "Kusanya wanajumuiya na upime nia",
        "description": "Tafuteni kaya zenye hamu ya nishati safi inayopunguza bili na jueni zimejituma kwa kiasi gani kweli — shauku ya jumla na mwanajumuiya aliyejiunga rasmi ni vitu viwili tofauti. Idadi yenu inaamua miundo ipi inawezekana, hivyo hesabuni kwa uaminifu kabla ya kupanga.",
        "hours": 4,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Jifunze miundo na kanuni za eneo",
        "description": "Fanyeni utafiti wa jinsi sola ya pamoja inavyofanya kazi mnapoishi: sheria za nchi, net metering, mipango ya kujiunga, miundo ya ushirika. Kanuni hutofautiana mno kati ya mahali na mahali na ndizo zinazoamua kinachowezekana kweli — fanyeni hivi kabla ya kupendezwa mno na muundo mmoja.",
        "hours": 5,
        "skills": [
          "utafiti"
        ]
      },
      {
        "name": "Tafuta mahali au mpango wa kujiunga",
        "description": "Tafuteni paa la mwenyeji au eneo la ardhi kwa paneli za pamoja, au kagueni kama mpango wa sola ya pamoja uliopo utapokea kikundi chenu kama waliojiunga kwa pamoja — kujiunga na uliopo mara nyingi ni haraka sana kuliko kujenga. Pimeni njia zote mbili na wanajumuiya kabla ya kuamua.",
        "hours": 4,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Panga fedha na muundo wa kisheria",
        "description": "Amueni mradi unavyopata fedha na kuongozwa vipi, na uandikisheni ushirika ipasavyo. Hii ndiyo hatua yenye athari halisi za kisheria na kifedha — leteni wataalamu wenye sifa wapitie muundo na kila mkataba, na msisaini mpaka wamemaliza.",
        "hours": 5,
        "skills": [
          "makaratasi",
          "uhasibu"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Shirikiana na wafungaji na watoa nishati",
        "description": "Pangeni wafungaji au watoa nishati wenye sifa njema, linganisheni zabuni zaidi ya moja, na thibitisheni waranti na matengenezo ya muda mrefu kwa maandishi. Ufungaji wa bei rahisi usio na mpango wa matengenezo unakuwa ghali baada ya miaka mitano.",
        "hours": 3,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Anzisha mfumo wa unafuu wa bili na uanachama",
        "description": "Wekeni sawasawa jinsi unafuu au makato ya bili yanavyowafikia wanachama na jinsi ya kujiunga na kutoa fedha. Ufanyeni wazi na rahisi kueleweka — mwanachama aweze kuona, kwenye ukurasa mmoja, alichotoa na kinachorudi.",
        "hours": 3,
        "skills": [
          "uhasibu",
          "kuingiza data"
        ],
        "follows": [
          3
        ]
      },
      {
        "name": "Elimisha wanajumuiya matumizi ya umeme",
        "description": "Wasaidieni wanajumuiya kusoma bili zao na kupunguza matumizi — kilowati iliyookolewa hushinda kilowati iliyozalishwa. Ambatanisheni unafuu wa sola na vidokezo rahisi vya kubana matumizi ili kaya zione tofauti kwenye karatasi.",
        "hours": 3,
        "skills": [
          "kufundisha"
        ]
      }
    ]
  },
  {
    "id": "worker-coop-incubator",
    "name": "Kitalu cha Ushirika wa Wafanyakazi & Ujuzi wa Kazi",
    "purpose": "Saidia majirani kujenga ujuzi wa kazi na kuanzisha vyama vya ushirika vinavyomilikiwa na wafanyakazi — riziki ambazo wanaofanya kazi ndio wanaomiliki mahali pa kazi na kufanya maamuzi.",
    "whoItServes": "Majirani wasio na ajira au wenye ajira pungufu, na yeyote anayetaka sauti na umiliki wa kweli mahali anapofanya kazi.",
    "whatYoullNeed": "Washauri wenye uzoefu wa biashara na ushirika, mahali na vifaa vya mafunzo, njia za kuanzia mnazoweza kuzielekezea biashara changa, na ushirikiano — wataalamu wa kuendeleza ushirika, watoa mikopo ya biashara wanaojua ushirika, na mradi wenu wenyewe wa kubadilishana ujuzi.",
    "setupHours": 27,
    "defaultCategory": "education",
    "firstSteps": "Anzeni na mazungumzo, si mtaala: keti na wanajumuiya wenye nia kuhusu wanachoweza na wanachotaka kujenga, na tafuteni makundi ya ujuzi yanayoweza kweli kuwa biashara. Wakati huo huo, tafuteni mtaalamu wa kuendeleza ushirika wa eneo lenu au ushirika wa wafanyakazi uliopo ulio tayari kushauri — makovu yao ndiyo somo lenu, na kuunda bila mwongozo huo ndiko makundi yanapoumia.",
    "commonPitfalls": "Hii hushindwa kwa njia mbili: kama mafunzo yasiyozalisha chochote, kwa sababu hakuna aliyesukuma kundi la ujuzi kuwa biashara halisi — au kama uzinduzi unaoruka sehemu za kuchosha, kuandikisha kwa kigezo cha kupakuliwa mtandaoni na kugundua vurugu ya uongozi na kodi miaka miwili baadaye. Pia hufa kimya wakati mratibu mmoja anaposhika kila uhusiano wa washauri na watoa ruzuku; gawaneni mawasiliano hayo tangu siku ya kwanza.",
    "pairsWith": [
      "skill-share",
      "solidarity-fund",
      "time-bank"
    ],
    "tasks": [
      {
        "name": "Pima ujuzi na malengo ya wanajumuiya",
        "description": "Keti na wanajumuiya ujue wanachoweza na wanachotaka kujenga. Unatafuta makundi — watatu wanaojua kupika, kikosi chenye ujuzi wa mafundi, watano wanaosafisha — kwa sababu kundi la ujuzi ndilo mbegu ya biashara ya ushirika yenye uhai.",
        "hours": 4,
        "skills": [
          "mahojiano"
        ]
      },
      {
        "name": "Toa mafunzo ya ajira na ujuzi",
        "description": "Endesheni vipindi vya CV, usaili wa kazi, ufundi, ujuzi wa kidijitali, na kusimamia fedha. Tumieni mradi wenu wa kubadilishana ujuzi na leteni wataalamu wa nje kwa kile ambacho hakuna wa hapa anayeweza kufundisha — lengo ni wanajumuiya wenye uwezo, ushirika ukiundwa au usipoundwa.",
        "hours": 5,
        "skills": [
          "kufundisha"
        ]
      },
      {
        "name": "Fundisha muundo wa ushirika",
        "description": "Wapitisheni wanajumuiya kwenye umiliki wa wafanyakazi na uongozi wa kidemokrasia: faida inavyogawanywa, maamuzi yanavyofanywa, na yote yanavyotofautiana na biashara ya kawaida. Watu hawawezi kuchagua muundo ambao hawajauona — tumieni vyama vya ushirika halisi kama mifano.",
        "hours": 4,
        "skills": [
          "kufundisha",
          "kuongoza mazungumzo"
        ]
      },
      {
        "name": "Saidia uundaji wa ushirika",
        "description": "Kundi likiwa tayari, lisaidieni kuandika mpango wa biashara na kuchagua muundo wa kisheria. Waunganisheni na mawakili na wahasibu wanaojua vyama vya ushirika badala ya kubuni hatua za kisheria na za hesabu — kuandikisha vibaya ni ghali kuvunja.",
        "hours": 5,
        "skills": [
          "makaratasi"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Unganisha na njia za kuanzia",
        "description": "Jengeni orodha hai ya mikopo midogo ya biashara, ruzuku, mifuko ya kuendeleza ushirika, na vitalu vya biashara, na saidieni biashara changa kuomba kweli. Fedha nyingi za ushirika zipo ila hazijaonyeshwa njia — ramani yenu ina thamani halisi.",
        "hours": 3,
        "skills": [
          "utafiti"
        ]
      },
      {
        "name": "Toa ushauri wa karibu",
        "description": "Oanisheni kila biashara changa na mwanaushirika mzoefu au mshauri wa biashara anayefuatilia hatua za mwanzo tete. Mwaka wa kwanza ndiko vyama vya ushirika vinapoanguka; mshauri thabiti aliyewahi kuuona mchezo huu hubadilisha uwezekano.",
        "hours": 3,
        "skills": []
      },
      {
        "name": "Jenga kusaidiana kati ya biashara changa",
        "description": "Zileteni biashara changa pamoja kwenye mtandao ambapo vyama vya ushirika vinashirikishana masomo, vinaelekezeana wanunuzi, na vinanunuliana. Vyama vya ushirika vinavyofanya biashara vyenyewe kwa vyenyewe huvuka misukosuko inayoua vilivyo peke yake.",
        "hours": 3,
        "skills": [
          "kuratibu"
        ]
      }
    ]
  },
  {
    "id": "elder-meal-delivery",
    "name": "Kuwatembelea wazee na kuwapelekea milo",
    "purpose": "Fikisha milo ya mara kwa mara na matembezi ya kirafiki kwa wazee wasioweza kutoka nyumbani — chakula kina umuhimu wake, na zile dakika kumi za mazungumzo mlangoni mara nyingi zina umuhimu zaidi.",
    "whoItServes": "Majirani wazee walio peke yao, wasioweza kutoka nyumbani, au dhaifu — na familia zinazowahangaikia kutoka mbali.",
    "whatYoullNeed": "Watu wa kutegemewa waliojitokeza na uliowachunguza, chanzo cha milo, njia zilizopangwa, na taratibu rahisi za usalama kwa wakati ule mlango usipofunguliwa.",
    "setupHours": 22,
    "defaultCategory": "food",
    "firstSteps": "Anza na chanzo cha milo na wazee watano wa kwanza, si karatasi ya kuandika majina: ongea na timu ya chakula cha pamoja au wapishi wawili watatu walio tayari kuhusu wanachoweza kuandaa kwa uhakika, kisha waulize maafisa ustawi wa jamii wanaoshughulikia wazee, wauguzi wa nyumba za ibada, na wafamasia nani hasa anakosa chakula. Wachunguze waliojitokeza wa kwanza kabla ya upelekaji wa kwanza, si baadaye — kuaminiana unakokujenga kunaishi au kufa kutegemea nani anayeingia kupitia milango ile.",
    "commonPitfalls": "Kushindwa kwa hatari ni ishara iliyopuuzwa — aliyejitokeza anayepuuza mlango usiofunguliwa kwa sababu hakuna aliyeandika cha kufanya, au mzio ambao haukufika kamwe kwenye karatasi ya njia. Kushindwa kwa polepole ni kutokutegemewa: wazee hupanga siku yao kuzunguka matembezi hayo, na njia inayoruka wiki nzima inawafundisha wasikutegemee. Afadhali wazee watano wanaofikiwa kila wiki bila kukosa kuliko ishirini wanaofikiwa mara chache.",
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
        "name": "Tambua wazee wasioweza kutoka nyumbani",
        "description": "Watafute wazee kupitia zahanati na kliniki, maafisa ustawi wa jamii, nyumba za ibada, na kwa kuulizana. Fanya kwa heshima na kwa ridhaa yao tu — unatoa mlo na urafiki, si kumwandika mtu kwenye ufuatiliaji.",
        "hours": 3,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Tafuta na uchunguze waliojitokeza",
        "description": "Yeyote anayeingia nyumbani kwa mzee huchunguzwa kwanza: wadhamini na ukaguzi wa msingi, bila kumwachia hata rafiki wa rafiki. Kisha lenga uthabiti — wazee hufarijika zaidi na uso ule ule wanaoufahamu mlangoni kila wiki kuliko watu wanaobadilishana.",
        "hours": 4,
        "skills": [
          "kuratibu"
        ]
      },
      {
        "name": "Panga chanzo cha milo",
        "description": "Panga milo kutoka jiko la pamoja la jumuiya, wapishi wa nyumbani walio tayari, au migahawa inayotoa milo bure. Zingatia lishe na urahisi wa kupasha moto, na andika kwenye kila chombo kilichomo ndani — mlo usio na lebo ni bahati nasibu kwa mwenye mzio.",
        "hours": 4,
        "skills": [
          "kupika",
          "usalama wa chakula"
        ]
      },
      {
        "name": "Panga njia na ratiba ya upelekaji",
        "description": "Waweke wazee kwenye makundi ya njia fupi zenye mpangilio, na weka ratiba ya kutegemewa — siku zile zile, na muda unaokaribiana kila wiki. Ingiza dakika chache za mazungumzo yasiyo na haraka kwenye kila kituo; kwa wazee wengi, hiyo ndiyo sehemu halisi ya upelekaji.",
        "hours": 3,
        "skills": [
          "kuendesha gari",
          "kuratibu"
        ],
        "follows": [
          0,
          2
        ]
      },
      {
        "name": "Andika taarifa za chakula, mzio, na dharura",
        "description": "Kwa kila mzee, andika mahitaji ya chakula, mzio, dawa zinazohusiana na chakula, na watu wa kuwasiliana nao wakati wa dharura. Zihifadhi salama na kwa wanaozihitaji tu — dereva anahitaji kujua mzio, si historia yote ya matibabu.",
        "hours": 3,
        "skills": [
          "kuingiza data"
        ]
      },
      {
        "name": "Weka utaratibu wa kuangalia hali ya mzee",
        "description": "Andika hasa anachofanya aliyejitokeza mzee asipofungua mlango au akionekana mgonjwa: nani anapigiwa simu kwanza, lini familia au namba za dharura zinahusishwa, na jinsi ya kuandika kilichotokea. Kuamua mapema kunashinda kubuni papo hapo mlangoni.",
        "hours": 3,
        "skills": [
          "kuandika"
        ],
        "follows": [
          4
        ]
      },
      {
        "name": "Wajali waliojitokeza na ukusanye maoni",
        "description": "Wasiliana na waliojitokeza mara kwa mara, badilisha njia mtu anapohitaji pumziko, na waulize wazee wenyewe jinsi mradi huu ungewafaa zaidi. Watakuambia mambo ambayo waliojitokeza hawayaoni kamwe.",
        "hours": 2,
        "skills": []
      }
    ]
  },
  {
    "id": "disaster-relief-hub",
    "name": "Kituo cha kupokea na kugawa mahitaji wakati wa maafa",
    "purpose": "Anzisha kituo kinachoweza kupokea, kupanga, na kusambaza vitu haraka maafa yanapotokea — kwa sababu siku za kwanza baada ya mafuriko au moto hufanikiwa au kushindikana kwenye upangaji na usafirishaji.",
    "whoItServes": "Majirani walioathiriwa na mafuriko, dhoruba, mioto, na maafa mengine — kuanzia na wale wasioweza kabisa kusafiri wala kusubiri.",
    "whatYoullNeed": "Mahali palipokubaliwa mapema pamoja na pa ziada, njia za kupata vitu, timu ya waliojitokeza wa kuitwa ghafla, na kushirikiana na mtandao wa kujiandaa na dharura — karibu yote yapangwe kabla ya maafa yoyote, kwa sababu baadaye ni kuchelewa mno.",
    "setupHours": 24,
    "defaultCategory": "organizing",
    "suggestsWorkDays": true,
    "firstSteps": "Kituo huwepo kwenye karatasi muda mrefu kabla hakijawepo kwenye uwanja, hivyo anza na mtandao wa kujiandaa na dharura — wao ndio wanaoshika mnyororo wa mawasiliano na picha ya hatari — na kwa swali la kweli: jengo lipi lingekufungulia kweli alfajiri na mapema baada ya mafuriko. Kamilisha kwanza makubaliano ya mahali na pa ziada; kila kazi nyingine inategemea anwani moja.",
    "commonPitfalls": "Vituo vya msaada hushindwa pande mbili: kituo kilichopo kama mpango tu ambao haujawahi kufanyiwa mazoezi, hivyo tukio halisi linapoteza siku yake ya kwanza kwa maswali ambayo jaribio moja lingekuwa limeyajibu — na kituo kinachofungua milango kwa gharika ya vitu visivyoweza kupangwa, likawa ghala la nguo zisizofaa wakati watu wanahitaji maji. Madhara ya kimya zaidi ni ugawaji wenye vizuizi: mtu anapolazimika kuthibitisha anastahili msaada, umerudisha uleule mfumo uliojenga hiki ili kuukwepa.",
    "pairsWith": [
      "emergency-preparedness",
      "resource-hub-dispatch"
    ],
    "learnMore": [
      "internet-outage"
    ],
    "tasks": [
      {
        "name": "Tambua mapema mahali pa kituo na pa ziada",
        "description": "Tafuta jengo au uwanja unaoweza kupokea mizigo, kupangia vitu, na kubeba foleni ya ugawaji — pamoja na pa ziada endapo pa kwanza pataharibika au kutofikika. Thibitisha ruhusa na funguo na wamiliki sasa, hali ya hewa ikiwa shwari; mahali usipoweza kuingia si mahali.",
        "hours": 3,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Jenga njia za kupata vitu",
        "description": "Panga mapema maji, chakula, vifaa vya usafi, na vya kusafishia vitatoka wapi — wauzaji, mashirika wenza, makusanyo ya vitu. Muhimu vilevile: njia ya kujua watu wanahitaji nini hasa baada ya tukio, ili usizikwe na vitu visivyofaa.",
        "hours": 4,
        "skills": [
          "kufikia watu",
          "kuratibu"
        ]
      },
      {
        "name": "Andaa upokeaji, upangaji, na hesabu ya vitu",
        "description": "Buni jinsi vitu vinavyoletwa vinavyopokelewa, kupangwa, na kufuatiliwa tangu lori linapofika. Kila kituo kilichozama kwenye vitu visivyopangwa kiliruka hatua hii — amua makundi yako, lebo, na hesabu rahisi kabla hujavihitaji.",
        "hours": 4,
        "skills": [
          "kuratibu",
          "kuingiza data"
        ]
      },
      {
        "name": "Tengeneza mfumo wa ugawaji",
        "description": "Panga jinsi vitu vinavyotoka: kwa usawa na bila vizuizi — hakuna kuombwa kitambulisho, hakuna kuthibitisha uhitaji — na upelekaji kwa wasioweza kufika kituoni. Watangulize walio hatarini zaidi, na andika kipaumbele hicho ili kinusurike vurugu.",
        "hours": 3,
        "skills": [
          "kuendesha gari",
          "kuratibu"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Kusanya na ufundishe timu ya kuitwa ghafla",
        "description": "Jenga orodha ya watu wanaoweza kufika kwa taarifa fupi, na uwafundishe mapema nafasi zao, kanuni za usalama, na mfumo wako wa upokeaji na ugawaji. Timu iliyofundishwa ya watu kumi na wawili hushinda umati wa hamsini wenye nia njema.",
        "hours": 4,
        "skills": [
          "kufundisha"
        ]
      },
      {
        "name": "Ratibu na vikundi vingine vya msaada",
        "description": "Tambulisha kituo kwa mamlaka rasmi za maafa na vikundi vingine vya msaada kabla ya lolote kutokea. Kubalianeni nani anashughulikia nini, ili mzibe mapengo badala ya kurudia kazi — kusaidiana huenda kasi zaidi pale ambapo mwitikio rasmi ni wa polepole zaidi.",
        "hours": 3,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Panga mawasiliano na usalama",
        "description": "Panga kwa kudhani mitandao itakatika: njia za mawasiliano zisizo za intaneti, orodha zilizopigwa chapa, na kuungana na mnyororo wa mawasiliano wa mtandao wa kujiandaa na dharura. Weka kanuni ngumu za usalama wa waliojitokeza — hakuna anayeingia jengo lisilo salama, kamwe — na uziandike.",
        "hours": 3,
        "skills": [
          "kuandika"
        ]
      }
    ]
  },
  {
    "id": "recovery-peer-support",
    "name": "Mtandao wa wenzao wanaosaidiana kupona uraibu",
    "purpose": "Endesha msaada unaoongozwa na wenzao kwa majirani walio kwenye safari ya kupona matumizi ya pombe au dawa za kulevya au wanaoianza — nyongeza ya matibabu ya kitaalamu, kamwe si mbadala wake.",
    "whoItServes": "Watu walio kwenye safari ya kupona, wanaoifikiria, na familia na marafiki wanaotembea kando yao.",
    "whatYoullNeed": "Waongozaji wenzao wenye uzoefu wao wenyewe wa kupona na mafunzo ya kweli, chumba salama cha faragha, njia za rufaa, na mipaka iliyosemwa wazi: msaada wa wenzao unaongezea matibabu ya kitaalamu, si mbadala wake; waongozaji si watoa matibabu na kamwe wasitoe ushauri wa detox wala dawa; na siku zote kuna mpango wazi wa kumuunganisha yeyote aliye kwenye shida na msaada wa kitaalamu au wa dharura.",
    "setupHours": 22,
    "defaultCategory": "emotional_support",
    "firstSteps": "Anza na watu watakaoshika chumba: tafuta jirani mmoja au wawili wenye uzoefu imara wa kupona, waingize kwenye mafunzo rasmi ya msaada wa wenzao, na andikeni pamoja upeo — mtandao huu ni nini na si nini — kabla ya kusema lolote hadharani. Kisha kutana ana kwa ana na programu za matibabu na timu za msaada wa haraka za eneo lako, ili njia yako ya rufaa iwe uhusiano, si namba ya simu kwenye kipeperushi.",
    "commonPitfalls": "Hii huwa hatari mstari unapofifia — mwongozaji mwenye nia njema anayeshauri mtu kuhusu detox au dawa, jambo linaloweza kuua, au kikundi kinachoteleza kuwa matibabu ya kienyeji kwa sababu njia ya rufaa haikuwahi kuwa halisi. Hushindwa kimyakimya kupitia usiri uliovunjwa — hadithi moja iliyovuja huondoa watu chumbani kabisa — na kupitia uchovu wa waongozaji, wakati anayeshikilia kupona kwa kila mtu hana msaada kwa ajili yake mwenyewe.",
    "pairsWith": [
      "mental-health-peer-support",
      "harm-reduction-supplies"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Tafuta na ufundishe waongozaji wenzao",
        "description": "Tafuta watu wenye uzoefu wao wenyewe wa kupona, uwapitishe kwenye mafunzo yanayotambulika ya msaada wa wenzao katika kupona. Kuwa wazi tangu mazungumzo ya kwanza: waongozaji ni wenzao, si watoa matibabu, na mafunzo ndiyo yanayoulinda mstari huo.",
        "hours": 5,
        "skills": [
          "kuongoza mazungumzo",
          "kufundisha"
        ]
      },
      {
        "name": "Weka upeo na mipaka",
        "description": "Andika mtandao unachofanya — msaada wa wenzao, kuunganika, kutiana moyo — na usichofanya: matibabu, detox, matunzo ya kiafya, ushauri wa dawa. Upeo ulioandikwa huwalinda wanaohudhuria dhidi ya ushauri mbaya na huwalinda waongozaji dhidi ya kubeba lisilo lao.",
        "hours": 3,
        "skills": [
          "kuandika"
        ]
      },
      {
        "name": "Jenga njia za rufaa na za wakati wa shida",
        "description": "Jenga mahusiano ya kazi na programu za matibabu ya kitaalamu, matunzo ya kiafya, na timu za msaada wa haraka, na andika mpango wa kukabiliana na kuzidiwa na dawa (overdose). Mtu chumbani anapohitaji zaidi ya wanachoweza wenzake, makabidhiano yawe simu ya kirafiki, si kipeperushi.",
        "hours": 4,
        "skills": [
          "kufikia watu",
          "utafiti"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Tafuta chumba salama, cha faragha, kisicho na vilevi",
        "description": "Tafuta chumba cha siri, cha kukaribisha, kisicho na hukumu wala vilevi — mahali watu wanapoweza kuonekana wakiingia bila kutangaza lolote. Maktaba, vyumba vya jumuiya, na nyumba za ibada zenye mlango wa pembeni vyote vinafaa.",
        "hours": 2,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Wekeni usiri na kanuni za kikundi",
        "description": "Kubalianeni kanuni za msingi: kinachosemwa humu kinabaki humu, heshima bila kusukumiana ushauri, na haki ya kila mmoja kusema au kunyamaza. Zirudieni kwa sauti mwanzoni mwa kila mkutano bila kukosa — kanuni huwalinda watu zikiwa bado mpya akilini tu.",
        "hours": 3,
        "skills": [
          "kuongoza mazungumzo"
        ]
      },
      {
        "name": "Panga mikutano na usambaze habari",
        "description": "Toa zaidi ya muda mmoja wa mkutano ili wafanyakazi wa zamu na wazazi waweze kuja, na sambaza habari kwa lugha nyepesi isiyo na unyanyapaa — bure, wazi, hakuna masharti. Jinsi unavyoandika kipeperushi huamua nani anajisikia salama kutokea.",
        "hours": 3,
        "skills": [
          "kufikia watu"
        ],
        "follows": [
          3
        ]
      },
      {
        "name": "Wajali waongozaji na uzuie uchovu",
        "description": "Wasiliana na waongozaji mara kwa mara, pokezaneni nani anaongoza, na hakikisha wana msaada wao wenyewe — kushika nafasi kwa ajili ya kupona kwa wengine ni kazi nzito, na kupona kwa mwongozaji mwenyewe siku zote ni kwanza.",
        "hours": 2,
        "skills": [
          "kusikiliza"
        ]
      }
    ]
  },
  {
    "id": "community-fitness",
    "name": "Vikundi vya mazoezi na afya vya jumuiya",
    "purpose": "Wafanye majirani wajongeshe miili pamoja bure — vikundi vya kutembea, mazoezi ya kujinyoosha, mpira wa papo kwa papo, ngoma — kwa sababu kujisikia vizuri mwilini mwako hakupaswi kuhitaji kadi ya gym.",
    "whoItServes": "Yeyote anayetaka kujongesha mwili, hasa majirani ambao gym ziko nje ya uwezo wao, wazee, na walio peke yao ambao kwao kuwa pamoja kuna umuhimu sawa na mazoezi yenyewe.",
    "whatYoullNeed": "Viongozi wa shughuli waliojitokeza, maeneo salama yanayofikika, na vifaa vichache sana. Mtindo wa kukaribisha usio na shinikizo una umuhimu kuliko vyeti — ingawa anayeongoza shughuli inayotaka nguvu nyingi awe na sifa zinazohitajika, na kila kipindi kinahitaji maji, kupasha mwili moto, na kisanduku cha msaada wa kwanza karibu.",
    "setupHours": 19,
    "defaultCategory": "other",
    "firstSteps": "Kabla hujapanga lolote, waulize watu unaotarajia waje ni nini hasa wangefurahia — kikundi cha kutembea, kujinyoosha kwenye kiti, jioni ya ngoma — na nini kinawezekana kwa miili yao; majibu ndiyo yachague shughuli zako, si kinyume chake. Kisha tafuta kiongozi mmoja au wawili ambao ukarimu wao unazidi ujuzi wao, tembeeni pamoja kwenye maeneo yanayowezekana, na anza kipindi kimoja cha kila wiki cha kutegemewa kabla ya kuongeza vingine.",
    "commonPitfalls": "Hii hufa kwa njia mbili: inageuka kuwa maonyesho — wenye nguvu zaidi wanaweka kasi, mazungumzo yanahamia uzito na sura, na wale wale kilichoanzishwa kwa ajili yao wanaacha kuja kimyakimya — au inakosa mpangilio, kwa sababu hakuna kinachoua kikundi cha kutembea haraka kuliko kufika mara mbili kwenye kipindi kilichofutwa. Kuruka misingi ya usalama inayochosha ndiyo njia ya tatu: hakuna kupasha mwili moto, hakuna maji, hakuna kisanduku cha msaada wa kwanza, na anguko moja baya linamaliza yote.",
    "pairsWith": [
      "disability-support-network",
      "neighborhood-care-network"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Chunguza mapendezi na viwango vya nguvu",
        "description": "Uliza huku na huko — sokoni, kwenye makazi ya wazee, langoni mwa shule — ni aina gani za kujongesha mwili watu wanazofurahia na zipi zinafikika kwao. Acha majibu yaongoze: mfano uliojaa michezo asiyoiomba mtu hausaidii yeyote.",
        "hours": 2,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Tafuta viongozi wa shughuli",
        "description": "Tafuta waliojitokeza kuongoza matembezi, kujinyoosha, ngoma, au michezo ya papo kwa papo. Mtindo wa kukaribisha usio na shinikizo hushinda ujuzi kwa shughuli nyingi — lakini anayeongoza kitu kinachotaka nguvu nyingi awe na sifa inayofaa.",
        "hours": 3,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Tafuta maeneo salama",
        "description": "Uliza kuhusu viwanja vya wazi, kumbi za jumuiya, na viwanja vya shule — bure au kwa gharama ndogo, vinavyofikika bila gari. Kagua kila eneo kwa ajili ya miili na uwezo wa aina zote: ardhi tambarare, viti, kivuli, vyoo, na pa kujikinga hali ya hewa ikibadilika.",
        "hours": 3,
        "skills": []
      },
      {
        "name": "Panga shughuli za kujumuisha kila ngazi",
        "description": "Buni kila shughuli ili watu waingie kwa kasi yao na wabadilishe watakavyo — chaguo la kiti kwenye kujinyoosha, mzunguko mfupi ndani ya matembezi marefu. Weka mkazo kwenye kujisikia vizuri, kujongesha mwili, na kuunganika, kamwe si sura wala ushindani.",
        "hours": 3,
        "skills": []
      },
      {
        "name": "Shughulikia usalama na afya",
        "description": "Ingiza kupasha mwili moto na kunywa maji kwenye kila kipindi, weka kisanduku cha msaada wa kwanza kilichojaa karibu, na shauri wageni wa mazoezi waonane na daktari kwanza. Wafundishe viongozi kutambua kujikaza kupita kiasi na kufanya kupunguza mwendo kuonekane jambo la kawaida, si la aibu.",
        "hours": 3,
        "skills": [
          "msaada wa kwanza"
        ]
      },
      {
        "name": "Weka ratiba na usambaze habari",
        "description": "Chagua nyakati zisizobadilika ambazo watu wanaweza kujenga mazoea nazo, uzishike. Sambaza habari kila mahali — vipeperushi, makundi ya gumzo, kuambiana — na sema wazi kwamba rika zote, maumbo yote, na uwezo wote unakaribishwa, kwa sababu watu wengi hudhani hawakaribishwi.",
        "hours": 3,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Jenga ukaribu na mwendelezo",
        "description": "Fanya vipindi viwe vya kijamii: majina yanafahamika, wageni wanakaribishwa, dakika chache za gumzo zimo ndani ya ratiba. Sherehekea kujitokeza kuliko kipimo chochote — kuunganika ndiko kunakowafanya watu waendelee kuja hata baada ya upya kufifia.",
        "hours": 2,
        "skills": [
          "kuongoza mazungumzo"
        ]
      }
    ]
  },
  {
    "id": "urban-orchard",
    "name": "Bustani ya miti ya matunda na msitu wa chakula mjini",
    "purpose": "Panda miti ya matunda na ya kokwa na mimea ya chakula ya kudumu kwenye ardhi ya pamoja — msitu wa chakula ambao, ukishasimama, hulisha mtaa bure kwa miongo kadhaa.",
    "whoItServes": "Jumuiya nzima, wakiwemo majirani ambao bado hawajafika — miti inayopandwa mwaka huu inakuwa chanzo cha muda mrefu cha chakula kibichi cha bure kwa kila mtu.",
    "whatYoullNeed": "Ruhusa ya ardhi ya muda mrefu (makubaliano ya mdomo ya msimu kwa msimu hayatoshi kwa miti), miti na mimea inayolingana na hali ya hewa, watu wengi kwa siku za upandaji, na kikundi kidogo cha watunzaji walioahidi miaka, si miezi. Thibitisha upatikanaji wa maji kabla chochote hakijaingia ardhini.",
    "setupHours": 21,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Mazungumzo ya ardhi huja kabla ya yote: ongea na mashirika ya kutunza ardhi, idara ya bustani za mji, nyumba za ibada zenye ardhi isiyotumika — yeyote anayeweza kuahidi eneo kwa miaka kumi, si msimu mmoja — na thibitisha maji papo hapo. Sambamba na hilo, tafuta mtu mmoja mwenye uzoefu halisi wa miti ya matunda awe nanga ya mchoro, na waulize majirani matunda yapi hasa wangechuma na kula, kwa sababu bustani ya matunda asiyoyataka mtu huwalisha nyigu tu.",
    "commonPitfalls": "Bustani za miti mara chache hushindwa siku ya kupanda — hushindwa mwaka wa pili na wa tatu, umati ukishaondoka na hakuna aliyepanga umwagiliaji, hivyo miti michanga hufa kimyakimya kiangazi chake cha kwanza. Wauaji wengine ni makubaliano dhaifu ya ardhi yanayofutwa miti inapoanza kuzaa, na magomvi ya mavuno kwa sababu hakuna aliyekubaliana kanuni za kugawana kabla ya mavuno makubwa ya kwanza. Kamilisheni zamu za utunzaji na kanuni za kugawana mapema, zikiwa bado rahisi.",
    "pairsWith": [
      "community-garden",
      "gleaning-network",
      "seed-library"
    ],
    "tasks": [
      {
        "name": "Pata makubaliano ya ardhi ya muda mrefu",
        "description": "Pata makubaliano ya maandishi ya kudumu — ukodishaji mrefu, mpango na shirika la kutunza ardhi, ahadi rasmi ya halmashauri — kwa sababu miti inahitaji miongo, si makubaliano ya mdomo ya msimu kwa msimu. Thibitisha maji ya uhakika eneo hilo kabla ya kutia sahihi chochote.",
        "hours": 5,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Panga mchoro wa upandaji",
        "description": "Chagua aina zinazostawi kwenye hali ya hewa yako na upange kwa tabaka za msitu wa chakula: miti mirefu ya juu, vichaka, na mimea ya kufunika ardhi vikifanya kazi pamoja. Panga miti wenza ya uchavushaji na nafasi itakayohitajika na miti iliyokomaa, si ukubwa wa miche unayopanda.",
        "hours": 4,
        "skills": [
          "kulima bustani"
        ]
      },
      {
        "name": "Tafuta miti na mimea",
        "description": "Panga miti na mimea kupitia vitalu, ruzuku, miti inayotolewa, na mauzo ya msimu ya miche ya mizizi-wazi — miche ya mizizi-wazi na michanga hugharimu kidogo sana kuliko miti iliyokomaa kwenye vyungu na mara nyingi hushika vizuri zaidi. Agiza mapema; aina nzuri huisha upesi.",
        "hours": 3,
        "skills": []
      },
      {
        "name": "Andaa eneo",
        "description": "Tayarisha ardhi kabla miti haijafika: boresha udongo, tandaza matandazo, andaa umwagiliaji, na weka alama na usafishe kila mahali pa kupanda kutoka kwenye mchoro. Eneo lililoandaliwa hugeuza siku ya kupanda kutoka vurugu kuwa mstari wa kazi unaoenda kasi.",
        "hours": 4,
        "skills": [
          "kulima bustani"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Fanya siku za upandaji",
        "description": "Endesha siku za upandaji za jumuiya zenye maelekezo wazi, ili kila mti uingie kwa kina sahihi na sehemu ya kushika maji na matandazo — ukipandwa vibaya, mti hushindwa polepole bila kuonekana. Ifanye sherehe; siku ya kupanda ndiyo mwanzo wa mtaa kuhisi bustani ni yao.",
        "hours": 5,
        "skills": [
          "kulima bustani"
        ],
        "follows": [
          3
        ],
        "recurringCadence": "cycle"
      },
      {
        "name": "Panga utunzaji wa muda mrefu",
        "description": "Panga kazi isiyo na mvuto inayoamua kama bustani inaishi: kumwagilia miti michanga viangazi vyake vya kwanza, kupogoa, kutandaza matandazo, na kudhibiti wadudu, mwaka baada ya mwaka. Zamu ya watunzaji waliotajwa kwa majina hushinda orodha kubwa ya watu wasio wazi.",
        "hours": 3,
        "skills": [
          "kulima bustani"
        ]
      },
      {
        "name": "Panga ugawanaji wa mavuno",
        "description": "Kubalianeni kanuni za kuchuma na kugawana kabla ya mavuno makubwa ya kwanza, si baada ya ugomvi wa kwanza — nani anavuna, lini, na kiasi gani. Elekeza ziada kwenye friji za jumuiya, hifadhi za chakula, na milo ya pamoja ili kisioze kitu tawini.",
        "hours": 2,
        "skills": []
      }
    ]
  },
  {
    "id": "new-parent-support",
    "name": "Mtandao wa kusaidia wazazi wapya na waliojifungua",
    "purpose": "Wazungushie wazazi wapya na wajawazito msaada wa vitendo — milo mlangoni, kutumwa madukani, vyombo kuoshwa, na wenzao waliopita njia hiyo — katika ujauzito na wiki ngumu za mwanzo baada ya kujifungua.",
    "whoItServes": "Wazazi wapya na wanaotarajia, hasa wasio na ndugu karibu — wiki za baada ya kujifungua ndizo msaada unapohitajika zaidi na mara nyingi kufika kidogo zaidi.",
    "whatYoullNeed": "Waliojitokeza wanaoweza kupika, kutumwa, na kusikiliza; mfumo wa kupokezana milo; orodha ya mahali pa kupata msaada; na wazazi wazoefu kama wenzao wa kusaidia. Msaada wa wenzao si matibabu wala matunzo ya afya ya akili — matatizo ya hisia baada ya kujifungua ni ya kawaida na mazito, hivyo kila mwenzao lazima ajue dalili na jinsi ya kumuunganisha mzazi na msaada wa kitaalamu kwa upole. Na mchunguze yeyote atakayeingia nyumbani au kusaidia na wachanga kabla hajafanya lolote kati ya hayo.",
    "setupHours": 21,
    "defaultCategory": "childcare",
    "firstSteps": "Anza kwa kuwauliza wazazi waliojifungua mwaka uliopita nini hasa kingewasaidia — majibu (mlo usioambatana na ugeni, mtu wa kumshika mtoto wakiwa wanaoga) ni mahususi kuliko unavyodhani. Tambulisha mtandao kwa wakunga, doula, na kliniki za watoto zinazoweza kuutolea familia, tafuta wazazi wazoefu wawili au watatu kuwa wenzao wako wa kwanza wa kusaidia, na kamilisha utaratibu wako wa uchunguzi kabla mtu yeyote hajavuka kizingiti.",
    "commonPitfalls": "Kushindwa kwa kawaida ni msaada unaomtumikia anayesaidia: watu wanaofika kwa ratiba yao wenyewe, kukaa muda mrefu mno, na kutoa maoni ya malezi badala ya kuosha vyombo — wazazi waliochoka wataacha kufungua mlango kimyakimya badala ya kusema. Kubaya zaidi ni mwenzao kukosa dalili za sonona ya baada ya kujifungua kwa sababu hakuna aliyemfundisha kuzitambua wala kumpa maneno ya kuzitaja. Na msaada unaotoweka baada ya wiki mbili, papo hapo vyakula vya kupelekewa vinapokoma na sehemu ngumu kuanza, si msaada kabisa.",
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
        "name": "Tafuta waliojitokeza na wenzao wa kusaidia",
        "description": "Kusanya wapishi, watu wa kutumwa, na — muhimu zaidi — wazazi wazoefu walio tayari kuwa wenzao wa kusaidia. Mzazi anayekumbuka wiki yake ya tatu bila usingizi anatoa kitu ambacho hakuna kijitabu kinachoweza.",
        "hours": 3,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Andaa mfumo wa kupokezana milo",
        "description": "Jenga njia rahisi ya kuratibu milo inayoachwa mlangoni katika wiki za baada ya kujifungua: kalenda ya pamoja, mahitaji ya chakula na mzio kuulizwa mara moja tu, chakula chenye lebo na chepesi kupasha moto. Kuacha mlangoni kuwe ndiyo kawaida — mlo usilazimishe kamwe ugeni.",
        "hours": 3,
        "skills": [
          "kupika",
          "kuratibu"
        ]
      },
      {
        "name": "Toa msaada wa vitendo",
        "description": "Panga waliojitokeza kwa mzigo usio na mvuto: kutumwa, nguo, vyombo, na kuwaangalia wakubwa ili mzazi apumzike au afike kliniki. Uliza kinachotakiwa kila mara badala ya kudhani — msaada wenye maana hufuata orodha ya mzazi, si ya aliyekuja kusaidia.",
        "hours": 3,
        "skills": [
          "kulea watoto"
        ]
      },
      {
        "name": "Jenga orodha ya mahali pa kupata msaada",
        "description": "Kusanya msaada wa kunyonyesha, matunzo ya afya ya akili baada ya kujifungua, kliniki za watoto, na vyanzo vya mahitaji ya mtoto vya eneo lako — pamoja na benki ya nepi na kikundi cha kulea watoto kama jumuiya yako inaziendesha. Iweke ya kisasa; orodha ya namba zilizokufa ni mbaya kuliko kutokuwa nayo.",
        "hours": 4,
        "skills": [
          "kuingiza data"
        ]
      },
      {
        "name": "Anzisha vikundi vya wazazi kusaidiana",
        "description": "Anzisha vikundi vidogo ambamo wazazi wapya wanaweza kusema ukweli kuhusu ugumu wake, na mzazi mzoefu akishika nafasi. Wafundishe wenzao dalili za sonona na wasiwasi wa baada ya kujifungua na kuhimiza kwa upole, bila kuchoka, matunzo ya kitaalamu — kamwe si kutambua ugonjwa, kamwe si kusubiri.",
        "hours": 3,
        "skills": [
          "kuongoza mazungumzo"
        ]
      },
      {
        "name": "Weka taratibu za usalama na mipaka",
        "description": "Mchunguze kila aliyejitokeza atakayeingia nyumbani au kusaidia na wachanga — wadhamini angalau — na andika mipaka: wazazi ndio wanaoweka masharti, ugeni ni mfupi isipokuwa wakialikwa kukaa zaidi, na hakuna anayetokea bila taarifa. Msaada usijisikie kamwe kama ufuatiliaji.",
        "hours": 3,
        "skills": []
      },
      {
        "name": "Unganisha na miradi mingine",
        "description": "Waunganishe familia na benki ya nepi, kikundi cha kulea watoto, na timu ya kuwakaribisha wapya ili mawasiliano ya mtu mmoja yafungue yote. Mzazi mpya asilazimike kugundua kila mradi peke yake katika kipindi chake cha kuchoka zaidi maishani.",
        "hours": 2,
        "skills": [
          "kufikia watu"
        ]
      }
    ]
  },
  {
    "id": "foster-kinship-support",
    "name": "Mtandao wa kusaidia familia zinazolea watoto wa wengine",
    "purpose": "Simama nyuma ya familia zinazolea watoto wa kupokea (foster), wa ndugu, na malezi mengine — nguo na kitanda mtoto anapofika usiku uleule, pumziko walezi wanapoishiwa nguvu, na wenzao wanaoelewa kazi hii.",
    "whoItServes": "Wazazi wanaolea watoto wa kupokea, babu na bibi na ndugu wanaolea watoto — ambao mara nyingi huanza kwa simu moja na taarifa ya saa chache tu — na watoto walio chini ya malezi yao.",
    "whatYoullNeed": "Waliojitokeza, vitu vilivyotolewa vya kila umri na ukubwa, watu wa kuwapumzisha walezi, na ushirikiano na mashirika ya ustawi wa jamii na shule. Kazi inayohusu watoto walio kwenye malezi ni nyeti na inaongozwa na sheria: chunguza kila anayefanya kazi na watoto, fuata sheria za lazima za kutoa taarifa na za usiri hadi herufi yake, na shirikiana na mamlaka husika badala ya kuzizunguka.",
    "setupHours": 24,
    "defaultCategory": "childcare",
    "firstSteps": "Anza kwa kikao na shirika la ustawi wa jamii linaloshughulikia malezi ya watoto la eneo lako: jifunze sheria zinazoongoza kazi hii — uchunguzi, wajibu wa kutoa taarifa, usiri — kabla ya kumtafuta hata mmoja aliyejitokeza, na waache wakuoneshe mapengo yalipo hasa. Kisha uliza familia chache zinazolea zilihitaji nini wiki yao ya kwanza na mwaka wao wa kwanza; jenga kuelekea majibu hayo, si kuelekea ghala la vitu asivyoviomba mtu.",
    "commonPitfalls": "Mradi huu unaweza kushindwa kwa kelele au kimyakimya. Kwa kelele: mtu asiyechunguzwa karibu na watoto, au hadithi ya familia kusimuliwa bila idhini — lolote linaweza kumdhuru mtoto, kusitisha malezi, na kumaliza mradi kwa siku moja. Kimyakimya: mlima wa vitu visivyopangwa wakati walezi wanasubiri wiki tatu kwa kitanda cha mtoto, au kuyachukulia mashirika kama wapinzani hadi yaache kuelekeza familia. Ndogo, iliyochunguzwa, na inayoshirikiana hushinda kubwa ya kubabaisha hapa, kila mara.",
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
        "name": "Jenga uhusiano na familia zinazolea",
        "description": "Zifikie familia zinazolea kupitia mashirika, shule, na nyumba za ibada — hasa ndugu wanaolea, ambao mara nyingi humpokea mjukuu au mpwa usiku uleule bila maandalizi na bila msaada rasmi wa kutosha. Fanya mawasiliano ya kwanza yawe kutoa msaada, kamwe si uchunguzi.",
        "hours": 3,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Kusanya nguo na vitu vya kila umri",
        "description": "Kusanya nguo, vitanda, viti vya watoto vya garini, na mahitaji ya kila siku kwa umri na ukubwa wote, kwa sababu walezi mara chache hujua nani anakuja hadi afike. Kagua vifaa vya usalama kwa makini — viti vya garini na vitanda vya wachanga vina tarehe za mwisho na orodha za kuitwa kurudishwa.",
        "hours": 4,
        "skills": [
          "kuratibu"
        ]
      },
      {
        "name": "Tengeneza mfumo wa vitu vya haraka",
        "description": "Fungasha mifuko iliyo tayari — nguo za siku chache, vifaa vya usafi, na kitu cha faraja kama kidoli laini — iliyopangwa kwa umri na ukubwa, inayoweza kufika ndani ya saa chache mtoto mpya anapopokelewa. Mtoto anayefika bila chochote asisubiri wiki ili kupata kitu chake mwenyewe.",
        "hours": 3,
        "follows": [
          1
        ],
        "skills": []
      },
      {
        "name": "Panga zamu za kuwapumzisha walezi",
        "description": "Panga malezi salama ya muda yaliyochunguzwa ipasavyo ili walezi wapumzike, wafike walikopanga, au wavute pumzi tu — uchovu wa wanaolea ni miongoni mwa sababu kuu za malezi kuvunjika. Kubaliana na mashirika nani anaruhusiwa kutoa malezi ya kupumzisha na kwa kanuni zipi.",
        "hours": 4,
        "skills": [
          "kulea watoto"
        ]
      },
      {
        "name": "Anzisha vikundi vya walezi kusaidiana",
        "description": "Fanya mikusanyiko ya mara kwa mara ambapo wanaolea watoto wa kupokea na wa ndugu wanaweza kubadilishana uzoefu na ushauri wa kweli na watu wanaoelewa — kazi hii inatenga, na anayelea mitaa mitatu kutoka kwako huenda anabeba mzigo uleule peke yake.",
        "hours": 3,
        "skills": [
          "kuongoza mazungumzo"
        ]
      },
      {
        "name": "Jenga orodha ya mahali pa kupata msaada",
        "description": "Kusanya programu, stahili, na msaada unaozingatia majeraha ya ndani ambao familia zinazolea zinaweza kuutumia, na uzisaidie kupita kwenye mifumo inayochanganya hata wataalamu. Ndugu wanaolea hasa mara nyingi wanastahili msaada ambao hakuna aliyewahi kuwaambia.",
        "hours": 3,
        "skills": [
          "kuingiza data"
        ]
      },
      {
        "name": "Weka taratibu za usalama wa mtoto na faragha",
        "description": "Andika na fuata yasiyojadilika: uchunguzi kwa yeyote anayefanya kazi na watoto, sheria za lazima za kutoa taarifa zinawataka nini waliojitokeza wako, na faragha kali kwa familia na watoto — hakuna picha, hakuna hadithi, hakuna maelezo yanayotolewa bila idhini.",
        "hours": 4,
        "skills": [
          "kuandika"
        ]
      }
    ]
  },
  {
    "id": "weather-survival-outreach",
    "name": "Kupeleka vifaa vya kunusurika baridi kali na joto kali",
    "purpose": "Fikisha vifaa vya kuokoa maisha kwa majirani wasio na makazi hali ya hewa inapogeuka ya kuua — mablanketi na vipasha-joto vya mikono wakati wa baridi kali, maji na ORS wakati wa wimbi la joto — vikipelekwa hadi pale watu walipo hasa.",
    "whoItServes": "Majirani wasio na makazi na wanaoishi mitaani waliowekwa wazi kwa hali ya hewa kali — watu ambao kwao wimbi la joto au baridi kali ni tishio la maisha, si usumbufu.",
    "whatYoullNeed": "Vifaa maalum vya kila msimu, waliojitokeza kwenda mitaani, njia zilizopangwa, na mahusiano ya sasa na makazi ya muda na mahali pa kupata msaada. Joto kali na baridi kali huua: kila aliyejitokeza lazima afundishwe kutambua hypothermia na heat stroke na kuita msaada wa kitabibu wa kitaalamu bila kuchelewa — kamwe si kusubiri kuona.",
    "setupHours": 24,
    "defaultCategory": "mutual_aid_drive",
    "firstSteps": "Kabla hujanunua blanketi hata moja, ongea na watu na vikundi vinavyotembea njia hizi tayari — wao ndio wanaoshika kuaminiwa na kujua watu walipo hasa, na watakuambia kipi kimeshughulikiwa na kipi kinakosekana. Kubaliana nao jinsi utakavyoingia, weka vipimo vya utabiri vinavyoanzisha mizunguko yako, na jaza vifaa vya msimu hali ya hewa ikiwa bado shwari.",
    "commonPitfalls": "Kushindwa kunakotabirika ni kuanza pamoja na hali ya hewa: vifaa vinavyotafutwa katikati ya wimbi la joto hufika hatari ikishapita, na wageni wanaotokea mara ya kwanza wakati wa shida hupata “hapana” ya tahadhari kutoka kwa watu waliojifunza uangalifu kwa njia ngumu. Kushindwa kwa hatari ni waliojitokeza kujaribu kushughulikia dharura ya kitabibu wenyewe badala ya kuita msaada mara moja, na kuwashinikiza watu kuhama au kukubali makazi — toa, eleza, na heshimu jibu.",
    "pairsWith": [
      "cooling-warming-center",
      "harm-reduction-supplies",
      "resource-hub-dispatch"
    ],
    "tasks": [
      {
        "name": "Fungasha vifurushi vya kila msimu",
        "description": "Fungasha vifurushi vinavyolingana na msimu: mablanketi, soksi za joto, kofia, glavu, na vipasha-joto vya mikono kwa baridi; maji, vifuko vya ORS, mafuta ya kujikinga na jua, kofia, na vitambaa vya kupoza kwa joto. Ongeza kwenye kila kifurushi kadi yenye mahali pa makazi ya muda na namba za msaada wa haraka.",
        "hours": 4,
        "skills": []
      },
      {
        "name": "Tafuta vifaa",
        "description": "Endesha makusanyo ya vitu, nunua kwa jumla, na omba maduka na nyumba za ibada vitoe — na fanya hivyo kabla ya msimu, kwa sababu kutafuta mablanketi baridi ya kwanza ikishaingia ni kufika kuchelewa. Weka vya kutosha kujazia katikati ya msimu.",
        "hours": 4,
        "skills": [
          "kufikia watu",
          "kuendesha gari"
        ]
      },
      {
        "name": "Chora ramani ya mahali pa kuwafikia watu",
        "description": "Fanya kazi na wanaowafikia watu mitaani tayari ujue majirani wasio na makazi wanakaa wapi hasa — wanashika kuaminiwa na maarifa yaliyojengwa kwa miaka, na kufika kando yao kunashinda kufika kama mgeni. Iweke ramani huru na ya kisasa; watu huhama, hasa hali ya hewa ikiwa mbaya.",
        "hours": 3,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Tafuta na ufundishe waliojitokeza kwenda mitaani",
        "description": "Fundisha kila aliyejitokeza kabla ya mzunguko wake wa kwanza: kufikia watu kwa heshima kunakokubali jibu la hapana, usalama binafsi na kutembea wawili-wawili siku zote, na kutambua dharura za kitabibu za hali ya hewa. Hakuna anayegawa kitu kabla hajafundishwa.",
        "hours": 4,
        "skills": [
          "kufundisha"
        ]
      },
      {
        "name": "Panga mpango wa ugawaji na njia",
        "description": "Panga njia na nyakati kwa siku za kabla na za wakati wa hali ya hewa hatari, ukiwafikia kwanza waliowekwa wazi zaidi — walio mbali zaidi na msaada, wanaolala nje badala ya kwenye magari au makazi ya muda. Amua mapema utabiri gani unaanzisha mzunguko.",
        "hours": 3,
        "skills": [
          "kuratibu"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Waunganishe watu na makazi ya muda na msaada",
        "description": "Beba taarifa za sasa zilizohakikiwa za mahali pa kupata joto na pa kupoa, vitanda vya makazi ya muda, na kitovu cha kusaidiana — saa za kufunguliwa na kanuni hubadilika kila mara, na rufaa kwenda mlango uliofungwa huunguza kuaminiana. Toa miunganisho bila shinikizo; uhusiano unadumu zaidi ya usiku wowote mmoja.",
        "hours": 3,
        "skills": [
          "kufikia watu"
        ]
      },
      {
        "name": "Jiandae kwa dharura",
        "description": "Fundisha kila aliyejitokeza kutambua hypothermia na heat stroke — kuchanganyikiwa, kusema kwa kulegalega, ngozi ya moto na kavu au ya baridi na unyevunyevu — na kupiga simu za dharura mara moja, si kusubiri kuona. Fanyeni mazoezi ya cha kufanya msaada ukiwa njiani: kivuli na maji, au mablanketi na kujikinga na upepo.",
        "hours": 3,
        "skills": [
          "msaada wa kwanza"
        ]
      }
    ]
  }
];
