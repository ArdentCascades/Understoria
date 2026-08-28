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

// French translation of design-principles.ts. Same shape, same ids —
// only the prose changes. Register follows docs/i18n-glossary/fr.md:
// tutoiement, "entraide" for mutual aid, "banque de temps" for
// timebank, "solde de départ" for seed credits, "vient après" for the
// follows framing, no administrative register. The asking-never-gated
// title reuses the glossary's own rendering ("demander n'est jamais
// bloqué"). Proper nouns stay as they are.
import type { DesignPrinciple } from "./design-principles";

export const DESIGN_PRINCIPLES_FR: readonly DesignPrinciple[] = [
  {
    id: "equal-time",
    title: "Des crédits de temps égaux",
    statement:
      "Une heure d'aide vaut toujours une heure de crédit, quel que soit le travail.",
    example:
      "Les premières banques de temps qui ont essayé les prix du marché ont constaté que le soutien émotionnel et la garde d'enfants — le travail le plus souvent fait par des femmes et des membres handicapés — étaient systématiquement les moins valorisés. Le temps égal, c'est la réponse structurelle.",
  },
  {
    id: "no-leaderboards",
    title: "Ni classements ni scores individuels",
    statement:
      "Les progrès se mesurent à l'échelle de la communauté. L'unité de mesure, c'est nous, pas moi.",
    example:
      "Quand Couchsurfing a ajouté un score de réputation, les hôtes se sont mis à le manipuler, et les invités les plus vulnérables — ceux qui ne pouvaient pas rendre de bonnes notes — se sont retrouvés complètement exclus du système.",
  },
  {
    id: "no-notifications",
    title: "Pas de notifications push",
    statement:
      "On te montre ce qui a besoin de toi quand tu ouvres l'app. Rien ne vibre, aucun compteur ne te poursuit d'écran en écran, pas de théâtre de l'urgence.",
    example:
      "Les personnes qui organisaient l'entraide pendant le COVID ont largement décrit les outils à notifications comme épuisant d'abord leurs membres les plus engagés — ceux que les communautés pouvaient le moins se permettre de perdre. C'est ce vécu, pas une étude formelle, qui fonde ce principe.",
  },
  {
    id: "solidarity-not-shame",
    title: "La solidarité, pas la honte",
    statement:
      "On ne présente jamais une situation comme au point mort, en retard ou ratée. Les capacités changent ; le système s'adapte sans blâmer personne.",
    example:
      "Les plateformes de travail à la tâche utilisent des relances « tu prends du retard » pour extraire plus de travail. Les plus touchés sont ceux qui traversent déjà une crise — exactement les personnes que l'entraide existe pour soutenir.",
  },
  {
    id: "community-authority",
    title: "La communauté est l'autorité",
    statement:
      "Pas de rôle d'admin. Les décisions de gouvernance passent par des propositions communautaires, pas par le pouvoir d'une personne.",
    example:
      "Les coopératives de Mondragón ont montré sur plus de 60 ans que la gouvernance par les travailleurs fait mieux que celle des managers, en équité comme en longévité. Le rôle d'« admin » est un choix de conception, pas une nécessité.",
  },
  {
    id: "asking-never-gated",
    title: "Demander de l'aide n'est jamais bloqué",
    statement:
      "Chaque nouveau membre commence avec un solde de départ. Tu peux recevoir avant de donner.",
    example:
      "Les banques de temps qui exigeaient de gagner avant de dépenser ont vu leurs membres les plus vulnérables — les personnes âgées, celles qui venaient d'arriver, celles en crise — ne jamais demander d'aide. Le solde de départ, c'est la réponse structurelle.",
  },
  {
    id: "privacy-precondition",
    title: "La vie privée est une condition préalable",
    statement:
      "Pas d'e-mail, pas de numéro de téléphone, un minimum de journaux. Ton identité est une clé cryptographique sur ton appareil.",
    example:
      "Des collectifs de travailleurs qui utilisaient des feuilles de présence numériques ont vu leurs listes de membres saisies par la justice ou fuiter vers les employeurs. S'organiser exige que l'appartenance elle-même soit protégée, pas seulement les contenus.",
  },
  {
    id: "deliberation-over-speed",
    title: "La délibération avant la vitesse",
    statement:
      "Les propositions restent ouvertes pendant une période configurable. Le consensus demande du temps, pas seulement un quorum.",
    example:
      "Les votes en ligne expéditifs dans des coopératives ont systématiquement laissé de côté les travailleurs de nuit, les proches aidants et les membres au réseau limité. La fenêtre de délibération de 3 jours par défaut donne à chacun une vraie chance de peser (chaque communauté peut l'ajuster, jusqu'à un plancher d'un jour).",
  },
  {
    id: "no-post-editing",
    title: "Pourquoi republier plutôt que modifier",
    statement:
      "Une fois qu'une publication est partagée avec la communauté, elle ne peut être ni modifiée ni effacée en douce — la trace de ce qui a été demandé reste fiable pour tous ceux qui l'ont vue.",
    example:
      "Les plateformes qui permettent les modifications silencieuses créent des problèmes de déni — « je n'ai jamais dit ça » devient insoluble. Garder l'original tel quel, plus un parcours de republication pour les changements, préserve à la fois la souplesse et la responsabilité.",
  },
  {
    id: "no-read-receipts",
    title: "Pas d'accusés de lecture sur les messages",
    statement:
      "On ne dit pas à l'expéditeur quand son message a été lu. Qui-parle-à-qui, c'est le graphe de relations que le modèle de menace protège le plus.",
    example:
      "Les coches bleues de WhatsApp ont créé une pression sociale à répondre immédiatement et permis à des partenaires violents de surveiller les temps de réponse. Retirer les accusés de lecture supprime entièrement cette prise de surveillance.",
  },
  {
    id: "no-activity-search",
    title: "Pas de recherche de membres par activité",
    statement:
      "Impossible de chercher « qui a été le plus actif » ou « qui a le plus aidé ». Les schémas d'activité sont des données de surveillance.",
    example:
      "Quand Strava a publié des cartes de chaleur d'activité agrégée, elles ont révélé par accident l'emplacement de bases militaires secrètes. Les schémas d'activité individuels en révèlent encore plus : qui s'organise, quand, et avec qui.",
  },
  {
    id: "follows-not-blocked",
    title: "Les tâches « viennent après » — jamais « bloquées »",
    statement:
      "Une tâche qui attend une autre tâche est ordonnée, pas coincée. Le cadrage façonne ce que les gens ressentent du travail.",
    example:
      "Les outils de gestion de projet qui étiquettent des tâches « bloquées » installent une dynamique de blâme — quelqu'un « bloque » quelqu'un d'autre. « Vient après » cadre la même dépendance comme une suite naturelle, et retire la friction entre les personnes.",
  },
];
