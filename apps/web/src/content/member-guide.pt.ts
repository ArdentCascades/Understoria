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

// Portuguese member guide. Ids are stable anchors and are never
// translated; same section and paragraph structure as
// member-guide.ts, enforced by guides.parity.test.ts. Loaded lazily
// via content/bundles/pt.ts.
import type { GuideSection } from "./member-guide";

export const MEMBER_GUIDE_PT: readonly GuideSection[] = [
  {
    id: "what-it-is",
    title: "O que é o Understoria",
    body: [
      "O Understoria é um banco de tempo: uma forma de uma comunidade " +
        "trocar ajuda, com cada hora contando igual. Uma hora " +
        "consertando uma pia vale uma hora ouvindo alguém depois de " +
        "um dia difícil.",
      "Não é um aplicativo para achar bicos. É um software que apoia " +
        "uma comunidade que já existe — um local de trabalho, um " +
        "bairro, um grupo de afinidade — em que as pessoas já confiam " +
        "umas nas outras e querem um jeito leve de manter o apoio " +
        "mútuo visível.",
    ],
  },
  {
    id: "credits",
    title: "Como funcionam os créditos",
    body: [
      "Todo membro novo começa com 5 horas de crédito de semente. " +
        "Você pode pedir ajuda antes de ter dado qualquer uma. Pedir " +
        "não é dívida — é assim que a rede ganha vida.",
      "Quando você ajuda alguém, as duas pessoas confirmam a troca. " +
        "Seu saldo sobe pelas horas dadas; o da outra pessoa desce. " +
        "Nenhum dinheiro muda de mãos; ninguém fica contando pontos.",
      "Seu saldo é calculado a partir de um registro assinado de cada " +
        "troca. Se algo parecer errado, você pode conferi-lo, troca " +
        "por troca.",
    ],
  },
  {
    id: "identity",
    title: "Sua identidade",
    body: [
      "Sua identidade é um par de chaves criptográficas. Não há " +
        "e-mail, número de telefone nem senha de conta. Seu nome " +
        "visível é o que você escolher — é um rótulo, não uma " +
        "credencial.",
      "Você pode bloquear as chaves guardadas no dispositivo com sua " +
        "digital, seu rosto ou o PIN do dispositivo (uma passkey — " +
        "oferecida já nas boas-vindas, e que funciona sem internet " +
        "nenhuma), ou com uma frase secreta que você digita; também " +
        "dá para ter os dois, com a frase secreta como porta de " +
        "entrada reserva. Nada sobre esse bloqueio é enviado à Apple, " +
        "ao Google ou a servidor nenhum — a verificação acontece no " +
        "seu dispositivo.",
      "Se você perder sua frase secreta — ou o telefone com o " +
        "bloqueio por digital — ninguém pode recuperá-la por você. O " +
        "acordo é este: nenhuma autoridade central pode ler seus " +
        "dados, e por isso nenhuma autoridade central pode " +
        "resgatá-los. O que traz você de volta é uma cópia de " +
        "segurança feita enquanto tudo estava bem: um segundo " +
        "dispositivo vinculado, guardiões que você escolheu, ou um " +
        "kit de recuperação — cada um leva mais ou menos um minuto " +
        "em Configurações.",
      "Se algum dia você precisar apagar tudo rápido — de forma leve " +
        "(anonimizar) ou total (começar do zero) — existe um botão " +
        "de pânico no Perfil, na seção Emergência.",
    ],
  },
  {
    id: "trust",
    title: "Confiança e chegada",
    body: [
      "Membros novos precisam do aval de dois membros existentes para " +
        "se tornarem de plena confiança. Quando alguém entra pelo seu " +
        "convite, isso já conta como um aval seu, implícito.",
      "Membros podem publicar e assumir ajuda antes de serem de plena " +
        "confiança — pedir nunca tem barreiras — mas a comunidade vê " +
        "um marcador mostrando o estado de confiança, para poder dar " +
        "um aval à mão quando fizer sentido.",
    ],
  },
  {
    id: "governance",
    title: "Decisões e conflitos",
    body: [
      "As decisões da comunidade são tomadas em conjunto, não por " +
        "administradores — de propósito, não existe papel de " +
        "administrador nem de moderador no aplicativo. As escolhas " +
        "que valem para a comunidade inteira passam por propostas " +
        "abertas: qualquer pessoa pode abrir uma em Perfil → " +
        "Propostas da comunidade, todo mundo pode vê-la, e ela fica " +
        "aberta por um período de deliberação antes de fechar.",
      "Conflitos sobre uma troca específica passam pela mesma " +
        "engrenagem: abra uma disputa em Perfil → Disputas da " +
        "comunidade e ela se torna uma proposta em que a comunidade " +
        "opina, com o resultado aplicado automaticamente quando ela " +
        "fecha.",
      "Tudo o que o aplicativo não decide — os combinados, o ritmo " +
        "das reuniões, o jeito de conversar entre vocês — acontece " +
        "no canal que a sua comunidade já usa. O aplicativo registra " +
        "decisões; ele não substitui a conversa.",
    ],
  },
  {
    id: "where-from-here",
    title: "Para onde ir a partir daqui",
    body: [
      "Abra o Mural para ver o que a vizinhança está oferecendo e " +
        "pedindo agora.",
      "Abra o Painel para ver como a sua comunidade está — o total " +
        "de horas trocadas, por onde a ajuda está circulando, o que " +
        "já foi celebrado.",
      "Abra o Perfil para atualizar suas habilidades e sua " +
        "disponibilidade, convidar alguém novo, ou ler os guias mais " +
        "longos na documentação.",
    ],
  },
] as const;
