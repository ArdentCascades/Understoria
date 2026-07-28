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
// French suggested starter steps (i18n Phase 2b). Loaded lazily
// via content/bundles/fr.ts — never import this statically from
// app code.
export const TASK_STEPS_FR: Record<string, readonly (readonly string[])[]> = {
  "community-fridge": [
    [
      "Note trois commerces, églises ou cliniques du coin avec un mur extérieur abrité",
      "Va voir ton premier choix et demande dix minutes à la personne qui tient les lieux",
      "Parlez des côtés pas glamour : la facture d'électricité, le désordre, qui appeler en cas de panne",
      "Vérifie que la prise extérieure est protégée par un différentiel et reste alimentée la nuit",
      "Résume l'accord dans un court mail et obtiens leur oui par écrit"
    ],
    [
      "Publie tout de suite une annonce d'une ligne pour un frigo en état de marche dans un groupe local",
      "Trouve quelqu'un avec une camionnette et un diable pour le jour de la collecte",
      "Branche le frigo donné et laisse-le tourner une journée entière avant de construire autour",
      "Dessine un appentis simple qui laisse une largeur de main derrière le frigo pour l'aération",
      "Construis-le, fixe le frigo pour qu'il ne bascule pas et branche-le sur le lieu d'accueil"
    ],
    [
      "Rédige le panneau dans les notes de ton téléphone : prends ce qu'il te faut, laisse ce que tu peux, et les non",
      "Réécris chaque non avec sa raison de sécurité à côté, pour que ça sonne soin et pas réprimande",
      "Demande à deux voisines ou voisins de traduire le panneau dans les langues de ton quartier",
      "Imprime-le, plastifie-le et scotche-le à hauteur des yeux",
      "Accroche un marqueur et des étiquettes vierges à l'intérieur pour dater les produits"
    ],
    [
      "Écris à trois bénévoles possibles et demande à chaque personne un créneau hebdo de 15 minutes",
      "Monte un calendrier partagé avec deux noms par créneau, jamais un seul",
      "Pose un seau de produits de nettoyage à côté du frigo",
      "Scotche un journal de nettoyage daté à l'intérieur de la porte",
      "Remplis les derniers créneaux vides avant l'ouverture, quitte à demander deux fois"
    ],
    [
      "Liste les boulangeries, épiceries et restaurants accessibles à pied",
      "Passe dans l'un d'eux à une heure calme et demande les invendus de fin de journée",
      "S'ils craignent d'être tenus responsables, parle-leur des protections légales pour les dons",
      "Convenez d'une heure de collecte hebdomadaire fixe et mets-la dans ton calendrier",
      "Note quelles sources tiennent vraiment parole chaque semaine"
    ],
    [
      "Envoie un message au groupe pour demander qui partagera la permanence des pépins",
      "Crée un numéro partagé gratuit type Google Voice, jamais le portable d'une seule personne",
      "Décidez du délai de réponse et de qui prend le relais pendant les vacances",
      "Écris le numéro sur une étiquette résistante à l'eau et colle-la sur le frigo"
    ]
  ],
  "community-garden": [
    [
      "Prends une photo du terrain que tu as en tête la prochaine fois que tu passes devant",
      "Cherche qui en est propriétaire au cadastre, ou frappe à la porte et demande",
      "Demande une autorisation écrite d'un an, même une simple note signée",
      "Inscris dans l'accord qui paie l'eau et avec quel préavis le terrain peut être repris",
      "Frappe aux portes des deux côtés du terrain et demande ce que les gens penseraient d'un jardin"
    ],
    [
      "Cherche un test de sol auprès d'un service agricole local et commande le kit",
      "Prélève des échantillons à plusieurs endroits, surtout près des vieux murs et des clôtures",
      "Poste le kit des semaines avant la journée de chantier, car les résultats prennent du temps",
      "En attendant, esquisse sur papier les bacs, les allées et le coin outils",
      "Si les résultats montrent du plomb, prévois des bacs surélevés avec de la terre saine achetée"
    ],
    [
      "Publie dans un groupe local un appel au bois non traité, au compost et au paillis",
      "Refuse traverses et vieux bois traité ; utilise cèdre, parpaing ou bottes de paille",
      "Fixe la date de la journée de chantier et invite du monde",
      "Dépose le matériel et les outils sur place la veille",
      "Monte les bacs avec le groupe et installe le tuyau ou les récupérateurs d'eau"
    ],
    [
      "Écris au groupe pour fixer une discussion de 30 minutes sur le mode de partage",
      "En réunion, posez les trois options sur papier : parcelles individuelles, commun, mélange",
      "Décidez aussi ce qui arrive à une parcelle si quelqu'un disparaît en pleine saison",
      "Notez le choix et la façon de décider, et partagez-le avec tout le monde"
    ],
    [
      "Cherche tout de suite la date de dernière gelée locale et note-la",
      "Choisis cinq cultures faciles pour ta zone : verdures, haricots, courges, tomates, herbes",
      "Prévois des semis espacés de deux semaines pour étaler les récoltes",
      "Plante la première fournée après la date de gelée et étiquette chaque rang"
    ],
    [
      "Crée un calendrier partagé et mets ton propre nom sur le premier créneau",
      "Remplis juillet et août d'abord : c'est là que les roulements s'effondrent",
      "Demande à chaque personne régulière un petit créneau par semaine, pas plus",
      "Ajoute une note : arroser à l'aube, pas en plein midi",
      "Relie chaque créneau à un rappel sur le téléphone"
    ],
    [
      "Mets le premier jour de récolte dans le calendrier partagé",
      "Demande au frigo communautaire ou à un étal voisin s'ils prennent le surplus le jour même",
      "Mets un rappel deux fois par semaine pour cueillir haricots, concombres et courgettes",
      "Mets de côté une enveloppe étiquetée de graines gardées pour l'an prochain"
    ]
  ],
  "tool-lending-library": [
    [
      "Écris à une personne amie qui a un garage ou une cabane : hébergerait-elle une étagère à outils ?",
      "Visite l'espace et vérifie qu'il est sec, qu'il ferme à clé et qu'on y accède sans escalier",
      "Demande à ton hôte comment un bac ou une trappe gérerait les retours hors permanence",
      "Convenez de 2 à 4 heures de permanence par semaine et notez-les"
    ],
    [
      "Publie un message dans le chat du quartier avec les cinq outils que tu veux le plus",
      "Prépare trois cartons étiquetés à garder, à réparer, à jeter avant l'arrivée des dons",
      "Branche et teste chaque outil électrique sous charge ; jette ce qui cale",
      "Vérifie les câbles entaillés et les carters de lame avant de ranger un outil"
    ],
    [
      "Ouvre un tableur vierge et tape cinq colonnes : numéro, objet, état, coût, photo",
      "Numérote dix outils au scotch ou au marqueur et photographie chacun avec son numéro",
      "Cherche le coût de remplacement de chaque outil et note-le dans sa ligne",
      "Marque chaque outil au nom de la bibliothèque pour que la propriété ne fasse aucun doute"
    ],
    [
      "Cherche la page de règles d'une autre bibliothèque d'outils comme point de départ",
      "Rédige en dix lignes la durée de prêt, la limite d'objets et une politique de retard amicale",
      "Ajoute à la fiche d'inscription une ligne courte d'usage à tes propres risques",
      "Liste les deux ou trois outils chers qui méritent une caution ou un rappel de sécurité",
      "Fais lire le brouillon à quelqu'un qui compte emprunter et note ce qui le perd"
    ],
    [
      "Déniche un porte-bloc et accroche-lui un stylo — voilà ton comptoir de prêt",
      "Crée une fiche de sortie : nom, téléphone, numéro d'objet, dates ; imprimes-en dix",
      "Envoie un texto sur place à chaque nouvelle personne pour vérifier que le numéro marche",
      "Photographie l'état de chaque outil au moment du prêt, avant qu'il sorte"
    ],
    [
      "Écris à tes deux bénévoles pour caler une heure de passage en revue cette semaine",
      "Rédige une antisèche d'une page : étapes de prêt, catalogue, bases de sécurité",
      "Jouez la scène : refuser gentiment un don cassé et noter un dégât sans accuser",
      "Montre-leur où vivent la trousse de premiers secours et les lunettes de protection",
      "Regarde chaque personne dérouler un prêt d'essai du début à la fin"
    ],
    [
      "Scotche au comptoir une feuille de souhaits pour les demandes que tu ne peux pas combler",
      "Mets tout de suite une date mensuelle d'affûtage et d'huilage au calendrier",
      "Inspecte les retours de la semaine et mets ce qui est abîmé dans la caisse à réparer",
      "Relis la liste de souhaits chaque mois et choisis le prochain outil à ajouter"
    ]
  ],
  "neighborhood-care-network": [
    [
      "Écris à une personne relais — pasteur, concierge, soignant — pour demander qui semble isolé",
      "Commence une liste papier chez toi ; rien dans les docs partagés ni les chats de groupe",
      "Demande à deux voisins de confiance de te présenter plutôt que de frapper à froid",
      "Va voir en personne un concierge d'immeuble ou un groupe religieux et laisse ton numéro",
      "Formule chaque invitation comme une offre — un appel hebdo ? — jamais comme un doigt pointé"
    ],
    [
      "Écris à trois personnes fiables : peuvent-elles s'engager sur un contact hebdomadaire ?",
      "Rédige une courte annonce de recrutement qui nomme l'engagement sans détour",
      "Demande deux références à quiconque fera des visites à domicile",
      "Bloque une heure et téléphone vraiment à chaque référence — ne te contente pas de les classer",
      "Pose la règle d'emblée : aucun bénévole ne gère seul l'argent ou les clés d'un voisin"
    ],
    [
      "Sors ta liste et note la langue, la rue et la zone de confort de chaque bénévole",
      "Appelle chaque voisin et demande ce qui lui ferait plaisir : un appel, un trajet, une discussion",
      "Forme le premier binôme sur la proximité et la langue, et note ton raisonnement",
      "Dis aux deux que c'est un essai que chacun peut arrêter en douceur, sans se justifier"
    ],
    [
      "Écris à un binôme et demande quel jour et quelle heure leur vont à tous les deux",
      "Fixe chaque prise de nouvelles au même jour et à la même heure pour qu'un oubli se voie",
      "Écris un canevas de premier contact en trois lignes et envoie-le à chaque bénévole",
      "Garde les horaires de tous les binômes au même endroit, consultable par la coordination"
    ],
    [
      "Demande aujourd'hui à un voisin qui prévenir s'il ne répondait pas un jour",
      "Note le contact de crise de chaque voisin — et s'il faut éviter d'appeler la police",
      "Rédige une page : pas de réponse → réessayer, appeler son contact, puis quand alerter",
      "Imprime des copies pour chaque bénévole au lieu de laisser le plan dans un seul téléphone"
    ],
    [
      "Écris à un bénévole et demande quels besoins sont revenus lors de sa dernière visite",
      "Commence une liste des besoins récurrents : trajets, ordonnances, déneigement",
      "Relie chaque besoin à un bénévole ou à un projet voisin et vérifie que le relais a eu lieu",
      "Renvoie tout ce qui est médical — médicaments, plaies, porter — vers des pros, avec douceur"
    ],
    [
      "Envoie à tous les bénévoles deux dates possibles pour un temps d'échange",
      "Réserve un endroit confortable et mets la rencontre au calendrier de tout le monde",
      "Prends des nouvelles de chaque bénévole en privé avant la réunion de groupe",
      "Fais tourner dès maintenant qui semble à bout, avant qu'il doive abandonner"
    ]
  ],
  "emergency-preparedness": [
    [
      "Ouvre les cartes officielles d'inondation et de feux de ta zone et fais une capture de tes rues",
      "Parcours ta rue et note les immeubles à sortie unique et les étages sans ascenseur",
      "Frappe aux portes et demande qui dépend du courant pour l'oxygène ou des médicaments au frais",
      "Reporte tout sur une carte papier — les risques d'une couleur, les personnes à voir d'une autre"
    ],
    [
      "Écris d'abord la ligne de ton propre foyer : nom, téléphone, adresse, besoins",
      "Frappe à dix portes, feuille en main, et note les coordonnées de qui veut bien",
      "Demande à une personne fiable par rue de veiller sur une dizaine de foyers",
      "Imprime la liste, note qui préfère un toc à la porte, et garde des copies dans deux maisons"
    ],
    [
      "Écris à deux voisins pour choisir un point de rassemblement accessible à pied",
      "Choisissez les signaux sans réseau : toc aux portes, un canal radio, une heure fixe",
      "Emporte les radios aux deux bouts du quartier et teste-les à distance réelle",
      "Imprime le plan d'une page et distribue-le porte à porte"
    ],
    [
      "Commence le kit tout de suite : mets une lampe de poche et des piles dans une caisse étiquetée",
      "Liste ce qui manque — eau, premiers secours, radio à manivelle, couvertures — et partagez les achats",
      "Range la caisse là où deux ou trois personnes l'atteignent sans dépendre d'une seule clé",
      "Scotche une date de rotation sur le couvercle et mets-la au calendrier du groupe"
    ],
    [
      "Note de mémoire trois lieux candidats : une salle, une église, un parc ombragé",
      "Visite chacun et demande la clé de 2 h du matin, le carburant stocké et l'accès en fauteuil",
      "Obtiens chaque oui par écrit avec le nom et le numéro de la personne qui accueille",
      "Ajoute les lieux confirmés au plan imprimé"
    ],
    [
      "Demande par message à ton hôte du point sûr une soirée le mois prochain",
      "Prévois trois ateliers pratiques : sacs d'urgence, vannes à couper, chaîne de contacts",
      "Invite en personne les voisins qui ont le plus besoin de s'entraîner",
      "Pendant l'exercice, chronomètre la chaîne de bout en bout et note où elle casse"
    ],
    [
      "Liste les rôles sur une page : vérifications médicales, ouvrir le point sûr, coordonner",
      "Appelle chaque personne et obtiens un oui de vive voix pour son rôle précis",
      "Nomme une doublure pour chaque rôle, en commençant par les vérifications médicales",
      "Mets deux dates de relecture par an au calendrier et agrafe les rôles à la liste"
    ]
  ],
  "free-store": [
    [
      "Écris à deux lieux avec de l'espace — une salle paroissiale, un centre social — pour une date",
      "Visite la meilleure option et vérifie le rez-de-chaussée et un trottoir où se garer",
      "Tranchez en équipe : troc d'un jour, rendez-vous récurrent ou boutique permanente",
      "Réserve le même créneau récurrent avant de quitter le bâtiment"
    ],
    [
      "Copie la liste oui/non d'une boutique gratuite ou d'une friperie comme brouillon",
      "Ajoute les sièges auto d'occasion, les casques et les matelas côté « non »",
      "Fais valider la liste finale par l'équipe d'un pouce rapide",
      "Fais deux copies en gros caractères : une pour la porte des dépôts, une pour l'intérieur"
    ],
    [
      "Note les noms de tes postes sur une feuille : réception, tri, mise en place",
      "Demande à l'hôte quelles tables et caisses il prête, et étiquette un bac « à redonner »",
      "Dessine le circuit de la salle pour contrôler les dons à la porte, pas aux tables",
      "Recrute deux personnes au tri pour la première heure, quand la pile est la plus grosse"
    ],
    [
      "Demande dans le chat du groupe des cintres en trop et un portant",
      "Suspends les vêtements par taille et épingle une carte de taille sur chaque section",
      "Regroupe les objets du quotidien par genre sur des tables séparées",
      "Sors-en moins que tu n'en as et garde une caisse de réassort sous chaque table"
    ],
    [
      "Envoie la date à la liste des bénévoles avec trois rôles : accueil, tri, vadrouille",
      "Rappelle à l'accueil : ne jamais demander pourquoi on vient ni combien on emporte",
      "Affiche la liste des créneaux pour que chaque personne connaisse son heure et son poste",
      "Fais le tour de la salle à mi-parcours et envoie la vadrouille où ça semble pillé"
    ],
    [
      "Appelle une association partenaire ou un recycleur textile et demande ce qu'ils acceptent",
      "Confirme leurs horaires pour le lendemain de ton événement",
      "Trouve une personne avec un grand coffre avant l'ouverture",
      "Vide tout le jour même pour que l'hôte retrouve son espace vide"
    ]
  ],
  "skill-share": [
    [
      "Note les deux questions dans ton téléphone : que pourrais-tu enseigner, que veux-tu apprendre",
      "Remplace « en quoi es-tu expert » par « pour quoi te demande-t-on toujours de l'aide »",
      "Pose la question aux trois premières personnes aujourd'hui — en vrai, par texto, au plus vite",
      "Verse chaque réponse dans un formulaire ou une feuille simple au fur et à mesure",
      "Entoure les recoupements — voilà ton premier programme"
    ],
    [
      "Écris à une personne qui pourrait enseigner et invite-la pour un café cette semaine",
      "Dis-lui qu'une séance est une conversation les mains occupées, pas un cours magistral",
      "Planifiez ensemble ses cinq premières minutes, minute par minute",
      "Listez le matériel nécessaire et qui apporte quoi",
      "Propose une co-animation à qui débute et semble encore nerveux"
    ],
    [
      "Liste trois salles gratuites à solliciter : bibliothèque, centre social, le salon de quelqu'un",
      "Écris à chacune pour connaître les soirées et créneaux de week-end libres",
      "Parcours l'espace et vérifie qu'il convient aux séances — un cours de cuisine veut un évier",
      "Demande exactement qui ouvre et qui ferme, et note-le",
      "Réserve le même créneau récurrent pour que venir devienne une habitude"
    ],
    [
      "Ouvre une feuille vierge et liste chaque séance confirmée : date, sujet, prof, quoi apporter",
      "Publie le programme là où les membres regardent déjà, pas dans un nouvel endroit",
      "Garde l'inscription en entrée libre ou en un geste, rien de plus lourd",
      "Mets un rappel hebdo pour confirmer en personne le prof de la semaine suivante"
    ],
    [
      "Note trois personnes que tu pensais voir et qui ne sont pas venues",
      "Demande directement à chacune ce qui lui permettrait de venir",
      "Règle l'obstacle concret que tu entends le plus — horaire, enfants, langue, bus",
      "Essaie une séance à un autre horaire ou avec garde d'enfants et compare l'affluence"
    ]
  ],
  "bulk-buying-coop": [
    [
      "Écris à trois voisins : on partage une commande en gros pour alléger les courses ?",
      "Note chaque foyer intéressé et les produits de base qu'il achète le plus",
      "Recrute un cinquième de foyers de plus que nécessaire — certains sauteront des cycles",
      "Fixe une date de réunion autour d'une table de cuisine pour choisir le cycle d'achat"
    ],
    [
      "Cherche les grossistes alimentaires près de chez toi et note trois numéros",
      "Appelle le premier et demande son catalogue et sa commande minimum",
      "Demande à chacun sa politique de manquants et si les prix se figent à la commande ou après",
      "Demande à un groupement d'achats voisin quel fournisseur il utilise, et pourquoi",
      "Compare les trois sur les minimums, la livraison et les produits de base dans un tableau"
    ],
    [
      "Ouvre un tableur vierge avec les colonnes : produit, prix unitaire, foyer, quantité",
      "Partage le lien dans le chat du groupe avec la date limite dans le message",
      "Demande nommément à une personne de coordonner ce cycle",
      "À la date limite, copie la feuille et verrouille les modifications avant de totaliser"
    ],
    [
      "Ouvre un registre partagé et titre-le avec les dates de ce cycle",
      "Préviens le groupe : le paiement arrive avant l'envoi de la commande, sans exception",
      "Calcule chaque prix à l'unité au centime près et arrondis vers le haut, pas vers le bas",
      "Note chaque paiement dans le registre à l'instant où il arrive"
    ],
    [
      "Écris à une personne qui a un garage ou une allée pour le jour de la livraison",
      "Appelle le fournisseur et demande comment le camion décharge — hayon, palette ou trottoir",
      "Réserve trois personnes pour le déchargement, avec une date et une heure précises",
      "Prépare l'espace la veille : sol dégagé, tables pliantes, passage pour le diable"
    ],
    [
      "Imprime la liste de commande de chaque foyer avant l'arrivée de qui que ce soit",
      "Installe un poste par produit en vrac avec balance, pelle et sacs",
      "Fais la tare à chaque récipient et pèse directement dans le sac du foyer",
      "Demande à une deuxième personne de cocher chaque liste avant le retrait"
    ],
    [
      "Ouvre une note « liste du cycle » et jette-y les trois premières choses que tu as faites",
      "Demande au retrait qui prend la coordination au prochain cycle et note le nom",
      "Transmets la liste et l'accès au tableur en une seule fois, autour d'une table",
      "Ajoute cinq minutes à chaque retrait pour passer en revue prix et fiabilité du fournisseur"
    ]
  ],
  "repair-cafe": [
    [
      "Écris à la voisine qui coud et à l'ami qui bricole de l'électronique",
      "Fais la liste des trous : quelles catégories n'ont encore personne",
      "Recrute deux personnes en électronique ou électroménager, pas une — leur file est la plus longue",
      "Demande à chaque oui quels outils il apporterait et quelles dates lui vont"
    ],
    [
      "Dessine la salle sur papier et repère chaque prise et chaque fenêtre",
      "Donne à chaque poste une table, une lampe et les outils demandés par qui répare",
      "Place la soudure et les batteries près d'une aération, loin du public",
      "Teste chaque multiprise chez toi avant de la brancher sur le circuit du lieu",
      "Colle une grande étiquette sur chaque poste pour que les visites s'orientent seules"
    ],
    [
      "Propose deux dates possibles à tes réparateurs et vois laquelle récolte le plus de oui",
      "Choisis un jour fixe du mois — le premier samedi, par exemple — pas une date flottante",
      "Réserve le lieu pour les trois prochaines séances en une seule demande"
    ],
    [
      "Demande à une personne bénévole et souriante de tenir l'accueil à la première séance",
      "Prépare une fiche d'accueil d'une demi-page : nom, objet, ce qui ne va pas",
      "Ajoute une ligne de tri à la fiche : sans doute réparable, peu probable, pièce à commander",
      "Écris « on reste à côté de sa réparation » sur la fiche et dis-le à l'entrée"
    ],
    [
      "Mets une trousse de premiers secours dans le sac que tu apporteras sur place",
      "Prépare une affiche d'entrée : les réparations sont tentées, jamais garanties",
      "Écris les non fermes : pas d'appareil secteur ouvert, pas de batterie gonflée",
      "Dis aux personnes qui réparent qu'un non par doute est la bonne décision, et soutiens-les"
    ],
    [
      "Demande à chaque personne qui répare les trois fournitures qui lui manquent toujours",
      "Fais une seule tournée d'achats : fil, fusibles, colle, visserie, chambres à air, rustines",
      "Mets une caisse commune et une feuille de comptage à chaque poste",
      "Relis les comptages après chaque séance et rachète avant la suivante"
    ]
  ],
  "rides-transportation": [
    [
      "Écris à deux personnes qui conduisent : prendraient-elles un trajet par mois ?",
      "Assieds-toi avec chaque oui et regarde le vrai permis et la vraie carte d'assurance",
      "Photographie les deux documents pour le dossier — « oui, je suis couvert » n'est pas une preuve",
      "Fais vérifier les références avant que quiconque conduise une personne vulnérable",
      "Note le véhicule de chaque personne, ses places et si un fauteuil roulant y entre"
    ],
    [
      "Écris à l'assureur d'une personne pour demander si la conduite bénévole est couverte",
      "Obtiens chaque réponse d'assureur par écrit avant le tout premier trajet",
      "Demande à une permanence juridique de relire un brouillon de décharge simple",
      "Range chaque confirmation écrite avec les photos du permis de la personne"
    ],
    [
      "Choisis le canal unique des demandes et note son numéro ou son lien",
      "Rédige les questions d'accueil : heure de départ, lieux, coordonnées",
      "Demande toujours dès le départ le trajet retour et tout fauteuil ou déambulateur",
      "Fixe un délai — 48 heures, par exemple — et affiche-le partout où le canal circule",
      "Fais passer une demande d'essai dans tout le circuit avant de lancer"
    ],
    [
      "Demande à une autre personne d'alterner avec toi les semaines de coordination",
      "Associe chaque demande à une personne qui conduit et prévois un renfort en cas d'annulation",
      "Confirme avec les deux côtés la veille, de vive voix ou par écrit",
      "Répartis les demandes sur toute la liste, pas seulement sur les deux fiables"
    ],
    [
      "Liste les trajets que vous prenez : médical, courses, démarches essentielles",
      "Dessine votre zone sur une carte et choisis de vraies rues comme limites",
      "Écris aussi clairement les non : pas d'urgences, pas de dernière minute, pas hors zone",
      "Accordez-vous sur l'attente et le port des sacs pour que tout le monde réponde pareil"
    ],
    [
      "Demande à tes conducteurs ce que l'essence leur coûte sur un trajet type",
      "Choisis un modèle : petite caisse commune, participations libres, ou rien",
      "Garde l'argent hors de la voiture — toute participation se fait ailleurs, discrètement",
      "Écris la règle en une phrase et partage-la avec qui conduit comme avec qui voyage"
    ],
    [
      "Crée dès maintenant le journal des trajets : date, qui conduit, qui voyage, destination, fait",
      "Écris les repères : on n'entre pas seul chez les gens, pas d'argent hors frais convenus",
      "Associe le premier trajet de chaque personne à un passager connu ou à un deuxième bénévole",
      "Prends des nouvelles des personnes vulnérables après chaque trajet et note ce qui cloche"
    ]
  ],
  "tenant-union": [
    [
      "Note cinq locataires que le voisinage respecte et écoute déjà",
      "Demande-toi qui sait garder une confidence — raye celles et ceux dont tu doutes",
      "Invite chaque personne à un café en tête-à-tête, pas à une réunion de groupe",
      "Pendant la discussion, demande ce que le syndicat devrait gagner en premier",
      "Termine en proposant un rythme de réunions et un rôle chacun"
    ],
    [
      "Imprime ou dessine un plan du quartier et marque les immeubles dont on se plaint",
      "Choisis un immeuble et frappe à dix portes avec quelqu'un cette semaine",
      "Demande ce qui est cassé, ce qui fait peur, et vers qui les voisins se tournent",
      "Demande la permission avant de noter l'histoire de qui que ce soit",
      "Code les logements dans tes notes et garde la clé des noms ailleurs"
    ],
    [
      "Cherche la page officielle des droits des locataires de ta ville et garde le lien",
      "Liste les chiffres qui comptent : délais d'avis, délais de réparation, dépôts",
      "Écris le texte de loi et la date de vérification à côté de chaque info",
      "Écris à une permanence juridique pour faire vérifier ton brouillon",
      "Tamponne chaque page « information, pas conseil juridique »"
    ],
    [
      "Crée tout de suite le groupe ou la liste de la chaîne téléphonique avec le comité",
      "Décidez qui répond en premier et qui prend le relais, avec des noms",
      "Accordez-vous sur un délai de réponse tenable — disons deux heures",
      "Faites un exercice : envoie une alerte test et chronomètre les réponses",
      "Corrige ce que l'exercice a cassé avant de diffuser le numéro"
    ],
    [
      "Écris à ton contact d'aide juridique : une personne pour animer et deux dates possibles",
      "Réserve une salle facile d'accès pour les locataires et fixe la date",
      "Imprime des guides à emporter dans les langues parlées dans tes immeubles",
      "Prépare la fin : l'échéance du tribunal et le numéro à appeler, répétés deux fois",
      "Invite par les personnes moteurs des immeubles, pas seulement par affichettes"
    ],
    [
      "Ouvre une page blanche intitulée « Si tu reçois des papiers d'expulsion »",
      "Mets l'échéance de réponse au tribunal en premier, en gras",
      "Liste la suite dans l'ordre : tout documenter, appeler l'aide juridique, prévenir le syndicat",
      "Ajoute « ne jamais manquer une audience » sur sa propre ligne",
      "Fais-le relire par ton contact d'aide juridique avant tout le monde"
    ],
    [
      "Commence une liste d'avocats de locataires, de permanences juridiques et de conseillers logement",
      "Appelle chacun et demande un contact nommé, ses horaires d'accueil et sa capacité réelle",
      "Note qui prend les urgences et qui a une liste d'attente",
      "Mets la feuille de contacts là où tout le comité peut la prendre",
      "Programme un rappel pour revérifier la feuille tous les trois mois"
    ]
  ],
  "childcare-collective": [
    [
      "Écris à deux familles de confiance : et si on échangeait la garde au lieu de la payer ?",
      "Fixe une soirée dans un salon, avec de quoi grignoter et une date ferme",
      "À la réunion, demande à chaque famille de dire tout haut ses règles discipline et écrans",
      "Termine la réunion sur une décision : coopérative à crédits ou garde de groupe planifiée",
      "Écris le modèle en un paragraphe et envoie-le à tout le monde le soir même"
    ],
    [
      "Écris la règle jamais-seul en haut d'une page blanche avant la réunion",
      "Liste ce que vous demanderez à chaque personne qui garde : références, vérifications utiles",
      "Fixez les ratios adultes-enfants par âge et écrivez les chiffres",
      "Dites-le tout haut ensemble : la règle pèse le plus avec les familles les plus proches",
      "Fais signer ou répondre « d'accord » à chaque famille fondatrice sur la liste finale"
    ],
    [
      "Écris à la famille au salon le plus probable et propose de le parcourir ensemble",
      "Mets-toi à quatre pattes à hauteur de tout-petit et note chaque danger",
      "Achète ou emprunte cache-prises, bloque-placards et sangles à meubles en une fois",
      "Enferme médicaments et produits ménagers dans un placard en hauteur et teste le loquet",
      "Fais le tour de l'extérieur et note portails, trous et points d'eau"
    ],
    [
      "Ouvre un calendrier partagé sur ton téléphone et ajoute un premier créneau d'essai",
      "Fais une feuille de crédits avec une ligne par famille : heures données, heures reçues",
      "Partage la feuille pour que chaque famille voie tous les soldes dès le premier jour",
      "Note qui accueille chaque créneau pour que la charge reste visiblement juste"
    ],
    [
      "Ouvre un document avec quatre titres : allergies, médicaments, contacts, qui récupère",
      "Remplis une ligne par titre et envoie le formulaire avec une semaine de délai",
      "Range les fiches remplies dans une chemise voyante à attraper en quelques secondes",
      "Écris la règle de l'enfant malade — fièvre, vomi, boutons — avant qu'un matin dur la teste",
      "Écris les gestes d'urgence en trois lignes et scotche-les dans la chemise"
    ],
    [
      "Écris au groupe pour trouver une date où toutes les personnes qui gardent ont deux heures",
      "Cherche une formation premiers secours pédiatriques et RCP près de chez vous et partage le lien",
      "Passez en revue surveillance, sommeil sûr et allergies avec les vraies fiches en main",
      "Répétez l'urgence à voix haute : qui appelle, qui reste avec les enfants, où sont les fiches"
    ],
    [
      "Écris à deux ou trois familles pour caler un pilote de deux heures à une date précise",
      "Garde le pilote petit : peu d'enfants, deux adultes, toutes les règles de sécurité actives",
      "Après, demande aux enfants comment ça s'est passé, pas seulement aux parents",
      "Débriefez honnêtement les presque-accidents et listez quoi corriger",
      "Fixe la date de la séance suivante seulement une fois les corrections validées"
    ]
  ],
  "community-composting": [
    [
      "Écris à la personne qui coordonne le jardin partagé pour demander un coin libre",
      "Debout sur chaque site possible, repère le robinet et la fenêtre voisine les plus proches",
      "Frappe aux portes les plus proches et parle odeurs et rats avant que l'inquiétude naisse",
      "Obtiens la permission de l'hôte par écrit et vérifie les règles locales de compost"
    ],
    [
      "Écris à quelqu'un qui a fait vivre un tas chaud et demande ce qu'il choisirait ici",
      "Estime tes restes hebdomadaires en seaux : les foyers fois à peu près un seau chacun",
      "Vérifie la règle du mètre cube : sans ce volume, le tas reste froid et n'avance pas",
      "Ajuste la méthode au retournage vraiment possible et note le choix"
    ],
    [
      "Demande au groupe qui a des palettes en trop, une fourche ou un thermomètre à compost",
      "Stocke la matière brune dès maintenant — feuilles en sacs ou carton aplati — avant les restes",
      "Construis ou achète la structure et installe-la à l'endroit convenu",
      "Fais une seule tournée pour ce qui manque : thermomètre, fourche, bac de dépôt"
    ],
    [
      "Écris à cinq foyers probables pour demander quel jour de dépôt les arrange",
      "Distribue des seaux de cuisine avec le calendrier de dépôt scotché sur chaque couvercle",
      "Dis à tout le monde d'éviter les sacs compostables — ils survivent au tas en lambeaux",
      "Affiche les horaires de dépôt sur le bac et dans le groupe de discussion"
    ],
    [
      "Écris la liste oui/non sur papier : fruits, légumes, café oui ; viande, laitages, huiles non",
      "Trouve ou dessine une image par élément — un os de poulet barré vaut mieux qu'un paragraphe",
      "Imprime-la résistante à la pluie et colle-la sur le couvercle même du bac, pas sur un poteau",
      "Demande à deux voisins qui parlent les autres langues du quartier de relire le texte"
    ],
    [
      "Demande à trois personnes fiables, par leur nom, un tour de retournage par mois",
      "Fais une séance pratique : retournez le tas ensemble et montre le test de l'éponge essorée",
      "Mets un nom sur chaque semaine du calendrier — « l'équipe », c'est personne",
      "Accroche un journal plastifié sur le site : date, température, humidité, qui a retourné"
    ],
    [
      "Écris au jardin partagé qu'un bac est presque prêt et demande la quantité qui l'intéresse",
      "Laisse le bac mûrir quelques semaines de plus et tamise les morceaux avant de promettre",
      "Annonce un jour de retrait aux personnes qui ont contribué : chacun apporte seaux ou sacs",
      "Garde une photo du tas fini pour la prochaine vague de recrutement"
    ]
  ],
  "free-little-library": [
    [
      "Cherche dans ton groupe de dons ou les petites annonces un meuble ou casier gratuit",
      "Dessine la boîte : toit en pente, porte vitrée, un rebord sous la porte contre la pluie",
      "Rassemble le matériel et construis-la en scellant le fond et chaque jointure",
      "Arrose-la une minute au jet et corrige partout où l'eau entre"
    ],
    [
      "Écris à la personne dont tu vises le jardin ou le mur et demande si ça lui va",
      "Debout sur place, vérifie qu'une poussette ou un fauteuil roulant passe sur le trottoir",
      "Renseigne-toi sur les autorisations si ce n'est pas un terrain privé",
      "Pose le poteau ou la fixation, puis secoue fort la boîte pour vérifier l'ancrage"
    ],
    [
      "Publie un message dans ton groupe pour demander des livres en bon état, surtout pour enfants",
      "Pose une caisse étiquetée devant chez toi ou sur place pour les dépôts, et laisse une semaine",
      "Retire tout ce qui est taché, moisi ou périmé avant que ça touche l'étagère",
      "Range un mélange à moitié plein, avec les livres pour enfants bien en vue"
    ],
    [
      "Écris « Prends un livre, laisse un livre — tout est gratuit » sur un brouillon",
      "Ajoute une ligne qui accueille tous les âges et toutes les langues",
      "Lis-le à voix haute et enlève tout ce qui sonne comme une obligation",
      "Fais le panneau final et fixe-le à l'intérieur de la porte, hors de portée de la pluie"
    ],
    [
      "Écris à la personne qui habite le plus près de la boîte et demande cinq minutes par semaine",
      "Retrouve-la une fois devant la boîte et faites un petit rangement ensemble",
      "Convenez de ce qui part à vue : le moisi, les titres pour adultes à portée d'enfants",
      "Demande à une deuxième personne d'assurer le relais pour les vacances et les imprévus"
    ]
  ],
  "community-first-aid-training": [
    [
      "Cherche le numéro de l'antenne locale de la Croix-Rouge et enregistre-le dans tes contacts",
      "Appelle pour parler d'un cours et demander s'ils renoncent aux frais pour les groupes locaux",
      "Demande leur plafond de personnes par mannequin et ce qu'il leur faut d'une salle",
      "Contacte un groupe de réduction des risques ou les services de santé pour la partie surdoses",
      "Note au même endroit les dates possibles de chaque personne formatrice"
    ],
    [
      "Écris à la personne formatrice pour savoir si elle apporte ses mannequins de RCP",
      "Envoie un courriel aux services de santé au sujet de la naloxone gratuite",
      "Compare le prix des trousses de premiers secours chez deux fournisseurs et choisis",
      "Le jour où la naloxone arrive, note sa péremption et range-la à l'intérieur, au frais"
    ],
    [
      "Liste trois salles possibles : bibliothèque, centre communautaire, centre de santé",
      "Visite l'une d'elles et vérifie sol dégagé, point d'eau et entrée accessible",
      "Demande si tu peux réserver le même jour chaque mois",
      "Croise les dates de la salle avec celles de qui forme et réserve les deux premières séances"
    ],
    [
      "Écris à deux personnes qui viendraient sûrement et demande à chacune d'amener quelqu'un",
      "Demande aux commerces voisins et aux groupes de proches de partager l'inscription",
      "Monte un formulaire gratuit avec deux créneaux pour les personnes en horaires décalés",
      "Propose une garde d'enfants et à manger, et dis-le dès l'invitation",
      "Prévois quelques places de plus et un message de confirmation la veille"
    ],
    [
      "Écris à la personne formatrice deux jours avant pour confirmer l'heure et le nombre",
      "Arrive une heure en avance pour installer le sol, la feuille d'accueil et de l'eau",
      "Ouvre en disant qu'on pratique sur mannequins et qu'on peut sortir pendant la partie surdoses",
      "Vérifie que chaque personne pratique avec ses mains, pas seulement depuis sa chaise",
      "Distribue les cartes mémo à la sortie"
    ],
    [
      "Compte tes trousses et tes doses de naloxone et écris le chiffre",
      "Remets une trousse à chaque personne en notant qui prend de la naloxone et sa péremption",
      "Mets le premier rappel au calendrier dans l'année, avant que le groupe se disperse",
      "Programme une alerte un mois avant la première péremption de naloxone pour renouveler"
    ]
  ],
  "time-bank": [
    [
      "Écris la liste de dix à quinze voisins avec qui tu pourrais vraiment t'asseoir",
      "Écris aujourd'hui aux trois premiers pour caler de courtes discussions en tête-à-tête",
      "À chaque discussion, demande une offre et insiste aussi pour un besoin",
      "Note chaque offre et chaque besoin dans une seule feuille au fil de l'eau",
      "Continue de recruter jusqu'à voir de la variété — trajets, réparations, soutien scolaire"
    ],
    [
      "Demande à la personne qui coordonnera quel outil elle utilise déjà chaque semaine",
      "Essaie d'enregistrer trois échanges fictifs dans un tableur tout simple",
      "Ne teste une appli de banque de temps que si le tableur a montré ses limites",
      "Vérifie que tout le registre s'exporte avant de t'engager sur quoi que ce soit",
      "Prends l'option la plus simple qui a tenu le test et note comment elle marche"
    ],
    [
      "Mets la réunion des règles au calendrier et invite les membres fondateurs",
      "Écris la première règle tout en haut : une heure vaut un crédit, sans exception",
      "Accordez-vous sur comment demander, confirmer et noter un échange",
      "Décidez dès maintenant ce qui se passe si un solde part ou reste très en négatif",
      "Tiens tout sur une page et lis-la à voix haute avant validation"
    ],
    [
      "Choisis une date et envoie aux membres une courte invitation à l'accueil",
      "Prépare dix minutes : la philosophie, puis un échange enregistré en direct",
      "Charge quelques crédits de départ sur le solde de chaque nouveau membre",
      "Avant que quiconque parte, fais-lui réserver un vrai échange sur place",
      "Relance sous une semaine quiconque n'a pas encore vécu son premier échange"
    ],
    [
      "Ouvre la feuille des membres et regroupe toutes les offres dans une seule liste",
      "Ajoute des colonnes pour quand et où chaque personne est disponible",
      "Écris aux membres dont la fiche n'a ni jours ni rayon de déplacement",
      "Publie l'annuaire là où les membres regardent déjà",
      "Mets un rappel mensuel dans ton calendrier pour élaguer les fiches périmées"
    ],
    [
      "Ouvre le registre et trouve aujourd'hui un besoin à relier à une offre",
      "Écris aux deux membres pour proposer la mise en relation et offrir de les présenter",
      "Repère qui a gagné sans jamais dépenser et écris à chaque personne par son nom",
      "Relance avec une idée précise un membre qui a adhéré sans encore échanger",
      "Note quelles mises en relation ont pris pour faciliter le mois suivant"
    ],
    [
      "Note trois repères de sécurité : références, premières rencontres en public, refus facile",
      "Ajoute une façon de décliner n'importe quelle mise en relation sans se justifier",
      "Nomme une personne — pas un formulaire — qui recueille les inquiétudes",
      "Apporte les repères à la prochaine réunion et ajustez-les à voix haute",
      "Affiche les repères finaux là où les gens s'inscrivent"
    ]
  ],
  "solidarity-fund": [
    [
      "Note les trois ou cinq personnes à qui tu confierais de l'argent mis en commun",
      "Écris à chacune pour demander une heure de conversation sur la caisse",
      "Parlez franchement des versements, de la transparence et des moments où l'argent manque",
      "Convenez que chaque personne se retire d'une décision quand un ami ou un proche demande",
      "Garde l'équipe en nombre impair pour que les votes ne se bloquent pas"
    ],
    [
      "Écris à une association locale ou experte en comptabilité pour un court appel de conseil",
      "Pose les questions légales et fiscales avant d'ouvrir quoi que ce soit",
      "Ouvrez un compte dédié ou passez par une association porteuse — jamais un compte personnel",
      "Mettez la règle par écrit : deux signatures pour chaque versement",
      "Ouvre le registre avec des colonnes date, montant, motif et qui a approuvé"
    ],
    [
      "Mets une réunion sur les critères au calendrier de l'équipe cette semaine",
      "Rédige un brouillon : qui peut demander, montants habituels, à quelle fréquence",
      "Fixez un plafond par demande et un total mensuel à ne pas dépasser",
      "Supprimez chaque preuve de difficultés dont vous pouvez vous passer",
      "Écrivez les critères finaux sur une page que toute l'équipe valide"
    ],
    [
      "Ouvre un formulaire vierge et mets trois champs : nom, contact, besoin",
      "Ajoute une question : comment veux-tu recevoir l'argent",
      "Supprime tout ce qui ressemble à un justificatif — ni numéro de pièce, ni lettre du propriétaire",
      "Prévois aussi la demande par téléphone et en personne, pas seulement en ligne",
      "Demande à une personne extérieure de l'essayer et de te dire où ça semble intrusif"
    ],
    [
      "Écris à cinq membres pour savoir qui donnerait un petit montant chaque mois",
      "Mets en place le don régulier avant de planifier toute grande collecte",
      "Écris la phrase pour les donateurs : l'argent va droit aux voisins en crise",
      "Annonce la caisse là où les membres discutent déjà et demande de faire passer",
      "Note chaque promesse de don dans le registre pour prévoir le mois suivant"
    ],
    [
      "Propose à l'équipe un engagement de délai — par exemple, une décision sous 48 heures",
      "Fixez un petit montant que deux personnes approuvent le jour même, sans réunion",
      "Listez les versements les plus rapides — espèces, virement, paiement direct de la facture",
      "Écrivez les étapes sur une page : qui lit, qui signe, qui verse",
      "Note chaque décision en une ligne : date, montant et les deux signatures"
    ],
    [
      "Ouvre le registre et note les trois chiffres du mois : entrées, sorties, voisins aidés",
      "Rédige un bilan de trois lignes avec uniquement des chiffres — jamais d'anecdotes",
      "Relis-le en vérifiant que rien ne peut identifier une personne aidée",
      "Publie-le là où donateurs et membres regardent déjà",
      "Refais-le à la même date chaque mois pour que les gens apprennent à y compter"
    ]
  ],
  "diaper-hygiene-bank": [
    [
      "Écris à quelqu'un d'une clinique, d'une paroisse ou d'une épicerie solidaire pour un placard libre",
      "Visite les deux lieux les plus prometteurs : humidité, nuisibles, porte qui ferme à clé",
      "Place-toi là où les familles viendraient et vérifie qu'on ne les voit pas de la salle d'attente",
      "Obtiens par écrit quel placard ou quelle étagère est à toi et qui garde la clé"
    ],
    [
      "Cherche « banque de couches » avec ta région et note le contact de la plus proche",
      "Écris au réseau ou à un grossiste pour le prix du carton des tailles 4, 5 et 6",
      "Liste trois lieux de collecte possibles — école, salle de sport, boulot — et écris à l'un d'eux",
      "Commence un suivi d'une page : source, ce qu'elle donne, sa régularité"
    ],
    [
      "Prends un marqueur et étiquette une étagère ou un bac par taille avant de toucher aux cartons",
      "Défais chaque carton en lots prêts à remettre en rangeant, pas plus tard à la porte",
      "Compte ce qu'il y a sur chaque étagère et note les totaux par taille sur une feuille",
      "Entoure les deux tailles les plus courtes et passe ces chiffres à qui gère l'approvisionnement"
    ],
    [
      "Appelle une banque de couches voisine et demande sa dotation mensuelle par enfant",
      "Rédige une phrase : combien par enfant, à quelle fréquence, et jamais de preuve de besoin",
      "Lis-la à deux bénévoles et à un parent et corrige tout ce qui sonne comme un examen",
      "Affiche le chiffre honnête là où les familles le voient, pour que personne n'ait à demander"
    ],
    [
      "Demande par message au lieu d'accueil quel jour et quelle heure fixes marchent chaque mois",
      "Écris à trois bénévoles possibles avec la date fixe et demande un oui durable",
      "Explique aux bénévoles la seule règle : remettre le paquet, ne rien demander",
      "Mets un rappel pour confirmer les renforts deux jours avant chaque distribution"
    ]
  ],
  "community-bike-workshop": [
    [
      "Écris à trois personnes qui pourraient prêter un garage, une cave ou un coin inutilisé",
      "Visite chaque option et mesure les murs pour suspendre les vélos à la verticale",
      "Vérifie les serrures et demande comment le lieu est sécurisé la nuit",
      "Règle stockage, horaires d'accès et assurance avec le lieu avant de dire oui"
    ],
    [
      "Demande dans la discussion de groupe qui a des outils vélo qui dorment dans un tiroir",
      "Demande à un magasin de vélos s'il donnerait des outils usés ou vendrait un pied d'occasion",
      "Liste ce qui manque encore — démonte-pneus, clés à cônes, coupe-câbles — et chiffre-le",
      "Accroche un panneau perforé et trace le contour de chaque outil pour voir ce qui manque"
    ],
    [
      "Note le non ferme dans ton téléphone : pas de vélos de supermarché rouillés",
      "Rédige un court appel aux dons avec ce non en tête, plus un jour et une adresse de dépôt",
      "Publie-le sur deux canaux du quartier",
      "Trie chaque arrivée sur place : réparable, pour pièces ou prêt à rouler",
      "Démonte vite les vélos pour pièces et range les pièces par type pour les retrouver"
    ],
    [
      "Écris aux deux meilleurs mécanos que tu connais et demande une permanence à chacun",
      "Demande à chacun de te guider pour réparer une crevaison sans toucher la roue",
      "Choisis ceux qui laissent une débutante batailler — cette patience est tout le travail",
      "Inscris le nom de chaque mécano sur un créneau précis de permanence au calendrier"
    ],
    [
      "Sonde la discussion de groupe pour les deux créneaux hebdo qui arrangent le plus de monde",
      "Écris les permanences sur la porte et publie-les chaque semaine aux mêmes endroits",
      "Résume « gagne ton vélo » sur une fiche : séances suivies, gestes appris, vélo gagné",
      "Fais une carte à tamponner pour chaque personne, lisible par n'importe quel mécano"
    ],
    [
      "Mets une trousse de secours et deux paires de lunettes de protection dans un sac pour l'atelier",
      "Écris les règles sur une affiche : lunettes, cheveux attachés, demander avant l'électroportatif",
      "Crée une fiche de sortie à signer : freins, pneus et direction pour chaque vélo",
      "Demande que cette dernière vérification soit signée par une autre personne que le monteur"
    ]
  ],
  "newcomer-translation-network": [
    [
      "Écris à deux personnes bilingues que tu connais pour savoir si elles aideraient à interpréter",
      "Note les trois langues que tu entends le plus dans les écoles et commerces du coin",
      "Demande à un prof de langue ou à une figure d'une communauté de foi de faire passer le mot",
      "Fais restituer une phrase médicale dans les deux sens avant de compter sur la personne",
      "Note chaque oui avec langue, dialecte et disponibilités au même endroit"
    ],
    [
      "Ouvre une note et liste les cinq services que tu connais déjà de nom",
      "Appelle un centre de santé aujourd'hui et demande quelles langues y sont vraiment parlées",
      "Note pour chaque adresse si on y demande des papiers ou le statut migratoire",
      "Demande à une association d'accueil quels lieux elle recommande et lesquels éviter",
      "Rassemble adresses, horaires et un nom de contact dans un seul annuaire partagé"
    ],
    [
      "Écris à un ou une bénévole pour proposer de prendre les appels pendant un mois d'essai",
      "Mets en place une seule ligne téléphonique ou un seul formulaire où tout arrive",
      "Limite la fiche à prénom, langue, besoin et numéro de rappel",
      "Mets en relation par langue et besoin, puis confirme avec les deux côtés",
      "Fais passer une demande d'essai d'un ami dans tout le circuit"
    ],
    [
      "Note les cinq questions qu'on te pose le plus souvent",
      "Rédige une page en langage simple sur le premier sujet, avec plus d'images que de texte",
      "Fais lire le brouillon à voix haute par quelqu'un de chaque communauté avant d'imprimer",
      "Imprime un petit premier lot, distribue-le et corrige ce qui embrouille"
    ],
    [
      "Demande à une personne arrivée récemment, avec un rendez-vous proche, si elle veut de la compagnie",
      "Trouve un ou une bénévole selon la langue et confirme l'heure et le lieu avec les deux",
      "Prépare la personne bénévole : interpréter à la première personne, sans ajouter ni conseiller",
      "Reprends des nouvelles des deux côtés après, et note quoi faire autrement la prochaine fois"
    ],
    [
      "Écris une ligne en haut de la fiche : ne jamais demander le statut migratoire",
      "Barre chaque champ du formulaire dont tu pourrais te passer pour travailler",
      "Décide combien de temps vivent les notes et cale le jour où tu les effaces",
      "Prépare ta réponse à une demande de dossiers : ce qui est gardé, ce qui n'est jamais recueilli",
      "Passe les règles en revue avec chaque bénévole avant sa première demande"
    ]
  ],
  "community-meal": [
    [
      "Liste trois salles avec cuisine : une paroisse, une maison de quartier, une école",
      "Appelle ou écris à l'une d'elles pour demander une visite",
      "Sur place, vérifie le lave-mains séparé, l'eau chaude et la place au frigo",
      "Confirme que la salle est libre aux jours que tu prévois",
      "Obtiens l'accord par écrit, même un court e-mail"
    ],
    [
      "Cherche le numéro des autorités sanitaires locales et note-le",
      "Appelle et demande précisément les allègements pour repas solidaires",
      "Inscris-toi dès maintenant à la formation en hygiène — elle se remplit des semaines à l'avance",
      "Affiche les règles de température et de stockage là où toute l'équipe les verra"
    ],
    [
      "Écris à un commerce ou un restaurant que tu connais pour parler de dons",
      "Visite deux autres fournisseurs en personne à une heure calme",
      "Engage chaque donateur sur un jour et une quantité précis, pas « ce qui reste »",
      "Demande au jardin partagé ou à l'équipe de glanage quel surplus ils peuvent envoyer",
      "Tiens une seule liste de qui donne quoi et quand, à jour après chaque repas"
    ],
    [
      "Regarde ta liste de sources et note ce que contiennent vraiment les dons de la semaine",
      "Choisis un plat principal naturellement végétarien, sans fruits à coque ni fruits de mer",
      "Adapte la recette sur papier et liste les quantités à acheter ou à demander",
      "Écris les étiquettes d'allergènes de chaque plat avant le jour de cuisine"
    ],
    [
      "Écris à cinq personnes et confie à chacune un rôle : préparer, cuisiner, servir ou nettoyer",
      "Ajoute deux noms de plus à chaque créneau que ce qu'il exige strictement",
      "Désigne qui mène la première cuisine et une seconde personne à former dès maintenant",
      "Partage le planning et confirme avec tout le monde deux jours avant le repas"
    ],
    [
      "Écris à trois personnes qui viendraient manger et demande quel jour et quelle heure leur vont",
      "Choisis un jour et une heure tenables pendant un an, pas les plus ambitieux",
      "Fais une affiche simple et chaleureuse : jour, heure, lieu, gratuit, bienvenue à tout le monde",
      "Dépose des affiches aux foyers, laveries et commerces de quartier",
      "Demande aux lieux d'accueil et partenaires de faire marcher le bouche-à-oreille"
    ],
    [
      "Écris à l'équipe la veille pour confirmer créneaux et heures d'arrivée",
      "Affiche le plan du jour dans la cuisine : qui prépare, cuisine, sert, nettoie",
      "Sers à table quand c'est possible plutôt qu'en file",
      "Mets les restes en bacs peu profonds et au frigo dans les deux heures après le service",
      "Laisse la cuisine prête pour un contrôle et note ce qui commence à manquer"
    ]
  ],
  "seed-library": [
    [
      "Cherche l'e-mail ou le téléphone de la bibliothèque et note le nom de qui la dirige",
      "Envoie un message pour demander s'ils accueilleraient un petit meuble à graines",
      "Visite et choisis un coin loin des fenêtres, des murs extérieurs et du chauffage",
      "Apporte une boîte de petits sachets et un marqueur à laisser près du meuble"
    ],
    [
      "Écris à une personne qui jardine depuis longtemps : quelles variétés poussent bien ici",
      "Écris à une pépinière voisine et à un jardin partagé pour les surplus de fin de saison",
      "Publie un seul appel aux dons de graines là où les membres regardent déjà",
      "Trie les dons à l'arrivée en écartant graines enrobées et hybrides brevetés"
    ],
    [
      "Prends la boîte de dons et sépare les sachets en légumes, aromatiques et fleurs",
      "Écris en grand le nom de la plante et l'année sur chaque sachet",
      "Marque d'une couleur les variétés faciles pour que les débutants se servent seuls",
      "Range chaque section avec les graines les plus vieilles devant",
      "Ajoute une courte note de culture aux variétés plus exigeantes"
    ],
    [
      "Ouvre une page blanche et écris les trois règles : prendre gratuitement, cultiver, rapporter si possible",
      "Ajoute une limite de deux ou trois sachets par variété et par personne",
      "Présente le retour comme un cadeau bienvenu, jamais une obligation",
      "Imprime la page et scotche-la à l'intérieur de la porte du meuble"
    ],
    [
      "Choisis un jour cette semaine pour passer voir le meuble et note-le dans ton agenda",
      "Retire tous les sachets de plus de deux ans",
      "Teste les lots douteux : dix graines dans un essuie-tout humide pendant une semaine",
      "Retire tout lot où moins de six graines germent",
      "Liste les trois variétés les plus vides et écris aux donateurs pour regarnir"
    ]
  ],
  "digital-literacy": [
    [
      "Publie un appel aux ordinateurs et tablettes inutilisés dans une discussion que tu as déjà",
      "À la remise, vérifie que la personne se déconnecte d'iCloud ou de Google avant de donner",
      "Prépare une caisse « fonctionne » et une caisse « pièces » et trie chaque appareil à l'arrivée",
      "Efface, mets à jour et teste un appareil de bout en bout avant d'enchaîner les autres"
    ],
    [
      "Ouvre une feuille vierge et crée cinq colonnes : qui, appareil, série, état, retour",
      "Numérote chaque appareil et son chargeur comme un seul lot avec des étiquettes assorties",
      "Écris en deux phrases la durée du prêt et une règle de retard sans reproche",
      "Fais un prêt d'essai avec un bénévole pour repérer ce qui manque au formulaire"
    ],
    [
      "Regarde la page de prêt de points d'accès de ta bibliothèque et note ce qu'elle propose",
      "Appelle deux opérateurs ou un programme à petit prix et demande le vrai plafond de données",
      "Imprime une demi-page des points WiFi gratuits près de chez les emprunteurs",
      "Teste un point d'accès avec un appel vidéo de dix minutes avant de le prêter"
    ],
    [
      "Écris à deux personnes patientes : accompagneraient-elles un débutant une fois par mois ?",
      "Écris trois règles sur une fiche : la personne qui apprend pilote, pas de jargon, pas de souris",
      "Fais le jeu de rôle : chacun guide une tâche complète sans toucher l'appareil",
      "Associe chaque nouvelle recrue à une vraie personne qui apprend et assiste à la première séance"
    ],
    [
      "Écris à une future apprenante et demande la chose qu'elle veut le plus faire en ligne",
      "Choisis les quatre premiers sujets et donne à chacun sa page — une compétence par page",
      "Capture les écrans exacts que les gens verront et colle-les en grand",
      "Donne un brouillon à une personne qui apprend et regarde où son doigt hésite"
    ],
    [
      "Demande par message au lieu d'accueil deux créneaux par semaine : un en journée, un en soirée",
      "Limite les inscriptions à six par cours pour que personne n'attende en silence au fond",
      "Trouve une deuxième personne pour circuler pendant les permanences, pour les cas épineux",
      "Mets le planning sur des affiches papier là où vont déjà les personnes que tu vises"
    ],
    [
      "Cherche les étapes de remise à zéro de tes deux modèles d'appareils les plus courants",
      "Scotche une liste au point de retour : sauvegarder d'abord les photos, effacer ensuite",
      "Écris en un paragraphe un plan perte ou casse qui laisse la porte ouverte",
      "Ajoute cinq minutes sur mots de passe et vie privée à chaque remise d'appareil"
    ]
  ],
  "weatherization-brigade": [
    [
      "Écris aux trois personnes les plus bricoleuses que tu connais : une journée de chantier par mois",
      "Affiche la demande sur les panneaux de la quincaillerie et du marchand de bois",
      "Demande à chaque bénévole les travaux vraiment déjà faits, pas ceux qui semblent faisables",
      "Associe chaque nouvelle recrue à une personne expérimentée sur un premier travail simple"
    ],
    [
      "Invite tes deux bénévoles les plus expérimentés à une heure de discussion sur le périmètre",
      "Liste les travaux que vous prenez : joints, bourrelets, barres d'appui, petites réparations",
      "Écris la liste « on s'arrête et on oriente » : électricité, gaz, toiture, structure",
      "Ajoute la peinture au plomb et les vieux isolants pour les logements anciens",
      "Imprime les deux listes sur une page pour chaque membre de l'équipe"
    ],
    [
      "Choisis le numéro de téléphone qui recevra les demandes et confirme-le à l'équipe",
      "Fais un formulaire papier et laisse des copies à l'épicerie solidaire et au club des anciens",
      "Rédige une liste de visite d'une page : périmètre, matériaux, limites de sécurité",
      "Prévois les visites d'évaluation à deux — deux personnes parcourent chaque logement",
      "Photographie tout pendant la visite et dis que tu confirmeras le plan plus tard"
    ],
    [
      "Reprends la liste de matériaux de la dernière visite et additionne les quantités",
      "Demande à la quincaillerie une remise ou un don pour la brigade",
      "Achète des mastics peu odorants et à faible COV pour les logements habités",
      "Étiquette une caisse à outils commune et note son contenu sur le couvercle"
    ],
    [
      "Écris à l'assureur ou à une association locale pour l'assurance des réparations bénévoles",
      "Obtiens par écrit que le contrat couvre bien la réparation bénévole à domicile",
      "Rédige une décharge simple et imprime des copies pour chaque foyer et bénévole",
      "Vérifie les trousses de secours et fixe la règle échelle : pieds tenus, jamais tout en haut"
    ],
    [
      "Choisis un samedi et répartis deux ou trois travaux déjà évalués entre les équipes",
      "Appelle chaque foyer la semaine d'avant pour convenir du plan et de l'heure d'arrivée",
      "Rappelle le matin même, pour que personne ne soit surpris par l'équipe",
      "Emporte eau, sacs-poubelle et matériel de nettoyage pour ne rien coûter au foyer",
      "Fais le tour du travail fini avec la personne qui habite avant de partir"
    ]
  ],
  "pet-food-bank": [
    [
      "Écris à qui coordonne le garde-manger pour partager espace et jour de distribution",
      "Visite le lieu et vérifie qu'il est sec, sans nuisibles et qu'il ferme à clé",
      "Compare le prix de bacs hermétiques et d'une étagère ou palette pour surélever le tout",
      "Confirme le point de distribution et les horaires avec la personne qui t'accueille"
    ],
    [
      "Appelle une animalerie et demande ce qu'elle fait des sacs déchirés ou abîmés",
      "Envoie une courte demande de dons à deux autres boutiques et à une clinique vétérinaire",
      "Fixe un jour de ramassage mensuel avec chaque partenaire qui dit oui",
      "Tiens un registre simple de ce qui entre chaque semaine pour repérer les manques"
    ],
    [
      "Prends un marqueur et étiquette trois bacs : chien, chat, autres",
      "Vérifie la date de péremption de chaque sac et retire ce qui est dépassé",
      "Mets à part les aliments vétérinaires et sur ordonnance dans leur propre bac étiqueté",
      "Compte chaque bac et affiche les totaux là où l'équipe peut les voir"
    ],
    [
      "Écris à une personne qui a des animaux et demande ce qu'ils mangent en un mois",
      "Fixe les portions selon le nombre et la taille des animaux, pas un sac unique par foyer",
      "Choisis une fréquence sur laquelle les gens peuvent compter — même quantité, même calendrier",
      "Écris la règle en un paragraphe, sans aucun justificatif de besoin exigé"
    ],
    [
      "Écris à deux bénévoles et demande quel jour récurrent chaque personne peut tenir",
      "Fixe le même jour et la même heure chaque mois pour qu'on puisse compter sur toi",
      "Avant chaque séance, vérifie qu'il y a de la nourriture pour chiens et chats sur la table",
      "Rappelle à l'équipe : aucun commentaire sur les choix de personne — on tend juste la nourriture"
    ]
  ],
  "youth-mentorship": [
    [
      "Écris à l'école, à la bibliothèque et au centre communautaire pour demander une salle",
      "Visite la meilleure option et vérifie les sorties, les toilettes et la place pour bouger",
      "Demande par écrit la même salle pour tout le trimestre, pas mois par mois",
      "Fixe les horaires hebdomadaires et partage-les avec les familles avant d'ouvrir"
    ],
    [
      "Télécharge comme modèle la politique de protection d'un programme jeunesse établi",
      "Écris l'exigence de vérification des antécédents : aucun adulte ne commence avant",
      "Détaille la règle des deux adultes : toilettes, trajets de retour et tutorat inclus",
      "Renseigne-toi sur l'obligation locale de signalement et note les étapes à suivre",
      "Fais signer la politique à chaque adulte avant sa première séance"
    ],
    [
      "Demande à deux groupes de confiance de suggérer chacun un adulte fiable",
      "À chaque entretien, demande sans détour : peux-tu venir chaque semaine, tout le trimestre ?",
      "Lance la vérification des antécédents le jour même où quelqu'un dit oui",
      "Anime une formation sur les limites, la sécurité et l'aide sans faire à la place"
    ],
    [
      "Demande à trois enfants ce qu'ils auraient vraiment envie de faire après l'école",
      "Dessine le rythme fixe sur une page : goûter, puis devoirs, puis activité",
      "Prépare les deux premières semaines d'activités avec les idées que les enfants ont citées",
      "Garde un temps chaque semaine que les jeunes programment eux-mêmes"
    ],
    [
      "Liste sur ton téléphone ce qu'il faut au formulaire : autorisation, allergies, contacts, sortie",
      "Rédige le formulaire d'inscription d'une page à partir de cette liste",
      "Donne-le aux familles en main propre et aide à le remplir sur place",
      "Affiche les allergies graves à la vue de l'équipe à l'heure du goûter, pas dans un classeur",
      "Confirme qui peut récupérer chaque enfant, puis range les formulaires sous clé"
    ],
    [
      "Écris à une épicerie ou une boulangerie pour un don de goûter hebdomadaire",
      "Écris la liste de courses sans fruits à coque par défaut",
      "Étiquette tout don dont tu ne peux pas garantir les ingrédients",
      "Publie un appel à livres, matériel d'art et jeux dans la conversation de la communauté"
    ],
    [
      "Mets une alarme pour arriver avant le premier enfant",
      "Installe la feuille de présence et le goûter avant l'ouverture",
      "Compte les têtes à l'arrivée et avant chaque départ ; note qui a récupéré qui",
      "Dis une chose positive et précise à un parent au moment de la sortie",
      "Note deux lignes après la fermeture : ce qui a marché, quel enfant a besoin d'attention"
    ]
  ],
  "gleaning-network": [
    [
      "Note de mémoire cinq sources proches : fermes, vergers, stands, arbres fruitiers chargés",
      "Visite ou appelle les deux plus probables et demande quel surplus reste sur pied",
      "Demande à chaque producteur ce qu'il ne faut PAS toucher et où se garer et marcher",
      "Note chaque oui avec la culture, la période approximative et un numéro de contact"
    ],
    [
      "Demande dans ta conversation de groupe qui pourrait tout lâcher un matin de semaine",
      "Demande à chaque oui sa disponibilité réelle, pas ses bonnes intentions",
      "Tiens la liste des oui fermes avec numéros — trois fiables valent mieux que dix peut-être",
      "Fais un appel d'essai et regarde qui répond vraiment dans l'heure"
    ],
    [
      "Écris à deux connaissances avec fourgon ou grand coffre et demande leurs jours de semaine",
      "Demande à une église, un resto ou une épicerie un coin frais pour garder le tout un jour",
      "Rassemble plus de cagettes que prévu — un seul arbre peut donner des centaines de kilos",
      "Écris le plan sur une fiche : qui conduit, où attend la nourriture, qui la répartit"
    ],
    [
      "Crée dès maintenant la conversation d'alerte et ajoute ton équipe confirmée",
      "Rédige un message type : culture, adresse, créneau horaire, quoi apporter",
      "Convenez que seuls les oui écrits comptent — une réponse, pas un pouce levé",
      "Envoie une alerte d'essai et chronomètre le temps que trois personnes mettent à confirmer"
    ],
    [
      "Cherche la loi du bon samaritain sur les dons alimentaires dans ta région",
      "Emprunte un modèle de décharge à un réseau de glanage déjà établi",
      "Écris la liste des interdits avec les producteurs : rien du sol pour les feuilles, rien de pourri",
      "Imprime décharges et règles de manipulation pour la pochette du jour de glanage"
    ],
    [
      "Écris à un frigo, garde-manger ou repas communautaire : que peuvent-ils écouler vraiment ?",
      "Demande à chaque débouché sa capacité et ses horaires de dépôt, et note les deux",
      "Assortis grosses récoltes et gros débouchés — un petit garde-manger n'absorbe pas 90 kilos",
      "Confirme dans chaque lieu une personne précise qui répond le jour de récolte"
    ],
    [
      "Mets dès ce soir un pèse-personne ou une balance à crochet dans le kit de glanage",
      "Fais d'abord le tour du site avec le producteur et repère ce qui est hors limites",
      "Pèse la récolte au champ avant de la répartir — impossible de la reconstituer après",
      "Livre en quelques heures et envoie à chaque producteur ses kilos avec un merci"
    ]
  ],
  "community-mediation": [
    [
      "Cherche le centre de médiation communautaire le plus proche et note son contact",
      "Appelle et demande les options de formation ou d'alliance",
      "Écris une courte liste de personnes posées et justes à qui tu confierais un différend",
      "Propose-leur en personne ; cherche qui reste neutre même en désaccord intérieur",
      "Réserve les dates de formation et confirme qui s'engage"
    ],
    [
      "Note deux options de point de contact unique : une adresse mail partagée ou un répondeur",
      "Mets en place celle que tu choisis et envoie-toi un message d'essai",
      "Rédige cinq questions d'accueil, dont une qui révèle une peur ou un rapport de force",
      "Écris en haut de la fiche d'accueil : « chaque partie séparément, jamais ensemble »",
      "Décide qui prend les appels d'accueil et sous quel délai vous répondez"
    ],
    [
      "Écris à la bibliothèque pour réserver une salle de réunion calme",
      "Visite-la et vérifie deux sorties et aucun coin où des proches pourraient traîner",
      "Confirme un terrain neutre — ni l'église ni l'immeuble d'une des parties",
      "Réserve une deuxième option pour que l'agenda n'impose jamais une mauvaise salle"
    ],
    [
      "Écris une phrase dans tes notes : ce qu'on prend, ce qu'on oriente ailleurs",
      "Liste les différends que vous prenez : bruit, espaces partagés, petits conflits de voisinage",
      "Nomme ce que vous ne touchez pas : toute situation de violence, d'abus ou de danger",
      "Monte la liste d'orientation maintenant : violences conjugales, juriste, ligne de crise",
      "Partage le périmètre écrit avec toute l'équipe de médiation et d'accueil"
    ],
    [
      "Écris les règles de base en cinq lignes simples dans tes notes",
      "Décide dès maintenant quoi faire si quelqu'un révèle une menace ou des violences en séance",
      "Formule la promesse de confidentialité avec cette limite, pour ne jamais trop promettre",
      "Mets-la en page sur une feuille que les parties lisent avant de commencer"
    ],
    [
      "Écris à un gestionnaire d'immeuble que tu connais : la médiation gratuite existe désormais",
      "Liste où émergent les conflits — syndics, gestionnaires, service logement — et va les voir",
      "Fais une petite affiche qui dit gratuit, volontaire et confidentiel",
      "Demande aux organisations alliées de passer ton contact aux deux parties d'un conflit qui couve"
    ],
    [
      "Ouvre une note avec trois décomptes : pris, orientés, résolus — jamais de noms",
      "Mets-la à jour juste après la clôture de chaque dossier",
      "Débriefe après chaque dossier difficile, pas seulement une fois par mois",
      "Fais tourner les dossiers pour que personne n'enchaîne les plus lourds",
      "Cale un point mensuel fixe avec chaque médiateur, même quand tout semble aller"
    ]
  ],
  "reentry-support": [
    [
      "Liste cinq services que tu connais déjà : papiers, hébergement, bureau des aides",
      "Appelle chacun pour confirmer qu'il existe et accueille les personnes avec un casier",
      "Note un contact avec un nom dans chaque lieu, pas juste le numéro de l'accueil",
      "Demande à une organisation de réinsertion quels employeurs seconde chance tiennent parole",
      "Ajoute une date « vérifié le » à chaque ligne de l'annuaire"
    ],
    [
      "Écris à deux personnes solides et sans jugement à qui tu confierais une histoire difficile",
      "Dans chaque échange, repère les réparateurs — tu cherches des partenaires, pas des sauveurs",
      "Demande à une organisation locale d'animer une formation sensible aux traumas pour l'équipe",
      "Repasse la confidentialité avec chaque bénévole avant toute première rencontre"
    ],
    [
      "Écris ta question d'ouverture sur une fiche : « De quoi as-tu le plus besoin, là ? »",
      "Tiens le formulaire sur une page — nom, trois besoins prioritaires, moyen de contact",
      "Répète l'échange une fois avec une personne bénévole dans l'autre rôle",
      "Convenez que le casier ne vient jamais sur la table sauf si la personne l'aborde"
    ],
    [
      "Appelle une organisation partenaire : peut-elle recevoir le courrier des personnes suivies ?",
      "Écris l'ordre sur papier : adresse postale, acte de naissance, papiers, puis aides",
      "Rassemble dans une pochette les vrais formulaires de ta région et le coût de chaque démarche",
      "Reste à côté de chaque personne pour sa première demande au lieu de lui tendre le papier"
    ],
    [
      "Écris à un contact employeur seconde chance et confirme qu'il embauche encore ce mois-ci",
      "Aide à rédiger un CV d'une page qui ouvre sur les savoir-faire et le travail récent",
      "Répétez ensemble, à voix haute, la question du casier avant tout entretien",
      "Rends chaque intro chaleureuse — un appel à une personne nommée, pas un lien d'offres",
      "Prends des nouvelles après chaque entretien ou visite et note comment ça s'est passé"
    ],
    [
      "Demande à une personne qui a vécu la réinsertion si le mentorat lui parlerait",
      "Associe chaque mentor à une seule personne, pas à une liste de dossiers",
      "Cale un point mensuel où les mentors eux-mêmes reçoivent du soutien",
      "Convenez de ce que gère un mentor et quand il passe le relais aux bénévoles ou aux pros"
    ],
    [
      "Ouvre un document et écris la première règle : rien ne se partage sans l'accord de la personne",
      "Liste exactement qui peut voir un dossier et ferme l'accès à tous les autres",
      "Décide ce que vous refusez d'écrire, tout simplement",
      "Oriente chaque question juridique vers ton contact juriste attitré, jamais vers le groupe",
      "Lis les règles à voix haute avec les bénévoles avant de commencer"
    ]
  ],
  "community-wood-bank": [
    [
      "Appelle un élagueur du coin et demande où part son bois aujourd'hui",
      "Note d'autres pistes : équipes après tempête, la commune, terrains aux arbres tombés",
      "Visite la meilleure piste et regarde le bois : essence, taille, à quel point il est vert",
      "Obtiens une autorisation écrite qui dit quoi prendre et où passe la limite de propriété"
    ],
    [
      "Note trois cours possibles : le terrain d'une église, un coin de ferme, la parcelle d'un membre",
      "Demande à chaque propriétaire une visite cette semaine",
      "Mesure pour deux ans de bois — la pile sèche de cet hiver plus celle du prochain en séchage",
      "Pendant la visite, vérifie l'accès camion, la tolérance au bruit du voisinage et le drainage",
      "Obtiens un accord écrit couvrant bruit de tronçonneuse, horaires et durée d'empilage"
    ],
    [
      "Écris la liste : fendeuse, deux tronçonneuses et protection complète par personne",
      "Publie un appel au prêt ou au don auprès des membres et des groupes ruraux du coin",
      "Compare le prix des jambières et protections yeux-oreilles par personne — rien de partagé",
      "Fais inspecter chaque outil donné par quelqu'un qui s'y connaît avant de l'accepter",
      "Prépare une trousse de premiers secours et regroupe tout à un endroit étiqueté sur place"
    ],
    [
      "Écris aux membres et au voisinage pour savoir qui a une vraie expérience de tronçonneuse",
      "Nomme une personne expérimentée référente sécurité, avec le dernier mot pour arrêter",
      "Demande à la chambre d'agriculture ou à un bûcheron un cours de base de tronçonneuse",
      "Répartis l'équipe : les personnes formées aux tronçonneuses, les autres empilent et portent",
      "Écris le point sécurité de cinq minutes à faire avant chaque journée de chantier"
    ],
    [
      "Demande au groupe quel numéro de téléphone peut recevoir les demandes de bois",
      "À chaque demande, demande où poser le bois et s'il y a un chemin dégagé et sec",
      "Liste les membres avec camionnette et associe chaque personne à un jour de livraison",
      "Appelle le service d'aide au chauffage et demande-lui de faire circuler ton numéro",
      "Empile toi-même la première livraison pour mesurer le temps que prend un foyer"
    ],
    [
      "Écris à deux foyers chauffés au bois et demande ce qu'ils brûlent dans un mois froid",
      "Définis les parts en termes réels — stères ou semaines de chauffe, pas « un chargement »",
      "Écris qui passe en premier : personnes âgées, besoins médicaux, enfants, aucun autre chauffage",
      "Demande peu : ni preuve ni paperasse, juste nom, adresse et type de poêle",
      "Mets au calendrier un point de mi-hiver pour les foyers restés à court"
    ],
    [
      "Compte à rebours depuis novembre : marque la date limite de printemps pour couper",
      "Mets les deux premières journées de chantier au calendrier et invite l'équipe formée",
      "Ouvre un registre simple par pile : date de fente, essence, date où il sera prêt",
      "Marque chaque pile sec ou vert pour que personne ne livre du bois humide dans l'urgence",
      "Mets un rappel mensuel pour tenir le registre et caler la prochaine journée de chantier"
    ]
  ],
  "community-wifi-mesh": [
    [
      "Imprime ou dessine un plan des rues que tu veux couvrir",
      "Parcours les rues plan en main, en marquant arbres, murs de briques et bâtiments hauts",
      "Frappe aux portes et demande qui n'a pas de connexion et ce qu'il en ferait",
      "Étoile les toits et fenêtres hautes avec vue dégagée et des propriétaires partants",
      "Photographie le plan annoté et partage-le avec le groupe"
    ],
    [
      "Note trois candidats avec de la marge : un commerce, la bibliothèque, un fournisseur ouvert",
      "Écris ou passe voir l'un d'eux aujourd'hui et pose franchement la question du partage",
      "Lis toi-même les conditions de l'abonnement à la recherche d'une interdiction de repartage",
      "Obtiens l'accord de redistribution par écrit avant de dépenser un sou en matériel"
    ],
    [
      "Écris aux deux personnes les plus à l'aise en réseaux que tu connais et demande une heure",
      "Publie un seul appel dans les groupes tech, fablabs ou clubs de radioamateurs du coin",
      "Vise deux admins aux métiers et adresses différents, plus une personne qui veut apprendre",
      "Fais un petit lancement où chaque admin se connecte soi-même à un routeur d'essai"
    ],
    [
      "Publie un appel aux routeurs inutilisés dans les groupes et conversations du coin",
      "Liste les nœuds et antennes que demande ton plan et chiffre ce que les dons ne couvrent pas",
      "Mets un mot de passe admin solide sur chaque routeur et range-le dans le gestionnaire partagé",
      "Configure chaque nœud sur une table et étiquette-le avec son emplacement prévu",
      "Teste deux nœuds en maille le long de ta propre rue avant de grimper sur un toit"
    ],
    [
      "Écris aux trois lieux étoilés les plus accueillants de ton plan pour demander une visite",
      "Visite chacun avec un nœud en main et vérifie courant, point de fixation et ligne de vue",
      "Rédige un accord d'une page : accès au toit, sous d'électricité, responsabilité des dégâts",
      "Signe-le avec chaque hôte et propose de couvrir les quelques sous d'électricité mensuels"
    ],
    [
      "Ouvre une page blanche et écris la règle numéro un : à quoi sert le réseau",
      "Ajoute la promesse de non-enregistrement et qu'un réseau ouvert n'est pas privé",
      "Désactive les journaux dans les réglages de chaque routeur et fais vérifier par le deuxième admin",
      "Ajoute une ligne qui renvoie vers HTTPS et les VPN pour la sécurité de chacun",
      "Affiche la page chez les hôtes et comme page d'accueil du réseau"
    ],
    [
      "Mets un rappel mensuel sur ton téléphone pour vérifier chaque nœud",
      "Étiquette chaque nœud avec son emplacement et une date de contrôle",
      "Garde un routeur de rechange configuré et chargé pour un échange en quelques minutes",
      "Rédige la doc au fil de l'eau et fais-la suivre une fois au deuxième admin sans toi",
      "Tiens une liste d'attente d'hôtes et ajoute un nœud quand le réseau tourne stable"
    ]
  ],
  "mental-health-peer-support": [
    [
      "Écris à deux personnes chaleureuses et posées : envisageraient-elles d'animer ?",
      "Cherche une formation proche au soutien entre pairs ou à l'écoute active et note les dates",
      "Demande à chaque personne candidate comment gérer une salle muette après une confidence",
      "Écarte avec douceur quiconque est encore à vif de sa propre crise — pour l'instant",
      "Réserve la formation et confirme que les deux personnes peuvent tenir chaque rencontre"
    ],
    [
      "Mets un minuteur de 20 minutes et écris un brouillon de ce que le cercle ne fera pas",
      "Formule les limites en interdits : pas de diagnostic, pas de réparation, pas de thérapie bis",
      "Ajoute trois lignes simples sur ce que c'est : écoute, compagnie, expérience partagée",
      "Lis le brouillon à voix haute à une personne animatrice et coupe ce qui la fait buter"
    ],
    [
      "Cherche la ligne de crise locale et la clinique sans rendez-vous la plus proche ; note les deux",
      "Appelle toi-même chaque numéro pour confirmer qu'il répond et note les horaires",
      "Écris les étapes en pleine séance : mettre en pause, parler à part, passer le relais en douceur",
      "Imprime une copie pour chaque personne animatrice — le soir venu, le wifi peut lâcher"
    ],
    [
      "Note trois salles possibles : la bibliothèque, un lieu de culte, un centre communautaire",
      "Visite la meilleure et vérifie une porte qui ferme et pas de parois vitrées",
      "Demande à l'hôte qui d'autre utilise le bâtiment pendant votre heure",
      "Cale la même salle, à la même heure, chaque semaine — la constance donne envie de revenir"
    ],
    [
      "Note les cinq règles que tu sais déjà nécessaires, en commençant par la confidentialité",
      "Ajoute le droit de passer son tour et pas de conseils si personne n'en demande",
      "Demande aux deux personnes animatrices de réécrire le brouillon en mots plus simples",
      "Imprime-le assez grand pour le lire à voix haute au début de chaque rencontre"
    ],
    [
      "Pose une seule question par message à l'équipe : quel soir tenir pendant six mois ?",
      "Évite le vendredi soir et la sortie du travail — choisis une heure plus douce",
      "Écris une annonce sans stigmate : gratuit, entre pairs, aucun diagnostic requis",
      "Envoie-la aux cliniques, aux groupes de foi et sur le tableau de la communauté",
      "Décide dès maintenant le plafond d'environ huit personnes et quoi faire au-delà"
    ],
    [
      "Mets tout de suite au calendrier un point mensuel avec l'équipe d'animation",
      "Tenez-le ailleurs que dans la salle du cercle — un café fait l'affaire",
      "Demande à chaque personne animatrice quels moments de séance lui sont restés",
      "Mets en place une rotation pour que personne ne mène trois rencontres de suite",
      "Repère qui ne manque jamais et ne se repose jamais — offre-lui la première pause"
    ]
  ],
  "community-cleanup": [
    [
      "Prends en photo le coin le plus sale que tu croises en rentrant chez toi aujourd'hui",
      "Marche deux rues de plus et photographie chaque coin qui mérite du travail",
      "Demande à deux personnes du coin quel terrain les dérange le plus et à qui il est",
      "Repasse voir tes sites favoris à une autre heure — matin et soir racontent autre chose",
      "Classe la liste selon l'impact et la faisabilité de chaque site en une journée"
    ],
    [
      "Cherche le propriétaire du site prioritaire au cadastre ou demande à un voisin de longue date",
      "Appelle ou écris au propriétaire pour une autorisation écrite avec la date envisagée",
      "Appelle la mairie pour un ramassage d'encombrants et note le numéro de référence donné",
      "Sinon, demande le prix d'une benne et confirme par écrit les dates de dépôt et de retrait"
    ],
    [
      "Demande dans le groupe qui a déjà des gants, des pinces à déchets et des gilets fluo",
      "Achète un collecteur rigide à aiguilles et deux paires de gants anti-perforation",
      "Compte sacs et gants selon ta liste d'inscriptions et complète en un seul trajet",
      "Emballe tout la veille dans des bacs étiquetés, le collecteur à aiguilles sur le dessus"
    ],
    [
      "Publie tout de suite la date, le lieu et l'heure de rendez-vous sur deux canaux du quartier",
      "Tiens une liste d'inscriptions et recrute un tiers de plus que ce qui te semble nécessaire",
      "Demande à trois personnes fiables d'être responsables d'équipe et confirme chacune par son nom",
      "Découpe le site en zones sur un croquis et attribue une zone à chaque responsable avant le jour J"
    ],
    [
      "Écris ce soir la carte d'accueil : zones, responsables, eau, jamais d'aiguilles à main nue",
      "Arrive en avance et prends les photos d'avant depuis un point où tu pourras te replacer",
      "Lis la carte d'accueil à tout le monde, puis envoie chaque équipe avec son ou sa responsable",
      "Fais le tour des zones en milieu de matinée pour réapprovisionner sacs, eau et encouragements",
      "Prends les photos d'après depuis les mêmes points, partage le duo et fixe la prochaine date"
    ]
  ],
  "free-tax-prep": [
    [
      "Cherche les dates de certification VITA de cette année et où se donne la formation",
      "Demande à trois personnes partantes si elles peuvent s'engager sur toute la formation",
      "Inscris tout le monde avant la fin de l'automne — certifier prend des semaines, pas des jours",
      "Cale une séance de révision en groupe avant l'examen de certification"
    ],
    [
      "Trouve le courriel de la coordination régionale et envoie deux lignes de présentation",
      "Réserve un appel et demande ce qu'il faut à un nouveau site : logiciel, règles, revue qualité",
      "Note leur calendrier avant de promettre une date d'ouverture à qui que ce soit",
      "Renvoie les papiers qu'il leur faut pour t'ajouter comme site"
    ],
    [
      "Écris à deux lieux avec salles et wifi — une bibliothèque, une maison de quartier",
      "Fais un test de débit sur ton téléphone dans chaque lieu ; le logiciel cale sur un envoi faible",
      "Compte prises et tables, et vérifie qu'on peut espacer les chaises pour l'intimité",
      "Réserve le local pour toute la saison, pas semaine par semaine"
    ],
    [
      "Demande au programme partenaire sa liste standard des documents requis",
      "Choisis un mode de réservation utilisable par téléphone, pas seulement en ligne",
      "Glisse la liste des documents dans chaque confirmation et chaque rappel",
      "Fais toi-même une réservation test et corrige ce qui prête à confusion"
    ],
    [
      "Rédige une ligne — « Impôts gratuits ; on te doit peut-être un remboursement » — et teste-la sur un ami",
      "Imprime des affichettes avec dates, lieu et la liste des documents au dos",
      "Dépose-les là où les travailleurs passent déjà : laveries, épiceries de quartier, arrêts de bus",
      "Vise les gens qui pensent gagner trop peu pour que déclarer vaille la peine"
    ],
    [
      "Liste chaque endroit où des données pourraient vivre : portables, clés USB, la pile de papier",
      "Écris la règle de conservation : rien ne rentre à la maison, et une date fixe pour déchiqueter",
      "Active le verrouillage d'écran et des comptes séparés sur chaque portable du site",
      "Trouve une caisse à clé pour le papier et une déchiqueteuse pour le jour de destruction"
    ],
    [
      "Note trois adresses locales : vérification des aides, banque sûre, aide au budget",
      "Appelle chacune pour confirmer qu'elle accueille du monde et comment orienter quelqu'un",
      "Prépare une petite carte à emporter, proposée une fois la déclaration finie — jamais à table",
      "Accorde-toi avec l'équipe sur la phrase unique pour la proposer, sans argumentaire"
    ]
  ],
  "community-market": [
    [
      "Note trois sources possibles : une ferme, une épicerie, un jardin partagé",
      "Va voir chacune et demande quel surplus elle a vraiment et à quel rythme",
      "Fixe par écrit le jour et le volume approximatif de chacune, pas un « quand il en reste »",
      "Ajoute une source de secours pour qu'une mauvaise semaine ne vide pas le stand"
    ],
    [
      "Note deux ou trois emplacements possibles là où les gens passent déjà",
      "Va sur chacun à l'heure réelle du marché et compte qui passe",
      "Vérifie l'ombre et un point d'eau à proximité",
      "Demande la permission au responsable des lieux et obtiens-la par message ou courriel",
      "Rassemble des tables, un barnum et une pancarte simple"
    ],
    [
      "Écris à ton équipe de base pour caler une discussion de 20 minutes",
      "Parlez de gratuit, prix libre ou mélange, et de ce que « personne refusé » veut dire",
      "Si prix libre, convenez d'une seule boîte sans inscription ni prix suggéré affiché",
      "Notez le choix en une phrase que chacun peut répéter à la table"
    ],
    [
      "Envoie un message groupé : qui a déjà glacières, tables et pains de glace ?",
      "Prévois glacières et glace pour tout ce qui est feuillu ou découpé",
      "Planifie l'ombre sur les produits : un barnum ou le côté ombragé du terrain",
      "Convenez en équipe de la règle de tri : dans le doute, au compost"
    ],
    [
      "Écris à trois personnes fiables et demande quel rôle du marché elles prendraient",
      "Remplis d'abord les créneaux ingrats : la tournée de collecte du matin et le remballage",
      "Nomme un remplaçant pour chaque rôle pour qu'une absence n'annule pas le marché",
      "Affiche le planning à la vue de tous et confirme deux jours avant chaque marché"
    ],
    [
      "Envoie à l'équipe deux options de jour et d'heure et demande un vote rapide",
      "Fais une affichette simple : jour, heure, lieu et « gratuit, tout le monde est bienvenu »",
      "Affiche-la là où les gens passent déjà : laverie, arrêt de bus, épicerie du coin",
      "Dis-le en personne aux voisins rencontrés en repérage pour qu'ils l'entendent de vive voix",
      "Mets le marché en événement récurrent dans le calendrier partagé, même les semaines maigres"
    ],
    [
      "Avant le marché, écris à un frigo partagé, un garde-manger ou un programme de repas pour les restes",
      "Arrive en avance pour monter tables, ombre et glacières",
      "Accueille les gens avec chaleur, sans formulaires, sans questions, sans trier personne",
      "À la fermeture, apporte le surplus directement au point de dépôt convenu",
      "Note ce qui a manqué et ce qui est resté pour le plan de la semaine suivante"
    ]
  ],
  "welcome-wagon": [
    [
      "Écris à deux ou trois voisins intéressés pour fixer un moment d'échange cette semaine",
      "Choisissez ensemble la cible : nouveaux résidents, nouveaux parents, ou les deux",
      "Convenez que le premier contact est un mot ou un appel — jamais frapper à l'improviste",
      "Rédige l'offre en une ligne, à laquelle on peut dire oui ou non"
    ],
    [
      "Commence une liste sur ton téléphone : clinique, transports, écoles, aide alimentaire, ton réseau",
      "Appelle ou vérifie chaque adresse pour confirmer horaires et lieux à jour",
      "Écris la date et un contact « signaler un changement à… » en première page",
      "Demande à une personne bilingue de le traduire dans les langues parlées autour"
    ],
    [
      "Publie une demande dans le groupe du quartier : bases d'épicerie et articles de maison",
      "Choisis un lieu et une date pour composer les cinq premiers paniers",
      "Reste sur du longue conservation et sans parfum, sauf si tu connais le foyer",
      "Glisse dans chaque panier le livret d'infos et un bonjour écrit à la main"
    ],
    [
      "Écris aux deux personnes les plus chaleureuses que tu connais et propose-leur d'accueillir",
      "Retrouvez-vous une heure et jouez ensemble une visite au pas de porte",
      "Répétez la version courte : remettre le panier, donner un contact, repartir",
      "Convenez d'un signal pour « préfère qu'on la laisse tranquille » et respectez-le"
    ],
    [
      "Liste qui rencontre les nouveaux en premier : propriétaires, écoles, cliniques, sages-femmes",
      "Visite ou appelle chacun et présente le comité d'accueil en deux minutes",
      "Demande-leur d'obtenir l'accord de la personne avant de transmettre un nom",
      "Crée un petit formulaire d'accord et laisse des copies chez chaque partenaire"
    ]
  ],
  "library-of-things": [
    [
      "Tape dix objets candidats dans tes notes : tables, tente, shampouineuse, perceuse",
      "Ajoute une ligne libre et la question : qu'aurais-tu utilisé dans la dernière année ?",
      "Publie le sondage sur le tableau et remets des copies papier à cinq voisins",
      "Dépouille les réponses après une semaine et classe les dix objets les plus demandés"
    ],
    [
      "Écris à la bibliothèque municipale ou à la maison de quartier pour un placard ou une salle",
      "Mesure les deux objets demandés les plus encombrants — ils dimensionnent l'espace qu'il faut",
      "Visite la meilleure option avec un mètre et mesure aussi la largeur de la porte",
      "Convenez d'heures de retrait et de retour tenables pour l'hôte, et notez-les"
    ],
    [
      "Publie la liste des dix objets recherchés du sondage — pas un appel ouvert à tout",
      "Fixe un jour de dépôt unique et demande d'apporter câbles, sacs et pièces avec",
      "Branche et fais tourner chaque appareil électrique avant qu'il gagne sa place en rayon",
      "Vérifie le motorisé et les articles enfants contre la liste des rappels (CPSC)",
      "Mets les refus en carton pour la déchetterie le jour même, pour que rien ne s'entasse"
    ],
    [
      "Numérote vingt étiquettes de ruban adhésif et colle la première sur un objet",
      "Photographie chaque objet juste à côté de son numéro, sous une bonne lumière",
      "Enregistre numéro, nom, état et photo — une ligne de tableur par objet",
      "Donne aux accessoires — sacs, câbles, embouts — leurs propres lignes numérotées"
    ],
    [
      "Note tes cinq objets les plus demandés et estime la vitesse de rotation de chacun",
      "Fixe des durées par objet : un week-end le vidéoprojecteur, une semaine la shampouineuse",
      "Écris une politique de retard indulgente — un petit rappel amical, jamais d'amende",
      "Note en une ligne quels objets demandent un soin ou un nettoyage particulier au retour",
      "Demande à un ou une bibliothécaire bénévole de lire les règles et de couper ce qui embrouille"
    ],
    [
      "Trace une fiche de sortie à quatre colonnes : nom, contact, objet, date de retour",
      "Ajoute l'étape que tout le monde saute : photo d'état à la sortie et une autre au retour",
      "Guide les deux bibliothécaires dans un prêt d'entraînement, du début à la fin",
      "Regarde chaque bibliothécaire faire un prêt en solo avant le jour d'ouverture"
    ],
    [
      "Scotche une feuille « demandes non satisfaites » à côté de la fiche de sortie",
      "Nettoie et inspecte chaque retour le jour même, pas par lots",
      "Fixe une heure de réparation mensuelle et garde le réparable là où tu le verras",
      "Achète ou déniche l'objet en tête de la liste d'attente — pas ta propre intuition"
    ]
  ],
  "laundry-shower-access": [
    [
      "Note trois hôtes possibles : une laverie, une salle de sport, un lieu de culte avec douches",
      "Appelle le plus accueillant et demande une visite de quinze minutes cette semaine",
      "Parcours le trajet de la salle d'attente à la douche — est-il vraiment privé ?",
      "Dis franchement à l'hôte qui viendra et quel ménage ton équipe prendra en charge",
      "Confirme les jours et conditions convenus dans un message ou courriel de suivi"
    ],
    [
      "Écris la liste des besoins : lessive, serviettes, savon, shampoing, tongs",
      "Demande du format voyage et sans parfum dès l'annonce de dons",
      "Appelle une paroisse ou un commerce pour couvrir le premier mois",
      "Range les arrivées en kits de douche — un sac par personne, prêt à donner"
    ],
    [
      "Écris à l'hôte pour confirmer combien de machines et de douches par session",
      "Fais une feuille d'inscription papier qui demande un prénom — ou rien du tout",
      "Décide la règle des tours — ordre d'arrivée, habitués, ou un mélange — et affiche-la",
      "Fais tourner une session entière sur papier avant de tenter plus sophistiqué"
    ],
    [
      "Demande à l'hôte quels produits de ménage il exige entre les passages",
      "Chronomètre un nettoyage complet de cabine : désinfecter, serpillière, serviette propre",
      "Intègre ces minutes à chaque créneau pour que personne n'hérite d'une cabine sale",
      "Écris la routine en liste à cocher et scotche-la dans le placard à fournitures",
      "Convenez avec l'hôte de qui réapprovisionne et qui gère les soucis de plomberie"
    ],
    [
      "Écris à trois personnes patientes et imperturbables que tu verrais bien à l'accueil",
      "Accompagne chaque recrue sur une session complète avant de la laisser tenir l'accueil",
      "Répétez ensemble les scénarios délicats : une personne ivre, un créneau qui déborde",
      "Convenez de qui on appelle en premier — pour que personne n'appelle l'hôte en panique",
      "Donne le ton sans détour : on accueille comme un hôtel, pas comme une clinique"
    ],
    [
      "Pose une seule question à tes bénévoles : quelles heures hebdo peux-tu tenir six mois ?",
      "Cale l'horaire sur le tenable, pas sur l'impressionnant",
      "Imprime des cartes simples avec heures et lieu — sans mention de paperasse",
      "Distribue les cartes aux travailleurs de rue, aux hébergements et aux voisins de la rue",
      "Tiens les heures fixes — une seule semaine changée apprend que la porte peut être fermée"
    ]
  ],
  "voter-registration": [
    [
      "Cherche tout de suite le téléphone et le courriel de ton bureau électoral",
      "Appelle et demande ce qu'une campagne d'inscription peut faire ou non chez toi",
      "Note la date limite exacte de remise et qui peut légalement déposer les formulaires",
      "Demande si les bénévoles doivent être formés ou enregistrés avant de tenir un stand",
      "Écris à un groupe non partisan établi pour emprunter supports et conseils"
    ],
    [
      "Propose aujourd'hui à tes bénévoles deux créneaux pour une formation d'une heure",
      "Écris la réponse type au « pour qui je devrais voter ? » sur une carte pour chacun",
      "Parcourez ensemble un vrai formulaire d'inscription, champ par champ",
      "Jouez une question politique insistante jusqu'à ce que la réponse neutre vienne seule"
    ],
    [
      "Ouvre la page officielle du bureau électoral et mets-la en favori",
      "Imprime dates limites, règles de pièce d'identité et infos de vote depuis cette page",
      "Écris la date du jour sur chaque impression pour repérer les copies périmées",
      "Récupère des formulaires vierges au bureau électoral lui-même"
    ],
    [
      "Liste cinq endroits où les gens se retrouvent déjà — marché, transports, campus",
      "Écris au responsable de chaque lieu pour demander la permission d'installer une table",
      "Obtiens le oui par écrit, même un simple courriel, avant de planifier une permanence",
      "Associe chaque lieu confirmé à une date et une heure au calendrier"
    ],
    [
      "Écris la liste du kit sur ton téléphone : formulaires, stylos, supports, fiches datées",
      "Prépare le kit la veille et pose-le près de la porte",
      "Désigne une personne qui garde la pochette fermée des formulaires toute la permanence",
      "Relis chaque formulaire avec la personne avant qu'elle quitte la table",
      "Dépose la pochette au bureau électoral le jour même, bien avant la date limite"
    ],
    [
      "Cherche le lien officiel pour trouver son bureau de vote et garde-le sur ton téléphone",
      "Prépare une carte format poche : date de l'élection, ce lien, date limite du vote par correspondance",
      "Imprime une pile et range-les dans le kit à côté des formulaires",
      "Donnes-en une à chaque personne inscrite et demande si elle aura besoin d'un trajet pour voter"
    ]
  ],
  "health-navigation": [
    [
      "Cherche « clinique gratuite près de chez moi » et colle les trois premiers résultats dans un doc",
      "Appelle chacune pour la ligne directe d'accueil et les règles d'éligibilité en vigueur",
      "Ajoute des colonnes langues, tarif solidaire et date de vérification de chaque entrée",
      "Pose un rappel récurrent pour revérifier chaque entrée avant qu'elle se périme"
    ],
    [
      "Écris à trois personnes patientes et organisées : partantes pour accompagner ?",
      "Écris la limite en une ligne : logistique et démarches oui, avis médical jamais",
      "Répète les mots exacts : « la médecine, ce n'est pas moi — je te passe une ligne infirmière »",
      "Joue un appel de personne effrayée avec chaque nouvel accompagnant"
    ],
    [
      "Demande dans le groupe qui peut prêter un numéro de téléphone pour l'accueil ce mois-ci",
      "Configure la messagerie vocale avec un accueil chaleureux dans les langues servies",
      "Ajoute une option en personne : des heures fixes en bibliothèque ou maison de quartier",
      "Décide ce que tu n'écriras jamais — diagnostics, statut migratoire — avant le premier appel"
    ],
    [
      "Vérifie aujourd'hui si la période d'inscription ouverte est en cours chez toi",
      "Imprime la liste des documents : justificatif de revenus, taille du foyer, pièce d'identité",
      "Réunis les documents avec chaque personne avant d'ouvrir sa demande",
      "Trouve une personne certifiée en inscriptions pour t'épauler sur ton premier dossier"
    ],
    [
      "Enregistre tout de suite le contact du programme de trajets dans ton téléphone",
      "Pose la question du transport dans l'appel même qui fixe le rendez-vous",
      "Programme un message de rappel la veille de chaque rendez-vous pris",
      "Repère deux programmes de réduction sur les médicaments et garde-les sur une carte"
    ],
    [
      "Écris la règle numéro un sur un post-it : collecter le minimum, rien partager sans accord",
      "Liste ce dont l'accueil a vraiment besoin et coupe tout le reste",
      "Choisis un seul endroit verrouillé — physique ou chiffré — où vivent les notes",
      "Repasse les règles avec chaque accompagnant avant son premier appel"
    ],
    [
      "Écris à une clinique pour quinze minutes avec sa coordination d'accueil",
      "Visite-la et demande quelles orientations l'aident vraiment et lesquelles la submergent",
      "Donne-lui un contact nommé de ton côté pour des passations chaleureuses",
      "Cale un point trimestriel pour entendre parler des nouveaux services à bas prix"
    ]
  ],
  "toy-library": [
    [
      "Écris au centre communautaire ou à la bibliothèque pour demander une étagère libre",
      "Va voir avec une poussette et vérifie l'accès — pas d'escaliers, de quoi la garer",
      "Demande à trois parents à la sortie quels deux créneaux hebdo leur iraient vraiment",
      "Vérifie que l'étagère est à hauteur d'enfant et affiche les horaires dessus"
    ],
    [
      "Mets la page des rappels de produits en favori sur ton téléphone",
      "Installe un bac à dons étiqueté sur le lieu de rangement",
      "Vérifie chaque jouet donné dans la liste des rappels avant toute chose",
      "Passe les petites pièces dans un rouleau de papier toilette ; si ça rentre, écarte-le",
      "Lave et sèche chaque jouet gardé, et jette ce qui est fissuré ou incomplet"
    ],
    [
      "Demande au groupe des sachets zippés et un marqueur permanent",
      "Photographie chaque jouet à côté de son numéro et note-le avec une tranche d'âge",
      "Compte les pièces de chaque jeu en les ensachant et écris le total sur l'étiquette",
      "Range les sachets étiquette visible pour vérifier le compte au retour"
    ],
    [
      "Cherche les règles de prêt d'une autre ludothèque comme point de départ",
      "Rédige en mots simples la durée du prêt et le nombre de jouets par famille",
      "Écris la politique des pièces perdues en une phrase douce — pas d'amende, dis-le-nous",
      "Fais-la lire à deux parents et demande ce qui sonne comme une réprimande"
    ],
    [
      "Imprime cinq fiches de sortie vierges : nom, contact, numéro du jouet, date de retour",
      "Fais faire à chaque bénévole un prêt et un retour d'entraînement",
      "Intègre le comptage des pièces et un coup de chiffon à l'étape de retour elle-même",
      "Affiche la routine de nettoyage et les règles là où s'assoit la ou le ludothécaire"
    ]
  ],
  "food-preservation": [
    [
      "Écris à une salle paroissiale ou un centre communautaire pour demander leur cuisine",
      "Va sur place : la cuisinière doit porter un stérilisateur plein et bouillir fort",
      "Repère plans de travail, éviers et un coin où les bocaux chauds refroidiront en paix",
      "Réserve des dates autour des pics de récolte, pas quand la salle se trouve libre"
    ],
    [
      "Télécharge le guide complet de l'USDA à jour ou celui de ton service de vulgarisation",
      "Vérifie l'année de publication et écris-la sur la couverture",
      "Appelle le service de vulgarisation : formation des référents ou relecture du plan",
      "Accordez-vous entre référents : recettes testées seulement, sans augmenter, sans exception"
    ],
    [
      "Publie une annonce pour stérilisateurs, bocaux et anneaux dans un groupe local",
      "Réserve un test de manomètre pour chaque autoclave — souvent gratuit",
      "Passe un doigt sur le bord de chaque bocal donné et écarte ceux qui sont ébréchés",
      "Achète des couvercles neufs pour chaque bocal prévu et note les outils qui manquent"
    ],
    [
      "Écris à une personne qui jardine ou glane et demande ce qui arrive à maturité",
      "Esquisse un calendrier de récolte rapide : quelle culture abonde, quelles semaines",
      "Engage une quantité précise pour une date de séance précise avec chaque source",
      "Prévois la collecte un ou deux jours après la récolte pour que rien ne ramollisse"
    ],
    [
      "Demande par message qui a déjà fait des conserves et qui débute",
      "Choisis une recette testée adaptée aux produits et aux mains les moins expérimentées",
      "Associe l'aliment à sa méthode sûre — eau bouillante si acide, autoclave sinon",
      "Dessine les postes sur papier : laver, préparer, remplir, traiter, refroidir",
      "Nomme une personne par poste avant que quiconque arrive"
    ],
    [
      "Imprime la recette testée et les temps de traitement et scotche-les à hauteur d'yeux",
      "Ouvre avec cinq minutes de sécurité : pourquoi temps et méthodes ne se négocient pas",
      "Nomme une personne au chrono pour noter l'entrée et la sortie de chaque fournée",
      "Mets chaque nouvelle main en binôme avec une expérimentée à chaque poste",
      "Fais le tour en racontant ce que tu fais pour que le savoir-faire se transmette"
    ],
    [
      "Prends un marqueur et étiquette le premier bocal refroidi : contenu, méthode, date",
      "Appuie au centre de chaque couvercle et écarte tout bocal mal fermé — frigo, pas étagère",
      "Compte les bocaux par personne et mets de côté la part du frigo ou du garde-manger",
      "Note trois lignes à chaud : ce qui a marché, ce qui a coincé, quoi changer"
    ]
  ],
  "free-haircut": [
    [
      "Écris à une coiffeuse ou un barbier que tu connais et demande dix minutes pour en parler",
      "À chaque oui, demande combien de coupes tiennent vraiment dans une journée — six à huit",
      "Demande à chaque recrue d'amener un ou une collègue",
      "Note les diplômes et les dates préférées dans une seule liste"
    ],
    [
      "Écris à un centre d'hébergement, un accueil de jour ou une paroisse pour une après-midi",
      "Fais le tour de la salle : eau, bonne lumière et sols qu'on peut balayer",
      "Compte les prises à la terre à portée de câble de chaque futur emplacement de chaise",
      "Confirme la date et qui ouvre dans un seul message que tu pourras ressortir"
    ],
    [
      "Demande par message à tes pros le matériel qu'ils apportent, pour n'acheter que le reste",
      "Achète deux jeux de sabots et de lames par poste — l'un trempe pendant que l'autre coupe",
      "Demande à un magasin de coiffure de donner capes, peignes et collerettes jetables",
      "Prépare des sacs à emporter : rasoir, savon, déodorant et un peigne dans chacun"
    ],
    [
      "Appelle l'organisme qui encadre la coiffure et demande les règles pour un événement gratuit",
      "Achète le désinfectant homologué indiqué et note le temps de trempage exigé",
      "Monte un poste de trempage par chaise : bac étiqueté, minuteur et temps affiché",
      "Écris la routine entre deux personnes sur une carte et scotche-la à chaque poste"
    ],
    [
      "Écris à chaque pro et au lieu d'accueil deux jours avant pour confirmer",
      "Place une chaise à l'abri des regards pour qui veut de l'intimité",
      "Tends un miroir à chaque personne et demande d'abord « qu'est-ce qui te ferait plaisir ? »",
      "Garde les téléphones dans les poches — des photos seulement si la personne en demande",
      "Termine en regarnissant les sacs à emporter et en calant la prochaine date avec le lieu"
    ]
  ],
  "mutual-aid-moving-crew": [
    [
      "Écris à quatre amis solides et demande leurs disponibilités du week-end",
      "Demande autour de toi qui a un camion, un fourgon ou une remorque à prêter",
      "Ouvre une liste : nom, téléphone, force, véhicule, jours libres habituels",
      "Marque un petit noyau de confiance pour les déménagements sensibles — jamais en liste ouverte"
    ],
    [
      "Publie une seule annonce sur le tableau : diables, sangles, couvertures, cartons solides",
      "Priorise un chariot à quatre roues pour meubles — achète-le si personne ne le donne",
      "Marque chaque pièce au nom du programme pour qu'elle revienne",
      "Choisis un garage ou un placard comme maison du matériel et dis à l'équipe où c'est"
    ],
    [
      "Note cinq questions d'accueil dans ton téléphone : pièces, escaliers, distance, date",
      "Ajoute les deux qu'on oublie : tout est-il emballé, et où se garer légalement ?",
      "Décide comment les demandes t'arrivent — ici, un numéro de téléphone bat un formulaire",
      "Teste l'accueil avec un ami qui fait semblant de demander un déménagement"
    ],
    [
      "Cherche une bonne vidéo de levage sûr et envoie-la à toute l'équipe",
      "Écris d'abord la règle de poids : rien au-dessus de 25 kilos à moins de deux personnes",
      "Rédige une décharge d'une page et fais signer tout le monde avant le premier chantier",
      "Demande à qui conduit de confirmer que l'assurance couvre le transport bénévole"
    ],
    [
      "Ouvre la liste et repère qui est libre pour la prochaine date demandée",
      "Appelle la personne la veille et confirme que tout est vraiment emballé — pas « presque »",
      "Garde deux noms de secours par déménagement ; ça se reporte difficilement",
      "Partage les adresses en tête-à-tête depuis le téléphone de qui coordonne, jamais en groupe"
    ],
    [
      "Note les chantiers déjà trop lourds : pianos, produits dangereux, grands débarras",
      "Cherche qui s'en charge dans le coin : déménageurs pros, transporteurs, services locaux",
      "Accompagne chaque limite de cette orientation pour qu'un non donne un prochain appel",
      "Mets tout au propre sur une demi-page et partage-la avec toute l'équipe"
    ],
    [
      "Écris à l'équipe la veille au soir : heure, point de rendez-vous, tenue",
      "Charge les meubles les plus lourds d'abord et laisse le chariot faire l'effort",
      "Refais le tour de l'ancien logement avec la personne avant de partir",
      "Reprends des nouvelles quelques jours après — bien installée ? la boutique gratuite aiderait ?",
      "Note ce qui a bien marché et ce qui a fait mal tant que c'est frais"
    ]
  ],
  "disability-support-network": [
    [
      "Écris à deux voisins handicapés que tu connais : cofonderaient-ils ça avec toi ?",
      "Laisse-les choisir format, lieu et rythme de la première rencontre avant de rien fixer",
      "Ajoute une ligne au budget pour les frais d'accès et le temps de qui anime",
      "Dites la règle à voix haute : les alliés soutiennent, les membres handicapés décident"
    ],
    [
      "Demande à trois membres comment les joindre : appel, message, courriel ou en personne",
      "Ouvre un canal par préférence et nomme une personne qui s'occupe de chacun",
      "Fais tester l'inscription et l'affiche par une personne qui utilise un lecteur d'écran",
      "Réécris ta première annonce en langage clair et envoie-la par toutes les voies à la fois"
    ],
    [
      "Demande à un membre quelle course ou barrière lui a coûté le plus ce mois-ci",
      "Rédige cinq questions courtes et pose-les par téléphone, message et en personne",
      "Liste chaque ressource locale citée, une par ligne, avec un contact",
      "Appelle chaque lieu listé et demande pour l'ascenseur, les toilettes et l'accueil",
      "Repère les trois plus gros écarts entre les besoins des membres et ce qui existe"
    ],
    [
      "Écris à trois membres : une chose à offrir, une chose qui rendrait service",
      "Fais une feuille à deux colonnes — offres et besoins — et esquisse les paires évidentes",
      "Ajoute une option de pause sans justification pour se retirer une semaine",
      "Fais toi-même la première mise en relation et prends ensuite des nouvelles des deux"
    ],
    [
      "Publie une annonce pour déambulateurs, cannes et chaises de douche inutilisés",
      "Écris d'abord la liste de ce qu'on ne prête pas : rien qui touche de près bouche ou peau",
      "Désinfecte chaque aide, puis étiquette-la : numéro, série et nom du programme",
      "Prépare une fiche de sortie simple : numéro, qui l'emprunte, contact, date de sortie"
    ],
    [
      "Enregistre dans ton téléphone le numéro du conseil en droits sociaux le plus proche",
      "Demande à deux membres à quel rendez-vous ou guichet ils aimeraient être accompagnés",
      "Associe chaque demande à un binôme qui prend des notes et demande tout par écrit",
      "Dès qu'il s'agit d'argent ou d'aides, oriente vers le conseil au lieu de deviner"
    ],
    [
      "Note les réussites et les ratés d'accès de ton dernier événement",
      "Rédige la liste avec des membres handicapés : entrée, places, toilettes, son, supports",
      "Ajoute une question sur les besoins d'accès à chaque formulaire de réponse du programme",
      "Passe un événement à venir au crible de la liste et corrige ce qui pèche avant la date"
    ]
  ],
  "books-to-prisoners": [
    [
      "Cherche sur ton téléphone la page courrier d'un établissement proche",
      "Appelle ou écris au service courrier pour demander la politique livres par écrit",
      "Enregistre la politique dans un fichier daté et note quand la revérifier",
      "Refais pareil pour le deuxième établissement et note les règles qui diffèrent",
      "Écris les règles éliminatoires (neuf seulement, pas de rigide) sur une fiche"
    ],
    [
      "Écris à un ami pour demander dictionnaires ou romans de poche à donner",
      "Demande un coin avec une table à une église, une bibliothèque ou un garage",
      "Publie un appel aux dons listant seulement l'accepté — des poches en bon état",
      "Pose une caisse de tri à l'entrée pour les rigides et les livres annotés",
      "Classe le reste en rayons sommaires : dictionnaires, romans, éducation, réinsertion"
    ],
    [
      "Prends un cahier ou ouvre un tableur : nom, numéro d'écrou, unité, demande",
      "Saisis les lettres reçues en recopiant chaque nom et numéro tels qu'écrits",
      "Ajoute une date de demande et une colonne envoyé pour que rien ne reste sans réponse",
      "Choisis une boîte ou une chemise où atterrit chaque lettre avant la saisie"
    ],
    [
      "Écris à deux amis qui aiment les livres et invite-les à une soirée d'emballage",
      "Imprime les règles en liste d'une page et scotche-la au-dessus de la table",
      "Accompagne chaque nouvelle personne pendant l'emballage de son premier colis",
      "Dis la norme à voix haute : une deuxième personne vérifie chaque carton avant fermeture"
    ],
    [
      "Cherche le tarif Media Mail pour un colis de livres d'un kilo",
      "Demande au groupe des dons de timbres avec un montant concret par colis",
      "Mets une journée d'envoi récurrente au calendrier et invite deux personnes",
      "Écris une carte de règle pour l'emballage : pas de lettre personnelle en Media Mail"
    ],
    [
      "Demande à une ou un bénévole d'inaugurer le programme de correspondance",
      "Écris les deux règles sur une carte : adresse du programme et prénoms seulement",
      "Rédige une réponse douce et ferme aux demandes d'argent ou de romance et partage-la",
      "Forme le premier binôme et cale un point après leur premier échange"
    ]
  ],
  "community-music": [
    [
      "Publie une annonce pour des instruments jouables dans un groupe local",
      "Écris à un magasin de musique pour des réparations à prix réduit",
      "Essaie ou ouvre chaque étui avant d'accepter — évite pianos gratuits et grosses fissures",
      "Récupère les oui et étiquette chaque instrument avec la réparation à faire",
      "Dépose les réparables au magasin et note la date promise"
    ],
    [
      "Ouvre une feuille avec colonnes : numéro, type, état, qui l'a, date de sortie",
      "Colle une étiquette numérotée sur chaque instrument",
      "Photographie l'état de chaque instrument et classe les photos par numéro",
      "Écris une note de prêt en trois lignes : entretien, délai de retour, pas de facture",
      "Teste le système en empruntant un instrument à ton propre nom"
    ],
    [
      "Écris aux deux musiciens que tu connais déjà : enseigneraient-ils à un débutant ?",
      "Demande des noms de gens patients à l'église, à la fanfare et au club des aînés",
      "Prends dix minutes avec chaque oui pour savoir quoi et quand ils enseigneraient",
      "Lance dès maintenant la vérification d'antécédents de qui enseignera aux enfants",
      "Note noms, instruments et disponibilités dans une seule liste partagée"
    ],
    [
      "Liste trois salles qui tolèrent le bruit : centre communautaire, école, lieu de culte",
      "Appelle ou passe voir chacune et demande précisément soirs et après-midis de week-end",
      "Au oui le plus chaleureux, demande un placard fermant à clé pour les instruments",
      "Passe une fois dans la salle à l'heure prévue pour vérifier bruit et voisinage",
      "Obtiens l'accord par écrit, avec tes jours et horaires exacts nommés"
    ],
    [
      "Envoie un seul message à tes profs pour leurs deux meilleurs créneaux hebdo",
      "Ébauche un premier mois de cours plus une jam marquée débutants seulement",
      "Prépare l'inscription : une feuille sur place et un numéro où envoyer un message",
      "Confirme le calendrier avec le lieu d'accueil avant d'annoncer quoi que ce soit",
      "Affiche les horaires là où les familles regardent déjà et épingle-les dans le groupe"
    ],
    [
      "Note trois règles d'entretien pour l'instrument que tu connais le mieux",
      "Ajoute la ligne clé en gras : si ça casse, rapporte-le — ne répare pas à la maison",
      "Fais relire la fiche à l'un de tes profs pour ce qui manque ou cloche",
      "Imprime des copies et glisses-en une dans chaque étui avant sa sortie",
      "Dis la phrase de l'instrument cassé à voix haute à chaque prêt"
    ]
  ],
  "school-supply-program": [
    [
      "Cherche le numéro du secrétariat de l'école la plus proche et enregistre-le",
      "Appelle ou écris en demandant la conseillère ou l'agent de liaison familles par son nom",
      "Demande-leur les listes de fournitures exactes par niveau, marques comprises",
      "Demande un compte réaliste des familles qui auraient besoin d'un sac à dos",
      "Recopie listes et compte dans un seul document et partage-le avec le projet"
    ],
    [
      "Ouvre les listes de fournitures et entoure les cinq basiques les plus demandés",
      "Compare le prix de ces basiques au carton dans deux enseignes de gros",
      "Passe une commande en gros de crayons, cahiers et colle avant le début de la collecte",
      "Demande à deux commerces ou paroisses d'accueillir une boîte à dons pour les extras",
      "Mets un rappel hebdo pour vider les boîtes et pointer ce qui manque encore"
    ],
    [
      "Imprime un exemplaire de la liste de fournitures de chaque niveau",
      "Écris à trois bénévoles avec date et heure pour une séance d'emballage",
      "Installe une table par niveau avec sa liste scotchée bien en vue",
      "Emballe à la chaîne, en pointant chaque sac sur la liste de son niveau",
      "Laisse chaque sac ouvert pour que les enfants puissent échanger au retrait"
    ],
    [
      "Écris à deux personnes qui auraient une pièce ou un garage secs et fermant à clé",
      "Visite la meilleure option : au sec, ça ferme, avec étagères ou palettes",
      "Pose les cartons sur des étagères ou des palettes, jamais à même le sol",
      "Choisis un point de remise sur une ligne de bus déjà pratiquée et confirme la date"
    ],
    [
      "Cherche la date de la rentrée et cale la distribution une à deux semaines avant",
      "Demande à l'agent de liaison de diffuser la date par ses canaux vers les familles",
      "Écris à ta liste de bénévoles : qui peut prendre un créneau de deux heures ?",
      "Dispose les sacs par couleur pour que chaque enfant choisisse le sien",
      "Fais une répétition la veille : pas de formulaire, juste un accueil et une table"
    ]
  ],
  "legal-aid-clinic": [
    [
      "Cherche le bureau d'aide juridique et le programme pro bono du barreau ; note les deux numéros",
      "Appelle chacun et demande ce qu'il leur faudrait pour envoyer des avocats",
      "Écris à la clinique de droit la plus proche au sujet d'étudiants supervisés",
      "Demande à chaque avocat si son assurance responsabilité couvre le bénévolat",
      "Inscris la permanence au programme du barreau si c'est ce qui active la couverture"
    ],
    [
      "Pose une seule question à tes avocats partenaires : quels trois sujets prendrez-vous ?",
      "Liste ce qui est hors périmètre et où chacun de ces dossiers doit aller à la place",
      "Obtiens un contact nommé et un délai honnête dans chaque organisation — pas de numéro vert",
      "Écris le périmètre avec des mots qu'un voisin pourrait te répéter"
    ],
    [
      "Écris à un lieu partenaire pour demander une salle avec une vraie porte pour consulter",
      "Mets-toi dans la salle d'attente pendant que quelqu'un parle — si tu l'entends, cherche encore",
      "Prépare une liste de documents par type de dossier : bail, courriers, fiches de paie, identité",
      "Organise l'accueil pour que chaque séance commence avec les papiers déjà triés"
    ],
    [
      "Dessine la feuille de rendez-vous sur papier : noms et horaires, rien d'autre",
      "Décide qui prend les rendez-vous et où vit cette liste unique",
      "Garde le fond du dossier hors de toute feuille partagée — les détails restent dans la salle",
      "Fais des rappels qui donnent l'heure et le lieu, jamais le sujet juridique"
    ],
    [
      "Écris à une organisation partenaire : quelles questions de droits reviennent le plus ?",
      "Rédige un guide d'une page sur le sujet principal, en langage simple",
      "Fais relire chaque document par un avocat et mets une date sur chacun",
      "Réserve une salle et une personne pour animer le premier atelier",
      "Dis-le à voix haute et par écrit : de l'information générale, pas un conseil juridique"
    ],
    [
      "Propose deux dates de permanence à tes avocats et demande laquelle tient",
      "Fixe la date récurrente et ajoute-la au calendrier de la communauté",
      "Réserve l'interprète avant d'annoncer dans une langue — jamais l'enfant d'une personne reçue",
      "Fais passer les tracts par les organisations partenaires plutôt qu'en publications ouvertes",
      "Confirme chaque avocat la semaine d'avant — une permanence sans avocat brise la confiance"
    ],
    [
      "Crée une liste centrale des personnes reçues que seule la coordination peut ouvrir",
      "Écris la règle : chaque nouveau rendez-vous est d'abord vérifié contre cette liste",
      "Fais la vérification des conflits à la prise de rendez-vous, pas quand la personne s'assoit",
      "Rédige un engagement de confidentialité de deux lignes que chaque bénévole signe",
      "Passe les deux règles en revue avec toute l'équipe avant la première permanence"
    ]
  ],
  "resource-hub-dispatch": [
    [
      "Écris le numéro ou le lien de formulaire unique qui sera la porte d'entrée",
      "Mets en place téléphone, formulaire et accueil en personne avec les mêmes questions courtes",
      "Nomme une personne et un rythme de relève pour chaque canal avant de le publier",
      "Envoie une demande test par chaque canal et chronomètre le temps avant qu'elle soit vue"
    ],
    [
      "Ouvre une feuille avec les colonnes : nom, savoir-faire, disponibilités, contact, limites",
      "Écris à cinq bénévoles pour leurs disponibilités et leur moyen de contact préféré",
      "Ajoute chaque responsable de projet et ce que son projet peut vraiment offrir",
      "Cale une reconfirmation trimestrielle — une liste de vieux oui est surtout de la fiction"
    ],
    [
      "Refais sur papier le trajet d'une demande récente : qui l'a vue, qui a agi, qui l'a close",
      "Écris les règles d'aiguillage : quel type de besoin va à quel projet ou bénévole",
      "Donne à chaque demande une personne responsable nommée qui la porte jusqu'au bout",
      "Fixe un objectif de délai, avec un « on ne peut pas couvrir ça » le jour même en plancher",
      "Suis le statut de chaque demande à un endroit visible de toute l'équipe"
    ],
    [
      "Commence la liste par vos propres projets — ceux-là, tu les connais par cœur",
      "Appelle chaque service extérieur comme si tu étais la personne aidée et note les horaires",
      "Note les conditions d'accès — qui ils acceptent et ce qu'ils demandent à l'entrée",
      "Date chaque entrée et cale un créneau mensuel pour revérifier les plus anciennes"
    ],
    [
      "Écris à trois personnes organisées pour proposer un créneau d'aiguillage par semaine",
      "Rédige le guide du créneau pour qu'une personne nouvelle le tienne avec la seule feuille",
      "Accompagne chaque nouvelle personne coordinatrice sur son premier créneau, puis passe la main",
      "Monte la rotation pour que personne ne couvre plus de deux créneaux d'affilée"
    ],
    [
      "Relis ton formulaire d'accueil et raye chaque champ dont tu pourrais te passer",
      "Écris la règle de suppression : à la clôture, garde le décompte, supprime les détails",
      "Liste qui peut voir les demandes ouvertes et ferme l'accès à tout le reste",
      "Ajoute une étape de suivi : confirme que le besoin a vraiment été couvert avant de clore"
    ],
    [
      "Ajoute dès maintenant une étiquette ou colonne « non couvert » à ton suivi des demandes",
      "Choisis un jeu de catégories fixes pour que les entrées s'additionnent au lieu de s'éparpiller",
      "Note chaque manque au moment où il survient, pas de mémoire en fin de mois",
      "Fais le total des manques chaque mois et apporte le plus gros à la prochaine réunion"
    ]
  ],
  "harm-reduction-supplies": [
    [
      "Cherche l'association de réduction des risques ou la formation naloxone la plus proche",
      "Écris ou appelle : présente l'équipe et demande quand a lieu la prochaine formation gratuite",
      "Réserve une place de formation pour chaque personne qui distribuera — sans exception",
      "Demande à distribuer sous leur parapluie juridique et leur ordonnance permanente"
    ],
    [
      "Écris à l'organisation partenaire ou à une permanence juridique : que peut-on transporter ici ?",
      "Demande précisément pour les bandelettes de test et les seringues, pas juste la naloxone",
      "Note le texte de loi ou le nom de la source, avec la date de ta vérification",
      "Transforme ça en carte d'une page que chaque bénévole garde sur soi"
    ],
    [
      "Cherche le programme public de distribution de naloxone ou l'ordonnance en pharmacie",
      "Passe la commande, plus ce que ta liste légale permet : bandelettes, soin des plaies, hygiène",
      "Vérifie les dates de péremption le jour où le carton arrive et note-les bien en vue",
      "Stocke tout à l'abri de la chaleur et du froid — ni coffre de voiture, ni cabanon"
    ],
    [
      "Demande à l'organisation partenaire une notice de kit à copier",
      "Rédige la tienne : repérer une overdose, donner la naloxone, appeler les secours, jamais seul",
      "Fais-la traduire dans les langues que ton voisinage parle vraiment",
      "Appelle chaque numéro de la notice avant d'imprimer des centaines de copies",
      "Monte une chaîne d'assemblage, une personne par poste : sachet, notice, matériel, scellé"
    ],
    [
      "Demande à un bar ou une épicerie que tu connais déjà de garder une boîte sans questions",
      "Fais l'itinéraire avec l'organisation partenaire et laisse-la te présenter là où on la connaît",
      "Choisis des jours et heures fixes pour les tournées et garde-les identiques chaque semaine",
      "Donne à chaque boîte accueillie un contact nommé qui la réapprovisionne"
    ],
    [
      "Commence une feuille de comptage : article, quantité, date — compte le matériel, jamais les gens",
      "Consigne chaque date de péremption de la naloxone avec un rappel un mois avant",
      "Fais le tour des points fixes chaque mois et remplis avant que les boîtes restent vides",
      "Cale un rappel de formation chaque fois que de nouvelles personnes bénévoles arrivent"
    ]
  ],
  "court-support": [
    [
      "Cherche le numéro du bureau des avocats commis d'office et le groupe local d'observation",
      "Envoie un court courriel : tu offres des mains en plus et demandes le canal préféré",
      "Demande à chaque groupe ce qui aiderait vraiment — puis écoute, ne vends rien",
      "Va une fois au tribunal avec quelqu'un du groupe d'observation pour voir sa façon de faire",
      "Note nom, rôle et canal préféré de chaque contact dans une seule liste partagée"
    ],
    [
      "Ouvre une note et écris la règle phare : nous ne donnons jamais de conseil juridique",
      "Ajoute la phrase exacte : « je ne peux pas te conseiller — demande à ton avocat »",
      "Liste la conduite en salle : arriver tôt, tenue sobre, téléphones éteints, aucune réaction",
      "Ajoute la règle du couloir : rien du dossier là où le parquet pourrait entendre",
      "Envoie le brouillon à ton contact commis d'office pour une relecture rapide"
    ],
    [
      "Demande au groupe quel numéro de téléphone peut recevoir les demandes de soutien",
      "Crée un calendrier partagé avec la date, la salle et ce dont chaque personne a besoin",
      "Mets le rôle en ligne du tribunal en favori et entraîne-toi à chercher un dossier",
      "Pose un rappel fixe : vérifier chaque date sur le rôle la veille en fin de journée",
      "Demande à la personne, pas au dossier, s'il lui faut aussi un trajet ou une garde"
    ],
    [
      "Propose aux bénévoles deux matinées calmes pour une visite du tribunal",
      "Montre-leur la sécurité : la file de 30 minutes, les canifs interdits, les règles téléphone",
      "Montre-leur la salle : où s'asseoir et comment attendre trois heures calmement",
      "Répétez en binômes la phrase du non-conseil jusqu'à ce qu'elle sorte toute seule",
      "Associe chaque nouvelle personne bénévole à une expérimentée pour sa première date"
    ],
    [
      "Demande aux membres qui peut conduire les matins de semaine et qui peut garder des enfants",
      "Liste les matins de chaque conducteur et les disponibilités de chaque binôme de garde",
      "Attribue un conducteur principal et un de secours à chaque audience — jamais un seul",
      "Confirme le conducteur principal et le binôme de garde la veille au soir, à chaque fois",
      "Vérifie quelles salles admettent les enfants pour que le plan de garde colle au bâtiment"
    ],
    [
      "Réponds à l'avocat en demandant par écrit contenu, destinataire et délai",
      "Liste les gens du quartier qui connaissent bien la personne et écris à chacun",
      "Envoie à qui écrit les consignes de l'avocat et une bonne lettre d'exemple",
      "Rassemble chaque lettre et garde-la pour la relecture de l'avocat avant tout envoi",
      "Note qui a promis une lettre et relance trois jours avant le délai"
    ]
  ],
  "cooling-warming-center": [
    [
      "Liste trois candidats avec vraie clim et vrai chauffage : bibliothèque, lieu de culte, salle",
      "Appelle l'un d'eux aujourd'hui et demande vingt minutes avec qui garde les clés",
      "Fais le tour de la salle : toilettes, entrée sans marches, emplacement des prises",
      "Pose maintenant les questions inconfortables : horaires, clés, assurance, nuits sur place",
      "Obtiens l'accord par écrit et prévois de tester clim ou chauffage un jour vraiment extrême"
    ],
    [
      "Cherche les seuils d'alerte du service météo pour l'indice de chaleur et le froid ressenti",
      "Propose au groupe des chiffres exacts — une valeur de prévision, pas « quand c'est grave »",
      "Nomme une personne avec l'autorité de déclencher une activation, plus une remplaçante",
      "Crée le groupe de discussion ou la chaîne téléphonique et fais un test d'alerte aujourd'hui",
      "Affiche le seuil et le nom de qui décide là où chaque hôte peut les voir"
    ],
    [
      "Écris la liste : eau, électrolytes, couvertures, lits de camp, ventilateurs, chargeurs, secours",
      "Publie une annonce aux membres pour les dons possibles et chiffre le reste",
      "Fais une seule tournée d'achats et apporte tout sur place en voiture",
      "Prépare des bacs étiquetés pour qu'une personne hôte neuve trouve tout en quelques secondes",
      "Scotche une liste du contenu à l'intérieur de la porte du placard"
    ],
    [
      "Demande aux membres qui pourrait tenir un créneau de quatre heures par météo extrême",
      "Cale une formation de deux heures sur place et invite chaque oui",
      "Répétez les signes du coup de chaleur et de l'hypothermie jusqu'à les connaître par cœur",
      "Dis-le clairement : appelez les secours tôt, personne ne sera jamais blâmé d'avoir appelé",
      "Entraînez-vous en binômes à un accueil sans paperasse et à un scénario de désescalade"
    ],
    [
      "Esquisse la grille des créneaux d'un jour d'activation : ouverture, blocs, fermeture",
      "Remplis chaque créneau avec deux noms — jamais une personne hôte seule",
      "Demande à trois personnes de plus d'être la réserve nommée quand la météo fauche des hôtes",
      "Partage la rotation dans le groupe et confirme que chaque personne a vu son créneau",
      "Fais un appel d'activation à blanc pour voir à quelle vitesse la grille se remplit vraiment"
    ],
    [
      "Liste où vont déjà les personnes à risque : dispensaires, résidences pour aînés, épiceries",
      "Rédige un tract en langage simple avec les seuils, l'adresse et les horaires",
      "Demande aux membres de le traduire dans les autres langues du quartier",
      "Remets des piles aux livreurs de repas, gardiens d'immeuble et équipes de maraude",
      "Termine la tournée des semaines avant le changement de saison — pas en pleine canicule"
    ],
    [
      "Écris à ton binôme pour confirmer le créneau et savoir qui garde les clés",
      "Arrive une heure en avance, lance la clim ou le chauffage et pose de l'eau près de la porte",
      "Tiens un décompte souple des visites — un nombre, pas de pièces d'identité",
      "Réveille doucement toute personne qui dort pour voir comment elle va ; une sieste peut tromper",
      "Après la fermeture, nettoie, réapprovisionne les bacs et note ce qui a manqué"
    ]
  ],
  "community-oral-history": [
    [
      "Ouvre une note vierge et liste ce que tu enregistreras et où ça pourrait finir",
      "Rédige une page : ce qui est enregistré, les partages possibles, le droit d'arrêter ou retirer",
      "Fais du partage des cases séparées : avec ou sans nom, famille seulement, public en ligne",
      "Ajoute ton numéro de téléphone pour qu'on puisse changer d'avis plus tard",
      "Demande à quelqu'un de le traduire dans les langues des personnes qui raconteront"
    ],
    [
      "Ouvre l'appli dictaphone de ton téléphone et vérifie l'espace libre",
      "Enregistre un test de 30 secondes dans la pièce prévue et réécoute : ronron ou écho ?",
      "Écris huit questions ouvertes du genre « raconte-moi la rue quand tu es arrivée »",
      "Répète un entretien de dix minutes avec un ami et coupe les questions qui tombent à plat"
    ],
    [
      "Écris à une personne âgée qui te fait confiance et demande une heure à sa table de cuisine",
      "Charge ton téléphone, libère de l'espace et mets formulaire et questions dans un sac",
      "Parcourez ensemble le formulaire de consentement avant d'appuyer sur enregistrer",
      "Si l'histoire devient brute, fais une pause et redemande si cette partie peut rester",
      "Avant de partir, cale la prochaine séance ou demande à qui elle te présenterait"
    ],
    [
      "Renomme dès maintenant l'enregistrement de la semaine : date, nom, accord de partage",
      "Copie-le vers un deuxième endroit vraiment différent — en ligne plus téléphone, pas un ordi",
      "Remets sa copie à la personne, sur une clé USB ou par l'appli qu'elle utilise",
      "Relis le formulaire de consentement avant toute publication et respecte tout changement"
    ]
  ],
  "community-solar-coop": [
    [
      "Écris à cinq voisins qui râlent contre leur facture d'électricité et demande dix minutes",
      "Prépare un formulaire qui demande un vrai niveau d'engagement, pas juste un courriel",
      "Organise une soirée d'info autour d'une table de cuisine et compte qui vient vraiment",
      "Trie les réponses en engagés, curieux et non — ne planifie qu'avec les engagés"
    ],
    [
      "Cherche le nom de ta région plus « règles du solaire partagé » et garde la page officielle",
      "Appelle une coopérative solaire d'à côté et demande quel modèle ses règles ont permis",
      "Rédige un aide-mémoire d'une page : comptage net, abonnements, propriété — permis ici ou non",
      "Signale chaque règle que tu ne comprends pas pour qu'un avocat l'explique plus tard"
    ],
    [
      "Liste trois grands toits ensoleillés à côté : écoles, églises, entrepôts",
      "Vérifie si un programme de solaire partagé existant prendrait votre groupe comme abonnés",
      "Visite ton site favori avec la personne propriétaire et note l'âge du toit et l'espace",
      "Mets construire contre rejoindre sur une page et apporte-la aux membres"
    ],
    [
      "Demande à la fédération des coopératives de ta région des avocats qui connaissent l'énergie",
      "Cale une consultation avec un avocat qui a déjà constitué une coopérative d'énergie",
      "Dessine le flux d'argent sur une page : qui paie, qui possède quoi, qui reçoit les crédits",
      "Compare coopérative, société et abonnement avec les professionnels",
      "Ne signe rien avant que l'avocat et le comptable aient lu chaque contrat"
    ],
    [
      "Demande à deux voisins équipés quel installateur ils ont pris et s'ils resigneraient",
      "Demande au moins trois devis écrits pour les mêmes caractéristiques",
      "Demande à chaque candidat qui gère l'entretien la cinquième année et ce que couvre la garantie",
      "Fais entrer garanties et entretien par écrit dans le contrat"
    ],
    [
      "Ouvre un tableur avec une ligne par membre : versé, crédits reçus, date",
      "Écris les règles de crédits en mots simples qu'un nouveau membre lit en une minute",
      "Choisis un seul outil pour les paiements et les relevés et n'en change plus",
      "Accompagne un membre sur son premier relevé et corrige ce qui l'a perdu"
    ],
    [
      "Demande à trois membres d'apporter une facture d'électricité récente à la prochaine réunion",
      "Décortiquez une facture ensemble, ligne par ligne",
      "Partage cinq gestes pas chers : ampoules LED, multiprises, thermostat, joints de portes",
      "Revérifiez les factures dans un mois pour que les membres voient la différence sur papier"
    ]
  ],
  "worker-coop-incubator": [
    [
      "Cale cette semaine trois conversations de 20 minutes avec des membres intéressés",
      "Demande à chacun : tu sais faire quoi, tu veux construire quoi, tu as quelles heures ?",
      "Note chaque réponse dans une feuille partagée et surligne les savoir-faire répétés",
      "Entoure toute grappe de trois savoir-faire ou plus — c'est un projet possible"
    ],
    [
      "Sonde les membres sur les savoir-faire les plus voulus : CV, métiers, numérique, argent",
      "Demande au programme de partage de savoir-faire qui peut enseigner les deux plus demandés",
      "Réserve un spécialiste extérieur pour le sujet que personne ne maîtrise sur place",
      "Programme la première séance et garde-la sous deux heures",
      "Recueille les avis à la sortie et ajuste la séance suivante"
    ],
    [
      "Invite un membre d'une vraie coopérative de travail à venir parler au groupe",
      "Fais un comparatif d'une page : coopérative contre entreprise — bénéfices, décisions, propriété",
      "Montre avec des chiffres comment une vraie coopérative vote et partage les bénéfices",
      "Garde du temps pour les questions dures : la paie, les conflits, les départs"
    ],
    [
      "Cherche la structure d'accompagnement des coopératives de ta région et cale un premier appel",
      "Aide le groupe à écrire un plan d'activité d'une page avant toute paperasse",
      "Trouve les noms d'un avocat et d'un comptable qui ont déjà constitué des coopératives",
      "Passez en revue les options de structure avec les professionnels dans la pièce",
      "Attends pour la constitution que le plan et les conseils soient alignés"
    ],
    [
      "Ouvre un document partagé listant chaque microcrédit, subvention et fonds coopératif connu",
      "Demande à la structure d'accompagnement quels financeurs manquent à ta liste",
      "Note le délai, le montant et les exigences de chaque fonds",
      "Assieds-toi avec un projet et terminez ensemble sa première candidature"
    ],
    [
      "Écris les noms de trois coopérateurs ou patrons d'expérience à qui tu pourrais demander",
      "Invite chacun à suivre un projet avec un point mensuel",
      "Apparie mentors et projets par métier, pas seulement par disponibilité",
      "Mets le premier point au calendrier avant le lancement du projet"
    ],
    [
      "Invite tous les projets à un repas ou une soirée en commun",
      "Fais partager à chaque projet un problème et une victoire",
      "Ouvre un groupe de discussion pour les recommandations et les questions rapides",
      "Listez ce que les projets pourraient s'acheter entre eux et épinglez-le dans le groupe"
    ]
  ],
  "elder-meal-delivery": [
    [
      "Appelle un centre pour personnes âgées ou une infirmière de paroisse et demande qui aurait besoin de repas et de visites",
      "Liste les cliniques, groupes religieux et pharmacies qui voient des personnes âgées isolées",
      "Rédige un petit texte clair : un repas et une visite, gratuits, sans engagement",
      "Appelle ou visite chaque personne recommandée et demande-lui — ne suppose jamais",
      "Ouvre une liste des oui avec adresse et meilleur moment pour passer"
    ],
    [
      "Écris à cinq personnes fiables que tu laisserais entrer chez ta propre grand-mère",
      "Écris la règle noir sur blanc : références plus contrôle de base, aucune exception",
      "Applique-la à chaque bénévole avant sa première livraison",
      "Attribue à chaque personne âgée le même visage régulier plutôt qu'une rotation"
    ],
    [
      "Demande à l'équipe du repas communautaire ce qu'elle peut produire chaque semaine sans faute",
      "Trouve deux cuisiniers de secours ou un restaurant prêt à donner des portions",
      "Convenez du nombre de portions, de l'heure de retrait et d'emballages faciles à réchauffer",
      "Étiquette chaque contenant avec contenu et date avant qu'il quitte la cuisine"
    ],
    [
      "Place les adresses de ta liste des oui sur une carte et regroupe-les en tournées courtes",
      "Fixe des jours et des heures approximatives, les mêmes chaque semaine",
      "Prévois à chaque arrêt dix minutes tranquilles pour la conversation",
      "Fais un tour d'essai de chaque tournée avant la première vraie livraison"
    ],
    [
      "Crée un formulaire simple : régime, allergies, contact d'urgence",
      "Remplis-le avec chaque personne âgée ou sa famille, en personne ou par téléphone",
      "Garde les formulaires sous clé ou protégés par mot de passe",
      "Donne à qui conduit seulement l'essentiel à la porte : allergies et un numéro de contact"
    ],
    [
      "Écris la première ligne : ce qu'un bénévole fait devant une porte qui reste fermée",
      "Liste qui appeler, dans l'ordre : téléphone de la personne, famille, secours",
      "Ajoute comment noter ce qui s'est passé après tout incident",
      "Imprime le protocole sur une carte de poche pour chaque bénévole",
      "Passe-le en revue à voix haute avec l'équipe avant d'en avoir besoin"
    ],
    [
      "Écris à chaque bénévole après sa première semaine : comment ça s'est passé, qu'est-ce qui était gênant",
      "Pose à chaque personne âgée une question ouverte : qu'est-ce qui rendrait tout ça mieux",
      "Fais tourner ou mets en pause les tournées de qui semble à bout",
      "Partage une petite victoire avec toute l'équipe chaque mois"
    ]
  ],
  "disaster-relief-hub": [
    [
      "Liste trois bâtiments avec une zone de déchargement : écoles, églises, locaux syndicaux",
      "Pose à chaque propriétaire la question directe : pourrait-on entrer à 6 h du matin après une inondation ?",
      "Obtiens un oui écrit et un accord de clés pour ton premier choix et un plan B",
      "Parcours les deux lieux et note l'électricité, l'eau et où les camions se gareraient"
    ],
    [
      "Liste d'où viendraient l'eau, la nourriture et l'hygiène : fournisseur, partenaire ou collecte",
      "Appelle un grossiste et renseigne-toi sur les grosses commandes d'urgence à bref délai",
      "Accorde-toi avec les organisations partenaires sur qui fournit quoi",
      "Décide comment vous saurez les vrais besoins après un événement : chaîne d'appels ou formulaire"
    ],
    [
      "Choisis dès maintenant tes catégories de tri : eau, nourriture, hygiène, nettoyage, vêtements",
      "Dessine le flux sur papier : le camion arrive, décharger, trier, ranger, compter",
      "Crée une feuille de comptage d'une page pour les entrées et les sorties",
      "Imprime des panneaux par catégorie et range-les sur place avec du ruban adhésif"
    ],
    [
      "Écris la règle en haut de la page : pas de contrôle d'identité, pas de preuve de besoin",
      "Mets par écrit qui est servi en premier quand le matériel manque",
      "Trace des tournées de livraison pour qui ne peut pas venir au centre",
      "Dessine la file de retrait en sens unique : on entre par une porte, on sort par l'autre"
    ],
    [
      "Écris à dix bénévoles possibles et demande : pourrais-tu venir en quelques heures ?",
      "Rédige des fiches de rôle : réception, tri, distribution, livraison, sécurité",
      "Organise un jour d'entraînement de deux heures avec de vrais cartons",
      "Note qui a bien fait quoi et attribue les rôles à l'avance pour le jour venu"
    ],
    [
      "Écris aux services locaux de gestion des urgences et présente le centre",
      "Liste les autres groupes de secours du coin et ce que chacun couvre",
      "Rencontrez-vous une fois et décidez qui comble quel manque",
      "Échangez des contacts hors horaires et gardez-en une copie papier"
    ],
    [
      "Imprime la liste des bénévoles et les contacts clés — suppose qu'il n'y aura pas d'internet",
      "Choisis un plan hors ligne : radios, tableau de messages ou messagers à pied",
      "Écris les règles de sécurité strictes : personne n'entre dans une structure dangereuse, jamais",
      "Relie-toi à l'arbre de contacts du réseau de préparation et teste-le une fois"
    ]
  ],
  "recovery-peer-support": [
    [
      "Note un ou deux voisins avec un vécu solide de rétablissement",
      "Demande à chacun en privé s'il envisagerait de faciliter — sans pression, sans annonces",
      "Trouve la formation reconnue de soutien entre pairs la plus proche et sa prochaine date",
      "Inscris chaque futur facilitateur avant la première réunion",
      "Dis la phrase à voix haute dès le premier jour : des pairs, pas des soignants"
    ],
    [
      "Ouvre un document à deux colonnes : ce qu'on fait, ce qu'on ne fait jamais",
      "Mets les conseils de sevrage et de médicaments en haut de la colonne jamais",
      "Fais-le lire et signer à chaque facilitateur",
      "Montre le périmètre à un professionnel du soin local pour un regard extérieur"
    ],
    [
      "Liste les programmes de soins, cliniques et lignes de crise du coin",
      "Visite ou appelle chacun et présente le réseau en personne",
      "Demande à chacun : qui appelle-t-on exactement, et peut-on citer votre nom ?",
      "Écris un plan de réponse aux surdoses et affiche-le là où vous vous réunissez",
      "Imprime la liste de contacts et revérifie-la chaque mois"
    ],
    [
      "Liste des salles à entrée discrète : bibliothèque, salle commune, lieu de culte",
      "Visite tes deux préférées et vérifie l'intimité et le bruit",
      "Confirme que la salle est sans substances et libre tes soirs de réunion",
      "Réserve un créneau fixe pour que la salle soit toujours la même"
    ],
    [
      "Rédige les règles : ce qui se dit ici reste ici, pas de conseils imposés, droit de passer",
      "Lis-les aux facilitateurs et coupe tout ce qui sonne moralisateur",
      "Imprime-les sur une seule carte pour la salle de réunion",
      "Prévois de les lire à voix haute au début de chaque réunion, sans exception"
    ],
    [
      "Choisis deux horaires de réunion : un en soirée, un en journée ou le week-end",
      "Rédige un tract en mots simples : gratuit, ouvert, sans conditions",
      "Coupe toute formule qui évoque la honte ou un diagnostic",
      "Affiche-le là où les gens vont déjà : cliniques, laveries, cafés",
      "Demande aux programmes partenaires de le remettre en main propre"
    ],
    [
      "Mets au calendrier un tête-à-tête mensuel avec chaque facilitateur",
      "Mets en place une rotation pour que personne ne tienne toutes les réunions",
      "Demande à chaque facilitateur où il trouve son propre soutien",
      "Dis-le avant que quiconque en ait besoin : se mettre en retrait est toujours permis"
    ]
  ],
  "community-fitness": [
    [
      "Écris cinq questions rapides sur le mouvement que les gens aiment et ce qui leur semble faisable",
      "Pose-les cette semaine à la laverie, à la résidence pour personnes âgées et à la sortie de l'école",
      "Publie les mêmes questions dans un groupe de discussion du quartier",
      "Compte les réponses et entoure les deux activités les plus demandées"
    ],
    [
      "Liste trois personnes chaleureuses et fiables qui pourraient guider une marche ou des étirements",
      "Écris à chacune avec une demande précise : une séance par semaine, aucune expertise requise",
      "Pour tout ce qui est physiquement exigeant, demande les qualifications avant d'accepter",
      "Associe à chaque nouveau guide un remplaçant qui peut couvrir une semaine manquée"
    ],
    [
      "Liste les parcs, salles et gymnases d'école accessibles sans voiture",
      "Appelle ou visite chacun pour demander le coût, les horaires et la réservation",
      "Parcours les deux meilleurs en vérifiant sol plat, sièges, ombre et toilettes",
      "Note où les gens pourraient s'abriter si le temps tourne",
      "Réserve ton premier choix pour un mois d'essai"
    ],
    [
      "Écris le plan de ta première activité sur une page, en partant de la version la plus facile",
      "Ajoute une variante à chaque mouvement : option sur chaise, boucle plus courte",
      "Supprime toute mention du poids ou de l'apparence du plan et des tracts",
      "Montre le plan à une personne âgée et à une personne débutante, puis ajuste-le"
    ],
    [
      "Achète ou emprunte une trousse de premiers secours et vérifie ce qu'elle contient",
      "Inscris un échauffement de cinq minutes au début de chaque plan de séance",
      "Ajoute des pauses d'eau au programme et un rappel d'apporter sa gourde",
      "Explique aux guides comment repérer le surmenage et rendre le repos normal",
      "Rédige une ligne suggérant aux personnes qui débutent de voir d'abord un médecin"
    ],
    [
      "Choisis un jour et une heure hebdomadaires que tu peux tenir trois mois",
      "Fais un tract simple qui dit : tous les âges, toutes les tailles, toutes les capacités",
      "Affiche-le à la laverie, la bibliothèque, la résidence pour personnes âgées et les cliniques",
      "Partage-le dans les groupes de discussion et demande à chaque membre de le transférer une fois",
      "Mets un rappel pour annoncer toute annulation tôt, jamais en silence"
    ],
    [
      "Commence chaque séance par un petit tour de prénoms",
      "Demande à une personne habituée d'accueillir les nouvelles têtes à chaque séance",
      "Prévois cinq minutes de papotage dans le programme",
      "Célèbre la régularité, jamais le poids ni la performance"
    ]
  ],
  "urban-orchard": [
    [
      "Liste des lieux possibles : fiducies foncières, terrains des parcs, congrégations avec du sol libre",
      "Écris ou téléphone au propriétaire le plus prometteur et demande un rendez-vous",
      "Demande franchement dix ans d'accès ou plus et confirme l'eau sur place",
      "Fais entrer les conditions dans un accord écrit avant d'acheter un seul arbre"
    ],
    [
      "Cherche ta zone climatique et liste les fruitiers qui y prospèrent",
      "Demande aux voisins quels fruits ils cueilleraient et mangeraient vraiment",
      "Dessine le lieu en étages : arbres hauts, arbustes, couvre-sol",
      "Vérifie les partenaires de pollinisation de chaque variété de ta liste",
      "Espace les arbres pour leur taille adulte, pas celle du jeune plant"
    ],
    [
      "Repère les pépinières les plus proches et note leur saison de racines nues",
      "Compare le prix de ta liste en racines nues et en pot",
      "Renseigne-toi sur les remises associatives, subventions et programmes de dons",
      "Passe la commande tôt — les bonnes variétés partent vite"
    ],
    [
      "Marque chaque emplacement du plan avec des fanions ou des piquets",
      "Planifie une journée pour désherber et étaler le paillis",
      "Teste la source d'eau et installe tuyaux ou récupérateurs",
      "Prépare compost, outils et tuteurs à côté de chaque emplacement"
    ],
    [
      "Choisis une date en saison de plantation et invite largement",
      "Écris un mode d'emploi d'une page : bonne profondeur, cuvette d'arrosage, anneau de paillis",
      "Charge une personne expérimentée de circuler et de vérifier chaque arbre",
      "Prévois eau, encas et musique — que ce soit une fête",
      "Termine la journée par un arrosage copieux de chaque arbre"
    ],
    [
      "Liste les travaux de l'année : arrosage, taille, paillage, surveillance des ravageurs",
      "Demande à trois personnes un engagement annuel nommé, pas un vague intérêt",
      "Monte un roulement d'arrosage d'été pour les jeunes arbres",
      "Mets dès maintenant une date de taille de printemps au calendrier"
    ],
    [
      "Rédige des règles simples de cueillette : qui récolte, quand et combien",
      "Apporte le brouillon à une réunion de la communauté avant la première récolte",
      "Trouve des destinations pour le surplus : frigos partagés, garde-manger, repas communs",
      "Affiche les règles convenues sur un panneau au verger"
    ]
  ],
  "new-parent-support": [
    [
      "Liste les gens que tu connais qui cuisinent, conduisent ou ont élevé un bébé",
      "Écris à chacun avec un rôle précis : repas, courses ou soutien entre pairs",
      "Demande à deux ou trois parents expérimentés d'être tes premiers pairs aidants",
      "Note au même endroit les disponibilités et les limites de chaque bénévole"
    ],
    [
      "Choisis un outil gratuit de chaîne de repas ou un calendrier partagé et fais un essai",
      "Crée un petit formulaire de besoins alimentaires et d'allergies, demandé une seule fois",
      "Écris les règles de dépôt : sur le pas de la porte par défaut, étiqueté, facile à réchauffer",
      "Teste tout le circuit avec une famille volontaire"
    ],
    [
      "Rédige une liste d'offres : courses, lessive, vaisselle, garde des aînés",
      "Associe chaque offre aux bénévoles qui s'y sont inscrits",
      "Fixe la règle : demander au parent ce qu'il veut à chaque visite et suivre sa liste",
      "Planifie les deux premières semaines d'aide pour ta première famille"
    ],
    [
      "Ouvre un tableur simple : nom, service, téléphone, horaires",
      "Ajoute le soutien à l'allaitement, la santé mentale post-partum et les cliniques pédiatriques",
      "Ajoute les sources locales de matériel de bébé, dont la banque de couches",
      "Appelle chaque numéro une fois pour confirmer qu'il marche",
      "Mets au calendrier une révision du répertoire tous les trois mois"
    ],
    [
      "Choisis un petit espace confortable et un horaire régulier",
      "Demande à un parent expérimenté de tenir le premier cercle",
      "Forme les pairs aux signes de la dépression et de l'anxiété post-partum",
      "Fixez la règle : encourager les soins professionnels, jamais diagnostiquer, jamais attendre",
      "Invite personnellement trois ou quatre parents pour la première rencontre"
    ],
    [
      "Écris tes étapes de vérification : références au minimum pour qui entre dans les foyers",
      "Rédige les limites : les parents fixent les conditions, les visites restent courtes sauf invitation",
      "Ajoute la règle : jamais de visite sans prévenir",
      "Passe les pratiques en revue avec chaque bénévole avant sa première visite"
    ],
    [
      "Liste les projets cousins : banque de couches, collectif de garde, comité d'accueil",
      "Rencontre une personne de chaque projet pour convenir du circuit des orientations",
      "Crée une fiche d'accueil commune pour que chaque famille raconte son histoire une seule fois",
      "Donne à chaque famille un seul point de contact"
    ]
  ],
  "foster-kinship-support": [
    [
      "Appelle le service de protection de l'enfance ou le programme d'accompagnement et demande un rendez-vous",
      "Demande aux écoles et aux groupes religieux de transmettre ton offre aux familles",
      "Rédige le premier message comme une offre, jamais comme un tri",
      "Demande aux premières familles ce qu'il leur a fallu la première semaine et la première année"
    ],
    [
      "Liste les besoins par âge : vêtements, lits, sièges auto, affaires du nouveau-né à l'ado",
      "Lance une collecte ciblée en nommant les tailles et les articles qui manquent",
      "Vérifie chaque siège auto et lit de bébé contre les dates de péremption et les rappels",
      "Trie et étiquette tout par âge et par taille au fur et à mesure",
      "Trouve un stockage au sec où quelqu'un peut passer à bref délai"
    ],
    [
      "Rédige la liste type : quelques jours de vêtements, affaires de toilette, un objet réconfortant",
      "Prépare les premiers sacs triés par âge et par taille",
      "Recrute deux personnes d'astreinte capables de livrer en quelques heures",
      "Choisis un seul numéro ou une seule boîte mail pour les demandes de placement",
      "Fais un essai chronométré de la demande jusqu'au pas de la porte"
    ],
    [
      "Demande au service qui peut assurer le répit et selon quelles règles",
      "Recrute et vérifie les bénévoles de répit selon ces règles exactes",
      "Crée une feuille de réservation simple, utilisable sans avoir à supplier",
      "Commence par des créneaux courts et réguliers — une soirée prévisible vaut mieux qu'un week-end rare"
    ],
    [
      "Choisis un horaire fixe et un espace privé et confortable",
      "Demande à une famille d'accueil ou un proche expérimenté de co-animer",
      "Invite via le service et les écoles — ne partage jamais de listes de familles",
      "Prévois une garde d'enfants pendant les rencontres pour qu'on puisse vraiment venir",
      "Ouvre chaque rencontre par un rappel de confidentialité"
    ],
    [
      "Ouvre un tableur des services, aides et soutiens sensibles au trauma",
      "Ajoute les aides propres aux proches dont personne ne parle aux familles",
      "Appelle chaque entrée pour confirmer qu'elle est à jour avant de la lister",
      "Propose de t'asseoir avec les familles pendant leurs démarches"
    ],
    [
      "Obtiens par écrit du service les règles de vérification et de signalement obligatoire",
      "Écris ta propre politique d'une page : vérification, devoirs de signalement, confidentialité",
      "Fixe la règle de vie privée : pas de photos, pas d'histoires, pas de détails sans permission",
      "Passe la politique en revue avec chaque bénévole avant tout contact avec les familles",
      "Mets au calendrier une révision annuelle de la politique"
    ]
  ],
  "weather-survival-outreach": [
    [
      "Écris deux listes de contenu : une pour la saison froide, une pour la chaleur",
      "Imprime pour chaque kit des cartes avec les hébergements et les numéros de crise",
      "Organise une séance d'assemblage et prépare les vingt premiers kits",
      "Range-les au sec, quelque part où les bénévoles arrivent vite"
    ],
    [
      "Compare le prix en gros des couvertures, chaussettes, eau et électrolytes chez deux ou trois fournisseurs",
      "Demande des dons aux magasins et aux congrégations avant le début de la saison",
      "Lance une collecte ciblée en nommant les articles exacts",
      "Mets de côté assez de stock pour un réapprovisionnement de mi-saison"
    ],
    [
      "Contacte les équipes de maraude qui parcourent déjà ces rues et demande à les suivre",
      "Joins-toi à une ou deux tournées avant de cartographier par toi-même",
      "Note les emplacements sans rigidité — les gens bougent, surtout par mauvais temps",
      "Prends l'habitude de mettre la carte à jour après chaque tournée"
    ],
    [
      "Rédige le plan de formation : contact respectueux, travail en binôme, urgences",
      "Demande à une personne expérimentée de la maraude de co-animer la première formation",
      "Programme la séance avant le début de la saison",
      "Tiens la liste des personnes formées — personne ne distribue sans en être"
    ],
    [
      "Décide les seuils météo qui déclenchent une tournée et mets-les par écrit",
      "Trace des tournées qui atteignent d'abord les personnes les plus exposées",
      "Attribue un binôme à chaque tournée, avec un remplaçant pour chacun",
      "Choisis qui surveille la météo et envoie le message de départ"
    ],
    [
      "Liste les lieux chauffés et rafraîchis, les places d'hébergement et le centre de ressources",
      "Appelle chacun pour vérifier horaires et règles avant d'imprimer quoi que ce soit",
      "Imprime de petites cartes que les bénévoles distribuent en tournée",
      "Fixe une revérification hebdomadaire — orienter vers une porte close brûle la confiance"
    ],
    [
      "Imprime une carte de poche des signes d'hypothermie et de coup de chaleur",
      "Martèle la règle en formation : appeler les secours immédiatement, jamais attendre de voir",
      "Entraînez-vous à quoi faire en attendant l'aide : ombre et eau, ou couvertures et coupe-vent",
      "Fais enregistrer à chaque bénévole les numéros locaux d'urgence et de crise"
    ]
  ]
};
