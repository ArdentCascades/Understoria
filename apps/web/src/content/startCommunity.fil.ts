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
import type { StartCommunityGuide } from "./startCommunity";

export const START_COMMUNITY_FIL: StartCommunityGuide = {
  "intro": [
    "Ang komunidad mo ay pinapatakbo ng Understoria. Puwede kang magsimula ng isa para sa kapitbahayan mo, sa pinagtatrabahuhan mo, sa pamilya mo sa kabilang dulo ng lungsod — gamit lang ang sariling server ng komunidad mo. Walang GitHub account, walang app store, hindi kailangan ng Docker, walang pahintulot mula kahit kanino.",
    "Nagagawa ito dahil ang Understoria ay malayang software (naka-lisensya sa AGPL) at bawat server ay nag-aalok ng sarili nitong source code — ang eksaktong code na pinapatakbo nito. Hindi iyon basta kabutihang-asal: hinihingi ito ng lisensya, at ipinasok ito ng app sa sarili nitong pagkakagawa para walang iisang kompanya, host, o repository ang kailanman maging tanging tahanan ng software. Bawat komunidad ay binhi.",
    "Para kanino ito: sa taong komportableng sumunod nang maingat sa mga tagubilin sa terminal, pero hindi pa kailanman nakapag-deploy ng server. Kung bago sa iyo ang mga salitang “terminal” at “command”, gawin ito sa tabi ng miyembrong nakagawa na — ganoon naman talaga dapat maglakbay ang kaalamang ito."
  ],
  "steps": [
    {
      "id": "what-you-need",
      "title": "1. Ang mga kakailanganin mo",
      "paragraphs": [
        "Computer na may terminal (para sa Linux o Mac ang mga command sa ibaba; puwede ang Raspberry Pi). Mga 15 minuto para subukan ang app sa sarili mong makina. Ang pag-deploy ng totoong server para sa mga miyembro ay mas mahabang hapon at nangangailangan ng domain name at ng maliit na server — sinasaklaw lahat iyon ng mga gabay na kasama sa download."
      ]
    },
    {
      "id": "get-the-software",
      "title": "2. Kunin ang software",
      "paragraphs": [
        "Ang madaling paraan: sa komunidad ng mismong pahinang ito — o sa kahit anong Understoria na komunidad na maaabot mo — buksan ang Menu (kanang itaas) → Imprastruktura ng komunidad → ang card na “Ang software mismo”. I-download ang DALAWANG file: ang source archive at ang mga checksum. Ilagay sila sa iisang folder.",
        "Ang paraang terminal (palitan ang address ng sa komunidad mo):",
        "May mga server ding nag-aalok ng “Bundle ng buong kasaysayan”. Mas malaki ito, at kung naka-install ang git sa iyo, ito ang mas mainam na download: makukuha mo ang buong kasaysayan ng pag-develop at normal na paghila ng mga update sa hinaharap. Kung ang bundle ang kinuha mo, buksan ito gamit ang git sa halip na tar:"
      ],
      "code": [
        "mkdir understoria-download && cd understoria-download\ncurl -fsSO https://YOUR-COMMUNITY.example/source/understoria-source.tar.gz\ncurl -fsSO https://YOUR-COMMUNITY.example/source/SHA256SUMS",
        "curl -fsSO https://YOUR-COMMUNITY.example/source/understoria.bundle\ngit clone understoria.bundle understoria"
      ]
    },
    {
      "id": "verify",
      "title": "3. Suriin ang na-download mo",
      "paragraphs": [
        "Ang checksum ay fingerprint na kinukuwenta mula sa eksaktong mga byte ng file. Kung nagbago kahit isang byte sa daan papunta sa iyo — paputol-putol na koneksyon, naputol na download — magbabago nang buo ang fingerprint. Suriin ito bago magtayo ng kahit ano. Ang gusto mong makita ay “OK”. Kahit ano pang iba: burahin at i-download ulit.",
        "Maging tapat sa sarili tungkol sa pinatutunayan nito: galing ang checksum sa parehong server ng file, kaya pinatutunayan nitong buo ang pagdating ng download — hindi nito mapatutunayang walang nagpalit ng code sa server na iyon. Araw-araw mo namang ipinagkakatiwala iyon sa nagpapatakbo ng node mo (siya ang naghahain sa iyo ng mismong tumatakbong app na ito). Para sa hiwalay na pagpapatibay, kunin ang mga checksum ng parehong bersiyon mula sa pangalawang komunidad at ikumpara — kailangang magsabwatan ang dalawang operator para malusutan iyon.",
        "Tapos, buksan ang archive. Sa kasalukuyang folder ito bumubukas, kaya gumawa muna ng isa:"
      ],
      "code": [
        "# Linux:\nsha256sum -c SHA256SUMS\n# Mac:\nshasum -a 256 -c SHA256SUMS",
        "mkdir understoria\ntar -xzf understoria-source.tar.gz -C understoria\ncd understoria"
      ]
    },
    {
      "id": "try-it",
      "title": "4. Subukan muna bago ka tumaya sa kahit ano",
      "paragraphs": [
        "Kaya mong patakbuhin ang buong app sa sarili mong makina at lakarin ang isang totoong palitan mula simula hanggang dulo. Nasa folder na kabubukas mo lang ang bawat gabay ng proyekto, sa docs folder nito — buksan ang docs/quickstart.md sa kahit anong text editor at sundan ito mula sa unang hakbang. Sa bahaging nagsasabing i-clone ang repository, laktawan iyon: nakaupo ka na sa source folder.",
        "Sulit itong gawin kahit sigurado ka na. Sasalubungin mo ang sarili mo bilang bagong miyembro, magpapaskil ka ng kailangan, at magkukumpirma ka ng palitan — kaya kapag naipit ang una mong totoong miyembro, nakita mo na ang screen niya."
      ]
    },
    {
      "id": "deploy",
      "title": "5. I-deploy ito para sa komunidad mo",
      "paragraphs": [
        "Nasa parehong docs folder ang kumpletong mga gabay sa server, isinulat para mismo sa sandaling ito. Pumili ayon sa kung paano mo gustong patakbuhin: docs/deploy-linode.md (Docker sa maliit na server na mga limang dolyar ang halaga — ang pinakadinaraanang landas, halos automated na ng isang setup script) o docs/deploy-alternatives.md (Podman, o payak na Linux nang walang container — ang tamang hugis para sa hardware na ibinigay lang ng isang tao).",
        "Isang pagsasalin ang gagawin mo habang binabasa sila, dahil parehong nagbubukas sa pag-clone mula sa pampublikong repository: sa bahaging nagsasabing mag-clone sa isang folder sa server, kopyahin na lang doon ang sinuri mong archive at i-extract. Lahat ng iba pa — ang system key, ang settings file, ang mga susi ng tagapagtatag, ang mga backup, ang checklist na “bago magbukas sa publiko” — ay eksaktong pareho pa rin.",
        "Ang pag-update sa hinaharap, nang walang git: i-download ang mas bagong archive mula sa kahit anong server na nagpapatakbo ng mas bagong bersiyon, suriin ito sa parehong paraan, i-extract sa sariwang folder, dalhin ang settings file mo, at i-deploy ulit. Ligtas ang data ng komunidad mo sa buong proseso — hindi ito kailanman nakatira sa source folder."
      ],
      "code": [
        "scp understoria-source.tar.gz SHA256SUMS root@YOUR-SERVER:/opt/\nssh root@YOUR-SERVER\ncd /opt && sha256sum -c SHA256SUMS && mkdir understoria \\\n  && tar -xzf understoria-source.tar.gz -C understoria\ncd understoria"
      ]
    },
    {
      "id": "seed",
      "title": "6. Binhi ka na rin ngayon",
      "paragraphs": [
        "Sa sandaling tumakbo ang server mo, inaalok na nito ang SARILI nitong source sa parehong paraan — kusa, mula sa parehong build. Masusuri ng mga miyembro mo kung ano ang pinapatakbo nila, at ang susunod na kapitbahayan ay makakapagsimula mula sa iyo tulad ng kasisimula mo lang mula sa komunidad mo. Walang iisang punto — hindi ang GitHub, hindi ang mga sumulat ng proyekto, hindi ang kahit sinong operator — ang makakaagaw ng software mula sa lahat nang sabay-sabay.",
        "Dalawang gawi ang nagpapanatiling matibay ng kadena: mag-deploy ulit paminsan-minsan (inaalok ng server mo ang source ng pinapatakbo nito, kaya ang pagpapatakbo ng bago ay pagpupunla rin ng bago), at kilalanin ang server ng pangalawang komunidad — gumagana lang ang pagsusuring ikumpara-ang-dalawang-server sa itaas kung kayang pangalanan ng mga komunidad ang isa't isa."
      ]
    }
  ],
  "closing": [
    "Ang mga tanong na hindi nasasagot ng pahinang ito ay nakatira sa docs folder ng download — ang docs/bootstrap-from-a-node.md ay itong mismong gabay na may mas maraming detalye, at ang docs/operator-guide.md ang pang-araw-araw na manwal para sa sinumang nagpapanatiling tumatakbo ang server."
  ]
};
