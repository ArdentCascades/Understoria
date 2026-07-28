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
// French per-task tips (i18n Phase 2b). Loaded lazily via
// content/bundles/fr.ts — never import this statically from app
// code.
export const TASK_TIPS_FR: Record<string, readonly string[]> = {
  "community-fridge": [
    "Vérifie que la prise est une prise extérieure dédiée, protégée par un différentiel, et qu'elle reste alimentée après la fermeture — beaucoup de prises extérieures de commerces dépendent d'un interrupteur intérieur que quelqu'un éteint le soir, et le frigo se réchauffe avant le matin.",
    "Fais tourner tout frigo donné une journée entière avant de construire autour — et laisse une largeur de main derrière lui : un condenseur enfermé surchauffe et lâche à la première canicule.",
    "Plastifie le panneau, sinon il sera en bouillie après la première pluie — et formule la liste des « non » comme de la sécurité, pas comme des reproches, pour que les gens fassent confiance au frigo au lieu de se sentir surveillés.",
    "Mets deux noms sur chaque créneau, pas un seul — une seule absence, et voilà comment un frigo passe une semaine sans coup d'éponge. Un journal daté scotché à l'intérieur montre à la personne suivante quand il a été nettoyé pour la dernière fois.",
    "Parle aux commerçants frileux des protections légales pour le don alimentaire — la peur d'être tenu responsable est le « non » habituel, et se savoir couvert le transforme en oui. Ensuite, fixe une heure de collecte immuable.",
    "Utilise une ligne partagée ou un numéro gratuit type Google Voice, pas le portable personnel d'une personne bénévole — quand elle déménage ou s'épuise, le numéro affiché sur le frigo ne doit pas mourir avec elle."
  ],
  "community-garden": [
    "Mets par écrit deux choses que les accords de poignée de main oublient : qui paie l'eau, et avec quel préavis la personne propriétaire peut reprendre le terrain — un jardin délogé en pleine saison perd le travail d'une année entière.",
    "Prélève des échantillons à plusieurs endroits, pas un seul — le plomb se concentre près des vieux murs peints et des clôtures. Envoie le test des semaines avant la journée de chantier : les résultats traînent, et tu ne peux pas dessiner les bacs sans eux.",
    "Écarte les traverses de chemin de fer et le vieux bois traité pour des bacs nourriciers — ils relarguent créosote et arsenic dans ta nourriture. Le cèdre brut, le parpaing ou les bottes de paille sont plus sûrs.",
    "Écris maintenant les clauses ennuyeuses : ce qui arrive à une parcelle quand quelqu'un disparaît en pleine saison, et qui hérite des outils si le groupe se dissout. Décider pendant que tout le monde s'entend bien sauve l'amitié plus tard.",
    "Cale tes dates sur la dernière gelée locale, pas sur le calendrier ni sur un sachet de graines venu d'un autre climat — une gelée surprise peut raser toute la plantation du week-end d'ouverture.",
    "Attribue d'abord les créneaux de juillet et d'août — c'est là que le roulement s'effondre et que les bacs meurent, pas au printemps. Arrose à l'aube, pas en plein midi, pour que l'eau s'infiltre au lieu de s'évaporer sur les feuilles chaudes.",
    "Récolte souvent, même quand personne n'a faim — haricots, concombres et courgettes s'arrêtent de produire dès qu'on les laisse monter en graine. Apporte le surplus au frigo le jour même ; des verdures flétries n'aident personne."
  ],
  "tool-lending-library": [
    "Choisis un endroit sec et qui ferme à clé, et règle la question des retours avant d'ouvrir : un bac de dépôt étiqueté ou une trappe hors permanence évite que tu sois la seule porte d'accès à toute la collection.",
    "Branche et fais tourner chaque outil électrique avant de l'accepter — une perceuse qui tourne à vide mais cale sous charge, c'est de la ferraille. Vérifie les câbles entaillés et les carters de lame : ce sont ces blessures-là qui engageront ta responsabilité.",
    "Note dès maintenant le coût de remplacement de chaque outil dans le catalogue — c'est le chiffre qu'il te faudra pour décider si un objet jamais rendu vaut la peine d'être réclamé. Marque le nom de ta bibliothèque sur chaque outil pour que « je croyais qu'il était à moi » ne puisse pas arriver.",
    "Une courte décharge de responsabilité à l'inscription compte plus que des pénalités de retard — écris noir sur blanc que chaque personne utilise les outils à ses propres risques. Pas de caution sur les objets du quotidien, pour que le coût ne soit pas une barrière ; réserve-la aux une ou deux choses chères.",
    "Prends un numéro de téléphone auquel tu pourras vraiment écrire plus tard, pas juste un nom — c'est le petit rappel qui fait revenir les outils, et tu ne peux pas l'envoyer à une signature. Confirme le numéro sur place.",
    "Enseigne les moments gênants, pas seulement le prêt : comment refuser gentiment un don cassé, et comment noter un dégât au retour sans donner l'impression d'accuser. Montre où vivent la trousse de premiers secours et les lunettes de protection.",
    "Note chaque « vous avez… ? » resté sans réponse — c'est cette liste, pas tes intuitions, qui te dit quoi acheter ensuite. Affûte et huile à date fixe pour que l'entretien ne devienne pas « jamais » en silence."
  ],
  "neighborhood-care-network": [
    "Garde cette « carte » dans ta tête ou sous clé, pas dans un tableur partagé — une liste de voisins isolés et vulnérables, c'est exactement ce que tu ne veux pas voir fuiter. Laisse des personnes de confiance faire les présentations plutôt que de frapper aux portes à froid.",
    "Appelle vraiment les références — ne te contente pas de les collecter. Deux personnes qui se portent garantes, plus une règle ferme de « jamais seul avec l'argent ou les clés d'un voisin », écartent le rare profil malveillant attiré précisément par cet accès.",
    "Présente le premier binôme comme un essai, et donne aux deux personnes une porte de sortie élégante, sans justification — un binôme dont personne ne peut sortir devient une obligation, et les obligations finissent lâchées d'un coup.",
    "Cale la prise de nouvelles sur un jour et une heure fixes pour qu'un rendez-vous manqué se remarque — « elle répond toujours le mardi », c'est ce qui transforme un téléphone muet en signal plutôt qu'en haussement d'épaules.",
    "Demande dès maintenant à chaque voisin qui appeler en cas de crise — et si c'est la famille plutôt que la police. Une visite de contrôle peut mal tourner pour des voisins sans papiers, handicapés ou noirs ; respecte leur choix avant que ce soit une urgence.",
    "Garde les bénévoles sur de l'aide non médicale — trajets, courses, un trottoir déneigé. Dès que ça glisse vers les doses de médicaments, les soins de plaies ou porter quelqu'un, c'est le travail d'un professionnel formé, et le dire protège tout le monde.",
    "Fais tourner les gens avant qu'ils soient à plat, pas après leur départ — quand quelqu'un dit qu'il n'en peut plus, il porte ça depuis des mois en général. Un échange en tête-à-tête recueille aussi le chagrin quand un voisin dont on s'occupe décline."
  ],
  "emergency-preparedness": [
    "Consulte les vraies cartes officielles d'inondation et de feux de ta zone au lieu de deviner — et note qui fait tourner du matériel médical sur le courant : les fournisseurs d'électricité tiennent des listes de rétablissement prioritaire où ces voisins peuvent s'inscrire dès maintenant.",
    "Garde la liste papier dans au moins deux maisons, pas une — toute la chaîne ne sert à rien si elle est dans la seule maison inondée. Note directement sur la feuille qui a besoin d'un toc à la porte plutôt que d'un appel, et dans quelle langue.",
    "Convenez d'un seul canal radio et d'une heure de contact fixe — « au début de chaque heure » — sinon tout le monde émet dans le vide. Teste vraiment les radios à la distance réelle du quartier avant de compter dessus.",
    "L'eau et les piles se périment — scotche une date de rotation sur le kit et mets-la sur le même calendrier que la mise à jour de la liste. Range-le là où deux ou trois personnes peuvent l'atteindre, pour qu'une porte fermée à clé ne se dresse pas entre vous et le matériel.",
    "Confirme trois choses qu'une poignée de main oublie : qui a la clé à 2 h du matin, si le groupe électrogène a du carburant en réserve, et si le lieu est accessible en fauteuil roulant. Un point sûr où tu ne peux pas entrer n'est qu'un bâtiment.",
    "Fais localiser physiquement aux gens leurs vannes de gaz et d'eau et la clé qu'il faut — le lire ne compte pas. Chronomètre la chaîne de contacts de bout en bout ; tu trouveras le maillon cassé maintenant plutôt que pendant une inondation.",
    "Nomme une doublure pour chaque rôle — la personne référente de rue sera peut-être justement coincée ou en déplacement ce jour-là. Double surtout les vérifications des personnes médicalement vulnérables ; c'est la liste qui ne peut pas attendre."
  ],
  "free-store": [
    "Privilégie un rez-de-chaussée avec un trottoir où se garer — tu vas trimballer des coffres entiers dans les deux sens, et un troisième étage sans ascenseur épuise tes bénévoles avant l'ouverture. Une date fixe et récurrente installe l'habitude qui fait vivre le lieu.",
    "Affiche la liste des « non » à la porte des dépôts, pas seulement à l'intérieur — au tri, c'est déjà trop tard. Ajoutes-y les sièges auto d'occasion, les casques et les matelas : leur sécurité expire sans se voir, et une punaise de lit dans un don peut fermer ta boutique.",
    "Trie à la porte, avant que rien n'atteigne une table — un grille-pain cassé qui arrive au rayon devient ton problème deux fois. Garde toute la journée un bac étiqueté « à redonner » pour que la pile des refus ne devienne jamais une montagne.",
    "Sors-en moins que tu n'en as et réapprovisionne depuis l'arrière au fil de la journée — une table à moitié vide et rangée se lit comme un magasin digne ; un tas entassé se lit comme « voilà nos poubelles ».",
    "Explique à l'accueil qu'on ne demande jamais pourquoi quelqu'un est là ni combien il emporte — la règle du sans-questions est tout l'enjeu, et une seule personne bénévole curieuse la défait. Garde quelqu'un en vadrouille pour ranger, que l'espace n'ait jamais l'air pillé.",
    "Confirme les horaires de ton association partenaire et ce qu'elle accepte vraiment avant l'événement, pas après — beaucoup refusent matelas, électronique et lots incomplets. Vide tout le jour même pour rendre l'espace vide et garder l'hôte."
  ],
  "skill-share": [
    "Les meilleurs profs disent souvent que leur savoir-faire n'a « rien de spécial ». Oublie « en quoi es-tu expert ? » et demande plutôt pour quoi les gens viennent toujours leur demander de l'aide.",
    "La peur, c'est le grand silence : aide chaque personne qui débute à planifier les cinq premières minutes, minute par minute ; une fois les mains occupées et la conversation lancée, le trac s'en va tout seul.",
    "Vérifie que la salle colle à ce que la séance demande vraiment avant de réserver — un cours de cuisine dans une pièce sans évier échoue à mi-chemin. Et confirme qui ouvre et qui ferme.",
    "Confirme avec chaque prof la semaine qui précède sa séance. Un prof absent avec un horaire déjà publié te coûte les personnes qui, elles, sont venues — et certaines ne reviendront pas.",
    "Interroge les personnes précises qui ne viennent pas, pas la salle déjà présente. L'obstacle tient d'habitude à une chose concrète — un bus qui s'arrête à sept heures, nulle part où laisser les enfants."
  ],
  "bulk-buying-coop": [
    "Recrute environ un cinquième de foyers de plus que le minimum du fournisseur. À chaque cycle, quelques-uns passeront leur tour, et une commande trop courte ne part pas — ou part à un prix pire pour tout le monde.",
    "Demande le minimum de livraison, la politique en cas de manquants, et si les prix se figent à la commande ou à la livraison. Un « super prix » qui flotte jusqu'à la livraison peut ruiner tes calculs de répartition.",
    "Verrouille la feuille à la date limite — copie-la et ferme les modifications — pour qu'aucun changement tardif ne touche les quantités après que la coordination a totalisé la commande et payé le fournisseur.",
    "Calcule le prix à l'unité au centime près et arrondis vers le haut, jamais vers le bas. Les fractions que tu absorbes s'accumulent sur un cycle, et la marge doit couvrir un sac de riz éventré, pas dormir comme cagnotte.",
    "Confirme comment le camion décharge vraiment — hayon, transpalette, ou tout posé au bord du trottoir. Une palette d'une demi-tonne sans moyen de la descendre, c'est rude à découvrir le matin de la livraison.",
    "Fais la tare à chaque récipient et pèse directement dans le sac que chaque foyer emporte. Estimer « à peu près un kilo » à l'œil, sur un produit cher, c'est là que la confiance et l'argent fuient sans bruit.",
    "Note ce que la coordination a réellement fait ce cycle-ci pendant que c'est frais. Le rôle ne tourne sans accroc que si la personne suivante hérite d'une liste de gestes, pas d'un mystère."
  ],
  "repair-cafe": [
    "Les personnes qui réparent l'électronique et l'électroménager attirent les files les plus longues et s'épuisent en premier — recrutes-en deux avant d'ouvrir, et oriente les victoires faciles, ourlets et vis desserrées, vers les mains plus nouvelles.",
    "Garde la soudure, la chaleur et les batteries loin du public et près d'une aération, et fais passer le courant par quelques multiprises avec parafoudre que tu as testées — faire sauter le disjoncteur du lieu arrête tous les postes d'un coup.",
    "Un jour fixe du mois — le premier samedi, par exemple — vaut mieux qu'une date flottante. Les gens retiennent un rythme, et tes réparateurs peuvent bloquer le créneau des mois à l'avance au lieu de renégocier à chaque fois.",
    "Note un tri rapide dès l'accueil — sans doute réparable, peu probable, ou pièce à commander — pour que personne n'attende une heure dans la file juste pour apprendre que son grille-pain était perdu d'avance.",
    "Trace une limite ferme sur les appareils secteur ouverts et les batteries gonflées : une personne qui doute dit non, et c'est la bonne décision, pas un échec. Affiche-le pour que personne ne prenne le non pour soi.",
    "Garde une caisse commune et une feuille de comptage à chaque poste. La rustine ou le fusible manque toujours le jour où personne n'a vérifié, et « qui a payé le fil la dernière fois » est une dispute qu'on peut s'éviter."
  ],
  "rides-transportation": [
    "Regarde les documents en vrai — ne te contente pas d'un « oui oui, je suis couvert ». Une photo du permis et de la carte d'assurance à jour dans le dossier, c'est ce qui protège tout le monde le jour où quelque chose tourne vraiment mal.",
    "Demande par écrit à l'assureur de chaque conducteur si la conduite bénévole est couverte. Beaucoup de contrats personnels excluent tout ce qui ressemble à un service, et tu veux cette réponse avant un sinistre, pas après.",
    "Note dès le départ le trajet retour et tout matériel de mobilité. Une personne coincée au centre de santé parce que le fauteuil roulant n'entrait pas dans la voiture, c'est l'échec dont les gens se souviennent le plus longtemps.",
    "Confirme avec la personne qui conduit et celle qui voyage la veille, de vive voix ou par écrit. Supposer en silence que le trajet tient toujours, c'est exactement comme ça qu'on rate une séance de dialyse.",
    "Nomme franchement ce que vous ne faites pas — pas d'urgences, pas de dernière minute, pas au-delà de la zone — pour qu'un non arrive comme une règle connue et pas comme un rejet personnel au mauvais moment.",
    "Ne laisse jamais voir qu'une personne ne peut pas participer aux frais. Garde toute contribution vraiment libre et invisible au moment du trajet, sinon tu as reconstruit sans bruit l'obstacle que tu voulais lever.",
    "Associe le premier trajet d'une personne qui conduit à un passager déjà connu ou à un deuxième bénévole, et prends des nouvelles après. Le journal des trajets n'est pas de la paperasse — c'est ce que tu regretteras de ne pas avoir si une inquiétude remonte un jour."
  ],
  "tenant-union": [
    "Choisis des gens qui savent garder une confidence, pas seulement les voix les plus fortes. Ce travail repose sur des locataires qui confient au comité un vrai risque de représailles, et une seule fuite met fin à cette confiance.",
    "N'écris jamais le nom d'une personne à côté de sa plainte là où un propriétaire pourrait le voir — code les logements, garde la clé des noms à part, et demande avant de noter qui que ce soit.",
    "Date chaque info et note le texte de loi derrière. Le droit des locataires bouge, et « quelqu'un me l'a dit l'an dernier », c'est comme ça qu'un syndicat donne un délai déjà faux.",
    "Fais un exercice avant d'en avoir besoin, et promets un délai de réponse tenable. Une chaîne téléphonique que personne n'a testée reste muette pile au moment où quelqu'un se fait mettre dehors.",
    "Termine par le premier geste concret pour qui reçoit des papiers — l'échéance et le numéro à appeler — parce que c'est la seule chose qu'une personne locataire inquiète rapportera vraiment chez elle ce soir-là.",
    "Mets l'échéance de réponse au tribunal en premier et en gras. La rater fait souvent perdre le dossier par défaut, aussi solide que soit la cause de la personne.",
    "Apprends les horaires d'accueil et la capacité réelle de chaque partenaire, pas juste son numéro. Orienter vers une permanence pleine ou fermée jusqu'à lundi n'est pas un relais quand l'échéance tombe vendredi."
  ],
  "childcare-collective": [
    "Parlez maintenant, à voix haute, des différences sur la discipline et les écrans. La dispute vient rarement du planning — elle vient du jour où quelqu'un élève ton enfant d'une façon que tu n'accepterais jamais.",
    "Écris la règle jamais-seul comme celle que tu appliques le plus fermement avec les familles en qui tu as le plus confiance. L'exception « juste pour cette fois » avec un ami proche, c'est exactement là que ces collectifs se brisent.",
    "Mets-toi à hauteur d'yeux d'enfant et fais le tour de la pièce à quatre pattes — câbles, meubles qui basculent, le sac d'une invitée avec des médicaments dedans. Les dangers qu'un adulte ne voit plus sont ceux qu'un tout-petit trouve en premier.",
    "Rends le solde de crédits visible pour tout le monde dès le premier jour. La rancœur pousse en secret, et une famille qui voit où elle en est proposera d'accueillir avant qu'on ait à demander.",
    "Garde la fiche allergies-médicaments de chaque enfant là où la personne de garde peut l'attraper en quelques secondes, et fixe la règle de l'enfant malade avant qu'un matin de fièvre force un appel précipité et mal vécu.",
    "Répétez la vraie urgence — qui appelle, qui reste avec les autres enfants, où vivent les fiches d'urgence. Connaître le sommeil sûr des bébés sert peu si personne n'a en tête les soixante premières secondes.",
    "Demande aux enfants comment ça s'est passé, pas seulement aux parents, et débriefez honnêtement les presque-accidents. Un pilote tranquille qui a esquivé les cas durs n'a pas testé ce qui mettra vraiment la confiance à l'épreuve."
  ],
  "community-composting": [
    "Debout sur le site, repère le robinet le plus proche et la fenêtre du voisin le plus proche ; un tas difficile à arroser, ou juste sous la chambre de quelqu'un, c'est celui que tu déplaceras avant l'été.",
    "Un tas chaud a besoin d'environ un mètre cube de matière pour vraiment chauffer et tuer les graines d'herbes folles — en dessous, tu as bâti un tas froid qui reste posé là, peu importe le nom du bac.",
    "Assure ta matière brune avant l'arrivée du premier reste — un tas de feuilles ou une réserve de carton où puiser — parce que les restes alimentaires arrivent chaque jour et que les feuilles mortes ne tombent qu'une fois l'an.",
    "Dis aux gens de laisser tomber les sacs plastiques « compostables » : ils ne se dégradent pas dans un tas de jardin et deviennent les lambeaux de plastique que tu tries dans le compost fini pendant des mois.",
    "Mets la liste des non sur le couvercle du bac lui-même, pas sur une affiche à côté, et utilise des images — un os de poulet barré se lit dans toutes les langues plus vite qu'un paragraphe.",
    "Enseigne le test de l'éponge essorée pour l'humidité et confie chaque semaine à une personne nommée, pas à « l'équipe » — une corvée partagée sans nom dessus, c'est la semaine où le tas saute.",
    "Laisse un bac fini mûrir quelques semaines de plus et tamise les gros morceaux avant de le donner — un compost encore « en cuisson » brûle les semis qu'il devait nourrir, et cette histoire-là voyage."
  ],
  "free-little-library": [
    "La fuite qui ruine les livres ne vient pas du toit — c'est la fente de la porte et l'eau qui remonte par le poteau ; scelle le fond, ajoute un rebord sous la porte et teste-la au jet d'eau avant de la remplir.",
    "Place-la là où les gens ralentissent déjà — un arrêt de bus, une grille d'école — pas là où ils passent en voiture, et laisse le trottoir dégagé pour qu'un fauteuil roulant ou une poussette passe.",
    "Les livres pour enfants partent le plus vite et reviennent le moins, alors mets-en d'avance ; et recycle discrètement les dons tachés d'eau ou les manuels des années 90 avant qu'ils entrent — une étagère de rebut et les gens n'ouvrent plus la porte.",
    "Quoi que dise le panneau, fais-le sonner comme une invitation, pas comme une obligation — des gens prendront des livres sans en laisser, et c'est très bien ; si les gens se sentent obligés d'en rendre un, ils ne prendront pas celui dont ils ont besoin, et tout le but était qu'il n'y ait aucune barrière.",
    "Prévois aussi une personne remplaçante, et dis aux deux quoi retirer à vue : tout ce qui a de la moisissure, tout ce qui porte le numéro de téléphone d'un inconnu, et les titres pour adultes dans une boîte où les enfants fouillent."
  ],
  "community-first-aid-training": [
    "Demande leurs tarifs et s'ils y renoncent pour les groupes communautaires — beaucoup le font — et fixe le plafond de personnes par mannequin : un cours de RCP à plus de huit autour d'un seul, c'est regarder, pas pratiquer.",
    "Vérifie les dates de péremption de la naloxone le jour où elle arrive et note-les là où tu les verras vraiment — et ne la stocke ni dans une voiture chaude ni dans un cabanon glacé ; les températures extrêmes la dégradent avant la date.",
    "Il te faut du sol dégagé pour s'agenouiller et faire des compressions, pas seulement des chaises et des tables — vérifie que la salle en a, plus un point d'eau et une entrée accessible, avant de réserver.",
    "Les formations gratuites perdent 30 à 40 % des inscrits, alors confirme la veille et prévois un peu plus large ; proposer une garde d'enfants et à manger fait plus pour la présence des gens que tu veux le plus voir que n'importe quelle affichette.",
    "Dis dès le début que la pratique se fait sur mannequins, que personne n'a à toucher personne, et qu'on peut sortir pendant la partie surdoses — dans la salle, certaines personnes ont perdu quelqu'un, et tu veux les revoir la prochaine fois.",
    "Tiens une liste simple de qui a pris de la naloxone et de sa date de péremption pour souffler le renouvellement à temps, et cale le premier rappel dans l'année — les mains oublient les compressions plus vite qu'on ne croit."
  ],
  "time-bank": [
    "Pousse les gens à nommer ce qu'ils demanderaient, pas seulement ce qu'ils donneraient — tout le monde liste des offres et personne n'avoue de besoins, et une banque où personne ne dépense est une banque où personne ne gagne.",
    "Choisis la chose la plus simple que la personne coordinatrice tiendra vraiment à jour, et vérifie que le registre s'exporte — le jour où votre seule bénévole à l'aise en informatique déménage, une appli fermée emporte tout l'historique avec elle.",
    "Décidez maintenant ce qui se passe quand quelqu'un part avec un solde en négatif ou y reste longtemps — écrire cette règle pendant que tout le monde s'entend bien est bien plus facile que l'inventer la première fois que ça pique.",
    "Fais réserver à chaque nouveau membre un vrai échange avant la fin de l'accueil — la philosophie s'ancre quand on a dépensé un crédit, pas quand on a écouté le discours.",
    "Note quand et où les gens sont disponibles, pas seulement ce qu'ils savent faire — « plomberie » n'aide personne si le membre n'a que le mardi matin et pas de voiture, et un annuaire périmé apprend sans bruit aux gens à ne plus l'ouvrir.",
    "Repère les membres qui ont gagné sans jamais dépenser, ou qui ont adhéré sans jamais échanger, et écris-leur par leur nom — les personnes discrètes ne se plaignent pas, elles s'éloignent, et on ne le remarque que quand elles sont déjà parties.",
    "Pour les échanges à domicile, propose une première rencontre dans un lieu public et une façon simple de décliner une mise en relation sans se justifier — et confie les soucis à une personne, pas à un formulaire, sinon les gens cessent de venir sans rien dire."
  ],
  "solidarity-fund": [
    "Garde une équipe petite et en nombre impair pour que les votes ne se bloquent pas, et convenez d'avance que chaque personne se retire quand un ami ou un proche fait une demande — l'apparence de favoritisme coule une caisse aussi vite que le favoritisme réel.",
    "Ne fais jamais passer l'argent par l'appli de paiement ou le compte personnel d'un bénévole, aussi pratique que ce soit — on ne sait plus à qui est l'argent, ça lui crée un casse-tête fiscal, et ça donne exactement la mauvaise impression le jour où quelqu'un pose des questions.",
    "Fixe à la fois un plafond par demande et un total mensuel à ne pas dépasser, pour que quelques grosses demandes de départ ne vident pas la caisse et ne te laissent pas dire non à tout le monde dès la troisième semaine.",
    "Demande comment la personne préfère recevoir l'argent, et rien que tu n'aies vraiment besoin de savoir — pas de numéro de pièce d'identité, pas de lettre du propriétaire ; chaque justificatif exigé, c'est une famille qui renonce en silence et ne demande pas.",
    "Mise sur de petits dons réguliers plutôt que sur une seule grande collecte — une caisse qui reçoit 200 € chaque mois peut promettre de l'aide le mois prochain, alors qu'une caisse qui a récolté 5 000 € une fois rationne déjà à l'automne.",
    "Fixe un petit montant que deux personnes peuvent approuver le jour même, sans réunion complète — quand l'électricité de quelqu'un saute un vendredi, une décision qui attend l'appel de groupe du mardi n'est pas de l'aide, c'est de la paperasse.",
    "Publie des totaux et des nombres, jamais d'histoires — même une anecdote « anonymisée » sur une maman solo de la rue des Ormes reste reconnaissable pour le voisinage, et une personne aidée qui se sent exposée fera fuir les dix suivantes qui ont besoin d'aide."
  ],
  "diaper-hygiene-bank": [
    "Les couches et les serviettes absorbent l'humidité et attirent les nuisibles : choisis un stockage vraiment sec et bien fermé — et place le point de remise de façon qu'une famille ne récupère pas ses paquets devant toute la salle d'attente.",
    "Vérifie si un réseau de banques de couches ou un grossiste accepte de te vendre au prix du carton — les collectes apportent un déluge de tailles nouveau-né, mais les tailles 4, 5 et 6, celles qui manquent vraiment aux familles, il faudra presque toujours les acheter.",
    "Défais les gros cartons en lots prêts à remettre dès leur arrivée, pas au moment de la remise — et compte par taille à chaque fois, parce que « on a des couches » ne veut rien dire quand tout est en taille 1 et que chaque demande porte sur la taille 5.",
    "Dis clairement qu'une dotation mensuelle (souvent autour de 25 à 50 couches) est un complément, pas la totalité — les familles s'organisent mieux autour d'un chiffre honnête qu'autour d'un vague « autant qu'on en a ».",
    "Tiens-la le même jour, à la même heure, à chaque cycle pour que les familles puissent organiser leur mois autour, et rappelle aux bénévoles de simplement remettre le paquet — pas de questions sur le bébé, pas de preuve, pas d'histoire à raconter."
  ],
  "community-bike-workshop": [
    "Une douzaine de vélos donnés avale vite le sol — mesure les murs pour des crochets verticaux avant de t'engager, et vérifie que le local ferme assez bien pour qu'une rangée de cadres ne s'envole pas pendant la nuit.",
    "Trace le contour de chaque outil sur un panneau perforé pour qu'une clé manquante saute aux yeux à la fermeture — les ateliers ouverts perdent vite leurs outils, et chercher la clé de 15 casse l'élan d'une séance.",
    "Pose un « non » ferme aux vélos de supermarché rouillés avant de lancer l'appel — ils coûtent plus d'heures qu'un vélo en état ne vaut, et « on s'en occupera » est la façon dont une cour se remplit de ferraille.",
    "Le meilleur mécano et le meilleur pédagogue sont rarement la même personne — regarde si la personne candidate sait se retenir et laisser une débutante batailler avec le boulon, parce que tout le travail est là.",
    "Donne à chaque personne du programme « gagne ton vélo » une carte à tamponner ou des heures notées que n'importe quel mécano peut lire — la progression qui ne vit que dans la mémoire d'un bénévole s'évapore la semaine où il est malade.",
    "Fais de la vérification freins-pneus une ligne signée sur une fiche, idéalement par quelqu'un d'autre que la personne qui a monté le vélo — un regard neuf repère la fixation rapide mal serrée que ne verra pas qui a passé l'après-midi dessus."
  ],
  "newcomer-translation-network": [
    "Parler couramment n'est pas interpréter couramment — demande à la personne candidate de restituer une phrase médicale ou de logement dans les deux sens avant de compter sur elle, et fais correspondre les dialectes, pas seulement les langues.",
    "Note pour chaque adresse si on y demande des papiers ou le statut, et quelles langues y sont vraiment parlées — envoyer quelqu'un vers un lieu qui le refoule à la porte coûte une confiance difficile à rebâtir.",
    "Note les demandes avec un prénom et un numéro de rappel, rien de plus — un beau tableur de qui a besoin de quoi, relié à de vraies identités, est exactement le fichier qui peut fuiter ou être réquisitionné.",
    "Fais lire le brouillon à voix haute par quelqu'un de chaque communauté avant d'imprimer — une traduction automatique ou mot à mot des droits et des transports sonne comme du charabia, ou pire, comme de mauvaises consignes.",
    "Rappelle aux bénévoles de tout restituer à la première personne et de ne rien ajouter — dès qu'un interprète répond à la place du soignant ou de la personne, plus personne ne se fait confiance dans la pièce, et quelqu'un est moins bien soigné.",
    "Écris combien de temps chaque donnée est gardée et à qui on peut répondre « nous ne recueillons pas ça » — décide ta réponse à une demande de dossiers maintenant, calmement, pas au moment où un fonctionnaire se tient devant la table."
  ],
  "community-meal": [
    "Avant de craquer pour une jolie salle, vérifie ce que regardera un contrôleur : un lave-mains séparé, de l'eau chaude et assez de place au frigo — une cuisine qui ne passe pas le contrôle est une cuisine que tu ne peux pas utiliser.",
    "Demande précisément aux autorités sanitaires les allègements pour repas solidaires — beaucoup d'endroits ont une voie plus simple pour les cuisines bénévoles — et lance tout de suite la formation en hygiène, parce que les sessions se remplissent des semaines à l'avance.",
    "Engage chaque donateur sur un jour et une quantité précis plutôt que sur « ce qui reste » — un menu bâti sur une promesse qui ne vient pas, c'est une course aux courses une heure avant le service, chaque semaine.",
    "Un plat principal naturellement végétarien, sans fruits à coque ni fruits de mer, que tout le monde mange, vaut mieux qu'une « assiette allergies » à part qu'on oubliera dans le rush — cuisine pour le besoin le plus strict et étiquette quand même.",
    "Prévois plus de bras qu'un créneau n'en demande strictement et forme une seconde personne à mener la cuisine dès la première semaine — le repas qui dépend d'une seule présence est à une grippe de l'annulation.",
    "Choisis un jour et une heure tenables pendant un an, pas les plus ambitieux — les gens organisent leur semaine autour d'un repas fiable, et une soirée annulée leur apprend à ne pas compter sur vous.",
    "Mets les restes en bacs peu profonds et au frigo dans les deux heures — la nourriture gardée tiède sur le plan de travail « pour après le nettoyage », c'est exactement comme ça qu'un bon repas rend quelqu'un malade le lendemain."
  ],
  "seed-library": [
    "Garde le meuble loin des murs extérieurs, des fenêtres au soleil et des bouches de chauffage — ce sont l'humidité et les écarts de température, pas l'âge seul, qui tuent la graine ; frais et sec vaut mieux qu'un emplacement en vue.",
    "Écarte les graines enrobées de rose ou de bleu et les hybrides brevetés — la graine traitée ne se manipule pas à la légère, et les hybrides ne redonnent pas la même plante si quelqu'un essaie d'en récolter.",
    "Écris l'année en grand sur chaque sachet et range les plus vieux devant — quand tout un lot porte le code couleur « facile pour débuter », une personne qui vient pour la première fois se sert seule, sans qu'on la surveille.",
    "Limite le nombre de sachets d'une même variété par personne pour qu'un passionné ne vide pas le tiroir, et présente le retour comme un cadeau, pas une dette — culpabiliser les gens, c'est juste les faire arrêter de venir.",
    "Teste un lot douteux avec dix graines dans un essuie-tout humide pendant une semaine — si moins de six germent, retire-le plutôt que de renvoyer une débutante chez elle avec des graines qui n'allaient jamais lever."
  ],
  "digital-literacy": [
    "Fais déconnecter le compte iCloud ou Google de la personne qui donne avant que l'appareil ne quitte ses mains — une tablette verrouillée à l'activation est un presse-papier qu'aucun effacement ne répare, et courir après le donateur ensuite marche rarement.",
    "Étiquette chaque appareil et note son numéro de série avec le prêt — et prête le chargeur en lot numéroté, parce que l'objet le plus souvent « perdu » n'est pas l'ordinateur, c'est le bloc d'alimentation que personne n'avait noté.",
    "Vérifie le plafond de données avant de confier un point d'accès — un forfait bridé après quelques gigas ne survit pas à une seule téléconsultation en vidéo, et la personne accusera l'appareil, pas le forfait.",
    "Fais un petit jeu de rôle où la personne qui accompagne doit guider un débutant nerveux dans une tâche sans toucher l'appareil — l'habitude la plus dure à perdre est d'attraper la souris, et mieux vaut la perdre avant qu'une vraie personne soit sur la chaise.",
    "Fais des captures des écrans exacts que verront les apprenants et imprime-les en grand — une fiche générique « comment envoyer un e-mail » embrouille dès que l'écran est différent, et une compétence par page vaut mieux qu'un livret que personne n'ouvre.",
    "Garde une deuxième personne libre de circuler pendant les permanences — sinon un problème épineux de « mon compte est bloqué » avale toute la séance pendant que les autres attendent et décrochent.",
    "Efface à l'entrée comme à la sortie, et rappelle d'abord de sauvegarder photos et fichiers — les gens oublient que tout vit sur cet appareil, et une remise à zéro le jour du retour qui efface les photos d'un petit-enfant, c'est une blessure."
  ],
  "weatherization-brigade": [
    "Éprouve une nouvelle recrue sur un travail sans gros enjeu avant de l'envoyer chez quelqu'un, et méfie-toi de qui veut en faire plus que le périmètre ne permet — c'est l'excès de confiance, pas l'inexpérience, qui abîme la maison d'un résident.",
    "Ajoute la peinture au plomb et les vieux isolants à la liste « on s'arrête et on oriente », à côté du gaz et de l'électricité — y toucher sans formation dans un logement ancien est illégal et vraiment dangereux pour la santé, et ça se cache exactement dans les surfaces qu'on voudrait calfeutrer.",
    "Envoie deux personnes à chaque visite d'évaluation, photographie tout et ne promets pas de date sur le pas de la porte — le « petit joint vite fait » qui révèle de la moisissure ou un câblage d'un autre âge demande un second regard posé, pas un oui enthousiaste.",
    "Achète selon la liste de matériaux de la visite, pas au jugé, et choisis des produits peu odorants, à faible teneur en COV, pour les logements habités — une personne âgée ne peut pas aérer sa maison une journée entière, et le mauvais mastic extérieur se décolle avant l'hiver suivant.",
    "Fais confirmer par écrit que votre assurance couvre bien la réparation bénévole à domicile — beaucoup de contrats de responsabilité l'excluent sans le dire — et traite les échelles comme le vrai danger ici : ce sont les chutes, pas les outils électriques, qui envoient ces équipes aux urgences.",
    "Appelle pour confirmer le matin même, pas seulement la semaine d'avant — une personne âgée inquiète qui a oublié votre venue peut ne pas ouvrir la porte — et apporte ton eau et ton matériel de nettoyage pour que la visite n'alourdisse pas ses factures."
  ],
  "pet-food-bank": [
    "La nourriture pour animaux attire les rongeurs encore plus que le garde-manger : range-la dans des bacs hermétiques surélevés, sinon tu nourriras les souris avant le voisinage.",
    "Demande aux animaleries ce qu'elles font des sacs déchirés ou abîmés qu'elles ne peuvent pas vendre — cette nourriture est en général très bonne, et c'est une source plus stable que les collectes ponctuelles.",
    "Mets à part et étiquette les aliments vétérinaires ou sur ordonnance — ils ne sont pas interchangeables, et le mauvais peut aggraver l'état d'un animal malade.",
    "Avant de fixer une portion, demande combien d'animaux et de quelle taille — un foyer avec deux chats et une maison avec un dogue, ce n'est pas le même « un sac ».",
    "Prévois de la nourriture pour chats et pour chiens à chaque distribution, et laisse chaque personne prendre seulement ce que son animal mange — rien ne blesse comme repartir avec un sac que ton animal ne peut pas manger."
  ],
  "youth-mentorship": [
    "Confirme que la même salle est à toi pour tout le trimestre, pas juste ce mois-ci — les enfants qui ont déjà été déçus ont besoin que l'espace soit là chaque semaine, sans exception.",
    "Rédige la règle des deux adultes pour qu'elle couvre aussi les toilettes, les trajets de retour et le tutorat en tête-à-tête — c'est là que « seul avec un enfant » arrive vraiment, pas dans la grande salle.",
    "Choisis qui peut s'engager tout le trimestre plutôt que qui brille en entretien — un mentor qui abandonne en octobre fait plus de mal à ces enfants qu'un mentor régulier et ordinaire.",
    "Installe un rythme prévisible — goûter, puis devoirs, puis activité — pour que les enfants sachent toujours ce qui vient ; c'est dans les moments sans structure que la supervision se relâche.",
    "Affiche les allergies graves là où l'équipe les voit à l'heure du goûter, pas seulement dans un classeur, et confirme qui peut venir chercher chaque enfant avant le premier jour.",
    "Garde les goûters sans fruits à coque par défaut et étiquette tout ce que tu ne peux pas garantir — prévoir autour d'un enfant allergique coûte bien moins cher que réagir à une crise.",
    "Compte les têtes à l'arrivée et encore avant chaque départ, et note qui a récupéré qui — un mot rapide avec un parent attrape les soucis avant qu'ils grossissent."
  ],
  "gleaning-network": [
    "Demande à chaque producteur ce qu'il ne faut PAS toucher et où se garer et marcher — la façon la plus rapide de perdre une ferme pour toujours, c'est un bénévole qui piétine un rang qu'on ne t'a pas offert.",
    "Recrute des gens capables de tout lâcher un matin de semaine, pas seulement des renforts du week-end — les fruits mûrs n'attendent pas samedi.",
    "Prévois plus de cagettes et de place dans les véhicules que tu ne l'imagines — un seul arbre « petit » peut donner des centaines de kilos, et des fruits laissés dans une voiture chaude à midi sont du compost le soir.",
    "Compte les oui fermes, pas les peut-être — une liste de dix personnes qui viendront peut-être ne vaut rien face à la fenêtre de deux heures d'un producteur ; sache qui sont les trois qui viendront vraiment.",
    "Fixe la liste des interdits dès le départ — rien qui a touché le sol pour les feuilles, pas de fruits pourris mélangés — parce qu'un seul mauvais lot dans un frigo défait des années de confiance.",
    "Assortis la récolte au débouché avant de cueillir — un petit garde-manger n'écoulera pas 90 kilos de pêches mûres, mais un repas communautaire ou plusieurs frigos, oui.",
    "Pèse la récolte au champ avant de la répartir — ces kilos recrutent ton prochain producteur et ta prochaine bénévole, et tu ne pourras jamais les reconstituer après."
  ],
  "community-mediation": [
    "Le plus dur à enseigner, c'est de rester neutre quand on pense tout bas qu'un côté a raison — choisis des gens capables de vivre avec ça plutôt que de vouloir trancher.",
    "Parle à chaque partie séparément à l'accueil — personne ne nomme sa peur ni un rapport de force avec l'autre personne assise juste à côté.",
    "Choisis une salle en terrain neutre, avec deux sorties et personne qui attend dehors — un lieu où traînent les amis d'une des parties n'est pas vraiment neutre.",
    "Écris la liste d'orientation avant ton premier dossier — la ligne violences conjugales, une juriste des locataires, la ligne de crise — pour qu'un médiateur la tende sur-le-champ, sans improviser.",
    "Décide à l'avance quoi faire si quelqu'un révèle une menace ou des violences sur un enfant en pleine séance — « tout est confidentiel » n'est pas tout à fait vrai, et le promettre peut te piéger.",
    "Va chercher les gens là où les conflits émergent — gestionnaires d'immeubles, syndics, service logement — pas seulement par des affiches ; ce sont eux qui se tiennent à côté d'une dispute quand elle démarre.",
    "Débriefe après chaque dossier difficile, pas une fois par mois — les médiateurs ramènent chez eux les conflits des autres, et l'épuisement se déguise en cynisme avant que quiconque l'admette."
  ],
  "reentry-support": [
    "Appelle chaque ressource pour confirmer qu'elle existe encore et reste vraiment seconde chance, et note le contact humain réel — une orientation morte gaspille les rares premières semaines qui comptent le plus.",
    "Écarte les sauveurs — la personne bénévole qui veut réparer les gens s'épuise et se met à trier ; cherche celle qui sait suivre les objectifs de quelqu'un d'autre sans prendre le volant.",
    "Demande d'abord ce que la personne veut, avant de regarder ce que dit son casier — laisse-la nommer son besoin principal au lieu de dérouler un formulaire ; la dignité ici donne le ton de toute la relation.",
    "Règle d'abord le problème de l'adresse postale — celle d'une organisation partenaire ou une boîte postale — parce que presque toute demande de papiers ou d'aides cale sans elle.",
    "Prépare honnêtement la personne à la question du casier avant l'entretien, et revérifie que l'employeur est vraiment seconde chance ce mois-ci — un refus déguisé blesse plus qu'aucune piste.",
    "Soutiens aussi tes mentors pairs — être la bouée de quelqu'un tout en gérant sa propre réinsertion pèse lourd, alors ne laisse pas un mentor porter cinq personnes.",
    "Écris noir sur blanc qui peut voir l'histoire de quelqu'un et ne partage jamais un casier sans son accord explicite — une mention négligente dans une conversation de groupe peut lui coûter un emploi."
  ],
  "community-wood-bank": [
    "Obtiens par écrit que le bois est à toi et où passe la limite de propriété — un « servez-vous » à l'oral tourne vite au litige pour intrusion ou vol de bois.",
    "Il te faut de la place pour deux ans de bois à la fois — la pile sèche de cet hiver et celle qui sèche pour le prochain — sinon tu brûleras toujours du bois vert.",
    "Budgète jambières et protections des yeux et des oreilles pour chaque personne qui opère avant la deuxième tronçonneuse — l'équipement « qui se partage » finit par quelqu'un qui coupe sans.",
    "Nomme une seule personne qui décide d'y aller ou pas et sait dire non à un bénévole plein de bonne volonté — l'enthousiasme plus une tronçonneuse et personne pour filtrer, c'est comme ça qu'on se blesse.",
    "Demande dès la demande où poser le bois et s'il y a un chemin dégagé et sec jusque-là — déposer un stère qu'une personne de 80 ans ne peut pas déplacer n'aide personne.",
    "Mesure les parts en termes réels — stères, ou semaines de chauffe — pas « un chargement », et reprends des nouvelles au cœur de l'hiver ; le foyer à court en janvier passe en premier l'automne suivant.",
    "Coupe le bois de l'hiver d'ici le printemps, pas à l'automne — le bois dur demande plus de six mois de séchage ; le bois d'octobre pour décembre fume, gaspille la chaleur et encrasse les cheminées de créosote."
  ],
  "community-wifi-mesh": [
    "Cartographie depuis le trottoir, pas depuis une vue satellite — des arbres, un seul mur de briques ou un abribus coupent une ligne de vue qui paraît dégagée d'en haut. Note quel côté de la rue a les toits exposés au soleil.",
    "Obtiens la permission de redistribuer par écrit, et lis toi-même les conditions du fournisseur — beaucoup d'abonnements résidentiels et pros interdisent le repartage, et une mise en demeure peut éteindre tout le réseau du jour au lendemain.",
    "Recrute au moins deux personnes techniques qui ne vivent pas ensemble et n'ont pas le même travail — le réseau meurt la semaine où ton seul admin déménage ou passe de nuit.",
    "Définis le mot de passe administrateur de chaque routeur et range-le dans un gestionnaire partagé avant de rien monter — un nœud resté en réglages d'usine sur un toit, c'est une réparation à deux avec une échelle.",
    "Signe un accord d'une page avec chaque hôte : accès au toit, les quelques sous d'électricité par mois, et qui paie si le nœud est abîmé — un « bien sûr » à l'oral s'évapore quand le propriétaire de l'hôte change.",
    "Affiche la promesse de non-enregistrement là où les gens la voient, et désactive vraiment les journaux — si tu ne collectes jamais de traces d'activité, il n'y a rien à remettre le jour où quelqu'un vient les demander.",
    "Étiquette chaque nœud avec son emplacement et une date de contrôle, et garde un routeur de rechange chargé — la panne que tu vivras vraiment, c'est un nœud mort, pas une reconstruction, et l'échange doit prendre quelques minutes."
  ],
  "mental-health-peer-support": [
    "Choisis pour la stabilité, pas seulement pour le vécu — quelqu'un encore à vif de sa propre crise peut couler en tenant l'espace pour les autres. Demande comment la personne gère une salle qui se tait après une confidence difficile.",
    "Écris les limites comme des choses que le cercle ne fera pas — pas de diagnostic, pas de réparation, pas de remplacement d'un ou d'une thérapeute — parce qu'une liste d'interdits est plus claire pour un membre en détresse qu'une chaleureuse déclaration d'intention.",
    "Vérifie chaque numéro de crise en l'appelant toi-même, et imprime le plan sur papier pour chaque personne animatrice — le soir où tu en auras besoin, le wifi sera en panne ou la ligne coupée depuis un an.",
    "Choisis une salle avec une porte qui ferme et sans parois vitrées, et vérifie qui d'autre utilise le bâtiment à cette heure — un hall partagé ou un collègue qui passe défait la confidentialité avant que quiconque parle.",
    "Lis les règles à voix haute à chaque rencontre, même pour les habitués — la nouvelle personne qui a le plus besoin du « droit de passer son tour » est celle trop nerveuse pour demander s'il existe.",
    "Plafonne le groupe autour de huit — au-delà, les personnes discrètes n'ont jamais leur tour — et choisis un horaire qui n'est ni le vendredi soir ni la sortie du travail, quand les personnes isolées le sentent le plus et peuvent le moins se déplacer.",
    "Donne à l'équipe d'animation un endroit à elle pour déposer, qui ne soit pas le cercle lui-même, et surveille la personne qui ne manque jamais une rencontre et ne prend jamais de pause — c'est l'épuisement qui te la prendra."
  ],
  "community-cleanup": [
    "Visite les sites pressentis à différentes heures avant de t'engager — un terrain calme à 10 h peut être l'endroit où quelqu'un dort ou une décharge qui se remplit chaque nuit, et ça change tout au plan.",
    "Verrouille la destination des déchets avant la date — une benne confirmée ou un ramassage municipal planifié avec un numéro de référence — sinon les sacs ramassés resteront sur le trottoir jusqu'à ce qu'ils s'éventrent.",
    "Apporte un collecteur rigide à aiguilles et des gants épais anti-perforation, pas seulement des gants de jardin — et rappelle à tout le monde qu'aiguilles et contenants inconnus se signalent à un responsable, jamais à main nue.",
    "Attribue une zone et un ou une responsable à chaque groupe de bénévoles avant le jour J, et recrute un tiers de plus — un nettoyage tient sur les gens qui viennent vraiment, moins nombreux que ceux qui s'inscrivent.",
    "Prends les photos d'avant depuis un point fixe où tu pourras te replacer pour la photo d'après — des angles identiques rendent la différence indiscutable et donnent envie de revenir à la prochaine session."
  ],
  "free-tax-prep": [
    "Lance la certification dès l'automne — la formation et les examens VITA s'étalent sur des semaines, et une personne bénévole qui commence en janvier est à peine prête quand la saison est déjà à moitié passée.",
    "Affilie-toi à un programme établi avant de promettre une date à qui que ce soit — c'est lui qui fixe les exigences du site, et son logiciel et sa revue qualité empêchent une déclaration ratée de ruiner le remboursement d'une famille.",
    "Vérifie le vrai débit montant du local, pas juste la présence du wifi — le logiciel de déclaration cale sur une connexion faible, et une salle pleine de gens qui fixent une roue qui tourne, c'est comme ça que la confiance s'érode.",
    "Mets la liste des documents requis dans chaque rappel et remets-la à la prise de rendez-vous — le crève-cœur le plus courant, c'est quelqu'un qui traverse la ville en bus pour se voir refusé faute d'une carte de sécurité sociale ou de la déclaration de l'an dernier.",
    "Vise dans ta communication les gens qui pensent gagner trop peu pour que déclarer vaille la peine — ce sont souvent eux qui ont droit aux plus gros crédits, et « pas besoin de déclarer » est exactement le mythe qui leur coûte de l'argent.",
    "Écris la règle de conservation et de destruction avant le jour d'ouverture — aucun fichier personnel laissé sur les postes, rien qui rentre à la maison, et une date fixe pour déchiqueter — parce que la fuite que tu causeras, c'est un portable resté ouvert, pas un pirate.",
    "Garde le suivi strictement facultatif et propose-le une fois la déclaration terminée, jamais comme condition — la personne est venue pour un remboursement, et un laïus budget à table peut faire ressembler l'aide gratuite à un piège commercial."
  ],
  "community-market": [
    "Fixe par écrit le rythme et le volume de chaque fournisseur, pas un aimable « quand il nous en reste » — un stand bâti sur un surplus imprévisible ne peut pas promettre aux voisins une table qui vaille le déplacement.",
    "Repère l'ombre et un point d'eau sur place, et observe le passage à l'heure réelle du marché — un carrefour animé aux heures de pointe peut être désert à 14 h, et les légumes cuisent sur un terrain sans ombre.",
    "Si tu choisis le prix libre, garde une seule boîte sans inscription et jamais de prix suggéré à hauteur des yeux — dès que payer semble attendu, les voisins qui ont le plus besoin de la nourriture arrêtent de venir.",
    "Apporte glacières et glace pour tout ce qui est feuillu ou découpé, et donne aux bénévoles une règle de tri simple — « dans le doute, au compost » protège à la fois les personnes servies et la réputation du stand.",
    "Recrute d'abord pour les créneaux ingrats — la tournée de collecte du matin et le remballage — car ce sont eux qui lâchent, et nomme un remplaçant pour chacun pour qu'une absence n'annule pas le marché.",
    "Verrouille un jour et une heure et tiens-les même les semaines maigres — un stand à moitié vide qui vient toujours bâtit plus de confiance qu'un stand abondant qui saute un samedi sans prévenir.",
    "Organise la passation des restes avant le jour du marché, pas après — prévois un frigo partagé, un garde-manger ou un programme de repas preneur du surplus, pour que le remballage soit un dépôt de cinq minutes, pas un coffre de légumes qui pourrissent."
  ],
  "welcome-wagon": [
    "Fais du premier contact en douceur la règle par défaut — un mot ou un appel avant toute visite — pour qu'une personne nouvelle puisse dire oui à un panier sans craindre de voir un inconnu débarquer chez elle.",
    "Date le livret et indique à qui signaler qu'une adresse ferme — un guide qui envoie vers une clinique déménagée ou une ligne de bus modifiée fait plus de mal que pas de guide du tout.",
    "Évite le périssable et le parfumé sauf si tu connais le foyer — un nouveau parent peut avoir des allergies, des restrictions ou une cuisine vide ; les bases longue conservation battent le petit plat bien intentionné qui ne peut pas être mangé.",
    "Apprends aux personnes qui accueillent à lire le pas de porte en dix secondes — remettre le panier, donner un moyen de vous joindre, et repartir sauf invitation à entrer ; la bienvenue la plus chaleureuse sait quand s'arrêter.",
    "Exige que les partenaires obtiennent l'accord de la personne avant de transmettre un nom — un propriétaire ou une clinique qui partage des infos sans demander transforme la bienvenue en surveillance, et ça se sait vite."
  ],
  "library-of-things": [
    "Présente le sondage comme une liste d'objets précis à cocher plus une ligne libre, et demande ce que les gens auraient utilisé « dans la dernière année » — ça capte le vrai besoin, pas une liste de rêves.",
    "Mesure d'abord les objets les plus gros — tables pliantes, poussettes, la shampouineuse. Un placard qui loge cinquante petites choses ne loge toujours pas l'unique objet que tout le monde a demandé.",
    "Vérifie la liste des rappels de sécurité (CPSC) pour tout ce qui a un moteur, un câble ou une étiquette enfant, et branche vraiment chaque appareil électrique avant qu'il gagne sa place en rayon.",
    "Photographie chaque objet à côté de son numéro pour rapprocher un retour de sa fiche en quelques secondes, et enregistre les accessoires — sacs, câbles, embouts — sur leurs propres lignes pour que rien ne s'évapore.",
    "Fixe la durée de prêt selon la vitesse de rotation de chaque objet, pas un chiffre unique — une semaine pour la shampouineuse, un week-end pour le vidéoprojecteur — pour que les objets populaires continuent de circuler.",
    "Prends la photo d'état à la sortie ET au retour ; elle règle toute seule les « c'était déjà rayé », et aucun ou aucune bibliothécaire n'a à jouer les méchants.",
    "Tiens la liste de ce que les gens ont demandé sans succès — c'est cette liste d'attente, pas tes intuitions, qui dit le prochain achat qui vaut vraiment le coup."
  ],
  "laundry-shower-access": [
    "Parcours le vrai trajet entre l'endroit où les gens attendent et la porte de la douche — une cabine privée au fond d'un couloir où tout le monde voit qui entre n'a de privé que le nom.",
    "Achète du format voyage et sans parfum — les parfums incommodent certaines personnes, et une grande bouteille disparaît quand une petite dure et se transporte. Ajoute des tongs pour les douches partagées.",
    "Laisse les gens réserver un créneau avec un simple prénom, ou rien du tout ; une feuille qui exige nom et téléphone vide justement la file que tu voulais remplir.",
    "Prévois de vraies minutes de ménage entre deux douches — désinfecter, passer la serpillière, serviette propre — et intègre-les à la durée du créneau, sinon le planning fait passer les gens dans une cabine sale.",
    "Répète les moments délicats — une personne ivre, un créneau qui déborde — pour que le premier réflexe d'un bénévole ne soit pas l'appel de panique qui met fin à la relation avec l'hôte.",
    "Choisis des heures tenables pendant des mois et affiche-les là où les gens sont vraiment ; changer l'horaire ne serait-ce qu'une fois apprend à tous que la porte pourrait être fermée en arrivant."
  ],
  "voter-registration": [
    "Note la date limite exacte de remise des formulaires et qui a légalement le droit de les remettre ; certains endroits exigent un dépôt sous quelques jours, comptés depuis la signature de la personne, pas depuis ton envoi.",
    "Donne aux bénévoles une réponse toute prête au « pour qui je devrais voter ? » — un chaleureux « ça, je ne peux pas te le dire, mais voilà comment te renseigner sur les candidatures » — pour que personne n'improvise la campagne vers les ennuis.",
    "Tire dates limites, règles de pièce d'identité et infos de vote directement de la page du bureau électoral et date ton impression ; une info de seconde main envoie quelqu'un vers un bureau fermé.",
    "Obtiens l'accord écrit du lieu avant d'installer le stand — un marché ou un campus peut te faire partir en pleine permanence, et « on pensait que ça allait » fait perdre l'emplacement pour de bon.",
    "Garde les formulaires remplis dans une seule pochette fermée qui ne quitte jamais les mains d'une personne désignée, et dépose-les dans le délai légal même si tu n'en as recueilli que trois.",
    "Remets à chaque personne inscrite une carte avec son bureau de vote, la date de l'élection et la date limite du vote par correspondance ; une inscription sans plan pour voter reste souvent à la maison."
  ],
  "health-navigation": [
    "Note la ligne directe d'accueil et les règles d'éligibilité en vigueur, pas seulement le numéro principal, et date chaque vérification — une clinique fermée répond encore sur son vieux numéro pendant des mois.",
    "Répète les mots exacts de « la médecine, ce n'est pas moi — laisse-moi te passer une ligne infirmière », parce que le moment le plus dur, c'est la personne effrayée au téléphone qui veut juste t'entendre dire que ce n'est rien.",
    "Propose un vrai numéro de téléphone et une personne, pas juste un formulaire — les gens les plus perdus dans le système sont souvent les moins à même de remplir un formulaire en ligne.",
    "Vérifie la période d'inscription avant d'ouvrir un dossier : les plans du marché se ferment hors inscription ouverte, et Medicaid dépend des revenus et de la taille du foyer, alors réunis d'abord les documents.",
    "Pose la question du transport au moment de la prise de rendez-vous, pas après — un rendez-vous confirmé sans moyen d'y aller, c'est l'absence qui coûte au patient et gâche le créneau de la clinique.",
    "Décide ce que tu n'écriras PAS — diagnostics, statut migratoire — avant le premier accueil ; la donnée de santé la plus sûre est celle qu'on n'a jamais collectée.",
    "Demande à chaque clinique quelles orientations l'aident vraiment et lesquelles la submergent, et donne-lui un contact nommé de ton côté — une passation chaleureuse vaut mieux qu'envoyer des inconnus à son accueil."
  ],
  "toy-library": [
    "Choisis un endroit à hauteur d'enfant et à largeur de poussette ; une étagère en haut d'un escalier, sans coin où garer le bébé, c'est une étagère que les parents fatigués évitent sans rien dire.",
    "Garde la liste des rappels de produits ouverte et passe les petites pièces dans un rouleau de papier toilette — si ça rentre, c'est un risque d'étouffement pour les moins de trois ans, aussi mignon que soit le jouet.",
    "Compte les pièces en les inscrivant sur l'étiquette du sachet et recompte-les au retour ; un puzzle noté « 24 pièces » se vérifie en trente secondes au lieu d'être supposé complet et abîmé sans bruit.",
    "Annonce la politique des pièces manquantes à voix haute et rends-la douce — les enfants perdent des pièces, et une famille qui craint une amende arrête simplement de venir au lieu de rapporter le jeu.",
    "Intègre le comptage des pièces et un coup de chiffon dans l'étape de retour elle-même, pour que rien n'arrive sur l'étagère non compté ou collant pour la famille suivante."
  ],
  "food-preservation": [
    "Vérifie que la cuisinière supporte le poids d'un stérilisateur plein et atteint une vraie grosse ébullition, et que tu peux ventiler pendant des heures ; une jolie salle paroissiale avec des plaques poussives bloque une journée d'autoclave.",
    "Ancre tout sur une seule source testée et à jour — le guide complet de l'USDA ou ton service de vulgarisation — et écris l'année dessus ; les anciens temps ont été révisés, et « grand-mère faisait comme ça » est la porte d'entrée du botulisme.",
    "Fais tester le manomètre de chaque autoclave — le service de vulgarisation le fait, souvent gratuitement — et n'utilise que des couvercles neufs ; les couvercles réutilisés sont la cause silencieuse des fermetures ratées.",
    "Cale les produits sur une date de séance précise et traite-les un ou deux jours après la cueillette ; une récolte abondante qui attend une semaine perd la qualité et la marge de sécurité pour lesquelles tu la mettais en bocaux.",
    "Associe la recette à la méthode sûre pour cet aliment — l'acide à l'eau bouillante, les légumes peu acides et les viandes à l'autoclave uniquement — et n'augmente jamais une recette testée au-delà de ce qui a été testé.",
    "Confie à une seule personne le chronométrage et le registre de chaque fournée ; dans une cuisine animée, la marmite qui « a sûrement eu le temps » est celle qu'il faut jeter.",
    "Étiquette chaque bocal avec contenu, méthode et date, et rappelle de vérifier la fermeture et de réfrigérer après ouverture ; tout bocal mal fermé est à manger vite, pas à garder sur l'étagère."
  ],
  "free-haircut": [
    "Demande à chaque pro combien de coupes il ou elle peut vraiment faire dans une journée — la plupart tiennent six à huit avant que les mains fatiguent — et recrute selon ce chiffre, pas selon la file que tu espères.",
    "Vérifie qu'il y a des prises reliées à la terre à portée de câble de chaque chaise et un sol dur qu'on peut balayer entre deux personnes — la moquette et une prise lointaine ruinent sans bruit une bonne installation.",
    "Achète deux jeux de sabots et de lames par poste pour que l'un trempe dans le désinfectant pendant que l'autre travaille — partager un seul jeu, c'est là que la file ralentit et que le risque d'hygiène s'installe.",
    "Appelle directement l'organisme qui encadre la coiffure chez toi, pas seulement la mairie — beaucoup exigent un désinfectant homologué avec un temps de trempage précis et traitent un événement gratuit comme un salon en règle.",
    "Donne à chaque personne un miroir et une vraie consultation avant le premier coup de ciseaux, et place une chaise à l'abri des regards — la dignité est dans le choix, et certaines personnes ne se détendent pas dans un bocal."
  ],
  "mutual-aid-moving-crew": [
    "Pour les départs d'un foyer dangereux, compose l'équipe à partir d'un petit noyau de confiance, pas des inscriptions ouvertes — une personne qui fuit un danger ne devrait jamais se demander si un inconnu de l'équipe connaît sa nouvelle adresse.",
    "Un bon chariot à quatre roues pour meubles évite plus de blessures que n'importe quel discours sur le levage — fais-en la priorité, et marque tout au nom du programme pour que ça revienne vraiment.",
    "Pose les deux questions qu'on oublie : reste-t-il des affaires non emballées, et à quelle distance de la porte peut-on se garer légalement ? Les cartons non faits et un long portage transforment deux heures de déménagement en six.",
    "Écris une règle de poids ferme — rien au-dessus d'environ vingt-cinq kilos ne bouge à moins de deux personnes — avant d'écrire la décharge. Un formulaire signé ne répare pas un dos abîmé ; la limite, si.",
    "Dans ton appel de la veille, confirme que la personne a vraiment tout emballé, pas « presque » — un logement non emballé est la raison la plus courante pour laquelle une équipe attend les bras ballants et tout le planning s'effondre.",
    "Accompagne chaque limite d'une orientation — le piano, le quatrième sans ascenseur, le grand débarras — pour qu'un refus donne à la personne un prochain appel plutôt qu'une impasse.",
    "Refais le tour de l'ancien logement avec la personne une dernière fois avant de partir — le placard oublié et le chargeur qui traîne se retrouvent maintenant ou jamais, et on revient rarement après."
  ],
  "disability-support-network": [
    "Prévois dès le premier jour de quoi couvrir les frais d'accès et le temps des personnes qui animent — un « leadership » non payé finit sans bruit entre les mains de qui peut travailler gratis, rarement les voisins handicapés les plus concernés.",
    "Fais tester ton installation par une vraie personne qui utilise un lecteur d'écran avant le lancement — les vérificateurs automatiques valident plein de pages pénibles à l'usage, et les affiches en image seule laissent des gens complètement dehors.",
    "Vérifie que chaque ressource est accessible avant de la lister — appelle et demande pour l'ascenseur, les toilettes, la procédure d'accueil. Un répertoire qui envoie quelqu'un vers un ascenseur en panne coûte plus de confiance qu'il n'en crée.",
    "Prévois une façon simple, sans se justifier, de faire une pause — la maladie chronique fait varier les capacités d'une semaine à l'autre, et un membre qui ne peut pas se retirer en douceur disparaîtra pour de bon.",
    "Ne prête rien qui touche de près la respiration ou la peau — masques de CPAP usagés, matelas — et note les numéros de série : les appareils d'assistance sont parfois rappelés et il faudra joindre vite les personnes qui les ont.",
    "Apprends les effets de seuil des aides avant de conseiller qui que ce soit — un don, un emploi ou une épargne au-dessus du plafond peut couper une couverture. Dans le doute, oriente vers un conseil en droits sociaux plutôt que de deviner.",
    "Mets une question sur les besoins d'accès dans chaque réponse d'événement et réserve interprètes ou transcription en direct dès que la date est fixée — les bons pros sont pris des semaines à l'avance, et « on n'a pas trouvé à temps » est la pente douce du renoncement."
  ],
  "books-to-prisoners": [
    "Obtiens la politique par écrit et date-la — les établissements changent les règles sans prévenir, et une photocopie de l'an dernier est exactement le genre de preuve qui ne sauvera pas un carton refusé. Revérifie tous les deux ou trois mois.",
    "Écarte dès l'entrée couvertures rigides, livres tachés d'eau ou annotés — la plupart des établissements les refusent, et une salle d'emballage ensevelie sous des dons inenvoyables est plus lente qu'une avec moitié moins de stock.",
    "Recopie le nom, le numéro d'écrou et l'unité de chaque personne exactement comme elle les a écrits, lettre par lettre — un seul chiffre inversé et tout le colis revient des semaines plus tard, sans moyen de lui dire pourquoi.",
    "Affiche une liste de contrôle des règles au mur et fais vérifier chaque colis par une deuxième personne avant de le fermer — les nouveaux sont pleins de bonne volonté et emballent de travers, et l'erreur ne se voit qu'au retour, port déjà payé.",
    "Le tarif Media Mail est bien moins cher pour les livres, mais il ne peut légalement pas contenir de lettre personnelle — glisse un mot seulement là où l'établissement et les règles postales l'autorisent, sinon ton tarif malin devient un colis retourné.",
    "Prépare chaque bénévole avant sa première lettre aux deux limites fermes — jamais d'adresse personnelle ni de nom de famille, et une réponse douce mais nette aux demandes d'argent ou de romance — pour que la chaleur ne se change jamais en sentiment de piège."
  ],
  "community-music": [
    "Essaie l'instrument ou ouvre l'étui avant d'accepter quoi que ce soit — un manche voilé ou un tampon fendu peut coûter plus qu'un instrument d'étude neuf, et les pianos « gratuits » valent rarement le transport et l'accord.",
    "Photographie l'état de chaque instrument à la sortie — ça règle avec douceur toutes les conversations « c'était déjà rayé », et c'est la trace qu'il te faudra si l'un ne revient jamais.",
    "Si les cours accueillent des enfants, vérifie les antécédents avant la première séance, sans exception — c'est l'étape ingrate qui protège les enfants et le programme, et elle est bien plus dure à ajouter quand quelqu'un enseigne déjà.",
    "Confirme que l'espace est à toi aux heures que tu utiliseras vraiment — une salle libre le mardi matin ne sert à rien pour les enfants après l'école — et demande un placard fermant à clé pour que la réserve vive là où on joue.",
    "Organise au moins une jam annoncée noir sur blanc pour débutants — mets un musicien rapide et un grand débutant dans le même cercle et le débutant rentre chez lui en silence et ne revient pas.",
    "Dis-le clairement à qui emprunte : si ça casse, rapporte-le, ne répare pas — un collage maison ou une corde trop tendue font les vrais dégâts, et c'est la peur d'une facture qui pousse à cacher."
  ],
  "school-supply-program": [
    "Obtiens les listes exactes, marques comprises — un enseignant qui a demandé des grands carreaux renverra à la maison les petits carreaux que tu as achetés — et demande à la conseillère un vrai compte de familles pour ne pas deviner les quantités.",
    "Achète toi-même en gros les basiques sans éclat — crayons, cahiers, bâtons de colle — et laisse la collecte apporter les extras amusants ; ces basiques sont exactement ce que les boîtes à dons ne produisent jamais en quantité.",
    "Affiche la liste par niveau à chaque poste d'emballage et laisse les sacs ouverts — un enfant qui a besoin de ciseaux pour gaucher ou d'une taille au-dessus doit pouvoir échanger au retrait sans défaire un sac scotché.",
    "Garde le stock hors du sol, au sec et sous clé — le carton boit l'humidité et un garage inondé ruine un été de collecte — et choisis un point de retrait sur une ligne de bus que les familles fréquentent déjà.",
    "Tiens la distribution une ou deux semaines avant le premier jour, pas le week-end de panique juste avant, et saute tout formulaire de revenus — laisse chaque enfant choisir la couleur de son sac et personne ne repart en se sentant inspecté."
  ],
  "legal-aid-clinic": [
    "Demande à chaque avocat si son assurance responsabilité couvre le bénévolat — beaucoup de programmes pro bono du barreau offrent une couverture gratuite, mais seulement si la permanence s'inscrit d'abord. Un avocat non couvert déclinera sans bruit les dossiers difficiles.",
    "Obtiens un contact nommé et un délai d'attente réaliste dans chaque organisation d'orientation avant d'ouvrir, pas un numéro général — un « appelle l'aide juridique » avec trois mois de liste derrière sonne comme un rejet pour quelqu'un en crise.",
    "Mets-toi dans la salle d'attente et vérifie si tu entends une voix normale depuis la salle de consultation — une table partagée ou un bureau à porte vitrée annule sans bruit la confidentialité dont toute la permanence dépend.",
    "Garde le fond du problème hors du formulaire de rendez-vous — une feuille de planning partagée qui affiche « expulsion, sans papiers » est une fuite en puissance. Noms et horaires seulement ; les détails restent dans la salle.",
    "Date chaque document et fais-le relire par un avocat avant impression — le droit bouge, et un tract qui cite une règle abrogée envoie les gens au tribunal sûrs d'une chose qui n'est plus vraie.",
    "Confirme que l'interprète est réservé avant d'annoncer une permanence dans cette langue, et ne laisse jamais l'enfant d'une personne interpréter des détails juridiques — trouve un ou une interprète adulte ou reporte.",
    "Fais la vérification des conflits contre ta liste de personnes reçues avant le rendez-vous, pas quand elles s'assoient — dans un petit quartier, tu finiras par recevoir un propriétaire et son locataire, et à table il est déjà trop tard."
  ],
  "resource-hub-dispatch": [
    "Attribue une vraie personne et un rythme de relève à chaque canal avant de le publier — une boîte vocale sans réponse ou un formulaire que personne ne lit apprend aux gens que le pôle est du décor, et cette réputation est dure à défaire.",
    "Note les limites fermes de chaque bénévole et son moyen de contact préféré, pas seulement ses savoir-faire — et reconfirme toute la liste chaque trimestre, parce qu'une liste de gens qui ont dit oui il y a huit mois est surtout de la fiction.",
    "Confie chaque demande à une personne coordinatrice nommée qui la porte jusqu'à la clôture — « l'équipe s'en occupe » veut dire que personne ne s'en occupe. Même un « on ne peut pas couvrir ça » dans la journée vaut mieux qu'un silence qui laisse quelqu'un attendre pour rien.",
    "Appelle chaque adresse du répertoire comme si tu étais la personne aidée et note les conditions d'accès et les vrais horaires — les répertoires pourrissent vite, et envoyer quelqu'un à l'autre bout de la ville vers un service fermé ou qui ne le prendra pas gaspille la confiance que tu construis.",
    "Écris le processus d'aiguillage pour qu'une personne coordinatrice toute neuve puisse tenir un créneau avec la seule feuille — le vrai risque du pôle n'est pas un jour calme, c'est chaque décision d'orientation qui vit dans la tête d'une seule personne épuisée.",
    "Décide ce qui est supprimé et quand, pas seulement comment c'est stocké — un dossier effacé ne peut être ni réquisitionné, ni fuité, ni piraté. Clôture la demande, garde le décompte des résultats, supprime les détails personnels.",
    "Note chaque besoin non couvert dans une catégorie fixe au moment où il survient, pas de mémoire en fin de mois — « on échoue toujours sur X » ne devient un dossier solide pour un nouveau projet que quand les entrées font un chiffre."
  ],
  "harm-reduction-supplies": [
    "Demande si vous pouvez distribuer sous le parapluie juridique et l'ordonnance permanente de l'organisation partenaire — ça étend souvent sa couverture de protection aux overdoses à ton équipe et t'épargne des mois à refaire seul la même paperasse.",
    "Note le texte de loi exact ou la source qui te l'a dit, avec une date — « quelqu'un a dit que les bandelettes passent » n'aidera pas un bénévole qui explique un sac à dos plein à la police, et ces lois changent d'une année à l'autre.",
    "Vérifie les dates de péremption le jour où la naloxone arrive et stocke-la à l'abri de la chaleur et du froid — une dose cuite dans un coffre en été ou gelée en hiver peut échouer au seul moment où on en a besoin.",
    "Appelle chaque numéro de crise et de soin avant d'imprimer des centaines de notices — une ligne coupée ou du mauvais secteur découverte en pleine overdose est une surprise cruelle, et réimprimer les kits coûte bien plus qu'un après-midi au téléphone.",
    "Garde le même itinéraire et les mêmes horaires à chaque tournée pour que les gens sachent quand te trouver — la régularité, c'est toute la relation. Et donne à chaque point fixe un contact nommé qui remplit sa boîte, sinon elle se vide et disparaît sans bruit.",
    "Compte le matériel distribué, pas les personnes qui l'ont pris — une feuille d'émargement ou une pièce d'identité demandée à la table rebâtit exactement la barrière que tu as abattue. Les overdoses inversées ne se notent que quand quelqu'un offre l'histoire de lui-même."
  ],
  "court-support": [
    "Demande au bureau des avocats commis d'office comment il préfère être contacté et ce qui aiderait vraiment — arrivez en mains supplémentaires, pas en surveillants qui notent leur travail, sinon la relation se ferme avant de s'ouvrir.",
    "Répète les mots exacts de « je ne peux pas te conseiller là-dessus — demande à ton avocat » jusqu'à ce qu'ils sortent tout seuls ; la question du couloir arrive vite et gentiment, et l'envie d'aider est précisément ce qui ruine un dossier.",
    "Vérifie chaque date et chaque salle sur le rôle du tribunal lui-même la veille en fin de journée — pas sur la mémoire de la personne. Les audiences bougent et les salles changent sans arrêt, et une absence de bonne foi peut se transformer en mandat d'arrêt.",
    "Fais découvrir la sécurité aux nouveaux bénévoles avant leur première date — la file mange 30 minutes, les canifs et parfois les téléphones sont refusés, et une audience peut vouloir dire trois heures d'attente pour deux minutes dans la salle.",
    "Prévois un conducteur de secours pour chaque matin d'audience et confirme le principal la veille au soir — un trajet qui tombe à l'eau ici n'est pas un désagrément, c'est une audience manquée et peut-être un mandat d'arrêt.",
    "Obtiens par écrit les consignes de l'avocat sur le contenu, le destinataire et le délai, et garde chaque lettre pour sa relecture avant tout envoi — une phrase bien intentionnée qui admet une faute ou contredit la défense peut faire de vrais dégâts."
  ],
  "cooling-warming-center": [
    "Teste la clim ou le chauffage un jour vraiment extrême, pas un jour doux — une salle agréable au printemps peut perdre face à une vague à 40 degrés, et tu l'apprendras avec des personnes vulnérables à l'intérieur si tu ne vérifies pas avant.",
    "Accroche le seuil à un chiffre précis du service météo pour que personne ne débatte à minuit de « est-ce assez grave » — et nomme une personne avec l'autorité de déclencher, pour que la décision ne cale jamais.",
    "Étiquette chaque bac clairement et scotche une liste du contenu à l'intérieur de la porte du placard — pendant une activation, une personne hôte toute neuve doit trouver la trousse de secours ou les chargeurs en quelques secondes, pas fouiller des cartons anonymes.",
    "Entraîne le seul jugement qui compte : à quoi ressemblent le coup de chaleur et l'hypothermie, et une règle fixe d'appeler les secours tôt. Dis clairement aux hôtes qu'on ne leur reprochera jamais d'avoir appelé — le danger, c'est l'hésitation, pas l'excès de prudence.",
    "Ne planifie jamais une personne hôte seule — deux par créneau couvrent les pauses, les allers aux toilettes et le moment où quelqu'un a besoin d'aide pendant que l'autre appelle les secours. Garde une liste de réserve nommée, car la même météo qui remplit le centre met aussi des bénévoles sur la touche.",
    "Fais passer les tracts par les gens qui atteignent physiquement les aînés isolés — livreurs de repas, gardiens d'immeuble, équipes de maraude — parce que les personnes les plus à risque sont exactement celles qui ne voient pas tes publications en ligne.",
    "Va voir toute personne qui dort au lieu de supposer qu'elle se repose — on ne distingue pas une sieste d'un coup de chaleur ou d'une hypothermie sans la réveiller doucement, et ce petit geste discret est la raison d'être du centre."
  ],
  "community-oral-history": [
    "Découpe le « partage » en cases précises — avec ou sans nom, famille seulement, public en ligne — plutôt qu'un oui global, et donne à la personne un moyen de te joindre plus tard pour changer d'avis. Le consentement est un curseur, pas un interrupteur.",
    "Enregistre un test de 30 secondes et réécoute-le avant la vraie séance — un frigo qui ronronne, une pièce qui résonne ou un téléphone presque plein qui s'éteint au meilleur moment ne se rattrapent pas après, et on obtient rarement l'histoire deux fois.",
    "Quand une histoire devient brute ou sensible, arrête-toi et redemande si cette partie peut rester — un oui donné avant d'enregistrer peut sonner très différemment une fois les mots dits à voix haute, et redemander ne coûte rien.",
    "Garde les deux sauvegardes dans des endroits vraiment différents — un téléphone et un compte en ligne, pas deux dossiers sur le même ordinateur — et relis le formulaire de consentement avant toute publication, car les souhaits des gens bougent avec les années."
  ],
  "community-solar-coop": [
    "Demande aux foyers intéressés quelque chose de petit mais réel — un engagement signé ou un dépôt remboursable — et note quel fournisseur d'électricité dessert chacun ; des mains levées en réunion surestiment ta coopérative de moitié.",
    "Commence par la base de données DSIRE et la page solaire partagé de ton fournisseur d'électricité, puis appelle le service public de l'énergie pour confirmer — une règle changée à la dernière session peut invalider sans bruit un an de préparation.",
    "Avant que quiconque craque pour un toit, vérifie son âge et son ombrage — un toit à refaire dans huit ans, c'est payer pour démonter et reposer toute l'installation à mi-vie. Demande d'abord les listes d'attente des programmes existants.",
    "Tiens la ligne : aucun membre ne signe rien — abonnement, bail, prêt — avant qu'un avocat qui connaît les coopératives d'énergie l'ait lu. Budgète cette relecture dès le départ ; elle coûte moins cher que n'importe quelle clause qu'elle attrape.",
    "Appelle des références de chantiers que l'installateur a faits il y a cinq ans, pas le mois dernier — tu recrutes sa façon de gérer les pannes de la quatrième année. Fais chiffrer le plan d'entretien dans le devis, pas promettre à l'oral.",
    "Maquette le relevé mensuel réel d'un membre avant le lancement et teste-le sur le membre le moins ami des chiffres — et montre un mois d'hiver à faible production, pas seulement l'exemple de juin ensoleillé, pour que personne ne se sente piégé après.",
    "Fais venir les membres avec une vraie facture à une séance de décryptage — décoder ensemble les tranches tarifaires et les frais d'acheminement marche mieux que n'importe quel document, et le voisin qui a réduit sa consommation de vingt pour cent est ton meilleur prof."
  ],
  "worker-coop-incubator": [
    "Demande le travail non payé et informel, pas seulement le parcours pro — la personne qui « juste » cuisinait pour une paroisse de deux cents ou réparait la voiture de tous les cousins a des savoir-faire de niveau projet qu'elle ne mentionnera pas d'elle-même.",
    "Propose chaque séance au moins deux fois, dont un soir ou un week-end, et organise une garde d'enfants — les membres qui ont le plus besoin de la formation sont précisément ceux qu'un cours en semaine au matin filtre dehors.",
    "Emmène le groupe visiter une coopérative en activité et laisse les membres cuisiner les associés sans toi — et enseigne honnêtement quand une coopérative est le mauvais choix, parce qu'un mauvais mariage découvert après la constitution est brutal.",
    "Fais écrire au groupe d'abord les statuts inconfortables — comment un membre part, comment un blocage se tranche, comment quelqu'un est retiré. Les projets qui ne rédigent que les règles du beau temps découvrent le reste en pleine crise.",
    "Pour chaque source de financement, note le délai, les papiers exigés et un humain de contact — puis revérifie chaque trimestre. La moitié des aides aux coopératives de n'importe quelle liste sont fermées, renommées ou à sec.",
    "Fixez le rythme et le périmètre à la première rencontre — une heure mensuelle au calendrier, avec un ordre du jour, survit à la bonne volonté. Apparie les mentors par métier quand tu peux ; les marges d'une boulangerie déroutent un consultant.",
    "Amorce le réseau avec de vraies transactions, pas seulement des rencontres — fais chiffrer par la coop de ménage la cuisine de la coop traiteur, et fais d'un tour de demandes de recommandations un point fixe de chaque rencontre."
  ],
  "elder-meal-delivery": [
    "Laisse un visage de confiance faire les présentations — l'infirmière de la paroisse ou l'équipe du centre pour personnes âgées qui connaît déjà la personne — parce qu'un coup de sonnette d'un inconnu reçoit un non poli exactement des gens qui en ont le plus besoin.",
    "La vérification des antécédents prend deux à quatre semaines : lance-la avant d'annoncer une date de lancement. En entretien, cherche la fiabilité plus que l'enthousiasme — demande quel engagement hebdomadaire la personne a tenu pendant un an.",
    "Teste le réchauffage d'un repas témoin dans un micro-ondes ordinaire avant de choisir un contenant — certains se déforment ou restent froids au centre — et date chaque étiquette, parce qu'un contenu sans « préparé le » oblige encore à deviner.",
    "Limite chaque tournée à ce qui laisse dix minutes tranquilles par porte — cinq ou six arrêts, en général — et place les personnes les plus fragiles en début de parcours, pour qu'un retard ne les repousse jamais à demain.",
    "N'imprime sur la feuille de tournée que les allergies et les notes d'accès, et garde le reste sous clé — et prends l'habitude de tout redemander après chaque hospitalisation, parce que c'est là que les listes de médicaments changent.",
    "Note qui a une clé et un contact de secours pour chaque personne dès son arrivée, pas pendant la première frayeur — et réduis le protocole à une carte de poche, parce que personne ne lit un classeur sur un pas de porte.",
    "Interroge les personnes âgées en personne, en tête-à-tête — un questionnaire envoyé par la poste à ce public ne récolte surtout que du silence — et prends la première semaine manquée d'un bénévole comme une conversation, pas comme une faute : c'est souvent le premier signe d'épuisement."
  ],
  "disaster-relief-hub": [
    "Compare les deux lieux candidats à la carte des zones inondables et choisis un plan B sur un autre terrain — un centre et son plan B dans la même rue basse tombent dans la même tempête. Teste les clés toi-même.",
    "Ouvre des comptes fournisseurs et négocie dès maintenant un accord d'achat — après une catastrophe, l'argent achète exactement ce qu'il faut pendant que les collectes livrent des cartons surprises. Demande à chaque fournisseur, par écrit, quel stock il s'engagerait à fournir pendant un événement.",
    "Décide dès maintenant ce que tu refuseras — les vêtements usagés sont le tueur classique de ces centres — et prépare le non poli des bénévoles à la porte. Un quadrillage au sol à la bâche et au marqueur plus un comptage au tableau blanc valent mieux qu'un logiciel abandonné en pleine crise.",
    "Fixe les quantités par foyer avant le jour d'ouverture et affiche-les dans toutes les langues du coin — des limites visibles se lisent comme de l'équité, tandis qu'un rationnement improvisé sous pression se lit comme du favoritisme et lance les disputes qui vident ta file de bénévoles.",
    "Fais une vraie répétition par an — camions, tri, file de distribution simulée — et donne à chaque rôle une personne nommée plus une remplaçante. Un test surprise de la chaîne de messages te dit qui est encore vraiment joignable.",
    "Faites-vous inscrire dès maintenant sur la liste de contacts des services locaux de gestion des urgences et invitez-vous à leurs réunions — et échangez les numéros de portable avec une personne précise dans chaque service, parce qu'après une catastrophe, les standards téléphoniques sont les premiers à couler.",
    "Garde des copies imprimées et plastifiées de l'arbre de contacts et des plans dans les deux lieux et dans les voitures de deux personnes qui coordonnent — et écris aussi les règles banales contre les blessures : gants pour le tri, deux personnes pour chaque charge lourde."
  ],
  "recovery-peer-support": [
    "Fixe un minimum de rétablissement stable pour les facilitateurs — beaucoup de programmes demandent deux ans — et forme-en toujours au moins deux, pour qu'aucune réunion et aucun membre ne dépende jamais de la pire semaine d'une seule personne.",
    "Donne aux facilitateurs la phrase exacte pour le moment où quelqu'un demande pour le sevrage ou les médicaments : « C'est une question médicale, et voici qui peut y répondre en sécurité. » Des mots répétés tiennent bon quand le besoin de la salle tire fort.",
    "Garde de la naloxone à chaque réunion et forme chaque facilitateur à s'en servir, et affiche les numéros des lignes de crise à la vue de tous — le plan surdose ne compte que s'il marche dans la salle ce soir même.",
    "Visite le lieu à l'heure réelle de ta réunion et regarde qui traîne autour — un bâtiment qui accueille une soirée bar ou un hall bruyant à sept heures défait la discrétion promise par une visite un après-midi calme.",
    "Nomme les exceptions à voix haute en même temps que la promesse — un danger imminent pour soi ou pour autrui reçoit de l'aide, pas du silence — parce que les membres méritent de connaître les limites de la confidentialité avant de partager, pas après.",
    "Remets les tracts aux personnes qui parlent aux gens aux moments de décision — équipes de sortie d'hôpital, accompagnants au tribunal, personnel de clinique — et ne publie jamais de photos des réunions. Une salle et une heure constantes comptent plus qu'une large portée.",
    "Organise un débrief mensuel des facilitateurs avec quelqu'un d'extérieur au groupe, et décidez ensemble, à l'avance, comment un facilitateur se met en retrait si son propre rétablissement vacille — une sortie digne prévue tôt évite une crise plus tard."
  ],
  "community-fitness": [
    "Demande ce qui empêcherait les gens de venir — l'horaire, la garde des enfants, la peur d'être jugé — pas seulement ce qui a l'air amusant. Les obstacles que tu entendras façonneront le programme plus que la liste d'activités.",
    "Regarde chaque candidat guider dix minutes avant de t'engager — la chaleur se voit vite, son absence aussi — et recrute deux guides par activité, parce que les vacances d'un guide unique annulent la séance.",
    "Visite chaque lieu à l'heure prévue de ta séance — le parc ombragé et calme du matin peut être écrasant ou mal fréquenté à 18 h — et confirme que les toilettes sont vraiment ouvertes à cette heure-là.",
    "Montre d'abord la version la plus douce de chaque mouvement et fais-en l'option par défaut, pas l'adaptation — quand l'option sur chaise passe en premier, personne n'a à se rabaisser en public pour l'utiliser.",
    "Fais porter aux guides un téléphone chargé et l'adresse exacte ou l'entrée du parc à donner aux secours — « le grand terrain près de l'école » fait perdre des minutes — et garde une simple carte de contact d'urgence pour chaque personne habituée.",
    "Décide le plan mauvais temps avant le début de la saison et annonce les changements toujours au même endroit — et souviens-toi qu'un « viens avec moi » personnel remplit plus de places que n'importe quel tract ; demande à chaque personne habituée d'amener un voisin.",
    "Remarque les absences à voix haute — un petit message chaleureux « tu nous as manqué » après deux séances manquées fait revenir les gens, tandis que le silence leur apprend que personne n'a remarqué leur absence. Reste chaleureux, jamais culpabilisant."
  ],
  "urban-orchard": [
    "Demande ce qui arrive aux arbres si le terrain change de mains, et fais entrer la réponse dans l'accord lui-même — un bail de dix ans qui meurt à la vente est un accord verbal de saison en saison en costume.",
    "Fais analyser le sol pour le plomb et les polluants et demande le repérage des réseaux enterrés avant de finaliser le plan — une conduite de gaz ou un taux de plomb élevé redessinera ta carte, alors laisse-les redessiner la version papier.",
    "Demande aux conseillers agricoles du coin quelles variétés résistantes aux maladies prospèrent vraiment chez toi, et sois exigeant avec les arbres donnés — un jeune plant gratuit qui apporte le feu bactérien dans un jeune verger est le cadeau le plus cher que tu accepteras jamais.",
    "Couvre de carton et de paillis ou dégage chaque cercle de plantation des semaines à l'avance, pas le matin même, et aie l'eau qui coule sur place avant le jour de plantation — porter des seaux pour quarante nouveaux arbres épuise les bénévoles très vite.",
    "Plantez ensemble un arbre de démonstration avant que quiconque prenne une pelle, et place une personne expérimentée pour cinq ou six arbres — l'erreur fatale est de planter trop profond, alors fais de « cherche le collet » le mantra de la journée.",
    "Attribue l'arrosage par nom et par mois sur un calendrier affiché — « qui passera par là » veut dire personne — et note chaque passage, parce qu'un jeune arbre a besoin d'environ quarante à soixante litres par semaine ses deux premiers étés.",
    "Attends-toi à ce que les passants cueillent des fruits et décide dès maintenant si ça te va — la plupart des vergers s'en sortent bien avec « prends-en quelques-uns, laisses-en » — et mets les règles sur un panneau à l'entrée, pas dans un compte rendu de réunion."
  ],
  "new-parent-support": [
    "Recrute des pairs aidants dont le petit dernier a passé l'âge bébé mais a moins de cinq ans — assez récent pour s'en souvenir honnêtement, assez loin pour avoir de l'énergie. Un parent en plein brouillard du nouveau-né ne peut pas porter celui d'un autre.",
    "Programme des repas tous les deux ou trois jours sur six à huit semaines plutôt que tous les jours pendant deux — la période dure survit à la vague de petits plats — et suggère une glacière sur le perron pour que le dépôt n'exige jamais un coup de sonnette.",
    "Propose un menu précis — « lessive, vaisselle, ou une heure au parc avec l'aîné ? » — parce que « de quoi as-tu besoin ? » récolte à coup sûr un « rien, ça va » d'un parent trop fatigué pour distribuer des tâches à des inconnus.",
    "Note pour chaque entrée quelle assurance elle accepte, le vrai délai d'attente et si quelqu'un répond à deux heures du matin — les crises d'un jeune parent vivent à l'heure du nouveau-né, et la plupart des répertoires ne donnent que les infos de bureau.",
    "Donne à chaque pair le même petit script pour le nommer — « ça ressemble à plus que de la fatigue, et ça se soigne ; on appelle ensemble ? » — et traite toute mention de se faire du mal comme un relais le jour même, jamais comme un attendons-voir.",
    "Appelle vraiment les références — deux minutes de « lui confierais-tu ton bébé ? » valent mieux que n'importe quel formulaire — et donne aux parents un bouton pause sans justification ; devoir expliquer un besoin de souffler est une charge en soi.",
    "Fais de chaque orientation un relais chaleureux — une personne nommée qui attend l'appel, pas un numéro sur une liste — et partage l'essentiel entre programmes avec accord, pour qu'un parent épuisé ne raconte jamais son histoire depuis zéro."
  ],
  "foster-kinship-support": [
    "Souviens-toi que beaucoup de proches qui élèvent des enfants ne passent jamais par les services — rejoins-les via les conseillers scolaires, les pédiatres et les guichets d'aides — et ouvre chaque contact avec une offre concrète, comme un lit prêt, pas la description d'un programme.",
    "N'accepte aucun siège auto à l'historique inconnu — les accidents laissent des dégâts invisibles — et compare chaque siège et chaque lit de bébé à la liste de rappels le jour de son arrivée. Trie les vêtements par taille à la réception, pas « plus tard ».",
    "Range tout dans un vrai sac à dos ou sac de sport que l'enfant garde — trop souvent, les enfants placés déménagent leur vie dans des sacs-poubelle — et fais que sous-vêtements, chaussettes et affaires de toilette soient neufs, toujours, sans exception.",
    "Confirme avec le service, enfant par enfant, qui a le droit d'assurer le répit avant de le proposer — certains placements n'admettent que des professionnels agréés, et une garde bien intentionnée mais non autorisée peut mettre en péril le placement lui-même.",
    "Prévois une garde d'enfants vérifiée sur place, sinon les familles que tu veux le plus toucher ne pourront simplement pas venir — et pense à un cercle occasionnel réservé aux proches, parce qu'une grand-mère qui élève les enfants de sa fille porte des deuils qu'un parent d'accueil agréé ne porte pas.",
    "Ouvre le répertoire avec l'argent dont personne ne parle — les aides réservées à l'enfant, les allocations d'habillement pour l'accueil, les programmes d'accompagnement des proches — et adjoins-lui une famille vétérane prête à guider les nouvelles dans la première demande.",
    "Forme chaque bénévole au signalement obligatoire avant son premier créneau — ce qui doit être signalé, à qui, sous quel délai — et rends la règle photo absolue : aucune image d'un enfant placé ne va nulle part, jamais."
  ],
  "weather-survival-outreach": [
    "Dimensionne chaque kit pour être porté toute la journée par quelqu'un à pied — un sac à cordon, pas une caisse encombrante — et évite les chaussettes en coton ; mouillé, le coton vole la chaleur du corps, alors que la laine réchauffe même humide.",
    "Achète le stock de chaque saison aux soldes de la saison précédente — couvertures en mars, glacières en septembre, au tiers du prix — et demande aux hôtels et aux salles de sport leurs serviettes et couvertures réformées, par lots.",
    "Protège la carte comme le document sensible qu'elle est — partagée à la légère, elle devient un guide pour les expulsions et le harcèlement. Garde-la entre les mains des seuls bénévoles de maraude formés, et ne publie jamais d'emplacements dans un groupe de discussion.",
    "Mets chaque nouveau bénévole en binôme avec un ancien pour ses trois premières tournées, et jouez la scène du « non » jusqu'à ce que l'accepter avec grâce devienne automatique — la personne qui décline ce soir se souviendra demain de qui l'a respectée.",
    "Déclenche sur l'indice de chaleur et les minimales nocturnes, pas sur le simple thermomètre — une nuit à 13 degrés sous une pluie battante tue — et fais les tournées la veille du pic, tant que se mettre à l'abri est encore possible.",
    "Vérifie les places par téléphone le jour même, et apprends les points de blocage de chaque hébergement — animaux, couples, couvre-feux, règles de sobriété — pour pouvoir dire honnêtement ce que quelqu'un abandonnerait en y allant. Les orientations honnêtes gardent la confiance.",
    "Répète le signe contre-intuitif : quelqu'un qui tremblait de froid et s'est arrêté va plus mal, pas mieux. La règle reste absolue — appelle d'abord les secours, puis donne ombre et eau ou abri du vent en attendant l'aide."
  ]
};
