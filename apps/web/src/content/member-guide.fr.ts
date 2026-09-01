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

// French translation of the member guide (i18n content corpus).
// Loaded lazily via content/bundles/fr.ts — never import this
// statically from app code. Section ids are stable anchors and are
// never translated; the section and paragraph structure mirrors
// member-guide.ts exactly, enforced by guides.parity.test.ts.
// Register follows docs/i18n-glossary/fr.md: tutoiement, warm plain
// French, U+00A0 typography per the glossary.

import type { GuideSection } from "./member-guide";

export const MEMBER_GUIDE_FR: readonly GuideSection[] = [
  {
    id: "what-it-is",
    title: "Ce qu'est Understoria",
    body: [
      "Understoria est une banque de temps : une façon pour une communauté " +
        "d'échanger de l'aide, où chaque heure compte pareil. Une heure à " +
        "réparer un évier vaut une heure à écouter quelqu'un après une " +
        "journée difficile.",
      "Ce n'est pas une app pour trouver des petits boulots. C'est un " +
        "logiciel au service d'une communauté qui existe déjà — un lieu de " +
        "travail, un quartier, un groupe d'affinité — où la confiance est " +
        "déjà là, et qui veut un moyen léger de garder l'entraide visible.",
    ],
  },
  {
    id: "credits",
    title: "Comment marchent les crédits",
    body: [
      "Chaque nouveau membre commence avec 5 heures de crédit de départ. Tu " +
        "peux demander de l'aide avant d'en avoir donné la moindre. Demander " +
        "n'est pas une dette — c'est ce qui fait vivre le réseau.",
      "Quand tu aides quelqu'un, vous confirmez l'échange l'une et l'autre. " +
        "Ton solde monte des heures données ; le sien descend. Pas d'argent " +
        "qui change de main, et personne ne tient de score.",
      "Ton solde est calculé à partir d'un registre signé de chaque échange. " +
        "Si quelque chose te semble bizarre, tu peux le vérifier toi-même.",
    ],
  },
  {
    id: "identity",
    title: "Ton identité",
    body: [
      "Ton identité est une paire de clés cryptographiques. Pas d'email, pas " +
        "de numéro de téléphone, pas de mot de passe de compte. Ton nom " +
        "affiché est celui que tu choisis — c'est une étiquette, pas un " +
        "papier d'identité.",
      "Tu peux verrouiller les clés stockées sur ton appareil avec ton " +
        "empreinte, ton visage ou le code PIN de l'appareil (une clé d'accès " +
        "— proposée dès l'arrivée, et qui marche sans le moindre Internet), " +
        "ou avec une phrase secrète que tu tapes ; tu peux aussi avoir les " +
        "deux, la phrase secrète servant de voie de secours. Rien du verrou " +
        "n'est envoyé à Apple, à Google ni à aucun serveur — la vérification " +
        "se fait sur ton appareil.",
      "Si tu perds ta phrase secrète — ou ton téléphone avec son verrou par " +
        "empreinte — personne ne peut la récupérer à ta place. C'est le " +
        "marché : aucune autorité centrale ne peut lire tes données, et donc " +
        "aucune autorité centrale ne peut non plus venir les sauver. Ce qui " +
        "te ramène, c'est une sauvegarde faite pendant que tout allait " +
        "bien : un deuxième appareil relié, des gardiennes et gardiens que " +
        "tu as choisis, ou un kit de récupération — chacun prend à peu près " +
        "une minute dans Réglages.",
      "Si un jour tu dois tout effacer vite — effacement doux (anonymiser) " +
        "ou effacement dur (repartir de zéro) — il y a un bouton panique " +
        "dans Profil, sous Urgence.",
    ],
  },
  {
    id: "trust",
    title: "Confiance et accueil",
    body: [
      "Les nouveaux membres ont besoin de l'aval de deux membres existants " +
        "pour devenir de pleine confiance. Quand quelqu'un rejoint avec ton " +
        "invitation, ça compte comme ton aval implicite.",
      "Les membres peuvent publier et prendre de l'aide avant d'être de " +
        "pleine confiance — demander n'est jamais bloqué — mais la " +
        "communauté voit une pastille qui montre où en est la confiance, " +
        "pour que chacun puisse se porter garant à la main quand c'est " +
        "mérité.",
    ],
  },
  {
    id: "governance",
    title: "Décisions et conflits",
    body: [
      "Dans la communauté, les décisions se prennent ensemble, pas par des " +
        "admins — il n'y a volontairement aucun rôle d'administrateur ni de " +
        "modérateur dans l'app. Les choix qui engagent toute la communauté " +
        "passent par des propositions ouvertes : n'importe qui peut en " +
        "lancer une depuis Profil → Propositions communautaires, tout le " +
        "monde peut la voir, et elle reste ouverte pendant un temps de " +
        "délibération avant de se clore.",
      "Les conflits autour d'un échange précis passent par la même " +
        "mécanique : ouvre un désaccord depuis Profil → Désaccords de la " +
        "communauté et il devient une proposition sur laquelle la communauté " +
        "se prononce, avec le résultat appliqué tout seul à la clôture.",
      "Tout ce que l'app ne décide pas — les normes, le rythme des réunions, " +
        "la façon de vous parler — se passe sur le canal que ta communauté " +
        "utilise déjà. L'app enregistre les décisions ; elle ne remplace pas " +
        "la conversation.",
    ],
  },
  {
    id: "where-from-here",
    title: "Par où continuer",
    body: [
      "Ouvre le Tableau pour voir ce que le voisinage offre et demande en ce " +
        "moment.",
      "Ouvre la Vue d'ensemble pour voir comment va ta communauté — le total " +
        "des heures échangées, où l'aide circule, ce qui a été célébré.",
      "Ouvre Profil pour mettre à jour tes savoir-faire et tes " +
        "disponibilités, inviter quelqu'un de nouveau, ou lire les guides " +
        "plus complets livrés sur disque.",
    ],
  },
] as const;
