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
