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
import type { FaqSection } from "./faq";

export const FAQ_SECTIONS_FIL: readonly FaqSection[] = [
  {
    "id": "posts",
    "title": "Mga paskil at palitan",
    "entries": [
      {
        "id": "post-something",
        "question": "Paano ako magpapaskil ng kailangan o alok?",
        "answer": [
          "Sa Paskilan, i-tap ang berdeng button na + Magpaskil ng kailangan o + Magpaskil ng alok sa ibaba ng screen. Maglagay ng maikling titulo, ilarawan kung ano ang kailangan mo o ang kaya mong ibigay, at ipaskil ito. Mamaya, puwede mo itong kanselahin mula sa detail page ng paskil, o Ipaskil ulit nang may pagbabago mula sa menu ng paskil."
        ]
      },
      {
        "id": "claim-post",
        "question": "Paano ko kukunin ang paskil ng ibang tao?",
        "answer": [
          "I-tap ang kahit anong paskil sa Paskilan para buksan ang detail page nito. Sa isang kailangan, i-tap ang Mag-alok na tumulong; sa isang alok, i-tap ang Kunin ang alok na ito. Lilipat ang paskil sa estadong “Naghihintay ng kumpirmasyon”, at magkakaroon ng pagkakataon ang nagpaskil na kumpirmahin bago lumipat ang kahit anong oras.",
          "Kung magbago ang isip mo, i-tap ang Bitawan ang kinuha ko sa parehong pahina — bubukas ulit ang paskil para sa iba."
        ]
      },
      {
        "id": "confirm-exchange",
        "question": "Paano gumagana ang pagkumpirma ng palitan?",
        "answer": [
          "Kapag naganap na talaga ang tulong, i-tap ninyong dalawa ang Kumpirmahing tapos na sa detail page ng paskil. Lilipat lang ang oras kapag nakapagkumpirma na kayong dalawa.",
          "Hindi mahalaga kung sino ang mauuna — magkukumpirma ang isa, makikita ng isa pa na siya na ang hinihintay ng paskil, at magkukumpirma siya kapag handa na."
        ]
      },
      {
        "id": "other-not-confirmed",
        "question": "Hindi pa nagkukumpirma ang kabilang tao. Ano ang gagawin ko?",
        "answer": [
          "Una, kumustahin mo siya sa labas ng app. Kadalasan, tap lang ito na nakalimutan, hindi pagtanggi.",
          "Kung may tunay na hindi pagkakasundo tungkol sa kung naganap ba ang palitan o kung buo bang tulong ang naibigay, gamitin ang May hindi tama — markahan sa detail page ng paskil. Lilitaw ito sa pahinang Hindi pagkakasundo, kung saan makakatulong ang komunidad na ayusin ito — walang admin dito. Nakabinbin muna ang oras hanggang sa maayos ito.",
          "Hindi ka rin maiipit sa paghihintay nang walang hanggan. Kung naka-on sa komunidad mo ang awtomatikong pagkumpirma, papasok ang node ng komunidad pagkalipas ng napagkasunduang panahon ng paghihintay at bubuuin nito ang kumpirmasyong malinaw namang nakalimutan lang, para walang oras ng kahit sino ang maiiwang nakabitin nang walang katapusan."
        ]
      },
      {
        "id": "cancel-post",
        "question": "Paano ko kakanselahin ang paskil na hindi ko na kailangan?",
        "answer": [
          "Buksan ang paskil mula sa Paskilan at i-tap ang Kanselahin ang paskil. Aalis agad ang paskil sa paskilan, kaya wala nang makakakuha nito. Hindi ito nabubura — nananatili ang sarili nitong pahina, may markang kinansela, at makikita pa rin ng sinumang may hawak ng link nito kung ano ang hiningi o inialok."
        ]
      }
    ]
  },
  {
    "id": "balance",
    "title": "Ang oras mo at ang panimulang binhi",
    "entries": [
      {
        "id": "what-is-balance",
        "question": "Ano ang ibig sabihin ng oras ko?",
        "answer": [
          "Ang oras mo ay tumatakbong kabuuan: ang mga oras na naibigay mo, binawasan ng mga oras na natanggap mo. Lahat ay nagsisimula sa 5 (ang panimulang binhi), kaya ang bagong-bagong miyembro ay nasa 5, hindi sa 0.",
          "Okey lang na mag-negatibo ang oras mo. Ang paghingi ng tulong ay hindi utang — at lalong hindi utang na loob. Nakikita ng komunidad mo ang oras ng bawat isa, pero hindi ito iskor, at walang leaderboard."
        ]
      },
      {
        "id": "negative-balance",
        "question": "Puwede bang mag-negatibo ang oras ko?",
        "answer": [
          "Oo. Ang pagtanggap nang higit sa naibigay mo ay bahagi ng kung paano gumagana ang tulungan — ginawa talaga ang network para umagos. Makakakita lang ng marka ang komunidad kung malapit nang maabot ang takdang dami ng palitan sa isang araw o kung mukhang kakaiba ang takbo; bukod doon, walang nagbabantay sa numero mo."
        ]
      }
    ]
  },
  {
    "id": "identity",
    "title": "Ang pagkakakilanlan at mga device mo",
    "entries": [
      {
        "id": "getting-around",
        "question": "Saan napunta ang tab na Profile? Paano maglibot sa app?",
        "answer": [
          "Limang tab ang nasa ibaba ng screen (nagiging hanay sa kaliwa kapag malapad ang screen): Paskilan, Pintig, Kalendaryo, Mensahe, at Inaalagaan ko — bawat gawaing kinuha mo at bawat proyektong inaayos mo, sama-sama sa iisang lugar.",
          "Ang lahat ng tungkol SA IYO ay lumipat sa likod ng button na Menu sa kanang itaas na sulok: ang Profile mo (nakalista sa ilalim ng sarili mong pangalan), Mga setting, Imbitahan ang kakilala mo, ang pahinang ito ng Tulong, Maghanap, at Imprastruktura ng komunidad.",
          "Nahahanap ng Maghanap ang mga paskil, proyekto, event, tao, at ang mga sagot na ito sa Tulong — lahat mula sa nasa device mo na. Kung may keyboard, bubuksan ito ng Ctrl+K (⌘K sa Mac) mula kahit saan."
        ]
      },
      {
        "id": "change-name",
        "question": "Paano ko papalitan ang pangalang pantawag ko o ang kapitbahayan ko?",
        "answer": [
          "Profile → ang bahaging “Tungkol sa iyo”. Ang pangalan ay pantawag lang, hindi patunay ng pagkakakilanlan, kaya puwede mo itong palitan kahit kailan mo gusto. Hindi nagbabago ang cryptographic na pagkakakilanlan mo."
        ]
      },
      {
        "id": "lost-passphrase",
        "question": "Ano ang mangyayari kapag nawala ko ang passphrase ko?",
        "answer": [
          "Walang makakapag-reset nito para sa iyo — sadya iyon sa disenyo. Ang kapalit: walang sentrong awtoridad na makakabasa ng data mo, kaya wala ring sentrong awtoridad na makakasagip nito.",
          "Pero ang nakalimutang passphrase ay hindi na kailangang mangahulugan ng nawalang sarili. Kung may pangalawa kang naka-link na device, hawak pa rin nito ang pagkakakilanlan mo. Kung gumawa ka ng kit ng pagbabalik (Mga setting → Kit ng pagbabalik), maibabalik nito ang account mo sa ilalim ng sarili at hiwalay nitong passphrase. Kung pumili ka ng mga tagapag-ingat, kaya kang ibalik ng sapat na bilang nila nang magkakasama, nang wala ni isang passphrase. Tingnan ang “Ano ang mangyayari kapag nawala ang phone ko?” sa ibaba para sa buong pagkakasunod-sunod na susubukan.",
          "Kung wala ni isa sa mga iyon, saka lang ang sagot ay Profile → Emergency → Burahin nang tuluyan: burahin ang device at magsimula ulit nang may sariwang pagkakakilanlan, nang wala ang dati mong kasaysayan ng oras."
        ]
      },
      {
        "id": "lost-phone",
        "question": "Ano ang mangyayari kapag nawala ang phone ko?",
        "answer": [
          "Kayang bumalik ng account mo — narito ang tapat na pagkakasunod-sunod na susubukan, mula sa pinakamainam.",
          "1. Pangalawang naka-link na device. Kung nagdagdag ka ng isa (Profile → Magdagdag ng isa pang device), nakatira na roon ang pagkakakilanlan mo; ituloy mo lang ang paggamit nito, at mula roon, i-link ang kapalit na phone.",
          "2. Kit ng pagbabalik. Kung gumawa ka ng isa (Mga setting → Kit ng pagbabalik), buksan ang app sa kahit anong bagong device, piliin ang “Nawala ang device mo pero may kit ka ng pagbabalik”, at ilagay ang passphrase ng kit. Babalik lahat: ang oras mo, ang mga panagot, ang mga papel mo sa komunidad, at ang pagiging miyembro mo; magsi-sync pabalik ang kasaysayan ng komunidad mula sa server nito.",
          "3. Ang mga tagapag-ingat mo. Kung hinati mo ang susi mo sa mga tagapag-ingat (Mga setting → Mga tagapag-ingat), puntahan ang sapat na bilang nila: magpapakita ang bagong device ng code ng kahilingan, sasagot ang bawat tagapag-ingat ng code ng pagsasauli, at pagdating sa takdang bilang, papasok pabalik ang account mo — walang kit, walang passphrase.",
          "4. Bagong imbitasyon. Kung wala ni isa sa mga nasa itaas, humiling sa isang tao na imbitahan ka ulit. Magiging sariwang miyembro ka: mananatiling nakikita ng komunidad ang dati mong kasaysayan sa ilalim ng dati mong pangalan, pero magsisimula sa zero ang bagong susi. Ito mismo ang dahilan kung bakit inuudyukan ng app ang lahat patungo sa pangalawang device, sa isang kit, o sa mga tagapag-ingat BAGO dumating ang masamang linggo.",
          "Ang hinding-hindi na babalik sa bagong device: ang mga direktang mensahe at ang mga hindi pa naipapadalang draft — sa nawalang phone lang talaga sila nabuhay, sadya sa disenyo."
        ]
      },
      {
        "id": "install-app",
        "question": "Puwede ko bang i-install ang Understoria na parang app?",
        "answer": [
          "Oo. Ang Understoria ay web app na puwede mong ilagay sa home screen mo tulad ng kahit anong app: may icon ka, bumubukas ito nang full-screen nang walang mga bar ng browser, mas mabilis itong magsimula, at tuloy ang gana nito kahit offline.",
          "Sa iPhone o iPad, buksan ang Understoria sa Safari, i-tap ang button na Share, at piliin ang “Add to Home Screen”.",
          "Sa Android, buksan ito sa Chrome, i-tap ang menu (⋮) sa itaas na sulok, at piliin ang “Add to Home screen” o “Install app”.",
          "Sa desktop browser, hanapin ang icon ng pag-install sa kanang dulo ng address bar.",
          "Sa Linux na computer, may desktop app din — isang file (isang AppImage) na puwedeng ipamahagi ng komunidad mo, na tumatakbo nang walang browser. Gawin muna itong maaaring patakbuhin (right-click → Properties → payagan ang pagpapatakbo, o chmod +x), buksan ito, at i-pair mula sa phone mo: Mga setting → “Magdagdag ng isa pang device” sa phone, tapos ang landas ng pag-paste ng pairing code sa computer. Bibilang itong sarili nitong device, katulad ng kaso ng iPhone sa ibaba, at nag-a-update lang ito kapag pinalitan mo ang file ng mas bago.",
          "Isang bagay na dapat malaman bago mag-install: sa iPhone at iPad, ang naka-install na app ay may SARILING hiwalay na imbakan, kaya nagsisimula itong naka-sign out kahit naka-sign in ang kopya sa browser — walang nawawala, mayroon ka lang dalawang magkahiwalay na “device” sa iisang phone. Itinatanong ito ng naka-install na app sa kauna-unahang screen nito: piliin ang “Ginagamit ko na ang Understoria sa browser ng phone na ito” at gagabayan ka nito sa paglilipat ng pagkakakilanlan mo, hakbang-hakbang. (Sa Android at desktop, pinagsasaluhan ng naka-install na app ang imbakan ng browser, kaya mananatili kang naka-sign in.)"
        ]
      },
      {
        "id": "new-device",
        "question": "Paano ako lilipat sa bagong device?",
        "answer": [
          "Walang kailangang i-type. Sa bagong device, buksan ang Understoria at piliin ang “Dalhin ang pagkakakilanlan ko” — magpapakita ito ng dalawang emoji at maghihintay. Sa device na may hawak na ng pagkakakilanlan mo, pumunta sa Profile → Magdagdag ng isa pang device: kusang lilitaw doon ang hiling. Tingnang tugma ang mga emoji, i-tap ang “I-link ito”, at kusang papasok ang bagong device. Kailangang nasa parehong network ang dalawang device (sa iisang phone, lagi silang ganoon). Nasa ibang lugar, o walang server ang komunidad? Sa “Iba pang paraan para mag-link”, may 6 na salitang code na puwedeng bigkasin at isang QR na tuluyang lumalaktaw sa mga server.",
          "Dalawang bagay ang hindi sasama: ang kasaysayan ng mga mensahe mo (naka-encrypt ang mga mensahe sa sariling mga susi ng bawat device, kaya nananatili sila kung saan sila natanggap) at ang mga setting ng bawat device tulad ng tema at laki ng teksto. Lahat ng iba pa — mga paskil, proyekto, event, miyembro, palitan — ay sasama sa mismong pag-link, kaya kamukha agad ng bagong device ang luma at tuloy-tuloy ang pag-sync pagkatapos."
        ]
      },
      {
        "id": "link-safety",
        "question": "Ano ang dapat kong bantayan kapag nagli-link ng mga device?",
        "answer": [
          "Tatlong simpleng gawi ang nagpapanatiling ligtas ng pag-link. Una: i-tap lang ang “I-link ito” kapag IKAW ang may hawak ng device na humihiling, at tugma ang dalawang emoji sa screen mo sa dalawang nasa screen nito. Kung may lumitaw na hiling habang wala ka namang inili-link, balewalain ito — baka may nagbabakasakali sa network mo, at walang mangyayari hangga't hindi ka pumindot.",
          "Pangalawa: pagkapasok ng bagong device, sulyapan ang pangalang bumabati sa iyo. Kung hindi ikaw iyon, may nagsingit ng sarili niyang pagkakakilanlan sa paglilipat mo — walang nakuha sa iyo, at buburahin nang malinis ng button na “Hindi ako ito” ang device para makapagsimula ka ulit.",
          "Pangatlo, ang tapat na maliliit na letra: ang tap-para-mag-link ay dumadaan sa sariling server ng komunidad mo, na nagpapasa lang ng selyadong datos na hindi nito kayang basahin — pero kung hindi mo pinagkakatiwalaan ang nagpapatakbo ng server na iyon, gamitin na lang ang paraang QR sa ilalim ng “Iba pang paraan para mag-link”. Ang QR ay mula screen patungong camera, nang walang server na kasangkot.",
          "Isang praktikal na paalala: kailangan ng tap-para-mag-link na mukhang nasa parehong network ang dalawang device. Ang VPN o iCloud Private Relay ay puwedeng tahimik na humarang — kung hindi lumilitaw ang hiling, i-pause muna ito nang isang minuto at humiling ulit, o gamitin ang “Iba pang paraan para mag-link”."
        ]
      }
    ]
  },
  {
    "id": "community",
    "title": "Komunidad at imbitasyon",
    "entries": [
      {
        "id": "internet-outage",
        "question": "Ano pa ang magagawa natin kapag nawala ang internet — halimbawa, sa panahon ng bagyo?",
        "answer": [
          "Higit pa sa inaakala mo, dahil ang buong app ay ginawa mismo para dito. Dala na ng device mo ang lahat: ang paskilan, ang talaan ng buong komunidad, ang listahan ng mga miyembro, ang pagkakakilanlan mo. Tuloy ka lang sa pagbabasa, pagpapaskil, at pagkukumpirma — bawat pagbabago ay pumipila nang ligtas at kusang naipapadala sa sandaling makakonekta ka ulit. Walang nawawala habang patay ang internet.",
          "Kung may malapit sa iyo na kailangan ng tulong NGAYON: tulungan siya, tapos kumpirmahin ninyo ito nang magkasama, nang personal. Sa pahina ng paskil, piliin ang “Kumpirmahin nang harapan” — magpapakita ng code ang isang phone, ii-scan ito ng isa pa at pipirma. Itatago ng dalawang phone ang tala at iuuwi ito pagbalik ng internet.",
          "Kung may pinapatakbong silungan ang komunidad mo — isang maliit na backup na server na laging nakahanda para sa mga oras na walang internet — sumali sa Wi-Fi nito kapag patay ang internet at basta gagana ulit ang app para sa lahat ng nasa silungan: aagos ang mga paskil, makukumpirma ang tulong, walang kailangang i-set up. Itanong sa nagpapatakbo ng server ng komunidad mo kung may silungan na; kung wala pa, ang docs/offline-resilience.md ang resipe para magtayo ng isa habang maganda pa ang panahon.",
          "Puwede ka pang mag-imbita ng bagong tao. Gumagana ang code ng imbitasyon mo nang walang kahit anong internet — pirmado ito ng sarili mong susi at may bisa nang dalawang linggo — kaya ipakita ang QR code o iabot ang link sa papel at hayaan siyang magtago ng litrato nito. Sa silungan, puwede niyang i-install ang app at sumali noon din; kung hindi, matatapos niya ang pagsali sa sandaling magkaroon siya ng kahit anong koneksyon. Ang tanging hindi puwedeng mangyari nang walang network kahit saan ay ang pag-download ng app mismo — matiyagang maghihintay ang imbitasyon hanggang makaya niya.",
          "Habang maganda ang panahon, iyon ang oras para ilipat ito sa papel: kayang mag-print ang pahinang Imprastruktura ng komunidad ng kit para kapag walang internet — poster sa pader at mga card na pambulsa na may mga hakbang ng pagsali sa silungan — para buhay pa rin ang mga tagubilin kahit patay na ang mga baterya."
        ]
      },
      {
        "id": "add-a-node",
        "question": "Ano ang magpapanatiling ligtas sa komunidad na ito kung may kumuha ng server natin?",
        "answer": [
          "Dalawang bagay, at sila ang puso ng kung paano naiiba ang pagkakagawa ng Understoria sa mga app ng korporasyon. Una: dala na ng device ng bawat miyembro ang kumpleto at pirmadong kopya ng komunidad — ang paskilan, ang talaan ng buong komunidad, ang mga proyekto, lahat ito. Walang makukuha ang pagsamsam sa server na wala pa sa phone ng lahat, at ang kapalit na server ay mapupunuan ulit mula sa mga kopyang iyon.",
          "Pangalawa: hindi kailangang iisang makina ang server, o makina ng iisang tao. Kahit sinong miyembro ay puwedeng magpatakbo ng node ng komunidad — sapat na talaga ang lumang laptop sa aparador na nakasara ang takip. Bawat dagdag na node ay nangangahulugang walang iisang tao na puwedeng ipitin ng grupong kontra-unyon o kontra-tulungan para wasakin ang komunidad. Ipinapakita ng card na Katatagan ng komunidad sa Pintig kung ilang ugat na ang pinausbong ng komunidad mo.",
          "Handa nang magdagdag ng isa? Nasa docs ng proyekto ang sunod-sunod na hakbang — ang docs/add-a-node.md sa Understoria repository ay gumagabay sa pagbibigay ng bagong buhay sa lumang computer, at sinasaklaw ng gabay ng operator ang mga detalye. Isang hapon lang ang kakailanganin, at matutulungan ka ng miyembrong nagpapatakbo ng kasalukuyan mong server na magpalitan kayo ng dalawang setting na magdurugtong sa dalawang node."
        ]
      },
      {
        "id": "start-a-community",
        "question": "Puwede ba akong magsimula ng ganitong komunidad para sa kapitbahayan ko?",
        "answer": [
          "Oo — at hindi mo kailangan ng pahintulot ninuman, ng GitHub account, o ng app store. Ang Understoria ay malayang software, at inaalok mismo ng server ng komunidad na ito ang kumpleto nitong source code para i-download.",
          "Nakasulat sa loob mismo ng app ang buong daan: buksan ang Menu (kanang itaas) → Imprastruktura ng komunidad → ang card na “Ang software mismo” → “Magsimula ng bagong komunidad mula sa download na ito”. Gagabayan ka nito mula sa pag-download at pagsusuri ng code hanggang sa pagpapatakbo ng sarili mong server, sa simpleng wika."
        ]
      },
      {
        "id": "invite-someone",
        "question": "Paano ko iimbitahan ang isang kakilala?",
        "answer": [
          "Una: ang pag-iimbita ay gawain ng mga pinagkakatiwalaang miyembro. Hangga't wala pang dalawang pinagkakatiwalaang miyembro ang nanagot para sa iyo (bilang na ang imbitasyong pinagsalihan mo bilang una), ipinapakita ng button ng imbitasyon ang progreso mo sa halip. Pinoprotektahan nito ang komunidad — hindi makakapag-imbita ng dagdag na mga estranghero ang kadena ng mga estranghero. Para makarating doon, gawin ang pinag-uukulan mismo ng app: tumulong sa mga tao. Kapag kilala ka na ng mga kapitbahay, kahit sinong pinagkakatiwalaang miyembro ay puwedeng managot para sa iyo mula sa profile mo.",
          "Ang pinakamabilis na daan: buksan ang Menu (kanang itaas) at piliin ang Imbitahan ang kakilala mo — dadalhin ka nito diretso sa card ng mga imbitasyon. Ang paikot na daan ay Profile → “Mga imbitasyong inilabas mo”.",
          "I-tap ang Gumawa ng link ng imbitasyon at makakakuha ka ng link na isang beses lang magagamit. Ibahagi ito nang harapan, sa Signal, o sa kahit anong channel kung saan matitiyak mong nakarating talaga ito sa taong sinadya mo. Huwag ipaskil sa publiko ang mga link ng imbitasyon.",
          "Puwede mo ring ipakita ang imbitasyon bilang QR code para sa harapang pagbabahagi. Bawat imbitasyon ay isang beses lang magagamit, kusang nag-e-expire, at puwedeng bawiin mula sa Profile → “Mga imbitasyong inilabas mo” hangga't hindi pa ito nagagamit. Kapag may sumali sa imbitasyon mo, ituturing iyon na panagot mo para sa kanya — pangalan mo ang nakasandal sa pagsali niya, kaya mag-imbita ng mga taong talagang kilala mo."
        ]
      },
      {
        "id": "how-vouching-works",
        "question": "Paano gumagana ang pananagot?",
        "answer": [
          "Ang panagot ay pirmado at publikong pahayag na kilala mo ang taong ito at nananindigan ka sa lugar niya sa komunidad. Nagiging “pinagkakatiwalaan” ang isang tao kapag dalawang magkaibang miyembro na ang nanagot para sa kanya — at ang pag-iimbita ay kusang bilang na panagot mo, kaya ang pananagot nang mano-mano ang paraan mo para tumindig sa likod ng taong dinala ng iba.",
          "Nananagot ka mula sa pahina ng miyembro: i-tap ang pangalan niya kahit saan sa app at hanapin ang bahaging Panagot. Lumilitaw ang button kapag talagang makapagdaragdag ng tiwala ang panagot mo — pinagkakatiwalaan ka na mismo, naglilikom pa siya ng mga panagot, at hindi ka pa nananagot para sa kanya. Kung hindi, ipinapaliwanag ng bahaging iyon kung bakit hindi, para hindi ka na nanghuhula.",
          "Sulit itong pag-isipan sandali: ang pangalan mo ang nakasandal sa pangalan niya, kitang-kita at permanente — hindi mababawi sa app ang panagot. Kung pagsisihan mo ito balang araw, ang daan ay pakikipag-usap sa komunidad mo, hindi isang button. Managot para sa mga taong talagang kilala mo.",
          "Ang pagkakaroon ng mga nanagot para sa iyo ang nagbubukas din ng mga kakayahang pantiwala ng komunidad: pag-iimbita ng mga bagong tao, pananagot para sa iba, pagpirma sa mga pagtanggal ng miyembro — at nagiging puwedeng i-tap ng lahat ang mga link na ibinabahagi mo (bago iyon, nakikita ng mga tao ang buong address pero hindi ito puwedeng i-tap — panangga laban sa masasamang link, hindi mantsa sa iyo). Sa sandali ring iyon nawawala ang maluwag namang takdang dami ng paskil bawat araw ng isang bagong miyembro."
        ]
      },
      {
        "id": "disagree-with-member",
        "question": "Paano kung hindi ko kasundo ang isa pang miyembro?",
        "answer": [
          "Kausapin mo muna siya. Karamihan ng hindi pagkakasundo ay hindi tungkol sa app at hindi kailangan ng pakikialam ng app.",
          "Kung tungkol ito sa isang partikular na palitan, gamitin ang May hindi tama — markahan sa detail page ng paskil. Kung tungkol ito sa asal na lampas sa iisang palitan, puwede kang magbukas ng hindi pagkakasundo mula sa Profile → Hindi pagkakasundo — dumadaan ang mga ito sa bukas na proseso ng mungkahi ng komunidad, dahil walang admin na magpapasya para sa iyo.",
          "At kung ang kailangan mo lang ay distansya mula sa isang tao, laging puwede rin ang pag-block — tingnan ang “Paano kung may gumagambala sa akin?” sa ilalim ng Mga mensahe."
        ]
      },
      {
        "id": "member-removal",
        "question": "Paano gumagana ang pagtanggal ng isang tao mula sa komunidad?",
        "answer": [
          "Ang pagtanggal ang pinakamabigat na kayang gawin ng komunidad na ito, at ganoon ito itinuturing ng app. Pinakahuling hakbang ito: pinipigilan na ng personal na pag-block ang content ng isang tao na umabot sa iyo, kayang tutulan ng hindi pagkakasundo ang isang partikular na palitan, at mas marami ang naaayos ng pag-uusap kaysa sa alinman sa dalawa.",
          "Walang iisang tao na makakapagtanggal ng kahit sino — hindi ang nag-aayos, at hindi ang nagpapatakbo ng server. Kailangan ng ilang miyembro (itinatakda ng komunidad mo ang bilang at ipinapakita ito sa lahat) na tig-isang pipirma ng sarili nilang pangalan sa iisang publikong tala. Nagsisimula ang pagmumungkahi sa profile ng miyembro; ang mga kasamang pirma ay ibinibigay nang personal ng bawat isa, mula sa pahinang Mga mungkahi.",
          "Ang pagtanggal ay publiko sa loob ng komunidad — kung sino ang tinanggal, kailan, bakit, at kung sino-sino mismo ang pumirma, lahat nakikita sa pahinang Mga mungkahi. Ang mga lihim na pagpapalayas ang nagpapabulok sa mga komunidad.",
          "Hindi ito pagbura. Nananatili ang mga nakaraang palitan ng tinanggal na miyembro — nakasandal sa mga ito ang talaan ng ibang miyembro — at lahat ng nasa sarili niyang device ay sa kanya pa rin. Ang natatapos ay ang access niya: humihinto ang pagbabasa, at tinatanggihan ang bagong pagsusulat. Ang mga taong inimbitahan niya bago ang pagtanggal ay mananatiling miyembro; ang mga hindi pa nagagamit niyang imbitasyon ay kasabay na mawawalan ng bisa.",
          "At puwedeng muling mabuksan ang pinto: ang pagbabalik ng pagiging miyembro ay nangangailangan ng parehong bilang ng pirma, na sinisimulan mula mismo sa tala ng pagtanggal sa pahinang Mga mungkahi."
        ]
      },
      {
        "id": "lurking-ok",
        "question": "Puwede ba akong tumingin-tingin lang nang hindi nagpapaskil ng kahit ano?",
        "answer": [
          "Oo. Ang pagbabasa ng mga inaalok at hinihingi ng iba ay lehitimong paraan para makibahagi. May mga miyembrong ilang linggong nanonood muna bago ipaskil ang una nilang kailangan; may mga hindi kailanman nagpapaskil at tumutugon lang sa iba. Parehong may puwang dito."
        ]
      },
      {
        "id": "who-sees-what",
        "question": "Sino ang makakakita ng ipinapaskil ko?",
        "answer": [
          "Lahat ng nasa node ng komunidad mo ay nakakakita ng mga paskil mo, ng pangalang pantawag mo, ng kapitbahayan mo (kung naglagay ka), at ng kasaysayan ng mga palitan mo. Ang mga kaibigang node ay tumatanggap ng mga pirmadong tala na inilalabas mo — mga paskil, kumpirmadong palitan, event — sa ilalim ng publiko mong susi, hindi ng pangalang pantawag mo. Dahil lumilipat ang mga palitan sa mga magkakaibigang komunidad, makikita ng isang kaibigang node ang galaw ng palitan ng susi mo at makukuwenta nito ang kabuuang oras nito; ang hinding-hindi umaalis sa komunidad mo: ang mga sagot mo kung dadalo, ang pagsusulat ng pangalan sa mga turno, mga gawain sa proyekto, mga pag-block, mga draft, at mga mensahe.",
          "Iba ang mga direktang mensahe: naka-encrypt sila end-to-end sa pagitan ng device mo at ng device ng kausap mo, kaya kayong dalawa lang ang makakabasa — hindi ang node, hindi ang ibang miyembro. Tingnan ang “Paano ako magme-message sa isa pang miyembro?” sa ilalim ng Mga mensahe para sa mga detalye."
        ]
      },
      {
        "id": "beta-status",
        "question": "Gaano na katapos ang app na ito? Ano ang hindi ko dapat ilagay dito?",
        "answer": [
          "Ang Understoria ay beta na software. Malaking bahagi ng code nito ay isinulat gamit ang mga AI tool at sinuri ng mga tao, at wala pa itong independiyenteng security audit.",
          "Totoo at subok ang mga proteksyong nakikita mo — naka-encrypt end-to-end ang mga mensahe, pirmado ang mga tala, gumagana ang pagbura sa oras ng panganib. Pero ang ibig sabihin ng beta: posible ang mga bug, kasama ang mga hindi pa natatagpuan ninuman.",
          "Ginawa ito para sa pag-uugnay ng pang-araw-araw na tulungan ng magkakapitbahay. Huwag maglagay dito ng kahit anong makakasakit sa iyo o sa iba kapag tumagas — mga ID mula sa gobyerno, detalye ng kalusugan o imigrasyon, o kahit anong sasabihin mo lang nang harapan at pribado. Kapag nag-aalinlangan, sabihin na lang ito nang personal."
        ]
      }
    ]
  },
  {
    "id": "messages",
    "title": "Mga mensahe",
    "entries": [
      {
        "id": "message-someone",
        "question": "Paano ako magme-message sa isa pang miyembro?",
        "answer": [
          "Buksan ang kahit anong paskil at i-tap ang button na I-message para makipag-ugnayan — mapupunta ito sa nagpaskil, o, kung sarili mong paskil, sa taong tumutulong sa iyo. Sadyang nagsisimula sa isang paskil ang mga pag-uusap — pinapanatili nitong nakatali ang pagme-message sa aktuwal na tulong, hindi sa basta pakikipag-ugnayan sa hindi kakilala. Buksan ang Mensahe sa navigation para makita ang lahat ng pag-uusap mo at makapaghanap sa loob ng mga ito.",
          "Ang mga mensahe ay naka-encrypt end-to-end at naglalakbay mula device patungong device. Kayo lang ng sinusulatan mo ang makakabasa — ipinapasa sila ng node ng komunidad pero hindi nito nakikita ang loob.",
          "Sadyang walang read receipt at walang typing indicator. Walang makakakita kung kailan mo (o kung) nabasa ang isang mensahe, at walang nanonood sa iyo habang bumubuo ka ng sagot. Magbasa kapag nagbabasa ka, sumagot kapag may kaya ka — walang sasabihin ang app sa kahit kanino, alinman sa dalawa."
        ]
      },
      {
        "id": "voice-notes",
        "question": "Paano gumagana ang mga voice note? Hindi gumagana ang mikropono ko.",
        "answer": [
          "Sa isang pag-uusap, nasa message box ang button ng mikropono habang walang laman ito — magsimulang mag-type at magiging Ipadala ito; burahin ang teksto at babalik ang mic. I-tap ito para mag-record ng voice note na hanggang 45 segundo, pakinggan muna bago may lumabas na kahit ano, at ipadala lang kapag kuntento ka na. Ang mga voice note ay selyado end-to-end katulad ng mga tina-type na mensahe — kayo lang ng kausap mo ang makakarinig.",
          "Iba ang voice sa mga paskil sa Paskilan. Ang mga paskil ay content ng komunidad, kaya ang recording na ikinakabit mo sa isang paskil ay maririnig ng buong komunidad — kapareho ng mga salitang isusulat mo roon.",
          "Kung ayaw magsimula ng mikropono: humihingi ng pahintulot ang browser o phone mo sa unang beses kang magre-record. Kung tinanggihan iyon — kahit aksidente — mananatiling naka-block ang pag-record hanggang payagan mo ang mikropono para sa site na ito sa mga setting ng browser o phone mo. Kapag pinayagan na, bumalik at subukan ulit."
        ]
      },
      {
        "id": "someone-bothering-me",
        "question": "Paano kung may gumagambala sa akin?",
        "answer": [
          "Puwede mo siyang i-block. Buksan ang pag-uusap ninyo at piliin ang I-block ang contact mula sa menu sa itaas, o gamitin ang opsyon ng pag-block sa pahina niya bilang miyembro.",
          "Ang pag-block ay agaran at pribado. Hindi mo na makikita ang mga paskil, event, komento, at mensahe niya, at hindi na kayo makakapag-message, makakapanagot, makakakuha ng paskil, o makakapag-imbita sa isa't isa. Hindi siya sasabihan — walang notification, walang marka sa profile niya, walang makikita ang iba.",
          "HINDI humihingi ng pagpapasya ng komunidad ang pag-block. Walang moderator na aabisuhan, walang hindi pagkakasundo na bubukas, at mananatili ang mga nakaraang palitan sa dati nilang ayos. Kung gusto mong magsalita ang komunidad, magbukas ng hindi pagkakasundo mula sa Profile → Hindi pagkakasundo — magkasabay na gumagana nang maayos ang pag-block at ang hindi pagkakasundo. Ang block ang nagbibigay sa iyo ng katahimikan ngayon; ang hindi pagkakasundo ang dumadaan sa proseso ng komunidad sa sarili nitong bilis.",
          "Puwede mong balikan, baguhin, o bawiin ang mga block mo anumang oras sa Mga setting → Mga na-block na contact."
        ]
      }
    ]
  },
  {
    "id": "events",
    "title": "Mga event at ang kalendaryo",
    "entries": [
      {
        "id": "community-events",
        "question": "Paano gumagana ang mga event ng komunidad?",
        "answer": [
          "Kahit sino ay puwedeng gumawa ng event: buksan ang Kalendaryo at i-tap ang button na +. Bigyan ito ng oras, lugar, at paglalarawan, at lilitaw ito sa kalendaryo ng komunidad para sa lahat.",
          "I-tap ang isang event para sumagot kung dadalo ka — Dadalo, Baka dumalo, o Hindi dadalo. Nananatili sa node ng komunidad na ito ang sagot mo: makikita ng nag-aayos at ng iba pang sumagot ang pangalan mo, ang mga miyembrong hindi pa sumasagot ay bilang lang ang nakikita, at hinding-hindi makikita ng mga kaibigang node ang sagot mo. Kapag pinalitan mo ang sagot mo ng Hindi dadalo, agad na aalis ang pangalan mo sa listahan.",
          "May mga event ding may mga turno — mga puwesto sa oras kung saan kailangan ng nag-aayos ng tiyak na bilang ng kamay, gaya ng mga taga-ayos ng lugar o salitan sa paghahain. Kapag isinulat mo ang pangalan mo sa isang turno, sabay ka na ring sinasagot na Dadalo sa event. Gumagana ang listahan ng turno tulad ng listahan ng mga sasagot: nananatili ito sa node ng komunidad na ito, at ang pagpapalit ng sagot mo sa Hindi dadalo ay sabay ka ring tinatanggal sa mga turno.",
          "Hindi na nababago ang event matapos itong magawa — ang pirmadong event ay nananatiling eksakto kung ano ang sinabihan ng mga tao ng oo. Kapag nagbago ang mga detalye, kinakansela ito ng nag-aayos at gumagawa ng bago. Kapag nakansela ang event na sinagot mong dadalo ka, makakakita ka ng paalala tungkol dito (kasama ang dahilan ng nag-aayos, kung nagbigay siya) sa susunod mong pagbukas ng app."
        ]
      }
    ]
  },
  {
    "id": "projects",
    "title": "Mga proyekto at gawain",
    "entries": [
      {
        "id": "task-follows",
        "question": "Bakit may nakasulat sa gawain na “Kasunod ng: …”?",
        "answer": [
          "Ang mga gawain sa proyekto ay puwedeng magkakasunod. Ang ibig sabihin ng “Kasunod ng” ay natural na dumarating ang gawaing ito pagkatapos ng iba — ibuhos muna ang pundasyon bago itayo ang mga dingding. Walang naiipit at walang nakaharang kaninuman; pagkakasunod-sunod lang ito.",
          "Puwede mo pa ring kunin ang isang kasunod na gawain kahit kailan mo gusto. Ang tanging pagkakaiba: sadyang hindi ka muna kukumustahin ng app tungkol dito hanggang matapos ang naunang gawain — walang saysay na itanong kung kumusta na kung wala pa ang pundasyong sinasandalan nito. Kasama mo ang sistema sa paghihintay, hindi ikaw ang hinihintay nito."
        ]
      }
    ]
  }
];
