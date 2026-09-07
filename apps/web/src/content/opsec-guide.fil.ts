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

export const OPSEC_GUIDE_FIL: readonly GuideSection[] = [
  {
    "id": "device",
    "title": "Sa device mo",
    "body": [
      "I-lock ang phone mo gamit ang anim na digit na PIN o matibay na passphrase. I-on ang full-disk encryption (naka-on na ito sa bawat modernong phone mula sa simula; sa laptop, gamitin ang FileVault, BitLocker, o LUKS). Panatilihing updated ang OS mo — karamihan sa mga totoong atake ay sumasakay sa mga bug na na-patch na."
    ]
  },
  {
    "id": "accounts",
    "title": "Tungkol sa pagkakakilanlan mo",
    "body": [
      "Hindi humihingi ang Understoria ng email o numero ng telepono. Kung may nagsasabing mula siya sa Understoria at hinihingi niya ang mga ito, phishing iyon.",
      "Ang pagkakakilanlan mo ay isang susing cryptographic sa device na ito. Puwede kang mag-export ng backup — itago ito sa ligtas na lugar na offline. Kadalasan, mas maaasahan pa ang papel na naka-print sa loob ng drawer kaysa sa cloud.",
      "Kapag nawala o nanakaw ang phone mo, ang lock na inilagay mo sa susi mo (ang passkey mong fingerprint/mukha/PIN, o isang passphrase) ang siyang nagpoprotekta rito — kaya nga inaalok iyon sa unang pagpasok mo pa lang. Walang sentral na pagpapawalang-bisa at walang sinumang may switch na maipipindot para sa iyo: sabihin sa komunidad mo ang nangyari para malaman ng lahat na hindi na dapat pagkatiwalaan ang pagkakakilanlang iyon, saka magsimula sa panibago gamit ang bagong susi (Profile → Emergency → Burahin nang tuluyan sa bawat device na may hawak pa ng luma)."
    ]
  },
  {
    "id": "communication",
    "title": "Tungkol sa komunikasyon mo",
    "body": [
      "Huwag pag-usapan ang pag-oorganisa sa mga device o network ng employer. Ang mga laptop ng trabaho at corporate WiFi ay nagtatala — at kung minsan ay nagmamatyag — ng aktibidad.",
      "Huwag i-screenshot ang laman ng platform para ipasa sa labas ng grupo. Kapag lumabas na ito sa Understoria, hindi na ito protektado.",
      "Para sa mga sensitibong usapan, magkita nang personal. Mas mabuti ang sampung minutong lakad kaysa sa dalawang oras na thread ng mensahe."
    ]
  },
  {
    "id": "social",
    "title": "Tungkol sa bakas mo sa social media",
    "body": [
      "Ihiwalay ang pangalang pantawag mo sa Understoria sa pagkakakilanlan mo sa trabaho. Ang paggamit ng ibang pangalan ay bahagi ng disenyo, hindi tanda ng masamang intensyon.",
      "Huwag mag-post tungkol sa gawaing pag-oorganisa sa pampublikong social media nang nakakabit ang legal na pangalan mo. Kahit ang mga post na “pangkalahatang inspirasyon” lang ay bumubuo ng pattern na kayang pagdugtung-dugtungin ng determinadong nagmamatyag."
    ]
  },
  {
    "id": "wrong",
    "title": "Kung parang may mali",
    "body": [
      "Kung may gustong maidagdag na hindi mo kilala, dahan-dahan lang. Humingi ng panagot.",
      "Kung ang isang dati nang miyembro ay nagsimulang magtanong ng kakaiba tungkol sa listahan ng mga miyembro o kung sino ang tumulong kanino — tandaan mo iyon. Kausapin ang ibang miyembro. Nangyayari talaga ang impiltrasyon.",
      "Kung may vendor, employer, o opisyal na humihiling na magbahagi ka ng impormasyon tungkol sa mga miyembro o sa mga aktibidad: hindi mo kailangang gawin iyon. Huwag mo itong harapin nang mag-isa — kausapin muna ang mga miyembrong pinagkakatiwalaan mo bago sumagot ng kahit ano."
    ]
  },
  {
    "id": "rights",
    "title": "Alamin ang mga karapatan mo",
    "body": [
      "Hindi mo kailangang sagutin ang mga tanong ng pulis nang walang abogadong kasama. Hindi mo kailangang pumayag sa paghalughog ng device mo — kadalasan, kailangan nila ng warrant. Hindi mo kailangang ituro ang ibang miyembro. May karapatan kang manahimik.",
      "Ang fingerprint at ang mukha ay hindi mga salita. Sa maraming lugar, itinuturing ng korte ang biometric na pag-unlock na parang pisikal na susi — puwedeng idiin ng pulis ang daliri mo sa phone o iharap ang phone sa mukha mo — samantalang ang isang bagay na alam mo, tulad ng passphrase, ay itinuturing na testimonya na may karapatan kang tanggihang ibigay. Iba-iba ito sa bawat bansa at bawat korte, kaya magtanong sa isang lokal na organisasyong legal; pero kung may posibilidad na ma-detain ka, ipagpalagay mong mapipilit nila ang biometric at hindi ang passphrase.",
      "Matutuhan ang hard-lock na galaw ng phone mo bago mo pa ito kailanganin. Sa iPhone, pindutin nang sabay ang side button at ang alinmang volume button sa loob ng dalawang segundo (hanggang lumitaw ang power-off screen) — mula roon, naka-off ang Face ID at Touch ID hanggang mailagay ang passcode. Sa Android, pindutin nang matagal ang power button saka i-tap ang Lockdown (kung wala ito, i-on muna sa Settings → Display → Lock screen). Praktisin ito hanggang magawa mo na nang hindi iniisip.",
      "Sa loob mismo ng Understoria: kung kasama sa mga panganib na pinaghahandaan mo ang pinipilit na pag-unlock, protektahan ang susi mo gamit ang passphrase sa halip na fingerprint — o alisin ang pag-unlock gamit ang fingerprint (Profile → Mga setting → Seguridad) bago ang isang protesta, pagtawid ng border, o anumang sandaling posibleng ma-detain ka; puwede mo itong ibalik pagkatapos. Tanging ang passphrase na ita-type mo ang may dala ng karapatang-tumangging iyon mula dulo hanggang dulo. At tandaan: may pindutan ng panganib (Profile → Emergency → Burahin nang tuluyan) para sa sandaling hindi na sapat ang pag-lock.",
      "May mga lokal na organisasyong legal (NLG sa US, LDAN sa UK) na nagbibigay ng mga card na “Alamin ang mga karapatan mo” na akma sa hurisdiksyon mo. Magtago ka ng isa sa wallet mo."
    ]
  }
];
