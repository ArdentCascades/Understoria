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
import type { GuideSection } from "./member-guide";

export const MEMBER_GUIDE_FIL: readonly GuideSection[] = [
  {
    "id": "what-it-is",
    "title": "Ano ang Understoria",
    "body": [
      "Ang Understoria ay isang bangko ng oras: paraan ng isang komunidad para magpalitan ng tulong, kung saan bawat oras ay pantay ang tala. Ang isang oras ng pag-aayos ng lababo ay katumbas ng isang oras ng pakikinig sa isang tao matapos ang mabigat na araw.",
      "Hindi ito app para maghanap ng raket. Software ito na umaalalay sa isang komunidad na buo na — isang lugar ng trabaho, isang kapitbahayan, isang grupong iisa ang adhikain — na nagtitiwala na sa isa't isa at gusto ng magaan na paraan para manatiling kitang-kita ang tulungan."
    ]
  },
  {
    "id": "credits",
    "title": "Paano umiikot ang oras",
    "body": [
      "Bawat bagong miyembro ay nagsisimula sa 5 oras ng panimulang binhi. Puwede kang humingi ng tulong kahit wala ka pang naibibigay. Ang paghingi ng tulong ay hindi utang — at lalong hindi utang na loob; ito mismo ang bumubuhay sa buong tulungan.",
      "Kapag tumulong ka sa isang tao, kayong dalawa ang magkukumpirma ng palitan. Tumataas ang oras mo nang kasindami ng oras na ibinigay; bumababa naman ang sa kanya. Walang perang lumilipat; walang nagbabantay ng iskor.",
      "Ang oras mo ay kinukuwenta mula sa pinirmahang talaan ng bawat palitan. Kung may mukhang mali, puwede mong suriin ito mismo."
    ]
  },
  {
    "id": "identity",
    "title": "Ang pagkakakilanlan mo",
    "body": [
      "Ang pagkakakilanlan mo ay isang pares ng susing cryptographic. Walang email, walang numero ng telepono, walang password ng account. Ang pangalang pantawag mo ay kung ano ang piliin mo — tawag lang ito, hindi patunay ng pagkakakilanlan.",
      "Puwede mong i-lock ang mga susi sa device mo gamit ang fingerprint, mukha, o PIN ng device (isang passkey — inaalok na agad sa unang pagpasok mo, at gumagana kahit walang internet), o gamit ang passphrase na ita-type mo; puwede ring pareho, at ang passphrase ang magiging backup na daan papasok. Walang anumang tungkol sa lock na ipinapadala sa Apple, Google, o anumang server — sa device mo mismo nangyayari ang pagsusuri.",
      "Kapag nawala ang passphrase mo — o ang phone mo kasama ang fingerprint lock nito — walang sinumang makakapagbalik nito para sa iyo. Iyan ang kapalit ng disenyo — walang sentral na awtoridad na makakabasa ng data mo, kaya wala ring sentral na awtoridad na makakasagip nito. Ang magbabalik sa iyo ay backup na ginawa mo habang maayos pa ang lahat: pangalawang naka-pair na device, mga tagapag-ingat na pinili mo, o isang kit ng pagbabalik — mga isang minuto lang ang bawat isa, sa Mga setting.",
      "Kung kailanganin mong burahin agad ang lahat — nang bahagya (itago ang pagkakakilanlan) o nang tuluyan (magsimula sa panibago) — may pindutan ng panganib sa Profile, sa ilalim ng Emergency."
    ]
  },
  {
    "id": "trust",
    "title": "Tiwala at pagsalubong sa bagong miyembro",
    "body": [
      "Kailangan ng bagong miyembro ng panagot mula sa dalawang kasalukuyang miyembro para maging lubos na pinagkakatiwalaan. Kapag ginamit ng isang tao ang imbitasyon mo, ibinibilang na iyon bilang kusang panagot mo para sa kanya.",
      "Puwedeng magpaskil at kumuha ng tulong ang isang miyembro kahit hindi pa siya lubos na pinagkakatiwalaan — laging bukas ang paghingi — pero may makikitang chip ang komunidad na nagpapakita ng estado ng tiwala, para makapanagot para sa kanya nang mano-mano ang sinumang nakakakilala, kung nararapat."
    ]
  },
  {
    "id": "governance",
    "title": "Mga desisyon at hindi pagkakasundo",
    "body": [
      "Ang mga desisyon sa komunidad ay ginagawa nang sama-sama, hindi ng mga admin — sadyang walang papel na admin o moderator sa app na ito. Ang mga pagpapasyang para sa buong komunidad ay dumadaan sa bukas na mungkahi: kahit sino ay puwedeng magsimula ng isa mula sa Profile → Mga mungkahi ng komunidad, nakikita ito ng lahat, at nananatili itong bukas sa loob ng panahon ng pag-uusap bago ito magsara.",
      "Ang hindi pagkakasundo tungkol sa isang partikular na palitan ay dumadaan sa parehong makinarya: magbukas ng hindi pagkakasundo mula sa Profile → Mga hindi pagkakasundo sa komunidad, magiging mungkahi itong pinag-uusapan ng komunidad, at awtomatikong ipapatupad ang kinalabasan kapag nagsara ito.",
      "Anumang hindi pinagpapasyahan ng app — mga kaugalian, ritmo ng mga pagpupulong, kung paano kayo nag-uusap sa isa't isa — ay nangyayari sa kung anong channel na ginagamit na ng komunidad mo. Itinatala ng app ang mga desisyon; hindi nito pinapalitan ang usapan."
    ]
  },
  {
    "id": "where-from-here",
    "title": "Saan magpapatuloy mula rito",
    "body": [
      "Buksan ang Paskilan para makita kung ano ang inaalok at hinihingi ng mga kapitbahay mo ngayon mismo.",
      "Buksan ang Pintig para makita kung kumusta ang komunidad mo — ang kabuuang oras na napagpalitan, kung saan dumadaloy ang tulong, kung ano na ang naipagdiwang.",
      "Buksan ang Profile para i-update ang mga kakayahan mo at kung kailan ka puwede, mag-imbita ng bagong tao, o basahin ang mas mahahabang gabay na nasa disk."
    ]
  }
];
