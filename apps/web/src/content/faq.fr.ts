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
// French FAQ (i18n Phase 2b). Loaded lazily via
// content/bundles/fr.ts — never import this statically from app
// code. When adding or renaming an entry in faq.ts, mirror the
// change here so the parity test (faq.parity.test.ts) stays
// green.
import type { FaqSection } from "./faq";

export const FAQ_SECTIONS_FR: readonly FaqSection[] = [
  {
    "id": "posts",
    "title": "Annonces et échanges",
    "entries": [
      {
        "id": "post-something",
        "question": "Comment publier un besoin ou une offre ?",
        "answer": [
          "Sur le Tableau, touche le bouton vert + Publier un besoin ou + Publier une offre en bas de l'écran. Donne un titre court, décris ce dont tu as besoin ou ce que tu peux donner, et publie. Plus tard, tu pourras annuler l'annonce depuis sa page de détail, ou la publier à nouveau avec des changements depuis le menu de l'annonce."
        ]
      },
      {
        "id": "claim-post",
        "question": "Comment prendre l'annonce de quelqu'un d'autre ?",
        "answer": [
          "Touche n'importe quelle annonce du Tableau pour ouvrir sa page de détail. Sur un besoin, touche Donner un coup de main ; sur une offre, touche Prendre cette offre. L'annonce passe en attente de confirmation, et la personne qui l'a publiée a l'occasion de confirmer avant que le moindre crédit circule.",
          "Si tu changes d'avis, touche Me retirer sur la même page — l'annonce se rouvre pour quelqu'un d'autre."
        ]
      },
      {
        "id": "confirm-exchange",
        "question": "Comment marche la confirmation d'un échange ?",
        "answer": [
          "Une fois l'aide vraiment donnée, vous touchez l'une et l'autre Confirmer que c'est fait sur la page de détail de l'annonce. Le crédit ne circule que lorsque vous avez confirmé des deux côtés.",
          "L'ordre n'a pas d'importance — l'une de vous deux confirme d'abord, l'autre voit que l'annonce l'attend, et confirme quand c'est le bon moment."
        ]
      },
      {
        "id": "other-not-confirmed",
        "question": "L'autre personne n'a pas encore confirmé. Qu'est-ce que je fais ?",
        "answer": [
          "Commence par lui en parler en dehors de l'app. La plupart du temps, c'est un geste oublié, pas un refus.",
          "S'il y a un vrai désaccord sur le fait que l'échange a eu lieu, ou qu'il comptait comme une aide complète, utilise Quelque chose cloche — signaler sur la page de détail de l'annonce. Ça le fait remonter sur la page Désaccords, où la communauté peut aider à démêler la situation — il n'y a pas d'administrateurs. Le crédit reste en attente jusqu'à la résolution.",
          "Tu n'auras pas non plus à attendre indéfiniment. Si ta communauté a activé la confirmation automatique, le nœud communautaire prend le relais après le délai d'attente convenu et complète une confirmation qui a clairement juste été oubliée, pour que le crédit de personne ne reste dans les limbes."
        ]
      },
      {
        "id": "cancel-post",
        "question": "Comment annuler une annonce dont je n'ai plus besoin ?",
        "answer": [
          "Ouvre l'annonce depuis le Tableau et touche Annuler l'annonce. Elle quitte le tableau tout de suite, donc personne ne peut la prendre. Elle n'est pas supprimée pour autant — sa page reste, marquée comme annulée, et quiconque a son lien peut encore voir ce qui était demandé ou offert."
        ]
      }
    ]
  },
  {
    "id": "balance",
    "title": "Solde et crédits",
    "entries": [
      {
        "id": "what-is-balance",
        "question": "Que veut dire mon solde ?",
        "answer": [
          "Ton solde, c'est le total courant des heures que tu as données moins les heures que tu as reçues. Tout le monde commence à 5 (le crédit de départ), donc un membre tout neuf est à 5, pas à 0.",
          "Un solde négatif, ça va très bien — demander de l'aide n'est pas une dette. Les soldes sont visibles pour ta communauté, mais ce n'est pas une note, et il n'y a pas de classement."
        ]
      },
      {
        "id": "negative-balance",
        "question": "Mon solde peut-il passer en négatif ?",
        "answer": [
          "Oui. Recevoir plus que ce que tu as donné fait partie du fonctionnement de l'entraide — le réseau est fait pour circuler. La communauté ne verra un signalement que si la limite quotidienne d'échanges approche ou si un motif semble inhabituel ; sinon, personne ne surveille ton chiffre."
        ]
      }
    ]
  },
  {
    "id": "identity",
    "title": "Ton identité et tes appareils",
    "entries": [
      {
        "id": "getting-around",
        "question": "Où est passé l'onglet Profil ? Comment je me repère ?",
        "answer": [
          "Cinq onglets vivent en bas de l'écran (une barre à gauche sur un grand écran) : Tableau, Vue d'ensemble, Calendrier, Messages et À mes soins — chaque tâche que tu as prise et chaque projet que tu organises, réunis au même endroit.",
          "Tout ce qui parle de TOI est passé derrière le bouton Menu, en haut à droite : ton Profil (sous ton propre nom), Réglages, Inviter quelqu'un, cette page d'Aide, Rechercher et Infrastructure de la communauté.",
          "Rechercher trouve les annonces, les projets, les événements, les personnes et ces réponses d'aide — le tout à partir de ce qui est déjà sur ton appareil. Avec un clavier, Ctrl+K (⌘K sur Mac) l'ouvre depuis n'importe où."
        ]
      },
      {
        "id": "change-name",
        "question": "Comment changer mon nom affiché ou mon quartier ?",
        "answer": [
          "Profil → À propos de toi. Les noms sont des étiquettes, pas des papiers d'identité, alors tu peux changer le tien quand tu veux. Ton identité cryptographique, elle, ne bouge pas."
        ]
      },
      {
        "id": "lost-passphrase",
        "question": "Qu'est-ce qui se passe si je perds ma phrase secrète ?",
        "answer": [
          "Personne ne peut la réinitialiser à ta place, et c'est voulu. Le marché est le suivant : aucune autorité centrale ne peut lire tes données, donc aucune autorité centrale ne peut non plus venir les sauver.",
          "Mais une phrase secrète oubliée n'a plus à signifier une identité perdue. Si tu as un deuxième appareil relié, il porte toujours ton identité. Si tu as créé un kit de récupération (Réglages → Kit de récupération), il restaure ton compte avec sa propre phrase, séparée. Si tu as choisi des gardiens, il suffit qu'assez d'entre eux se réunissent pour te ramener, sans phrase secrète du tout. Regarde « Qu'est-ce qui se passe si je perds mon téléphone ? » plus bas pour l'ordre complet à essayer.",
          "C'est seulement si rien de tout ça n'existe que la réponse devient Profil → Urgence → Effacement dur : effacer l'appareil et repartir avec une identité neuve, sans ton ancien historique de crédit."
        ]
      },
      {
        "id": "lost-phone",
        "question": "Qu'est-ce qui se passe si je perds mon téléphone ?",
        "answer": [
          "Ton compte peut revenir — voici l'ordre honnête à essayer, du meilleur au moins bon.",
          "1. Un deuxième appareil relié. Si tu en as ajouté un (Profil → Ajouter un autre appareil), ton identité y vit déjà ; continue simplement à l'utiliser, et relie un téléphone de remplacement depuis lui.",
          "2. Un kit de récupération. Si tu en as créé un (Réglages → Kit de récupération), ouvre l'app sur n'importe quel appareil neuf, choisis « Tu as perdu ton appareil, mais tu as un kit de récupération ? » et entre la phrase du kit. Le solde, les avals, les rôles et ton statut de membre reviennent ; l'histoire de la communauté se resynchronise depuis son serveur.",
          "3. Tes gardiens. Si tu as réparti ta clé entre des gardiens (Réglages → Gardiens), retrouve-en assez : le nouvel appareil affiche un code de demande, chaque gardienne ou gardien répond avec un code de libération, et une fois le seuil atteint, ton compte revient — sans kit, sans phrase secrète.",
          "4. Une nouvelle invitation. Si rien de tout ça n'existe, demande qu'on t'invite à nouveau. Tu repars comme nouveau membre : ton ancien historique reste visible pour la communauté sous ton ancien nom, mais la nouvelle clé part de zéro. C'est exactement pour ça que l'app encourage tout le monde à avoir un deuxième appareil, un kit ou des gardiens AVANT la mauvaise semaine.",
          "Ce qui ne revient jamais sur un nouvel appareil : les messages directs et les brouillons pas encore envoyés — ils n'ont jamais vécu ailleurs que sur le téléphone perdu, et c'est voulu."
        ]
      },
      {
        "id": "install-app",
        "question": "Est-ce que je peux installer Understoria comme une app ?",
        "answer": [
          "Oui. Understoria est une app web que tu peux poser sur ton écran d'accueil comme n'importe quelle autre app : tu obtiens une icône, elle s'ouvre en plein écran sans les barres du navigateur, elle démarre plus vite et elle continue de fonctionner hors ligne.",
          "Sur iPhone ou iPad, ouvre Understoria dans Safari, touche le bouton Partager et choisis « Sur l'écran d'accueil ».",
          "Sur Android, ouvre-la dans Chrome, touche le menu (⋮) en haut de l'écran et choisis « Ajouter à l'écran d'accueil » ou « Installer l'application ».",
          "Sur un navigateur d'ordinateur, cherche l'icône d'installation à l'extrémité droite de la barre d'adresse.",
          "Sur un ordinateur sous Linux, il existe aussi une app de bureau — un fichier unique (un AppImage) que ta communauté peut se partager, et qui tourne sans navigateur du tout. Rends-le exécutable (clic droit → Propriétés → autoriser l'exécution, ou chmod +x), ouvre-le, puis relie-le depuis ton téléphone : Réglages → « Ajouter un autre appareil » sur le téléphone, puis la voie « coller le code » sur l'ordinateur. Il compte comme un appareil à part entière, exactement comme le cas de l'iPhone ci-dessous, et il ne se met à jour que lorsque tu remplaces le fichier par un plus récent.",
          "Une chose à savoir avant d'installer : sur iPhone et iPad, l'app installée a son PROPRE stockage, séparé, donc elle démarre sans session ouverte même si la copie du navigateur, elle, a ton identité — rien n'est perdu, tu as simplement deux « appareils » séparés sur un même téléphone. L'app installée pose la question dès son tout premier écran : choisis « J'utilise déjà Understoria dans le navigateur de ce téléphone » et elle t'accompagne pas à pas pour faire venir ton identité. (Sur Android et sur ordinateur, l'app installée partage le stockage du navigateur, donc ta session reste ouverte.)"
        ]
      },
      {
        "id": "new-device",
        "question": "Comment passer sur un nouvel appareil ?",
        "answer": [
          "Rien à taper. Sur le nouvel appareil, ouvre Understoria et choisis « Apporter mon identité » — il affiche deux emoji et attend. Sur l'appareil qui a déjà ton identité, va dans Profil → Ajouter un autre appareil : la demande y apparaît toute seule. Vérifie que les emoji correspondent, touche « Le relier », et le nouvel appareil se connecte tout seul. Les deux appareils doivent être sur le même réseau (sur un même téléphone, ils le sont toujours). Ailleurs, ou pas de serveur communautaire ? « Autres façons de relier » propose un code parlé de 6 mots et un QR qui se passe complètement de serveur.",
          "Deux choses ne suivent pas : ton historique de messages (les messages sont chiffrés vers les clés propres de chaque appareil, donc ils restent là où ils ont été reçus) et les réglages propres à l'appareil, comme le thème et la taille du texte. Tout le reste — annonces, projets, événements, membres, échanges — arrive avec la liaison elle-même, donc le nouvel appareil ressemble tout de suite à l'ancien et continue de se synchroniser ensuite."
        ]
      },
      {
        "id": "link-safety",
        "question": "À quoi faire attention quand je relie des appareils ?",
        "answer": [
          "Trois habitudes simples suffisent à relier en sécurité. D'abord : ne touche « Le relier » que quand c'est TOI qui tiens l'appareil qui demande, et que les deux emoji de ton écran correspondent aux deux du sien. Si une demande apparaît alors que tu ne relies rien, ignore-la — quelqu'un sur ton réseau tente peut-être sa chance, et rien ne se passe tant que tu ne touches pas.",
          "Ensuite : quand le nouvel appareil se connecte, jette un œil au nom qui t'accueille. Si ce n'est pas toi, quelqu'un a glissé sa propre identité dans ton transfert — rien de ce qui est à toi n'a été pris, et le bouton « Ce n'est pas moi » remet l'appareil à zéro pour que tu puisses recommencer.",
          "Enfin, les petites lignes honnêtes : relier d'un geste passe par le serveur de ta propre communauté, qui ne relaie que des données scellées qu'il ne peut pas lire — mais si tu ne fais pas confiance à la personne qui fait tourner ce serveur, utilise plutôt la méthode QR sous « Autres façons de relier ». Le QR va d'écran à caméra, sans aucun serveur entre les deux.",
          "Une note pratique : relier d'un geste demande que les deux appareils aient l'air d'être sur le même réseau. Un VPN ou iCloud Private Relay peut se mettre en travers sans bruit — si la demande n'apparaît jamais, mets-le en pause une minute et redemande, ou passe par « Autres façons de relier »."
        ]
      }
    ]
  },
  {
    "id": "community",
    "title": "Communauté et invitations",
    "entries": [
      {
        "id": "internet-outage",
        "question": "Qu'est-ce qu'on peut encore faire quand Internet tombe — pendant un ouragan, par exemple ?",
        "answer": [
          "Plus que tu ne crois, parce que toute l'app a été construite exactement pour ça. Ton appareil porte déjà tout : le tableau, le registre, la liste des membres, ton identité. Tu peux continuer à lire, publier et confirmer — chaque changement patiente en file, en sécurité, et s'envoie tout seul dès que la connexion revient. Rien ne se perd pendant qu'Internet est coupé.",
          "Si quelqu'un près de toi a besoin d'aide MAINTENANT : aide-le, puis confirmez ensemble, en personne. Sur la page de l'annonce, choisis « Confirmer en personne » — un téléphone affiche un code, l'autre le scanne et signe. Les deux téléphones gardent l'enregistrement et le rapportent à la maison quand Internet revient.",
          "Si ta communauté fait tourner un refuge tempête — un petit serveur de secours que quelqu'un garde prêt pour les coupures — rejoins son WiFi quand Internet est coupé, et l'app remarche tout simplement pour tout le monde à l'abri : les annonces circulent, l'aide se confirme, rien à configurer. Demande à la personne qui fait tourner le serveur de ta communauté si un refuge tempête existe ; sinon, docs/offline-resilience.md est la recette pour en monter un pendant les temps calmes.",
          "Tu peux même inviter quelqu'un de nouveau. Ton code d'invitation fonctionne sans le moindre Internet — il est signé par toi et reste valable deux semaines — alors montre le code QR, ou donne le lien sur papier et laisse la personne en garder une photo. Dans un refuge tempête, elle peut installer l'app et rejoindre sur place ; sinon, elle finit de rejoindre dès qu'elle retrouve n'importe quelle connexion. La seule chose impossible sans aucun réseau nulle part, c'est de télécharger l'app elle-même — l'invitation attend patiemment que ce soit possible.",
          "Les temps calmes, c'est le moment de mettre tout ça sur papier : la page Infrastructure de la communauté peut imprimer un kit de coupure — une affiche murale et des cartes pour le portefeuille avec les étapes pour rejoindre le refuge — pour que les instructions survivent aussi aux batteries à plat."
        ]
      },
      {
        "id": "add-a-node",
        "question": "Qu'est-ce qui protège cette communauté si on nous prend notre serveur ?",
        "answer": [
          "Deux choses, et c'est le cœur de ce qui distingue Understoria des services commerciaux. D'abord : l'appareil de chaque membre porte déjà une copie complète et signée de la communauté — le tableau, le registre, les projets, tout. Saisir le serveur n'emporte rien qui ne soit pas déjà sur les téléphones de tout le monde, et un serveur de remplacement peut se remplir à nouveau depuis ces copies.",
          "Ensuite : le serveur n'a pas à être une seule machine, ni la machine d'une seule personne. N'importe quel membre peut faire tourner un nœud communautaire — un vieil ordinateur portable dans un placard, couvercle fermé, suffit vraiment. Chaque nœud de plus signifie qu'il n'existe aucune personne unique sur qui un groupe antisyndical ou hostile à l'entraide pourrait faire pression pour briser la communauté. La carte de résilience de la Vue d'ensemble montre combien de racines ta communauté a fait pousser.",
          "Envie d'en ajouter un ? Le pas-à-pas vit dans la documentation du projet — docs/add-a-node.md, dans le dépôt Understoria, explique comment redonner vie à un vieil ordinateur, et le guide d'opération couvre les détails. C'est un après-midi de travail, et le membre qui fait tourner ton serveur actuel peut t'aider à échanger les deux réglages qui relient les nœuds entre eux."
        ]
      },
      {
        "id": "start-a-community",
        "question": "Est-ce que je pourrais lancer une communauté comme celle-ci pour mon quartier ?",
        "answer": [
          "Oui — et tu n'as besoin de la permission de personne, ni d'un compte GitHub, ni d'une boutique d'applications. Understoria est un logiciel libre, et le serveur de cette communauté propose son code source complet au téléchargement.",
          "Tout le chemin est écrit dans l'app : ouvre le Menu (en haut à droite) → Infrastructure de la communauté → la carte « Le logiciel lui-même » → « Démarrer une nouvelle communauté à partir de ce téléchargement ». Elle t'accompagne du téléchargement et de la vérification du code jusqu'au lancement de ton propre serveur, en langage simple."
        ]
      },
      {
        "id": "invite-someone",
        "question": "Comment inviter quelqu'un ?",
        "answer": [
          "D'abord : inviter, c'est l'affaire des membres de confiance. Tant que deux membres de confiance ne se sont pas portés garants de toi (l'invitation qui t'a fait entrer compte comme la première), le bouton d'invitation affiche ta progression à la place. Ça protège la communauté — une chaîne d'inconnus ne peut pas inviter d'autres inconnus. Pour y arriver, fais ce pour quoi l'app existe : aide les gens. Une fois que le voisinage te connaît, n'importe quel membre de confiance peut se porter garant de toi depuis ton profil.",
          "Le chemin le plus court : ouvre le Menu (en haut à droite) et choisis Inviter quelqu'un — il t'amène droit à la carte des invitations. Le chemin plus long passe par Profil → Les invitations que tu as envoyées.",
          "Touche Générer un lien d'invitation et tu obtiens un lien à usage unique. Partage-le en personne, par Signal, ou par n'importe quel canal où tu peux vérifier qu'il a bien atteint la personne voulue. Ne publie pas de liens d'invitation en public.",
          "Tu peux aussi afficher une invitation en code QR pour la partager en personne. Chaque invitation est à usage unique, expire d'elle-même et peut être révoquée depuis Profil → Les invitations que tu as envoyées tant qu'elle n'a pas servi. Quand quelqu'un rejoint avec ton invitation, ça compte comme ton aval — ton nom appuie son arrivée, alors invite des gens que tu connais vraiment."
        ]
      },
      {
        "id": "how-vouching-works",
        "question": "Comment marchent les avals ?",
        "answer": [
          "Un aval est une déclaration publique et signée : tu connais cette personne et tu réponds de sa place dans la communauté. Quelqu'un devient « de confiance » une fois que deux membres différents se sont portés garants de lui — et inviter quelqu'un compte automatiquement comme ton aval, donc donner son aval à la main, c'est la façon d'appuyer une personne que quelqu'un d'autre a fait entrer.",
          "Tu te portes garant depuis la page d'un membre : touche son nom n'importe où dans l'app et cherche la section Se porter garant. Le bouton s'affiche quand ton aval ajouterait vraiment de la confiance — tu es toi-même de confiance, la personne rassemble encore ses garants, et tu ne t'es pas déjà porté garant d'elle. Sinon, la section explique pourquoi, pour que tu n'aies jamais à deviner.",
          "Ça mérite un instant de réflexion : ton nom appuie le sien, visiblement et pour de bon — un aval ne se retire pas dans l'app. Si tu le regrettes plus tard, le chemin passe par une conversation avec ta communauté, pas par un bouton. Porte-toi garant de gens que tu connais vraiment.",
          "Recevoir tes avals ouvre aussi les pouvoirs de confiance de la communauté : inviter de nouvelles personnes, se porter garant d'autres membres, signer les retraits de membres — et les liens que tu partages deviennent cliquables pour tout le monde (jusque-là, les gens voient l'adresse complète mais ne peuvent pas la toucher : une protection contre les mauvais liens, pas une marque contre toi). Les limites quotidiennes de publication — généreuses — des nouvelles personnes disparaissent au même moment."
        ]
      },
      {
        "id": "disagree-with-member",
        "question": "Et si je ne suis pas d'accord avec un autre membre ?",
        "answer": [
          "Parle-lui d'abord. La plupart des désaccords ne concernent pas l'app et n'ont pas besoin qu'elle s'en mêle.",
          "Si ça concerne un échange précis, utilise Quelque chose cloche — signaler sur la page de détail de l'annonce. Si ça touche au comportement au-delà d'un seul échange, tu peux ouvrir un désaccord depuis Profil → Désaccords — les désaccords passent par le processus ouvert de propositions de la communauté, parce qu'il n'y a pas d'administrateurs pour trancher à ta place.",
          "Et si ce qu'il te faut, c'est simplement de la distance avec quelqu'un, le blocage est toujours là — regarde « Et si quelqu'un me dérange ? » sous Messages."
        ]
      },
      {
        "id": "member-removal",
        "question": "Comment se passe le retrait de quelqu'un de la communauté ?",
        "answer": [
          "Le retrait est le geste le plus lourd que cette communauté puisse faire, et l'app le traite comme tel. C'est un dernier recours : un blocage personnel empêche déjà le contenu de quelqu'un de t'atteindre, un désaccord peut contester un échange précis, et une conversation répare plus que les deux réunis.",
          "Personne ne peut retirer quelqu'un tout seul — ni une personne qui organise, ni la personne qui fait tourner le serveur. Il faut plusieurs membres (le nombre est fixé par ta communauté et affiché pour tout le monde) qui signent chacun de leur nom un même enregistrement public. La proposition démarre sur le profil du membre ; les cosignatures se font en personne, depuis la page Propositions.",
          "Un retrait est public à l'intérieur de la communauté — qui a été retiré, quand, pourquoi, et qui exactement a signé, tout est visible sur la page Propositions. Les expulsions secrètes, c'est comme ça que les communautés pourrissent.",
          "Ce n'est pas un effacement. Les échanges passés du membre retiré restent — ils équilibrent les registres des autres membres — et tout ce qui est sur son propre appareil reste à lui. Ce qui s'arrête, c'est son accès : la lecture cesse, et toute nouvelle écriture est refusée. Les personnes qu'il avait invitées avant le retrait restent membres ; ses invitations pas encore utilisées s'éteignent en même temps.",
          "Et la porte peut se rouvrir : la réintégration demande le même nombre de signatures, lancée depuis l'enregistrement de retrait lui-même, sur la page Propositions."
        ]
      },
      {
        "id": "lurking-ok",
        "question": "Est-ce que je peux juste regarder, sans rien publier ?",
        "answer": [
          "Oui. Lire ce que les autres offrent et demandent est une vraie façon de participer. Certains membres observent pendant des semaines avant de publier leur premier besoin ; d'autres ne publient jamais et se contentent de répondre. Les deux sont les bienvenus."
        ]
      },
      {
        "id": "who-sees-what",
        "question": "Qui peut voir ce que je publie ?",
        "answer": [
          "Tout le monde sur le nœud de ta communauté peut voir tes annonces, ton nom affiché, ton quartier (si tu en as indiqué un) et ton historique d'échanges. Les communautés voisines reçoivent les enregistrements signés que tu publies — annonces, échanges confirmés, événements — sous ta clé publique, pas sous ton nom affiché. Comme les échanges se fédèrent, un nœud voisin peut voir l'activité d'échange de ta clé et en déduire le solde ; ce qui ne quitte jamais ta communauté, ce sont les réponses de présence, les inscriptions aux créneaux, les tâches de projet, les blocages, les brouillons et les messages.",
          "Les messages directs, c'est différent : ils sont chiffrés de bout en bout entre ton appareil et celui de l'autre personne, donc vous êtes les seuls à pouvoir les lire — pas le nœud, pas les autres membres. Regarde « Comment écrire à un autre membre ? » sous Messages pour les détails."
        ]
      },
      {
        "id": "beta-status",
        "question": "L'app est finie à quel point ? Qu'est-ce que je ne devrais pas y mettre ?",
        "answer": [
          "Understoria est un logiciel en bêta. Une grande partie de son code a été écrite avec des outils d'IA puis relue par des personnes, et il n'a pas encore reçu d'audit de sécurité indépendant.",
          "Les protections que tu vois sont réelles et testées — les messages sont chiffrés de bout en bout, les enregistrements sont signés, l'effacement d'urgence fonctionne. Mais bêta veut dire que des bugs sont possibles, y compris certains que personne n'a encore trouvés.",
          "Elle est faite pour coordonner l'entraide de tous les jours entre voisins. N'y mets rien qui pourrait te faire du tort, à toi ou à quelqu'un d'autre, en cas de fuite — papiers d'identité, détails médicaux ou de situation migratoire, ou tout ce que tu ne dirais qu'en off. Dans le doute, dis-le en personne."
        ]
      }
    ]
  },
  {
    "id": "messages",
    "title": "Messages",
    "entries": [
      {
        "id": "message-someone",
        "question": "Comment écrire à un autre membre ?",
        "answer": [
          "Ouvre n'importe quelle annonce et touche le bouton Message — il écrit à la personne qui a publié, ou, si l'annonce est la tienne, à la personne qui t'aide. Les conversations démarrent volontairement depuis une annonce — ça garde les messages attachés à de l'aide réelle plutôt qu'au démarchage. Ouvre Messages dans la navigation pour voir toutes tes conversations et chercher dedans.",
          "Les messages sont chiffrés de bout en bout et voyagent d'appareil à appareil. Seuls toi et la personne à qui tu écris pouvez les lire — le nœud communautaire les fait passer mais ne voit pas dedans.",
          "Il n'y a volontairement ni accusés de lecture ni indicateurs de saisie. Personne ne voit quand (ni si) tu as lu un message, et personne ne te regarde composer une réponse. Lis quand tu lis, réponds quand tu en as la capacité — l'app ne te trahira ni dans un sens ni dans l'autre."
        ]
      },
      {
        "id": "voice-notes",
        "question": "Comment marchent les notes vocales ? Mon micro ne fonctionne pas.",
        "answer": [
          "Dans une conversation, le bouton micro se trouve dans la zone de message tant qu'elle est vide — commence à écrire et il devient Envoyer ; efface le texte et le micro revient. Touche-le pour enregistrer une note vocale de 45 secondes au plus, réécoute-la avant que quoi que ce soit parte, et n'envoie que quand elle te convient. Les notes vocales sont scellées de bout en bout exactement comme les messages écrits — seuls toi et la personne avec qui tu parles pouvez les entendre.",
          "La voix sur les annonces du Tableau marche autrement. Les annonces sont du contenu communautaire : un enregistrement joint à une annonce est audible par toute la communauté — le même public que les mots que tu y écrirais.",
          "Si le micro ne démarre pas : ton navigateur ou ton téléphone demande la permission la première fois que tu enregistres. Si elle a été refusée — même sans faire exprès — l'enregistrement reste bloqué jusqu'à ce que tu autorises le micro pour ce site dans les réglages du navigateur ou du téléphone. Une fois l'autorisation donnée, reviens et réessaie."
        ]
      },
      {
        "id": "someone-bothering-me",
        "question": "Et si quelqu'un me dérange ?",
        "answer": [
          "Tu peux le bloquer. Ouvre votre conversation et choisis Bloquer ce contact dans le menu en haut, ou utilise l'option de blocage sur sa page de membre.",
          "Le blocage est immédiat et privé. Tu cesses de voir ses annonces, ses événements, ses commentaires et ses messages, et aucun de vous deux ne peut plus écrire à l'autre, se porter garant de lui, prendre ses annonces ni l'inviter. La personne n'est pas prévenue — pas de notification, pas de marque sur son profil, rien que le reste de la communauté puisse voir.",
          "Bloquer ne dépose PAS de plainte. Aucune modération n'est alertée, aucun désaccord ne s'ouvre, et les échanges passés restent tels quels. Si tu veux que la communauté se penche dessus, ouvre un désaccord depuis Profil → Désaccords — le blocage et le désaccord vont très bien ensemble. Le blocage te donne le calme maintenant ; le désaccord suit le processus communautaire à son rythme.",
          "Tu peux revoir, modifier ou défaire tes blocages à tout moment dans Réglages → Contacts bloqués."
        ]
      }
    ]
  },
  {
    "id": "events",
    "title": "Événements et calendrier",
    "entries": [
      {
        "id": "community-events",
        "question": "Comment marchent les événements communautaires ?",
        "answer": [
          "N'importe qui peut créer un événement : ouvre le Calendrier et touche le bouton +. Donne-lui une heure, un lieu et une description, et il apparaît sur le calendrier communautaire pour tout le monde.",
          "Touche un événement pour répondre — J'y vais, Peut-être ou Je n'y vais pas. Ta réponse reste sur le nœud de cette communauté : la personne qui organise et celles qui ont répondu voient ton nom, les membres qui n'ont pas répondu ne voient que les totaux, et les communautés voisines ne voient jamais ta réponse. Si tu la changes en « Je n'y vais pas », ton nom quitte la liste aussitôt.",
          "Certains événements ont aussi des créneaux — des plages horaires où la personne qui organise a besoin d'un certain nombre de bras, comme une équipe d'installation ou un roulement au service. S'inscrire à un créneau répond aussi « J'y vais » à l'événement pour toi. La liste du créneau marche comme celle des réponses : elle reste sur le nœud de cette communauté, et passer ta réponse à « Je n'y vais pas » te retire aussi des créneaux.",
          "Les événements ne se modifient pas après création — un événement signé reste exactement ce à quoi les gens ont dit oui. Si les détails changent, la personne qui organise l'annule et en publie un nouveau. Quand un événement auquel tu avais répondu est annulé, tu verras un mot à ce sujet (avec la raison donnée par la personne qui organise, si elle en a laissé une) à ta prochaine ouverture de l'app."
        ]
      }
    ]
  },
  {
    "id": "projects",
    "title": "Projets et tâches",
    "entries": [
      {
        "id": "task-follows",
        "question": "Pourquoi une tâche dit « Vient après : … » ?",
        "answer": [
          "Les tâches d'un projet peuvent s'enchaîner. « Vient après » veut dire que cette tâche vient naturellement après une autre — couler les fondations avant de monter les murs. Rien n'est bloqué et personne ne barre la route à personne ; c'est juste un ordre.",
          "Tu peux quand même prendre une tâche « vient après » quand tu veux. La seule différence : l'app, exprès, ne prendra pas de tes nouvelles à son sujet tant que la tâche d'avant n'est pas finie — aucun sens de demander où ça en est quand la base sur laquelle elle s'appuie n'est pas encore là. Le système attend avec toi, pas après toi."
        ]
      }
    ]
  }
];
