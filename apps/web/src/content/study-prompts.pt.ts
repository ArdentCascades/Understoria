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

// Portuguese study prompts. Ids and themes are stable machine keys
// and are never translated; same prompts in the same order as
// study-prompts.ts, enforced by guides.parity.test.ts. Loaded lazily
// via content/bundles/pt.ts.
import type { StudyPrompt } from "./study-prompts";

export const STUDY_PROMPTS_PT: readonly StudyPrompt[] = [
  {
    id: "platform-1",
    theme: "platform",
    body:
      "O que os bancos de tempo e as redes de apoio mútuo faziam " +
      "antes de existir software para isso? O que perderam quando o " +
      "software chegou, e o que ganharam? Em que ponto desse " +
      "equilíbrio o Understoria deveria ficar?",
  },
  {
    id: "platform-2",
    theme: "platform",
    body:
      "O princípio de design do Understoria é uma-hora-vale-uma-hora. " +
      "Que trabalho esse princípio está protegendo? Que críticas ele " +
      "atrai? Há casos na sua comunidade em que ele atrapalha?",
  },
  {
    id: "platform-3",
    theme: "platform",
    body:
      "Se amanhã tirássemos o aplicativo, o que ainda teríamos? Essa " +
      "resposta é a fundação de verdade; o aplicativo é andaime.",
  },
  {
    id: "mutual-aid-1",
    theme: "mutual_aid",
    body:
      "Dean Spade distingue o apoio mútuo da caridade por quem tem o " +
      "poder de decidir. Quem toma as decisões na sua comunidade " +
      "hoje? Quem não toma?",
  },
  {
    id: "mutual-aid-2",
    theme: "mutual_aid",
    body:
      "Projetos de apoio mútuo muitas vezes acabam absorvidos por " +
      "ONGs ou transformados em programas de prestação de serviços. " +
      "O que protege a sua comunidade dessa força de atração?",
  },
  {
    id: "mutual-aid-3",
    theme: "mutual_aid",
    body:
      "Quem na sua comunidade não está pedindo ajuda mesmo " +
      "precisando dela? Por quê?",
  },
  {
    id: "organizing-1",
    theme: "organizing",
    body:
      "McAlevey distingue mobilizar (fazer aparecer quem já apoia) " +
      "de organizar (conquistar quem ainda não apoia). Sua rede de " +
      "apoio mútuo é um projeto de mobilização, de organização, ou " +
      "os dois?",
  },
  {
    id: "organizing-2",
    theme: "organizing",
    body:
      "O trabalho de apoio mútuo e o trabalho sindical " +
      "historicamente alimentaram um ao outro. Onde estão as " +
      "conexões no seu contexto? O que é possível e não está sendo " +
      "tentado?",
  },
  {
    id: "power-1",
    theme: "power",
    body:
      "Freeman argumenta que fingir não ter estrutura não elimina a " +
      "estrutura; só a torna informal e mais difícil de contestar. " +
      "Que estruturas informais existem na sua comunidade? Elas " +
      "estão funcionando?",
  },
  {
    id: "power-2",
    theme: "power",
    body:
      "Se as decisões de software do Understoria estivessem sendo " +
      "tomadas por uma corporação em vez de uma cooperativa, o que " +
      "seria diferente nos recursos dele? Escreva três coisas.",
  },
  {
    id: "traditions-1",
    theme: "traditions",
    body:
      "Mauss e Hyde enquadram a dádiva como portadora de uma " +
      "obrigação — receber, retribuir — que o mercado apaga de " +
      "propósito. Onde na sua comunidade a lógica da dádiva ainda " +
      "está intacta, e onde ela deu lugar a um enquadramento de " +
      "transação? Isso importa?",
  },
  {
    id: "traditions-2",
    theme: "traditions",
    body:
      "O princípio Haudenosaunee de avaliar decisões ao longo de " +
      "várias gerações é estruturalmente difícil para um projeto " +
      "otimizado em torno de métricas semanais. Escolha uma decisão " +
      "recente da sua comunidade. Como ela ficaria se fosse " +
      "reconsiderada com um horizonte de cinco ou sete gerações?",
  },
  {
    id: "traditions-3",
    theme: "traditions",
    body:
      "O mandar obedeciendo dos Zapatistas — mandar obedecendo — não " +
      "é uma metáfora; é um compromisso estrutural, com " +
      "consequências para quem ocupa papéis de coordenação e por " +
      "quanto tempo. Quem na sua comunidade tem autoridade informal " +
      "de coordenação? O que custaria formalizá-la sob o mandar " +
      "obedeciendo?",
  },
] as const;
