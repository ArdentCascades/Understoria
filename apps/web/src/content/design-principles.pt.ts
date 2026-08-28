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

// Portuguese translation of design-principles.ts. Same shape, same
// ids — only the prose changes. Register follows
// docs/i18n-glossary/pt.md: warm Brazilian-leaning "você" (mostly
// implicit in the verb), "apoio mútuo" for mutual aid, "banco de
// tempo" for timebank, "créditos de semente" for seed credits,
// "vem depois" for the follows framing, no banking or debt register.
// Proper nouns stay as they are.
import type { DesignPrinciple } from "./design-principles";

export const DESIGN_PRINCIPLES_PT: readonly DesignPrinciple[] = [
  {
    id: "equal-time",
    title: "Créditos de tempo iguais",
    statement:
      "Uma hora de ajuda sempre vale uma hora de crédito, seja qual for o trabalho.",
    example:
      "Os primeiros bancos de tempo que tentaram preços de mercado descobriram que o apoio emocional e o cuidado com crianças — o trabalho mais feito por mulheres e por membros com deficiência — era sempre o menos valorizado. Tempo igual é o conserto estrutural.",
  },
  {
    id: "no-leaderboards",
    title: "Sem rankings nem pontuações individuais",
    statement:
      "O progresso é acompanhado no nível da comunidade. A unidade de medida é nós, não eu.",
    example:
      "Quando o Couchsurfing adicionou uma pontuação de reputação, os anfitriões começaram a manipulá-la, e os hóspedes mais vulneráveis — os que não podiam retribuir com notas altas — ficaram completamente de fora do sistema.",
  },
  {
    id: "no-notifications",
    title: "Sem notificações push",
    statement:
      "Mostramos o que precisa da sua atenção quando você abre o app. Nada vibra, nenhum contador persegue você de tela em tela, nada de teatro de urgência.",
    example:
      "Quem organizou apoio mútuo na época da COVID descreveu, em peso, as ferramentas movidas a notificação como as que esgotavam primeiro os membros mais dedicados — as pessoas que as comunidades menos podiam se permitir perder. É essa vivência, não um estudo formal, que sustenta este princípio.",
  },
  {
    id: "solidarity-not-shame",
    title: "Solidariedade, não vergonha",
    statement:
      "Nunca tratamos uma situação como travada, atrasada ou fracassada. A capacidade muda; o sistema se adapta sem culpar ninguém.",
    example:
      "Os aplicativos de bico usam cutucadas de «você está ficando para trás» para extrair mais trabalho. Quem mais sofre são as pessoas que já estão em crise — exatamente quem o apoio mútuo existe para sustentar.",
  },
  {
    id: "community-authority",
    title: "A comunidade é a autoridade",
    statement:
      "Não existe papel de administrador. As decisões de governança passam por propostas da comunidade, não pelo poder de uma pessoa.",
    example:
      "As cooperativas de Mondragón mostraram, ao longo de mais de 60 anos, que a governança pelos trabalhadores supera a dos gerentes em equidade e em longevidade. O papel de «admin» é uma escolha de design, não uma necessidade.",
  },
  {
    id: "asking-never-gated",
    title: "Pedir ajuda nunca é barrado",
    statement:
      "Todo novo membro começa com créditos de semente. Dá para receber antes de dar.",
    example:
      "Bancos de tempo que exigiam ganhar antes de gastar viram os membros mais vulneráveis — idosos, recém-chegados, gente em crise — nunca pedirem ajuda. Os créditos de semente são o conserto estrutural.",
  },
  {
    id: "privacy-precondition",
    title: "Privacidade é pré-condição",
    statement:
      "Sem e-mail, sem número de telefone, registros mínimos. Sua identidade é uma chave criptográfica no seu aparelho.",
    example:
      "Centros de trabalhadores que usavam listas de presença digitais tiveram suas listas de membros requisitadas pela justiça ou vazadas para os patrões. Organizar-se exige proteger a própria condição de membro, não só o conteúdo.",
  },
  {
    id: "deliberation-over-speed",
    title: "Deliberação antes de velocidade",
    statement:
      "As propostas ficam abertas por um período configurável. Consenso precisa de tempo, não só de quórum.",
    example:
      "Votações rápidas online em cooperativas deixaram sem voz, repetidamente, quem trabalha à noite, quem cuida de alguém e quem tem internet limitada. A janela padrão de 3 dias de deliberação dá a todo mundo uma chance real de opinar (as comunidades podem ajustá-la, até o piso de 1 dia).",
  },
  {
    id: "no-post-editing",
    title: "Por que repostar em vez de editar",
    statement:
      "Depois que uma publicação é compartilhada com a comunidade, ela não pode ser editada nem apagada em silêncio — o registro do que foi pedido continua confiável para todo mundo que viu.",
    example:
      "Plataformas que permitem edições silenciosas criam problemas de negação — «eu nunca disse isso» vira algo sem solução. Manter o original como era, mais um fluxo de repostagem para mudanças, preserva a flexibilidade e a responsabilidade ao mesmo tempo.",
  },
  {
    id: "no-read-receipts",
    title: "Sem confirmação de leitura nas mensagens",
    statement:
      "Não contamos a quem enviou quando a mensagem foi lida. Quem-fala-com-quem é o grafo de relações que o modelo de ameaças mais protege.",
    example:
      "Os tiques azuis do WhatsApp criaram pressão social para responder na hora e permitiram que parceiros abusivos vigiassem os tempos de resposta. Tirar a confirmação de leitura remove por completo essa alavanca de vigilância.",
  },
  {
    id: "no-activity-search",
    title: "Sem busca de membros por atividade",
    statement:
      "Não dá para buscar «quem andou mais ativo» nem «quem mais ajudou». Padrões de atividade são dados de vigilância.",
    example:
      "Quando o Strava publicou mapas de calor de atividade agregada, revelou sem querer a localização de bases militares secretas. Padrões de atividade individuais revelam ainda mais: mostram quem está se organizando, quando e com quem.",
  },
  {
    id: "follows-not-blocked",
    title: "Tarefas «vêm depois» — nunca ficam «bloqueadas»",
    statement:
      "Uma tarefa esperando outra está em sequência, não emperrada. O enquadramento molda como as pessoas se sentem com o trabalho.",
    example:
      "Ferramentas de gestão de projetos que rotulam tarefas como «bloqueadas» criam uma dinâmica de culpa — alguém está «bloqueando» alguém. «Vem depois» enquadra a mesma dependência como uma sequência natural, tirando o atrito entre as pessoas.",
  },
];
