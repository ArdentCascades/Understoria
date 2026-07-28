/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program. If not, see
 * <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import type { StartCommunityGuide } from "./startCommunity";

// French mirror of content/startCommunity.ts. Same step ids, same
// paragraph counts, and BYTE-IDENTICAL code blocks (commands don't
// translate) — startCommunity.parity.test.ts enforces all three.
export const START_COMMUNITY_FR: StartCommunityGuide = {
  "intro": [
    "Ta communauté fait tourner Understoria. Tu peux en démarrer une pour ton quartier, ton lieu de travail, ta famille à l'autre bout de la ville — en n'utilisant que le serveur de ta propre communauté. Pas de compte GitHub, pas d'app store, pas de Docker obligatoire, pas de permission à demander à qui que ce soit.",
    "Ça marche parce qu'Understoria est un logiciel libre (sous licence AGPL) et que chaque serveur propose son propre code source — le code exact qu'il fait tourner. Ce n'est pas une politesse : la licence l'exige, et l'app l'intègre d'office pour qu'aucune entreprise, aucun hébergeur, aucun dépôt ne puisse jamais être le seul endroit où vit le logiciel. Chaque communauté est une semence.",
    "À qui s'adresse ce guide : quelqu'un à l'aise pour suivre soigneusement des instructions dans un terminal, mais qui n'a jamais déployé de serveur. Si les mots « terminal » et « commande » sont nouveaux pour toi, fais-le aux côtés d'un membre qui l'a déjà fait — c'est comme ça que ce savoir est censé voyager, de toute façon."
  ],
  "steps": [
    {
      "id": "what-you-need",
      "title": "1. Ce qu'il te faut",
      "paragraphs": [
        "Un ordinateur avec un terminal (les commandes ci-dessous sont pour Linux ou Mac ; un Raspberry Pi fait l'affaire). Environ 15 minutes pour essayer l'app sur ta propre machine. Déployer un vrai serveur pour des membres prend une après-midi entière et demande un nom de domaine et un petit serveur — les guides fournis dans le téléchargement couvrent tout ça."
      ]
    },
    {
      "id": "get-the-software",
      "title": "2. Récupère le logiciel",
      "paragraphs": [
        "La méthode facile : sur la communauté de cette page même — ou n'importe quelle communauté Understoria que tu peux joindre — ouvre le Menu (en haut à droite) → Infrastructure de la communauté → la carte « Le logiciel lui-même ». Télécharge LES DEUX fichiers : l'archive du code source et les sommes de contrôle. Mets-les dans le même dossier.",
        "La méthode terminal (remplace l'adresse par celle de ta communauté) :",
        "Certains serveurs proposent aussi un « paquet avec tout l'historique ». Il est plus gros, et si tu as git installé, c'est le meilleur téléchargement : tu obtiens tout l'historique de développement, et des mises à jour normales par la suite. Si tu prends le paquet, dépaquette-le avec git plutôt qu'avec tar :"
      ],
      "code": [
        "mkdir understoria-download && cd understoria-download\ncurl -fsSO https://YOUR-COMMUNITY.example/source/understoria-source.tar.gz\ncurl -fsSO https://YOUR-COMMUNITY.example/source/SHA256SUMS",
        "curl -fsSO https://YOUR-COMMUNITY.example/source/understoria.bundle\ngit clone understoria.bundle understoria"
      ]
    },
    {
      "id": "verify",
      "title": "3. Vérifie ce que tu as téléchargé",
      "paragraphs": [
        "Une somme de contrôle est une empreinte calculée à partir des octets exacts du fichier. Si un seul octet a changé en chemin — une connexion capricieuse, un téléchargement coupé — l'empreinte change du tout au tout. Vérifie-la avant de construire quoi que ce soit. Tu veux voir « OK ». Tout autre résultat : supprime et retélécharge.",
        "Sois honnête avec toi-même sur ce que ça prouve : la somme de contrôle vient du même serveur que le fichier, donc elle prouve que le téléchargement est arrivé intact — elle ne peut pas prouver que personne n'a modifié le code sur ce serveur. Cette confiance-là, tu l'accordes déjà tous les jours à la personne qui opère ton serveur (c'est elle qui te sert l'app que tu utilises en ce moment). Pour une confirmation indépendante, va chercher les sommes de contrôle d'une deuxième communauté pour la même version et compare — il faudrait que deux opératrices ou opérateurs se liguent pour tromper cette vérification.",
        "Ensuite, dépaquette. L'archive s'extrait dans le dossier courant, alors crées-en un d'abord :"
      ],
      "code": [
        "# Linux:\nsha256sum -c SHA256SUMS\n# Mac:\nshasum -a 256 -c SHA256SUMS",
        "mkdir understoria\ntar -xzf understoria-source.tar.gz -C understoria\ncd understoria"
      ]
    },
    {
      "id": "try-it",
      "title": "4. Essaie-le avant de t'engager à quoi que ce soit",
      "paragraphs": [
        "Tu peux faire tourner l'app entière sur ta propre machine et dérouler un vrai échange de bout en bout. Le dossier que tu viens de dépaqueter contient tous les guides du projet, dans son dossier docs — ouvre docs/quickstart.md dans n'importe quel éditeur de texte et suis-le depuis sa première étape. Là où il dit de cloner le dépôt, saute cette étape : tu es déjà dans le dossier du code source.",
        "Ça vaut la peine même si tu n'as aucun doute. Tu feras toi-même tes premiers pas de membre, tu publieras un besoin et tu confirmeras un échange — comme ça, quand ton premier vrai membre sera coincé quelque part, tu auras déjà vu son écran."
      ]
    },
    {
      "id": "deploy",
      "title": "5. Déploie-le pour ta communauté",
      "paragraphs": [
        "Les guides complets pour le serveur sont dans le même dossier docs, écrits exactement pour ce moment. Choisis selon la façon dont tu veux le faire tourner : docs/deploy-linode.md (Docker sur un petit serveur dans les cinq dollars — le chemin le plus emprunté, presque entièrement automatisé par un script d'installation) ou docs/deploy-alternatives.md (Podman, ou un Linux tout simple sans aucun conteneur — la bonne forme pour du matériel donné).",
        "Une traduction à faire au fil de ta lecture, puisque les deux guides commencent par cloner depuis le dépôt public : là où un guide dit de cloner dans un dossier du serveur, copie plutôt ton archive vérifiée à cet endroit et extrais-la. Tout le reste — la clé système, le fichier de réglages, les clés fondatrices, les sauvegardes, la liste « avant d'ouvrir au public » — s'applique tel quel.",
        "Pour mettre à jour plus tard, sans git : télécharge l'archive plus récente depuis n'importe quel serveur qui fait tourner la nouvelle version, vérifie-la de la même façon, extrais-la dans un dossier neuf, reprends ton fichier de réglages et redéploie. Les données de ta communauté ne risquent rien pendant l'opération — elles ne vivent jamais dans le dossier du code source."
      ],
      "code": [
        "scp understoria-source.tar.gz SHA256SUMS root@YOUR-SERVER:/opt/\nssh root@YOUR-SERVER\ncd /opt && sha256sum -c SHA256SUMS && mkdir understoria \\\n  && tar -xzf understoria-source.tar.gz -C understoria\ncd understoria"
      ]
    },
    {
      "id": "seed",
      "title": "6. Toi aussi, tu es maintenant une semence",
      "paragraphs": [
        "Dès que ton serveur est en ligne, il propose SON propre code source de la même façon — automatiquement, depuis le même build. Tes membres peuvent vérifier ce qu'ils font tourner, et le prochain quartier peut démarrer à partir de toi comme tu viens de démarrer à partir de ta communauté. Aucun point unique — ni GitHub, ni les autrices et auteurs du projet, ni aucun opérateur pris à part — ne peut retirer le logiciel à tout le monde d'un seul coup.",
        "Deux habitudes gardent la chaîne solide : redéploie de temps en temps (ton serveur propose le code source de ce qu'il fait tourner, donc faire tourner quelque chose de récent, c'est semer quelque chose de récent), et connais le serveur d'une deuxième communauté — la vérification « compare deux serveurs » ci-dessus ne fonctionne que si les communautés peuvent se nommer l'une l'autre."
      ]
    }
  ],
  "closing": [
    "Les questions auxquelles cette page ne répond pas vivent dans le dossier docs du téléchargement — docs/bootstrap-from-a-node.md est ce même parcours pas à pas avec plus de détail, et docs/operator-guide.md est le manuel du quotidien pour qui garde le serveur en marche."
  ]
};
