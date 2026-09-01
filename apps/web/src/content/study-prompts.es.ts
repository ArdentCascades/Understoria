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

// Spanish translation of study-prompts.ts. Same shape, same ids and
// themes — only the prose changes. IDs are stable and never
// translated; the prompt structure is enforced by
// guides.parity.test.ts, so mirror any change to study-prompts.ts
// here.

import type { StudyPrompt } from "./study-prompts";

export const STUDY_PROMPTS_ES: readonly StudyPrompt[] = [
  {
    id: "platform-1",
    theme: "platform",
    body:
      "¿Qué hacían los bancos de tiempo y las redes de ayuda mutua " +
      "antes de que existiera software para ello? ¿Qué perdieron " +
      "cuando llegó el software, y qué ganaron? ¿Dónde debería " +
      "situarse Understoria en ese equilibrio?",
  },
  {
    id: "platform-2",
    theme: "platform",
    body:
      "El principio de diseño de Understoria es que una hora vale " +
      "una hora. ¿Qué trabajo protege ese principio? ¿Qué críticas " +
      "invita? ¿Hay casos en tu comunidad donde estorba?",
  },
  {
    id: "platform-3",
    theme: "platform",
    body:
      "Si mañana quitáramos la app, ¿qué nos quedaría? Esa " +
      "respuesta es el cimiento real; la app es andamiaje.",
  },
  {
    id: "mutual-aid-1",
    theme: "mutual_aid",
    body:
      "Dean Spade distingue la ayuda mutua de la caridad por quién " +
      "llega a decidir. ¿Quién toma las decisiones en tu comunidad " +
      "ahora mismo? ¿Quién no?",
  },
  {
    id: "mutual-aid-2",
    theme: "mutual_aid",
    body:
      "Los proyectos de ayuda mutua a menudo terminan absorbidos " +
      "por ONG o convertidos en programas de prestación de " +
      "servicios. ¿Qué protege a tu comunidad de esa fuerza?",
  },
  {
    id: "mutual-aid-3",
    theme: "mutual_aid",
    body:
      "¿Quién en tu comunidad no está pidiendo ayuda aunque la " +
      "necesita? ¿Por qué?",
  },
  {
    id: "organizing-1",
    theme: "organizing",
    body:
      "McAlevey distingue movilizar (lograr que quienes ya apoyan " +
      "se presenten) de organizar (ganarse a quienes todavía no " +
      "apoyan). ¿Tu red de ayuda mutua es un proyecto de " +
      "movilización, uno de organización, o ambos?",
  },
  {
    id: "organizing-2",
    theme: "organizing",
    body:
      "El trabajo de ayuda mutua y el trabajo sindical se han " +
      "alimentado históricamente el uno al otro. ¿Dónde están las " +
      "conexiones en tu contexto? ¿Qué es posible que no se está " +
      "intentando?",
  },
  {
    id: "power-1",
    theme: "power",
    body:
      "Freeman sostiene que fingir que no hay estructura no te " +
      "deja sin estructura; solo la vuelve informal y más difícil " +
      "de cuestionar. ¿Qué estructuras informales existen en tu " +
      "comunidad? ¿Están funcionando?",
  },
  {
    id: "power-2",
    theme: "power",
    body:
      "Si las decisiones de software de Understoria las tomara " +
      "una corporación en lugar de una cooperativa, ¿qué sería " +
      "distinto en sus funciones? Escribe tres cosas.",
  },
  {
    id: "traditions-1",
    theme: "traditions",
    body:
      "Mauss y Hyde presentan el don como portador de una " +
      "obligación — recibir, dar a su vez — que el mercado borra " +
      "expresamente. ¿Dónde sigue intacta la lógica del don en tu " +
      "comunidad, y dónde ha sido reemplazada por un marco " +
      "transaccional? ¿Importa?",
  },
  {
    id: "traditions-2",
    theme: "traditions",
    body:
      "El principio Haudenosaunee de evaluar las decisiones a lo " +
      "largo de varias generaciones es estructuralmente difícil " +
      "para un proyecto optimizado en torno a métricas semanales. " +
      "Elige una decisión reciente de tu comunidad. ¿Cómo se " +
      "vería reconsiderada con un horizonte de cinco o siete " +
      "generaciones?",
  },
  {
    id: "traditions-3",
    theme: "traditions",
    body:
      "El mandar obedeciendo de los zapatistas no es una " +
      "metáfora; es un compromiso estructural con consecuencias " +
      "sobre quién ocupa los roles de coordinación y por cuánto " +
      "tiempo. ¿Quién en tu comunidad tiene autoridad " +
      "coordinadora informal? ¿Qué costaría formalizarla bajo el " +
      "mandar obedeciendo?",
  },
] as const;
