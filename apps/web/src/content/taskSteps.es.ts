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
// Spanish suggested starter steps (i18n Phase 2a split from
// taskSteps.ts). Loaded lazily via content/bundles/es.ts — never
// import this statically from app code.
export const TASK_STEPS_ES: Record<string, readonly (readonly string[])[]> = {
  "community-fridge": [
    [
      "Apunta tres tiendas, iglesias o clínicas cercanas con un rincón exterior techado",
      "Visita tu favorita y pide diez minutos con la persona dueña o encargada",
      "Habla sin rodeos del recibo de luz, los desastres y a quién llamar si se descompone",
      "Revisa que el enchufe sea exterior GFCI y siga prendido de noche",
      "Resume el acuerdo en un correo corto y consigue su sí por escrito"
    ],
    [
      "Publica ahora mismo una petición de refrigerador funcionando en un grupo local",
      "Consigue a alguien con camioneta y un diablito para el día de la recogida",
      "Enchufa el refrigerador donado y déjalo andar un día entero antes de construir nada",
      "Dibuja un cobertizo sencillo que deje una cuarta de espacio detrás para que ventile",
      "Constrúyelo, ancla el refrigerador para que no se vuelque y conéctalo en el sitio"
    ],
    [
      "Redacta el cartel en tu celular: toma lo que necesites, deja lo que puedas, y los no",
      "Reescribe cada no con su razón de seguridad al lado, que suene a cuidado y no a regaño",
      "Pide a dos vecinas o vecinos traducir el cartel a los idiomas de tu cuadra",
      "Imprímelo, plastifícalo y pégalo a la altura de los ojos",
      "Deja dentro un marcador y etiquetas en blanco para fechar los productos"
    ],
    [
      "Escribe a tres posibles voluntarias o voluntarios y pide un turno semanal de 15 minutos",
      "Arma un calendario compartido con dos nombres por turno, no uno",
      "Deja una cubeta con productos de limpieza junto al refrigerador",
      "Pega por dentro de la puerta una bitácora de limpieza con fechas",
      "Llena los últimos turnos vacíos antes de abrir, aunque tengas que insistir"
    ],
    [
      "Apunta las panaderías, tiendas y restaurantes a distancia caminable",
      "Visita uno a una hora tranquila y pregunta por lo que sobra al final del día",
      "Si les preocupa la responsabilidad legal, cuéntales de las protecciones para donantes",
      "Acuerden una hora fija de recolección semanal y ponla en tu calendario",
      "Lleva nota de qué fuentes de verdad cumplen cada semana"
    ],
    [
      "Manda un mensaje al grupo preguntando quiénes comparten la guardia de avisos",
      "Crea un número compartido gratuito tipo Google Voice, nunca el celular de una persona",
      "Acuerda con el grupo en cuánto tiempo se responde y quién cubre las vacaciones",
      "Escribe el número en una etiqueta a prueba de agua y pégala en el refrigerador"
    ]
  ],
  "community-garden": [
    [
      "Tómale una foto al terreno que tienes en mente la próxima vez que pases",
      "Busca a la persona dueña en los registros municipales, o toca la puerta y pregunta",
      "Pide un permiso escrito de un año, aunque sea una nota corta firmada",
      "Deja en el acuerdo quién paga el agua y con cuánto aviso pueden recuperar el terreno",
      "Toca las puertas junto al lote y pregunta qué les parecería un huerto"
    ],
    [
      "Busca la prueba de suelo del servicio de extensión local y pide el kit",
      "Toma muestras de varios puntos, sobre todo cerca de muros viejos y cercas",
      "Envía el kit semanas antes del día de construcción, porque los resultados tardan",
      "Mientras esperas, dibuja en papel las camas, los caminos y el rincón de herramientas",
      "Si sale plomo, planea camas elevadas con tierra limpia comprada"
    ],
    [
      "Publica en un grupo local una petición de madera sin tratar, composta y mantillo",
      "Rechaza durmientes y madera tratada vieja; usa cedro, bloque o pacas de paja",
      "Ponle fecha al día de construcción e invita a la gente",
      "Deja materiales y herramientas en el sitio desde el día anterior",
      "Levanta las camas con el grupo e instala la manguera o los barriles de lluvia"
    ],
    [
      "Escríbele al grupo para fijar una charla de 30 minutos sobre cómo compartir",
      "En la reunión, pongan las tres opciones en papel: parcelas, comunal o mezcla",
      "Decidan también qué pasa con una parcela si alguien desaparece a media temporada",
      "Anoten la decisión y cómo se toman los acuerdos, y compártanlo con todo el grupo"
    ],
    [
      "Busca ahora mismo la fecha de la última helada local y anótala",
      "Elige cinco cultivos fáciles para tu zona: hojas, frijol, calabaza, tomate, hierbas",
      "Traza un orden de siembra con dos semanas entre tandas para escalonar cosechas",
      "Siembra la primera tanda después de la helada y etiqueta cada surco"
    ],
    [
      "Crea un calendario compartido y anótate tú en el primer turno",
      "Llena primero julio y agosto: ahí es donde las rotaciones se caen",
      "Pide a cada persona constante un turno corto a la semana, no más",
      "Agrega la nota de regar al amanecer, no al mediodía",
      "Liga cada turno a un recordatorio en el celular"
    ],
    [
      "Pon el primer día de cosecha en el calendario compartido",
      "Pregunta al refri comunitario o a un puesto si reciben excedente el mismo día",
      "Ponte un recordatorio dos veces por semana para cosechar ejotes, pepinos y calabacitas",
      "Aparta un sobre etiquetado con semillas guardadas para el próximo año"
    ]
  ],
  "tool-lending-library": [
    [
      "Mándale un mensaje a una amistad con cochera o caseta y pregunta si prestaría el espacio",
      "Visita el lugar y revisa que esté seco, tenga cerradura y no haya escaleras de por medio",
      "Pregúntale al anfitrión cómo funcionaría un buzón para devoluciones fuera de horario",
      "Acuerda con el anfitrión entre 2 y 4 horas fijas por semana y anótalas"
    ],
    [
      "Publica un solo mensaje en el chat vecinal pidiendo las cinco herramientas más buscadas",
      "Prepara tres cajas rotuladas: se queda, a reparar y a desechar",
      "Enchufa y prueba cada herramienta eléctrica con carga; desecha la que se atasque",
      "Revisa que los cables no estén pelados y que las guardas sirvan antes de acomodar nada"
    ],
    [
      "Abre una hoja de cálculo y escribe cinco columnas: número, artículo, estado, costo, foto",
      "Numera diez herramientas con cinta o marcador y fotografía cada una junto a su número",
      "Busca el costo de reemplazo de cada herramienta y anótalo en su fila",
      "Marca cada herramienta con el nombre de la biblioteca para que nadie dude de quién es"
    ],
    [
      "Busca en línea las reglas de otra biblioteca de herramientas como punto de partida",
      "Redacta en diez líneas el plazo, el límite de piezas y una política amable de retrasos",
      "Agrega al registro una línea breve de préstamo bajo tu propio riesgo",
      "Anota las dos o tres herramientas caras que sí piden depósito o charla de seguridad",
      "Pídele a alguien que planee pedir prestado que lea el borrador y marque lo confuso"
    ],
    [
      "Consigue una tablilla y engánchale una pluma: ese es tu mostrador de préstamo",
      "Haz una hoja de registro (nombre, teléfono, número, fechas) e imprime diez copias",
      "Manda un mensaje al momento a cada persona nueva para confirmar que su número sirve",
      "Fotografía el estado de cada herramienta antes de que salga por la puerta"
    ],
    [
      "Escríbeles a tus dos voluntarias para apartar una hora de práctica esta semana",
      "Escribe una hoja de referencia: pasos de préstamo, catálogo y seguridad básica",
      "Practiquen rechazar con amabilidad una donación rota y anotar daños sin acusar",
      "Muéstrales dónde están el botiquín y los lentes de protección",
      "Observa a cada quien hacer un préstamo de prueba de principio a fin"
    ],
    [
      "Pega en el mostrador una hoja en blanco para anotar cada pedido que no puedas cumplir",
      "Agenda ahora mismo una fecha mensual para afilar y aceitar",
      "Revisa las devoluciones de la semana y aparta lo dañado en la caja de reparación",
      "Repasa la lista de deseos cada mes y elige la próxima herramienta a sumar"
    ]
  ],
  "neighborhood-care-network": [
    [
      "Escribe a una persona puente —pastor o conserje— y pregunta quién podría estar aislado",
      "Empieza una lista en papel en tu casa; nada de hojas compartidas ni chats de grupo",
      "Pide a dos vecinos de confianza que te presenten en vez de tocar puertas en frío",
      "Visita en persona a un administrador o grupo de fe y deja tu número",
      "Plantea cada invitación como oferta —¿una llamada semanal?— sin señalar a nadie"
    ],
    [
      "Escribe a tres amistades confiables: ¿pueden comprometerse a un contacto semanal?",
      "Redacta una convocatoria corta que diga el compromiso sin rodeos",
      "Pide dos referencias a quien vaya a hacer visitas a domicilio",
      "Aparta una hora y llama de verdad a cada referencia; no solo las archives",
      "Deja clara la regla desde el inicio: nadie maneja solo el dinero ni llaves de un vecino"
    ],
    [
      "Abre tu lista y anota el idioma, la calle y las preferencias de cada voluntario",
      "Llama a cada vecino y pregunta qué quiere de verdad: llamada, traslado o charla",
      "Arma la primera pareja por cercanía e idioma, y anota tus razones",
      "Diles a ambos que es una prueba que cualquiera puede terminar sin dar explicaciones"
    ],
    [
      "Escribe a la primera pareja y pregunta qué día y hora les acomoda a ambos",
      "Fija cada chequeo al mismo día y hora para que uno perdido se note de inmediato",
      "Redacta un guion de tres líneas para el primer contacto y envíalo a cada voluntario",
      "Guarda los horarios de todas las parejas en un solo lugar visible para la coordinación"
    ],
    [
      "Pregunta hoy a un vecino a quién querría que llamaran si un día no contesta",
      "Registra el contacto de crisis de cada vecino, y si prefiere evitar a la policía",
      "Escribe una página: sin respuesta → reintentar, llamar al contacto, cuándo escalar",
      "Imprime copias para cada voluntario en vez de dejar el plan en un solo teléfono"
    ],
    [
      "Escribe a un voluntario y pregunta qué necesidades se repitieron en su última visita",
      "Empieza una lista de necesidades recurrentes: traslados, medicinas, palear nieve",
      "Conecta cada necesidad con un voluntario u otro proyecto y confirma que se cumplió",
      "Deriva lo clínico —dosis, curaciones, levantar a alguien— a profesionales, con cariño"
    ],
    [
      "Manda a todo el equipo dos fechas posibles para una sesión de desahogo",
      "Aparta un lugar cómodo y pon la reunión en el calendario de todos",
      "Habla en privado con cada voluntario antes de la reunión grupal",
      "Rota ya a quien suene agotado, antes de que tenga que renunciar"
    ]
  ],
  "emergency-preparedness": [
    [
      "Abre los mapas oficiales de inundación e incendio de tu zona y toma captura de tus cuadras",
      "Camina tu calle y anota edificios con una sola salida y pisos altos sin elevador",
      "Toca puertas y pregunta quién depende de la luz para oxígeno o medicinas refrigeradas",
      "Marca todo en un mapa de papel: riesgos en un color, personas a cuidar en otro"
    ],
    [
      "Escribe primero la fila de tu propia casa: nombre, teléfono, dirección, necesidades",
      "Toca diez puertas con una hoja en mano y pide datos de contacto voluntarios",
      "Pide a un vecino constante por cuadra que sea capitán de unas diez casas",
      "Imprime el directorio, marca a quién tocarle la puerta y guarda copias en dos casas"
    ],
    [
      "Manda mensaje a dos vecinos para elegir un punto de encuentro al que se llegue a pie",
      "Acuerda las señales sin cobertura: toques de puerta, un canal de radio y hora fija",
      "Lleva las radios a los extremos del vecindario y pruébalas a la distancia real",
      "Imprime el plan de una página y repártelo puerta por puerta"
    ],
    [
      "Empieza el kit ya mismo: pon una linterna y pilas de repuesto en una caja rotulada",
      "Lista lo que falta — agua, botiquín, radio de manivela, cobijas — y divide las compras",
      "Guarda la caja donde dos o tres personas la alcancen sin depender de una sola llave",
      "Pega una fecha de rotación en la tapa y ponla en el calendario del grupo"
    ],
    [
      "Anota de memoria tres lugares candidatos: un salón, una iglesia, un parque con sombra",
      "Visita cada uno y pregunta por la llave a las 2 a.m., el combustible y el acceso en silla",
      "Consigue cada sí por escrito con el nombre y teléfono del anfitrión",
      "Suma los lugares confirmados al plan impreso"
    ],
    [
      "Pide por mensaje al anfitrión del lugar seguro una tarde del mes que viene",
      "Prepara tres estaciones prácticas: mochilas, llaves de paso y el árbol de contactos",
      "Invita en persona a los vecinos que más necesitan practicar",
      "Durante el simulacro, cronometra el árbol de contactos y anota dónde se rompe"
    ],
    [
      "Lista los roles en una hoja: chequeos médicos, abrir el lugar seguro, coordinar",
      "Llama a cada persona y consigue un sí de viva voz para su rol específico",
      "Nombra un suplente para cada rol, empezando por los chequeos a personas vulnerables",
      "Agenda dos revisiones al año y engrapa la hoja de roles al directorio"
    ]
  ],
  "free-store": [
    [
      "Escribe a dos lugares con espacio —una parroquia, un centro comunitario— y pide una fecha",
      "Visita la mejor opción y revisa que sea planta baja con banqueta para arrimar un auto",
      "Decidan en equipo: intercambio de un día, evento recurrente o tienda fija",
      "Aparta la misma fecha recurrente antes de salir del edificio"
    ],
    [
      "Copia la lista de sí/no de una tienda gratuita o de segunda mano como borrador",
      "Agrega sillas de auto usadas, cascos y colchones al lado del \"no\"",
      "Pide al equipo un visto bueno rápido para la lista final",
      "Haz dos copias en letra grande: una para la puerta de donaciones y otra para adentro"
    ],
    [
      "Anota en una hoja los nombres de tus estaciones: recepción, clasificación, exhibición",
      "Pregunta al anfitrión qué mesas y cajas presta, y etiqueta una como \"para reenviar\"",
      "Dibuja el flujo del salón para revisar donaciones en la puerta, no en las mesas",
      "Consigue a dos personas que clasifiquen la primera hora, cuando la pila es más grande"
    ],
    [
      "Pide en tu chat ganchos y un perchero que a alguien le sobren",
      "Cuelga la ropa por talla y pon una tarjeta de talla en cada sección del perchero",
      "Agrupa los artículos del hogar por tipo en mesas separadas",
      "Exhibe menos de lo que tienes y deja una caja para reabastecer bajo cada mesa"
    ],
    [
      "Manda al grupo la fecha y tres roles: recibir gente, clasificar y ordenar el salón",
      "Indica a quienes reciben: nunca preguntar por qué viene alguien ni cuánto se lleva",
      "Publica la lista de turnos para que cada quien sepa su hora y su estación",
      "Recorre el salón a media jornada y manda refuerzos adonde se vea saqueado"
    ],
    [
      "Llama a una organización aliada o recicladora textil y pregunta qué acepta de verdad",
      "Confirma su horario para el día siguiente a tu evento",
      "Deja apalabrada a una persona con auto grande antes de abrir",
      "Saca todo el mismo día para devolverle al anfitrión el espacio vacío"
    ]
  ],
  "skill-share": [
    [
      "Anota las dos preguntas en tu celular: qué podrías enseñar y qué te gustaría aprender",
      "En vez de \"¿en qué eres experto?\", pregunta para qué le piden ayuda siempre",
      "Pregunta hoy a las primeras tres personas: en persona o por mensaje, como sea más rápido",
      "Pasa cada respuesta a un formulario o una hoja sencilla sobre la marcha",
      "Marca con un círculo las coincidencias: ese es tu primer plan de clases"
    ],
    [
      "Escríbele a una persona que podría enseñar e invítala a un café esta semana",
      "Dile que una sesión es una charla con las manos ocupadas, no una conferencia",
      "Planeen juntos sus primeros cinco minutos, minuto a minuto",
      "Anoten los materiales necesarios y quién trae cada uno",
      "Ofrece un co-anfitrión a quien enseñe por primera vez y siga con nervios"
    ],
    [
      "Anota tres espacios gratis a los que preguntar: biblioteca, centro comunitario, una sala",
      "Escribe a cada uno preguntando por tardes y fines de semana libres",
      "Recorre el lugar y revisa que sirva: una clase de cocina necesita lavabo",
      "Pregunta exactamente quién abre y quién cierra, y anótalo",
      "Reserva el mismo horario recurrente para que asistir se vuelva costumbre"
    ],
    [
      "Abre una hoja y anota cada sesión confirmada: fecha, tema, quién enseña y qué traer",
      "Publica el calendario donde la gente ya mira, no en un lugar nuevo",
      "Mantén la inscripción libre o de un solo toque, nada más pesado",
      "Ponte un recordatorio semanal para confirmar en persona a quien enseña la próxima"
    ],
    [
      "Anota a tres personas que esperabas ver y no han venido",
      "Pregúntale a cada una directamente qué necesitaría para poder venir",
      "Resuelve la barrera concreta que más escuches: horario, niños, idioma o autobús",
      "Prueba una sesión en otro horario o con cuidado de niños y compara la asistencia"
    ]
  ],
  "bulk-buying-coop": [
    [
      "Escríbele a tres vecinos: ¿y si juntamos un pedido al mayoreo para ahorrar?",
      "Anota cada hogar interesado y los básicos que más compra",
      "Suma una quinta parte más de hogares de los que necesitas — algunos se saltarán ciclos",
      "Fija una fecha para reunirse en una cocina y acordar el ciclo de compra"
    ],
    [
      "Busca mayoristas de alimentos en tu zona y apunta tres teléfonos",
      "Llama al primero y pide su catálogo y su pedido mínimo",
      "Pregunta a cada uno por faltantes y si el precio se fija al pedir o al entregar",
      "Pregunta a un club de compras cercano qué proveedor usa y por qué",
      "Compara los tres en mínimos, entrega y básicos en una tabla rápida"
    ],
    [
      "Abre una hoja de cálculo con columnas: producto, precio unitario, hogar, cantidad",
      "Comparte el enlace en el chat del grupo con la fecha de cierre en el mensaje",
      "Pide por su nombre a una persona que coordine este ciclo",
      "Al cierre, copia la hoja y bloquea las ediciones antes de sumar el pedido"
    ],
    [
      "Abre un libro de cuentas compartido con las fechas de este ciclo en el título",
      "Avisa al grupo: se paga antes de hacer el pedido, sin excepciones",
      "Calcula el precio por unidad al centavo y redondea hacia arriba, no hacia abajo",
      "Registra cada pago en el libro en el momento en que llega"
    ],
    [
      "Escríbele a alguien con cochera o entrada para preguntarle por el día de entrega",
      "Llama al proveedor y pregunta cómo descarga el camión: ¿plataforma, tarima o acera?",
      "Aparta a tres personas para descargar, con fecha y hora concretas",
      "Prepara el espacio la víspera: piso libre, mesas plegables y paso para la carretilla"
    ],
    [
      "Imprime la lista de pedido de cada hogar antes de que llegue nadie",
      "Arma una estación por producto a granel con báscula, cucharón y bolsas",
      "Pon la báscula en cero con cada envase y pesa directo en la bolsa de cada hogar",
      "Pide a una segunda persona marcar cada lista antes de la entrega"
    ],
    [
      "Crea una nota llamada 'lista del ciclo' y apunta las primeras tres cosas que hiciste",
      "Pregunta en la entrega quién coordina el próximo ciclo y anota el nombre",
      "Entrega la lista y el acceso a la hoja en una sola sentada",
      "Suma cinco minutos en cada entrega para revisar precios y cumplimiento del proveedor"
    ]
  ],
  "repair-cafe": [
    [
      "Escríbele a la vecina que cose y al amigo que arregla electrónicos",
      "Haz una lista de huecos: qué categorías de reparación siguen sin nadie",
      "Consigue dos personas de electrónica o electrodomésticos, no una: su fila es la más larga",
      "Pregunta a cada sí qué herramientas traería y qué fechas le sirven"
    ],
    [
      "Dibuja el salón en papel y marca cada toma de corriente y ventana",
      "Da a cada estación una mesa, una lámpara y las herramientas que pidió quien repara",
      "Pon la soldadura y las baterías cerca de la ventilación, lejos del público",
      "Prueba cada regleta en casa antes de conectarla a la instalación del local",
      "Pega un letrero grande en cada estación para que la gente se ubique sola"
    ],
    [
      "Mándales a quienes reparan dos fechas posibles y ve cuál junta más síes",
      "Elige un día fijo del mes, digamos el primer sábado, no una fecha variable",
      "Aparta la sede para las próximas tres sesiones en una sola solicitud"
    ],
    [
      "Pídele a una persona voluntaria amable recibir a la gente en la primera sesión",
      "Prepara una ficha de media página: nombre, objeto y qué le pasa",
      "Agrega una línea de clasificación: probablemente reparable, difícil o necesita repuesto",
      "Pon en la ficha \"cada quien acompaña su reparación\" y dilo en la puerta"
    ],
    [
      "Mete un botiquín en la bolsa que llevarás a la sede",
      "Haz un letrero de entrada: las reparaciones se intentan, no se garantizan",
      "Escribe los noes firmes: nada de aparatos de corriente abiertos ni baterías hinchadas",
      "Diles a quienes reparan que un no por duda es la decisión correcta, y respáldalos"
    ],
    [
      "Pide a cada persona que repara mandarte las tres cosas que siempre se le acaban",
      "Haz una sola compra: hilo, fusibles, pegamento, sujetadores, cámaras y parches",
      "Coloca una caja común y una hoja de conteo en cada estación",
      "Revisa los conteos después de cada sesión y reabastece antes de la siguiente"
    ]
  ],
  "rides-transportation": [
    [
      "Escríbeles a dos personas que manejan y pregunta si tomarían un viaje al mes",
      "Siéntate con cada sí y mira la licencia y la tarjeta de seguro en físico",
      "Fotografía ambos documentos para el expediente: un \"sí, estoy cubierto\" no es registro",
      "Haz revisiones de referencias antes de que alguien lleve a una persona vulnerable",
      "Anota el vehículo de cada quien, sus asientos y si cabe una silla de ruedas"
    ],
    [
      "Escríbele a la aseguradora de un conductor y pregunta si cubre el manejo voluntario",
      "Consigue cada respuesta por escrito antes de que alguien haga su primer viaje",
      "Pide a una clínica de asistencia legal revisar un borrador de consentimiento sencillo",
      "Archiva cada confirmación escrita junto con las fotos de la licencia de esa persona"
    ],
    [
      "Elige el único canal para pedir viajes y anota su número o enlace",
      "Redacta las preguntas de admisión: hora de recogida, ubicaciones y contacto",
      "Pregunta siempre desde el inicio por el viaje de regreso y por sillas o andadores",
      "Fija una anticipación, digamos 48 horas, y publícala donde compartas el canal",
      "Corre una solicitud de práctica por todo el flujo antes de arrancar"
    ],
    [
      "Pídele a otra persona alternar contigo las semanas de coordinación",
      "Empareja cada solicitud con alguien que maneje y ten un respaldo por si cancelan",
      "Confirma con quien maneja y quien viaja el día anterior, de viva voz o por escrito",
      "Reparte los pedidos entre toda la lista, no solo entre los dos de confianza"
    ],
    [
      "Enlista los viajes que sí cubren: médicos, súper y trámites esenciales",
      "Dibuja la zona de servicio en un mapa y elige calles límite reales",
      "Escribe igual de claro los noes: sin emergencias, sin último minuto, sin salir del mapa",
      "Acuerda normas de espera y de cargar bolsas para que todo el equipo responda igual"
    ],
    [
      "Pregúntales a quienes manejan cuánto les cuesta la gasolina en un viaje típico",
      "Elige un modelo: fondo común pequeño, aportes opcionales o nada",
      "Que el dinero no entre al auto: cualquier aporte se hace en otro momento y en silencio",
      "Escribe la política en una frase y compártela con quienes manejan y quienes viajan"
    ],
    [
      "Crea ya el registro de viajes: fecha, quién maneja, quién viaja, destino, hecho",
      "Escribe las normas: no entrar a casas sin compañía, ni dinero fuera de lo acordado",
      "Empareja el primer viaje de cada conductor con alguien conocido o un segundo voluntario",
      "Haz seguimiento a las personas vulnerables tras cada viaje y anota lo que no cuadre"
    ]
  ],
  "tenant-union": [
    [
      "Escribe los nombres de cinco inquilinos en quienes los vecinos ya confían",
      "Pregúntate quiénes saben guardar una confidencia y tacha a quien te genere duda",
      "Invita a cada uno a un café a solas, no a una reunión grupal",
      "En la charla, pregúntale qué querría que el sindicato lograra primero",
      "Cierra proponiendo un ritmo de reuniones y un rol para cada quien"
    ],
    [
      "Imprime o dibuja un mapa de la cuadra y marca los edificios con quejas",
      "Elige un edificio y toca diez puertas con alguien más esta semana",
      "Pregunta qué está roto, qué temen y a quién acuden los vecinos por ayuda",
      "Pide permiso antes de anotar la historia de cualquier persona",
      "Codifica las unidades en tus notas y guarda la clave de nombres aparte"
    ],
    [
      "Busca la página oficial de derechos de inquilinos de tu ciudad o estado y guárdala",
      "Anota las cifras clave: plazos de aviso, tiempos de reparación, reglas de depósito",
      "Escribe la ley y la fecha en que verificaste junto a cada dato",
      "Escribe a una clínica de asistencia legal pidiendo que revise tu borrador",
      "Marca cada página con \"información, no asesoría legal\""
    ],
    [
      "Crea ahora mismo un chat grupal o la lista de la cadena telefónica con el comité",
      "Decidan quién responde primero y quién es el respaldo, con nombres",
      "Acuerden una promesa de respuesta que puedan cumplir: por ejemplo, dos horas",
      "Hagan un simulacro: manda una alerta de prueba y mide cuánto tardan en responder",
      "Corrige lo que el simulacro reveló antes de difundir el número"
    ],
    [
      "Escríbele a tu contacto de asistencia legal pidiendo un ponente y dos fechas posibles",
      "Reserva un salón al que los inquilinos lleguen fácil y fija la fecha",
      "Imprime guías para llevar a casa en los idiomas de tus edificios",
      "Prepara el cierre: el plazo del tribunal y el número al que llamar, dicho dos veces",
      "Invita a través de los líderes de cada edificio, no solo con volantes"
    ],
    [
      "Abre una página en blanco titulada \"Si recibes papeles de desalojo\"",
      "Pon primero, y en negrita, el plazo para responder al tribunal",
      "Lista los pasos en orden: documenta todo, llama a asistencia legal, avisa al sindicato",
      "Agrega \"nunca faltes a una cita en el tribunal\" como línea aparte",
      "Pide a tu contacto legal que lo lea antes que nadie"
    ],
    [
      "Empieza una lista de abogados de inquilinos, oficinas legales y consejeros de vivienda",
      "Llama a cada uno y pide un contacto con nombre, horarios de admisión y capacidad real",
      "Anota quién atiende emergencias y quién tiene lista de espera",
      "Deja la hoja de contactos donde todo el comité pueda tomarla",
      "Ponte un recordatorio para volver a verificar la hoja cada tres meses"
    ]
  ],
  "childcare-collective": [
    [
      "Escríbele a dos familias de confianza: ¿y si intercambiamos cuidado en vez de pagarlo?",
      "Fija una tarde en una sala, con botana y fecha firme",
      "En la reunión, pide a cada familia decir en voz alta sus reglas de disciplina y pantallas",
      "Cierra la reunión con una decisión: cooperativa de créditos o cuidado grupal con horario",
      "Escribe el modelo en un párrafo y envíalo a todas esa misma noche"
    ],
    [
      "Escribe la regla de nunca-a-solas al inicio de una hoja en blanco antes de la reunión",
      "Enlista qué pedirás a cada persona cuidadora: referencias y verificaciones necesarias",
      "Acuerda las proporciones de adultos por criatura según la edad y anótalas",
      "Di en voz alta con el grupo: la regla pesa más con las familias más cercanas",
      "Pide a cada familia fundadora firmar o responder de acuerdo a la lista final"
    ],
    [
      "Escríbele a la familia con la sala más probable y pide recorrerla juntos",
      "Ponte de rodillas y recorre el cuarto a la altura de un bebé, anotando cada peligro",
      "Compra o pide prestados cubre-enchufes, seguros de gabinetes y correas para muebles",
      "Guarda medicinas y limpiadores bajo llave en un gabinete alto y prueba el seguro",
      "Recorre el área exterior y anota portones, huecos y riesgos de agua"
    ],
    [
      "Abre un calendario compartido en tu teléfono y agrega un primer turno de prueba",
      "Haz una hoja de créditos con una fila por familia: horas dadas, horas recibidas",
      "Comparte la hoja para que cada familia vea todos los saldos desde el día uno",
      "Registra quién recibe en casa cada turno para que la carga se vea justa"
    ],
    [
      "Abre un documento con cuatro encabezados: alergias, medicinas, contactos, quién recoge",
      "Completa cada encabezado y envía el formato a las familias con una semana de plazo",
      "Pon las hojas llenas en una carpeta llamativa que quien cuida tome en segundos",
      "Define ya la regla del niño enfermo antes de que una mañana con fiebre la ponga a prueba",
      "Escribe los pasos de emergencia en tres líneas y pégalos dentro de la carpeta"
    ],
    [
      "Escribe al grupo para hallar una fecha en que todas las personas cuidadoras coincidan",
      "Busca un curso cercano de primeros auxilios pediátricos y RCP y comparte el enlace",
      "Repasa supervisión, sueño seguro y alergias con los formatos reales en la mano",
      "Ensaya la emergencia en voz alta: quién llama, quién se queda, dónde están las hojas"
    ],
    [
      "Escribe a dos o tres familias para agendar un piloto de dos horas en fecha concreta",
      "Haz el piloto pequeño: pocas criaturas, dos adultos y todas las reglas activas",
      "Después, pregúntales a las niñas y los niños cómo les fue, no solo a sus familias",
      "Habla con honestidad de los casi-accidentes y enlista qué arreglar",
      "Fija la fecha de la siguiente sesión solo cuando los arreglos estén acordados"
    ]
  ],
  "community-composting": [
    [
      "Escríbele a quien coordina el huerto comunitario para preguntar por un rincón libre",
      "Párate en cada sitio candidato y ubica la llave de agua y la ventana vecina más cercanas",
      "Toca las puertas más próximas y habla de olores y ratas antes de que la duda crezca",
      "Consigue el permiso por escrito y revisa las reglas locales de compostaje"
    ],
    [
      "Escríbele a alguien que haya mantenido una pila caliente y pregúntale qué elegiría aquí",
      "Calcula tus restos semanales en cubetas: hogares por más o menos un bote cada uno",
      "Revisa la regla del metro cúbico: sin ese volumen la pila se queda fría y no avanza",
      "Ajusta el método a cuánto pueden voltear de verdad y anota la decisión para el grupo"
    ],
    [
      "Pregunta en el chat quién tiene tarimas, un bieldo o un termómetro de composta",
      "Junta ya material café — hojas en bolsas o cartón aplanado — antes del primer resto",
      "Construye o compra la estructura y colócala en el punto acordado",
      "Haz un solo viaje por lo que falte: termómetro, bieldo, contenedor de entrega"
    ],
    [
      "Escríbele a cinco hogares probables para preguntar qué día de entrega les acomoda",
      "Reparte botes de cocina con el calendario de entrega pegado en cada tapa",
      "Avisa que nada de bolsas compostables: sobreviven la pila hechas tiras de plástico",
      "Publica los horarios de entrega en el contenedor y en el chat del grupo"
    ],
    [
      "Escribe en papel la lista de sí y no: fruta y café sí; carne, lácteos y aceites no",
      "Busca o dibuja una imagen por elemento: un hueso de pollo tachado dice más que un párrafo",
      "Imprímela a prueba de agua y pégala en la tapa misma del contenedor, no en un poste",
      "Pide a dos personas que hablen los otros idiomas del barrio que revisen el texto"
    ],
    [
      "Pide a tres personas confiables, por su nombre, un turno de volteo al mes",
      "Haz una sesión práctica: voltea la pila con el grupo y enseña la prueba de la esponja",
      "Pon un nombre en cada semana del calendario: 'el equipo' es lo mismo que nadie",
      "Cuelga una bitácora plastificada en el sitio: fecha, temperatura, humedad, quién volteó"
    ],
    [
      "Avísale al huerto comunitario que casi hay una tanda lista y pregunta cuánta usarían",
      "Deja curar la tanda unas semanas extra y tamiza los trozos antes de prometer fecha",
      "Anuncia un día de recogida para quienes aportaron: que traigan cubetas o bolsas",
      "Guarda una foto de la pila terminada para la próxima convocatoria"
    ]
  ],
  "free-little-library": [
    [
      "Busca en tu grupo de regalos o en marketplace un gabinete o caja de periódicos gratis",
      "Dibuja la caja: techo inclinado, puerta clara y un borde bajo la puerta contra la lluvia",
      "Reúne los materiales y constrúyela, sellando la base y cada unión",
      "Rocíala un minuto con la manguera y arregla por donde entre agua"
    ],
    [
      "Escríbele a la persona del jardín o muro que tienes en mente y pregunta si acepta",
      "Párate en el lugar y verifica que una silla de ruedas o carriola aún pase por la acera",
      "Pregunta por permisos o reglas del vecindario si no es propiedad privada",
      "Instala el poste o soporte y sacude la caja con fuerza para confirmar que quedó firme"
    ],
    [
      "Publica un mensaje en tu chat pidiendo libros en buen estado, sobre todo infantiles",
      "Pon una caja rotulada en tu puerta o en el punto anfitrión y dale una semana",
      "Retira todo lo manchado, con moho o desactualizado antes de que llegue al estante",
      "Acomoda una mezcla a medio llenar, con los libros infantiles al frente"
    ],
    [
      "Escribe \"Llévate un libro, deja un libro — todo gratis\" en un papel como borrador",
      "Agrega una línea dando la bienvenida a todas las edades e idiomas",
      "Léelo en voz alta y quita todo lo que suene a obligación",
      "Haz el letrero final y fíjalo por dentro de la puerta, donde no llegue la lluvia"
    ],
    [
      "Escríbele al vecino que vive más cerca de la caja y pídele cinco minutos por semana",
      "Reúnete con esa persona en la caja y hagan juntos una ordenada rápida",
      "Acuerda qué se retira al momento: lo mohoso y títulos para adultos al alcance de niños",
      "Pide a una segunda persona que sea suplente para vacaciones y semanas de enfermedad"
    ]
  ],
  "community-first-aid-training": [
    [
      "Busca el teléfono de tu Cruz Roja local y guárdalo en tus contactos",
      "Llama para preguntar por una clase y si eximen el costo a grupos comunitarios",
      "Pregunta el límite de estudiantes por maniquí y qué necesitan del espacio anfitrión",
      "Contacta a un grupo de reducción de daños o a salud sobre capacitación en sobredosis",
      "Anota en un solo lugar las fechas que ofrece cada quien"
    ],
    [
      "Escríbele a la persona instructora para preguntar si trae sus maniquíes de RCP",
      "Manda un correo a la secretaría de salud preguntando por naloxona gratuita",
      "Cotiza botiquines básicos con dos proveedores y elige uno",
      "Al llegar la naloxona, anota su vencimiento y guárdala dentro, a temperatura ambiente"
    ],
    [
      "Anota tres salones que podrías pedir: biblioteca, centro comunitario, clínica",
      "Visita uno y revisa que haya piso libre para arrodillarse, lavabo y entrada accesible",
      "Pregunta si puedes reservar el mismo día del mes de forma recurrente",
      "Cruza las fechas del salón con las de la persona instructora y reserva dos sesiones"
    ],
    [
      "Escríbeles a dos personas que probablemente irían y pide que traigan a alguien más",
      "Pide a negocios cercanos y grupos de apoyo a familias que compartan la inscripción",
      "Arma un formulario gratuito con dos horarios para quienes trabajan por turnos",
      "Ofrece cuidado de niños y algo de comer, y dilo desde la invitación",
      "Apunta unos cupos de más y planea un mensaje de confirmación el día anterior"
    ],
    [
      "Escríbele a la persona instructora dos días antes para confirmar hora y asistencia",
      "Llega una hora antes para preparar el piso, la hoja de registro y agua",
      "Abre diciendo que se practica con maniquíes y que pueden salir en la parte de sobredosis",
      "Verifica que cada persona practique con las manos, no solo mire",
      "Entrega las tarjetas de referencia a la salida"
    ],
    [
      "Cuenta tus botiquines y dosis de naloxona y anota el número",
      "Entrega un botiquín a cada persona y apunta quién llevó naloxona y su vencimiento",
      "Agenda el primer repaso dentro del año, antes de que la gente se disperse",
      "Pon un recordatorio un mes antes del primer vencimiento de naloxona para reponerla"
    ]
  ],
  "time-bank": [
    [
      "Escribe una lista de diez o quince vecinos con quienes de verdad podrías sentarte",
      "Escríbeles hoy a los primeros tres para agendar charlas cortas uno a uno",
      "En cada charla, pide una oferta e insiste también en una necesidad",
      "Registra cada oferta y necesidad en una sola hoja sobre la marcha",
      "Sigue convocando hasta que la hoja muestre variedad: transporte, arreglos, clases"
    ],
    [
      "Pregúntale a quien coordinará qué herramienta ya usa cada semana",
      "Prueba registrar tres intercambios inventados en una hoja de cálculo simple",
      "Prueba una app de banco de tiempo solo si la hoja se quedó corta",
      "Confirma que puedes exportar todo el registro antes de comprometerte con nada",
      "Elige lo más simple que pasó la prueba y anota cómo funciona"
    ],
    [
      "Agenda la reunión de reglas e invita a las personas fundadoras",
      "Escribe la primera regla arriba: una hora es un crédito, sin excepciones",
      "Acuerden cómo se pide, se confirma y se registra un intercambio",
      "Decidan desde ya qué pasa si alguien se va debiendo horas o queda muy en negativo",
      "Resume todo en una página y léela en voz alta antes de aprobarla"
    ],
    [
      "Elige una fecha y envía a los miembros una invitación breve a la orientación",
      "Prepara diez minutos: la filosofía y luego un intercambio registrado en vivo",
      "Carga unos créditos iniciales en el saldo de cada nuevo miembro",
      "Antes de que alguien se vaya, que agende un intercambio real ahí mismo",
      "A la semana, busca a quien aún no haya tenido su primer intercambio"
    ],
    [
      "Abre la hoja de miembros y pasa todas las ofertas a una sola lista",
      "Agrega columnas de cuándo y dónde está disponible cada persona",
      "Escríbele a quien le falte anotar sus días disponibles o hasta dónde llega",
      "Publica el directorio donde los miembros ya miran",
      "Pon un recordatorio mensual en tu calendario para depurar entradas viejas"
    ],
    [
      "Abre el registro y encuentra hoy una necesidad pendiente que empate con una oferta",
      "Escríbeles a ambos miembros para proponer el intercambio y ofrecer presentarlos",
      "Busca a quienes ganaron horas y nunca las gastaron, y escríbeles por su nombre",
      "Anima con una sugerencia concreta a alguien que se unió y no ha intercambiado",
      "Anota qué emparejamientos funcionaron para que el próximo mes sea más fácil"
    ],
    [
      "Anota tres normas de seguridad: referencias, primer encuentro en público, rechazo fácil",
      "Agrega una forma de rechazar un emparejamiento sin dar explicaciones",
      "Nombra a una persona, no un formulario, que reciba las inquietudes",
      "Lleva las normas a la próxima reunión y ajústenlas en voz alta",
      "Publica las normas finales donde la gente se inscribe"
    ]
  ],
  "solidarity-fund": [
    [
      "Escribe los nombres de las tres o cinco personas a quienes confiarías dinero común",
      "Escríbele a cada una pidiendo una hora para hablar del fondo",
      "Hablen con franqueza de pagos, transparencia y qué pasa cuando el dinero no alcanza",
      "Acuerden que cualquiera se aparta de una decisión si aplica un amigo o familiar",
      "Mantengan el equipo en número impar para que los votos no se empaten"
    ],
    [
      "Escríbele a un contador o a una organización que asesore a grupos y pide una llamada corta",
      "Pregunta por el lado legal y de impuestos antes de abrir nada",
      "Abran una cuenta dedicada o usen un patrocinador fiscal; nunca una cuenta personal",
      "Dejen por escrito la regla: dos firmas para cada pago",
      "Inicia el libro de cuentas con columnas de fecha, monto, propósito y quién aprobó"
    ],
    [
      "Agenda esta semana una reunión del equipo para definir criterios",
      "Redacta un borrador: quién puede pedir, montos típicos y cada cuánto se puede pedir",
      "Fijen un tope por solicitud y un total mensual que no rebasarán",
      "Eliminen todo comprobante de necesidad del que puedan prescindir",
      "Escriban los criterios finales en una página que todo el equipo apruebe"
    ],
    [
      "Abre un formulario en blanco y pon solo tres campos: nombre, contacto y qué se necesita",
      "Agrega una pregunta: cómo prefieres recibir el dinero",
      "Borra todo lo que huela a comprobante: ni números de ID ni cartas del arrendador",
      "Habilita también solicitudes por teléfono y en persona, no solo en línea",
      "Pide a alguien de fuera que lo pruebe y te diga dónde se siente invasivo"
    ],
    [
      "Escríbeles a cinco miembros preguntando si aportarían un monto pequeño mensual",
      "Configura la opción de donación recurrente antes de planear una campaña grande",
      "Escribe la frase para donantes: el dinero va directo a vecinos en crisis",
      "Anuncia el fondo donde la gente ya conversa y pide que lo compartan",
      "Registra cada aporte prometido en el libro de cuentas para prever el próximo mes"
    ],
    [
      "Mándale al equipo una propuesta de plazo: por ejemplo, decidir en 48 horas",
      "Definan un monto pequeño que dos personas aprueben el mismo día, sin reunión",
      "Anoten los pagos más rápidos: efectivo, transferencia o pago directo a la factura",
      "Escriban en una página los pasos: quién revisa, quién firma, quién paga",
      "Registra cada decisión en una línea: fecha, monto y las dos personas que aprobaron"
    ],
    [
      "Abre el libro de cuentas y apunta las cifras del mes: entradas, salidas, vecinos apoyados",
      "Redacta un resumen de tres líneas solo con números, sin anécdotas, nunca",
      "Reléelo revisando que nada pueda identificar a un beneficiario",
      "Publícalo donde donantes y miembros ya miran",
      "Repítelo el mismo día de cada mes para que la gente aprenda a esperarlo"
    ]
  ],
  "diaper-hygiene-bank": [
    [
      "Escribe a alguien de una clínica, iglesia o despensa y pregunta si les sobra un clóset",
      "Visita los dos lugares más prometedores y revisa humedad, plagas y una puerta con llave",
      "Párate donde las familias recogerían y confirma que no quedan a la vista de la sala",
      "Consigue por escrito qué clóset o repisa es tuya y quién guarda la llave"
    ],
    [
      "Busca 'banco de pañales' junto con tu región y anota el contacto del más cercano",
      "Escribe a la red o a un mayorista y pregunta el precio por caja de las tallas 4, 5 y 6",
      "Anota tres posibles sedes de colecta — escuela, gimnasio, trabajo — y escribe a una hoy",
      "Arma una hoja sencilla: fuente, qué aporta y qué tan constante ha sido"
    ],
    [
      "Toma un marcador y rotula una repisa o caja por talla antes de mover ninguna caja",
      "Divide cada caja en paquetes listos para entregar mientras acomodas, no en la puerta",
      "Cuenta lo que hay en cada repisa y apunta los totales por talla en una hoja",
      "Encierra las dos tallas más escasas y pásale esas cifras a quien consigue el suministro"
    ],
    [
      "Llama a un banco de pañales cercano y pregunta qué cantidad mensual por niño fijaron",
      "Redacta una sola frase: cuántos por niño, cada cuánto, y nunca pedir comprobantes",
      "Léesela a dos voluntarios y a una madre o padre y ajusta lo que suene a examen",
      "Publica la cifra honesta donde las familias la vean, para que nadie tenga que preguntar"
    ],
    [
      "Pregunta por mensaje a la sede qué día y hora fijos les funcionan cada mes",
      "Escribe a tres posibles voluntarios con la fecha fija y pide un sí permanente",
      "Repasa con el equipo la única regla: entregar el paquete sin hacer preguntas",
      "Pon un recordatorio para confirmar a tu gente dos días antes de cada entrega"
    ]
  ],
  "community-bike-workshop": [
    [
      "Escríbele a tres personas que puedan prestar cochera, sótano o un rincón sin uso",
      "Recorre cada opción y mide la pared para colgar bicis en vertical",
      "Revisa las cerraduras y pregunta cómo queda asegurado el espacio de noche",
      "Antes del sí, acuerda con quien presta almacenamiento, horarios de acceso y seguro"
    ],
    [
      "Pregunta en el chat del grupo quién tiene herramientas de bici arrumbadas en un cajón",
      "Pregunta en una tienda de bicis si donarían herramientas usadas o venden un caballete",
      "Enlista el kit que falta — desmontables, llaves de conos, cortacables — y cotízalo",
      "Cuelga un panel y traza el contorno de cada herramienta para ver al cierre cuál falta"
    ],
    [
      "Apunta en tu teléfono el no rotundo: nada de bicis de súper oxidadas",
      "Redacta una convocatoria corta con ese no al inicio, más día y dirección de entrega",
      "Publícala en dos canales del barrio",
      "Clasifica cada bici al llegar: reparable, para refacciones o lista para rodar",
      "Desarma pronto las de refacciones y ordena las piezas por tipo para hallarlas fácil"
    ],
    [
      "Escríbeles a las dos personas que mejor arreglan bicis y pídeles un turno a cada una",
      "Pide a cada una que te guíe a parchar una llanta sin que toque la rueda",
      "Elige a quienes dejan que alguien nuevo batalle: esa paciencia es todo el trabajo",
      "Pon el nombre de cada mecánica o mecánico en un turno concreto del calendario"
    ],
    [
      "Pregunta en el chat cuáles dos horarios semanales le quedan a más gente",
      "Escribe los horarios en la puerta y publícalos cada semana en los mismos canales",
      "Dibuja el trato de gánate-una-bici en una tarjeta: sesiones, habilidades, bici ganada",
      "Haz una tarjeta perforable por aprendiz para que cualquier mecánico lea su avance"
    ],
    [
      "Mete en una bolsa un botiquín y dos pares de lentes de seguridad para el taller",
      "Escribe las reglas en un cartel: lentes, pelo recogido, preguntar antes del taladro",
      "Haz una tarjeta de salida con firma para frenos, llantas y dirección de cada bici",
      "Pide que esa revisión final la firme alguien distinto de quien armó la bici"
    ]
  ],
  "newcomer-translation-network": [
    [
      "Escríbeles a dos personas bilingües y pregúntales si ayudarían a interpretar",
      "Anota los tres idiomas que más escuchas en las escuelas y tiendas de tu zona",
      "Pide a una maestra de ESL o líder de congregación que corra la voz",
      "Pide a cada persona que interprete una frase médica ida y vuelta antes de sumarla",
      "Registra cada sí con idioma, dialecto y disponibilidad en un solo lugar"
    ],
    [
      "Abre una nota y apunta los cinco servicios que ya conoces por nombre",
      "Llama hoy a una clínica y pregunta qué idiomas atienden de verdad",
      "Anota en cada entrada si piden identificación o estatus migratorio",
      "Pregunta a una organización de personas migrantes qué lugares recomienda y cuáles no",
      "Reúne direcciones, horarios y un contacto de cada lugar en un solo directorio"
    ],
    [
      "Escríbele a una persona voluntaria y pregúntale si tomaría llamadas un mes de prueba",
      "Prepara una sola línea telefónica o formulario donde caigan todas las solicitudes",
      "Limita la ficha a nombre de pila, idioma, necesidad y un número para devolver la llamada",
      "Empareja cada solicitud por idioma y necesidad, y confirma con ambas partes",
      "Pide a un amigo hacer una solicitud de prueba y síguela por todo el flujo"
    ],
    [
      "Apunta las cinco preguntas que más te hacen las personas recién llegadas",
      "Redacta una página en lenguaje sencillo del tema principal, con más imágenes que texto",
      "Haz que alguien nativo de cada comunidad lea el borrador en voz alta antes de imprimir",
      "Imprime un primer lote pequeño, repártelo y corrige lo que confunda"
    ],
    [
      "Pregúntale a una persona recién llegada con cita próxima si quiere compañía",
      "Empareja por idioma y confirma hora y punto de encuentro con ambas partes",
      "Prepara a la persona voluntaria: interpretar en primera persona, sin agregar ni aconsejar",
      "Haz seguimiento con ambas partes y anota qué harías distinto la próxima vez"
    ],
    [
      "Escribe una línea arriba de la ficha: nunca se pregunta el estatus migratorio",
      "Tacha del formulario cada campo sin el cual podrías trabajar igual",
      "Decide cuánto tiempo viven los registros y agenda el día en que los borras",
      "Escribe tu respuesta a una solicitud de expedientes: qué guardas y qué nunca recopilas",
      "Repasa las reglas con cada persona voluntaria antes de su primera solicitud"
    ]
  ],
  "community-meal": [
    [
      "Apunta tres salones con cocina: una iglesia, un centro comunitario, una escuela",
      "Llama o escribe a uno para pedir una visita",
      "En la visita revisa lavamanos aparte, agua caliente y espacio de refrigerador",
      "Confirma que el salón esté libre los días que planeas",
      "Consigue el sí por escrito, aunque sea un correo corto"
    ],
    [
      "Busca el teléfono de la autoridad sanitaria local y anótalo",
      "Llama y pregunta específicamente por exenciones para comidas benéficas",
      "Inscríbete ya al curso de manejo de alimentos: se llena con semanas de anticipación",
      "Escribe las reglas de temperatura y almacenamiento donde todo el equipo las vea"
    ],
    [
      "Escríbele a una tienda o restaurante que conozcas y pregunta si donarían",
      "Visita a dos proveedores más en persona a una hora tranquila",
      "Compromete a cada donante con un día y una cantidad concretos, no \"lo que sobre\"",
      "Pregunta a la huerta comunitaria o al grupo de recolección qué excedente pueden mandar",
      "Lleva una sola lista de quién da qué y cuándo, y actualízala tras cada comida"
    ],
    [
      "Revisa tu lista de fuentes y anota qué incluye de verdad la donación de la semana",
      "Elige un plato principal naturalmente vegetariano, sin frutos secos ni mariscos",
      "Escala la receta en papel y lista las cantidades por comprar o pedir",
      "Escribe las etiquetas de alérgenos de cada platillo antes del día de cocina"
    ],
    [
      "Escribe a cinco personas y pide a cada una un rol: preparar, cocinar, servir o limpiar",
      "Suma a cada turno dos personas más de las que estrictamente necesita",
      "Nombra a quien lidere la primera cocina y a una segunda persona para formarse desde ya",
      "Comparte la lista y confirma con todos dos días antes de la comida"
    ],
    [
      "Pregúntales a tres personas que vendrían a comer qué día y hora les sirve de verdad",
      "Elige un día y hora que puedan sostener un año, no los más ambiciosos",
      "Haz un volante cálido y simple: día, hora, lugar, gratis, todo el mundo bienvenido",
      "Deja volantes en albergues, lavanderías y tiendas de la esquina",
      "Pide a anfitriones y aliados que corran la voz"
    ],
    [
      "Escríbele al equipo el día anterior para confirmar turnos y horas de llegada",
      "Pega en la cocina el plan del día: quién prepara, cocina, sirve y limpia",
      "Sirve en mesas donde se pueda, en vez de formar una fila",
      "Pasa las sobras a recipientes bajos y al refri antes de dos horas de servidas",
      "Deja la cocina lista para inspección y anota lo que se esté acabando"
    ]
  ],
  "seed-library": [
    [
      "Busca el correo o teléfono de la biblioteca y anota el nombre de quien la dirige",
      "Envía un mensaje preguntando si recibirían un pequeño mueble de semillas",
      "Visita el lugar y elige un rincón lejos de ventanas, muros exteriores y calefacción",
      "Lleva una caja de sobres pequeños y un marcador para dejarlos junto al mueble"
    ],
    [
      "Escríbele a un jardinero con experiencia y pregúntale qué variedades se dan bien aquí",
      "Escribe a un vivero cercano y a un huerto comunitario pidiendo sobrantes de temporada",
      "Publica una sola petición de semillas donde la gente del grupo ya mira",
      "Revisa lo donado al llegar y aparta la semilla tratada de colores y los híbridos"
    ],
    [
      "Toma la caja de donaciones y separa los sobres en verduras, hierbas y flores",
      "Escribe en grande el nombre de la planta y el año en cada sobre",
      "Marca con un color las variedades fáciles para que un principiante se sirva solo",
      "Acomoda cada sección con la semilla más vieja al frente",
      "Agrega una nota breve de cultivo a las variedades más exigentes"
    ],
    [
      "Abre una hoja y escribe las tres reglas: toma gratis, cultiva, devuelve si puedes",
      "Agrega un límite de un par de sobres por variedad por persona",
      "Redacta la devolución como un regalo bienvenido, nunca como una obligación",
      "Imprime la hoja y pégala por dentro de la puerta del mueble"
    ],
    [
      "Elige un día de esta semana para visitar el mueble y anótalo en tu calendario",
      "Saca todos los sobres con más de dos años",
      "Prueba los lotes dudosos: diez semillas en una toalla de papel húmeda por una semana",
      "Retira cualquier lote donde broten menos de seis",
      "Anota las tres variedades más vacías y escribe a quienes donan para reponerlas"
    ]
  ],
  "digital-literacy": [
    [
      "Publica una petición de laptops y tabletas sin uso en un chat grupal que ya tengas",
      "Al recoger, mira que quien dona cierre su cuenta de iCloud o Google antes de entregar",
      "Pon una caja de 'funciona' y otra de 'piezas' y clasifica cada equipo al llegar",
      "Borra, actualiza y prueba un equipo de principio a fin antes de seguir con el resto"
    ],
    [
      "Abre una hoja en blanco y escribe cinco columnas: quién, equipo, serie, estado, fecha",
      "Numera cada equipo y su cargador como un solo juego con etiquetas iguales",
      "Escribe en dos frases el plazo del préstamo y una política de retraso sin regaños",
      "Haz un préstamo de prueba con alguien del equipo para ver qué le falta al formato"
    ],
    [
      "Busca la página de préstamo de puntos de acceso de tu biblioteca y anota qué ofrecen",
      "Llama a dos compañías o a un programa de bajo costo y pregunta el límite real de datos",
      "Imprime media hoja con los puntos de WiFi gratis cerca de donde vive la gente",
      "Prueba un punto de acceso con una videollamada de diez minutos antes de prestarlo"
    ],
    [
      "Escribe a dos amistades pacientes y pregunta si acompañarían a un principiante al mes",
      "Anota tres reglas en una tarjeta: quien aprende maneja, sin jerga, sin tocar el mouse",
      "Haz el juego de roles: cada tutor guía una tarea completa sin tocar el equipo",
      "Empareja a cada tutor nuevo con un aprendiz real y acompaña la primera sesión"
    ],
    [
      "Escribe a un futuro aprendiz y pregúntale qué es lo que más quiere hacer en línea",
      "Elige los cuatro temas principales y dale a cada uno su página — una habilidad por hoja",
      "Captura las pantallas exactas que van a ver y pégalas en grande en cada página",
      "Dale un borrador a un aprendiz y observa dónde duda su dedo"
    ],
    [
      "Pide por mensaje al espacio anfitrión dos horarios semanales: uno de día, otro de noche",
      "Limita la inscripción a seis por clase para que nadie espere callado al fondo",
      "Consigue a una segunda persona que circule en las horas abiertas para los casos difíciles",
      "Pon el horario en volantes de papel en los lugares donde ya va tu gente"
    ],
    [
      "Busca los pasos de restablecimiento de fábrica de tus dos modelos más comunes",
      "Pega una lista en la mesa de devolución: guarda primero las fotos, luego borra todo",
      "Escribe en un párrafo qué pasa si un equipo se pierde o se daña, sin cerrar la puerta",
      "Suma una charla de cinco minutos sobre contraseñas y privacidad a cada entrega"
    ]
  ],
  "weatherization-brigade": [
    [
      "Escríbeles a las tres personas más hábiles con las manos y pídeles un día al mes",
      "Publica el aviso en los tableros de la ferretería y la maderería",
      "Pregunta a cada quien qué trabajos ha hecho de verdad, no cuáles podría hacer",
      "Empareja a cada persona nueva con alguien con experiencia en un trabajo sencillo"
    ],
    [
      "Invita a tus dos líderes con más experiencia a una charla de una hora sobre el alcance",
      "Anota los trabajos que sí tomarán: sellado, burletes, barras de apoyo, arreglos menores",
      "Escribe la lista de detenerse y derivar: electricidad, gas, techos, estructura",
      "Suma la pintura con plomo y el aislamiento viejo para casas anteriores a 1978",
      "Imprime ambas listas en una hoja para cada integrante de la cuadrilla"
    ],
    [
      "Elige el número de teléfono que recibirá los pedidos y confírmalo con la cuadrilla",
      "Haz un formulario en papel y deja copias en la despensa y el centro de adultos mayores",
      "Redacta una lista de visita de una página: alcance, materiales y límites de seguridad",
      "Agenda las evaluaciones en pares: dos personas recorren cada casa",
      "Fotografía todo en la visita y di que confirmarás el plan después, no en la puerta"
    ],
    [
      "Toma la lista de materiales de la última evaluación y suma cantidades",
      "Pide a la ferretería un descuento o donación para la cuadrilla",
      "Compra selladores de bajo olor y bajo COV para casas habitadas",
      "Rotula una caja de herramientas compartida y anota su contenido en la tapa"
    ],
    [
      "Escríbele a la aseguradora o a una ONG local por la cobertura de reparaciones voluntarias",
      "Consigue por escrito que la póliza cubra la reparación domiciliaria voluntaria",
      "Redacta una exención sencilla e imprime copias para cada residente y voluntaria",
      "Revisa el botiquín y fija la regla de escaleras: alguien sostiene, nunca el último peldaño"
    ],
    [
      "Elige un sábado y asigna dos o tres trabajos ya evaluados a las cuadrillas",
      "Llama a cada residente la semana anterior para acordar el plan y la hora de llegada",
      "Vuelve a llamar la misma mañana, para que nadie se sorprenda con la cuadrilla",
      "Lleva agua, bolsas de basura y material de limpieza para no generarle gastos a la casa",
      "Recorre el trabajo terminado con la persona residente antes de irse"
    ]
  ],
  "pet-food-bank": [
    [
      "Escríbele a quien coordina la despensa y pregunta si comparten espacio y día de entrega",
      "Recorre el lugar y revisa que sea seco, sin plagas y con llave",
      "Cotiza recipientes sellados y una tarima o repisa para elevar el alimento del piso",
      "Confirma el punto de entrega y los horarios con quien te presta el espacio"
    ],
    [
      "Llama a una tienda de mascotas y pregunta qué hacen con las bolsas rotas o dañadas",
      "Manda una solicitud breve de donación a dos tiendas más y a una veterinaria",
      "Fija un día de recolección mensual con quienes digan que sí",
      "Lleva un registro sencillo de lo que entra cada semana para detectar huecos"
    ],
    [
      "Toma un marcador y rotula tres recipientes: perro, gato, otros",
      "Revisa la fecha de caducidad de cada bolsa y retira lo vencido",
      "Aparta las dietas veterinarias o de prescripción en su propio recipiente rotulado",
      "Cuenta cada recipiente y pon los totales donde el equipo los vea"
    ],
    [
      "Escríbele a un amigo con mascotas y pregúntale cuánta comida gastan sus animales al mes",
      "Define porciones según número y tamaño de animales, no una bolsa igual para todos",
      "Fija una frecuencia con la que la gente pueda contar: misma cantidad, mismo calendario",
      "Escribe la política en un párrafo, sin exigir pruebas de necesidad"
    ],
    [
      "Escríbeles a dos personas voluntarias y pregunta qué día recurrente pueden cubrir",
      "Fija el mismo día y hora cada mes para que la gente pueda contar contigo",
      "Antes de cada sesión, revisa que haya comida de perro y de gato en la mesa",
      "Acuerda con el equipo: nada de juicios, solo entregar la comida con respeto"
    ]
  ],
  "youth-mentorship": [
    [
      "Escribe a la escuela, la biblioteca y el centro comunitario preguntando por un salón",
      "Visita la mejor opción y revisa salidas, baños y espacio para moverse",
      "Pide por escrito el mismo salón para todo el ciclo, no mes a mes",
      "Define el horario semanal y compártelo con las familias antes de abrir"
    ],
    [
      "Descarga como modelo una política de protección infantil de un programa establecido",
      "Escribe el requisito de verificación de antecedentes: nadie empieza sin aprobarla",
      "Detalla la regla de dos adultos para baños, traslados a casa y tutoría individual",
      "Busca la ley local de denuncia obligatoria y anota los pasos a seguir",
      "Haz que cada adulto firme la política antes de su primera sesión"
    ],
    [
      "Pide a dos grupos comunitarios de confianza que cada uno sugiera a un adulto confiable",
      "En cada entrevista pregunta directo: ¿puedes venir cada semana, todo el ciclo?",
      "Inicia la verificación de antecedentes el mismo día que alguien diga que sí",
      "Da una capacitación sobre límites, seguridad y ayudar sin hacerles la tarea"
    ],
    [
      "Pregúntales a tres chicos qué les gustaría hacer de verdad después de clases",
      "Dibuja el ritmo fijo en una hoja: merienda, luego tareas, luego actividad",
      "Planea las primeras dos semanas con las ideas que los chicos nombraron",
      "Deja un espacio a la semana que los propios jóvenes programen"
    ],
    [
      "Anota en el teléfono qué pedirá el formulario: permiso, alergias, contactos, quién recoge",
      "Redacta el formulario de inscripción de una página a partir de esa lista",
      "Entrégalo a las familias en persona y ayuda a llenarlo ahí mismo",
      "Pon las alergias graves a la vista del equipo a la hora de la merienda, no archivadas",
      "Confirma quién puede recoger a cada niño y guarda los formularios bajo llave"
    ],
    [
      "Manda un mensaje a una tienda o panadería sobre una donación semanal de merienda",
      "Arma la lista de compras sin frutos secos como regla general",
      "Etiqueta cualquier donación cuyos ingredientes no puedas garantizar",
      "Publica en el chat comunitario un pedido de libros, material de arte y juegos"
    ],
    [
      "Pon una alarma para llegar antes que el primer niño",
      "Prepara la hoja de asistencia y la merienda antes de abrir",
      "Cuenta cabezas al llegar y antes de que alguien se vaya; anota quién recogió a quién",
      "Dile algo bueno y concreto a mamá o papá cuando pasen a recoger",
      "Apunta dos líneas al cerrar: qué funcionó y qué niño necesita seguimiento"
    ]
  ],
  "gleaning-network": [
    [
      "Anota de memoria cinco fuentes cercanas: fincas, huertas, puestos, árboles cargados",
      "Visita o llama a las dos más probables y pregunta qué excedente se queda sin cosechar",
      "Pregunta a cada productor qué NO tocar y por dónde puede estacionar y caminar el equipo",
      "Apunta cada sí con cultivo, temporada aproximada y un teléfono de contacto"
    ],
    [
      "Pregunta en tu chat quién podría soltarlo todo para cosechar una mañana entre semana",
      "Pide a cada sí su disponibilidad real, no sus buenas intenciones",
      "Lleva la lista de síes firmes con teléfono: tres confiables valen más que diez quizás",
      "Haz un simulacro de convocatoria y mira quién contesta dentro de la hora"
    ],
    [
      "Escríbele a dos amistades con camioneta o auto amplio y pregunta por días entre semana",
      "Pide a una iglesia, restaurante o tiendita un rincón fresco para guardar por un día",
      "Junta más cajas de las que crees necesitar: un solo árbol puede dar cientos de kilos",
      "Escribe el plan en una tarjeta: quién maneja, dónde espera la comida, quién la reparte"
    ],
    [
      "Crea ahora mismo el chat de convocatoria y agrega a tu equipo confirmado",
      "Redacta un mensaje modelo: cultivo, dirección, horario y qué traer",
      "Acuerden que solo cuentan los síes escritos: una respuesta, no un pulgar arriba",
      "Manda una alerta de prueba y mide cuánto tardan tres personas en confirmar"
    ],
    [
      "Busca la ley del buen samaritano sobre donación de alimentos en tu región",
      "Pide prestada una plantilla de exención a una red de rescate ya establecida",
      "Escribe con los productores la lista prohibida: nada del suelo para hojas, nada podrido",
      "Imprime exenciones y reglas de manejo para la carpeta del día de cosecha"
    ],
    [
      "Escríbele a una nevera, despensa o comedor y pregunta qué producto mueven de verdad",
      "Pregunta a cada destino su capacidad y horario de entrega, y anota ambos",
      "Empareja cosechas grandes con destinos grandes: una despensa chica no absorbe 90 kilos",
      "Confirma en cada destino una persona con nombre que conteste el día de cosecha"
    ],
    [
      "Mete hoy mismo una báscula de baño o de gancho al kit del día de cosecha",
      "Recorre el sitio con el productor primero y marca lo que queda fuera de límites",
      "Pesa la cosecha en el campo antes de repartirla: después es imposible reconstruirlo",
      "Entrega en pocas horas y mándale a cada productor su peso con un agradecimiento"
    ]
  ],
  "community-mediation": [
    [
      "Busca el centro de mediación comunitaria más cercano y anota su contacto",
      "Llama y pregunta por opciones de formación o de alianza",
      "Escribe una lista corta de personas serenas y justas a quienes confiarías una disputa",
      "Invítalas en persona; busca a quien se mantenga neutral aunque no esté de acuerdo",
      "Reserva las fechas de formación y confirma quiénes se comprometen"
    ],
    [
      "Anota dos opciones de punto único de contacto: un correo compartido o un buzón de voz",
      "Configura la que elijas y mándate un mensaje de prueba",
      "Redacta cinco preguntas de admisión, una que deje ver miedo o desequilibrio de poder",
      "Escribe al inicio de la hoja de admisión: \"cada parte por separado, nunca juntas\"",
      "Decide quién atiende las llamadas de admisión y en cuánto tiempo responde"
    ],
    [
      "Escribe a la biblioteca para preguntar por una sala de reuniones tranquila",
      "Visítala y revisa que tenga dos salidas y que nadie pueda quedarse rondando afuera",
      "Confirma que sea terreno de nadie: ni la iglesia ni el edificio de una de las partes",
      "Deja apalabrada una segunda opción para que la agenda nunca obligue a una mala sala"
    ],
    [
      "Escribe una frase en tus notas: qué casos tomamos y cuáles derivamos",
      "Lista las disputas que sí tomarán: ruido, espacios compartidos, conflictos menores",
      "Nombra lo que no tocarán: cualquier situación con violencia, abuso o peligro",
      "Arma ya la lista de derivaciones: línea de violencia, abogado de inquilinos, crisis",
      "Comparte el alcance escrito con todo el equipo de mediación y admisión"
    ],
    [
      "Escribe las reglas básicas como cinco líneas simples en tus notas",
      "Acuerda con el equipo qué harán si alguien revela una amenaza o abuso infantil en sesión",
      "Redacta la promesa de confidencialidad con ese límite, para nunca prometer de más",
      "Dale forma de hoja de una página que las partes lean antes de empezar"
    ],
    [
      "Escribe a un administrador de edificio que conozcas: ya hay mediación vecinal gratuita",
      "Lista dónde surgen los conflictos —juntas, administradores, vivienda— y visítalos",
      "Haz un volante pequeño que diga gratuito, voluntario y confidencial",
      "Pide a organizaciones aliadas pasar tu contacto a ambas partes de un conflicto que asoma"
    ],
    [
      "Abre una nota con tres conteos: tomados, derivados y resueltos, nunca nombres",
      "Actualízala justo después de cerrar cada caso",
      "Haz una revisión con el equipo tras cada caso difícil, no solo una vez al mes",
      "Rota los casos para que nadie cargue los pesados uno tras otro",
      "Agenda una charla mensual fija con cada mediador, aunque todo parezca en orden"
    ]
  ],
  "reentry-support": [
    [
      "Apunta cinco servicios que ya conozcas: identificación, albergue, beneficios",
      "Llama a cada uno para confirmar que sigue activo y acepta a personas con antecedentes",
      "Anota un contacto con nombre en cada lugar, no solo el número de recepción",
      "Pregunta a una organización de reingreso qué empleadores de segunda oportunidad cumplen",
      "Agrega una fecha de \"verificado por última vez\" a cada línea del directorio"
    ],
    [
      "Escríbeles a dos personas constantes y sin prejuicios a quienes confiarías algo difícil",
      "En cada charla, fíjate si alguien llega de rescatista: buscas acompañantes, no salvadores",
      "Pide a una organización de reingreso que dé una capacitación informada en trauma",
      "Repasa la confidencialidad con cada persona voluntaria antes del primer encuentro"
    ],
    [
      "Escribe tu pregunta inicial en una tarjeta: \"¿Qué necesitas más ahora mismo?\"",
      "Limita el formulario a una página: nombre, tres necesidades y un medio de contacto",
      "Ensaya la conversación una vez con una persona voluntaria en el otro papel",
      "Acuerda con el equipo que los antecedentes no se tocan salvo que la persona los mencione"
    ],
    [
      "Llama a una organización aliada y pregunta si recibiría correo para quienes apoyas",
      "Escribe el orden: dirección postal, acta de nacimiento, identificación y beneficios",
      "Reúne en una carpeta los formularios reales de tu zona y el costo de cada trámite",
      "Acompaña a cada persona en su primera solicitud en vez de solo entregarle el papel"
    ],
    [
      "Escríbele a un empleador de segunda oportunidad y confirma que aún contrata este mes",
      "Ayuda a armar un currículum de una página que abra con habilidades y trabajo reciente",
      "Ensaya con la persona, en voz alta, la pregunta de antecedentes antes de la entrevista",
      "Que cada presentación sea cálida: una llamada a alguien con nombre, no un enlace",
      "Haz seguimiento tras cada entrevista o visita y anota cómo salió"
    ],
    [
      "Pregúntale a una persona que ya vivió el reingreso si le interesaría dar mentoría",
      "Empareja a cada mentor con una sola persona, no con una lista de casos",
      "Fija un encuentro mensual donde los propios mentores reciban apoyo",
      "Acuerda qué atiende cada mentor y cuándo pasa el tema a voluntarios o profesionales"
    ],
    [
      "Abre un documento y escribe la primera regla: nada se comparte sin el sí de la persona",
      "Enumera exactamente quién puede ver un expediente y cierra el acceso a los demás",
      "Decide qué cosas simplemente no se escriben",
      "Deriva toda pregunta legal a tu contacto de asistencia legal, nunca al chat del grupo",
      "Lee las reglas en voz alta con las personas voluntarias antes de empezar"
    ]
  ],
  "community-wood-bank": [
    [
      "Llama a un servicio de poda local y pregunta a dónde va su madera ahora",
      "Anota otras pistas: limpieza tras tormentas, el municipio, terrenos con árboles caídos",
      "Visita la mejor pista y mira la madera: especie, tamaño y qué tan verde está",
      "Consigue permiso escrito que diga qué puedes llevarte y por dónde corre el lindero"
    ],
    [
      "Anota tres patios posibles: el lote de una iglesia, una granja, el terreno de un miembro",
      "Pide a cada dueño un recorrido esta misma semana",
      "Mide espacio para dos años de leña: la seca de este invierno y la del próximo secándose",
      "En el recorrido revisa acceso de camioneta, tolerancia al ruido y drenaje",
      "Consigue un sí por escrito que cubra ruido de sierra, horarios y tiempo de apilado"
    ],
    [
      "Escribe la lista: hendidora, dos motosierras y protección completa por operador",
      "Publica una sola petición de préstamo o donación a miembros y grupos locales",
      "Cotiza zahones y protección de ojos y oídos para cada operador — sin compartir",
      "Pide a alguien que sepa de sierras revisar cada herramienta donada antes de aceptarla",
      "Arma un botiquín y deja todo junto en un lugar etiquetado en el sitio"
    ],
    [
      "Escribe a miembros y vecinos preguntando quién tiene experiencia real con motosierra",
      "Nombra a una persona con experiencia como responsable de seguridad con la última palabra",
      "Pregunta en la oficina de extensión o a un aserrador por un curso básico de motosierra",
      "Divide la cuadrilla: operadores capacitados en sierras, el resto apila y acarrea",
      "Escribe la charla de seguridad de cinco minutos para antes de cada día de trabajo"
    ],
    [
      "Pregunta en el chat del grupo qué número recibirá los pedidos de leña",
      "Al recibir el pedido pregunta dónde va la leña y si hay camino despejado y seco",
      "Lista a los miembros con camioneta y asigna a cada uno un día de entrega",
      "Llama a la oficina de asistencia de combustible y pide que compartan tu número",
      "Apila tú la primera entrega para medir cuánto toma un hogar"
    ],
    [
      "Escribe a dos hogares que usan leña y pregunta cuánto queman en un mes frío",
      "Define porciones en términos reales — cuerdas o semanas de calor, no \"una carga\"",
      "Escribe quién va primero: mayores, necesidades médicas, niños, sin otra calefacción",
      "Pide poco: sin comprobantes ni papeleo, solo nombre, dirección y tipo de estufa",
      "Agenda una revisión a mitad de invierno para los hogares que se quedaron cortos"
    ],
    [
      "Cuenta hacia atrás desde noviembre y marca la fecha límite de primavera para cortar",
      "Pon los dos primeros días de trabajo en el calendario e invita a la cuadrilla",
      "Empieza un registro simple por pila: fecha de partida, tipo de leña, fecha lista",
      "Marca cada pila como seca o verde para que nadie entregue leña húmeda con prisa",
      "Pon un recordatorio mensual para actualizar el registro y agendar el siguiente día"
    ]
  ],
  "community-wifi-mesh": [
    [
      "Imprime o dibuja un mapa de las cuadras que quieres cubrir",
      "Recorre las cuadras con mapa en mano y marca árboles, muros de ladrillo y edificios altos",
      "Toca puertas y pregunta quién no tiene servicio y para qué lo usaría",
      "Marca con estrella los techos y ventanas altas con línea de vista y dueños dispuestos",
      "Fotografía el mapa marcado y compártelo con el grupo"
    ],
    [
      "Anota tres candidatos con línea de sobra: un negocio, la biblioteca, un ISP amigable",
      "Escribe o visita a uno hoy y pregunta sin rodeos por compartir el ancho de banda",
      "Lee tú los términos del plan buscando cualquier prohibición de recompartir",
      "Consigue el permiso de redistribución por escrito antes de gastar en equipo"
    ],
    [
      "Escríbele a las dos personas más cómodas con redes que conozcas y pídeles una hora",
      "Publica una sola convocatoria en grupos locales de tecnología o radioaficionados",
      "Apunta a dos admins con trabajos y domicilios distintos, más alguien que quiera aprender",
      "Haz un arranque corto donde cada admin entre por su cuenta a un router de prueba"
    ],
    [
      "Publica una petición de routers de sobra en grupos y chats locales",
      "Lista los nodos y antenas que pide tu mapa y cotiza lo que no llegue donado",
      "Pon contraseña fuerte de admin a cada router y guárdala en un gestor compartido",
      "Configura cada nodo en una mesa y etiquétalo con su sitio previsto",
      "Prueba dos nodos en malla a lo largo de tu calle antes de subir a un techo"
    ],
    [
      "Escríbele a los tres sitios más amables marcados en tu mapa y pide una visita",
      "Visita cada uno con un nodo en mano y revisa corriente, montaje y línea de vista",
      "Redacta un acuerdo de una página: acceso al techo, luz y quién responde por daños",
      "Fírmalo con cada anfitrión y ofrece cubrir los pocos dólares de luz al mes"
    ],
    [
      "Abre una página en blanco y escribe la regla uno: para qué es la red",
      "Agrega la promesa de no registrar actividad y que una red abierta no es privada",
      "Desactiva los registros en cada router y pide a otro admin verificarlo",
      "Suma una línea que recomiende HTTPS y VPN para la seguridad de cada quien",
      "Publica la página en los sitios anfitriones y como pantalla de bienvenida"
    ],
    [
      "Pon un recordatorio mensual en tu teléfono para revisar cada nodo",
      "Etiqueta cada nodo con su ubicación y una fecha de revisión",
      "Ten un router de repuesto configurado y cargado para que el cambio tome minutos",
      "Documenta la instalación sobre la marcha y pide al otro admin seguirla una vez sin ti",
      "Lleva una lista de espera de anfitriones y suma un nodo cuando la red esté estable"
    ]
  ],
  "mental-health-peer-support": [
    [
      "Escribe a dos personas cálidas y estables y pregunta si considerarían facilitar",
      "Busca una capacitación cercana en apoyo entre pares o escucha activa y anota fechas",
      "Pregunta a cada candidato cómo manejaría una sala en silencio tras una revelación dura",
      "Descarta con cariño a quien siga en carne viva por su propia crisis, por ahora",
      "Reserva la capacitación y confirma que ambos puedan asistir a todas las sesiones"
    ],
    [
      "Pon un temporizador de 20 minutos y escribe un borrador de lo que el círculo no hará",
      "Escribe los límites como prohibiciones: no diagnosticar, no arreglar, no sustituir terapia",
      "Agrega tres líneas simples sobre lo que sí es: escucha, compañía, experiencia compartida",
      "Léeselo en voz alta a un facilitador y recorta lo que lo haga tropezar"
    ],
    [
      "Busca la línea de crisis local y la clínica sin cita más cercana; guarda ambos números",
      "Llama tú a cada número para confirmar que funciona y anota los horarios",
      "Escribe los pasos para una crisis en sesión: pausar, hablar aparte, entrega cálida",
      "Imprime una copia para cada facilitador: la noche que haga falta, el wifi puede fallar"
    ],
    [
      "Anota tres salas posibles: la biblioteca, un sitio de fe, un centro comunitario",
      "Visita la mejor y revisa que la puerta cierre y no haya paredes de vidrio",
      "Pregunta al anfitrión quién más usa el edificio a esa hora",
      "Asegura la misma sala a la misma hora cada semana; la constancia invita a volver"
    ],
    [
      "Apunta las cinco reglas que ya sabes necesarias, empezando por la confidencialidad",
      "Agrega el derecho a pasar y nada de consejos si nadie los pide",
      "Pide a ambos facilitadores que reescriban el borrador en palabras más simples",
      "Imprímelo en grande para leerlo en voz alta al inicio de cada sesión"
    ],
    [
      "Pregunta por mensaje a tus facilitadores qué noche pueden sostener seis meses",
      "Evita el viernes por la noche y la salida del trabajo; elige una hora más amable",
      "Escribe un anuncio sin estigma: gratuito, entre pares, sin diagnóstico necesario",
      "Envíalo a clínicas, grupos de fe y la cartelera comunitaria",
      "Decide desde ya el tope de unas ocho personas y qué harás si llegan más"
    ],
    [
      "Agenda ahora mismo un chequeo mensual con los facilitadores",
      "Háganlo en un lugar que no sea la sala del círculo; un café funciona",
      "Pregunta a cada facilitador qué momentos de las sesiones se le quedaron grabados",
      "Arma una rotación para que nadie dirija tres sesiones seguidas",
      "Observa a quien nunca falta y nunca descansa, y ofrécele el primer respiro"
    ]
  ],
  "community-cleanup": [
    [
      "Hoy de regreso a casa, tómale una foto al punto más descuidado que veas",
      "Camina dos cuadras más y fotografía cada esquina que necesite trabajo",
      "Pregunta a dos vecinos qué lote les molesta más y de quién es",
      "Vuelve a tus sitios principales a otra hora: la mañana y la noche cuentan cosas distintas",
      "Ordena la lista por impacto y por qué tan realizable es cada sitio en un día"
    ],
    [
      "Busca al dueño del sitio en el mapa catastral o pregúntale a alguien de años en el barrio",
      "Llama o escribe al dueño para pedir permiso por escrito con la fecha que tienes en mente",
      "Llama al municipio por una recolección y anota el número de referencia que te den",
      "Si el municipio no puede, cotiza un contenedor y confirma por escrito entrega y retiro"
    ],
    [
      "Pregunta en el chat quién ya tiene guantes, pinzas y chalecos reflejantes",
      "Compra un contenedor rígido para punzocortantes y dos pares de guantes gruesos",
      "Cuenta bolsas y guantes contra tu lista de inscritos y completa lo que falte",
      "Empaca todo en cajas etiquetadas la víspera, con el contenedor rígido encima"
    ],
    [
      "Publica ya la fecha, el punto de encuentro y la hora en dos canales del barrio",
      "Lleva una lista de inscritos y convoca a un tercio más de lo que crees necesitar",
      "Pide a tres personas confiables liderar equipos y confirma a cada una por su nombre",
      "Divide el sitio en zonas en un croquis y asigna una a cada líder antes del día"
    ],
    [
      "Escribe hoy la tarjeta de bienvenida: zonas, líderes, agua y jamás agujas con la mano",
      "Llega temprano y toma las fotos del antes desde un punto al que puedas volver",
      "Lee la tarjeta al grupo y manda a cada equipo a su zona con su líder",
      "Recorre las zonas a media mañana reponiendo bolsas, agua y ánimo",
      "Repite las fotos desde los mismos puntos, comparte el par y anuncia la próxima fecha"
    ]
  ],
  "free-tax-prep": [
    [
      "Busca las fechas de la certificación VITA de este año y dónde se imparte",
      "Pregunta a tres posibles preparadores si pueden comprometerse con toda la capacitación",
      "Inscribe a todo el equipo antes de que acabe el otoño: certificarse toma semanas",
      "Agenda una sesión de estudio en grupo antes del examen de certificación"
    ],
    [
      "Busca el correo de la coordinación regional y mándale una presentación de dos líneas",
      "Agenda una llamada y pregunta qué necesita un sitio nuevo: software, requisitos, revisión",
      "Anota sus plazos antes de prometerle a nadie una fecha de apertura",
      "Devuélveles los papeles que piden para registrarte como sitio"
    ],
    [
      "Escríbele a dos lugares con salas y wifi: una biblioteca o un centro comunitario",
      "Haz una prueba de velocidad en cada uno; el software se traba con subida débil",
      "Cuenta enchufes y mesas, y revisa que haya distancia entre sillas para la privacidad",
      "Reserva el espacio para toda la temporada, no semana a semana"
    ],
    [
      "Pide al programa aliado su lista estándar de documentos requeridos",
      "Elige una forma de agendar que funcione por teléfono, no solo en línea",
      "Incluye la lista de documentos en cada confirmación y recordatorio",
      "Haz tú una reserva de prueba y corrige lo que confunda"
    ],
    [
      "Escribe una línea —\"Impuestos gratis; quizá te deben dinero\"— y pruébala con alguien",
      "Imprime volantes con fechas, lugar y la lista de documentos al reverso",
      "Reparte volantes donde ya va la gente trabajadora: lavanderías, tienditas, paradas",
      "Dirige la difusión a quienes creen que ganan muy poco para declarar"
    ],
    [
      "Anota cada lugar donde vivirían los datos: laptops, memorias, la pila de papeles",
      "Escribe la regla de conservación: nada se lleva a casa y una fecha fija para triturar",
      "Configura bloqueo de pantalla y cuentas separadas en cada laptop del sitio",
      "Consigue una caja con llave para papeles y una trituradora para el día de destrucción"
    ],
    [
      "Anota tres referencias locales: revisión de beneficios, banca segura, presupuesto",
      "Llama a cada una para confirmar que reciben gente y cómo enviar a alguien",
      "Haz una tarjetita para llevar y ofrécela cuando la declaración esté lista, no antes",
      "Acuerda con el equipo la única frase para ofrecerla, sin discurso de venta"
    ]
  ],
  "community-market": [
    [
      "Apunta tres fuentes posibles: una granja, una tienda y una huerta comunitaria",
      "Visítalas y pregunta qué excedente tienen de verdad y con qué ritmo",
      "Fija por escrito el día y el volumen aproximado de cada una, no un \"cuando sobre\"",
      "Suma una fuente de respaldo para que una mala semana no deje el puesto vacío"
    ],
    [
      "Anota dos o tres lugares posibles por donde la gente ya camina",
      "Visítalos a la hora real del mercado y cuenta cuánta gente pasa",
      "Revisa que haya sombra y una fuente de agua cerca",
      "Pide permiso a quien administre el lugar y consíguelo por mensaje o correo",
      "Reúne mesas, un toldo y un letrero sencillo"
    ],
    [
      "Escríbele a tu equipo base para fijar una charla de 20 minutos y decidir",
      "Hablen de gratuito, paga lo que puedas o mezcla, y qué significa no rechazar a nadie",
      "Si es paga lo que puedas, acuerden una sola caja sin marcas y sin precio sugerido",
      "Anoten la decisión en una frase que cualquiera pueda repetir en la mesa"
    ],
    [
      "Manda un mensaje al grupo preguntando qué hieleras, mesas y refrigerantes ya tienen",
      "Consigue hieleras y hielo para todo lo de hoja o cortado",
      "Planea sombra sobre los productos: un toldo o el lado sombreado del lote",
      "Acuerda con el equipo el criterio de descarte: ante la duda, a la composta"
    ],
    [
      "Escríbeles a tres personas confiables y pregúntales qué rol tomarían",
      "Llena primero los turnos ingratos: el viaje temprano de recolección y el desmontaje",
      "Nombra un suplente para cada rol para que una ausencia no cancele el mercado",
      "Pon la lista donde todos la vean y confirma dos días antes de cada mercado"
    ],
    [
      "Manda al equipo dos opciones de día y hora y pide un voto rápido",
      "Haz un volante sencillo con día, hora, lugar y \"gratis, bienvenido todo el mundo\"",
      "Pégalo donde la gente ya pasa: la lavandería, la parada del bus, la tienda",
      "Cuéntaselo en persona a las vecinas y vecinos que conociste explorando la zona",
      "Deja el mercado como evento repetido en el calendario compartido, aun en semanas flojas"
    ],
    [
      "Antes del mercado, escribe a un refri, despensa o comedor que reciba lo sobrante",
      "Llega temprano a montar mesas, sombra e hieleras",
      "Recibe a la gente con calidez, sin formularios, preguntas ni clasificar a nadie",
      "Al cerrar, lleva el excedente directo al lugar acordado",
      "Anota qué se acabó y qué sobró para planear la próxima semana"
    ]
  ],
  "welcome-wagon": [
    [
      "Escríbeles a dos o tres personas interesadas para fijar una hora de charla esta semana",
      "Definan en conjunto el enfoque: recién llegados, familias con bebé o ambos",
      "Acuerden que el primer contacto sea una nota o llamada, nunca tocar sin avisar",
      "Redacta la oferta en una línea, a la que se pueda decir sí o no"
    ],
    [
      "Abre una lista en el teléfono: clínica, transporte, escuelas, despensas, tu programa",
      "Llama o verifica cada dato para confirmar horarios y direcciones vigentes",
      "Escribe la fecha y un contacto de \"avisa aquí si algo cambia\" en la primera página",
      "Pídele a alguien bilingüe que lo traduzca a los idiomas que se hablan en la zona"
    ],
    [
      "Publica un solo aviso en el chat vecinal pidiendo despensa básica y artículos del hogar",
      "Elige un lugar y una fecha para armar las primeras cinco canastas",
      "Usa productos no perecederos y sin fragancia, salvo que conozcas bien a la familia",
      "Mete en cada canasta el paquete informativo y un saludo escrito a mano"
    ],
    [
      "Escríbeles a las dos personas más cálidas que conozcas y pídeles dar la bienvenida",
      "Reúnanse una hora y ensayen una visita a la puerta",
      "Practiquen la versión corta: entregar la canasta, dejar un contacto y retirarse",
      "Acuerden una señal para \"prefiere estar a solas\" y respétenla"
    ],
    [
      "Lista quiénes reciben primero a la gente nueva: arrendadores, escuelas, clínicas, parteras",
      "Visita o llama a cada lugar y explica el programa de bienvenida en dos minutos",
      "Pídeles que consigan el consentimiento de la persona antes de pasar cualquier nombre",
      "Haz un formulario sencillo de inscripción voluntaria y deja copias en cada lugar"
    ]
  ],
  "library-of-things": [
    [
      "Escribe diez artículos candidatos en tus notas: mesas, carpa, limpiadora, taladro",
      "Agrega una línea en blanco y la pregunta: ¿qué habrías usado en el último año?",
      "Publica la encuesta en la cartelera y reparte copias en papel a cinco vecinos",
      "Cuenta las respuestas tras una semana y ordena los diez artículos más pedidos"
    ],
    [
      "Escribe a la biblioteca pública o al centro comunitario y pregunta por un clóset libre",
      "Mide los dos artículos más voluminosos de la lista; ellos dictan el espacio necesario",
      "Visita la mejor opción con cinta métrica y mide también el ancho de la puerta",
      "Acuerda horarios de entrega y devolución que el anfitrión pueda sostener, y anótalos"
    ],
    [
      "Publica una lista de los diez artículos más pedidos; nada de 'se acepta todo'",
      "Fija un día de entrega y pide a los donantes traer cables, bolsas y piezas completas",
      "Enchufa y prueba cada aparato eléctrico antes de darle lugar en el estante",
      "Revisa lo motorizado y lo infantil contra la lista de retiros del mercado (CPSC)",
      "Empaca lo rechazado para desecharlo el mismo día, para que no se acumule"
    ],
    [
      "Numera veinte etiquetas de cinta adhesiva y pega la primera en un artículo",
      "Fotografía cada artículo justo al lado de su número, con buena luz",
      "Registra número, nombre, estado y foto: una fila de la hoja por artículo",
      "Dale a los accesorios —bolsas, cables, aditamentos— sus propias líneas numeradas"
    ],
    [
      "Anota tus cinco artículos más pedidos y calcula qué tan rápido rotará cada uno",
      "Fija plazos por artículo: un fin de semana el proyector, una semana la limpiadora",
      "Escribe una política de retraso amable: un recordatorio cordial, nunca una multa",
      "Apunta en una línea qué artículos requieren limpieza o cuidado especial al volver",
      "Pide a alguien del equipo bibliotecario que lea las reglas y recorte lo confuso"
    ],
    [
      "Traza una hoja de préstamo con cuatro columnas: nombre, contacto, artículo, fecha",
      "Agrega el paso que todos saltan: foto del estado al prestar y otra al devolver",
      "Guía a ambos bibliotecarios por un préstamo de práctica, de principio a fin",
      "Mira a cada uno hacer un préstamo por su cuenta antes del día de apertura"
    ],
    [
      "Pega una hoja de 'pedidos que no pudimos cumplir' junto a la hoja de préstamos",
      "Limpia y revisa cada devolución el mismo día que llega, no por tandas",
      "Fija una hora mensual de reparación y deja lo arreglable donde lo veas",
      "Compra o consigue el artículo más pedido de esa lista, no tu corazonada"
    ]
  ],
  "laundry-shower-access": [
    [
      "Anota tres anfitriones posibles: una lavandería, un gimnasio, un sitio de fe con duchas",
      "Llama al más amigable y pide una visita de quince minutos esta semana",
      "Recorre la ruta de la sala de espera a la ducha: ¿de verdad es privada?",
      "Dile al anfitrión con claridad quién vendrá y qué limpieza cubrirá tu equipo",
      "Confirma los días y condiciones acordados en un mensaje o correo de seguimiento"
    ],
    [
      "Escribe la lista de necesidades: detergente, toallas, jabón, champú, chanclas",
      "Pide tamaño de viaje y sin fragancia desde el anuncio de donaciones",
      "Llama a una congregación o tienda para cubrir el primer mes",
      "Arma kits de ducha con lo que llegue: una bolsa por persona, lista para entregar"
    ],
    [
      "Escribe al anfitrión y confirma cuántas máquinas y duchas tendrás por sesión",
      "Haz una hoja de turnos en papel que pida solo un nombre de pila, o nada",
      "Decide la regla de turnos —orden de llegada, habituales o mixta— y publícala",
      "Prueba una sesión completa en papel antes de intentar algo más elaborado"
    ],
    [
      "Pregunta al anfitrión qué productos de limpieza exige entre usos",
      "Cronometra una limpieza completa de cubículo: desinfectar, trapear, toalla limpia",
      "Incluye esos minutos en cada turno para que nadie reciba un cubículo sucio",
      "Escribe la rutina como lista de verificación y pégala dentro del clóset de insumos",
      "Acuerda con el anfitrión quién repone insumos y quién atiende fallas de plomería"
    ],
    [
      "Escribe a tres personas pacientes e imperturbables que pondrías en una recepción",
      "Acompaña a cada nuevo voluntario una sesión completa antes de dejarlo solo",
      "Ensaya con ellos los momentos incómodos: alguien intoxicado, un turno que se alarga",
      "Acuerda a quién se llama primero, para que nadie llame al anfitrión en pánico",
      "Marca el tono sin rodeos: se recibe como hotel, no como clínica"
    ],
    [
      "Pregunta por mensaje a tu equipo qué horas semanales pueden sostener seis meses",
      "Fija el horario según lo sostenible, no según lo impresionante",
      "Imprime tarjetas simples con horario y lugar, sin mencionar trámites",
      "Reparte las tarjetas a trabajadores de calle, albergues y vecinos sin techo",
      "Mantén el horario fijo: una sola semana cambiada enseña que la puerta puede estar cerrada"
    ]
  ],
  "voter-registration": [
    [
      "Busca ahora mismo el teléfono y correo de tu oficina electoral",
      "Llama y pregunta qué puede y qué no puede hacer una jornada de registro en tu zona",
      "Anota la fecha límite exacta de entrega y quién puede entregar los formularios",
      "Pregunta si las personas voluntarias necesitan capacitación o registro previo",
      "Escribe a un grupo no partidista establecido para pedir materiales y consejos"
    ],
    [
      "Manda hoy a tus voluntarias dos opciones de horario para una capacitación de una hora",
      "Escribe en una tarjeta la respuesta fija a \"¿por quién voto?\" para cada persona",
      "Repasen juntos un formulario real, campo por campo",
      "Ensayen una pregunta política insistente hasta que la respuesta neutral salga sola"
    ],
    [
      "Abre la página oficial de la oficina electoral y guárdala en favoritos",
      "Imprime plazos, reglas de identificación y datos de votación directo de esa página",
      "Escribe la fecha de hoy en cada impresión para detectar copias viejas",
      "Recoge formularios en blanco en la propia oficina electoral"
    ],
    [
      "Anota cinco lugares donde ya se junta la gente: mercado, transporte, campus",
      "Escribe a quien administra cada lugar para pedir permiso de poner una mesa",
      "Consigue el sí por escrito, aunque sea un correo, antes de agendar un turno",
      "Asigna fecha y hora en el calendario a cada lugar confirmado"
    ],
    [
      "Escribe en tu teléfono la lista del kit: formularios, plumas, tablillas, hojas con fecha",
      "Empaca el kit la noche anterior y déjalo junto a la puerta",
      "Nombra a una sola persona que cargue la carpeta cerrada con los formularios todo el turno",
      "Repasa cada formulario con la persona antes de que se retire de la mesa",
      "Entrega la carpeta a la oficina electoral el mismo día, bien dentro del plazo"
    ],
    [
      "Busca el enlace oficial para ubicar el centro de votación y guárdalo en tu teléfono",
      "Arma una tarjeta de bolsillo: fecha de elección, ese enlace y plazo del voto por correo",
      "Imprime varias y guárdalas en el kit junto a los formularios",
      "Entrega una a cada persona registrada y pregunta si necesitará transporte para votar"
    ]
  ],
  "health-navigation": [
    [
      "Busca \"clínica gratuita cerca de mí\" y pega los tres primeros resultados en un documento",
      "Llama a cada una y pide la línea directa de admisión y las reglas vigentes",
      "Agrega columnas de idiomas, tarifa escalonada y la fecha en que verificaste cada dato",
      "Ponte un recordatorio fijo para reverificar cada entrada antes de que envejezca"
    ],
    [
      "Escríbele a tres personas pacientes y organizadas: ¿se animan a ser navegadoras?",
      "Redacta el límite en una línea: logística y trámites sí, consejo médico nunca",
      "Ensaya las palabras exactas: \"no soy personal médico; te comunico con enfermería\"",
      "Practica con cada persona navegadora nueva una llamada de alguien asustado"
    ],
    [
      "Pregunta en el chat quién presta un número para la admisión este mes",
      "Configura el buzón de voz con un saludo cálido en los idiomas que atiendes",
      "Suma una opción presencial: horario fijo en una biblioteca o centro comunitario",
      "Decide qué no anotarás nunca —diagnósticos, estatus migratorio— antes de empezar"
    ],
    [
      "Averigua hoy si el periodo de inscripción abierta está vigente en tu zona",
      "Imprime la lista de documentos: comprobante de ingresos, tamaño del hogar, identificación",
      "Reúne los documentos con cada persona antes de abrir su solicitud",
      "Busca a alguien certificado en inscripciones para acompañar tu primer caso"
    ],
    [
      "Guarda ahora mismo el contacto del programa de transporte en tu teléfono",
      "Pregunta por el transporte en la misma llamada en que agendas la cita",
      "Programa un mensaje recordatorio el día anterior para cada cita que agendes",
      "Busca dos programas de descuento de medicamentos y tenlos en una tarjeta"
    ],
    [
      "Escribe la regla uno en un papelito: recopilar lo mínimo y no compartir sin permiso",
      "Enlista lo que la admisión de verdad necesita y recorta todo lo demás",
      "Elige un solo lugar bajo llave —físico o cifrado— donde vivan las notas",
      "Repasa las reglas con cada persona navegadora antes de su primera llamada"
    ],
    [
      "Escríbele a una clínica pidiendo quince minutos con su coordinación de admisión",
      "Visítala y pregunta qué derivaciones de verdad ayudan y cuáles la saturan",
      "Dales un contacto con nombre de tu lado para entregas cálidas",
      "Agenda un contacto trimestral para enterarte de servicios nuevos de bajo costo"
    ]
  ],
  "toy-library": [
    [
      "Manda un mensaje al centro comunitario o a la biblioteca preguntando por un estante libre",
      "Visita el lugar con carriola y revisa la entrada: sin escaleras y con dónde dejarla",
      "Pregunta a tres familias a la salida qué dos horas semanales sí les sirven",
      "Confirma que el estante quede a la altura de un niño y pega ahí el horario"
    ],
    [
      "Guarda en tu teléfono la página de retiros del mercado (CPSC)",
      "Pon un contenedor rotulado para donaciones junto al estante de la biblioteca",
      "Coteja cada juguete donado con la lista de retiros antes que nada",
      "Pasa las piezas por un tubo de papel higiénico; si caben, apártalo de menores de tres",
      "Lava y seca cada juguete aprobado, y desecha lo roto o incompleto"
    ],
    [
      "Pide en el chat comunitario bolsas con cierre y un marcador permanente",
      "Fotografía cada juguete junto a su número y regístralo con su rango de edad",
      "Cuenta las piezas de cada juego al embolsarlas y escribe el total en la etiqueta",
      "Acomoda las bolsas con la etiqueta a la vista para revisar el conteo al devolver"
    ],
    [
      "Busca en línea las reglas de otra biblioteca de juguetes como punto de partida",
      "Redacta en palabras sencillas el plazo y cuántos juguetes por familia",
      "Escribe la política de piezas perdidas en una frase amable: sin multas, solo avísanos",
      "Pide a dos familias que lo lean y marquen lo que suene a regaño"
    ],
    [
      "Imprime cinco hojas de registro: nombre, contacto, número de juguete y fecha de devolución",
      "Acompaña a cada voluntaria en un préstamo y una devolución de práctica",
      "Integra el conteo de piezas y una limpiada rápida al propio paso de devolución",
      "Pega la rutina de limpieza y las reglas donde se sienta quien atiende"
    ]
  ],
  "food-preservation": [
    [
      "Escribe a una parroquia o centro comunitario y pregunta si prestan su cocina",
      "Visítala y comprueba que la estufa aguante una olla llena y logre un hervor fuerte",
      "Revisa mesas, fregaderos y un rincón donde los frascos calientes enfríen sin estorbos",
      "Aparta fechas según los picos de cosecha, no según cuándo esté libre el salón"
    ],
    [
      "Descarga la guía vigente del USDA o la del servicio de extensión de tu zona",
      "Revisa el año de publicación y anótalo en la portada",
      "Llama a la oficina de extensión y pide que capaciten a tus líderes o revisen tu plan",
      "Acuerden entre líderes: solo recetas probadas, sin aumentar cantidades, sin excepciones"
    ],
    [
      "Publica en un grupo local una petición de ollas, frascos y aros para conservas",
      "Agenda la prueba del manómetro de cada olla en la oficina de extensión — suele ser gratis",
      "Pasa el dedo por el borde de cada frasco donado y descarta los despostillados",
      "Compra tapas nuevas para todos los frascos previstos y anota qué herramientas faltan"
    ],
    [
      "Escribe a alguien que cultiva o cosecha y pregunta qué está por llegar a su punto",
      "Dibuja un calendario rápido de cosecha: qué producto abunda en qué semanas",
      "Acuerda con cada fuente una cantidad concreta para una fecha de sesión concreta",
      "Programa la recolección uno o dos días después de la cosecha para que nada se pase"
    ],
    [
      "Pregunta por mensaje quién ya ha envasado antes y quién es primerizo",
      "Elige una receta probada que le quede al producto y a las manos menos expertas",
      "Empareja el alimento con su método seguro: baño maría lo ácido, presión lo bajo en ácido",
      "Dibuja las estaciones en papel: lavar, preparar, llenar, procesar, enfriar",
      "Asigna a una persona con nombre a cada estación antes de que llegue nadie"
    ],
    [
      "Imprime la receta probada y los tiempos de proceso y pégalos a la altura de los ojos",
      "Abre con cinco minutos de seguridad: por qué los tiempos y métodos no se negocian",
      "Nombra a una persona cronometrista que anote la entrada y salida de cada tanda",
      "Empareja a cada principiante con alguien con experiencia en cada estación",
      "Recorre la cocina narrando lo que haces para que la habilidad de verdad se contagie"
    ],
    [
      "Toma un marcador y etiqueta el primer frasco frío: contenido, método y fecha",
      "Presiona el centro de cada tapa y aparta los frascos sin sellar — al refri, no al estante",
      "Cuenta los frascos por persona y separa la parte para el refri comunitario o la despensa",
      "Apunta tres líneas en caliente: qué funcionó, qué se atoró y qué cambiar"
    ]
  ],
  "free-haircut": [
    [
      "Escribe a un estilista o barbero que conozcas y pídele diez minutos para contarle",
      "A cada sí pregúntale cuántos cortes hace de verdad por jornada — suelen ser seis u ocho",
      "Pide a cada persona reclutada que traiga a un colega",
      "Reúne números de licencia y fechas disponibles en una sola lista"
    ],
    [
      "Escribe a un albergue, centro de día o iglesia y pregunta si prestan el lugar una tarde",
      "Recorre el salón y revisa agua, buena luz y pisos que se puedan barrer",
      "Cuenta los enchufes con tierra al alcance del cable donde iría cada silla",
      "Confirma fecha y quién abre en un solo mensaje al que puedas volver después"
    ],
    [
      "Pregunta por mensaje a tus estilistas qué equipo traen, para comprar solo lo que falte",
      "Compra dos juegos de guías y cuchillas por estación: uno se desinfecta y el otro corta",
      "Pide a una tienda de belleza que done capas, peines y tiras desechables para el cuello",
      "Arma bolsas para llevar: rastrillo, jabón, desodorante y un peine en cada una"
    ],
    [
      "Llama a la junta de cosmetología o barbería y pregunta sus reglas para eventos gratis",
      "Compra el desinfectante registrado que te indiquen y anota el tiempo de remojo exigido",
      "Monta una estación de remojo por silla: tina rotulada, temporizador y el tiempo impreso",
      "Escribe la rutina entre clientes en una tarjeta y pégala en cada estación"
    ],
    [
      "Manda mensaje a cada estilista y al anfitrión dos días antes para confirmar",
      "Coloca una silla donde el salón no pueda mirar, para quien prefiera privacidad",
      "Dale a cada invitado un espejo y empieza con '¿cómo lo quieres?' antes de cortar",
      "Mantén los teléfonos guardados — fotos solo si el invitado las pide",
      "Cierra reponiendo las bolsas para llevar y apartando la próxima fecha con el anfitrión"
    ]
  ],
  "mutual-aid-moving-crew": [
    [
      "Escribe a cuatro amigos con buena espalda y pregunta si tienen libre el fin de semana",
      "Pregunta por ahí quién tiene camioneta, van o remolque que pueda prestar",
      "Arma una lista: nombre, teléfono, fuerza, vehículo, días libres habituales",
      "Marca un núcleo pequeño y de confianza para mudanzas delicadas; nunca de lista abierta"
    ],
    [
      "Publica un solo pedido en la cartelera: carretillas, correas, cobijas, cajas firmes",
      "Prioriza una carretilla de cuatro ruedas para muebles; cómprala si nadie la dona",
      "Marca cada pieza con el nombre del programa para que de verdad regrese",
      "Elige un garaje o clóset como casa del equipo y avisa a la cuadrilla dónde está"
    ],
    [
      "Escribe cinco preguntas de admisión en tus notas: cuartos, escaleras, distancia, fecha",
      "Agrega las dos que todos olvidan: ¿está todo empacado y a qué distancia se estaciona?",
      "Decide cómo te llegan los pedidos; aquí un teléfono le gana a un formulario",
      "Prueba la admisión con un amigo que finja pedir una mudanza"
    ],
    [
      "Busca un buen video de levantamiento seguro y envíalo a toda la cuadrilla",
      "Escribe primero la regla de peso: nada de más de 23 kilos entre menos de dos personas",
      "Redacta un descargo de una página y que todos firmen antes de la primera mudanza",
      "Pide a cada conductor confirmar que su seguro cubre acarreos voluntarios"
    ],
    [
      "Abre la lista y marca quién está libre para la próxima fecha pedida",
      "Llama a la persona el día anterior y confirma que está empacada de verdad, no 'casi'",
      "Ten dos nombres de respaldo por mudanza; una mudanza no se pospone fácil",
      "Comparte direcciones uno a uno desde el teléfono de quien coordina, jamás en chat grupal"
    ],
    [
      "Apunta los trabajos que ya sabes que son demasiado: pianos, químicos, casas acumuladas",
      "Averigua quién los atiende en tu zona: mudanceros, fleteros, servicios del condado",
      "Acompaña cada límite con esa referencia, para que un no entregue una próxima llamada",
      "Pásalo en limpio en media página y compártelo con toda la cuadrilla"
    ],
    [
      "Manda a la cuadrilla un mensaje la noche anterior: hora, punto de encuentro, ropa",
      "Carga primero los muebles más pesados y deja que la carretilla haga la fuerza",
      "Recorre el lugar viejo con la persona una última vez antes de arrancar",
      "Pregunta unos días después: ¿ya se instaló, le serviría la tienda gratuita?",
      "Apunta qué salió bien y qué dolió mientras la mudanza sigue fresca"
    ]
  ],
  "disability-support-network": [
    [
      "Escribe a dos vecinos con discapacidad que conozcas y pregunta si lo fundarían contigo",
      "Deja que elijan formato, lugar y ritmo de la primera reunión antes de fijar nada",
      "Agrega una línea al presupuesto para los costos de acceso y el tiempo de quienes lideran",
      "Acuerden en voz alta la regla: quienes son aliados apoyan, los miembros deciden"
    ],
    [
      "Pregunta a tres miembros cómo prefieren el contacto: llamada, texto, correo o en persona",
      "Abre un canal por cada preferencia y nombra a alguien que cuide cada uno",
      "Pide a alguien que usa lector de pantalla que pruebe tu inscripción y tu volante",
      "Reescribe tu primer anuncio en lenguaje sencillo y mándalo por todas las vías a la vez"
    ],
    [
      "Pregunta a un miembro qué trámite o barrera le costó más este mes",
      "Redacta cinco preguntas cortas y hazlas por teléfono, mensaje y en persona",
      "Anota cada recurso local mencionado, uno por línea, con un contacto",
      "Llama a cada lugar y pregunta por el elevador, el baño y el proceso de admisión",
      "Marca las tres brechas más grandes entre lo que la gente necesita y lo que existe"
    ],
    [
      "Escribe a tres miembros y pregunta qué podrían ofrecer y qué les vendría bien",
      "Haz una hoja de dos columnas — ofertas y necesidades — y marca los pares obvios",
      "Agrega una opción de pausa sin explicaciones para retirarse una semana sin pena",
      "Haz tú el primer emparejamiento y pregunta después a ambas personas cómo les fue"
    ],
    [
      "Publica en un grupo local una petición de andaderas, bastones y sillas de baño sin uso",
      "Escribe primero la lista de lo que no se presta: nada que toque de cerca boca o piel",
      "Desinfecta cada aparato y ponle un número, su serie y el nombre del programa",
      "Arma una hoja de salida simple: número del aparato, quién lo lleva, contacto y fecha"
    ],
    [
      "Guarda en tu teléfono el número de la consejería de beneficios más cercana",
      "Pregunta a dos miembros a qué oficina o trámite les gustaría ir con compañía",
      "Asigna a cada solicitud un acompañante que tome notas y pida todo por escrito",
      "Cuando surjan reglas de dinero o beneficios, deriva a la consejería en vez de adivinar"
    ],
    [
      "Apunta lo que sí y lo que no funcionó de acceso en el último evento al que fuiste",
      "Arma la lista con miembros con discapacidad: entrada, asientos, baños, sonido, materiales",
      "Agrega una pregunta de necesidades de acceso a cada formulario de inscripción",
      "Pasa un evento próximo por la lista y corrige lo que falle antes de la fecha"
    ]
  ],
  "books-to-prisoners": [
    [
      "Busca en tu teléfono la política de correo de una institución cercana",
      "Llama o escribe al área de correspondencia para pedir la política de libros por escrito",
      "Guarda la política en un archivo con fecha y anota cuándo volver a verificarla",
      "Repite con la segunda institución y apunta qué reglas cambian",
      "Escribe en una tarjeta las reglas sin excepción: solo nuevos, sin pasta dura"
    ],
    [
      "Escríbele a una amistad para pedirle diccionarios o novelas de bolsillo que done",
      "Consigue un rincón con mesa para empacar en una iglesia, biblioteca o cochera",
      "Publica una convocatoria pidiendo solo lo que aceptan: libros de bolsillo en buen estado",
      "Pon una caja de descarte en la entrada para pasta dura y libros rayados",
      "Ordena lo que quede en secciones: diccionarios, ficción, educación, reingreso"
    ],
    [
      "Toma un cuaderno o abre una hoja con columnas: nombre, número, unidad, pedido",
      "Captura las cartas que tengas, copiando nombre y número tal como los escribieron",
      "Agrega fecha de solicitud y una columna de enviado para que nada quede sin respuesta",
      "Elige una caja o carpeta donde caiga cada carta entrante antes de capturarla"
    ],
    [
      "Escríbele a dos amistades lectoras e invítalas a una tarde de empaque",
      "Imprime las reglas en una lista de una página y pégala sobre la mesa de empaque",
      "Acompaña a cada persona nueva mientras empaca su primer paquete",
      "Di la norma en voz alta: una segunda persona revisa cada caja antes de sellarla"
    ],
    [
      "Busca cuánto cuesta enviar un paquete de libros por Media Mail, la tarifa económica",
      "Pide en el chat del grupo donativos de franqueo con una cifra concreta por paquete",
      "Agenda un día fijo de envíos en el calendario e invita a dos personas a ayudar",
      "Escribe una tarjeta de regla: nada de cartas personales dentro de envíos Media Mail"
    ],
    [
      "Pregunta a una persona voluntaria si quiere estrenar el programa de correspondencia",
      "Escribe las dos reglas en una tarjeta: solo la dirección del programa y nombres de pila",
      "Redacta una respuesta amable y firme para pedidos de dinero o romance y compártela",
      "Haz la primera pareja y agenda una plática después de su primer intercambio"
    ]
  ],
  "community-music": [
    [
      "Publica un mensaje pidiendo instrumentos en buen estado en un chat o grupo local",
      "Escríbele a una tienda de música y pregunta por reparaciones con descuento",
      "Prueba o abre cada estuche antes de aceptar — rechaza pianos gratis y grietas grandes",
      "Recoge los que digan que sí y etiqueta cada uno con la reparación que necesita",
      "Deja los reparables en la tienda y anota la fecha prometida"
    ],
    [
      "Abre una hoja con columnas: número, tipo, estado, quién lo tiene, fecha de salida",
      "Pon una etiqueta numerada a cada instrumento",
      "Fotografía el estado de cada instrumento y guarda las fotos por número",
      "Escribe una nota de préstamo de tres líneas: cuidado, plazo, sin cobros por daños",
      "Prueba el sistema registrando un préstamo a tu nombre"
    ],
    [
      "Escríbele a dos músicos que ya conozcas y pregunta si le enseñarían a un principiante",
      "Pide nombres de gente paciente en la iglesia, la banda y el centro de adultos mayores",
      "Reúnete diez minutos con cada sí para saber qué enseñarían y cuándo",
      "Inicia ya la verificación de antecedentes de quienes darán clases a menores",
      "Anota nombres, instrumentos y horarios disponibles en una sola lista compartida"
    ],
    [
      "Anota tres salas cercanas que aguanten ruido: centro comunitario, escuela, iglesia",
      "Llama o visita cada una y pregunta en concreto por tardes y fines de semana",
      "Donde te digan que sí, pregunta por un clóset con llave para guardar instrumentos",
      "Recorre la sala una vez a la hora prevista para revisar ruido y vecinos",
      "Consigue el visto bueno por escrito, con tus días y horarios exactos"
    ],
    [
      "Manda a tus docentes un solo mensaje pidiendo sus dos mejores horarios semanales",
      "Arma el calendario del primer mes con clases y una jam solo para principiantes",
      "Prepara la inscripción: una hoja en el local y un número para mandar mensajes",
      "Confirma el calendario con el sitio anfitrión antes de anunciar nada",
      "Publica los horarios donde las familias ya miran y fíjalos en el chat del grupo"
    ],
    [
      "Apunta tres reglas de cuidado para el tipo de instrumento que mejor conoces",
      "Agrega en negritas la línea clave: si algo se rompe, tráelo — no lo arregles en casa",
      "Pídele a una de tus profes que revise la hoja por si algo falta o está mal",
      "Imprime copias y mete una en cada estuche antes de que salga",
      "Di la línea del instrumento roto en voz alta en cada préstamo"
    ]
  ],
  "school-supply-program": [
    [
      "Busca el teléfono de la escuela más cercana y guárdalo en tu celular",
      "Llama o escribe pidiendo hablar con la consejera o el enlace con familias",
      "Pídele las listas de útiles exactas por grado, marcas incluidas",
      "Pregúntale cuántas familias necesitarían mochila, un número realista",
      "Pasa las listas y el conteo a un solo documento y compártelo con el proyecto"
    ],
    [
      "Abre las listas de útiles y marca los cinco básicos que más se necesitan",
      "Cotiza esos básicos por caja en dos tiendas mayoristas",
      "Haz un pedido al por mayor de lápices, hojas y pegamento antes de la colecta",
      "Pide a dos comercios o iglesias que pongan un buzón para los extras divertidos",
      "Ponte un recordatorio semanal para vaciar buzones y anotar lo que aún falta"
    ],
    [
      "Imprime una copia de la lista de útiles de cada grado",
      "Escríbeles a tres voluntarios con fecha y hora para una sesión de empaque",
      "Arma una mesa por grado con su lista pegada a la vista de quienes empacan",
      "Empaquen en cadena, cotejando cada mochila con la lista de su grado",
      "Deja las mochilas sin sellar para que los niños puedan cambiar cosas al recogerlas"
    ],
    [
      "Escríbeles a dos personas que puedan tener un cuarto o garaje seco y con llave",
      "Visita la mejor opción y revisa que esté seca, cierre bien y tenga estantes",
      "Coloca las cajas sobre estantes o tarimas, nunca directo en el piso",
      "Elige un punto en una ruta de autobús que las familias ya usen y confirma la fecha"
    ],
    [
      "Busca la fecha del primer día de clases y agenda la entrega una o dos semanas antes",
      "Pídele al enlace escolar que corra la voz con las familias por sus canales",
      "Escribe a tu lista de voluntarios preguntando quién toma un turno de dos horas",
      "Acomoda las mochilas por color para que cada niño elija la suya",
      "Recorre el lugar el día antes: sin formularios, solo una mesa y una bienvenida"
    ]
  ],
  "legal-aid-clinic": [
    [
      "Busca la oficina de ayuda legal y el programa pro bono del colegio; guarda ambos números",
      "Llama a cada uno y pregunta qué necesitarían de ti para enviar abogados",
      "Escribe a la clínica de derecho más cercana y pregunta por estudiantes supervisados",
      "Pregunta a cada abogado si su seguro profesional cubre el trabajo voluntario",
      "Registra la clínica en el programa del colegio si eso activa la cobertura gratuita"
    ],
    [
      "Pregunta por mensaje a los abogados aliados: ¿qué tres asuntos van a atender?",
      "Enumera lo que queda fuera y a dónde debe ir cada uno de esos casos",
      "Consigue un contacto con nombre y un tiempo de espera honesto en cada organización",
      "Escribe el alcance en palabras que un vecino pueda repetirte de vuelta"
    ],
    [
      "Escribe a un sitio aliado y pregunta por una sala con puerta de verdad para consultas",
      "Párate en la sala de espera mientras alguien habla adentro; si lo oyes, sigue buscando",
      "Haz una lista de documentos por tipo de caso: contrato, avisos, recibos, identificación",
      "Organiza la admisión para que cada sesión empiece con los papeles ya en orden"
    ],
    [
      "Dibuja en papel la hoja de citas: nombres y horarios, nada más",
      "Decide quién agenda las citas y dónde vive esa única lista",
      "Deja el fondo del caso fuera de toda hoja compartida; los detalles van en la sala",
      "Haz recordatorios que digan hora y lugar, nunca el asunto legal"
    ],
    [
      "Pregunta por mensaje a una organización aliada qué dudas de derechos surgen más",
      "Redacta una guía de una página sobre el tema principal, en lenguaje llano",
      "Haz que un abogado revise cada folleto y ponle fecha a cada uno",
      "Aparta una sala y consigue quien dé el primer taller",
      "Dilo en voz alta y por escrito: es información general, no asesoría legal"
    ],
    [
      "Manda a tus abogados dos fechas posibles de clínica y pregunta cuál les funciona",
      "Fija la fecha recurrente y súbela al calendario comunitario",
      "Reserva al intérprete antes de anunciar en ese idioma; nunca el hijo de un cliente",
      "Difunde con volantes por organizaciones aliadas, no con publicaciones abiertas",
      "Confirma a cada abogado la semana previa; una clínica sin abogado rompe confianza"
    ],
    [
      "Crea una lista maestra de clientes que solo la coordinación pueda abrir",
      "Escribe la regla: toda cita nueva se coteja primero contra esa lista",
      "Haz el cotejo de conflictos al agendar, no cuando la persona se sienta",
      "Redacta un compromiso de confidencialidad de dos líneas para que todos firmen",
      "Repasa ambas reglas con todo el equipo antes de abrir la primera clínica"
    ]
  ],
  "resource-hub-dispatch": [
    [
      "Anota el único número o enlace de formulario que será la puerta de entrada",
      "Prepara teléfono, formulario y atención en persona con las mismas preguntas breves",
      "Asigna una persona y un horario de revisión a cada canal antes de publicarlo",
      "Manda una solicitud de prueba por cada canal y mide cuánto tarda en verse"
    ],
    [
      "Crea una hoja con columnas: nombre, habilidades, disponibilidad, contacto y límites",
      "Pregunta a cinco voluntarios su disponibilidad y cómo prefieren que les contacten",
      "Agrega a cada líder de proyecto y lo que su proyecto puede ofrecer de verdad",
      "Agenda una reconfirmación trimestral: una lista de síes viejos es casi ficción"
    ],
    [
      "Sigue en papel una solicitud reciente: quién la vio, quién actuó, quién la cerró",
      "Escribe las reglas de derivación: qué necesidad va a qué proyecto o voluntario",
      "Da a cada solicitud una persona dueña con nombre que la lleve hasta el cierre",
      "Fija una meta de respuesta, con un \"no podemos con esto\" el mismo día como mínimo",
      "Registra el estado de cada solicitud donde todo el equipo pueda verlo"
    ],
    [
      "Empieza la lista con los proyectos propios: esos te los sabes de memoria",
      "Llama a cada servicio externo como si fueras usuario y anota el horario real",
      "Registra los requisitos: a quién aceptan y qué piden en la puerta",
      "Fecha cada entrada y aparta un rato al mes para reverificar las más viejas"
    ],
    [
      "Escríbeles a tres personas organizadas y proponles un turno de despacho a la semana",
      "Escribe la guía del turno para que alguien nuevo lo cubra solo con la hoja",
      "Acompaña a cada persona nueva en su primer turno y luego entrégale el mando",
      "Arma la rotación para que nadie cubra más de dos turnos seguidos"
    ],
    [
      "Lee el formulario de admisión y tacha cada campo sin el que podrías trabajar",
      "Escribe la regla de borrado: al cerrar, guarda el conteo y descarta los detalles",
      "Enumera quién puede ver solicitudes abiertas y cierra el acceso a los demás",
      "Agrega un paso de seguimiento: confirma que la necesidad se cubrió antes de cerrar"
    ],
    [
      "Agrega ahora mismo una etiqueta o columna de \"sin cubrir\" a tu registro",
      "Elige categorías fijas para que los registros sumen en vez de dispersarse",
      "Anota cada falla en el momento en que ocurre, no de memoria a fin de mes",
      "Suma las fallas cada mes y lleva la brecha mayor a la próxima reunión de planeación"
    ]
  ],
  "harm-reduction-supplies": [
    [
      "Busca la organización de reducción de daños o capacitación de naloxona más cercana",
      "Escríbeles o llámalos: presenta al equipo y pregunta cuándo es la próxima capacitación",
      "Aparta lugar para cada persona que va a distribuir, sin excepciones",
      "Pregunta si tu equipo puede distribuir bajo su paraguas legal y orden permanente"
    ],
    [
      "Escríbele a la organización aliada o a una clínica legal: ¿qué es legal portar aquí?",
      "Pregunta en específico por tiras reactivas y jeringas, no solo por la naloxona",
      "Anota la ley concreta o el nombre de la fuente, con la fecha en que lo verificaste",
      "Conviértelo en una tarjeta de una página que cada voluntario lleve consigo"
    ],
    [
      "Busca el programa estatal de distribución de naloxona o la orden permanente de farmacia",
      "Haz el pedido, más lo que permita tu lista legal: tiras, curación de heridas, higiene",
      "Revisa las fechas de caducidad el día que llegue la caja y anótalas donde las veas",
      "Guarda todo lejos del calor y del frío: nada de maleteros ni cobertizos"
    ],
    [
      "Pídele a la organización aliada un instructivo de muestra para copiar",
      "Redacta el tuyo: detectar sobredosis, dar naloxona, llamar a emergencias, nunca a solas",
      "Haz que lo traduzcan a los idiomas que de verdad se hablan en tu zona",
      "Llama a cada número del instructivo antes de imprimir cientos de copias",
      "Arma una línea de ensamblaje, una persona por paso: bolsa, instructivo, insumos, sello"
    ],
    [
      "Pídele a un bar o tiendita que ya conozcas que acepte una caja sin preguntas",
      "Recorre la ruta con la organización aliada y deja que te presenten donde los conocen",
      "Fija días y horarios para los recorridos y mantenlos idénticos cada semana",
      "Dale a cada caja anfitriona un contacto con nombre que la reponga"
    ],
    [
      "Empieza una hoja de conteo: insumo, cantidad, fecha — cuenta insumos, nunca personas",
      "Registra cada fecha de caducidad de la naloxona con recordatorio un mes antes",
      "Recorre los puntos fijos cada mes y reabastece antes de que las cajas queden vacías",
      "Agenda un repaso cada vez que se sumen personas voluntarias nuevas"
    ]
  ],
  "court-support": [
    [
      "Busca el número de la defensoría pública y el grupo local de observación de cortes",
      "Manda un correo corto ofreciendo manos extra y preguntando cómo prefieren el contacto",
      "Pregunta a cada grupo qué ayudaría de verdad — y escucha, no vendas tu plan",
      "Visita el juzgado una vez con alguien de observación de cortes para ver cómo trabajan",
      "Anota nombre, rol y canal preferido de cada contacto en una sola lista"
    ],
    [
      "Abre una nota y escribe la regla principal: nunca damos asesoría legal",
      "Agrega el guion exacto: \"no puedo asesorar sobre eso, pregúntele a su abogado\"",
      "Lista la conducta en sala: llegar temprano, ropa sencilla, celulares apagados, sin gestos",
      "Suma la regla del pasillo: nada del caso donde un fiscal pueda oír",
      "Envía el borrador a tu contacto en la defensoría para una revisión rápida"
    ],
    [
      "Pregunta en el chat del grupo qué número de teléfono recibirá los pedidos de apoyo",
      "Arma un calendario compartido con fecha, sala y lo que cada persona necesita",
      "Guarda el enlace del registro del tribunal y practica buscar una causa",
      "Pon un recordatorio fijo: verificar cada fecha en el registro la tarde anterior",
      "Pregúntale a la persona, no al papeleo, si necesita transporte o quién cuide a sus hijos"
    ],
    [
      "Manda a tus voluntarios dos opciones de mañana tranquila para recorrer el juzgado",
      "Explícales seguridad: la fila de 30 minutos, navajas prohibidas, reglas del teléfono",
      "Enséñales la sala: dónde sentarse y cómo esperar tres horas con calma",
      "Ensayen en parejas el guion de no dar consejos hasta que salga solo",
      "Empareja a cada voluntario nuevo con alguien con experiencia para su primera audiencia"
    ],
    [
      "Escribe al grupo: ¿quién puede manejar entre semana y quién puede cuidar niños?",
      "Arma una lista con las mañanas de cada conductor y la disponibilidad de cada pareja",
      "Asigna conductor principal y de respaldo a cada audiencia — nunca uno solo",
      "Confirma al conductor principal y a la pareja de cuidado la noche anterior, siempre",
      "Averigua qué salas permiten menores para que el plan de cuidado cuadre"
    ],
    [
      "Responde al abogado pidiendo por escrito contenido, destinatario y plazo",
      "Haz la lista de vecinos que conocen bien a la persona y escríbele a cada uno",
      "Mándales la pauta del abogado y una carta de ejemplo a quienes van a escribir",
      "Reúne cada carta y retenla para revisión del abogado antes de enviar nada",
      "Anota quién prometió carta y mándales un recordatorio tres días antes del plazo"
    ]
  ],
  "cooling-warming-center": [
    [
      "Anota tres lugares con buen aire y calefacción: biblioteca, iglesia, salón sindical",
      "Llama hoy a uno y pide veinte minutos con quien tenga las llaves",
      "Recorre la sala revisando baños, entrada sin escalones y enchufes",
      "Haz ya las preguntas incómodas: horarios, llaves, seguro, quedarse de noche",
      "Consigue el sí por escrito y prueba el aire o la calefacción un día realmente extremo"
    ],
    [
      "Busca los umbrales de índice de calor y sensación térmica del servicio meteorológico",
      "Propón cifras exactas al grupo — un número del pronóstico, no \"cuando esté feo\"",
      "Nombra a una persona con autoridad para activar el centro, más un respaldo",
      "Arma el chat grupal o la cadena telefónica y haz una alerta de prueba hoy",
      "Escribe el umbral y el nombre de quien decide donde cada anfitrión lo vea"
    ],
    [
      "Haz la lista: agua, electrolitos, cobijas, catres, ventiladores, cargadores, botiquín",
      "Publica una petición a miembros por lo donable y cotiza el resto",
      "Haz una sola vuelta de compras y lleva todo al sitio",
      "Arma cajas etiquetadas para que un anfitrión nuevo encuentre todo en segundos",
      "Pega una lista de contenido por dentro de la puerta del armario"
    ],
    [
      "Escribe a miembros: ¿quién podría cubrir un turno de cuatro horas en clima extremo?",
      "Agenda una capacitación de dos horas en el sitio e invita a cada sí",
      "Practica las señales de golpe de calor e hipotermia hasta saberlas de memoria",
      "Dilo claro: llamen temprano a emergencias, y nadie será cuestionado por llamar",
      "Ensayen en parejas una bienvenida sin papeleo y un guion de desescalada"
    ],
    [
      "Dibuja la cuadrícula de turnos de un día de activación: apertura, bloques, cierre",
      "Llena cada turno con dos nombres — nunca una persona anfitriona sola",
      "Pide a tres personas más quedar de reserva por si el clima tumba a algún anfitrión",
      "Comparte la rotación en el chat y confirma que cada quien vio su turno",
      "Haz un simulacro de activación para ver qué tan rápido se llena la cuadrícula"
    ],
    [
      "Lista a dónde ya va la gente en riesgo: clínicas, edificios de adultos mayores, tienditas",
      "Redacta un volante en lenguaje simple con los umbrales, la dirección y los horarios",
      "Pide a miembros traducirlo a los otros idiomas del barrio",
      "Da paquetes a repartidores de comida, encargados de edificio y trabajadores de calle",
      "Termina el recorrido semanas antes de la temporada — no en la primera ola"
    ],
    [
      "Escríbele a tu pareja de turno para confirmar y ver quién lleva las llaves",
      "Llega una hora antes, prende el aire o la calefacción y deja agua en la puerta",
      "Lleva un conteo suelto de visitas — un número, no identificaciones",
      "Despierta con suavidad a quien duerma para ver cómo está; una siesta puede engañar",
      "Al cerrar, limpia, reabastece las cajas y anota qué se acabó"
    ]
  ],
  "community-oral-history": [
    [
      "Abre una nota en blanco y lista qué grabarás y dónde podría terminar",
      "Redacta una página: qué se graba, opciones de compartir, derecho a pausar o retirar",
      "Divide el compartir en casillas separadas: con nombre o sin él, solo familia, público",
      "Agrega tu teléfono para que la persona pueda cambiar de opinión después",
      "Pídele a alguien que lo traduzca a los idiomas que hablan tus narradores"
    ],
    [
      "Abre la app de notas de voz de tu teléfono y revisa el espacio libre",
      "Graba una prueba de 30 segundos en la sala que usarás y busca zumbidos o eco",
      "Escribe ocho preguntas abiertas como \"cuéntame cómo era la calle cuando llegaste\"",
      "Ensaya diez minutos con alguien de confianza y quita las preguntas que caigan flojas"
    ],
    [
      "Escríbele a una persona mayor que confíe en ti y pídele una hora en su cocina",
      "Carga tu teléfono, libera espacio y mete el formulario y las preguntas en una bolsa",
      "Repasen juntos el formulario de consentimiento antes de apretar grabar",
      "Si la historia se pone dura, pausa y vuelve a preguntar si esa parte se queda",
      "Antes de irte, agenda la próxima sesión o pregunta a quién más podrías entrevistar"
    ],
    [
      "Renombra ya la grabación de esta semana: fecha, nombre y acuerdo de compartir",
      "Cópiala a un segundo lugar realmente distinto — nube y teléfono, no una sola laptop",
      "Entrega su copia a quien narró, en una memoria USB o por la app que use",
      "Relee el consentimiento antes de publicar algo y respeta cualquier cambio"
    ]
  ],
  "community-solar-coop": [
    [
      "Escribe a cinco vecinos que se quejan del recibo de luz y pídeles diez minutos a cada uno",
      "Arma un formulario que pida un nivel real de compromiso, no solo un correo",
      "Organiza una plática informativa casera y cuenta quién llega de verdad",
      "Clasifica las respuestas en comprometidos, curiosos y no — planea solo con los comprometidos"
    ],
    [
      "Busca el nombre de tu estado más 'reglas de energía solar comunitaria' y guarda la página oficial",
      "Llama a una cooperativa solar cercana y pregunta qué modelo permitieron sus reglas",
      "Haz una hoja resumen: medición neta, suscripciones, propiedad cooperativa — permitido aquí o no",
      "Marca cada regla que no entiendas para que un abogado la explique después"
    ],
    [
      "Anota tres techos grandes y soleados cerca: escuelas, iglesias, bodegas",
      "Averigua si un programa de energía solar comunitaria ya existente acepta a tu grupo como suscriptores",
      "Recorre tu sitio favorito con la persona dueña y anota la edad del techo y el espacio libre",
      "Pon construir contra unirse en una página y llévala a los miembros"
    ],
    [
      "Pide a la asociación de cooperativas de tu estado abogados que conozcan cooperativas de energía",
      "Agenda una consulta con un abogado que ya haya formado una cooperativa de energía",
      "Dibuja el flujo del dinero en una página: quién aporta, quién es dueño, quién recibe créditos",
      "Compara estructuras — cooperativa, sociedad, suscripción — con los profesionales",
      "No firmes nada hasta que el abogado y el contador hayan leído cada contrato"
    ],
    [
      "Pregunta a dos dueños de paneles cercanos qué instalador usaron y si lo volverían a contratar",
      "Pide al menos tres cotizaciones por escrito con las mismas especificaciones",
      "Pregunta a cada postor quién hace el mantenimiento al quinto año y qué cubre la garantía",
      "Deja los términos de garantía y mantenimiento por escrito en el contrato"
    ],
    [
      "Abre una hoja de cálculo con una fila por miembro: aportó, créditos recibidos, fecha",
      "Escribe las reglas de créditos en palabras sencillas que se lean en un minuto",
      "Elige una sola herramienta para pagos y estados de cuenta y quédate con ella",
      "Revisa con un miembro su primer estado de cuenta y corrige lo que lo confundió"
    ],
    [
      "Pide a tres miembros llevar un recibo de luz reciente a la próxima reunión",
      "Revisen juntos un recibo, línea por línea",
      "Comparte cinco arreglos baratos: focos LED, multicontactos, termostato, sellos de puertas",
      "Revisen los recibos en un mes para que los miembros vean la diferencia en papel"
    ]
  ],
  "worker-coop-incubator": [
    [
      "Agenda esta semana tres charlas de 20 minutos con miembros interesados",
      "Pregunta a cada quien: qué sabes hacer, qué quieres construir, cuántas horas tienes",
      "Registra cada respuesta en una hoja compartida y resalta las habilidades repetidas",
      "Encierra cualquier grupo de tres o más habilidades que coincidan — ahí hay un posible negocio"
    ],
    [
      "Pregunta a los miembros qué habilidades quieren más: currículums, oficios, digital, finanzas",
      "Consulta al programa de intercambio de saberes quién puede enseñar las dos más pedidas",
      "Consigue una persona experta de fuera para el tema que nadie local domina",
      "Programa la primera sesión y que no pase de dos horas",
      "Recoge comentarios a la salida y ajusta la siguiente sesión"
    ],
    [
      "Invita a alguien de una cooperativa de trabajo real a platicar con el grupo",
      "Haz una comparación de una página: cooperativa contra negocio tradicional — ganancias, decisiones, propiedad",
      "Muestra con números cómo vota una cooperativa real y cómo reparte ganancias",
      "Deja tiempo para las preguntas difíciles: sueldos, conflictos, salidas"
    ],
    [
      "Busca al desarrollador de cooperativas de tu región y agenda una llamada de presentación",
      "Ayuda al grupo a redactar un plan de negocio de una página antes de cualquier trámite",
      "Consigue nombres de un abogado y un contador que ya hayan formado cooperativas",
      "Revisen las opciones de estructura con los profesionales presentes",
      "No incorporen hasta que el plan y los asesores estén alineados"
    ],
    [
      "Abre un documento compartido con cada microcrédito, beca y fondo cooperativo que conozcas",
      "Pregunta al desarrollador de cooperativas qué financiadores te faltan",
      "Anota la fecha límite, el monto y los requisitos de cada fondo",
      "Siéntate con un emprendimiento y terminen juntos su primera solicitud"
    ],
    [
      "Anota tres cooperativistas o dueños de negocio con experiencia a quienes podrías pedírselo",
      "Invita a cada uno a acompañar un emprendimiento con una reunión mensual",
      "Empareja mentores y emprendimientos por oficio, no solo por disponibilidad",
      "Agenda la primera reunión antes de que el emprendimiento arranque"
    ],
    [
      "Invita a todos los emprendimientos a una comida o encuentro nocturno compartido",
      "Pide a cada emprendimiento compartir un problema y un logro",
      "Crea un chat grupal para referencias y preguntas rápidas",
      "Listen qué podrían comprarse entre sí los emprendimientos y fíjenlo en el chat"
    ]
  ],
  "elder-meal-delivery": [
    [
      "Llama a un centro de adultos mayores o enfermera parroquial y pregunta a quién le servirían comida y visitas",
      "Lista las clínicas, grupos de fe y farmacias que ven a personas mayores aisladas",
      "Redacta un texto corto y voluntario: una comida y una visita, gratis, sin condiciones",
      "Llama o visita a cada persona mayor referida y pregúntale — nunca supongas",
      "Empieza una lista de síes con dirección y mejor horario de contacto"
    ],
    [
      "Escribe a cinco personas confiables que dejarías entrar a casa de tu propia abuela",
      "Deja la regla por escrito: referencias más verificación básica, sin excepciones",
      "Aplícala a cada voluntario antes de su primera entrega",
      "Asigna a cada persona mayor una visita fija en lugar de rotar gente"
    ],
    [
      "Pregunta al equipo de comidas comunitarias qué puede producir sin falta cada semana",
      "Consigue dos cocineros de respaldo o un restaurante dispuesto a donar porciones",
      "Acuerden número de porciones, hora de recogida y empaques fáciles de recalentar",
      "Etiqueta cada envase con contenido y fecha antes de que salga de la cocina"
    ],
    [
      "Ubica en un mapa las direcciones de tu lista y agrúpalas en rutas cortas",
      "Fija días y horarios aproximados, los mismos cada semana",
      "Suma a cada parada diez minutos sin prisa para conversar",
      "Haz un recorrido de prueba de cada ruta antes de la primera entrega real"
    ],
    [
      "Crea un formulario sencillo: dieta, alergias, contacto de emergencia",
      "Llénalo con cada persona mayor o su familia, en persona o por teléfono",
      "Guarda los formularios bajo llave o con contraseña",
      "Da a quien maneja solo lo necesario en la puerta: alergias y un número de contacto"
    ],
    [
      "Escribe la primera línea: qué hace un voluntario ante una puerta sin respuesta",
      "Lista a quién se llama y en qué orden: teléfono de la persona, familia, emergencias",
      "Agrega cómo anotar lo ocurrido después de cualquier incidente",
      "Imprime el protocolo en una tarjeta de bolsillo para cada voluntario",
      "Repásalo en voz alta con el equipo antes de que haga falta"
    ],
    [
      "Escribe a cada voluntario tras su primera semana: cómo te fue, qué se sintió raro",
      "Haz a cada persona mayor una pregunta abierta: qué mejoraría esto",
      "Rota o pausa rutas de quien se oiga agotado",
      "Comparte un pequeño logro con todo el equipo cada mes"
    ]
  ],
  "disaster-relief-hub": [
    [
      "Anota tres edificios con zona de carga: escuelas, iglesias, locales sindicales",
      "Haz a cada dueño la pregunta directa: ¿podríamos entrar a las 6 a.m. tras una inundación?",
      "Consigue un sí por escrito y un acuerdo de llaves para tu favorito y un respaldo",
      "Recorre ambos sitios y anota luz, agua y dónde estacionarían los camiones"
    ],
    [
      "Lista de dónde saldrían agua, comida e higiene: proveedor, organización aliada o colecta",
      "Llama a un mayorista y pregunta por pedidos grandes de emergencia con poco aviso",
      "Acuerda con las organizaciones aliadas quién consigue qué",
      "Define cómo sabrán las necesidades reales tras un evento: una cadena de llamadas o un formulario"
    ],
    [
      "Elige ya tus categorías de clasificación: agua, comida, higiene, limpieza, ropa",
      "Dibuja el flujo en papel: llega el camión, descargar, clasificar, acomodar, contar",
      "Haz una hoja de conteo de una página para entradas y salidas",
      "Imprime letreros por categoría y guárdalos con cinta en el sitio"
    ],
    [
      "Escribe la regla al inicio de la página: sin pedir identificación ni pruebas de necesidad",
      "Deja por escrito a quién se atiende primero cuando escaseen los insumos",
      "Traza rutas de entrega para quienes no pueden llegar al centro",
      "Dibuja la fila de entrega en un solo sentido: entra por una puerta y sale por otra"
    ],
    [
      "Escribe a diez posibles voluntarios y pregunta: ¿podrías llegar en cuestión de horas?",
      "Redacta tarjetas de rol: recepción, clasificación, distribución, entrega, seguridad",
      "Organiza un día de práctica de dos horas con cajas reales",
      "Anota quién hizo bien qué y asigna roles por adelantado para el evento real"
    ],
    [
      "Envía un correo a la oficina de gestión de emergencias local y presenta el centro",
      "Lista los demás grupos de ayuda cercanos y qué cubre cada uno",
      "Reúnanse una vez y acuerden quién cubre cada hueco",
      "Intercambien contactos fuera de horario y guarden una copia en papel"
    ],
    [
      "Imprime la lista de voluntarios y contactos clave — asume que no habrá internet",
      "Elige un plan sin conexión: radios, un tablero de mensajes o mensajeros a pie",
      "Escribe las reglas duras de seguridad: nadie entra a estructuras inseguras, nunca",
      "Conéctate al árbol de contactos de la red de preparación y pruébalo una vez"
    ]
  ],
  "recovery-peer-support": [
    [
      "Anota a una o dos personas vecinas con experiencia sólida y vivida de recuperación",
      "Pregunta a cada una en privado si facilitaría — sin presión y sin anuncios",
      "Busca la capacitación reconocida de apoyo entre pares más cercana y su próxima fecha",
      "Inscribe a cada futuro facilitador antes de la primera reunión",
      "Di la frase en voz alta desde el primer día: pares, no profesionales de salud"
    ],
    [
      "Abre un documento con dos columnas: lo que hacemos y lo que nunca hacemos",
      "Pon los consejos de desintoxicación y medicamentos al inicio de la columna del nunca",
      "Haz que cada facilitador lo lea y lo firme",
      "Muestra el alcance a un profesional local de tratamiento para una revisión rápida"
    ],
    [
      "Lista los programas de tratamiento, clínicas y líneas de crisis locales",
      "Visita o llama a cada uno y presenta la red en persona",
      "Pregunta a cada quien: ¿a quién exactamente llamamos y podemos usar su nombre?",
      "Escribe un plan de respuesta a sobredosis y pégalo donde se reúnen",
      "Imprime la lista de contactos y revísala cada mes"
    ],
    [
      "Lista salas con entrada discreta: biblioteca, salón comunitario, espacio de fe",
      "Visita tus dos favoritas y revisa la privacidad y el ruido",
      "Confirma que la sala esté libre de sustancias y disponible tus noches de reunión",
      "Aparta un horario fijo para que la sala sea siempre la misma"
    ],
    [
      "Redacta las reglas: lo dicho aquí se queda aquí, sin imponer consejos, derecho a pasar",
      "Léelas a los facilitadores y recorta lo que suene a sermón",
      "Imprímelas en una sola tarjeta para la sala de reuniones",
      "Planea leerlas en voz alta al inicio de absolutamente cada reunión"
    ],
    [
      "Elige dos horarios de reunión: uno de noche y otro de día o fin de semana",
      "Redacta un volante en palabras llanas: gratis, abierto, sin requisitos",
      "Quita cualquier frase que insinúe vergüenza o diagnóstico",
      "Pégalo donde la gente ya va: clínicas, lavanderías, cafeterías",
      "Pide a los programas aliados entregarlo directamente en mano"
    ],
    [
      "Agenda en el calendario una charla mensual a solas con cada facilitador",
      "Arma una rotación de quién dirige para que nadie cargue todas las reuniones",
      "Pregunta a cada facilitador dónde recibe su propio apoyo",
      "Dilo antes de que alguien lo necesite: hacerse a un lado siempre está permitido"
    ]
  ],
  "community-fitness": [
    [
      "Escribe cinco preguntas rápidas sobre qué movimiento disfruta la gente y qué le resulta posible",
      "Hazlas esta semana en la lavandería, el edificio de personas mayores y la puerta de la escuela",
      "Publica las mismas preguntas en un chat vecinal",
      "Cuenta las respuestas y marca las dos actividades más pedidas"
    ],
    [
      "Apunta a tres personas cálidas y confiables que podrían guiar una caminata o estiramientos",
      "Escríbeles con una petición concreta: una sesión por semana, sin necesidad de ser expertas",
      "Para lo físicamente exigente, pregunta por certificaciones antes de aceptar",
      "Asigna a cada nueva persona líder un respaldo que cubra una semana perdida"
    ],
    [
      "Apunta parques, salones y gimnasios escolares cercanos a los que se llegue sin auto",
      "Llama o visita cada uno para preguntar costo, horarios y reservas",
      "Recorre los dos mejores revisando piso parejo, asientos, sombra y baños",
      "Anota dónde podría refugiarse la gente si el clima cambia",
      "Reserva tu primera opción por un mes de prueba"
    ],
    [
      "Escribe el plan de tu primera actividad en una página, partiendo de la versión más fácil",
      "Agrega una variante a cada ejercicio: opción con silla, recorrido más corto",
      "Quita del plan y de los volantes cualquier mención al peso o la apariencia",
      "Muestra el plan a una persona mayor y a una principiante y ajústalo"
    ],
    [
      "Compra o consigue prestado un botiquín y revisa qué trae",
      "Incluye un calentamiento de cinco minutos al inicio de cada sesión",
      "Agrega pausas de agua al horario y un recordatorio de llevar botella",
      "Explica a quienes lideran cómo notar el sobreesfuerzo y normalizar el descanso",
      "Redacta una línea sugiriendo a quienes recién empiezan consultar antes al médico"
    ],
    [
      "Elige un día y hora semanales que puedas sostener tres meses",
      "Haz un volante sencillo que diga: todas las edades, tallas y capacidades son bienvenidas",
      "Pégalo en la lavandería, la biblioteca, el edificio de mayores y las clínicas",
      "Compártelo en los chats y pide a cada integrante reenviarlo una vez",
      "Pon un recordatorio para avisar cualquier cancelación con tiempo, nunca en silencio"
    ],
    [
      "Empieza cada sesión con una ronda rápida de nombres",
      "Pide a una persona habitual recibir a quienes llegan por primera vez",
      "Reserva cinco minutos de plática dentro del horario",
      "Celebra la constancia en asistir, nunca el peso ni el rendimiento"
    ]
  ],
  "urban-orchard": [
    [
      "Apunta sitios posibles: fideicomisos de tierra, terrenos de parques, congregaciones con suelo libre",
      "Escribe o llama a la persona dueña más prometedora y pide una reunión",
      "Pide de frente acceso por diez años o más y confirma que haya agua en el sitio",
      "Consigue los términos en un acuerdo escrito antes de comprar un solo árbol"
    ],
    [
      "Busca tu zona de clima y apunta los frutales que prosperan en ella",
      "Pregunta al vecindario qué frutas cosecharía y comería de verdad",
      "Dibuja el sitio por capas: árboles altos, arbustos y cubresuelos",
      "Verifica los polinizadores compañeros de cada variedad de tu lista",
      "Deja espacio para el tamaño adulto del árbol, no el de la plantita"
    ],
    [
      "Ubica los viveros más cercanos y anota su temporada de raíz desnuda",
      "Cotiza tu lista de plantas a raíz desnuda contra maceta",
      "Pregunta por descuentos para organizaciones, subvenciones y programas de donación",
      "Haz el pedido temprano: las buenas variedades se agotan"
    ],
    [
      "Marca cada punto de plantación del diseño con banderines o estacas",
      "Agenda una jornada para desyerbar y tender el mantillo",
      "Prueba la fuente de agua y tiende mangueras o barriles",
      "Acomoda composta, herramientas y tutores junto a cada punto"
    ],
    [
      "Elige una fecha en temporada de plantación e invita a todo el mundo",
      "Escribe una guía de una página: profundidad correcta, cajete de riego, anillo de mantillo",
      "Asigna a alguien con experiencia para recorrer y revisar cada árbol",
      "Consigue agua, botanas y música: que sea una fiesta",
      "Cierra el día dando un riego profundo a cada árbol"
    ],
    [
      "Apunta las labores de todo el año: riego, poda, mantillo y revisión de plagas",
      "Pide a tres personas un compromiso anual con nombre, no un interés vago",
      "Arma una rotación de riego de verano para los árboles jóvenes",
      "Agenda desde ya una fecha de poda en primavera"
    ],
    [
      "Redacta normas simples de cosecha: quién corta, cuándo y cuánto",
      "Lleva el borrador a una reunión comunitaria antes de la primera cosecha",
      "Consigue destino para el excedente: refrigeradores, despensas, comidas compartidas",
      "Publica las normas acordadas en un letrero en el huerto"
    ]
  ],
  "new-parent-support": [
    [
      "Apunta a la gente que conoces que cocina, maneja o ya crio a un bebé",
      "Escribe a cada quien con un rol concreto: comidas, mandados o apoyo entre pares",
      "Pide a dos o tres madres o padres con experiencia ser tus primeros apoyos de pares",
      "Anota en un solo lugar la disponibilidad y los límites de cada voluntario"
    ],
    [
      "Elige una herramienta gratuita de tren de comidas o un calendario compartido y pruébala",
      "Haz un formulario corto de dietas y alergias que se pregunte una sola vez",
      "Escribe las reglas de entrega: en la puerta por defecto, etiquetado y fácil de recalentar",
      "Prueba todo el circuito con una familia voluntaria"
    ],
    [
      "Redacta una lista de ofertas: mandados, lavandería, trastes, cuidado de hermanos",
      "Empareja cada oferta con quienes se apuntaron a ella",
      "Fija la regla: preguntar en cada visita qué se necesita y seguir la lista de la familia",
      "Agenda las primeras dos semanas de apoyo para tu primera familia"
    ],
    [
      "Abre una hoja de cálculo sencilla: nombre, servicio, teléfono, horario",
      "Agrega apoyo de lactancia, salud mental posparto y clínicas pediátricas",
      "Suma fuentes locales de artículos de bebé, incluido el banco de pañales",
      "Llama una vez a cada número para confirmar que funciona",
      "Agenda una revisión del directorio cada tres meses"
    ],
    [
      "Elige un espacio pequeño y cómodo y un horario constante",
      "Pide a una madre o padre con experiencia sostener el primer círculo",
      "Capacita a los pares en las señales de depresión y ansiedad posparto",
      "Acuerden la regla: animar a buscar ayuda profesional, nunca diagnosticar ni esperar",
      "Invita en persona a tres o cuatro familias para la primera sesión"
    ],
    [
      "Escribe tus pasos de verificación: referencias como mínimo para quien entre a los hogares",
      "Redacta los límites: la familia pone las condiciones y las visitas son cortas salvo invitación",
      "Agrega la regla: nunca visitas sin avisar",
      "Repasa las prácticas con cada voluntario antes de su primera visita"
    ],
    [
      "Apunta los proyectos hermanos: banco de pañales, colectivo de cuidado, comité de bienvenida",
      "Reúnete con alguien de cada uno para acordar cómo fluyen las referencias",
      "Crea una sola ficha de ingreso para que cada familia cuente su historia una vez",
      "Da a cada familia un único punto de contacto"
    ]
  ],
  "foster-kinship-support": [
    [
      "Llama a la agencia de crianza temporal o al navegador de parentesco y pide una reunión",
      "Pide a escuelas y grupos de fe pasar tu oferta a las familias cuidadoras",
      "Redacta el primer mensaje como una oferta, nunca como un filtro",
      "Pregunta a las primeras familias qué necesitaron en la primera semana y el primer año"
    ],
    [
      "Haz la lista por edades: ropa, camas, sillas de auto y básicos de recién nacido a adolescente",
      "Organiza una colecta puntual nombrando las tallas y artículos que faltan",
      "Revisa cada silla de auto y cuna contra fechas de caducidad y listas de retiro",
      "Clasifica y etiqueta todo por edad y talla conforme llegue",
      "Consigue un espacio seco al que alguien pueda llegar con poco aviso"
    ],
    [
      "Redacta la lista de empaque: ropa para unos días, artículos de aseo y un objeto de consuelo",
      "Arma las primeras mochilas separadas por edad y talla",
      "Recluta a dos personas de guardia que puedan entregar en cuestión de horas",
      "Define un solo teléfono o correo para las solicitudes de colocación",
      "Haz un simulacro cronometrado de la solicitud a la puerta"
    ],
    [
      "Pregunta a la agencia quién puede dar cuidado de relevo y bajo qué reglas",
      "Recluta y verifica al voluntariado de relevo según esas reglas exactas",
      "Crea una hoja de reservas que las familias usen sin tener que rogar",
      "Empieza con bloques cortos y regulares: una tarde predecible vale más que un fin de semana raro"
    ],
    [
      "Elige un horario fijo y un espacio privado y cómodo",
      "Pide a una cuidadora o cuidador con experiencia co-facilitar el grupo",
      "Invita a través de la agencia y las escuelas; nunca compartas listas de familias",
      "Organiza cuidado infantil durante las reuniones para que de verdad puedan asistir",
      "Abre cada reunión recordando la confidencialidad"
    ],
    [
      "Abre una hoja de cálculo de servicios, beneficios y apoyos informados en trauma",
      "Agrega los beneficios de parentesco que nadie les cuenta a las familias",
      "Llama a cada entrada para confirmar que sigue vigente antes de listarla",
      "Ofrece acompañar a las familias mientras llenan las solicitudes"
    ],
    [
      "Pide a la agencia por escrito las reglas de verificación y de reporte obligatorio",
      "Escribe tu política de una página: verificación, deberes de reporte y confidencialidad",
      "Fija la regla de privacidad: sin fotos, sin historias, sin detalles sin permiso",
      "Repasa la política con cada voluntario antes de cualquier contacto con familias",
      "Agenda en el calendario una revisión anual de la política"
    ]
  ],
  "weather-survival-outreach": [
    [
      "Escribe dos listas de empaque: una para el frío y otra para el calor",
      "Imprime tarjetas con albergues y números de crisis para cada kit",
      "Organiza una sesión de empaque y arma los primeros veinte kits",
      "Guárdalos en un lugar seco al que el voluntariado llegue rápido"
    ],
    [
      "Cotiza cobijas, calcetines, agua y electrolitos al mayoreo con dos o tres proveedores",
      "Pide donaciones a tiendas y congregaciones antes de que empiece la temporada",
      "Haz una colecta enfocada nombrando los artículos exactos",
      "Aparta existencias suficientes para resurtir a media temporada"
    ],
    [
      "Contacta a quienes ya hacen recorridos de calle y pide acompañarlos",
      "Súmate a una o dos rondas antes de mapear por tu cuenta",
      "Anota las ubicaciones sin rigidez: la gente se mueve, más con mal clima",
      "Acostúmbrate a actualizar el mapa después de cada ronda"
    ],
    [
      "Redacta el temario: trato respetuoso, trabajo en parejas y emergencias",
      "Pide a alguien con experiencia en calle co-dirigir la primera capacitación",
      "Agenda la sesión antes de que empiece la temporada",
      "Lleva la lista de quiénes están capacitados: nadie reparte sin estarlo"
    ],
    [
      "Define los números del pronóstico que activan una ronda y déjalos por escrito",
      "Traza rutas que lleguen primero a la gente más expuesta",
      "Asigna parejas a cada ruta, con respaldo para ambas",
      "Decide quién vigila el pronóstico y manda el aviso de salida"
    ],
    [
      "Apunta centros de calentamiento y enfriamiento, camas de albergue y el centro de recursos",
      "Llama a cada uno para verificar horarios y reglas antes de imprimir nada",
      "Imprime tarjetas pequeñas para repartir en las rondas",
      "Fija una verificación semanal: mandar a una puerta cerrada quema la confianza"
    ],
    [
      "Imprime una tarjeta de bolsillo con las señales de hipotermia y golpe de calor",
      "Ensaya la regla en la capacitación: llamar a emergencias de inmediato, nunca esperar a ver",
      "Practiquen qué hacer mientras llega la ayuda: sombra y agua, o cobijas y abrigo del viento",
      "Que cada voluntario guarde en su teléfono los números locales de emergencia y crisis"
    ]
  ]
};
