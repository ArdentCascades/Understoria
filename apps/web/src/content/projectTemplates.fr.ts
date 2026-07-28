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
// French project templates (i18n Phase 2b). Loaded lazily via
// content/bundles/fr.ts — never import this statically from app
// code.
import type { ProjectTemplate } from "./projectTemplates";

export const PROJECT_TEMPLATES_FR: readonly ProjectTemplate[] = [
  {
    "id": "community-fridge",
    "name": "Frigo communautaire et garde-manger en libre-service",
    "purpose": "Offrir un accès gratuit, 24 h sur 24, à de la nourriture et des produits essentiels, sans poser de questions.",
    "whoItServes": "Toute personne qui a besoin de manger ; particulièrement utile pour les gens aux horaires irréguliers, les voisines et voisins sans papiers, et celles et ceux qui ne peuvent pas passer à une banque alimentaire aux heures de bureau.",
    "whatYoullNeed": "Un frigo donné, un coin extérieur abrité avec une prise, un lieu d'accueil et un petit roulement de nettoyage.",
    "setupHours": 18,
    "defaultCategory": "food",
    "firstSteps": "Commence par le lieu d'accueil, pas par le frigo. Assieds-toi avec la personne qui tient la boutique, l'église ou la clinique que tu as en tête et parlez des côtés pas glamour — la facture d'électricité, ce qui se passe quand quelqu'un laisse tout en désordre, qui appeler quand ça tombe en panne — avant de chercher le moindre appareil. Pendant que tu y es, demande aux banques alimentaires et aux groupes d'entraide déjà actifs dans le coin quels manques ils voient, pour que le frigo en comble un au lieu de les doubler.",
    "commonPitfalls": "Les frigos communautaires ne meurent presque jamais d'un manque de dons — ils meurent quand personne n'est clairement responsable du nettoyage, que le frigo devient repoussant et que le lieu d'accueil demande discrètement qu'on le reprenne. Mets des noms sur le roulement avant le jour d'ouverture, et prends soin de la relation avec le lieu d'accueil comme de la vraie chose à entretenir — pas seulement de l'appareil.",
    "pairsWith": [
      "gleaning-network",
      "food-preservation",
      "community-meal"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Trouve un lieu d'accueil avec du courant et du passage",
        "description": "Va voir les petits commerces, les églises, les cliniques ou les centres sociaux. Demande si tu peux installer un frigo sous leur auvent et le brancher (l'électricité coûte en général quelques dollars par mois — propose de les payer). Obtiens un accord écrit, même tout simple.",
        "hours": 3,
        "skills": [
          "parler aux gens"
        ]
      },
      {
        "name": "Déniche un frigo et un abri qui résiste aux intempéries",
        "description": "Lance un appel pour un frigo en état de marche dans les groupes du coin. Construis ou récupère un simple caisson ou appentis en bois autour pour le protéger de la pluie et du soleil. Fixe-le pour qu'il ne puisse pas basculer. Ça comprend le trouver, le transporter et monter l'abri.",
        "hours": 8,
        "skills": [
          "menuiserie",
          "conduite"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Pose les règles du jeu et étiquette tout",
        "description": "Affiche un panneau clair et multilingue : prends ce dont tu as besoin, laisse ce que tu peux, rien de périmé, pas de conserves maison ni de viande crue. Ajoute des étiquettes et un marqueur pour que les gens puissent dater les produits.",
        "hours": 1.5,
        "skills": [
          "écriture",
          "traduction"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Recrute un roulement de nettoyage et de réapprovisionnement",
        "description": "Monte un planning hebdomadaire partagé. Chaque créneau dure environ 15 minutes : essuyer les surfaces, jeter ce qui est abîmé ou périmé et noter ce qui vient à manquer. Garde des produits de nettoyage sur place.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "organisation"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Tisse des liens avec des sources de dons",
        "description": "Demande aux boulangeries, épiceries, restaurants et marchés de producteurs des dons réguliers en fin de journée. Trouve une personne bénévole pour la collecte. Note quelles sources sont fiables.",
        "hours": 3,
        "skills": [
          "parler aux gens"
        ]
      },
      {
        "name": "Mets en place un contact en cas de pépin",
        "description": "Affiche un seul numéro ou une adresse mail sur le frigo pour « frigo en panne / plus de courant / une question ». Décide qui répond et sous quel délai.",
        "hours": 0.5
      }
    ]
  },
  {
    "id": "community-garden",
    "name": "Jardin communautaire / parcelle partagée",
    "purpose": "Cultiver ensemble des légumes frais et gratuits et créer un lieu de rencontre.",
    "whoItServes": "Les voisines et voisins sans jardin, les personnes que le prix des courses met sous pression, et quiconque cherche du lien et une raison d'être dehors.",
    "whatYoullNeed": "Un bout de terrain (même une friche ou un toit), de la terre ou des bacs, un accès à l'eau, des graines et un noyau de 5 à 10 personnes régulières.",
    "setupHours": 25,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Avant de toucher la terre, parle à deux groupes de personnes : qui possède le terrain, et les voisins qui vivent juste à côté — leur bénédiction compte autant que le bail. Réunis ensuite ton noyau de personnes régulières et ayez tôt la conversation sur le partage ; savoir si ce seront des parcelles individuelles ou une récolte commune change tout ce que vous allez construire.",
    "commonPitfalls": "Les jardins ne meurent pas souvent au printemps — ils meurent pendant les semaines les plus chaudes, quand le roulement d'arrosage s'effondre en silence et que les bacs grillent. L'autre danger lent, c'est qu'une seule personne le traite comme son jardin avec des aides ; écrivez comment se prennent les décisions pendant que tout le monde s'apprécie encore.",
    "pairsWith": [
      "seed-library",
      "community-composting",
      "food-preservation"
    ],
    "tasks": [
      {
        "name": "Obtiens un terrain et une autorisation",
        "description": "Repère une friche, une cour d'église, un terrain d'école ou un coin de parc inutilisé. Trouve qui en est propriétaire (le cadastre, ou demande tout simplement). Obtiens une autorisation ou un bail écrit, même un accord d'un an signé sur un coin de table, et confirme l'accès à l'eau.",
        "hours": 6,
        "skills": [
          "parler aux gens"
        ]
      },
      {
        "name": "Analyse le sol et dessine les bacs",
        "description": "Envoie un test de sol pas cher à un service d'analyse agricole local pour écarter le plomb et les polluants. Si le sol est mauvais, prévois des bacs surélevés avec de la terre saine. Esquisse l'emplacement des bacs, des allées et d'un coin outils.",
        "hours": 2,
        "skills": [
          "jardinage"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Rassemble le matériel et construis",
        "description": "Récupère du bois, ou pars sur des bacs en bottes de paille ou en trou de serrure, du compost et du paillis. Organise une journée de chantier ; à plusieurs, les bacs montent vite. Installe un tuyau ou des récupérateurs d'eau de pluie.",
        "hours": 10,
        "skills": [
          "menuiserie"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Décidez ensemble du mode de partage",
        "description": "Mettez-vous d'accord en groupe : parcelles individuelles, récolte entièrement commune, ou un mélange. Écrivez comment la récolte se répartit et comment se prennent les décisions.",
        "hours": 1,
        "skills": [
          "animation"
        ]
      },
      {
        "name": "Plante selon ton climat et ta saison",
        "description": "Choisis des cultures faciles et généreuses pour ta zone (verdures, haricots, courges, tomates, herbes). Échelonne les semis pour que les récoltes ne tombent pas toutes en même temps. Étiquette les rangs.",
        "hours": 4,
        "recurringCadence": "cycle",
        "skills": [
          "jardinage"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Mets en place un roulement d'arrosage et de désherbage",
        "description": "Les plantes meurent de négligence plus que d'autre chose. Monte un calendrier partagé tout simple ; relie les tâches à des rappels faciles. Garde l'engagement léger pour que personne ne s'épuise.",
        "hours": 1,
        "skills": [
          "organisation"
        ],
        "follows": [
          4
        ]
      },
      {
        "name": "Prévois la récolte et le surplus",
        "description": "Décidez des jours de récolte. Envoyez le surplus vers le frigo communautaire, les voisins ou un étal gratuit au portail. Gardez quelques graines pour l'an prochain.",
        "hours": 1,
        "recurringCadence": "cycle",
        "follows": [
          4
        ]
      }
    ]
  },
  {
    "id": "tool-lending-library",
    "name": "Bibliothèque d'outils et de matériel",
    "purpose": "Permettre aux voisins d'emprunter outils et matériel au lieu de les acheter, pour économiser et réduire le gaspillage.",
    "whoItServes": "Les locataires, les gens qui viennent d'acheter, les bricoleuses et bricoleurs du dimanche, et quiconque fait des réparations ou des projets de temps en temps.",
    "whatYoullNeed": "Un espace de rangement, des outils donnés, un système de prêt tout simple et une ou deux personnes « bibliothécaires ».",
    "setupHours": 20,
    "defaultCategory": "infrastructure",
    "firstSteps": "Avant de collecter la moindre perceuse, parle avec la personne qui offre l'espace de ce que vivre avec une bibliothèque d'outils veut vraiment dire — le bruit, les affaires qui s'accumulent, des inconnus à la porte pendant les permanences. Demande ensuite aux voisins ce qu'ils emprunteraient vraiment ; une liste de dix outils demandés vaut mieux qu'un garage plein de dons dont personne ne veut.",
    "commonPitfalls": "Les bibliothèques d'outils meurent du silence après la date de retour : personne ne relance, les outils glissent en prêts permanents et les étagères se vident. Une routine de rappels amicale compte plus qu'une politique de retard stricte — et prépare-toi à dire non à des dons, sinon tu deviendras la décharge du quartier pour outils cassés.",
    "pairsWith": [
      "library-of-things",
      "repair-cafe",
      "weatherization-brigade"
    ],
    "learnMore": [
      "confirm-exchange"
    ],
    "tasks": [
      {
        "name": "Trouve un local et des heures de permanence",
        "description": "Une cabane, un garage, un placard dans un centre social ou un conteneur font l'affaire. Choisis 2 à 4 heures de permanence fixes par semaine pour que les gens sachent quand venir.",
        "hours": 3,
        "skills": [
          "parler aux gens"
        ]
      },
      {
        "name": "Collecte et trie l'inventaire",
        "description": "Lance un appel aux dons (les gens ont des perceuses et des échelles en double partout). Nettoie, teste et étiquette chaque outil. Écarte ou répare tout ce qui n'est pas sûr.",
        "hours": 6,
        "skills": [
          "conduite"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Catalogue tout",
        "description": "Utilise un tableur gratuit ou une appli de prêt. Note chaque objet, son état et une photo. Numérote les outils pour les suivre facilement.",
        "hours": 4,
        "skills": [
          "saisie de données"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Écris les règles de prêt",
        "description": "Fixe la durée (par exemple une semaine), le nombre d'objets à la fois et la politique de retour ou de retard. Garde des règles souples — tout repose sur la confiance. Note les outils qui demandent un petit rappel de sécurité.",
        "hours": 1,
        "skills": [
          "écriture"
        ]
      },
      {
        "name": "Mets en place la fiche de sortie",
        "description": "Un porte-bloc ou un formulaire simple : nom, contact, objet, date de sortie, date de retour. Prends une photo rapide de l'état de l'outil au départ pour éviter les litiges.",
        "hours": 2,
        "skills": [
          "saisie de données"
        ],
        "follows": [
          2,
          3
        ]
      },
      {
        "name": "Forme tes bibliothécaires",
        "description": "Fais faire aux bénévoles le tour du catalogue, des étapes de prêt et de la sécurité de base (lunettes de protection, usage des échelles). Garde une antisèche d'une page au comptoir.",
        "hours": 2,
        "skills": [
          "enseignement"
        ],
        "follows": [
          4
        ]
      },
      {
        "name": "Entretiens et fais grandir la collection",
        "description": "Inspecte les outils rendus, affûte et huile régulièrement, et note ce que les gens demandent le plus pour savoir quoi ajouter ensuite.",
        "hours": 2,
        "skills": [
          "réparation d'outils"
        ],
        "recurringCadence": "session"
      }
    ]
  },
  {
    "id": "neighborhood-care-network",
    "name": "Réseau de soin entre voisins",
    "purpose": "Faire en sorte que les voisines et voisins isolés reçoivent des visites, du lien et du soutien.",
    "whoItServes": "Les personnes âgées, les voisines et voisins handicapés ou malades chroniques, les nouveaux parents et toute personne qui vit seule.",
    "whatYoullNeed": "Une liste de bénévoles, une façon de les apparier avec des voisins et une routine de prises de nouvelles. Les bénévoles sont des voisins, pas des professionnels du soin — vérifie les références de quiconque fait des visites à domicile, ne laisse jamais un bénévole gérer seul l'argent d'un voisin, et convenez à l'avance de quand appeler la famille ou les secours.",
    "setupHours": 18,
    "defaultCategory": "emotional_support",
    "firstSteps": "Commence par écouter, pas par recruter : parle avec les voisins que tu espères soutenir de ce qu'ils veulent vraiment — un appel hebdomadaire, un trajet, de la compagnie — parce qu'un réseau bâti sur des suppositions ressemble à de la surveillance. En parallèle, aie la conversation honnête avec les premiers bénévoles sur les vérifications et les limites, pour que les règles en place sonnent comme du soin, pas comme de la méfiance, au moment du premier binôme.",
    "commonPitfalls": "Les réseaux de soin échouent rarement par manque de bénévoles — ils épuisent les trois personnes qui disent toujours oui pendant que les autres attendent qu'on les sollicite. Répartis les binômes exprès, tiens les temps d'échange des bénévoles même quand tout semble aller, et ne laisse pas les prises de nouvelles transformer un voisin en dossier au lieu d'une personne.",
    "pairsWith": [
      "rides-transportation",
      "disability-support-network",
      "welcome-wagon"
    ],
    "learnMore": [
      "message-someone"
    ],
    "tasks": [
      {
        "name": "Repère qui vit autour",
        "description": "Identifie discrètement les voisins qui pourraient être isolés, par le bouche-à-oreille, les concierges d'immeuble, les cliniques et les groupes religieux. Ne présume jamais du besoin — invite les gens, ne les pointe pas du doigt.",
        "hours": 4,
        "skills": [
          "parler aux gens"
        ]
      },
      {
        "name": "Recrute et vérifie les bénévoles",
        "description": "Cherche des gens capables de s'engager sur un contact régulier. Pour toute visite à domicile ou aide à des adultes vulnérables, fais des vérifications de références de base et ne laisse jamais un bénévole gérer seul l'argent d'un voisin.",
        "hours": 5,
        "skills": [
          "parler aux gens",
          "entretiens"
        ]
      },
      {
        "name": "Forme les binômes avec soin",
        "description": "Apparie selon la langue, la proximité et le confort. Demande aux deux personnes ce qu'elles veulent — un appel hebdomadaire, une course, une discussion sur le perron — et respecte cette limite.",
        "hours": 2,
        "skills": [
          "organisation"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Fixe un rythme de prises de nouvelles",
        "description": "Convenez de la fréquence et du moyen (appel, message, toc à la porte). Donne aux bénévoles un petit canevas pour le premier contact, pour que ça sonne chaleureux, pas clinique.",
        "hours": 1,
        "follows": [
          2
        ]
      },
      {
        "name": "Prépare un plan pour donner l'alerte",
        "description": "Décide à l'avance quoi faire si quelqu'un ne répond pas ou semble en crise : qui appeler, quand prévenir la famille ou les secours, et comment le noter. Garde-le écrit et simple.",
        "hours": 2,
        "skills": [
          "écriture"
        ]
      },
      {
        "name": "Coordonne l'aide concrète",
        "description": "Note les besoins récurrents — trajets vers les rendez-vous, retraits d'ordonnances, déneigement — et relie-les à d'autres bénévoles ou projets de ton réseau.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "organisation"
        ]
      },
      {
        "name": "Prends soin des bénévoles aussi",
        "description": "Tiens un temps d'échange pour qu'ils puissent déposer ce qu'ils vivent. Le travail de soin épuise ; fais tourner les tâches et guette l'épuisement.",
        "hours": 2,
        "skills": [
          "animation"
        ],
        "recurringCadence": "month"
      }
    ]
  },
  {
    "id": "emergency-preparedness",
    "name": "Réseau de préparation aux urgences et catastrophes",
    "purpose": "Aider le quartier à se préparer et à réagir aux catastrophes (canicules, tempêtes, inondations, coupures de courant) quand les secours officiels tardent.",
    "whoItServes": "Tout le monde, en priorité les personnes qui ne peuvent pas évacuer facilement ou dont le matériel médical dépend du courant.",
    "whatYoullNeed": "Une liste de contacts, un point de rassemblement, du matériel de base et un plan de communication qui marche sans Internet. Ce réseau complète les services de secours officiels — il ne les remplace pas. Si une vie est en danger, appelle toujours d'abord les secours.",
    "setupHours": 30,
    "defaultCategory": "organizing",
    "firstSteps": "Construis le plan autour des gens à qui il est destiné : frappe aux portes des voisins sous oxygène, sous médicaments réfrigérés ou dans les étages sans ascenseur, et demande-leur à quoi ressemble une mauvaise semaine pour eux. Parle ensuite à qui contrôle ton point sûr probable et aux groupes d'urgence déjà en place (protection civile, pompiers) pour que ton réseau comble les trous autour de la réponse officielle au lieu de la doubler.",
    "commonPitfalls": "Ces réseaux n'échouent pas pendant la catastrophe — ils échouent dans les années calmes d'avant, quand la chaîne de contacts vieillit, que les numéros changent et que le plan vit sur l'ordinateur d'une seule personne. Imprimez tout, rafraîchissez la liste à un rythme fixé au calendrier et exercez-vous au moins une fois ; le premier vrai usage ne devrait jamais être le premier usage.",
    "pairsWith": [
      "cooling-warming-center",
      "community-first-aid-training",
      "community-wifi-mesh"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Cartographie les risques de ton quartier",
        "description": "Liste les catastrophes les plus probables chez toi. Note les points vulnérables : les gens dans les étages sans ascenseur, les personnes sous oxygène ou médicaments réfrigérés, les immeubles à sortie unique.",
        "hours": 4
      },
      {
        "name": "Monte une chaîne de contacts",
        "description": "Récolte des coordonnées, rue par rue, avec le consentement des gens. Désigne quelques « référentes ou référents de rue » qui veillent chacun sur une dizaine de foyers. Garde une copie papier — téléphones et Internet lâchent pendant les catastrophes.",
        "hours": 8,
        "skills": [
          "parler aux gens",
          "saisie de données"
        ]
      },
      {
        "name": "Prévois la communication hors ligne",
        "description": "Décidez comment vous joindre sans réseau mobile : toc aux portes, un point de rassemblement, des sifflets ou des radios. Imprime et distribue le plan.",
        "hours": 3,
        "skills": [
          "écriture"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Constitue une réserve commune",
        "description": "Assemble un kit de quartier : eau, premiers secours, lampes de poche, piles, une radio à piles ou à manivelle, des couvertures et des outils de base. Range-le là où plusieurs personnes y ont accès.",
        "hours": 5,
        "skills": [
          "conduite"
        ]
      },
      {
        "name": "Repère des points sûrs",
        "description": "Trouve des lieux qui pourraient servir d'espace de fraîcheur ou de chaleur, ou de point de recharge (une salle avec un groupe électrogène, un parc ombragé). Confirme l'accès à l'avance.",
        "hours": 3,
        "skills": [
          "parler aux gens"
        ]
      },
      {
        "name": "Organise un exercice ou une soirée d'info",
        "description": "Anime une session sur les sacs d'urgence, la coupure du gaz et de l'eau, et la chaîne de contacts. Entraînez-vous une fois pour ne pas apprendre pendant la vraie urgence.",
        "hours": 5,
        "skills": [
          "enseignement",
          "animation"
        ],
        "follows": [
          1,
          2
        ]
      },
      {
        "name": "Définis les rôles du « jour J »",
        "description": "Attribue à l'avance qui vérifie d'abord les personnes médicalement vulnérables, qui ouvre le point sûr et qui coordonne. Relisez et mettez à jour le plan deux fois par an.",
        "hours": 2,
        "skills": [
          "organisation"
        ],
        "follows": [
          4
        ]
      }
    ]
  },
  {
    "id": "free-store",
    "name": "Boutique gratuite / troc d'objets",
    "purpose": "Redistribuer gratuitement des vêtements, des objets du quotidien et des fournitures.",
    "whoItServes": "Tout le monde — les gens dans une passe difficile, les gens qui désencombrent, et la planète.",
    "whatYoullNeed": "Un espace (même éphémère), des tables ou des portants, des bénévoles pour trier et un rendez-vous régulier.",
    "setupHours": 10,
    "defaultCategory": "mutual_aid_drive",
    "suggestsWorkDays": true,
    "firstSteps": "Parle d'abord avec l'hôte du lieu des réalités concrètes — les piles de dons, le va-et-vient, l'état de la salle au lendemain matin — puis avec une friperie ou une association voisine de ce qui leur arrive déjà en trop, pour savoir ce qui manque vraiment à ton quartier. Si tu peux, passe une heure dans une boutique gratuite existante avant ton premier événement ; le circuit de réception et de présentation est plus facile à copier qu'à inventer.",
    "commonPitfalls": "Les boutiques gratuites se noient avant de mourir de faim : sans une liste ferme de oui et de non à la porte, les bénévoles passent chaque heure à trier des dons cassés et sales au lieu d'accueillir les gens. Et décidez où partent les restes avant la fin du premier événement — un tas d'objets sans preneur et sans plan de sortie, c'est comme ça qu'on perd un lieu d'accueil.",
    "pairsWith": [
      "repair-cafe",
      "library-of-things",
      "mutual-aid-moving-crew"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Choisis un format et un espace",
        "description": "Tranchez entre une boutique gratuite permanente, un rendez-vous éphémère récurrent ou un troc d'une journée. Empruntez une salle, un local ou un kiosque de parc. Une date qui revient crée l'habitude.",
        "hours": 2
      },
      {
        "name": "Fixe les critères de don",
        "description": "N'accepte que des objets propres, en état de marche et utilisables. Affiche une liste claire de « oui » et de « non » (pas d'électronique cassée, pas de vêtements tachés, pas de matériel bébé rappelé). Ça épargne un temps de tri énorme.",
        "hours": 0.5,
        "skills": [
          "écriture"
        ]
      },
      {
        "name": "Organise la réception et le tri",
        "description": "Installe des postes : réception, tri par catégorie, préparation pour la présentation. Prévois un plan pour ce que vous ne pouvez pas utiliser (redonner ailleurs ou recycler).",
        "hours": 2,
        "skills": [
          "organisation"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Présente pour qu'on puisse choisir avec dignité",
        "description": "Suspends les vêtements par taille, regroupe les objets du quotidien, garde l'espace rangé et accueillant. Pas de dossier, pas de preuve de besoin — chaque personne prend ce qui lui servira.",
        "hours": 1.5,
        "skills": [
          "déco"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Assure l'équipe le jour J",
        "description": "Répartis qui accueille, qui trie et qui répond aux questions. Un ton chaleureux et sans jugement, c'est tout l'enjeu.",
        "hours": 3,
        "skills": [
          "organisation"
        ],
        "recurringCadence": "event"
      },
      {
        "name": "Occupe-toi des restes",
        "description": "Prévois d'avance où partent les objets sans preneur après chaque événement (une association partenaire, le recyclage textile) pour que l'espace reparte propre.",
        "hours": 1,
        "skills": [
          "conduite"
        ]
      }
    ]
  },
  {
    "id": "skill-share",
    "name": "Partage de savoir-faire et cours gratuits",
    "purpose": "Permettre aux voisines et voisins de s'enseigner et d'apprendre entre eux, gratuitement — cuisine, réparations, langues, budget, premiers secours, numérique.",
    "whoItServes": "Tout le monde ; surtout les gens qui ne peuvent pas se payer de cours et les personnes dont le savoir est rarement reconnu.",
    "whatYoullNeed": "Un espace, des gens prêts à transmettre et une façon de publier le programme.",
    "setupHours": 9,
    "defaultCategory": "education",
    "firstSteps": "Le projet commence par les conversations à deux questions, pas par le local : demande aux gens ce qu'ils pourraient enseigner et ce qu'ils adoreraient apprendre, et prête une attention spéciale aux voisins dont le savoir est rarement traité comme une expertise. Ta première vraie tâche, c'est de rassurer autour d'un café une personne nerveuse qui pourrait enseigner : sa séance n'a pas besoin d'être un cours magistral.",
    "commonPitfalls": "Les partages de savoir-faire s'éteignent quand les deux mêmes personnes sûres d'elles finissent par tout enseigner et que le programme se plie en douce aux soirées libres de qui organise plutôt qu'à celles de qui vient. Continue de recruter des personnes qui enseignent pour la première fois, demande qui manque dans la salle, et considère une séance à cinq comme une réussite — parce que c'en est une.",
    "pairsWith": [
      "time-bank",
      "digital-literacy",
      "repair-cafe"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Sonde les savoir-faire et les envies",
        "description": "Pose deux questions aux membres : qu'est-ce que tu pourrais enseigner, et qu'est-ce que tu adorerais apprendre ? Rassemble les réponses dans un formulaire simple. Là où ça se recoupe, tu tiens ton programme.",
        "hours": 1.5,
        "skills": [
          "parler aux gens"
        ]
      },
      {
        "name": "Recrute et prépare qui va enseigner",
        "description": "Rassure les gens : « enseigner » peut rester informel. Aide-les à esquisser une séance d'une heure et à réunir le matériel. Associe les personnes qui débutent, nerveuses, à quelqu'un qui co-anime.",
        "hours": 3,
        "skills": [
          "enseignement",
          "animation"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Trouve un lieu et un horaire",
        "description": "Utilise une salle de bibliothèque, un centre social, un parc ou le salon de quelqu'un. Choisis des créneaux récurrents pour que ça devienne une routine.",
        "hours": 1.5
      },
      {
        "name": "Monte un programme",
        "description": "Liste les séances avec la date, le sujet, qui enseigne et quoi apporter. Publie-le là où les membres regardent déjà. Garde l'inscription légère, ou en entrée libre.",
        "hours": 1.5,
        "recurringCadence": "month",
        "skills": [
          "organisation"
        ],
        "follows": [
          1,
          2
        ]
      },
      {
        "name": "Rends-le accessible",
        "description": "Pense aux besoins de langue, à la garde d'enfants, à l'accès physique et aux horaires des gens qui travaillent. Demande à qui vient ce qui l'aiderait à venir.",
        "hours": 1.5,
        "skills": [
          "accessibilité",
          "traduction"
        ]
      }
    ]
  },
  {
    "id": "bulk-buying-coop",
    "name": "Groupement d'achats alimentaires",
    "purpose": "Mettre les commandes en commun pour acheter nourriture et produits de base en gros, à prix réduit.",
    "whoItServes": "Les foyers serrés par les prix des courses, les familles nombreuses et les quartiers sans commerces alimentaires accessibles.",
    "whatYoullNeed": "Un groupe de foyers engagés, une source en gros, un espace de réception et de répartition, et quelqu'un pour gérer les commandes.",
    "setupHours": 20,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Réunis tes foyers avant d'appeler le moindre fournisseur, et aie d'abord la conversation gênante sur l'argent : ce que chaque personne peut engager, comment le paiement se fait avant l'envoi des commandes, et ce que signifie sauter un cycle. Un appel avec un groupement d'achats existant — la plupart partagent volontiers leur tableur et leurs cicatrices — t'épargnera une saison d'essais et d'erreurs.",
    "commonPitfalls": "Les groupements d'achats meurent des frictions d'argent et de la fatigue de la coordination : quelqu'un avance l'argent et le vit mal, une commande reste impayée, ou une seule personne porte chaque cycle en silence jusqu'à ce qu'elle arrête — et tout s'arrête avec elle. Encaissez avant de commander, sans exception, et faites tourner la coordination dès le deuxième cycle, pas un jour peut-être.",
    "pairsWith": [
      "community-market",
      "food-preservation"
    ],
    "tasks": [
      {
        "name": "Réunis ton groupe d'achat",
        "description": "Recrute assez de foyers pour atteindre les minimums des fournisseurs (souvent 8 à 15). Convenez d'un cycle d'achat (hebdomadaire, tous les quinze jours, mensuel).",
        "hours": 4,
        "skills": [
          "parler aux gens"
        ]
      },
      {
        "name": "Trouve un fournisseur",
        "description": "Contacte des grossistes alimentaires, des coopératives agricoles, des fournisseurs de restaurants ou d'autres groupements d'achats. Compare minimums de commande, options de livraison et prix. Confirme quels produits de base ils proposent.",
        "hours": 4,
        "skills": [
          "parler aux gens"
        ]
      },
      {
        "name": "Mets en place les commandes",
        "description": "Utilisez un tableur ou un formulaire partagé où les membres saisissent leurs quantités avant la date limite. Désigne une personne qui totalise et passe la commande.",
        "hours": 3,
        "skills": [
          "saisie de données",
          "organisation"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Gère l'argent en toute transparence",
        "description": "Décidez du paiement d'entrée de jeu (encaissez avant de commander pour que personne n'avance d'argent). Notez chaque centime dans un registre partagé. Ajoutez une toute petite marge facultative pour la casse, pas pour le profit.",
        "hours": 2,
        "skills": [
          "comptabilité"
        ]
      },
      {
        "name": "Organise la livraison et un espace de répartition",
        "description": "Choisissez un endroit pour recevoir la livraison en gros — un garage, une salle, une allée. Prévoyez assez de bras pour le jour du déchargement.",
        "hours": 3,
        "skills": [
          "organisation"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Répartis les commandes équitablement",
        "description": "Installez des postes de répartition avec des balances pour les céréales et légumes en vrac. Imprime la liste de chaque foyer à l'avance. Revérifiez avant le retrait.",
        "hours": 3,
        "skills": [
          "organisation"
        ],
        "follows": [
          2,
          4
        ],
        "recurringCadence": "cycle"
      },
      {
        "name": "Faites tourner le travail",
        "description": "La coordination, la répartition et le retrait doivent tourner pour que personne ne porte tout. Passez en revue les prix et la fiabilité du fournisseur à chaque cycle.",
        "hours": 1,
        "recurringCadence": "cycle"
      }
    ]
  },
  {
    "id": "repair-cafe",
    "name": "Café de réparation",
    "purpose": "Réparer gratuitement ce qui est cassé — vêtements, électronique, vélos, meubles — au lieu de le jeter.",
    "whoItServes": "Quiconque a un objet cassé et ni l'argent ni le savoir-faire pour le réparer ; ça évite la décharge à des objets encore utiles.",
    "whatYoullNeed": "Des bénévoles habiles de leurs mains, des outils de base, un espace avec des tables et des prises, et une date récurrente.",
    "setupHours": 14,
    "defaultCategory": "skilled_labor",
    "suggestsWorkDays": true,
    "firstSteps": "Recrute tes deux ou trois premières personnes qui réparent avant toute autre chose — la voisine qui coud, le bricoleur de vélos — parce qu'une date et un lieu ne valent rien sans elles. Ensuite, fais le tour du lieu avec elles en parlant tables, prises et lumière, et s'il existe un café de réparation dans une ville voisine, va voir une séance : le circuit d'accueil est la partie qui vaut la peine d'être copiée.",
    "commonPitfalls": "Les cafés de réparation se transforment sans bruit en ateliers de dépôt gratuits : les gens laissent leurs objets et s'en vont, les personnes qui réparent deviennent des techniciennes non payées, et celle qui s'y connaît en électronique s'épuise la première. Tiens bon sur la règle que chacun reste à côté de sa réparation, et affiche clairement que certaines choses ne peuvent pas être sauvées — une déception gérée dès le départ est plus facile qu'un reproche après coup.",
    "pairsWith": [
      "tool-lending-library",
      "community-bike-workshop",
      "free-store"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Recrute des personnes qui réparent, par spécialité",
        "description": "Trouve des gens doués pour la couture, la petite électronique, les vélos, l'électroménager et le bois. Une ou deux personnes par catégorie suffisent pour commencer.",
        "hours": 4,
        "skills": [
          "réparation",
          "électronique",
          "couture"
        ]
      },
      {
        "name": "Installe les postes de réparation",
        "description": "Chaque poste a besoin d'une table, des bons outils, d'une bonne lumière et d'une prise. Regroupe les réparations qui se ressemblent. Étiquette clairement chaque poste.",
        "hours": 3,
        "recurringCadence": "session",
        "skills": [
          "organisation"
        ]
      },
      {
        "name": "Fixe une date récurrente",
        "description": "Une fois par mois marche bien. Choisis un lieu stable — bibliothèque, fablab, salle commune — pour que les gens sachent où apporter leurs objets.",
        "hours": 1
      },
      {
        "name": "Crée un circuit d'accueil",
        "description": "Une personne à l'accueil note chaque visite et chaque objet, puis oriente vers la bonne personne. Pose le cadre : on reste et on aide à sa propre réparation quand on peut ; c'est un lieu pour apprendre, pas un dépôt.",
        "hours": 2,
        "skills": [
          "écriture"
        ]
      },
      {
        "name": "Gère la sécurité et les attentes",
        "description": "Affiche que certains objets ne peuvent pas être sauvés et que les réparations sont tentées, jamais garanties. Prévois des gestes sûrs pour l'électrique et les batteries. Garde une trousse de premiers secours à portée de main.",
        "hours": 2
      },
      {
        "name": "Garde en stock les pièces et consommables courants",
        "description": "Aie sous la main du fil, des fusibles, de la colle, de la visserie, des chambres à air et des rustines. Note ce qui part pour pouvoir racheter.",
        "hours": 2,
        "recurringCadence": "session",
        "follows": [
          0
        ]
      }
    ]
  },
  {
    "id": "rides-transportation",
    "name": "Trajets et transport solidaires",
    "purpose": "Emmener les voisines et voisins aux rendez-vous médicaux, aux courses et aux démarches essentielles quand les transports et l'argent font obstacle.",
    "whoItServes": "Les personnes sans voiture, les voisines et voisins en situation de handicap, les personnes âgées et quiconque reste sans solution de transport.",
    "whatYoullNeed": "Des bénévoles au volant, une façon de demander et de répartir les trajets, et des règles claires de sécurité et d'assurance. Conduire des voisins est une vraie responsabilité — vérifiez le permis et l'assurance de chaque personne qui conduit, faites les vérifications pour qui transportera des personnes vulnérables, et ne remplacez jamais une ambulance par un trajet bénévole en cas d'urgence médicale.",
    "setupHours": 18,
    "defaultCategory": "transport",
    "firstSteps": "Deux séries de conversations passent avant le premier trajet : assieds-toi avec chaque personne prête à conduire pour vérifier permis et assurance et parler franchement des vérifications, et parle avec les gens qui ont besoin de trajets — et avec les clubs des aînés et les centres de santé qui les connaissent — des destinations, horaires et besoins de mobilité réels. La conversation sur les vérifications est plus facile comme habitude fondatrice que comme règle imposée après coup.",
    "commonPitfalls": "Les réseaux de trajets échouent sur la répartition, pas au volant : les demandes atterrissent sur le téléphone d'une seule personne jusqu'à l'épuiser, et les deux mêmes conducteurs fiables reçoivent chaque demande pendant qu'on ne rappelle plus jamais les autres après un seul non. Faites tourner le rôle de coordination, répartissez les demandes exprès, et ne laissez jamais la question de l'assurance attendre le premier accrochage.",
    "pairsWith": [
      "health-navigation",
      "community-bike-workshop",
      "court-support"
    ],
    "learnMore": [
      "claim-post"
    ],
    "tasks": [
      {
        "name": "Recrute et vérifie les personnes qui conduisent",
        "description": "Vérifie que chaque personne a un permis valide, une assurance et un véhicule sûr. Pour les trajets avec des personnes vulnérables, fais des vérifications de références ou d'antécédents selon les usages de ton coin.",
        "hours": 5,
        "skills": [
          "conduite"
        ]
      },
      {
        "name": "Règle l'assurance et la responsabilité",
        "description": "Vérifie ce que l'assurance personnelle de chaque conducteur couvre pour la conduite bénévole. Pense à une décharge simple et consulte une permanence juridique gratuite — ça protège tout le monde.",
        "hours": 4,
        "skills": [
          "paperasse"
        ]
      },
      {
        "name": "Mets en place un système de demandes",
        "description": "Choisis un seul canal pour demander un trajet (ligne téléphonique, formulaire, groupe de discussion) avec un délai (par exemple 48 heures). Note l'heure de départ, les lieux, les besoins de mobilité et les coordonnées.",
        "hours": 2,
        "skills": [
          "organisation",
          "informatique"
        ]
      },
      {
        "name": "Construis une routine de répartition",
        "description": "Une personne coordinatrice (à tour de rôle) associe les demandes aux conducteurs disponibles et confirme des deux côtés la veille. Garde une liste de renfort pour les annulations.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "organisation"
        ],
        "follows": [
          0,
          2
        ]
      },
      {
        "name": "Définis ce qui est couvert",
        "description": "Décidez quels trajets comptent (médical, courses, démarches essentielles) et votre zone. Soyez clairs sur les temps d'attente et sur qui aide à porter les sacs.",
        "hours": 1,
        "skills": [
          "animation"
        ]
      },
      {
        "name": "Gère les frais",
        "description": "Décidez comment l'essence est couverte — une petite caisse commune, des participations libres, ou rien. Reste transparent et ne laisse jamais ça devenir un obstacle pour la personne transportée.",
        "hours": 2,
        "follows": [
          4
        ]
      },
      {
        "name": "Veille sur les personnes transportées et celles qui conduisent",
        "description": "Posez des repères : on n'entre pas seul chez les gens, pas d'argent au-delà des frais convenus, et un petit suivi après les trajets avec des personnes vulnérables. Note chaque trajet.",
        "hours": 2,
        "follows": [
          0
        ]
      }
    ]
  },
  {
    "id": "tenant-union",
    "name": "Syndicat de locataires et réseau de défense contre les expulsions",
    "purpose": "Organiser les locataires pour se défendre contre les expulsions, les logements insalubres et les hausses de loyer abusives par l'action collective.",
    "whoItServes": "Les locataires, surtout dans les immeubles aux propriétaires négligents ou absents, et quiconque risque une expulsion.",
    "whatYoullNeed": "Un noyau organisateur, des infos locales exactes sur les droits des locataires, un lien avec une permanence juridique et un système de contact rapide. Ce projet soutient les locataires et partage de l'information juridique publique ; il ne remplace pas un conseil juridique. Oriente toujours les cas individuels vers une aide juridique qualifiée avant les échéances.",
    "setupHours": 30,
    "defaultCategory": "housing",
    "firstSteps": "Parle aux locataires concernés avant tout contact avec un propriétaire, toujours — fais du porte-à-porte, écoute ce que les gens craignent et veulent vraiment, et laisse les locataires de chaque immeuble donner le rythme : ce sont eux qui portent le risque de représailles, pas les personnes qui organisent. En parallèle, présente-toi tôt à la permanence juridique locale ; tu voudras cette relation avant le premier avis d'expulsion, pas après.",
    "commonPitfalls": "La façon dont un syndicat de locataires blesse les gens, c'est en allant plus vite que les locataires eux-mêmes : une confrontation lancée avant qu'un immeuble soit prêt expose les voisines les plus vulnérables à des représailles qu'elles n'ont pas choisies. L'échec plus silencieux, c'est de glisser du partage d'information juridique vers le conseil juridique — oriente chaque cas individuel vers une aide juridique qualifiée avant les échéances, à chaque fois.",
    "pairsWith": [
      "legal-aid-clinic",
      "mutual-aid-moving-crew",
      "solidarity-fund"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Recrute un comité organisateur",
        "description": "Trouve 3 à 6 locataires engagés pour ancrer le travail. Cherche des personnes respectées dans leur immeuble. Accordez-vous sur les rôles, un rythme de réunions et des objectifs communs.",
        "hours": 5,
        "skills": [
          "organisation"
        ]
      },
      {
        "name": "Cartographie les immeubles et les problèmes des locataires",
        "description": "Fais du porte-à-porte ou une enquête pour savoir quels immeubles ont des problèmes et lesquels (réparations ignorées, frais illégaux, harcèlement). Repère les tendances et les personnes moteurs de chaque immeuble.",
        "hours": 8,
        "skills": [
          "porte-à-porte",
          "entretiens"
        ]
      },
      {
        "name": "Rassemble des infos locales exactes sur les droits des locataires",
        "description": "Compile les vraies règles de ton coin sur les délais d'avis d'expulsion, les réparations, les dépôts de garantie et les loyers. Fais-les vérifier par une permanence juridique. C'est de l'information partagée, pas un conseil juridique — dis-le clairement aux membres.",
        "hours": 4,
        "skills": [
          "paperasse",
          "écriture"
        ]
      },
      {
        "name": "Monte un système de contact en réponse rapide",
        "description": "Mets en place une chaîne téléphonique ou un groupe de discussion pour qu'une personne qui reçoit un avis d'expulsion ou trouve sa serrure changée joigne vite le syndicat. Décidez qui répond et en combien de temps.",
        "hours": 3,
        "skills": [
          "organisation",
          "dépannage informatique"
        ]
      },
      {
        "name": "Organise un atelier « connais tes droits »",
        "description": "Anime une séance (idéalement avec un partenaire d'aide juridique) qui passe en revue les droits et quoi faire si on reçoit des papiers. Prévois des guides imprimés à emporter dans les langues utiles.",
        "hours": 4,
        "recurringCadence": "event",
        "skills": [
          "enseignement",
          "animation"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Prépare un protocole de réponse aux expulsions",
        "description": "Écris un pas-à-pas simple pour quand quelqu'un risque l'expulsion : tout documenter, contacter l'aide juridique avant l'échéance, organiser le soutien des voisins, et ne jamais ignorer les dates d'audience.",
        "hours": 3,
        "skills": [
          "écriture"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Relie-toi à l'aide juridique et au soutien durable",
        "description": "Construis une relation d'orientation avec des avocats de locataires, l'aide juridique et les conseillers logement, pour que le syndicat passe le relais sur les cas qui demandent des pros. Garde les contacts à jour.",
        "hours": 3,
        "skills": [
          "communication"
        ]
      }
    ]
  },
  {
    "id": "childcare-collective",
    "name": "Collectif de garde d'enfants et de baby-sitting",
    "purpose": "Partager une garde d'enfants de confiance entre familles pour que les parents puissent travailler, souffler ou gérer les urgences sans payer.",
    "whoItServes": "Les parents et les personnes qui s'occupent d'enfants, surtout les parents solos, les personnes en horaires décalés et les familles aux revenus modestes.",
    "whatYoullNeed": "Un groupe de familles vérifiées, un espace sûr (ou des maisons à tour de rôle), un système de planning et des règles de sécurité claires. S'occuper des enfants des autres est une vraie responsabilité — garde des règles de surveillance fermes, vérifie les personnes qui gardent et respecte les règles locales sur la garde d'enfants informelle.",
    "setupHours": 28,
    "defaultCategory": "childcare",
    "suggestsWorkDays": true,
    "firstSteps": "Ce projet se construit dans les salons avant de se construire ailleurs : réunis les familles fondatrices et parlez du concret inconfortable — vérifications, surveillance, styles d'éducation, ce qui se passe quand un enfant se fait mal — avant que quiconque planifie une seule heure de garde. Vérifie dès ce premier temps les règles locales sur la garde informelle, pour que le modèle choisi soit un modèle que vous pouvez vraiment tenir.",
    "commonPitfalls": "Deux choses cassent en silence les collectifs de garde : le déséquilibre des crédits, où les mêmes familles accueillent toujours jusqu'à en garder de la rancœur, et les règles de sécurité qui se relâchent à mesure que tout le monde se détend — l'exception « juste pour cette fois » à la règle jamais-seul est exactement comme ça que la confiance se détruit. Affichez l'équilibre au grand jour et prenez les règles de sécurité le plus au sérieux avec les familles que vous connaissez le mieux.",
    "pairsWith": [
      "toy-library",
      "time-bank",
      "youth-mentorship"
    ],
    "learnMore": [
      "what-is-balance"
    ],
    "tasks": [
      {
        "name": "Réunis les familles fondatrices et choisissez un modèle",
        "description": "Recrute des familles qui se connaissent ou peuvent bâtir la confiance entre elles. Décidez du modèle : une coopérative de garde tournante où les parents gagnent et dépensent des crédits de garde, ou une garde de groupe planifiée.",
        "hours": 4,
        "skills": [
          "communication",
          "animation"
        ]
      },
      {
        "name": "Posez les règles de sécurité et de vérification",
        "description": "Accordez-vous sur la vérification de toute personne qui garde : références, vérification d'antécédents quand c'est pertinent, et une règle ferme voulant qu'aucun adulte ne reste seul avec l'enfant d'une autre famille à l'insu des autres. Fixez les ratios adultes-enfants.",
        "hours": 6,
        "skills": [
          "garde d'enfants"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Trouve un espace et sécurise-le pour les enfants",
        "description": "Choisissez un lieu ou posez des critères pour les maisons qui accueillent. Traquez les dangers, couvrez les prises, fixez les meubles lourds, mettez médicaments et produits ménagers sous clé, et vérifiez l'espace extérieur s'il sert.",
        "hours": 4,
        "skills": [
          "garde d'enfants",
          "bricolage"
        ]
      },
      {
        "name": "Crée un système de planning et de crédits",
        "description": "Utilisez un calendrier partagé ou une appli de coopérative. Dans un modèle à crédits, une heure de garde donnée vaut une heure à recevoir. Notez qui accueille quand, pour que la charge reste juste.",
        "hours": 3,
        "skills": [
          "organisation",
          "saisie de données"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Pose les règles santé, allergies et urgences",
        "description": "Rassemble pour chaque enfant les allergies, les médicaments, les contacts d'urgence et qui peut venir le chercher. Écris une règle claire pour les enfants malades et la marche à suivre en cas d'urgence médicale.",
        "hours": 3,
        "skills": [
          "paperasse",
          "écriture"
        ]
      },
      {
        "name": "Forme les personnes qui gardent aux bases",
        "description": "Couvrez la surveillance, le sommeil sûr des bébés, la réponse aux allergies et aux urgences, et les règles de sécurité. Visez au moins une personne formée aux premiers secours pédiatriques et à la RCP par séance.",
        "hours": 5,
        "skills": [
          "enseignement",
          "premiers secours"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Fais une séance d'essai et recueille les retours",
        "description": "Tenez un court pilote avec quelques familles, puis débriefez. Corrigez ce qui n'a pas marché avant de grandir. Reparlez-vous régulièrement pour que la confiance et la sécurité restent solides.",
        "hours": 3,
        "skills": [
          "garde d'enfants"
        ],
        "follows": [
          2,
          5
        ]
      }
    ]
  },
  {
    "id": "community-composting",
    "name": "Programme de compostage communautaire",
    "purpose": "Collecter les restes alimentaires pour les détourner de la décharge et produire du compost gratuit pour les jardins du coin.",
    "whoItServes": "Les foyers sans moyen de composter, les jardins partagés et l'environnement local.",
    "whatYoullNeed": "Un site de compostage, des bacs de collecte, un peu de matériel et un petit roulement d'entretien.",
    "setupHours": 22,
    "defaultCategory": "infrastructure",
    "suggestsWorkDays": true,
    "firstSteps": "Parle à la personne qui accueille le site et aux voisins à portée d'odeur avant l'arrivée du premier bac — la peur des odeurs et des rats tue les sites de compost, et une conversation honnête et précoce la désamorce mieux que n'importe quel dépliant. Trouve ensuite la future maison de ton compost (un jardin partagé qui en veut) et au moins une personne qui a vraiment gardé un tas chaud en vie ; son regard guidera le choix de la méthode.",
    "commonPitfalls": "Les projets de compost meurent quand personne ne porte le retournage : le tas cale ou se met à sentir, un voisin se plaint, et l'hôte retire sa permission — cette chaîne va plus vite qu'on ne croit. Ajuste la quantité de restes collectés à ce que votre roulement peut vraiment traiter, et traite un bac contaminé comme un problème d'affichage à corriger, pas comme une personne bénévole à blâmer.",
    "pairsWith": [
      "community-garden",
      "community-meal"
    ],
    "tasks": [
      {
        "name": "Trouve un site de compostage",
        "description": "Trouve un coin avec de la place et un peu de soleil — l'angle d'un jardin partagé, un terrain vague ou une cour prêtée. Confirme la permission et vérifie les règles locales sur le compost.",
        "hours": 4,
        "skills": [
          "communication"
        ]
      },
      {
        "name": "Choisis une méthode de compostage",
        "description": "Prends ce qui colle à ton échelle : trois bacs en compost chaud, des composteurs rotatifs ou des lombricomposteurs. Ajuste la méthode à la matière attendue et au retournage que vous pouvez assurer.",
        "hours": 3,
        "skills": [
          "compostage"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Trouve les bacs et le matériel",
        "description": "Construis ou achète les bacs de collecte et la structure de compostage. Rassemble une fourche, un thermomètre et de la matière brune (feuilles, carton) pour équilibrer les restes alimentaires.",
        "hours": 4,
        "skills": [
          "menuiserie",
          "conduite"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Mets en place la collecte",
        "description": "Décidez comment les restes arrivent : un bac de dépôt avec des horaires fixes ou une tournée bénévole de ramassage. Donne aux gens des petits seaux de cuisine et un calendrier de dépôt clair.",
        "hours": 4,
        "skills": [
          "organisation"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Rends clair ce qui est accepté",
        "description": "Affiche une liste simple oui/non (oui : fruits, légumes, café, coquilles d'œuf ; non : viande, laitages, huiles, déjections d'animaux). Un affichage clair évite la contamination qui gâche un bac.",
        "hours": 2,
        "skills": [
          "écriture",
          "traduction"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Recrute et forme un roulement d'entretien",
        "description": "Le compost demande d'être retourné, surveillé côté humidité et équilibré entre verts et bruns. Montez un planning partagé et apprenez les bases aux bénévoles pour que les tas ne sentent pas et ne calent pas.",
        "hours": 3,
        "skills": [
          "compostage",
          "enseignement"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Distribue le compost mûr",
        "description": "Quand le compost est prêt, partage-le gratuitement avec les personnes qui ont contribué et les jardins partagés. Annonce des jours de retrait et prévois sacs ou seaux.",
        "hours": 2,
        "skills": [
          "conduite"
        ],
        "recurringCadence": "cycle"
      }
    ]
  },
  {
    "id": "free-little-library",
    "name": "Boîte à livres et échange de livres",
    "purpose": "Offrir des livres gratuits 24 h sur 24 pour encourager la lecture et le partage, sans carte de bibliothèque ni frais.",
    "whoItServes": "Les enfants, les familles et les personnes qui lisent, de tout âge, surtout dans les quartiers où les livres sont difficiles d'accès.",
    "whatYoullNeed": "Une boîte à livres résistante aux intempéries, une collection de départ, un emplacement hôte et un entretien léger.",
    "setupHours": 7.5,
    "defaultCategory": "education",
    "firstSteps": "Commence par deux courtes conversations : une avec la personne dont le mur ou le jardin accueillera la boîte, sur l'emplacement et ce qui se passe si elle se dégrade, et une avec les familles et l'école d'à côté sur les livres qu'elles rapporteraient vraiment chez elles. Trouve la personne qui veillera sur la boîte — celle qui passera chaque semaine — avant de l'installer, pas après.",
    "commonPitfalls": "Les boîtes à livres ne meurent pas d'un manque de livres — elles meurent des mauvais : quelqu'un dépose un carton de manuels périmés, les bons titres se retrouvent enterrés, la pluie entre, et les gens arrêtent de regarder sans rien dire. Une visite hebdomadaire de cinq minutes évite presque tout ; la boîte a plus besoin d'une personne que de dons.",
    "pairsWith": [
      "seed-library",
      "books-to-prisoners"
    ],
    "tasks": [
      {
        "name": "Construis ou récupère une boîte à livres résistante aux intempéries",
        "description": "Fabrique ou achète une boîte solide et étanche, sur un poteau ou un mur. Un meuble détourné ou un ancien casier à journaux fait l'affaire. Ajoute une porte vitrée et un toit en pente pour garder les livres au sec.",
        "hours": 4,
        "skills": [
          "menuiserie"
        ]
      },
      {
        "name": "Choisis et prépare l'emplacement",
        "description": "Prends un endroit passant et autorisé — ton propre jardin de devant, un centre communautaire ou la bordure d'un parc. Ancre bien la boîte et vérifie que c'est permis.",
        "hours": 1,
        "skills": [
          "communication"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Garnis la collection de départ",
        "description": "Rassemble des dons de livres avec une petite collecte. Vise un mélange : livres pour enfants, romans populaires et livres pratiques. Démarre à moitié pleine pour laisser la place d'ajouter.",
        "hours": 1.5,
        "skills": [
          "communication"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Ajoute un panneau et des repères simples",
        "description": "Affiche « Prends un livre, laisse un livre — tout est gratuit ». Reste accueillant, avec peu de règles. Ajoute un mot qui invite tous les âges et toutes les langues.",
        "hours": 0.5,
        "skills": [
          "écriture"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Trouve une personne pour veiller sur la boîte",
        "description": "Demande à quelqu'un du coin de passer chaque semaine : ranger, retirer ce qui est abîmé ou inapproprié, et rééquilibrer le stock. Cinq minutes par semaine la gardent en bonne santé.",
        "hours": 0.5,
        "skills": [
          "communication"
        ]
      }
    ]
  },
  {
    "id": "community-first-aid-training",
    "name": "Formation communautaire aux premiers secours et à la réponse aux surdoses",
    "purpose": "Former les voisines et voisins aux premiers secours, à la RCP et aux gestes qui stoppent une surdose, pour que la communauté puisse agir dans les minutes avant l'arrivée des secours.",
    "whoItServes": "Tout le monde ; d'autant plus utile là où les secours tardent ou là où les surdoses sont fréquentes.",
    "whatYoullNeed": "Des personnes formatrices certifiées, du matériel, une salle et un calendrier récurrent. Toute formation médicale doit être donnée par des personnes certifiées ; ce projet organise et accueille cette formation, il ne la remplace pas.",
    "setupHours": 17,
    "defaultCategory": "education",
    "firstSteps": "Ta première conversation est pour celles et ceux qui enseigneront vraiment — la Croix-Rouge, les services de santé ou un groupe de réduction des risques. Demande ce qu'il leur faut d'un lieu d'accueil et quelles dates ils peuvent offrir, puis parle avec les personnes les plus susceptibles d'être témoins d'une urgence — les proches de personnes qui consomment, le personnel des commerces voisins — pour bâtir les premières séances autour d'elles.",
    "commonPitfalls": "Ce projet s'éteint quand il devient un grand événement de formation qui ne se répète jamais — les gestes rouillent et la naloxone périme sans que personne le remarque. Et résistez à l'envie d'enseigner vous-mêmes le contenu médical : votre rôle est d'accueillir des personnes formatrices certifiées, pas de les remplacer.",
    "pairsWith": [
      "harm-reduction-supplies",
      "emergency-preparedness"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Fais équipe avec des personnes formatrices certifiées",
        "description": "Relie-toi à des instructeurs qualifiés — la Croix-Rouge, les services de santé locaux ou une association de réduction des risques. Ce sont eux qui donnent la vraie formation médicale ; ton rôle est de l'organiser et de l'accueillir.",
        "hours": 4,
        "skills": [
          "communication"
        ]
      },
      {
        "name": "Rassemble le matériel",
        "description": "Procure-toi des trousses de premiers secours, des mannequins d'entraînement à la RCP (souvent prêtés par qui forme) et de la naloxone. Beaucoup de programmes de santé publique distribuent la naloxone gratuitement — demande aux services de santé ou aux groupes de réduction des risques.",
        "hours": 3,
        "skills": [
          "communication",
          "conduite"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Trouve une salle et planifie les séances",
        "description": "Réserve une salle où la pratique est possible — centre communautaire, bibliothèque ou centre de santé. Pose des dates récurrentes pour que les gens puissent s'organiser avec le travail.",
        "hours": 2
      },
      {
        "name": "Recrute les participantes et participants",
        "description": "Fais connaître les séances largement et donne la priorité aux personnes susceptibles d'être témoins d'urgences. Garde l'inscription simple et gratuite, et propose des horaires variés pour les personnes en horaires décalés.",
        "hours": 2,
        "skills": [
          "communication"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Tiens les séances de formation",
        "description": "Accueille les séances menées par les formateurs, gère l'installation et l'accueil, et assure-toi que tout le monde pratique avec les mains. Prévois des cartes mémo à emporter.",
        "hours": 4,
        "skills": [
          "organisation"
        ],
        "follows": [
          0,
          1,
          3
        ],
        "recurringCadence": "session"
      },
      {
        "name": "Distribue les trousses et organise les rappels",
        "description": "Renvoie chaque personne formée chez elle avec une trousse de premiers secours et de la naloxone quand c'est possible. Planifie des séances de rappel régulières pour que les gestes restent frais.",
        "hours": 2,
        "recurringCadence": "session",
        "follows": [
          4
        ]
      }
    ]
  },
  {
    "id": "time-bank",
    "name": "Banque de temps",
    "purpose": "Permettre aux membres d'échanger des services en temps, où une heure donnée vaut une heure gagnée, en valorisant à égalité la contribution de chaque personne.",
    "whoItServes": "Tout le monde, surtout les personnes riches en temps et en savoir-faire mais à court d'argent.",
    "whatYoullNeed": "Une liste de membres, un système de suivi, une personne coordinatrice et des règles décidées ensemble.",
    "setupHours": 27,
    "defaultCategory": "organizing",
    "firstSteps": "Commence par des conversations, pas par un logiciel : assieds-toi avec dix ou quinze voisines et voisins et demande à chaque personne ce qu'elle offrirait et ce qu'elle demanderait. Si ces conversations ne font pas ressortir de la variété — trajets, soutien scolaire, réparations, cuisine — continue de recruter avant de monter le système.",
    "commonPitfalls": "Les banques de temps meurent rarement de scandale ; elles meurent de silence — les gens s'inscrivent, personne ne fait la première demande, et tout s'éteint. Confie à une personne coordinatrice le soin de provoquer activement les mises en relation les premiers mois, et tenez la ligne une heure = une heure : dès qu'on débat de savoir si l'heure de plomberie vaut plus que l'heure de baby-sitting, ce n'est plus une banque de temps.",
    "pairsWith": [
      "skill-share",
      "childcare-collective"
    ],
    "learnMore": [
      "what-is-balance",
      "negative-balance"
    ],
    "tasks": [
      {
        "name": "Recrute des membres fondateurs et fais l'inventaire des savoir-faire",
        "description": "Réunis un premier groupe et demande à chaque personne ce qu'elle peut offrir (trajets, soutien scolaire, réparations, cuisine, jardinage) et ce dont elle a besoin. C'est la variété des offres qui fait marcher le tout.",
        "hours": 5,
        "skills": [
          "communication"
        ]
      },
      {
        "name": "Choisis un système de suivi",
        "description": "Choisissez comment noter les heures : un logiciel dédié aux banques de temps, un tableur partagé ou un simple registre. Il doit garder trace de qui a donné et reçu des heures.",
        "hours": 4,
        "skills": [
          "dépannage informatique",
          "saisie de données"
        ]
      },
      {
        "name": "Posez les règles",
        "description": "Accordez-vous sur le principe central (une heure = un crédit, quelle que soit la tâche), sur la façon de demander et de confirmer les échanges, et sur ce qui se passe quand le solde de quelqu'un descend bas.",
        "hours": 4,
        "skills": [
          "animation",
          "écriture"
        ]
      },
      {
        "name": "Accueille les membres",
        "description": "Tiens une courte séance d'accueil pour que les gens comprennent la philosophie et le système. Donne à chaque personne quelques crédits de départ pour que les échanges commencent tout de suite.",
        "hours": 4,
        "skills": [
          "enseignement"
        ],
        "follows": [
          1,
          2
        ]
      },
      {
        "name": "Lance un annuaire des services",
        "description": "Publie une liste consultable de qui offre quoi. Garde-la à jour pour que les membres trouvent de l'aide sans passer chaque fois par la coordination.",
        "hours": 4,
        "skills": [
          "saisie de données"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Coordonne et provoque les échanges",
        "description": "Une personne coordinatrice aide à relier besoins et offres, surtout au début, et relance en douceur les membres silencieux. Avec le temps, les membres se contactent en direct.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "organisation"
        ],
        "follows": [
          4
        ]
      },
      {
        "name": "Construis des pratiques de confiance et de sécurité",
        "description": "Posez des repères pour les échanges chez les gens ou avec des membres vulnérables (références, pas de rencontre seul à seul si ça met mal à l'aise). Ajoutez une façon simple de signaler un souci.",
        "hours": 4,
        "skills": [
          "animation"
        ]
      }
    ]
  },
  {
    "id": "solidarity-fund",
    "name": "Caisse de solidarité (aide financière d'entraide)",
    "purpose": "Mettre de l'argent en commun pour en donner directement, sans conditions, aux voisins et voisines qui traversent une crise.",
    "whoItServes": "Les personnes frappées par une urgence — un loyer impossible à boucler, une facture médicale, une coupure d'électricité.",
    "whatYoullNeed": "Un système d'argent transparent, une petite équipe de gestion, un plan de collecte et des critères clairs. Gérer de l'argent mis en commun est une vraie responsabilité — exigez une double signature, tenez des comptes propres, protégez la vie privée des personnes aidées et faites-vous conseiller sur le côté légal et fiscal de votre caisse.",
    "setupHours": 23,
    "defaultCategory": "mutual_aid_drive",
    "firstSteps": "Avant de récolter le moindre centime, assieds-toi avec les quelques personnes à qui tu confierais de l'argent commun et parlez honnêtement : comment marchera la double signature, ce qui sera publié, et ce qui se passe quand les demandes dépassent la caisse. Ensuite, trouve une association locale ou une personne experte en comptabilité pour vous guider sur le côté légal et fiscal avant d'ouvrir le compte.",
    "commonPitfalls": "L'argent brise la confiance plus vite que tout le reste — un versement inexpliqué ou des comptes brouillons peuvent tuer la caisse même si personne n'a rien fait de mal. Et il y aura presque toujours plus de demandes que d'argent ; si les critères n'ont pas été fixés d'avance, dire non au cas par cas épuise l'équipe et nourrit les rancœurs.",
    "pairsWith": [
      "resource-hub-dispatch",
      "tenant-union",
      "free-tax-prep"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Former une petite équipe de gestion",
        "description": "Réunis quelques personnes de confiance pour gérer la caisse. Définissez clairement les rôles et engagez-vous sur la transparence dès le premier jour — ici, la confiance fait tout.",
        "hours": 3,
        "skills": [
          "organisation"
        ]
      },
      {
        "name": "Mettre en place une gestion transparente de l'argent",
        "description": "Ouvrez un compte dédié ou passez par une association porteuse. Exigez deux personnes pour approuver chaque versement, tenez un registre clair et vérifiez si votre structure a des implications légales ou fiscales — demandez conseil à une association locale ou à une personne experte en comptabilité.",
        "hours": 5,
        "skills": [
          "comptabilité",
          "démarches"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Définir les critères de demande et de versement",
        "description": "Décidez qui peut demander, les montants habituels, à quelle fréquence, et si c'est premier arrivé ou selon le besoin. Gardez les barrières basses et évitez autant que possible d'exiger des preuves de difficultés.",
        "hours": 4,
        "skills": [
          "animation"
        ]
      },
      {
        "name": "Créer un formulaire de demande simple et accessible",
        "description": "Prépare un formulaire court et confidentiel qui ne demande que le nécessaire. Propose plusieurs façons de demander (en ligne, par téléphone, en personne) et protège la vie privée des personnes qui demandent.",
        "hours": 2,
        "skills": [
          "écriture"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Lancer la collecte de fonds",
        "description": "Combinez de petits dons réguliers des membres avec des collectes ponctuelles. Soyez clairs avec les donateurs : l'argent va directement aux voisins et voisines dans le besoin.",
        "hours": 4,
        "skills": [
          "communication"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Construire un processus de décision et de versement",
        "description": "Fixez un délai de réponse, une relecture rapide par l'équipe et des moyens de versement rapides. En pleine crise, la vitesse compte. Notez chaque décision simplement.",
        "hours": 3,
        "skills": [
          "organisation"
        ],
        "follows": [
          1,
          2
        ]
      },
      {
        "name": "Rendre des comptes en toute transparence",
        "description": "Partagez des bilans réguliers — argent entré, argent sorti, nombre de voisins aidés — sans exposer l'identité des personnes aidées. La transparence fait durer les dons.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "écriture",
          "comptabilité"
        ]
      }
    ]
  },
  {
    "id": "diaper-hygiene-bank",
    "name": "Banque de couches et de produits d'hygiène",
    "purpose": "Distribuer gratuitement couches, protections périodiques et produits d'hygiène, que la plupart des aides alimentaires ne permettent pas d'acheter.",
    "whoItServes": "Les familles à petits revenus, les bébés, les personnes qui ont leurs règles et les voisins et voisines sans logement.",
    "whatYoullNeed": "Un lieu de stockage, un approvisionnement, des points de distribution et des bénévoles.",
    "setupHours": 10,
    "defaultCategory": "mutual_aid_drive",
    "suggestsWorkDays": true,
    "firstSteps": "Parle d'abord avec les gens qui voient déjà les familles — la clinique pédiatrique, l'épicerie solidaire, la paroisse — et demande quelles tailles et quels produits manquent vraiment, et s'ils accueilleraient la distribution. Cette seule conversation t'épargne des mois de tâtonnements.",
    "commonPitfalls": "Ce qui fait le plus mal, c'est l'irrégularité : une grande collecte, des étagères pleines, puis des mois vides juste quand les familles commençaient à compter sur vous. Surveille aussi le stock réel — les tailles nouveau-né s'empilent pendant que les grandes tailles manquent — et ne demande jamais de preuve de besoin ; la dignité fait partie du service.",
    "pairsWith": [
      "welcome-wagon",
      "laundry-shower-access"
    ],
    "tasks": [
      {
        "name": "Trouver un lieu de stockage et un point de distribution",
        "description": "Trouve un stockage sec et sûr et un endroit pour remettre les produits — un placard dans une clinique, une paroisse ou une maison de quartier. Le lieu de remise doit rester discret et digne.",
        "hours": 2,
        "skills": [
          "communication"
        ]
      },
      {
        "name": "Organiser l'approvisionnement",
        "description": "Combine achats en gros, collectes de dons et liens avec des réseaux de banques de couches ou des grossistes. Note quelles sources sont régulières pour ne jamais te retrouver à sec.",
        "hours": 3,
        "skills": [
          "communication",
          "conduite"
        ]
      },
      {
        "name": "Trier et inventorier par taille et par type",
        "description": "Classe les couches par taille, plus les protections périodiques et les produits d'hygiène. Tiens un compte à jour pour savoir quoi demander. Les tailles pour les bébés plus grands manquent souvent.",
        "hours": 1.5,
        "skills": [
          "organisation",
          "saisie de données"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Fixer une règle de distribution équitable",
        "description": "Décidez combien chaque famille reçoit et à quelle fréquence, sans preuve de besoin. Rendez-le prévisible pour que les gens puissent compter dessus.",
        "hours": 1,
        "skills": [
          "animation"
        ]
      },
      {
        "name": "Planifier la distribution et réunir l'équipe",
        "description": "Fixe des jours de distribution réguliers, recrute des bénévoles pour remettre les produits et garde un ton chaleureux, sans jugement.",
        "hours": 2.5,
        "skills": [
          "organisation"
        ],
        "follows": [
          2,
          3
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "community-bike-workshop",
    "name": "Atelier vélo participatif",
    "purpose": "Offrir gratuitement un espace, des outils et de l'aide pour réparer, monter et gagner des vélos, pour un transport abordable et accessible.",
    "whoItServes": "Les personnes sans voiture, les jeunes, les gens qui font la navette et quiconque a besoin d'un transport abordable.",
    "whatYoullNeed": "Un local, des outils, des vélos et des pièces donnés, et des mécanos bénévoles.",
    "setupHours": 20,
    "defaultCategory": "transport",
    "suggestsWorkDays": true,
    "firstSteps": "Avant de chercher un local, parle avec les personnes qui utiliseraient l'atelier et celles qui enseigneraient la mécanique — et s'il existe un atelier vélo dans une ville voisine, va le visiter et demande ce qu'ils referaient autrement. Avec le lieu qui t'accueille, règle dès le départ le stockage, l'accès et l'assurance.",
    "commonPitfalls": "L'atelier meurt quand les bénévoles réparent les vélos au lieu d'apprendre aux gens à les réparer : il devient un atelier gratuit, la file s'allonge et tes mécanos s'épuisent. Attention aussi à la noyade sous les vélos-épaves donnés — triez sans pitié — et ne laissez jamais sortir un vélo sans vérification des freins et des pneus.",
    "pairsWith": [
      "repair-cafe",
      "rides-transportation",
      "tool-lending-library"
    ],
    "tasks": [
      {
        "name": "Trouver un local d'atelier",
        "description": "Trouve un garage, une cave, un conteneur ou un espace communautaire partagé, avec de la place pour travailler et ranger des vélos. Confirme l'accès et les éventuels besoins d'assurance.",
        "hours": 4,
        "skills": [
          "communication"
        ]
      },
      {
        "name": "Rassembler des outils et un pied d'atelier",
        "description": "Réunis une caisse à outils vélo de base et au moins un pied de réparation, par des dons ou un petit budget. Range les outils pour qu'ils soient faciles à trouver et à remettre.",
        "hours": 5,
        "skills": [
          "conduite"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Collecter des vélos et des pièces donnés",
        "description": "Lance des appels aux vélos inutilisés et aux pièces récupérables. Trie en « réparable », « pour pièces » et « prêt à rouler ». C'est la réserve de pièces qui fait tourner l'atelier.",
        "hours": 4,
        "skills": [
          "réparation",
          "conduite"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Recruter des mécanos bénévoles",
        "description": "Trouve quelques personnes qui savent réparer les vélos et, surtout, l'apprendre aux autres. Le but est d'aider chacun à réparer le sien, pas de le faire à sa place.",
        "hours": 3,
        "skills": [
          "communication"
        ]
      },
      {
        "name": "Fixer des permanences et un modèle « gagne ton vélo »",
        "description": "Choisissez des horaires prévisibles. Pensez à un programme « gagne ton vélo » où quelqu'un apprend la mécanique sur quelques séances et repart avec le vélo qu'il a réparé lui-même.",
        "hours": 2,
        "skills": [
          "organisation"
        ]
      },
      {
        "name": "Poser des pratiques de sécurité",
        "description": "Exigez des lunettes de protection, posez des règles pour les outils et gardez une trousse de premiers secours. Faites toujours une vérification (freins, pneus, jeu de direction) avant qu'un vélo ne sorte.",
        "hours": 2,
        "skills": [
          "écriture"
        ]
      }
    ]
  },
  {
    "id": "newcomer-translation-network",
    "name": "Réseau d'accueil et de traduction des personnes nouvellement arrivées",
    "purpose": "Aider les personnes immigrées et réfugiées à trouver leurs repères — traduction, démarches, orientation et lien avec la communauté.",
    "whoItServes": "Les personnes immigrées et réfugiées récemment arrivées, et les voisins et voisines qui ne parlent pas la langue locale.",
    "whatYoullNeed": "Des bénévoles bilingues, des organisations partenaires, des supports d'orientation et un système de demandes. Soyez particulièrement attentifs à la vie privée : ne recueillez pas le statut migratoire, orientez les questions juridiques vers des avocates et avocats spécialisés en droit des étrangers, et laissez les personnes concernées dire quel soutien elles veulent vraiment.",
    "setupHours": 22,
    "defaultCategory": "other",
    "firstSteps": "Commence par parler avec les communautés nouvellement arrivées elles-mêmes et avec les organisations qui les accompagnent déjà — laisse-les dire quel soutien elles veulent, plutôt que de le concevoir à leur place. Et avant la première demande, prépare ton relais : des avocates et avocats spécialisés en droit des étrangers vers qui orienter chaque question juridique.",
    "commonPitfalls": "Le risque le plus sérieux, c'est que des bénévoles bien intentionnés glissent de l'interprétation vers des conseils juridiques ou médicaux qu'ils ne sont pas qualifiés pour donner — un mauvais conseil migratoire peut coûter très cher. Et recueillez le strict minimum de données : une note imprudente sur le statut de quelqu'un peut le mettre en vrai danger.",
    "pairsWith": [
      "welcome-wagon",
      "legal-aid-clinic",
      "health-navigation"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Recruter des bénévoles bilingues et multilingues",
        "description": "Trouve des bénévoles qui parlent les langues courantes de ton coin et peuvent aider pour la traduction, les formulaires et l'accompagnement. Fais correspondre les langues aux besoins locaux réels.",
        "hours": 4,
        "skills": [
          "traduction",
          "communication"
        ]
      },
      {
        "name": "Cartographier les services et partenaires locaux",
        "description": "Monte un annuaire des centres de santé, écoles, aide juridique, cours de langue, aide alimentaire et associations d'accueil des personnes migrantes. Souvent, il suffit de savoir ce qui existe et comment y accéder.",
        "hours": 5,
        "skills": [
          "communication",
          "saisie de données"
        ]
      },
      {
        "name": "Monter un système de demandes et de mise en relation",
        "description": "Crée un moyen simple de demander de l'aide et d'être mis en relation avec un ou une bénévole selon la langue et le besoin. Propose le téléphone et le face-à-face, pas seulement en ligne.",
        "hours": 3,
        "skills": [
          "organisation",
          "dépannage informatique"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Créer des supports d'orientation",
        "description": "Rassemble des guides en langage simple, dans les langues utiles, sur les transports, l'école, la santé et les droits. Utilise des visuels pour qu'ils marchent quel que soit le niveau de lecture.",
        "hours": 4,
        "skills": [
          "écriture",
          "traduction"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Proposer un accompagnement aux rendez-vous",
        "description": "Organise des bénévoles pour accompagner les gens aux rendez-vous médicaux, scolaires ou administratifs, interpréter et soutenir. Rappelle-leur d'interpréter fidèlement, sans donner de conseils qu'ils ne sont pas qualifiés à donner.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "traduction"
        ],
        "follows": [
          0,
          2
        ]
      },
      {
        "name": "Poser des pratiques de confidentialité et de sécurité",
        "description": "Recueille le minimum d'informations et ne demande ni ne note jamais le statut migratoire. Garde les données en lieu sûr et prépare les bénévoles à gérer les situations sensibles avec discrétion.",
        "hours": 3,
        "skills": [
          "écriture"
        ]
      }
    ]
  },
  {
    "id": "community-meal",
    "name": "Repas communautaire / Cantine populaire",
    "purpose": "Cuisiner et partager des repas gratuits à un rythme régulier, sans poser de questions.",
    "whoItServes": "Toute personne qui a faim, se sent seule ou manque de quoi manger ; le repas tisse aussi du lien dans le quartier.",
    "whatYoullNeed": "Une cuisine, des gens qui cuisinent, un circuit d'ingrédients, un espace de service et une équipe bénévole. Servir de la nourriture au public engage une vraie responsabilité d'hygiène alimentaire — vérifiez les règles locales sur les autorisations et la formation en hygiène, et respectez à chaque fois le stockage et les températures de sécurité.",
    "setupHours": 22,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Tes deux premières conversations : avec le lieu qui prête la cuisine — salle paroissiale ou maison de quartier — sur les jours prévus, et avec les autorités sanitaires locales sur les autorisations et l'hygiène ; tout le reste en découle. Ensuite, demande aux personnes qui viendraient manger quel jour et quelle heure leur conviennent vraiment.",
    "commonPitfalls": "Un écart d'hygiène peut rendre quelqu'un malade et tuer le projet — les règles de température et de stockage ne se sautent pas, pas une seule fois. La mort lente, ce sont les trois mêmes personnes qui cuisinent chaque repas jusqu'à l'épuisement : élargissez l'équipe et faites tourner qui mène la cuisine dès le départ.",
    "pairsWith": [
      "gleaning-network",
      "community-garden",
      "community-fridge"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Trouver une cuisine et un espace de service",
        "description": "Trouve une cuisine assez grande pour cuisiner en quantité — salle paroissiale, maison de quartier ou cuisine professionnelle — plus un espace pour servir. Confirme la disponibilité aux jours prévus.",
        "hours": 3,
        "skills": [
          "communication"
        ]
      },
      {
        "name": "Régler l'hygiène alimentaire et les autorisations",
        "description": "Vérifie les règles locales pour servir de la nourriture au public. Il faut parfois une autorisation, une personne formée à l'hygiène sur place ou une cuisine agréée. Apprends le stockage sûr et la gestion des températures.",
        "hours": 4,
        "skills": [
          "hygiène alimentaire"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Monter un circuit d'approvisionnement",
        "description": "Combine dons de commerces et de restaurants, achats en gros et surplus du jardin partagé ou du glanage. Note les sources fiables pour bâtir les menus sur ce que tu auras vraiment.",
        "hours": 3,
        "skills": [
          "communication",
          "conduite"
        ]
      },
      {
        "name": "Prévoir des menus pour la quantité, les régimes et les allergies",
        "description": "Conçois des repas simples et nourrissants qui se cuisinent en grande quantité et font durer les ingrédients. Propose une option végétarienne et signale clairement les allergènes courants.",
        "hours": 2,
        "recurringCadence": "session",
        "skills": [
          "cuisine"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Recruter une équipe de cuisine et de service",
        "description": "Réunis des bénévoles pour la préparation, la cuisson, le service et le nettoyage. Désigne qui mène la cuisine à chaque repas et garde des rôles clairs pour que le service roule.",
        "hours": 3,
        "skills": [
          "cuisine",
          "organisation"
        ]
      },
      {
        "name": "Fixer un rythme et faire passer le mot",
        "description": "Choisis un jour et une heure réguliers pour que les gens puissent compter dessus. Fais connaître le repas par affiches, foyers d'accueil et bouche-à-oreille, sur un ton chaleureux et ouvert à tout le monde.",
        "hours": 2,
        "skills": [
          "graphisme"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Assurer le repas et le nettoyage",
        "description": "Cuisinez, servez avec dignité (le service à table vaut mieux qu'une file quand c'est possible) et rendez la cuisine aux normes exigées. Emballez les restes en sécurité pour les redistribuer.",
        "hours": 5,
        "skills": [
          "cuisine"
        ],
        "follows": [
          3,
          4,
          5
        ],
        "recurringCadence": "session"
      }
    ]
  },
  {
    "id": "seed-library",
    "name": "Grainothèque et troc de graines",
    "purpose": "Partager des graines gratuites pour que chacun cultive de quoi manger, tout en préservant les variétés locales et anciennes.",
    "whoItServes": "Les gens qui jardinent chez eux, les personnes qui sèment pour la première fois et les jardins partagés.",
    "whatYoullNeed": "Un système de rangement et de catalogue, des graines données, un lieu d'accueil et quelques personnes pour en prendre soin.",
    "setupHours": 8,
    "defaultCategory": "food",
    "firstSteps": "Parle avec la bibliothèque ou la maison de quartier pour accueillir le meuble, et avec des personnes qui jardinent depuis longtemps dans le coin de ce qui pousse vraiment dans ta région — la réussite des débutants tient à des graines adaptées au climat. Une pépinière ou un jardin partagé voisin donnera souvent volontiers le stock de départ.",
    "commonPitfalls": "Une grainothèque meurt en silence : de vieilles graines qui ne germent plus, des débutants qui concluent qu'ils ne savent pas jardiner et ne reviennent jamais. Fais tourner le stock sans état d'âme, et ne compte pas sur les retours — presque personne ne rapporte de graines — donc prévois le réassort avec des dons, pas des retours.",
    "pairsWith": [
      "community-garden",
      "free-little-library"
    ],
    "tasks": [
      {
        "name": "Trouver un lieu d'accueil et un rangement",
        "description": "Associe-toi à une bibliothèque, une maison de quartier ou un jardin pour accueillir un petit meuble ou une série de tiroirs. Garde les graines au frais, au sec et au noir, dans des sachets étiquetés.",
        "hours": 2,
        "skills": [
          "communication"
        ]
      },
      {
        "name": "Réunir les premières graines",
        "description": "Rassemble des dons de gens qui jardinent, les surplus des semenciers et les sachets de fin de saison. Privilégie des variétés faciles et adaptées à la région pour que les débutants réussissent.",
        "hours": 2,
        "skills": [
          "communication",
          "jardinage"
        ]
      },
      {
        "name": "Organiser et étiqueter la collection",
        "description": "Classe par type (légume, aromatique, fleur) et par difficulté. Étiquette chaque sachet avec la plante, l'année et quelques notes de culture. Signale les variétés dont il est facile de récolter les graines.",
        "hours": 2,
        "skills": [
          "jardinage",
          "saisie de données"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Poser des règles d'emprunt et de partage",
        "description": "Reste simple : on prend des graines gratuitement, on les cultive et, idéalement, on en récolte et on en rapporte en fin de saison. Affiche un mode d'emploi d'une page.",
        "hours": 1,
        "skills": [
          "écriture"
        ]
      },
      {
        "name": "Entretenir la viabilité et réassortir",
        "description": "Les graines perdent leur pouvoir de germination avec le temps. Retire le vieux stock, teste la germination des lots douteux et regarnis les variétés populaires.",
        "hours": 1,
        "skills": [
          "jardinage"
        ],
        "follows": [
          2
        ],
        "recurringCadence": "cycle"
      }
    ]
  },
  {
    "id": "digital-literacy",
    "name": "Initiation au numérique et prêt d'appareils",
    "purpose": "Prêter des appareils et enseigner les bases du numérique pour combler le fossé pour les personnes sans matériel ni internet fiables.",
    "whoItServes": "Les personnes âgées, les voisins et voisines à petits revenus, les personnes en recherche d'emploi et quiconque est exclu des services en ligne.",
    "whatYoullNeed": "Des appareils donnés, un accès internet, des bénévoles pour accompagner et un local.",
    "setupHours": 27,
    "defaultCategory": "tech",
    "firstSteps": "Parle d'abord avec les personnes que tu veux toucher — à la bibliothèque, au club des anciens, dans la file de l'aide alimentaire — et demande ce qu'elles veulent vraiment faire : téléconsultation, candidatures, photos des petits-enfants. Puis vois avec la bibliothèque l'espace et la connexion avant de collecter le moindre appareil.",
    "commonPitfalls": "Prêter un appareil sans régler l'accès internet, c'est prêter un presse-papier — la connexion est la moitié du projet. En séance, l'erreur classique est de prendre la souris et de parler jargon ; et ne reprête jamais un appareil sans l'effacer, parce que faire fuiter les données de quelqu'un ruine toute la confiance construite.",
    "pairsWith": [
      "community-wifi-mesh",
      "skill-share"
    ],
    "learnMore": [
      "install-app",
      "new-device"
    ],
    "tasks": [
      {
        "name": "Collecter et remettre en état des appareils",
        "description": "Rassemble ordinateurs portables, tablettes et téléphones donnés. Efface chacun de façon sûre, mets-le à jour et prépare-le pour un usage simple. Vérifie que tout marche avant de prêter.",
        "hours": 8,
        "skills": [
          "dépannage informatique",
          "conduite"
        ]
      },
      {
        "name": "Mettre en place un système de prêt",
        "description": "Crée un registre simple : qui a emprunté quoi, dans quel état, pour quand. Décide la durée de prêt et une règle de retour indulgente, fondée sur la confiance.",
        "hours": 3,
        "skills": [
          "saisie de données"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Organiser l'accès à internet",
        "description": "Un appareil sert peu sans connexion. Prête des points d'accès mobiles, associe-toi à la bibliothèque, ou oriente vers les offres internet à petit prix et le WiFi public gratuit.",
        "hours": 3,
        "skills": [
          "dépannage informatique",
          "communication"
        ]
      },
      {
        "name": "Recruter et préparer l'équipe d'accompagnement",
        "description": "Trouve des bénévoles patients et prépare-les à enseigner sans jargon. Insiste : on va au rythme de la personne qui apprend et on ne prend jamais la souris.",
        "hours": 4,
        "skills": [
          "pédagogie"
        ]
      },
      {
        "name": "Concevoir un parcours pour débutants",
        "description": "Monte des leçons courtes sur l'essentiel : e-mails, sécurité en ligne, candidatures, téléconsultation, démarches administratives et appels vidéo. Fournis des fiches mémo imprimées.",
        "hours": 4,
        "skills": [
          "pédagogie",
          "écriture"
        ]
      },
      {
        "name": "Planifier des cours et des permanences d'aide",
        "description": "Propose à la fois des cours structurés et des permanences « aide numérique » ouvertes. Varie les horaires pour les gens qui travaillent et garde de petits groupes.",
        "hours": 3,
        "recurringCadence": "session",
        "skills": [
          "organisation"
        ],
        "follows": [
          3,
          4
        ]
      },
      {
        "name": "Poser des règles de sécurité des données et de retour",
        "description": "Efface chaque appareil entre deux emprunts, enseigne de bons réflexes de mots de passe et de vie privée, et explique comment les données personnelles sont protégées. Prévois un plan pour la perte ou la casse.",
        "hours": 2,
        "skills": [
          "dépannage informatique",
          "écriture"
        ]
      }
    ]
  },
  {
    "id": "weatherization-brigade",
    "name": "Brigade d'isolation et de réparations à domicile",
    "purpose": "Aider les voisins à petits revenus, âgés ou en situation de handicap avec des réparations et de l'isolation, pour réduire les factures d'énergie et gagner en sécurité.",
    "whoItServes": "Les propriétaires à petits revenus, les personnes âgées et les voisins et voisines en situation de handicap qui ne peuvent ni faire ni payer les travaux.",
    "whatYoullNeed": "Des bénévoles qui savent bricoler, des matériaux, des outils et un système de demandes. Restez dans les limites des compétences bénévoles — orientez l'électricité, le gaz, la structure et la toiture vers des professionnels agréés.",
    "setupHours": 21,
    "defaultCategory": "housing",
    "suggestsWorkDays": true,
    "firstSteps": "Réunis d'abord tes bénévoles les plus expérimentés et fixez ensemble la ligne de partage — quels travaux vous prenez et lesquels partent chez des professionnels agréés — avant d'accepter une seule demande. Traite la première visite de chaque logement comme une conversation, pas une inspection : la personne qui habite décide de ce qu'on touche chez elle.",
    "commonPitfalls": "Le danger, c'est le chantier qui déborde : la « petite réparation » qui se révèle être de l'électricité, du gaz ou de la toiture au-delà des compétences bénévoles — c'est là que quelqu'un se blesse. Et ne promettez pas plus de visites que l'équipe ne peut en assurer ; laisser une personne âgée attendre une aide promise fait plus de mal qu'un non honnête dès le départ.",
    "pairsWith": [
      "community-wood-bank",
      "tool-lending-library"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Recruter des bénévoles qui savent bricoler",
        "description": "Trouve des gens à l'aise avec la menuiserie de base, les joints, l'isolation et les bourrelets de portes et fenêtres. Une ou deux personnes plus expérimentées peuvent guider le reste.",
        "hours": 4,
        "skills": [
          "menuiserie",
          "bricolage"
        ]
      },
      {
        "name": "Définir le périmètre des travaux",
        "description": "Décidez ce que vous ferez et ne ferez pas. Restez sur des travaux sûrs et simples (calfeutrage, barres d'appui, petites réparations) et écartez tout ce qui exige un métier agréé, comme les gros travaux d'électricité ou de gaz.",
        "hours": 2,
        "skills": [
          "bricolage"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Monter un système de demandes et de visites d'évaluation",
        "description": "Crée un moyen pour les voisins de demander de l'aide, puis fais une visite rapide pour cadrer le travail, lister les matériaux et confirmer que ça reste dans vos compétences et vos limites de sécurité.",
        "hours": 3,
        "skills": [
          "organisation"
        ]
      },
      {
        "name": "Trouver matériaux et outils",
        "description": "Rassemble mastic, bourrelets, isolant et quincaillerie de base par des dons, des remises ou un petit budget. Entretiens une caisse à outils commune.",
        "hours": 4,
        "skills": [
          "conduite"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Régler la sécurité et la responsabilité",
        "description": "Utilisez des décharges simples, emportez de quoi faire les premiers soins, exigez l'équipement de protection et ne tentez jamais un travail au-delà de vos compétences. Faites-vous conseiller sur l'assurance responsabilité pour des réparations bénévoles.",
        "hours": 3,
        "skills": [
          "démarches"
        ]
      },
      {
        "name": "Planifier et mener les journées de chantier",
        "description": "Répartis les travaux entre les équipes bénévoles, confirme avec la personne du logement et termine le travail en une séance concentrée. Respecte la maison et les souhaits de qui l'habite du début à la fin.",
        "hours": 5,
        "skills": [
          "organisation",
          "bricolage"
        ],
        "follows": [
          1,
          2,
          3,
          4
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "pet-food-bank",
    "name": "Banque alimentaire pour animaux et soutien aux soins",
    "purpose": "Offrir de la nourriture gratuite pour les animaux de compagnie et un coup de main pour leurs soins, pour que personne ne soit forcé d'abandonner son animal faute d'argent.",
    "whoItServes": "Les propriétaires d'animaux à petit budget, les personnes âgées à revenu fixe et les voisins et voisines sans logement qui vivent avec des animaux.",
    "whatYoullNeed": "Un lieu de stockage, une source régulière de nourriture pour animaux, un point de distribution et des partenariats vétérinaires.",
    "setupHours": 10,
    "defaultCategory": "mutual_aid_drive",
    "suggestsWorkDays": true,
    "firstSteps": "Parle d'abord avec le garde-manger solidaire existant pour distribuer ensemble — les mêmes foyers ont souvent besoin des deux — puis avec les vétérinaires et animaleries du coin pour des dons, et peut-être un partenariat vaccins ou tarifs réduits.",
    "commonPitfalls": "L'irrégularité fait le plus de dégâts : une grande collecte, puis des étagères vides, alors que les gens ont besoin de pouvoir compter sur toi. Et surveille le ton — le moindre jugement sur « les pauvres ne devraient pas avoir d'animaux » tue ce projet plus vite qu'une pénurie de croquettes.",
    "pairsWith": [
      "diaper-hygiene-bank",
      "community-fridge"
    ],
    "tasks": [
      {
        "name": "Trouvez un lieu de stockage et un point de distribution",
        "description": "Trouvez un espace sec, à l'abri des nuisibles, et un endroit pour distribuer la nourriture — souvent aux côtés d'un garde-manger solidaire ou d'un centre communautaire existant.",
        "hours": 2,
        "skills": [
          "prise de contact"
        ]
      },
      {
        "name": "Montez une source régulière de nourriture pour animaux",
        "description": "Combinez collectes, dons d'animaleries et de fabricants, et achats en gros. Notez ce qui entre pour pouvoir planifier les distributions.",
        "hours": 3,
        "skills": [
          "prise de contact",
          "conduite"
        ]
      },
      {
        "name": "Triez et inventoriez par animal et par taille",
        "description": "Séparez la nourriture pour chiens et pour chats (et autres animaux), notez les quantités et vérifiez les dates de péremption. Tenez un compte à jour pour guider le réassort.",
        "hours": 1.5,
        "skills": [
          "organisation",
          "saisie de données"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Fixez une règle de distribution",
        "description": "Décidez combien chaque foyer reçoit et à quelle fréquence, sans exiger de justificatif de besoin. Rendez-la prévisible pour que les gens puissent s'organiser.",
        "hours": 1,
        "skills": [
          "animation"
        ]
      },
      {
        "name": "Planifiez les distributions et l'équipe",
        "description": "Fixez des horaires de distribution réguliers, recrutez des bénévoles et gardez un ton sans jugement. Beaucoup de gens sautent des repas pour nourrir leur animal — accueillez-les avec respect.",
        "hours": 2.5,
        "skills": [
          "organisation"
        ],
        "follows": [
          2,
          3
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "youth-mentorship",
    "name": "Mentorat jeunesse et accueil après l'école",
    "purpose": "Offrir aux enfants et aux ados un espace sûr après l'école, avec aide aux devoirs, mentorat et activités d'éveil.",
    "whoItServes": "Les jeunes des quartiers peu dotés et les parents qui travaillent et ont besoin d'un accueil sûr.",
    "whatYoullNeed": "Un espace sûr, des mentors vérifiés, des activités et des goûters. Travailler avec des jeunes engage une vraie responsabilité — vérifiez les adultes, gardez la règle des deux adultes, respectez les obligations de signalement et les règles locales pour les programmes jeunesse.",
    "setupHours": 28,
    "defaultCategory": "education",
    "suggestsWorkDays": true,
    "firstSteps": "Avant de recruter le moindre mentor, parle avec les parents et avec les jeunes de ce dont ils ont besoin, et mets tes règles de sécurité par écrit — vérification des antécédents, règle des deux adultes, signalement obligatoire. Aucun adulte ne passe de temps avec des enfants avant d'avoir passé cette barre.",
    "commonPitfalls": "La pire faille est un raccourci de sécurité : un adulte non vérifié, ou un adulte seul avec un enfant — ça ne se négocie jamais. La deuxième est le va-et-vient des mentors ; pour des enfants déjà déçus, un adulte qui disparaît fait du mal, alors commence petit et grandis seulement tant que tu peux superviser et tenir.",
    "pairsWith": [
      "school-supply-program",
      "childcare-collective",
      "community-music"
    ],
    "learnMore": [
      "how-vouching-works"
    ],
    "tasks": [
      {
        "name": "Trouvez un espace sûr et fixez les horaires",
        "description": "Trouvez un lieu adapté et accessible — une salle d'école, une bibliothèque ou un centre communautaire — et fixez des horaires réguliers après l'école sur lesquels les familles peuvent compter.",
        "hours": 3,
        "skills": [
          "prise de contact"
        ]
      },
      {
        "name": "Posez les règles de protection de l'enfance et de vérification",
        "description": "Exigez une vérification des antécédents pour les adultes au contact des jeunes, appliquez la règle des deux adultes pour que personne ne reste seul avec un enfant, et fixez des règles claires de conduite et de signalement.",
        "hours": 6,
        "skills": [
          "garde d'enfants",
          "rédaction"
        ]
      },
      {
        "name": "Recrutez et formez les mentors",
        "description": "Trouvez des adultes fiables et bienveillants, et formez-les aux limites, à la sécurité des jeunes et à l'art d'aider sans faire le travail à la place des enfants. Visez la régularité semaine après semaine.",
        "hours": 6,
        "skills": [
          "prise de contact",
          "enseignement"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Préparez le programme",
        "description": "Mélangez aide aux devoirs et activités d'éveil — lecture, art, sport, compétences de vie. Gardez ça vivant et laissez les jeunes aider à façonner ce qui est proposé.",
        "hours": 4,
        "skills": [
          "enseignement"
        ]
      },
      {
        "name": "Gérez les inscriptions, les allergies et les infos d'urgence",
        "description": "Recueillez l'autorisation parentale, les allergies et infos médicales, les contacts d'urgence et qui peut venir chercher chaque enfant. Rangez tout ça en lieu sûr.",
        "hours": 3,
        "skills": [
          "paperasse",
          "saisie de données"
        ]
      },
      {
        "name": "Trouvez goûters et fournitures",
        "description": "Offrez un goûter sain (beaucoup d'enfants arrivent le ventre vide) et rassemblez livres, matériel d'art et jeux par des dons ou un petit budget.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "prise de contact"
        ]
      },
      {
        "name": "Animez les séances et gardez le lien avec les familles",
        "description": "Ouvrez l'espace, supervisez de près, menez les activités et gardez un contact régulier avec les parents sur comment vont leurs enfants.",
        "hours": 4,
        "skills": [
          "garde d'enfants",
          "enseignement"
        ],
        "follows": [
          0,
          2,
          3,
          4
        ],
        "recurringCadence": "session"
      }
    ]
  },
  {
    "id": "gleaning-network",
    "name": "Réseau de glanage",
    "purpose": "Récupérer les surplus de fruits et légumes des fermes, vergers, jardins et marchés, et les redistribuer avant qu'ils soient perdus.",
    "whoItServes": "Les voisins et voisines en précarité alimentaire et les projets d'alimentation comme les frigos, garde-manger et repas communautaires.",
    "whatYoullNeed": "Des bénévoles, du transport, des liens avec les personnes qui cultivent et un stockage de courte durée.",
    "setupHours": 21,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Commence par les personnes qui cultivent : fermes, vergers, stands de marché. Demande quel surplus elles ont et ce qui les inquiète dans l'accueil de bénévoles — responsabilité, dégâts aux cultures — et cale où ira la nourriture (frigos, garde-manger, repas communautaires) avant la première récolte.",
    "commonPitfalls": "L'échec classique, c'est des fruits sauvés qui pourrissent ensuite dans un garage — la distribution se règle avant la cueillette, pas après. Les fenêtres de récolte sont courtes : une petite équipe rapide vaut mieux qu'une longue liste de noms ; et un seul glanage négligent qui abîme un champ peut te faire perdre ce producteur pour de bon.",
    "pairsWith": [
      "community-fridge",
      "food-preservation",
      "community-meal"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Trouvez des sources de récolte",
        "description": "Contactez fermes, vergers, stands de marché et voisinage aux arbres fruitiers débordants. Beaucoup sont ravis que le surplus soit cueilli plutôt qu'il pourrisse.",
        "hours": 4,
        "skills": [
          "prise de contact"
        ]
      },
      {
        "name": "Recrutez une équipe de glanage",
        "description": "Montez une liste de bénévoles capables de se mobiliser vite quand la récolte est prête. Les fenêtres sont courtes : la souplesse compte plus que le nombre.",
        "hours": 2,
        "skills": [
          "prise de contact"
        ]
      },
      {
        "name": "Organisez transport et stockage",
        "description": "Prévoyez des véhicules pour déplacer la récolte et un endroit frais pour la garder brièvement. Coordonnez-vous pour aller vite du champ aux personnes destinataires, avant que ça s'abîme.",
        "hours": 3,
        "skills": [
          "conduite"
        ]
      },
      {
        "name": "Mettez en place l'alerte et la coordination",
        "description": "Créez un moyen rapide d'alerter et de confirmer les bénévoles quand un glanage se présente, car les producteurs préviennent souvent tard. Une conversation de groupe ou une liste d'appel fait l'affaire.",
        "hours": 2,
        "skills": [
          "organisation"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Réglez responsabilité et hygiène alimentaire",
        "description": "Renseignez-vous sur les protections type « bon samaritain » pour les dons alimentaires dans votre région, convenez de règles simples de manipulation et utilisez une décharge basique pour que les producteurs accueillent l'esprit tranquille.",
        "hours": 3,
        "skills": [
          "paperasse",
          "hygiène alimentaire"
        ]
      },
      {
        "name": "Construisez les circuits de distribution",
        "description": "Calez où va la nourriture glanée — frigos communautaires, garde-manger, programmes de repas ou directement aux familles — pour qu'elle ne reste jamais inutilisée.",
        "hours": 3,
        "skills": [
          "prise de contact"
        ]
      },
      {
        "name": "Menez les glanages et pesez les récoltes",
        "description": "Récoltez avec soin pour protéger le lieu, distribuez sans tarder et notez combien de nourriture a été sauvée. Les chiffres aident à convaincre bénévoles et producteurs.",
        "hours": 4,
        "skills": [
          "jardinage",
          "conduite"
        ],
        "follows": [
          0,
          2,
          3,
          5
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "community-mediation",
    "name": "Réseau communautaire de médiation et de résolution de conflits",
    "purpose": "Offrir une médiation gratuite et neutre pour les différends de voisinage, et résoudre les conflits sans tribunaux ni police.",
    "whoItServes": "Voisins et voisines, locataires et propriétaires, colocataires et groupes communautaires en conflit.",
    "whatYoullNeed": "Des médiateurs et médiatrices formés, un espace neutre et un processus de demande. La médiation vaut pour des différends entre parties volontaires — écartez et orientez toute situation de violence, d'abus ou de danger vers les pros ou services d'urgence adaptés.",
    "setupHours": 22,
    "defaultCategory": "other",
    "firstSteps": "Parle d'abord avec un centre de médiation communautaire existant ou une personne qui forme des médiateurs — ce métier ne s'improvise pas — et avant le premier dossier, mettez votre filtre par écrit : quels différends vous prenez, et vers qui vous orientez tout ce qui touche à la violence ou aux abus.",
    "commonPitfalls": "L'échec dangereux, c'est de médier ce qui ne doit pas l'être : un « différend de voisinage » qui est en réalité de l'abus met quelqu'un en danger, alors filtrez chaque demande. Et la confidentialité est tout le capital du projet — un seul détail qui fuite et plus personne ne fait confiance au service ; prenez soin aussi de vos médiateurs et médiatrices, ce travail use.",
    "pairsWith": [
      "legal-aid-clinic",
      "tenant-union"
    ],
    "learnMore": [
      "disagree-with-member"
    ],
    "tasks": [
      {
        "name": "Recrutez et formez médiateurs et médiatrices",
        "description": "Trouvez des bénévoles posés et équitables et faites-les former, via une formation reconnue à la médiation ou en vous alliant à un centre de médiation communautaire existant.",
        "hours": 6,
        "skills": [
          "prise de contact",
          "animation"
        ]
      },
      {
        "name": "Montez un processus de demande et d'accueil",
        "description": "Créez un moyen simple de demander une médiation. À l'accueil, écoutez l'essentiel de chaque partie et confirmez que le dossier se prête à la médiation.",
        "hours": 3,
        "skills": [
          "organisation",
          "entretiens"
        ]
      },
      {
        "name": "Trouvez des lieux de rencontre neutres",
        "description": "Trouvez des endroits calmes et neutres — une salle de bibliothèque ou un centre communautaire — où les deux parties se sentent en sécurité et sur un pied d'égalité.",
        "hours": 2,
        "skills": [
          "prise de contact"
        ]
      },
      {
        "name": "Définissez le périmètre et les limites",
        "description": "Décidez ce que vous médierez (bruit, espaces partagés, petits différends) et ce que vous ne toucherez pas. Écartez les situations de violence, d'abus ou de risque et orientez-les vers les pros qu'il faut.",
        "hours": 3,
        "skills": [
          "animation",
          "rédaction"
        ]
      },
      {
        "name": "Posez la confidentialité et les règles de base",
        "description": "Fixez des règles claires : confidentialité, participation volontaire, tours de parole respectés, et une personne médiatrice qui guide mais ne décide pas. Mettez-les par écrit pour les personnes participantes.",
        "hours": 3,
        "skills": [
          "rédaction"
        ]
      },
      {
        "name": "Faites connaître le service",
        "description": "Faites savoir au voisinage, aux groupes logement et aux organisations locales qu'une médiation gratuite existe, pour qu'on y pense avant que les conflits s'enveniment.",
        "hours": 3,
        "skills": [
          "prise de contact",
          "graphisme"
        ],
        "follows": [
          1,
          3
        ]
      },
      {
        "name": "Suivez les résultats et soutenez l'équipe de médiation",
        "description": "Notez les taux de résolution (sans trahir la confidentialité) et débriefez régulièrement avec les médiateurs et médiatrices. Ce travail épuise : faites tourner les dossiers et offrez du soutien.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "saisie de données",
          "animation"
        ]
      }
    ]
  },
  {
    "id": "reentry-support",
    "name": "Réseau d'appui à la réinsertion",
    "purpose": "Aider les personnes qui sortent de prison à obtenir papiers, logement, travail et communauté, pour adoucir une transition notoirement difficile.",
    "whoItServes": "Les personnes anciennement incarcérées et leurs familles.",
    "whatYoullNeed": "Des bénévoles, des organisations partenaires et un solide annuaire de ressources. Traitez les casiers et les histoires des gens comme privés — avancez avec respect, suivez les objectifs propres à chaque personne et orientez les questions juridiques vers des juristes qualifiés.",
    "setupHours": 28,
    "defaultCategory": "other",
    "firstSteps": "Avant de rien construire, asseyez-vous avec des personnes qui ont vécu le retour et avec les organisations de réinsertion, services de probation et employeurs seconde chance déjà actifs dans votre coin — demandez ce qui bloque vraiment les gens les premières semaines et où votre réseau s'insère. Trouvez dès maintenant un contact d'aide juridique ou une avocate ou un avocat qualifié, pour avoir un vrai relais quand les questions juridiques arriveront.",
    "commonPitfalls": "Ce projet meurt quand il devient un filtre — des bénévoles qui décident qui mérite de l'aide — ou quand l'histoire de quelqu'un fuite et lui coûte un travail ou un appartement. Il échoue aussi en silence quand l'enthousiasme dépasse le suivi ; une promesse rompue frappe plus fort quelqu'un qui reconstruit sa confiance que pas de promesse du tout.",
    "pairsWith": [
      "court-support",
      "books-to-prisoners"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Montez un annuaire de ressources et de partenaires",
        "description": "Cartographiez les services pour les papiers et documents, le logement, l'emploi, la santé, les soins et les aides. Repérez quels employeurs et propriétaires sont ouverts aux personnes avec un casier.",
        "hours": 6,
        "skills": [
          "prise de contact",
          "saisie de données"
        ]
      },
      {
        "name": "Recrutez et formez des bénévoles",
        "description": "Trouvez des bénévoles sans jugement et formez-les à un accompagnement respectueux et sensible aux traumas. Les personnes qui rentrent ont besoin de partenaires, pas de barrières.",
        "hours": 5,
        "skills": [
          "prise de contact",
          "enseignement"
        ]
      },
      {
        "name": "Créez un accueil et un point sur les besoins",
        "description": "Montez une façon simple et digne d'apprendre ce dont chaque personne a besoin en premier — souvent des papiers, un toit et un revenu — et priorisez à partir de là.",
        "hours": 3,
        "skills": [
          "entretiens"
        ]
      },
      {
        "name": "Aidez pour les documents et les aides",
        "description": "Aidez à refaire papiers d'identité et carte de sécurité sociale, à demander les aides, et pour les autres démarches difficiles sans adresse ni accès à internet.",
        "hours": 4,
        "recurringCadence": "month",
        "skills": [
          "paperasse"
        ]
      },
      {
        "name": "Reliez à l'emploi et au logement",
        "description": "Faites des présentations chaleureuses auprès d'employeurs seconde chance et d'options de logement, et aidez pour les candidatures, les CV et la préparation d'entretiens.",
        "hours": 4,
        "recurringCadence": "month",
        "skills": [
          "prise de contact",
          "rédaction"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Proposez un mentorat entre pairs",
        "description": "Quand c'est possible, associez chaque personne à un mentor qui a lui-même vécu la réinsertion. Cette expérience partagée construit la confiance plus vite que tout.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "animation"
        ]
      },
      {
        "name": "Posez des pratiques de confidentialité et de limites",
        "description": "Traitez les histoires des gens avec une confidentialité stricte, ne poussez jamais personne à en dire plus qu'elle ne veut, et orientez les questions juridiques vers des juristes qualifiés.",
        "hours": 3,
        "skills": [
          "rédaction"
        ]
      }
    ]
  },
  {
    "id": "community-wood-bank",
    "name": "Banque de bois communautaire / aide au chauffage",
    "purpose": "Récolter et distribuer du bois de chauffage et coordonner l'aide au chauffage pour que le voisinage reste au chaud tout l'hiver.",
    "whoItServes": "Les foyers ruraux et à petit budget qui se chauffent au bois, et les personnes âgées qui ne peuvent plus ramasser ou fendre le leur.",
    "whatYoullNeed": "Une source de bois, un site de découpe et de stockage, du matériel, une équipe formée et un plan de livraison. Tronçonneuses et fendeuses sont dangereuses — ne laissez opérer que des personnes formées, exigez l'équipement de protection et faites un point sécurité avant chaque séance.",
    "setupHours": 24,
    "defaultCategory": "mutual_aid_drive",
    "suggestsWorkDays": true,
    "firstSteps": "Commencez par parler avec les foyers qui se chauffent au bois — personnes âgées rurales, familles que le service d'aide au chauffage connaît déjà — pour savoir combien ils brûlent et quand ils en manquent, puis appelez les élagueurs du coin pour savoir où part leur bois aujourd'hui. Avant de démarrer la moindre tronçonneuse, décidez qui porte la sécurité : quelqu'un d'assez expérimenté pour former l'équipe et à l'aise pour dire non à un ou une bénévole.",
    "commonPitfalls": "Les deux façons de blesser : une personne non formée sur une tronçonneuse, et livrer du bois vert qui fume, tapisse les cheminées de créosote et ne chauffe pas. Couper en octobre pour décembre, c'est du bois humide — l'échec de calendrier est aussi réel que celui de sécurité.",
    "pairsWith": [
      "weatherization-brigade",
      "cooling-warming-center"
    ],
    "tasks": [
      {
        "name": "Trouvez une source de bois",
        "description": "Organisez l'approvisionnement auprès d'élagueurs, de nettoyages après tempête, de dons d'arbres tombés ou de parcelles gérées durablement. Confirmez que vous pouvez le prendre et le débiter légalement.",
        "hours": 4,
        "skills": [
          "prise de contact"
        ]
      },
      {
        "name": "Trouvez un site de découpe et de stockage",
        "description": "Trouvez une cour ou un terrain où couper, fendre, empiler et faire sécher le bois. Il faut de la place pour garder au sec la réserve de cette saison et faire sécher celle de la prochaine.",
        "hours": 4,
        "skills": [
          "prise de contact"
        ]
      },
      {
        "name": "Réunissez le matériel et l'équipement de protection",
        "description": "Obtenez ou empruntez une fendeuse, des tronçonneuses et l'équipement de protection (jambières, protections des yeux et des oreilles, gants). Entretenez les outils et gardez une trousse de premiers secours sur place.",
        "hours": 4,
        "skills": [
          "conduite",
          "réparation d'outils"
        ]
      },
      {
        "name": "Recrutez et formez une équipe bois",
        "description": "Montez l'équipe et assurez-vous que seules des personnes bien formées manient tronçonneuses et fendeuses. Faites un point sécurité avant chaque journée de chantier.",
        "hours": 4,
        "skills": [
          "enseignement",
          "prise de contact"
        ]
      },
      {
        "name": "Montez un système de demande et de livraison",
        "description": "Créez un moyen pour les foyers de demander du bois et d'organiser la livraison, car bien des personnes destinataires sont âgées ou sans camionnette. Confirmez un empilage sûr près de la maison.",
        "hours": 3,
        "skills": [
          "organisation",
          "conduite"
        ]
      },
      {
        "name": "Fixez les critères de distribution",
        "description": "Décidez combien de bois reçoit chaque foyer et donnez la priorité aux personnes les plus exposées au froid. Gardez le processus simple et sans obstacles.",
        "hours": 2,
        "skills": [
          "animation"
        ]
      },
      {
        "name": "Planifiez les journées de chantier et le séchage",
        "description": "Prévoyez la coupe et la fente bien avant l'hiver, car le bois vert doit sécher des mois avant de brûler sans danger. Suivez ce qui est sec et prêt.",
        "hours": 3,
        "recurringCadence": "cycle",
        "skills": [
          "organisation"
        ],
        "follows": [
          0,
          1,
          2,
          3
        ]
      }
    ]
  },
  {
    "id": "community-wifi-mesh",
    "name": "WiFi communautaire gratuit / réseau maillé",
    "purpose": "Offrir un accès internet gratuit là où il est hors de prix ou inexistant.",
    "whoItServes": "Les foyers à petit budget, les étudiants et étudiantes, les personnes en recherche d'emploi et toutes celles coupées d'un internet fiable.",
    "whatYoullNeed": "Une ligne internet à partager, des routeurs et nœuds maillés, des bénévoles à l'aise en technique et des lieux d'accueil pour les nœuds.",
    "setupHours": 32,
    "defaultCategory": "tech",
    "firstSteps": "Arpentez les rues que vous voulez couvrir et frappez aux portes — parlez avec les foyers sans connexion de ce qu'ils en feraient vraiment, et avec les gens dont les toits et fenêtres hautes pourraient accueillir un nœud. Avant d'acheter du matériel, ayez la conversation sur la bande passante : trouvez le commerce, la bibliothèque ou le fournisseur d'accès prêt à partager une ligne, et confirmez par écrit que la redistribution est permise.",
    "commonPitfalls": "Les réseaux maillés meurent en général d'entretien, pas de construction — la personne technique fondatrice déménage et plus personne ne peut se connecter aux routeurs, alors documentez tout et formez une deuxième personne dès le premier jour. L'autre échec silencieux, c'est de construire là où le signal passe facilement plutôt que là où les gens manquent vraiment d'accès.",
    "pairsWith": [
      "digital-literacy",
      "emergency-preparedness"
    ],
    "tasks": [
      {
        "name": "Cartographiez les besoins et les trous de couverture",
        "description": "Repérez quelles rues manquent d'accès abordable et jusqu'où le signal pourrait porter. Notez les bâtiments avec une ligne de vue dégagée et des hôtes partants. C'est ce qui dessine tout le projet.",
        "hours": 4,
        "skills": [
          "dépannage informatique"
        ]
      },
      {
        "name": "Sécurisez une ligne internet à partager",
        "description": "Trouvez une source de bande passante à partager — une ligne pro donnée, un partenariat avec un fournisseur d'accès ou un lien vers un réseau communautaire. Confirmez que les conditions permettent la redistribution.",
        "hours": 5,
        "skills": [
          "prise de contact",
          "dépannage informatique"
        ]
      },
      {
        "name": "Recrutez des bénévoles techniques",
        "description": "Trouvez des gens à l'aise avec les réseaux, capables de configurer des routeurs et de dépanner. Deux suffisent pour démarrer, plus des personnes motivées pour apprendre.",
        "hours": 3,
        "skills": [
          "prise de contact",
          "dépannage informatique"
        ]
      },
      {
        "name": "Trouvez et configurez le matériel",
        "description": "Rassemblez routeurs, nœuds maillés et antennes par des dons ou un petit budget. Configurez-les pour un réseau ouvert ou simplement partagé, et testez la couverture.",
        "hours": 10,
        "skills": [
          "dépannage informatique"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Trouvez des lieux d'accueil pour les nœuds",
        "description": "Placez les nœuds là où ils étendent la portée — toits, fenêtres hautes, porches avec du courant et une permission. Obtenez un accord écrit de chaque hôte et couvrez le petit coût d'électricité.",
        "hours": 5,
        "skills": [
          "prise de contact"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Posez des règles d'usage et de vie privée",
        "description": "Affichez des règles simples, évitez d'enregistrer l'activité des gens et dites clairement qu'un réseau ouvert n'est pas privé. Renvoyez vers des gestes de base comme HTTPS et les VPN.",
        "hours": 2,
        "skills": [
          "rédaction"
        ]
      },
      {
        "name": "Entretenez et étendez le réseau",
        "description": "Vérifiez les nœuds régulièrement, remplacez le matériel en panne et ajoutez de la couverture quand de nouveaux hôtes rejoignent. Documentez l'installation pour que d'autres puissent aider à l'entretenir.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "dépannage informatique"
        ],
        "follows": [
          3,
          4
        ]
      }
    ]
  },
  {
    "id": "mental-health-peer-support",
    "name": "Cercle de soutien entre pairs en santé mentale",
    "purpose": "Offrir un espace sûr, régulier et mené par des pairs pour se confier et s'épauler — un complément aux soins professionnels, pas un remplacement.",
    "whoItServes": "Toute personne qui traverse stress, isolement, deuil ou difficultés de santé mentale et cherche du lien entre pairs.",
    "whatYoullNeed": "Des personnes animatrices formées, un espace privé et des limites claires avec un plan d'orientation en cas de crise. Le soutien entre pairs complète les soins professionnels en santé mentale — il ne les remplace pas. Les personnes qui animent ne sont pas des thérapeutes, et il faut toujours un plan clair pour relier quiconque est en crise à des ressources professionnelles ou d'urgence qualifiées.",
    "setupHours": 21,
    "defaultCategory": "emotional_support",
    "firstSteps": "Vos premières conversations sont pour les personnes qui pourraient animer et pour les acteurs locaux de la santé mentale — une clinique, une ligne de crise ou un ou une thérapeute qui accepte d'être votre relais d'orientation avant même la première rencontre du cercle. N'ouvrez pas les portes tant que l'équipe d'animation n'est pas formée et que tout le monde ne sait pas dire simplement ce que le cercle est et n'est pas.",
    "commonPitfalls": "L'échec dangereux, c'est la dérive : un cercle chaleureux devient peu à peu le seul soutien de quelqu'un, les personnes qui animent se mettent à jouer les thérapeutes, et il n'y a aucun plan pour le soir où quelqu'un est en vraie crise. Le plus discret, c'est l'épuisement — si les personnes qui tiennent l'espace n'ont aucun soutien à elles, le cercle s'éteint en un an.",
    "pairsWith": [
      "neighborhood-care-network",
      "disability-support-network",
      "harm-reduction-supplies"
    ],
    "learnMore": [
      "who-sees-what",
      "lurking-ok"
    ],
    "tasks": [
      {
        "name": "Recrutez et formez les personnes animatrices",
        "description": "Trouvez des personnes chaleureuses et posées et faites-leur suivre une formation au soutien entre pairs ou à l'écoute active. Soyez clairs : elles sont des pairs qui tiennent l'espace, pas des pros qui diagnostiquent ou soignent.",
        "hours": 5,
        "skills": [
          "animation",
          "prise de contact"
        ]
      },
      {
        "name": "Définissez le périmètre et les limites du cercle",
        "description": "Posez que c'est du soutien entre pairs, pas de la thérapie ni de la gestion de crise. Écrivez à quoi sert le cercle et ce qui sort de son rôle, pour que les attentes soient claires pour tout le monde.",
        "hours": 3,
        "skills": [
          "rédaction"
        ]
      },
      {
        "name": "Montez un plan d'orientation et d'escalade en cas de crise",
        "description": "Préparez des étapes claires pour quand quelqu'un va au-delà de ce que le soutien entre pairs peut porter : comment le relier en douceur à de l'aide professionnelle ou aux services de crise, et quand appeler les urgences. Gardez sous la main des ressources locales et nationales à jour.",
        "hours": 3,
        "skills": [
          "rédaction"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Trouvez un espace privé et sûr",
        "description": "Trouvez une salle calme, confortable et confidentielle où l'on peut parler librement. La constance du lieu aide les gens à se sentir en sécurité pour revenir.",
        "hours": 2,
        "skills": [
          "prise de contact"
        ]
      },
      {
        "name": "Posez la confidentialité et les règles du groupe",
        "description": "Convenez de la confidentialité, pas de conseils sauf s'ils sont demandés, pas d'interruption, et le droit de passer son tour. Partagez ces règles au début de chaque rencontre.",
        "hours": 3,
        "skills": [
          "animation",
          "rédaction"
        ]
      },
      {
        "name": "Planifiez et faites connaître les rencontres",
        "description": "Choisissez un horaire stable, gardez des groupes à taille humaine et faites-le connaître d'une façon qui réduit le stigmate. Dites clairement que c'est gratuit et ouvert.",
        "hours": 3,
        "skills": [
          "prise de contact",
          "organisation"
        ],
        "follows": [
          0,
          3
        ]
      },
      {
        "name": "Soutenez l'équipe d'animation et prévenez l'épuisement",
        "description": "Tenez des points réguliers pour que les personnes qui animent déposent et décompressent. Faites tourner qui mène, et veillez à ce qu'elles aient aussi leur propre soutien.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "animation"
        ]
      }
    ]
  },
  {
    "id": "community-cleanup",
    "name": "Nettoyage du quartier et remise en état des espaces verts",
    "purpose": "Ramasser les déchets, remettre en état les terrains et parcs délaissés, et créer des espaces verts partagés.",
    "whoItServes": "Tout le quartier — un espace plus propre, plus sûr et plus vert profite à tout le monde.",
    "whatYoullNeed": "Des bénévoles, du matériel, les autorisations des sites et un plan d'évacuation des déchets. Les terrains délaissés peuvent cacher de vrais dangers — ne ramassez jamais d'aiguilles ni de produits chimiques inconnus à la main ; utilisez des outils et un collecteur rigide à aiguilles, et évacuez les trouvailles dangereuses selon les règles locales.",
    "setupHours": 10,
    "defaultCategory": "infrastructure",
    "suggestsWorkDays": true,
    "firstSteps": "Parcourez le quartier avec les personnes qui vivent au plus près des coins délaissés — elles savent quels terrains comptent, à qui ils appartiennent et ce qui a déjà été tenté — et vérifiez si la ville ou une association d'amis du parc organise déjà des nettoyages auxquels vous greffer. Réglez la propriété, l'autorisation et la destination des déchets avant de choisir une date.",
    "commonPitfalls": "Les nettoyages échouent de deux façons : les sacs de déchets ramassés restent des semaines sur le trottoir parce que personne n'a prévu l'évacuation, et le terrain magnifiquement dégagé est de nouveau envahi à l'automne parce qu'il n'y avait pas de plan au-delà du grand jour. Et une personne bénévole qui attrape une aiguille à main nue peut transformer une belle matinée en passage à l'hôpital.",
    "pairsWith": [
      "community-garden",
      "community-composting"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Repérer et prioriser les sites",
        "description": "Parcourez la zone et listez les coins qui demandent de l'attention — angles couverts de déchets, terrains envahis, parcs délaissés. Priorisez selon l'impact et la faisabilité.",
        "hours": 1.5
      },
      {
        "name": "Obtenir les autorisations et un plan d'évacuation",
        "description": "Confirmez à qui appartient chaque site et obtenez l'autorisation. Prévoyez l'évacuation des déchets et des gravats à l'avance — coordonnez une benne ou un ramassage municipal pour que les sacs ne s'entassent pas.",
        "hours": 2,
        "skills": [
          "communication",
          "démarches"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Rassembler le matériel et l'équipement de sécurité",
        "description": "Réunissez gants, sacs, pinces à déchets et gilets fluo. Prévoyez un collecteur rigide à aiguilles et un plan pour tout objet dangereux trouvé.",
        "hours": 1.5,
        "skills": [
          "conduite"
        ]
      },
      {
        "name": "Recruter et organiser les bénévoles",
        "description": "Faites passer le mot et inscrivez les gens. Désignez des responsables d'équipe et des zones pour que la journée soit organisée plutôt que chaotique.",
        "hours": 2,
        "skills": [
          "communication",
          "organisation"
        ]
      },
      {
        "name": "Mener la journée de nettoyage ou de remise en état",
        "description": "Tenez l'événement, gardez les équipes en sécurité et hydratées, et célébrez ensemble le résultat visible. Prenez des photos avant-après pour motiver les prochaines venues.",
        "hours": 3,
        "skills": [
          "organisation",
          "photo"
        ],
        "follows": [
          1,
          2,
          3
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "free-tax-prep",
    "name": "Permanence gratuite de déclaration d'impôts et d'autonomie financière",
    "purpose": "Aider les voisines et voisins à faibles revenus à déclarer leurs impôts gratuitement et à toucher les crédits et remboursements auxquels ils ont droit.",
    "whoItServes": "Les personnes qui travaillent pour de faibles revenus, les familles éligibles aux crédits d'impôt, les personnes âgées et les étudiants.",
    "whatYoullNeed": "Des personnes formées et certifiées pour préparer les déclarations, un local, des ordinateurs et un système de rendez-vous. Les déclarations doivent être préparées par des bénévoles certifiés via un programme reconnu — cette permanence aide pour les déclarations courantes, pas pour les situations complexes qui demandent un professionnel de la fiscalité.",
    "setupHours": 28,
    "defaultCategory": "skilled_labor",
    "suggestsWorkDays": true,
    "firstSteps": "Votre premier appel va à un programme établi de déclaration gratuite comme VITA — parlez avec sa coordination des délais de certification, du logiciel et de ce qu'il faut à un nouveau site, parce que vous ne devriez pas porter ça seuls. Parlez ensuite avec les voisines et voisins que vous espérez servir : quand peuvent-ils vraiment venir, et qu'est-ce qui les a empêchés de déclarer jusqu'ici ?",
    "commonPitfalls": "Une déclaration erronée peut coûter son remboursement à une famille ou déclencher un contrôle — voilà pourquoi la ligne à ne jamais franchir, c'est des bénévoles non certifiés qui préparent des déclarations. Les échecs plus doux : lancer en mars alors que la certification prend des mois, et quelqu'un qui fait le trajet en bus pour se voir refusé à cause d'un document que personne ne lui avait dit d'apporter.",
    "pairsWith": [
      "legal-aid-clinic",
      "solidarity-fund"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Former et certifier les personnes qui préparent",
        "description": "Faites suivre aux bénévoles une certification reconnue de préparation gratuite des impôts (comme le programme VITA de l'IRS) pour que les déclarations soient justes et dûment autorisées. C'est non négociable.",
        "hours": 10,
        "recurringCadence": "cycle",
        "skills": [
          "comptabilité"
        ]
      },
      {
        "name": "S'associer à un programme reconnu de déclaration gratuite",
        "description": "Affiliez-vous à un programme établi pour le logiciel, le soutien et la crédibilité. Il fournit les outils de déclaration et les contrôles de qualité que vous ne devriez pas construire seuls.",
        "hours": 4,
        "skills": [
          "communication",
          "démarches"
        ]
      },
      {
        "name": "Installer un local et le matériel",
        "description": "Trouvez un lieu avec des ordinateurs, une connexion fiable et assez d'intimité pour que les gens partagent sereinement des informations financières sensibles.",
        "hours": 3,
        "skills": [
          "dépannage informatique"
        ]
      },
      {
        "name": "Monter un système de rendez-vous et d'accueil",
        "description": "Créez des rendez-vous et une liste claire des documents à apporter (pièce d'identité, justificatifs de revenus, déclaration précédente). Ça évite les trajets pour rien et les longues attentes.",
        "hours": 3,
        "skills": [
          "organisation",
          "saisie de données"
        ]
      },
      {
        "name": "Faire connaître la permanence aux voisins éligibles",
        "description": "Faites passer le mot, en soulignant que déclarer peut débloquer des remboursements et des crédits que beaucoup ratent. Touchez les travailleurs, les familles et les personnes âgées qui y ont souvent droit.",
        "hours": 3,
        "recurringCadence": "cycle",
        "skills": [
          "communication",
          "graphisme"
        ],
        "follows": [
          3
        ]
      },
      {
        "name": "Garantir la sécurité et la confidentialité des données",
        "description": "Protégez chaque miette de donnée personnelle et financière : appareils sécurisés, pas de copies inutiles, rangement sous clé et une règle claire de conservation et de destruction.",
        "hours": 3,
        "skills": [
          "dépannage informatique"
        ]
      },
      {
        "name": "Proposer un suivi d'autonomie financière",
        "description": "Quand c'est souhaité, orientez vers de l'aide au budget, des services bancaires sûrs et une vérification des aides. Gardez ça facultatif et renvoyez les situations complexes vers des professionnels qualifiés.",
        "hours": 2,
        "skills": [
          "comptabilité"
        ]
      }
    ]
  },
  {
    "id": "community-market",
    "name": "Marché communautaire / Stand de produits frais gratuit",
    "purpose": "Tenir un stand régulier, gratuit ou à prix libre, qui distribue des produits frais et des denrées de base.",
    "whoItServes": "Les voisines et voisins en précarité alimentaire et les personnes des zones sans produits frais abordables.",
    "whatYoullNeed": "Une source d'approvisionnement, un stand ou un emplacement, des bénévoles et un horaire régulier.",
    "setupHours": 15,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Commencez par les conversations d'approvisionnement — visitez fermes, épiceries et jardins partagés pour savoir quel surplus existe vraiment et à quel rythme — et parlez avec les gens du quartier desservi : par où passent-ils déjà, et quelle nourriture ramèneraient-ils vraiment chez eux ? Choisissez l'emplacement avec les personnes qui l'utiliseront, pas à leur place.",
    "commonPitfalls": "Un stand qui apparaît par à-coups apprend aux gens à ne plus compter dessus — la régularité compte plus que l'abondance. Les autres échecs : un approvisionnement qui se tarit après le premier mois d'enthousiasme, et tout ce qui, à la table (formulaires, questions, tri des gens), transforme le geste de se servir en dépôt de dossier.",
    "pairsWith": [
      "gleaning-network",
      "bulk-buying-coop",
      "community-garden"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Sécuriser l'approvisionnement en produits et denrées",
        "description": "Trouvez de la nourriture via le glanage, les jardins partagés, les dons de fermes et d'épiceries et les achats groupés. Visez la variété et la fiabilité pour que le stand ne soit pas vide.",
        "hours": 3,
        "skills": [
          "communication",
          "conduite"
        ]
      },
      {
        "name": "Trouver un emplacement et monter le stand",
        "description": "Choisissez un endroit visible, accessible et autorisé — la lisière d'un parc, un parking ou un arrêt de bus. Prévoyez tables, ombre et signalétique.",
        "hours": 2,
        "skills": [
          "communication"
        ]
      },
      {
        "name": "Décider du modèle",
        "description": "Choisissez tout gratuit, prix libre ou un mélange. Quel que soit le choix, veillez à ne jamais refuser personne faute de pouvoir payer.",
        "hours": 1,
        "skills": [
          "animation"
        ]
      },
      {
        "name": "Organiser présentation, stockage et hygiène alimentaire",
        "description": "Gardez les produits au frais et présentables, manipulez la nourriture proprement et prévoyez glacières ou ombre pour les jours chauds. Jetez tout ce qui est abîmé.",
        "hours": 2,
        "skills": [
          "hygiène alimentaire"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Recruter et planifier les bénévoles",
        "description": "Trouvez des gens pour aller chercher les produits, monter, tenir le stand et remballer. Attribuez des rôles clairs pour chaque marché.",
        "hours": 2,
        "skills": [
          "organisation",
          "communication"
        ]
      },
      {
        "name": "Faire connaître et fixer un horaire régulier",
        "description": "Choisissez un jour et une heure constants et annoncez-les largement. C'est la prévisibilité qui transforme un stand en ressource fiable.",
        "hours": 2,
        "skills": [
          "communication",
          "graphisme"
        ],
        "follows": [
          1,
          2
        ]
      },
      {
        "name": "Tenir le stand et gérer les restes",
        "description": "Montez, distribuez avec chaleur et sans jugement, et acheminez les restes vers frigos partagés, garde-manger ou programmes de repas pour que rien ne se perde.",
        "hours": 3,
        "skills": [
          "organisation"
        ],
        "follows": [
          0,
          3,
          4
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "welcome-wagon",
    "name": "Comité d'accueil : soutien aux nouveaux voisins et aux nouveaux parents",
    "purpose": "Accueillir les personnes nouvellement arrivées et les nouveaux parents avec de l'aide concrète, des infos locales et une vraie bienvenue dans la communauté.",
    "whoItServes": "Les personnes qui viennent d'emménager, les parents récents ou en devenir, et quiconque a besoin d'un départ chaleureux.",
    "whatYoullNeed": "Des bénévoles, des livrets d'infos, des articles de bienvenue donnés et un système de mise en relation.",
    "setupHours": 10,
    "defaultCategory": "emotional_support",
    "firstSteps": "Parlez d'abord avec celles et ceux qui rencontrent les nouveaux venus avant vous — propriétaires, secrétariats d'école, cliniques, sages-femmes et infirmières de pédiatrie — de la façon d'orienter quelqu'un avec son accord. Demandez ensuite à quelques personnes récemment arrivées et à de nouveaux parents ce qui les aurait vraiment aidés le premier mois, et bâtissez le livret et le panier autour de leurs réponses.",
    "commonPitfalls": "Là où ça déraille, c'est quand ça prend des airs de surveillance — débarquer sans invitation à la porte d'une personne inconnue, ou transmettre des noms sans accord, transforme une bienvenue en intrusion. Ça s'éteint aussi en silence quand les premières personnes qui accueillaient s'épuisent et que les nouveaux venus passent inaperçus des mois durant.",
    "pairsWith": [
      "newcomer-translation-network",
      "diaper-hygiene-bank",
      "neighborhood-care-network"
    ],
    "learnMore": [
      "invite-someone"
    ],
    "tasks": [
      {
        "name": "Décider qui accueillir et comment",
        "description": "Définissez votre cible — nouveaux résidents, nouveaux parents, ou les deux — et la forme de la bienvenue (une visite, un panier, un appel). Toujours sur accord, jamais intrusif.",
        "hours": 1,
        "skills": [
          "animation"
        ]
      },
      {
        "name": "Composer un livret d'infos locales",
        "description": "Rassemblez un guide clair des services locaux, des transports, des écoles, des soins et de votre réseau d'entraide. Proposez-le dans les langues parlées dans votre coin.",
        "hours": 3,
        "skills": [
          "rédaction",
          "traduction"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Composer les paniers de bienvenue",
        "description": "Réunissez des choses utiles — bases d'épicerie, articles pour la maison, et pour les nouveaux parents, quelques essentiels de bébé ou un plat maison. Trouvez tout via des dons.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "communication",
          "organisation"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Recruter et former les personnes qui accueillent",
        "description": "Trouvez des bénévoles chaleureux et apprenez-leur à être accueillants et respectueux, à sentir si quelqu'un veut du lien, et à ne jamais insister ni fouiner.",
        "hours": 2,
        "skills": [
          "communication",
          "pédagogie"
        ]
      },
      {
        "name": "Mettre en place mise en relation et inscription",
        "description": "Créez des moyens simples d'être orienté ou de se signaler soi-même — via propriétaires, cliniques, écoles ou un petit formulaire. Respectez la vie privée de bout en bout.",
        "hours": 2,
        "skills": [
          "organisation",
          "saisie de données"
        ],
        "follows": [
          0
        ]
      }
    ]
  },
  {
    "id": "library-of-things",
    "name": "Bibliothèque d'objets",
    "purpose": "Prêter les objets du quotidien et d'événement qu'on a rarement besoin de posséder — matériel de cuisine, affaires de fête et de camping, équipement de bébé, vidéoprojecteurs et plus.",
    "whoItServes": "Tout le monde ; ça fait économiser, désencombre et réduit le gaspillage.",
    "whatYoullNeed": "Un espace de stockage, des objets donnés, un catalogue et un système de prêt, et deux bibliothécaires.",
    "setupHours": 21,
    "defaultCategory": "infrastructure",
    "firstSteps": "Avant de collecter le moindre objet, demandez aux membres ce qu'ils emprunteraient vraiment — ce sondage est la fondation du projet — et parlez avec la bibliothèque municipale ou une maison de quartier pour l'héberger : une institution de confiance règle d'un coup le stockage et la crédibilité. Recrutez vos deux bibliothécaires avant l'arrivée des dons, pas après.",
    "commonPitfalls": "Les bibliothèques d'objets meurent d'encombrement : dire oui à chaque don remplit la salle de machines à pain cassées dont personne ne veut, pendant que le nettoyeur haute pression que tout le monde a demandé manque toujours. L'autre tueur, ce sont les horaires imprévisibles — si les gens ne peuvent pas compter sur les heures de retrait et de retour, ils retournent en silence acheter.",
    "pairsWith": [
      "tool-lending-library",
      "toy-library",
      "free-store"
    ],
    "learnMore": [
      "confirm-exchange"
    ],
    "tasks": [
      {
        "name": "Sonder ce que la communauté veut emprunter",
        "description": "Demandez aux membres ce qu'ils utiliseraient mais détesteraient acheter — tables pliantes, bol à punch, tente, shampouineuse, poussette. Les réponses fixent l'inventaire de départ.",
        "hours": 2,
        "skills": [
          "communication"
        ]
      },
      {
        "name": "Trouver le stockage et les horaires d'ouverture",
        "description": "Trouvez un placard, une salle ou un conteneur pour ranger les objets, et fixez des heures prévisibles de retrait et de retour pour qu'emprunter soit facile.",
        "hours": 3,
        "skills": [
          "communication"
        ]
      },
      {
        "name": "Collecter, nettoyer et tester les objets",
        "description": "Rassemblez les dons, puis nettoyez, testez et vérifiez la sécurité de chaque objet. Écartez tout ce qui est cassé, rappelé ou peu hygiénique.",
        "hours": 5,
        "skills": [
          "conduite"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Cataloguer et photographier l'inventaire",
        "description": "Enregistrez chaque objet avec une photo et son état dans un tableur ou une appli de prêt. Numérotez les objets pour suivre facilement les sorties et les retours.",
        "hours": 4,
        "skills": [
          "saisie de données",
          "photo"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Écrire les règles d'emprunt et une politique de confiance",
        "description": "Fixez la durée de prêt, les limites de quantité et une politique de retour indulgente. Fondez tout sur la confiance plutôt que sur les amendes, et notez les objets demandant un soin ou un nettoyage particulier.",
        "hours": 2,
        "skills": [
          "rédaction"
        ]
      },
      {
        "name": "Mettre en place le prêt et former les bibliothécaires",
        "description": "Créez une fiche de sortie simple (nom, contact, objet, date de retour) avec une photo rapide de l'état. Faites faire aux bénévoles le tour du catalogue et du déroulé.",
        "hours": 3,
        "skills": [
          "saisie de données",
          "pédagogie"
        ],
        "follows": [
          3,
          4
        ]
      },
      {
        "name": "Entretenir, désinfecter et faire grandir la collection",
        "description": "Nettoyez et inspectez les retours, réparez ce qui peut l'être, et ajoutez au fil du temps les objets les plus demandés.",
        "hours": 2,
        "skills": [
          "réparation"
        ],
        "recurringCadence": "session"
      }
    ]
  },
  {
    "id": "laundry-shower-access",
    "name": "Programme d'accès à la laverie et aux douches",
    "purpose": "Offrir un accès gratuit à la laverie et aux douches pour que les gens puissent rester propres dans la dignité.",
    "whoItServes": "Les voisines et voisins sans logement, les personnes sans installations en état de marche et les familles à faibles revenus.",
    "whatYoullNeed": "Un accès à des machines et à des douches (un site partenaire ou une unité mobile), des fournitures et des bénévoles. La dignité et l'intimité des personnes accueillies passent d'abord — n'exigez aucune information personnelle pour utiliser le service, gardez les espaces de douche privés et sûrs, et suivez les règles sanitaires locales pour les installations partagées ou mobiles.",
    "setupHours": 19,
    "defaultCategory": "infrastructure",
    "suggestsWorkDays": true,
    "firstSteps": "Commencez par deux séries de conversations : avec les voisines et voisins sans logement et les travailleurs de rue qui les connaissent, sur les horaires et les lieux qui marcheraient vraiment — et avec la personne qui tient une laverie, une salle de sport ou un lieu de culte pour l'accueil. Cette conversation d'hôte est délicate ; soyez honnêtes sur qui viendra et réglez les attentes d'intimité, de ménage et d'horaires avant la première visite.",
    "commonPitfalls": "Ce programme meurt quand la relation avec l'hôte tourne au vinaigre — une mauvaise interaction sans protocole derrière, et l'espace est perdu — ou quand les horaires bougent si souvent que les gens traversent la ville pour trouver porte close. Et chaque papier exigé à l'entrée éloigne quelqu'un qui avait plus besoin d'une douche que vous de son nom.",
    "pairsWith": [
      "free-haircut",
      "cooling-warming-center",
      "diaper-hygiene-bank"
    ],
    "tasks": [
      {
        "name": "Sécuriser l'accès à la laverie et aux douches",
        "description": "Faites équipe avec une laverie, une salle de sport, un lieu de culte, un centre de loisirs, ou organisez une unité mobile. Confirmez des horaires fiables et un espace qui préserve l'intimité.",
        "hours": 4,
        "skills": [
          "communication"
        ]
      },
      {
        "name": "Trouver les fournitures",
        "description": "Réunissez lessive, serviettes propres, savon, shampoing et autres produits d'hygiène via des dons ou un petit budget. Ajoutez quelques vêtements propres si vous pouvez.",
        "hours": 3,
        "skills": [
          "communication",
          "conduite"
        ]
      },
      {
        "name": "Monter un système d'inscription et de créneaux",
        "description": "Créez une façon équitable de réserver machines et créneaux de douche pour que l'attente reste raisonnable et que chacun ait son tour.",
        "hours": 3,
        "skills": [
          "organisation",
          "saisie de données"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Établir les protocoles d'hygiène et de sécurité",
        "description": "Fixez le ménage entre chaque passage, garantissez des douches privées et sûres, et protégez la dignité et la sécurité de tout le monde, du début à la fin.",
        "hours": 3,
        "skills": [
          "rédaction"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Recruter et former les bénévoles",
        "description": "Trouvez des bénévoles pour l'accueil, les fournitures et le ménage entre les passages. Formez-les à recevoir chaque personne avec chaleur et respect.",
        "hours": 3,
        "skills": [
          "communication",
          "pédagogie"
        ],
        "follows": [
          3
        ]
      },
      {
        "name": "Fixer un horaire et faire passer le mot",
        "description": "Choisissez des heures constantes et prévenez travailleurs de rue, hébergements d'urgence et voisins qui vivent à la rue de quand et où le service tourne.",
        "hours": 3,
        "skills": [
          "communication"
        ],
        "follows": [
          0
        ]
      }
    ]
  },
  {
    "id": "voter-registration",
    "name": "Campagne d'inscription électorale et de participation citoyenne",
    "purpose": "Aider les gens à s'inscrire pour voter et à prendre part aux élections et aux décisions locales — strictement non partisan.",
    "whoItServes": "Les résidentes et résidents ayant le droit de vote, surtout celles et ceux historiquement sous-représentés dans les urnes.",
    "whatYoullNeed": "Des bénévoles formés, du matériel d'inscription, des règles exactes et de bons emplacements. Gardez la campagne strictement non partisane et suivez à la lettre toutes les lois électorales et d'inscription — donnez uniquement des informations exactes et ne faites jamais campagne pour un parti ou une candidature.",
    "setupHours": 16,
    "defaultCategory": "organizing",
    "firstSteps": "Avant de tenir le moindre stand, parlez avec votre bureau électoral local — il vous dira exactement ce qu'une campagne peut faire ou non, et certains endroits exigent d'abord une formation ou un enregistrement. Rapprochez-vous ensuite de la League of Women Voters ou d'un autre groupe non partisan établi ; emprunter leurs supports et leur expérience vaut mieux qu'apprendre le droit électoral par essais et erreurs.",
    "commonPitfalls": "Les échecs impardonnables sont juridiques : une pile de formulaires remplis oubliée dans un coffre de voiture jusqu'après la date limite prive de vote chaque personne qui vous a fait confiance, et un seul bénévole qui vante une candidature peut entacher toute la campagne. Le raté plus discret : distribuer des formulaires d'inscription sans jamais dire où ni comment voter.",
    "pairsWith": [
      "newcomer-translation-network",
      "legal-aid-clinic"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Apprendre les règles des campagnes d'inscription",
        "description": "Renseignez-vous sur les lois locales d'inscription des électeurs : dates limites, ce que les bénévoles peuvent faire ou non, comment manipuler les formulaires et les exigences de pièce d'identité. Les suivre à la lettre est essentiel.",
        "hours": 3,
        "skills": [
          "démarches"
        ]
      },
      {
        "name": "Former des bénévoles non partisans",
        "description": "Apprenez aux bénévoles à aider tout le monde à s'inscrire quelles que soient ses opinions, et à ne jamais promouvoir un parti ou une candidature. La neutralité protège la campagne et la confiance de la communauté.",
        "hours": 3,
        "skills": [
          "pédagogie"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Réunir le matériel et des informations exactes",
        "description": "Rassemblez les formulaires d'inscription et des infos vérifiées et à jour sur les dates limites, les règles de pièce d'identité, les bureaux de vote et le vote par correspondance. Une info fausse fait plus de mal que pas d'info.",
        "hours": 2,
        "skills": [
          "rédaction"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Choisir des lieux et événements passants",
        "description": "Installez-vous là où les habitants se retrouvent déjà — marchés, gares et arrêts, campus, événements de quartier — avec les autorisations nécessaires pour tenir un stand.",
        "hours": 2,
        "skills": [
          "communication"
        ]
      },
      {
        "name": "Tenir le stand d'inscription",
        "description": "Tenez la table, aidez les gens à s'inscrire sans erreur et remettez les formulaires vite, dans les délais légaux. Gardez un ton accueillant et informatif.",
        "hours": 4,
        "skills": [
          "communication"
        ],
        "follows": [
          1,
          2,
          3
        ],
        "recurringCadence": "event"
      },
      {
        "name": "Accompagner la suite",
        "description": "Au-delà de l'inscription, aidez les gens à savoir comment, quand et où voter, y compris le vote par correspondance et les trajets vers les bureaux de vote. S'inscrire, ce n'est pas encore participer.",
        "hours": 2,
        "skills": [
          "communication"
        ]
      }
    ]
  },
  {
    "id": "health-navigation",
    "name": "Programme communautaire d'accompagnement santé",
    "purpose": "Aider les voisines et voisins à trouver des soins et y accéder — cliniques, assurance, ordonnances et rendez-vous.",
    "whoItServes": "Les personnes sans assurance ou mal assurées, les personnes âgées, les nouveaux arrivants et quiconque est perdu dans le système de santé.",
    "whatYoullNeed": "Des accompagnants formés, un répertoire de ressources, des partenariats avec les soignants et un système de demandes. Les accompagnants relient les gens aux soins — ils ne donnent ni avis médical ni diagnostic. Renvoyez toute question clinique vers des professionnels de santé qualifiés.",
    "setupHours": 26,
    "defaultCategory": "other",
    "firstSteps": "Commencez par visiter les cliniques gratuites et à tarif solidaire vers lesquelles vous orienterez — présentez-vous, demandez quelles orientations les aident et lesquelles les submergent, et laissez ces conversations semer votre répertoire. Réglez la limite avant la première demande : les accompagnants s'occupent de la logistique et des démarches, chaque question clinique va à un professionnel — sachez donc exactement à quelle ligne infirmière ou clinique vous les passerez.",
    "commonPitfalls": "Le fil du rasoir, c'est l'accompagnant bien intentionné qui glisse vers l'avis médical — un « ça n'a pas l'air grave » lancé en passant peut coûter à quelqu'un des semaines de soins nécessaires. Ça échoue aussi quand le répertoire vieillit en silence et envoie les gens vers des cliniques fermées ou des programmes terminés ; un mauvais numéro coûte sa dernière tentative à une personne déjà à bout.",
    "pairsWith": [
      "rides-transportation",
      "newcomer-translation-network",
      "mental-health-peer-support"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Bâtir un répertoire de ressources santé",
        "description": "Compilez cliniques gratuites et à bas prix, soignants à tarif solidaire, programmes d'aide aux médicaments, options dentaires et optiques, et services de santé mentale. Gardez-le à jour.",
        "hours": 6,
        "skills": [
          "saisie de données",
          "communication"
        ]
      },
      {
        "name": "Recruter et former les accompagnants",
        "description": "Trouvez des bénévoles et formez-les à relier les gens aux soins — pas à donner d'avis médical. Leur rôle : orientation et logistique, les questions cliniques allant aux professionnels.",
        "hours": 5,
        "skills": [
          "communication",
          "pédagogie"
        ]
      },
      {
        "name": "Monter un système de demande et d'accueil",
        "description": "Créez un moyen privé et sans barrière de demander de l'aide et de décrire sa situation, avec des options par téléphone et en personne, pas seulement en ligne.",
        "hours": 3,
        "skills": [
          "organisation"
        ]
      },
      {
        "name": "Aider avec l'assurance et les inscriptions",
        "description": "Aidez les gens à comprendre et demander la couverture à laquelle ils ont droit (comme Medicaid ou les plans du marché) et à réunir les documents nécessaires.",
        "hours": 4,
        "recurringCadence": "month",
        "skills": [
          "démarches"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Soutenir rendez-vous et ordonnances",
        "description": "Aidez à prendre les rendez-vous, poser des rappels, naviguer le coût des ordonnances et faire le lien avec le programme de trajets pour se rendre aux soins.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "organisation"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Fixer des pratiques de confidentialité pour la santé",
        "description": "Traitez tout détail de santé comme hautement sensible : collectez le minimum, rangez-le en sécurité et ne partagez jamais sans accord. Formez les accompagnants à la confidentialité.",
        "hours": 2,
        "skills": [
          "rédaction"
        ]
      },
      {
        "name": "Faire équipe avec cliniques et soignants",
        "description": "Tissez des liens avec les cliniques et soignants du coin pour des orientations plus fluides et pour apprendre l'ouverture de nouveaux services à bas prix.",
        "hours": 3,
        "skills": [
          "communication"
        ]
      }
    ]
  },
  {
    "id": "toy-library",
    "name": "Ludothèque et prêt de matériel de jeu",
    "purpose": "Prêter jouets, jeux et matériel de jeu pour que les familles aient de la variété sans devoir l'acheter.",
    "whoItServes": "Les familles avec de jeunes enfants, surtout aux budgets serrés ; ça réduit aussi le gaspillage et le désordre.",
    "whatYoullNeed": "Un espace de rangement, des jouets donnés, un catalogue et un système de prêt, du matériel de nettoyage et des ludothécaires.",
    "setupHours": 10,
    "defaultCategory": "childcare",
    "firstSteps": "Parlez avec les familles que vous espérez servir — à la sortie de la crèche, à une heure du conte, dans un groupe de jeu — des jouets que leurs enfants délaissent le plus vite et des horaires qui leur iraient vraiment, puis demandez une étagère ou une salle à un centre communautaire, une église ou une bibliothèque de quartier. Trouvez une personne bénévole qui s'y connaît en garde d'enfants pour prendre en charge les contrôles de sécurité avant l'arrivée des premiers dons.",
    "commonPitfalls": "Les ludothèques échouent sur la sécurité et sur les pièces : un seul jouet rappelé ou un risque d'étouffement passé entre les mailles brise pour de bon la confiance des familles, et les puzzles rendus incomplets donnent en quelques mois l'impression d'une collection au rabais. Une inspection stricte et des sachets comptés, c'est tout l'enjeu.",
    "pairsWith": [
      "library-of-things",
      "childcare-collective",
      "school-supply-program"
    ],
    "tasks": [
      {
        "name": "Trouvez un lieu de rangement et des horaires d'ouverture",
        "description": "Obtenez des étagères dans un centre communautaire, une bibliothèque ou un espace partagé, et fixez des horaires de retrait et de retour prévisibles autour desquels les familles peuvent s'organiser.",
        "hours": 1.5,
        "skills": [
          "prise de contact"
        ]
      },
      {
        "name": "Collectez, nettoyez et vérifiez la sécurité des jouets",
        "description": "Rassemblez les dons, puis nettoyez et inspectez chaque jouet. Vérifiez les rappels de produits, les pièces cassées et les risques d'étouffement, et mettez de côté tout ce qui est dangereux pour les tout-petits.",
        "hours": 3.5,
        "skills": [
          "conduite",
          "garde d'enfants"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Cataloguez et ensachez avec toutes les pièces",
        "description": "Enregistrez chaque jouet avec une photo et une tranche d'âge, et ensachez les jeux à plusieurs pièces avec leur compte pour que rien ne se perde. Numérotez les articles pour un suivi facile.",
        "hours": 2,
        "skills": [
          "saisie de données",
          "photo"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Rédigez les règles de prêt",
        "description": "Fixez la durée du prêt, le nombre de jouets à la fois et une politique douce pour les retours et les pièces manquantes. Restez sur la confiance et l'indulgence.",
        "hours": 1,
        "skills": [
          "écriture"
        ]
      },
      {
        "name": "Mettez en place le prêt et formez les ludothécaires",
        "description": "Créez une fiche de sortie simple (nom, contact, article, date de retour) et guidez les bénévoles à travers le catalogue, la routine de nettoyage et les règles.",
        "hours": 2,
        "skills": [
          "saisie de données",
          "enseignement"
        ],
        "follows": [
          2,
          3
        ]
      }
    ]
  },
  {
    "id": "food-preservation",
    "name": "Collectif de conservation alimentaire et de mise en bocaux",
    "purpose": "Apprendre et pratiquer ensemble la mise en conserve pour que le surplus de saison dure et que moins de nourriture soit gaspillée.",
    "whoItServes": "Les personnes qui jardinent ou glanent, et les familles qui veulent faire durer la nourriture toute l'année.",
    "whatYoullNeed": "Une cuisine, du matériel de mise en conserve, des personnes référentes qui s'y connaissent et des produits. La conservation maison comporte de vrais risques sanitaires, dont le botulisme, quand elle est mal faite — suivez toujours des consignes à jour et testées venant d'une source fiable, et n'improvisez jamais les temps ni les méthodes de traitement.",
    "setupHours": 18,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Trouvez le savoir avant la cuisine : appelez le service de vulgarisation agricole local ou une personne certifiée en conservation des aliments et demandez-lui de former vos référentes et référents ou de relire vos plans, et parlez avec les gens qui jardinent et glanent des surplus qui arrivent vraiment, et quand. Réservez la cuisine autour du calendrier des récoltes, pas l'inverse.",
    "commonPitfalls": "L'échec qui compte est invisible : un bocal fermé avec une méthode improvisée ou la recette non testée d'une grand-mère peut porter le botulisme et sembler parfait sur l'étagère. L'échec ordinaire, c'est le calendrier — les tomates mûrissent à leur rythme, et un collectif qui tient sa première séance en novembre ne conserve rien.",
    "pairsWith": [
      "gleaning-network",
      "community-garden",
      "community-fridge"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Trouvez une cuisine adaptée",
        "description": "Trouvez une cuisine avec des feux, du plan de travail et de l'eau pour le traitement et le nettoyage. Une salle paroissiale, un centre communautaire ou une cuisine professionnelle font très bien l'affaire.",
        "hours": 2,
        "skills": [
          "prise de contact"
        ]
      },
      {
        "name": "Apprenez des méthodes de conservation sûres",
        "description": "Faites étudier à vos référentes et référents des méthodes testées, fondées sur la recherche, d'une source reconnue (comme un service de vulgarisation universitaire). Une mise en conserve incorrecte peut rendre gravement malade : suivez toujours à la lettre les recettes et les temps de traitement testés.",
        "hours": 4,
        "skills": [
          "hygiène alimentaire",
          "cuisine"
        ]
      },
      {
        "name": "Rassemblez le matériel et les bocaux",
        "description": "Récupérez stérilisateurs à eau bouillante et/ou autoclaves, bocaux, couvercles et outils par des dons ou un petit budget. Vérifiez que les autoclaves sont en état de marche sûr.",
        "hours": 3,
        "skills": [
          "prise de contact",
          "conduite"
        ]
      },
      {
        "name": "Trouvez des produits",
        "description": "Faites venir le surplus de saison du glanage, des jardins, des fermes ou d'achats groupés. Calez les séances sur les moments où les produits abondent et coûtent peu.",
        "hours": 2,
        "recurringCadence": "cycle",
        "skills": [
          "prise de contact"
        ]
      },
      {
        "name": "Planifiez des séances de mise en conserve en groupe",
        "description": "Choisissez des recettes adaptées aux produits et au niveau du groupe, et organisez des postes pour que le travail avance de façon sûre et fluide.",
        "hours": 2,
        "recurringCadence": "session",
        "skills": [
          "cuisine",
          "organisation"
        ],
        "follows": [
          1,
          3
        ]
      },
      {
        "name": "Menez les séances et enseignez en sécurité",
        "description": "Guidez le groupe à travers le processus, en faisant respecter la manipulation sûre, les temps de traitement corrects et la bonne fermeture des bocaux. Faites-en une séance d'apprentissage pour que les savoir-faire se transmettent.",
        "hours": 4,
        "skills": [
          "cuisine",
          "enseignement"
        ],
        "follows": [
          0,
          2,
          4
        ],
        "recurringCadence": "session"
      },
      {
        "name": "Partagez les conserves et gardez trace",
        "description": "Répartissez les conserves entre les personnes participantes et des projets comme le frigo ou le garde-manger. Étiquetez chaque bocal avec contenu et date, et notez ce qui a marché pour la prochaine fois.",
        "hours": 1,
        "recurringCadence": "session",
        "skills": [
          "organisation"
        ],
        "follows": [
          5
        ]
      }
    ]
  },
  {
    "id": "free-haircut",
    "name": "Journées coiffure et soins personnels gratuits",
    "purpose": "Offrir coupes de cheveux et soins personnels gratuits pour redonner dignité, confiance et un nouveau départ.",
    "whoItServes": "Les voisines et voisins sans logement, les personnes en recherche d'emploi, les familles à faibles revenus et les personnes âgées.",
    "whatYoullNeed": "Des coiffeuses, coiffeurs et barbiers diplômés bénévoles, un espace, du matériel et de quoi désinfecter.",
    "setupHours": 10,
    "defaultCategory": "skilled_labor",
    "suggestsWorkDays": true,
    "firstSteps": "Commence par deux conversations : une avec une coiffeuse ou un barbier diplômé prêt à amener un ou une collègue, et une avec les personnes que tu espères servir — un centre d'hébergement, un accueil de jour ou un programme d'insertion sauront te dire quels jours et quel cadre seraient vraiment confortables. Une fois qu'un pro et un lieu d'accueil ont dit oui, le reste n'est que matériel et calendrier.",
    "commonPitfalls": "Ce projet trébuche quand il ressemble à une file de charité plutôt qu'à un salon — coupes expédiées, aucun mot à dire sur le style, téléphones sortis pour les réseaux. Demande à chaque personne ce qu'elle veut, laisse tomber les photos sauf si elle les propose, et ne laisse jamais couper quelqu'un sans diplôme pour absorber la file ; un seul problème d'hygiène peut mettre fin à tout le programme.",
    "pairsWith": [
      "laundry-shower-access",
      "reentry-support"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Recrutez des coiffeuses, coiffeurs et barbiers diplômés",
        "description": "Trouvez des pros prêts à offrir leur savoir-faire. Les personnes diplômées garantissent un service sûr, de qualité, et une bonne désinfection.",
        "hours": 2.5,
        "skills": [
          "prise de contact"
        ]
      },
      {
        "name": "Trouvez un espace avec de quoi désinfecter",
        "description": "Obtenez un lieu avec accès à l'eau, un bon éclairage et des surfaces lavables — un centre communautaire, un salon après la fermeture ou un lieu de culte.",
        "hours": 1.5,
        "skills": [
          "prise de contact"
        ]
      },
      {
        "name": "Réunissez matériel et fournitures",
        "description": "Rassemblez tondeuses, ciseaux, capes, peignes, miroirs et jetables. Prévoyez des extras à emporter comme rasoirs et produits de toilette.",
        "hours": 2,
        "skills": [
          "prise de contact",
          "conduite"
        ]
      },
      {
        "name": "Organisez la désinfection et le respect des règles",
        "description": "Mettez en place la stérilisation des outils entre chaque personne et suivez les règles locales pour proposer des coupes au public. La propreté protège tout le monde.",
        "hours": 1.5,
        "skills": [
          "démarches"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Animez les journées coiffure",
        "description": "Accueillez l'événement, gardez une ambiance chaleureuse et respectueuse, et traitez chaque personne comme une invitée de valeur, pas comme une bénéficiaire de charité.",
        "hours": 2.5,
        "skills": [
          "organisation"
        ],
        "follows": [
          2,
          3
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "mutual-aid-moving-crew",
    "name": "Équipe de déménagement d'entraide",
    "purpose": "Aider à déménager les personnes qui ne peuvent pas payer de déménageurs — celles qui quittent une situation dangereuse, risquent l'expulsion ou réduisent leur logement.",
    "whoItServes": "Les voisines et voisins à faibles revenus, les personnes qui fuient un foyer dangereux, les personnes âgées et les voisines et voisins handicapés.",
    "whatYoullNeed": "Des bénévoles avec véhicules et de bons bras, du matériel de déménagement et des pratiques de sécurité claires. Pour toute personne qui quitte une situation dangereuse, gardez la nouvelle adresse, les dates et les détails strictement confidentiels, et suivez ses décisions sur le calendrier et sa sécurité.",
    "setupHours": 14,
    "defaultCategory": "transport",
    "suggestsWorkDays": true,
    "firstSteps": "Avant de recruter le moindre camion, parle avec les personnes qui reçoivent déjà ces appels — associations d'aide aux victimes de violences conjugales, organisations de locataires, services pour personnes âgées — de la façon dont les demandes devraient t'arriver et de la confidentialité qu'elles attendront, car certains déménagements sont ceux de quelqu'un qui quitte un foyer dangereux. Puis réunis trois ou quatre bénévoles solides et un véhicule, et évaluez ensemble un premier petit déménagement.",
    "commonPitfalls": "Les équipes se blessent ou s'épuisent vite : un chantier trop ambitieux avec trop peu de mains, quelqu'un qui soulève mal, une adresse partagée dans une conversation de groupe qui n'aurait jamais dû quitter le téléphone de la personne qui coordonne. Reste dans les limites que vous avez fixées, et traite les détails de chaque déménagement sensible comme s'ils pouvaient mettre quelqu'un en danger — parce qu'ils le peuvent.",
    "pairsWith": [
      "tenant-union",
      "free-store"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Recrutez une équipe et des véhicules",
        "description": "Réunissez des bénévoles capables de soulever et porter en sécurité, plus l'accès à des camionnettes ou des fourgons. Tenez une liste avec les disponibilités pour monter une équipe rapidement.",
        "hours": 2.5,
        "skills": [
          "prise de contact",
          "conduite"
        ]
      },
      {
        "name": "Rassemblez du matériel de déménagement",
        "description": "Récupérez diables, sangles à meubles, couvertures de déménagement et cartons réutilisables par des dons. Le matériel partagé rend les déménagements plus rapides et plus sûrs.",
        "hours": 1.5,
        "skills": [
          "conduite"
        ]
      },
      {
        "name": "Montez un système de demande et d'évaluation",
        "description": "Créez une façon de demander de l'aide et d'évaluer chaque déménagement : quel volume, escaliers ou ascenseur, distance et calendrier. Ça permet de prévoir la taille de l'équipe et le matériel.",
        "hours": 2,
        "skills": [
          "organisation"
        ]
      },
      {
        "name": "Réglez sécurité et responsabilité",
        "description": "Formez les bénévoles au levage sûr, utilisez des décharges simples et vérifiez l'assurance de chaque véhicule utilisé. Protéger bénévoles et personnes aidées, ça compte.",
        "hours": 2,
        "skills": [
          "démarches"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Organisez calendrier et coordination",
        "description": "Associez les demandes aux équipes disponibles et confirmez avec tout le monde la veille. Gardez une liste de secours, car un déménagement se reporte difficilement.",
        "hours": 1.5,
        "skills": [
          "organisation"
        ],
        "follows": [
          0,
          2
        ]
      },
      {
        "name": "Définissez le périmètre et les limites",
        "description": "Décidez ce que vous prenez et ce que vous ne prenez pas (pas de produits dangereux, de pianos ni de chantiers au-delà des capacités sûres de l'équipe). Orientez ces cas ailleurs.",
        "hours": 1,
        "skills": [
          "écriture"
        ]
      },
      {
        "name": "Réalisez les déménagements et prenez des nouvelles",
        "description": "Menez le déménagement avec sécurité et respect, puis assurez-vous que la personne est bien installée. Reliez-la à d'autres projets (boutique gratuite, comité d'accueil) selon les besoins.",
        "hours": 3.5,
        "skills": [
          "conduite"
        ],
        "follows": [
          1,
          3,
          4
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "disability-support-network",
    "name": "Réseau d'entraide handicap et accessibilité",
    "purpose": "Organiser voisines et voisins handicapés et leurs alliés pour l'entraide, l'accessibilité et la défense des droits — sous la direction des personnes handicapées elles-mêmes.",
    "whoItServes": "Les voisines et voisins handicapés ou atteints de maladies chroniques.",
    "whatYoullNeed": "Un système de communication accessible, des pairs pour animer et un répertoire de ressources. L'entraide entre pairs complète les soins professionnels — orientez les questions médicales, d'aide à la personne et juridiques vers des pros qualifiés, et traitez les informations de santé des membres comme privées.",
    "setupHours": 24,
    "defaultCategory": "organizing",
    "firstSteps": "Ce réseau ne fonctionne que si les voisines et voisins handicapés sont à la table dès la toute première conversation — pas consultés après coup, mais en train de décider ce que c'est. Commence par demander à deux ou trois personnes handicapées que tu connais de le cofonder avec toi (ou, si tu vis toi-même avec un handicap, de partager la charge), et laisse leurs besoins d'accès façonner la première rencontre : format, lieu et rythme compris.",
    "commonPitfalls": "L'échec classique : des alliés pleins de bonne volonté qui construisent pour les personnes handicapées un programme que personne n'a demandé, dans des formats inutilisables. Le plus discret : glisser vers un service de soins informel — l'entraide entre pairs ne peut pas remplacer en sécurité les soins médicaux ni l'aide à la personne, alors continue d'orienter ces besoins vers des pros qualifiés et protège les informations de santé comme le privé qu'elles sont.",
    "pairsWith": [
      "neighborhood-care-network",
      "rides-transportation",
      "health-navigation"
    ],
    "learnMore": [
      "lurking-ok"
    ],
    "tasks": [
      {
        "name": "Mettez les personnes handicapées aux commandes",
        "description": "Assurez-vous que les membres handicapés dirigent et façonnent le réseau. « Rien sur nous sans nous » est le principe central — les alliés soutiennent, ils ne dirigent pas.",
        "hours": 3,
        "skills": [
          "animation"
        ]
      },
      {
        "name": "Montez un système de communication accessible",
        "description": "Offrez plusieurs façons de participer (téléphone, message, en ligne, en personne), utilisez un langage clair et vérifiez que les supports fonctionnent avec les lecteurs d'écran et des besoins variés.",
        "hours": 3,
        "skills": [
          "accessibilité",
          "dépannage informatique"
        ]
      },
      {
        "name": "Cartographiez besoins et ressources",
        "description": "Apprenez ce dont les membres ont besoin et recensez les ressources locales : transport accessible, sources de matériel, services et aide aux prestations. Repérez les plus gros manques.",
        "hours": 5,
        "skills": [
          "prise de contact",
          "saisie de données"
        ]
      },
      {
        "name": "Montez un échange d'entraide",
        "description": "Créez une façon pour les membres de donner et recevoir de l'aide — courses, binômes d'appui pour les rendez-vous, prises de nouvelles — ajustée aux capacités et aux besoins.",
        "hours": 3,
        "skills": [
          "organisation"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Créez une réserve de prêt de matériel",
        "description": "Rassemblez et prêtez aides à la mobilité et matériel d'assistance, désinfectés entre deux personnes. Beaucoup d'appareils dorment une fois devenus trop petits ou inutiles.",
        "hours": 4,
        "skills": [
          "prise de contact",
          "organisation"
        ]
      },
      {
        "name": "Proposez appui aux démarches et défense des droits",
        "description": "Aidez les membres à s'y retrouver dans les prestations, les aménagements et les services. Partagez information et accompagnement, et orientez les questions juridiques et médicales vers des pros qualifiés.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "démarches"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Fixez des normes d'accessibilité pour tous les événements du programme",
        "description": "Élaborez une liste de contrôle (accès au lieu, places assises, interprétation, besoins sensoriels, supports) pour que chaque projet de votre programme accueille bien les membres handicapés.",
        "hours": 3,
        "skills": [
          "accessibilité",
          "écriture"
        ]
      }
    ]
  },
  {
    "id": "books-to-prisoners",
    "name": "Livres aux personnes détenues et programme de correspondance",
    "purpose": "Envoyer gratuitement livres et lettres aux personnes détenues pour réduire l'isolement et soutenir l'apprentissage.",
    "whoItServes": "Les personnes détenues et, à travers elles, leurs familles et leurs communautés.",
    "whatYoullNeed": "Des livres donnés, des bénévoles, des timbres et la connaissance des règles de courrier de chaque établissement. Ces règles sont strictes et différentes partout — les colis qui les enfreignent sont refusés, alors suivez-les à la lettre, et que les bénévoles utilisent toujours l'adresse du programme, jamais une adresse personnelle.",
    "setupHours": 21,
    "defaultCategory": "education",
    "suggestsWorkDays": true,
    "firstSteps": "Avant de collecter un seul livre, appelle un groupe établi d'envoi de livres en prison — la plupart partageront volontiers quels établissements ils couvrent, quelles règles font trébucher et où les demandes restent sans réponse. Ensuite, obtiens par écrit la politique de courrier en vigueur du ou des deux établissements par lesquels vous commencerez ; ce que les personnes détenues demandent vraiment devrait façonner ta collection, pas ce que les donateurs vident de leurs étagères.",
    "commonPitfalls": "Ce projet meurt par colis refusés : un livre d'occasion là où seul le neuf est admis, une couverture rigide, une règle d'étiquetage oubliée — des timbres gaspillés et le colis tant attendu de quelqu'un renvoyé. Il peut aussi blesser les bénévoles qui écrivent de chez eux ; chaque lettre part avec l'adresse du programme, sans exception, aussi chaleureuse que devienne la correspondance.",
    "pairsWith": [
      "reentry-support",
      "free-little-library"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Apprenez les règles de courrier des établissements",
        "description": "Chaque prison a des règles strictes et précises — beaucoup exigent des livres neufs envoyés directement par un éditeur ou un vendeur agréé, avec des limites de contenu et de quantité. Renseignez-vous soigneusement, car le courrier hors règles est refusé.",
        "hours": 5,
        "skills": [
          "démarches"
        ]
      },
      {
        "name": "Réunissez des livres et un espace de travail",
        "description": "Collectez des livres donnés (dans les règles des établissements) et installez un coin de tri et d'emballage. Gardez un choix varié : dictionnaires, ouvrages éducatifs, romans et ressources de réinsertion sont souvent les plus demandés.",
        "hours": 4,
        "skills": [
          "prise de contact",
          "conduite"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Montez un système de suivi des demandes",
        "description": "Créez un processus pour recevoir et suivre les demandes des personnes détenues, qui écrivent avec des thèmes ou des titres. Faites correspondre les demandes aux livres disponibles.",
        "hours": 3,
        "skills": [
          "saisie de données",
          "organisation"
        ]
      },
      {
        "name": "Recrutez et formez des bénévoles",
        "description": "Formez les bénévoles à répondre aux demandes, emballer selon les règles de chaque établissement et écrire des mots attentionnés. La précision sur les règles évite les timbres gaspillés et les colis refusés.",
        "hours": 3,
        "skills": [
          "prise de contact",
          "enseignement"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Couvrez les frais d'envoi et la logistique",
        "description": "L'affranchissement est le principal coût récurrent. Collectez des fonds pour lui, utilisez l'envoi le moins cher qui respecte les règles et organisez des journées d'envoi régulières.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "prise de contact"
        ]
      },
      {
        "name": "Organisez un programme de correspondance",
        "description": "Mettez en relation des bénévoles comme correspondantes et correspondants là où c'est souhaité, avec des consignes claires de sécurité et de vie privée (l'adresse du programme, pas les adresses personnelles). Le lien compte autant que les livres.",
        "hours": 3,
        "skills": [
          "écriture"
        ]
      }
    ]
  },
  {
    "id": "community-music",
    "name": "Programme communautaire de musique et d'instruments",
    "purpose": "Prêter des instruments et offrir cours et jams gratuits pour que la musique soit accessible à tout le monde.",
    "whoItServes": "Les enfants et les adultes qui ne peuvent pas se payer instruments ou cours.",
    "whatYoullNeed": "Des instruments donnés, des profs bénévoles, un espace et un système de prêt.",
    "setupHours": 15,
    "defaultCategory": "education",
    "firstSteps": "Commence avec les musiciennes et musiciens déjà autour de toi — la guitariste de l'église du coin, le chef de fanfare à la retraite, les ados qui jouent — et demande-leur ce qu'ils auraient plaisir à enseigner, et quand. Une conversation avec un magasin de musique sur des réparations à prix réduit, une autre avec un lieu qui tolère le bruit, et te voilà presque à ta première jam.",
    "commonPitfalls": "La réserve de prêt se vide sans bruit quand les instruments sortent plus vite qu'ils ne reviennent jouables : prévois du temps de réparation dès le départ et garde une politique de retour indulgente mais réelle. Et veille à ce que les cours ne glissent pas vers les gens déjà à l'aise : l'enfant qui n'a jamais touché un instrument mérite l'accueil le plus chaleureux, pas le créneau le plus court.",
    "pairsWith": [
      "library-of-things",
      "skill-share",
      "youth-mentorship"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Collectez et réparez des instruments",
        "description": "Rassemblez des instruments donnés et faites-les nettoyer, recorder ou réparer pour qu'ils soient jouables. Composez un éventail de types et de niveaux.",
        "hours": 5,
        "skills": [
          "réparation",
          "conduite"
        ]
      },
      {
        "name": "Montez un système de prêt d'instruments",
        "description": "Créez une fiche de sortie qui suit qui a quoi, avec des consignes d'entretien et une politique de retour indulgente. Numérotez et enregistrez chaque instrument.",
        "hours": 2,
        "skills": [
          "saisie de données"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Recrutez des profs bénévoles",
        "description": "Trouvez des musiciennes et musiciens prêts à enseigner patiemment aux débutants. Pas besoin d'être pro — l'enthousiasme et des bases solides mènent loin.",
        "hours": 3,
        "skills": [
          "prise de contact",
          "musique"
        ]
      },
      {
        "name": "Trouvez un espace pour les cours et les jams",
        "description": "Obtenez une salle où le bruit ne gêne pas — un centre communautaire, une école ou une salle paroissiale. Fixez des horaires prévisibles pour les cours et le jeu libre.",
        "hours": 2,
        "skills": [
          "prise de contact"
        ]
      },
      {
        "name": "Programmez cours et jams",
        "description": "Proposez des cours pour débutants et des jams ouvertes à tous les niveaux. Gardez une inscription facile et des horaires variés pour qui travaille ou étudie.",
        "hours": 2,
        "recurringCadence": "session",
        "skills": [
          "organisation"
        ],
        "follows": [
          2,
          3
        ]
      },
      {
        "name": "Posez les attentes d'entretien et de retour",
        "description": "Apprenez aux emprunteuses et emprunteurs l'entretien de base et quoi faire si quelque chose casse. Restez sur la confiance et le soutien, jamais la punition.",
        "hours": 1,
        "skills": [
          "écriture"
        ],
        "follows": [
          1
        ]
      }
    ]
  },
  {
    "id": "school-supply-program",
    "name": "Programme fournitures scolaires et sacs à dos",
    "purpose": "Fournir gratuitement fournitures scolaires et sacs à dos pour que les enfants commencent l'année prêts et confiants.",
    "whoItServes": "Les familles à faibles revenus avec des enfants scolarisés.",
    "whatYoullNeed": "Des dons de fournitures ou des fonds, un lieu de stockage, un point de distribution et des bénévoles.",
    "setupHours": 10,
    "defaultCategory": "mutual_aid_drive",
    "suggestsWorkDays": true,
    "firstSteps": "Ta première conversation, c'est avec une école — une conseillère, un agent de liaison familles ou une coordinatrice de parents qui connaît les vraies listes de fournitures et sait quelles familles s'en passent sans rien dire. Laisse-les définir ce que tu collectes et comment les familles l'apprennent ; une distribution qui passe par des gens en qui les parents ont déjà confiance atteint des enfants qu'un prospectus n'atteindra jamais.",
    "commonPitfalls": "L'échec prévisible : une montagne de chemises données et aucun des cahiers que les listes demandent vraiment — collecter ce qui est facile à donner plutôt que ce qu'il faut. Celui qui blesse : une distribution qui ressemble à un contrôle de ressources ; saute la paperasse de revenus, laisse chaque enfant choisir son sac à dos, et personne ne repart en se sentant inspecté.",
    "pairsWith": [
      "youth-mentorship",
      "toy-library"
    ],
    "tasks": [
      {
        "name": "Obtenez les listes de fournitures et mesurez le besoin",
        "description": "Faites équipe avec les écoles du coin pour connaître les vraies listes de fournitures par niveau et estimer combien de familles ont besoin d'aide. Ça garde les dons pertinents.",
        "hours": 1.5,
        "skills": [
          "prise de contact"
        ]
      },
      {
        "name": "Lancez des collectes et achetez en gros",
        "description": "Combinez collectes de dons et achats en gros pour les articles les plus demandés. Acheter en gros étire l'argent au maximum sur les basiques comme cahiers et crayons.",
        "hours": 3,
        "recurringCadence": "cycle",
        "skills": [
          "prise de contact",
          "conduite"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Triez et assemblez par niveau",
        "description": "Organisez les fournitures et remplissez les sacs à dos selon la liste de chaque niveau. Une séance d'emballage à la chaîne avec des bénévoles avance vite.",
        "hours": 2,
        "skills": [
          "organisation"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Installez le stockage et un point de distribution",
        "description": "Trouvez un stockage au sec et un endroit accueillant pour remettre les sacs, souvent une école, un centre communautaire ou en marge d'un autre événement de rentrée.",
        "hours": 1.5,
        "skills": [
          "prise de contact"
        ]
      },
      {
        "name": "Programmez et animez la distribution",
        "description": "Tenez la distribution avant la rentrée, avec des bénévoles accueillants. Laissez les enfants choisir leur sac quand c'est possible — le choix ajoute de la dignité.",
        "hours": 2,
        "skills": [
          "organisation"
        ],
        "follows": [
          2,
          3
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "legal-aid-clinic",
    "name": "Permanence juridique et programme Connais tes droits",
    "purpose": "Relier le voisinage à de l'aide juridique gratuite et apprendre aux gens leurs droits.",
    "whoItServes": "Toute personne qui fait face à un problème juridique sans moyens — logement, immigration, dettes, famille ou prestations sociales.",
    "whatYoullNeed": "Des avocats et avocates bénévoles et des étudiants en droit, un lieu, des organisations d'aide juridique partenaires et un planning. Les conseils juridiques individuels doivent venir d'avocats qualifiés et inscrits au barreau (ou d'étudiants en droit supervisés) — ce programme organise l'accès et partage de l'information générale sur les droits, il n'est pas lui-même une source de conseil juridique.",
    "setupHours": 26,
    "defaultCategory": "other",
    "suggestsWorkDays": true,
    "firstSteps": "Rien ne démarre ici avant d'avoir des avocats : tes premiers appels vont au bureau d'aide juridique local, au programme pro bono du barreau et à une clinique de faculté de droit, pour demander ce qu'il leur faudrait pour venir — et où sont les manques qu'une permanence de quartier pourrait vraiment combler. Laisse ces partenaires définir avec toi le périmètre de la permanence avant d'annoncer quoi que ce soit au voisinage.",
    "commonPitfalls": "L'échec dangereux, c'est une personne bénévole pleine de bonne volonté qui glisse de l'information au conseil — un « signe-le, c'est tout » bien intentionné peut ruiner le dossier de quelqu'un, alors garde cette ligne claire et répétée. L'échec plus lent, c'est un accueil qui déborde les avocats : une liste d'attente de gens désespérés sans avocat dans la salle brise la confiance plus vite que de ne jamais ouvrir.",
    "pairsWith": [
      "tenant-union",
      "court-support",
      "newcomer-translation-network"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "S'associer à des avocats et à l'aide juridique",
        "description": "Recrute des avocats et avocates en exercice, ou des étudiants en droit supervisés par des avocats, pour donner les vrais conseils juridiques. Tisse des liens d'orientation avec des organisations d'aide juridique établies.",
        "hours": 6,
        "skills": [
          "communication"
        ]
      },
      {
        "name": "Définir le périmètre et les parcours d'orientation",
        "description": "Décide quels sujets la permanence peut traiter et fixe des parcours clairs pour orienter les dossiers complexes ou spécialisés. Dis franchement ce que la permanence peut et ne peut pas faire.",
        "hours": 3,
        "skills": [
          "rédaction"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Préparer un lieu et un accueil",
        "description": "Trouve un lieu privé et confidentiel et crée un accueil avec une liste de documents à apporter, pour que les avocats utilisent bien un temps limité.",
        "hours": 3,
        "skills": [
          "organisation"
        ]
      },
      {
        "name": "Mettre en place des rendez-vous confidentiels",
        "description": "Crée des rendez-vous qui protègent la vie privée. Les affaires juridiques sont sensibles, alors protège soigneusement les informations des gens à chaque étape.",
        "hours": 3,
        "skills": [
          "organisation",
          "saisie de données"
        ]
      },
      {
        "name": "Créer des supports Connais tes droits et animer des ateliers",
        "description": "Crée des guides clairs et exacts et anime des ateliers sur les droits courants (locataires, travail, immigration, rencontres avec les autorités). Présente-les comme de l'information générale, pas comme des conseils juridiques individuels.",
        "hours": 5,
        "recurringCadence": "event",
        "skills": [
          "rédaction",
          "enseignement"
        ]
      },
      {
        "name": "Faire connaître et planifier les permanences",
        "description": "Fixe des dates récurrentes de permanence et fais passer le mot par les organisations partenaires et le programme d'entraide au sens large. Propose de l'interprétation pour les personnes qui parlent d'autres langues.",
        "hours": 3,
        "skills": [
          "communication",
          "traduction"
        ],
        "follows": [
          0,
          3
        ]
      },
      {
        "name": "Protéger la confidentialité et vérifier les conflits d'intérêts",
        "description": "Établis une confidentialité stricte et une vérification de base des conflits d'intérêts, pour que la même personne bénévole ne conseille jamais deux parties opposées. Forme tout le monde à ces obligations.",
        "hours": 3,
        "skills": [
          "paperasse"
        ]
      }
    ]
  },
  {
    "id": "resource-hub-dispatch",
    "name": "Pôle de ressources d'entraide et centrale de coordination",
    "purpose": "Servir de colonne vertébrale à la coordination — un point unique où besoins et offres se rencontrent à travers tous les projets de ton programme.",
    "whoItServes": "Tout le monde dans le programme — les membres qui cherchent de l'aide, les bénévoles qui en offrent et les personnes qui mènent des projets et ont besoin de coordination.",
    "whatYoullNeed": "Un accueil des demandes, une liste des bénévoles et des ressources, des personnes coordinatrices et un répertoire central. Le pôle détient des informations sensibles sur la vie des gens du quartier — collecte seulement le nécessaire, protège-le avec soin et ne partage les détails qu'avec les personnes qui en ont besoin pour aider.",
    "setupHours": 27,
    "defaultCategory": "organizing",
    "firstSteps": "Le pôle coordonne des projets, alors commence par t'asseoir avec la personne qui mène chacun : quelles demandes reçoit-elle, que voudrait-elle pouvoir déléguer, et comment veut-elle recevoir les mises en relation. Accordez-vous ensemble sur un accueil commun des demandes et un socle de confidentialité — un pôle imposé aux projets se fait contourner ; construit avec eux, il devient la porte d'entrée.",
    "commonPitfalls": "Les pôles meurent de deux façons : l'accueil se remplit de demandes que personne ne suit jusqu'au bout, et le bruit court qu'appeler ne sert à rien ; ou une personne coordinatrice héroïque tient tous les fils jusqu'à s'épuiser, et le programme perd sa mémoire. Suis chaque demande jusqu'à une vraie clôture, fais tourner les créneaux tôt et collecte moins d'informations que tu ne crois en avoir besoin.",
    "pairsWith": [
      "emergency-preparedness",
      "rides-transportation",
      "solidarity-fund"
    ],
    "learnMore": [
      "post-something",
      "claim-post"
    ],
    "tasks": [
      {
        "name": "Mettre en place un accueil unique des besoins et des offres",
        "description": "Crée une porte d'entrée facile — une ligne téléphonique, un formulaire et une option en personne — où chaque personne peut dire ce dont elle a besoin ou ce qu'elle peut donner. Un point d'entrée unique évite que des gens passent entre les mailles.",
        "hours": 4,
        "skills": [
          "organisation",
          "dépannage informatique"
        ]
      },
      {
        "name": "Construire une liste des bénévoles et des ressources",
        "description": "Tiens à jour une liste des bénévoles (savoir-faire, disponibilités, secteur) et de ce que chaque projet peut offrir, pour que les demandes trouvent preneur vite.",
        "hours": 4,
        "skills": [
          "saisie de données"
        ]
      },
      {
        "name": "Créer un processus de mise en relation et d'aiguillage",
        "description": "Définis comment une demande est aiguillée vers le bon projet ou la bonne personne bénévole, et en combien de temps. Fixe des objectifs de délai de réponse et la façon de suivre les demandes jusqu'au bout.",
        "hours": 4,
        "skills": [
          "organisation"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Tenir un répertoire central des ressources",
        "description": "Garde un répertoire vivant de tous vos projets plus les services extérieurs (hébergements d'urgence, dispensaires, alimentation, aide juridique) pour que le pôle puisse orienter les gens partout où l'aide existe.",
        "hours": 5,
        "recurringCadence": "month",
        "skills": [
          "saisie de données"
        ]
      },
      {
        "name": "Recruter et former des personnes coordinatrices",
        "description": "Monte une équipe pour tenir des créneaux d'aiguillage tournants, pour que le pôle reste réactif sans épuiser personne. Forme-la au processus et au répertoire.",
        "hours": 3,
        "skills": [
          "communication",
          "enseignement"
        ],
        "follows": [
          2,
          3
        ]
      },
      {
        "name": "Fixer des pratiques de confidentialité et de suivi",
        "description": "Décide quelles informations tu collectes, comment elles sont stockées et protégées, et comment tu confirmes qu'un besoin a vraiment été couvert. Collecte le minimum et protège-le avec soin.",
        "hours": 4,
        "skills": [
          "rédaction"
        ]
      },
      {
        "name": "Suivre les besoins non couverts et les manques",
        "description": "Note les demandes que vous n'avez pas pu couvrir. Les manques récurrents montrent où le programme devrait lancer son prochain projet — le pôle devient un outil de planification, pas seulement un standard téléphonique.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "saisie de données"
        ]
      }
    ]
  },
  {
    "id": "harm-reduction-supplies",
    "name": "Distribution de matériel de réduction des risques",
    "purpose": "Mettre la naloxone, les bandelettes de test et le matériel de consommation à moindre risque dans les mains des personnes qui pourraient en avoir besoin — en allant vers le voisinage là où il est, sans jugement.",
    "whoItServes": "Les personnes qui consomment des drogues, leurs proches, et toute personne susceptible d'assister à une overdose — c'est-à-dire, dans la plupart des quartiers, tout le monde.",
    "whatYoullNeed": "Une formation à la réponse aux overdoses, une source de naloxone (programme public, pharmacie ou organisation partenaire), du matériel pour les kits et une petite équipe de distribution. Distribuer du matériel n'est pas un soin médical — chaque personne qui distribue doit d'abord suivre une formation à la réponse aux overdoses, et la loi sur ce que tu peux transporter (bandelettes, seringues) varie beaucoup selon les endroits, alors vérifie la tienne avant de stocker quoi que ce soit. Garde les numéros locaux de crise et de soin imprimés dans chaque kit.",
    "setupHours": 20,
    "defaultCategory": "other",
    "suggestsWorkDays": true,
    "firstSteps": "N'achète encore rien : ton premier pas est une conversation avec le programme de réduction des risques établi le plus proche et avec les personnes qui utilisent vraiment ce matériel — elles te diront ce qui manque, ce qui est déjà couvert et comment arriver sans jugement. Fais suivre à ton équipe de base la formation à la réponse aux overdoses et vérifie la loi locale sur les bandelettes et les seringues avant d'emballer un seul kit.",
    "commonPitfalls": "Ça tourne mal quand vous débarquez en étrangers — distribuer là où vous n'avez aucune relation, ou ajouter sermons et conditions qui apprennent aux gens à vous éviter — et quand vous devancez la loi ou votre formation, ce qui peut coûter à une personne bénévole une accusation de détention de matériel. Ici, lentement et accompagnés bat vite et seuls, à chaque fois.",
    "pairsWith": [
      "community-first-aid-training",
      "mental-health-peer-support"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Se former et trouver un partenaire de réduction des risques",
        "description": "Fais suivre à ton équipe de base une formation à la réponse aux overdoses et à la naloxone — beaucoup de services de santé et d'associations de réduction des risques en proposent gratuitement. Associe-toi à un programme établi ; il a déjà résolu des problèmes d'approvisionnement, de droit et de confiance que vous n'avez pas besoin de résoudre à nouveau.",
        "hours": 4,
        "skills": [
          "communication"
        ]
      },
      {
        "name": "Vérifier la loi locale sur le matériel",
        "description": "L'accès à la naloxone est protégé presque partout, mais les bandelettes de test et les seringues sont encore classées comme matériel illicite à certains endroits. Renseigne-toi précisément sur ce que tu peux légalement transporter et distribuer — ton organisation partenaire ou une permanence juridique te le dira vite. Mets-le par écrit pour les bénévoles.",
        "hours": 3,
        "skills": [
          "recherche"
        ]
      },
      {
        "name": "Trouver la naloxone et le matériel des kits",
        "description": "Commande la naloxone via un programme public de distribution, une ordonnance permanente en pharmacie ou ton organisation partenaire. Ajoute tout ce qui est légal chez toi : bandelettes de test du fentanyl et de la xylazine, soin des plaies, produits d'hygiène.",
        "hours": 4,
        "follows": [
          1
        ]
      },
      {
        "name": "Assembler des kits avec des notices en langage simple",
        "description": "Prépare des kits avec des instructions simples et multilingues : reconnaître une overdose, donner la naloxone, appeler les secours, ne jamais consommer seul. Glisse les numéros locaux de crise et de soin dans chaque kit. L'assemblage va vite avec une table pleine de monde.",
        "hours": 3,
        "skills": [
          "traduction"
        ],
        "follows": [
          2
        ],
        "recurringCadence": "cycle"
      },
      {
        "name": "Organiser des tournées de distribution et des points fixes",
        "description": "Prévois des tournées régulières à pied ou en voiture par les endroits où les gens sont vraiment, et demande à des bars, épiceries, bibliothèques et salles de garder une boîte sans questions. La barrière basse est tout l'intérêt — pas de formulaire, pas de sermon.",
        "hours": 4,
        "skills": [
          "communication",
          "conduite"
        ]
      },
      {
        "name": "Réapprovisionner, suivre et garder la formation fraîche",
        "description": "Note ce qui part et ce qui reste, consigne les dates de péremption de la naloxone et organise des rappels de formation quand de nouvelles personnes bénévoles arrivent. Si un kit inverse une overdose, ça vaut la peine de le noter (avec délicatesse).",
        "hours": 2,
        "recurringCadence": "month"
      }
    ]
  },
  {
    "id": "court-support",
    "name": "Soutien et accompagnement au tribunal",
    "purpose": "Faire en sorte que personne du voisinage n'affronte seul une date d'audience — de la compagnie dans la salle, un trajet pour y aller, la garde des enfants pendant l'audience et des lettres de soutien quand la défense en demande.",
    "whoItServes": "Les gens du quartier convoqués au pénal, en immigration, en expulsion ou aux affaires familiales, et leurs familles — aller seul au tribunal peut coûter un emploi, une garde d'enfants et l'espoir.",
    "whatYoullNeed": "Des bénévoles fiables, un calendrier des audiences et des liens avec les avocats commis d'office. Le soutien au tribunal, c'est de la présence et de la logistique, pas du conseil juridique — les bénévoles ne se prononcent jamais sur un dossier et suivent toujours l'avocat de la personne elle-même. Les salles d'audience ont des règles de conduite strictes, alors chaque personne présente doit les connaître sur le bout des doigts.",
    "setupHours": 16,
    "defaultCategory": "other",
    "firstSteps": "Commence par les personnes à qui appartiennent ces dates : le soutien n'existe que sur l'invitation de la personne convoquée, et en accord avec son avocat. Présentez-vous d'abord au bureau des avocats commis d'office et aux groupes d'observation d'audiences ou de caisses de caution déjà présents au tribunal, et laissez-les vous dire quelles audiences ont besoin de compagnie et comment être utiles sans jamais toucher au juridique.",
    "commonPitfalls": "Le mal vient ici de l'improvisation en solo : une personne bénévole qui « explique » un accord dans le couloir, des détails du dossier discutés là où le parquet peut entendre, une réaction visible du public qui agace la juge — chacun peut nuire à la personne même pour qui vous êtes venus. L'échec plus discret, c'est la logistique : une date non confirmée ou un trajet qui tombe à l'eau peut vouloir dire une audience manquée et un mandat d'arrêt.",
    "pairsWith": [
      "legal-aid-clinic",
      "reentry-support",
      "rides-transportation"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Se relier aux défenseurs et aux groupes déjà présents",
        "description": "Présentez-vous au bureau des avocats commis d'office, à l'aide juridique en immigration et aux groupes d'observation d'audiences ou de caisses de caution déjà à l'œuvre. Ils vous diront où le soutien manque le plus et comment vous joindre sans gêner.",
        "hours": 3,
        "skills": [
          "communication"
        ]
      },
      {
        "name": "Écrire les règles de base : du soutien, pas du droit",
        "description": "Mets-le par écrit : les bénévoles ne donnent jamais de conseil juridique, ne parlent jamais des détails d'un dossier dans les espaces publics du tribunal et s'en remettent toujours à l'avocat de la personne. Ajoute la conduite en salle — arriver tôt, s'habiller sobrement, téléphones éteints, aucune réaction depuis le public.",
        "hours": 2,
        "skills": [
          "rédaction"
        ]
      },
      {
        "name": "Monter un accueil des demandes et un calendrier des audiences",
        "description": "Crée un moyen simple de demander du soutien et un calendrier partagé des dates, des salles et de ce dont chaque personne a besoin — de la compagnie, un trajet, la garde des enfants, ou les trois. Les dates d'audience bougent sans arrêt, alors confirme la veille.",
        "hours": 3,
        "skills": [
          "organisation"
        ]
      },
      {
        "name": "Former les bénévoles d'accompagnement",
        "description": "Fais-leur vivre une visite du tribunal : la sécurité, trouver la salle, où s'asseoir, et comment être simplement une présence calme et chaleureuse pendant une attente stressante. Associe chaque nouvelle personne bénévole à une expérimentée pour sa première date.",
        "hours": 3,
        "skills": [
          "enseignement"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Coordonner trajets et garde d'enfants pour les audiences",
        "description": "Prévois des conducteurs pour les matins d'audience et des binômes de garde qui peuvent veiller sur les enfants pendant les audiences — beaucoup de salles n'admettent pas les enfants, et une audience manquée faute de garde peut vouloir dire un mandat d'arrêt.",
        "hours": 3,
        "skills": [
          "conduite",
          "garde d'enfants"
        ],
        "recurringCadence": "event"
      },
      {
        "name": "Organiser les lettres de soutien quand la défense en demande",
        "description": "Quand l'avocat de quelqu'un demande des lettres de moralité ou de soutien de la communauté, coordonne le voisinage pour les écrire — en suivant à la lettre les consignes de la défense sur le contenu, le ton et le délai.",
        "hours": 2,
        "skills": [
          "rédaction"
        ]
      }
    ]
  },
  {
    "id": "cooling-warming-center",
    "name": "Centre éphémère de fraîcheur et de chaleur",
    "purpose": "Ouvrir un refuge climatique de quartier — une salle fraîche en canicule, une salle chaude en grand froid — prêt avant que la météo devienne dangereuse, pas après.",
    "whoItServes": "Les personnes âgées, les voisines et voisins sans toit, les gens sans clim ou chauffage qui marche, celles et ceux qui travaillent dehors, et toute personne dont le logement ne suit pas la météo.",
    "whatYoullNeed": "Un lieu d'accueil climatisé et chauffé avec des toilettes, du matériel et des personnes hôtes formées, par créneaux. Les hôtes sont des voisins, pas des soignants — forme tout le monde à repérer l'épuisement par la chaleur et l'hypothermie et à appeler les secours tôt plutôt que tard, et règle la question de l'assurance et de la responsabilité du lieu avant la première activation, pas pendant.",
    "setupHours": 21,
    "defaultCategory": "other",
    "suggestsWorkDays": true,
    "firstSteps": "Le lieu d'accueil est la relation sur laquelle tout repose, alors commence là : assieds-toi avec la bibliothécaire, le pasteur ou la personne qui gère la salle et traversez ensemble les questions inconfortables — horaires, clés, assurance, que se passe-t-il si quelqu'un doit rester la nuit — avant que la première prévision météo ne les impose. En parallèle, demande aux équipes de maraude et au personnel des résidences pour personnes âgées qui a vraiment besoin du refuge, pour que l'emplacement et les horaires collent aux gens à qui il est destiné.",
    "commonPitfalls": "Ce projet échoue dans l'écart entre le plan et la météo : un seuil que personne n'a vraiment acté, et le centre ouvre un jour trop tard, ou une question de responsabilité restée floue jusqu'à ce que quelqu'un s'effondre et que le lieu se retire pour de bon. Mettez le seuil d'activation par écrit, faites une ouverture d'entraînement avant la saison et assure-toi que chaque hôte sait appeler les secours tôt, pas en dernier.",
    "pairsWith": [
      "emergency-preparedness",
      "community-wood-bank",
      "laundry-shower-access"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Trouver un lieu d'accueil climatisé et chauffé",
        "description": "Demande aux bibliothèques, lieux de culte, salles syndicales et centres sociaux une salle avec clim et chauffage fiables, des toilettes et un accès sans marches. Obtiens un accord écrit couvrant les horaires, qui garde les clés et ce qui se passe s'il faut ouvrir la nuit.",
        "hours": 4,
        "skills": [
          "communication"
        ]
      },
      {
        "name": "Fixer les seuils d'activation et un plan d'alerte",
        "description": "Décidez à l'avance ce qui ouvre exactement le centre — une température prévue, un indice de chaleur, une température ressentie — pour que personne n'ait à trancher à minuit. Monte une chaîne téléphonique ou un groupe de discussion qui met les hôtes en alerte un jour à l'avance.",
        "hours": 2
      },
      {
        "name": "Constituer les stocks",
        "description": "Rassemble eau, sachets d'électrolytes, couvertures, lits de camp pliants ou chaises confortables, ventilateurs, chargeurs de téléphone et une trousse de premiers secours. Stocke tout sur place dans des bacs étiquetés pour que n'importe quel hôte trouve les choses.",
        "hours": 3,
        "skills": [
          "conduite"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Recruter et former les hôtes de créneau",
        "description": "Trouve assez de bénévoles pour en avoir deux par créneau et forme-les : accueillir les gens sans paperasse, repérer l'épuisement par la chaleur et l'hypothermie, quand appeler les secours, et les bases de la désescalade. La chaleur au sens humain compte autant que le thermostat.",
        "hours": 4,
        "skills": [
          "enseignement"
        ]
      },
      {
        "name": "Monter la rotation des créneaux",
        "description": "Prépare un planning de créneaux que tu peux déclencher avec un jour de préavis — ouverture, fermeture et couverture de nuit si vous l'offrez. Garde une liste de réserve, car les canicules fauchent aussi les bénévoles.",
        "hours": 2,
        "skills": [
          "organisation"
        ],
        "follows": [
          3
        ],
        "recurringCadence": "event"
      },
      {
        "name": "Faire passer le mot avant la saison",
        "description": "Prépare des tracts multilingues avec les seuils et l'adresse, et porte-les aux dispensaires, résidences pour personnes âgées, équipes de maraude et épiceries avant la première canicule ou vague de froid — pas pendant.",
        "hours": 3,
        "skills": [
          "graphisme",
          "traduction"
        ]
      },
      {
        "name": "Ouvrir, accueillir et remettre en état à chaque activation",
        "description": "Fais tourner le centre pendant toute la durée de l'épisode météo : compte les gens sans formalités (un décompte, pas de pièces d'identité), garde le matériel qui circule et va voir toute personne qui dort. Ensuite, nettoie, réapprovisionne et note ce qui a manqué.",
        "hours": 3,
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "community-oral-history",
    "name": "Histoire orale de la communauté",
    "purpose": "Enregistrer les histoires des aînés et du voisinage avant qu'elles se perdent — et laisser celles et ceux qui les racontent aux commandes de ce qu'elles deviennent.",
    "whoItServes": "Les personnes âgées avec des histoires que personne n'a demandé à entendre, les habitants de longue date qui voient le quartier changer et chaque voisine et voisin qui viendra après.",
    "whatYoullNeed": "Un téléphone ou un enregistreur simple, un coin tranquille, des formulaires de consentement et un endroit sûr pour garder les fichiers. Les enregistrements sont des données personnelles — chaque personne participante est propriétaire de son histoire, décide où elle se partage et peut changer d'avis plus tard. Rien ne devient public sans son accord écrit.",
    "setupHours": 10,
    "defaultCategory": "education",
    "firstSteps": "Commence avec une personne âgée qui te fait confiance et demande-lui si elle partagerait une histoire — ce premier enregistrement t'apprend plus que n'importe quel plan, et sa parole se porte garante de toi auprès de la prochaine personne. Avant d'appuyer sur enregistrer avec qui que ce soit, parcourez ensemble le formulaire de consentement et demande-lui ce qu'elle voudrait qu'il advienne de l'enregistrement ; cette conversation, c'est le projet.",
    "commonPitfalls": "La façon dont ça blesse quelqu'un, c'est une histoire qui voyage plus loin que ce que la personne a accepté — un extrait publié, un nom attaché, un détail qui n'était que pour toi. La façon dont ça meurt en silence, ce sont des enregistrements qui s'empilent sans étiquette sur le téléphone d'une seule personne jusqu'à ce qu'un appareil perdu efface des années de voix ; étiquette et sauvegarde chaque séance la semaine même.",
    "pairsWith": [
      "neighborhood-care-network",
      "digital-literacy"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Écrire un formulaire de consentement en langage simple",
        "description": "Une page, sans jargon juridique : ce qui est enregistré, où ça pourrait être partagé, et le droit de la personne de faire une pause, de sauter des questions ou de retirer l'enregistrement plus tard. Traduis-le dans les langues que les personnes qui racontent parlent vraiment.",
        "hours": 2,
        "skills": [
          "rédaction",
          "traduction"
        ]
      },
      {
        "name": "Réunir le matériel et une liste de questions",
        "description": "Un téléphone avec une appli dictaphone suffit largement ; ajoute un petit micro-cravate si tu peux. Rédige des questions ouvertes qui appellent des histoires — « raconte-moi la rue quand tu es arrivée » — et entraînez-vous une fois entre vous.",
        "hours": 2
      },
      {
        "name": "Enregistrer les séances d'histoires",
        "description": "Assieds-toi avec une seule personne à la fois, dans un endroit calme et confortable. Parcourez d'abord ensemble le formulaire de consentement, puis écoute surtout — les meilleurs entretiens sont ceux où tu parles le moins.",
        "hours": 4,
        "skills": [
          "écoute"
        ],
        "follows": [
          0,
          1
        ],
        "recurringCadence": "session"
      },
      {
        "name": "Archiver et rendre, à leurs conditions",
        "description": "Étiquette chaque enregistrement avec la date, les noms et ce qui a été convenu sur le partage. Garde deux copies en lieu sûr, remets à chaque personne sa propre copie, et ne partage publiquement que les extraits que chacune a approuvés.",
        "hours": 2,
        "follows": [
          2
        ]
      }
    ]
  },
  {
    "id": "community-solar-coop",
    "name": "Coopérative communautaire d'énergie solaire",
    "purpose": "Mettre en commun les ressources du voisinage dans une énergie renouvelable partagée qui allège les factures de tout le monde — surtout pour les locataires et les foyers qui ne pourraient jamais poser des panneaux sur un toit à eux.",
    "whoItServes": "Les locataires, les foyers à faibles revenus et toute personne privée de solaire en toiture par son toit, son propriétaire ou son budget.",
    "whatYoullNeed": "Des membres engagés, un savoir-faire technique et financier à emprunter ou à apprendre, un site d'accueil ou un programme de solaire partagé existant à rejoindre, et des organisations partenaires. Une chose dite sans détour : les coopératives d'énergie comportent une vraie complexité financière et juridique — faites-vous conseiller par des professionnels qualifiés sur la structure, le financement et les contrats avant que quiconque signe quoi que ce soit.",
    "setupHours": 27,
    "defaultCategory": "infrastructure",
    "firstSteps": "Avant le moindre panneau ou papier, parlez à deux groupes : les voisins qui adhéreraient vraiment, pour mesurer l'engagement réel, et une coopérative solaire de la ville ou de la région d'à côté qui l'a déjà fait — elle te dira quel modèle colle aux règles de ta zone et quelles erreurs lui ont coûté de l'argent. Puis lisez vous-mêmes ces règles locales, parce que ce sont elles, pas votre enthousiasme, qui décident du possible.",
    "commonPitfalls": "Les coopératives solaires meurent dans l'écart entre l'enthousiasme et les signatures : un an de réunions sur un modèle que les règles de ta région n'ont jamais permis, ou un contrat signé sans relecture professionnelle qui enferme les membres dans des clauses que personne n'a comprises. L'autre tueur, c'est l'argent flou — si les membres ne voient pas clairement ce qu'ils mettent et ce qui revient, la confiance s'érode et la coopérative se défait.",
    "pairsWith": [
      "weatherization-brigade",
      "bulk-buying-coop"
    ],
    "tasks": [
      {
        "name": "Réunir des membres et mesurer l'intérêt",
        "description": "Recrute des foyers intéressés par une énergie propre moins chère et découvre à quel point ils sont vraiment engagés — l'enthousiasme vague et un membre inscrit sont deux choses différentes. Vos chiffres déterminent quels modèles sont réalistes, alors compte honnêtement avant de planifier.",
        "hours": 4,
        "skills": [
          "communication"
        ]
      },
      {
        "name": "Apprendre les modèles et les règles locales",
        "description": "Renseigne-toi sur le fonctionnement du solaire partagé là où tu vis : lois, comptage net, programmes d'abonnement, structures coopératives. Les règles varient énormément d'un endroit à l'autre et déterminent ce qui est vraiment possible — fais-le avant de tomber amoureux d'un modèle.",
        "hours": 5,
        "skills": [
          "recherche"
        ]
      },
      {
        "name": "Trouver un site ou un programme à rejoindre",
        "description": "Cherche un toit d'accueil ou un terrain pour une installation partagée, ou vérifie si un programme de solaire partagé existant accepterait votre groupe comme abonnés collectifs — en rejoindre un est souvent bien plus rapide que construire. Pèse les deux chemins avec tes membres avant de t'engager.",
        "hours": 4,
        "skills": [
          "communication"
        ]
      },
      {
        "name": "Régler le financement et la structure juridique",
        "description": "Décidez comment le projet est financé et gouverné, et constituez la coopérative dans les règles. C'est l'étape aux vraies implications juridiques et financières — faites relire la structure et chaque contrat par des professionnels qualifiés, et ne signez pas avant qu'ils l'aient fait.",
        "hours": 5,
        "skills": [
          "paperasse",
          "comptabilité"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "S'associer à des installateurs et fournisseurs",
        "description": "Trouve des installateurs ou fournisseurs sérieux, compare plus d'un devis et confirme par écrit les garanties et l'entretien à long terme. Une pose pas chère sans plan d'entretien devient hors de prix au bout de cinq ans.",
        "hours": 3,
        "skills": [
          "communication"
        ]
      },
      {
        "name": "Monter le système d'adhésion et de crédits sur facture",
        "description": "Définissez exactement comment les économies ou crédits arrivent aux membres et comment fonctionnent l'adhésion et les paiements. Rendez ça transparent et facile à comprendre — un membre devrait pouvoir voir, sur une seule page, ce qu'il met et ce qui revient.",
        "hours": 3,
        "skills": [
          "comptabilité",
          "saisie de données"
        ],
        "follows": [
          3
        ]
      },
      {
        "name": "Former les membres à leur consommation d'énergie",
        "description": "Aide les membres à lire leurs factures et à réduire leur consommation — un kilowatt économisé vaut mieux qu'un kilowatt produit. Accompagne les économies solaires de conseils simples d'efficacité pour que les foyers voient la différence sur le papier.",
        "hours": 3,
        "skills": [
          "enseignement"
        ]
      }
    ]
  },
  {
    "id": "worker-coop-incubator",
    "name": "Incubateur de coopératives de travail et de compétences",
    "purpose": "Aider le voisinage à développer des compétences professionnelles et à lancer des coopératives de travail — des gagne-pain où les personnes qui font le travail possèdent l'atelier et prennent les décisions.",
    "whoItServes": "Les gens du quartier sans emploi ou en sous-emploi, et toute personne qui veut une vraie part là où elle travaille.",
    "whatYoullNeed": "Des mentors avec de l'expérience d'entreprise et de coopérative, un espace et du matériel de formation, des appuis de démarrage vers lesquels orienter les projets, et des partenariats — structures d'accompagnement des coopératives, prêteurs qui connaissent les coops et votre propre programme de partage de savoir-faire.",
    "setupHours": 27,
    "defaultCategory": "education",
    "firstSteps": "Commence par des conversations, pas par un programme de cours : assieds-toi avec les membres intéressés pour parler de ce qu'ils savent faire et veulent construire, et cherche les grappes de savoir-faire qui pourraient vraiment devenir un projet. En parallèle, trouve la structure d'accompagnement des coopératives de ta région ou une coopérative de travail existante prête à jouer les mentors — ses cicatrices sont ton programme, et se constituer sans ce guidage est là où les groupes se font mal.",
    "commonPitfalls": "Ça échoue de deux façons : un programme de formation qui ne lance jamais rien, parce que personne n'a poussé une grappe de savoir-faire vers un vrai projet — ou un lancement qui saute les parties ennuyeuses, se constitue sur un modèle téléchargé et découvre le nœud de gouvernance et d'impôts deux ans plus tard. Ça meurt aussi en silence quand une seule personne organisatrice tient chaque relation avec mentors et financeurs ; partagez ces contacts dès le premier jour.",
    "pairsWith": [
      "skill-share",
      "solidarity-fund",
      "time-bank"
    ],
    "tasks": [
      {
        "name": "Évaluer les savoir-faire et les envies des membres",
        "description": "Assieds-toi avec les membres et apprends ce qu'ils savent faire et ce qu'ils veulent construire. Tu cherches des grappes — trois personnes qui cuisinent, une équipe avec des métiers manuels, cinq qui font le ménage — parce qu'une grappe de savoir-faire est la graine d'une coopérative viable.",
        "hours": 4,
        "skills": [
          "entretiens"
        ]
      },
      {
        "name": "Proposer des formations à l'emploi et aux savoir-faire",
        "description": "Anime des séances sur les CV, les entretiens d'embauche, les métiers, le numérique et les bases de l'argent. Appuie-toi sur votre programme de partage de savoir-faire et fais venir des spécialistes de l'extérieur pour ce que personne ne peut enseigner sur place — le but est d'avoir des membres capables, qu'une coopérative se forme autour d'eux ou non.",
        "hours": 5,
        "skills": [
          "enseignement"
        ]
      },
      {
        "name": "Enseigner le modèle coopératif",
        "description": "Fais découvrir aux membres la propriété par les travailleurs et la gouvernance démocratique : comment les bénéfices se partagent, comment les décisions se prennent et en quoi tout ça diffère d'une entreprise classique. On ne peut pas choisir un modèle qu'on n'a jamais vu — prends des coopératives réelles comme exemples.",
        "hours": 4,
        "skills": [
          "enseignement",
          "animation"
        ]
      },
      {
        "name": "Accompagner la constitution des coopératives",
        "description": "Quand un groupe est prêt, aide-le à écrire un plan d'activité et à choisir une structure juridique. Relie-le à des avocats et comptables qui connaissent les coopératives plutôt que d'improviser les étapes juridiques et comptables — une constitution ratée coûte cher à défaire.",
        "hours": 5,
        "skills": [
          "paperasse"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Relier aux ressources de démarrage",
        "description": "Tiens une liste vivante de microcrédits, subventions, fonds de développement coopératif et incubateurs, et aide les projets à vraiment candidater. La plupart de l'argent des coopératives existe mais est mal fléché — ta carte vaut de l'argent réel.",
        "hours": 3,
        "skills": [
          "recherche"
        ]
      },
      {
        "name": "Offrir du mentorat",
        "description": "Associe chaque nouveau projet à une coopératrice ou un coopérateur d'expérience, ou à un mentor d'entreprise, qui prend des nouvelles pendant les débuts fragiles. La première année est là où les coopératives échouent ; un mentor régulier qui a déjà vu le schéma change les chances.",
        "hours": 3
      },
      {
        "name": "Construire l'entraide entre projets",
        "description": "Réunis les projets en réseau où les coopératives partagent leurs leçons, se renvoient des clients et s'achètent entre elles. Les coopératives qui commercent entre elles survivent à des creux qui tuent les isolées.",
        "hours": 3,
        "skills": [
          "organisation"
        ]
      }
    ]
  },
  {
    "id": "elder-meal-delivery",
    "name": "Compagnie et livraison de repas pour les personnes âgées",
    "purpose": "Apporter des repas réguliers et des visites amicales aux personnes âgées qui ne peuvent plus sortir de chez elles — le repas compte, et les dix minutes de conversation sur le pas de la porte comptent souvent encore plus.",
    "whoItServes": "Les voisines et voisins âgés, isolés, fragiles ou qui ne peuvent plus sortir de chez eux — et les familles qui s'inquiètent pour eux de loin.",
    "whatYoullNeed": "Des bénévoles fiables dont tu as vérifié les antécédents, une source de repas, des tournées planifiées et des consignes de sécurité simples pour le moment où une porte reste fermée.",
    "setupHours": 22,
    "defaultCategory": "food",
    "firstSteps": "Commence par la source de repas et les cinq premières personnes âgées, pas par une feuille d'inscription : parle à l'équipe du repas communautaire ou à deux ou trois cuisiniers volontaires de ce qu'ils peuvent produire de façon fiable, et demande aux travailleuses des services pour personnes âgées, aux infirmières de paroisse et aux pharmaciens qui se retrouve vraiment sans rien. Vérifie tes premiers bénévoles avant la première livraison, pas après — la confiance que tu construis vit ou meurt selon qui franchit ces portes.",
    "commonPitfalls": "L'échec dangereux, c'est un signal manqué — un ou une bénévole qui hausse les épaules devant une porte close parce que personne n'a écrit quoi faire, ou une allergie qui n'a jamais été notée sur la feuille de tournée. L'échec lent, c'est le manque de régularité : les personnes âgées organisent leur journée autour de la visite, et une tournée qui saute des semaines leur apprend à ne pas compter sur toi. Mieux vaut cinq personnes servies chaque semaine sans exception que vingt servies de temps en temps.",
    "pairsWith": [
      "community-meal",
      "neighborhood-care-network",
      "rides-transportation"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Repérer les personnes âgées qui ne sortent plus de chez elles",
        "description": "Trouve-les par les cliniques, les services pour personnes âgées, les groupes religieux et le bouche-à-oreille. Reste respectueux et strictement sur la base du volontariat — tu offres un repas et de la compagnie, tu n'inscris personne à une surveillance.",
        "hours": 3,
        "skills": [
          "aller vers les gens"
        ]
      },
      {
        "name": "Recruter et vérifier les bénévoles",
        "description": "Toute personne qui entre chez une personne âgée est vérifiée : références et contrôles de base, aucune exception pour les amis d'amis. Ensuite, vise la régularité — les personnes âgées vont mieux avec le même visage familier à la porte chaque semaine qu'avec une équipe qui tourne.",
        "hours": 4,
        "skills": [
          "organisation"
        ]
      },
      {
        "name": "Trouver une source de repas",
        "description": "Assure des repas venus d'une cuisine solidaire, de cuisiniers volontaires ou de restaurants qui donnent des portions. Soigne la nutrition et le réchauffage facile, et étiquette chaque contenant avec son contenu — un repas sans étiquette est un pari pour une personne allergique.",
        "hours": 4,
        "skills": [
          "cuisine",
          "hygiène alimentaire"
        ]
      },
      {
        "name": "Planifier les tournées et le calendrier de livraison",
        "description": "Regroupe les personnes âgées en tournées efficaces et fixe un rythme fiable — mêmes jours, à peu près mêmes heures. Prévois quelques minutes de conversation tranquille à chaque arrêt ; pour beaucoup de personnes âgées, c'est ça, la vraie livraison.",
        "hours": 3,
        "skills": [
          "conduite",
          "organisation"
        ],
        "follows": [
          0,
          2
        ]
      },
      {
        "name": "Noter les régimes, allergies et contacts d'urgence",
        "description": "Pour chaque personne, note les besoins alimentaires, les allergies, les médicaments qui comptent autour des repas et les contacts d'urgence. Garde tout ça en sécurité et au strict nécessaire — la personne qui conduit a besoin de l'allergie, pas de tout le dossier médical.",
        "hours": 3,
        "skills": [
          "saisie de données"
        ]
      },
      {
        "name": "Établir un protocole de vérification du bien-être",
        "description": "Écris noir sur blanc ce qu'un ou une bénévole fait quand une personne ne répond pas ou semble mal en point : qui appeler en premier, quand prévenir la famille ou les secours, et comment noter ce qui s'est passé. Décider tout ça à l'avance vaut mieux qu'improviser sur un pas de porte.",
        "hours": 3,
        "skills": [
          "rédaction"
        ],
        "follows": [
          4
        ]
      },
      {
        "name": "Soutenir les bénévoles et recueillir les retours",
        "description": "Prends régulièrement des nouvelles des bénévoles, fais tourner les tournées quand quelqu'un a besoin de souffler, et demande aux personnes âgées elles-mêmes comment le projet pourrait mieux les servir. Elles te diront des choses que les bénévoles ne voient jamais.",
        "hours": 2
      }
    ]
  },
  {
    "id": "disaster-relief-hub",
    "name": "Centre de distribution de secours en cas de catastrophe",
    "purpose": "Monter un centre capable de recevoir, trier et faire circuler du matériel vite quand une catastrophe frappe — parce que les premiers jours après une inondation ou un incendie se gagnent ou se perdent sur la logistique.",
    "whoItServes": "Les habitantes et habitants touchés par les inondations, tempêtes, incendies et autres catastrophes — à commencer par les voisins les moins en mesure de se déplacer ou d'attendre.",
    "whatYoullNeed": "Un lieu convenu à l'avance avec un plan B, des filières d'approvisionnement, une équipe de bénévoles mobilisables et une coordination avec le réseau de préparation aux urgences — presque tout réglé avant la moindre catastrophe, parce qu'après, c'est trop tard.",
    "setupHours": 24,
    "defaultCategory": "organizing",
    "suggestsWorkDays": true,
    "firstSteps": "Le centre existe sur le papier bien avant d'exister sur un parking : commence donc par le réseau de préparation aux urgences — il tient l'arbre de contacts et la carte des risques — et par la question honnête de savoir quel bâtiment te laisserait vraiment entrer à six heures du matin après une inondation. Règle d'abord l'accord pour le lieu et le plan B ; toutes les autres tâches dépendent d'une adresse.",
    "commonPitfalls": "Les centres de secours échouent dans deux directions : le centre qui n'existe que comme un plan que personne n'a répété, et le vrai événement brûle sa première journée en questions qu'un exercice aurait réglées — et le centre qui ouvre ses portes à un déluge de dons qu'il ne peut pas trier, devenu un entrepôt de vêtements inutilisables pendant que les gens ont besoin d'eau. Le mal plus discret, c'est la distribution à conditions : dès que quelqu'un doit prouver qu'il mérite de l'aide, tu as recréé le système que tout ça devait contourner.",
    "pairsWith": [
      "emergency-preparedness",
      "resource-hub-dispatch"
    ],
    "learnMore": [
      "internet-outage"
    ],
    "tasks": [
      {
        "name": "Repérer à l'avance un lieu et un plan B",
        "description": "Trouve un bâtiment ou un terrain qui peut recevoir des livraisons, trier des biens et accueillir une file de distribution — plus un plan B au cas où le premier serait endommagé ou inaccessible. Confirme l'accès et les clés avec les propriétaires maintenant, par temps calme ; un lieu où tu ne peux pas entrer n'est pas un lieu.",
        "hours": 3,
        "skills": [
          "aller vers les gens"
        ]
      },
      {
        "name": "Monter des filières d'approvisionnement",
        "description": "Prévois à l'avance d'où viendraient l'eau, la nourriture, l'hygiène et le matériel de nettoyage — fournisseurs, organisations partenaires, collectes. Tout aussi important : un moyen de savoir ce dont les gens ont vraiment besoin après un événement, pour ne pas être enseveli sous les mauvaises choses.",
        "hours": 4,
        "skills": [
          "aller vers les gens",
          "organisation"
        ]
      },
      {
        "name": "Organiser la réception, le tri et l'inventaire",
        "description": "Conçois la façon dont les dons sont reçus, triés et suivis dès qu'un camion arrive. Tous les centres qui se sont noyés sous des biens non triés ont sauté cette étape — décide tes catégories, tes étiquettes et tes comptages simples avant d'en avoir besoin.",
        "hours": 4,
        "skills": [
          "organisation",
          "saisie de données"
        ]
      },
      {
        "name": "Créer un système de distribution",
        "description": "Planifie la sortie du matériel : équitable et sans barrières — pas de contrôle d'identité, pas de preuve de besoin — avec une livraison mobile pour qui ne peut pas venir au centre. Sers d'abord les personnes les plus vulnérables, et écris cette priorité pour qu'elle survive au chaos.",
        "hours": 3,
        "skills": [
          "conduite",
          "organisation"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Recruter et former une équipe de bénévoles mobilisables",
        "description": "Constitue une liste de personnes capables de se mobiliser en quelques heures, et forme-les à l'avance à leurs rôles, aux règles de sécurité et à ton système de réception et de distribution. Une équipe formée de douze abat plus de travail qu'une foule bien intentionnée de cinquante.",
        "hours": 4,
        "skills": [
          "enseignement"
        ]
      },
      {
        "name": "Se coordonner avec les autres équipes d'intervention",
        "description": "Présente le centre aux services officiels d'urgence et aux autres groupes de secours avant que quoi que ce soit n'arrive. Convenez de qui couvre quoi, pour combler des manques plutôt que doubler le travail — l'entraide avance le plus vite exactement là où la réponse officielle est la plus lente.",
        "hours": 3,
        "skills": [
          "aller vers les gens"
        ]
      },
      {
        "name": "Planifier la communication et la sécurité",
        "description": "Prépare-toi à la panne des réseaux : moyens de contact hors ligne, listes imprimées, et un lien avec l'arbre de contacts du réseau de préparation. Fixez des règles de sécurité strictes pour les bénévoles — personne n'entre dans une structure dangereuse, jamais — et mettez-les par écrit.",
        "hours": 3,
        "skills": [
          "rédaction"
        ]
      }
    ]
  },
  {
    "id": "recovery-peer-support",
    "name": "Réseau de soutien entre pairs pour le rétablissement et la sobriété",
    "purpose": "Faire vivre un soutien mené par des pairs pour les voisines et voisins en rétablissement d'une consommation de substances, ou qui le cherchent — un complément au suivi professionnel, jamais un remplacement.",
    "whoItServes": "Les personnes en rétablissement, celles qui y réfléchissent, et les familles et amis qui marchent à leurs côtés.",
    "whatYoullNeed": "Des facilitateurs pairs avec un vécu réel et une vraie formation, un lieu sûr et privé, des relais vers les professionnels et des limites dites clairement : le soutien entre pairs complète le suivi professionnel, il ne le remplace pas ; les facilitateurs ne sont pas des soignants et ne doivent jamais conseiller sur le sevrage ni les médicaments ; et il y a toujours un plan clair pour relier toute personne en crise à une aide professionnelle ou d'urgence qualifiée.",
    "setupHours": 22,
    "defaultCategory": "emotional_support",
    "firstSteps": "Commence par les personnes qui tiendront la salle : trouve un ou deux voisins avec un vécu solide de rétablissement, inscris-les à une formation officielle de soutien entre pairs, et écrivez ensemble le périmètre — ce que ce réseau est et n'est pas — avant d'annoncer quoi que ce soit. Ensuite, rencontre en personne les programmes de soins et les services de crise du coin, pour que ton relais soit une relation, pas un numéro de téléphone sur un tract.",
    "commonPitfalls": "Ça devient dangereux quand la ligne se brouille — un facilitateur bien intentionné qui conseille quelqu'un sur le sevrage ou les médicaments, ce qui peut tuer, ou un groupe qui glisse vers le traitement amateur parce que le relais professionnel n'a jamais été réel. Ça échoue en silence par la confidentialité brisée — une seule histoire qui fuite vide la salle pour de bon — et par l'épuisement des facilitateurs, quand la personne qui porte le rétablissement de tout le monde n'a aucun soutien pour le sien.",
    "pairsWith": [
      "mental-health-peer-support",
      "harm-reduction-supplies"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Recruter et former des facilitateurs pairs",
        "description": "Cherche des personnes avec un vécu de rétablissement et fais-leur suivre une formation reconnue de soutien entre pairs. Sois clair dès la première conversation : les facilitateurs sont des pairs, pas des soignants, et la formation est ce qui garde cette ligne sûre.",
        "hours": 5,
        "skills": [
          "animation",
          "enseignement"
        ]
      },
      {
        "name": "Définir le périmètre et les limites",
        "description": "Écris ce que le réseau fait — soutien entre pairs, lien, encouragement — et ce qu'il ne fait pas : traitement, sevrage, soins médicaux, conseils sur les médicaments. Un périmètre écrit protège les membres des mauvais conseils et protège les facilitateurs de porter ce qui ne leur appartient pas.",
        "hours": 3,
        "skills": [
          "rédaction"
        ]
      },
      {
        "name": "Construire les relais vers les soins et la crise",
        "description": "Noue des relations de travail avec les programmes de soins professionnels, les soins médicaux et les services de crise, et écris un plan de réponse aux surdoses. Quand quelqu'un dans la salle a besoin de plus que ce que des pairs peuvent donner, le passage de relais devrait être un appel chaleureux, pas un dépliant.",
        "hours": 4,
        "skills": [
          "aller vers les gens",
          "recherche"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Trouver un lieu sûr, privé et sans substances",
        "description": "Cherche une salle confidentielle, accueillante, sans jugement et sans substances — un endroit où l'on peut être vu entrer sans que ça annonce quoi que ce soit. Les bibliothèques, les salles communes et les lieux de culte avec une entrée séparée marchent bien.",
        "hours": 2,
        "skills": [
          "aller vers les gens"
        ]
      },
      {
        "name": "Poser la confidentialité et les règles du groupe",
        "description": "Convenez des règles de base : ce qui se dit ici reste ici, le respect sans conseils imposés, et le droit de chacun de partager ou de passer son tour. Redites-les à voix haute au début de chaque réunion, sans exception — les règles ne protègent que tant qu'elles sont fraîches.",
        "hours": 3,
        "skills": [
          "animation"
        ]
      },
      {
        "name": "Planifier et faire connaître les réunions",
        "description": "Propose plus d'un horaire de réunion pour que les personnes en horaires décalés et les parents puissent venir, et fais passer le mot avec des mots simples et sans stigmate — gratuit, ouvert, sans conditions. La façon dont tu rédiges le tract décide qui se sent en sécurité de venir.",
        "hours": 3,
        "skills": [
          "aller vers les gens"
        ],
        "follows": [
          3
        ]
      },
      {
        "name": "Soutenir les facilitateurs et prévenir l'épuisement",
        "description": "Prends régulièrement des nouvelles des facilitateurs, faites tourner qui anime, et assure-toi qu'ils ont un soutien à eux — tenir l'espace du rétablissement des autres est un travail lourd, et le propre rétablissement d'un facilitateur passe toujours en premier.",
        "hours": 2,
        "skills": [
          "écoute"
        ]
      }
    ]
  },
  {
    "id": "community-fitness",
    "name": "Groupes de sport et de bien-être de quartier",
    "purpose": "Faire bouger les voisins ensemble, gratuitement — groupes de marche, étirements, matchs improvisés, danse — parce que se sentir bien dans son corps ne devrait pas coûter un abonnement de salle.",
    "whoItServes": "Quiconque a envie de bouger, surtout les voisines et voisins pour qui la salle de sport est hors budget, les personnes âgées et les personnes isolées pour qui la compagnie compte autant que l'exercice.",
    "whatYoullNeed": "Des bénévoles pour guider les activités, des lieux sûrs et accessibles, et très peu de matériel. Un style accueillant et sans pression compte plus que les diplômes — mais quiconque mène une activité physiquement exigeante doit avoir les qualifications pour, et chaque séance a besoin d'eau, d'échauffements et d'une trousse de premiers secours à portée de main.",
    "setupHours": 19,
    "defaultCategory": "other",
    "firstSteps": "Avant de planifier quoi que ce soit, demande aux personnes que tu espères voir venir ce qui leur ferait vraiment plaisir — un groupe de marche, des étirements sur chaise, une soirée danse — et ce qui semble possible pour leur corps ; ce sont les réponses qui doivent choisir tes activités, pas l'inverse. Ensuite, trouve une ou deux personnes guides dont la chaleur pèse plus que l'expertise, parcourez ensemble les lieux candidats, et lance une seule séance hebdomadaire fiable avant d'en ajouter.",
    "commonPitfalls": "Ça meurt de deux façons : ça tourne à la performance — les membres les plus en forme donnent le rythme, la conversation dérive vers le poids et l'apparence, et les personnes pour qui c'est fait arrêtent de venir sans rien dire — ou ça devient irrégulier, parce que rien ne tue un groupe de marche plus vite que d'arriver deux fois devant une séance annulée. Sauter les bases ennuyeuses de la sécurité est la troisième : pas d'échauffement, pas d'eau, pas de trousse de secours, et une mauvaise chute met fin à tout.",
    "pairsWith": [
      "disability-support-network",
      "neighborhood-care-network"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Sonder les envies et les niveaux d'activité",
        "description": "Demande autour de toi — à la laverie, à la résidence pour personnes âgées, à la sortie de l'école — quels types de mouvement les gens aiment et ce qui leur semble accessible. Laisse les réponses guider : un modèle rempli de sports que personne n'a demandés n'aide personne.",
        "hours": 2,
        "skills": [
          "aller vers les gens"
        ]
      },
      {
        "name": "Recruter des personnes guides pour les activités",
        "description": "Trouve des bénévoles pour mener des marches, des étirements, de la danse ou des matchs improvisés. Un style accueillant et sans pression vaut mieux que l'expertise pour la plupart des activités — mais quiconque mène quelque chose de physiquement exigeant doit avoir la qualification qui va avec.",
        "hours": 3,
        "skills": [
          "aller vers les gens"
        ]
      },
      {
        "name": "Trouver des lieux sûrs",
        "description": "Renseigne-toi sur les parcs, salles communes et gymnases d'école — gratuits ou pas chers, et accessibles sans voiture. Vérifie chaque lieu pour toutes sortes de corps et de capacités : sol plat, sièges, ombre, toilettes, et un endroit où s'abriter si le temps tourne.",
        "hours": 3
      },
      {
        "name": "Prévoir un programme inclusif, tous niveaux",
        "description": "Conçois chaque activité pour qu'on puisse la rejoindre à son rythme et l'adapter librement — une option sur chaise pour les étirements, une petite boucle dans la grande marche. Garde le cap sur se sentir bien, bouger et se retrouver, jamais sur l'apparence ou la performance.",
        "hours": 3
      },
      {
        "name": "Prendre soin de la sécurité et de la santé",
        "description": "Intègre échauffement et hydratation à chaque séance, garde une trousse de premiers secours bien garnie à portée de main, et suggère aux personnes qui débutent de voir d'abord un médecin. Apprends aux guides à repérer le surmenage et à rendre le ralentissement normal, pas gênant.",
        "hours": 3,
        "skills": [
          "premiers secours"
        ]
      },
      {
        "name": "Fixer un calendrier et faire passer le mot",
        "description": "Choisis des horaires réguliers autour desquels les gens peuvent construire une habitude, et tiens-les. Fais passer le mot partout — tracts, groupes de discussion, bouche-à-oreille — et dis noir sur blanc que tous les âges, toutes les tailles et toutes les capacités sont bienvenus, parce que beaucoup de gens supposent le contraire.",
        "hours": 3,
        "skills": [
          "aller vers les gens"
        ]
      },
      {
        "name": "Cultiver le lien et la régularité",
        "description": "Rends les séances sociales : des prénoms appris, les nouvelles têtes accueillies, quelques minutes de papotage prévues. Célèbre le fait de venir plutôt que n'importe quel chiffre — c'est le lien qui fait revenir les gens bien après que la nouveauté s'est éteinte.",
        "hours": 2,
        "skills": [
          "animation"
        ]
      }
    ]
  },
  {
    "id": "urban-orchard",
    "name": "Verger urbain et forêt nourricière",
    "purpose": "Planter des arbres fruitiers, des arbres à noix et des plantes comestibles vivaces sur des terrains partagés — une forêt nourricière qui, une fois installée, nourrit le quartier gratuitement pendant des décennies.",
    "whoItServes": "Toute la communauté, y compris les voisins qui ne sont pas encore arrivés — les arbres plantés cette année deviennent une source durable de nourriture fraîche et gratuite pour tout le monde.",
    "whatYoullNeed": "Un accès à la terre sur le long terme (un accord verbal de saison en saison ne suffit pas pour des arbres), des arbres et plantes adaptés au climat, des bénévoles pour les journées de plantation et une petite équipe qui s'engage à en prendre soin pendant des années, pas des mois. Confirmez l'accès à l'eau avant de mettre quoi que ce soit en terre.",
    "setupHours": 21,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "La conversation sur la terre passe avant tout : parle aux fiducies foncières, au service des parcs, aux congrégations avec du terrain inutilisé — quiconque peut engager un lieu pour une décennie, pas une saison — et confirme l'eau au passage. En parallèle, trouve une personne avec une vraie expérience des arbres fruitiers pour ancrer le plan, et demande aux voisins ce qu'ils cueilleraient et mangeraient vraiment, parce qu'un verger de fruits dont personne ne veut nourrit surtout les guêpes.",
    "commonPitfalls": "Les vergers échouent rarement le jour de la plantation — ils échouent les années deux et trois, quand la foule est partie et que personne n'a organisé l'arrosage, et les jeunes arbres meurent en silence à leur premier été sec. Les autres tueurs sont les accords fonciers fragiles révoqués juste quand les arbres commencent à donner, et les disputes de récolte parce que personne n'a fixé de règles de partage avant la première grosse récolte. Réglez le roulement d'entretien et les règles de partage tôt, tant que c'est encore facile.",
    "pairsWith": [
      "community-garden",
      "gleaning-network",
      "seed-library"
    ],
    "tasks": [
      {
        "name": "Sécuriser un accès à la terre sur le long terme",
        "description": "Obtiens un accord écrit durable — un bail long, un montage avec une fiducie foncière, un engagement formel de la ville — parce que les arbres ont besoin de décennies, pas d'un accord verbal de saison en saison. Confirme un accès fiable à l'eau sur place avant de signer quoi que ce soit.",
        "hours": 5,
        "skills": [
          "aller vers les gens"
        ]
      },
      {
        "name": "Concevoir le plan de plantation",
        "description": "Choisis des espèces adaptées à ton climat et pense en étages de forêt nourricière : arbres de canopée, arbustes et couvre-sol qui travaillent ensemble. Prévois les partenaires de pollinisation et l'espacement dont les arbres adultes auront besoin, pas la taille des jeunes plants que tu mets en terre.",
        "hours": 4,
        "skills": [
          "jardinage"
        ]
      },
      {
        "name": "Trouver les arbres et les plantes",
        "description": "Procure-toi arbres et plantes via les pépinières, les subventions, les dons et les ventes de saison en racines nues — les jeunes plants en racines nues coûtent une fraction des arbres adultes en pot et reprennent en général mieux. Commande tôt ; les bonnes variétés partent vite.",
        "hours": 3
      },
      {
        "name": "Préparer le terrain",
        "description": "Prépare le sol avant l'arrivée des arbres : améliore la terre, étale du paillis, installe l'arrosage, et marque et dégage chaque emplacement du plan. Un terrain préparé transforme la journée de plantation d'un chaos en chaîne bien huilée.",
        "hours": 4,
        "skills": [
          "jardinage"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Organiser des journées de plantation",
        "description": "Anime des journées de plantation communautaires avec des consignes claires, pour que chaque arbre parte à la bonne profondeur, avec sa cuvette d'arrosage et son paillis — mal plantés, les arbres dépérissent lentement et sans bruit. Rends ça festif ; une journée de plantation, c'est comme ça que le quartier commence à sentir que le verger est à lui.",
        "hours": 5,
        "skills": [
          "jardinage"
        ],
        "follows": [
          3
        ],
        "recurringCadence": "cycle"
      },
      {
        "name": "Mettre en place l'entretien à long terme",
        "description": "Organise le travail sans gloire qui décide si le verger vit : arroser les jeunes arbres pendant leurs premiers étés, tailler, pailler et surveiller les ravageurs, année après année. Un roulement nommé de personnes engagées vaut mieux qu'une grande liste de bénévoles vagues.",
        "hours": 3,
        "skills": [
          "jardinage"
        ]
      },
      {
        "name": "Prévoir le partage de la récolte",
        "description": "Fixez les règles de cueillette et de partage avant la première grosse récolte, pas après la première dispute — qui récolte, quand, et combien. Dirige le surplus vers les frigos partagés, les garde-manger et les repas communs pour que rien ne pourrisse sur la branche.",
        "hours": 2
      }
    ]
  },
  {
    "id": "new-parent-support",
    "name": "Réseau de soutien post-partum et jeunes parents",
    "purpose": "Entourer de soutien concret les jeunes parents et les parents en attente — des repas sur le pas de la porte, des courses faites, de la vaisselle lavée, et des pairs qui sont passés par là — pendant la grossesse et les semaines à vif du post-partum.",
    "whoItServes": "Les jeunes parents et les parents qui attendent un enfant, surtout sans famille à proximité — les semaines après une naissance sont celles où le soutien compte le plus et arrive le moins.",
    "whatYoullNeed": "Des bénévoles qui savent cuisiner, faire des courses et écouter ; une chaîne de repas ; un répertoire de ressources ; et des parents expérimentés comme pairs aidants. Le soutien entre pairs n'est ni un soin médical ni un soin de santé mentale — les troubles de l'humeur du post-partum sont courants et sérieux, alors chaque pair aidant doit connaître les signes et savoir relier en douceur un parent à une aide professionnelle. Et vérifie quiconque entrera dans les foyers ou aidera avec les bébés, avant l'un comme l'autre.",
    "setupHours": 21,
    "defaultCategory": "childcare",
    "firstSteps": "Commence par demander aux parents qui ont accouché dans l'année ce qui les aurait vraiment aidés — les réponses (un repas sans visite incluse, quelqu'un pour porter le bébé le temps d'une douche) sont plus précises que tu ne l'imagines. Présente le réseau aux sages-femmes, aux doulas et aux cliniques pédiatriques qui peuvent le proposer aux familles, recrute deux ou trois parents expérimentés comme premiers pairs aidants, et fixe ta pratique de vérification avant que quiconque franchisse une porte.",
    "commonPitfalls": "L'échec classique, c'est le soutien qui sert la personne qui aide : des bénévoles qui arrivent selon leur propre horaire, restent trop longtemps et donnent leur avis sur l'éducation au lieu de faire la vaisselle — des parents épuisés cesseront d'ouvrir la porte sans rien dire plutôt que de le formuler. Le plus grave, c'est un pair qui rate les signes de la dépression post-partum parce que personne ne l'a formé à la reconnaître ni ne lui a donné les mots pour la nommer. Et un soutien qui disparaît au bout de deux semaines, juste quand les petits plats s'arrêtent et que le dur commence, n'est pas un soutien du tout.",
    "pairsWith": [
      "diaper-hygiene-bank",
      "childcare-collective",
      "welcome-wagon"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Recruter des bénévoles et des pairs aidants",
        "description": "Rassemble des personnes qui cuisinent, font les courses et — surtout — des parents expérimentés prêts à devenir pairs aidants. Le parent qui se souvient de sa propre troisième semaine sans sommeil offre quelque chose qu'aucun dépliant ne peut donner.",
        "hours": 3,
        "skills": [
          "aller vers les gens"
        ]
      },
      {
        "name": "Monter une chaîne de repas",
        "description": "Crée un moyen simple de coordonner des repas déposés pendant les semaines qui suivent une naissance : un calendrier partagé, les besoins alimentaires et allergies recueillis une seule fois, des plats étiquetés et faciles à réchauffer. Le dépôt sur le pas de la porte doit être la norme — un repas ne doit jamais obliger à une visite.",
        "hours": 3,
        "skills": [
          "cuisine",
          "organisation"
        ]
      },
      {
        "name": "Offrir de l'aide concrète",
        "description": "Organise des bénévoles pour la charge sans gloire : courses, lessive, vaisselle, et garder les aînés pour qu'un parent puisse se reposer ou aller à un rendez-vous. Demande à chaque fois ce qui est voulu plutôt que de supposer — l'aide utile suit la liste du parent, pas celle du bénévole.",
        "hours": 3,
        "skills": [
          "garde d'enfants"
        ]
      },
      {
        "name": "Construire un répertoire de ressources",
        "description": "Rassemble le soutien à l'allaitement, les soins de santé mentale post-partum, les cliniques pédiatriques et les sources de matériel de bébé du coin — y compris la banque de couches et le collectif de garde d'enfants si ta communauté les fait vivre. Tiens-le à jour ; un répertoire de numéros morts est pire que rien.",
        "hours": 4,
        "skills": [
          "saisie de données"
        ]
      },
      {
        "name": "Créer des cercles de soutien entre pairs",
        "description": "Lance de petits groupes où les jeunes parents peuvent être honnêtes sur la difficulté, avec un parent expérimenté qui tient l'espace. Forme les pairs aux signes de la dépression et de l'anxiété post-partum et à encourager, avec douceur et persistance, les soins professionnels — sans jamais diagnostiquer, sans jamais attendre.",
        "hours": 3,
        "skills": [
          "animation"
        ]
      },
      {
        "name": "Poser des pratiques de sécurité et de limites",
        "description": "Vérifie chaque bénévole qui entrera dans les foyers ou aidera avec les bébés — des références au minimum — et écris les limites : les parents fixent les conditions, les visites restent courtes sauf invitation à rester, et personne n'arrive sans prévenir. Le soutien ne doit jamais ressembler à de la surveillance.",
        "hours": 3
      },
      {
        "name": "Relier aux autres projets",
        "description": "Relie les familles à la banque de couches, au collectif de garde d'enfants et au comité d'accueil, pour qu'un seul point de contact ouvre tout. Un jeune parent ne devrait pas avoir à découvrir chaque programme séparément au moment le plus épuisé de sa vie.",
        "hours": 2,
        "skills": [
          "aller vers les gens"
        ]
      }
    ]
  },
  {
    "id": "foster-kinship-support",
    "name": "Réseau de soutien aux familles d'accueil et aux proches qui élèvent des enfants",
    "purpose": "Épauler les familles d'accueil, les proches qui élèvent des enfants et les autres familles qui prennent soin — des vêtements et un lit quand un enfant arrive du jour au lendemain, du répit quand les personnes qui s'en occupent sont à bout, et des pairs qui comprennent ce travail.",
    "whoItServes": "Les parents d'accueil, les grands-parents et les proches qui élèvent des enfants — chez les proches, ça commence souvent par un coup de téléphone et quelques heures de préavis — et les enfants dont ils prennent soin.",
    "whatYoullNeed": "Des bénévoles, des dons de matériel de tous âges et de toutes tailles, des personnes pour le répit, et des partenariats avec les services et les écoles. Le travail auprès d'enfants placés est sensible et encadré par la loi : vérifiez toute personne qui travaille avec des enfants, suivez à la lettre les règles de signalement obligatoire et de confidentialité, et coordonnez-vous avec les services concernés plutôt que dans leur dos.",
    "setupHours": 24,
    "defaultCategory": "childcare",
    "firstSteps": "Commence par un rendez-vous au service local de protection de l'enfance ou au programme d'accompagnement des proches : apprends les règles qui encadrent ce travail — vérification, signalement obligatoire, confidentialité — avant de recruter un seul bénévole, et laisse-les te dire où sont vraiment les manques. Ensuite, demande à quelques familles ce dont elles ont eu besoin leur première semaine et leur première année ; construis vers ces réponses, pas vers un entrepôt de choses que personne n'a demandées.",
    "commonPitfalls": "Ce projet peut échouer avec fracas ou en silence. Avec fracas : un bénévole non vérifié auprès d'enfants, ou l'histoire d'une famille partagée sans permission — l'un comme l'autre peut blesser un enfant, mettre fin à un placement et achever le projet en un jour. En silence : une montagne de dons non triés pendant qu'une famille attend trois semaines un lit d'enfant, ou traiter les services comme des adversaires jusqu'à ce qu'ils arrêtent d'orienter des familles. Ici, petit, vérifié et coordonné gagne contre grand et improvisé, à chaque fois.",
    "pairsWith": [
      "diaper-hygiene-bank",
      "free-store",
      "childcare-collective"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Entrer en lien avec les familles qui accueillent",
        "description": "Rejoins les familles via les services, les écoles et les groupes religieux — surtout les proches, qui accueillent souvent un petit-enfant ou une nièce du jour au lendemain, sans préparation et avec peu de soutien officiel. Fais du premier contact une offre, jamais un tri.",
        "hours": 3,
        "skills": [
          "aller vers les gens"
        ]
      },
      {
        "name": "Constituer une réserve de vêtements et de matériel",
        "description": "Collecte vêtements, lits, sièges auto et affaires du quotidien sur toute la gamme d'âges et de tailles, parce que les familles savent rarement qui arrive avant que l'enfant soit là. Vérifie soigneusement le matériel de sécurité — les sièges auto et les lits de bébé ont des dates de péremption et des listes de rappel.",
        "hours": 4,
        "skills": [
          "organisation"
        ]
      },
      {
        "name": "Créer un système de sacs prêts à partir",
        "description": "Prépare des sacs prêts à partir — quelques jours de vêtements, des affaires de toilette et un objet réconfortant comme une peluche — triés par âge et par taille, livrables dans les heures qui suivent un nouveau placement. Un enfant qui arrive sans rien ne devrait pas attendre une semaine pour avoir quelque chose à lui.",
        "hours": 3,
        "follows": [
          1
        ]
      },
      {
        "name": "Organiser le répit",
        "description": "Mets en place une garde sûre et dûment vérifiée pour que les familles puissent se reposer, honorer leurs rendez-vous ou simplement respirer — l'épuisement des personnes qui s'occupent des enfants est l'une des premières causes de rupture de placement. Vois avec les services qui peut assurer le répit et selon quelles règles.",
        "hours": 4,
        "skills": [
          "garde d'enfants"
        ]
      },
      {
        "name": "Proposer des groupes de soutien entre pairs",
        "description": "Organise des rencontres régulières où les familles d'accueil et les proches peuvent échanger expérience et conseils honnêtes avec des gens qui comprennent — ce travail isole, et la personne qui élève des enfants à trois rues de là porte peut-être la même charge, seule.",
        "hours": 3,
        "skills": [
          "animation"
        ]
      },
      {
        "name": "Construire un répertoire de ressources",
        "description": "Rassemble les services, aides et soutiens sensibles au trauma auxquels les familles peuvent recourir, et aide-les à naviguer des systèmes déroutants même pour les professionnels. Les proches qui élèvent des enfants, en particulier, ont souvent droit à des aides dont personne ne leur a parlé.",
        "hours": 3,
        "skills": [
          "saisie de données"
        ]
      },
      {
        "name": "Poser les pratiques de sécurité et de vie privée des enfants",
        "description": "Écris et respecte les non-négociables : la vérification pour quiconque travaille avec des enfants, ce que les lois de signalement obligatoire exigent de tes bénévoles, et une vie privée stricte pour les familles et les enfants — pas de photos, pas d'histoires, pas de détails partagés sans permission.",
        "hours": 4,
        "skills": [
          "rédaction"
        ]
      }
    ]
  },
  {
    "id": "weather-survival-outreach",
    "name": "Maraudes de survie par grand froid et forte chaleur",
    "purpose": "Apporter du matériel de survie aux voisines et voisins sans abri quand la météo devient mortelle — couvertures et chaufferettes pendant une vague de froid, eau et électrolytes pendant une canicule — porté jusque là où les gens se trouvent vraiment.",
    "whoItServes": "Les voisins sans abri ou à la rue exposés aux intempéries extrêmes — les personnes pour qui une canicule ou une vague de froid est un danger de mort, pas un désagrément.",
    "whatYoullNeed": "Du matériel adapté à chaque saison, des bénévoles de maraude, des tournées planifiées et des liens à jour avec les hébergements et les services. Le froid et la chaleur extrêmes tuent : chaque bénévole doit être formé à reconnaître l'hypothermie et le coup de chaleur et à appeler sans attendre une aide médicale professionnelle — jamais attendre de voir.",
    "setupHours": 24,
    "defaultCategory": "mutual_aid_drive",
    "firstSteps": "Avant d'acheter une seule couverture, parle aux équipes de maraude et aux organisations qui parcourent déjà ces rues — elles tiennent la confiance et le savoir de là où les gens sont vraiment, et elles te diront ce qui est couvert et ce qui manque. Convenez ensemble de la place que tu prendras, fixe les seuils météo qui déclenchent tes tournées, et constitue le stock de la saison pendant que le temps est encore doux.",
    "commonPitfalls": "L'échec prévisible, c'est de commencer en même temps que la météo : le matériel cherché en pleine canicule arrive après le danger, et des inconnus qui apparaissent pour la première fois en pleine crise reçoivent un non méfiant de gens qui ont appris la prudence à leurs dépens. Les échecs dangereux, ce sont des bénévoles qui tentent de gérer eux-mêmes une urgence médicale au lieu d'appeler à l'aide immédiatement, et la pression mise sur les gens pour bouger ou accepter un hébergement — propose, informe et respecte la réponse.",
    "pairsWith": [
      "cooling-warming-center",
      "harm-reduction-supplies",
      "resource-hub-dispatch"
    ],
    "tasks": [
      {
        "name": "Assembler des kits adaptés à la saison",
        "description": "Prépare des kits selon la saison : couvertures, chaussettes chaudes, bonnets, gants et chaufferettes pour le froid ; eau, sachets d'électrolytes, crème solaire, casquettes et linges rafraîchissants pour la chaleur. Ajoute à chaque kit une carte avec les adresses d'hébergement et les numéros de crise.",
        "hours": 4
      },
      {
        "name": "Trouver le matériel",
        "description": "Organise des collectes, fais des achats en gros et demande des contributions aux magasins et aux congrégations — et fais-le avant la saison, parce que chercher des couvertures pendant le premier gel, c'est arriver trop tard. Stocke assez pour te réapprovisionner en cours de saison.",
        "hours": 4,
        "skills": [
          "aller vers les gens",
          "conduite"
        ]
      },
      {
        "name": "Cartographier où trouver les gens",
        "description": "Travaille avec les équipes de maraude existantes pour apprendre où les voisins sans abri se trouvent vraiment — elles portent une confiance et un savoir construits sur des années, et arriver à leurs côtés vaut mieux qu'arriver de nulle part. Garde la carte souple et à jour ; les gens bougent, surtout par mauvais temps.",
        "hours": 3,
        "skills": [
          "aller vers les gens"
        ]
      },
      {
        "name": "Recruter et former les bénévoles de maraude",
        "description": "Forme chaque bénévole avant sa première tournée : un contact respectueux qui accepte un non, la sécurité personnelle et le travail toujours en binôme, et la reconnaissance des urgences médicales liées à la météo. Personne ne distribue avant d'avoir été formé.",
        "hours": 4,
        "skills": [
          "enseignement"
        ]
      },
      {
        "name": "Construire un plan de distribution et de tournées",
        "description": "Planifie les tournées et les horaires pour les jours qui précèdent et accompagnent la météo dangereuse, en allant d'abord vers les personnes les plus exposées — les plus loin des services, celles qui dorment dehors plutôt qu'en véhicule ou en hébergement. Décide à l'avance quel bulletin météo déclenche une tournée.",
        "hours": 3,
        "skills": [
          "organisation"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Relier les gens aux hébergements et aux services",
        "description": "Emporte des infos à jour et vérifiées sur les lieux chauffés et rafraîchis, les places d'hébergement et le centre de ressources — les horaires et les règles changent sans arrêt, et orienter vers une porte close brûle la confiance. Propose des liens sans pression ; la relation dure plus longtemps qu'une seule nuit.",
        "hours": 3,
        "skills": [
          "aller vers les gens"
        ]
      },
      {
        "name": "Prévoir les urgences",
        "description": "Forme chaque bénévole à reconnaître l'hypothermie et le coup de chaleur — confusion, parole pâteuse, peau chaude et sèche ou froide et moite — et à appeler immédiatement les secours, pas à attendre de voir. Répétez quoi faire en attendant l'aide : de l'ombre et de l'eau, ou des couvertures et un abri du vent.",
        "hours": 3,
        "skills": [
          "premiers secours"
        ]
      }
    ]
  }
];
