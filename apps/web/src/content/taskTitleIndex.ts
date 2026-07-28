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
    ],
    "pt": [
      "Encontre um espaço anfitrião com tomada e movimento",
      "Consiga uma geladeira e um abrigo contra o tempo",
      "Defina as regras e etiquete tudo",
      "Monte uma escala de limpeza e reposição",
      "Construa relações com quem doa",
      "Crie um contato para problemas"
    ],
    "zh": [
      "找一个有电、有人来往的落脚点",
      "找到冰箱，搭好防风遮雨的棚子",
      "定好规矩，贴上标签",
      "招一批人排清洁补货轮值",
      "和货源处好关系",
      "设一个报修联系方式"
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
    ],
    "pt": [
      "Garanta o terreno e a permissão",
      "Analise o solo e planeje os canteiros",
      "Reúna materiais e construa",
      "Decidam como compartilhar",
      "Plante conforme o clima e a estação",
      "Organize uma escala de rega e capina",
      "Planeje a colheita e o excedente"
    ],
    "zh": [
      "落实土地和许可",
      "检测土壤，规划苗床",
      "备料开工",
      "商量好怎么分享",
      "按气候和时节下种",
      "排好浇水除草轮值",
      "安排收获和富余"
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
    ],
    "pt": [
      "Encontre onde guardar e um horário de atendimento",
      "Reúna e organize o acervo",
      "Catalogue tudo",
      "Escreva as regras de empréstimo",
      "Monte o registro de saída",
      "Capacite quem atende",
      "Mantenha e faça crescer a biblioteca"
    ],
    "zh": [
      "找地方存放，定开放时间",
      "收集并整理库存",
      "给每件东西建档",
      "写好借用规矩",
      "搭好借出登记",
      "帮馆员们上手",
      "维护好，慢慢添新"
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
    ],
    "pt": [
      "Descubra quem está por perto",
      "Convoque e verifique as pessoas voluntárias",
      "Forme os pares com cuidado",
      "Defina um ritmo de contato",
      "Crie um plano para situações de crise",
      "Coordene a ajuda prática",
      "Cuide também de quem acompanha"
    ],
    "zh": [
      "摸清附近都有谁",
      "招募并核实志愿者",
      "用心配对",
      "定下问候的节奏",
      "定好紧急情况的应对",
      "协调实际的搭手",
      "也照应好志愿者"
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
    ],
    "pt": [
      "Mapeie os riscos da sua vizinhança",
      "Monte uma corrente de contatos",
      "Planeje a comunicação sem internet",
      "Estoque suprimentos compartilhados",
      "Identifique pontos seguros",
      "Façam um simulado ou uma noite informativa",
      "Defina os papéis para \"a hora H\""
    ],
    "zh": [
      "摸清你们街区的风险",
      "搭一棵联络树",
      "商量断网时怎么联络",
      "备好共用物资",
      "找好安全点",
      "办一次演练或说明夜",
      "分好“当天”的角色"
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
    ],
    "pt": [
      "Escolha o formato e o espaço",
      "Defina o que se aceita como doação",
      "Organize a recepção e a triagem",
      "Exponha para as pessoas escolherem com dignidade",
      "Montem a equipe do evento",
      "Cuide das sobras"
    ],
    "zh": [
      "定形式，找场地",
      "定好收哪些捐赠",
      "安排收货和分拣",
      "陈列得让人有尊严地挑",
      "安排活动人手",
      "处理剩下的东西"
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
    ],
    "pt": [
      "Pesquise saberes e interesses",
      "Convide e prepare quem ensina",
      "Encontre espaço e horário",
      "Monte uma agenda",
      "Torne tudo acessível"
    ],
    "zh": [
      "摸一摸大家的本事和兴趣",
      "邀请老师，陪着备课",
      "找空间，定时间",
      "排出课程表",
      "让人人都来得了"
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
    ],
    "pt": [
      "Reúna seu grupo de compras",
      "Encontre um fornecedor",
      "Monte o sistema de pedidos",
      "Cuide do dinheiro com transparência",
      "Organize a entrega e um espaço de separação",
      "Dividam os pedidos com justiça",
      "Revezem o trabalho"
    ],
    "zh": [
      "凑齐合买的家庭",
      "找一家供应商",
      "定好怎么下单",
      "把钱算得明明白白",
      "安排送货和分装场地",
      "把订单分得公公道道",
      "把活儿轮着干"
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
    ],
    "pt": [
      "Recrute quem conserta, por especialidade",
      "Monte as estações de conserto",
      "Marque uma data recorrente",
      "Crie um fluxo de recepção",
      "Cuide da segurança e das expectativas",
      "Mantenha um estoque de peças e consumíveis comuns"
    ],
    "zh": [
      "按专长招募修理帮手",
      "布置修理工位",
      "定一个固定重复的日子",
      "设计接待流程",
      "管好安全和预期",
      "备齐常用零件和耗材"
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
    ],
    "pt": [
      "Recrute e avalie quem dirige",
      "Resolva seguro e responsabilidade",
      "Monte um sistema de pedidos",
      "Crie uma rotina de coordenação",
      "Definam o que é coberto",
      "Cuidem dos custos",
      "Mantenha a segurança de quem viaja e de quem dirige"
    ],
    "zh": [
      "招募司机并做好把关",
      "理清保险和责任",
      "搭一个请求渠道",
      "建立调度节奏",
      "定清楚哪些行程包含在内",
      "处理花费",
      "保障搭车人和司机的安全"
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
    ],
    "pt": [
      "Recrute um comitê organizador de base",
      "Mapeie os prédios e os problemas de quem mora",
      "Reúna informação local precisa sobre direitos",
      "Monte um sistema de contato de resposta rápida",
      "Organize uma oficina “conheça seus direitos”",
      "Definam um protocolo de resposta a despejos",
      "Conecte-se à assistência jurídica e ao apoio contínuo"
    ],
    "zh": [
      "组建核心组织委员会",
      "摸清各栋楼和租客的难处",
      "收集准确的当地租客权利信息",
      "搭一套快速响应联络系统",
      "办一场“了解你的权利”工作坊",
      "定一套驱逐应对流程",
      "接上法律援助与长期支持"
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
    ],
    "pt": [
      "Reúna as famílias fundadoras e combinem um modelo",
      "Definam padrões de segurança e avaliação",
      "Encontre um espaço e deixe-o seguro para crianças",
      "Criem um sistema de agenda e créditos",
      "Definam políticas de saúde, alergias e emergências",
      "Treinem o básico com quem cuida",
      "Façam uma sessão piloto e recolham impressões"
    ],
    "zh": [
      "聚齐发起家庭，商定模式",
      "定下安全与把关标准",
      "找好场地，做足儿童安全防护",
      "建一套排期和时数系统",
      "定健康、过敏和紧急情况的规矩",
      "给照看的人做基础培训",
      "办一次试运行并收集反馈"
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
    ],
    "pt": [
      "Encontre um local de compostagem",
      "Escolha um método de compostagem",
      "Consiga baldes e equipamento",
      "Monte um sistema de coleta",
      "Deixem claro o que é aceito",
      "Recrute e treine uma escala de manutenção",
      "Distribua o composto pronto"
    ],
    "zh": [
      "找一处堆肥场地",
      "选一种堆肥方法",
      "备齐桶和工具",
      "搭一套收集系统",
      "讲清楚收什么不收什么",
      "招人并培训维护轮值",
      "分发堆好的肥"
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
    ],
    "pt": [
      "Construa ou consiga uma caixa de livros à prova de tempo",
      "Escolha e prepare um lugar",
      "Monte o acervo inicial",
      "Coloque uma placa e normas simples",
      "Encontre quem vai zelar pela caixa"
    ],
    "zh": [
      "做一个或找一个防风雨书箱",
      "选好位置，做好准备",
      "备齐起步的书",
      "挂上牌子和简单的规矩",
      "找一位照看人"
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
    ],
    "pt": [
      "Faça parceria com instrutores certificados",
      "Consiga os materiais",
      "Encontre espaço e agende as sessões",
      "Convide participantes",
      "Faça as sessões de treinamento",
      "Distribua kits e marque reciclagens"
    ],
    "zh": [
      "和持证培训者结成伙伴",
      "筹措物资",
      "找场地、排课程",
      "招学员",
      "办好每场培训",
      "发放急救包，安排复训"
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
    ],
    "pt": [
      "Recrute membros fundadores e façam um inventário de habilidades",
      "Escolha um sistema de registro",
      "Definam as regras",
      "Deem as boas-vindas aos membros",
      "Lance um diretório de serviços",
      "Coordene e costure as trocas",
      "Construam práticas de confiança e segurança"
    ],
    "zh": [
      "招募创始成员，盘点手艺",
      "选一套记录系统",
      "定下规则",
      "迎新成员上手",
      "上线一份帮忙名录",
      "协调和撮合交换",
      "建立信任与安全的做法"
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
    ],
    "pt": [
      "Forme uma pequena equipe responsável",
      "Monte um sistema transparente para o dinheiro",
      "Definam critérios de pedido e de repasse",
      "Crie um formulário de pedido simples e sem barreiras",
      "Ponha a arrecadação de pé",
      "Monte um processo de decisão e pagamento",
      "Preste contas com transparência"
    ],
    "zh": [
      "组建一个小小的管钱小组",
      "搭好透明的资金管理",
      "定下申请和发放的标准",
      "做一份简单、低门槛的申请表",
      "把筹款做起来",
      "建立决定和发放的流程",
      "透明地向大家汇报"
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
    ],
    "pt": [
      "Encontre um lugar para guardar e um ponto de distribuição",
      "Organize o abastecimento",
      "Separe e inventarie por tamanho e tipo",
      "Defina uma política de distribuição justa",
      "Agende a distribuição e reúna quem ajuda"
    ],
    "zh": [
      "找好储存点和发放点",
      "把货源建起来",
      "按尺码和种类分拣、清点",
      "定一个公平的发放规矩",
      "排好发放日并安排人手"
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
    ],
    "pt": [
      "Encontre um espaço para a oficina",
      "Junte ferramentas e um cavalete",
      "Recolha bicicletas e peças doadas",
      "Convoque mecânicas e mecânicos voluntários",
      "Defina horários e um modelo “ganhe sua bicicleta”",
      "Estabeleça práticas de segurança"
    ],
    "zh": [
      "找一个工坊场地",
      "凑齐工具和一个修车架",
      "收集捐赠的自行车和零件",
      "找愿意帮忙的修车师傅",
      "定开放时间和“挣一辆车”的玩法",
      "立好安全规矩"
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
    ],
    "pt": [
      "Convoque pessoas voluntárias bilíngues e multilíngues",
      "Mapeie serviços e parcerias locais",
      "Monte um sistema de pedidos e conexões",
      "Crie materiais de orientação",
      "Ofereça acompanhamento a consultas e atendimentos",
      "Estabeleçam práticas de privacidade e segurança"
    ],
    "zh": [
      "找会双语、多语的帮手",
      "摸清本地的机构和伙伴",
      "搭一套请求和配对的办法",
      "做入门指南材料",
      "提供陪同赴约",
      "立好隐私和安全的规矩"
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
    ],
    "pt": [
      "Encontrem uma cozinha e um espaço para servir",
      "Resolvam a segurança alimentar e os alvarás",
      "Construam um fluxo de abastecimento de alimentos",
      "Planejem cardápios para escala, dietas e alergias",
      "Convoquem uma equipe de cozinha e serviço",
      "Definam uma agenda e espalhem a notícia",
      "Façam a refeição e limpem"
    ],
    "zh": [
      "找到厨房和开饭的场地",
      "把食品安全和许可办妥",
      "建起食材的来源渠道",
      "按人量、饮食和过敏来定菜单",
      "召集做饭和开饭的队伍",
      "定下时间，把消息传开",
      "开一顿饭，收拾干净"
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
    ],
    "pt": [
      "Encontrem um anfitrião e um sistema de guarda",
      "Consigam as sementes iniciais",
      "Organizem e etiquetem a coleção",
      "Definam as regras de empréstimo e troca",
      "Mantenham a viabilidade e reponham o estoque"
    ],
    "zh": [
      "找落脚点和存放办法",
      "凑第一批种子",
      "整理编目、贴上标签",
      "定好取种和分享的规矩",
      "保持发芽率，及时补货"
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
    ],
    "pt": [
      "Recolham e recondicionem dispositivos",
      "Montem um sistema de empréstimo",
      "Providenciem o acesso à internet",
      "Convoquem e preparem quem vai ensinar",
      "Desenhem um currículo para quem está começando",
      "Programem aulas e horários de ajuda livre",
      "Definam políticas de segurança de dados e devolução"
    ],
    "zh": [
      "收集设备、翻新整备",
      "搭一套出借登记",
      "解决上网问题",
      "找人来教，先带一带",
      "设计一套新手课程",
      "排好课程和随到随问的时间",
      "定好数据安全和归还的规矩"
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
    ],
    "pt": [
      "Convoquem pessoas voluntárias habilidosas",
      "Definam o alcance do trabalho",
      "Montem um sistema de pedidos e avaliação",
      "Consigam materiais e ferramentas",
      "Resolvam segurança e responsabilidade",
      "Agendem e façam os mutirões"
    ],
    "zh": [
      "找有手艺的帮手",
      "画好活的界线",
      "搭一套请求和上门评估的办法",
      "备齐材料和工具",
      "把安全和责任理清楚",
      "安排并开展动手日"
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
    ],
    "pt": [
      "Encontrem armazenamento e um ponto de distribuição",
      "Montem um fluxo de doações de ração",
      "Separem e inventariem por animal e porte",
      "Definam uma política de distribuição",
      "Programem e cuidem da distribuição"
    ],
    "zh": [
      "找到储存空间和发放点",
      "建立宠物粮的稳定来源",
      "按动物和分量分类清点",
      "定一套发放规则",
      "排班并安排发放"
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
    ],
    "pt": [
      "Garantam um espaço seguro e definam o horário",
      "Definam padrões de proteção infantil e verificação",
      "Convoquem e capacitem mentoras e mentores",
      "Planejem a programação",
      "Cuidem de inscrições, alergias e informações de emergência",
      "Consigam lanches e materiais",
      "Conduzam as sessões e acompanhem as famílias"
    ],
    "zh": [
      "找到安全场地，定下时间",
      "定下儿童保护和审查标准",
      "招募并培训导师",
      "安排活动内容",
      "办理报名、过敏和紧急信息",
      "张罗点心和物资",
      "带好每次活动，和家庭保持联系"
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
    ],
    "pt": [
      "Encontrem fontes de colheita",
      "Convoquem uma equipe de resgate",
      "Organizem transporte e armazenamento",
      "Montem a programação e o chamado",
      "Resolvam responsabilidade e cuidado com os alimentos",
      "Construam canais de distribuição",
      "Façam os resgates e registrem os quilos"
    ],
    "zh": [
      "找到果蔬来源",
      "组一支拾穗队",
      "安排运输和存放",
      "搭一套通知调度的办法",
      "理清责任和食品安全",
      "建好分发渠道",
      "组织拾穗行动并记录斤两"
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
    ],
    "pt": [
      "Convoquem e capacitem pessoas mediadoras",
      "Montem um processo de pedido e acolhimento",
      "Encontrem espaços neutros de encontro",
      "Definam o alcance e os limites",
      "Estabeleçam a confidencialidade e as regras básicas",
      "Divulguem o serviço",
      "Acompanhem os resultados e cuidem de quem media"
    ],
    "zh": [
      "招募并培训调解人",
      "搭一套申请与受理流程",
      "找到中立的会面场地",
      "划定范围和边界",
      "立好保密和基本规则",
      "把消息传出去",
      "记录结果，照顾调解人"
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
    ],
    "pt": [
      "Montem um diretório de recursos e parcerias",
      "Convoquem e capacitem pessoas voluntárias",
      "Criem uma acolhida e uma conversa de necessidades",
      "Apoiem com documentos e benefícios",
      "Conectem com emprego e moradia",
      "Ofereçam mentoria entre pares",
      "Estabeleçam práticas de privacidade e limites"
    ],
    "zh": [
      "建一份资源与合作名录",
      "招募并培训帮手",
      "设计一套欢迎和需求了解流程",
      "帮忙办证件和补助",
      "对接工作和住处",
      "安排过来人导师",
      "立好隐私和边界的规矩"
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
    ],
    "pt": [
      "Garantam uma fonte de lenha",
      "Encontrem um lugar para processar e armazenar",
      "Consigam equipamento e proteção",
      "Convoquem e treinem a equipe da lenha",
      "Montem um sistema de pedido e entrega",
      "Definam critérios de distribuição",
      "Programem os mutirões e a secagem"
    ],
    "zh": [
      "落实柴源",
      "找一处加工和存放场地",
      "备齐设备和护具",
      "招募并培训砍柴队",
      "搭一套申请和送柴的办法",
      "定好分柴的标准",
      "排好动手日和晾晒"
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
    ],
    "pt": [
      "Mapeiem as necessidades e os vazios de cobertura",
      "Garantam uma conexão de internet de base",
      "Convoquem pessoas voluntárias com perfil técnico",
      "Consigam e configurem o equipamento",
      "Encontrem locais anfitriões para os nós",
      "Definam normas de uso aceitável e privacidade",
      "Mantenham e ampliem a rede"
    ],
    "zh": [
      "摸清覆盖需求和缺口",
      "谈妥一条上游网络线路",
      "招募技术帮手",
      "张罗并配置设备",
      "找安放节点的场所",
      "定好使用和隐私的规矩",
      "维护并扩展网络"
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
    ],
    "pt": [
      "Convoquem e capacitem pessoas facilitadoras",
      "Definam o alcance e os limites do círculo",
      "Montem um plano de encaminhamento e resposta a crises",
      "Encontrem um espaço privado e seguro",
      "Combinem a confidencialidade e as regras do grupo",
      "Agendem e divulguem os encontros",
      "Apoiem quem facilita e previnam o esgotamento"
    ],
    "zh": [
      "招募并培训引导者",
      "划定圈子的范围和边界",
      "建一套危机转介和升级预案",
      "找一个私密安全的空间",
      "定下保密和圈子的基本规则",
      "排好时间，把消息传出去",
      "支持引导者，防止耗竭"
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
    ],
    "pt": [
      "Identifiquem e priorizem os locais",
      "Consigam as permissões e um plano de descarte",
      "Reúnam materiais e equipamento de segurança",
      "Convoquem e organizem as pessoas voluntárias",
      "Realizem o dia de limpeza ou recuperação"
    ],
    "zh": [
      "排查场地并排出先后",
      "拿到许可，定好清运方案",
      "备齐物资和安全装备",
      "招募并安排志愿者",
      "办好大扫除或修复日"
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
    ],
    "pt": [
      "Treinem e certifiquem as pessoas preparadoras",
      "Façam parceria com um programa reconhecido de declaração gratuita",
      "Preparem um espaço e os equipamentos",
      "Montem um sistema de agendamento e acolhimento",
      "Divulguem para vizinhos e vizinhas elegíveis",
      "Garantam a segurança e a privacidade dos dados",
      "Ofereçam acompanhamento de empoderamento financeiro"
    ],
    "zh": [
      "让报税员完成培训和认证",
      "与受认可的免费报税项目结成伙伴",
      "布置场地和设备",
      "搭好预约和接待流程",
      "向符合条件的邻居宣传",
      "守住数据安全和隐私",
      "提供后续的理财陪伴"
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
    ],
    "pt": [
      "Garantam o abastecimento de alimentos e itens",
      "Encontrem um ponto e montem a banca",
      "Decidam o modelo",
      "Organizem exposição, armazenamento e higiene dos alimentos",
      "Convoquem e escalem as pessoas voluntárias",
      "Divulguem e fixem um horário regular",
      "Toquem a banca e cuidem das sobras"
    ],
    "zh": [
      "落实果蔬和物资的货源",
      "找场地，搭摊位",
      "定下模式",
      "布置陈列、储存和食品安全",
      "招募并排班志愿者",
      "定期开摊并广而告之",
      "开摊当天与余量处理"
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
    ],
    "pt": [
      "Decidam quem vocês vão receber e como",
      "Montem um kit de informações locais",
      "Montem as cestas de boas-vindas",
      "Convoquem e preparem quem dá as boas-vindas",
      "Montem um sistema de indicação e adesão"
    ],
    "zh": [
      "定下欢迎谁、怎么欢迎",
      "编一册本地信息手册",
      "装迎新篮子",
      "招募并培训迎新员",
      "搭好转介与报名渠道"
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
    ],
    "pt": [
      "Pesquisem o que a comunidade quer pegar emprestado",
      "Encontrem espaço de armazenamento e horários de funcionamento",
      "Recolham, limpem e testem os itens",
      "Cataloguem e fotografem o acervo",
      "Escrevam regras de empréstimo e uma política de confiança",
      "Montem a rotina de empréstimo e preparem as pessoas bibliotecárias",
      "Mantenham, higienizem e façam a coleção crescer"
    ],
    "zh": [
      "问问大家想借什么",
      "找储物空间，定开放时间",
      "收集、清洁并测试物品",
      "编目并拍照",
      "写借用规则和一份信任守则",
      "搭好借出登记，培训馆员",
      "养护、消毒，让馆藏慢慢生长"
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
    ],
    "pt": [
      "Garantam o acesso a lavanderia e chuveiros",
      "Consigam os suprimentos",
      "Montem um sistema de inscrição e horários",
      "Estabeleçam protocolos de higiene e segurança",
      "Convoquem e preparem as pessoas voluntárias",
      "Fixem um horário e espalhem a notícia"
    ],
    "zh": [
      "落实洗衣和淋浴的场地",
      "筹集物资",
      "搭好报名和时段安排",
      "定好卫生与安全流程",
      "招募并培训志愿者",
      "定下时间表，把消息传开"
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
    ],
    "pt": [
      "Aprendam as regras das campanhas de registro",
      "Treinem pessoas voluntárias apartidárias",
      "Reúnam materiais e informação exata",
      "Escolham pontos e eventos de grande movimento",
      "Atendam a mesa de registro",
      "Ajudem com os próximos passos"
    ],
    "zh": [
      "摸清登记行动的规则",
      "培训不偏不倚的志愿者",
      "备齐材料和准确的信息",
      "挑人流量大的地点和活动",
      "摆桌办理登记",
      "陪大家走完后面几步"
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
    ],
    "pt": [
      "Montem um diretório de recursos de saúde",
      "Convoquem e treinem as pessoas navegadoras",
      "Montem um sistema de pedido e acolhimento",
      "Ajudem com planos e inscrições",
      "Ofereçam apoio com consultas e receitas",
      "Definam práticas de privacidade para informações de saúde",
      "Façam parceria com clínicas e serviços de saúde"
    ],
    "zh": [
      "编一份医疗资源名录",
      "招募并培训领路人",
      "搭一条求助与接待渠道",
      "帮忙办保险和参保",
      "陪伴预约和取药",
      "为健康信息立好隐私规矩",
      "和诊所、医疗机构结成伙伴"
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
    ],
    "pt": [
      "Consigam espaço e horários de funcionamento",
      "Coletem, limpem e chequem a segurança dos brinquedos",
      "Cataloguem e ensaquem com todas as peças",
      "Escrevam as regras de empréstimo",
      "Montem o empréstimo e treinem quem cuida do acervo"
    ],
    "zh": [
      "找到存放点，定好开放时间",
      "收集、清洁并做安全检查",
      "编目装袋，零件点清",
      "写一份借用规则",
      "建好借出登记，带馆员上手"
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
    ],
    "pt": [
      "Garantam uma cozinha adequada",
      "Aprendam métodos seguros de conservação",
      "Reúnam equipamento e vidros",
      "Consigam alimentos",
      "Planejem sessões de conservas em grupo",
      "Ensinem e conduzam as sessões com segurança",
      "Compartilhem as conservas e registrem"
    ],
    "zh": [
      "找一间合用的厨房",
      "学会安全的保存方法",
      "凑齐器具和罐子",
      "张罗食材",
      "排好集体装罐场次",
      "安全带场，边做边教",
      "分享保存好的食物并做记录"
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
    ],
    "pt": [
      "Convoquem cabeleireiras e barbeiros licenciados",
      "Encontrem um espaço com condições de higiene",
      "Consigam equipamento e materiais",
      "Montem a higienização e a conformidade com as licenças",
      "Conduzam os dias de cuidado pessoal"
    ],
    "zh": [
      "招募持证发型师和理发师",
      "找一个卫生条件过关的场地",
      "备齐设备和用品",
      "落实消毒和执业合规",
      "把打理日办起来"
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
    ],
    "pt": [
      "Convoquem uma equipe e veículos",
      "Reúnam materiais de mudança",
      "Montem um sistema de pedido e avaliação",
      "Resolvam segurança e responsabilidade",
      "Definam agenda e despacho",
      "Definam alcance e limites",
      "Façam as mudanças e acompanhem depois"
    ],
    "zh": [
      "召集队伍和车辆",
      "凑齐搬家用具",
      "搭一套求助与评估流程",
      "理顺安全和责任",
      "定好排期和调度",
      "划清能接与不能接",
      "完成搬家并回访"
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
    ],
    "pt": [
      "Centrem a liderança nas pessoas com deficiência",
      "Montem um sistema de comunicação acessível",
      "Mapeiem necessidades e recursos",
      "Montem uma troca de apoio mútuo",
      "Criem um acervo de empréstimo de equipamentos",
      "Ofereçam apoio de defesa de direitos e navegação",
      "Definam padrões de acessibilidade para todos os eventos do programa"
    ],
    "zh": [
      "把带头的位置交给残障者",
      "搭一套无障碍的沟通方式",
      "摸清需求和资源",
      "搭起互助交换",
      "建一个辅具借用池",
      "提供权益争取和办事引路",
      "给项目所有活动定下无障碍标准"
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
    ],
    "pt": [
      "Aprendam as regras de correspondência de cada unidade",
      "Reúnam livros e um espaço de trabalho",
      "Montem um sistema para cuidar dos pedidos",
      "Convoquem e treinem pessoas voluntárias",
      "Cubram postagem e logística",
      "Organizem um programa de cartas"
    ],
    "zh": [
      "弄清各监狱的邮寄规定",
      "凑书并布置打包角",
      "建一套处理求书信的流程",
      "招募并培训志愿者",
      "落实邮资和寄送安排",
      "组织笔友通信项目"
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
    ],
    "pt": [
      "Coletem e consertem instrumentos",
      "Montem um sistema de empréstimo de instrumentos",
      "Convoquem professoras e professores voluntários",
      "Encontrem um espaço para aulas e jams",
      "Agendem aulas e jam sessions",
      "Definam expectativas de cuidado e devolução"
    ],
    "zh": [
      "收集并修复乐器",
      "建一套乐器借用系统",
      "招募志愿老师",
      "找一个能上课能合奏的场地",
      "排好课程和即兴合奏",
      "定好保养和归还的约定"
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
    ],
    "pt": [
      "Consigam as listas de material e meçam a necessidade",
      "Façam campanhas de arrecadação e compras em atacado",
      "Separem e montem por ano escolar",
      "Montem o armazenamento e um ponto de entrega",
      "Agendem a entrega e escalem quem ajuda"
    ],
    "zh": [
      "拿到文具清单，摸清需求",
      "办文具募集并批发采购",
      "按年级分拣、装包",
      "落实存放点和发放点",
      "排好发放日，安排人手"
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
    ],
    "pt": [
      "Façam parceria com advogadas, advogados e assistência jurídica",
      "Definam o alcance e os caminhos de encaminhamento",
      "Montem um espaço e uma acolhida",
      "Montem um sistema confidencial de horários",
      "Desenvolvam materiais e oficinas de Conheça seus direitos",
      "Divulguem e agendem as clínicas",
      "Protejam a confidencialidade e chequem conflitos"
    ],
    "zh": [
      "联络律师和法律援助机构",
      "划定范围和转介路径",
      "布置场地和接待登记",
      "搭一套保密的预约系统",
      "编写“了解你的权利”材料并办讲座",
      "宣传咨询点并排定日程",
      "守好保密底线，做好利益冲突排查"
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
    ],
    "pt": [
      "Montem uma acolhida única para necessidades e ofertas",
      "Montem uma lista de pessoas voluntárias e recursos",
      "Criem um processo para casar e encaminhar pedidos",
      "Mantenham um diretório-mestre de recursos",
      "Convidem e treinem pessoas coordenadoras",
      "Definam práticas de privacidade de dados e acompanhamento",
      "Registrem necessidades não atendidas e lacunas"
    ],
    "zh": [
      "为需求和提供设一个统一入口",
      "建一份志愿者和资源名册",
      "定一套匹配和调度流程",
      "维护一份资源总目录",
      "招募并培训协调人",
      "定下数据隐私和回访的做法",
      "记录没接住的需求和缺口"
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
    ],
    "pt": [
      "Façam o treinamento e encontrem uma parceria de redução de danos",
      "Confira a lei local sobre insumos",
      "Consiga naloxona e insumos para os kits",
      "Montem kits com instruções em linguagem simples",
      "Estabeleça rondas de distribuição e pontos fixos",
      "Reabasteça, acompanhe e mantenha o treinamento em dia"
    ],
    "zh": [
      "接受培训，找到降低伤害领域的伙伴",
      "查清当地关于物资的法律",
      "采购纳洛酮和物资包材料",
      "组装物资包，配上大白话说明卡",
      "排好发放路线和固定投放点",
      "补货、记录，让培训保持新鲜"
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
    ],
    "pt": [
      "Conectem-se com defensorias e grupos que já atuam no fórum",
      "Escreva as regras base: apoio, não direito",
      "Monte uma acolhida e um calendário de audiências",
      "Treine as pessoas voluntárias de acompanhamento",
      "Coordene caronas e cuidado das crianças para as audiências",
      "Organize cartas de apoio quando a defesa pedir"
    ],
    "zh": [
      "联络辩护人和已有的法庭团体",
      "写下底线规矩：只陪伴，不碰法律",
      "建一个求助入口和开庭日历",
      "培训陪同志愿者",
      "为庭审安排接送和看孩子",
      "辩护律师需要时组织支持信"
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
    ],
    "pt": [
      "Encontre um espaço anfitrião com climatização",
      "Definam os gatilhos de ativação e um plano de aviso",
      "Estoque os insumos",
      "Convide e treine quem recebe nos turnos",
      "Monte a escala de turnos",
      "Espalhe a notícia antes da temporada",
      "Abra, receba e reorganize a cada ativação"
    ],
    "zh": [
      "找一处有冷暖空调的场地",
      "定下启用门槛和通知方案",
      "备齐物资",
      "招募并培训各时段的值守人",
      "排好时段轮换表",
      "赶在季节之前把消息传开",
      "每次启用：开门、值守、复位"
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
    ],
    "pt": [
      "Escreva um termo de consentimento em linguagem simples",
      "Reúna o equipamento e uma lista de perguntas",
      "Grave as sessões de histórias",
      "Arquive e devolva, nos termos de cada pessoa"
    ],
    "zh": [
      "写一份大白话的同意书",
      "备好设备和一份问题清单",
      "录制故事场次",
      "归档，并按讲述人的意愿分享回去"
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
    ],
    "pt": [
      "Reúna membros e meça o interesse",
      "Aprenda os modelos e as regras locais",
      "Encontre um lugar ou um programa para entrar",
      "Resolva o financiamento e a estrutura jurídica",
      "Faça parceria com instaladores e fornecedores",
      "Monte o sistema de créditos na conta e de participação",
      "Eduque os membros sobre o consumo de energia"
    ],
    "zh": [
      "召集成员，摸清意愿",
      "弄懂模式和当地规则",
      "找一处场地或一个可加入的项目",
      "理清融资和法律架构",
      "对接安装商和供应商",
      "搭好电费抵扣和成员账目系统",
      "带成员看懂用电"
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
    ],
    "pt": [
      "Levante as habilidades e as metas dos membros",
      "Ofereça preparação para o trabalho e formação em habilidades",
      "Ensine o modelo cooperativo",
      "Acompanhe a formação das cooperativas",
      "Conecte com recursos de largada",
      "Ofereça mentoria",
      "Construa apoio entre os empreendimentos"
    ],
    "zh": [
      "摸底成员的技能和心愿",
      "开设求职和技能培训",
      "讲透合作社模式",
      "陪伴合作社正式成立",
      "对接起步资源",
      "安排导师陪跑",
      "让创业团队互相扶持"
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
    ],
    "pt": [
      "Identifique as pessoas idosas que não saem de casa",
      "Convoque e verifique voluntários",
      "Garanta uma fonte de refeições",
      "Planeje as rotas e o calendário de entregas",
      "Registre informações de dieta, alergias e emergência",
      "Estabeleça um protocolo de verificação de bem-estar",
      "Apoie os voluntários e recolha opiniões"
    ],
    "zh": [
      "找到出不了门的老人",
      "招募并核查帮手",
      "落实饭菜来源",
      "规划送餐路线和时间表",
      "记录饮食、过敏和紧急联络信息",
      "定一套确认平安的流程",
      "照应帮手，收集反馈"
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
    ],
    "pt": [
      "Identifique de antemão um local e um reserva",
      "Construa canais de abastecimento",
      "Monte a recepção, a triagem e o inventário",
      "Crie um sistema de distribuição",
      "Convoque e treine uma equipe de voluntários de prontidão",
      "Coordene com outras equipes de resposta",
      "Planeje a comunicação e a segurança"
    ],
    "zh": [
      "提前找好集散场地和备选",
      "搭建物资来源渠道",
      "搭好接收、分拣和库存流程",
      "建立发放办法",
      "招募并训练一支应急帮手队伍",
      "和其他救援力量协调",
      "规划通讯和安全"
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
    ],
    "pt": [
      "Convoque e forme facilitadores pares",
      "Defina o escopo e os limites",
      "Construa caminhos de encaminhamento e de crise",
      "Encontre um espaço seguro, privado e livre de substâncias",
      "Estabeleça a confidencialidade e as normas do grupo",
      "Agende e divulgue os encontros",
      "Apoie os facilitadores e previna o esgotamento"
    ],
    "zh": [
      "招募并培训同伴引导者",
      "定下范围和边界",
      "打通转介和危机渠道",
      "找一个安全、私密、不沾成瘾物质的场地",
      "立下保密和小组规矩",
      "排好聚会时间并传出去",
      "照应引导者，别让他们累垮"
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
    ],
    "pt": [
      "Sonde interesses e níveis de atividade",
      "Convoque pessoas para guiar as atividades",
      "Encontre espaços seguros",
      "Planeje uma programação inclusiva, para todos os níveis",
      "Cuide da segurança e da saúde",
      "Defina uma agenda e espalhe a notícia",
      "Cultive comunidade e constância"
    ],
    "zh": [
      "摸底大家的兴趣和活动量",
      "找活动带队人",
      "找安全的场地",
      "设计人人能参与、不分水平的活动",
      "把安全和健康顾上",
      "定下时间表，把消息传开",
      "把人气和习惯养起来"
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
    ],
    "pt": [
      "Garanta o acesso à terra de longo prazo",
      "Planeje o desenho do plantio",
      "Consiga as árvores e as plantas",
      "Prepare o terreno",
      "Organize mutirões de plantio",
      "Monte o cuidado de longo prazo",
      "Planeje a partilha da colheita"
    ],
    "zh": [
      "拿下长期的土地使用权",
      "规划种植设计",
      "筹措树苗和植物",
      "整备场地",
      "办种树日",
      "安排长期照看",
      "商定收成怎么分"
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
    ],
    "pt": [
      "Convoque voluntários e pares de apoio",
      "Monte uma corrente de refeições",
      "Ofereça ajuda prática",
      "Monte um diretório de recursos",
      "Crie rodas de apoio entre pares",
      "Defina práticas de segurança e de limites",
      "Conecte com os outros projetos"
    ],
    "zh": [
      "招募帮手和同伴支持者",
      "搭一套送餐接力",
      "搭手干实事",
      "整一份资源目录",
      "办同伴支持圈",
      "定下安全和边界的做法",
      "和其他项目连起来"
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
    ],
    "pt": [
      "Conecte-se com as famílias cuidadoras",
      "Monte uma reserva de roupas e itens",
      "Crie um sistema de entrega rápida",
      "Organize o apoio de respiro",
      "Ofereça grupos de apoio entre pares",
      "Monte um diretório de recursos",
      "Defina práticas de segurança das crianças e de privacidade"
    ],
    "zh": [
      "和照护家庭连上线",
      "攒起衣物和用品储备",
      "建一套快速送达的机制",
      "组织喘息支持",
      "办同伴支持小组",
      "整一份资源目录",
      "定下儿童安全和隐私的做法"
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
    ],
    "pt": [
      "Monte kits para cada estação",
      "Consiga os suprimentos",
      "Mapeie onde encontrar as pessoas",
      "Convoque e treine voluntários de rua",
      "Monte um plano de distribuição e rotas",
      "Conecte as pessoas a abrigos e serviços",
      "Prepare-se para as emergências"
    ],
    "zh": [
      "按季节配好物资包",
      "筹措物资",
      "摸清人们在哪儿",
      "招募并训练上街的帮手",
      "排好发放计划和路线",
      "把人和庇护所、援助点连起来",
      "为紧急情况做好准备"
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
