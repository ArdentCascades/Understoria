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
// Spanish project templates (i18n Phase 2a split from
// projectTemplates.ts). Loaded lazily via content/bundles/es.ts —
// never import this statically from app code.
import type { ProjectTemplate } from "./projectTemplates";

export const PROJECT_TEMPLATES_ES: readonly ProjectTemplate[] = [
  {
    "id": "community-fridge",
    "name": "Refrigerador comunitario y despensa libre",
    "purpose": "Ofrecer acceso gratuito, las 24 horas, a alimentos y artículos esenciales, sin preguntas.",
    "whoItServes": "Cualquiera que necesite comida; especialmente útil para personas con horarios irregulares, vecinas y vecinos indocumentados, y quienes no pueden llegar a un banco de alimentos en horario de oficina.",
    "whatYoullNeed": "Un refrigerador donado, un lugar exterior protegido con un enchufe, un sitio anfitrión y una pequeña rotación de limpieza.",
    "setupHours": 18,
    "defaultCategory": "food",
    "firstSteps": "Empieza por el sitio anfitrión, no por el refrigerador. Siéntate con la dueña de la tienda, la iglesia o la clínica que tienes en mente y hablen de lo menos glamoroso — el recibo de luz, qué pasa cuando alguien deja un desastre, a quién llaman cuando se descompone — antes de conseguir aparato alguno. De paso, pregunta a las despensas y grupos de apoyo mutuo que ya trabajan cerca qué huecos ven, para que el refrigerador llene uno en vez de duplicarlos.",
    "commonPitfalls": "Los refrigeradores comunitarios casi nunca mueren por falta de donaciones — mueren cuando nadie es claramente responsable de la limpieza, el refrigerador se pone feo y el sitio anfitrión pide en voz baja que se lo lleven. Pon nombres en la rotación antes del día de apertura, y cuida la relación con el sitio anfitrión como lo que realmente estás manteniendo, no solo el aparato.",
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
        "name": "Encuentra un sitio anfitrión con electricidad y tránsito de gente",
        "description": "Acércate a pequeños negocios, iglesias, clínicas o centros comunitarios. Pregunta si dejan colocar un refrigerador bajo su alero y enchufarlo (la electricidad suele costar unos pocos dólares al mes — ofrece cubrirlo). Consigue un sí por escrito, aunque sea sencillo.",
        "hours": 3,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Consigue un refrigerador y un refugio resistente al clima",
        "description": "Pide un refrigerador en buen estado en grupos locales. Construye o consigue un mueble o cobertizo de madera sencillo a su alrededor para protegerlo de la lluvia y el sol. Ánclalo para que no se vuelque. Incluye buscarlo, transportarlo y armar el refugio.",
        "hours": 8,
        "skills": [
          "carpintería",
          "conducir"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Define las reglas y etiqueta todo",
        "description": "Coloca un cartel claro y multilingüe: toma lo que necesites, deja lo que puedas, nada caducado, ni conservas caseras, ni carne cruda. Añade etiquetas y un marcador para que la gente pueda anotar la fecha en los productos.",
        "hours": 1.5,
        "skills": [
          "redacción",
          "traducción"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Arma una rotación de limpieza y reabastecimiento",
        "description": "Crea un calendario semanal compartido. Cada turno son unos 15 minutos: limpia las superficies, retira lo dañado o vencido y anota lo que se está acabando. Mantén productos de limpieza en el sitio.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "organización"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Construye relaciones con quienes donan",
        "description": "Pide a panaderías, tiendas, restaurantes y mercados de productores donaciones regulares al final del día. Coordina a una persona voluntaria para recogerlas. Lleva nota de qué fuentes son confiables.",
        "hours": 3,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Establece un contacto para problemas",
        "description": "Pon un teléfono o correo en el refrigerador para avisos como \"se descompuso / no hay luz / una pregunta\". Decide quién responde y en cuánto tiempo.",
        "hours": 0.5
      }
    ]
  },
  {
    "id": "community-garden",
    "name": "Huerto comunitario / parcela compartida",
    "purpose": "Cultivar juntas y juntos comida fresca y crear un espacio de encuentro.",
    "whoItServes": "Vecinas y vecinos sin patio, personas presionadas por el costo de los alimentos y cualquiera que quiera vínculo y un motivo para estar al aire libre.",
    "whatYoullNeed": "Un terreno (puede ser un lote baldío o una azotea), tierra o camas de cultivo, acceso a agua, semillas y un grupo base de 5 a 10 personas constantes.",
    "setupHours": 25,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Antes de tocar la tierra, habla con dos grupos de personas: quien sea dueña del terreno, y las vecinas y vecinos que viven justo al lado — su bendición pesa tanto como el contrato. Después reúne a tu grupo base y tengan pronto la conversación sobre cómo se comparte; saber si serán parcelas individuales o cosecha comunal cambia todo lo que van a construir.",
    "commonPitfalls": "Los huertos no suelen morir en primavera — mueren en las semanas más calurosas, cuando la rotación de riego se desmorona en silencio y las camas se secan. El otro peligro lento es que una sola persona lo trate como su huerto con ayudantes; pongan por escrito cómo se toman las decisiones mientras todavía se llevan bien.",
    "pairsWith": [
      "seed-library",
      "community-composting",
      "food-preservation"
    ],
    "tasks": [
      {
        "name": "Asegura el terreno y el permiso",
        "description": "Identifica un lote baldío, un patio de iglesia, un terreno escolar o una esquina de parque sin uso. Encuentra a quien sea dueña o dueño (registros municipales, o simplemente pregunta). Consigue un permiso o contrato por escrito, aunque sea un acuerdo de un año estrechado por escrito, y confirma el acceso al agua.",
        "hours": 6,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Analiza el suelo y planea las camas",
        "description": "Envía una prueba de suelo económica a un servicio de extensión local para descartar plomo u otros contaminantes. Si el suelo está mal, planea camas elevadas con tierra limpia. Esboza dónde irán camas, caminos y un rincón de herramientas.",
        "hours": 2,
        "skills": [
          "jardinería"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Reúne materiales y construye",
        "description": "Junta madera o usa camas de pacas de paja o tipo \"keyhole\", composta y mantillo. Organiza un día de construcción; muchas manos levantan camas rápido. Instala una manguera o barriles de lluvia.",
        "hours": 10,
        "skills": [
          "carpintería"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Decidan cómo se comparte",
        "description": "Acuerden en grupo: parcelas individuales, cosecha completamente comunal, o una mezcla. Pongan por escrito cómo se reparte lo cosechado y cómo se toman las decisiones.",
        "hours": 1,
        "skills": [
          "facilitación"
        ]
      },
      {
        "name": "Siembra según el clima y la temporada",
        "description": "Elige cultivos fáciles y de buen rendimiento para tu zona (verduras de hoja, frijoles, calabaza, tomate, hierbas). Escalona las siembras para que las cosechas no caigan todas al mismo tiempo. Etiqueta los surcos.",
        "hours": 4,
        "recurringCadence": "cycle",
        "skills": [
          "jardinería"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Organiza una rotación de riego y deshierbe",
        "description": "Las plantas mueren más por descuido que por otra cosa. Arma un calendario compartido sencillo; liga las tareas a recordatorios fáciles. Mantén el compromiso ligero para que nadie se queme.",
        "hours": 1,
        "skills": [
          "organización"
        ],
        "follows": [
          4
        ]
      },
      {
        "name": "Planea la cosecha y los excedentes",
        "description": "Decidan los días de cosecha. Manden lo que sobre al refrigerador comunitario, a vecinas y vecinos o a un puesto gratuito en la entrada. Guarden algunas semillas para el año siguiente.",
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
    "name": "Biblioteca de herramientas y equipo",
    "purpose": "Permitir que vecinas y vecinos pidan prestadas herramientas y equipo en lugar de comprarlos, para ahorrar dinero y reducir desperdicio.",
    "whoItServes": "Personas que rentan, quienes acaban de comprar casa, aficionadas y aficionados, y cualquiera que haga reparaciones o proyectos de vez en cuando.",
    "whatYoullNeed": "Un espacio de almacenamiento, herramientas donadas, un sistema sencillo de préstamo y un par de \"bibliotecarias\" o \"bibliotecarios\".",
    "setupHours": 20,
    "defaultCategory": "infrastructure",
    "firstSteps": "Antes de juntar un solo taladro, habla con la persona que ofrece el espacio sobre lo que de verdad implica convivir con una biblioteca de herramientas — ruido, cosas que se acumulan, gente desconocida en la puerta durante el horario. Luego pregunta a tus vecinas y vecinos qué pedirían prestado en realidad; una lista de diez herramientas solicitadas vale más que un garaje lleno de donaciones que nadie quiere.",
    "commonPitfalls": "Las bibliotecas de herramientas mueren del silencio después de la fecha de devolución: nadie da seguimiento, las herramientas se vuelven préstamos permanentes y los estantes se vacían. Una rutina amable de recordatorios importa más que una política estricta de retrasos — y aprendan a decir que no a las donaciones, o se convertirán en el tiradero de herramientas rotas del barrio.",
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
        "name": "Encuentra dónde guardar y un horario de atención",
        "description": "Sirve una caseta, una cochera, un clóset en un centro comunitario o un contenedor. Elige de 2 a 4 horas fijas a la semana para que la gente sepa cuándo ir.",
        "hours": 3,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Reúne y ordena el inventario",
        "description": "Haz una convocatoria de donaciones (la gente tiene taladros y escaleras duplicados por todos lados). Limpia, prueba y etiqueta cada herramienta. Descarta o repara lo que esté inseguro.",
        "hours": 6,
        "skills": [
          "conducir"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Cataloga todo",
        "description": "Usa una hoja de cálculo gratuita o una app de biblioteca de préstamos. Registra cada artículo, su estado y una foto. Numera las herramientas para que sea fácil seguirles la pista.",
        "hours": 4,
        "skills": [
          "captura de datos"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Escribe las reglas de préstamo",
        "description": "Define el plazo (por ejemplo, una semana), cuántas piezas a la vez y la política de devolución o retraso. Que sea flexible — esto se trata de confianza. Anota qué herramientas requieren una breve explicación de seguridad.",
        "hours": 1,
        "skills": [
          "redacción"
        ]
      },
      {
        "name": "Arma el registro de salida",
        "description": "Una tablilla o un formulario sencillo: nombre, contacto, artículo, fecha de salida, fecha de devolución. Toma una foto rápida del estado de la herramienta al salir para evitar disputas.",
        "hours": 2,
        "skills": [
          "captura de datos"
        ],
        "follows": [
          2,
          3
        ]
      },
      {
        "name": "Capacita a quienes atienden",
        "description": "Lleva a las personas voluntarias por el catálogo, los pasos de préstamo y la seguridad básica (lentes de protección, uso de escaleras). Ten una hoja de referencia de una sola página en el mostrador.",
        "hours": 2,
        "skills": [
          "enseñanza"
        ],
        "follows": [
          4
        ]
      },
      {
        "name": "Mantén y haz crecer la biblioteca",
        "description": "Revisa las herramientas devueltas, afila y aceita con regularidad, y observa qué piden más para saber qué sumar después.",
        "hours": 2,
        "skills": [
          "reparación de herramientas"
        ],
        "recurringCadence": "session"
      }
    ]
  },
  {
    "id": "neighborhood-care-network",
    "name": "Red de cuidado vecinal",
    "purpose": "Asegurarse de que las personas vecinas en aislamiento sean visitadas, escuchadas y acompañadas.",
    "whoItServes": "Personas mayores, vecinas y vecinos con discapacidad o enfermedad crónica, madres y padres recientes, y cualquiera que viva en soledad.",
    "whatYoullNeed": "Una lista de personas voluntarias, una forma de emparejarlas con quienes necesitan compañía y una rutina de contacto. Las personas voluntarias son vecinas, no profesionales del cuidado — revisen a quien haga visitas a domicilio, nunca dejen que una persona voluntaria maneje sola el dinero de alguien, y acuerden de antemano cuándo llamar a la familia o a los servicios de emergencia.",
    "setupHours": 18,
    "defaultCategory": "emotional_support",
    "firstSteps": "Empieza escuchando, no reclutando: habla con las vecinas y vecinos que esperas apoyar sobre lo que realmente quieren — una llamada semanal, un aventón, compañía — porque una red construida sobre suposiciones se siente como vigilancia. Al mismo tiempo, ten la conversación honesta con las primeras personas voluntarias sobre revisión de referencias y límites, para que cuando llegue el primer emparejamiento las reglas se sientan como cuidado y no como desconfianza.",
    "commonPitfalls": "Las redes de cuidado rara vez fracasan por falta de gente voluntaria — queman a las tres personas que siempre dicen que sí mientras las demás esperan a que les pidan. Reparte los emparejamientos a propósito, sostén los espacios de desahogo para voluntarias y voluntarios aunque todo parezca bien, y no dejes que los contactos conviertan a una vecina en un expediente en vez de una persona.",
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
        "name": "Identifica quién vive cerca",
        "description": "Con discreción, identifica a personas que puedan estar aisladas, por boca a boca, administración de edificios, clínicas y grupos religiosos. Nunca des por hecho la necesidad — invita, no señales.",
        "hours": 4,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Convoca y filtra a las personas voluntarias",
        "description": "Busca a quienes puedan comprometerse a un contacto regular. Para visitas en casa o apoyo a personas adultas vulnerables, haz revisiones básicas de referencias y nunca dejes que una sola persona voluntaria maneje el dinero de alguien.",
        "hours": 5,
        "skills": [
          "difusión",
          "entrevistas"
        ]
      },
      {
        "name": "Empareja con cuidado",
        "description": "Empareja por idioma, cercanía y comodidad. Pregúntale a cada parte qué desea — una llamada semanal, una vuelta al súper, una charla en el portal — y respeta ese límite.",
        "hours": 2,
        "skills": [
          "organización"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Define un ritmo de contacto",
        "description": "Acuerden la frecuencia y el medio (llamada, mensaje, tocar la puerta). Dale a las personas voluntarias un guion corto para el primer contacto para que se sienta cálido, no clínico.",
        "hours": 1,
        "follows": [
          2
        ]
      },
      {
        "name": "Crea un plan de escalamiento",
        "description": "Decide de antemano qué hacer si alguien no responde o parece estar en crisis: a quién llamar, cuándo involucrar a familia o a servicios de emergencia y cómo registrarlo. Mantenlo por escrito y sencillo.",
        "hours": 2,
        "skills": [
          "redacción"
        ]
      },
      {
        "name": "Coordina apoyo práctico",
        "description": "Lleva nota de necesidades recurrentes — traslados a citas, recoger recetas, palear nieve — y conéctalas con otras personas voluntarias o proyectos de tu red.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "organización"
        ]
      },
      {
        "name": "Cuida también a quienes acompañan",
        "description": "Organiza un espacio de desahogo para las personas voluntarias. El trabajo de cuidado desgasta; rota tareas y atiende las señales de agotamiento.",
        "hours": 2,
        "skills": [
          "facilitación"
        ],
        "recurringCadence": "month"
      }
    ]
  },
  {
    "id": "emergency-preparedness",
    "name": "Red de preparación ante emergencias y desastres",
    "purpose": "Ayudar al vecindario a prepararse y responder ante desastres (olas de calor, tormentas, inundaciones, apagones) cuando la ayuda oficial llega lento.",
    "whoItServes": "Todas y todos, con prioridad a quienes no pueden evacuar fácilmente o dependen de la electricidad para equipo médico.",
    "whatYoullNeed": "Una lista de contactos, un punto de encuentro, insumos básicos y un plan de comunicación que funcione sin internet. Esta red complementa a los servicios oficiales de emergencia — no los sustituye. En una situación que ponga en riesgo la vida, llamen siempre primero a los servicios de emergencia.",
    "setupHours": 30,
    "defaultCategory": "organizing",
    "firstSteps": "Construye el plan alrededor de la gente para quien es: toca las puertas de vecinas y vecinos que dependen de oxígeno, de medicinas refrigeradas o que viven en pisos altos sin elevador, y pregúntales cómo se ve una semana mala para ellas. Después habla con quien controle tu posible punto seguro y con cualquier grupo de emergencias que ya exista (protección civil, los bomberos) para que tu red llene los huecos alrededor de la respuesta oficial en vez de duplicarla.",
    "commonPitfalls": "Estas redes no fallan durante el desastre — fallan en los años tranquilos de antes, cuando la cadena de contactos se vuelve vieja, los teléfonos cambian y el plan vive en la laptop de una sola persona. Impriman todo, refresquen la lista con un ritmo fijo en el calendario y practiquen al menos una vez; el primer uso real nunca debería ser el primer uso.",
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
        "name": "Mapea los riesgos de tu vecindario",
        "description": "Enumera los desastres más probables en tu zona. Anota puntos vulnerables: personas en pisos altos sin ascensor, quienes usan oxígeno o medicamentos refrigerados, edificios con una sola salida.",
        "hours": 4
      },
      {
        "name": "Arma un árbol de contactos",
        "description": "Junta datos de contacto, manzana por manzana, con consentimiento. Designa varias \"jefas\" o \"jefes\" de cuadra que revisen unos 10 hogares cada quien. Guarda una copia en papel — los teléfonos e internet fallan en los desastres.",
        "hours": 8,
        "skills": [
          "difusión",
          "captura de datos"
        ]
      },
      {
        "name": "Planea comunicación sin internet",
        "description": "Decidan cómo se comunicarán sin señal celular: tocar puertas, un punto de encuentro, silbatos o radios. Imprime y reparte el plan.",
        "hours": 3,
        "skills": [
          "redacción"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Junta insumos compartidos",
        "description": "Arma un kit comunitario: agua, primeros auxilios, linternas, baterías, un radio de pilas o manivela, cobijas y herramientas básicas. Guárdalo donde varias personas tengan acceso.",
        "hours": 5,
        "skills": [
          "conducir"
        ]
      },
      {
        "name": "Identifica lugares seguros",
        "description": "Encuentra sitios que puedan servir como centro de enfriamiento o calefacción, o de carga eléctrica (un salón con generador, un parque con sombra). Confirma el acceso con anticipación.",
        "hours": 3,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Hagan un simulacro o una noche informativa",
        "description": "Organiza una sesión sobre mochilas de emergencia, cómo cerrar servicios y el árbol de contactos. Practiquen una vez para no estar aprendiendo durante la emergencia real.",
        "hours": 5,
        "skills": [
          "enseñanza",
          "facilitación"
        ],
        "follows": [
          1,
          2
        ]
      },
      {
        "name": "Define los roles para \"el día de\"",
        "description": "Asigna por adelantado quién revisa primero a quienes son médicamente vulnerables, quién abre el espacio seguro y quién coordina. Revisen y actualicen el plan dos veces al año.",
        "hours": 2,
        "skills": [
          "organización"
        ],
        "follows": [
          4
        ]
      }
    ]
  },
  {
    "id": "free-store",
    "name": "Tienda gratis / intercambio de objetos",
    "purpose": "Redistribuir ropa, artículos del hogar y suministros de forma gratuita.",
    "whoItServes": "Cualquiera — personas en aprietos, personas que están desahogando su casa y el medio ambiente.",
    "whatYoullNeed": "Un espacio (incluso temporal), mesas o percheros, personas voluntarias para clasificar y un horario regular.",
    "setupHours": 10,
    "defaultCategory": "mutual_aid_drive",
    "suggestsWorkDays": true,
    "firstSteps": "Habla primero con el sitio anfitrión sobre las realidades honestas — montones de donaciones, gente entrando y saliendo, cómo queda el salón a la mañana siguiente — y luego con una tienda de segunda mano o una organización cercana sobre lo que ya les llega de sobra, para saber qué le falta de verdad a tu barrio. Si puedes, pasa una hora en una tienda gratuita que ya funcione antes de tu primer evento; el flujo de recepción y exhibición es más fácil de copiar que de inventar.",
    "commonPitfalls": "Las tiendas gratuitas se ahogan antes de pasar hambre: sin una lista firme de sí y no en la puerta, las personas voluntarias se pasan cada hora clasificando donaciones rotas y sucias en vez de recibir a la gente. Y decidan a dónde va lo que sobra antes de que termine el primer evento — un montón de cosas sin reclamar y sin plan de salida es la forma clásica de perder el espacio anfitrión.",
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
        "name": "Elige el formato y el espacio",
        "description": "Decidan entre una tienda gratis permanente, una recurrente tipo pop-up o un intercambio de un solo día. Pidan prestado un salón, un local o un quiosco en un parque. Una fecha que se repite crea hábito.",
        "hours": 2
      },
      {
        "name": "Define qué se acepta como donación",
        "description": "Acepten solo cosas limpias, funcionales y usables. Publica una lista clara de \"sí\" y \"no\" (sin aparatos descompuestos, sin ropa manchada, sin artículos de bebé retirados del mercado). Esto ahorra muchísimo tiempo de clasificación.",
        "hours": 0.5,
        "skills": [
          "redacción"
        ]
      },
      {
        "name": "Organiza recepción y clasificación",
        "description": "Arma estaciones: recibir, clasificar por categoría y preparar para exhibir. Ten un plan para lo que no puedan usar (donar a otra parte o reciclar).",
        "hours": 2,
        "skills": [
          "organización"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Exhibe para que la gente elija con dignidad",
        "description": "Cuelga la ropa por talla, agrupa los artículos del hogar, mantén el espacio ordenado y acogedor. Sin solicitud, sin pruebas de necesidad — solo toma lo que vayas a usar.",
        "hours": 1.5,
        "skills": [
          "diseño"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Cubran el evento",
        "description": "Asigna a personas que reciban, clasifiquen y respondan preguntas. Un trato amable, sin juicios, es todo el punto.",
        "hours": 3,
        "skills": [
          "organización"
        ],
        "recurringCadence": "event"
      },
      {
        "name": "Gestiona lo que sobra",
        "description": "Acuerden con anticipación a dónde van los artículos que nadie tomó tras cada evento (una organización aliada, reciclaje textil) para que el espacio quede limpio.",
        "hours": 1,
        "skills": [
          "conducir"
        ]
      }
    ]
  },
  {
    "id": "skill-share",
    "name": "Intercambio de saberes y clases gratuitas",
    "purpose": "Que vecinas y vecinos enseñen y aprendan entre sí, sin costo — cocina, reparaciones, idiomas, presupuestos, primeros auxilios, habilidades digitales.",
    "whoItServes": "Todas y todos; especialmente quienes no pueden pagar clases y aquellas personas cuyo conocimiento pocas veces se reconoce.",
    "whatYoullNeed": "Un espacio, personas con ganas de enseñar y una manera de publicar el calendario.",
    "setupHours": 9,
    "defaultCategory": "education",
    "firstSteps": "El proyecto empieza con las conversaciones de dos preguntas, no con el local: pregunta a la gente qué podría enseñar y qué le encantaría aprender, y pon especial atención a las vecinas y vecinos cuyo conocimiento rara vez se trata como experiencia valiosa. Tu primera tarea real es tomarte un café con esa persona nerviosa que podría enseñar y convencerla de que su sesión no tiene que ser una cátedra.",
    "commonPitfalls": "Los intercambios de saberes se apagan cuando las mismas dos personas seguras terminan enseñándolo todo y el calendario se acomoda en silencio a las tardes libres de quienes organizan y no a las de quienes asisten. Sigue invitando a personas que enseñan por primera vez, pregunta quién falta en la sala, y trata una sesión de cinco personas como un éxito, porque lo es.",
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
        "name": "Pregunta por saberes e intereses",
        "description": "Hazles dos preguntas a las personas integrantes: ¿qué podrías enseñar? y ¿qué te encantaría aprender? Reúne las respuestas en un formulario sencillo. Donde se cruzan está tu programa.",
        "hours": 1.5,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Convoca y acompaña a quienes enseñan",
        "description": "Recuérdales que \"enseñar\" puede ser informal. Ayúdales a esbozar una sesión de una hora y reunir materiales. Empareja a quien dé clase por primera vez con alguien que la acompañe.",
        "hours": 3,
        "skills": [
          "enseñanza",
          "facilitación"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Encuentra espacio y horario",
        "description": "Usa una sala de biblioteca, un centro comunitario, un parque o la sala de alguien. Elige horarios recurrentes para que se vuelva rutina.",
        "hours": 1.5
      },
      {
        "name": "Arma un calendario",
        "description": "Lista las sesiones con fecha, tema, persona que enseña y qué llevar. Publícalo donde la gente ya mira. Mantén la inscripción ligera o de entrada libre.",
        "hours": 1.5,
        "recurringCadence": "month",
        "skills": [
          "organización"
        ],
        "follows": [
          1,
          2
        ]
      },
      {
        "name": "Hazlo accesible",
        "description": "Considera necesidades de idioma, cuidado de infancias, acceso físico y horarios para personas que trabajan. Pregúntales a quienes asisten qué les ayudaría a llegar.",
        "hours": 1.5,
        "skills": [
          "accesibilidad",
          "traducción"
        ]
      }
    ]
  },
  {
    "id": "bulk-buying-coop",
    "name": "Cooperativa de compra de alimentos al mayoreo",
    "purpose": "Juntar pedidos para comprar comida y básicos al mayoreo a precios más bajos.",
    "whoItServes": "Hogares apretados por los precios del súper, familias numerosas y vecindarios sin acceso fácil a comida.",
    "whatYoullNeed": "Un grupo comprometido de hogares, una fuente mayorista, un espacio para recibir y clasificar, y alguien que gestione los pedidos.",
    "setupHours": 20,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Reúne a tus hogares antes de llamar a proveedor alguno, y ten primero la conversación incómoda sobre el dinero: cuánto puede comprometer cada quien, cómo se paga antes de hacer el pedido y qué significa saltarse un ciclo. Una llamada con un club de compras que ya funcione — la mayoría comparte con gusto su hoja de cálculo y sus cicatrices — te ahorrará una temporada de prueba y error.",
    "commonPitfalls": "Las cooperativas de compra mueren por fricciones de dinero y por agotamiento de quien coordina: alguien pone el dinero por adelantado y lo resiente, un pedido queda sin pagar, o una sola persona carga cada ciclo en silencio hasta que renuncia y todo se detiene. Cobren antes de pedir, sin excepciones, y roten la coordinación desde el segundo ciclo, no algún día.",
    "pairsWith": [
      "community-market",
      "food-preservation"
    ],
    "tasks": [
      {
        "name": "Junta a tu grupo de compra",
        "description": "Reúne suficientes hogares para llegar al mínimo del proveedor (suelen ser entre 8 y 15). Acuerden un ciclo de compra (semanal, quincenal, mensual).",
        "hours": 4,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Encuentra a un proveedor",
        "description": "Contacta mayoristas de alimentos, cooperativas de productoras y productores, proveedores de restaurantes o clubes de compra. Compara mínimos de pedido, opciones de entrega y precios. Confirma qué básicos manejan.",
        "hours": 4,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Arma el sistema de pedidos",
        "description": "Usen una hoja de cálculo o un formulario donde cada hogar anote sus cantidades antes de la fecha de cierre. Designa a una persona que sume y haga el pedido.",
        "hours": 3,
        "skills": [
          "captura de datos",
          "organización"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Maneja el dinero con transparencia",
        "description": "Cobren por adelantado (antes de hacer el pedido para no andar adelantando efectivo). Lleven cada peso en un libro compartido. Sumen un pequeño colchón opcional para mermas, no para ganancia.",
        "hours": 2,
        "skills": [
          "contabilidad"
        ]
      },
      {
        "name": "Organiza entrega y espacio de clasificación",
        "description": "Elijan un lugar para recibir el pedido a granel — una cochera, un salón, una entrada. Programen suficientes manos para el día de descarga.",
        "hours": 3,
        "skills": [
          "organización"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Reparte los pedidos con justicia",
        "description": "Pongan estaciones de clasificación con básculas para granos y verduras a granel. Imprime la lista de cada hogar de antemano. Revisen dos veces antes de la entrega.",
        "hours": 3,
        "skills": [
          "organización"
        ],
        "follows": [
          2,
          4
        ],
        "recurringCadence": "cycle"
      },
      {
        "name": "Roten el trabajo",
        "description": "La coordinación, la clasificación y la recogida deben rotar para que ninguna persona cargue con todo. Revisen los precios y la confiabilidad del proveedor cada ciclo.",
        "hours": 1,
        "recurringCadence": "cycle"
      }
    ]
  },
  {
    "id": "repair-cafe",
    "name": "Café de reparaciones",
    "purpose": "Arreglar cosas rotas — ropa, electrónicos, bicicletas, muebles — sin costo, en lugar de tirarlas.",
    "whoItServes": "Cualquiera con algo roto y sin dinero o habilidad para arreglarlo; mantiene fuera del basurero cosas que todavía sirven.",
    "whatYoullNeed": "Personas voluntarias con buena mano, herramientas básicas, un espacio con mesas y electricidad, y una fecha recurrente.",
    "setupHours": 14,
    "defaultCategory": "skilled_labor",
    "suggestsWorkDays": true,
    "firstSteps": "Recluta a tus primeras dos o tres personas reparadoras antes que nada — la vecina que cose, el que arregla bicis — porque una fecha y un local no significan nada sin ellas. Después recorran juntos el espacio hablando de mesas, electricidad y luz, y si hay un café de reparación en un pueblo cercano, visita una sesión; el flujo de recepción es la parte que vale la pena copiar.",
    "commonPitfalls": "Los cafés de reparación se convierten sin querer en talleres gratuitos de encargo: la gente deja sus cosas y se va, las personas reparadoras se vuelven técnicas sin paga, y quien sabe de electrónica se quema primero. Sostén la regla de que cada quien acompaña su propia reparación, y avisa con claridad que algunas cosas no tienen arreglo — una decepción manejada desde el inicio es más fácil que un reclamo después.",
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
        "name": "Convoca a quienes reparan, por especialidad",
        "description": "Busca a personas buenas para coser, electrónica pequeña, bicis, electrodomésticos y carpintería. Solo necesitas una o dos por categoría para empezar.",
        "hours": 4,
        "skills": [
          "reparación",
          "electrónica",
          "costura"
        ]
      },
      {
        "name": "Arma estaciones de reparación",
        "description": "Cada estación necesita una mesa, las herramientas adecuadas, buena luz y electricidad. Agrupa reparaciones parecidas. Identifica las estaciones con claridad.",
        "hours": 3,
        "recurringCadence": "session",
        "skills": [
          "organización"
        ]
      },
      {
        "name": "Pon una fecha recurrente",
        "description": "Una vez al mes suele funcionar bien. Elige una sede estable — biblioteca, makerspace, salón comunitario — para que la gente sepa a dónde llevar sus cosas.",
        "hours": 1
      },
      {
        "name": "Diseña el flujo de recepción",
        "description": "Una persona recibe a cada visitante y su objeto, y los canaliza con quien repara. Aclara desde el inicio: las personas se quedan y ayudan con su propia reparación cuando pueden; es un espacio para aprender, no un buzón de objetos.",
        "hours": 2,
        "skills": [
          "redacción"
        ]
      },
      {
        "name": "Gestiona seguridad y expectativas",
        "description": "Avisa que algunos objetos no se podrán salvar y que las reparaciones se intentan, no se garantizan. Tengan prácticas seguras para electricidad y baterías. Mantengan un botiquín a la mano.",
        "hours": 2
      },
      {
        "name": "Mantén surtidas piezas y consumibles comunes",
        "description": "Ten a la mano hilo, fusibles, pegamento, sujetadores, cámaras y parches. Anota qué se usa para reabastecer.",
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
    "name": "Apoyo de transporte y aventones",
    "purpose": "Llevar a vecinas y vecinos a citas médicas, al súper y a trámites esenciales cuando el transporte y el dinero son obstáculos.",
    "whoItServes": "Personas sin auto, vecinas y vecinos con discapacidad, personas mayores y cualquiera atrapada en un hueco de transporte.",
    "whatYoullNeed": "Personas voluntarias que manejen, un método para pedir y despachar viajes, y reglas claras de seguridad y seguros. Manejar llevando a vecinas y vecinos es una responsabilidad seria — confirmen la licencia y el seguro de cada persona que maneje, revisen a quienes llevarán a personas vulnerables y nunca usen un aventón voluntario en lugar de una ambulancia en una emergencia médica.",
    "setupHours": 18,
    "defaultCategory": "transport",
    "firstSteps": "Dos rondas de conversaciones van antes del primer viaje: siéntate con cada persona que quiera manejar para confirmar licencia y seguro y hablar con honestidad de la revisión de antecedentes, y habla con quienes necesitan los viajes — y con los centros de personas mayores y las clínicas que las conocen — sobre destinos, horarios y necesidades de movilidad reales. La conversación de revisión es más fácil como norma fundadora que como regla impuesta después.",
    "commonPitfalls": "Las redes de aventones fallan en el despacho, no al volante: las solicitudes caen en el teléfono de una sola persona hasta agotarla, y las mismas dos personas confiables reciben cada pedido mientras a otras no se les vuelve a llamar después de un solo no. Roten la coordinación, repartan las solicitudes a propósito y nunca dejen la pregunta del seguro para después del primer golpe.",
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
        "name": "Convoca y revisa a quienes manejan",
        "description": "Confirma que cada persona tenga licencia vigente, seguro y un vehículo seguro. Para viajes con personas vulnerables, haz revisiones de referencias o de antecedentes según las normas de tu zona.",
        "hours": 5,
        "skills": [
          "conducir"
        ]
      },
      {
        "name": "Resuelve seguros y responsabilidad",
        "description": "Revisa qué cubre el seguro personal de cada persona en un trayecto voluntario. Considera un consentimiento sencillo y consulta a una clínica de asistencia legal local — esto protege a todas las partes.",
        "hours": 4,
        "skills": [
          "trámites"
        ]
      },
      {
        "name": "Arma un sistema de solicitudes",
        "description": "Elige un solo canal para pedir viajes (línea telefónica, formulario, chat de grupo) con un tiempo de anticipación (por ejemplo, 48 horas). Registra hora de recogida, ubicaciones, necesidades de movilidad y datos de contacto.",
        "hours": 2,
        "skills": [
          "organización",
          "tecnología"
        ]
      },
      {
        "name": "Define una rutina de despacho",
        "description": "Ten a una persona coordinadora (que rote) que empareje solicitudes con personas que manejen y confirme con ambas partes el día anterior. Mantén una lista de respaldo para cancelaciones.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "organización"
        ],
        "follows": [
          0,
          2
        ]
      },
      {
        "name": "Define qué se cubre",
        "description": "Decidan qué viajes entran (médicos, súper, trámites esenciales) y su zona de servicio. Sean claras y claros sobre tiempos de espera y si quienes manejan ayudan con las bolsas.",
        "hours": 1,
        "skills": [
          "facilitación"
        ]
      },
      {
        "name": "Maneja los gastos",
        "description": "Decidan cómo se cubre la gasolina — un pequeño fondo común, aportes opcionales de quien viaja o nada. Que sea transparente y que nunca se vuelva una barrera para quien necesita el viaje.",
        "hours": 2,
        "follows": [
          4
        ]
      },
      {
        "name": "Mantén seguras a quienes viajan y a quienes manejan",
        "description": "Establezcan normas: quien maneja no entra a casas sin acompañamiento, no se maneja dinero más allá de los gastos acordados, y se hace un seguimiento después de viajes con personas vulnerables. Registren cada viaje.",
        "hours": 2,
        "follows": [
          0
        ]
      }
    ]
  },
  {
    "id": "tenant-union",
    "name": "Sindicato de inquilinas e inquilinos y red de defensa contra desalojos",
    "purpose": "Organizar a quienes rentan para defenderse de desalojos, condiciones inseguras y aumentos injustos de renta mediante la acción colectiva.",
    "whoItServes": "Inquilinas e inquilinos, especialmente en edificios con caseros negligentes o ausentes, y cualquiera que enfrente un desalojo.",
    "whatYoullNeed": "Un grupo organizador base, información local precisa sobre derechos de inquilinas e inquilinos, un vínculo con asistencia legal y un sistema de contacto rápido. Este proyecto apoya a inquilinas e inquilinos y comparte información legal pública; no sustituye la asesoría legal. Siempre canaliza los casos individuales a asistencia legal calificada antes de las fechas límite.",
    "setupHours": 30,
    "defaultCategory": "housing",
    "firstSteps": "Habla con las inquilinas e inquilinos afectados antes de cualquier contacto con el casero, siempre — toca puertas, escucha lo que la gente teme y quiere de verdad, y deja que quienes viven en cada edificio marquen el ritmo, porque son ellas quienes cargan el riesgo de represalias, no quienes organizan. En paralelo, preséntate pronto con la clínica de asistencia legal local; vas a querer esa relación antes de que llegue el primer aviso de desalojo, no después.",
    "commonPitfalls": "La forma en que un sindicato de inquilinos lastima a la gente es moviéndose más rápido que las propias inquilinas: una confrontación lanzada antes de que un edificio esté listo expone a las vecinas más vulnerables a represalias que no eligieron. El fracaso más silencioso es deslizarse de compartir información legal a dar asesoría legal — canaliza cada caso individual a asistencia legal calificada antes de las fechas límite, todas las veces.",
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
        "name": "Convoca un comité organizador base",
        "description": "Encuentra de 3 a 6 inquilinas e inquilinos comprometidos para anclar el trabajo. Busca personas respetadas en sus edificios. Acuerden roles, un ritmo de reuniones y metas compartidas.",
        "hours": 5,
        "skills": [
          "organización"
        ]
      },
      {
        "name": "Mapea edificios y problemas de inquilinas e inquilinos",
        "description": "Toca puertas o aplica encuestas para saber qué edificios tienen problemas y cuáles son (reparaciones ignoradas, cargos ilegales, acoso). Sigue los patrones y detecta a las personas líderes naturales en cada edificio.",
        "hours": 8,
        "skills": [
          "difusión",
          "entrevistas"
        ]
      },
      {
        "name": "Reúne información local precisa sobre derechos",
        "description": "Compila las leyes reales de tu zona sobre plazos de aviso de desalojo, reparaciones, depósitos y reglas de renta. Asóciate con una clínica de asistencia legal para verificarlas. Esto es información compartida, no asesoría legal — déjenlo claro con las personas integrantes.",
        "hours": 4,
        "skills": [
          "trámites",
          "redacción"
        ]
      },
      {
        "name": "Arma un sistema de contacto de respuesta rápida",
        "description": "Monta un árbol telefónico o un chat de grupo para que quien reciba un aviso de desalojo o un cierre de cerradura pueda llegar al sindicato rápido. Decidan quién responde y en cuánto tiempo.",
        "hours": 3,
        "skills": [
          "organización",
          "soporte técnico"
        ]
      },
      {
        "name": "Organiza un taller de \"conoce tus derechos\"",
        "description": "Realicen una sesión (idealmente con una persona aliada de asistencia legal) que recorra los derechos y qué hacer si reciben papeles. Entreguen guías impresas para llevar a casa en los idiomas que correspondan.",
        "hours": 4,
        "recurringCadence": "event",
        "skills": [
          "enseñanza",
          "facilitación"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Define un protocolo de respuesta ante desalojos",
        "description": "Escriban un paso a paso sencillo para cuando alguien enfrente un desalojo: documentar todo, contactar a asistencia legal antes de la fecha límite, organizar apoyo vecinal y nunca ignorar fechas de corte.",
        "hours": 3,
        "skills": [
          "redacción"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Conéctate con asistencia legal y apoyo continuo",
        "description": "Construye una relación de referencia con abogadas y abogados de inquilinas e inquilinos, asistencia legal y asesoras y asesores de vivienda para que el sindicato pueda derivar los casos que necesiten ayuda profesional. Mantén los contactos al día.",
        "hours": 3,
        "skills": [
          "difusión"
        ]
      }
    ]
  },
  {
    "id": "childcare-collective",
    "name": "Colectiva de cuidado infantil y niñeras compartidas",
    "purpose": "Compartir cuidado infantil de confianza entre familias para que madres, padres y personas cuidadoras puedan trabajar, descansar o atender emergencias sin pagar por ello.",
    "whoItServes": "Madres, padres y personas cuidadoras, especialmente quienes crían en solitario, trabajan por turnos o tienen ingresos bajos.",
    "whatYoullNeed": "Un grupo de familias revisadas, un espacio seguro (o casas que rotan), un sistema de calendario y reglas claras de seguridad. Cuidar a las hijas y los hijos de otras personas es una responsabilidad seria — mantén reglas firmes de supervisión, revisa a quienes cuidan y respeta las normas locales sobre cuidado infantil informal.",
    "setupHours": 28,
    "defaultCategory": "childcare",
    "suggestsWorkDays": true,
    "firstSteps": "Este proyecto se construye en las salas de las casas antes que en ningún otro lado: reúne a las familias fundadoras y hablen de lo específico e incómodo — revisión de antecedentes, supervisión, estilos de disciplina, qué pasa cuando una criatura se lastima — antes de que alguien agende una sola hora de cuidado. Revisa en ese mismo arranque las normas locales sobre cuidado infantil informal, para que el modelo que acuerden sea uno que de verdad puedan sostener.",
    "commonPitfalls": "Dos cosas rompen en silencio a los colectivos de cuidado: el desequilibrio de créditos, donde las mismas familias siempre reciben en casa hasta resentirlo, y las reglas de seguridad que se aflojan conforme crece la confianza — la excepción de solo por esta vez a la regla de nunca a solas es exactamente como se destruye la confianza. Lleven el balance a la vista y tomen las reglas de seguridad más en serio justamente con las familias que mejor conocen.",
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
        "name": "Reúne a las familias fundadoras y acuerden un modelo",
        "description": "Convoca familias que se conozcan o que puedan construir confianza entre sí. Decidan el modelo: una cooperativa rotativa de niñeras donde madres y padres ganan y gastan créditos de cuidado, o un cuidado grupal con horario.",
        "hours": 4,
        "skills": [
          "difusión",
          "facilitación"
        ]
      },
      {
        "name": "Definan estándares de seguridad y revisión",
        "description": "Acuerden cómo revisar a cualquier persona que cuide niñas y niños: referencias, verificaciones de antecedentes cuando corresponda y una regla firme de que ninguna persona adulta queda sola con la hija o el hijo de otra familia sin que nadie sepa. Establezcan proporciones adulto-niñe.",
        "hours": 6,
        "skills": [
          "cuidado infantil"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Encuentra un espacio y hazlo seguro para la infancia",
        "description": "Elijan un sitio o establezcan estándares para las casas anfitrionas. Revisen riesgos, cubran enchufes, fijen muebles pesados, guarden bajo llave medicinas y químicos, y confirmen un área exterior segura si se usa.",
        "hours": 4,
        "skills": [
          "cuidado infantil",
          "reparaciones del hogar"
        ]
      },
      {
        "name": "Creen un sistema de calendario y créditos",
        "description": "Usen un calendario compartido o una app de cooperativa. En un modelo de créditos, una hora de cuidado da una hora a deber. Lleven cuenta de quién acoge y cuándo para que la carga sea justa.",
        "hours": 3,
        "skills": [
          "organización",
          "captura de datos"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Establezcan políticas de salud, alergias y emergencias",
        "description": "Reúnan información de alergias, medicamentos, contactos de emergencia y autorizaciones de recogida para cada niña o niño. Escriban una política clara para niñas y niños enfermos y qué hacer ante una emergencia médica.",
        "hours": 3,
        "skills": [
          "trámites",
          "redacción"
        ]
      },
      {
        "name": "Capaciten a quienes cuidan en lo básico",
        "description": "Cubran supervisión, sueño seguro para bebés, respuesta ante alergias y emergencias, y las reglas de seguridad. Animen a tener al menos una persona adulta certificada en primeros auxilios pediátricos y RCP por sesión.",
        "hours": 5,
        "skills": [
          "enseñanza",
          "primeros auxilios"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Hagan una sesión piloto y recojan comentarios",
        "description": "Hagan un piloto corto con unas pocas familias y luego una conversación de cierre. Arreglen lo que no funcionó antes de crecer. Revisen seguido para que la confianza y la seguridad se mantengan firmes.",
        "hours": 3,
        "skills": [
          "cuidado infantil"
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
    "name": "Programa de compostaje comunitario",
    "purpose": "Recolectar restos de comida para desviarlos del basurero y producir composta gratuita para huertos locales.",
    "whoItServes": "Hogares sin forma de hacer composta, huertos comunitarios y el ambiente local.",
    "whatYoullNeed": "Un sitio de compostaje, contenedores de recolección, equipo básico y una pequeña rotación de mantenimiento.",
    "setupHours": 22,
    "defaultCategory": "infrastructure",
    "suggestsWorkDays": true,
    "firstSteps": "Habla con el sitio anfitrión y con las vecinas y vecinos que viven a distancia de olfato antes de que llegue el primer contenedor — el miedo al olor y a las ratas mata los sitios de compostaje, y una conversación honesta a tiempo lo desactiva mejor que cualquier folleto. Después encuentra el destino de tu composta (un huerto comunitario que la quiera) y al menos una persona que de verdad haya mantenido viva una pila caliente; su criterio va a definir qué método elegir.",
    "commonPitfalls": "Los proyectos de composta mueren cuando nadie es responsable de voltear la pila: se estanca o empieza a oler, una vecina se queja y el sitio anfitrión retira el permiso — esa cadena avanza más rápido de lo que crees. Ajusta la cantidad de restos que recolectan a lo que su rotación puede procesar de verdad, y trata una tanda contaminada como un problema de señalización por arreglar, no como una persona voluntaria a quien culpar.",
    "pairsWith": [
      "community-garden",
      "community-meal"
    ],
    "tasks": [
      {
        "name": "Encuentra un sitio de compostaje",
        "description": "Asegura un lugar con espacio y algo de sol — una esquina de un huerto comunitario, un lote baldío o un patio dispuesto. Confirma el permiso y revisa las reglas locales sobre compostaje.",
        "hours": 4,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Elige un método de compostaje",
        "description": "Escoge lo que sea adecuado a tu escala: un sistema caliente de tres compartimentos, tambores o composta con lombrices. Que el método coincida con el material que esperas y con lo que puedas voltear.",
        "hours": 3,
        "skills": [
          "compostaje"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Consigue contenedores y equipo",
        "description": "Construye o compra contenedores de recolección y la estructura de compostaje. Junta un bieldo, un termómetro y material café (hojas, cartón) para equilibrar los restos de comida.",
        "hours": 4,
        "skills": [
          "carpintería",
          "conducir"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Arma un sistema de recolección",
        "description": "Decidan cómo llegan los restos: un contenedor de entrega con horarios o una ruta voluntaria de recogida. Den a quienes participen pequeños botes para la cocina y un calendario claro de entrega.",
        "hours": 4,
        "skills": [
          "organización"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Dejen claro qué se acepta",
        "description": "Pongan una lista sencilla de sí y no (sí: fruta, verdura, café, cáscaras de huevo; no: carne, lácteos, aceites, excremento de mascotas). Una señalización clara evita la contaminación que arruina una tanda.",
        "hours": 2,
        "skills": [
          "redacción",
          "traducción"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Convoca y capacita una rotación de mantenimiento",
        "description": "La composta necesita voltearse, revisarse la humedad y equilibrar verdes y cafés. Hagan un calendario compartido y enseñen lo básico a quienes participen para que las pilas no huelan ni se estanquen.",
        "hours": 3,
        "skills": [
          "compostaje",
          "enseñanza"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Distribuye la composta terminada",
        "description": "Una vez lista la composta, compártanla gratis con quienes aportaron y con huertos comunitarios. Anuncien los días de recogida y que lleven bolsas o cubetas.",
        "hours": 2,
        "skills": [
          "conducir"
        ],
        "recurringCadence": "cycle"
      }
    ]
  },
  {
    "id": "free-little-library",
    "name": "Pequeña biblioteca libre e intercambio de libros",
    "purpose": "Ofrecer libros gratis las 24 horas para fomentar la lectura y el compartir, sin credencial ni cuotas.",
    "whoItServes": "Niñas, niños, familias y personas lectoras de todas las edades, sobre todo en barrios con poco acceso a libros.",
    "whatYoullNeed": "Una caja de libros resistente al clima, una colección inicial, un sitio anfitrión y un mantenimiento ligero.",
    "setupHours": 7.5,
    "defaultCategory": "education",
    "firstSteps": "Empieza con dos conversaciones cortas: una con la persona cuya pared o jardín va a recibir la caja, sobre dónde ponerla y qué pasa si se deteriora, y otra con las familias y la escuela cercanas sobre qué libros se llevarían de verdad a casa. Consigue a tu persona guardiana — quien la revisará cada semana — antes de instalar la caja, no después.",
    "commonPitfalls": "Las bibliotecas libres no mueren por falta de libros — mueren por los equivocados: alguien deja una caja de manuales viejos, los buenos títulos quedan enterrados, entra la lluvia y la gente deja de asomarse sin decir nada. Una visita semanal de cinco minutos de la persona guardiana lo previene casi todo; la caja necesita a una persona más de lo que necesita donaciones.",
    "pairsWith": [
      "seed-library",
      "books-to-prisoners"
    ],
    "tasks": [
      {
        "name": "Construye o consigue una caja de libros resistente al clima",
        "description": "Hagan o compren una caja firme y a prueba de agua, sobre un poste o en una pared. Sirve un mueble reciclado o una caja de periódicos. Pónganle una puerta clara y un techo inclinado para que los libros no se mojen.",
        "hours": 4,
        "skills": [
          "carpintería"
        ]
      },
      {
        "name": "Elige y prepara un lugar",
        "description": "Escojan un sitio con tránsito de gente y permiso — el patio delantero de alguien, un centro comunitario o el borde de un parque. Anclen bien la caja y confirmen que se permite.",
        "hours": 1,
        "skills": [
          "difusión"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Surte la colección inicial",
        "description": "Reúnan libros donados con una pequeña convocatoria. Busquen variedad: libros infantiles, ficción popular y no ficción práctica. Empiecen medio llena para que haya espacio de sumar.",
        "hours": 1.5,
        "skills": [
          "difusión"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Pongan un letrero y normas sencillas",
        "description": "Coloquen \"Toma un libro, deja un libro — todo gratis\". Mantengan el tono cálido y con pocas reglas. Añadan una nota que invite a todas las edades e idiomas.",
        "hours": 0.5,
        "skills": [
          "redacción"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Convoca a una persona cuidadora",
        "description": "Pídanle a alguien cercano que revise la caja cada semana: la ordene, retire lo dañado o inapropiado y reacomode el acervo. Cinco minutos a la semana la mantienen sana.",
        "hours": 0.5,
        "skills": [
          "difusión"
        ]
      }
    ]
  },
  {
    "id": "community-first-aid-training",
    "name": "Capacitación comunitaria en primeros auxilios y respuesta ante sobredosis",
    "purpose": "Capacitar a vecinas y vecinos en primeros auxilios, RCP y reversión de sobredosis para que la comunidad pueda responder en los minutos antes de que llegue ayuda profesional.",
    "whoItServes": "Todas las personas; con más impacto donde los servicios de emergencia tardan o las tasas de sobredosis son altas.",
    "whatYoullNeed": "Personas instructoras certificadas, insumos, un espacio y un calendario recurrente. Toda capacitación médica debe darla personal certificado; este proyecto organiza y aloja esa capacitación, no la sustituye.",
    "setupHours": 17,
    "defaultCategory": "education",
    "firstSteps": "Tu primera conversación es con quienes darían la capacitación — la Cruz Roja, la secretaría de salud o un grupo de reducción de daños. Pregúntales qué necesitan de un espacio anfitrión y qué fechas pueden ofrecer, y luego platica con las personas que más probablemente presencien una emergencia — familiares de personas que usan drogas, personal de negocios cercanos — para que las primeras sesiones se armen alrededor de ellas.",
    "commonPitfalls": "Este proyecto se apaga cuando se queda en un solo evento grande que nunca se repite: las habilidades se oxidan y la naloxona caduca sin que nadie lo note. Y resistan la tentación de enseñar el contenido médico por su cuenta — su papel es alojar a instructoras e instructores certificados, no sustituirlos.",
    "pairsWith": [
      "harm-reduction-supplies",
      "emergency-preparedness"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Asóciate con personas instructoras certificadas",
        "description": "Conéctate con personal calificado — la Cruz Roja, la secretaría de salud local o una organización de reducción de daños. Ellas y ellos dan la capacitación médica real; tu papel es organizarla y alojarla.",
        "hours": 4,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Consigue insumos",
        "description": "Obtén botiquines de primeros auxilios, maniquíes para practicar RCP (a menudo prestados por quienes capacitan) y naloxona. Muchos programas de salud pública distribuyen naloxona gratis — pregunta en tu secretaría de salud o a grupos de reducción de daños.",
        "hours": 3,
        "skills": [
          "difusión",
          "conducir"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Encuentra espacio y agenda las sesiones",
        "description": "Reserven un salón donde quepa práctica con las manos — un centro comunitario, biblioteca o clínica. Pongan fechas recurrentes para que la gente pueda planear alrededor del trabajo.",
        "hours": 2
      },
      {
        "name": "Convoca a quienes participen",
        "description": "Difundan ampliamente y prioricen a personas que probablemente presencien emergencias. Que la inscripción sea fácil y gratuita, y ofrezcan horarios variados para quien trabaja por turnos.",
        "hours": 2,
        "skills": [
          "difusión"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Realiza las sesiones de capacitación",
        "description": "Alojen las sesiones que dan las personas instructoras, encárguense del montaje y el registro y asegúrense de que todas las personas hagan práctica con las manos. Entreguen tarjetas de referencia para llevar a casa.",
        "hours": 4,
        "skills": [
          "organización"
        ],
        "follows": [
          0,
          1,
          3
        ],
        "recurringCadence": "session"
      },
      {
        "name": "Entrega botiquines y refresca conocimientos",
        "description": "Que las personas capacitadas se lleven un botiquín de primeros auxilios y naloxona donde esté disponible. Programen repasos periódicos para que las habilidades no se enmohezcan.",
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
    "name": "Banco de tiempo",
    "purpose": "Permitir que las personas integrantes intercambien servicios por tiempo, donde una hora dada equivale a una hora ganada, valorando por igual lo que aporta cada quien.",
    "whoItServes": "Cualquier persona, sobre todo quienes tienen tiempo y habilidades pero poco dinero.",
    "whatYoullNeed": "Una lista de personas integrantes, un sistema de registro, una persona coordinadora y reglas acordadas.",
    "setupHours": 27,
    "defaultCategory": "organizing",
    "firstSteps": "Empieza con conversaciones, no con software: siéntate con diez o quince vecinas y vecinos y pregúntale a cada quien qué ofrecería y qué pediría. Si de esas pláticas no sale variedad — aventones, tutoría, reparaciones, cocina — sigue convocando antes de montar el sistema.",
    "commonPitfalls": "Los bancos de tiempo rara vez mueren por escándalo; mueren por silencio — la gente se inscribe, nadie hace la primera solicitud y todo se enfría. Que una persona coordinadora empareje intercambios activamente los primeros meses, y sostengan la línea de una hora = una hora: en cuanto se debate si la hora de plomería vale más que la de cuidado infantil, deja de ser un banco de tiempo.",
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
        "name": "Convoca a integrantes fundadoras e inventaríen habilidades",
        "description": "Reúne un grupo inicial y pregúntale a cada quien qué puede ofrecer (aventones, tutoría, reparaciones, cocina, jardinería) y qué necesita. La variedad de ofrecimientos es lo que hace que funcione.",
        "hours": 5,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Elige un sistema de registro",
        "description": "Escojan cómo registrar horas: software dedicado a bancos de tiempo, una hoja de cálculo compartida o un libro sencillo. Debe registrar quién dio y quién recibió horas.",
        "hours": 4,
        "skills": [
          "soporte técnico",
          "captura de datos"
        ]
      },
      {
        "name": "Definan las reglas",
        "description": "Acuerden el principio central (una hora = un crédito, sin importar la tarea), cómo se piden y se confirman los intercambios y qué pasa cuando el saldo de alguien baja mucho.",
        "hours": 4,
        "skills": [
          "facilitación",
          "redacción"
        ]
      },
      {
        "name": "Den la bienvenida a las personas integrantes",
        "description": "Hagan una orientación corta para que la gente entienda la filosofía y el sistema. Den a cada persona algunos créditos iniciales para que los intercambios puedan empezar de inmediato.",
        "hours": 4,
        "skills": [
          "enseñanza"
        ],
        "follows": [
          1,
          2
        ]
      },
      {
        "name": "Lanza un directorio de servicios",
        "description": "Publiquen una lista buscable de quién ofrece qué. Manténganla al día para que las personas integrantes encuentren ayuda sin preguntarle todo el tiempo a quien coordina.",
        "hours": 4,
        "skills": [
          "captura de datos"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Coordina y conecta intercambios",
        "description": "Que una persona coordinadora ayude a emparejar necesidades con ofrecimientos, sobre todo al inicio, y dé un empujón a quienes están en silencio. Con el tiempo, las personas integrantes se conectan directo.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "organización"
        ],
        "follows": [
          4
        ]
      },
      {
        "name": "Construye prácticas de confianza y seguridad",
        "description": "Pongan normas para intercambios que ocurran en casas o con personas integrantes vulnerables (referencias, no encontrarse a solas si incomoda). Añadan una forma sencilla de levantar alertas.",
        "hours": 4,
        "skills": [
          "facilitación"
        ]
      }
    ]
  },
  {
    "id": "solidarity-fund",
    "name": "Fondo solidario (apoyo en efectivo de ayuda mutua)",
    "purpose": "Juntar dinero para dar efectivo directo, sin condiciones, a vecinas y vecinos que enfrentan una crisis.",
    "whoItServes": "Personas golpeadas por emergencias — un faltante de renta, una cuenta médica, un corte de servicios.",
    "whatYoullNeed": "Un sistema transparente de manejo de dinero, un pequeño equipo responsable, un plan de recaudación y criterios claros. Manejar dinero en común conlleva responsabilidad real — usen doble firma, mantengan registros limpios, protejan la privacidad de quien recibe y busquen asesoría sobre el tratamiento legal y fiscal del fondo.",
    "setupHours": 23,
    "defaultCategory": "mutual_aid_drive",
    "firstSteps": "Antes de juntar un solo peso, siéntate con las pocas personas a quienes confiarías dinero en común y hablen con honestidad: cómo funcionará la doble firma, qué se publica y qué pasa cuando las solicitudes superen el fondo. Luego busca una asesoría contable o de organizaciones sin fines de lucro para entender el lado legal y fiscal antes de abrir la cuenta.",
    "commonPitfalls": "El dinero rompe la confianza más rápido que cualquier otra cosa — un pago sin explicar o un registro descuidado puede acabar con el fondo aunque nadie haya hecho nada malo. Y casi siempre habrá más solicitudes que dinero; si los criterios no se acordaron de antemano, decir que no caso por caso quema al equipo y siembra resentimiento.",
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
        "name": "Forma un pequeño equipo responsable",
        "description": "Convoca a unas pocas personas de confianza para administrar el fondo. Definan roles con claridad y comprométanse a la transparencia desde el primer día — aquí la confianza lo es todo.",
        "hours": 3,
        "skills": [
          "organización"
        ]
      },
      {
        "name": "Arma un manejo transparente del dinero",
        "description": "Abran una cuenta dedicada o usen un patrocinio fiscal. Pidan que dos personas aprueben los pagos, mantengan un libro contable claro y revisen si la estructura tiene implicaciones fiscales o legales — consulten un recurso local de organizaciones sin fines de lucro o a una persona contadora.",
        "hours": 5,
        "skills": [
          "contabilidad",
          "trámites"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Definan criterios para solicitar y entregar apoyo",
        "description": "Decidan quién puede solicitar, los montos típicos, cada cuánto puede pedir alguien y si es por orden de llegada o ponderado por necesidad. Mantengan bajas las barreras y eviten exigir comprobantes de necesidad cuando sea posible.",
        "hours": 4,
        "skills": [
          "facilitación"
        ]
      },
      {
        "name": "Crea un formulario de solicitud sencillo y de pocas barreras",
        "description": "Hagan un formulario corto y privado que pida solo lo necesario. Ofrezcan varias formas de aplicar (en línea, por teléfono, en persona) y protejan la privacidad de quienes solicitan.",
        "hours": 2,
        "skills": [
          "redacción"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Pon en marcha la recaudación",
        "description": "Combinen pequeñas donaciones recurrentes de personas integrantes con campañas ocasionales. Sean claras y claros con quienes donan: los fondos van directo a vecinas y vecinos en necesidad.",
        "hours": 4,
        "skills": [
          "difusión"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Arma un proceso de decisión y de pago",
        "description": "Pongan un tiempo de respuesta, una revisión rápida del equipo y métodos veloces de pago. En una crisis, la velocidad importa. Documenten cada decisión de manera sencilla.",
        "hours": 3,
        "skills": [
          "organización"
        ],
        "follows": [
          1,
          2
        ]
      },
      {
        "name": "Rinde cuentas con transparencia",
        "description": "Compartan resúmenes regulares — dinero que entra, dinero que sale, número de vecinas y vecinos apoyados — sin exponer la identidad de quienes recibieron. La transparencia mantiene la donación.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "redacción",
          "contabilidad"
        ]
      }
    ]
  },
  {
    "id": "diaper-hygiene-bank",
    "name": "Banco de pañales y artículos de higiene",
    "purpose": "Distribuir gratis pañales, productos menstruales y artículos de higiene, que no se pueden comprar con la mayoría de los apoyos alimentarios.",
    "whoItServes": "Familias de ingresos bajos, bebés, personas que menstrúan y vecinas y vecinos sin techo.",
    "whatYoullNeed": "Almacenamiento, un flujo de insumos, puntos de distribución y personas voluntarias.",
    "setupHours": 10,
    "defaultCategory": "mutual_aid_drive",
    "suggestsWorkDays": true,
    "firstSteps": "Habla primero con quienes ya ven a las familias — la clínica pediátrica, la despensa de alimentos, la iglesia — y pregúntales qué tallas y productos realmente escasean y si aceptarían alojar la distribución. Esa sola conversación te ahorra meses de adivinar.",
    "commonPitfalls": "Lo que más daña es la irregularidad: una colecta grande, estantes llenos, y luego meses vacíos justo cuando las familias ya contaban contigo. Cuida también el inventario real — se acumulan pañales de recién nacido mientras faltan las tallas grandes — y nunca pidas pruebas de necesidad; la dignidad es parte del servicio.",
    "pairsWith": [
      "welcome-wagon",
      "laundry-shower-access"
    ],
    "tasks": [
      {
        "name": "Encuentra almacenamiento y un punto de distribución",
        "description": "Asegura un almacén seco y seguro y un lugar para entregar los artículos — un clóset en una clínica, iglesia o centro comunitario. El sitio de entrega debe sentirse privado y digno.",
        "hours": 2,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Establece el abastecimiento",
        "description": "Combina compras al mayoreo, campañas de donación y vínculos con redes de bancos de pañales o mayoristas. Lleva cuenta de qué fuentes son estables para no quedarte sin existencias.",
        "hours": 3,
        "skills": [
          "difusión",
          "conducir"
        ]
      },
      {
        "name": "Clasifica e inventaría por talla y tipo",
        "description": "Organiza pañales por talla, además de productos menstruales y artículos de higiene. Lleva un conteo corriente para saber qué pedir. Las tallas para bebés más grandes suelen escasear.",
        "hours": 1.5,
        "skills": [
          "organización",
          "captura de datos"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Define una política de distribución justa",
        "description": "Decidan cuánto recibe cada familia y cada cuánto, sin barreras de comprobación de necesidad. Que sea predecible para que la gente pueda contar con ello.",
        "hours": 1,
        "skills": [
          "facilitación"
        ]
      },
      {
        "name": "Agenda la distribución y consigue personal",
        "description": "Pongan días regulares de distribución, convoquen a personas voluntarias para entregar los insumos y mantengan el trato cálido y sin juicios.",
        "hours": 2.5,
        "skills": [
          "organización"
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
    "name": "Taller comunitario de bicicletas",
    "purpose": "Ofrecer espacio, herramientas y ayuda gratis para arreglar, armar y ganarse una bicicleta, haciendo el transporte accesible y económico.",
    "whoItServes": "Personas sin auto, juventud, quienes se trasladan al trabajo y cualquiera que necesite transporte económico.",
    "whatYoullNeed": "Un espacio, herramientas, bicicletas y refacciones donadas, y personas mecánicas voluntarias.",
    "setupHours": 20,
    "defaultCategory": "transport",
    "suggestsWorkDays": true,
    "firstSteps": "Antes de buscar local, habla con quienes usarían el taller y con las personas mecánicas que enseñarían — y si hay un taller comunitario de bicis en una ciudad cercana, visítalo y pregunta qué harían distinto. Con quien preste el espacio, aclara desde el inicio almacenamiento, acceso y seguros.",
    "commonPitfalls": "El taller muere cuando las personas voluntarias arreglan bicis en lugar de enseñar a arreglarlas: se vuelve un taller gratis, la fila crece y las mecánicas se queman. Cuidado también con ahogarse en bicis chatarra donadas — clasifiquen sin piedad — y que ninguna bici salga sin revisión de frenos y llantas.",
    "pairsWith": [
      "repair-cafe",
      "rides-transportation",
      "tool-lending-library"
    ],
    "tasks": [
      {
        "name": "Encuentra un espacio de taller",
        "description": "Asegura una cochera, un sótano, un contenedor o un espacio comunitario compartido con lugar para trabajar y guardar bicicletas. Confirma el acceso y cualquier necesidad de seguro.",
        "hours": 4,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Junta herramientas y un caballete",
        "description": "Reúne un kit básico de herramientas de bicicleta y al menos un caballete de reparación con donaciones o con un pequeño presupuesto. Organiza las herramientas para que sea fácil encontrarlas y devolverlas.",
        "hours": 5,
        "skills": [
          "conducir"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Recolecta bicicletas y refacciones donadas",
        "description": "Hagan convocatorias para bicicletas sin uso y refacciones aprovechables. Clasifíquenlas en \"reparables\", \"para refacciones\" y \"listas para rodar\". Una reserva de refacciones es lo que mantiene andando al taller.",
        "hours": 4,
        "skills": [
          "reparación",
          "conducir"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Convoca a personas mecánicas voluntarias",
        "description": "Encuentra a unas cuantas personas que sepan arreglar bicicletas y, sobre todo, enseñar a otras. La meta es ayudar a la gente a aprender a reparar la suya, no hacerlo por ella.",
        "hours": 3,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Establece horarios y un modelo de \"gánate una bici\"",
        "description": "Elijan horarios predecibles. Consideren un programa de \"gánate una bici\" donde alguien aprende habilidades de reparación a lo largo de varias sesiones y se va con la bicicleta que reparó.",
        "hours": 2,
        "skills": [
          "organización"
        ]
      },
      {
        "name": "Establece prácticas de seguridad",
        "description": "Exijan protección para los ojos, pongan reglas para el uso de herramientas y tengan un botiquín. Hagan siempre un chequeo de seguridad (frenos, llantas, dirección) antes de que cualquier bicicleta salga.",
        "hours": 2,
        "skills": [
          "redacción"
        ]
      }
    ]
  },
  {
    "id": "newcomer-translation-network",
    "name": "Red de apoyo a personas recién llegadas y de traducción",
    "purpose": "Ayudar a personas migrantes y refugiadas a moverse en un lugar nuevo — traducción, trámites, orientación y conexión comunitaria.",
    "whoItServes": "Personas migrantes y refugiadas recién llegadas, y vecinas y vecinos que no hablan el idioma local.",
    "whatYoullNeed": "Personas voluntarias bilingües, organizaciones aliadas, materiales de orientación y un sistema de solicitudes. Tengan especial cuidado con la privacidad: no recojan estatus migratorio, canalicen preguntas legales a abogadas y abogados de inmigración calificados, y dejen que las personas de la comunidad guíen qué apoyo realmente quieren.",
    "setupHours": 22,
    "defaultCategory": "other",
    "firstSteps": "Empieza hablando con las propias comunidades recién llegadas y con las organizaciones que ya las acompañan — que ellas digan qué apoyo quieren, en vez de diseñárselo desde fuera. Y antes de que llegue la primera solicitud, deja lista la canalización: abogadas y abogados de inmigración calificados a quienes derivar toda pregunta legal.",
    "commonPitfalls": "El riesgo más serio es que personas voluntarias con buena intención pasen de interpretar a dar consejos legales o médicos para los que no están calificadas — una mala orientación migratoria puede costarle carísimo a alguien. Y recojan el mínimo de datos: un registro descuidado sobre el estatus de una persona puede ponerla en peligro real.",
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
        "name": "Convoca a personas voluntarias bilingües y multilingües",
        "description": "Encuentra personas voluntarias que hablen los idiomas comunes en tu zona y puedan ayudar con traducción, formularios y acompañamiento. Que los idiomas coincidan con las necesidades locales reales.",
        "hours": 4,
        "skills": [
          "traducción",
          "difusión"
        ]
      },
      {
        "name": "Mapea servicios y aliadas y aliados locales",
        "description": "Arma un directorio de clínicas, escuelas, asistencia legal, clases de ESL, recursos alimentarios y organizaciones que sirven a personas migrantes. A menudo, las personas recién llegadas solo necesitan saber qué existe y cómo llegar.",
        "hours": 5,
        "skills": [
          "difusión",
          "captura de datos"
        ]
      },
      {
        "name": "Arma un sistema de solicitudes y emparejamientos",
        "description": "Crea una forma sencilla para que las personas recién llegadas pidan ayuda y se les empareje con alguien voluntario por idioma y necesidad. Ofrezcan opciones por teléfono y en persona, no solo en línea.",
        "hours": 3,
        "skills": [
          "organización",
          "soporte técnico"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Crea materiales de orientación",
        "description": "Junten guías en lenguaje sencillo, en los idiomas que correspondan, sobre transporte, escuelas, salud y derechos. Usen imágenes para que funcionen en distintos niveles de alfabetización.",
        "hours": 4,
        "skills": [
          "redacción",
          "traducción"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Ofrece acompañamiento a citas",
        "description": "Coordinen para que personas voluntarias acompañen a la gente a citas médicas, escolares o de servicios para interpretar y apoyar. Indiquen a quienes acompañan que interpreten con fidelidad, no que den consejos para los que no están calificadas.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "traducción"
        ],
        "follows": [
          0,
          2
        ]
      },
      {
        "name": "Establezcan prácticas de privacidad y seguridad",
        "description": "Recojan la información mínima necesaria y nunca pregunten ni registren estatus migratorio. Guarden los datos de forma segura y capaciten a las personas voluntarias para manejar situaciones sensibles con discreción.",
        "hours": 3,
        "skills": [
          "redacción"
        ]
      }
    ]
  },
  {
    "id": "community-meal",
    "name": "Comida comunitaria / Cocina del pueblo",
    "purpose": "Cocinar y compartir comidas comunitarias gratuitas de forma regular, sin preguntas.",
    "whoItServes": "Cualquier persona con hambre, aislada o con inseguridad alimentaria; también teje vínculos en el barrio.",
    "whatYoullNeed": "Una cocina, personas que cocinen, una cadena de ingredientes, un espacio para servir y un equipo voluntario. Servir comida al público conlleva responsabilidades reales de seguridad alimentaria — revisen las reglas locales sobre permisos y personas certificadas en manejo de alimentos, y sigan siempre prácticas seguras de almacenamiento y temperatura.",
    "setupHours": 22,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Tus dos primeras conversaciones son con quien prestaría la cocina — un salón de iglesia o centro comunitario — sobre los días que planeas, y con la autoridad sanitaria local sobre permisos y manejo de alimentos; eso define todo lo demás. Después pregunta a quienes vendrían a comer qué día y hora les sirve de verdad.",
    "commonPitfalls": "Un descuido de seguridad alimentaria puede lastimar a alguien y acabar con el proyecto — las reglas de temperatura y almacenamiento no se saltan ni una vez. La muerte lenta es que las mismas tres personas cocinen cada comida hasta quemarse, así que amplíen el equipo y roten quién dirige la cocina desde el inicio.",
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
        "name": "Encuentren una cocina y un espacio para servir",
        "description": "Consigan una cocina lo bastante grande para cocinar a escala — un salón parroquial, centro comunitario o cocina comercial — además de un espacio para servir. Confirmen disponibilidad en los días previstos.",
        "hours": 3,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Resuelvan seguridad alimentaria y permisos",
        "description": "Revisen las reglas locales para servir comida al público. Puede que necesiten un permiso, una persona certificada en manejo de alimentos presente, o una cocina con licencia. Aprendan almacenamiento seguro y manejo de temperaturas.",
        "hours": 4,
        "skills": [
          "seguridad alimentaria"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Construyan una cadena de suministro de alimentos",
        "description": "Combinen donaciones de tiendas y restaurantes, compras al por mayor y cualquier excedente de huertas o gleaning. Lleven registro de fuentes confiables para planear menús según lo que tendrán.",
        "hours": 3,
        "skills": [
          "difusión",
          "conducir"
        ]
      },
      {
        "name": "Planeen menús para escala, dieta y alergias",
        "description": "Diseñen comidas sencillas y nutritivas que se cocinen en volumen y rindan los ingredientes. Ofrezcan opciones vegetarianas y etiqueten con claridad los alérgenos comunes.",
        "hours": 2,
        "recurringCadence": "session",
        "skills": [
          "cocina"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Convoquen un equipo de cocina y servicio",
        "description": "Reúnan personas voluntarias para preparación, cocción, servicio y limpieza. Asignen una persona líder de cocina por comida y mantengan los roles claros para que el servicio fluya.",
        "hours": 3,
        "skills": [
          "cocina",
          "organización"
        ]
      },
      {
        "name": "Definan un horario y corran la voz",
        "description": "Elijan un día y hora regulares para que la gente pueda contar con ello. Difundan con volantes, en albergues y de boca en boca, con un tono cálido y abierto para todas las personas.",
        "hours": 2,
        "skills": [
          "diseño gráfico"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Sirvan la comida y limpien",
        "description": "Cocinen, sirvan con dignidad (servir en mesa se siente mejor que una fila, cuando sea posible) y dejen la cocina con los estándares requeridos. Empaquen las sobras de forma segura para redistribuirlas.",
        "hours": 5,
        "skills": [
          "cocina"
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
    "name": "Biblioteca de semillas e intercambio",
    "purpose": "Compartir semillas gratis para que la gente cultive alimentos, y preservar variedades locales y criollas.",
    "whoItServes": "Quienes cultivan en casa, quienes empiezan a sembrar y huertas comunitarias.",
    "whatYoullNeed": "Un sistema de almacenamiento y catálogo, semillas donadas, un lugar anfitrión y unas pocas personas cuidadoras.",
    "setupHours": 8,
    "defaultCategory": "food",
    "firstSteps": "Habla con la biblioteca o el centro comunitario sobre alojar el mueble, y con jardineras y jardineros con experiencia local sobre qué crece de verdad en tu región — el éxito de quienes empiezan depende de semillas adecuadas al clima. Un vivero o una huerta comunitaria cercana suele donar con gusto el arranque.",
    "commonPitfalls": "Una biblioteca de semillas muere en silencio: semilla vieja que no germina, gente que concluye que no sabe sembrar y no vuelve. Rota el inventario sin nostalgia, y no cuentes con que devuelvan semilla — casi nadie la guarda — así que planea el resurtido con donaciones, no con retornos.",
    "pairsWith": [
      "community-garden",
      "free-little-library"
    ],
    "tasks": [
      {
        "name": "Encuentren un anfitrión y sistema de almacenamiento",
        "description": "Aliáncense con una biblioteca, centro comunitario o huerta para alojar un pequeño mueble o cajonera. Guarden las semillas en lugar fresco, seco y oscuro, en sobres etiquetados.",
        "hours": 2,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Consigan semillas iniciales",
        "description": "Reúnan donaciones de hortelanas y hortelanos, excedentes de empresas de semillas y paquetes de fin de temporada. Prioricen variedades fáciles y adaptadas a la región para que quienes empiezan tengan éxito.",
        "hours": 2,
        "skills": [
          "difusión",
          "jardinería"
        ]
      },
      {
        "name": "Organicen y etiqueten la colección",
        "description": "Clasifiquen por tipo (hortaliza, hierba, flor) y dificultad. Etiqueten cada sobre con la planta, el año y notas básicas de cultivo. Marquen cuáles son fáciles para guardar semilla.",
        "hours": 2,
        "skills": [
          "jardinería",
          "captura de datos"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Establezcan normas de préstamo y de intercambio",
        "description": "Manténganlo sencillo: tomen semillas gratis, cultívenlas y, idealmente, guarden y devuelvan algunas al final de la temporada. Pongan una guía de una página sobre cómo funciona.",
        "hours": 1,
        "skills": [
          "redacción"
        ]
      },
      {
        "name": "Mantengan la viabilidad y rellenen el stock",
        "description": "Las semillas pierden viabilidad con el tiempo. Roten el stock viejo, hagan pruebas de germinación en lotes dudosos y rellenen las variedades populares.",
        "hours": 1,
        "skills": [
          "jardinería"
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
    "name": "Alfabetización digital y préstamo de dispositivos",
    "purpose": "Prestar dispositivos y enseñar habilidades digitales para tender un puente a quienes no tienen tecnología ni internet confiables.",
    "whoItServes": "Personas mayores, vecinas y vecinos de bajos ingresos, personas en búsqueda de empleo y cualquiera que quede fuera de los servicios en línea.",
    "whatYoullNeed": "Dispositivos donados, acceso a internet, personas voluntarias para tutorías y un espacio.",
    "setupHours": 27,
    "defaultCategory": "tech",
    "firstSteps": "Habla primero con las personas que quieres acompañar — en la biblioteca, el centro de personas mayores, la fila de la despensa — y pregúntales qué quieren lograr: telesalud, solicitudes de empleo, las fotos de la familia. Luego platica con la biblioteca sobre espacio y conectividad antes de juntar un solo dispositivo.",
    "commonPitfalls": "Prestar un dispositivo sin resolver el internet es prestar un pisapapeles — la conectividad es la mitad del proyecto. En las sesiones, el error clásico es que quien da la tutoría tome el ratón y hable en jerga; y nunca vuelvas a prestar un equipo sin borrarlo, porque filtrar los datos de alguien rompe toda la confianza construida.",
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
        "name": "Recolecten y reacondicionen dispositivos",
        "description": "Reúnan computadoras portátiles, tabletas y teléfonos donados. Borren cada uno de forma segura, actualícenlo y déjenlo listo para un uso sencillo. Prueben que todo funciona antes de prestarlo.",
        "hours": 8,
        "skills": [
          "soporte técnico",
          "conducir"
        ]
      },
      {
        "name": "Armen un sistema de préstamo",
        "description": "Creen un registro sencillo: quién pidió qué, en qué condición y para cuándo. Definan la duración del préstamo y una política de devolución flexible, basada en la confianza.",
        "hours": 3,
        "skills": [
          "captura de datos"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Gestionen el acceso a internet",
        "description": "Un dispositivo sirve poco sin conexión. Presten puntos de acceso móviles, aliáncense con la biblioteca, o orienten a la gente hacia programas de internet de bajo costo y WiFi público gratuito.",
        "hours": 3,
        "skills": [
          "soporte técnico",
          "difusión"
        ]
      },
      {
        "name": "Convoquen y capaciten a tutoras y tutores",
        "description": "Encuentren personas voluntarias pacientes y prepárenlas para enseñar sin tecnicismos. Insistan en ir al ritmo de quien aprende y nunca tomar el mouse.",
        "hours": 4,
        "skills": [
          "enseñanza"
        ]
      },
      {
        "name": "Diseñen un plan de estudios para principiantes",
        "description": "Armen lecciones cortas sobre lo esencial: correo, seguridad en línea, postulaciones de trabajo, telesalud, formularios oficiales y videollamadas. Entreguen guías impresas.",
        "hours": 4,
        "skills": [
          "enseñanza",
          "redacción"
        ]
      },
      {
        "name": "Programen clases y horarios de ayuda libre",
        "description": "Ofrezcan tanto clases estructuradas como horarios abiertos de \"ayuda tecnológica\". Varíen los horarios para quienes trabajan y mantengan grupos pequeños.",
        "hours": 3,
        "recurringCadence": "session",
        "skills": [
          "organización"
        ],
        "follows": [
          3,
          4
        ]
      },
      {
        "name": "Establezcan políticas de seguridad de datos y devolución",
        "description": "Borren cada dispositivo entre personas usuarias, enseñen hábitos seguros de contraseñas y privacidad y expliquen cómo se protegen los datos personales. Tengan un plan para pérdidas o daños.",
        "hours": 2,
        "skills": [
          "soporte técnico",
          "redacción"
        ]
      }
    ]
  },
  {
    "id": "weatherization-brigade",
    "name": "Brigada de aislamiento térmico y reparaciones del hogar",
    "purpose": "Ayudar a vecinas y vecinos de bajos ingresos, personas mayores y con discapacidad con reparaciones y aislamiento para reducir facturas de energía y mejorar la seguridad.",
    "whoItServes": "Propietarios de bajos ingresos, personas mayores y vecinas y vecinos con discapacidad que no pueden hacer ni costear el trabajo.",
    "whatYoullNeed": "Personas voluntarias con habilidades, materiales, herramientas y un sistema de solicitudes. Quédense dentro de la competencia voluntaria — deriven trabajos eléctricos, de gas, estructurales y de techos a profesionales con licencia.",
    "setupHours": 21,
    "defaultCategory": "housing",
    "suggestsWorkDays": true,
    "firstSteps": "Reúne primero a tus personas voluntarias más experimentadas y acuerden juntas la línea de alcance — qué trabajos toman y cuáles se derivan a profesionales con licencia — antes de aceptar una sola solicitud. Trata la primera visita a cada hogar como una conversación, no una inspección: la persona residente decide qué se toca en su casa.",
    "commonPitfalls": "El peligro es el alcance que crece solo: la 'reparación chiquita' que resulta ser trabajo eléctrico, de gas o de techo, fuera de la competencia voluntaria — ahí es donde alguien sale lastimado. Y no prometan más visitas de las que el equipo puede cumplir; dejar esperando a una persona mayor que contaba con ustedes duele más que un no honesto desde el inicio.",
    "pairsWith": [
      "community-wood-bank",
      "tool-lending-library"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Convoquen a personas voluntarias con habilidades",
        "description": "Encuentren gente cómoda con carpintería básica, sellado, aislamiento y burletes. Un par de personas con más experiencia pueden guiar al resto.",
        "hours": 4,
        "skills": [
          "carpintería",
          "reparaciones del hogar"
        ]
      },
      {
        "name": "Definan el alcance del trabajo",
        "description": "Definan qué harán y qué no. Quédense en trabajos seguros y sencillos (impermeabilización, barras de apoyo, arreglos menores) y descarten todo lo que requiera un oficio con licencia, como trabajos mayores de electricidad o gas.",
        "hours": 2,
        "skills": [
          "reparaciones del hogar"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Armen un sistema de solicitudes y evaluación",
        "description": "Creen una forma para que las vecinas y vecinos pidan ayuda; luego hagan una visita corta para dimensionar la obra, listar materiales y confirmar que está dentro de sus habilidades y límites de seguridad.",
        "hours": 3,
        "skills": [
          "organización"
        ]
      },
      {
        "name": "Consigan materiales y herramientas",
        "description": "Reúnan masilla, burletes, aislamiento y ferretería básica mediante donaciones, descuentos o un pequeño presupuesto. Mantengan un kit de herramientas compartido.",
        "hours": 4,
        "skills": [
          "conducir"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Resuelvan seguridad y responsabilidad",
        "description": "Usen renuncias sencillas, lleven primeros auxilios, exijan equipo de protección adecuado y nunca intenten trabajos fuera de su competencia. Asesórense sobre cobertura de responsabilidad para reparaciones voluntarias.",
        "hours": 3,
        "skills": [
          "trámites"
        ]
      },
      {
        "name": "Programen y realicen días de trabajo",
        "description": "Asignen los trabajos a equipos voluntarios, confirmen con la persona del hogar y completen la obra en una sesión enfocada. Respeten la casa y los deseos de quien la habita en todo momento.",
        "hours": 5,
        "skills": [
          "organización",
          "reparaciones del hogar"
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
    "name": "Banco de alimentos y apoyo para mascotas",
    "purpose": "Brindar comida gratis para mascotas y apoyo básico de cuidado para que nadie tenga que entregar a sus animales por el costo.",
    "whoItServes": "Personas de bajos ingresos con mascotas, personas mayores con ingresos fijos y vecinas y vecinos sin hogar con animales.",
    "whatYoullNeed": "Almacenamiento, una cadena de suministro de comida para mascotas, un punto de distribución y aliados veterinarios.",
    "setupHours": 10,
    "defaultCategory": "mutual_aid_drive",
    "suggestsWorkDays": true,
    "firstSteps": "Habla primero con la despensa de alimentos existente sobre distribuir juntos — las mismas familias suelen necesitar ambas cosas — y con veterinarias y tiendas de mascotas locales sobre donaciones y algún convenio de vacunas o descuentos.",
    "commonPitfalls": "La irregularidad es lo que más daña: una colecta grande y luego estantes vacíos, cuando quienes tienen mascotas necesitan poder contar contigo. Y vigila el tono — cualquier juicio sobre si 'la gente pobre debería tener mascotas' mata el proyecto más rápido que quedarse sin croquetas.",
    "pairsWith": [
      "diaper-hygiene-bank",
      "community-fridge"
    ],
    "tasks": [
      {
        "name": "Encuentren almacenamiento y un punto de distribución",
        "description": "Consigan un espacio seco y a prueba de plagas, y un lugar para entregar la comida — a menudo junto a una despensa comunitaria o centro comunitario existente.",
        "hours": 2,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Construyan una cadena de suministro de comida para mascotas",
        "description": "Combinen colectas, donaciones de tiendas de mascotas y fabricantes, y compras al por mayor. Lleven registro de lo que entra para planear las distribuciones.",
        "hours": 3,
        "skills": [
          "difusión",
          "conducir"
        ]
      },
      {
        "name": "Clasifiquen e inventaríen por animal y tamaño",
        "description": "Separen comida para perros y gatos (y otros animales), anoten las cantidades y revisen fechas de caducidad. Mantengan una cuenta corriente para guiar el reabastecimiento.",
        "hours": 1.5,
        "skills": [
          "organización",
          "captura de datos"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Definan una política de distribución",
        "description": "Decidan cuánto recibe cada hogar y con qué frecuencia, sin barreras de comprobación de necesidad. Háganlo predecible para que las personas puedan planear.",
        "hours": 1,
        "skills": [
          "facilitación"
        ]
      },
      {
        "name": "Programen y atiendan la distribución",
        "description": "Fijen horarios regulares de distribución, convoquen voluntariado y mantengan un tono sin juicios. Mucha gente se salta comidas para alimentar a sus mascotas — recíbanlas con respeto.",
        "hours": 2.5,
        "skills": [
          "organización"
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
    "name": "Mentoría juvenil y programa después de la escuela",
    "purpose": "Dar a niñas, niños y adolescentes un espacio seguro después de clases, con apoyo en tareas, mentoría y enriquecimiento.",
    "whoItServes": "Juventud en zonas con pocos recursos y madres y padres que trabajan y necesitan cuidado seguro.",
    "whatYoullNeed": "Un espacio seguro, mentoras y mentores con verificación, actividades y refrigerios. Trabajar con juventud conlleva una responsabilidad seria — verifiquen a las personas adultas, mantengan la regla de dos personas adultas, cumplan las leyes de reporte obligatorio y respeten las reglas locales para programas juveniles.",
    "setupHours": 28,
    "defaultCategory": "education",
    "suggestsWorkDays": true,
    "firstSteps": "Antes de convocar a una sola persona mentora, habla con madres, padres y con la propia juventud sobre qué necesitan, y deja por escrito las políticas de seguridad — verificación de antecedentes, regla de dos personas adultas, reporte obligatorio. Ninguna persona adulta pasa tiempo con niñas y niños antes de pasar por ese filtro.",
    "commonPitfalls": "La peor falla es el atajo en seguridad: una persona adulta sin verificar, o a solas con una niña o niño — eso no se negocia nunca. La segunda es la rotación de mentores; para juventud que ya ha vivido abandonos, un adulto que desaparece hace daño, así que empieza en pequeño y crece solo hasta donde puedas supervisar y sostener.",
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
        "name": "Consigan un espacio seguro y fijen un horario",
        "description": "Encuentren un lugar adecuado y accesible — un salón escolar, biblioteca o centro comunitario — y fijen un horario constante después de clases con el que las familias puedan contar.",
        "hours": 3,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Definan estándares de protección infantil y verificación",
        "description": "Exijan verificaciones de antecedentes para personas adultas que trabajen con juventud, apliquen la regla de dos personas adultas para que nadie quede a solas con una niña o niño, y fijen políticas claras de conducta y reporte.",
        "hours": 6,
        "skills": [
          "cuidado infantil",
          "redacción"
        ]
      },
      {
        "name": "Convoquen y capaciten a mentoras y mentores",
        "description": "Encuentren personas adultas confiables y cariñosas, y capacítenlas en límites, protección de la juventud y cómo apoyar sin hacer la tarea por las niñas y niños. Apunten a la constancia semana a semana.",
        "hours": 6,
        "skills": [
          "difusión",
          "enseñanza"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Planeen la programación",
        "description": "Mezclen apoyo en tareas con enriquecimiento — lectura, arte, deportes, habilidades para la vida. Mantéganlo atractivo y dejen que la juventud ayude a darle forma.",
        "hours": 4,
        "skills": [
          "enseñanza"
        ]
      },
      {
        "name": "Manejen inscripción, alergias e información de emergencia",
        "description": "Recojan permisos de las personas adultas a cargo, detalles de alergias y salud, contactos de emergencia y autorizaciones de recogida de cada niña o niño. Guarden esto con seguridad.",
        "hours": 3,
        "skills": [
          "trámites",
          "captura de datos"
        ]
      },
      {
        "name": "Consigan refrigerios e insumos",
        "description": "Ofrezcan un refrigerio saludable (muchas niñas y niños llegan con hambre) y reúnan libros, materiales de arte y juegos por donaciones o con un presupuesto pequeño.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Realicen las sesiones y mantengan contacto con las familias",
        "description": "Abran el espacio, supervisen de cerca, lleven las actividades y mantengan contacto regular con las personas adultas a cargo sobre cómo van sus hijas e hijos.",
        "hours": 4,
        "skills": [
          "cuidado infantil",
          "enseñanza"
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
    "name": "Red de rescate de cosechas",
    "purpose": "Rescatar excedentes de frutas y verduras de granjas, huertos, jardines y mercados, y redistribuirlos antes de que se desperdicien.",
    "whoItServes": "Vecinas y vecinos con inseguridad alimentaria y proyectos de comida como neveras, despensas y comidas comunitarias.",
    "whatYoullNeed": "Personas voluntarias, transporte, vínculos con quienes cultivan y almacenamiento de corto plazo.",
    "setupHours": 21,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Empieza por quienes cultivan: granjas, huertos y puestos del mercado. Pregúntales qué excedente tienen y qué les preocupa de recibir voluntarios — responsabilidad, daños al cultivo — y deja amarrado a dónde irá la comida (neveras, despensas, comidas comunitarias) antes de la primera cosecha.",
    "commonPitfalls": "La falla clásica es rescatar fruta que luego se pudre en la cochera de alguien — la distribución se acuerda antes de cosechar, no después. Las ventanas de cosecha son cortas, así que un equipo chico que responde rápido vale más que una lista larga de nombres; y un solo rescate descuidado que dañe el campo te puede costar a esa persona cultivadora para siempre.",
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
        "name": "Encuentren fuentes de cosecha",
        "description": "Acérquense a granjas, huertos, puestos de mercado y vecinas y vecinos con frutales cargados. A muchas personas les alegra que el excedente se coseche en lugar de pudrirse.",
        "hours": 4,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Convoquen un equipo de rescate",
        "description": "Armen una lista de personas voluntarias que puedan movilizarse rápido cuando la fruta o verdura esté lista. Las ventanas de cosecha son cortas, así que la flexibilidad importa más que el número.",
        "hours": 2,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Gestionen transporte y almacenamiento",
        "description": "Alineen vehículos para mover la cosecha y un lugar fresco para guardarla brevemente. Coordinen para mover el alimento rápido del campo a quienes lo reciben antes de que se eche a perder.",
        "hours": 3,
        "skills": [
          "conducir"
        ]
      },
      {
        "name": "Armen un sistema de programación y despacho",
        "description": "Creen una forma rápida de avisar y confirmar a las personas voluntarias cuando surja un rescate, ya que quienes cultivan suelen avisar con poca antelación. Un chat grupal o lista de llamadas funciona.",
        "hours": 2,
        "skills": [
          "organización"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Resuelvan responsabilidad y seguridad alimentaria",
        "description": "Aprendan las protecciones tipo \"Buen Samaritano\" para donación de alimentos en su zona, acuerden reglas sencillas de manejo y usen una renuncia básica para que quienes cultivan reciban con tranquilidad.",
        "hours": 3,
        "skills": [
          "trámites",
          "seguridad alimentaria"
        ]
      },
      {
        "name": "Construyan canales de distribución",
        "description": "Definan a dónde va la cosecha rescatada — neveras comunitarias, despensas, programas de comidas o directo a familias — para que nunca se quede sin usar.",
        "hours": 3,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Realicen los rescates y registren los kilos",
        "description": "Cosechen con cuidado para proteger el sitio, distribuyan pronto y registren cuánto alimento se rescató. Las cifras ayudan a convocar a más voluntariado y a quienes cultivan.",
        "hours": 4,
        "skills": [
          "jardinería",
          "conducir"
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
    "name": "Red de mediación y resolución de conflictos comunitaria",
    "purpose": "Ofrecer mediación gratuita y neutral para disputas vecinales, resolviendo el conflicto sin tribunales ni policía.",
    "whoItServes": "Vecinas y vecinos, personas inquilinas y propietarias, compañeras y compañeros de vivienda, y grupos comunitarios en conflicto.",
    "whatYoullNeed": "Personas mediadoras capacitadas, un espacio neutral y un proceso de solicitud. La mediación es para disputas entre partes dispuestas — descarten y deriven cualquier situación con violencia, abuso o peligro a la o el profesional adecuado o a servicios de emergencia.",
    "setupHours": 22,
    "defaultCategory": "other",
    "firstSteps": "Habla primero con un centro de mediación comunitaria existente o con quien capacite a mediadores — este oficio no se improvisa — y antes del primer caso dejen por escrito el filtro: qué disputas toman y a dónde derivan cualquier situación con violencia o abuso.",
    "commonPitfalls": "La falla peligrosa es mediar lo que no debe mediarse: una 'disputa vecinal' que en realidad es abuso pone a alguien en riesgo, así que filtren cada solicitud. Y la confidencialidad es todo el capital del proyecto — un solo detalle filtrado y nadie vuelve a confiar; cuiden también a sus mediadoras y mediadores, porque este trabajo desgasta.",
    "pairsWith": [
      "legal-aid-clinic",
      "tenant-union"
    ],
    "learnMore": [
      "disagree-with-member"
    ],
    "tasks": [
      {
        "name": "Convoquen y capaciten a personas mediadoras",
        "description": "Encuentren personas voluntarias serenas y ecuánimes y capacítenlas, ya sea en una formación reconocida de mediación o aliándose con un centro de mediación comunitaria existente.",
        "hours": 6,
        "skills": [
          "difusión",
          "facilitación"
        ]
      },
      {
        "name": "Armen un proceso de solicitud y admisión",
        "description": "Creen una forma sencilla para que la gente solicite mediación. En la admisión, escuchen lo básico de cada parte y confirmen que el caso es apropiado para mediación.",
        "hours": 3,
        "skills": [
          "organización",
          "entrevistas"
        ]
      },
      {
        "name": "Encuentren espacios neutrales de reunión",
        "description": "Consigan lugares tranquilos y neutrales — un salón de biblioteca o centro comunitario — donde ambas partes se sientan seguras y en igualdad de condiciones.",
        "hours": 2,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Definan el alcance y los límites",
        "description": "Decidan qué mediarán (ruido, espacios compartidos, disputas menores) y qué no. Descarten situaciones con violencia, abuso o riesgo de seguridad y deriven esos casos a profesionales adecuadas y adecuados.",
        "hours": 3,
        "skills": [
          "facilitación",
          "redacción"
        ]
      },
      {
        "name": "Establezcan confidencialidad y reglas básicas",
        "description": "Fijen reglas claras: confidencialidad, participación voluntaria, turnos con respeto, y una persona mediadora que guía pero no decide. Pónganlas por escrito para quienes participan.",
        "hours": 3,
        "skills": [
          "redacción"
        ]
      },
      {
        "name": "Difundan el servicio",
        "description": "Hagan saber a vecinas y vecinos, grupos de vivienda y organizaciones locales que existe una mediación gratuita, para que la gente la busque antes de que los conflictos escalen.",
        "hours": 3,
        "skills": [
          "difusión",
          "diseño gráfico"
        ],
        "follows": [
          1,
          3
        ]
      },
      {
        "name": "Hagan seguimiento de resultados y cuiden a las personas mediadoras",
        "description": "Anoten tasas de resolución (sin romper la confidencialidad) y hagan debriefs regulares con quienes median. El trabajo agota, así que roten casos y ofrezcan apoyo.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "captura de datos",
          "facilitación"
        ]
      }
    ]
  },
  {
    "id": "reentry-support",
    "name": "Red de apoyo al reingreso",
    "purpose": "Ayudar a personas que regresan de la prisión a conseguir identificación, vivienda, trabajo y comunidad, aliviando una transición notoriamente difícil.",
    "whoItServes": "Personas anteriormente encarceladas y sus familias.",
    "whatYoullNeed": "Personas voluntarias, organizaciones aliadas y un directorio sólido de recursos. Traten los antecedentes e historias de las personas como privados — guíense por el respeto, sigan los objetivos propios de cada persona y deriven asuntos legales a asesoría calificada.",
    "setupHours": 28,
    "defaultCategory": "other",
    "firstSteps": "Antes de armar nada, siéntense con personas que ya vivieron el regreso y con las organizaciones de reingreso, oficinas de libertad condicional y empleadores de oportunidad justa que ya trabajan en su zona — pregunten qué traba de verdad a la gente en las primeras semanas y dónde encaja su red. Consigan desde ya un contacto de asesoría legal calificada, para que cuando surjan preguntas legales tengan a dónde derivarlas de verdad.",
    "commonPitfalls": "Este proyecto muere cuando se vuelve un filtro — personas voluntarias decidiendo quién merece ayuda — o cuando la historia de alguien se filtra y le cuesta un trabajo o una vivienda. También falla en silencio cuando el entusiasmo supera al seguimiento; una promesa rota golpea más fuerte a quien está reconstruyendo confianza que ninguna promesa.",
    "pairsWith": [
      "court-support",
      "books-to-prisoners"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Armen un directorio de recursos y aliadas y aliados",
        "description": "Mapeen servicios para identificación y documentos, vivienda, empleo, salud, tratamiento y beneficios. Identifiquen qué empleadores y arrendadores están abiertos a personas con antecedentes.",
        "hours": 6,
        "skills": [
          "difusión",
          "captura de datos"
        ]
      },
      {
        "name": "Convoquen y capaciten a personas voluntarias",
        "description": "Encuentren personas voluntarias sin prejuicios y capacítenlas en apoyo respetuoso e informado por el trauma. Quienes regresan a casa necesitan acompañantes, no porteras y porteros.",
        "hours": 5,
        "skills": [
          "difusión",
          "enseñanza"
        ]
      },
      {
        "name": "Creen una bienvenida y entrevista de necesidades",
        "description": "Armen una manera sencilla y digna de saber qué necesita cada persona con más urgencia — a menudo identificación, un lugar donde quedarse e ingresos — y prioricen desde ahí.",
        "hours": 3,
        "skills": [
          "entrevistas"
        ]
      },
      {
        "name": "Apoyen con documentos y beneficios",
        "description": "Ayuden a reponer identificación y tarjetas de seguro social, a solicitar beneficios y con otros trámites difíciles de hacer sin domicilio ni acceso a internet.",
        "hours": 4,
        "recurringCadence": "month",
        "skills": [
          "trámites"
        ]
      },
      {
        "name": "Conecten con empleo y vivienda",
        "description": "Hagan presentaciones cálidas con empleadores de oportunidad justa y opciones de vivienda, y apoyen con postulaciones, currículums y preparación de entrevistas.",
        "hours": 4,
        "recurringCadence": "month",
        "skills": [
          "difusión",
          "redacción"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Ofrezcan mentoría entre pares",
        "description": "Cuando sea posible, emparejen a las personas con mentoras y mentores que han vivido el reingreso. Esa experiencia compartida construye confianza más rápido que cualquier otra cosa.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "facilitación"
        ]
      },
      {
        "name": "Establezcan prácticas de privacidad y límites",
        "description": "Manejen las historias de las personas con estricta confidencialidad, nunca presionen a nadie a compartir más de lo que quiere y deriven preguntas legales a abogadas y abogados calificados.",
        "hours": 3,
        "skills": [
          "redacción"
        ]
      }
    ]
  },
  {
    "id": "community-wood-bank",
    "name": "Banco comunitario de leña / Apoyo para calefacción",
    "purpose": "Recolectar y distribuir leña y coordinar apoyo de calefacción para que las vecinas y los vecinos pasen el invierno en calor.",
    "whoItServes": "Hogares rurales y de bajos ingresos que se calientan con leña, y personas mayores que no pueden cortar o partir la suya.",
    "whatYoullNeed": "Una fuente de leña, un sitio de procesamiento y almacenamiento, equipo, una cuadrilla capacitada y un plan de entrega. Las motosierras y las hendidoras son peligrosas — permitan operar solo a personas capacitadas, exijan equipo de protección y hagan una charla de seguridad antes de cada sesión.",
    "setupHours": 24,
    "defaultCategory": "mutual_aid_drive",
    "suggestsWorkDays": true,
    "firstSteps": "Empiecen hablando con los hogares que se calientan con leña — personas mayores rurales, familias que la oficina de asistencia de combustible ya conoce — para saber cuánto queman y cuándo se quedan cortos, y luego llamen a los servicios de poda locales para preguntar a dónde va su madera ahora. Antes de encender una sola motosierra, definan quién se hace cargo de la seguridad: alguien con suficiente experiencia para capacitar a la cuadrilla y sin miedo a decirle que no a una persona voluntaria.",
    "commonPitfalls": "Las dos formas en que esto lastima: una persona sin capacitación operando una motosierra, y entregar leña verde que humea, tapa las chimeneas con creosota y no calienta. Cortar en octubre para diciembre significa leña húmeda — el fracaso de calendario es tan real como el de seguridad.",
    "pairsWith": [
      "weatherization-brigade",
      "cooling-warming-center"
    ],
    "tasks": [
      {
        "name": "Aseguren una fuente de leña",
        "description": "Gestionen el suministro con servicios de poda, limpieza tras tormentas, donaciones de árboles caídos o predios manejados de forma sostenible. Confirmen que pueden tomarla y procesarla legalmente.",
        "hours": 4,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Encuentren un sitio de procesamiento y almacenamiento",
        "description": "Consigan un patio o terreno donde se pueda cortar, partir, apilar y secar la leña. Necesitan espacio para mantener seco el suministro de esta temporada y secando el de la próxima.",
        "hours": 4,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Consigan equipo y equipo de protección",
        "description": "Obtengan o pidan prestada una hendidora, motosierras y equipo de protección (perneras, protección de ojos y oídos, guantes). Mantengan las herramientas y un botiquín de primeros auxilios en el sitio.",
        "hours": 4,
        "skills": [
          "conducir",
          "reparación de herramientas"
        ]
      },
      {
        "name": "Convoquen y capaciten a la cuadrilla de leña",
        "description": "Armen la cuadrilla y aseguren que solo personas debidamente capacitadas operen motosierras y hendidoras. Hagan una charla de seguridad antes de cada día de trabajo.",
        "hours": 4,
        "skills": [
          "enseñanza",
          "difusión"
        ]
      },
      {
        "name": "Armen un sistema de solicitud y entrega",
        "description": "Creen una forma para que los hogares pidan leña y coordinen la entrega, dado que muchas personas receptoras son mayores o no tienen camioneta. Confirmen un apilado seguro cerca del hogar.",
        "hours": 3,
        "skills": [
          "organización",
          "conducir"
        ]
      },
      {
        "name": "Definan criterios de distribución",
        "description": "Decidan cuánta leña recibe cada hogar y prioricen a quienes corren más riesgo con el frío. Mantengan el proceso simple y de baja barrera.",
        "hours": 2,
        "skills": [
          "facilitación"
        ]
      },
      {
        "name": "Programen días de trabajo y el secado",
        "description": "Planeen el corte y la partición con mucha antelación al invierno, porque la leña verde debe secar meses antes de quemar de forma segura. Lleven registro de lo que ya está seco y listo.",
        "hours": 3,
        "recurringCadence": "cycle",
        "skills": [
          "organización"
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
    "name": "WiFi comunitario gratuito / Red en malla",
    "purpose": "Ofrecer acceso gratuito a internet donde es inaccesible o no se puede pagar.",
    "whoItServes": "Hogares de bajos ingresos, estudiantes, personas que buscan trabajo y cualquiera que esté desconectada de internet confiable.",
    "whatYoullNeed": "Una conexión de internet de respaldo, routers y nodos en malla, personas voluntarias con conocimientos técnicos y sitios anfitriones.",
    "setupHours": 32,
    "defaultCategory": "tech",
    "firstSteps": "Recorran las cuadras que quieren cubrir y toquen puertas — hablen con los hogares sin servicio sobre para qué lo usarían de verdad, y con quienes tienen techos y ventanas altas que podrían alojar un nodo. Antes de comprar equipo, tengan la conversación del ancho de banda: encuentren el negocio, biblioteca o ISP dispuesto a compartir una línea y confirmen por escrito que se permite redistribuir.",
    "commonPitfalls": "Las redes en malla suelen morir de mantenimiento, no de construcción — la persona técnica fundadora se muda y nadie más puede entrar a los routers, así que documenten todo y capaciten a una segunda persona desde el primer día. El otro fracaso silencioso es construir donde la señal llega fácil en vez de donde la gente de verdad no tiene acceso.",
    "pairsWith": [
      "digital-literacy",
      "emergency-preparedness"
    ],
    "tasks": [
      {
        "name": "Mapeen las necesidades y los vacíos de cobertura",
        "description": "Identifiquen qué cuadras carecen de acceso asequible y hasta dónde podría llegar la señal. Anoten edificios con línea de vista y personas anfitrionas dispuestas. Esto le da forma a todo el diseño.",
        "hours": 4,
        "skills": [
          "soporte técnico"
        ]
      },
      {
        "name": "Aseguren una conexión de internet de respaldo",
        "description": "Consigan una fuente de ancho de banda para compartir — una línea empresarial donada, una alianza con un ISP o un enlace de red comunitaria. Confirmen que los términos permiten redistribuir.",
        "hours": 5,
        "skills": [
          "difusión",
          "soporte técnico"
        ]
      },
      {
        "name": "Convoquen personas voluntarias con perfil técnico",
        "description": "Busquen gente cómoda con redes que pueda configurar routers y resolver problemas. Bastan un par para empezar, más personas dispuestas a aprender.",
        "hours": 3,
        "skills": [
          "difusión",
          "soporte técnico"
        ]
      },
      {
        "name": "Consigan y configuren equipo",
        "description": "Reúnan routers, nodos en malla y antenas mediante donaciones o un presupuesto pequeño. Configúrenlos para una red abierta o de uso compartido simple y prueben la cobertura.",
        "hours": 10,
        "skills": [
          "soporte técnico"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Encuentren sitios anfitriones para los nodos",
        "description": "Coloquen los nodos donde extiendan el alcance — techos, ventanas altas y porches con corriente y permiso. Obtengan un visto bueno por escrito de cada sitio y cubran cualquier pequeño costo eléctrico.",
        "hours": 5,
        "skills": [
          "difusión"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Definan normas de uso aceptable y de privacidad",
        "description": "Publiquen reglas simples, eviten registrar la actividad de las personas usuarias y dejen claro que una red abierta no es privada. Orienten sobre prácticas básicas de seguridad como HTTPS y VPN.",
        "hours": 2,
        "skills": [
          "redacción"
        ]
      },
      {
        "name": "Mantengan y amplíen la red",
        "description": "Revisen los nodos con regularidad, reemplacen hardware que falle y sumen cobertura cuando se incorporen nuevos anfitriones. Documenten la instalación para que otras personas puedan ayudar a mantenerla.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "soporte técnico"
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
    "name": "Círculo de apoyo entre pares en salud mental",
    "purpose": "Ofrecer un espacio seguro, regular y dirigido por pares para que las personas compartan y se apoyen mutuamente — un complemento, no un reemplazo, de la atención profesional.",
    "whoItServes": "Cualquier persona que esté atravesando estrés, aislamiento, duelo o desafíos de salud mental y quiera conexión entre pares.",
    "whatYoullNeed": "Personas facilitadoras capacitadas, un espacio privado, y límites claros junto con un plan de derivación en crisis. El apoyo entre pares complementa la atención profesional en salud mental — no la reemplaza. Las personas facilitadoras no son terapeutas, y siempre debe existir un plan claro para conectar a quien esté en crisis con recursos profesionales o de emergencia calificados.",
    "setupHours": 21,
    "defaultCategory": "emotional_support",
    "firstSteps": "Sus primeras conversaciones son con las personas que podrían facilitar y con proveedores locales de salud mental — una clínica, línea de crisis o terapeuta que acepte ser su ruta de derivación antes de que el primer círculo se reúna. No abran las puertas hasta que las personas facilitadoras estén capacitadas y todas puedan decir con claridad qué es y qué no es el círculo.",
    "commonPitfalls": "El fracaso peligroso es la deriva: un círculo cálido se convierte poco a poco en el único apoyo de alguien, quienes facilitan empiezan a hacer de terapeutas, y no hay plan para la noche en que alguien está en crisis de verdad. El más silencioso es el desgaste — si las personas que sostienen el espacio no tienen su propio apoyo, el círculo se apaga en un año.",
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
        "name": "Convoquen y capaciten a personas facilitadoras",
        "description": "Busquen personas cálidas y estables y pídanles que completen una capacitación en apoyo entre pares o escucha activa. Dejen claro que las personas facilitadoras son pares que sostienen el espacio, no clínicas que diagnostican o tratan.",
        "hours": 5,
        "skills": [
          "facilitación",
          "difusión"
        ]
      },
      {
        "name": "Definan el alcance y los límites del círculo",
        "description": "Establezcan que esto es apoyo entre pares, no terapia ni atención de crisis. Pongan por escrito para qué es el círculo y qué queda fuera de su rol, para que las expectativas queden claras para todas las personas.",
        "hours": 3,
        "skills": [
          "redacción"
        ]
      },
      {
        "name": "Armen un plan de derivación y escalamiento en crisis",
        "description": "Preparen pasos claros para cuando alguien esté en angustia más allá del apoyo entre pares: cómo conectarle con cuidado a ayuda profesional o a servicios de crisis, y cuándo activar apoyo de emergencia. Tengan a mano recursos locales y nacionales actualizados.",
        "hours": 3,
        "skills": [
          "redacción"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Encuentren un espacio privado y seguro",
        "description": "Aseguren una sala tranquila, cómoda y confidencial donde las personas puedan hablar con libertad. La constancia del lugar ayuda a que la gente se sienta segura para volver.",
        "hours": 2,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Acuerden confidencialidad y reglas del grupo",
        "description": "Acuerden confidencialidad, no dar consejos a menos que se pidan, no interrumpir y el derecho a pasar. Compártanlas al inicio de cada sesión.",
        "hours": 3,
        "skills": [
          "facilitación",
          "redacción"
        ]
      },
      {
        "name": "Agenden y difundan las sesiones",
        "description": "Elijan un horario constante, mantengan grupos de un tamaño manejable y difundan de un modo que reduzca el estigma. Dejen claro que es gratuito y abierto.",
        "hours": 3,
        "skills": [
          "difusión",
          "organización"
        ],
        "follows": [
          0,
          3
        ]
      },
      {
        "name": "Acompañen a las personas facilitadoras y eviten el desgaste",
        "description": "Hagan reuniones regulares para que las personas facilitadoras descarguen y descompriman. Roten quién guía y asegúrense de que también tengan su propio apoyo.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "facilitación"
        ]
      }
    ]
  },
  {
    "id": "community-cleanup",
    "name": "Limpieza comunitaria y restauración de espacios verdes",
    "purpose": "Recoger basura, restaurar lotes y parques abandonados y crear espacios verdes compartidos.",
    "whoItServes": "Todo el barrio — un espacio más limpio, seguro y verde beneficia a todas las personas.",
    "whatYoullNeed": "Personas voluntarias, insumos, permisos del sitio y un plan de disposición de residuos. Los sitios abandonados pueden esconder peligros reales — nunca recojan agujas ni químicos desconocidos con la mano; usen herramientas y un contenedor rígido para objetos punzantes, y desechen los hallazgos peligrosos según las reglas locales.",
    "setupHours": 10,
    "defaultCategory": "infrastructure",
    "suggestsWorkDays": true,
    "firstSteps": "Recorran el barrio con quienes viven más cerca de los puntos descuidados — saben qué lotes importan, de quién son y qué se intentó antes — y averigüen si el municipio o un grupo de amigas y amigos del parque ya organiza limpiezas a las que puedan sumarse. Resuelvan propiedad, permisos y a dónde va la basura antes de elegir la fecha.",
    "commonPitfalls": "Las limpiezas fracasan de dos maneras: las bolsas de basura recolectada se quedan semanas en la banqueta porque nadie coordinó la disposición, y el lote hermosamente despejado vuelve a estar cubierto de maleza para el otoño porque no hubo plan más allá del gran día. Y una persona voluntaria que agarra una aguja con la mano puede convertir una buena mañana en una visita al hospital.",
    "pairsWith": [
      "community-garden",
      "community-composting"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Identifiquen y prioricen sitios",
        "description": "Recorran la zona y enumeren los puntos que necesitan atención — esquinas cargadas de basura, lotes con maleza, parques descuidados. Prioricen por impacto y viabilidad.",
        "hours": 1.5
      },
      {
        "name": "Obtengan permisos y un plan de disposición",
        "description": "Confirmen quién es dueño de cada sitio y obtengan permiso. Arreglen la recolección de basura y escombros con anticipación — coordinen un contenedor o un recoge municipal para que las bolsas no se acumulen.",
        "hours": 2,
        "skills": [
          "difusión",
          "trámites"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Reúnan insumos y equipo de seguridad",
        "description": "Recolecten guantes, bolsas, pinzas y chalecos de alta visibilidad. Incluyan un contenedor rígido para objetos punzocortantes y un plan para cualquier material peligroso que encuentren.",
        "hours": 1.5,
        "skills": [
          "conducir"
        ]
      },
      {
        "name": "Convoquen y organicen personas voluntarias",
        "description": "Corran la voz y registren a las personas. Asignen líderes de equipo y zonas para que el día sea organizado y no caótico.",
        "hours": 2,
        "skills": [
          "difusión",
          "organización"
        ]
      },
      {
        "name": "Lleven a cabo el día de limpieza o restauración",
        "description": "Realicen el evento, mantengan a los equipos seguros e hidratados y celebren juntas y juntos el resultado visible. Tomen fotos del antes y después para motivar la próxima convocatoria.",
        "hours": 3,
        "skills": [
          "organización",
          "fotografía"
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
    "name": "Preparación gratuita de impuestos y clínica de empoderamiento financiero",
    "purpose": "Ayudar a vecinas y vecinos de bajos ingresos a presentar impuestos de forma gratuita y reclamar los créditos y reembolsos que les corresponden.",
    "whoItServes": "Personas trabajadoras de bajos ingresos, familias elegibles para créditos fiscales, personas mayores y estudiantes.",
    "whatYoullNeed": "Personas preparadoras capacitadas y certificadas, un espacio, computadoras y un sistema de citas. Las declaraciones deben ser preparadas por personas voluntarias certificadas a través de un programa reconocido — esta clínica ayuda con declaraciones estándar, no con situaciones complejas que requieren a un profesional fiscal.",
    "setupHours": 28,
    "defaultCategory": "skilled_labor",
    "suggestsWorkDays": true,
    "firstSteps": "Su primera llamada es a un programa establecido de presentación gratuita como VITA — hablen con su coordinación sobre plazos de certificación, software y qué necesita un sitio nuevo, porque esto no conviene hacerlo por su cuenta. Después hablen con las vecinas y vecinos a quienes esperan servir sobre cuándo pueden venir de verdad y qué les ha impedido declarar antes.",
    "commonPitfalls": "Una declaración mal hecha puede costarle a una familia su reembolso o provocar una auditoría — por eso la línea que este proyecto nunca debe cruzar es que personas sin certificación preparen impuestos. Los fracasos más suaves: lanzar en marzo cuando la certificación toma meses, y que alguien haga todo el viaje solo para ser rechazado por un documento que nadie le dijo que trajera.",
    "pairsWith": [
      "legal-aid-clinic",
      "solidarity-fund"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Capaciten y certifiquen a las personas preparadoras",
        "description": "Hagan que las personas voluntarias completen una certificación reconocida de preparación gratuita de impuestos (como el programa VITA del IRS) para que las declaraciones sean correctas y estén debidamente autorizadas. Esto no es negociable.",
        "hours": 10,
        "recurringCadence": "cycle",
        "skills": [
          "contabilidad"
        ]
      },
      {
        "name": "Aliense con un programa reconocido de presentación gratuita",
        "description": "Afílense a un programa establecido para obtener software, soporte y credibilidad. Ellos brindan las herramientas de presentación y los controles de calidad que no conviene construir solos.",
        "hours": 4,
        "skills": [
          "difusión",
          "trámites"
        ]
      },
      {
        "name": "Habiliten un espacio y el equipo",
        "description": "Consigan un local con computadoras, internet confiable y suficiente privacidad para que las personas puedan compartir información financiera sensible con tranquilidad.",
        "hours": 3,
        "skills": [
          "soporte técnico"
        ]
      },
      {
        "name": "Armen un sistema de citas y de admisión",
        "description": "Creen citas y una lista clara de documentos que las personas deben traer (identificación, comprobantes de ingresos, declaración anterior). Esto evita viajes en vano y esperas largas.",
        "hours": 3,
        "skills": [
          "organización",
          "captura de datos"
        ]
      },
      {
        "name": "Difundan entre vecinas y vecinos elegibles",
        "description": "Corran la voz, resaltando que presentar puede destrabar reembolsos y créditos que muchas personas se pierden. Lleguen a trabajadores, familias y personas mayores que con frecuencia califican.",
        "hours": 3,
        "recurringCadence": "cycle",
        "skills": [
          "difusión",
          "diseño gráfico"
        ],
        "follows": [
          3
        ]
      },
      {
        "name": "Aseguren la seguridad y la privacidad de los datos",
        "description": "Protejan hasta el último dato personal y financiero: dispositivos seguros, sin copias innecesarias, almacenamiento bajo llave y una política clara de retención y destrucción.",
        "hours": 3,
        "skills": [
          "soporte técnico"
        ]
      },
      {
        "name": "Ofrezcan seguimiento de empoderamiento financiero",
        "description": "Cuando se quiera, conecten a las personas con apoyo de presupuesto, banca segura y orientación sobre beneficios. Manténganlo opcional y deriven situaciones complejas a profesionales calificados.",
        "hours": 2,
        "skills": [
          "contabilidad"
        ]
      }
    ]
  },
  {
    "id": "community-market",
    "name": "Mercado comunitario / Puesto agrícola gratuito",
    "purpose": "Operar un puesto regular, gratuito o de pago según puedas, que distribuya frutas, verduras y básicos.",
    "whoItServes": "Vecinas y vecinos con inseguridad alimentaria y personas en zonas sin acceso a productos frescos asequibles.",
    "whatYoullNeed": "Una fuente de productos, un puesto o ubicación, personas voluntarias y un horario regular.",
    "setupHours": 15,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Empiecen con las conversaciones de suministro — visiten granjas, tiendas y huertas comunitarias para saber qué excedente existe de verdad y con qué ritmo — y hablen con las vecinas y vecinos de la zona sobre por dónde ya caminan y qué comida se llevarían de verdad a casa. Elijan el lugar con las personas que lo van a usar, no por ellas.",
    "commonPitfalls": "Un puesto que aparece de forma errática le enseña a la gente a dejar de contar con él — la constancia importa más que la abundancia. Los otros fracasos: un suministro que se seca después del primer mes de entusiasmo, y cualquier cosa en la mesa (formularios, preguntas, clasificar a la gente) que haga que llevarse comida se sienta como solicitarla.",
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
        "name": "Aseguren suministro de productos y artículos",
        "description": "Consigan alimentos a través de gleaning, huertas comunitarias, donaciones de granjas y tiendas y compras al por mayor. Apunten a variedad y confiabilidad para que el puesto no quede vacío.",
        "hours": 3,
        "skills": [
          "difusión",
          "conducir"
        ]
      },
      {
        "name": "Encuentren ubicación y monten el puesto",
        "description": "Elijan un lugar visible, accesible y con permiso — el borde de un parque, un estacionamiento o una parada de transporte. Acomoden mesas, sombra y señalización.",
        "hours": 2,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Decidan el modelo",
        "description": "Elijan totalmente gratuito, paga lo que puedas o una mezcla. Cualquier opción que tomen, asegúrense de no rechazar nunca a nadie por no poder pagar.",
        "hours": 1,
        "skills": [
          "facilitación"
        ]
      },
      {
        "name": "Organicen exhibición, almacenamiento y seguridad alimentaria",
        "description": "Mantengan los productos frescos y presentables, manejen los alimentos con seguridad y tengan hieleras o sombra para los días calurosos. Descarten lo que esté en mal estado.",
        "hours": 2,
        "skills": [
          "seguridad alimentaria"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Convoquen y agenden personas voluntarias",
        "description": "Organicen personas para recoger producto, montar, atender el puesto y desmontar. Asignen roles claros para cada mercado.",
        "hours": 2,
        "skills": [
          "organización",
          "difusión"
        ]
      },
      {
        "name": "Difundan y fijen un horario regular",
        "description": "Elijan un día y hora constantes y publíquenlo ampliamente. La previsibilidad es lo que convierte un puesto en un recurso confiable.",
        "hours": 2,
        "skills": [
          "difusión",
          "diseño gráfico"
        ],
        "follows": [
          1,
          2
        ]
      },
      {
        "name": "Operen el puesto y manejen las sobras",
        "description": "Monten, distribuyan con calidez y sin juicio, y deriven cualquier producto sobrante a refrigeradores, despensas o programas de comidas para que nada se desperdicie.",
        "hours": 3,
        "skills": [
          "organización"
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
    "name": "Carreta de bienvenida: apoyo a vecinas y vecinos nuevos y a madres y padres recientes",
    "purpose": "Recibir a personas recién llegadas y a quienes acaban de ser madres o padres con ayuda práctica, información local y una bienvenida real a la comunidad.",
    "whoItServes": "Personas que se acaban de mudar, madres y padres nuevos o en espera, y cualquiera que necesite un comienzo amable.",
    "whatYoullNeed": "Personas voluntarias, paquetes de información, artículos de bienvenida donados y un sistema de referencias.",
    "setupHours": 10,
    "defaultCategory": "emotional_support",
    "firstSteps": "Hablen primero con quienes conocen a las personas recién llegadas antes que ustedes — arrendadores, oficinas escolares, clínicas, parteras y personal de pediatría — sobre cómo referirían a alguien con su consentimiento. Después pregúntenle a algunas personas recién mudadas y a madres y padres recientes qué les habría ayudado de verdad en su primer mes, y armen el paquete y la canasta alrededor de sus respuestas.",
    "commonPitfalls": "La forma en que esto sale mal es cuando se siente como vigilancia — presentarse sin invitación en la puerta de una persona desconocida, o pasar nombres sin consentimiento, convierte una bienvenida en una intrusión. También se apaga en silencio cuando las personas fundadoras se agotan y nadie nota a las recién llegadas durante meses.",
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
        "name": "Definan a quién darán la bienvenida y cómo",
        "description": "Definan su enfoque — residentes nuevos, madres y padres nuevos, o ambos — y la forma que toma la bienvenida (una visita, una canasta, una llamada). Manténganlo opt-in y nunca invasivo.",
        "hours": 1,
        "skills": [
          "facilitación"
        ]
      },
      {
        "name": "Armen un paquete de información local",
        "description": "Reúnan una guía clara de servicios locales, transporte, escuelas, atención médica y su programa de apoyo mutuo. Ofrézcanlo en los idiomas que se hablan en su zona.",
        "hours": 3,
        "skills": [
          "redacción",
          "traducción"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Armen canastas de bienvenida",
        "description": "Junten cosas útiles — básicos de despensa, artículos del hogar, y para madres y padres nuevos, algunos esenciales de bebé o una comida casera. Consíganlas con donaciones.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "difusión",
          "organización"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Convoquen y capaciten a personas que reciben",
        "description": "Busquen personas voluntarias amables y entrénenlas para ser cálidas y respetuosas, para leer si alguien quiere conexión, y para nunca presionar ni meterse de más.",
        "hours": 2,
        "skills": [
          "difusión",
          "enseñanza"
        ]
      },
      {
        "name": "Armen un sistema de referencias e inscripción",
        "description": "Creen formas simples para que las personas sean referidas o se anoten — por arrendadores, clínicas, escuelas o un formulario. Respeten la privacidad en todo el proceso.",
        "hours": 2,
        "skills": [
          "organización",
          "captura de datos"
        ],
        "follows": [
          0
        ]
      }
    ]
  },
  {
    "id": "library-of-things",
    "name": "Biblioteca de cosas",
    "purpose": "Prestar artículos del hogar y para eventos que la gente rara vez necesita poseer — utensilios de cocina, equipo para fiestas y campamento, equipo de bebé, proyectores y más.",
    "whoItServes": "Cualquier persona; ahorra dinero, reduce el desorden y disminuye el desperdicio.",
    "whatYoullNeed": "Almacenamiento, artículos donados, un catálogo y sistema de préstamos, y un par de personas bibliotecarias.",
    "setupHours": 21,
    "defaultCategory": "infrastructure",
    "firstSteps": "Antes de recolectar un solo artículo, pregúntenle a la gente qué pediría prestado de verdad — esa encuesta es el cimiento del proyecto — y hablen con la biblioteca pública o un centro comunitario sobre alojarla, porque una institución de confianza resuelve de una vez el almacenamiento y la credibilidad. Consigan a sus dos personas bibliotecarias antes de que lleguen las donaciones, no después.",
    "commonPitfalls": "Las bibliotecas de cosas mueren de desorden: decirle que sí a cada donación llena la sala de panificadoras rotas que nadie quiere, mientras la hidrolavadora que todo el mundo pidió sigue faltando. El otro asesino son los horarios impredecibles — si la gente no puede contar con cuándo recoger y devolver, vuelve en silencio a comprar.",
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
        "name": "Pregunten a la comunidad qué quiere pedir prestado",
        "description": "Pregúntenle a las personas qué usarían pero odiarían comprar — mesas plegables, una ponchera, una carpa, una limpiadora de alfombras, una carriola. Las respuestas definen su inventario inicial.",
        "hours": 2,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Encuentren almacenamiento y horario de atención",
        "description": "Consigan un clóset, sala o contenedor para guardar los artículos y fijen horas predecibles de recogida y devolución para que pedir prestado sea fácil.",
        "hours": 3,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Recolecten, limpien y prueben los artículos",
        "description": "Junten donaciones y luego limpien, prueben y revisen cada artículo por seguridad. Aparten cualquier cosa rota, retirada del mercado o no higiénica.",
        "hours": 5,
        "skills": [
          "conducir"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Cataloguen y fotografíen el inventario",
        "description": "Registren cada artículo con una foto y su estado en una hoja de cálculo o app de préstamos. Numeren los artículos para que sean fáciles de rastrear al salir y entrar.",
        "hours": 4,
        "skills": [
          "captura de datos",
          "fotografía"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Escriban reglas de préstamo y una política de confianza",
        "description": "Definan duración del préstamo, límites de cantidad y una política de devolución indulgente. Constrúyanla sobre la confianza, no sobre multas, y anoten los artículos que requieran cuidado o limpieza extra.",
        "hours": 2,
        "skills": [
          "redacción"
        ]
      },
      {
        "name": "Habiliten el préstamo y capaciten a bibliotecarias y bibliotecarios",
        "description": "Creen un formato simple de salida (nombre, contacto, artículo, fecha de devolución) con una foto rápida del estado. Guíen a las personas voluntarias por el catálogo y el proceso.",
        "hours": 3,
        "skills": [
          "captura de datos",
          "enseñanza"
        ],
        "follows": [
          3,
          4
        ]
      },
      {
        "name": "Mantengan, sanitizen y hagan crecer la colección",
        "description": "Limpien e inspeccionen los artículos devueltos, reparen lo que puedan y sumen con el tiempo lo que más se pide.",
        "hours": 2,
        "skills": [
          "reparación"
        ],
        "recurringCadence": "session"
      }
    ]
  },
  {
    "id": "laundry-shower-access",
    "name": "Programa de acceso a lavandería y duchas",
    "purpose": "Ofrecer acceso gratuito a lavandería y duchas para que las personas puedan mantenerse limpias con dignidad.",
    "whoItServes": "Vecinas y vecinos sin hogar, personas sin instalaciones funcionales y familias de bajos ingresos.",
    "whatYoullNeed": "Acceso a máquinas y duchas (un sitio aliado o una unidad móvil), insumos y personas voluntarias. La dignidad y la privacidad de quienes llegan van primero — no pidan información personal para usar el servicio, mantengan las duchas privadas y seguras, y sigan las reglas locales de salud para instalaciones compartidas o móviles.",
    "setupHours": 19,
    "defaultCategory": "infrastructure",
    "suggestsWorkDays": true,
    "firstSteps": "Empiecen con dos rondas de conversaciones: con vecinas y vecinos sin hogar y las personas de trabajo de calle que los conocen, sobre qué horarios y lugares funcionarían de verdad — y con la dueña de una lavandería, un gimnasio o un sitio religioso sobre ser anfitrión. Esa conversación es delicada; sean honestos sobre quiénes van a venir y acuerden expectativas de privacidad, limpieza y horarios antes de que llegue la primera persona.",
    "commonPitfalls": "Este programa muere cuando la relación con el sitio anfitrión se agria — una mala interacción sin protocolo detrás, y el espacio se pierde — o cuando los horarios cambian tanto que la gente cruza la ciudad para encontrar la puerta cerrada. Y cada papel que exijan en la entrada aleja a alguien que necesitaba una ducha más de lo que ustedes necesitaban su nombre.",
    "pairsWith": [
      "free-haircut",
      "cooling-warming-center",
      "diaper-hygiene-bank"
    ],
    "tasks": [
      {
        "name": "Aseguren acceso a lavandería y duchas",
        "description": "Aliense con una lavandería, gimnasio, sitio religioso, centro recreativo, o coordinen una unidad móvil. Confirmen horarios confiables y que el espacio ofrezca privacidad.",
        "hours": 4,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Consigan insumos",
        "description": "Reúnan detergente, toallas limpias, jabón, champú y otros artículos de higiene mediante donaciones o un presupuesto pequeño. Incluyan algo de ropa limpia si pueden.",
        "hours": 3,
        "skills": [
          "difusión",
          "conducir"
        ]
      },
      {
        "name": "Armen un sistema de inscripción y turnos",
        "description": "Creen una forma justa de reservar cargas de lavado y turnos de ducha para que los tiempos de espera se mantengan razonables y todas las personas tengan su lugar.",
        "hours": 3,
        "skills": [
          "organización",
          "captura de datos"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Establezcan protocolos de higiene y seguridad",
        "description": "Definan rutinas de limpieza entre personas usuarias, aseguren áreas de ducha privadas y seguras, y protejan la dignidad y la seguridad de todas las personas en todo momento.",
        "hours": 3,
        "skills": [
          "redacción"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Convoquen y capaciten a personas voluntarias",
        "description": "Busquen personas voluntarias para hacer la admisión, manejar los insumos y limpiar entre usos. Capacítenlas para tratar a cada persona invitada con calidez y respeto.",
        "hours": 3,
        "skills": [
          "difusión",
          "enseñanza"
        ],
        "follows": [
          3
        ]
      },
      {
        "name": "Fijen un horario y corran la voz",
        "description": "Elijan horas constantes y avísenle a personas de calle, albergues y vecinas y vecinos vinculados a la calle cuándo y dónde funciona el servicio.",
        "hours": 3,
        "skills": [
          "difusión"
        ],
        "follows": [
          0
        ]
      }
    ]
  },
  {
    "id": "voter-registration",
    "name": "Campaña de registro de votantes y participación cívica",
    "purpose": "Registrar votantes y ayudar a las personas a participar en elecciones y decisiones locales — estrictamente apartidista.",
    "whoItServes": "Personas residentes elegibles, especialmente quienes históricamente han estado subrepresentadas en las urnas.",
    "whatYoullNeed": "Personas voluntarias capacitadas, materiales de registro, reglas precisas y buenas ubicaciones. Mantengan la campaña estrictamente apartidista y sigan al pie de la letra todas las leyes electorales y de registro — entreguen solo información precisa y nunca aboguen por un partido o candidatura.",
    "setupHours": 16,
    "defaultCategory": "organizing",
    "firstSteps": "Antes de que alguien ponga mesa, hablen con su oficina electoral local — les dirán exactamente qué pueden y no pueden hacer las campañas, y algunas zonas exigen capacitación o registro previo. Luego conéctense con la Liga de Mujeres Votantes u otro grupo apartidista establecido; apoyarse en sus materiales y experiencia es mejor que aprender la ley electoral a prueba y error.",
    "commonPitfalls": "Los fracasos imperdonables son los legales: una pila de formularios llenos olvidada en la cajuela de alguien hasta pasado el plazo le quita el voto a cada persona que confió en ustedes, y una sola persona voluntaria promoviendo una candidatura puede manchar toda la campaña. El error más sutil es repartir formularios de registro sin mencionar nunca dónde ni cómo se vota de verdad.",
    "pairsWith": [
      "newcomer-translation-network",
      "legal-aid-clinic"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Aprendan las reglas para campañas de registro",
        "description": "Investiguen las leyes de su zona sobre registrar votantes: plazos, qué pueden y no pueden hacer las personas voluntarias, cómo se deben manejar los formularios y los requisitos de identificación. Cumplirlas con exactitud es esencial.",
        "hours": 3,
        "skills": [
          "trámites"
        ]
      },
      {
        "name": "Capaciten a personas voluntarias apartidistas",
        "description": "Entrenen a las personas voluntarias para ayudar a registrarse a todas las personas sin importar sus opiniones, y para nunca promover un partido o candidatura. La imparcialidad protege a la campaña y a la confianza de la comunidad.",
        "hours": 3,
        "skills": [
          "enseñanza"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Reúnan materiales e información precisa",
        "description": "Recolecten formularios de registro e información verificada y actual sobre plazos, reglas de identificación, lugares de votación y opciones por correo. La información incorrecta hace más daño que ninguna.",
        "hours": 2,
        "skills": [
          "redacción"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Elijan lugares y eventos de alto tránsito",
        "description": "Pongan mesa donde la gente elegible ya se reúne — mercados, paradas de transporte, campus universitarios, eventos comunitarios — con cualquier permiso necesario para instalarse.",
        "hours": 2,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Atiendan la mesa de registro",
        "description": "Cubran la mesa, ayuden a registrarse correctamente y entreguen los formularios con prontitud dentro de los plazos legales. Mantengan un tono cálido e informativo.",
        "hours": 4,
        "skills": [
          "difusión"
        ],
        "follows": [
          1,
          2,
          3
        ],
        "recurringCadence": "event"
      },
      {
        "name": "Acompañen los siguientes pasos",
        "description": "Más allá de registrar, ayuden a la gente a saber cómo, cuándo y dónde votar, incluidas opciones por correo y traslados a las urnas. Registrarse solo no es participar.",
        "hours": 2,
        "skills": [
          "difusión"
        ]
      }
    ]
  },
  {
    "id": "health-navigation",
    "name": "Programa comunitario de navegación de salud",
    "purpose": "Ayudar a vecinas y vecinos a encontrar y acceder a atención médica — clínicas, seguros, recetas y citas.",
    "whoItServes": "Personas sin seguro o con poco seguro, personas mayores, recién llegadas y cualquiera perdida en el sistema de salud.",
    "whatYoullNeed": "Personas navegadoras capacitadas, un directorio de recursos, alianzas con proveedores y un sistema de solicitudes. Las personas navegadoras conectan a la gente con la atención — no dan consejo médico ni diagnósticos. Deriven todas las preguntas clínicas a profesionales de salud calificados.",
    "setupHours": 26,
    "defaultCategory": "other",
    "firstSteps": "Empiecen visitando las clínicas gratuitas y de tarifa escalonada a las que van a derivar — preséntense, pregunten qué derivaciones les ayudan y cuáles los saturan, y dejen que esas conversaciones siembren su directorio. Acuerden el límite antes de que llegue la primera solicitud: las personas navegadoras se encargan de logística y trámites, y cada pregunta clínica va a un profesional, así que sepan exactamente a qué línea de enfermería o clínica se las van a pasar.",
    "commonPitfalls": "El filo peligroso es una persona navegadora bienintencionada que se desliza hacia el consejo médico — un 'eso no suena grave' dicho al pasar puede costarle a alguien semanas de atención necesaria. Esto también falla cuando el directorio envejece en silencio y manda a la gente a clínicas cerradas o programas que ya terminaron; un número equivocado le cuesta el último intento a alguien que ya venía agotado.",
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
        "name": "Armen un directorio de recursos de salud",
        "description": "Compilen clínicas gratuitas y de bajo costo, proveedores con tarifa escalonada, programas de asistencia para recetas, opciones dentales y de vista, y servicios de salud mental. Manténganlo al día.",
        "hours": 6,
        "skills": [
          "captura de datos",
          "difusión"
        ]
      },
      {
        "name": "Convoquen y capaciten a personas navegadoras",
        "description": "Busquen personas voluntarias y capacítenlas para conectar a la gente con la atención — no para dar consejo médico. Su trabajo es orientación y logística, con las preguntas clínicas derivadas a profesionales.",
        "hours": 5,
        "skills": [
          "difusión",
          "enseñanza"
        ]
      },
      {
        "name": "Armen un sistema de solicitud y admisión",
        "description": "Creen una forma privada y de baja barrera para que la gente pida ayuda y describa su situación, con opciones por teléfono y en persona, no solo en línea.",
        "hours": 3,
        "skills": [
          "organización"
        ]
      },
      {
        "name": "Ayuden con seguros e inscripción",
        "description": "Acompañen a las personas a entender y solicitar la cobertura para la que califican (como Medicaid o planes del mercado de seguros) y a reunir los documentos necesarios.",
        "hours": 4,
        "recurringCadence": "month",
        "skills": [
          "trámites"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Ofrezcan apoyo con citas y recetas",
        "description": "Ayuden a agendar citas, fijar recordatorios, navegar los costos de recetas y conectar con el programa de transporte para llegar a la atención.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "organización"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Definan prácticas de privacidad para la información de salud",
        "description": "Traten todos los datos de salud como altamente sensibles: recojan lo mínimo, almacénenlo de forma segura y nunca lo compartan sin consentimiento. Capaciten a las personas navegadoras en confidencialidad.",
        "hours": 2,
        "skills": [
          "redacción"
        ]
      },
      {
        "name": "Aliense con clínicas y proveedores",
        "description": "Construyan relaciones con clínicas y proveedores locales para derivar con más fluidez y conocer nuevos servicios de bajo costo a medida que abren.",
        "hours": 3,
        "skills": [
          "difusión"
        ]
      }
    ]
  },
  {
    "id": "toy-library",
    "name": "Juguetería comunitaria y préstamo de recursos de juego",
    "purpose": "Prestar juguetes, juegos y equipo de juego para que las familias tengan variedad sin tener que comprarla.",
    "whoItServes": "Familias con niñas y niños pequeños, especialmente con presupuesto ajustado; también reduce desperdicio y desorden.",
    "whatYoullNeed": "Almacenamiento, juguetes donados, un catálogo y sistema de préstamo, materiales de limpieza y personas bibliotecarias.",
    "setupHours": 10,
    "defaultCategory": "childcare",
    "firstSteps": "Hablen con las familias a las que esperan servir — a la salida de la guardería, en una hora de cuentos, en un grupo de juego — sobre qué juguetes sus hijas e hijos dejan atrás más rápido y qué horarios realmente les quedan, y luego pregunten en un centro comunitario, iglesia o biblioteca por un estante o una sala. Consigan a una persona voluntaria con experiencia en cuidado infantil que se encargue de las revisiones de seguridad antes de que empiecen a llegar donaciones.",
    "commonPitfalls": "Las jugueterías comunitarias fallan por seguridad y por piezas: un solo juguete retirado del mercado o un riesgo de asfixia que se cuela rompe la confianza de las familias para siempre, y los rompecabezas que vuelven incompletos hacen que toda la colección se sienta de segunda en pocos meses. La inspección estricta y las bolsas con conteo lo son todo.",
    "pairsWith": [
      "library-of-things",
      "childcare-collective",
      "school-supply-program"
    ],
    "tasks": [
      {
        "name": "Consigan almacenamiento y horarios de apertura",
        "description": "Aseguren estantería en un centro comunitario, biblioteca o espacio compartido, y fijen horarios predecibles de recogida y devolución que las familias puedan planear.",
        "hours": 1.5,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Recolecten, limpien y revisen la seguridad de los juguetes",
        "description": "Reúnan donaciones, luego limpien e inspeccionen cada juguete. Revisen retiros del mercado, piezas rotas y riesgos de asfixia, y aparten cualquier cosa insegura para niñas y niños pequeños.",
        "hours": 3.5,
        "skills": [
          "conducir",
          "cuidado infantil"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Cataloguen y embolsen con todas las piezas",
        "description": "Registren cada juguete con una foto y rango de edad, y embolsen los sets de varias piezas con el conteo para que nada se pierda. Numeren los artículos para seguimiento fácil.",
        "hours": 2,
        "skills": [
          "captura de datos",
          "fotografía"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Escriban reglas de préstamo",
        "description": "Fijen la duración del préstamo, cuántos juguetes a la vez y una política amable para devoluciones y piezas faltantes. Mantengan algo basado en la confianza y flexible.",
        "hours": 1,
        "skills": [
          "redacción"
        ]
      },
      {
        "name": "Armen el préstamo y capaciten a bibliotecarias y bibliotecarios",
        "description": "Creen un registro de salida simple (nombre, contacto, artículo, fecha de devolución) y guíen a las personas voluntarias por el catálogo, la rutina de limpieza y las reglas.",
        "hours": 2,
        "skills": [
          "captura de datos",
          "enseñanza"
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
    "name": "Colectivo de conservación de alimentos y enlatado",
    "purpose": "Enseñar y hacer enlatado y conservación en grupo para que el excedente de temporada dure y se desperdicie menos comida.",
    "whoItServes": "Personas que cultivan, espigan y familias que quieren estirar la comida durante el año.",
    "whatYoullNeed": "Una cocina, equipo de enlatado y conservación, personas líderes con conocimiento y productos. La conservación casera implica riesgos reales para la seguridad alimentaria, incluyendo botulismo, cuando se hace mal — sigan siempre guías actualizadas y probadas de una fuente confiable y nunca improvisen tiempos ni métodos de procesamiento.",
    "setupHours": 18,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Encuentren primero el conocimiento, no la cocina: llamen al servicio de extensión local o a una persona certificada en conservación de alimentos y pídanle que capacite a sus líderes o revise sus planes, y hablen con quienes cultivan y espigan sobre qué excedente llega y cuándo. Reserven la cocina alrededor del calendario de cosecha, no al revés.",
    "commonPitfalls": "El fracaso que importa es invisible: un frasco sellado con un método improvisado o con la receta no probada de la abuela puede cargar botulismo y verse perfecto en el estante. El fracaso ordinario es el calendario — los tomates maduran a su ritmo, y un colectivo que organiza su primera sesión en noviembre no conserva nada.",
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
        "name": "Aseguren una cocina adecuada",
        "description": "Encuentren una cocina con estufas, espacio de mesada y agua para procesamiento y limpieza. Un salón parroquial, centro comunitario o cocina comercial funciona bien.",
        "hours": 2,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Aprendan métodos seguros de conservación",
        "description": "Hagan que sus líderes estudien métodos probados, basados en investigación, de una fuente reconocida (como un servicio de extensión universitaria). El enlatado incorrecto puede causar enfermedades graves, así que sigan siempre recetas y tiempos de procesamiento probados al pie de la letra.",
        "hours": 4,
        "skills": [
          "seguridad alimentaria",
          "cocina"
        ]
      },
      {
        "name": "Reúnan equipo y frascos",
        "description": "Consigan enlatadoras de baño de agua y/o de presión, frascos, tapas y herramientas por donación o un pequeño presupuesto. Verifiquen que las enlatadoras de presión estén en condiciones seguras de funcionamiento.",
        "hours": 3,
        "skills": [
          "difusión",
          "conducir"
        ]
      },
      {
        "name": "Consigan productos",
        "description": "Traigan excedente de temporada de espigueo, huertos, granjas o compras al por mayor. Programen las sesiones para cuando los productos abunden y sean baratos.",
        "hours": 2,
        "recurringCadence": "cycle",
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Planeen sesiones grupales de enlatado",
        "description": "Elijan recetas adecuadas a los productos y al nivel del grupo, y organicen estaciones para que el trabajo fluya con seguridad y eficiencia.",
        "hours": 2,
        "recurringCadence": "session",
        "skills": [
          "cocina",
          "organización"
        ],
        "follows": [
          1,
          3
        ]
      },
      {
        "name": "Enseñen y conduzcan sesiones con seguridad",
        "description": "Guíen al grupo por el proceso, haciendo cumplir el manejo seguro, los tiempos correctos de procesamiento y el sellado adecuado. Háganlo una sesión de enseñanza para que las habilidades se difundan.",
        "hours": 4,
        "skills": [
          "cocina",
          "enseñanza"
        ],
        "follows": [
          0,
          2,
          4
        ],
        "recurringCadence": "session"
      },
      {
        "name": "Compartan los alimentos conservados y registren",
        "description": "Repartan los productos conservados entre participantes y proyectos como el refrigerador o la despensa. Etiqueten cada frasco con contenido y fecha, y anoten qué funcionó para la próxima.",
        "hours": 1,
        "recurringCadence": "session",
        "skills": [
          "organización"
        ],
        "follows": [
          5
        ]
      }
    ]
  },
  {
    "id": "free-haircut",
    "name": "Días de corte de pelo y arreglo personal gratis",
    "purpose": "Ofrecer cortes de pelo y arreglo personal gratis para devolver dignidad, confianza y un nuevo comienzo.",
    "whoItServes": "Vecinas y vecinos sin techo, personas buscando empleo, familias de bajos ingresos y personas mayores.",
    "whatYoullNeed": "Estilistas y barberas y barberos licenciados voluntarios, un espacio, materiales y sanitización.",
    "setupHours": 10,
    "defaultCategory": "skilled_labor",
    "suggestsWorkDays": true,
    "firstSteps": "Empieza con dos conversaciones: una con una estilista o barbero con licencia dispuesto a traer a un colega, y otra con las personas a las que quieres servir — un albergue, un centro de día o un programa de empleo te dirán qué días y qué ambiente les resultarían cómodos de verdad. Cuando un profesional y un sitio anfitrión digan que sí, lo demás es cuestión de materiales y agenda.",
    "commonPitfalls": "Este proyecto tropieza cuando se siente como fila de caridad y no como salón — cortes apurados, sin poder elegir el estilo, cámaras afuera para las redes. Pregunta a cada persona qué quiere, deja las fotos salvo que ella las ofrezca, y nunca permitas que alguien sin licencia corte por estirar la capacidad; un solo problema de higiene puede acabar con todo el programa.",
    "pairsWith": [
      "laundry-shower-access",
      "reentry-support"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Convoquen estilistas y barberas y barberos licenciados",
        "description": "Busquen profesionales dispuestos a voluntariar sus habilidades. Las personas licenciadas garantizan un servicio seguro, de calidad y con la sanitización adecuada.",
        "hours": 2.5,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Encuentren un espacio con condiciones de sanitización",
        "description": "Aseguren un lugar con acceso a agua, buena iluminación y superficies lavables — un centro comunitario, una peluquería fuera de horario o un sitio de fe.",
        "hours": 1.5,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Consigan equipo y materiales",
        "description": "Reúnan máquinas, tijeras, capas, peines, espejos y desechables. Incluyan extras de arreglo personal como rasuradoras y artículos de aseo para llevar a casa.",
        "hours": 2,
        "skills": [
          "difusión",
          "conducir"
        ]
      },
      {
        "name": "Armen sanitización y cumplimiento de licencias",
        "description": "Establezcan la esterilización de herramientas entre clientes y cumplan las reglas locales para ofrecer cortes al público. La limpieza protege a todas las personas.",
        "hours": 1.5,
        "skills": [
          "trámites"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Conduzcan los días de arreglo personal",
        "description": "Hagan el evento, mantengan un ambiente cálido y respetuoso, y traten a cada persona como invitada valorada y no como receptora de caridad.",
        "hours": 2.5,
        "skills": [
          "organización"
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
    "name": "Cuadrilla de mudanzas de apoyo mutuo",
    "purpose": "Ayudar a mudarse a quienes no pueden pagar una mudanza — personas saliendo de situaciones inseguras, enfrentando desalojo o reduciendo su espacio.",
    "whoItServes": "Vecinas y vecinos de bajos ingresos, personas huyendo de hogares inseguros, personas mayores y vecinas y vecinos con discapacidad.",
    "whatYoullNeed": "Personas voluntarias con vehículos y fuerza, materiales de mudanza y prácticas claras de seguridad. Para quien deja una situación insegura, mantengan la nueva dirección, las fechas y los detalles en estricta confidencialidad, y sigan las decisiones de esa persona sobre los tiempos y su seguridad.",
    "setupHours": 14,
    "defaultCategory": "transport",
    "suggestsWorkDays": true,
    "firstSteps": "Antes de conseguir un solo camión, habla con quienes ya reciben estas llamadas — defensoras de sobrevivientes de violencia doméstica, organizadores de inquilinos, servicios para personas mayores — sobre cómo deberían llegarte las solicitudes y qué confidencialidad van a esperar, porque algunas mudanzas son de alguien saliendo de un hogar inseguro. Luego junta a tres o cuatro personas voluntarias con fuerza y un vehículo, y dimensionen juntas la primera mudanza pequeña.",
    "commonPitfalls": "Las cuadrillas se lastiman o se queman rápido: un trabajo demasiado ambicioso con pocas manos, alguien levantando mal, una dirección compartida en un chat grupal que nunca debió salir del teléfono de quien coordina. Mantén las mudanzas dentro de los límites que fijaron, y trata los detalles de cada mudanza delicada como si pudieran poner a alguien en peligro — porque pueden.",
    "pairsWith": [
      "tenant-union",
      "free-store"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Convoquen una cuadrilla y vehículos",
        "description": "Reúnan personas voluntarias capaces de levantar y cargar con seguridad, más acceso a camionetas o vans. Mantengan un listado con disponibilidad para armar una cuadrilla rápido.",
        "hours": 2.5,
        "skills": [
          "difusión",
          "conducir"
        ]
      },
      {
        "name": "Reúnan materiales de mudanza",
        "description": "Consigan carretillas, correas para muebles, cobertores de mudanza y cajas reutilizables por donación. Los materiales compartidos hacen las mudanzas más rápidas y seguras.",
        "hours": 1.5,
        "skills": [
          "conducir"
        ]
      },
      {
        "name": "Construyan un sistema de solicitud y evaluación",
        "description": "Creen una forma de pedir ayuda y dimensionar cada mudanza: cuánto, escaleras o ascensor, distancia y tiempos. Esto les permite planear el tamaño de la cuadrilla y el equipo.",
        "hours": 2,
        "skills": [
          "organización"
        ]
      },
      {
        "name": "Resuelvan seguridad y responsabilidad",
        "description": "Capaciten a las personas voluntarias en levantamiento seguro, usen renuncias simples y revisen el seguro de cualquier vehículo usado. Proteger a voluntarias y voluntarios y a las personas atendidas importa.",
        "hours": 2,
        "skills": [
          "trámites"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Definan agenda y despacho",
        "description": "Asignen solicitudes a cuadrillas disponibles y confirmen con todas las personas el día anterior. Mantengan una lista de respaldo, ya que las mudanzas no se pueden posponer fácilmente.",
        "hours": 1.5,
        "skills": [
          "organización"
        ],
        "follows": [
          0,
          2
        ]
      },
      {
        "name": "Definan alcance y límites",
        "description": "Decidan qué van a manejar y qué no (nada de materiales peligrosos, pianos o trabajos que superen la capacidad segura de la cuadrilla). Deriven esos casos a otro lado.",
        "hours": 1,
        "skills": [
          "redacción"
        ]
      },
      {
        "name": "Realicen mudanzas y den seguimiento",
        "description": "Lleven adelante la mudanza con seguridad y respeto, luego confirmen que la persona esté instalada. Conéctenla con otros proyectos (tienda gratis, comité de bienvenida) según haga falta.",
        "hours": 3.5,
        "skills": [
          "conducir"
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
    "name": "Red de apoyo a la discapacidad y la accesibilidad",
    "purpose": "Organizar a vecinas y vecinos con discapacidad y aliadas y aliados para el apoyo mutuo, la accesibilidad y la incidencia — dirigida por las propias personas con discapacidad.",
    "whoItServes": "Vecinas y vecinos con discapacidad y enfermedades crónicas.",
    "whatYoullNeed": "Un sistema de comunicación accesible, liderazgos pares y un directorio de recursos. El apoyo entre pares complementa la atención profesional — deriven las preguntas médicas, de cuidado personal y legales a profesionales calificados, y traten la información de salud de las personas integrantes como privada.",
    "setupHours": 24,
    "defaultCategory": "organizing",
    "firstSteps": "Esta red solo funciona si las vecinas y vecinos con discapacidad están en la mesa desde la primerísima conversación — no consultados después, sino decidiendo qué es. Empieza pidiendo a dos o tres personas con discapacidad que conozcas que la cofunden contigo (o, si tú misma vives con discapacidad, que compartan la carga), y deja que sus necesidades de acceso definan cómo se hace la primera reunión: formato, lugar y ritmo incluidos.",
    "commonPitfalls": "El fracaso clásico es que personas aliadas bienintencionadas construyan un programa para la gente con discapacidad que nadie pidió, en formatos que no pueden usar. El más silencioso es irse convirtiendo en un servicio informal de cuidados: el apoyo entre pares no puede sustituir con seguridad la atención médica ni el cuidado personal, así que sigue derivando esas necesidades a profesionales calificados y cuida la información de salud como lo privado que es.",
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
        "name": "Centren el liderazgo de personas con discapacidad",
        "description": "Aseguren que las personas con discapacidad lideren y den forma a la red. \"Nada sobre nosotras y nosotros sin nosotras y nosotros\" es el principio central — las personas aliadas apoyan, no dirigen.",
        "hours": 3,
        "skills": [
          "facilitación"
        ]
      },
      {
        "name": "Armen un sistema de comunicación accesible",
        "description": "Ofrezcan múltiples formas de participar (teléfono, mensaje, en línea, en persona), usen lenguaje claro y aseguren que los materiales funcionen con lectores de pantalla y necesidades diversas.",
        "hours": 3,
        "skills": [
          "accesibilidad",
          "soporte técnico"
        ]
      },
      {
        "name": "Mapeen necesidades y recursos",
        "description": "Conozcan lo que las personas miembro necesitan y cataloguen recursos locales: transporte accesible, fuentes de equipo, servicios y ayuda con prestaciones. Identifiquen los vacíos más grandes.",
        "hours": 5,
        "skills": [
          "difusión",
          "captura de datos"
        ]
      },
      {
        "name": "Armen un intercambio de apoyo mutuo",
        "description": "Creen una forma para que las personas miembro den y reciban ayuda — mandados, compañía para citas como apoyo de incidencia, llamadas de seguimiento — ajustada a la capacidad y la necesidad.",
        "hours": 3,
        "skills": [
          "organización"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Creen un fondo de préstamo de equipos",
        "description": "Reúnan y presten ayudas de movilidad y equipo de asistencia, sanitizado entre usos. Muchos dispositivos quedan sin uso después de quedarse cortos o ya no ser necesarios.",
        "hours": 4,
        "skills": [
          "difusión",
          "organización"
        ]
      },
      {
        "name": "Ofrezcan apoyo de incidencia y navegación",
        "description": "Ayuden a las personas miembro a navegar prestaciones, adaptaciones y servicios. Compartan información y acompañamiento, y deriven preguntas legales y médicas a profesionales calificados.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "trámites"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Fijen estándares de accesibilidad para todos los eventos del programa",
        "description": "Desarrollen una lista de verificación (acceso al lugar, asientos, interpretación, necesidades sensoriales, materiales) para que cada proyecto del programa más amplio reciba bien a las personas con discapacidad.",
        "hours": 3,
        "skills": [
          "accesibilidad",
          "redacción"
        ]
      }
    ]
  },
  {
    "id": "books-to-prisoners",
    "name": "Libros para personas encarceladas y programa de cartas",
    "purpose": "Enviar libros y cartas gratis a personas encarceladas para reducir el aislamiento y apoyar el aprendizaje.",
    "whoItServes": "Personas encarceladas y, a través de ellas, sus familias y comunidades.",
    "whatYoullNeed": "Libros donados, personas voluntarias, franqueo y conocimiento de las reglas de correo de cada institución. Las reglas de correo de cada institución son estrictas y distintas — los paquetes que las incumplen son rechazados, así que síganlas al pie de la letra, y que las personas voluntarias usen siempre la dirección del programa, nunca la de su casa.",
    "setupHours": 21,
    "defaultCategory": "education",
    "suggestsWorkDays": true,
    "firstSteps": "Antes de recolectar un solo libro, llama a un grupo establecido de libros para personas encarceladas — la mayoría comparte con gusto qué instituciones cubren, qué reglas hacen tropezar a la gente y dónde quedan solicitudes sin respuesta. Luego consigue por escrito la política de correo vigente de la una o dos instituciones con las que van a empezar; lo que las personas encarceladas realmente piden debería definir el acervo, no lo que las donantes limpien de sus estantes.",
    "commonPitfalls": "Este proyecto muere por paquetes rechazados: un libro usado donde solo aceptan nuevos, una pasta dura, una regla de etiquetado olvidada — franqueo desperdiciado y el paquete tan esperado de alguien devuelto. También puede lastimar a las personas voluntarias que escriben desde su casa; toda carta sale con la dirección del programa, sin excepciones, por más cálida que se vuelva la correspondencia.",
    "pairsWith": [
      "reentry-support",
      "free-little-library"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Aprendan las reglas de correo de cada institución",
        "description": "Cada prisión tiene reglas estrictas y específicas — muchas exigen que los libros sean nuevos y vengan directo de una editorial o tienda aprobada, con límites de contenido y cantidad. Investiguen con cuidado, porque el correo que rompe reglas se rechaza.",
        "hours": 5,
        "skills": [
          "trámites"
        ]
      },
      {
        "name": "Reúnan libros y un espacio de trabajo",
        "description": "Recolecten libros donados (dentro de las reglas de las instituciones) y armen un área de clasificación y empaque. Mantengan variedad: diccionarios, educación, ficción y recursos de reingreso suelen ser los más pedidos.",
        "hours": 4,
        "skills": [
          "difusión",
          "conducir"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Armen un sistema para manejar solicitudes",
        "description": "Creen un proceso para recibir y rastrear solicitudes de personas encarceladas, que escriben pidiendo temas o títulos. Hagan coincidir las solicitudes con los libros disponibles.",
        "hours": 3,
        "skills": [
          "captura de datos",
          "organización"
        ]
      },
      {
        "name": "Convoquen y capaciten a personas voluntarias",
        "description": "Capaciten a las personas voluntarias para hacer coincidir solicitudes, empacar dentro de las reglas de cada institución y escribir notas cuidadas. La exactitud en las reglas evita franqueo desperdiciado y paquetes rechazados.",
        "hours": 3,
        "skills": [
          "difusión",
          "enseñanza"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Cubran franqueo y logística",
        "description": "El franqueo es el principal costo continuo. Recauden para él, usen el envío más barato que cumpla las reglas y organicen días regulares de envío.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Organicen un programa de correspondencia",
        "description": "Empareje a personas voluntarias como pen-pals donde se quiera, con pautas claras de seguridad y privacidad (usen la dirección del programa, no las personales). La conexión importa tanto como los libros.",
        "hours": 3,
        "skills": [
          "redacción"
        ]
      }
    ]
  },
  {
    "id": "community-music",
    "name": "Programa comunitario de música e instrumentos",
    "purpose": "Prestar instrumentos y ofrecer clases y jam sessions gratis para que la música sea accesible a todas las personas.",
    "whoItServes": "Niñas, niños y personas adultas que no pueden pagar instrumentos o clases.",
    "whatYoullNeed": "Instrumentos donados, docentes voluntarias y voluntarios, un espacio y un sistema de préstamo.",
    "setupHours": 15,
    "defaultCategory": "education",
    "firstSteps": "Empieza con las músicas y músicos que ya tienes cerca — la guitarrista de la iglesia de la esquina, el director de banda jubilado, las y los adolescentes que tocan — y pregúntales qué les gustaría enseñar y cuándo. Una conversación con una tienda de música sobre reparaciones con descuento, y otra con un espacio que tolere el ruido, y ya recorriste la mayor parte del camino hacia la primera jam.",
    "commonPitfalls": "El fondo de préstamo se vacía en silencio cuando los instrumentos salen más rápido de lo que vuelven en condiciones de tocarse, así que presupuesta tiempo de reparación desde el inicio y mantén una política de devolución flexible pero real. Y cuida que las clases no se inclinen hacia quienes ya tocan con confianza: la niña que nunca ha tocado un instrumento necesita la bienvenida más cálida, no el espacio más corto.",
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
        "name": "Recolecten y reparen instrumentos",
        "description": "Reúnan instrumentos donados y hagan que se limpien, encuerden o reparen para que se puedan tocar. Armen una mezcla de tipos y niveles de habilidad.",
        "hours": 5,
        "skills": [
          "reparación",
          "conducir"
        ]
      },
      {
        "name": "Armen un sistema de préstamo de instrumentos",
        "description": "Creen un sistema de salida que rastree quién tiene qué, con instrucciones de cuidado y una política de devolución flexible. Numeren y registren cada instrumento.",
        "hours": 2,
        "skills": [
          "captura de datos"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Convoquen docentes voluntarias y voluntarios",
        "description": "Busquen músicas y músicos dispuestas a enseñar con paciencia a principiantes. No necesitan ser profesionales — entusiasmo y habilidad básica alcanzan mucho.",
        "hours": 3,
        "skills": [
          "difusión",
          "música"
        ]
      },
      {
        "name": "Encuentren un espacio para clases y jams",
        "description": "Aseguren una sala donde el ruido no sea problema — un centro comunitario, escuela o salón de fe. Fijen horarios predecibles para clases y tocadas abiertas.",
        "hours": 2,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Agenden clases y jam sessions",
        "description": "Ofrezcan clases para principiantes y jams abiertas para todos los niveles. Mantengan la inscripción sencilla y horarios variados para quienes trabajan o estudian.",
        "hours": 2,
        "recurringCadence": "session",
        "skills": [
          "organización"
        ],
        "follows": [
          2,
          3
        ]
      },
      {
        "name": "Fijen expectativas de cuidado y devolución",
        "description": "Enseñen a quienes piden prestado el cuidado básico del instrumento y qué hacer si algo se rompe. Mantengan algo basado en la confianza y de apoyo, no punitivo.",
        "hours": 1,
        "skills": [
          "redacción"
        ],
        "follows": [
          1
        ]
      }
    ]
  },
  {
    "id": "school-supply-program",
    "name": "Programa de útiles escolares y mochilas",
    "purpose": "Brindar útiles escolares y mochilas gratis para que las niñas y los niños empiecen el año listos y con confianza.",
    "whoItServes": "Familias de bajos ingresos con niñas y niños en edad escolar.",
    "whatYoullNeed": "Donaciones de útiles o fondos, almacenamiento, un punto de distribución y personas voluntarias.",
    "setupHours": 10,
    "defaultCategory": "mutual_aid_drive",
    "suggestsWorkDays": true,
    "firstSteps": "Tu primera conversación es con una escuela — una consejera, un enlace con familias o una coordinadora de madres y padres que conozca las listas reales de útiles y qué familias se quedan sin ellos en silencio. Deja que definan qué recolectas y cómo se enteran las familias; una entrega que pasa por gente en la que las madres y los padres ya confían llega a niñas y niños a los que un volante nunca llegará.",
    "commonPitfalls": "El fracaso predecible es una montaña de fólders donados y ni uno de los cuadernos que las listas sí piden — juntar lo fácil de dar en vez de lo que hace falta. El que duele es una entrega que se siente como examen de pobreza; sáltate el papeleo de ingresos, deja que cada niña y niño elija su mochila, y nadie se va sintiéndose inspeccionado.",
    "pairsWith": [
      "youth-mentorship",
      "toy-library"
    ],
    "tasks": [
      {
        "name": "Consigan las listas de útiles y midan la necesidad",
        "description": "Aliense con escuelas locales para conocer las listas reales de útiles por grado y estimen cuántas familias necesitan ayuda. Esto mantiene las donaciones relevantes.",
        "hours": 1.5,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Hagan colectas y compras al por mayor",
        "description": "Combinen colectas de donación con compras al por mayor de los artículos más necesarios. La compra al por mayor estira el dinero al máximo en básicos como cuadernos y lápices.",
        "hours": 3,
        "recurringCadence": "cycle",
        "skills": [
          "difusión",
          "conducir"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Clasifiquen y armen por grado",
        "description": "Organicen los útiles y armen mochilas según la lista de cada grado. Una sesión de empaque tipo línea de armado con personas voluntarias avanza rápido.",
        "hours": 2,
        "skills": [
          "organización"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Armen almacenamiento y un punto de distribución",
        "description": "Aseguren un almacenamiento seco y un lugar acogedor para entregar las mochilas, a menudo en una escuela, centro comunitario o junto a otro evento de regreso a clases.",
        "hours": 1.5,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Agenden y cubran la distribución",
        "description": "Hagan la entrega antes del inicio de clases, con personas voluntarias amables. Dejen que las niñas y los niños elijan mochila cuando se pueda — elegir agrega dignidad.",
        "hours": 2,
        "skills": [
          "organización"
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
    "name": "Clínica de ayuda legal y programa Conoce tus derechos",
    "purpose": "Conectar a vecinas y vecinos con ayuda legal gratuita y enseñarles sus derechos.",
    "whoItServes": "Cualquier persona que enfrente problemas legales sin medios — temas de vivienda, migración, deudas, familia o prestaciones.",
    "whatYoullNeed": "Abogadas y abogados y estudiantes de derecho voluntarias y voluntarios, un espacio, organizaciones aliadas de ayuda legal y agendamiento. El consejo legal individual debe venir de abogadas y abogados calificados y con licencia (o de estudiantes de derecho supervisadas y supervisados) — este programa organiza el acceso y comparte información general sobre derechos, no es en sí mismo una fuente de consejo legal.",
    "setupHours": 26,
    "defaultCategory": "other",
    "suggestsWorkDays": true,
    "firstSteps": "Aquí nada arranca antes de tener abogadas y abogados: tus primeras llamadas son a la oficina local de ayuda legal, al programa pro bono del colegio de abogados y a una clínica de facultad de derecho, preguntando qué necesitarían para presentarse — y qué vacíos podría llenar de verdad una clínica de barrio. Deja que esas alianzas definan contigo el alcance de la clínica antes de anunciar nada al vecindario.",
    "commonPitfalls": "El fracaso peligroso es que una persona voluntaria con buenas intenciones pase de la información al consejo — un \"tú fírmalo y ya\" bienintencionado puede arruinar el caso de alguien, así que mantén esa línea clara y ensayada. El más lento es una admisión que rebasa a las abogadas y abogados: una lista de espera de gente desesperada sin abogado en la sala rompe la confianza más rápido que nunca haber abierto.",
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
        "name": "Aliense con abogadas y abogados y ayuda legal",
        "description": "Convoquen abogadas y abogados con licencia, o estudiantes de derecho supervisadas y supervisados por abogadas y abogados, para que den el consejo legal real. Construyan vínculos de derivación con organizaciones de ayuda legal establecidas.",
        "hours": 6,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Definan alcance y rutas de derivación",
        "description": "Decidan qué temas puede atender la clínica y fijen rutas claras para derivar casos complejos o especializados. Sean transparentes sobre lo que la clínica puede y no puede hacer.",
        "hours": 3,
        "skills": [
          "redacción"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Armen un espacio y una admisión",
        "description": "Aseguren un lugar privado y confidencial y creen una admisión con una lista de documentos para que las abogadas y los abogados aprovechen bien el tiempo limitado.",
        "hours": 3,
        "skills": [
          "organización"
        ]
      },
      {
        "name": "Armen un sistema confidencial de citas",
        "description": "Creen citas que protejan la privacidad. Los asuntos legales son delicados, así que cuiden con esmero la información de las personas durante todo el proceso.",
        "hours": 3,
        "skills": [
          "organización",
          "captura de datos"
        ]
      },
      {
        "name": "Desarrollen materiales y talleres de Conoce tus derechos",
        "description": "Creen guías claras y precisas y dicten talleres sobre derechos comunes (inquilinas e inquilinos, trabajadoras y trabajadores, migración, encuentros con autoridades). Enmárquenlos como información general, no como consejo legal individual.",
        "hours": 5,
        "recurringCadence": "event",
        "skills": [
          "redacción",
          "enseñanza"
        ]
      },
      {
        "name": "Promuevan y agenden clínicas",
        "description": "Fijen fechas recurrentes de clínica y difundan a través de organizaciones aliadas y del programa más amplio de apoyo mutuo. Ofrezcan interpretación para personas que no hablan inglés.",
        "hours": 3,
        "skills": [
          "difusión",
          "traducción"
        ],
        "follows": [
          0,
          3
        ]
      },
      {
        "name": "Protejan la confidencialidad y revisen conflictos",
        "description": "Establezcan confidencialidad estricta y una revisión básica de conflictos de interés para que ninguna persona voluntaria aconseje a partes opuestas. Capaciten a todas las personas en estas obligaciones.",
        "hours": 3,
        "skills": [
          "trámites"
        ]
      }
    ]
  },
  {
    "id": "resource-hub-dispatch",
    "name": "Centro de recursos de apoyo mutuo y despacho",
    "purpose": "Funcionar como columna vertebral de coordinación — un punto único donde se hacen coincidir necesidades y ofrecimientos entre todos los proyectos del programa.",
    "whoItServes": "Todas las personas del programa — quienes buscan ayuda, quienes la ofrecen y quienes lideran proyectos y necesitan coordinación.",
    "whatYoullNeed": "Un sistema de admisión, un listado de personas voluntarias y recursos, personas coordinadoras y un directorio maestro. El centro guarda información sensible sobre la vida de vecinas y vecinos — recojan solo lo necesario, cuídenla bien y compartan los detalles únicamente con quienes los necesitan para ayudar.",
    "setupHours": 27,
    "defaultCategory": "organizing",
    "firstSteps": "El centro coordina proyectos, así que empieza sentándote con quien lidera cada uno: qué solicitudes reciben, qué quisieran poder derivar y cómo quieren recibir los emparejamientos. Acuerden juntas una sola admisión y una base común de privacidad — un centro impuesto a los proyectos termina siendo rodeado; uno construido con ellos se vuelve la puerta de entrada.",
    "commonPitfalls": "Los centros mueren de dos formas: la admisión se llena de solicitudes que nadie sigue hasta el final, y se corre la voz de que llamar no sirve de nada; o una coordinadora heroica sostiene todos los hilos hasta quemarse y el programa entero pierde la memoria. Da seguimiento a cada solicitud hasta un cierre real, rota los turnos desde temprano y recoge menos información de la que crees necesitar.",
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
        "name": "Armen una única admisión para necesidades y ofrecimientos",
        "description": "Creen una puerta de entrada fácil — una línea telefónica, un formulario y una opción en persona — donde cualquiera pueda decir qué necesita o qué puede dar. Un solo punto de entrada evita que la gente se quede afuera.",
        "hours": 4,
        "skills": [
          "organización",
          "soporte técnico"
        ]
      },
      {
        "name": "Armen un listado de personas voluntarias y recursos",
        "description": "Mantengan una lista actualizada de personas voluntarias (habilidades, disponibilidad, ubicación) y lo que cada proyecto puede ofrecer, para que las solicitudes se asignen rápido.",
        "hours": 4,
        "skills": [
          "captura de datos"
        ]
      },
      {
        "name": "Creen un proceso de emparejamiento y despacho",
        "description": "Definan cómo una solicitud se enruta al proyecto o a la persona voluntaria adecuada y con qué rapidez. Fijen metas de tiempo de respuesta y cómo se rastrean las solicitudes hasta completarse.",
        "hours": 4,
        "skills": [
          "organización"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Mantengan un directorio maestro de recursos",
        "description": "Lleven un directorio vivo de todos los proyectos más servicios externos (refugios, clínicas, comida, ayuda legal) para que el centro pueda enrutar a la gente donde sea que exista la ayuda.",
        "hours": 5,
        "recurringCadence": "month",
        "skills": [
          "captura de datos"
        ]
      },
      {
        "name": "Convoquen y capaciten personas coordinadoras",
        "description": "Armen un equipo para cubrir turnos rotativos de despacho para que el centro siga respondiendo sin desgastar a nadie. Capacítenlas en el proceso y el directorio.",
        "hours": 3,
        "skills": [
          "difusión",
          "enseñanza"
        ],
        "follows": [
          2,
          3
        ]
      },
      {
        "name": "Fijen prácticas de privacidad de datos y seguimiento",
        "description": "Decidan qué información recogen, cómo se almacena y protege, y cómo confirman que una necesidad fue realmente atendida. Recojan lo mínimo y cuídenlo con esmero.",
        "hours": 4,
        "skills": [
          "redacción"
        ]
      },
      {
        "name": "Registren necesidades no atendidas y brechas",
        "description": "Anoten las solicitudes que no pudieron cubrir. Las brechas recurrentes revelan dónde el programa debería arrancar su próximo proyecto — convirtiendo al centro en una herramienta de planeación, no solo una central de despacho.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "captura de datos"
        ]
      }
    ]
  },
  {
    "id": "harm-reduction-supplies",
    "name": "Distribución de insumos de reducción de daños",
    "purpose": "Poner naloxona, tiras reactivas e insumos de uso más seguro en manos de quienes puedan necesitarlos — encontrando a las vecinas y vecinos donde están, sin juicios.",
    "whoItServes": "Personas que usan drogas, sus amistades y familias, y cualquiera que pueda presenciar una sobredosis — que, en la mayoría de los barrios, es cualquiera.",
    "whatYoullNeed": "Capacitación en respuesta a sobredosis, una fuente de naloxona (programa estatal, farmacia u organización aliada), insumos para los kits y un pequeño equipo de distribución. Repartir insumos no es atención médica — toda persona que distribuya debe completar primero una capacitación en respuesta a sobredosis, y la ley sobre lo que puedes portar (tiras reactivas, jeringas) varía mucho según el lugar, así que confirma la tuya antes de abastecer nada. Incluye líneas locales de crisis y de tratamiento impresas en cada kit.",
    "setupHours": 20,
    "defaultCategory": "other",
    "suggestsWorkDays": true,
    "firstSteps": "Todavía no compres nada: tu primer paso es una conversación con el programa de reducción de daños establecido más cercano y con las personas que realmente usan estos insumos — te dirán qué hace falta, qué ya está cubierto y cómo llegar sin juicios. Haz que tu equipo base complete la capacitación en respuesta a sobredosis y confirma la ley local sobre tiras y jeringas antes de empacar un solo kit.",
    "commonPitfalls": "Esto sale mal cuando llegan como extraños — repartiendo donde no tienen relaciones, o sumando sermones y condiciones que enseñan a la gente a evitarlos — y cuando se adelantan a la ley o a su capacitación, lo que puede costarle a una persona voluntaria un cargo por parafernalia. Aquí, ir despacio y acompañados le gana siempre a ir rápido y solos.",
    "pairsWith": [
      "community-first-aid-training",
      "mental-health-peer-support"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Capacítense y encuentren una organización aliada de reducción de daños",
        "description": "Pidan a su equipo base que complete una capacitación en respuesta a sobredosis y uso de naloxona — muchos departamentos de salud y organizaciones de reducción de daños las ofrecen gratis. Alíense con un programa establecido; ya resolvieron problemas de suministro, legales y de confianza que ustedes no necesitan volver a resolver.",
        "hours": 4,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Revisa la ley local sobre insumos",
        "description": "El acceso a la naloxona está protegido casi en todas partes, pero las tiras reactivas y las jeringas todavía se clasifican como parafernalia en algunos lugares. Averigua exactamente qué puedes portar y entregar legalmente — tu organización aliada o una clínica de ayuda legal te lo dirá rápido. Déjalo por escrito para las personas voluntarias.",
        "hours": 3,
        "skills": [
          "investigación"
        ]
      },
      {
        "name": "Consigue naloxona e insumos para los kits",
        "description": "Pide naloxona a través de un programa estatal de distribución, una orden permanente de farmacia o tu organización aliada. Añade lo demás que sea legal donde estás: tiras reactivas de fentanilo y xilacina, material para cuidado de heridas, artículos de higiene.",
        "hours": 4,
        "follows": [
          1
        ]
      },
      {
        "name": "Armen kits con instrucciones en lenguaje sencillo",
        "description": "Empaquen los kits con instrucciones simples y multilingües: cómo reconocer una sobredosis, cómo administrar naloxona, llamar a los servicios de emergencia, nunca usar en soledad. Incluyan líneas locales de crisis y de tratamiento en cada kit. El armado avanza rápido con una mesa llena de gente.",
        "hours": 3,
        "skills": [
          "traducción"
        ],
        "follows": [
          2
        ],
        "recurringCadence": "cycle"
      },
      {
        "name": "Establece rondas de distribución y puntos fijos",
        "description": "Planea rondas regulares a pie o en auto por los lugares donde la gente realmente está, y pide a bares, tienditas, bibliotecas y locales que mantengan una caja sin preguntas. La barrera baja es todo el punto — sin formularios, sin sermones.",
        "hours": 4,
        "skills": [
          "difusión",
          "conducir"
        ]
      },
      {
        "name": "Reabastece, lleva registro y mantén fresca la capacitación",
        "description": "Anota qué se acaba y qué se queda, registra las fechas de caducidad de la naloxona y organiza capacitaciones de repaso cuando se sumen nuevas personas voluntarias. Si un kit revierte una sobredosis, vale la pena registrarlo (con delicadeza).",
        "hours": 2,
        "recurringCadence": "month"
      }
    ]
  },
  {
    "id": "court-support",
    "name": "Apoyo y acompañamiento en cortes",
    "purpose": "Asegurar que nadie del barrio enfrente una fecha en corte en soledad — compañía en la sala, un aventón para llegar, cuidado infantil durante la audiencia y cartas de apoyo cuando la defensa las pida.",
    "whoItServes": "Vecinas y vecinos con audiencias penales, migratorias, de desalojo o de familia, y sus familias — llegar a la corte sin compañía puede costar empleos, cuidado infantil y esperanza.",
    "whatYoullNeed": "Personas voluntarias confiables, un calendario de audiencias y vínculos con las defensorías públicas. El apoyo en cortes es presencia y logística, no asesoría legal — las personas voluntarias nunca opinan sobre el caso y siempre siguen la pauta del abogado o abogada de la propia persona. Las salas de audiencia tienen reglas de conducta estrictas, así que quien asista debe conocerlas al dedillo.",
    "setupHours": 16,
    "defaultCategory": "other",
    "firstSteps": "Empieza con las personas dueñas de esas fechas: el apoyo solo ocurre por invitación de quien enfrenta la corte, y en sintonía con su abogada o abogado. Preséntense primero ante la defensoría pública y los grupos de observación de cortes o fondos de fianza que ya estén en el juzgado, y deja que ellos te digan qué audiencias necesitan compañía y cómo ser útiles sin tocar jamás el lado legal.",
    "commonPitfalls": "El daño aquí viene de actuar por cuenta propia: una voluntaria \"explicando\" un acuerdo en el pasillo, detalles del caso comentados donde un fiscal puede oír, una reacción visible desde la galería que irrite al juez — cualquiera puede perjudicar justo a la persona por la que vinieron. El fracaso más silencioso es la logística: una fecha sin confirmar o un aventón que falla puede significar una audiencia perdida y una orden de arresto.",
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
        "name": "Conecten con defensorías y grupos de corte existentes",
        "description": "Preséntense ante la defensoría pública, la ayuda legal migratoria y cualquier grupo de observación de cortes o fondo de fianzas que ya esté trabajando. Ellos les dirán dónde hace más falta el apoyo y cómo sumarse sin estorbar.",
        "hours": 3,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Escribe las reglas base: apoyo, no derecho",
        "description": "Ponlo por escrito: las personas voluntarias nunca dan asesoría legal, nunca comentan detalles del caso en las áreas públicas del juzgado y siempre se remiten al abogado o abogada de la propia persona. Añade la conducta en sala — llegar temprano, vestir sencillo, teléfonos apagados, sin reacciones desde la galería.",
        "hours": 2,
        "skills": [
          "redacción"
        ]
      },
      {
        "name": "Arma una recepción de solicitudes y un calendario de audiencias",
        "description": "Crea una forma sencilla de pedir apoyo y un calendario compartido con fechas, salas y lo que cada persona necesita — compañía, un aventón, cuidado infantil, o las tres cosas. Las fechas de corte cambian todo el tiempo, así que confirma el día anterior.",
        "hours": 3,
        "skills": [
          "organización"
        ]
      },
      {
        "name": "Capacita a las personas voluntarias de acompañamiento",
        "description": "Recorre con ellas una visita al juzgado: el control de seguridad, encontrar la sala, dónde sentarse y cómo simplemente ser compañía serena y cálida durante una espera estresante. Empareja a cada persona nueva con alguien con experiencia para su primera fecha.",
        "hours": 3,
        "skills": [
          "enseñanza"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Coordina aventones y cuidado infantil para las audiencias",
        "description": "Consigue conductores para las mañanas de corte y parejas de cuidado que atiendan a niñas y niños durante las audiencias — muchas salas no permiten menores, y una audiencia perdida por falta de cuidado infantil puede significar una orden de arresto.",
        "hours": 3,
        "skills": [
          "conducir",
          "cuidado infantil"
        ],
        "recurringCadence": "event"
      },
      {
        "name": "Organiza cartas de apoyo cuando la defensa las pida",
        "description": "Cuando el abogado o abogada de alguien solicite cartas de carácter o de apoyo comunitario, coordina a vecinas y vecinos para escribirlas — siguiendo al pie de la letra la pauta de la defensa sobre contenido, tono y plazo.",
        "hours": 2,
        "skills": [
          "redacción"
        ]
      }
    ]
  },
  {
    "id": "cooling-warming-center",
    "name": "Centro emergente de enfriamiento y abrigo",
    "purpose": "Abrir un refugio climático del barrio — una sala fresca en una ola de calor, una cálida en una helada — listo antes de que el clima se vuelva peligroso, no después.",
    "whoItServes": "Personas mayores, vecinas y vecinos sin techo, gente sin aire acondicionado o calefacción que funcione, quienes trabajan a la intemperie y cualquiera cuya vivienda no aguante el clima.",
    "whatYoullNeed": "Un sitio anfitrión con climatización y baños, insumos y personas anfitrionas capacitadas por turnos. Las anfitrionas y anfitriones son vecinos, no personal médico — capaciten a todo el mundo para reconocer el agotamiento por calor y la hipotermia y para llamar a los servicios de emergencia temprano y no tarde, y resuelvan la cuestión del seguro y la responsabilidad civil del sitio antes de la primera activación, no durante.",
    "setupHours": 21,
    "defaultCategory": "other",
    "suggestsWorkDays": true,
    "firstSteps": "El sitio anfitrión es la relación de la que todo depende, así que empieza ahí: siéntate con la bibliotecaria, el pastor o quien administra el salón y resuelvan juntas las preguntas incómodas — horarios, llaves, seguro, qué pasa si alguien necesita quedarse de noche — antes de que el primer pronóstico las fuerce. Al mismo tiempo, pregunta a los equipos de trabajo en calle y al personal de edificios de personas mayores quién necesita de verdad el refugio, para que la ubicación y los horarios le queden a la gente para la que es.",
    "commonPitfalls": "Este proyecto fracasa en la brecha entre el plan y el clima: un umbral que nadie terminó de acordar, y el centro abre un día tarde, o una pregunta de responsabilidad civil que quedó vaga hasta que alguien se desmaya y el sitio anfitrión se retira para siempre. Dejen el umbral de activación por escrito, hagan una apertura de práctica antes de la temporada y asegúrate de que cada anfitrión sepa llamar temprano a los servicios de emergencia, no al final.",
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
        "name": "Encuentra un sitio anfitrión con climatización",
        "description": "Pregunta en bibliotecas, sitios de fe, salones sindicales y centros comunitarios por una sala con aire acondicionado y calefacción confiables, baños y acceso sin escalones. Consigue un acuerdo por escrito que cubra horarios, quién tiene las llaves y qué pasa si se necesita de noche.",
        "hours": 4,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Definan los umbrales de activación y un plan de aviso",
        "description": "Decidan por adelantado qué abre exactamente el centro — una temperatura pronosticada, un índice de calor, una sensación térmica — para que nadie tenga que tomar la decisión a medianoche. Armen una cadena telefónica o un chat grupal que ponga a las personas anfitrionas en alerta con un día de anticipación.",
        "hours": 2
      },
      {
        "name": "Abastece los insumos",
        "description": "Reúne agua, sobres de electrolitos, cobijas, catres plegables o sillas cómodas, ventiladores, cargadores de teléfono y un botiquín de primeros auxilios. Guárdalo todo en el sitio, en cajas etiquetadas, para que cualquier anfitrión encuentre las cosas.",
        "hours": 3,
        "skills": [
          "conducir"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Convoca y capacita a anfitrionas y anfitriones de turno",
        "description": "Consigue suficientes personas voluntarias para tener dos por turno y capacítalas: recibir a la gente sin papeleo, reconocer el agotamiento por calor y la hipotermia, cuándo llamar a los servicios de emergencia y nociones básicas de desescalada. La calidez en el sentido humano importa tanto como el termostato.",
        "hours": 4,
        "skills": [
          "enseñanza"
        ]
      },
      {
        "name": "Arma la rotación de turnos",
        "description": "Prepara un calendario de turnos que puedas activar con un día de aviso — quién abre, quién cierra y cobertura nocturna si la ofrecen. Mantén una lista de reserva, porque las olas de calor también tumban a las personas voluntarias.",
        "hours": 2,
        "skills": [
          "organización"
        ],
        "follows": [
          3
        ],
        "recurringCadence": "event"
      },
      {
        "name": "Corre la voz antes de la temporada",
        "description": "Haz volantes multilingües con los umbrales y la ubicación, y llévalos a clínicas, edificios de personas mayores, equipos de trabajo en calle y tienditas antes de la primera ola de calor o helada — no durante.",
        "hours": 3,
        "skills": [
          "diseño gráfico",
          "traducción"
        ]
      },
      {
        "name": "Abre, acompaña y reinicia en cada activación",
        "description": "Mantén el centro abierto mientras dure el evento climático: registra a la gente sin rigidez (un conteo, no identificaciones), mantén los insumos circulando y revisa cómo está quien duerma. Después, limpia, reabastece y anota qué se acabó.",
        "hours": 3,
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "community-oral-history",
    "name": "Historia oral comunitaria",
    "purpose": "Grabar las historias de las personas mayores y del vecindario antes de que se pierdan — y dejar a quienes las cuentan al mando de lo que pase con ellas.",
    "whoItServes": "Personas mayores con historias que nadie ha pedido escuchar, residentes de toda la vida que ven cambiar el barrio y cada vecina y vecino que venga después.",
    "whatYoullNeed": "Un teléfono o una grabadora sencilla, un lugar tranquilo, formularios de consentimiento y un sitio seguro para guardar los archivos. Las grabaciones son datos personales — cada participante es dueña o dueño de su historia, decide dónde se comparte y puede cambiar de opinión más adelante. Nada se hace público sin su visto bueno por escrito.",
    "setupHours": 10,
    "defaultCategory": "education",
    "firstSteps": "Empieza con una persona mayor que confíe en ti y pregúntale si compartiría una historia — esa primera grabación te enseña más que cualquier plan, y su palabra te abre la puerta con la siguiente narradora. Antes de apretar grabar con cualquiera, repasen juntos el formulario de consentimiento y pregúntale qué quisiera que pase con la grabación; esa conversación es el proyecto.",
    "commonPitfalls": "La forma en que esto lastima a alguien es una historia que viaja más lejos de lo que su narradora acordó — un clip publicado, un nombre añadido, un detalle que era solo para ti. La forma en que muere en silencio es con grabaciones acumulándose sin etiquetar en el teléfono de una sola persona hasta que un aparato perdido borra años de voces; etiqueta y respalda cada sesión la misma semana.",
    "pairsWith": [
      "neighborhood-care-network",
      "digital-literacy"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Escribe un formulario de consentimiento en lenguaje sencillo",
        "description": "Una página, sin jerga legal: qué se está grabando, dónde podría compartirse y el derecho de quien participa a pausar, saltarse preguntas o retirar la grabación después. Tradúcelo a los idiomas que de verdad hablan tus narradoras y narradores.",
        "hours": 2,
        "skills": [
          "redacción",
          "traducción"
        ]
      },
      {
        "name": "Reúne el equipo y una lista de preguntas",
        "description": "Un teléfono con una app de notas de voz basta; suma un micrófono de solapa barato si puedes. Redacta preguntas abiertas que inviten historias — \"cuéntame cómo era la calle cuando llegaste\" — y practiquen una vez entre ustedes.",
        "hours": 2
      },
      {
        "name": "Graba las sesiones de historias",
        "description": "Siéntate con una persona narradora a la vez en un lugar tranquilo y cómodo. Repasen juntos el formulario de consentimiento primero, y luego sobre todo escucha — las mejores entrevistas son aquellas en las que menos hablas.",
        "hours": 4,
        "skills": [
          "escucha"
        ],
        "follows": [
          0,
          1
        ],
        "recurringCadence": "session"
      },
      {
        "name": "Archiva y devuelve, en sus términos",
        "description": "Etiqueta cada grabación con la fecha, los nombres y lo acordado sobre compartirla. Guarda dos copias en un lugar seguro, entrega a cada narradora o narrador su propia copia y comparte públicamente solo los fragmentos que cada persona aprobó.",
        "hours": 2,
        "follows": [
          2
        ]
      }
    ]
  },
  {
    "id": "community-solar-coop",
    "name": "Cooperativa comunitaria de energía solar",
    "purpose": "Juntar los recursos del vecindario en energía renovable compartida que baje las facturas de todos — sobre todo para inquilinos y hogares que nunca podrían poner paneles en un techo propio.",
    "whoItServes": "Personas que rentan, hogares de bajos ingresos y cualquiera a quien su techo, su casero o su presupuesto le cierra la puerta a los paneles solares propios.",
    "whatYoullNeed": "Miembros comprometidos, conocimientos técnicos y financieros que puedas pedir prestados o aprender, un sitio anfitrión o un programa de energía solar comunitaria existente al que sumarse, y organizaciones aliadas. Algo dicho sin rodeos: las cooperativas de energía implican una complejidad financiera y legal real — busquen asesoría de profesionales calificados sobre estructura, financiamiento y contratos antes de que alguien firme nada.",
    "setupHours": 27,
    "defaultCategory": "infrastructure",
    "firstSteps": "Antes de cualquier panel o papeleo, hablen con dos grupos: los vecinos que de verdad se unirían, para medir el compromiso real, y una cooperativa solar de un pueblo o estado vecino que ya lo haya hecho — ellos te dirán qué modelo encaja con las reglas de tu zona y qué errores les costaron dinero. Luego lean ustedes mismos esas reglas locales, porque son ellas, y no su entusiasmo, las que deciden qué es posible.",
    "commonPitfalls": "Las cooperativas solares mueren en la brecha entre el entusiasmo y las firmas: un año de reuniones sobre un modelo que las reglas de tu estado nunca permitieron, o un contrato firmado sin revisión profesional que amarra a los miembros a términos que nadie entendió. El otro asesino es el dinero borroso — si los miembros no pueden ver con claridad qué pusieron y qué les vuelve, la confianza se erosiona y la cooperativa se deshace.",
    "pairsWith": [
      "weatherization-brigade",
      "bulk-buying-coop"
    ],
    "tasks": [
      {
        "name": "Reúne miembros y mide el interés",
        "description": "Convoca hogares interesados en energía limpia más barata y averigua qué tan comprometidos están de verdad — el entusiasmo vago y un miembro inscrito son cosas distintas. Tus números definen qué modelos son realistas, así que cuenta con honestidad antes de planear.",
        "hours": 4,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Aprende los modelos y las reglas locales",
        "description": "Investiga cómo funciona la energía solar comunitaria donde vives: leyes estatales, medición neta, programas de suscripción, estructuras cooperativas. Las reglas varían enormemente de un lugar a otro y determinan qué es posible en realidad — haz esto antes de enamorarte de un modelo.",
        "hours": 5,
        "skills": [
          "investigación"
        ]
      },
      {
        "name": "Encuentra un sitio o un programa al que sumarse",
        "description": "Busca un techo anfitrión o un terreno para un arreglo compartido, o averigua si un programa de energía solar comunitaria existente aceptaría a tu grupo como suscriptores colectivos — sumarse a uno suele ser mucho más rápido que construir. Sopesa ambos caminos con tus miembros antes de comprometerte.",
        "hours": 4,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Resuelve el financiamiento y la estructura legal",
        "description": "Decidan cómo se financia y se gobierna el proyecto, y constituyan la cooperativa como corresponde. Este es el paso con implicaciones legales y financieras reales — traigan profesionales calificados que revisen la estructura y cada contrato, y no firmen hasta que lo hayan hecho.",
        "hours": 5,
        "skills": [
          "trámites",
          "contabilidad"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Asóciate con instaladores y proveedores",
        "description": "Consigue instaladores o proveedores de buena reputación, compara más de una cotización y confirma por escrito las garantías y el mantenimiento a largo plazo. Una instalación barata sin plan de mantenimiento resulta carísima a los cinco años.",
        "hours": 3,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Monta el sistema de membresías y créditos en la factura",
        "description": "Definan exactamente cómo llegan los ahorros o créditos a los miembros y cómo funcionan la membresía y los pagos. Háganlo transparente y fácil de entender — un miembro debería poder ver, en una sola página, qué puso y qué le vuelve.",
        "hours": 3,
        "skills": [
          "contabilidad",
          "captura de datos"
        ],
        "follows": [
          3
        ]
      },
      {
        "name": "Educa a los miembros sobre su consumo de energía",
        "description": "Ayuda a los miembros a leer sus facturas y a recortar su consumo — un kilovatio ahorrado vale más que un kilovatio generado. Acompaña los ahorros solares con consejos sencillos de eficiencia para que los hogares vean la diferencia en el papel.",
        "hours": 3,
        "skills": [
          "enseñanza"
        ]
      }
    ]
  },
  {
    "id": "worker-coop-incubator",
    "name": "Incubadora de cooperativas de trabajo y habilidades laborales",
    "purpose": "Ayudar a las vecinas y vecinos a desarrollar habilidades laborales y lanzar cooperativas de trabajadores — medios de vida donde quienes hacen el trabajo son dueños del lugar y toman las decisiones.",
    "whoItServes": "Vecinos sin empleo o con empleo precario, y cualquiera que quiera una participación real en el lugar donde trabaja.",
    "whatYoullNeed": "Mentores con experiencia empresarial y cooperativa, espacio y materiales de capacitación, apoyos de arranque hacia los que orientar a los emprendimientos, y alianzas — desarrolladores de cooperativas, prestamistas que conozcan las cooperativas y tu propio programa de intercambio de habilidades.",
    "setupHours": 27,
    "defaultCategory": "education",
    "firstSteps": "Empieza con conversaciones, no con un plan de estudios: siéntate con los miembros interesados a hablar de lo que saben hacer y quieren construir, y busca los grupos de habilidades que de verdad podrían convertirse en un emprendimiento. Al mismo tiempo, encuentra al desarrollador de cooperativas de tu zona o una cooperativa de trabajadores existente dispuesta a ser mentora — sus cicatrices son tu plan de estudios, y formar una cooperativa sin esa guía es donde los grupos salen lastimados.",
    "commonPitfalls": "Esto fracasa de dos maneras: como un programa de capacitación que nunca lanza nada, porque nadie empujó un grupo de habilidades hacia un emprendimiento real — o como un lanzamiento que se salta las partes aburridas, constituyéndose con una plantilla descargada y descubriendo el enredo de gobernanza e impuestos dos años después. También muere en silencio cuando una sola persona organizadora concentra cada relación con mentores y financiadores; compartan esos contactos desde el primer día.",
    "pairsWith": [
      "skill-share",
      "solidarity-fund",
      "time-bank"
    ],
    "tasks": [
      {
        "name": "Evalúa las habilidades y metas de los miembros",
        "description": "Siéntate con los miembros y aprende qué saben hacer y qué quieren construir. Buscas grupos afines — tres personas que cocinan, una cuadrilla con oficios, cinco que limpian — porque un grupo de habilidades es la semilla de un emprendimiento cooperativo viable.",
        "hours": 4,
        "skills": [
          "entrevistas"
        ]
      },
      {
        "name": "Ofrece capacitación laboral y de habilidades",
        "description": "Organiza sesiones sobre currículums, entrevistas, oficios, habilidades digitales y educación financiera. Apóyate en tu programa de intercambio de habilidades y trae expertos de fuera para lo que nadie local pueda enseñar — la meta es tener miembros capaces, se forme o no una cooperativa a su alrededor.",
        "hours": 5,
        "skills": [
          "enseñanza"
        ]
      },
      {
        "name": "Enseña el modelo cooperativo",
        "description": "Guía a los miembros por la propiedad de los trabajadores y la gobernanza democrática: cómo se reparten las ganancias, cómo se toman las decisiones y en qué se diferencia todo de un negocio tradicional. Nadie puede elegir un modelo que nunca ha visto — usa cooperativas reales como ejemplos.",
        "hours": 4,
        "skills": [
          "enseñanza",
          "facilitación"
        ]
      },
      {
        "name": "Acompaña la formación de cooperativas",
        "description": "Cuando un grupo esté listo, ayúdalo a escribir un plan de negocio y elegir una estructura legal. Conéctalo con abogados y contadores que conozcan las cooperativas en lugar de improvisar los pasos legales y contables — una constitución mal hecha sale cara de deshacer.",
        "hours": 5,
        "skills": [
          "trámites"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Conecta con recursos de arranque",
        "description": "Arma una lista viva de microcréditos, subvenciones, fondos de desarrollo cooperativo e incubadoras, y ayuda a los emprendimientos a postular de verdad. La mayor parte del dinero para cooperativas existe pero está mal señalizado — tu mapa vale dinero real.",
        "hours": 3,
        "skills": [
          "investigación"
        ]
      },
      {
        "name": "Brinda mentoría",
        "description": "Empareja cada emprendimiento nuevo con un cooperativista con experiencia o un mentor de negocios que lo acompañe durante las etapas tempranas y frágiles. El primer año es donde fracasan las cooperativas; un mentor constante que ya ha visto el patrón cambia las probabilidades.",
        "hours": 3
      },
      {
        "name": "Construye apoyo mutuo entre emprendimientos",
        "description": "Reúne a los emprendimientos en una red donde las cooperativas compartan lecciones, se refieran clientes y se compren entre sí. Las cooperativas que comercian entre ellas sobreviven crisis que matan a las que están aisladas.",
        "hours": 3,
        "skills": [
          "organización"
        ]
      }
    ]
  },
  {
    "id": "elder-meal-delivery",
    "name": "Compañía y entrega de comidas para personas mayores",
    "purpose": "Llevar comidas regulares y visitas amistosas a personas mayores que no pueden salir de casa — la comida importa, y los diez minutos de conversación en la puerta muchas veces importan más.",
    "whoItServes": "Vecinas y vecinos mayores aislados, confinados en casa o frágiles — y las familias que se preocupan por ellos desde lejos.",
    "whatYoullNeed": "Personas voluntarias confiables y ya verificadas, una fuente de comidas, rutas planificadas y prácticas sencillas de seguridad para el momento en que una puerta no se abre.",
    "setupHours": 22,
    "defaultCategory": "food",
    "firstSteps": "Empieza con la fuente de comidas y las primeras cinco personas mayores, no con una hoja de inscripción: habla con el equipo de la comida comunitaria o con un par de cocineros dispuestos sobre lo que pueden producir de forma confiable, y pregunta a trabajadores de servicios para mayores, enfermeras parroquiales y farmacéuticos quién se está quedando de verdad sin comer. Verifica a tus primeros voluntarios antes de la primera entrega, no después — la confianza que estás construyendo vive o muere según quién cruza esas puertas.",
    "commonPitfalls": "El fracaso peligroso es una señal perdida — un voluntario que le resta importancia a una puerta sin respuesta porque nadie dejó por escrito qué hacer, o una alergia que nunca llegó a la hoja de ruta. El fracaso lento es la falta de constancia: las personas mayores organizan su día alrededor de la visita, y una ruta que se salta semanas les enseña a no contar contigo. Mejor cinco personas atendidas todas las semanas sin falta que veinte atendidas a veces.",
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
        "name": "Identifica a las personas mayores confinadas en casa",
        "description": "Encuéntralas a través de clínicas, servicios para mayores, grupos de fe y el boca a boca. Hazlo con respeto y de forma estrictamente voluntaria — estás ofreciendo una comida y compañía, no inscribiendo a nadie en un sistema de vigilancia.",
        "hours": 3,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Convoca y verifica voluntarios",
        "description": "Cualquiera que entre a la casa de una persona mayor pasa por verificación: referencias y revisiones básicas, sin excepciones para amigos de amigos. Luego apunta a la constancia — a las personas mayores les va mejor con la misma cara conocida en la puerta cada semana que con un elenco rotativo.",
        "hours": 4,
        "skills": [
          "organización"
        ]
      },
      {
        "name": "Consigue una fuente de comidas",
        "description": "Asegura comidas de una cocina popular, cocineros caseros dispuestos o restaurantes que donen porciones. Presta atención a la nutrición y a que sean fáciles de recalentar, y etiqueta cada envase con su contenido — una comida sin etiqueta es una apuesta para alguien con alergias.",
        "hours": 4,
        "skills": [
          "cocina",
          "seguridad alimentaria"
        ]
      },
      {
        "name": "Planifica las rutas y el calendario de entregas",
        "description": "Agrupa a las personas mayores en rutas eficientes y fija un ritmo confiable — los mismos días, más o menos a las mismas horas. Incluye unos minutos de conversación sin prisa en cada parada; para muchas personas mayores, esa es la verdadera entrega.",
        "hours": 3,
        "skills": [
          "conducir",
          "organización"
        ],
        "follows": [
          0,
          2
        ]
      },
      {
        "name": "Registra información dietética, de alergias y de emergencia",
        "description": "Para cada persona mayor, registra necesidades dietéticas, alergias, medicamentos que importan alrededor de la comida y contactos de emergencia. Guárdalo seguro y solo para quien lo necesite — quien conduce necesita saber la alergia, no todo el historial médico.",
        "hours": 3,
        "skills": [
          "captura de datos"
        ]
      },
      {
        "name": "Establece un protocolo de verificación de bienestar",
        "description": "Deja por escrito exactamente qué hace un voluntario cuando una persona mayor no responde o se ve mal: a quién llamar primero, cuándo involucrar a la familia o a los servicios de emergencia y cómo anotar lo que pasó. Decidirlo por adelantado es mejor que improvisar en un umbral.",
        "hours": 3,
        "skills": [
          "redacción"
        ],
        "follows": [
          4
        ]
      },
      {
        "name": "Apoya a los voluntarios y recoge opiniones",
        "description": "Habla con los voluntarios con regularidad, rota las rutas cuando alguien necesite un descanso y pregunta a las propias personas mayores cómo podría servirles mejor el proyecto. Te dirán cosas que los voluntarios nunca ven.",
        "hours": 2
      }
    ]
  },
  {
    "id": "disaster-relief-hub",
    "name": "Centro de distribución de ayuda ante desastres",
    "purpose": "Levantar un centro que pueda recibir, clasificar y mover insumos rápido cuando golpea un desastre — porque los primeros días después de una inundación o un incendio se ganan o se pierden en la logística.",
    "whoItServes": "Residentes golpeados por inundaciones, tormentas, incendios y otros desastres — empezando por los vecinos con menos posibilidades de trasladarse o de esperar.",
    "whatYoullNeed": "Un sitio acordado de antemano con un respaldo, canales para conseguir insumos, un equipo de voluntarios de emergencia y coordinación con la red de preparación para emergencias — casi todo arreglado antes de cualquier desastre, porque después ya es tarde.",
    "setupHours": 24,
    "defaultCategory": "organizing",
    "suggestsWorkDays": true,
    "firstSteps": "El centro existe en papel mucho antes de existir en un estacionamiento, así que empieza con la red de preparación para emergencias — ellos tienen el árbol de contactos y el panorama de riesgos — y con la pregunta honesta de qué edificio de verdad te dejaría entrar a las seis de la mañana después de una inundación. Cierra primero el acuerdo del sitio y el respaldo; todas las demás tareas dependen de una dirección.",
    "commonPitfalls": "Los centros de ayuda fracasan en dos direcciones: el centro que existe solo como un plan que nadie ensayó, y el evento real quema su primer día en preguntas que un simulacro habría respondido — y el centro que abre sus puertas a una avalancha de donaciones que no puede clasificar, convirtiéndose en una bodega de ropa inservible mientras la gente necesita agua. El daño más silencioso es la distribución con barreras: en el momento en que alguien debe demostrar que merece ayuda, recreaste el sistema que construiste esto para esquivar.",
    "pairsWith": [
      "emergency-preparedness",
      "resource-hub-dispatch"
    ],
    "learnMore": [
      "internet-outage"
    ],
    "tasks": [
      {
        "name": "Identifica de antemano un sitio y un respaldo",
        "description": "Busca un edificio o terreno que pueda recibir entregas, clasificar bienes y albergar una fila de distribución — más un respaldo por si el primero queda dañado o inaccesible. Confirma el acceso y las llaves con los dueños ahora, con clima en calma; un sitio al que no puedes entrar no es un sitio.",
        "hours": 3,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Construye canales de abastecimiento",
        "description": "Acuerda por adelantado de dónde vendrían el agua, la comida y los insumos de higiene y limpieza — proveedores, organizaciones aliadas, colectas. Igual de importante: una forma de saber qué necesita de verdad la gente después de un evento, para que no te entierren las cosas equivocadas.",
        "hours": 4,
        "skills": [
          "difusión",
          "organización"
        ]
      },
      {
        "name": "Monta la recepción, clasificación e inventario",
        "description": "Diseña cómo se reciben, clasifican y registran las donaciones desde el momento en que llega un camión. Todos los centros que se han ahogado en bienes sin clasificar se saltaron este paso — define tus categorías, etiquetas y conteos sencillos antes de necesitarlos.",
        "hours": 4,
        "skills": [
          "organización",
          "captura de datos"
        ]
      },
      {
        "name": "Crea un sistema de distribución",
        "description": "Planifica cómo salen los insumos: equitativo y sin barreras — sin pedir identificación ni pruebas de necesidad — con entrega móvil para quien no puede llegar al centro. Prioriza primero a las personas más vulnerables, y deja esa prioridad por escrito para que sobreviva al caos.",
        "hours": 3,
        "skills": [
          "conducir",
          "organización"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Convoca y entrena un equipo voluntario de emergencia",
        "description": "Arma una lista de personas que puedan movilizarse con poco aviso y entrénalas de antemano en sus roles, las reglas de seguridad y tu sistema de recepción y distribución. Un equipo entrenado de doce rinde más que una multitud bienintencionada de cincuenta.",
        "hours": 4,
        "skills": [
          "enseñanza"
        ]
      },
      {
        "name": "Coordina con otros equipos de respuesta",
        "description": "Presenta el centro a las agencias oficiales de emergencia y a otros grupos de ayuda antes de que pase nada. Acuerden quién cubre qué, para llenar vacíos en lugar de duplicar — la ayuda mutua avanza más rápido justo donde la respuesta oficial es más lenta.",
        "hours": 3,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Planifica la comunicación y la seguridad",
        "description": "Prepárate para que fallen las redes: métodos de contacto sin internet, listas impresas y un enlace con el árbol de contactos de la red de preparación. Fijen reglas duras de seguridad para voluntarios — nadie entra a estructuras inseguras, nunca — y déjenlas por escrito.",
        "hours": 3,
        "skills": [
          "redacción"
        ]
      }
    ]
  },
  {
    "id": "recovery-peer-support",
    "name": "Red de apoyo entre pares en recuperación y sobriedad",
    "purpose": "Sostener apoyo dirigido por pares para vecinos que están en recuperación del consumo de sustancias o que la buscan — un complemento del tratamiento profesional, nunca un reemplazo.",
    "whoItServes": "Personas en recuperación, personas que la están considerando y las familias y amistades que caminan a su lado.",
    "whatYoullNeed": "Facilitadores pares con experiencia vivida y capacitación real, un espacio seguro y privado, rutas de derivación y límites dichos con claridad: el apoyo entre pares complementa el tratamiento profesional, no lo reemplaza; los facilitadores no son proveedores médicos y nunca deben aconsejar sobre desintoxicación ni medicamentos; y siempre hay un plan claro para conectar a cualquier persona en crisis con ayuda profesional o de emergencia calificada.",
    "setupHours": 22,
    "defaultCategory": "emotional_support",
    "firstSteps": "Empieza por las personas que sostendrán la sala: encuentra a una o dos vecinas o vecinos con experiencia vivida y sólida de recuperación, inscríbelos en una capacitación formal de apoyo entre pares y escriban juntos el alcance — qué es y qué no es esta red — antes de anunciar nada. Luego conoce en persona los programas de tratamiento y los servicios de crisis locales, para que tu ruta de derivación sea una relación, no un número de teléfono en un volante.",
    "commonPitfalls": "Esto se vuelve peligroso cuando la línea se difumina — un facilitador bienintencionado aconsejando a alguien sobre desintoxicación o medicamentos, lo cual puede matar, o un grupo deslizándose hacia el tratamiento amateur porque la ruta de derivación nunca fue real. Fracasa en silencio por la confidencialidad rota — una sola historia filtrada vacía la sala para siempre — y por el agotamiento de los facilitadores, cuando la persona que sostiene la recuperación de todos no tiene apoyo para la suya.",
    "pairsWith": [
      "mental-health-peer-support",
      "harm-reduction-supplies"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Convoca y capacita facilitadores pares",
        "description": "Busca personas con experiencia vivida de recuperación y haz que completen una capacitación reconocida de apoyo entre pares en recuperación. Sé claro desde la primera conversación: los facilitadores son pares, no proveedores médicos ni clínicos, y la capacitación es lo que mantiene esa línea segura.",
        "hours": 5,
        "skills": [
          "facilitación",
          "enseñanza"
        ]
      },
      {
        "name": "Define el alcance y los límites",
        "description": "Deja por escrito qué hace la red — apoyo entre pares, conexión, ánimo — y qué no hace: tratamiento, desintoxicación, atención médica, consejos sobre medicamentos. Un alcance escrito protege a los miembros de los malos consejos y protege a los facilitadores de cargar con lo que no les corresponde.",
        "hours": 3,
        "skills": [
          "redacción"
        ]
      },
      {
        "name": "Construye rutas de derivación y de crisis",
        "description": "Crea relaciones de trabajo con programas de tratamiento profesional, atención médica y servicios de crisis, y escribe un plan de respuesta ante sobredosis. Cuando alguien en la sala necesite más de lo que los pares pueden dar, el traspaso debería ser una llamada cálida, no un folleto.",
        "hours": 4,
        "skills": [
          "difusión",
          "investigación"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Encuentra un espacio seguro, privado y libre de sustancias",
        "description": "Busca una sala confidencial, acogedora y libre de juicios y de sustancias — un lugar al que la gente pueda entrar sin que eso anuncie nada. Funcionan bien las bibliotecas, los salones comunitarios y los espacios de fe con entrada aparte.",
        "hours": 2,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Establece la confidencialidad y las normas del grupo",
        "description": "Acuerden las reglas básicas: lo que se dice aquí se queda aquí, respeto sin empujar consejos y el derecho de cada quien a compartir o a pasar. Reafírmenlas en voz alta al inicio de cada reunión, sin excepción — las normas solo protegen mientras están frescas.",
        "hours": 3,
        "skills": [
          "facilitación"
        ]
      },
      {
        "name": "Programa y difunde las reuniones",
        "description": "Ofrece más de un horario de reunión para que puedan venir quienes trabajan por turnos y quienes crían, y difunde con lenguaje sencillo y sin estigma — gratis, abierto, sin requisitos. Cómo redactas el volante decide quién se siente seguro de llegar.",
        "hours": 3,
        "skills": [
          "difusión"
        ],
        "follows": [
          3
        ]
      },
      {
        "name": "Apoya a los facilitadores y prevén el agotamiento",
        "description": "Habla con los facilitadores con regularidad, rota quién dirige y asegúrate de que tengan apoyo propio — sostener el espacio para la recuperación ajena es un trabajo pesado, y la propia recuperación de un facilitador siempre va primero.",
        "hours": 2,
        "skills": [
          "escucha"
        ]
      }
    ]
  },
  {
    "id": "community-fitness",
    "name": "Grupos comunitarios de ejercicio y bienestar",
    "purpose": "Poner a las vecinas y vecinos a moverse juntos y gratis — grupos de caminata, estiramientos, partidos improvisados, baile — porque sentirte bien en tu cuerpo no debería costar una membresía de gimnasio.",
    "whoItServes": "Cualquiera que quiera moverse, en especial vecinos para quienes el gimnasio queda fuera de alcance, personas mayores y gente aislada para quienes la compañía importa tanto como el ejercicio.",
    "whatYoullNeed": "Personas voluntarias que guíen las actividades, espacios seguros y accesibles, y muy poco equipo. Un estilo acogedor y sin presión importa más que las credenciales — aunque quien dirija una actividad físicamente exigente debe tener la preparación adecuada, y cada sesión necesita agua, calentamiento y un botiquín de primeros auxilios a la mano.",
    "setupHours": 19,
    "defaultCategory": "other",
    "firstSteps": "Antes de agendar nada, pregunta a las personas que esperas que vengan qué disfrutarían de verdad — un grupo de caminata, estiramientos en silla, una noche de baile — y qué se siente posible para sus cuerpos; las respuestas deben elegir tus actividades, no al revés. Luego encuentra a una o dos personas guía cuya calidez pese más que su pericia, recorran juntos los espacios candidatos y lancen una sola sesión semanal confiable antes de agregar más.",
    "commonPitfalls": "Esto muere de dos maneras: se vuelve una competencia — los miembros más en forma marcan el paso, la charla se desvía hacia el peso y la apariencia, y justo la gente para la que es deja de venir en silencio — o se vuelve inconstante, porque nada mata un grupo de caminata más rápido que llegar dos veces a una sesión cancelada. Saltarse lo aburrido de la seguridad es la tercera: sin calentamiento, sin agua, sin botiquín, y una mala caída acaba con todo.",
    "pairsWith": [
      "disability-support-network",
      "neighborhood-care-network"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Sondea intereses y niveles de actividad",
        "description": "Pregunta por ahí — en la lavandería, el edificio de personas mayores, la puerta de la escuela — qué tipos de movimiento disfruta la gente y qué se siente accesible. Deja que las respuestas guíen: una plantilla llena de deportes que nadie pidió no ayuda a nadie.",
        "hours": 2,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Convoca a personas guía para las actividades",
        "description": "Encuentra voluntarias y voluntarios que dirijan caminatas, estiramientos, baile o partidos improvisados. Un estilo acogedor y sin presión vale más que la pericia para la mayoría de las actividades — pero quien dirija algo físicamente exigente debe contar con la certificación adecuada.",
        "hours": 3,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Encuentra espacios seguros",
        "description": "Pregunta por parques, salones comunitarios y gimnasios escolares — gratuitos o baratos, y accesibles sin auto. Revisa cada espacio pensando en cuerpos y capacidades diversas: piso parejo, asientos, sombra, baños y un lugar donde resguardarse si el clima cambia.",
        "hours": 3
      },
      {
        "name": "Planea una programación inclusiva y para todos los niveles",
        "description": "Diseña cada actividad para que la gente pueda sumarse a su propio ritmo y adaptarla con libertad — una opción en silla para el estiramiento, un circuito corto dentro de la caminata larga. Mantén el enfoque en sentirse bien, moverse y conectar, nunca en la apariencia o el rendimiento.",
        "hours": 3
      },
      {
        "name": "Atiende la seguridad y la salud",
        "description": "Incluye calentamiento e hidratación en cada sesión, ten a la mano un botiquín de primeros auxilios bien surtido y sugiere que quien recién empieza a ejercitarse consulte antes con su médico. Enseña a las personas guía a detectar el sobreesfuerzo y a hacer que bajar el ritmo se sienta normal, no vergonzoso.",
        "hours": 3,
        "skills": [
          "primeros auxilios"
        ]
      },
      {
        "name": "Define un horario y corre la voz",
        "description": "Elige horarios consistentes alrededor de los cuales la gente pueda construir un hábito, y respétalos. Promociona por todas partes — volantes, chats grupales, boca a boca — y di explícitamente que todas las edades, tallas y capacidades son bienvenidas, porque mucha gente asume que no lo son.",
        "hours": 3,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Cultiva comunidad y constancia",
        "description": "Haz que las sesiones sean sociales: nombres aprendidos, recién llegados bien recibidos, unos minutos de charla incluidos. Celebra el simple hecho de presentarse en vez de cualquier métrica — la conexión es lo que hace que la gente siga viniendo mucho después de que pasa la novedad.",
        "hours": 2,
        "skills": [
          "facilitación"
        ]
      }
    ]
  },
  {
    "id": "urban-orchard",
    "name": "Huerto frutal urbano y bosque comestible",
    "purpose": "Plantar árboles frutales, árboles de nueces y plantas comestibles perennes en terrenos compartidos — un bosque comestible que, una vez establecido, alimenta gratis al vecindario por décadas.",
    "whoItServes": "Toda la comunidad, incluidos los vecinos que todavía no llegan — los árboles plantados este año se convierten en una fuente de comida fresca y gratuita a largo plazo para todo el mundo.",
    "whatYoullNeed": "Acceso a la tierra a largo plazo (un acuerdo de palabra de temporada en temporada no basta para árboles), árboles y plantas adecuados al clima, personas voluntarias para las jornadas de plantación y un pequeño equipo de cuidadores comprometidos por años, no por meses. Confirmen el acceso al agua antes de que nada toque la tierra.",
    "setupHours": 21,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "La conversación sobre la tierra va antes que todo: habla con fideicomisos de tierras, el departamento de parques, congregaciones de fe con terreno sin usar — cualquiera que pueda comprometer un sitio por una década, no por una temporada — y de paso confirma el agua. En paralelo, encuentra a una persona con experiencia real en árboles frutales que ancle el diseño, y pregunta a los vecinos qué cosecharían y comerían de verdad, porque un huerto de fruta que nadie quiere solo alimenta a las avispas.",
    "commonPitfalls": "Los huertos rara vez fracasan el día de la plantación — fracasan en los años dos y tres, cuando la multitud ya se fue y nadie organizó el riego, y los árboles jóvenes mueren en silencio en su primer verano seco. Los otros asesinos son acuerdos de tierra frágiles revocados justo cuando los árboles empiezan a dar fruto, y pleitos de cosecha porque nadie acordó normas de reparto antes de la primera gran cosecha. Resuelvan la rotación de cuidados y las reglas de reparto temprano, mientras todavía es fácil.",
    "pairsWith": [
      "community-garden",
      "gleaning-network",
      "seed-library"
    ],
    "tasks": [
      {
        "name": "Asegura el acceso a la tierra a largo plazo",
        "description": "Consigue un acuerdo escrito duradero — un arrendamiento largo, un arreglo con un fideicomiso de tierras, un compromiso formal de la ciudad — porque los árboles necesitan décadas, no un acuerdo de palabra de temporada en temporada. Confirma un acceso confiable al agua en el sitio antes de firmar nada.",
        "hours": 5,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Planea el diseño de plantación",
        "description": "Elige especies adecuadas a tu clima y diseña en capas de bosque comestible: árboles de dosel, arbustos y cubierta vegetal trabajando juntos. Planea los compañeros de polinización y el espacio que necesitarán los árboles adultos, no el tamaño de las plántulas que siembras.",
        "hours": 4,
        "skills": [
          "jardinería"
        ]
      },
      {
        "name": "Consigue los árboles y las plantas",
        "description": "Asegura árboles y plantas a través de viveros, subvenciones, donaciones y ventas de temporada a raíz desnuda — el material joven y a raíz desnuda cuesta una fracción de los árboles maduros en maceta y suele establecerse mejor. Pide con anticipación; las buenas variedades se agotan.",
        "hours": 3
      },
      {
        "name": "Prepara el sitio",
        "description": "Deja el terreno listo antes de que lleguen los árboles: mejora el suelo, extiende acolchado, instala el riego, y marca y despeja cada punto de plantación según el diseño. Un sitio preparado convierte la jornada de plantación de un caos en una línea de montaje.",
        "hours": 4,
        "skills": [
          "jardinería"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Organiza jornadas de plantación",
        "description": "Realiza jornadas comunitarias de plantación con instrucciones claras, para que cada árbol quede a la profundidad correcta, con su cazuela de riego y su acolchado — mal plantados, los árboles fallan lenta e invisiblemente. Hazlo festivo; una jornada de plantación es la manera en que el vecindario empieza a sentir que el huerto es suyo.",
        "hours": 5,
        "skills": [
          "jardinería"
        ],
        "follows": [
          3
        ],
        "recurringCadence": "cycle"
      },
      {
        "name": "Establece el cuidado a largo plazo",
        "description": "Organiza el trabajo sin gloria que decide si el huerto vive: regar los árboles jóvenes durante sus primeros veranos, podar, acolchar y manejar las plagas, año tras año. Una rotación con nombres de cuidadores comprometidos vale más que una gran lista de voluntarios difusos.",
        "hours": 3,
        "skills": [
          "jardinería"
        ]
      },
      {
        "name": "Planea el reparto de la cosecha",
        "description": "Acuerden normas de recolección y reparto antes de la primera gran cosecha, no después del primer pleito — quién cosecha, cuándo y cuánto. Encaucen el excedente a refrigeradores comunitarios, despensas y comidas compartidas para que nada se pudra en la rama.",
        "hours": 2
      }
    ]
  },
  {
    "id": "new-parent-support",
    "name": "Red de apoyo posparto y para nuevas familias",
    "purpose": "Rodear de apoyo práctico a madres y padres recientes o en espera — comidas en la puerta, mandados hechos, platos lavados y pares que ya pasaron por ahí — durante el embarazo y las semanas crudas del posparto.",
    "whoItServes": "Madres y padres recientes o en espera, sobre todo quienes no tienen familia cerca — las semanas después de un nacimiento son cuando el apoyo más importa y menos suele llegar.",
    "whatYoullNeed": "Personas voluntarias que puedan cocinar, hacer mandados y escuchar; un sistema de tren de comidas; un directorio de recursos; y madres y padres con experiencia como pares de apoyo. El apoyo entre pares no es atención médica ni de salud mental — los trastornos del ánimo posparto son comunes y serios, así que cada par de apoyo debe conocer las señales y saber conectar con delicadeza a una madre o un padre con ayuda profesional. Y verifiquen los antecedentes de cualquiera que vaya a entrar a los hogares o ayudar con bebés antes de que haga cualquiera de las dos cosas.",
    "setupHours": 21,
    "defaultCategory": "childcare",
    "firstSteps": "Empieza preguntando a madres y padres que dieron a luz en el último año qué les habría ayudado de verdad — las respuestas (una comida sin visita incluida, alguien que cargue al bebé mientras se bañan) son más específicas de lo que imaginas. Presenta la red a parteras, doulas y clínicas pediátricas que puedan ofrecerla a las familias, convoca a dos o tres madres o padres con experiencia como tus primeros pares de apoyo, y define tu práctica de verificación antes de que alguien cruce una puerta.",
    "commonPitfalls": "El fracaso clásico es un apoyo que sirve a quien apoya: voluntarios que llegan según su propio horario, se quedan demasiado y opinan sobre la crianza en vez de lavar los platos — unas madres y padres agotados dejarán de abrir la puerta en silencio antes que decirlo. El más grave es que un par no vea las señales de la depresión posparto porque nadie lo entrenó para reconocerla ni le dio las palabras para nombrarla. Y un apoyo que desaparece a las dos semanas, justo cuando se acaban los guisados y empieza lo difícil, no es apoyo en absoluto.",
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
        "name": "Convoca voluntarios y pares de apoyo",
        "description": "Reúne a quienes cocinan, hacen mandados y — lo más importante — madres y padres con experiencia dispuestos a ser pares de apoyo. Quien recuerda su propia tercera semana sin dormir ofrece algo que ningún folleto puede dar.",
        "hours": 3,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Monta un sistema de tren de comidas",
        "description": "Crea una forma sencilla de coordinar comidas dejadas en la puerta durante las semanas después de un nacimiento: un calendario compartido, necesidades dietéticas y alergias recogidas una sola vez, comida etiquetada y fácil de recalentar. Dejarla en la puerta debe ser lo normal — una comida nunca debe obligar a una visita.",
        "hours": 3,
        "skills": [
          "cocina",
          "organización"
        ]
      },
      {
        "name": "Ofrece ayuda práctica",
        "description": "Organiza voluntarios para la carga sin gloria: mandados, lavandería, platos y cuidar a los hermanos mayores para que una madre o un padre pueda descansar o llegar a una cita. Pregunta qué se necesita cada vez en lugar de asumir — la ayuda útil sigue la lista de la familia, no la del voluntario.",
        "hours": 3,
        "skills": [
          "cuidado infantil"
        ]
      },
      {
        "name": "Arma un directorio de recursos",
        "description": "Recopila apoyo local de lactancia, atención de salud mental posparto, clínicas pediátricas y fuentes de artículos para bebé — incluidos el banco de pañales y el colectivo de cuidado infantil si tu comunidad los tiene. Mantenlo al día; un directorio de teléfonos muertos es peor que ninguno.",
        "hours": 4,
        "skills": [
          "captura de datos"
        ]
      },
      {
        "name": "Crea círculos de apoyo entre pares",
        "description": "Inicia grupos pequeños donde las madres y padres recientes puedan ser honestos sobre lo difícil que es, con una madre o un padre con experiencia sosteniendo el espacio. Capacita a los pares en las señales de la depresión y la ansiedad posparto y en animar con delicadeza y persistencia a buscar atención profesional — nunca diagnosticar, nunca esperar.",
        "hours": 3,
        "skills": [
          "facilitación"
        ]
      },
      {
        "name": "Define prácticas de seguridad y de límites",
        "description": "Verifica a cada voluntario que vaya a entrar a los hogares o ayudar con bebés — referencias como mínimo — y deja los límites por escrito: la familia pone las condiciones, las visitas son cortas salvo invitación a quedarse más, y nadie llega sin avisar. El apoyo nunca debe sentirse como vigilancia.",
        "hours": 3
      },
      {
        "name": "Conecta con otros proyectos",
        "description": "Enlaza a las familias con el banco de pañales, el colectivo de cuidado infantil y el comité de bienvenida, para que un solo punto de contacto lo abra todo. Una madre o un padre reciente no debería tener que descubrir cada programa por separado en el momento más agotador de su vida.",
        "hours": 2,
        "skills": [
          "difusión"
        ]
      }
    ]
  },
  {
    "id": "foster-kinship-support",
    "name": "Red de apoyo a familias de acogida y parientes cuidadores",
    "purpose": "Respaldar a las familias de acogida, a los parientes cuidadores y a otras familias que crían — ropa y una cama cuando un niño llega de un día para otro, respiro cuando quienes cuidan están al límite, y pares que entienden el trabajo.",
    "whoItServes": "Madres y padres de acogida, abuelos y parientes criando niños — los parientes cuidadores suelen empezar con una llamada y unas horas de aviso — y los niños y niñas a su cargo.",
    "whatYoullNeed": "Personas voluntarias, artículos donados de todas las edades y tallas, ayuda de respiro y alianzas con agencias y escuelas. El trabajo con niñez en acogida es delicado y está regulado por ley: verifiquen a todas las personas que trabajen con niños, sigan al pie de la letra las reglas de reporte obligatorio y de confidencialidad, y coordinen con las agencias pertinentes, no a sus espaldas.",
    "setupHours": 24,
    "defaultCategory": "childcare",
    "firstSteps": "Empieza con una reunión en la agencia local de acogida o el programa orientador de cuidado por parientes: aprende las reglas que rigen este trabajo — verificación de antecedentes, reporte obligatorio, confidencialidad — antes de convocar a una sola persona voluntaria, y deja que ellos te digan dónde están de verdad los vacíos. Luego pregunta a algunas familias cuidadoras qué necesitaron en su primera semana y en su primer año; construye hacia esas respuestas, no hacia una bodega de cosas que nadie pidió.",
    "commonPitfalls": "Este proyecto puede fracasar con estruendo o en silencio. Con estruendo: un voluntario sin verificar cerca de los niños, o la historia de una familia compartida sin permiso — cualquiera de las dos puede dañar a un niño, terminar una colocación y acabar con el proyecto en un día. En silencio: una montaña de donaciones sin clasificar mientras una cuidadora espera tres semanas una cama para un niño pequeño, o tratar a las agencias como adversarias hasta que dejan de referir familias. Aquí, lo pequeño, verificado y coordinado le gana a lo grande e improvisado, siempre.",
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
        "name": "Conecta con las familias cuidadoras",
        "description": "Llega a las familias cuidadoras a través de agencias, escuelas y grupos de fe — en especial a los parientes cuidadores, que a menudo reciben a un nieto o una sobrina de la noche a la mañana, sin preparación y con poco apoyo oficial. Haz que el primer contacto sea una oferta, nunca un filtro.",
        "hours": 3,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Arma una reserva de ropa y artículos",
        "description": "Recolecta ropa, camas, sillas de auto y artículos de uso diario en todo el rango de edades y tallas, porque quienes cuidan rara vez saben quién llega hasta que llega. Revisa con cuidado los artículos de seguridad — las sillas de auto y las cunas tienen fechas de caducidad y listas de retiro del mercado.",
        "hours": 4,
        "skills": [
          "organización"
        ]
      },
      {
        "name": "Crea un sistema de entrega rápida",
        "description": "Prepara mochilas listas para salir — unos días de ropa, artículos de aseo y algo reconfortante como un peluche — ordenadas por edad y talla, entregables a las pocas horas de una nueva colocación. Un niño que llega sin nada no debería esperar una semana para tener algo propio.",
        "hours": 3,
        "follows": [
          1
        ]
      },
      {
        "name": "Organiza el apoyo de respiro",
        "description": "Consigue cuidado seguro y debidamente verificado para que quienes cuidan puedan descansar, cumplir sus citas o simplemente respirar — el agotamiento de quien cuida es una de las principales razones por las que se rompen las colocaciones. Coordina con las agencias quién puede dar cuidado de respiro y bajo qué reglas.",
        "hours": 4,
        "skills": [
          "cuidado infantil"
        ]
      },
      {
        "name": "Ofrece grupos de apoyo entre pares",
        "description": "Organiza encuentros regulares donde las familias de acogida y los parientes cuidadores puedan intercambiar experiencia y consejos honestos con gente que lo entiende — este trabajo aísla, y la cuidadora a tres calles de distancia puede estar cargando lo mismo sola.",
        "hours": 3,
        "skills": [
          "facilitación"
        ]
      },
      {
        "name": "Arma un directorio de recursos",
        "description": "Recopila los servicios, beneficios y apoyos con enfoque en el trauma a los que pueden recurrir las familias cuidadoras, y ayúdalas a navegar sistemas confusos hasta para los profesionales. Los parientes cuidadores, en particular, suelen calificar para ayudas de las que nadie les habló.",
        "hours": 3,
        "skills": [
          "captura de datos"
        ]
      },
      {
        "name": "Define prácticas de seguridad infantil y privacidad",
        "description": "Deja por escrito y cumple lo innegociable: verificación para cualquiera que trabaje con niños, lo que las leyes de reporte obligatorio exigen de tus voluntarios y privacidad estricta para las familias y los niños — sin fotos, sin historias, sin detalles compartidos sin permiso.",
        "hours": 4,
        "skills": [
          "redacción"
        ]
      }
    ]
  },
  {
    "id": "weather-survival-outreach",
    "name": "Brigadas de supervivencia ante frío y calor extremos",
    "purpose": "Llevar insumos de supervivencia a las vecinas y vecinos sin techo cuando el clima se vuelve mortal — cobijas y calentadores de manos en una helada, agua y electrolitos en una ola de calor — cargados hasta donde la gente realmente está.",
    "whoItServes": "Vecinas y vecinos sin techo o en situación de calle expuestos al clima extremo — la gente para quien una ola de calor o una helada es un evento que amenaza la vida, no una molestia.",
    "whatYoullNeed": "Insumos específicos para cada clima, voluntarios de calle, rutas planificadas y conexiones vigentes con refugios y servicios. El calor y el frío extremos matan: cada voluntario debe estar capacitado para reconocer la hipotermia y el golpe de calor y para llamar sin demora a ayuda médica profesional — nunca esperar a ver qué pasa.",
    "setupHours": 24,
    "defaultCategory": "mutual_aid_drive",
    "firstSteps": "Antes de comprar una sola cobija, habla con los equipos de trabajo en calle y las organizaciones que ya recorren estas rutas — ellos tienen la confianza y el conocimiento de dónde está realmente la gente, y te dirán qué está cubierto y qué falta. Acuerda con ellos cómo vas a encajar, define los umbrales de pronóstico que activan tus rondas y abastece los insumos de la temporada mientras el clima todavía es templado.",
    "commonPitfalls": "El fracaso predecible es empezar cuando empieza el clima: los insumos conseguidos en plena ola de calor llegan cuando el peligro ya pasó, y los desconocidos que aparecen por primera vez en una crisis reciben un no receloso de gente que aprendió la cautela por las malas. Los fracasos peligrosos son voluntarios que intentan manejar una emergencia médica por su cuenta en vez de pedir ayuda de inmediato, y presionar a la gente a moverse o a aceptar un refugio — ofrece, informa y respeta la respuesta.",
    "pairsWith": [
      "cooling-warming-center",
      "harm-reduction-supplies",
      "resource-hub-dispatch"
    ],
    "tasks": [
      {
        "name": "Arma paquetes según la temporada",
        "description": "Prepara paquetes acordes a la estación: cobijas, calcetines abrigadores, gorros, guantes y calentadores de manos para el frío; agua, sobres de electrolitos, bloqueador solar, gorras y paños refrescantes para el calor. Agrega a cada paquete una tarjeta con las ubicaciones de los refugios y los números de crisis.",
        "hours": 4
      },
      {
        "name": "Consigue los insumos",
        "description": "Organiza colectas de donaciones, haz compras al por mayor y pide contribuciones a tiendas y congregaciones — y hazlo antes de la temporada, porque buscar cobijas durante la primera helada es llegar tarde. Acumula suficiente para reabastecer a mitad de temporada.",
        "hours": 4,
        "skills": [
          "difusión",
          "conducir"
        ]
      },
      {
        "name": "Mapea dónde encontrar a la gente",
        "description": "Trabaja con los equipos de calle existentes para saber dónde se quedan realmente las vecinas y vecinos sin techo — ellos tienen una confianza y un conocimiento construidos por años, y llegar a su lado vale más que llegar en frío. Mantén el mapa flexible y al día; la gente se mueve, sobre todo con mal clima.",
        "hours": 3,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Convoca y capacita a voluntarios de calle",
        "description": "Capacita a cada voluntario antes de su primera ronda: trato respetuoso que acepta un no por respuesta, seguridad personal y trabajar siempre en pares, y reconocer las emergencias médicas causadas por el clima. Nadie reparte hasta haber sido capacitado.",
        "hours": 4,
        "skills": [
          "enseñanza"
        ]
      },
      {
        "name": "Arma un plan de distribución y rutas",
        "description": "Planea rutas y horarios para los días previos al clima peligroso y durante este, llegando primero a las personas más expuestas — las más alejadas de los servicios, las que duermen a la intemperie y no en vehículos o refugios. Decide por adelantado qué pronóstico activa una ronda.",
        "hours": 3,
        "skills": [
          "organización"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Conecta a la gente con refugios y servicios",
        "description": "Lleva información vigente y verificada sobre centros de abrigo y enfriamiento, camas de refugio y el centro de recursos — los horarios y las reglas cambian todo el tiempo, y una referencia a una puerta cerrada quema la confianza. Ofrece conexiones sin presión; la relación dura más que cualquier noche.",
        "hours": 3,
        "skills": [
          "difusión"
        ]
      },
      {
        "name": "Prepárate para las emergencias",
        "description": "Capacita a cada voluntario para reconocer la hipotermia y el golpe de calor — confusión, habla arrastrada, piel caliente y seca o fría y húmeda — y para llamar de inmediato a los servicios de emergencia, no esperar a ver qué pasa. Ensayen qué hacer mientras llega la ayuda: sombra y agua, o cobijas y resguardo del viento.",
        "hours": 3,
        "skills": [
          "primeros auxilios"
        ]
      }
    ]
  }
];
