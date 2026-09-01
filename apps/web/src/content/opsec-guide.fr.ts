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

// French translation of the opsec guide (i18n content corpus).
// Loaded lazily via content/bundles/fr.ts — never import this
// statically from app code. Section ids are stable anchors and are
// never translated; the section and paragraph structure mirrors
// opsec-guide.ts exactly, enforced by guides.parity.test.ts.
// Register follows docs/i18n-glossary/fr.md.

import type { GuideSection } from "./member-guide";

export const OPSEC_GUIDE_FR: readonly GuideSection[] = [
  {
    id: "device",
    title: "Sur ton appareil",
    body: [
      "Verrouille ton téléphone avec un code PIN à six chiffres ou une " +
        "phrase secrète solide. Active le chiffrement complet du disque " +
        "(tous les téléphones récents l'ont par défaut ; sur un ordinateur " +
        "portable, utilise FileVault, BitLocker ou LUKS). Garde ton système " +
        "à jour — la plupart des attaques réelles exploitent des failles " +
        "déjà corrigées.",
    ],
  },
  {
    id: "accounts",
    title: "Sur ton identité",
    body: [
      "Understoria ne demande ni email ni numéro de téléphone. Si quelqu'un " +
        "qui prétend parler au nom d'Understoria te les demande, c'est une " +
        "tentative d'hameçonnage.",
      "Ton identité est une clé cryptographique sur cet appareil. Tu peux en " +
        "exporter une sauvegarde — garde-la dans un endroit sûr et hors " +
        "ligne. Un papier imprimé dans un tiroir vaut souvent mieux qu'un " +
        "service cloud.",
      "Si ton téléphone est perdu ou volé, c'est le verrou que tu as posé " +
        "sur ta clé (ta clé d'accès par empreinte, visage ou PIN, ou une " +
        "phrase secrète) qui la protège — c'est pour ça que l'app t'en " +
        "propose un dès l'arrivée. Il n'y a pas de révocation centrale, et " +
        "personne ne peut actionner un interrupteur à ta place : raconte à " +
        "ta communauté ce qui s'est passé pour que les gens sachent ne plus " +
        "faire confiance à cette identité, puis repars avec une clé neuve " +
        "(Profil → Urgence → Effacement dur sur tout appareil qui garde " +
        "encore l'ancienne).",
    ],
  },
  {
    id: "communication",
    title: "Sur ta communication",
    body: [
      "Ne parle pas d'organisation collective sur les appareils ou les " +
        "réseaux de ton employeur. Les ordinateurs de travail et le WiFi " +
        "d'entreprise journalisent l'activité, et parfois la surveillent.",
      "Ne fais pas de captures d'écran du contenu de la plateforme pour les " +
        "partager hors du groupe. Une fois sorti d'Understoria, il n'est " +
        "plus protégé.",
      "Pour les conversations sensibles, voyez-vous en personne. Dix minutes " +
        "de marche valent mieux que deux heures de fil de messages.",
    ],
  },
  {
    id: "social",
    title: "Sur tes traces publiques",
    body: [
      "Garde ton nom affiché sur Understoria séparé de ton identité " +
        "professionnelle. Un pseudonyme est une protection prévue, pas un " +
        "signe de mauvaise foi.",
      "Ne publie pas sur ton travail d'organisation sur les réseaux sociaux " +
        "publics sous ton nom légal. Même les publications d'« inspiration " +
        "générale » dessinent un motif qu'une personne déterminée peut " +
        "cartographier.",
    ],
  },
  {
    id: "wrong",
    title: "Si quelque chose cloche",
    body: [
      "Si quelqu'un que tu ne connais pas veut qu'on l'ajoute, prends ton " +
        "temps. Demande un aval.",
      "Si un membre existant se met à poser des questions étranges sur les " +
        "listes de membres ou sur qui a aidé qui — note-le. Parles-en à un " +
        "autre membre. L'infiltration, ça arrive.",
      "Si un prestataire, un employeur ou un agent te demande de partager " +
        "des informations sur les membres ou l'activité : tu n'as pas à le " +
        "faire. Ne t'en occupe pas dans ton coin — parles-en avec des " +
        "membres de confiance avant de répondre quoi que ce soit.",
    ],
  },
  {
    id: "rights",
    title: "Connais tes droits",
    body: [
      "Tu n'as pas à répondre aux questions de la police sans avocate ou " +
        "avocat à tes côtés. Tu n'as pas à consentir à une fouille de ton " +
        "appareil — il leur faut en général un mandat. Tu n'as pas à " +
        "identifier d'autres membres. Tu as le droit de garder le silence.",
      "Les empreintes et les visages ne sont pas des mots. Dans beaucoup " +
        "d'endroits, les tribunaux traitent un déverrouillage biométrique " +
        "comme une clé physique — la police peut presser ton doigt sur le " +
        "téléphone ou le tenir devant ton visage — alors que ce que tu sais, " +
        "comme une phrase secrète, est traité comme un témoignage que tu " +
        "peux refuser de donner. Ça varie selon les pays et les tribunaux, " +
        "alors renseigne-toi auprès d'une organisation juridique locale ; " +
        "mais si tu risques une détention, pars du principe qu'un " +
        "déverrouillage biométrique peut être forcé, et qu'une phrase " +
        "secrète, non.",
      "Apprends le geste de verrouillage renforcé de ton téléphone avant " +
        "d'en avoir besoin. Sur iPhone, maintiens le bouton latéral et l'un " +
        "des boutons de volume pendant deux secondes (jusqu'à l'écran " +
        "d'extinction) — Face ID et Touch ID sont alors coupés jusqu'à la " +
        "saisie du code. Sur Android, maintiens le bouton d'alimentation et " +
        "touche Verrouillage renforcé (active-le d'abord dans Paramètres → " +
        "Affichage → Écran de verrouillage s'il n'y est pas). Répète le " +
        "geste jusqu'à ce qu'il devienne un réflexe.",
      "Dans Understoria même : si le déverrouillage forcé fait partie de ton " +
        "modèle de menace, protège ta clé avec une phrase secrète plutôt " +
        "qu'une empreinte — ou retire le déverrouillage par empreinte " +
        "(Profil → Réglages → Sécurité) avant une manifestation, un passage " +
        "de frontière ou tout moment où une détention est possible ; tu " +
        "pourras le remettre après. Seule une phrase secrète tapée porte de " +
        "bout en bout la propriété « tu peux refuser ». Et souviens-toi que " +
        "le bouton panique (Profil → Urgence → Effacement dur) existe pour " +
        "quand verrouiller ne suffit pas.",
      "Les organisations juridiques locales (NLG aux États-Unis, LDAN au " +
        "Royaume-Uni) peuvent fournir des cartes « Know Your Rights » " +
        "propres à ta juridiction. Gardes-en une dans ton portefeuille.",
    ],
  },
] as const;
