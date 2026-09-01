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

// French translation of the study-group prompts (i18n content
// corpus). Loaded lazily via content/bundles/fr.ts — never import
// this statically from app code. Prompt ids and themes are stable
// machine keys and are never translated; same prompts in the same
// order as study-prompts.ts, enforced by guides.parity.test.ts.
// Register follows docs/i18n-glossary/fr.md.

import type { StudyPrompt } from "./study-prompts";

export const STUDY_PROMPTS_FR: readonly StudyPrompt[] = [
  {
    id: "platform-1",
    theme: "platform",
    body:
      "Que faisaient les banques de temps et les réseaux d'entraide avant " +
      "qu'il existe un logiciel pour ça ? Qu'ont-ils perdu quand le logiciel " +
      "est arrivé, et qu'ont-ils gagné ? Où Understoria devrait-elle se " +
      "placer dans ce compromis ?",
  },
  {
    id: "platform-2",
    theme: "platform",
    body:
      "Le principe de conception d'Understoria, c'est " +
      "une-heure-vaut-une-heure. Quel travail ce principe protège-t-il ? " +
      "Quelles critiques appelle-t-il ? Y a-t-il des cas, dans ta " +
      "communauté, où il se met en travers ?",
  },
  {
    id: "platform-3",
    theme: "platform",
    body:
      "Si on retirait l'app demain, qu'est-ce qui nous resterait ? Cette " +
      "réponse-là est la vraie fondation ; l'app n'est qu'un échafaudage.",
  },
  {
    id: "mutual-aid-1",
    theme: "mutual_aid",
    body:
      "Dean Spade distingue l'entraide de la charité par qui a le pouvoir de " +
      "décider. Qui prend les décisions dans ta communauté en ce moment ? " +
      "Qui ne les prend pas ?",
  },
  {
    id: "mutual-aid-2",
    theme: "mutual_aid",
    body:
      "Les projets d'entraide se font souvent absorber par des ONG ou " +
      "transformer en programmes de prestation de services. Qu'est-ce qui " +
      "protège ta communauté de cette pente ?",
  },
  {
    id: "mutual-aid-3",
    theme: "mutual_aid",
    body:
      "Qui, dans ta communauté, ne demande pas d'aide alors que le besoin " +
      "est là ? Pourquoi ?",
  },
  {
    id: "organizing-1",
    theme: "organizing",
    body:
      "McAlevey distingue la mobilisation (faire venir les soutiens déjà " +
      "acquis) de l'organisation (gagner les personnes qui ne sont pas " +
      "encore des soutiens). Ton réseau d'entraide est-il un projet de " +
      "mobilisation, un projet d'organisation, ou les deux ?",
  },
  {
    id: "organizing-2",
    theme: "organizing",
    body:
      "Le travail d'entraide et le travail syndical se sont historiquement " +
      "nourris l'un l'autre. Où sont les liens dans ton contexte ? Qu'est-ce " +
      "qui serait possible et que personne n'essaie ?",
  },
  {
    id: "power-1",
    theme: "power",
    body:
      "Freeman soutient que prétendre être sans structure ne rend pas sans " +
      "structure ; ça rend seulement la structure informelle et plus " +
      "difficile à contester. Quelles structures informelles existent dans " +
      "ta communauté ? Est-ce qu'elles fonctionnent ?",
  },
  {
    id: "power-2",
    theme: "power",
    body:
      "Si les décisions logicielles d'Understoria étaient prises par une " +
      "entreprise plutôt que par une coopérative, qu'est-ce qui changerait " +
      "dans ses fonctionnalités ? Écris-en trois.",
  },
  {
    id: "traditions-1",
    theme: "traditions",
    body:
      "Mauss et Hyde décrivent le don comme porteur d'une obligation — " +
      "recevoir, donner à son tour — que le marché, lui, efface précisément. " +
      "Où, dans ta communauté, la logique du don est-elle encore intacte, et " +
      "où a-t-elle été remplacée par un cadre transactionnel ? Est-ce que ça " +
      "compte ?",
  },
  {
    id: "traditions-2",
    theme: "traditions",
    body:
      "Le principe des Haudenosaunee — évaluer les décisions à l'échelle de " +
      "plusieurs générations — est structurellement difficile pour un projet " +
      "optimisé autour de métriques hebdomadaires. Choisis une décision " +
      "récente de ta communauté. À quoi ressemblerait-elle, reprise avec un " +
      "horizon de cinq ou sept générations ?",
  },
  {
    id: "traditions-3",
    theme: "traditions",
    body:
      "Le mandar obedeciendo des zapatistes — commander en obéissant — n'est " +
      "pas une métaphore ; c'est un engagement structurel, avec des " +
      "conséquences sur qui tient les rôles de coordination et pour combien " +
      "de temps. Qui, dans ta communauté, détient une autorité de " +
      "coordination informelle ? Qu'est-ce que ça coûterait de la formaliser " +
      "sous le mandar obedeciendo ?",
  },
] as const;
