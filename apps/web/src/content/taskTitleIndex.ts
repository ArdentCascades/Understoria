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
// GENERATED eager index (i18n Phase 2a; regenerate when template
// task names change — drift is CI-pinned in taskTitleIndex.test.ts):
// per-template task-name tables for every content language, plus the
// structural suggestsWorkDays flag. Kept eager and tiny so
// title->index recovery (tips/steps on a project created in another
// locale) and the work-day hint never need a lazy content bundle.
export const TEMPLATE_TASK_NAMES: Record<
  string,
  Record<string, readonly string[]>
> = {
  "community-fridge": {
    "en": [
      "Find a host site with power and foot traffic",
      "Source a fridge and a weatherproof shelter",
      "Set the ground rules and label everything",
      "Recruit a cleaning and restocking rota",
      "Build supply relationships",
      "Set up a problem contact"
    ],
    "es": [
      "Encuentra un sitio anfitrión con electricidad y tránsito de gente",
      "Consigue un refrigerador y un refugio resistente al clima",
      "Define las reglas y etiqueta todo",
      "Arma una rotación de limpieza y reabastecimiento",
      "Construye relaciones con quienes donan",
      "Establece un contacto para problemas"
    ],
    "fr": [
      "Trouve un lieu d'accueil avec du courant et du passage",
      "Déniche un frigo et un abri qui résiste aux intempéries",
      "Pose les règles du jeu et étiquette tout",
      "Recrute un roulement de nettoyage et de réapprovisionnement",
      "Tisse des liens avec des sources de dons",
      "Mets en place un contact en cas de pépin"
    ]
  },
  "community-garden": {
    "en": [
      "Secure land and permission",
      "Test the soil and plan beds",
      "Gather materials and build",
      "Decide the sharing model",
      "Plant for your climate and season",
      "Set a watering and weeding rota",
      "Plan the harvest and surplus"
    ],
    "es": [
      "Asegura el terreno y el permiso",
      "Analiza el suelo y planea las camas",
      "Reúne materiales y construye",
      "Decidan cómo se comparte",
      "Siembra según el clima y la temporada",
      "Organiza una rotación de riego y deshierbe",
      "Planea la cosecha y los excedentes"
    ],
    "fr": [
      "Obtiens un terrain et une autorisation",
      "Analyse le sol et dessine les bacs",
      "Rassemble le matériel et construis",
      "Décidez ensemble du mode de partage",
      "Plante selon ton climat et ta saison",
      "Mets en place un roulement d'arrosage et de désherbage",
      "Prévois la récolte et le surplus"
    ]
  },
  "tool-lending-library": {
    "en": [
      "Find storage and open hours",
      "Collect and sort the inventory",
      "Catalog everything",
      "Write borrowing rules",
      "Set up sign-out",
      "Train your librarians",
      "Maintain and grow"
    ],
    "es": [
      "Encuentra dónde guardar y un horario de atención",
      "Reúne y ordena el inventario",
      "Cataloga todo",
      "Escribe las reglas de préstamo",
      "Arma el registro de salida",
      "Capacita a quienes atienden",
      "Mantén y haz crecer la biblioteca"
    ],
    "fr": [
      "Trouve un local et des heures de permanence",
      "Collecte et trie l'inventaire",
      "Catalogue tout",
      "Écris les règles de prêt",
      "Mets en place la fiche de sortie",
      "Forme tes bibliothécaires",
      "Entretiens et fais grandir la collection"
    ]
  },
  "neighborhood-care-network": {
    "en": [
      "Map who's around",
      "Recruit and screen volunteers",
      "Match thoughtfully",
      "Set a check-in rhythm",
      "Create an escalation plan",
      "Coordinate practical help",
      "Support the volunteers too"
    ],
    "es": [
      "Identifica quién vive cerca",
      "Convoca y filtra a las personas voluntarias",
      "Empareja con cuidado",
      "Define un ritmo de contacto",
      "Crea un plan de escalamiento",
      "Coordina apoyo práctico",
      "Cuida también a quienes acompañan"
    ],
    "fr": [
      "Repère qui vit autour",
      "Recrute et vérifie les bénévoles",
      "Forme les binômes avec soin",
      "Fixe un rythme de prises de nouvelles",
      "Prépare un plan pour donner l'alerte",
      "Coordonne l'aide concrète",
      "Prends soin des bénévoles aussi"
    ]
  },
  "emergency-preparedness": {
    "en": [
      "Map your neighborhood's risks",
      "Build a contact tree",
      "Plan offline communication",
      "Stock shared supplies",
      "Identify safe spots",
      "Run a drill or info night",
      "Define roles for \"day of\""
    ],
    "es": [
      "Mapea los riesgos de tu vecindario",
      "Arma un árbol de contactos",
      "Planea comunicación sin internet",
      "Junta insumos compartidos",
      "Identifica lugares seguros",
      "Hagan un simulacro o una noche informativa",
      "Define los roles para \"el día de\""
    ],
    "fr": [
      "Cartographie les risques de ton quartier",
      "Monte une chaîne de contacts",
      "Prévois la communication hors ligne",
      "Constitue une réserve commune",
      "Repère des points sûrs",
      "Organise un exercice ou une soirée d'info",
      "Définis les rôles du « jour J »"
    ]
  },
  "free-store": {
    "en": [
      "Pick a format and space",
      "Set donation standards",
      "Organize intake and sorting",
      "Display so people can browse with dignity",
      "Staff the event",
      "Handle the leftovers"
    ],
    "es": [
      "Elige el formato y el espacio",
      "Define qué se acepta como donación",
      "Organiza recepción y clasificación",
      "Exhibe para que la gente elija con dignidad",
      "Cubran el evento",
      "Gestiona lo que sobra"
    ],
    "fr": [
      "Choisis un format et un espace",
      "Fixe les critères de don",
      "Organise la réception et le tri",
      "Présente pour qu'on puisse choisir avec dignité",
      "Assure l'équipe le jour J",
      "Occupe-toi des restes"
    ]
  },
  "skill-share": {
    "en": [
      "Survey skills and interests",
      "Recruit and prep teachers",
      "Find space and time",
      "Build a schedule",
      "Make it accessible"
    ],
    "es": [
      "Pregunta por saberes e intereses",
      "Convoca y acompaña a quienes enseñan",
      "Encuentra espacio y horario",
      "Arma un calendario",
      "Hazlo accesible"
    ],
    "fr": [
      "Sonde les savoir-faire et les envies",
      "Recrute et prépare qui va enseigner",
      "Trouve un lieu et un horaire",
      "Monte un programme",
      "Rends-le accessible"
    ]
  },
  "bulk-buying-coop": {
    "en": [
      "Gather your buying group",
      "Find a supplier",
      "Set up ordering",
      "Handle money transparently",
      "Arrange delivery and a sort space",
      "Split orders fairly",
      "Rotate the work"
    ],
    "es": [
      "Junta a tu grupo de compra",
      "Encuentra a un proveedor",
      "Arma el sistema de pedidos",
      "Maneja el dinero con transparencia",
      "Organiza entrega y espacio de clasificación",
      "Reparte los pedidos con justicia",
      "Roten el trabajo"
    ],
    "fr": [
      "Réunis ton groupe d'achat",
      "Trouve un fournisseur",
      "Mets en place les commandes",
      "Gère l'argent en toute transparence",
      "Organise la livraison et un espace de répartition",
      "Répartis les commandes équitablement",
      "Faites tourner le travail"
    ]
  },
  "repair-cafe": {
    "en": [
      "Recruit fixers by specialty",
      "Set up repair stations",
      "Schedule a recurring date",
      "Create an intake flow",
      "Manage safety and expectations",
      "Stock common parts and consumables"
    ],
    "es": [
      "Convoca a quienes reparan, por especialidad",
      "Arma estaciones de reparación",
      "Pon una fecha recurrente",
      "Diseña el flujo de recepción",
      "Gestiona seguridad y expectativas",
      "Mantén surtidas piezas y consumibles comunes"
    ],
    "fr": [
      "Recrute des personnes qui réparent, par spécialité",
      "Installe les postes de réparation",
      "Fixe une date récurrente",
      "Crée un circuit d'accueil",
      "Gère la sécurité et les attentes",
      "Garde en stock les pièces et consommables courants"
    ]
  },
  "rides-transportation": {
    "en": [
      "Recruit and vet drivers",
      "Sort out insurance and liability",
      "Set up a request system",
      "Build a dispatch routine",
      "Define what's covered",
      "Handle costs",
      "Keep riders and drivers safe"
    ],
    "es": [
      "Convoca y revisa a quienes manejan",
      "Resuelve seguros y responsabilidad",
      "Arma un sistema de solicitudes",
      "Define una rutina de despacho",
      "Define qué se cubre",
      "Maneja los gastos",
      "Mantén seguras a quienes viajan y a quienes manejan"
    ],
    "fr": [
      "Recrute et vérifie les personnes qui conduisent",
      "Règle l'assurance et la responsabilité",
      "Mets en place un système de demandes",
      "Construis une routine de répartition",
      "Définis ce qui est couvert",
      "Gère les frais",
      "Veille sur les personnes transportées et celles qui conduisent"
    ]
  },
  "tenant-union": {
    "en": [
      "Recruit a core organizing committee",
      "Map buildings and tenant issues",
      "Gather accurate local tenant-rights information",
      "Build a rapid-response contact system",
      "Host a know-your-rights workshop",
      "Set up an eviction-response protocol",
      "Connect to legal aid and ongoing support"
    ],
    "es": [
      "Convoca un comité organizador base",
      "Mapea edificios y problemas de inquilinas e inquilinos",
      "Reúne información local precisa sobre derechos",
      "Arma un sistema de contacto de respuesta rápida",
      "Organiza un taller de \"conoce tus derechos\"",
      "Define un protocolo de respuesta ante desalojos",
      "Conéctate con asistencia legal y apoyo continuo"
    ],
    "fr": [
      "Recrute un comité organisateur",
      "Cartographie les immeubles et les problèmes des locataires",
      "Rassemble des infos locales exactes sur les droits des locataires",
      "Monte un système de contact en réponse rapide",
      "Organise un atelier « connais tes droits »",
      "Prépare un protocole de réponse aux expulsions",
      "Relie-toi à l'aide juridique et au soutien durable"
    ]
  },
  "childcare-collective": {
    "en": [
      "Gather founding families and agree on a model",
      "Set safety and vetting standards",
      "Find and child-proof a space",
      "Create a scheduling and credit system",
      "Set health, allergy, and emergency policies",
      "Train caregivers on basics",
      "Run a trial session and gather feedback"
    ],
    "es": [
      "Reúne a las familias fundadoras y acuerden un modelo",
      "Definan estándares de seguridad y revisión",
      "Encuentra un espacio y hazlo seguro para la infancia",
      "Creen un sistema de calendario y créditos",
      "Establezcan políticas de salud, alergias y emergencias",
      "Capaciten a quienes cuidan en lo básico",
      "Hagan una sesión piloto y recojan comentarios"
    ],
    "fr": [
      "Réunis les familles fondatrices et choisissez un modèle",
      "Posez les règles de sécurité et de vérification",
      "Trouve un espace et sécurise-le pour les enfants",
      "Crée un système de planning et de crédits",
      "Pose les règles santé, allergies et urgences",
      "Forme les personnes qui gardent aux bases",
      "Fais une séance d'essai et recueille les retours"
    ]
  },
  "community-composting": {
    "en": [
      "Find a composting site",
      "Choose a composting method",
      "Source bins and equipment",
      "Set up a collection system",
      "Make clear what's accepted",
      "Recruit and train a maintenance rota",
      "Distribute finished compost"
    ],
    "es": [
      "Encuentra un sitio de compostaje",
      "Elige un método de compostaje",
      "Consigue contenedores y equipo",
      "Arma un sistema de recolección",
      "Dejen claro qué se acepta",
      "Convoca y capacita una rotación de mantenimiento",
      "Distribuye la composta terminada"
    ],
    "fr": [
      "Trouve un site de compostage",
      "Choisis une méthode de compostage",
      "Trouve les bacs et le matériel",
      "Mets en place la collecte",
      "Rends clair ce qui est accepté",
      "Recrute et forme un roulement d'entretien",
      "Distribue le compost mûr"
    ]
  },
  "free-little-library": {
    "en": [
      "Build or get a weatherproof book box",
      "Choose and prep a location",
      "Stock the initial collection",
      "Add a sign and simple norms",
      "Recruit a steward"
    ],
    "es": [
      "Construye o consigue una caja de libros resistente al clima",
      "Elige y prepara un lugar",
      "Surte la colección inicial",
      "Pongan un letrero y normas sencillas",
      "Convoca a una persona cuidadora"
    ],
    "fr": [
      "Construis ou récupère une boîte à livres résistante aux intempéries",
      "Choisis et prépare l'emplacement",
      "Garnis la collection de départ",
      "Ajoute un panneau et des repères simples",
      "Trouve une personne pour veiller sur la boîte"
    ]
  },
  "community-first-aid-training": {
    "en": [
      "Partner with certified trainers",
      "Source supplies",
      "Find space and schedule sessions",
      "Recruit participants",
      "Run the training sessions",
      "Distribute kits and refreshers"
    ],
    "es": [
      "Asóciate con personas instructoras certificadas",
      "Consigue insumos",
      "Encuentra espacio y agenda las sesiones",
      "Convoca a quienes participen",
      "Realiza las sesiones de capacitación",
      "Entrega botiquines y refresca conocimientos"
    ],
    "fr": [
      "Fais équipe avec des personnes formatrices certifiées",
      "Rassemble le matériel",
      "Trouve une salle et planifie les séances",
      "Recrute les participantes et participants",
      "Tiens les séances de formation",
      "Distribue les trousses et organise les rappels"
    ]
  },
  "time-bank": {
    "en": [
      "Recruit founding members and inventory skills",
      "Choose a tracking system",
      "Set the rules",
      "Onboard members",
      "Launch a service directory",
      "Coordinate and broker exchanges",
      "Build trust and safety practices"
    ],
    "es": [
      "Convoca a integrantes fundadoras e inventaríen habilidades",
      "Elige un sistema de registro",
      "Definan las reglas",
      "Den la bienvenida a las personas integrantes",
      "Lanza un directorio de servicios",
      "Coordina y conecta intercambios",
      "Construye prácticas de confianza y seguridad"
    ],
    "fr": [
      "Recrute des membres fondateurs et fais l'inventaire des savoir-faire",
      "Choisis un système de suivi",
      "Posez les règles",
      "Accueille les membres",
      "Lance un annuaire des services",
      "Coordonne et provoque les échanges",
      "Construis des pratiques de confiance et de sécurité"
    ]
  },
  "solidarity-fund": {
    "en": [
      "Form a small stewardship team",
      "Set up transparent money handling",
      "Define request and disbursement criteria",
      "Create a simple, low-barrier request form",
      "Set up fundraising",
      "Build a decision and payout process",
      "Report back transparently"
    ],
    "es": [
      "Forma un pequeño equipo responsable",
      "Arma un manejo transparente del dinero",
      "Definan criterios para solicitar y entregar apoyo",
      "Crea un formulario de solicitud sencillo y de pocas barreras",
      "Pon en marcha la recaudación",
      "Arma un proceso de decisión y de pago",
      "Rinde cuentas con transparencia"
    ],
    "fr": [
      "Former une petite équipe de gestion",
      "Mettre en place une gestion transparente de l'argent",
      "Définir les critères de demande et de versement",
      "Créer un formulaire de demande simple et accessible",
      "Lancer la collecte de fonds",
      "Construire un processus de décision et de versement",
      "Rendre des comptes en toute transparence"
    ]
  },
  "diaper-hygiene-bank": {
    "en": [
      "Find storage and a distribution point",
      "Set up supply sourcing",
      "Sort and inventory by size and type",
      "Set a fair distribution policy",
      "Schedule distribution and staff it"
    ],
    "es": [
      "Encuentra almacenamiento y un punto de distribución",
      "Establece el abastecimiento",
      "Clasifica e inventaría por talla y tipo",
      "Define una política de distribución justa",
      "Agenda la distribución y consigue personal"
    ],
    "fr": [
      "Trouver un lieu de stockage et un point de distribution",
      "Organiser l'approvisionnement",
      "Trier et inventorier par taille et par type",
      "Fixer une règle de distribution équitable",
      "Planifier la distribution et réunir l'équipe"
    ]
  },
  "community-bike-workshop": {
    "en": [
      "Find a workshop space",
      "Gather tools and a workstand",
      "Collect donated bikes and parts",
      "Recruit volunteer mechanics",
      "Set open hours and an earn-a-bike model",
      "Establish safety practices"
    ],
    "es": [
      "Encuentra un espacio de taller",
      "Junta herramientas y un caballete",
      "Recolecta bicicletas y refacciones donadas",
      "Convoca a personas mecánicas voluntarias",
      "Establece horarios y un modelo de \"gánate una bici\"",
      "Establece prácticas de seguridad"
    ],
    "fr": [
      "Trouver un local d'atelier",
      "Rassembler des outils et un pied d'atelier",
      "Collecter des vélos et des pièces donnés",
      "Recruter des mécanos bénévoles",
      "Fixer des permanences et un modèle « gagne ton vélo »",
      "Poser des pratiques de sécurité"
    ]
  },
  "newcomer-translation-network": {
    "en": [
      "Recruit bilingual and multilingual volunteers",
      "Map local services and partners",
      "Build a request and matching system",
      "Create orientation materials",
      "Offer accompaniment for appointments",
      "Set privacy and safety practices"
    ],
    "es": [
      "Convoca a personas voluntarias bilingües y multilingües",
      "Mapea servicios y aliadas y aliados locales",
      "Arma un sistema de solicitudes y emparejamientos",
      "Crea materiales de orientación",
      "Ofrece acompañamiento a citas",
      "Establezcan prácticas de privacidad y seguridad"
    ],
    "fr": [
      "Recruter des bénévoles bilingues et multilingues",
      "Cartographier les services et partenaires locaux",
      "Monter un système de demandes et de mise en relation",
      "Créer des supports d'orientation",
      "Proposer un accompagnement aux rendez-vous",
      "Poser des pratiques de confidentialité et de sécurité"
    ]
  },
  "community-meal": {
    "en": [
      "Find a kitchen and serving space",
      "Sort out food safety and permits",
      "Build a food supply pipeline",
      "Plan menus for scale, diet, and allergies",
      "Recruit a cooking and serving crew",
      "Set a schedule and spread the word",
      "Run the meal and clean up"
    ],
    "es": [
      "Encuentren una cocina y un espacio para servir",
      "Resuelvan seguridad alimentaria y permisos",
      "Construyan una cadena de suministro de alimentos",
      "Planeen menús para escala, dieta y alergias",
      "Convoquen un equipo de cocina y servicio",
      "Definan un horario y corran la voz",
      "Sirvan la comida y limpien"
    ],
    "fr": [
      "Trouver une cuisine et un espace de service",
      "Régler l'hygiène alimentaire et les autorisations",
      "Monter un circuit d'approvisionnement",
      "Prévoir des menus pour la quantité, les régimes et les allergies",
      "Recruter une équipe de cuisine et de service",
      "Fixer un rythme et faire passer le mot",
      "Assurer le repas et le nettoyage"
    ]
  },
  "seed-library": {
    "en": [
      "Find a host and storage system",
      "Source initial seeds",
      "Organize and label the collection",
      "Set borrowing and sharing norms",
      "Maintain viability and restock"
    ],
    "es": [
      "Encuentren un anfitrión y sistema de almacenamiento",
      "Consigan semillas iniciales",
      "Organicen y etiqueten la colección",
      "Establezcan normas de préstamo y de intercambio",
      "Mantengan la viabilidad y rellenen el stock"
    ],
    "fr": [
      "Trouver un lieu d'accueil et un rangement",
      "Réunir les premières graines",
      "Organiser et étiqueter la collection",
      "Poser des règles d'emprunt et de partage",
      "Entretenir la viabilité et réassortir"
    ]
  },
  "digital-literacy": {
    "en": [
      "Collect and refurbish devices",
      "Set up a lending system",
      "Arrange internet access",
      "Recruit and train tutors",
      "Design a beginner curriculum",
      "Schedule classes and drop-in help",
      "Set data security and return policies"
    ],
    "es": [
      "Recolecten y reacondicionen dispositivos",
      "Armen un sistema de préstamo",
      "Gestionen el acceso a internet",
      "Convoquen y capaciten a tutoras y tutores",
      "Diseñen un plan de estudios para principiantes",
      "Programen clases y horarios de ayuda libre",
      "Establezcan políticas de seguridad de datos y devolución"
    ],
    "fr": [
      "Collecter et remettre en état des appareils",
      "Mettre en place un système de prêt",
      "Organiser l'accès à internet",
      "Recruter et préparer l'équipe d'accompagnement",
      "Concevoir un parcours pour débutants",
      "Planifier des cours et des permanences d'aide",
      "Poser des règles de sécurité des données et de retour"
    ]
  },
  "weatherization-brigade": {
    "en": [
      "Recruit skilled volunteers",
      "Set the scope of work",
      "Build a request and assessment system",
      "Source materials and tools",
      "Sort out safety and liability",
      "Schedule and run work days"
    ],
    "es": [
      "Convoquen a personas voluntarias con habilidades",
      "Definan el alcance del trabajo",
      "Armen un sistema de solicitudes y evaluación",
      "Consigan materiales y herramientas",
      "Resuelvan seguridad y responsabilidad",
      "Programen y realicen días de trabajo"
    ],
    "fr": [
      "Recruter des bénévoles qui savent bricoler",
      "Définir le périmètre des travaux",
      "Monter un système de demandes et de visites d'évaluation",
      "Trouver matériaux et outils",
      "Régler la sécurité et la responsabilité",
      "Planifier et mener les journées de chantier"
    ]
  },
  "pet-food-bank": {
    "en": [
      "Find storage and a distribution point",
      "Build a pet food supply stream",
      "Sort and inventory by animal and size",
      "Set a distribution policy",
      "Schedule and staff distribution"
    ],
    "es": [
      "Encuentren almacenamiento y un punto de distribución",
      "Construyan una cadena de suministro de comida para mascotas",
      "Clasifiquen e inventaríen por animal y tamaño",
      "Definan una política de distribución",
      "Programen y atiendan la distribución"
    ],
    "fr": [
      "Trouvez un lieu de stockage et un point de distribution",
      "Montez une source régulière de nourriture pour animaux",
      "Triez et inventoriez par animal et par taille",
      "Fixez une règle de distribution",
      "Planifiez les distributions et l'équipe"
    ]
  },
  "youth-mentorship": {
    "en": [
      "Secure a safe space and set hours",
      "Set child safety and vetting standards",
      "Recruit and train mentors",
      "Plan programming",
      "Handle enrollment, allergies, and emergency info",
      "Source snacks and supplies",
      "Run sessions and check in with families"
    ],
    "es": [
      "Consigan un espacio seguro y fijen un horario",
      "Definan estándares de protección infantil y verificación",
      "Convoquen y capaciten a mentoras y mentores",
      "Planeen la programación",
      "Manejen inscripción, alergias e información de emergencia",
      "Consigan refrigerios e insumos",
      "Realicen las sesiones y mantengan contacto con las familias"
    ],
    "fr": [
      "Trouvez un espace sûr et fixez les horaires",
      "Posez les règles de protection de l'enfance et de vérification",
      "Recrutez et formez les mentors",
      "Préparez le programme",
      "Gérez les inscriptions, les allergies et les infos d'urgence",
      "Trouvez goûters et fournitures",
      "Animez les séances et gardez le lien avec les familles"
    ]
  },
  "gleaning-network": {
    "en": [
      "Find produce sources",
      "Recruit a glean crew",
      "Arrange transport and storage",
      "Set up scheduling and dispatch",
      "Sort out liability and food safety",
      "Build distribution channels",
      "Run gleans and track poundage"
    ],
    "es": [
      "Encuentren fuentes de cosecha",
      "Convoquen un equipo de rescate",
      "Gestionen transporte y almacenamiento",
      "Armen un sistema de programación y despacho",
      "Resuelvan responsabilidad y seguridad alimentaria",
      "Construyan canales de distribución",
      "Realicen los rescates y registren los kilos"
    ],
    "fr": [
      "Trouvez des sources de récolte",
      "Recrutez une équipe de glanage",
      "Organisez transport et stockage",
      "Mettez en place l'alerte et la coordination",
      "Réglez responsabilité et hygiène alimentaire",
      "Construisez les circuits de distribution",
      "Menez les glanages et pesez les récoltes"
    ]
  },
  "community-mediation": {
    "en": [
      "Recruit and train mediators",
      "Set up a request and intake process",
      "Find neutral meeting spaces",
      "Define the scope and limits",
      "Establish confidentiality and ground rules",
      "Promote the service",
      "Track outcomes and support mediators"
    ],
    "es": [
      "Convoquen y capaciten a personas mediadoras",
      "Armen un proceso de solicitud y admisión",
      "Encuentren espacios neutrales de reunión",
      "Definan el alcance y los límites",
      "Establezcan confidencialidad y reglas básicas",
      "Difundan el servicio",
      "Hagan seguimiento de resultados y cuiden a las personas mediadoras"
    ],
    "fr": [
      "Recrutez et formez médiateurs et médiatrices",
      "Montez un processus de demande et d'accueil",
      "Trouvez des lieux de rencontre neutres",
      "Définissez le périmètre et les limites",
      "Posez la confidentialité et les règles de base",
      "Faites connaître le service",
      "Suivez les résultats et soutenez l'équipe de médiation"
    ]
  },
  "reentry-support": {
    "en": [
      "Build a resource and partner directory",
      "Recruit and train volunteers",
      "Create a welcome and needs intake",
      "Help with documents and benefits",
      "Connect to employment and housing",
      "Offer peer mentorship",
      "Set privacy and boundary practices"
    ],
    "es": [
      "Armen un directorio de recursos y aliadas y aliados",
      "Convoquen y capaciten a personas voluntarias",
      "Creen una bienvenida y entrevista de necesidades",
      "Apoyen con documentos y beneficios",
      "Conecten con empleo y vivienda",
      "Ofrezcan mentoría entre pares",
      "Establezcan prácticas de privacidad y límites"
    ],
    "fr": [
      "Montez un annuaire de ressources et de partenaires",
      "Recrutez et formez des bénévoles",
      "Créez un accueil et un point sur les besoins",
      "Aidez pour les documents et les aides",
      "Reliez à l'emploi et au logement",
      "Proposez un mentorat entre pairs",
      "Posez des pratiques de confidentialité et de limites"
    ]
  },
  "community-wood-bank": {
    "en": [
      "Secure a wood source",
      "Find a processing and storage site",
      "Get equipment and safety gear",
      "Recruit and train a wood crew",
      "Build a request and delivery system",
      "Set distribution criteria",
      "Schedule work days and seasoning"
    ],
    "es": [
      "Aseguren una fuente de leña",
      "Encuentren un sitio de procesamiento y almacenamiento",
      "Consigan equipo y equipo de protección",
      "Convoquen y capaciten a la cuadrilla de leña",
      "Armen un sistema de solicitud y entrega",
      "Definan criterios de distribución",
      "Programen días de trabajo y el secado"
    ],
    "fr": [
      "Trouvez une source de bois",
      "Trouvez un site de découpe et de stockage",
      "Réunissez le matériel et l'équipement de protection",
      "Recrutez et formez une équipe bois",
      "Montez un système de demande et de livraison",
      "Fixez les critères de distribution",
      "Planifiez les journées de chantier et le séchage"
    ]
  },
  "community-wifi-mesh": {
    "en": [
      "Map coverage needs and gaps",
      "Secure a backhaul internet connection",
      "Recruit technical volunteers",
      "Source and configure equipment",
      "Find host sites for nodes",
      "Set acceptable-use and privacy norms",
      "Maintain and expand the network"
    ],
    "es": [
      "Mapeen las necesidades y los vacíos de cobertura",
      "Aseguren una conexión de internet de respaldo",
      "Convoquen personas voluntarias con perfil técnico",
      "Consigan y configuren equipo",
      "Encuentren sitios anfitriones para los nodos",
      "Definan normas de uso aceptable y de privacidad",
      "Mantengan y amplíen la red"
    ],
    "fr": [
      "Cartographiez les besoins et les trous de couverture",
      "Sécurisez une ligne internet à partager",
      "Recrutez des bénévoles techniques",
      "Trouvez et configurez le matériel",
      "Trouvez des lieux d'accueil pour les nœuds",
      "Posez des règles d'usage et de vie privée",
      "Entretenez et étendez le réseau"
    ]
  },
  "mental-health-peer-support": {
    "en": [
      "Recruit and train facilitators",
      "Define the circle's scope and boundaries",
      "Build a crisis referral and escalation plan",
      "Find a private, safe space",
      "Set confidentiality and group ground rules",
      "Schedule and promote sessions",
      "Support facilitators and prevent burnout"
    ],
    "es": [
      "Convoquen y capaciten a personas facilitadoras",
      "Definan el alcance y los límites del círculo",
      "Armen un plan de derivación y escalamiento en crisis",
      "Encuentren un espacio privado y seguro",
      "Acuerden confidencialidad y reglas del grupo",
      "Agenden y difundan las sesiones",
      "Acompañen a las personas facilitadoras y eviten el desgaste"
    ],
    "fr": [
      "Recrutez et formez les personnes animatrices",
      "Définissez le périmètre et les limites du cercle",
      "Montez un plan d'orientation et d'escalade en cas de crise",
      "Trouvez un espace privé et sûr",
      "Posez la confidentialité et les règles du groupe",
      "Planifiez et faites connaître les rencontres",
      "Soutenez l'équipe d'animation et prévenez l'épuisement"
    ]
  },
  "community-cleanup": {
    "en": [
      "Identify and prioritize sites",
      "Get permissions and a disposal plan",
      "Gather supplies and safety gear",
      "Recruit and organize volunteers",
      "Run the cleanup or restoration day"
    ],
    "es": [
      "Identifiquen y prioricen sitios",
      "Obtengan permisos y un plan de disposición",
      "Reúnan insumos y equipo de seguridad",
      "Convoquen y organicen personas voluntarias",
      "Lleven a cabo el día de limpieza o restauración"
    ],
    "fr": [
      "Repérer et prioriser les sites",
      "Obtenir les autorisations et un plan d'évacuation",
      "Rassembler le matériel et l'équipement de sécurité",
      "Recruter et organiser les bénévoles",
      "Mener la journée de nettoyage ou de remise en état"
    ]
  },
  "free-tax-prep": {
    "en": [
      "Get preparers trained and certified",
      "Partner with a recognized free-filing program",
      "Set up a space and equipment",
      "Build an appointment and intake system",
      "Promote to eligible neighbors",
      "Ensure data security and privacy",
      "Offer financial empowerment follow-up"
    ],
    "es": [
      "Capaciten y certifiquen a las personas preparadoras",
      "Aliense con un programa reconocido de presentación gratuita",
      "Habiliten un espacio y el equipo",
      "Armen un sistema de citas y de admisión",
      "Difundan entre vecinas y vecinos elegibles",
      "Aseguren la seguridad y la privacidad de los datos",
      "Ofrezcan seguimiento de empoderamiento financiero"
    ],
    "fr": [
      "Former et certifier les personnes qui préparent",
      "S'associer à un programme reconnu de déclaration gratuite",
      "Installer un local et le matériel",
      "Monter un système de rendez-vous et d'accueil",
      "Faire connaître la permanence aux voisins éligibles",
      "Garantir la sécurité et la confidentialité des données",
      "Proposer un suivi d'autonomie financière"
    ]
  },
  "community-market": {
    "en": [
      "Secure produce and goods supply",
      "Find a location and stand setup",
      "Decide the model",
      "Set up display, storage, and food safety",
      "Recruit and schedule volunteers",
      "Promote and set a regular schedule",
      "Run the stand and handle leftovers"
    ],
    "es": [
      "Aseguren suministro de productos y artículos",
      "Encuentren ubicación y monten el puesto",
      "Decidan el modelo",
      "Organicen exhibición, almacenamiento y seguridad alimentaria",
      "Convoquen y agenden personas voluntarias",
      "Difundan y fijen un horario regular",
      "Operen el puesto y manejen las sobras"
    ],
    "fr": [
      "Sécuriser l'approvisionnement en produits et denrées",
      "Trouver un emplacement et monter le stand",
      "Décider du modèle",
      "Organiser présentation, stockage et hygiène alimentaire",
      "Recruter et planifier les bénévoles",
      "Faire connaître et fixer un horaire régulier",
      "Tenir le stand et gérer les restes"
    ]
  },
  "welcome-wagon": {
    "en": [
      "Decide who you'll welcome and how",
      "Build a local info packet",
      "Assemble welcome baskets",
      "Recruit and train greeters",
      "Set up a referral and sign-up system"
    ],
    "es": [
      "Definan a quién darán la bienvenida y cómo",
      "Armen un paquete de información local",
      "Armen canastas de bienvenida",
      "Convoquen y capaciten a personas que reciben",
      "Armen un sistema de referencias e inscripción"
    ],
    "fr": [
      "Décider qui accueillir et comment",
      "Composer un livret d'infos locales",
      "Composer les paniers de bienvenue",
      "Recruter et former les personnes qui accueillent",
      "Mettre en place mise en relation et inscription"
    ]
  },
  "library-of-things": {
    "en": [
      "Survey what the community wants to borrow",
      "Find storage and open hours",
      "Collect, clean, and test items",
      "Catalog and photograph inventory",
      "Write borrowing rules and a trust policy",
      "Set up checkout and train librarians",
      "Maintain, sanitize, and grow the collection"
    ],
    "es": [
      "Pregunten a la comunidad qué quiere pedir prestado",
      "Encuentren almacenamiento y horario de atención",
      "Recolecten, limpien y prueben los artículos",
      "Cataloguen y fotografíen el inventario",
      "Escriban reglas de préstamo y una política de confianza",
      "Habiliten el préstamo y capaciten a bibliotecarias y bibliotecarios",
      "Mantengan, sanitizen y hagan crecer la colección"
    ],
    "fr": [
      "Sonder ce que la communauté veut emprunter",
      "Trouver le stockage et les horaires d'ouverture",
      "Collecter, nettoyer et tester les objets",
      "Cataloguer et photographier l'inventaire",
      "Écrire les règles d'emprunt et une politique de confiance",
      "Mettre en place le prêt et former les bibliothécaires",
      "Entretenir, désinfecter et faire grandir la collection"
    ]
  },
  "laundry-shower-access": {
    "en": [
      "Secure laundry and shower access",
      "Source supplies",
      "Set up a sign-up and time-slot system",
      "Establish hygiene and safety protocols",
      "Recruit and train volunteers",
      "Set a schedule and spread the word"
    ],
    "es": [
      "Aseguren acceso a lavandería y duchas",
      "Consigan insumos",
      "Armen un sistema de inscripción y turnos",
      "Establezcan protocolos de higiene y seguridad",
      "Convoquen y capaciten a personas voluntarias",
      "Fijen un horario y corran la voz"
    ],
    "fr": [
      "Sécuriser l'accès à la laverie et aux douches",
      "Trouver les fournitures",
      "Monter un système d'inscription et de créneaux",
      "Établir les protocoles d'hygiène et de sécurité",
      "Recruter et former les bénévoles",
      "Fixer un horaire et faire passer le mot"
    ]
  },
  "voter-registration": {
    "en": [
      "Learn the rules for registration drives",
      "Train nonpartisan volunteers",
      "Gather materials and accurate information",
      "Pick high-traffic locations and events",
      "Run registration tabling",
      "Help with the next steps"
    ],
    "es": [
      "Aprendan las reglas para campañas de registro",
      "Capaciten a personas voluntarias apartidistas",
      "Reúnan materiales e información precisa",
      "Elijan lugares y eventos de alto tránsito",
      "Atiendan la mesa de registro",
      "Acompañen los siguientes pasos"
    ],
    "fr": [
      "Apprendre les règles des campagnes d'inscription",
      "Former des bénévoles non partisans",
      "Réunir le matériel et des informations exactes",
      "Choisir des lieux et événements passants",
      "Tenir le stand d'inscription",
      "Accompagner la suite"
    ]
  },
  "health-navigation": {
    "en": [
      "Build a healthcare resource directory",
      "Recruit and train navigators",
      "Set up a request and intake system",
      "Help with insurance and enrollment",
      "Offer appointment and prescription support",
      "Set privacy practices for health information",
      "Partner with clinics and providers"
    ],
    "es": [
      "Armen un directorio de recursos de salud",
      "Convoquen y capaciten a personas navegadoras",
      "Armen un sistema de solicitud y admisión",
      "Ayuden con seguros e inscripción",
      "Ofrezcan apoyo con citas y recetas",
      "Definan prácticas de privacidad para la información de salud",
      "Aliense con clínicas y proveedores"
    ],
    "fr": [
      "Bâtir un répertoire de ressources santé",
      "Recruter et former les accompagnants",
      "Monter un système de demande et d'accueil",
      "Aider avec l'assurance et les inscriptions",
      "Soutenir rendez-vous et ordonnances",
      "Fixer des pratiques de confidentialité pour la santé",
      "Faire équipe avec cliniques et soignants"
    ]
  },
  "toy-library": {
    "en": [
      "Find storage and open hours",
      "Collect, clean, and safety-check toys",
      "Catalog and bag with all pieces",
      "Write borrowing rules",
      "Set up checkout and train librarians"
    ],
    "es": [
      "Consigan almacenamiento y horarios de apertura",
      "Recolecten, limpien y revisen la seguridad de los juguetes",
      "Cataloguen y embolsen con todas las piezas",
      "Escriban reglas de préstamo",
      "Armen el préstamo y capaciten a bibliotecarias y bibliotecarios"
    ],
    "fr": [
      "Trouvez un lieu de rangement et des horaires d'ouverture",
      "Collectez, nettoyez et vérifiez la sécurité des jouets",
      "Cataloguez et ensachez avec toutes les pièces",
      "Rédigez les règles de prêt",
      "Mettez en place le prêt et formez les ludothécaires"
    ]
  },
  "food-preservation": {
    "en": [
      "Secure a suitable kitchen",
      "Learn safe preservation methods",
      "Gather equipment and jars",
      "Source produce",
      "Plan group canning sessions",
      "Teach and run sessions safely",
      "Share preserved food and track"
    ],
    "es": [
      "Aseguren una cocina adecuada",
      "Aprendan métodos seguros de conservación",
      "Reúnan equipo y frascos",
      "Consigan productos",
      "Planeen sesiones grupales de enlatado",
      "Enseñen y conduzcan sesiones con seguridad",
      "Compartan los alimentos conservados y registren"
    ],
    "fr": [
      "Trouvez une cuisine adaptée",
      "Apprenez des méthodes de conservation sûres",
      "Rassemblez le matériel et les bocaux",
      "Trouvez des produits",
      "Planifiez des séances de mise en conserve en groupe",
      "Menez les séances et enseignez en sécurité",
      "Partagez les conserves et gardez trace"
    ]
  },
  "free-haircut": {
    "en": [
      "Recruit licensed stylists and barbers",
      "Find a space with sanitation",
      "Source equipment and supplies",
      "Set up sanitation and licensing compliance",
      "Run grooming days"
    ],
    "es": [
      "Convoquen estilistas y barberas y barberos licenciados",
      "Encuentren un espacio con condiciones de sanitización",
      "Consigan equipo y materiales",
      "Armen sanitización y cumplimiento de licencias",
      "Conduzcan los días de arreglo personal"
    ],
    "fr": [
      "Recrutez des coiffeuses, coiffeurs et barbiers diplômés",
      "Trouvez un espace avec de quoi désinfecter",
      "Réunissez matériel et fournitures",
      "Organisez la désinfection et le respect des règles",
      "Animez les journées coiffure"
    ]
  },
  "mutual-aid-moving-crew": {
    "en": [
      "Recruit a crew and vehicles",
      "Gather moving supplies",
      "Build a request and assessment system",
      "Sort out safety and liability",
      "Set scheduling and dispatch",
      "Define scope and limits",
      "Run moves and follow up"
    ],
    "es": [
      "Convoquen una cuadrilla y vehículos",
      "Reúnan materiales de mudanza",
      "Construyan un sistema de solicitud y evaluación",
      "Resuelvan seguridad y responsabilidad",
      "Definan agenda y despacho",
      "Definan alcance y límites",
      "Realicen mudanzas y den seguimiento"
    ],
    "fr": [
      "Recrutez une équipe et des véhicules",
      "Rassemblez du matériel de déménagement",
      "Montez un système de demande et d'évaluation",
      "Réglez sécurité et responsabilité",
      "Organisez calendrier et coordination",
      "Définissez le périmètre et les limites",
      "Réalisez les déménagements et prenez des nouvelles"
    ]
  },
  "disability-support-network": {
    "en": [
      "Center disabled leadership",
      "Build an accessible communication system",
      "Map needs and resources",
      "Set up a mutual support exchange",
      "Create an equipment lending pool",
      "Offer advocacy and navigation support",
      "Set accessibility standards for all program events"
    ],
    "es": [
      "Centren el liderazgo de personas con discapacidad",
      "Armen un sistema de comunicación accesible",
      "Mapeen necesidades y recursos",
      "Armen un intercambio de apoyo mutuo",
      "Creen un fondo de préstamo de equipos",
      "Ofrezcan apoyo de incidencia y navegación",
      "Fijen estándares de accesibilidad para todos los eventos del programa"
    ],
    "fr": [
      "Mettez les personnes handicapées aux commandes",
      "Montez un système de communication accessible",
      "Cartographiez besoins et ressources",
      "Montez un échange d'entraide",
      "Créez une réserve de prêt de matériel",
      "Proposez appui aux démarches et défense des droits",
      "Fixez des normes d'accessibilité pour tous les événements du programme"
    ]
  },
  "books-to-prisoners": {
    "en": [
      "Learn facility mailing rules",
      "Gather books and a workspace",
      "Set up a request-handling system",
      "Recruit and train volunteers",
      "Cover postage and logistics",
      "Organize a letter-writing program"
    ],
    "es": [
      "Aprendan las reglas de correo de cada institución",
      "Reúnan libros y un espacio de trabajo",
      "Armen un sistema para manejar solicitudes",
      "Convoquen y capaciten a personas voluntarias",
      "Cubran franqueo y logística",
      "Organicen un programa de correspondencia"
    ],
    "fr": [
      "Apprenez les règles de courrier des établissements",
      "Réunissez des livres et un espace de travail",
      "Montez un système de suivi des demandes",
      "Recrutez et formez des bénévoles",
      "Couvrez les frais d'envoi et la logistique",
      "Organisez un programme de correspondance"
    ]
  },
  "community-music": {
    "en": [
      "Collect and repair instruments",
      "Set up an instrument lending system",
      "Recruit volunteer teachers",
      "Find a space for lessons and jams",
      "Schedule lessons and jam sessions",
      "Set care and return expectations"
    ],
    "es": [
      "Recolecten y reparen instrumentos",
      "Armen un sistema de préstamo de instrumentos",
      "Convoquen docentes voluntarias y voluntarios",
      "Encuentren un espacio para clases y jams",
      "Agenden clases y jam sessions",
      "Fijen expectativas de cuidado y devolución"
    ],
    "fr": [
      "Collectez et réparez des instruments",
      "Montez un système de prêt d'instruments",
      "Recrutez des profs bénévoles",
      "Trouvez un espace pour les cours et les jams",
      "Programmez cours et jams",
      "Posez les attentes d'entretien et de retour"
    ]
  },
  "school-supply-program": {
    "en": [
      "Get supply lists and gauge need",
      "Run supply drives and bulk-buy",
      "Sort and assemble by grade level",
      "Set up storage and a distribution point",
      "Schedule and staff distribution"
    ],
    "es": [
      "Consigan las listas de útiles y midan la necesidad",
      "Hagan colectas y compras al por mayor",
      "Clasifiquen y armen por grado",
      "Armen almacenamiento y un punto de distribución",
      "Agenden y cubran la distribución"
    ],
    "fr": [
      "Obtenez les listes de fournitures et mesurez le besoin",
      "Lancez des collectes et achetez en gros",
      "Triez et assemblez par niveau",
      "Installez le stockage et un point de distribution",
      "Programmez et animez la distribution"
    ]
  },
  "legal-aid-clinic": {
    "en": [
      "Partner with lawyers and legal aid",
      "Define scope and referral pathways",
      "Set up a space and intake",
      "Build a confidential appointment system",
      "Develop know-your-rights materials and workshops",
      "Promote and schedule clinics",
      "Protect confidentiality and check conflicts"
    ],
    "es": [
      "Aliense con abogadas y abogados y ayuda legal",
      "Definan alcance y rutas de derivación",
      "Armen un espacio y una admisión",
      "Armen un sistema confidencial de citas",
      "Desarrollen materiales y talleres de Conoce tus derechos",
      "Promuevan y agenden clínicas",
      "Protejan la confidencialidad y revisen conflictos"
    ],
    "fr": [
      "S'associer à des avocats et à l'aide juridique",
      "Définir le périmètre et les parcours d'orientation",
      "Préparer un lieu et un accueil",
      "Mettre en place des rendez-vous confidentiels",
      "Créer des supports Connais tes droits et animer des ateliers",
      "Faire connaître et planifier les permanences",
      "Protéger la confidentialité et vérifier les conflits d'intérêts"
    ]
  },
  "resource-hub-dispatch": {
    "en": [
      "Set up a single intake for needs and offers",
      "Build a volunteer and resource roster",
      "Create a matching and dispatch process",
      "Maintain a master resource directory",
      "Recruit and train coordinators",
      "Set data privacy and follow-up practices",
      "Track unmet needs and gaps"
    ],
    "es": [
      "Armen una única admisión para necesidades y ofrecimientos",
      "Armen un listado de personas voluntarias y recursos",
      "Creen un proceso de emparejamiento y despacho",
      "Mantengan un directorio maestro de recursos",
      "Convoquen y capaciten personas coordinadoras",
      "Fijen prácticas de privacidad de datos y seguimiento",
      "Registren necesidades no atendidas y brechas"
    ],
    "fr": [
      "Mettre en place un accueil unique des besoins et des offres",
      "Construire une liste des bénévoles et des ressources",
      "Créer un processus de mise en relation et d'aiguillage",
      "Tenir un répertoire central des ressources",
      "Recruter et former des personnes coordinatrices",
      "Fixer des pratiques de confidentialité et de suivi",
      "Suivre les besoins non couverts et les manques"
    ]
  },
  "harm-reduction-supplies": {
    "en": [
      "Get trained and find a harm reduction partner",
      "Check the local law on supplies",
      "Source naloxone and kit supplies",
      "Assemble kits with plain-language inserts",
      "Set up distribution rounds and fixed points",
      "Restock, track, and keep training fresh"
    ],
    "es": [
      "Capacítense y encuentren una organización aliada de reducción de daños",
      "Revisa la ley local sobre insumos",
      "Consigue naloxona e insumos para los kits",
      "Armen kits con instrucciones en lenguaje sencillo",
      "Establece rondas de distribución y puntos fijos",
      "Reabastece, lleva registro y mantén fresca la capacitación"
    ],
    "fr": [
      "Se former et trouver un partenaire de réduction des risques",
      "Vérifier la loi locale sur le matériel",
      "Trouver la naloxone et le matériel des kits",
      "Assembler des kits avec des notices en langage simple",
      "Organiser des tournées de distribution et des points fixes",
      "Réapprovisionner, suivre et garder la formation fraîche"
    ]
  },
  "court-support": {
    "en": [
      "Connect with defenders and existing court groups",
      "Write the ground rules: support, not law",
      "Build an intake and hearing calendar",
      "Train accompaniment volunteers",
      "Coordinate rides and childcare for hearings",
      "Organize support letters when the defense asks"
    ],
    "es": [
      "Conecten con defensorías y grupos de corte existentes",
      "Escribe las reglas base: apoyo, no derecho",
      "Arma una recepción de solicitudes y un calendario de audiencias",
      "Capacita a las personas voluntarias de acompañamiento",
      "Coordina aventones y cuidado infantil para las audiencias",
      "Organiza cartas de apoyo cuando la defensa las pida"
    ],
    "fr": [
      "Se relier aux défenseurs et aux groupes déjà présents",
      "Écrire les règles de base : du soutien, pas du droit",
      "Monter un accueil des demandes et un calendrier des audiences",
      "Former les bénévoles d'accompagnement",
      "Coordonner trajets et garde d'enfants pour les audiences",
      "Organiser les lettres de soutien quand la défense en demande"
    ]
  },
  "cooling-warming-center": {
    "en": [
      "Find a host site with climate control",
      "Set activation triggers and an alert plan",
      "Stock supplies",
      "Recruit and train shift hosts",
      "Build the shift rota",
      "Spread the word before the season",
      "Open, host, and reset each activation"
    ],
    "es": [
      "Encuentra un sitio anfitrión con climatización",
      "Definan los umbrales de activación y un plan de aviso",
      "Abastece los insumos",
      "Convoca y capacita a anfitrionas y anfitriones de turno",
      "Arma la rotación de turnos",
      "Corre la voz antes de la temporada",
      "Abre, acompaña y reinicia en cada activación"
    ],
    "fr": [
      "Trouver un lieu d'accueil climatisé et chauffé",
      "Fixer les seuils d'activation et un plan d'alerte",
      "Constituer les stocks",
      "Recruter et former les hôtes de créneau",
      "Monter la rotation des créneaux",
      "Faire passer le mot avant la saison",
      "Ouvrir, accueillir et remettre en état à chaque activation"
    ]
  },
  "community-oral-history": {
    "en": [
      "Write a plain-language consent form",
      "Gather gear and a question list",
      "Record story sessions",
      "Archive and share back, on their terms"
    ],
    "es": [
      "Escribe un formulario de consentimiento en lenguaje sencillo",
      "Reúne el equipo y una lista de preguntas",
      "Graba las sesiones de historias",
      "Archiva y devuelve, en sus términos"
    ],
    "fr": [
      "Écrire un formulaire de consentement en langage simple",
      "Réunir le matériel et une liste de questions",
      "Enregistrer les séances d'histoires",
      "Archiver et rendre, à leurs conditions"
    ]
  },
  "community-solar-coop": {
    "en": [
      "Gather members and assess interest",
      "Learn the models and local rules",
      "Find a site or program to join",
      "Sort out financing and legal structure",
      "Partner with installers and providers",
      "Set up the bill-credit and membership system",
      "Educate members on energy use"
    ],
    "es": [
      "Reúne miembros y mide el interés",
      "Aprende los modelos y las reglas locales",
      "Encuentra un sitio o un programa al que sumarse",
      "Resuelve el financiamiento y la estructura legal",
      "Asóciate con instaladores y proveedores",
      "Monta el sistema de membresías y créditos en la factura",
      "Educa a los miembros sobre su consumo de energía"
    ],
    "fr": [
      "Réunir des membres et mesurer l'intérêt",
      "Apprendre les modèles et les règles locales",
      "Trouver un site ou un programme à rejoindre",
      "Régler le financement et la structure juridique",
      "S'associer à des installateurs et fournisseurs",
      "Monter le système d'adhésion et de crédits sur facture",
      "Former les membres à leur consommation d'énergie"
    ]
  },
  "worker-coop-incubator": {
    "en": [
      "Assess member skills and goals",
      "Offer job-readiness and skills training",
      "Teach the cooperative model",
      "Support cooperative formation",
      "Connect to startup resources",
      "Provide mentorship",
      "Build peer support among ventures"
    ],
    "es": [
      "Evalúa las habilidades y metas de los miembros",
      "Ofrece capacitación laboral y de habilidades",
      "Enseña el modelo cooperativo",
      "Acompaña la formación de cooperativas",
      "Conecta con recursos de arranque",
      "Brinda mentoría",
      "Construye apoyo mutuo entre emprendimientos"
    ],
    "fr": [
      "Évaluer les savoir-faire et les envies des membres",
      "Proposer des formations à l'emploi et aux savoir-faire",
      "Enseigner le modèle coopératif",
      "Accompagner la constitution des coopératives",
      "Relier aux ressources de démarrage",
      "Offrir du mentorat",
      "Construire l'entraide entre projets"
    ]
  },
  "elder-meal-delivery": {
    "en": [
      "Identify homebound elders",
      "Recruit and screen volunteers",
      "Arrange a meal source",
      "Plan delivery routes and schedule",
      "Record dietary, allergy, and emergency info",
      "Establish a wellness-check protocol",
      "Support volunteers and gather feedback"
    ],
    "es": [
      "Identifica a las personas mayores confinadas en casa",
      "Convoca y verifica voluntarios",
      "Consigue una fuente de comidas",
      "Planifica las rutas y el calendario de entregas",
      "Registra información dietética, de alergias y de emergencia",
      "Establece un protocolo de verificación de bienestar",
      "Apoya a los voluntarios y recoge opiniones"
    ],
    "fr": [
      "Repérer les personnes âgées qui ne sortent plus de chez elles",
      "Recruter et vérifier les bénévoles",
      "Trouver une source de repas",
      "Planifier les tournées et le calendrier de livraison",
      "Noter les régimes, allergies et contacts d'urgence",
      "Établir un protocole de vérification du bien-être",
      "Soutenir les bénévoles et recueillir les retours"
    ]
  },
  "disaster-relief-hub": {
    "en": [
      "Pre-identify a hub site and backup",
      "Build supply-sourcing pipelines",
      "Set up intake, sorting, and inventory",
      "Create a distribution system",
      "Recruit and train a surge volunteer team",
      "Coordinate with other responders",
      "Plan communication and safety"
    ],
    "es": [
      "Identifica de antemano un sitio y un respaldo",
      "Construye canales de abastecimiento",
      "Monta la recepción, clasificación e inventario",
      "Crea un sistema de distribución",
      "Convoca y entrena un equipo voluntario de emergencia",
      "Coordina con otros equipos de respuesta",
      "Planifica la comunicación y la seguridad"
    ],
    "fr": [
      "Repérer à l'avance un lieu et un plan B",
      "Monter des filières d'approvisionnement",
      "Organiser la réception, le tri et l'inventaire",
      "Créer un système de distribution",
      "Recruter et former une équipe de bénévoles mobilisables",
      "Se coordonner avec les autres équipes d'intervention",
      "Planifier la communication et la sécurité"
    ]
  },
  "recovery-peer-support": {
    "en": [
      "Recruit and train peer facilitators",
      "Define scope and boundaries",
      "Build referral and crisis pathways",
      "Find a safe, private, substance-free space",
      "Set confidentiality and group norms",
      "Schedule and promote meetings",
      "Support facilitators and prevent burnout"
    ],
    "es": [
      "Convoca y capacita facilitadores pares",
      "Define el alcance y los límites",
      "Construye rutas de derivación y de crisis",
      "Encuentra un espacio seguro, privado y libre de sustancias",
      "Establece la confidencialidad y las normas del grupo",
      "Programa y difunde las reuniones",
      "Apoya a los facilitadores y prevén el agotamiento"
    ],
    "fr": [
      "Recruter et former des facilitateurs pairs",
      "Définir le périmètre et les limites",
      "Construire les relais vers les soins et la crise",
      "Trouver un lieu sûr, privé et sans substances",
      "Poser la confidentialité et les règles du groupe",
      "Planifier et faire connaître les réunions",
      "Soutenir les facilitateurs et prévenir l'épuisement"
    ]
  },
  "community-fitness": {
    "en": [
      "Survey interests and activity levels",
      "Recruit activity leaders",
      "Find safe spaces",
      "Plan inclusive, all-levels programming",
      "Address safety and health",
      "Set a schedule and spread the word",
      "Build community and consistency"
    ],
    "es": [
      "Sondea intereses y niveles de actividad",
      "Convoca a personas guía para las actividades",
      "Encuentra espacios seguros",
      "Planea una programación inclusiva y para todos los niveles",
      "Atiende la seguridad y la salud",
      "Define un horario y corre la voz",
      "Cultiva comunidad y constancia"
    ],
    "fr": [
      "Sonder les envies et les niveaux d'activité",
      "Recruter des personnes guides pour les activités",
      "Trouver des lieux sûrs",
      "Prévoir un programme inclusif, tous niveaux",
      "Prendre soin de la sécurité et de la santé",
      "Fixer un calendrier et faire passer le mot",
      "Cultiver le lien et la régularité"
    ]
  },
  "urban-orchard": {
    "en": [
      "Secure long-term land access",
      "Plan the planting design",
      "Source trees and plants",
      "Prepare the site",
      "Host planting days",
      "Set up long-term stewardship",
      "Plan harvest sharing"
    ],
    "es": [
      "Asegura el acceso a la tierra a largo plazo",
      "Planea el diseño de plantación",
      "Consigue los árboles y las plantas",
      "Prepara el sitio",
      "Organiza jornadas de plantación",
      "Establece el cuidado a largo plazo",
      "Planea el reparto de la cosecha"
    ],
    "fr": [
      "Sécuriser un accès à la terre sur le long terme",
      "Concevoir le plan de plantation",
      "Trouver les arbres et les plantes",
      "Préparer le terrain",
      "Organiser des journées de plantation",
      "Mettre en place l'entretien à long terme",
      "Prévoir le partage de la récolte"
    ]
  },
  "new-parent-support": {
    "en": [
      "Recruit volunteers and peer supporters",
      "Set up a meal-train system",
      "Offer practical help",
      "Build a resource directory",
      "Create peer support circles",
      "Set safety and boundary practices",
      "Connect to other projects"
    ],
    "es": [
      "Convoca voluntarios y pares de apoyo",
      "Monta un sistema de tren de comidas",
      "Ofrece ayuda práctica",
      "Arma un directorio de recursos",
      "Crea círculos de apoyo entre pares",
      "Define prácticas de seguridad y de límites",
      "Conecta con otros proyectos"
    ],
    "fr": [
      "Recruter des bénévoles et des pairs aidants",
      "Monter une chaîne de repas",
      "Offrir de l'aide concrète",
      "Construire un répertoire de ressources",
      "Créer des cercles de soutien entre pairs",
      "Poser des pratiques de sécurité et de limites",
      "Relier aux autres projets"
    ]
  },
  "foster-kinship-support": {
    "en": [
      "Connect with caregiving families",
      "Build a goods and clothing supply",
      "Create a rapid-response supply system",
      "Organize respite support",
      "Offer peer support groups",
      "Build a resource directory",
      "Set child safety and privacy practices"
    ],
    "es": [
      "Conecta con las familias cuidadoras",
      "Arma una reserva de ropa y artículos",
      "Crea un sistema de entrega rápida",
      "Organiza el apoyo de respiro",
      "Ofrece grupos de apoyo entre pares",
      "Arma un directorio de recursos",
      "Define prácticas de seguridad infantil y privacidad"
    ],
    "fr": [
      "Entrer en lien avec les familles qui accueillent",
      "Constituer une réserve de vêtements et de matériel",
      "Créer un système de sacs prêts à partir",
      "Organiser le répit",
      "Proposer des groupes de soutien entre pairs",
      "Construire un répertoire de ressources",
      "Poser les pratiques de sécurité et de vie privée des enfants"
    ]
  },
  "weather-survival-outreach": {
    "en": [
      "Assemble weather-specific kits",
      "Source supplies",
      "Map where to reach people",
      "Recruit and train outreach volunteers",
      "Build a distribution and route plan",
      "Connect people to shelters and services",
      "Plan for emergencies"
    ],
    "es": [
      "Arma paquetes según la temporada",
      "Consigue los insumos",
      "Mapea dónde encontrar a la gente",
      "Convoca y capacita a voluntarios de calle",
      "Arma un plan de distribución y rutas",
      "Conecta a la gente con refugios y servicios",
      "Prepárate para las emergencias"
    ],
    "fr": [
      "Assembler des kits adaptés à la saison",
      "Trouver le matériel",
      "Cartographier où trouver les gens",
      "Recruter et former les bénévoles de maraude",
      "Construire un plan de distribution et de tournées",
      "Relier les gens aux hébergements et aux services",
      "Prévoir les urgences"
    ]
  }
};

export const TEMPLATE_SUGGESTS_WORK_DAYS: Record<string, boolean> = {
  "community-garden": true,
  "free-store": true,
  "bulk-buying-coop": true,
  "repair-cafe": true,
  "childcare-collective": true,
  "community-composting": true,
  "diaper-hygiene-bank": true,
  "community-bike-workshop": true,
  "community-meal": true,
  "weatherization-brigade": true,
  "pet-food-bank": true,
  "youth-mentorship": true,
  "gleaning-network": true,
  "community-wood-bank": true,
  "community-cleanup": true,
  "free-tax-prep": true,
  "community-market": true,
  "laundry-shower-access": true,
  "food-preservation": true,
  "free-haircut": true,
  "mutual-aid-moving-crew": true,
  "books-to-prisoners": true,
  "school-supply-program": true,
  "legal-aid-clinic": true,
  "harm-reduction-supplies": true,
  "cooling-warming-center": true,
  "disaster-relief-hub": true,
  "urban-orchard": true
};
