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

// Portuguese opsec guide. Ids are stable anchors and are never
// translated; same section and paragraph structure as
// opsec-guide.ts, enforced by guides.parity.test.ts. Loaded lazily
// via content/bundles/pt.ts.
import type { GuideSection } from "./member-guide";

export const OPSEC_GUIDE_PT: readonly GuideSection[] = [
  {
    id: "device",
    title: "No seu dispositivo",
    body: [
      "Bloqueie seu telefone com um PIN de seis dígitos ou uma frase " +
        "secreta forte. Ative a criptografia de disco inteiro (todo " +
        "telefone moderno já vem com ela ativada; num computador " +
        "portátil, use FileVault, BitLocker ou LUKS). Mantenha o " +
        "sistema atualizado — a maioria dos ataques do mundo real " +
        "explora falhas que já foram corrigidas.",
    ],
  },
  {
    id: "accounts",
    title: "Na sua identidade",
    body: [
      "O Understoria não pede e-mail nem número de telefone. Se " +
        "alguém dizendo ser do Understoria pedir esses dados, é uma " +
        "tentativa de phishing.",
      "Sua identidade é uma chave criptográfica neste dispositivo. " +
        "Você pode exportar uma cópia de segurança — guarde-a num " +
        "lugar seguro e fora da internet. Um papel impresso numa " +
        "gaveta muitas vezes é melhor do que um serviço na nuvem.",
      "Se o seu telefone for perdido ou roubado, o que protege sua " +
        "chave é o bloqueio que você definiu para ela (a passkey por " +
        "digital, rosto ou PIN, ou uma frase secreta) — é por isso " +
        "que as boas-vindas oferecem um. Não existe revogação " +
        "central, e não há ninguém com um botão para resolver isso " +
        "por você: conte à sua comunidade o que aconteceu, para as " +
        "pessoas saberem que devem deixar de confiar naquela " +
        "identidade, e então comece de novo com uma chave nova " +
        "(Perfil → Emergência → Limpeza total em qualquer " +
        "dispositivo que ainda guarde a antiga).",
    ],
  },
  {
    id: "communication",
    title: "Na sua comunicação",
    body: [
      "Não converse sobre organização em dispositivos ou redes do " +
        "empregador. Computadores de trabalho e o WiFi da empresa " +
        "registram — e às vezes monitoram — a atividade.",
      "Não tire capturas de tela do conteúdo da plataforma para " +
        "compartilhar fora do grupo. Depois que sai do Understoria, " +
        "ele deixa de estar protegido.",
      "Para conversas sensíveis, encontrem-se em pessoa. Uma " +
        "caminhada de dez minutos vale mais que duas horas de " +
        "mensagens.",
    ],
  },
  {
    id: "social",
    title: "No seu rastro nas redes",
    body: [
      "Mantenha seu nome visível no Understoria separado da sua " +
        "identidade de trabalho. Um pseudônimo é um recurso, não um " +
        "sinal de má-fé.",
      "Não publique sobre o trabalho de organização em redes sociais " +
        "abertas com o seu nome legal junto. Até publicações de " +
        "“inspiração geral” criam um padrão que um observador " +
        "decidido consegue mapear.",
    ],
  },
  {
    id: "wrong",
    title: "Se algo parecer errado",
    body: [
      "Se alguém que você não conhece quiser ser adicionado, vá " +
        "devagar. Peça um aval.",
      "Se um membro existente começar a fazer perguntas estranhas " +
        "sobre listas de membros ou sobre quem ajudou quem — anote. " +
        "Converse com outro membro. Infiltração acontece.",
      "Se um fornecedor, um empregador ou um policial pedir que você " +
        "compartilhe informações sobre membros ou atividades: você " +
        "não tem essa obrigação. Não enfrente a situação por conta " +
        "própria — converse com membros de confiança antes de " +
        "responder qualquer coisa.",
    ],
  },
  {
    id: "rights",
    title: "Conheça seus direitos",
    body: [
      "Você não tem obrigação de responder a perguntas da polícia " +
        "sem um advogado ou advogada presente. Você não tem " +
        "obrigação de consentir com uma busca no seu dispositivo — " +
        "em geral eles precisam de um mandado. Você não tem " +
        "obrigação de identificar outros membros. Você tem, sim, o " +
        "direito de ficar em silêncio.",
      "Digitais e rostos não são palavras. Em muitos lugares, os " +
        "tribunais tratam um desbloqueio biométrico como uma chave " +
        "física — a polícia pode pressionar seu dedo contra o " +
        "telefone ou segurá-lo diante do seu rosto — enquanto algo " +
        "que você sabe, como uma frase secreta, é tratado como " +
        "testemunho que você pode se recusar a dar. Isso varia por " +
        "país e por tribunal, então confira com uma organização " +
        "jurídica local; mas, se uma detenção for uma possibilidade, " +
        "parta do princípio de que uma biometria pode ser exigida à " +
        "força e uma frase secreta, não.",
      "Aprenda o gesto de bloqueio de emergência do seu telefone " +
        "antes de precisar dele. No iPhone, segure o botão lateral e " +
        "um dos botões de volume por dois segundos (até aparecer a " +
        "tela de desligar) — o Face ID e o Touch ID ficam " +
        "desativados até a senha ser digitada. No Android, segure o " +
        "botão de ligar e toque em Bloqueio total (ative-o antes em " +
        "Configurações → Tela → Tela de bloqueio, se ele não estiver " +
        "lá). Pratique até virar memória muscular.",
      "No próprio Understoria: se um desbloqueio forçado faz parte " +
        "do seu modelo de ameaça, proteja sua chave com uma frase " +
        "secreta em vez da digital — ou remova o desbloqueio por " +
        "digital (Perfil → Configurações → Segurança) antes de um " +
        "protesto, de uma travessia de fronteira ou de qualquer " +
        "momento em que uma detenção seja possível; depois você pode " +
        "adicioná-lo de volta. Só uma frase secreta digitada por " +
        "você carrega, de ponta a ponta, a propriedade de poder " +
        "recusar. E lembre que o botão de pânico (Perfil → " +
        "Emergência → Limpeza total) existe para quando bloquear " +
        "não é o bastante.",
      "As organizações jurídicas da sua região (a NLG nos Estados " +
        "Unidos, a LDAN no Reino Unido) têm cartões de “Conheça " +
        "seus direitos” específicos para a sua jurisdição. Leve um " +
        "na carteira.",
    ],
  },
];
