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
import type { FaqSection } from "./faq";

export const FAQ_SECTIONS_SW: readonly FaqSection[] = [
  {
    "id": "posts",
    "title": "Mabandiko na mabadilishano",
    "entries": [
      {
        "id": "post-something",
        "question": "Ninabandikaje hitaji au msaada ninaoutoa?",
        "answer": [
          "Ukiwa kwenye Ubao, gusa kitufe cha kijani + Bandika hitaji au + Bandika msaada unaotoa chini ya skrini. Andika kichwa kifupi, eleza unachokihitaji au unachoweza kukitoa, kisha ulibandike. Baadaye unaweza kulighairi kutoka kwenye ukurasa wa maelezo ya bandiko, au kulibandika upya na mabadiliko kupitia menyu ya bandiko."
        ]
      },
      {
        "id": "claim-post",
        "question": "Ninalichukuaje bandiko la mtu mwingine?",
        "answer": [
          "Gusa bandiko lolote kwenye Ubao ili kufungua ukurasa wake wa maelezo. Kwenye hitaji, gusa Jitokeze kusaidia; kwenye msaada unaotolewa, gusa Chukua msaada huu. Bandiko linahamia hali ya “Linasubiri uthibitisho”, na aliyelibandika anapata nafasi ya kuthibitisha kabla saa zozote za msaada hazijahamia.",
          "Ukibadili mawazo, gusa Achia ulichochukua kwenye ukurasa ule ule — bandiko linafunguka tena kwa mtu mwingine."
        ]
      },
      {
        "id": "confirm-exchange",
        "question": "Kuthibitisha mabadilishano kunafanyaje kazi?",
        "answer": [
          "Baada ya msaada kutokea kweli, nyote wawili mnagusa Thibitisha imekamilika kwenye ukurasa wa maelezo ya bandiko. Saa za msaada zinahamia tu baada ya nyote wawili kuthibitisha.",
          "Nani anaanza haina maana — mmoja anathibitisha kwanza, mwingine anaona bandiko linamsubiri, naye anathibitisha akipata nafasi."
        ]
      },
      {
        "id": "other-not-confirmed",
        "question": "Mwenzangu bado hajathibitisha. Nifanye nini?",
        "answer": [
          "Kwanza, muulize nje ya programu. Mara nyingi ni mguso uliosahaulika, si kukataa.",
          "Kama kweli kuna kutoelewana kuhusu kama mabadilishano yalitokea au kama yalihesabika kama msaada kamili, tumia Kuna kitu si sawa — tia alama kwenye ukurasa wa maelezo ya bandiko. Hiyo inayaweka wazi kwenye ukurasa wa Kutoelewana, ambako jumuiya inaweza kusaidia kulitatua — hakuna wasimamizi hapa. Saa za msaada zinabaki zikisubiri mpaka litatuliwe.",
          "Wala hukwami kusubiri milele. Kama jumuiya yako imewasha uthibitisho wa kiotomatiki, node ya jumuiya inaingia kazini baada ya muda wa kusubiri uliokubaliwa na kukamilisha uthibitisho ulio wazi kwamba umesahaulika tu, ili saa za mtu yeyote zisikae hewani bila mwisho."
        ]
      },
      {
        "id": "cancel-post",
        "question": "Ninalighairije bandiko nisilolihitaji tena?",
        "answer": [
          "Fungua bandiko kutoka kwenye Ubao kisha ugusa Ghairi bandiko. Bandiko linaondoka ubaoni mara moja, hivyo hakuna wa kulichukua. Halifutwi — ukurasa wake wenyewe unabaki, ukiwa na alama ya kughairiwa, na yeyote mwenye kiungo chake bado anaweza kuona kilichoombwa au kilichotolewa."
        ]
      }
    ]
  },
  {
    "id": "balance",
    "title": "Saa za msaada na mbegu ya mwanzo",
    "entries": [
      {
        "id": "what-is-balance",
        "question": "Saa zangu za msaada zina maana gani?",
        "answer": [
          "Saa zako za msaada ni jumla inayoendelea: saa ulizozitoa ukitoa saa ulizozipokea. Kila mtu anaanza na 5 (saa za mbegu), kwa hiyo mwanajumuiya mpya kabisa yuko kwenye 5, si 0.",
          "Kuwa chini ya sifuri si tatizo — kuomba msaada si deni. Saa zako zinaonekana kwa jumuiya yako, lakini si alama za mtihani, na hakuna orodha ya washindi."
        ]
      },
      {
        "id": "negative-balance",
        "question": "Je, saa zangu za msaada zinaweza kushuka chini ya sifuri?",
        "answer": [
          "Ndiyo. Kupokea zaidi ya ulichokitoa ni sehemu ya jinsi kusaidiana kunavyofanya kazi — mtandao huu umeundwa utiririke. Jumuiya itaona alama tu kama kikomo cha mabadilishano kwa siku kinakaribiwa au mtindo fulani unaonekana si wa kawaida; nje ya hapo hakuna anayeichunguza namba yako."
        ]
      }
    ]
  },
  {
    "id": "identity",
    "title": "Utambulisho wako na vifaa vyako",
    "entries": [
      {
        "id": "getting-around",
        "question": "Tabo ya Wasifu imekwenda wapi? Ninazungukaje?",
        "answer": [
          "Tabo tano ziko chini ya skrini (zinakuwa mstari upande wa kushoto kwenye skrini pana): Ubao, Mdundo, Kalenda, Ujumbe, na Ninavyotunza — kila kazi uliyoichukua na kila mradi unaouendesha, vimekusanywa mahali pamoja.",
          "Kila kinachomhusu WEWE kimehamia nyuma ya kitufe cha Menyu kilicho pembe ya juu kulia: Wasifu wako (umeorodheshwa chini ya jina lako mwenyewe), Mipangilio, Alika mtu, ukurasa huu wa Msaada, Tafuta, na Miundombinu ya jumuiya.",
          "Tafuta inakutafutia mabandiko, miradi, matukio, watu, na majibu haya ya msaada — yote kutoka kwenye kilichopo tayari kwenye kifaa chako. Ukiwa na kibodi, Ctrl+K (⌘K kwenye Mac) inaifungua kutoka popote."
        ]
      },
      {
        "id": "change-name",
        "question": "Ninabadilishaje jina langu la kuitwa au mtaa wangu?",
        "answer": [
          "Wasifu → sehemu ya “Kukuhusu”. Majina ni lebo tu, si vitambulisho, kwa hiyo unaweza kulibadilisha wakati wowote unaotaka. Utambulisho wako wa kriptografia unabaki ule ule."
        ]
      },
      {
        "id": "lost-passphrase",
        "question": "Nikiyapoteza maneno yangu ya siri itakuwaje?",
        "answer": [
          "Hakuna anayeweza kuyaweka upya kwa niaba yako — kwa makusudi. Mizani yake ni hii: hakuna mamlaka kuu inayoweza kusoma data yako, na kwa hiyo hakuna mamlaka kuu inayoweza kuiokoa pia.",
          "Lakini maneno ya siri yaliyosahaulika si lazima tena yamaanishe kujipoteza. Kama una kifaa cha pili kilichounganishwa, bado kinashika utambulisho wako. Kama ulitengeneza kit ya kurejesha (Mipangilio → Kit ya kurejesha), inarudisha akaunti yako chini ya maneno yake ya siri tofauti, yake yenyewe. Kama ulichagua washika amana, idadi ya kutosha yao pamoja inaweza kukurudisha bila maneno ya siri kabisa. Angalia “Nikiipoteza simu yangu itakuwaje?” hapa chini kwa mpangilio kamili wa kujaribu.",
          "Ni pale tu ambapo hakuna mojawapo ya hivyo, jibu linakuwa Wasifu → Dharura → Futa kabisa: futa kifaa na uanze upya na utambulisho mpya, bila historia yako ya zamani ya saa za msaada."
        ]
      },
      {
        "id": "lost-phone",
        "question": "Nikiipoteza simu yangu itakuwaje?",
        "answer": [
          "Akaunti yako inaweza kurudi — huu hapa mpangilio wa kweli wa kujaribu, bora kwanza.",
          "1. Kifaa cha pili kilichounganishwa. Kama uliongeza kimoja (Wasifu → Ongeza kifaa kingine), utambulisho wako tayari unaishi humo; endelea kukitumia tu, na uiunganishe simu mbadala kutoka humo.",
          "2. Kit ya kurejesha. Kama ulitengeneza moja (Mipangilio → Kit ya kurejesha), fungua programu kwenye kifaa kipya chochote, chagua “Umepoteza kifaa chako lakini una kit ya kurejesha”, kisha andika maneno ya siri ya kit hiyo. Saa zako za msaada, wadhamini wako, nafasi zako, na uanajumuiya wako vyote vinarudi; historia ya jumuiya inasawazishwa tena kutoka kwenye seva yake.",
          "3. Washika amana wako. Kama uliugawanya ufunguo wako kwa washika amana (Mipangilio → Washika amana), kutana na idadi ya kutosha yao: kifaa kipya kinaonyesha msimbo wa ombi, kila mshika amana anajibu na msimbo wa kuachilia, na idadi inayotakiwa ikitimia akaunti yako inarudi ndani yenyewe — bila kit, bila maneno ya siri.",
          "4. Mwaliko mpya. Kama hakuna mojawapo ya hayo hapo juu, omba mtu akualike tena. Utakuwa mwanajumuiya mpya: historia yako ya zamani inabaki ikionekana kwa jumuiya chini ya jina lako la zamani, lakini ufunguo mpya unaanza kutoka sifuri. Hii ndiyo sababu hasa programu inamsukuma kila mtu kwenye kifaa cha pili, kit, au washika amana KABLA ya wiki mbaya.",
          "Kisichorudi kamwe kwenye kifaa kipya: ujumbe wa moja kwa moja na rasimu ambazo hazijatumwa — viliishi kwenye ile simu iliyopotea tu, kwa makusudi."
        ]
      },
      {
        "id": "install-app",
        "question": "Naweza kuisakinisha Understoria kama programu?",
        "answer": [
          "Ndiyo. Understoria ni programu ya wavuti unayoweza kuiweka kwenye skrini yako ya kwanza kama programu nyingine yoyote: unapata aikoni, inafunguka skrini nzima bila pau za kivinjari, inaanza haraka zaidi, na inaendelea kufanya kazi bila intaneti.",
          "Kwenye iPhone au iPad, fungua Understoria kwenye Safari, gusa kitufe cha Shiriki, kisha uchague “Ongeza kwenye Skrini ya Kwanza”.",
          "Kwenye Android, ifungue kwenye Chrome, gusa menyu (⋮) iliyo pembe ya juu, kisha uchague “Ongeza kwenye skrini ya kwanza” au “Sakinisha programu”.",
          "Kwenye kivinjari cha kompyuta, tafuta aikoni ya kusakinisha mwisho wa kulia wa upau wa anwani.",
          "Kwenye kompyuta ya Linux kuna pia programu ya kompyuta — faili moja (AppImage) ambalo jumuiya yako inaweza kushirikishana, linaloendeshwa bila kivinjari kabisa. Lifanye liweze kuendeshwa (bofya kulia → Properties → ruhusu kuendesha, au chmod +x), lifungue, kisha uunganishe kutoka kwenye simu yako: Mipangilio → “Ongeza kifaa kingine” kwenye simu, kisha njia ya kubandika msimbo kwenye kompyuta. Linahesabika kama kifaa chake chenyewe, kama ile hali ya iPhone iliyo hapa chini, na linasasishwa tu unapolibadilisha faili kwa jipya zaidi.",
          "Jambo moja la kujua kabla ya kusakinisha: kwenye iPhone na iPad programu iliyosakinishwa inapata hifadhi yake tofauti YAKE yenyewe, kwa hiyo inaanza ikiwa haijaingia ndani ingawa nakala ya kivinjari imeingia — hakuna kilichopotea, una tu “vifaa” viwili tofauti kwenye simu moja. Programu iliyosakinishwa inauliza kuhusu hili kwenye skrini yake ya kwanza kabisa: chagua “Tayari natumia Understoria kwenye kivinjari cha simu hii” nayo inakuongoza kuuhamisha utambulisho wako, hatua kwa hatua. (Kwenye Android na kompyuta, programu iliyosakinishwa inashirikiana hifadhi na kivinjari, kwa hiyo unabaki umeingia.)"
        ]
      },
      {
        "id": "new-device",
        "question": "Ninahamiaje kwenye kifaa kipya?",
        "answer": [
          "Hakuna cha kuandika. Kwenye kifaa kipya, fungua Understoria kisha uchague “Hamisha utambulisho wangu” — kinaonyesha emoji mbili na kusubiri. Kwenye kifaa ambacho tayari kina utambulisho wako, nenda Wasifu → Ongeza kifaa kingine: ombi linajitokeza pale lenyewe. Angalia emoji zinalingana, gusa “Kiunganishe”, na kifaa kipya kinajiingiza chenyewe. Vifaa vyote viwili vinahitaji kuwa kwenye mtandao mmoja (kwenye simu moja huwa hivyo siku zote). Uko mahali pengine, au hakuna seva ya jumuiya? “Njia nyingine za kuunganisha” ina msimbo wa maneno 6 wa kusemwa kwa sauti na msimbo QR unaoziruka seva kabisa.",
          "Vitu viwili haviji pamoja nawe: historia ya jumbe zako (jumbe zimesimbwa kwa funguo za kila kifaa chenyewe, kwa hiyo zinabaki pale zilipopokelewa) na mipangilio ya kila kifaa kama mandhari na ukubwa wa maandishi. Vingine vyote — mabandiko, miradi, matukio, wanajumuiya, mabadilishano — vinavuka pamoja na muunganisho wenyewe, kwa hiyo kifaa kipya kinafanana na cha zamani mara moja na kinaendelea kusawazishwa baadaye."
        ]
      },
      {
        "id": "link-safety",
        "question": "Nichunge nini ninapounganisha vifaa?",
        "answer": [
          "Mazoea matatu rahisi yanaufanya uunganishaji kuwa salama. Kwanza: gusa “Kiunganishe” tu pale WEWE ndiye unayekishika kifaa kinachoomba, na emoji mbili za skrini yako zinalingana na zile mbili za skrini yake. Ombi likijitokeza wakati huunganishi chochote, lipuuze — huenda mtu kwenye mtandao wako anajaribu bahati yake, na hakuna kinachotokea usipogusa.",
          "Pili: baada ya kifaa kipya kuingia, tupia jicho jina linalokusalimu. Kama si wewe, mtu ameingiza utambulisho wake mwenyewe kwenye uhamisho wako — hakuna chako kilichochukuliwa, na kitufe cha “Huyu si mimi” kinakifuta kifaa kabisa ili uanze upya.",
          "Tatu, ukweli mdogo uliowekwa wazi: kuunganisha kwa mguso kunapita kwenye seva ya jumuiya yako yenyewe, inayopitisha tu data iliyofungwa ambayo haiwezi kuisoma — lakini kama humwamini anayeiendesha seva hiyo, tumia njia ya QR iliyo chini ya “Njia nyingine za kuunganisha” badala yake. QR inakwenda skrini hadi kamera bila seva kuhusika kabisa.",
          "Jambo moja la kiutendaji: kuunganisha kwa mguso kunahitaji vifaa vyote viwili vionekane viko kwenye mtandao mmoja. VPN au iCloud Private Relay inaweza kuingilia kimya kimya — kama ombi halijitokezi kamwe, isimamishe kwa dakika moja kisha uombe tena, au tumia “Njia nyingine za kuunganisha”."
        ]
      }
    ]
  },
  {
    "id": "community",
    "title": "Jumuiya na mialiko",
    "entries": [
      {
        "id": "internet-outage",
        "question": "Bado tunaweza kufanya nini intaneti ikikatika — kama wakati wa dhoruba kubwa?",
        "answer": [
          "Zaidi ya unavyoweza kudhani, kwa sababu programu nzima ilijengwa kwa ajili ya wakati kama huu hasa. Kifaa chako tayari kimebeba kila kitu: ubao, kumbukumbu ya pamoja ya jumuiya, orodha ya wanajumuiya, utambulisho wako. Unaweza kuendelea kusoma, kubandika, na kuthibitisha — kila badiliko linajipanga foleni salama na kujituma lenyewe wakati unapounganika tena. Hakuna kinachopotea intaneti ikiwa imekatika.",
          "Kama mtu aliye karibu nawe anahitaji msaada SASA: msaidie, kisha mthibitishie pamoja naye papo hapo. Kwenye ukurasa wa bandiko, chagua “Thibitisha ana kwa ana” — simu moja inaonyesha msimbo, nyingine inauskani na kutia sahihi. Simu zote mbili zinabaki na rekodi na kuibeba nyumbani intaneti ikirudi.",
          "Kama jumuiya yako ina kimbilio — seva ndogo ya ziada ambayo mtu anaiandaa tayari kwa nyakati za kukatika — jiunge na WiFi yake intaneti ikikatika, na programu inafanya kazi tena vivi hivi kwa kila mtu aliyepo hapo penye hifadhi: mabandiko yanatiririka, msaada unathibitishwa, bila maandalizi yoyote. Muulize anayeendesha seva ya jumuiya yako kama kimbilio kipo; kama hakipo, docs/offline-resilience.md ndiyo maelekezo ya kukijenga nyakati njema.",
          "Unaweza hata kumwalika mtu mpya. Msimbo wako wa mwaliko unafanya kazi bila intaneti yoyote — umetiwa sahihi na wewe na unadumu wiki mbili — kwa hiyo mwonyeshe msimbo QR au mkabidhi kiungo kwenye karatasi na umwache abaki na picha yake. Akiwa kwenye kimbilio anaweza kusakinisha programu na kujiunga papo hapo; vinginevyo anakamilisha kujiunga mara tu anapopata muunganisho wowote. Kitu kimoja tu kisichowezekana bila mtandao popote ni kuipakua programu yenyewe — mwaliko unasubiri kwa utulivu mpaka aweze.",
          "Nyakati njema ndizo wakati wa kuyaweka haya kwenye karatasi: ukurasa wa Miundombinu ya jumuiya unaweza kuchapa kifurushi cha wakati wa kukatika — bango la ukutani na kadi za mfukoni zenye hatua za kujiunga na kimbilio — ili maelekezo yaishi hata betri zikifa."
        ]
      },
      {
        "id": "add-a-node",
        "question": "Nini kinailinda jumuiya hii kama mtu akiichukua seva yetu?",
        "answer": [
          "Mambo mawili, nayo ndiyo moyo wa jinsi Understoria ilivyojengwa tofauti na programu za makampuni. Kwanza: kifaa cha kila mwanajumuiya tayari kimebeba nakala kamili iliyotiwa sahihi ya jumuiya — ubao, kumbukumbu ya pamoja, miradi, vyote. Kuikamata seva hakuchukui chochote ambacho hakipo tayari kwenye simu za wote, na seva mbadala inaweza kujazwa upya kutoka kwenye nakala hizo.",
          "Pili: seva si lazima iwe mashine moja, wala mashine ya mtu mmoja. Mwanajumuiya yeyote anaweza kuendesha node ya jumuiya — laptop kuukuu kabatini ikiwa imefungwa kifuniko inatosha kweli kweli. Kila node ya ziada ina maana hakuna mtu mmoja ambaye kikundi kinachopinga vyama vya wafanyakazi au kinachopinga kusaidiana kingemshinikiza ili kuivunja jumuiya. Kadi ya “Uimara wa jumuiya” kwenye Mdundo inaonyesha jumuiya yako imeotesha mizizi mingapi.",
          "Uko tayari kuongeza moja? Hatua kwa hatua ziko kwenye docs za mradi — docs/add-a-node.md kwenye hazina ya Understoria inakuongoza kuipa kompyuta kuukuu kazi mpya, na mwongozo wa mwendeshaji unashughulikia undani wake. Ni kazi ya alasiri moja, na mwanajumuiya aliyeiendesha seva yako ya sasa anaweza kukusaidia kubadilishana mipangilio miwili inayoziunganisha node hizo."
        ]
      },
      {
        "id": "start-a-community",
        "question": "Je, ningeweza kuanzisha jumuiya kama hii kwa mtaa wangu?",
        "answer": [
          "Ndiyo — na huhitaji ruhusa ya mtu yeyote, akaunti ya GitHub, wala duka la programu. Understoria ni programu huru, na seva ya jumuiya hii yenyewe inautoa msimbo wake kamili wa chanzo kwa kupakuliwa.",
          "Njia nzima imeandikwa ndani ya programu: fungua Menyu (juu kulia) → Miundombinu ya jumuiya → kadi inayoitwa “Programu yenyewe” → “Anzisha jumuiya mpya kutoka kwenye pakuo hili — mwongozo kamili”. Inakuongoza kutoka kupakua na kuukagua msimbo hadi kuiendesha seva yako mwenyewe, kwa lugha ya kawaida."
        ]
      },
      {
        "id": "invite-someone",
        "question": "Ninamwalikaje mtu?",
        "answer": [
          "Kwanza: kualika ni jambo la wanajumuiya wanaoaminika. Mpaka wanajumuiya wawili wanaoaminika wawe wamekudhamini (mwaliko ulioujia unahesabika kama wa kwanza), kitufe cha mwaliko kinaonyesha maendeleo yako badala yake. Hii inailinda jumuiya — mnyororo wa wageni hauwezi kualika wageni zaidi. Kufika hapo, fanya kile programu ilichoundwa kwa ajili yake: saidia watu. Majirani wakishakujua, mwanajumuiya yeyote anayeaminika anaweza kukudhamini kutoka kwenye wasifu wako.",
          "Njia ya haraka zaidi: fungua Menyu (juu kulia) kisha uchague Alika mtu — inakupeleka moja kwa moja kwenye kadi ya mialiko. Njia ya mzunguko ni Wasifu → “Mialiko uliyoitoa”.",
          "Gusa Tengeneza kiungo cha mwaliko nawe utapata kiungo cha kutumika mara moja. Kitoe ana kwa ana, kwa Signal, au kwenye njia yoyote unayoweza kuhakikisha kimemfikia kweli mtu uliyemkusudia. Usibandike viungo vya mialiko hadharani.",
          "Unaweza pia kuuonyesha mwaliko kama msimbo QR kwa kutoa ana kwa ana. Kila mwaliko hutumika mara moja tu, unaisha muda wenyewe, na unaweza kutanguliwa kutoka Wasifu → “Mialiko uliyoitoa” mpaka utumike. Mtu anapojiunga kwa mwaliko wako, hiyo inahesabika kama wewe umemdhamini — jina lako linasimama nyuma ya kujiunga kwake, kwa hiyo alika watu unaowajua kweli."
        ]
      },
      {
        "id": "how-vouching-works",
        "question": "Kudhamini kunafanyaje kazi?",
        "answer": [
          "Udhamini ni kauli ya wazi iliyotiwa sahihi kwamba unamjua mtu huyu na unasimama nyuma ya nafasi yake katika jumuiya. Mtu anakuwa “anaaminika” pale wanajumuiya wawili tofauti wamemdhamini — na kumwalika mtu kunahesabika kama udhamini wako kiotomatiki, kwa hiyo kudhamini kwa mkono wako ndiyo jinsi unavyomuunga mkono mtu aliyeletwa na mwingine.",
          "Unadhamini kutoka kwenye ukurasa wa mwanajumuiya: gusa jina lake popote kwenye programu kisha uitafute sehemu ya Udhamini. Kitufe kinaonekana pale udhamini wako ungeongeza uaminifu kweli — wewe mwenyewe unaaminika, yeye bado anakusanya wadhamini, na hujamdhamini tayari. Vinginevyo sehemu hiyo inaeleza kwa nini, kwa hiyo huachwi kubahatisha kamwe.",
          "Inafaa kufikiri kidogo kwanza: jina lako linasimama nyuma ya lake, likionekana na kudumu — udhamini hauwezi kurudishwa nyuma ndani ya programu. Ukiujutia baadaye, njia ni mazungumzo na jumuiya yako, si kitufe. Dhamini watu unaowajua kweli.",
          "Kudhaminiwa pia kunazifungua nguvu za kuaminiana za jumuiya: kualika watu wapya, kudhamini wengine, kutia sahihi kuondolewa kwa wanajumuiya — na viungo unavyovitoa vinakuwa vya kuguswa kwa kila mtu (kabla ya hapo watu wanaona anwani nzima lakini hawawezi kuigusa — kinga dhidi ya viungo vibaya, si doa kwako). Vikomo vya kila siku vya kubandika vya mwanajumuiya mpya — navyo ni vipana — vinatoweka wakati ule ule."
        ]
      },
      {
        "id": "disagree-with-member",
        "question": "Nikitofautiana na mwanajumuiya mwingine je?",
        "answer": [
          "Zungumza naye kwanza. Kutofautiana kwingi hakuihusu programu wala hakuhitaji programu kuingilia.",
          "Kama kunahusu mabadilishano fulani, tumia Kuna kitu si sawa — tia alama kwenye ukurasa wa maelezo ya bandiko. Kama kunahusu mwenendo zaidi ya mabadilishano moja, unaweza kufungua kutoelewana kutoka Wasifu → Kutoelewana — kutoelewana kunapita kwenye mchakato wa wazi wa mapendekezo wa jumuiya, kwa sababu hakuna wasimamizi wa kuamua kwa niaba yako.",
          "Na kama unachokihitaji ni umbali tu kutoka kwa mtu, kuzuia kupo siku zote pia — angalia “Mtu akinisumbua je?” chini ya Ujumbe."
        ]
      },
      {
        "id": "member-removal",
        "question": "Kumwondoa mtu kwenye jumuiya kunafanyaje kazi?",
        "answer": [
          "Kuondoa ni jambo zito kuliko yote jumuiya hii inaloweza kulifanya, na programu inalichukulia hivyo. Ni njia ya mwisho: kuzuia binafsi tayari kunazuia maudhui ya mtu yasikufikie, kutoelewana kunaweza kupinga mabadilishano fulani, na mazungumzo yanatengeneza mengi kuliko vyote viwili.",
          "Hakuna mtu mmoja anayeweza kumwondoa yeyote — si mratibu, wala si anayeendesha seva. Inahitaji wanajumuiya kadhaa (idadi inapangwa na jumuiya yako na inaonyeshwa kwa wote) kila mmoja akitia jina lake mwenyewe kwenye rekodi moja ya wazi. Kupendekeza kunaanzia kwenye wasifu wa mwanajumuiya; sahihi zinazofuata zinatiwa na kila mtu mwenyewe, kutoka kwenye ukurasa wa Mapendekezo.",
          "Kuondolewa ni kwa wazi ndani ya jumuiya — aliyeondolewa, lini, kwa nini, na nani hasa waliotia sahihi, vyote vinaonekana kwenye ukurasa wa Mapendekezo. Kufukuzana kwa siri ndiko kunakozioza jumuiya.",
          "Si kufutwa. Mabadilishano ya zamani ya aliyeondolewa yanabaki — yanazisawazisha kumbukumbu za wanajumuiya wengine — na kila kilicho kwenye kifaa chake mwenyewe kinabaki chake. Kinachoisha ni mlango wake wa kuingia: kusoma kunakoma, na maandishi mapya yanakataliwa. Watu aliowaalika kabla ya kuondolewa wanabaki wanajumuiya; mialiko yake ambayo haijatumika inakufa pamoja na kuondolewa huko.",
          "Na mlango unaweza kufunguka tena: kurudishwa kunahitaji idadi ile ile ya sahihi, kukianzia kwenye rekodi ya kuondolewa yenyewe kwenye ukurasa wa Mapendekezo."
        ]
      },
      {
        "id": "lurking-ok",
        "question": "Naweza kuangalia tu bila kubandika chochote?",
        "answer": [
          "Ndiyo. Kusoma wanachokitoa na kukiomba wengine ni njia halali ya kushiriki. Wanajumuiya wengine huangalia tu kwa wiki kadhaa kabla ya kubandika hitaji lao la kwanza; wengine hawabandiki kamwe na hujibu tu ya wengine. Wote wanakaribishwa."
        ]
      },
      {
        "id": "who-sees-what",
        "question": "Nani anaweza kuona ninachokibandika?",
        "answer": [
          "Kila mtu kwenye node ya jumuiya yako anaweza kuona mabandiko yako, jina lako la kuitwa, mtaa wako (kama uliuweka), na historia yako ya mabadilishano. Jumuiya rafiki zinapokea rekodi zilizotiwa sahihi unazozitoa nje — mabandiko, mabadilishano yaliyothibitishwa, matukio — chini ya ufunguo wako wa wazi, si jina lako la kuitwa. Kwa kuwa mabadilishano yanasambaa kati ya jumuiya rafiki, node rafiki inaweza kuona shughuli za mabadilishano za ufunguo wako na kuzipiga hesabu saa zake; kisichotoka kwenye jumuiya yako kamwe: majibu ya mialiko ya matukio, majina yaliyoandikwa kwenye zamu, kazi za miradi, kuzuia, rasimu, na jumbe.",
          "Ujumbe wa moja kwa moja ni tofauti: umesimbwa ncha hadi ncha kati ya kifaa chako na cha mwenzako, kwa hiyo ni ninyi wawili tu mnaoweza kuusoma — si node, si wanajumuiya wengine. Angalia “Ninamtumiaje ujumbe mwanajumuiya mwingine?” chini ya Ujumbe kwa undani zaidi."
        ]
      },
      {
        "id": "beta-status",
        "question": "Programu hii imekamilika kiasi gani? Nisiweke nini ndani yake?",
        "answer": [
          "Understoria ni programu iliyo katika hatua ya beta. Sehemu kubwa ya msimbo wake iliandikwa kwa zana za AI na kupitiwa na watu, na bado haijafanyiwa ukaguzi huru wa usalama.",
          "Kinga unazoziona ni za kweli na zimejaribiwa — jumbe zimesimbwa ncha hadi ncha, rekodi zimetiwa sahihi, ufutaji wa wakati wa hatari unafanya kazi. Lakini beta ina maana hitilafu zinawezekana, zikiwemo ambazo hakuna aliyezigundua bado.",
          "Imejengwa kwa ajili ya kupanga msaada wa kawaida wa majirani. Usiweke ndani yake chochote ambacho kingekuumiza wewe au mtu mwingine kama kingevuja — vitambulisho vya serikali, taarifa za afya au za uhamiaji, au chochote ambacho ungekisema faraghani tu. Ukiwa na shaka, kiseme ana kwa ana."
        ]
      }
    ]
  },
  {
    "id": "messages",
    "title": "Ujumbe",
    "entries": [
      {
        "id": "message-someone",
        "question": "Ninamtumiaje ujumbe mwanajumuiya mwingine?",
        "answer": [
          "Fungua bandiko lolote kisha ugusa kitufe cha Tuma ujumbe kuanzisha mawasiliano — unamfikia aliyelibandika, au, kama ni bandiko lako mwenyewe, anayekusaidia. Mazungumzo huanzia kwenye bandiko kwa makusudi — hilo linauweka ujumbe umefungamana na msaada halisi badala ya mawasiliano ya ghafla. Fungua Ujumbe kwenye tabo zako uone mazungumzo yako yote na uyatafute.",
          "Jumbe zimesimbwa ncha hadi ncha na zinasafiri kifaa hadi kifaa. Ni wewe tu na unayemwandikia mnaoweza kuzisoma — node ya jumuiya inazipitisha lakini haiwezi kuona ndani yake.",
          "Kwa makusudi hakuna alama za kusomwa wala viashiria vya kuandika. Hakuna anayeweza kuona lini (au kama) umeusoma ujumbe, na hakuna anayekutazama ukitunga jibu. Soma unaposoma, jibu ukiwa na nafasi — programu haitakusema vyovyote vile."
        ]
      },
      {
        "id": "voice-notes",
        "question": "Ujumbe wa sauti unafanyaje kazi? Kipaza sauti changu hakifanyi kazi.",
        "answer": [
          "Ndani ya mazungumzo, kitufe cha kipaza sauti kinakaa kwenye kisanduku cha ujumbe kikiwa kitupu — ukianza kuandika kinabadilika kuwa Tuma; futa maandishi na kipaza sauti kinarudi. Kigusa kurekodi ujumbe wa sauti wa hadi sekunde 45, usikilize kwanza kabla chochote hakijatoka, na utume tu ukiridhika nao. Jumbe za sauti zimefungwa ncha hadi ncha sawasawa na jumbe za maandishi — ni wewe tu na unayezungumza naye mnaoweza kuzisikia.",
          "Sauti kwenye mabandiko ya Ubao inafanya kazi tofauti. Mabandiko ya ubao ni maudhui ya jumuiya, kwa hiyo rekodi unayoiambatisha kwenye bandiko inasikika kwa jumuiya nzima — wasikilizaji ni wale wale ambao wangeyasoma maneno ungeyaandika pale.",
          "Kama kipaza sauti hakianzi: kivinjari au simu yako inaomba ruhusa mara ya kwanza unaporekodi. Kama ilikataliwa — hata kwa bahati mbaya — kurekodi kunabaki kumezuiliwa mpaka ukiruhusu kipaza sauti kwa tovuti hii kwenye mipangilio ya kivinjari au ya simu yako. Ikishakubaliwa, rudi ujaribu tena."
        ]
      },
      {
        "id": "someone-bothering-me",
        "question": "Mtu akinisumbua je?",
        "answer": [
          "Unaweza kumzuia. Fungua mazungumzo yako naye kisha uchague Zuia mawasiliano kwenye menyu iliyo juu, au tumia chaguo la kuzuia kwenye ukurasa wake wa mwanajumuiya.",
          "Kuzuia ni papo hapo na ni faragha. Unaacha kuona mabandiko yake, matukio yake, maoni yake, na jumbe zake, na hakuna kati yenu anayeweza tena kumtumia mwenzake ujumbe, kumdhamini, kuchukua alichokibandika, wala kumwalika. Haambiwi — hakuna taarifa, hakuna alama kwenye wasifu wake, hakuna kitu mtu mwingine anachoweza kukiona.",
          "Kuzuia HAKUPELEKI jambo mahali popote. Hakuna msimamizi anayearifiwa, hakuna kutoelewana kunakofunguka, na mabadilishano ya zamani yanabaki yalivyokuwa. Ukitaka jumuiya itoe maoni, fungua kutoelewana kutoka Wasifu → Kutoelewana — kuzuia na kutoelewana vinakwenda pamoja vizuri tu. Kuzuia kunakupa utulivu sasa; kutoelewana kunafuata mchakato wa jumuiya kwa mwendo wake.",
          "Unaweza kuvipitia, kuvibadilisha, au kuviondoa vizuizi vyako wakati wowote kwenye Mipangilio → Waliozuiliwa."
        ]
      }
    ]
  },
  {
    "id": "events",
    "title": "Matukio na kalenda",
    "entries": [
      {
        "id": "community-events",
        "question": "Matukio ya jumuiya yanafanyaje kazi?",
        "answer": [
          "Yeyote anaweza kutengeneza tukio: fungua Kalenda kisha ugusa kitufe cha +. Lipe wakati, mahali, na maelezo, nalo linaonekana kwenye kalenda ya jumuiya kwa wote.",
          "Gusa tukio ili kujibu mwaliko wake — Nitakuja, Labda, au Sitakuja. Jibu lako linabaki kwenye node ya jumuiya hii: mwandaaji na wengine waliojibu wanaweza kuona jina lako, wanajumuiya ambao hawajajibu wanaona idadi tu, na jumuiya rafiki hazilioni jibu lako kamwe. Ukilibadilisha jibu lako kuwa “Sitakuja”, jina lako linaondoka kwenye orodha mara moja.",
          "Baadhi ya matukio yana zamu pia — vipindi vya muda ambavyo mwandaaji anahitaji idadi fulani ya mikono, kama kikosi cha maandalizi au zamu za kupakua chakula. Kuandika jina lako kwenye zamu kunakujibia pia “Nitakuja” kwenye tukio. Orodha ya zamu inafanya kazi kama orodha ya majibu: inabaki kwenye node ya jumuiya hii, na kulibadilisha jibu lako kuwa “Sitakuja” kunakuondoa kwenye zamu zote pia.",
          "Matukio hayawezi kuharirika baada ya kutengenezwa — tukio lililotiwa sahihi linabaki vile vile watu walivyolikubalia. Mambo yakibadilika, mwandaaji analighairi na kubandika jipya. Tukio ulilolijibu likighairiwa, utaiona taarifa yake (pamoja na sababu ya mwandaaji, kama aliitoa) utakapoifungua programu tena."
        ]
      }
    ]
  },
  {
    "id": "projects",
    "title": "Miradi na kazi",
    "entries": [
      {
        "id": "task-follows",
        "question": "Kwa nini kazi inasema “Inafuata: …”?",
        "answer": [
          "Kazi ndani ya mradi zinaweza kupangwa mfululizo. “Inafuata” ina maana kazi hii kwa kawaida inakuja baada ya nyingine — mwaga msingi kabla ya kuzisimamisha kuta. Hakuna kilichokwama na hakuna aliye njiani mwa mwenzake; ni mpangilio tu.",
          "Bado unaweza kuichukua kazi yenye “Inafuata” wakati wowote unaotaka. Tofauti pekee ni kwamba programu kwa makusudi haitakuulizia habari zake mpaka ile kazi ya awali imalizike — hakuna maana ya kuuliza inaendeleaje wakati msingi inaojengwa juu yake haupo bado. Mfumo unasubiri pamoja nawe, haukungojei wewe."
        ]
      }
    ]
  }
];
